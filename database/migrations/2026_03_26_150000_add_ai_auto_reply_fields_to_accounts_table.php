<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table): void {
            if (!Schema::hasColumn('accounts', 'ai_auto_reply_enabled')) {
                $table->boolean('ai_auto_reply_enabled')->default(false)->after('auto_assign_strategy');
            }
            if (!Schema::hasColumn('accounts', 'ai_auto_reply_mode')) {
                $table->string('ai_auto_reply_mode', 50)->default('suggest_only')->after('ai_auto_reply_enabled');
            }
            if (!Schema::hasColumn('accounts', 'ai_auto_reply_prompt')) {
                $table->text('ai_auto_reply_prompt')->nullable()->after('ai_auto_reply_mode');
            }
            if (!Schema::hasColumn('accounts', 'ai_auto_reply_handoff_message')) {
                $table->text('ai_auto_reply_handoff_message')->nullable()->after('ai_auto_reply_prompt');
            }
            if (!Schema::hasColumn('accounts', 'ai_auto_reply_handoff_keywords')) {
                $table->json('ai_auto_reply_handoff_keywords')->nullable()->after('ai_auto_reply_handoff_message');
            }
            if (!Schema::hasColumn('accounts', 'ai_auto_reply_stop_when_assigned')) {
                $table->boolean('ai_auto_reply_stop_when_assigned')->default(true)->after('ai_auto_reply_handoff_keywords');
            }
        });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table): void {
            $columns = [
                'ai_auto_reply_enabled',
                'ai_auto_reply_mode',
                'ai_auto_reply_prompt',
                'ai_auto_reply_handoff_message',
                'ai_auto_reply_handoff_keywords',
                'ai_auto_reply_stop_when_assigned',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('accounts', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
