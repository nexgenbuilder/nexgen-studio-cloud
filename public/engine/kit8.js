'use strict';
/* Motion kit 8 (V10, Oct 30): the motion core and the typography engine. Requires core, vid, kit3, kit4.
   1. Easing: named curves plus custom cubic beziers written 'bz:x1,y1,x2,y2'.
   2. Keyframes: a layer's L.kf = { prop: [{t, v, e}] }, t in seconds from the layer's start, e = easing INTO the next key.
      Props: x, y, sx, sy, rot (degrees), op, blur (px), track (1/1000 em), mask (0..1 reveal), glow, shadow (0..1), color (#hex), crop.
      xf(L, lt) gives the layer's state at local time lt; withLayer() draws anything under that state (transform, opacity,
      blur, mask reveal) so every layer kind, old or new, moves the same way in preview and export.
   3. Type: K8.type(L, t, xf) draws a text layer (style 'type') centred on the current origin: layout (wrap, stacked, vertical,
      arc, wave), per line / word / letter animation (entrances, exits, loops with duration, delay, stagger, direction, easing,
      intensity), and effects (gradient, animated gradient, chrome, gold, neon, outline, glass, duotone, footage in the letters,
      extrusion, soft / hard / long / layered shadows, glow, stroke, highlight sweep, underline / marker / box / strike / pill).
   Letters are placed one by one from measured prefixes (kerning kept) with tracking added by hand, so spacing matches in
   every browser. Everything is a pure function of time: no state carries between frames. */
const K8 = (() => {
  const TAU = Math.PI * 2;
  // ------------------------------------------------------------------ easing
  const outBounce = u => { const n = 7.5625, d = 2.75; if (u < 1 / d) return n * u * u; if (u < 2 / d) { u -= 1.5 / d; return n * u * u + 0.75; } if (u < 2.5 / d) { u -= 2.25 / d; return n * u * u + 0.9375; } u -= 2.625 / d; return n * u * u + 0.984375; };
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = t => ((ax * t + bx) * t + cx) * t, Y = t => ((ay * t + by) * t + cy) * t, dX = t => (3 * ax * t + 2 * bx) * t + cx;
    return u => {
      if (u <= 0) return 0; if (u >= 1) return 1;
      let t = u; for (let i = 0; i < 8; i++) { const x = X(t) - u, d = dX(t); if (Math.abs(x) < 1e-6) return Y(t); if (Math.abs(d) < 1e-6) break; t -= x / d; }
      let lo = 0, hi = 1; t = u; for (let i = 0; i < 30; i++) { const x = X(t); if (Math.abs(x - u) < 1e-6) break; if (x < u) lo = t; else hi = t; t = (lo + hi) / 2; }
      return Y(t);
    };
  }
  const EASES = [
    ['smooth', 'Ease in/out', E.inOutC], ['out', 'Ease out', E.outC], ['in', 'Ease in', E.inC], ['linear', 'Linear', E.lin], ['soft', 'Gentle', E.inOutS],
    ['sharp', 'Sharp', E.outExpo], ['back', 'Overshoot', E.outBack], ['elastic', 'Elastic', E.outElastic], ['bounce', 'Bounce', outBounce], ['snap', 'Snap', E.outQ],
    ['hold', 'Hold (jump)', u => (u < 1 ? 0 : 1)],
  ];
  const EMAP = {}; EASES.forEach(([k, , f]) => (EMAP[k] = f));
  function addEase(k, name, f) { if (EMAP[k]) return; EASES.push([k, name, f]); EMAP[k] = f; }   // kit13 adds the spring curves
  const BZ = new Map();
  function ease(name) {
    if (typeof name === 'function') return name; if (!name) return E.inOutC; if (EMAP[name]) return EMAP[name];
    if (typeof name === 'string' && name.startsWith('bz:')) { let f = BZ.get(name); if (!f) { const a = name.slice(3).split(',').map(Number); f = a.length === 4 && a.every(Number.isFinite) ? bezier(clamp(a[0]), a[1], clamp(a[2]), a[3]) : E.inOutC; BZ.set(name, f); } return f; }
    return E.inOutC;
  }

  // ------------------------------------------------------------------ colours
  const hexOk = s => typeof s === 'string' && /^#[0-9a-f]{6}$/i.test(s);
  function col(k, fb) {
    if (hexOk(k)) return k;
    switch (k) { case 'accent': return OR; case 'ink': return BLK; case 'paper': return PAPER; case 'accent2': return ACC2; case 'white': return WHT; case 'black': return '#000000'; default: return fb || WHT; }
  }
  const rgbOf = h => { const n = parseInt(String(h).slice(1, 7), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const hexOf = a => '#' + a.map(x => Math.round(clamp(x, 0, 255)).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, u) => { const A = rgbOf(col(a)), B = rgbOf(col(b)); return hexOf(A.map((x, i) => x + (B[i] - x) * u)); };
  const rgba = (h, a) => { const c = rgbOf(col(h)); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };
  const lum = h => { const c = rgbOf(col(h)).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const onCol = h => (lum(h) > 0.36 ? '#0B0B0B' : '#FFFFFF');

  // ------------------------------------------------------------------ keyframes
  const KF_PROPS = {   // base value of each animatable property when it has no keys
    x: L => +L.x || 540, y: L => +L.y || 960, sx: L => (L.sx === undefined ? 1 : +L.sx), sy: L => (L.sy === undefined ? 1 : +L.sy), rot: L => +L.rot || 0,
    op: L => (L.opacity === undefined ? 1 : +L.opacity), blur: L => +L.blur || 0, track: () => 0, mask: () => 1, glow: () => null, shadow: () => null, color: () => null, crop: () => 0,
  };
  function val(L, prop, lt) {
    const base = KF_PROPS[prop] ? KF_PROPS[prop](L) : 0, ks = L.kf && L.kf[prop];
    if (!Array.isArray(ks) || !ks.length) return base;
    if (lt <= ks[0].t) return ks[0].v; const last = ks[ks.length - 1]; if (lt >= last.t) return last.v;
    for (let i = 0; i < ks.length - 1; i++) {
      const a = ks[i], b = ks[i + 1];
      if (lt >= a.t && lt < b.t) { const u = ease(a.e || 'smooth')((lt - a.t) / Math.max(1e-6, b.t - a.t)); if (prop === 'color') return mix(a.v, b.v, clamp(u)); return a.v + (b.v - a.v) * u; }
    }
    return last.v;
  }
  function xf(L, lt) {
    return { x: val(L, 'x', lt), y: val(L, 'y', lt), sx: val(L, 'sx', lt), sy: val(L, 'sy', lt), rot: val(L, 'rot', lt) * Math.PI / 180, op: clamp(val(L, 'op', lt)),
      blur: Math.max(0, val(L, 'blur', lt)), track: val(L, 'track', lt), mask: clamp(val(L, 'mask', lt)), glow: val(L, 'glow', lt), shadow: val(L, 'shadow', lt), color: val(L, 'color', lt), crop: clamp(val(L, 'crop', lt), 0, 0.45) };
  }
  const hasKf = L => !!(L.kf && Object.values(L.kf).some(a => Array.isArray(a) && a.length));
  // true when the layer sits exactly where its legacy renderer puts it (no motion, no in/out, no effects)
  const plain = (L, s) => Math.abs(s.x - (+L.x || 540)) < 1e-3 && Math.abs(s.y - (+L.y || 960)) < 1e-3 && Math.abs(s.sx - 1) < 1e-4 && Math.abs(s.sy - 1) < 1e-4 && Math.abs(s.rot) < 1e-5 && s.blur < 0.3 && s.mask >= 1 && (s.glow == null || s.glow < 0.01) && (s.shadow == null || s.shadow < 0.01) && !L.fxGlow && !L.fxShadow;

  // portable blur for a full-frame canvas: downsample in steps and scale back up (no ctx.filter, so it matches everywhere)
  function blurred(src, px) {
    if (px < 0.4) return src;
    const f = clamp(px / 2.2, 1, 48), w = Math.max(6, Math.round(W / f)), h = Math.max(6, Math.round(H / f));
    const a = scratch('k8bA', w, h); a.g.setTransform(1, 0, 0, 1, 0, 0); a.g.globalAlpha = 1; a.g.globalCompositeOperation = 'copy'; a.g.imageSmoothingEnabled = true; a.g.imageSmoothingQuality = 'high'; a.g.drawImage(src, 0, 0, w, h);
    const w2 = Math.max(4, w >> 1), h2 = Math.max(4, h >> 1), b = scratch('k8bB', w2, h2); b.g.setTransform(1, 0, 0, 1, 0, 0); b.g.globalCompositeOperation = 'copy'; b.g.imageSmoothingQuality = 'high'; b.g.drawImage(a, 0, 0, w2, h2);
    a.g.drawImage(b, 0, 0, w, h); a.g.globalCompositeOperation = 'source-over'; return a;
  }
  // draw fn() under a layer state s: transform about (s.x, s.y), opacity, blur and a mask reveal of the local box
  function withLayer(s, box, fn, o) {
    o = o || {}; if (s.op <= 0.001 || s.sx === 0 || s.sy === 0) return;
    const setT = c => { c.setTransform(1, 0, 0, 1, SH.x, SH.y); c.translate(s.x, s.y); if (s.rot) c.rotate(s.rot); if (s.sx !== 1 || s.sy !== 1) c.scale(s.sx, s.sy); };
    const clipM = c => { if (s.mask < 1 && box) { const d = o.maskDir || 'left', [x, y, w, h] = box, m = s.mask, p = 40; c.beginPath();
      if (d === 'left') c.rect(x - p, y - p, (w + 2 * p) * m, h + 2 * p); else if (d === 'right') c.rect(x + w + p - (w + 2 * p) * m, y - p, (w + 2 * p) * m, h + 2 * p);
      else if (d === 'top') c.rect(x - p, y - p, w + 2 * p, (h + 2 * p) * m); else if (d === 'bottom') c.rect(x - p, y + h + p - (h + 2 * p) * m, w + 2 * p, (h + 2 * p) * m);
      else { const cx = x + w / 2, cy = y + h / 2; c.rect(cx - (w / 2 + p) * m, cy - (h / 2 + p) * m, (w + 2 * p) * m, (h + 2 * p) * m); } c.clip(); } };
    if (VID.collecting) { ctx.save(); try { fn(); } finally { ctx.restore(); } return; }
    if (s.blur >= 0.4) {
      const sc = scratch('k8L'), keep = ctx; sc.g.setTransform(1, 0, 0, 1, 0, 0); sc.g.globalAlpha = 1; sc.g.globalCompositeOperation = 'source-over'; sc.g.clearRect(0, 0, W, H);
      ctx = sc.g; try { ctx.save(); setT(ctx); clipM(ctx); fn(); ctx.restore(); } finally { ctx = keep; }
      const b = blurred(sc, s.blur); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= s.op; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(b, 0, 0, W, H); ctx.restore(); return;
    }
    ctx.save(); setT(ctx); clipM(ctx); ctx.globalAlpha *= s.op; try { fn(); } finally { ctx.restore(); }
  }
  // a legacy layer (its renderer draws in absolute canvas coordinates): render it whole, then place the result under s.
  // Effects on legacy layers live here too: a glow (brand accent) and a drop shadow, from keyframes (s) or the layer's
  // static fxGlow / fxShadow. Type and motion-graphics layers keep their own richer fx and never come through here.
  function legacy(L, s, draw, box) {
    if (VID.collecting) { draw(); return; }
    const sc = K4.into('k8Leg', draw), ax = +L.x || 540, ay = +L.y || 960;
    const loc = box ? [box[0] - ax, box[1] - ay, box[2], box[3]] : null;
    const gl = s.glow == null ? (+L.fxGlow || 0) : s.glow, sh = s.shadow == null ? (+L.fxShadow || 0) : s.shadow;
    withLayer(s, loc, () => { const c = ctx; c.translate(-ax, -ay); c.translate(-SH.x, -SH.y);
      if (gl > 0.01 || sh > 0.01) { c.shadowColor = gl > 0.01 ? 'rgba(232,24,48,0.6)' : 'rgba(0,0,0,0.55)'; c.shadowBlur = Math.max(gl * 36, sh * 28); c.shadowOffsetY = sh > 0.01 ? sh * 10 : 0; }
      c.drawImage(sc, 0, 0); });
  }

  // ------------------------------------------------------------------ type: layout
  const METRIC = new Map();
  function metrics(f) {   // cap height and descent for a font string (cached)
    let m = METRIC.get(f); if (m) return m;
    const c = MAINCTX; c.save(); c.font = f; c.letterSpacing = '0px'; const a = c.measureText('HÉ'), d = c.measureText('gjpqy'); c.restore();
    const sz = parseFloat(/([\d.]+)px/.exec(f)[1]);
    m = { cap: a.actualBoundingBoxAscent > 0 ? Math.min(a.actualBoundingBoxAscent, sz * 1.1) : sz * 0.72, desc: d.actualBoundingBoxDescent > 0 ? Math.min(d.actualBoundingBoxDescent, sz * 0.45) : sz * 0.22 };
    if (m.cap < sz * 0.3) m.cap = sz * 0.72;
    METRIC.set(f, m); return m;
  }
  function fontOf(L) {
    const lib = L.font && window.NX && NX.fontFamily ? NX.fontFamily(L.font) : null, fam = lib || L.slot || 'Mont';
    const wt = +L.wt || (fam === 'Bebas' ? 400 : fam === 'Corm' ? 600 : fam === 'Hand' ? 700 : fam === 'Mono' ? 700 : 800);
    return { fam, wt: fam === 'Mono' ? (wt >= 750 ? 800 : wt >= 600 ? 700 : 500) : wt, it: L.ital ? 'italic' : '' };
  }
  const caseOf = (s, c) => (c === 'upper' ? s.toUpperCase() : c === 'lower' ? s.toLowerCase() : c === 'title' ? s.toLowerCase().replace(/(^|[\s\-–(])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()) : s);
  function autoStack(s) {   // one line of text split into 2-4 stacked lines of similar length
    const ws = s.split(/\s+/).filter(Boolean); if (ws.length < 2) return [s];
    const n = ws.length <= 3 ? ws.length : ws.length <= 6 ? Math.ceil(ws.length / 2) : 4, per = Math.ceil(ws.length / n), out = [];
    for (let i = 0; i < ws.length; i += per) out.push(ws.slice(i, i + per).join(' ')); return out;
  }
  // returns {G: glyphs, lines, box:[x,y,w,h], size, fo} centred on the origin
  function layout(L, extraTrack) {
    const fo = fontOf(L), size = clamp(+L.size || 110, 8, 1200), trkEm = ((+L.track || 0) + (extraTrack || 0)) / 1000, mode = L.layout || 'wrap';
    const lead = clamp(+L.lead || (mode === 'stack' ? 0.98 : 1.08), 0.6, 3), maxW = clamp(+L.w || 900, 80, 2000), align = L.align || 'center';
    let txt = caseOf(String(L.text == null ? '' : L.text), L.case).replace(/\r/g, '');
    const fAt = s => F(fo.wt, s, fo.fam, fo.it);
    let rows = [];   // {s, size}
    const paras = txt.split('\n');
    const wOf = (s, sz) => (s ? textW(s, fAt(sz), 0) + Math.max(0, [...s].length - 1) * trkEm * sz : 0);
    if (mode === 'stack') {
      let ls = paras.map(s => s.trim()).filter(Boolean); if (ls.length === 1) ls = autoStack(ls[0]);
      for (const s of ls) { const w100 = wOf(s, 100); rows.push({ s, size: w100 > 0 ? clamp(100 * maxW / w100, size * 0.3, size * 3) : size }); }
    } else if (mode === 'vertical' || mode === 'arc') {
      rows = (mode === 'arc' ? [paras.map(s => s.trim()).filter(Boolean).join(' ')] : paras).map(s => ({ s, size }));
    } else {
      for (const p of paras) {
        const ws = p.split(/(\s+)/).filter(x => x.length); let cur = '';
        if (!ws.length) { rows.push({ s: '', size }); continue; }
        for (const w of ws) { if (/^\s+$/.test(w)) { if (cur) cur += ' '; continue; } const tryS = cur + w; if (cur && wOf(tryS, size) > maxW) { rows.push({ s: cur.trimEnd(), size }); cur = w; } else cur = tryS; }
        rows.push({ s: cur.trimEnd(), size });
      }
    }
    const G = [], lines = []; let ci = 0, wi = 0;
    if (mode === 'vertical') {
      const cols = rows.map(r => [...r.s]), colW = size * 1.05, n = cols.length, x0 = -(n - 1) * colW / 2;
      let maxH = 0; cols.forEach(cs => { maxH = Math.max(maxH, cs.length * size * 0.92 * lead); });
      cols.forEach((cs, li) => {
        const f = fAt(size), m = metrics(f), h = cs.length * size * 0.92 * lead, y0 = -h / 2, line = { li, glyphs: [], x0: 1e9, x1: -1e9, top: y0, bot: y0 + h, size, f, m };
        cs.forEach((ch, k) => { if (/\s/.test(ch)) { wi++; return; } const w = textW(ch, f, 0), x = x0 + li * colW - w / 2, y = y0 + (k + 0.5) * size * 0.92 * lead + m.cap / 2;
          const g = { ch, x, y, w, size, f, m, li, wi, ci: ci++, lci: line.glyphs.length, rot: 0 }; G.push(g); line.glyphs.push(g); line.x0 = Math.min(line.x0, x); line.x1 = Math.max(line.x1, x + w); });
        wi++; lines.push(line);
      });
    } else {
      const lhs = rows.map(r => r.size * lead), totH = lhs.reduce((a, b) => a + b, 0) - (rows.length ? rows[rows.length - 1].size * (lead - 1) : 0);
      const boxW = Math.max(1, ...rows.map(r => wOf(r.s, r.size)));
      let y = -totH / 2;
      rows.forEach((r, li) => {
        const f = fAt(r.size), m = metrics(f), sz = r.size, trk = trkEm * sz, lw = wOf(r.s, sz), lh = sz * lead;
        const base = y + (li === rows.length - 1 ? sz : lh) / 2 + m.cap / 2;
        const x0 = align === 'left' ? -boxW / 2 : align === 'right' ? boxW / 2 - lw : -lw / 2;
        const line = { li, glyphs: [], x0, x1: x0 + lw, top: base - m.cap - sz * 0.12, bot: base + m.desc, base, size: sz, f, m };
        const chars = [...r.s]; let pre = '';
        chars.forEach((ch, k) => {
          const x = x0 + textW(pre, f, 0) + k * trk, w = textW(ch, f, 0); pre += ch;
          if (/\s/.test(ch)) { wi++; return; }
          const g = { ch, x, y: base, w, size: sz, f, m, li, wi, ci: ci++, lci: line.glyphs.length, rot: 0 }; G.push(g); line.glyphs.push(g);
        });
        wi++; lines.push(line); y += lh;
      });
      if (mode === 'arc' && G.length) {   // bend the single line round a circle; L.arc = total sweep in degrees (negative bends down)
        const sweep = clamp(+L.arc || 140, -320, 320) * Math.PI / 180, lw = lines[0].x1 - lines[0].x0, R = lw / Math.max(0.05, Math.abs(sweep)), sg = sweep < 0 ? -1 : 1;
        for (const g of G) { const mid = g.x + g.w / 2 - (lines[0].x0 + lw / 2), th = mid / R; g.ax = Math.sin(th) * R; g.ay = sg * (R - Math.cos(th) * R); g.rot = sg * th; }
        const ys = G.map(g => g.ay), ymid = (Math.min(...ys) + Math.max(...ys)) / 2;
        for (const g of G) { g.ay -= ymid; g.arc = true; }
        lines[0].top = Math.min(...G.map(g => g.ay)) - size * 0.9; lines[0].bot = Math.max(...G.map(g => g.ay)) + size * 0.3;
        lines[0].x0 = Math.min(...G.map(g => g.ax - g.w / 2)); lines[0].x1 = Math.max(...G.map(g => g.ax + g.w / 2));
      }
      if (mode === 'wave') { const amp = size * 0.13 * (L.wamp === undefined ? 1 : +L.wamp); for (const g of G) g.y += Math.sin(g.ci * 0.62) * amp; lines.forEach(l => { l.top -= amp; l.bot += amp; }); }
    }
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const l of lines) { if (!l.glyphs.length) continue; x0 = Math.min(x0, l.x0); x1 = Math.max(x1, l.x1); y0 = Math.min(y0, l.top); y1 = Math.max(y1, l.bot); }
    if (x0 > x1) { x0 = -size; x1 = size; y0 = -size / 2; y1 = size / 2; }
    return { G, lines, box: [x0, y0, x1 - x0, y1 - y0], size, fo, nW: wi, nC: ci };
  }
  // units of animation: each glyph belongs to one unit per stage
  function unitsOf(Lay, by) {
    const map = new Map(), U = [];
    for (const g of Lay.G) {
      const key = by === 'char' ? g.ci : by === 'word' ? g.wi : by === 'line' ? g.li : 0;
      let u = map.get(key); if (!u) { u = { k: U.length, glyphs: [], x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9, li: g.li, wi: g.wi, ci: g.ci }; map.set(key, u); U.push(u); }
      u.glyphs.push(g); const gx = g.arc ? g.ax - g.w / 2 : g.x, gy = g.arc ? g.ay : g.y;
      u.x0 = Math.min(u.x0, gx); u.x1 = Math.max(u.x1, gx + g.w); u.y0 = Math.min(u.y0, gy - g.m.cap); u.y1 = Math.max(u.y1, gy + g.m.desc * 0.6);
    }
    for (const u of U) { u.cx = (u.x0 + u.x1) / 2; u.cy = (u.y0 + u.y1) / 2; }
    return U;
  }

  // ------------------------------------------------------------------ type: animation presets
  // fn(e, raw, U, o) -> partial state. e: eased progress, raw: linear, U: the unit, o: {amt, v:[vx,vy] direction, size, n, t, lt}
  const DIRV = { bottom: [0, 1], top: [0, -1], left: [-1, 0], right: [1, 0] };
  const IN = {
    none: { name: 'None', cat: 'Basic', by: 'all', d: 0.01, st: 0, fn: () => ({}) },
    fade: { name: 'Fade', cat: 'Basic', by: 'line', d: 0.6, st: 0.1, ease: 'soft', fn: e => ({ a: e }) },
    rise: { name: 'Rise', cat: 'Basic', by: 'line', d: 0.7, st: 0.1, ease: 'out', dir: 'bottom', fn: (e, r, U, o) => ({ dx: o.v[0] * (1 - e) * o.size * 0.45 * o.amt, dy: o.v[1] * (1 - e) * o.size * 0.45 * o.amt, a: clamp(r * 2) }) },
    slide: { name: 'Slide', cat: 'Basic', by: 'line', d: 0.65, st: 0.08, ease: 'snap', dir: 'left', fn: (e, r, U, o) => ({ dx: o.v[0] * (1 - e) * 900 * o.amt, dy: o.v[1] * (1 - e) * 600 * o.amt, a: clamp(r * 3) }) },
    zoom: { name: 'Scale', cat: 'Basic', by: 'all', d: 0.7, st: 0, ease: 'out', fn: (e, r, U, o) => { const s = Math.max(0.02, 1 - (1 - e) * 0.65 * o.amt); return { sx: s, sy: s, a: clamp(r * 2.5) }; } },
    pop: { name: 'Overshoot pop', cat: 'Kinetic', by: 'word', d: 0.5, st: 0.09, ease: 'back', fn: (e, r) => ({ sx: Math.max(0, e), sy: Math.max(0, e), a: clamp(r * 4) }) },
    bounce: { name: 'Bounce in', cat: 'Kinetic', by: 'char', d: 0.85, st: 0.04, ease: 'bounce', fn: (e, r, U, o) => ({ dy: -(1 - e) * o.size * 1.6 * o.amt, a: clamp(r * 6) }) },
    elastic: { name: 'Elastic stretch', cat: 'Kinetic', by: 'line', d: 1.0, st: 0.1, ease: 'elastic', fn: (e, r, U, o) => ({ sx: Math.max(0.05, 1 + (1 - e) * 1.3 * o.amt), sy: Math.max(0.05, 1 - (1 - e) * 0.55 * o.amt), a: clamp(r * 5) }) },
    punch: { name: 'Scale punch', cat: 'Kinetic', by: 'all', d: 0.45, st: 0, ease: 'sharp', fn: (e, r, U, o) => { const s = 1 + (1 - e) * 1.4 * o.amt; return { sx: s, sy: s, a: clamp(r * 6), blur: (1 - e) * 9 * o.amt }; } },
    typewriter: { name: 'Typewriter', cat: 'Text', by: 'char', d: 0.01, st: 0.055, ease: 'linear', caret: true, fn: (e, r) => ({ a: r > 0 ? 1 : 0 }) },
    letters: { name: 'Letter by letter', cat: 'Text', by: 'char', d: 0.35, st: 0.035, ease: 'out', fn: (e, r, U, o) => ({ a: e, dy: (1 - e) * o.size * 0.14 * o.amt }) },
    words: { name: 'Word by word', cat: 'Text', by: 'word', d: 0.4, st: 0.16, ease: 'back', fn: (e, r) => ({ sx: 0.55 + 0.45 * e, sy: 0.55 + 0.45 * e, a: clamp(r * 3) }) },
    cascade: { name: 'Character cascade', cat: 'Kinetic', by: 'char', d: 0.6, st: 0.045, ease: 'back', fn: (e, r, U, o) => ({ dy: -(1 - e) * o.size * 1.3 * o.amt, rot: (1 - e) * (hash(U.ci * 3.7 + 1) - 0.5) * 1.1 * o.amt, a: clamp(r * 3) }) },
    splitc: { name: 'Split characters', cat: 'Kinetic', by: 'char', d: 0.55, st: 0.03, ease: 'snap', fn: (e, r, U, o) => ({ dy: (U.ci % 2 ? 1 : -1) * (1 - e) * o.size * 1.5 * o.amt, a: clamp(r * 2.5) }) },
    tracking: { name: 'Tracking expansion', cat: 'Cinematic', by: 'all', d: 1.3, st: 0, ease: 'out', fn: (e, r, U, o) => ({ trk: (1 - e) * o.size * 0.5 * o.amt, a: clamp(r * 1.5), blur: (1 - e) * 6 * o.amt }) },
    blur: { name: 'Blur to focus', cat: 'Cinematic', by: 'all', d: 0.9, st: 0, ease: 'out', fn: (e, r, U, o) => ({ blur: (1 - e) * 28 * o.amt, a: clamp(r * 1.6), sx: 1 + (1 - e) * 0.08, sy: 1 + (1 - e) * 0.08 }) },
    wipe: { name: 'Mask reveal', cat: 'Reveal', by: 'line', d: 0.75, st: 0.12, ease: 'smooth', dir: 'left', fn: (e, r, U, o) => ({ clip: { kind: 'wipe', p: e, dir: o.dir } }) },
    charup: { name: 'Character reveal', cat: 'Reveal', by: 'char', d: 0.55, st: 0.03, ease: 'snap', dir: 'bottom', fn: (e, r, U, o) => ({ clip: { kind: 'line' }, dy: (o.dir === 'top' ? -1 : 1) * (1 - e) * o.size * 1.1 }) },
    wordup: { name: 'Word reveal', cat: 'Reveal', by: 'word', d: 0.6, st: 0.1, ease: 'snap', dir: 'bottom', fn: (e, r, U, o) => ({ clip: { kind: 'line' }, dy: (o.dir === 'top' ? -1 : 1) * (1 - e) * o.size * 1.15 }) },
    halves: { name: 'Split text', cat: 'Reveal', by: 'line', d: 0.75, st: 0.1, ease: 'snap', fn: (e, r, U, o) => ({ split: (1 - e) * o.size * 2.4 * o.amt, a: clamp(r * 2) }) },
    glitch: { name: 'Glitch', cat: 'FX', by: 'char', d: 0.55, st: 0.015, ease: 'linear', fn: (e, r, U, o) => { const on = r > 0.12 + hash(U.ci * 1.37) * 0.45; const f = Math.floor(o.t * 30); return { a: on ? 1 : 0, dx: (hash(U.ci * 7.1 + f) - 0.5) * o.size * 0.6 * (1 - r) * o.amt, rgb: (1 - r) * o.size * 0.09 * o.amt, skew: (hash(U.ci + f * 3.3) - 0.5) * 0.6 * (1 - r) }; } },
    flip: { name: '3D flip', cat: 'Kinetic', by: 'char', d: 0.65, st: 0.04, ease: 'back', fn: (e, r, U, o) => ({ sy: Math.max(0, Math.cos(clamp(1 - e, -0.5, 1) * Math.PI / 2)), dy: -(1 - e) * o.size * 0.25, a: clamp(r * 3), shade: clamp(1 - e) }) },
    spin: { name: 'Rotation', cat: 'Kinetic', by: 'word', d: 0.75, st: 0.08, ease: 'back', fn: (e, r, U, o) => { const s = Math.max(0.02, 0.35 + 0.65 * e); return { rot: -(1 - e) * Math.PI * 0.7 * o.amt, sx: s, sy: s, a: clamp(r * 3) }; } },
    wave: { name: 'Wave', cat: 'Kinetic', by: 'char', d: 0.75, st: 0.04, ease: 'back', fn: (e, r, U, o) => ({ dy: (1 - e) * o.size * 0.8 * o.amt, rot: (1 - e) * 0.35, a: clamp(r * 3) }) },
    stagger: { name: 'Staggered slide', cat: 'Kinetic', by: 'word', d: 0.6, st: 0.09, ease: 'snap', dir: 'right', fn: (e, r, U, o) => ({ dx: o.v[0] * (1 - e) * o.size * 1.6 * o.amt, dy: o.v[1] * (1 - e) * o.size * 1.6 * o.amt, skew: -o.v[0] * (1 - e) * 0.35, a: clamp(r * 2.5) }) },
    kinetic: { name: 'Kinetic word sequence', cat: 'Kinetic', by: 'all', d: 0.4, st: 0, ease: 'sharp', special: 'kinetic', fn: () => ({}) },
    outline: { name: 'Outline to fill', cat: 'FX', by: 'char', d: 1.2, st: 0.035, ease: 'linear', fn: (e, r) => ({ stroke: clamp(r / 0.62), fill: clamp((r - 0.55) / 0.45) }) },
    liquid: { name: 'Liquid reveal', cat: 'Reveal', by: 'line', d: 1.0, st: 0.15, ease: 'soft', fn: e => ({ clip: { kind: 'liquid', p: e } }) },
  };
  const OUT = {
    none: { name: 'None', by: 'all', d: 0.01, st: 0, fn: () => ({}) },
    fade: { name: 'Fade away', by: 'all', d: 0.35, st: 0, ease: 'soft', fn: e => ({ a: 1 - e }) },
    slide: { name: 'Slide out', by: 'line', d: 0.5, st: 0.06, ease: 'in', dir: 'right', fn: (e, r, U, o) => ({ dx: o.v[0] * e * 900 * o.amt, dy: o.v[1] * e * 600 * o.amt, a: 1 - e * e }) },
    sink: { name: 'Sink', by: 'line', d: 0.45, st: 0.06, ease: 'in', fn: (e, r, U, o) => ({ dy: e * o.size * 0.5 * o.amt, a: 1 - e }) },
    shrink: { name: 'Scale down', by: 'all', d: 0.4, st: 0, ease: 'in', fn: (e, r, U, o) => { const s = Math.max(0.01, 1 - e * 0.7 * o.amt); return { sx: s, sy: s, a: 1 - e }; } },
    grow: { name: 'Pop out', by: 'all', d: 0.35, st: 0, ease: 'out', fn: (e, r, U, o) => { const s = 1 + e * 0.45 * o.amt; return { sx: s, sy: s, a: 1 - e }; } },
    blur: { name: 'Blur out', by: 'all', d: 0.5, st: 0, ease: 'in', fn: (e, r, U, o) => ({ blur: e * 26 * o.amt, a: 1 - e }) },
    apart: { name: 'Character disassembly', by: 'char', d: 0.7, st: 0.012, ease: 'in', fn: (e, r, U, o) => ({ dx: (hash(U.ci * 3.1) - 0.5) * o.size * 2.2 * e * o.amt, dy: (e * e * 2.6 - hash(U.ci * 1.9) * e * 0.9) * o.size * o.amt, rot: (hash(U.ci * 5.3) - 0.5) * 3.2 * e, a: 1 - e }) },
    glitch: { name: 'Glitch out', by: 'char', d: 0.45, st: 0.01, ease: 'linear', fn: (e, r, U, o) => { const f = Math.floor(o.t * 30); return { a: r < 0.88 - hash(U.ci * 2.1) * 0.6 ? 1 : 0, dx: (hash(U.ci * 9.7 + f) - 0.5) * o.size * 0.5 * r * o.amt, rgb: r * o.size * 0.08 * o.amt }; } },
    flip: { name: 'Flip away', by: 'char', d: 0.5, st: 0.03, ease: 'in', fn: (e, r, U, o) => ({ sy: Math.max(0, Math.cos(e * Math.PI / 2)), dy: e * o.size * 0.2, a: 1 - e * 0.4, shade: e }) },
    wipe: { name: 'Mask collapse', by: 'line', d: 0.5, st: 0.06, ease: 'smooth', dir: 'right', fn: (e, r, U, o) => ({ clip: { kind: 'wipe', p: 1 - e, dir: o.dir === 'left' ? 'right' : o.dir === 'right' ? 'left' : o.dir === 'top' ? 'bottom' : 'top' } }) },
    tracking: { name: 'Tracking expansion', by: 'all', d: 0.7, st: 0, ease: 'in', fn: (e, r, U, o) => ({ trk: e * o.size * 0.55 * o.amt, a: 1 - e, blur: e * 7 }) },
    dissolve: { name: 'Particle disintegration', by: 'char', d: 0.85, st: 0.02, ease: 'out', fn: e => ({ a: Math.pow(1 - e, 2), dots: e }) },
    backspace: { name: 'Backspace', by: 'char', d: 0.01, st: 0.03, ease: 'linear', rev: true, fn: (e, r) => ({ a: r > 0 ? 0 : 1 }) },
    drop: { name: 'Drop', by: 'char', d: 0.6, st: 0.02, ease: 'in', fn: (e, r, U, o) => ({ dy: e * o.size * 3.2 * o.amt, rot: (hash(U.ci * 2.7) - 0.5) * e * 1.6, a: 1 - clamp((r - 0.55) / 0.45) }) },
  };
  // loops run while the layer holds (after the entrance). fn(lt, U, o)
  const LOOP = {
    none: { name: 'None', by: 'all', fn: () => ({}) },
    float: { name: 'Float', by: 'all', fn: (lt, U, o) => ({ dy: Math.sin(lt * 2.2 * o.sp) * o.size * 0.045 * o.amt }) },
    pulse: { name: 'Pulse', by: 'all', fn: (lt, U, o) => { const s = 1 + Math.sin(lt * 5 * o.sp) * 0.035 * o.amt; return { sx: s, sy: s }; } },
    wave: { name: 'Wave', by: 'char', fn: (lt, U, o) => ({ dy: Math.sin(lt * 5 * o.sp - U.ci * 0.55) * o.size * 0.075 * o.amt }) },
    bounce: { name: 'Hop', by: 'word', fn: (lt, U, o) => { const ph = lmod(lt * o.sp * 1.3 - U.wi * 0.2, 1.6); return { dy: ph < 0.32 ? -Math.sin(ph / 0.32 * Math.PI) * o.size * 0.2 * o.amt : 0 }; } },
    swing: { name: 'Swing', by: 'all', fn: (lt, U, o) => ({ rot: Math.sin(lt * 2.4 * o.sp) * 0.06 * o.amt }) },
    jitter: { name: 'Jitter', by: 'char', fn: (lt, U, o) => { const f = Math.floor(lt * 12 * o.sp); return { dx: (hash(U.ci * 3.3 + f) - 0.5) * o.size * 0.035 * o.amt, dy: (hash(U.ci * 5.7 + f * 1.3) - 0.5) * o.size * 0.035 * o.amt, rot: (hash(U.ci + f * 2.1) - 0.5) * 0.05 * o.amt }; } },
    flicker: { name: 'Flicker', by: 'all', fn: (lt, U, o) => { const f = Math.floor(lt * 20 * o.sp); return { a: hash(f * 1.7 + 3) < 0.07 * o.amt ? 0.35 : hash(f * 0.37) < 0.04 * o.amt ? 0.7 : 1 }; } },
    glitch: { name: 'Glitch bursts', by: 'line', fn: (lt, U, o) => { const ph = lmod(lt * o.sp, 1.9), on = ph < 0.2; if (!on) return {}; const f = Math.floor(lt * 30); return { dx: (hash(U.li * 7 + f) - 0.5) * o.size * 0.35 * o.amt, rgb: o.size * 0.06 * o.amt }; } },
    breathe: { name: 'Breathing tracking', by: 'all', fn: (lt, U, o) => ({ trk: (Math.sin(lt * 1.6 * o.sp) * 0.5 + 0.5) * o.size * 0.07 * o.amt }) },
    shimmer: { name: 'Shimmer', by: 'all', sweep: true, fn: () => ({}) },
  };
  const lmod = (a, b) => ((a % b) + b) % b;

  // ------------------------------------------------------------------ type: effects
  const FILLS = [['solid', 'Solid'], ['gradient', 'Gradient'], ['chrome', 'Chrome'], ['gold', 'Gold'], ['neon', 'Neon'], ['outline', 'Outline'], ['glass', 'Glass'], ['duo', 'Duotone'], ['footage', 'Footage inside']];
  const SHADOWS = [['none', 'None'], ['soft', 'Soft'], ['drop', 'Drop'], ['hard', 'Hard offset'], ['long', 'Long'], ['layered', 'Layered']];
  const DECOS = [['none', 'None'], ['underline', 'Underline'], ['marker', 'Marker'], ['box', 'Box'], ['pill', 'Pill'], ['strike', 'Strike']];
  const LAYOUTS = [['wrap', 'Lines'], ['stack', 'Stacked'], ['vertical', 'Vertical'], ['arc', 'Curved'], ['wave', 'Wave']];
  function lineGrad(c, l, stops) { const g = c.createLinearGradient(0, l.base - l.m.cap * 1.05, 0, l.base + l.m.desc * 0.4); stops.forEach(([o, s]) => g.addColorStop(o, s)); return g; }
  const CHROME = [[0, '#FFFFFF'], [0.42, '#D5DCE3'], [0.5, '#5B6672'], [0.56, '#9AA6B2'], [0.8, '#EEF3F7'], [1, '#A7B2BD']];
  const GOLD = [[0, '#FFF6D2'], [0.4, '#F3C35A'], [0.5, '#8C5C14'], [0.58, '#C8902C'], [0.82, '#FFE49A'], [1, '#B07A22']];

  // ------------------------------------------------------------------ type: draw

  // ------------------------------------------------------------------ animated captions (V12): a typed script that plays word by word
  // L.cap = { mode: karaoke | pop | box | bounce | line, per: words per page (1-8), hl: colour of the spoken word, bg: none | bar | pill,
  //           bgc: colour behind, start: seconds before the first word }. L.text is the script; the words share L.d by their length.
  const CAP_MODES = [['karaoke', 'Karaoke fill'], ['pop', 'Word pop'], ['box', 'Highlight box'], ['bounce', 'Bounce'], ['line', 'Underline']];
  const CAPC = new Map();
  function capPlan(L) {
    const cp = L.cap || {}, fo = fontOf(L), size = clamp(+L.size || 72, 12, 400), maxW = clamp(+L.w || 900, 120, 1040), per = clamp(Math.round(+cp.per || 3), 1, 8);
    const txt = caseOf(String(L.text == null ? '' : L.text), L.case), tm = Array.isArray(cp.times) ? cp.times : null, key = [txt, size, maxW, per, fo.fam, fo.wt, fo.it, L.d, cp.start, L.track, L.lead, tm ? tm.length + ':' + tm.reduce((a, x) => a + x[0] * 7 + x[1], 0).toFixed(3) : ''].join('|');
    let P = CAPC.get(key); if (P) return P;
    const f = F(fo.wt, size, fo.fam, fo.it), ls = (+L.track || 0) / 1000 * size, words = txt.split(/\s+/).filter(Boolean);
    const sp = textW(' ', f, ls), m = metrics(f), lh = size * clamp(+L.lead || 1.15, 0.8, 2);
    const t0 = clamp(cp.start === undefined ? 0.15 : +cp.start, 0, 5), span = Math.max(0.5, (L.d || 3) - t0 - 0.3), wts = words.map(w => w.length + 2), tot = wts.reduce((a, b) => a + b, 0) || 1;
    // V19: cp.times = [[start, end], …] (seconds from the layer's start, one pair per word) times each word to a voiceover;
    // a page then also ends at a sentence end or a pause, so the captions breathe with the voice
    const timed = !!(tm && tm.length === words.length && words.length);
    let acc = t0; const W8 = words.map((w, i) => { const d = span * wts[i] / tot, o = timed ? { w, i, t0: +tm[i][0], t1: Math.max(+tm[i][0] + 0.04, +tm[i][1]), wd: textW(w, f, ls) } : { w, i, t0: acc, t1: acc + d, wd: textW(w, f, ls) }; acc += d; return o; });
    const pages = [], groups = [];
    if (timed) { let g = []; W8.forEach((x, i) => { g.push(x); const nx = W8[i + 1]; if (g.length >= per || !nx || nx.t0 - x.t1 > 0.3 || (/[.!?…]$/.test(x.w) && g.length > 1)) { groups.push(g); g = []; } }); }
    else for (let i = 0; i < W8.length; i += per) groups.push(W8.slice(i, i + per));
    for (const ws of groups) {
      const lines = []; let cur = [], cw = 0;
      for (const x of ws) { const add = (cur.length ? sp : 0) + x.wd; if (cur.length && cw + add > maxW) { lines.push({ ws: cur, w: cw }); cur = []; cw = 0; } cw += (cur.length ? sp : 0) + x.wd; cur.push(x); }
      if (cur.length) lines.push({ ws: cur, w: cw });
      const h = lines.length * lh; let y = -h / 2 + lh / 2 + m.cap / 2;
      for (const ln of lines) { let x = -ln.w / 2; for (const w8 of ln.ws) { w8.x = x; w8.y = y; x += w8.wd + sp; } ln.y = y; y += lh; }
      pages.push({ ws, lines, t0: ws[0].t0, t1: ws[ws.length - 1].t1, w: Math.max(...lines.map(l => l.w)), h });
    }
    P = { f, ls, size, m, lh, words: W8, pages, maxW }; if (CAPC.size > 200) CAPC.clear(); CAPC.set(key, P); return P;
  }
  function capBox(L) { const P = capPlan(L); let w = P.size * 2, h = P.lh; for (const pg of P.pages) { w = Math.max(w, pg.w); h = Math.max(h, pg.h); } const pad = P.size * 0.45; return [-w / 2 - pad, -h / 2 - pad * 0.7, w + pad * 2, h + pad * 1.4]; }
  function capType(L, t, s) {
    if (VID.collecting) return; const P = capPlan(L), lt = t - L.t0, cp = L.cap || {}, mode = cp.mode || 'karaoke', c = ctx; if (!P.pages.length) return;
    let pi = P.pages.findIndex(pg => lt < pg.t1); if (pi < 0) pi = P.pages.length - 1; const pg = P.pages[pi];
    if (pi === 0 && lt < pg.t0 - 0.12) return;
    const face = (s && s.color) || col(L.color || 'white'), hl = col(cp.hl || 'accent'), fx = L.fx || {}, out = clamp((lt - ((L.d || 3) - 0.2)) / 0.2);
    const pageA = E.outC(clamp((lt - pg.t0 + 0.12) / 0.16)) * (1 - out);
    c.save(); c.font = P.f; c.letterSpacing = P.ls + 'px'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
    const boxed = cp.bg === 'bar' || cp.bg === 'pill';
    if (boxed) { const pad = P.size * 0.34, bw = pg.w + pad * 2, bh = pg.h + pad * 1.1; c.save(); c.globalAlpha *= 0.78 * pageA; c.fillStyle = col(cp.bgc || 'ink'); c.beginPath(); c.roundRect(-bw / 2, -bh / 2, bw, bh, cp.bg === 'pill' ? bh / 2 : P.size * 0.2); c.fill(); c.restore(); }
    const sw = fx.stroke ? clamp(+fx.stroke, 0, 40) : boxed ? 0 : P.size * 0.12, scol = col(fx.scol || 'ink');
    for (const w8 of pg.ws) {
      const on = lt >= w8.t0, act = on && lt < w8.t1, k = clamp((lt - w8.t0) / Math.max(0.05, w8.t1 - w8.t0)), e = clamp((lt - w8.t0) / 0.14);
      let a = pageA, sc = 1, dy = 0, fill = face;
      if (mode === 'pop') { if (!on) continue; a *= E.outC(e); sc = 0.6 + 0.4 * E.outBack(e); if (act) fill = hl; }
      else if (mode === 'bounce') { a *= on ? 1 : 0.5; if (act) { const b = Math.sin(Math.PI * e); sc = 1 + 0.16 * b; dy = -P.size * 0.12 * b; fill = hl; } }
      else if (mode === 'line') { if (act) fill = hl; }
      else if (mode === 'box' && act) { const pad = P.size * 0.14; c.save(); c.globalAlpha *= a * E.outC(e); c.fillStyle = hl; c.beginPath(); c.roundRect(w8.x - pad, w8.y - P.m.cap - pad, w8.wd + pad * 2, P.m.cap + pad * 2 + P.m.desc * 0.3, P.size * 0.14); c.fill(); c.restore(); fill = onCol(hl); }
      c.save(); c.globalAlpha *= a; const cx = w8.x + w8.wd / 2; c.translate(cx, w8.y + dy); c.scale(sc, sc); c.translate(-cx, -w8.y);
      if (fx.shadow && fx.shadow !== 'none') { c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = P.size * 0.25; c.shadowOffsetY = P.size * 0.05; }
      if (sw > 0 && !(mode === 'box' && act)) { c.strokeStyle = scol; c.lineWidth = sw; c.strokeText(w8.w, w8.x, w8.y); }
      c.shadowColor = 'transparent';
      if (mode === 'karaoke') { c.fillStyle = face; c.fillText(w8.w, w8.x, w8.y); if (k > 0) { c.save(); c.beginPath(); c.rect(w8.x - 4, w8.y - P.size * 1.5, (w8.wd + 8) * (lt >= w8.t1 ? 1 : E.inOutS(k)), P.size * 2.2); c.clip(); c.fillStyle = hl; c.fillText(w8.w, w8.x, w8.y); c.restore(); } }
      else { c.fillStyle = fill; c.fillText(w8.w, w8.x, w8.y); }
      c.restore();
      if (mode === 'line' && act) { c.save(); c.globalAlpha *= a; c.fillStyle = hl; c.fillRect(w8.x, w8.y + P.m.desc * 0.55, w8.wd * E.outC(e), Math.max(3, P.size * 0.07)); c.restore(); }
    }
    c.restore();
  }
  function type(L, t, s) {
    if (L.cap) { capType(L, t, s); return; }
    s = s || { track: 0 }; const lt = t - L.t0, d = L.d || 3;
    const A = Object.assign({ in: 'rise', inD: 0, inDelay: 0, stagger: -1, by: 'auto', dir: '', ease: 'auto', amt: 1, out: 'fade', outD: 0, outBy: 'auto', outDir: '', loop: 'none', loopAmt: 1, loopSp: 1 }, L.anim || {});
    const fx = Object.assign({ fill: 'solid', col2: 'accent2', ang: 90, animG: false, stroke: 0, scol: 'ink', shadow: 'none', shcol: '', glow: 0, gcol: '', extrude: 0, ecol: '', deco: 'none', dcol: 'accent', sweep: false, slant: 0 }, L.fx || {});
    const P = IN[A.in] || IN.rise, Q = OUT[A.out] || OUT.fade, R = LOOP[A.loop] || LOOP.none;
    const Lay = layout(L, s.track); if (!Lay.G.length) return;
    const size = Lay.size, face = s.color || col(L.color || 'white'), amt = clamp(+A.amt, 0, 3);
    if (VID.collecting) { if (fx.fill === 'footage' && fx.clip && VID.meta(fx.clip)) footTs(fx, lt) !== null && footageSrc(fx.clip, footTs(fx, lt), { rect: [0, 0, W, H], fit: 'cover', q: 'h' }); return; }
    // timing
    const byIn = A.by !== 'auto' && P.by !== 'all' ? A.by : P.by, byOut = A.outBy !== 'auto' && Q.by !== 'all' ? A.outBy : Q.by;
    const UI = unitsOf(Lay, byIn), UO = unitsOf(Lay, byOut), UL = unitsOf(Lay, R.by);
    const inD = Math.max(0.01, +A.inD || P.d), st = +A.stagger >= 0 ? +A.stagger : P.st, delay = Math.max(0, +A.inDelay || 0), outD = Math.max(0.01, +A.outD || Q.d);
    const nIn = UI.length, inEnd = P.special === 'kinetic' ? delay + Lay.nW * clamp(+A.inD || 0.42, 0.15, 1.2) + 0.35 : delay + inD + st * Math.max(0, nIn - 1);
    const outSt = Q.st, outTot = outD + outSt * Math.max(0, UO.length - 1), outStart = A.out === 'none' ? 1e9 : d - outTot;
    const eIn = A.ease && A.ease !== 'auto' ? ease(A.ease) : ease(P.ease || 'out'), eOut = ease(Q.ease || 'in');
    const oIn = { amt, size, t, lt, dir: A.dir || P.dir || 'bottom', v: DIRV[A.dir || P.dir || 'bottom'] || [0, 1], n: nIn };
    const oOut = { amt, size, t, lt, dir: A.outDir || Q.dir || 'right', v: DIRV[A.outDir || Q.dir || 'right'] || [1, 0], n: UO.length };
    const oLoop = { amt: clamp(+A.loopAmt, 0, 3), sp: clamp(+A.loopSp || 1, 0.1, 4), size };
    const SIN = UI.map(U => { const raw = clamp((lt - delay - U.k * st) / inD); return Object.assign(blank(), P.fn(eIn(raw), raw, U, oIn), { raw }); });
    const SOUT = UO.map(U => { const k = Q.rev ? UO.length - 1 - U.k : U.k, raw = clamp((lt - outStart - k * outSt) / outD); return raw <= 0 ? Object.assign(blank(), { raw: 0 }) : Object.assign(blank(), Q.fn(eOut(raw), raw, U, oOut), { raw }); });
    const loopOn = A.loop !== 'none' ? clamp((lt - inEnd) / 0.35) * (1 - clamp((lt - outStart) / 0.25)) : 0, ltl = Math.max(0, lt - inEnd);
    const SLOOP = UL.map(U => (loopOn > 0 ? damp(R.fn(ltl, U, oLoop), loopOn) : blank()));
    const gIn = new Map(), gOut = new Map(), gLoop = new Map();
    UI.forEach((U, i) => U.glyphs.forEach(g => gIn.set(g, i))); UO.forEach((U, i) => U.glyphs.forEach(g => gOut.set(g, i))); UL.forEach((U, i) => U.glyphs.forEach(g => gLoop.set(g, i)));
    const glowAmt = s.glow != null ? clamp(s.glow, 0, 2) : clamp(+fx.glow || 0, 0, 2), shadowK = s.shadow != null ? clamp(s.shadow, 0, 2) : 1;
    const shadowType = fx.shadow === 'none' && s.shadow != null && s.shadow > 0 ? 'soft' : fx.shadow;
    const sty = { face, fx, size, glowAmt, shadowK, shadowType, Lay, t, lt };
    // kinetic word sequence: words one at a time, big, then the whole line
    if (P.special === 'kinetic') { const seqEnd = kinetic(L, Lay, lt, delay, inD, sty, amt); if (lt < seqEnd) return; for (const S of SIN) { const k = clamp((lt - seqEnd) / 0.35); S.a = E.outC(k); S.sx = S.sy = 1 + (1 - E.outC(k)) * 0.1; } }
    const layerFx = fx.fill === 'footage' || fx.sweep || R.sweep;
    let target = ctx, sc = null;
    if (layerFx) { sc = scratch('k8T'); sc.g.setTransform(1, 0, 0, 1, 0, 0); sc.g.globalAlpha = 1; sc.g.globalCompositeOperation = 'source-over'; sc.g.clearRect(0, 0, W, H); sc.g.setTransform(ctx.getTransform()); sc.g.globalAlpha = 1; }
    // decorations sit behind the letters
    decorate(Lay, fx, sty, SIN, UI, SOUT, UO, lt, size);
    const each = (pass) => {
      for (const g of Lay.G) {
        const si = SIN[gIn.get(g)], so = SOUT[gOut.get(g)], sl = SLOOP[gLoop.get(g)];
        const a = si.a * so.a * sl.a; if (a <= 0.003) continue;
        const ui = UI[gIn.get(g)], uo = UO[gOut.get(g)], ul = UL[gLoop.get(g)];
        const c = pass === 'face' && sc ? sc.g : ctx;
        c.save();
        apply(c, sl, ul); if (so.clip) clipFor(c, so.clip, uo, Lay, g); apply(c, so, uo); if (si.clip) clipFor(c, si.clip, ui, Lay, g); apply(c, si, ui);
        const ln = Lay.lines[g.li].glyphs.length, trk = (si.trk + so.trk + sl.trk) * (g.lci - (ln - 1) / 2) / Math.max(1, (ln - 1) / 2);
        let x = g.x + trk, y = g.y;
        if (g.arc) { c.translate(g.ax + trk, g.ay); c.rotate(g.rot); x = -g.w / 2; y = 0; }
        if (fx.slant) { c.translate(x + g.w / 2, y); c.transform(1, 0, -Math.tan(clamp(+fx.slant, -40, 40) * Math.PI / 180), 1, 0, 0); c.translate(-(x + g.w / 2), -y); }
        c.globalAlpha *= a;
        const split = si.split + so.split, rgb = si.rgb + so.rgb + sl.rgb, blurPx = si.blur + so.blur + sl.blur, shade = Math.max(si.shade, so.shade);
        const strokeP = si.stroke >= 0 ? si.stroke : -1, fillK = si.fill;
        if (split > 0.5) { const mid = y - g.m.cap * 0.5; for (const half of [-1, 1]) { c.save(); c.beginPath(); if (half < 0) c.rect(x - size, y - size * 2, g.w + size * 2, mid - (y - size * 2)); else c.rect(x - size, mid, g.w + size * 2, size * 2); c.clip(); c.translate(half * split, 0); paint(c, g, x, y, sty, pass, { blurPx, rgb, shade, strokeP, fillK }); c.restore(); } }
        else paint(c, g, x, y, sty, pass, { blurPx, rgb, shade, strokeP, fillK, dots: so.dots });
        c.restore();
      }
    };
    each('under'); each('face');
    if (P.caret) caretDraw(Lay, SIN, gIn, lt, inEnd, sty);
    if (sc) {
      const c = sc.g;
      if (fx.fill === 'footage') {
        c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-in';
        const ts = footTs(fx, lt), keep = ctx;
        if (ts !== null) { ctx = c; try { footageSrc(fx.clip, ts, { rect: [0, 0, W, H], fit: 'cover', q: 'h', op: 'source-in' }); } finally { ctx = keep; } }
        else { const gr = c.createLinearGradient(0, 0, W, H); gr.addColorStop(0, col('accent')); gr.addColorStop(1, col('accent2')); c.fillStyle = gr; c.fillRect(0, 0, W, H); }
        c.restore();
      }
      if (fx.sweep || R.sweep) {   // a light band crosses the letters once after the entrance (or on a loop)
        const per = 2.4 / clamp(+A.loopSp || 1, 0.2, 4), ph = R.sweep ? lmod(lt - inEnd, per) / per : (lt - inEnd) / 0.9;
        if (ph > 0 && ph < 1) { const b = Lay.box, x = lerp(b[0] - b[3] - 200, b[0] + b[2] + 200, E.inOutS(ph)); c.save(); c.globalCompositeOperation = 'source-atop';
          const gr = c.createLinearGradient(x - 160, b[1], x + 160, b[1] + b[3]); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          c.fillStyle = gr; c.fillRect(b[0] - 400, b[1] - 200, b[2] + 800, b[3] + 400); c.restore(); }
      }
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(sc, 0, 0); ctx.restore();
    }
  }
  const blank = () => ({ dx: 0, dy: 0, sx: 1, sy: 1, rot: 0, a: 1, blur: 0, clip: null, trk: 0, rgb: 0, skew: 0, split: 0, shade: 0, stroke: -1, fill: 1, dots: 0 });
  function damp(S, k) { const b = blank(); S = Object.assign(blank(), S); for (const key of ['dx', 'dy', 'rot', 'trk', 'rgb', 'skew']) b[key] = S[key] * k; b.sx = 1 + (S.sx - 1) * k; b.sy = 1 + (S.sy - 1) * k; b.a = 1 + (S.a - 1) * k; return b; }
  function apply(c, S, U) {
    if (!S.dx && !S.dy && S.sx === 1 && S.sy === 1 && !S.rot && !S.skew) return;
    c.translate(U.cx + S.dx, U.cy + S.dy); if (S.rot) c.rotate(S.rot); if (S.sx !== 1 || S.sy !== 1) c.scale(S.sx, S.sy); if (S.skew) c.transform(1, 0, S.skew, 1, 0, 0); c.translate(-U.cx, -U.cy);
  }
  function clipFor(c, cl, U, Lay, g) {
    const l = Lay.lines[g.li], pad = Lay.size * 0.08;
    c.beginPath();
    if (cl.kind === 'line') { c.rect(U.x0 - Lay.size, l.top - pad, U.x1 - U.x0 + Lay.size * 2, l.bot - l.top + pad * 2); }
    else if (cl.kind === 'wipe') { const p = clamp(cl.p), x0 = U.x0 - pad, y0 = U.y0 - pad * 2, w = U.x1 - U.x0 + pad * 2, h = U.y1 - U.y0 + pad * 4;
      if (cl.dir === 'right') c.rect(x0 + w * (1 - p), y0, w * p, h); else if (cl.dir === 'top') c.rect(x0, y0, w, h * p); else if (cl.dir === 'bottom') c.rect(x0, y0 + h * (1 - p), w, h * p); else c.rect(x0, y0, w * p, h); }
    else if (cl.kind === 'liquid') { const p = clamp(cl.p), x0 = U.x0 - pad, x1 = U.x1 + pad, y0 = U.y0 - pad * 3, y1 = U.y1 + pad * 3, lvl = lerp(y1 + Lay.size * 0.3, y0 - Lay.size * 0.3, p), amp = Lay.size * 0.12 * Math.sin(Math.PI * p);
      c.moveTo(x0, y1 + 10); for (let x = x0; x <= x1 + 12; x += 12) c.lineTo(x, lvl + Math.sin(x * 0.03 + p * 9) * amp + Math.sin(x * 0.011 - p * 5) * amp * 0.6); c.lineTo(x1, y1 + 10); c.closePath(); }
    c.clip();
  }
  function footTs(fx, lt) { const m = fx.clip && VID.meta(fx.clip); if (!m) return null; const dur = m.n / 30, inn = clamp(+fx.cin || 0, 0, Math.max(0, dur - 0.5)); return inn + lmod(Math.max(0, lt), Math.max(0.5, dur - inn - 0.1)); }
  // one glyph, one pass. 'under': extrusion, shadows, glow, rgb copies, outer stroke. 'face': the fill itself.
  function paint(c, g, x, y, sty, pass, o) {
    const fx = sty.fx, sz = g.size, face = sty.face, l = sty.Lay.lines[g.li];
    c.font = g.f; c.letterSpacing = '0px'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    const fillGlyph = (fs, dx, dy) => { c.fillStyle = fs; c.fillText(g.ch, x + (dx || 0), y + (dy || 0)); };
    if (o.blurPx > 0.6) {   // blur via the shadow of an off-canvas copy: portable and gaussian
      if (pass !== 'face') return; const k = clamp(o.blurPx / 10);
      c.save(); c.shadowColor = rgba(face, 1); c.shadowBlur = o.blurPx * 1.4; c.shadowOffsetX = 10000; c.globalAlpha *= 0.95 * clamp(o.blurPx / 4); c.fillStyle = face; c.fillText(g.ch, x - 10000, y); c.restore();
      c.save(); c.globalAlpha *= 1 - k; paintFace(c, g, x, y, sty, l, o); c.restore(); return;
    }
    if (pass === 'under') {
      if (o.rgb > 0.5) { c.save(); c.globalAlpha *= 0.85; fillGlyph('#FF2A6D', -o.rgb, 0); fillGlyph('#1DE9FF', o.rgb, 0); c.restore(); }
      const ex = Math.min(+fx.extrude || 0, sz * 0.5);
      if (ex > 0.5) { const ec = fx.ecol ? col(fx.ecol) : mix(fx.fill === 'solid' ? face : '#888888', '#000000', 0.55), back = mix(ec, '#000000', 0.45), step = Math.max(1, ex / 22);
        for (let i = ex; i >= 1; i -= step) fillGlyph(mix(back, ec, 1 - i / ex), i * 0.7, i); }
      const sh = sty.shadowType, k = sty.shadowK, shc = fx.shcol ? col(fx.shcol) : null;
      if (sh === 'hard' && k > 0) fillGlyph(shc || (lum(face) > 0.5 ? BLK : OR), sz * 0.07 * k, sz * 0.07 * k);
      else if (sh === 'long' && k > 0) { const n = sz * 0.32 * k, base = shc || mix(BLK, '#000000', 0.2); for (let i = n; i >= 2; i -= 2.5) { c.save(); c.globalAlpha *= 0.9 * (1 - i / n) + 0.1; fillGlyph(base, i, i); c.restore(); } }
      else if (sh === 'layered' && k > 0) { const cs = shc ? [shc, mix(shc, '#000', 0.4)] : [ACC2, OR, BLK]; for (let i = cs.length; i >= 1; i--) fillGlyph(cs[i - 1], sz * 0.045 * i * k, sz * 0.045 * i * k); }
      if (sty.glowAmt > 0.01 && fx.fill !== 'neon') { const gc = fx.gcol ? col(fx.gcol) : face; c.save(); c.shadowColor = gc; c.shadowBlur = sz * 0.45 * sty.glowAmt; c.globalAlpha *= clamp(sty.glowAmt); fillGlyph(gc); c.shadowBlur = sz * 0.18 * sty.glowAmt; fillGlyph(gc); c.restore(); }
      const sw = +fx.stroke || 0; if (sw > 0.3 && fx.fill !== 'outline' && fx.fill !== 'neon') { c.save(); c.lineJoin = 'round'; c.miterLimit = 2; c.strokeStyle = col(fx.scol || 'ink'); c.lineWidth = sw * 2; c.strokeText(g.ch, x, y); c.restore(); }
      return;
    }
    // face
    const sh = sty.shadowType, k = sty.shadowK;
    if ((sh === 'soft' || sh === 'drop') && k > 0 && fx.fill !== 'neon') { c.shadowColor = fx.shcol ? rgba(fx.shcol, 0.75 * clamp(k)) : `rgba(0,0,0,${0.55 * clamp(k)})`; c.shadowBlur = sh === 'soft' ? sz * 0.28 * k : sz * 0.06; c.shadowOffsetY = sh === 'soft' ? sz * 0.05 * k : sz * 0.06 * k; c.shadowOffsetX = sh === 'drop' ? sz * 0.04 * k : 0; }
    paintFace(c, g, x, y, sty, l, o);
    if (o.shade > 0.02) { c.save(); c.shadowColor = 'transparent'; c.globalAlpha *= o.shade * 0.45; c.fillStyle = '#000'; c.fillText(g.ch, x, y); c.restore(); }
    if (o.dots > 0 && o.dots < 1) { c.save(); c.shadowColor = 'transparent'; c.fillStyle = face; const n = 12;
      for (let i = 0; i < n; i++) { const h1 = hash(g.ci * 13.1 + i), h2 = hash(g.ci * 7.7 + i * 3.1), px = x + h1 * g.w + (h2 - 0.35) * sz * 1.4 * o.dots, py = y - h2 * g.m.cap - sz * 1.1 * o.dots * (0.4 + h1), r = sz * 0.035 * (1 - o.dots) * (0.6 + h2);
        c.globalAlpha = (1 - o.dots) * 0.9; c.beginPath(); c.arc(px, py, Math.max(0.5, r), 0, TAU); c.fill(); } c.restore(); }
  }
  function paintFace(c, g, x, y, sty, l, o) {
    const fx = sty.fx, sz = g.size, face = sty.face, ch = g.ch, f = fx.fill;
    const strokeOnly = (style, w) => { c.save(); c.lineJoin = 'round'; c.strokeStyle = style; c.lineWidth = w; c.strokeText(ch, x, y); c.restore(); };
    if (o.strokeP >= 0) {   // outline-to-fill entrance: the outline draws on, then the fill arrives
      const per = sz * 4.2; c.save(); c.shadowColor = 'transparent'; c.setLineDash([per, per]); c.lineDashOffset = per * (1 - o.strokeP); c.lineJoin = 'round'; c.strokeStyle = f === 'solid' || f === 'outline' ? face : col(fx.col2 || 'accent2'); c.lineWidth = Math.max(1.5, sz * 0.025); c.strokeText(ch, x, y); c.restore();
      if (o.fillK <= 0.001 || f === 'outline') return; c.globalAlpha *= o.fillK;
    }
    switch (f) {
      case 'outline': strokeOnly(face, Math.max(1.5, +fx.stroke || sz * 0.03)); return;
      case 'neon': { const w = Math.max(2, sz * 0.045); c.save(); c.shadowColor = face; c.shadowBlur = sz * 0.55; c.globalAlpha *= 0.85; strokeOnly(face, w * 1.4); c.shadowBlur = sz * 0.22; strokeOnly(face, w); c.restore();
        c.save(); c.shadowColor = 'transparent'; strokeOnly(mix(face, '#FFFFFF', 0.75), w * 0.42); c.restore(); if (sty.glowAmt > 0) { c.save(); c.globalAlpha *= 0.12 * sty.glowAmt; c.fillStyle = face; c.fillText(ch, x, y); c.restore(); } return; }
      case 'glass': { c.fillStyle = 'rgba(255,255,255,0.16)'; c.fillText(ch, x, y); c.save(); c.shadowColor = 'transparent'; strokeOnly('rgba(255,255,255,0.8)', Math.max(1.2, sz * 0.018));
        c.beginPath(); c.rect(x - 4, y - g.m.cap - 4, g.w + 8, g.m.cap * 0.45); c.clip(); c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillText(ch, x, y); c.restore(); return; }
      case 'duo': { const mid = y - g.m.cap * 0.48; c.save(); c.beginPath(); c.rect(x - 10, y - sz * 2, g.w + 20, mid - (y - sz * 2)); c.clip(); c.fillStyle = face; c.fillText(ch, x, y); c.restore();
        c.save(); c.beginPath(); c.rect(x - 10, mid, g.w + 20, sz * 2); c.clip(); c.fillStyle = col(fx.col2 || 'accent'); c.fillText(ch, x, y); c.restore(); return; }
      case 'chrome': c.fillStyle = lineGrad(c, l, CHROME); c.fillText(ch, x, y); c.save(); c.shadowColor = 'transparent'; strokeOnly('rgba(30,36,44,0.55)', Math.max(1, sz * 0.012)); c.restore(); return;
      case 'gold': c.fillStyle = lineGrad(c, l, GOLD); c.fillText(ch, x, y); c.save(); c.shadowColor = 'transparent'; strokeOnly('rgba(90,55,10,0.5)', Math.max(1, sz * 0.012)); c.restore(); return;
      case 'gradient': { const b = sty.Lay.box, ang = (+fx.ang || 90) * Math.PI / 180, r = Math.hypot(b[2], b[3]) / 2, cx = b[0] + b[2] / 2, cy = b[1] + b[3] / 2, dx = Math.cos(ang) * r, dy = Math.sin(ang) * r;
        const gr = c.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy), c2 = col(fx.col2 || 'accent2');
        if (fx.animG) { const ph = lmod(sty.lt * 0.35, 1); for (let i = -1; i <= 2; i++) { const o0 = (i + ph) / 2; if (o0 >= 0 && o0 <= 1) gr.addColorStop(o0, i % 2 ? c2 : face); } gr.addColorStop(0, mix(face, c2, lmod(-ph * 2, 1) < 0.5 ? 0 : 1)); }
        else { gr.addColorStop(0, face); gr.addColorStop(1, c2); }
        c.fillStyle = gr; c.fillText(ch, x, y); return; }
      default: c.fillStyle = face; c.fillText(ch, x, y);
    }
  }
  function decorate(Lay, fx, sty, SIN, UI, SOUT, UO, lt, size) {
    if (!fx.deco || fx.deco === 'none') return;
    const dc = col(fx.dcol || 'accent'), c = ctx;
    const progOf = li => { let p = 0, n = 0, q = 0, m = 0; UI.forEach((U, i) => { if (li < 0 || U.glyphs.some(g => g.li === li)) { p += SIN[i].raw === undefined ? 1 : SIN[i].raw; n++; } }); UO.forEach((U, i) => { if (li < 0 || U.glyphs.some(g => g.li === li)) { q += SOUT[i].raw || 0; m++; } });
      p = n ? p / n : 1; q = m ? q / m : 0; p = n > 1 ? clamp(p) : E.inOutC(clamp(p * 1.4)); return m > 1 ? [clamp(p - q), q * q] : [p, E.inC(q)]; };
    if (fx.deco === 'box') { const [p, q] = progOf(-1), b = Lay.box, pad = size * 0.32; if (p <= 0 || q >= 1) return; c.save(); c.globalAlpha *= 1 - q; c.fillStyle = dc; const sx = E.outBack(clamp(p));
      c.translate(b[0] + b[2] / 2, b[1] + b[3] / 2); c.scale(sx, 1); c.beginPath(); c.roundRect(-b[2] / 2 - pad, -b[3] / 2 - pad * 0.6, b[2] + pad * 2, b[3] + pad * 1.2, size * 0.12); c.fill(); c.restore(); return; }
    for (const l of Lay.lines) {
      if (!l.glyphs.length) continue; const [p, q] = progOf(l.li); if (p <= 0 || q >= 1) continue;
      const x0 = l.x0, w = l.x1 - l.x0, sz = l.size; c.save(); c.globalAlpha *= 1 - q; c.fillStyle = dc;
      if (fx.deco === 'underline') { const th = Math.max(3, sz * 0.07); c.fillRect(x0, l.base + sz * 0.12, w * p, th); }
      else if (fx.deco === 'strike') { const th = Math.max(3, sz * 0.07); c.fillRect(x0 - sz * 0.05, l.base - l.m.cap * 0.42 - th / 2, (w + sz * 0.1) * p, th); }
      else if (fx.deco === 'marker') { const pad = sz * 0.14; c.beginPath(); c.moveTo(x0 - pad, l.base - l.m.cap * 0.62); c.lineTo(x0 - pad + (w + pad * 2) * p, l.base - l.m.cap * 0.7); c.lineTo(x0 - pad + (w + pad * 2) * p, l.base + sz * 0.16); c.lineTo(x0 - pad, l.base + sz * 0.2); c.closePath(); c.fill(); }
      else if (fx.deco === 'pill') { const padX = sz * 0.34, padY = sz * 0.22, top = l.base - l.m.cap - padY, h = l.m.cap + padY * 2 + sz * 0.06; c.beginPath(); const ww = (w + padX * 2) * E.outBack(clamp(p)); c.roundRect(x0 + w / 2 - ww / 2, top, ww, h, h / 2); c.fill(); }
      c.restore();
    }
  }
  function caretDraw(Lay, SIN, gIn, lt, inEnd, sty) {
    if (lt > inEnd + 1.6) return; let last = null; for (const g of Lay.G) if (SIN[gIn.get(g)].raw > 0) last = g;
    const on = Math.floor(lt * 2.4) % 2 === 0 || lt < inEnd; if (!on) return; const g = last || Lay.G[0], x = last ? g.x + g.w + g.size * 0.06 : g.x;
    ctx.save(); ctx.fillStyle = sty.face; ctx.fillRect(x, g.y - g.m.cap * 1.05, Math.max(3, g.size * 0.07), g.m.cap * 1.25); ctx.restore();
  }
  function kinetic(L, Lay, lt, delay, inD, sty, amt) {   // words alone, one by one, then the full layout takes over
    const words = []; let cur = -1; for (const g of Lay.G) { if (g.wi !== cur) { words.push([]); cur = g.wi; } words[words.length - 1].push(g.ch); }
    const n = words.length, slot = clamp(+(L.anim && L.anim.inD) || 0.42, 0.15, 1.2), end = delay + n * slot;
    if (lt < delay || lt >= end) return end;
    const k = Math.min(n - 1, Math.floor((lt - delay) / slot)), u = (lt - delay - k * slot) / slot, w = words[k].join('');
    const fo = Lay.fo, maxW = clamp(+L.w || 900, 200, 1000), s0 = Math.min(Lay.size * 1.9, fitSize(w, fo.wt, maxW, Lay.size * 2.2, fo.fam, 0, fo.it));
    const c = ctx; c.save(); const pk = E.outExpo(clamp(u / 0.5)), s = 1 + (1 - pk) * 0.6 * amt; c.rotate((k % 2 ? 1 : -1) * 0.04 * (1 - pk)); c.scale(s, s);
    c.font = F(fo.wt, s0, fo.fam, fo.it); c.letterSpacing = '0px'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; const m = metrics(c.font);
    c.globalAlpha *= clamp(u * 8) * (1 - clamp((u - 0.88) / 0.12) * 0.6);
    if (sty.shadowType === 'soft' || sty.shadowType === 'drop') { c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = s0 * 0.2; c.shadowOffsetY = s0 * 0.04; }
    c.fillStyle = sty.fx.fill === 'gradient' || sty.fx.fill === 'gold' || sty.fx.fill === 'chrome' ? (sty.fx.fill === 'gold' ? '#F3C35A' : sty.fx.fill === 'chrome' ? '#DDE3EA' : col(sty.fx.col2 || 'accent2')) : sty.face;
    if (sty.fx.fill === 'outline' || sty.fx.fill === 'neon') { c.lineWidth = Math.max(2, s0 * 0.035); c.strokeStyle = sty.face; if (sty.fx.fill === 'neon') { c.shadowColor = sty.face; c.shadowBlur = s0 * 0.4; } c.strokeText(w, 0, m.cap / 2); }
    else c.fillText(w, 0, m.cap / 2);
    c.restore(); return end;
  }
  // the layer's local box (for selection, masks and the editor's handles), at rest
  function box(L) { if (L.cap) return capBox(L); const Lay = layout(L, 0), b = Lay.box.slice(), fx = L.fx || {}, pad = fx.deco === 'box' || fx.deco === 'pill' ? Lay.size * 0.35 : fx.extrude ? Math.min(+fx.extrude, Lay.size * 0.5) : 0;
    return [b[0] - pad, b[1] - pad * 0.6, b[2] + pad * 2, b[3] + pad * 1.4]; }
  // how long the entrance takes (for the editor's timing hints and auto exit)
  function inEndOf(L) { if (L.cap) return 0.3; const A = L.anim || {}, P = IN[A.in] || IN.rise; const Lay = layout(L, 0), by = A.by && A.by !== 'auto' && P.by !== 'all' ? A.by : P.by, n = unitsOf(Lay, by).length;
    if (P.special === 'kinetic') return (+A.inDelay || 0) + Lay.nW * clamp(+A.inD || 0.42, 0.15, 1.2) + 0.35;
    return (+A.inDelay || 0) + (+A.inD || P.d) + (+A.stagger >= 0 ? +A.stagger : P.st) * Math.max(0, n - 1); }

  // ------------------------------------------------------------------ text style presets (the gallery). Fonts are brand slots, so the
  // same preset looks different for every business; any library font can replace them in the inspector.
  const STYLES = [
    { id: 'bold', name: 'Big & bold', cat: 'Headline', text: 'MAKE IT\nUNMISSABLE', L: { slot: 'Mont', wt: 900, size: 132, track: -20, lead: 0.98, color: 'white', fx: { shadow: 'soft' }, anim: { in: 'punch', out: 'shrink' } } },
    { id: 'stacked', name: 'Stacked poster', cat: 'Headline', text: 'FRESH OUT OF THE OVEN', L: { slot: 'Bebas', size: 150, layout: 'stack', w: 860, lead: 0.92, color: 'white', fx: { shadow: 'soft' }, anim: { in: 'splitc', out: 'drop' } } },
    { id: 'kinetic', name: 'Kinetic words', cat: 'Kinetic', text: 'WATCH THIS ONE', L: { slot: 'Mont', wt: 900, size: 120, color: 'white', fx: { shadow: 'soft' }, anim: { in: 'kinetic', inD: 0.36, out: 'grow' } } },
    { id: 'chrome', name: 'Chrome title', cat: 'Effects', text: 'SHOWROOM', L: { slot: 'Bebas', size: 270, track: 30, fx: { fill: 'chrome', extrude: 10, ecol: '#2B3138', shadow: 'soft' }, anim: { in: 'flip', out: 'fade', loop: 'shimmer' } } },
    { id: 'gold', name: 'Gold luxe', cat: 'Effects', text: 'The Estate', L: { slot: 'Corm', wt: 600, ital: true, size: 196, fx: { fill: 'gold', shadow: 'soft', sweep: true }, anim: { in: 'tracking', out: 'blur' } } },
    { id: 'neon', name: 'Neon sign', cat: 'Effects', text: 'cheers', L: { slot: 'Hand', wt: 700, size: 220, color: 'accent', fx: { fill: 'neon', glow: 1 }, anim: { in: 'glitch', out: 'fade', loop: 'flicker' } } },
    { id: 'retro', name: 'Retro layered', cat: 'Effects', text: 'GOOD TIMES', L: { slot: 'Bebas', size: 230, color: 'white', fx: { shadow: 'layered' }, anim: { in: 'cascade', out: 'apart' } } },
    { id: 'extrude', name: '3D extrude', cat: 'Effects', text: 'BIG NEWS', L: { slot: 'Mont', wt: 900, size: 170, color: 'accent', fx: { extrude: 34, shadow: 'soft' }, anim: { in: 'bounce', out: 'drop', loop: 'float' } } },
    { id: 'drawon', name: 'Outline draw-on', cat: 'Effects', text: 'HANDCRAFTED', L: { slot: 'Mont', wt: 900, size: 140, color: 'white', fx: { fill: 'solid' }, anim: { in: 'outline', out: 'fade' } } },
    { id: 'gradient', name: 'Gradient pop', cat: 'Effects', text: 'SUMMER DROP', L: { slot: 'Mont', wt: 900, size: 140, color: 'accent', fx: { fill: 'gradient', col2: 'accent2', ang: 90, animG: true, shadow: 'soft' }, anim: { in: 'pop', out: 'grow' } } },
    { id: 'typed', name: 'Typewriter note', cat: 'Text', text: 'type your message here', L: { slot: 'Mono', wt: 700, size: 74, color: 'white', fx: { deco: 'marker', dcol: 'ink' }, anim: { in: 'typewriter', out: 'backspace' } } },
    { id: 'glitch', name: 'Glitch cut', cat: 'Kinetic', text: 'SYSTEM\nUPGRADE', L: { slot: 'Mono', wt: 800, size: 130, color: 'white', fx: { shadow: 'none' }, anim: { in: 'glitch', out: 'glitch', loop: 'glitch' } } },
    { id: 'editorial', name: 'Editorial serif', cat: 'Elegant', text: 'Quietly beautiful.', L: { slot: 'Corm', wt: 600, ital: true, size: 132, color: 'white', fx: { deco: 'underline', dcol: 'accent', shadow: 'soft' }, anim: { in: 'wipe', out: 'wipe' } } },
    { id: 'marker', name: 'Marker highlight', cat: 'Text', text: 'BOOK THIS\nWEEK', L: { slot: 'Mont', wt: 900, size: 124, color: 'ink', fx: { deco: 'marker', dcol: 'accent' }, anim: { in: 'wordup', out: 'sink' } } },
    { id: 'caption', name: 'Caption pill', cat: 'Text', text: 'Watch it come together', L: { slot: 'Mont', wt: 800, size: 58, color: 'ink', w: 900, fx: { deco: 'pill', dcol: 'white' }, anim: { in: 'words', out: 'fade' } } },
    { id: 'footage', name: 'Footage in text', cat: 'Effects', text: 'FRESH', L: { slot: 'Bebas', size: 380, color: 'white', fx: { fill: 'footage', stroke: 3, scol: 'white' }, anim: { in: 'zoom', out: 'grow' } } },
    { id: 'arc', name: 'Curved badge', cat: 'Shapes', text: 'WELCOME IN • WELCOME IN •', L: { slot: 'Mont', wt: 800, size: 54, track: 160, layout: 'arc', arc: 170, color: 'white', fx: { shadow: 'soft' }, anim: { in: 'letters', out: 'fade', loop: 'swing' } } },
    { id: 'wavy', name: 'Wavy fun', cat: 'Kinetic', text: 'treat yourself', L: { slot: 'Hand', wt: 700, size: 150, color: 'accent', layout: 'wave', fx: { shadow: 'hard', shcol: 'ink' }, anim: { in: 'wave', out: 'drop', loop: 'wave' } } },
    { id: 'cinema', name: 'Cinematic tracking', cat: 'Elegant', text: 'A NEW CHAPTER', L: { slot: 'Mont', wt: 500, size: 60, track: 300, color: 'white', fx: { glow: 0.35 }, anim: { in: 'tracking', inD: 1.6, out: 'tracking' } } },
    { id: 'script', name: 'Signature script', cat: 'Elegant', text: 'with love', L: { slot: 'Hand', wt: 700, size: 160, color: 'white', fx: { shadow: 'soft' }, anim: { in: 'letters', stagger: 0.06, out: 'fade' } } },
    { id: 'price', name: 'Price slam', cat: 'Headline', text: '$14.99', addText: 'YOUR PRICE', L: { slot: 'Mont', wt: 900, size: 230, track: -30, color: 'accent', fx: { shadow: 'hard', shcol: 'ink', stroke: 6, scol: 'ink' }, anim: { in: 'punch', out: 'shrink', loop: 'pulse' } } },
    { id: 'vertical', name: 'Vertical tag', cat: 'Shapes', text: 'WOW', L: { slot: 'Bebas', size: 250, lead: 0.86, layout: 'vertical', color: 'accent', fx: { shadow: 'soft' }, anim: { in: 'charup', out: 'wipe' } } },
    { id: 'glass', name: 'Frosted glass', cat: 'Effects', text: 'CLEAR VIEW', L: { slot: 'Mont', wt: 900, size: 150, color: 'white', fx: { fill: 'glass', shadow: 'soft' }, anim: { in: 'blur', out: 'blur' } } },
    { id: 'duo', name: 'Duotone split', cat: 'Effects', text: 'HALF\n& HALF', L: { slot: 'Bebas', size: 200, color: 'white', fx: { fill: 'duo', col2: 'accent' }, anim: { in: 'halves', out: 'slide' } } },
    { id: 'elastic', name: 'Elastic stretch', cat: 'Kinetic', text: 'STRETCH IT', L: { slot: 'Mont', wt: 900, size: 130, color: 'white', fx: { shadow: 'drop' }, anim: { in: 'elastic', out: 'shrink' } } },
    { id: 'spin', name: 'Spin words', cat: 'Kinetic', text: 'TURN IT UP', L: { slot: 'Mont', wt: 900, size: 128, color: 'white', fx: { shadow: 'soft' }, anim: { in: 'spin', out: 'flip' } } },
    { id: 'liquid', name: 'Liquid rise', cat: 'Elegant', text: 'POUR IT ON', L: { slot: 'Bebas', size: 170, color: 'white', fx: { shadow: 'soft' }, anim: { in: 'liquid', out: 'sink' } } },
    { id: 'blurfocus', name: 'Blur to focus', cat: 'Elegant', text: 'In focus.', L: { slot: 'Corm', wt: 600, size: 130, color: 'white', fx: { shadow: 'soft' }, anim: { in: 'blur', out: 'dissolve' } } },
  ];
  // motion presets: keyframes generated from the layer's current place (Motion tab). gen(L, d) -> kf
  const MOTIONS = [
    ['none', 'No motion', () => ({})],
    ['driftup', 'Drift up', (L, d) => ({ y: [{ t: 0, v: L.y + 36, e: 'linear' }, { t: d, v: L.y - 36 }] })],
    ['driftside', 'Drift across', (L, d) => ({ x: [{ t: 0, v: L.x - 40, e: 'linear' }, { t: d, v: L.x + 40 }] })],
    ['pushin', 'Slow push in', (L, d) => ({ sx: [{ t: 0, v: 1, e: 'soft' }, { t: d, v: 1.14 }], sy: [{ t: 0, v: 1, e: 'soft' }, { t: d, v: 1.14 }] })],
    ['pullout', 'Slow pull out', (L, d) => ({ sx: [{ t: 0, v: 1.16, e: 'soft' }, { t: d, v: 1 }], sy: [{ t: 0, v: 1.16, e: 'soft' }, { t: d, v: 1 }] })],
    ['popsettle', 'Pop and settle', (L, d) => ({ sx: [{ t: 0, v: 0.2, e: 'back' }, { t: Math.min(0.45, d), v: 1 }], sy: [{ t: 0, v: 0.2, e: 'back' }, { t: Math.min(0.45, d), v: 1 }], op: [{ t: 0, v: 0, e: 'out' }, { t: Math.min(0.15, d), v: 1 }] })],
    ['spinin', 'Spin in', (L, d) => ({ rot: [{ t: 0, v: -200, e: 'back' }, { t: Math.min(0.7, d), v: 0 }], sx: [{ t: 0, v: 0.3, e: 'back' }, { t: Math.min(0.7, d), v: 1 }], sy: [{ t: 0, v: 0.3, e: 'back' }, { t: Math.min(0.7, d), v: 1 }] })],
    ['flyleft', 'Fly in from the left', (L, d) => ({ x: [{ t: 0, v: L.x - 1000, e: 'snap' }, { t: Math.min(0.6, d), v: L.x }] })],
    ['flyright', 'Fly in from the right', (L, d) => ({ x: [{ t: 0, v: L.x + 1000, e: 'snap' }, { t: Math.min(0.6, d), v: L.x }] })],
    ['flyup', 'Fly in from below', (L, d) => ({ y: [{ t: 0, v: L.y + 1100, e: 'snap' }, { t: Math.min(0.65, d), v: L.y }] })],
    ['exitright', 'Fly out right', (L, d) => ({ x: [{ t: Math.max(0, d - 0.55), v: L.x, e: 'in' }, { t: d, v: L.x + 1100 }] })],
    ['swing', 'Swing', (L, d) => { const ks = []; for (let t = 0, i = 0; t <= d + 1e-6; t += 0.8, i++) ks.push({ t: Math.min(t, d), v: i % 2 ? 7 : -7, e: 'soft' }); return { rot: ks }; }],
    ['float', 'Float', (L, d) => { const ks = []; for (let t = 0, i = 0; t <= d + 1e-6; t += 1.1, i++) ks.push({ t: Math.min(t, d), v: L.y + (i % 2 ? -18 : 18), e: 'soft' }); return { y: ks }; }],
    ['heartbeat', 'Heartbeat', (L, d) => { const ks = []; for (let t = 0; t < d; t += 1.0) [[0, 1], [0.12, 1.12], [0.24, 1], [0.36, 1.08], [0.5, 1]].forEach(([o, v]) => { if (t + o <= d) ks.push({ t: t + o, v, e: 'soft' }); }); return { sx: ks, sy: ks.map(k => Object.assign({}, k)) }; }],
    ['shake', 'Shake', (L, d) => { const ks = []; const n = Math.min(10, Math.floor(Math.min(0.7, d) / 0.07)); for (let i = 0; i <= n; i++) ks.push({ t: i * 0.07, v: L.x + (i === n ? 0 : (i % 2 ? 1 : -1) * 22 * (1 - i / n)), e: 'linear' }); return { x: ks }; }],
    ['zoomthrough', 'Zoom through', (L, d) => ({ sx: [{ t: Math.max(0, d - 0.5), v: 1, e: 'in' }, { t: d, v: 4 }], sy: [{ t: Math.max(0, d - 0.5), v: 1, e: 'in' }, { t: d, v: 4 }], op: [{ t: Math.max(0, d - 0.25), v: 1, e: 'in' }, { t: d, v: 0 }] })],
    ['focus', 'Blur in', (L, d) => ({ blur: [{ t: 0, v: 24, e: 'out' }, { t: Math.min(0.7, d), v: 0 }], op: [{ t: 0, v: 0, e: 'out' }, { t: Math.min(0.4, d), v: 1 }] })],
    ['reveal', 'Wipe reveal', (L, d) => ({ mask: [{ t: 0, v: 0, e: 'smooth' }, { t: Math.min(0.8, d), v: 1 }] })],
  ];
  return { EASES, addEase, ease, bezier, col, mix, rgba, lum, onCol, val, xf, hasKf, plain, KF_PROPS, blurred, withLayer, legacy, layout, unitsOf, type, box, inEndOf, metrics, fontOf,
    IN, OUT, LOOP, FILLS, SHADOWS, DECOS, LAYOUTS, STYLES, MOTIONS, DIRV, lmod, TAU, CAP_MODES, capPlan };
})();
