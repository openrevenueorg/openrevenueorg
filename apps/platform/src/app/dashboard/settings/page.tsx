'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, XCircle, Crown, Award, Medal, Copy, Check, Twitter, Github, Linkedin, MessageCircle, Youtube, Instagram } from 'lucide-react';
import SelectMenu from '@/components/ui/select-menu';


const generalSettingsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const socialLinksSchema = z.object({
  twitterHandle: z.string().optional(),
  githubHandle: z.string().optional(),
  linkedinHandle: z.string().optional(),
  discordUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  youtubeUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  instagramHandle: z.string().optional(),
});

const privacySettingsSchema = z.object({
  showRevenue: z.boolean(),
  showMRR: z.boolean(),
  showARR: z.boolean(),
  showCustomerCount: z.boolean(),
  revenueDisplayMode: z.enum(['exact', 'range', 'hidden']),
});

type GeneralSettings = z.infer<typeof generalSettingsSchema>;
type PrivacySettings = z.infer<typeof privacySettingsSchema>;
type SocialLinks = z.infer<typeof socialLinksSchema>;

interface Startup {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logo?: string;
  imageUrl?: string;
  privacySettings: PrivacySettings;
  isPublished?: boolean;
  tier?: 'BRONZE' | 'SILVER' | 'GOLD';
  featureScore?: number;
  twitterHandle?: string;
  githubHandle?: string;
  linkedinHandle?: string;
  discordUrl?: string;
  youtubeUrl?: string;
  instagramHandle?: string;
}

interface TierRequirement {
  key: string;
  label: string;
  met: boolean;
  required: boolean;
}

interface PublishStatus {
  isPublished: boolean;
  currentTier: 'BRONZE' | 'SILVER' | 'GOLD';
  featureScore: number;
  canPublish: boolean;
  validation: {
    tier: 'BRONZE' | 'SILVER' | 'GOLD';
    canPublish: boolean;
    canUpgrade: boolean;
    nextTier: 'SILVER' | 'GOLD' | null;
    requirements: TierRequirement[];
    score: number;
  };
}

export default function SettingsPage() {
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [publishStatus, setPublishStatus] = useState<PublishStatus | null>(null);
  const [loadingPublishStatus, setLoadingPublishStatus] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  const [startupList, setStartupList] = useState<Startup[]>([]);

  const generalForm = useForm<GeneralSettings>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      website: '',
    },
  });

  const privacyForm = useForm<PrivacySettings>({
    resolver: zodResolver(privacySettingsSchema),
    defaultValues: {
      showRevenue: true,
      showMRR: true,
      showARR: true,
      showCustomerCount: true,
      revenueDisplayMode: 'exact',
    },
  });

  const socialForm = useForm<SocialLinks>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      twitterHandle: '',
      githubHandle: '',
      linkedinHandle: '',
      discordUrl: '',
      youtubeUrl: '',
      instagramHandle: '',
    },
  });

  // Fetch startup data
  useEffect(() => {
    const fetchStartup = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/startups');
        if (response.ok) {
          const startups = await response.json();
          if (startups.length > 0) {
            const startup = startups[0];
            setStartup(startup);

            setStartupList(startups as Startup[]);
            // Update general form
            generalForm.reset({
              name: startup.name,
              slug: startup.slug,
              description: startup.description || '',
              website: startup.website || '',
            });

            // Update privacy form
            if (startup.privacySettings) {
              privacyForm.reset(startup.privacySettings);
            }

            // Update social links form
            socialForm.reset({
              twitterHandle: startup.twitterHandle || '',
              githubHandle: startup.githubHandle || '',
              linkedinHandle: startup.linkedinHandle || '',
              discordUrl: startup.discordUrl || '',
              youtubeUrl: startup.youtubeUrl || '',
              instagramHandle: startup.instagramHandle || '',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching startup:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStartup();
  }, []);

  // Fetch publish status when startup changes
  useEffect(() => {
    const fetchPublishStatus = async () => {
      if (!startup?.id) return;

      setLoadingPublishStatus(true);
      try {
        const response = await fetch(`/api/startups/${startup.id}/publish`);
        if (response.ok) {
          const data = await response.json();
          setPublishStatus(data);
        }
      } catch (error) {
        console.error('Error fetching publish status:', error);
      } finally {
        setLoadingPublishStatus(false);
      }
    };

    fetchPublishStatus();
  }, [startup?.id]);

  // if (!session?.user) {
  //   // router.push('/');
  //   // router.refresh();
  //   notFound();
  // }

  const handlePublish = async () => {
    if (!startup?.id) return;

    setPublishing(true);
    try {
      const response = await fetch(`/api/startups/${startup.id}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish startup');
      }

      alert('Startup published successfully!');

      // Refresh publish status
      const statusResponse = await fetch(`/api/startups/${startup.id}/publish`);
      if (statusResponse.ok) {
        const data = await statusResponse.json();
        setPublishStatus(data);
      }
    } catch (error: any) {
      console.error('Error publishing startup:', error);
      alert(error.message || 'Failed to publish startup. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!startup?.id) return;

    if (!confirm('Are you sure you want to unpublish your startup? It will be removed from public listings.')) {
      return;
    }

    setPublishing(true);
    try {
      const response = await fetch(`/api/startups/${startup.id}/publish`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unpublish startup');
      }

      alert('Startup unpublished successfully!');

      // Refresh publish status
      const statusResponse = await fetch(`/api/startups/${startup.id}/publish`);
      if (statusResponse.ok) {
        const data = await statusResponse.json();
        setPublishStatus(data);
      }
    } catch (error) {
      console.error('Error unpublishing startup:', error);
      alert('Failed to unpublish startup. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const onSubmitGeneral = async (data: GeneralSettings) => {
    if (!startup) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/startups/${startup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update startup');
      }

      const updatedStartup = await response.json();
      setStartup(updatedStartup);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error updating startup:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onSubmitPrivacy = async (data: PrivacySettings) => {
    if (!startup) return;

    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startupId: startup.id, ...data }),
      });

      if (!response.ok) {
        throw new Error('Failed to update privacy settings');
      }

      alert('Privacy settings saved successfully!');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      alert('Failed to save privacy settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onSubmitSocial = async (data: SocialLinks) => {
    if (!startup) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/startups/${startup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update social links');
      }

      const updatedStartup = await response.json();
      setStartup(updatedStartup);
      alert('Social links saved successfully!');
    } catch (error) {
      console.error('Error updating social links:', error);
      alert('Failed to save social links. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const copyEmbedCode = async () => {
    if (!startup) return;

    const embedCode = `<a href="${typeof window !== 'undefined' ? window.location.origin : ''}/startup/${startup.slug}" target="_blank"><img src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/embed/${startup.slug}?format=svg" alt="OpenRevenue verified revenue badge" width="220" height="90" /></a>`;

    try {
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    } catch (error) {
      console.error('Error copying embed code:', error);
      alert('Failed to copy code. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              No startup found. Please complete onboarding first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your startup settings and preferences
        </p>
        <SelectMenu selectTitle="Select a Startup" menuItems={startupList.map((startup) => ({ name: startup.name, label: startup.slug, image: startup?.imageUrl || '' }))} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="visibility">Visibility</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Update your startup information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Startup Name *</Label>
                  <Input
                    id="name"
                    placeholder="Acme Inc"
                    {...generalForm.register('name')}
                  />
                  {generalForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {generalForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      openrevenue.org/startup/
                    </span>
                    <Input
                      id="slug"
                      placeholder="acme-inc"
                      {...generalForm.register('slug')}
                    />
                  </div>
                  {generalForm.formState.errors.slug && (
                    <p className="text-sm text-destructive">
                      {generalForm.formState.errors.slug.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your startup"
                    {...generalForm.register('description')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    {...generalForm.register('website')}
                  />
                  {generalForm.formState.errors.website && (
                    <p className="text-sm text-destructive">
                      {generalForm.formState.errors.website.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control what revenue data is publicly visible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={privacyForm.handleSubmit(onSubmitPrivacy)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Revenue</Label>
                      <p className="text-sm text-muted-foreground">
                        Display total revenue on your public page
                      </p>
                    </div>
                    <Switch
                      checked={privacyForm.watch('showRevenue')}
                      onCheckedChange={(checked) => privacyForm.setValue('showRevenue', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show MRR</Label>
                      <p className="text-sm text-muted-foreground">
                        Display Monthly Recurring Revenue
                      </p>
                    </div>
                    <Switch
                      checked={privacyForm.watch('showMRR')}
                      onCheckedChange={(checked) => privacyForm.setValue('showMRR', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show ARR</Label>
                      <p className="text-sm text-muted-foreground">
                        Display Annual Recurring Revenue
                      </p>
                    </div>
                    <Switch
                      checked={privacyForm.watch('showARR')}
                      onCheckedChange={(checked) => privacyForm.setValue('showARR', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Customer Count</Label>
                      <p className="text-sm text-muted-foreground">
                        Display number of customers
                      </p>
                    </div>
                    <Switch
                      checked={privacyForm.watch('showCustomerCount')}
                      onCheckedChange={(checked) => privacyForm.setValue('showCustomerCount', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Revenue Display Mode</Label>
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      {...privacyForm.register('revenueDisplayMode')}
                    >
                      <option value="exact">Exact Amount</option>
                      <option value="range">Range (e.g., $10k-$50k)</option>
                      <option value="hidden">Hidden</option>
                    </select>
                    <p className="text-sm text-muted-foreground">
                      Choose how revenue values appear on your public page
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visibility" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing & Visibility</CardTitle>
              <CardDescription>
                Manage your startup&apos;s public visibility and tier status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPublishStatus ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : publishStatus ? (
                <div className="space-y-6">
                  {/* Tier Badge Section */}
                  <div className="p-6 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          Your Tier:
                          <Badge variant="outline" className="text-lg px-3 py-1">
                            {publishStatus.currentTier === 'GOLD' && <Crown className="h-4 w-4 mr-1 text-yellow-600" />}
                            {publishStatus.currentTier === 'SILVER' && <Award className="h-4 w-4 mr-1 text-gray-400" />}
                            {publishStatus.currentTier === 'BRONZE' && <Medal className="h-4 w-4 mr-1 text-orange-600" />}
                            {publishStatus.currentTier}
                          </Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {publishStatus.currentTier === 'GOLD' && 'Maximum visibility and features'}
                          {publishStatus.currentTier === 'SILVER' && 'Enhanced profile and visibility'}
                          {publishStatus.currentTier === 'BRONZE' && 'Basic publishing enabled'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{publishStatus.featureScore?.toFixed(0)}</div>
                        <div className="text-sm text-muted-foreground">Feature Score</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 via-gray-400 to-yellow-500 transition-all"
                          style={{ width: `${publishStatus.featureScore}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0</span>
                        <span>50 (Featured Eligible)</span>
                        <span>100</span>
                      </div>
                    </div>
                  </div>

                  {/* Publishing Status */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {publishStatus.isPublished ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="font-semibold">Published</div>
                            <div className="text-sm text-muted-foreground">
                              Your startup is visible on the leaderboard
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-semibold">Not Published</div>
                            <div className="text-sm text-muted-foreground">
                              Your startup is not visible publicly
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {publishStatus.isPublished ? (
                      <Button
                        variant="outline"
                        onClick={handleUnpublish}
                        disabled={publishing}
                      >
                        {publishing ? 'Unpublishing...' : 'Unpublish'}
                      </Button>
                    ) : (
                      <Button
                        onClick={handlePublish}
                        disabled={!publishStatus.canPublish || publishing}
                      >
                        {publishing ? 'Publishing...' : 'Publish Startup'}
                      </Button>
                    )}
                  </div>

                  {/* Requirements Checklist */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                    <div className="space-y-3">
                      {publishStatus.validation.requirements.map((req) => (
                        <div
                          key={req.key}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {req.met ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            )}
                            <div>
                              <div className="font-medium">{req.label}</div>
                              {req.required && !req.met && (
                                <div className="text-sm text-muted-foreground">Required for current tier</div>
                              )}
                            </div>
                          </div>
                          {req.required && (
                            <Badge variant="secondary" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Tier Info */}
                  {publishStatus.validation.nextTier && publishStatus.validation.canUpgrade && (
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-semibold">Upgrade to {publishStatus.validation.nextTier}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Complete the remaining requirements above to unlock enhanced visibility and features.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Help Text */}
                  {!publishStatus.canPublish && (
                    <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950">
                      <div className="text-sm">
                        <strong>Cannot publish yet.</strong> Complete the required items above to publish your startup.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Failed to load publishing status. Please refresh the page.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Embed Code Generator */}
          {publishStatus?.isPublished && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Embed Badge</CardTitle>
                <CardDescription>
                  Add your verified revenue badge to your website or README
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Preview */}
                  <div>
                    <Label className="mb-2 block">Preview</Label>
                    <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                      <img
                        src={`/api/embed/${startup.slug}?format=svg`}
                        alt="OpenRevenue verified revenue badge"
                        width="220"
                        height="90"
                      />
                    </div>
                  </div>

                  {/* Embed Code */}
                  <div>
                    <Label className="mb-2 block">Embed Code</Label>
                    <div className="relative">
                      <Textarea
                        readOnly
                        value={`<a href="${typeof window !== 'undefined' ? window.location.origin : ''}/startup/${startup.slug}" target="_blank"><img src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/embed/${startup.slug}?format=svg" alt="OpenRevenue verified revenue badge" width="220" height="90" /></a>`}
                        className="font-mono text-sm pr-24"
                        rows={4}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2"
                        onClick={copyEmbedCode}
                      >
                        {embedCopied ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Copy this code and paste it into your website or GitHub README to display your verified revenue badge.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>
                Connect your social media accounts for enhanced avatar and profile features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={socialForm.handleSubmit(onSubmitSocial)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twitterHandle" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter / X Handle
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">@</span>
                    <Input
                      id="twitterHandle"
                      placeholder="username"
                      {...socialForm.register('twitterHandle')}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your Twitter/X username (without @)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="githubHandle" className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub Username
                  </Label>
                  <Input
                    id="githubHandle"
                    placeholder="username"
                    {...socialForm.register('githubHandle')}
                  />
                  <p className="text-sm text-muted-foreground">
                    Your GitHub username
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinHandle" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn Company Handle
                  </Label>
                  <Input
                    id="linkedinHandle"
                    placeholder="company-name"
                    {...socialForm.register('linkedinHandle')}
                  />
                  <p className="text-sm text-muted-foreground">
                    Your LinkedIn company handle
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discordUrl" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Discord Server
                  </Label>
                  <Input
                    id="discordUrl"
                    type="url"
                    placeholder="https://discord.gg/..."
                    {...socialForm.register('discordUrl')}
                  />
                  {socialForm.formState.errors.discordUrl && (
                    <p className="text-sm text-destructive">
                      {socialForm.formState.errors.discordUrl.message}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Discord server invite URL
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl" className="flex items-center gap-2">
                    <Youtube className="h-4 w-4" />
                    YouTube Channel
                  </Label>
                  <Input
                    id="youtubeUrl"
                    type="url"
                    placeholder="https://youtube.com/@channel"
                    {...socialForm.register('youtubeUrl')}
                  />
                  {socialForm.formState.errors.youtubeUrl && (
                    <p className="text-sm text-destructive">
                      {socialForm.formState.errors.youtubeUrl.message}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    YouTube channel URL
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagramHandle" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram Handle
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">@</span>
                    <Input
                      id="instagramHandle"
                      placeholder="username"
                      {...socialForm.register('instagramHandle')}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your Instagram username (without @)
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your account profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="your@email.com" disabled />
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed. Contact support if you need to update it.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">Active</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold text-destructive mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data.
                  </p>
                  <Button variant="destructive" disabled>
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
