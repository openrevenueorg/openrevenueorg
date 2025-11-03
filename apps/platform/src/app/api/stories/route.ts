import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';


const createStorySchema = z.object({
  startupId: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  slug: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = createStorySchema.parse(body);

    // Verify ownership
    const startup = await prisma.startup.findUnique({
      where: { id: data.startupId },
      select: { userId: true },
    });

    if (!startup || startup.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const story = await prisma.story.create({
      data,
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error creating story:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startupId = searchParams.get('startupId');

    if (!startupId) {
      return NextResponse.json({ error: 'startupId required' }, { status: 400 });
    }

    const stories = await prisma.story.findMany({
      where: { startupId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}
