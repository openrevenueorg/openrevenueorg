import { NextRequest, NextResponse } from 'next/server';
import type { Prisma, TrustLevel } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

type StartupWithConnections = Prisma.StartupGetPayload<{
  include: {
    category: true;
    privacySettings: true;
    connections: {
      select: {
        id: true;
        type: true;
        provider: true;
        isActive: true;
        lastSyncedAt: true;
        trustLevel: true;
        verificationMethod: true;
        lastVerifiedAt: true;
      };
    };
  };
}>;

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

    const startup = (await prisma.startup.findUnique({
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
    })) as StartupWithConnections | null;

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    // Check ownership
    if (session?.user?.id !== startup.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Determine overall trust level (use highest available)
    const overallTrustLevel = startup.connections.some((connection: { trustLevel: TrustLevel; }) => connection.trustLevel === 'PLATFORM_VERIFIED')
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

    // Only allow updating specific fields
    const allowedFields = [
      'name',
      'slug',
      'description',
      'website',
      'logo',
      'categoryId',
      'foundedDate',
      'currency',
      'twitterHandle',
      'githubHandle',
      'linkedinHandle',
      'discordUrl',
      'youtubeUrl',
      'instagramHandle',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    const startup = await prisma.startup.update({
      where: { id },
      data: updateData,
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
