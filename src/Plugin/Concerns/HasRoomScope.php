<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Plugin\Concerns;

use Closure;
use Illuminate\Database\Eloquent\Model;
use SolutionForest\Collaboration\Support\Data;

trait HasRoomScope
{
    protected ?Closure $roomScopeUsing = null;

    /**
     * Separates rooms beyond Filament tenancy, for example by a workspace column.
     * The closure receives `$record`, which is null for list and create pages.
     */
    public function scopeRoomsUsing(?Closure $callback): static
    {
        $this->roomScopeUsing = $callback;

        return $this;
    }

    public function getRoomScope(?Model $record = null): ?string
    {
        return $this->roomScopeUsing === null
            ? null
            : Data::nullableString($this->evaluate($this->roomScopeUsing, ['record' => $record]));
    }
}
