<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Commands;

use Illuminate\Console\Command;
use SolutionForest\FilamentCollaboration\Documents\SharedUploads;

class PruneUploadsCommand extends Command
{
    protected $signature = 'filament-collaboration:prune-uploads {--hours= : Only images inserted at least this many hours ago}';

    protected $description = 'Delete images inserted into shared drafts that no saved record or open draft uses';

    public function handle(SharedUploads $uploads): int
    {
        $hours = $this->option('hours') ?? config('filament-collaboration.prune_uploads_after');
        $deleted = $uploads->prune((int) round(max(0, is_numeric($hours) ? (float) $hours : 24) * 3600));

        $this->components->info("Deleted {$deleted} unused ".str('image')->plural($deleted).'.');

        return self::SUCCESS;
    }
}
