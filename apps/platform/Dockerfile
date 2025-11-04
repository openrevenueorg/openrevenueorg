# OpenRevenue Platform Dockerfile (for self-hosting)
# Production-ready Dockerfile compatible with VPS, cloud platforms, and CI/CD

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install pnpm with specific version for reproducibility
RUN npm install -g pnpm@9.15.4

# Copy package files for better layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/platform/package.json ./apps/platform/

# Install dependencies (production only where possible)
RUN pnpm install --frozen-lockfile --prod=false

# Copy Prisma schema for client generation
COPY apps/platform/prisma ./apps/platform/prisma

# Generate Prisma client (no database connection needed)
WORKDIR /app/apps/platform
RUN pnpm prisma generate

# Build the application
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.15.4

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps ./apps

# Copy source files and config
COPY packages/shared ./packages/shared
COPY apps/platform ./apps/platform
COPY turbo.json ./

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build || echo "No build script"

# Build platform
WORKDIR /app/apps/platform

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js application
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create system user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install pnpm for runtime migrations (if needed)
RUN npm install -g pnpm@9.15.4

# Copy Prisma schema, migrations, and generated client for runtime migrations
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/node_modules/@prisma ./node_modules/@prisma
# Note: Prisma CLI will be available via npx in the entrypoint script

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/.next/static ./.next/static

# Copy entrypoint script for database migrations (from source)
COPY --chown=nextjs:nodejs apps/platform/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 5100

ENV PORT=5100
ENV HOSTNAME="0.0.0.0"

# Health check for production deployments
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5100/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Use entrypoint script that handles migrations
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
