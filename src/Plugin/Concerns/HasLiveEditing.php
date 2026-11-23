<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Plugin\Concerns;

use Closure;
use Illuminate\Database\Eloquent\Model;
use SolutionForest\FilamentCollaboration\Contracts\FieldType;
use SolutionForest\FilamentCollaboration\Fields\FieldResolver;
use SolutionForest\FilamentCollaboration\Fields\Types;
use SolutionForest\FilamentCollaboration\Support\Data;

trait HasLiveEditing
{
    protected bool|Closure $isLiveEditing = true;

    /** @var array<array<FieldType>|Closure> */
    protected array $fieldTypes = [];

    protected int|Closure $pollingInterval = 400;

    /** Without live editing, forms still get presence and merge when saved. */
    public function liveEditing(bool|Closure $condition = true): static
    {
        $this->isLiveEditing = $condition;

        return $this;
    }

    /**
     * Registered types take priority over the built-in ones.
     *
     * @param  array<FieldType>|Closure  $types
     */
    public function fieldTypes(array|Closure $types): static
    {
        array_unshift($this->fieldTypes, $types);

        return $this;
    }

    /** Milliseconds between syncs while working together. Crowds and idle tabs sync less often. */
    public function pollingInterval(int|Closure $milliseconds): static
    {
        $this->pollingInterval = $milliseconds;

        return $this;
    }

    public function hasLiveEditing(?Model $record = null): bool
    {
        return (bool) $this->evaluate($this->isLiveEditing, ['record' => $record]);
    }

    public function getPollingInterval(): int
    {
        return max(200, Data::int($this->evaluate($this->pollingInterval), 400));
    }

    public function getFieldResolver(): FieldResolver
    {
        $types = [];

        foreach ($this->fieldTypes as $registered) {
            foreach (Data::list($this->evaluate($registered)) as $type) {
                if ($type instanceof FieldType) {
                    $types[] = $type;
                }
            }
        }

        return new FieldResolver([
            ...$types,
            new Types\TextInputType,
            new Types\TextareaType,
            new Types\RichEditorType,
            Types\ValueType::defaults(),
        ]);
    }
}
