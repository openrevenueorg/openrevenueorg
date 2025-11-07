'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RefreshCw, Crown, Users, BarChart3, Settings } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (isPending) return;

      if (!session?.user) {
        router.push('/');
        return;
      }

      try {
        // Fetch user role from API
        const response = await fetch('/api/user/role');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role);

          // Check if user has ADMIN or SUPER_ADMIN role
          if (data.role !== 'ADMIN' && data.role !== 'SUPER_ADMIN') {
            router.push('/dashboard');
            return;
          }
        } else {
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        router.push('/dashboard');
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [session, isPending, router]);

  if (loading || isPending) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Checking permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN')) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Crown className="h-8 w-8 text-yellow-600" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage featured startups and platform settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Role:</span>
            <span className="font-semibold">{userRole}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-6">
        <nav className="flex gap-2">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </Button>
          </Link>
          <Link href="/admin/featured">
            <Button variant="ghost" size="sm">
              <Crown className="h-4 w-4 mr-2" />
              Featured
            </Button>
          </Link>
          <Link href="/admin/stats">
            <Button variant="ghost" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
          {userRole === 'SUPER_ADMIN' && (
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Users
              </Button>
            </Link>
          )}
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </nav>
      </div>

      {children}
    </div>
  );
}
