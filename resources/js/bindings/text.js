import { characters, hasLoneSurrogate, wellFormed } from '../crdt/id.js'
import { measureText } from '../ui/measure-text.js'
import { Binding } from './binding.js'
import { History } from './history.js'

const normalize = (value) => wellFormed(String(value ?? '')).replace(/\r\n?/g, '\n')
const toIndex = (value, offset) => characters(value.slice(0, offset)).length
const toOffset = (value, index) => characters(value).slice(0, index).join('').length

/** Text inputs and textareas, merged character by character. */
export class TextBinding extends Binding {
    history = new History()
    composing = false

    get isBusy() {
        return this.composing && this.input?.isConnected
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
        input.addEventListener('keydown', (event) => this.handleShortcut(event), { signal })
        input.addEventListener(
            'beforeinput',
            (event) => {
                if (!['historyUndo', 'historyRedo'].includes(event.inputType)) return

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
        this.seenState = normalize(this.room.wire.$get(this.path, false))

        if (value !== initial && shared === initial) this.room.change(this.field, value, this.caret())
        else this.render()

        return true
    }

    caret() {
        return document.activeElement === this.input ? toIndex(this.input.value, this.input.selectionEnd ?? 0) : null
    }

    collect() {
        if (!this.input?.isConnected || this.composing) return

        const typed = normalize(this.input.value)
        const state = normalize(this.room.wire.$get(this.path, false))

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
        const sequence = this.document.sequence(this.field)

        this.anchors = {
            start: sequence.idBefore(toIndex(value, selectionStart)),
            end: sequence.idBefore(toIndex(value, selectionEnd)),
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
            const sequence = this.document.sequence(this.field)
            const { start, end, direction } = this.anchors

            this.input.setSelectionRange(
                toOffset(value, sequence.indexAfter(start) ?? 0),
                toOffset(value, sequence.indexAfter(end) ?? 0),
                direction,
            )
        }

        this.anchors = null
    }

    show(value) {
        if (normalize(this.input.value) !== value || hasLoneSurrogate(this.input.value)) {
            const { scrollTop, scrollLeft } = this.input

            this.input.value = value
            this.input.scrollTop = scrollTop
            this.input.scrollLeft = scrollLeft
        }

        const state = String(this.room.wire.$get(this.path, false) ?? '')

        if (hasLoneSurrogate(state) || normalize(state) !== value) this.room.wire.$set(this.path, value, false)

        this.seen = this.seenState = value
    }

    handleShortcut(event) {
        if (!(event.ctrlKey || event.metaKey) || event.altKey) return

        const key = event.key.toLowerCase()
        const direction = key === 'z' ? (event.shiftKey ? 'redo' : 'undo') : key === 'y' ? 'redo' : null

        if (!direction) return

        event.preventDefault()
        this.travel(direction)
    }

    travel(direction) {
        this.collect()

        const result = this.history[direction](this.document.value(this.field))

        if (!result) return

        this.room.change(this.field, result.value, result.caret)
        this.show(result.value)

        const offset = toOffset(result.value, result.caret)

        this.input.setSelectionRange(offset, offset)
    }

    cursor() {
        if (!this.input?.isConnected || this.composing) return null

        const { value, selectionStart, selectionEnd, selectionDirection } = this.input
        const sequence = this.document.sequence(this.field)
        const start = sequence.idBefore(toIndex(value, selectionStart ?? 0))
        const end = sequence.idBefore(toIndex(value, selectionEnd ?? 0))

        return selectionDirection === 'backward' ? { anchor: end, head: start } : { anchor: start, head: end }
    }

    geometry({ anchor, head }) {
        if (!this.input?.isConnected) return null

        const sequence = this.document.sequence(this.field)
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
