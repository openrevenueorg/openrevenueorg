# OpenRevenue Platform - Implementation Guide

This guide lists all the features and files that need to be implemented for the full OpenRevenue platform.

## ✅ Already Implemented

### Database & Auth
- ✅ Prisma schema with all models (`prisma/schema.prisma`)
- ✅ NextAuth setup (`src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`)

### UI Components
- ✅ Badge (`src/components/ui/badge.tsx`)
- ✅ Avatar (`src/components/ui/avatar.tsx`)
- ✅ Textarea (`src/components/ui/textarea.tsx`)
- ✅ Dropdown Menu (`src/components/ui/dropdown-menu.tsx`)
- ✅ Button, Card, Input, Label (already existed)

### Pages
- ✅ Landing page (`src/app/page.tsx`)
- ✅ Login page (`src/app/(auth)/login/page.tsx`)
- ✅ Register page (`src/app/(auth)/register/page.tsx`)
- ✅ Dashboard layout (`src/app/dashboard/layout.tsx`)
- ✅ Dashboard overview (`src/app/dashboard/page.tsx`)
- ✅ Leaderboard page (`src/app/leaderboard/page.tsx`)
- ✅ Individual startup page (`src/app/startup/[slug]/page.tsx`)

### Components
- ✅ Dashboard navigation (`src/components/dashboard-nav.tsx`)

## 🚧 Remaining Implementation

### 1. Dashboard Pages

#### Onboarding Flow
**File: `src/app/dashboard/onboarding/page.tsx`**
```typescript
// Multi-step onboarding wizard:
// Step 1: Startup details (name, description, website, logo, category)
// Step 2: Privacy settings (what to show/hide)
// Step 3: Choose connection type (direct API or standalone app)
// Step 4: Configure first connection
```

#### Connections Management
**File: `src/app/dashboard/connections/page.tsx`**
```typescript
// Features:
// - List all data connections
// - Add new connection (direct API or standalone)
// - Test connection
// - View sync status and logs
// - Enable/disable connections
// - Delete connections
```

**File: `src/app/dashboard/connections/new/page.tsx`**
```typescript
// Add connection wizard:
// - Choose provider (Stripe, Paddle, Lemon Squeezy, Standalone)
// - Enter API credentials
// - Test connection
// - Configure sync settings
```

#### Analytics Page
**File: `src/app/dashboard/analytics/page.tsx`**
```typescript
// Features:
// - Revenue charts (MRR, ARR, total revenue)
// - Customer growth chart
// - Churn rate
// - Growth rate trends
// - Revenue by source/connection
// - Export data
```

#### Stories Management
**File: `src/app/dashboard/stories/page.tsx`**
```typescript
// Features:
// - List all stories (published & drafts)
// - Create new story
// - Edit/delete stories
// - Preview stories
```

**File: `src/app/dashboard/stories/new/page.tsx`**
```typescript
// Create/edit story:
// - Title, slug, content (markdown editor)
// - Publish/unpublish toggle
// - Preview
```

#### Milestones Management
**File: `src/app/dashboard/milestones/page.tsx`**
```typescript
// Features:
// - List all milestones
// - Add custom milestone
// - View auto-detected milestones (e.g., $10k MRR)
// - Mark as achieved
// - Show/hide milestones
```

#### Settings Page
**File: `src/app/dashboard/settings/page.tsx`**
```typescript
// Tabs:
// - General (startup name, description, website, logo)
// - Privacy (control what's visible publicly)
// - Profile (user account settings)
// - Billing (subscription management - premium features)
// - Notifications (email preferences)
// - Danger Zone (delete startup, export data)
```

### 2. Public Pages

#### Explore/Browse Page
**File: `src/app/explore/page.tsx`**
```typescript
// Features:
// - Grid view of startups
// - Filter by category, revenue range, growth rate
// - Search functionality
// - Sort options (revenue, growth, customers, recent)
```

#### About Page
**File: `src/app/about/page.tsx`**
```typescript
// Content:
// - Mission statement
// - How it works
// - Why transparency matters
// - Team (if applicable)
// - Open source info
```

#### Features Page
**File: `src/app/features/page.tsx`**
```typescript
// Content:
// - Direct API integrations
// - Standalone app option
// - Privacy controls
// - Verified data
// - Community features
// - Comparison with TrustMRR
```

#### Pricing Page
**File: `src/app/pricing/page.tsx`**
```typescript
// Pricing tiers:
// - Free tier (basic features)
// - Pro tier (advanced analytics, custom branding)
// - Enterprise (white-label, dedicated support)
```

### 3. API Routes

#### Startup Management
**File: `src/app/api/startups/route.ts`**
```typescript
// POST /api/startups - Create new startup
// GET /api/startups - List user's startups
```

**File: `src/app/api/startups/[id]/route.ts`**
```typescript
// GET /api/startups/[id] - Get startup details
// PATCH /api/startups/[id] - Update startup
// DELETE /api/startups/[id] - Delete startup
```

#### Connection Management
**File: `src/app/api/connections/route.ts`**
```typescript
// POST /api/connections - Create connection
// GET /api/connections - List connections
```

**File: `src/app/api/connections/[id]/route.ts`**
```typescript
// GET /api/connections/[id] - Get connection
// PATCH /api/connections/[id] - Update connection
// DELETE /api/connections/[id] - Delete connection
```

**File: `src/app/api/connections/[id]/test/route.ts`**
```typescript
// POST /api/connections/[id]/test - Test connection
```

**File: `src/app/api/connections/[id]/sync/route.ts`**
```typescript
// POST /api/connections/[id]/sync - Trigger manual sync
```

#### Revenue Data
**File: `src/app/api/revenue/route.ts`**
```typescript
// GET /api/revenue?startupId=xxx&startDate=xxx&endDate=xxx
// Returns revenue data for charts
```

#### Stories
**File: `src/app/api/stories/route.ts`**
```typescript
// POST /api/stories - Create story
// GET /api/stories - List stories
```

**File: `src/app/api/stories/[id]/route.ts`**
```typescript
// GET /api/stories/[id] - Get story
// PATCH /api/stories/[id] - Update story
// DELETE /api/stories/[id] - Delete story
```

#### Milestones
**File: `src/app/api/milestones/route.ts`**
```typescript
// POST /api/milestones - Create milestone
// GET /api/milestones - List milestones
```

**File: `src/app/api/milestones/[id]/route.ts`**
```typescript
// PATCH /api/milestones/[id] - Update milestone
// DELETE /api/milestones/[id] - Delete milestone
```

#### Leaderboard
**File: `src/app/api/leaderboard/route.ts`**
```typescript
// GET /api/leaderboard?category=xxx&limit=xxx
// Returns ranked startups
```

#### Settings
**File: `src/app/api/settings/route.ts`**
```typescript
// GET /api/settings - Get settings
// PATCH /api/settings - Update settings
```

### 4. Server Services

#### Data Aggregator
**File: `src/server/aggregator.ts`** (already exists - needs implementation)
```typescript
// Functions:
// - aggregateRevenueData(startupId, startDate, endDate)
// - syncFromConnection(connectionId)
// - calculateMetrics(revenueData)
// - detectMilestones(startupId)
```

#### Payment Provider Integrations
**Files: `src/providers/*.ts`**
- ✅ `stripe.ts` (already exists)
- Need: `paddle.ts`, `lemonsqueezy.ts`, `paypal.ts`

Each provider implements:
```typescript
interface PaymentProvider {
  validateCredentials(credentials): Promise<boolean>;
  fetchRevenue(credentials, startDate, endDate): Promise<RevenueData[]>;
  fetchCustomers(credentials): Promise<CustomerData>;
}
```

#### Standalone App Client
**File: `src/standalone/client.ts`** (already exists - needs full implementation)
```typescript
// Functions:
// - connectToStandalone(endpoint, apiKey): Promise<boolean>
// - fetchRevenueData(endpoint, apiKey, params): Promise<RevenueData[]>
// - verifyDataIntegrity(data, signature, publicKey): boolean
```

#### Background Jobs (BullMQ)
**File: `src/jobs/sync.ts`**
```typescript
// Jobs:
// - Daily sync for all active connections
// - Hourly leaderboard refresh
// - Weekly featured startup rotation
// - Milestone detection after sync
```

### 5. Missing UI Components

#### Dialog
**File: `src/components/ui/dialog.tsx`**
```typescript
// Modal dialog component (Radix UI)
```

#### Select
**File: `src/components/ui/select.tsx`**
```typescript
// Select dropdown component (Radix UI)
```

#### Switch
**File: `src/components/ui/switch.tsx`**
```typescript
// Toggle switch component (Radix UI)
```

#### Tabs
**File: `src/components/ui/tabs.tsx`**
```typescript
// Tabs component (Radix UI)
```

#### Toast/Sonner
**File: `src/components/ui/toast.tsx`**
```typescript
// Toast notifications
```

### 6. Utility Functions

#### Encryption Helper
**File: `src/lib/encryption.ts`**
```typescript
// Functions:
// - encryptApiKey(key: string): string
// - decryptApiKey(encrypted: string): string
```

#### Data Verification
**File: `src/lib/verification.ts`**
```typescript
// Functions:
// - verifySignature(data, signature, publicKey): boolean
// - generateDataHash(data): string
```

#### Revenue Calculations
**File: `src/lib/revenue.ts`**
```typescript
// Functions:
// - calculateMRR(revenueData): number
// - calculateARR(mrr): number
// - calculateGrowthRate(current, previous): number
// - calculateChurnRate(data): number
```

## 📋 Implementation Priority

### Phase 1: Core Features (MVP)
1. ✅ Database schema
2. ✅ Authentication pages
3. ✅ Dashboard layout
4. ✅ Leaderboard
5. ✅ Startup profile page
6. Onboarding flow
7. Connection management (at least Stripe)
8. API routes for startup/connection CRUD
9. Data aggregator service
10. Basic sync job

### Phase 2: Enhanced Features
1. Analytics dashboard
2. Stories & milestones
3. Settings page with privacy controls
4. Multiple payment providers
5. Standalone app integration
6. Explore page with filters
7. About/Features/Pricing pages

### Phase 3: Advanced Features
1. Advanced analytics
2. Export functionality
3. Webhook handling
4. Email notifications
5. Premium features/billing
6. Admin panel
7. API documentation
8. Public API

## 🛠️ Development Commands

### Run Database Migrations
```bash
cd apps/platform
pnpm db:push  # Push schema changes
pnpm db:migrate  # Create migrations
pnpm db:seed  # Seed development data
```

### Development
```bash
pnpm dev  # Start dev server
pnpm build  # Build for production
pnpm typecheck  # Run TypeScript checks
```

### Testing
```bash
pnpm test  # Run unit tests
pnpm test:e2e  # Run E2E tests
```

## 📦 Required Dependencies

Already installed in package.json, but verify:
```json
{
  "@radix-ui/react-avatar": "^1.1.2",
  "@radix-ui/react-dialog": "^1.1.4",
  "@radix-ui/react-select": "^2.1.4",
  "@radix-ui/react-switch": "^1.1.2",
  "@radix-ui/react-tabs": "^1.1.2",
  "recharts": "^3.3.0",
  "bullmq": "^5.31.1",
  "next-auth": "5.0.0-beta.22",
  "@prisma/client": "^6.2.1",
  "stripe": "^19.2.0"
}
```

## 🔐 Environment Variables

Create `.env.local`:
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/openrevenue"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Redis (for BullMQ)
REDIS_URL="redis://localhost:6379"

# Encryption
ENCRYPTION_KEY="your-32-char-encryption-key"

# Payment Providers (optional - for direct integration)
STRIPE_SECRET_KEY=
PADDLE_API_KEY=
LEMONSQUEEZY_API_KEY=

# Email (optional - for notifications)
RESEND_API_KEY=

# Analytics (optional)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
```

## 📝 Notes

- All pages should have proper metadata for SEO
- Use server components where possible for better performance
- Implement proper error handling and loading states
- Add proper TypeScript types for all API responses
- Follow the existing code style and patterns
- Test all features thoroughly before deployment

## 🎯 Quick Start for Contributing

1. Choose a feature from Phase 1 that's not implemented
2. Create the necessary files following the structure above
3. Implement the feature with proper types and error handling
4. Test the feature locally
5. Submit for review

For questions or clarifications, refer to the CLAUDE.md file in the repository root.
