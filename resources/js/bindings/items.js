import { canonical } from '../crdt/id.js'
import { flatten } from '../crdt/item-list.js'
import { normalizeValue } from '../crdt/document.js'
import { plain } from '../dom.js'
import { Binding } from './binding.js'

/**
 * Repeaters and builders. Items are added, removed and moved by Filament's
 * own actions; this follows the resulting state. A change in which items
 * exist re-renders the field, a change inside an item does not.
 */
export class ItemsBinding extends Binding {
    attach() {
        if (this.ready) return true

        this.ready = true

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

    read() {
        const value = plain(this.room.wire.$get(this.path, false))

        return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
    }

    /** What the items contain, regardless of their keys. */
    content(items) {
        return canonical(
            Object.values(items ?? {}).map((item) =>
                Object.entries(flatten(item))
                    .sort(([a], [b]) => (a < b ? -1 : 1))
                    .map(([path, value]) => [path, normalizeValue(value)]),
            ),
        )
    }

    collect() {
        if (!this.ready) return

        const current = this.read()
        const signature = canonical(current)

        if (signature === this.seen) return

        this.seen = signature
        this.room.change(this.field, current)
    }

    render() {
        if (!this.ready) return

        const value = this.document.value(this.field)
        const current = this.read()

        if (canonical(value) === canonical(current)) {
            this.seen = canonical(current)

            return
        }

        // New, removed or reordered items need Filament to render their fields.
        const structural = canonical(Object.keys(value)) !== canonical(Object.keys(current))

        this.room.wire.$set(this.path, value, structural)
        this.seen = canonical(value)
    }
}
