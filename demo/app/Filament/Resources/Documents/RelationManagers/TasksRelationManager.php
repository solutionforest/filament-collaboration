<?php

declare(strict_types=1);

namespace App\Filament\Resources\Documents\RelationManagers;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;
use SolutionForest\FilamentCollaboration\Concerns\SharesRelationChanges;

/** The article's checklist: a change here shows in colleagues' open copies at once. */
class TasksRelationManager extends RelationManager
{
    use SharesRelationChanges;

    protected static string $relationship = 'tasks';

    protected static ?string $title = 'Checklist';

    // Below a long form: rendered with the page rather than when scrolled to.
    protected static bool $isLazy = false;

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('title')->required()->maxLength(255),
            Toggle::make('done'),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('title')
            ->columns([
                ToggleColumn::make('done')->width('1%'),
                TextColumn::make('title')->searchable(),
            ])
            ->headerActions([CreateAction::make()])
            ->recordActions([EditAction::make(), DeleteAction::make()])
            ->toolbarActions([BulkActionGroup::make([DeleteBulkAction::make()])]);
    }
}
