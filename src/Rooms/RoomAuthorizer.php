<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Rooms;

use Filament\Facades\Filament;
use Illuminate\Database\Eloquent\Model;
use SolutionForest\FilamentCollaboration\Enums\PresenceMode;
use SolutionForest\FilamentCollaboration\Support\Data;

use function Filament\get_authorization_response;

/**
 * Repeats the page's authorisation on every sync, so losing access, changing
 * workspace or changing tenant takes effect immediately.
 */
final readonly class RoomAuthorizer
{
    public function __construct(private RoomResolver $rooms) {}

    public function authorize(RoomContext $context): RoomAccess
    {
        $user = Filament::auth()->user();
        $tenant = Filament::getTenant();

        if (! $context->belongsTo($user)
            || Filament::getCurrentOrDefaultPanel()?->getId() !== $context->panel
            || ($tenant === null ? null : Data::string($tenant->getKey())) !== $context->tenant) {
            return RoomAccess::denied();
        }

        return $context->key === null ? $this->authorizeScope($context) : $this->authorizeRecord($context);
    }

    private function authorizeScope(RoomContext $context): RoomAccess
    {
        $subject = $context->resource ?? $context->page;

        if ($subject === null || ! hash_equals($this->rooms->forScope($subject), $context->room)) {
            return RoomAccess::denied();
        }

        if (($resource = $context->resource) !== null) {
            $allowed = $context->mode === PresenceMode::Creating ? $resource::canCreate() : $resource::canViewAny();
        } else {
            $allowed = method_exists($subject, 'canAccess') && (bool) $subject::canAccess();
        }

        return $allowed ? RoomAccess::granted() : RoomAccess::denied();
    }

    private function authorizeRecord(RoomContext $context): RoomAccess
    {
        $resource = $context->resource;
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
