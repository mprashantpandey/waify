<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('whatsapp_outbound_message_jobs')) {
            return;
        }

        Schema::create('whatsapp_outbound_message_jobs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('account_id')->index();
            $table->unsignedBigInteger('whatsapp_connection_id')->nullable()->index();
            $table->unsignedBigInteger('whatsapp_conversation_id')->nullable()->index();
            $table->unsignedBigInteger('whatsapp_message_id')->nullable()->index();
            $table->unsignedBigInteger('campaign_id')->nullable()->index();
            $table->unsignedBigInteger('campaign_recipient_id')->nullable()->index();
            $table->string('channel', 40)->default('whatsapp_meta')->index();
            $table->string('message_type', 40)->index(); // text, template, image, video, document, location, list, buttons
            $table->string('status', 40)->default('queued')->index(); // queued, validating, sending, sent_to_provider, delivered, read, failed
            $table->string('to_wa_id', 40)->nullable()->index();
            $table->string('meta_message_id', 191)->nullable()->index();
            $table->string('client_request_id', 120)->nullable()->index();
            $table->string('idempotency_key', 120)->nullable()->index();
            $table->unsignedInteger('attempt_count')->default(0);
            $table->unsignedInteger('retry_count')->default(0);
            $table->timestamp('queued_at')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->timestamp('sending_at')->nullable();
            $table->timestamp('sent_to_provider_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->json('request_payload')->nullable();
            $table->json('provider_response')->nullable();
            $table->json('provider_error_payload')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->unique(['account_id', 'idempotency_key'], 'wa_outbound_jobs_account_idem_uq');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_outbound_message_jobs');
    }
};

