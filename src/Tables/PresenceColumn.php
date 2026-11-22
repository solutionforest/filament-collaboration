<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Tables;

use Closure;
use Filament\Tables\Columns\ViewColumn;
use Illuminate\Database\Eloquent\Model;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use SolutionForest\FilamentCollaboration\Contracts\PresenceRepository;
use SolutionForest\FilamentCollaboration\Enums\PresenceMode;
use SolutionForest\FilamentCollaboration\Presence\Identity;
use SolutionForest\FilamentCollaboration\Presence\Participant;
use SolutionForest\FilamentCollaboration\Rooms\RoomResolver;
use SolutionForest\FilamentCollaboration\Support\Data;

/** Who is on each record. Give the table a `poll()` to keep it current. */
class PresenceColumn extends ViewColumn
{
    protected string $view = 'filament-collaboration::tables.presence-column';

    protected int|Closure $avatarLimit = 4;

    /** @var array<string, list<Participant>> */
    private array $peopleByRoom = [];

    public static function getDefaultName(): ?string
    {
        return 'presence';
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->label(__('filament-collaboration::collaboration.column.label'));
        $this->getStateUsing(fn (Model $record): array => $this->getPeople($record));
    }

    public function avatarLimit(int|Closure $limit): static
    {
        $this->avatarLimit = $limit;

        return $this;
    }

    public function getAvatarLimit(): int
    {
        return max(1, Data::int($this->evaluate($this->avatarLimit), 4));
    }

    /** @return list<array{name: string, initials: string, avatar: ?string, color: string, mode: string, editing: bool}> */
    protected function getPeople(Model $record): array
    {
        $rooms = app(RoomResolver::class);
        $room = $rooms->forRecord($record);

        if (! array_key_exists($room, $this->peopleByRoom)) {
            $this->loadPage($rooms, $room);
        }

        $self = Identity::current()?->key;
        $present = $this->peopleByRoom[$room] ?? [];
        // Assigned as the edit page does, so a person has one colour in both places.
        $colors = CollaborationPlugin::get()->getPalette()->assign(
            array_map(static fn (Participant $person): string => $person->userKey, $present),
        );
        $people = [];

        // A person with several tabs is shown once, as editing if any tab is.
        foreach ($present as $person) {
            if ($person->userKey === $self || ($people[$person->userKey]['editing'] ?? false)) {
                continue;
            }

            $people[$person->userKey] = [
                'name' => $person->name,
                'initials' => $person->initials(),
                'avatar' => $person->avatar,
                'color' => $colors[$person->userKey],
                'mode' => $person->mode->getLabel(),
                'editing' => $person->mode === PresenceMode::Editing,
            ];
        }

        return array_values($people);
    }

    /** One query for the whole page of the table. */
    private function loadPage(RoomResolver $rooms, string $room): void
    {
        $wanted = [$room => true];
        $records = $this->getTable()->getLivewire()->getTableRecords();
        $rows = is_iterable($records) ? $records : [];

        foreach ($rows as $row) {
            if ($row instanceof Model) {
                $wanted[$rooms->forRecord($row)] = true;
            }
        }

        $this->peopleByRoom = app(PresenceRepository::class)->inRooms(array_map(strval(...), array_keys($wanted)));
    }
}
