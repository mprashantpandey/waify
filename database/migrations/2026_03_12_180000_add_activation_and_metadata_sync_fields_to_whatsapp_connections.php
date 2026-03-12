<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_connections', function (Blueprint $table) {
            if (!Schema::hasColumn('whatsapp_connections', 'activation_state')) {
                $table->string('activation_state')->default('active')->after('is_active');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'activation_last_error')) {
                $table->text('activation_last_error')->nullable()->after('activation_state');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'activation_updated_at')) {
                $table->timestamp('activation_updated_at')->nullable()->after('activation_last_error');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'metadata_sync_status')) {
                $table->string('metadata_sync_status')->default('pending')->after('health_last_synced_at');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'metadata_last_sync_error')) {
                $table->text('metadata_last_sync_error')->nullable()->after('metadata_sync_status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_connections', function (Blueprint $table) {
            foreach ([
                'metadata_last_sync_error',
                'metadata_sync_status',
                'activation_updated_at',
                'activation_last_error',
                'activation_state',
            ] as $column) {
                if (Schema::hasColumn('whatsapp_connections', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

