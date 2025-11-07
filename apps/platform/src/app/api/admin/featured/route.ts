import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/roles';
import { getFeatureSuggestions } from '@/lib/featuring/score-calculator';

type FeaturedStartupWithRelations = Prisma.StartupGetPayload<{
  include: {
    user: { select: { name: true; email: true } };
    category: true;
    revenueSnapshots: {
      orderBy: { date: 'desc' };
      take: 1;
    };
  };
}>;

export const dynamic = 'force-dynamic';

// GET /api/admin/featured - Get featured startups and suggestions
export async function GET(req: NextRequest) {
  try {
    await requireRole('ADMIN');

    const { searchParams } = new URL(req.url);
    const includeExpired = searchParams.get('includeExpired') === 'true';

    // Get currently featured startups
    const now = new Date();
    const featured: FeaturedStartupWithRelations[] = await prisma.startup.findMany({
      where: {
        isFeatured: true,
        ...(includeExpired ? {} : {
          OR: [
            { featuredUntil: null },
            { featuredUntil: { gte: now } },
          ],
        }),
      },
      include: {
        user: { select: { name: true, email: true } },
        category: true,
        revenueSnapshots: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
      orderBy: { featuredAt: 'desc' },
    });

    // Get auto-feature suggestions
    const suggestions = await getFeatureSuggestions(10);

    // Calculate stats
    const totalSlots = 5;
    const usedSlots = featured.filter((startup: FeaturedStartupWithRelations) => !startup.featuredUntil || startup.featuredUntil >= now).length;
    const availableSlots = Math.max(0, totalSlots - usedSlots);

    return NextResponse.json({
      featured: featured.map((startup: FeaturedStartupWithRelations) => ({
        ...startup,
        currentMRR: startup.revenueSnapshots[0]?.mrr ?? 0,
        isExpired: Boolean(startup.featuredUntil && startup.featuredUntil < now),
      })),
      suggestions,
      stats: {
        totalSlots,
        usedSlots,
        availableSlots,
      },
    });
  } catch (error: any) {
    console.error('Error fetching featured startups:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch featured startups' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}

// POST /api/admin/featured - Feature a startup
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole('ADMIN');
    const body = await req.json();
    const { startupId, durationDays = 7 } = body;

    if (!startupId) {
      return NextResponse.json({ error: 'startupId is required' }, { status: 400 });
    }

    // Check if startup exists and is published
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { isPublished: true, isFeatured: true, featureScore: true },
    });

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    if (!startup.isPublished) {
      return NextResponse.json({ error: 'Startup must be published first' }, { status: 400 });
    }

    if (startup.isFeatured) {
      return NextResponse.json({ error: 'Startup is already featured' }, { status: 400 });
    }

    // Check if we have available slots
    const now = new Date();
    const currentFeaturedCount = await prisma.startup.count({
      where: {
        isFeatured: true,
        OR: [
          { featuredUntil: null },
          { featuredUntil: { gte: now } },
        ],
      },
    });

    if (currentFeaturedCount >= 5) {
      return NextResponse.json(
        { error: 'Maximum featured slots (5) reached. Unfeature a startup first.' },
        { status: 400 }
      );
    }

    // Feature the startup
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + Math.min(durationDays, 7)); // Max 7 days

    const updatedStartup = await prisma.startup.update({
      where: { id: startupId },
      data: {
        isFeatured: true,
        featuredAt: now,
        featuredUntil,
        featuredBy: user.id,
        featureImpressions: 0,
        featureClicks: 0,
      },
      include: {
        category: true,
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      startup: updatedStartup,
      featuredUntil,
    });
  } catch (error: any) {
    console.error('Error featuring startup:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to feature startup' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}

