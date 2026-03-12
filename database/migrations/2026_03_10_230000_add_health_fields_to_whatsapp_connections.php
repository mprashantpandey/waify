<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_connections', function (Blueprint $table) {
            if (!Schema::hasColumn('whatsapp_connections', 'quality_rating')) {
                $table->string('quality_rating')->nullable()->after('webhook_last_lag_seconds');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'messaging_limit_tier')) {
                $table->string('messaging_limit_tier')->nullable()->after('quality_rating');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'account_review_status')) {
                $table->string('account_review_status')->nullable()->after('messaging_limit_tier');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'business_verification_status')) {
                $table->string('business_verification_status')->nullable()->after('account_review_status');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'code_verification_status')) {
                $table->string('code_verification_status')->nullable()->after('business_verification_status');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'display_name_status')) {
                $table->string('display_name_status')->nullable()->after('code_verification_status');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'restriction_state')) {
                $table->string('restriction_state')->nullable()->after('display_name_status');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'warning_state')) {
                $table->string('warning_state')->nullable()->after('restriction_state');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'health_state')) {
                $table->string('health_state')->default('unknown')->after('warning_state');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'health_last_synced_at')) {
                $table->timestamp('health_last_synced_at')->nullable()->after('health_state');
            }
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_connections', function (Blueprint $table) {
            foreach ([
                'quality_rating',
                'messaging_limit_tier',
                'account_review_status',
                'business_verification_status',
                'code_verification_status',
                'display_name_status',
                'restriction_state',
                'warning_state',
                'health_state',
                'health_last_synced_at',
            ] as $column) {
                if (Schema::hasColumn('whatsapp_connections', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

