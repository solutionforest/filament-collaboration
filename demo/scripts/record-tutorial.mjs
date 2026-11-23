import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { demo, start } from '../tests/browser/harness.mjs'

// The README's video: two real browsers side by side. Needs ffmpeg: npm run tutorial
const WIDTH = 960
const HEIGHT = 720
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
const directory = mkdtempSync(path.join(tmpdir(), 'collaboration-tutorial-'))
const app = await start({ optimized: true, viewport: { width: WIDTH, height: HEIGHT } })
const captions = []

try {
    const states = []

    for (const name of ['alice', 'bob']) {
        const page = await app.signIn(name)

        states.push(await page.context().storageState())
        await page.context().close()
    }

    const contexts = await Promise.all(
        states.map((storageState) =>
            app.browser.newContext({
                storageState,
                viewport: { width: WIDTH, height: HEIGHT },
                timezoneId: 'UTC',
                recordVideo: { dir: directory, size: { width: WIDTH, height: HEIGHT } },
            }),
        ),
    )
    const [alice, bob] = await Promise.all(contexts.map((context) => context.newPage()))
    const began = Date.now()
    const videos = [alice.video(), bob.video()]
    const say = (text) => captions.push({ at: (Date.now() - began) / 1000, text })

    const title = (page) => page.locator('[id="form.title"]')
    const cursor = (page, position) =>
        title(page).evaluate((input, position) => {
            const at = position < 0 ? input.value.length : position

            input.setSelectionRange(at, at)
        }, position)

    const paragraph = async (page, index) => {
        await page.locator('.fi-page .tiptap').click()
        await wait(150)
        await page.evaluate((index) => {
            const editor = window.Alpine.$data(document.querySelector('.fi-page [x-data*="richEditorFormComponent"]')).getEditor()
            const node = editor.view.dom.querySelectorAll(':scope > p')[index]

            editor.chain().focus().setTextSelection(editor.view.posAtDOM(node, node.childNodes.length)).run()
        }, index)
        await wait(150)
    }

    say('1. The list shows who is on each article')
    await Promise.all([app.edit(alice, 3), bob.goto(`${app.base}/admin/documents`)])
    await bob.locator('.fi-collab-column .fi-collab-avatar').first().waitFor({ timeout: 15000 })
    await wait(3500)

    say('2. Open the same article: you see each other in the header')
    await app.edit(bob, 3)
    await wait(3500)

    say('3. Type in the same field at the same time. Both edits stay')
    await title(alice).click()
    await cursor(alice, 0)
    await title(bob).click()
    await cursor(bob, -1)
    await Promise.all([alice.keyboard.type('New: ', { delay: 320 }), bob.keyboard.type(' for spring', { delay: 190 })])
    await wait(2500)

    say('4. The rich editor is live too, with named cursors')
    await paragraph(alice, 0)
    await paragraph(bob, 1)
    await Promise.all([
        alice.keyboard.type(' Alice writes here.', { delay: 120 }),
        bob.keyboard.type(' Bob writes here.', { delay: 135 }),
    ])
    await wait(3000)

    say('5. Undo only undoes your own typing')
    await alice.keyboard.press('Control+z')
    await wait(3500)

    say('6. Click the avatars to see where everybody is')
    await alice.locator('button.fi-collab-stack').click()
    await wait(3500)
    await alice.keyboard.press('Escape')

    say('7. Save publishes the shared draft for everybody')
    await alice.getByRole('button', { name: 'Save changes' }).first().click()
    await wait(5000)

    say('8. The inspector is one header action, and opt-in')
    await bob.getByRole('button', { name: 'Collaboration inspector' }).click()
    await wait(4500)

    const length = (Date.now() - began) / 1000

    await Promise.all(contexts.map((context) => context.close()))

    const inputs = await Promise.all(videos.map((video) => video.path()))
    const font = process.env.TUTORIAL_FONT ?? '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

    const write = (name, text) => {
        const file = path.join(directory, name)

        writeFileSync(file, text)

        return file
    }

    const label = (file, x, y, size, enable = '') =>
        `drawtext=fontfile=${font}:textfile=${file}:fontsize=${size}:fontcolor=white:x=${x}:y=${y}${enable}`

    const until = (index) => (captions[index + 1]?.at ?? length + 10).toFixed(2)
    const labels = [
        label(write('left.txt', 'Alice'), 24, 64, 22),
        label(write('right.txt', 'Bob'), WIDTH + 28, 64, 22),
        ...captions.map(({ at, text }, index) =>
            label(write(`caption-${index}.txt`, text), '(w-text_w)/2', 22, 30, `:enable='between(t,${at.toFixed(2)},${until(index)})'`),
        ),
    ]

    const filters = [
        `[0:v]pad=${WIDTH + 4}:${HEIGHT}:0:0:color=0x18181b[left]`,
        '[left][1:v]hstack=inputs=2,pad=1924:820:0:100:color=0x18181b[both]',
        `[both]${labels.join(',')},fps=15,scale=1440:-2[out]`,
    ]
    const output = path.resolve(demo, '../docs/media/tutorial.mp4')

    execFileSync('ffmpeg', [
        '-loglevel', 'error', '-y', '-i', inputs[0], '-i', inputs[1],
        '-filter_complex', filters.join(';'), '-map', '[out]',
        '-c:v', 'libx264', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output,
    ])

    console.log('saved', output, `${Math.round(length)}s`)
} finally {
    await app.stop()
    console.log('raw recordings are in', directory)
}
