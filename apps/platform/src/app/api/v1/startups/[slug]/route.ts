import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = {
    params: Promise<{ slug: string }>;
};

// GET /api/v1/startups/[slug] - Public API to get a single startup
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { slug } = await params;

        const startup = await prisma.startup.findUnique({
            where: { slug, isPublished: true },
            select: {
                id: true,
                slug: true,
                name: true,
                description: true,
                website: true,
                logo: true,
                foundedDate: true,
                country: true,
                twitterHandle: true,
                githubHandle: true,
                linkedinHandle: true,
                category: {
                    select: { name: true, slug: true }
                },
                connections: {
                    select: {
                        trustLevel: true,
                        provider: true,
                        verificationMethod: true,
                        lastVerifiedAt: true,
                    },
                },
                revenueSnapshots: {
                    orderBy: { date: 'desc' },
                    take: 12,
                    select: {
                        mrr: true,
                        revenue: true,
                        customerCount: true,
                        currency: true,
                        date: true,
                        growthRate: true,
                    },
                },
                leaderboardEntry: {
                    select: {
                        rank: true,
                        growthRate: true,
                        totalRevenue: true,
                    },
                },
                milestones: {
                    where: { isPublic: true },
                    orderBy: { achievedAt: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        targetValue: true,
                        achievedAt: true,
                    },
                },
                privacySettings: {
                    select: {
                        showRevenue: true,
                        showMRR: true,
                        showCustomerCount: true,
                        showGrowthRate: true,
                        historicalMonths: true,
                    },
                },
            },
        });

        if (!startup) {
            return NextResponse.json(
                { error: 'Startup not found' },
                { status: 404 }
            );
        }

        const privacy = startup.privacySettings;
        const latestSnapshot = startup.revenueSnapshots[0];
        const isVerified = startup.connections.some(c => c.trustLevel === 'PLATFORM_VERIFIED');

        // Build response respecting privacy
        const response = {
            id: startup.id,
            slug: startup.slug,
            name: startup.name,
            description: startup.description,
            website: startup.website,
            logo: startup.logo,
            foundedDate: startup.foundedDate,
            country: startup.country,
            social: {
                twitter: startup.twitterHandle ? `https://twitter.com/${startup.twitterHandle}` : null,
                github: startup.githubHandle ? `https://github.com/${startup.githubHandle}` : null,
                linkedin: startup.linkedinHandle ? `https://linkedin.com/company/${startup.linkedinHandle}` : null,
            },
            category: startup.category?.name || null,
            categorySlug: startup.category?.slug || null,
            rank: startup.leaderboardEntry?.rank || null,
            verified: isVerified,
            providers: startup.connections.map(c => c.provider).filter(Boolean),
            revenue: privacy?.showRevenue !== 'hidden' ? {
                mrr: privacy?.showMRR !== 'hidden' ? latestSnapshot?.mrr : null,
                total: latestSnapshot?.revenue || null,
                customers: privacy?.showCustomerCount !== 'hidden' ? latestSnapshot?.customerCount : null,
                growthRate: privacy?.showGrowthRate ? startup.leaderboardEntry?.growthRate : null,
                currency: latestSnapshot?.currency || 'USD',
                lastUpdated: latestSnapshot?.date || null,
                history: startup.revenueSnapshots
                    .slice(0, privacy?.historicalMonths || 12)
                    .map(s => ({
                        date: s.date,
                        mrr: privacy?.showMRR !== 'hidden' ? s.mrr : null,
                        revenue: s.revenue,
                        customers: privacy?.showCustomerCount !== 'hidden' ? s.customerCount : null,
                    })),
            } : null,
            milestones: startup.milestones.map(m => ({
                id: m.id,
                title: m.title,
                description: m.description,
                value: m.targetValue,
                achievedAt: m.achievedAt,
            })),
        };

        return NextResponse.json(response, {
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
