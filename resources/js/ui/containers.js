/**
 * What keeps a field out of sight: a tab that is not selected, a wizard step
 * that is not current, or a collapsed section.
 *
 * @typedef {{header: Element, open(): void}} Container
 */

/**
 * The closed containers around a field, outermost first.
 *
 * @param {Element} wrapper the field's wrapper
 * @param {ParentNode} root where the headers are: the page or the modal
 * @returns {Container[]}
 */
export function closedAround(wrapper, root) {
    /** @type {Container[]} */
    const closed = []

    for (let node = wrapper.parentElement; node && node !== root; node = node.parentElement) {
        if (node.matches('.fi-section.fi-collapsed')) {
            const header = node.querySelector(':scope > .fi-section-header')
            const section = node

            if (header) closed.push({ header, open: () => section.dispatchEvent(new CustomEvent('expand')) })

            continue
        }

        if (node.id && node.matches('[role="tabpanel"], .fi-sc-wizard-step') && !node.getClientRects().length) {
            const header = root.querySelector(`[aria-controls="${CSS.escape(node.id)}"]`)

            if (header instanceof HTMLElement) closed.push({ header, open: () => header.click() })
        }
    }

    return closed.reverse()
}

/**
 * The header to show a hidden field's people on: the outermost closed one,
 * which is the one that can be seen.
 *
 * @param {Element} wrapper
 * @param {ParentNode} root
 * @returns {Element | null}
 */
export function visibleHeader(wrapper, root) {
    return closedAround(wrapper, root).find(({ header }) => header.getClientRects().length)?.header ?? null
}

/**
 * Opens whatever hides a field, outermost first, so it can be scrolled to.
 *
 * @param {Element} wrapper
 * @param {ParentNode} root
 * @returns {boolean} whether anything was opened
 */
export function reveal(wrapper, root) {
    const closed = closedAround(wrapper, root)

    for (const container of closed) container.open()

    return closed.length > 0
}
