/** Ids are `[clock, client]` pairs, ordered by clock and then by client. */
export const isAfter = ([clockA, clientA], [clockB, clientB]) =>
    clockA === clockB ? clientA > clientB : clockA > clockB

export const sameId = (a, b) => a === b || (!!a && !!b && a[0] === b[0] && a[1] === b[1])

const LONE_SURROGATE = /\p{Surrogate}/u

/**
 * Half of an emoji. ProseMirror can leave one behind, and PHP refuses a whole
 * JSON request that contains one: the sync and the Save with it.
 */
export const hasLoneSurrogate = (text) => LONE_SURROGATE.test(text)

/** Replaces each lone surrogate with U+FFFD, so lengths are unchanged. */
export const wellFormed = (text) => text.replace(/\p{Surrogate}/gu, '\uFFFD')

/** Splits into code points, the unit PHP and the CRDT count in. */
export const characters = (text) => Array.from(wellFormed(text))

/** JSON with sorted keys, byte-identical to what the PHP side produces. */
export const canonical = (value) =>
    JSON.stringify(value, (key, item) =>
        item && typeof item === 'object' && !Array.isArray(item)
            ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
            : item,
    )
