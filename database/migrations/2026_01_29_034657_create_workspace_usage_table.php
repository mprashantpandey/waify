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
        Schema::create('workspace_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
            $table->string('period'); // "2026-01"
            $table->integer('messages_sent')->default(0);
            $table->integer('template_sends')->default(0);
            $table->integer('ai_credits_used')->default(0);
            $table->bigInteger('storage_bytes')->default(0);
            $table->timestamps();

            $table->unique(['workspace_id', 'period']);
            $table->index('period');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workspace_usage');
    }
};
