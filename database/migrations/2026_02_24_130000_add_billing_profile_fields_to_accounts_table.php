<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            if (!Schema::hasColumn('accounts', 'billing_country_code')) {
                $table->string('billing_country_code', 2)->nullable()->after('slug');
            }
            if (!Schema::hasColumn('accounts', 'billing_currency')) {
                $table->string('billing_currency', 3)->nullable()->after('billing_country_code');
            }
        });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            if (Schema::hasColumn('accounts', 'billing_currency')) {
                $table->dropColumn('billing_currency');
            }
            if (Schema::hasColumn('accounts', 'billing_country_code')) {
                $table->dropColumn('billing_country_code');
            }
        });
    }
};

