import '../css/editor.css'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

/**
 * The adapter. Quill writes only what changed, as a delta, so its history
 * and selection survive somebody else's edit.
 */
FilamentCollaboration.adapter('demo-quill', {
    format: 'html',
    attach({ element, changed, moved }) {
        const root = element.querySelector('.demo-quill')
        // Kept on the element, never behind Alpine's reactive proxy, which editors do not survive.
        const quill = root?.demoEditor

        if (!quill) return null

        quill.on('text-change', changed)
        quill.on('selection-change', moved)

        return {
            read: () => quill.getSemanticHTML(),
            write(html) {
                const next = quill.clipboard.convert({ html })

                quill.updateContents(quill.getContents().diff(next), 'api')
            },
            selection: () => FilamentCollaboration.html.selectionIn(quill.root, window.getSelection()),
            setSelection(positions) {
                FilamentCollaboration.html.select(quill.root, positions)
                quill.selection.update('silent')
            },
            caretRect: (position) => FilamentCollaboration.html.caretRectAt(quill.root, position),
            isFocused: () => quill.hasFocus(),
            isBusy: () => quill.composition?.isComposing === true,
            isAlive: () => quill.root.isConnected,
            destroy() {
                quill.off('text-change', changed)
                quill.off('selection-change', moved)
            },
        }
    },
})

/** The field itself: Quill, its HTML in the Livewire state. */
export default function demoQuill({ state }) {
    return {
        state,

        init() {
            // Used directly, never through Alpine's reactive proxy, which Quill does not survive.
            const quill = new Quill(this.$refs.editor, {
                theme: 'snow',
                modules: {
                    toolbar: [[{ header: [2, 3, false] }], ['bold', 'italic', 'underline', 'strike'], [{ list: 'ordered' }, { list: 'bullet' }], ['blockquote', 'link']],
                },
            })

            this.$el.demoEditor = quill

            if (this.state) quill.setContents(quill.clipboard.convert({ html: this.state }), 'silent')

            quill.on('text-change', () => {
                const html = quill.getSemanticHTML()

                if (html !== this.state) this.state = html
            })

            this.$watch('state', (value) => {
                if ((value ?? '') !== quill.getSemanticHTML()) quill.setContents(quill.clipboard.convert({ html: value ?? '' }), 'silent')
            })
        },

        /** For the browser tests: put the caret at a position. */
        place(position) {
            const quill = this.$el.demoEditor

            quill.focus()
            FilamentCollaboration.html.select(quill.root, { anchor: position, head: position })
            quill.selection.update('silent')
        },

        text() {
            return this.$el.demoEditor.root.textContent
        },
    }
}
