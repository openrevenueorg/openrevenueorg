'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrustBadge } from '@/components/ui/trust-badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Globe,
  ExternalLink,
  AlertTriangle,
  MessageCircle,
  Target
} from 'lucide-react';

import { getStartupLogoUrl } from '@/lib/avatar';

import { IconBrandGithub, IconBrandInstagram, IconBrandLinkedin, IconBrandX, IconBrandYoutube } from '@tabler/icons-react';
import { useState, useEffect } from 'react';


interface Props {
  params: Promise<{
    slug: string;
  }>;
  startupData: any
}




export default function StoryData({ params, startupData }: Props) {
    
    
  const startup = startupData;
    const [loading, setLoading] = useState(true);

    const [stories, setStories] = useState<any | null>(null);

  useEffect(() => {
    const fetchStartup = async () => {
      const { slug } = await params;
      if (!slug) return;
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
            
          </div>
        </div>


        <div className="grid gap-8 lg:grid-cols-1">
          

          {/* Stories */}
          <Card>
            <CardHeader>
              <CardTitle>Story</CardTitle>
            </CardHeader>
            <CardContent>
              {/* {stories && stories.length > 0 ? ( */}
              {stories ? (
                <div className="space-y-4">
                  
                  <h2 className="text-2xl font-bold mb-2">{stories.title}</h2>
                  <div className="text-sm text-muted-foreground mb-2" dangerouslySetInnerHTML={{ __html: stories.content }} />
                  <p className="text-xs text-muted-foreground">
                    {stories.publishedAt && new Date(stories.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
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
