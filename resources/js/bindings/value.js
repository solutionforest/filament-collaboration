import { normalizeValue, sameValue } from '../crdt/document.js'
import { plain } from '../dom.js'
import { Binding } from './binding.js'

/** @type {(value: any) => any} */
const simplify = (value) => normalizeValue(value && typeof value === 'object' ? Object.values(value) : value)

/** Selects, toggles, dates, tags: the most recent change wins. */
export class ValueBinding extends Binding {
    ready = false
    /** @type {any} */
    seen = null

    attach() {
        if (this.ready) return true

        this.ready = true

        const current = this.read()
        const initial = simplify(this.room.initialValue(this.field))

        this.seen = current

        // Changed before live editing had finished connecting.
        if (!sameValue(current, initial) && sameValue(this.document.value(this.field), initial)) {
            this.room.change(this.field, current)
        } else {
            this.render(true)
        }

        return true
    }

    read() {
        return simplify(plain(this.wire.$get(this.path, false)))
    }

    collect() {
        if (!this.ready) return

        const current = this.read()

        if (sameValue(current, this.seen)) return

        this.seen = current
        this.room.change(this.field, current)
    }

    render(initial = false) {
        if (!this.ready) return

        const value = plain(this.document.value(this.field))

        if (!sameValue(value, this.read())) {
            this.wire.$set(this.path, value, false)

            if (!initial && this.room.config.reactive.includes(this.field)) this.room.rerenderSoon()
        }

        this.seen = simplify(value)
    }
}
