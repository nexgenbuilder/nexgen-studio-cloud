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
  'tpl_food.js': ['fire', 'chef', 'rush', 'today', 'icon', 'after'],
  'tpl_food2.js': ['burger', 'sushi', 'cheese', 'pour', 'menuedit', 'street', 'late', 'fresh', 'cater', 'brunch'],
  'tpl_estate.js': ['sig', 'listed', 'open', 'drop', 'sold', 'hood', 'tour', 'agent'],
  'tpl_estate2.js': ['aerial', 'resid', 'journal', 'devel', 'soon', 'lease', 'luxe', 'comm'],
  'tpl_trade.js': ['blueprint', 'salon', 'barber', 'reveal', 'event', 'product', 'expert'],
  'tpl_trade2.js': ['crew', 'timeline', 'glowup', 'swatch', 'shine', 'garage', 'party', 'venue', 'arrivals', 'flash', 'tips', 'story'],
  // --- unlock tail (local only; do NOT push this file until all chunks land) ---
  'tpl_sig.js': ['wall', 'pick', 'day', 'oneword', 'pov', 'notes', 'numbers', 'spotlight', 'rate', 'reply', 'episode', 'loop'],
  'tpl_nx.js': ['banner', 'cinema', 'ticker', 'split', 'lower3', 'postcard', 'textfill', 'kinetic', 'shapes', 'wordswap', 'sting'],
  'tpl_nx2.js': ['ba', 'top3', 'myth', 'reveal', 'process', 'menu', 'dish', 'special'],
  'tpl_nx3.js': ['herox', 'specialx', 'combox', 'chalkx', 'bax', 'thermox'],
  'tpl_nx4.js': ['pizzax', 'heatx', 'papelx', 'recipex', 'stainx', 'nightx', 'checkx', 'plansx', 'vanx'],
  'tpl_nx5.js': ['relistx', 'resignx', 'blueprintx', 'redoorx', 'bbpolex', 'bbchairx', 'neonx', 'beadx'],
  'tpl_nx6.js': ['pressx', 'mockx', 'cardsx', 'flyerx', 'glossx', 'filterx', 'deliverx'],
  'tpl_pixel.js': ['pxstart', 'pxquest', 'pxover', 'pxboss', 'pxcoin'],
  'tpl_pixel2.js': ['pxba', 'pxbf', 'pxthanks', 'pxloot'],
  'tpl_pixel3.js': ['pxcab', 'pxhud', 'pxtype', 'pxscores', 'pxselect', 'pxvs', 'pxtokens'],
  'tpl_site.js': ['drop', 'droplap', 'dropfull', 'glow', 'oldnew', 'nosite'],
  'tpl_v2.js': ['spot_villa', 'thisor', 'upgrade'],
  'tpl_x.js': ['frame', 'stories'],
  'tpl_kin.js': ['kitchens', 'drive', 'team'],
  'tpl_n1.js': ['gallery', 'trailer'],
  'tpl_n2.js': ['signs', 'listed', 'chat', 'questions'],
  'tpl_hol.js': ['greet', 'special', 'hours', 'count'],
  'tpl_edit.js': ['review'],
};

function makeSandbox(v) {
  const ctxProxy = new Proxy({}, { get: () => () => ({}), set: () => true });
  // 2d canvas context: like ctxProxy, but createImageData returns a real
  // ImageData-shaped object (nx3's SPECK IIFE reads .data.length at load).
  const ctx2d = new Proxy({}, {
    get: (t, k) => k === 'createImageData'
      ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h })
      : () => ({}),
    set: () => true,
  });
  const sandbox = {
    console,
    // --- browser-ish globals ---
    window: null, // set to self below
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d, style: {} }), fonts: { add: () => {} } },
    Path2D: class { constructor() {} moveTo() {} lineTo() {} quadraticCurveTo() {} bezierCurveTo() {} arc() {} rect() {} ellipse() {} closePath() {} },
    FontFace: class { constructor() {} load() { return Promise.resolve(this); } },
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
    clamp: (x, a, b) => Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, x)),
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
    setBrandColors: () => {},
    BACKDROP: fn => fn(),
    fillScreen: () => {},
    rule: () => {},
    T: () => {},
    // --- property profile (estate templates; PROP reads PRM.prop, assigned below) ---
    PRM: {},
    // --- engine kits (stubs; render() is never called) ---
    K3: { init: () => {}, G: () => ctxProxy, D: () => {}, wholeIn: () => [0, 0, 1080, 608], clip: () => {}, ar: () => 16 / 9,
      wrap: (str, f, maxW) => { const out = []; let cur = ''; const w = s => String(s).length * 10; for (const word of String(str == null ? '' : str).split(' ')) { const s = cur ? cur + ' ' + word : word; if (cur && w(s) > maxW) { out.push(cur); cur = word; } else cur = s; } if (cur) out.push(cur); return out; },
      shots: arr => { let t = 0; return arr.map(a => { const o = { c: a[0], in: a[1], start: t }; t += a[2]; return o; }); } },
    K4: { into: (k, fn) => fn() },
    K5: { isDPG: () => false, svc: k => 'Service ' + (k + 1) },
    K7: { FAM: new Proxy({}, { get: (t, k) => (k in t ? t[k] : { pal: {}, music: 'pulse', bpm: 112 }) }), up: s => String(s == null ? '' : s).toUpperCase(), seg: (t, a, d) => Math.min(1, Math.max(0, (t - a) / d)), isVert: () => false, txt: () => {}, need: () => {}, nz: s => String(s == null ? '' : s).trim(), mix: () => '#FFFFFF', fitLines: () => ({ lines: ['x'], size: 40 }),
      DEMO: { addr: '18 Willow Bend Lane', area: 'Maple Grove', price: '1895000', deal: 'sale', beds: '4', baths: '3.5', sqft: '3420', feat: "Chef's kitchen\nCovered patio\nVaulted great room\nThree-car garage", agent: 'Jordan Avery', agent_title: 'Listing agent', agent_phone: '(555) 014-2280', oh_date: 'Saturday, Nov 8', oh_time: '1 – 4 PM', was: '1975000' },
      profileLabel: k => k,
      facts: (obj, keys) => { const ks = keys || Object.keys(obj || {}), units = { beds: 'BEDS', baths: 'BATHS', sqft: 'SQ FT', lot: 'LOT' }, out = []; for (const k of ks) { const v = obj && obj[k]; if (v == null || String(v).trim() === '') continue; let n = String(v); if (k === 'sqft') n = Number(v).toLocaleString('en-US'); if (k === 'lot') n = String(v).toUpperCase(); out.push({ k, n, u: units[k] || '' }); } return out; },
      lines: s => String(s == null ? '' : s).split('\n').map(x => x.trim()).filter(Boolean),
      money: (s, deal) => { const d = String(s == null ? '' : s).replace(/[^0-9.]/g, ''); if (!d) return ''; return '$' + Math.round(parseFloat(d)).toLocaleString('en-US') + (deal === 'rent' ? '/mo' : ''); },
      agentName: P => (P && P.agent && String(P.agent).trim()) || 'Test Business',
      agentPhone: P => (P && P.agent_phone && String(P.agent_phone).trim()) || '555-0000',
      icon: () => {}, photo: () => {}, logo: () => {}, on: () => '#FFFFFF', spark: () => ({}),
      factStr: (list, sep) => (list || []).map(x => x.n + (x.u ? ' ' + x.u : '')).join(sep || ' '),
      // kit7.js exports PROFILE (estate fact lookup); nx5's fact() calls
      // K7.PROFILE.find(...) at factory build time.
      PROFILE: [] },
    K8: { onCol: () => '#FFFFFF', col: () => '#FF6500', lum: () => 0.5, xf: () => ({}), withLayer: (s, box, fn) => { if (fn) fn(); }, box: () => [0, 0, 100, 100], IN: {}, mix: () => '#FFFFFF' },
    NOISE: [],
    K9: { tx: () => {}, onCol: () => '#FFFFFF', allowed: () => true, EL: {}, box: () => [0, 0, 100, 100], draw: () => {} },
    KT: { run: () => {} },
    K13: { SPRING: x => x, SOFT: x => x, BOUNCY: x => x },
    // HOL (kit6.js): holiday themes. Only the christmas theme is needed —
    // tpl_hol.js defaults HID to 'christmas'. Theme fields are the real ones
    // from kit6.js; copy() mirrors kit6's shape (offer/hours/days stubbed).
    HOL: {
      THEMES: { christmas: { name: 'Christmas', H: 'THE HOLIDAYS', greet: 'Merry Christmas', kick: 'SEASON’S GREETINGS', sub: 'From all of us at {brand}',
        pal: { accent: '#D7263D', ink: '#0D2A1E', paper: '#FBF5EA', text: '#FFF9F0', accent2: '#E9C46A', deep1: '#14402C', deep2: '#081A12' },
        fonts: { sans: 'mont', serif: 'playfair', display: 'abril', script: 'mountains' },
        fx: 'snow', decor: 'lights', hero: ['ornaments', 'bokeh'], music: 'jingle', tone: 'festive',
        cols: ['#FF3B3B', '#2ECC71', '#FFC83D', '#3DA5FF', '#FF7AD9'] } },
      copy: id => { const th = { name: 'Christmas', H: 'THE HOLIDAYS', greet: 'Merry Christmas', kick: 'SEASON’S GREETINGS', sub: 'From all of us at {brand}' }; return { greet: th.greet, kick: th.kick, sub: th.sub, name: th.name, H: th.H, offer: ['20% OFF EVERYTHING', 'THIS WEEK ONLY'], date: new Date(), hours: [['DEC 24', '9 AM – 3 PM'], ['DEC 25', 'CLOSED'], ['DEC 26', 'REGULAR HOURS']], days: 25 }; },
      decor: () => {}, particles: () => {}, mix: () => '#FFFFFF', hexA: (c, a) => c, backdrop: () => {},
    },
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
  // PROP reads the live property profile (the factory fills PRM.prop from K7.DEMO when not in STUDIO).
  sandbox.PROP = (k, meta) => { const p = sandbox.PRM && sandbox.PRM.prop; return p && typeof p[k] === 'string' ? p[k] : ''; };
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
  // --- stubs for globals older factories need at build time (tpl_nx.js /
  // tpl_nx2.js): K5 LAND/VERT/shotsOf/fitList/pick/noun and kit.js globals
  // tagCaps/projOf/ctaSentence. LAND/VERT are the real arrays from kit5.js.
  sandbox.K5.LAND = [['c02', 9.0], ['c12', 8.5], ['c07', 12.05], ['c09', 3.55], ['c11', 15.0], ['c05', 4.1], ['c08', 5.99], ['c10', 4.0], ['c11', 12.05], ['c05', 24.1], ['c07', 24.0], ['c09', 10.55], ['c02', 0.05], ['c12', 0.1]];
  sandbox.K5.VERT = [['v01', 0.1], ['v04', 4.0], ['v03', 3.0], ['v05', 6.0], ['v02', 0.1], ['v01', 7.0], ['v04', 9.0], ['v03', 12.0], ['v05', 15.0], ['v02', 4.0]];
  sandbox.K5.noun = () => 'PROJECT';
  sandbox.K5.pick = (dpg, other) => other;
  sandbox.K5.fitList = list => list;
  sandbox.K5.shotsOf = (list, d, kind, group, labels) => { let t = 0; const S = list.map(([c, inn], k) => { const dd = Array.isArray(d) ? d[k] : d; const sh = sandbox.SHOT('s' + (k + 1), [c, inn]); const o = { c: sh[0], in: sh[1], d: dd, start: t }; t += dd; return o; }); S.total = t; return S; };
  sandbox.tagCaps = () => (sandbox.CONTACT.tagline || '').replace(/[.]+$/, '').toUpperCase();
  sandbox.projOf = () => '';
  sandbox.ctaSentence = () => { const c = sandbox.CONTACT.cta; return c.charAt(0) + c.slice(1).toLowerCase(); };
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
      // tpl_pixel2.js / tpl_pixel3.js destructure the PX global that only
      // tpl_pixel.js defines — load it first, mirroring real browser order.
      if (file === 'tpl_pixel2.js' || file === 'tpl_pixel3.js') {
        const pxsrc = fs.readFileSync(path.join(ROOT, 'tpl_pixel.js'), 'utf8');
        vm.runInNewContext(pxsrc, sandbox, { filename: 'tpl_pixel.js (PX for pixel2/3)' });
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
