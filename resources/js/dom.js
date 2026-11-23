/** The only place that knows how Filament and Livewire mark up a form. */

/**
 * @typedef {object} ElementAttributes
 * @property {string | number | null} [text]
 * @property {Record<string, string>} [style]
 * @property {Record<string, EventListener>} [on]
 */

/**
 * @param {string} tag
 * @param {ElementAttributes & Record<string, any>} attributes
 * @param {Array<Node | string | null | undefined | false>} children
 * @returns {HTMLElement}
 */
export function element(tag, attributes = {}, children = []) {
    const node = document.createElement(tag)

    for (const [name, value] of Object.entries(attributes)) {
        if (value === null || value === undefined || value === false) continue

        if (name === 'text') node.textContent = String(value)
        else if (name === 'style') for (const [key, item] of Object.entries(value)) node.style.setProperty(key, item)
        else if (name === 'on') for (const [event, handler] of Object.entries(value)) node.addEventListener(event, handler)
        else node.setAttribute(name, value === true ? '' : String(value))
    }

    node.append(.../** @type {Array<Node | string>} */ (children.filter(Boolean)))

    return node
}

/** @type {(template: string | null | undefined, replacements?: Record<string, string | number>) => string} */
export const translate = (template, replacements = {}) =>
    Object.entries(replacements).reduce(
        (text, [key, value]) => text.replace(`:${key}`, () => String(value)),
        String(template ?? ''),
    )

/**
 * Livewire proxies in, plain JSON out.
 *
 * @type {(value: any) => any}
 */
export const plain = (value) => (value === undefined ? null : JSON.parse(JSON.stringify(value)))

/**
 * The state path an input is bound to, as in `data.title`.
 *
 * @param {Element} node
 */
export function modelOf(node) {
    const name = node.getAttributeNames().find((attribute) => attribute === 'wire:model' || attribute.startsWith('wire:model.'))

    return name ? node.getAttribute(name) : null
}

/**
 * Finds a room's fields, on the page or in the modal it belongs to.
 */
export class FormDom {
    /** @param {import('./room/room.js').Room} room */
    constructor(room) {
        this.room = room
        /** @type {Map<string, HTMLInputElement | HTMLTextAreaElement> | null} */
        this.models = null
        /** @type {Map<string, Element>} */
        this.wrappers = new Map()
    }

    forget() {
        this.models = null
        this.wrappers = new Map()
    }

    get modal() {
        return this.room.config.statePath === 'data' ? null : this.room.el.closest('.fi-modal')
    }

    /** @returns {Element} */
    get root() {
        return this.modal ?? this.room.component ?? document.body
    }

    /**
     * A page's room ignores the modals that happen to be inside it.
     *
     * @param {Element} node
     */
    belongs(node) {
        return this.modal ? this.modal.contains(node) : !node.closest('.fi-modal')
    }

    /** @param {string} field */
    model(field) {
        if (!this.models) {
            this.models = new Map()

            for (const input of this.root.querySelectorAll(/** @type {'input'} */ ('input, textarea'))) {
                const path = modelOf(input)

                if (path && !this.models.has(path) && this.belongs(input)) this.models.set(path, input)
            }
        }

        return this.models.get(`${this.room.config.statePath}.${field}`) ?? null
    }

    /** @param {string} field */
    richEditor(field) {
        const statePath = `statePath: '${this.room.config.statePath}.${field}'`

        for (const root of this.root.querySelectorAll('[data-rich-editor-key], [x-data*="richEditorFormComponent"]')) {
            if (root.getAttribute('x-data')?.includes(statePath) && this.belongs(root)) return root
        }

        return null
    }

    /** @param {string} field */
    wrapper(field) {
        const known = this.wrappers.get(field)

        if (known?.isConnected) return known

        const suffix = CSS.escape(`.${field}`)
        const label = CSS.escape(`.${field}-label`)
        const candidates = this.root.querySelectorAll(`label[for$="${suffix}"], [id$="${suffix}"], [id$="${label}"]`)
        const found = [...candidates].find((node) => this.belongs(node)) ?? this.model(field)
        const wrapper = found?.closest('[data-field-wrapper]') ?? null

        if (wrapper) this.wrappers.set(field, wrapper)

        return wrapper
    }

    /** @param {EventTarget | null} target */
    fieldContaining(target) {
        if (!(target instanceof Element)) return null

        const wrapper = target.closest('[data-field-wrapper]')

        if (!wrapper || !this.belongs(wrapper)) return null

        return Object.keys(this.room.config.labels).find((field) => this.wrapper(field)?.contains(target)) ?? null
    }
}
