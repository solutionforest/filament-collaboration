<?php

declare(strict_types=1);

namespace App\Filament\Resources\Documents\Tables\Columns;

use App\Models\Document;
use Filament\Tables\Columns\TextColumn;
use Illuminate\Support\Facades\DB;

class PresenceColumn extends TextColumn
{
    /** @var array<string, list<string>>|null */
    private ?array $presenceByDocument = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->label('Currently viewing');
        $this->state(fn (Document $record): string => implode(', ', $this->presenceFor($record)));
    }

    /** @return list<string> */
    private function presenceFor(Document $record): array
    {
        if ($this->presenceByDocument === null) {
            $this->presenceByDocument = [];
            $records = $this->getTable()->getLivewire()->getTableRecords();
            $ids = [];
            if (! is_iterable($records)) {
                return [];
            }
            foreach ($records as $row) {
                if ($row instanceof Document && $row->workspace_id === $record->workspace_id) {
                    $ids[] = $row->getKey();
                }
            }
            $people = DB::table('collaboration_presence')
                ->join('users', 'users.id', '=', 'collaboration_presence.user_id')
                ->whereIn('collaboration_presence.document_id', $ids)
                ->where('users.workspace_id', $record->workspace_id)
                ->where('seen_at', '>=', now()->subSeconds(45))
                ->select('collaboration_presence.document_id', 'users.name', 'collaboration_presence.page')->get();
            foreach ($people as $person) {
                if ((is_int($person->document_id) || is_string($person->document_id)) && is_string($person->name) && is_string($person->page)) {
                    $this->presenceByDocument[(string) $person->document_id][] = $person->name.' ('.$person->page.')';
                }
            }
        }

        $id = $record->getKey();

        return is_string($id) || is_int($id) ? ($this->presenceByDocument[(string) $id] ?? []) : [];
    }
}
