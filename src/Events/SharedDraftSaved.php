<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Events;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class SharedDraftSaved
{
    use Dispatchable;
    use SerializesModels;

    /** @param list<string> $fields the fields published from the shared draft */
    public function __construct(
        public readonly Model $record,
        public readonly ?Authenticatable $user,
        public readonly array $fields,
    ) {}
}
