# WACP - WhatsApp Cloud Platform

Modern SaaS platform to connect Meta WhatsApp Cloud API, manage templates, run chatbots/AI, automate messages, team inbox, floaters/widgets, analytics, billing, webhooks, and modular add-ons.

## Requirements

- PHP 8.2+
- Composer
- Node.js 18+ and npm
- MySQL (or SQLite for local development)

## Setup Instructions

### 1. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node dependencies
npm install
```

### 2. Environment Configuration

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Generate application key:

```bash
php artisan key:generate
```

Update your `.env` file with database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=wacp
DB_USERNAME=root
DB_PASSWORD=
```

For SQLite (local development):

```env
DB_CONNECTION=sqlite
# DB_DATABASE= will use database/database.sqlite
```

### 3. Database Setup

Run migrations and seeders:

```bash
php artisan migrate
php artisan db:seed
php artisan db:seed --class=SuperAdminSeeder
```

This will:
- Create all necessary tables (users, tenants, modules, etc.)
- Seed core modules into the database
- Create the super admin user (if env variables are set)

### 4. Build Assets

```bash
# Development
npm run dev

# Production
npm run build
```

### 5. Start Development Server

```bash
# Start Laravel server
php artisan serve

# In another terminal, start Vite (if not using npm run dev)
npm run dev
```

Visit `http://localhost:8000` in your browser.

### 6. Configure Real-time (Pusher)

For real-time features (inbox updates, message status, etc.), configure Pusher in your `.env`:

```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=your_cluster
```

1. Sign up at [Pusher Channels](https://pusher.com/channels)
2. Create a new app
3. Copy your credentials to `.env`
4. The frontend will automatically connect using these credentials

**Note:** If Pusher is not configured, the app will fall back to lightweight polling for updates.

### 7. Configure Queue Worker

For background processing (webhook processing, bot execution, delayed actions), run a queue worker:

```bash
php artisan queue:work
```

For production, use a process manager like Supervisor:

```ini
[program:waify-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/waify/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/waify/storage/logs/queue.log
stopwaitsecs=3600
```

### 8. Configure Webhooks

#### WhatsApp Webhook Setup

1. **Get your webhook URL:**
   - Create a WhatsApp connection in the app
   - Copy the webhook URL from the connection settings
   - Format: `https://yourdomain.com/webhooks/whatsapp/{connection_id}`

2. **Configure in Meta Business Manager:**
   - Go to Meta Business Manager → WhatsApp → Configuration
   - Paste your webhook URL
   - Enter the verify token (shown in connection settings)
   - Subscribe to `messages` field

3. **Webhook Security (Optional but Recommended):**
   
   Add IP allowlist in `.env`:
   ```env
   WHATSAPP_WEBHOOK_ALLOWED_IPS=31.13.64.0/18,31.13.65.0/18
   ```
   
   Configure rate limits:
   ```env
   WHATSAPP_WEBHOOK_RATE_LIMIT=100
   WHATSAPP_WEBHOOK_RATE_LIMIT_DECAY=1
   ```

   **Note:** Meta's IP ranges may change. Check their documentation for current ranges.

4. **Verify Webhook:**
   - Meta will send a GET request to verify the webhook
   - The system automatically handles verification
   - Check connection status in the app

### 9. Configure Cron (Optional)

For scheduled tasks (if any), add to your crontab:

```bash
* * * * * cd /path/to/waify && php artisan schedule:run >> /dev/null 2>&1
```

Currently, the app doesn't require cron jobs, but this is ready for future scheduled tasks.

## Login Flow

1. **Register** a new account at `/register`
2. After registration, you'll be redirected to **onboarding** to create your first tenant
3. Once tenant is created, you'll be redirected to the **dashboard** at `/app/dashboard`
4. You can switch tenants using the tenant switcher in the topbar

## Project Structure

```
app/
├── Core/
│   ├── Modules/          # Module system core
│   │   ├── ModuleRegistry.php
│   │   └── ModuleServiceProvider.php
│   └── Tenant/        # Tenant-related services
├── Http/
│   ├── Controllers/      # Application controllers
│   └── Middleware/       # Custom middleware
├── Models/               # Eloquent models
└── Modules/              # Feature modules
    ├── Core/
    ├── WhatsApp/
    ├── Templates/
    ├── Inbox/
    ├── Chatbots/
    ├── AI/
    ├── Floaters/
    ├── Analytics/
    └── Billing/

resources/
└── js/
    ├── Components/       # React components
    │   ├── UI/          # Reusable UI components
    │   └── Layout/      # Layout components
    ├── Layouts/         # Page layouts
    └── Pages/           # Inertia pages
```

## Adding a New Module

To add a new module, follow these 3 steps:

### Step 1: Create Module Directory

Create a new directory in `app/Modules/YourModule/`:

```bash
mkdir -p app/Modules/YourModule/routes
```

### Step 2: Create Module Definition

Create `app/Modules/YourModule/module.php`:

```php
<?php

return [
    'key' => 'your.module.key',
    'name' => 'Your Module',
    'description' => 'Module description',
    'enabled_by_default' => false,
    'is_core' => false,
    'icon' => 'IconName', // Lucide icon name
    'nav' => [
        [
            'label' => 'Your Module',
            'href' => 'app.yourmodule',
            'icon' => 'IconName',
            'group' => 'your-group', // core, messaging, automation, ai, growth, billing
        ],
    ],
];
```

### Step 3: Create Routes and Controller

Create `app/Modules/YourModule/routes/web.php`:

```php
<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'tenant.resolve'])
    ->prefix('/app')
    ->name('app.')
    ->group(function () {
        Route::get('/yourmodule', [YourModuleController::class, 'index'])
            ->name('yourmodule');
    });
```

Create a controller and Inertia page, and the module will automatically appear in the navigation when enabled!

## Module System

The module system allows you to:

- **Enable/Disable** modules per tenant
- **Dynamic Navigation** - Navigation items are built from enabled modules
- **Route Loading** - Module routes are automatically loaded
- **Tenant-Aware** - Each tenant can have different modules enabled

## Platform Owner (Super Admin)

The platform has a **Super Admin** role for managing the entire SaaS platform.

### Creating a Super Admin

**Option 1: Using Seeder (Recommended)**

Add to your `.env` file:

```env
SUPER_ADMIN_EMAIL=admin@wacp.local
SUPER_ADMIN_PASSWORD=your-secure-password
SUPER_ADMIN_NAME=Platform Admin
```

Then run:

```bash
php artisan db:seed --class=SuperAdminSeeder
```

**Option 2: Via Tinker**

```bash
php artisan tinker
>>> $user = User::where('email', 'your@email.com')->first();
>>> $user->update(['is_platform_admin' => true]);
```

**Option 3: Direct Database**

```sql
UPDATE users SET is_platform_admin = true WHERE email = 'your@email.com';
```

### Platform Panel

Super admins can access the platform panel at `/platform`:

- **Dashboard** - Platform overview and statistics
- **Tenants** - Manage all tenants (view, disable/enable)
- **Users** - Manage all users (view, make/remove super admin)
- **Settings** - View platform configuration status

### Tenant Status Management

Tenants can have three statuses:
- **active** - Normal operation (default)
- **suspended** - Temporarily suspended
- **disabled** - Permanently disabled

When a tenant is disabled:
- Regular users cannot access `/app` routes
- Super admins can still access disabled tenants
- A friendly "Tenant Disabled" page is shown to regular users

### Access Control

- **Super Admin** (`is_platform_admin = true`):
  - Can access `/platform/*` routes
  - Can access all tenants (even disabled ones)
  - Can disable/enable tenants
  - Can manage user super admin status

- **Tenant Owner**:
  - Owns a specific tenant
  - Can manage tenant settings, members, modules
  - Scoped to their tenant only

- **Tenant Admin/Member**:
  - Can view/send messages (admin can also manage connections)
  - Scoped to their tenant only

## Tenant System

- Users can belong to **multiple tenants**
- Each tenant has an **owner** and **members** with roles (owner/admin/member)
- Tenant switching is handled via the topbar
- Current tenant is stored in session
- Tenants can be disabled by super admins

## Dark Mode

Dark mode is supported and persists using localStorage. Toggle it using the moon/sun icon in the topbar.

## Code Quality

### PHP

```bash
# Format PHP code
./vendor/bin/pint
```

### JavaScript/TypeScript

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Testing

```bash
# Run PHPUnit tests
php artisan test
```

## Key Features (Phase 1)

✅ **Module System** - Fully functional module registry and loader  
✅ **Tenant System** - Multi-tenant support with switching  
✅ **Authentication** - Laravel Breeze with Inertia + React  
✅ **Modern UI** - Tailwind CSS with dark mode support  
✅ **Dynamic Navigation** - Module-based navigation system  
✅ **Placeholder Pages** - All modules have placeholder pages with empty states  

## Phase 2: WhatsApp Cloud API (✅ Complete)

Phase 2 implements the core WhatsApp Cloud API integration module.

### Features

✅ **Connection Management**
- Create and manage WhatsApp Cloud API connections per tenant
- Encrypted access token storage
- Webhook URL generation and verification token management
- Connection status tracking

✅ **Webhook Integration**
- Webhook verification endpoint (GET)
- Webhook receive endpoint (POST)
- Idempotent message processing (prevents duplicates)
- Automatic contact and conversation creation

✅ **Message Handling**
- Receive inbound messages from WhatsApp
- Send outbound text messages
- Message status tracking (sent, delivered, read, failed)
- Conversation threading

✅ **UI Pages**
- Connections list, create, and edit pages
- Conversations list with pagination
- Thread view with message composer
- Copy-to-clipboard for webhook URLs and tokens
- Dark mode support

### Database Tables

- `whatsapp_connections` - Connection credentials and settings
- `whatsapp_contacts` - WhatsApp user contacts
- `whatsapp_conversations` - Conversation threads
- `whatsapp_messages` - Inbound and outbound messages

### Security

- Access tokens encrypted using Laravel Crypt
- Tenant-scoped data isolation
- Role-based authorization (owners/admins can manage connections)
- Rate-limited webhook endpoints
- Secure webhook verification

### Testing

Run WhatsApp module tests:

```bash
php artisan test --filter WhatsApp
```

### Usage

1. **Create a Connection**
   - Navigate to WhatsApp → Connections
   - Click "Add Connection"
   - Enter Phone Number ID and Access Token from Meta Business Manager
   - Copy the Webhook URL and Verify Token

2. **Configure Webhook in Meta**
   - Go to Meta Business Manager → WhatsApp → Configuration → Webhook
   - Paste the Webhook URL
   - Enter the Verify Token
   - Subscribe to message events

3. **View Conversations**
   - Navigate to WhatsApp → Conversations
   - Click on a conversation to view the thread
   - Send messages directly from the thread view

### API Endpoints

**App Routes** (requires auth + tenant):
- `GET /app/whatsapp/connections` - List connections
- `GET /app/whatsapp/connections/create` - Create form
- `POST /app/whatsapp/connections` - Store connection
- `GET /app/whatsapp/connections/{id}/edit` - Edit form
- `PUT /app/whatsapp/connections/{id}` - Update connection
- `POST /app/whatsapp/connections/{id}/rotate-verify-token` - Rotate token
- `GET /app/whatsapp/conversations` - List conversations
- `GET /app/whatsapp/conversations/{id}` - View thread
- `POST /app/whatsapp/conversations/{id}/send` - Send message

**Webhook Routes** (public, no auth):
- `GET /webhooks/whatsapp/{connection}` - Verify webhook
- `POST /webhooks/whatsapp/{connection}` - Receive webhook

## Phase 3: Template Management (✅ Complete)

Phase 3 implements comprehensive WhatsApp template management.

### Features

✅ **Template Sync from Meta**
- Sync templates from WhatsApp Business Account
- Idempotent sync (safe to re-run)
- Automatic extraction of body text, headers, footers, buttons
- Status tracking (approved, pending, rejected, etc.)

✅ **Template Library**
- Searchable template list
- Filters: connection, status, category, language
- Template details with preview
- Copy template name to clipboard

✅ **Template Sending**
- Send template messages with variable substitution
- Choose recipient from conversations, contacts, or manual entry
- Live preview with variables filled
- Creates outbound message and template send records

✅ **Template Preview**
- Header, body, footer, and buttons display
- Variable count and requirements
- Meta error messages displayed
- Quality score tracking

### Database Tables

- `whatsapp_templates` - Template library per tenant
- `whatsapp_template_versions` - Template edit history (for future use)
- `whatsapp_template_sends` - Analytics and troubleshooting for template sends

### Usage

1. **Sync Templates**
   - Navigate to WhatsApp → Templates
   - Click "Sync from Meta"
   - Select a connection with WABA ID configured
   - Templates will be imported and updated

2. **View Templates**
   - Browse templates with filters and search
   - Click on a template to see full details and preview
   - View status, variables, and Meta errors

3. **Send Template**
   - Click "Send" on any template
   - Choose recipient (conversation, contact, or manual)
   - Fill in required variables
   - Preview the message
   - Send and track status

### API Endpoints

**Template Routes:**
- `GET /app/whatsapp/templates` - List templates (with filters)
- `GET /app/whatsapp/templates/{id}` - View template details
- `POST /app/whatsapp/templates/sync` - Sync from Meta
- `GET /app/whatsapp/templates/{id}/send` - Send form
- `POST /app/whatsapp/templates/{id}/send` - Send template message

### Requirements

- WABA ID must be configured in connection settings
- Connection must have proper Meta API permissions for reading templates
- Templates must be approved in Meta before they can be sent

### Testing

Run template tests:

```bash
php artisan test --filter Template
```

## Phase 4: Realtime Team Inbox (✅ Complete)

Phase 4 implements real-time updates for the WhatsApp inbox using Pusher Channels.

### Features

✅ **Realtime Updates**
- Instant message notifications (inbound/outbound)
- Real-time message status updates (sent/delivered/read)
- Live conversation updates (status, assignment, tags)
- Tenant-scoped private channels
- Automatic fallback to polling when WebSocket disconnected

✅ **Broadcast Events**
- `MessageCreated` - New messages appear instantly
- `MessageUpdated` - Status changes update in real-time
- `ConversationUpdated` - Conversation metadata updates
- `InternalNoteAdded` - Notes appear instantly (scaffold)
- `AuditEventAdded` - Audit events appear instantly (scaffold)

✅ **Channel Authorization**
- Tenant membership required for all channels
- Conversation channels verify conversation belongs to tenant
- Secure private channel authentication

✅ **Fallback Polling**
- Lightweight stream endpoints when WebSocket unavailable
- Inbox list polls every 30s when disconnected
- Conversation thread polls every 15s when disconnected
- Automatic switch back to realtime when reconnected

### Realtime Setup (Pusher)

#### 1. Environment Configuration

Add Pusher credentials to your `.env` file:

```env
BROADCAST_CONNECTION=pusher

PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_APP_CLUSTER=mt1
PUSHER_SCHEME=https
```

For local development with Pusher CLI:

```env
PUSHER_HOST=localhost
PUSHER_PORT=6001
PUSHER_SCHEME=http
```

#### 2. Get Pusher Credentials

1. Sign up at [pusher.com](https://pusher.com)
2. Create a new Channels app
3. Copy App ID, Key, Secret, and Cluster from the dashboard
4. Add them to your `.env` file

#### 3. Local Development with Pusher CLI

For local development, you can use Pusher CLI:

```bash
# Install Pusher CLI
npm install -g @pusher/cli

# Start local Pusher server
pusher channels server
```

Then use `PUSHER_HOST=localhost` and `PUSHER_PORT=6001` in your `.env`.

#### 4. Verify Connection

1. Open browser console on any app page
2. Check for `[Echo] Connected to Pusher` message
3. Verify `window.Echo` is available
4. Check network tab for WebSocket connection to Pusher

#### 5. Troubleshooting

**403 on `/broadcasting/auth`**
- Ensure user is authenticated
- Check CSRF token is included
- Verify tenant membership

**Connection fails**
- Check `PUSHER_APP_KEY` matches Pusher dashboard
- Verify `PUSHER_APP_CLUSTER` is correct
- For local dev, ensure Pusher CLI is running
- Check browser console for connection errors

**Mixed HTTP/HTTPS issues**
- Use `PUSHER_SCHEME=https` in production
- Use `PUSHER_SCHEME=http` only for local dev
- Ensure `PUSHER_SCHEME` matches your app URL scheme

**Private channels require auth**
- All tenant channels are private
- User must be tenant member
- Authorization handled in `routes/channels.php`

**Fallback polling active**
- If you see "(Polling mode)" in UI, WebSocket is disconnected
- Check Pusher credentials and connection
- Polling will stop automatically when WebSocket reconnects

### Channel Design

**Tenant Inbox Channel:**
- `private-tenant.{tenantId}.whatsapp.inbox`
- Broadcasts: conversation updates, new message notifications
- Subscribed on: Conversations list page

**Conversation Channel:**
- `private-tenant.{tenantId}.whatsapp.conversation.{conversationId}`
- Broadcasts: new messages, message status updates, notes, audit events
- Subscribed on: Conversation thread page

### API Endpoints

**Stream Endpoints** (fallback polling):
- `GET /app/whatsapp/inbox/stream?since=<iso>` - Inbox updates
- `GET /app/whatsapp/inbox/{conversation}/stream?after_message_id=<id>` - Conversation updates

**Broadcasting Auth:**
- `POST /broadcasting/auth` - Channel authorization (handled by Laravel)

### Testing

Run realtime tests:

```bash
php artisan test --filter Realtime
```

Tests cover:
- Channel authorization (members vs non-members)
- Broadcast event dispatching
- Stream endpoint authorization and data

### Requirements

- Pusher account and app credentials
- WebSocket support in browser
- Tenant membership for all realtime features

## Phase 5: Billing & Plans (✅ Complete)

Phase 5 implements a comprehensive SaaS billing system with plans, subscriptions, usage tracking, and limit enforcement.

### Features

✅ **Plan Management**
- Multiple plans (Free, Starter, Pro, Enterprise)
- Configurable limits (agents, connections, messages, templates, AI credits)
- Module entitlements per plan
- Trial periods support
- Platform admin can CRUD plans

✅ **Auto-Subscription**
- Tenants automatically subscribe to default plan on creation
- Trial periods automatically applied if plan supports it
- Subscription status tracking (trialing, active, past_due, canceled)

✅ **Usage Tracking**
- Monthly usage counters (messages, templates, AI credits)
- Usage history per period
- Limit blocked events audit trail

✅ **Limit Enforcement**
- Server-side enforcement (middleware + service checks)
- Connection limits (per tenant)
- Message limits (monthly)
- Template send limits (monthly)
- Module access gating

✅ **Billing UI**
- Tenant billing overview with usage meters
- Plans comparison and switching
- Usage details and history
- Past due handling

### Environment Configuration

Add billing configuration to your `.env` file:

```env
# Default plan for new tenants
DEFAULT_PLAN_KEY=free

# Billing provider (manual for now, Stripe/Razorpay later)
BILLING_PROVIDER=manual

# Optional: Default trial days (if not set in plan)
# DEFAULT_TRIAL_DAYS=7
```

### Database Tables

- `plans` - Plan definitions with limits and modules
- `subscriptions` - Tenant subscriptions with status tracking
- `plan_addons` - Optional add-ons (for future use)
- `tenant_addons` - Active add-ons per tenant (for future use)
- `tenant_usage` - Monthly usage counters per tenant
- `billing_events` - Audit trail of billing actions

### Default Plans

**Free Plan:**
- 1 WhatsApp connection
- 1 agent
- 500 messages/month
- 0 template sends
- Modules: whatsapp (basic inbox)

**Starter Plan (₹999/month, 7-day trial):**
- 2 WhatsApp connections
- 3 agents
- 5,000 messages/month
- 1,000 template sends/month
- Modules: whatsapp, templates, inbox

**Pro Plan (₹4,999/month, 14-day trial):**
- 5 WhatsApp connections
- 10 agents
- 50,000 messages/month
- 10,000 template sends/month
- Modules: whatsapp, templates, inbox, chatbots, analytics, floaters

**Enterprise Plan (Custom pricing, 30-day trial):**
- Unlimited connections, agents, messages, templates
- All modules included
- Custom retention and features

### How Auto-Subscription Works

1. When a tenant is created (via onboarding), it automatically:
   - Subscribes to the default plan (`DEFAULT_PLAN_KEY` env var, or "free")
   - Starts trial if plan has `trial_days > 0`
   - Sets subscription status to "trialing" or "active"

2. Subscription is created via `SubscriptionService`:
   - If plan has trial: `startTrial()` creates subscription with `trial_ends_at`
   - Otherwise: `changePlan()` creates active subscription

### Creating and Modifying Plans

**Option 1: Using Seeder (Recommended)**

Plans are seeded via `PlanSeeder`. To modify:

1. Edit `database/seeders/PlanSeeder.php`
2. Run: `php artisan db:seed --class=PlanSeeder`

**Option 2: Platform Panel (UI)**

1. Login as super admin
2. Navigate to `/platform/plans`
3. Create, edit, or deactivate plans
4. Configure limits and modules per plan

**Option 3: Direct Database**

```sql
INSERT INTO plans (key, name, price_monthly, limits, modules, ...) VALUES (...);
```

### Limits Enforced Where

**Agents:**
- Before creating/inviting agents (enforced in agent management)

**WhatsApp Connections:**
- Before creating new connection (`ConnectionController@store`)
- Checked via `EntitlementService::canCreateConnection()`

**Messages (Monthly):**
- Before sending text message (`ConversationController@sendMessage`)
- Before sending template message (`TemplateSendController@store`)
- Checked via `EntitlementService::assertWithinLimit('messages_monthly')`
- Usage incremented only on successful send

**Template Sends (Monthly):**
- Before sending template message (`TemplateSendController@store`)
- Checked via `EntitlementService::assertWithinLimit('template_sends_monthly')`
- Usage incremented only on successful send

**Module Access:**
- Templates module requires plan with "templates" in modules array
- Enforced via `EnsureModuleEntitled` middleware
- Applied to template routes in `app/Modules/WhatsApp/routes/web.php`

### Past Due Behavior

When a subscription is `past_due` or `canceled`:

**Blocked:**
- All `/app/*` routes (except billing pages)
- Shows "Past Due" page with billing link

**Still Accessible:**
- `/app/settings/billing/*` routes
- Billing overview, plans, usage pages
- Allows tenant owner to update payment or upgrade

**Middleware:**
- `EnsureTenantSubscribed` middleware checks subscription status
- Allows billing routes to remain accessible
- Returns 402 (Payment Required) for blocked routes

### Common Issues

**Mismatch between plan.modules and tenant_modules toggles:**
- Effective modules = plan.modules ∩ enabled tenant_modules
- If plan includes "templates" but tenant has it disabled, user cannot access
- Solution: Enable module in tenant settings OR upgrade plan

**Month reset logic:**
- Usage is tracked per period (format: "YYYY-MM", e.g., "2026-01")
- Period is based on server timezone (UTC by default)
- New period starts automatically on month boundary
- Usage counters reset to 0 for new period

**Limit exceeded but still showing old data:**
- Limits are enforced on new actions only
- Existing data (connections, messages) is NOT deleted on downgrade
- New actions are blocked until upgrade or usage decreases

### Testing Checklist

**Exceed Message Limit:**
1. Set tenant usage near limit: `setUsage($tenant, '2026-01', 500, 0)`
2. Try to send message
3. Should see 402 error with upgrade message
4. Check `billing_events` table for `limit_blocked` event

**Exceed Connection Limit:**
1. Create connections up to plan limit
2. Try to create one more
3. Should see 402 error
4. Verify existing connections still exist

**Switch Plan:**
1. As tenant owner, go to `/app/settings/billing/plans`
2. Click "Switch to this Plan"
3. Verify subscription.plan_id updated
4. Check `billing_events` for `plan_changed` event

**Module Access:**
1. Free plan user tries to access `/app/whatsapp/templates`
2. Should see 403 error with upgrade message
3. Upgrade to Starter plan
4. Should now be able to access templates

### API Endpoints

**Tenant Billing Routes:**
- `GET /app/settings/billing` - Billing overview
- `GET /app/settings/billing/plans` - Available plans
- `POST /app/settings/billing/plans/{plan}/switch` - Switch plan
- `POST /app/settings/billing/cancel` - Cancel subscription
- `POST /app/settings/billing/resume` - Resume subscription
- `GET /app/settings/billing/usage` - Usage details

**Platform Routes (Super Admin):**
- `GET /platform/plans` - List all plans
- `GET /platform/plans/create` - Create plan form
- `POST /platform/plans` - Store plan
- `GET /platform/plans/{plan}/edit` - Edit plan form
- `PATCH /platform/plans/{plan}` - Update plan
- `POST /platform/plans/{plan}/toggle` - Toggle active status
- `GET /platform/subscriptions` - Subscriptions overview

### Testing

Run billing tests:

```bash
php artisan test --filter=Billing
```

Tests cover:
- Auto-subscription on tenant creation
- Plan resolver effective modules/limits
- Module entitlement enforcement
- Subscription status blocking
- Connection limit enforcement
- Message/template limit enforcement
- Plan change logic
- Usage increment on successful sends

### Manual Provider Workflow

Currently, billing uses "manual" provider:

1. **Plan Changes:**
   - Tenant owner selects plan in UI
   - Subscription updated immediately
   - No payment processing (for testing)

2. **Manual Payment Recording:**
   - Super admin can record manual payments via platform panel
   - Extends subscription period by 1 month
   - Updates subscription status to "active"

3. **Future Integration:**
   - System designed for Stripe/Razorpay integration
   - `BillingProvider` interface ready
   - Webhook handlers can be added

## Phase 6: Chatbot Builder (✅ Complete)

Phase 6 implements a comprehensive chatbot automation system for WhatsApp conversations.

### Features

✅ **Bot Management**
- Create, edit, and manage bots per tenant
- Bot status: draft, active, paused
- Apply bots to specific connections or all connections
- Version tracking

✅ **Flow Builder (Step-based)**
- Create flows with triggers and nodes
- Sequential node execution
- Priority-based flow ordering
- Enable/disable flows independently

✅ **Trigger Types**
- **Inbound Message**: Fires on new inbound messages
  - Optional: first message only
  - Optional: connection filter
  - Optional: skip if conversation assigned
- **Keyword**: Matches text containing keywords
  - Any/all match type
  - Case sensitivity toggle
  - Whole word matching
- **Button Reply**: Matches interactive button replies

✅ **Condition Nodes**
- Text contains / equals / starts with
- Regex match
- Time window (business hours)
- Connection filter
- Conversation status check
- Tags contains (placeholder for future)

✅ **Action Nodes**
- **Send Text Message**: Send plain text reply
- **Send Template Message**: Send template with variables
- **Assign Agent**: Assign conversation to agent (placeholder)
- **Add Tag**: Add tag to conversation (placeholder)
- **Set Status**: Set conversation status
- **Set Priority**: Set conversation priority (placeholder)
- **Delay**: Schedule next action after delay (queued)
- **Webhook Call**: POST to external URL with timeout

✅ **Runtime Engine**
- Idempotent execution (prevents duplicate sends)
- Sequential node processing
- Condition gating (conditions block subsequent actions if failed)
- Rate limiting (max 5 messages per conversation per minute)
- Action limits (max 10 actions per execution)
- Structured logging per execution
- Error handling and recovery

✅ **Integration**
- Automatically processes inbound messages via queued job
- Respects billing limits (messages, templates)
- Tracks usage on successful sends
- Broadcasts realtime updates

✅ **Execution Logs**
- View execution history
- Detailed logs per execution
- Error tracking
- Performance metrics

### Database Tables

- `bots` - Bot definitions
- `bot_flows` - Flow definitions with triggers
- `bot_nodes` - Condition and action nodes
- `bot_executions` - Execution history with logs
- `bot_action_jobs` - Delayed action scheduling

### Module Requirements

The Chatbots module requires:
- Module key: `automation.chatbots`
- Plan entitlement: Must be included in tenant plan modules
- Tenant owner/admin access for management

### Usage

1. **Create a Bot**
   - Navigate to Chatbots → Create Bot
   - Set name, description, status
   - Select which connections the bot applies to

2. **Add a Flow**
   - In bot editor, click "Add Flow"
   - Configure trigger (e.g., keyword: "hello")
   - Set priority (lower = runs first)

3. **Add Nodes**
   - Add condition nodes to gate actions
   - Add action nodes (send message, delay, etc.)
   - Nodes execute sequentially

4. **Publish Bot**
   - Save as draft for testing
   - Set status to "active" to publish
   - Bot will process inbound messages automatically

5. **View Logs**
   - Navigate to Executions to see execution history
   - Click on execution to view detailed logs
   - Debug failed executions

### Trigger Examples

**Keyword Trigger:**
```json
{
  "type": "keyword",
  "keywords": ["hello", "hi"],
  "match_type": "any",
  "case_sensitive": false,
  "whole_word": false
}
```

**Inbound Message Trigger:**
```json
{
  "type": "inbound_message",
  "first_message_only": true,
  "connection_ids": [1, 2],
  "skip_if_assigned": false
}
```

### Action Examples

**Send Text:**
```json
{
  "action_type": "send_text",
  "message": "Hello! How can I help you?"
}
```

**Send Template:**
```json
{
  "action_type": "send_template",
  "template_id": 123,
  "variables": ["John", "Order #456"]
}
```

**Delay:**
```json
{
  "type": "delay",
  "seconds": 60
}
```

### Safety Features

- **Idempotency**: Same `meta_message_id` won't trigger duplicate executions
- **Rate Limiting**: Max 5 messages per conversation per minute
- **Action Limits**: Max 10 actions per execution
- **Timeout Protection**: Webhook calls have configurable timeout
- **Error Handling**: Failed actions logged but don't stop execution
- **Billing Limits**: Respects message/template limits from plan

### API Endpoints

**Bot Routes:**
- `GET /app/chatbots` - List bots
- `GET /app/chatbots/create` - Create form
- `POST /app/chatbots` - Store bot
- `GET /app/chatbots/{bot}` - View bot
- `PATCH /app/chatbots/{bot}` - Update bot
- `DELETE /app/chatbots/{bot}` - Delete bot

**Flow Routes:**
- `POST /app/chatbots/{bot}/flows` - Create flow
- `PATCH /app/chatbots/flows/{flow}` - Update flow
- `DELETE /app/chatbots/flows/{flow}` - Delete flow

**Execution Routes:**
- `GET /app/chatbots/executions` - List executions
- `GET /app/chatbots/executions/{execution}` - View execution details

### Testing

Run chatbot tests:

```bash
php artisan test --filter=Chatbot
```

### Requirements

- WhatsApp module enabled
- Plan with `automation.chatbots` module entitlement
- Tenant owner/admin role for management
- Queue worker running for delayed actions

## Next Steps (Future Phases)

- Phase 7: Team Inbox Workflow (assignment, tags, internal notes, SLA, priority)
- Phase 8: AI Layer (auto-replies, variable auto-fill, sentiment, summaries, routing)
- Phase 9: Floaters/Widgets (website widget + QR + wa.me links)
- Phase 10: Analytics + Events + Exports

## License

This project is proprietary software.
# waify
