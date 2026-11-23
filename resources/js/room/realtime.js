/**
 * Receives a room's changes over Laravel Echo as they happen. The channel is
 * per audience, so it only carries fields this tab may read. Edits are still
 * sent over HTTP, where every request is authorised and validated.
 */
export class Realtime {
    constructor(room) {
        this.room = room
        this.channel = null
        this.name = null
    }

    /** Echo is only there when the panel configures `broadcasting.echo`. */
    get echo() {
        return window.Echo ?? null
    }

    get isConnected() {
        return !!this.channel && this.subscribed && this.echo?.connector?.pusher?.connection?.state === 'connected'
    }

    /** Called after each successful sync: the channel admits people already in the room. */
    connect() {
        const name = this.room.config.channel

        if (!name || !this.echo || this.channel || this.room.destroyed) return

        this.name = name
        this.subscribed = false
        this.channel = this.echo.private(name)
        this.channel.subscribed?.(() => {
            this.subscribed = true
            this.room.realtimeChanged()
        })
        this.channel.error?.(() => this.disconnect())
        this.channel.listen('.changed', (payload) => this.room.pushed(payload))

        const connection = this.echo.connector?.pusher?.connection

        if (connection && !this.onState) {
            this.onState = () => this.room.realtimeChanged()
            connection.bind('state_change', this.onState)
        }
    }

    disconnect() {
        if (this.name) this.echo?.leave(this.name)

        this.channel = null
        this.subscribed = false
        this.room.realtimeChanged()
    }

    destroy() {
        this.echo?.connector?.pusher?.connection?.unbind?.('state_change', this.onState)
        this.disconnect()
    }
}
