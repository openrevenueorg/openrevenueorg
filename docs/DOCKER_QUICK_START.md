# Docker Quick Start Guide

This guide will help you deploy OpenRevenue using Docker in under 10 minutes.

## Prerequisites

- Docker and Docker Compose installed
- A server/VPS with at least 2GB RAM
- Domain name (optional, can use IP address for testing)

## Quick Deploy (Development)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/openrevenueorg.git
cd openrevenueorg

# 2. Start all services (PostgreSQL, Redis, Platform, Standalone)
docker-compose up -d

# 3. Check logs
docker-compose logs -f platform

# 4. Access the application
# Platform: http://localhost:5100
# Standalone: http://localhost:3001
```

That's it! The development environment is ready.

## Production Deployment

### Step 1: Setup Environment Variables

```bash
# Copy the production environment template
cp .env.production.example .env.production

# Generate secrets
./scripts/generate-secrets.sh

# Edit .env.production with your values
nano .env.production
```

**Required variables:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `REDIS_URL` - Your Redis connection string
- `NEXTAUTH_SECRET` - Generated secret
- `BETTER_AUTH_SECRET` - Generated secret
- `ENCRYPTION_KEY` - Generated encryption key
- `SIGNING_PRIVATE_KEY` - Generated signing key
- Domain URLs (NEXTAUTH_URL, BETTER_AUTH_URL, NEXT_PUBLIC_APP_URL)

### Step 2: Configure External Services

#### Option A: Use Managed Services (Recommended)

**Database (Supabase):**
```bash
1. Go to https://supabase.com
2. Create new project
3. Get connection string from Settings → Database
4. Add to .env.production:
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Redis (Upstash):**
```bash
1. Go to https://console.upstash.com
2. Create Redis database
3. Get connection URL
4. Add to .env.production:
   REDIS_URL=rediss://default:[PASSWORD]@[ENDPOINT].upstash.io:6379
```

#### Option B: Use Docker Services

Uncomment PostgreSQL and Redis in `docker-compose.prod.yml`:

```yaml
# Uncomment these services in docker-compose.prod.yml
postgres:
  image: postgres:15-alpine
  # ... rest of config

redis:
  image: redis:7-alpine
  # ... rest of config
```

Update `.env.production`:
```bash
DATABASE_URL=postgresql://openrevenue:YOUR_PASSWORD@postgres:5432/openrevenue
REDIS_URL=redis://redis:6379
```

### Step 3: Deploy

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f platform

# Run database migrations
docker exec -it openrevenue-platform-prod npx prisma migrate deploy
```

### Step 4: Setup Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo apt update && sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/openrevenue
```

Add this configuration:

```nginx
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

Enable and test:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/openrevenue /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Step 5: Verify Deployment

```bash
# Check health endpoint
curl https://yourdomain.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

---

## Docker Commands Reference

### Basic Operations

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart services
docker-compose -f docker-compose.prod.yml restart

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.prod.yml logs -f platform
```

### Database Operations

```bash
# Run migrations
docker exec -it openrevenue-platform-prod npx prisma migrate deploy

# Open Prisma Studio (database GUI)
docker exec -it openrevenue-platform-prod npx prisma studio

# Backup database
docker exec -it openrevenue-postgres-prod pg_dump -U openrevenue openrevenue > backup.sql

# Restore database
docker exec -i openrevenue-postgres-prod psql -U openrevenue openrevenue < backup.sql
```

### Monitoring

```bash
# Check container health
docker ps

# View resource usage
docker stats

# Check specific container
docker inspect openrevenue-platform-prod

# Check container logs
docker logs openrevenue-platform-prod --tail 100 -f
```

### Updating

```bash
# Pull latest changes
git pull origin main

# Rebuild images
docker-compose -f docker-compose.prod.yml build --no-cache

# Restart with new images
docker-compose -f docker-compose.prod.yml up -d --force-recreate

# Clean up old images
docker image prune -f
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs openrevenue-platform-prod

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port already in use
```

### Database Connection Error

```bash
# Test database connection
docker exec -it openrevenue-platform-prod npx prisma db pull

# Check if database is reachable
docker exec -it openrevenue-platform-prod pg_isready -h postgres -U openrevenue
```

### Redis Connection Error

```bash
# Test Redis connection
docker exec -it openrevenue-platform-prod redis-cli -h redis ping

# Expected: PONG
```

### High Memory Usage

```bash
# Check memory usage
docker stats openrevenue-platform-prod

# Add resource limits to docker-compose.prod.yml (already included)
deploy:
  resources:
    limits:
      memory: 2G
```

### Permission Denied

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Rebuild container
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

---

## Performance Optimization

### 1. Enable Build Cache

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose -f docker-compose.prod.yml build
```

### 2. Multi-stage Build Caching

```bash
# Build with cache
docker build \
  --cache-from ghcr.io/yourusername/openrevenueorg/platform:latest \
  -f apps/platform/Dockerfile \
  -t openrevenue-platform .
```

### 3. Resource Limits

Already configured in `docker-compose.prod.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

---

## Security Best Practices

### 1. Use Docker Secrets (Advanced)

```bash
# Create secrets
echo "your-secret" | docker secret create nextauth_secret -

# Use in docker-compose.yml
services:
  platform:
    secrets:
      - nextauth_secret
```

### 2. Run as Non-Root User

Already configured in Dockerfile:
```dockerfile
USER nextjs  # Non-root user
```

### 3. Regular Updates

```bash
# Update base images
docker pull node:20-alpine
docker pull postgres:15-alpine
docker pull redis:7-alpine

# Rebuild
docker-compose -f docker-compose.prod.yml build --no-cache
```

### 4. Network Isolation

```bash
# Services are isolated in Docker network
networks:
  openrevenue:
    driver: bridge
```

---

## Production Checklist

- [ ] Environment variables configured in `.env.production`
- [ ] Database backups automated
- [ ] SSL/TLS certificate installed (Certbot)
- [ ] Firewall configured (UFW or similar)
- [ ] Monitoring enabled (health checks, logs)
- [ ] Resource limits configured
- [ ] Secrets properly secured
- [ ] Domain DNS configured
- [ ] Email service configured (Resend)
- [ ] Analytics configured (optional)
- [ ] Error tracking configured (Sentry, optional)

---

## Next Steps

- **Setup CI/CD**: See [DEPLOYMENT.md](./DEPLOYMENT.md#cicd-pipelines)
- **Configure OAuth**: Setup Google/GitHub OAuth providers
- **Enable Features**: Configure payment processors
- **Monitor**: Setup Sentry for error tracking
- **Scale**: Add more containers with Docker Swarm or Kubernetes

---

## Support

- **Full Documentation**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/openrevenueorg/issues)
- **Docker Docs**: [docs.docker.com](https://docs.docker.com)
