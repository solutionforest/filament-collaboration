import { characters } from '../crdt/id.js'

function change(before, after, caret = after.length) {
    let oldEnd = before.length
    let newEnd = after.length

    while (oldEnd > 0 && newEnd > caret && before[oldEnd - 1] === after[newEnd - 1]) {
        oldEnd--
        newEnd--
    }

    let start = 0

    while (start < oldEnd && start < newEnd && before[start] === after[start]) start++

    while (oldEnd > start && newEnd > start && before[oldEnd - 1] === after[newEnd - 1]) {
        oldEnd--
        newEnd--
    }

    return { at: start, removed: before.slice(start, oldEnd), inserted: after.slice(start, newEnd) }
}

/**
 * Undo for plain inputs. The browser's own stack is lost when a value is set
 * from script, and Ctrl+Z must only undo your edits, not your colleagues'.
 */
export class History {
    undoStack = []
    redoStack = []
    changedAt = 0

    local(before, after, caret) {
        const entry = change(characters(before), characters(after), caret ?? undefined)
        const last = this.undoStack.at(-1)
        const now = Date.now()

        const continues =
            now - this.changedAt < 800 &&
            last &&
            !entry.removed.length &&
            !last.removed.length &&
            entry.at === last.at + last.inserted.length

        if (continues) last.inserted.push(...entry.inserted)
        else this.undoStack.push(entry)

        if (this.undoStack.length > 200) this.undoStack.shift()

        this.redoStack = []
        this.changedAt = now
    }

    remote(before, after) {
        const { at, removed, inserted } = change(characters(before), characters(after))

        this.changedAt = 0
        this.rebase(this.undoStack, at, removed.length, inserted.length - removed.length, 'inserted', 'removed')
        this.rebase(this.redoStack, at, removed.length, inserted.length - removed.length, 'removed', 'inserted')
    }

    /** Moves every entry past somebody else's edit, newest first. */
    rebase(stack, position, length, delta, present, absent) {
        for (let index = stack.length - 1; index >= 0; index--) {
            const entry = stack[index]
            const end = entry.at + entry[present].length

            if (position >= end) {
                position += entry[absent].length - entry[present].length
            } else if (position + length <= entry.at) {
                entry.at += delta
            } else {
                stack.splice(0, index + 1)

                return
            }
        }
    }

    undo(value) {
        return this.replay(value, this.undoStack, this.redoStack, 'inserted', 'removed')
    }

    redo(value) {
        return this.replay(value, this.redoStack, this.undoStack, 'removed', 'inserted')
    }

    replay(value, from, to, present, absent) {
        const entry = from.pop()

        if (!entry) return null

        const items = characters(value)
        const found = items.slice(entry.at, entry.at + entry[present].length)

        if (found.join('') !== entry[present].join('')) {
            from.length = 0

            return null
        }

        items.splice(entry.at, entry[present].length, ...entry[absent])
        to.push(entry)
        this.changedAt = 0

        return { value: items.join(''), caret: entry.at + entry[absent].length }
    }
}
