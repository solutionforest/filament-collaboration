<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Tables;

use Filament\Tables\Columns\ViewColumn;
use Illuminate\Database\Eloquent\Model;
use SolutionForest\FilamentCollaboration\Collaboration;
use SolutionForest\FilamentCollaboration\Presence\PresenceStore;

class PresenceColumn extends ViewColumn
{
    /** @var array<string, list<array{id: string|int, name: string, avatar: ?string, field: ?string, mode: string}>>|null */
    private ?array $presenceByRecord = null;

    protected string $view = 'filament-collaboration::tables.presence-column';

    protected function setUp(): void
    {
        parent::setUp();

        $this->label(__('filament-collaboration::collaboration.column.label'));
        $this->getStateUsing(fn (Model $record): array => $this->peopleFor($record));
    }

    /**
     * @return list<array{id: string|int, name: string, avatar: ?string, field: ?string, mode: string}>
     */
    private function peopleFor(Model $record): array
    {
        if ($this->presenceByRecord === null) {
            $this->presenceByRecord = [];
            $records = $this->getTable()->getLivewire()->getTableRecords();
            if (! is_iterable($records)) {
                return [];
            }

            $rooms = [];
            foreach ($records as $row) {
                if ($row instanceof Model) {
                    $rooms[PresenceStore::stringifyKey($row->getKey())] = PresenceStore::room($row);
                }
            }

            foreach (Collaboration::store()->peopleForRooms($rooms) as $recordKey => $people) {
                $unique = [];
                $display = [];
                foreach ($people as $person) {
                    $key = (string) $person['id'];
                    if (isset($unique[$key])) {
                        continue;
                    }
                    $unique[$key] = true;
                    $display[] = $person;
                }
                $this->presenceByRecord[$recordKey] = $display;
            }
        }

        return $this->presenceByRecord[PresenceStore::stringifyKey($record->getKey())] ?? [];
    }
}
