---
name: filament-collaboration-development
description: "Use when working with solutionforest/filament-collaboration: real-time collaborative editing of Filament records. Trigger on CollaborationPlugin, InteractsWithCollaboration, HasPresence, PresenceColumn, ->collaborative(), ->lockWhileEditing(), CollaborationPanelAction, comments, @mentions, version history, SharesRelationChanges, adapters for third-party editors (FilamentCollaboration.adapter, AdapterType), Reverb broadcasting for collaboration, or Redis presence. Tasks include making a resource collaborative, choosing which fields are live, permissions, translated pages, uploads, comments and history, relation managers, scaling presence, and testing."
license: MIT
metadata:
  author: solutionforest
---

# solutionforest/filament-collaboration

Several people edit one record at once. Live fields are merged by the package's own CRDT, kept on the server as one shared draft per record (per language on translated pages). Everybody sees avatars, field outlines and carets. Fields that cannot be live merge field by field on save.

Requires PHP 8.3+, Laravel 12+, Filament 5.8.3+. Full guide: `docs/guide.md` in the package repository (not in the installed package).

## Setup

```bash
composer require solutionforest/filament-collaboration
php artisan migrate
```

```php
use SolutionForest\FilamentCollaboration\CollaborationPlugin;

$panel->plugin(CollaborationPlugin::make());
```

```php
use SolutionForest\FilamentCollaboration\Concerns\HasPresence;
use SolutionForest\FilamentCollaboration\Concerns\InteractsWithCollaboration;

class EditPost extends EditRecord
{
    use InteractsWithCollaboration; // live editing, presence, merge on save
}

class ListPosts extends ListRecords
{
    use HasPresence; // presence only: list, create, view and custom pages
}
```

Do not override `save()` or `getRecord()` handling in a way that skips the trait's hooks; use Filament's `mutateFormDataBeforeSave()` and `afterSave()` as usual.

## Which fields are live

- Text inputs, textareas and Filament's `RichEditor` merge by character. Selects, toggles, dates, tags and other pickers take the latest choice. Repeaters and builders merge items; text sub-fields merge by character. `FileUpload` stores each file at once and merges the list. `MarkdownEditor` and `CodeEditor` are live through shipped adapters.
- Passwords, hidden or disabled fields and unknown third-party fields merge on save.

```php
TextInput::make('internal_notes')->collaborative(false);      // never live
TextInput::make('seo_title')->collaborative('edit-seo');      // live only for those the Gate ability allows
Select::make('tags')->relationship('tags', 'name')->multiple()->collaborative(); // many-to-many is off by default
Textarea::make('legal_notes')->lockWhileEditing();             // not live: read-only for others while someone is in it

CollaborationPlugin::make()
    ->liveEditing(fn (?Model $record): bool => ! $record?->is_locked) // whole panel or some records
    ->lockWhileEditing();                                             // lock every field that cannot be live
```

Prefer a Gate ability string over a closure for `collaborative()`: a closure decides whether the field is in the shared draft at all, which must be the same for everybody.

## Permissions

Every sync re-checks the user, panel, tenant and record, and the resource's `canEdit()` / `canView()`. Add a `collaborate` policy ability to stop someone typing into the shared draft (they still edit and merge on save). After changing roles or field access:

```php
use SolutionForest\FilamentCollaboration\Permissions;

Permissions::changed($post); // or Permissions::changed() for everybody
```

## Comments and version history

```php
use SolutionForest\FilamentCollaboration\Actions\CollaborationPanelAction;

protected function getHeaderActions(): array
{
    return [CollaborationPanelAction::make()];
}

CollaborationPlugin::make()
    ->mentionable(fn (Model $record) => User::query()->where('team_id', $record->team_id)); // @mentions; notify: false to skip notifications

$panel->databaseNotifications(); // mentioned people get a Filament database notification
```

`CollaborationPlugin::make()->commentsAndHistory(false)` (or a closure given `$record`) turns it off: no button, and no posting or restoring. One slide-over: **Comments** (on the record or a field, resolve and reopen, `@mentions`) and **History** (versions every 5 minutes while editing, on save and around a restore; restoring applies for everybody). Listen to `SolutionForest\FilamentCollaboration\Events\CommentPosted` (`record`, `by`, `comment`, `url`) to send comments elsewhere.

## Relation managers

```php
use SolutionForest\FilamentCollaboration\Concerns\SharesRelationChanges;

class TasksRelationManager extends RelationManager
{
    use SharesRelationChanges; // changes here refresh colleagues' open copies
}
```

## Tables and modals

```php
use SolutionForest\FilamentCollaboration\Tables\PresenceColumn;

$table->columns([PresenceColumn::make()])
    ->recordActions([EditAction::make()->collaborate()]); // presence in the edit modal, and its save merges into open editors
```

## Adapters: third-party editors and Filament's own fields

Every field goes through an adapter, Filament's own too (`filament-text-input`, `filament-value`, `filament-rich-editor`, `filament-repeater`, `filament-file-upload`, `filament-markdown-editor`, `filament-code-editor`): copy them from `resources/js/adapters/filament.js`. Make a field the package does not know live the same way: name an adapter in PHP and register it in JavaScript. For a new field of the app's own, `php artisan make:collaborative-field Name --kind=text|choice` writes the field, its view, its Alpine component and adapter, and the service provider that registers them; edit those files rather than starting from scratch. Formats: `text`, `html`, `rich` (a ProseMirror / TipTap document, with `FilamentCollaboration.prosemirror` helpers), `value` and `items` (a list by key; positions carry `item` and `path`). Optional: `undo()`/`redo()` and `recover(error)` on the context, `geometry()` and `isDirty()` on the handle.

```php
use SolutionForest\FilamentCollaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Fields\Types\AdapterType;

// In a service provider's boot(): every TinyEditor field uses the 'tinymce' adapter.
CollaborationPlugin::registerFieldTypes(AdapterType::make([TinyEditor::class], adapter: 'tinymce', kind: FieldKind::RichText));

// Or on one field:
TinyEditor::make('body')->collaborative(adapter: 'tinymce', as: FieldKind::RichText);
```

```js
// FilamentCollaboration is defined in the panel's <head>, so this works whichever script loads first.
FilamentCollaboration.adapter('tinymce', {
    format: 'html', // 'text' merges by character, 'html' by character, block and mark, 'value' takes the latest
    attach({ element, changed, moved }) {
        const editor = findEditorIn(element)
        if (!editor) return null // not ready: asked again shortly
        editor.on('input', changed)
        editor.on('selectionchange', moved)
        return { read: () => editor.getContent(), write: (html) => editor.setContent(html) }
    },
})
```

- Only `read` and `write` are required; add `selection`, `setSelection`, `caretRect`, `isFocused`, `isBusy` for carets. Write only what differs (`FilamentCollaboration.minimalChange(old, next)`) so the editor keeps its undo history.
- `attach()` returning `false` means "cannot be live in this browser": the field merges on save.
- Do not keep the editor on Alpine reactive data (`this.editor = ...`): Alpine's proxy breaks editors such as CKEditor and Quill. Keep it on the element.
- For a picker-like custom field, `ValueType::make([StarRating::class])` in `->fieldTypes([...])` is enough, without JavaScript.
- A text field inside an Alpine component (a `<textarea>` with `x-model`): after `setRangeText()` in `write()`, dispatch an `input` event so `x-model` and the Livewire state follow. `api.caretRect(input, offset)` measures carets in any input or textarea.
- Step-by-step guide with a post composer and a star rating: `docs/custom-components.md` in the package repository; the code is in `demo/packages/filament-widgets`.

## Real time and scale

```php
CollaborationPlugin::make()->broadcasting(); // push over Reverb / Laravel broadcasting; polling is the fallback
```

```dotenv
FILAMENT_COLLABORATION_PRESENCE=redis              # presence in Redis instead of a database write per heartbeat
FILAMENT_COLLABORATION_REDIS_CONNECTION=default
FILAMENT_COLLABORATION_CACHE_STORE=redis           # shared by all servers, with atomic locks: serialises saves
```

Several application servers can share one database. Bind your own `Contracts\PresenceRepository` to keep presence elsewhere.

## Events

`SharedDraftSaved` (with the contributors), `ConflictDetected`, `ConflictResolved`, `ChangesMerged`, `DraftEdited` (with `audit()` on), `CommentPosted`.

## Testing

- Feature tests: `Livewire::test(EditPost::class, ['record' => $post->id])` works as usual; the trait mounts without a browser. Call page methods such as `postCollaborationComment($body, $field)` and `restoreCollaborationVersion($id)` directly.
- Simulate a second editor by posting to the sync endpoint with the room token the page renders (`data-collaboration`), as `demo/tests/Support/Editor.php` in the package repository does.
- Browser behaviour (carets, merging while typing) needs real browsers: see `demo/tests/browser` in the package repository.

## Common mistakes

- Using `InteractsWithCollaboration` on a page without a record (create pages): use `HasPresence` there.
- Expecting a custom third-party field to be live without an adapter: it merges on save and shows who is editing it.
- A `collaborative(fn () => ...)` closure that differs per user: use a Gate ability string instead.
- Forgetting a shared cache store with locks on several servers: saves are then not serialised.
- Relation managers below a long form are lazy; with `SharesRelationChanges` they refresh once loaded.
