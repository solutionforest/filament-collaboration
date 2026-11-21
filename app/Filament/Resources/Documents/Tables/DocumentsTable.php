<?php

namespace App\Filament\Resources\Documents\Tables;

use App\Models\Document;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Facades\DB;

class DocumentsTable
{
    public static function configure(Table $table): Table
    {
        return $table->poll('10s')->columns([
            TextColumn::make('title')->searchable(),
            TextColumn::make('updated_at')->dateTime(),
            TextColumn::make('presence')->label('Currently viewing')->state(
                fn (Document $record): string => DB::table('collaboration_presence')
                    ->join('users', 'users.id', '=', 'collaboration_presence.user_id')
                    ->where('collaboration_presence.document_id', $record->getKey())
                    ->where('users.workspace_id', $record->workspace_id)
                    ->where('seen_at', '>=', now()->subSeconds(45))
                    ->select('users.name', 'collaboration_presence.page')->get()
                    ->map(fn ($person): string => (is_string($person->name) ? $person->name : '').' ('.(is_string($person->page) ? $person->page : '').')')->implode(', ')
            ),
        ])->recordActions([ViewAction::make(), EditAction::make()]);
    }
}
