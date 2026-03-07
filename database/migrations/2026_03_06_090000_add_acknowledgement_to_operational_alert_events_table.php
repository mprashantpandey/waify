<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('operational_alert_events', function (Blueprint $table) {
            $table->timestamp('acknowledged_at')->nullable()->after('sent_at');
            $table->foreignId('acknowledged_by')->nullable()->after('acknowledged_at')->constrained('users')->nullOnDelete();
            $table->index(['acknowledged_at', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('operational_alert_events', function (Blueprint $table) {
            $table->dropConstrainedForeignId('acknowledged_by');
            $table->dropIndex(['acknowledged_at', 'created_at']);
            $table->dropColumn('acknowledged_at');
        });
    }
};
