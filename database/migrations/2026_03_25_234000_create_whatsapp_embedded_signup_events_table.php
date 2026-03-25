<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('whatsapp_embedded_signup_events')) {
            return;
        }

        Schema::create('whatsapp_embedded_signup_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('account_id')->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->unsignedBigInteger('whatsapp_connection_id')->nullable()->index();
            $table->string('event', 120)->index();
            $table->string('status', 40)->index();
            $table->string('current_step', 120)->nullable()->index();
            $table->string('waba_id', 255)->nullable()->index();
            $table->string('phone_number_id', 255)->nullable()->index();
            $table->text('message')->nullable();
            $table->json('payload')->nullable();
            $table->string('ip_address', 64)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_embedded_signup_events');
    }
};
