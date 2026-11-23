import { canonical, characters, isAfter } from './id.js'
import { diff } from './diff.js'
import { Sequence } from './sequence.js'

/** Repeaters and builders. Mirrors `src/Crdt/ItemList.php`. */

export const MAX_DEPTH = 6

const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value)

export function flatten(value, prefix = '', depth = 0) {
    // An empty item or list is nothing, however PHP and JSON happen to spell it.
    if (value === undefined || (Array.isArray(value) && !value.length)) return { [prefix]: null }
    if (!isPlainObject(value) || depth >= MAX_DEPTH) return { [prefix]: value }

    const leaves = {}

    for (const [key, item] of Object.entries(value)) {
        for (const [path, leaf] of Object.entries(flatten(item, prefix === '' ? key : `${prefix}.${key}`, depth + 1))) {
            if (!(path in leaves)) leaves[path] = leaf
        }
    }

    return Object.keys(leaves).length ? leaves : { [prefix]: null }
}

export function unflatten(leaves) {
    if ('' in leaves) return leaves['']

    const value = {}

    // In the order the sub-fields were first written, which is the form's order.
    for (const path of Object.keys(leaves)) {
        const segments = path.split('.')
        let target = value

        segments.slice(0, -1).forEach((segment) => {
            if (!isPlainObject(target[segment])) target[segment] = {}

            target = target[segment]
        })
        target[segments.at(-1)] = leaves[path]
    }

    return value
}

/** What a text sub-field holds, whatever the form sent. Mirrors `ItemList::textOf()`. */
export const textOf = (value) =>
    (typeof value === 'string' || typeof value === 'number') ? String(value).replace(/\r\n?/g, '\n') : ''

const clockAfter = (operations, clock) => {
    for (const { o, id, v } of operations) {
        if (id) clock = Math.max(clock, id[0] + (o === 'ins' && typeof v === 'string' ? characters(v).length : 1) - 1)
    }

    return clock
}

export class ItemList {
    constructor(data = {}, normalize = (value) => value) {
        this.normalize = normalize
        this.texts = data.t ?? []
        this.order = new Sequence(data.r ?? [])
        this.values = new Map(
            Object.entries(data.m ?? {}).map(([key, paths]) => [
                key,
                new Map(
                    Object.entries(paths).map(([path, slot]) => [
                        path,
                        'r' in slot ? { sequence: new Sequence(slot.r) } : { value: slot.v, at: slot.at ?? [0, 0] },
                    ]),
                ),
            ]),
        )
    }

    isText(path) {
        return this.texts.includes(path)
    }

    /** A text sub-field's characters, or null if it has none yet. */
    sequence(key, path) {
        return this.values.get(key)?.get(path)?.sequence ?? null
    }

    text(key, path) {
        if (!this.values.has(key)) this.values.set(key, new Map())

        const slots = this.values.get(key)

        if (!slots.has(path)) slots.set(path, { sequence: new Sequence() })

        return slots.get(path).sequence
    }

    keys() {
        const keys = []

        for (const { value } of this.order.tokens()) {
            if (typeof value === 'object' && value.i && !keys.includes(value.i)) keys.push(value.i)
        }

        return keys
    }

    put(key, path, value, at) {
        if (!this.values.has(key)) this.values.set(key, new Map())

        const register = this.values.get(key).get(path)

        if (register?.sequence) return
        if (!register || isAfter(at, register.at)) this.values.get(key).set(path, { value, at })
    }

    value() {
        const items = {}

        for (const key of this.keys()) {
            items[key] = unflatten(
                Object.fromEntries(
                    [...(this.values.get(key) ?? new Map())].map(([path, slot]) => [path, slot.sequence ? slot.sequence.text() || null : slot.value]),
                ),
            )
        }

        return items
    }

    contentOf(items) {
        return canonical(
            Object.values(items).map((item) =>
                Object.entries(flatten(item))
                    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
                    .map(([path, value]) => [path, this.normalize(value)]),
            ),
        )
    }

    /** @param {{key: string, path: string, index: number}|null} caretOf where the caret is, to place an ambiguous edit */
    changes(field, items, clock, client, caretOf = null) {
        items = this.adoptKeys(items)

        const seen = new Set()
        const old = this.order
            .tokens()
            .filter(({ value }) => typeof value === 'object')
            .map((token) => {
                const duplicate = seen.has(token.value.i)

                seen.add(token.value.i)

                return duplicate ? { ...token, value: { i: `\u0000${token.value.i}` } } : token
            })
        const next = Object.keys(items).map((key) => ({ value: { i: key }, formatting: {} }))
        const operations = diff(field, old, next, clock, client)

        clock = clockAfter(operations, clock)

        for (const [key, item] of Object.entries(items)) {
            const leaves = flatten(item)

            for (const path of this.values.get(key)?.keys() ?? []) if (!(path in leaves)) leaves[path] = null

            for (const [path, raw] of Object.entries(leaves)) {
                const slot = this.values.get(key)?.get(path)

                if (slot?.sequence || (!slot && this.isText(path))) {
                    const typed = characters(textOf(raw)).map((character) => ({ value: character, formatting: {} }))
                    const caret = caretOf?.key === key && caretOf.path === path ? caretOf.index : null
                    const edits = diff(field, slot?.sequence.tokens() ?? [], typed, clock, client, caret).map((operation) => ({ ...operation, i: key, p: path }))

                    clock = clockAfter(edits, clock)
                    operations.push(...edits)

                    continue
                }

                const value = this.normalize(raw)

                if (canonical(this.normalize(slot?.value ?? null)) !== canonical(value)) {
                    operations.push({ o: 'put', f: field, i: key, p: path, id: [++clock, client], v: value })
                }
            }
        }

        return operations
    }

    adoptKeys(items) {
        const current = this.value()
        const unused = Object.fromEntries(Object.entries(current).filter(([key]) => !(key in items)))
        const adopted = {}

        for (let [key, item] of Object.entries(items)) {
            if (!(key in current)) {
                const match = Object.entries(unused).find(([, content]) => this.contentOf([content]) === this.contentOf([item]))

                if (match) {
                    delete unused[match[0]]
                    key = match[0]
                }
            }

            adopted[key] = item
        }

        return adopted
    }
}
