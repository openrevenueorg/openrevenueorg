import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/roles';

type FeaturedStartupSummary = {
  name: string;
  slug: string;
  featureImpressions: number;
  featureClicks: number;
};

type CategoryWithStartupRevenue = {
  name: string;
  _count: { startups: number };
  startups: Array<{
    revenueSnapshots: Array<{
      revenue: number | null;
    }>;
  }>;
};

type RecentStartupSummary = {
  name: string;
  createdAt: Date;
  isPublished: boolean;
  isFeatured: boolean;
};

type RecentUserSummary = {
  name: string | null;
  email: string;
  createdAt: Date;
};

type ActivityItem =
  | {
      type: 'startup_featured' | 'startup_published' | 'startup_created';
      description: string;
      timestamp: string;
    }
  | {
      type: 'user_joined';
      description: string;
      timestamp: string;
    };

export const dynamic = 'force-dynamic';

// GET /api/admin/detailed-stats - Get comprehensive platform statistics
export async function GET() {
  try {
    await requireRole('ADMIN');

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // Overview stats
    const [totalStartups, publishedStartups, totalUsers, featuredCount] = await Promise.all([
      prisma.startup.count(),
      prisma.startup.count({ where: { isPublished: true } }),
      prisma.user.count(),
      prisma.startup.count({
        where: {
          isFeatured: true,
          OR: [{ featuredUntil: null }, { featuredUntil: { gte: now } }],
        },
      }),
    ]);

    // Calculate total revenue
    const revenueData = await prisma.revenueSnapshot.aggregate({
      _sum: { revenue: true },
      _avg: { revenue: true },
    });

    const totalRevenue = revenueData._sum.revenue || 0;
    const avgRevenuePerStartup = revenueData._avg.revenue || 0;

    // Growth metrics
    const [startupsThisMonth, startupsLastMonth, usersThisMonth, usersLastMonth] =
      await Promise.all([
        prisma.startup.count({
          where: {
            createdAt: {
              gte: firstDayThisMonth,
            },
          },
        }),
        prisma.startup.count({
          where: {
            createdAt: {
              gte: firstDayLastMonth,
              lt: firstDayThisMonth,
            },
          },
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: firstDayThisMonth,
            },
          },
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: firstDayLastMonth,
              lt: firstDayThisMonth,
            },
          },
        }),
      ]);

    // Featuring performance
    const featuredStartups = (await prisma.startup.findMany({
      where: {
        isFeatured: true,
      },
      select: {
        name: true,
        slug: true,
        featureImpressions: true,
        featureClicks: true,
      },
      orderBy: {
        featureClicks: 'desc',
      },
      take: 5,
    })) as FeaturedStartupSummary[];

    let totalImpressions = 0;
    let totalClicks = 0;
    for (const startup of featuredStartups) {
      totalImpressions += startup.featureImpressions;
      totalClicks += startup.featureClicks;
    }
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    const topPerformers = featuredStartups.map((startup) => ({
      name: startup.name,
      slug: startup.slug,
      impressions: startup.featureImpressions,
      clicks: startup.featureClicks,
      ctr: startup.featureImpressions > 0 ? (startup.featureClicks / startup.featureImpressions) * 100 : 0,
    }));

    // Tier distribution
    const [bronzeCount, silverCount, goldCount] = await Promise.all([
      prisma.startup.count({ where: { tier: 'BRONZE' } }),
      prisma.startup.count({ where: { tier: 'SILVER' } }),
      prisma.startup.count({ where: { tier: 'GOLD' } }),
    ]);

    // Top categories
    const categories = (await prisma.category.findMany({
      include: {
        _count: {
          select: { startups: true },
        },
        startups: {
          include: {
            revenueSnapshots: {
              orderBy: { date: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        startups: {
          _count: 'desc',
        },
      },
      take: 10,
    })) as CategoryWithStartupRevenue[];

    const categoriesWithStats = categories.map((category) => {
      const revenues = category.startups.map(
        (startup) => startup.revenueSnapshots[0]?.revenue ?? 0
      );
      const positiveRevenues = revenues.filter(
        (revenue): revenue is number => revenue > 0
      );
      const avgRevenue =
        positiveRevenues.length > 0
          ? positiveRevenues.reduce((accumulator, revenue) => accumulator + revenue, 0) /
            positiveRevenues.length
          : 0;

      return {
        name: category.name,
        count: category._count.startups,
        avgRevenue,
      };
    });

    // Recent activity
    const [recentStartups, recentUsers] = await Promise.all([
      prisma.startup.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          name: true,
          createdAt: true,
          isPublished: true,
          isFeatured: true,
        },
      }) as Promise<RecentStartupSummary[]>,
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          name: true,
          email: true,
          createdAt: true,
        },
      }) as Promise<RecentUserSummary[]>,
    ]);

    const recentStartupActivities: ActivityItem[] = recentStartups.map((startup) => ({
      type: startup.isFeatured
        ? 'startup_featured'
        : startup.isPublished
        ? 'startup_published'
        : 'startup_created',
      description: startup.isFeatured
        ? `${startup.name} was featured`
        : startup.isPublished
        ? `${startup.name} was published`
        : `${startup.name} was created`,
      timestamp: startup.createdAt.toISOString(),
    }));

    const recentUserActivities: ActivityItem[] = recentUsers.map((user) => ({
        type: 'user_joined' as const,
        description: `${user.name || user.email} joined the platform`,
        timestamp: user.createdAt.toISOString(),
      }));

    const recentActivity: ActivityItem[] = [...recentStartupActivities, ...recentUserActivities]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    return NextResponse.json({
      overview: {
        totalStartups,
        publishedStartups,
        totalUsers,
        featuredCount,
        totalRevenue,
        avgRevenuePerStartup,
      },
      growth: {
        startupsThisMonth,
        startupsLastMonth,
        usersThisMonth,
        usersLastMonth,
        revenueGrowth: 0, // Could calculate if tracking revenue history
      },
      featuring: {
        totalImpressions,
        totalClicks,
        avgCTR,
        topPerformers,
      },
      tiers: {
        BRONZE: bronzeCount,
        SILVER: silverCount,
        GOLD: goldCount,
      },
      categories: categoriesWithStats,
      recentActivity,
    });
  } catch (error: unknown) {
    console.error('Error fetching detailed stats:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to fetch detailed stats';
    const status = message.includes('Unauthorized')
      ? 401
      : message.includes('Forbidden')
      ? 403
      : 500;
    return NextResponse.json(
      { error: message },
      {
        status,
      }
    );
  }
}
