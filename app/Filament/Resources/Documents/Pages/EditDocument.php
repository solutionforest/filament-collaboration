<?php

namespace App\Filament\Resources\Documents\Pages;

use App\Filament\Resources\Documents\DocumentResource;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;
use ThirdParty\Collab\Concerns\InteractsWithCollab;

class EditDocument extends EditRecord
{
    use InteractsWithCollab;

    protected static string $resource = DocumentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('preview')->label('Preview summary')->url(fn (): string => route('articles.preview', $this->getRecord()))->openUrlInNewTab(),
            ViewAction::make(), DeleteAction::make(),
        ];
    }
}
