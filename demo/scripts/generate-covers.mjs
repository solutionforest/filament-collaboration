// Draws a cover for every seeded article into database/seeders/covers/: an
// abstract landscape in its category's colour, different for each article.
// Generated here, so they are free to use. Run after adding an article to
// database/seeders/BlogContent.php: npm run covers. The output is committed.
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const demo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = path.join(demo, 'database/seeders/covers')

const content = JSON.parse(
    execFileSync('php', ['-r', 'require "vendor/autoload.php"; echo json_encode(["articles" => Database\\Seeders\\BlogContent::articles(), "categories" => Database\\Seeders\\BlogContent::categories()]);'], { cwd: demo }).toString(),
)
const colors = Object.fromEntries(content.categories.map((category) => [category.name, category.color]))

/** A small deterministic generator, so a slug always draws the same cover. */
function random(seed) {
    let state = [...seed].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 2166136261)

    return () => {
        state = (state + 0x6d2b79f5) >>> 0
        let t = state
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function mix(hex, other, amount) {
    const parse = (value) => [1, 3, 5].map((start) => parseInt(value.slice(start, start + 2), 16))
    const [a, b] = [parse(hex), parse(other)]

    return `rgb(${a.map((channel, index) => Math.round(channel + (b[index] - channel) * amount)).join(' ')})`
}

/** Hills, or a skyline, or waves, under a sun, in the category's colour. */
function svg(slug, color) {
    const next = random(slug)
    const width = 1600
    const height = 900
    const kind = ['hills', 'skyline', 'waves'][Math.floor(next() * 3)]
    const layers = []

    for (let layer = 0; layer < 4; layer++) {
        const base = 430 + layer * 110 + next() * 40
        const fill = mix(color, layer % 2 ? '#000000' : '#ffffff', layer % 2 ? 0.15 + layer * 0.08 : 0.55 - layer * 0.1)
        let d = `M0 ${height} L0 ${base}`

        if (kind === 'skyline' && layer > 0) {
            for (let x = 0; x < width; ) {
                const w = 50 + next() * 110
                const h = base - next() * (200 - layer * 30)

                d += ` L${x} ${h} L${x + w} ${h}`
                x += w
            }
        } else {
            // A smooth curve: one or two long swells for hills, many short ones for waves.
            const period = kind === 'waves' ? 90 + next() * 60 : 380 + next() * 320
            const amplitude = kind === 'waves' ? 10 + next() * 10 : 40 + next() * 60
            const phase = next() * Math.PI * 2

            for (let x = 0; x <= width; x += 16) {
                d += ` L${x} ${(base + Math.sin(x / period + phase) * amplitude).toFixed(1)}`
            }
        }

        layers.push(`<path d="${d} L${width} ${height} Z" fill="${fill}"/>`)
    }

    const sunX = 260 + next() * 1080
    const sunY = 170 + next() * 160
    const sunR = 70 + next() * 70
    const dots = Array.from({ length: 26 }, () => `<circle cx="${next() * width}" cy="${next() * 380}" r="${1.5 + next() * 2.5}" fill="#ffffff" opacity="${0.15 + next() * 0.35}"/>`).join('')

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${mix(color, '#000000', 0.45)}"/><stop offset="0.7" stop-color="${mix(color, '#ffffff', 0.25)}"/>
        </linearGradient></defs>
        <rect width="${width}" height="${height}" fill="url(#sky)"/>
        ${dots}
        <circle cx="${sunX}" cy="${sunY}" r="${sunR * 1.9}" fill="#fff3d6" opacity="0.12"/>
        <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="#fff3d6" opacity="0.92"/>
        ${layers.join('')}
    </svg>`
}

mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })

for (const article of content.articles) {
    await page.setContent(`<html><body style="margin:0">${svg(article.slug, colors[article.category] ?? '#1f7a55')}</body></html>`)
    await page.screenshot({ path: path.join(out, `${article.slug}.jpg`), type: 'jpeg', quality: 82 })
}

await browser.close()
console.log(`${content.articles.length} covers drawn to database/seeders/covers/`)
