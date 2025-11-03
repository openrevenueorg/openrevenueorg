import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encryptApiKey } from '@/lib/encryption';
import { z } from 'zod';


const createConnectionSchema = z.object({
  startupId: z.string(),
  type: z.enum(['direct', 'standalone']),
  provider: z.string(),
  name: z.string(),
  // For direct integrations
  apiKey: z.string().optional(),
  secret: z.string().optional(),
  // For standalone integrations
  endpoint: z.string().url().optional(),
  standaloneApiKey: z.string().optional(),
});

// POST /api/connections
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = createConnectionSchema.parse(body);

    // Verify startup ownership
    const startup = await prisma.startup.findUnique({
      where: { id: data.startupId },
      select: { userId: true },
    });

    if (!startup || startup.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Encrypt sensitive data
    const encryptedData: any = {
      startupId: data.startupId,
      type: data.type,
      provider: data.provider,
      name: data.name,
    };

    if (data.type === 'direct') {
      if (data.apiKey) encryptedData.encryptedApiKey = encryptApiKey(data.apiKey);
      if (data.secret) encryptedData.encryptedSecret = encryptApiKey(data.secret);
    } else {
      encryptedData.endpoint = data.endpoint;
      if (data.standaloneApiKey) {
        encryptedData.standaloneApiKey = encryptApiKey(data.standaloneApiKey);
      }
    }

    const connection = await prisma.dataConnection.create({
      data: encryptedData,
    });

    return NextResponse.json(connection);
  } catch (error) {
    console.error('Error creating connection:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create connection' },
      { status: 500 }
    );
  }
}

// GET /api/connections?startupId=xxx
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startupId = searchParams.get('startupId');

    if (!startupId) {
      return NextResponse.json(
        { error: 'startupId is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { userId: true },
    });

    if (!startup || startup.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const connections = await prisma.dataConnection.findMany({
      where: { startupId },
      select: {
        id: true,
        type: true,
        provider: true,
        name: true,
        endpoint: true,
        isActive: true,
        lastSyncedAt: true,
        lastSyncStatus: true,
        createdAt: true,
        // Don't return encrypted keys
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}
