<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            if (!Schema::hasColumn('accounts', 'phone_verification_required')) {
                $table->boolean('phone_verification_required')->default(false)->after('billing_currency');
            }
        });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            if (Schema::hasColumn('accounts', 'phone_verification_required')) {
                $table->dropColumn('phone_verification_required');
            }
        });
    }
};

