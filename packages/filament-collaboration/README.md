# Filament Collaboration

Collaborative editing for Filament panels: live presence, field-level three-way merge on save, modal edit support, and room isolation — built as an installable package (not a thin wrapper around `third-party/collaboration-plugin`). A shared CRDT draft layer can sit beside it for rich text that updates as people type.

## Requirements

- PHP 8.3+
- Laravel 12 or 13
- Filament 4.13.3+ or 5.8.3+
- A shared cache store in production (Redis or database) that supports atomic locks

## Installation

```bash
composer require solutionforest/filament-collaboration
php artisan vendor:publish --tag=filament-collaboration-config
```

## Usage

### Edit pages

```php
use Filament\Resources\Pages\EditRecord;
use SolutionForest\FilamentCollaboration\Concerns\InteractsWithCollaboration;

class EditPost extends EditRecord
{
    use InteractsWithCollaboration;
}
```

### View pages

```php
use SolutionForest\FilamentCollaboration\Concerns\HasPresence;

class ViewPost extends ViewRecord
{
    use HasPresence;
}
```

### Table presence + modal edits

```php
use SolutionForest\FilamentCollaboration\Tables\PresenceColumn;

$table
    ->poll('5s')
    ->columns([
        PresenceColumn::make('presence'),
    ])
    ->recordActions([
        EditAction::make()->collaborate(),
    ]);
```

### Tenant / workspace rooms

```php
use SolutionForest\FilamentCollaboration\Presence\PresenceStore;

PresenceStore::resolveRoomUsing(
    fn ($record) => $record->workspace_id.':'.$record->getMorphClass().':'.$record->getKey()
);
```

### Collaborative Filament rich editor

```php
use SolutionForest\FilamentCollaboration\Forms\Components\CollaborativeRichEditor;

CollaborativeRichEditor::make('body')
    ->label('Article body')
    ->columnSpanFull();
```

This is a Filament form field (not a bolted-on panel). TipTap + Yjs sync over your app’s HTTP update endpoints while people type. Exclude it from merge-on-save with `getCollaborationIgnoredFields()` returning `['body']` — the CRDT log is authoritative until you add an explicit publish/HTML projection step.

### Beyond the plugin

The package matches the plugin’s core collaboration surface (presence, merge-on-save, conflicts, modal edits, table column, save notices, events) and adds a **CollaborativeRichEditor** field for live rich text.

## License

MIT
