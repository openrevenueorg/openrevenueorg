-- CreateEnum
CREATE TYPE "TrustLevel" AS ENUM ('SELF_REPORTED', 'PLATFORM_VERIFIED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "idToken" TEXT,
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "refreshTokenExpiresAt" TIMESTAMP(3),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "startups" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "categoryId" TEXT,
    "foundedDate" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privacy_settings" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "showRevenue" TEXT NOT NULL DEFAULT 'public',
    "showMRR" TEXT NOT NULL DEFAULT 'public',
    "showCustomerCount" TEXT NOT NULL DEFAULT 'public',
    "showGrowthRate" BOOLEAN NOT NULL DEFAULT true,
    "historicalMonths" INTEGER NOT NULL DEFAULT 12,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "privacy_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_connections" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "encryptedApiKey" TEXT,
    "encryptedSecret" TEXT,
    "endpoint" TEXT,
    "standaloneApiKey" TEXT,
    "publicKey" TEXT,
    "trustLevel" "TrustLevel" NOT NULL DEFAULT 'SELF_REPORTED',
    "verificationMethod" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "lastSyncStatus" TEXT,
    "lastSyncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_snapshots" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "mrr" DOUBLE PRECISION,
    "arr" DOUBLE PRECISION,
    "customerCount" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "growthRate" DOUBLE PRECISION,
    "churnRate" DOUBLE PRECISION,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "dataHash" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "trustLevel" "TrustLevel" NOT NULL DEFAULT 'SELF_REPORTED',
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenue_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetValue" DOUBLE PRECISION,
    "achievedAt" TIMESTAMP(3),
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "icon" TEXT,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_entries" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "mrr" DOUBLE PRECISION,
    "arr" DOUBLE PRECISION,
    "totalRevenue" DOUBLE PRECISION NOT NULL,
    "customerCount" INTEGER,
    "growthRate" DOUBLE PRECISION,
    "currency" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordsProcessed" INTEGER,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_providerId_accountId_key" ON "accounts"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "startups_slug_key" ON "startups"("slug");

-- CreateIndex
CREATE INDEX "startups_userId_idx" ON "startups"("userId");

-- CreateIndex
CREATE INDEX "startups_categoryId_idx" ON "startups"("categoryId");

-- CreateIndex
CREATE INDEX "startups_isPublished_idx" ON "startups"("isPublished");

-- CreateIndex
CREATE INDEX "startups_isFeatured_idx" ON "startups"("isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "privacy_settings_startupId_key" ON "privacy_settings"("startupId");

-- CreateIndex
CREATE INDEX "data_connections_startupId_idx" ON "data_connections"("startupId");

-- CreateIndex
CREATE INDEX "data_connections_isActive_idx" ON "data_connections"("isActive");

-- CreateIndex
CREATE INDEX "data_connections_trustLevel_idx" ON "data_connections"("trustLevel");

-- CreateIndex
CREATE INDEX "revenue_snapshots_startupId_idx" ON "revenue_snapshots"("startupId");

-- CreateIndex
CREATE INDEX "revenue_snapshots_date_idx" ON "revenue_snapshots"("date");

-- CreateIndex
CREATE INDEX "revenue_snapshots_trustLevel_idx" ON "revenue_snapshots"("trustLevel");

-- CreateIndex
CREATE UNIQUE INDEX "revenue_snapshots_startupId_date_sourceId_key" ON "revenue_snapshots"("startupId", "date", "sourceId");

-- CreateIndex
CREATE INDEX "milestones_startupId_idx" ON "milestones"("startupId");

-- CreateIndex
CREATE INDEX "stories_startupId_idx" ON "stories"("startupId");

-- CreateIndex
CREATE INDEX "stories_isPublished_idx" ON "stories"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "stories_startupId_slug_key" ON "stories"("startupId", "slug");

-- CreateIndex
CREATE INDEX "achievements_startupId_idx" ON "achievements"("startupId");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_entries_startupId_key" ON "leaderboard_entries"("startupId");

-- CreateIndex
CREATE INDEX "leaderboard_entries_rank_idx" ON "leaderboard_entries"("rank");

-- CreateIndex
CREATE INDEX "sync_logs_connectionId_idx" ON "sync_logs"("connectionId");

-- CreateIndex
CREATE INDEX "sync_logs_status_idx" ON "sync_logs"("status");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startups" ADD CONSTRAINT "startups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startups" ADD CONSTRAINT "startups_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "privacy_settings" ADD CONSTRAINT "privacy_settings_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_connections" ADD CONSTRAINT "data_connections_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_snapshots" ADD CONSTRAINT "revenue_snapshots_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
