<?php

declare(strict_types=1);

namespace App\Filament\Resources\Tags;

use App\Filament\Resources\Tags\Pages\ManageTags;
use App\Models\Tag;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use UnitEnum;

/** Topics across sections. A tag typed into an article joins this list by itself. */
class TagResource extends Resource
{
    protected static ?string $model = Tag::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedHashtag;

    protected static string|UnitEnum|null $navigationGroup = 'Taxonomy';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->required()->maxLength(60)->unique(ignoreRecord: true),
            TextInput::make('slug')->maxLength(80)->unique(ignoreRecord: true)->helperText('Left empty, it is made from the name.'),
            Textarea::make('description')->rows(2)->maxLength(200)->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('name')
            ->columns([
                TextColumn::make('name')->searchable()->sortable()->weight('bold')->prefix('#'),
                TextColumn::make('description')->limit(60)->color('gray'),
                TextColumn::make('articles')->label('Articles')->state(fn (Tag $record): int => $record->documents()->count()),
                TextColumn::make('slug')->color('gray')->url(fn (Tag $record): string => $record->publicUrl(), shouldOpenInNewTab: true),
            ])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageTags::route('/')];
    }
}
