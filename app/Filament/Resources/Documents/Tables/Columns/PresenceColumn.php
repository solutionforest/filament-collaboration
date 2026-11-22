<?php

declare(strict_types=1);

namespace App\Filament\Resources\Documents\Tables\Columns;

use App\Models\Document;
use App\Models\User;
use Filament\Tables\Columns\TextColumn;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\DB;
use ThirdParty\Collab\Collab;
use ThirdParty\Collab\Presence\PresenceStore;

class PresenceColumn extends TextColumn
{
    /** @var array<string, array<string, string>>|null */
    private ?array $presenceByDocument = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->label('People on record');
        $this->badge();
        $this->color('success');
        $this->state(fn (Document $record): string => implode(', ', $this->presenceFor($record)));
    }

    /** @return list<string> */
    private function presenceFor(Document $record): array
    {
        if ($this->presenceByDocument === null) {
            $this->presenceByDocument = [];
            $records = $this->getTable()->getLivewire()->getTableRecords();
            if (! is_iterable($records)) {
                return [];
            }
            $rooms = [];
            foreach ($records as $row) {
                if ($row instanceof Document && $row->workspace_id === $record->workspace_id) {
                    $key = $row->getKey();
                    if (is_int($key) || is_string($key)) {
                        $rooms[(string) $key] = PresenceStore::room($row);
                    }
                }
            }
            $people = DB::table('collaboration_presence')
                ->join('users', 'users.id', '=', 'collaboration_presence.user_id')
                ->whereIn('collaboration_presence.document_id', array_keys($rooms))
                ->where('users.workspace_id', $record->workspace_id)
                ->where('seen_at', '>=', now()->subSeconds(45))
                ->select('collaboration_presence.document_id', 'users.id as user_id', 'users.name', 'collaboration_presence.page')->get();
            foreach ($people as $person) {
                if ((is_int($person->document_id) || is_string($person->document_id)) && (is_int($person->user_id) || is_string($person->user_id)) && is_string($person->name) && is_string($person->page)) {
                    $user = Relation::getMorphAlias(User::class).':'.$person->user_id;
                    $this->presenceByDocument[(string) $person->document_id][$user] = $person->name.' ('.$person->page.')';
                }
            }
            $members = Collab::store()->membersOfMany(array_values($rooms));
            foreach ($rooms as $id => $room) {
                foreach ($members[$room] ?? [] as $member) {
                    // the plugin tracks modal edits as well as record pages.
                    $this->presenceByDocument[(string) $id][$member['user']] = $member['name'].' ('.($member['mode'] === 'editing' ? 'edit' : 'view').')';
                }
            }
        }

        $id = $record->getKey();

        return is_string($id) || is_int($id) ? array_values($this->presenceByDocument[(string) $id] ?? []) : [];
    }
}
