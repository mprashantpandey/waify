<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('whatsapp_usage_events')) {
            return;
        }

        Schema::create('whatsapp_usage_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('whatsapp_connection_id')->nullable()->constrained('whatsapp_connections')->nullOnDelete();
            $table->foreignId('whatsapp_message_id')->nullable()->constrained('whatsapp_messages')->nullOnDelete();
            $table->foreignId('whatsapp_conversation_id')->nullable()->constrained('whatsapp_conversations')->nullOnDelete();
            $table->foreignId('whatsapp_message_billing_id')->nullable()->constrained('whatsapp_message_billings')->nullOnDelete();
            $table->foreignId('meta_pricing_version_id')->nullable()->constrained('meta_pricing_versions')->nullOnDelete();
            $table->string('meta_message_id')->nullable();
            $table->string('pricing_category')->nullable(); // marketing, utility, authentication, service
            $table->string('pricing_region_code', 8)->nullable();
            $table->string('currency', 3)->nullable();
            $table->unsignedInteger('billable_unit')->default(1);
            $table->boolean('billable')->default(false);
            $table->integer('estimated_cost_minor')->default(0);
            $table->integer('final_cost_minor')->nullable();
            $table->string('source_event', 64)->default('webhook.status');
            $table->json('source_payload')->nullable();
            $table->timestamp('occurred_at')->nullable();
            $table->timestamps();

            $table->index(['account_id', 'created_at'], 'wa_usage_events_account_created_idx');
            $table->index(['account_id', 'pricing_category'], 'wa_usage_events_account_category_idx');
            $table->index(['account_id', 'billable'], 'wa_usage_events_account_billable_idx');
            $table->unique(['account_id', 'meta_message_id'], 'wa_usage_events_account_meta_message_uq');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_usage_events');
    }
};

