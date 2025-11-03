import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { headers } from 'next/headers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateStorySchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/stories/[id]
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        startup: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Check ownership if not published
    if (!story.isPublished && session?.user?.id !== story.startup.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}

// PATCH /api/stories/[id]
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.story.findUnique({
      where: { id },
      include: {
        startup: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existing || existing.startup.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const data = updateStorySchema.parse(body);

    const updateData: any = { ...data };
    
    // Set publishedAt if publishing for first time
    if (data.isPublished && !existing.isPublished) {
      updateData.publishedAt = new Date();
    }

    const story = await prisma.story.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error updating story:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
  }
}

// DELETE /api/stories/[id]
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
    const existing = await prisma.story.findUnique({
      where: { id },
      include: {
        startup: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existing || existing.startup.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.story.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 });
  }
}

