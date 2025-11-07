import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/roles';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/admin/featured/[id] - Unfeature a startup
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('ADMIN');
    const { id } = await params;

    const startup = await prisma.startup.findUnique({
      where: { id },
      select: { isFeatured: true },
    });

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    if (!startup.isFeatured) {
      return NextResponse.json({ error: 'Startup is not featured' }, { status: 400 });
    }

    const updatedStartup = await prisma.startup.update({
      where: { id },
      data: {
        isFeatured: false,
        featuredUntil: null,
      },
    });

    return NextResponse.json({
      success: true,
      startup: updatedStartup,
    });
  } catch (error: any) {
    console.error('Error unfeaturing startup:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unfeature startup' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}

// PATCH /api/admin/featured/[id] - Extend featuring duration
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('ADMIN');
    const { id } = await params;
    const body = await req.json();
    const { extensionDays = 7 } = body;

    const startup = await prisma.startup.findUnique({
      where: { id },
      select: { isFeatured: true, featuredUntil: true, featureImpressions: true, featureClicks: true },
    });

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    if (!startup.isFeatured) {
      return NextResponse.json({ error: 'Startup is not featured' }, { status: 400 });
    }

    // Calculate new expiration (max 7 days from now)
    const now = new Date();
    const currentUntil = startup.featuredUntil || now;
    const newUntil = currentUntil > now ? new Date(currentUntil) : new Date(now);
    newUntil.setDate(newUntil.getDate() + Math.min(extensionDays, 7));

    // Check performance-based extension criteria
    const clickRate = startup.featureImpressions > 0
      ? (startup.featureClicks / startup.featureImpressions) * 100
      : 0;

    let canAutoExtend = false;
    if (clickRate >= 5 || startup.featureClicks >= 100) {
      canAutoExtend = true;
    }

    const updatedStartup = await prisma.startup.update({
      where: { id },
      data: {
        featuredUntil: newUntil,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      startup: updatedStartup,
      featuredUntil: newUntil,
      performance: {
        impressions: startup.featureImpressions,
        clicks: startup.featureClicks,
        clickRate: clickRate?.toFixed(2) + '%',
        qualifiesForAutoExtension: canAutoExtend,
      },
    });
  } catch (error: any) {
    console.error('Error extending featured duration:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extend featured duration' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
