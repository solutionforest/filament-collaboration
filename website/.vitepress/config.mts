import { defineConfig, type HeadConfig } from 'vitepress'
import { slugify } from './slugify.mjs'

const site = 'https://solutionforest.github.io/filament-collaboration/'
const base = '/filament-collaboration/'
const repo = 'https://github.com/solutionforest/filament-collaboration'
const name = 'Filament Collaboration'
const tagline = 'Google Docs-style collaborative editing for Filament'
const description =
    'Live fields, presence, carets, comments and version history for Filament 5 forms. Everyone on a record edits the same draft as they type, with its own CRDT, over plain HTTP or Laravel Reverb.'

/** The page's address on the site, from its file. */
const urlOf = (relativePath: string) => site + relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')

export default defineConfig({
    srcDir: 'src',
    base,
    lang: 'en',
    title: name,
    titleTemplate: `:title | ${name}`,
    description,
    cleanUrls: true,
    lastUpdated: false,
    sitemap: { hostname: site },

    markdown: {
        anchor: { slugify },
        // High-contrast code themes: every token reads at 4.5:1, light and dark.
        theme: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' },
        image: { lazyLoading: true },
    },

    head: [
        ['link', { rel: 'icon', href: `${base}favicon.ico`, sizes: '48x48' }],
        ['link', { rel: 'icon', href: `${base}favicon.svg`, type: 'image/svg+xml' }],
        ['link', { rel: 'apple-touch-icon', href: `${base}apple-touch-icon.png` }],
        ['link', { rel: 'manifest', href: `${base}site.webmanifest` }],
        ['meta', { name: 'theme-color', content: '#f59e0b' }],
        ['meta', { name: 'author', content: 'Solution Forest' }],
        ['meta', { property: 'og:site_name', content: name }],
        ['meta', { property: 'og:locale', content: 'en' }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ],

    // Per page: canonical URL, Open Graph and Twitter tags with the page's own cover, and structured data on the home page.
    transformHead({ pageData }) {
        const url = urlOf(pageData.relativePath)
        const isHome = pageData.relativePath === 'index.md'
        const title = isHome ? `${name}: ${tagline}` : `${pageData.title} | ${name}`
        const text = pageData.description || description
        const cover = new URL((pageData.frontmatter.cover ?? '/covers/default.png').replace(/^\//, ''), site).href
        const head: HeadConfig[] = [
            ['link', { rel: 'canonical', href: url }],
            ['meta', { property: 'og:type', content: isHome ? 'website' : 'article' }],
            ['meta', { property: 'og:title', content: title }],
            ['meta', { property: 'og:description', content: text }],
            ['meta', { property: 'og:url', content: url }],
            ['meta', { property: 'og:image', content: cover }],
            ['meta', { property: 'og:image:width', content: '1200' }],
            ['meta', { property: 'og:image:height', content: '630' }],
            ['meta', { property: 'og:image:alt', content: title }],
            ['meta', { name: 'twitter:title', content: title }],
            ['meta', { name: 'twitter:description', content: text }],
            ['meta', { name: 'twitter:image', content: cover }],
        ]

        if (isHome) {
            head.push([
                'script',
                { type: 'application/ld+json' },
                JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'SoftwareSourceCode',
                    name,
                    description,
                    url: site,
                    codeRepository: repo,
                    programmingLanguage: ['PHP', 'JavaScript'],
                    runtimePlatform: 'Laravel, Filament 5',
                    license: 'https://opensource.org/licenses/MIT',
                    image: new URL('covers/default.png', site).href,
                    author: { '@type': 'Organization', name: 'Solution Forest', url: 'https://solutionforest.com' },
                }),
            ])
        }

        return head
    },

    themeConfig: {
        logo: { src: '/icon.svg', alt: '' },
        siteTitle: name,

        nav: [
            { text: 'Guide', link: '/getting-started', activeMatch: '^/(getting-started|guide/)' },
            { text: 'Configuration', link: '/configuration' },
            { text: 'Adapters', link: '/adapters/', activeMatch: '^/adapters/' },
            { text: 'Architecture', link: '/architecture' },
            {
                text: 'v0.1.0',
                items: [
                    { text: 'Changelog', link: '/changelog' },
                    { text: 'Releases', link: `${repo}/releases` },
                ],
            },
        ],

        sidebar: [
            {
                text: 'Getting started',
                items: [
                    { text: 'Install and quick start', link: '/getting-started' },
                    { text: 'Your first collaborative resource', link: '/guide/first-resource' },
                ],
            },
            {
                text: 'Usage guide',
                items: [
                    { text: 'Which fields are live', link: '/guide/live-fields' },
                    { text: 'Saving, drafts and conflicts', link: '/guide/saving' },
                    { text: 'Presence in tables and modals', link: '/guide/presence' },
                    { text: 'Real time with Reverb', link: '/guide/real-time' },
                    { text: 'Permissions and security', link: '/guide/security' },
                    { text: 'Images and uploads', link: '/guide/uploads' },
                ],
            },
            { text: 'Configuration', items: [{ text: 'Plugin, fields and environment', link: '/configuration' }] },
            {
                text: 'Adapters',
                items: [
                    { text: 'Adapters for other editors', link: '/adapters/' },
                    { text: 'Make your own component live', link: '/adapters/custom-components' },
                    { text: 'Extending', link: '/guide/extending' },
                ],
            },
            {
                text: 'Reference',
                items: [
                    { text: 'Architecture and performance', link: '/architecture' },
                    { text: 'Debugging', link: '/guide/debugging' },
                    { text: 'Troubleshooting', link: '/guide/troubleshooting' },
                    { text: 'Changelog', link: '/changelog' },
                ],
            },
        ],

        socialLinks: [{ icon: 'github', link: repo }],
        search: { provider: 'local' },
        outline: { level: [2, 3], label: 'On this page' },

        // Pages are built from docs/, README.md and CHANGELOG.md: edit the source.
        editLink: {
            // Sent to the browser as source code: it can only use its arguments.
            pattern: ({ frontmatter, filePath }) =>
                `https://github.com/solutionforest/filament-collaboration/edit/main/${frontmatter.source ?? `website/pages/${filePath}`}`,
            text: 'Edit this page on GitHub',
        },

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2026 Solution Forest Limited · Made in HK',
        },
    },
})
