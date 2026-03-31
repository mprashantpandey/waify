<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('google_sheets_integrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('spreadsheet_id');
            $table->string('sheet_name');
            $table->string('service_account_email');
            $table->longText('service_account_private_key_encrypted')->nullable();
            $table->string('service_account_client_id')->nullable();
            $table->string('project_id')->nullable();
            $table->json('event_keys')->nullable();
            $table->boolean('append_headers')->default(true);
            $table->boolean('include_payload_json')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_delivery_at')->nullable();
            $table->text('last_delivery_error')->nullable();
            $table->timestamps();

            $table->index(['account_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('google_sheets_integrations');
    }
};
