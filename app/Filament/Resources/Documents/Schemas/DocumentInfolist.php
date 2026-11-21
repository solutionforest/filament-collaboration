<?php

namespace App\Filament\Resources\Documents\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class DocumentInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Article details')->schema([
                TextEntry::make('title'),
                TextEntry::make('slug')->placeholder('Not set'),
                TextEntry::make('category')->badge(),
                TextEntry::make('status')->badge(),
                TextEntry::make('excerpt')->label('Summary')->placeholder('No summary yet')->columnSpanFull(),
                TextEntry::make('updated_at')->label('Last updated')->dateTime(),
            ])->columns(2),
        ]);
    }
}
