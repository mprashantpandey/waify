# Meta Tech Provider Upgrade - Audit, Gap Report, and Rollout Plan

## 1) Audit Current Implementation

### 1. Webhook ingestion flow
- Exists:
  - Public webhook routes in `routes/web.php` with middleware chain.
  - Controller receives GET verify + POST receive in `app/Modules/WhatsApp/Http/Controllers/WebhookController.php`.
  - Event persistence exists in `whatsapp_webhook_events` and model `app/Modules/WhatsApp/Models/WhatsAppWebhookEvent.php`.
- Partial:
  - Was doing inline heavy processing in controller; now upgraded to queue-first receive/store.
- Missing before this pass:
  - Rich raw event metadata, durable idempotency key, async-first processing, failure metrics.

### 2. Webhook verification and signature validation
- Exists:
  - Verify challenge/token logic in `WebhookController::verify`.
  - Signature validation in `app/Modules/WhatsApp/Http/Middleware/WebhookSecurity.php` with app-secret HMAC.
- Partial:
  - Signature result was not persisted per event.

### 3. Queue/retry/failure handling
- Exists:
  - Queue failed-job handling and alerts in `app/Providers/AppServiceProvider.php` + `OperationalAlertService`.
  - System health retry actions in `app/Http/Controllers/Platform/SystemHealthController.php`.
- Partial:
  - Webhook processing retry lifecycle and dead-letter semantics were not formalized.

### 4. Message sending pipeline
- Exists:
  - Send methods in `ConversationController` + `TemplateSendController`.
  - Provider client in `app/Modules/WhatsApp/Services/WhatsAppClient.php`.
  - Basic idempotency guard in conversation send endpoints.
- Partial:
  - No unified outbound pipeline entity/state machine across all send types.
  - Rate limit exists per connection in client, but not full per-tenant/per-campaign/global throttle matrix.

### 5. Template sync/status handling
- Exists:
  - `TemplateSyncService` and `TemplateManagementService`.
  - Webhook template status/category updates in `WebhookProcessor`.
- Partial:
  - Scheduled sync engine + stale detection and stronger source-of-truth separation still limited.

### 6. Billing and usage logic
- Exists:
  - Usage counters in `app/Core/Billing/UsageService.php`.
  - Meta pricing version/rates tables and resolver `MetaPricingResolver`.
  - Message billing table `whatsapp_message_billings` + webhook status billing integration.
- Partial:
  - Dedicated usage ledger model/table not yet present.
  - Invoice line item linkage to per-event usage needs strengthening.

### 7. Campaign dispatch pipeline
- Exists:
  - Campaign queue job `SendCampaignMessageJob` and service `CampaignService`.
  - Preflight checks, pause controls, retry failed recipients.
- Partial:
  - Unified send diagnostics and provider failure visibility can be deeper.

### 8. Contact opt-in / opt-out handling
- Exists:
  - Contact status includes `opt_out` and `blocked` patterns in campaigns and contacts modules.
- Missing:
  - Structured consent fields (`opted_in_at`, `do_not_contact`, source/notes/reason/channel).
  - Keyword-based inbound suppression automation and audit trail.

### 9. WhatsApp connection metadata storage
- Exists:
  - Core connection fields (`waba_id`, `phone_number_id`, `webhook_*`, throughput/quiet-hours).
- Partial:
  - More Tech Provider-specific health/account metadata still not persisted as snapshots.

### 10. Quality rating / messaging limits / account updates
- Exists:
  - Health check endpoint reads token/API status and phone details.
  - Account-level webhook events logged via `WebhookProcessor::processAccountLifecycleChange`.
- Partial/Missing:
  - No dedicated connection health snapshot model/timeline.
  - No robust trend view for quality/tier/warnings/restrictions.

### 11. Tenant-facing API webhook support
- Missing:
  - No tenant outbound webhook endpoint/subscription product yet.

### 12. Observability, logs, alerts, diagnostics
- Exists:
  - Platform system health page, operational alerts module, queue failure alerts.
  - Correlation IDs in webhook middleware.
- Partial:
  - Tenant-level webhook diagnostics were limited (improved in this pass).
  - Cross-domain troubleshooting bundle and system-wide event timeline need expansion.

---

## 2) Gap Report (Exists / Partial / Missing)

- Fully present baseline:
  - Multi-tenant auth, onboarding, embedded signup, connections, inbox, templates, campaigns, billing, support desk, admin panel, API keys/scopes.
- High-priority gaps:
  - Webhook subsystem robustness and replayability (now significantly improved in this pass).
  - Formal outbound message pipeline entity + state machine.
  - Consent compliance layer.
  - Tenant outbound webhook platform.
  - Connection health snapshots and risk analytics.
  - Usage ledger formalization and immutable pricing version binding per usage event.

---

## 3) File-by-File Implementation Plan

### Already implemented in this pass
- Modified:
  - `app/Modules/WhatsApp/Http/Controllers/WebhookController.php`
  - `app/Modules/WhatsApp/Http/Middleware/WebhookSecurity.php`
  - `app/Modules/WhatsApp/Models/WhatsAppWebhookEvent.php`
  - `app/Modules/WhatsApp/Models/WhatsAppConnection.php`
  - `app/Http/Controllers/Platform/SystemHealthController.php`
  - `app/Modules/WhatsApp/routes/web.php`
  - `resources/js/Pages/Platform/SystemHealth.tsx`
  - `resources/js/Pages/WhatsApp/Connections/Edit.tsx`
  - `config/whatsapp.php`
- New:
  - `app/Modules/WhatsApp/Jobs/ProcessWebhookEventJob.php`
  - `app/Modules/WhatsApp/Services/WebhookEventClassifier.php`
  - `app/Modules/WhatsApp/Http/Controllers/WebhookDiagnosticsController.php`
  - `resources/js/Pages/WhatsApp/Connections/WebhookDiagnostics.tsx`
  - `database/migrations/2026_03_10_200000_harden_whatsapp_webhook_events_table.php`
  - `database/migrations/2026_03_10_200100_add_webhook_processing_metrics_to_whatsapp_connections.php`
  - `tests/Feature/WhatsApp/WebhookReliabilityTest.php`

### Next planned files (Phase 3+)
- New (planned):
  - `database/migrations/*_create_outbound_message_jobs_table.php`
  - `app/Modules/WhatsApp/Models/OutboundMessageJob.php`
  - `app/Modules/WhatsApp/Services/OutboundMessagePipelineService.php`
  - `app/Modules/WhatsApp/Jobs/ProcessOutboundMessageJob.php`
- Modify (planned):
  - `app/Modules/WhatsApp/Http/Controllers/ConversationController.php`
  - `app/Modules/WhatsApp/Http/Controllers/TemplateSendController.php`
  - `app/Modules/Broadcasts/Services/CampaignService.php`
  - `resources/js/Pages/WhatsApp/Conversations/Show.tsx` (status timeline/diagnostics)

### Next planned files (Phase 4)
- New (planned):
  - `database/migrations/*_create_connection_health_snapshots_table.php`
  - `app/Modules/WhatsApp/Models/ConnectionHealthSnapshot.php`
  - `app/Modules/WhatsApp/Jobs/SyncConnectionHealthJob.php`
  - `app/Console/Commands/SyncWhatsAppConnectionHealthCommand.php`

### Next planned files (Phase 5)
- Modify/new (planned):
  - `TemplateSyncService`, `TemplateManagementService`, template controllers/pages
  - scheduled sync jobs + stale detection + richer status guardrails

### Next planned files (Phase 6)
- New/modify (planned):
  - `whatsapp_contacts` migration for consent fields
  - consent audit table + services + keyword matcher
  - contacts/campaign filters + UI badges and suppression manager

### Next planned files (Phase 7)
- New/modify (planned):
  - usage ledger table/model/service
  - billing UI/report pages and invoice integration

### Next planned files (Phase 8)
- New (planned):
  - tenant webhook endpoints/subscriptions/delivery logs tables
  - delivery dispatcher/signing service/jobs
  - tenant developer docs pages

### Next planned files (Phase 9-10)
- Expand operational alerts, diagnostics bundles, tenant alert center, risk badges, admin troubleshooting pages.

### Next planned files (Phase 11-12)
- Feature tests by subsystem + operational/docs guides under `docs/`.

---

## 4) Database Changes

### Implemented now
- `whatsapp_webhook_events` extended with:
  - `tenant_id`, `provider`, `event_type`, `object_type`, `idempotency_key`,
  - `delivery_headers`, `signature_valid`, `retry_count`, `failed_at`,
  - unique constraint on `(provider, whatsapp_connection_id, idempotency_key)`.
- `whatsapp_connections` extended with:
  - `webhook_last_processed_at`, `webhook_consecutive_failures`, `webhook_last_lag_seconds`.

### Planned next
- outbound pipeline, health snapshots, consent, usage ledger, tenant webhook tables.

---

## 5) Service / Job / Action Design

### Implemented now
- `WebhookEventClassifier`: normalizes incoming webhook event/object type.
- `ProcessWebhookEventJob`: async event processing with backoff, retries, failure accounting, alerting.
- `WebhookController` now follows ingest pattern:
  - validate → classify → persist raw event → dispatch async processor.

### Planned next
- Outbound pipeline service + processor jobs.
- Connection health sync job/actions.
- Consent event processor.
- Tenant outbound webhook delivery engine.

---

## 6) UI / Page Changes

### Implemented now
- Tenant page: `WhatsApp/Connections/WebhookDiagnostics`.
- Link from connection edit page to diagnostics.
- Platform System Health enriched with webhook retry/failure/event metadata.

### Planned next
- Message diagnostics drawer timeline and retry actions.
- Connection health risk dashboards.
- Consent/suppression manager.
- Tenant webhook config and delivery logs pages.

---

## 7) Tests Added / Planned

### Added now
- `tests/Feature/WhatsApp/WebhookReliabilityTest.php`
  - raw event storage + queued job dispatch
  - idempotency duplicate handling
  - job processing to domain entities

### Planned next
- outbound rate-limit/state transitions
- template send guards
- consent keyword blocks and campaign suppression
- usage ledger/pricing snapshot immutability
- tenant outbound webhook signing/retry
- policy/tenant isolation extensions

---

## 8) Documentation Updates

### Added now
- This document: `docs/meta-tech-provider-upgrade-audit-and-plan.md`

### Planned next docs
- queue/cron setup for webhook and sync jobs
- tenant developer webhook guide
- billing usage ledger guide
- support troubleshooting and diagnostics export guide
- deployment + rollback checklists

---

## 9) Rollout Order

1. Deploy migrations for webhook tables/metrics.
2. Deploy code with queued webhook processing.
3. Ensure `webhooks` queue worker is running.
4. Verify platform + tenant diagnostics pages.
5. Monitor operational alerts for repeated webhook failures.
6. Continue Phase 3 (outbound pipeline) behind feature flag.
7. Continue phases 4-8 subsystem by subsystem with additive migrations.
8. Run full test suite and update runbooks/docs.

