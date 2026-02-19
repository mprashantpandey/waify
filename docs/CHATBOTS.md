# Chatbot Module

This document describes the Chatbots (automation) module: how bots run, triggers, conditions, actions, and best practices.

## Overview

- **Bots** belong to an account and can be **draft**, **active**, or **paused**. Only **active** bots run.
- Each bot has one or more **flows**. A flow has a **trigger**, a graph of **nodes** (conditions, actions, delays, webhooks), and **edges** connecting them.
- When an **inbound WhatsApp message** is received, the webhook dispatches a job that runs all eligible bots. For each bot, enabled flows are evaluated in **priority** order. If **Stop on first flow** is enabled (default), only the first flow whose trigger matches is executed; otherwise all matching flows can run.

## Triggers

| Type | Description |
|------|-------------|
| **inbound_message** | Fires on any inbound message. Options: first message only, skip if conversation already assigned, filter by connection. |
| **keyword** | Message text matches one or more keywords. Options: case sensitive, whole word, match any vs all. |
| **button_reply** | User tapped a specific interactive button (button ID must match). |

## Conditions (branching)

Condition nodes route the flow to **true** or **false** edges:

- **text_contains** / **text_equals** / **text_starts_with** – Compare message text (optional case sensitive).
- **regex_match** – Message text matches a regex pattern.
- **time_window** – Current time is within a window (timezone, start/end time, days of week).
- **connection_is** – Message came from one of the given connection IDs.
- **conversation_status** – Conversation status equals (e.g. open, closed).
- **tags_contains** – Contact has one of the given tags (by ID or name).

## Actions

| Action | Description |
|--------|-------------|
| **send_text** | Send a text message. Rate limit: 5 messages per conversation per minute. |
| **send_template** | Send an approved WhatsApp template with optional variables. |
| **send_buttons** | Send up to 3 interactive buttons (body + optional header/footer). |
| **send_list** | Send an interactive list (from WhatsApp Lists module). |
| **assign_agent** | Assign conversation to a team member (must be in account’s assignable agents). |
| **add_tag** | Add a tag to the contact (by tag ID or name; tag is created if missing). |
| **set_status** | Set conversation status (e.g. open, closed). |
| **set_priority** | Set conversation priority (if column exists). |
| **delay** | Wait N seconds, then continue to the next node (queued job). |
| **webhook** | Call an external URL (POST/GET) with conversation and message payload. |

## Execution

- **Idempotency**: Each flow is run at most once per message (by `trigger_event_id` = meta message ID or `msg_{id}`).
- **Max actions**: Each flow run is limited to 10 actions to avoid runaway loops.
- **Linear vs graph**: If the flow has no edges, nodes run in **sort_order**. If it has edges, execution starts from the **start node** (or the first root executable node) and follows edges; condition nodes branch on true/false.
- **Logs**: Executions are stored with status (`running`, `success`, `failed`, `skipped`) and a log of node results for debugging.

## Configuration

- **Applies to**: Choose “All connections” or specific WhatsApp connections. Only messages from those connections trigger the bot.
- **Stop on first flow**: When enabled (default), the first flow whose trigger matches is executed and remaining flows of that bot are skipped. When disabled, every matching flow runs (use with care to avoid duplicate replies).

## Module entitlement

The module is gated by the **automation.chatbots** entitlement on the account’s plan. Ensure the plan includes this key and the account has the Chatbots module enabled.

## Logging

Bot and execution logs go to the `chatbots` log channel (`storage/logs/chatbots.log`). Use `LOG_CHANNEL=chatbots` or `config/logging.php` to adjust.
