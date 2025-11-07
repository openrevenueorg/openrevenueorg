import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { headers } from 'next/headers';


const createMilestoneSchema = z.object({
  startupId: z.string(),
  type: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  targetValue: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    //const session = await auth();
    //const session = (await auth.$context).session;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = createMilestoneSchema.parse(body);

    // Verify ownership
    const startup = await prisma.startup.findUnique({
      where: { id: data.startupId },
      select: { userId: true },
    });

    if (!startup || startup.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const milestone = await prisma.milestone.create({
      data,
    });

    return NextResponse.json(milestone);
  } catch (error) {
    console.error('Error creating milestone:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    //const session = await auth();
    //const session = (await auth.$context).session;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startupId = searchParams.get('startupId');

    if (!startupId) {
      return NextResponse.json({ error: 'startupId required' }, { status: 400 });
    }

    const milestones = await prisma.milestone.findMany({
      where: { startupId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
  }
}
