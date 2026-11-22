<?php

namespace Tests\Tenancy;

use Filament\Pages\Page;
use SolutionForest\FilamentCollaboration\Concerns\HasPresence;

class TeamBoard extends Page
{
    use HasPresence;

    protected static ?string $slug = 'board';

    protected string $view = 'filament-panels::pages.page';
}
