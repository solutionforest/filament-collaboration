import { element } from '../dom.js'

/** Fills `CollaborationDebugAction`'s slide-over. Never shows field contents. */
/** @param {import('../room/room.js').Room[]} rooms */
export function renderInspector(rooms) {
    for (const host of document.querySelectorAll(/** @type {'div'} */ ('[data-collaboration-debug]'))) {
        if (!host.getClientRects().length) continue

        const sections = [...rooms].map((room) => {
            const report = room.inspect()

            return element('section', {}, [
                element(
                    'dl',
                    {},
                    Object.entries(report.summary).flatMap(([label, value]) => [
                        element('dt', { text: label }),
                        element('dd', { text: String(value) }),
                    ]),
                ),
                table(['Field', 'Kind', 'State'], report.fields),
                table(['Person', 'Mode', 'Field'], report.people.slice(0, 30)),
                table(['Recovered', 'Field', 'Error'], report.problems),
            ])
        })

        const signature = sections.map((section) => section.textContent).join('|')

        if (host.dataset.signature === signature && host.childElementCount) continue

        host.dataset.signature = signature
        host.replaceChildren(...sections)
    }
}

/**
 * @param {string[]} headings
 * @param {Array<Array<string | number>>} rows
 */
function table(headings, rows) {
    if (!rows.length) return null

    return element('table', {}, [
        element('thead', {}, [element('tr', {}, headings.map((text) => element('th', { text })))]),
        element('tbody', {}, rows.map((row) => element('tr', {}, row.map((text) => element('td', { text }))))),
    ])
}
