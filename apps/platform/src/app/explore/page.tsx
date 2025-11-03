import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  DollarSign,
  Users,
  Search,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { TrustBadge } from '@/components/ui/trust-badge';

export const metadata: Metadata = {
  title: 'Explore | OpenRevenue',
  description: 'Discover transparent startups sharing their revenue',
};

async function getStartups() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/leaderboard`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

function formatCurrency(amount?: number, currency: string = 'USD') {
  if (amount === undefined || amount === null) return 'N/A';
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}k`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function ExplorePage() {
  const startups = await getStartups();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="font-bold text-2xl">
              OpenRevenue
            </Link>
            <div className="flex gap-4 items-center">
              <Link href="/leaderboard" className="text-sm hover:text-primary">
                Leaderboard
              </Link>
              <Link href="/about" className="text-sm hover:text-primary">
                About
              </Link>
              <Link href="/login" className="text-sm hover:text-primary">
                Sign In
              </Link>
            </div>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Search className="h-4 w-4" />
            Explore
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Startups
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse startups building in public and sharing their revenue
            transparently
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search startups..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Category
              </Button>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              All
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Verified Only
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              SaaS
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              E-commerce
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Marketplace
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Other
            </Badge>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No startups found. Be the first to join!
                </CardContent>
              </Card>
            </div>
          ) : (
            startups.map((startup: any) => (
              <Link href={`/startup/${startup.slug}`} key={startup.id}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={startup.logo} alt={startup.name} />
                          <AvatarFallback>{startup.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{startup.name}</h3>
                          {startup.category && (
                            <p className="text-sm text-muted-foreground">
                              {startup.category.name}
                            </p>
                          )}
                          {startup.connections && startup.connections.length > 0 && (
                            <div className="mt-2">
                              <TrustBadge
                                trustLevel={startup.connections[0].trustLevel}
                                verificationMethod={startup.connections[0].verificationMethod}
                                size="sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            MRR
                          </div>
                          <div className="font-semibold text-sm">
                            {formatCurrency(startup.revenueSnapshots[0]?.mrr, startup.revenueSnapshots[0]?.currency || 'USD')}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                            <Users className="h-3 w-3" />
                            Customers
                          </div>
                          <div className="font-semibold text-sm">
                            {startup.revenueSnapshots[0]?.customerCount || 'N/A'}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Growth
                          </div>
                          <div className="font-semibold text-sm text-green-600">
                            {startup.revenueSnapshots[0]?.growthRate ? `+${startup.revenueSnapshots[0]?.growthRate.toFixed(0)}%` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {startups.length > 0 && (
          <div className="flex justify-center gap-2 mt-12">
            <Button variant="outline" disabled>Previous</Button>
            <Button variant="outline">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} OpenRevenue. Open source and free forever.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

