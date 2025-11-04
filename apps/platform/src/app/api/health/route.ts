import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Health check endpoint for Docker and monitoring
 * GET /api/health
 */
export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'openrevenue-platform',
        version: process.env.npm_package_version || '0.1.0',
      },
      { status: 200 }
    );
  } catch (error) {
    // Database connection failed
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'openrevenue-platform',
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}

