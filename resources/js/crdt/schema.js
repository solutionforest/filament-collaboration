import { wellFormed } from './id.js'

/** The content allow-list. Keep in step with `src/Crdt/RichTextSchema.php`. */

export const TEXT_BLOCKS = new Set(['paragraph', 'heading', 'codeBlock', 'detailsSummary'])
export const INLINE = new Set(['hardBreak', 'image', 'mergeTag'])

const CELL = ['align', 'colspan', 'colwidth', 'rowspan']

const NODES = new Map(
    Object.entries({
        paragraph: ['textAlign'],
        heading: ['level', 'textAlign'],
        codeBlock: ['language'],
        detailsSummary: [],
        details: [],
        detailsContent: [],
        blockquote: [],
        bulletList: [],
        orderedList: ['start', 'type'],
        listItem: [],
        horizontalRule: [],
        lead: [],
        grid: ['data-cols', 'data-from-breakpoint'],
        gridColumn: ['data-col-span'],
        table: [],
        tableRow: [],
        tableCell: CELL,
        tableHeader: CELL,
        hardBreak: [],
        image: ['alt', 'height', 'id', 'src', 'title', 'width'],
        mergeTag: ['id'],
    }),
)

const MARKS = new Map(
    Object.entries({
        bold: [],
        italic: [],
        underline: [],
        strike: [],
        code: [],
        subscript: [],
        superscript: [],
        small: [],
        highlight: [],
        textColor: ['data-color'],
        link: ['href', 'rel', 'target', 'title'],
    }),
)

const DEFAULTS = {
    colspan: 1,
    rowspan: 1,
    start: 1,
    'data-cols': 2,
    'data-col-span': 1,
    'data-from-breakpoint': 'md',
    textAlign: 'start',
}

const INTEGERS = new Set(['level', 'start', 'colspan', 'rowspan', 'data-cols', 'data-col-span'])
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value))

function isSafeUrl(url, schemes) {
    if (new TextEncoder().encode(url).length > 8192 || /[\u0000- \u007f]/.test(url)) return false

    const scheme = url.match(/^([^/?#]*):/)

    return !scheme || schemes.includes(scheme[1].toLowerCase())
}

function attribute(name, value) {
    if (name === 'colwidth') {
        return Array.isArray(value) && value.length
            ? value.map((width) => clamp(Math.trunc(Number(width)) || 0, 0, 10000))
            : null
    }

    if (!['string', 'number'].includes(typeof value) || value === '') return null

    if (INTEGERS.has(name)) {
        const number = Number(value)

        return Number.isFinite(number) ? clamp(Math.trunc(number), 1, name === 'level' ? 6 : 1000) : null
    }

    const text = wellFormed(String(value))
    let valid

    switch (name) {
        case 'href':
            valid = isSafeUrl(text, ['http', 'https', 'mailto', 'tel'])
            break
        case 'src':
            valid = isSafeUrl(text, ['http', 'https'])
            break
        case 'target':
            valid = text === '_blank'
            break
        case 'rel':
            valid = /^[a-z ]{1,120}$/.test(text)
            break
        case 'textAlign':
        case 'align':
            valid = ['start', 'center', 'end', 'justify', 'left', 'right'].includes(text)
            break
        case 'width':
        case 'height':
            valid = /^[0-9]+(\.[0-9]+)?(px|%|em|rem)?$/.test(text)
            break
        case 'data-color':
        case 'language':
        case 'type':
        case 'data-from-breakpoint':
            valid = /^[\p{L}\p{N}\p{M}\p{Pc} #(),.%+/-]{1,80}$/u.test(text)
            break
        default:
            valid = Array.from(text).length <= 2048
    }

    return valid ? text : null
}

function attributes(allowed, given) {
    const result = {}

    for (const name of [...allowed].sort()) {
        const value = attribute(name, given?.[name])

        if (value !== null && DEFAULTS[name] !== value) result[name] = value
    }

    return Object.keys(result).length ? result : null
}

export function nodeAttributes(type, given) {
    if (!NODES.has(type)) throw new Error(`Rich content node [${type}] cannot be shared live.`)

    return attributes(NODES.get(type), given)
}

export function markAttributes(type, given) {
    if (!MARKS.has(type)) throw new Error(`Rich content mark [${type}] cannot be shared live.`)

    return attributes(MARKS.get(type), given)
}
