<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->unsignedBigInteger('workspace_id')->default(1)->index();
        });
        Schema::table('documents', function (Blueprint $table): void {
            $table->unsignedBigInteger('workspace_id')->default(1)->index();
        });
    }

    public function down(): void
    {
        Schema::table('documents', fn (Blueprint $table) => $table->dropColumn('workspace_id'));
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('workspace_id'));
    }
};
