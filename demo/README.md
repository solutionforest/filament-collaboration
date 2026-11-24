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

What to try:

- **Articles**: every kind of live field, including a gallery upload, Markdown and code editors, four third-party editors, and a locked "Editor's notes" field. The comments icon in the header (**Comments & history**) opens comments (type `@` to mention a colleague) and versions to restore. The **Checklist** below the form refreshes in the other browser.
- **Translated pages**: English and Chinese, each its own shared draft. The slug is behind the Publishing tab and a collapsed section; when Bob is in it, Alice sees his initials on the tab. **Follow** in the avatar list keeps your page on a colleague's field.
- Presence in Redis: set `FILAMENT_COLLABORATION_PRESENCE=redis` in `.env`, with Redis running.

| Command | |
| --- | --- |
| `vendor/bin/pest` | package and demo tests |
| `npm run test:e2e` | real-browser scenarios (`BROWSER=webkit` for WebKit, `TRANSPORT=reverb` over Reverb, `THROTTLE=8` for a slow CPU) |
| `npm run test:load -- 100 45` | 100 editors for 45 seconds; `SERVERS=2 PRESENCE=redis` for two servers on Redis presence |
| `npm run test:latency` | key press to another screen |
| `npm run media` / `npm run tutorial` | the README's screenshots and video |

`packages/` holds four small third-party-style field packages, TinyMCE, CKEditor 5, Quill and Trix, each made live by a JavaScript adapter: the examples to copy for your own editor. TinyMCE and CKEditor 5 are GPL-2.0-or-later, and so are the two packages that bundle them; see their `LICENSE.md`. In a product that is not GPL-compatible, use your own licence key from their vendors. `packages/filament-widgets` has two custom components, a post composer and a star rating, which [make your own component live](../docs/custom-components.md) builds step by step. After changing one, run `npm run build:editors` and `php artisan filament:assets`.

`scripts/browser-*.mjs` are the earlier prototype's browser checks. They target its removed Yjs endpoints and no longer run; `npm run test:e2e` covers what they did.

AI assistants: `boost.json` opts into the package's Laravel Boost skill, so `CLAUDE.md`, `AGENTS.md` and `.claude/skills/filament-collaboration-development` describe how to use it. After changing `resources/boost` in the package, run `php artisan boost:update`.
