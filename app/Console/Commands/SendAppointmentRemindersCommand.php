<?php

namespace App\Console\Commands;

use App\Core\Billing\UsageService;
use App\Models\AccountAppointment;
use App\Modules\WhatsApp\Events\Inbox\ConversationUpdated;
use App\Modules\WhatsApp\Events\Inbox\MessageCreated;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendAppointmentRemindersCommand extends Command
{
    protected $signature = 'appointments:send-reminders {--limit=50} {--dry-run}';

    protected $description = 'Send due WhatsApp appointment reminders.';

    public function handle(WhatsAppClient $whatsappClient, UsageService $usageService): int
    {
        $limit = max(1, min(200, (int) $this->option('limit')));
        $dryRun = (bool) $this->option('dry-run');
        $sent = 0;
        $failed = 0;

        $appointments = AccountAppointment::query()
            ->where('reminder_enabled', true)
            ->whereNull('reminder_sent_at')
            ->whereNotNull('contact_phone')
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->where('scheduled_at', '>', now())
            ->where('scheduled_at', '<=', now()->addDays(7))
            ->orderBy('scheduled_at')
            ->limit($limit * 3)
            ->get()
            ->filter(fn (AccountAppointment $appointment) => $appointment->scheduled_at?->lte(now()->addMinutes((int) $appointment->reminder_minutes_before)))
            ->take($limit);

        foreach ($appointments as $appointment) {
            if ($dryRun) {
                $this->line("Due reminder: #{$appointment->id} {$appointment->title}");
                $sent++;
                continue;
            }

            $lock = cache()->lock("appointment_reminder:{$appointment->id}", 120);
            if (! $lock->get()) {
                continue;
            }

            try {
                $fresh = $appointment->fresh();
                if (! $fresh || $fresh->reminder_sent_at || ! $fresh->reminder_enabled) {
                    continue;
                }

                $connection = WhatsAppConnection::where('account_id', $fresh->account_id)
                    ->where('is_active', true)
                    ->first();

                if (! $connection) {
                    $failed++;
                    Log::warning('Appointment reminder skipped: no active WABA connection', [
                        'appointment_id' => $fresh->id,
                        'account_id' => $fresh->account_id,
                    ]);
                    continue;
                }

                $contact = $this->findOrCreateContact($fresh);
                $conversation = $this->findOrCreateConversation($fresh->account_id, $connection->id, $contact->id);
                $body = $this->messageBody($fresh);

                $message = WhatsAppMessage::create([
                    'account_id' => $fresh->account_id,
                    'whatsapp_conversation_id' => $conversation->id,
                    'direction' => 'outbound',
                    'type' => 'text',
                    'text_body' => $body,
                    'status' => 'queued',
                    'payload' => [
                        'source' => 'appointment_reminder',
                        'appointment_id' => $fresh->id,
                    ],
                ]);

                $response = $whatsappClient->sendTextMessage($connection, $contact->wa_id, $body);
                $message->update([
                    'meta_message_id' => $response['messages'][0]['id'] ?? null,
                    'status' => 'sent',
                    'sent_at' => now(),
                    'payload' => [
                        'source' => 'appointment_reminder',
                        'appointment_id' => $fresh->id,
                        'response' => $response,
                    ],
                ]);
                $conversation->update([
                    'last_message_at' => now(),
                    'last_message_preview' => substr($body, 0, 100),
                ]);
                $fresh->update(['reminder_sent_at' => now()]);
                $usageService->incrementMessages($fresh->account, 1);

                event(new MessageCreated($message));
                event(new ConversationUpdated($conversation));
                $sent++;
            } catch (\Throwable $e) {
                $failed++;
                Log::warning('Appointment reminder failed', [
                    'appointment_id' => $appointment->id,
                    'account_id' => $appointment->account_id,
                    'error' => $e->getMessage(),
                ]);
            } finally {
                $lock->release();
            }
        }

        $this->info("Appointment reminders processed. Sent: {$sent}. Failed: {$failed}.");

        return self::SUCCESS;
    }

    private function findOrCreateContact(AccountAppointment $appointment): WhatsAppContact
    {
        $waId = preg_replace('/\D+/', '', (string) $appointment->contact_phone);

        $contact = WhatsAppContact::withTrashed()->firstOrNew([
            'account_id' => $appointment->account_id,
            'wa_id' => $waId,
        ]);
        $contact->fill([
            'name' => $appointment->contact_name,
            'phone' => $appointment->contact_phone,
            'status' => 'active',
            'source' => 'appointment',
            'metadata' => [
                ...($contact->metadata ?: []),
                'last_appointment_id' => $appointment->id,
            ],
        ])->save();

        if (method_exists($contact, 'restore') && $contact->trashed()) {
            $contact->restore();
        }

        return $contact->fresh();
    }

    private function findOrCreateConversation(int $accountId, int $connectionId, int $contactId): WhatsAppConversation
    {
        return WhatsAppConversation::firstOrCreate(
            [
                'account_id' => $accountId,
                'whatsapp_connection_id' => $connectionId,
                'whatsapp_contact_id' => $contactId,
                'status' => 'open',
            ],
            ['last_message_at' => now()]
        );
    }

    private function messageBody(AccountAppointment $appointment): string
    {
        $body = sprintf(
            'Reminder: %s is scheduled for %s. Reply here if you need to reschedule.',
            $appointment->title,
            $appointment->scheduled_at?->format('d M Y, h:i A') ?? 'your appointment'
        );

        if ($appointment->meeting_url) {
            $body .= "\nJoin: ".$appointment->meeting_url;
        } elseif ($appointment->location) {
            $body .= "\nLocation: ".$appointment->location;
        }

        return $body;
    }
}
