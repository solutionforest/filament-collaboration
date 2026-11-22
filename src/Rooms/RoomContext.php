<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Rooms;

use Filament\Resources\Resource;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Enums\PresenceMode;
use SolutionForest\FilamentCollaboration\Support\Data;

/**
 * Everything a sync request is allowed to do. Issued by the server while it
 * renders an authorised page, encrypted, and rechecked on every request.
 */
final readonly class RoomContext
{
    /**
     * @param  array<string, FieldKind>  $fields
     * @param  list<string>  $visible  fields whose names this user may learn
     * @param  class-string<resource>|null  $resource
     * @param  class-string|null  $page
     * @param  class-string<Model>|null  $model
     */
    public function __construct(
        public string $room,
        public ?string $scope,
        public PresenceMode $mode,
        public int $client,
        public string $panel,
        public ?string $tenant,
        public string $user,
        public array $fields = [],
        public array $visible = [],
        public ?string $resource = null,
        public ?string $page = null,
        public ?string $model = null,
        public ?string $key = null,
        public int $expiresAt = 0,
    ) {}

    public function toToken(): string
    {
        return Crypt::encryptString(Data::encode([
            'r' => $this->room,
            's' => $this->scope,
            'm' => $this->mode->value,
            'c' => $this->client,
            'p' => $this->panel,
            't' => $this->tenant,
            'u' => $this->user,
            'f' => array_map(static fn (FieldKind $kind): string => $kind->value, $this->fields),
            'v' => $this->visible,
            're' => $this->resource,
            'pa' => $this->page,
            'mo' => $this->model,
            'k' => $this->key,
            'e' => $this->expiresAt,
        ]));
    }

    public static function fromToken(string $token): ?self
    {
        try {
            $data = Data::decode(Crypt::decryptString($token));
        } catch (DecryptException) {
            return null;
        }

        $mode = PresenceMode::tryFrom(Data::string($data['m'] ?? null));

        if ($mode === null) {
            return null;
        }

        $fields = [];

        foreach (Data::map($data['f'] ?? null) as $path => $value) {
            if (($kind = FieldKind::tryFrom(Data::string($value))) !== null) {
                $fields[$path] = $kind;
            }
        }

        $resource = Data::nullableString($data['re'] ?? null);
        $page = Data::nullableString($data['pa'] ?? null);
        $model = Data::nullableString($data['mo'] ?? null);

        return new self(
            room: Data::string($data['r'] ?? null),
            scope: Data::nullableString($data['s'] ?? null),
            mode: $mode,
            client: Data::int($data['c'] ?? null),
            panel: Data::string($data['p'] ?? null),
            tenant: Data::nullableString($data['t'] ?? null),
            user: Data::string($data['u'] ?? null),
            fields: $fields,
            visible: Data::strings($data['v'] ?? null),
            resource: $resource !== null && is_subclass_of($resource, Resource::class) ? $resource : null,
            page: $page !== null && class_exists($page) ? $page : null,
            model: $model !== null && is_subclass_of($model, Model::class) ? $model : null,
            key: Data::nullableString($data['k'] ?? null),
            expiresAt: Data::int($data['e'] ?? null),
        );
    }

    public function belongsTo(?Authenticatable $user): bool
    {
        return $user !== null && Data::string($user->getAuthIdentifier()) === $this->user;
    }

    /** Whether `$earlier` is the same person's previous tab on the same record. */
    public function canResume(self $earlier): bool
    {
        return $earlier->room === $this->room
            && $earlier->user === $this->user
            && $earlier->panel === $this->panel
            && $earlier->mode === PresenceMode::Editing
            && $this->mode === PresenceMode::Editing;
    }

    public function hasExpired(): bool
    {
        return $this->expiresAt < now()->getTimestamp();
    }
}
