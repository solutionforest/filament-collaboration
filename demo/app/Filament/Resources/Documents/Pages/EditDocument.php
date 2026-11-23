<?php

namespace App\Filament\Resources\Documents\Pages;

use App\Filament\Resources\Documents\DocumentResource;
use App\Models\Document;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;
use Filament\Support\Icons\Heroicon;
use SolutionForest\FilamentCollaboration\Actions\CollaborationDebugAction;
use SolutionForest\FilamentCollaboration\Actions\CollaborationPanelAction;
use SolutionForest\FilamentCollaboration\Concerns\InteractsWithCollaboration;

class EditDocument extends EditRecord
{
    use InteractsWithCollaboration;

    protected static string $resource = DocumentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CollaborationDebugAction::make(),
            CollaborationPanelAction::make(),
            $this->getSaveFormAction()
                ->formId('form'),
            ActionGroup::make([
                ViewAction::make(),
                Action::make('preview')
                    ->label('Private preview')
                    ->icon(Heroicon::OutlinedEye)
                    ->url(fn (): string => route('articles.preview', $this->getRecord()))
                    ->openUrlInNewTab(),
                Action::make('blog')
                    ->label('Open on the blog')
                    ->icon(Heroicon::OutlinedGlobeAlt)
                    ->url(function (): string {
                        $record = $this->getRecord();

                        return $record instanceof Document ? $record->publicUrl() : '#';
                    })
                    ->openUrlInNewTab()
                    ->visible(function (): bool {
                        $record = $this->getRecord();

                        return $record instanceof Document && $record->status === 'published' && filled($record->slug);
                    }),
                DeleteAction::make(),
            ])->color('gray'),
        ];
    }

    public function getTitle(): string
    {
        $record = $this->getRecord();

        return $record instanceof Document ? (string) $record->title : 'Edit article';
    }
}
