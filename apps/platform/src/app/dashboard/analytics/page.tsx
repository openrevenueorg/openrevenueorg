'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, DollarSign, Users, Download } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

interface RevenueData {
  date: string;
  revenue: number;
  mrr?: number;
  arr?: number;
  customerCount?: number;
  currency: string;
  trustLevel: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AnalyticsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStartup, setSelectedStartup] = useState<string | null>(null);

  // Fetch user's startup
  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const response = await fetch('/api/startups');
        if (response.ok) {
          const startups = await response.json();
          if (startups.length > 0) {
            setSelectedStartup(startups[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching startup:', error);
      }
    };
    fetchStartup();
  }, []);

  // Fetch revenue data
  useEffect(() => {
    if (!selectedStartup) return;

    const fetchRevenue = async () => {
      setLoading(true);
      try {
        // Fetch last 12 months
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12);

        const response = await fetch(
          `/api/revenue?startupId=${selectedStartup}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );

        if (response.ok) {
          const data = await response.json();
          setRevenueData(data);
        }
      } catch (error) {
        console.error('Error fetching revenue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [selectedStartup]);

  if (!session?.user) {
    router.push('/');
    router.refresh();
  }
  
  // Calculate stats
  const stats = {
    currentMRR: revenueData[revenueData.length - 1]?.mrr || 0,
    totalRevenue: revenueData.reduce((sum, d) => sum + d.revenue, 0),
    currentCustomers: revenueData[revenueData.length - 1]?.customerCount || 0,
    growthRate: calculateGrowthRate(revenueData),
  };

  function calculateGrowthRate(data: RevenueData[]): number {
    if (data.length < 2) return 0;
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    if (!last.mrr || !prev.mrr) return 0;
    return ((last.mrr - prev.mrr) / prev.mrr) * 100;
  }

  function formatCurrency(amount: number) {
    if (amount >= 1000000) {
      return `$${(amount / 1000000)?.toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000)?.toFixed(0)}k`;
    }
    return `$${amount?.toFixed(2)}`;
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!revenueData || revenueData.length === 0) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
              <p className="text-muted-foreground">
                Connect a payment provider to start tracking your revenue analytics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your revenue performance over time
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.currentMRR)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.growthRate > 0 ? '+' : ''}{stats.growthRate?.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Last 12 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentCustomers}</div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate?.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Month-over-month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* MRR Growth */}
        <Card>
          <CardHeader>
            <CardTitle>MRR Growth</CardTitle>
            <CardDescription>Monthly recurring revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="mrr" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
            <CardDescription>Total paying customers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="customerCount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>Revenue by trust level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getTrustLevelData(revenueData)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {getTrustLevelData(revenueData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getTrustLevelData(data: RevenueData[]) {
  const total = data.reduce((sum, d) => sum + d.revenue, 0);
  const verified = data.filter(d => d.trustLevel === 'PLATFORM_VERIFIED').reduce((sum, d) => sum + d.revenue, 0);
  const selfReported = total - verified;

  return [
    { name: 'Verified', value: verified },
    { name: 'Self-Reported', value: selfReported },
  ].filter(item => item.value > 0);
}

