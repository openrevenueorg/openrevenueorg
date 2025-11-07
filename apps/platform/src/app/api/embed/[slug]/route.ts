import { NextRequest, NextResponse } from 'next/server';
import type { Prisma, TrustLevel } from '@prisma/client';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

// GET /api/embed/[slug] - Generate SVG badge for embedding
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'svg';

    // Fetch startup data
    const startup = (await prisma.startup.findUnique({
      where: { slug, isPublished: true },
      include: {
        revenueSnapshots: {
          orderBy: { date: 'desc' },
          take: 1,
        },
        connections: {
          where: { isActive: true },
          select: {
            trustLevel: true,
            verificationMethod: true,
          },
        },
      },
    })) as Prisma.StartupGetPayload<{
      include: {
        revenueSnapshots: {
          orderBy: { date: 'desc' };
          take: 1;
        };
        connections: {
          where: { isActive: true };
          select: {
            trustLevel: true;
            verificationMethod: true;
          };
        };
      };
    }> | null;

    if (!startup) {
      return new NextResponse('Startup not found', { status: 404 });
    }

    // Get latest MRR
    const latestMRR = startup.revenueSnapshots[0]?.mrr || 0;
    const isVerified = startup.connections.some((c: { trustLevel: TrustLevel; }) => c.trustLevel === 'PLATFORM_VERIFIED');
    const tier = startup.tier || 'BRONZE';

    // Format MRR
    const formatMRR = (amount: number) => {
      if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}k`;
      return `$${amount.toFixed(0)}`;
    };

    const formattedMRR = formatMRR(latestMRR);

    // Tier colors
    const tierColors: Record<string, string> = {
      GOLD: '#f59e0b',    // yellow-600
      SILVER: '#9ca3af',  // gray-400
      BRONZE: '#f97316',  // orange-600
    };

    const tierColor = tierColors[tier] || tierColors.BRONZE;

    // Generate SVG badge
    if (format === 'svg') {
      const svg = `
<svg width="220" height="90" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="220" height="90" rx="8" fill="url(#bg)" />

  <!-- Border -->
  <rect width="220" height="90" rx="8" fill="none" stroke="${tierColor}" stroke-width="2" />

  <!-- Top section -->
  <text x="110" y="20" font-family="Arial, sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle" font-weight="600">
    ${startup.name.length > 20 ? startup.name.substring(0, 20) + '...' : startup.name}
  </text>

  <!-- Verified badge -->
  ${isVerified ? `
  <circle cx="195" cy="16" r="8" fill="#10b981" />
  <text x="195" y="20" font-family="Arial, sans-serif" font-size="10" fill="white" text-anchor="middle" font-weight="bold">✓</text>
  ` : ''}

  <!-- MRR Display -->
  <text x="110" y="50" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" font-weight="bold">
    ${formattedMRR}
  </text>

  <!-- MRR Label -->
  <text x="110" y="65" font-family="Arial, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">
    Monthly Recurring Revenue
  </text>

  <!-- Tier badge -->
  <rect x="75" y="73" width="70" height="14" rx="7" fill="${tierColor}" opacity="0.2" />
  <text x="110" y="83" font-family="Arial, sans-serif" font-size="9" fill="${tierColor}" text-anchor="middle" font-weight="600">
    ${tier}
  </text>

  <!-- OpenRevenue branding -->
  <text x="5" y="85" font-family="Arial, sans-serif" font-size="8" fill="#475569" font-weight="500">
    OpenRevenue
  </text>
</svg>`.trim();

      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    }

    // JSON format
    return NextResponse.json({
      name: startup.name,
      slug: startup.slug,
      mrr: latestMRR,
      formattedMRR,
      isVerified,
      tier,
    });
  } catch (error) {
    console.error('Error generating embed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

