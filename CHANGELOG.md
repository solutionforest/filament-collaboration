# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Until 1.0.0, a minor version may include breaking changes; they are listed under **Changed**.

## [Unreleased]

### Added

- **A lightbox on the documentation website**: the home page's screenshots, and every image and diagram in the docs, open larger, with their caption and arrows to the next.
- **`php artisan make:collaborative-field`**, the custom component guide as a step-by-step command with Laravel Prompts. It asks for the field's name and what it holds (text merged by character with carets, or a choice where the latest change wins), then writes the field, its view, its Alpine component and adapter in plain JavaScript, and a service provider that loads the script and names the adapter, and publishes the script.

### Changed

- **The demo is a real blog and its CMS.** Fieldnotes now has a home page, article pages, archives by category, tag and author with search, static pages edited in the CMS, a 404 page, Open Graph tags, an RSS feed and a sitemap. The CMS gains a dashboard (with who is editing what now), Categories, Tags and Authors, a cover image on articles, and 18 articles written for the demo, with generated covers. The package itself is unchanged.
- **Built on [solutionforest/laravel-collaboration](https://github.com/solutionforest/laravel-collaboration).** The merge engine, shared drafts, presence, comments storage, version history and the sync endpoint now come from that package, which also serves Livewire and Inertia apps. Nothing changes for panels: the tables, config file and plugin options are the same.
- **Moved classes keep their old names** as aliases: `Permissions`, `Contracts\PresenceRepository`, the `Enums` and the `Events`. Code that type-hints other moved classes (`Crdt`, `Documents`, `Presence`, `Rooms\RoomContext`) uses the `SolutionForest\Collaboration` namespace now. `RoomContext` keeps the panel, tenant, resource and page in `meta()`.
- **Restoring a deleted record** from an open page checks the `restore` ability through the record's policy, as resources do by default.

## [0.3.0] - 2026-11-25

A JavaScript API in the style of Livewire and Alpine, and a page on how the package works with Filament.

### Added

- **`FilamentCollaboration.adapter(name, definition)`** registers an adapter, the way `Alpine.data()` registers a component. `window.FilamentCollaboration` is defined in the panel's `<head>` before any script, so an adapter's script no longer needs to wait for the package: an adapter registered early is queued and registered when the package starts. `adapter()` returns `FilamentCollaboration`, so calls chain.
- **How it works with Filament**, a new documentation page: how the browser script works with Filament's fields and Livewire, why the package has its own merge engine instead of Yjs, and which parts would work without Filament.

### Changed

- The package's global is now `window.FilamentCollaboration`, like `Livewire` and `Alpine`. `window.filamentCollaboration`, `registerAdapter()` and the `filament-collaboration:init` event still work, so existing adapters need no change.
- The demo's TinyMCE, CKEditor, Quill, Trix and custom component adapters, the guide, the custom component tutorial and the Laravel Boost skill use `FilamentCollaboration.adapter()`.

### Fixed

- Diagrams on the documentation website are drawn as pictures, in light and dark, instead of showing their Mermaid code.

## [0.2.0] - 2026-11-25

Faster polling with Redis, several panels with their own guards, Laravel Octane, and a documentation website.

### Added

- **Draft heads in the cache.** With a Redis or Memcached cache store, a poll with nothing new reads no draft from the database. With presence, cache and sessions in Redis, an idle poll makes one query instead of two: the record, for the policy check. Every committed change gives the draft a new random token, so a cached head is never out of date. `FILAMENT_COLLABORATION_DRAFT_CACHE` turns it on or off.
- **Laravel Octane.** Documented and tested: a new CI job runs two editors on a single Swoole worker, so every request goes through the same application in memory. `OCTANE=swoole` runs the browser tests on Octane.
- **Several panels.** Tests and a guide section for two panels editing one record together, a token refused on another panel, and a panel without the plugin.
- **Documentation website** at [solutionforest.github.io/filament-collaboration](https://solutionforest.github.io/filament-collaboration/), built with VitePress from `docs/`, the README and this changelog, with a social card per page.
- **README** rewritten: the social card, a plain-language introduction, features under short headings, and a guided tour of the demo with screenshots.

### Changed

- **The Reverb channel asks every session guard**, the default one first, and admits whoever of the signed-in people is in the room. Before, only the default guard was asked. Nothing changes for an app with one guard.
- **The draft cache turns itself on** when `cache_store` (or the default cache) is Redis or Memcached. The package must stay the only writer of `filament_collaboration_documents`: a change made to that table directly is not seen by polls until the next change through the package. Set `FILAMENT_COLLABORATION_DRAFT_CACHE=false` if you write to it yourself.
- The load test (`npm run test:load`) gains `CACHE=redis`, with the cache and sessions in Redis.

### Fixed

- **Reverb with a panel on its own guard** (`->authGuard()`): `/broadcasting/auth` answered 403, and changes arrived by polling instead of being pushed.
- ESLint now lints the website's Node scripts as Node code.
- A browser test clicked the comments button before Livewire had started after a reload.

## [0.1.0] - 2026-11-24

The first release: Google Docs-style collaborative editing for Filament 5.

### Added

- **Live fields.** Text inputs, textareas and Filament's `RichEditor` merge character by character through the package's own CRDT, with no Yjs and nothing to install. Selects, toggles, dates, tags and other pickers take the latest choice. Markdown and code editors are live too.
- **Lists and uploads.** Repeaters and builders merge added, removed and moved items, and text inside items by character. `FileUpload` stores each file as soon as it is uploaded, so everybody's save keeps it.
- **One adapter API for every field.** Filament's own fields and third-party editors go through `filamentCollaboration.registerAdapter()`, with the formats `text`, `html`, `rich` (ProseMirror / TipTap), `value` and `items`. Optional capabilities: per-person undo, error recovery, selection geometry. The demo makes TinyMCE, CKEditor 5, Quill, Trix and two custom components live.
- **Presence.** Avatars in the header, field outlines, carets and selections, who is on which record in tables (`PresenceColumn`), presence in edit modals (`EditAction::make()->collaborate()`), initials on closed tabs, wizard steps and collapsed sections, and **Follow** a colleague.
- **Saving.** One shared draft per record; Save publishes it. Fields that cannot be live get a field-by-field three-way merge with a conflict dialog, and can lock while somebody is in them (`lockWhileEditing()`).
- **Comments and history.** `CollaborationPanelAction`, an icon with the open-comments count: comments on the record or a field, with `@mentions` and database notifications (`mentionable()`), and versions of the draft that anybody may restore for everybody. Optional with `commentsAndHistory()`.
- **Translated pages.** One shared draft per language on pages with a locale switcher.
- **Relation managers** refresh in colleagues' open copies (`SharesRelationChanges`).
- **Real time and scale.** Polling over plain HTTP, or pushes over Laravel Reverb (`broadcasting()`). Presence in the database or in Redis (`FILAMENT_COLLABORATION_PRESENCE=redis`), for several app servers on one database.
- **Security.** Every sync is authorised again and every edit validated; fields a person cannot see never reach their browser. A `collaborate` policy ability, `Permissions::changed()`, and handling of records deleted while open (copy your text, restore if allowed).
- **Audit.** `audit()` keeps a per-minute trail of who changed which field; `SharedDraftSaved` names everybody who contributed.
- **A Laravel Boost skill and guideline** for AI assistants.
- **Requirements:** PHP 8.3+, Laravel 12 or 13, Filament 5.8.3+.

[Unreleased]: https://github.com/solutionforest/filament-collaboration/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/solutionforest/filament-collaboration/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/solutionforest/filament-collaboration/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/solutionforest/filament-collaboration/releases/tag/v0.1.0
