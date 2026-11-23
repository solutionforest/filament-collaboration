<?php

declare(strict_types=1);

namespace Demo\TinyMce;

use Filament\Forms\Components\Field;

/** A TinyMCE editor whose state is HTML. */
class TinyMceEditor extends Field
{
    protected string $view = 'demo-tinymce::editor';
}
