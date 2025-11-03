import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'saas' },
      update: {},
      create: {
        name: 'SaaS',
        slug: 'saas',
        description: 'Software as a Service products',
        icon: '💻',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'marketplace' },
      update: {},
      create: {
        name: 'Marketplace',
        slug: 'marketplace',
        description: 'Online marketplaces and platforms',
        icon: '🛒',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'content' },
      update: {},
      create: {
        name: 'Content',
        slug: 'content',
        description: 'Content platforms, newsletters, courses',
        icon: '📝',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'tools' },
      update: {},
      create: {
        name: 'Dev Tools',
        slug: 'tools',
        description: 'Developer tools and utilities',
        icon: '🔧',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'agency' },
      update: {},
      create: {
        name: 'Agency',
        slug: 'agency',
        description: 'Digital agencies and services',
        icon: '🎨',
      },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);

  // Create a demo user (for development only)
  if (process.env.NODE_ENV === 'development') {
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@openrevenue.org' },
      update: {},
      create: {
        email: 'demo@openrevenue.org',
        name: 'Demo User',
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Create a demo startup
    const demoStartup = await prisma.startup.upsert({
      where: { slug: 'demo-startup' },
      update: {},
      create: {
        slug: 'demo-startup',
        name: 'Demo Startup',
        description: 'A demo startup for testing OpenRevenue platform',
        website: 'https://example.com',
        categoryId: categories[0].id,
        foundedDate: new Date('2023-01-01'),
        isPublished: true,
        isFeatured: false,
        userId: demoUser.id,
      },
    });

    // Create privacy settings
    await prisma.privacySettings.upsert({
      where: { startupId: demoStartup.id },
      update: {},
      create: {
        startupId: demoStartup.id,
        showRevenue: 'public',
        showMRR: 'public',
        showCustomerCount: 'public',
        showGrowthRate: true,
        historicalMonths: 12,
      },
    });

    // Create some demo revenue data
    const now = new Date();
    const revenueData = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const baseRevenue = 5000;
      const growth = 1.15; // 15% monthly growth
      const revenue = baseRevenue * Math.pow(growth, 11 - i);
      const customerCount = Math.floor(50 + (11 - i) * 10);

      revenueData.push({
        startupId: demoStartup.id,
        date,
        revenue: Math.round(revenue),
        mrr: Math.round(revenue),
        arr: Math.round(revenue * 12),
        customerCount,
        currency: 'USD',
        sourceType: 'direct',
        isVerified: true,
        growthRate: i < 11 ? 15 : null,
      });
    }

    await prisma.revenueSnapshot.createMany({
      data: revenueData,
      skipDuplicates: true,
    });

    console.log(`Created demo startup with ${revenueData.length} months of revenue data`);

    // Create a milestone
    await prisma.milestone.create({
      data: {
        startupId: demoStartup.id,
        type: 'mrr_milestone',
        title: 'First $10K MRR',
        description: 'Reached $10,000 in Monthly Recurring Revenue',
        targetValue: 10000,
        achievedAt: new Date(now.getFullYear(), now.getMonth() - 3, 15),
        isPublic: true,
      },
    });

    console.log('Created demo milestone');

    // Update leaderboard
    await prisma.leaderboardEntry.upsert({
      where: { startupId: demoStartup.id },
      update: {},
      create: {
        startupId: demoStartup.id,
        rank: 1,
        mrr: revenueData[revenueData.length - 1].mrr || 0,
        arr: revenueData[revenueData.length - 1].arr || 0,
        totalRevenue: revenueData.reduce((sum, d) => sum + d.revenue, 0),
        customerCount: revenueData[revenueData.length - 1].customerCount,
        growthRate: 15,
        currency: 'USD',
        lastUpdated: new Date(),
      },
    });

    console.log('Updated leaderboard');
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
