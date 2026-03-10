<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('whatsapp_connections')) {
            return;
        }

        Schema::table('whatsapp_connections', function (Blueprint $table) {
            if (!Schema::hasColumn('whatsapp_connections', 'webhook_last_processed_at')) {
                $table->timestamp('webhook_last_processed_at')->nullable()->after('webhook_last_received_at');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'webhook_consecutive_failures')) {
                $table->unsignedInteger('webhook_consecutive_failures')->default(0)->after('webhook_last_error');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'webhook_last_lag_seconds')) {
                $table->unsignedInteger('webhook_last_lag_seconds')->nullable()->after('webhook_consecutive_failures');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('whatsapp_connections')) {
            return;
        }

        Schema::table('whatsapp_connections', function (Blueprint $table) {
            foreach ([
                'webhook_last_processed_at',
                'webhook_consecutive_failures',
                'webhook_last_lag_seconds',
            ] as $column) {
                if (Schema::hasColumn('whatsapp_connections', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

