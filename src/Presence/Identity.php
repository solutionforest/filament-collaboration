<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Presence;

use Filament\Facades\Filament;
use Filament\Models\Contracts\HasAvatar;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use SolutionForest\FilamentCollaboration\Support\Data;

/** The signed-in user, as other editors see them. */
final readonly class Identity
{
    public function __construct(
        public string $key,
        public string $name,
        public ?string $avatar,
    ) {}

    public static function current(): ?self
    {
        $user = Filament::auth()->user();

        return $user === null ? null : self::for($user);
    }

    public static function for(Authenticatable $user): self
    {
        $key = substr(hash_hmac(
            'sha256',
            $user::class.':'.Data::string($user->getAuthIdentifier()),
            Data::string(config('app.key')),
        ), 0, 20);

        $name = $user instanceof Model ? trim(Data::string(rescue(fn (): string => Filament::getUserName($user), '', report: false))) : '';

        // Filament's fallback avatar service would receive everybody's name, so it is not used.
        $avatar = $user instanceof HasAvatar ? Data::nullableString($user->getFilamentAvatarUrl()) : null;

        if ($avatar !== null && preg_match('#^(https?://|/(?!/)|data:image/(png|jpeg|gif|webp);)#i', $avatar) !== 1) {
            $avatar = null;
        }

        return new self($key, $name !== '' ? $name : __('filament-collaboration::collaboration.someone'), $avatar);
    }
}
