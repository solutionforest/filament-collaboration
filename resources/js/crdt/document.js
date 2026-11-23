import { canonical, characters, isAfter, wellFormed } from './id.js'
import { diff } from './diff.js'
import { ItemList } from './item-list.js'
import { toDocument, toTokens } from './rich-text.js'
import { Sequence } from './sequence.js'

/** The shared draft in the browser. Mirrors `src/Crdt/Document.php`. */

export const normalizeValue = (value) =>
    value === '' || value === undefined
        ? null
        : typeof value === 'string'
          ? wellFormed(value)
          : Array.isArray(value)
            ? value.map(normalizeValue)
            : value

export const sameValue = (a, b) => canonical(normalizeValue(a)) === canonical(normalizeValue(b))

export class Document {
    constructor(state = {}) {
        this.clock = state.clock ?? 0
        this.fields = new Map(
            Object.entries(state.fields ?? {}).map(([name, field]) => [
                name,
                field.k === 'value'
                    ? { kind: field.k, value: field.v, at: field.at ?? [0, 0] }
                    : field.k === 'items'
                      ? { kind: field.k, list: new ItemList(field, normalizeValue) }
                      : { kind: field.k, sequence: new Sequence(field.r) },
            ]),
        )
    }

    kind(name) {
        return this.fields.get(name)?.kind ?? null
    }

    sequence(name) {
        return this.fields.get(name)?.sequence ?? null
    }

    value(name) {
        const field = this.fields.get(name)

        if (!field) return null
        if (field.kind === 'value') return field.value
        if (field.kind === 'text') return field.sequence.text()
        if (field.kind === 'items') return field.list.value()

        return toDocument(field.sequence.tokens())
    }

    changes(name, value, client, caret = null) {
        const field = this.fields.get(name)

        if (!field) return []

        if (field.kind === 'value') {
            return sameValue(field.value, value)
                ? []
                : [{ o: 'set', f: name, id: [this.clock + 1, client], v: normalizeValue(value) }]
        }

        if (field.kind === 'items') return field.list.changes(name, value ?? {}, this.clock, client, caret)

        let old = field.sequence.tokens()
        let next

        if (field.kind === 'rich') {
            next = toTokens(value)

            const normal = toTokens(toDocument(old))

            if (normal.length === old.length) {
                old = old.map((token, index) => ({ ...token, formatting: normal[index].formatting }))
            }
        } else {
            next = characters(String(value ?? '').replace(/\r\n?/g, '\n')).map((character) => ({
                value: character,
                formatting: {},
            }))
        }

        return diff(name, old, next, this.clock, client, caret)
    }

    /** @returns {Set<string>} the fields that were touched */
    apply(operations) {
        const touched = new Set()

        for (const operation of operations) {
            const { o, f, id, ids, v } = operation
            const field = this.fields.get(f)

            if (!field) continue

            if (field.kind === 'items') {
                const sequence = o !== 'put' && operation.p !== undefined ? field.list.text(operation.i, operation.p) : field.list.order

                if (o === 'put') field.list.put(operation.i, operation.p, v, id)
                else if (o === 'ins') sequence.insert(id, operation.after, v)
                else if (o === 'del') ids.forEach((range) => sequence.delete(range))
            } else if (o === 'set') {
                if (isAfter(id, field.at)) {
                    field.value = v
                    field.at = id
                }
            } else if (o === 'ins') {
                field.sequence.insert(id, operation.after, v, operation.a)
            } else if (o === 'del') {
                ids.forEach((range) => field.sequence.delete(range))
            } else if (o === 'fmt') {
                ids.forEach((range) => field.sequence.format(range, operation.k, v, id))
            }

            if (id) {
                const span = o === 'ins' && typeof v === 'string' ? characters(v).length : 1

                this.clock = Math.max(this.clock, id[0] + span - 1)
            }

            touched.add(f)
        }

        return touched
    }
}
