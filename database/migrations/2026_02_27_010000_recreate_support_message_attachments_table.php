<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('support_message_attachments')) {
            Schema::create('support_message_attachments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('support_message_id')->constrained('support_messages')->onDelete('cascade');
                $table->string('file_name');
                $table->string('file_path');
                $table->string('mime_type')->nullable();
                $table->unsignedBigInteger('file_size')->default(0);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        // No destructive rollback for support ticket attachments.
    }
};
