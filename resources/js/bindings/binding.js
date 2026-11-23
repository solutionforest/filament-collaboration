/**
 * Connects one field to the shared document.
 *
 * Around every change from the network a room calls `collect`, `capture` and
 * `render`, in that order, so nothing local is ever overwritten.
 */
export class Binding {
    /**
     * @param {import('../room/room.js').Room} room
     * @param {string} field
     */
    constructor(room, field) {
        this.room = room
        this.field = field
        this.path = `${room.config.statePath}.${field}`
    }

    /** Only bound once the room has its document. */
    get document() {
        return /** @type {import('../crdt/document.js').Document} */ (this.room.document)
    }

    /** Bindings are only made for a room inside a Livewire component. */
    get wire() {
        return /** @type {Wire} */ (this.room.wire)
    }

    /** The field cannot take a change at this moment, for example during IME input. */
    get isBusy() {
        return false
    }

    /** @returns {boolean} whether the field is live right now */
    attach() {
        return true
    }

    collect() {}

    capture() {}

    render() {}

    /** @returns {Cursor | null} where this user's caret is, if in this field */
    cursor() {
        return null
    }

    /**
     * Where to draw somebody's caret and selection.
     *
     * @param {Cursor} _cursor
     * @returns {Geometry | null}
     */
    geometry(_cursor) {
        return null
    }

    detach() {}
}
