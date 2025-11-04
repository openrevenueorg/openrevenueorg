import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrustBadge } from '@/components/ui/trust-badge';
import {
  ArrowRight,
  Shield,
  TrendingUp,
  Lock,
  Server,
  Zap,
  Globe,
  Check,
  Users,
  DollarSign,
  BarChart3,
  Github,
  Mail,
  MessageSquare,
  Award,
  Clock,
  ExternalLink,
  Sparkles,
  Code,
  Database,
  Key,
  LineChart,
  Star,
  Quote,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://openrevenue.org'),
  title: 'OpenRevenue - Transparent Revenue Verification for Startups',
  description:
    'Open-source alternative to TrustMRR. Verify and showcase your startup revenue transparently with cryptographic verification and self-hosting options.',
  keywords: [
    'revenue verification',
    'transparent startup',
    'MRR tracking',
    'ARR tracking',
    'open source',
    'revenue transparency',
    'startup metrics',
    'cryptographic verification',
    'self-hosted',
    'trustmrr alternative',
  ],
  authors: [{ name: 'OpenRevenue' }],
  creator: 'OpenRevenue',
  publisher: 'OpenRevenue',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://openrevenue.org',
    siteName: 'OpenRevenue',
    title: 'OpenRevenue - Transparent Revenue Verification for Startups',
    description:
      'Open-source alternative to TrustMRR. Verify and showcase your startup revenue transparently with cryptographic verification and self-hosting options.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OpenRevenue - Transparent Revenue Verification',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenRevenue - Transparent Revenue Verification for Startups',
    description:
      'Open-source alternative to TrustMRR. Verify and showcase your startup revenue transparently.',
    images: ['/og-image.png'],
    creator: '@openrevenue',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://openrevenue.org',
  },
};

// Revalidate every hour for featured startups
export const revalidate = 3600;

async function getFeaturedStartups() {
  try {
    const limit = 6;

    // Get all published startups with recent revenue data
    const allStartups = await prisma.startup.findMany({
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
    });

    // Filter startups with revenue data
    const startupsWithRevenue = allStartups.filter(
      (s) => s.revenueSnapshots.length > 0 && s.revenueSnapshots[0].revenue > 0
    );

    if (startupsWithRevenue.length === 0) {
      return [];
    }

    // Fair selection algorithm
    const selected: typeof startupsWithRevenue = [];

    // Step 1: Get a mix of verified and self-reported (50/50 if possible)
    const verified = startupsWithRevenue.filter((s) =>
      s.connections.some((c) => c.trustLevel === 'PLATFORM_VERIFIED')
    );
    const selfReported = startupsWithRevenue.filter(
      (s) => !s.connections.some((c) => c.trustLevel === 'PLATFORM_VERIFIED')
    );

    const verifiedCount = Math.min(Math.ceil(limit / 2), verified.length);
    const selfReportedCount = Math.min(
      Math.floor(limit / 2),
      selfReported.length
    );
    const remainingCount = limit - verifiedCount - selfReportedCount;

    // Select verified startups with diversity in mind
    if (verified.length > 0) {
      const verifiedSelected = selectDiverse(verified, verifiedCount);
      selected.push(...verifiedSelected);
    }

    // Select self-reported startups with diversity in mind
    if (selfReported.length > 0) {
      const selfReportedSelected = selectDiverse(
        selfReported,
        selfReportedCount
      );
      selected.push(...selfReportedSelected);
    }

    // Step 2: Fill remaining slots with diverse selection from all
    const remaining = startupsWithRevenue.filter(
      (s) => !selected.find((sel) => sel.id === s.id)
    );
    if (remaining.length > 0 && remainingCount > 0) {
      const additional = selectDiverse(remaining, remainingCount);
      selected.push(...additional);
    }

    // Step 3: Shuffle to avoid predictable ordering
    const shuffled = selected.sort(() => Math.random() - 0.5);

    // Format response
    const formatted = shuffled.map((startup) => ({
      id: startup.id,
      name: startup.name,
      slug: startup.slug,
      description: startup.description,
      logo: startup.logo,
      website: startup.website,
      category: startup.category
        ? {
            id: startup.category.id,
            name: startup.category.name,
            slug: startup.category.slug,
          }
        : null,
      latestRevenue: startup.revenueSnapshots[0]
        ? {
            mrr: startup.revenueSnapshots[0].mrr,
            arr: startup.revenueSnapshots[0].arr,
            revenue: startup.revenueSnapshots[0].revenue,
            currency: startup.revenueSnapshots[0].currency,
            date: startup.revenueSnapshots[0].date,
          }
        : null,
      trustLevel: startup.connections[0]?.trustLevel || 'SELF_REPORTED',
      verificationMethod: startup.connections[0]?.verificationMethod || null,
      rank: startup.leaderboardEntry?.rank || null,
      growthRate: startup.leaderboardEntry?.growthRate || null,
    }));

    return formatted;
  } catch (error) {
    console.error('Error fetching featured startups:', error);
    return [];
  }
}

/**
 * Select diverse startups considering:
 * - Category diversity
 * - Revenue level diversity
 * - Recency (prefer recently updated)
 */
function selectDiverse(
  startups: any[],
  count: number
): typeof startups {
  if (count <= 0) return [];
  if (startups.length <= count) return startups;

  const selected: typeof startups = [];
  const usedCategories = new Set<string>();
  const usedStartups = new Set<string>();

  // Calculate revenue percentiles
  const revenues = startups.map(
    (s) => s.revenueSnapshots[0]?.revenue || 0
  );
  revenues.sort((a, b) => a - b);
  const p33 = revenues[Math.floor(revenues.length * 0.33)];
  const p66 = revenues[Math.floor(revenues.length * 0.66)];

  // Sort by recency (most recently updated first)
  const sortedByRecency = [...startups].sort((a, b) => {
    const aDate = a.revenueSnapshots[0]?.date || a.updatedAt;
    const bDate = b.revenueSnapshots[0]?.date || b.updatedAt;
    const aTime = aDate instanceof Date ? aDate.getTime() : new Date(aDate).getTime();
    const bTime = bDate instanceof Date ? bDate.getTime() : new Date(bDate).getTime();
    return bTime - aTime;
  });

  // Select diverse startups
  for (const startup of sortedByRecency) {
    if (selected.length >= count) break;
    if (usedStartups.has(startup.id)) continue;

    const category = startup.category?.slug || 'other';
    const revenue = startup.revenueSnapshots[0]?.revenue || 0;
    const revenueLevel =
      revenue < p33 ? 'low' : revenue < p66 ? 'mid' : 'high';

    // Prefer startups from unused categories
    const categoryScore = usedCategories.has(category) ? 0 : 1;

    // Prefer variety in revenue levels
    const revenueLevelUsed = selected.some((s) => {
      const sRev = s.revenueSnapshots[0]?.revenue || 0;
      const sLevel = sRev < p33 ? 'low' : sRev < p66 ? 'mid' : 'high';
      return sLevel === revenueLevel;
    });
    const revenueScore = revenueLevelUsed ? 0 : 1;

    // If it adds diversity, select it
    if (categoryScore === 1 || revenueScore === 1) {
      selected.push(startup);
      usedCategories.add(category);
      usedStartups.add(startup.id);
    }
  }

  // Fill remaining slots if needed
  if (selected.length < count) {
    for (const startup of sortedByRecency) {
      if (selected.length >= count) break;
      if (!usedStartups.has(startup.id)) {
        selected.push(startup);
        usedStartups.add(startup.id);
      }
    }
  }

  return selected;
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

export default async function HomePage() {
  const featuredStartups = await getFeaturedStartups();
  
  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OpenRevenue',
    description: 'Open-source alternative to TrustMRR. Verify and showcase your startup revenue transparently with cryptographic verification.',
    url: 'https://openrevenue.org',
    logo: 'https://openrevenue.org/logo.png',
    sameAs: [
      'https://github.com/openrevenue/openrevenue',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'hello@openrevenue.org',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
    },
  };

  const websiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'OpenRevenue',
    url: 'https://openrevenue.org',
    description: 'Open-source revenue verification platform for transparent startups',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://openrevenue.org/explore?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />

      <main className="flex-1">
        {/* Hero Section - Enhanced */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 py-20 md:py-32">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-6 animate-fade-in" variant="secondary">
                <Sparkles className="h-3 w-3 mr-2" />
                Open Source & Free Forever
              </Badge>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent animate-fade-in-up">
                Transparent Revenue
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in-up delay-200">
                The open-source alternative to TrustMRR. Verify and showcase your
                startup&apos;s revenue transparently with cryptographic verification.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up delay-300">
                <Button size="lg" className="text-lg px-8 group" asChild>
                  <Link href="/register">
                    Start Free 
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                  <Link href="/leaderboard">View Leaderboard</Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground animate-fade-in delay-400">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span>No credit card required</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span>Self-host or use managed platform</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span>100% open source</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Enhanced with Icons */}
        <section className="border-y bg-muted/30 py-12 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Open Source</div>
              </div>
              <div className="group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-3 group-hover:bg-green-500/20 transition-colors">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">$0</div>
                <div className="text-sm text-muted-foreground">Free Forever</div>
              </div>
              <div className="group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-3 group-hover:bg-blue-500/20 transition-colors">
                  <Server className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">∞</div>
                <div className="text-sm text-muted-foreground">Self-Hostable</div>
              </div>
              <div className="group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 mb-3 group-hover:bg-purple-500/20 transition-colors">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">✓</div>
                <div className="text-sm text-muted-foreground">Crypto Verified</div>
              </div>
            </div>
          </div>
        </section>

        {/* Startup Showcase - Already Enhanced */}
        {featuredStartups.length > 0 && (
          <section className="container mx-auto px-4 py-24">
            <div className="text-center mb-16">
              <Badge className="mb-4" variant="secondary">
                <TrendingUp className="h-3 w-3 mr-2" />
                Fairly Selected
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Featured Startups
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover startups building in public. Our fair selection algorithm
                ensures diversity across categories, revenue levels, and verification
                types.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredStartups.map((startup: any) => (
                <Link
                  href={`/startup/${startup.slug}`}
                  key={startup.id}
                  className="group"
                >
                  <Card className="h-full hover:shadow-xl transition-all hover:border-primary/50 border-2 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="h-12 w-12 flex-shrink-0">
                              <AvatarImage
                                src={startup.logo || undefined}
                                alt={startup.name}
                              />
                              <AvatarFallback>
                                {startup.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                {startup.name}
                              </h3>
                              {startup.category && (
                                <p className="text-sm text-muted-foreground">
                                  {startup.category.name}
                                </p>
                              )}
                            </div>
                          </div>
                          {startup.website && (
                            
                            <Link href={startup.website}
                            target="_blank"
                            rel="noopener"
                            className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                             <ExternalLink className="h-4 w-4" />
                          </Link>
                          )}
                        </div>

                        {/* Description */}
                        {startup.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {startup.description}
                          </p>
                        )}

                        {/* Trust Badge */}
                        <div>
                          <TrustBadge
                            trustLevel={startup.trustLevel}
                            verificationMethod={startup.verificationMethod}
                            size="sm"
                          />
                        </div>

                        {/* Revenue Stats */}
                        {startup.latestRevenue && (
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Total Revenue
                              </div>
                              <div className="font-semibold text-sm">
                                {formatCurrency(
                                  startup.latestRevenue.revenue,
                                  startup.latestRevenue.currency || 'USD'
                                )}
                              </div>
                            </div>
                            {startup.latestRevenue.mrr && (
                              <div>
                                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  MRR
                                </div>
                                <div className="font-semibold text-sm">
                                  {formatCurrency(
                                    startup.latestRevenue.mrr,
                                    startup.latestRevenue.currency || 'USD'
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Growth Rate */}
                        {startup.growthRate !== null && startup.growthRate !== undefined && (
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {startup.growthRate > 0 ? '+' : ''}
                              {startup.growthRate.toFixed(1)}% growth
                            </span>
                          </div>
                        )}

                        {/* Rank Badge */}
                        {startup.rank && (
                          <div className="pt-2 border-t">
                            <Badge variant="outline" className="text-xs">
                              #{startup.rank} on Leaderboard
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Button size="lg" variant="outline" asChild>
                <Link href="/leaderboard">
                  View Full Leaderboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        )}

        {/* Features Section - Enhanced */}
        <section className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Zap className="h-3 w-3 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for startups who value transparency, privacy, and control over
              their data
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
              <CardContent className="p-6">
                <div className="bg-primary/10 dark:bg-primary/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Data</h3>
                <p className="text-muted-foreground">
                  Cryptographically signed data ensures authenticity and builds trust
                  with investors, customers, and the community.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
              <CardContent className="p-6">
                <div className="bg-primary/10 dark:bg-primary/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Lock className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
                <p className="text-muted-foreground">
                  Granular controls let you decide what to share. Use self-hosted
                  apps to keep data entirely on your infrastructure.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
              <CardContent className="p-6">
                <div className="bg-primary/10 dark:bg-primary/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Growth Tracking</h3>
                <p className="text-muted-foreground">
                  Track MRR, ARR, customer count, and growth rates with beautiful
                  analytics dashboards.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
              <CardContent className="p-6">
                <div className="bg-primary/10 dark:bg-primary/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Server className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Self-Host Option</h3>
                <p className="text-muted-foreground">
                  Deploy our standalone app on your infrastructure for complete data
                  sovereignty and control.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
              <CardContent className="p-6">
                <div className="bg-primary/10 dark:bg-primary/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Public Leaderboard</h3>
                <p className="text-muted-foreground">
                  Join a community of transparent startups and gain visibility for
                  your business.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
              <CardContent className="p-6">
                <div className="bg-primary/10 dark:bg-primary/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Auto Sync</h3>
                <p className="text-muted-foreground">
                  Connect to Stripe, Paddle, or other payment providers for
                  automatic, real-time revenue updates.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works - Enhanced */}
        <section className="bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Clock className="h-3 w-3 mr-2" />
                Quick Setup
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get started in minutes, choose your setup
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center relative">
                <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                  1
                </div>
                <div className="absolute top-8 left-1/2 transform translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-primary/30 md:block hidden" style={{ width: 'calc(100% + 2rem)', left: 'calc(50% + 4rem)' }} />
                <h3 className="text-xl font-semibold mb-3">Choose Your Setup</h3>
                <p className="text-muted-foreground">
                  Sign up for the managed platform or deploy our self-hosted
                  standalone app on your infrastructure.
                </p>
              </div>
              <div className="text-center relative">
                <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                  2
                </div>
                <div className="absolute top-8 left-1/2 transform translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-primary/30 via-primary/30 to-transparent md:block hidden" style={{ width: 'calc(100% + 2rem)', left: 'calc(50% + 4rem)' }} />
                <h3 className="text-xl font-semibold mb-3">Connect or Upload</h3>
                <p className="text-muted-foreground">
                  Connect your payment provider API for automatic sync, or manually
                  upload verified revenue data.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Share & Grow</h3>
                <p className="text-muted-foreground">
                  Showcase your metrics on your public page, join the leaderboard,
                  and build trust with transparency.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section - New */}
        <section className="bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Users className="h-3 w-3 mr-2" />
                Community Voices
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Loved by Founders
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of startups sharing their journey transparently
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-muted-foreground/20 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    &quot;OpenRevenue gave us the credibility we needed when raising our seed round. The transparent metrics made investors trust our numbers.&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">Jane Doe</div>
                      <div className="text-xs text-muted-foreground">Founder, TechStart</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-muted-foreground/20 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    &quot;The self-hosted option is perfect for us. We keep full control of our data while still sharing transparently with our community.&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">Sarah Miller</div>
                      <div className="text-xs text-muted-foreground">CEO, DataFlow</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-muted-foreground/20 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    &quot;Building in public has been transformative. OpenRevenue makes it easy to share our growth journey and connect with other founders.&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>AB</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">Alex Brown</div>
                      <div className="text-xs text-muted-foreground">Founder, GrowthLab</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Open Source - Enhanced */}
        <section className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-12">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                    <Github className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Built for the Community
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    OpenRevenue is 100% open-source. Use it free forever, modify it,
                    contribute to it, or self-host it on your own infrastructure.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 rounded-lg bg-background/50">
                    <div className="text-3xl font-bold mb-2">MIT</div>
                    <div className="text-sm text-muted-foreground">License</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-background/50">
                    <div className="text-3xl font-bold mb-2">100%</div>
                    <div className="text-sm text-muted-foreground">Free</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-background/50">
                    <div className="text-3xl font-bold mb-2">Community</div>
                    <div className="text-sm text-muted-foreground">Driven</div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="outline" asChild>
                    <a
                      href="https://github.com/openrevenue/openrevenue"
                      target="_blank"
                      rel="noopener"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      View on GitHub
                    </a>
                  </Button>
                  <Button size="lg" asChild>
                    <Link href="/register">Get Started Free</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section - Enhanced */}
        <section className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <Sparkles className="h-12 w-12 mx-auto mb-6 opacity-80" />
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to Showcase Your Revenue?
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Join the community of transparent startups. Start free, no credit card
                required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 group"
                  asChild
                >
                  <Link href="/register">
                    Get Started Free 
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Enhanced */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-bold text-lg mb-4">OpenRevenue</div>
              <p className="text-sm text-muted-foreground">
                Open-source revenue verification platform for transparent startups.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/features" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className="hover:text-foreground transition-colors">
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link href="/explore" className="hover:text-foreground transition-colors">
                    Explore
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/openrevenue/openrevenue"
                    className="hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener"
                  >
                    GitHub
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="opacity-50">Documentation (Coming Soon)</li>
                <li className="opacity-50">Blog (Coming Soon)</li>
                <li className="opacity-50">Community (Coming Soon)</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} OpenRevenue. Open source under MIT
              License.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
