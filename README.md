# Filament collaboration research prototype

An experimental Laravel 13 / Filament 5 CMS-style application exploring article workflows, resource presence and a collaborative rich-text draft without WebSockets. Two users can open a document's edit page and see Yjs/Tiptap changes over HTTP polling. This is a **demo application, not an installable Filament plugin or production-ready package**.

![The shared article editor](docs/media/shared-edit.png)

[Article list](docs/media/cms-articles.png) · [Quick edit](docs/media/quick-edit.png) · [Private summary preview](docs/media/cms-preview.png)

[Mobile view](docs/media/mobile-edit.png)

[Watch the short captioned demo](docs/media/tutorial.mp4) (silent, approximately 24 seconds). It shows Alice opening a document, typing, and Bob's edits appearing in the same draft; the second browser is not visible in the recording. The automated two-browser script is `scripts/browser-demo.mjs`.

## Requirements

PHP 8.4 with SQLite, Composer, Node.js 22 and npm. The demo uses SQLite, the database session driver and a database-backed cache. the plugin is a beta dependency; its save lock requires a shared, lock-capable cache when running more than one server. No WebSocket server or Redis is required for this local demo.

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

Open `http://127.0.0.1:8000/admin` in two separate browser profiles. Sign in as `alice@example.test` and `bob@example.test` respectively, both with password `password`. These credentials are **only for a local disposable demo**. Open Articles, select Team planning and click Edit in both browsers. The seeded list also contains example news and story articles. Use the status filter and edit a category, summary or proposed slug to try a basic editorial workflow. Type into **Shared draft** on either page; changes should appear in the other after polling. The presence panel shows other people on the record, whether their edit or view page is open, and which demo field has focus. Use Copy document link to invite someone who already has access. The list also shows activity for each record; presence can take up to 45 seconds to clear. Creating a document opens its shareable edit page. A View page shows the shared draft read-only. Article details use the MIT-licensed `third-party/collaboration-plugin` public beta: changes to different fields merge on save, and conflicting changes to the same field prompt a choice. The table also offers Quick edit; its conflict flow is a two-step modal. The shared draft is stored independently from these form fields.

The seed creates the demo accounts and three sample articles. Never seed these accounts on a reachable production system. The demo assigns each user to a workspace and checks a document policy for draft access. Accounts created by the demo seeder belong to workspace 1.

## How it works

The demo combines the plugin for ordinary form saves, edit/view-page presence and Quick edit with a separate client for resource-level presence and the Yjs draft. These two presence systems use different intervals and may briefly disagree. The panel injects the separate client on the Articles list, create, view, and edit pages. A 10-second HTTP heartbeat stores a per-tab presence entry; entries older than 45 seconds are omitted from responses. The edit/view pages load a Yjs document by replaying its ordered update log. Tiptap binds to it and the client posts local updates and polls for remote ones every two seconds. This is a shared draft, saved separately from the normal Filament title field; changes to the draft are automatically stored as Yjs updates, not published to a model column.

## Run checks

```sh
./vendor/bin/pest
./vendor/bin/phpstan analyse --no-progress
./vendor/bin/pint --test
npm run build
```

For the browser checks, seed a fresh local database, start `php artisan serve --host=127.0.0.1 --port=8765`, install Playwright Chromium (`npx playwright install chromium`), then run `node scripts/browser-demo.mjs` and `node scripts/browser-reconnect.mjs`. This writes a screenshot and recording in `docs/media` and edits document #1.

## Limitations and next steps

- Workspace isolation and the document policy are demo-specific, not a complete multi-tenant integration. The update endpoint accepts opaque Yjs bytes without validating the document format; abuse limits, authorization integration, untrusted-content handling and security review are required before deployment.
- This is application code, not a reusable Composer plugin. Presence covers the demo resource and its table rows. the plugin supplies ordinary form field focus and Quick edit presence; the separate Yjs presence indicator covers the demo title and shared draft only. Other resources, custom pages, relation managers and user cursors are not integrated. A shared draft begins after a record is created; there is no pre-record collaborative creation flow.
- The rich text is a standalone shared draft. The Preview summary action is authenticated and shows only saved metadata and summary; the Published status and proposed slug are demo labels and do not publish a page or expose the shared draft. There is no publish action, revision history or validation against a form. the plugin merges its supported Filament save paths using a cache lock. External writers and `saveFormComponentOnly()` do not participate; see the upstream documentation before relying on its conflict handling.
- Pending client updates are also held in session storage for reload and retry within the same browser tab. Closing the tab, clearing storage, storage quota errors, or opening a different browser can still lose pending changes. The server update log grows without bound; snapshots, compaction, retention, multi-database concurrency validation and load testing remain to be designed. Polling and presence are approximate; inactive or closed tabs disappear after the timeout.
- Browser checks cover a simple two-user sequence and a same-tab reload with pending writes only. It does not prove simultaneous offline merges, operational robustness or production security. Compatibility is tested only against the locked dependency versions in this repository.
