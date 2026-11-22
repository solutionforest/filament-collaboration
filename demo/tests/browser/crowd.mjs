import { Document } from '../../../resources/js/crdt/document.js'

/**
 * Editors without a browser: real sessions, real tokens, the same CRDT and the
 * same endpoint, at the pace the browser client uses.
 */
export async function crowd(app, { size, article = 3, parallel = 8 }) {
    const queue = app.sessions(size)
    const members = []

    async function join({ name, cookie }) {
        const response = await fetch(`${app.base}/admin/documents/${article}/edit`, { headers: { cookie } })
        const encoded = (await response.text()).match(/data-collaboration="([^"]+)"/)?.[1]

        if (!encoded) throw new Error(`${name} has no room (HTTP ${response.status})`)

        const config = JSON.parse(
            encoded.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'),
        )

        members.push(new Member(name, cookie, config))
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
