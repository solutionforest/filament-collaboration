<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Plugin\Concerns;

use Closure;
use Filament\Forms\Components\CodeEditor;
use Filament\Forms\Components\MarkdownEditor;
use Illuminate\Database\Eloquent\Model;
use SolutionForest\Collaboration\Support\Data;
use SolutionForest\FilamentCollaboration\Contracts\FieldType;
use SolutionForest\FilamentCollaboration\Fields\FieldResolver;
use SolutionForest\FilamentCollaboration\Fields\Types;

trait HasLiveEditing
{
    protected bool|Closure $isLiveEditing = true;

    /** @var array<array<FieldType>|Closure> */
    protected array $fieldTypes = [];

    protected int|Closure $pollingInterval = 400;

    protected bool|Closure $locksWhileEditing = false;

    /** @var list<FieldType> registered by other packages, for every panel */
    protected static array $globalFieldTypes = [];

    /**
     * For packages: makes their fields collaborative in every panel, for
     * example in a service provider's `boot()`. A panel's own
     * `fieldTypes()` still come first.
     */
    public static function registerFieldTypes(FieldType ...$types): void
    {
        array_push(static::$globalFieldTypes, ...$types);
    }

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

    /**
     * Makes a field that cannot be live read-only for everybody else while
     * somebody is in it, so two people never change it at once. Without
     * this, others are only told who is editing it. Per field:
     * `->lockWhileEditing()`.
     */
    public function lockWhileEditing(bool|Closure $condition = true): static
    {
        $this->locksWhileEditing = $condition;

        return $this;
    }

    public function locksWhileEditing(): bool
    {
        return (bool) $this->evaluate($this->locksWhileEditing);
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
            ...static::$globalFieldTypes,
            new Types\TextInputType,
            new Types\TextareaType,
            new Types\RichEditorType,
            new Types\UploadType,
            new Types\ItemsType,
            Types\ValueType::defaults(),
            // Filament's own CodeMirror editors, through the adapters this package ships.
            Types\AdapterType::make([MarkdownEditor::class], 'filament-markdown-editor'),
            Types\AdapterType::make([CodeEditor::class], 'filament-code-editor'),
        ]);
    }
}
