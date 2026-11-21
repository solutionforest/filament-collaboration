import * as Y from 'yjs';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';

const match = location.pathname.match(/^\/admin\/documents(?:\/(create|\d+)(?:\/(edit))?)?\/?$/);
if (match) {
    const id = /^\d+$/.test(match[1] || '') ? match[1] : null;
    const page = !match[1] ? 'list' : match[1] === 'create' ? 'create' : match[2] ? 'edit' : 'view';
    const csrf = document.querySelector('meta[name="csrf-token"]').content;
    const session = sessionStorage.collaborationSession ||= crypto.randomUUID();
    const box = document.createElement('section');
    box.className = 'collaboration-box';
    box.innerHTML = '<strong>People in Documents</strong><p data-presence>Loading presence…</p><div data-editor></div>';
    document.querySelector('main')?.prepend(box);
    const headers = {'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json'};
    const call = async (url, options = {}) => {
        const response = await fetch(url, {credentials: 'same-origin', ...options, headers});
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    };
    const heartbeat = async () => {
        try {
            const result = await call('/collaboration/presence', {method: 'POST', body: JSON.stringify({session_id: session, document_id: id, page})});
            box.querySelector('[data-presence]').textContent = result.presence.map(p => `${p.name}: ${p.page}${p.document_id ? ` #${p.document_id}` : ''}`).join(' · ') || 'No one active';
        } catch { box.querySelector('[data-presence]').textContent = 'Presence unavailable; retrying.'; }
    };
    heartbeat();
    setInterval(heartbeat, 10000);
    if (id && (page === 'edit' || page === 'view')) {
        const editorBox = box.querySelector('[data-editor]');
        editorBox.innerHTML = '<h3>Shared draft</h3><p data-status>Connecting…</p><div class="collaboration-editor"></div>';
        const status = editorBox.querySelector('[data-status]');
        const ydoc = new Y.Doc();
        let cursor = 0;
        let editor;
        let sending = false;
        const queue = [];
        const url = `/collaboration/documents/${id}/updates`;
        const send = async () => {
            if (sending || !queue.length) return;
            sending = true;
            try {
                while (queue.length) {
                    await call(url, {method: 'POST', body: JSON.stringify({update: queue[0]})});
                    queue.shift();
                }
                status.textContent = 'Draft synced';
            } catch { status.textContent = 'Offline: changes pending in this tab'; }
            finally { sending = false; }
        };
        ydoc.on('update', (update, origin) => {
            if (origin === 'remote') return;
            queue.push(btoa(String.fromCharCode(...update)));
            status.textContent = 'Saving draft…';
            send();
        });
        const sync = async () => {
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
                    editor = new Editor({element: editorBox.querySelector('.collaboration-editor'), editable: page === 'edit', extensions: [StarterKit.configure({undoRedo: false}), Collaboration.configure({document: ydoc})]});
                }
                if (!queue.length) status.textContent = 'Draft synced';
                await send();
            } catch { status.textContent = 'Connection unavailable; retrying.'; }
        };
        sync();
        setInterval(sync, 2000);
    }
}
