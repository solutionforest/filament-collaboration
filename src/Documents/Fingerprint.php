<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Documents;

use Illuminate\Database\Eloquent\Model;
use SolutionForest\FilamentCollaboration\Crdt\InvalidOperation;
use SolutionForest\FilamentCollaboration\Crdt\ItemList;
use SolutionForest\FilamentCollaboration\Crdt\Register;
use SolutionForest\FilamentCollaboration\Crdt\RichText;
use SolutionForest\FilamentCollaboration\Crdt\Token;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Support\Data;

final class Fingerprint
{
    /** The identity of a field's value, ignoring differences that mean nothing. */
    public static function value(FieldKind $kind, mixed $value): string
    {
        $canonical = match ($kind) {
            FieldKind::Text => str_replace(["\r\n", "\r"], "\n", Data::string($value)),
            FieldKind::Value => Register::normalize($value),
            FieldKind::RichText => self::richText($value),
            // Item keys are random on every page load; the content is what counts.
            FieldKind::Items => ItemList::contentOf(Data::map($value)),
        };

        return sha1(Data::encode($canonical));
    }

    public static function record(Model $record): string
    {
        $attributes = array_map(
            static fn (mixed $value): string|int => is_scalar($value) ? (string) $value : ($value === null ? 0 : 1),
            Data::map($record->getRawOriginal()),
        );

        // The database may return the same row with its columns in another order.
        ksort($attributes);

        return sha1(serialize($attributes));
    }

    private static function richText(mixed $value): mixed
    {
        try {
            return array_map(static fn (Token $token): array => [$token->value, $token->formatting], RichText::tokens($value));
        } catch (InvalidOperation) {
            return $value;
        }
    }
}
