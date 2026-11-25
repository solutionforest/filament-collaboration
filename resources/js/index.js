import '../css/collaboration.css'
import { Room } from './room/room.js'
import * as html from './adapters/html.js'
import * as prosemirror from './adapters/prosemirror.js'
import { minimalChange, registerAdapter } from './adapters/registry.js'
import { createApi } from './api.js'
import { registerFilamentAdapters } from './adapters/filament.js'
import { measureText } from './ui/measure-text.js'
import { renderInspector } from './ui/inspector.js'

/** @type {Map<HTMLElement, {source: string, room: Room}>} */
const rooms = new Map()

function scan() {
    if (!window.Livewire || !window.Alpine) return

    const present = new Set()

    for (const el of document.querySelectorAll(/** @type {'div'} */ ('[data-collaboration]'))) {
        const source = el.dataset.collaboration ?? ''
        const known = rooms.get(el)

        present.add(el)

        if (known?.source === source) continue

        /** @type {RoomConfig} */
        const config = JSON.parse(source)

        // A morph may move a room to a new element; it is still the same room.
        const moved = known ? null : [...rooms].find(([old, entry]) => !old.isConnected && entry.room.config.id === config.id)

        if (moved) rooms.delete(moved[0])

        // Switching language on a translated page: another draft, so another room in this tab.
        if (known && known.room.config.draft !== config.draft) {
            known.room.destroy()
            rooms.delete(el)
        }

        const reusable = known && rooms.has(el) ? known : null
        const movedRoom = moved && moved[1].room.config.draft === config.draft ? moved[1].room : (moved?.[1].room.destroy(), null)
        const room = reusable?.room ?? movedRoom
        const component = el.closest('[wire\\:id]')

        // Livewire starts after this script; a room needs its component's state.
        if (!room && component && !window.Livewire.find(component.getAttribute('wire:id'))) {
            present.delete(el)
            continue
        }

        if (room) room.update(el, config)

        rooms.set(el, { source, room: room ?? new Room(el, config) })
    }

    for (const [el, { room }] of rooms) {
        if (present.has(el)) {
            room.tick()
            continue
        }

        room.destroy()
        rooms.delete(el)
    }

    renderInspector([...rooms.values()].map((entry) => entry.room))
}

function boot() {
    if (window.FilamentCollaboration?.inspect) return

    // Filament's own fields first, so an app may replace one of their adapters.
    registerFilamentAdapters(registerAdapter)

    const api = createApi(window.FilamentCollaboration, registerAdapter, {
        inspect: () => [...rooms.values()].map(({ room }) => room.inspect()),
        // For adapters: change only what differs, and map HTML editors' carets.
        minimalChange,
        html,
        // For ProseMirror and TipTap editors, as Filament's own rich editor uses them.
        prosemirror,
        // Where a caret at this offset of an input or textarea is, in viewport coordinates.
        caretRect: (/** @type {HTMLInputElement | HTMLTextAreaElement} */ input, /** @type {number} */ offset) => measureText(input, offset, offset)?.caret ?? null,
    })

    window.FilamentCollaboration = api
    // The name before 0.3.0.
    window.filamentCollaboration = api

    // For scripts that waited for the package before 0.3.0.
    window.dispatchEvent(new CustomEvent('filament-collaboration:init', { detail: api }))

    setInterval(scan, 250)
    document.addEventListener('livewire:navigated', scan)
    scan()
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
else boot()
