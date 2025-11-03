import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const trustLevel = searchParams.get('trustLevel'); // 'PLATFORM_VERIFIED' | 'SELF_REPORTED'
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = { isPublished: true };

    if (category) {
      where.category = { slug: category };
    }

    // Filter by trust level if specified
    if (trustLevel) {
      where.connections = {
        some: { trustLevel: trustLevel.toUpperCase() as 'PLATFORM_VERIFIED' | 'SELF_REPORTED' }
      };
    }

    const startups = await prisma.startup.findMany({
      where,
      include: {
        category: true,
        connections: {
          select: {
            trustLevel: true,
            verificationMethod: true,
            lastVerifiedAt: true,
          },
        },
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
