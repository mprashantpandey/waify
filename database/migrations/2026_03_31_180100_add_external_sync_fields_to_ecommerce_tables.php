<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ecommerce_products', function (Blueprint $table) {
            if (!Schema::hasColumn('ecommerce_products', 'external_source')) {
                $table->string('external_source')->nullable()->after('stock');
            }
            if (!Schema::hasColumn('ecommerce_products', 'external_id')) {
                $table->string('external_id')->nullable()->after('external_source');
            }
            $table->unique(['account_id', 'external_source', 'external_id'], 'ecommerce_products_external_unique');
        });

        Schema::table('ecommerce_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('ecommerce_orders', 'external_source')) {
                $table->string('external_source')->nullable()->after('source');
            }
            if (!Schema::hasColumn('ecommerce_orders', 'external_id')) {
                $table->string('external_id')->nullable()->after('external_source');
            }
            if (!Schema::hasColumn('ecommerce_orders', 'metadata')) {
                $table->json('metadata')->nullable()->after('ordered_at');
            }
            $table->unique(['account_id', 'external_source', 'external_id'], 'ecommerce_orders_external_unique');
        });
    }

    public function down(): void
    {
        Schema::table('ecommerce_orders', function (Blueprint $table) {
            $table->dropUnique('ecommerce_orders_external_unique');
            if (Schema::hasColumn('ecommerce_orders', 'metadata')) {
                $table->dropColumn('metadata');
            }
            if (Schema::hasColumn('ecommerce_orders', 'external_id')) {
                $table->dropColumn('external_id');
            }
            if (Schema::hasColumn('ecommerce_orders', 'external_source')) {
                $table->dropColumn('external_source');
            }
        });

        Schema::table('ecommerce_products', function (Blueprint $table) {
            $table->dropUnique('ecommerce_products_external_unique');
            if (Schema::hasColumn('ecommerce_products', 'external_id')) {
                $table->dropColumn('external_id');
            }
            if (Schema::hasColumn('ecommerce_products', 'external_source')) {
                $table->dropColumn('external_source');
            }
        });
    }
};
