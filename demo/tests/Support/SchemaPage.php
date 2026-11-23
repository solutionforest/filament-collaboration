<?php

namespace Tests\Support;

use Filament\Schemas\Concerns\InteractsWithSchemas;
use Filament\Schemas\Contracts\HasSchemas;
use Livewire\Component;

/** A bare component for building schemas in tests. */
class SchemaPage extends Component implements HasSchemas
{
    use InteractsWithSchemas;

    /** @var array<string, mixed> */
    public array $data = [];

    public function render(): string
    {
        return '<div></div>';
    }
}
