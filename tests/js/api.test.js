import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createApi } from '../../resources/js/api.js'
import { adapters, registerAdapter } from '../../resources/js/adapters/registry.js'

// The stub the plugin puts in the page's head, read from the PHP that renders it.
const stub = /ADAPTER_QUEUE_SCRIPT = '([^']+)';/.exec(readFileSync(new URL('../../src/CollaborationPlugin.php', import.meta.url), 'utf8'))?.[1] ?? ''

/** A fresh `window`, with the head's stub evaluated in it. */
function page() {
    const window = /** @type {any} */ ({})

    new Function('window', stub)(window)

    return window
}

/** @type {any} */
const definition = { format: 'text', attach: () => ({ read: () => '', write: () => {} }) }

test('an adapter registered before the package loads waits in the stub, then is registered', () => {
    const window = page()

    window.FilamentCollaboration.adapter('early-editor', definition).adapter('early-chained', definition)

    assert.equal(adapters.has('early-editor'), false)

    const api = createApi(window.FilamentCollaboration, registerAdapter, { helper: 1 })

    assert.equal(api, window.FilamentCollaboration, 'the stub becomes the API itself, so a kept reference still works')
    assert.equal(adapters.get('early-editor'), definition)
    assert.equal(adapters.get('early-chained'), definition)
    assert.equal(api.helper, 1)
    assert.equal('queue' in api, false)
})

test('an adapter registered after the package loads is registered at once, under either name', () => {
    const api = createApi(page().FilamentCollaboration, registerAdapter, {})

    assert.equal(api.adapter('late-editor', definition), api)
    assert.equal(api.registerAdapter('late-former-name', definition), api)
    assert.equal(adapters.get('late-editor'), definition)
    assert.equal(adapters.get('late-former-name'), definition)
})

test('one broken queued adapter is reported, and the others are still registered', () => {
    const window = page()
    /** @type {unknown[]} */
    const reported = []

    window.FilamentCollaboration.adapter('broken-editor', { format: 'nonsense' }).adapter('after-broken', definition)
    createApi(window.FilamentCollaboration, registerAdapter, {}, (error) => reported.push(error))

    assert.equal(reported.length, 1)
    assert.match(String(reported[0]), /broken-editor/)
    assert.equal(adapters.get('after-broken'), definition)
})

test('without a stub, as on a page that is not a panel, the API is created all the same', () => {
    const api = createApi(undefined, registerAdapter, {})

    api.adapter('no-stub-editor', definition)

    assert.equal(adapters.get('no-stub-editor'), definition)
})
