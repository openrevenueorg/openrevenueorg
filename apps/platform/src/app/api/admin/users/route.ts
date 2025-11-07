import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/roles';

type AdminUserSummary = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    name: true;
    image: true;
    role: true;
    emailVerified: true;
    createdAt: true;
    _count: {
      select: {
        startups: true;
      };
    };
  };
}>;

export const dynamic = 'force-dynamic';

// GET /api/admin/users - Get all users (SUPER_ADMIN only)
export async function GET() {
  try {
    await requireRole('SUPER_ADMIN');

    const users: AdminUserSummary[] = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            startups: true,
          },
        },
      },
      orderBy: [
        { role: 'desc' }, // SUPER_ADMIN first
        { createdAt: 'desc' },
      ],
    });

    // Calculate stats
    const stats = {
      total: users.length,
      byRole: {
        USER: users.filter((u) => u.role === 'USER').length,
        MODERATOR: users.filter((u) => u.role === 'MODERATOR').length,
        ADMIN: users.filter((u) => u.role === 'ADMIN').length,
        SUPER_ADMIN: users.filter((u) => u.role === 'SUPER_ADMIN').length,
      },
    };

    return NextResponse.json({ users, stats });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      {
        status: error.message?.includes('Unauthorized')
          ? 401
          : error.message?.includes('Forbidden')
            ? 403
            : 500,
      }
    );
  }
}

// PATCH /api/admin/users - Update user role (SUPER_ADMIN only)
export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await requireRole('SUPER_ADMIN');
    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role are required' }, { status: 400 });
    }

    // Validate role
    const validRoles = ['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'] as const;
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Prevent user from demoting themselves
    if (userId === currentUser.id && role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'You cannot demote yourself from SUPER_ADMIN' },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user role' },
      {
        status: error.message?.includes('Unauthorized')
          ? 401
          : error.message?.includes('Forbidden')
            ? 403
            : 500,
      }
    );
  }
}

