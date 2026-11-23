import '../css/collaboration.css'
import { Room } from './room/room.js'
import { renderInspector } from './ui/inspector.js'

const rooms = new Map()

function scan() {
    if (!window.Livewire || !window.Alpine) return

    const present = new Set()

    for (const el of document.querySelectorAll('[data-collaboration]')) {
        const source = el.dataset.collaboration
        const known = rooms.get(el)

        present.add(el)

        if (known?.source === source) continue

        const config = JSON.parse(source)

        // A morph may move a room to a new element; it is still the same room.
        const moved = known ? null : [...rooms].find(([old, entry]) => !old.isConnected && entry.room.config.id === config.id)

        if (moved) rooms.delete(moved[0])

        const room = known?.room ?? moved?.[1].room
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
    }

    setInterval(scan, 250)
    document.addEventListener('livewire:navigated', scan)
    scan()
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
else boot()
