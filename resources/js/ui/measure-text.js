const COPIED = [
    'boxSizing', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'fontVariant', 'fontFeatureSettings', 'fontVariationSettings',
    'lineHeight', 'letterSpacing', 'wordSpacing', 'textAlign', 'textIndent', 'textTransform', 'tabSize', 'direction',
]

let mirror = null

/**
 * Inputs do not report where a character is, so lay the same text out in a
 * hidden copy and measure that.
 */
export function measureText(input, anchor, head) {
    const bounds = input.getBoundingClientRect()

    if (!bounds.width) return null

    if (!mirror?.isConnected) {
        mirror = document.createElement('div')
        mirror.setAttribute('aria-hidden', 'true')
        mirror.setAttribute('data-collaboration-mirror', '')
        document.body.append(mirror)
    }

    const computed = getComputedStyle(input)
    const multiline = input.tagName === 'TEXTAREA'
    const { style } = mirror

    // With reduced motion Filament gives every element a 0.01ms transition, and
    // a transition reports the previous position until the next frame.
    style.setProperty('transition', 'none', 'important')
    style.setProperty('animation', 'none', 'important')
    style.position = 'fixed'
    style.visibility = 'hidden'
    style.pointerEvents = 'none'
    style.margin = '0'
    style.borderStyle = 'solid'

    for (const property of COPIED) style[property] = computed[property]

    const inner =
        input.clientHeight - parseFloat(computed.paddingTop) - parseFloat(computed.paddingBottom)

    if (!multiline) style.lineHeight = `${inner}px`

    const scrollbar = multiline
        ? Math.max(0, input.offsetWidth - input.clientWidth - parseFloat(computed.borderLeftWidth) - parseFloat(computed.borderRightWidth))
        : 0

    style.whiteSpace = multiline ? 'pre-wrap' : 'pre'
    style.overflowWrap = multiline ? 'break-word' : 'normal'
    style.left = `${bounds.left - input.scrollLeft}px`
    style.top = `${bounds.top - input.scrollTop}px`
    style.width = multiline ? `${bounds.width - scrollbar}px` : 'max-content'
    style.minWidth = `${bounds.width - scrollbar}px`

    // The zero-width space gives an empty last line a box to measure.
    mirror.textContent = `${input.value}​`

    const text = mirror.firstChild
    const point = document.createRange()

    point.setStart(text, Math.min(head, text.length - 1))
    point.collapse(true)

    const box = point.getClientRects()[0] ?? point.getBoundingClientRect()
    let selection = []

    if (anchor !== head) {
        const range = document.createRange()

        range.setStart(text, Math.min(anchor, head, text.length - 1))
        range.setEnd(text, Math.min(Math.max(anchor, head), text.length - 1))
        selection = [...range.getClientRects()]
    }

    const caret = new DOMRect(box.left, box.top, 2, box.height)

    mirror.textContent = ''

    return { caret, selection, clip: bounds }
}
