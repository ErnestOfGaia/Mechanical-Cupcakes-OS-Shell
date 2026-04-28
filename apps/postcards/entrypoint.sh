#!/bin/sh
set -e

echo "Syncing database schema..."
node node_modules/prisma/build/index.js db push --skip-generate

echo "Seeding users..."
node scripts/seed.js

echo "Starting Love Mailbox..."
exec node server.js
