import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/v1/leaderboard - Public API for leaderboard data
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
        const category = searchParams.get('category');

        // Build where clause
        const where: any = {
            startup: { isPublished: true }
        };

        if (category) {
            where.startup.category = { slug: category };
        }

        const entries = await prisma.leaderboardEntry.findMany({
            where,
            select: {
                rank: true,
                mrr: true,
                arr: true,
                totalRevenue: true,
                customerCount: true,
                growthRate: true,
                currency: true,
                lastUpdated: true,
                startup: {
                    select: {
                        id: true,
                        slug: true,
                        name: true,
                        logo: true,
                        category: {
                            select: { name: true, slug: true }
                        },
                        connections: {
                            select: { trustLevel: true, provider: true },
                            take: 1,
                        },
                        privacySettings: {
                            select: {
                                showRevenue: true,
                                showMRR: true,
                                showCustomerCount: true,
                            },
                        },
                    },
                },
            },
            orderBy: { rank: 'asc' },
            take: limit,
        });

        // Transform respecting privacy
        const data = entries.map((entry) => {
            const privacy = entry.startup.privacySettings;
            const connection = entry.startup.connections[0];

            return {
                rank: entry.rank,
                startup: {
                    id: entry.startup.id,
                    slug: entry.startup.slug,
                    name: entry.startup.name,
                    logo: entry.startup.logo,
                    category: entry.startup.category?.name || null,
                    verified: connection?.trustLevel === 'PLATFORM_VERIFIED',
                    provider: connection?.provider || null,
                },
                metrics: {
                    mrr: privacy?.showMRR !== 'hidden' ? entry.mrr : null,
                    arr: privacy?.showMRR !== 'hidden' ? entry.arr : null,
                    totalRevenue: privacy?.showRevenue !== 'hidden' ? entry.totalRevenue : null,
                    customers: privacy?.showCustomerCount !== 'hidden' ? entry.customerCount : null,
                    growthRate: entry.growthRate,
                    currency: entry.currency,
                },
                lastUpdated: entry.lastUpdated,
            };
        });

        return NextResponse.json({
            data,
            meta: {
                count: data.length,
                limit,
                generatedAt: new Date().toISOString(),
            },
        }, {
            headers: {
                'Cache-Control': 'public, max-age=300, s-maxage=300',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
