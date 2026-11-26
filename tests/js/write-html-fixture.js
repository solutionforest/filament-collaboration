import { writeFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'

// What the browser makes of editors' HTML, for PHP to match: node tests/js/write-html-fixture.js
const { window } = new JSDOM('<!doctype html><body></body>')

Object.assign(globalThis, { DOMParser: window.DOMParser, Node: window.Node })

const { htmlToDocument } = await import('../../resources/js/adapters/html.js')
const { toDocument, toTokens } = await import('@solutionforest/laravel-collaboration/crdt/rich-text.js')

export const samples = [
    '<h2>Title</h2><p>Hello <strong>bold</strong> and <a href="https://example.com">a link</a></p>',
    '<ul><li>One</li><li>Two</li></ul>',
    '<ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>One</li><li data-list="bullet">Two</li></ol>',
    '<ol><li>First <em>item</em></li><li><s>Second</s></li></ol>',
    '<div><ul><li>One</li></ul></div><div>Trix line<br>two<br></div><div><br></div>',
    '<p><br></p>',
    '<blockquote>Quoted</blockquote><blockquote><p>Quoted</p></blockquote>',
    '<p>a&nbsp; b</p>',
    '\n<p>One</p>\n<p>Two</p>\n',
    '<p>Line<br>break</p><p>Ends with a break<br><br></p>',
    '<h3>Heading</h3><hr><pre>code\n  indented</pre>',
    '<table><tbody><tr><th>Head</th></tr><tr><td>Cell</td></tr></tbody></table>',
    '<p>An image <img src="https://example.com/a.png" alt="A"> inline</p>',
    '<p onclick="x()">Hi <script>alert(1)</script><span style="color:red">there</span> <a href="javascript:alert(1)">link</a></p><custom-block>Inside</custom-block>',
    '<p>Mixed <strong><em>both</em></strong> <u>under</u> <code>code</code> <sub>2</sub><sup>3</sup></p>',
    '<figure><img src="https://example.com/b.png"><figcaption>Caption</figcaption></figure>',
    '',
    'Loose text <b>bold</b>',
]

const cases = samples.map((html) => ({ html, document: toDocument(toTokens(htmlToDocument(html))) }))

writeFileSync(new URL('../Fixtures/html.json', import.meta.url), JSON.stringify(cases, null, 1))
