import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';

const base = process.env.APP_URL || 'http://127.0.0.1:8000';
const outDir = path.resolve('docs/media');
await mkdir(outDir, { recursive: true });

// Refresh seeded presence so screenshots capture the 100-editor desk.
execSync('php artisan db:seed --force', { stdio: 'inherit' });

const docId = execSync(
    "php artisan tinker --execute=\"echo App\\\\Models\\\\Document::where('slug','spring-product-update')->value('id');\"",
)
    .toString()
    .trim();

const browser = await chromium.launch({ headless: true });

const login = async (page, email) => {
    await page.goto(`${base}/admin/login`, { waitUntil: 'domcontentloaded' });
    await page.locator('#form\\.email').fill(email);
    await page.locator('#form\\.password').fill('password');
    await Promise.all([
        page.waitForURL(/\/admin(?!\/login)/, { timeout: 45000 }),
        page.getByRole('button', { name: /sign in/i }).click(),
    ]);
};

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await desktop.newPage();
await login(page, 'alice@example.test');

await page.goto(`${base}/admin/documents`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await page.screenshot({ path: path.join(outDir, 'cms-articles.png') });

await page.goto(`${base}/admin/documents/${docId}/edit`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);
await page.screenshot({ path: path.join(outDir, 'shared-edit.png') });
await page.screenshot({ path: path.join(outDir, 'presence-avatars.png') });

try {
    await page.getByLabel(/^Title$/i).click({ timeout: 4000 });
} catch {
    // Title label may vary by Filament version.
}
await page.waitForTimeout(1000);
await page.screenshot({ path: path.join(outDir, 'field-highlight.png') });

await page.goto(`${base}/blog`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(outDir, 'public-blog.png') });

await page.goto(`${base}/blog/spring-product-update`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(outDir, 'public-article.png') });

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mpage = await mobile.newPage();
await login(mpage, 'bob@example.test');
await mpage.goto(`${base}/admin/documents/${docId}/edit`, { waitUntil: 'domcontentloaded' });
await mpage.waitForTimeout(3000);
await mpage.screenshot({ path: path.join(outDir, 'mobile-edit.png') });

await browser.close();
console.log('Screenshots written to docs/media');
