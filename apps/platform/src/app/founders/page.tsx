import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { SocialLinks } from '@/components/social-links';
import { prisma } from '@/lib/prisma';
import { FooterElement } from '@/components/footer';
import { getUserAvatarUrl } from '@/lib/avatar';

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 12;

interface FounderWithStats {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  twitter: string | null;
  linkedin: string | null;
  github: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  tiktok: string | null;
  threads: string | null;
  medium: string | null;
  website: string | null;
  startups: Array<{
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    revenueSnapshots: Array<{
      revenue: number;
      mrr: number | null;
      customerCount: number | null;
      currency: string;
    }>;
  }>;
}

async function getFounders(page: number = 1) {
  try {
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const [founders, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: {
          startups: {
            some: {
              isPublished: true,
            },
          },
        },
        include: {
          startups: {
            where: { isPublished: true },
            include: {
              revenueSnapshots: {
                orderBy: { date: 'desc' },
                take: 1,
              },
            },
          },
        },
        skip,
        take: ITEMS_PER_PAGE,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({
        where: {
          startups: {
            some: {
              isPublished: true,
            },
          },
        },
      }),
    ]);

    return {
      founders: founders as FounderWithStats[],
      totalCount,
      totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
    };
  } catch (error) {
    console.error('Error fetching founders:', error);
    return {
      founders: [],
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

function createUsernameSlug(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  if (email) {
    return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
  return 'unknown';
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { page?: string };
}): Promise<Metadata> {
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const { totalCount, totalPages } = await getFounders(page);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://openrevenue.org';
  const currentUrl = page > 1 ? `${baseUrl}/founders?page=${page}` : `${baseUrl}/founders`;

  const alternates: Metadata['alternates'] = {
    canonical: page === 1 ? `${baseUrl}/founders` : currentUrl,
  };

  // Add pagination links for SEO
  if (page > 1) {
    alternates.languages = {
      'x-default': page === 2 ? `${baseUrl}/founders` : `${baseUrl}/founders?page=${page - 1}`,
    };
  }

  return {
    metadataBase: new URL(baseUrl),
    title: `Founders | OpenRevenue - ${totalCount} Startup Founders${page > 1 ? ` (Page ${page})` : ''}`,
    description: `Discover ${totalCount} startup founders sharing their revenue transparency on OpenRevenue. Explore verified revenue data from real founders building successful businesses.${page > 1 ? ` Page ${page} of ${totalPages}.` : ''}`,
    keywords: [
      'startup founders',
      'revenue transparency',
      'founder profiles',
      'startup revenue',
      'founder directory',
      'open revenue',
      'startup community',
    ],
    openGraph: {
      title: `Founders | OpenRevenue - ${totalCount} Startup Founders${page > 1 ? ` (Page ${page})` : ''}`,
      description: `Discover ${totalCount} startup founders sharing their revenue transparency on OpenRevenue.${page > 1 ? ` Page ${page} of ${totalPages}.` : ''}`,
      type: 'website',
      url: currentUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Founders | OpenRevenue - ${totalCount} Startup Founders${page > 1 ? ` (Page ${page})` : ''}`,
      description: `Discover ${totalCount} startup founders sharing their revenue transparency.${page > 1 ? ` Page ${page} of ${totalPages}.` : ''}`,
    },
    alternates,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function FoundersPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const rawPage = parseInt(searchParams?.page || '1', 10);
  const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
  const { founders, totalPages, totalCount } = await getFounders(page);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://openrevenue.org';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Startup Founders Directory',
    description: `Discover ${totalCount} startup founders sharing their revenue transparency on OpenRevenue`,
    url: `${baseUrl}/founders`,
    numberOfItems: totalCount,
    itemListElement: founders.slice(0, 10).map((founder, index) => {
      const username = createUsernameSlug(founder.name, founder.email);
      return {
        '@type': 'ListItem',
        position: (page - 1) * ITEMS_PER_PAGE + index + 1,
        item: {
          '@type': 'Person',
          name: founder.name || founder.email?.split('@')[0] || 'Founder',
          url: `${baseUrl}/founder/${username}`,
        },
      };
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Founders</h1>
          <p className="text-muted-foreground text-lg">
            Discover {totalCount} startup founders sharing their revenue transparency
          </p>
        </div>

        {/* Founders Grid */}
        {founders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No founders found yet.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {founders.map((founder) => {
                const username = createUsernameSlug(founder.name, founder.email);
                const displayName = founder.name || founder.email?.split('@')[0] || 'Founder';

                // Calculate stats
                const startupsWithRevenue = founder.startups.filter(
                  (s) => s.revenueSnapshots.length > 0
                );
                const totalRevenue = founder.startups.reduce((sum, startup) => {
                  const latest = startup.revenueSnapshots[0];
                  if (latest) {
                    return sum + (latest.revenue || 0);
                  }
                  return sum;
                }, 0);

                const totalMRR = founder.startups.reduce((sum, startup) => {
                  const latest = startup.revenueSnapshots[0];
                  return sum + (latest?.mrr || 0);
                }, 0);

                const totalCustomers = founder.startups.reduce((sum, startup) => {
                  const latest = startup.revenueSnapshots[0];
                  return sum + (latest?.customerCount || 0);
                }, 0);

                return (
                  <Link href={`/founder/${username}`} key={founder.id}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer h-full hover:border-primary/50">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Founder Header */}
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={getUserAvatarUrl({
                                  image: founder.image,
                                  email: founder.email,
                                  name: displayName,
                                  id: founder.id,
                                })}
                                alt={displayName}
                              />
                              <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg truncate">@{username}</h3>
                              {founder.name && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {founder.name}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {founder.startups.length} startup
                                {founder.startups.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          {/* Social Links */}
                          <SocialLinks
                            socialLinks={{
                              twitter: (founder as any).twitter,
                              linkedin: (founder as any).linkedin,
                              github: (founder as any).github,
                              instagram: (founder as any).instagram,
                              facebook: (founder as any).facebook,
                              youtube: (founder as any).youtube,
                              tiktok: (founder as any).tiktok,
                              threads: (founder as any).threads,
                              medium: (founder as any).medium,
                              website: (founder as any).website,
                            }}
                            className="justify-start"
                          />

                          {/* Stats */}
                          {startupsWithRevenue.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  Revenue
                                </div>
                                <div className="font-semibold text-sm">
                                  {formatCurrency(totalRevenue)}
                                </div>
                              </div>

                              {totalMRR > 0 && (
                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    MRR
                                  </div>
                                  <div className="font-semibold text-sm">
                                    {formatCurrency(totalMRR)}
                                  </div>
                                </div>
                              )}

                              {totalCustomers > 0 && (
                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                                    <Users className="h-3 w-3" />
                                    Customers
                                  </div>
                                  <div className="font-semibold text-sm">{totalCustomers}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Link
                  href={page > 1 ? `/founders?page=${page - 1}` : '#'}
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
                        href={`/founders?page=${pageNum}`}
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
                  href={page < totalPages ? `/founders?page=${page + 1}` : '#'}
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
              {Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount} founders
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      
      <FooterElement />
      </div>
    </>
  );
}
