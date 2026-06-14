# Waify UI Replacement Checklist

Source: `UI/LARAVEL_REACT_IMPLEMENTATION_PROMPT.md`

## Foundation

| Existing surface | Prototype reference | Status |
| --- | --- | --- |
| `tailwind.config.js` | `UI/index.html` | Implemented: `waify` tokens, dark mode, shadows, radii, animations |
| `resources/css/app.css` | `UI/index.html` | Partial: app surfaces, tables, inputs, scrollbar helpers ported |
| `resources/js/Components/UI/*` | `UI/src/common.jsx` | Partial: primary primitives exist in Waify theme; legacy wrappers still exist for old imports |
| `resources/js/Layouts/PublicLayout.tsx` | `UI/src/marketing-landing.jsx`, `UI/src/marketing-pages.jsx` | Implemented/partial: shared marketing shell and theme are in use |
| `resources/js/Layouts/GuestLayout.tsx` | `UI/src/auth-pages.jsx`, `UI/src/public-shared.jsx` | Implemented/partial: split auth theme is in use |
| `resources/js/Layouts/AppShell.tsx` | `UI/src/app.jsx`, `UI/src/sidebar.jsx`, `UI/src/header.jsx` | Updated: prototype grouped sidebar, responsive collapse padding, topbar search/workspace/user menu |
| `resources/js/Layouts/PlatformShell.tsx` | `UI/src/admin-pages.jsx` | Updated: reuses the same app sidebar/topbar shell for platform admin routes |

## Public And Auth

| Existing file | Prototype reference | Status |
| --- | --- | --- |
| `resources/js/Pages/Landing.tsx` | `UI/src/marketing-landing.jsx` | Implemented/partial |
| `resources/js/Pages/Public/About.tsx` | `UI/src/marketing-pages.jsx` | Partial |
| `resources/js/Pages/Public/Contact.tsx` | `UI/src/marketing-pages.jsx` | Partial |
| `resources/js/Pages/Public/FAQs.tsx` | `UI/src/marketing-pages.jsx` | Partial |
| `resources/js/Pages/Public/Help.tsx` | `UI/src/marketing-pages.jsx`, `UI/src/help.jsx` | Partial |
| `resources/js/Pages/Public/Pricing.tsx` | `UI/src/marketing-pages.jsx` | Partial |
| `resources/js/Pages/Public/Privacy.tsx` | `UI/src/marketing-pages.jsx` | Partial |
| `resources/js/Pages/Public/Terms.tsx` | `UI/src/marketing-pages.jsx` | Partial |
| `resources/js/Pages/Auth/Login.tsx` | `UI/src/auth-pages.jsx` | Implemented/partial |
| `resources/js/Pages/Auth/Register.tsx` | `UI/src/auth-pages.jsx` | Implemented/partial |
| `resources/js/Pages/Auth/ForgotPassword.tsx` | `UI/src/auth-pages.jsx` | Implemented/partial |
| `resources/js/Pages/Auth/ResetPassword.tsx` | `UI/src/auth-pages.jsx` | Implemented/partial |
| `resources/js/Pages/Auth/VerifyEmail.tsx` | `UI/src/auth-pages.jsx` | Implemented/partial |

## App Routes

| Existing route/page | Prototype reference | Status |
| --- | --- | --- |
| `app.dashboard` / `resources/js/Pages/App/Dashboard.tsx` | `UI/src/dashboard.jsx` | Implemented/partial |
| `app.whatsapp.conversations.index` / `resources/js/Pages/WhatsApp/Conversations/Index.tsx` | `UI/src/inbox.jsx` | Partial: keep realtime wiring |
| `app.whatsapp.templates.index` / `resources/js/Pages/WhatsApp/Templates/Index.tsx` | `UI/src/templates.jsx` | Partial |
| `app.broadcasts.index` / `resources/js/Pages/Broadcasts/Index.tsx` | `UI/src/campaigns.jsx` | Partial |
| `app.broadcasts.show` / `resources/js/Pages/Broadcasts/Show.tsx` | `UI/src/detail-pages.jsx` | Partial |
| `app.contacts.index` / `resources/js/Pages/Contacts/Index.tsx` | `UI/src/contacts.jsx` | Partial |
| `app.contacts.segments.index` / `resources/js/Pages/Contacts/Segments/Index.tsx` | `UI/src/segments.jsx` | Partial |
| `app.chatbots.index` / `resources/js/Pages/Chatbots/Index.tsx` | `UI/src/automation.jsx` | Partial |
| `app.analytics.index` / `resources/js/Pages/Analytics/Index.tsx` | `UI/src/analytics.jsx` | Partial |
| `app.whatsapp.connections.index` / `resources/js/Pages/WhatsApp/Connections/Index.tsx` | `UI/src/connections.jsx` | Partial |
| `app.billing.index` / `resources/js/Pages/Billing/Index.tsx` | `UI/src/billing.jsx` | Partial |
| `app.workspaces.index` / `resources/js/Pages/App/Workspaces/Index.tsx` | `UI/src/workspace.jsx` | Partial |
| `app.support.hub` / `resources/js/Pages/Support/Hub.tsx` | `UI/src/support.jsx`, `UI/src/help.jsx` | Partial |
| `app.settings` / `resources/js/Pages/Settings/Index.tsx` | `UI/src/settings.jsx` | Partial |

## Remaining Gaps

- Finish page-by-page visual parity for all module detail/create/edit pages.
- Replace or remove legacy Breeze-style primitives still present for older imports.
- Smoke test mobile and dark mode across modal-heavy pages.
