import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { headers } from 'next/headers';

type StartupListEntry = Prisma.StartupGetPayload<{
  include: {
    category: true;
    privacySettings: true;
    _count: {
      select: {
        connections: true;
        revenueSnapshots: true;
      };
    };
  };
}>;

type StartupCreationResult = Prisma.StartupGetPayload<{
  include: {
    privacySettings: true;
    category: true;
  };
}>;

type PrivacySettingsModel = NonNullable<StartupListEntry['privacySettings']>;

type PrivacySettingsUI = Omit<
  PrivacySettingsModel,
  'showRevenue' | 'showMRR' | 'showARR' | 'showCustomerCount'
> & {
  showRevenue: boolean;
  showMRR: boolean;
  showARR: boolean;
  showCustomerCount: boolean;
};

// Helper to convert DB string values to UI boolean values
function convertPrivacySettingsToUI(
  settings: StartupListEntry['privacySettings']
): PrivacySettingsUI | null {
  if (!settings) return null;

  return {
    ...settings,
    showRevenue:
      settings.showRevenue === 'public' || settings.showRevenue === 'range',
    showMRR:
      settings.showMRR === 'public' || settings.showMRR === 'range',
    showARR:
      settings.showARR === 'public' || settings.showARR === 'range',
    showCustomerCount:
      settings.showCustomerCount === 'public' ||
      settings.showCustomerCount === 'range',
  };
}

const createStartupSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  website: z.string().url().optional(),
  categoryId: z.string().optional(),
});

// POST /api/startups - Create new startup
export async function POST(req: NextRequest) {
  try {
    // const session = await auth({
    //   headers: await req.headers,
    // });
    // const session = await auth();
    //const session = (await auth.$context).session;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = createStartupSchema.parse(body);

    // Check if slug is unique
    const existing = await prisma.startup.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const startup: StartupCreationResult = await prisma.startup.create({
      data: {
        ...data,
        userId: session.user.id,
        privacySettings: {
          create: {}, // Creates with default values
        },
      },
      include: {
        privacySettings: true,
        category: true,
      },
    });

    // Convert privacy settings to UI format
    const uiStartup = {
      ...startup,
      privacySettings: convertPrivacySettingsToUI(startup.privacySettings),
    };

    return NextResponse.json(uiStartup);
  } catch (error) {
    console.error('Error creating startup:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create startup' },
      { status: 500 }
    );
  }
}

// GET /api/startups - List user's startups
export async function GET(_req: NextRequest) {
  try {
    //const session = await auth(req as any);
    //const session = (await auth.$context).session;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startups: StartupListEntry[] = await prisma.startup.findMany({
      where: { userId: session.user.id },
      include: {
        category: true,
        privacySettings: true,
        _count: {
          select: {
            connections: true,
            revenueSnapshots: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Convert privacy settings to UI format for all startups
    const uiStartups = startups.map((startup) => ({
      ...startup,
      privacySettings: convertPrivacySettingsToUI(startup.privacySettings),
    }));

    return NextResponse.json(uiStartups);
  } catch (error) {
    console.error('Error fetching startups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch startups' },
      { status: 500 }
    );
  }
}
