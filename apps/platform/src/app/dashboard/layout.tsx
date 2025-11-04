import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DashboardNav } from '@/components/dashboard-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { DashboardUserMenu } from '@/components/dashboard-user-menu';
import { Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard | OpenRevenue',
  description: 'Manage your startup revenue transparency',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex md:mr-6">
            <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl">OpenRevenue</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <DashboardUserMenu />
            </nav>
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        {/* Sidebar */}
        <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6 pr-6 lg:py-8">
            <DashboardNav />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex w-full flex-col overflow-hidden py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
