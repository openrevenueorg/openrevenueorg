'use client';

import { Navbar } from '@/components/navbar';
import { FooterElement } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Trophy, Sparkles, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewsletterPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        setEmail('');
        toast.success('Thanks for subscribing! Welcome to the herd.');
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <Badge variant="secondary" className="mb-4">
                            <Sparkles className="h-3 w-3 mr-2" />
                            Weekly Insights
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Spot the Next Big Thing
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                            Join 1,000+ founders getting the weekly newsletter. No spam. Just pure startup juice.
                        </p>

                        {/* Signup Form */}
                        <Card className="max-w-md mx-auto border-primary/20 shadow-lg">
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="flex gap-2">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Joining...' : 'Join the Herd'}
                                    </Button>
                                </form>
                                <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
                                    <Check className="h-3 w-3 text-green-500" />
                                    500+ entrepreneurs are already subscribed
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Content Preview */}
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <Card className="bg-background/50 backdrop-blur">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <CardTitle className="text-lg">5 Fastest Growing</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    We track velocity, not just total revenue. Discover who&apos;s scaling fast right now.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-background/50 backdrop-blur">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <CardTitle className="text-lg">3 Great Deals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Curated SaaS and AI startups for sale with good multiples and verified revenue.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-background/50 backdrop-blur">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                                    <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <CardTitle className="text-lg">Underdog Spotlight</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Discover indie hackers who quit their job because they hit $5k MRR.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <FooterElement />
        </div>
    );
}
