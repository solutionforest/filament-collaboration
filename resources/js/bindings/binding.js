/**
 * Connects one field to the shared document.
 *
 * Around every change from the network a room calls `collect`, `capture` and
 * `render`, in that order, so nothing local is ever overwritten.
 */
export class Binding {
    constructor(room, field) {
        this.room = room
        this.field = field
        this.path = `${room.config.statePath}.${field}`
    }

    get document() {
        return this.room.document
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

    cursor() {
        return null
    }

    /** @returns {{caret: DOMRect|null, selection: DOMRect[], clip: DOMRect}|null} */
    geometry() {
        return null
    }

    detach() {}
}
