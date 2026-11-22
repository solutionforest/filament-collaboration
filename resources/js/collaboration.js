const match = location.pathname.match(/^\/admin\/documents(?:\/(create|\d+)(?:\/(edit))?)?\/?$/);
if (match) {
    const id = /^\d+$/.test(match[1] || '') ? match[1] : null;
    const page = !match[1] ? 'list' : match[1] === 'create' ? 'create' : match[2] ? 'edit' : 'view';
    const csrf = document.querySelector('meta[name="csrf-token"]').content;
    const session = crypto.randomUUID();
    const box = document.createElement('section');
    box.className = 'collaboration-box';
    box.innerHTML = `<div class="collaboration-heading"><div><span class="collaboration-eyebrow">COLLABORATION</span><h2>${id ? 'Working on this document' : 'People in Articles'}</h2><p>${id ? 'See who has this record open. Presence may take up to 45 seconds to clear after they leave.' : 'See who is browsing, creating or working on a record. Presence can take up to 45 seconds to clear.'}</p></div><span class="collaboration-connection" data-presence-status>Connecting</span></div><div class="collaboration-people" data-presence role="status" aria-live="polite">Loading people…</div>${id ? '<div class="collaboration-actions"><button type="button" data-copy>Copy document link</button><span data-copy-status role="status"></span></div>' : ''}`;
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
                    const focusLabel = person.focused_field === 'body' || person.focused_field === 'draft'
                        ? 'rich editor'
                        : person.focused_field === 'title' ? 'title' : null;
                    const focus = id && person.page === 'edit' && focusLabel ? ` · Focused: ${focusLabel}` : '';
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
            const next = active?.closest('[data-collaborative-rich-editor], .tiptap, .fi-collaborative-rich-editor')
                ? 'body'
                : active?.matches('input[id$=".title"]') ? 'title' : null;
            if (next !== focusedField) { focusedField = next; heartbeat(); }
        };
        document.addEventListener('focusin', updateFocus);
        document.addEventListener('focusout', () => setTimeout(updateFocus, 0));
    }
    heartbeat();
    setInterval(heartbeat, 10000);
}
