# OpenRevenue - Technical Specification Document

**Version:** 1.0  
**Last Updated:** October 31, 2025  
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Database Design](#4-database-design)
5. [API Specifications](#5-api-specifications)
6. [Payment Integration](#6-payment-integration)
7. [Security & Privacy](#7-security--privacy)
8. [Frontend Components](#8-frontend-components)
9. [Background Jobs](#9-background-jobs)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Performance Requirements](#11-performance-requirements)
12. [Development Phases](#12-development-phases)
13. [Testing Strategy](#13-testing-strategy)
14. [Monitoring & Analytics](#14-monitoring--analytics)

---

## 1. Executive Summary

### 1.1 Project Overview

**OpenRevenue** is an open-source alternative to TrustMRR that allows startups to verify and showcase their revenue transparently. The platform consists of two complementary components:

1. **OpenRevenue Platform**: The main web application for discovering and showcasing verified startups
2. **OpenRevenue Standalone App**: A self-hosted data provider that indies/startups can install on their own servers

Key features include:
- Dual integration modes (direct API access or self-hosted standalone apps)
- Multi-platform payment processor support
- Complete data sovereignty for privacy-conscious users
- Granular privacy controls
- Community-driven features
- Story-focused project showcasing

### 1.2 Core Objectives

1. **Transparency:** Enable startups to prove revenue authenticity through verified integrations
2. **Community:** Build trust within the indie hacker ecosystem
3. **Flexibility:** Support multiple payment processors and deployment models
4. **Privacy:** Give founders complete control over their data and what they share
5. **Data Sovereignty:** Allow users to keep sensitive data on their own infrastructure
6. **Open Source:** Enable self-hosting and community contributions

### 1.3 Success Metrics

- **Launch:** 50 verified startups within first month
- **Engagement:** 10,000 monthly page views by month 3
- **Community:** 500 newsletter subscribers by month 2
- **Technical:** 99.5% uptime, <2s page load time
- **Growth:** 20% month-over-month startup additions

---

## 2. System Architecture

### 2.1 High-Level Architecture

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
│                     DATA SOURCES                             │
├─────────────────────────────────────────────────────────────┤
│  Direct APIs     │        Standalone Apps                    │
│  ┌─────────────┐ │        ┌─────────────────┐               │
│  │   Stripe    │ │        │ User's Server   │               │
│  │   Paddle    │ │        │ ┌─────────────┐ │               │
│  │ LemonSqueezy│ │        │ │ Standalone  │ │               │
│  │   PayPal    │ │        │ │ App + API   │ │               │
│  └─────────────┘ │        │ └─────────────┘ │               │
│                  │        └─────────────────┘               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  STANDALONE APP ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────┤
│              API Server (Express/Fastify)                   │
├─────────────────────────────────────────────────────────────┤
│  Revenue Sync  │  Data Processing  │  Authentication        │
├─────────────────────────────────────────────────────────────┤
│              Local Database (SQLite/PostgreSQL)             │
├─────────────────────────────────────────────────────────────┤
│            Payment Provider Integrations                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Stripe API  │  Paddle API  │  Lemon Squeezy │ PayPal  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Breakdown

#### OpenRevenue Platform

**Frontend Application:**
- Next.js 14+ App Router
- Server-Side Rendering (SSR) for SEO
- Client-side interactivity with React
- Tailwind CSS for styling
- Shadcn/ui for component library

**Backend Services:**
- Next.js API Routes (serverless)
- Background job processor (BullMQ + Redis)
- Data aggregation service (handles both direct APIs and standalone apps)
- Standalone app client for HTTP communication
- Webhook handlers for real-time updates

**Data Storage:**
- PostgreSQL (primary database)
- Redis (caching + job queue)
- Encrypted vault for API keys and connection details

**External Integrations:**
- Direct payment processor APIs (Stripe, Paddle, etc.)
- Standalone app APIs (user-hosted)
- Email service (Resend/SendGrid)
- Analytics (Plausible/PostHog)

#### Standalone App

**API Server:**
- Express.js or Fastify framework
- RESTful API endpoints for data access
- JWT-based authentication for API access
- Health check and status endpoints
- Data integrity verification endpoints

**Web Application:**
- Next.js with static export or server-side rendering
- Responsive web UI for revenue showcase
- Session-based authentication for web access
- Customizable branding and themes
- Public revenue dashboard
- Admin interface for configuration

**Core Services:**
- Revenue synchronization service
- Data processing and aggregation
- Background job scheduler
- Webhook processing for real-time updates
- Cryptographic data signing service
- Web UI rendering and caching

**Data Storage:**
- SQLite (default for simplicity) or PostgreSQL
- Encrypted storage for payment processor credentials
- Local data aggregation and caching
- Signature storage for data verification

**Payment Integrations:**
- Modular payment provider system
- Support for Stripe, Paddle, Lemon Squeezy, PayPal
- Webhook handling for real-time updates

**Data Verification:**
- Ed25519/RSA cryptographic signatures for all API responses
- Public key distribution for signature verification
- Audit trail for data modifications
- Tamper detection and alerts

---

## 3. Technology Stack

### 3.1 OpenRevenue Platform Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | Next.js 14+ (TypeScript) | SSR/SSG, SEO-friendly, React ecosystem |
| **Styling** | Tailwind CSS + Shadcn/ui | Rapid development, consistent design |
| **Database** | PostgreSQL 15+ | Relational data, ACID compliance, JSON support |
| **Caching** | Redis 7+ | Fast reads, job queue, session storage |
| **Authentication** | NextAuth.js v5 | OAuth support, session management |
| **Payment Integration** | Native SDKs + HTTP clients | Direct APIs + standalone app communication |
| **Background Jobs** | BullMQ | Reliable job processing, Redis-based |
| **API Documentation** | OpenAPI 3.0 + Swagger | Standard documentation format |
| **Deployment** | Vercel/Railway | Easy deployment, serverless functions |
| **Monitoring** | Sentry + Plausible | Error tracking + privacy-friendly analytics |

### 3.2 Standalone App Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Backend Framework** | Express.js/Fastify | Lightweight, fast, extensive ecosystem |
| **Frontend Framework** | Next.js (static export) / Vanilla | Server-side rendering / Minimal complexity |
| **Database** | SQLite (default) / PostgreSQL | Local storage, easy deployment / Advanced features |
| **Authentication** | JWT + Sessions | API access + Web UI authentication |
| **Payment Integration** | Native SDKs | Official payment processor libraries |
| **Job Processing** | Node-cron / Bull | Simple scheduling / Advanced job management |
| **Data Verification** | Node.js crypto / tweetnacl | Built-in crypto / Ed25519 signatures |
| **Deployment** | Docker | Container-based, easy self-hosting |
| **Monitoring** | Winston logging | File and console logging |

### 3.3 Development Tools

```json
{
  "runtime": "Node.js 20+",
  "package_manager": "pnpm (monorepo with workspaces)",
  "linting": "ESLint + Prettier",
  "testing": "Vitest + Playwright",
  "ci_cd": "GitHub Actions",
  "version_control": "Git + GitHub",
  "code_quality": "Husky + lint-staged",
  "containerization": "Docker + Docker Compose"
}
```

### 3.4 Third-Party Services

#### Platform Services
- **Email:** Resend (transactional emails)
- **CDN:** Vercel Edge Network / Cloudflare
- **File Storage:** S3-compatible storage (if needed)
- **Secrets Management:** Environment variables + Vault
- **DNS:** Cloudflare

#### Standalone App Services
- **Container Registry:** Docker Hub / GitHub Container Registry
- **Reverse Proxy:** Nginx / Traefik (user-configurable)
- **SSL Certificates:** Let's Encrypt integration
- **Updates:** Automated Docker image updates

---

## 4. Database Design

### 4.1 Schema Overview

#### OpenRevenue Platform Database

```sql
-- Core Entities
- users
- startups
- data_connections  -- Unified table for both direct API and standalone app connections
- revenue_snapshots
- milestones
- stories
- categories
- achievements

-- Supporting Tables
- startup_members
- featured_startups
- email_subscribers
- api_keys
- audit_logs
- connection_health -- Track standalone app connection status
```

#### Standalone App Database

```sql
-- Core Entities
- connections        -- Local payment processor connections
- revenue_data      -- Processed revenue information
- sync_logs         -- Synchronization history and status
- api_keys          -- Generated keys for platform access
- webhooks          -- Webhook configurations and logs

-- Configuration Tables
- app_settings      -- Local app configuration
- provider_configs  -- Payment provider specific settings
```

### 4.2 Detailed Schema

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE
);

-- Startups Table
CREATE TABLE startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website_url VARCHAR(500),
  logo_url TEXT,
  
  -- Display Settings
  is_public BOOLEAN DEFAULT TRUE,
  show_revenue BOOLEAN DEFAULT TRUE,
  show_mrr BOOLEAN DEFAULT TRUE,
  show_customer_count BOOLEAN DEFAULT FALSE,
  revenue_display_mode VARCHAR(20) DEFAULT 'exact', -- exact, range, hidden
  
  -- Metadata
  launch_date DATE,
  category_id UUID REFERENCES categories(id),
  tech_stack JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  
  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, paused, deleted
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Full-text search
  search_vector TSVECTOR
);

CREATE INDEX idx_startups_search ON startups USING GIN(search_vector);
CREATE INDEX idx_startups_slug ON startups(slug);
CREATE INDEX idx_startups_status ON startups(status);

-- Data Connections Table (unified for both direct API and standalone apps)
CREATE TABLE data_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
  
  -- Connection Type
  connection_type VARCHAR(20) NOT NULL, -- 'direct_api', 'standalone_app'
  provider VARCHAR(50), -- stripe, paddle, lemon_squeezy, paypal (for direct_api)
  
  -- Direct API fields
  credentials_id VARCHAR(255), -- Encrypted credentials (for direct_api)
  account_id VARCHAR(255), -- Provider's account identifier
  account_name VARCHAR(255),
  
  -- Standalone App fields
  app_url VARCHAR(500), -- Base URL of standalone app (for standalone_app)
  app_api_key_hash VARCHAR(255), -- Encrypted API key for standalone app
  app_version VARCHAR(50), -- Track standalone app version
  
  -- Common fields
  currency VARCHAR(3) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMP,
  sync_status VARCHAR(20) DEFAULT 'pending', -- pending, syncing, success, error
  sync_error TEXT,
  sync_frequency_hours INTEGER DEFAULT 24,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_startup_connection UNIQUE(startup_id, connection_type, provider, app_url),
  CONSTRAINT check_connection_fields CHECK (
    (connection_type = 'direct_api' AND provider IS NOT NULL AND credentials_id IS NOT NULL) OR
    (connection_type = 'standalone_app' AND app_url IS NOT NULL AND app_api_key_hash IS NOT NULL)
  )
);

-- Connection Health Tracking
CREATE TABLE connection_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES data_connections(id) ON DELETE CASCADE,
  
  health_status VARCHAR(20) NOT NULL, -- healthy, degraded, unhealthy, unreachable
  response_time_ms INTEGER,
  error_message TEXT,
  last_successful_sync TIMESTAMP,
  consecutive_failures INTEGER DEFAULT 0,
  
  checked_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_connection_health_connection FOREIGN KEY (connection_id) REFERENCES data_connections(id)
);

CREATE INDEX idx_connection_health_connection ON connection_health(connection_id);
CREATE INDEX idx_connection_health_status ON connection_health(health_status, checked_at);

-- Revenue Snapshots Table
CREATE TABLE revenue_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
  data_connection_id UUID REFERENCES data_connections(id),
  
  -- Revenue Data
  snapshot_date DATE NOT NULL,
  total_revenue DECIMAL(15,2) NOT NULL DEFAULT 0,
  mrr DECIMAL(15,2),
  arr DECIMAL(15,2),
  
  -- Metrics
  customer_count INTEGER,
  new_customers INTEGER,
  churned_customers INTEGER,
  refund_amount DECIMAL(15,2),
  
  -- Period-specific
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Revenue by product (JSONB for flexibility)
  revenue_breakdown JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_startup_date UNIQUE(startup_id, snapshot_date)
);

CREATE INDEX idx_revenue_startup_date ON revenue_snapshots(startup_id, snapshot_date DESC);
CREATE INDEX idx_revenue_date ON revenue_snapshots(snapshot_date);

-- Milestones Table
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
  
  milestone_type VARCHAR(50) NOT NULL, -- first_dollar, 1k_mrr, 10k_mrr, etc.
  milestone_value DECIMAL(15,2),
  achieved_at TIMESTAMP NOT NULL,
  
  is_featured BOOLEAN DEFAULT FALSE,
  celebration_posted BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stories Table (for startup narratives)
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  
  published_at TIMESTAMP,
  is_published BOOLEAN DEFAULT FALSE,
  
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7), -- Hex color
  
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Startup Members (for teams)
CREATE TABLE startup_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  role VARCHAR(50) NOT NULL, -- owner, admin, member
  joined_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_startup_user UNIQUE(startup_id, user_id)
);

-- Featured Startups (for homepage rotation)
CREATE TABLE featured_startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
  
  featured_type VARCHAR(50) NOT NULL, -- weekly_spotlight, milestone, growth_star
  featured_start DATE NOT NULL,
  featured_end DATE NOT NULL,
  
  feature_reason TEXT,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- API Keys (for public API access)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  
  scopes TEXT[] DEFAULT '{}', -- read:revenue, read:startups, etc.
  rate_limit_per_hour INTEGER DEFAULT 100,
  
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  startup_id UUID REFERENCES startups(id),
  
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_startup ON audit_logs(startup_id, created_at DESC);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  tier VARCHAR(20), -- bronze, silver, gold, platinum
  
  criteria JSONB NOT NULL, -- {"type": "revenue_milestone", "value": 1000}
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE startup_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  
  earned_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_startup_achievement UNIQUE(startup_id, achievement_id)
);
```

#### Standalone App Database Schema

```sql
-- App Settings
CREATE TABLE app_settings (
  id INTEGER PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- UI Configuration
CREATE TABLE ui_config (
  id INTEGER PRIMARY KEY,
  startup_name VARCHAR(255),
  startup_description TEXT,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#007AFF',
  secondary_color VARCHAR(7) DEFAULT '#F0F0F0',
  custom_css TEXT,
  show_revenue BOOLEAN DEFAULT 1,
  show_mrr BOOLEAN DEFAULT 1,
  show_charts BOOLEAN DEFAULT 1,
  show_milestones BOOLEAN DEFAULT 1,
  public_access BOOLEAN DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Provider Connections
CREATE TABLE connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider VARCHAR(50) NOT NULL, -- stripe, paddle, lemon_squeezy, paypal
  
  -- Encrypted credentials
  credentials TEXT NOT NULL, -- JSON encrypted credentials
  
  -- Connection metadata
  account_id VARCHAR(255),
  account_name VARCHAR(255),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Status
  is_active BOOLEAN DEFAULT 1,
  last_synced_at TIMESTAMP,
  sync_status VARCHAR(20) DEFAULT 'pending', -- pending, syncing, success, error
  sync_error TEXT,
  
  -- Settings
  sync_frequency_hours INTEGER DEFAULT 24,
  webhook_enabled BOOLEAN DEFAULT 0,
  webhook_secret VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_provider UNIQUE(provider)
);

-- Revenue Data
CREATE TABLE revenue_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  connection_id INTEGER REFERENCES connections(id) ON DELETE CASCADE,
  
  -- Revenue Data
  date DATE NOT NULL,
  total_revenue DECIMAL(15,2) NOT NULL DEFAULT 0,
  gross_revenue DECIMAL(15,2),
  net_revenue DECIMAL(15,2),
  
  -- Metrics
  transaction_count INTEGER DEFAULT 0,
  customer_count INTEGER,
  new_customers INTEGER,
  churned_customers INTEGER,
  refund_amount DECIMAL(15,2) DEFAULT 0,
  
  -- MRR/ARR if calculable
  mrr DECIMAL(15,2),
  arr DECIMAL(15,2),
  
  -- Raw data for audit
  raw_data TEXT, -- JSON of original API response
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_connection_date UNIQUE(connection_id, date)
);

CREATE INDEX idx_revenue_data_date ON revenue_data(date DESC);
CREATE INDEX idx_revenue_data_connection ON revenue_data(connection_id, date DESC);

-- Sync Logs
CREATE TABLE sync_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  connection_id INTEGER REFERENCES connections(id) ON DELETE CASCADE,
  
  sync_type VARCHAR(20) NOT NULL, -- manual, scheduled, webhook
  status VARCHAR(20) NOT NULL, -- started, completed, failed
  
  -- Sync details
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  
  -- Error handling
  error_message TEXT,
  error_details TEXT, -- JSON error details
  
  -- Timing
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  
  -- Metadata
  triggered_by VARCHAR(50), -- user, cron, webhook
  api_requests_made INTEGER DEFAULT 0
);

CREATE INDEX idx_sync_logs_connection ON sync_logs(connection_id, started_at DESC);
CREATE INDEX idx_sync_logs_status ON sync_logs(status, started_at DESC);

-- API Keys for Platform Access
CREATE TABLE api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  key_name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  
  -- Permissions
  scopes TEXT NOT NULL, -- JSON array of allowed scopes
  rate_limit_per_hour INTEGER DEFAULT 100,
  
  -- Usage tracking
  last_used_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT 1,
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_key_name UNIQUE(key_name)
);

-- Webhook Logs
CREATE TABLE webhook_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  connection_id INTEGER REFERENCES connections(id) ON DELETE CASCADE,
  
  webhook_id VARCHAR(100), -- Provider's webhook ID
  event_type VARCHAR(100) NOT NULL,
  
  -- Request details
  headers TEXT, -- JSON headers
  payload TEXT, -- JSON payload
  signature VARCHAR(500),
  
  -- Processing
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processing_status VARCHAR(20) DEFAULT 'pending', -- pending, processed, failed, ignored
  processing_error TEXT,
  
  -- Results
  records_affected INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_logs_connection ON webhook_logs(connection_id, created_at DESC);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(processing_status, created_at DESC);

-- Data Signatures (for verification)
CREATE TABLE data_signatures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  data_type VARCHAR(50) NOT NULL, -- revenue, stats, health
  data_id VARCHAR(100), -- Reference to specific data record
  data_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of the data
  signature TEXT NOT NULL, -- Ed25519/RSA signature
  
  -- Key information
  public_key TEXT NOT NULL,
  key_id VARCHAR(50) NOT NULL,
  algorithm VARCHAR(20) DEFAULT 'ed25519', -- ed25519, rsa
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- Optional signature expiration
  
  CONSTRAINT unique_data_signature UNIQUE(data_type, data_id, data_hash)
);

CREATE INDEX idx_data_signatures_type ON data_signatures(data_type, created_at DESC);
CREATE INDEX idx_data_signatures_key ON data_signatures(key_id, created_at DESC);

-- Web Sessions (for UI authentication)
CREATE TABLE web_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id VARCHAR(128) UNIQUE NOT NULL,
  
  is_admin BOOLEAN DEFAULT 0,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  
  CONSTRAINT session_expiry CHECK (expires_at > created_at)
);

CREATE INDEX idx_web_sessions_id ON web_sessions(session_id);
CREATE INDEX idx_web_sessions_expires ON web_sessions(expires_at);
```

### 4.3 Materialized Views

```sql
-- Leaderboard View (for performance)
CREATE MATERIALIZED VIEW leaderboard_30d AS
SELECT 
  s.id,
  s.slug,
  s.name,
  s.logo_url,
  s.website_url,
  COALESCE(SUM(rs.total_revenue), 0) as revenue_30d,
  AVG(rs.mrr) as avg_mrr,
  COUNT(DISTINCT rs.snapshot_date) as days_tracked
FROM startups s
LEFT JOIN revenue_snapshots rs ON s.id = rs.startup_id 
  AND rs.snapshot_date >= CURRENT_DATE - INTERVAL '30 days'
WHERE s.is_public = TRUE 
  AND s.show_revenue = TRUE
  AND s.status = 'active'
GROUP BY s.id, s.slug, s.name, s.logo_url, s.website_url
ORDER BY revenue_30d DESC;

CREATE UNIQUE INDEX idx_leaderboard_30d_id ON leaderboard_30d(id);

-- Refresh every hour via cron job
-- REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_30d;
```

---

## 5. API Specifications

### 5.1 API Architecture

**Base URL:** `https://api.openrevenue.org/v1`

**Authentication:**
- Public endpoints: No auth required
- Private endpoints: Bearer token (JWT)
- API keys: `X-API-Key` header

**Rate Limiting:**
- Public API: 100 requests/hour per IP
- Authenticated: 1,000 requests/hour per user
- API Keys: Configurable per key

### 5.2 Public API Endpoints

```typescript
// GET /startups
// Get list of verified startups
interface GetStartupsParams {
  page?: number;
  limit?: number;
  sort?: 'revenue' | 'mrr' | 'recent' | 'name';
  category?: string;
  period?: '7d' | '30d' | '90d' | 'all';
}

interface StartupListItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo_url: string;
  website_url: string;
  category: string;
  revenue_30d: number;
  mrr: number | null;
  verified: boolean;
  rank: number;
}

// GET /startups/:slug
// Get detailed startup information
interface StartupDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo_url: string;
  website_url: string;
  
  category: {
    id: string;
    name: string;
    slug: string;
  };
  
  stats: {
    revenue_7d: number;
    revenue_30d: number;
    revenue_90d: number;
    revenue_all_time: number;
    mrr: number | null;
    customer_count: number | null;
  };
  
  milestones: Milestone[];
  achievements: Achievement[];
  recent_stories: Story[];
  
  launch_date: string;
  verified_since: string;
  last_updated: string;
}

// GET /leaderboard
// Get leaderboard rankings
interface LeaderboardParams {
  period?: '7d' | '30d' | '90d' | 'all';
  category?: string;
  limit?: number;
  offset?: number;
}

// GET /stats/overview
// Platform statistics
interface PlatformStats {
  total_startups: number;
  total_verified_revenue: number;
  total_mrr: number;
  avg_revenue_per_startup: number;
  top_categories: CategoryStats[];
  recent_milestones: Milestone[];
}
```

### 5.3 Private API Endpoints

```typescript
// POST /auth/register
// Register new user
interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

// POST /auth/login
// Login user
interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

// POST /startups
// Create new startup
interface CreateStartupRequest {
  name: string;
  slug: string;
  description: string;
  website_url: string;
  category_id: string;
  launch_date?: string;
}

// PATCH /startups/:id
// Update startup details
interface UpdateStartupRequest {
  name?: string;
  description?: string;
  logo_url?: string;
  show_revenue?: boolean;
  show_mrr?: boolean;
  revenue_display_mode?: 'exact' | 'range' | 'hidden';
}

// POST /startups/:id/connections
// Add data connection (direct API or standalone app)
interface CreateConnectionRequest {
  connection_type: 'direct_api' | 'standalone_app';
  
  // For direct_api connections
  provider?: 'stripe' | 'paddle' | 'lemon_squeezy' | 'paypal';
  api_key?: string;
  additional_config?: Record<string, any>;
  
  // For standalone_app connections
  app_url?: string; // Base URL of standalone app
  app_api_key?: string; // API key for standalone app
}

// POST /startups/:id/connections/:connection_id/sync
// Trigger manual revenue sync

// POST /startups/:id/stories
// Create startup story
interface CreateStoryRequest {
  title: string;
  content: string;
  excerpt?: string;
  published: boolean;
}

// GET /dashboard/stats
// Get dashboard analytics
interface DashboardStats {
  total_views: number;
  views_trend: number; // percentage change
  current_rank: number;
  rank_change: number;
  revenue_growth: number;
  next_milestone: Milestone;
}
```

### 5.4 Webhook Endpoints

```typescript
// POST /webhooks/stripe
// Handle Stripe webhooks
// Events: charge.succeeded, charge.refunded, customer.created

// POST /webhooks/paddle
// Handle Paddle webhooks

// POST /webhooks/lemon-squeezy
// Handle Lemon Squeezy webhooks
```

### 5.6 Standalone App API Endpoints

**Base URL:** `https://your-standalone-app.com/api/v1`

**Authentication:** Bearer token (API key generated by standalone app)

```typescript
// GET /health
// Health check endpoint
interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  last_sync: string;
  connections: {
    provider: string;
    status: 'connected' | 'disconnected' | 'error';
    last_sync: string;
  }[];
}

// GET /revenue
// Get aggregated revenue data
interface RevenueParams {
  start_date?: string; // ISO date
  end_date?: string;   // ISO date
  granularity?: 'daily' | 'weekly' | 'monthly'; // Default: daily
}

interface RevenueResponse {
  data: {
    date: string;
    total_revenue: number;
    net_revenue: number;
    transaction_count: number;
    customer_count?: number;
    mrr?: number;
    arr?: number;
  }[];
  summary: {
    total_revenue: number;
    average_daily_revenue: number;
    total_transactions: number;
    date_range: {
      start: string;
      end: string;
    };
  };
  // Data verification fields
  signature: string;
  public_key: string;
  key_id: string;
  data_hash: string;
  signed_at: string;
}

// GET /stats
// Get high-level statistics
interface StatsResponse {
  total_revenue: number;
  revenue_30d: number;
  revenue_90d: number;
  current_mrr: number;
  current_arr: number;
  customer_count: number;
  growth_rate_30d: number;
  last_updated: string;
  // Data verification fields
  signature: string;
  public_key: string;
  key_id: string;
  data_hash: string;
  signed_at: string;
}

// POST /sync
// Trigger manual sync
interface SyncRequest {
  provider?: string; // Sync specific provider, or all if omitted
  force?: boolean;   // Force sync even if recently synced
}

interface SyncResponse {
  sync_id: string;
  status: 'started' | 'completed' | 'failed';
  message: string;
  providers_synced: string[];
  records_processed: number;
}

// GET /sync/status/:sync_id
// Get sync status
interface SyncStatusResponse {
  sync_id: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  error?: string;
}

// GET /verify/:signature_id
// Verify data integrity
interface VerifyResponse {
  valid: boolean;
  data_type: string;
  data_hash: string;
  signature: string;
  public_key: string;
  signed_at: string;
  expires_at?: string;
  verification_details: {
    algorithm: string;
    key_id: string;
    data_matches: boolean;
    signature_valid: boolean;
    not_expired: boolean;
  };
}

// GET /public-key
// Get public key for signature verification
interface PublicKeyResponse {
  public_key: string;
  key_id: string;
  algorithm: string;
  created_at: string;
  expires_at?: string;
}

// Web UI Endpoints (HTML responses)
// GET /            -> Public dashboard
// GET /admin       -> Admin interface (requires session)
// POST /admin/login -> Admin login
// GET /admin/logout -> Admin logout
// GET /admin/settings -> Configuration interface
// POST /admin/settings -> Update configuration
// GET /admin/connections -> Manage payment connections
// POST /admin/connections -> Add/update connections
// GET /admin/branding -> UI customization interface
// POST /admin/branding -> Update UI branding

// Public API for web UI data (used by frontend)
// GET /ui/config
interface UIConfigResponse {
  startup_name: string;
  startup_description: string;
  logo_url?: string;
  branding: {
    primary_color: string;
    secondary_color: string;
    custom_css?: string;
  };
  features: {
    show_revenue: boolean;
    show_mrr: boolean;
    show_charts: boolean;
    show_milestones: boolean;
  };
  public_access: boolean;
}

// GET /ui/revenue-chart
// Get chart data for web UI
interface UIRevenueChartResponse {
  chart_data: {
    labels: string[];
    revenue_data: number[];
    mrr_data?: number[];
  };
  timeframe: string;
  currency: string;
  last_updated: string;
}
```

### 5.5 Error Handling

```typescript
interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}

// Standard Error Codes
const ERROR_CODES = {
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  VALIDATION_ERROR: 'validation_error',
  RATE_LIMIT: 'rate_limit_exceeded',
  SERVER_ERROR: 'internal_server_error',
  PAYMENT_PROVIDER_ERROR: 'payment_provider_error',
};

// HTTP Status Codes
// 200: Success
// 201: Created
// 400: Bad Request
// 401: Unauthorized
// 403: Forbidden
// 404: Not Found
// 422: Validation Error
// 429: Rate Limit
// 500: Server Error
```

---

## 6. Payment Integration

### 6.1 Integration Options

#### Direct API Integration
| Provider | API | OAuth | Webhooks | Priority |
|----------|-----|-------|----------|----------|
| Stripe | ✅ | ✅ | ✅ | High |
| Paddle | ✅ | ❌ | ✅ | High |
| Lemon Squeezy | ✅ | ❌ | ✅ | Medium |
| PayPal | ✅ | ✅ | ✅ | Low |

#### Standalone App Integration
| Feature | Platform Support | Standalone Support | Benefits |
|---------|------------------|-------------------|----------|
| **Data Sovereignty** | ❌ | ✅ | User controls all data |
| **Custom Processing** | ❌ | ✅ | User-defined data processing |
| **Private Infrastructure** | ❌ | ✅ | No third-party data sharing |
| **API Rate Limits** | Shared | Dedicated | User's own rate limits |
| **Compliance** | Platform handles | User controls | Full compliance control |

### 6.2 Integration Architecture

```typescript
// Abstract Data Source Interface
interface DataSource {
  name: string;
  type: 'direct_api' | 'standalone_app';
  
  // Connection
  validateConnection(config: any): Promise<boolean>;
  connect(config: any): Promise<Connection>;
  disconnect(connectionId: string): Promise<void>;
  
  // Data Fetching
  fetchRevenue(connectionId: string, startDate: Date, endDate: Date): Promise<RevenueData>;
  fetchStats(connectionId: string): Promise<StatsData>;
  getHealthStatus(connectionId: string): Promise<HealthStatus>;
}

// Direct API Provider Implementation
interface PaymentProvider extends DataSource {
  type: 'direct_api';
  
  // Direct API specific methods
  fetchTransactions(connectionId: string, options: FetchOptions): Promise<Transaction[]>;
  verifyWebhook(payload: any, signature: string): boolean;
  processWebhook(event: any): Promise<void>;
}

// Standalone App Client Implementation
interface StandaloneClient extends DataSource {
  type: 'standalone_app';
  
  // Standalone app specific methods
  ping(appUrl: string): Promise<boolean>;
  getAppVersion(connectionId: string): Promise<string>;
  triggerSync(connectionId: string, options?: SyncOptions): Promise<SyncResult>;
}

// Stripe Implementation
class StripeProvider implements PaymentProvider {
  name = 'stripe';
  
  async validateCredentials(credentials: { apiKey: string }): Promise<boolean> {
    try {
      const stripe = new Stripe(credentials.apiKey);
      await stripe.accounts.retrieve();
      return true;
    } catch (error) {
      return false;
    }
  }
  
  async fetchRevenue(
    connectionId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<RevenueData> {
    const credentials = await this.getCredentials(connectionId);
    const stripe = new Stripe(credentials.apiKey);
    
    const charges = await stripe.charges.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
        lte: Math.floor(endDate.getTime() / 1000),
      },
      limit: 100,
    });
    
    const totalRevenue = charges.data
      .filter(charge => charge.status === 'succeeded')
      .reduce((sum, charge) => sum + charge.amount, 0) / 100;
    
    const refunds = charges.data
      .reduce((sum, charge) => sum + charge.amount_refunded, 0) / 100;
    
    return {
      total_revenue: totalRevenue,
      refund_amount: refunds,
      net_revenue: totalRevenue - refunds,
      transaction_count: charges.data.length,
      currency: charges.data[0]?.currency || 'usd',
    };
  }
  
  async fetchCustomerCount(connectionId: string): Promise<number> {
    const credentials = await this.getCredentials(connectionId);
    const stripe = new Stripe(credentials.apiKey);
    
    const customers = await stripe.customers.list({ limit: 1 });
    return customers.has_more ? customers.data.length : customers.data.length;
  }
  
  verifyWebhook(payload: any, signature: string): boolean {
    try {
      Stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Standalone App Client Implementation
class StandaloneAppClient implements StandaloneClient {
  name = 'standalone_app';
  type = 'standalone_app' as const;
  
  async validateConnection(config: { appUrl: string; apiKey: string }): Promise<boolean> {
    try {
      const response = await fetch(`${config.appUrl}/api/v1/health`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  async fetchRevenue(
    connectionId: string,
    startDate: Date,
    endDate: Date
  ): Promise<RevenueData> {
    const connection = await this.getConnection(connectionId);
    
    const response = await fetch(`${connection.appUrl}/api/v1/revenue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        granularity: 'daily',
      }),
    });
    
    const data = await response.json();
    
    // Verify data integrity
    const isValid = await this.verifyDataIntegrity(data);
    if (!isValid) {
      throw new Error('Data integrity verification failed');
    }
    
    return {
      total_revenue: data.summary.total_revenue,
      net_revenue: data.summary.total_revenue,
      transaction_count: data.summary.total_transactions,
      currency: 'USD',
      data_points: data.data,
      verified: true,
      signature: data.signature,
    };
  }
  
  async triggerSync(connectionId: string, options?: SyncOptions): Promise<SyncResult> {
    const connection = await this.getConnection(connectionId);
    
    const response = await fetch(`${connection.appUrl}/api/v1/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options || {}),
    });
    
    return await response.json();
  }
  
  async verifyDataIntegrity(data: any): Promise<boolean> {
    if (!data.signature || !data.public_key || !data.data_hash) {
      return false;
    }
    
    try {
      const crypto = require('crypto');
      const tweetnacl = require('tweetnacl');
      
      // Recreate data hash
      const dataWithoutSignature = { ...data };
      delete dataWithoutSignature.signature;
      delete dataWithoutSignature.public_key;
      delete dataWithoutSignature.key_id;
      delete dataWithoutSignature.data_hash;
      delete dataWithoutSignature.signed_at;
      
      const computedHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(dataWithoutSignature))
        .digest('hex');
      
      if (computedHash !== data.data_hash) {
        return false;
      }
      
      // Verify signature
      const publicKeyBytes = Buffer.from(data.public_key, 'base64');
      const signatureBytes = Buffer.from(data.signature, 'base64');
      const messageBytes = Buffer.from(data.data_hash, 'utf8');
      
      return tweetnacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  }
}
```

### 6.3 Data Sync Strategy

**Scheduled Syncs:**
```typescript
// Daily sync job for all active connections (updated for unified data sources)
async function syncAllStartups() {
  const connections = await db.query(`
    SELECT * FROM data_connections 
    WHERE is_active = TRUE 
    AND (last_synced_at IS NULL OR last_synced_at < NOW() - INTERVAL '24 hours')
  `);
  
  for (const connection of connections) {
    await queue.add('sync-revenue', {
      connectionId: connection.id,
      startupId: connection.startup_id,
      connectionType: connection.connection_type,
    });
  }
}

// Individual sync job (updated for dual integration types)
async function syncStartupRevenue(connectionId: string) {
  const connection = await getConnection(connectionId);
  
  let dataSource: DataSource;
  
  if (connection.connection_type === 'direct_api') {
    dataSource = getPaymentProvider(connection.provider);
  } else if (connection.connection_type === 'standalone_app') {
    dataSource = getStandaloneClient();
  } else {
    throw new Error(`Unsupported connection type: ${connection.connection_type}`);
  }
  
  const endDate = new Date();
  const startDate = connection.last_synced_at || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  try {
    const revenueData = await provider.fetchRevenue(connectionId, startDate, endDate);
    
    await saveRevenueSnapshot({
      startup_id: connection.startup_id,
      payment_connection_id: connectionId,
      snapshot_date: endDate,
      period_start: startDate,
      period_end: endDate,
      ...revenueData,
    });
    
    await updateConnection(connectionId, {
      last_synced_at: new Date(),
      sync_status: 'success',
    });
    
    // Check for milestones
    await checkMilestones(connection.startup_id);
    
  } catch (error) {
    await updateConnection(connectionId, {
      sync_status: 'error',
      sync_error: error.message,
    });
    
    throw error;
  }
}
```

**Real-time Updates via Webhooks:**
```typescript
// Webhook handler
async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'charge.succeeded':
      await incrementRevenue(event.data.object);
      break;
      
    case 'charge.refunded':
      await decrementRevenue(event.data.object);
      break;
      
    case 'customer.created':
      await incrementCustomerCount(event.data.object);
      break;
  }
  
  // Invalidate cache
  await invalidateLeaderboardCache();
}
```

### 6.4 Credential Storage

**Security Requirements:**
- All API keys must be encrypted at rest
- Use separate encryption key per environment
- Keys never exposed in API responses
- Audit log all access to credentials

```typescript
// Using AES-256-GCM encryption
import crypto from 'crypto';

class CredentialVault {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;
  
  constructor() {
    this.key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  }
  
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }
  
  decrypt(ciphertext: string): string {
    const [ivHex, authTagHex, encrypted] = ciphertext.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

---

## 7. Security & Privacy

### 7.1 Security Requirements

**Authentication:**
- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens with 7-day expiration
- Refresh tokens for extended sessions
- OAuth2 support (Google, GitHub)

**Authorization:**
- Role-based access control (RBAC)
- Startup-level permissions
- API key scopes

**Data Protection:**
- Encrypted API keys in database
- HTTPS only (TLS 1.3)
- CORS configuration
- Rate limiting on all endpoints
- SQL injection prevention (parameterized queries)
- XSS protection (Content Security Policy)

### 7.2 Privacy Controls

```typescript
interface PrivacySettings {
  // Revenue Display
  revenue_display_mode: 'exact' | 'range' | 'hidden';
  show_revenue: boolean;
  show_mrr: boolean;
  show_arr: boolean;
  
  // Metrics
  show_customer_count: boolean;
  show_growth_rate: boolean;
  show_refund_rate: boolean;
  
  // Profile
  show_founder_name: boolean;
  show_team_size: boolean;
  show_location: boolean;
  
  // Historical Data
  show_revenue_chart: boolean;
  chart_timeframe: '30d' | '90d' | '1y' | 'all';
}

// Revenue Range Display
function displayRevenue(amount: number, mode: string): string {
  if (mode === 'hidden') return 'Private';
  if (mode === 'exact') return `$${amount.toLocaleString()}`;
  
  // Range mode
  const ranges = [
    [0, 100],
    [100, 500],
    [500, 1000],
    [1000, 5000],
    [5000, 10000],
    [10000, 50000],
    [50000, 100000],
    [100000, Infinity],
  ];
  
  for (const [min, max] of ranges) {
    if (amount >= min && amount < max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
  }
  
  return 'Unknown';
}
```

### 7.3 Compliance

**GDPR Compliance:**
- Right to access data
- Right to deletion
- Right to portability
- Cookie consent
- Privacy policy

**Data Retention:**
- Revenue snapshots: Indefinite (aggregated)
- API keys: Until revoked
- Audit logs: 1 year
- Deleted accounts: 30 days grace period

```typescript
// GDPR Export
async function exportUserData(userId: string): Promise<UserDataExport> {
  const user = await getUser(userId);
  const startups = await getUserStartups(userId);
  const connections = await getPaymentConnections(startups);
  const stories = await getUserStories(userId);
  
  return {
    user: sanitizeUser(user),
    startups: startups.map(sanitizeStartup),
    connections: connections.map(s => ({ provider: s.provider, created: s.created_at })),
    stories: stories,
    exported_at: new Date().toISOString(),
  };
}

// GDPR Deletion
async function deleteUserData(userId: string) {
  // Mark for deletion
  await db.query(`
    UPDATE users 
    SET email = 'deleted_${userId}@deleted.com',
        name = 'Deleted User',
        status = 'deleted',
        deleted_at = NOW()
    WHERE id = $1
  `, [userId]);
  
  // Anonymize audit logs
  await db.query(`
    UPDATE audit_logs 
    SET user_id = NULL,
        ip_address = NULL,
        user_agent = 'deleted'
    WHERE user_id = $1
  `, [userId]);
  
  // Delete API keys
  await db.query(`DELETE FROM api_keys WHERE user_id = $1`, [userId]);
  
  // Note: Startup data retained for transparency, but ownership transferred
}
```

---

## 8. Frontend Components

### 8.1 Page Structure

```
/                       → Landing page + leaderboard
/startups               → Browse all startups (with filters)
/startup/[slug]         → Individual startup page
/categories/[slug]      → Category-specific leaderboard
/dashboard              → User dashboard
/dashboard/startup/[id] → Startup management
/stories                → Blog/stories feed
/story/[id]             → Individual story
/about                  → About page
/privacy                → Privacy policy
/terms                  → Terms of service
/api-docs               → API documentation
```

### 8.2 Key Components

**Leaderboard Component:**
```tsx
interface LeaderboardProps {
  period: '7d' | '30d' | '90d' | 'all';
  category?: string;
  limit?: number;
}

export function Leaderboard({ period, category, limit = 30 }: LeaderboardProps) {
  const { data, isLoading } = useLeaderboard({ period, category, limit });
  
  return (
    <div className="leaderboard">
      <LeaderboardFilters />
      <LeaderboardTable data={data} isLoading={isLoading} />
      <LeaderboardPagination />
    </div>
  );
}
```

**Startup Card Component:**
```tsx
interface StartupCardProps {
  startup: StartupListItem;
  rank?: number;
  showRevenue?: boolean;
}

export function StartupCard({ startup, rank, showRevenue = true }: StartupCardProps) {
  return (
    <div className="startup-card">
      <div className="flex items-center gap-4">
        {rank && <div className="rank">#{rank}</div>}
        <Image src={startup.logo_url} alt={startup.name} />
        <div>
          <h3>{startup.name}</h3>
          <p>{startup.description}</p>
        </div>
      </div>
      
      {showRevenue && (
        <div className="revenue-display">
          <span className="label">30d Revenue</span>
          <span className="amount">${startup.revenue_30d.toLocaleString()}</span>
          {startup.mrr && (
            <span className="mrr">MRR: ${startup.mrr.toLocaleString()}</span>
          )}
        </div>
      )}
      
      <StartupBadges startup={startup} />
    </div>
  );
}
```

**Revenue Chart Component:**
```tsx
import { Line } from 'recharts';

interface RevenueChartProps {
  data: RevenueSnapshot[];
  timeframe: '30d' | '90d' | '1y' | 'all';
}

export function RevenueChart({ data, timeframe }: RevenueChartProps) {
  const chartData = data.map(snapshot => ({
    date: snapshot.snapshot_date,
    revenue: snapshot.total_revenue,
    mrr: snapshot.mrr,
  }));
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
        {data[0]?.mrr && <Line type="monotone" dataKey="mrr" stroke="#82ca9d" />}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### 8.3 Dashboard Views

**Main Dashboard:**
- Overview stats (views, rank, revenue growth)
- Quick actions (sync now, edit profile)
- Recent milestones
- Traffic sources

**Startup Settings:**
- Basic info editor
- Privacy controls
- Payment connections manager
- Danger zone (pause listing, delete)

**Stories Editor:**
- Rich text editor
- Preview mode
- Publish/draft toggle

---

## 9. Background Jobs

### 9.1 Job Queue Architecture

Using BullMQ with Redis:

```typescript
import { Queue, Worker } from 'bullmq';

// Job Queues
const queues = {
  revenueSync: new Queue('revenue-sync'),
  milestoneCheck: new Queue('milestone-check'),
  emailNotification: new Queue('email-notification'),
  cacheRefresh: new Queue('cache-refresh'),
  analytics: new Queue('analytics'),
};

// Job Types
interface SyncRevenueJob {
  connectionId: string;
  startupId: string;
  force?: boolean;
}

interface MilestoneCheckJob {
  startupId: string;
}

interface EmailJob {
  to: string;
  template: string;
  data: any;
}
```

### 9.2 Scheduled Jobs

```typescript
// Cron Jobs (using node-cron)
import cron from 'node-cron';

// Daily revenue sync (2 AM UTC)
cron.schedule('0 2 * * *', async () => {
  await syncAllStartups();
});

// Hourly leaderboard refresh
cron.schedule('0 * * * *', async () => {
  await queues.cacheRefresh.add('refresh-leaderboard', {});
});

// Weekly featured startup rotation (Monday 12 AM)
cron.schedule('0 0 * * 1', async () => {
  await rotateFeaturedStartups();
});

// Daily milestone checks
cron.schedule('0 3 * * *', async () => {
  const startups = await getActiveStartups();
  for (const startup of startups) {
    await queues.milestoneCheck.add('check-milestones', {
      startupId: startup.id,
    });
  }
});
```

### 9.3 Job Workers

```typescript
// Revenue Sync Worker
new Worker('revenue-sync', async (job) => {
  const { connectionId, startupId } = job.data;
  
  try {
    await syncStartupRevenue(connectionId);
    
    // Trigger milestone check
    await queues.milestoneCheck.add('check-milestones', {
      startupId,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 5,
  limiter: {
    max: 100,
    duration: 60000, // 100 jobs per minute
  },
});

// Email Notification Worker
new Worker('email-notification', async (job) => {
  const { to, template, data } = job.data;
  
  await sendEmail({
    to,
    subject: getEmailSubject(template),
    html: renderEmailTemplate(template, data),
  });
  
  return { success: true };
}, {
  connection: redisConnection,
  concurrency: 10,
});
```

---

## 10. Deployment Architecture

### 10.1 Infrastructure

**Production Environment:**
```yaml
# Vercel Deployment
project: openrevenue
framework: nextjs
regions:
  - iad1  # US East
  - sfo1  # US West
  - fra1  # Europe

environment_variables:
  - DATABASE_URL
  - REDIS_URL
  - ENCRYPTION_KEY
  - STRIPE_SECRET_KEY
  - NEXTAUTH_SECRET
```

**Database Hosting:**
- Supabase (managed PostgreSQL)
- Connection pooling enabled
- Daily automated backups
- Point-in-time recovery enabled

**Redis Hosting:**
- Upstash (serverless Redis)
- Global replication
- Automatic scaling

### 10.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 10.3 Environment Configuration

```bash
# .env.example

# Database
DATABASE_URL=postgresql://user:pass@host:5432/openrevenue
DATABASE_POOL_MAX=20

# Redis
REDIS_URL=redis://default:pass@host:6379

# Authentication
NEXTAUTH_URL=https://openrevenue.org
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Encryption
ENCRYPTION_KEY=64-char-hex-string

# Payment Processors
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PADDLE_VENDOR_ID=
PADDLE_API_KEY=
PADDLE_PUBLIC_KEY=
LEMON_SQUEEZY_API_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# Email
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@openrevenue.org

# Analytics
PLAUSIBLE_DOMAIN=openrevenue.org
SENTRY_DSN=https://...

# Feature Flags
ENABLE_PADDLE=true
ENABLE_LEMON_SQUEEZY=true
ENABLE_PAYPAL=false
```

---

## 11. Performance Requirements

### 11.1 Target Metrics

| Metric | Target | Critical |
|--------|--------|----------|
| Page Load Time | < 2s | < 3s |
| Time to Interactive | < 3s | < 5s |
| API Response Time | < 200ms | < 500ms |
| Database Query Time | < 100ms | < 300ms |
| Uptime | 99.5% | 99.0% |

### 11.2 Optimization Strategies

**Caching:**
```typescript
// Multi-layer caching
const cacheStrategy = {
  // Edge cache (CDN)
  edge: {
    leaderboard: '1 hour',
    startupPage: '5 minutes',
    static: '1 day',
  },
  
  // Redis cache
  redis: {
    leaderboard: '15 minutes',
    startupStats: '5 minutes',
    userSession: '7 days',
  },
  
  // Database materialized views
  database: {
    leaderboard30d: 'refresh hourly',
    categoryStats: 'refresh daily',
  },
};

// Cache key generation
function getCacheKey(resource: string, params: any): string {
  const paramStr = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');
  
  return `${resource}:${paramStr}`;
}
```

**Database Optimization:**
- Indexed columns: slug, status, dates
- Materialized views for leaderboards
- Query result caching
- Connection pooling
- Read replicas for analytics

**API Optimization:**
- Response pagination
- Field selection (GraphQL-style)
- Compression (gzip/brotli)
- Rate limiting to prevent abuse

---

## 12. Development Phases

### 12.1 Phase 1: MVP (Weeks 1-6)

**Week 1-2: Platform Foundation**
- [ ] Monorepo setup (Next.js platform + standalone app)
- [ ] Database schema creation (both platform and standalone)
- [ ] Authentication system (NextAuth for platform, JWT for standalone)
- [ ] Basic UI components

**Week 3: Direct Integration**
- [ ] Stripe integration for platform
- [ ] Revenue sync logic
- [ ] Leaderboard view
- [ ] Startup page layout

**Week 4: Standalone App**
- [ ] Basic standalone app setup with web UI
- [ ] Stripe integration for standalone
- [ ] Local data processing and storage
- [ ] API endpoints for platform communication
- [ ] Data signing and verification system
- [ ] Web UI for revenue showcase
- [ ] Admin interface for configuration
- [ ] Docker containerization

**Week 5: Platform Integration**
- [ ] Standalone app client implementation with verification
- [ ] Unified connection management
- [ ] Dual sync logic (direct API + standalone)
- [ ] Connection health monitoring
- [ ] Data integrity verification on platform

**Week 6: Dashboard & Polish**
- [ ] User dashboard with connection options
- [ ] Startup creation flow (dual integration choice)
- [ ] Settings page
- [ ] Error handling and loading states
- [ ] Deploy platform to production
- [ ] Publish standalone Docker image

### 12.2 Phase 2: Growth (Weeks 7-10)

**Additional Features:**
- [ ] Multiple payment processors (Paddle, Lemon Squeezy, PayPal)
- [ ] Enhanced standalone app with multi-provider support
- [ ] Stories feature
- [ ] Milestone system
- [ ] Achievement badges
- [ ] Category filtering
- [ ] Advanced analytics dashboard
- [ ] Standalone app management UI

### 12.3 Phase 3: Scale (Weeks 11-16)

**Enhancements:**
- [ ] Public API
- [ ] Embeddable widgets
- [ ] Email notifications
- [ ] Community features
- [ ] Premium features
- [ ] Advanced standalone app features:
  - [ ] Multi-tenant support
  - [ ] Custom data processing rules
  - [ ] Advanced analytics
  - [ ] Webhook management UI
  - [ ] Automated backups

---

## 13. Testing Strategy

### 13.1 Testing Pyramid

```
         ┌─────────────┐
         │  E2E Tests  │  (10%)
         ├─────────────┤
         │ Integration │  (30%)
         ├─────────────┤
         │ Unit Tests  │  (60%)
         └─────────────┘
```

### 13.2 Unit Tests

```typescript
// Example: Revenue calculation tests
import { describe, it, expect } from 'vitest';
import { calculateRevenue } from './revenue';

describe('Revenue Calculator', () => {
  it('should calculate total revenue correctly', () => {
    const transactions = [
      { amount: 1000, status: 'succeeded' },
      { amount: 2000, status: 'succeeded' },
      { amount: 500, status: 'failed' },
    ];
    
    const result = calculateRevenue(transactions);
    
    expect(result.total).toBe(3000);
    expect(result.count).toBe(2);
  });
  
  it('should handle refunds correctly', () => {
    const transactions = [
      { amount: 1000, status: 'succeeded', refunded: 500 },
    ];
    
    const result = calculateRevenue(transactions);
    
    expect(result.total).toBe(1000);
    expect(result.net).toBe(500);
  });
});
```

### 13.3 Integration Tests

```typescript
// Example: API endpoint tests
import { describe, it, expect, beforeAll } from 'vitest';
import { testClient } from './test-utils';

describe('Startups API', () => {
  let authToken: string;
  
  beforeAll(async () => {
    const res = await testClient.post('/auth/login').send({
      email: 'test@example.com',
      password: 'password',
    });
    
    authToken = res.body.token;
  });
  
  it('should create a new startup', async () => {
    const res = await testClient
      .post('/startups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Startup',
        slug: 'test-startup',
        description: 'A test startup',
      });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test Startup');
  });
});
```

### 13.4 E2E Tests

```typescript
// Example: Playwright test
import { test, expect } from '@playwright/test';

test('complete onboarding flow', async ({ page }) => {
  // Navigate to homepage
  await page.goto('/');
  
  // Click "Get Verified" button
  await page.click('text=Get Verified');
  
  // Fill in signup form
  await page.fill('input[name="email"]', 'newuser@example.com');
  await page.fill('input[name="password"]', 'SecurePass123');
  await page.click('button[type="submit"]');
  
  // Should redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
  
  // Create startup
  await page.click('text=Create Startup');
  await page.fill('input[name="name"]', 'My Startup');
  await page.fill('input[name="slug"]', 'my-startup');
  await page.click('button[type="submit"]');
  
  // Connect Stripe
  await page.click('text=Connect Stripe');
  await page.fill('input[name="apiKey"]', 'sk_test_...');
  await page.click('text=Verify Connection');
  
  // Should show success message
  await expect(page.locator('text=Successfully connected')).toBeVisible();
  
  // Verify startup appears on leaderboard
  await page.goto('/');
  await expect(page.locator('text=My Startup')).toBeVisible();
});

test('revenue sync displays correctly', async ({ page }) => {
  await page.goto('/startup/my-startup');
  
  // Should display verified badge
  await expect(page.locator('[data-testid="verified-badge"]')).toBeVisible();
  
  // Should show revenue metrics
  await expect(page.locator('text=30d Revenue')).toBeVisible();
  await expect(page.locator('[data-testid="revenue-amount"]')).toContainText(');
});
```

### 13.5 Test Coverage Goals

- **Overall:** 80% coverage minimum
- **Critical paths:** 95% coverage
- **Payment integration:** 100% coverage
- **Security functions:** 100% coverage

---

## 14. Monitoring & Analytics

### 14.1 Application Monitoring

**Error Tracking (Sentry):**
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  
  beforeSend(event, hint) {
    // Don't send sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.['authorization'];
    }
    return event;
  },
  
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Random network errors
    'NetworkError',
  ],
});
```

**Performance Monitoring:**
```typescript
// Custom performance tracking
class PerformanceMonitor {
  static trackQuery(queryName: string, duration: number) {
    if (duration > 1000) {
      console.warn(`Slow query detected: ${queryName} took ${duration}ms`);
      
      Sentry.captureMessage(`Slow query: ${queryName}`, {
        level: 'warning',
        extra: { duration, queryName },
      });
    }
  }
  
  static trackAPICall(endpoint: string, duration: number, status: number) {
    // Send to analytics
    plausible('API Call', {
      props: {
        endpoint,
        duration: Math.round(duration),
        status,
      },
    });
  }
}
```

### 14.2 Business Metrics

**Key Metrics to Track:**
```typescript
interface BusinessMetrics {
  // User Metrics
  total_users: number;
  active_users_7d: number;
  active_users_30d: number;
  new_signups_today: number;
  
  // Startup Metrics
  total_startups: number;
  verified_startups: number;
  pending_verification: number;
  new_startups_today: number;
  
  // Revenue Metrics
  total_tracked_revenue: number;
  total_tracked_mrr: number;
  avg_revenue_per_startup: number;
  
  // Engagement Metrics
  daily_page_views: number;
  avg_session_duration: number;
  bounce_rate: number;
  
  // Technical Metrics
  api_requests_today: number;
  failed_syncs_today: number;
  webhook_success_rate: number;
}

// Daily metrics aggregation job
async function aggregateDailyMetrics() {
  const metrics = await calculateMetrics();
  
  await db.query(`
    INSERT INTO daily_metrics (date, metrics)
    VALUES (CURRENT_DATE, $1)
  `, [JSON.stringify(metrics)]);
  
  // Alert on anomalies
  if (metrics.failed_syncs_today > 10) {
    await sendAlert('High sync failure rate', metrics);
  }
}
```

**Analytics Dashboard:**
```typescript
// Admin dashboard queries
export async function getAdminDashboard() {
  const [
    userStats,
    startupStats,
    revenueStats,
    systemHealth,
  ] = await Promise.all([
    getUserStatistics(),
    getStartupStatistics(),
    getRevenueStatistics(),
    getSystemHealth(),
  ]);
  
  return {
    userStats,
    startupStats,
    revenueStats,
    systemHealth,
    lastUpdated: new Date(),
  };
}
```

### 14.3 Alerting System

```typescript
interface Alert {
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  metadata?: any;
}

class AlertManager {
  async sendAlert(alert: Alert) {
    // Log to console
    console.log(`[${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`);
    
    // Send to Sentry for critical alerts
    if (alert.severity === 'critical') {
      Sentry.captureMessage(alert.title, {
        level: 'error',
        extra: alert.metadata,
      });
    }
    
    // Email admin for critical alerts
    if (alert.severity === 'critical') {
      await sendEmail({
        to: process.env.ADMIN_EMAIL!,
        subject: `🚨 Critical Alert: ${alert.title}`,
        html: `
          <h2>${alert.title}</h2>
          <p>${alert.message}</p>
          <pre>${JSON.stringify(alert.metadata, null, 2)}</pre>
        `,
      });
    }
  }
}

// Alert conditions
const alertConditions = {
  highErrorRate: {
    threshold: 0.05, // 5% error rate
    window: '5m',
    severity: 'critical',
  },
  slowQueries: {
    threshold: 2000, // 2 seconds
    count: 10,
    severity: 'warning',
  },
  syncFailures: {
    threshold: 5,
    window: '1h',
    severity: 'warning',
  },
  lowDiskSpace: {
    threshold: 0.9, // 90% full
    severity: 'critical',
  },
};
```

### 14.4 Logging Strategy

```typescript
// Structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'openrevenue' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Add console in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Usage
logger.info('User signed up', {
  userId: user.id,
  email: user.email,
  timestamp: new Date(),
});

logger.error('Sync failed', {
  startupId: startup.id,
  provider: 'stripe',
  error: error.message,
  stack: error.stack,
});
```

---

## 15. Security Considerations

### 15.1 Threat Model

**Potential Threats:**

1. **API Key Theft**
   - Mitigation: Encryption at rest, secure key management
   - Detection: Audit logs, anomaly detection

2. **Revenue Data Manipulation**
   - Mitigation: Read-only API keys, server-side processing only
   - Detection: Data validation, integrity checks

3. **DDoS Attacks**
   - Mitigation: Rate limiting, CDN protection, Cloudflare
   - Detection: Traffic monitoring, automated scaling

4. **SQL Injection**
   - Mitigation: Parameterized queries, ORM usage
   - Detection: WAF rules, query monitoring

5. **XSS Attacks**
   - Mitigation: Content Security Policy, input sanitization
   - Detection: Error monitoring, CSP violation reports

### 15.2 Security Headers

```typescript
// Next.js config
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel.app",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' *.openrevenue.org",
    ].join('; '),
  },
];
```

### 15.3 Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const rateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate-limit:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
      },
    });
  },
});

// Different limits for different endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Only 10 requests for sensitive operations
});

// Apply to routes
app.use('/api/', rateLimiter);
app.use('/api/auth/register', strictLimiter);
app.use('/api/startups', strictLimiter);
```

### 15.4 Input Validation

```typescript
import { z } from 'zod';

// Validation schemas
const createStartupSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(1000).optional(),
  website_url: z.string().url().max(500),
  category_id: z.string().uuid(),
  launch_date: z.string().date().optional(),
});

const connectPaymentSchema = z.object({
  provider: z.enum(['stripe', 'paddle', 'lemon_squeezy', 'paypal']),
  api_key: z.string().min(1),
  additional_config: z.record(z.any()).optional(),
});

// Usage in API route
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = createStartupSchema.parse(body);
    
    // Process validated data
    const startup = await createStartup(validated);
    
    return Response.json(startup, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: error.errors,
        },
      }, { status: 422 });
    }
    
    throw error;
  }
}
```

---

## 16. Data Migration & Backup

### 16.1 Database Migration Strategy

```typescript
// Using Prisma Migrate or custom migration system
// migrations/001_initial_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Create tables (as defined in section 4)
-- ...

// Migration runner
class MigrationRunner {
  async run() {
    const appliedMigrations = await this.getAppliedMigrations();
    const pendingMigrations = await this.getPendingMigrations(appliedMigrations);
    
    for (const migration of pendingMigrations) {
      console.log(`Running migration: ${migration.name}`);
      
      try {
        await this.executeMigration(migration);
        await this.recordMigration(migration);
        console.log(`✓ Migration completed: ${migration.name}`);
      } catch (error) {
        console.error(`✗ Migration failed: ${migration.name}`, error);
        throw error;
      }
    }
  }
}
```

### 16.2 Backup Strategy

```bash
#!/bin/bash
# backup.sh - Daily database backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
DB_NAME="openrevenue"

# Create backup
pg_dump $DATABASE_URL \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/backup_$DATE.dump"

# Upload to S3 (or similar)
aws s3 cp "$BACKUP_DIR/backup_$DATE.dump" \
  s3://openrevenue-backups/postgres/backup_$DATE.dump

# Keep only last 30 days locally
find $BACKUP_DIR -name "backup_*.dump" -mtime +30 -delete

# Keep last 90 days in S3
aws s3 ls s3://openrevenue-backups/postgres/ \
  | awk '{print $4}' \
  | sort -r \
  | tail -n +91 \
  | xargs -I {} aws s3 rm s3://openrevenue-backups/postgres/{}

echo "Backup completed: backup_$DATE.dump"
```

**Backup Schedule:**
- **Full backup:** Daily at 3 AM UTC
- **Point-in-time recovery:** Enabled (transaction logs)
- **Retention:** 30 days local, 90 days cloud storage
- **Test restore:** Weekly automated test

### 16.3 Disaster Recovery Plan

```markdown
## Recovery Time Objective (RTO): 4 hours
## Recovery Point Objective (RPO): 24 hours

### Scenario 1: Database Corruption
1. Stop application servers
2. Restore from latest backup
3. Apply transaction logs if available
4. Verify data integrity
5. Resume service

### Scenario 2: Complete Infrastructure Loss
1. Provision new infrastructure (Terraform)
2. Restore database from S3 backup
3. Deploy application from GitHub
4. Update DNS records
5. Verify all services

### Scenario 3: Security Breach
1. Immediately isolate affected systems
2. Rotate all API keys and secrets
3. Audit access logs
4. Notify affected users
5. Implement additional security measures
```

---

## 17. API Documentation

### 17.1 OpenAPI Specification

```yaml
openapi: 3.0.0
info:
  title: OpenRevenue API
  version: 1.0.0
  description: Verified startup revenue tracking API
  contact:
    email: api@openrevenue.org

servers:
  - url: https://api.openrevenue.org/v1
    description: Production server
  - url: https://staging-api.openrevenue.org/v1
    description: Staging server

paths:
  /startups:
    get:
      summary: List all startups
      tags: [Startups]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 30
        - name: sort
          in: query
          schema:
            type: string
            enum: [revenue, mrr, recent, name]
        - name: category
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Startup'
                  meta:
                    $ref: '#/components/schemas/PaginationMeta'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    apiKey:
      type: apiKey
      in: header
      name: X-API-Key

  schemas:
    Startup:
      type: object
      properties:
        id:
          type: string
          format: uuid
        slug:
          type: string
        name:
          type: string
        description:
          type: string
        logo_url:
          type: string
          format: uri
        website_url:
          type: string
          format: uri
        revenue_30d:
          type: number
        mrr:
          type: number
          nullable: true
        verified:
          type: boolean
        rank:
          type: integer
```

### 17.2 SDK Examples

**JavaScript/TypeScript SDK:**
```typescript
// openrevenue-sdk
import { OpenRevenueClient } from 'openrevenue-sdk';

const client = new OpenRevenueClient({
  apiKey: 'your-api-key',
});

// Get leaderboard
const leaderboard = await client.startups.list({
  sort: 'revenue',
  period: '30d',
  limit: 10,
});

// Get specific startup
const startup = await client.startups.get('shopify-clone');

// Search startups
const results = await client.startups.search('SaaS productivity');
```

**Python SDK:**
```python
# openrevenue-python
from openrevenue import OpenRevenue

client = OpenRevenue(api_key='your-api-key')

# Get leaderboard
leaderboard = client.startups.list(
    sort='revenue',
    period='30d',
    limit=10
)

# Get specific startup
startup = client.startups.get('shopify-clone')
```

---

## 18. Standalone App Deployment Guide

### 18.1 Quick Start with Docker

```bash
# Pull the latest standalone app image
docker pull openrevenue/standalone:latest

# Create data directory
mkdir -p ./openrevenue-data

# Run the standalone app
docker run -d \
  --name openrevenue-standalone \
  -p 3001:3001 \
  -v ./openrevenue-data:/app/data \
  -e JWT_SECRET=your-jwt-secret-here \
  -e SYNC_INTERVAL=24 \
  openrevenue/standalone:latest
```

### 18.2 Production Deployment with Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  openrevenue-standalone:
    image: openrevenue/standalone:latest
    container_name: openrevenue-standalone
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - SYNC_INTERVAL=${SYNC_INTERVAL:-24}
      - API_PORT=3001
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: openrevenue-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - openrevenue-standalone
```

### 18.3 Environment Configuration

```bash
# .env file
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
SYNC_INTERVAL=24
API_PORT=3001

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Optional: Additional providers
PADDLE_VENDOR_ID=your_paddle_vendor_id
PADDLE_API_KEY=your_paddle_api_key
LEMON_SQUEEZY_API_KEY=your_lemon_squeezy_key

# Optional: Database (default: SQLite)
DATABASE_URL=postgresql://user:password@host:5432/openrevenue_standalone
```

### 18.4 Initial Setup Steps

1. **Deploy the standalone app**
2. **Access the web interface**: `https://your-domain.com`
3. **Complete initial setup**: Configure startup details and branding
4. **Access admin interface**: `https://your-domain.com/admin` (default: no password)
5. **Generate API keys**: Create keys for platform communication
6. **Connect payment processors**: Add your Stripe/Paddle/etc. credentials
7. **Configure web UI**: Set up public dashboard appearance
8. **Register with OpenRevenue platform**: Add your standalone app URL and API key

### 18.5 Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream openrevenue-standalone {
        server openrevenue-standalone:3001;
    }

    server {
        listen 80;
        server_name your-domain.com;
        
        # Redirect to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/ssl/certs/fullchain.pem;
        ssl_certificate_key /etc/ssl/certs/privkey.pem;

        location / {
            proxy_pass http://openrevenue-standalone;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/v1/health {
            proxy_pass http://openrevenue-standalone;
            access_log off;
        }
    }
}
```

### 18.6 Monitoring and Updates

```bash
# Check application health
curl https://your-domain.com/api/v1/health

# View logs
docker logs openrevenue-standalone

# Update to latest version
docker-compose pull
docker-compose up -d

# Backup data
docker exec openrevenue-standalone backup-data

# Restore from backup
docker exec openrevenue-standalone restore-data /app/backups/backup-date.sql
```

---

## 19. Contribution Guidelines

### 18.1 Repository Structure

```
openrevenue/
├── .github/
│   ├── workflows/        # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/   # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/              # Utilities and helpers
│   ├── providers/        # Payment provider integrations
│   ├── server/           # Server-side logic
│   └── types/            # TypeScript types
├── prisma/               # Database schema
├── public/               # Static assets
├── tests/                # Test files
├── docs/                 # Documentation
├── scripts/              # Utility scripts
├── .env.example          # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

### 18.2 Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/openrevenue.git
cd openrevenue

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

# Open http://localhost:3000
```

### 18.3 Code Style

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### 18.4 Pull Request Process

```markdown
## PR Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Tested in multiple browsers
- [ ] Screenshots for UI changes
- [ ] Breaking changes documented
```

---

## 19. Roadmap & Future Enhancements

### 19.1 Phase 1 (MVP) - Months 1-2
- ✅ Core platform with Stripe integration
- ✅ Leaderboard and startup pages
- ✅ Basic dashboard
- ✅ Authentication

### 19.2 Phase 2 (Growth) - Months 3-4
- 🎯 Multiple payment processor support
- 🎯 Stories and milestones
- 🎯 Advanced analytics
- 🎯 Public API v1

### 19.3 Phase 3 (Scale) - Months 5-6
- 📋 Embeddable widgets
- 📋 Mobile app
- 📋 Community features (forums, networking)
- 📋 Premium features

### 19.4 Future Ideas
- AI-powered insights and recommendations
- Revenue forecasting
- Peer benchmarking
- Integration marketplace
- Revenue verification for non-payment-processor revenue (manual verification)
- Geographic insights and filtering
- Industry-specific leaderboards
- Startup acquisition marketplace integration

---

## 20. Cost Estimation

### 20.1 Infrastructure Costs (Monthly)

| Service | Usage | Cost |
|---------|-------|------|
| Vercel Pro | Hosting | $20 |
| Supabase Pro | Database | $25 |
| Upstash Redis | Cache & Queue | $10 |
| Resend | Email (10k/mo) | $20 |
| Domain | .com | $1 |
| Cloudflare | CDN/Security | Free |
| Sentry | Error tracking | $26 |
| Plausible | Analytics | $9 |
| **Total** | | **~$111/month** |

### 20.2 Scaling Costs

**At 1,000 startups:**
- Database: $25/month (current plan sufficient)
- Redis: $10/month (current plan sufficient)
- Serverless functions: ~$5/month
- Total: ~$125/month

**At 10,000 startups:**
- Database: Scale to $100/month
- Redis: Scale to $30/month
- Serverless functions: ~$50/month
- Total: ~$250/month

---

## 21. Success Criteria

### 21.1 Technical KPIs
- ✅ 99.5% uptime
- ✅ < 2s average page load time
- ✅ < 500ms API response time
- ✅ < 5% error rate
- ✅ 80%+ test coverage

### 21.2 Business KPIs
- 50+ verified startups (Month 1)
- 200+ verified startups (Month 3)
- 500+ verified startups (Month 6)
- 10,000+ monthly visitors (Month 3)
- 1,000+ newsletter subscribers (Month 3)
- Product Hunt Top 5 (Launch day)

### 21.3 Community KPIs
- 50+ GitHub stars (Month 1)
- 5+ community contributors (Month 3)
- 10+ successful self-hosted deployments (Month 6)
- Active Discord/Slack community (100+ members by Month 6)

---

## 22. Appendix

### 22.1 Glossary

- **MRR**: Monthly Recurring Revenue
- **ARR**: Annual Recurring Revenue
- **RTO**: Recovery Time Objective
- **RPO**: Recovery Point Objective
- **GDPR**: General Data Protection Regulation
- **SSR**: Server-Side Rendering
- **CDN**: Content Delivery Network

### 22.2 References

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don't_Do_This)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)

### 22.3 Contact & Support

- **GitHub**: github.com/yourusername/openrevenue
- **Email**: hello@openrevenue.org
- **Discord**: discord.gg/openrevenue
- **Docs**: docs.openrevenue.org

---

**Document Version**: 1.0  
**Last Updated**: October 31, 2025  
**Next Review**: December 1, 2025