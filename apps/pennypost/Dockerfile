# The Penny Post — a static export served by nginx.
#
# The app has no server, no API routes, no database, no env vars and no secrets
# (see next.config.ts). This container exists only so the static folder can ride
# the shell's existing GHCR -> docker-compose -> NPM pipeline; nginx serves bytes
# and nothing else. What it copies is still a plain portable folder that can be
# handed to a client as-is.

# ---- Stage 1: build the static export ---------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

# This app has no package-lock.json — same situation as apps/postcards, which
# installs straight from package.json for the same reason.
COPY package.json ./
RUN npm install

COPY . .

# next.config.ts sets output:"export", so this writes the site to /app/out.
RUN npm run build

# ---- Stage 2: serve ----------------------------------------------------------
FROM nginx:alpine AS runner

# Custom config: frame-ancestors so the OS shell can embed this cross-origin,
# multi-page try_files (this is not an SPA), and /health per house standards.
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/out /usr/share/nginx/html

# Container-internal only. NPM proxies to mcos-pennypost:80 over the shared
# nginx-proxy network; no host port is published (ports 80/443 are NPM-only).
EXPOSE 80
