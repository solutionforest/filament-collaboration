/**
 * Adapters teach the package an editor it does not know: how to read and
 * write it, and where its caret is. The PHP side says which field uses which
 * adapter (`AdapterType`, or `->collaborative(adapter: 'name')`).
 */

/** @type {Map<string, AdapterDefinition>} */
export const adapters = new Map()

/**
 * @param {string} name
 * @param {AdapterDefinition} definition
 */
export function registerAdapter(name, definition) {
    if (!definition || typeof definition.attach !== 'function' || !['text', 'html', 'value'].includes(definition.format)) {
        throw new Error(`[filament-collaboration] Adapter "${name}" needs a format (text, html or value) and an attach() function.`)
    }

    adapters.set(name, definition)
}

/**
 * Replaces `old` with `next` by changing only the part between their common
 * start and end, which keeps an editor's undo history and selection.
 *
 * @param {string} old
 * @param {string} next
 * @returns {{from: number, to: number, insert: string} | null} UTF-16 offsets into `old`, or null if equal
 */
export function minimalChange(old, next) {
    if (old === next) return null

    let start = 0

    while (start < old.length && start < next.length && old[start] === next[start]) start++

    let oldEnd = old.length
    let newEnd = next.length

    while (oldEnd > start && newEnd > start && old[oldEnd - 1] === next[newEnd - 1]) {
        oldEnd--
        newEnd--
    }

    // Never split an emoji's two halves.
    if (start > 0 && /[\uD800-\uDBFF]/.test(old[start - 1] ?? '')) start--
    if (/[\uDC00-\uDFFF]/.test(old[oldEnd] ?? '') && oldEnd < old.length) {
        oldEnd++
        newEnd++
    }

    return { from: start, to: oldEnd, insert: next.slice(start, newEnd) }
}
