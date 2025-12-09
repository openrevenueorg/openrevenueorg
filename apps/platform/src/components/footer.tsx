'use client';

import Link from 'next/link';
import { BuiltBy } from "@/components/built-by";
import { SiReact, SiReactHex, SiGithub } from '@icons-pack/react-simple-icons';
import { ExternalLink, Mail, Twitter } from 'lucide-react';

export function FooterElement() {
  return (
    <footer className="relative border-t bg-card/50">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold">OR</span>
              </div>
              <span className="font-bold text-xl tracking-tight group-hover:text-primary transition-colors">
                OpenRevenue
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Open-source revenue verification platform for transparent startups. Build trust through transparency.
            </p>
            <div className="flex gap-3">
              <Link
                href="https://github.com/openrevenueorg/openrevenueorg"
                target="_blank"
                rel="noopener"
                className="w-10 h-10 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-200"
              >
                <SiGithub size={5} />
              </Link>
              <Link
                href="https://twitter.com/openrevenue"
                target="_blank"
                rel="noopener"
                className="w-10 h-10 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-200"
              >
                <Twitter className="h-5 w-5" />
                {/* <SiTwitter className="h-5 w-5"  /> */}
              </Link>
              <Link
                href="mailto:hello@openrevenue.org"
                className="w-10 h-10 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-200"
              >
                <Mail className="h-5 w-5" />
                {/* <SiMail  size={5} /> */}
              </Link>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1">
                  Stats
                </Link>
              </li>
              <li>
                <Link href="https://status.bidew.io/status/openrevenueorg" target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1">
                  Status
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="https://github.com/openrevenueorg/openrevenueorg" target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1">
                  GitHub
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="https://umami.openrevenue.org/share/TWMAXISbF9lKyuoH" target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1">
                  Analytics
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Resources</h4>
            <ul className="space-y-3">
              <li className="text-muted-foreground/50 text-sm">Documentation (Soon)</li>
              <li className="text-muted-foreground/50 text-sm">Blog (Soon)</li>
              <li className="text-muted-foreground/50 text-sm">Community (Soon)</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} OpenRevenue. Open source under MIT License.
          </p>
          <BuiltBy />
        </div>
      </div>
    </footer>
  );
}
