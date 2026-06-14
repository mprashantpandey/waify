<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Services\AccountProvisioner;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DemoInboxSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'mprashantpandey@gmail.com')->first();

        if (! $user) {
            $this->command?->warn('User mprashantpandey@gmail.com was not found. Demo inbox data was not created.');

            return;
        }

        DB::transaction(function () use ($user) {
            $account = $user->ownedAccounts()->first()
                ?? $user->accounts()->first()
                ?? app(AccountProvisioner::class)->create($user, 'Prashant Demo Workspace', null, [
                    'workspace_type' => 'business',
                    'industry' => 'Retail',
                    'timezone' => 'Asia/Kolkata',
                ]);

            $account->users()->syncWithoutDetaching([
                $user->id => ['role' => 'owner'],
            ]);

            session(['current_account_id' => $account->id]);

            $connection = WhatsAppConnection::where('account_id', $account->id)
                ->where('phone_number_id', 'demo_phone_001')
                ->first();

            if (! $connection) {
                $connection = new WhatsAppConnection([
                    'account_id' => $account->id,
                    'name' => 'Demo WhatsApp Number',
                    'waba_id' => 'demo_waba_001',
                    'phone_number_id' => 'demo_phone_001',
                    'business_phone' => '+91 98765 43210',
                    'api_version' => 'v20.0',
                    'webhook_verify_token' => WhatsAppConnection::generateVerifyToken(),
                    'webhook_subscribed' => true,
                    'webhook_last_received_at' => now()->subMinutes(8),
                    'is_active' => true,
                ]);
                $connection->access_token = 'demo-token';
                $connection->save();
            }

            $samples = [
                [
                    'name' => 'Priya Nair',
                    'wa_id' => '919910023456',
                    'email' => 'priya.nair@example.com',
                    'phone' => '+91 99100 23456',
                    'status' => 'active',
                    'conversation_status' => 'open',
                    'priority' => 'urgent',
                    'messages' => [
                        ['inbound', 'Hi, I placed an order yesterday. Can you confirm the delivery date?', 42],
                        ['outbound', 'Hi Priya, your order is packed and will be delivered tomorrow between 11 AM and 2 PM.', 38],
                        ['inbound', 'Great, please share the tracking link when available.', 9],
                    ],
                ],
                [
                    'name' => 'Arjun Mehta',
                    'wa_id' => '919876501234',
                    'email' => 'arjun.mehta@example.com',
                    'phone' => '+91 98765 01234',
                    'status' => 'active',
                    'conversation_status' => 'pending',
                    'priority' => 'normal',
                    'messages' => [
                        ['inbound', 'Do you have the festival bundle in size L?', 90],
                        ['outbound', 'Yes, size L is available. I can reserve one for you for the next 30 minutes.', 74],
                    ],
                ],
                [
                    'name' => 'Sneha Kapoor',
                    'wa_id' => '919820077700',
                    'email' => 'sneha.kapoor@example.com',
                    'phone' => '+91 98200 77700',
                    'status' => 'lead',
                    'conversation_status' => 'open',
                    'priority' => 'normal',
                    'messages' => [
                        ['inbound', 'Can you send today sale catalog?', 180],
                        ['outbound', 'Sure Sneha, here is the latest catalog. The green-tag offers end tonight.', 170],
                        ['inbound', 'Thanks. I am checking it now.', 155],
                    ],
                ],
                [
                    'name' => 'Rahul Verma',
                    'wa_id' => '919930044455',
                    'email' => 'rahul.verma@example.com',
                    'phone' => '+91 99300 44455',
                    'status' => 'active',
                    'conversation_status' => 'closed',
                    'priority' => 'low',
                    'messages' => [
                        ['inbound', 'Payment done, please confirm.', 1440],
                        ['outbound', 'Confirmed Rahul. Your invoice and order confirmation have been sent.', 1415],
                    ],
                ],
            ];

            foreach ($samples as $sample) {
                $contact = WhatsAppContact::updateOrCreate(
                    [
                        'account_id' => $account->id,
                        'wa_id' => $sample['wa_id'],
                    ],
                    [
                        'name' => $sample['name'],
                        'email' => $sample['email'],
                        'phone' => $sample['phone'],
                        'status' => $sample['status'],
                        'source' => 'demo',
                        'last_seen_at' => now()->subMinutes($sample['messages'][array_key_last($sample['messages'])][2]),
                        'metadata' => [
                            'demo' => true,
                            'tags' => ['vip', 'whatsapp'],
                        ],
                    ]
                );

                $lastMessage = $sample['messages'][array_key_last($sample['messages'])];

                $conversation = WhatsAppConversation::updateOrCreate(
                    [
                        'account_id' => $account->id,
                        'whatsapp_connection_id' => $connection->id,
                        'whatsapp_contact_id' => $contact->id,
                    ],
                    [
                        'assigned_to' => $sample['conversation_status'] === 'closed' ? $user->id : null,
                        'status' => $sample['conversation_status'],
                        'priority' => $sample['priority'],
                        'last_message_at' => now()->subMinutes($lastMessage[2]),
                        'last_message_preview' => $lastMessage[1],
                        'metadata' => ['demo' => true],
                    ]
                );

                WhatsAppMessage::where('account_id', $account->id)
                    ->where('whatsapp_conversation_id', $conversation->id)
                    ->where('payload->demo_seed', true)
                    ->delete();

                foreach ($sample['messages'] as $index => [$direction, $body, $minutesAgo]) {
                    $timestamp = now()->subMinutes($minutesAgo);
                    WhatsAppMessage::forceCreate([
                        'account_id' => $account->id,
                        'whatsapp_conversation_id' => $conversation->id,
                        'direction' => $direction,
                        'meta_message_id' => 'demo_'.$conversation->id.'_'.$index.'_'.$timestamp->format('YmdHi'),
                        'type' => 'text',
                        'text_body' => $body,
                        'payload' => ['demo_seed' => true],
                        'status' => $direction === 'outbound' ? 'delivered' : 'read',
                        'sent_at' => $direction === 'outbound' ? $timestamp : null,
                        'delivered_at' => $direction === 'outbound' ? $timestamp->copy()->addMinute() : null,
                        'read_at' => $direction === 'outbound' ? $timestamp->copy()->addMinutes(2) : null,
                        'received_at' => $direction === 'inbound' ? $timestamp : null,
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ]);
                }

                $contact->forceFill([
                    'message_count' => count($sample['messages']),
                    'last_contacted_at' => Carbon::parse($conversation->last_message_at),
                ])->save();
            }
        });

        $this->command?->info('Demo inbox data created for mprashantpandey@gmail.com.');
    }
}
