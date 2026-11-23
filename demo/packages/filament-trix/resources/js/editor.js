import '../css/editor.css'
import 'trix'
import 'trix/dist/trix.css'

/**
 * The adapter. Trix keeps its HTML in a hidden input and follows the DOM
 * selection, so the HTML helpers do the rest.
 *
 * @param {any} api window.filamentCollaboration
 */
function registerAdapter(api) {
    api.registerAdapter('demo-trix', {
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
                selection: () => api.html.selectionIn(trix, window.getSelection()),
                setSelection: (positions) => api.html.select(trix, positions),
                caretRect: (position) => api.html.caretRectAt(trix, position),
                isFocused: () => document.activeElement === trix,
                isAlive: () => trix.isConnected,
                destroy: () => events.abort(),
            }
        },
    })
}

window.filamentCollaboration
    ? registerAdapter(window.filamentCollaboration)
    : window.addEventListener('filament-collaboration:init', (event) => registerAdapter(/** @type {CustomEvent} */ (event).detail), { once: true })

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
                if (trix.editor && (value ?? '') !== trix.value) trix.editor.loadHTML(value ?? '')
            })
        },

        /** For the browser tests: put the caret at a position. */
        place(position) {
            this.trix.focus()
            window.filamentCollaboration.html.select(this.trix, { anchor: position, head: position })
        },

        text() {
            return this.trix.textContent
        },
    }
}
