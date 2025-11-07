import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/roles';

export const dynamic = 'force-dynamic';

// GET /api/admin/stats - Get platform statistics
export async function GET() {
  try {
    await requireRole('ADMIN');

    // Get total startups
    const totalStartups = await prisma.startup.count();

    // Get published startups
    const publishedStartups = await prisma.startup.count({
      where: { isPublished: true },
    });

    // Get total users
    const totalUsers = await prisma.user.count();

    // Get featured startups count
    const now = new Date();
    const featuredCount = await prisma.startup.count({
      where: {
        isFeatured: true,
        OR: [
          { featuredUntil: null },
          { featuredUntil: { gte: now } },
        ],
      },
    });

    // Get average feature score
    const avgScoreResult = await prisma.startup.aggregate({
      _avg: {
        featureScore: true,
      },
      where: {
        isPublished: true,
        featureScore: { not: null },
      },
    });

    // Get tier distribution
    const tierDistribution = {
      BRONZE: await prisma.startup.count({ where: { tier: 'BRONZE' } }),
      SILVER: await prisma.startup.count({ where: { tier: 'SILVER' } }),
      GOLD: await prisma.startup.count({ where: { tier: 'GOLD' } }),
    };

    return NextResponse.json({
      totalStartups,
      publishedStartups,
      totalUsers,
      featuredCount,
      avgFeatureScore: avgScoreResult._avg.featureScore || 0,
      tierDistribution,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admin stats' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
