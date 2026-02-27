<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('whatsapp_webhook_events')) {
            return;
        }

        Schema::create('whatsapp_webhook_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('account_id')->nullable()->index();
            $table->unsignedBigInteger('whatsapp_connection_id')->index();
            $table->string('correlation_id', 120)->nullable()->index();
            $table->string('status', 32)->default('received')->index();
            $table->json('payload')->nullable();
            $table->unsignedInteger('payload_size')->default(0);
            $table->string('ip', 64)->nullable();
            $table->text('user_agent')->nullable();
            $table->text('error_message')->nullable();
            $table->unsignedInteger('replay_count')->default(0);
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('last_replayed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_webhook_events');
    }
};
