<?php

namespace App\Modules\WhatsApp\Services;

use App\Modules\WhatsApp\Models\WhatsAppMessage;
use Illuminate\Support\Facades\DB;

class InboxMetricsService
{
    /**
     * @param array<int, int|string> $conversationIds
     * @return array<int, int>
     */
    public function unreadCountMap(array $conversationIds): array
    {
        $conversationIds = array_values(array_unique(array_map('intval', $conversationIds)));
        if (empty($conversationIds)) {
            return [];
        }

        $outboundSubquery = WhatsAppMessage::query()
            ->select('whatsapp_conversation_id')
            ->selectRaw('MAX(created_at) as last_outbound_at')
            ->where('direction', 'outbound')
            ->whereIn('whatsapp_conversation_id', $conversationIds)
            ->groupBy('whatsapp_conversation_id');

        $rows = DB::table('whatsapp_messages as inbound')
            ->leftJoinSub($outboundSubquery, 'outbound', function ($join) {
                $join->on('outbound.whatsapp_conversation_id', '=', 'inbound.whatsapp_conversation_id');
            })
            ->whereIn('inbound.whatsapp_conversation_id', $conversationIds)
            ->where('inbound.direction', 'inbound')
            ->where(function ($query) {
                $query->whereNull('outbound.last_outbound_at')
                    ->orWhereColumn('inbound.created_at', '>', 'outbound.last_outbound_at');
            })
            ->groupBy('inbound.whatsapp_conversation_id')
            ->selectRaw('inbound.whatsapp_conversation_id as conversation_id, COUNT(*) as unread_count')
            ->get();

        $result = [];
        foreach ($rows as $row) {
            $result[(int) $row->conversation_id] = (int) $row->unread_count;
        }

        return $result;
    }

    public function unreadCountForConversation(int $conversationId): int
    {
        return $this->unreadCountMap([$conversationId])[$conversationId] ?? 0;
    }
}
