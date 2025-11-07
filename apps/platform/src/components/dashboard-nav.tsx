'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  LineChart,
  Settings,
  Link as LinkIcon,
  FileText,
  Trophy,
} from 'lucide-react';

const navItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Connections',
    href: '/dashboard/connections',
    icon: LinkIcon,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: LineChart,
  },
  {
    title: 'Stories',
    href: '/dashboard/stories',
    icon: FileText,
  },
  {
    title: 'Milestones',
    href: '/dashboard/milestones',
    icon: Trophy,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted',
              pathname === item.href
                ? 'bg-muted font-medium text-foreground'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
