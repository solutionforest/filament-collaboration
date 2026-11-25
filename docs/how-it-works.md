# How it works with Filament

You do not need this page to use the package. It explains, in plain words, how the browser script works with Filament, why the package has its own merge engine instead of Yjs, and which parts would work without Filament.

## The browser script and Filament

The package does not replace Filament's fields. Its script, `collaboration.js`, runs beside them and listens.

```mermaid
%% The layers of the browser script, from Filament's fields down to Laravel.
flowchart TB
    subgraph filament ["Filament page"]
        fields["Fields: TextInput, RichEditor (TipTap), Select, Repeater, FileUpload..."]
        livewire["Livewire component and Alpine"]
    end
    subgraph script ["collaboration.js"]
        adapters["Adapters: one per kind of field"]
        binding["Binding: carets, per-person undo, recovery"]
        engine["Merge engine (CRDT): text, rich text, values, lists"]
        room["Room: outbox, sync, presence, Reverb"]
    end
    subgraph laravel ["Laravel"]
        endpoint["{panel}/_collaboration/sync"]
        draft[("Shared draft in the database")]
    end
    fields <--> adapters
    adapters <--> binding
    binding <--> engine
    engine <--> room
    room -- "edits, caret, heartbeat" --> endpoint
    endpoint -- "colleagues' edits, people" --> room
    endpoint <--> draft
    room -. "queueUpdate: the form state stays current" .-> livewire
```

1. **The page says it is collaborative.** The `InteractsWithCollaboration` trait renders a small hidden element through a Filament render hook. It carries an encrypted token, the sync URL and the list of live fields. The script, registered as a normal Filament asset, finds the element and attaches to the page's Livewire component.
2. **Each field gets an adapter.** An adapter knows how to read and write one kind of field. A text input is read from the browser's `input` event. Filament's `RichEditor` is TipTap (ProseMirror) inside an Alpine component, so its adapter takes the editor from Alpine with `getEditor()`. Selects, toggles, dates, repeaters, uploads, and the Markdown and code editors have adapters too, through the same `registerAdapter()` that [other editors](guide.md#adapters-for-other-editors) use.
3. **Your typing becomes small operations.** The adapter compares the field with the shared draft, and only what changed becomes operations, such as "insert *ing* after this character". They are applied to your copy at once.
4. **Typing goes to the package's own endpoint, not through Livewire.** Every 0.4 seconds, or at once with Reverb, the browser sends its operations to `{panel}/_collaboration/sync`. Laravel checks the user and the policy again, validates every operation, stores it in the shared draft and answers with what this browser is missing.
5. **Colleagues' changes go into the field, and into Livewire.** The adapter writes them into the field with your caret kept in place, and the script tells Livewire the new value with `queueUpdate`, so the form state is right without a Livewire request per keystroke.
6. **Save is still Filament's Save.** The trait's `save()` takes a lock, takes the shared draft with everybody's typing, merges the fields that cannot be live, then calls Filament's own save. Validation, hooks and notifications run as usual.

```mermaid
%% One keystroke, from Alice's field to Bob's, through Laravel.
sequenceDiagram
    participant A as Alice's field
    participant J as collaboration.js (Alice)
    participant L as Laravel
    participant K as collaboration.js (Bob)
    participant B as Bob's field
    A->>J: input event
    J->>J: diff against the draft, apply locally
    J->>L: operations (POST /_collaboration/sync)
    L->>L: authorise, validate, store under a row lock
    L-->>K: operations (next poll, or pushed by Reverb)
    K->>B: apply, keep Bob's caret
    K->>K: queueUpdate, so Livewire has the new value
```

## Why not Yjs

Both Yjs and this package's engine are **CRDTs**: a way to merge edits made at the same time so that every copy ends up the same. The package started on Yjs and replaced it with its own engine.

| | Yjs | This package |
| --- | --- | --- |
| What it is | A mature, widely used JavaScript library | A small engine written for this package, in both PHP and JavaScript |
| Who orders the edits | Nobody: copies merge in any order, even peer to peer | Laravel: each edit is applied under a database row lock |
| Can Laravel read the document? | Not easily: Yjs has its own binary format, with no mature PHP version, so it usually needs a Node server such as y-websocket or Hocuspocus | Yes: PHP reads and changes the draft itself, so it checks every operation before anybody else sees it |
| Server to run | A separate Node WebSocket server | Your Laravel app, over HTTP polling or Laravel Reverb |
| Permissions per field | Hard: the whole document goes to every client | Built in: fields a person cannot see never reach their browser |
| Saving to the model | Your own code turns the document back into form data | Built in: Save publishes the draft through Filament's save |
| Editor bindings | Many ready-made ones | Adapters for Filament's fields, and examples for TinyMCE, CKEditor, Quill and Trix |
| Data format | Compact binary, highly optimised | JSON, easy to read and debug; old history is compacted once a draft is saved and nobody is editing |
| Maturity | Years of production use | New, tested with sessions replayed in PHP and JavaScript, 2,000 random four-person sessions that must converge, and chaos and load tests |

Yjs suits apps where browsers sync directly, or through a Node server that never needs to understand the content. A Filament form needs the server to understand it: to check permissions per field, validate HTML and save through Filament. An engine that also runs in PHP keeps Laravel in charge, with no Node server to run. The price is that it is younger than Yjs and does less: only what forms need, which is text, rich text, picked values and lists. [Architecture](architecture.md#the-shared-draft) explains how it works.

## Without Filament

Not as it ships: the package is a Filament plugin. Some of its parts do not depend on Filament at all, though.

```mermaid
%% Which parts of the package need Filament, Livewire or Laravel.
flowchart TB
    engine["Merge engine — needs nothing\nresources/js/crdt, src/Crdt"]
    room["Room and adapter API — needs Livewire and Alpine\nresources/js/room, bindings, adapters/registry.js"]
    filamentAdapters["Filament adapters — needs Filament\nresources/js/adapters/filament.js"]
    server["Sync endpoint, tokens, presence, saving — needs Filament\nsrc/"]
    engine --> room
    room --> filamentAdapters
    room --> server
    classDef free fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef livewire fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef filament fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    class engine free
    class room livewire
    class filamentAdapters,server filament
```

- **The merge engine needs nothing.** `resources/js/crdt` imports no library and no browser API, so it runs in any browser or in Node, and `src/Crdt` is plain PHP.
- **The room and the adapter API need Livewire and Alpine.** They start only when both are on the page, read and write the form through the Livewire component, and save through it.
- **The server side needs Filament.** The sync endpoint is a panel route, the token is issued by a Filament page, access is checked with the resource's `canEdit()` and `canView()`, and saving goes through Filament's `EditRecord`.

Using it with plain Livewire, Inertia or another framework would mean a new server endpoint and a new way to read and save the form. The merge engine and the adapters could be reused as they are.
