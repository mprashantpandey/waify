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
        // Add slug column as nullable first
        Schema::table('campaigns', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('id');
        });

        // Generate slugs for existing campaigns based on name
        \DB::statement('
            UPDATE campaigns 
            SET slug = CONCAT(
                LOWER(REPLACE(REPLACE(COALESCE(name, "campaign"), " ", "-"), "_", "-")), 
                "-",
                id
            )
            WHERE slug IS NULL
        ');
        
        // Make slug unique and non-nullable after populating
        Schema::table('campaigns', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropIndex(['slug']);
            $table->dropColumn('slug');
        });
    }
};
