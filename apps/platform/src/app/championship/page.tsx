import { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { FooterElement } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Flag, TrendingUp } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getStartupLogoUrl } from '@/lib/avatar';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Startup Olympics | OpenRevenue',
    description: 'Country leaderboard by total startup revenue.',
};

export const dynamic = 'force-dynamic';

async function getCountryStats() {
    const startups = await prisma.startup.findMany({
        where: { isPublished: true },
        include: {
            category: true,
            revenueSnapshots: {
                orderBy: { date: 'desc' },
                take: 1,
            },
        },
    });

    // Group by country
    const countryMap = new Map<string, {
        code: string;
        totalRevenue: number;
        startups: typeof startups;
    }>();

    for (const startup of startups) {
        const countryCode = startup.country || 'US'; // Default to US if unknown for now
        const revenue = startup.revenueSnapshots[0]?.revenue || 0;

        if (!countryMap.has(countryCode)) {
            countryMap.set(countryCode, {
                code: countryCode,
                totalRevenue: 0,
                startups: [],
            });
        }

        const entry = countryMap.get(countryCode)!;
        entry.totalRevenue += revenue;
        entry.startups.push(startup);
    }

    // Sort countries by revenue
    const sortedCountries = Array.from(countryMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Sort startups within countries
    sortedCountries.forEach(country => {
        country.startups.sort((a, b) => (b.revenueSnapshots[0]?.revenue || 0) - (a.revenueSnapshots[0]?.revenue || 0));
    });

    return sortedCountries;
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Helper to get flag emoji (simple version)
function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

// Helper to get country name (simple version)
const COUNTRY_NAMES: Record<string, string> = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'FR': 'France',
    'DE': 'Germany',
    'CA': 'Canada',
    'AU': 'Australia',
    'IN': 'India',
    'JP': 'Japan',
    'BR': 'Brazil',
    // Add more as needed
};

export default async function ChampionshipPage() {
    const countries = await getCountryStats();

    return (
        <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <Badge variant="secondary" className="mb-4">
                        <Trophy className="h-3 w-3 mr-2" />
                        Startup Olympics
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        World Championship
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Which country builds the most profitable startups?
                    </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-8">
                    {countries.map((country, index) => (
                        <Card key={country.code} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background shadow-sm text-2xl">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl flex items-center gap-2">
                                                <span className="text-3xl">{getFlagEmoji(country.code)}</span>
                                                {COUNTRY_NAMES[country.code] || country.code}
                                            </CardTitle>
                                            <p className="text-muted-foreground">
                                                {country.startups.length} startups · {formatCurrency(country.totalRevenue)} total revenue
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm text-muted-foreground mb-1">Market Share</div>
                                        <div className="font-bold text-lg">
                                            {/* Placeholder for market share calculation */}
                                            {((country.totalRevenue / countries.reduce((acc, c) => acc + c.totalRevenue, 0)) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {country.startups.slice(0, 5).map((startup) => (
                                        <Link href={`/startup/${startup.slug}`} key={startup.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={getStartupLogoUrl({
                                                    logo: startup.logo,
                                                    name: startup.name,
                                                    slug: startup.slug
                                                })} />
                                                <AvatarFallback>{startup.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{startup.name}</div>
                                                <div className="text-xs text-muted-foreground">{startup.category?.name}</div>
                                            </div>
                                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden hidden sm:block">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${Math.min(100, ((startup.revenueSnapshots[0]?.revenue || 0) / country.totalRevenue) * 100)}%` }}
                                                />
                                            </div>
                                            <div className="font-semibold text-sm">
                                                {formatCurrency(startup.revenueSnapshots[0]?.revenue || 0)}
                                            </div>
                                        </Link>
                                    ))}
                                    {country.startups.length > 5 && (
                                        <div className="p-3 text-center text-sm text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
                                            View all {country.startups.length} startups from {COUNTRY_NAMES[country.code] || country.code}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <FooterElement />
        </div>
    );
}
