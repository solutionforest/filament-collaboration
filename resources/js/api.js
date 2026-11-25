/**
 * `window.FilamentCollaboration`, the package's one global, like `Livewire` or `Alpine`:
 *
 *     FilamentCollaboration.adapter('trix', { format: 'html', attach(element) { ... } })
 *
 * The page's head defines a stub first, so an adapter's script may call
 * `adapter()` before or after this one has loaded: calls made early wait in
 * the stub's queue and are registered when the package starts.
 */

/**
 * @typedef {object} Api
 * @property {(name: string, definition: AdapterDefinition) => any} adapter teaches the package an editor, and returns the API
 * @property {(name: string, definition: AdapterDefinition) => any} registerAdapter the former name of `adapter()`
 */

/**
 * Turns the stub, or nothing, into the API, keeping the same object, and registers what was queued.
 *
 * @template {Record<string, unknown>} Helpers
 * @param {any} existing `window.FilamentCollaboration` as the page left it
 * @param {(name: string, definition: AdapterDefinition) => void} register
 * @param {Helpers} helpers
 * @param {(error: unknown) => void} [report]
 * @returns {Api & Helpers}
 */
export function createApi(existing, register, helpers, report = (error) => console.error(error)) {
    const api = existing && typeof existing === 'object' ? existing : {}
    /** @type {Array<[string, AdapterDefinition]>} */
    const queued = Array.isArray(api.queue) ? api.queue : []

    delete api.queue

    /** @param {string} name @param {AdapterDefinition} definition */
    const adapter = (name, definition) => {
        register(name, definition)

        return api
    }

    Object.assign(api, helpers, { adapter, registerAdapter: adapter })

    // One broken adapter does not keep the others from registering.
    for (const [name, definition] of queued) {
        try {
            register(name, definition)
        } catch (error) {
            report(error)
        }
    }

    return api
}
