import { element } from '../dom.js'

/**
 * @param {Pick<Person, 'avatar' | 'initials' | 'idle' | 'color'>} person
 * @param {{small?: boolean}} options
 */
export function avatar(person, { small = false } = {}) {
    const image =
        person.avatar &&
        element('img', {
            src: person.avatar,
            alt: '',
            referrerpolicy: 'no-referrer',
            on: { error: (event) => /** @type {Element} */ (event.currentTarget).replaceWith(person.initials) },
        })

    const node = element(
        'span',
        {
            class: `fi-collab-avatar${person.idle ? ' fi-collab-avatar-idle' : ''}${small ? ' fi-collab-avatar-sm' : ''}`,
            style: { '--fi-collab-color': person.color },
            'aria-hidden': 'true',
        },
        [image],
    )

    if (!image) node.textContent = person.initials

    return node
}
