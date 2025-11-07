# Getting Started with OpenRevenue

## 🎯 Choose Your Path

OpenRevenue has two components:

### 1. **Standalone App** (✅ Ready to Use)
**For indie hackers & startups** who want to self-host their revenue transparency page.

**Status**: Fully functional, production-ready
**Time to setup**: 5 minutes

[Jump to Standalone Setup](#standalone-app-setup) →

### 2. **Main Platform** (🚧 In Development)
**For users** who want a central platform to discover transparent startups and manage their revenue sharing.

**Status**: 35% complete - core pages done, features in progress
**Time to contribute**: See implementation guide

[Jump to Platform Development](#platform-development) →

---

## Standalone App Setup

### Prerequisites
- Node.js 20+
- pnpm installed (`npm install -g pnpm`)

### Quick Start (5 minutes)

```bash
# 1. Navigate to standalone app
cd packages/standalone

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env

# 4. Edit .env and set these secrets:
#    JWT_SECRET=your-random-secret-here
#    SESSION_SECRET=your-random-secret-here

# 5. Initialize database
pnpm db:init

# 6. Start development servers (backend + frontend)
pnpm dev
```

### Access Your App

- **Frontend Dev Server**: http://localhost:3002
- **Backend API**: http://localhost:3001/api/v1
- **Health Check**: http://localhost:3001/health

### First-Time Setup

1. Visit http://localhost:3002
2. You'll be redirected to `/onboarding`
3. **Step 1**: Enter your startup details
   - Name, tagline, description
   - Website, founder info
4. **Step 2**: Create admin account
   - Username, password, email (optional)
5. You'll be automatically logged in!

### What You Can Do

✅ **Public Page** (`/`) - Show your revenue transparently
- Revenue metrics (MRR, ARR, total revenue, customers)
- Growth charts
- Configurable privacy settings (exact, ranges, or hidden)

✅ **Dashboard** (`/dashboard`) - Manage your data
- Add payment provider connections (Stripe, etc.)
- Generate API keys for platform integration
- Configure privacy settings

✅ **Authentication** - Secure access
- Login with username/password
- API key authentication for external apps
- Session management

### Next Steps

- **Connect Stripe**: Go to Dashboard → Connections → Add Connection
- **Generate API Key**: Dashboard → API Keys → Generate New Key
- **Customize Public Page**: Dashboard → Settings → Privacy Settings
- **View Documentation**: See `packages/standalone/README.md`

---

## Platform Development

### Prerequisites
- Node.js 20+
- pnpm installed
- PostgreSQL database
- Redis (optional, for background jobs)

### Setup

```bash
# 1. Navigate to platform
cd apps/platform

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env.local

# 4. Configure .env.local
#    DATABASE_URL="postgresql://user:pass@localhost:5432/openrevenue"
#    NEXTAUTH_URL="http://localhost:5100"
#    NEXTAUTH_SECRET="your-secret-here"

# 5. Push database schema
pnpm db:push

# 6. (Optional) Seed development data
pnpm db:seed

# 7. Start development server
pnpm dev
```

### What's Working

✅ **Landing Page** (`/`) - Marketing page
✅ **Login/Register** (`/login`, `/register`) - Authentication pages
✅ **Leaderboard** (`/leaderboard`) - Browse startups
✅ **Startup Profile** (`/startup/[slug]`) - Individual startup pages
✅ **Dashboard Layout** (`/dashboard`) - Navigation and overview

### What Needs Implementation

❌ Onboarding flow
❌ Connection management
❌ Analytics dashboard
❌ Stories & milestones
❌ Settings page
❌ API routes
❌ Background sync jobs

### Implementation Guide

A comprehensive guide has been created:
📖 **`apps/platform/IMPLEMENTATION_GUIDE.md`**

This guide includes:
- Complete file structure for all features
- Code examples and interfaces
- 3-phase implementation plan
- Priority order for MVP features

### How to Contribute

1. **Pick a feature** from Phase 1 in the implementation guide
2. **Create the files** following the structure provided
3. **Implement the feature** with proper types and error handling
4. **Test locally** to ensure it works
5. **Submit** for review

---

## Development Workflow

### Both Apps

```bash
# From repository root
pnpm install        # Install all dependencies
pnpm dev           # Run all apps in dev mode
pnpm build         # Build all apps
pnpm typecheck     # TypeScript checks
pnpm lint          # Lint all code
```

### Standalone App Only

```bash
cd packages/standalone
pnpm dev           # Backend + frontend dev servers
pnpm dev:backend   # Backend only
pnpm dev:ui        # Frontend only
pnpm build         # Build for production
pnpm start         # Run production server
```

### Platform Only

```bash
cd apps/platform
pnpm dev           # Next.js dev server
pnpm build         # Build for production
pnpm start         # Run production server
pnpm db:push       # Update database schema
pnpm db:studio     # Open Prisma Studio
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    OPENREVENUE ECOSYSTEM                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────┐          ┌──────────────────────────┐
│  STANDALONE APP     │          │   MAIN PLATFORM          │
│  (packages/        │◄─────────│   (apps/platform)        │
│   standalone)       │   API    │                          │
│                     │   Key    │                          │
│  • Self-hosted      │          │  • Central hub           │
│  • SQLite DB        │          │  • PostgreSQL DB         │
│  • Public page      │          │  • Leaderboard           │
│  • Dashboard        │          │  • Discovery             │
│  • API              │          │  • User dashboard        │
└─────────────────────┘          └──────────────────────────┘
         │                                  │
         │                                  │
         ▼                                  ▼
┌─────────────────────┐          ┌──────────────────────────┐
│  Payment Providers  │          │   Users & Community      │
│  • Stripe           │          │   • Browse startups      │
│  • Paddle           │          │   • Share stories        │
│  • Lemon Squeezy    │          │   • Track growth         │
└─────────────────────┘          └──────────────────────────┘
```

### How They Work Together

1. **Indie hacker** installs standalone app on their server
2. **Standalone app** connects to Stripe (or other provider)
3. **Standalone app** syncs and displays revenue on public page
4. **Main platform** can connect to standalone app via API key
5. **Main platform** shows startup on leaderboard
6. **Community** discovers and follows transparent startups

---

## Common Commands

### Database

```bash
# Standalone app
cd packages/standalone
pnpm db:init              # Initialize SQLite database

# Platform
cd apps/platform
pnpm db:push              # Push schema changes
pnpm db:migrate           # Create migration
pnpm db:seed              # Seed data
pnpm db:studio            # Open Prisma Studio
```

### Development

```bash
# Start everything
pnpm dev                  # From root

# Standalone only
cd packages/standalone
pnpm dev                  # Backend + frontend
pnpm dev:backend          # Backend only
pnpm dev:ui               # Frontend only

# Platform only
cd apps/platform
pnpm dev                  # Next.js dev server
```

### Building

```bash
# Standalone
cd packages/standalone
pnpm build                # Build both backend + frontend
pnpm start                # Run production

# Platform
cd apps/platform
pnpm build                # Next.js build
pnpm start                # Next.js production
```

---

## Troubleshooting

### Standalone App

**Port already in use:**
```bash
# Change ports in .env
API_PORT=3003  # Instead of 3001
# Vite dev server is 3002 by default
```

**Database locked:**
```bash
pkill -f "node dist/index.js"  # Kill all instances
rm -rf data/*.db-*             # Remove lock files
pnpm db:init                   # Reinitialize
```

**Can't access dashboard:**
- Make sure you completed onboarding
- Check browser cookies are enabled
- Try clearing cookies and logging in again

### Platform

**Database connection error:**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Verify DATABASE_URL in .env.local
# Format: postgresql://user:pass@host:port/dbname
```

**NextAuth error:**
```bash
# Make sure NEXTAUTH_SECRET is set
openssl rand -base64 32 > secret.txt
# Copy secret to .env.local
```

**Module not found:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
```

---

## Documentation Links

### Standalone App
- 📖 [README](./packages/standalone/README.md) - Full documentation
- 🔐 [Authentication Guide](./packages/standalone/AUTHENTICATION.md) - Dual auth system
- ⚙️ [.env.example](./packages/standalone/.env.example) - Configuration

### Main Platform
- 📋 [Implementation Guide](./apps/platform/IMPLEMENTATION_GUIDE.md) - What needs to be built
- 📊 [Implementation Status](./IMPLEMENTATION_STATUS.md) - Current progress
- 🗄️ [Prisma Schema](./apps/platform/prisma/schema.prisma) - Database models

### Project
- 📚 [CLAUDE.md](./CLAUDE.md) - Complete project documentation
- 🚀 [This File](./GETTING_STARTED.md) - You are here!

---

## Need Help?

### For Standalone App
1. Check README: `packages/standalone/README.md`
2. Check auth guide: `packages/standalone/AUTHENTICATION.md`
3. Check environment: `packages/standalone/.env.example`

### For Platform Development
1. Check implementation guide: `apps/platform/IMPLEMENTATION_GUIDE.md`
2. Check status: `IMPLEMENTATION_STATUS.md`
3. Check architecture: `CLAUDE.md`

### General Questions
- Read project docs: `CLAUDE.md`
- Check issues on GitHub
- Review code examples in standalone app

---

## What to Build Next?

### If you're a user: ✅ Use Standalone App
It's complete and ready! Deploy it to your server and start sharing your revenue transparently.

### If you're a contributor: 🚧 Help Build the Platform
Priority features (easiest to hardest):
1. **Onboarding flow** - Multi-step wizard for new users
2. **Settings page** - Configure startup and privacy
3. **About/Features pages** - Static marketing pages
4. **Connections API** - CRUD operations for data connections
5. **Analytics dashboard** - Charts and metrics
6. **Background sync jobs** - Automated revenue syncing

Check `apps/platform/IMPLEMENTATION_GUIDE.md` for detailed instructions!

---

**Happy building! 🚀**
