<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Rooms;

use Filament\Facades\Filament;
use Filament\Resources\Resource;
use Illuminate\Database\Eloquent\Model;
use SolutionForest\Collaboration\Contracts\AuthorizesRooms;
use SolutionForest\Collaboration\Enums\PresenceMode;
use SolutionForest\Collaboration\Rooms\RoomAccess;
use SolutionForest\Collaboration\Rooms\RoomContext;
use SolutionForest\Collaboration\Rooms\RoomResolver;
use SolutionForest\Collaboration\Support\Data;

use function Filament\get_authorization_response;

/**
 * Repeats the page's authorisation on every sync, so losing access, changing
 * workspace or changing tenant takes effect immediately.
 */
final readonly class RoomAuthorizer implements AuthorizesRooms
{
    public function __construct(private RoomResolver $rooms) {}

    public function authorize(RoomContext $context): RoomAccess
    {
        $user = Filament::auth()->user();
        $tenant = Filament::getTenant();

        if (! $context->belongsTo($user)
            || Filament::getCurrentOrDefaultPanel()?->getId() !== $context->meta('panel')
            || ($tenant === null ? null : Data::string($tenant->getKey())) !== $context->meta('tenant')) {
            return RoomAccess::denied();
        }

        return $context->key === null ? $this->authorizeScope($context) : $this->authorizeRecord($context);
    }

    /** @return class-string<resource>|null */
    public static function resourceOf(RoomContext $context): ?string
    {
        $resource = $context->meta('resource');

        return $resource !== null && is_subclass_of($resource, Resource::class) ? $resource : null;
    }

    /** @return class-string|null */
    public static function pageOf(RoomContext $context): ?string
    {
        $page = $context->meta('page');

        return $page !== null && class_exists($page) ? $page : null;
    }

    private function authorizeScope(RoomContext $context): RoomAccess
    {
        $resource = self::resourceOf($context);
        $subject = $resource ?? self::pageOf($context);

        if ($subject === null || ! hash_equals($this->rooms->forScope($subject), $context->room)) {
            return RoomAccess::denied();
        }

        if ($resource !== null) {
            $allowed = $context->mode === PresenceMode::Creating ? $resource::canCreate() : $resource::canViewAny();
        } else {
            $allowed = method_exists($subject, 'canAccess') && (bool) $subject::canAccess();
        }

        return $allowed ? RoomAccess::granted() : RoomAccess::denied();
    }

    private function authorizeRecord(RoomContext $context): RoomAccess
    {
        $resource = self::resourceOf($context);
        $model = $context->model;

        if ($model === null) {
            return RoomAccess::denied();
        }

        $query = $resource !== null && is_a($resource::getModel(), $model, true)
            ? $resource::getRecordRouteBindingEloquentQuery()
            : $model::query();

        $record = $query->whereKey($context->key)->first();

        if (! $record instanceof Model || ! hash_equals($this->rooms->forRecord($record), $context->room)) {
            return RoomAccess::denied();
        }

        $isEditing = $context->mode === PresenceMode::Editing;

        $allowed = match (true) {
            $resource !== null && is_a($resource::getModel(), $model, true) => $isEditing ? $resource::canEdit($record) : $resource::canView($record),
            default => get_authorization_response($isEditing ? 'update' : 'view', $record)->allowed(),
        };

        return $allowed ? RoomAccess::granted($record) : RoomAccess::denied();
    }
}
