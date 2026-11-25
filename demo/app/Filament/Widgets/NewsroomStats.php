<?php

declare(strict_types=1);

namespace App\Filament\Widgets;

use App\Models\Document;
use App\Models\Page;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

/** The newsroom at a glance. */
class NewsroomStats extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected ?string $pollingInterval = '15s';

    protected function getStats(): array
    {
        $workspace = auth()->user()?->workspace_id;
        $articles = Document::query()->where('workspace_id', $workspace);

        return [
            Stat::make('Published', (clone $articles)->published()->count())
                ->description('Live on the blog')->color('success')->icon('heroicon-o-globe-alt'),
            Stat::make('In review', (clone $articles)->where('status', 'review')->count())
                ->description('Waiting for an editor')->color('warning')->icon('heroicon-o-eye'),
            Stat::make('Drafts', (clone $articles)->where('status', 'draft')->count())
                ->description('Being written')->icon('heroicon-o-pencil-square'),
            Stat::make('Authors', User::query()->where('workspace_id', $workspace)->has('articles')->count())
                ->description(Page::query()->count().' static pages')->icon('heroicon-o-user-group'),
        ];
    }
}
