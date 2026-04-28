# ============================================================
#  Pellito — Production Dockerfile
#  Multi-stage build: deps → builder → runner
#  Base: node:20-slim (Debian/glibc) — avoids Alpine/musl
#  issues with Prisma's native query engine binaries.
#  Target: linux/amd64 (Hostinger VPS)
# ============================================================

FROM --platform=linux/amd64 node:20-slim AS base

# ── Stage 1: install dependencies ────────────────────────────
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

# ── Stage 2: build ───────────────────────────────────────────
FROM base AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma client before Next.js build
RUN npx prisma generate

RUN npm run build

# ── Stage 3: production runner ───────────────────────────────
FROM base AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next && chown nextjs:nodejs .next

# Standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static

# Prisma schema + generated client for runtime migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma              ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma    ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma    ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma     ./node_modules/prisma

# Entrypoint: migrate then start
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./entrypoint.sh"]
