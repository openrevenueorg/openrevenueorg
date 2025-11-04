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
// Using inline SVG icons instead of lucide-react for standalone app

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
    async function loadData() {
      try {
        // Load settings
        const settingsRes = await fetch('/api/v1/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
        }

        // Load public stats
        const statsRes = await fetch('/api/v1/revenue/public-stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function formatCurrency(amount?: number) {
    if (amount === undefined || amount === null) return 'N/A';
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to OpenRevenue</h1>
          <p className="text-gray-600 mb-4">Setting up your revenue transparency page...</p>
          <Link to="/onboarding" className="text-indigo-600 hover:text-indigo-700">
            Complete Setup →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {settings.startup_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">{settings.startup_name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Online</span>
                  </div>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">Powered by OpenRevenue</span>
                </div>
              </div>
            </div>
            <Link
              to="/login"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Dashboard Login →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Self-Hosted & Verified
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            {settings.startup_name}
          </h1>
          {settings.startup_tagline && (
            <p className="text-xl text-gray-600 mb-4">{settings.startup_tagline}</p>
          )}
          {settings.startup_description && (
            <p className="text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              {settings.startup_description}
            </p>
          )}
          {settings.startup_website && (
            <a
              href={settings.startup_website}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Visit Website
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {settings.show_mrr && (
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                  Monthly Recurring Revenue
                </div>
                <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats && settings.revenue_display_mode === 'exact'
                  ? formatCurrency(stats.current_mrr)
                  : settings.revenue_display_mode === 'range'
                  ? `~${formatCurrency(stats?.current_mrr)}`
                  : 'Hidden'}
              </div>
            </div>
          )}

          {settings.show_arr && (
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                  Annual Recurring Revenue
                </div>
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats && settings.revenue_display_mode === 'exact'
                  ? formatCurrency(stats.current_arr)
                  : settings.revenue_display_mode === 'range'
                  ? `~${formatCurrency(stats?.current_arr)}`
                  : 'Hidden'}
              </div>
            </div>
          )}

          {settings.show_revenue && (
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                  Total Revenue (30d)
                </div>
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats && settings.revenue_display_mode === 'exact'
                  ? formatCurrency(stats.total_revenue)
                  : settings.revenue_display_mode === 'range'
                  ? `~${formatCurrency(stats?.total_revenue)}`
                  : 'Hidden'}
              </div>
            </div>
          )}

          {settings.show_customers && (
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                  Customers
                </div>
                <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats && settings.revenue_display_mode === 'exact'
                  ? stats.customer_count.toLocaleString()
                  : settings.revenue_display_mode === 'range'
                  ? `~${stats.customer_count.toLocaleString()}`
                  : 'Hidden'}
              </div>
            </div>
          )}
        </div>

        {/* Growth Rate Display */}
        {stats && stats.growth_rate !== undefined && stats.growth_rate !== null && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-md p-6 mb-12 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-700 uppercase tracking-wide font-medium mb-1">
                  Growth Rate
                </div>
                <div className="text-3xl font-bold text-green-900">
                  {stats.growth_rate > 0 ? '+' : ''}
                  {stats.growth_rate.toFixed(1)}%
                </div>
                <div className="text-sm text-green-600 mt-1">Month over Month</div>
              </div>
              <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        )}

        {/* Revenue Chart */}
        {settings.show_mrr &&
          stats &&
          stats.chart_data &&
          stats.chart_data.length > 0 &&
          settings.revenue_display_mode === 'exact' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Revenue Trend</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Last 12 Months</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.chart_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    }}
                    stroke="#6b7280"
                  />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value)}
                    stroke="#6b7280"
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(value), 'MRR']}
                    labelFormatter={(date) => {
                      const d = new Date(date);
                      return d.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      });
                    }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mrr"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#6366f1' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

        {/* Verification & Trust Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Data Verification</h2>
              <p className="text-gray-600 mb-4">
                All revenue data displayed on this page is cryptographically signed for
                authenticity. This ensures that the metrics shown are genuine and have not been
                tampered with.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <svg className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-amber-900 mb-1">Self-Reported Data</div>
                    <p className="text-sm text-amber-800">
                      This revenue data is self-reported through a self-hosted OpenRevenue
                      instance. While cryptographically signed, the data has not been independently
                      verified by a third party.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Founder Info */}
        {settings.founder_name && (
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-md p-8 text-center text-white mb-12">
            <div className="text-6xl mb-4">👋</div>
            <h3 className="text-2xl font-bold mb-2">Built by {settings.founder_name}</h3>
            <p className="text-indigo-100 max-w-2xl mx-auto">
              Building in public with transparent revenue tracking. Join us on our journey as we
              share our metrics openly.
            </p>
          </div>
        )}

        {/* About Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Instance</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              This is a self-hosted instance of OpenRevenue, an open-source revenue transparency
              platform. By hosting our own instance, we maintain complete control over our data
              while still sharing it transparently with the community.
            </p>
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">API Information</h3>
              <p className="text-sm mb-3">
                This OpenRevenue Standalone App provides a public API for programmatic access to
                revenue data:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-mono">GET</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    /api/v1/health
                  </code>
                  <span className="text-gray-500">- Health check endpoint</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-mono">GET</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    /api/v1/revenue/public-stats
                  </code>
                  <span className="text-gray-500">- Public revenue statistics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-mono">POST</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    /api/v1/revenue/signed
                  </code>
                  <span className="text-gray-500">- Signed revenue data (requires API key)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-indigo-50 rounded-lg shadow-md p-8 text-center border border-indigo-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Interested in Building in Public?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            OpenRevenue is open-source and free. Deploy your own instance or use the managed
            platform to start sharing your revenue transparently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/openrevenue/openrevenue"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              View on GitHub
            </a>
            <a
              href="https://openrevenue.org"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Learn More
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-600">
                Powered by{' '}
                <a
                  href="https://openrevenue.org"
                  target="_blank"
                  rel="noopener"
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  OpenRevenue
                </a>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Open Source Revenue Verification Platform
              </p>
            </div>
            <div className="flex gap-6">
              <a
                href="https://github.com/openrevenue/openrevenue"
                target="_blank"
                rel="noopener"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://openrevenue.org"
                target="_blank"
                rel="noopener"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
