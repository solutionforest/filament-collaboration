<?php

declare(strict_types=1);

namespace Demo\Trix;

use Filament\Forms\Components\Field;

/** A Trix editor whose state is HTML. */
class TrixEditor extends Field
{
    protected string $view = 'demo-trix::editor';
}
