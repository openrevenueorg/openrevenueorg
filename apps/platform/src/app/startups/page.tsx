import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, Trophy, Users, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 12;

async function getStartups(page: number = 1) {
  try {
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const [startups, totalCount] = await Promise.all([
      prisma.startup.findMany({
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
          revenueSnapshots: {
            _count: 'desc',
          },
        },
      }),
      prisma.startup.count({
        where: { isPublished: true },
      }),
    ]);

    return {
      startups: startups.map((startup: any) => ({
        id: startup.id,
        name: startup.name,
        slug: startup.slug,
        description: startup.description,
        logo: startup.logo,
        website: startup.website,
        category: startup.category,
        connections: startup.connections,
        latestRevenue: startup.revenueSnapshots[0] || null,
        rank: startup.leaderboardEntry?.rank || null,
        growthRate: startup.leaderboardEntry?.growthRate || null,
      })),
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
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}k`;
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
  const currentUrl = page > 1 ? `${baseUrl}/startups?page=${page}` : `${baseUrl}/startups`;

  return {
    metadataBase: new URL(baseUrl),
    title: `Startups Directory | OpenRevenue${page > 1 ? ` (Page ${page})` : ''}`,
    description: `Browse ${totalCount} transparent startups sharing their revenue. Discover startups building in public.${page > 1 ? ` Page ${page} of ${totalPages}.` : ''}`,
    keywords: [
      'startup directory',
      'transparent startups',
      'revenue transparency',
      'startup listings',
      'open revenue',
    ],
    openGraph: {
      title: `Startups Directory | OpenRevenue${page > 1 ? ` (Page ${page})` : ''}`,
      description: `Browse ${totalCount} transparent startups sharing their revenue.${page > 1 ? ` Page ${page} of ${totalPages}.` : ''}`,
      type: 'website',
      url: currentUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Startups Directory | OpenRevenue${page > 1 ? ` (Page ${page})` : ''}`,
      description: `Browse ${totalCount} transparent startups sharing their revenue.${page > 1 ? ` Page ${page} of ${totalPages}.` : ''}`,
    },
    alternates: {
      canonical: page === 1 ? `${baseUrl}/startups` : currentUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function StartupsPage({
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
            Startups Directory
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

        {/* Startups Grid */}
        {startups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No startups found yet.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {startups.map((startup: any) => (
                <Link href={`/startup/${startup.slug}`} key={startup.id}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={startup.logo} alt={startup.name} />
                            <AvatarFallback>{startup.name}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">{startup.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {startup.category?.name}
                            </div>
                          </div>
                          {startup.rank && (
                            <div className="text-muted-foreground text-sm">#{startup.rank}</div>
                          )}
                        </div>

                        {startup.latestRevenue && (
                          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                            {startup.latestRevenue.revenue && (
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  Revenue
                                </div>
                                <div className="font-semibold text-sm">
                                  {formatCurrency(startup.latestRevenue.revenue)}
                                </div>
                              </div>
                            )}

                            {startup.latestRevenue.mrr && (
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  MRR
                                </div>
                                <div className="font-semibold text-sm">
                                  {formatCurrency(startup.latestRevenue.mrr)}
                                </div>
                              </div>
                            )}

                            {startup.latestRevenue.customerCount && (
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Customers
                                </div>
                                <div className="font-semibold text-sm">
                                  {startup.latestRevenue.customerCount}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
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
                  href={page > 1 ? `/startups?page=${page - 1}` : '#'}
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
                        href={`/startups?page=${pageNum}`}
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
                  href={page < totalPages ? `/startups?page=${page + 1}` : '#'}
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
