-- AlterTable
ALTER TABLE "startups" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD';

-- AddForeignKey
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
