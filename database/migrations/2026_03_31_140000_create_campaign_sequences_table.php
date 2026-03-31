<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaign_sequences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('whatsapp_connection_id')->nullable()->constrained('whatsapp_connections')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('slug');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('status', ['draft', 'active', 'paused'])->default('draft');
            $table->enum('audience_type', ['contacts', 'segment', 'custom'])->default('contacts');
            $table->json('audience_filters')->nullable();
            $table->json('custom_recipients')->nullable();
            $table->unsignedInteger('enrolled_count')->default(0);
            $table->unsignedInteger('active_enrollment_count')->default(0);
            $table->unsignedInteger('completed_enrollment_count')->default(0);
            $table->unsignedInteger('failed_enrollment_count')->default(0);
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('paused_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['account_id', 'slug']);
            $table->index(['account_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_sequences');
    }
};
