<?php

namespace App\Filament\Resources\Documents\Tables;

use App\Models\Category;
use App\Models\Document;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Actions\EditAction;
use Filament\Actions\ForceDeleteAction;
use Filament\Actions\RestoreAction;
use Filament\Actions\ViewAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TrashedFilter;
use Filament\Tables\Table;
use SolutionForest\FilamentCollaboration\Tables\PresenceColumn;

class DocumentsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->poll('3s')
            ->recordUrl(fn (Document $record): string => route('filament.admin.resources.documents.edit', $record))
            ->columns([
                ImageColumn::make('cover_image')->label('')->disk('public')->imageHeight(40)->imageWidth(64)->extraImgAttributes(['class' => 'rounded-md object-cover']),
                TextColumn::make('title')->searchable()->weight('medium')->limit(44)->description(
                    fn (Document $record): ?string => $record->slug ? '/blog/'.$record->slug : null,
                ),
                PresenceColumn::make(),
                TextColumn::make('status')->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'review' => 'warning', 'published' => 'success', default => 'gray'
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'review' => 'In review', 'published' => 'Published', default => 'Draft'
                    }),
                TextColumn::make('category')->color('gray'),
                TextColumn::make('author.name')->label('Author')->toggleable(),
                TextColumn::make('updated_at')->label('Updated')->since()->sortable(),
                TextColumn::make('published_at')->label('Publish at')->since()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')->options([
                    'draft' => 'Draft',
                    'review' => 'In review',
                    'published' => 'Published',
                ]),
                SelectFilter::make('category')->options(fn (): array => Category::options()),
                TrashedFilter::make(),
            ])
            ->recordActions([
                ActionGroup::make([
                    EditAction::make()->label('Quick edit')->modalWidth('6xl')->collaborate(),
                    ViewAction::make(),
                    Action::make('public')
                        ->label('Open on the blog')
                        ->icon(Heroicon::OutlinedGlobeAlt)
                        ->url(fn (Document $record): string => $record->publicUrl())
                        ->openUrlInNewTab()
                        ->visible(fn (Document $record): bool => $record->status === 'published' && filled($record->slug)),
                    RestoreAction::make(),
                    ForceDeleteAction::make(),
                ]),
            ]);
    }
}
