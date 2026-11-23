import { minimalChange } from './registry.js'

/**
 * Adapters for Filament's own CodeMirror editors, and examples of what an
 * adapter does: read, write only what changed, and map the caret.
 */

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
export function registerFilamentAdapters(register) {
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
            const view = alpineData(element, 'codeEditorFormComponent')?.editor

            if (!view?.dom) return null

            // CodeMirror 6 has no change events; its DOM does.
            const events = new AbortController()

            view.dom.addEventListener('input', () => queueMicrotask(changed), { signal: events.signal })
            view.dom.addEventListener('keyup', () => moved(), { signal: events.signal })
            view.dom.addEventListener('pointerup', () => moved(), { signal: events.signal })

            return {
                read: () => view.state.doc.toString(),
                write(value) {
                    const change = minimalChange(view.state.doc.toString(), value)

                    if (change) view.dispatch({ changes: change })
                },
                selection() {
                    const { anchor, head } = view.state.selection.main

                    return { anchor, head }
                },
                setSelection: ({ anchor, head }) => view.dispatch({ selection: { anchor, head } }),
                caretRect(offset) {
                    const rect = view.coordsAtPos(Math.min(offset, view.state.doc.length))

                    return rect ? new DOMRect(rect.left, rect.top, 2, rect.bottom - rect.top) : null
                },
                isFocused: () => view.hasFocus,
                isBusy: () => view.composing,
                isAlive: () => view.dom.isConnected,
                destroy: () => events.abort(),
            }
        },
    })
}
