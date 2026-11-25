<?php

declare(strict_types=1);

namespace App\Models;

use Filament\Forms\Components\RichEditor\RichContentRenderer;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

/** A static page of the site, in English and Chinese. */
class Page extends Model
{
    use HasTranslations;

    /** @var list<string> */
    public array $translatable = ['title', 'summary', 'body'];

    protected $fillable = ['slug', 'title', 'summary', 'body'];

    public function publicUrl(): string
    {
        return route('page', $this->slug);
    }

    /** The body, in the site's language, as safe HTML. */
    public function bodyHtml(): string
    {
        $body = $this->getTranslation('body', app()->getLocale(), true);

        return is_string($body) && $body !== '' ? RichContentRenderer::make($body)->toHtml() : '';
    }
}
