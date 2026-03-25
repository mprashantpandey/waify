<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('whatsapp_connections') || !Schema::hasColumn('whatsapp_connections', 'webhook_verify_token')) {
            return;
        }

        Schema::table('whatsapp_connections', function (Blueprint $table) {
            try {
                $table->dropUnique('whatsapp_connections_webhook_verify_token_unique');
            } catch (\Throwable) {
                // Ignore if already dropped.
            }
        });

        Schema::table('whatsapp_connections', function (Blueprint $table) {
            $table->string('webhook_verify_token')->nullable()->change();
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('whatsapp_connections') || !Schema::hasColumn('whatsapp_connections', 'webhook_verify_token')) {
            return;
        }

        Schema::table('whatsapp_connections', function (Blueprint $table) {
            $table->string('webhook_verify_token')->nullable(false)->change();
        });

        Schema::table('whatsapp_connections', function (Blueprint $table) {
            try {
                $table->unique('webhook_verify_token', 'whatsapp_connections_webhook_verify_token_unique');
            } catch (\Throwable) {
                // Ignore if already exists.
            }
        });
    }
};
