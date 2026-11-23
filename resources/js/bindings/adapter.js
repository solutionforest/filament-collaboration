import { canonical, toIndex, toOffset, wellFormed } from '../crdt/id.js'
import { normalizeValue } from '../crdt/document.js'
import { toDocument, toTokens } from '../crdt/rich-text.js'
import { documentToHtml, htmlToDocument } from '../adapters/html.js'
import { plain } from '../dom.js'
import { adapters } from '../adapters/registry.js'
import { Binding } from './binding.js'

const normalizeText = (/** @type {unknown} */ value) => wellFormed(String(value ?? '')).replace(/\r\n?/g, '\n')

/**
 * A field edited through an adapter (`adapters/registry.js`): somebody
 * else's editor, made live. The adapter knows the editor; this knows the
 * shared draft, exactly as the built-in bindings do.
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
    warned = false
    /** The adapter said this editor cannot be live here: it merges on save. */
    unsupported = false
    /** True while writing: the editor's own change events then are ours. */
    writing = false

    get name() {
        return this.room.config.adapters?.[this.field] ?? ''
    }

    get format() {
        return this.definition?.format ?? 'value'
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
        const element = this.room.dom.wrapper(this.field)

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
            })

            if (handle === false) {
                this.unsupported = true
                this.room.bindingFailed(this.field)

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

        const current = this.read()
        const initial = this.normalize(this.room.initialValue(this.field))
        const shared = this.document.value(this.field)

        // Typed into before live editing connected: keep that.
        if (canonical(current) !== canonical(initial) && canonical(this.normalize(shared)) === canonical(initial)) {
            this.seen = canonical(current)
            this.room.change(this.field, current, this.caret())
        } else {
            this.render()
        }

        return true
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
        if (this.format !== 'html') return normalizeValue(plain(value))

        // HTML, or a document already: in the form the draft holds it.
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
        if (!this.handle || this.isBusy || this.writing) return

        const value = this.read()
        const signature = canonical(value)

        if (signature === this.seen) return

        this.seen = signature
        this.room.change(this.field, value, this.caret())
    }

    capture() {
        this.anchors = this.format === 'value' ? null : this.cursor()
    }

    render() {
        const handle = this.handle

        if (!handle) return

        const value = this.document.value(this.field)
        const anchors = this.anchors

        this.anchors = null

        if (canonical(this.normalize(value)) === canonical(this.read())) {
            this.seen = canonical(this.read())

            return
        }

        this.writing = true

        try {
            handle.write(this.format === 'html' ? documentToHtml(this.normalize(value)) : value)
        } catch (error) {
            this.warn(error)

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
        const selection = this.format !== 'value' && this.focused() ? this.handle?.selection?.() : null

        if (!sequence || !selection) return null

        const text = this.format === 'text' ? normalizeText(this.handle?.read()) : ''
        const index = (/** @type {number} */ offset) => (this.format === 'text' ? toIndex(text, offset) : offset)

        return { anchor: sequence.idBefore(index(selection.anchor)), head: sequence.idBefore(index(selection.head)) }
    }

    /**
     * @param {Cursor} cursor
     * @returns {Geometry | null}
     */
    geometry({ head }) {
        const offset = this.handle?.caretRect ? this.offsetOf(head) : null
        const caret = offset === null ? null : (this.handle?.caretRect?.(offset) ?? null)

        if (!caret || !this.element) return null

        return { caret: new DOMRect(caret.left, caret.top, 2, caret.height), selection: [], clip: this.element.getBoundingClientRect() }
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
