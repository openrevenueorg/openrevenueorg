'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Crown,
  DollarSign,
  Activity,
  Eye,
  MousePointerClick,
  Calendar,
  Award,
} from 'lucide-react';

interface DetailedStats {
  overview: {
    totalStartups: number;
    publishedStartups: number;
    totalUsers: number;
    featuredCount: number;
    totalRevenue: number;
    avgRevenuePerStartup: number;
  };
  growth: {
    startupsThisMonth: number;
    startupsLastMonth: number;
    usersThisMonth: number;
    usersLastMonth: number;
    revenueGrowth: number;
  };
  featuring: {
    totalImpressions: number;
    totalClicks: number;
    avgCTR: number;
    topPerformers: Array<{
      name: string;
      slug: string;
      impressions: number;
      clicks: number;
      ctr: number;
    }>;
  };
  tiers: {
    BRONZE: number;
    SILVER: number;
    GOLD: number;
  };
  categories: Array<{
    name: string;
    count: number;
    avgRevenue: number;
  }>;
  recentActivity: Array<{
    type: 'startup_created' | 'startup_published' | 'user_joined' | 'startup_featured';
    description: string;
    timestamp: string;
  }>;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/detailed-stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching detailed stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Failed to load analytics.</p>
        </CardContent>
      </Card>
    );
  }

  const startupsGrowth =
    stats.growth.startupsLastMonth > 0
      ? ((stats.growth.startupsThisMonth - stats.growth.startupsLastMonth) /
          stats.growth.startupsLastMonth) *
        100
      : 0;

  const usersGrowth =
    stats.growth.usersLastMonth > 0
      ? ((stats.growth.usersThisMonth - stats.growth.usersLastMonth) / stats.growth.usersLastMonth) *
        100
      : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold">Detailed Analytics</h2>
        <p className="text-muted-foreground">Comprehensive platform metrics and insights</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Startups</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalStartups}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overview.publishedStartups} published ({' '}
              {((stats.overview.publishedStartups / stats.overview.totalStartups) * 100)?.toFixed(1)}%
              )
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue Tracked</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.overview.totalRevenue / 1000000)?.toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Avg ${(stats?.overview?.avgRevenuePerStartup / 1000)?.toFixed(0)}k per startup
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Growth Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Metrics</CardTitle>
          <CardDescription>Month-over-month growth comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Startups This Month</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{stats.growth.startupsThisMonth}</span>
                  {startupsGrowth > 0 ? (
                    <Badge variant="default" className="bg-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {startupsGrowth?.toFixed(1)}%
                    </Badge>
                  ) : startupsGrowth < 0 ? (
                    <Badge variant="destructive">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {Math.abs(startupsGrowth)?.toFixed(1)}%
                    </Badge>
                  ) : null}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Previous month: {stats.growth.startupsLastMonth}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Users This Month</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{stats.growth.usersThisMonth}</span>
                  {usersGrowth > 0 ? (
                    <Badge variant="default" className="bg-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {usersGrowth?.toFixed(1)}%
                    </Badge>
                  ) : usersGrowth < 0 ? (
                    <Badge variant="destructive">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {Math.abs(usersGrowth)?.toFixed(1)}%
                    </Badge>
                  ) : null}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Previous month: {stats.growth.usersLastMonth}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featuring Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Featuring Performance</CardTitle>
          <CardDescription>Featured startups engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="flex items-center gap-2">
              <Eye className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">
                  {stats.featuring.totalImpressions.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Impressions</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MousePointerClick className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">
                  {stats.featuring.totalClicks.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Clicks</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{stats.featuring.avgCTR?.toFixed(2)}%</div>
                <div className="text-xs text-muted-foreground">Average CTR</div>
              </div>
            </div>
          </div>

          {stats.featuring.topPerformers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Top Performers</h3>
              <div className="space-y-2">
                {stats.featuring.topPerformers.map((performer, index) => (
                  <div
                    key={performer.slug}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{performer.name}</div>
                        <div className="text-xs text-muted-foreground">/{performer.slug}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <div className="font-semibold">{performer.impressions}</div>
                        <div className="text-xs text-muted-foreground">impressions</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{performer.clicks}</div>
                        <div className="text-xs text-muted-foreground">clicks</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{performer.ctr?.toFixed(2)}%</div>
                        <div className="text-xs text-muted-foreground">CTR</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tier Distribution</CardTitle>
            <CardDescription>Startup quality breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Gold</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-600"
                      style={{
                        width: `${(stats.tiers.GOLD / stats.overview.totalStartups) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">
                    {stats.tiers.GOLD}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">Silver</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-400"
                      style={{
                        width: `${(stats.tiers.SILVER / stats.overview.totalStartups) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">
                    {stats.tiers.SILVER}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Bronze</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600"
                      style={{
                        width: `${(stats.tiers.BRONZE / stats.overview.totalStartups) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">
                    {stats.tiers.BRONZE}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Most popular startup categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.categories.slice(0, 5).map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <span className="font-medium">{category.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      ${(category?.avgRevenue / 1000)?.toFixed(0)}k avg
                    </span>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type.replace(/_/g, ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
