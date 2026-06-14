# Meta Tech Provider Readiness

This app is designed to run as a Meta WhatsApp Cloud API Tech Provider. Use this checklist before app review and before enabling production tenants.

## Per-Workspace Diagnostics

Open a workspace, go to WhatsApp Connections, then open Diagnostics for each connection.

The diagnostics page checks:

- access token validity and WhatsApp scopes
- phone number Graph API reachability
- WABA subscribed app status
- webhook subscription and last received event
- webhook signature enforcement with `X-Hub-Signature-256`
- mTLS operational readiness flags

## Required Meta Permissions

Production tokens must cover the operations you expose:

- `whatsapp_business_management` for WABA, phone number, templates, and subscription checks
- `whatsapp_business_messaging` for sending and receiving messages
- `business_management` when the flow needs business portfolio access

## Webhook Signature Validation

Configure one of these:

- `META_APP_SECRET`
- platform setting `whatsapp.meta_app_secret`

When configured, incoming Meta webhook POST requests must include a valid `X-Hub-Signature-256` header.

## mTLS Readiness

Meta webhook mTLS should be enforced at the public edge, not inside Laravel, when your deployment requires it. Typical enforcement points are:

- Nginx or Apache
- Cloudflare or another CDN/WAF
- AWS ALB/API Gateway, GCP Load Balancer, or equivalent

Set these flags so operators can see readiness in diagnostics:

- `WHATSAPP_WEBHOOK_MTLS_ENABLED=true`
- `WHATSAPP_WEBHOOK_MTLS_TERMINATED_BY=nginx|cloudflare|alb|...`
- `WHATSAPP_WEBHOOK_MTLS_NOTES_URL=https://internal-runbook-url`

Keep the Laravel webhook URL public and HTTPS-only. The edge should reject requests that do not present a valid Meta client certificate before traffic reaches the app.

## Graph API Versioning

Keep `META_GRAPH_API_VERSION` configurable. Meta Graph API versions are time-bound, and upgrades should be tested per tenant before changing the platform default.
