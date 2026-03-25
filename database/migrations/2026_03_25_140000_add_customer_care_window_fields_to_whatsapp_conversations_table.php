<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_conversations', function (Blueprint $table) {
            if (!Schema::hasColumn('whatsapp_conversations', 'last_inbound_at')) {
                $table->timestamp('last_inbound_at')->nullable()->after('last_message_at');
            }

            if (!Schema::hasColumn('whatsapp_conversations', 'service_window_expires_at')) {
                $table->timestamp('service_window_expires_at')->nullable()->after('last_inbound_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_conversations', function (Blueprint $table) {
            if (Schema::hasColumn('whatsapp_conversations', 'service_window_expires_at')) {
                $table->dropColumn('service_window_expires_at');
            }

            if (Schema::hasColumn('whatsapp_conversations', 'last_inbound_at')) {
                $table->dropColumn('last_inbound_at');
            }
        });
    }
};
