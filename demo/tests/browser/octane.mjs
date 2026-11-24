import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { start } from './harness.mjs'

// Laravel Octane keeps the application in memory between requests. With one worker,
// every request of every editor goes through the same application, so anything one
// request leaves behind would reach the next: run with OCTANE=swoole OCTANE_WORKERS=1.
let app

const field = (page, name) => page.locator(`[id="form.${name}"]`)
const room = (page) => page.evaluate(() => window.filamentCollaboration.inspect().find((item) => item.fields.length))

async function eventually(check, message, timeout = 15000) {
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

async function typeAtEnd(page, name, text) {
    const input = field(page, name)

    await input.click()
    await input.evaluate((element) => element.setSelectionRange(element.value.length, element.value.length))
    await page.keyboard.type(text)
}

before(async () => {
    assert.ok(process.env.OCTANE, 'set OCTANE=swoole (or frankenphp, roadrunner)')
    app = await start()
})

after(async () => app?.stop())

test('two editors on one worker see each other by name and keep both their typing', async () => {
    // One after the other: a single cold worker compiles Filament's views on the first page.
    const alice = await app.signIn('alice')
    const bob = await app.signIn('bob')

    await Promise.all([app.edit(alice, 3), app.edit(bob, 3)])
    await eventually(async () => {
        assert.deepEqual((await room(alice)).people.map(([name]) => name), ['Bob Martinez'])
        assert.deepEqual((await room(bob)).people.map(([name]) => name), ['Alice Chen'])
    }, 'they did not see each other')

    await typeAtEnd(alice, 'title', ' by Alice')
    await typeAtEnd(bob, 'excerpt', ' by Bob')

    await eventually(async () => {
        for (const page of [alice, bob]) {
            assert.match(await field(page, 'title').inputValue(), / by Alice$/)
            assert.match(await field(page, 'excerpt').inputValue(), / by Bob$/)
        }
    }, 'the typing did not reach the other editor')

    await bob.getByRole('button', { name: 'Save changes' }).first().click()
    await eventually(() => {
        assert.match(app.article(3).title, / by Alice$/)
        assert.match(app.article(3).excerpt, / by Bob$/)
    }, 'the save did not keep both')
})

test('somebody on another record sees only that record\'s people', async () => {
    const carol = await app.signIn('carol')

    await app.edit(carol, 4)
    await carol.waitForTimeout(1500)

    assert.deepEqual((await room(carol)).people, [])
})

test('the server logged no errors, and no sync request failed', () => {
    assert.doesNotMatch(app.log(), /\.(ERROR|CRITICAL|ALERT|EMERGENCY):/)
    assert.deepEqual(app.problems.filter((problem) => /_collaboration|filament-collaboration|HTTP 5\d\d/.test(problem)), [])
})
