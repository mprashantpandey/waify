<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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

