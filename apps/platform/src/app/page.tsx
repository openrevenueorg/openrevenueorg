import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, TrendingUp, Lock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-2xl">OpenRevenue</div>
          <nav className="hidden md:flex gap-6">
            <Link href="/leaderboard" className="hover:text-primary">
              Leaderboard
            </Link>
            <Link href="/explore" className="hover:text-primary">
              Explore
            </Link>
            <Link href="/about" className="hover:text-primary">
              About
            </Link>
          </nav>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Transparent Revenue
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            OpenRevenue is the open-source alternative to TrustMRR. Verify and
            showcase your startup&apos;s revenue transparently.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/leaderboard">View Leaderboard</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Data</h3>
              <p className="text-muted-foreground">
                Cryptographically signed data ensures authenticity and builds
                trust with your audience.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-muted-foreground">
                Granular controls let you decide what to share. Use self-hosted
                apps to keep data on your infrastructure.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Growth Tracking</h3>
              <p className="text-muted-foreground">
                Track MRR, ARR, customer count, and growth rates. Share your
                journey with the community.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to showcase your revenue?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the community of transparent startups. Connect your payment
              processor or self-host your data.
            </p>
            <Button size="lg" asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="font-bold text-lg mb-4">OpenRevenue</div>
              <p className="text-sm text-muted-foreground">
                Open-source revenue verification platform for transparent
                startups.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/features">Features</Link>
                </li>
                <li>
                  <Link href="/pricing">Pricing</Link>
                </li>
                <li>
                  <Link href="/docs">Documentation</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
                <li>
                  <Link href="/guides">Guides</Link>
                </li>
                <li>
                  <Link href="/api">API Docs</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <a
                    href="https://github.com/openrevenue/openrevenue"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 OpenRevenue. Open source under MIT License.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
