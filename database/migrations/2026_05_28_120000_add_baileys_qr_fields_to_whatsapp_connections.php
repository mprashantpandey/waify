<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_connections', function (Blueprint $table) {
            if (! Schema::hasColumn('whatsapp_connections', 'qr_session_id')) {
                $table->string('qr_session_id')->nullable()->after('connection_mode')->index();
            }
            if (! Schema::hasColumn('whatsapp_connections', 'qr_status')) {
                $table->string('qr_status', 40)->nullable()->after('qr_session_id');
            }
            if (! Schema::hasColumn('whatsapp_connections', 'qr_last_seen_at')) {
                $table->timestamp('qr_last_seen_at')->nullable()->after('qr_status');
            }
            if (! Schema::hasColumn('whatsapp_connections', 'qr_last_error')) {
                $table->text('qr_last_error')->nullable()->after('qr_last_seen_at');
            }
            if (! Schema::hasColumn('whatsapp_connections', 'qr_safety_settings')) {
                $table->json('qr_safety_settings')->nullable()->after('qr_last_error');
            }
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_connections', function (Blueprint $table) {
            foreach (['qr_safety_settings', 'qr_last_error', 'qr_last_seen_at', 'qr_status', 'qr_session_id'] as $column) {
                if (Schema::hasColumn('whatsapp_connections', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
