<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Documents;

use SolutionForest\FilamentCollaboration\Crdt\Document;
use SolutionForest\FilamentCollaboration\Support\Data;

/** A locked row of the documents table, hydrated. */
final class SharedDraft
{
    /**
     * @param  array<string, string>  $savedHashes
     * @param  list<string>  $dirty
     */
    public function __construct(
        public readonly int $id,
        public int $epoch,
        public int $sequence,
        public int $floor,
        public int $compactedAt,
        public int $version,
        public Document $document,
        public Document $saved,
        public array $savedHashes,
        public array $dirty,
        public ?string $savedBy,
    ) {}

    /** @param array<string, mixed> $row */
    public static function fromRow(array $row): self
    {
        return new self(
            id: Data::int($row['id'] ?? null),
            epoch: Data::int($row['epoch'] ?? null),
            sequence: Data::int($row['sequence'] ?? null),
            floor: Data::int($row['floor'] ?? null),
            compactedAt: Data::int($row['compacted_at_sequence'] ?? null),
            version: Data::int($row['version'] ?? null),
            document: Document::from(Data::decode($row['state'] ?? null)),
            saved: Document::from(Data::decode($row['saved_state'] ?? null)),
            savedHashes: array_map(Data::string(...), Data::decode($row['saved_hashes'] ?? null)),
            dirty: Data::strings(Data::decode($row['dirty'] ?? null)),
            savedBy: Data::nullableString($row['saved_by'] ?? null),
        );
    }

    public function refreshDirty(string ...$fields): void
    {
        $dirty = array_fill_keys($this->dirty, true);

        foreach ($fields as $field) {
            unset($dirty[$field]);

            if ($this->document->has($field) && ! $this->document->contentEquals($this->saved, $field)) {
                $dirty[$field] = true;
            }
        }

        $this->dirty = array_map(strval(...), array_keys($dirty));
    }

    /** @return array<string, mixed> */
    public function toRow(): array
    {
        return [
            'epoch' => $this->epoch,
            'sequence' => $this->sequence,
            'floor' => $this->floor,
            'compacted_at_sequence' => $this->compactedAt,
            'version' => $this->version,
            'state' => Data::encode($this->document->toArray()),
            'saved_state' => Data::encode($this->saved->toArray()),
            'saved_hashes' => Data::encode($this->savedHashes),
            'dirty' => Data::encode($this->dirty),
            'saved_by' => $this->savedBy,
        ];
    }
}
