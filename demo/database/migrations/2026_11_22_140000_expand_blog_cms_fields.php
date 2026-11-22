<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table): void {
            $table->foreignId('author_id')->nullable()->after('workspace_id')->constrained('users')->nullOnDelete();
            $table->longText('body_html')->nullable()->after('excerpt');
            $table->string('featured_image_url')->nullable()->after('body_html');
            $table->json('tags')->nullable()->after('featured_image_url');
            $table->timestamp('published_at')->nullable()->index()->after('tags');
            $table->string('seo_title')->nullable()->after('published_at');
            $table->text('seo_description')->nullable()->after('seo_title');
            $table->string('seo_keywords')->nullable()->after('seo_description');
            $table->string('canonical_url')->nullable()->after('seo_keywords');
            $table->boolean('robots_noindex')->default(false)->after('canonical_url');
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
        Schema::table('documents', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('author_id');
            $table->dropColumn([
                'body_html',
                'featured_image_url',
                'tags',
                'published_at',
                'seo_title',
                'seo_description',
                'seo_keywords',
                'canonical_url',
                'robots_noindex',
            ]);
        });
    }
};
