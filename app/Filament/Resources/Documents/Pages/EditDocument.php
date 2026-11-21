<?php

namespace App\Filament\Resources\Documents\Pages;

use App\Filament\Resources\Documents\DocumentResource;
use App\Models\Document;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Livewire\Attributes\Locked;

class EditDocument extends EditRecord
{
    protected static string $resource = DocumentResource::class;

    #[Locked]
    public int $documentRevision = 0;

    protected function afterFill(): void
    {
        $record = $this->getRecord();
        if ($record instanceof Document) {
            $this->documentRevision = $record->revision;
        }
    }

    /** @param array<string, mixed> $data */
    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        $user = auth()->user();
        abort_unless($user !== null && $record instanceof Document, 403);
        $changed = Document::query()->whereKey($record->getKey())
            ->where('workspace_id', $user->workspace_id)
            ->where('revision', $this->documentRevision)
            ->update([
                'title' => $data['title'] ?? '',
                'slug' => $data['slug'] ?? null,
                'category' => $data['category'] ?? 'News',
                'status' => $data['status'] ?? 'draft',
                'excerpt' => $data['excerpt'] ?? null,
                'revision' => DB::raw('revision + 1'),
                'updated_at' => now(),
            ]);
        if ($changed !== 1) {
            throw ValidationException::withMessages(['data.title' => 'This record changed since you opened it. Reload before saving.']);
        }
        $record->refresh();
        $this->documentRevision = $record->revision;

        return $record;
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('preview')->label('Preview summary')->url(fn (): string => route('articles.preview', $this->getRecord()))->openUrlInNewTab(),
            ViewAction::make(), DeleteAction::make(),
        ];
    }
}
