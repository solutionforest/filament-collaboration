import '../css/editor.css'

/**
 * The adapters: how filament-collaboration reads and writes each field.
 * docs/custom-components.md walks through them.
 */
// A text field: merged character by character, with carets.
FilamentCollaboration.adapter('demo-post-composer', {
    format: 'text',
    attach({ element, changed, moved }) {
        /** @type {HTMLTextAreaElement | null} */
        const input = element.querySelector('.demo-composer-input')

        // The Alpine component loads lazily: not ready yet, asked again shortly.
        if (!input) return null

        const events = new AbortController()
        const { signal } = events
        let composing = false

        input.addEventListener('input', changed, { signal })
        for (const name of ['select', 'keyup', 'pointerup', 'focus']) input.addEventListener(name, moved, { signal })
        input.addEventListener('compositionstart', () => (composing = true), { signal })
        input.addEventListener('compositionend', () => (composing = false), { signal })

        return {
            read: () => input.value,
            write(value) {
                // Change only what differs, so the caret and the undo history survive.
                const change = FilamentCollaboration.minimalChange(input.value, value)

                if (!change) return

                input.setRangeText(change.insert, change.from, change.to, 'preserve')
                // Tell Alpine's x-model, so the Livewire state follows.
                input.dispatchEvent(new Event('input', { bubbles: true }))
            },
            selection: () => {
                const backward = input.selectionDirection === 'backward'

                return { anchor: backward ? input.selectionEnd : input.selectionStart, head: backward ? input.selectionStart : input.selectionEnd }
            },
            setSelection: ({ anchor, head }) => input.setSelectionRange(Math.min(anchor, head), Math.max(anchor, head), anchor > head ? 'backward' : 'forward'),
            caretRect: (offset) => FilamentCollaboration.caretRect(input, offset),
            isFocused: () => document.activeElement === input,
            isBusy: () => composing,
            isAlive: () => input.isConnected,
            destroy: () => events.abort(),
        }
    },
})

// A picker: the latest choice wins, so it only reads and writes a value.
FilamentCollaboration.adapter('demo-star-rating', {
    format: 'value',
    attach({ element, changed }) {
        const root = element.querySelector('.demo-rating')
        const data = root && window.Alpine?.$data(root)

        if (!data || !('state' in data)) return null

        const events = new AbortController()

        root.addEventListener('demo-widget-change', changed, { signal: events.signal })

        return {
            read: () => data.state ?? null,
            write: (value) => (data.state = value ?? null),
            isFocused: () => root.contains(document.activeElement),
            isAlive: () => root.isConnected,
            destroy: () => events.abort(),
        }
    },
})

/** The fields themselves: a post composer and a star rating, their state entangled with Livewire. */
export default function demoWidget({ type, state, limit = 280, stars = 5 }) {
    return {
        type,
        state,
        limit,
        stars,
        hover: null,

        init() {
            // A picker has no input event of its own: say when its value changes.
            this.$watch('state', () => this.$el.dispatchEvent(new CustomEvent('demo-widget-change')))
        },

        get remaining() {
            return this.limit - (this.state ?? '').length
        },

        get ring() {
            const used = Math.min(1, (this.state ?? '').length / this.limit)

            return { strokeDashoffset: String(50.3 * (1 - used)), stroke: used >= 1 ? '#dc2626' : undefined }
        },
    }
}
