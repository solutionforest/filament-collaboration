<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

/** A static page of the site, in English and Chinese. */
class Page extends Model
{
    use HasTranslations;

    /** @var list<string> */
    public array $translatable = ['title', 'summary', 'body'];

    protected $fillable = ['slug', 'title', 'summary', 'body'];
}
