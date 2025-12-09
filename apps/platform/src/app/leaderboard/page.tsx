import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { TrustBadge } from '@/components/ui/trust-badge';
import { ProviderBadge } from '@/components/ui/provider-badge';
import { Navbar } from '@/components/navbar';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getStartupLogoUrl } from '@/lib/avatar';
import { FooterElement } from '@/components/footer';

type LeaderboardStartup = Prisma.StartupGetPayload<{
  include: {
    category: true;
    user: {
      select: {
        id: true;
        name: true;
        image: true;
      };
    };
    connections: {
      select: {
        trustLevel: true;
        verificationMethod: true;
        lastVerifiedAt: true;
        provider: true;
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
  founder: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  providers: string[];
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 20;

async function getCategories(): Promise<Category[]> {
  try {
    return await prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
  } catch {
    return [];
  }
}

async function getStartups(
  page: number = 1,
  categorySlug?: string,
  trustLevel?: string
): Promise<{
  startups: LeaderboardStartupSummary[];
  totalCount: number;
  totalPages: number;
}> {
  try {
    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Build where clause
    const where: Prisma.StartupWhereInput = { isPublished: true };

    if (categorySlug && categorySlug !== 'all') {
      where.category = { slug: categorySlug };
    }

    if (trustLevel === 'verified') {
      where.connections = {
        some: { trustLevel: 'PLATFORM_VERIFIED' }
      };
    } else if (trustLevel === 'self-reported') {
      where.connections = {
        every: { trustLevel: 'SELF_REPORTED' }
      };
    }

    const startupsPromise = prisma.startup.findMany({
      where,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        connections: {
          select: {
            trustLevel: true,
            verificationMethod: true,
            lastVerifiedAt: true,
            provider: true,
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

    const countPromise = prisma.startup.count({ where });

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
          founder: startup.user ? {
            id: startup.user.id,
            name: startup.user.name,
            image: startup.user.image,
          } : null,
          providers: startup.connections.map(c => c.provider).filter(Boolean),
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
  searchParams?: { page?: string; category?: string; trust?: string };
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
  searchParams?: { page?: string; category?: string; trust?: string };
}) {
  const rawPage = parseInt(searchParams?.page || '1', 10);
  const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
  const categorySlug = searchParams?.category;
  const trustLevel = searchParams?.trust;

  const [{ startups, totalPages, totalCount }, categories] = await Promise.all([
    getStartups(page, categorySlug, trustLevel),
    getCategories(),
  ]);

  // Build filter URL helper
  const buildFilterUrl = (newCategory?: string, newTrust?: string) => {
    const params = new URLSearchParams();
    const cat = newCategory !== undefined ? newCategory : categorySlug;
    const trust = newTrust !== undefined ? newTrust : trustLevel;

    if (cat && cat !== 'all') params.set('category', cat);
    if (trust && trust !== 'all') params.set('trust', trust);

    const queryString = params.toString();
    return queryString ? `/leaderboard?${queryString}` : '/leaderboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      <div className="container mx-auto px-4 py-12 pt-28">
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
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Filter className="h-4 w-4" />
            <span>Filter by</span>
          </div>

          {/* Trust Level Filters */}
          <div className="flex gap-2 flex-wrap">
            <Link href={buildFilterUrl(undefined, 'all')}>
              <Badge
                variant={!trustLevel || trustLevel === 'all' ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
              >
                All
              </Badge>
            </Link>
            <Link href={buildFilterUrl(undefined, 'verified')}>
              <Badge
                variant={trustLevel === 'verified' ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
              >
                ✓ Verified Only
              </Badge>
            </Link>
            <Link href={buildFilterUrl(undefined, 'self-reported')}>
              <Badge
                variant={trustLevel === 'self-reported' ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
              >
                Self-Reported
              </Badge>
            </Link>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            <Link href={buildFilterUrl('all', undefined)}>
              <Badge
                variant={!categorySlug || categorySlug === 'all' ? 'secondary' : 'outline'}
                className="cursor-pointer hover:bg-secondary/80 transition-colors"
              >
                All Categories
              </Badge>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={buildFilterUrl(cat.slug, undefined)}>
                <Badge
                  variant={categorySlug === cat.slug ? 'secondary' : 'outline'}
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                >
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        {startups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No startups found matching your filters.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {startups.map((startup) => (
                <Link href={`/startup/${startup.slug}`} key={startup.id}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/30">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Rank */}
                        <div className="md:col-span-1 text-center">
                          <div
                            className={`text-2xl font-bold ${startup.rank === 1
                              ? 'text-yellow-500'
                              : startup.rank === 2
                                ? 'text-gray-400'
                                : startup.rank === 3
                                  ? 'text-orange-600'
                                  : 'text-muted-foreground'
                              }`}
                          >
                            {startup.rank ? `#${startup.rank}` : '-'}
                          </div>
                        </div>

                        {/* Startup Info with Founder Avatar */}
                        <div className="md:col-span-4 flex items-center gap-4">
                          <div className="relative">
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
                            {/* Founder avatar overlay */}
                            {startup.founder?.image && (
                              <Avatar className="h-6 w-6 absolute -bottom-1 -right-1 border-2 border-background">
                                <AvatarImage src={startup.founder.image} alt={startup.founder.name || 'Founder'} />
                                <AvatarFallback className="text-[10px]">
                                  {startup.founder.name?.charAt(0) || 'F'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">{startup.name}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {startup.category?.name && (
                                <span>{startup.category.name}</span>
                              )}
                              {startup.founder?.name && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">by {startup.founder.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stats with Provider Badges */}
                        <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-5 gap-4">
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
                              <div className={`font-semibold ${startup.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {startup.growthRate > 0 ? '+' : ''}{startup.growthRate?.toFixed(1)}%
                              </div>
                            </div>
                          )}

                          {/* Trust & Provider Badges */}
                          <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                            {startup.connections && startup.connections.length > 0 && (
                              <TrustBadge
                                trustLevel={startup.connections[0].trustLevel}
                                verificationMethod={startup.connections[0].verificationMethod ?? undefined}
                                size="sm"
                              />
                            )}
                            {startup.providers.length > 0 && (
                              <div className="flex gap-1">
                                {startup.providers.slice(0, 3).map((provider, idx) => (
                                  <ProviderBadge key={idx} provider={provider} size="sm" />
                                ))}
                              </div>
                            )}
                          </div>
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
                  href={page > 1 ? `${buildFilterUrl()}${buildFilterUrl().includes('?') ? '&' : '?'}page=${page - 1}` : '#'}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-colors ${page <= 1
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
                        href={`${buildFilterUrl()}${buildFilterUrl().includes('?') ? '&' : '?'}page=${pageNum}`}
                        className={`px-3 py-2 rounded-lg border transition-colors ${page === pageNum
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
                  href={page < totalPages ? `${buildFilterUrl()}${buildFilterUrl().includes('?') ? '&' : '?'}page=${page + 1}` : '#'}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-colors ${page >= totalPages
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

      <FooterElement />
    </div>
  );
}