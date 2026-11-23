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
    Livewire?: { find(id: string | null): Wire | undefined }
    Echo?: any
    FilamentRichEditor?: { tiptap?: { pmState?: typeof import('prosemirror-state') } }
    filamentCollaboration?: { inspect(): Array<ReturnType<import('./room/room.js').Room['inspect']>> }
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
