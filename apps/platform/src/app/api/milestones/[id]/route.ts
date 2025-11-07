import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { headers } from 'next/headers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateMilestoneSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  targetValue: z.number().optional(),
  isPublic: z.boolean().optional(),
  achievedAt: z.string().optional(),
});

// PATCH /api/milestones/[id]
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
    const existing = await prisma.milestone.findUnique({
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
    const data = updateMilestoneSchema.parse(body);

    const story = await prisma.milestone.update({
      where: { id },
      data: {
        ...data,
        achievedAt: data.achievedAt ? new Date(data.achievedAt) : undefined,
      },
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error updating milestone:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 });
  }
}

// DELETE /api/milestones/[id]
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
    const existing = await prisma.milestone.findUnique({
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

    await prisma.milestone.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 500 });
  }
}

