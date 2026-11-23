<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Plugin\Concerns;

use Closure;

trait HasBroadcasting
{
    protected bool|Closure $isBroadcasting = false;

    /**
     * Pushes changes over Laravel broadcasting, such as Reverb, so they arrive
     * at once. Polling continues slowly as the fallback. The panel's layout
     * needs Echo: set `broadcasting.echo` in `config/filament.php`.
     */
    public function broadcasting(bool|Closure $condition = true): static
    {
        $this->isBroadcasting = $condition;

        return $this;
    }

    public function isBroadcasting(): bool
    {
        return (bool) $this->evaluate($this->isBroadcasting);
    }
}
