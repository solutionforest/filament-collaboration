<?php

declare(strict_types=1);

namespace Demo\Quill;

use Filament\Forms\Components\Field;

/** A Quill editor whose state is HTML. */
class QuillEditor extends Field
{
    protected string $view = 'demo-quill::editor';
}
