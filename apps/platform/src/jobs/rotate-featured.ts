/**
 * Daily Featured Rotation Job
 *
 * This job should run daily (e.g., via cron or BullMQ scheduler) to:
 * 1. Check for expired featured startups
 * 2. Remove expired ones from featured
 * 3. Optionally auto-extend high performers
 * 4. Fill empty slots with top-scoring suggestions
 *
 * Schedule: Run daily at 12:00 AM UTC
 * Command: pnpm tsx src/jobs/rotate-featured.ts
 */

import { prisma } from '@/lib/prisma';
import { getFeatureSuggestions, calculateFeatureScore } from '@/lib/featuring/score-calculator';

export async function rotateFeaturedStartups() {
  console.log('🔄 Starting featured startups rotation...');

  const now = new Date();
  const stats = {
    expired: 0,
    autoExtended: 0,
    newlyFeatured: 0,
    errors: 0,
  };

  try {
    // Step 1: Find expired featured startups
    const expiredStartups = await prisma.startup.findMany({
      where: {
        isFeatured: true,
        featuredUntil: {
          lt: now,
        },
      },
      select: {
        id: true,
        name: true,
        featureImpressions: true,
        featureClicks: true,
        featuredUntil: true,
      },
    });

    console.log(`Found ${expiredStartups.length} expired featured startups`);

    // Step 2: Check for auto-extension eligibility
    for (const startup of expiredStartups) {
      const clickRate =
        startup.featureImpressions > 0
          ? (startup.featureClicks / startup.featureImpressions) * 100
          : 0;

      // Auto-extend if performing well
      const qualifiesForAutoExtension = clickRate >= 5 || startup.featureClicks >= 100;

      if (qualifiesForAutoExtension) {
        const newUntil = new Date(now);
        newUntil.setDate(newUntil.getDate() + 7); // Extend by 7 days

        await prisma.startup.update({
          where: { id: startup.id },
          data: {
            featuredUntil: newUntil,
            // Reset performance counters
            featureImpressions: 0,
            featureClicks: 0,
          },
        });

        console.log(`✅ Auto-extended: ${startup.name} (CTR: ${clickRate?.toFixed(2)}%)`);
        stats.autoExtended++;
      } else {
        // Remove from featured
        await prisma.startup.update({
          where: { id: startup.id },
          data: {
            isFeatured: false,
            featuredUntil: null,
          },
        });

        console.log(`❌ Removed: ${startup.name} (low performance)`);
        stats.expired++;
      }
    }

    // Step 3: Check available slots
    const currentFeatured = await prisma.startup.count({
      where: {
        isFeatured: true,
        OR: [{ featuredUntil: null }, { featuredUntil: { gte: now } }],
      },
    });

    const maxSlots = 5;
    const availableSlots = Math.max(0, maxSlots - currentFeatured);

    console.log(`💡 Available slots: ${availableSlots}/${maxSlots}`);

    // Step 4: Fill empty slots with top suggestions
    if (availableSlots > 0) {
      const suggestions = await getFeatureSuggestions(availableSlots * 2); // Get 2x to have options

      let filled = 0;
      for (const suggestion of suggestions.slice(0, availableSlots)) {
        try {
          const featuredUntil = new Date(now);
          featuredUntil.setDate(featuredUntil.getDate() + 7);

          await prisma.startup.update({
            where: { id: suggestion.startupId },
            data: {
              isFeatured: true,
              featuredAt: now,
              featuredUntil,
              featureImpressions: 0,
              featureClicks: 0,
            },
          });

          console.log(
            `⭐ Auto-featured: ${suggestion.startupName} (score: ${suggestion.score})`
          );
          filled++;
          stats.newlyFeatured++;
        } catch (error) {
          console.error(`Error featuring ${suggestion.startupName}:`, error);
          stats.errors++;
        }
      }

      console.log(`✨ Featured ${filled} new startups`);
    }

    // Step 5: Update all feature scores
    console.log('📊 Updating feature scores...');
    const allPublished = await prisma.startup.findMany({
      where: { isPublished: true },
      select: { id: true },
    });

    for (const startup of allPublished) {
      try {
        const breakdown = await calculateFeatureScore(startup.id);
        await prisma.startup.update({
          where: { id: startup.id },
          data: { featureScore: breakdown.total },
        });
      } catch (error) {
        console.error(`Error updating score for startup ${startup.id}:`, error);
      }
    }

    console.log('✅ Rotation complete!');
    console.log('Statistics:', stats);

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error('❌ Error during rotation:', error);
    return {
      success: false,
      error: String(error),
      stats,
    };
  }
}

// Run if executed directly
if (require.main === module) {
  rotateFeaturedStartups()
    .then((result) => {
      console.log('Final result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
