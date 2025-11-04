# Docker Deployment Guide

This guide explains how to deploy the OpenRevenue Platform using Docker.

## Quick Start

### Build the Docker Image

```bash
docker build -t openrevenue-platform:latest -f apps/platform/Dockerfile .
```

### Run the Container

```bash
docker run -d \
  --name openrevenue-platform \
  -p 5100:5100 \
  -e DATABASE_URL="postgresql://user:password@host:5432/database" \
  -e NEXTAUTH_URL="http://localhost:5100" \
  -e NEXTAUTH_SECRET="your-secret-key" \
  openrevenue-platform:latest
```

## Environment Variables

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your application URL (e.g., `https://yourdomain.com`)
- `NEXTAUTH_SECRET` - Secret key for session encryption (generate with: `openssl rand -base64 32`)

### Optional Variables

- `SKIP_MIGRATIONS` - Set to `true` to skip automatic database migrations (default: `false`)
- `RUN_SEED` - Set to `true` to run database seeding (NOT recommended for production)
- `PORT` - Application port (default: `5100`)
- `REDIS_URL` - Redis connection string for BullMQ job queue
- `ENCRYPTION_KEY` - Encryption key for API keys (32 characters)
- `STRIPE_SECRET_KEY` - Stripe API key (if using Stripe)
- `RESEND_API_KEY` - Resend API key for email notifications

## Database Migrations

The Docker container automatically runs database migrations on startup using Prisma's `migrate deploy` command. This is safe for production and ensures your database schema is up to date.

To skip migrations (e.g., if you're running them separately):

```bash
docker run -d \
  -e SKIP_MIGRATIONS=true \
  ...
```

## Deployment Platforms

### VPS / Self-Hosted

1. Build the image on your VPS or use a registry
2. Run with `docker run` or use `docker-compose.yml`
3. Set up reverse proxy (nginx/Caddy) pointing to port 5100
4. Set up SSL certificates (Let's Encrypt)

### GitHub Actions

Example workflow:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t openrevenue-platform:latest -f apps/platform/Dockerfile .
      # Add deployment steps here
```

### Docker Compose

Example `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: apps/platform/Dockerfile
    ports:
      - "5100:5100"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/openrevenue
      - NEXTAUTH_URL=http://localhost:5100
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=openrevenue
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Cloud Platforms

#### Railway

1. Connect your GitHub repository
2. Railway will auto-detect the Dockerfile
3. Set environment variables in the Railway dashboard
4. Deploy!

#### Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `docker build -t app -f apps/platform/Dockerfile .`
4. Set start command: `docker run --rm -p $PORT:5100 app`
5. Add environment variables

#### Fly.io

1. Install Fly CLI
2. Create `fly.toml` configuration
3. Run: `fly deploy`

## Health Checks

The Docker container includes a health check endpoint at `/api/health`. Docker will automatically monitor the container health.

Check health status:

```bash
docker inspect --format='{{.State.Health.Status}}' openrevenue-platform
```

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure database is accessible from the container
- Check network/firewall settings

### Migrations Failing

- Check database permissions
- Verify migrations directory exists
- Review logs: `docker logs openrevenue-platform`

### Application Not Starting

- Check logs: `docker logs openrevenue-platform`
- Verify all required environment variables are set
- Ensure port 5100 is not already in use

## Security Best Practices

1. **Never commit secrets**: Use environment variables or secrets management
2. **Use non-root user**: The container runs as `nextjs` user (UID 1001)
3. **Keep images updated**: Regularly rebuild with latest security patches
4. **Use HTTPS**: Always use HTTPS in production (reverse proxy)
5. **Database security**: Use strong passwords and limit database access

## Production Checklist

- [ ] Set all required environment variables
- [ ] Use strong `NEXTAUTH_SECRET`
- [ ] Configure proper `NEXTAUTH_URL`
- [ ] Set up reverse proxy with SSL
- [ ] Configure database backups
- [ ] Set up monitoring and logging
- [ ] Configure resource limits (CPU/memory)
- [ ] Set up auto-restart policies
- [ ] Test health check endpoint
- [ ] Verify migrations run successfully

## Support

For issues or questions, please open an issue on GitHub.

