<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Tables;

use Filament\Tables\Columns\TextColumn;
use Illuminate\Database\Eloquent\Model;
use SolutionForest\FilamentCollaboration\Collaboration;
use SolutionForest\FilamentCollaboration\Presence\PresenceStore;

class PresenceColumn extends TextColumn
{
    /** @var array<string, list<string>>|null */
    private ?array $presenceByRecord = null;

    protected function setUp(): void
    {
        parent::setUp();

        $this->label(__('filament-collaboration::collaboration.column.label'));
        $this->badge();
        $this->color('success');
        $this->state(function (Model $record): string {
            return implode(', ', $this->labelsFor($record));
        });
    }

    /**
     * @return list<string>
     */
    private function labelsFor(Model $record): array
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
                $this->presenceByRecord[$recordKey] = array_values(array_unique(array_map(
                    fn (array $person): string => $person['name'].' ('.$person['mode'].')',
                    $people,
                )));
            }
        }

        return $this->presenceByRecord[PresenceStore::stringifyKey($record->getKey())] ?? [];
    }
}
