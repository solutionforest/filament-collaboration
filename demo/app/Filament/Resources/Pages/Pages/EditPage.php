<?php

declare(strict_types=1);

namespace App\Filament\Resources\Pages\Pages;

use App\Filament\Resources\Pages\PageResource;
use Filament\Resources\Pages\EditRecord;
use LaraZeus\SpatieTranslatable\Actions\LocaleSwitcher;
use LaraZeus\SpatieTranslatable\Resources\Pages\EditRecord\Concerns\Translatable;
use SolutionForest\FilamentCollaboration\Concerns\InteractsWithCollaboration;

/** Each language is its own shared draft: two people can edit English and Chinese at once. */
class EditPage extends EditRecord
{
    use InteractsWithCollaboration;
    use Translatable;

    protected static string $resource = PageResource::class;

    protected function getHeaderActions(): array
    {
        return [LocaleSwitcher::make(), $this->getSaveFormAction()->formId('form')];
    }
}
