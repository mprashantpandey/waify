<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('operational_alert_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_key', 120);
            $table->string('title', 255);
            $table->string('severity', 24)->default('warning');
            $table->string('scope', 255)->nullable();
            $table->string('dedupe_key', 80)->index();
            $table->string('status', 24)->default('sent'); // sent|skipped|failed
            $table->json('channels')->nullable();
            $table->json('context')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['event_key', 'created_at']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operational_alert_events');
    }
};
