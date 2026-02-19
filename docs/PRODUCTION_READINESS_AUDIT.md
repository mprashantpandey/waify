# Production Readiness Audit — Waify

This document summarizes an audit of the Waify codebase for production deployment and lists concrete improvements.

---

## 1. Security

### ✅ In good shape

- **Auth & authorization**: Login uses `LoginRequest` with configurable rate limiting (`max_login_attempts`, `lockout_duration`) and lockout events. App routes use `auth`, `account.resolve`, `account.active`, `account.subscribed`, and role-based `restrict.chat.agent`. Platform routes use `super.admin`.
- **CSRF**: Applied to web routes; `broadcasting/auth` and `webhooks/*` correctly excluded.
- **WhatsApp webhook**: `WebhookSecurity` verifies `X-Hub-Signature-256` when `META_APP_SECRET` is set, supports IP allowlist and CIDR, correlation ID, and returns generic 500 without leaking stack traces.
- **Razorpay webhook**: Signature verified with `hash_hmac('sha256', $payload, $secret)` and `hash_equals`.
- **Exception handling**: `bootstrap/app.php` returns generic JSON for production on webhooks and API, and Inertia 404/403 pages for Inertia requests. No stack traces in production.
- **Search**: Conversation search uses parameterized `where('name', 'like', '%' . $search . '%')` (Laravel binds it); no raw SQL with user input.

### ⚠️ Improve

| Area | Current | Recommendation |
|------|---------|----------------|
| **Contact form** | No rate limit on `POST /contact`. | **Done**: `throttle:5,1` added. |
| **Password reset** | Uses Laravel default. | **Done**: `throttle:3,1` on forgot-password and reset-password routes. |
| **Webhook CIDR** | `WebhookSecurity` used a simple prefix check for CIDR. | **Done**: Proper IPv4 CIDR check (ip2long + mask) in `WebhookSecurity::ipInCidr()`. |
| **.env.example** | `APP_DEBUG=true`, `LOG_LEVEL=debug`. | Add comments: “Set `APP_DEBUG=false` and `LOG_LEVEL=warning` (or `error`) in production.” |
| **Sensitive config** | Platform settings (Razorpay keys, etc.) in DB. | Ensure DB and backups are restricted; consider encrypting sensitive platform settings at rest. |

---

## 2. Rate limiting

### ✅ In good shape

- **Global**: `EnforceRateLimits` applies configurable web/api limits per IP+path; skips `up`, `webhooks/*`, static assets.
- **WhatsApp webhook**: Per-connection rate limit in `WebhookController::receive()` via `config('whatsapp.webhook.rate_limit')`.
- **Support / platform**: Support routes use `throttle:60,1` or `throttle:20,1` where appropriate.
- **Login**: Custom rate limit in `LoginRequest` with configurable attempts and lockout.

### ⚠️ Improve

| Area | Recommendation |
|------|----------------|
| **Contact form** | **Done**: `throttle:5,1` on POST /contact. |
| **Registration** | **Done**: `throttle:5,1` on POST /register; `throttle:3,1` on forgot-password and reset-password. |
| **Billing / sensitive actions** | **Done**: `throttle:10,1` on Razorpay order, switch-plan, and confirm. |

---

## 3. Database & performance

### ✅ In good shape

- **Indexes**: `whatsapp_conversations`: `(account_id, last_message_at)`, `(account_id, status)`, `(account_id, whatsapp_connection_id)`. `whatsapp_messages`: conversation + direction, account + status. `whatsapp_templates`: account + status, account + name. Conversations list ordered by `last_message_at desc`.
- **Eager loading**: Conversation index loads `contact` and `connection` with select lists; N+1 avoided for main listing.
- **Pagination**: Conversation index uses `paginate(20)`.

### ⚠️ Improve

| Area | Recommendation |
|------|----------------|
| **Assignee filter** | **Done**: Index `(account_id, assigned_to)` on `whatsapp_conversations` added. |
| **Audit events** | **Done**: Index `(whatsapp_conversation_id, created_at)` on `whatsapp_conversation_audit_events` added. |
| **Heavy queries** | For very large accounts, consider cursor-based pagination or read replicas for reporting. |

---

## 4. Error handling & logging

### ✅ In good shape

- **Logging**: Many controllers and services use `Log::` / `Log::channel('whatsapp')`. Webhook errors logged with correlation ID and truncated trace.
- **Inertia**: 404 and 403 render dedicated error pages; production exceptions don’t expose stack traces to client.
- **Queues**: Failed jobs can be inspected (e.g. system health); notifications and jobs use `ShouldQueue`.

### ⚠️ Improve

| Area | Recommendation | Status |
|------|----------------|--------|
| **500 for Inertia** | Add a dedicated Inertia “Server Error” page and render it for 500 when `X-Inertia` is present, so users see a friendly message | **Done**: `Error/ServerError.tsx`; `bootstrap/app.php` renders it for 5xx Inertia requests. |
| **Structured context** | Add request/account/user context to critical logs for debugging. | **Done**: 500 handler logs path, method, user_id, account_id, request_id/correlation_id, plus exception details. |
| **Request correlation ID** | Trace all requests with a unique ID. | **Done**: `AddRequestCorrelationId` middleware sets/forwards `X-Request-ID`; 500 handler includes it in logs. |
| **Log level** | In production use `LOG_LEVEL=warning` or `error`; avoid `debug`. | **Done**: `.env.example` documents production; comment for LOG_LEVEL. |
| **Sensitive data** | Do not persist full message bodies, tokens, or PII in logs. | Policy: keep truncating in code; no full bodies/tokens in logs. |

---

## 5. Configuration & environment

### ✅ In good shape

- **Queue**: Default `database` driver; jobs use `ShouldQueue` so moving to Redis/SQS is config-driven.
- **Cache**: Configurable; used for rate limiting and some app caches.
- **Session**: Database driver; `SESSION_LIFETIME` in `.env.example`.
- **Broadcasting**: Channels loaded in `web.php`; auth route uses `Broadcast::auth()`.

### ⚠️ Improve

| Area | Recommendation |
|------|----------------|
| **.env.example** | Document production values: `APP_ENV=production`, `APP_DEBUG=false`, `LOG_LEVEL=warning`, and any required vars for WhatsApp/Razorpay/queue. |
| **Queue worker** | Document running `php artisan queue:work` (or supervisor config) in deployment docs. |
| **Scheduler** | If cron/scheduler is used, document `* * * * * php artisan schedule:run`. |

---

## 6. Testing

### ✅ In good shape

- **Coverage**: Feature tests for auth, billing (subscription, limits, plans), WhatsApp (webhook, connection, template, realtime), support, platform access.
- **Structure**: Tests in `tests/Feature` and `tests/Unit`; `TestCase` base.

### ⚠️ Improve

| Area | Recommendation |
|------|----------------|
| **Critical paths** | Add/expand tests for: conversation assignment flow, updateMeta validation (assignable agents), webhook signature rejection, and Razorpay webhook idempotency. |
| **CI** | Run tests and PHPStan/Psalm (if added) on every PR. |
| **E2E** | Consider a few critical E2E flows (e.g. login → inbox → open conversation) for major regressions. |

---

## 7. Frontend

### ✅ In good shape

- **Error pages**: `Error/NotFound` and `Error/Forbidden` for Inertia.
- **Validation**: Forms use Inertia and server validation; errors shown via toasts or form state.
- **Realtime**: Reconnection and fallback polling (e.g. inbox stream) improve resilience.

### ⚠️ Improve

| Area | Recommendation |
|------|----------------|
| **500 page** | Add `resources/js/Pages/Error/ServerError.tsx` and render it for 500 Inertia responses so users never see a raw error. |
| **Network errors** | Centralize handling for 5xx/network failures (e.g. Inertia `onError` or axios interceptor) and show a single “Something went wrong” message. |
| **Loading / optimistic UI** | You already use loading states in places; ensure all destructive or important actions (e.g. assign, send) have clear loading/disabled state. |

---

## 8. Observability & operations

### ✅ In good shape

- **Health**: Laravel `health: '/up'`; platform has `/platform/system-health` with queue, webhook, and subscription checks.
- **Webhook**: Correlation ID and dedicated `whatsapp` log channel for debugging.
- **Cron diagnostics**: `CronDiagnosticsService` aggregates failures and health score.

### ⚠️ Improve

| Area | Recommendation |
|------|----------------|
| **Metrics** | Add simple metrics (e.g. webhook count, queue depth, failed jobs) to system health or a separate metrics endpoint for monitoring. |
| **Alerts** | Configure alerts on failed queue jobs, webhook error rate, and subscription/account issues. |
| **Backups** | Document backup strategy for DB and any file storage (e.g. logos, uploads). |

---

## 9. High‑impact quick wins

1. **Contact form throttle** — **Done**: `throttle:5,1` on POST /contact.
2. **Production .env comments** — **Done**: `.env.example` documents APP_ENV, APP_DEBUG, LOG_LEVEL for production.
3. **500 Inertia page** — **Done**: `Error/ServerError.tsx` and bootstrap/app.php 5xx handler.
4. **Assignee index** — **Done**: Migration adds index `(account_id, assigned_to)` on `whatsapp_conversations`.

---

## 10. Summary table

| Category        | Status   | Priority improvements |
|----------------|----------|------------------------|
| Security       | Good     | Contact throttle; CIDR fix; .env comments — done. |
| Rate limiting  | Good     | Contact, registration, password-reset throttle — done. |
| Database       | Good     | Assignee index — done; audit events if needed. |
| Error handling | Good     | Inertia 500 page; consistent log context. |
| Config/Env     | Good     | Document production env and queue/scheduler. |
| Testing        | Good     | More coverage on assignment and webhooks. |
| Frontend       | Good     | Server error page; centralized error handling. |
| Observability  | Good     | Metrics and alerts; backup docs. |

Overall the application is in good shape for production. Contact throttle, registration/password-reset throttle, production .env comments, Inertia 500 page, assignee index, and webhook CIDR have been addressed.
