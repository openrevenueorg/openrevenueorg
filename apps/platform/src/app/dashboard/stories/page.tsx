'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Plus, FileText, Edit, Trash2, Eye, Calendar } from 'lucide-react';

const storySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  content: z.string().min(1, 'Content is required'),
});

type StoryForm = z.infer<typeof storySchema>;

interface Story {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
}

export default function StoriesPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [selectedStartup, setSelectedStartup] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<StoryForm>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
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

  // Fetch stories
  useEffect(() => {
    if (!selectedStartup) return;

    const fetchStories = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/stories?startupId=${selectedStartup}`);
        if (response.ok) {
          const data = await response.json();
          setStories(data);
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [selectedStartup]);

  const onSubmit = async (data: StoryForm) => {
    if (!selectedStartup) return;

    setSubmitting(true);
    try {
      const url = editingStory ? `/api/stories/${editingStory.id}` : '/api/stories';
      const method = editingStory ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, startupId: selectedStartup }),
      });

      if (!response.ok) {
        throw new Error('Failed to save story');
      }

      setDialogOpen(false);
      setEditingStory(null);
      form.reset();

      // Refresh stories
      const refreshResponse = await fetch(`/api/stories?startupId=${selectedStartup}`);
      if (refreshResponse.ok) {
        const updated = await refreshResponse.json();
        setStories(updated);
      }
    } catch (error) {
      console.error('Error saving story:', error);
      alert('Failed to save story. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story?')) {
      return;
    }

    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete story');
      }

      setStories(stories.filter(s => s.id !== storyId));
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story. Please try again.');
    }
  };

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    form.reset({
      title: story.title,
      slug: story.slug,
      content: story.content,
    });
    setDialogOpen(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue('title', title);

    if (!editingStory) {
      const slug = generateSlug(title);
      form.setValue('slug', slug);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText className="h-8 w-8 animate-pulse mx-auto mb-2" />
            <p className="text-muted-foreground">Loading stories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Stories</h1>
          <p className="text-muted-foreground">
            Share your startup journey with the community
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStory ? 'Edit Story' : 'Create New Story'}</DialogTitle>
              <DialogDescription>
                Share your startup journey, milestones, and insights
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="How We Reached $10k MRR"
                  {...form.register('title')}
                  onChange={handleTitleChange}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">openrevenue.com/story/</span>
                  <Input
                    id="slug"
                    placeholder="how-we-reached-10k-mrr"
                    {...form.register('slug')}
                  />
                </div>
                {form.formState.errors.slug && (
                  <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your story here... (Markdown supported)"
                  rows={12}
                  {...form.register('content')}
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setDialogOpen(false);
                  setEditingStory(null);
                  form.reset();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingStory ? 'Update Story' : 'Create Story'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {stories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Stories Yet</h3>
              <p className="text-muted-foreground mb-4">
                Share your startup journey and milestones with the community
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Write Your First Story
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {stories.map((story) => (
            <Card key={story.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {story.title}
                      {story.isPublished && (
                        <Badge variant="default">Published</Badge>
                      )}
                      {!story.isPublished && (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(story.createdAt).toLocaleDateString()}
                      </span>
                      <span>/{story.slug}</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(story)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/story/${story.slug}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(story.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {story.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

