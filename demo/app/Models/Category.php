<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A section of the blog. Articles keep its name, so renaming it renames theirs. */
class Category extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'color', 'position'];

    protected function casts(): array
    {
        return ['position' => 'integer'];
    }

    protected static function booted(): void
    {
        static::saving(function (Category $category): void {
            $category->slug = filled($category->slug) ? str($category->slug)->slug()->toString() : str($category->name)->slug()->toString();
        });

        static::updated(function (Category $category): void {
            if ($category->wasChanged('name')) {
                Document::withTrashed()->where('category', $category->getOriginal('name'))->update(['category' => $category->name]);
            }
        });
    }

    /** @return HasMany<Document, $this> */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'category', 'name');
    }

    public function publicUrl(): string
    {
        return route('blog.category', $this->slug);
    }

    /** The blog's first sections, until editors add their own. */
    public const STARTING = ['News', 'Guides', 'Stories'];

    /** @return array<string, string> name => name, in the order editors set */
    public static function options(): array
    {
        $names = array_map(fn (mixed $name): string => is_scalar($name) ? (string) $name : '', static::query()->orderBy('position')->orderBy('name')->pluck('name')->all());

        return array_combine($names ?: self::STARTING, $names ?: self::STARTING);
    }
}
