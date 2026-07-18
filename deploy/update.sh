#!/usr/bin/env bash
# Safe-ish live update helpers for an already-deployed Zyptos/Waify box.
# Run from the app root AFTER git pull. Does not commit, push, or SSH anywhere.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f artisan ]]; then
  echo "error: run from app root (artisan not found)" >&2
  exit 1
fi

echo "==> Composer (production)"
composer install --no-dev --optimize-autoloader

echo "==> Migrate"
php artisan migrate --force

if [[ -f package.json ]]; then
  if [[ -f package-lock.json ]]; then
    echo "==> npm ci + build"
    npm ci
  else
    echo "==> npm install + build"
    npm install
  fi
  npm run build
fi

echo "==> Clear + rebuild caches"
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Signal queue workers"
php artisan queue:restart

echo
echo "Done. Restart Baileys/voice Supervisor programs if those files changed:"
echo "  supervisorctl restart ZyptosBaileysBridge:*"
echo "See deploy/UPDATE.md for checks and path notes."
