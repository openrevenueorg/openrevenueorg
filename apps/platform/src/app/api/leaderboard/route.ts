import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = { isPublished: true };

    if (category) {
      where.category = { slug: category };
    }

    const startups = await prisma.startup.findMany({
      where,
      include: {
        category: true,
        revenueSnapshots: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
      take: limit,
      orderBy: {
        revenueSnapshots: {
          _count: 'desc',
        },
      },
    });

    return NextResponse.json(startups);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
