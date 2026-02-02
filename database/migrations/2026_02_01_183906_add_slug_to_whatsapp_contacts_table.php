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
        Schema::table('whatsapp_contacts', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('id');
        });

        // Generate slugs for existing contacts based on wa_id or name
        \DB::statement('
            UPDATE whatsapp_contacts 
            SET slug = CONCAT(
                LOWER(REPLACE(COALESCE(wa_id, name, "contact"), " ", "-")), 
                "-",
                id
            )
            WHERE slug IS NULL
        ');
        
        // Make slug unique and non-nullable after populating
        Schema::table('whatsapp_contacts', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whatsapp_contacts', function (Blueprint $table) {
            $table->dropIndex(['slug']);
            $table->dropColumn('slug');
        });
    }
};
