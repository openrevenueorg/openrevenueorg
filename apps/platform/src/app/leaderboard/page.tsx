import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, Trophy, Users, DollarSign } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Leaderboard | OpenRevenue',
  description: 'Browse transparent startups ranked by revenue',
};

// Mock data - replace with actual database query
const startups = [
  {
    id: '1',
    rank: 1,
    name: 'DataExpert',
    slug: 'dataexpert',
    logo: '/placeholder-logo.png',
    category: 'Education',
    mrr: 45000,
    arr: 540000,
    customers: 890,
    growthRate: 25.3,
    currency: 'USD',
  },
  {
    id: '2',
    rank: 2,
    name: 'CloudSync Pro',
    slug: 'cloudsync-pro',
    logo: '/placeholder-logo.png',
    category: 'SaaS',
    mrr: 38500,
    arr: 462000,
    customers: 654,
    growthRate: 18.7,
    currency: 'USD',
  },
  {
    id: '3',
    rank: 3,
    name: 'TaskFlow',
    slug: 'taskflow',
    logo: '/placeholder-logo.png',
    category: 'Productivity',
    mrr: 29800,
    arr: 357600,
    customers: 523,
    growthRate: 31.2,
    currency: 'USD',
  },
  // Add more mock startups...
];

function formatCurrency(amount: number) {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}k`;
  }
  return `$${amount}`;
}

export default function LeaderboardPage() {
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
              <Link href="/explore" className="text-sm hover:text-primary">
                Explore
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
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Transparent Startups
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover startups building in public and sharing their revenue
            transparently
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <Badge variant="default" className="cursor-pointer">
            All
          </Badge>
          <Badge variant="outline" className="cursor-pointer">
            SaaS
          </Badge>
          <Badge variant="outline" className="cursor-pointer">
            Education
          </Badge>
          <Badge variant="outline" className="cursor-pointer">
            Productivity
          </Badge>
          <Badge variant="outline" className="cursor-pointer">
            E-commerce
          </Badge>
        </div>

        {/* Leaderboard Table */}
        <div className="space-y-4">
          {startups.map((startup) => (
            <Link href={`/startup/${startup.slug}`} key={startup.id}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Rank */}
                    <div className="md:col-span-1 text-center">
                      <div
                        className={`text-2xl font-bold ${
                          startup.rank === 1
                            ? 'text-yellow-500'
                            : startup.rank === 2
                            ? 'text-gray-400'
                            : startup.rank === 3
                            ? 'text-orange-600'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {startup.rank}
                      </div>
                    </div>

                    {/* Startup Info */}
                    <div className="md:col-span-4 flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={startup.logo} alt={startup.name} />
                        <AvatarFallback>{startup.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{startup.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {startup.category}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          MRR
                        </div>
                        <div className="font-semibold">
                          {formatCurrency(startup.mrr)}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ARR
                        </div>
                        <div className="font-semibold">
                          {formatCurrency(startup.arr)}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Customers
                        </div>
                        <div className="font-semibold">{startup.customers}</div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Growth
                        </div>
                        <div className="font-semibold text-green-600">
                          +{startup.growthRate}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="text-primary hover:underline">
            Load more startups →
          </button>
        </div>
      </div>
    </div>
  );
}
