import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Fair selection algorithm for featured startups
 * Considers:
 * 1. Mix of verified and self-reported
 * 2. Category diversity
 * 3. Mix of revenue levels
 * 4. Recent activity
 * 5. Not just paid/featured flag
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    // Get all published startups with recent revenue data
    const allStartups = await prisma.startup.findMany({
      where: { isPublished: true },
      include: {
        category: true,
        connections: {
          select: {
            trustLevel: true,
            verificationMethod: true,
            lastVerifiedAt: true,
          },
        },
        revenueSnapshots: {
          orderBy: { date: 'desc' },
          take: 1,
        },
        leaderboardEntry: true,
      },
    });

    // Filter startups with revenue data
    const startupsWithRevenue = allStartups.filter(
      (s) => s.revenueSnapshots.length > 0 && s.revenueSnapshots[0].revenue > 0
    );

    if (startupsWithRevenue.length === 0) {
      return NextResponse.json([]);
    }

    // Fair selection algorithm
    const selected: typeof startupsWithRevenue = [];

    // Step 1: Get a mix of verified and self-reported (50/50 if possible)
    const verified = startupsWithRevenue.filter((s) =>
      s.connections.some((c) => c.trustLevel === 'PLATFORM_VERIFIED')
    );
    const selfReported = startupsWithRevenue.filter(
      (s) => !s.connections.some((c) => c.trustLevel === 'PLATFORM_VERIFIED')
    );

    const verifiedCount = Math.min(Math.ceil(limit / 2), verified.length);
    const selfReportedCount = Math.min(
      Math.floor(limit / 2),
      selfReported.length
    );
    const remainingCount = limit - verifiedCount - selfReportedCount;

    // Select verified startups with diversity in mind
    if (verified.length > 0) {
      const verifiedSelected = selectDiverse(verified, verifiedCount);
      selected.push(...verifiedSelected);
    }

    // Select self-reported startups with diversity in mind
    if (selfReported.length > 0) {
      const selfReportedSelected = selectDiverse(
        selfReported,
        selfReportedCount
      );
      selected.push(...selfReportedSelected);
    }

    // Step 2: Fill remaining slots with diverse selection from all
    const remaining = startupsWithRevenue.filter(
      (s) => !selected.find((sel) => sel.id === s.id)
    );
    if (remaining.length > 0 && remainingCount > 0) {
      const additional = selectDiverse(remaining, remainingCount);
      selected.push(...additional);
    }

    // Step 3: Shuffle to avoid predictable ordering
    const shuffled = selected.sort(() => Math.random() - 0.5);

    // Format response
    const formatted = shuffled.map((startup) => ({
      id: startup.id,
      name: startup.name,
      slug: startup.slug,
      description: startup.description,
      logo: startup.logo,
      website: startup.website,
      category: startup.category
        ? {
            id: startup.category.id,
            name: startup.category.name,
            slug: startup.category.slug,
          }
        : null,
      latestRevenue: startup.revenueSnapshots[0]
        ? {
            mrr: startup.revenueSnapshots[0].mrr,
            arr: startup.revenueSnapshots[0].arr,
            revenue: startup.revenueSnapshots[0].revenue,
            currency: startup.revenueSnapshots[0].currency,
            date: startup.revenueSnapshots[0].date,
          }
        : null,
      trustLevel: startup.connections[0]?.trustLevel || 'SELF_REPORTED',
      verificationMethod: startup.connections[0]?.verificationMethod || null,
      rank: startup.leaderboardEntry?.rank || null,
      growthRate: startup.leaderboardEntry?.growthRate || null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching featured startups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured startups' },
      { status: 500 }
    );
  }
}

/**
 * Select diverse startups considering:
 * - Category diversity
 * - Revenue level diversity
 * - Recency (prefer recently updated)
 */
function selectDiverse(
  startups: any[],
  count: number
): typeof startups {
  if (count <= 0) return [];
  if (startups.length <= count) return startups;

  const selected: typeof startups = [];
  const usedCategories = new Set<string>();
  const usedStartups = new Set<string>();

  // Calculate revenue percentiles
  const revenues = startups.map(
    (s) => s.revenueSnapshots[0]?.revenue || 0
  );
  revenues.sort((a, b) => a - b);
  const p33 = revenues[Math.floor(revenues.length * 0.33)];
  const p66 = revenues[Math.floor(revenues.length * 0.66)];

  // First pass: Try to get one from each category and revenue level
  const categories = new Set(
    startups.map((s) => s.category?.slug || 'other')
  );

  // Sort by recency (most recently updated first)
  const sortedByRecency = [...startups].sort((a, b) => {
    const aDate = a.revenueSnapshots[0]?.date || a.updatedAt;
    const bDate = b.revenueSnapshots[0]?.date || b.updatedAt;
    const aTime = aDate instanceof Date ? aDate.getTime() : new Date(aDate).getTime();
    const bTime = bDate instanceof Date ? bDate.getTime() : new Date(bDate).getTime();
    return bTime - aTime;
  });

  // Select diverse startups
  for (const startup of sortedByRecency) {
    if (selected.length >= count) break;
    if (usedStartups.has(startup.id)) continue;

    const category = startup.category?.slug || 'other';
    const revenue = startup.revenueSnapshots[0]?.revenue || 0;
    const revenueLevel =
      revenue < p33 ? 'low' : revenue < p66 ? 'mid' : 'high';

    // Prefer startups from unused categories
    const categoryScore = usedCategories.has(category) ? 0 : 1;

    // Prefer variety in revenue levels
    const revenueLevelUsed = selected.some((s) => {
      const sRev = s.revenueSnapshots[0]?.revenue || 0;
      const sLevel = sRev < p33 ? 'low' : sRev < p66 ? 'mid' : 'high';
      return sLevel === revenueLevel;
    });
    const revenueScore = revenueLevelUsed ? 0 : 1;

    // If it adds diversity, select it
    if (categoryScore === 1 || revenueScore === 1) {
      selected.push(startup);
      usedCategories.add(category);
      usedStartups.add(startup.id);
    }
  }

  // Fill remaining slots if needed
  if (selected.length < count) {
    for (const startup of sortedByRecency) {
      if (selected.length >= count) break;
      if (!usedStartups.has(startup.id)) {
        selected.push(startup);
        usedStartups.add(startup.id);
      }
    }
  }

  return selected;
}
