import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 1,
  MODERATOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

/**
 * Check if user has minimum required role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Get current user session with role from database
 */
export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  // Fetch full user from database to get role and other custom fields
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return user;
}

/**
 * Check if current user has required role
 * @throws Error if not authenticated or insufficient permissions
 */
export async function requireRole(requiredRole: UserRole) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized - Please log in');
  }

  if (!hasRole(user.role as UserRole, requiredRole)) {
    throw new Error(`Forbidden - Requires ${requiredRole} role`);
  }

  return user;
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  return hasRole(user.role as UserRole, 'ADMIN');
}

/**
 * Check if current user is moderator or above
 */
export async function isModerator(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  return hasRole(user.role as UserRole, 'MODERATOR');
}

/**
 * Role display names
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  USER: 'User',
  MODERATOR: 'Moderator',
  ADMIN: 'Administrator',
  SUPER_ADMIN: 'Super Administrator',
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  USER: 'Regular user with standard permissions',
  MODERATOR: 'Can moderate content and assist users',
  ADMIN: 'Can manage featured startups and view analytics',
  SUPER_ADMIN: 'Full system access and user management',
};
