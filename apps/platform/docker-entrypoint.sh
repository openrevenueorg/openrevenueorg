#!/bin/sh
set -e

# Docker entrypoint script for OpenRevenue Platform
# Handles database migrations before starting the application

echo "🚀 Starting OpenRevenue Platform..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  WARNING: DATABASE_URL is not set. Database operations will be skipped."
  echo "⚠️  Make sure to set DATABASE_URL environment variable for production deployments."
else
  echo "📦 Running database migrations..."
  
  # Run Prisma migrations (safe for production)
  # Use migrate deploy in production to avoid creating new migrations
  if [ "$SKIP_MIGRATIONS" != "true" ]; then
    echo "Running Prisma migrations..."
    
    # Try to find prisma in node_modules or use npx
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
  else
    echo "⏭️  Skipping migrations (SKIP_MIGRATIONS=true)"
  fi

  # Optional: Run database seed (only if explicitly enabled - NOT recommended for production)
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
fi

# Start the application
echo "✅ Starting Next.js server on port ${PORT:-5100}..."
exec "$@"

