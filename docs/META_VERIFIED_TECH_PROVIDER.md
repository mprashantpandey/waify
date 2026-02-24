# Meta Verified Tech Provider – Configuration Guide

This document describes how to configure Waify for **Meta Verified Tech Provider** status when using the WhatsApp Business Platform (Cloud API).

---

## 1. Meta program overview

As a **Tech Provider** you can onboard businesses to the WhatsApp Business Platform. After **Business Verification**, **App Review**, and **Access Verification** you can onboard customers (e.g. via Embedded Signup). Meta’s requirements include:

- Valid App ID and App Secret
- Webhook URL with **HTTPS** and a valid SSL certificate
- **Webhook signature verification** (X-Hub-Signature-256) using the App Secret
- Compliance with Meta’s terms (WhatsApp Business Policy, Cloud API hosting terms, etc.)

---

## 2. Environment configuration

### Required variables

| Variable | Description |
|----------|-------------|
| `META_APP_ID` | Your Meta App ID (from Meta for Developers). |
| `META_APP_SECRET` | Your Meta App Secret. **Required** when `META_VERIFIED_TECH_PROVIDER=true` or in production (signature verification). Never commit this. |

### Verified Tech Provider mode

| Variable | Description |
|----------|-------------|
| `META_VERIFIED_TECH_PROVIDER` | Set to `true` when you operate as a Meta Verified Tech Provider. When `true`, every webhook POST **must** be verified with `X-Hub-Signature-256`; if `META_APP_SECRET` is missing or the signature is invalid, requests are rejected with 401. When `false`, signature is verified only if `META_APP_SECRET` is set. **Default:** in production (`APP_ENV=production`) this is treated as `true` unless overridden. |

### Optional / Embedded Signup

| Variable | Description |
|----------|-------------|
| `META_GRAPH_BASE_URL` | Default `https://graph.facebook.com`. |
| `META_GRAPH_API_VERSION` | Default `v21.0`. Use a [supported version](https://developers.facebook.com/docs/graph-api/guides/versioning). |
| `META_SYSTEM_USER_TOKEN` | System user token for app-level API calls (e.g. Embedded Signup). |
| `META_EMBEDDED_SIGNUP_CONFIG_ID` | Embedded Signup configuration ID from Meta. |
| `META_EMBEDDED_SIGNUP_ENABLED` | Set to enable Embedded Signup in the app. |

### Webhook security (optional)

| Variable | Description |
|----------|-------------|
| `WHATSAPP_WEBHOOK_ALLOWED_IPS` | Comma-separated IPs or CIDRs (e.g. `1.2.3.4,10.0.0.0/8`). **Meta does not publish a static IP list** for Cloud API webhooks; IPs are dynamic (AS32934). Prefer **signature verification** as the main control; use this only if you have a specific allowlist. |
| `WHATSAPP_WEBHOOK_RATE_LIMIT` | Max webhook requests per connection per time window (default 100). |
| `WHATSAPP_WEBHOOK_RATE_LIMIT_DECAY` | Time window in minutes (default 1). |

---

## 3. What the application does

- **Webhook GET (verify):** Responds to `hub.mode=subscribe` with the `hub.challenge` value when `hub.verify_token` matches the connection’s stored verify token. Required for Meta to subscribe to your webhook URL.
- **Webhook POST (receive):**  
  - If `META_APP_SECRET` is set (or verified mode is on), validates `X-Hub-Signature-256` with HMAC-SHA256 using the raw body and App Secret; rejects with 401 if missing or invalid.  
  - If `WHATSAPP_WEBHOOK_ALLOWED_IPS` is set, allows only those IPs/CIDRs.  
  - Returns 200 for successful processing; returns 200 with `success: false` for processing errors so Meta does not retry indefinitely; 4xx/5xx only for auth or bad request.
- **Correlation ID:** Every webhook request gets a correlation ID for logging and support.
- **Rate limiting:** Per-connection limit to protect your backend.

---

## 4. Checklist for Meta Verified Tech Provider

- [ ] **Business Verification** completed in Meta Business Suite.
- [ ] **App Review** passed (e.g. `whatsapp_business_management` if required for your use case).
- [ ] **App ID and App Secret** set in production; `META_APP_SECRET` never logged or exposed.
- [ ] **Webhook URL** is HTTPS with a valid certificate (no self-signed for production).
- [ ] **Verify token** set per connection and used in Meta’s webhook subscription (GET verify).
- [ ] **Signature verification** in use: set `META_VERIFIED_TECH_PROVIDER=true` in production (or rely on the default when `APP_ENV=production`) and ensure `META_APP_SECRET` is set.
- [ ] **API version** (`META_GRAPH_API_VERSION`) is a [supported Graph API version](https://developers.facebook.com/docs/graph-api/guides/versioning).
- [ ] **Terms & policies:** You comply with Meta’s WhatsApp Business Policy, Cloud API terms, and Tech Provider terms.
- [ ] **Embedded Signup (if used):** `META_EMBEDDED_SIGNUP_CONFIG_ID` and related config set; flows tested.

---

## 5. Webhook URL format

Your webhook URL is:

```text
https://<your-domain>/webhooks/whatsapp/<connection_slug_or_id>
```

- **GET** is used by Meta for subscription verification (challenge response).
- **POST** is used for incoming payloads (messages, status updates, etc.). Signature verification applies to POST.

---

## 6. References

- [Get started for Tech Providers](https://developers.facebook.com/docs/whatsapp/solution-providers/get-started-for-tech-providers)
- [Set up webhooks (WhatsApp Cloud API)](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/)
- [Embedded Signup](https://developers.facebook.com/docs/whatsapp/embedded-signup/)
- [Graph API versioning](https://developers.facebook.com/docs/graph-api/guides/versioning)
