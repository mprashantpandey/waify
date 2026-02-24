<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('account_api_keys')) {
            return;
        }

        Schema::table('account_api_keys', function (Blueprint $table) {
            if (!Schema::hasColumn('account_api_keys', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('key_prefix');
            }
            if (!Schema::hasColumn('account_api_keys', 'scopes')) {
                $table->json('scopes')->nullable()->after('is_active');
            }
            if (!Schema::hasColumn('account_api_keys', 'expires_at')) {
                $table->timestamp('expires_at')->nullable()->after('last_used_at');
            }
            if (!Schema::hasColumn('account_api_keys', 'revoked_at')) {
                $table->timestamp('revoked_at')->nullable()->after('expires_at');
            }
            if (!Schema::hasColumn('account_api_keys', 'last_used_ip')) {
                $table->string('last_used_ip', 45)->nullable()->after('last_used_at');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('account_api_keys')) {
            return;
        }

        Schema::table('account_api_keys', function (Blueprint $table) {
            foreach (['last_used_ip', 'revoked_at', 'expires_at', 'scopes', 'is_active'] as $column) {
                if (Schema::hasColumn('account_api_keys', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

