<?php

namespace App\Services;

use App\Events\MetaLeadCreated;
use App\Models\AccountIntegration;
use App\Models\AccountMetaLead;
use App\Modules\Chatbots\Models\BotFlow;
use App\Modules\Chatbots\Services\BotRuntime;
use App\Modules\Contacts\Models\ContactTag;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use Illuminate\Support\Str;

class MetaLeadIntakeService
{
    public function handle(AccountIntegration $integration, AccountMetaLead $lead, bool $created, string $source = 'sync'): array
    {
        $config = is_array($integration->config) ? $integration->config : [];
        $contact = null;

        if ((bool) ($config['auto_create_contact'] ?? false) || (bool) ($config['lead_automation_enabled'] ?? false)) {
            $contact = $this->createOrUpdateContact($integration, $lead, $source);
        }

        $this->applyLeadRouting($integration, $lead);

        if ($created || (bool) ($config['lead_alert_updates_enabled'] ?? false)) {
            $this->notify($integration, $lead, $created);
            event(new MetaLeadCreated($lead->fresh()));
        }

        $automationStarted = false;
        if ((bool) ($config['lead_automation_enabled'] ?? false) && $contact) {
            $automationStarted = $this->startAutomation($integration, $lead, $contact, $source);
        }

        return [
            'contact_id' => $contact?->id,
            'automation_started' => $automationStarted,
        ];
    }

    public function createOrUpdateContact(AccountIntegration $integration, AccountMetaLead $lead, string $source = 'sync'): ?WhatsAppContact
    {
        $phone = preg_replace('/\D+/', '', (string) $lead->phone);
        if ($phone === '') {
            return null;
        }

        $contact = WhatsAppContact::withTrashed()->firstOrNew(['account_id' => $integration->account_id, 'wa_id' => $phone]);
        $contact->fill([
            'name' => $lead->name ?: $phone,
            'phone' => $lead->phone ?: $phone,
            'email' => $lead->email,
            'status' => 'active',
            'source' => 'meta_lead',
            'metadata' => [
                ...($contact->metadata ?: []),
                'meta_lead_id' => $lead->id,
                'external_id' => $lead->external_id,
                'form_name' => $lead->form_name,
                'campaign_name' => $lead->campaign_name,
                'synced_from' => $source,
            ],
        ])->save();

        if (method_exists($contact, 'restore') && $contact->trashed()) {
            $contact->restore();
        }

        foreach (($lead->auto_tags ?: []) as $tagName) {
            $tagName = trim((string) $tagName);
            if ($tagName === '') {
                continue;
            }
            $tag = ContactTag::firstOrCreate(
                ['account_id' => $integration->account_id, 'name' => $tagName],
                ['color' => '#10b981']
            );
            $contact->tags()->syncWithoutDetaching([$tag->id]);
        }

        if ($lead->stage === 'new') {
            $lead->update(['stage' => 'contacted']);
        }

        return $contact;
    }

    private function applyLeadRouting(AccountIntegration $integration, AccountMetaLead $lead): void
    {
        $config = is_array($integration->config) ? $integration->config : [];
        $updates = [];

        $assigneeName = trim((string) ($config['lead_assignee_name'] ?? ''));
        if ($assigneeName !== '' && blank($lead->assignee_name)) {
            $updates['assignee_name'] = $assigneeName;
        }

        $rules = $config['lead_routing_rules'] ?? [];
        if (is_string($rules)) {
            $rules = collect(preg_split('/\r\n|\r|\n/', $rules) ?: [])
                ->map(fn ($line) => trim($line))
                ->filter()
                ->map(function ($line) {
                    [$match, $assignee] = array_pad(explode('=>', $line, 2), 2, '');

                    return ['match' => trim($match), 'assignee' => trim($assignee)];
                })
                ->all();
        }

        foreach (is_array($rules) ? $rules : [] as $rule) {
            $match = Str::lower((string) ($rule['match'] ?? ''));
            $assignee = trim((string) ($rule['assignee'] ?? ''));
            if ($match === '' || $assignee === '') {
                continue;
            }
            $haystack = Str::lower(implode(' ', [
                $lead->form_name,
                $lead->campaign_name,
                $lead->ad_name,
                $lead->city,
                $lead->platform,
                $lead->source_type,
            ]));
            if (str_contains($haystack, $match)) {
                $updates['assignee_name'] = $assignee;
                break;
            }
        }

        if ($updates !== []) {
            $lead->update($updates);
        }
    }

    private function notify(AccountIntegration $integration, AccountMetaLead $lead, bool $created): void
    {
        $config = is_array($integration->config) ? $integration->config : [];
        if ((bool) ($config['lead_alerts_enabled'] ?? true) === false) {
            return;
        }

        app(AppNotificationService::class)->workspace(
            $integration->account_id,
            'new_meta_lead',
            $created ? 'New Meta lead received' : 'Meta lead updated',
            trim(($lead->name ?: 'Meta lead').' from '.($lead->form_name ?: 'lead form')),
            'info',
            route('app.meta-leads.index', ['q' => $lead->external_id ?: $lead->phone ?: $lead->name]),
            [
                'lead_id' => $lead->id,
                'external_id' => $lead->external_id,
                'platform' => $lead->platform,
                'form_name' => $lead->form_name,
                'campaign_name' => $lead->campaign_name,
                'dedupe_key' => 'meta_lead_'.$lead->id,
            ]
        );
    }

    private function startAutomation(AccountIntegration $integration, AccountMetaLead $lead, WhatsAppContact $contact, string $source): bool
    {
        $flowId = (int) ($integration->config['lead_automation_flow_id'] ?? 0);
        if ($flowId <= 0) {
            return false;
        }

        $flow = BotFlow::where('account_id', $integration->account_id)
            ->where('id', $flowId)
            ->where('enabled', true)
            ->with('bot')
            ->first();

        if (! $flow || ! $flow->bot || $flow->bot->status !== 'active') {
            return false;
        }

        $connection = WhatsAppConnection::where('account_id', $integration->account_id)
            ->where('is_active', true)
            ->orderByDesc('webhook_last_received_at')
            ->orderBy('id')
            ->first();
        if (! $connection) {
            return false;
        }

        $conversation = WhatsAppConversation::firstOrCreate(
            [
                'account_id' => $integration->account_id,
                'whatsapp_connection_id' => $connection->id,
                'whatsapp_contact_id' => $contact->id,
            ],
            [
                'status' => 'open',
                'last_message_at' => now(),
                'last_message_preview' => 'Meta lead received: '.$lead->name,
                'metadata' => ['source' => 'meta_lead'],
            ]
        );

        $conversation->forceFill([
            'status' => 'open',
            'last_message_at' => now(),
            'last_message_preview' => 'Meta lead received: '.$lead->name,
        ])->save();

        $message = WhatsAppMessage::firstOrCreate(
            [
                'account_id' => $integration->account_id,
                'meta_message_id' => 'meta-lead:'.$lead->id,
            ],
            [
                'whatsapp_conversation_id' => $conversation->id,
                'direction' => 'inbound',
                'type' => 'meta_lead',
                'text_body' => 'Meta lead received: '.$lead->name,
                'payload' => [
                    'source' => 'meta_lead',
                    'lead_id' => $lead->id,
                    'external_id' => $lead->external_id,
                    'form_name' => $lead->form_name,
                    'campaign_name' => $lead->campaign_name,
                    'origin' => $source,
                ],
                'status' => 'received',
                'received_at' => now(),
            ]
        );

        return app(BotRuntime::class)->startFlowForConversation(
            $flow,
            $message,
            $conversation,
            'meta-lead:'.$lead->id.':flow:'.$flow->id
        );
    }
}
