# Filament collaboration research prototype

An experimental Laravel 13 / Filament 5 application exploring resource presence and a collaborative rich-text draft without WebSockets. Two users can open a document's edit page and see Yjs/Tiptap changes over HTTP polling. This is a **demo application, not an installable Filament plugin or production-ready package**.

![The shared document editor](docs/media/shared-edit.png)

[Watch the short captioned demo](docs/media/tutorial.mp4) (silent, approximately 19 seconds). It shows Alice opening a document, typing, and Bob's edits appearing in the same draft; the second browser is not visible in the recording. The automated two-browser script is `scripts/browser-demo.mjs`.

## Requirements

PHP 8.4 with SQLite, Composer, Node.js 22 and npm. The demo uses SQLite and the database session driver. No WebSocket server or Redis is required.

## Run locally

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

Open `http://127.0.0.1:8000/admin` in two separate browser profiles. Sign in as `alice@example.test` and `bob@example.test` respectively, both with password `password`. These credentials are **only for a local disposable demo**. Open Documents, select Team planning and click Edit in both browsers. Type into **Shared draft** on either page; changes should appear in the other after polling. The presence panel shows active people and their current page; the list also shows activity for each record. Creating a document opens its shareable edit page. A View page shows the shared draft read-only. The title is an ordinary Filament form field and is saved separately.

The seed creates the demo accounts and a record. Never seed these accounts on a reachable production system. The demo assigns each user to a workspace and checks a document policy for draft access. Accounts created by the demo seeder belong to workspace 1.

## How it works

The panel injects a small client on the Documents list, create, view, and edit pages. A 10-second HTTP heartbeat stores a per-tab presence entry; entries older than 45 seconds are omitted from responses. The edit/view pages load a Yjs document by replaying its ordered update log. Tiptap binds to it and the client posts local updates and polls for remote ones every two seconds. This is a shared draft, saved separately from the normal Filament title field; changes to the draft are automatically stored as Yjs updates, not published to a model column.

## Run checks

```sh
./vendor/bin/pest
./vendor/bin/phpstan analyse --no-progress
./vendor/bin/pint --test
npm run build
```

For the browser check, seed a fresh local database, start `php artisan serve --host=127.0.0.1 --port=8765`, install Playwright Chromium (`npx playwright install chromium`), then run `node scripts/browser-demo.mjs`. This writes a screenshot and recording in `docs/media` and edits document #1.

## Limitations and next steps

- Workspace isolation and the document policy are demo-specific, not a complete multi-tenant integration. The update endpoint accepts opaque Yjs bytes without validating the document format; abuse limits, authorization integration, untrusted-content handling and security review are required before deployment.
- This is application code, not a reusable Composer plugin. Presence covers the demo resource and its table rows; custom pages, relation managers, modals, field focus and user cursors are not implemented. A shared draft begins after a record is created; there is no pre-record collaborative creation flow.
- The rich text is a standalone shared draft. There is no publish action, revision history, validation against a form, or protection for concurrent edits to normal Filament fields.
- Pending client updates are also held in session storage for reload and retry within the same browser tab. Closing the tab, clearing storage, storage quota errors, or opening a different browser can still lose pending changes. The server update log grows without bound; snapshots, compaction, retention, multi-database concurrency validation and load testing remain to be designed. Polling and presence are approximate; inactive or closed tabs disappear after the timeout.
- The browser check covers a simple two-user sequence only. It does not prove simultaneous offline merges, operational robustness or production security. Compatibility is tested only against the locked dependency versions in this repository.
