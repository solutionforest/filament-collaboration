<?php

declare(strict_types=1);

namespace App\Filament\Resources\Pages;

use App\Filament\Resources\Pages\Pages\EditPage;
use App\Filament\Resources\Pages\Pages\ListPages;
use App\Models\Page;
use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use LaraZeus\SpatieTranslatable\Resources\Concerns\Translatable;
use SolutionForest\FilamentCollaboration\Tables\PresenceColumn;
use UnitEnum;

/** The site's static pages, in English and Chinese: each language is its own shared draft, in one room. */
class PageResource extends Resource
{
    use Translatable;

    protected static ?string $model = Page::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDocumentText;

    protected static string|UnitEnum|null $navigationGroup = 'Content';

    protected static ?int $navigationSort = 2;

    protected static ?string $recordTitleAttribute = 'title';

    public static function form(Schema $schema): Schema
    {
        // In tabs and a collapsed section, to show who is in a field that cannot be seen.
        return $schema->components([
            Tabs::make('Page')->columnSpanFull()->tabs([
                Tab::make('Content')->schema([
                    TextInput::make('title')->required()->maxLength(120),
                    Textarea::make('summary')->rows(2),
                    RichEditor::make('body'),
                ]),
                Tab::make('Publishing')->schema([
                    Section::make('Address')->collapsible()->collapsed()->schema([
                        TextInput::make('slug')->required()->maxLength(120),
                    ]),
                ]),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')->searchable(),
                TextColumn::make('slug'),
                PresenceColumn::make(),
            ])
            ->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPages::route('/'),
            'edit' => EditPage::route('/{record}/edit'),
        ];
    }
}
