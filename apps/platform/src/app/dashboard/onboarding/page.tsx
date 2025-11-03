'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Step 1: Startup Details Schema
const startupDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  categoryId: z.string().optional(),
});

// Step 2: Privacy Settings Schema
const privacySettingsSchema = z.object({
  showRevenue: z.boolean(),
  showMRR: z.boolean(),
  showARR: z.boolean(),
  showCustomerCount: z.boolean(),
  revenueDisplayMode: z.enum(['exact', 'range', 'hidden']),
});

// Step 3: Connection Schema
const connectionSchema = z.object({
  type: z.enum(['direct', 'standalone']),
  provider: z.string().min(1, 'Provider is required'),
  name: z.string().min(1, 'Connection name is required'),
  apiKey: z.string().optional(),
  endpoint: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  standaloneApiKey: z.string().optional(),
});

type StartupDetails = z.infer<typeof startupDetailsSchema>;
type PrivacySettings = z.infer<typeof privacySettingsSchema>;
type Connection = z.infer<typeof connectionSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [startupId, setStartupId] = useState<string | null>(null);

  // Step 1: Startup Details Form
  const startupForm = useForm<StartupDetails>({
    resolver: zodResolver(startupDetailsSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      website: '',
      categoryId: '',
    },
  });

  // Step 2: Privacy Settings Form
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

  // Step 3: Connection Form
  const connectionForm = useForm<Connection>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      type: 'direct',
      provider: 'stripe',
      name: '',
      apiKey: '',
      endpoint: '',
      standaloneApiKey: '',
    },
  });

  const onSubmitStartup = async (data: StartupDetails) => {
    setLoading(true);
    try {
      const response = await fetch('/api/startups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create startup');
      }

      const startup = await response.json();
      setStartupId(startup.id);
      setStep(2);
    } catch (error) {
      console.error('Error creating startup:', error);
      alert('Failed to create startup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPrivacy = async (data: PrivacySettings) => {
    if (!startupId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startupId, ...data }),
      });

      if (!response.ok) {
        throw new Error('Failed to update privacy settings');
      }

      setStep(3);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      alert('Failed to update privacy settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitConnection = async (data: Connection) => {
    if (!startupId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, startupId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create connection');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating connection:', error);
      alert('Failed to create connection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipConnection = () => {
    router.push('/dashboard');
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    startupForm.setValue('name', name);

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    startupForm.setValue('slug', slug);
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to OpenRevenue</h1>
        <p className="text-muted-foreground">
          Let's set up your startup profile in just a few steps
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                s === step
                  ? 'bg-primary text-primary-foreground'
                  : s < step
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`h-0.5 flex-1 mx-2 ${
                  s < step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Startup Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Startup Details</CardTitle>
            <CardDescription>
              Tell us about your startup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={startupForm.handleSubmit(onSubmitStartup)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Startup Name *</Label>
                <Input
                  id="name"
                  placeholder="Acme Inc"
                  {...startupForm.register('name')}
                  onChange={handleNameChange}
                />
                {startupForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {startupForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">openrevenue.com/startup/</span>
                  <Input
                    id="slug"
                    placeholder="acme-inc"
                    {...startupForm.register('slug')}
                  />
                </div>
                {startupForm.formState.errors.slug && (
                  <p className="text-sm text-destructive">
                    {startupForm.formState.errors.slug.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your startup"
                  {...startupForm.register('description')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  {...startupForm.register('website')}
                />
                {startupForm.formState.errors.website && (
                  <p className="text-sm text-destructive">
                    {startupForm.formState.errors.website.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Continue'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Privacy Settings */}
      {step === 2 && (
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
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Continue'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: First Connection */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your First Data Source</CardTitle>
            <CardDescription>
              Connect a payment processor or standalone app (you can skip this for now)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={connectionForm.handleSubmit(onSubmitConnection)} className="space-y-4">
              <div className="space-y-2">
                <Label>Connection Type</Label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  {...connectionForm.register('type')}
                >
                  <option value="direct">Direct Integration</option>
                  <option value="standalone">Standalone App</option>
                </select>
              </div>

              {connectionForm.watch('type') === 'direct' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <select
                      id="provider"
                      className="w-full border rounded-md px-3 py-2"
                      {...connectionForm.register('provider')}
                    >
                      <option value="stripe">Stripe</option>
                      <option value="paddle">Paddle</option>
                      <option value="lemonsqueezy">Lemon Squeezy</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Connection Name</Label>
                    <Input
                      id="name"
                      placeholder="My Stripe Account"
                      {...connectionForm.register('name')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="sk_test_..."
                      {...connectionForm.register('apiKey')}
                    />
                  </div>
                </>
              )}

              {connectionForm.watch('type') === 'standalone' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Connection Name</Label>
                    <Input
                      id="name"
                      placeholder="My Standalone App"
                      {...connectionForm.register('name')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endpoint">Endpoint URL</Label>
                    <Input
                      id="endpoint"
                      type="url"
                      placeholder="https://revenue.example.com"
                      {...connectionForm.register('endpoint')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="standaloneApiKey">API Key</Label>
                    <Input
                      id="standaloneApiKey"
                      type="password"
                      placeholder="Your standalone app API key"
                      {...connectionForm.register('standaloneApiKey')}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={handleSkipConnection}>
                    Skip for now
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Finish'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
