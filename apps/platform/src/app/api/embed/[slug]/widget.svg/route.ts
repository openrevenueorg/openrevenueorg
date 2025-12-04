import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = {
    params: Promise<{ slug: string }>;
};

function formatCurrency(amount: number): string {
    if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}k`;
    }
    return `$${amount}`;
}

function generateSVG(
    name: string,
    mrr: number | null,
    revenue: number | null,
    trustLevel: string,
    theme: 'light' | 'dark' = 'light'
): string {
    const displayValue = mrr ? `${formatCurrency(mrr)} MRR` : revenue ? `${formatCurrency(revenue)} Revenue` : 'N/A';
    const isVerified = trustLevel === 'PLATFORM_VERIFIED';

    const colors = theme === 'dark' ? {
        bg: '#1a1a2e',
        border: '#2d2d44',
        text: '#ffffff',
        subtext: '#a0a0b0',
        accent: '#10b981',
        badge: '#059669',
    } : {
        bg: '#ffffff',
        border: '#e5e7eb',
        text: '#111827',
        subtext: '#6b7280',
        accent: '#10b981',
        badge: '#059669',
    };

    return `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="80" viewBox="0 0 280 80">
  <defs>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${theme === 'dark' ? '#0f0f1a' : '#f9fafb'};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
    </filter>
  </defs>
  
  <!-- Card Background -->
  <rect x="2" y="2" width="276" height="76" rx="12" fill="url(#cardGradient)" stroke="${colors.border}" stroke-width="1" filter="url(#shadow)"/>
  
  <!-- OpenRevenue Logo/Icon -->
  <rect x="16" y="20" width="40" height="40" rx="8" fill="${colors.accent}"/>
  <text x="36" y="46" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">OR</text>
  
  <!-- Startup Name -->
  <text x="68" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="${colors.text}">${name.length > 20 ? name.substring(0, 20) + '...' : name}</text>
  
  <!-- Revenue Display -->
  <text x="68" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" fill="${colors.accent}">${displayValue}</text>
  
  <!-- Verified Badge -->
  ${isVerified ? `
  <rect x="200" y="26" width="66" height="20" rx="10" fill="${colors.badge}"/>
  <text x="233" y="40" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="500" fill="white" text-anchor="middle">✓ Verified</text>
  ` : ''}
  
  <!-- Powered by text -->
  <text x="68" y="68" font-family="system-ui, -apple-system, sans-serif" font-size="9" fill="${colors.subtext}">Powered by OpenRevenue</text>
</svg>`;
}

// GET /api/embed/[slug]/widget.svg
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { slug } = await params;
        const { searchParams } = new URL(req.url);
        const theme = (searchParams.get('theme') as 'light' | 'dark') || 'light';

        // Fetch startup data
        const startup = await prisma.startup.findUnique({
            where: { slug, isPublished: true },
            include: {
                revenueSnapshots: {
                    orderBy: { date: 'desc' },
                    take: 1,
                },
                connections: {
                    select: { trustLevel: true },
                    take: 1,
                },
                privacySettings: true,
            },
        });

        if (!startup) {
            return new NextResponse('Startup not found', { status: 404 });
        }

        // Check privacy settings
        const privacy = startup.privacySettings;
        const showRevenue = privacy?.showRevenue !== 'hidden';
        const showMRR = privacy?.showMRR !== 'hidden';

        const latestSnapshot = startup.revenueSnapshots[0];
        const mrr = showMRR ? latestSnapshot?.mrr : null;
        const revenue = showRevenue ? latestSnapshot?.revenue : null;
        const trustLevel = startup.connections[0]?.trustLevel || 'SELF_REPORTED';

        const svg = generateSVG(startup.name, mrr ?? null, revenue ?? null, trustLevel, theme);

        return new NextResponse(svg, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error) {
        console.error('Error generating widget:', error);
        return new NextResponse('Error generating widget', { status: 500 });
    }
}
