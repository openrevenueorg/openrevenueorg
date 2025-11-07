import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/roles';

// GET /api/user/role - Get current user's role
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      role: user.role,
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error: any) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user role' },
      { status: 500 }
    );
  }
}
