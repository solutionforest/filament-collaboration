import { writeFileSync } from 'node:fs'
import { crowd } from './crowd.mjs'
import { start } from './harness.mjs'

// 100 editors on one article: npm run test:load
const SIZE = Number(process.argv[2] ?? 100)
const SECONDS = Number(process.argv[3] ?? 45)
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
const percentile = (values, fraction) => Math.round([...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor(values.length * fraction))])

const app = await start({ optimized: true })

try {
    const joining = Date.now()
    const editors = await crowd(app, { size: SIZE })
    const joined = Math.round((Date.now() - joining) / 1000)

    await Promise.all(editors.map((editor) => editor.sync()))

    const typists = editors.filter((editor, index) => index % 5 === 0)
    const marks = typists.map((editor, index) => `[${index}]`)
    const interval = 400 * Math.max(1, Math.sqrt(SIZE / 10))

    editors.forEach((editor) => (editor.latency = []))

    const began = Date.now()

    await Promise.all(
        editors.map(async (editor, index) => {
            await wait((index / editors.length) * interval)

            let next = Date.now()
            let step = 0

            while (Date.now() - began < SECONDS * 1000) {
                const typist = typists.indexOf(editor)

                if (typist !== -1 && editor.document) {
                    if (step === 1) editor.edit('excerpt', (value) => `${value} ${marks[typist]}`)
                    else if (step > 1 && step % 3 === 0) editor.edit('title', (value) => `${value}.`)
                }

                editor.focus(['title', 'excerpt', 'body_html', 'seo_title'][index % 4], step % 20)
                await editor.sync()
                step++
                next = Math.max(Date.now(), next + interval)
                await wait(next - Date.now())
            }
        }),
    )

    const elapsed = (Date.now() - began) / 1000

    // A last round to push, then two to pull.
    const latency = editors.flatMap((editor) => editor.latency)

    for (let round = 0; round < 3; round++) await Promise.all(editors.map((editor) => editor.sync()))

    const reference = editors[0].document
    const report = {
        editors: editors.length,
        typing: typists.length,
        joinSeconds: joined,
        seconds: Math.round(elapsed),
        requests: latency.length,
        requestsPerSecond: Math.round(latency.length / elapsed),
        latencyMs: { p50: percentile(latency, 0.5), p95: percentile(latency, 0.95), p99: percentile(latency, 0.99) },
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
