import * as Y from 'yjs';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';

const match = location.pathname.match(/^\/admin\/documents(?:\/(create|\d+)(?:\/(edit))?)?\/?$/);
if (match) {
    const id = /^\d+$/.test(match[1] || '') ? match[1] : null;
    const page = !match[1] ? 'list' : match[1] === 'create' ? 'create' : match[2] ? 'edit' : 'view';
    const csrf = document.querySelector('meta[name="csrf-token"]').content;
    const session = crypto.randomUUID();
    const box = document.createElement('section');
    box.className = 'collaboration-box';
    box.innerHTML = `<div class="collaboration-heading"><div><span class="collaboration-eyebrow">COLLABORATION</span><h2>${id ? 'Working on this document' : 'People in Articles'}</h2><p>${id ? 'See who has this record open. Presence may take up to 45 seconds to clear after they leave.' : 'See who is browsing, creating or working on a record. Presence can take up to 45 seconds to clear.'}</p></div><span class="collaboration-connection" data-presence-status>Connecting</span></div><div class="collaboration-people" data-presence role="status" aria-live="polite">Loading people…</div>${id ? '<div class="collaboration-actions"><button type="button" data-copy>Copy document link</button><span data-copy-status role="status"></span></div>' : ''}<div data-editor></div>`;
    document.querySelector('main')?.prepend(box);
    const headers = {'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json'};
    const call = async (url, options = {}) => {
        const response = await fetch(url, {credentials: 'same-origin', ...options, headers});
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    };
    let focusedField = null;
    let heartbeatRunning = false;
    let heartbeatAgain = false;
    const heartbeat = async () => {
        if (heartbeatRunning) { heartbeatAgain = true; return; }
        heartbeatRunning = true;
        do {
            heartbeatAgain = false;
        try {
            const result = await call('/collaboration/presence', {method: 'POST', body: JSON.stringify({session_id: session, document_id: id, page, focused_field: focusedField})});
            const people = new Map();
            for (const person of result.presence) {
                if (person.is_you || (id && String(person.document_id) !== id)) continue;
                const existing = people.get(person.user_key);
                const priority = {edit: 3, view: 2, create: 1, list: 0};
                if (!existing || priority[person.page] > priority[existing.page]) people.set(person.user_key, person);
            }
            const container = box.querySelector('[data-presence]');
            container.replaceChildren();
            if (people.size === 0) {
                container.textContent = id ? 'You are the only person on this record right now.' : 'No one else is active in Articles right now.';
            } else {
                for (const person of people.values()) {
                    const chip = document.createElement('span');
                    chip.className = 'collaboration-person';
                    const avatar = document.createElement('span');
                    avatar.className = 'collaboration-avatar';
                    avatar.setAttribute('aria-hidden', 'true');
                    avatar.textContent = person.name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase() || '?';
                    const detail = document.createElement('span');
                    const activity = {edit: 'Edit page open', view: 'Viewing', create: 'Creating a record', list: 'Browsing records'}[person.page] || 'Active';
                    const focus = id && person.page === 'edit' && person.focused_field ? ` · Focused: ${person.focused_field === 'draft' ? 'shared draft' : 'title'}` : '';
                    detail.textContent = `${person.name} · ${activity}${focus}${!id && person.document_id ? ` #${person.document_id}` : ''}`;
                    chip.append(avatar, detail);
                    container.append(chip);
                }
            }
            box.querySelector('[data-presence-status]').textContent = 'Live · updates every 10s';
        } catch { box.querySelector('[data-presence-status]').textContent = 'Presence unavailable · retrying'; }
        } while (heartbeatAgain);
        heartbeatRunning = false;
    };
    box.querySelector('[data-copy]')?.addEventListener('click', async () => {
        const status = box.querySelector('[data-copy-status]');
        try { await navigator.clipboard.writeText(location.href); status.textContent = 'Link copied. Only people with access can open it.'; }
        catch { status.textContent = 'Copy the URL from your browser to share it.'; }
    });
    if (page === 'edit') {
        const updateFocus = () => {
            const active = document.activeElement;
            const next = active?.closest('.tiptap') ? 'draft' : active?.matches('input[id$=".title"]') ? 'title' : null;
            if (next !== focusedField) { focusedField = next; heartbeat(); }
        };
        document.addEventListener('focusin', updateFocus);
        document.addEventListener('focusout', () => setTimeout(updateFocus, 0));
    }
    heartbeat();
    setInterval(heartbeat, 10000);
    if (id && (page === 'edit' || page === 'view')) {
        const editorBox = box.querySelector('[data-editor]');
        editorBox.innerHTML = `<div class="collaboration-draft-heading"><div><h3>Shared draft</h3><p>${page === 'edit' ? 'Changes sync automatically with everyone on this record.' : 'Read-only view of the shared draft.'}</p></div><span data-status role="status" aria-live="polite">Connecting…</span></div><div class="collaboration-editor"></div>`;
        const status = editorBox.querySelector('[data-status]');
        const ydoc = new Y.Doc();
        let cursor = 0;
        let editor;
        let sending = false;
        let syncing = false;
        const user = document.querySelector('meta[name="collaboration-user"]').content;
        const queueKey = `collaboration-pending:${user}:${id}`;
        let queue = [];
        let recoveryFailed = false;
        let storageFailed = false;
        try {
            const saved = JSON.parse(sessionStorage.getItem(queueKey) || '[]');
            if (!Array.isArray(saved) || saved.some(item => typeof item?.update !== 'string' || typeof item?.client_update_id !== 'string')) throw new Error('Invalid queue');
            queue = saved;
        } catch {
            recoveryFailed = true;
            status.textContent = 'Pending edits could not be recovered. Keep this tab open and contact an administrator.';
        }
        const persist = () => {
            try { sessionStorage.setItem(queueKey, JSON.stringify(queue)); storageFailed = false; }
            catch { storageFailed = true; status.textContent = 'Storage unavailable: keep this tab open until synced'; }
        };
        window.addEventListener('beforeunload', event => {
            if (queue.length) { event.preventDefault(); event.returnValue = ''; }
        });
        const url = `/collaboration/documents/${id}/updates`;
        const send = async () => {
            if (sending || !queue.length) return;
            sending = true;
            try {
                while (queue.length) {
                    await call(url, {method: 'POST', body: JSON.stringify(queue[0])});
                    queue.shift();
                    persist();
                }
                status.textContent = 'Draft synced';
            } catch { status.textContent = 'Offline: changes pending in this tab'; }
            finally { sending = false; }
        };
        ydoc.on('update', (update, origin) => {
            if (origin === 'remote') return;
            queue.push({client_update_id: crypto.randomUUID(), update: btoa(Array.from(update, byte => String.fromCharCode(byte)).join(''))});
            persist();
            if (!storageFailed) status.textContent = 'Saving draft…';
            send();
        });
        const sync = async () => {
            if (syncing || recoveryFailed) return;
            syncing = true;
            try {
                let updates;
                do {
                    ({updates} = await call(`${url}?after=${cursor}`));
                    for (const item of updates) {
                        Y.applyUpdate(ydoc, Uint8Array.from(atob(item.update), c => c.charCodeAt(0)), 'remote');
                        cursor = item.id;
                    }
                } while (updates.length === 500);
                if (!editor) {
                    // The persisted queue may contain edits not yet known to the server.
                    // Reapply them before enabling the editor so reload does not hide them.
                    for (const item of queue) {
                        Y.applyUpdate(ydoc, Uint8Array.from(atob(item.update), c => c.charCodeAt(0)), 'remote');
                    }
                    editor = new Editor({element: editorBox.querySelector('.collaboration-editor'), editable: page === 'edit', extensions: [StarterKit.configure({undoRedo: false}), Collaboration.configure({document: ydoc})]});
                }
                if (!queue.length) status.textContent = 'Draft synced';
                await send();
            } catch { status.textContent = 'Connection unavailable; retrying.'; }
            finally { syncing = false; }
        };
        sync();
        setInterval(sync, 2000);
    }
}
