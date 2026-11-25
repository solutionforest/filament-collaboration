// Builds the site's pages from the repository's own docs, so they never fork:
// docs/guide.md is split into one page per section, configuration and adapters
// get pages of their own, and links and anchors are rewritten to where they now live.
// Run by `npm run dev` and `npm run build`; the output, src/, is not committed.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { slugify } from '../.vitepress/slugify.mjs'
import { diagramAlt, diagramName } from './mermaid.mjs'

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repo = path.resolve(site, '..')
const out = path.join(site, 'src')
const read = (file) => readFileSync(path.join(repo, file), 'utf8')

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

/**
 * Splits markdown into its sections at headings of `level`, keeping the text before the first.
 *
 * @returns {{heading: string | null, body: string}[]}
 */
function sections(markdown, level) {
    const marker = '#'.repeat(level) + ' '
    const result = [{ heading: null, body: '' }]
    let fence = false

    for (const line of markdown.split('\n')) {
        if (line.startsWith('```')) fence = !fence

        if (!fence && line.startsWith(marker)) result.push({ heading: line.slice(marker.length).trim(), body: '' })
        else result.at(-1).body += line + '\n'
    }

    return result
}

const guide = sections(read('docs/guide.md'), 2)
const section = (number) => guide.find(({ heading }) => heading?.startsWith(`${number}. `))
const strip = (heading) => heading.replace(/^\d+\.\s*/, '')

// Section 9's adapter parts become the Adapters page; the rest stays in Extending.
const extending = sections(section(9).body, 3)
const adapterParts = extending.filter(({ heading }) => heading === 'Adapters for other editors' || heading === 'HTML editors')
const extendingRest = extending.filter((part) => !adapterParts.includes(part))
const join3 = (parts) => parts.map(({ heading, body }) => (heading ? `### ${heading}\n${body}` : body)).join('')

const readme = sections(read('README.md'), 2)
const readmePart = (name) => readme.find(({ heading }) => heading === name)?.body ?? ''

/**
 * Relative links in markdown from `from`, rewritten as if written in `to`:
 * for a README section placed on a page whose links are read from docs/.
 */
const rebase = (markdown, from, to) =>
    markdown.replace(/(!?\[[^\]]*\])\(([^)\s#]+)(#[^)\s]*)?\)/g, (match, text, file, anchor = '') =>
        /^[a-z]+:/.test(file) ? match : `${text}(${path.posix.relative(path.posix.dirname(to), path.posix.join(path.posix.dirname(from), file))}${anchor})`,
    )

/**
 * Every page: where it goes, where it comes from (for "edit this page"), its title and description.
 *
 * @type {{path: string, source: string, title: string, description: string, body: string}[]}
 */
const pages = [
    {
        path: 'getting-started.md',
        source: 'README.md',
        title: 'Install and quick start',
        description: 'Install Filament Collaboration, add the plugin and a trait, and open a record in two browsers.',
        body: `## Requirements\n${readmePart('Requirements')}\n## Quick start\n${readmePart('Quick start')}\n## Try the demo\n${readmePart('Try the demo')}`,
    },
    ...[
        [1, 'guide/first-resource', 'Make a resource collaborative, step by step: the plugin, the traits, and what changes for your editors.'],
        [2, 'guide/live-fields', 'Which Filament fields merge live, which take the latest choice, and how to turn fields on or off.'],
        [3, 'guide/saving', 'The shared draft, saving and conflicts, deleted records, auditing, comments and version history.'],
        [4, 'guide/presence', 'Presence in tables, modals and hidden fields, and following a colleague.'],
        [5, 'guide/real-time', 'Push changes over Laravel Reverb instead of polling, with a keystroke reaching others in about 60 ms.'],
        [7, 'guide/security', 'What is checked on every request, who may edit live, and renewing tokens after permissions change.'],
        [8, 'guide/uploads', 'Images in rich text and upload fields, stored at once and kept by whoever saves.'],
        [10, 'guide/debugging', 'The collaboration inspector, error reports and what to look at when a field is not live.'],
        [11, 'guide/troubleshooting', 'Common problems and their fixes.'],
    ].map(([number, page, description]) => ({
        path: `${page}.md`,
        source: 'docs/guide.md',
        promote: true,
        title: strip(section(number).heading),
        description,
        body: section(number).body,
    })),
    {
        path: 'guide/extending.md',
        promote: true,
        source: 'docs/guide.md',
        title: 'Extending',
        description: 'Your own field types, events, storage and AI assistants.',
        body: join3(extendingRest),
    },
    {
        path: 'configuration.md',
        promote: true,
        source: 'docs/guide.md',
        title: 'Configuration',
        description: 'Every plugin option, every environment variable, presence in Redis and PHPStan.',
        body: `${rebase(readmePart('Configuration'), 'README.md', 'docs/guide.md')}\n${section(6).body}`,
    },
    {
        path: 'adapters/index.md',
        promote: true,
        source: 'docs/guide.md',
        title: 'Adapters',
        description: 'Make any editor live: the adapter API, its formats, and HTML editors such as TinyMCE and CKEditor.',
        body: join3(adapterParts),
    },
    {
        path: 'adapters/custom-components.md',
        source: 'docs/custom-components.md',
        title: 'Make your own component live',
        description: 'Build a custom Filament field and its adapter step by step: a post composer and a star rating.',
        body: read('docs/custom-components.md').replace(/^# .*\n/, ''),
    },
    {
        path: 'how-it-works.md',
        source: 'docs/how-it-works.md',
        title: 'How it works with Filament',
        description: 'How the browser script works with Filament, why the package has its own merge engine instead of Yjs, and what works without Filament.',
        body: read('docs/how-it-works.md').replace(/^# .*\n/, ''),
    },
    {
        path: 'architecture.md',
        source: 'docs/architecture.md',
        title: 'Architecture and performance',
        description: 'How an edit travels, the CRDT, the server, and load-test results with polling, Reverb and Redis.',
        body: read('docs/architecture.md').replace(/^# .*\n/, ''),
    },
    {
        path: 'changelog.md',
        source: 'CHANGELOG.md',
        title: 'Changelog',
        description: 'Every release of Filament Collaboration, following Semantic Versioning.',
        body: read('CHANGELOG.md').replace(/^# .*\n/, ''),
    },
]

// Where every anchor now lives: section headings point at their page, the rest at their heading there.
const urlOf = (page) => '/' + page.path.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
/** @type {Map<string, string>} */
const anchors = new Map()

for (const page of pages) {
    for (const match of page.body.matchAll(/^#{2,4} (.+)$/gm)) anchors.set(slugify(match[1]), `${urlOf(page)}#${slugify(match[1])}`)
}

for (const { heading } of guide) if (heading) anchors.set(slugify(heading), urlOf(pages.find((page) => page.title === strip(heading)) ?? pages.find((page) => page.path === 'configuration.md')))
anchors.set(slugify('9. Extending'), '/guide/extending')
anchors.set(slugify('6. Configuration'), '/configuration#on-the-plugin')
// The README's Quality section is not on the site; the architecture page's tests are.
anchors.set('quality', '/architecture#tests')

const files = {
    'docs/guide.md': (anchor) => anchors.get(anchor) ?? '/guide/first-resource',
    'docs/custom-components.md': (anchor) => '/adapters/custom-components' + (anchor ? `#${anchor}` : ''),
    'docs/architecture.md': (anchor) => '/architecture' + (anchor ? `#${anchor}` : ''),
    'docs/how-it-works.md': (anchor) => '/how-it-works' + (anchor ? `#${anchor}` : ''),
    'CHANGELOG.md': () => '/changelog',
    'README.md': (anchor) => anchors.get(anchor) ?? '/',
    'LICENSE': () => 'https://github.com/solutionforest/filament-collaboration/blob/main/LICENSE',
}

/** A PNG's width and height, from its header. */
function pngSize(file) {
    if (!existsSync(file)) return null

    const header = readFileSync(file).subarray(16, 24)

    return { width: header.readUInt32BE(0), height: header.readUInt32BE(4) }
}

/** Rewrites a link written relative to `source` for the site. */
function link(target, source) {
    if (/^(https?:|mailto:)/.test(target)) return target

    const [file, anchor] = target.split('#')

    if (file === '') return anchors.get(anchor) ?? `#${anchor}`

    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(source), file))

    if (resolved.startsWith('docs/media/')) return `/media/${path.posix.basename(resolved)}`
    if (files[resolved]) return files[resolved](anchor)

    // Anything else in the repository: on GitHub.
    return `https://github.com/solutionforest/filament-collaboration/blob/main/${resolved}${anchor ? `#${anchor}` : ''}`
}

/** The SVG's own size, so the page does not shift as it loads. */
function svgSize(file) {
    const box = readFileSync(file, 'utf8').match(/viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/)

    return box ? { width: Math.round(Number(box[1])), height: Math.round(Number(box[2])) } : null
}

/** A mermaid block as the pictures `npm run diagrams` drew of it, light and dark. */
function diagram(code) {
    const name = diagramName(code)
    const file = path.join(site, 'public/diagrams', `${name}.svg`)

    if (!existsSync(file)) throw new Error(`A diagram changed: run npm run diagrams in website/ and commit public/diagrams/.`)

    const { width, height } = svgSize(file) ?? { width: 800, height: 400 }
    const alt = diagramAlt(code).replace(/"/g, '&quot;')

    return ['light', 'dark']
        .map((variant) => `<img class="diagram diagram-${variant}" src="/diagrams/${name}${variant === 'dark' ? '-dark' : ''}.svg" alt="${alt}" width="${width}" height="${height}" loading="lazy">`)
        .join('\n')
}

for (const page of pages) {
    let fence = false
    const body = page.body
        .replace(/^```mermaid\n([\s\S]*?)^```$/gm, (match, code) => `<figure class="diagram">\n${diagram(code)}\n</figure>`)
        .split('\n')
        .map((line) => {
            if (line.startsWith('```')) fence = !fence

            if (fence || line.startsWith('```')) return line

            // Screenshots with their size, so the page does not shift as they load.
            const sized = line.replace(/!\[([^\]]*)\]\(([^)\s]+\.png)\)/g, (match, alt, target) => {
                const url = link(target, page.source)
                const size = url.startsWith('/media/') && pngSize(path.join(repo, 'docs/media', path.posix.basename(url)))

                return size ? `<img src="${url}" alt="${alt.replace(/"/g, '&quot;')}" width="${size.width}" height="${size.height}" loading="lazy">` : match
            })

            return sized.replace(/(!?\[[^\]]*\])\(([^)\s]+)\)/g, (_, text, target) => `${text}(${link(target, page.source)})`)
        })
        .join('\n')
        // Section numbers belong to the single guide file, not to separate pages.
        .replace(/^(#{2,4}) \d+\. /gm, '$1 ')
        // A guide section's subsections are the page's sections: ### becomes ##, under the page's title.
        .replace(/^#(#{2,5}) /gm, (heading, rest) => (page.promote ? `${rest} ` : heading))
    const front = ['---', `title: ${JSON.stringify(page.title)}`, `description: ${JSON.stringify(page.description)}`, `source: ${page.source}`, `cover: /covers/${page.path.replace(/(\/index)?\.md$/, '').replace(/\//g, '-')}.png`, '---', '']
    const file = path.join(out, page.path)

    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, `${front.join('\n')}\n# ${page.title}\n\n${body.trim()}\n`)
}

// Hand-written pages (the landing page), brand assets, and the screenshots and video.
cpSync(path.join(site, 'pages'), out, { recursive: true })
mkdirSync(path.join(out, 'public', 'media'), { recursive: true })
cpSync(path.join(site, 'public'), path.join(out, 'public'), { recursive: true })

for (const file of readdirSync(path.join(repo, 'docs/media'))) cpSync(path.join(repo, 'docs/media', file), path.join(out, 'public/media', file))

writeFileSync(path.join(site, '.vitepress', 'pages.json'), JSON.stringify(pages.map(({ path: page, title, description, source }) => ({ path: page, title, description, source })), null, 2) + '\n')
console.log(`synced ${pages.length} pages from docs/, README.md and CHANGELOG.md`)
if (!existsSync(path.join(out, 'index.md'))) throw new Error('pages/index.md is missing')
