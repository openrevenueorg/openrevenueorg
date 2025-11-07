# OpenRevenue Standalone App Dockerfile

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/standalone/package.json ./packages/standalone/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages

# Copy source files
COPY packages/shared ./packages/shared
COPY packages/standalone ./packages/standalone

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build || echo "No build script"

# Build standalone app
WORKDIR /app/packages/standalone
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 openrevenue

# Create data directory
RUN mkdir -p /app/data /app/logs && chown -R openrevenue:nodejs /app/data /app/logs

# Copy built application
COPY --from=builder --chown=openrevenue:nodejs /app/packages/standalone/dist ./dist
COPY --from=builder --chown=openrevenue:nodejs /app/packages/standalone/public ./public
COPY --from=builder --chown=openrevenue:nodejs /app/packages/standalone/node_modules ./node_modules
COPY --from=builder --chown=openrevenue:nodejs /app/packages/standalone/package.json ./package.json

USER openrevenue

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/index.js"]
