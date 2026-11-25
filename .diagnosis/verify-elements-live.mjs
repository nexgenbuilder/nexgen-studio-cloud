// Live verification for the template unlock (chunk 1: commit fa09438c, dpl_5cRqwpMa2V4FjySaZEgKg3qkEfR6;
// chunk 2 adds the 7 tpl_brand.js formats; chunk 3 adds the 16 tpl_food.js / tpl_food2.js formats;
// chunk 5 adds the 19 tpl_trade.js / tpl_trade2.js formats (flashsale runs under Webflix: K9-gated).
// For 15 template formats: Elements list appears in the inspector,
// Select jumps the playhead, drag moves the element live, one undo restores, text is editable,
// dup/del work where offered. Then regression: 5 real projects render frames.
// Then a free-edit drag spot-check (snap guide + group drag + one undo).
// Then deletes every scratch project it created.
// Usage: node verify-elements-live.mjs (run from ~/workspace/nexgen-studio-cloud/.diagnosis)
import { chromium } from '/home/hatch/workspace/nexgen-studio-v23-30-test/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const HOME = '/home/hatch';
const OUT = HOME + '/workspace/nexgen-studio-cloud/.diagnosis';
const BASE = 'https://nexgen-studio-cloud-nexgen-c282.vercel.app';
const CHROME = HOME + '/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome';

function readSecret(file, name) {
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#') || !t.includes('=')) continue;
    const [k, v] = t.split('=', 2);
    if (k.trim() === name) return v.trim();
  }
  throw new Error(name + ' not found');
}
const password = readSecret(HOME + '/workspace/nexgen-studio-secrets.env', 'STUDIO_PASSWORD');
const policy = 'hatch-webgl-allowed-domains-v1\nnexgen-studio-cloud-nexgen-c282.vercel.app\nexample.com\n';
const policyPath = OUT + '/webgl-policy-cloud.txt';
fs.writeFileSync(policyPath, policy);
const policySha = crypto.createHash('sha256').update(policy).digest('hex');

const browser = await chromium.launch({
  executablePath: CHROME, headless: true,
  args: ['--no-sandbox', '--ignore-certificate-errors', '--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    '--hatch-webgl-allowed-domains-file=' + policyPath,
    '--hatch-webgl-allowed-domains-sha256=' + policySha,
    '--disable-features=local-network-access-check,LocalNetworkAccessCheck'],
});
const ctx = await browser.newContext({
  viewport: { width: 412, height: 915 },
  isMobile: true, hasTouch: true, deviceScaleFactor: 2,
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  proxy: { server: 'http://127.0.0.1:18080' },
});
const page = await ctx.newPage();
const errs = [], failedReqs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
page.on('pageerror', e => errs.push('pageerror: ' + String((e && e.stack) || e).slice(0, 400)));
page.on('response', r => { if (r.status() >= 400) failedReqs.push(r.status() + ' ' + r.url().slice(0, 160)); });
page.on('requestfailed', r => { if (!/blob:/.test(r.url())) failedReqs.push('FAILED ' + r.url().slice(0, 160)); });

const boot = async () => {
  await page.goto(BASE + '/', { timeout: 60000 });
  if (page.url().includes('/login.html')) {
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(u => !u.toString().includes('/login.html'), { timeout: 30000 });
  }
  await page.waitForFunction(() => window.__nxReady === true, null, { timeout: 90000 });
  await page.waitForTimeout(2500);
};
const toScreen = async (cx, cy) => {
  const r = await page.locator('#screen').boundingBox();
  return { x: r.x + (cx / 1080) * r.width, y: r.y + (cy / 1920) * r.height };
};
const getEls = (bid) => page.evaluate((bid) => {
  const B = window.FREE && window.FREE.BLOCKS && window.FREE.BLOCKS[bid];
  if (!B || !B.dir) return { err: 'no BLOCKS for ' + bid };
  const list = (typeof B.dir.elements === 'function' ? B.dir.elements() : []) || [];
  return { dur: B.dir.dur, list: list.map(d => ({ id: d.id, kind: d.kind, label: d.label, x: Math.round(d.x), y: Math.round(d.y), t0: d.t0, d: d.d, box: d.box, dup: !!d.dup, del: !!d.del })) };
}, bid);
const domRows = () => page.evaluate(() => {
  const secs = [...document.querySelectorAll('#einsp section.grp')];
  const g = secs.find(s => (s.querySelector('h3') || {}).textContent === 'Elements — drag on the preview');
  if (!g) return { err: 'no Elements group' };
  return [...g.querySelectorAll(':scope > div.fld')].map(r => {
    const lab = r.querySelector('.lab');
    return { lab: lab ? lab.textContent.trim() : '', btns: [...r.querySelectorAll('button')].map(b => b.textContent.trim()) };
  });
});
const blockEl = (bid) => page.evaluate((bid) => {
  const it = NX.app.S.proj.tl.main.find(x => x.id === bid);
  return it ? (it.el ? JSON.parse(JSON.stringify(it.el)) : {}) : { err: 'no block' };
}, bid);
// the stored position for one descriptor, from the block's `el`
const elPosOf = (el, d) => {
  if (!el) return undefined;
  if (d.kind === 'callout' && String(d.id).startsWith('x')) { const ex = (el.extra || []).find(e => 'x' + e.id === d.id); return ex ? { x: ex.x, y: ex.y } : undefined; }
  if (d.kind === 'callout' || d.kind === 'pos') return el.pos ? el.pos[d.id] : undefined;
  if (d.kind === 'focus') { const k = String(d.id).replace(/^fx/, ''); return el.fx ? el.fx[k] : undefined; }
  if (d.kind === 'box') return el.box || undefined;
  if (d.kind === 'card') return el.card || undefined;
  return undefined;
};
const clickRowBtn = async (labelSub, btnText) => {
  // find the Elements row whose label contains labelSub, click its button btnText
  const ok = await page.evaluate(({ labelSub, btnText }) => {
    const secs = [...document.querySelectorAll('#einsp section.grp')];
    const g = secs.find(s => (s.querySelector('h3') || {}).textContent === 'Elements — drag on the preview');
    if (!g) return false;
    for (const r of g.querySelectorAll(':scope > div.fld')) {
      const lab = r.querySelector('.lab');
      if (lab && lab.textContent.includes(labelSub)) {
        const b = [...r.querySelectorAll('button')].find(x => x.textContent.trim() === btnText);
        if (b) { b.click(); return true; }
      }
    }
    return false;
  }, { labelSub, btnText });
  return ok;
};
// exact row match: the DOM row label is `d.label + '  ·  ' + x + ', ' + y`.
// Substring matching is WRONG for callouts — a duplicate shares its source's
// label by design (dupEl stores text: d.label), so clickRowBtn('DRIVEWAYS')
// always hits the original's row first and "delete dup" deletes the original
// (proven by diag-probe.mjs). Match the full row label (label + coordinates),
// which is unique per element.
const rowLabelOf = d => d.label + '  ·  ' + Math.round(d.x) + ', ' + Math.round(d.y);
const clickRowBtnExact = async (rowLabel, btnText) => {
  const ok = await page.evaluate(({ rowLabel, btnText }) => {
    const secs = [...document.querySelectorAll('#einsp section.grp')];
    const g = secs.find(s => (s.querySelector('h3') || {}).textContent === 'Elements — drag on the preview');
    if (!g) return false;
    for (const r of g.querySelectorAll(':scope > div.fld')) {
      const lab = r.querySelector('.lab');
      if (lab && lab.textContent.trim() === rowLabel) {
        const b = [...r.querySelectorAll('button')].find(x => x.textContent.trim() === btnText);
        if (b) { b.click(); return true; }
      }
    }
    return false;
  }, { rowLabel, btnText });
  return ok;
};
// first text input in a non-Elements field group
const findTextField = () => page.evaluate(() => {
  const secs = [...document.querySelectorAll('#einsp section.grp')];
  for (const s of secs) {
    const h = (s.querySelector('h3') || {}).textContent || '';
    if (h === 'Elements — drag on the preview' || h === 'Footage in the block' || h === 'Length') continue;
    const inp = s.querySelector('input[type="text"]');
    if (inp) return { id: inp.id, label: ((s.querySelector('label') || {}).textContent || '').trim(), value: inp.value };
  }
  return null;
});
// open the inspector sheet the real user way: tap Edit in #mbar. The bar
// re-renders on selection/sync changes, so a locator resolved once can detach
// mid-scroll (run 2c: wipex/ringx/mapx sheetErr). Re-resolve the button fresh
// on every attempt; fall back to the exact code path the button runs.
const openSheet = async () => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const coords = await page.evaluate(() => {
      const b = [...document.querySelectorAll('#mbar button')].find(x => (x.textContent || '').trim() === 'Edit');
      if (!b) return null;
      const r = b.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    if (coords) {
      await page.touchscreen.tap(coords.x, coords.y);
      try {
        await page.waitForFunction(() => document.body.classList.contains('sheet-insp'), null, { timeout: 3000 });
        await page.waitForTimeout(600);
        return { via: 'button', attempt };
      } catch (e) { /* tap missed or sheet did not open; retry */ }
    }
    await page.waitForTimeout(400);
  }
  await page.evaluate(() => { NX.editor.api.renderInspector(); NX.touch.sheet('insp', 'Edit'); });
  await page.waitForTimeout(600);
  const open = await page.evaluate(() => document.body.classList.contains('sheet-insp'));
  return { via: open ? 'api-fallback' : 'FAILED', attempt: 3 };
};

const scratchIds = [];
const results = {};

async function testFormat(tplId) {
  const out = { tplId };
  try {
    await boot();
    await page.evaluate(() => { document.getElementById('newEditBtn').click(); });
    await page.waitForFunction(() => document.body.classList.contains('mode-edit'), null, { timeout: 20000 });
    await page.waitForTimeout(1500);
    const scratchId = await page.evaluate(() => NX.app.S.proj.id);
    scratchIds.push(scratchId);
    out.scratchId = scratchId;
    const setup = await page.evaluate((tplId) => {
      const A = NX.app;
      const T = A.TPL(tplId);
      if (!T) return { err: 'no TPL ' + tplId };
      const p = A.S.proj;
      p.name = 'TEST ' + tplId;
      const bid = 'b' + A.uid8().slice(0, 8);
      p.tl.main = [{ id: bid, type: 'tpl', tpl: tplId, text: {}, shot: {}, d: 15 }];
      p.tl.layers = []; p.tl.sfx = [];
      A.edited(true);
      return { bid, file: T.file, v: T.v };
    }, tplId);
    if (setup.err) { out.err = setup.err; return out; }
    out.bid = setup.bid;
    await page.waitForTimeout(2500); // flush -> persist
    await page.evaluate(() => { NX.app.openProject(NX.app.S.proj); });
    await page.waitForTimeout(4000);
    await page.locator('.ti').first().click();
    await page.waitForTimeout(900);
    let els = await getEls(setup.bid);
    if (els.err) { out.err = els.err; return out; }
    // Duration patch (chunk 3): the block is created with d: 15, but most food
    // formats run 15–21s, so the largest-t0 target (usually 'end'/'cta') falls
    // outside a 15s block and Select/drag can never reach it. Stretch the
    // block to the template's own dur, persist, reopen, re-fetch.
    if (els.dur > 15) {
      out.durPatched = els.dur;
      await page.evaluate(({ bid, dur }) => {
        const it = NX.app.S.proj.tl.main.find(x => x.id === bid);
        it.d = dur; NX.app.edited(true);
      }, { bid: setup.bid, dur: els.dur });
      await page.waitForTimeout(2500); // flush -> persist
      await page.evaluate(() => { NX.app.openProject(NX.app.S.proj); });
      await page.waitForTimeout(4000);
      await page.locator('.ti').first().click();
      await page.waitForTimeout(900);
      const els2 = await getEls(setup.bid);
      if (els2.err) { out.err = els2.err; return out; }
      els = els2;
    }
    out.nElements = els.list.length;
    out.elements = els.list.map(d => d.id + '(' + d.kind + ')').join(',');
    const rows = await domRows();
    if (rows.err) { out.err = rows.err; return out; }
    out.nRows = rows.length;
    out.rowsMatch = rows.length === els.list.length && els.list.every(d => rows.some(r => r.lab.startsWith(d.label)));
    // pick the draggable element with the largest t0 (tests Select jump best)
    const draggables = els.list.filter(d => ['pos', 'callout', 'box', 'card', 'focus'].includes(d.kind));
    const target = draggables.sort((a, b) => b.t0 - a.t0)[0];
    if (!target) { out.err = 'no draggable element'; return out; }
    out.target = target.id;
    // move playhead OUT of the target window, then Select -> must jump in
    const dur = els.dur;
    const outside = target.t0 > 1 ? 0 : (target.t0 + target.d < dur - 0.2 ? dur - 0.1 : null);
    if (outside !== null) await page.evaluate((t) => NX.app.setT(t), outside);
    await page.waitForTimeout(400);
    const selOk = await clickRowBtnExact(rowLabelOf(target), 'Select');
    await page.waitForTimeout(700);
    const tAfter = await page.evaluate(() => NX.app.S.t);
    out.selectClicked = selOk;
    out.selectJumped = tAfter >= target.t0 && tAfter < target.t0 + target.d;
    out.tAfterSelect = +tAfter.toFixed(2);
    // drag it on the preview
    const [bx, by, bw, bh] = target.box;
    const cx = bx + bw / 2, cy = by + bh / 2;
    const dx = target.kind === 'card' ? 0 : (target.kind === 'box' ? 40 : 60);
    const dy = target.kind === 'card' ? 60 : (target.kind === 'box' ? 40 : 0);
    const preEl = await blockEl(setup.bid);
    const prePos = elPosOf(preEl, target);
    const s0 = await toScreen(cx, cy);
    const s1 = await toScreen(cx + dx, cy + dy);
    await page.mouse.move(s0.x, s0.y);
    await page.mouse.down();
    for (let step = 1; step <= 6; step++) {
      await page.mouse.move(s0.x + (s1.x - s0.x) * step / 6, s0.y + (s1.y - s0.y) * step / 6, { steps: 2 });
      await page.waitForTimeout(100);
    }
    await page.mouse.up();
    await page.waitForTimeout(1200);
    const postEl = await blockEl(setup.bid);
    const postPos = elPosOf(postEl, target);
    const moved = JSON.stringify(postPos) !== JSON.stringify(prePos) && postPos !== undefined;
    out.dragMoved = moved;
    out.prePos = prePos === undefined ? 'none' : JSON.stringify(prePos);
    out.postPos = postPos === undefined ? 'none' : JSON.stringify(postPos);
    // one undo restores
    await page.evaluate(() => { const u = document.getElementById('edUndo'); if (u) u.click(); });
    await page.waitForTimeout(1200);
    const undoEl = await blockEl(setup.bid);
    const undoPos = elPosOf(undoEl, target);
    out.undoRestored = JSON.stringify(undoPos) === JSON.stringify(prePos);
    // On mobile the inspector is a bottom sheet (visibility:hidden until opened
    // via Edit in #mbar — nx-touch.js). The harness must open it the real user
    // way first; filling a closed-sheet input fails "element is not visible"
    // (proven harness artifact, diag-text-vis.mjs — NOT a product bug).
    // openSheet retries the real tap and falls back to the button's own code path.
    const sheet = await openSheet();
    out.sheetVia = sheet.via + '/attempt' + sheet.attempt;
    let field = await findTextField();
    if (field) {
      const textBefore = await page.evaluate((bid) => JSON.stringify(NX.app.S.proj.tl.main.find(x => x.id === bid).text || {}), setup.bid);
      const tryFill = async (fid) => {
        const loc = page.locator('#' + fid);
        await loc.scrollIntoViewIfNeeded({ timeout: 5000 });
        await loc.fill('TEST 123', { timeout: 8000 });
      };
      try {
        await tryFill(field.id);
      } catch (e1) {
        // flake guard (mapx run 2d): #einsp can rebuild between the field
        // lookup and the fill, so the id goes stale — re-open the sheet and
        // re-resolve the field fresh, then try once more.
        try {
          await openSheet();
          const field2 = await findTextField();
          if (!field2) throw new Error('no field on retry');
          field = field2;
          await tryFill(field.id);
        } catch (e2) {
          // fall back to click + type (the input can sit below the fold in the inspector)
          try { const loc = page.locator('#' + field.id); await loc.click({ timeout: 5000 }); await page.keyboard.type('TEST 123', { delay: 20 }); }
          catch (e3) { out.textErr = String((e3 && e3.message) || e3).slice(0, 200); }
        }
      }
      await page.waitForTimeout(900);
      const textAfter = await page.evaluate((bid) => JSON.stringify(NX.app.S.proj.tl.main.find(x => x.id === bid).text || {}), setup.bid);
      out.textField = field.label;
      out.textEdited = textBefore !== textAfter && textAfter.includes('TEST 123');
    } else out.textEdited = 'no-field';
    // The text edit leaves the input focused; renderInspector() refuses to
    // rebuild while a text input has focus ("don't rebuild under the cursor"),
    // so the Elements DOM goes stale and row clicks hit stale rows (run 2d:
    // delDup/delOrig false). A real tap blurs first; synthetic clicks don't —
    // blur + rebuild explicitly (proven by diag-probe2.mjs).
    await page.evaluate(() => { if (document.activeElement) document.activeElement.blur(); NX.editor.api.renderInspector(); });
    await page.waitForTimeout(600);
    // dup/del (walkx callouts only). Rows are matched by FULL label (label +
    // coordinates): a duplicate shares its source's label, so substring
    // matching deletes the wrong row (diag-probe.mjs).
    if (tplId === 'walkx_h') {
      const callout = els.list.find(d => d.kind === 'callout');
      if (callout) {
        const n0 = (await getEls(setup.bid)).list.length;
        const dupOk = await clickRowBtnExact(rowLabelOf(callout), 'Duplicate');
        await page.waitForTimeout(900);
        const afterDup = await getEls(setup.bid);
        const dupRow = afterDup.list.find(d => String(d.id).startsWith('x'));
        out.dupOk = dupOk && afterDup.list.length === n0 + 1 && !!dupRow;
        if (dupRow) {
          await clickRowBtnExact(rowLabelOf(dupRow), 'Delete');
          await page.waitForTimeout(900);
          out.delDupOk = (await getEls(setup.bid)).list.length === n0;
        }
        await clickRowBtnExact(rowLabelOf(callout), 'Delete');
        await page.waitForTimeout(900);
        out.delOrigOk = (await getEls(setup.bid)).list.length === n0 - 1;
        await page.evaluate(() => {
          const secs = [...document.querySelectorAll('#einsp section.grp')];
          const g = secs.find(s => (s.querySelector('h3') || {}).textContent === 'Elements — drag on the preview');
          const b = g && [...g.querySelectorAll('button')].find(x => x.textContent.includes('Reset all element positions'));
          if (b) b.click();
        });
        await page.waitForTimeout(900);
        out.resetOk = (await getEls(setup.bid)).list.length === n0;
      }
    }
    out.ok = out.rowsMatch && out.selectJumped && out.dragMoved && out.undoRestored && out.textEdited === true;
    if (tplId === 'walkx_h') out.ok = out.ok && out.dupOk && out.delDupOk && out.delOrigOk && out.resetOk;
  } catch (e) { out.err = String((e && e.stack) || e).slice(0, 300); }
  return out;
}

// Extended 2026-11-25 for the 137 newly shipped formats (estate 16 + trade 19 + tail 102),
// plus the 16 food formats and 15 sampled chunk-1/brand formats carried over from the previously
// pushed script (168 registry ids total). The remaining chunk-1 factory formats were never
// live-scripted by id; the static harness (.diagnosis/verify-elements.mjs) remains the 183/183 source of truth.
// TPL ids (not harness 'v' values): estate sig/jlisted/openhouse/pricedrop/sold/hood/tour/agent,
// aerial/residence/journal/development/comingsoon/lease/luxury/commercial; tail sig wall/pick/dayinlife/...,
// site sitedrop/sitedroplap/sitedropfull/siteglow/siteoldnew/sitenone, v2 spot/thisor/upgrade,
// x expand/stories, edit review, kin service/drive/team, n1 gallery/trailer, n2 signs/listed/chat/questions,
// hol hgreet/hspecial/hhours/hcount. Batch via FORMATS env (comma list) + BATCH env (result suffix);
// SKIP_REG=1 skips the regression/drag sections (cleanup still runs per batch).
const ALL_FORMATS = [
  'sig', 'jlisted', 'openhouse', 'pricedrop', 'sold', 'hood', 'tour', 'agent',
  'aerial', 'residence', 'journal', 'development', 'comingsoon', 'lease', 'luxury', 'commercial',
  'blueprint', 'salon', 'barber', 'vreveal', 'event', 'pdrop', 'expert', 'crew',
  'timeline', 'glowup', 'swatch', 'shine', 'garage', 'party', 'venue', 'arrivals',
  'flashsale', 'tips', 'clientstory', 'wall', 'pick', 'dayinlife', 'oneword', 'pov',
  'notes', 'numbers', 'spotlight', 'rate', 'reply', 'episode', 'loop', 'banner',
  'cinema', 'ticker', 'split', 'lower3', 'postcard', 'textfill', 'kinetic', 'shapes',
  'wordswap', 'sting', 'ba', 'top3', 'myth', 'reveal', 'process', 'menu',
  'dish', 'special', 'herox', 'specialx', 'combox', 'chalkx', 'bax', 'thermox',
  'pizzax', 'heatx', 'papelx', 'recipex', 'stainx', 'nightx', 'checkx', 'plansx',
  'vanx', 'relistx', 'resignx', 'blueprintx', 'redoorx', 'bbpolex', 'bbchairx', 'neonx',
  'beadx', 'pressx', 'mockx', 'cardsx', 'flyerx', 'glossx', 'filterx', 'deliverx',
  'pxstart', 'pxquest', 'pxover', 'pxboss', 'pxcoin', 'pxba', 'pxbf', 'pxthanks',
  'pxloot', 'pxcab', 'pxhud', 'pxtype', 'pxscores', 'pxselect', 'pxvs', 'pxtokens',
  'sitedrop', 'sitedroplap', 'sitedropfull', 'siteglow', 'siteoldnew', 'sitenone', 'spot', 'thisor',
  'upgrade', 'expand', 'stories', 'review', 'service', 'drive', 'team', 'gallery',
  'trailer', 'signs', 'listed', 'chat', 'questions', 'hgreet', 'hspecial', 'hhours',
  'hcount',
  // food formats (chunks 1-3) — carried over from the previously pushed script so they are not dropped:
  'fire', 'chef', 'rush', 'ticket', 'icons', 'afterhours', 'burger', 'sushi',
  'cheese', 'pour', 'menuedit', 'street', 'latenight', 'fresh', 'catering', 'brunch',
  // sampled chunk-1/brand formats — live-verified in chunks 1-2 (walkx_h has extra dup/del/reset checks below):
  'walkx_h', 'wipex_h', 'lensx', 'listx', 'ringx', 'showx', 'searchx', 'mapx',
  'bo_frame', 'bo_headline', 'bo_contact', 'bo_message', 'bo_side', 'bo_special', 'bo_offer',];
const FORMATS = process.env.FORMATS ? process.env.FORMATS.split(',').filter(Boolean) : ALL_FORMATS;
// flashsale is K9-gated to non-DPG brands (discount): run it under Webflix, then switch back to DPG.
const switchBrand = async (name) => {
  await boot();
  await page.evaluate(() => { document.querySelector('#brandBtn').click(); });
  await page.waitForTimeout(800);
  await page.evaluate((name) => {
    const menu = document.querySelector('#brandMenu');
    const it = [...menu.querySelectorAll('button, [role="menuitemradio"]')].find(e => (e.textContent || '').toLowerCase().includes(name));
    if (it) it.click();
  }, name);
  await page.waitForTimeout(4000);
};
for (const f of FORMATS) {
  if (f === 'flashsale') await switchBrand('webflix');
  const r = await testFormat(f);
  if (f === 'flashsale') await switchBrand('dpg');
  results[f] = r;
  console.log((r.ok ? 'PASS ' : 'FAIL ') + f + ' els=' + (r.nElements ?? '?') + ' rows=' + (r.nRows ?? '?') + ' match=' + r.rowsMatch + ' durPatch=' + (r.durPatched ?? '-') + ' selJump=' + r.selectJumped + ' drag=' + r.dragMoved + ' undo=' + r.undoRestored + ' text=' + r.textEdited + ' sheet=' + (r.sheetVia ?? '?') + (r.dupOk !== undefined ? ' dup=' + r.dupOk + ' delDup=' + r.delDupOk + ' delOrig=' + r.delOrigOk + ' reset=' + r.resetOk : '') + (r.err ? ' ERR=' + r.err : ''));
}

// ---- regression: 5 real projects, frames at 3 timestamps ----
const reg = {}, dragRes = {};
if (!process.env.SKIP_REG) {
console.log('\n=== REGRESSION (5 real projects) ===');
async function checkProject(id, slug) {
  const mark = errs.length;
  await boot();
  const res = await page.evaluate(async (id) => {
    try {
      const A = NX.app;
      const p = window.__docs.get('projects/' + id);
      if (!p) return { openErr: 'project not in db: ' + id };
      A.openProject(Object.assign(A.clone(p), { saved: true }));
      return { opened: true };
    } catch (e) { return { openErr: String((e && e.stack) || e).slice(0, 300) }; }
  }, id);
  await page.waitForTimeout(5000);
  const frames = await page.evaluate(async () => {
    const out = {};
    try {
      const A = NX.app; await A.waitIdle();
      const dur = A.S.dur || 10;
      for (const t of [0.2, dur / 2, Math.max(0.2, dur - 0.5)]) {
        try { await A.drawFrame(t); out['t' + t.toFixed(1)] = 'ok'; }
        catch (e) { out['t' + t.toFixed(1)] = 'ERR: ' + String((e && e.message) || e).slice(0, 200); }
      }
    } catch (e) { out.allErr = String(e).slice(0, 200); }
    return out;
  });
  const newErrs = errs.slice(mark);
  const ok = res.opened && Object.values(frames).every(v => v === 'ok') && newErrs.length === 0;
  console.log((ok ? 'PASS ' : 'FAIL ') + slug + ' frames=' + JSON.stringify(frames) + ' newErrs=' + newErrs.length);
  return ok;
}
reg.poolside = await checkProject('p70be0jxy1lo', 'poolside_walkx');
reg.recentRingx = await checkProject('ptv2z65o40bg', 'recent_ringx');
reg.reveal = await checkProject('ps1udw60wd08', 'reveal_wipex');
reg.recentFree = await checkProject('pmwufjzlbrm8ke', 'recent_edit_free');
await page.evaluate(() => { document.querySelector('#brandBtn').click(); });
await page.waitForTimeout(800);
await page.evaluate(() => {
  const menu = document.querySelector('#brandMenu');
  const it = [...menu.querySelectorAll('button, [role="menuitemradio"]')].find(e => (e.textContent || '').toLowerCase().includes('webflix'));
  if (it) it.click();
});
await page.waitForTimeout(4000);
reg.webflix = await checkProject('pmnqy2g5i0em', 'webflix_showcase');

// ---- free-edit drag spot-check (snap guide + group drag + one undo) ----
console.log('\n=== FREE-EDIT DRAG SPOT-CHECK ===');
try {
  await boot();
  await page.evaluate(() => { document.getElementById('newEditBtn').click(); });
  await page.waitForFunction(() => document.body.classList.contains('mode-edit'), null, { timeout: 20000 });
  await page.waitForTimeout(2000);
  const dragScratch = await page.evaluate(() => NX.app.S.proj.id);
  scratchIds.push(dragScratch);
  dragRes.scratchId = dragScratch;
  await page.evaluate(() => {
    const p = NX.app.S.proj;
    // layers kept far apart (A ~250, B ~830) so their bboxes can never overlap
    // after the snap drag — the old geometry (A 400 / B 700, size 80) let the
    // two text boxes overlap, so the Shift+click hit the wrong layer and the
    // multi-select never formed (run 2 groupMovedBoth=false, harness artifact).
    p.tl.layers = [
      { id: 'layerA', kind: 'text', style: 'caps', text: 'DRAG A', x: 250, y: 960, size: 60, color: 'white', font: 'grotesk', t0: 0, d: 2.6 },
      { id: 'layerB', kind: 'text', style: 'caps', text: 'DRAG B', x: 830, y: 960, size: 60, color: 'white', font: 'grotesk', t0: 0, d: 2.6 },
    ];
    NX.app.edited(true);
  });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { NX.app.openProject(NX.app.S.proj); });
  await page.waitForTimeout(4000);
  await page.evaluate(() => { NX.app.setT(0); });
  await page.waitForTimeout(1000);
  const layerPos = () => page.evaluate(() => {
    const o = {};
    for (const L of NX.app.S.proj.tl.layers) o[L.id] = { x: L.x, y: L.y };
    return o;
  });
  const boxOf = (id) => page.evaluate((id) => {
    const L = NX.app.S.proj.tl.layers.find(l => l.id === id);
    const b = FREE.bbox(L, NX.app.S.t);
    return { cx: b[0] + b[2] / 2, cy: b[1] + b[3] / 2 };
  }, id);
  const ovGuideCount = () => page.evaluate(() => {
    const c = document.querySelector('#ov');
    if (!c) return { err: 'no #ov' };
    const g = c.getContext('2d');
    const d = g.getImageData(538, 0, 5, 1920).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] > 200 && d[i + 1] > 200 && d[i + 2] > 200 && d[i + 3] > 100) n++;
    return { whitePx: n };
  });
  const boxA = await boxOf('layerA');
  const startA = await toScreen(boxA.cx, boxA.cy);
  await page.mouse.move(startA.x, startA.y);
  await page.mouse.down();
  let guideSeen = null;
  for (let step = 1; step <= 14; step++) {
    const p = await toScreen(400 + step * 10, boxA.cy);
    await page.mouse.move(p.x, p.y, { steps: 3 });
    await page.waitForTimeout(250);
    const g = await ovGuideCount();
    if (g.whitePx > 100) { guideSeen = { step, cx: 400 + step * 10, whitePx: g.whitePx }; break; }
  }
  await page.mouse.up();
  await page.waitForTimeout(1200);
  const afterA = await layerPos();
  dragRes.snapGuide = !!guideSeen;
  dragRes.dragAMoved = afterA.layerA.x !== 250;
  // multi-select + group drag + one undo
  const pB = await toScreen((await boxOf('layerB')).cx, (await boxOf('layerB')).cy);
  await page.mouse.click(pB.x, pB.y);
  await page.waitForTimeout(600);
  const selAfterB = await page.evaluate(() => ({ sel: NX.editor.ED.sel, multi: [...NX.editor.ED.multi] }));
  dragRes.selAfterBClick = selAfterB;
  const boxA2 = await boxOf('layerA');
  const pA = await toScreen(boxA2.cx, boxA2.cy);
  await page.keyboard.down('Shift');
  await page.mouse.move(pA.x, pA.y);
  await page.mouse.down();
  await page.waitForTimeout(500);
  await page.mouse.up();
  await page.keyboard.up('Shift');
  await page.waitForTimeout(500);
  // decisive: the multi-selection must contain BOTH layers before dragging
  const multiState = await page.evaluate(() => ({ sel: NX.editor.ED.sel, multi: [...NX.editor.ED.multi] }));
  dragRes.multiAfterShift = multiState;
  dragRes.multiFormed = multiState.multi.includes('layerA') && multiState.multi.includes('layerB');
  const pre = await layerPos();
  const boxA3 = await boxOf('layerA');
  const sA = await toScreen(boxA3.cx, boxA3.cy);
  await page.mouse.move(sA.x, sA.y);
  await page.mouse.down();
  for (let step = 1; step <= 6; step++) {
    const p = await toScreen(boxA3.cx + step * 10, boxA3.cy);
    await page.mouse.move(p.x, p.y, { steps: 3 });
    await page.waitForTimeout(120);
  }
  await page.mouse.up();
  await page.waitForTimeout(1200);
  const post = await layerPos();
  dragRes.groupMovedBoth = post.layerA.x !== pre.layerA.x && post.layerB.x !== pre.layerB.x
    && (post.layerA.x - pre.layerA.x) === (post.layerB.x - pre.layerB.x);
  await page.evaluate(() => { const u = document.getElementById('edUndo'); if (u) u.click(); });
  await page.waitForTimeout(1200);
  const postUndo = await layerPos();
  dragRes.oneUndoRestoredBoth = postUndo.layerA.x === pre.layerA.x && postUndo.layerA.y === pre.layerA.y
    && postUndo.layerB.x === pre.layerB.x && postUndo.layerB.y === pre.layerB.y;
  console.log('DRAG: snapGuide=' + dragRes.snapGuide + ' dragAMoved=' + dragRes.dragAMoved + ' multiFormed=' + dragRes.multiFormed + ' multi=' + JSON.stringify(dragRes.multiAfterShift) + ' groupMovedBoth=' + dragRes.groupMovedBoth + ' oneUndoRestoredBoth=' + dragRes.oneUndoRestoredBoth);
} catch (e) { dragRes.err = String(e).slice(0, 300); console.log('DRAG ERR: ' + dragRes.err); }
} // end SKIP_REG gate (regression + free-edit drag)

// ---- cleanup: delete every scratch project via the app's single-doc delete ----
console.log('\n=== CLEANUP (' + scratchIds.length + ' scratch projects) ===');
const deleted = [];
for (const id of scratchIds) {
  try {
    // The shim's db is reachable as window.claude.use('db'); its doc.delete()
    // removes the key locally and persists the whole docs map to /_db
    // (the same path the app's own project-delete button uses). CAP is a
    // module-level const in nx-app.js and is NOT reachable from evaluate.
    await page.evaluate(async (id) => { const db = await window.claude.use('db'); await db.doc('projects/' + id).delete(); }, id);
    await page.waitForTimeout(1500); // debounced persist POST to /_db
    const gone = await page.evaluate((id) => !window.__docs.get('projects/' + id), id);
    deleted.push({ id, gone });
    console.log('delete ' + id + ' gone=' + gone);
  } catch (e) { console.log('delete ' + id + ' ERR ' + String(e).slice(0, 200)); }
}

console.log('\n=== FAILED REQUESTS (' + failedReqs.length + ') ===');
for (const f of failedReqs.slice(0, 10)) console.log(' ', f);
console.log('=== ALL console errors (' + errs.length + ') ===');
for (const e of errs.slice(0, 10)) console.log(' ', e);
fs.writeFileSync(OUT + '/verify-elements-live-result-' + (process.env.BATCH || 'all') + '.json', JSON.stringify({ results, reg, dragRes, deleted, consoleErrors: errs.length, failedRequests: failedReqs.length, scratchIds }, null, 2));
await browser.close();
console.log('DONE');
