<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Plugin\Concerns;

use Closure;

trait HasDebugging
{
    protected bool|Closure $isDebugging = false;

    protected bool|Closure $reportsEditorErrors = false;

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

    /**
     * Logs a warning when a browser's editor recovers from an error, with the
     * document and selection it failed on, so the failure can be replayed.
     * The log then holds field contents: enable it where that is acceptable.
     */
    public function reportEditorErrors(bool|Closure $condition = true): static
    {
        $this->reportsEditorErrors = $condition;

        return $this;
    }

    public function reportsEditorErrors(): bool
    {
        return (bool) $this->evaluate($this->reportsEditorErrors);
    }
}
