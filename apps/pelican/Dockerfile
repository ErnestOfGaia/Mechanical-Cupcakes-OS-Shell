# ============================================================
#  Pellito — Production Dockerfile
#  Multi-stage build: deps → builder → runner
#  Target: linux/amd64 (Hostinger VPS)
# ============================================================

FROM --platform=linux/amd64 node:20-alpine AS base

# ── Stage 1: install dependencies ────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
# Using npm install instead of npm ci because the lock file was regenerated
# locally after a dependency swap. Once you run `npm install` on your machine
# and commit the updated package-lock.json, this can be changed back to npm ci.
RUN npm install --prefer-offline 2>/dev/null || npm install

# ── Stage 2: build ───────────────────────────────────────────
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma client before the Next.js build runs.
# Without this step the build fails with "Cannot find module '@prisma/client'".
RUN npx prisma generate

RUN npm run build

# ── Stage 3: production runner ───────────────────────────────
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next && chown nextjs:nodejs .next

# Standalone output from next.config.mjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static

# Copy Prisma schema and config for runtime migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma         ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
# Copy entire node_modules from builder to guarantee Prisma CLI has all its dependencies (effect, fast-check, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Entrypoint: runs migrations then starts the app
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./entrypoint.sh"]
