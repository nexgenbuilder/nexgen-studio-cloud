'use strict';
/* Free edit: what the Clip Studio's timeline editor renders. PRM.tl describes the edit:
     main:   the magnetic main track, played in order. Items:
             {type:'clip', c, in, d, layout:'fit'|'blur'|'fill', pos:'center'|'upper'|'lower', tr:{type, d}}
             {type:'card', d, bg:'ink'|'accent'|'paper'|'kinetic'|'grunge'|'grid'|'gradient', tr}
             {type:'tpl', tpl:'<template id>', text:{}, shot:{}, d, tr}   a whole template, nested, with its own look
             {type:'end', style:'kinetic'|'grunge'|'blueprint'|'editorial', tag, d, tr}   the brand's ending
     layers: overlays placed in time, drawn in order: {kind:'text'|'sticker'|'pip', t0, d, x, y, ...}
     split screen (V17): section layers {kind:'seg', c, in, t0, d, fit:'fill'|'blur'|'fit', fx, fy, z, card} play in the other
             half of the screen while they're on; the main track fills its own section (TL.split: ratio, main, line, lc, open,
             mfit, mfx, mfy, mz). Between section layers the main track fills the frame again.
   Footage is never cropped or zoomed by default: 'fit' shows a clip whole, 'blur' adds a blurred copy behind it, and only
   'fill' (an explicit choice in the editor) covers the frame. tr is the transition INTO an item.
   V19 (kit13), all off unless the edit asks: a clip may carry sp (speed 0.25..4), ramp ('in' | 'out' | 'hero' | 'land'),
   cam ({type, amt}: a virtual camera move) and grade ({id, amt}); TL.grade grades every clip that has none of its own,
   TL.mblur / L.mblur give moving layers real motion blur, TL.glow blooms the finished frame. */
STUDIO_REG['free'] = (() => {
  const TL = PRM.tl && typeof PRM.tl === 'object' ? PRM.tl : { main: [], layers: [] };
  const TPLS = (window.NX && NX.TPLS) || [];
  const COLS = { white: () => WHT, accent: () => OR, ink: () => BLK, paper: () => PAPER };
  const col = k => (COLS[k] || COLS.white)();
  const lum = h => { const n = parseInt(String(h).slice(1, 7), 16), f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(n >> 16 & 255) + 0.7152 * f(n >> 8 & 255) + 0.0722 * f(n & 255); };
  const onAcc = () => (lum(OR) > 0.36 ? BLK : WHT);
  const DEF_FIN = { vig: 0.22, grain: 0.18 };

  // ---------------- nested templates ----------------
  const BLOCKS = {};
  function nest(it) {
    const T = TPLS.find(x => x.id === it.tpl); if (!T || T.id === 'free' || !STUDIO_REG[T.file]) return null;
    const keep = { v: QS.get('v'), text: PRM.text, shot: PRM.shot, tl: PRM.tl, dir: DIR, fl: FIELDS.length };
    try {
      QS.set('v', T.v);
      const pack = window.NX && NX.app ? NX.app.packCopy(T.id, NX.app.B()) : {};
      PRM.text = Object.assign({}, pack, it.text || {}); PRM.shot = it.shot || {}; PRM.tl = null;
      window.__NX_BLOCK_EL = it.el || null;   // per-element data for this block; the template captures it at build time (null = old behaviour)
      STUDIO_REG[T.file]();
      window.__NX_BLOCK_EL = null;
      const fields = FIELDS.slice(keep.fl);
      if (window.NX && NX.phLabels) for (const f of fields) if (f.type === 'shot' && NX.isPh(f.def[0])) NX.phLabels[f.def[0]] = /^(footage|shot)$/i.test(f.label || '') ? f.group : f.label;
      return { dir: DIR, fields, tpl: T, pack };
    } catch (e) { console.warn('block', it.tpl, e); return null; }
    finally { window.__NX_BLOCK_EL = null; if (keep.v === null) QS.delete('v'); else QS.set('v', keep.v); PRM.text = keep.text; PRM.shot = keep.shot; PRM.tl = keep.tl; DIR = keep.dir; FIELDS.length = keep.fl; }
  }

  // ---------------- main track layout ----------------
  const M = []; let s = 0; const shakes = [];
  for (const raw of (Array.isArray(TL.main) ? TL.main : [])) {
    const it = Object.assign({}, raw);
    if (it.type === 'tpl') {
      const b = nest(it); if (!b) { it.type = 'card'; it.bg = 'ink'; it.broken = true; }
      else { it.dir = b.dir; BLOCKS[it.id] = b; it.d = Math.min(+it.d || b.dir.dur, b.dir.dur); (b.dir.shakes || []).forEach(([t0, a]) => { if (t0 < it.d) shakes.push([s + t0, a]); }); }
    }
    if (it.type === 'clip') { const m = VID.meta(it.c); it.missing = !m; it.in = Math.max(0, +it.in || 0); if (m) it.d = Math.min(+it.d || 3, Math.max(0.2, K13.maxLen(it, m.n / 30 - it.in))); }
    it.d = Math.max(0.2, +it.d || 2);
    if (it.tr && it.tr.type && it.tr.type !== 'cut') it.tr = Object.assign({}, it.tr, { d: clamp(+it.tr.d || 0.5, 0.15, 2) }); else it.tr = null;
    it.start = s; s += it.d; M.push(it);
  }
  // a transition can't be longer than either side allows
  M.forEach((it, i) => { if (it.tr) { if (i === 0) it.tr = null; else it.tr.d = Math.min(it.tr.d, it.d * 0.9, M[i - 1].d * 0.9); } });
  const LAY = (Array.isArray(TL.layers) ? TL.layers : []).filter(L => L && L.d > 0).map(L => Object.assign({}, L));
  const DUR = Math.max(0.5, M.length ? s : Math.max(3, ...LAY.map(L => L.t0 + L.d)));

  // ---------------- element motion, sync groups, in/out transitions ----------------
  // Motion is keyframes on an item, evaluated by K8.xf. A layer's own motion lives in L.kf; a main-track item's in
  // it.motion.kf. Motion SYNC: tl.motionGroups = [{id, name, base:{x,y}, kf}] — an item with mgroup set plays the group's
  // keyframes instead of its own. The group's x/y keys are absolute positions for an element sitting at group.base, so
  // each member shifts them by (its own base - group.base): a row of elements drifts together, each from where it is.
  // Scale, rotation, opacity and blur are shared absolutely. The editor (js/nx-motion.js) keeps the same convention.
  const motionGroups = () => (Array.isArray(TL.motionGroups) ? TL.motionGroups : []);
  const groupOf = id => motionGroups().find(g => g && g.id === id) || null;
  function effKf(item, base) {   // the keyframes an item actually plays: its group's (shifted to its base) or its own
    const own = item.kf || (item.motion && item.motion.kf) || null;
    const g = item.mgroup ? groupOf(item.mgroup) : null;
    if (!g || !g.kf) return own;
    const bx = +base.x || 540, by = +base.y || 960, gx = +(g.base && g.base.x) || 540, gy = +(g.base && g.base.y) || 960;
    const out = {};
    for (const [p, ks] of Object.entries(g.kf)) {
      if (!Array.isArray(ks)) continue;
      if (p === 'x') out[p] = ks.map(k => Object.assign({}, k, { v: k.v + (bx - gx) }));
      else if (p === 'y') out[p] = ks.map(k => Object.assign({}, k, { v: k.v + (by - gy) }));
      else out[p] = ks;
    }
    return out;
  }
  // a layer's full state at local time lt: group-resolved keyframes, then its in/out transition folded in (see ioState)
  function layerStateAt(L, lt, io) {
    if (io === undefined) io = ioState(L, lt);
    const s = K8.xf({ x: L.x, y: L.y, sx: L.sx, sy: L.sy, rot: L.rot, opacity: L.opacity, blur: L.blur, kf: effKf(L, { x: +L.x || 540, y: +L.y || 960 }) }, lt);
    if (io) { s.x += io.dx; s.y += io.dy; s.sx *= io.sc; s.sy *= io.sc; s.op = clamp(s.op * io.op); if (io.rot) s.rot += io.rot; if (io.blur) s.blur = (s.blur || 0) + io.blur; if (io.mask !== undefined) s.mask = io.mask; }
    return s;
  }
  // a main-track item's motion at local time lt: {dx, dy, sx, sy, rot, op}, or null when it sits still. The base is always
  // the frame centre (540, 960); blur and mask keyframes don't move a whole scene, so presets that use them keep only
  // their position/scale/rotation/opacity here.
  function itemMotion(it, lt) {
    const kf = effKf(it, { x: 540, y: 960 });
    if (!kf || !Object.keys(kf).length) return null;
    const s = K8.xf({ x: 540, y: 960, kf }, lt);
    if (Math.abs(s.x - 540) < 1e-3 && Math.abs(s.y - 960) < 1e-3 && Math.abs(s.sx - 1) < 1e-4 && Math.abs(s.sy - 1) < 1e-4 && Math.abs(s.rot) < 1e-5 && Math.abs(s.op - 1) < 1e-3) return null;
    return { dx: s.x - 540, dy: s.y - 960, sx: s.sx, sy: s.sy, rot: s.rot, op: s.op };
  }
  // in/out transitions on a layer: L.tin / L.tout = {type:'fade'|'slide'|'wipe'|'zoom'|'blur'|'spin', d, dir, amt}. Folded into
  // the layer's state (position, scale, rotation, opacity, blur, mask reveal) so they ride the same path as motion —
  // preview and export identical. Slide in comes FROM dir; slide out goes TOWARDS dir; wipe reveals from dir in, and
  // leaves towards dir out. amt scales the slide distance / spin amount (a gentle rise is a short slide from below).
  const IO_DIRS = { left: [-1, 0], right: [1, 0], top: [0, -1], bottom: [0, 1] };
  function ioState(L, lt) {
    const tin = L.tin, tout = L.tout;
    if ((!tin || !tin.type || tin.type === 'none') && (!tout || !tout.type || tout.type === 'none')) return null;
    let dx = 0, dy = 0, sc = 1, op = 1, rot = 0, blur = 0, mask, maskDir;
    const SLIDE = 700;
    if (tin && tin.type && tin.type !== 'none') {
      const d = clamp(+(tin.d || 0.5), 0.1, 2), u = clamp(lt / d, 0, 1), amt = clamp(+(tin.amt || 1), 0.1, 1.5);
      if (u < 1) {
        if (tin.type === 'fade') op *= u;
        else if (tin.type === 'slide') { const [sx, sy] = IO_DIRS[tin.dir] || IO_DIRS.left; const k = (1 - E.outC(u)) * SLIDE * amt; dx += sx * k; dy += sy * k; op *= clamp(u * 1.5); }
        else if (tin.type === 'zoom') { sc *= 0.75 + 0.25 * E.outC(u); op *= u; }
        else if (tin.type === 'wipe') { mask = E.outC(u); maskDir = tin.dir || 'left'; }
        else if (tin.type === 'blur') { blur += (1 - E.outC(u)) * 24; op *= u; }
        else if (tin.type === 'spin') { rot += (1 - E.outBack(u)) * (-200 * Math.PI / 180) * amt; op *= clamp(u * 1.5); }
      }
    }
    if (tout && tout.type && tout.type !== 'none') {
      const d = clamp(+(tout.d || 0.4), 0.1, 2), v = clamp((lt - (L.d - d)) / d, 0, 1), amt = clamp(+(tout.amt || 1), 0.1, 1.5);
      if (v > 0) {
        if (tout.type === 'fade') op *= (1 - v);
        else if (tout.type === 'slide') { const [sx, sy] = IO_DIRS[tout.dir] || IO_DIRS.right; const k = E.inC(v) * SLIDE * amt; dx += sx * k; dy += sy * k; op *= clamp((1 - v) * 1.5); }
        else if (tout.type === 'zoom') { sc *= 1 + 0.25 * E.inC(v); op *= (1 - v); }
        else if (tout.type === 'wipe') { mask = 1 - E.inC(v); maskDir = tout.dir || 'right'; }
        else if (tout.type === 'blur') { blur += E.inC(v) * 24; op *= (1 - v); }
        else if (tout.type === 'spin') { rot += E.inC(v) * (200 * Math.PI / 180) * amt; op *= clamp((1 - v) * 1.5); }
      }
    }
    if (dx === 0 && dy === 0 && sc === 1 && op === 1 && rot === 0 && blur === 0 && mask === undefined) return null;
    return { dx, dy, sc, op, rot, blur, mask, maskDir };
  }

  // ---------------- split screen ----------------
  // ratio: the top section's share of the height; main: the section the main track fills ('bottom' puts the section layers on
  // top, the talking-head layout); line: 'none' | 'line' | 'bar' | 'gap' (inset panels with rounded corners on a colour);
  // open: 'slide' (the split opens and closes over 0.4 s) | 'cut'; mfit / mfx / mfy / mz: how the main track sits in its section.
  const SPL = Object.assign({ ratio: 0.5, main: 'bottom', line: 'none', lc: 'accent', open: 'slide', mfit: 'fill', mfx: 0.5, mfy: 0.5, mz: 1 }, TL.split && typeof TL.split === 'object' ? TL.split : {});
  const SEG = LAY.filter(L => L.kind === 'seg').sort((a, b) => a.t0 - b.t0), RUNS = [];
  for (const L of SEG) { const a = L.t0, b = L.t0 + L.d, last = RUNS[RUNS.length - 1]; if (last && a <= last[1] + 0.05) last[1] = Math.max(last[1], b); else RUNS.push([a, b]); }
  function splitK(t) {
    for (const [a, b] of RUNS) if (t >= a - 1e-6 && t < b) {
      if (SPL.open === 'cut') return 1;
      const kin = a <= 0.05 ? 1 : E.inOutC(clamp((t - a) / 0.4)), kout = b >= DUR - 0.05 ? 1 : E.inOutC(clamp((b - t) / 0.4));
      return Math.min(kin, kout);
    }
    return 0;
  }
  function splitRects(k) {   // the main track's rect, the section's rect and the seam's y, at split amount k (0 = no split)
    const r = clamp(+SPL.ratio || 0.5, 0.2, 0.8), secTop = SPL.main !== 'top', share = secTop ? r : 1 - r, g = SPL.line === 'gap' ? 24 * k : 0;
    const secH = Math.round((H - 3 * g) * share * k), mainH = H - 3 * g - secH, x = g, w = W - 2 * g;
    return secTop ? { sec: [x, g, w, secH], main: [x, 2 * g + secH, w, mainH], seam: g + secH + g / 2, secTop }
      : { main: [x, g, w, mainH], sec: [x, 2 * g + mainH, w, secH], seam: g + mainH + g / 2, secTop };
  }
  const lineCol = () => col(SPL.lc === 'white' || SPL.lc === 'ink' || SPL.lc === 'paper' ? SPL.lc : 'accent');
  const roundPath = (R, rad) => () => { ctx.beginPath(); ctx.roundRect(R[0], R[1], R[2], R[3], rad); };
  function blurIn(c, ts, R) {   // a soft, darkened copy of the clip behind a whole-frame section
    const m = VID.meta(c); if (!m) return; const img = VID.get(c, VID.idx(c, ts), 'h'); if (!img || VID.collecting) return;
    const a = scratch('sgA', 160, 160), b = scratch('sgB', 24, 24), kb = img._k || 1, S0 = Math.max(R[2] / m.hw, R[3] / m.hh) * 1.08, vw = R[2] / S0, vh = R[3] / S0;
    a.g.drawImage(img, (m.hw - vw) / 2 * kb, (m.hh - vh) / 2 * kb, vw * kb, vh * kb, 0, 0, 160, 160); b.g.drawImage(a, 0, 0, 24, 24);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(b, R[0], R[1], R[2], R[3]); ctx.fillStyle = 'rgba(8,7,6,0.38)'; ctx.fillRect(R[0], R[1], R[2], R[3]); ctx.restore();
  }
  const segFill = L => L.fit || 'fill';
  // V19: the clip being drawn may carry a grade, a camera move and a speed change (kit13); CX holds them while it draws
  let CX = null;
  function fsrc(c, ts, o) {
    const X = CX; if (!X) return footageSrc(c, ts, o);
    if (X.g && X.g.filter && !o.filter) o.filter = X.g.filter;
    if (X.blend) o.blend = true;
    if (X.cam) K13.camOpts(o, X.cam);
    return footageSrc(c, ts, o);
  }
  // photos, depth push: the middle of the picture is drawn again a little larger through a soft round mask
  function depthPass(c, ts, o, R, dz) {
    if (VID.collecting) { fsrc(c, ts, Object.assign({}, o)); return; }
    const sc = K4.into('k13dp', () => fsrc(c, ts, Object.assign({}, o, { z: (o.z || 1) * (1 + dz), clip: undefined }))), g = sc.g, cx = R[0] + R[2] / 2, cy = R[1] + R[3] / 2, rad = Math.max(R[2], R[3]);
    const gr = g.createRadialGradient(cx, cy, rad * 0.16, cx, cy, rad * 0.5); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'destination-in'; g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); ctx.rect(R[0], R[1], R[2], R[3]); ctx.clip(); ctx.drawImage(sc, 0, 0); ctx.restore();
  }
  let MAINR = null;   // while the screen is split: the main track's rect (clips draw straight into it)
  function drawInto(c, ts, R, fit, fx, fy, z, bg) {   // footage into a rect: fill (cover, with focus and zoom) or whole (blurred or plain behind)
    const q = R[2] * R[3] <= 700 * 1000 ? 'h' : 'f', clip = () => { ctx.rect(R[0], R[1], R[2], R[3]); };
    if (fit === 'fill') { fsrc(c, ts, { rect: R, fit: 'cover', z: Math.max(1, +z || 1), cx: fx === undefined ? 0.5 : +fx, cy: fy === undefined ? 0.5 : +fy, q, clip }); if (CX) K13.wash(R, CX.g); return; }
    if (fit === 'blur') blurIn(c, ts, R); else if (!VID.collecting) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = bg === 'paper' ? PAPER : bg === 'accent' ? OR : BLK; ctx.fillRect(R[0], R[1], R[2], R[3]); ctx.restore(); }
    const wr = K3.wholeIn(c, R); fsrc(c, ts, { rect: wr, fit: 'cover', q, clip }); if (CX) K13.wash(wr, CX.g);
  }
  function drawSeg(L, t, R, round, alpha) {
    if (R[3] < 2 || R[2] < 2) return;
    const lt = t - L.t0; ctx.save(); ctx.globalAlpha *= alpha;
    if (round && !VID.collecting) { ctx.beginPath(); ctx.roundRect(R[0], R[1], R[2], R[3], 28); ctx.clip(); }
    if (!L.c || L.card) { if (!VID.collecting) { const c0 = L.card === 'paper' ? PAPER : L.card === 'ink' ? BLK : L.card === 'white' ? WHT : OR; ctx.fillStyle = c0; ctx.fillRect(R[0], R[1], R[2], R[3]); } }
    else if (!VID.meta(L.c)) { if (!VID.collecting) { ctx.fillStyle = '#1E1B18'; ctx.fillRect(R[0], R[1], R[2], R[3]); caps('FOOTAGE REMOVED', R[0] + R[2] / 2, R[1] + R[3] / 2, 34, 1, 0, { col: 'rgba(255,255,255,0.6)', fam: 'Mono' }); } }
    else {
      const m = VID.meta(L.c), ts = clamp((+L.in || 0) + Math.max(0, lt), 0, (m.n - 1.5) / 30);
      drawInto(L.c, ts, R, segFill(L), L.fx, L.fy, L.z, L.bg);
    }
    ctx.restore();
  }
  // ---------------- containers ----------------
  // One model for every container: a main-track item {type:'container', layout, zones}.
  // layout: 'vsplit' (top over bottom) | 'hsplit' (left beside right) | 'grid' (rows x cols of cells) | 'overlay'
  // (footage with a card on top). A zone is a slot: {kind:'clip', c, in, fit, fx, fy, z} (footage or a still image)
  // | {kind:'card', card} (a solid colour) | {kind:'graphic', bg, headline, hi, badge, label, art} (a graphic/text card,
  // like the reference's top half: headline with a highlighted part, a badge pill, a label box, a vector picture).
  // Grid scroll is a time-driven property: offset = speed * local time, wrapped so the grid never runs out of cells —
  // preview and export both read the same function of time. containerZones() exposes every zone's rect at a time, so
  // the editor (and the next chunk: element motion, transitions) can address zones by position and time.
  function containerZones(it, lt) {
    const lay = it.layout || 'vsplit', zones = Array.isArray(it.zones) ? it.zones : [];
    const at = i => zones[i] || null;
    if (lay === 'hsplit') {
      const r = clamp(+it.ratio || 0.5, 0.2, 0.8), lw = Math.round(W * r);
      return { zones: [{ key: 'left', rect: [0, 0, lw, H], slot: at(0) }, { key: 'right', rect: [lw, 0, W - lw, H], slot: at(1) }], seam: { x: lw, horiz: false } };
    }
    if (lay === 'grid') return { zones: gridCells(it, lt), seam: null };
    if (lay === 'overlay') {
      const c = at(1) || {};
      return { zones: [{ key: 'base', rect: [0, 0, W, H], slot: at(0) }, { key: 'card', rect: [clamp(+c.x || 0, 0, W - 40), clamp(+c.y || 0, 0, H - 40), clamp(+c.w || 600, 40, W), clamp(+c.h || 300, 40, H)], slot: c }], seam: null };
    }
    const r = clamp(+it.ratio || 0.5, 0.2, 0.8), th = Math.round(H * r);
    return { zones: [{ key: 'top', rect: [0, 0, W, th], slot: at(0) }, { key: 'bottom', rect: [0, th, W, H - th], slot: at(1) }], seam: { y: th, horiz: true } };
  }
  function gridCells(it, lt) {
    const zones = Array.isArray(it.zones) ? it.zones : [];
    const C = clamp(Math.round(+it.cols || 2), 1, 4), R = clamp(Math.round(+it.rows || 2), 1, 4), g = clamp(+it.gap || 0, 0, 60);
    const cw = (W - (C + 1) * g) / C, ch = (H - (R + 1) * g) / R, N = zones.length, totalRows = Math.max(1, Math.ceil(N / C));
    const sc = it.scroll && typeof it.scroll === 'object' ? it.scroll : {}, dir = sc.dir || 'off', sp = Math.max(0, +sc.speed || 0);
    const out = [];
    const cell = (r, c, x, y) => { const idx = r * C + c; out.push({ key: 'cell' + idx, cell: idx, rect: [x, y, cw, ch], slot: idx < N ? zones[idx] : null }); };
    if (dir === 'up' || dir === 'down') {
      const oy = (dir === 'up' ? -1 : 1) * sp * lt, period = totalRows * (ch + g), K = oy === 0 ? 0 : Math.ceil(H / period) + 1;
      for (let k = -K; k <= K; k++) for (let r = 0; r < totalRows; r++) { const y = g + k * period + oy + r * (ch + g); if (y >= H || y + ch <= 0) continue; for (let c = 0; c < C; c++) cell(r, c, g + c * (cw + g), y); }
    } else if (dir === 'left' || dir === 'right') {
      const ox = (dir === 'left' ? -1 : 1) * sp * lt, period = C * (cw + g), K = ox === 0 ? 0 : Math.ceil(W / period) + 1;
      for (let k = -K; k <= K; k++) for (let c = 0; c < C; c++) { const x = g + k * period + ox + c * (cw + g); if (x >= W || x + cw <= 0) continue; for (let r = 0; r < totalRows; r++) { const y = g + r * (ch + g); if (y >= H || y + ch <= 0) continue; cell(r, c, x, y); } }
    } else for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) cell(r, c, g + c * (cw + g), g + r * (ch + g));
    return out;
  }
  function zonePlaceholder(R, txt) {
    if (VID.collecting) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#17141F'; ctx.fillRect(R[0], R[1], R[2], R[3]);
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 2; ctx.setLineDash([12, 10]); ctx.strokeRect(R[0] + 8, R[1] + 8, R[2] - 16, R[3] - 16); ctx.setLineDash([]);
    caps(txt, R[0] + R[2] / 2, R[1] + R[3] / 2, Math.min(34, R[2] * 0.06), 1, 0, { col: 'rgba(255,255,255,0.5)', fam: 'Mono' }); ctx.restore();
  }
  // a card zone's background: solid fill, or an outline when the overlay card says so
  function cardFill(slot, R) {
    const c0 = slot.card === 'paper' ? PAPER : slot.card === 'ink' ? BLK : slot.card === 'white' ? WHT : OR;
    if (slot.frame === 'outline') { ctx.strokeStyle = c0; ctx.lineWidth = 4; rrect(R[0] + 2, R[1] + 2, R[2] - 4, R[3] - 4, 14); ctx.stroke(); return; }
    if (slot.frame === 'rounded') { ctx.fillStyle = c0; rrect(R[0], R[1], R[2], R[3], 18); ctx.fill(); return; }
    ctx.fillStyle = c0; ctx.fillRect(R[0], R[1], R[2], R[3]);
  }
  // a zone's shape, reusing the PiP frame paths (drawPip): rectangle, rounded, circle, arch. Circle is an ellipse so any
  // zone rect works; arch clamps its radius so short zones get flat shoulders instead of a broken path.
  function zoneShapePath(R, shape) {
    const [x, y, w, h] = R, cx = x + w / 2;
    ctx.beginPath();
    if (shape === 'circle') ctx.ellipse(cx, y + h / 2, w / 2, h / 2, 0, 0, 7);
    else if (shape === 'arch') { const ar = Math.min(w / 2, h / 2); ctx.moveTo(x, y + h); ctx.lineTo(x, y + ar); ctx.arc(cx, y + ar, ar, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath(); }
    else if (shape === 'round') ctx.roundRect(x, y, w, h, Math.min(28, w * 0.12, h * 0.12));
    else ctx.rect(x, y, w, h);
  }
  // grid cell cycling: a zone's `alts` rotate through over time — [zone, ...alts], each shown `cycle` seconds in turn.
  // The overlay and shape belong to the zone, not the frame showing, so they stay put while the picture cycles.
  function cycleSlot(zone, lt) {
    if (!zone || !Array.isArray(zone.alts) || !zone.alts.length) return zone;
    const seq = [zone].concat(zone.alts.filter(a => a && a.kind));
    if (seq.length < 2) return zone;
    const per = clamp(+zone.cycle || 3, 0.5, 30);
    return seq[Math.floor(Math.max(0, lt) / per) % seq.length];
  }
  // a per-cell info overlay: a label (price, dish name, property or car info) over the cell's footage, top or bottom,
  // as a chip (dark pill) or a scrim (gradient band) so it stays legible over footage.
  function drawZoneOverlay(R, ov) {
    if (VID.collecting) return;
    const txt = String(ov.text || '').trim(); if (!txt) return;
    const size = clamp(R[2] * 0.052, 20, 44), f0 = F(800, size, 'Mont');
    const s2 = Math.max(14, Math.min(size, size * (R[2] * 0.86) / Math.max(1, textW(txt.toUpperCase(), f0, 2))));
    const f2 = F(800, s2, 'Mont'), w2 = textW(txt.toUpperCase(), f2, 2);
    const pad = Math.max(16, R[2] * 0.03), top = (ov.pos || 'bottom') !== 'bottom';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if ((ov.style || 'chip') === 'scrim') {
      const bh = s2 * 2.1 + pad, y0 = top ? R[1] : R[1] + R[3] - bh;
      const g = ctx.createLinearGradient(0, y0, 0, y0 + bh);
      if (top) { g.addColorStop(0, 'rgba(0,0,0,0.78)'); g.addColorStop(1, 'rgba(0,0,0,0)'); }
      else { g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.78)'); }
      ctx.fillStyle = g; ctx.fillRect(R[0], y0, R[2], bh);
      setF(f2, 2); ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(txt.toUpperCase(), R[0] + pad * 1.2, y0 + bh / 2 + 1);
    } else {
      const bw = w2 + pad * 2.2, bh = s2 * 1.9, bx = R[0] + (R[2] - bw) / 2, by = top ? R[1] + pad : R[1] + R[3] - pad - bh;
      ctx.fillStyle = 'rgba(8,8,8,0.72)'; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, bh / 2); ctx.fill();
      setF(f2, 2); ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(txt.toUpperCase(), bx + bw / 2, by + bh / 2 + 1);
    }
    ctx.restore();
  }
  function drawZone(slot, R, lt) {
    if (R[2] < 2 || R[3] < 2) return;
    // the collect pass must see every clip a zone can show, not just the frame playing right now
    if (VID.collecting && slot && Array.isArray(slot.alts)) for (const a of slot.alts) if (a && a.kind === 'clip' && a.c && VID.meta(a.c)) footageSrc(a.c, 0, { rect: [0, 0, W, H], fit: 'cover' });
    const shape = slot && slot.shape && slot.shape !== 'rect' ? slot.shape : null;
    const live = cycleSlot(slot, lt);
    if (shape && !VID.collecting) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); zoneShapePath(R, shape); ctx.clip(); try { drawZoneInner(live, R, lt); } finally { ctx.restore(); } }
    else drawZoneInner(live, R, lt);
    const ov = slot && slot.overlay && slot.overlay.on && slot.overlay.text;
    if (ov && live && live.kind && live.kind !== 'none' && (live.kind !== 'clip' || live.c)) drawZoneOverlay(R, slot.overlay);
  }
  function drawZoneInner(slot, R, lt) {
    if (R[2] < 2 || R[3] < 2) return;
    if (!slot || !slot.kind || slot.kind === 'none') { zonePlaceholder(R, 'ADD CONTENT'); return; }
    if (slot.kind === 'card') { if (!VID.collecting) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); cardFill(slot, R); ctx.restore(); } return; }
    if (slot.kind === 'graphic') { drawGraphicCard(slot, R); return; }
    if (!slot.c) { zonePlaceholder(R, 'ADD FOOTAGE'); return; }
    const m = VID.meta(slot.c);
    if (!m) { if (!VID.collecting) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#1E1B18'; ctx.fillRect(R[0], R[1], R[2], R[3]); caps('FOOTAGE REMOVED', R[0] + R[2] / 2, R[1] + R[3] / 2, 34, 1, 0, { col: 'rgba(255,255,255,0.6)', fam: 'Mono' }); ctx.restore(); } return; }
    const lib = window.NX && NX.CLIPS && (NX.CLIPS.get(slot.c) || {}).src === 'lib';
    const ts = clamp((+slot.in || 0) + Math.max(0, lt), 0, (m.n - 1.5) / 30);
    drawInto(slot.c, ts, R, slot.fit || (lib ? 'blur' : 'fill'), slot.fx, slot.fy, slot.z, slot.bg);
  }
  // a graphic/text card inside a zone: background, badge pill, headline with a
  // highlighted part, a vector picture, and a label box at the bottom — the
  // reference's top half. Everything scales to the zone, so the same card
  // works full-width, in a grid cell, or as the overlay card.
  function drawGraphicCard(slot, R) {
    if (VID.collecting) return;
    const bg = slot.bg === 'ink' ? BLK : slot.bg === 'accent' ? OR : slot.bg === 'white' ? WHT : PAPER;
    const fg = lum(bg) > 0.36 ? BLK : WHT;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (slot.frame === 'outline') { ctx.strokeStyle = fg; ctx.lineWidth = 4; rrect(R[0] + 2, R[1] + 2, R[2] - 4, R[3] - 4, 14); ctx.stroke(); }
    else if (slot.frame === 'rounded') { ctx.fillStyle = bg; rrect(R[0], R[1], R[2], R[3], 18); ctx.fill(); }
    else { ctx.fillStyle = bg; ctx.fillRect(R[0], R[1], R[2], R[3]); }
    const pad = Math.max(18, R[2] * 0.055), cx = R[0] + R[2] / 2;
    let y = R[1] + pad;
    // a tall narrow zone (e.g. side-by-side): centre the whole composition instead of
    // pinning the label to the bottom, or the middle sits empty
    const tall = R[3] / R[2] > 1.6;
    let artBottom = 0;
    if (tall) {
      const bH = slot.badge ? clamp(R[2] * 0.042, 18, 44) * 2.1 + pad * 0.7 : 0;
      const hLines = slot.headline ? String(slot.headline).split('\n').slice(0, 2) : [];
      let hSize = hLines.length ? clamp(R[2] * 0.085, 26, 96) : 0;
      if (hLines.length) hSize = Math.min(hSize, ...hLines.map(l => fitSize(l, 900, R[2] - pad * 2, hSize, 'Mont', -1.5)));
      const hH = hLines.length ? hSize * 0.9 + (hLines.length - 1) * hSize * 1.08 + pad * 0.6 : 0;
      const lH = slot.label ? clamp(R[2] * 0.05, 20, 56) * 1.9 + pad * 0.5 : 0;
      const sMax = Math.min((R[2] - pad * 2) / 4.1, R[3] * 0.16);
      const aH = slot.art === 'house' && sMax > 24 ? sMax * 2.1 : 0;
      const total = bH + hH + aH + lH + pad * 0.5;
      if (total < R[3] - pad * 2) y = R[1] + (R[3] - total) / 2;
    }
    // badge: a dark pill with a cube glyph, top-left
    if (slot.badge) {
      const bs = clamp(R[2] * 0.042, 18, 44), bf = F(800, bs, 'Mont'), btw = textW(String(slot.badge).toUpperCase(), bf, 2.5);
      const bw = btw + bs * 3.1, bh = bs * 2.1, bx = R[0] + pad, by = y;
      ctx.fillStyle = '#22315C'; rrect(bx, by, bw, bh, bh / 2); ctx.fill();
      const s = bs * 0.42, gx = bx + bs * 0.95, gy = by + bh / 2;
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = Math.max(1.5, bs * 0.06); ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(gx, gy - s); ctx.lineTo(gx + s * 0.9, gy - s * 0.45); ctx.lineTo(gx, gy + s * 0.1); ctx.lineTo(gx - s * 0.9, gy - s * 0.45); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx - s * 0.9, gy - s * 0.45); ctx.lineTo(gx - s * 0.9, gy + s * 0.45); ctx.lineTo(gx, gy + s); ctx.lineTo(gx, gy + s * 0.1); ctx.moveTo(gx + s * 0.9, gy - s * 0.45); ctx.lineTo(gx + s * 0.9, gy + s * 0.45); ctx.lineTo(gx, gy + s); ctx.stroke();
      setF(bf, 2.5); ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(String(slot.badge).toUpperCase(), bx + bs * 1.9, by + bh / 2 + 1);
      y += bh + pad * 0.7;
    }
    // headline: one or two lines, the highlighted part in the brand colour
    const head = String(slot.headline || ''), hi = String(slot.hi || '');
    if (head.trim()) {
      const lines = head.toUpperCase().split('\n').slice(0, 2);
      let size = clamp(R[2] * 0.085, 26, 96);
      size = Math.min(size, ...lines.map(l => fitSize(l, 900, R[2] - pad * 2, size, 'Mont', -1.5)));
      const f = F(900, size, 'Mont'), lh = size * 1.08;
      ctx.textBaseline = 'alphabetic';
      lines.forEach((ln, li) => {
        const ly = y + size * 0.9 + li * lh, hiAt = hi ? ln.indexOf(hi.toUpperCase()) : -1;
        setF(f, -1.5);
        if (hiAt < 0) { ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.fillText(ln, cx, ly); return; }
        const pre = ln.slice(0, hiAt), htxt = hi.toUpperCase(), post = ln.slice(hiAt + htxt.length);
        const wPre = textW(pre, f, -1.5), wHi = textW(htxt, f, -1.5), wPost = textW(post, f, -1.5);
        let x = cx - (wPre + wHi + wPost) / 2; ctx.textAlign = 'left';
        ctx.fillStyle = fg; ctx.fillText(pre, x, ly); x += wPre;
        ctx.fillStyle = OR; ctx.fillText(htxt, x, ly); x += wHi;
        ctx.fillStyle = fg; ctx.fillText(post, x, ly);
      });
      y += size * 0.9 + (lines.length - 1) * lh + pad * 0.6;
    }
    // picture: a vector house with three people beside it, like the reference
    if (slot.art === 'house') {
      const navy = '#22315C', brown = '#7A5230';
      const labH = slot.label ? clamp(R[2] * 0.05, 20, 56) * 1.9 + pad * 0.5 : 0;
      const availH = R[1] + R[3] - pad - labH - y;
      const s = Math.min((R[2] - pad * 2) / 4.1, availH / 2.1, R[3] * 0.16);
      if (s > 24) {
        const ax = cx - s * 0.94, base = y + s * 2.1; artBottom = base;
        ctx.fillStyle = navy;
        ctx.beginPath(); ctx.moveTo(ax - s * 1.08, base - s * 1.05); ctx.lineTo(ax, base - s * 1.85); ctx.lineTo(ax + s * 1.08, base - s * 1.05); ctx.closePath(); ctx.fill();
        ctx.fillRect(ax + s * 0.55, base - s * 1.95, s * 0.22, s * 0.5);
        ctx.fillStyle = '#FBF8F1'; ctx.fillRect(ax - s * 0.85, base - s * 1.05, s * 1.7, s * 1.05);
        ctx.strokeStyle = 'rgba(34,49,92,0.3)'; ctx.lineWidth = 2; ctx.strokeRect(ax - s * 0.85, base - s * 1.05, s * 1.7, s * 1.05);
        ctx.fillStyle = navy;
        ctx.fillRect(ax - s * 0.62, base - s * 0.82, s * 0.34, s * 0.34); ctx.fillRect(ax + s * 0.28, base - s * 0.82, s * 0.34, s * 0.34);
        ctx.fillStyle = '#FBF8F1';
        ctx.fillRect(ax - s * 0.62 + s * 0.15, base - s * 0.82, s * 0.04, s * 0.34); ctx.fillRect(ax - s * 0.62, base - s * 0.82 + s * 0.15, s * 0.34, s * 0.04);
        ctx.fillRect(ax + s * 0.28 + s * 0.15, base - s * 0.82, s * 0.04, s * 0.34); ctx.fillRect(ax + s * 0.28, base - s * 0.82 + s * 0.15, s * 0.34, s * 0.04);
        ctx.fillStyle = brown; ctx.fillRect(ax - s * 0.16, base - s * 0.48, s * 0.32, s * 0.48);
        ctx.fillStyle = '#E8C86A'; ctx.beginPath(); ctx.arc(ax + s * 0.1, base - s * 0.24, s * 0.035, 0, 7); ctx.fill();
        for (let i = 0; i < 3; i++) {
          const ps = s * (1 - i * 0.16), px = ax + s * (1.5 + i * 0.62);
          ctx.fillStyle = brown;
          ctx.beginPath(); ctx.arc(px, base - ps * 0.72, ps * 0.16, 0, 7); ctx.fill();
          ctx.beginPath(); ctx.moveTo(px - ps * 0.22, base); ctx.quadraticCurveTo(px - ps * 0.2, base - ps * 0.52, px, base - ps * 0.55); ctx.quadraticCurveTo(px + ps * 0.2, base - ps * 0.52, px + ps * 0.22, base); ctx.closePath(); ctx.fill();
        }
      }
    }
    // label: a white box at the bottom
    if (slot.label) {
      const ls = clamp(R[2] * 0.05, 20, 56), lf = F(800, ls, 'Mont');
      const ltw = textW(String(slot.label).toUpperCase(), lf, 3);
      const lw = Math.min(ltw + ls * 1.8, R[2] - pad * 2), lh = ls * 1.9;
      const lx = cx - lw / 2, ly = tall ? (artBottom || y) + pad * 0.5 : R[1] + R[3] - pad - lh;
      ctx.fillStyle = '#FFFFFF'; rrect(lx, ly, lw, lh, 10); ctx.fill();
      setF(lf, 3); ctx.fillStyle = BLK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(slot.label).toUpperCase(), cx, ly + lh / 2 + ls * 0.04);
    }
    ctx.restore();
  }
  function drawContainer(it, lt) {
    const cz = containerZones(it, lt);
    for (const z of cz.zones) drawZone(z.slot, z.rect, lt);
    if (cz.seam && it.line && it.line !== 'none' && !VID.collecting) {
      const c = col(it.lc === 'white' || it.lc === 'ink' || it.lc === 'paper' ? it.lc : 'accent');
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = c;
      if (cz.seam.horiz) { const h = it.line === 'bar' ? 18 : 6; ctx.fillRect(0, cz.seam.y - h / 2, W, h); }
      else { const w = it.line === 'bar' ? 18 : 6; ctx.fillRect(cz.seam.x - w / 2, 0, w, H); }
      ctx.restore();
    }
  }
  function blitMain(sc, R, round) {   // the main track's frame, framed into its section
    if (R[3] < 2) return;
    const fit = SPL.mfit === 'fit', z = Math.max(1, +SPL.mz || 1);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingQuality = 'high';
    ctx.beginPath(); if (round) ctx.roundRect(R[0], R[1], R[2], R[3], 28); else ctx.rect(R[0], R[1], R[2], R[3]); ctx.clip();
    if (fit) {
      const b = scratch('sgM', 24, 24); b.g.drawImage(sc, 0, 0, 24, 24); ctx.drawImage(b, R[0], R[1], R[2], R[3]); ctx.fillStyle = 'rgba(8,7,6,0.42)'; ctx.fillRect(R[0], R[1], R[2], R[3]);
      const S0 = Math.min(R[2] / W, R[3] / H), dw = W * S0, dh = H * S0; ctx.drawImage(sc, R[0] + (R[2] - dw) / 2, R[1] + (R[3] - dh) / 2, dw, dh);
    } else {
      const S0 = Math.max(R[2] / W, R[3] / H) * z, vw = R[2] / S0, vh = R[3] / S0;
      const sx = clamp((SPL.mfx === undefined ? 0.5 : +SPL.mfx) * W - vw / 2, 0, W - vw), sy = clamp((SPL.mfy === undefined ? 0.5 : +SPL.mfy) * H - vh / 2, 0, H - vh);
      ctx.drawImage(sc, sx, sy, vw, vh, R[0], R[1], R[2], R[3]);
    }
    ctx.restore();
  }

  // ---------------- footage ----------------
  function blurBg(c, ts) {
    const m = VID.meta(c); if (!m) return; const img = VID.get(c, VID.idx(c, ts), 'h'); if (!img || VID.collecting) return;
    const a = scratch('fbA', 270, 480), b = scratch('fbB', 45, 80);
    const S = Math.max(a.width / m.hw, a.height / m.hh) * 1.08, vw = a.width / S, vh = a.height / S, kb = img._k || 1;
    a.g.drawImage(img, (m.hw - vw) / 2 * kb, (m.hh - vh) / 2 * kb, vw * kb, vh * kb, 0, 0, a.width, a.height); b.g.drawImage(a, 0, 0, b.width, b.height);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(b, 0, 0, W, H); ctx.fillStyle = 'rgba(8,7,6,0.38)'; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  function clipRect(c, pos) {
    const r = K3.wholeIn(c, [0, 0, W, H]), free = H - r[3];
    if (free > 2 && pos === 'upper') r[1] = free * 0.22; else if (free > 2 && pos === 'lower') r[1] = free * 0.78;
    return r;
  }
  let t0g = 0;
  function frameBg(bg, t) { if (bg === 'paper') K3.bgPaper(t); else if (bg === 'accent') fillScreen(OR); else if (bg === 'kinetic') K3.bgKinetic(t, 960, 2.5); else if (bg === 'grid') K3.bgGrid(t); else if (bg === 'gradient') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, DEEP1); g.addColorStop(0.5, BLK); g.addColorStop(1, ORA(0.3)); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = BLK; ctx.fillRect(0, 0, W, H); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
  function drawClip(it, lt) {
    if (it.missing) { if (!VID.collecting) { fillScreen('#1E1B18'); caps('FOOTAGE REMOVED', W / 2, H / 2, 40, 1, 0, { col: 'rgba(255,255,255,0.6)', fam: 'Mono' }); } return; }
    const m = VID.meta(it.c), ts = clamp(it.in + K13.srcT(it, Math.max(0, lt)), 0, (m.n - 1.5) / 30);
    const g = K13.gradeOf(it, TL), cm = K13.cam(it, Math.max(0, lt), it.d), slow = !m.still && K13.timed(it) && K13.rateAt(it, Math.max(0, lt)) < 0.92;
    CX = g || cm || slow ? { g, cam: cm, blend: slow } : null;
    try { drawClipX(it, m, ts, cm); } finally { CX = null; }
  }
  function drawClipX(it, m, ts, cm) {
    if (MAINR) {   // split screen: the clip fills its half, or sits whole in it (library footage is shown whole unless the clip says otherwise)
      const lib = window.NX && NX.CLIPS && (NX.CLIPS.get(it.c) || {}).src === 'lib', f = it.sfit || (lib ? 'fit' : SPL.mfit);
      drawInto(it.c, ts, MAINR, f === 'fit' ? 'blur' : 'fill', SPL.mfx, SPL.mfy, SPL.mz); return; }
    const dz = cm && cm.dz ? cm.dz : 0;
    if (it.layout === 'fill') { const o = { rect: [0, 0, W, H], fit: 'cover' }; fsrc(it.c, ts, o); if (dz) depthPass(it.c, ts, { rect: [0, 0, W, H], fit: 'cover' }, [0, 0, W, H], dz); if (CX) K13.wash([0, 0, W, H], CX.g); return; }
    if (it.layout === 'blur') blurBg(it.c, ts); else if (it.bg && !VID.collecting) frameBg(it.bg, t0g);
    const r = clipRect(it.c, it.pos), q = r[2] <= 680 && r[3] <= 1000 ? 'h' : 'f'; fsrc(it.c, ts, { rect: r, fit: 'cover', q });
    if (dz) depthPass(it.c, ts, { rect: r, fit: 'cover', q }, r, dz);
    if (CX) K13.wash(r, CX.g);
  }
  function drawCard(it, lt, t) {
    if (VID.collecting) return;
    const bg = it.bg || 'ink';
    if (bg === 'paper') K3.bgPaper(t); else if (bg === 'kinetic') K3.bgKinetic(t, 960, 2.5); else if (bg === 'grunge') K3.bgGrunge(t, 7); else if (bg === 'grid') K3.bgGrid(t);
    else if (bg === 'gradient') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, DEEP1); g.addColorStop(0.55, BLK); g.addColorStop(1, ORA(0.35)); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = BLK; ctx.fillRect(0, 0, W, H); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    else fillScreen(bg === 'accent' ? OR : BLK);
  }
  function drawEnd(it, lt, t) {
    const st = it.style || 'kinetic';
    if (!VID.collecting) { if (st === 'editorial') K3.bgPaper(t); else if (st === 'grunge') K3.bgGrunge(t, 7); else if (st === 'blueprint') K3.bgGrid(t); else K3.bgKinetic(t, 700, 2.5); }
    const tag = it.tag || (st === 'editorial' ? (CONTACT.tagline || BRAND.name) : (tagCaps() || BRAND.name.toUpperCase()));
    K3.outro(st, lt, tag);
  }
  function drawItem(it, t) {
    if (MAINR && (it.type === 'tpl' || it.type === 'end' || it.type === 'container')) { const R = MAINR; MAINR = null; let sc; try { sc = K4.into('splitItem', () => drawItem(it, t)); } finally { MAINR = R; } if (!VID.collecting) blitMain(sc, R, false); return; }   // a template, an ending or a container: its whole frame, framed into the half
    const lt = t - it.start; t0g = t;
    // a moving scene renders whole into an offscreen, then the offscreen is placed under the motion — so the move applies
    // to the entire item, whatever it is, in preview and export alike. The collect pass draws direct (it registers sources).
    const ms = itemMotion(it, lt);
    if (!ms || VID.collecting) { drawItemBody(it, lt, t); return; }
    const sc = K4.into('freeItem', () => drawItemBody(it, lt, t));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= ms.op;
    ctx.translate(540 + ms.dx, 960 + ms.dy); if (ms.rot) ctx.rotate(ms.rot); if (ms.sx !== 1 || ms.sy !== 1) ctx.scale(ms.sx, ms.sy); ctx.translate(-540, -960);
    ctx.drawImage(sc, 0, 0); ctx.restore();
  }
  function drawItemBody(it, lt, t) {
    if (it.type === 'clip') drawClip(it, lt);
    else if (it.type === 'tpl') { if (!VID.collecting) fillScreen(it.dir.bg || BLK); it.dir.render(clamp(lt, 0, it.dir.dur - 1 / 30)); }
    else if (it.type === 'end') drawEnd(it, lt, t);
    else if (it.type === 'container') drawContainer(it, lt);
    else drawCard(it, lt, t);
  }
  // every transition comes from the transition studio (kit10, KT): the same code draws the editor preview, the library previews
  // and the export. tr = {type, d, dir, amt, col, ease, text, sfx}; old projects' transitions keep their exact look.
  function transition(a, b, t, tr) {
    const u = clamp((t - (b.start - tr.d / 2)) / tr.d), A = () => drawItem(a, t), B = () => drawItem(b, t);
    KT.run(tr.type, u, A, B, { t, dir: tr.dir, amt: tr.amt === undefined ? 1 : tr.amt, col: tr.col, ease: tr.ease, text: (tr.text || BRAND.short).toUpperCase() });
  }

  // ---------------- overlays ----------------
  const fitTo = (str, w, size, fam, ls, style, maxW) => Math.min(size, fitSize(str, w, maxW || 950, size, fam, ls || 0, style));
  function textBox(L) {   // approximate bounds in canvas px, for selection and dragging in the editor
    const sz = L.size || 80, txt = String(L.text || ''), lines = txt.split('\n');
    const w = (st, fam, wt, ls) => Math.max(...lines.map(l => textW(l, F(wt, sz, fam, st), ls || 0)));
    let bw, bh = sz * 1.15 * lines.length, top = L.y - sz * 0.9;
    switch (L.style) {
      case 'serif': bw = w('italic', 'Corm', 600); break;
      case 'hand': bw = w('', 'Hand', 700); break;
      case 'kicker': bw = w('', 'Mono', 700, 4) + sz; break;
      case 'caps': bw = w('', 'Mont', 700, 6); break;
      case 'typed': bw = w('', 'Mont', 800); break;
      case 'flap': bw = w('', 'Mono', 800, 2); break;
      case 'pill': bw = w('', 'Mont', 800, 2.5) + 70; bh = sz * 2.2; top = L.y - sz * 1.1; break;
      case 'caption': bw = Math.min(900, w('', 'Mont', 800)); bh = sz * 1.22 * Math.max(1, Math.ceil(w('', 'Mont', 800) / 900)); break;
      case 'quote': bw = 936; bh = sz * 1.18 * Math.max(2, Math.ceil(txt.length * sz * 0.42 / 936)) + sz * 2.6; top = L.y; return [L.x - 468, top, bw, bh];
      case 'number': bw = w('', 'Mont', 900); break;
      case 'maskword': { const z = L.size || 360; return [L.x - 495, L.y - z * 0.55, 990, z * 1.1]; }
      default: bw = w('', 'Mont', 900, -1.5);
    }
    bw = Math.min(bw, 1000); return [L.x - bw / 2, top, bw, bh];
  }
  function stickerBox(L) {
    const sz = L.size || 1;
    switch (L.type) {
      case 'cta': { const s = L.size || 32, tw = textW(CONTACT.cta, F(800, s, 'Mont'), 2.5) + 70; return [L.x - tw / 2, L.y - s * 1.1, tw, s * 2.2]; }
      case 'contact': return [L.x - 420, L.y - 70, 840, 150];
      case 'logo': { const [lw, lh] = logoBox(L.w || 700); return [L.x - lw / 2, L.y - lh / 2, lw, lh]; }
      case 'badge': { const r = L.size || 150; return [L.x - r, L.y - r, 2 * r, 2 * r]; }
      case 'chips': return [L.x - 460, L.y - 30, 920, 60];
      case 'arrow': return [L.x - 120, L.y - 150, 160, 230];
      case 'progress': return [0, 0, W, 14];
      case 'brackets': return [L.x - (L.w || 700) / 2, L.y - (L.h || 420) / 2, L.w || 700, L.h || 420];
      case 'scrim': return L.y > H / 2 ? [0, H * 0.55, W, H * 0.45] : [0, 0, W, H * 0.45];
      case 'label': { const s = L.size || 56, tw = textW(L.text || '', F(400, s, 'Bebas'), 3) + s * 0.9; return [L.x - tw / 2, L.y - s * 0.7, tw, s * 1.4]; }
      case 'steps': return [72, L.y - 30, W - 144, 100];
      case 'callout': return [L.x - 20, L.y - 170, 420, 200];
      case 'banner': { const top = L.y < H / 2, hb = L.h || (top ? 380 : 300); return top ? [0, 0, W, hb] : [0, H - hb, W, hb]; }
      case 'lowerthird': return [60, L.y - 150, 760, 150];
      case 'logobug': { const [lw, lh] = logoBox(L.w || 230); return [L.x - lw / 2, L.y - lh / 2, lw, lh]; }
      default: return [L.x - 100 * sz, L.y - 100 * sz, 200 * sz, 200 * sz];
    }
  }
  function pipRect(L) { const m = VID.meta(L.c), ar = m ? m.w / m.h : 16 / 9, w = L.w || 480, h = L.frame === 'circle' && !(L.key && L.key.on) ? w : L.frame === 'arch' && !(L.key && L.key.on) ? w * 1.28 : L.frame === 'tall' ? w * 1.25 : w / ar; return [L.x - w / 2, L.y - h / 2, w, h]; }
  function gifBox(L) {   // chunk #4: a GIF layer's box, from its display width and stored aspect ratio
    const w = L.w || 480, ar = L.ar || 1, h = Math.max(40, Math.round(w / ar)); return [L.x - w / 2, L.y - h / 2, w, h]; }
  function rawBox(L) {
    if (L.kind === 'gif') return gifBox(L);
    if (L.kind === 'text' && L.style === 'type') { const b = K8.box(L); return [L.x + b[0], L.y + b[1], b[2], b[3]]; }
    if (L.kind === 'mg') { const b = K9.box(L); return [L.x + b[0], L.y + b[1], b[2], b[3]]; }
    if (L.kind === 'seg') return splitRects(1).sec.slice();
    return L.kind === 'text' ? textBox(L) : L.kind === 'pip' ? pipRect(L) : stickerBox(L);
  }
  // the layer's box on screen; with t, where it actually is at that moment (motion and keyframes applied)
  function bbox(L, t) {
    if (L.kind === 'seg') return splitRects(t === undefined ? 1 : Math.max(splitK(t), t >= L.t0 && t < L.t0 + L.d ? 1e-3 : 0)).sec.slice();
    const b = rawBox(L); if (t === undefined) return b;
    const s = layerStateAt(L, clamp(t - L.t0, 0, L.d)); if (K8.plain(L, s)) return b;
    const ax = +L.x || 540, ay = +L.y || 960, cs = Math.cos(s.rot), sn = Math.sin(s.rot); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [cx, cy] of [[b[0], b[1]], [b[0] + b[2], b[1]], [b[0], b[1] + b[3]], [b[0] + b[2], b[1] + b[3]]]) {
      const dx = (cx - ax) * s.sx, dy = (cy - ay) * s.sy, rx = s.x + dx * cs - dy * sn, ry = s.y + dx * sn + dy * cs; x0 = Math.min(x0, rx); y0 = Math.min(y0, ry); x1 = Math.max(x1, rx); y1 = Math.max(y1, ry); }
    return [x0, y0, x1 - x0, y1 - y0];
  }
  // required fields still empty in motion graphics (the editor lists them before export)
  const missing = () => LAY.filter(L => L.kind === 'mg').map(L => ({ L, need: K9.missing(L) })).filter(x => x.need.length);

  function drawText(L, t, p, q) {
    const c = col(L.color), txt = String(L.text || ''), t0 = L.t0, t1 = L.t0 + L.d, x = L.x, y = L.y, size = L.size || 80, ff = L.font && window.NX && NX.fontFamily ? NX.fontFamily(L.font) : null;
    if (ff && (L.style === 'serif' || L.style === 'hand' || L.style === 'kicker')) { plainText(L, txt, ff, c, t, p, q); return; }
    switch (L.style) {
      case 'slam': { const ws = txt.split(/\s+/).filter(Boolean); if (!ws.length) return; let sz = size; const tw = textW(ws.join(' '), F(900, sz, 'Mont'), -3); if (tw > 950) sz *= 950 / tw;
        K3.words(ws, x, y, sz, t, t0, { hl: L.hl ? ws.length - 1 : -1, step: 0.2, shadow: true, q, col: c, hlText: onAcc(), fam: ff || undefined }); break; }
      case 'caption': { const ws = txt.split(/\s+/).filter(Boolean); captions(ws, x, y, t, t0 + 0.05, L.rate || 5, { size, boxed: L.box !== false, q, col: c, maxW: 900, hot: L.hl ? [ws.length - 1] : [], fam: ff || undefined }); break; }
      case 'kicker': kicker(txt, x, y, p, { align: 'center', size, q, col: c, maxW: 950, shadow: ['rgba(0,0,0,0.5)', 20, 2] }); break;
      case 'caps': caps(txt, x, y, size, p, q, { col: c, ls: 6, maxW: 950, shadow: 'rgba(0,0,0,0.45)', fam: ff || undefined }); break;
      case 'serif': serif(txt, x, y, fitTo(txt, 600, size, 'Corm', 0, 'italic'), p, q, { col: c, shadow: L.color !== 'ink' }); break;
      case 'hand': hand(txt, x, y, size, clamp((t - t0) / Math.max(0.5, txt.length * 0.045)), { col: c, align: 'center', q }); break;
      case 'typed': { const f = F(800, fitTo(txt, 800, size, ff || 'Mont'), ff || 'Mont'), tw = textW(txt, f, 0); K3.typed(txt, x - tw / 2, y, f, t, t0 + 0.05, 18, { col: c, until: t1 - 0.4 }); break; }
      case 'flap': K3.flap(txt.toUpperCase(), x, y, fitTo(txt.toUpperCase(), 800, size, ff || 'Mono', 2), t, t0, { align: 'center', col: c, shadow: true, fam: ff || undefined }); break;
      case 'outline': K3.outlineFill(txt, x, y, fitTo(txt, 800, size, ff || 'Mont', -2), p, clamp((t - t0 - 0.55) / 0.4), { align: 'center', col: c, fam: ff || undefined }); break;
      case 'maskword': maskWord(L, txt, ff || 'Bebas', t); break;
      case 'quote': K3.quote(txt, String(L.by || '').toUpperCase(), x - 468, y, 936, size, t, t0, { col: c, byCol: OR, q }); break;
      case 'pill': pill(txt, x, y, { fam: ff || undefined, size: fitTo(txt, 800, size, ff || 'Mont', 2.5, '', 880), p, q, bg: L.color === 'white' || !L.color ? OR : c, col: L.color === 'accent' || L.color === 'white' || !L.color ? onAcc() : (lum(c) > 0.4 ? BLK : WHT) }); break;
      case 'number': odo(txt, x, y, fitTo(txt, 900, size, ff || 'Mont'), p, { col: c, shadow: true, fam: ff || undefined }); break;
      default: { const lines = txt.split('\n').filter(Boolean); if (!lines.length) return; const sz = Math.min(size, ...lines.map(l => fitSize(l, 900, 950, 400, ff || 'Mont', -1.5)));
        headline(lines, x, y, t, t0, t1 - 0.32, { size: sz, col: c, align: 'center', hl: L.hl ? { line: lines.length - 1 } : undefined, hlText: onAcc(), maxW: 950, fam: ff || undefined }); }
    }
  }
  // a library font on a style that normally has its own family: fade and rise, or write on for script fonts
  function plainText(L, txt, fam, c, t, p, q) {
    const lines = txt.split('\n'), sz = Math.min(L.size || 80, ...lines.map(l => fitSize(l, 600, 950, 400, fam, 0, L.style === 'serif' ? 'italic' : ''))), lh = sz * 1.15;
    lines.forEach((ln, i) => {
      if (L.style === 'hand') { hand2(ln, L.x, L.y + i * lh, sz, fam, clamp((t - L.t0 - i * 0.4) / Math.max(0.4, ln.length * 0.045)), q, c); return; }
      T([[ln, c]], L.x, L.y + i * lh, F(L.style === 'kicker' ? 700 : 600, sz, fam, L.style === 'serif' ? 'italic' : ''), { align: 'center', mode: 'fade', p: clamp(p - i * 0.12), q, shadow: L.color === 'ink' ? null : ['rgba(0,0,0,0.5)', 28, 3] });
    });
  }
  function hand2(str, x, y, size, fam, p, q, c) {
    if (p <= 0 || q >= 1 || VID.collecting) return; const f = F(600, size, fam), tw = textW(str, f, 0), x0 = x - tw / 2, g = K3.G();
    g.beginPath(); g.rect(x0 - 20, y - size * 1.3, (tw + 40) * E.inOutS(clamp(p)), size * 1.9); g.clip(); setF(f, 0); g.textAlign = 'left'; g.globalAlpha = 1 - E.inC(q);
    g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 14; g.fillStyle = c; g.fillText(str, x0, y); K3.D();
  }
  // footage in the letters: the frame darkens around a giant word, then the word grows until it is the whole frame.
  // L.fill names a clip to play inside the letters instead of the frame behind; L.zoomD sets how long the zoom into the
  // full shot takes (L.zoom === false turns it off). The fill is registered on the collect pass like any other footage.
  function maskWord(L, txt, fam, t) {
    const lt = t - L.t0, lines = txt.toUpperCase().split('\n').filter(Boolean);
    const fill = L.fill && VID.meta(L.fill) ? L.fill : null, fts = fill ? clamp((+L.fillIn || 0) + Math.max(0, lt), 0, (VID.meta(fill).n - 1.5) / 30) : 0;
    if (VID.collecting) { if (fill) footageSrc(fill, fts, { rect: [0, 0, W, H], fit: 'cover', q: 'h' }); return; }
    if (!txt.trim()) return;
    if (fill) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); footageSrc(fill, fts, { rect: [0, 0, W, H], fit: 'cover', q: 'h' }); ctx.restore(); }
    const sz = Math.min(L.size || 360, ...lines.map(l => fitSize(l, fam === 'Bebas' ? 400 : 900, 990, 900, fam, 4))), lh = sz * 0.92;
    const zd = L.zoom === false ? 0 : clamp(+(L.zoomD || 0.8), 0.2, Math.max(0.2, L.d));
    const grow = zd ? clamp((lt - (L.d - zd)) / Math.max(0.15, zd * 0.94)) : 0, s = lerp(1, 20, E.inExpo(grow)) * lerp(1.12, 1, E.outC(clamp(lt / 0.7))), a = clamp(lt / 0.35);
    const m = scratch('mwM'), g = m.g; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
    g.fillStyle = L.color === 'paper' ? PAPER : L.color === 'accent' ? OR : L.color === 'white' ? '#FFFFFF' : BLK; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'destination-out'; g.translate(L.x, L.y); g.scale(s, s); g.font = F(fam === 'Bebas' ? 400 : 900, sz, fam); g.letterSpacing = '4px'; g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach((ln, i) => g.fillText(ln, 0, (i - (lines.length - 1) / 2) * lh + sz * 0.04));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a * (1 - clamp((grow - 0.85) / 0.15)); ctx.drawImage(m, 0, 0);
    if (grow < 0.05 && L.outline !== false) { ctx.globalAlpha = a * 0.9; ctx.translate(L.x, L.y); ctx.scale(s, s); ctx.font = g.font; ctx.letterSpacing = '4px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeStyle = OR; ctx.lineWidth = 3 / s;
      lines.forEach((ln, i) => ctx.strokeText(ln, 0, (i - (lines.length - 1) / 2) * lh + sz * 0.04)); }
    ctx.restore();
  }
  // banners: a top title band, a bottom info bar with the logo and contact, a lower third, a corner logo bug
  function banner(L, t, p, q) {
    const top = L.y < H / 2, hb = L.h || (top ? 380 : 300), e = E.outQ(clamp(p)) * (1 - E.inC(q)), bg = L.color === 'ink' ? BLK : L.color === 'paper' ? PAPER : L.color === 'white' ? '#FFFFFF' : OR;
    const fg = lum(bg) > 0.36 ? BLK : WHT, y0 = top ? -(1 - e) * hb : H - hb + (1 - e) * hb, g = K3.G();
    g.fillStyle = bg; g.fillRect(-20, y0, W + 40, hb); g.fillStyle = fg === BLK ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.16)'; g.fillRect(-20, top ? y0 + hb - 6 : y0, W + 40, 6); K3.D();
    const sub = String(L.sub || ''), txt = String(L.text || ''), ff = L.font && window.NX ? NX.fontFamily(L.font) : null;
    if (top) {
      if (sub) caps(sub.toUpperCase(), W / 2, y0 + hb * 0.42, 26, clamp((p - 0.3) * 2), q, { fam: 'Mono', w: 700, ls: 5, col: fg, maxW: 960 });
      if (txt) { const sz = Math.min(L.size || 96, fitSize(txt.toUpperCase(), 900, 960, 200, ff || 'Mont', -1.5)); T([[txt.toUpperCase(), fg]], W / 2, y0 + hb * (sub ? 0.76 : 0.62), F(900, sz, ff || 'Mont'), { align: 'center', ls: -1.5, p: clamp((p - 0.35) * 2), q }); }
    } else {
      const [lw, lh2] = logoBox(Math.min(340, hb * 1.4)); if (!VID.collecting) { const c = K3.G(); c.globalAlpha = clamp((p - 0.3) * 2) * (1 - q); c.drawImage(fg === BLK ? IMG.logoB : IMG.logoW, 60, y0 + hb / 2 - lh2 / 2, lw, lh2); K3.D(); }
      const rx = W - 60, l1 = txt || CONTACT.phone, l2 = sub || CONTACT.web;
      caps(l1, rx, y0 + hb / 2 - 4, Math.min(56, fitSize(l1, 800, W - 180 - lw, 56, ff || 'Mont', 1)), clamp((p - 0.4) * 2), q, { w: 800, ls: 1, col: fg, align: 'right', ls0: 0 });
      caps(l2, rx, y0 + hb / 2 + 44, Math.min(26, fitSize(l2, 700, W - 180 - lw, 26, 'Mont', 4)), clamp((p - 0.5) * 2), q, { w: 700, ls: 4, col: fg === BLK ? BLK : OR, align: 'right', ls0: 0 });
    }
  }
  function lowerThird(L, t, p, q) {
    if (VID.collecting) return; const ff = L.font && window.NX ? NX.fontFamily(L.font) : null, txt = String(L.text || BRAND.name), sub = String(L.sub || ''), x0 = 60, y = L.y;
    const sz = Math.min(L.size || 58, fitSize(txt, 800, 860, 80, ff || 'Mont', 0)), f1 = F(800, sz, ff || 'Mont'), w1 = textW(txt, f1, 0), f2 = F(700, 26, 'Mono'), w2 = sub ? textW(sub.toUpperCase(), f2, 4) : 0;
    const bw = Math.max(w1, w2) + 70, bh = sz * 1.3 + (sub ? 56 : 0), e = E.outQ(clamp(p)), x = E.inC(clamp(q)), g = K3.G();
    g.beginPath(); g.rect(x0, y - bh, (bw + 20) * e * (1 - x), bh + 4); g.clip();
    g.fillStyle = 'rgba(11,11,11,0.86)'; g.fillRect(x0, y - bh, bw, bh); g.fillStyle = OR; g.fillRect(x0, y - bh, 12, bh);
    setF(f1, 0); g.fillStyle = WHT; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText(txt, x0 + 40, y - bh + sz * 1.05);
    if (sub) { setF(f2, 4); g.fillStyle = OR; g.fillText(sub.toUpperCase(), x0 + 40, y - 26); } K3.D();
  }
  // chunk #4: vector stickers — canvas-drawn shapes, no image assets. A star path centred on (cx, cy).
  function starPath(cx, cy, rO, rI, n, rot) { ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? rI : rO, a = (rot || -Math.PI / 2) + i * Math.PI / n, px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.closePath(); }
  function drawSticker(L, t, p, q) {
    const lt = t - L.t0, x = L.x, y = L.y;
    // chunk #4 vector stickers: pop in, drawn at scale (L.size || 1), colour from L.color (accent by default)
    if (['starburst', 'heart', 'check', 'flame', 'sparkle', 'bolt', 'pin', 'star', 'tag', 'gift'].includes(L.type)) {
      const pop = E.outBack(clamp(p * 1.4)), s = pop * (L.size || 1), bg = col(L.color || 'accent'), tc = lum(bg) > 0.36 ? BLK : WHT;
      ctx.save(); ctx.globalAlpha *= (1 - q);
      if (L.type === 'starburst') { ctx.fillStyle = bg; starPath(x, y, 98 * s, 74 * s, 16, -Math.PI / 2); ctx.fill(); ctx.restore(); caps(String(L.text || 'SALE').toUpperCase(), x, y + 8, Math.min(52 * s, fitSize(String(L.text || 'SALE').toUpperCase(), 800, 150 * s, 60, 'Mont', 1)), p, q, { col: tc, w: 800, ls: 1 }); return; }
      if (L.type === 'heart') { ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(x, y + 78 * s); ctx.bezierCurveTo(x - 95 * s, y + 5 * s, x - 72 * s, y - 72 * s, x, y - 28 * s); ctx.bezierCurveTo(x + 72 * s, y - 72 * s, x + 95 * s, y + 5 * s, x, y + 78 * s); ctx.fill(); ctx.restore(); return; }
      if (L.type === 'check') { ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x, y, 88 * s, 0, 7); ctx.fill(); ctx.strokeStyle = WHT; ctx.lineWidth = 18 * s; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 38 * s, y + 2 * s); ctx.lineTo(x - 12 * s, y + 30 * s); ctx.lineTo(x + 42 * s, y - 32 * s); ctx.stroke(); ctx.restore(); return; }
      if (L.type === 'flame') { ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(x, y + 95 * s); ctx.bezierCurveTo(x - 70 * s, y + 40 * s, x - 55 * s, y - 30 * s, x, y - 95 * s); ctx.bezierCurveTo(x + 18 * s, y - 55 * s, x + 30 * s, y - 30 * s, x + 22 * s, y + 5 * s); ctx.bezierCurveTo(x + 38 * s, y + 25 * s, x + 30 * s, y + 60 * s, x, y + 95 * s); ctx.fill(); ctx.restore(); return; }
      if (L.type === 'sparkle') { ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(x, y - 95 * s); ctx.quadraticCurveTo(x + 10 * s, y - 10 * s, x + 95 * s, y); ctx.quadraticCurveTo(x + 10 * s, y + 10 * s, x, y + 95 * s); ctx.quadraticCurveTo(x - 10 * s, y + 10 * s, x - 95 * s, y); ctx.quadraticCurveTo(x - 10 * s, y - 10 * s, x, y - 95 * s); ctx.fill(); ctx.restore(); return; }
      if (L.type === 'bolt') { ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(x + 24 * s, y - 95 * s); ctx.lineTo(x - 52 * s, y + 18 * s); ctx.lineTo(x - 8 * s, y + 18 * s); ctx.lineTo(x - 24 * s, y + 95 * s); ctx.lineTo(x + 56 * s, y - 22 * s); ctx.lineTo(x + 8 * s, y - 22 * s); ctx.closePath(); ctx.fill(); ctx.restore(); return; }
      if (L.type === 'pin') { ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x, y - 28 * s, 58 * s, 0, 7); ctx.moveTo(x - 48 * s, y + 8 * s); ctx.lineTo(x, y + 95 * s); ctx.lineTo(x + 48 * s, y + 8 * s); ctx.closePath(); ctx.fill(); ctx.fillStyle = WHT; ctx.beginPath(); ctx.arc(x, y - 28 * s, 24 * s, 0, 7); ctx.fill(); ctx.restore(); return; }
      if (L.type === 'star') { ctx.fillStyle = bg; starPath(x, y, 95 * s, 42 * s, 5, -Math.PI / 2); ctx.fill(); ctx.restore(); return; }
      if (L.type === 'tag') { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.28); ctx.scale(s, s); ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(-95, -42, 190, 84, 12); ctx.fill(); ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(-68, 0, 11, 0, 7); ctx.fill(); ctx.restore(); ctx.restore(); caps(String(L.text || '$19').toUpperCase(), x + 12, y + 8, Math.min(40 * s, fitSize(String(L.text || '$19').toUpperCase(), 800, 130 * s, 60, 'Mont', 1)), p, q, { col: tc, w: 800, ls: 1 }); return; }
      if (L.type === 'gift') { ctx.fillStyle = bg; ctx.fillRect(x - 70 * s, y - 10 * s, 140 * s, 100 * s); ctx.fillRect(x - 80 * s, y - 42 * s, 160 * s, 32 * s); ctx.fillStyle = WHT; ctx.fillRect(x - 12 * s, y - 42 * s, 24 * s, 132 * s); ctx.beginPath(); ctx.ellipse(x - 26 * s, y - 52 * s, 26 * s, 16 * s, -0.5, 0, 7); ctx.ellipse(x + 26 * s, y - 52 * s, 26 * s, 16 * s, 0.5, 0, 7); ctx.fill(); ctx.restore(); return; }
      ctx.restore(); return;
    }
    switch (L.type) {
      case 'cta': { const s = Math.min(L.size || 32, fitSize(CONTACT.cta, 800, 880, 40, 'Mont', 2.5)); pill(CONTACT.cta, x, y, { size: s, p, q, bg: OR, col: onAcc() }); K3.ripple(x + Math.min(300, textW(CONTACT.cta, F(800, s, 'Mont'), 2.5) / 2), y + 10, t, L.t0 + 0.9); break; }
      case 'contact': caps(CONTACT.phone, x, y, 72, p, q, { w: 800, ls: 1, col: L.color === 'ink' ? BLK : WHT, shadow: L.color === 'ink' ? null : 'rgba(0,0,0,0.5)' });
        caps(CONTACT.web, x, y + 66, 32, clamp(p * 1.4 - 0.4), q, { w: 700, ls: 5, col: OR, maxW: 960, shadow: L.color === 'ink' ? null : 'rgba(0,0,0,0.5)' }); break;
      case 'logo': K3.logoBuild(x, y, L.w || 700, L.t0, t, { img: L.color === 'ink' ? IMG.logoB : IMG.logoW, soft: L.color === 'ink' }); break;
      case 'badge': { const r = L.size || 150, ring = ((L.text || CONTACT.badge || BRAND.name).toUpperCase() + '  •  ').repeat(2).slice(0, 40), cen = (L.center || BRAND.short || '').toUpperCase().slice(0, 8);
        K3.stamp(x, y, r, ring, cen, p, { col: col(L.color === 'white' ? 'white' : 'accent') }); break; }
      case 'chips': K3.chips((L.items && L.items.length ? L.items : (BRAND.services || []).slice(0, 3)).map(s => String(s).toUpperCase()), x, y, t, L.t0, { maxW: 960 }); break;
      case 'arrow': handArrow([[x - 110, y - 140], [x - 96, y - 60], [x - 50, y + 10], [x + 10, y + 60]], clamp(lt / 0.5), { head: 34, lw: 9, col: col(L.color || 'accent'), q }); break;
      case 'progress': progressBar(t, DUR, { h: 10 }); break;
      case 'brackets': K3.brackets([x - (L.w || 700) / 2, y - (L.h || 420) / 2, L.w || 700, L.h || 420], lt, col(L.color || 'accent')); break;
      case 'scrim': if (y > H / 2) scrim(H * 0.5, H, 0, 0.82 * p * (1 - q)); else scrim(H * 0.5, 0, 0, 0.82 * p * (1 - q)); break;
      case 'label': K3.label((L.text || 'NEW').toUpperCase(), x, y, L.size || 56, -0.03, p, { bg: OR, col: onAcc() }); break;
      case 'steps': { const it = (L.items && L.items.length ? L.items : ['PLAN', 'BUILD', 'ENJOY']).map(s => String(s).toUpperCase()), n = it.length, k = Math.min(n - 1, Math.floor(lt / (L.d / n)));
        K3.steps(it, k, y, t, p * (1 - q), { prog: clamp((lt - k * L.d / n) / (L.d / n)) }); break; }
      case 'callout': callout(x, y, x + 170, y - 130, (L.text || 'LOOK HERE').toUpperCase(), clamp(lt / 0.8), { q }); break;
      case 'banner': banner(L, t, p, q); break;
      case 'lowerthird': lowerThird(L, t, p, q); break;
      case 'logobug': { if (VID.collecting) break; const [lw, lh] = logoBox(L.w || 230), g = K3.G(); g.globalAlpha = clamp(p * 1.5) * (1 - q) * (L.opacity === undefined ? 0.92 : 1); g.drawImage(L.color === 'ink' ? IMG.logoB : IMG.logoW, x - lw / 2, y - lh / 2, lw, lh); K3.D(); break; }
    }
  }
  // V22: a cut-out presenter (L.key: the green or blue screen is removed, kit14). The clip stands on its feet at the bottom
  // of its box and rises in; L.outline (px) and L.shadow dress the edge. L.zoom and L.fy frame the picture inside a bubble.
  function drawCut(L, t, p, q, m, ts) {
    const w = L.w || 600, h = w * m.h / m.w, e = K13.SOFT(clamp(p * 0.75)), x = L.x - w / 2, y = L.y - h / 2 + (1 - e) * h * 0.35;
    if (VID.collecting) { VID.get(L.c, VID.idx(L.c, ts), 'h'); return; }
    const img = VID.get(L.c, VID.idx(L.c, ts), 'h'); if (!img) return;
    const cv = K14.keyed(L.c, VID.idx(L.c, ts), img, L.key);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); ctx.globalAlpha *= clamp(p * 4) * (1 - q);
    K14.cutout(cv, [0, 0, cv.width, cv.height], [x, y, w, h], { outline: +L.outline || 0, outlineCol: L.outlineCol === 'accent' ? OR : '#FFFFFF', shadow: L.shadow !== false });
    ctx.restore();
  }
  function drawPip(L, t, p, q) {
    if (!VID.meta(L.c) || L.hide) return; const m = VID.meta(L.c), r = pipRect(L), ts = clamp((+L.in || 0) + (t - L.t0), 0, (m.n - 1.5) / 30), e = E.outBack(clamp(p)), s = lerp(0.6, 1, e);
    if (L.key && L.key.on) { drawCut(L, t, p, q, m, ts); return; }
    const cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2, bw = L.frame === 'none' || L.frame === 'circle0' ? 0 : 10;
    ctx.save(); ctx.globalAlpha *= clamp(p * 3) * (1 - q);
    if (!VID.collecting) { const c = K3.G(); c.translate(cx, cy); c.scale(s, s); c.translate(-cx, -cy); c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 40; c.shadowOffsetY = 10;
      c.fillStyle = L.frame === 'accent' ? OR : '#FFFFFF'; if (bw && (L.frame === 'circle' || L.frame === 'arch')) { c.beginPath(); if (L.frame === 'circle') c.arc(cx, cy, r[2] / 2 + bw, 0, 7); else { c.moveTo(r[0] - bw, r[1] + r[3] + bw); c.lineTo(r[0] - bw, r[1] + r[2] / 2); c.arc(cx, r[1] + r[2] / 2, r[2] / 2 + bw, Math.PI, 0); c.lineTo(r[0] + r[2] + bw, r[1] + r[3] + bw); c.closePath(); } c.fill(); }
      else if (bw) { rrect(r[0] - bw, r[1] - bw, r[2] + 2 * bw, r[3] + 2 * bw, L.frame === 'round' ? 28 : 6); c.fill(); } K3.D(); }
    const rs = [cx - r[2] * s / 2, cy - r[3] * s / 2, r[2] * s, r[3] * s];
    const clip = L.frame === 'round' ? () => ctx.roundRect(rs[0], rs[1], rs[2], rs[3], 20) : L.frame === 'circle' ? () => ctx.arc(cx, cy, rs[2] / 2, 0, 7) : L.frame === 'arch' ? () => { ctx.moveTo(rs[0], rs[1] + rs[3]); ctx.lineTo(rs[0], rs[1] + rs[2] / 2); ctx.arc(cx, rs[1] + rs[2] / 2, rs[2] / 2, Math.PI, 0); ctx.lineTo(rs[0] + rs[2], rs[1] + rs[3]); ctx.closePath(); } : undefined;
    footageSrc(L.c, ts, { rect: rs, fit: 'cover', q: 'h', clip, z: Math.max(1, +L.zoom || 1), cy: L.fy === undefined ? 0.5 : clamp(+L.fy, 0, 1) });
    ctx.restore();
  }
  // a legacy layer exactly as it always rendered, at opacity op
  function drawLegacy(L, t, op) {
    const lt = t - L.t0, p = clamp(lt / 0.4), q = clamp((lt - (L.d - 0.3)) / 0.3);
    const draw = () => (L.kind === 'text' ? drawText(L, t, p, q) : L.kind === 'pip' ? drawPip(L, t, p, q) : drawSticker(L, t, p, q));
    // functions that set their own opacity get faded out through an offscreen layer
    const own = L.kind === 'sticker' ? !['cta', 'contact', 'scrim', 'steps', 'callout', 'arrow', 'banner', 'lowerthird', 'logobug'].includes(L.type) : L.kind === 'text' ? ['typed', 'flap', 'outline', 'number'].includes(L.style) : false;
    if (VID.collecting || ((!own || q <= 0) && op >= 1)) { draw(); return; }
    const sc = K4.into('freeL', draw); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= (own ? 1 - E.inC(q) : 1) * op; ctx.drawImage(sc, 0, 0); ctx.restore();
  }
  // chunk #4: a GIF layer — the bitmap for the current local time, looping (NX.gif decodes via ImageDecoder; see js/nx-gif.js).
  // During the collect pass nothing is drawn (touch() only starts the decode); the real pass draws the cached frame.
  function drawGif(L, t) {
    const G = window.NX && NX.gif; if (!G) return;
    const ref = G.refOf(L); if (!ref) return;
    const rec = G.state(ref); const bmp = rec && G.frameAt(rec, t - L.t0, L.loop !== false);
    if (!bmp) { G.touch(L); return; }
    const b = gifBox(L);
    ctx.save(); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(bmp, b[0], b[1], b[2], b[3]); ctx.restore();
  }
  // every layer moves the same way (V10): its state at this moment (K8.xf: position, scale, rotation, opacity, blur, mask and
  // keyframes) is applied around its anchor. New text ('type') and motion graphics ('mg') draw under that state directly;
  // older layers render as before and are placed under it, so an old project with no motion renders exactly as it did.
  function drawLayer(L, t) {
    const lt = t - L.t0; if (lt < 0 || lt >= L.d) return;
    const io = ioState(L, lt);   // the in/out transition rides the same state as motion (see layerStateAt)
    if (L.kind === 'gif') { if (VID.collecting) { if (window.NX && NX.gif) NX.gif.touch(L); return; }
      const s = layerStateAt(L, lt, io); if (K8.plain(L, s)) drawGif(L, t); else K8.legacy(L, s, () => drawGif(L, t), gifBox(L)); return; }
    const s = layerStateAt(L, lt, io), o = { maskDir: (io && io.maskDir) || L.maskDir };
    if (L.kind === 'text' && L.style === 'type') { K8.withLayer(s, K8.box(L), () => K8.type(L, t, s), o); return; }
    if (L.kind === 'mg') { const e = K9.EL[L.type]; if (!e) return;
      if (e.full) { if (VID.collecting) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= s.op; K9.draw(L, t, s); ctx.restore(); }
      else K8.withLayer(s, K9.box(L), () => K9.draw(L, t, s), o); return; }
    if (K8.plain(L, s)) { drawLegacy(L, t, s.op); return; }
    K8.legacy(L, s, () => drawLegacy(L, t, 1), rawBox(L));
  }

  function at(t) { let i = 0; for (let k = 0; k < M.length; k++) if (t >= M[k].start - 1e-6) i = k; return i; }
  function drawMain(t) {
    let fin = TL.finish || DEF_FIN;
    if (M.length) {
      const i = at(t), cur = M[i], nxt = M[i + 1], lt = t - cur.start;
      if (cur.tr && lt < cur.tr.d / 2 && i > 0) transition(M[i - 1], cur, t, cur.tr);
      else if (nxt && nxt.tr && t > nxt.start - nxt.tr.d / 2) transition(cur, nxt, t, nxt.tr);
      else drawItem(cur, t);
      if (cur.type === 'tpl') fin = cur.dir.finish || { vig: 0, grain: 0 };
      else if (cur.type === 'end' && cur.style === 'editorial') fin = { vig: 0.06, grain: 0.12 };
    } else if (!VID.collecting) {
      fillScreen(TL.bg ? col(TL.bg) : BLK);
      if (!LAY.length) { caps('ADD MEDIA, TEXT OR A TEMPLATE', W / 2, H / 2 - 10, 30, 1, 0, { fam: 'Mono', col: 'rgba(255,255,255,0.55)', ls: 4 }); caps('FROM THE PANELS ON THE LEFT', W / 2, H / 2 + 40, 22, 1, 0, { fam: 'Mono', col: 'rgba(255,255,255,0.35)', ls: 4 }); }
    }
    return fin;
  }
  function drawSplit(t, k) {
    const R = splitRects(k), gap = SPL.line === 'gap';
    if (!VID.collecting) fillScreen(gap ? lineCol() : BLK);
    let fin = TL.finish || DEF_FIN;
    ctx.save(); if (!VID.collecting) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); if (gap) ctx.roundRect(R.main[0], R.main[1], R.main[2], R.main[3], 28); else ctx.rect(R.main[0], R.main[1], R.main[2], R.main[3]); ctx.clip(); }
    MAINR = R.main; try { fin = drawMain(t); } finally { MAINR = null; ctx.restore(); }
    const act = SEG.filter(L => t >= L.t0 && t < L.t0 + L.d);
    if (!act.length && !VID.collecting) { ctx.save(); ctx.fillStyle = BLK; ctx.fillRect(R.sec[0], R.sec[1], R.sec[2], R.sec[3]); ctx.restore(); }
    act.forEach((L, i) => drawSeg(L, t, R.sec, gap, i ? E.outC(clamp((t - L.t0) / 0.3)) : 1));
    if (!VID.collecting && (SPL.line === 'line' || SPL.line === 'bar')) { const h = SPL.line === 'bar' ? 18 : 6; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(k * 1.5); ctx.fillStyle = lineCol(); if (SPL.line === 'bar') { ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18; } ctx.fillRect(0, R.seam - h / 2, W, h); ctx.restore(); }
    return fin;
  }
  function render(t) {
    const k = RUNS.length ? splitK(t) : 0;
    const fin = k > 1e-3 ? drawSplit(t, k) : drawMain(t);
    for (const L of LAY) if (L.kind !== 'seg') K13.mb(L, t, drawLayer, TL);
    if (TL.glow) K13.glow(TL.glow);
    finish(t, fin);
  }
  window.FREE = { M, LAY, DUR, BLOCKS, bbox, at, missing, split: { SPL, SEG, RUNS, k: splitK, rects: splitRects }, containerZones };
  DIR = { dur: DUR, bg: TL.bg ? col(TL.bg) : BLK, finish: { vig: 0, grain: 0 }, edl: [], shakes, preload: () => K3.init(), render, cues: () => ({ dur: DUR, beds: [], events: [] }) };
});
