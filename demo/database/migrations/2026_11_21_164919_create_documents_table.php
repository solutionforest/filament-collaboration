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

        Schema::create('documents', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('workspace_id')->default(1)->index();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->nullable();
            $table->string('category')->default('News');
            $table->string('status')->default('draft')->index();
            $table->text('excerpt')->nullable();
            $table->longText('body_html')->nullable();
            $table->string('featured_image_url', 2048)->nullable();
            $table->json('tags')->nullable();
            $table->timestamp('published_at')->nullable()->index();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('seo_keywords')->nullable();
            $table->string('canonical_url', 2048)->nullable();
            $table->boolean('robots_noindex')->default(false);
            $table->timestamps();
        });

        Schema::create('document_relations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();
            $table->foreignId('related_document_id')->constrained('documents')->cascadeOnDelete();
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();
            $table->unique(['document_id', 'related_document_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_relations');
        Schema::dropIfExists('documents');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('workspace_id'));
    }
};
