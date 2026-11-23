import '../css/collaboration.css'
import { Room } from './room/room.js'
import * as html from './adapters/html.js'
import { minimalChange, registerAdapter } from './adapters/registry.js'
import { registerFilamentAdapters } from './adapters/filament.js'
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
    if (window.filamentCollaboration) return

    window.filamentCollaboration = {
        inspect: () => [...rooms.values()].map(({ room }) => room.inspect()),
        registerAdapter,
        // For adapters: change only what differs, and map HTML editors' carets.
        minimalChange,
        html,
    }

    registerFilamentAdapters(registerAdapter)

    // For adapters loaded before this script: they wait for this event.
    window.dispatchEvent(new CustomEvent('filament-collaboration:init', { detail: window.filamentCollaboration }))

    setInterval(scan, 250)
    document.addEventListener('livewire:navigated', scan)
    scan()
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
else boot()
