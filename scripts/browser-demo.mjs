import { chromium } from 'playwright';
import { mkdir, rename } from 'node:fs/promises';

const browser = await chromium.launch({headless: true});
await mkdir('docs/media', {recursive: true});
const alice = await browser.newContext({viewport: {width: 1440, height: 900}, recordVideo: {dir: 'docs/media', size: {width: 1440, height: 900}}});
const bob = await browser.newContext({viewport: {width: 1440, height: 900}});
async function login(context, user) {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:8765/admin/login');
    await page.getByLabel('Email address').fill(`${user}@example.test`);
    await page.locator('input[type=password]').fill('password');
    await page.getByRole('button', {name: 'Sign in'}).click();
    await page.waitForURL('**/admin');
    return page;
}
try {
    const a = await login(alice, 'alice');
    const b = await login(bob, 'bob');
    await a.goto('http://127.0.0.1:8765/admin/documents/1/edit');
    await b.goto('http://127.0.0.1:8765/admin/documents/1/edit');
    await a.locator('.tiptap').waitFor();
    await b.locator('.tiptap').waitFor();
    await a.locator('.tiptap').click();
    await a.keyboard.type('Hello from Alice. ', {delay: 60});
    await b.getByText('Hello from Alice.', {exact: false}).waitFor({timeout: 15000});
    await b.locator('.tiptap').click();
    await b.keyboard.press('End');
    await b.keyboard.type('Hello from Bob.');
    await a.getByText('Hello from Bob.', {exact: false}).waitFor({timeout: 15000});
    await a.waitForTimeout(11000);
    await a.screenshot({path: 'docs/media/shared-edit.png', fullPage: true});
    console.log('Two independent users synchronized a shared draft.');
    const video = a.video();
    await alice.close();
    if (video) await rename(await video.path(), 'docs/media/demo.webm');
} finally {
    await bob.close();
    await browser.close();
}
