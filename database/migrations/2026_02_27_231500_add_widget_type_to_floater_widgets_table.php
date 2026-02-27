<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('floater_widgets', function (Blueprint $table) {
            $table->string('widget_type', 24)->default('floater')->after('name');
            $table->index(['account_id', 'is_active', 'widget_type'], 'floater_widgets_account_active_type_idx');
        });
    }

    public function down(): void
    {
        Schema::table('floater_widgets', function (Blueprint $table) {
            $table->dropIndex('floater_widgets_account_active_type_idx');
            $table->dropColumn('widget_type');
        });
    }
};
