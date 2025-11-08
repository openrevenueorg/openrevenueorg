'use client';

import Link from 'next/link';
import { BuiltBy } from "@/components/built-by";

export function FooterElement() {
  return (
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
            {/* <li>
              <Link href="/pricing" className="hover:text-foreground transition-colors">
                Pricing
              </Link>
            </li> */}
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
                href="https://github.com/openrevenueorg/openrevenueorg"
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
        <BuiltBy />
      </div>
    </div>
  </footer>
  );
}
