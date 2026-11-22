# Filament collaboration

Installable Filament collaboration package plus a Fieldnotes **blog CMS** demo. Built to match the plugin’s collaboration surface without depending on `third-party/collaboration-plugin`. Yjs is optional — only for live co-typing the same rich-text pad.

## Package

Path package: `packages/filament-collaboration` (`solutionforest/filament-collaboration`).

```php
use SolutionForest\FilamentCollaboration\Concerns\InteractsWithCollaboration;
use SolutionForest\FilamentCollaboration\Concerns\HasPresence;
use SolutionForest\FilamentCollaboration\Actions\CollaborateAction;
use SolutionForest\FilamentCollaboration\Tables\PresenceColumn;

class EditPost extends EditRecord
{
    use InteractsWithCollaboration;
}

class ViewPost extends ViewRecord
{
    use HasPresence;
}

// Table
PresenceColumn::make('presence');
CollaborateAction::configure(EditAction::make()); // or EditAction::make()->collaborate()
```

feature parity in this package:

- Record presence (Livewire heartbeat + cache store) and field focus
- Field-by-field three-way merge on save, conflict dialog, pull-their-changes notice
- Modal edit merge (`collaborate()` / `CollaborateAction::configure`)
- Table presence column
- Events: `ChangesMerged`, `ConflictDetected`, `ConflictResolved`
- Tenant/workspace rooms via `PresenceStore::resolveRoomUsing()`

Beyond the plugin: optional `CollaborativeRichEditor` (TipTap + Yjs over HTTP) for live co-writing. Ordinary blog fields (title, body HTML, SEO, related posts…) merge on save and show per-field presence without Yjs.

See `packages/filament-collaboration/README.md`.

## Demo (Fieldnotes blog CMS)

Public site: `/blog` and `/blog/{slug}` (SEO meta, tags, related posts). CMS: Filament Articles with Article / SEO / Related posts / optional Live Yjs pad. Presence shows which editor is in which field (e.g. `Alice → SEO title`).

![The shared article editor](docs/media/shared-edit.png)

[Article list](docs/media/cms-articles.png) · [Conflict dialog](docs/media/conflict-dialog.png) · [Private summary preview](docs/media/cms-preview.png)

### Run locally

```sh
composer install
cp .env.example .env
php artisan key:generate
mkdir -p database
touch database/database.sqlite
php artisan migrate --seed
php artisan filament:assets
npm ci
npm run build
php artisan serve
```

- Public blog: `http://127.0.0.1:8000/blog`
- CMS: `http://127.0.0.1:8000/admin` — open the same article as `alice@example.test` / `bob@example.test` (password `password`) in two profiles to see field-level presence. Local disposable accounts only.

### Checks

```sh
./vendor/bin/pest
./vendor/bin/phpstan analyse --no-progress
./vendor/bin/pint --test
npm run build
```

## Limitations

- Optional live pad: Yjs updates are opaque bytes (no server-side Yjs validation). Core CMS collab does not need Yjs.
- Reliable offline, multi-database concurrency validation and security review remain open.
- the plugin extras not fully mirrored yet: spatie-translatable locale merge, leave beacon middleware matrix, and their full comparison edge-case suite.
- Demo presence HTTP endpoint and package Livewire presence both run; unify further before a public release.
- Keep the PR draft; use only local fake data.
