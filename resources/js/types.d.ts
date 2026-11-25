/**
 * Types shared by the browser code, checked by `npm run typecheck`. The code
 * is plain JavaScript with JSDoc, so no build step is needed to read it.
 */

/** `[clock, client]`, ordered by clock and then by client. */
type Id = [number, number]

/** `[clock, client, length]`: consecutive ids from one client. */
type IdRange = [number, number, number]

/** Any value JSON can carry. */
type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

/** A token's content: a character, a block marker `{b: 1}`, an embed `{n}` or a list item `{i}`. */
type TokenValue = string | { b?: 1; n?: string; i?: string }

type Formatting = Record<string, string>

interface Token {
    value: TokenValue
    formatting: Formatting
    id?: Id | null
}

/** An edit to the shared draft, as the PHP side validates it. */
interface Operation {
    o: 'ins' | 'del' | 'fmt' | 'set' | 'put'
    f: string
    id?: Id
    after?: Id | null
    v?: any
    a?: Formatting
    ids?: IdRange[]
    k?: string
    /** A list item's key, for `put` and for typing in a list's text sub-field. */
    i?: string
    /** A list item's sub-field path. */
    p?: string
}

/** Where someone's caret is: the ids on its left. In a list, also which item's sub-field. */
interface Cursor {
    anchor: Id | null
    head: Id | null
    item?: string
    path?: string
}

/** A TipTap / ProseMirror JSON node. */
interface RichNode {
    type: string
    attrs?: Record<string, any> | null
    content?: RichNode[]
    marks?: RichNode[]
    text?: string
}

type FieldKind = 'text' | 'rich' | 'value' | 'items'

interface DocumentState {
    clock?: number
    fields?: Record<string, FieldState>
}

interface FieldState {
    k: FieldKind
    r?: SequenceData
    v?: any
    at?: Id
    m?: Record<string, Record<string, { v?: any; at?: Id; r?: SequenceData }>>
    t?: string[]
}

/** Runs as stored: `[clock, client, value, deleted, attributes]`. */
type SequenceData = Array<[number, number, string | object, (0 | 1)?, Record<string, [string | null, number, number]>?]>

interface Batch {
    n: number
    ops: Operation[]
}

/** What `RoomRenderer` puts in `data-collaboration`. */
interface RoomConfig {
    id: string
    url: string
    csrf: string
    token: string
    client: number
    mode: 'editing' | 'viewing'
    scoped: boolean
    storageKey: string
    statePath: string
    fields: Record<string, FieldKind>
    labels: Record<string, string>
    /** Fields that are not live and are read-only for others while somebody is in them. */
    locks: string[]
    /** Where the shared draft is kept: one per language on a translated page. */
    draft?: string
    /** Live fields whose items are uploaded files. */
    uploads?: string[]
    /** The adapter each live field is edited through, if not a built-in binding. */
    adapters?: Record<string, string>
    reactive: string[]
    canPull: boolean
    interval: number
    channel: string | null
    avatarLimit: number
    reportErrors?: boolean
    strings: Record<string, string>
    modes: Record<string, string>
}

interface Person {
    client: number
    key: string
    name: string
    initials: string
    avatar: string | null
    color: string
    mode: string
    field: string | null
    cursor: Cursor | null
    idle: boolean
    self: boolean
}

/** The part of a Livewire component this package uses. */
interface Wire {
    $get(path: string, live?: boolean): any
    $set(path: string, value: unknown, live?: boolean): void
    $call(method: string, ...parameters: unknown[]): Promise<any>
    $refresh(): void
    mountAction(name: string): void
    __instance?: { queueUpdate?(path: string, value: unknown): void }
    [property: string]: any
}

interface Window {
    Alpine?: { $data(element: Element): any }
    Livewire?: { find(id: string | null): Wire | undefined; dispatch(event: string, params?: Record<string, unknown>): void }
    Echo?: any
    FilamentRichEditor?: { tiptap?: { pmState?: typeof import('prosemirror-state') } }
    FilamentCollaboration?: CollaborationApi
    /** The name before 0.3.0. */
    filamentCollaboration?: CollaborationApi
}

/** `window.FilamentCollaboration`. */
interface CollaborationApi {
    /** Teaches the package an editor: `FilamentCollaboration.adapter('trix', { format: 'html', attach })`. */
    adapter(name: string, definition: AdapterDefinition): CollaborationApi
    /** The former name of `adapter()`. */
    registerAdapter(name: string, definition: AdapterDefinition): CollaborationApi
    inspect(): Array<ReturnType<import('./room/room.js').Room['inspect']>>
    minimalChange: typeof import('./adapters/registry.js').minimalChange
    html: typeof import('./adapters/html.js')
    prosemirror: typeof import('./adapters/prosemirror.js')
    caretRect(input: HTMLInputElement | HTMLTextAreaElement, offset: number): DOMRect | null
}

/** Where to draw somebody's caret and selection, in viewport coordinates. */
interface Geometry {
    caret: DOMRect
    selection: DOMRect[]
    /** Only what is inside this box is visible. */
    clip: DOMRect
}

/** The part of Filament's TipTap editor this package uses. ProseMirror comes from Filament, never bundled. */
interface RichEditor {
    state: import('prosemirror-state').EditorState
    view: import('prosemirror-view').EditorView
    schema: import('prosemirror-model').Schema
    isDestroyed: boolean
    isFocused: boolean
    on(event: 'update', handler: (props: { transaction?: import('prosemirror-state').Transaction }) => void): void
    on(event: 'selectionUpdate', handler: () => void): void
    off(event: string, handler: (...args: any[]) => void): void
    getJSON(): RichNode
    chain(): any
}

/** What an adapter is given for one field. */
interface AdapterContext {
    /** The field's name, as in the form's state: `body`. */
    field: string
    /** The field's wrapper element. */
    element: Element
    /** The field's Livewire state path: `data.body`. */
    statePath: string
    wire: Wire
    /** Call whenever the editor's content changes. */
    changed(): void
    /** Call whenever the caret or selection moves. */
    moved(): void
    /** Undo this person's own typing, not colleagues'. For `text` adapters: call on Ctrl+Z instead of the editor's own undo. */
    undo(): void
    /** Redo this person's own typing. */
    redo(): void
    /**
     * The editor threw on a change. Nothing is lost: the draft is shown again with the caret kept.
     * Repeated failures make the field merge on save. `details` are reported where `reportEditorErrors()` is on.
     */
    recover(error: unknown, details?: { selection?: unknown; doc?: unknown }): void
}

/**
 * One attached editor. Positions are UTF-16 offsets into `read()` for text,
 * and draft positions (one per character, block or embed) for HTML and rich:
 * see `adapters/html.js` and `adapters/prosemirror.js`.
 */
interface AdapterHandle {
    /** The editor's content: a string for text and HTML, anything JSON for a value. */
    read(): any
    /** Replaces the content. Change only what differs, so the editor's own state survives. */
    write(value: any): void
    /** For `items`, also which item and sub-field: `{ item: key, path: 'title', anchor, head }`. */
    selection?(): AdapterSelection | null
    setSelection?(selection: AdapterSelection): void
    /** Where a caret at this position is drawn, for other people's carets. */
    caretRect?(position: number): DOMRect | null
    /** Somebody's caret and selection between two positions, if the editor can draw a selection. Used instead of `caretRect`. */
    geometry?(range: AdapterSelection): Geometry | null
    /** False when nothing changed since the last `read()`: reading is skipped. For editors where reading is costly. */
    isDirty?(): boolean
    /** Whether the editor has focus; the wrapper containing the focus otherwise. */
    isFocused?(): boolean
    /** True during IME composition: no remote change is applied meanwhile. */
    isBusy?(): boolean
    /** False once the editor was replaced, for example by a Livewire morph. */
    isAlive?(): boolean
    destroy?(): void
}

/** Positions in the editor; for a list, in one item's text sub-field. */
interface AdapterSelection {
    anchor: number
    head: number
    item?: string
    path?: string
}

interface AdapterDefinition {
    /**
     * `text` merges characters; `html` and `rich` merge characters, blocks and marks, as an HTML string
     * or as a ProseMirror / TipTap JSON document; `value` takes the latest; `items` is a list of items by
     * key, as Filament's repeaters keep it: adding, removing and moving merge, text sub-fields by character.
     */
    format: 'text' | 'html' | 'rich' | 'value' | 'items'
    /** Null while the editor is not ready yet: it is asked again shortly. False: it cannot be live here, and merges on save. */
    attach(context: AdapterContext): AdapterHandle | null | false
}
