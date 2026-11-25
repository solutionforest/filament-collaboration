<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Articles keep the category's name, so renaming a category renames it on its articles.
        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('color', 7)->default('#1f7a55');
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();
        });

        // Articles keep their tags' names in a JSON list, as the tags input edits them.
        Schema::create('tags', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->string('slug')->nullable()->unique();
            $table->string('job_title')->nullable();
            $table->text('bio')->nullable();
        });

        Schema::table('documents', function (Blueprint $table): void {
            $table->string('cover_image')->nullable();
            $table->string('cover_alt')->nullable();
        });

        Schema::table('documents', function (Blueprint $table): void {
            $table->dropColumn('featured_image_url');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table): void {
            $table->string('featured_image_url', 2048)->nullable();
            $table->dropColumn(['cover_image', 'cover_alt']);
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['slug']);
            $table->dropColumn(['slug', 'job_title', 'bio']);
        });

        Schema::dropIfExists('tags');
        Schema::dropIfExists('categories');
    }
};
