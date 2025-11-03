import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Globe,
  ExternalLink,
  Shield,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // TODO: Fetch startup data
  return {
    title: `Startup | OpenRevenue`,
    description: 'Transparent revenue tracking',
  };
}

// Mock data - replace with actual database query
const mockData = {
  startup: {
    id: '1',
    name: 'DataExpert',
    slug: 'dataexpert',
    description:
      'Learn data engineering, analytics, and science with expert-led courses and hands-on projects.',
    logo: '/placeholder-logo.png',
    website: 'https://dataexpert.io',
    category: 'Education',
    foundedDate: '2022-01-15',
    currentMRR: 45000,
    currentARR: 540000,
    totalRevenue: 892345,
    customers: 890,
    growthRate: 25.3,
    currency: 'USD',
  },
  revenueHistory: [
    { month: 'Jan', mrr: 28000, revenue: 28000 },
    { month: 'Feb', mrr: 31000, revenue: 59000 },
    { month: 'Mar', mrr: 34500, revenue: 93500 },
    { month: 'Apr', mrr: 37200, revenue: 130700 },
    { month: 'May', mrr: 40100, revenue: 170800 },
    { month: 'Jun', mrr: 45000, revenue: 215800 },
  ],
  milestones: [
    {
      id: '1',
      title: 'Reached $40k MRR',
      date: '2024-05-15',
      description: 'Achieved $40,000 in monthly recurring revenue',
    },
    {
      id: '2',
      title: '500 Customers',
      date: '2024-03-20',
      description: 'Welcomed our 500th paying customer',
    },
    {
      id: '3',
      title: 'First $10k Month',
      date: '2023-08-10',
      description: 'Hit our first $10,000 revenue month',
    },
  ],
  stories: [
    {
      id: '1',
      title: 'How We Reached $40k MRR in 18 Months',
      slug: 'how-we-reached-40k-mrr',
      excerpt:
        "The journey from idea to $40k MRR wasn't straightforward. Here's what worked...",
      publishedAt: '2024-05-20',
    },
  ],
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function StartupPage({ params }: Props) {
  const { slug } = await params;

  //TODO: Fetch startup data from database
  // const startup = await getStartupBySlug(slug);
  // if (!startup) notFound();

  const { startup, revenueHistory, milestones, stories } = mockData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="font-bold text-2xl">
              OpenRevenue
            </Link>
            <div className="flex gap-4 items-center">
              <Link href="/leaderboard" className="text-sm hover:text-primary">
                Leaderboard
              </Link>
              <Link href="/login" className="text-sm hover:text-primary">
                Sign In
              </Link>
            </div>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Startup Header */}
        <div className="mb-12">
          <div className="flex items-start gap-6 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={startup.logo} alt={startup.name} />
              <AvatarFallback>{startup.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{startup.name}</h1>
                <Badge variant="secondary">{startup.category}</Badge>
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Verified
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                {startup.description}
              </p>
              <div className="flex gap-4 items-center text-sm text-muted-foreground">
                {startup.website && (
                  <a
                    href={startup.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Founded {new Date(startup.foundedDate).getFullYear()}
                </div>
              </div>
            </div>
            <Button asChild>
              <a
                href={startup.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Website
              </a>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Recurring Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(startup.currentMRR)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current MRR
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Annual Recurring Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(startup.currentARR)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current ARR
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{startup.customers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Paying customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{startup.growthRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Month-over-month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) =>
                    formatCurrency(value).replace('.00', '')
                  }
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(value), 'MRR']}
                />
                <Line
                  type="monotone"
                  dataKey="mrr"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">{milestone.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {milestone.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(milestone.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stories */}
          <Card>
            <CardHeader>
              <CardTitle>Stories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stories.map((story) => (
                  <Link
                    key={story.id}
                    href={`/startup/${startup.slug}/story/${story.slug}`}
                    className="block p-4 rounded-lg border hover:border-primary transition-colors"
                  >
                    <h3 className="font-semibold mb-2">{story.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {story.excerpt}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(story.publishedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <Card className="border-primary/50">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">
                Building in public too?
              </h3>
              <p className="text-muted-foreground mb-4">
                Join OpenRevenue and showcase your transparent revenue
              </p>
              <Button asChild>
                <Link href="/register">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
