# Fieldnotes CMS demo

A small newsroom CMS for trying [`solutionforest/filament-collaboration`](../). The package is the repository root; this folder is only the demo.

```bash
composer install && npm install && npm run build
cp .env.example .env && php artisan key:generate
touch database/database.sqlite && php artisan migrate --seed
php artisan serve --no-reload
```

For changes pushed over WebSockets instead of polled, set `BROADCAST_CONNECTION=reverb` in `.env` and run `php artisan reverb:start` next to the server.

Open `/admin` in two browsers as `alice@example.test` and `bob@example.test` (password `password`), and `/blog` for the public site. Coming from an earlier version of this demo, run `php artisan migrate:fresh --seed`.

| Command | |
| --- | --- |
| `vendor/bin/pest` | package and demo tests |
| `npm run test:e2e` | real-browser scenarios (`BROWSER=webkit` for WebKit, `TRANSPORT=reverb` over Reverb) |
| `npm run test:load -- 100 45` | 100 editors for 45 seconds |
| `npm run test:latency` | key press to another screen |
| `npm run media` / `npm run tutorial` | the README's screenshots and video |

`packages/` holds four small third-party-style field packages, TinyMCE, CKEditor 5, Quill and Trix, each made live by a JavaScript adapter: the examples to copy for your own editor. After changing one, run `npm run build:editors` and `php artisan filament:assets`.

`scripts/browser-*.mjs` are the earlier prototype's browser checks. They target its removed Yjs endpoints and no longer run; `npm run test:e2e` covers what they did.
