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
        Schema::create('workspace_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
            $table->foreignId('addon_id')->constrained('plan_addons')->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->string('status')->default('active'); // active|canceled
            $table->timestamp('started_at');
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();

            $table->unique(['workspace_id', 'addon_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workspace_addons');
    }
};
