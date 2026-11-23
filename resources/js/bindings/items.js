import { canonical, toIndex, toOffset } from '../crdt/id.js'
import { flatten } from '../crdt/item-list.js'
import { normalizeValue } from '../crdt/document.js'
import { modelOf, plain } from '../dom.js'
import { measureText } from '../ui/measure-text.js'
import { Binding } from './binding.js'



/** Livewire's name for a file that is uploaded but not yet stored. */
const isTemporary = (/** @type {unknown} */ file) => typeof file === 'string' && file.startsWith('livewire-file:')

/**
 * Repeaters and builders. Items are added, removed and moved by Filament's
 * own actions; this follows the resulting state. A change in which items
 * exist re-renders the field, a change inside an item does not.
 *
 * Text inputs and textareas inside items merge by character, keep the caret
 * through colleagues' typing, and show where colleagues are.
 */
export class ItemsBinding extends Binding {
    ready = false
    storing = false
    seen = ''
    /** @type {AbortController | null} */
    events = null
    /**
     * Where the caret was before a remote change, as ids.
     *
     * @type {{input: HTMLInputElement | HTMLTextAreaElement, key: string, path: string, start: Id | null, end: Id | null, direction: SelectionDirection | null} | null}
     */
    anchors = null

    attach() {
        if (this.ready) return true

        this.ready = true
        this.events = new AbortController()

        for (const name of ['select', 'keyup', 'pointerup']) {
            document.addEventListener(name, () => this.focused() && this.room.cursorMoved(), { signal: this.events.signal, capture: true })
        }

        const current = this.read()
        const initial = this.content(this.room.initialValue(this.field) ?? {})

        // Typed into before live editing connected: keep that.
        if (this.content(current) !== initial && this.content(this.document.value(this.field)) === initial) {
            this.seen = canonical(current)
            this.room.change(this.field, current)
        } else {
            this.render()
        }

        return true
    }

    get list() {
        return /** @type {import('../crdt/item-list.js').ItemList} */ (this.document.list(this.field))
    }

    /** An upload field: its items are files, stored as soon as they are uploaded. */
    get isUpload() {
        return this.room.config.uploads?.includes(this.field) ?? false
    }

    /** @returns {Record<string, any>} */
    read() {
        const value = plain(this.wire.$get(this.path, false))
        const items = value && typeof value === 'object' && !Array.isArray(value) ? value : {}

        // A file still being uploaded is only on this page; it is shared once stored.
        return this.isUpload ? Object.fromEntries(Object.entries(items).filter(([, file]) => !isTemporary(file))) : items
    }

    /** Files uploaded here but not stored yet, by key. */
    temporary() {
        const value = plain(this.wire.$get(this.path, false))

        return Object.fromEntries(Object.entries(value && typeof value === 'object' ? value : {}).filter(([, file]) => isTemporary(file)))
    }

    /** Stores what was just uploaded; the stored files then come back as state. */
    store() {
        if (this.storing || !Object.keys(this.temporary()).length) return

        this.storing = true
        this.wire
            .$call('storeCollaborationUpload', this.field)
            .catch(() => {})
            .finally(() => {
                this.storing = false
                this.collect()
            })
    }

    /**
     * What the items contain, regardless of their keys.
     *
     * @param {Record<string, any> | null | undefined} items
     */
    content(items) {
        return canonical(
            Object.values(items ?? {}).map((item) =>
                Object.entries(flatten(item))
                    .sort(([a], [b]) => (a < b ? -1 : 1))
                    .map(([path, value]) => [path, normalizeValue(value)]),
            ),
        )
    }

    /**
     * The input of `key`'s sub-field at `path`, as in `data.key_points.<key>.point`.
     *
     * @param {string} key
     * @param {string} path
     * @returns {HTMLInputElement | HTMLTextAreaElement | null}
     */
    input(key, path) {
        const model = path === '' ? `${this.path}.${key}` : `${this.path}.${key}.${path}`
        const inputs = this.room.dom.root.querySelectorAll(/** @type {'input'} */ ('input, textarea'))

        return [...inputs].find((input) => modelOf(input) === model) ?? null
    }

    /** The text sub-field with the caret, if it is in this list. */
    focused() {
        const input = document.activeElement

        if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) return null

        const prefix = `${this.path}.`
        const model = modelOf(input)

        if (!model?.startsWith(prefix)) return null

        const rest = model.slice(prefix.length)
        const dot = rest.indexOf('.')
        const key = dot < 0 ? rest : rest.slice(0, dot)
        const path = dot < 0 ? '' : rest.slice(dot + 1)

        return this.list?.isText(path) ? { input, key, path } : null
    }

    collect() {
        if (!this.ready) return

        if (this.isUpload) this.store()

        const current = this.read()
        const signature = canonical(current)

        if (signature === this.seen) return

        const focused = this.focused()
        const caret = focused ? { key: focused.key, path: focused.path, index: toIndex(focused.input.value, focused.input.selectionEnd ?? 0) } : null

        this.seen = signature
        this.room.change(this.field, current, caret)
    }

    capture() {
        this.anchors = null

        const focused = this.focused()
        const sequence = focused && this.list.sequence(focused.key, focused.path)

        if (!sequence) return

        const { input, key, path } = focused
        const { value, selectionStart, selectionEnd, selectionDirection } = input

        this.anchors = {
            input,
            key,
            path,
            start: sequence.idBefore(toIndex(value, selectionStart ?? 0)),
            end: sequence.idBefore(toIndex(value, selectionEnd ?? 0)),
            direction: selectionDirection,
        }
    }

    render() {
        if (!this.ready) return

        const value = this.document.value(this.field)
        const current = this.read()
        const anchors = this.anchors

        this.anchors = null

        if (canonical(value) === canonical(current)) {
            this.seen = canonical(current)

            return
        }

        // New, removed or reordered items need Filament to render their fields.
        const structural = canonical(Object.keys(value)) !== canonical(Object.keys(current))

        // The input with the caret first, so setting the state leaves the caret alone.
        const sequence = anchors && this.list.sequence(anchors.key, anchors.path)

        if (!structural && anchors && sequence && document.activeElement === anchors.input) {
            const text = sequence.text()

            if (anchors.input.value !== text) anchors.input.value = text

            anchors.input.setSelectionRange(
                toOffset(text, sequence.indexAfter(anchors.start) ?? 0),
                toOffset(text, sequence.indexAfter(anchors.end) ?? 0),
                anchors.direction ?? undefined,
            )
        }

        if (this.isUpload) {
            // Keep what is still uploading here; Filament's upload field follows its state itself.
            this.wire.$set(this.path, { ...value, ...this.temporary() }, false)
            this.seen = canonical(value)

            return
        }

        this.wire.$set(this.path, value, structural)
        this.seen = canonical(value)
    }

    cursor() {
        const focused = this.focused()
        const sequence = focused && this.list.sequence(focused.key, focused.path)

        if (!focused) return null

        const { input, key, path } = focused
        const { value, selectionStart, selectionEnd, selectionDirection } = input
        const start = sequence?.idBefore(toIndex(value, selectionStart ?? 0)) ?? null
        const end = sequence?.idBefore(toIndex(value, selectionEnd ?? 0)) ?? null

        return { ...(selectionDirection === 'backward' ? { anchor: end, head: start } : { anchor: start, head: end }), item: key, path }
    }

    /** @param {Cursor} cursor */
    geometry({ anchor, head, item, path }) {
        if (typeof item !== 'string' || typeof path !== 'string') return null

        const input = this.input(item, path)
        const sequence = this.list?.sequence(item, path)

        if (!input) return null

        const from = sequence ? sequence.indexAfter(anchor) : 0
        const to = sequence ? sequence.indexAfter(head) : 0

        if (from === null || to === null) return null

        return measureText(input, toOffset(input.value, from), toOffset(input.value, to))
    }

    detach() {
        this.events?.abort()
        this.ready = false
    }
}
