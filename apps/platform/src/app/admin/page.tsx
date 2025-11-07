'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Users, TrendingUp, Crown, BarChart3 } from 'lucide-react';

interface AdminStats {
  totalStartups: number;
  publishedStartups: number;
  totalUsers: number;
  featuredCount: number;
  avgFeatureScore: number;
  tierDistribution: {
    BRONZE: number;
    SILVER: number;
    GOLD: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
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
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Failed to load dashboard stats.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Startups</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStartups}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedStartups} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Startups</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featuredCount}/15</div>
            <p className="text-xs text-muted-foreground">
              {15 - stats.featuredCount} slots available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Feature Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgFeatureScore?.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Out of 100 points</p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Tier Distribution</CardTitle>
          <CardDescription>Breakdown of startup tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-600" />
                <span className="font-medium">Gold</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">{stats.tierDistribution.GOLD} startups</span>
                <span className="font-bold">
                  {((stats.tierDistribution.GOLD / stats.totalStartups) * 100)?.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-400" />
                <span className="font-medium">Silver</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">{stats.tierDistribution.SILVER} startups</span>
                <span className="font-bold">
                  {((stats.tierDistribution.SILVER / stats.totalStartups) * 100)?.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-600" />
                <span className="font-medium">Bronze</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">{stats.tierDistribution.BRONZE} startups</span>
                <span className="font-bold">
                  {((stats.tierDistribution.BRONZE / stats.totalStartups) * 100)?.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <a
              href="/admin/featured"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              <Crown className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="font-semibold">Manage Featured Startups</div>
                <div className="text-sm text-muted-foreground">
                  Feature or unfeature startups on the homepage
                </div>
              </div>
            </a>

            <a
              href="/admin/stats"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-semibold">View Detailed Analytics</div>
                <div className="text-sm text-muted-foreground">
                  See comprehensive platform metrics
                </div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
