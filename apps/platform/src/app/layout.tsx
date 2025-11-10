import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import { OpenPanelComponent } from '@openpanel/nextjs';
import Script from 'next/script';

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
        <Providers>
          
          {children}
          </Providers>
          <OpenPanelComponent
              apiUrl="/api/op"
              clientId="e1621a60-19bd-4606-a33a-9fa6cfebd1db"
              trackScreenViews={true}
              trackAttributes={true}
              trackOutgoingLinks={true}
            />
            <Script defer src="https://umami.openrevenue.org/script.js" data-website-id="906146ac-a82c-4fca-9ece-fdfea9149b2c"/> 
      </body>
    </html>
  );
}
