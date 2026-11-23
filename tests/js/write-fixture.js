import { writeFileSync } from 'node:fs'
import { simulate } from './simulation.js'

// Replayed by PHP to prove the two implementations agree: npm run test:fixture
const count = Number(process.argv[3] ?? 60)
const cases = Array.from({ length: count }, (_, index) => {
    const { server, batches } = simulate((index + 1) * 104729, { steps: 60 })

    return { batches, expected: Object.fromEntries(['title', 'body', 'status'].map((field) => [field, server.value(field)])) }
})

writeFileSync(process.argv[2] ?? new URL('../Fixtures/convergence.json', import.meta.url), JSON.stringify(cases))
