<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_templates', function (Blueprint $table) {
            if (!Schema::hasColumn('whatsapp_templates', 'last_meta_sync_at')) {
                $table->timestamp('last_meta_sync_at')->nullable()->after('last_synced_at');
            }
            if (!Schema::hasColumn('whatsapp_templates', 'remote_status')) {
                $table->string('remote_status')->nullable()->after('status');
            }
            if (!Schema::hasColumn('whatsapp_templates', 'sync_state')) {
                $table->string('sync_state')->default('unknown')->after('remote_status');
            }
            if (!Schema::hasColumn('whatsapp_templates', 'is_remote_deleted')) {
                $table->boolean('is_remote_deleted')->default(false)->after('sync_state');
            }
            if (!Schema::hasColumn('whatsapp_templates', 'remote_deleted_at')) {
                $table->timestamp('remote_deleted_at')->nullable()->after('is_remote_deleted');
            }
            if (!Schema::hasColumn('whatsapp_templates', 'remote_components')) {
                $table->json('remote_components')->nullable()->after('components');
            }
            if (!Schema::hasColumn('whatsapp_templates', 'draft_components')) {
                $table->json('draft_components')->nullable()->after('remote_components');
            }
            if (!Schema::hasColumn('whatsapp_templates', 'meta_rejection_reason')) {
                $table->text('meta_rejection_reason')->nullable()->after('last_meta_error');
            }
        });

        Schema::table('whatsapp_templates', function (Blueprint $table) {
            $table->index(['account_id', 'sync_state'], 'wa_tpl_account_sync_state_idx');
            $table->index(['whatsapp_connection_id', 'is_remote_deleted'], 'wa_tpl_conn_remote_deleted_idx');
            $table->index(['account_id', 'last_meta_sync_at'], 'wa_tpl_account_meta_sync_idx');
        });

        Schema::table('whatsapp_connections', function (Blueprint $table) {
            if (!Schema::hasColumn('whatsapp_connections', 'templates_last_synced_at')) {
                $table->timestamp('templates_last_synced_at')->nullable()->after('health_last_synced_at');
            }
            if (!Schema::hasColumn('whatsapp_connections', 'templates_last_sync_error')) {
                $table->text('templates_last_sync_error')->nullable()->after('templates_last_synced_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_templates', function (Blueprint $table) {
            foreach ([
                'wa_tpl_account_sync_state_idx',
                'wa_tpl_conn_remote_deleted_idx',
                'wa_tpl_account_meta_sync_idx',
            ] as $index) {
                try {
                    $table->dropIndex($index);
                } catch (\Throwable $e) {
                    // no-op
                }
            }
        });

        Schema::table('whatsapp_templates', function (Blueprint $table) {
            foreach ([
                'last_meta_sync_at',
                'remote_status',
                'sync_state',
                'is_remote_deleted',
                'remote_deleted_at',
                'remote_components',
                'draft_components',
                'meta_rejection_reason',
            ] as $column) {
                if (Schema::hasColumn('whatsapp_templates', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('whatsapp_connections', function (Blueprint $table) {
            foreach ([
                'templates_last_synced_at',
                'templates_last_sync_error',
            ] as $column) {
                if (Schema::hasColumn('whatsapp_connections', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

