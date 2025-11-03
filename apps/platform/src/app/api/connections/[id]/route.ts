import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/connections/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership through startup
    const connection = await prisma.dataConnection.findUnique({
      where: { id },
      include: {
        startup: {
          select: { userId: true },
        },
      },
    });

    if (!connection || connection.startup.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.dataConnection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting connection:', error);
    return NextResponse.json(
      { error: 'Failed to delete connection' },
      { status: 500 }
    );
  }
}

// PATCH /api/connections/[id]
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const connection = await prisma.dataConnection.findUnique({
      where: { id },
      include: {
        startup: {
          select: { userId: true },
        },
      },
    });

    if (!connection || connection.startup.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    const updated = await prisma.dataConnection.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating connection:', error);
    return NextResponse.json(
      { error: 'Failed to update connection' },
      { status: 500 }
    );
  }
}
