<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ecommerce_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('ecommerce_products')->nullOnDelete();
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('customer_wa_id')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedBigInteger('unit_price')->default(0);
            $table->unsignedBigInteger('total_price')->default(0);
            $table->string('currency', 3)->default('INR');
            $table->enum('status', ['pending', 'confirmed', 'paid', 'shipped', 'cancelled'])->default('pending');
            $table->string('source')->default('whatsapp');
            $table->text('notes')->nullable();
            $table->timestamp('ordered_at')->nullable();
            $table->timestamps();

            $table->index(['account_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ecommerce_orders');
    }
};

