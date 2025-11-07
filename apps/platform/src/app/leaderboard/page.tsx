import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { TrustBadge } from '@/components/ui/trust-badge';
import { Navbar } from '@/components/navbar';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getStartupLogoUrl } from '@/lib/avatar';

type LeaderboardStartup = Prisma.StartupGetPayload<{
  include: {
    category: true;
    connections: {
      select: {
        trustLevel: true;
        verificationMethod: true;
        lastVerifiedAt: true;
      };
    };
    revenueSnapshots: {
      orderBy: { date: 'desc' };
      take: 1;
    };
    leaderboardEntry: true;
  };
}>;

type LeaderboardStartupSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  category: LeaderboardStartup['category'];
  connections: LeaderboardStartup['connections'];
  latestRevenue: LeaderboardStartup['revenueSnapshots'][number] | null;
  rank: number | null;
  growthRate: number | null;
  githubHandle: string | null;
  twitterHandle: string | null;
};

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 20;

async function getStartups(page: number = 1): Promise<{
  startups: LeaderboardStartupSummary[];
  totalCount: number;
  totalPages: number;
}> {
  try {
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const startupsPromise = prisma.startup.findMany({
        where: { isPublished: true },
        include: {
          category: true,
          connections: {
            select: {
              trustLevel: true,
              verificationMethod: true,
              lastVerifiedAt: true,
            },
          },
          revenueSnapshots: {
            orderBy: { date: 'desc' },
            take: 1,
          },
          leaderboardEntry: true,
        },
        skip,
        take: ITEMS_PER_PAGE,
        orderBy: {
          leaderboardEntry: {
            rank: 'asc',
          },
        },
    }) as Promise<LeaderboardStartup[]>;

    const countPromise = prisma.startup.count({
        where: { isPublished: true },
    });

    const [startups, totalCount] = await Promise.all([startupsPromise, countPromise]);

    // Sort by rank if available
    const startupsWithRank = startups
      .filter((startup) => startup.leaderboardEntry?.rank)
      .sort(
        (a, b) =>
          (a.leaderboardEntry?.rank ?? Number.POSITIVE_INFINITY) -
          (b.leaderboardEntry?.rank ?? Number.POSITIVE_INFINITY)
      );
    
    const startupsWithoutRank = startups.filter((startup) => !startup.leaderboardEntry?.rank);

    return {
      startups: [...startupsWithRank, ...startupsWithoutRank].map<LeaderboardStartupSummary>(
        (startup) => ({
        id: startup.id,
        name: startup.name,
        slug: startup.slug,
        description: startup.description,
        logo: startup.logo,
        website: startup.website,
        category: startup.category,
        connections: startup.connections,
          latestRevenue: startup.revenueSnapshots[0] ?? null,
          rank: startup.leaderboardEntry?.rank ?? null,
          growthRate: startup.leaderboardEntry?.growthRate ?? null,
          githubHandle: startup.githubHandle ?? null,
          twitterHandle: startup.twitterHandle ?? null,
        })
      ),
      totalCount,
      totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
    };
  } catch (error) {
    console.error('Error fetching startups:', error);
    return {
      startups: [],
      totalCount: 0,
      totalPages: 0,
    };
  }
}

function formatCurrency(amount: number) {
  if (amount >= 1000000) {
    return `$${(amount / 1000000)?.toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000)?.toFixed(0)}k`;
  }
  return `$${amount}`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { page?: string };
}): Promise<Metadata> {
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const { totalCount, totalPages } = await getStartups(page);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://openrevenue.org';
  const currentUrl = page > 1 ? `${baseUrl}/leaderboard?page=${page}` : `${baseUrl}/leaderboard`;

  return {
    metadataBase: new URL(baseUrl),
    title: `Revenue Leaderboard | OpenRevenue${page > 1 ? ` (Page ${page})` : ''}`,
    description: `Discover ${totalCount} transparent startups ranked by revenue. See which startups are building in public and sharing their revenue data.${page > 1 ? ` Page ${page} of ${totalPages}.` : ''}`,
    keywords: [
      'startup leaderboard',
      'revenue rankings',
      'transparent startups',
      'revenue transparency',
      'startup rankings',
    ],
    openGraph: {
      title: `Revenue Leaderboard | OpenRevenue${page > 1 ? ` (Page ${page})` : ''}`,
      description: `Discover ${totalCount} transparent startups ranked by revenue.${page > 1 ? ` Page ${page} of ${totalPages}.` : ''}`,
      type: 'website',
      url: currentUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Revenue Leaderboard | OpenRevenue${page > 1 ? ` (Page ${page})` : ''}`,
      description: `Discover ${totalCount} transparent startups ranked by revenue.${page > 1 ? ` Page ${page} of ${totalPages}.` : ''}`,
    },
    alternates: {
      canonical: page === 1 ? `${baseUrl}/leaderboard` : currentUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const rawPage = parseInt(searchParams?.page || '1', 10);
  const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
  const { startups, totalPages, totalCount } = await getStartups(page);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

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
            Discover {totalCount} startups building in public and sharing their revenue
            transparently
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <Badge variant="default" className="cursor-pointer">
            All
          </Badge>
          <Badge variant="outline" className="cursor-pointer">
            Verified Only
          </Badge>
          <Badge variant="outline" className="cursor-pointer">
            Self-Reported
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
        {startups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No startups found yet.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4 mb-8">
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
                            {startup.rank || '-'}
                          </div>
                        </div>

                        {/* Startup Info */}
                        <div className="md:col-span-4 flex items-center gap-4">
                          {/* <Avatar className="h-12 w-12">
                            <AvatarImage src={startup.logo} alt={startup.name} />
                            <AvatarFallback>{startup.name}</AvatarFallback>
                          </Avatar> */}
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={getStartupLogoUrl({
                                logo: startup.logo,
                                githubHandle: startup.githubHandle,
                                twitterHandle: startup.twitterHandle,
                                name: startup.name,
                                slug: startup.slug,
                              })}
                              alt={startup.name}
                            />
                            <AvatarFallback>{startup.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{startup.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {startup.category?.name}
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-4">
                          {startup.latestRevenue?.mrr && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">MRR</div>
                              <div className="font-semibold">
                                {formatCurrency(startup.latestRevenue.mrr)}
                              </div>
                            </div>
                          )}
                          {startup.latestRevenue?.revenue && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Revenue</div>
                              <div className="font-semibold">
                                {formatCurrency(startup.latestRevenue.revenue)}
                              </div>
                            </div>
                          )}
                          {startup.latestRevenue?.customerCount && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Customers</div>
                              <div className="font-semibold">
                                {startup.latestRevenue.customerCount}
                              </div>
                            </div>
                          )}
                          {startup.growthRate && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Growth</div>
                              <div className="font-semibold text-green-600">
                                +{startup.growthRate?.toFixed(1)}%
                              </div>
                            </div>
                          )}
                          {startup.connections && startup.connections.length > 0 && (
                            <div className="col-span-2 md:col-span-4">
                              <TrustBadge
                                trustLevel={startup.connections[0].trustLevel}
                            verificationMethod={startup.connections[0].verificationMethod ?? undefined}
                                size="sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Link
                  href={page > 1 ? `/leaderboard?page=${page - 1}` : '#'}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-colors ${
                    page <= 1
                      ? 'opacity-50 cursor-not-allowed pointer-events-none'
                      : 'hover:bg-muted'
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Link>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <Link
                        key={pageNum}
                        href={`/leaderboard?page=${pageNum}`}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                          page === pageNum
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'hover:bg-muted'
                        }`}
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={page === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                <Link
                  href={page < totalPages ? `/leaderboard?page=${page + 1}` : '#'}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-colors ${
                    page >= totalPages
                      ? 'opacity-50 cursor-not-allowed pointer-events-none'
                      : 'hover:bg-muted'
                  }`}
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {/* Results info */}
            <div className="text-center text-sm text-muted-foreground mt-6">
              Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, totalCount)}-
              {Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount} startups
            </div>
          </>
        )}
      </div>
    </div>
  );
}