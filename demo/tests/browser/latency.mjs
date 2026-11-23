import { start } from './harness.mjs'

// From a key press in one browser to the character in another: npm run test:latency
const app = await start({ optimized: true })

try {
    const [alice, bob] = await Promise.all([app.signIn('alice'), app.signIn('bob')])

    await Promise.all([app.edit(alice), app.edit(bob)])
    await alice.locator('[id="form.title"]').click()
    await alice.keyboard.press('End')

    const samples = []

    for (let index = 0; index < 60; index++) {
        const before = await bob.locator('[id="form.title"]').inputValue()
        const seen = bob.waitForFunction((value) => document.getElementById('form.title').value !== value, before, { polling: 10 })

        // Not in step with the sync interval.
        await alice.waitForTimeout(80 + ((index * 137) % 420))

        const started = performance.now()

        await alice.keyboard.type('x')
        await seen
        samples.push(performance.now() - started)
    }

    samples.sort((a, b) => a - b)

    const at = (fraction) => Math.round(samples[Math.min(samples.length - 1, Math.floor(samples.length * fraction))])

    console.log(JSON.stringify({ samples: samples.length, p50: at(0.5), p95: at(0.95), max: at(1) }))
} finally {
    await app.stop()
}
