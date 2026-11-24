import assert from 'node:assert/strict'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'

const { window } = new JSDOM('<!doctype html><body></body>')

Object.assign(globalThis, { CSS: { escape: (/** @type {string} */ value) => value.replace(/[^\w-]/g, '\\$&') }, Element: window.Element })

const { FormDom } = await import('../../resources/js/dom.js')

test("a field's wrapper is its own, not a repeater item's sub-field of the same name that comes first", () => {
    window.document.body.innerHTML = `
        <div wire:id="page">
            <div data-field-wrapper id="item-wrapper"><label for="form.sidebar.abc.title">Title</label><input id="form.sidebar.abc.title" wire:model="data.sidebar.abc.title"></div>
            <div data-field-wrapper id="title-wrapper"><label for="form.title">Title</label><input id="form.title" wire:model="data.title"></div>
            <div data-field-wrapper id="status-wrapper"><label for="form.status">Status</label><div id="form.status"></div></div>
        </div>`

    const room = /** @type {any} */ ({ config: { statePath: 'data' }, el: window.document.body, component: window.document.querySelector('[wire\\:id]') })
    const dom = new FormDom(room)

    assert.equal(dom.wrapper('title')?.id, 'title-wrapper')
    // A picker has no input with wire:model: found by its id, still not an item's.
    assert.equal(dom.wrapper('status')?.id, 'status-wrapper')
})
