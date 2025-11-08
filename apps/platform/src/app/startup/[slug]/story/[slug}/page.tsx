import { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { notFound } from 'next/navigation';
import StoryData from '@/components/story-data';
import { FooterElement } from '@/components/footer';


interface Props {
  params: Promise<{
    slug: string;
  }>;
}


async function getStartupStoryBySlug(slug: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stories/public/${slug}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    return null;
  }
  const startup = await response.json();
  return startup;
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const startup = await getStartupStoryBySlug(slug);

  if (!startup) {
    return {
      title: 'Startup Not Found | OpenRevenue',
      description: 'Transparent revenue tracking',
    };
  }

  return {
    title: `${startup.name} | OpenRevenue`,
    description: startup.description || 'Transparent revenue tracking',
  };
}


export default async function StoryPage({ params }: Props) {
  const { slug } = await params;

  
  const startup = await getStartupStoryBySlug(slug);
  if (!startup) {
    return notFound();
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <StoryData params={params} startupData={startup} />
       
      <FooterElement />
    </div>
  );
}
