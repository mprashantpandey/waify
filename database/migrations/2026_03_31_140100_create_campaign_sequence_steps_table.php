<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaign_sequence_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_sequence_id')->constrained('campaign_sequences')->cascadeOnDelete();
            $table->unsignedInteger('step_order')->default(1);
            $table->unsignedInteger('delay_minutes')->default(0);
            $table->enum('type', ['text', 'template'])->default('text');
            $table->foreignId('whatsapp_template_id')->nullable()->constrained('whatsapp_templates')->nullOnDelete();
            $table->text('message_text')->nullable();
            $table->json('template_params')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['campaign_sequence_id', 'step_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_sequence_steps');
    }
};
