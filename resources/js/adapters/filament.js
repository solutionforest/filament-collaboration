import { hasLoneSurrogate, wellFormed } from '@solutionforest/laravel-collaboration/crdt/id.js'
import { normalizeValue, sameValue } from '@solutionforest/laravel-collaboration/crdt/document.js'
import { modelOf, plain } from '../dom.js'
import { measureText } from '../ui/measure-text.js'
import { buildDocument, geometry, replacement, toDraft, toEditor } from './prosemirror.js'
import { minimalChange } from './registry.js'

/**
 * The adapters for Filament's own fields: text inputs and textareas, pickers,
 * the rich editor, and the Markdown and code editors. They use the same API
 * as an adapter for a third-party editor, and nothing else: read, write only
 * what changed, map the caret.
 */

/** Marks the rich editor's transactions that come from the shared draft. */
const REMOTE = 'filamentCollaboration'

const normalizeText = (/** @type {unknown} */ value) => wellFormed(String(value ?? '')).replace(/\r\n?/g, '\n')

/** A picker's state, as the draft holds it: CheckboxList keeps an object of choices. */
const simplify = (/** @type {any} */ value) => normalizeValue(value && typeof value === 'object' ? Object.values(value) : value)

/**
 * The Alpine component of a field's editor, once it has loaded.
 *
 * @param {Element} element
 * @param {string} component
 * @returns {any}
 */
function alpineData(element, component) {
    const root = element.querySelector(`[x-data^="${component}"]`)

    return root && window.Alpine ? window.Alpine.$data(root) : null
}


/** @param {(name: string, definition: AdapterDefinition) => void} register */
function registerBuiltInAdapters(register) {
    // TextInput (text, search, tel, url) and Textarea: merged by character, with carets and per-person undo.
    register('filament-text-input', {
        format: 'text',
        attach({ element, statePath, wire, changed, moved, undo, redo }) {
            const input = /** @type {HTMLInputElement | HTMLTextAreaElement | undefined} */ (
                [...element.querySelectorAll('input, textarea')].find((node) => modelOf(node) === statePath)
            )

            if (!input) return null

            const events = new AbortController()
            const { signal } = events
            const state = () => String(wire.$get(statePath, false) ?? '')
            let composing = false
            // What the input and the Livewire state held when this last saw them.
            let typed = input.value
            let stated = state()

            const remember = () => {
                typed = input.value
                stated = state()
            }

            input.addEventListener(
                'input',
                () => {
                    remember()
                    changed()
                },
                { signal },
            )
            input.addEventListener('compositionstart', () => (composing = true), { signal })
            input.addEventListener(
                'compositionend',
                () => {
                    composing = false
                    queueMicrotask(changed)
                },
                { signal },
            )

            // Ctrl+Z only undoes this person's typing, not colleagues'.
            input.addEventListener(
                'keydown',
                (event) => {
                    if (!(event instanceof KeyboardEvent) || !(event.ctrlKey || event.metaKey) || event.altKey) return

                    const key = event.key.toLowerCase()
                    const direction = key === 'z' ? (event.shiftKey ? 'redo' : 'undo') : key === 'y' ? 'redo' : null

                    if (!direction) return

                    event.preventDefault()
                    ;(direction === 'undo' ? undo : redo)()
                },
                { signal },
            )
            input.addEventListener(
                'beforeinput',
                (event) => {
                    if (!(event instanceof InputEvent) || !['historyUndo', 'historyRedo'].includes(event.inputType)) return

                    event.preventDefault()
                    ;(event.inputType === 'historyUndo' ? undo : redo)()
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
                    () =>
                        queueMicrotask(() => {
                            if (!wasReadOnly && input.isConnected) input.readOnly = false
                        }),
                    { signal },
                )
            }

            for (const name of ['select', 'keyup', 'pointerup']) input.addEventListener(name, moved, { signal })

            return {
                // The state wins only when the server changed it, for example another field's `afterStateUpdated()`.
                read: () => (input.value === typed && state() !== stated ? state() : input.value),
                write(value) {
                    if (normalizeText(input.value) !== value || hasLoneSurrogate(input.value)) {
                        const { scrollTop, scrollLeft } = input

                        input.value = value
                        input.scrollTop = scrollTop
                        input.scrollLeft = scrollLeft
                    }

                    if (hasLoneSurrogate(state()) || normalizeText(state()) !== value) wire.$set(statePath, value, false)

                    remember()
                },
                selection() {
                    const start = input.selectionStart ?? 0
                    const end = input.selectionEnd ?? 0

                    return input.selectionDirection === 'backward' ? { anchor: end, head: start } : { anchor: start, head: end }
                },
                setSelection: ({ anchor, head }) => input.setSelectionRange(Math.min(anchor, head), Math.max(anchor, head), anchor > head ? 'backward' : 'forward'),
                geometry: ({ anchor, head }) => measureText(input, anchor, head),
                isFocused: () => document.activeElement === input,
                isBusy: () => composing && input.isConnected,
                isAlive: () => input.isConnected,
                destroy: () => events.abort(),
            }
        },
    })

    // Selects, toggles, dates, tags and other pickers: the latest choice wins, through the Livewire state.
    register('filament-value', {
        format: 'value',
        attach({ statePath, wire }) {
            const read = () => simplify(plain(wire.$get(statePath, false)))

            return {
                read,
                write(value) {
                    if (!sameValue(value, read())) wire.$set(statePath, plain(value), false)
                },
            }
        },
    })

    // Repeater and Builder: items added, removed and moved merge; text sub-fields merge by character, with carets.
    register('filament-repeater', {
        format: 'items',
        attach: (context) => listAdapter(context),
    })

    // FileUpload: each file is stored as soon as it is uploaded, so everybody's save keeps it.
    register('filament-file-upload', {
        format: 'items',
        attach: (context) => listAdapter(context, { uploads: true }),
    })

    // Filament's RichEditor (TipTap): merged by character, block and mark, through its own ProseMirror.
    register('filament-rich-editor', {
        format: 'rich',
        attach({ element, field, statePath, wire, changed, moved, recover }) {
            const root = [...element.querySelectorAll('[data-rich-editor-key], [x-data*="richEditorFormComponent"]')].find((node) =>
                node.getAttribute('x-data')?.includes(`statePath: '${statePath}'`),
            )
            /** @type {RichEditor | undefined} */
            const editor = root ? window.Alpine?.$data(root)?.getEditor?.() : undefined

            if (!root || !editor || editor.isDestroyed) return null

            const pmState = () => window.FilamentRichEditor?.tiptap?.pmState
            /** @type {Set<string>} uploads being stored */
            const storing = new Set()
            let dirty = false

            /**
             * Left alone, Livewire sends an edit inside a list as a path more than ten
             * levels deep and then refuses it, so Save fails. Queue the field whole instead.
             */
            const sendWhole = () => {
                if (!editor.isDestroyed) wire.__instance?.queueUpdate?.(statePath, editor.getJSON())
            }

            /**
             * After a remote change the caret must still be where text can be typed:
             * Enter at a position between blocks makes ProseMirror throw.
             */
            const keepCaretTypable = () => {
                const pm = pmState()
                const { state, view } = editor
                const { $from, $to, empty } = state.selection

                if (!pm || state.selection instanceof pm.NodeSelection || ($from.parent.inlineContent && $to.parent.inlineContent)) return

                const near = pm.Selection.near(empty ? $from : $to, -1)

                if (!near.eq(state.selection)) view.dispatch(state.tr.setSelection(near).setMeta(REMOTE, true).setMeta('addToHistory', false))
            }

            /**
             * An upload is temporary until saved, and only its uploader's page has it.
             * Store it at once, so whoever saves the shared draft keeps the image.
             */
            const storeUploads = () => {
                /** @type {Record<string, unknown>} */
                const uploads = wire.$get(`componentFileAttachments.${statePath}`, false) ?? {}

                editor.state.doc.descendants((node) => {
                    /** @type {string | null} */
                    const id = node.type.name === 'image' ? node.attrs.id : null

                    if (!id || storing.has(id) || !uploads[id]) return

                    storing.add(id)
                    wire.$call('storeCollaborationAttachment', field, id).then(
                        (/** @type {{id: string, src?: string} | null} */ stored) => stored && replaceImage(id, stored),
                        () => storing.delete(id),
                    )
                })
            }

            /**
             * @param {string} id the temporary upload's id
             * @param {{id: string, src?: string}} stored
             */
            const replaceImage = (id, stored) => {
                if (editor.isDestroyed) return

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

            /** @param {{transaction?: import('prosemirror-state').Transaction}} props */
            const onUpdate = ({ transaction }) => {
                if (transaction?.getMeta(REMOTE)) return

                dirty = true
                changed()
                sendWhole()
                storeUploads()
            }
            const onSelection = () => moved()

            // ProseMirror throws from its own key handlers, so only the page sees it.
            const onError = (/** @type {ErrorEvent | PromiseRejectionEvent} */ event) => {
                const error = event instanceof ErrorEvent ? event.error : event.reason
                const own = editor.isFocused && !editor.isDestroyed && ((error instanceof Error && error.name === 'TransformError') || error instanceof RangeError)

                if (!own) return

                event.preventDefault()
                recover(error, { selection: editor.state.selection.toJSON(), doc: editor.state.doc.toJSON() })
            }

            editor.on('update', onUpdate)
            editor.on('selectionUpdate', onSelection)
            window.addEventListener('error', onError)
            window.addEventListener('unhandledrejection', onError)

            return {
                read() {
                    dirty = false

                    return /** @type {RichNode} */ (editor.state.doc.toJSON())
                },
                write(doc) {
                    const { state, view, schema } = editor
                    const transaction = replacement(state, buildDocument(schema, doc))

                    // Unchanged after an error the editor threw: its caret may be where nothing can be typed.
                    if (!transaction.docChanged) return keepCaretTypable()

                    view.dispatch(transaction.setMeta(REMOTE, true).setMeta('addToHistory', false))
                    keepCaretTypable()
                    sendWhole()
                },
                // Not while a local change is still to be read: its positions are not in the draft yet.
                selection() {
                    if (dirty) return null

                    const { doc, selection } = editor.state

                    return { anchor: toDraft(doc, selection.anchor), head: toDraft(doc, selection.head) }
                },
                setSelection({ anchor, head }) {
                    const TextSelection = pmState()?.TextSelection
                    const { state, view } = editor

                    if (!TextSelection) return

                    const from = state.doc.resolve(toEditor(state.doc, anchor))
                    const to = state.doc.resolve(toEditor(state.doc, head))

                    if (!from.parent.isTextblock || !to.parent.isTextblock) return

                    view.dispatch(state.tr.setSelection(new TextSelection(from, to)).setMeta(REMOTE, true).setMeta('addToHistory', false))
                    keepCaretTypable()
                },
                geometry: ({ anchor, head }) => geometry(editor.view, anchor, head),
                isFocused: () => editor.isFocused,
                isBusy: () => !!editor.view.composing,
                isDirty: () => dirty,
                isAlive: () => !editor.isDestroyed && root.isConnected && window.Alpine?.$data(root)?.getEditor?.() === editor,
                destroy() {
                    editor.off('update', onUpdate)
                    editor.off('selectionUpdate', onSelection)
                    window.removeEventListener('error', onError)
                    window.removeEventListener('unhandledrejection', onError)
                },
            }
        },
    })
}

/** @param {(name: string, definition: AdapterDefinition) => void} register */
export function registerFilamentAdapters(register) {
    registerBuiltInAdapters(register)

    // MarkdownEditor: EasyMDE over CodeMirror 5.
    register('filament-markdown-editor', {
        format: 'text',
        attach({ element, changed, moved }) {
            const codemirror = alpineData(element, 'markdownEditorFormComponent')?.editor?.codemirror

            if (!codemirror) return null

            const onChange = () => changed()
            const onMove = () => moved()

            codemirror.on('changes', onChange)
            codemirror.on('cursorActivity', onMove)

            return {
                read: () => codemirror.getValue(),
                write(value) {
                    const change = minimalChange(codemirror.getValue(), value)

                    // Not `setValue()`: Filament skips that origin, so its state would not follow.
                    if (change) codemirror.replaceRange(change.insert, codemirror.posFromIndex(change.from), codemirror.posFromIndex(change.to), 'collaboration')
                },
                selection() {
                    const [range] = codemirror.listSelections()

                    return range ? { anchor: codemirror.indexFromPos(range.anchor), head: codemirror.indexFromPos(range.head) } : null
                },
                setSelection: ({ anchor, head }) => codemirror.setSelection(codemirror.posFromIndex(anchor), codemirror.posFromIndex(head), { scroll: false }),
                caretRect(offset) {
                    const { left, top, bottom } = codemirror.charCoords(codemirror.posFromIndex(offset), 'window')

                    return new DOMRect(left, top, 2, bottom - top)
                },
                isFocused: () => codemirror.hasFocus(),
                isBusy: () => !!codemirror.state?.composing,
                isAlive: () => codemirror.getWrapperElement().isConnected,
                destroy() {
                    codemirror.off('changes', onChange)
                    codemirror.off('cursorActivity', onMove)
                },
            }
        },
    })

    // CodeEditor: CodeMirror 6.
    register('filament-code-editor', {
        format: 'text',
        attach({ element, changed, moved }) {
            // In WebKit, CodeMirror 6 can lose a keystroke when a remote change lands while it
            // defers reading the DOM, so the field merges on save there.
            if (/^((?!chrome|chromium|android).)*safari/i.test(navigator.userAgent)) return false

            const view = alpineData(element, 'codeEditorFormComponent')?.editor

            if (!view?.dom) return null

            // CodeMirror 6 has no change events; its DOM does.
            const events = new AbortController()
            /**
             * Typing CodeMirror has not read from its DOM yet: deferred to the next frame
             * (WebKit), or still in its MutationObserver's queue (a busy CPU). Changing or
             * measuring the editor meanwhile makes it read stale DOM.
             */
            const pending = () => (view.observer?.delayedFlush ?? -1) >= 0 || (view.observer?.pendingRecords?.().length ?? 0) > 0

            // Once CodeMirror has read the typing, or it would be skipped as busy.
            const typed = () => (pending() ? requestAnimationFrame(typed) : changed())

            view.dom.addEventListener('input', () => queueMicrotask(typed), { signal: events.signal })
            view.dom.addEventListener('keyup', () => moved(), { signal: events.signal })
            view.dom.addEventListener('pointerup', () => moved(), { signal: events.signal })

            return {
                read: () => view.state.doc.toString(),
                write(value) {
                    // Take in typing the editor has not read from its DOM yet, or the two collide.
                    // WebKit delays that reading, so force it.
                    view.observer?.forceFlush?.()
                    view.observer?.flush?.()

                    const change = minimalChange(view.state.doc.toString(), value)

                    if (change) view.dispatch({ changes: change })
                },
                selection() {
                    const { anchor, head } = view.state.selection.main

                    return { anchor, head }
                },
                setSelection: ({ anchor, head }) => view.dispatch({ selection: { anchor, head } }),
                caretRect(offset) {
                    // Measuring makes CodeMirror read typing it has not read yet, mid-keystroke.
                    if (pending()) return null

                    const rect = view.coordsAtPos(Math.min(offset, view.state.doc.length))

                    return rect ? new DOMRect(rect.left, rect.top, 2, rect.bottom - rect.top) : null
                },
                isFocused: () => view.hasFocus,
                // Composing, or typing the editor has not read yet.
                isBusy: () => view.composing || pending(),
                isAlive: () => view.dom.isConnected,
                destroy: () => events.abort(),
            }
        },
    })
}

/** Livewire's name for a file that is uploaded but not yet stored. */
const isTemporary = (/** @type {unknown} */ file) => typeof file === 'string' && file.startsWith('livewire-file:')

/**
 * A list as Livewire keeps it: items by key. Filament's own actions add,
 * remove and move them; this follows the resulting state, and gives the
 * text inputs inside items carets of their own.
 *
 * @param {AdapterContext} context
 * @param {{uploads?: boolean}} options uploads: the items are files, stored as soon as uploaded
 * @returns {AdapterHandle}
 */
function listAdapter({ element, field, statePath, wire, changed, moved }, { uploads = false } = {}) {
    const events = new AbortController()
    const { signal } = events
    const prefix = `${statePath}.`
    let storing = false
    /** @type {Set<string>} temporary files the server refused (Filament shows why): not sent again */
    const refused = new Set()

    /** @returns {Record<string, any>} */
    const state = () => {
        const value = plain(wire.$get(statePath, false))

        return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
    }

    /** Files uploaded on this page but not stored yet, by key. */
    const temporary = () => Object.fromEntries(Object.entries(state()).filter(([, file]) => isTemporary(file)))

    /** Stores what was just uploaded; the stored files then come back as state. */
    const store = () => {
        const waiting = Object.values(temporary()).filter((file) => !refused.has(file))

        if (storing || !waiting.length) return

        storing = true
        wire.$call('storeCollaborationUpload', field)
            .then(() => {
                // Still temporary after storing: refused, for example by the field's rules. Filament shows why.
                for (const file of Object.values(temporary())) if (waiting.includes(file)) refused.add(file)
            })
            .catch(() => waiting.forEach((file) => refused.add(file)))
            .finally(() => {
                storing = false
                changed()
            })
    }

    /** The text input or textarea of an item's sub-field, as in `data.key_points.<key>.point`. */
    const input = (/** @type {string | undefined} */ item, /** @type {string | undefined} */ path) => {
        if (item === undefined || path === undefined) return null

        const model = path === '' ? `${statePath}.${item}` : `${statePath}.${item}.${path}`

        return /** @type {HTMLInputElement | HTMLTextAreaElement | undefined} */ ([...element.querySelectorAll('input, textarea')].find((node) => modelOf(node) === model)) ?? null
    }

    /** The item and sub-field with the caret, if it is in this list. */
    const focused = () => {
        const active = document.activeElement
        const model = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement ? modelOf(active) : null

        if (!active || !model?.startsWith(prefix)) return null

        const rest = model.slice(prefix.length)
        const dot = rest.indexOf('.')

        return {
            input: /** @type {HTMLInputElement | HTMLTextAreaElement} */ (active),
            item: dot < 0 ? rest : rest.slice(0, dot),
            path: dot < 0 ? '' : rest.slice(dot + 1),
        }
    }

    for (const name of ['select', 'keyup', 'pointerup']) document.addEventListener(name, () => focused() && moved(), { signal, capture: true })
    document.addEventListener('input', () => focused() && changed(), { signal, capture: true })

    return {
        read() {
            // A file still uploading is only on this page: it is shared once stored.
            if (!uploads) return state()

            store()

            return Object.fromEntries(Object.entries(state()).filter(([, file]) => !isTemporary(file)))
        },
        write(items) {
            const current = state()
            // New, removed or moved items need Filament to render their fields.
            const structural = JSON.stringify(Object.keys(items)) !== JSON.stringify(Object.keys(current))

            if (uploads) {
                // Keep what is still uploading here; the upload field follows its state itself.
                wire.$set(statePath, { ...items, ...temporary() }, false)

                return
            }

            // The input with the caret first, so setting the state leaves its caret alone.
            const at = focused()
            const text = at ? subFieldText(items, at.item, at.path) : null

            if (!structural && at && text !== null && at.input.value !== text) at.input.value = text

            wire.$set(statePath, items, structural)
        },
        selection() {
            const at = focused()

            if (!at) return null

            const { input: node, item, path } = at
            const start = node.selectionStart ?? 0
            const end = node.selectionEnd ?? 0

            return node.selectionDirection === 'backward' ? { item, path, anchor: end, head: start } : { item, path, anchor: start, head: end }
        },
        setSelection({ item, path, anchor, head }) {
            const node = input(item, path)

            if (node && document.activeElement === node) node.setSelectionRange(Math.min(anchor, head), Math.max(anchor, head), anchor > head ? 'backward' : 'forward')
        },
        geometry({ item, path, anchor, head }) {
            const node = input(item, path)

            return node ? measureText(node, anchor, head) : null
        },
        isFocused: () => focused() !== null,
        destroy: () => events.abort(),
    }
}

/**
 * An item's text sub-field, or null if it is not text.
 *
 * @param {Record<string, any>} items
 * @param {string} item
 * @param {string} path
 */
function subFieldText(items, item, path) {
    const value = (path === '' ? [] : path.split('.')).reduce((/** @type {any} */ found, key) => found?.[key], items[item])

    return typeof value === 'string' ? value : null
}
