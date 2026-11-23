import '../css/editor.css'
import tinymce from 'tinymce/tinymce'
import 'tinymce/icons/default'
import 'tinymce/themes/silver'
import 'tinymce/models/dom'
import 'tinymce/plugins/link'
import 'tinymce/plugins/lists'
import 'tinymce/skins/ui/oxide/skin.js'
import 'tinymce/skins/ui/oxide/content.js'
import 'tinymce/skins/content/default/content.js'

/**
 * The adapter: what filament-collaboration needs to make this editor live.
 * Positions come from its HTML helpers, which count as its shared document does.
 *
 * @param {any} api window.filamentCollaboration
 */
function registerAdapter(api) {
    api.registerAdapter('demo-tinymce', {
        format: 'html',
        attach({ element, changed, moved }) {
            const root = element.querySelector('.demo-tinymce')
            // Kept on the element, never behind Alpine's reactive proxy, which editors do not survive.
            const editor = root?.demoEditor

            if (!editor?.initialized) return null

            const body = () => editor.getBody()

            editor.on('input change undo redo keyup', changed)
            editor.on('SelectionChange', moved)

            return {
                read: () => editor.getContent(),
                write: (html) => editor.setContent(html),
                selection: () => api.html.selectionIn(body(), editor.getDoc().getSelection()),
                setSelection(positions) {
                    const range = api.html.select(body(), positions)

                    if (range) editor.selection.setRng(range)
                },
                caretRect: (position) => api.html.caretRectAt(body(), position),
                isFocused: () => editor.hasFocus(),
                isAlive: () => !editor.removed && !!editor.getContainer()?.isConnected,
                destroy() {
                    editor.off('input change undo redo keyup', changed)
                    editor.off('SelectionChange', moved)
                },
            }
        },
    })
}

window.filamentCollaboration
    ? registerAdapter(window.filamentCollaboration)
    : window.addEventListener('filament-collaboration:init', (event) => registerAdapter(/** @type {CustomEvent} */ (event).detail), { once: true })

/** The field itself: TinyMCE, its HTML in the Livewire state. */
export default function demoTinyMce({ state }) {
    return {
        state,
        editor: null,

        init() {
            tinymce.init({
                target: this.$refs.editor,
                license_key: 'gpl',
                skin_url: 'default',
                content_css: 'default',
                menubar: false,
                promotion: false,
                branding: false,
                statusbar: false,
                height: 240,
                plugins: 'lists link',
                toolbar: 'undo redo | blocks | bold italic underline strikethrough | bullist numlist blockquote | link',
                setup: (editor) => {
                    this.editor = editor
                    this.$el.demoEditor = editor
                    editor.on('init', () => editor.setContent(this.state ?? ''))
                    editor.on('input change undo redo SetContent', () => {
                        const html = editor.getContent()

                        if (html !== this.state) this.state = html
                    })
                },
            })

            this.$watch('state', (value) => {
                if (this.editor?.initialized && (value ?? '') !== this.editor.getContent()) this.editor.setContent(value ?? '')
            })
        },

        /** For the browser tests: put the caret at a position. */
        place(position) {
            this.editor.focus()
            this.editor.selection.setRng(window.filamentCollaboration.html.select(this.editor.getBody(), { anchor: position, head: position }))
        },

        text() {
            return this.editor.getBody().textContent
        },

        destroy() {
            this.editor?.remove()
        },
    }
}
