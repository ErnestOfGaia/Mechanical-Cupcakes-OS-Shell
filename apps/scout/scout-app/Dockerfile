FROM node:20-alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package*.json ./
# ci, not install: install tolerates lock drift and silently re-resolves, so two
# builds of the same commit could differ (audit, 2026-08-04). The lockfile is
# regenerated with --workspaces=false so it is self-contained for this build.
# --legacy-peer-deps is LOAD-BEARING, not a leftover: framer-motion@10 (pinned by
# the lock, banned from use until Phase 4) peer-requires react ^18 while the app
# runs react 19 — strict resolution refuses that pair outright. Bumping framer to
# a react-19 major is a Phase 4 decision, not a build-hygiene one.
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3004
CMD ["npm", "start"]
