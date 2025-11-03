'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Target, Trophy, Edit, Trash2, Calendar, CheckCircle } from 'lucide-react';

const milestoneSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  targetValue: z.number().optional(),
});

type MilestoneForm = z.infer<typeof milestoneSchema>;

interface Milestone {
  id: string;
  type: string;
  title: string;
  description?: string;
  targetValue?: number;
  achievedAt?: string;
  isPublic: boolean;
  createdAt: string;
}

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [selectedStartup, setSelectedStartup] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<MilestoneForm>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      type: 'custom',
      title: '',
      description: '',
      targetValue: undefined,
    },
  });

  // Fetch startup
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

  // Fetch milestones
  useEffect(() => {
    if (!selectedStartup) return;

    const fetchMilestones = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/milestones?startupId=${selectedStartup}`);
        if (response.ok) {
          const data = await response.json();
          setMilestones(data);
        }
      } catch (error) {
        console.error('Error fetching milestones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [selectedStartup]);

  const onSubmit = async (data: MilestoneForm) => {
    if (!selectedStartup) return;

    setSubmitting(true);
    try {
      const url = editingMilestone ? `/api/milestones/${editingMilestone.id}` : '/api/milestones';
      const method = editingMilestone ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, startupId: selectedStartup }),
      });

      if (!response.ok) {
        throw new Error('Failed to save milestone');
      }

      setDialogOpen(false);
      setEditingMilestone(null);
      form.reset();

      // Refresh milestones
      const refreshResponse = await fetch(`/api/milestones?startupId=${selectedStartup}`);
      if (refreshResponse.ok) {
        const updated = await refreshResponse.json();
        setMilestones(updated);
      }
    } catch (error) {
      console.error('Error saving milestone:', error);
      alert('Failed to save milestone. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (milestoneId: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) {
      return;
    }

    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete milestone');
      }

      setMilestones(milestones.filter(m => m.id !== milestoneId));
    } catch (error) {
      console.error('Error deleting milestone:', error);
      alert('Failed to delete milestone. Please try again.');
    }
  };

  const handleMarkAchieved = async (milestone: Milestone) => {
    try {
      const response = await fetch(`/api/milestones/${milestone.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          achievedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark milestone as achieved');
      }

      // Refresh milestones
      const refreshResponse = await fetch(`/api/milestones?startupId=${selectedStartup}`);
      if (refreshResponse.ok) {
        const updated = await refreshResponse.json();
        setMilestones(updated);
      }
    } catch (error) {
      console.error('Error marking milestone:', error);
      alert('Failed to mark milestone as achieved. Please try again.');
    }
  };

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    form.reset({
      type: milestone.type,
      title: milestone.title,
      description: milestone.description || '',
      targetValue: milestone.targetValue,
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Target className="h-8 w-8 animate-pulse mx-auto mb-2" />
            <p className="text-muted-foreground">Loading milestones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Milestones</h1>
          <p className="text-muted-foreground">
            Track your startup achievements and goals
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingMilestone ? 'Edit Milestone' : 'Add New Milestone'}</DialogTitle>
              <DialogDescription>
                Track your important achievements
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  {...form.register('type')}
                >
                  <option value="custom">Custom</option>
                  <option value="mrr_milestone">MRR Milestone</option>
                  <option value="customer_milestone">Customer Milestone</option>
                  <option value="revenue_milestone">Revenue Milestone</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Reached $10k MRR"
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Description of this milestone"
                  rows={3}
                  {...form.register('description')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetValue">Target Value (optional)</Label>
                <Input
                  id="targetValue"
                  type="number"
                  placeholder="10000"
                  {...form.register('targetValue', { valueAsNumber: true })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setDialogOpen(false);
                  setEditingMilestone(null);
                  form.reset();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingMilestone ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {milestones.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Milestones Yet</h3>
              <p className="text-muted-foreground mb-4">
                Track your progress and celebrate achievements
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Milestone
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {milestones.map((milestone) => (
            <Card key={milestone.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {milestone.achievedAt ? (
                      <div className="rounded-full bg-green-100 dark:bg-green-900 p-2">
                        <Trophy className="h-5 w-5 text-green-600 dark:text-green-300" />
                      </div>
                    ) : (
                      <div className="rounded-full bg-muted p-2">
                        <Target className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {milestone.title}
                        {!milestone.achievedAt && (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        {milestone.achievedAt && (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Achieved
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {milestone.achievedAt
                          ? `Achieved ${new Date(milestone.achievedAt).toLocaleDateString()}`
                          : `Created ${new Date(milestone.createdAt).toLocaleDateString()}`
                        }
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!milestone.achievedAt && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkAchieved(milestone)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(milestone)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(milestone.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {milestone.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {milestone.description}
                  </p>
                )}
                {milestone.targetValue && (
                  <p className="text-sm font-medium">
                    Target: ${milestone.targetValue.toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

