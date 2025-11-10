import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, DollarSign, Users } from 'lucide-react';
import { TrustBadge } from '@/components/ui/trust-badge';
import { Navbar } from '@/components/navbar';
import { ShareButton } from '@/components/share-button';
import { SocialLinks } from '@/components/social-links';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { FooterElement } from '@/components/footer';
import { getUserAvatarUrl } from '@/lib/avatar';

type FounderProfile = Prisma.UserGetPayload<{
  include: {
    startups: {
      where: { isPublished: true };
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
    };
  };
}>;

export const dynamic = 'force-dynamic';

async function getFounder(username: string): Promise<FounderProfile | null> {
  try {
    // Try to find user by name (converted to slug) or email prefix
    const allUsers: FounderProfile[] = await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: username.replace(/-/g, ' '),
              mode: 'insensitive',
            },
          },
          {
            email: {
              startsWith: username.replace(/@/g, ''),
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        startups: {
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
        },
      },
    });

    // If no user found, try finding by matching slug pattern from name
    if (allUsers.length === 0) {
      // Generate slug from username and try matching
      const normalizedUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
      const users: FounderProfile[] = await prisma.user.findMany({
        include: {
          startups: {
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
          },
        },
      });

      const matchedUser = users.find((user) => {
        if (user.name) {
          const nameSlug = user.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          return nameSlug === normalizedUsername;
        }
        if (user.email) {
          const emailPrefix = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          return emailPrefix === normalizedUsername;
        }
        return false;
      });

      if (matchedUser) {
        return matchedUser;
      }
    }

    return allUsers[0] || null;
  } catch (error) {
    console.error('Error fetching founder:', error);
    return null;
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

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const founder = await getFounder(params.username);
  
  if (!founder) {
    return {
      title: 'Founder Not Found | OpenRevenue',
    };
  }

  const displayName = founder.name || founder.email?.split('@')[0] || 'Founder';
  const totalRevenue = founder.startups.reduce((sum: number, startup: { revenueSnapshots: { revenue: number; }[]; }) => {
    const latest = startup.revenueSnapshots[0];
    if (latest) {
      return sum + (latest.revenue || 0);
    }
    return sum;
  }, 0);
  const startupCount = founder.startups.length;
  const totalCustomers = founder.startups.reduce((sum: number, startup: { revenueSnapshots: { customerCount: number | null; }[]; }) => {
    const latest = startup.revenueSnapshots[0];
    return sum + (latest?.customerCount ?? 0);
  }, 0);

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://openrevenue.org'),
    title: `${displayName} | Founders | OpenRevenue`,
    description: `${displayName} has ${startupCount} startup${startupCount !== 1 ? 's' : ''} with ${formatCurrency(totalRevenue)} total revenue and ${totalCustomers} total customers`,
    openGraph: {
      title: `${displayName} | Founders | OpenRevenue`,
      description: `${displayName} has ${startupCount} startup${startupCount !== 1 ? 's' : ''} with ${formatCurrency(totalRevenue)} total revenue`,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${displayName} | Founders | OpenRevenue`,
      description: `${displayName} has ${startupCount} startup${startupCount !== 1 ? 's' : ''} with ${formatCurrency(totalRevenue)} total revenue`,
    },
  };
}

export default async function FounderPage({ params }: { params: { username: string } }) {
  const founder = await getFounder(params.username);

  if (!founder) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <h1 className="text-2xl font-bold mb-2">Founder Not Found</h1>
              <p className="text-muted-foreground">The founder you&apos;re looking for doesn&apos;t exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const displayName = founder.name || founder.email?.split('@')[0] || 'Founder';
  const username = createUsernameSlug(founder.name, founder.email);
  
  // Calculate stats
  const startupsWithRevenue = founder.startups.filter( (startup: { revenueSnapshots: { revenue: number; }[]; }) => startup.revenueSnapshots.length > 0 );
  const totalRevenue = founder.startups.reduce((sum: number, startup: { revenueSnapshots: { revenue: number; }[]; }) => {
    const latest = startup.revenueSnapshots[0];
    if (latest) {
      return sum + (latest.revenue ?? 0);
    }
    return sum;
  }, 0);
  
  // Last 30 days revenue
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30DaysRevenue = founder.startups.reduce((sum: number, startup: { revenueSnapshots: { date: Date; revenue: number; }[]; }) => {
    const recent = startup.revenueSnapshots.filter((snapshot: { date: Date; revenue: number; }) => {
      const date = new Date(snapshot.date);
      return date >= thirtyDaysAgo;
    });
    return (
      sum +
      recent.reduce((partialSum: number, snapshot: { revenue: number; }) => partialSum + snapshot.revenue, 0)
    );
  }, 0);

  // Total MRR (sum of latest MRR from each startup)
  const totalMRR = founder.startups.reduce((sum: number, startup: { revenueSnapshots: { mrr: number | null; }[]; }) => {
    const latest = startup.revenueSnapshots[0];
    return sum + (latest?.mrr ?? 0);
  }, 0);

  // Total customers
  const totalCustomers = founder.startups.reduce((sum: number, startup: { revenueSnapshots: { customerCount: number | null; }[]; }) => {
    const latest = startup.revenueSnapshots[0];
    return sum + (latest?.customerCount ?? 0);
  }, 0);

  // Get recent revenue (last snapshot date)

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://openrevenue.org'}/founder/${username}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
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
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-1">@{username}</h1>
                {founder.name && (
                  <p className="text-muted-foreground">{founder.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShareButton url={shareUrl} title={`${displayName} on OpenRevenue`} />
              <SocialLinks
                socialLinks={{
                  twitter: founder.twitter ?? undefined,
                  linkedin: founder.linkedin ?? undefined,
                  github: founder.github ?? undefined,
                  instagram: founder.instagram ?? undefined,
                  facebook: founder.facebook ?? undefined,
                  youtube: founder.youtube ?? undefined,
                  tiktok: founder.tiktok ?? undefined,
                  threads: founder.threads ?? undefined,
                  medium: founder.medium ?? undefined,
                  website: founder.website ?? undefined,
                }}
              />
            </div>
          </div>

          <p className="text-muted-foreground">
            {startupsWithRevenue.length} startup{startupsWithRevenue.length !== 1 ? 's' : ''} with verified revenue
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Total revenue</div>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <div className="text-xs text-muted-foreground mt-1">Across all startups</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Last 30 days</div>
              <div className="text-2xl font-bold">{formatCurrency(last30DaysRevenue)}</div>
              <div className="text-xs text-muted-foreground mt-1">Recent revenue</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Total MRR</div>
              <div className="text-2xl font-bold">{formatCurrency(totalMRR)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalMRR > 0 ? 'Work in progress' : 'No MRR data'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Startups</div>
              <div className="text-2xl font-bold">{founder.startups.length}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalCustomers > 0 ? `${totalCustomers} total customers` : 'No customers'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Startups List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Startups by @{username}</h2>
          {founder.startups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No published startups yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {founder.startups.map((startup: { id: string; slug: string; logo: string | null; name: string; category: { name: string; } | null; connections: { trustLevel: string; verificationMethod: string | null; }[]; revenueSnapshots: { revenue: number; mrr: number | null; customerCount: number | null; currency: string; }[]; }) => {
                const latestRevenue = startup.revenueSnapshots[0];
                const hasVerifiedConnection = startup.connections.some(
                  (c) => c.trustLevel === 'PLATFORM_VERIFIED'
                );

                return (
                  <Link href={`/startup/${startup.slug}`} key={startup.id}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={startup.logo || undefined} alt={startup.name} />
                              <AvatarFallback>{startup.name}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{startup.name}</h3>
                              {startup.category && (
                                <p className="text-sm text-muted-foreground">
                                  {startup.category.name}
                                </p>
                              )}
                              {hasVerifiedConnection && (
                                <div className="mt-2">
                                  <TrustBadge
                                    trustLevel="PLATFORM_VERIFIED"
                                    verificationMethod={startup.connections[0]?.verificationMethod || undefined}
                                    size="sm"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {latestRevenue && (
                            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  Revenue
                                </div>
                                <div className="font-semibold text-sm">
                                  {formatCurrency(latestRevenue.revenue, latestRevenue.currency || 'USD')}
                                </div>
                              </div>

                              {latestRevenue.mrr && (
                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    MRR
                                  </div>
                                  <div className="font-semibold text-sm">
                                    {formatCurrency(latestRevenue.mrr, latestRevenue.currency || 'USD')}
                                  </div>
                                </div>
                              )}

                              {latestRevenue.customerCount && (
                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                                    <Users className="h-3 w-3" />
                                    Customers
                                  </div>
                                  <div className="font-semibold text-sm">
                                    {latestRevenue.customerCount}
                                  </div>
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
          )}
        </div>
      </div>

      {/* Footer */}
      <FooterElement />
    </div>
  );
}
