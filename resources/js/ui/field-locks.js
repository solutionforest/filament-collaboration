import { element, translate } from '../dom.js'

/**
 * Fields that are not live: say who is editing one, so nobody changes it
 * unawares. A field in `config.locks` is also read-only for everybody else
 * meanwhile. Reapplied on every tick, as Livewire morphs remove both.
 */
export class FieldLocks {
    /** @param {import('../room/room.js').Room} room */
    constructor(room) {
        this.room = room
        /** @type {Map<string, Element>} wrappers marked by the last update */
        this.marked = new Map()
    }

    update() {
        const { config, presence, bound } = this.room
        /** @type {Map<string, Element>} */
        const marked = new Map()

        for (const field of this.room.stopped ? [] : Object.keys(config.labels)) {
            if (bound.has(field)) continue

            const editors = presence.people.filter((person) => person.field === field && !person.idle && !person.self && person.mode === 'editing')
            const wrapper = editors.length && this.room.field !== field ? this.room.dom.wrapper(field) : null

            if (!wrapper || wrapper.contains(document.activeElement)) continue

            this.mark(wrapper, editors, config.locks.includes(field))
            marked.set(field, wrapper)
        }

        for (const [field, wrapper] of this.marked) {
            if (marked.get(field) !== wrapper) this.unmark(wrapper)
        }

        this.marked = marked
    }

    /**
     * @param {Element} wrapper
     * @param {Person[]} editors
     * @param {boolean} locked
     */
    mark(wrapper, editors, locked) {
        const { strings } = this.room.config
        const [first] = editors
        const names = editors.length > 1 ? `${first?.name} +${editors.length - 1}` : (first?.name ?? '')
        const text = translate(locked ? strings.locked_field : strings.busy_field, { name: names })
        let note = wrapper.querySelector(':scope > .fi-collab-field-note')

        if (!note) {
            note = element('p', { class: 'fi-collab-field-note', role: 'status' })
            wrapper.append(note)
        }

        if (note.textContent !== text) note.textContent = text

        note.toggleAttribute('data-locked', locked)
        wrapper.classList.toggle('fi-collab-locked', locked)

        for (const control of this.controls(wrapper)) {
            if (locked) control.setAttribute('inert', '')
            else control.removeAttribute('inert')
        }
    }

    /** @param {Element} wrapper */
    unmark(wrapper) {
        wrapper.querySelector(':scope > .fi-collab-field-note')?.remove()
        wrapper.classList.remove('fi-collab-locked')

        for (const control of this.controls(wrapper)) control.removeAttribute('inert')
    }

    /** @param {Element} wrapper */
    controls(wrapper) {
        return [...wrapper.children].filter((child) => !child.classList.contains('fi-collab-field-note'))
    }

    destroy() {
        for (const wrapper of this.marked.values()) this.unmark(wrapper)

        this.marked.clear()
    }
}
