import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Settings {
  startup_name: string;
  startup_tagline?: string;
  startup_description?: string;
  startup_website?: string;
  founder_name?: string;
  show_revenue: boolean;
  show_mrr: boolean;
  show_arr: boolean;
  show_customers: boolean;
  revenue_display_mode: 'exact' | 'range' | 'hidden';
}

interface RevenueStats {
  current_mrr: number;
  current_arr: number;
  total_revenue: number;
  customer_count: number;
  growth_rate: number;
  chart_data: Array<{
    date: string;
    mrr: number;
    revenue: number;
  }>;
}

export function PublicPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch settings
      const settingsRes = await fetch('/api/v1/settings');
      const settingsData = await settingsRes.json();
      setSettings({
        ...settingsData,
        show_revenue: settingsData.show_revenue === 1,
        show_mrr: settingsData.show_mrr === 1,
        show_arr: settingsData.show_arr === 1,
        show_customers: settingsData.show_customers === 1,
      });

      // Fetch revenue stats
      const statsRes = await fetch('/api/v1/revenue/public-stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatToRange(value: number) {
    const ranges = [
      { min: 0, max: 1000, label: '$0 - $1k' },
      { min: 1000, max: 5000, label: '$1k - $5k' },
      { min: 5000, max: 10000, label: '$5k - $10k' },
      { min: 10000, max: 25000, label: '$10k - $25k' },
      { min: 25000, max: 50000, label: '$25k - $50k' },
      { min: 50000, max: 100000, label: '$50k - $100k' },
      { min: 100000, max: 250000, label: '$100k - $250k' },
      { min: 250000, max: 500000, label: '$250k - $500k' },
      { min: 500000, max: 1000000, label: '$500k - $1M' },
      { min: 1000000, max: Infinity, label: '$1M+' },
    ];

    const range = ranges.find((r) => value >= r.min && value < r.max);
    return range?.label || '$0';
  }

  function displayValue(value: number, mode: string) {
    if (mode === 'hidden') return 'Hidden';
    if (mode === 'range') return formatToRange(value);
    return formatCurrency(value);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            OpenRevenue Standalone
          </h1>
          <p className="text-gray-600 mb-6">This instance hasn't been set up yet.</p>
          <Link
            to="/onboarding"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📊</span>
              <span className="text-sm text-gray-500">Powered by OpenRevenue</span>
            </div>
            <Link
              to="/login"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Dashboard Login →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {settings.startup_name}
          </h1>
          {settings.startup_tagline && (
            <p className="text-xl text-gray-600 mb-6">{settings.startup_tagline}</p>
          )}
          {settings.startup_description && (
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              {settings.startup_description}
            </p>
          )}
          {settings.startup_website && (
            <a
              href={settings.startup_website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Visit Website →
            </a>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {settings.show_mrr && stats && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">
                Monthly Recurring Revenue
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {displayValue(stats.current_mrr, settings.revenue_display_mode)}
              </div>
            </div>
          )}

          {settings.show_arr && stats && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">
                Annual Recurring Revenue
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {displayValue(stats.current_arr, settings.revenue_display_mode)}
              </div>
            </div>
          )}

          {settings.show_revenue && stats && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">
                Total Revenue
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {displayValue(stats.total_revenue, settings.revenue_display_mode)}
              </div>
            </div>
          )}

          {settings.show_customers && stats && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">
                Customers
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.customer_count.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Revenue Chart */}
        {settings.show_mrr && stats && stats.chart_data.length > 0 && settings.revenue_display_mode === 'exact' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.chart_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  }}
                />
                <YAxis
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(value), 'MRR']}
                  labelFormatter={(date) => {
                    const d = new Date(date);
                    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="mrr"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Founder Info */}
        {settings.founder_name && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-5xl mb-4">👋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Built by {settings.founder_name}
            </h3>
            <p className="text-gray-600">
              Building in public with transparent revenue tracking
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>
            Powered by{' '}
            <a
              href="https://github.com/openrevenue"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700"
            >
              OpenRevenue
            </a>
            {' '}- Open source revenue transparency
          </p>
        </div>
      </footer>
    </div>
  );
}
