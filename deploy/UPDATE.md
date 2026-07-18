# Live update (existing production)

This app is deployed as a classic Laravel + Supervisor stack (no Forge / Envoyer / Docker / GitHub Actions in-repo). Supervisor samples under `deploy/supervisor/` point at:

- App/queue (legacy shared host): `/home2/zyptosco/zyptos_app`
- Baileys bridge (VPS / BT Panel style): `/www/wwwroot/zyptos.com`

Confirm the real app path on the server before running commands. Branch historically used for the VPS cutover: `deploy/new-vps-20260614`.

## Before you start

1. **Commit + push these local fixes first.** Production cannot `git pull` what is only on your laptop.
2. Confirm `payment.razorpay_enabled` in platform settings is the intended value (`true`/`1` if you take live payments). The webhook gate now treats `"0"` / `"false"` as disabled (503).
3. Confirm `BAILEYS_BRIDGE_SECRET` matches in Laravel `.env` **and** the Baileys process (`voice-bridge/.env` and/or Supervisor `environment=`). Not a rename — same key as `config/services.php`.
4. Prefer a short maintenance window if QR sessions or billing webhooks are active.

## Must-deploy vs optional

| Area | Priority | Notes |
|------|----------|--------|
| Razorpay webhook boolean gate | **Must** | Prevents false “enabled” when setting is string `"0"` |
| Billing `UsageService` race fix | **Must** | Concurrent usage increments |
| Maintenance bypasses (webhooks/bridges/auth/platform) | **Must** | Stops maintenance from killing payments/bridges |
| WhatsApp identity + migration | **Must** | Needs `2026_07_01_140000_…` before new contact fields work |
| Baileys hydrate + LID fallback + `/api/baileys-bridge/connections` | **Must** if QR/Baileys is live | Restart bridge after deploy |
| Frontend (Connections, Chatbots, Maintenance page) | **Must** for UI | Rebuild assets or ship committed `public/build` + `bootstrap/ssr` |
| Platform settings cache-driver normalize | Nice | Admin settings save resilience |
| Onboarding coexistence `filled()` | Nice | Small correctness fix |
| Logo / favicon asset pack | Optional | Not required for runtime |

## Migration safety

`database/migrations/2026_07_01_140000_add_whatsapp_username_identity_fields.php` is **additive and idempotent**:

- Nullable columns only (`business_username`, `business_scoped_user_id`, `parent_business_scoped_user_id`, `whatsapp_username`)
- Guarded with `Schema::hasColumn` / `Schema::hasIndex`
- One non-unique index on `(account_id, business_scoped_user_id)` — online-safe on typical MySQL sizes; large `whatsapp_contacts` tables may lock briefly

No destructive column changes. No config key renames.

## Minimal update commands

On the server (adjust `$APP_DIR`):

```bash
APP_DIR=/www/wwwroot/zyptos.com   # or /home2/zyptosco/zyptos_app
cd "$APP_DIR"

git fetch origin
git checkout deploy/new-vps-20260614   # or the branch you actually pull
git pull --ff-only

composer install --no-dev --optimize-autoloader

php artisan down --retry=60   # optional but recommended
php artisan migrate --force

npm ci
npm run build                 # required if built assets are not committed/pulled

php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

php artisan queue:restart
# Restart Supervisor programs (names may differ on the box):
# supervisorctl restart zyptos-worker:* ZyptosBaileysBridge:*

php artisan up
```

Or from the app root after pull:

```bash
bash deploy/update.sh
```

## Post-update checks

- Hit a health/login page; confirm no 500s
- Razorpay: with gateway enabled, a test webhook should not 503; with disabled/`"0"`, expect 503
- WhatsApp Cloud webhooks still ingest during maintenance
- Baileys: bridge process up; QR connections rehydrate; secret mismatch → 403 on bridge API
- Queue: `php artisan queue:failed` empty (or known failures only)

## Human attention (live risks)

1. **Commit/push required** — nothing ships until the branch production pulls is updated.
2. **Supervisor path drift** — queue conf and Baileys conf in-repo use different absolute paths; edit the live Supervisor files, do not blindly overwrite from repo.
3. **Baileys restart** — new hydrate endpoint + worker changes need a bridge restart; brief QR session reconnect possible.
4. **Config cache** — always `optimize:clear` then re-cache after `.env` or config changes; new `.env.example` keys are documentation only (Pusher / bridge secrets already expected in prod).
5. **No breaking public API** for tenants; new route is bridge-authenticated `GET /api/baileys-bridge/connections` only.
