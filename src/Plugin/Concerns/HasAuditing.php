<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Plugin\Concerns;

use Closure;

trait HasAuditing
{
    protected bool|Closure $isAuditing = false;

    /**
     * Keeps a trail of who changed which field, per minute, in
     * `filament_collaboration_edits`, and dispatches `DraftEdited` for each.
     * Read it with `EditTrail::for($record)`.
     */
    public function audit(bool|Closure $condition = true): static
    {
        $this->isAuditing = $condition;

        return $this;
    }

    public function isAuditing(): bool
    {
        return (bool) $this->evaluate($this->isAuditing);
    }
}
