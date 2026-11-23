import { writeFileSync } from 'node:fs'
import { crowd } from './crowd.mjs'
import { start } from './harness.mjs'

// Editors on one article: npm run test:load -- <editors> <seconds>
// With TRANSPORT=reverb they listen for pushes the way the browser does.
const SIZE = Number(process.argv[2] ?? 100)
const SECONDS = Number(process.argv[3] ?? 45)
const PUSHED = process.env.TRANSPORT === 'reverb'
// ACTIVE=0.1: only one editor in ten moves and types; the rest are reading.
const ACTIVE = Number(process.env.ACTIVE ?? 1)
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
const percentile = (values, fraction) =>
    values.length ? Math.round([...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor(values.length * fraction))]) : null

const app = await start({ optimized: true })

try {
    const joining = Date.now()
    const editors = await crowd(app, { size: SIZE })
    const joined = Math.round((Date.now() - joining) / 1000)

    await Promise.all(editors.map((editor) => editor.sync()))

    const active = editors.filter((editor, index) => index < Math.max(1, Math.round(editors.length * ACTIVE)))
    const typists = active.filter((editor, index) => index % 5 === 0)
    const marks = typists.map((editor, index) => `[${index}]`)
    // The browser's pace, from resources/js/room/room.js.
    const polling = 400 * Math.max(1, Math.sqrt(SIZE / 10))
    const heartbeat = PUSHED ? 8000 : polling
    const timers = new Map()
    let running = true

    // Like Room.syncSoon(): an earlier request wins over a later one.
    const soon = (editor, delay) => {
        if (!running) return

        const at = Date.now() + delay
        const timer = timers.get(editor)

        if (timer && timer.at <= at) return

        clearTimeout(timer?.handle)
        timers.set(editor, {
            at,
            handle: setTimeout(async () => {
                timers.delete(editor)
                await editor.sync()
                soon(editor, heartbeat)
            }, delay),
        })
    }

    if (PUSHED) {
        await Promise.all(
            editors.map((editor) =>
                editor.listen(app, (payload) => {
                    const delay = editor.pushed(payload, SIZE - 1)

                    if (delay !== null) soon(editor, delay)
                }),
            ),
        )
    }

    editors.forEach((editor) => (editor.latency = []))

    const seen = new Map()
    const began = Date.now()

    editors.forEach((editor, index) => soon(editor, (index / editors.length) * heartbeat))

    // Everybody moves a caret at the polling pace; a fifth of them also type.
    const activity = active.map(async (editor, index) => {
        await wait((index / editors.length) * polling)

        for (let step = 0; running; step++) {
            const typist = typists.indexOf(editor)

            if (typist !== -1 && editor.document) {
                if (step === 1) {
                    editor.edit('excerpt', (value) => `${value} ${marks[typist]}`)
                    seen.set(marks[typist], { at: Date.now(), by: editor })
                } else if (step > 1 && step % 3 === 0) {
                    editor.edit('title', (value) => `${value}.`)
                }
            }

            editor.focus(['title', 'excerpt', 'body_html', 'seo_title'][index % 4], step % 20)
            soon(editor, PUSHED ? 30 : Math.max(100, polling / 3))
            await wait(polling)
        }
    })

    // How long each typed mark took to reach everybody else.
    const arrivals = []
    const watch = setInterval(() => {
        for (const [mark, entry] of seen) {
            for (const editor of editors) {
                if (editor === entry.by || entry[editor.name] || !editor.document?.value('excerpt')?.includes(mark)) continue

                entry[editor.name] = true
                arrivals.push(Date.now() - entry.at)
            }
        }
    }, 20)

    await wait(SECONDS * 1000)
    running = false
    await Promise.all(activity)
    clearInterval(watch)
    timers.forEach(({ handle }) => clearTimeout(handle))

    const elapsed = (Date.now() - began) / 1000
    const latency = editors.flatMap((editor) => editor.latency)

    for (let round = 0; round < 3; round++) await Promise.all(editors.map((editor) => editor.sync()))

    editors.forEach((editor) => editor.close())

    const reference = editors[0].document
    const report = {
        transport: PUSHED ? 'Reverb push + 8 s heartbeat' : `polling every ${Math.round(polling)} ms`,
        editors: editors.length,
        active: active.length,
        typing: typists.length,
        joinSeconds: joined,
        seconds: Math.round(elapsed),
        requests: latency.length,
        requestsPerSecond: Math.round(latency.length / elapsed),
        pushesReceived: editors.reduce((sum, editor) => sum + editor.pushes, 0),
        pushesApplied: editors.reduce((sum, editor) => sum + editor.applied, 0),
        requestMs: { p50: percentile(latency, 0.5), p95: percentile(latency, 0.95), p99: percentile(latency, 0.99) },
        typedToSeenMs: { p50: percentile(arrivals, 0.5), p95: percentile(arrivals, 0.95), samples: arrivals.length },
        errors: editors.flatMap((editor) => editor.errors).length,
        peopleSeen: editors[0].total,
        converged: editors.filter((editor) => ['title', 'excerpt'].every((field) => editor.document.value(field) === reference.value(field))).length,
        marksKept: `${marks.filter((mark) => reference.value('excerpt').includes(mark)).length}/${marks.length}`,
    }

    console.log(JSON.stringify(report, null, 4))

    if (process.env.LOAD_REPORT) writeFileSync(process.env.LOAD_REPORT, JSON.stringify(report, null, 4))
    if (report.errors || report.converged !== editors.length || report.marksKept !== `${marks.length}/${marks.length}`) process.exitCode = 1
} finally {
    await app.stop()
}
