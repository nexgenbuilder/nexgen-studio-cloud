// End-to-end verification of the AGREED FLOW against the local e2e server:
//   1. Muse (this script, via the operator API): upload a clip, create a
//      clip row, create a project from a template with shots + text.
//   2. Ricardo's side (Playwright, Android phone emulation): open the same
//      project in the studio UI, verify shots/text/brand intact, open the
//      export dialog, and download a finished MP4 through downloads.save.
//   3. Verify the finished MP4 is also recorded in R2 and retrievable
//      through the API (for Drive delivery).
// No full render by default (the parent's re-export is running on this VM).
// Pass --full-export to also run a real 5s render on the mobile viewport
// (only when no other render is running — it takes ~8+ min here).
// Usage: node test/e2e-server.mjs (in another shell, port 8770), then:
//   node test/e2e-mobile.mjs [--full-export]
import { chromium } from '/home/hatch/workspace/nexgen-studio-v23-30-test/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const BASE = 'http://localhost:8770';
const OPERATOR = 'test-operator-key';
const PASSWORD = 'test-password';
const FULL_EXPORT = process.argv.includes('--full-export');
const OUT = new URL('./out/', import.meta.url).pathname;
const results = {};
function check(name, ok, detail) {
  results[name] = { ok: !!ok, detail: detail || '' };
  console.log((ok ? '  ok  ' : '  FAIL ') + name + (detail ? ' — ' + detail : ''));
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const api = (path, opts = {}) => fetch(BASE + path, {
  ...opts,
  headers: { authorization: `Bearer ${OPERATOR}`, ...(opts.headers || {}) },
});

// 0. Tiny test clip: 2s, 320x240, 30fps H.264 (no audio) -> 60 frames.
const CLIP = '/tmp/e2e_clip.mp4';
if (!fs.existsSync(CLIP)) {
  execSync(`ffmpeg -y -v error -f lavfi -i testsrc=duration=2:size=320x240:rate=30 -c:v libx264 -pix_fmt yuv420p -movflags +faststart ${CLIP}`);
}
const clipBytes = fs.readFileSync(CLIP);
const clipSize = clipBytes.length;
console.log('test clip:', clipSize, 'bytes');

// 1. Login (form POST) -> extract the nx-auth cookie hash for the browser.
const loginRes = await fetch(BASE + '/api/login', {
  method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: `password=${PASSWORD}`, redirect: 'manual',
});
const setCookie = loginRes.headers.get('set-cookie') || '';
const cookieHash = (/nx-auth=([0-9a-f]+)/.exec(setCookie) || [])[1] || '';
check('login sets auth cookie', loginRes.status === 302 && !!cookieHash, 'status ' + loginRes.status);

// 2. Upload the clip through the operator API (presigned PUT, direct to R2 stub).
const upRes = await api('/_up', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'e2e_clip.mp4', type: 'video/mp4', size: clipSize }) });
const upJson = await upRes.json();
check('upload start returns presigned PUT', upRes.status === 200 && !!upJson.uploadUrl, 'id ' + upJson.id);
const assetId = upJson.id;
const putRes = await fetch(upJson.uploadUrl, { method: 'PUT', headers: { 'content-type': 'video/mp4' }, body: clipBytes });
check('PUT clip bytes to R2 stub', putRes.status === 200, 'status ' + putRes.status);

// 3. Desktop browser: boot the studio, read the template's fields.
const browser = await chromium.launch({
  executablePath: '/home/hatch/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome',
  headless: true,
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--disable-features=local-network-access-check,LocalNetworkAccessCheck'],
});
const errs = [];
const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
// Both browser contexts need the auth cookie: the shim fetches /_db on every
// page load, and the API routes (and the page's db sync) reject unauthenticated
// calls — exactly like production, where Ricardo logs in first.
await desktop.addCookies([{ name: 'nx-auth', value: cookieHash, domain: 'localhost', path: '/', httpOnly: true, secure: false, sameSite: 'Lax' }]);
const page = await desktop.newPage();
page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
page.on('pageerror', (e) => errs.push('pageerror: ' + String(e).slice(0, 300)));
await page.goto(BASE + '/index.html');
await page.waitForFunction(() => window.__nxReady === true, null, { timeout: 60000 });
await page.waitForTimeout(2000);
check('studio boots (desktop)', true, 'brand ' + await page.evaluate(() => NX.app.B().name + ' / ' + NX.app.B().id));
const tpl = await page.evaluate(() => {
  const A = NX.app;
  const p = A.newProject(A.TPL('walkx_h'));
  A.openProject(p);
  return { dur: A.S.dur, fields: A.S.fields.map((f) => ({ type: f.type, key: f.key })) };
});
console.log('walkx_h template: dur', tpl.dur, 'fields', JSON.stringify(tpl.fields));
check('template walkx_h introspected', tpl.fields.length > 0 && tpl.fields.some((f) => f.type === 'shot'), tpl.fields.length + ' fields');

// 4. Create the clip row + the project through the API (the Muse flow).
const dbRes = await api('/_db');
const docs = (await dbRes.json()).docs || {};
docs['clips/utestclip1'] = { id: 'utestclip1', brand: 'dpg', name: 'e2e_clip', project: 'E2E_CLIP', file: '', w: 320, h: 240, n: 60, segs: [[0, 59]], asset: assetId, poster: '', src: 'up' };
const dbPut = await api('/_db', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ docs }) });
check('clip row written via /_db', dbPut.status === 200, 'status ' + dbPut.status);
const text = {}, shot = {};
for (const f of tpl.fields) {
  if (f.type === 'text') text[f.key] = 'E2E ' + f.key;
  else if (f.type === 'shot') shot[f.key] = { c: 'utestclip1', in: 0 };
}
const projRes = await api('/api/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ templateId: 'walkx_h', name: 'E2E Mobile Check', text, shot }) });
const projJson = await projRes.json();
const projectId = projJson.project && projJson.project.id;
check('project created via API', projRes.status === 201 && !!projectId, 'id ' + projectId + ' shots ' + Object.keys(shot).length + ' texts ' + Object.keys(text).length);

// 5. Desktop: reload (so the shim re-reads /_db, like Ricardo opening later),
//    verify the project is in the studio, open it, verify shots/text/brand.
await page.reload();
await page.waitForFunction(() => window.__nxReady === true, null, { timeout: 60000 });
await page.waitForFunction((pid) => window.__docs && window.__docs.has('projects/' + pid), projectId, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(1000);
const inDocs = await page.evaluate((pid) => window.__docs.has('projects/' + pid), projectId);
check('API project visible in studio db after reload', inDocs);
const opened = await page.evaluate((pid) => {
  const A = NX.app;
  const doc = window.__docs.get('projects/' + pid);
  if (!doc) return null;
  // No { stay: true }: openProject must switch to the workspace view, the
  // way it does when a user taps a project — otherwise #exportBtn (which
  // lives in the workspace) is never on screen.
  A.openProject(Object.assign(A.clone(doc), { saved: true }));
  return { id: A.S.proj.id, tpl: A.S.proj.tpl, brand: A.S.proj.brand, text: A.S.proj.text, shot: A.S.proj.shot, clipInLib: !!NX.CLIPS.get('utestclip1') };
}, projectId);
check('desktop opens API project with shots+text+brand intact',
  opened && opened.id === projectId && opened.tpl === 'walkx_h' && opened.brand === 'dpg' &&
  JSON.stringify(opened.text) === JSON.stringify(text) &&
  Object.keys(opened.shot).length === Object.keys(shot).length &&
  Object.values(opened.shot).every((s) => s.c === 'utestclip1') && opened.clipInLib,
  opened ? `tpl ${opened.tpl} brand ${opened.brand} shots ${Object.keys(opened.shot).length}` : 'openProject returned null');
await page.waitForTimeout(4000);
await page.screenshot({ path: OUT + 'desktop_project.png', timeout: 60000 });

// 6. Mobile (Android phone emulation): open the same project in the UI.
const mobile = await browser.newContext({
  viewport: { width: 412, height: 915 },
  isMobile: true, hasTouch: true, deviceScaleFactor: 2.625,
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
});
await mobile.addCookies([{ name: 'nx-auth', value: cookieHash, domain: 'localhost', path: '/', httpOnly: true, secure: false, sameSite: 'Lax' }]);
const mpage = await mobile.newPage();
mpage.on('console', (m) => { if (m.type() === 'error') errs.push('mobile console: ' + m.text().slice(0, 200)); });
mpage.on('pageerror', (e) => errs.push('mobile pageerror: ' + String(e).slice(0, 300)));
await mpage.goto(BASE + '/index.html');
await mpage.waitForFunction(() => window.__nxReady === true, null, { timeout: 60000 });
await mpage.waitForTimeout(2500);
await mpage.screenshot({ path: OUT + 'mobile_home.png', timeout: 60000 });
const mInDocs = await mpage.evaluate((pid) => window.__docs.has('projects/' + pid), projectId);
check('mobile: API project visible in studio db', mInDocs);
const mOpened = await mpage.evaluate((pid) => {
  const A = NX.app;
  const doc = window.__docs.get('projects/' + pid);
  if (!doc) return null;
  // No { stay: true }: must switch to the workspace view so the export
  // button is on screen, exactly as when Ricardo taps the project.
  A.openProject(Object.assign(A.clone(doc), { saved: true }));
  return { id: A.S.proj.id, tpl: A.S.proj.tpl, brand: A.S.proj.brand, nText: Object.keys(A.S.proj.text || {}).length, nShot: Object.keys(A.S.proj.shot || {}).length };
}, projectId);
check('mobile: opens API project intact', mOpened && mOpened.id === projectId && mOpened.tpl === 'walkx_h' && mOpened.brand === 'dpg',
  mOpened ? `texts ${mOpened.nText} shots ${mOpened.nShot}` : 'null');
await mpage.waitForTimeout(4000);
await mpage.screenshot({ path: OUT + 'mobile_project.png', timeout: 60000 });

// 7. Export dialog reachable on mobile (open it, screenshot, cancel — no render yet).
const expBtn = mpage.locator('#exportBtn');
const expVisible = await expBtn.isVisible().catch(() => false);
let expBox = null;
if (expVisible) { try { expBox = await expBtn.boundingBox(); } catch (e) {} }
check('mobile: export button visible', expVisible, expBox ? `at x=${Math.round(expBox.x)} y=${Math.round(expBox.y)} w=${Math.round(expBox.width)}` : 'no box');
if (expVisible) {
  await expBtn.scrollIntoViewIfNeeded().catch(() => {});
  await expBtn.click().catch((e) => check('mobile: export button clickable', false, String(e).slice(0, 120)));
  await mpage.waitForTimeout(800);
  const goVisible = await mpage.locator('#exGo').isVisible().catch(() => false);
  check('mobile: export dialog opens (#exGo visible)', goVisible);
  await mpage.screenshot({ path: OUT + 'mobile_export_dialog.png', timeout: 60000 });
  if (FULL_EXPORT) {
    console.log('FULL EXPORT: starting real render on mobile viewport (15.5s clip, ~25 min here)...');
    await mpage.locator('#exGo').click();
    let done = false;
    for (let i = 0; i < 60; i++) {
      await sleep(30000);
      const st = await mpage.evaluate(() => document.querySelector('#exStatus').textContent + ' | ' + document.querySelector('#exCount').textContent + ' | saveHidden=' + document.querySelector('#exSave').hidden);
      console.log('  export t+' + ((i + 1) * 30) + 's:', st);
      if (!await mpage.evaluate(() => document.querySelector('#exSave').hidden)) { done = true; break; }
    }
    check('mobile: full 5s export rendered', done);
  } else {
    await mpage.locator('#exCancel').click().catch(() => {});
  }
}

// 8. Finished-MP4 download on mobile + R2 record (synthetic blob via the real path).
const dlPromise = mpage.waitForEvent('download', { timeout: 30000 }).catch(() => null);
const savedSize = await mpage.evaluate(async (aid) => {
  const r = await fetch('/_blob/' + aid);
  const blob = await r.blob();
  const dl = await window.claude.use('downloads');
  await dl.save({ data: blob, filename: 'e2e-export.mp4' });
  return blob.size;
}, assetId);
const dl = await dlPromise;
check('mobile: downloads.save fires a real download', !!dl, dl ? 'file ' + dl.suggestedFilename() : 'no download event');
if (dl) {
  await dl.saveAs('/tmp/e2e-downloaded.mp4').catch(() => {});
  const gotSize = fs.existsSync('/tmp/e2e-downloaded.mp4') ? fs.statSync('/tmp/e2e-downloaded.mp4').size : -1;
  check('mobile: downloaded file matches the export bytes', gotSize === savedSize, `got ${gotSize} want ${savedSize}`);
}
let uploadState = null;
for (let i = 0; i < 20; i++) {
  uploadState = await mpage.evaluate(() => window.__exportUpload || null);
  if (uploadState && (uploadState.status === 'done' || uploadState.status === 'failed')) break;
  await sleep(3000);
}
check('mobile: finished MP4 recorded to R2 via API', uploadState && uploadState.status === 'done', JSON.stringify(uploadState));
if (uploadState && uploadState.jobId) {
  const jobRes = await api('/api/exports/' + uploadState.jobId);
  const job = (await jobRes.json()).job;
  check('API: export job is done with downloadUrl', job && job.status === 'done' && !!job.downloadUrl, 'status ' + (job && job.status));
  const fileRes = await fetch(BASE + job.downloadUrl, { headers: { authorization: `Bearer ${OPERATOR}` }, redirect: 'manual' });
  const loc = fileRes.headers.get('location') || '';
  check('API: finished file redirects to signed R2 URL', fileRes.status === 302 && loc.includes('localhost:8770/s3/'), 'status ' + fileRes.status);
  const fileBytes = await (await fetch(loc)).arrayBuffer();
  check('API: retrieved file bytes match the export', fileBytes.byteLength === savedSize, `got ${fileBytes.byteLength} want ${savedSize}`);
}

const realErrs = errs.filter((e) => !/404|did not load|library\/sources|library\/align|TUNNEL/.test(e));
check('no unexpected page errors', realErrs.length === 0, realErrs.slice(0, 3).join(' || '));
await browser.close();
const failed = Object.entries(results).filter(([, r]) => !r.ok);
console.log(`\n${Object.keys(results).length - failed.length}/${Object.keys(results).length} checks passed`);
if (failed.length) console.log('FAILED:', failed.map(([k]) => k).join(', '));
process.exit(failed.length ? 1 : 0);
