<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_webhook_endpoints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('url');
            $table->text('signing_secret_encrypted');
            $table->boolean('is_active')->default(true);
            $table->integer('timeout_seconds')->default(10);
            $table->smallInteger('max_retries')->default(5);
            $table->timestamp('last_delivery_at')->nullable();
            $table->unsignedSmallInteger('last_delivery_status_code')->nullable();
            $table->text('last_delivery_error')->nullable();
            $table->timestamps();

            $table->index(['account_id', 'is_active'], 'tenant_webhook_endpoints_account_active_idx');
        });

        Schema::create('tenant_webhook_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_webhook_endpoint_id')->constrained('tenant_webhook_endpoints')->cascadeOnDelete();
            $table->string('event_key');
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();

            $table->unique(['tenant_webhook_endpoint_id', 'event_key'], 'tenant_webhook_subscriptions_unique');
        });

        Schema::create('tenant_webhook_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tenant_webhook_endpoint_id')->constrained('tenant_webhook_endpoints')->cascadeOnDelete();
            $table->string('event_key');
            $table->uuid('event_id');
            $table->string('idempotency_key')->nullable();
            $table->json('payload');
            $table->string('status', 32)->default('pending'); // pending, delivered, failed, giving_up
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->text('response_body')->nullable();
            $table->json('response_headers')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('next_retry_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index(['account_id', 'created_at'], 'tenant_webhook_deliveries_account_created_idx');
            $table->index(['tenant_webhook_endpoint_id', 'status'], 'tenant_webhook_deliveries_endpoint_status_idx');
            $table->index(['event_key', 'created_at'], 'tenant_webhook_deliveries_event_created_idx');
            $table->unique(['tenant_webhook_endpoint_id', 'event_id'], 'tenant_webhook_deliveries_endpoint_event_uq');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_webhook_deliveries');
        Schema::dropIfExists('tenant_webhook_subscriptions');
        Schema::dropIfExists('tenant_webhook_endpoints');
    }
};

