import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';

const base = process.env.APP_URL || 'http://127.0.0.1:8000';
const outDir = path.resolve('../docs/media');
await mkdir(outDir, { recursive: true });

execSync('php artisan db:seed --force', { stdio: 'inherit' });
const docId = execSync(
    "php artisan tinker --execute=\"echo App\\\\Models\\\\Document::where('slug','spring-product-update')->value('id');\"",
)
    .toString()
    .trim();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${base}/admin/login`, { waitUntil: 'domcontentloaded' });
await page.locator('#form\\.email').fill('alice@example.test');
await page.locator('#form\\.password').fill('password');
await Promise.all([
    page.waitForURL(/\/admin(?!\/login)/, { timeout: 45000 }),
    page.getByRole('button', { name: /sign in/i }).click(),
]);

await page.goto(`${base}/admin/documents`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await page.screenshot({ path: path.join(outDir, 'cms-articles.png') });

await page.goto(`${base}/admin/documents/${docId}/edit`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3500);
await page.screenshot({ path: path.join(outDir, 'presence-avatars.png') });
await page.screenshot({ path: path.join(outDir, 'field-highlight.png') });
await page.screenshot({ path: path.join(outDir, 'shared-edit.png') });

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.getByText('Live collaborative draft').scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
await page.screenshot({ path: path.join(outDir, 'rich-editor.png') });

await page.goto(`${base}/blog`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(outDir, 'public-blog.png') });

await page.goto(`${base}/blog/spring-product-update`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(outDir, 'public-article.png') });

await browser.close();
console.log('Screenshots written to docs/media');
