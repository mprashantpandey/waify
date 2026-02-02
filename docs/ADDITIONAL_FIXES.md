# Additional Issues Found and Fixed

This document outlines additional conflicts and issues that were identified and resolved.

## Issues Found

### 1. WhatsAppClient Rate Limiting

**Issue**: Multiple modules (Campaigns, Conversations, Chatbots, TemplateSend) all use WhatsAppClient simultaneously, but there was no connection-level rate limiting. Each module had its own rate limiting, but they could all hit the API at the same time, exceeding WhatsApp's limits.

**Fix**:
- Added connection-level rate limiting in `WhatsAppClient`: `whatsapp_api_rate_limit:connection:{id}` (100 requests/minute)
- Rate limit check is called before every API request
- Proper error handling for rate limit responses (error code 4, 429)

### 2. Campaign Statistics Race Conditions

**Issue**: Campaign statistics (`sent_count`, `failed_count`, etc.) were being incremented without locks, causing race conditions when multiple jobs process recipients simultaneously.

**Fix**:
- All campaign statistic increments now use `lockForUpdate()`
- Applied to: `sendToRecipient()`, `markRecipientFailed()`, `updateMessageStatus()`

### 3. Campaign Message Creation Conflicts

**Issue**: Campaign messages were created with `create()` which could fail if a message already exists for a recipient (unique constraint on `campaign_recipient_id`).

**Fix**:
- Changed to `updateOrCreate()` to handle the unique constraint gracefully
- Prevents duplicate key errors

### 4. Contact Export File Conflicts

**Issue**: Multiple users exporting contacts simultaneously could create files with the same name, causing conflicts.

**Fix**:
- Added export lock: `contact_export:workspace:{id}` (5 minutes)
- Added unique filename with workspace ID, timestamp, and uniqid()
- Prevents concurrent exports and file name collisions

### 5. Conversation Message Creation Race Conditions

**Issue**: `ConversationController::sendMessage()` could create duplicate messages if called concurrently.

**Fix**:
- Wrapped message creation in transaction with `lockForUpdate()`
- Prevents duplicate message creation

### 6. Template Send Contact/Conversation Creation

**Issue**: `TemplateSendController::getOrCreateConversation()` could create duplicate contacts/conversations if called concurrently.

**Fix**:
- Wrapped in transaction with `lockForUpdate()` for both contact and conversation creation
- Sets `source` field to track origin

### 7. Database Unique Constraint on WAMID

**Issue**: Migration had `unique('wamid')` which is incorrect - same wamid can exist in different contexts (regular messages vs campaign messages).

**Fix**:
- Removed unique constraint on wamid (kept as index for fast lookups)
- Status updates now use locks to prevent conflicts

## Complete Lock Registry

### Sync Operations
- `template_sync:connection:{id}` - Template sync (5 min)
- `contact_import:workspace:{id}` - Contact import (10 min)
- `contact_export:workspace:{id}` - Contact export (5 min)
- `campaign_send:{id}` - Campaign sending (1 min)

### Webhook Processing
- `webhook_process:connection:{id}` - Webhook processing (1 min)
- `webhook_message:{message_id}` - Message processing (30 sec)
- `webhook_status:{message_id}` - Status updates (30 sec)
- `campaign_status_update:{wamid}` - Campaign status (30 sec)

### Rate Limiting
- `template_sync_rate_limit:connection:{id}` - Template sync (10/min)
- `whatsapp_api_rate_limit:connection:{id}` - WhatsApp API (100/min)
- `bot_rate_limit:{conversation_id}` - Bot messages (5/min)

## Database Row-Level Locks

All critical operations now use `lockForUpdate()`:
- Contact creation/updates
- Conversation creation
- Message creation
- Campaign recipient processing
- Campaign statistics updates
- Contact import operations

## Queue Configuration

- **default**: General operations
- **campaigns**: Campaign message sending
- **chatbots**: Bot message processing

## Best Practices Applied

1. ✅ Connection-level rate limiting for shared resources
2. ✅ Row-level locks for all database writes
3. ✅ Transaction safety for multi-step operations
4. ✅ Unique constraint handling with `updateOrCreate()`
5. ✅ File operation locking and unique naming
6. ✅ Proper error handling for rate limits
7. ✅ Source tracking for data origin

## Testing Recommendations

1. Test concurrent webhook processing
2. Test concurrent campaign sending
3. Test concurrent contact imports
4. Test rate limit handling
5. Test file export conflicts
6. Test message creation race conditions

