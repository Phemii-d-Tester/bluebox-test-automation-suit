/* Builds a shareable PDF test report from the Playwright JSON results + per-test
 * screenshots produced by playwright.report.config.js.
 * Usage: node scripts/generate-report.js
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '..');
const results = require(path.join(ROOT, 'report', 'results.json'));

const esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const stripTags = (s) => String(s || '').replace(/@\S+/g, '').replace(/\s+/g, ' ').trim();
const fileUrl = (p) => 'file://' + encodeURI(p);

// --- Flatten the suite tree into a list of test cases ---
const cases = [];
function walk(suite, chain) {
  const title = suite.title || '';
  const isFile = /\.(spec|setup)\.(js|ts)$/.test(title) || title.includes('/');
  const nextChain = title && !isFile ? [...chain, stripTags(title)] : chain;
  (suite.specs || []).forEach((spec) => {
    (spec.tests || []).forEach((t) => {
      const res = (t.results || [])[t.results.length - 1] || {};
      const shot = (res.attachments || []).find((a) => a.name === 'screenshot' && a.path);
      const anns = [...(t.annotations || []), ...(res.annotations || [])];
      cases.push({
        file: path.basename(spec.file || ''),
        group: nextChain[0] || 'Other',
        sub: nextChain.slice(1).join(' › '),
        title: stripTags(spec.title),
        outcome: t.status, // expected | unexpected | flaky | skipped
        duration: res.duration || 0,
        screenshot: shot ? shot.path : null,
        annotations: anns.filter((a) => a.description),
      });
    });
  });
  (suite.suites || []).forEach((s) => walk(s, nextChain));
}
(results.suites || []).forEach((s) => walk(s, []));

// --- Group by module (spec file) ---
const ORDER = [
  'auth.setup.js', 'login.spec.js', 'dashboard.auth.spec.js', 'create-event.auth.spec.js',
  'event-dashboard.auth.spec.js', 'single-event.auth.spec.js', 'edit-event.auth.spec.js',
  'add-guest.auth.spec.js', 'track-guest.auth.spec.js', 'host-view-guest.auth.spec.js',
  'guest-group.auth.spec.js', 'edit-guest-dietary.auth.spec.js', 'view-seating.auth.spec.js',
  'open-floor.auth.spec.js', 'create-zone.auth.spec.js', 'add-table.auth.spec.js',
  'floor-plan.auth.spec.js', 'drag-guest.auth.spec.js', 'edit-delete-table.auth.spec.js',
  'unassigned-guest-filter.auth.spec.js', 'copy-completed-event.auth.spec.js',
  'activation-gates.auth.spec.js', 'menu-builder.auth.spec.js', 'add-menu.auth.spec.js',
  'display-menu.auth.spec.js', 'food-summary.auth.spec.js', 'guest-invite.spec.js',
  'guest-respond.spec.js', 'guest-select-meal.spec.js', 'guest-find-seat.spec.js',
];
const byModule = new Map();
for (const c of cases) {
  if (!byModule.has(c.file)) byModule.set(c.file, { name: c.group, file: c.file, tests: [] });
  byModule.get(c.file).tests.push(c);
}
const modules = [...byModule.values()].sort(
  (a, b) => (ORDER.indexOf(a.file) + 1 || 999) - (ORDER.indexOf(b.file) + 1 || 999)
);

const st = results.stats;
const totals = {
  total: cases.length,
  passed: cases.filter((c) => c.outcome === 'expected').length,
  flaky: cases.filter((c) => c.outcome === 'flaky').length,
  skipped: cases.filter((c) => c.outcome === 'skipped').length,
  failed: cases.filter((c) => c.outcome === 'unexpected').length,
};
const ran = totals.passed + totals.flaky + totals.failed;
const passRate = ran ? Math.round(((totals.passed + totals.flaky) / ran) * 100) : 0;
const mins = Math.round((st.duration / 60000) * 10) / 10;
const dateStr = new Date(st.startTime).toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
const baseURL =
  (results.config && results.config.projects && results.config.projects[0] &&
    results.config.projects[0].use && results.config.projects[0].use.baseURL) ||
  'user-app-bluebox-dev.azurewebsites.net';

// --- Findings (auto-extracted from fail/fixme/skip annotations) ---
const findings = [];
for (const c of cases) {
  for (const a of c.annotations) {
    if (['fail', 'fixme', 'skip'].includes(a.type)) {
      findings.push({ type: a.type, where: `${c.group}${c.sub ? ' › ' + c.sub : ''} › ${c.title}`, desc: a.description });
    }
  }
}
const FINDING_LABEL = { fail: 'KNOWN BUG', fixme: 'BLOCKED', skip: 'SKIPPED' };

const badge = (o) =>
  ({ expected: '<span class="b pass">PASS</span>', unexpected: '<span class="b fail">FAIL</span>',
     flaky: '<span class="b flaky">FLAKY</span>', skipped: '<span class="b skip">SKIPPED</span>' }[o] || o);

// --- HTML ---
let html = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #1f2937; margin: 0; font-size: 12px; }
  h1 { font-size: 26px; margin: 0 0 4px; }
  h2 { font-size: 17px; margin: 26px 0 8px; padding-bottom: 6px; border-bottom: 2px solid #4157fb; color: #111827; }
  h3 { font-size: 13px; margin: 14px 0 6px; color: #374151; }
  .muted { color: #6b7280; }
  .cover { padding: 40px 30px 10px; }
  .cards { display: flex; gap: 10px; flex-wrap: wrap; margin: 16px 0; }
  .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 16px; min-width: 110px; }
  .card .n { font-size: 24px; font-weight: 700; }
  .card .l { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: .04em; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #eef0f3; font-size: 11.5px; vertical-align: top; }
  th { background: #f8fafc; color: #475569; font-weight: 600; }
  .b { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; color: #fff; }
  .b.pass { background: #16a34a; } .b.fail { background: #dc2626; } .b.flaky { background: #d97706; } .b.skip { background: #6b7280; }
  .test { border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; margin: 10px 0; break-inside: avoid; }
  .test .hd { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; }
  .test .ti { font-weight: 600; }
  .test img { width: 100%; max-width: 640px; border: 1px solid #e5e7eb; border-radius: 6px; margin-top: 8px; display: block; }
  .mod { break-before: page; }
  .fnd { border-left: 4px solid #d97706; background: #fffbeb; padding: 8px 12px; margin: 8px 0; border-radius: 4px; }
  .fnd .t { font-weight: 700; font-size: 10px; color: #b45309; }
  .pill { display:inline-block; padding:1px 7px; border-radius:6px; background:#eef2ff; color:#4157fb; font-size:10px; font-weight:600; }
</style></head><body>`;

// Cover + summary
html += `<div class="cover">
  <div class="pill">BlueBox Test Automation Suite</div>
  <h1>End-to-End Test Report</h1>
  <div class="muted">Playwright · Page Object Model · ${esc(dateStr)}</div>
  <div class="muted">Target: ${esc(baseURL)}</div>
  <div class="cards">
    <div class="card"><div class="n">${totals.total}</div><div class="l">Total tests</div></div>
    <div class="card"><div class="n" style="color:#16a34a">${totals.passed}</div><div class="l">Passed</div></div>
    <div class="card"><div class="n" style="color:#d97706">${totals.flaky}</div><div class="l">Flaky (passed on retry)</div></div>
    <div class="card"><div class="n" style="color:#dc2626">${totals.failed}</div><div class="l">Failed</div></div>
    <div class="card"><div class="n" style="color:#6b7280">${totals.skipped}</div><div class="l">Skipped</div></div>
    <div class="card"><div class="n">${passRate}%</div><div class="l">Pass rate</div></div>
    <div class="card"><div class="n">${mins}m</div><div class="l">Duration</div></div>
  </div>`;

// Coverage table
html += `<h2>Coverage by module</h2><table><tr><th>Module</th><th>Tests</th><th>Passed</th><th>Flaky</th><th>Skipped</th><th>Failed</th></tr>`;
for (const m of modules) {
  const p = m.tests.filter((t) => t.outcome === 'expected').length;
  const fl = m.tests.filter((t) => t.outcome === 'flaky').length;
  const sk = m.tests.filter((t) => t.outcome === 'skipped').length;
  const fa = m.tests.filter((t) => t.outcome === 'unexpected').length;
  html += `<tr><td>${esc(m.name)} <span class="muted">(${esc(m.file)})</span></td><td>${m.tests.length}</td><td>${p}</td><td>${fl}</td><td>${sk}</td><td>${fa ? '<b style="color:#dc2626">' + fa + '</b>' : 0}</td></tr>`;
}
html += `</table>`;

// Findings
if (findings.length) {
  html += `<h2>Findings &amp; known issues (${findings.length})</h2>
    <div class="muted" style="margin-bottom:8px">Auto-extracted from documented <code>test.fail</code> / <code>fixme</code> / conditional-skip annotations in the suite.</div>`;
  for (const f of findings) {
    html += `<div class="fnd"><div class="t">${FINDING_LABEL[f.type]}</div><div><b>${esc(f.where)}</b></div><div class="muted">${esc(f.desc)}</div></div>`;
  }
}
html += `</div>`;

// Per-module detail with screenshots
for (const m of modules) {
  html += `<div class="mod"><h2>${esc(m.name)}</h2><div class="muted">${esc(m.file)} — ${m.tests.length} test(s)</div>`;
  for (const t of m.tests) {
    html += `<div class="test"><div class="hd"><div class="ti">${esc(t.sub ? t.sub + ' › ' : '')}${esc(t.title)}</div><div>${badge(t.outcome)} <span class="muted">${Math.round(t.duration)}ms</span></div></div>`;
    if (t.annotations.length) {
      html += t.annotations.filter((a) => a.description).map((a) => `<div class="muted" style="font-size:10.5px">↳ ${esc(a.type)}: ${esc(a.description)}</div>`).join('');
    }
    if (t.screenshot && fs.existsSync(t.screenshot)) {
      html += `<img src="${fileUrl(t.screenshot)}">`;
    } else {
      html += `<div class="muted" style="font-size:10.5px">(no screenshot — test skipped)</div>`;
    }
    html += `</div>`;
  }
  html += `</div>`;
}
html += `</body></html>`;

const htmlPath = path.join(ROOT, 'report', 'report.html');
fs.writeFileSync(htmlPath, html);
console.log('Wrote', htmlPath, '(' + Math.round(html.length / 1024) + ' KB), cases:', cases.length, 'findings:', findings.length);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(fileUrl(htmlPath), { waitUntil: 'networkidle', timeout: 120000 });
  const pdfPath = path.join(ROOT, 'report', 'BlueBox-E2E-Test-Report.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', bottom: '14mm', left: '10mm', right: '10mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate:
      '<div style="font-size:8px;width:100%;text-align:center;color:#9ca3af">BlueBox E2E Test Report — <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  });
  await browser.close();
  const kb = Math.round(fs.statSync(pdfPath).size / 1024);
  console.log('Wrote', pdfPath, '(' + kb + ' KB)');
})();
