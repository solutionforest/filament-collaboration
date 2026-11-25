<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/** A topic across sections. Articles keep their tags' names, as the tags input edits them. */
class Tag extends Model
{
    protected $fillable = ['name', 'slug', 'description'];

    protected static function booted(): void
    {
        static::saving(function (Tag $tag): void {
            $tag->slug = filled($tag->slug) ? str($tag->slug)->slug()->toString() : str($tag->name)->slug()->toString();
        });
    }

    /** @return Builder<Document> */
    public function documents(): Builder
    {
        return Document::query()->whereJsonContains('tags', $this->name);
    }

    public function publicUrl(): string
    {
        return route('blog.tag', $this->slug);
    }

    /**
     * Adds the tags typed into an article that the list does not have yet.
     *
     * @param  array<mixed>  $names
     */
    public static function ensure(array $names): void
    {
        foreach (array_unique(array_filter(array_map(fn (mixed $name): string => is_scalar($name) ? trim((string) $name) : '', $names))) as $name) {
            if (! static::query()->where('name', $name)->exists() && str($name)->slug()->isNotEmpty()) {
                $slug = str($name)->slug()->toString();
                static::query()->create(['name' => $name, 'slug' => static::query()->where('slug', $slug)->exists() ? $slug.'-'.substr(md5($name), 0, 4) : $slug]);
            }
        }
    }
}
