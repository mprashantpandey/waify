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
        Schema::create('account_api_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->string('name')->comment('Label for the key (e.g. Production, CI)');
            $table->string('key_hash', 64)->comment('SHA-256 hash of the secret key');
            $table->string('key_prefix', 12)->comment('Prefix shown in UI (e.g. wfy_abc1...)');
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
            $table->unique(['account_id', 'key_hash']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('account_api_keys');
    }
};
