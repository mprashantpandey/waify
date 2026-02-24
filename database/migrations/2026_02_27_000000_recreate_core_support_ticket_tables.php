<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('support_threads')) {
            Schema::create('support_threads', function (Blueprint $table) {
                $table->id();
                $table->foreignId('account_id')->constrained()->onDelete('cascade');
                $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
                $table->string('slug')->unique();
                $table->string('subject');
                $table->string('status')->default('open');
                $table->string('priority')->default('normal');
                $table->string('category')->nullable();
                $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('last_message_at')->nullable();
                $table->timestamps();

                $table->index(['account_id', 'status']);
                $table->index(['account_id', 'last_message_at']);
            });
        }

        if (!Schema::hasTable('support_messages')) {
            Schema::create('support_messages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('support_thread_id')->constrained('support_threads')->onDelete('cascade');
                $table->string('sender_type', 32);
                $table->foreignId('sender_id')->nullable()->constrained('users')->nullOnDelete();
                $table->text('body');
                $table->json('metadata')->nullable();
                $table->timestamps();

                $table->index(['support_thread_id', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        // Keep support ticket data safe; no destructive rollback.
    }
};
