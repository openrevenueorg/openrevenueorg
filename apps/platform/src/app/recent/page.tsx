import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { FooterElement } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, DollarSign, TrendingUp } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getStartupLogoUrl } from '@/lib/avatar';
import { TrustBadge } from '@/components/ui/trust-badge';
import { formatDistanceToNow } from 'date-fns';

export const metadata: Metadata = {
    title: 'Recently Added Startups | OpenRevenue',
    description: 'Discover the latest startups joining the open startup movement.',
};

export const dynamic = 'force-dynamic';

async function getRecentStartups() {
    const startups = await prisma.startup.findMany({
        where: { isPublished: true },
        include: {
            category: true,
            connections: {
                select: {
                    trustLevel: true,
                    verificationMethod: true,
                },
            },
            revenueSnapshots: {
                orderBy: { date: 'desc' },
                take: 1,
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 20,
    });

    return startups;
}

function formatCurrency(amount?: number) {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
}

export default async function RecentPage() {
    const startups = await getRecentStartups();

    return (
        <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <Badge variant="secondary" className="mb-4">
                        <Clock className="h-3 w-3 mr-2" />
                        Fresh Drops
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Recently Added
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Discover the latest startups joining the open startup movement.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-8">
                    {startups.map((startup) => (
                        <div key={startup.id} className="relative pl-8 pb-8 border-l border-muted last:pb-0 last:border-0">
                            {/* Timeline dot */}
                            <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />

                            <div className="mb-2 text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(startup.createdAt), { addSuffix: true })}
                            </div>

                            <Link href={`/startup/${startup.slug}`}>
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={getStartupLogoUrl({
                                                    logo: startup.logo || undefined,
                                                    name: startup.name,
                                                    slug: startup.slug
                                                })} />
                                                <AvatarFallback>{startup.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{startup.name}</h3>
                                                        <p className="text-sm text-muted-foreground mb-2">{startup.category?.name}</p>
                                                    </div>
                                                    {startup.connections[0] && (
                                                        <TrustBadge
                                                            trustLevel={startup.connections[0].trustLevel}
                                                            verificationMethod={startup.connections[0].verificationMethod || undefined}
                                                            size="sm"
                                                        />
                                                    )}
                                                </div>

                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                    {startup.description}
                                                </p>

                                                <div className="flex gap-6 text-sm">
                                                    {startup.revenueSnapshots[0]?.revenue !== undefined && (
                                                        <div className="flex items-center gap-1 font-medium">
                                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                            {formatCurrency(startup.revenueSnapshots[0].revenue ?? undefined)} Revenue
                                                        </div>
                                                    )}
                                                    {startup.revenueSnapshots[0]?.mrr !== undefined && (
                                                        <div className="flex items-center gap-1 font-medium">
                                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                                            {formatCurrency(startup.revenueSnapshots[0].mrr ?? undefined)} MRR
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            <FooterElement />
        </div>
    );
}
