import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { FooterElement } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShoppingBag, Filter, DollarSign } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getStartupLogoUrl } from '@/lib/avatar';
import { TrustBadge } from '@/components/ui/trust-badge';

export const metadata: Metadata = {
    title: 'Acquire Startups | OpenRevenue',
    description: 'Browse verified startups looking for a buyer.',
};

export const dynamic = 'force-dynamic';

async function getStartupsForSale() {
    // In a real app, we would filter by a 'forSale' flag or similar
    // For now, we'll just fetch all and pretend some are for sale or add a mock filter if schema allows
    // Checking schema... Startup model doesn't seem to have 'forSale' in the previous file views.
    // I will assume all for now or just take a subset.

    const startups = await prisma.startup.findMany({
        where: { isPublished: true }, // Add forSale: true if it existed
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

export default async function AcquirePage() {
    const startups = await getStartupsForSale();

    return (
        <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <Badge variant="secondary" className="mb-4">
                        <ShoppingBag className="h-3 w-3 mr-2" />
                        Acquisition Marketplace
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Acquire Profitable Startups
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Browse verified startups looking for a buyer. All revenue metrics are pulled directly from Stripe/LemonSqueezy.
                    </p>
                    <div className="mt-6">
                        <Button size="lg">
                            Sell your startup
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center gap-2 font-semibold">
                                    <Filter className="h-4 w-4" />
                                    Filters
                                </div>

                                <div className="space-y-2">
                                    <Label>Monthly Revenue</Label>
                                    <div className="flex gap-2">
                                        <Input placeholder="Min" type="number" />
                                        <Input placeholder="Max" type="number" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Asking Price</Label>
                                    <div className="flex gap-2">
                                        <Input placeholder="Min" type="number" />
                                        <Input placeholder="Max" type="number" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Categories</Label>
                                    <div className="space-y-2">
                                        {/* Mock categories */}
                                        {['SaaS', 'AI', 'E-commerce', 'DevTools'].map(cat => (
                                            <div key={cat} className="flex items-center gap-2">
                                                <input type="checkbox" id={cat} className="rounded border-gray-300" />
                                                <label htmlFor={cat} className="text-sm">{cat}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button className="w-full" variant="outline">
                                    Apply Filters
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Listings Grid */}
                    <div className="lg:col-span-3">
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-muted-foreground">
                                {startups.length} startups found
                            </div>
                            <div className="flex gap-2">
                                <select className="bg-background border rounded-md px-3 py-1 text-sm" aria-label="Sort listings">
                                    <option>Best deals</option>
                                    <option>Newest</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {startups.map(startup => (
                                <Link href={`/startup/${startup.slug}`} key={startup.id}>
                                    <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarImage src={getStartupLogoUrl({
                                                            logo: startup.logo || undefined,
                                                            name: startup.name,
                                                            slug: startup.slug
                                                        })} />
                                                        <AvatarFallback>{startup.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-semibold group-hover:text-primary transition-colors">{startup.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{startup.category?.name}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
                                                    FOR SALE
                                                </Badge>
                                            </div>

                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                {startup.description}
                                            </p>

                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        Revenue (MRR)
                                                    </div>
                                                    <div className="font-semibold">
                                                        {formatCurrency(startup.revenueSnapshots[0]?.mrr || startup.revenueSnapshots[0]?.revenue)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        Asking Price
                                                    </div>
                                                    <div className="font-semibold">
                                                        {/* Mock asking price logic: 12x MRR */}
                                                        {formatCurrency((startup.revenueSnapshots[0]?.mrr || 0) * 12)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
                                                <div className="text-muted-foreground">
                                                    Multiple: <span className="font-medium text-foreground">1.0x</span>
                                                </div>
                                                {startup.connections[0] && (
                                                    <TrustBadge
                                                        trustLevel={startup.connections[0].trustLevel}
                                                        verificationMethod={startup.connections[0].verificationMethod || undefined}
                                                        size="sm"
                                                    />
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <FooterElement />
        </div>
    );
}
