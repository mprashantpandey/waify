<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaign_sequence_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_sequence_id')->constrained('campaign_sequences')->cascadeOnDelete();
            $table->foreignId('whatsapp_contact_id')->nullable()->constrained('whatsapp_contacts')->nullOnDelete();
            $table->string('wa_id');
            $table->string('name')->nullable();
            $table->enum('status', ['active', 'paused', 'completed', 'failed'])->default('active');
            $table->unsignedInteger('sent_steps_count')->default(0);
            $table->timestamp('enrolled_at')->nullable();
            $table->timestamp('last_step_sent_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->string('failure_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['campaign_sequence_id', 'wa_id'], 'campaign_sequence_enrollment_unique');
            $table->index(['campaign_sequence_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_sequence_enrollments');
    }
};
