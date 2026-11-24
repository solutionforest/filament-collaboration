# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Until 1.0.0, a minor version may include breaking changes; they are listed under **Changed**.

## [Unreleased]

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

[Unreleased]: https://github.com/solutionforest/filament-collaboration/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/solutionforest/filament-collaboration/releases/tag/v0.1.0
