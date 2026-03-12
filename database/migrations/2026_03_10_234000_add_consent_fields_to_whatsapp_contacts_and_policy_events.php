<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_contacts', function (Blueprint $table) {
            if (!Schema::hasColumn('whatsapp_contacts', 'opted_in_at')) {
                $table->timestamp('opted_in_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('whatsapp_contacts', 'opt_in_source')) {
                $table->string('opt_in_source')->nullable()->after('opted_in_at');
            }
            if (!Schema::hasColumn('whatsapp_contacts', 'opt_in_notes')) {
                $table->text('opt_in_notes')->nullable()->after('opt_in_source');
            }
            if (!Schema::hasColumn('whatsapp_contacts', 'opted_out_at')) {
                $table->timestamp('opted_out_at')->nullable()->after('opt_in_notes');
            }
            if (!Schema::hasColumn('whatsapp_contacts', 'opt_out_reason')) {
                $table->string('opt_out_reason')->nullable()->after('opted_out_at');
            }
            if (!Schema::hasColumn('whatsapp_contacts', 'opt_out_channel')) {
                $table->string('opt_out_channel')->nullable()->after('opt_out_reason');
            }
            if (!Schema::hasColumn('whatsapp_contacts', 'do_not_contact')) {
                $table->boolean('do_not_contact')->default(false)->after('opt_out_channel');
            }
            if (!Schema::hasColumn('whatsapp_contacts', 'last_policy_event_at')) {
                $table->timestamp('last_policy_event_at')->nullable()->after('do_not_contact');
            }
        });

        Schema::table('whatsapp_contacts', function (Blueprint $table) {
            $table->index(['account_id', 'do_not_contact'], 'wa_contacts_account_dnc_idx');
            $table->index(['account_id', 'opted_out_at'], 'wa_contacts_account_opted_out_idx');
        });

        if (!Schema::hasTable('whatsapp_contact_policy_events')) {
            Schema::create('whatsapp_contact_policy_events', function (Blueprint $table) {
                $table->id();
                $table->foreignId('account_id')->constrained()->cascadeOnDelete();
                $table->foreignId('whatsapp_contact_id')->constrained('whatsapp_contacts')->cascadeOnDelete();
                $table->foreignId('whatsapp_message_id')->nullable()->constrained('whatsapp_messages')->nullOnDelete();
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
                $table->string('event_type'); // opt_in, opt_out, suppression_enabled, suppression_disabled
                $table->string('source')->nullable(); // inbound_keyword, manual, import, api
                $table->string('keyword')->nullable();
                $table->string('channel')->nullable(); // whatsapp, csv, ui
                $table->text('reason')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();

                $table->index(['account_id', 'event_type'], 'wa_contact_policy_account_event_idx');
                $table->index(['whatsapp_contact_id', 'created_at'], 'wa_contact_policy_contact_created_idx');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_contact_policy_events');

        Schema::table('whatsapp_contacts', function (Blueprint $table) {
            foreach (['wa_contacts_account_dnc_idx', 'wa_contacts_account_opted_out_idx'] as $index) {
                try {
                    $table->dropIndex($index);
                } catch (\Throwable $e) {
                    // no-op
                }
            }
        });

        Schema::table('whatsapp_contacts', function (Blueprint $table) {
            foreach ([
                'opted_in_at',
                'opt_in_source',
                'opt_in_notes',
                'opted_out_at',
                'opt_out_reason',
                'opt_out_channel',
                'do_not_contact',
                'last_policy_event_at',
            ] as $column) {
                if (Schema::hasColumn('whatsapp_contacts', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
