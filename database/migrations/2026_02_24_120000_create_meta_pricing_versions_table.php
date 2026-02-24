<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meta_pricing_versions', function (Blueprint $table) {
            $table->id();
            $table->string('provider')->default('meta_whatsapp');
            $table->string('country_code', 2)->nullable();
            $table->string('currency', 3)->default('INR');
            $table->timestamp('effective_from');
            $table->timestamp('effective_to')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['provider', 'country_code', 'is_active'], 'meta_pricing_versions_provider_country_active_idx');
            $table->index(['effective_from', 'effective_to'], 'meta_pricing_versions_effective_window_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meta_pricing_versions');
    }
};

