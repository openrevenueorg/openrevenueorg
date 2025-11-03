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
import { RefreshCw } from 'lucide-react';

const generalSettingsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
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

interface Startup {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  privacySettings: PrivacySettings;
}

export default function SettingsPage() {
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
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
                      openrevenue.com/startup/
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
