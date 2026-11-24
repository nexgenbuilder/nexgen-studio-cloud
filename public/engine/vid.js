'use strict';
/* Footage layer: frame-accurate access to the source clips (pre-extracted JPEG frames), reframing,
   shot lists (EDL) with transitions, motion blur, cheap blur, knockout text.
   Source frame index i (0-based) <-> source time i/30.  q = 'f' full res, 'h' 960px proxy. */
const VID = (() => {
  let META = {};
  const cache = new Map();          // key -> {b: ImageBitmap, u: lastUse}
  const inflight = new Map();       // key -> Promise
  let collecting = false, want = null, tick = 0;
  let MAX = 44;
  // Clip Studio: a backend {meta(c), load(c, i, q) -> Promise<ImageBitmap>} replaces the JPEG frames. A bitmap may be
  // smaller than the clip's nominal size for its quality; it then carries _k = bitmap px per nominal px.
  let BE = null;
  async function init() {
    META = await (await fetch('library/sources.json')).json();
    try { ALN = await (await fetch('library/align.json')).json(); } catch (e) { ALN = {}; }
    NEED = H > W ? 'v' : 'h';
  }
  const meta = c => BE ? BE.meta(c) : META[c];
  const idx = (c, ts) => clamp(Math.round(ts * 30), 0, meta(c).n - 1);
  const key = (c, i, q) => { const m = meta(c); return c + '/' + q + '/' + (m && m.still ? 0 : i); };   // a still photo is one frame at every time
  const url = (c, i, q) => `frames/${c}/${q}/${String(i + 1).padStart(5, '0')}.jpg`;
  function load(k) {
    if (cache.has(k)) return Promise.resolve();
    if (inflight.has(k)) return inflight.get(k);
    const [c, q, i] = k.split('/');
    const p = (BE ? BE.load(c, +i, q) : fetch(url(c, +i, q)).then(r => { if (!r.ok) throw new Error('frame ' + k); return r.blob(); })
      .then(b => createImageBitmap(b))).then(bmp => { cache.set(k, { b: bmp, u: ++tick }); inflight.delete(k); })
      .catch(e => { inflight.delete(k); throw e; });
    inflight.set(k, p); return p;
  }
  function evict(keep) {
    if (cache.size <= MAX) return;
    const items = [...cache.entries()].filter(([k]) => !keep.has(k)).sort((a, b) => a[1].u - b[1].u);
    for (let j = 0; j < items.length && cache.size > MAX; j++) { items[j][1].b.close(); cache.delete(items[j][0]); }
  }
  async function ensure(keys, prefetch) {
    await Promise.all([...keys].map(load));
    for (const k of keys) { const e = cache.get(k); if (e) e.u = ++tick; }
    if (prefetch) {   // assume forward playback: warm the next two frames of every clip in use
      for (const k of keys) { const [c, q, i] = k.split('/'); for (const d of [1, 2]) { const j = +i + d; if (j < meta(c).n) load(key(c, j, q)).catch(() => {}); } }
    }
    evict(new Set(keys));
  }
  function get(c, i, q) {
    const k = key(c, i, q || 'f');
    if (collecting) { want.add(k); return null; }
    const e = cache.get(k); if (e) { e.u = ++tick; return e.b; } return null;
  }
  return {
    init, meta, idx, get, ensure,
    setBackend(b) { BE = b; for (const e of cache.values()) e.b.close(); cache.clear(); },
    setMax(n) { MAX = n; },
    clear() { for (const e of cache.values()) e.b.close(); cache.clear(); },
    beginCollect() { collecting = true; want = new Set(); },
    endCollect() { collecting = false; const w = want; want = null; return w; },
    get collecting() { return collecting; },
  };
})();

// ---------- offscreen scratch canvases ----------
const SCR = {};
function scratch(name, w, h) {
  let c = SCR[name];
  if (!c || c.width !== (w || W) || c.height !== (h || H)) { c = SCR[name] = document.createElement('canvas'); c.width = w || W; c.height = h || H; c.g = c.getContext('2d'); c.g.imageSmoothingQuality = 'high'; }
  return c;
}

// ---------- footage drawing ----------
// draw clip c at source time ts. o: rect [x,y,w,h] (default full frame), cx,cy focus in source (0..1), z zoom (>=1),
// dx,dy screen offset (px), s extra scale about rect centre, rot (rad), alpha, q quality, blend (frame blending for slow-mo),
// fit 'cover'|'contain'. Returns the transform (for mapping tracked points), or null.
// geometry only: where clip c lands for view options o (same maths as footage())
function ftrans(c, o) {
  o = o || {};
  const m = VID.meta(c); const q = o.q || 'f';
  const sw = q === 'h' ? m.hw : m.w, sh = q === 'h' ? m.hh : m.h, k = sw / m.w;
  const r = o.rect || [0, 0, W, H];
  const fitS = o.fit === 'contain' ? Math.min(r[2] / sw, r[3] / sh) : Math.max(r[2] / sw, r[3] / sh);
  const S = fitS * (o.z || 1);
  const vw = r[2] / S, vh = r[3] / S;
  let sx = (o.cx === undefined ? 0.5 : o.cx) * sw - vw / 2, sy = (o.cy === undefined ? 0.5 : o.cy) * sh - vh / 2;
  if (o.fit !== 'contain') { sx = vw >= sw ? (sw - vw) / 2 : clamp(sx, 0, sw - vw); sy = vh >= sh ? (sh - vh) / 2 : clamp(sy, 0, sh - vh); }
  return { r, S, sx, sy, vw, vh, k, sw, sh, dx: o.dx || 0, dy: o.dy || 0, s: o.s || 1, rot: o.rot || 0 };
}
// ---------- orientation-aware source resolution ----------
// Edits reference master clips (c01..c11) at master times. A 9:16 render may only show vertical sources and a 16:9 render
// only horizontal ones: a master of the other orientation is replaced through library/align.json (same scene, matched by
// content). The result is clamped inside the source shot that contains `ref` (the shot's in-point), so transitions and
// slow-mo never run past a cut in the source. Missing shots draw a slate and are listed in window.__missing.
let ALN = {}, NEED = 'v';
window.__missing = {}; window.__clamps = {};
function resolve(c, ts, ref) {
  ref = ref === undefined ? ts : ref;
  const s = VID.meta(c); if (!s) return null;
  let src = c, sts = ts, sref = ref, rate = 1;
  if (s.orient !== NEED) {
    const ents = (ALN[c] || []).filter(e => VID.meta(e.src) && VID.meta(e.src).orient === NEED);
    let best = null;
    for (const e of ents) {
      const d = ref < e.m[0] ? e.m[0] - ref : ref > e.m[1] ? ref - e.m[1] : 0;
      if (d <= 0.12 && (!best || d < best.d - 1e-6 || (Math.abs(d - best.d) < 1e-6 && e.score > best.e.score))) best = { d, e };
    }
    if (!best) { window.__missing[c + '@' + (Math.round(ref * 10) / 10).toFixed(1)] = 1; return null; }
    src = best.e.src;
    // time map: the piece (same source) covering ts, else the ref piece extended
    let e = best.e;
    for (const x of ents) if (x.src === src && ts >= x.m[0] && ts <= x.m[1]) { e = x; break; }
    rate = (e.s[1] - e.s[0]) / Math.max(1e-6, e.m[1] - e.m[0]);
    sts = e.s[0] + (ts - e.m[0]) * rate;
    const er = best.e, rr = (er.s[1] - er.s[0]) / Math.max(1e-6, er.m[1] - er.m[0]);
    sref = er.s[0] + (ref - er.m[0]) * rr;
  }
  const segs = VID.meta(src).segs, fr = Math.round(sref * 30); let seg = null, bd = 1e9;
  for (const g of segs) { const d = fr < g[0] ? g[0] - fr : fr > g[1] ? fr - g[1] : 0; if (d < bd) { bd = d; seg = g; } }
  const lo = seg[0] / 30, hi = seg[1] / 30, cl = clamp(sts, lo, hi);
  if (Math.abs(cl - sts) > 1.5 / 30) { const k = c + '@' + ref.toFixed(2); window.__clamps[k] = Math.max(window.__clamps[k] || 0, Math.abs(cl - sts)); }
  return { src, ts: cl, rate, seg };
}
function slate(c, ts, o) {      // stand-in for a shot with no source in this orientation
  if (VID.collecting) return;
  const r = (o && o.rect) || [0, 0, W, H];
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); ctx.rect(r[0], r[1], r[2], r[3]); ctx.clip();
  ctx.fillStyle = '#26221F'; ctx.fillRect(r[0], r[1], r[2], r[3]); ctx.strokeStyle = ORA(0.25); ctx.lineWidth = 18;
  for (let x = -H; x < W + H; x += 70) { ctx.beginPath(); ctx.moveTo(r[0] + x, r[1]); ctx.lineTo(r[0] + x + r[3], r[1] + r[3]); ctx.stroke(); }
  setF(F(800, 46, 'Mono'), 3); ctx.fillStyle = WHT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText((NEED === 'v' ? 'VERTICAL' : 'HORIZONTAL') + ' SOURCE NEEDED', r[0] + r[2] / 2, r[1] + r[3] / 2 - 30);
  setF(F(700, 34, 'Mono'), 2); ctx.fillStyle = OR; ctx.fillText(`${c} @ ${ts.toFixed(2)}s`, r[0] + r[2] / 2, r[1] + r[3] / 2 + 30);
  ctx.restore();
}
// draw source `src` (already resolved) at source time ts
function footageSrc(src, ts, o) {
  o = o || {};
  const m = VID.meta(src); const q = o.q || 'f';
  const tr = ftrans(src, o), r = tr.r, sx = tr.sx, sy = tr.sy, vw = tr.vw, vh = tr.vh;
  tr.src = src; tr.ts = ts;
  const fpos = ts * 30, i0 = clamp(Math.floor(fpos + 1e-4), 0, m.n - 1), fr = fpos - Math.floor(fpos + 1e-4);
  const useBlend = o.blend && fr > 0.12 && fr < 0.88 && i0 + 1 < m.n;
  const img0 = VID.get(src, useBlend ? i0 : clamp(Math.round(fpos), 0, m.n - 1), q);
  const img1 = useBlend ? VID.get(src, i0 + 1, q) : null;
  if (VID.collecting || !img0) return tr;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y);
  if (o.clip) { ctx.beginPath(); o.clip(); ctx.clip(); }
  const cx = r[0] + r[2] / 2 + tr.dx, cy = r[1] + r[3] / 2 + tr.dy;
  ctx.translate(cx, cy); if (tr.rot) ctx.rotate(tr.rot); if (tr.s !== 1) ctx.scale(tr.s, tr.s); ctx.translate(-r[2] / 2, -r[3] / 2);
  ctx.globalAlpha *= (o.alpha === undefined ? 1 : o.alpha);
  if (o.op) ctx.globalCompositeOperation = o.op;
  if (o.filter) ctx.filter = o.filter;
  const k0 = img0._k || 1; ctx.drawImage(img0, sx * k0, sy * k0, vw * k0, vh * k0, 0, 0, r[2], r[3]);
  if (img1) { const k1 = img1._k || 1; ctx.globalAlpha *= fr; ctx.drawImage(img1, sx * k1, sy * k1, vw * k1, vh * k1, 0, 0, r[2], r[3]); }
  ctx.restore();
  return tr;
}
// draw master clip c at master time ts (resolved to the right orientation)
function footage(c, ts, o) {
  o = o || {};
  const r = resolve(c, ts, o.ref);
  if (!r) { slate(c, ts, o); return ftrans(c, o); }
  return footageSrc(r.src, r.ts, o);
}
// source pixel (full-res coords) -> screen point, using a transform returned by footage()
function toScreen(tr, px, py) {
  const x = (px * tr.k - tr.sx) * tr.S, y = (py * tr.k - tr.sy) * tr.S;      // in rect space
  let lx = x - tr.r[2] / 2, ly = y - tr.r[3] / 2;
  lx *= tr.s; ly *= tr.s;
  if (tr.rot) { const c = Math.cos(tr.rot), s = Math.sin(tr.rot); [lx, ly] = [c * lx - s * ly, s * lx + c * ly]; }
  return [tr.r[0] + tr.r[2] / 2 + tr.dx + lx, tr.r[1] + tr.r[3] / 2 + tr.dy + ly];
}

// ---------- shots ----------
// shot spec: {c, in, d, cx, cy, cx1, cy1, z, z1, speed, ease, tr:{type,d,dir}, ...}
// The source clip plays from `in` at `speed`; cx/cy/z animate to cx1/cy1/z1 across the shot (virtual camera).
function shotParams(sh, lt, res) {
  const u = (sh.ease || E.inOutS)(clamp(lt / sh.d));
  const p = {
    cx: lerp(sh.cx === undefined ? 0.5 : sh.cx, sh.cx1 === undefined ? (sh.cx === undefined ? 0.5 : sh.cx) : sh.cx1, u),
    cy: lerp(sh.cy === undefined ? 0.5 : sh.cy, sh.cy1 === undefined ? (sh.cy === undefined ? 0.5 : sh.cy) : sh.cy1, u),
    z: lerp(sh.z || 1, sh.z1 === undefined ? (sh.z || 1) : sh.z1, u),
  };
  // cropping framing only matters when the source aspect differs from the frame; a native source keeps its full picture
  if (res && VID.meta(res.src).orient === NEED && VID.meta(sh.c).orient !== NEED) { p.cx = 0.5; p.cy = 0.5; }
  // virtual camera operator: keep a tracked point near screen fraction (fx, fy); k = strength
  if (sh.follow && !sh.rect && res) {
    const [id, fx, fy, k0] = sh.follow, tk = trackFor(id, res.src);
    if (tk) {
      const rg = trackRange(tk), sts = res.ts, pt = trackPt(tk, clamp(sts, rg[0], rg[1]));
      const sin = resolve(sh.c, sh.in, sh.in + 0.5 / 30);
      const k = k0 * Math.min(sin && rg[0] >= sin.ts - 0.02 ? 1 : ramp(sts, rg[0], 0.3), 1 - ramp(sts, rg[1] - 0.35, 0.35));
      const m = VID.meta(res.src), S = Math.max(W / m.w, H / m.h) * p.z, vw = W / S, vh = H / S;
      if (pt && k > 0) { p.cx = lerp(p.cx, (pt[0] - fx * vw + vw / 2) / m.w, k); p.cy = lerp(p.cy, (pt[1] - fy * vh + vh / 2) / m.h, k); }
    }
  }
  return p;
}
// resolved shot at local time lt: {src, ts (source time), p (framing), tr (transform)} or null when no source exists
function shotRes(sh, lt) {
  const ts = sh.in + lt * (sh.speed || 1);
  const r = resolve(sh.c, ts, sh.in + 0.5 / 30); if (!r) return null;
  r.p = shotParams(sh, lt, r);
  r.tr = ftrans(r.src, { cx: r.p.cx, cy: r.p.cy, z: r.p.z, rect: sh.rect, q: sh.q, fit: sh.fit });
  return r;
}
function drawShot(sh, lt, extra) {
  const r = shotRes(sh, lt);
  if (!r) { slate(sh.c, sh.in + lt * (sh.speed || 1), Object.assign({ rect: sh.rect }, extra || {})); return null; }
  return footageSrc(r.src, r.ts, Object.assign({ cx: r.p.cx, cy: r.p.cy, z: r.p.z, rect: sh.rect, q: sh.q, blend: (sh.speed || 1) * r.rate < 0.95, fit: sh.fit }, extra || {}));
}
function shotTrans(sh, lt) { const r = shotRes(sh, lt); return r ? r.tr : null; }
// tracked callout points: master tracks plus copies transferred to other sources ("id@src")
let TRK = {};
async function loadTracks() { try { TRK = await (await fetch('tracks/tracks.json')).json(); } catch (e) { TRK = {}; } }
function trackFor(id, src) { const t = TRK[id]; if (!t) return null; return t.c === src ? t : (TRK[id + '@' + src] || null); }
function trackRange(tk) { return tk ? [tk.f0 / 30, (tk.f0 + tk.pts.length - 1) / 30] : null; }
function trackPt(tk, sts) {      // smoothed over +-3 frames
  const f = sts * 30 - tk.f0, n = tk.pts.length; if (f < -0.5 || f > n - 0.5) return null;
  let sx = 0, sy = 0, wsum = 0;
  for (let d = -3; d <= 3; d++) { const i = clamp(Math.round(f) + d, 0, n - 1), w = 1 - Math.abs(d) / 4; sx += tk.pts[i][0] * w; sy += tk.pts[i][1] * w; wsum += w; }
  return [sx / wsum, sy / wsum];
}
// screen position of callout `id` on shot sh at local time lt -> {x, y, near} or null (near: 0..1, fades out at the track's ends)
function pinAt(id, sh, lt) {
  const r = shotRes(sh, lt); if (!r) return null;
  const tk = trackFor(id, r.src); if (!tk) return null;
  const rg = trackRange(tk), pt = trackPt(tk, clamp(r.ts, rg[0], rg[1])); if (!pt) return null;
  const [x, y] = toScreen(r.tr, pt[0], pt[1]);
  return { x, y, fade: Math.max(ramp(r.ts, rg[1] - 0.25, 0.2), r.ts < rg[0] - 0.05 ? 1 : 0) };
}
// per-format overrides: a shot may carry f916 / f169 / f45 / f11 objects that replace its fields in that format
function layoutEDL(edl, t0) { let s = t0 || 0; for (const sh of edl) { const ov = sh['f' + FMT]; if (ov) Object.assign(sh, ov); sh.start = s; s += sh.d; } return s; }
// draw the EDL at time t; transitions are centred on each cut. Returns {i, lt, tr} of the shot on top.
function playEDL(edl, t, o) {
  o = o || {};
  let cur = -1;
  for (let i = 0; i < edl.length; i++) if (t >= edl[i].start - 1e-6) cur = i;
  if (cur < 0) return null;
  const sh = edl[cur], lt = t - sh.start;
  const nxt = edl[cur + 1];
  // inside the transition into `cur`?
  const trIn = sh.tr && sh.tr.type !== 'cut' ? sh.tr : null;
  if (trIn && cur > 0 && lt < trIn.d / 2) return transition(edl[cur - 1], sh, t, trIn, o);
  // inside the transition out of `cur` (into next)?
  const trOut = nxt && nxt.tr && nxt.tr.type !== 'cut' ? nxt.tr : null;
  if (trOut && t > nxt.start - trOut.d / 2) return transition(sh, nxt, t, trOut, o);
  const tr = drawShot(sh, lt, o.extra);
  return { i: cur, lt, tr, sh };
}
// motion-blurred draw of a shot: n samples spread along (vx,vy) px and/or scale ds
function blurShot(sh, lt, base, vx, vy, ds, n) {
  const spread = Math.hypot(vx, vy) + Math.abs(ds) * 600;
  if (spread < 3 || VID.collecting) return drawShot(sh, lt, base);
  n = n || Math.min(9, 3 + Math.round(spread / 40));
  const sc = scratch('mb');
  const g = sc.g; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
  const keep = ctx; ctx = g;
  let tr = null;
  for (let j = 0; j < n; j++) {
    const f = n === 1 ? 0 : j / (n - 1) - 0.5;
    g.globalCompositeOperation = 'lighter';
    tr = drawShot(sh, lt, Object.assign({}, base, { dx: (base.dx || 0) + vx * f, dy: (base.dy || 0) + vy * f, s: (base.s || 1) * (1 + ds * f), alpha: (base.alpha === undefined ? 1 : base.alpha) / n }));
  }
  ctx = keep;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(sc, 0, 0); ctx.restore();
  return tr;
}
function transition(A, B, t, tr, o) {
  const d = tr.d, u = clamp((t - (B.start - d / 2)) / d);
  const la = t - A.start, lb = t - B.start;
  const type = tr.type, dir = tr.dir || 1;
  let top = null;
  if (type === 'dissolve' || type === 'leak') {
    drawShot(A, la, o.extra); top = drawShot(B, lb, Object.assign({}, o.extra, { alpha: E.inOutS(u) }));
    if (type === 'leak') leak(u, { a: tr.a || 0.55, x0: dir > 0 ? -300 : W + 300, x1: dir > 0 ? W + 300 : -300 });
  } else if (type === 'dip') {        // dip to colour
    if (u < 0.5) drawShot(A, la, o.extra); else top = drawShot(B, lb, o.extra);
    fillScreen(tr.col || BLK, Math.sin(Math.PI * u));
  } else if (type === 'flash') {
    if (u < 0.5) drawShot(A, la, o.extra); else top = drawShot(B, lb, o.extra);
    fillScreen(tr.col || WHT, Math.pow(Math.sin(Math.PI * u), 2) * (tr.a || 0.85));
  } else if (type === 'whip' || type === 'whipv') {   // fast directional push with motion blur
    const e = E.inOutQ(u), v = (E.inOutQ(clamp(u + 0.02)) - E.inOutQ(clamp(u - 0.02))) / 0.04;   // speed 0..~2.6
    const L = type === 'whip' ? W : H, blurLen = v * L * 0.075;
    const ax = type === 'whip' ? -dir * L * e : 0, ay = type === 'whipv' ? -dir * L * e : 0;
    const bx = type === 'whip' ? dir * L * (1 - e) : 0, by = type === 'whipv' ? dir * L * (1 - e) : 0;
    blurShot(A, la, Object.assign({}, o.extra, { dx: ax, dy: ay }), type === 'whip' ? blurLen : 0, type === 'whipv' ? blurLen : 0, 0);
    top = blurShot(B, lb, Object.assign({}, o.extra, { dx: bx, dy: by }), type === 'whip' ? blurLen : 0, type === 'whipv' ? blurLen : 0, 0);
  } else if (type === 'zoom') {       // zoom through: A rushes in, B arrives from big
    const e = E.inOutQ(u), v = (E.inOutQ(clamp(u + 0.02)) - E.inOutQ(clamp(u - 0.02))) / 0.04;
    if (u < 0.5) blurShot(A, la, Object.assign({}, o.extra, { s: 1 + 1.2 * e * 2 * 0.5 + e * 0.4 }), 0, 0, v * 0.16);
    else top = blurShot(B, lb, Object.assign({}, o.extra, { s: 1 + (1 - e) * 1.0 }), 0, 0, v * 0.16);
    fillScreen(WHT, Math.pow(Math.max(0, 1 - Math.abs(u - 0.5) / 0.12), 2) * 0.35);
  } else if (type === 'push') {
    const e = E.inOutC(u);
    drawShot(A, la, Object.assign({}, o.extra, { dx: -dir * W * e * 0.35, alpha: 1 }));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 0.5 * e; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
    top = drawShot(B, lb, Object.assign({}, o.extra, { dx: dir * W * (1 - e) }));
  } else if (type === 'bar') {        // brand-orange bar sweeps across; the cut hides under it
    const e1 = E.inOutQ(clamp(u / 0.55)), e2 = E.inOutQ(clamp((u - 0.45) / 0.55));
    if (u < 0.5) drawShot(A, la, o.extra); else top = drawShot(B, lb, o.extra);
    const x0 = dir > 0 ? lerp(-W, 0, e1) + W * e2 : lerp(W, 0, e1) - W * e2;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = tr.col || OR; ctx.fillRect(x0, 0, W, H); ctx.restore();
  } else if (type === 'iris') {        // circle reveal of B from a point
    drawShot(A, la, o.extra);
    const R = Math.hypot(W, H) * E.inOutC(u), px = (tr.x === undefined ? 0.5 : tr.x) * W, py = (tr.y === undefined ? 0.5 : tr.y) * H;
    top = drawShot(B, lb, Object.assign({}, o.extra, { clip: () => ctx.arc(px, py, Math.max(1, R), 0, 7) }));
    if (u > 0 && u < 1) { ctx.save(); ctx.strokeStyle = OR; ctx.lineWidth = 10 * (1 - u); ctx.beginPath(); ctx.arc(px, py, R, 0, 7); ctx.stroke(); ctx.restore(); }
  } else if (type === 'slice') {       // venetian slices: B arrives in staggered vertical strips
    drawShot(A, la, o.extra);
    const n = tr.n || 5, sw = W / n;
    for (let j = 0; j < n; j++) {
      const ej = E.inOutQ(clamp((u - j * 0.08) / (1 - (n - 1) * 0.08)));
      if (ej <= 0) continue;
      const x = j * sw, hh = H * ej, y = dir > 0 ? 0 : H - hh;
      top = drawShot(B, lb, Object.assign({}, o.extra, { clip: () => ctx.rect(x - 0.5, y, sw + 1, hh) }));
    }
  } else { top = drawShot(u < 0.5 ? A : B, u < 0.5 ? la : lb, o.extra); }
  return { i: null, lt: lb, tr: top, sh: u < 0.5 ? A : B, u };
}

// ---------- effects ----------
function leak(u, o) {      // warm light-leak sweep, u 0..1
  o = o || {}; if (u <= 0 || u >= 1 || VID.collecting) return;
  const a = Math.sin(Math.PI * u) * (o.a || 0.5), x = lerp(o.x0 === undefined ? -300 : o.x0, o.x1 === undefined ? W + 300 : o.x1, E.inOutC(u)), y = lerp(H * 0.3, H * 0.62, u);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen';
  const g = ctx.createRadialGradient(x, y, 0, x, y, (o.r || 1.06) * Math.max(W, H) * 0.6);
  g.addColorStop(0, `rgba(255,200,140,${a})`); g.addColorStop(0.45, `rgba(255,128,40,${a * 0.45})`); g.addColorStop(1, 'rgba(255,90,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
// blurred, cover-fitted footage for backgrounds (downscale/upscale; amt = 1/scale factor)
function blurFootage(c, ts, o) {
  o = o || {}; const rs = resolve(c, ts, o.ref); if (!rs) { slate(c, ts, o); return; }
  const m = VID.meta(rs.src); const img = VID.get(rs.src, VID.idx(rs.src, rs.ts), 'h');
  if (!img || VID.collecting) return;
  const r = o.rect || [0, 0, W, H], f = o.amt || 24;
  const sw = Math.max(8, Math.round(r[2] / f)), sh = Math.max(8, Math.round(r[3] / f));
  const a = scratch('blurA', Math.round(r[2] / 4), Math.round(r[3] / 4)), b = scratch('blurB', sw, sh);
  const S = Math.max(a.width / m.hw, a.height / m.hh) * (o.z || 1.08), vw = a.width / S, vh = a.height / S;
  const kb = img._k || 1; a.g.drawImage(img, (m.hw - vw) / 2 * kb, (m.hh - vh) / 2 * kb, vw * kb, vh * kb, 0, 0, a.width, a.height);
  b.g.drawImage(a, 0, 0, b.width, b.height);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(b, r[0], r[1], r[2], r[3]);
  if (o.dark) { ctx.fillStyle = `rgba(8,7,6,${o.dark})`; ctx.fillRect(r[0], r[1], r[2], r[3]); }
  ctx.restore();
}
// footage (or any drawing) visible only inside text: drawMask() draws the text in white on the mask canvas
function knockout(drawMask, drawFill, alpha) {
  if (VID.collecting) { drawFill(); return; }
  const m = scratch('koM'), f = scratch('koF');
  m.g.setTransform(1, 0, 0, 1, 0, 0); m.g.clearRect(0, 0, W, H); f.g.setTransform(1, 0, 0, 1, 0, 0); f.g.clearRect(0, 0, W, H);
  let keep = ctx; ctx = m.g; drawMask(); ctx = f.g; drawFill(); ctx = keep;
  f.g.save(); f.g.setTransform(1, 0, 0, 1, 0, 0); f.g.globalCompositeOperation = 'destination-in'; f.g.drawImage(m, 0, 0); f.g.restore();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha === undefined ? 1 : alpha; ctx.drawImage(f, 0, 0); ctx.restore();
}
