<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration;

use Closure;
use Filament\Actions\EditAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\Field;
use Filament\Models\Contracts\HasAvatar;
use Filament\Support\Assets\Css;
use Filament\Support\Assets\Js;
use Filament\Support\Facades\FilamentAsset;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use SolutionForest\Collaboration\Collaboration;
use SolutionForest\Collaboration\CollaborationServiceProvider;
use SolutionForest\Collaboration\Contracts\AuthorizesRooms;
use SolutionForest\Collaboration\Enums\FieldKind;
use SolutionForest\Collaboration\Presence\Palette;
use SolutionForest\Collaboration\Support\Data;
use SolutionForest\FilamentCollaboration\Actions\CollaborateAction;
use SolutionForest\FilamentCollaboration\Commands\MakeCollaborativeFieldCommand;
use SolutionForest\FilamentCollaboration\Commands\PruneUploadsCommand;
use SolutionForest\FilamentCollaboration\Commands\RefreshPermissionsCommand;
use SolutionForest\FilamentCollaboration\Fields\FieldResolver;
use SolutionForest\FilamentCollaboration\Rooms\RoomAuthorizer;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

/**
 * Filament on top of solutionforest/laravel-collaboration: the core keeps the
 * drafts, presence and sync; this package adds panels, fields and actions.
 */
class FilamentCollaborationServiceProvider extends PackageServiceProvider
{
    public static string $name = 'filament-collaboration';

    /** Classes that moved to the core, under their old names, so existing code keeps working. */
    private const MOVED = [
        'Permissions',
        'Contracts\\PresenceRepository',
        'Enums\\FieldKind',
        'Enums\\PresenceChange',
        'Enums\\PresenceMode',
        'Events\\ChangesMerged',
        'Events\\CommentPosted',
        'Events\\ConflictDetected',
        'Events\\ConflictResolved',
        'Events\\DraftEdited',
        'Events\\SharedDraftSaved',
    ];

    public function configurePackage(Package $package): void
    {
        $package
            ->name(static::$name)
            ->hasConfigFile()
            ->hasViews(static::$name)
            ->hasTranslations()
            ->hasCommands([RefreshPermissionsCommand::class, PruneUploadsCommand::class, MakeCollaborativeFieldCommand::class]);
    }

    public function packageRegistered(): void
    {
        foreach (self::MOVED as $class) {
            $old = __NAMESPACE__.'\\'.$class;

            if (! class_exists($old, false) && ! interface_exists($old, false) && ! enum_exists($old, false)) {
                class_alias('SolutionForest\\Collaboration\\'.$class, $old);
            }
        }

        // Filament keeps its own tables and registers sync inside each panel.
        Collaboration::ignoreMigrations();
        Collaboration::ignoreRoutes();

        $this->app->bind(AuthorizesRooms::class, RoomAuthorizer::class);
    }

    /** Kept for applications that call it after switching broadcaster at runtime. */
    public static function registerChannel(): void
    {
        CollaborationServiceProvider::registerChannel();
    }

    public function packageBooted(): void
    {
        // Loaded, not published: a published copy would create the tables twice.
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');

        $this->configureCore();

        FilamentAsset::register([
            Css::make('collaboration', __DIR__.'/../resources/dist/collaboration.css'),
            Js::make('collaboration', __DIR__.'/../resources/dist/collaboration.js'),
        ], 'solutionforest/filament-collaboration');

        EditAction::macro('collaborate', function (array $ignore = [], bool $presence = true): EditAction {
            return CollaborateAction::fromMacro($this, $ignore, $presence);
        });

        Field::macro('collaborative', function (bool|Closure|string $condition = true, ?string $adapter = null, FieldKind $as = FieldKind::Text): Field {
            $field = FieldResolver::markField($this, $condition);

            return $adapter === null ? $field : FieldResolver::markAdapter($field, $adapter, $as);
        });

        Field::macro('lockWhileEditing', function (bool $condition = true): Field {
            return FieldResolver::markLock($this, $condition);
        });
    }

    /**
     * Tells the core how Filament works: its settings come from this package's
     * config and from the current panel's plugin, and people are the panel's.
     */
    private function configureCore(): void
    {
        Collaboration::readConfigUsing(static fn (string $key, mixed $default): mixed => $key === 'table_prefix'
            ? 'filament_collaboration_'
            : config("filament-collaboration.{$key}", $default));

        Collaboration::resolveUsersUsing(static fn (): ?Authenticatable => Filament::auth()->user());
        Collaboration::nameUsersUsing(static fn (Authenticatable $user): ?string => $user instanceof Model ? Filament::getUserName($user) : null);

        // Filament's fallback avatar service would receive everybody's name, so it is not used.
        Collaboration::giveUsersAvatarsUsing(static fn (Authenticatable $user): ?string => $user instanceof HasAvatar ? $user->getFilamentAvatarUrl() : null);

        Collaboration::broadcast(static fn (): bool => CollaborationPlugin::find()?->isBroadcasting() ?? false);
        Collaboration::audit(static fn (): bool => CollaborationPlugin::find()?->isAuditing() ?? false);
        Collaboration::reportEditorErrors(static fn (): bool => CollaborationPlugin::find()?->reportsEditorErrors() ?? false);
        Collaboration::colors(static fn (): array => CollaborationPlugin::find()?->getColors() ?? Palette::DEFAULT);

        Collaboration::scopeRoomsUsing(static function (?Model $record): mixed {
            $plugin = CollaborationPlugin::find();

            if ($record !== null) {
                return $plugin?->getRoomScope($record);
            }

            // A list or create page's room is the resource's, in this tenant.
            $tenant = Filament::getTenant();

            return [$plugin?->getRoomScope(), $tenant === null ? null : Data::string($tenant->getKey())];
        });
    }
}
