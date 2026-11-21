<?php

namespace App\Filament\Resources\Documents\Tables;

use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class DocumentsTable
{
    public static function configure(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('title')->searchable(),
            TextColumn::make('updated_at')->dateTime(),
        ])->recordActions([ViewAction::make(), EditAction::make()]);
    }
}
