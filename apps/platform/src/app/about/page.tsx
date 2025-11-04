import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, TrendingUp, Lock, Github, Users, Zap } from 'lucide-react';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://openrevenue.org'),
  title: 'About | OpenRevenue',
  description: 'Learn about OpenRevenue and our mission to make revenue transparency accessible',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">About OpenRevenue</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Building transparency in the startup ecosystem, one verified metric at a time
          </p>
        </div>

        {/* Mission */}
        <div className="max-w-4xl mx-auto mb-20">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                OpenRevenue empowers startups to share their revenue journey transparently while maintaining complete control over their data. We believe that verified transparency builds stronger communities and better businesses.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Unlike closed platforms, OpenRevenue is open-source, giving you the freedom to self-host your data or use our managed platform. Your metrics, your choice.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Choose Your Setup</h3>
                <p className="text-muted-foreground">
                  Connect your payment processor directly or self-host with our standalone app
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verification</h3>
                <p className="text-muted-foreground">
                  We verify your data through direct API integration or cryptographic signatures
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Share & Grow</h3>
                <p className="text-muted-foreground">
                  Showcase your metrics, join the leaderboard, and inspire the community
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Transparency Matters */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Why Transparency Matters</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Builds Trust</h3>
                <p className="text-muted-foreground">
                  Potential customers, investors, and partners trust startups that are open about their metrics
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Community Support</h3>
                <p className="text-muted-foreground">
                  Connect with other founders, share insights, and learn from peers on similar journeys
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Accountability</h3>
                <p className="text-muted-foreground">
                  Public metrics keep you accountable to your goals and help you track real progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Market Signal</h3>
                <p className="text-muted-foreground">
                  Verified revenue signals product-market fit and attracts talent and investment
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Privacy & Control */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Privacy & Control</h2>
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <Zap className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Self-Host Option</h3>
                    <p className="text-muted-foreground">
                      Use our standalone app to keep all sensitive data on your own infrastructure
                    </p>
                  </div>

                  <div>
                    <Lock className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Granular Controls</h3>
                    <p className="text-muted-foreground">
                      Choose exactly what to share: exact amounts, ranges, or keep it private
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Open Source */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-8">Open Source</h2>
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-8 text-center">
              <Github className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Built for the Community</h3>
              <p className="text-lg text-muted-foreground mb-6">
                OpenRevenue is open-source software, free to use, modify, and contribute to
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild variant="outline">
                  <a
                    href="https://github.com/openrevenue/openrevenue"
                    target="_blank"
                    rel="noopener"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    View on GitHub
                  </a>
                </Button>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Section (Optional) */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Built by Founders, for Founders</h2>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-muted-foreground mb-8">
              OpenRevenue was created by startup founders who understand the value of transparency and data sovereignty
            </p>
            <div className="flex items-center justify-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                Join a community of transparent startups building in public
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the community of transparent startups today
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Get Started Free</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} OpenRevenue. Open source and free forever.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

