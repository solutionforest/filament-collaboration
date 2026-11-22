<?php

namespace App\Filament\Resources\Documents\Pages;

use App\Filament\Resources\Documents\DocumentResource;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;
use SolutionForest\FilamentCollaboration\Concerns\InteractsWithCollaboration;

class EditDocument extends EditRecord
{
    use InteractsWithCollaboration;

    protected static string $resource = DocumentResource::class;

    /**
     * Live collaborative rich text is authoritative in Yjs, not the form merge.
     *
     * @return list<string>
     */
    protected function getCollaborationIgnoredFields(): array
    {
        return ['body'];
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('preview')
                ->label('Preview summary')
                ->url(fn (): string => route('articles.preview', $this->getRecord()))
                ->openUrlInNewTab(),
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
