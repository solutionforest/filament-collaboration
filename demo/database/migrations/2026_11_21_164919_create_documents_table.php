<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->timestamps();
        });
        Schema::create('collaboration_updates', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();
            $table->text('update');
            $table->timestamps();
        });
        Schema::create('collaboration_presence', function (Blueprint $table): void {
            $table->string('session_id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('page', 20);
            $table->timestamp('seen_at')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collaboration_presence');
        Schema::dropIfExists('collaboration_updates');
        Schema::dropIfExists('documents');
    }
};
