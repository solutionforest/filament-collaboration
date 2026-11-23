import { hasLoneSurrogate, toIndex, toOffset, wellFormed } from '../crdt/id.js'
import { measureText } from '../ui/measure-text.js'
import { Binding } from './binding.js'
import { History } from './history.js'

/** @type {(value: unknown) => string} */
const normalize = (value) => wellFormed(String(value ?? '')).replace(/\r\n?/g, '\n')

/** Text inputs and textareas, merged character by character. */
export class TextBinding extends Binding {
    history = new History()
    composing = false
    /** @type {HTMLInputElement | HTMLTextAreaElement | null} */
    input = null
    /** @type {AbortController | null} */
    events = null
    /** What the input and the Livewire state held when last synced. */
    seen = ''
    seenState = ''
    /** @type {string | undefined} the value before a remote change */
    before
    /** @type {{start: Id | null, end: Id | null, direction: SelectionDirection | null} | null} */
    anchors = null

    /** A text field's characters. */
    get sequence() {
        return /** @type {import('../crdt/sequence.js').Sequence} */ (this.document.sequence(this.field))
    }

    get isBusy() {
        return this.composing && !!this.input?.isConnected
    }

    attach() {
        const input = this.room.dom.model(this.field)

        if (!input) return false
        if (input === this.input) return true

        this.detach()
        this.input = input
        this.composing = false
        this.events = new AbortController()

        const { signal } = this.events

        input.addEventListener('input', () => this.collect(), { signal })
        input.addEventListener('compositionstart', () => (this.composing = true), { signal })
        input.addEventListener(
            'compositionend',
            () => {
                this.composing = false
                queueMicrotask(() => this.collect())
            },
            { signal },
        )
        input.addEventListener('keydown', (event) => event instanceof KeyboardEvent && this.handleShortcut(event), { signal })
        input.addEventListener(
            'beforeinput',
            (event) => {
                if (!(event instanceof InputEvent) || !['historyUndo', 'historyRedo'].includes(event.inputType)) return

                event.preventDefault()
                this.travel(event.inputType === 'historyUndo' ? 'undo' : 'redo')
            },
            { signal },
        )

        // Livewire makes a submitting form's inputs read-only until the response.
        // A live input stays editable: Save gives the browser back what it typed.
        if (input.form) {
            let wasReadOnly = false

            input.form.addEventListener('submit', () => (wasReadOnly = input.readOnly), { signal, capture: true })
            input.form.addEventListener(
                'submit',
                () => queueMicrotask(() => {
                    if (!wasReadOnly && input.isConnected) input.readOnly = false
                }),
                { signal },
            )
        }

        for (const name of ['select', 'keyup', 'pointerup']) {
            input.addEventListener(name, () => this.room.cursorMoved(), { signal })
        }

        const value = normalize(input.value)
        const initial = normalize(this.room.initialValue(this.field))
        const shared = this.document.value(this.field)

        this.seen = value
        this.seenState = normalize(this.wire.$get(this.path, false))

        if (value !== initial && shared === initial) this.room.change(this.field, value, this.caret())
        else this.render()

        return true
    }

    caret() {
        return this.input && document.activeElement === this.input ? toIndex(this.input.value, this.input.selectionEnd ?? 0) : null
    }

    collect() {
        if (!this.input?.isConnected || this.composing) return

        const typed = normalize(this.input.value)
        const state = normalize(this.wire.$get(this.path, false))

        let value = typed

        if (typed === this.seen) {
            if (state === this.seenState) return

            // Set by the server, for example by another field's `afterStateUpdated()`.
            value = state
        }

        this.seen = value
        this.seenState = state

        const before = this.document.value(this.field)

        if (value === before) return

        const caret = this.caret()

        this.history.local(before, value, caret)
        this.room.change(this.field, value, caret)

        if (hasLoneSurrogate(this.input.value)) this.show(value)
    }

    capture() {
        this.anchors = null
        this.before = this.document.value(this.field)

        if (!this.input?.isConnected || document.activeElement !== this.input) return

        const { value, selectionStart, selectionEnd, selectionDirection } = this.input
        const sequence = this.sequence

        this.anchors = {
            start: sequence.idBefore(toIndex(value, selectionStart ?? 0)),
            end: sequence.idBefore(toIndex(value, selectionEnd ?? 0)),
            direction: selectionDirection,
        }
    }

    render() {
        if (!this.input?.isConnected) return

        const value = this.document.value(this.field)

        if (this.before !== undefined && this.before !== value) this.history.remote(this.before, value)

        this.before = undefined
        this.show(value)

        if (this.anchors && document.activeElement === this.input) {
            const sequence = this.sequence
            const { start, end, direction } = this.anchors

            this.input.setSelectionRange(
                toOffset(value, sequence.indexAfter(start) ?? 0),
                toOffset(value, sequence.indexAfter(end) ?? 0),
                direction ?? undefined,
            )
        }

        this.anchors = null
    }

    /** @param {string} value */
    show(value) {
        const input = this.input

        if (input && (normalize(input.value) !== value || hasLoneSurrogate(input.value))) {
            const { scrollTop, scrollLeft } = input

            input.value = value
            input.scrollTop = scrollTop
            input.scrollLeft = scrollLeft
        }

        const state = String(this.wire.$get(this.path, false) ?? '')

        if (hasLoneSurrogate(state) || normalize(state) !== value) this.wire.$set(this.path, value, false)

        this.seen = this.seenState = value
    }

    /** @param {KeyboardEvent} event */
    handleShortcut(event) {
        if (!(event.ctrlKey || event.metaKey) || event.altKey) return

        const key = event.key.toLowerCase()
        /** @type {'undo' | 'redo' | null} */
        const direction = key === 'z' ? (event.shiftKey ? 'redo' : 'undo') : key === 'y' ? 'redo' : null

        if (!direction) return

        event.preventDefault()
        this.travel(direction)
    }

    /** @param {'undo' | 'redo'} direction */
    travel(direction) {
        this.collect()

        const result = this.history[direction](this.document.value(this.field))

        if (!result) return

        this.room.change(this.field, result.value, result.caret)
        this.show(result.value)

        const offset = toOffset(result.value, result.caret)

        this.input?.setSelectionRange(offset, offset)
    }

    cursor() {
        if (!this.input?.isConnected || this.composing) return null

        const { value, selectionStart, selectionEnd, selectionDirection } = this.input
        const sequence = this.sequence
        const start = sequence.idBefore(toIndex(value, selectionStart ?? 0))
        const end = sequence.idBefore(toIndex(value, selectionEnd ?? 0))

        return selectionDirection === 'backward' ? { anchor: end, head: start } : { anchor: start, head: end }
    }

    /** @param {Cursor} cursor */
    geometry({ anchor, head }) {
        if (!this.input?.isConnected) return null

        const sequence = this.sequence
        const from = sequence.indexAfter(anchor)
        const to = sequence.indexAfter(head)

        if (from === null || to === null) return null

        return measureText(this.input, toOffset(this.input.value, from), toOffset(this.input.value, to))
    }

    detach() {
        this.events?.abort()
        this.input = null
    }
}
