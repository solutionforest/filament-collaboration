<?php

declare(strict_types=1);

namespace App\Filament\Widgets;

use App\Filament\Resources\Documents\DocumentResource;
use App\Models\Document;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

/** What is not published yet: drafts and articles in review. */
class Drafts extends TableWidget
{
    // Rendered with the page, like the panel's notifications: a lazy load cut short by leaving the page is reported as an error.
    protected static bool $isLazy = false;

    protected static ?int $sort = 3;

    protected int|string|array $columnSpan = 'full';

    protected static ?string $heading = 'Drafts and reviews';

    public function table(Table $table): Table
    {
        return $table
            ->query(fn () => Document::query()
                ->where('workspace_id', auth()->user()?->workspace_id)
                ->whereIn('status', ['draft', 'review'])
                ->with('author')
                ->orderByRaw("case status when 'review' then 0 else 1 end")
                ->latest('updated_at'))
            ->paginated([5])
            ->defaultPaginationPageOption(5)
            ->recordUrl(fn (Document $record): string => DocumentResource::getUrl('edit', ['record' => $record]))
            ->columns([
                TextColumn::make('title')->weight('medium')->limit(60),
                TextColumn::make('status')->badge()
                    ->color(fn (string $state): string => $state === 'review' ? 'warning' : 'gray')
                    ->formatStateUsing(fn (string $state): string => $state === 'review' ? 'In review' : 'Draft'),
                TextColumn::make('category')->color('gray'),
                TextColumn::make('author.name')->label('Author'),
                TextColumn::make('updated_at')->label('Updated')->since(),
            ]);
    }
}
