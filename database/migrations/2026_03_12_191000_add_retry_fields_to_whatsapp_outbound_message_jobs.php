<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_outbound_message_jobs', function (Blueprint $table) {
            if (!Schema::hasColumn('whatsapp_outbound_message_jobs', 'is_retryable')) {
                $table->boolean('is_retryable')->default(false)->after('error_message');
            }
            if (!Schema::hasColumn('whatsapp_outbound_message_jobs', 'next_retry_at')) {
                $table->timestamp('next_retry_at')->nullable()->after('is_retryable');
            }
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_outbound_message_jobs', function (Blueprint $table) {
            foreach (['next_retry_at', 'is_retryable'] as $column) {
                if (Schema::hasColumn('whatsapp_outbound_message_jobs', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

