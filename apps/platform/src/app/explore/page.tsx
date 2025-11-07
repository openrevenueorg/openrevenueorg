import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight, Crown, Award, Medal, Star } from 'lucide-react';
import { TrustBadge } from '@/components/ui/trust-badge';
import { Navbar } from '@/components/navbar';
import { prisma } from '@/lib/prisma';
import { getStartupLogoUrl } from '@/lib/avatar';

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
        isFeatured: startup.isFeatured,
        tier: startup.tier,
        githubHandle: startup.githubHandle,
        twitterHandle: startup.twitterHandle,
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

function formatCurrency(amount?: number, currency: string = 'USD') {
  if (amount === undefined || amount === null) return 'N/A';
  if (amount >= 1000000) {
    return `$${(amount / 1000000)?.toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000)?.toFixed(0)}k`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { page?: string };
}): Promise<Metadata> {
  const page = Math.max(1, parseInt((await searchParams)?.page || '1', 10));
  const { totalCount, totalPages } = await getStartups(page);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://openrevenue.org';
  const currentUrl = page > 1 ? `${baseUrl}/explore?page=${page}` : `${baseUrl}/explore`;

  return {
    metadataBase: new URL(baseUrl),
    title: `Explore Startups | OpenRevenue${page > 1 ? ` (Page ${page})` : ''}`,
    description: `Discover ${totalCount} startups building in public and sharing their revenue transparently.${page > 1 ? ` Page ${page} of ${totalPages}.` : ''}`,
    keywords: [
      'startup directory',
      'revenue transparency',
      'startup discovery',
      'open revenue',
      'transparent startups',
    ],
    openGraph: {
      title: `Explore Startups | OpenRevenue${page > 1 ? ` (Page ${page})` : ''}`,
      description: `Discover ${totalCount} startups building in public and sharing their revenue transparently.${page > 1 ? ` Page ${page} of ${totalPages}.` : ''}`,
      type: 'website',
      url: currentUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Explore Startups | OpenRevenue${page > 1 ? ` (Page ${page})` : ''}`,
      description: `Discover ${totalCount} startups building in public.${page > 1 ? ` Page ${page} of ${totalPages}.` : ''}`,
    },
    alternates: {
      canonical: page === 1 ? `${baseUrl}/explore` : currentUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const rawPage = parseInt((await searchParams)?.page || '1', 10);
  const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
  const { startups, totalPages, totalCount } = await getStartups(page);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

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
            Browse {totalCount} startups building in public and sharing their revenue
            transparently
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4"></div>

        {/* Results Grid */}
        {startups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No startups found. Be the first to join!
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
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{startup.name}</h3>

                            {/* Featured & Tier Badges */}
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {startup.isFeatured && (
                                <Badge variant="default" className="text-xs bg-yellow-600 hover:bg-yellow-700">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              {startup.tier === 'GOLD' && (
                                <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-600">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Gold
                                </Badge>
                              )}
                              {startup.tier === 'SILVER' && (
                                <Badge variant="outline" className="text-xs border-gray-400 text-gray-400">
                                  <Award className="h-3 w-3 mr-1" />
                                  Silver
                                </Badge>
                              )}
                              {startup.tier === 'BRONZE' && (
                                <Badge variant="outline" className="text-xs border-orange-600 text-orange-600">
                                  <Medal className="h-3 w-3 mr-1" />
                                  Bronze
                                </Badge>
                              )}
                            </div>

                            {startup.category && (
                              <p className="text-sm text-muted-foreground mt-1">
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

                        {startup.latestRevenue && (
                          <div className="pt-4 border-t">
                            <div className="text-sm font-semibold">
                              {formatCurrency(
                                startup.latestRevenue.revenue,
                                startup.latestRevenue.currency || 'USD'
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">Latest revenue</div>
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
                  href={page > 1 ? `/explore?page=${page - 1}` : '#'}
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
                        href={`/explore?page=${pageNum}`}
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
                  href={page < totalPages ? `/explore?page=${page + 1}` : '#'}
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

