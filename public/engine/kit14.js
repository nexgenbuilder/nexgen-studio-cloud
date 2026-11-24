'use strict';
/* Kit 14 (V22, Nov 12): cut-outs. K14.keyed(clip, frame, img, key) removes a green or blue screen from a footage frame and
   returns it as a canvas with a transparent background, so a presenter or avatar can stand in front of anything.
   key = { col: 'auto' | 'green' | 'blue', tol: 0..1 (how much is removed), soft: 0..1 (edge softness) }.
   'auto' reads the screen colour from the corners of the frame. The screen's colour is also taken out of the edges
   (spill), so hair and shoulders don't keep a green rim. K14.cutout(...) draws the result with an optional outline and
   shadow. A pure function of the frame, so the preview and the export match. */
const K14 = (() => {
  const CACHE = new Map(), REF = new Map(), MAX = 8; let tick = 0;
  const sm = (a, b, x) => { const u = x <= a ? 0 : x >= b ? 1 : (x - a) / (b - a); return u * u * (3 - 2 * u); };
  // the screen colour: the middle value of small patches in the four corners and along the top edge
  function refOf(c, d, w, h, col) {
    const k0 = c + '|' + col; if (REF.has(k0)) return REF.get(k0);
    const pts = [[0.04, 0.04], [0.96, 0.04], [0.04, 0.5], [0.96, 0.5], [0.25, 0.03], [0.75, 0.03], [0.04, 0.9], [0.96, 0.9]], R = [], G = [], B = [];
    for (const [fx, fy] of pts) { const x0 = Math.floor(fx * (w - 6)), y0 = Math.floor(fy * (h - 6)); let r = 0, g = 0, b = 0; for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) { const i = ((y0 + y) * w + x0 + x) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; } R.push(r / 36); G.push(g / 36); B.push(b / 36); }
    const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1], K = [med(R), med(G), med(B)];
    let ch = col === 'green' ? 1 : col === 'blue' ? 2 : (K[1] >= K[2] ? 1 : 2); const o = [0, 1, 2].filter(i => i !== ch), dom = K[ch] - Math.max(K[o[0]], K[o[1]]);
    const ref = { ch, o, G: dom > 40 ? dom : 110, found: dom > 40 }; REF.set(k0, ref); if (REF.size > 60) REF.delete(REF.keys().next().value); return ref;
  }
  function keyed(c, idx, img, key) {
    const col = (key && key.col) || 'auto', tol = clamp(key && key.tol !== undefined ? +key.tol : 0.5, 0, 1), soft = clamp(key && key.soft !== undefined ? +key.soft : 0.4, 0, 1), id = [c, idx, img.width, col, tol, soft].join('|');
    const hit = CACHE.get(id); if (hit) { hit.u = ++tick; return hit.cv; }
    let e = null; if (CACHE.size >= MAX) { let old = null, ok = ''; for (const [k, v] of CACHE) if (!old || v.u < old.u) { old = v; ok = k; } CACHE.delete(ok); e = old; }
    const w = img.width, h = img.height; if (!e) e = { cv: document.createElement('canvas') }; if (e.cv.width !== w || e.cv.height !== h) { e.cv.width = w; e.cv.height = h; }
    const g = e.cv.getContext('2d', { willReadFrequently: true }); g.globalCompositeOperation = 'copy'; g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-over';
    const im = g.getImageData(0, 0, w, h), d = im.data, R = refOf(c, d, w, h, col), ch = R.ch, o0 = R.o[0], o1 = R.o[1], a0 = 0.5 - 0.38 * tol, a1 = a0 + 0.12 + 0.4 * soft, inv = 1 / R.G;
    for (let i = 0; i < d.length; i += 4) {
      const x = d[i + o0], y = d[i + o1], mo = x > y ? x : y, dd = d[i + ch] - mo; if (dd <= 0) continue;
      const u = dd * inv; if (u >= a1) { d[i + 3] = 0; continue; }
      d[i + ch] = mo + dd * 0.12;                      // spill: pull the screen's colour out of what stays
      if (u > a0) d[i + 3] = d[i + 3] * (1 - sm(a0, a1, u));
    }
    g.putImageData(im, 0, 0); e.u = ++tick; e.found = R.found; CACHE.set(id, e); return e.cv;
  }
  const SIL = { cv: null };
  // draw a cut-out into rect r (cover-fit from the source box sx, sy, sw, sh) with an outline and a shadow
  function cutout(cv, s, r, o) {
    o = o || {}; const c = ctx, ol = Math.max(0, +o.outline || 0), [sx, sy, sw, sh] = s;
    if (ol > 0) { if (!SIL.cv) SIL.cv = document.createElement('canvas'); const q = SIL.cv; if (q.width !== cv.width || q.height !== cv.height) { q.width = cv.width; q.height = cv.height; }
      const g = q.getContext('2d'); g.globalCompositeOperation = 'copy'; g.drawImage(cv, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = o.outlineCol || '#FFFFFF'; g.fillRect(0, 0, q.width, q.height); g.globalCompositeOperation = 'source-over';
      c.save(); if (o.shadow) { c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 36; c.shadowOffsetY = 12; }
      for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; c.drawImage(q, sx, sy, sw, sh, r[0] + Math.cos(a) * ol, r[1] + Math.sin(a) * ol, r[2], r[3]); if (k === 0) { c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0; } } c.restore(); }
    c.save(); if (o.shadow && !ol) { c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 36; c.shadowOffsetY = 12; } c.imageSmoothingQuality = 'high'; c.drawImage(cv, sx, sy, sw, sh, r[0], r[1], r[2], r[3]); c.restore();
  }
  return { keyed, cutout, found: (c, col) => { const r = REF.get(c + '|' + (col || 'auto')); return r ? r.found : null; } };
})();
