<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shopify_integrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('shop_domain');
            $table->string('shop_name')->nullable();
            $table->text('access_token_encrypted')->nullable();
            $table->text('webhook_secret_encrypted')->nullable();
            $table->json('webhook_topics')->nullable();
            $table->foreignId('abandoned_checkout_sequence_id')->nullable()->constrained('campaign_sequences')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->boolean('auto_register_webhooks')->default(true);
            $table->timestamp('last_sync_at')->nullable();
            $table->text('last_error')->nullable();
            $table->timestamps();

            $table->unique(['account_id', 'shop_domain']);
        });

        Schema::create('shopify_webhook_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shopify_integration_id')->constrained()->cascadeOnDelete();
            $table->string('topic')->nullable();
            $table->string('shop_domain')->nullable();
            $table->string('event_id');
            $table->string('status')->default('received');
            $table->json('payload')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->unique(['shopify_integration_id', 'event_id']);
            $table->index(['shopify_integration_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shopify_webhook_logs');
        Schema::dropIfExists('shopify_integrations');
    }
};
