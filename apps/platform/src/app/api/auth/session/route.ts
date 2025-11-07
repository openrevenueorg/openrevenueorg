import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
    try {
      
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }
  
      return NextResponse.json(session);
    } catch (error) {
      console.error('Error fetching session :', error);
      return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
    }
  }
  