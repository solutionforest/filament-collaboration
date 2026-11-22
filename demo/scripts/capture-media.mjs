import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { crowd } from '../tests/browser/crowd.mjs'
import { demo, start } from '../tests/browser/harness.mjs'

// Every README image, from real sessions: npm run media
// A shot is only saved once what it is supposed to show is on screen.
const media = path.resolve(demo, '../docs/media')
const hashes = new Map()
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

mkdirSync(media, { recursive: true })

const app = await start({ optimized: true })
let pulse
let members = []

async function shoot(target, name, expectations = {}, options = {}) {
    for (const [selector, minimum] of Object.entries(expectations)) {
        await assertVisible(target.page?.() ?? target, selector, minimum, name)
    }

    const file = path.join(media, `${name}.png`)

    await target.screenshot({ path: file, animations: 'disabled', caret: 'hide', ...options })

    const hash = createHash('sha256').update(readFileSync(file)).digest('hex')

    assert.ok(!hashes.has(hash), `${name} is the same image as ${hashes.get(hash)}`)
    hashes.set(hash, name)
    console.log('saved', name)
}

async function assertVisible(page, selector, minimum, name) {
    for (let attempt = 0; attempt < 80; attempt++) {
        if ((await page.locator(`${selector}:visible`).count()) >= minimum) return

        await wait(250)
    }

    throw new Error(`${name}: expected ${minimum} of "${selector}" on screen`)
}

async function selectInBody(page, find, { whole = false } = {}) {
    await page.locator('.fi-page .tiptap').click()
    await wait(150)
    await page.evaluate(
        ({ find, whole }) => {
            const editor = window.Alpine.$data(document.querySelector('.fi-page [x-data*="richEditorFormComponent"]')).getEditor()

            let range = null

            editor.state.doc.descendants((node, position) => {
                const at = node.isText && !range ? node.text.indexOf(find) : -1

                if (at >= 0) range = { from: position + (whole ? at : at + find.length), to: position + at + find.length }
            })

            editor.chain().focus().setTextSelection(range).run()
        },
        { find, whole },
    )
    await wait(150)
}

async function focusEnd(page, field) {
    const input = page.locator(`[id="form.${field}"]`)

    await input.click()
    await input.evaluate((element) => element.setSelectionRange(element.value.length, element.value.length))
}

try {
    const viewport = { width: 1440, height: 960 }
    const alice = await app.signIn('alice', { viewport })
    const bob = await app.signIn('bob', { viewport })
    const carol = await app.signIn('carol', { viewport })

    await Promise.all([alice, bob, carol].map((page) => app.edit(page, 3)))

    const desk = (await crowd(app, { size: 100 })).filter(({ name }) => !['Alice Chen', 'Bob Martinez', 'Carol Okafor'].includes(name))
    const named = (name) => desk.find((member) => member.name === name)
    const [ava, noah, mia] = ['Ava Wong', 'Noah Patel', 'Mia Kim'].map(named)

    members = [ava, noah, mia]
    await Promise.all(members.map((member) => member.sync()))
    ava.focus('title', 25)
    noah.focus('status')
    mia.focus('slug', 6)
    await Promise.all(members.map((member) => member.sync()))
    pulse = setInterval(() => members.forEach((member) => member.sync().catch(() => {})), 4000)

    await selectInBody(bob, 'calmer and quicker to load.')
    await bob.keyboard.type(' Bob is writing this line.', { delay: 30 })
    await selectInBody(carol, 'Reading lists', { whole: true })
    await alice.locator('[id="form.seo_title"]').scrollIntoViewIfNeeded()
    await alice.evaluate(() => window.scrollTo(0, 0))
    await wait(3500)

    assert.match(await alice.locator('.fi-page .tiptap').innerText(), /Bob is writing this line\./, 'Alice cannot see Bob typing')

    await shoot(alice, 'live-editing', {
        'button.fi-collab-stack .fi-collab-avatar': 5,
        '.fi-collab-outline': 4,
        '.fi-collab-caret': 4,
        '.fi-collab-selection': 1,
        '.fi-collab-flag': 2,
        '.fi-collab-status[data-status="unsaved"]': 1,
    })

    await shoot(alice.locator('.fi-page .fi-fo-rich-editor'), 'rich-editor', { '.fi-collab-flag': 2, '.fi-collab-selection': 1 })

    await alice.locator('button.fi-collab-stack').click()
    await shoot(alice, 'people-panel', { '.fi-collab-panel': 1, '.fi-collab-person-row': 5, '.fi-collab-discard': 1 })
    await alice.keyboard.press('Escape')

    await alice.getByRole('button', { name: 'Collaboration inspector' }).click()
    await wait(1000)
    await alice.mouse.move(2, 400)
    await shoot(alice, 'inspector', { '.fi-collab-debug td': 12 })
    await alice.locator('.fi-modal.fi-modal-open').getByRole('button', { name: 'Close' }).last().click()
    await wait(700)

    const dark = await app.signIn('editor004', { viewport, colorScheme: 'dark' })

    await app.edit(dark, 3)
    await wait(3000)
    await shoot(dark, 'dark-mode', { 'button.fi-collab-stack .fi-collab-avatar': 4, '.fi-collab-outline': 3, '.fi-collab-caret': 2 })
    await dark.context().close()

    // The list, with people on several articles.
    const others = await Promise.all([4, 5, 7, 8].map((article) => crowd(app, { size: 24, article })))
    const busy = ['Alice Chen', 'Bob Martinez', 'Carol Okafor', 'Ava Wong', 'Noah Patel', 'Mia Kim', 'Leo Rossi', 'Zoe Silva']
    const sizes = [1, 3, 6, 2]

    // A different group on each article.
    const spread = others.flatMap((room, index) => {
        const skip = sizes.slice(0, index).reduce((sum, size) => sum + size, 0)

        return room.filter((member) => !busy.includes(member.name)).slice(skip, skip + sizes[index])
    })

    members.push(...spread)
    await Promise.all(spread.map((member) => member.sync()))

    const list = await app.signIn('editor005', { viewport })

    await list.goto(`${app.base}/admin/documents`)
    await wait(3500)
    await shoot(list, 'resource-table', { '.fi-collab-column .fi-collab-avatar': 8, '.fi-header .fi-collab-avatar': 4 })

    const overflow = await list.evaluate(() => {
        const table = document.querySelector('.fi-ta-content-ctn') ?? document.querySelector('.fi-ta-content')

        return table.scrollWidth - table.clientWidth
    })

    assert.ok(overflow <= 1, `the table is clipped by ${overflow}px`)

    const row = list.locator('tr', { hasText: 'Spring product update' })

    await row.locator('.fi-dropdown-trigger button').click()
    await row.getByText('Quick edit').click()
    await wait(3000)
    await shoot(list, 'quick-edit', { '.fi-modal .fi-collab-avatar': 4, '.fi-collab-overlay-modal .fi-collab-outline': 2 })
    await list.context().close()

    const phone = await app.browser.newContext({
        viewport: { width: 390, height: 844 },
        storageState: await alice.context().storageState(),
        timezoneId: 'UTC',
        reducedMotion: 'reduce',
    })
    const mobile = await phone.newPage()

    await app.edit(mobile, 3)
    await wait(2500)
    await shoot(mobile, 'mobile', { 'button.fi-collab-stack .fi-collab-avatar': 4, '.fi-collab-status': 1 })
    await phone.close()

    // A hundred people on one article, each a real session syncing.
    clearInterval(pulse)

    const everybody = desk.filter((member) => !members.includes(member))

    members.push(...everybody)

    const step = async (offset) => {
        for (let start = 0; start < everybody.length; start += 10) {
            await Promise.all(everybody.slice(start, start + 10).map((member) => member.sync()))
        }

        everybody.forEach((member, index) => member.focus(['title', 'excerpt', 'body_html', 'slug', 'body_html'][index % 5], (index * 17 + offset) % 230))
    }

    await step(0)
    await step(0)
    await Promise.all([ava, noah, mia].map((member) => member.sync()))
    await alice.evaluate(() => window.scrollTo(0, 0))
    await wait(3000)
    await Promise.all(members.map((member) => member.sync()))
    await alice.mouse.move(2, 400)
    await alice.evaluate(() => document.activeElement?.blur())
    await alice.waitForFunction(() => window.filamentCollaboration.inspect()[0].summary['People here'] >= 95, undefined, { timeout: 30000 })

    const count = await alice.evaluate(() => window.filamentCollaboration.inspect()[0].summary['People here'])

    await shoot(alice, 'hundred-editors', { '.fi-collab-avatar-more': 1, '.fi-collab-outline': 4, '.fi-collab-caret': 10 })
    console.log('people on screen in hundred-editors:', count + 1, 'including Alice')

    await alice.goto(`${app.base}/blog/spring-product-update`)
    await shoot(alice, 'public-article', { '.body h2': 1 })

    assert.deepEqual(app.problems, [], 'the browser reported problems')
} finally {
    clearInterval(pulse)
    await app.stop()
}
