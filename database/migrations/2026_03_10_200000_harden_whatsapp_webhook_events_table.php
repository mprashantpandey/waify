<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('whatsapp_webhook_events')) {
            return;
        }

        Schema::table('whatsapp_webhook_events', function (Blueprint $table) {
            if (!Schema::hasColumn('whatsapp_webhook_events', 'tenant_id')) {
                $table->unsignedBigInteger('tenant_id')->nullable()->after('account_id')->index();
            }
            if (!Schema::hasColumn('whatsapp_webhook_events', 'provider')) {
                $table->string('provider', 40)->default('whatsapp_meta')->after('tenant_id')->index();
            }
            if (!Schema::hasColumn('whatsapp_webhook_events', 'event_type')) {
                $table->string('event_type', 120)->nullable()->after('provider')->index();
            }
            if (!Schema::hasColumn('whatsapp_webhook_events', 'object_type')) {
                $table->string('object_type', 120)->nullable()->after('event_type')->index();
            }
            if (!Schema::hasColumn('whatsapp_webhook_events', 'idempotency_key')) {
                $table->string('idempotency_key', 120)->nullable()->after('object_type');
            }
            if (!Schema::hasColumn('whatsapp_webhook_events', 'delivery_headers')) {
                $table->json('delivery_headers')->nullable()->after('payload');
            }
            if (!Schema::hasColumn('whatsapp_webhook_events', 'signature_valid')) {
                $table->boolean('signature_valid')->nullable()->after('delivery_headers')->index();
            }
            if (!Schema::hasColumn('whatsapp_webhook_events', 'retry_count')) {
                $table->unsignedInteger('retry_count')->default(0)->after('signature_valid');
            }
            if (!Schema::hasColumn('whatsapp_webhook_events', 'failed_at')) {
                $table->timestamp('failed_at')->nullable()->after('processed_at');
            }
        });

        Schema::table('whatsapp_webhook_events', function (Blueprint $table) {
            try {
                $table->unique(
                    ['provider', 'whatsapp_connection_id', 'idempotency_key'],
                    'wa_webhook_events_provider_conn_idem_uq'
                );
            } catch (\Throwable) {
                // Ignore if already exists.
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('whatsapp_webhook_events')) {
            return;
        }

        Schema::table('whatsapp_webhook_events', function (Blueprint $table) {
            try {
                $table->dropUnique('wa_webhook_events_provider_conn_idem_uq');
            } catch (\Throwable) {
                // Ignore.
            }

            foreach ([
                'tenant_id',
                'provider',
                'event_type',
                'object_type',
                'idempotency_key',
                'delivery_headers',
                'signature_valid',
                'retry_count',
                'failed_at',
            ] as $column) {
                if (Schema::hasColumn('whatsapp_webhook_events', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

