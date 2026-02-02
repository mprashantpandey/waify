<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if slug column already exists (from failed migration)
        if (!Schema::hasColumn('subscriptions', 'slug')) {
            // Add slug column as nullable first
            Schema::table('subscriptions', function (Blueprint $table) {
                $table->string('slug')->nullable()->after('id');
            });
        }

        // Generate slugs for existing subscriptions
        \DB::statement('UPDATE subscriptions SET slug = CONCAT("sub-", id) WHERE slug IS NULL');
        
        // Check if unique index exists, drop it if it does
        $indexes = \DB::select("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='subscriptions' AND name LIKE '%slug%'");
        foreach ($indexes as $index) {
            \DB::statement("DROP INDEX IF EXISTS {$index->name}");
        }
        
        // Make slug unique and non-nullable after populating
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop unique index if it exists
        $indexes = \DB::select("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='subscriptions' AND name LIKE '%slug%'");
        foreach ($indexes as $index) {
            \DB::statement("DROP INDEX IF EXISTS {$index->name}");
        }
        
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
