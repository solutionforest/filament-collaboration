const fieldLabels = {
    title: 'Title',
    slug: 'Slug',
    author_id: 'Author',
    category: 'Category',
    status: 'Status',
    published_at: 'Publish at',
    tags: 'Tags',
    featured_image_url: 'Featured image',
    excerpt: 'Summary',
    body_html: 'Article body',
    seo_title: 'SEO title',
    seo_description: 'SEO description',
    seo_keywords: 'SEO keywords',
    canonical_url: 'Canonical URL',
    robots_noindex: 'Noindex',
    relatedPosts: 'Related posts',
    live_draft: 'Live draft',
    body: 'Live draft',
    draft: 'Live draft',
};

const palette = [
    '#1a73e8', '#d93025', '#f9ab00', '#188038', '#e37400', '#a142f4', '#12b5cb', '#c5221f',
    '#1967d2', '#f09300', '#137333', '#9334e6', '#007b83', '#c5221f', '#174ea6', '#e8710a',
];

const colorFor = (seed) => {
    const text = String(seed ?? '');
    let crc = 0 ^ -1;
    for (let i = 0; i < text.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ text.charCodeAt(i)) & 0xff];
    }
    return palette[((crc ^ -1) >>> 0) % palette.length];
};

const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c;
    }
    return table;
})();

const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '?';

const clearFieldHighlights = () => {
    document.querySelectorAll('.collaboration-remote-label, .collaboration-remote-caret').forEach((el) => el.remove());
    document.querySelectorAll('.collaboration-remote-field').forEach((el) => {
        el.classList.remove('collaboration-remote-field');
        el.style.removeProperty('--collab-color');
    });
};

const findFieldEl = (name) => {
    const root = document.querySelector('main') || document;
    const selectors = [
        `[wire\\:model="data.${name}"]`,
        `[wire\\:model\\.live="data.${name}"]`,
        `[wire\\:model\\.blur="data.${name}"]`,
        `[data-collaborative-rich-editor][data-field="${name}"]`,
    ];
    for (const selector of selectors) {
        const el = root.querySelector(selector);
        if (el) return el;
    }
    if (['live_draft', 'body', 'draft'].includes(name)) {
        return root.querySelector('[data-collaborative-rich-editor]');
    }
    return null;
};

const paintFieldHighlights = (people) => {
    clearFieldHighlights();
    const byField = new Map();
    for (const person of people) {
        if (!person.focused_field) continue;
        if (!byField.has(person.focused_field)) byField.set(person.focused_field, []);
        byField.get(person.focused_field).push(person);
    }
    for (const [field, occupants] of byField.entries()) {
        const target = findFieldEl(field);
        if (!target) continue;
        const host = target.closest('.fi-fo-field-wrp, .fi-fo-field, .fi-sc-component') || target;
        const color = colorFor(personKey(occupants[0]));
        host.classList.add('collaboration-remote-field');
        host.style.setProperty('--collab-color', color);
        if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
        const label = document.createElement('span');
        label.className = 'collaboration-remote-label';
        label.style.background = color;
        label.textContent = occupants.map((p) => p.name.split(/\s+/)[0]).join(', ');
        host.append(label);
        const caret = document.createElement('span');
        caret.className = 'collaboration-remote-caret';
        caret.style.background = color;
        host.append(caret);
    }
};

const personKey = (person) => person.user_key || person.id || person.name;

const match = location.pathname.match(/^\/admin\/documents(?:\/(create|\d+)(?:\/(edit))?)?\/?$/);
if (match) {
    const id = /^\d+$/.test(match[1] || '') ? match[1] : null;
    const page = !match[1] ? 'list' : match[1] === 'create' ? 'create' : match[2] ? 'edit' : 'view';
    const csrf = document.querySelector('meta[name="csrf-token"]').content;
    const session = crypto.randomUUID();
    const box = document.createElement('section');
    box.className = 'collaboration-box';
    box.innerHTML = `<div class="collaboration-heading"><div><span class="collaboration-eyebrow">COLLABORATION</span><h2>${id ? 'Editors on this article' : 'People in Articles'}</h2><p>${id ? 'Google-style avatars in the header show who is here. Coloured outlines + name tags mark the field each editor is in.' : 'See who is browsing or editing articles. Presence can take up to 45 seconds to clear.'}</p></div><div class="collaboration-heading-meta"><div class="collaboration-avatar-stack" data-avatar-stack hidden></div><span class="collaboration-connection" data-presence-status>Connecting</span></div></div><div class="collaboration-people" data-presence role="status" aria-live="polite">Loading people…</div>${id ? '<div class="collaboration-actions"><button type="button" data-copy>Copy document link</button> <a href="/blog" target="_blank" rel="noreferrer">Open public blog</a><span data-copy-status role="status"></span></div>' : ''}`;
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
            const list = [...people.values()];
            const container = box.querySelector('[data-presence]');
            const stack = box.querySelector('[data-avatar-stack]');
            container.replaceChildren();
            stack.replaceChildren();
            if (list.length === 0) {
                stack.hidden = true;
                container.textContent = id ? 'You are the only person on this record right now.' : 'No one else is active in Articles right now.';
                clearFieldHighlights();
            } else {
                const visible = list.slice(0, 8);
                const overflow = list.length - visible.length;
                for (const person of visible) {
                    const avatar = document.createElement('span');
                    avatar.className = 'collaboration-stack-avatar';
                    avatar.style.background = colorFor(personKey(person));
                    avatar.title = `${person.name}${person.focused_field ? ' · ' + (fieldLabels[person.focused_field] || person.focused_field) : ''}`;
                    avatar.textContent = initials(person.name);
                    stack.append(avatar);
                }
                if (overflow > 0) {
                    const more = document.createElement('span');
                    more.className = 'collaboration-stack-avatar collaboration-stack-overflow';
                    more.title = `${overflow} more editors`;
                    more.textContent = `+${overflow}`;
                    stack.append(more);
                }
                stack.hidden = false;
                for (const person of list.slice(0, 12)) {
                    const chip = document.createElement('span');
                    chip.className = 'collaboration-person';
                    const color = colorFor(personKey(person));
                    chip.style.setProperty('--collab-color', color);
                    const avatar = document.createElement('span');
                    avatar.className = 'collaboration-avatar';
                    avatar.style.background = color;
                    avatar.style.color = '#fff';
                    avatar.setAttribute('aria-hidden', 'true');
                    avatar.textContent = initials(person.name);
                    const detail = document.createElement('span');
                    const activity = {edit: 'Editing', view: 'Viewing', create: 'Creating', list: 'Browsing'}[person.page] || 'Active';
                    const focusLabel = person.focused_field ? (fieldLabels[person.focused_field] || person.focused_field) : null;
                    const focus = id && person.page === 'edit' && focusLabel ? ` · ${focusLabel}` : '';
                    detail.textContent = `${person.name} · ${activity}${focus}${!id && person.document_id ? ` #${person.document_id}` : ''}`;
                    chip.append(avatar, detail);
                    container.append(chip);
                }
                if (list.length > 12) {
                    const more = document.createElement('span');
                    more.className = 'collaboration-more';
                    more.textContent = `+${list.length - 12} more`;
                    container.append(more);
                }
                if (page === 'edit') paintFieldHighlights(list);
            }
            box.querySelector('[data-presence-status]').textContent = `Live · ${list.length} other editor${list.length === 1 ? '' : 's'}`;
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
            const collab = active?.closest?.('[data-collaborative-rich-editor]');
            if (collab) {
                const next = collab.getAttribute('data-field') || 'live_draft';
                if (next !== focusedField) { focusedField = next; heartbeat(); }
                return;
            }
            const bound = active?.closest?.('[wire\\:model], [wire\\:model\\.live], [wire\\:model\\.blur]');
            const name = bound?.getAttribute('wire:model')
                || bound?.getAttribute('wire:model.live')
                || bound?.getAttribute('wire:model.blur');
            const next = name?.startsWith('data.') ? name.slice(5) : null;
            if (next !== focusedField) { focusedField = next; heartbeat(); }
        };
        document.addEventListener('focusin', updateFocus);
        document.addEventListener('focusout', () => setTimeout(updateFocus, 0));
    }
    heartbeat();
    setInterval(heartbeat, 10000);
}
