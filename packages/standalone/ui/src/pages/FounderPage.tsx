import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SocialLinks } from '../components/SocialLinks';

interface Settings {
  startup_name: string;
  startup_tagline?: string;
  startup_description?: string;
  startup_website?: string;
  startup_logo?: string;
  founder_name?: string;
  founder_email?: string;
  founder_twitter?: string;
  founder_linkedin?: string;
  founder_github?: string;
  founder_instagram?: string;
  founder_facebook?: string;
  founder_youtube?: string;
  founder_tiktok?: string;
  founder_threads?: string;
  founder_medium?: string;
  founder_website?: string;
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
  last_30_days_revenue: number;
  currency: string;
}

export function FounderPage() {
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

  function createUsernameSlug(name?: string, email?: string): string {
    if (name) {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    if (email) {
      return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
    return 'founder';
  }

  async function handleShare() {
    const shareUrl = window.location.href;
    const title = `${settings?.founder_name || 'Founder'} on OpenRevenue`;

    if (navigator.share) {
      try {
        await navigator.share({ url: shareUrl, title });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
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

  if (!settings || !settings.founder_name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Founder Information Not Available</h1>
            <p className="text-gray-600 mb-4">Founder details have not been set up yet.</p>
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName = settings.founder_name || settings.founder_email?.split('@')[0] || 'Founder';
  const username = createUsernameSlug(settings.founder_name, settings.founder_email);
  const shareUrl = window.location.href;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                {displayName[0]?.toUpperCase() || 'F'}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-1">@{username}</h1>
                {settings.founder_name && (
                  <p className="text-gray-600">{settings.founder_name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
              <SocialLinks
                socialLinks={{
                  twitter: settings.founder_twitter,
                  linkedin: settings.founder_linkedin,
                  github: settings.founder_github,
                  instagram: settings.founder_instagram,
                  facebook: settings.founder_facebook,
                  youtube: settings.founder_youtube,
                  tiktok: settings.founder_tiktok,
                  threads: settings.founder_threads,
                  medium: settings.founder_medium,
                  website: settings.founder_website,
                }}
              />
            </div>
          </div>

          <p className="text-gray-600">
            1 startup with verified revenue
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Total revenue</div>
            <div className="text-2xl font-bold">
              {settings.show_revenue && stats
                ? formatCurrency(stats.total_revenue)
                : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 mt-1">Across all startups</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Last 30 days</div>
            <div className="text-2xl font-bold">
              {settings.show_revenue && stats
                ? formatCurrency(stats.last_30_days_revenue)
                : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 mt-1">Recent revenue</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Total MRR</div>
            <div className="text-2xl font-bold">
              {settings.show_mrr && stats ? formatCurrency(stats.current_mrr) : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats && stats.current_mrr > 0 ? 'Work in progress' : 'No MRR data'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Startups</div>
            <div className="text-2xl font-bold">1</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats && stats.customer_count > 0
                ? `${stats.customer_count} total customers`
                : 'No customers'}
            </div>
          </div>
        </div>

        {/* Startup Card */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Startups by @{username}</h2>
          <Link to="/">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {settings.startup_logo ? (
                    <img
                      src={settings.startup_logo}
                      alt={settings.startup_name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                      {settings.startup_name[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{settings.startup_name}</h3>
                    {settings.startup_tagline && (
                      <p className="text-gray-600 text-sm mb-2">{settings.startup_tagline}</p>
                    )}
                    {settings.startup_description && (
                      <p className="text-gray-500 text-sm">{settings.startup_description}</p>
                    )}
                  </div>
                </div>

                {stats && (
                  <div className="grid grid-cols-3 gap-4 pt-4 mt-4 border-t">
                    {settings.show_revenue && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Revenue
                        </div>
                        <div className="font-semibold text-sm">
                          {formatCurrency(stats.total_revenue)}
                        </div>
                      </div>
                    )}

                    {settings.show_mrr && stats.current_mrr > 0 && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                          MRR
                        </div>
                        <div className="font-semibold text-sm">
                          {formatCurrency(stats.current_mrr)}
                        </div>
                      </div>
                    )}

                    {settings.show_customers && stats.customer_count > 0 && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                          Customers
                        </div>
                        <div className="font-semibold text-sm">{stats.customer_count}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <footer className="border-t pt-8 mt-12 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} OpenRevenue. Open source and free forever.</p>
        </footer>
      </div>
    </div>
  );
}
