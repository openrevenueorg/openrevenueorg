import { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { FooterElement } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageSquare, Repeat, Heart, BarChart2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = {
    title: 'Open Revenue Feed | OpenRevenue',
    description: 'Real-time feed of verified revenue updates from open startups.',
};

export const dynamic = 'force-dynamic';

// Mock feed data
const MOCK_FEED = [
    {
        id: '1',
        user: {
            name: 'Pieter Levels',
            handle: 'levelsio',
            avatar: 'https://pbs.twimg.com/profile_images/1701878932176351232/AlNU3wtK_400x400.jpg',
        },
        content: 'Just hit $50k MRR with PhotoAI! 🚀 #buildinpublic',
        revenue: 50000,
        timestamp: '2h ago',
        verified: true,
        stats: { replies: 42, reposts: 12, likes: 350, views: '12k' }
    },
    {
        id: '2',
        user: {
            name: 'Danny Postma',
            handle: 'dannypostmaa',
            avatar: 'https://pbs.twimg.com/profile_images/1687038630739558400/Ad2XU9qU_400x400.jpg',
        },
        content: 'HeadshotPro crossed $1M ARR today. Insane journey over the last 6 months.',
        revenue: 83333, // Monthly equivalent
        timestamp: '5h ago',
        verified: true,
        stats: { replies: 156, reposts: 89, likes: 2100, views: '85k' }
    },
    {
        id: '3',
        user: {
            name: 'Marc Lou',
            handle: 'marc_louvion',
            avatar: 'https://pbs.twimg.com/profile_images/1756312558661705728/9tJ4d_S0_400x400.jpg',
        },
        content: 'ShipFast is now at $40k/mo profit. Not revenue, profit. 🚢',
        revenue: 40000,
        timestamp: '1d ago',
        verified: true,
        stats: { replies: 89, reposts: 45, likes: 1200, views: '45k' }
    },
];

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function OpenPage() {
    return (
        <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <Badge variant="secondary" className="mb-4">
                            <CheckCircle2 className="h-3 w-3 mr-2" />
                            Verified Updates
                        </Badge>
                        <h1 className="text-4xl font-bold mb-4">
                            Open Revenue Feed
                        </h1>
                        <p className="text-muted-foreground mb-8">
                            To be verified, you must have at least 1 verified startup on OpenRevenue. Updated every 3 hours.
                        </p>

                        <div className="flex gap-2 max-w-md mx-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search updates..." className="pl-9" />
                            </div>
                            <Button>Add Startup</Button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {MOCK_FEED.map((post) => (
                            <Card key={post.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={post.user.avatar} />
                                            <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold hover:underline cursor-pointer">{post.user.name}</span>
                                                <span className="text-muted-foreground">@{post.user.handle}</span>
                                                <span className="text-muted-foreground">·</span>
                                                <span className="text-muted-foreground hover:underline cursor-pointer">{post.timestamp}</span>
                                            </div>

                                            <p className="mb-3 text-lg">{post.content}</p>

                                            {post.verified && (
                                                <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium mb-4 border border-green-200 dark:border-green-900">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Verified Revenue: {formatCurrency(post.revenue)}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between text-muted-foreground text-sm max-w-md">
                                                <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
                                                    <MessageSquare className="h-4 w-4 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 rounded-full p-0.5 box-content" />
                                                    {post.stats.replies}
                                                </button>
                                                <button className="flex items-center gap-2 hover:text-green-500 transition-colors group">
                                                    <Repeat className="h-4 w-4 group-hover:bg-green-50 dark:group-hover:bg-green-900/20 rounded-full p-0.5 box-content" />
                                                    {post.stats.reposts}
                                                </button>
                                                <button className="flex items-center gap-2 hover:text-pink-500 transition-colors group">
                                                    <Heart className="h-4 w-4 group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20 rounded-full p-0.5 box-content" />
                                                    {post.stats.likes}
                                                </button>
                                                <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
                                                    <BarChart2 className="h-4 w-4 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 rounded-full p-0.5 box-content" />
                                                    {post.stats.views}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            <FooterElement />
        </div>
    );
}
