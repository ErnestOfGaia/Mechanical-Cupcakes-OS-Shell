#!/bin/sh
set -e

echo "▶ Pushing Prisma schema to DB..."
./node_modules/.bin/prisma db push --accept-data-loss

echo "▶ Starting Pellito app..."
exec node server.js
