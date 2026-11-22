<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Plugin\Concerns;

use Closure;

trait HasDebugging
{
    protected bool|Closure $isDebugging = false;

    /** Allows `CollaborationDebugAction` to be shown. It is hidden otherwise. */
    public function debug(bool|Closure $condition = true): static
    {
        $this->isDebugging = $condition;

        return $this;
    }

    public function isDebugging(): bool
    {
        return (bool) $this->evaluate($this->isDebugging);
    }
}
