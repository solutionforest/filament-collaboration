import assert from 'node:assert/strict'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'

const { window } = new JSDOM('<!doctype html><body></body>')

Object.assign(globalThis, { DOMParser: window.DOMParser, Node: window.Node })

const { documentToHtml, htmlToDocument, pointAt, positionOf, units } = await import('../../resources/js/adapters/html.js')
const { canonical } = await import('../../resources/js/crdt/id.js')
const { toDocument, toTokens } = await import('../../resources/js/crdt/rich-text.js')

/** @param {string} html */
const shared = (html) => toDocument(toTokens(htmlToDocument(html)))
/** @param {string} html */
const root = (html) => {
    const element = window.document.createElement('div')

    element.innerHTML = html

    return element
}

test('the HTML editors write turns into the document the rich editor shares', () => {
    assert.deepEqual(shared('<h2>Title</h2><p>Hello <strong>bold</strong> and <a href="https://example.com">a link</a></p>'), {
        type: 'doc',
        content: [
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Title' }] },
            {
                type: 'paragraph',
                content: [
                    { type: 'text', text: 'Hello ' },
                    { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
                    { type: 'text', text: ' and ' },
                    { type: 'text', text: 'a link', marks: [{ type: 'link', attrs: { href: 'https://example.com' } }] },
                ],
            },
        ],
    })
})

test('each editor\'s way of writing lists, quotes and empty lines means the same', () => {
    const list = canonical(shared('<ul><li><p>One</p></li><li><p>Two</p></li></ul>'))

    // TinyMCE and CKEditor, Quill, Trix.
    assert.equal(canonical(shared('<ul><li>One</li><li>Two</li></ul>')), list)
    assert.equal(canonical(shared('<ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>One</li><li data-list="bullet">Two</li></ol>')), list)
    assert.equal(canonical(shared('<div><ul><li>One</li><li>Two</li></ul></div>')), list)

    assert.equal(canonical(shared('<p><br></p>')), canonical(shared('<div><br></div>')))
    assert.equal(canonical(shared('<blockquote>Quoted</blockquote>')), canonical(shared('<blockquote><p>Quoted</p></blockquote>')))
    assert.equal(canonical(shared('<p>a&nbsp; b</p>')), canonical(shared('<p>a  b</p>')))
    assert.equal(canonical(shared('\n<p>One</p>\n<p>Two</p>\n')), canonical(shared('<p>One</p><p>Two</p>')))
})

test('a round trip through HTML keeps the document', () => {
    for (const html of [
        '<p>Plain</p>',
        '<p>Line<br>break</p>',
        '<p>Ends with a break<br></p>',
        '<h3>Heading</h3><blockquote><p>Quote</p></blockquote><hr><pre>code\n  indented</pre>',
        '<ol><li>First <em>item</em></li><li><s>Second</s></li></ol>',
        '<table><tbody><tr><th>Head</th></tr><tr><td>Cell</td></tr></tbody></table>',
        '<p>An image <img src="https://example.com/a.png" alt="A"> inline</p>',
        '<p>Two  spaces</p>',
    ]) {
        const document = shared(html)

        assert.deepEqual(shared(documentToHtml(document)), document, html)
    }
})

test('what the schema cannot hold is kept as text, never as markup', () => {
    const document = shared('<p onclick="x()">Hi <script>alert(1)</script><span style="color:red">there</span> <a href="javascript:alert(1)">link</a></p><custom-block>Inside</custom-block>')

    assert.doesNotMatch(canonical(document), /onclick|script|javascript|custom/)
    assert.match(canonical(document), /there/)
    assert.match(canonical(document), /Inside/)
})

test('carets map to positions the way the shared document counts them', () => {
    const element = root('<p>ab</p><p>c<img src="https://example.com/x.png">d</p>')
    const tokens = toTokens(htmlToDocument(element))

    assert.equal(units(element).length, tokens.length)

    const [first, second] = element.querySelectorAll('p')
    const b = /** @type {Text} */ (first?.firstChild)
    const d = /** @type {Text} */ (second?.lastChild)

    // [block a b] [block c img d]
    assert.equal(positionOf(element, b, 0), 1)
    assert.equal(positionOf(element, b, 2), 3)
    assert.equal(positionOf(element, d, 0), 6)
    assert.equal(positionOf(element, d, 1), 7)

    const point = pointAt(element, 3)

    assert.equal(point.node, b)
    assert.equal(point.offset, 2)
    assert.equal(positionOf(element, point.node, point.offset), 3)
})
