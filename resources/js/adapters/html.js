/**
 * HTML editors (TinyMCE, CKEditor, Quill, Trix...) hold HTML. Merging HTML
 * character by character could break its tags, so an `html` adapter's
 * content is turned into the document the built-in rich editor shares, and
 * back. What fits that schema merges by character, block and mark.
 *
 * Positions count as the shared document's tokens do: one for the start of
 * each block of text, one per character, one per image or line break. The
 * same walk over the editor's live DOM maps a caret to a position and back.
 */

/**
 * @typedef {{kind: 'block' | 'char' | 'embed', node: Node, offset: number}} Unit
 *   where the caret is just after this unit
 */

const HEADINGS = { H1: 1, H2: 2, H3: 3, H4: 4, H5: 5, H6: 6 }

/** @type {Record<string, string>} */
const MARKS = {
    STRONG: 'bold',
    B: 'bold',
    EM: 'italic',
    I: 'italic',
    U: 'underline',
    S: 'strike',
    STRIKE: 'strike',
    DEL: 'strike',
    CODE: 'code',
    SUB: 'subscript',
    SUP: 'superscript',
    MARK: 'highlight',
    A: 'link',
}

const CONTAINERS = new Set(['BODY', 'DIV', 'SECTION', 'ARTICLE', 'MAIN', 'FIGURE', 'BLOCKQUOTE', 'LI', 'TD', 'TH', 'UL', 'OL', 'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TRIX-EDITOR'])
const TEXT_BLOCKS = new Set(['P', 'PRE', 'FIGCAPTION', ...Object.keys(HEADINGS)])
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'COLGROUP'])

/** Caret placeholders editors put in their DOM: invisible, so never counted. */
const INVISIBLE = /[\uFEFF\u200B]/g

/**
 * Editor furniture that is not content: Quill's list markers, TinyMCE's
 * bogus nodes, CKEditor's selection helpers, Trix's toolbars.
 *
 * @param {Element} element
 */
function isFurniture(element) {
    return (
        element.getAttribute('data-mce-bogus') === 'all' ||
        element.classList.contains('ql-ui') ||
        element.classList.contains('ql-cursor') ||
        element.classList.contains('ck-fake-selection-container') ||
        element.hasAttribute('data-ck-unsafe-element') ||
        (element.getAttribute('contenteditable') === 'false' && !element.matches('img, figure, [data-trix-attachment]'))
    )
}

/** @param {Node} node */
const isElement = (node) => node.nodeType === 1
/** @param {Node} node */
const isText = (node) => node.nodeType === 3

/**
 * Whether a node is laid out as a block, rather than inside a line of text.
 *
 * @param {Node} node
 */
function isBlockNode(node) {
    if (!isElement(node)) return false

    const tag = /** @type {Element} */ (node).tagName

    if (tag === 'DIV' || tag === 'FIGURE') return [...node.childNodes].some(isBlockNode) || tag === 'DIV'

    return CONTAINERS.has(tag) || TEXT_BLOCKS.has(tag) || tag === 'HR'
}

/** The walk that both converts and maps carets. */
class Walk {
    /** @type {Unit[]} */
    units = []

    /** @param {boolean} recording whether to keep the DOM location of each unit */
    constructor(recording) {
        this.recording = recording
    }

    /**
     * @param {Unit['kind']} kind
     * @param {Node} node
     * @param {number} offset
     */
    unit(kind, node, offset) {
        if (this.recording) this.units.push({ kind, node, offset })
    }

    /**
     * Blocks and loose inline content of a container.
     *
     * @param {Node} parent
     * @returns {RichNode[]}
     */
    blocks(parent) {
        /** @type {RichNode[]} */
        const blocks = []
        /** @type {Node[]} */
        let loose = []

        const flush = () => {
            const content = loose.filter((node) => !(isText(node) && !node.textContent?.replace(INVISIBLE, '').trim()))

            if (content.length) blocks.push(this.textBlock('paragraph', null, content, /** @type {Node} */ (content[0])))

            loose = []
        }

        for (const child of parent.childNodes) {
            if (isElement(child) && (SKIP.has(/** @type {Element} */ (child).tagName) || isFurniture(/** @type {Element} */ (child)))) continue

            if (!isBlockNode(child)) {
                loose.push(child)
                continue
            }

            flush()
            blocks.push(...this.block(/** @type {Element} */ (child)))
        }

        flush()

        return blocks
    }

    /**
     * @param {Element} element
     * @returns {RichNode[]}
     */
    block(element) {
        const tag = element.tagName

        if (tag === 'HR') {
            this.unit('block', element, 0)

            return [{ type: 'horizontalRule' }]
        }

        if (tag in HEADINGS) return [this.textBlock('heading', { level: HEADINGS[/** @type {keyof typeof HEADINGS} */ (tag)] }, [...element.childNodes], element)]
        if (tag === 'PRE') return [this.textBlock('codeBlock', null, [...element.childNodes], element)]
        if (tag === 'P' || tag === 'FIGCAPTION') return [this.textBlock('paragraph', null, [...element.childNodes], element)]

        if (tag === 'UL' || tag === 'OL') {
            const ordered = tag === 'OL' && element.querySelector(':scope > li[data-list="bullet"]') === null
            const items = [...element.children].filter((child) => child.tagName === 'LI').map((item) => this.container('listItem', item))

            return items.length ? [{ type: ordered ? 'orderedList' : 'bulletList', content: items }] : []
        }

        if (tag === 'BLOCKQUOTE') return [this.container('blockquote', element)]

        if (tag === 'TABLE') {
            const rows = [...element.querySelectorAll(':scope > tr, :scope > * > tr')].map((row) => ({
                type: 'tableRow',
                content: [...row.children]
                    .filter((cell) => cell.tagName === 'TD' || cell.tagName === 'TH')
                    .map((cell) => this.container(cell.tagName === 'TH' ? 'tableHeader' : 'tableCell', cell)),
            }))

            return rows.length ? [{ type: 'table', content: rows }] : []
        }

        // A div, figure or other wrapper: what it holds.
        return this.blocks(element)
    }

    /**
     * A list item, quote or cell: blocks, at least an empty paragraph.
     *
     * @param {string} type
     * @param {Element} element
     * @returns {RichNode}
     */
    container(type, element) {
        const content = this.blocks(element)

        if (!content.length) content.push(this.textBlock('paragraph', null, [], element))

        return { type, content }
    }

    /**
     * @param {string} type
     * @param {Record<string, any> | null} attrs
     * @param {Node[]} nodes
     * @param {Node} at where the block starts
     * @returns {RichNode}
     */
    textBlock(type, attrs, nodes, at) {
        this.unit('block', at, 0)

        /** @type {RichNode[]} */
        const content = []

        this.inline(nodes, [], content, type === 'codeBlock')

        // A last line break only gives an empty line its height.
        if (content.at(-1)?.type === 'hardBreak') {
            content.pop()

            if (this.recording) this.units.pop()
        }

        /** @type {RichNode} */
        const node = { type }

        if (attrs) node.attrs = attrs
        if (content.length) node.content = content

        return node
    }

    /**
     * @param {Node[]} nodes
     * @param {RichNode[]} marks
     * @param {RichNode[]} into
     * @param {boolean} code
     */
    inline(nodes, marks, into, code) {
        for (const node of nodes) {
            if (isText(node)) {
                this.text(/** @type {Text} */ (node), marks, into)
                continue
            }

            if (!isElement(node)) continue

            const element = /** @type {Element} */ (node)
            const tag = element.tagName

            if (SKIP.has(tag) || isFurniture(element)) continue

            if (tag === 'BR') {
                if (code) this.text(null, marks, into, '\n', element)
                else this.embed({ type: 'hardBreak' }, element, into)
                continue
            }

            if (tag === 'IMG') {
                const src = element.getAttribute('src')
                const alt = element.getAttribute('alt')
                /** @type {Record<string, string>} */
                const attrs = {}

                if (src) attrs.src = src
                if (alt) attrs.alt = alt

                this.embed({ type: 'image', attrs, ...(marks.length ? { marks } : {}) }, element, into)
                continue
            }

            const mark = code ? null : MARKS[tag]
            const href = mark === 'link' ? element.getAttribute('href') : null
            /** @type {RichNode[]} */
            const inner = mark ? [...marks, mark === 'link' ? { type: 'link', attrs: href ? { href } : {} } : { type: mark }] : marks

            this.inline([...element.childNodes], inner, into, code)
        }
    }

    /**
     * @param {Text | null} node
     * @param {RichNode[]} marks
     * @param {RichNode[]} into
     * @param {string} [value] for a line break inside code
     * @param {Element} [element]
     */
    text(node, marks, into, value, element) {
        const raw = value ?? node?.data ?? ''
        let text = ''
        let offset = 0

        for (const character of Array.from(raw)) {
            offset += character.length

            if (character === '\uFEFF' || character === '\u200B') continue

            // Editors keep runs of spaces as no-break spaces; the text is the same.
            text += character === '\u00a0' ? ' ' : character

            if (node) this.unit('char', node, offset)
            else if (element) this.unit('char', /** @type {Node} */ (element.parentNode), indexIn(element) + 1)
        }

        if (!text) return

        const previous = into.at(-1)

        if (previous?.type === 'text' && sameMarks(previous.marks ?? [], marks)) {
            previous.text += text

            return
        }

        into.push({ type: 'text', text, ...(marks.length ? { marks } : {}) })
    }

    /**
     * @param {RichNode} node
     * @param {Element} element
     * @param {RichNode[]} into
     */
    embed(node, element, into) {
        this.unit('embed', /** @type {Node} */ (element.parentNode), indexIn(element) + 1)
        into.push(node)
    }
}

/** @param {Node} node */
const indexIn = (node) => Array.prototype.indexOf.call(node.parentNode?.childNodes ?? [], node)

/**
 * @param {RichNode[]} a
 * @param {RichNode[]} b
 */
const sameMarks = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Parses outside the page, so nothing in the HTML loads or runs.
 *
 * @param {string} html
 * @returns {Element}
 */
function parse(html) {
    return new DOMParser().parseFromString(`<!doctype html><body>${html}</body>`, 'text/html').body
}

/**
 * HTML, as the document the rich editor shares.
 *
 * @param {string | Element} html a string, or an editor's content element
 * @returns {RichNode}
 */
export function htmlToDocument(html) {
    const root = typeof html === 'string' ? parse(html) : html
    const content = new Walk(false).blocks(root)

    return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] }
}

/** @param {string} text */
const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** @type {Record<string, string>} */
const MARK_TAGS = { bold: 'strong', italic: 'em', underline: 'u', strike: 's', code: 'code', subscript: 'sub', superscript: 'sup', highlight: 'mark' }

/**
 * @param {RichNode} mark
 * @returns {[string, string]}
 */
function markTags(mark) {
    if (mark.type === 'link') return [`<a href="${escape(String(mark.attrs?.href ?? ''))}">`, '</a>']

    const tag = MARK_TAGS[mark.type] ?? 'span'

    return [`<${tag}>`, `</${tag}>`]
}

/**
 * @param {RichNode[]} nodes
 * @returns {string}
 */
function inlineHtml(nodes) {
    let html = nodes
        .map((node) => {
            let inner = ''

            if (node.type === 'text') inner = escape(node.text ?? '').replace(/ {2}/g, ' \u00a0')
            else if (node.type === 'hardBreak') inner = '<br>'
            else if (node.type === 'image') inner = `<img src="${escape(String(node.attrs?.src ?? ''))}"${node.attrs?.alt ? ` alt="${escape(String(node.attrs.alt))}"` : ''}>`

            for (const mark of [...(node.marks ?? [])].reverse()) {
                const [open, close] = markTags(mark)

                inner = open + inner + close
            }

            return inner
        })
        .join('')

    // Editors drop a space at either end of a line; a no-break space they keep, and it reads back as a space.
    html = html.replace(/^ /, '\u00a0').replace(/ $/, '\u00a0')

    // A last line break needs a second to show; reading drops that second one.
    if (nodes.at(-1)?.type === 'hardBreak') html += '<br>'

    return html || '<br>'
}

/**
 * The document the rich editor shares, as HTML for an editor.
 *
 * @param {RichNode} node
 * @returns {string}
 */
export function documentToHtml(node) {
    const children = node.content ?? []
    /** @param {RichNode[]} nodes */
    const all = (nodes) => nodes.map(documentToHtml).join('')
    /** A cell or item holding one paragraph is written as just its text, as editors write it. */
    const flat = (/** @type {RichNode} */ parent) =>
        parent.content?.length === 1 && parent.content[0]?.type === 'paragraph' ? inlineHtml(parent.content[0].content ?? []) : all(parent.content ?? [])

    switch (node.type) {
        case 'doc':
            return all(children)
        case 'paragraph':
            return `<p>${inlineHtml(children)}</p>`
        case 'heading':
            return `<h${node.attrs?.level ?? 2}>${inlineHtml(children)}</h${node.attrs?.level ?? 2}>`
        case 'codeBlock':
            return `<pre>${escape(children.map((child) => child.text ?? '').join(''))}</pre>`
        case 'blockquote':
            return `<blockquote>${all(children)}</blockquote>`
        case 'bulletList':
            return `<ul>${all(children)}</ul>`
        case 'orderedList':
            return `<ol>${all(children)}</ol>`
        case 'listItem':
            return `<li>${flat(node)}</li>`
        case 'horizontalRule':
            return '<hr>'
        case 'table':
            return `<table><tbody>${all(children)}</tbody></table>`
        case 'tableRow':
            return `<tr>${all(children)}</tr>`
        case 'tableCell':
            return `<td>${flat(node)}</td>`
        case 'tableHeader':
            return `<th>${flat(node)}</th>`
        default:
            // Anything else the schema allows is kept as its text.
            return children.length ? `<p>${inlineHtml(children.flatMap((child) => child.content ?? [child]))}</p>` : ''
    }
}

/**
 * The units of an editor's live content, in order.
 *
 * @param {Element} root
 */
export function units(root) {
    const walk = new Walk(true)

    walk.blocks(root)

    // An empty editor still has its one empty paragraph.
    if (!walk.units.length) walk.units.push({ kind: 'block', node: root, offset: 0 })

    return walk.units
}

/**
 * Where a DOM point is, in positions.
 *
 * @param {Element} root the editor's content element
 * @param {Node} node
 * @param {number} offset
 * @returns {number}
 */
export function positionOf(root, node, offset) {
    const list = units(root)
    const range = root.ownerDocument.createRange()
    let position = 0

    for (const unit of list) {
        range.setStart(unit.node, unit.kind === 'block' ? 0 : unit.offset)

        // A block's own start counts once the point is inside it.
        const isBefore = unit.kind === 'block' ? unit.node === node || unit.node.contains(node) || compare(range, node, offset) <= 0 : compare(range, node, offset) <= 0

        if (!isBefore) break

        position++
    }

    return position
}

/**
 * @param {Range} range starting at the unit
 * @param {Node} node
 * @param {number} offset
 * @returns {number} below zero when the unit is before the point
 */
function compare(range, node, offset) {
    try {
        return -range.comparePoint(node, offset)
    } catch {
        return 1
    }
}

/**
 * The DOM point at a position, for putting a caret there.
 *
 * @param {Element} root
 * @param {number} position
 * @returns {{node: Node, offset: number}}
 */
export function pointAt(root, position) {
    const list = units(root)
    const unit = list[Math.max(0, Math.min(position, list.length) - 1)]

    if (!unit) return { node: root, offset: 0 }

    if (unit.kind === 'block') {
        // Just inside the block, before its first character.
        const first = firstTextIn(unit.node)

        return first ? { node: first, offset: 0 } : { node: unit.node, offset: 0 }
    }

    return { node: unit.node, offset: unit.offset }
}

/** @param {Node} node */
function firstTextIn(node) {
    const walker = node.ownerDocument?.createTreeWalker(node, 4)

    return walker?.nextNode() ?? null
}

/**
 * Where a caret at a position is drawn, in this page's coordinates.
 *
 * @param {Element} root
 * @param {number} position
 * @returns {DOMRect | null}
 */
export function caretRectAt(root, position) {
    const { node, offset } = pointAt(root, position)
    const range = root.ownerDocument.createRange()

    try {
        range.setStart(node, offset)
        range.collapse(true)
    } catch {
        return null
    }

    /** @type {DOMRect | null} */
    let rect = range.getClientRects()[0] ?? null

    if (!rect || (!rect.height && !rect.width)) {
        const element = isElement(node) ? /** @type {Element} */ (node) : node.parentElement
        const box = element?.getBoundingClientRect()

        rect = box ? new DOMRect(box.left, box.top, 0, Math.min(box.height, 24) || 18) : null
    }

    if (!rect) return null

    // Inside an iframe, such as TinyMCE's: move to the page's coordinates.
    const frame = root.ownerDocument.defaultView?.frameElement
    const shift = frame ? frame.getBoundingClientRect() : { left: 0, top: 0 }

    return new DOMRect(rect.left + shift.left, rect.top + shift.top, 2, rect.height)
}

/**
 * The selection inside an editor's content, in positions.
 *
 * @param {Element} root
 * @param {Selection | null} selection
 * @returns {{anchor: number, head: number} | null}
 */
export function selectionIn(root, selection) {
    if (!selection?.anchorNode || !selection.focusNode || !root.contains(selection.anchorNode)) return null

    return {
        anchor: positionOf(root, selection.anchorNode, selection.anchorOffset),
        head: positionOf(root, selection.focusNode, selection.focusOffset),
    }
}

/**
 * Puts the DOM selection at these positions.
 *
 * @param {Element} root
 * @param {{anchor: number, head: number}} positions
 * @returns {Range | null} the range, for editors that take one
 */
export function select(root, { anchor, head }) {
    const selection = root.ownerDocument.getSelection()
    const from = pointAt(root, anchor)
    const to = pointAt(root, head)

    try {
        selection?.setBaseAndExtent(from.node, from.offset, to.node, to.offset)
    } catch {
        return null
    }

    return selection?.rangeCount ? selection.getRangeAt(0) : null
}
