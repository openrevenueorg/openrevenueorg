'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
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
  MessageCircle,
  Code2,
  Check,
  Copy,
  Target
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RevenueChart } from '@/components/revenue-chart';
import { getStartupLogoUrl } from '@/lib/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { IconBrandGithub, IconBrandInstagram, IconBrandLinkedin, IconBrandX, IconBrandYoutube } from '@tabler/icons-react';
import { useState, useEffect } from 'react';


interface Props {
  params: Promise<{
    slug: string;
  }>;
  startupData: any
}




function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function StartupData({ params, startupData }: Props) {
    
    
  const startup = startupData;
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [embedCopied, setEmbedCopied] = useState(false);
    const [revenueHistory, setRevenueHistory] = useState<any | null>(null);
    const [milestones, setMilestones] = useState<any | null>(null);
    const [stories, setStories] = useState<any | null>(null);


  const copyEmbedCode = async () => {
    if (!startup) return;

    const embedCode = `<a href="${typeof window !== 'undefined' ? window.location.origin : ''}/startup/${startup.slug}" target="_blank"><img src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/embed/${startup.slug}?format=svg" alt="OpenRevenue verified revenue badge" width="220" height="90" /></a>`;

    try {
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    } catch (error) {
      console.error('Error copying embed code:', error);
      alert('Failed to copy code. Please try again.');
    }
  };

  useEffect(() => {
    const fetchStartup = async () => {
      const { slug } = await params;
      if (!slug) return;
      setRevenueHistory(startup.revenueHistory);
      setMilestones(startup.milestones);
      setStories(startup.stories);
      setLoading(false);
    };
    fetchStartup();
  }, [params]);

  

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Target className="h-8 w-8 animate-pulse mx-auto mb-2" />
            <p className="text-muted-foreground">Loading startup data...</p>
          </div>
        </div>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">

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
                        <IconBrandX className="h-5 w-5" />
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
                        <IconBrandGithub className="h-5 w-5" />
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
                        <IconBrandLinkedin className="h-5 w-5" />
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
                        <IconBrandYoutube className="h-5 w-5" />
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
                        <IconBrandInstagram className="h-5 w-5" />
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
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Code2 className="h-4 w-4 mr-2" />
                  Embed Code
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                

                <Card className="mt-2">
                <CardHeader>
                    <CardTitle>Embed Badge</CardTitle>
                    <CardDescription>
                      Add your verified revenue badge to your website or README
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Preview */}
                      <div>
                        <Label className="mb-2 block">Preview</Label>
                        <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                          <img
                            src={`/api/embed/${startup.slug}?format=svg`}
                            alt="OpenRevenue verified revenue badge"
                            width="220"
                            height="90"
                          />
                        </div>
                      </div>

                      {/* Embed Code */}
                      <div>
                        <Label className="mb-2 block">Embed Code</Label>
                        <div className="relative">
                          <Textarea
                            readOnly
                            value={`<a href="${typeof window !== 'undefined' ? window.location.origin : ''}/startup/${startup.slug}" target="_blank"><img src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/embed/${startup.slug}?format=svg" alt="OpenRevenue verified revenue badge" width="220" height="90" /></a>`}
                            className="font-mono text-sm pr-24"
                            rows={4}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="absolute top-2 right-2"
                            onClick={copyEmbedCode}
                          >
                            {embedCopied ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Copy this code and paste it into your website or GitHub README to display your verified revenue badge.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  
              </DialogContent>
            </Dialog>
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
