import { start } from './harness.mjs'

// Four browsers pressing random keys in one article: npm run test:chaos -- <rounds> <seed>
// Every round must converge, with no error in any browser. On an editor error,
// the state just before the failing key is printed.
const ROUNDS = Number(process.argv[2] ?? 10)
let seed = Number(process.argv[3] ?? 42)

const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const pick = (items) => items[Math.floor(random() * items.length)]
const editor = '.fi-page [x-data*="richEditorFormComponent"]'
const app = await start()
const pages = []
let failures = 0
let recovered = 0

for (const name of ['alice', 'bob', 'carol', 'editor001']) {
    const page = await app.signIn(name)

    await page.addInitScript((selector) => {
        document.addEventListener(
            'keydown',
            (event) => {
                const root = document.querySelector(selector)
                const instance = root?.contains(event.target) ? window.Alpine.$data(root).getEditor() : null

                if (instance) window.__beforeKey = { key: event.key, selection: instance.state.selection.toJSON(), doc: instance.state.doc.toJSON() }
            },
            true,
        )
    }, editor)
    // The editor recovers by itself, and says so; the state it failed on comes with it.
    page.on('console', async (message) => {
        if (!/recovered from an error/.test(message.text())) return

        console.log(`RECOVERED in ${name}: ${message.text()}`)
        console.log(JSON.stringify(await page.evaluate(() => window.__beforeKey).catch(() => null)))
    })
    page.on('pageerror', async (error) => {
        failures++
        console.log(`ERROR in ${name}: ${error.message}`)
        console.log(JSON.stringify(await page.evaluate(() => window.__beforeKey).catch(() => null)))
    })
    pages.push(page)
}

async function act(page) {
    const roll = random()

    if (roll < 0.12) {
        const input = page.locator('[id="form.title"]')

        await input.click({ timeout: 4000 })
        await input.evaluate((element, fraction) => {
            const at = Math.floor(element.value.length * fraction)

            element.setSelectionRange(at, at)
        }, random())

        return
    }

    if (roll < 0.25) {
        await page.locator('.fi-page .tiptap').click({ timeout: 4000 })
        await page.waitForTimeout(150)
        await page.evaluate(
            ({ selector, fraction }) => {
                const instance = window.Alpine.$data(document.querySelector(selector)).getEditor()
                const positions = []

                instance.state.doc.descendants((node, position) => {
                    if (!node.isTextblock) return true

                    for (let offset = 0; offset <= node.content.size; offset++) positions.push(position + 1 + offset)

                    return false
                })
                instance.chain().focus().setTextSelection(positions[Math.floor((positions.length - 1) * fraction)] ?? 1).run()
            },
            { selector: editor, fraction: random() },
        )
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))

        return
    }

    const key = pick(['type', 'type', 'type', 'Backspace', 'Enter', 'Delete', 'Control+b', 'Shift+ArrowLeft', 'Control+Shift+8', 'Control+z', 'ArrowUp', 'Tab', 'wait'])

    if (key === 'type') await page.keyboard.type(pick(['alpha', 'beta ', '協作', '🙂', ' x', 'Q', 'é ', '.', 'zz']), { delay: 12 })
    else if (key === 'wait') await page.waitForTimeout(120)
    else await page.keyboard.press(key)
}

const snapshot = (page) =>
    page.evaluate((selector) => {
        const strip = (node) => {
            for (const [name, value] of Object.entries(node.attrs ?? {})) if (value === null) delete node.attrs[name]

            node.content?.forEach(strip)

            return node
        }
        const [room] = window.filamentCollaboration.inspect()

        return {
            title: document.getElementById('form.title').value,
            body: JSON.stringify(strip(window.Alpine.$data(document.querySelector(selector)).getEditor().getJSON())),
            waiting: room.summary['Waiting to send'],
            notLive: room.fields.filter(([, , state]) => !state.startsWith('live')).length,
            recovered: room.summary['Recovered errors'],
        }
    }, editor)

try {
    for (let round = 0; round < ROUNDS; round++) {
        await Promise.all(pages.map((page) => app.edit(page, app.firstArticle + (round % 30))))
        await Promise.all(pages.map(async (page) => {
            for (let step = 0; step < 40; step++) await act(page).catch(() => {})
        }))

        let states = []

        for (let attempt = 0; attempt < 40; attempt++) {
            await pages[0].waitForTimeout(300)
            states = await Promise.all(pages.map(snapshot))

            if (states.every((state) => state.title === states[0].title && state.body === states[0].body && !state.waiting)) break
        }

        const converged = states.every((state) => state.title === states[0].title && state.body === states[0].body && !state.notLive)

        if (!converged) failures++

        recovered += states.reduce((total, state) => total + state.recovered, 0)

        console.log(`round ${round + 1}: ${converged ? 'converged' : 'DIVERGED'}`)
    }
} finally {
    await app.stop()
}

const problems = app.problems.filter((problem) => !/Fetch API cannot load .* due to access control checks/.test(problem))

console.log(JSON.stringify({ rounds: ROUNDS, failures, recovered, problems: problems.slice(0, 10) }))
process.exitCode = failures || recovered || problems.length ? 1 : 0
