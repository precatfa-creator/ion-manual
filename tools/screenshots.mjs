// Capture actual testsite.local forms without saving business documents.
// Node 22+. CHROME, BASE, and SID may be supplied; no default password.
// LOCAL_SESSION=1 reuses an existing local Administrator session in memory.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE || 'http://10.60.50.108:8001';
const OUT = path.join(HERE, '..', 'src/assets/screens');
const shots = JSON.parse(fs.readFileSync(path.join(HERE, 'shots.json'), 'utf8'));
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const browser = await chromium.launch({
  ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}),
  args: ['--host-resolver-rules=MAP testsite.local 127.0.0.1', '--no-proxy-server'],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, locale: 'ar' });
const page = await context.newPage();
const errors = [];
const blockedCalls = [];
page.on('pageerror', e => errors.push(e.message));
// Viewing forms can trigger background requests; refuse business writes.
const allowedPost = /(?:getdoc|getdoctype|get_list|get_value|get_count|search_link|search_widget|reportview|get_dashboard|get_open_count|get_docinfo|get_user_info|get_data|get_config|get_defaults|get_onload|load_doctype|load_dashboard|can_create|has_permission|get_workflow|get_transitions|get_active_domains|is_chat_enabled|get_notifications|get_unread|ping|version|get_items|get_linked_docs|get_sidebar_items|get_workspace_sidebar_items|get_desktop_page|query_report\.(?:run|get_script)|get_change_log|number_card\.get_result)/i;
await page.route('**/api/**', async route => {
  const req = route.request();
  if (req.method() === 'POST' && !allowedPost.test(req.url())) {
    blockedCalls.push(new URL(req.url()).pathname);
    return route.abort('blockedbyclient');
  }
  if (['PUT', 'DELETE', 'PATCH'].includes(req.method())) return route.abort('blockedbyclient');
  return route.continue();
});
const sessions = process.env.SID ? [process.env.SID] : process.env.LOCAL_SESSION === '1'
  ? JSON.parse(execFileSync('/home/frappe/frappe-bench/env/bin/python', [path.join(HERE, 'site-session.py')], { cwd: '/home/frappe/frappe-bench/sites', encoding: 'utf8' }))
  : [];
let authenticated = false;
for (const sid of sessions) {
  await context.addCookies([{ name: 'sid', value: sid, url: BASE, httpOnly: true, sameSite: 'Lax' }]);
  const response = await page.goto(BASE + '/api/method/frappe.auth.get_logged_user');
  if (response.ok() && (await response.json()).message === 'Administrator') { authenticated = true; break; }
}
if (!authenticated) {
  await browser.close();
  throw new Error('No usable session. Supply SID securely or LOCAL_SESSION=1 on the authorized local bench.');
}
const results = [];
try {
  await page.goto(BASE + '/app', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.frappe?.boot && window.frappe?.new_doc, { timeout: 60000 });
  for (const shot of shots.filter(s => !only || only.test(s.name))) {
    try {
      const errorStart = errors.length;
      const blockedStart = blockedCalls.length;
      if (shot.doctype) {
        await page.evaluate(async dt => {
          await frappe.model.with_doctype(dt);
          if (frappe.get_meta(dt).issingle) await frappe.set_route('Form', dt, dt);
          else await frappe.new_doc(dt);
        }, shot.doctype);
        await page.waitForTimeout(500);
        const fullForm = page.locator('.modal:visible').getByText('Edit Full Form', { exact: true }).first();
        if (await fullForm.isVisible()) await fullForm.click();
        await page.waitForFunction(dt => window.cur_frm?.doctype === dt && cur_frm.fields_dict && Object.keys(cur_frm.fields_dict).length > 0, shot.doctype);
      } else {
        await page.goto(BASE + shot.url, { waitUntil: 'domcontentloaded' });
      }
      await page.waitForTimeout(1800);
      if (shot.tab) {
        await page.locator('.form-tabs .nav-link').filter({ hasText: shot.tab }).first().click();
        await page.waitForTimeout(500);
      }
      if (shot.scroll) {
        await page.evaluate(fieldname => document.querySelector(`.form-layout [data-fieldname="${fieldname}"]`)?.scrollIntoView({ block: 'start' }), shot.scroll);
        await page.waitForTimeout(300);
      }
      await page.keyboard.press('Escape');
      if (shot.menu) await page.locator('.navbar .dropdown-navbar-user .dropdown-toggle, .navbar .avatar').first().click();
      // Hide personal defaults, account identity, record pickers, and comments.
      const mask = page.locator('.navbar .avatar, [data-fieldname="employee"] .control-input, [data-fieldname="employee_name"] .control-input, [data-fieldname="custom_employee_name"] .control-input, [data-fieldname="company"] .control-input, .form-footer, .sidebar-menu .user-menu, .list-row-container, .widget.number-widget-box .number, .report-wrapper .dt-scrollable');
      const masks = [mask];
      // personal data of an existing record (e.g. a subscriber's name, ID and phone)
      for (const fieldname of shot.maskFields || []) masks.push(page.locator(`[data-fieldname="${fieldname}"] .control-input, [data-fieldname="${fieldname}"] .control-value`));
      if (shot.doctype === 'BioTime Setting') masks.push(page.locator('[data-fieldname="url"] .control-input, [data-fieldname="user_name"] .control-input, [data-fieldname="password"] .control-input'));
      await page.screenshot({ path: path.join(OUT, shot.name + '.png'), fullPage: false, mask: masks, maskColor: '#e2e8f0' });
      const fields = shot.doctype ? await page.evaluate(() => Object.values(cur_frm.fields_dict).filter(f => f.$wrapper?.is(':visible')).map(f => f.df.fieldname)) : [];
      results.push({ name: shot.name, doctype: shot.doctype, url: shot.url, captured: true, fields, errors: errors.slice(errorStart), blockedCalls: [...new Set(blockedCalls.slice(blockedStart))] });
      console.log('Captured', shot.name, 'form errors:', errors.length - errorStart);
    } catch (error) {
      results.push({ name: shot.name, captured: false, error: error.message.split('\n')[0] });
      console.log('Failed', shot.name, error.message.split('\n')[0]);
    }
  }
} finally {
  await browser.close();
  fs.writeFileSync('/tmp/ion-manual-screenshot-report.json', JSON.stringify(results, null, 2));
}
if (results.some(r => !r.captured)) process.exitCode = 1;
