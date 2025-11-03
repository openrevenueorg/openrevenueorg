'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TrustBadge } from '@/components/ui/trust-badge';
import { Plus, Trash2, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

const connectionSchema = z.object({
  type: z.enum(['direct', 'standalone']),
  provider: z.string().min(1, 'Provider is required'),
  name: z.string().min(1, 'Connection name is required'),
  apiKey: z.string().optional(),
  endpoint: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  standaloneApiKey: z.string().optional(),
});

type Connection = z.infer<typeof connectionSchema>;

interface ConnectionData {
  id: string;
  type: string;
  provider: string;
  name: string;
  endpoint?: string;
  isActive: boolean;
  lastSyncedAt?: string;
  lastSyncStatus?: string;
  trustLevel?: 'PLATFORM_VERIFIED' | 'SELF_REPORTED';
  verificationMethod?: string;
  lastVerifiedAt?: string;
  createdAt: string;
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Connection>({
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

  // Fetch user's first startup (simplified - in reality would have a selector)
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
        console.error('Error fetching startups:', error);
      }
    };

    fetchStartup();
  }, []);

  // Fetch connections
  useEffect(() => {
    if (!selectedStartup) return;

    const fetchConnections = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/connections?startupId=${selectedStartup}`);
        if (response.ok) {
          const data = await response.json();
          setConnections(data);
        }
      } catch (error) {
        console.error('Error fetching connections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [selectedStartup]);

  const onSubmit = async (data: Connection) => {
    if (!selectedStartup) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, startupId: selectedStartup }),
      });

      if (!response.ok) {
        throw new Error('Failed to create connection');
      }

      const newConnection = await response.json();
      setConnections([...connections, newConnection]);
      setDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error creating connection:', error);
      alert('Failed to create connection. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) {
      return;
    }

    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete connection');
      }

      setConnections(connections.filter((c) => c.id !== connectionId));
    } catch (error) {
      console.error('Error deleting connection:', error);
      alert('Failed to delete connection. Please try again.');
    }
  };

  const getSyncStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading connections...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Connections</h1>
          <p className="text-muted-foreground">
            Manage your revenue data sources
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Connection</DialogTitle>
              <DialogDescription>
                Connect a payment processor or standalone app
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Connection Type</Label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  {...form.register('type')}
                >
                  <option value="direct">Direct Integration</option>
                  <option value="standalone">Standalone App</option>
                </select>
              </div>

              {form.watch('type') === 'direct' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <select
                      id="provider"
                      className="w-full border rounded-md px-3 py-2"
                      {...form.register('provider')}
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
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="sk_test_..."
                      {...form.register('apiKey')}
                    />
                  </div>
                </>
              )}

              {form.watch('type') === 'standalone' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Connection Name</Label>
                    <Input
                      id="name"
                      placeholder="My Standalone App"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endpoint">Endpoint URL</Label>
                    <Input
                      id="endpoint"
                      type="url"
                      placeholder="https://revenue.example.com"
                      {...form.register('endpoint')}
                    />
                    {form.formState.errors.endpoint && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.endpoint.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="standaloneApiKey">API Key</Label>
                    <Input
                      id="standaloneApiKey"
                      type="password"
                      placeholder="Your standalone app API key"
                      {...form.register('standaloneApiKey')}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Connection'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {connections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Connections Yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first connection to start syncing revenue data
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {connections.map((connection) => (
            <Card key={connection.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      {connection.name}
                      <Badge variant={connection.isActive ? 'default' : 'secondary'}>
                        {connection.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {connection.trustLevel && (
                        <TrustBadge 
                          trustLevel={connection.trustLevel}
                          verificationMethod={connection.verificationMethod}
                          size="sm"
                        />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {connection.type === 'direct' ? (
                        <>Direct Integration • {connection.provider}</>
                      ) : (
                        <>Standalone App • {connection.endpoint}</>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(connection.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {getSyncStatusIcon(connection.lastSyncStatus)}
                    <span className="text-muted-foreground">
                      Last synced: {formatDate(connection.lastSyncedAt)}
                    </span>
                  </div>
                  {connection.lastSyncStatus && (
                    <Badge variant={connection.lastSyncStatus === 'success' ? 'default' : 'destructive'}>
                      {connection.lastSyncStatus}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
