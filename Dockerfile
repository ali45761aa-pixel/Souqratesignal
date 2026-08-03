# ─── AI Agent Platform - Dockerfile ──────────────────────────────────────────
# Multi-stage build for production deployment
# Compatible with: Contabo VPS, any Docker host, Railway, Render, Fly.io

FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# ─── Dependencies ─────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
RUN pnpm install --frozen-lockfile

# ─── Builder ──────────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# ─── Production ───────────────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/drizzle ./drizzle

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "dist/index.js"]
