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
  echo "✅ Starting Next.js server on port ${PORT:-5100}..."
  echo "✅ Version 1.0.0.1 - 2025-11-05 ..."

  if [ -f "server.js" ]; then
    echo "Found server.js in root directory"
    echo "Checking for required modules..."
    if [ -d "node_modules/next" ]; then
      echo "✓ next module found"
    else
      echo "⚠️  WARNING: next module not found in node_modules"
      echo "Directory structure:"
      ls -la
      echo "\nnode_modules contents (first 10 items):"
      ls node_modules 2>/dev/null | head -10 || echo "node_modules not found"
    fi
    exec node server.js
  elif [ -f "apps/platform/server.js" ]; then
    echo "Found server.js in apps/platform directory"
    cd apps/platform
    echo "Checking for required modules..."
    if [ -d "../../node_modules/next" ] || [ -d "node_modules/next" ]; then
      echo "✓ next module found"
    else
      echo "⚠️  WARNING: next module not found"
    fi
    exec node server.js
  else
    echo "❌ ERROR: server.js not found in root or apps/platform/"
    echo "Current directory contents:"
    ls -la
    exit 1
  fi
}

start_jobs() {
  echo "✅ Starting background jobs via pnpm jobs:start"
  cd /app/apps/platform

  if command -v pnpm >/dev/null 2>&1; then
    exec pnpm jobs:start
  else
    echo "⚠️  pnpm not found in PATH, attempting with npx..."
    exec npx pnpm jobs:start
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


