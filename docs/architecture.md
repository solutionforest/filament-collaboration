# Architecture and performance

You do not need this page to use the package. It explains what happens underneath, for reviewers and contributors.

## The flow of an edit

```mermaid
sequenceDiagram
    participant A as Alice's browser
    participant S as Laravel
    participant B as Bob's browser
    A->>A: type, diff against the draft, apply locally
    A->>S: operations, cursor and heartbeat (POST)
    S->>S: authorise, validate, apply under a row lock, store
    B->>S: poll with the last sequence seen
    S->>B: new operations and people
    B->>B: apply, keeping Bob's caret in place
```

With broadcasting on, the server also pushes the new operations to everyone in the room as soon as it stores them, and Bob's browser applies them without asking.

## The shared draft

The draft is a CRDT, so edits made at the same time merge the same way in every browser and on the server:

- **Text** is a replicated growable array (RGA). Each character has an id, `[clock, client]`, and is placed after the character its author saw on its left.
- **Rich text** is one such sequence. Each block is a marker carrying its path in the document tree, so splitting a paragraph inserts one item and making a list never touches anyone's text. Marks are formatting on the characters.
- **Picked values** are last-writer-wins registers.
- **Repeaters and builders** are a sequence of item keys, so adding, removing and moving items merge like text. Text sub-fields are sequences of their own; other sub-fields are registers.

The merge engine is written twice, in PHP (`src/Crdt`) and JavaScript (`resources/js/crdt`). Both replay the same recorded sessions (`tests/Fixtures/convergence.json`), and the JavaScript tests run 2,000 random sessions with four editors that must all converge.

## The server

- `POST {panel}/_collaboration/sync` carries a page's edits, caret and heartbeat in one request, and answers with what the page is missing.
- Each page renders an encrypted token naming its room, user, panel, tenant, record and the fields it may read and write. Each request is authorised again against it.
- Drafts are stored in `filament_collaboration_documents`, with an update log in `filament_collaboration_updates`. Writes happen under a row lock. The log is compacted once a draft is clean and nobody is editing.
- Sync never writes the session, so it cannot race a save or a logout.
- Save takes a cache lock per record, publishes the live fields from the draft, and three-way merges the rest.

## Performance

Measured with `npm run test:load` in `demo/`: real sessions, real tokens, each editor syncing at the browser's pace and a fifth of them typing. Built-in PHP server, SQLite, 4 CPU cores.

| Editors on one article | Requests per second | Median | 95th percentile | Converged |
| --- | --- | --- | --- | --- |
| 10 | 25 | 16 ms | 19 ms | 10 / 10 |
| 25 | 39 | 14 ms | 17 ms | 25 / 25 |
| 50 | 55 | 15 ms | 18 ms | 50 / 50 |
| 100 | 77 | 16 ms | 19 ms | 100 / 100 |

With polling, a keystroke appears in another browser in 350 ms at the median and 560 ms at the 95th percentile (`npm run test:latency`). Crowded rooms and idle tabs poll less often.

### Polling against Reverb

The same load test with `TRANSPORT=reverb`. Every simulated editor listens on a real Reverb socket and applies pushes as the browser does. "Typed to seen" is from one editor's edit to every other editor having it.

| Room | Transport | Requests per second | Typed to seen, median | 95th percentile |
| --- | --- | --- | --- | --- |
| 10 editors, all active | polling | 25 | 359 ms | 522 ms |
| | Reverb | 26 | 61 ms | 70 ms |
| 100 editors, 10 active | polling | 78 | 996 ms | 1,686 ms |
| | Reverb | 21 | 54 ms | 55 ms |
| 100 editors, all moving carets, 20 typing | polling | 81 | 1,083 ms | 1,645 ms |
| | Reverb | 101 | 65 ms | 78 ms |

Pushes make changes 6 to 20 times faster. A room where most people read gets far fewer requests, since nobody needs to poll. The worst case, everyone moving a caret at once, costs more: the server posts every change to Reverb, which raised its own 95th percentile to 780 ms on this machine, while edits still arrived in 65 ms.

![A hundred people on one article](media/hundred-editors.png)

## Tests

| Command | Where | What |
| --- | --- | --- |
| `vendor/bin/pest` | `demo/` | 252 tests: the package's unit tests and the demo's feature tests |
| `vendor/bin/phpstan analyse` | `demo/` | level 10, on the package and the demo |
| `npm run test:e2e` | `demo/` | 39 scenarios in real browsers; `BROWSER=webkit`, `TRANSPORT=reverb` |
| `npm run test:chaos -- 10 42` | `demo/` | four browsers pressing random keys; every round must converge |
| `npm run test:load -- 100 45` | `demo/` | editors and seconds; `TRANSPORT=reverb` and `ACTIVE=0.1` also apply |
| `npm run test:latency` | `demo/` | key press to another screen |
| `npm run check` | root | ESLint, `tsc --strict` over the JSDoc types, and the CRDT tests |
| `npm run media` / `npm run tutorial` | `demo/` | the README's screenshots and video, from real sessions |

The browser JavaScript is plain ES modules with JSDoc types. `npm run typecheck` checks it with TypeScript in strict mode, so a wrong type fails the build the way PHPStan does for PHP. `resources/js/types.d.ts` holds the shared types.
