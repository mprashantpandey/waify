<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Removes the support / live chat system: drops support tables and the support module.
     */
    public function up(): void
    {
        $tables = [
            'support_message_attachments',
            'support_messages',
            'support_audit_logs',
            'support_threads',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::dropIfExists($table);
            }
        }

        // Remove support module from modules table
        DB::table('modules')->where('key', 'support')->delete();

        // Remove 'support' from plan modules JSON
        $plans = DB::table('plans')->get();
        foreach ($plans as $plan) {
            $modules = json_decode($plan->modules ?? '[]', true);
            if (! is_array($modules)) {
                continue;
            }
            $updated = array_values(array_filter($modules, fn ($m) => $m !== 'support'));
            if (count($updated) !== count($modules)) {
                DB::table('plans')->where('id', $plan->id)->update(['modules' => json_encode($updated)]);
            }
        }
    }

    /**
     * Reverse the migrations.
     * We do not recreate support tables or module; rollback is a no-op for data safety.
     */
    public function down(): void
    {
        // Intentional no-op: support system was fully removed
    }
};
