import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Schema } from 'prosemirror-model'
import { EditorState, TextSelection } from 'prosemirror-state'
import { buildDocument, replacement, toDraft, toEditor } from '../../resources/js/adapters/prosemirror.js'
import { adapters, registerAdapter } from '../../resources/js/adapters/registry.js'

const schema = new Schema({
    nodes: {
        doc: { content: 'block+' },
        paragraph: { content: 'inline*', group: 'block' },
        bulletList: { content: 'listItem+', group: 'block' },
        listItem: { content: 'paragraph block*' },
        text: { group: 'inline' },
    },
    marks: { bold: {} },
})

/** @param {...string} paragraphs */
const doc = (...paragraphs) => ({ type: 'doc', content: paragraphs.map((text) => ({ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] })) })

test('draft positions count one per block and per character, emoji included', () => {
    const node = schema.nodeFromJSON(doc('ab', '😀c'))

    // Positions: <p> a b </p> <p> 😀 c </p>; the draft counts a block start, then each character.
    assert.equal(toDraft(node, 1), 1)
    assert.equal(toDraft(node, 2), 2)
    assert.equal(toDraft(node, 3), 3)
    assert.equal(toDraft(node, 5), 4)
    assert.equal(toDraft(node, 7), 5)
    assert.equal(toEditor(node, 2), 2)
    assert.equal(toEditor(node, 5), 7)
    // Past the end: after the last character.
    assert.equal(toEditor(node, 99), 8)
})

test('a remote change touches only what differs, so a caret elsewhere stays put', () => {
    const state = EditorState.create({ doc: schema.nodeFromJSON(doc('hello', 'world')) })
    const caret = state.apply(state.tr.setSelection(TextSelection.near(state.doc.resolve(10))))
    const transaction = replacement(caret, schema.nodeFromJSON(doc('hello there', 'world')))
    const after = caret.apply(transaction)

    assert.equal(after.doc.textContent, 'hello thereworld')
    assert.equal(transaction.steps.length, 1)
    assert.equal(after.selection.head, caret.selection.head + ' there'.length)
})

test('a structure the schema refuses keeps its text, as paragraphs', () => {
    // A list item must start with a paragraph; two people's edits can leave one without.
    const broken = { type: 'doc', content: [{ type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'kept' }] }] }] }] }] }] }
    const built = buildDocument(schema, broken)

    assert.equal(built.textContent, 'kept')
    built.check()
})

test('every adapter format, Filament\'s own rich one included, is accepted; anything else is refused', () => {
    for (const format of /** @type {const} */ (['text', 'html', 'rich', 'value'])) {
        registerAdapter(`test-${format}`, { format, attach: () => null })
        assert.ok(adapters.has(`test-${format}`))
    }

    assert.throws(() => registerAdapter('test-wrong', /** @type {any} */ ({ format: 'markdown', attach: () => null })), /needs a format \(text, html, rich or value\)/)
})
