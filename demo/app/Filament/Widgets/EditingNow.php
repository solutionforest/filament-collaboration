<?php

declare(strict_types=1);

namespace App\Filament\Widgets;

use App\Filament\Resources\Documents\DocumentResource;
use App\Models\Document;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;
use SolutionForest\FilamentCollaboration\Tables\PresenceColumn;

/** The articles edited most recently, and who has each one open right now. */
class EditingNow extends TableWidget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    protected static ?string $heading = 'Recent articles, and who is editing them now';

    public function table(Table $table): Table
    {
        return $table
            ->query(fn () => Document::query()->where('workspace_id', auth()->user()?->workspace_id)->with('author')->latest('updated_at'))
            ->poll('5s')
            ->paginated([5])
            ->defaultPaginationPageOption(5)
            ->recordUrl(fn (Document $record): string => DocumentResource::getUrl('edit', ['record' => $record]))
            ->columns([
                ImageColumn::make('cover_image')->label('')->disk('public')->imageHeight(36)->imageWidth(56),
                TextColumn::make('title')->weight('medium')->limit(50),
                PresenceColumn::make()->label('Editing now'),
                TextColumn::make('status')->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'review' => 'warning', 'published' => 'success', default => 'gray'
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'review' => 'In review', 'published' => 'Published', default => 'Draft'
                    }),
                TextColumn::make('author.name')->label('Author'),
                TextColumn::make('updated_at')->label('Updated')->since(),
            ]);
    }
}
