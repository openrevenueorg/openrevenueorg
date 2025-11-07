import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type PublicStartupProfile = Prisma.StartupGetPayload<{
  include: {
    category: true;
    privacySettings: true;
    connections: {
      where: { isActive: true };
      select: {
        id: true;
        type: true;
        provider: true;
        trustLevel: true;
        verificationMethod: true;
        lastVerifiedAt: true;
      };
    };
    milestones: {
      where: { isPublic: true };
      orderBy: { achievedAt: 'desc' };
      take: 10;
    };
    stories: {
      where: { isPublished: true };
      orderBy: { publishedAt: 'desc' };
      take: 5;
      select: {
        id: true;
        title: true;
        slug: true;
        content: true;
        publishedAt: true;
      };
    };
  };
}>;

type RevenueSnapshotForPublic = {
  date: Date;
  revenue: number;
  mrr: number | null;
  arr: number | null;
  customerCount: number | null;
  currency: string;
  trustLevel: string;
};

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/startups/public/[slug] - Public endpoint for startup pages
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const startup = (await prisma.startup.findUnique({
      where: { slug },
      include: {
        category: true,
        privacySettings: true,
        connections: {
          where: { isActive: true },
          select: {
            id: true,
            type: true,
            provider: true,
            trustLevel: true,
            verificationMethod: true,
            lastVerifiedAt: true,
          },
        },
        milestones: {
          where: { isPublic: true },
          orderBy: { achievedAt: 'desc' },
          take: 10,
        },
        stories: {
          where: { isPublished: true },
          orderBy: { publishedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            slug: true,
            content: true,
            publishedAt: true,
          },
        },
      },
    })) as PublicStartupProfile | null;

    if (!startup || !startup.isPublished) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    // Fetch revenue data for the last 12 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    const revenueSnapshots: RevenueSnapshotForPublic[] = await prisma.revenueSnapshot.findMany({
      where: {
        startupId: startup.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        revenue: true,
        mrr: true,
        arr: true,
        customerCount: true,
        currency: true,
        trustLevel: true,
      },
    });

    // Calculate current metrics from latest snapshot
    const latestSnapshot = revenueSnapshots[revenueSnapshots.length - 1];
    const previousSnapshot =
      revenueSnapshots.length > 1 ? revenueSnapshots[revenueSnapshots.length - 2] : null;

    let growthRate = 0;
    if (latestSnapshot && previousSnapshot && previousSnapshot.mrr) {
      growthRate = ((latestSnapshot.mrr ?? 0 - previousSnapshot.mrr) / previousSnapshot.mrr) * 100;
    }

    // Determine overall trust level
    const overallTrustLevel = startup.connections.some(
      (connection: { trustLevel: string; }) => connection.trustLevel === 'PLATFORM_VERIFIED'
    )
      ? 'PLATFORM_VERIFIED'
      : 'SELF_REPORTED';

    const verificationMethod = startup.connections.find(
      (connection: { trustLevel: string; verificationMethod: string | null; }) => connection.trustLevel === 'PLATFORM_VERIFIED'
    )?.verificationMethod;
    const lastVerifiedAt = startup.connections.find(
      (connection: { lastVerifiedAt: Date | null; }) => connection.lastVerifiedAt
    )?.lastVerifiedAt;

    // Format revenue history for chart
    const revenueHistory = revenueSnapshots.map((snapshot: { date: Date; mrr: number | null; revenue: number; }) => ({
      month: new Date(snapshot.date).toLocaleDateString('en-US', { month: 'short' }),
      mrr: snapshot.mrr ?? 0,
      revenue: snapshot.revenue,
    }));

    // Format stories with excerpts
    const stories = startup.stories.map((story: { id: string; title: string; slug: string; content: string; publishedAt: Date | null; }) => ({
      id: story.id,
      title: story.title,
      slug: story.slug,
      excerpt: `${story.content.substring(0, 150)}...`,
      publishedAt: story.publishedAt ?? new Date(),
    }));

    // Build response with privacy settings applied
    const response = {
      id: startup.id,
      name: startup.name,
      slug: startup.slug,
      description: startup.description,
      logo: startup.logo,
      website: startup.website,
      category: startup.category?.name,
      foundedDate: startup.foundedDate,
      currency: startup.currency,
      trustLevel: overallTrustLevel,
      verificationMethod,
      lastVerifiedAt,
      currentMRR: latestSnapshot?.mrr ?? 0,
      currentARR: latestSnapshot?.arr ?? 0,
      totalRevenue: revenueSnapshots.reduce((sum: number, snapshot: { revenue: number; }) => sum + snapshot.revenue, 0),
      customers: latestSnapshot?.customerCount ?? 0,
      growthRate: Number(growthRate.toFixed(1)),
      revenueHistory,
      milestones: startup.milestones.map((milestone: { id: string; title: string; description: string | null; achievedAt: Date | null; }) => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        date: milestone.achievedAt ?? new Date(),
      })),
      stories,
      // Include privacy settings for client-side visibility control
      privacySettings: startup.privacySettings,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching public startup:', error);
    return NextResponse.json(
      { error: 'Failed to fetch startup' },
      { status: 500 }
    );
  }
}
