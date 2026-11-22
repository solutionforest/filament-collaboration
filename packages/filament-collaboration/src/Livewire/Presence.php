<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Livewire;

use Filament\Facades\Filament;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\View\View;
use Livewire\Component;
use SolutionForest\FilamentCollaboration\Collaboration;

final class Presence extends Component
{
    public string $room = '';

    public string $mode = 'viewing';

    public string $origin = '';

    public int $version = 0;

    public ?string $field = null;

    public string $sessionId = '';

    /** @var list<array{id: string|int, name: string, avatar: ?string, field: ?string, mode: string}> */
    public array $people = [];

    public ?string $lastSaveName = null;

    /** @var list<string> */
    public array $lastSaveFields = [];

    public function mount(string $room, string $mode, string $origin, int $version = 0): void
    {
        $this->room = $room;
        $this->mode = $mode;
        $this->origin = $origin;
        $this->version = $version;
        $this->sessionId = bin2hex(random_bytes(8));
        $this->tick();
    }

    public function tick(): void
    {
        $user = Filament::auth()->user() ?? auth()->user();
        if (! $user instanceof Authenticatable) {
            return;
        }

        $id = $user->getAuthIdentifier();
        if (! is_string($id) && ! is_int($id)) {
            return;
        }

        $name = __('filament-collaboration::collaboration.someone');
        if (method_exists($user, 'getFilamentName')) {
            $filamentName = $user->getFilamentName();
            if (is_string($filamentName) && $filamentName !== '') {
                $name = $filamentName;
            }
        } else {
            $fallback = $user->name ?? null;
            if (is_string($fallback) && $fallback !== '') {
                $name = $fallback;
            }
        }

        $avatar = null;
        if (method_exists($user, 'getFilamentAvatarUrl')) {
            $avatarUrl = $user->getFilamentAvatarUrl();
            $avatar = is_string($avatarUrl) ? $avatarUrl : null;
        }

        Collaboration::store()->heartbeat($this->room, $this->sessionId, [
            'id' => $id,
            'name' => $name,
            'avatar' => $avatar,
            'field' => config('filament-collaboration.track_fields', true) ? $this->field : null,
            'mode' => $this->mode,
            'origin' => $this->origin,
        ]);

        $selfId = is_string($id) ? $id : (string) $id;
        $this->people = array_values(array_filter(
            Collaboration::store()->people($this->room, $this->origin),
            fn (array $person): bool => (is_string($person['id']) ? $person['id'] : (string) $person['id']) !== $selfId
                || $person['origin'] !== $this->origin,
        ));

        // Deduplicate other tabs of the same user for display.
        $seen = [];
        $display = [];
        foreach ($this->people as $person) {
            $key = is_string($person['id']) ? $person['id'] : (string) $person['id'];
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $display[] = $person;
        }
        $this->people = $display;

        $save = Collaboration::store()->lastSave($this->room);
        if ($save !== null && ($save['version'] ?? 0) > $this->version && ($save['origin'] ?? null) !== $this->origin) {
            $this->lastSaveName = $save['name'] ?? null;
            $this->lastSaveFields = $save['fields'] ?? [];
        } else {
            $this->lastSaveName = null;
            $this->lastSaveFields = [];
        }
    }

    public function setField(?string $field): void
    {
        $this->field = $field;
        $this->tick();
    }

    public function leave(): void
    {
        Collaboration::store()->leave($this->room, $this->sessionId);
    }

    public function render(): View
    {
        return view('filament-collaboration::presence');
    }
}
