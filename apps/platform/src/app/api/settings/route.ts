import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

// Helper functions to convert between boolean (UI) and string (DB)
function convertBooleanToString(value: boolean | string | undefined): string {
  if (typeof value === 'boolean') {
    return value ? 'public' : 'hidden';
  }
  // If it's already a string, validate and return
  if (value === 'public' || value === 'range' || value === 'hidden') {
    return value;
  }
  return 'public'; // default
}

function convertStringToBoolean(value: string | undefined): boolean {
  return value === 'public' || value === 'range';
}

export async function GET(req: NextRequest) {
  try {
    //const session = await auth();
    //const session = (await auth.$context).session;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startupId = searchParams.get('startupId');

    if (!startupId) {
      return NextResponse.json({ error: 'startupId required' }, { status: 400 });
    }

    const settings = await prisma.privacySettings.findUnique({
      where: { startupId },
    });

    // Convert string values to booleans for UI compatibility
    if (settings) {
      const uiSettings = {
        ...settings,
        showRevenue: convertStringToBoolean(settings.showRevenue),
        showMRR: convertStringToBoolean(settings.showMRR),
        showARR: convertStringToBoolean(settings.showARR),
        showCustomerCount: convertStringToBoolean(settings.showCustomerCount),
      };
      return NextResponse.json(uiSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    //const session = await auth();
    //const session = (await auth.$context).session;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { startupId, ...data } = body;

    // Verify ownership
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { userId: true },
    });

    if (!startup || startup.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Convert boolean values from UI to string values for DB
    const dbData: any = { ...data };
    if ('showRevenue' in data) {
      dbData.showRevenue = convertBooleanToString(data.showRevenue);
    }
    if ('showMRR' in data) {
      dbData.showMRR = convertBooleanToString(data.showMRR);
    }
    if ('showARR' in data) {
      dbData.showARR = convertBooleanToString(data.showARR);
    }
    if ('showCustomerCount' in data) {
      dbData.showCustomerCount = convertBooleanToString(data.showCustomerCount);
    }

    const settings = await prisma.privacySettings.upsert({
      where: { startupId },
      update: dbData,
      create: { startupId, ...dbData },
    });

    // Convert back to booleans for UI response
    const uiSettings = {
      ...settings,
      showRevenue: convertStringToBoolean(settings.showRevenue),
      showMRR: convertStringToBoolean(settings.showMRR),
      showARR: convertStringToBoolean(settings.showARR),
      showCustomerCount: convertStringToBoolean(settings.showCustomerCount),
    };

    return NextResponse.json(uiSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
