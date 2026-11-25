<?php

declare(strict_types=1);

namespace App\Models;

use Filament\Forms\Components\RichEditor\RichContentRenderer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class Document extends Model
{
    // Deleting moves an article to the trash, where it can be restored with its shared draft.
    use SoftDeletes;

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
        'cover_image',
        'cover_alt',
        'tags',
        'published_at',
        'seo_title',
        'seo_description',
        'seo_keywords',
        'canonical_url',
        'robots_noindex',
        'key_points',
        'sidebar',
        'editor_notes',
        'newsletter_markdown',
        'embed_code',
        'tinymce_html',
        'ckeditor_html',
        'quill_html',
        'trix_html',
        'social_post',
        'rating',
        'gallery',
    ];

    protected function casts(): array
    {
        return [
            'workspace_id' => 'integer',
            'rating' => 'integer',
            'author_id' => 'integer',
            'tags' => 'array',
            'key_points' => 'array',
            'sidebar' => 'array',
            'gallery' => 'array',
            'published_at' => 'datetime',
            'robots_noindex' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        // A tag typed into an article joins the list of tags.
        static::saved(function (Document $document): void {
            if ($document->wasChanged('tags') || $document->wasRecentlyCreated) {
                Tag::ensure((array) ($document->tags ?? []));
            }
        });
    }

    /** @return BelongsTo<Category, $this> */
    public function categoryModel(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category', 'name');
    }

    /** @return Collection<int, Tag> */
    public function tagModels(): Collection
    {
        $names = array_filter((array) ($this->tags ?? []));

        return $names === [] ? new Collection : Tag::query()->whereIn('name', $names)->orderBy('name')->get();
    }

    public function coverUrl(): ?string
    {
        return filled($this->cover_image) ? Storage::disk('public')->url((string) $this->cover_image) : null;
    }

    /** At about 230 words a minute, rounded up. */
    public function readingMinutes(): int
    {
        return max(1, (int) ceil(str_word_count(strip_tags($this->bodyHtml())) / 230));
    }

    /** @return BelongsTo<User, $this> */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /** @return HasMany<Task, $this> */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
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
