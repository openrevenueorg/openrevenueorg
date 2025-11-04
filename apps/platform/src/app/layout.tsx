import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://openrevenue.org'),
  title: 'OpenRevenue - Transparent Revenue Verification for Startups',
  description:
    'OpenRevenue is an open-source alternative to TrustMRR that allows startups to verify and showcase their revenue transparently.',
  keywords: [
    'revenue verification',
    'transparent startup',
    'indie hacker',
    'MRR tracking',
    'open source',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'min-h-screen antialiased')}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
