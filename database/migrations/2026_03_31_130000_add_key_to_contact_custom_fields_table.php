<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_custom_fields', function (Blueprint $table) {
            $table->string('key')->nullable()->after('account_id');
        });

        $fields = DB::table('contact_custom_fields')
            ->select('id', 'account_id', 'name')
            ->orderBy('account_id')
            ->orderBy('id')
            ->get();

        $seen = [];
        foreach ($fields as $field) {
            $base = Str::slug((string) $field->name, '_');
            if ($base === '') {
                $base = 'field';
            }

            $bucket = $field->account_id . ':' . $base;
            $seen[$bucket] = ($seen[$bucket] ?? 0) + 1;
            $key = $seen[$bucket] === 1 ? $base : "{$base}_{$seen[$bucket]}";

            DB::table('contact_custom_fields')
                ->where('id', $field->id)
                ->update(['key' => $key]);
        }

        Schema::table('contact_custom_fields', function (Blueprint $table) {
            $table->unique(['account_id', 'key']);
        });
    }

    public function down(): void
    {
        Schema::table('contact_custom_fields', function (Blueprint $table) {
            $table->dropUnique(['account_id', 'key']);
            $table->dropColumn('key');
        });
    }
};
