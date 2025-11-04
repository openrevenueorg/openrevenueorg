# OpenRevenue Deployment Guide

This guide covers deploying OpenRevenue to various platforms including Vercel, Coolify, VPS, and Docker.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment Options](#deployment-options)
  - [Vercel (Recommended for Platform)](#vercel-recommended-for-platform)
  - [Coolify](#coolify)
  - [Docker / VPS](#docker--vps)
  - [Railway / Render](#railway--render)
- [Database Setup](#database-setup)
- [CI/CD Pipelines](#cicd-pipelines)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js**: 20+ required
- **pnpm**: 9.15.4+ (specified in package.json)
- **PostgreSQL**: 15+ for database
- **Redis**: 7+ for caching and job queues
- **Docker**: (optional) for containerized deployments

---

## Environment Variables

### Required Variables

Create a `.env.production` file based on the example below:

```bash
# Database (Required)
DATABASE_URL=postgresql://user:password@host:5432/openrevenue

# Redis (Required)
REDIS_URL=redis://host:6379

# Authentication (Required)
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://yourdomain.com
BETTER_AUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Encryption (Required)
ENCRYPTION_KEY=<generate-with-openssl-rand-hex-64>
SIGNING_PRIVATE_KEY=<generate-with-pnpm-keys:generate>

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Payment Processors (Optional)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PADDLE_VENDOR_ID=your-paddle-vendor-id
PADDLE_API_KEY=your-paddle-api-key

# Email (Optional but recommended)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com

# Analytics (Optional)
SENTRY_DSN=https://...
PLAUSIBLE_DOMAIN=yourdomain.com
```

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET and BETTER_AUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY (64 chars hex)
openssl rand -hex 32

# Generate SIGNING_PRIVATE_KEY
pnpm --filter @openrevenueorg/platform keys:generate
```

---

## Deployment Options

### Vercel (Recommended for Platform)

**Best for**: Main platform hosting with automatic scaling and edge caching.

#### 1. Setup via Vercel Dashboard

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Import from GitHub
   - Select your OpenRevenue repository

2. **Configure Build Settings**
   ```
   Framework Preset: Next.js
   Root Directory: apps/platform
   Build Command: pnpm install && pnpm --filter @openrevenueorg/platform build
   Output Directory: .next
   Install Command: pnpm install
   ```

3. **Add Environment Variables**
   - Copy all variables from `.env.production`
   - Add them in Project Settings → Environment Variables
   - Mark sensitive values as "Secret"

4. **Deploy**
   - Click "Deploy"
   - Your app will be available at `your-project.vercel.app`
   - Configure custom domain in Settings

#### 2. Setup via Vercel CLI

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### 3. Setup Database & Redis

**Recommended Providers:**
- **Database**: [Supabase](https://supabase.com) (PostgreSQL) or [Neon](https://neon.tech)
- **Redis**: [Upstash](https://upstash.com) (serverless Redis)

**Supabase Setup:**
```bash
1. Create project at supabase.com
2. Copy connection string from Settings → Database
3. Add to Vercel: DATABASE_URL=postgresql://...
```

**Upstash Setup:**
```bash
1. Create database at console.upstash.com
2. Copy Redis URL
3. Add to Vercel: REDIS_URL=redis://...
```

#### 4. CI/CD with GitHub Actions

The repository includes automatic Vercel deployment via GitHub Actions:

**Required Secrets** (Settings → Secrets → Actions):
```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>
```

Get these from Vercel:
```bash
vercel whoami          # Get org ID
vercel link            # Link project and get IDs
```

---

### Coolify

**Best for**: Self-hosted VPS deployments with Docker.

#### 1. Setup Coolify Server

```bash
# Install Coolify on your VPS
curl -fsSL https://get.coollabs.io | bash
```

#### 2. Add OpenRevenue Application

1. **Go to Coolify Dashboard** → Applications → New Application
2. **Select Source**: GitHub repository
3. **Configure Build**:
   - Build Type: `Dockerfile`
   - Dockerfile Path: `apps/platform/Dockerfile`
   - Build Context: `.`
   - Port: `5100`

4. **Add Environment Variables**:
   - Add all variables from `.env.production`
   - Ensure `DATABASE_URL` and `REDIS_URL` are set

5. **Setup Database**:
   - Add PostgreSQL service in Coolify
   - Note the connection string
   - Update `DATABASE_URL` in app environment

6. **Setup Redis**:
   - Add Redis service in Coolify
   - Note the connection URL
   - Update `REDIS_URL` in app environment

7. **Deploy**: Click "Deploy" button

#### 3. CI/CD with GitHub Actions

The repository includes Coolify deployment workflow:

**Required Secrets**:
```bash
COOLIFY_WEBHOOK_URL=<your-coolify-webhook-url>
```

Get webhook URL from Coolify:
1. Go to Application → Settings → Webhooks
2. Copy the webhook URL
3. Add to GitHub Secrets

**Alternative: SSH Deployment**

If webhook isn't available:
```bash
# Required GitHub Secrets:
SSH_HOST=your-server.com
SSH_USER=root
SSH_PRIVATE_KEY=<your-ssh-private-key>
DEPLOY_PATH=/app/openrevenue
APP_URL=https://your-domain.com
```

---

### Docker / VPS

**Best for**: Full control, custom VPS, or hybrid cloud deployments.

#### 1. Clone Repository on VPS

```bash
# SSH into your VPS
ssh user@your-server.com

# Clone repository
git clone https://github.com/yourusername/openrevenueorg.git
cd openrevenueorg
```

#### 2. Setup Environment

```bash
# Copy and edit environment file
cp apps/platform/.env.example .env.production
nano .env.production  # Edit with your values
```

#### 3. Deploy with Docker Compose (Production)

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f platform

# Stop services
docker-compose -f docker-compose.prod.yml down
```

#### 4. Setup Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/openrevenue
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and SSL:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/openrevenue /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Certbot
sudo certbot --nginx -d yourdomain.com
```

#### 5. Setup Managed Database & Redis

**Instead of running PostgreSQL/Redis in Docker**, use managed services:

**Supabase (PostgreSQL):**
```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Upstash (Redis):**
```bash
REDIS_URL=rediss://default:[PASSWORD]@[ENDPOINT].upstash.io:6379
```

Update `.env.production` and restart:
```bash
docker-compose -f docker-compose.prod.yml up -d --force-recreate platform
```

---

### Railway / Render

#### Railway

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and Initialize**:
   ```bash
   railway login
   railway init
   ```

3. **Add Services**:
   - Add PostgreSQL: `railway add`
   - Add Redis: `railway add`

4. **Deploy**:
   ```bash
   railway up
   ```

5. **Configure Build**:
   - Root Directory: `apps/platform`
   - Build Command: `pnpm install && pnpm --filter @openrevenueorg/platform build`
   - Start Command: `pnpm --filter @openrevenueorg/platform start`

#### Render

1. **Create Web Service** from GitHub
2. **Configure**:
   ```
   Build Command: pnpm install && pnpm --filter @openrevenueorg/platform build
   Start Command: pnpm --filter @openrevenueorg/platform start
   ```
3. **Add Environment Variables** in Dashboard
4. **Add PostgreSQL** and **Redis** from Dashboard

---

## Database Setup

### Run Migrations

**After first deployment:**

```bash
# Using Prisma CLI (local or in container)
pnpm --filter @openrevenueorg/platform db:push

# Or using Docker
docker exec -it openrevenue-platform-prod npx prisma migrate deploy
```

### Seed Database (Optional)

```bash
# Development only
pnpm --filter @openrevenueorg/platform db:seed

# Or using Docker
docker exec -it openrevenue-platform-prod npx tsx prisma/seed.ts
```

---

## CI/CD Pipelines

The repository includes comprehensive GitHub Actions workflows:

### Available Workflows

1. **`ci-cd.yml`** - Main CI/CD pipeline
   - Runs on: Push to main/develop, Pull Requests
   - Jobs: Lint, Test, Build, Docker, Deploy

2. **`docker-publish.yml`** - Docker image publishing
   - Runs on: Push to main, Tags, Releases
   - Publishes to: GitHub Container Registry (GHCR)

3. **`coolify-deploy.yml`** - Coolify deployment
   - Runs on: Push to main/production
   - Deploys via: Webhook or SSH

4. **`pr-checks.yml`** - Pull Request validation
   - Runs on: Pull Requests
   - Checks: Quality, Security, Tests, Build

5. **`vercel-preview.yml`** - Preview deployments
   - Runs on: Pull Requests
   - Creates: Vercel preview deployment

### Required GitHub Secrets

#### For Vercel Deployment:
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

#### For Coolify Deployment:
```
COOLIFY_WEBHOOK_URL
# Or for SSH:
SSH_HOST
SSH_USER
SSH_PRIVATE_KEY
DEPLOY_PATH
APP_URL
```

#### For Docker Registry (Optional):
```
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

### Setup Secrets

```bash
# Go to GitHub Repository
# Settings → Secrets and variables → Actions → New repository secret
```

---

## Troubleshooting

### Build Errors

**Issue**: `Module not found` or build fails

**Solution**:
```bash
# Clear cache and rebuild
pnpm clean
pnpm install
pnpm build
```

### Database Connection Issues

**Issue**: `Can't reach database server`

**Solution**:
1. Check `DATABASE_URL` format: `postgresql://user:pass@host:5432/dbname`
2. Ensure database is accessible from your deployment platform
3. Check firewall rules
4. For Vercel: Use connection pooling (Prisma Accelerate or Supabase pooler)

### Redis Connection Issues

**Issue**: `ECONNREFUSED` or Redis timeout

**Solution**:
1. Check `REDIS_URL` format: `redis://host:6379` or `rediss://host:6379` (SSL)
2. For Upstash: Use the `UPSTASH_REDIS_REST_URL` for REST API
3. Check Redis password if required

### Docker Build Fails

**Issue**: Dockerfile build errors

**Solution**:
```bash
# Build with verbose output
docker build -f apps/platform/Dockerfile . --progress=plain

# Check for specific errors:
# - Missing files: Ensure .dockerignore isn't excluding needed files
# - Out of memory: Increase Docker memory limit
# - Prisma errors: Ensure DATABASE_URL is set (even fake for build)
```

### Health Check Failures

**Issue**: Health check endpoint returns 502/503

**Solution**:
1. Check application logs: `docker logs openrevenue-platform-prod`
2. Verify environment variables are set correctly
3. Ensure database migrations ran successfully
4. Check if Redis is accessible

### Migration Issues

**Issue**: Prisma migration fails in production

**Solution**:
```bash
# Use db push for development/testing
pnpm db:push

# Use migrate deploy for production (safer)
pnpm prisma migrate deploy

# If migration is stuck, reset (CAUTION: data loss)
pnpm prisma migrate reset
```

### Port Already in Use

**Issue**: `EADDRINUSE` - port already in use

**Solution**:
```bash
# Find process using port
lsof -i :5100  # or netstat -tulpn | grep 5100

# Kill process
kill -9 <PID>

# Or use different port
export PORT=5101
```

---

## Performance Optimization

### 1. Enable Caching

Update Vercel or Nginx config:
```nginx
# Cache static assets
location /_next/static {
    expires 365d;
    add_header Cache-Control "public, immutable";
}

# Cache images
location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 2. Database Connection Pooling

Use Prisma Accelerate or PgBouncer:
```bash
DATABASE_URL=postgresql://user:pass@pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 3. Redis Configuration

For production Redis, enable persistence:
```bash
# docker-compose.prod.yml
redis:
  command: redis-server --appendonly yes
```

---

## Security Checklist

- [ ] All secrets are set as environment variables (not hardcoded)
- [ ] `NEXTAUTH_SECRET` and `BETTER_AUTH_SECRET` are randomly generated
- [ ] Database uses SSL/TLS connection
- [ ] Redis requires authentication
- [ ] Firewall rules limit access to database/redis
- [ ] HTTPS/SSL enabled on production domain
- [ ] Regular backups of database
- [ ] Rate limiting enabled
- [ ] Security headers configured (already in `next.config.js`)
- [ ] Monitoring and logging enabled (Sentry)

---

## Support

- **Documentation**: [README.md](./README.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/openrevenueorg/issues)
- **Discord**: [Join our community](#)

---

## License

MIT License - See [LICENSE](./LICENSE) for details.
