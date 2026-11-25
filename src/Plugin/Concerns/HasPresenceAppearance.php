<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Plugin\Concerns;

use Closure;
use Filament\View\PanelsRenderHook;
use SolutionForest\Collaboration\Presence\Palette;
use SolutionForest\Collaboration\Support\Data;

trait HasPresenceAppearance
{
    protected int|Closure $avatarLimit = 5;

    /** @var array<string>|Closure */
    protected array|Closure $colors = Palette::DEFAULT;

    protected string $presenceRenderHook = PanelsRenderHook::PAGE_HEADER_ACTIONS_BEFORE;

    public function avatarLimit(int|Closure $limit): static
    {
        $this->avatarLimit = $limit;

        return $this;
    }

    /** @param array<string>|Closure $colors six-digit hex colours that white text is readable on */
    public function colors(array|Closure $colors): static
    {
        $this->colors = $colors;

        return $this;
    }

    /** Use one of Filament's page render hooks, so it renders inside the page component. */
    public function presenceRenderHook(string $hook): static
    {
        $this->presenceRenderHook = $hook;

        return $this;
    }

    public function getAvatarLimit(): int
    {
        return max(1, Data::int($this->evaluate($this->avatarLimit), 5));
    }

    public function getPalette(): Palette
    {
        return new Palette($this->getColors());
    }

    /** @return list<string> */
    public function getColors(): array
    {
        return Data::strings($this->evaluate($this->colors));
    }

    public function getPresenceRenderHook(): string
    {
        return $this->presenceRenderHook;
    }
}
