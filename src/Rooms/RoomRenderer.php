<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Rooms;

use Filament\Facades\Filament;
use Filament\Resources\Resource;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Model;
use SolutionForest\FilamentCollaboration\Broadcasting\Audience;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Enums\PresenceMode;
use SolutionForest\FilamentCollaboration\Permissions;
use SolutionForest\FilamentCollaboration\Support\Data;

/** Renders the element the browser starts a room from, with a freshly issued token. */
final readonly class RoomRenderer
{
    public function __construct(private RoomResolver $rooms) {}

    /**
     * @param  class-string<resource>|null  $resource
     * @param  class-string|null  $page
     * @param  array<string, FieldKind>  $fields
     * @param  array<string, string>  $labels
     * @param  list<string>  $reactive  live fields that rerender the form when they change
     * @param  array<string, list<string>>  $allowed
     */
    public function render(
        PresenceMode $mode,
        int $client,
        ?Model $record = null,
        ?string $resource = null,
        ?string $page = null,
        string $statePath = 'data',
        array $fields = [],
        array $labels = [],
        array $reactive = [],
        bool $canPull = false,
        array $allowed = [],
    ): ?View {
        $plugin = CollaborationPlugin::find();
        $panel = Filament::getCurrentOrDefaultPanel();
        $user = Filament::auth()->user();
        $subject = $resource ?? $page;

        if ($plugin === null || $panel === null || $user === null || ($record === null && $subject === null)) {
            return null;
        }

        $tenant = Filament::getTenant();
        $room = $record === null ? $this->rooms->forScope((string) $subject) : $this->rooms->forRecord($record);

        $context = new RoomContext(
            room: $room,
            scope: $subject === null ? null : $this->rooms->forScope($subject),
            mode: $mode,
            client: $client,
            panel: $panel->getId(),
            tenant: $tenant === null ? null : Data::string($tenant->getKey()),
            user: Data::string($user->getAuthIdentifier()),
            fields: $fields,
            visible: array_map(strval(...), array_keys($labels + $fields)),
            resource: $resource,
            page: $page,
            model: $record === null ? null : $record::class,
            key: $record === null ? null : Data::string($record->getKey()),
            expiresAt: now()->getTimestamp() + max(1, Data::int(config('filament-collaboration.token_lifetime'), 900)),
            allowed: $allowed,
            permissions: Permissions::version($room),
        );

        return view('filament-collaboration::room', [
            'id' => 'collab-'.substr($room, 0, 16).'-'.$client,
            'config' => Data::encode([
                'id' => substr($room, 0, 16).'-'.$client,
                'url' => $panel->route('collaboration.sync', $tenant === null ? [] : ['tenant' => $tenant]),
                'csrf' => csrf_token(),
                'token' => $context->toToken(),
                'client' => $client,
                'mode' => $mode->value,
                'scoped' => $record === null,
                'storageKey' => substr(hash_hmac('sha256', $room.':'.Data::string($user->getAuthIdentifier()), Data::string(config('app.key'))), 0, 32),
                'statePath' => $statePath,
                'fields' => (object) array_map(static fn (FieldKind $kind): string => $kind->value, $fields),
                'labels' => (object) $labels,
                'reactive' => $reactive,
                'canPull' => $canPull,
                'interval' => $plugin->getPollingInterval(),
                'channel' => $plugin->isBroadcasting() ? Audience::of($context)->channel() : null,
                'avatarLimit' => $plugin->getAvatarLimit(),
                'strings' => trans('filament-collaboration::collaboration.client'),
                'modes' => trans('filament-collaboration::collaboration.modes'),
            ]),
        ]);
    }
}
