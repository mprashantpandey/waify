# Sync Coordination Across Modules

This document outlines how sync operations are coordinated across modules to prevent conflicts.

## Overview

Multiple modules perform sync operations that could conflict with each other:
- **WhatsApp Module**: Template syncing from Meta API
- **Broadcasts Module**: Campaign message sending
- **Contacts Module**: Contact import/export

## Conflict Prevention Mechanisms

### 1. Cache Locks

All sync operations use Laravel's cache locks to prevent concurrent execution:

#### Template Sync
- **Lock Key**: `template_sync:connection:{connection_id}`
- **Duration**: 5 minutes
- **Purpose**: Prevents multiple template syncs for the same connection

#### Campaign Sending
- **Lock Key**: `campaign_send:{campaign_id}`
- **Duration**: 1 minute
- **Purpose**: Prevents concurrent processing of the same campaign

#### Contact Import
- **Lock Key**: `contact_import:workspace:{workspace_id}`
- **Duration**: 10 minutes
- **Purpose**: Prevents concurrent imports for the same workspace

### 2. Rate Limiting

#### Template Sync Rate Limiting
- **Limit**: 10 requests per minute per connection
- **Implementation**: Cache-based counter with TTL
- **Error**: Throws exception if limit exceeded

### 3. Queue Separation

Different operations use dedicated queues to avoid conflicts:

- **Default Queue**: General operations
- **Campaigns Queue**: Campaign message sending (`campaigns`)
- **Sync Queue**: Template syncing (can be added if needed)

### 4. Database Transactions

Critical operations use database transactions with row-level locks:

- **Contact Import**: Uses `lockForUpdate()` to prevent race conditions
- **Campaign Recipient Processing**: Uses `lockForUpdate()` to prevent duplicate sends
- **Template Upsert**: Uses transactions to ensure atomicity

## Best Practices

1. **Always use locks for sync operations** that could run concurrently
2. **Use transactions** for operations that modify multiple related records
3. **Implement rate limiting** for external API calls
4. **Use dedicated queues** for resource-intensive operations
5. **Set appropriate lock timeouts** based on operation duration
6. **Release locks in finally blocks** to ensure cleanup

## Error Handling

When a sync operation is blocked:
- Template sync: Returns error message "Template sync is already in progress"
- Campaign sending: Job is released back to queue for retry
- Contact import: Returns error message "Contact import is already in progress"

## Monitoring

Monitor sync operations through:
- Laravel logs: Check for lock acquisition failures
- Queue monitoring: Watch for stuck jobs
- Cache monitoring: Check lock expiration times

## Future Enhancements

- Add sync status indicators in UI
- Implement sync queue prioritization
- Add sync operation history/audit log
- Create admin dashboard for sync monitoring

