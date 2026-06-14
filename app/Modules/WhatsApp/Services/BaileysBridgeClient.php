<?php

namespace App\Modules\WhatsApp\Services;

use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Support\Facades\Http;

class BaileysBridgeClient
{
    protected function baseUrl(): string
    {
        return rtrim((string) config('services.baileys_bridge.url', 'http://127.0.0.1:3215'), '/');
    }

    protected function secret(): string
    {
        return (string) config('services.baileys_bridge.secret', '');
    }

    protected function request()
    {
        return Http::acceptJson()
            ->timeout(20)
            ->withHeaders(array_filter([
                'X-Baileys-Bridge-Secret' => $this->secret(),
            ]));
    }

    public function startSession(WhatsAppConnection $connection, bool $forceRestart = false): array
    {
        return $this->request()
            ->post($this->baseUrl().'/sessions', [
                'connection_id' => $connection->id,
                'name' => $connection->name,
                'force_restart' => $forceRestart,
            ])
            ->throw()
            ->json();
    }

    public function status(WhatsAppConnection $connection): array
    {
        return $this->request()
            ->get($this->baseUrl().'/sessions/'.$connection->id)
            ->throw()
            ->json();
    }

    public function disconnect(WhatsAppConnection $connection): array
    {
        return $this->request()
            ->delete($this->baseUrl().'/sessions/'.$connection->id)
            ->throw()
            ->json();
    }

    public function sendText(WhatsAppConnection $connection, string $toWaId, string $messageText): array
    {
        return $this->request()
            ->post($this->baseUrl().'/sessions/'.$connection->id.'/send-text', [
                'to' => $toWaId,
                'text' => $messageText,
            ])
            ->throw()
            ->json();
    }

    public function sendMedia(WhatsAppConnection $connection, string $toWaId, string $type, string $url, ?string $caption = null, ?string $filename = null): array
    {
        return $this->request()
            ->post($this->baseUrl().'/sessions/'.$connection->id.'/send-media', [
                'to' => $toWaId,
                'type' => $type,
                'url' => $url,
                'caption' => $caption,
                'filename' => $filename,
            ])
            ->throw()
            ->json();
    }
}
