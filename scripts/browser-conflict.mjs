import { chromium } from 'playwright';

const browser = await chromium.launch({headless: true});
const alice = await browser.newContext({viewport: {width: 1440, height: 900}});
const bob = await browser.newContext({viewport: {width: 1440, height: 900}});
async function login(context, user) {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:8765/admin/login');
    await page.getByLabel('Email address').fill(`${user}@example.test`);
    await page.locator('input[type=password]').fill('password');
    await page.getByRole('button', {name: 'Sign in'}).click();
    await page.waitForURL('**/admin');
    await page.goto('http://127.0.0.1:8765/admin/documents/1/edit');
    await page.locator('input[id$=".title"]').waitFor();
    return page;
}
try {
    const nonce = Date.now();
    const aliceTitle = `Alice article ${nonce}`;
    const bobTitle = `Bob article ${nonce}`;
    const a = await login(alice, 'alice');
    const b = await login(bob, 'bob');
    await a.locator('input[id$=".title"]').fill(aliceTitle);
    await b.locator('input[id$=".title"]').fill(bobTitle);
    await a.getByRole('button', {name: 'Save changes'}).click();
    await a.getByText('Saved', {exact: false}).first().waitFor();
    await b.getByRole('button', {name: 'Save changes'}).click();
    await b.getByText('Resolve concurrent changes').waitFor();
    await b.screenshot({path: 'docs/media/conflict-dialog.png', fullPage: true});
    await b.locator('.fi-modal-window select').selectOption('mine');
    await b.locator('.fi-modal-window').getByRole('button', {name: 'Submit'}).click();
    await b.locator('.fi-modal-window').waitFor({state: 'hidden'});
    await b.reload();
    if (await b.locator('input[id$=".title"]').inputValue() !== bobTitle) throw new Error('Conflict resolution did not save the chosen title');
    console.log('Conflicting title edits opened a dialog and kept the selected value.');
} finally {
    await alice.close();
    await bob.close();
    await browser.close();
}
