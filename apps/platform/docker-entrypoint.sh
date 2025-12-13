#!/bin/sh
set -e

# Docker entrypoint script for OpenRevenue Platform
# Handles database migrations before starting the application or background jobs

APP_MODE=${APP_MODE:-web}

echo "🚀 Starting OpenRevenue Platform (mode: ${APP_MODE})..."

if [ "$APP_MODE" = "jobs" ] && [ -z "$SKIP_MIGRATIONS" ]; then
  # Default to skipping migrations for dedicated jobs containers unless explicitly overridden
  SKIP_MIGRATIONS=true
fi

run_migrations() {
  if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  WARNING: DATABASE_URL is not set. Database operations will be skipped."
    echo "⚠️  Make sure to set DATABASE_URL environment variable for production deployments."
    return
  fi

  if [ "$SKIP_MIGRATIONS" = "true" ]; then
    echo "⏭️  Skipping migrations (SKIP_MIGRATIONS=true)"
    return
  fi

  echo "📦 Running database migrations..."
  echo "Running Prisma migrations..."

  if [ -f "./node_modules/.bin/prisma" ]; then
    ./node_modules/.bin/prisma migrate deploy || {
      echo "⚠️  Migration failed. Attempting to push schema (development fallback)..."
      ./node_modules/.bin/prisma db push --accept-data-loss || echo "⚠️  Database push also failed. Continuing..."
    }
  elif command -v prisma >/dev/null 2>&1; then
    prisma migrate deploy || {
      echo "⚠️  Migration failed. Attempting to push schema (development fallback)..."
      prisma db push --accept-data-loss || echo "⚠️  Database push also failed. Continuing..."
    }
  else
    npx prisma migrate deploy || {
      echo "⚠️  Migration failed. Attempting to push schema (development fallback)..."
      npx prisma db push --accept-data-loss || echo "⚠️  Database push also failed. Continuing..."
    }
  fi

  if [ "$RUN_SEED" = "true" ]; then
    echo "🌱 Seeding database (development only)..."
    if [ -f "./node_modules/.bin/tsx" ]; then
      ./node_modules/.bin/tsx prisma/seed.ts || echo "⚠️  Seeding failed or skipped"
    elif command -v tsx >/dev/null 2>&1; then
      tsx prisma/seed.ts || echo "⚠️  Seeding failed or skipped"
    else
      npx tsx prisma/seed.ts || echo "⚠️  Seeding failed or skipped (tsx not available)"
    fi
  fi
}

start_web() {
  echo "✅ Starting Platform (Web + Jobs) using PM2..."
  echo "✅ Version 1.0.0.1 - 2025-11-05 ..."

  if [ -f "ecosystem.config.js" ]; then
    echo "Found ecosystem.config.js"
    exec pm2-runtime start ecosystem.config.js
  elif [ -f "apps/platform/ecosystem.config.js" ]; then
    echo "Found ecosystem.config.js in apps/platform"
    cd apps/platform
    exec pm2-runtime start ecosystem.config.js
  else
    echo "⚠️  ecosystem.config.js not found, falling back to Next.js start only"
    if [ -f "server.js" ]; then
      exec node server.js
    elif [ -f "apps/platform/server.js" ]; then
      cd apps/platform
      exec node server.js
    else
      echo "❌ ERROR: server.js not found"
      exit 1
    fi
  fi
}

start_jobs() {
  echo "✅ Starting background jobs..."
  
  if [ -f "./platform-jobs.js" ]; then
    echo "Found optimized platform-jobs.js, running with node..."
    exec node platform-jobs.js
  elif [ -f "/app/platform-jobs.js" ]; then
     echo "Found optimized platform-jobs.js in /app, running with node..."
     exec node /app/platform-jobs.js
  else
    echo "⚠️  platform-jobs.js not found, falling back to pnpm/src (might fail in production)..."
    cd /app/apps/platform
    if command -v pnpm >/dev/null 2>&1; then
      exec pnpm jobs:start
    else
      exec npx pnpm jobs:start
    fi
  fi
}

run_migrations

case "$APP_MODE" in
  jobs)
    start_jobs
    ;;
  web|*)
    start_web
    ;;
esac


