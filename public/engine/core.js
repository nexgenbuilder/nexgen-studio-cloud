'use strict';
/* DPG Footage Ads — canvas core.
   URL: index.html?d=<template>&v=<variant>&f=<format>   format: 916 (1080x1920) | 169 (1920x1080) | 45 (1080x1350) | 11 (1080x1080)
   A template file defines DIR = {dur, bg, finish, cues(), render(t), setup?, preload?, edl?} using W, H, WIDE, SAFE, LAY.
   Frames are rendered by renderFrame(t): a cheap "collect" pass finds which source frames are needed,
   they are decoded (cached), then the real render runs. */
const FPS = 30;
const QS = new URLSearchParams(location.search);
const FORMATS = { '916': [1080, 1920], '169': [1920, 1080], '45': [1080, 1350], '11': [1080, 1080] };
const FMT = FORMATS[QS.get('f')] ? QS.get('f') : '916';
let [W, H] = FORMATS[FMT];
const WIDE = W > H;
const C = document.getElementById('c');
const MAINCTX = C.getContext('2d');
let ctx = MAINCTX;                                   // swapped to a 1x1 context during the collect pass
const DRY = document.createElement('canvas'); DRY.width = DRY.height = 1; const DRYCTX = DRY.getContext('2d');
// ---------------- brand ----------------
// The Clip Studio swaps the brand per client (colours, logo, contact, copy facts); the defaults are DPG Outdoor Living,
// which every finished DPG video was made with. Templates read OR / BLK / PAPER (accent, ink, paper) at render time.
const BRAND = {
  id: 'dpg', name: 'DPG Outdoor Living', short: 'DPG', parts: true, descriptor: 'AWARD-WINNING LANDSCAPE DESIGN & BUILD',   // parts: the paver-build logo animation (assets/logo_parts.json)
  colors: { accent: '#FF6500', ink: '#0B0B0B', paper: '#F4F1EA' },
  services: ['DRIVEWAYS', 'PATIO & POOL DECKS', 'SYNTHETIC LAWNS', 'OUTDOOR KITCHENS', 'PERGOLAS & PAVILIONS', 'PAVER WALKWAYS', 'FULL LANDSCAPING & DESIGN'],
  billing: ['DPG OUTDOOR LIVING  PRESENTS  A DESIGN & BUILD PRODUCTION', 'DESIGNED WITH AWARD-WINNING DPG DESIGNERS', 'BUILT UNDER A DPG FOREMAN AND PROJECT MANAGER',
    'FINAL WALK-THROUGH WITH MANUALS AND WARRANTIES', 'SERVING THE GREATER BAY AREA SINCE 1990'],
  reviews: [
    { id: 'roberta', text: 'The whole team was easy to work with, reliable and delivered excellent quality.', by: 'ROBERTA S.  ·  LAFAYETTE, CA' },
    { id: 'patty', text: 'Good communication, great service, gorgeous pavers. Love this company!', by: 'PATTY P.  ·  WALNUT CREEK' },
    { id: 'vince', text: 'DPG exceeded all my expectations. Their team was professional, detail-oriented, and passionate about their work.', by: 'VINCE  ·  EAST BAY' },
  ],
};
let OR = '#FF6500', BLK = '#0B0B0B', PAPER = '#F4F1EA', ORGB = '255,101,0';
let WHT = '#FFFFFF', ACC2 = '#FFFFFF';   // WHT: the light text colour (white unless a palette changes it); ACC2: a second accent (palettes, seasonal decor)
let LIGHTPAL = false;                     // a light palette: ink is the light background and text/paper are dark (logos swap to match)
const ORA = a => 'rgba(' + ORGB + ',' + a + ')';   // the accent at alpha a
const rgbaOf = (h, a) => { const n = parseInt(h.slice(1, 7), 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; };
const WA = a => rgbaOf(WHT, a);                                     // the light text colour at alpha a (white unless a palette changes it)
const INKA = a => (LIGHTPAL ? rgbaOf(BLK, a) : 'rgba(0,0,0,' + a + ')');   // text on paper at alpha a
const ONLIGHT = () => (LIGHTPAL ? WHT : BLK);                       // ink for surfaces that stay light in every look (walls, mats, labels)
const LOGO_LIGHT = () => (LIGHTPAL ? IMG.logoW : IMG.logoB);         // the logo for those surfaces
// DEEP1/DEEP2: the accent-tinted darks behind kinetic backgrounds (DPG's exact warm blacks; other brands mix their own)
let DEEP1 = '#1A0E06', DEEP2 = '#120A05';
function setBrandColors(c) { OR = c.accent; BLK = c.ink; PAPER = c.paper; WHT = c.text || '#FFFFFF'; const n = parseInt(OR.slice(1), 16); ORGB = [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(',');
  const dpg = OR.toUpperCase() === '#FF6500' && BLK.toUpperCase() === '#0B0B0B' && WHT.toUpperCase() === '#FFFFFF';
  const mixc = (a, b, u) => { const p = h => [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16)), A = p(a), B = p(b); return '#' + A.map((x, k) => Math.round(x + (B[k] - x) * u).toString(16).padStart(2, '0')).join(''); };
  const lum = h => { const v = [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16) / 255); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  LIGHTPAL = lum(BLK) > 0.55; ACC2 = c.accent2 || (LIGHTPAL ? mixc(OR, '#000000', 0.35) : mixc(OR, '#FFFFFF', 0.55));
  if (c.deep1 && c.deep2) { DEEP1 = c.deep1; DEEP2 = c.deep2; }
  else if (LIGHTPAL) { DEEP1 = mixc(BLK, OR, 0.07); DEEP2 = mixc(BLK, '#FFFFFF', 0.4); }
  else { DEEP1 = dpg ? '#1A0E06' : mixc(BLK, OR, 0.06); DEEP2 = dpg ? '#120A05' : mixc(mixc(BLK, '#000000', 0.3), OR, 0.035); } }
let DIR = null;
// A background the person chose (studio: Style > Background): their photo or video in place of a template's own background.
// window.BGX = {c: clip id, in, blur (px), dim (0..0.9), tint (bool), whole (bool: show the media whole over
// the look's background colour, used for DPG: no crop, no blurred copy)}. Templates that support it paint their background through BACKDROP(fallback); with no BGX set the
// fallback runs and nothing changes. The dim wash uses the look's background colour, so text keeps its contrast in light
// and dark looks alike. Every call runs in the collect pass too, so the frames it needs are fetched.
function BACKDROP(fallback) {
  const B = window.BGX, m = B && B.c ? VID.meta(B.c) : null;
  if (!m) { if (fallback) fallback(); return false; }
  const t = window.FRAME_T || 0, dur = Math.max(0.5, (m.n || 30) / 30 - 0.2), ts = m.still ? 0 : ((+B.in || 0) + t) % dur;
  const blur = Math.max(0, Math.min(60, +B.blur || 0)), dim = Math.max(0, Math.min(0.9, B.dim === undefined ? 0.35 : +B.dim)), pad = blur * 2.5;
  const R = [-pad, -pad, W + 2 * pad, H + 2 * pad];
  if (B.whole) { if (!VID.collecting) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = BLK; ctx.fillRect(0, 0, W, H); ctx.restore(); } footage(B.c, ts, { rect: [0, 0, W, H], fit: 'contain', q: blur > 6 ? 'h' : 'f', filter: blur ? 'blur(' + blur + 'px)' : undefined }); }
  else footage(B.c, ts, { rect: R, fit: 'cover', q: blur > 6 ? 'h' : 'f', filter: blur ? 'blur(' + blur + 'px)' : undefined });
  if (VID.collecting) return true;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'none';
  if (B.tint) { ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = 0.6; ctx.fillStyle = OR; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
  if (dim > 0) { ctx.fillStyle = rgbaOf(BLK, dim); ctx.fillRect(0, 0, W, H); }
  ctx.restore(); return true;
}
// readable-text safe zones: 9:16 = clear of Reels/Stories UI and inside the 4:5 feed crop; 16:9 = 5% title-safe
let SAFE = WIDE ? { x0: 96, x1: W - 96, y0: 54, y1: H - 54, cx: W / 2 } : H === 1920 ? { x0: 65, x1: 1015, y0: 270, y1: 1250, cx: 540 }
  : { x0: 60, x1: W - 60, y0: 60, y1: H - 60, cx: W / 2 };

// ---------------- math ----------------
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const E = {
  lin: u => u, outC: u => 1 - Math.pow(1 - u, 3), inC: u => u * u * u, outQ: u => 1 - Math.pow(1 - u, 5), inQ: u => u * u * u * u * u,
  inOutC: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
  inOutQ: u => u < .5 ? 16 * Math.pow(u, 5) : 1 - Math.pow(-2 * u + 2, 5) / 2,
  inOutS: u => -(Math.cos(Math.PI * u) - 1) / 2,
  outExpo: u => u >= 1 ? 1 : 1 - Math.pow(2, -10 * u),
  inExpo: u => u <= 0 ? 0 : Math.pow(2, 10 * u - 10),
  outBack: u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
  outElastic: u => u <= 0 ? 0 : u >= 1 ? 1 : Math.pow(2, -10 * u) * Math.sin((u * 10 - 0.75) * (2 * Math.PI) / 3) + 1,
  sm: u => u * u * (3 - 2 * u),
};
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return x - Math.floor(x); }
function rng(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

// ---------------- editable copy and shots (Clip Studio, Oct 28) ----------------
// Converted templates read their copy through TX(key, default, meta) and their footage through SHOT(key, [clip, in], meta).
// Every call registers the field in FIELDS, which is how the Clip Studio builds its editor for a template, and returns the
// override from PRM when one is set. PRM is filled by the studio, or on renders from ?p=<base64url JSON {text, shot}>.
// meta: label, group, max (soft character limit), upper (rendered in capitals), multiline, options (a select), kind
// ('land' | 'vert' | 'any') and d (seconds of footage the shot needs from its in-point).
const PRM = { text: {}, shot: {}, prop: null, photos: null };   // prop: the listing's facts (real estate); photos: the listing's photo clip ids, in order
const FIELDS = [];
(function () {
  const p = QS.get('p'); if (!p) return;
  try { const o = JSON.parse(decodeURIComponent(escape(atob(p.replace(/-/g, '+').replace(/_/g, '/'))))); PRM.text = o.text || {}; PRM.shot = o.shot || {}; }
  catch (e) { window.__err = 'bad ?p= params: ' + e; }
})();
const smartQ = s => s.replace(/(^|[\s(\[{“‘—-])'/g, '$1‘').replace(/'/g, '’').replace(/(^|[\s(\[{‘—-])"/g, '$1“').replace(/"/g, '”');
function TX(key, def, meta) {
  meta = meta || {}; FIELDS.push(Object.assign({ type: meta.options ? 'select' : 'text', key, def }, meta));
  const v = PRM.text[key];
  if (meta.options) return meta.options.some(o => o.value === v) ? v : def;
  if (typeof v !== 'string' || !v.trim()) return def;
  let s = meta.multiline ? v.split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n') : v.replace(/\s+/g, ' ').trim();
  s = smartQ(s); return meta.upper ? s.toUpperCase() : s;
}
function SHOT(key, def, meta) {
  meta = meta || {};
  // in the studio a brand without this footage gets a placeholder clip of the right shape ('phl:<key>' landscape, 'phv:<key>' vertical)
  let eff = [def[0], def[1]];
  if (window.STUDIO && !VID.meta(def[0])) { const vert = meta.kind === 'vert' || (meta.kind !== 'land' && (meta.ph === 'v' || /^(v\d|c0[34])/.test(def[0]))); eff = [(vert ? 'phv:' : 'phl:') + (QS.get('v') || '') + '.' + key, 0]; }
  FIELDS.push(Object.assign({ type: 'shot', key, def: eff }, meta));
  const v = PRM.shot[key];
  if (v && typeof v.c === 'string' && (window.STUDIO ? !!VID.meta(v.c) : true)) return [v.c, Math.max(0, +v.in || 0)];
  return eff;
}
// A listing fact (real estate). Facts live in the property profile, not in the clip, so one listing feeds every campaign.
// Registers the field (type 'prop') so the studio knows which facts a template shows; returns '' when the fact is not given,
// and templates leave it out (optional facts) or draw a clear fill-in marker (required ones). Nothing is ever made up.
function PROP(key, meta) {
  meta = meta || {}; FIELDS.push(Object.assign({ type: 'prop', key, def: '' }, meta));
  const v = PRM.prop ? PRM.prop[key] : undefined;
  if (typeof v !== 'string') return '';
  return meta.multiline ? v.split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n') : smartQ(v.replace(/\s+/g, ' ').trim());
}
// true when a shot was changed from its default (templates fall back to generic transitions for changed pairs)
const shotChanged = (s, def) => s[0] !== def[0] || Math.abs(s[1] - def[1]) > 1e-6;

// ---------------- shake ----------------
const SH = { x: 0, y: 0 };
function computeShake(t) {
  SH.x = 0; SH.y = 0;
  for (const [t0, a] of (DIR.shakes || [])) { const d = t - t0; if (d >= 0 && d < 0.35) { const k = a * Math.exp(-d * 13); SH.x += Math.sin(d * 95 + t0) * k; SH.y += Math.cos(d * 71 + t0) * k * 0.8; } }
}
function fillScreen(col, a) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a === undefined ? 1 : a; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }

// ---------------- text ----------------
// Quote the family (multi-word names like "TikTok Sans" are invalid unquoted in a canvas font string, and the
// assignment would silently be ignored) and always append a generic fallback, so text never renders blank: a face
// that lacks a glyph — e.g. TikTok Sans ships Latin/Greek/Cyrillic only — falls back to the system sans instead of tofu.
const F = (w, s, fam, style) => `${style ? style + ' ' : ''}${w} ${Math.round(s * 10) / 10}px "${String(fam || 'Mont').replace(/"/g, '')}", sans-serif`;
function setF(f, ls) { ctx.font = f; ctx.letterSpacing = (ls || 0) + 'px'; }
const TWC = new Map();
function textW(str, f, ls) { const k = str + '|' + f + '|' + (ls || 0); let v = TWC.get(k); if (v === undefined) { const c = MAINCTX; c.save(); c.font = f; c.letterSpacing = (ls || 0) + 'px'; v = c.measureText(str).width; c.restore(); TWC.set(k, v); } return v; }
function fitSize(str, weight, maxW, maxS, fam, ls, style) { return Math.min(maxS, 100 * maxW / textW(str, F(weight, 100, fam, style), (ls || 0))); }
// Masked slide-up text. segs: string or [[text,color],...]. p = reveal 0..1, q = exit 0..1.
function T(segs, x, y, f, o) {
  o = o || {};
  const align = o.align || 'left', ls = o.ls || 0, p = o.p === undefined ? 1 : o.p, q = o.q || 0, alpha = o.alpha === undefined ? 1 : o.alpha;
  if (typeof segs === 'string') segs = [[segs, o.col || WHT]];
  if (p <= 0 || q >= 1 || alpha <= 0) return 0;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); setF(f, ls); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const ws = segs.map(s => ctx.measureText(s[0]).width); const tot = ws.reduce((a, b) => a + b, 0);
  const m = ctx.measureText('ÑÉgjpQ'); const asc = m.fontBoundingBoxAscent, des = m.fontBoundingBoxDescent, h = asc + des;
  const x0 = align === 'center' ? x - tot / 2 : align === 'right' ? x - tot : x;
  let off = 0;
  if (o.mode === 'fade') { ctx.globalAlpha *= E.outC(p) * (1 - q); off = (1 - E.outC(p)) * (o.rise === undefined ? 18 : o.rise); }
  else { if (p < 1 || q > 0) { ctx.beginPath(); ctx.rect(x0 - 200, y - asc - 2, tot + 400, h + 4); ctx.clip(); } off = (1 - E.outQ(p)) * h * 1.04 - E.inC(q) * h * 1.04; }
  ctx.globalAlpha *= alpha;
  if (o.shadow) { ctx.shadowColor = o.shadow[0]; ctx.shadowBlur = o.shadow[1]; ctx.shadowOffsetY = o.shadow[2] || 0; }
  let cx = x0; for (let i = 0; i < segs.length; i++) { ctx.fillStyle = segs[i][1]; ctx.fillText(segs[i][0], cx, y + off); cx += ws[i]; }
  ctx.restore(); return tot;
}

// ---------------- logo / finish ----------------
const IMG = {}; let LOGO_AR = 460 / 2048;
// a logo drawn at nominal width w: wide logos use the width, taller ones get the same height budget (DPG's logo is 2048x460)
function logoBox(w) { const h = Math.min(w * LOGO_AR, w * 0.405); return [h / LOGO_AR, h]; }
function drawLogo(kind, cx, cy, w, reveal, alpha) {
  reveal = reveal === undefined ? 1 : reveal; if (reveal <= 0) return; const h = logoBox(w)[1]; w = logoBox(w)[0];
  ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); ctx.globalAlpha *= (alpha === undefined ? 1 : alpha);
  ctx.beginPath(); ctx.rect(cx - w / 2 - 10, cy - h / 2 - 10, (w + 20) * E.outQ(reveal), h + 20); ctx.clip();
  ctx.drawImage(kind === 'b' ? IMG.logoB : IMG.logoW, cx - w / 2, cy - h / 2, w, h); ctx.restore();
}
const NOISE = []; const VIG = {};
function buildNoise() {
  const r = rng(99);
  for (let k = 0; k < 4; k++) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const id = g.createImageData(256, 256);
    for (let i = 0; i < id.data.length; i += 4) { const v = r() < 0.5 ? 0 : 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = Math.floor(r() * 22); }
    g.putImageData(id, 0, 0); NOISE.push(MAINCTX.createPattern(c, 'repeat'));
  }
}
function finish(t, o) {
  o = o || {}; const vig = (o.vig === undefined ? 0.45 : o.vig) * (LIGHTPAL ? 0.35 : 1), grain = o.grain === undefined ? 0.4 : o.grain;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  if (vig > 0) { const key = vig + 'x' + W; if (!VIG[key]) { const g = ctx.createRadialGradient(W / 2, H * 0.46, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${vig})`); VIG[key] = g; } ctx.fillStyle = VIG[key]; ctx.fillRect(0, 0, W, H); }
  if (grain > 0) { const f = Math.floor(t * FPS + 0.5); ctx.translate(Math.floor(hash(f * 1.7) * 256), Math.floor(hash(f * 2.3 + 5) * 256)); ctx.fillStyle = NOISE[f % 4]; ctx.globalAlpha = grain; ctx.fillRect(-256, -256, W + 512, H + 512); }
  ctx.restore();
}

// ---------------- render ----------------
function renderSync(t) {
  window.FRAME_T = t; computeShake(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = DIR.bg || BLK; ctx.fillRect(0, 0, W, H);
  DIR.render(t);
  if (window.OVERLAY && !VID.collecting) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; try { window.OVERLAY(t); } finally { ctx.restore(); } }   // seasonal overlay (kit6 / studio)
  finish(t, DIR.finish);
}
window.render = renderSync;
// collect pass on a 1x1 context, decode what is missing, then draw for real
window.renderFrame = async function (t) {
  VID.beginCollect(); ctx = DRYCTX;
  try { renderSync(t); } finally { ctx = MAINCTX; }
  const keys = VID.endCollect();
  await VID.ensure(keys, true);
  renderSync(t);
  return true;
};
window.audit = function (step) {
  window.__missing = {}; window.__clamps = {}; step = step || 1 / FPS;
  for (let t = 0; t < DIR.dur - 1e-6; t += step) { VID.beginCollect(); ctx = DRYCTX; try { renderSync(t); } finally { ctx = MAINCTX; VID.endCollect(); } }
  return { missing: Object.keys(window.__missing), clamps: window.__clamps };
};
function loadImg(k, src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => { IMG[k] = i; res(); }; i.onerror = () => rej(new Error('img ' + src)); i.src = src; }); }
async function boot() {
  try {
    C.width = W; C.height = H;
    await Promise.all([loadImg('logoW', 'assets/logo_white.png'), loadImg('logoB', 'assets/logo_black.png'), VID.init()]);
    const fs = ['500 20px Mont', '600 20px Mont', '700 20px Mont', '800 20px Mont', '900 20px Mont', '500 20px Mono', '700 20px Mono', '800 20px Mono', '400 20px Bebas',
      '500 20px Corm', '600 20px Corm', '700 20px Corm', 'italic 500 20px Corm', 'italic 600 20px Corm', 'italic 700 20px Corm', '500 20px Hand', '600 20px Hand', '700 20px Hand'];
    await Promise.all(fs.map(f => document.fonts.load(f, 'ÑA1–’°')));
    if (DIR.preload) await DIR.preload();
    buildNoise(); if (DIR.setup) DIR.setup();
    window.CUES = typeof DIR.cues === 'function' ? DIR.cues() : DIR.cues; window.DUR = DIR.dur; window.SIZE = [W, H]; window.__ready = true;
    if (!/render/.test(location.search)) {   // live preview loop
      const t0 = performance.now(); let busy = false;
      const loop = async () => { if (!busy) { busy = true; await window.renderFrame(((performance.now() - t0) / 1000) % DIR.dur); busy = false; } requestAnimationFrame(loop); }; loop();
    }
  } catch (e) { window.__err = String(e && e.stack || e); }
}
