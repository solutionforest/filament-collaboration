import { canonical, characters, hasLoneSurrogate } from '../crdt/id.js'
import { toDocument, toTokens } from '../crdt/rich-text.js'
import { Binding } from './binding.js'

/** @typedef {import('prosemirror-model').Node} ProseMirrorNode */
/** @typedef {import('prosemirror-model').Schema} ProseMirrorSchema */
/** @typedef {import('prosemirror-state').EditorState} EditorState */
/** @typedef {import('prosemirror-state').Transaction} Transaction */

const REMOTE = 'filamentCollaboration'
const RECOVERIES = 3
const RECOVERY_WINDOW = 10_000

/**
 * Filament's own rich editor, untouched: its toolbar, schema and validation.
 * Nothing is bundled, as only the editor's ProseMirror instance is used.
 */
export class RichTextBinding extends Binding {
    changed = false
    unsupported = false
    /** @type {Set<string>} uploads being stored */
    storing = new Set()
    /** @type {number[]} when the editor recovered, recently */
    recoveries = []
    /** @type {RichEditor | null} */
    editor = null
    /** @type {{anchor: Id | null, head: Id | null} | null} the caret before a remote change */
    anchors = null
    /** @type {{doc: ProseMirrorNode, ends: number[]} | null} */
    mapped = null
    /** @type {((props: {transaction?: Transaction}) => void) | null} */
    onUpdate = null
    /** @type {(() => void) | null} */
    onSelection = null
    /** @type {((event: ErrorEvent | PromiseRejectionEvent) => void) | null} */
    onError = null

    /** A rich text field's tokens. */
    get sequence() {
        return /** @type {import('../crdt/sequence.js').Sequence} */ (this.document.sequence(this.field))
    }

    /** The editor, unless it is gone. */
    get live() {
        return this.editor && !this.editor.isDestroyed ? this.editor : null
    }

    get isBusy() {
        return !!this.live?.view.composing
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
            this.storeUploads()
        }
        this.onSelection = () => this.room.cursorMoved()

        editor.on('update', this.onUpdate)
        editor.on('selectionUpdate', this.onSelection)

        // ProseMirror throws from its own key handlers, so only the page sees it.
        this.onError = (event) => {
            const error = event instanceof ErrorEvent ? event.error : event.reason

            if (this.isOwnError(error)) {
                event.preventDefault()
                this.recover(error)
            }
        }
        window.addEventListener('error', this.onError)
        window.addEventListener('unhandledrejection', this.onError)

        if (editor.isFocused && this.hasTypedBeforeConnecting()) {
            this.changed = true
            this.collect()
        } else {
            this.render()
        }

        return !this.unsupported
    }

    hasTypedBeforeConnecting() {
        const editor = this.live

        if (!editor) return false

        try {
            const initial = canonical(toTokens(this.room.initialValue(this.field)))

            return (
                canonical(toTokens(editor.getJSON())) !== initial &&
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

            this.room.change(this.field, /** @type {RichNode} */ (doc.toJSON()), caret)

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
            const target = toDocument(this.sequence.tokens())

            const isWellFormed = !hasLoneSurrogate(state.doc.textContent)

            if (isWellFormed && canonical(toTokens(target)) === canonical(toTokens(state.doc.toJSON()))) return

            const transaction = replacement(state, buildDocument(schema, target))

            if (!transaction.docChanged) return

            this.restoreSelection(transaction)
            view.dispatch(transaction.setMeta(REMOTE, true).setMeta('addToHistory', false))
            this.keepCaretTypable(this.editor)
            this.sendWhole()
        } catch (error) {
            this.recover(error)
        }
    }

    /**
     * Only errors raised while this editor has the caret, from ProseMirror's own transforms.
     *
     * @param {unknown} error
     */
    isOwnError(error) {
        if (!error || !this.editor || this.editor.isDestroyed || !this.editor.isFocused) return false

        return (error instanceof Error && error.name === 'TransformError') || error instanceof RangeError
    }

    /**
     * The editor refused a change. Nothing typed is lost, as every edit is in
     * the shared draft already: report the state that failed, then show the
     * draft again with the caret where it was. Repeated failures give up.
     *
     * @param {unknown} error
     */
    recover(error) {
        const editor = this.live

        if (!editor) return

        const now = Date.now()

        this.recoveries = [...this.recoveries.filter((at) => now - at < RECOVERY_WINDOW), now]
        this.room.reportProblem(this.field, error, this.diagnostics(editor))

        if (this.recoveries.length > RECOVERIES) {
            this.giveUp(error)

            return
        }

        try {
            this.reset(editor)
        } catch (failure) {
            this.giveUp(failure)
        }
    }

    /** What a developer needs to replay the failure. Field contents are only sent where reporting is enabled. */
    /** @param {RichEditor} editor */
    diagnostics(editor) {
        const { doc, selection } = editor.state

        return { key: this.room.lastKey, selection: selection.toJSON(), doc: doc.toJSON() }
    }

    /**
     * Show the draft again. Only what differs is replaced, so the caret stays in place.
     *
     * @param {RichEditor} editor
     */
    reset(editor) {
        const { state, view, schema } = editor
        const transaction = replacement(state, buildDocument(schema, toDocument(this.sequence.tokens())))

        if (!transaction.docChanged) return

        this.mapped = null
        view.dispatch(transaction.setMeta(REMOTE, true).setMeta('addToHistory', false))
        this.keepCaretTypable(editor)
        this.sendWhole()
    }

    /**
     * Left alone, Livewire sends an edit inside a list as a path more than ten
     * levels deep and then refuses it (`payload.max_nesting_depth`), so Save
     * fails. Queue the field as one value for its next request instead.
     */
    sendWhole() {
        if (!this.editor || this.editor.isDestroyed) return

        this.wire.__instance?.queueUpdate?.(this.path, this.editor.getJSON())
    }

    /**
     * An upload is temporary until saved, and only its uploader's page has it.
     * Store it at once, so whoever saves the shared draft keeps the image.
     */
    storeUploads() {
        const editor = this.live
        /** @type {Record<string, unknown>} */
        const uploads = this.wire.$get(`componentFileAttachments.${this.path}`, false) ?? {}

        editor?.state.doc.descendants((node) => {
            /** @type {string | null} */
            const id = node.type.name === 'image' ? node.attrs.id : null

            if (!id || this.storing.has(id) || !uploads[id]) return

            this.storing.add(id)
            this.wire.$call('storeCollaborationAttachment', this.field, id).then((/** @type {{id: string, src?: string} | null} */ stored) => {
                if (stored) this.replaceImage(id, stored)
            }, () => this.storing.delete(id))
        })
    }

    /**
     * @param {string} id the temporary upload's id
     * @param {{id: string, src?: string}} stored
     */
    replaceImage(id, stored) {
        const editor = this.live

        if (!editor) return

        const { state, view } = editor
        const transaction = state.tr

        state.doc.descendants((node, position) => {
            if (node.type.name === 'image' && node.attrs.id === id) {
                transaction.setNodeMarkup(position, null, { ...node.attrs, id: stored.id, src: stored.src ?? node.attrs.src })
            }
        })

        // An ordinary local change: it is shared like any other edit.
        if (transaction.docChanged) view.dispatch(transaction.setMeta('addToHistory', false))
    }

    /**
     * After somebody else's change, the caret must still be where text can be
     * typed. Enter at a position between blocks makes ProseMirror throw.
     */
    /** @param {RichEditor} editor */
    keepCaretTypable(editor) {
        const pmState = window.FilamentRichEditor?.tiptap?.pmState
        const { state, view } = editor
        const { $from, $to, empty } = state.selection

        if (!pmState || state.selection instanceof pmState.NodeSelection || ($from.parent.inlineContent && $to.parent.inlineContent)) return

        const near = pmState.Selection.near(empty ? $from : $to, -1)

        if (!near.eq(state.selection)) view.dispatch(state.tr.setSelection(near).setMeta(REMOTE, true).setMeta('addToHistory', false))
    }

    /** @param {Transaction} transaction */
    restoreSelection(transaction) {
        const TextSelection = window.FilamentRichEditor?.tiptap?.pmState?.TextSelection

        if (!TextSelection || !this.anchors || !this.editor?.isFocused) return

        const sequence = this.sequence
        const ends = this.positions(transaction.doc)

        /** @param {Id | null} id */
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

    /**
     * The ProseMirror position after each token, kept for the last document seen.
     *
     * @param {ProseMirrorNode} doc
     * @returns {number[]}
     */
    positions(doc) {
        if (this.mapped?.doc === doc) return this.mapped.ends

        /** @type {number[]} */
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
                    for (const character of characters(child.text ?? '')) ends.push((end += character.length))
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
        const sequence = this.sequence

        return {
            anchor: sequence.idBefore(indexAt(ends, selection.anchor)),
            head: sequence.idBefore(indexAt(ends, selection.head)),
        }
    }

    /** @param {Cursor} cursor */
    geometry({ anchor, head }) {
        if (!this.editor || this.editor.isDestroyed) return null

        const { view, state } = this.editor
        const sequence = this.sequence
        const from = sequence.indexAfter(anchor)
        const to = sequence.indexAfter(head)

        if (from === null || to === null || !view.dom.getClientRects().length) return null

        try {
            const ends = this.positions(state.doc)
            const start = positionAt(ends, Math.min(from, to))
            const end = positionAt(ends, Math.max(from, to))
            const point = view.coordsAtPos(positionAt(ends, to))
            /** @type {DOMRect[]} */
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
                clip: (view.dom.parentElement ?? view.dom).getBoundingClientRect(),
            }
        } catch {
            // The document changed between measuring and drawing; the next frame is correct.
            return null
        }
    }

    /** @param {unknown} error */
    giveUp(error) {
        console.warn(`[filament-collaboration] "${this.field}" will merge when saved instead.`, error)

        this.unsupported = true
        this.room.bindingFailed(this.field)
        this.detach()
    }

    detach() {
        if (this.editor && this.onUpdate && this.onSelection) {
            this.editor.off('update', this.onUpdate)
            this.editor.off('selectionUpdate', this.onSelection)
        }

        if (this.onError) {
            window.removeEventListener('error', this.onError)
            window.removeEventListener('unhandledrejection', this.onError)
            this.onError = null
        }

        this.editor = null
        this.mapped = null
    }
}

/**
 * How many tokens end at or before a ProseMirror position.
 *
 * @param {number[]} ends
 * @param {number} position
 */
function indexAt(ends, position) {
    let low = 0
    let high = ends.length

    while (low < high) {
        const middle = (low + high) >> 1

        if (/** @type {number} */ (ends[middle]) <= position) low = middle + 1
        else high = middle
    }

    return low
}

/**
 * @param {ProseMirrorNode} doc
 * @param {number} position
 */
function splitsPair(doc, position) {
    if (position < 1 || position >= doc.content.size) return false

    const after = doc.textBetween(position, position + 1)
    const before = doc.textBetween(position - 1, position)

    return /^[\uD800-\uDBFF]$/.test(before) && /^[\uDC00-\uDFFF]$/.test(after)
}

/**
 * A transaction turning the editor's document into `next`, touching as little as it can.
 *
 * @param {EditorState} state
 * @param {ProseMirrorNode} next
 * @returns {Transaction}
 */
function replacement(state, next) {
    let start = state.doc.content.findDiffStart(next.content)
    const end = state.doc.content.findDiffEnd(next.content)

    if (start === null || !end) return state.tr

    let { a: oldEnd, b: newEnd } = end
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

    return transaction.doc.eq(next) ? transaction : state.tr.replaceWith(0, state.doc.content.size, next.content)
}

/**
 * The ProseMirror position after `index` tokens.
 *
 * @param {number[]} ends
 * @param {number} index
 */
function positionAt(ends, index) {
    return index > 0 ? (ends[Math.min(index, ends.length) - 1] ?? 1) : (ends[0] ?? 1)
}

/**
 * Two people can together make a structure neither could alone, such as a
 * list item with no paragraph. Keep the text, and as much shape as fits.
 *
 * @param {ProseMirrorSchema} schema
 * @param {RichNode} target
 * @returns {ProseMirrorNode}
 */
function buildDocument(schema, target) {
    const document = schema.nodeFromJSON(target)

    try {
        document.check()

        return document
    } catch {
        const paragraph = /** @type {import('prosemirror-model').NodeType} */ (schema.nodes.paragraph)

        /**
         * @param {ProseMirrorNode} node
         * @returns {ProseMirrorNode[]}
         */
        const paragraphs = (node) =>
            node.isTextblock
                ? [paragraph.create(null, node.content)]
                : Array.from({ length: node.childCount }, (_, index) => paragraphs(node.child(index))).flat()

        /** @type {ProseMirrorNode[]} */
        const blocks = []

        document.forEach((block) => {
            try {
                block.check()
                blocks.push(block)
            } catch {
                blocks.push(...paragraphs(block))
            }
        })

        return schema.topNodeType.createAndFill(null, blocks) ?? schema.topNodeType.createAndFill() ?? schema.topNodeType.create()
    }
}
