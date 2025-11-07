'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Crown, TrendingUp, Eye, MousePointerClick, Calendar, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FeaturedStartup {
  id: string;
  name: string;
  slug: string;
  featuredAt: string;
  featuredUntil: string;
  featureScore: number;
  currentMRR: number;
  featureImpressions: number;
  featureClicks: number;
  isExpired: boolean;
  tier: 'BRONZE' | 'SILVER' | 'GOLD';
}

interface FeatureSuggestion {
  startupId: string;
  startupName: string;
  score: number;
  breakdown: {
    trustLevel: number;
    revenue: number;
    growth: number;
    engagement: number;
    completeness: number;
    recency: number;
  };
  eligible: boolean;
  reason?: string;
}

interface FeaturedData {
  featured: FeaturedStartup[];
  suggestions: FeatureSuggestion[];
  stats: {
    totalSlots: number;
    usedSlots: number;
    availableSlots: number;
  };
}

export default function FeaturedManagementPage() {
  const [data, setData] = useState<FeaturedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [extensionDays, setExtensionDays] = useState<{ [key: string]: number }>({});

  const fetchFeaturedData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/featured');
      if (response.ok) {
        const fetchedData = await response.json();
        setData(fetchedData);
      }
    } catch (error) {
      console.error('Error fetching featured data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedData();
  }, []);

  const handleFeature = async (startupId: string, durationDays: number = 7) => {
    setActionLoading(startupId);
    try {
      const response = await fetch('/api/admin/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startupId, durationDays }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to feature startup');
      }

      alert('Startup featured successfully!');
      await fetchFeaturedData();
    } catch (error: any) {
      console.error('Error featuring startup:', error);
      alert(error.message || 'Failed to feature startup. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnfeature = async (startupId: string) => {
    if (!confirm('Are you sure you want to unfeature this startup?')) {
      return;
    }

    setActionLoading(startupId);
    try {
      const response = await fetch(`/api/admin/featured/${startupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unfeature startup');
      }

      alert('Startup unfeatured successfully!');
      await fetchFeaturedData();
    } catch (error) {
      console.error('Error unfeaturing startup:', error);
      alert('Failed to unfeature startup. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExtend = async (startupId: string) => {
    const days = extensionDays[startupId] || 7;

    setActionLoading(startupId);
    try {
      const response = await fetch(`/api/admin/featured/${startupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extensionDays: days }),
      });

      if (!response.ok) {
        throw new Error('Failed to extend featuring duration');
      }

      const result = await response.json();
      alert(`Featured duration extended! Click rate: ${result.performance.clickRate}`);
      await fetchFeaturedData();
    } catch (error) {
      console.error('Error extending duration:', error);
      alert('Failed to extend duration. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading featured data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Failed to load featured data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Featured Slots
          </CardTitle>
          <CardDescription>
            {data.stats.usedSlots} of {data.stats.totalSlots} slots currently in use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {Array.from({ length: data.stats.totalSlots }).map((_, i) => (
              <div
                key={i}
                className={`h-12 flex-1 rounded border-2 ${
                  i < data.stats.usedSlots
                    ? 'bg-yellow-100 border-yellow-600 dark:bg-yellow-900'
                    : 'bg-gray-100 border-gray-300 dark:bg-gray-800'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Currently Featured */}
      <Card>
        <CardHeader>
          <CardTitle>Currently Featured ({data.featured.length})</CardTitle>
          <CardDescription>Manage featured startups and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          {data.featured.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No featured startups. Select from suggestions below.
            </div>
          ) : (
            <div className="space-y-4">
              {data.featured.map((startup) => {
                const clickRate =
                  startup.featureImpressions > 0
                    ? ((startup.featureClicks / startup.featureImpressions) * 100)?.toFixed(2)
                    : '0.00';

                return (
                  <div key={startup.id} className="p-4 border rounded-lg space-y-3">
                    {/* Startup Info */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{startup.name}</h3>
                          <Badge variant="outline">{startup.tier}</Badge>
                          {startup.isExpired && (
                            <Badge variant="destructive" className="text-xs">
                              Expired
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">/{startup.slug}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{startup?.featureScore?.toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground">Feature Score</div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-semibold">{startup.featureImpressions}</div>
                          <div className="text-xs text-muted-foreground">Impressions</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-semibold">{startup.featureClicks}</div>
                          <div className="text-xs text-muted-foreground">Clicks</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-semibold">{clickRate}%</div>
                          <div className="text-xs text-muted-foreground">CTR</div>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Featured: {new Date(startup?.featuredAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Until: {new Date(startup?.featuredUntil).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <div className="flex items-center gap-2 flex-1">
                        <Label htmlFor={`extend-${startup.id}`} className="text-xs">
                          Extend by:
                        </Label>
                        <Input
                          id={`extend-${startup.id}`}
                          type="number"
                          min="1"
                          max="7"
                          value={extensionDays[startup.id] || 7}
                          onChange={(e) =>
                            setExtensionDays({
                              ...extensionDays,
                              [startup.id]: parseInt(e.target.value) || 7,
                            })
                          }
                          className="w-20"
                        />
                        <span className="text-xs text-muted-foreground">days</span>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExtend(startup.id)}
                        disabled={actionLoading === startup.id}
                      >
                        {actionLoading === startup.id ? 'Extending...' : 'Extend'}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUnfeature(startup.id)}
                        disabled={actionLoading === startup.id}
                      >
                        {actionLoading === startup.id ? 'Removing...' : 'Unfeature'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Feature Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Top Suggestions ({data.suggestions.length})</CardTitle>
          <CardDescription>
            Startups eligible for featuring based on feature score (50+ points)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.suggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No eligible suggestions at this time.
            </div>
          ) : (
            <div className="space-y-4">
              {data.suggestions.map((suggestion) => (
                <div key={suggestion.startupId} className="p-4 border rounded-lg space-y-3">
                  {/* Startup Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{suggestion.startupName}</h3>
                        {suggestion.eligible ? (
                          <Badge variant="default" className="bg-green-600">
                            <Star className="h-3 w-3 mr-1" />
                            Eligible
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Not Eligible</Badge>
                        )}
                      </div>
                      {suggestion.reason && (
                        <p className="text-sm text-muted-foreground mt-1">{suggestion.reason}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{suggestion.score?.toFixed(0)}</div>
                      <div className="text-xs text-muted-foreground">Total Score</div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-muted-foreground">Trust:</span>
                      <span className="font-semibold">{suggestion.breakdown.trustLevel}/25</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="font-semibold">{suggestion.breakdown.revenue}/20</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-muted-foreground">Growth:</span>
                      <span className="font-semibold">{suggestion.breakdown.growth}/20</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-muted-foreground">Engagement:</span>
                      <span className="font-semibold">{suggestion.breakdown.engagement}/15</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-muted-foreground">Complete:</span>
                      <span className="font-semibold">{suggestion.breakdown.completeness}/10</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-muted-foreground">Recency:</span>
                      <span className="font-semibold">{suggestion.breakdown.recency}/10</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {suggestion.eligible && (
                    <div className="pt-2 border-t">
                      <Button
                        size="sm"
                        onClick={() => handleFeature(suggestion.startupId)}
                        disabled={
                          actionLoading === suggestion.startupId ||
                          data.stats.availableSlots === 0
                        }
                      >
                        {actionLoading === suggestion.startupId
                          ? 'Featuring...'
                          : 'Feature for 7 Days'}
                      </Button>
                      {data.stats.availableSlots === 0 && (
                        <p className="text-xs text-destructive mt-2">
                          All slots are full. Unfeature a startup first.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
