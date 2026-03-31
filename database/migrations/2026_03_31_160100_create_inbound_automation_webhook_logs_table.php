<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inbound_automation_webhook_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inbound_automation_webhook_id')->constrained('inbound_automation_webhooks')->cascadeOnDelete();
            $table->uuid('request_id')->nullable();
            $table->string('idempotency_key', 191)->nullable();
            $table->string('status', 40);
            $table->json('payload')->nullable();
            $table->json('headers')->nullable();
            $table->string('response_summary', 255)->nullable();
            $table->json('result')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->unique(['inbound_automation_webhook_id', 'idempotency_key'], 'inbound_webhook_logs_unique_idempotency');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inbound_automation_webhook_logs');
    }
};
