# Fieldnotes: a blog and its CMS

A demo of [`solutionforest/filament-collaboration`](../): **Fieldnotes**, a small city magazine, with a public blog and the Filament CMS its editors write it in together. The package is the repository root; this folder is only the demo.

```bash
composer install && npm install && npm run build
cp .env.example .env && php artisan key:generate
touch database/database.sqlite && php artisan migrate --seed
php artisan serve --no-reload
```

For changes pushed over WebSockets instead of polled, set `BROADCAST_CONNECTION=reverb` in `.env` and run `php artisan reverb:start` next to the server.

The blog is at `/`. The CMS is at `/admin`: open it in two browsers as `alice@example.test` and `bob@example.test` (password `password`). Covers and uploads are served by Laravel while routes are not cached, so `php artisan storage:link` is only needed after `php artisan route:cache`. Coming from an earlier version of this demo, run `php artisan migrate:fresh --seed`.

**The blog** (`app/Http/Controllers/BlogController.php`, `resources/views/site`, `public/css/site.css`):

- A home page with the newest article featured, recent articles, the sections and a newsletter call to action.
- Article pages with a cover, author, reading time, key points, tags, an author box and related articles.
- Archives by category, tag and author, with pagination, and a search box.
- Static pages edited in the CMS: About, Contact, Privacy and Terms. A 404 page.
- Page titles, descriptions, Open Graph tags and article structured data, an RSS feed at `/feed.xml` and a sitemap at `/sitemap.xml`.

The stylesheet is plain CSS with no build step, so the PHP tests render the site without Vite.

**The CMS**, every page live for several editors at once:

- **Dashboard**: what is published, in review and in draft, the recent articles with who is editing each one now, and the drafts.
- **Articles**: every kind of live field, including a cover image and a gallery upload, Markdown and code editors, four third-party editors, two custom components, and a locked "Editor's notes" field. The comments icon in the header (**Comments & history**) opens comments (type `@` to mention a colleague) and versions to restore. The **Checklist** below the form refreshes in the other browser.
- **Pages**: the blog's static pages, in English and Chinese, each language its own shared draft. The slug is behind the Publishing tab and a collapsed section; when Bob is in it, Alice sees his initials on the tab. **Follow** in the avatar list keeps your page on a colleague's field.
- **Categories** and **Tags**: the blog's sections and topics. A tag typed into an article joins the list by itself, and renaming a category renames it on its articles.
- **Authors**: who writes, with a job title, a short bio and an optional profile page on the blog.
- Presence in Redis: set `FILAMENT_COLLABORATION_PRESENCE=redis` in `.env`, with Redis running.

**The content** is written for the demo, in `database/seeders/BlogContent.php`: 18 articles in four sections by seven named authors, of which 13 are published, four static pages, and 100 editors in all, Alice and Bob among them. Everything and everybody in it is fictional. The covers are abstract landscapes drawn by `npm run covers` (`scripts/generate-covers.mjs`) into `database/seeders/covers`, so they are free to use; the seeder copies them to the public disk.

| Command | |
| --- | --- |
| `vendor/bin/pest` | package and demo tests |
| `npm run test:e2e` | real-browser scenarios (`BROWSER=webkit` for WebKit, `TRANSPORT=reverb` over Reverb, `THROTTLE=8` for a slow CPU) |
| `npm run test:load -- 100 45` | 100 editors for 45 seconds; `SERVERS=2 PRESENCE=redis` for two servers on Redis presence |
| `npm run test:latency` | key press to another screen |
| `npm run media` / `npm run tutorial` | the README's screenshots and video |
| `npm run covers` | the seeded articles' covers, after adding one to `BlogContent.php` |

`packages/` holds four small third-party-style field packages, TinyMCE, CKEditor 5, Quill and Trix, each made live by a JavaScript adapter: the examples to copy for your own editor. TinyMCE and CKEditor 5 are GPL-2.0-or-later, and so are the two packages that bundle them; see their `LICENSE.md`. In a product that is not GPL-compatible, use your own licence key from their vendors. `packages/filament-widgets` has two custom components, a post composer and a star rating, which [make your own component live](../docs/custom-components.md) builds step by step. After changing one, run `npm run build:editors` and `php artisan filament:assets`.

`scripts/browser-*.mjs` are the earlier prototype's browser checks. They target its removed Yjs endpoints and no longer run; `npm run test:e2e` covers what they did.

AI assistants: `boost.json` opts into the package's Laravel Boost skill, so `CLAUDE.md`, `AGENTS.md` and `.claude/skills/filament-collaboration-development` describe how to use it. After changing `resources/boost` in the package, run `php artisan boost:update`.
