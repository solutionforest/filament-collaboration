<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration;

use Closure;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Field;
use Filament\Support\Assets\Css;
use Filament\Support\Assets\Js;
use Filament\Support\Facades\FilamentAsset;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Event;
use SolutionForest\FilamentCollaboration\Actions\CollaborateAction;
use SolutionForest\FilamentCollaboration\Broadcasting\RoomChanged;
use SolutionForest\FilamentCollaboration\Broadcasting\RoomNotifier;
use SolutionForest\FilamentCollaboration\Commands\PruneUploadsCommand;
use SolutionForest\FilamentCollaboration\Commands\RefreshPermissionsCommand;
use SolutionForest\FilamentCollaboration\Contracts\PresenceRepository;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Fields\FieldResolver;
use SolutionForest\FilamentCollaboration\Presence\DatabasePresenceRepository;
use SolutionForest\FilamentCollaboration\Presence\Identity;
use SolutionForest\FilamentCollaboration\Rooms\DeletedRecords;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class FilamentCollaborationServiceProvider extends PackageServiceProvider
{
    public static string $name = 'filament-collaboration';

    public function configurePackage(Package $package): void
    {
        $package
            ->name(static::$name)
            ->hasConfigFile()
            ->hasViews(static::$name)
            ->hasTranslations()
            ->hasCommands([RefreshPermissionsCommand::class, PruneUploadsCommand::class]);
    }

    public function packageRegistered(): void
    {
        $this->app->bindIf(PresenceRepository::class, DatabasePresenceRepository::class);

        // One per request, so a request's changes are pushed once.
        $this->app->scoped(RoomNotifier::class);
    }

    /**
     * Only people syncing in a room, in the same audience, may hear it: they
     * passed the room's authorisation to get there. Registered on the default
     * broadcaster, so call this again if you switch broadcaster at runtime.
     */
    public static function registerChannel(): void
    {
        Broadcast::channel(
            RoomChanged::channel('{room}').'.{audience}',
            fn (Authenticatable $user, string $room, string $audience): bool => app(PresenceRepository::class)
                ->isPresent($room, Identity::for($user)->key, $audience),
        );
    }

    public function packageBooted(): void
    {
        // Loaded, not published: a published copy would create the tables twice.
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');

        // Images inserted into drafts that were never saved. Runs wherever the scheduler does.
        $this->callAfterResolving(Schedule::class, static function (Schedule $schedule): void {
            if (config('filament-collaboration.prune_uploads_after') !== null) {
                $schedule->command(PruneUploadsCommand::class)->daily()->withoutOverlapping()->onOneServer();
            }
        });

        FilamentAsset::register([
            Css::make('collaboration', __DIR__.'/../resources/dist/collaboration.css'),
            Js::make('collaboration', __DIR__.'/../resources/dist/collaboration.js'),
        ], 'solutionforest/filament-collaboration');

        EditAction::macro('collaborate', function (array $ignore = [], bool $presence = true): EditAction {
            return CollaborateAction::fromMacro($this, $ignore, $presence);
        });

        static::registerChannel();

        // Tells a room at once when its record is deleted, and cleans up after it.
        Event::listen('eloquent.deleted: *', static function (string $event, array $payload): void {
            app(DeletedRecords::class)->handle($event, $payload);
        });

        Field::macro('collaborative', function (bool|Closure|string $condition = true, ?string $adapter = null, FieldKind $as = FieldKind::Text): Field {
            $field = FieldResolver::markField($this, $condition);

            return $adapter === null ? $field : FieldResolver::markAdapter($field, $adapter, $as);
        });

        Field::macro('lockWhileEditing', function (bool $condition = true): Field {
            return FieldResolver::markLock($this, $condition);
        });
    }
}
