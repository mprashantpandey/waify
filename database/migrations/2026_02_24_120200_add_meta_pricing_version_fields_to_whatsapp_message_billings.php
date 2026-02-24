<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('whatsapp_message_billings')) {
            Schema::create('whatsapp_message_billings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('account_id')->constrained()->onDelete('cascade');
                $table->string('meta_message_id');
                $table->foreignId('whatsapp_message_id')->nullable()->constrained('whatsapp_messages')->nullOnDelete();
                $table->foreignId('campaign_message_id')->nullable()->constrained('campaign_messages')->nullOnDelete();
                $table->boolean('billable')->default(false);
                $table->string('category')->nullable();
                $table->string('pricing_model')->nullable();
                $table->foreignId('meta_pricing_version_id')->nullable()->constrained('meta_pricing_versions')->nullOnDelete();
                $table->string('pricing_country_code', 2)->nullable();
                $table->string('pricing_currency', 3)->nullable();
                $table->integer('rate_minor')->default(0);
                $table->integer('estimated_cost_minor')->default(0);
                $table->json('meta')->nullable();
                $table->timestamp('counted_at')->nullable();
                $table->timestamps();

                $table->unique(['account_id', 'meta_message_id']);
                $table->index(['account_id', 'billable']);
                $table->index(['account_id', 'category']);
            });

            return;
        }

        Schema::table('whatsapp_message_billings', function (Blueprint $table) {
            if (!Schema::hasColumn('whatsapp_message_billings', 'meta_pricing_version_id')) {
                $table->foreignId('meta_pricing_version_id')
                    ->nullable()
                    ->after('pricing_model')
                    ->constrained('meta_pricing_versions')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('whatsapp_message_billings', 'pricing_country_code')) {
                $table->string('pricing_country_code', 2)->nullable()->after('meta_pricing_version_id');
            }

            if (!Schema::hasColumn('whatsapp_message_billings', 'pricing_currency')) {
                $table->string('pricing_currency', 3)->nullable()->after('pricing_country_code');
            }

            if (!Schema::hasColumn('whatsapp_message_billings', 'rate_minor')) {
                $table->integer('rate_minor')->default(0)->after('pricing_currency');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('whatsapp_message_billings')) {
            return;
        }

        Schema::table('whatsapp_message_billings', function (Blueprint $table) {
            foreach (['meta_pricing_version_id', 'pricing_country_code', 'pricing_currency', 'rate_minor'] as $column) {
                if (Schema::hasColumn('whatsapp_message_billings', $column)) {
                    if ($column === 'meta_pricing_version_id') {
                        try {
                            $table->dropConstrainedForeignId($column);
                        } catch (\Throwable $e) {
                            $table->dropColumn($column);
                        }
                    } else {
                        $table->dropColumn($column);
                    }
                }
            }
        });
    }
};
