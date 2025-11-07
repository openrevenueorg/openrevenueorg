import type { Prisma, TrustLevel } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type StartupTier = 'BRONZE' | 'SILVER' | 'GOLD';

type StartupWithTierData = Prisma.StartupGetPayload<{
  include: {
    connections: {
      where: { isActive: true };
    };
    revenueSnapshots: {
      orderBy: { date: 'desc' };
    };
    privacySettings: true;
    milestones: {
      where: { isPublic: true };
    };
    stories: {
      where: { isPublished: true };
    };
    category: true;
  };
}>;

export interface TierRequirement {
  key: string;
  label: string;
  description: string;
  met: boolean;
  required: boolean;
}

export interface TierValidation {
  tier: StartupTier;
  canPublish: boolean;
  canUpgrade: boolean;
  nextTier: StartupTier | null;
  requirements: TierRequirement[];
  score: number; // 0-100
}

/**
 * Progressive tier system:
 *
 * BRONZE (Basic) - Can publish with warnings
 * - Has name, description
 * - Has at least 1 connection
 * - Has some revenue data
 *
 * SILVER (Enhanced) - Better visibility
 * - All Bronze requirements
 * - Has logo
 * - Has category
 * - Has 3+ months of revenue data
 * - Privacy settings configured
 *
 * GOLD (Premium) - Maximum visibility and features
 * - All Silver requirements
 * - Has verified connection (platform verified)
 * - Has 6+ months of revenue data
 * - Has at least 1 published milestone
 * - Has at least 1 published story
 * - Website URL provided
 */

export async function validateStartupTier(startupId: string): Promise<TierValidation> {
  const startup = (await prisma.startup.findUnique({
    where: { id: startupId },
    include: {
      connections: { where: { isActive: true } },
      revenueSnapshots: { orderBy: { date: 'desc' } },
      privacySettings: true,
      milestones: { where: { isPublic: true } },
      stories: { where: { isPublished: true } },
      category: true,
    },
  })) as StartupWithTierData | null;

  if (!startup) {
    throw new Error('Startup not found');
  }

  // Calculate months of revenue data
  const revenueMonths = startup.revenueSnapshots.length;
  const hasVerifiedConnection = startup.connections.some((connection: { trustLevel: TrustLevel; }) => connection.trustLevel === 'PLATFORM_VERIFIED');

  // Bronze requirements
  const bronzeReqs: TierRequirement[] = [
    {
      key: 'hasName',
      label: 'Startup Name',
      description: 'Your startup has a name',
      met: !!startup.name,
      required: true,
    },
    {
      key: 'hasDescription',
      label: 'Description',
      description: 'Add a description for your startup',
      met: !!startup.description && startup.description.length >= 50,
      required: true,
    },
    {
      key: 'hasConnection',
      label: 'Data Connection',
      description: 'Connect at least one payment processor',
      met: startup.connections.length > 0,
      required: true,
    },
    {
      key: 'hasRevenueData',
      label: 'Revenue Data',
      description: 'Have at least 1 month of revenue data',
      met: revenueMonths >= 1,
      required: true,
    },
  ];

  // Silver requirements (includes all Bronze)
  const silverReqs: TierRequirement[] = [
    ...bronzeReqs,
    {
      key: 'hasLogo',
      label: 'Logo',
      description: 'Upload your startup logo',
      met: !!startup.logo,
      required: false,
    },
    {
      key: 'hasCategory',
      label: 'Category',
      description: 'Select a category for your startup',
      met: !!startup.categoryId,
      required: true,
    },
    {
      key: 'has3MonthsData',
      label: '3+ Months Revenue',
      description: 'Have at least 3 months of revenue data',
      met: revenueMonths >= 3,
      required: true,
    },
    {
      key: 'hasPrivacySettings',
      label: 'Privacy Settings',
      description: 'Configure your privacy settings',
      met: !!startup.privacySettings,
      required: true,
    },
  ];

  // Gold requirements (includes all Silver)
  const goldReqs: TierRequirement[] = [
    ...silverReqs,
    {
      key: 'hasVerifiedConnection',
      label: 'Verified Connection',
      description: 'Have at least one platform-verified connection',
      met: hasVerifiedConnection,
      required: true,
    },
    {
      key: 'has6MonthsData',
      label: '6+ Months Revenue',
      description: 'Have at least 6 months of revenue data',
      met: revenueMonths >= 6,
      required: true,
    },
    {
      key: 'hasMilestone',
      label: 'Published Milestone',
      description: 'Share at least one milestone',
      met: startup.milestones.length > 0,
      required: false,
    },
    {
      key: 'hasStory',
      label: 'Published Story',
      description: 'Write and publish at least one story',
      met: startup.stories.length > 0,
      required: false,
    },
    {
      key: 'hasWebsite',
      label: 'Website URL',
      description: 'Add your website URL',
      met: !!startup.website,
      required: false,
    },
  ];

  // Determine current achievable tier
  const bronzeMet = bronzeReqs.filter(r => r.required).every(r => r.met);
  const silverMet = silverReqs.filter(r => r.required).every(r => r.met);
  const goldMet = goldReqs.filter(r => r.required).every(r => r.met);

  let achievableTier: StartupTier = 'BRONZE';
  let requirements = bronzeReqs;
  let canUpgrade = false;
  let nextTier: StartupTier | null = null;

  if (goldMet) {
    achievableTier = 'GOLD';
    requirements = goldReqs;
    canUpgrade = false;
    nextTier = null;
  } else if (silverMet) {
    achievableTier = 'SILVER';
    requirements = silverReqs;
    canUpgrade = true;
    nextTier = 'GOLD';
  } else if (bronzeMet) {
    achievableTier = 'BRONZE';
    requirements = bronzeReqs;
    canUpgrade = true;
    nextTier = 'SILVER';
  }

  // Calculate score (percentage of all requirements met)
  const allReqs = goldReqs;
  const metCount = allReqs.filter(r => r.met).length;
  const score = Math.round((metCount / allReqs.length) * 100);

  return {
    tier: achievableTier,
    canPublish: bronzeMet, // Can publish at Bronze level
    canUpgrade,
    nextTier,
    requirements,
    score,
  };
}

/**
 * Check if a startup can be published
 */
export async function canPublishStartup(startupId: string): Promise<{
  canPublish: boolean;
  reason?: string;
  validation: TierValidation;
}> {
  const validation = await validateStartupTier(startupId);

  if (!validation.canPublish) {
    return {
      canPublish: false,
      reason: 'Please complete the minimum requirements (Bronze tier) before publishing',
      validation,
    };
  }

  return {
    canPublish: true,
    validation,
  };
}

/**
 * Get tier badge information
 */
export function getTierBadge(tier: StartupTier): {
  label: string;
  description: string;
  color: string;
  icon: string;
} {
  switch (tier) {
    case 'GOLD':
      return {
        label: 'Gold',
        description: 'Premium profile with all features unlocked',
        color: 'yellow',
        icon: '👑',
      };
    case 'SILVER':
      return {
        label: 'Silver',
        description: 'Enhanced profile with better visibility',
        color: 'gray',
        icon: '⭐',
      };
    case 'BRONZE':
    default:
      return {
        label: 'Bronze',
        description: 'Basic profile - complete more requirements to upgrade',
        color: 'orange',
        icon: '🥉',
      };
  }
}
