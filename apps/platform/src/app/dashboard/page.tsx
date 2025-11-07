"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import SelectMenu from '@/components/ui/select-menu';

interface StartupSummary {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

type RevenuePoint = {
  revenue?: number | null;
  mrr?: number | null;
  customerCount?: number | null;
  growthRate?: number | null;
};

export default function DashboardPage() {
  const [hasStartup, setHasStartup] = useState(false);
  const [startupList, setStartupList] = useState<StartupSummary[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<StartupSummary | null>(null);
  const [stats, setStats] = useState({
    currentMRR: 0,
    mrrChange: 0,
    totalRevenue: 0,
    revenueChange: 0,
    customers: 0,
    customersChange: 0,
    growthRate: 0,
  });
  const [loading, setLoading] = useState(true);

  // if (!session?.user) {
  //   // router.push('/');
  //   // router.refresh();
  //   notFound();
  // }

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const response = await fetch('/api/startups');
        if (response.ok) {
          const startups = (await response.json()) as StartupSummary[];

          if (startups?.length > 0) {
            setSelectedStartup(startups[0]);
            setHasStartup(true);
            setStartupList(startups);

            // Fetch revenue data for the first startup
            await fetchRevenueData(startups[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching startups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStartup();
  }, []);

  const fetchRevenueData = async (startupId: string) => {
    try {
      // Fetch last 3 months for comparison
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);

      const response = await fetch(
        `/api/revenue?startupId=${startupId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (response.ok) {
        const revenueData: RevenuePoint[] = await response.json();

        if (revenueData && revenueData.length > 0) {
          // Calculate stats from real data
          const latestData = revenueData[revenueData.length - 1];
          const previousData = revenueData.length > 1 ? revenueData[revenueData.length - 2] : null;

          const currentMRR = latestData.mrr || 0;
          const previousMRR = previousData?.mrr || 0;
          const mrrChange = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0;

          const totalRevenue = revenueData.reduce(
            (sum, dataPoint) => sum + (dataPoint.revenue ?? 0),
            0
          );
          const currentRevenue = latestData.revenue ?? 0;
          const previousRevenue = previousData?.revenue ?? 0;
          const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

          const customers = latestData.customerCount ?? 0;
          const previousCustomers = previousData?.customerCount ?? 0;
          const customersChange = previousCustomers > 0 ? ((customers - previousCustomers) / previousCustomers) * 100 : 0;

          const growthRate = latestData.growthRate ?? mrrChange;

          setStats({
            currentMRR,
            mrrChange: Number(mrrChange?.toFixed(1)),
            totalRevenue,
            revenueChange: Number(revenueChange?.toFixed(1)),
            customers,
            customersChange: Number(customersChange?.toFixed(1)),
            growthRate: Number(growthRate?.toFixed(1)),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="space-y-4 max-w-md">
          <div className="rounded-full bg-muted w-20 h-20 flex items-center justify-center mx-auto">
            <Activity className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Loading your dashboard...</h1>
        </div>
      </div>
    );
  }

  if (!hasStartup) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="space-y-4 max-w-md">
          <div className="rounded-full bg-muted w-20 h-20 flex items-center justify-center mx-auto">
            <Activity className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to OpenRevenue!</h1>
          <p className="text-muted-foreground">
            Get started by adding your startup and connecting your payment provider to start tracking your revenue
            transparently.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard/onboarding">
                <Plus className="mr-2 h-4 w-4" />
                Add Your Startup
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/leaderboard">Browse Startups</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your revenue overview.
          </p>
        </div>
        <Link href={`/startup/${selectedStartup?.slug ?? ''}`}>
          <Button variant="outline">View Public Page</Button>
        </Link>
        <Button asChild size="lg">
              <Link href="/dashboard/onboarding">
                <Plus className="mr-2 h-4 w-4" />
                Add a Startup
              </Link>
            </Button>
        <SelectMenu selectTitle="Select a Startup" menuItems={startupList.map((startup) => ({ name: startup.name, label: startup.slug, image: startup.logo || '' }))} />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.currentMRR.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stats.mrrChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={stats.mrrChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {stats.mrrChange}%
              </span>{' '}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stats.revenueChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={stats.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {stats.revenueChange}%
              </span>{' '}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stats.customersChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={stats.customersChange >= 0 ? 'text-green-500' : 'text-red-500'}
              >
                {stats.customersChange}%
              </span>{' '}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.growthRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Month-over-month growth
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your startup and connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link href="/dashboard/connections">
                <Plus className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Add Connection</div>
                  <div className="text-xs text-muted-foreground">
                    Connect a payment provider
                  </div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link href="/dashboard/stories">
                <Plus className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Write Story</div>
                  <div className="text-xs text-muted-foreground">
                    Share your journey
                  </div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link href="/dashboard/settings">
                <Plus className="h-6 w-4" />
                <div className="text-center">
                  <div className="font-semibold">Configure Privacy</div>
                  <div className="text-xs text-muted-foreground">
                    Control what&apos;s visible
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your startup</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge>Success</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">Revenue sync completed</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">Milestone</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">Reached $10k MRR</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">Update</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">Privacy settings updated</p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
