import '../css/editor.css'
import { BlockQuote, Bold, ClassicEditor, Essentials, Heading, Italic, Link, List, Paragraph, Strikethrough, Underline } from 'ckeditor5'
import 'ckeditor5/ckeditor5.css'

/**
 * The adapter. CKEditor keeps its own model of the selection, so a DOM
 * range is turned into a model range to move the caret.
 *
 * @param {any} api window.filamentCollaboration
 */
function registerAdapter(api) {
    api.registerAdapter('demo-ckeditor', {
        format: 'html',
        attach({ element, changed, moved }) {
            const root = element.querySelector('.demo-ckeditor')
            // Kept on the element, never behind Alpine's reactive proxy, which editors do not survive.
            const editor = root?.demoEditor

            if (!editor) return null

            const content = () => editor.editing.view.getDomRoot()
            const document = editor.model.document

            document.on('change:data', changed)
            document.selection.on('change:range', moved)

            return {
                read: () => editor.getData(),
                write: (html) => editor.setData(html),
                selection: () => api.html.selectionIn(content(), window.getSelection()),
                setSelection(positions) {
                    const range = api.html.select(content(), positions)
                    const view = range && editor.editing.view.domConverter.domRangeToView(range)

                    if (view) editor.model.change((writer) => writer.setSelection(editor.editing.mapper.toModelRange(view)))
                },
                caretRect: (position) => api.html.caretRectAt(content(), position),
                isFocused: () => editor.editing.view.document.isFocused,
                isBusy: () => editor.editing.view.document.isComposing,
                isAlive: () => editor.state !== 'destroyed' && !!content()?.isConnected,
                destroy() {
                    document.off('change:data', changed)
                    document.selection.off('change:range', moved)
                },
            }
        },
    })
}

window.filamentCollaboration
    ? registerAdapter(window.filamentCollaboration)
    : window.addEventListener('filament-collaboration:init', (event) => registerAdapter(/** @type {CustomEvent} */ (event).detail), { once: true })

/** The field itself: CKEditor 5, its HTML in the Livewire state. */
export default function demoCkEditor({ state }) {
    return {
        state,

        async init() {
            // Used directly, never through Alpine's reactive proxy, which CKEditor does not survive.
            const editor = await ClassicEditor.create(this.$refs.editor, {
                licenseKey: 'GPL',
                plugins: [Essentials, Paragraph, Heading, Bold, Italic, Underline, Strikethrough, Link, List, BlockQuote],
                toolbar: ['undo', 'redo', '|', 'heading', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'bulletedList', 'numberedList', 'blockQuote', 'link'],
                initialData: this.state ?? '',
            })

            editor.model.document.on('change:data', () => {
                const html = editor.getData()

                if (html !== this.state) this.state = html
            })

            this.$watch('state', (value) => {
                if ((value ?? '') !== editor.getData()) editor.setData(value ?? '')
            })

            this.$el.demoEditor = editor
        },

        /** For the browser tests: put the caret at a position. */
        place(position) {
            const editor = this.$el.demoEditor

            editor.editing.view.focus()

            const range = window.filamentCollaboration.html.select(editor.editing.view.getDomRoot(), { anchor: position, head: position })
            const view = editor.editing.view.domConverter.domRangeToView(range)

            editor.model.change((writer) => writer.setSelection(editor.editing.mapper.toModelRange(view)))
        },

        text() {
            return this.$el.demoEditor.editing.view.getDomRoot().textContent
        },

        destroy() {
            this.$el.demoEditor?.destroy()
        },
    }
}
