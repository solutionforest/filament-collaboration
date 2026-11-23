import assert from 'node:assert/strict'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'

const { window } = new JSDOM('<!doctype html><body></body>')

// jsdom lays nothing out: here, what is inside `[hidden]` has no boxes.
window.Element.prototype.getClientRects = function () {
    return /** @type {any} */ (this.closest('[hidden]') ? [] : [{}])
}

Object.assign(globalThis, { CSS: { escape: (/** @type {string} */ value) => value.replace(/[^\w-]/g, '\\$&') }, CustomEvent: window.CustomEvent, HTMLElement: window.HTMLElement })

const { closedAround, reveal, visibleHeader } = await import('../../resources/js/ui/containers.js')

/** @param {string} html */
function form(html) {
    const root = window.document.createElement('form')

    root.innerHTML = html
    window.document.body.replaceChildren(root)

    return root
}

const tabs = `
    <div role="tablist">
        <button type="button" aria-controls="tab-content">Content</button>
        <button type="button" aria-controls="tab-seo">SEO</button>
    </div>
    <div id="tab-content" role="tabpanel"><div data-field-wrapper id="title"></div></div>
    <div id="tab-seo" role="tabpanel" hidden>
        <section class="fi-section fi-collapsed">
            <header class="fi-section-header">Advanced</header>
            <div data-field-wrapper id="canonical"></div>
        </section>
    </div>`

test('a field in a tab that is not selected, inside a collapsed section, has both closed around it, outermost first', () => {
    const root = form(tabs)
    const closed = closedAround(/** @type {Element} */ (root.querySelector('#canonical')), root)

    assert.deepEqual(
        closed.map(({ header }) => header.textContent),
        ['SEO', 'Advanced'],
    )
})

test('a field in plain sight has nothing closed around it', () => {
    const root = form(tabs)

    assert.deepEqual(closedAround(/** @type {Element} */ (root.querySelector('#title')), root), [])
    assert.equal(reveal(/** @type {Element} */ (root.querySelector('#title')), root), false)
})

test("a hidden field's people are shown on the header that can be seen", () => {
    const root = form(tabs)

    assert.equal(visibleHeader(/** @type {Element} */ (root.querySelector('#canonical')), root)?.textContent, 'SEO')
})

test('revealing a field selects its tab and expands its section', () => {
    const root = form(tabs)
    /** @type {string[]} */
    const opened = []

    root.querySelector('[aria-controls="tab-seo"]')?.addEventListener('click', () => opened.push('tab'))
    root.querySelector('.fi-section')?.addEventListener('expand', () => opened.push('section'))

    assert.equal(reveal(/** @type {Element} */ (root.querySelector('#canonical')), root), true)
    assert.deepEqual(opened, ['tab', 'section'])
})

test('a wizard step that is not current hides its fields too', () => {
    const root = form(`
        <ol><li><button type="button" aria-controls="step-1">Details</button></li><li><button type="button" aria-controls="step-2">Review</button></li></ol>
        <div id="step-1" class="fi-sc-wizard-step"></div>
        <div id="step-2" class="fi-sc-wizard-step" hidden><div data-field-wrapper id="notes"></div></div>`)

    assert.equal(visibleHeader(/** @type {Element} */ (root.querySelector('#notes')), root)?.textContent, 'Review')
})
