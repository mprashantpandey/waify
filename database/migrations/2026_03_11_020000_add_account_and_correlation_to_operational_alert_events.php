<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('operational_alert_events', function (Blueprint $table) {
            if (!Schema::hasColumn('operational_alert_events', 'account_id')) {
                $table->foreignId('account_id')
                    ->nullable()
                    ->after('id')
                    ->constrained()
                    ->nullOnDelete();
                $table->index(['account_id', 'created_at'], 'ops_alert_events_account_created_idx');
            }

            if (!Schema::hasColumn('operational_alert_events', 'correlation_id')) {
                $table->string('correlation_id', 120)->nullable()->after('dedupe_key');
                $table->index(['correlation_id'], 'ops_alert_events_corr_idx');
            }
        });
    }

    public function down(): void
    {
        Schema::table('operational_alert_events', function (Blueprint $table) {
            if (Schema::hasColumn('operational_alert_events', 'correlation_id')) {
                $table->dropIndex('ops_alert_events_corr_idx');
                $table->dropColumn('correlation_id');
            }

            if (Schema::hasColumn('operational_alert_events', 'account_id')) {
                $table->dropIndex('ops_alert_events_account_created_idx');
                $table->dropConstrainedForeignId('account_id');
            }
        });
    }
};

