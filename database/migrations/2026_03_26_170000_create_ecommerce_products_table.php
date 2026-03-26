<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ecommerce_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->string('sku')->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('price')->default(0);
            $table->string('currency', 3)->default('INR');
            $table->enum('status', ['draft', 'active', 'archived'])->default('draft');
            $table->unsignedInteger('stock')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['account_id', 'slug']);
            $table->index(['account_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ecommerce_products');
    }
};

