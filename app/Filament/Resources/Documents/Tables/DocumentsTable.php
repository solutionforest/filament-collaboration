<?php

namespace App\Filament\Resources\Documents\Tables;

use App\Filament\Resources\Documents\Tables\Columns\PresenceColumn;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class DocumentsTable
{
    public static function configure(Table $table): Table
    {
        return $table->poll('10s')->columns([
            TextColumn::make('title')->searchable(),
            TextColumn::make('updated_at')->dateTime(),
            PresenceColumn::make('presence'),
        ])->recordActions([ViewAction::make(), EditAction::make()]);
    }
}
