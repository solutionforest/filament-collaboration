<?php

declare(strict_types=1);

namespace App\Filament\Resources\Categories;

use App\Filament\Resources\Categories\Pages\ManageCategories;
use App\Models\Category;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\ColorColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use UnitEnum;

/** The blog's sections. Articles keep a category's name; renaming it renames theirs. */
class CategoryResource extends Resource
{
    protected static ?string $model = Category::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedFolder;

    protected static string|UnitEnum|null $navigationGroup = 'Taxonomy';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->required()->maxLength(60)->unique(ignoreRecord: true),
            TextInput::make('slug')->maxLength(80)->unique(ignoreRecord: true)->helperText('Left empty, it is made from the name.'),
            ColorPicker::make('color')->required()->default('#1f7a55'),
            TextInput::make('position')->numeric()->default(0)->helperText('Lower comes first in the navigation.'),
            Textarea::make('description')->rows(2)->maxLength(200)->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('position')
            ->reorderable('position')
            ->columns([
                ColorColumn::make('color')->label(''),
                TextColumn::make('name')->searchable()->weight('bold'),
                TextColumn::make('description')->limit(60)->color('gray'),
                TextColumn::make('documents_count')->counts('documents')->label('Articles')->sortable(),
                TextColumn::make('slug')->color('gray')->url(fn (Category $record): string => $record->publicUrl(), shouldOpenInNewTab: true),
            ])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageCategories::route('/')];
    }
}
