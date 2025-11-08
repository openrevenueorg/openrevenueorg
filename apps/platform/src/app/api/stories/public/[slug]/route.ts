import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type PublicStartupProfile = Prisma.StartupGetPayload<{
  include: {
    category: true;
    privacySettings: true;
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


export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/startups/public/[slug] - Public endpoint for startup pages
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const story = await prisma.story.findFirst({
      where: { slug: slug },
      include: {
        startup: {
          select: {
            userId: true,
          },
        },
      },
    });

    const startup = (await prisma.startup.findUnique({
      where: { id: story?.startupId },
      include: {
        category: true,
        privacySettings: true,
        stories: {
          where: { isPublished: true, slug: slug },
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

    // Format stories with excerpts
    const stories = {
      id: story?.id,
      title: story?.title,
      slug: story?.slug,
      excerpt: `${story?.content?.substring(0, 150)}...`,
      content: story?.content,
      publishedAt: story?.publishedAt ?? new Date(),
    };

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
