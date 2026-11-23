import { canonical, characters, hasLoneSurrogate } from '../crdt/id.js'
import { toDocument, toTokens } from '../crdt/rich-text.js'
import { Binding } from './binding.js'

const REMOTE = 'filamentCollaboration'

/**
 * Filament's own rich editor, untouched: its toolbar, schema and validation.
 * Nothing is bundled, as only the editor's ProseMirror instance is used.
 */
export class RichTextBinding extends Binding {
    changed = false
    unsupported = false

    get isBusy() {
        return !!this.editor && !this.editor.isDestroyed && this.editor.view.composing
    }

    attach() {
        if (this.unsupported) return false

        const root = this.room.dom.richEditor(this.field)
        const editor = root ? window.Alpine?.$data(root)?.getEditor?.() : null

        if (!editor || editor.isDestroyed) return false
        if (editor === this.editor) return true

        this.detach()
        this.editor = editor

        this.onUpdate = ({ transaction }) => {
            if (transaction?.getMeta(REMOTE)) return

            this.changed = true
            this.collect()
            this.sendWhole()
        }
        this.onSelection = () => this.room.cursorMoved()

        editor.on('update', this.onUpdate)
        editor.on('selectionUpdate', this.onSelection)

        if (editor.isFocused && this.hasTypedBeforeConnecting()) {
            this.changed = true
            this.collect()
        } else {
            this.render()
        }

        return !this.unsupported
    }

    hasTypedBeforeConnecting() {
        try {
            const initial = canonical(toTokens(this.room.initialValue(this.field)))

            return (
                canonical(toTokens(this.editor.getJSON())) !== initial &&
                canonical(toTokens(this.document.value(this.field))) === initial
            )
        } catch {
            return false
        }
    }

    collect() {
        if (!this.changed || !this.editor || this.editor.isDestroyed || this.isBusy) return

        this.changed = false

        try {
            const { doc, selection } = this.editor.state
            const caret = indexAt(this.positions(doc), selection.to)

            this.room.change(this.field, doc.toJSON(), caret)

            // The draft now holds well-formed text; the editor and Livewire need it too.
            if (hasLoneSurrogate(doc.textContent)) {
                this.capture()
                queueMicrotask(() => this.render())
            }
        } catch (error) {
            this.giveUp(error)
        }
    }

    capture() {
        this.anchors = this.editor && !this.editor.isDestroyed ? this.cursor() : null
    }

    render() {
        if (!this.editor || this.editor.isDestroyed || this.unsupported) return

        const { state, view, schema } = this.editor

        try {
            const target = toDocument(this.document.sequence(this.field).tokens())

            const isWellFormed = !hasLoneSurrogate(state.doc.textContent)

            if (isWellFormed && canonical(toTokens(target)) === canonical(toTokens(state.doc.toJSON()))) return

            const next = buildDocument(schema, target)
            let start = state.doc.content.findDiffStart(next.content)

            if (start === null) return

            let { a: oldEnd, b: newEnd } = state.doc.content.findDiffEnd(next.content)
            const overlap = start - Math.min(oldEnd, newEnd)

            if (overlap > 0) {
                oldEnd += overlap
                newEnd += overlap
            }

            // The diff counts UTF-16 units. Cutting an emoji in two would leave a caret inside it.
            if (splitsPair(state.doc, start)) start--

            if (splitsPair(state.doc, oldEnd)) {
                oldEnd++
                newEnd++
            }

            let transaction = state.tr

            try {
                transaction.replace(start, oldEnd, next.slice(start, newEnd))
            } catch {
                transaction = state.tr
            }

            if (!transaction.doc.eq(next)) transaction = state.tr.replaceWith(0, state.doc.content.size, next.content)

            this.restoreSelection(transaction)
            view.dispatch(transaction.setMeta(REMOTE, true).setMeta('addToHistory', false))
            this.keepCaretTypable()
            this.sendWhole()
        } catch (error) {
            this.giveUp(error)
        }
    }

    /**
     * Left alone, Livewire sends an edit inside a list as a path more than ten
     * levels deep and then refuses it (`payload.max_nesting_depth`), so Save
     * fails. Queue the field as one value for its next request instead.
     */
    sendWhole() {
        if (!this.editor || this.editor.isDestroyed) return

        this.room.wire.__instance?.queueUpdate?.(this.path, this.editor.getJSON())
    }

    /**
     * After somebody else's change, the caret must still be where text can be
     * typed. Enter at a position between blocks makes ProseMirror throw.
     */
    keepCaretTypable() {
        const Selection = window.FilamentRichEditor?.tiptap?.pmState?.Selection
        const { state, view } = this.editor
        const { $from, $to, empty } = state.selection

        if (!Selection || state.selection.node || ($from.parent.inlineContent && $to.parent.inlineContent)) return

        const near = Selection.near(empty ? $from : $to, -1)

        if (!near.eq(state.selection)) view.dispatch(state.tr.setSelection(near).setMeta(REMOTE, true).setMeta('addToHistory', false))
    }

    restoreSelection(transaction) {
        const TextSelection = window.FilamentRichEditor?.tiptap?.pmState?.TextSelection

        if (!TextSelection || !this.anchors || !this.editor.isFocused) return

        const sequence = this.document.sequence(this.field)
        const ends = this.positions(transaction.doc)

        const resolve = (id) => {
            const position = positionAt(ends, sequence.indexAfter(id) ?? 0)

            return transaction.doc.resolve(Math.min(position, transaction.doc.content.size))
        }

        const anchor = resolve(this.anchors.anchor)
        const head = resolve(this.anchors.head)

        if (anchor.parent.isTextblock && head.parent.isTextblock) {
            transaction.setSelection(new TextSelection(anchor, head))
        }
    }

    /** The ProseMirror position after each token, kept for the last document seen. */
    positions(doc) {
        if (this.mapped?.doc === doc) return this.mapped.ends

        const ends = []

        doc.descendants((node, position) => {
            if (!node.isTextblock) {
                if (node.childCount) return true

                ends.push(position + node.nodeSize)

                return false
            }

            ends.push(position + 1)

            node.forEach((child, offset) => {
                let end = position + 1 + offset

                if (child.isText) {
                    for (const character of characters(child.text)) ends.push((end += character.length))
                } else {
                    ends.push(end + child.nodeSize)
                }
            })

            return false
        })

        this.mapped = { doc, ends }

        return ends
    }

    cursor() {
        if (!this.editor || this.editor.isDestroyed || this.changed) return null

        const { doc, selection } = this.editor.state
        const ends = this.positions(doc)
        const sequence = this.document.sequence(this.field)

        return {
            anchor: sequence.idBefore(indexAt(ends, selection.anchor)),
            head: sequence.idBefore(indexAt(ends, selection.head)),
        }
    }

    geometry({ anchor, head }) {
        if (!this.editor || this.editor.isDestroyed) return null

        const { view, state } = this.editor
        const sequence = this.document.sequence(this.field)
        const from = sequence.indexAfter(anchor)
        const to = sequence.indexAfter(head)

        if (from === null || to === null || !view.dom.getClientRects().length) return null

        try {
            const ends = this.positions(state.doc)
            const start = positionAt(ends, Math.min(from, to))
            const end = positionAt(ends, Math.max(from, to))
            const point = view.coordsAtPos(positionAt(ends, to))
            const selection = []

            // One range per text node: a range across blocks also returns the boxes of whole blocks.
            state.doc.nodesBetween(start, end, (node, position) => {
                if (!node.isText || selection.length > 200) return

                const first = view.domAtPos(Math.max(start, position), 1)
                const last = view.domAtPos(Math.min(end, position + node.nodeSize), -1)
                const range = document.createRange()

                range.setStart(first.node, first.offset)
                range.setEnd(last.node, last.offset)
                selection.push(...range.getClientRects())
            })

            return {
                caret: new DOMRect(point.left, point.top, 2, point.bottom - point.top),
                selection,
                clip: view.dom.parentElement.getBoundingClientRect(),
            }
        } catch {
            // The document changed between measuring and drawing; the next frame is correct.
            return null
        }
    }

    giveUp(error) {
        console.warn(`[filament-collaboration] "${this.field}" will merge when saved instead.`, error)

        this.unsupported = true
        this.room.bindingFailed(this.field)
        this.detach()
    }

    detach() {
        if (this.editor) {
            this.editor.off('update', this.onUpdate)
            this.editor.off('selectionUpdate', this.onSelection)
        }

        this.editor = null
        this.mapped = null
    }
}

function indexAt(ends, position) {
    let low = 0
    let high = ends.length

    while (low < high) {
        const middle = (low + high) >> 1

        if (ends[middle] <= position) low = middle + 1
        else high = middle
    }

    return low
}

function splitsPair(doc, position) {
    if (position < 1 || position >= doc.content.size) return false

    const after = doc.textBetween(position, position + 1)
    const before = doc.textBetween(position - 1, position)

    return /^[\uD800-\uDBFF]$/.test(before) && /^[\uDC00-\uDFFF]$/.test(after)
}

function positionAt(ends, index) {
    return index > 0 ? (ends[Math.min(index, ends.length) - 1] ?? 1) : (ends[0] ?? 1)
}

/**
 * Two people can together make a structure neither could alone, such as a
 * list item with no paragraph. Keep the text, and as much shape as fits.
 */
function buildDocument(schema, target) {
    const document = schema.nodeFromJSON(target)

    try {
        document.check()

        return document
    } catch {
        const paragraphs = (node) =>
            node.isTextblock
                ? [schema.nodes.paragraph.create(null, node.content)]
                : Array.from({ length: node.childCount }, (_, index) => paragraphs(node.child(index))).flat()

        const blocks = []

        document.forEach((block) => {
            try {
                block.check()
                blocks.push(block)
            } catch {
                blocks.push(...paragraphs(block))
            }
        })

        return schema.topNodeType.createAndFill(null, blocks) ?? schema.topNodeType.createAndFill()
    }
}
