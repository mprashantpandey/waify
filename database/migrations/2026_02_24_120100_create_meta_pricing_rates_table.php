<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meta_pricing_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meta_pricing_version_id')->constrained('meta_pricing_versions')->cascadeOnDelete();
            $table->string('category');
            $table->string('pricing_model')->nullable();
            $table->integer('amount_minor')->default(0);
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique(['meta_pricing_version_id', 'category'], 'meta_pricing_rates_version_category_unique');
            $table->index(['category', 'pricing_model'], 'meta_pricing_rates_category_model_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meta_pricing_rates');
    }
};

