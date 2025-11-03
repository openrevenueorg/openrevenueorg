import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/startups/[id]
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    //const session = await auth();
    //const session = (await auth.$context).session;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const startup = await prisma.startup.findUnique({
      where: { id },
      include: {
        category: true,
        privacySettings: true,
        connections: {
          select: {
            id: true,
            type: true,
            provider: true,
            isActive: true,
            lastSyncedAt: true,
            trustLevel: true,
            verificationMethod: true,
            lastVerifiedAt: true,
          },
        },
      },
    });

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    // Check ownership
    if (session?.user?.id !== startup.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Determine overall trust level (use highest available)
    const overallTrustLevel = startup.connections.some(c => c.trustLevel === 'PLATFORM_VERIFIED')
      ? 'PLATFORM_VERIFIED'
      : 'SELF_REPORTED';

    return NextResponse.json({ ...startup, overallTrustLevel });
  } catch (error) {
    console.error('Error fetching startup:', error);
    return NextResponse.json(
      { error: 'Failed to fetch startup' },
      { status: 500 }
    );
  }
}

// PATCH /api/startups/[id]
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    //const session = await auth();
    //const session = (await auth.$context).session;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.startup.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    const startup = await prisma.startup.update({
      where: { id },
      data: body,
      include: {
        category: true,
        privacySettings: true,
      },
    });

    return NextResponse.json(startup);
  } catch (error) {
    console.error('Error updating startup:', error);
    return NextResponse.json(
      { error: 'Failed to update startup' },
      { status: 500 }
    );
  }
}

// DELETE /api/startups/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    //const session = await auth();
    //const session = (await auth.$context).session;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.startup.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.startup.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting startup:', error);
    return NextResponse.json(
      { error: 'Failed to delete startup' },
      { status: 500 }
    );
  }
}
