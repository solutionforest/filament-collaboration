import { element, translate } from '../dom.js'
import { avatar } from './avatar.js'

const PANEL_LIMIT = 100

/** The avatar stack and sync status in the page header. */
export class PresenceBar {
    /** @type {HTMLElement | null} */
    host = null

    /** @param {import('../room/room.js').Room} room */
    constructor(room) {
        this.room = room
        this.open = false
        this.signature = ''
        this.events = new AbortController()

        const { signal } = this.events

        document.addEventListener(
            'pointerdown',
            (event) => {
                if (this.open && !(event.target instanceof Node && this.host?.contains(event.target))) this.toggle(false)
            },
            { signal, capture: true },
        )
        document.addEventListener(
            'keydown',
            (event) => {
                if (!this.open || event.key !== 'Escape') return

                this.toggle(false)
                this.host?.querySelector(/** @type {'button'} */ ('[data-collaboration-people]'))?.focus()
            },
            { signal },
        )
    }

    toggle(open = !this.open) {
        this.open = open
        this.render()
    }

    render() {
        const host = this.room.el.querySelector(/** @type {'div'} */ ('[data-collaboration-presence]'))

        if (!host) return

        const people = this.room.presence.users()
        const signature = JSON.stringify([
            this.open,
            this.room.status,
            this.room.dirty,
            this.room.notice,
            this.room.presence.total,
            this.room.config.labels,
            people,
        ])

        if (host === this.host && signature === this.signature && host.childElementCount) return

        this.host = host
        this.signature = signature

        const active = document.activeElement
        const focused = active instanceof HTMLElement && host.contains(active) ? active.dataset.key : null
        const scrolled = host.querySelector('.fi-collab-panel-list')?.scrollTop ?? 0

        host.replaceChildren(
            ...[this.notice(), this.stack(people), this.status(), this.open ? this.panel(people) : null].flatMap((node) => node ?? []),
        )

        const list = host.querySelector('.fi-collab-panel-list')

        if (list) list.scrollTop = scrolled
        if (focused) [...host.querySelectorAll(/** @type {'button'} */ ('[data-key]'))].find((node) => node.dataset.key === focused)?.focus()
    }

    /** @param {Person[]} people */
    stack(people) {
        const others = people.filter((person) => !person.self)

        if (!others.length) return null

        const limit = this.room.config.avatarLimit
        const hidden = this.room.presence.total - Math.min(limit, others.length)

        const children = others.slice(0, limit).map((person) => avatar(person))

        if (hidden > 0) children.push(element('span', { class: 'fi-collab-avatar fi-collab-avatar-more', text: `+${hidden}` }))

        return element(
            'button',
            {
                type: 'button',
                class: 'fi-collab-stack',
                'data-collaboration-people': true,
                'data-key': 'people',
                'aria-expanded': String(this.open),
                'aria-label': `${this.room.config.strings.people}: ${others.slice(0, 12).map((person) => person.name).join(', ')}`,
                on: { click: () => this.toggle() },
            },
            children,
        )
    }

    status() {
        const { status, dirty, config } = this.room
        const failing = ['offline', 'stopped', 'denied', 'deleted'].includes(status)

        if (!this.room.isLive && !failing) return null

        const shown = status === 'synced' && dirty.length ? 'unsaved' : status

        return element(
            'button',
            {
                type: 'button',
                class: 'fi-collab-status',
                'data-status': shown,
                'data-key': 'status',
                'aria-expanded': String(this.open),
                title: config.strings[shown],
                on: { click: () => this.toggle() },
            },
            [
                element('span', { class: 'fi-collab-status-dot', 'aria-hidden': 'true' }),
                element('span', { class: 'fi-collab-status-text', role: 'status', text: config.strings[shown] }),
            ],
        )
    }

    notice() {
        const { notice, config, deleted } = this.room

        if (deleted) return this.deletedNotice(deleted)
        if (!notice) return null

        return element('span', { class: 'fi-collab-notice', role: 'status' }, [
            element('span', { text: notice.text ?? translate(config.strings.saved, { name: notice.name ?? '' }) }),
            notice.pull &&
                element('button', {
                    type: 'button',
                    class: 'fi-collab-link',
                    'data-key': 'pull',
                    text: config.strings.pull,
                    on: { click: () => this.room.pull(true) },
                }),
        ])
    }

    /**
     * @param {{name: string | null, restorable: boolean, copied?: boolean}} deleted
     */
    deletedNotice(deleted) {
        const { strings } = this.room.config

        return element('span', { class: 'fi-collab-notice fi-collab-notice-danger', role: 'alert' }, [
            element('span', { text: deleted.name ? translate(strings.deleted_by, { name: deleted.name }) : strings.deleted }),
            element('button', {
                type: 'button',
                class: 'fi-collab-link',
                'data-key': 'copy',
                text: deleted.copied ? strings.copied : strings.copy,
                on: { click: () => this.room.copyText() },
            }),
            deleted.restorable &&
                element('button', {
                    type: 'button',
                    class: 'fi-collab-link',
                    'data-key': 'restore',
                    text: strings.restore,
                    on: { click: () => this.room.restore() },
                }),
        ])
    }

    /** @param {Person[]} people */
    panel(people) {
        const { strings } = this.room.config

        const rows = people.slice(0, PANEL_LIMIT).map((person) => this.person(person))

        if (people.length > PANEL_LIMIT) {
            rows.push(element('p', { class: 'fi-collab-panel-empty', text: translate(strings.more, { count: String(people.length - PANEL_LIMIT) }) }))
        }

        if (!people.length) rows.push(element('p', { class: 'fi-collab-panel-empty', text: strings.alone }))

        const canDiscard = this.room.config.canPull && this.room.dirty.length > 0

        return element('div', { class: 'fi-collab-panel', role: 'dialog', 'aria-label': strings.people }, [
            element('p', { class: 'fi-collab-panel-heading', text: strings.people }),
            element('div', { class: 'fi-collab-panel-list' }, rows),
            canDiscard &&
                element('button', {
                    type: 'button',
                    class: 'fi-collab-discard',
                    'data-key': 'discard',
                    text: strings.discard,
                    on: {
                        click: () => {
                            this.toggle(false)
                            this.room.discard()
                        },
                    },
                }),
        ])
    }

    /** @param {Person} person */
    person(person) {
        const { strings, modes, labels } = this.room.config

        let detail = person.idle ? strings.idle : modes[person.mode]

        if (person.self) detail = strings.you
        else if (person.field && !person.idle) detail = translate(strings.in_field, { field: labels[person.field] || person.field })

        const content = [
            avatar(person),
            element('span', { class: 'fi-collab-person' }, [
                element('span', { class: 'fi-collab-person-name', text: person.name }),
                element('span', { class: 'fi-collab-person-detail', text: detail }),
            ]),
        ]

        if (!person.field) return element('div', { class: 'fi-collab-person-row' }, content)

        return element(
            'button',
            {
                type: 'button',
                class: 'fi-collab-person-row',
                'data-key': `person-${person.key}`,
                title: translate(strings.jump, { name: person.name }),
                on: {
                    click: () => {
                        this.toggle(false)
                        this.room.jumpTo(person)
                    },
                },
            },
            content,
        )
    }

    destroy() {
        this.events.abort()
        this.host?.replaceChildren()
    }
}
