<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('contacts:sync-message-stats {--dry-run}', function () {
    $dryRun = (bool) $this->option('dry-run');

    $rows = DB::table('whatsapp_messages')
        ->join('whatsapp_conversations', 'whatsapp_messages.whatsapp_conversation_id', '=', 'whatsapp_conversations.id')
        ->selectRaw(
            'whatsapp_conversations.whatsapp_contact_id as contact_id,
             count(*) as total,
             max(whatsapp_messages.received_at) as last_seen,
             max(whatsapp_messages.sent_at) as last_contacted,
             max(whatsapp_messages.created_at) as last_message'
        )
        ->groupBy('whatsapp_conversations.whatsapp_contact_id')
        ->get();

    $updated = 0;

    foreach ($rows as $row) {
        if (!$row->contact_id) {
            continue;
        }

        $lastSeen = $row->last_seen ?: $row->last_message;

        if (!$dryRun) {
            DB::table('whatsapp_contacts')
                ->where('id', $row->contact_id)
                ->update([
                    'message_count' => (int) $row->total,
                    'last_seen_at' => $lastSeen,
                    'last_contacted_at' => $row->last_contacted,
                    'updated_at' => now(),
                ]);
        }

        $updated++;
    }

    $this->info(($dryRun ? 'Would update' : 'Updated') . " {$updated} contact(s).");
})->purpose('Backfill message_count and last seen/last contacted for contacts');
