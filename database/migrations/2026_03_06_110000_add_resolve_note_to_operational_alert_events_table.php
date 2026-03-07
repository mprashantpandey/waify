<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('operational_alert_events', function (Blueprint $table) {
            $table->text('resolve_note')->nullable()->after('acknowledged_by');
        });
    }

    public function down(): void
    {
        Schema::table('operational_alert_events', function (Blueprint $table) {
            $table->dropColumn('resolve_note');
        });
    }
};
