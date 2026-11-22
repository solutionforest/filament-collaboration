<?php

declare(strict_types=1);

namespace App\Models;

use Filament\Forms\Components\RichEditor\RichContentRenderer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Document extends Model
{
    protected $attributes = [
        'workspace_id' => 1,
        'category' => 'News',
        'status' => 'draft',
        'robots_noindex' => false,
    ];

    protected $fillable = [
        'title',
        'workspace_id',
        'author_id',
        'slug',
        'category',
        'status',
        'excerpt',
        'body_html',
        'featured_image_url',
        'tags',
        'published_at',
        'seo_title',
        'seo_description',
        'seo_keywords',
        'canonical_url',
        'robots_noindex',
    ];

    protected function casts(): array
    {
        return [
            'workspace_id' => 'integer',
            'author_id' => 'integer',
            'tags' => 'array',
            'published_at' => 'datetime',
            'robots_noindex' => 'boolean',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /** @return BelongsToMany<Document, $this> */
    public function relatedPosts(): BelongsToMany
    {
        return $this->belongsToMany(
            self::class,
            'document_relations',
            'document_id',
            'related_document_id',
        )->withPivot('position')->withTimestamps()->orderByPivot('position');
    }

    /**
     * @param  Builder<Document>  $query
     * @return Builder<Document>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function seoTitle(): string
    {
        return filled($this->seo_title) ? (string) $this->seo_title : (string) $this->title;
    }

    public function seoDescription(): string
    {
        if (filled($this->seo_description)) {
            return (string) $this->seo_description;
        }

        return (string) ($this->excerpt ?? '');
    }

    public function bodyHtml(): string
    {
        return filled($this->body_html) ? RichContentRenderer::make((string) $this->body_html)->toHtml() : '';
    }

    public function publicUrl(): string
    {
        return route('blog.show', ['slug' => $this->slug ?: $this->getKey()]);
    }
}
