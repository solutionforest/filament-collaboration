<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Commands;

use Illuminate\Console\Command;
use SolutionForest\Collaboration\Permissions;

class RefreshPermissionsCommand extends Command
{
    protected $signature = 'filament-collaboration:refresh-permissions';

    protected $description = 'Make every open collaboration tab fetch a new token, after changing roles or field access';

    public function handle(): int
    {
        Permissions::changed();

        $this->components->info('Open tabs will renew their tokens on their next sync.');

        return self::SUCCESS;
    }
}
