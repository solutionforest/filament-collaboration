import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync } from 'node:fs'
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

// Uploaded images are served from this run's storage, as `storage:link` would for an app:
// with routes cached, as here, Laravel does not serve the public disk itself.
const storageLink = path.join(demo, 'public/storage')
const linked = !existsSync(storageLink)

if (linked) symlinkSync(path.join(app.env.LARAVEL_STORAGE_PATH, 'app/public'), storageLink)
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

    // What came later: comments and history, fields out of sight, following,
    // translations, live uploads, third-party editors and relation managers.
    await captureFeatures({ alice, bob })

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

    // The public blog, as readers see what the editors publish.
    await alice.goto(`${app.base}/`)
    await shoot(alice, 'public-home', { '.featured': 1, '.card': 3 })
    await alice.goto(`${app.base}/blog/spring-product-update`)
    await shoot(alice, 'public-article', { '.prose h2': 1 })

    assert.deepEqual(app.problems, [], 'the browser reported problems')
} finally {
    clearInterval(pulse)
    if (linked) rmSync(storageLink, { force: true })
    await app.stop()
}

/** Goes to a translated page and waits until its fields are live. */
async function editPage(page, id) {
    await page.goto(`${app.base}/admin/pages/${id}/edit`)
    await page.waitForFunction(() => window.filamentCollaboration?.inspect().some((room) => room.fields.length && room.fields.every(([, , state]) => state.startsWith('live'))), undefined, {
        timeout: 25000,
    })
}

async function closeModal(page) {
    await page.locator('.fi-modal.fi-modal-open').getByRole('button', { name: 'Close' }).last().click()
    await wait(700)
}

/** Calls a method of the page's Livewire component. */
function wire(page, method, ...args) {
    return page.evaluate(
        ({ method, args }) => window.Livewire.find(document.querySelector('.fi-page').closest('[wire\\:id]').getAttribute('wire:id'))[method](...args),
        { method, args },
    )
}

async function captureFeatures({ alice, bob }) {
    // Comments, on the record and on a field, with a mention being picked.
    await wire(bob, 'postCollaborationComment', 'Can we lead with the release date? @Alice Chen', 'title')
    await wire(bob, 'postCollaborationComment', 'The second paragraph repeats the intro; I will trim it after lunch.')
    await wire(alice, 'postCollaborationComment', 'Checked every link in the body. All good.', 'body_html')
    await alice.reload()
    await app.edit(alice, 3)
    await alice.getByRole('button', { name: /Comments & history/ }).click()

    const panel = alice.locator('[data-collaboration-comments]')

    await panel.locator('[data-collaboration-comment-field]').selectOption('excerpt')
    await panel.locator('textarea').pressSequentially('Shorter, maybe? @Bo', { delay: 20 })
    await wait(500)
    await shoot(alice, 'comments', { '[data-collaboration-comment]': 3, '.fi-collab-mention': 1, '.fi-collab-mentions button': 1 })

    // The history: a save, and the edits before it.
    await panel.locator('textarea').fill('')
    await bob.locator('[id="form.title"]').click()
    await bob.keyboard.press('End')
    await bob.keyboard.type(' (updated)', { delay: 30 })
    await wait(1500)
    await bob.getByRole('button', { name: 'Save changes' }).first().click()
    await wait(2500)
    await closeModal(alice)
    await alice.getByRole('button', { name: /Comments & history/ }).click()
    await alice.getByRole('tab', { name: 'History' }).click()
    await shoot(alice, 'history', { '.fi-collab-version': 2, '[data-collaboration-history] .fi-collab-link': 1 })
    await closeModal(alice)

    // A translated page in tabs: Bob is in the slug, behind the closed Publishing tab and section.
    await Promise.all([editPage(alice, 2), editPage(bob, 2)])
    await bob.getByRole('tab', { name: 'Publishing' }).click()
    await bob.locator('.fi-section-header', { hasText: 'Address' }).click()
    await bob.locator('[id="form.slug"]').click()
    await wait(2500)
    await shoot(alice, 'hidden-field', { '.fi-collab-chip': 1 })

    // Following Bob opens the tab and the section for Alice.
    await alice.locator('[data-collaboration-people]').click()
    await alice.getByRole('button', { name: 'Follow', exact: true }).first().click()
    await wait(2000)
    await shoot(alice, 'follow', { '.fi-collab-notice': 1, '.fi-collab-outline': 1 })
    await alice.getByRole('button', { name: 'Stop following' }).first().click()

    // Two languages at once: Bob in Chinese, Alice in English, each in their own draft.
    await Promise.all([editPage(alice, 1), editPage(bob, 1)])
    await alice.locator('[id="form.title"]').click()
    await wire(bob, '$set', 'activeLocale', 'zh_HK')
    await bob.waitForFunction(() => /[一-鿿]/.test(document.querySelector('[id="form.title"]')?.value ?? ''), undefined, { timeout: 15000 })
    await wait(1500)
    await bob.locator('[id="form.title"]').click()
    await bob.keyboard.press('End')
    await bob.keyboard.type('（草稿）', { delay: 40 })
    await wait(2500)
    await shoot(bob, 'translations', { 'button.fi-collab-stack .fi-collab-avatar': 1 })

    // Back on the article, the lower sections: live uploads, editors from other packages, a relation manager.
    await Promise.all([app.edit(alice, 4), app.edit(bob, 4)])

    const gallery = (page) => page.locator('.fi-section', { hasText: 'Gallery' }).first()

    await gallery(alice).scrollIntoViewIfNeeded()
    await gallery(alice).locator('input[type=file]').setInputFiles(path.join(media, 'public-article.png'))
    await gallery(bob).scrollIntoViewIfNeeded()
    await assertVisible(bob, '.fi-section:has-text("Gallery") .filepond--item', 1, 'live-uploads')
    await wait(2500)
    await shoot(gallery(bob), 'live-uploads', { '.filepond--item': 1 })

    const editors = (page) => page.locator('.fi-section', { hasText: 'Third-party editors' }).first()
    const place = (page, name, position) => page.evaluate(({ name, position }) => window.Alpine.$data(document.querySelector(`.fi-page .demo-${name}`)).place(position), { name, position })

    // Below the sticky top bar, heading included.
    for (const page of [alice, bob]) {
        await editors(page).evaluate((section) => window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY - 96))
    }
    await place(alice, 'tinymce', 1)
    await alice.keyboard.type('Alice types in TinyMCE, ', { delay: 20 })
    await place(bob, 'quill', 1)
    await bob.keyboard.type('Bob types in Quill.', { delay: 20 })
    await wait(3000)
    await shoot(alice, 'third-party-editors', { '.fi-collab-caret': 1, '.fi-collab-outline': 1 }, { clip: await editors(alice).boundingBox() })

    // Custom components, live through the adapters docs/custom-components.md builds.
    const custom = (page) => page.locator('.fi-section', { hasText: 'Custom components' }).first()

    for (const page of [alice, bob]) {
        await custom(page).evaluate((section) => window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY - 96))
    }

    await alice.locator('.fi-page .demo-composer-input').click()
    await alice.keyboard.type('Our spring update is out: a calmer, faster reader. ', { delay: 15 })
    await bob.waitForFunction(() => document.querySelector('.fi-page .demo-composer-input')?.value.endsWith('reader. '), undefined, { timeout: 15000 })
    await bob.locator('.fi-page .demo-composer-input').evaluate((input) => {
        input.focus()
        input.setSelectionRange(input.value.length, input.value.length)
    })
    await bob.keyboard.type('Read it today!', { delay: 20 })
    await bob.locator('.fi-page .demo-rating').getByRole('radio', { name: '4 / 5' }).click()
    await bob.locator('.fi-page .demo-composer-input').focus()
    await wait(3000)
    await shoot(alice, 'custom-components', { '.fi-collab-caret': 1, '.demo-rating-on': 4 }, { clip: await custom(alice).boundingBox() })

    const checklist = (page) => page.locator('.fi-resource-relation-manager, [wire\\:id]').filter({ has: page.getByRole('heading', { name: 'Checklist' }) }).last()

    for (const task of ['Check every link', 'Add a cover image', 'Ask legal about the quote']) {
        await alice.getByRole('button', { name: 'New task' }).click()
        await alice.locator('.fi-modal.fi-modal-open input[id$=".title"]').fill(task)
        await alice.locator('.fi-modal.fi-modal-open').getByRole('button', { name: 'Create', exact: true }).click()
        await wait(800)
    }

    await checklist(bob).scrollIntoViewIfNeeded()
    await assertVisible(bob, 'td:has-text("Ask legal about the quote")', 1, 'relation-manager')
    await shoot(checklist(bob), 'relation-manager', { 'td:has-text("Check every link")': 1 })

    // Back where the crowd is, for the shots after this.
    await Promise.all([app.edit(alice, 3), app.edit(bob, 3)])
}
