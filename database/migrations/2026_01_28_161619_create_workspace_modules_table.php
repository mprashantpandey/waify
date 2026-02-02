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
        Schema::create('workspace_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
            $table->string('module_key');
            $table->boolean('enabled')->default(true);
            $table->json('config')->nullable();
            $table->timestamps();

            $table->unique(['workspace_id', 'module_key']);
            $table->foreign('module_key')->references('key')->on('modules')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workspace_modules');
    }
};
