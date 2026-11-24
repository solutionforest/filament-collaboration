<?php

declare(strict_types=1);

namespace Demo\Widgets;

use Closure;
use Filament\Forms\Components\Field;

/** A row of stars to click. Its state is a number, or null. */
class StarRating extends Field
{
    protected string $view = 'demo-widgets::star-rating';

    protected int|Closure $stars = 5;

    public function stars(int|Closure $stars): static
    {
        $this->stars = $stars;

        return $this;
    }

    public function getStars(): int
    {
        $stars = $this->evaluate($this->stars);

        return is_int($stars) ? $stars : 5;
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->rules(['nullable', 'integer', 'min:1'])->rule(fn (StarRating $component): string => 'max:'.$component->getStars());
    }
}
