<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_log_saved_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('account_id')->nullable()->constrained()->nullOnDelete();
            $table->string('scope', 20); // tenant | platform
            $table->string('kind', 20)->default('preset'); // preset | correlation
            $table->string('name');
            $table->string('correlation_id')->nullable();
            $table->json('filters')->nullable();
            $table->boolean('is_shared')->default(false);
            $table->timestamps();

            $table->index(['scope', 'account_id']);
            $table->index(['scope', 'user_id']);
            $table->index(['scope', 'kind']);
            $table->index(['scope', 'correlation_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_log_saved_views');
    }
};

