// Regenerates every screenshot used by the manual, from a running EIMS site.
//
//   npm i -D playwright-core            (once)
//   BASE=http://localhost:8000 PASSWORD=... node tools/screenshots.mjs [name-filter]
//
// CHROME must point at a Chromium/Chrome binary. Reports need one extra
// refresh after their filters arrive via the URL, hence the `report` flag.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE || 'http://localhost:8000';
const USER = process.env.USERNAME || 'Administrator';
const PASSWORD = process.env.PASSWORD || 'admin';
const CHROME = process.env.CHROME || `${process.env.HOME}/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`;
const OUT = path.join(HERE, '..', 'src', 'assets', 'screens');
const shots = JSON.parse(fs.readFileSync(path.join(HERE, 'shots.json'), 'utf8'));
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'ar' });
const page = await ctx.newPage();

await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
if (!only || only.test('login')) await page.screenshot({ path: path.join(OUT, 'login.png') });
await page.fill('#login_email', USER);
await page.fill('#login_password', PASSWORD);
await page.click('.btn-login');
await page.waitForURL(/\/app/, { timeout: 60000 });

let ok = 0;
const failed = [];
for (const shot of shots) {
	if (shot.auth === false) continue;
	if (only && !only.test(shot.name)) continue;
	try {
		await page.goto(BASE + shot.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
		await page.waitForTimeout(shot.report ? 5000 : 2000);
		if (shot.report) {
			await page.evaluate(() => window.frappe?.query_report?.refresh?.());
			await page.waitForTimeout(5000);
		}
		await page.keyboard.press('Escape');
		await page.screenshot({ path: path.join(OUT, `${shot.name}.png`) });
		ok++;
		console.log('OK  ', shot.name);
	} catch (e) {
		failed.push(shot.name);
		console.log('FAIL', shot.name, String(e).split('\n')[0]);
	}
}
// Two shots need a click, so they are not in shots.json.
if (!only || only.test('menu-user')) {
	await page.goto(`${BASE}/app/eims`, { waitUntil: 'domcontentloaded' });
	await page.waitForTimeout(2500);
	await page.click('header .avatar, .navbar .avatar');
	await page.waitForTimeout(1200);
	await page.screenshot({ path: path.join(OUT, 'menu-user.png') });
	ok++;
	console.log('OK   menu-user');
}
if (!only || only.test('list-filter-panel')) {
	await page.goto(`${BASE}/app/eims-student`, { waitUntil: 'domcontentloaded' });
	await page.waitForTimeout(2500);
	await page.click('.filter-button, .filter-selector button');
	await page.waitForTimeout(1200);
	await page.screenshot({ path: path.join(OUT, 'list-filter-panel.png') });
	ok++;
	console.log('OK   list-filter-panel');
}

console.log(`\n${ok} captured, ${failed.length} failed`, failed.length ? failed : '');
await browser.close();
