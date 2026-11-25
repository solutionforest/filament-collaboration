import '../css/editor.css'
import 'trix'
import 'trix/dist/trix.css'

/**
 * The adapter. Trix keeps its HTML in a hidden input and follows the DOM
 * selection, so the HTML helpers do the rest.
 */
FilamentCollaboration.adapter('demo-trix', {
    format: 'html',
    attach({ element, changed, moved }) {
        const trix = element.querySelector('trix-editor')

        if (!trix?.editor) return null

        const events = new AbortController()

        trix.addEventListener('trix-change', changed, { signal: events.signal })
        trix.addEventListener('trix-selection-change', moved, { signal: events.signal })

        return {
            // Its own HTML, not the hidden input, which only follows on the next change event.
            read: () => trix.innerHTML,
            write: (html) => trix.editor.loadHTML(html),
            selection: () => FilamentCollaboration.html.selectionIn(trix, window.getSelection()),
            setSelection: (positions) => FilamentCollaboration.html.select(trix, positions),
            caretRect: (position) => FilamentCollaboration.html.caretRectAt(trix, position),
            isFocused: () => document.activeElement === trix,
            isAlive: () => trix.isConnected,
            destroy: () => events.abort(),
        }
    },
})

let inputs = 0

/** The field itself: Trix, its HTML in the Livewire state. */
export default function demoTrix({ state }) {
    return {
        state,

        init() {
            const input = document.createElement('input')

            input.type = 'hidden'
            input.id = `demo-trix-input-${++inputs}`
            input.value = this.state ?? ''

            const trix = document.createElement('trix-editor')

            trix.setAttribute('input', input.id)
            trix.classList.add('trix-content')
            this.$refs.editor.append(input, trix)
            this.trix = trix

            trix.addEventListener('trix-change', () => {
                if (trix.value !== this.state) this.state = trix.value
            })

            this.$watch('state', (value) => {
                if (!trix.editor || (value ?? '') === trix.value) return

                // Reloading moves the caret to the end: keep it where the person typing has it.
                const range = document.activeElement === trix ? trix.editor.getSelectedRange() : null

                trix.editor.loadHTML(value ?? '')

                if (range) trix.editor.setSelectedRange(range)
            })
        },

        /** For the browser tests: put the caret at a position. */
        place(position) {
            this.trix.focus()
            FilamentCollaboration.html.select(this.trix, { anchor: position, head: position })
        },

        text() {
            return this.trix.textContent
        },
    }
}
