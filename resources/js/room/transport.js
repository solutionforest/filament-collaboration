export class SyncError extends Error {
    constructor(status, code) {
        super(`${status} ${code}`)
        this.status = status
        this.code = code
    }
}

/**
 * Sync over HTTP. It needs nothing but Laravel: no WebSocket server, no Node.
 */
export class HttpTransport {
    name = 'HTTP'

    async send({ url, csrf }, payload, { keepalive = false } = {}) {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 15000)

        try {
            const response = await fetch(url, {
                method: 'POST',
                credentials: 'same-origin',
                keepalive,
                signal: controller.signal,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify(payload),
            })

            const body = await response.json().catch(() => null)

            if (!response.ok || !body) throw new SyncError(response.status, body?.error ?? 'failed')

            return body
        } finally {
            clearTimeout(timeout)
        }
    }
}
