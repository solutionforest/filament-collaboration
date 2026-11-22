<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Documents;

use SolutionForest\FilamentCollaboration\Crdt\RichTextSchema;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Support\Data;

/** A field's kind and the value the database currently holds for it. */
final readonly class SharedField
{
    private const MAX_BYTES = 1_000_000;

    public function __construct(
        public string $name,
        public FieldKind $kind,
        public mixed $value,
    ) {}

    public function canBeShared(): bool
    {
        $encoded = Data::encode($this->value);

        if (strlen($encoded) > self::MAX_BYTES) {
            return false;
        }

        return match ($this->kind) {
            FieldKind::Text => $this->value === null || is_scalar($this->value),
            FieldKind::RichText => RichTextSchema::canShareLosslessly(['type' => 'doc', ...Data::decode($encoded)]),
            FieldKind::Value => $this->value === null
                || ! is_array($this->value)
                || array_filter($this->value, static fn (mixed $item): bool => $item !== null && ! is_scalar($item)) === [],
        };
    }
}
