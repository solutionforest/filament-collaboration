<?php

namespace App\Filament\Resources\Documents\Pages;

use App\Filament\Resources\Documents\DocumentResource;
use Filament\Resources\Pages\CreateRecord;
use SolutionForest\FilamentCollaboration\Concerns\HasPresence;

class CreateDocument extends CreateRecord
{
    use HasPresence;

    protected static string $resource = DocumentResource::class;

    // The edit page is where an article becomes a shared document.
    protected function getRedirectUrl(): string
    {
        return DocumentResource::getUrl('edit', ['record' => $this->getRecord()]);
    }

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $user = auth()->user();
        abort_unless($user !== null, 401);
        $data['workspace_id'] = $user->workspace_id;
        $data['author_id'] ??= $user->getKey();

        return $data;
    }
}
