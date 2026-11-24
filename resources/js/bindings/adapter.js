import { canonical, hasLoneSurrogate, toIndex, toOffset, wellFormed } from '../crdt/id.js'
import { normalizeValue } from '../crdt/document.js'
import { toDocument, toTokens } from '../crdt/rich-text.js'
import { documentToHtml, htmlToDocument } from '../adapters/html.js'
import { plain } from '../dom.js'
import { adapters } from '../adapters/registry.js'
import { Binding } from './binding.js'
import { History } from './history.js'

const RECOVERIES = 3
const RECOVERY_WINDOW = 10_000

/** The adapter each built-in kind of field uses when the server names none. */
const BUILT_IN = /** @type {Record<string, string>} */ ({ text: 'filament-text-input', value: 'filament-value', rich: 'filament-rich-editor' })

const normalizeText = (/** @type {unknown} */ value) => wellFormed(String(value ?? '')).replace(/\r\n?/g, '\n')

/** @type {(value: unknown) => boolean} */
const containsLoneSurrogate = (value) =>
    typeof value === 'string'
        ? hasLoneSurrogate(value)
        : Array.isArray(value)
          ? value.some(containsLoneSurrogate)
          : !!value && typeof value === 'object' && Object.values(value).some(containsLoneSurrogate)

/**
 * Every field that is not a list is edited through an adapter
 * (`adapters/registry.js`): Filament's own text inputs, pickers and rich
 * editor exactly like a third-party editor. The adapter knows the editor;
 * this knows the shared draft.
 */
export class AdapterBinding extends Binding {
    /** @type {AdapterHandle | null} */
    handle = null
    /** @type {Element | null} */
    element = null
    /** @type {AdapterDefinition | null} */
    definition = null
    /** @type {string} the content last read or written, canonical */
    seen = ''
    /** @type {{anchor: Id | null, head: Id | null} | null} */
    anchors = null
    /** @type {any} the draft's value before a remote change, for undo */
    before = undefined
    /** Undo and redo of this person's own typing, for text adapters that ask for it. */
    history = new History()
    /** @type {number[]} when the editor recovered, recently */
    recoveries = []
    warned = false
    /** The adapter said this editor cannot be live here: it merges on save. */
    unsupported = false
    /** True while writing: the editor's own change events then are ours. */
    writing = false

    get name() {
        return this.room.config.adapters?.[this.field] ?? BUILT_IN[this.room.config.fields[this.field] ?? ''] ?? ''
    }

    get format() {
        return this.definition?.format ?? 'value'
    }

    /** Text and rich formats are sequences: characters, or blocks, characters and embeds. */
    get isSequence() {
        return this.format !== 'value'
    }

    /** A text field's characters, or a rich field's tokens. */
    get sequence() {
        return this.document.sequence(this.field)
    }

    get isBusy() {
        return !!this.handle?.isBusy?.()
    }

    attach() {
        if (this.unsupported) return false

        const definition = adapters.get(this.name)
        // A picker works through the Livewire state: it needs no element of its own.
        const element = this.room.dom.wrapper(this.field) ?? (definition?.format === 'value' ? this.room.dom.root : null)

        if (!definition || !element) return false
        if (this.handle && this.element === element && this.handle.isAlive?.() !== false) return true

        this.detach()

        try {
            const handle = definition.attach({
                field: this.field,
                element,
                statePath: this.path,
                wire: this.wire,
                changed: () => this.collect(),
                moved: () => this.room.cursorMoved(),
                undo: () => this.travel('undo'),
                redo: () => this.travel('redo'),
                recover: (error, details) => this.recover(error, details),
            })

            if (handle === false) {
                this.giveUp(null)

                return false
            }

            this.handle = handle
        } catch (error) {
            this.warn(error)

            return false
        }

        if (!this.handle) return false

        this.definition = definition
        this.element = element

        let current

        try {
            current = this.read()
        } catch (error) {
            this.giveUp(error)

            return false
        }

        const initial = this.normalize(this.room.initialValue(this.field))
        const shared = this.document.value(this.field)
        // A rich editor's document differs from the stored one in ways that do not matter until somebody types.
        const mayHaveTyped = this.format !== 'rich' || this.focused()

        // Typed into before live editing connected: keep that.
        if (mayHaveTyped && canonical(current) !== canonical(initial) && canonical(this.normalize(shared)) === canonical(initial)) {
            this.seen = canonical(current)
            this.room.change(this.field, current, this.caret())
        } else {
            this.render()
        }

        return !this.unsupported
    }

    /**
     * The editor's content, as the draft holds it.
     *
     * @returns {any}
     */
    read() {
        return this.normalize(this.handle?.read())
    }

    /** @param {unknown} value */
    normalize(value) {
        if (this.format === 'text') return normalizeText(value)
        if (this.format === 'value') return normalizeValue(plain(value))

        // HTML or a document: in the form the draft holds it.
        try {
            return toDocument(toTokens(typeof value === 'string' ? htmlToDocument(value) : /** @type {RichNode | null} */ (value)))
        } catch {
            return toDocument(toTokens({ type: 'doc', content: [{ type: 'paragraph' }] }))
        }
    }

    /** The caret, as an index the draft understands. */
    caret() {
        const selection = this.focused() ? this.handle?.selection?.() : null

        if (!selection) return null

        return this.format === 'text' ? toIndex(normalizeText(this.handle?.read()), selection.head) : selection.head
    }

    focused() {
        return this.handle?.isFocused?.() ?? !!this.element?.contains(document.activeElement)
    }

    collect() {
        const handle = this.handle

        if (!handle || this.isBusy || this.writing || handle.isDirty?.() === false) return

        let raw
        let value

        try {
            raw = handle.read()
            value = this.normalize(raw)
        } catch (error) {
            this.giveUp(error)

            return
        }

        const signature = canonical(value)

        if (signature === this.seen) return

        this.seen = signature

        const caret = this.caret()

        if (this.format === 'text') this.history.local(this.document.value(this.field), value, caret)

        this.room.change(this.field, value, caret)

        // Half an emoji: the draft holds well-formed text, and the editor must too.
        if (containsLoneSurrogate(raw)) {
            this.capture()
            queueMicrotask(() => this.render(true))
        }
    }

    capture() {
        this.before = this.document.value(this.field)
        this.anchors = this.isSequence ? this.cursor() : null
    }

    /** @param {boolean} force write even if the editor seems to show the draft already */
    render(force = false) {
        const handle = this.handle
        const anchors = this.anchors
        const before = this.before

        // Whatever happens, these belong to this render only.
        this.anchors = null
        this.before = undefined

        if (!handle) return

        const value = this.document.value(this.field)

        if (this.format === 'text' && before !== undefined && before !== value) this.history.remote(before, value)

        if (!force && canonical(this.normalize(value)) === canonical(this.read())) {
            this.seen = canonical(this.read())

            return
        }

        this.writing = true

        try {
            handle.write(this.format === 'html' ? documentToHtml(this.normalize(value)) : this.format === 'rich' ? this.normalize(value) : value)
        } catch (error) {
            this.writing = false
            this.recover(error)

            return
        } finally {
            this.writing = false
        }

        this.seen = canonical(this.read())

        if (anchors && this.focused()) {
            const anchor = this.offsetOf(anchors.anchor)
            const head = this.offsetOf(anchors.head)

            if (anchor !== null && head !== null) handle.setSelection?.({ anchor, head })
        }

        // A picker other fields depend on: render the form again, as its own change would.
        if (this.format === 'value' && before !== undefined && this.room.config.reactive.includes(this.field)) this.room.rerenderSoon()
    }

    /**
     * Undo or redo this person's own typing, leaving colleagues' alone.
     *
     * @param {'undo' | 'redo'} direction
     */
    travel(direction) {
        if (this.format !== 'text' || !this.handle) return

        this.collect()

        const result = this.history[direction](this.document.value(this.field))

        if (!result) return

        this.room.change(this.field, result.value, result.caret)
        this.writing = true

        try {
            this.handle.write(result.value)
        } finally {
            this.writing = false
        }

        this.seen = canonical(this.read())

        const offset = toOffset(result.value, result.caret)

        this.handle.setSelection?.({ anchor: offset, head: offset })
    }

    /**
     * The editor's position just after a token.
     *
     * @param {Id | null} id
     */
    offsetOf(id) {
        const index = this.sequence?.indexAfter(id) ?? null

        if (index === null) return null

        return this.format === 'text' ? toOffset(normalizeText(this.handle?.read()), index) : index
    }

    /** @returns {Cursor | null} */
    cursor() {
        const sequence = this.sequence
        const selection = this.isSequence && this.focused() && !this.isBusy ? this.handle?.selection?.() : null

        if (!sequence || !selection) return null

        const text = this.format === 'text' ? normalizeText(this.handle?.read()) : ''
        const index = (/** @type {number} */ offset) => (this.format === 'text' ? toIndex(text, offset) : offset)

        return { anchor: sequence.idBefore(index(selection.anchor)), head: sequence.idBefore(index(selection.head)) }
    }

    /**
     * @param {Cursor} cursor
     * @returns {Geometry | null}
     */
    geometry({ anchor, head }) {
        const handle = this.handle

        if (!handle || !this.element) return null

        const to = this.offsetOf(head)

        if (to === null) return null

        if (handle.geometry) {
            const from = this.offsetOf(anchor) ?? to

            return handle.geometry({ anchor: from, head: to })
        }

        const caret = handle.caretRect?.(to) ?? null

        if (!caret) return null

        return { caret: new DOMRect(caret.left, caret.top, 2, caret.height), selection: [], clip: this.element.getBoundingClientRect() }
    }

    /**
     * The editor refused a change. Nothing typed is lost, as every edit is in
     * the shared draft already: report it, then show the draft again with the
     * caret where it was. Repeated failures give up: the field merges on save.
     *
     * @param {unknown} error
     * @param {{selection?: unknown, doc?: unknown}} [details]
     */
    recover(error, details = {}) {
        if (!this.handle) return

        const now = Date.now()

        this.recoveries = [...this.recoveries.filter((at) => now - at < RECOVERY_WINDOW), now]
        this.room.reportProblem(this.field, error, { key: this.room.lastKey, ...details })

        if (this.recoveries.length > RECOVERIES) {
            this.giveUp(error)

            return
        }

        // The editor's caret is in a state the draft never had: let the editor map it through the reset.
        try {
            this.anchors = null
            this.before = undefined
            this.render(true)
        } catch (failure) {
            this.giveUp(failure)
        }
    }

    /**
     * This editor cannot be live here: it merges on save instead.
     *
     * @param {unknown} error null when the adapter said so itself
     */
    giveUp(error) {
        if (error) console.warn(`[filament-collaboration] "${this.field}" will merge when saved instead.`, error)

        this.unsupported = true
        this.room.bindingFailed(this.field)
        this.detach()
    }

    /** @param {unknown} error */
    warn(error) {
        if (this.warned) return

        this.warned = true
        console.warn(`[filament-collaboration] The "${this.name}" adapter failed on "${this.field}".`, error)
    }

    detach() {
        try {
            this.handle?.destroy?.()
        } catch {
            // The editor is gone already.
        }

        this.handle = null
        this.element = null
    }
}
