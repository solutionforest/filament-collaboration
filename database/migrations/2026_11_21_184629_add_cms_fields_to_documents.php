<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table): void {
            $table->string('slug')->nullable();
            $table->string('category')->default('News');
            $table->string('status')->default('draft')->index();
            $table->text('excerpt')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table): void {
            $table->dropColumn(['slug', 'category', 'status', 'excerpt']);
        });
    }
};
