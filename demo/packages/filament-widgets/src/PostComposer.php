<?php

declare(strict_types=1);

namespace Demo\Widgets;

use Closure;
use Filament\Forms\Components\Field;

/** A text box for a social post, with a character counter. Its state is plain text. */
class PostComposer extends Field
{
    protected string $view = 'demo-widgets::post-composer';

    protected int|Closure $characterLimit = 280;

    public function characterLimit(int|Closure $limit): static
    {
        $this->characterLimit = $limit;

        return $this;
    }

    public function getCharacterLimit(): int
    {
        $limit = $this->evaluate($this->characterLimit);

        return is_int($limit) ? $limit : 280;
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->rule(fn (PostComposer $component): string => 'max:'.$component->getCharacterLimit());
    }
}
