import * as Y from 'yjs'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'

export default function collaborativeRichEditorFormComponent({
    documentId,
    updatesUrl,
    csrfToken,
    isDisabled,
    label,
    placeholder,
    statePath,
}) {
    return {
        status: 'Connecting…',
        editor: null,
        ydoc: null,
        cursor: 0,
        queue: [],
        queueKey: '',
        sending: false,
        syncing: false,
        recoveryFailed: false,
        storageFailed: false,
        pollTimer: null,

        async init() {
            if (!documentId || !updatesUrl) {
                this.status = 'Save the record first to enable live collaboration.'

                return
            }

            this.ydoc = new Y.Doc()
            const userMeta = document.querySelector('meta[name="collaboration-user"]')?.content || 'anon'
            this.queueKey = `collaboration-pending:${userMeta}:${documentId}:${statePath}`

            try {
                const saved = JSON.parse(sessionStorage.getItem(this.queueKey) || '[]')
                if (
                    !Array.isArray(saved) ||
                    saved.some(
                        (item) =>
                            typeof item?.update !== 'string' ||
                            typeof item?.client_update_id !== 'string',
                    )
                ) {
                    throw new Error('Invalid queue')
                }
                this.queue = saved
            } catch {
                this.recoveryFailed = true
                this.status = 'Pending edits could not be recovered.'
            }

            this.ydoc.on('update', (update, origin) => {
                if (origin === 'remote' || isDisabled) {
                    return
                }

                this.queue.push({
                    client_update_id: crypto.randomUUID(),
                    update: btoa(Array.from(update, (byte) => String.fromCharCode(byte)).join('')),
                })
                this.persistQueue()
                if (!this.storageFailed) {
                    this.status = 'Saving…'
                }
                this.flushQueue()
            })

            this.onBeforeUnload = (event) => {
                if (this.queue.length) {
                    event.preventDefault()
                    event.returnValue = ''
                }
            }
            window.addEventListener('beforeunload', this.onBeforeUnload)

            await this.sync()
            this.pollTimer = setInterval(() => this.sync(), 2000)
        },

        persistQueue() {
            try {
                sessionStorage.setItem(this.queueKey, JSON.stringify(this.queue))
                this.storageFailed = false
            } catch {
                this.storageFailed = true
                this.status = 'Storage unavailable: keep this tab open until synced'
            }
        },

        async call(url, options = {}) {
            const response = await fetch(url, {
                credentials: 'same-origin',
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    ...(options.headers || {}),
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }

            if (response.status === 204) {
                return null
            }

            return response.json()
        },

        async flushQueue() {
            if (this.sending || !this.queue.length || isDisabled) {
                return
            }

            this.sending = true
            try {
                while (this.queue.length) {
                    await this.call(updatesUrl, {
                        method: 'POST',
                        body: JSON.stringify(this.queue[0]),
                    })
                    this.queue.shift()
                    this.persistQueue()
                }
                this.status = 'Synced'
            } catch {
                this.status = 'Offline: changes pending in this tab'
            } finally {
                this.sending = false
            }
        },

        async sync() {
            if (this.syncing || this.recoveryFailed) {
                return
            }

            this.syncing = true
            try {
                let updates
                do {
                    const result = await this.call(`${updatesUrl}?after=${this.cursor}`)
                    updates = result.updates || []
                    for (const item of updates) {
                        Y.applyUpdate(
                            this.ydoc,
                            Uint8Array.from(atob(item.update), (c) => c.charCodeAt(0)),
                            'remote',
                        )
                        this.cursor = item.id
                    }
                } while (updates.length === 500)

                if (!this.editor) {
                    for (const item of this.queue) {
                        Y.applyUpdate(
                            this.ydoc,
                            Uint8Array.from(atob(item.update), (c) => c.charCodeAt(0)),
                            'remote',
                        )
                    }

                    this.editor = new Editor({
                        element: this.$refs.editor,
                        editable: !isDisabled,
                        extensions: [
                            StarterKit.configure({ undoRedo: false }),
                            Collaboration.configure({ document: this.ydoc }),
                        ],
                        editorProps: {
                            attributes: {
                                class: 'fi-fo-rich-editor-content fi-prose tiptap',
                                role: 'textbox',
                                'aria-multiline': 'true',
                                ...(label ? { 'aria-label': label } : {}),
                                ...(placeholder ? { 'data-placeholder': placeholder } : {}),
                            },
                        },
                    })
                }

                if (!this.queue.length) {
                    this.status = 'Synced'
                }
                await this.flushQueue()
            } catch {
                this.status = 'Connection unavailable; retrying.'
            } finally {
                this.syncing = false
            }
        },

        destroy() {
            if (this.pollTimer) {
                clearInterval(this.pollTimer)
            }
            if (this.onBeforeUnload) {
                window.removeEventListener('beforeunload', this.onBeforeUnload)
            }
            this.editor?.destroy()
            this.ydoc?.destroy()
        },
    }
}
