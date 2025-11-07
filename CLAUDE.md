# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OpenRevenue** is an open-source alternative to TrustMRR that allows startups to verify and showcase their revenue transparently. The platform consists of two main components:

1. **OpenRevenue Platform**: The main web application for discovering and showcasing verified startups
2. **OpenRevenue Standalone App**: A self-hosted data provider that indies/startups can install on their own servers

The platform provides multiple integration options, granular privacy controls, and community-driven features for transparent revenue sharing.

## Technology Stack

### Main Platform
- **Frontend**: Next.js 14+ (TypeScript) with App Router, Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes (serverless), BullMQ + Redis for background jobs
- **Database**: PostgreSQL 15+ with Redis 7+ for caching
- **Authentication**: NextAuth.js v5
- **Package Manager**: pnpm
- **Runtime**: Node.js 20+

### Standalone App
- **Backend Framework**: Express.js or Fastify (Node.js)
- **Frontend**: Next.js with static export or vanilla HTML/CSS/JS
- **Database**: SQLite (for simplicity) or PostgreSQL
- **Authentication**: JWT-based API keys + session management for UI
- **Package Manager**: pnpm
- **Runtime**: Node.js 20+
- **Deployment**: Docker container for easy self-hosting
- **Data Integrity**: Cryptographic signatures for API responses

## Development Commands

### Main Platform
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Set up database
pnpm db:push

# Seed development data
pnpm db:seed

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Linting and formatting
pnpm lint
pnpm lint:fix
pnpm format

# Type checking
pnpm typecheck

# Database operations
pnpm db:migrate
pnpm db:reset
pnpm db:studio
```

### Standalone App
```bash
# Navigate to standalone app directory
cd packages/standalone

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Initialize database
pnpm db:init

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Build Docker image
docker build -t openrevenue-standalone .

# Run with Docker
docker run -p 3001:3001 -v ./data:/app/data openrevenue-standalone

# Access UI
# API: http://localhost:3001/api/v1
# Web UI: http://localhost:3001
```

## Architecture Overview

### High-Level Structure
```
┌─────────────────────────────────────────────────────────────┐
│                    OPENREVENUE PLATFORM                      │
├─────────────────────────────────────────────────────────────┤
│  Web App (Next.js)  │  Embeddable Widget  │  Public API     │
└──────────────┬──────────────────┬──────────────────┬────────┘
               │                  │                  │
┌──────────────▼──────────────────▼──────────────────▼────────┐
│                      APPLICATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  API Routes  │  Auth Service  │  Data Aggregator             │
└──────────────┬─────────────────────────────────────┬────────┘
               │                                     │
┌──────────────▼─────────────────────────────────────▼────────┐
│                       DATA LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis Cache  │  Encrypted Storage (Vault)   │
└──────────────┬─────────────────────────────────────┬────────┘
               │                                     │
┌──────────────▼─────────────────────────────────────▼────────┐
│                   DATA SOURCES                               │
├─────────────────────────────────────────────────────────────┤
│  Direct APIs     │        Standalone Apps                    │
│  (Stripe,        │        ┌─────────────────┐               │
│   Paddle, etc.)  │        │ User's Server   │               │
│                  │        │ ┌─────────────┐ │               │
│                  │        │ │ Standalone  │ │               │
│                  │        │ │ App + API   │ │               │
│                  │        │ └─────────────┘ │               │
│                  │        └─────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

#### Main Platform
- **Data Aggregator**: Unified service to fetch data from multiple sources (direct APIs + standalone apps)
- **Payment Providers**: Abstract interface with implementations for direct API integrations
- **Standalone App Client**: HTTP client for communicating with self-hosted standalone apps
- **Revenue Sync**: Background jobs for scheduled synchronization from all data sources
- **Leaderboard**: Materialized views with multi-layer caching (edge, Redis, database)
- **Dashboard**: User management interface with startup settings and analytics

#### Standalone App
- **Revenue Collector**: Service to sync data from payment processors to local database
- **API Server**: REST API to expose aggregated revenue data to main platform
- **Web UI**: Self-hosted website to showcase revenue and startup details
- **Authentication**: API key management + session management for web UI
- **Data Verification**: Cryptographic signing system to verify data authenticity
- **Local Database**: SQLite/PostgreSQL to store processed revenue data locally

### Database Schema

#### Main Platform
Core entities: users, startups, data_connections, revenue_snapshots, milestones, stories, categories, achievements

#### Standalone App
Entities: connections, revenue_data, sync_logs, api_keys

## Development Patterns

### File Structure
```
# Monorepo structure
├── apps/
│   └── platform/         # Main OpenRevenue platform
│       ├── src/
│       │   ├── app/              # Next.js app directory
│       │   ├── components/       # React components
│       │   ├── lib/              # Utilities and helpers
│       │   ├── providers/        # Payment provider integrations
│       │   ├── standalone/       # Standalone app client
│       │   ├── server/           # Server-side logic
│       │   └── types/            # TypeScript types
├── packages/
│   ├── standalone/       # Standalone app
│   │   ├── src/
│   │   │   ├── api/             # API routes
│   │   │   ├── web/             # Web UI components
│   │   │   ├── services/        # Business logic
│   │   │   ├── providers/       # Payment integrations
│   │   │   ├── database/        # Database layer
│   │   │   ├── crypto/          # Data verification utilities
│   │   │   └── types/           # TypeScript types
│   │   ├── public/              # Static assets for web UI
│   │   ├── Dockerfile
│   │   └── package.json
│   └── shared/           # Shared types and utilities
└── docker-compose.yml    # For local development
```

### Data Source Integration

#### Direct Payment Provider Integration
Payment providers implement the `PaymentProvider` interface with methods for:
- `validateCredentials()`: Verify API key validity
- `fetchRevenue()`: Retrieve revenue data for date range  
- `fetchCustomerCount()`: Get customer metrics
- `verifyWebhook()`: Validate webhook signatures

#### Standalone App Integration
Standalone app clients implement the `StandaloneClient` interface with methods for:
- `validateConnection()`: Verify API key and app availability
- `fetchRevenue()`: Retrieve aggregated revenue data from standalone app
- `getHealthStatus()`: Check if standalone app is responsive
- `authenticateRequest()`: Handle authentication with user's standalone app
- `verifyDataIntegrity()`: Validate cryptographic signatures to ensure data authenticity

#### Connection Types
When registering a startup, users can choose between:
1. **Direct API Integration**: Provide read-only API keys for direct payment processor access
2. **Standalone App**: Provide API endpoint URL and API key for their self-hosted instance

### Security Considerations

#### Main Platform
- API keys encrypted with AES-256-GCM at rest
- Rate limiting on all endpoints (100/hour public, 1000/hour authenticated)
- HTTPS only with security headers
- Input validation using Zod schemas
- SQL injection prevention with parameterized queries
- Standalone app connections validated with API key + endpoint verification

#### Standalone App
- JWT-based API authentication
- Session-based authentication for web UI
- HTTPS enforcement for external connections
- CORS configuration for main platform access
- Request logging and rate limiting
- Secure storage of payment processor credentials
- Health check endpoints for monitoring
- Cryptographic data signing for integrity verification
- Public key distribution for signature verification

### Caching Strategy
- Edge cache: Leaderboard (1hr), startup pages (5min), static assets (1 day)
- Redis cache: Leaderboard (15min), startup stats (5min), user sessions (7 days)
- Materialized views: Leaderboard refreshed hourly, category stats daily

### Background Jobs

#### Main Platform (BullMQ + Redis)
- Daily revenue sync from all data sources (2 AM UTC)
- Hourly leaderboard refresh
- Weekly featured startup rotation
- Milestone checks after revenue updates
- Health checks for standalone app connections
- Connection validation and retry logic

#### Standalone App
- Scheduled sync from payment processors (configurable interval)
- Data cleanup and aggregation jobs
- Health status updates
- Webhook processing for real-time updates
- Data signing and signature renewal jobs
- Web UI cache refresh

## Testing Strategy

### Main Platform
- **Unit Tests**: 60% of test suite using Vitest
- **Integration Tests**: 30% testing API endpoints, database operations, and standalone app communication
- **E2E Tests**: 10% using Playwright for critical user flows
- **Target Coverage**: 80% overall, 95% for critical paths, 100% for payment/security functions

### Standalone App
- **Unit Tests**: API endpoints, web UI components, data processing, and business logic
- **Integration Tests**: Payment provider integrations, database operations, and signature verification
- **UI Tests**: Web interface functionality and user flows
- **Docker Tests**: Container functionality and deployment
- **Security Tests**: Cryptographic signature verification and data integrity
- **Target Coverage**: 85% overall, 100% for API endpoints, security functions, and data verification

## Environment Variables

### Main Platform
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string  
- `NEXTAUTH_SECRET`: Authentication secret
- `ENCRYPTION_KEY`: For API key encryption
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`: Stripe integration
- Payment provider credentials for Paddle, Lemon Squeezy, PayPal
- `RESEND_API_KEY`: Email service

### Standalone App
- `DATABASE_URL`: SQLite/PostgreSQL connection string
- `JWT_SECRET`: For API key generation and validation
- `SESSION_SECRET`: For web UI session management
- `SIGNING_PRIVATE_KEY`: Private key for data signing (generated on first run)
- `SYNC_INTERVAL`: Hours between automatic revenue syncs (default: 24)
- `API_PORT`: Port for API server (default: 3001)
- `WEB_UI_ENABLED`: Enable/disable web UI (default: true)
- `STARTUP_NAME`: Name displayed in web UI
- `STARTUP_DESCRIPTION`: Description for web UI
- Payment provider credentials for connected services
- `OPENREVENUE_PLATFORM_URL`: URL of main platform for webhook callbacks

## Privacy & Compliance

The platform includes granular privacy controls allowing startups to:
- Display revenue as exact amounts, ranges, or hidden
- Control visibility of MRR, customer count, growth metrics
- Set historical data timeframes for public display
- GDPR compliance with data export/deletion capabilities
- **Enhanced Privacy**: Option to use standalone app keeps sensitive payment data on user's own infrastructure
- Data sovereignty: Users maintain full control over their revenue data when using standalone deployment

## Deployment

### Main Platform
- **Production**: Vercel for hosting with serverless functions
- **Database**: Supabase (managed PostgreSQL) with connection pooling
- **Redis**: Upstash (serverless Redis) for caching and job queue
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Monitoring**: Sentry for error tracking, Plausible for analytics

### Standalone App
- **Self-Hosted**: Docker container deployment on user's infrastructure
- **Requirements**: 512MB RAM, 1 CPU core minimum
- **Storage**: Local SQLite database or PostgreSQL connection
- **Networking**: HTTPS endpoint accessible by main platform
- **Updates**: Automated Docker image updates with version management

## Development Phases

**Phase 1 (MVP)**: 
- Core platform with direct Stripe integration
- Basic standalone app with Stripe support and web UI
- Data verification system with cryptographic signatures
- Leaderboard and startup registration
- Dual connection options (direct API vs standalone)

**Phase 2 (Growth)**: 
- Multiple payment processors for both platform and standalone app
- Stories/milestones features
- Public API
- Enhanced standalone app management UI

**Phase 3 (Scale)**: 
- Embeddable widgets
- Community features
- Premium offerings
- Advanced standalone app features:
  - Multi-tenant support
  - Advanced analytics and custom dashboards
  - White-label web UI customization
  - Advanced verification and audit trails