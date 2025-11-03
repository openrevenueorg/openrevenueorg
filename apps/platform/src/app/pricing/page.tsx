import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Pricing | OpenRevenue',
  description: 'Simple, transparent pricing for OpenRevenue',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="font-bold text-2xl">
              OpenRevenue
            </Link>
            <div className="flex gap-4 items-center">
              <Link href="/leaderboard" className="text-sm hover:text-primary">
                Leaderboard
              </Link>
              <Link href="/explore" className="text-sm hover:text-primary">
                Explore
              </Link>
              <Link href="/about" className="text-sm hover:text-primary">
                About
              </Link>
              <Link href="/login" className="text-sm hover:text-primary">
                Sign In
              </Link>
            </div>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Simple Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free. Scale as you grow. Everything you need to showcase your revenue transparently.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Free Tier */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl">Free</CardTitle>
                <Badge variant="secondary">Perfect to Start</Badge>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Forever free
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>Self-hosted standalone app</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>One startup profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>Public leaderboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>Stories & milestones</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>Community support</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/register">
                  Get Started Free
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className="relative border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <Badge variant="default">Most Popular</Badge>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Per startup
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span><strong>Everything in Free</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>Managed platform hosting</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>Direct payment provider integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>Custom domain</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>Export reports</span>
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/register">
                  Start Pro Trial
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Tier */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <Badge variant="secondary">Custom</Badge>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Contact sales
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span><strong>Everything in Pro</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>Multiple startups</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>White-label solution</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>SLA guarantee</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>On-premise deployment</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/contact">
                  Contact Sales
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Is the free tier really free forever?</h3>
                <p className="text-muted-foreground">
                  Yes! Our self-hosted standalone app will always be free and open-source. You can use it forever without any payment.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What's the difference between Free and Pro?</h3>
                <p className="text-muted-foreground">
                  Free requires you to self-host the standalone app. Pro includes our managed platform with direct payment integrations, automatic sync, and priority support.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I switch plans later?</h3>
                <p className="text-muted-foreground">
                  Absolutely! You can upgrade, downgrade, or cancel anytime. Your data is always exportable.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We support all major credit cards and can accept bank transfers for Enterprise customers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-muted/50 rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Start Your Free Trial</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the community of transparent startups. No credit card required.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
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

