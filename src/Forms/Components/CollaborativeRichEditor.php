<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Forms\Components;

use Closure;
use Filament\Forms\Components\Concerns\HasPlaceholder;
use Filament\Forms\Components\Field;
use Illuminate\Database\Eloquent\Model;

class CollaborativeRichEditor extends Field
{
    use HasPlaceholder;

    /**
     * @var view-string
     */
    protected string $view = 'filament-collaboration::forms.components.collaborative-rich-editor';

    protected string|Closure|null $updatesUrl = null;

    protected int|string|Closure|null $documentId = null;

    protected function setUp(): void
    {
        parent::setUp();

        $this->dehydrated(false);

        $this->documentId(function (CollaborativeRichEditor $component): int|string|null {
            $record = $component->getRecord();

            if (! $record instanceof Model) {
                return null;
            }

            $key = $record->getKey();

            return is_int($key) || is_string($key) ? $key : null;
        });
    }

    public function updatesUrl(string|Closure|null $url): static
    {
        $this->updatesUrl = $url;

        return $this;
    }

    public function documentId(int|string|Closure|null $documentId): static
    {
        $this->documentId = $documentId;

        return $this;
    }

    public function getDocumentId(): int|string|null
    {
        $documentId = $this->evaluate($this->documentId);

        return is_int($documentId) || is_string($documentId) ? $documentId : null;
    }

    public function getUpdatesUrl(): ?string
    {
        $url = $this->evaluate($this->updatesUrl);

        if (is_string($url) && $url !== '') {
            return $url;
        }

        $documentId = $this->getDocumentId();

        if ($documentId === null) {
            return null;
        }

        return url('/collaboration/documents/'.$documentId.'/updates');
    }
}
