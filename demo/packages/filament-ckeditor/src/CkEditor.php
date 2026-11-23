<?php

declare(strict_types=1);

namespace Demo\CkEditor;

use Filament\Forms\Components\Field;

/** A CKEditor 5 editor whose state is HTML. */
class CkEditor extends Field
{
    protected string $view = 'demo-ckeditor::editor';
}
