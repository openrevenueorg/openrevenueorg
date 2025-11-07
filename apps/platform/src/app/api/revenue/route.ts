import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startupId) {
      return NextResponse.json({ error: 'startupId required' }, { status: 400 });
    }

    // Verify ownership
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { userId: true },
    });

    if (!startup || startup.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const where: any = { startupId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const revenueData = await prisma.revenueSnapshot.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(revenueData);
  } catch (error) {
    console.error('Error fetching revenue:', error);
    return NextResponse.json({ error: 'Failed to fetch revenue' }, { status: 500 });
  }
}
