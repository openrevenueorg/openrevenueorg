import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrustBadge } from '@/components/ui/trust-badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Globe,
  ExternalLink,
  AlertTriangle,
  Twitter,
  Github,
  Linkedin,
  MessageCircle,
  Youtube,
  Instagram,
} from 'lucide-react';
import { RevenueChart } from '@/components/revenue-chart';
import { Navbar } from '@/components/navbar';
import { getStartupLogoUrl } from '@/lib/avatar';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}


async function getStartupBySlug(slug: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/startups/public/${slug}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    return null;
  }
  const startup = await response.json();
  return startup;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const startup = await getStartupBySlug(slug);

  if (!startup) {
    return {
      title: 'Startup Not Found | OpenRevenue',
      description: 'Transparent revenue tracking',
    };
  }

  return {
    title: `${startup.name} | OpenRevenue`,
    description: startup.description || 'Transparent revenue tracking',
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function StartupPage({ params }: Props) {
  const { slug } = await params;

  const startup = await getStartupBySlug(slug);
  if (!startup) notFound();

  const { revenueHistory, milestones, stories } = startup;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* Startup Header */}
        <div className="mb-12">
          <div className="flex items-start gap-6 mb-6">
            <Avatar className="h-20 w-20">
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
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{startup.name}</h1>
                <Badge variant="secondary">{startup.category}</Badge>
                {startup.trustLevel && (
                  <TrustBadge 
                    trustLevel={startup.trustLevel} 
                    verificationMethod={startup.verificationMethod}
                    size="lg"
                  />
                )}
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                {startup.description}
              </p>
              {startup.trustLevel === 'SELF_REPORTED' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                        Self-Reported Data
                      </div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        This startup&apos;s revenue data is self-reported through their standalone app.
                        While cryptographically signed, the data has not been independently verified
                        by the platform.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {startup.trustLevel === 'PLATFORM_VERIFIED' && startup.lastVerifiedAt && (
                <div className="text-sm text-muted-foreground mb-4">
                  Last verified: {new Date(startup.lastVerifiedAt).toLocaleDateString()} • {startup.verificationMethod}
                </div>
              )}
              <div className="space-y-3">
                <div className="flex gap-4 items-center text-sm text-muted-foreground">
                  {startup.website && (
                    <a
                      href={startup.website}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Founded {new Date(startup.foundedDate).getFullYear()}
                  </div>
                </div>

                {/* Social Links */}
                {(startup.twitterHandle || startup.githubHandle || startup.linkedinHandle ||
                  startup.discordUrl || startup.youtubeUrl || startup.instagramHandle) && (
                  <div className="flex gap-3 items-center">
                    {startup.twitterHandle && (
                      <a
                        href={`https://twitter.com/${startup.twitterHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Twitter / X"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {startup.githubHandle && (
                      <a
                        href={`https://github.com/${startup.githubHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="GitHub"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {startup.linkedinHandle && (
                      <a
                        href={`https://linkedin.com/company/${startup.linkedinHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {startup.discordUrl && (
                      <a
                        href={startup.discordUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Discord"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </a>
                    )}
                    {startup.youtubeUrl && (
                      <a
                        href={startup.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="YouTube"
                      >
                        <Youtube className="h-5 w-5" />
                      </a>
                    )}
                    {startup.instagramHandle && (
                      <a
                        href={`https://instagram.com/${startup.instagramHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Instagram"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Button asChild>
              <a
                href={startup.website}
                target="_blank"
                rel="noopener"
              >
                Visit Website
              </a>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Recurring Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(startup.currentMRR)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current MRR
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Annual Recurring Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(startup.currentARR)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current ARR
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{startup.customers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Paying customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{startup.growthRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Month-over-month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueHistory} />
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              {milestones && milestones.length > 0 ? (
                <div className="space-y-4">
                  {milestones.map((milestone: any) => (
                    <div key={milestone.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(milestone.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No milestones shared yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Stories */}
          <Card>
            <CardHeader>
              <CardTitle>Stories</CardTitle>
            </CardHeader>
            <CardContent>
              {stories && stories.length > 0 ? (
                <div className="space-y-4">
                  {stories.map((story: any) => (
                    <Link
                      key={story.id}
                      href={`/startup/${startup.slug}/story/${story.slug}`}
                      className="block p-4 rounded-lg border hover:border-primary transition-colors"
                    >
                      <h3 className="font-semibold mb-2">{story.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {story.excerpt}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {story.publishedAt && new Date(story.publishedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No stories published yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <Card className="border-primary/50">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">
                Building in public too?
              </h3>
              <p className="text-muted-foreground mb-4">
                Join OpenRevenue and showcase your transparent revenue
              </p>
              <Button asChild>
                <Link href="/register">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
