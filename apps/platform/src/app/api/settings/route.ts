import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


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

    const settings = await prisma.privacySettings.findUnique({
      where: { startupId },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { startupId, ...data } = body;

    // Verify ownership
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { userId: true },
    });

    if (!startup || startup.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const settings = await prisma.privacySettings.upsert({
      where: { startupId },
      update: data,
      create: { startupId, ...data },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
