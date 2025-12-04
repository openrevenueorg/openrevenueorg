'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Code, Image, ExternalLink, Sun, Moon } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

interface Startup {
    id: string;
    name: string;
    slug: string;
}

export default function EmbedPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [startup, setStartup] = useState<Startup | null>(null);
    const [loading, setLoading] = useState(true);
    const [copiedType, setCopiedType] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const fetchStartup = async () => {
            try {
                const response = await fetch('/api/startups');
                if (response.ok) {
                    const startups = await response.json();
                    if (startups.length > 0) {
                        setStartup(startups[0]);
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

    if (!session?.user) {
        router.push('/');
        return null;
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://openrevenue.org';
    const widgetUrl = startup ? `${baseUrl}/api/embed/${startup.slug}/widget.svg?theme=${theme}` : '';
    const profileUrl = startup ? `${baseUrl}/startup/${startup.slug}` : '';

    const embedCodes = {
        html: `<a href="${profileUrl}" target="_blank" rel="noopener">
  <img src="${widgetUrl}" alt="${startup?.name || 'Startup'} Revenue - OpenRevenue" />
</a>`,
        markdown: `[![${startup?.name || 'Startup'} Revenue](${widgetUrl})](${profileUrl})`,
        bbcode: `[url=${profileUrl}][img]${widgetUrl}[/img][/url]`,
    };

    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedType(type);
            setTimeout(() => setCopiedType(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (!startup) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Embed Widgets</h1>
                    <p className="text-muted-foreground">
                        Share your revenue metrics on your website or README
                    </p>
                </div>
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground mb-4">
                            You need to create a startup first to get embed codes.
                        </p>
                        <Button onClick={() => router.push('/dashboard/onboarding')}>
                            Create Startup
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Embed Widgets</h1>
                <p className="text-muted-foreground">
                    Share your revenue metrics on your website, GitHub README, or anywhere else
                </p>
            </div>

            {/* Preview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        Widget Preview
                    </CardTitle>
                    <CardDescription>
                        This is how your revenue widget will appear when embedded
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Theme Toggle */}
                    <div className="flex items-center gap-4">
                        <Label>Theme:</Label>
                        <div className="flex gap-2">
                            <Button
                                variant={theme === 'light' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTheme('light')}
                            >
                                <Sun className="h-4 w-4 mr-1" />
                                Light
                            </Button>
                            <Button
                                variant={theme === 'dark' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTheme('dark')}
                            >
                                <Moon className="h-4 w-4 mr-1" />
                                Dark
                            </Button>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className={`p-8 rounded-lg border ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                        <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={widgetUrl}
                                alt={`${startup.name} Revenue - OpenRevenue`}
                                className="max-w-full"
                            />
                        </a>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        <ExternalLink className="h-3 w-3 inline mr-1" />
                        Widget links to your public profile at{' '}
                        <a href={profileUrl} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                            {profileUrl}
                        </a>
                    </p>
                </CardContent>
            </Card>

            {/* Embed Codes */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Embed Codes
                    </CardTitle>
                    <CardDescription>
                        Copy the code snippet for your preferred platform
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="html">
                        <TabsList className="mb-4">
                            <TabsTrigger value="html">HTML</TabsTrigger>
                            <TabsTrigger value="markdown">Markdown</TabsTrigger>
                            <TabsTrigger value="bbcode">BBCode</TabsTrigger>
                            <TabsTrigger value="url">Direct URL</TabsTrigger>
                        </TabsList>

                        <TabsContent value="html" className="space-y-4">
                            <div className="space-y-2">
                                <Label>HTML Embed Code</Label>
                                <div className="relative">
                                    <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto">
                                        <code>{embedCodes.html}</code>
                                    </pre>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="absolute top-2 right-2"
                                        onClick={() => copyToClipboard(embedCodes.html, 'html')}
                                    >
                                        {copiedType === 'html' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Perfect for websites, landing pages, and HTML emails.
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="markdown" className="space-y-4">
                            <div className="space-y-2">
                                <Label>Markdown Embed Code</Label>
                                <div className="relative">
                                    <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto">
                                        <code>{embedCodes.markdown}</code>
                                    </pre>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="absolute top-2 right-2"
                                        onClick={() => copyToClipboard(embedCodes.markdown, 'markdown')}
                                    >
                                        {copiedType === 'markdown' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Great for GitHub READMEs, documentation, and wikis.
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="bbcode" className="space-y-4">
                            <div className="space-y-2">
                                <Label>BBCode Embed</Label>
                                <div className="relative">
                                    <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto">
                                        <code>{embedCodes.bbcode}</code>
                                    </pre>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="absolute top-2 right-2"
                                        onClick={() => copyToClipboard(embedCodes.bbcode, 'bbcode')}
                                    >
                                        {copiedType === 'bbcode' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    For forums and platforms that support BBCode.
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="url" className="space-y-4">
                            <div className="space-y-2">
                                <Label>Direct Image URL</Label>
                                <div className="flex gap-2">
                                    <Input value={widgetUrl} readOnly className="font-mono text-sm" />
                                    <Button
                                        variant="outline"
                                        onClick={() => copyToClipboard(widgetUrl, 'url')}
                                    >
                                        {copiedType === 'url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Use this URL directly in any image field or embed.
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Tips */}
            <Card>
                <CardHeader>
                    <CardTitle>Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>• The widget automatically updates when your revenue data changes (cached for 1 hour)</p>
                    <p>• Add <Badge variant="outline" className="mx-1">?theme=dark</Badge> to the URL for dark mode</p>
                    <p>• Your privacy settings are respected - hidden metrics won&apos;t appear</p>
                    <p>• Verified startups display a &quot;✓ Verified&quot; badge on the widget</p>
                </CardContent>
            </Card>
        </div>
    );
}
