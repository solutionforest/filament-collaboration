export class Presence {
    people = []
    total = 0
    etag = null

    receive({ people, total, presence }) {
        this.total = total
        this.etag = presence

        if (!people) return false

        this.people = people

        return true
    }

    /** Somebody moved to another field or caret, pushed by the server. */
    move({ client, field, cursor, idle }) {
        const person = this.people.find((item) => item.client === client)

        if (!person) return

        Object.assign(person, { field, cursor, idle })
        this.etag = null
    }

    get activeCount() {
        return new Set(this.people.filter((person) => !person.idle).map((person) => person.key)).size
    }

    /** One entry per person: their most interesting tab. */
    users() {
        const users = new Map()
        const rank = (person) => (person.idle ? 0 : 4) + (person.mode === 'editing' ? 2 : 0) + (person.field ? 1 : 0)

        for (const person of this.people) {
            const current = users.get(person.key)

            if (!current || rank(person) > rank(current)) users.set(person.key, person)
        }

        return [...users.values()].sort((a, b) => Number(a.self) - Number(b.self) || Number(a.idle) - Number(b.idle))
    }
}
