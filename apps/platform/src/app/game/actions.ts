'use server';

import { prisma } from '@/lib/prisma';
import { getStartupLogoUrl } from '@/lib/avatar';

export type GameStartup = {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    revenue: number;
    description: string | null;
};

export async function getGameStartups(): Promise<GameStartup[]> {
    try {
        const startups = await prisma.startup.findMany({
            where: {
                isPublished: true,
                revenueSnapshots: {
                    some: {
                        mrr: {
                            gt: 0
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                description: true,
                githubHandle: true,
                twitterHandle: true,
                revenueSnapshots: {
                    orderBy: {
                        date: 'desc'
                    },
                    take: 1
                }
            }
        });

        return startups.map(startup => ({
            id: startup.id,
            name: startup.name,
            slug: startup.slug,
            description: startup.description,
            logo: getStartupLogoUrl({
                logo: startup.logo,
                name: startup.name,
                slug: startup.slug,
                githubHandle: startup.githubHandle,
                twitterHandle: startup.twitterHandle
            }),
            revenue: startup.revenueSnapshots[0]?.mrr || 0
        })).filter(s => s.revenue > 0);
    } catch (error) {
        console.error('Error fetching game startups:', error);
        return [];
    }
}
