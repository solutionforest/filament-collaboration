## Filament Collaboration

- `solutionforest/filament-collaboration` lets several people edit one Filament record at once: live fields merge character by character, everybody sees who is where, and saving merges the rest.
- Pages opt in with a trait: `InteractsWithCollaboration` on edit pages, `HasPresence` on list, create, view and custom pages. The panel needs `CollaborationPlugin::make()`.
- Activate the `filament-collaboration-development` skill when adding collaboration to a resource, choosing which fields are live, making a third-party field live with an adapter, adding comments and history, wiring relation managers, configuring presence (Redis) or Reverb, or testing any of it.
