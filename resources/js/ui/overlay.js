import { element } from '../dom.js'
import { visibleHeader } from './containers.js'

const MAX_CARETS = 30
const MAX_FLAGS = 6
const MAX_CHIPS = 3
/**
 * Something drawn: a field outline and name tag, a caret with its flag, a
 * selection, or a chip on the tab, step or section that hides someone's field.
 *
 * @typedef {{kind: 'outline' | 'tag' | 'selection' | 'caret' | 'flag' | 'chip', left: number, top: number, width?: number, height?: number, color: string, text?: string}} Shape
 */

/** @type {(name: string) => string} */
const firstName = (name) => name.trim().split(/\s+/)[0] ?? ''
/** @type {(a: {left: number, right: number, top: number, bottom: number}, b: {left: number, right: number, top: number, bottom: number}) => boolean} */
const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

/**
 * Other people's field outlines, carets and selections.
 *
 * Drawn in a layer of its own, so Livewire morphs and ProseMirror never see it.
 */
export class Overlay {
    /** @type {number | null} */
    frame = null
    destroyed = false

    /** @param {import('../room/room.js').Room} room */
    constructor(room) {
        this.room = room
        this.layer = element('div', { class: 'fi-collab-overlay', 'aria-hidden': 'true' })
        this.events = new AbortController()
        this.signature = ''

        document.body.append(this.layer)

        const options = { signal: this.events.signal, capture: true, passive: true }

        window.addEventListener('scroll', () => this.schedule(), options)
        window.addEventListener('resize', () => this.schedule(), options)
        // Switching tabs, steps and sections moves fields without scrolling.
        document.addEventListener('click', () => requestAnimationFrame(() => this.schedule()), options)
    }

    schedule() {
        this.frame ??= requestAnimationFrame(() => {
            this.frame = null
            this.draw()
        })
    }

    draw() {
        if (this.destroyed) return

        // Livewire navigation and morphs may have taken the layer out.
        if (!this.layer.isConnected) document.body.append(this.layer)

        const { modal } = this.room.dom
        const covered = !modal && [...document.querySelectorAll('.fi-modal.fi-modal-open')].some((open) => open.getClientRects().length)
        const people = covered ? [] : this.room.presence.people.filter((person) => person.field)

        if (!people.length) {
            this.layer.replaceChildren()
            this.signature = ''

            return
        }

        this.layer.classList.toggle('fi-collab-overlay-modal', !!modal)
        this.layer.style.setProperty(
            '--fi-collab-top',
            `${Math.max(0, modal ? 0 : (document.querySelector('.fi-topbar-ctn, .fi-topbar')?.getBoundingClientRect().bottom ?? 0))}px`,
        )

        /** @type {Map<string, Person[]>} */
        const fields = new Map()

        for (const person of people) {
            const field = /** @type {string} */ (person.field)

            fields.set(field, [...(fields.get(field) ?? []), person])
        }

        /** @type {Shape[]} */
        const shapes = []

        /** @type {Map<Element, Person[]>} */
        const hidden = new Map()

        for (const [field, present] of fields) this.drawField(field, present, shapes, hidden)

        for (const [header, present] of hidden) this.drawChips(header, present, shapes)

        const signature = JSON.stringify(shapes)

        if (signature === this.signature && this.layer.childElementCount) return

        this.signature = signature
        this.layer.replaceChildren(
            ...shapes.map(({ kind, left, top, width, height, color, text }) =>
                element('div', {
                    class: `fi-collab-${kind}`,
                    text,
                    style: {
                        '--fi-collab-color': color,
                        left: `${left}px`,
                        top: `${top}px`,
                        ...(width === undefined ? {} : { width: `${width}px` }),
                        ...(height === undefined ? {} : { height: `${height}px` }),
                    },
                }),
            ),
        )
    }

    /**
     * @param {string} field
     * @param {Person[]} present who is in it, at least one
     * @param {Shape[]} shapes drawn so far
     * @param {Map<Element, Person[]>} hidden who is in a field that a closed tab, step or section hides, by its header
     */
    drawField(field, present, shapes, hidden) {
        const wrapper = this.room.dom.wrapper(field)

        if (!wrapper) return

        if (!wrapper.getClientRects().length) {
            const header = visibleHeader(wrapper, this.room.dom.root)

            if (header) hidden.set(header, [...(hidden.get(header) ?? []), ...present])

            return
        }

        const control =
            wrapper.querySelector('.fi-fo-rich-editor, .fi-input-wrp, .fi-fo-textarea, .fi-select-input, .fi-toggle') ??
            wrapper.querySelector('.fi-fo-field-content-col') ??
            wrapper
        const box = control.getBoundingClientRect()

        if (!box.width || box.bottom < 0 || box.top > innerHeight) return

        const lead = present.find((person) => !person.idle) ?? present[0]

        if (!lead) return

        shapes.push({ kind: 'outline', left: box.left, top: box.top, width: box.width, height: box.height, color: lead.color })

        const names = new Map(present.map((person) => [person.key, person]))

        shapes.push({
            kind: 'tag',
            left: box.right,
            top: box.top,
            color: lead.color,
            text: names.size > 1 ? `${firstName(lead.name)} +${names.size - 1}` : lead.name,
        })

        const binding = this.room.bindings.get(field)
        /** @type {Array<{left: number, right: number, top: number, bottom: number}>} */
        const flags = []

        for (const person of present.filter((item) => item.cursor).slice(0, MAX_CARETS)) {
            const geometry = person.cursor && binding?.geometry(person.cursor)

            if (!geometry) continue

            const { caret, selection, clip } = geometry

            for (const rect of selection) {
                const left = Math.max(rect.left, clip.left)
                const top = Math.max(rect.top, clip.top)
                const right = Math.min(rect.right, clip.right)
                const bottom = Math.min(rect.bottom, clip.bottom)

                if (right > left && bottom > top) {
                    shapes.push({ kind: 'selection', left, top, width: right - left, height: bottom - top, color: person.color })
                }
            }

            const middle = caret.top + caret.height / 2

            if (caret.left < clip.left - 1 || caret.left > clip.right + 1 || middle < clip.top || middle > clip.bottom) continue

            shapes.push({ kind: 'caret', left: caret.left, top: caret.top, height: caret.height, color: person.color })

            const name = firstName(person.name)
            const flag = { left: caret.left, right: caret.left + 10 + name.length * 7, top: caret.top - 16, bottom: caret.top }

            // In a crowd the carets are enough; names would hide the text.
            if (person.idle || flags.length >= MAX_FLAGS || flags.some((other) => overlaps(other, flag))) continue

            flags.push(flag)
            shapes.push({ kind: 'flag', left: caret.left, top: caret.top, color: person.color, text: name })
        }
    }

    /**
     * Initials on a tab, step or section header, for the people in a field it hides.
     *
     * @param {Element} header
     * @param {Person[]} present
     * @param {Shape[]} shapes
     */
    drawChips(header, present, shapes) {
        const box = header.getBoundingClientRect()

        if (!box.width || box.bottom < 0 || box.top > innerHeight) return

        const people = [...new Map(present.map((person) => [person.key, person])).values()]
        const shown = people.slice(0, people.length > MAX_CHIPS ? MAX_CHIPS - 1 : MAX_CHIPS)
        shown.forEach((person, index) => {
            shapes.push({ kind: 'chip', left: box.right - 6 - index * 14, top: box.top + 2, color: person.color, text: person.initials })
        })

        if (people.length > shown.length) {
            shapes.push({ kind: 'chip', left: box.right - 6 - shown.length * 14, top: box.top + 2, color: '#71717a', text: `+${people.length - shown.length}` })
        }
    }

    destroy() {
        this.destroyed = true
        this.events.abort()
        if (this.frame !== null) cancelAnimationFrame(this.frame)
        this.layer.remove()
    }
}
