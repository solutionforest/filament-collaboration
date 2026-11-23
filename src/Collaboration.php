<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration;

use SolutionForest\FilamentCollaboration\Presence\PresenceStore;

final class Collaboration
{
    public static function store(): PresenceStore
    {
        return app(PresenceStore::class);
    }
}
