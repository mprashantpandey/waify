<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_connections', function (Blueprint $table) {
            if (!Schema::hasColumn('whatsapp_connections', 'provisioning_step')) {
                $table->string('provisioning_step')->nullable()->after('activation_updated_at');
            }

            if (!Schema::hasColumn('whatsapp_connections', 'provisioning_status')) {
                $table->string('provisioning_status')->default('pending')->after('provisioning_step');
            }

            if (!Schema::hasColumn('whatsapp_connections', 'provisioning_last_error')) {
                $table->text('provisioning_last_error')->nullable()->after('provisioning_status');
            }

            if (!Schema::hasColumn('whatsapp_connections', 'provisioning_context')) {
                $table->json('provisioning_context')->nullable()->after('provisioning_last_error');
            }

            if (!Schema::hasColumn('whatsapp_connections', 'provisioning_completed_at')) {
                $table->timestamp('provisioning_completed_at')->nullable()->after('provisioning_context');
            }
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_connections', function (Blueprint $table) {
            $columns = [
                'provisioning_completed_at',
                'provisioning_context',
                'provisioning_last_error',
                'provisioning_status',
                'provisioning_step',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('whatsapp_connections', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
