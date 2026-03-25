<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('whatsapp_connections')) {
            return;
        }

        Schema::table('whatsapp_connections', function (Blueprint $table) {
            if (!Schema::hasColumn('whatsapp_connections', 'token_type')) {
                $table->string('token_type', 40)->nullable()->after('access_token_encrypted');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'token_source')) {
                $table->string('token_source', 80)->nullable()->after('token_type');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'token_last_validated_at')) {
                $table->timestamp('token_last_validated_at')->nullable()->after('token_source');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'token_metadata')) {
                $table->json('token_metadata')->nullable()->after('token_last_validated_at');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('whatsapp_connections')) {
            return;
        }

        Schema::table('whatsapp_connections', function (Blueprint $table) {
            foreach (['token_type', 'token_source', 'token_last_validated_at', 'token_metadata'] as $column) {
                if (Schema::hasColumn('whatsapp_connections', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
