<?php

namespace App\Filament\Resources\Documents\Tables;

use App\Filament\Resources\Documents\Tables\Columns\PresenceColumn;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use ThirdParty\Collab\Actions\CollabAction;

class DocumentsTable
{
    public static function configure(Table $table): Table
    {
        return $table->poll('10s')->columns([
            TextColumn::make('title')->searchable(),
            TextColumn::make('category')->badge(),
            TextColumn::make('status')->badge()->formatStateUsing(fn (string $state): string => match ($state) {
                'review' => 'In review', 'published' => 'Published', default => 'Draft'
            }),
            TextColumn::make('updated_at')->label('Last updated')->since()->sortable(),
            PresenceColumn::make('presence'),
        ])->filters([SelectFilter::make('status')->options(['draft' => 'Draft', 'review' => 'In review', 'published' => 'Published'])])->recordActions([ViewAction::make(), EditAction::make(), CollabAction::configure(EditAction::make('quickEdit')->label('Quick edit')->modal())]);
    }
}
