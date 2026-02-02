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
        Schema::create('whatsapp_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->onDelete('cascade');
            $table->string('wa_id'); // WhatsApp user id
            $table->string('name')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['workspace_id', 'wa_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_contacts');
    }
};
