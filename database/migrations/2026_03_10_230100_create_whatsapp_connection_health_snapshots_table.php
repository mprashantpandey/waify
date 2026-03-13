<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('whatsapp_connection_health_snapshots')) {
            return;
        }

        Schema::create('whatsapp_connection_health_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained(indexName: 'wa_conn_health_snapshots_account_fk')->cascadeOnDelete();
            $table->foreignId('whatsapp_connection_id')->constrained('whatsapp_connections', 'wa_conn_health_snapshots_conn_fk')->cascadeOnDelete();
            $table->string('source')->default('api_sync');
            $table->string('quality_rating')->nullable();
            $table->string('messaging_limit_tier')->nullable();
            $table->string('account_review_status')->nullable();
            $table->string('business_verification_status')->nullable();
            $table->string('code_verification_status')->nullable();
            $table->string('display_name_status')->nullable();
            $table->string('restriction_state')->nullable();
            $table->string('warning_state')->nullable();
            $table->string('health_state')->default('unknown');
            $table->json('health_notes')->nullable();
            $table->timestamp('captured_at')->nullable();
            $table->timestamps();

            $table->index(['whatsapp_connection_id', 'captured_at'], 'wa_conn_health_snapshot_conn_captured_idx');
            $table->index(['account_id', 'captured_at'], 'wa_conn_health_snapshot_account_captured_idx');
            $table->index('health_state', 'wa_conn_health_snapshot_health_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_connection_health_snapshots');
    }
};
