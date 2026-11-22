<?php

namespace App\Filament\Resources\Documents\Pages;

use App\Filament\Resources\Documents\DocumentResource;
use App\Models\Document;
use App\Support\ArticleMerge;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\Select;
use Filament\Resources\Pages\EditRecord;
use Filament\Support\Exceptions\Halt;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Livewire\Attributes\Locked;

class EditDocument extends EditRecord
{
    protected static string $resource = DocumentResource::class;

    private const FIELDS = ['title', 'slug', 'category', 'status', 'excerpt'];

    /** @var array<string, string|null> */
    #[Locked]
    public array $articleBase = [];

    /** @var array<string, string|null> */
    #[Locked]
    public array $conflictingServerValues = [];

    protected function afterFill(): void
    {
        $this->articleBase = $this->fields($this->getRecord()->attributesToArray());
    }

    /** @param array<string, mixed> $data */
    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        $user = auth()->user();
        abort_unless($user !== null && $record instanceof Document, 403);
        $current = Document::query()->whereKey($record->getKey())->where('workspace_id', $user->workspace_id)->firstOrFail();
        abort_unless($user->can('update', $current), 403);
        $merge = ArticleMerge::compare($this->articleBase, $this->fields($data), $this->fields($current->attributesToArray()));
        if ($merge['conflicts'] !== []) {
            $currentFields = $this->fields($current->attributesToArray());
            $this->conflictingServerValues = array_intersect_key($currentFields, array_flip($merge['conflicts']));
            $this->mountAction('resolveArticleConflict');
            throw new Halt;
        }
        $updated = Document::query()->whereKey($current->getKey())->where('workspace_id', $user->workspace_id)
            ->where('revision', $current->revision)->update([
                ...$merge['values'], 'revision' => DB::raw('revision + 1'), 'updated_at' => now(),
            ]);
        if ($updated !== 1) {
            throw ValidationException::withMessages(['data.title' => 'The article changed while saving. Try again.']);
        }
        $record->refresh();
        $this->articleBase = $this->fields($record->attributesToArray());
        $this->form->fill($record->attributesToArray());

        return $record;
    }

    /** @param array<string, mixed> $data
     * @return array<string, string|null>
     */
    private function fields(array $data): array
    {
        $fields = [];
        foreach (self::FIELDS as $key) {
            $value = $data[$key] ?? null;
            $fields[$key] = is_string($value) && $value !== '' ? $value : null;
        }

        return $fields;
    }

    public function resolveArticleConflictAction(): Action
    {
        return Action::make('resolveArticleConflict')
            ->modalHeading('Resolve concurrent changes')
            ->modalDescription('Choose which value to keep for each field. Your other edits are preserved.')
            ->schema(function (): array {
                $controls = [];
                foreach ($this->conflictingServerValues as $field => $value) {
                    $mine = $this->data[$field] ?? null;
                    $mineLabel = is_string($mine) && $mine !== '' ? $mine : '(empty)';
                    $serverLabel = $value !== null ? $value : '(empty)';
                    $controls[] = Select::make('choices.'.$field)->label(ucfirst($field))
                        ->options(['mine' => 'Keep mine: '.$mineLabel, 'theirs' => 'Use saved: '.$serverLabel])->required();
                }

                return $controls;
            })
            ->action(function (array $data): void {
                $user = auth()->user();
                $record = $this->getRecord();
                abort_unless($user !== null && $record instanceof Document, 403);
                $current = Document::query()->whereKey($record->getKey())->where('workspace_id', $user->workspace_id)->firstOrFail();
                abort_unless($user->can('update', $current), 403);
                $currentFields = $this->fields($current->attributesToArray());
                $choices = $data['choices'] ?? null;
                if (! is_array($choices) || $this->conflictingServerValues === []) {
                    throw ValidationException::withMessages(['choices' => 'No conflict is available to resolve.']);
                }
                foreach ($this->conflictingServerValues as $field => $value) {
                    if (($currentFields[$field] ?? null) !== $value) {
                        throw ValidationException::withMessages(['mountedActions.'.(max(0, count($this->mountedActions ?? []) - 1)).'.data.choices.'.$field => 'This field changed again. Close this dialog and save again.']);
                    }
                    $choice = $choices[$field] ?? null;
                    if ($choice !== 'mine' && $choice !== 'theirs') {
                        throw ValidationException::withMessages(['mountedActions.'.(max(0, count($this->mountedActions ?? []) - 1)).'.data.choices.'.$field => 'Choose a value.']);
                    }
                }
                foreach ($this->conflictingServerValues as $field => $value) {
                    $this->articleBase[$field] = $value;
                    if ($choices[$field] === 'theirs') {
                        $this->data[$field] = $value;
                    }
                }
                $this->conflictingServerValues = [];
                $this->save(shouldRedirect: false);
            });
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('preview')->label('Preview summary')->url(fn (): string => route('articles.preview', $this->getRecord()))->openUrlInNewTab(),
            ViewAction::make(), DeleteAction::make(),
        ];
    }
}
