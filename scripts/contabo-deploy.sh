#!/usr/bin/env bash
# Deploy / update the Nest API on Contabo after contabo-setup.sh + code is ready.
# Run from the app directory as the deploy user:
#   bash scripts/contabo-deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-$(pwd)}"
cd "$APP_DIR"

if [[ ! -f .env ]]; then
  echo "Missing .env — run scripts/contabo-setup.sh first"
  exit 1
fi

echo "==> Installing dependencies"
npm ci

echo "==> Applying Prisma migrations"
npx prisma migrate deploy

echo "==> Building"
npm run build

echo "==> Restarting PM2"
if pm2 describe lazer-api >/dev/null 2>&1; then
  pm2 restart lazer-api
else
  pm2 start dist/src/main.js --name lazer-api
fi
pm2 save

echo "Deploy complete."
