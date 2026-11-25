<?php

declare(strict_types=1);

namespace App\Filament\Resources\Authors;

use App\Filament\Resources\Authors\Pages\ManageAuthors;
use App\Models\User;
use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use UnitEnum;

/** The newsroom's people: who writes, and how they appear on the blog. */
class AuthorResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $modelLabel = 'author';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUserGroup;

    protected static string|UnitEnum|null $navigationGroup = 'People';

    protected static ?string $recordTitleAttribute = 'name';

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('workspace_id', auth()->user()?->workspace_id);
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->required()->maxLength(120),
            TextInput::make('email')->email()->required()->maxLength(255)->unique(ignoreRecord: true),
            TextInput::make('job_title')->maxLength(80),
            TextInput::make('slug')->label('Profile URL')->maxLength(80)->unique(ignoreRecord: true)
                ->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')
                ->helperText('Gives the author a page on the blog, such as /author/ava-wong.'),
            Textarea::make('bio')->rows(3)->maxLength(400)->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('articles_count', 'desc')
            ->columns([
                TextColumn::make('name')->searchable()->sortable()->weight('bold')
                    ->description(fn (User $record): ?string => $record->job_title),
                TextColumn::make('articles_count')->counts('articles')->label('Articles')->sortable(),
                TextColumn::make('email')->searchable()->color('gray'),
                TextColumn::make('slug')->label('Profile')->color('gray')
                    ->url(fn (User $record): ?string => $record->publicUrl(), shouldOpenInNewTab: true)->placeholder('—'),
            ])
            ->filters([
                Filter::make('writers')->label('With articles')->default()
                    ->query(fn (Builder $query): Builder => $query->has('articles')),
            ])
            ->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageAuthors::route('/')];
    }
}
