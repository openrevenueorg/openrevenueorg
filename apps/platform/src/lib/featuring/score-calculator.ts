import type { Prisma, TrustLevel } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type StartupWithFeatureData = Prisma.StartupGetPayload<{
  include: {
    connections: {
      where: { isActive: true };
    };
    revenueSnapshots: {
      orderBy: { date: 'desc' };
      take: 2;
    };
    milestones: {
      where: { isPublic: true };
    };
    stories: {
      where: { isPublished: true };
    };
    category: true;
  };
}>;

export interface FeatureScoreBreakdown {
  total: number; // 0-100
  components: {
    trustLevel: number; // 0-25 points
    revenue: number; // 0-20 points
    growth: number; // 0-20 points
    engagement: number; // 0-15 points
    completeness: number; // 0-10 points
    recency: number; // 0-10 points
  };
  eligible: boolean;
  reason?: string;
}

/**
 * Calculate feature-worthiness score for a startup
 *
 * Scoring criteria (max 100 points):
 * 1. Trust Level (25 points)
 *    - Platform verified: 25
 *    - Self-reported: 10
 *
 * 2. Revenue (20 points)
 *    - >= $50k MRR: 20
 *    - >= $20k MRR: 15
 *    - >= $10k MRR: 10
 *    - >= $5k MRR: 5
 *    - < $5k MRR: 0
 *
 * 3. Growth Rate (20 points)
 *    - >= 30% MoM: 20
 *    - >= 20% MoM: 15
 *    - >= 10% MoM: 10
 *    - >= 5% MoM: 5
 *    - < 5% MoM: 0
 *
 * 4. Engagement (15 points)
 *    - Has 2+ published stories: 5
 *    - Has 3+ milestones: 5
 *    - Has recent activity (< 7 days): 5
 *
 * 5. Profile Completeness (10 points)
 *    - Has logo: 3
 *    - Has description (>100 chars): 3
 *    - Has website: 2
 *    - Has category: 2
 *
 * 6. Recency (10 points)
 *    - Active < 30 days: 10
 *    - Active < 60 days: 5
 *    - Active < 90 days: 2
 *    - Older: 0
 */

export async function calculateFeatureScore(startupId: string): Promise<FeatureScoreBreakdown> {
  const startup = (await prisma.startup.findUnique({
    where: { id: startupId },
    include: {
      connections: { where: { isActive: true } },
      revenueSnapshots: {
        orderBy: { date: 'desc' },
        take: 2,
      },
      milestones: { where: { isPublic: true } },
      stories: { where: { isPublished: true } },
      category: true,
    },
  })) as StartupWithFeatureData | null;

  if (!startup) {
    throw new Error('Startup not found');
  }

  // Must be published
  if (!startup.isPublished) {
    return {
      total: 0,
      components: {
        trustLevel: 0,
        revenue: 0,
        growth: 0,
        engagement: 0,
        completeness: 0,
        recency: 0,
      },
      eligible: false,
      reason: 'Startup must be published',
    };
  }

  const latestRevenue = startup.revenueSnapshots[0];
  const previousRevenue = startup.revenueSnapshots[1];

  // 1. Trust Level (25 points)
  const hasVerified = startup.connections.some((connection: { trustLevel: TrustLevel; }) => connection.trustLevel === 'PLATFORM_VERIFIED');
  const trustLevelScore = hasVerified ? 25 : 10;

  // 2. Revenue (20 points)
  const mrr = latestRevenue?.mrr || 0;
  let revenueScore = 0;
  if (mrr >= 50000) revenueScore = 20;
  else if (mrr >= 20000) revenueScore = 15;
  else if (mrr >= 10000) revenueScore = 10;
  else if (mrr >= 5000) revenueScore = 5;

  // 3. Growth Rate (20 points)
  let growthScore = 0;
  if (latestRevenue && previousRevenue && previousRevenue.mrr) {
    const growthRate = ((latestRevenue.mrr! - previousRevenue.mrr!) / previousRevenue.mrr!) * 100;
    if (growthRate >= 30) growthScore = 20;
    else if (growthRate >= 20) growthScore = 15;
    else if (growthRate >= 10) growthScore = 10;
    else if (growthRate >= 5) growthScore = 5;
  }

  // 4. Engagement (15 points)
  let engagementScore = 0;
  if (startup.stories.length >= 2) engagementScore += 5;
  if (startup.milestones.length >= 3) engagementScore += 5;

  // Check recent activity
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const hasRecentActivity =
    startup.updatedAt > sevenDaysAgo ||
    (latestRevenue && new Date(latestRevenue.date) > sevenDaysAgo);
  if (hasRecentActivity) engagementScore += 5;

  // 5. Profile Completeness (10 points)
  let completenessScore = 0;
  if (startup.logo) completenessScore += 3;
  if (startup.description && startup.description.length > 100) completenessScore += 3;
  if (startup.website) completenessScore += 2;
  if (startup.categoryId) completenessScore += 2;

  // 6. Recency (10 points)
  let recencyScore = 0;
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(startup.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceCreation < 30) recencyScore = 10;
  else if (daysSinceCreation < 60) recencyScore = 5;
  else if (daysSinceCreation < 90) recencyScore = 2;

  const total = Math.round(
    trustLevelScore + revenueScore + growthScore + engagementScore + completenessScore + recencyScore
  );

  // Minimum threshold for featuring: 50 points
  const eligible = total >= 50;

  return {
    total,
    components: {
      trustLevel: trustLevelScore,
      revenue: revenueScore,
      growth: growthScore,
      engagement: engagementScore,
      completeness: completenessScore,
      recency: recencyScore,
    },
    eligible,
    reason: eligible ? undefined : 'Score must be at least 50 points to be eligible for featuring',
  };
}

/**
 * Get auto-feature suggestions
 * Returns startups that meet the criteria, sorted by score
 */
export async function getFeatureSuggestions(limit: number = 10): Promise<
  Array<{
    startupId: string;
    startupName: string;
    startupSlug: string;
    score: number;
    breakdown: FeatureScoreBreakdown;
  }>
> {
  // Get all published startups that are not currently featured
  const startups = await prisma.startup.findMany({
    where: {
      isPublished: true,
      isFeatured: false,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  const suggestions = [];

  for (const startup of startups) {
    try {
      const breakdown = await calculateFeatureScore(startup.id);

      if (breakdown.eligible) {
        suggestions.push({
          startupId: startup.id,
          startupName: startup.name,
          startupSlug: startup.slug,
          score: breakdown.total,
          breakdown,
        });
      }
    } catch (error) {
      console.error(`Error calculating score for startup ${startup.id}:`, error);
    }
  }

  // Sort by score descending
  suggestions.sort((a, b) => b.score - a.score);

  return suggestions.slice(0, limit);
}

/**
 * Update all startup feature scores in the database
 * Run this periodically (e.g., daily)
 */
export async function updateAllFeatureScores(): Promise<{
  updated: number;
  errors: number;
}> {
  const startups = await prisma.startup.findMany({
    where: { isPublished: true },
    select: { id: true },
  });

  let updated = 0;
  let errors = 0;

  for (const startup of startups) {
    try {
      const breakdown = await calculateFeatureScore(startup.id);

      await prisma.startup.update({
        where: { id: startup.id },
        data: { featureScore: breakdown.total },
      });

      updated++;
    } catch (error) {
      console.error(`Error updating score for startup ${startup.id}:`, error);
      errors++;
    }
  }

  return { updated, errors };
}
