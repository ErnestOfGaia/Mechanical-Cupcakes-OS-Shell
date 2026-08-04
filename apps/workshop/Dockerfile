# Campaign Workshop — build from the REPO ROOT as context:
#   docker build -f apps/workshop/Dockerfile -t mcos-workshop .
#
# The app installs its own dependencies rather than relying on the workspace root,
# which keeps the image standalone per the MCOS invariant that a sub-app must work
# on its own subdomain with no dependency on the shell.

FROM node:22-alpine AS builder
WORKDIR /app
COPY apps/workshop/package.json ./package.json
RUN npm install --ignore-scripts --no-audit --no-fund
COPY apps/workshop/ ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3005 \
    HOSTNAME=0.0.0.0

# `output: "standalone"` emits a self-contained server plus a trimmed node_modules.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Run unprivileged — the node image ships a `node` user.
USER node

EXPOSE 3005

# No ports are published to the host in compose: NPM proxies by container hostname
# on the shared nginx-proxy network, and 80/443 are NPM's alone.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3005/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
