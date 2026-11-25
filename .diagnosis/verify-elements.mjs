// Static elements() harness — instantiates every converted template DIR in a
// stubbed browser-ish vm context and validates the element descriptors it
// returns. Run: node .diagnosis/verify-elements.mjs [file ...]
// Exits non-zero if any format fails to build, has no elements(), or returns
// a malformed descriptor. Does NOT call render().
'use strict';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'engine');

// file -> formats to test (QS 'v' values)
const PLAN = {
  'tpl_nx9.js': ['lotx', 'reelx', 'eventx', 'walkx', 'wipex', 'lensx', 'listx'],
  'tpl_nx10.js': ['ringx', 'showx', 'flyx', 'cubex', 'logorev', 'headx'],
  'tpl_nx7.js': ['searchx', 'phonex', 'stackx', 'typex'],
  'tpl_nx8.js': ['mapx', 'feedx', 'calx', 'gridx', 'stingx', 'browserx'],
  'tpl_brand.js': ['frame', 'headline', 'contact', 'message', 'side', 'special', 'offer'],
};

function makeSandbox(v) {
  const ctxProxy = new Proxy({}, { get: () => () => ({}), set: () => true });
  const sandbox = {
    console,
    // --- browser-ish globals ---
    window: null, // set to self below
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => ctxProxy, style: {} }) },
    Path2D: class { constructor() {} },
    // --- studio globals ---
    W: 1080, H: 1920, WIDE: 1080, SAFE: { t: 130, b: 420 }, LAY: {},
    SH: { x: 0, y: 0 },
    IMG: {},
    BRAND: { name: 'Test Business', short: 'TB', cat: 'general', industry: 'general', services: ['Service One', 'Service Two', 'Service Three', 'Service Four'], tagline: 'TEST TAGLINE', contact: { cta: 'CALL NOW', phone: '555-0000', web: 'test.com', area: 'Test Area', lic: '' }, parts: null },
    CONTACT: { cta: 'CALL NOW', phone: '555-0000', web: 'test.com', area: 'Test Area', tagline: 'Test tagline', lic: '' },
    DEEP1: '#101014', DEEP2: '#050608', OR: '#FF6500', WHT: '#FFFFFF', CARD: '#FFFFFF', INKD: '#14141A', MUTE: '#6B6B78',
    BLK: '#0B0B0B', PAPER: '#F4F1EA', LIGHTPAL: false, ORGB: '255,101,0', ACC2: '#FFB020',
    WA: a => 'rgba(255,255,255,' + a + ')', ORA: a => 'rgba(255,101,0,' + a + ')',
    rgbaOf: (c, a) => c,
    // --- helpers ---
    clamp: (x, a, b) => Math.min(b, Math.max(a === undefined ? 0 : a, x)),
    lerp: (a, b, u) => a + (b - a) * u,
    seg: (t, a, d) => Math.min(1, Math.max(0, (t - a) / d)),
    rng: () => () => 0.5,
    hash: () => 0.5,
    textW: s => String(s == null ? '' : s).length * 10,
    F: () => '16px Mont',
    fitSize: (s, wt, maxW, maxS) => Math.min(maxS, 50),
    fit: (s, wt, fam, maxW, maxS, ls) => Math.min(maxS, 50),
    fitLs: (s, wt, maxW, maxS) => Math.min(maxS, 50),
    logoBox: w => [w, w * 0.4],
    BACKDROP: fn => fn(),
    // --- engine kits (stubs; render() is never called) ---
    K3: { init: () => {}, G: () => ctxProxy, D: () => {}, wholeIn: () => [0, 0, 1080, 608], clip: () => {},
      shots: arr => { let t = 0; return arr.map(a => { const o = { c: a[0], in: a[1], start: t }; t += a[2]; return o; }); } },
    K4: { into: (k, fn) => fn() },
    K5: { isDPG: () => false },
    K7: { FAM: {}, up: s => String(s == null ? '' : s).toUpperCase(), seg: (t, a, d) => Math.min(1, Math.max(0, (t - a) / d)), isVert: () => false, txt: () => {}, need: () => {} },
    K8: { onCol: () => '#FFFFFF', lum: () => 0.5, xf: () => ({}), withLayer: (s, box, fn) => { if (fn) fn(); }, box: () => [0, 0, 100, 100], IN: {} },
    K9: { tx: () => {}, onCol: () => '#FFFFFF', allowed: () => true, EL: {}, box: () => [0, 0, 100, 100], draw: () => {} },
    KT: { run: () => {} },
    K13: { SPRING: x => x, SOFT: x => x, BOUNCY: x => x },
    K15: { draw: () => true },
    K16: { ok: false },
    K17: { fields: () => ({}), top: () => {} },
    E: new Proxy({}, { get: (t, k) => (typeof k === 'string' ? (x => x) : undefined) }),
    VID: { meta: () => null, get: () => null, idx: () => 0, collecting: false },
    ctx: ctxProxy,
    scratch: () => ({ g: ctxProxy }),
    BACKDROP: fn => fn(),
    // --- template registry / DIR ---
    STUDIO_REG: {},
    DIR: null,
    QS: { get: k => (k === 'v' ? v : null) },
    // TX returns the default value as a string; SHOT returns [clipId, in]
    TX: (key, def) => String(def == null ? '' : def),
    SHOT: (key, def) => (Array.isArray(def) ? def : ['clip.' + key, 0]),
    // SHOWKIT is defined by tpl_nx7.js itself; for files that use it without
    // defining it, provide a stub that returns dummy helpers.
    SHOWKIT: null, // set below (needs the sandbox's own globals)
  };
  sandbox.window = sandbox;
  // Minimal SHOWKIT stub (used by nx8/nx9/nx10 when tpl_nx7.js is not loaded).
  // It must return every helper the format functions destructure.
  const dummyFn = () => {};
  const showkitStub = () => ({
    TAU: Math.PI * 2, SEC: 'general', pk: P => P.general || Object.values(P)[0], up: s => String(s == null ? '' : s).toUpperCase(),
    seg: sandbox.seg, SP: x => x, SS: x => x, SB: x => x, onAcc: () => '#FFFFFF',
    INKD: '#14141A', CARD: '#FFFFFF', MUTE: '#6B6B78',
    tx: dummyFn, fit: (s, wt, fam, maxW, maxS) => Math.min(maxS, 50), rr: dummyFn,
    logoImg: () => null, services: n => (sandbox.BRAND.services || []).slice(0, n),
    shot: (key, label, d, ph) => { const s = sandbox.SHOT(key, ['nofoot.' + key, 0]); return { c: s[0], in: s[1] }; },
    pic: dummyFn, touch: dummyFn, stage: dummyFn, camera: (cx, cy, z, rot, fn) => fn(),
    shutter: (t, moving, scene) => scene(t), within: () => false,
    words: dummyFn, ripple: dummyFn, pointer: dummyFn, pillBtn: () => [100, 50],
    close: dummyFn, closeCues: () => {}, bed: (style, dur) => ['music', 0, dur, 0.85, { style }],
  });
  sandbox.SHOWKIT = showkitStub;
  return sandbox;
}

function validateElements(file, v, els, dur) {
  const errs = [];
  if (!Array.isArray(els)) return ['elements() did not return an array'];
  if (els.length === 0) errs.push('elements() returned an empty list');
  const ids = new Set();
  for (const e of els) {
    if (!e || typeof e !== 'object') { errs.push('non-object element: ' + JSON.stringify(e)); continue; }
    if (typeof e.id !== 'string' || !e.id) errs.push('missing id: ' + JSON.stringify(e));
    else if (ids.has(e.id)) errs.push('duplicate id: ' + e.id); else ids.add(e.id);
    if (!['callout', 'focus', 'box', 'card', 'pos'].includes(e.kind)) errs.push(e.id + ': bad kind ' + e.kind);
    for (const k of ['x', 'y', 't0', 'd']) if (typeof e[k] !== 'number' || !isFinite(e[k])) errs.push(e.id + ': bad ' + k + ' (' + e[k] + ')');
    if (typeof e.label !== 'string' || !e.label) errs.push(e.id + ': missing label');
    if (!Array.isArray(e.box) || e.box.length !== 4 || e.box.some(n => typeof n !== 'number' || !isFinite(n))) errs.push(e.id + ': bad box ' + JSON.stringify(e.box));
    if (typeof e.dup !== 'boolean' || typeof e.del !== 'boolean') errs.push(e.id + ': dup/del not boolean');
    if (e.t0 < 0) errs.push(e.id + ': t0 < 0');
    if (e.d <= 0) errs.push(e.id + ': d <= 0');
    if (typeof dur === 'number' && e.t0 > dur) errs.push(e.id + ': t0 ' + e.t0 + ' > dur ' + dur);
    // box kinds need w/h
    if ((e.kind === 'box' || e.kind === 'card') && (typeof e.w !== 'number' || typeof e.h !== 'number')) errs.push(e.id + ': ' + e.kind + ' missing w/h');
  }
  return errs;
}

let total = 0, failed = 0;
const onlyFiles = process.argv.slice(2);
for (const [file, formats] of Object.entries(PLAN)) {
  if (onlyFiles.length && !onlyFiles.includes(file)) continue;
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  for (const v of formats) {
    total++;
    const sandbox = makeSandbox(v);
    // tpl_nx7.js defines the real SHOWKIT; load it first for nx8/nx9/nx10 so
    // the formats use the real helper (which needs BRAND etc. — stubbed above).
    try {
      if (file !== 'tpl_nx7.js') {
        const nx7src = fs.readFileSync(path.join(ROOT, 'tpl_nx7.js'), 'utf8');
        // Only evaluate SHOWKIT's definition, not the whole file (its factory
        // would be assigned but not called). Extract up to the STUDIO_REG line.
        const cut = nx7src.indexOf("STUDIO_REG['nx7']");
        vm.runInNewContext(nx7src.slice(0, cut), sandbox, { filename: 'tpl_nx7.js (SHOWKIT only)' });
      }
      vm.runInNewContext(src, sandbox, { filename: file });
      // STUDIO_REG entries are factories, not invoked at load: call the
      // factory to build DIR (as the studio's loader does in the browser).
      const key = file.replace(/^tpl_/, '').replace(/\.js$/, '');
      const factory = sandbox.STUDIO_REG[key];
      if (typeof factory !== 'function') throw new Error('STUDIO_REG[' + key + '] is not a factory');
      factory();
    } catch (err) {
      failed++;
      console.log('FAIL ' + file + ' ?v=' + v + ' — load/build error: ' + (err && err.stack || err));
      continue;
    }
    const dir = sandbox.DIR;
    if (!dir || typeof dir !== 'object') { failed++; console.log('FAIL ' + file + ' ?v=' + v + ' — no DIR built'); continue; }
    if (typeof dir.elements !== 'function') { failed++; console.log('FAIL ' + file + ' ?v=' + v + ' — DIR has no elements()'); continue; }
    let els;
    try { els = dir.elements(); } catch (err) { failed++; console.log('FAIL ' + file + ' ?v=' + v + ' — elements() threw: ' + (err && err.stack || err)); continue; }
    const errs = validateElements(file, v, els, dir.dur);
    if (errs.length) { failed++; console.log('FAIL ' + file + ' ?v=' + v + ' — ' + els.length + ' elements, ' + errs.length + ' problem(s):\n  - ' + errs.join('\n  - ')); }
    else console.log('ok   ' + file + ' ?v=' + v + ' — ' + els.length + ' elements, dur ' + dir.dur);
  }
}
console.log('\n' + (total - failed) + '/' + total + ' formats pass');
process.exit(failed ? 1 : 0);
