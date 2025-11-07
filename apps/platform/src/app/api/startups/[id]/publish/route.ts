import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { canPublishStartup, validateStartupTier } from '@/lib/publishing/tier-validation';
import { calculateFeatureScore } from '@/lib/featuring/score-calculator';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/startups/[id]/publish - Publish a startup
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const startup = await prisma.startup.findUnique({
      where: { id },
      select: { userId: true, isPublished: true },
    });

    if (!startup || startup.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (startup.isPublished) {
      return NextResponse.json({ error: 'Startup already published' }, { status: 400 });
    }

    // Validate publishing requirements
    const publishCheck = await canPublishStartup(id);

    if (!publishCheck.canPublish) {
      return NextResponse.json(
        {
          error: publishCheck.reason,
          validation: publishCheck.validation,
        },
        { status: 400 }
      );
    }

    // Calculate initial feature score
    const scoreBreakdown = await calculateFeatureScore(id);

    // Publish the startup
    const updatedStartup = await prisma.startup.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
        tier: publishCheck.validation.tier,
        featureScore: scoreBreakdown.total,
      },
      include: {
        category: true,
        privacySettings: true,
      },
    });

    return NextResponse.json({
      success: true,
      startup: updatedStartup,
      tier: publishCheck.validation.tier,
      score: scoreBreakdown.total,
    });
  } catch (error) {
    console.error('Error publishing startup:', error);
    return NextResponse.json({ error: 'Failed to publish startup' }, { status: 500 });
  }
}

// DELETE /api/startups/[id]/publish - Unpublish a startup
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const startup = await prisma.startup.findUnique({
      where: { id },
      select: { userId: true, isPublished: true, isFeatured: true },
    });

    if (!startup || startup.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!startup.isPublished) {
      return NextResponse.json({ error: 'Startup not published' }, { status: 400 });
    }

    // Unpublish and remove from featured if applicable
    const updatedStartup = await prisma.startup.update({
      where: { id },
      data: {
        isPublished: false,
        isFeatured: false,
        featuredAt: null,
        featuredUntil: null,
      },
      include: {
        category: true,
        privacySettings: true,
      },
    });

    return NextResponse.json({
      success: true,
      startup: updatedStartup,
    });
  } catch (error) {
    console.error('Error unpublishing startup:', error);
    return NextResponse.json({ error: 'Failed to unpublish startup' }, { status: 500 });
  }
}

// GET /api/startups/[id]/publish - Check publishing status and requirements
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const startup = await prisma.startup.findUnique({
      where: { id },
      select: { userId: true, isPublished: true, publishedAt: true, tier: true, featureScore: true },
    });

    if (!startup || startup.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get validation
    const validation = await validateStartupTier(id);
    const publishCheck = await canPublishStartup(id);

    return NextResponse.json({
      isPublished: startup.isPublished,
      publishedAt: startup.publishedAt,
      currentTier: startup.tier,
      featureScore: startup.featureScore,
      validation,
      canPublish: publishCheck.canPublish,
      reason: publishCheck.reason,
    });
  } catch (error) {
    console.error('Error checking publish status:', error);
    return NextResponse.json({ error: 'Failed to check publish status' }, { status: 500 });
  }
}
