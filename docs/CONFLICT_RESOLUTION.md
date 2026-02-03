# Conflict Resolution and Issue Prevention

This document outlines all conflicts that have been identified and resolved across modules.

## Issues Found and Fixed

### 1. Webhook Processing Conflicts

**Issue**: WebhookProcessor could process the same webhook multiple times concurrently, creating duplicate contacts and messages.

**Fix**:
- Added cache lock: `webhook_process:connection:{id}` (1 minute)
- Added message-level lock: `webhook_message:{message_id}` (30 seconds)
- Added status update lock: `webhook_status:{message_id}` (30 seconds)
- Used `lockForUpdate()` for contact/conversation creation
- Added dedicated queue for chatbot processing: `chatbots`

### 2. Contact Creation Race Conditions

**Issue**: WebhookProcessor and ContactService could both create the same contact simultaneously.

**Fix**:
- WebhookProcessor now uses `lockForUpdate()` when creating contacts
- ContactService import uses transaction with `lockForUpdate()`
- Both set `source` field to track origin

### 3. Campaign Message Status Updates

**Issue**: Webhook status updates could conflict with campaign message status updates.

**Fix**:
- Added lock: `campaign_status_update:{wamid}` (30 seconds)
- Used `lockForUpdate()` for campaign message and recipient updates
- Campaign statistics increments now use `lockForUpdate()`
- WebhookProcessor now checks both regular messages and campaign messages

### 4. Campaign Job Dispatch

**Issue**: Campaign jobs were dispatched without queue specification, causing conflicts.

**Fix**:
- All campaign jobs now use `campaigns` queue
- Job dispatch in `startCampaign()` now specifies queue

### 5. Rate Limiting Conflicts

**Issue**: Multiple rate limiters using different mechanisms could conflict.

**Fix**:
- Template sync: `template_sync_rate_limit:connection:{id}` (10/min)
- Bot messages: `bot_rate_limit:{conversation_id}` (5/min)
- Webhook: Laravel RateLimiter (100/min per connection)
- All use unique cache keys to avoid conflicts

## Lock Keys Summary

All lock keys are namespaced to prevent collisions:

### Sync Locks
- `template_sync:connection:{id}` - Template sync per connection (5 min)
- `contact_import:account:{id}` - Contact import per account (10 min)
- `campaign_send:{id}` - Campaign sending per campaign (1 min)

### Processing Locks
- `webhook_process:connection:{id}` - Webhook processing per connection (1 min)
- `webhook_message:{message_id}` - Individual message processing (30 sec)
- `webhook_status:{message_id}` - Status update processing (30 sec)
- `campaign_status_update:{wamid}` - Campaign status update (30 sec)

### Rate Limit Keys
- `template_sync_rate_limit:connection:{id}` - Template sync rate limit
- `bot_rate_limit:{conversation_id}` - Bot message rate limit

## Queue Configuration

Dedicated queues prevent blocking and conflicts:

- **default**: General operations
- **campaigns**: Campaign message sending
- **chatbots**: Bot message processing

## Database Transaction Safety

All critical operations use transactions with row-level locks:

1. **Contact Creation**: `lockForUpdate()` prevents duplicates
2. **Campaign Recipient Processing**: `lockForUpdate()` prevents duplicate sends
3. **Message Status Updates**: `lockForUpdate()` prevents race conditions
4. **Contact Import**: Transaction wraps entire import process

## Best Practices Applied

1. ✅ **Always use locks** for operations that could run concurrently
2. ✅ **Use transactions** for operations modifying multiple related records
3. ✅ **Implement rate limiting** for external API calls
4. ✅ **Use dedicated queues** for resource-intensive operations
5. ✅ **Set appropriate lock timeouts** based on operation duration
6. ✅ **Release locks in finally blocks** to ensure cleanup
7. ✅ **Use row-level locks** (`lockForUpdate()`) for database operations
8. ✅ **Namespace all cache keys** to prevent collisions

## Monitoring

Monitor for conflicts through:
- Laravel logs: Check for lock acquisition failures
- Queue monitoring: Watch for stuck jobs
- Cache monitoring: Check lock expiration times
- Database deadlocks: Monitor for transaction conflicts

## Future Considerations

- Add sync status indicators in UI
- Implement sync queue prioritization
- Add sync operation history/audit log
- Create admin dashboard for sync monitoring
- Add automatic retry mechanisms for failed locks

