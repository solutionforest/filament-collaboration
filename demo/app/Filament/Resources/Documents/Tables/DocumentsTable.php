<?php

namespace App\Filament\Resources\Documents\Tables;

use App\Models\Document;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use SolutionForest\FilamentCollaboration\Actions\CollaborateAction;
use SolutionForest\FilamentCollaboration\Tables\PresenceColumn;

class DocumentsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->poll('10s')
            ->columns([
                TextColumn::make('title')->searchable()->description(
                    fn (Document $record): ?string => $record->slug ? '/blog/'.$record->slug : null,
                ),
                TextColumn::make('author.name')->label('Author')->toggleable(),
                TextColumn::make('category')->badge(),
                TextColumn::make('status')->badge()->formatStateUsing(fn (string $state): string => match ($state) {
                    'review' => 'In review', 'published' => 'Published', default => 'Draft'
                }),
                TextColumn::make('published_at')->label('Publish at')->since()->sortable()->toggleable(),
                TextColumn::make('updated_at')->label('Last updated')->since()->sortable(),
                PresenceColumn::make('presence'),
            ])
            ->filters([
                SelectFilter::make('status')->options([
                    'draft' => 'Draft',
                    'review' => 'In review',
                    'published' => 'Published',
                ]),
                SelectFilter::make('category')->options([
                    'News' => 'News',
                    'Guides' => 'Guides',
                    'Stories' => 'Stories',
                ]),
            ])
            ->recordActions([
                Action::make('public')
                    ->label('View blog')
                    ->url(fn (Document $record): string => $record->publicUrl())
                    ->openUrlInNewTab()
                    ->visible(fn (Document $record): bool => $record->status === 'published' && filled($record->slug)),
                ViewAction::make(),
                CollaborateAction::configure(EditAction::make()),
            ]);
    }
}
