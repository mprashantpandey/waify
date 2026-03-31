# WhatChimp Gap Audit for Zyptos

Updated: 2026-03-31

## Scope
This audit compares WhatChimp's public product surface (`https://whatchimp.com/`) against the current Zyptos codebase.

## Current strengths
Zyptos already has solid coverage in:
- WhatsApp embedded onboarding and multi-number management
- Team inbox and assignment
- Templates and broadcasts
- Chatbots / flows
- AI suggestions and AI auto-replies
- Contacts, tags, segments
- Commerce basics: products and orders
- Widgets / QR / link entry points
- Analytics
- External API keys and developer webhooks

## Gap matrix

| Feature | WhatChimp | Zyptos status | Notes |
|---|---|---:|---|
| WhatsApp API onboarding | Yes | Implemented | Embedded signup is live |
| Shared inbox | Yes | Implemented | WhatsApp-only |
| Team assignment | Yes | Implemented | Needs smarter rule engine |
| Broadcast campaigns | Yes | Implemented | Sequence/drip still missing |
| Templates | Yes | Implemented | Good coverage |
| Chatbot builder | Yes | Implemented | Strong core builder exists |
| AI chatbot / AI replies | Yes | Implemented | KB exists, needs broader automation hooks |
| Commerce catalog | Yes | Partial | Internal catalog exists, store integrations missing |
| Native forms / flows | Yes | Partial | Send-flow exists, not productized as a forms module |
| Analytics | Yes | Implemented | Strong enough for current scope |
| Public API | Yes | Implemented | API + tenant webhooks exist |
| Widgets / QR / link | Yes | Implemented | Good lead-entry support |
| Omnichannel inbox (Instagram/Facebook) | Yes | Missing | WhatsApp-only today |
| WhatsApp payments | Yes | Missing | Platform billing exists, customer payments do not |
| Appointment booking | Yes | Missing | No services/slots/reminders layer |
| Google Sheets integration | Yes | Partial | Packaged outbound event sync now exists; sheet-to-Zyptos trigger templates still missing |
| Zapier/Make/Pabbly/n8n | Yes | Missing | API exists, connectors do not |
| Shopify integration | Yes | Missing | No order/customer sync |
| WooCommerce integration | Yes | Missing | No order/customer sync |
| Abandoned cart automation | Yes | Missing | No store-triggered recovery automation |
| CTWA ads attribution | Yes | Missing | No ad-source routing/analytics |
| Custom webhook listener | Yes | Partial | Tenant-facing inbound webhook listener now exists for sequence and template triggers; richer trigger catalog still missing |
| Drip / sequence automation | Yes | Partial | Sequence foundation now exists; triggers, analytics, and richer automation still missing |
| Custom contact fields | Yes | Implemented | Tenant can manage fields, store values, and filter segments by them |
| Phone masking | Yes | Missing | No agent masking layer |
| Coexistence productization | Yes | Partial | Existing WA app onboarding exists, product surface weak |

## Build order

### Phase 1: CRM and automation foundation
1. Custom contact fields
2. Segment filters on custom fields
3. Sequence/drip engine
4. Tenant-facing inbound webhook listener

### Phase 2: Packaged integrations
5. Google Sheets integration
6. Shopify integration
7. WooCommerce integration
8. Zapier / Make / Pabbly / n8n templates or connectors

### Phase 3: Productized growth surfaces
9. Native forms module
10. CTWA attribution and routing
11. WhatsApp payment collection
12. Appointment booking

### Phase 4: Larger platform expansion
13. Omnichannel inbox (Instagram, Facebook)
14. Phone masking
15. Stronger coexistence UX

## Immediate implementation decision
Start with **custom contact fields**.

Reason:
- database foundation already exists
- unlocks CRM depth
- unlocks better segmentation
- required before serious integrations and sequence automation
- lowest-risk high-leverage gap to close first

## Definition of done for Phase 1.1 custom fields
- Tenant can create, edit, delete contact custom fields
- Contact create/edit can save custom field values
- Contact detail page renders custom fields cleanly
- Segment builder can filter by custom fields
- Covered by feature tests


## Progress updates
- 2026-03-31: Contact custom fields shipped with contact create/edit support and segment filtering.
- 2026-03-31: Sequence/drip foundation shipped with sequence builder, step scheduling, audience enrollment, and delayed step jobs.
- 2026-03-31: Tenant-facing inbound webhook listener shipped with signed public endpoints, contact upsert, sequence triggers, and template triggers.
- 2026-03-31: Google Sheets integration shipped for outbound event sync with per-account connectors, signed service-account auth, and tenant-managed event subscriptions.
- Next recommended slice: Shopify integration, starting with customer/order sync and abandoned-cart triggers.
