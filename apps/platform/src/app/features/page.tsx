import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  TrendingUp,
  Lock,
  Zap,
  Check,
  Server,
  Globe,
  Key,
  PieChart,
  Users,
  GitBranch,
} from 'lucide-react';

export const metadata = {
  title: 'Features | OpenRevenue',
  description: 'Discover OpenRevenue features and capabilities',
};

export default function FeaturesPage() {
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
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold mb-4">Powerful Features</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to track, verify, and showcase your revenue transparently
          </p>
        </div>

        {/* Core Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 w-12 h-12 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Data</h3>
                <p className="text-muted-foreground">
                  Cryptographically verified revenue data that proves authenticity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="rounded-full bg-green-100 dark:bg-green-900 w-12 h-12 flex items-center justify-center mb-4">
                  <Server className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Self-Host Option</h3>
                <p className="text-muted-foreground">
                  Keep your data on your infrastructure with our standalone app
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900 w-12 h-12 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-Time Analytics</h3>
                <p className="text-muted-foreground">
                  Track MRR, ARR, growth, and customer metrics with beautiful charts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="rounded-full bg-orange-100 dark:bg-orange-900 w-12 h-12 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Public Leaderboard</h3>
                <p className="text-muted-foreground">
                  Rank among other transparent startups and gain visibility
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="rounded-full bg-pink-100 dark:bg-pink-900 w-12 h-12 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-pink-600 dark:text-pink-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Privacy Controls</h3>
                <p className="text-muted-foreground">
                  Granular settings to control what you share publicly
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="rounded-full bg-indigo-100 dark:bg-indigo-900 w-12 h-12 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Automatic Sync</h3>
                <p className="text-muted-foreground">
                  Background jobs keep your metrics up-to-date automatically
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Integration Options */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Integration Options</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <Key className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Direct API Integration</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your payment provider directly for verified, real-time data
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Platform-verified trust level</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Automatic data sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Stripe, Paddle, Lemon Squeezy, PayPal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Encrypted credential storage</span>
                  </li>
                </ul>
                <Badge variant="default">Platform Verified</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <Server className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Standalone App</h3>
                <p className="text-muted-foreground mb-4">
                  Self-host your data on your own infrastructure with complete sovereignty
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Complete data sovereignty</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Cryptographic signatures</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Custom processing rules</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>No API keys shared</span>
                  </li>
                </ul>
                <Badge variant="secondary">Self-Reported</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">vs Other Platforms</h2>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold">TrustMRR</th>
                    <th className="text-center p-4 font-semibold">OpenRevenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4">Open Source</td>
                    <td className="text-center p-4">❌</td>
                    <td className="text-center p-4">✅</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Self-Hosting</td>
                    <td className="text-center p-4">❌</td>
                    <td className="text-center p-4">✅</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Data Sovereignty</td>
                    <td className="text-center p-4">❌</td>
                    <td className="text-center p-4">✅</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Verified Metrics</td>
                    <td className="text-center p-4">✅</td>
                    <td className="text-center p-4">✅</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Multiple Providers</td>
                    <td className="text-center p-4">✅</td>
                    <td className="text-center p-4">✅</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Privacy Controls</td>
                    <td className="text-center p-4">Limited</td>
                    <td className="text-center p-4">✅ Granular</td>
                  </tr>
                  <tr>
                    <td className="p-4">Pricing</td>
                    <td className="text-center p-4">Paid</td>
                    <td className="text-center p-4">✅ Free & Open</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">More Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <PieChart className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Revenue Charts</h4>
                <p className="text-sm text-muted-foreground">
                  Beautiful visualizations of your revenue trends
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Community</h4>
                <p className="text-sm text-muted-foreground">
                  Join a community of transparent founders
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <GitBranch className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Stories</h4>
                <p className="text-sm text-muted-foreground">
                  Share your journey with blog posts
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Milestones</h4>
                <p className="text-sm text-muted-foreground">
                  Track and celebrate achievements
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Trust Badges</h4>
                <p className="text-sm text-muted-foreground">
                  Clear verification status indicators
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Zap className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Export Data</h4>
                <p className="text-sm text-muted-foreground">
                  Download your analytics anytime
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of startups sharing their journey transparently
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
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

