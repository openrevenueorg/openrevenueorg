import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/v1/startups - Public API to list startups
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
        const category = searchParams.get('category');
        const verified = searchParams.get('verified');

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = { isPublished: true };

        if (category) {
            where.category = { slug: category };
        }

        if (verified === 'true') {
            where.connections = {
                some: { trustLevel: 'PLATFORM_VERIFIED' }
            };
        }

        const [startups, totalCount] = await Promise.all([
            prisma.startup.findMany({
                where,
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    description: true,
                    website: true,
                    logo: true,
                    category: {
                        select: { name: true, slug: true }
                    },
                    connections: {
                        select: {
                            trustLevel: true,
                            provider: true,
                        },
                        take: 1,
                    },
                    revenueSnapshots: {
                        orderBy: { date: 'desc' },
                        take: 1,
                        select: {
                            mrr: true,
                            revenue: true,
                            customerCount: true,
                            currency: true,
                            date: true,
                        },
                    },
                    leaderboardEntry: {
                        select: {
                            rank: true,
                            growthRate: true,
                        },
                    },
                    privacySettings: {
                        select: {
                            showRevenue: true,
                            showMRR: true,
                            showCustomerCount: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    leaderboardEntry: { rank: 'asc' },
                },
            }),
            prisma.startup.count({ where }),
        ]);

        // Transform data respecting privacy settings
        const data = startups.map((startup) => {
            const privacy = startup.privacySettings;
            const snapshot = startup.revenueSnapshots[0];
            const connection = startup.connections[0];

            return {
                id: startup.id,
                slug: startup.slug,
                name: startup.name,
                description: startup.description,
                website: startup.website,
                logo: startup.logo,
                category: startup.category?.name || null,
                categorySlug: startup.category?.slug || null,
                rank: startup.leaderboardEntry?.rank || null,
                growthRate: startup.leaderboardEntry?.growthRate || null,
                verified: connection?.trustLevel === 'PLATFORM_VERIFIED',
                provider: connection?.provider || null,
                revenue: privacy?.showRevenue !== 'hidden' ? {
                    mrr: privacy?.showMRR !== 'hidden' ? snapshot?.mrr : null,
                    total: snapshot?.revenue || null,
                    customers: privacy?.showCustomerCount !== 'hidden' ? snapshot?.customerCount : null,
                    currency: snapshot?.currency || 'USD',
                    date: snapshot?.date || null,
                } : null,
            };
        });

        return NextResponse.json({
            data,
            meta: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasMore: page * limit < totalCount,
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
