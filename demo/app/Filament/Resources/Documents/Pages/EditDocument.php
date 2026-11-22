<?php

namespace App\Filament\Resources\Documents\Pages;

use App\Filament\Resources\Documents\DocumentResource;
use App\Models\Document;
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
     * Live Yjs pad is authoritative in CRDT storage, not form merge.
     *
     * @return list<string>
     */
    protected function getCollaborationIgnoredFields(): array
    {
        return ['live_draft'];
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('blog')
                ->label('Open public blog page')
                ->url(function (): string {
                    $record = $this->getRecord();

                    return $record instanceof Document ? $record->publicUrl() : '#';
                })
                ->openUrlInNewTab()
                ->visible(function (): bool {
                    $record = $this->getRecord();

                    return $record instanceof Document
                        && $record->status === 'published'
                        && filled($record->slug);
                }),
            Action::make('preview')
                ->label('Private summary preview')
                ->url(fn (): string => route('articles.preview', $this->getRecord()))
                ->openUrlInNewTab(),
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
