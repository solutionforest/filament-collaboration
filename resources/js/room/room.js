import { bindings as bindingTypes } from '../bindings/index.js'
import { Document } from '../crdt/document.js'
import { FormDom, plain } from '../dom.js'
import { Overlay } from '../ui/overlay.js'
import { PresenceBar } from '../ui/presence-bar.js'
import { Outbox } from './outbox.js'
import { Presence } from './presence.js'
import { Recovery } from './recovery.js'
import { HttpTransport } from './transport.js'

const IDLE_AFTER = 120_000
const NOTICE_FOR = 5000

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

/** One collaboration room in this tab. */
export class Room {
    constructor(el, config, transport = new HttpTransport()) {
        this.el = el
        this.config = config
        this.transport = transport

        this.document = null
        this.outbox = new Outbox()
        this.presence = new Presence()
        this.recovery = new Recovery(config.canPull ? config.storageKey : null)
        this.bindings = new Map()
        this.bound = new Set()
        this.failed = new Set()

        this.epoch = 0
        this.sequence = -1
        this.fieldsVersion = 0
        this.revision = null
        this.version = null
        this.dirty = []
        this.notice = null
        this.status = 'connecting'
        this.field = null
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

        this.listen()
        this.bar.render()
        this.syncSoon(0)
    }

    get isLive() {
        return Object.keys(this.config.fields).length > 0
    }

    initialValue(field) {
        return field.split('.').reduce((value, key) => value?.[key], this.initial) ?? null
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

        // Capture runs before Livewire, so Save always carries the latest edit.
        for (const name of ['click', 'submit', 'change', 'keydown']) {
            document.addEventListener(
                name,
                () => {
                    this.active()
                    this.collect()
                },
                { signal, capture: true },
            )
        }

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

    /** Called with the element's latest config, as every Livewire render issues a new token. */
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
    }

    bind() {
        if (!this.document || !this.wire || this.stopped) return

        let changed = false

        for (const [field, kind] of Object.entries(this.config.fields)) {
            if (this.failed.has(field) || this.document.kind(field) !== kind || !bindingTypes[kind]) continue
            if (!this.bindings.has(field)) this.bindings.set(field, new bindingTypes[kind](this, field))

            const attached = this.bindings.get(field).attach()

            if (attached === this.bound.has(field) || this.failed.has(field)) continue

            if (attached) this.bound.add(field)
            else this.bound.delete(field)

            changed = true
        }

        if (changed) this.publish()
    }

    collect() {
        if (this.stopped || !this.document) return

        this.bindings.forEach((binding) => binding.collect())
    }

    change(field, value, caret = null) {
        if (this.stopped || !this.document) return

        const operations = this.document.changes(field, value, this.config.client, caret)

        if (!operations.length) return

        this.document.apply(operations)
        this.outbox.push(operations)
        this.field = field
        this.active()
        this.setStatus('syncing')
        this.publish()
        this.syncSoon(Math.max(100, this.interval() / 3))
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
        this.syncSoon(Math.max(150, this.interval() / 2))
    }

    active() {
        this.lastActive = Date.now()
    }

    isIdle() {
        return document.hidden || Date.now() - this.lastActive > IDLE_AFTER
    }

    interval() {
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

    syncSoon(delay = this.interval()) {
        if (this.destroyed || this.status === 'denied') return

        const at = Date.now() + delay

        if (this.timer && this.dueAt <= at) return

        clearTimeout(this.timer)
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
        const binding = this.stopped ? null : this.bindings.get(this.field)
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
        } catch (error) {
            delay = this.handleFailure(error, batches)
        } finally {
            this.syncing = false
            this.bar.render()
            this.overlay.schedule()

            if (delay !== null) {
                clearTimeout(this.timer)
                this.timer = null
            }

            this.syncSoon(delay ?? (this.outbox.isEmpty && this.recovery.isEmpty ? this.interval() : Math.min(150, this.interval())))
        }
    }

    receive(response, sent, fieldsVersion) {
        this.outbox.acknowledge(sent)

        if (!this.stopped) {
            if (response.state) this.restart(response)
            else if (response.operations.length) this.merge(response.operations)

            this.epoch = response.epoch

            // The fields changed while this was in flight, so it answers for the old ones.
            if (fieldsVersion === this.fieldsVersion) this.sequence = response.sequence

            this.bind()
            this.publish()
        }

        this.presence.receive(response)
        this.dirty = response.dirty
        this.noticeRevision(response)

        this.setStatus(this.stopped ? 'stopped' : this.outbox.isEmpty ? 'synced' : 'syncing')
    }

    /** Remote changes: collect ours, remember the caret, apply, repaint. */
    merge(operations) {
        this.collect()

        const touched = [...new Set(operations.map((operation) => operation.f))]
            .map((field) => this.bindings.get(field))
            .filter(Boolean)

        touched.forEach((binding) => binding.capture())
        this.document.apply(operations)
        touched.forEach((binding) => binding.render())
    }

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

        this.document = new Document(state)

        for (const { ops } of this.outbox.batches) this.document.apply(ops)

        this.epoch = epoch

        this.bindings.forEach((binding, field) => {
            if (this.document.kind(field)) {
                binding.render()

                return
            }

            binding.detach()
            this.bindings.delete(field)
            this.bound.delete(field)
        })
    }

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

    handleFailure(error, batches) {
        const { status } = error

        if (status === 410 && this.wire) {
            // An expired token: rendering again rechecks permissions and issues another.
            this.wire.$refresh()

            return 1500
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

    bindingFailed(field) {
        this.failed.add(field)
        this.bound.delete(field)
        this.publish()
    }

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

    jumpTo(person) {
        const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

        this.dom.wrapper(person.field)?.scrollIntoView({ block: 'center', behavior })
    }

    inspect() {
        return {
            summary: {
                Room: this.config.id,
                Mode: this.config.mode,
                Status: this.status,
                'Round trip': `${this.roundTrip} ms`,
                'Sync every': `${Math.round(this.interval())} ms`,
                Transport: this.transport.name ?? 'custom',
                Sequence: `${this.sequence} (epoch ${this.epoch})`,
                Clock: this.document?.clock ?? 0,
                'Waiting to send': this.outbox.batches.length,
                'Unsaved fields': this.dirty.length,
                'People here': this.presence.total,
            },
            fields: Object.entries(this.config.fields).map(([field, kind]) => [
                field,
                kind,
                this.bound.has(field) ? (this.dirty.includes(field) ? 'live, unsaved' : 'live') : 'merge on save',
            ]),
            people: this.presence.users().map((person) => [person.name, person.mode, person.field ?? '—']),
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
        this.events.abort()

        for (const timer of [this.timer, this.pullTimer, this.noticeTimer, this.renderTimer]) clearTimeout(timer)

        this.bindings.forEach((binding) => binding.detach())
        this.bar.destroy()
        this.overlay.destroy()
    }
}
