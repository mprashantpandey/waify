<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inbound_automation_webhooks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->uuid('public_key')->unique();
            $table->string('signing_secret', 255);
            $table->boolean('is_active')->default(true);
            $table->string('action_type', 40);
            $table->foreignId('campaign_sequence_id')->nullable()->constrained('campaign_sequences')->nullOnDelete();
            $table->foreignId('whatsapp_connection_id')->nullable()->constrained('whatsapp_connections')->nullOnDelete();
            $table->foreignId('whatsapp_template_id')->nullable()->constrained('whatsapp_templates')->nullOnDelete();
            $table->json('payload_mappings')->nullable();
            $table->json('template_variable_paths')->nullable();
            $table->json('template_static_params')->nullable();
            $table->timestamp('last_received_at')->nullable();
            $table->timestamp('last_triggered_at')->nullable();
            $table->text('last_error')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inbound_automation_webhooks');
    }
};
