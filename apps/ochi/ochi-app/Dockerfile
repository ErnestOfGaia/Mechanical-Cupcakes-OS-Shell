# ─── Build stage ───────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Tells next.config.ts this build has no monorepo above it — the tracing root
# becomes the app dir, so the standalone output lands flat at .next/standalone
# instead of nested by the repo path.
ENV NEXT_DOCKER_BUILD=1

# npm ci, not npm install: install tolerates a lockfile that has drifted from
# package.json and silently re-resolves from the registry, so two builds of the
# same commit could differ (audit finding, 2026-08-04 — the lockfile HAD drifted:
# it pinned next 15.3.0 against package.json's 16.2.4 and omitted six
# devDependencies). ci fails loudly on drift instead. Lockfile regenerated with
# --workspaces=false so it is self-contained for exactly this standalone build.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# ─── Runtime stage ─────────────────────────────────────────────────────────────
# Carries server.js + traced production node_modules + static assets. No source
# tree, no devDependencies (typescript, vitest, jsdom, @testing-library/*), no
# __tests__ — and it does not run as root: `node` is the unprivileged user that
# ships with the base image.
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# server.js reads PORT/HOSTNAME. 3003 matches the compose mapping and the
# wget healthcheck; 0.0.0.0 so the container is reachable from the network.
ENV PORT=3003
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node
EXPOSE 3003
CMD ["node", "server.js"]
