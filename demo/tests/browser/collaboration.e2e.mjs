import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { start } from './harness.mjs'

// Real browsers against the real server: npm run test:e2e

let app
let alice
let bob
let nextArticle = 4

const field = (page, name) => page.locator(`[id="form.${name}"]`)
const body = (page) => page.locator('.fi-page .tiptap').first()
const text = async (page) => (await body(page).innerText()).replace(/\n+/g, '\n').trim()

const structure = (page) =>
    page.evaluate(() => {
        const root = document.querySelector('.fi-page [x-data*="richEditorFormComponent"]')

        return JSON.stringify(window.Alpine.$data(root).getEditor().getJSON())
    })

const state = (page, path) =>
    page.evaluate((path) => {
        const id = document.querySelector('.fi-page').closest('[wire\\:id]').getAttribute('wire:id')

        return JSON.parse(JSON.stringify(window.Livewire.find(id).$get(`data.${path}`, false) ?? null))
    }, path)

async function eventually(check, message, timeout = 10000) {
    const deadline = Date.now() + timeout
    let failure

    while (Date.now() < deadline) {
        try {
            return await check()
        } catch (error) {
            failure = error
        }

        await new Promise((resolve) => setTimeout(resolve, 150))
    }

    throw new Error(`${message}: ${failure?.message}`)
}

async function caret(page, locator, offset) {
    await locator.click()
    await locator.evaluate((input, offset) => {
        const at = offset < 0 ? input.value.length : offset

        input.setSelectionRange(at, at)
    }, offset)
}

async function endOfParagraph(page, index) {
    await body(page).click()
    await page.waitForTimeout(150) // ProseMirror settles a click's selection after mouseup
    await body(page).locator('p').nth(index).evaluate((paragraph) => {
        const editor = window.Alpine.$data(paragraph.closest('[x-data*="richEditorFormComponent"]')).getEditor()
        const position = editor.view.posAtDOM(paragraph, paragraph.childNodes.length)

        editor.chain().focus().setTextSelection(position).run()
    })
    // TipTap moves focus on the next frame.
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}

/** Each test gets an article of its own, open in both browsers. */
async function together() {
    const id = nextArticle++

    await Promise.all([app.edit(alice, id), app.edit(bob, id)])

    return id
}

async function save(page) {
    await (await startSave(page)).saved
}

/** Returns once clicked, while the save is still running. */
async function startSave(page) {
    const saved = page.waitForResponse(
        (response) => response.request().method() === 'POST' && /livewire/.test(response.url()) && (response.request().postData() ?? '').includes('"save"'),
    )

    await page.getByRole('button', { name: 'Save changes' }).first().click()

    // Wrapped, or returning it would wait for the response.
    return { saved }
}

before(async () => {
    app = await start()
    ;[alice, bob] = await Promise.all([app.signIn('alice'), app.signIn('bob')])
})

after(async () => app?.stop())

describe('text', () => {
    test('two people type in one input at the same time', async () => {
        await together()

        const original = await field(alice, 'title').inputValue()

        await Promise.all([caret(alice, field(alice, 'title'), 0), caret(bob, field(bob, 'title'), -1)])
        await Promise.all([
            alice.keyboard.type('Breaking news: ', { delay: 55 }),
            bob.keyboard.type(' (updated today)', { delay: 47 }),
        ])

        const expected = `Breaking news: ${original} (updated today)`

        await eventually(async () => {
            assert.equal(await field(alice, 'title').inputValue(), expected)
            assert.equal(await field(bob, 'title').inputValue(), expected)
        }, 'the title did not converge')
    })

    test('typing in the middle of the same textarea keeps every character', async () => {
        await together()

        await field(alice, 'excerpt').fill('one two three')
        await eventually(async () => assert.equal(await field(bob, 'excerpt').inputValue(), 'one two three'), 'the seed did not arrive')

        await Promise.all([caret(alice, field(alice, 'excerpt'), 4), caret(bob, field(bob, 'excerpt'), 8)])
        await Promise.all([alice.keyboard.type('ALPHA ', { delay: 70 }), bob.keyboard.type('BRAVO ', { delay: 60 })])

        await eventually(async () => {
            assert.equal(await field(alice, 'excerpt').inputValue(), 'one ALPHA two BRAVO three')
            assert.equal(await field(bob, 'excerpt').inputValue(), 'one ALPHA two BRAVO three')
        }, 'the textarea did not converge')
    })

    test('undo only undoes your own typing', async () => {
        await together()

        const original = await field(alice, 'title').inputValue()

        await caret(alice, field(alice, 'title'), -1)
        await alice.keyboard.type(' mine')
        await eventually(async () => assert.equal(await field(bob, 'title').inputValue(), `${original} mine`), 'typing did not arrive')

        await caret(bob, field(bob, 'title'), 0)
        await bob.keyboard.type('Bob ')
        await eventually(async () => assert.equal(await field(alice, 'title').inputValue(), `Bob ${original} mine`), 'typing did not arrive')

        await alice.keyboard.press('Control+z')

        await eventually(async () => {
            assert.equal(await field(alice, 'title').inputValue(), `Bob ${original}`)
            assert.equal(await field(bob, 'title').inputValue(), `Bob ${original}`)
        }, 'undo was wrong')

        await alice.keyboard.press('Control+Shift+z')
        await eventually(async () => assert.equal(await field(bob, 'title').inputValue(), `Bob ${original} mine`), 'redo was wrong')
    })

    test('IME composition is not broken by remote edits', { skip: (process.env.BROWSER ?? 'chromium') !== 'chromium' && 'needs the Chrome DevTools protocol' }, async () => {
        await together()

        const original = await field(alice, 'title').inputValue()
        const session = await alice.context().newCDPSession(alice)

        await caret(alice, field(alice, 'title'), -1)
        await session.send('Input.imeSetComposition', { text: 'hip', selectionStart: 3, selectionEnd: 3 })
        await caret(bob, field(bob, 'title'), 0)
        await bob.keyboard.type('快訊 ')
        await alice.waitForTimeout(1200)
        await session.send('Input.imeSetComposition', { text: '協作', selectionStart: 2, selectionEnd: 2 })
        await session.send('Input.insertText', { text: '協作' })

        await eventually(async () => {
            assert.equal(await field(alice, 'title').inputValue(), `快訊 ${original}協作`)
            assert.equal(await field(bob, 'title').inputValue(), `快訊 ${original}協作`)
        }, 'composition was lost')
    })
})

describe('rich editor', () => {
    test('two people type in different paragraphs', async () => {
        await together()
        await Promise.all([endOfParagraph(alice, 0), endOfParagraph(bob, 1)])
        await Promise.all([alice.keyboard.type(' Alice was here.', { delay: 50 }), bob.keyboard.type(' Bob was here.', { delay: 58 })])

        await eventually(async () => {
            const [first, second] = [await body(alice).locator('p').nth(0).innerText(), await body(alice).locator('p').nth(1).innerText()]

            assert.ok(first.endsWith(' Alice was here.'), first)
            assert.ok(second.endsWith(' Bob was here.'), second)
            assert.equal(await structure(alice), await structure(bob))
        }, 'the editor did not converge')
    })

    test('two people type in one paragraph', async () => {
        await together()
        await endOfParagraph(alice, 0)
        await body(bob).click()
        await bob.waitForTimeout(150)
        await body(bob).locator('p').first().evaluate((paragraph) => {
            const editor = window.Alpine.$data(paragraph.closest('[x-data*="richEditorFormComponent"]')).getEditor()

            editor.chain().focus().setTextSelection(editor.view.posAtDOM(paragraph, 0)).run()
        })
        // TipTap moves focus on the next frame.
        await bob.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        await Promise.all([alice.keyboard.type(' at the end', { delay: 60 }), bob.keyboard.type('At the start ', { delay: 52 })])

        await eventually(async () => {
            const first = await body(bob).locator('p').first().innerText()

            assert.ok(first.startsWith('At the start Opening') && first.endsWith(' at the end'), first)
            assert.equal(await structure(alice), await structure(bob))
        }, 'the paragraph did not converge')
    })

    test('Enter, bold, headings and lists all travel', async () => {
        await together()
        await endOfParagraph(alice, 0)
        await alice.keyboard.press('Enter')
        await alice.keyboard.type('A new line ')
        await alice.keyboard.press('Control+b')
        await alice.keyboard.type('in bold')
        await endOfParagraph(bob, (await body(bob).locator('p').count()) - 1)
        await bob.keyboard.press('Control+Shift+8')

        await eventually(async () => {
            assert.equal(await body(bob).locator('strong').innerText(), 'in bold')
            assert.equal(await body(alice).locator('ul li').count(), 1)
            assert.equal(await structure(alice), await structure(bob))
        }, 'formatting did not converge')

        await body(alice).locator('p').nth(1).click()
        await alice.locator('.fi-page .fi-fo-rich-editor-toolbar button[x-on\\:click*="level: 2"], .fi-page [data-rich-editor-tool="h2"]').first().click()

        await eventually(async () => {
            assert.equal(await body(bob).locator('h2').count(), 1)
            assert.equal(await structure(alice), await structure(bob))
        }, 'the heading did not converge')
    })

    test('half an emoji breaks neither sync nor Save', async () => {
        const id = await together()

        await endOfParagraph(alice, 0)
        await alice.keyboard.type('🙂')
        await alice.evaluate(() => {
            const editor = window.Alpine.$data(document.querySelector('.fi-page [x-data*="richEditorFormComponent"]')).getEditor()
            const to = editor.state.selection.from

            // Delete one UTF-16 unit, as a selection inside the pair would.
            editor.view.dispatch(editor.state.tr.delete(to - 1, to))
        })
        await alice.keyboard.type(' after')

        await eventually(async () => assert.match(await text(bob), /\uFFFD after/), 'sync stopped')
        await save(alice)
        await eventually(() => assert.match(app.article(id).body_html, / after/), 'Save was refused')
    })

    test('emoji typed at once by two people stay whole', async () => {
        await together()
        await Promise.all([endOfParagraph(alice, 0), endOfParagraph(bob, 0)])
        await Promise.all([alice.keyboard.type('🙂🙂🙂', { delay: 90 }), bob.keyboard.type('🙃🙃🙃', { delay: 80 })])

        await eventually(async () => {
            const value = await body(alice).locator('p').first().innerText()

            assert.equal([...value].filter((character) => ['🙂', '🙃'].includes(character)).length, 6, value)
            assert.equal(await structure(alice), await structure(bob))
        }, 'emoji were split')
    })

    test('an editor error is reported and the editor recovers from the draft', async () => {
        await together()

        const known = app.problems.length

        await endOfParagraph(alice, 0)
        await alice.keyboard.type(' shared')
        await eventually(async () => assert.match(await text(bob), / shared/), 'typing did not arrive')

        await alice.evaluate(() => {
            const editor = window.Alpine.$data(document.querySelector('.fi-page [x-data*="richEditorFormComponent"]')).getEditor()
            const { Plugin } = window.FilamentRichEditor.tiptap.pmState

            window.__recovered = []
            window.addEventListener('filament-collaboration:recovered', (event) => window.__recovered.push(event.detail))

            // Text the draft never saw, then a key ProseMirror fails on, as in the TransformError seen in testing.
            editor.view.dispatch(editor.state.tr.insertText(' unshared').setMeta('filamentCollaboration', true))
            editor.registerPlugin(
                new Plugin({
                    props: {
                        handleKeyDown: (view, event) => {
                            if (event.key !== 'F8') return false

                            throw Object.assign(new Error('Structure replace would overwrite content'), { name: 'TransformError' })
                        },
                    },
                }),
                (plugin, plugins) => [plugin, ...plugins],
            )
        })
        await alice.keyboard.press('F8')

        await eventually(async () => assert.doesNotMatch(await text(alice), /unshared/), 'the editor kept a state the draft never had')

        const recovered = await alice.evaluate(() => window.__recovered)

        assert.equal(recovered.length, 1)
        assert.equal(recovered[0].field, 'body_html')
        assert.equal(recovered[0].key, 'F8')
        assert.match(recovered[0].error, /^TransformError: /)
        assert.match(JSON.stringify(recovered[0].doc), /unshared/, 'the report has the state that failed')

        const inspected = await alice.evaluate(() => window.filamentCollaboration.inspect()[0])

        assert.equal(inspected.summary['Recovered errors'], 1)
        assert.ok(inspected.fields.some(([name, , live]) => name === 'body_html' && live.startsWith('live')), 'the editor stopped being live')

        // Typing carries on, live.
        await alice.keyboard.type(' again')
        await eventually(async () => assert.match(await text(bob), / shared again/), 'typing after recovery did not arrive')
        await eventually(async () => assert.match(app.log(), /An editor recovered from an error/), 'the server did not log the report')

        app.problems.splice(known, app.problems.length - known, ...app.problems.slice(known).filter((problem) => !/Structure replace would overwrite content|"body_html" recovered from an error/.test(problem)))
    })

    test("an image one person uploads is kept by another person's save", async () => {
        const id = await together()
        const known = app.problems.length

        await endOfParagraph(alice, 0)
        await alice.evaluate(async () => {
            // A 1x1 PNG, pasted as a file the way a screenshot is.
            const bytes = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0))
            const transfer = new DataTransfer()

            transfer.items.add(new File([bytes], 'pixel.png', { type: 'image/png' }))
            document.querySelector('.fi-page .tiptap').dispatchEvent(new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true }))
        })

        await eventually(
            async () => {
                const ids = [...(await structure(bob)).matchAll(/"type":"image","attrs":\{[^}]*"id":"([^"]+)"/g)].map(([, id]) => id)

                assert.equal(ids.length, 1)
                assert.match(ids[0], /^articles\//, 'still a temporary upload')
            },
            'the stored image did not reach Bob',
            20000,
        )

        await save(bob)
        await eventually(() => assert.match(app.article(id).body_html, /articles\/[^"]+\.png/), "Bob's save dropped the image")

        // The demo has no storage link, so the image itself is not served.
        app.problems.splice(known, app.problems.length - known, ...app.problems.slice(known).filter((problem) => !/\/storage\//.test(problem)))
    })

    test('a table is shared', async () => {
        await together()
        await endOfParagraph(alice, 1)
        await alice.evaluate(() => {
            window.Alpine.$data(document.querySelector('.fi-page [x-data*="richEditorFormComponent"]')).getEditor().chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()
        })
        await alice.waitForTimeout(100) // TipTap focuses on the next frame
        await alice.keyboard.type('Header')
        assert.equal(await body(alice).locator('th').first().innerText(), 'Header')

        await eventually(async () => {
            assert.equal(await body(bob).locator('th').first().innerText(), 'Header')
            assert.equal(await body(bob).locator('td').count(), 2)
            assert.equal(await structure(alice), await structure(bob))
        }, 'the table did not converge')
    })

    test('undo leaves the other person alone', async () => {
        await together()
        await endOfParagraph(alice, 0)
        await alice.keyboard.type(' undo-me')
        await eventually(async () => assert.match(await text(bob), /undo-me/), 'typing did not arrive')
        await endOfParagraph(bob, 1)
        await bob.keyboard.type(' keep-me')
        await eventually(async () => assert.match(await text(alice), /keep-me/), 'typing did not arrive')
        await alice.keyboard.press('Control+z')

        await eventually(async () => {
            for (const page of [alice, bob]) {
                const value = await text(page)

                assert.doesNotMatch(value, /undo-me/)
                assert.match(value, /keep-me/)
            }
        }, 'undo was wrong')
    })
})

describe('picked values', () => {
    test('selects, toggles, tags and dates are shared', async () => {
        const id = await together()

        await field(alice, 'robots_noindex').click()
        await alice.evaluate(() => {
            const wire = window.Livewire.find(document.querySelector('.fi-page').closest('[wire\\:id]').getAttribute('wire:id'))

            wire.$set('data.category', 'Stories', false)
            wire.$set('data.relatedPosts', ['1', '2'], false)
        })

        const tags = alice.locator('.fi-fo-tags-input input').first()

        await tags.fill('harbour')
        await tags.press('Enter')
        await field(alice, 'published_at').fill('2026-12-01T09:30')

        await eventually(async () => {
            assert.equal(await state(bob, 'robots_noindex'), true)
            assert.equal(await state(bob, 'category'), 'Stories')
            assert.deepEqual((await state(bob, 'relatedPosts')).map(String), ['1', '2'])
            assert.ok((await state(bob, 'tags')).includes('harbour'))
            assert.match(String(await state(bob, 'published_at')), /^2026-12-01.09:30/)
            assert.equal(await field(bob, 'robots_noindex').getAttribute('aria-checked'), 'true')
            assert.match(await bob.locator('.fi-page').innerText(), /harbour/)
        }, 'the values did not converge')

        await save(bob)

        await eventually(() => {
            const row = app.article(id)

            assert.equal(row.category, 'Stories')
            assert.equal(row.robots_noindex, 1)
            assert.match(row.tags, /harbour/)
            assert.equal(app.db.prepare('select count(*) as total from document_relations where document_id = ?').get(id).total, 2)
        }, 'the values were not saved')
    })
})

describe('repeaters and builders', () => {
    const points = (page) => page.locator('.fi-page input[id*="key_points"][id$=".point"]')
    const values = async (page) => Promise.all((await points(page).all()).map((input) => input.inputValue()))

    test('items added, edited and removed by two people', async () => {
        const id = await together()

        await alice.getByRole('button', { name: 'Add key point' }).click()
        await eventually(async () => assert.equal(await points(alice).count(), 1), 'Alice has no item')
        await points(alice).first().fill('From Alice')

        await eventually(async () => assert.deepEqual(await values(bob), ['From Alice']), 'Bob did not get the item')

        await bob.getByRole('button', { name: 'Add key point' }).click()
        await eventually(async () => assert.equal(await points(bob).count(), 2), 'Bob has no second item')
        await points(bob).nth(1).fill('From Bob')

        await eventually(async () => assert.deepEqual(await values(alice), ['From Alice', 'From Bob']), 'Alice did not get the second item')

        // Both typing at once, each in their own item.
        await Promise.all([
            points(alice).first().pressSequentially(' and more', { delay: 40 }),
            points(bob).nth(1).pressSequentially(' too', { delay: 45 }),
        ])

        await eventually(async () => {
            assert.deepEqual(await values(alice), ['From Alice and more', 'From Bob too'])
            assert.deepEqual(await values(bob), ['From Alice and more', 'From Bob too'])
        }, 'the items did not converge')

        await alice.locator('.fi-page .fi-fo-repeater-item').nth(1).getByRole('button', { name: /delete/i }).click()
        await eventually(async () => assert.deepEqual(await values(bob), ['From Alice and more']), 'the removal did not reach Bob')

        await save(bob)
        await eventually(() => assert.deepEqual(JSON.parse(app.article(id).key_points).map((item) => item.point), ['From Alice and more']), 'the list was not saved')
    })

    test('two people typing in the same sub-field of one item both keep their typing', async () => {
        await together()

        await alice.getByRole('button', { name: 'Add key point' }).click()
        await eventually(async () => assert.equal(await points(alice).count(), 1), 'Alice has no item')
        await points(alice).first().fill('the fox')
        await eventually(async () => assert.deepEqual(await values(bob), ['the fox']), 'Bob did not get the item')

        await Promise.all([caret(alice, points(alice).first(), 3), caret(bob, points(bob).first(), -1)])
        await Promise.all([
            alice.keyboard.type(' quick', { delay: 60 }),
            bob.keyboard.type(' jumps', { delay: 55 }),
        ])

        await eventually(async () => {
            assert.deepEqual(await values(alice), ['the quick fox jumps'])
            assert.deepEqual(await values(bob), ['the quick fox jumps'])
        }, 'the typing did not merge')

        // Each caret stayed where its owner was typing.
        assert.equal(await points(alice).first().evaluate((input) => input.selectionStart), 'the quick'.length)
        assert.equal(await points(bob).first().evaluate((input) => input.selectionStart), 'the quick fox jumps'.length)

        // And each sees the other's caret in the input.
        await eventually(async () => assert.ok(await bob.locator('.fi-collab-caret:visible').count(), 'no caret'), 'Bob does not see where Alice is')
    })

    test('a builder block added by one person reaches the other', async () => {
        await together()

        await alice.getByRole('button', { name: 'Add to sidebar' }).click()
        await alice.locator('.fi-dropdown-panel:visible').getByText('Quote', { exact: true }).click()

        const quote = (page) => page.locator('.fi-page textarea[id*="sidebar"]')

        await eventually(async () => assert.equal(await quote(alice).count(), 1), 'Alice has no block')
        await quote(alice).fill('Shared quote')

        await eventually(async () => assert.equal(await quote(bob).inputValue(), 'Shared quote'), 'Bob did not get the block')
    })
})

describe('saving', () => {
    test('opening a record does not create a draft', async () => {
        await together()
        await alice.waitForTimeout(2000)

        const [room] = await alice.evaluate(() => window.filamentCollaboration.inspect())

        assert.equal(room.summary['Unsaved fields'], 0)
        assert.equal(room.summary['Waiting to send'], 0)
    })

    test('Save includes the last keystroke and what others typed', async () => {
        const id = await together()

        await caret(bob, field(bob, 'excerpt'), -1)
        await bob.keyboard.type(' From Bob.')
        await bob.waitForTimeout(700)
        await caret(alice, field(alice, 'title'), -1)
        await alice.keyboard.type('!')
        await save(alice)

        await eventually(() => {
            assert.match(app.article(id).title, /!$/)
            assert.match(app.article(id).excerpt, / From Bob\.$/)
        }, 'the draft was not saved')

        await eventually(async () => {
            for (const page of [alice, bob]) {
                assert.equal(await page.locator('.fi-collab-status').getAttribute('data-status'), 'synced')
            }
        }, 'the draft still says unsaved')
    })

    test('typing while a save is running is kept', async () => {
        const id = await together()
        const original = await field(alice, 'title').inputValue()

        await alice.route(/livewire.*update/, async (route) => {
            await new Promise((resolve) => setTimeout(resolve, 1500))
            // Unrouted meanwhile, Playwright has let the request through itself.
            await route.continue().catch(() => {})
        })

        await endOfParagraph(bob, 0)
        await bob.keyboard.type(' before the save')
        await caret(bob, field(bob, 'title'), -1)
        await bob.waitForTimeout(700)

        await endOfParagraph(alice, 1)
        await alice.keyboard.type(' saved')

        // Livewire makes inputs read-only while submitting, but not the editor.
        const { saved } = await startSave(alice)

        await alice.waitForTimeout(250)
        await endOfParagraph(alice, 1)
        await Promise.all([alice.keyboard.type(' and after', { delay: 45 }), bob.keyboard.type(' by Bob', { delay: 45 })])
        await saved
        await alice.unroute(/livewire.*update/)

        await eventually(async () => {
            for (const page of [alice, bob]) {
                assert.equal(await field(page, 'title').inputValue(), `${original} by Bob`)

                const value = await text(page)

                assert.match(value, / before the save/)
                assert.match(value, / saved and after/)
            }
        }, 'typing during the save was lost')

        assert.match(app.article(id).body_html, /before the save/)

        await save(bob)
        await eventually(() => {
            assert.equal(app.article(id).title, `${original} by Bob`)
            assert.match(app.article(id).body_html, / saved and after/)
        }, 'the second save was incomplete')
    })

    test('edits deep inside a list can be saved', async () => {
        await app.edit(alice, 3)
        await app.edit(bob, 3)

        for (const page of [alice, bob]) {
            await page.evaluate(() => {
                const editor = window.Alpine.$data(document.querySelector('.fi-page [x-data*="richEditorFormComponent"]')).getEditor()
                const item = editor.view.dom.querySelector('li p')

                editor.chain().focus().setTextSelection(editor.view.posAtDOM(item, item.childNodes.length)).run()
            })
            await page.waitForTimeout(100)
            await page.keyboard.type(page === alice ? ' (soon)' : ' [beta]')
            await page.waitForTimeout(700)
        }

        await save(bob)
        await save(alice)

        await eventually(() => {
            assert.match(app.article(3).body_html, /\(soon\)/)
            assert.match(app.article(3).body_html, /\[beta\]/)
        }, 'the list was not saved')
    })

    test('text inputs stay editable while their own form saves', async () => {
        const id = await together()
        const original = await field(alice, 'title').inputValue()
        const slow = async (route) => {
            await new Promise((resolve) => setTimeout(resolve, 1500))
            // Unrouted meanwhile, Playwright has let the request through itself.
            await route.continue().catch(() => {})
        }

        await alice.route(/livewire.*update/, slow)
        await caret(alice, field(alice, 'title'), -1)
        await alice.keyboard.type(' saved')

        const { saved } = await startSave(alice)

        await alice.waitForTimeout(250)
        assert.equal(await field(alice, 'title').evaluate((input) => input.readOnly), false)
        await caret(alice, field(alice, 'title'), -1)
        await alice.keyboard.type(' and after', { delay: 40 })
        await saved
        await alice.unroute(/livewire.*update/, slow)

        await eventually(async () => {
            assert.equal(await field(alice, 'title').inputValue(), `${original} saved and after`)
            assert.equal(await field(bob, 'title').inputValue(), `${original} saved and after`)
        }, 'typing during the save was lost')

        await save(bob)
        await eventually(() => assert.equal(app.article(id).title, `${original} saved and after`), 'the second save missed it')
    })

    test('two saves at once lose nothing', async () => {
        const id = await together()

        await caret(alice, field(alice, 'title'), -1)
        await alice.keyboard.type(' A')
        await caret(bob, field(bob, 'excerpt'), -1)
        await bob.keyboard.type(' B')
        await Promise.all([save(alice), save(bob)])

        await eventually(() => {
            assert.match(app.article(id).title, / A$/)
            assert.match(app.article(id).excerpt, / B$/)
        }, 'a save was lost')

        assert.equal(await bob.locator('.fi-modal.fi-modal-open:visible').count(), 0)
    })

    test('an unsaved draft survives a reload', async () => {
        await together()

        await caret(alice, field(alice, 'title'), -1)
        await alice.keyboard.type(' unsaved')
        await alice.waitForTimeout(900)
        await app.edit(alice, nextArticle - 1)

        await eventually(async () => assert.match(await field(alice, 'title').inputValue(), / unsaved$/), 'the draft was lost')
    })

    test('offline typing is sent on reconnect', async () => {
        await together()

        const known = app.problems.length

        await alice.context().setOffline(true)
        await caret(alice, field(alice, 'title'), -1)
        await alice.keyboard.type(' offline')
        await eventually(async () => assert.equal(await alice.locator('.fi-collab-status').getAttribute('data-status'), 'offline'), 'offline was not shown')

        await caret(bob, field(bob, 'title'), 0)
        await bob.keyboard.type('online ')
        await alice.context().setOffline(false)

        await eventually(
            async () => {
                const value = await field(bob, 'title').inputValue()

                assert.match(value, /^online .* offline$/)
                assert.equal(await field(alice, 'title').inputValue(), value)
            },
            'reconnecting did not converge',
            20000,
        )

        app.problems.length = known
    })

    test('unsent edits survive a reload', async () => {
        const id = await together()
        const known = app.problems.length
        const block = (route) => route.abort()
        const accept = (dialog) => dialog.accept().catch(() => {})

        await alice.route('**/_collaboration/sync', block)
        alice.on('dialog', accept)
        await caret(alice, field(alice, 'title'), -1)
        await alice.keyboard.type(' pending through reload')
        await eventually(async () => assert.equal(await alice.locator('.fi-collab-status').getAttribute('data-status'), 'offline'), 'offline was not shown')
        await alice.reload()
        await alice.unroute('**/_collaboration/sync', block)

        await eventually(
            async () => {
                assert.match(await field(alice, 'title').inputValue(), / pending through reload$/)
                assert.match(await field(bob, 'title').inputValue(), / pending through reload$/)
            },
            'unsent edits were lost',
            25000,
        )

        await app.edit(alice, id)
        assert.equal((await field(alice, 'title').inputValue()).match(/pending through reload/g).length, 1, 'recovered twice')

        alice.off('dialog', accept)
        app.problems.length = known
    })

    test('a refusal that is not ours is retried', async () => {
        await together()

        const known = app.problems.length
        let refused = 0
        const proxy = (route) => {
            if (refused++ < 3) return route.fulfill({ status: refused === 1 ? 403 : 404, contentType: 'text/html', body: '<h1>proxy</h1>' })

            return route.continue()
        }

        await alice.route('**/_collaboration/sync', proxy)
        await caret(alice, field(alice, 'title'), -1)
        await alice.keyboard.type(' through a bad proxy')

        await eventually(async () => assert.match(await field(bob, 'title').inputValue(), / through a bad proxy$/), 'live editing gave up', 20000)

        await alice.unroute('**/_collaboration/sync', proxy)
        app.problems.length = known
    })

    test('a permission change renews tokens without interrupting typing', async () => {
        await together()

        const renewed = new Set()
        const watch = (name) => (response) => response.url().includes('_collaboration/sync') && response.status() === 410 && renewed.add(name)
        const watchers = [[alice, watch('alice')], [bob, watch('bob')]]
        const known = app.problems.length

        for (const [page, handler] of watchers) page.on('response', handler)
        app.artisan('filament-collaboration:refresh-permissions')
        await caret(alice, field(alice, 'title'), -1)
        await alice.keyboard.type(' after the change', { delay: 40 })

        await eventually(async () => assert.match(await field(bob, 'title').inputValue(), / after the change$/), 'typing stopped', 15000)

        // Both renew; with Reverb, Bob only asks at his next heartbeat, up to 8 seconds later.
        await eventually(async () => assert.deepEqual([...renewed].sort(), ['alice', 'bob']), 'the old token was still accepted', 15000)

        for (const [page, handler] of watchers) page.off('response', handler)
        app.problems.length = known
    })

    test('discard returns everybody to the saved version', async () => {
        await together()

        const original = await field(alice, 'title').inputValue()

        await caret(alice, field(alice, 'title'), -1)
        await alice.keyboard.type(' junk')
        await eventually(async () => assert.equal(await bob.locator('.fi-collab-status').getAttribute('data-status'), 'unsaved'), 'unsaved was not shown')

        await bob.locator('.fi-collab-status').click()
        await bob.locator('.fi-collab-discard').click()
        await bob.locator('.fi-modal.fi-modal-open').getByRole('button', { name: 'Discard draft' }).click()

        await eventually(async () => {
            assert.equal(await field(alice, 'title').inputValue(), original)
            assert.equal(await field(bob, 'title').inputValue(), original)
        }, 'the draft was not discarded')
    })
})

describe('editors made live by adapters', () => {
    /** Puts the caret at a UTF-16 offset of a CodeMirror 5 or 6 editor's text, -1 for the end. */
    const place = (page, name, offset) =>
        page.evaluate(
            ({ name, offset }) => {
                const root = document.querySelector(`.fi-page [x-data^="${name}"]`)
                const data = window.Alpine.$data(root)
                const cm5 = data.editor?.codemirror

                if (cm5) {
                    cm5.focus()
                    cm5.setCursor(cm5.posFromIndex(offset < 0 ? cm5.getValue().length : offset))

                    return
                }

                const view = data.editor

                view.focus()
                view.dispatch({ selection: { anchor: offset < 0 ? view.state.doc.length : offset } })
            },
            { name, offset },
        )
    const value = (page, name) =>
        page.evaluate((name) => {
            const data = window.Alpine.$data(document.querySelector(`.fi-page [x-data^="${name}"]`))

            return data.editor?.codemirror?.getValue() ?? data.editor.state.doc.toString()
        }, name)

    for (const [name, label] of [['markdownEditorFormComponent', 'Markdown'], ['codeEditorFormComponent', 'code']]) {
        // CodeMirror 6 merges on save in WebKit; see the adapter.
        const skip = label === 'code' && process.env.BROWSER === 'webkit'

        test(`two people typing in ${label} editor at once both keep their typing, with carets`, { skip }, async () => {
            const id = await together()

            await place(alice, name, 0)
            await alice.keyboard.type('the fox', { delay: 20 })
            await eventually(async () => assert.equal(await value(bob, name), 'the fox'), 'Bob did not get the text')

            await Promise.all([place(alice, name, 3), place(bob, name, -1)])
            await Promise.all([alice.keyboard.type(' quick', { delay: 60 }), bob.keyboard.type(' jumps', { delay: 55 })])

            await eventually(async () => {
                assert.equal(await value(alice, name), 'the quick fox jumps')
                assert.equal(await value(bob, name), 'the quick fox jumps')
            }, 'the typing did not merge')

            await eventually(async () => assert.ok(await bob.locator('.fi-collab-caret:visible').count(), 'no caret'), 'Bob does not see where Alice is')

            await save(bob)
            const column = name.startsWith('markdown') ? 'newsletter_markdown' : 'embed_code'

            await eventually(() => assert.equal(app.article(id)[column], 'the quick fox jumps'), 'the editor was not saved')
        })
    }
})

describe('third-party HTML editors, through adapters', () => {
    const call = (page, name, method, ...args) =>
        page.evaluate(({ name, method, args }) => window.Alpine.$data(document.querySelector(`.fi-page .demo-${name}`))[method](...args), { name, method, args })
    const text = (page, name) => call(page, name, 'text')

    for (const [name, column] of [['tinymce', 'tinymce_html'], ['ckeditor', 'ckeditor_html'], ['quill', 'quill_html'], ['trix', 'trix_html']]) {
        test(`${name}: two people typing in one paragraph both keep their words, with carets`, async () => {
            const id = await together()

            // Position 1 is just inside the first paragraph.
            await call(alice, name, 'place', 1)
            await alice.keyboard.type('the fox', { delay: 25 })
            await eventually(async () => assert.equal((await text(bob, name)).trim(), 'the fox'), 'Bob did not get the text')

            await Promise.all([call(alice, name, 'place', 4), call(bob, name, 'place', 8)])
            await Promise.all([alice.keyboard.type(' quick', { delay: 70 }), bob.keyboard.type(' jumps', { delay: 65 })])

            await eventually(async () => {
                assert.equal((await text(alice, name)).trim(), 'the quick fox jumps')
                assert.equal((await text(bob, name)).trim(), 'the quick fox jumps')
            }, 'the typing did not merge', 15000)

            await eventually(async () => assert.ok(await bob.locator('.fi-collab-caret:visible').count(), 'no caret'), 'Bob does not see where Alice is')

            await save(bob)
            // Quill writes its spaces as &nbsp;.
            await eventually(() => assert.match((app.article(id)[column] ?? '').replaceAll('&nbsp;', ' '), /the quick fox jumps/), 'the editor was not saved')
        })
    }
})

describe('live uploads', () => {
    test('a file one person uploads appears for the other at once, and either save keeps it', async () => {
        const id = await together()
        const items = (page) => page.locator('.fi-page [x-data^="fileUploadFormComponent"] .filepond--item')
        const known = app.problems.length
        // A 1x1 PNG.
        const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')

        await alice.locator('.fi-page [x-data^="fileUploadFormComponent"] input[type=file]').setInputFiles({ name: 'pixel.png', mimeType: 'image/png', buffer })

        await eventually(async () => assert.equal(await items(bob).count(), 1), 'Bob does not see the upload', 20000)

        await save(bob)
        await eventually(() => assert.match(app.article(id).gallery ?? '', /gallery\\?\/[^"]+\.png/), "Bob's save did not keep Alice's upload")

        // The demo has no storage link, so the image itself is not served.
        app.problems.splice(known, app.problems.length - known, ...app.problems.slice(known).filter((problem) => !/\/storage\//.test(problem)))
    })
})

describe('translated pages', () => {
    const switchTo = (page, locale) =>
        page.evaluate((locale) => {
            const id = document.querySelector('.fi-page').closest('[wire\\:id]').getAttribute('wire:id')

            return window.Livewire.find(id).$set('activeLocale', locale)
        }, locale)
    const waitLive = (page) =>
        page.waitForFunction(() => window.filamentCollaboration?.inspect().some((room) => room.fields.length && room.fields.every(([, , state]) => state.startsWith('live'))), undefined, { timeout: 20000 })

    test('two languages are edited at once, each in its own draft, by people who see each other', async () => {
        for (const page of [alice, bob]) {
            await page.goto(`${app.base}/admin/pages/1/edit`)
            await waitLive(page)
        }

        await switchTo(bob, 'zh_HK')
        await eventually(async () => assert.match(await field(bob, 'title').inputValue(), /[\u4e00-\u9fff]/), 'Bob is not on Chinese')
        await waitLive(bob)

        await eventually(async () => assert.ok(await alice.locator('.fi-collab-stack .fi-collab-avatar').count()), 'Alice does not see Bob')

        await caret(bob, field(bob, 'title'), -1)
        await bob.keyboard.type('（草稿）')
        await caret(alice, field(alice, 'title'), -1)
        await alice.keyboard.type(' (draft)')

        await bob.waitForTimeout(1500)
        assert.doesNotMatch(await field(alice, 'title').inputValue(), /草稿/, 'Chinese typing reached the English draft')
        assert.doesNotMatch(await field(bob, 'title').inputValue(), /draft/, 'English typing reached the Chinese draft')

        // Alice switches to Chinese, and finds Bob's unsaved typing.
        await switchTo(alice, 'zh_HK')
        await eventually(async () => assert.match(await field(alice, 'title').inputValue(), /（草稿）$/), 'Alice did not get the Chinese draft', 15000)
    })
})

describe('fields that are not live', () => {
    test('while somebody is in one, the others are told and cannot change it', async () => {
        await together()

        const notes = (page) => page.locator('.fi-page textarea[id="form.editor_notes"]')
        const note = (page) => page.locator('.fi-collab-field-note')

        await notes(bob).click()
        await eventually(async () => {
            assert.match(await note(alice).innerText(), /Bob .* is editing this field/)
            assert.equal(await alice.locator('.fi-collab-locked').count(), 1)
        }, 'Alice was not told', 12000)

        await notes(alice).click({ force: true, timeout: 2000 }).catch(() => {})
        assert.notEqual(await alice.evaluate(() => document.activeElement?.id), 'form.editor_notes', 'Alice could still type in it')

        await field(bob, 'title').click()
        await eventually(async () => {
            assert.equal(await note(alice).count(), 0)
            assert.equal(await alice.locator('.fi-collab-locked').count(), 0)
        }, 'the field stayed locked', 12000)

        await notes(alice).click()
        await alice.keyboard.type('Mine now')
        assert.equal(await notes(alice).inputValue(), 'Mine now')
    })
})

describe('a deleted record', () => {
    test('the others are told who deleted it, can copy their text, and can restore it', async () => {
        const id = await together()
        const known = app.problems.length

        await caret(alice, field(alice, 'title'), -1)
        await alice.keyboard.type(' (mine)')
        await eventually(async () => assert.match(await field(bob, 'title').inputValue(), / \(mine\)$/), 'typing did not arrive')

        await bob.evaluate(() => {
            const page = document.querySelector('.fi-page').closest('[wire\\:id]')

            window.Livewire.find(page.getAttribute('wire:id')).mountAction('delete')
        })
        await bob.locator('.fi-modal.fi-modal-open').getByRole('button', { name: 'Delete' }).click()

        const notice = alice.locator('.fi-collab-notice-danger')

        await eventually(async () => assert.match(await notice.innerText(), /Bob .* deleted this record/), 'Alice was not told', 12000)
        assert.equal(await alice.locator('.fi-page form').first().getAttribute('inert'), '', 'the form can still be edited')

        if (process.env.BROWSER !== 'webkit') {
            await alice.context().grantPermissions(['clipboard-read', 'clipboard-write'])
            await notice.getByRole('button', { name: 'Copy my text' }).click()
            await eventually(async () => assert.match(await alice.evaluate(() => navigator.clipboard.readText()), /Title\n.* \(mine\)/), 'the text was not copied')
        }

        await notice.getByRole('button', { name: 'Restore' }).click()
        await eventually(async () => {
            assert.equal(app.article(id).deleted_at, null)
            assert.match(await field(alice, 'title').inputValue(), / \(mine\)$/)
        }, 'the record was not restored with its draft', 15000)

        // Syncing a deleted record answers 404, which is how the browsers learn of it.
        app.problems.splice(known, app.problems.length - known, ...app.problems.slice(known).filter((problem) => !/HTTP 404 .*_collaboration\/sync/.test(problem)))
    })
})

describe('seeing each other', () => {
    test('avatar, field outline, caret and name follow the other editor', async () => {
        await together()
        await caret(alice, field(alice, 'title'), 5)

        await eventually(async () => {
            assert.equal(await bob.locator('button.fi-collab-stack .fi-collab-avatar').innerText(), 'AC')
            assert.equal(await bob.locator('.fi-collab-tag').innerText(), 'Alice Chen')
            assert.equal(await bob.locator('.fi-collab-flag').innerText(), 'Alice')

            const input = await field(bob, 'title').boundingBox()
            const remote = await bob.locator('.fi-collab-caret').boundingBox()

            assert.ok(remote.x > input.x + 20 && remote.x < input.x + 90, `caret at ${remote.x - input.x}`)
            assert.ok(remote.y >= input.y - 1 && remote.y + remote.height <= input.y + input.height + 1)
        }, 'presence was not drawn')
    })

    test('carets in several inputs are each measured in their own input', async () => {
        await together()

        const carol = await app.signIn('editor002')

        await app.edit(carol, nextArticle - 1)
        await caret(alice, field(alice, 'title'), 4)
        await caret(carol, field(carol, 'excerpt'), 2)

        await eventually(async () => {
            const carets = await bob.locator('.fi-collab-caret').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().top))
            const boxes = [await field(bob, 'title').boundingBox(), await field(bob, 'excerpt').boundingBox()]

            for (const box of boxes) {
                assert.ok(carets.some((top) => top >= box.y - 1 && top < box.y + box.height), JSON.stringify({ carets, box }))
            }
        }, 'a caret was measured in the wrong input')

        await carol.context().close()
    })

    test('a remote caret in the rich editor matches the real one', async () => {
        await together()
        await endOfParagraph(alice, 1)

        await eventually(async () => {
            const expected = await body(bob).locator('p').nth(1).evaluate((paragraph) => {
                const editor = window.Alpine.$data(paragraph.closest('[x-data*="richEditorFormComponent"]')).getEditor()
                const box = editor.view.coordsAtPos(editor.view.posAtDOM(paragraph, paragraph.childNodes.length))

                return { x: box.left, y: box.top }
            })
            const actual = await bob.locator('.fi-collab-caret').boundingBox()

            assert.ok(Math.abs(actual.x - expected.x) < 2 && Math.abs(actual.y - expected.y) < 2, JSON.stringify({ actual, expected }))
        }, 'the caret was misplaced')
    })

    test('the list shows who is on each record', async () => {
        await app.edit(alice, 3)
        await bob.goto(`${app.base}/admin/documents`)

        await eventually(async () => {
            const row = bob.locator('tr', { hasText: 'Spring product update' })

            assert.match(await row.locator('.fi-collab-stack').getAttribute('aria-label'), /Alice Chen/)
            assert.ok((await bob.locator('.fi-header .fi-collab-avatar').allInnerTexts()).includes('AC'))
        }, 'the list did not show Alice')
    })

    test('the create page shows colleagues', async () => {
        await app.edit(alice, 3)
        await bob.goto(`${app.base}/admin/documents/create`)

        await eventually(async () => assert.ok((await bob.locator('.fi-header .fi-collab-avatar').allInnerTexts()).includes('AC')), 'create had no presence')
    })

    test('a view page refreshes after somebody saves', async () => {
        const id = nextArticle++

        await app.edit(alice, id)
        await bob.goto(`${app.base}/admin/documents/${id}`)
        await bob.waitForTimeout(2500)
        await field(alice, 'title').fill('Visible to viewers')
        await save(alice)

        await eventually(async () => assert.match(await bob.locator('.fi-page').innerText(), /Visible to viewers/), 'the view was stale')
    })

    test('the quick-edit modal has presence and lands in open editors', async () => {
        await app.edit(alice, 3)
        await caret(alice, field(alice, 'excerpt'), -1)
        await bob.goto(`${app.base}/admin/documents`)

        const row = bob.locator('tr', { hasText: 'Spring product update' })

        await row.locator('.fi-dropdown-trigger button').click()
        await row.getByText('Quick edit').click()

        const modal = bob.locator('.fi-modal.fi-modal-open')

        await eventually(async () => assert.ok((await modal.locator('.fi-collab-avatar').allInnerTexts()).includes('AC')), 'the modal had no presence')

        await modal.locator('input[id$=".title"]').fill('Edited in a modal')
        await modal.getByRole('button', { name: /save/i }).click()

        await eventually(async () => assert.equal(await field(alice, 'title').inputValue(), 'Edited in a modal'), 'the open editor was not updated')
    })

    test('the inspector opens from the header', async () => {
        await app.edit(alice, 3)
        await alice.getByRole('button', { name: 'Collaboration inspector' }).click()

        await eventually(async () => assert.match(await alice.locator('.fi-collab-debug').innerText(), /Round trip[\s\S]*body_html/), 'the inspector was empty')
    })

    test('a phone has no horizontal overflow', async () => {
        const phone = await app.signIn('carol', { viewport: { width: 390, height: 844 } })

        await app.edit(phone, 3)

        const overflow = await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth)

        assert.ok(overflow <= 0, `${overflow}px`)

        await phone.context().close()
    })
})

describe('websockets', { skip: process.env.TRANSPORT !== 'reverb' && 'set TRANSPORT=reverb' }, () => {
    test('changes are pushed, not polled', async () => {
        await together()

        const inspect = (page) => page.evaluate(() => window.filamentCollaboration.inspect()[0].summary)

        await eventually(async () => assert.match((await inspect(bob))['Transport'], /WebSocket push/), 'Reverb did not connect')
        assert.equal((await inspect(bob))['Sync every'], '8000 ms')

        await caret(alice, field(alice, 'title'), -1)

        const started = Date.now()

        await alice.keyboard.type('!')
        await eventually(async () => assert.match(await field(bob, 'title').inputValue(), /!$/), 'the push did not arrive', 3000)

        // Without the push this waits for an 8 second poll.
        assert.ok(Date.now() - started < 600, `${Date.now() - started} ms`)
    })

    test('a caret moves without a request', async () => {
        await together()
        await caret(alice, field(alice, 'title'), 2)
        await eventually(async () => assert.ok(await bob.locator('.fi-collab-caret').count()), 'no caret')

        const requests = []
        const count = (request) => request.url().includes('_collaboration/sync') && requests.push(request)

        bob.on('request', count)

        const before = (await bob.locator('.fi-collab-caret').boundingBox()).x

        await caret(alice, field(alice, 'title'), 12)
        await eventually(async () => assert.ok((await bob.locator('.fi-collab-caret').boundingBox()).x > before + 30), 'the caret did not move')

        bob.off('request', count)
        assert.equal(requests.length, 0, 'Bob fetched instead of applying the push')
    })

    test('editing carries on by polling when Reverb goes down', async () => {
        await together()

        const known = app.problems.length

        app.stopReverb()
        await eventually(async () => assert.doesNotMatch((await bob.evaluate(() => window.filamentCollaboration.inspect()[0].summary))['Transport'], /WebSocket push/), 'Bob still thinks he is connected', 15000)

        await caret(alice, field(alice, 'title'), -1)
        await alice.keyboard.type(' without Reverb')

        await eventually(async () => assert.match(await field(bob, 'title').inputValue(), / without Reverb$/), 'polling did not take over', 10000)

        // Reverb being down is reported once per change by the server; the browsers are fine.
        app.problems.length = known
    })
})

test('there were no browser errors or failed requests', () => {
    // WebKit reports a fetch cancelled by leaving the page as an error.
    const problems = app.problems.filter((problem) => !/Fetch API cannot load http:\/\/127\.0\.0\.1:\d+\/\S+ due to access control checks/.test(problem))

    assert.deepEqual(problems, [])
})
