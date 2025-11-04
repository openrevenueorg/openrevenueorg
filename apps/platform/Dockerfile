# OpenRevenue Platform Dockerfile (for self-hosting)

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/platform/package.json ./apps/platform/

# Install dependencies
RUN pnpm install --frozen-lockfile
RUN pnpm prisma generate
RUN pnpm prisma db push
RUN pnpm db:seed

# Build the application
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps ./apps

# Copy source files
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

RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/platform/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/.next/static ./.next/static

USER nextjs

EXPOSE 5100

ENV PORT=5100
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
