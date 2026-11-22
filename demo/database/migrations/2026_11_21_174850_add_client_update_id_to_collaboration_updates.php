<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('collaboration_updates', function (Blueprint $table): void {
            $table->uuid('client_update_id')->nullable();
            $table->unique(['document_id', 'client_update_id']);
        });
    }

    public function down(): void
    {
        Schema::table('collaboration_updates', function (Blueprint $table): void {
            $table->dropUnique(['document_id', 'client_update_id']);
            $table->dropColumn('client_update_id');
        });
    }
};
