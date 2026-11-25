<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Fields\Types;

use Filament\Forms\Components\Field;
use Filament\Forms\Components\FileUpload;
use SolutionForest\Collaboration\Documents\SharedUploads;
use SolutionForest\Collaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Contracts\FieldType;
use SolutionForest\FilamentCollaboration\Contracts\UsesAdapter;

/**
 * Filament's `FileUpload`: its files, a list keyed like a repeater's items.
 * A file is stored as soon as it is uploaded, so everybody sees it and any
 * save keeps it. Adding, removing and reordering files merge.
 */
class UploadType implements FieldType, UsesAdapter
{
    /** The marker, in a field's allowed sub-paths, that its values must be stored files. */
    public const FILES = SharedUploads::FILES;

    public function supports(Field $field): bool
    {
        return $field instanceof FileUpload;
    }

    public function getKind(Field $field): ?FieldKind
    {
        return self::isShareable($field) ? FieldKind::Items : null;
    }

    public static function isShareable(Field $field): bool
    {
        // Media library fields save through a relationship, and unstored files never become paths.
        return $field instanceof FileUpload
            && $field->shouldStoreFiles()
            && ! str_contains($field::class, 'SpatieMediaLibrary')
            && ! str_contains($field::class, 'Curator');
    }

    public function getAdapter(Field $field): string
    {
        return 'filament-file-upload';
    }
}
