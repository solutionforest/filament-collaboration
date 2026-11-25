import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createConnection, createServer } from 'node:net'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import * as playwright from 'playwright'

export const demo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

const freePort = () =>
    new Promise((resolve, reject) => {
        const probe = createServer()

        probe.once('error', reject)
        probe.listen(0, '127.0.0.1', () => {
            const { port } = probe.address()

            probe.close(() => resolve(port))
        })
    })

/** A throwaway database and server, and a browser context per editor. */
export async function start({ viewport = { width: 1440, height: 900 }, optimized = false, servers = 1 } = {}) {
    // A fixed port could reach somebody else's server on a shared machine.
    const port = await freePort()
    const directory = path.join(demo, 'storage/framework/testing', `browser-${port}`)
    const database = path.join(directory, 'database.sqlite')

    rmSync(directory, { recursive: true, force: true })

    // Its own storage too, or the login limit of one run would lock out the next.
    for (const folder of ['app', 'logs', 'framework/cache/data', 'framework/sessions', 'framework/views']) {
        mkdirSync(path.join(directory, 'storage', folder), { recursive: true })
    }

    writeFileSync(database, '')

    const env = {
        ...process.env,
        APP_ENV: 'local',
        LARAVEL_STORAGE_PATH: path.join(directory, 'storage'),
        APP_URL: `http://127.0.0.1:${port}`,
        DB_CONNECTION: 'sqlite',
        DB_DATABASE: database,
        DB_JOURNAL_MODE: 'wal',
        SESSION_DRIVER: 'file',
        CACHE_STORE: 'file',
        QUEUE_CONNECTION: 'sync',
        BCRYPT_ROUNDS: '4',
        PHP_CLI_SERVER_WORKERS: '16',
    }

    // PRESENCE=redis keeps presence in Redis, under a prefix of this run's own.
    if (process.env.PRESENCE === 'redis') {
        Object.assign(env, { FILAMENT_COLLABORATION_PRESENCE: 'redis', REDIS_PREFIX: `filament-collaboration-browser-${port}:` })
    }

    // CACHE=redis keeps the cache and sessions in Redis too, which also keeps drafts' heads there.
    if (process.env.CACHE === 'redis') {
        Object.assign(env, { CACHE_STORE: 'redis', SESSION_DRIVER: 'redis', REDIS_PREFIX: `filament-collaboration-browser-${port}:` })
    }

    // `php -S` only passes the environment to $_ENV when asked, and Laravel reads the storage path from there.
    const options = ['-d', 'variables_order=EGPCS']

    if (optimized) {
        // Configured like production, with the caches kept out of the working app.
        Object.assign(env, {
            APP_DEBUG: 'false',
            LOG_LEVEL: 'error',
            BOOST_ENABLED: 'false',
            APP_CONFIG_CACHE: path.join(directory, 'config.php'),
            APP_ROUTES_CACHE: path.join(directory, 'routes.php'),
            APP_EVENTS_CACHE: path.join(directory, 'events.php'),
        })

        options.push('-d', 'opcache.enable=1', '-d', 'opcache.validate_timestamps=0', '-d', 'opcache.max_accelerated_files=30000', '-d', 'opcache.memory_consumption=256')
    }

    // TRANSPORT=reverb pushes changes over a real Reverb server instead of polling.
    const reverb = process.env.TRANSPORT === 'reverb' ? await freePort() : null

    if (reverb) {
        Object.assign(env, {
            BROADCAST_CONNECTION: 'reverb',
            REVERB_APP_ID: 'browser-tests',
            REVERB_APP_KEY: 'browser-tests-key',
            REVERB_APP_SECRET: 'browser-tests-secret',
            REVERB_HOST: '127.0.0.1',
            REVERB_PORT: String(reverb),
            REVERB_SERVER_PORT: String(reverb),
            REVERB_SCHEME: 'http',
        })
    }

    execFileSync('php', ['artisan', 'migrate', '--seed', '--force'], { cwd: demo, env, stdio: 'ignore' })
    // More articles than there are scenarios, each a copy of a seeded one.
    execFileSync('php', ['tests/browser/articles.php', '80'], { cwd: demo, env, stdio: 'ignore' })

    if (optimized) {
        for (const command of ['config:cache', 'route:cache', 'event:cache']) {
            execFileSync('php', ['artisan', command], { cwd: demo, env, stdio: 'ignore' })
        }
    }

    // `artisan serve` forwards only some variables, so start PHP's server directly.
    // More than one is several application servers on one database, as behind a load balancer.
    const ports = [port]

    for (let extra = 1; extra < servers; extra++) ports.push(await freePort())

    // OCTANE=swoole serves the app from Laravel Octane, which keeps it in memory between requests.
    const processes = ports.map((listen) =>
        process.env.OCTANE
            ? spawn('php', ['artisan', 'octane:start', `--server=${process.env.OCTANE}`, '--host=127.0.0.1', `--port=${listen}`, `--workers=${process.env.OCTANE_WORKERS ?? 4}`, '--task-workers=0'], {
                  cwd: demo,
                  env,
                  stdio: 'ignore',
                  detached: true,
              })
            : spawn('php', [...options, '-S', `127.0.0.1:${listen}`, path.join(demo, 'vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php')], {
                  cwd: path.join(demo, 'public'),
                  env,
                  stdio: 'ignore',
                  detached: true,
              }),
    )

    const websockets = reverb
        ? spawn('php', ['artisan', 'reverb:start', '--host=127.0.0.1', `--port=${reverb}`], { cwd: demo, env, stdio: 'ignore', detached: true })
        : null

    const kill = (child) => {
        try {
            process.kill(-child.pid)
        } catch {
            // Already stopped.
        }
    }

    const stopReverb = () => websockets && kill(websockets)
    const stopServer = () => {
        processes.forEach(kill)
        stopReverb()
    }

    process.once('exit', stopServer)

    // An interrupted process does not emit `exit` by itself.
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => process.exit(1))

    const base = env.APP_URL
    const bases = ports.map((listen) => `http://127.0.0.1:${listen}`)

    for (let attempt = 0; reverb && attempt < 120; attempt++) {
        const open = await new Promise((resolve) => {
            const socket = createConnection(reverb, '127.0.0.1', () => resolve(socket.end() && true))

            socket.on('error', () => resolve(false))
        })

        if (open) break
        if (attempt === 119) throw new Error('Reverb did not start.')

        await new Promise((resolve) => setTimeout(resolve, 250))
    }

    for (const server of bases) {
        for (let attempt = 0; attempt < 120; attempt++) {
            if (await fetch(`${server}/up`).then((response) => response.ok, () => false)) break
            if (attempt === 119) throw new Error('The demo server did not start.')

            await new Promise((resolve) => setTimeout(resolve, 250))
        }
    }

    // BROWSER=webkit runs everything in Safari's engine.
    const browser = await playwright[process.env.BROWSER ?? 'chromium'].launch()
    const setup = new DatabaseSync(database, { timeout: 5000 })
    const insert = setup.prepare(
        `insert into documents (workspace_id, title, slug, category, status, excerpt, body_html, robots_noindex, created_at, updated_at)
         values (1, ?, ?, 'News', 'draft', 'Summary', ?, 0, datetime('now'), datetime('now'))`,
    )

    // The first three articles are for presence tests; every other test gets its own.
    for (let number = 1; number <= 30; number++) {
        insert.run(`Scenario ${number}`, `scenario-${number}`, '<p>Opening paragraph.</p><p>Second paragraph.</p>')
    }

    setup.close()

    const db = new DatabaseSync(database, { readOnly: true, timeout: 5000 })
    const problems = []

    async function signIn(name, options = {}) {
        const context = await browser.newContext({
            viewport,
            deviceScaleFactor: 1,
            timezoneId: 'UTC',
            reducedMotion: 'reduce',
            ...options,
        })
        const page = await context.newPage()

        // THROTTLE=4 runs Chromium's CPU four times slower, as on a busy CI runner.
        if (process.env.THROTTLE && (process.env.BROWSER ?? 'chromium') === 'chromium') {
            const session = await context.newCDPSession(page)

            await session.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.THROTTLE) })
        }

        page.on('pageerror', (error) => problems.push(`${name}: ${error.stack ?? error.message}`))
        page.on('console', (message) => {
            if (/^\[filament-collaboration\]/.test(message.text())) problems.push(`${name}: ${message.text()}`)
            // Alpine rethrows these as page errors, often with no message: say which expression it was.
            if (/^Alpine Expression Error/.test(message.text())) problems.push(`${name}: ${message.text().replace(/\s+/g, ' ').trim()} on ${page.url()}`)
        })
        page.on('response', (response) => {
            if (response.status() >= 400 && !response.url().endsWith('favicon.ico')) {
                problems.push(`${name}: HTTP ${response.status()} ${response.url()}`)
            }
        })

        await page.goto(`${base}/admin/login`)
        await page.locator('[id="form.email"]').fill(`${name}@example.test`)
        await page.locator('[id="form.password"]').fill('password')
        await page.getByRole('button', { name: /sign in/i }).click()
        await page.waitForURL(/\/admin(?!\/login)/, { timeout: 30000 })

        return page
    }

    async function edit(page, id = 3) {
        await page.goto(`${base}/admin/documents/${id}/edit`)
        await page.waitForFunction(
            () => {
                const room = window.filamentCollaboration?.inspect().find((item) => item.fields.length)

                return room && room.fields.every(([, , state]) => state.startsWith('live') || state.endsWith('(not live here)'))
            },
            undefined,
            { timeout: 25000 },
        )
    }

    async function stop() {
        await browser.close()
        db.close()
        stopServer()
        rmSync(directory, { recursive: true, force: true })
    }

    /** Session cookies for the seeded editors, without using the login form. */
    const sessions = (size) =>
        JSON.parse(
            execFileSync('php', ['tests/browser/sessions.php', String(size)], { cwd: demo, env, maxBuffer: 10_000_000 })
                .toString()
                .match(/\[\{.*\}\]/s)[0],
        )

    const article = (id = 3) => db.prepare('select * from documents where id = ?').get(id)

    /** Everything this server logged. */
    const log = () =>
        readdirSync(path.join(directory, 'storage/logs'))
            .map((file) => readFileSync(path.join(directory, 'storage/logs', file), 'utf8'))
            .join('\n')

    /** Runs Artisan against this server's database and caches. */
    const artisan = (...args) => execFileSync('php', ['artisan', ...args], { cwd: demo, env, stdio: 'ignore' })

    return { artisan, base, bases, browser, article, db, edit, env, log, problems, reverb, sessions, signIn, stop, stopReverb }
}
