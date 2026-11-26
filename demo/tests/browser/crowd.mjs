import { Document } from '@solutionforest/laravel-collaboration/crdt/document.js'

/**
 * Editors without a browser: real sessions, real tokens, the same CRDT and the
 * same endpoint, at the pace the browser client uses.
 */
export async function crowd(app, { size, article = 3, parallel = 8 }) {
    const queue = app.sessions(size)
    const members = []

    let joined = 0

    async function join({ name, cookie }) {
        // With several servers, each member stays on one, in turn.
        const base = app.bases[joined++ % app.bases.length]
        const response = await fetch(`${base}/admin/documents/${article}/edit`, { headers: { cookie } })
        const encoded = (await response.text()).match(/data-collaboration="([^"]+)"/)?.[1]

        if (!encoded) throw new Error(`${name} has no room (HTTP ${response.status})`)

        const config = JSON.parse(
            encoded.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'),
        )

        config.url = config.url.replace(app.base, base)
        members.push(Object.assign(new Member(name, cookie, config), { server: base }))
    }

    await Promise.all(
        Array.from({ length: parallel }, async () => {
            while (queue.length) await join(queue.shift())
        }),
    )

    return members.sort((a, b) => a.name.localeCompare(b.name))
}

class Member {
    constructor(name, cookie, config) {
        this.name = name
        this.cookie = cookie
        this.config = config
        this.document = null
        this.epoch = 0
        this.sequence = -1
        this.etag = null
        this.number = 0
        this.pending = []
        this.field = null
        this.cursor = null
        this.total = 0
        this.latency = []
        this.errors = []
        this.pushes = 0
        this.applied = 0
    }

    /** As Room.pushed(): apply what follows on, fetch the rest. Returns a delay, or null. */
    pushed(payload, others) {
        let delay = null

        if (payload.operations && this.document) {
            if (payload.epoch === this.epoch && payload.from === this.sequence && !this.syncing) {
                this.document.apply(payload.operations)
                this.sequence = payload.to
                this.applied++
            } else if (payload.to > this.sequence) {
                delay = 30
            }
        }

        if (payload.sync) delay = 30
        if (payload.people) delay = Math.min(delay ?? Infinity, Math.min(1500, Math.max(50, 10 * others)))

        return delay
    }

    /**
     * Listens on the room's channel over the Pusher protocol, as Echo does in
     * the browser. Calls `onChange` for every push.
     */
    async listen(app, onChange) {
        const { REVERB_APP_KEY: key } = app.env
        const socket = new WebSocket(`ws://127.0.0.1:${app.reverb}/app/${key}?protocol=7&client=js&version=8.4.0&flash=false`)

        await new Promise((resolve, reject) => {
            socket.addEventListener('error', reject, { once: true })
            socket.addEventListener('message', async ({ data }) => {
                const message = JSON.parse(data)

                if (message.event === 'pusher:connection_established') {
                    const channel = `private-${this.config.channel}`
                    const response = await fetch(`${app.base}/broadcasting/auth`, {
                        method: 'POST',
                        headers: { cookie: this.cookie, 'content-type': 'application/x-www-form-urlencoded', 'x-csrf-token': this.config.csrf, accept: 'application/json' },
                        body: new URLSearchParams({ socket_id: JSON.parse(message.data).socket_id, channel_name: channel }),
                    })

                    if (!response.ok) return reject(new Error(`${this.name} was refused the channel: ${response.status}`))

                    socket.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel, auth: (await response.json()).auth } }))
                } else if (message.event === 'pusher_internal:subscription_succeeded') {
                    resolve()
                } else if (message.event === 'changed') {
                    this.pushes++
                    onChange(JSON.parse(message.data))
                }
            })
        })

        this.socket = socket
    }

    close() {
        this.socket?.close()
    }

    focus(field, offset = null) {
        this.field = field

        const sequence = this.document?.sequence(field)

        if (!sequence || offset === null) {
            this.cursor = null

            return
        }

        const id = sequence.idBefore(Math.min(offset, sequence.tokens().length))

        this.cursor = { anchor: id, head: id }
    }

    edit(field, change) {
        const operations = this.document.changes(field, change(this.document.value(field)), this.config.client)

        this.document.apply(operations)

        if (operations.length) this.pending.push({ n: ++this.number, ops: operations })
    }

    async sync() {
        if (this.syncing) return

        this.syncing = true

        try {
            await this.request()
        } finally {
            this.syncing = false
        }
    }

    async request() {
        const batches = this.pending.slice()
        const started = performance.now()
        const response = await fetch(this.config.url, {
            method: 'POST',
            headers: { cookie: this.cookie, 'content-type': 'application/json', accept: 'application/json', 'x-csrf-token': this.config.csrf },
            body: JSON.stringify({
                token: this.config.token,
                epoch: this.epoch,
                since: this.sequence,
                presence: this.etag,
                field: this.field,
                cursor: this.cursor,
                idle: false,
                batches,
            }),
        })
        const body = await response.json().catch(() => null)

        this.latency.push(performance.now() - started)

        if (!response.ok || !body) {
            this.errors.push(response.status)

            return
        }

        this.pending = this.pending.slice(batches.length)

        if (body.state) {
            this.document = new Document(body.state)

            for (const { ops } of this.pending) this.document.apply(ops)
        } else {
            this.document?.apply(body.operations)
        }

        this.epoch = body.epoch
        this.sequence = body.sequence
        this.etag = body.presence
        this.total = body.total
    }
}
