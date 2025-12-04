import { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { FooterElement } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, Globe, DollarSign } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
    title: 'Startup Statistics | OpenRevenue',
    description: 'Live data from verified revenue across startups.',
};

export const dynamic = 'force-dynamic';

async function getStats() {
    const startups = await prisma.startup.findMany({
        where: { isPublished: true },
        include: {
            revenueSnapshots: {
                orderBy: { date: 'desc' },
                take: 1,
            },
        },
    });

    const totalRevenue = startups.reduce((acc, s) => acc + (s.revenueSnapshots[0]?.revenue || 0), 0);
    const totalStartups = startups.length;

    // Simple distribution calculation (mock logic for now)
    const distribution = {
        '0-1k': startups.filter(s => (s.revenueSnapshots[0]?.revenue || 0) < 1000).length,
        '1k-10k': startups.filter(s => {
            const r = s.revenueSnapshots[0]?.revenue || 0;
            return r >= 1000 && r < 10000;
        }).length,
        '10k-100k': startups.filter(s => {
            const r = s.revenueSnapshots[0]?.revenue || 0;
            return r >= 10000 && r < 100000;
        }).length,
        '100k+': startups.filter(s => (s.revenueSnapshots[0]?.revenue || 0) >= 100000).length,
    };

    return {
        totalRevenue,
        totalStartups,
        distribution,
    };
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
}

export default async function StatsPage() {
    const stats = await getStats();

    return (
        <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <Badge variant="secondary" className="mb-4">
                        <BarChart3 className="h-3 w-3 mr-2" />
                        Live Data
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Startup Statistics
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Live data from {formatCurrency(stats.totalRevenue)} verified revenue across {stats.totalStartups} startups
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                Revenue Distribution
                            </CardTitle>
                            <CardDescription>Startups by revenue bracket</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(stats.distribution).map(([range, count]) => (
                                    <div key={range} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>{range}</span>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${(count / stats.totalStartups) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                Time to Growth
                            </CardTitle>
                            <CardDescription>Average months to milestones</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
                            Coming soon
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                Founder Followers
                            </CardTitle>
                            <CardDescription>Distribution by X audience</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
                            Coming soon
                        </CardContent>
                    </Card>
                </div>

                <Card className="mb-12">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-purple-600" />
                            Global Revenue Map
                        </CardTitle>
                        <CardDescription>Revenue by country</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-[400px] bg-muted/30 rounded-lg m-6">
                        <div className="text-center">
                            <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                            <p className="text-muted-foreground">Global map visualization coming soon</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <FooterElement />
        </div>
    );
}
