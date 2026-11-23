import { chromium } from 'playwright';

const browser = await chromium.launch({headless: true});
const context = await browser.newContext();
const page = await context.newPage();
const blockWrites = route => route.request().method() === 'POST' ? route.abort() : route.continue();
try {
    await page.goto('http://127.0.0.1:8765/admin/login');
    await page.getByLabel('Email address').fill('alice@example.test');
    await page.locator('input[type=password]').fill('password');
    await page.getByRole('button', {name: 'Sign in'}).click();
    await page.waitForURL('**/admin');
    await page.goto('http://127.0.0.1:8765/admin/documents/1/edit');
    await page.locator('.tiptap').waitFor();
    await page.route('**/collaboration/documents/1/updates', blockWrites);
    await page.locator('.tiptap').click();
    await page.keyboard.type('Pending through reload');
    await page.getByText('Offline: changes pending in this tab').waitFor();
    page.once('dialog', dialog => dialog.accept());
    await page.reload();
    await page.locator('.tiptap').getByText('Pending through reload').waitFor();
    await page.unroute('**/collaboration/documents/1/updates', blockWrites);
    await page.getByText('Draft synced').waitFor({timeout: 15000});
    await page.reload();
    await page.locator('.tiptap').getByText('Pending through reload').waitFor();
    console.log('Unacknowledged edits survived a reload and synchronized after reconnect.');
} finally {
    await context.close();
    await browser.close();
}
