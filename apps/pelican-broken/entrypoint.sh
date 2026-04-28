#!/bin/sh
set -e

echo "▶ Running Prisma migrations..."
npx prisma migrate deploy

echo "▶ Starting Pellito app..."
exec node server.js
