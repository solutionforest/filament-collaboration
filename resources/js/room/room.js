import { AdapterBinding } from '../bindings/adapter.js'
import { bindings as bindingTypes } from '../bindings/index.js'
import { Document } from '../crdt/document.js'
import { FormDom, plain } from '../dom.js'
import { reveal } from '../ui/containers.js'
import { FieldLocks } from '../ui/field-locks.js'
import { Overlay } from '../ui/overlay.js'
import { PresenceBar } from '../ui/presence-bar.js'
import { Outbox } from './outbox.js'
import { Presence } from './presence.js'
import { Realtime } from './realtime.js'
import { Recovery } from './recovery.js'
import { HttpTransport } from './transport.js'

const IDLE_AFTER = 120_000
const NOTICE_FOR = 5000
const REPORTS_PER_SYNC = 3
const REPORT_BYTES = 16_000

/** @typedef {ReturnType<typeof setTimeout>} Timer */

/**
 * What the sync endpoint answers.
 *
 * @typedef {object} SyncResponse
 * @property {boolean | null} resumed
 * @property {number} epoch
 * @property {number} sequence
 * @property {DocumentState | null} state
 * @property {number} acknowledged
 * @property {Operation[]} operations
 * @property {string[]} dirty
 * @property {string | null} revision
 * @property {{version: number, name: string | null, own: boolean}} saved
 * @property {string | null} presence
 * @property {Person[] | null} people
 * @property {number} total
 * @property {number} [relations] raised whenever somebody changes related records in a relation manager
 */

/** @type {(milliseconds: number) => Promise<void>} */
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

/** One collaboration room in this tab. */
export class Room {
    /** @type {Timer | null} */
    timer = null
    dueAt = 0
    /** @type {Timer | undefined} */
    pullTimer
    /** @type {Timer | undefined} */
    noticeTimer
    /** @type {Timer | undefined} */
    renderTimer
    syncing = false
    /** @type {string | null} the person this page keeps going to, as they move from field to field */
    following = null
    /** @type {number | null} the relation version this page's relation managers show */
    relations = null
    /** @type {string | null} */
    followedField = null
    /** The `data-collaboration` this room last checked, and whether it named another draft. */
    source = ''
    stale = false
    /** @type {AbortController | undefined} */
    events
    /** @type {string | undefined} what `collaborationSync` was last set to */
    published

    /**
     * @param {HTMLElement} el
     * @param {RoomConfig} config
     * @param {{name?: string, send: HttpTransport['send']}} transport
     */
    constructor(el, config, transport = new HttpTransport()) {
        this.el = el
        this.config = config
        this.transport = transport

        /** @type {Document | null} */
        this.document = null
        this.outbox = new Outbox()
        this.presence = new Presence()
        this.recovery = new Recovery(config.canPull ? config.storageKey : null)
        this.realtime = new Realtime(this)
        /** @type {Map<string, import('../bindings/binding.js').Binding>} */
        this.bindings = new Map()
        /** @type {Set<string>} fields that are live right now */
        this.bound = new Set()
        /** @type {Set<string>} fields whose binding gave up */
        this.failed = new Set()
        /** @type {Array<{field: string, error: string, at: string}>} */
        this.problems = []
        /** @type {Array<Record<string, unknown>>} waiting to be sent to the server */
        this.reports = []
        /** @type {string | null} */
        this.lastKey = null

        this.epoch = 0
        this.sequence = -1
        this.fieldsVersion = 0
        /** @type {string | null} */
        this.revision = null
        /** @type {number | null} */
        this.version = null
        /** @type {string[]} */
        this.dirty = []
        /** @type {{text?: string, name?: string, pull?: boolean} | null} */
        this.notice = null
        this.status = 'connecting'
        /** @type {string | null} the field with this user's caret */
        this.field = null
        /** @type {{name: string | null, restorable: boolean, copied?: boolean} | null} set once the record is deleted */
        this.deleted = null
        this.lastActive = Date.now()
        this.failures = 0
        this.roundTrip = 0
        this.stopped = false
        this.destroyed = false

        this.component = el.closest('[wire\\:id]')
        this.wire = this.component ? window.Livewire?.find(this.component.getAttribute('wire:id')) : null

        // The form as first rendered, to recognise typing from before we connected.
        this.initial = plain(this.wire?.$get(config.statePath, false) ?? {})

        this.dom = new FormDom(this)
        this.bar = new PresenceBar(this)
        this.overlay = new Overlay(this)
        this.locks = new FieldLocks(this)

        this.listen()
        this.bar.render()
        this.syncSoon(0)
    }

    get isLive() {
        return Object.keys(this.config.fields).length > 0
    }

    /** @param {string} field */
    initialValue(field) {
        return field.split('.').reduce((/** @type {any} */ value, key) => value?.[key], this.initial) ?? null
    }

    listen() {
        this.events = new AbortController()

        const { signal } = this.events

        document.addEventListener(
            'focusin',
            (event) => {
                const field = this.dom.fieldContaining(event.target)

                if (!field || field === this.field) return

                this.field = field
                this.cursorMoved()
            },
            { signal, capture: true },
        )

        // Doing something yourself stops following somebody else. On click, not
        // pointerdown: the notice going away must not move what is being clicked.
        for (const name of ['click', 'keydown']) {
            document.addEventListener(
                name,
                (event) => {
                    if (this.following && event.isTrusted && event.target instanceof Node && this.form()?.contains(event.target)) this.follow(null)
                },
                { signal, capture: true },
            )
        }

        // Capture runs before Livewire, so Save always carries the latest edit.
        for (const name of ['click', 'submit', 'change', 'keydown']) {
            document.addEventListener(
                name,
                (event) => {
                    if (event instanceof KeyboardEvent) this.lastKey = [event.ctrlKey && 'Control', event.metaKey && 'Meta', event.altKey && 'Alt', event.shiftKey && 'Shift', event.key].filter(Boolean).join('+')

                    this.active()
                    this.collect()
                },
                { signal, capture: true },
            )
        }

        // Inputs inside repeater items have no binding of their own.
        document.addEventListener('input', () => queueMicrotask(() => this.collect()), { signal, capture: true })

        document.addEventListener(
            'visibilitychange',
            () => {
                if (document.hidden) return

                this.active()
                this.syncSoon(0)
            },
            { signal },
        )

        window.addEventListener('online', () => this.syncSoon(0), { signal })
        window.addEventListener('pagehide', () => this.leave(), { signal })
        window.addEventListener(
            'pageshow',
            (event) => {
                if (event.persisted) this.syncSoon(0)
            },
            { signal },
        )
        window.addEventListener(
            'beforeunload',
            (event) => {
                // Anything sent survives leaving: it is in the shared draft.
                if (this.outbox.isEmpty || !['offline', 'denied'].includes(this.status)) return

                event.preventDefault()
                event.returnValue = ''
            },
            { signal },
        )
    }

    /**
     * Called with the element's latest config, as every Livewire render issues a new token.
     *
     * @param {HTMLElement} el
     * @param {RoomConfig} config
     */
    update(el, config) {
        const fieldsChanged = JSON.stringify(this.config.fields) !== JSON.stringify(config.fields)

        this.el = el
        this.config = config

        if (fieldsChanged) {
            for (const [field, binding] of this.bindings) {
                if (config.fields[field]) continue

                binding.detach()
                this.bindings.delete(field)
                this.bound.delete(field)
            }

            this.sequence = -1
            this.fieldsVersion++
            this.syncSoon(0)
        }
    }

    tick() {
        this.dom.forget()
        this.bind()
        this.collect()
        this.bar.render()
        this.overlay.schedule()
        this.locks.update()
    }

    bind() {
        if (!this.document || !this.wire || this.stopped) return

        let changed = false

        for (const [field, kind] of Object.entries(this.config.fields)) {
            if (this.failed.has(field) || this.document.kind(field) !== kind || !bindingTypes[kind]) continue

            const Type = this.config.adapters?.[field] ? AdapterBinding : bindingTypes[kind]
            const binding = this.bindings.get(field) ?? new Type(this, field)

            this.bindings.set(field, binding)

            const attached = binding.attach()

            if (attached === this.bound.has(field) || this.failed.has(field)) continue

            if (attached) this.bound.add(field)
            else this.bound.delete(field)

            changed = true
        }

        if (changed) this.publish()
    }

    collect() {
        if (this.stopped || !this.document || this.isStale()) return

        this.bindings.forEach((binding) => binding.collect())
    }

    /**
     * The page moved to another draft, such as another language, and its
     * form already holds that draft's values: they must not reach this one.
     */
    isStale() {
        const source = this.el.dataset.collaboration ?? ''

        if (source === this.source) return this.stale

        this.source = source

        try {
            this.stale = JSON.parse(source).draft !== this.config.draft
        } catch {
            this.stale = false
        }

        return this.stale
    }

    /**
     * Records a local edit and sends it soon.
     *
     * @param {string} field
     * @param {any} value the field's whole new value
     * @param {any} caret see `Document.changes()`
     */
    change(field, value, caret = null) {
        if (this.stopped || !this.document || this.isStale()) return

        const operations = this.document.changes(field, value, this.config.client, caret)

        if (!operations.length) return

        this.document.apply(operations)
        this.outbox.push(operations)
        this.field = field
        this.active()
        this.setStatus('syncing')
        this.publish()
        // Sending does not wait for the heartbeat. With pushes, others see it as soon as it is sent.
        this.syncSoon(this.realtime.isConnected ? 30 : Math.max(100, this.pollingInterval() / 3))
        this.overlay.schedule()
    }

    /**
     * Gives Livewire what Save needs to merge, without a request. If a save
     * arrives before the next sync, nothing typed is missing from it.
     */
    publish() {
        if (!this.config.canPull || !this.wire) return

        this.recovery.store(this.config.token, this.epoch, this.outbox.batches)

        const value = this.stopped
            ? ''
            : JSON.stringify({ epoch: this.epoch, fields: [...this.bound], batches: this.outbox.batches })

        if (value === this.published) return

        this.published = value
        this.wire.$set('collaborationSync', value, false)
    }

    cursorMoved() {
        this.active()
        this.syncSoon(this.realtime.isConnected ? 60 : Math.max(150, this.pollingInterval() / 2))
    }

    active() {
        this.lastActive = Date.now()
    }

    isIdle() {
        return document.hidden || Date.now() - this.lastActive > IDLE_AFTER
    }

    interval() {
        // Pushed changes arrive at once, so polling is only a heartbeat and a safety net.
        return this.realtime.isConnected ? 8000 : this.pollingInterval()
    }

    /** How often to sync with nothing pushing changes. */
    pollingInterval() {
        const base = this.config.interval

        if (document.hidden) return 5000
        if (!this.isLive) return Math.max(base, 2000)

        const others = this.presence.activeCount

        // Alone there is nothing to receive, so ask less often.
        if (!others) return this.outbox.isEmpty ? Math.max(base, 1500) : base

        // A hundred editors sync every 1.3 seconds instead of multiplying the load.
        const crowd = base * Math.max(1, Math.sqrt(others / 10))

        return this.isIdle() ? Math.max(crowd, 2000) : crowd
    }

    /**
     * A change pushed by the server. Operations that follow on from what this
     * tab has are applied directly; anything else is fetched.
     *
     * @param {Record<string, any>} payload
     */
    pushed(payload = {}) {
        if (this.destroyed) return

        if (payload.operations && this.document && !this.stopped) {
            const isNext = payload.epoch === this.epoch && payload.from === this.sequence && this.sequence >= 0
            const isBusy = this.syncing || [...this.bindings.values()].some((binding) => binding.isBusy)

            if (isNext && !isBusy) {
                this.merge(payload.operations)
                this.sequence = payload.to
                this.dirty = payload.dirty
                this.bar.render()
            } else if (payload.to > this.sequence || payload.epoch !== this.epoch) {
                this.syncSoon(isBusy ? 80 : 30)
            }
        }

        if (payload.person) {
            this.presence.move(payload.person)
            this.locks.update()
            this.followUp()
        }
        // Permissions changed: the next sync gets a 410 and the page renders a new token.
        if (typeof payload.relations === 'number') this.relationsChanged(payload.relations)
        if (payload.sync || payload.refresh) this.syncSoon(30)

        // A crowd coming and going is fetched a little less eagerly.
        if (payload.people) this.syncSoon(Math.min(1500, Math.max(50, 10 * this.presence.activeCount)))

        this.overlay.schedule()
    }

    realtimeChanged() {
        if (this.destroyed) return

        this.syncSoon(this.realtime.isConnected ? 0 : Math.min(this.interval(), 400))
    }

    syncSoon(delay = this.interval()) {
        if (this.destroyed || this.status === 'denied' || this.status === 'deleted') return

        const at = Date.now() + delay

        if (this.timer && this.dueAt <= at) return

        clearTimeout(this.timer ?? undefined)
        this.dueAt = at
        this.timer = setTimeout(() => {
            this.timer = null
            this.sync()
        }, delay)
    }

    async sync() {
        if (this.destroyed || this.syncing) return

        this.syncing = true
        this.collect()

        const batches = this.stopped ? [] : this.outbox.next()
        const binding = this.stopped || !this.field ? null : this.bindings.get(this.field)
        const resume = this.stopped ? null : this.recovery.next()
        const request = {
            token: this.config.token,
            epoch: this.epoch,
            since: this.sequence,
            presence: this.presence.etag,
            field: this.field,
            cursor: binding?.cursor() ?? null,
            idle: this.isIdle(),
            batches,
            resume,
            problems: this.reports.splice(0, REPORTS_PER_SYNC),
        }
        const started = performance.now()
        const fieldsVersion = this.fieldsVersion

        let delay = null

        try {
            const response = await this.transport.send(this.config, request)

            this.roundTrip = Math.round(performance.now() - started)

            // Never replace text under an unfinished IME composition.
            while (!this.destroyed && [...this.bindings.values()].some((item) => item.isBusy)) await wait(80)

            if (this.destroyed) return

            this.failures = 0

            if (!this.recovery.receive(resume, response.resumed)) {
                this.notice = { text: this.config.strings.not_recovered }
            }

            this.receive(response, batches.at(-1)?.n ?? 0, fieldsVersion)
            this.realtime.connect()
        } catch (error) {
            delay = this.handleFailure(error, batches)
        } finally {
            this.syncing = false
            this.bar.render()
            this.overlay.schedule()

            if (delay !== null) {
                clearTimeout(this.timer ?? undefined)
                this.timer = null
            }

            this.syncSoon(delay ?? (this.outbox.isEmpty && this.recovery.isEmpty ? this.interval() : Math.min(150, this.interval())))
        }
    }

    /**
     * @param {SyncResponse} response
     * @param {number} sent the last batch number sent
     * @param {number} fieldsVersion
     */
    receive(response, sent, fieldsVersion) {
        this.outbox.acknowledge(sent)

        if (!this.stopped) {
            if (response.state) this.restart({ ...response, state: response.state })
            else if (response.operations.length) this.merge(response.operations)

            this.epoch = response.epoch

            // The fields changed while this was in flight, so it answers for the old ones.
            if (fieldsVersion === this.fieldsVersion) this.sequence = response.sequence

            this.bind()
            this.publish()
        }

        this.presence.receive(response)
        this.locks.update()
        this.followUp()
        this.dirty = response.dirty
        this.noticeRevision(response)
        if (typeof response.relations === 'number') this.relationsChanged(response.relations)

        this.setStatus(this.stopped ? 'stopped' : this.outbox.isEmpty ? 'synced' : 'syncing')
    }

    /**
     * Remote changes: collect ours, remember the caret, apply, repaint.
     *
     * @param {Operation[]} operations
     */
    merge(operations) {
        if (!this.document) return

        this.collect()

        const touched = [...new Set(operations.map((operation) => operation.f))].flatMap((field) => this.bindings.get(field) ?? [])

        touched.forEach((binding) => binding.capture())
        this.document.apply(operations)
        touched.forEach((binding) => binding.render())
    }

    /**
     * The whole draft, sent when this tab is too far behind or the draft restarted.
     *
     * @param {{state: DocumentState, epoch: number, acknowledged: number}} response
     */
    restart({ state, epoch, acknowledged }) {
        this.collect()

        if (this.document && epoch !== this.epoch) {
            if (!this.outbox.isEmpty) {
                this.stop()

                return
            }

            this.outbox.reset()
        }

        this.outbox.acknowledge(acknowledged)
        this.bindings.forEach((binding, field) => {
            if (this.document?.kind(field)) binding.capture()
        })

        const document = new Document(state)

        this.document = document

        for (const { ops } of this.outbox.batches) document.apply(ops)

        this.epoch = epoch

        this.bindings.forEach((binding, field) => {
            if (document.kind(field)) {
                binding.render()

                return
            }

            binding.detach()
            this.bindings.delete(field)
            this.bound.delete(field)
        })
    }

    /** @param {Pick<SyncResponse, 'revision' | 'saved'>} response */
    noticeRevision({ revision, saved }) {
        if (!revision) return

        const changed = this.revision !== null && revision !== this.revision
        const savedAgain = this.version !== null && saved.version !== this.version

        this.revision = revision
        this.version = saved.version

        if (!changed || (savedAgain && saved.own)) return

        if (this.config.mode === 'viewing') {
            this.wire?.$refresh()
        } else if (!this.config.canPull) {
            return
        } else if (this.isLive) {
            // Everybody hears of a save at once; do not all pull at once.
            clearTimeout(this.pullTimer)
            this.pullTimer = setTimeout(() => this.pull(), 300 + Math.random() * this.presence.activeCount * 100)
        } else {
            this.notice = { name: saved.name ?? '', pull: true }

            return
        }

        if (savedAgain && saved.name) {
            this.notice = { name: saved.name, pull: false }

            clearTimeout(this.noticeTimer)
            this.noticeTimer = setTimeout(() => {
                this.notice = null
                this.bar.render()
            }, NOTICE_FOR)
        }
    }

    /**
     * @param {any} error a `SyncError`, or a network error
     * @param {Batch[]} batches what the failed request carried
     * @returns {number | null} when to try again, or null to stop
     */
    handleFailure(error, batches) {
        const { status } = error

        if (status === 410 && this.wire) {
            // An expired token: rendering again rechecks permissions and issues another.
            this.wire.$refresh()

            return 1500
        }

        if (status === 404 && error.code === 'deleted') {
            this.recordDeleted({ name: error.body?.name ?? null, restorable: error.body?.restorable === true })

            return null
        }

        // Only our own refusal is final. A proxy's or a deploy's 403 or 404 is worth retrying.
        if ((status === 403 && error.code === 'forbidden') || (status === 404 && error.code === 'not_found')) {
            this.stop('denied')

            return null
        }

        if ((status === 409 || status === 413) && batches.length) {
            this.stop()

            return 2000
        }

        this.setStatus('offline')

        return Math.min(15000, (status === 429 ? 3000 : 1000) * 2 ** Math.min(4, this.failures++))
    }

    /** Live editing cannot continue. The form keeps its content and merges on save. */
    stop(status = 'stopped') {
        this.stopped = true
        this.bindings.forEach((binding) => binding.detach())
        this.bindings.clear()
        this.bound.clear()
        this.outbox.reset()
        this.publish()
        this.setStatus(status)
    }

    /**
     * Somebody deleted the record. The form stays, read-only, so nothing
     * typed is lost: it can be copied, or the record restored if it can be.
     *
     * @param {{name: string | null, restorable: boolean}} deleted
     */
    recordDeleted(deleted) {
        this.deleted = deleted
        this.stop('deleted')
        this.form()?.setAttribute('inert', '')
        this.overlay.schedule()
    }

    /** The form this room edits. */
    form() {
        return this.dom.root.querySelector('form')
    }

    /** Copies every field's current value, as plain text with its label. */
    async copyText() {
        const { statePath, fields, labels } = this.config
        const text = Object.keys(fields)
            .map((field) => {
                const value = plainText(this.wire?.$get(`${statePath}.${field}`, false))

                return value ? `${labels[field] ?? field}\n${value}` : ''
            })
            .filter(Boolean)
            .join('\n\n')

        await navigator.clipboard.writeText(text)

        if (this.deleted) this.deleted.copied = true

        this.bar.render()
    }

    /** Restores a soft-deleted record, then shows it again. */
    async restore() {
        const answer = await this.transport.send(this.config, { token: this.config.token, restore: true }).catch(() => null)

        if (answer?.restored) window.location.reload()
    }

    /** @param {string} field */
    bindingFailed(field) {
        this.failed.add(field)
        this.bound.delete(field)
        this.publish()
    }

    /**
     * A binding recovered from an editor error. Listeners can forward it, for
     * example to Sentry; the server logs it when `reportEditorErrors()` is on.
     */
    /**
     * @param {string} field
     * @param {any} error
     * @param {{key?: string | null, selection?: unknown, doc?: unknown}} details
     */
    reportProblem(field, error, details = {}) {
        const problem = { field, error: `${error?.name ?? 'Error'}: ${error?.message ?? error}`, at: new Date().toISOString() }

        this.problems = [...this.problems, problem].slice(-20)
        console.warn(`[filament-collaboration] "${field}" recovered from an error.`, error)
        window.dispatchEvent(new CustomEvent('filament-collaboration:recovered', { detail: { ...problem, ...details, room: this.config.id } }))

        if (this.config.reportErrors && this.reports.length < 10) {
            /** @type {Record<string, unknown>} */
            let report = { ...problem, ...details }

            if (JSON.stringify(report).length > REPORT_BYTES) report = { ...problem, key: details.key, selection: details.selection }

            this.reports.push(report)
            this.syncSoon(0)
        }
    }

    /** @param {string} status */
    setStatus(status) {
        if (this.status === status) return

        this.status = status
        this.bar.render()
    }

    pull(notify = false) {
        if (this.destroyed) return

        if (notify) this.notice = null

        this.wire?.$call('collaborationPull', notify)?.catch?.(() => {})
        this.bar.render()
    }

    discard() {
        this.wire?.mountAction('discardSharedDraft')
    }

    rerenderSoon() {
        clearTimeout(this.renderTimer)
        this.renderTimer = setTimeout(() => this.wire?.$refresh(), 1500)
    }

    /**
     * Somebody changed related records: relation managers that share their
     * changes (`SharesRelationChanges`) render again. Not on the first answer.
     *
     * @param {number} version
     */
    relationsChanged(version) {
        const known = this.relations

        this.relations = Math.max(known ?? 0, version)

        if (known !== null && version > known) window.Livewire?.dispatch('filament-collaboration-relations-changed')
    }

    /**
     * Keeps going to this person's field as they move, until they leave or
     * this page's user does something in the form. Null stops.
     *
     * @param {Person | null} person
     */
    follow(person) {
        this.following = person && !person.self ? person.key : null
        this.followedField = null
        this.followUp()
        this.bar.render()
    }

    followUp() {
        if (!this.following) return

        const tabs = this.presence.people.filter((person) => person.key === this.following && !person.self)

        if (!tabs.length) return this.follow(null)

        const person = tabs.find((tab) => tab.field && !tab.idle) ?? tabs.find((tab) => tab.field)

        if (!person?.field || person.field === this.followedField) return

        this.followedField = person.field
        this.jumpTo(person)
    }

    /** @param {Person} person */
    jumpTo(person) {
        const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

        const wrapper = person.field ? this.dom.wrapper(person.field) : null

        if (!wrapper) return

        // Open the tab, step or section it is in first, and scroll once it has been laid out.
        if (reveal(wrapper, this.dom.root)) requestAnimationFrame(() => requestAnimationFrame(() => wrapper.scrollIntoView({ block: 'center', behavior })))
        else wrapper.scrollIntoView({ block: 'center', behavior })
    }

    inspect() {
        return {
            summary: {
                Room: this.config.id,
                Mode: this.config.mode,
                Status: this.status,
                'Round trip': `${this.roundTrip} ms`,
                'Sync every': `${Math.round(this.interval())} ms`,
                Transport: `${this.transport.name ?? 'custom'}${this.realtime.isConnected ? ' + WebSocket push' : this.config.channel ? ' (WebSocket not connected)' : ''}`,
                Sequence: `${this.sequence} (epoch ${this.epoch})`,
                Clock: this.document?.clock ?? 0,
                'Waiting to send': this.outbox.batches.length,
                'Unsaved fields': this.dirty.length,
                'People here': this.presence.total,
                'Recovered errors': this.problems.length,
            },
            fields: Object.entries(this.config.fields).map(([field, kind]) => [
                field,
                kind,
                this.bound.has(field) ? (this.dirty.includes(field) ? 'live, unsaved' : 'live') : this.failed.has(field) ? 'merge on save (not live here)' : 'merge on save',
            ]),
            people: this.presence.users().map((person) => [person.name, person.mode, person.field ?? '—']),
            problems: this.problems.map(({ field, error, at }) => [new Date(at).toLocaleTimeString(), field, error]),
        }
    }

    leave() {
        // `keepalive` bodies are limited to 64 KiB.
        let batches = this.stopped ? [] : this.outbox.next()

        if (JSON.stringify(batches).length > 15000) batches = []

        this.transport
            .send(this.config, { token: this.config.token, epoch: this.epoch, batches, leave: true }, { keepalive: true })
            .catch(() => {})
    }

    destroy() {
        this.leave()
        this.destroyed = true
        this.events?.abort()

        for (const timer of [this.timer, this.pullTimer, this.noticeTimer, this.renderTimer]) clearTimeout(timer ?? undefined)

        this.bindings.forEach((binding) => binding.detach())
        this.realtime.destroy()
        this.bar.destroy()
        this.overlay.destroy()
        this.locks.destroy()
    }
}

/**
 * A field's value as text a person can paste: rich content as its words,
 * lists as their values.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function plainText(value) {
    if (value === null || value === undefined) return ''
    if (typeof value !== 'object') return String(value)
    if (Array.isArray(value)) return value.map(plainText).filter(Boolean).join(', ')

    const node = /** @type {Partial<RichNode>} */ (value)

    if (typeof node.type === 'string' && (Array.isArray(node.content) || typeof node.text === 'string')) {
        if (typeof node.text === 'string') return node.text

        const separator = ['doc', 'bulletList', 'orderedList', 'blockquote'].includes(node.type) ? '\n' : ''

        return (node.content ?? []).map(plainText).join(separator)
    }

    return Object.values(value).map(plainText).filter(Boolean).join('\n')
}
