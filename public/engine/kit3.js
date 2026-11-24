'use strict';
/* Motion kit 3 (Oct 25, 2026): the shared motion system behind v_kin (Bold Kinetic), v_grunge (Grunge Street),
   v_bp (Blueprint) and v_edit (Editorial). Rules: horizontal clips shown whole (16:9, or 3:2 for c08/c10), real speed,
   no zoom; the band can morph between aspects at a cut and opens from / closes to a line. All drawing is in screen px
   (1080x1920) with the frame shake applied. Call `await K3.init()` in a template's preload. */
const K3 = (() => {
  const lmod = (x, m) => ((x % m) + m) % m;
  const ARX = { c03: 1080 / 1920, c04: 1080 / 1920, c08: 1762 / 1174, c10: 1762 / 1174 };
  const ar = c => { if (ARX[c]) return ARX[c]; const m = VID.meta(c); return m ? m.w / m.h : 16 / 9; };
  let PARTS = null;
  async function init(o) {
    o = o || {};
    PARTS = await (await fetch('assets/logo_parts.json')).json();
    await loadTracks();
    if (o.grunge) await loadImg('grunge', 'assets/logo_grunge.png');
  }
  const G = () => { ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); return ctx; };
  const D = () => ctx.restore();
  const segOf = (c, t) => { const s = VID.meta(c).segs, f = Math.round(t * 30); let b = s[0], bd = 1e9;
    for (const g of s) { const d = f < g[0] ? g[0] - f : f > g[1] ? f - g[1] : 0; if (d < bd) { bd = d; b = g; } } return b; };
  const at = (c, inn, lt) => { const g = segOf(c, inn + 0.04); return clamp(inn + lt, g[0] / 30, (g[1] - 0.5) / 30); };
  function wholeIn(c, r) { const a = ar(c); let w = r[2], h = w / a; if (h > r[3]) { h = r[3]; w = h * a; } return [r[0] + (r[2] - w) / 2, r[1] + (r[3] - h) / 2, w, h]; }
  function clip(c, inn, lt, rect, o) { const q = rect[2] <= 680 && rect[3] <= 1000 ? 'h' : 'f';
    return footageSrc(c, at(c, inn, lt), Object.assign({ rect, fit: 'cover', q }, o || {})); }
  function shots(list) { let s = 0; const S = list.map(x => { const o = Array.isArray(x) ? { c: x[0], in: x[1], d: x[2], ...(x[3] || {}) } : Object.assign({}, x); o.start = s; s += o.d; return o; }); S.total = s; return S; }
  function shotAt(S, t) { let i = 0; for (let k = 0; k < S.length; k++) if (t >= S[k].start - 1e-6) i = k; return { i, sh: S[i], lt: t - S[i].start }; }

  // ---------------- band ----------------
  // o: {cy, open:[t0, d], close:[t1, d], tr:'cut'|'push'|'dissolve'|'jump', morph, flash, drift, rot(i)}
  // returns {i, sh, lt, r (visible rect), f (footage rect)}
  function band(S, t, o) {
    o = o || {}; const cy = o.cy || 864, MT = o.morph || 0.32, tt = clamp(t, 0, S.total - 1 / 60);
    const { i, sh, lt } = shotAt(S, tt), pv = S[i - 1];
    const BX = o.bx || 0, BW = o.bw || W, hOf = s => o.h || Math.round(BW / ar(s.c));
    let h = hOf(sh); if (pv && lt < MT) h = lerp(hOf(pv), h, E.inOutC(lt / MT));
    const op = o.open ? E.outQ(clamp((t - o.open[0]) / o.open[1])) : 1, cl = o.close ? E.inOutC(clamp((t - o.close[0]) / o.close[1])) : 0;
    const vis = lerp(4, h, op * (1 - cl)), r = [BX, cy - vis / 2, BW, vis], F0 = [BX, cy - h / 2, BW, h];
    if (o.open && op <= 0) return { i, sh, lt, r: [BX, cy, BW, 0], f: F0, drift: 0, closed: true };
    if (cl > 0.999) { const ss = S[S.length - 1]; footageSrc(ss.c, at(ss.c, ss.in, 0), { rect: [0, 0, 1, 1], alpha: 0 }); return { i, sh, lt, r: [BX, cy, BW, 0], f: F0, drift: 0, closed: true }; }
    const drift = o.drift ? -o.drift * (lt / sh.d) : 0;
    if (o.dry) return { i, sh, lt, r, f: wholeIn(sh.c, F0), drift, closed: false };
    const win = () => ctx.rect(r[0], r[1], r[2], r[3]);
    if (o.under && !VID.collecting) { const c = G(); c.fillStyle = o.under; c.fillRect(r[0], r[1] - 2, r[2], r[3] + 4); D(); }
    const tr = sh.tr || o.tr || 'cut', TD = tr === 'dissolve' ? 0.6 : tr === 'scan' ? 0.42 : 0.3;
    const rot = o.rot ? o.rot(i) : 0, rotp = pv && o.rot ? o.rot(i - 1) : 0;
    const draw = (s, l, extra) => clip(s.c, s.in, l, wholeIn(s.c, F0), Object.assign({ clip: win, dy: drift, rot }, extra || {}));
    if (pv && lt < TD && tr !== 'cut' && tr !== 'jump') {
      const u = E.inOutC(lt / TD);
      if (tr === 'push') { const dir = sh.dir || (i % 2 ? 1 : -1); draw(pv, t - pv.start, { dx: -dir * u * BW, rot: rotp }); draw(sh, lt, { dx: dir * (1 - u) * BW }); }
      else if (tr === 'scan') { const ux = E.inOutS(lt / TD), xe = r[0] + r[2] * ux; draw(pv, t - pv.start, { rot: rotp }); clip(sh.c, sh.in, lt, wholeIn(sh.c, F0), { clip: () => ctx.rect(r[0], r[1], r[2] * ux, r[3]), dy: drift });
        if (!VID.collecting) { const c = G(); c.fillStyle = OR; c.fillRect(xe - 2, r[1] - 10, 4, r[3] + 20); c.fillStyle = ORA(0.25); c.fillRect(xe - 18, r[1], 16, r[3]); D(); } }
      else { draw(pv, t - pv.start, { rot: rotp }); draw(sh, lt, { alpha: u }); }
    } else if (tr === 'jump' && lt < 0.16) { const j = (1 - lt / 0.16); draw(sh, lt, { dx: (hash(i * 7.1) - 0.5) * 30 * j, dy: drift + (hash(i * 3.3) - 0.5) * 20 * j }); }
    else draw(sh, lt);
    if (!VID.collecting && pv && o.flash !== false && tr !== 'dissolve' && tr !== 'scan') {
      const fl = Math.pow(clamp(1 - lt / 0.12), 2) * (o.flash || 0.5); if (fl > 0.01) { const c = G(); c.fillStyle = `rgba(255,255,255,${fl})`; c.fillRect(r[0], r[1], r[2], r[3]); D(); }
    }
    return { i, sh, lt, r, f: wholeIn(sh.c, F0), drift };
  }
  // tracked point (assets in tracks/tracks.json) -> screen, for a shot drawn whole in rect f; null when out of range
  function pin(id, sh, lt, f, drift) {
    const tk = trackFor(id, sh.c); if (!tk) return null;
    const ts = at(sh.c, sh.in, lt), rg = trackRange(tk); if (ts < rg[0] - 0.02 || ts > rg[1] + 0.02) return null;
    const p = trackPt(tk, clamp(ts, rg[0], rg[1])); if (!p) return null; const m = VID.meta(sh.c);
    return [f[0] + p[0] * f[2] / m.w, f[1] + p[1] * f[3] / m.h + (drift || 0), clamp(Math.min(ts - rg[0], rg[1] - ts) / 0.3)];
  }
  function brackets(r, lt, col, o) {
    if (VID.collecting || r[3] < 30) return; o = o || {};
    const sn = E.outBack(clamp(lt / 0.28)), off = lerp(34, 0, sn), L = o.len || 46, m = o.m || 22, q = [r[0] + m - off, r[1] + m - off, r[2] - 2 * m + 2 * off, r[3] - 2 * m + 2 * off];
    const c = G(); c.strokeStyle = col || OR; c.lineWidth = o.lw || 6; c.lineCap = 'square'; c.globalAlpha = o.a === undefined ? 1 : o.a;
    [[q[0], q[1], 1, 1], [q[0] + q[2], q[1], -1, 1], [q[0], q[1] + q[3], 1, -1], [q[0] + q[2], q[1] + q[3], -1, -1]].forEach(([px, py, sx, sy]) => { c.beginPath(); c.moveTo(px, py + sy * L); c.lineTo(px, py); c.lineTo(px + sx * L, py); c.stroke(); });
    D();
  }

  // ---------------- type ----------------
  // word-by-word slam with the DPG block wipe. o: {hl (word index), step (s per word), shadow, dim (0..1), q (exit 0..1), fam, w, col, ls, align}
  function words(list, cx, y, size, t, t0, o) {
    o = o || {}; if (VID.collecting) return; const fam = o.fam || 'Mont', f = F(o.w || 900, size, fam), ls = o.ls === undefined ? -3 : o.ls;
    const sp = textW(' ', f, ls), ws = list.map(w => textW(w, f, ls)), tot = ws.reduce((a, b) => a + b, 0) + sp * (list.length - 1);
    let x = o.align === 'left' ? cx : cx - tot / 2; const q = o.q ? E.inC(clamp(o.q)) : 0, step = o.step === undefined ? 0.5 : o.step;
    list.forEach((w, k) => {
      const tw = t0 + k * step, p = clamp((t - tw) / 0.22); if (p <= 0 || q >= 1) { x += ws[k] + sp; return; }
      const isHL = Array.isArray(o.hl) ? o.hl.includes(k) : k === o.hl, hp = isHL ? E.inOutQ(clamp((t - tw - 0.16) / 0.2)) : 0;
      const c = G(); c.beginPath(); c.rect(x - 60, y - size * 1.05 - q * size * 1.2, ws[k] + 120, size * 1.4); c.clip();
      if (hp > 0) { c.fillStyle = o.hlCol || OR; c.fillRect(x - size * 0.11, y - size * 0.84, (ws[k] + size * 0.22) * hp, size * 1.0); }
      const s = lerp(o.s0 || 1.18, 1, E.outQ(p)), rise = (1 - E.outQ(p)) * size * 0.6 - q * size * 1.2;
      c.translate(x + ws[k] / 2, y - size * 0.35 + rise); c.scale(s, s); if (o.rot) c.rotate(o.rot); c.translate(-(x + ws[k] / 2), -(y - size * 0.35));
      setF(f, ls); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      if (hp < 0.6 && o.shadow) { c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 30; c.shadowOffsetY = 3; }
      c.globalAlpha = clamp(p * 3) * (1 - (o.dim || 0) * (hp > 0.6 ? 0 : 1));
      if (o.outline && hp < 0.6) { c.strokeStyle = o.col || WHT; c.lineWidth = 2.5; c.strokeText(w, x, y); }
      else { c.fillStyle = hp > 0.6 ? (o.hlText || BLK) : (o.col || WHT); c.fillText(w, x, y); }
      D(); x += ws[k] + sp;
    });
    return tot;
  }
  // outline that draws left to right, then fills (blueprint titles). p: 0..1 draw, pf: 0..1 fill
  function outlineFill(str, x, y, size, p, pf, o) {
    if (VID.collecting || p <= 0) return; o = o || {}; const f = F(o.w || 800, size, o.fam || 'Mont'), ls = o.ls === undefined ? -2 : o.ls, tw = textW(str, f, ls);
    const x0 = o.align === 'center' ? x - tw / 2 : x;
    const c = G(); c.beginPath(); c.rect(x0 - 10, y - size * 1.1, (tw + 20) * E.inOutS(clamp(p)), size * 1.5); c.clip(); setF(f, ls); c.textAlign = 'left';
    c.strokeStyle = o.col || WHT; c.lineWidth = o.lw || 2.2; c.strokeText(str, x0, y);
    if (pf > 0) { c.globalAlpha = E.outC(clamp(pf)); c.fillStyle = o.fill || o.col || WHT; c.fillText(str, x0, y); }
    D(); return tw;
  }
  const GLY = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&#';
  function flap(str, x, y, size, t, t0, o) {   // split-flap / scramble reveal
    if (VID.collecting) return; o = o || {}; const f = F(o.w || 800, size, o.fam || 'Mono'), ls = o.ls === undefined ? 2 : o.ls, step = o.step || 0.045, spin = o.spin || 0.28;
    const fr = Math.floor(t * 30); let out = '';
    for (let i = 0; i < str.length; i++) { const ti = t0 + i * step; if (t < ti) break; const ch = str[i];
      out += (ch === ' ' || t >= ti + spin) ? ch : GLY[Math.floor(hash(fr * 13.1 + i * 7.7) * GLY.length)]; }
    const c = G(); setF(f, ls); c.fillStyle = o.col || WHT; c.textAlign = o.align || 'left'; c.textBaseline = 'alphabetic';
    if (o.shadow) { c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 18; c.shadowOffsetY = 2; }
    if (o.align === 'center') { const full = textW(str, f, ls); c.textAlign = 'left'; c.fillText(out, x - full / 2, y); } else c.fillText(out, x, y);
    D();
  }
  function typed(str, x, y, f, t, t0, cps, o) {   // typewriter with a blinking cursor
    if (VID.collecting || t < t0) return; o = o || {}; const n = Math.min(str.length, Math.floor((t - t0) * cps)), s = str.slice(0, n);
    const c = G(); setF(f, o.ls || 0); c.fillStyle = o.col || WHT; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText(s, x, y);
    if (o.cursor !== false && (n < str.length || Math.floor(t * 2.5) % 2 === 0) && (o.until === undefined || t < o.until)) { const w = textW(s, f, o.ls || 0); c.fillStyle = o.ccol || OR; c.fillRect(x + w + 4, y - parseFloat(f.split('px')[0].split(' ').pop()) * 0.8, 4, parseFloat(f.split('px')[0].split(' ').pop()) * 0.9); }
    D();
  }
  // editorial serif lines: each rises from a mask with tracking that settles
  function serifLines(lines, x, y, size, lh, t, t0, o) {
    if (VID.collecting) return; o = o || {};
    lines.forEach((ln, i) => {
      const segs = typeof ln === 'string' ? [[ln, o.col || BLK]] : ln, p = clamp((t - t0 - i * (o.stag || 0.16)) / (o.d || 0.7)); if (p <= 0) return;
      const q = o.q ? E.inC(clamp(o.q)) : 0, e = E.outC(p), f = F(o.w || 600, size, 'Corm', o.style === undefined ? 'italic' : o.style), ls = lerp(6, 0, e);
      const yy = y + i * lh, c = G(); c.beginPath(); c.rect(0, yy - size * 1.05, W, size * 1.4); c.clip(); setF(f, ls); c.textBaseline = 'alphabetic';
      const tot = segs.reduce((a, s) => a + textW(s[0], f, ls), 0); let xx = o.align === 'center' ? x - tot / 2 : x;
      c.globalAlpha = e * (1 - q);
      segs.forEach(s => { c.fillStyle = s[1]; c.fillText(s[0], xx, yy + (1 - e) * size * 0.5 - q * size * 0.4); xx += textW(s[0], f, ls); });
      D();
    });
  }
  function wrap(str, f, maxW) { const out = []; let cur = ''; for (const w of str.split(' ')) { const s = cur ? cur + ' ' + w : w; if (cur && textW(s, f, 0) > maxW) { out.push(cur); cur = w; } else cur = s; } if (cur) out.push(cur); return out; }
  function quote(text, by, x, y, maxW, size, t, t0, o) {   // editorial quote: big orange mark, words fade up in order, attribution
    if (VID.collecting) return; o = o || {}; const f = F(600, size, 'Corm', 'italic'), lines = wrap(text, f, maxW), lh = size * 1.18, wps = o.wps || 9;
    const qa = E.outC(clamp((t - t0) / 0.5)), qq = o.q ? E.inC(clamp(o.q)) : 0;
    const c0 = G(); c0.globalAlpha = qa * (1 - qq); setF(F(700, size * 2.2, 'Corm'), 0); c0.fillStyle = OR; c0.textBaseline = 'alphabetic'; c0.fillText('“', x - size * 0.1, y + size * 1.15); D();
    let k = 0; const y0 = y + size * 1.55;
    lines.forEach((ln, li) => { let xx = x; ln.split(' ').forEach(w => { const p = clamp((t - t0 - 0.35 - k / wps) / 0.4); const ww = textW(w + ' ', f, 0);
      if (p > 0) { const c = G(); c.globalAlpha = E.outC(p) * (1 - qq); setF(f, 0); c.fillStyle = o.col || BLK; c.fillText(w, xx, y0 + li * lh + (1 - E.outC(p)) * 10); D(); }
      xx += ww; k++; }); });
    const pb = clamp((t - t0 - 0.35 - k / wps - 0.2) / 0.5); if (pb > 0) caps(by, x, y0 + lines.length * lh + 24, o.bySize || 22, pb * (1 - qq), 0, { w: 700, fam: 'Mono', ls: 3, align: 'left', col: o.byCol || OR, ls0: 0, rise: 6 });
    return { h: size * 1.25 + lines.length * lh + 40, end: t0 + 0.35 + k / wps + 0.7 };
  }

  // ---------------- small parts ----------------
  function chips(list, cx, y, t, t0, o) {
    if (VID.collecting) return; o = o || {}; let sz = o.size || 21;
    if (o.maxW) { const w0 = list.reduce((a, s) => a + textW(s, F(700, sz, 'Mono'), 2) + 54, 0) + 14 * (list.length - 1); if (w0 > o.maxW) sz *= Math.max(0.6, (o.maxW - list.length * 68) / (w0 - list.length * 68)); }
    o = Object.assign({}, o, { size: sz }); const f = F(700, sz, 'Mono'), ws = list.map(s => textW(s, f, 2) + 54), tot = ws.reduce((a, b) => a + b, 0) + 14 * (list.length - 1);
    let x = cx - tot / 2; const a = o.a === undefined ? 1 : o.a, beat = o.beat || 0.5;
    list.forEach((s, k) => { const p = E.outC(clamp((t - t0 - k * 0.15) / 0.35)); if (p > 0) { const hot = lmod(Math.floor(t / beat), list.length) === k ? Math.pow(1 - lmod(t, beat) / beat, 2) : 0, h = (o.size || 21) * 2.1, yy = y + (1 - p) * 30, c = G();
      c.globalAlpha = p * a; c.fillStyle = o.bg || 'rgba(255,255,255,0.09)'; rrect(x, yy - h / 2, ws[k], h, h / 2); c.fill(); if (o.stroke) { c.strokeStyle = o.stroke; c.lineWidth = 2; c.stroke(); }
      c.fillStyle = OR; c.beginPath(); c.arc(x + 22, yy, 5 + 3 * hot, 0, 7); c.fill(); setF(f, 2); c.fillStyle = o.col || WHT; c.textBaseline = 'middle'; c.fillText(s, x + 36, yy + 1); D(); } x += ws[k] + 14; });
  }
  function ripple(x, y, t, t0) { const u = (t - t0) / 0.7; if (u < 0 || u > 1 || VID.collecting) return; const c = G();
    c.strokeStyle = `rgba(255,255,255,${0.85 * (1 - u)})`; c.lineWidth = 4; c.beginPath(); c.arc(x, y, 14 + 60 * E.outC(u), 0, 7); c.stroke();
    c.fillStyle = `rgba(255,255,255,${0.9 * (1 - clamp(u * 2))})`; c.beginPath(); c.arc(x, y, 12, 0, 7); c.fill(); D(); }
  function rail(x0, x1, y, p, o) { if (VID.collecting) return; o = o || {}; const c = G(); c.globalAlpha = o.a === undefined ? 1 : o.a; c.fillStyle = o.bg || 'rgba(255,255,255,0.18)'; c.fillRect(x0, y, x1 - x0, o.h || 5); c.fillStyle = o.col || OR; c.fillRect(x0, y, (x1 - x0) * clamp(p), o.h || 5); D(); }
  // V12: a template that declares DIR.bgSwap shows the business's own background (Style > Background) instead of these
  const swapBg = () => typeof DIR !== 'undefined' && DIR && DIR.bgSwap && window.BGX && BGX.c && typeof BACKDROP === 'function' && BACKDROP();
  function bgKinetic(t, cy, bar) { if (swapBg()) return;
    if (VID.collecting) return; const c = G(); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, DEEP1); g.addColorStop(0.45, BLK); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D();
    const pb = Math.pow(1 - lmod(t, bar) / bar, 3), c2 = G(), gl = c2.createRadialGradient(W / 2, cy, 120, W / 2, cy, 1000);
    gl.addColorStop(0, ORA(0.08 + 0.06 * pb)); gl.addColorStop(1, ORA(0)); c2.fillStyle = gl; c2.fillRect(0, 0, W, H); D();
  }

  // ---------------- logo ----------------
  // the brand mark in a circle of radius rad (story avatars): DPG's 'D', otherwise the logo fitted inside
  function mark(cx, cy, rad, o) {
    if (VID.collecting) return; o = o || {};
    if (BRAND.parts) { part('D', cx - 342 * 0.13 / 2 - 10 * 0.13, cy - 342 * 0.13 / 2 - 12 * 0.13, 0.13); return; }
    if (IMG.mark) { const c = G(); c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.clip(); c.drawImage(IMG.mark, cx - rad, cy - rad, rad * 2, rad * 2); D(); return; }
    const s = Math.min(rad * 1.5 / Math.max(1, IMG.logoW.width), rad * 1.1 / Math.max(1, IMG.logoW.height)), c = G();
    c.drawImage(IMG.logoW, cx - IMG.logoW.width * s / 2, cy - IMG.logoW.height * s / 2, IMG.logoW.width * s, IMG.logoW.height * s); D();
  }
  function part(name, x0, y0, sc, o) {
    o = o || {}; const r = PARTS && PARTS[name]; if (!r || VID.collecting) return;
    const c = G(); c.globalAlpha *= o.a === undefined ? 1 : o.a;
    if (o.clipH !== undefined) { c.beginPath(); c.rect(x0 + r[0] * sc, y0 + r[1] * sc, r[2] * sc, r[3] * sc * o.clipH); c.clip(); }
    if (o.clipW !== undefined) { c.beginPath(); c.rect(x0 + r[0] * sc, y0 + r[1] * sc - 4, r[2] * sc * o.clipW, r[3] * sc + 8); c.clip(); }
    c.drawImage(o.img || IMG.logoW, r[0], r[1], r[2], r[3], x0 + r[0] * sc + (o.dx || 0), y0 + r[1] * sc + (o.dy || 0), r[2] * sc, r[3] * sc); D();
  }
  // the letters rise like pavers being set, the bar draws, the words slide in, the tagline fades up
  function logoBuild(cx, cy, w, t0, t, o) {
    o = o || {};
    if (!BRAND.parts) {   // any other logo: wipes in left to right while it rises into place
      if (VID.collecting) return; const sp = o.speed || 1, p = clamp((t - t0) / (0.95 / sp)); if (p <= 0) return;
      const [lw, h] = logoBox(w), e = o.soft ? E.outC(p) : E.outBack(p), c = G(); c.globalAlpha *= (o.a === undefined ? 1 : o.a) * clamp(p * 2.2);
      c.beginPath(); c.rect(cx - lw / 2 - 30, cy - h / 2 - 60, (lw + 60) * E.outQ(clamp(p * 1.3)), h + 120); c.clip();
      c.translate(cx, cy + (1 - e) * h * 0.3); c.drawImage(o.img || IMG.logoW, -lw / 2, -h / 2, lw, h); D(); return; } const sc = w / 2048, x0 = cx - w / 2, y0 = cy - 230 * sc, img = o.img, a = o.a === undefined ? 1 : o.a, sp = o.speed || 1;
    ['D', 'P', 'G'].forEach((n, k) => { const p = clamp((t - t0 - k * 0.12 / sp) / (0.3 / sp)); if (p <= 0) return; const e = o.soft ? E.outC(p) : E.outBack(p);
      part(n, x0, y0, sc, { img, dy: (1 - e) * (o.soft ? 40 : 480) * sc, a: clamp(p * 3) * a }); });
    const pb = clamp((t - t0 - 0.42 / sp) / (0.25 / sp)); if (pb > 0) part('BAR', x0, y0, sc, { img, clipH: E.outQ(pb), a });
    ['OUTDOOR', 'LIVING'].forEach((n, k) => { const p = clamp((t - t0 - (0.55 + k * 0.1) / sp) / (0.32 / sp)); if (p > 0) part(n, x0, y0, sc, { img, clipW: E.outQ(p), dx: (1 - E.outQ(p)) * -30, a }); });
    const pt = clamp((t - t0 - 0.85 / sp) / (0.4 / sp)); if (pt > 0) part('TAG', x0, y0, sc, { img, a: E.outC(pt) * a, dy: (1 - E.outC(pt)) * 16 });
  }

  // ---------------- grunge ----------------
  function bgGrunge(t, seed) { if (swapBg()) return;
    if (VID.collecting) return; fillScreen('#0D0C0B'); const c = G(); const r = rng(seed || 7);
    for (let i = 0; i < 28; i++) { const fl = 0.85 + 0.15 * Math.sin(t * 3 + i); c.fillStyle = `rgba(255,255,255,${(0.018 + r() * 0.03) * fl})`; c.beginPath(); c.ellipse(r() * W, r() * H, 40 + r() * 170, 20 + r() * 90, r() * 3, 0, 7); c.fill(); }
    D();
  }
  function jagPath(c, x0, x1, y, amp, seed, closeTo) { const r = rng(seed); c.lineTo(x0, y); for (let x = x0; x <= x1 + 13; x += 14) c.lineTo(Math.min(x, x1), y + (r() - 0.5) * amp * 2 + (r() < 0.1 ? amp * 1.4 * (r() < 0.5 ? -1 : 1) : 0)); }
  function mount(r, rot, seed, o) {   // torn off-white paper behind a shot, with two pieces of tape
    if (VID.collecting || r[3] < 30) return; o = o || {}; const pad = o.pad || 18, x0 = r[0] + 24 - pad, x1 = r[0] + r[2] - 24 + pad, y0 = r[1] - pad, y1 = r[1] + r[3] + pad;
    const c = G(); c.translate(W / 2, r[1] + r[3] / 2); c.rotate(rot); c.translate(-W / 2, -(r[1] + r[3] / 2));
    c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 30; c.fillStyle = o.col || '#EDE6DA'; c.beginPath(); c.moveTo(x0, y0);
    jagPath(c, x0, x1, y0, 7, seed, 0); c.lineTo(x1, y1); const rr = rng(seed + 50); for (let x = x1; x >= x0 - 13; x -= 14) c.lineTo(Math.max(x, x0), y1 + (rr() - 0.5) * 16); c.closePath(); c.fill(); D();
  }
  function tape(x, y, rot, a) { if (VID.collecting) return; const c = G(); c.globalAlpha = a === undefined ? 1 : a; c.translate(x, y); c.rotate(rot); c.fillStyle = 'rgba(232,222,200,0.84)'; c.fillRect(-82, -22, 164, 44); c.fillStyle = 'rgba(0,0,0,0.06)'; for (let i = 0; i < 6; i++) c.fillRect(-82 + i * 28, -22, 2, 44); D(); }
  function paint(cx, cy, w, h, rot, p, seed, col) {   // rough paint stroke that wipes in left to right
    if (VID.collecting || p <= 0) return; const c = G(); c.translate(cx, cy); c.rotate(rot); c.beginPath(); c.rect(-w / 2 - 20, -h, (w + 40) * E.outQ(clamp(p)), h * 2); c.clip();
    c.fillStyle = col || OR; c.beginPath(); c.moveTo(-w / 2, -h / 2); jagPath(c, -w / 2, w / 2, -h / 2, 7, seed); c.lineTo(w / 2, h / 2); const r = rng(seed + 9); for (let x = w / 2; x >= -w / 2 - 13; x -= 14) c.lineTo(Math.max(x, -w / 2), h / 2 + (r() - 0.5) * 16); c.closePath(); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 18; i++) { const rr = rng(seed + i); c.fillRect(-w / 2 + rr() * w, -h / 2 + rr() * h, 2 + rr() * 30, 2); } D();
  }
  function stamp(cx, cy, rad, ring, center, p, o) {   // ink stamp that thuds on: scale 1.7 -> 1, slight rotation
    if (VID.collecting || p <= 0) return; o = o || {}; const e = E.outBack(clamp(p)), s = lerp(1.7, 1, e), a = clamp(p * 4) * (o.a === undefined ? 0.95 : o.a);
    const c = G(); c.translate(cx, cy); c.rotate((o.rot || 0.18) + (1 - e) * 0.3); c.scale(s, s); c.globalAlpha = a; c.strokeStyle = o.col || OR; c.fillStyle = o.col || OR;
    c.lineWidth = 6; c.beginPath(); c.arc(0, 0, rad, 0, 7); c.stroke(); c.lineWidth = 3; c.beginPath(); c.arc(0, 0, rad * 0.82, 0, 7); c.stroke();
    setF(F(800, rad * 0.19, 'Mont'), 3); c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 0; i < ring.length; i++) { c.save(); c.rotate(i / ring.length * Math.PI * 2); c.fillText(ring[i], 0, -rad * 0.91); c.restore(); }
    setF(F(400, rad * 0.55, 'Bebas'), 2); c.fillText(center, 0, rad * 0.04); D();
  }
  function label(str, cx, cy, size, rot, p, o) {   // rough orange label slapped on (grunge CTA)
    if (VID.collecting || p <= 0) return; o = o || {}; const f = F(400, size, 'Bebas'), tw = textW(str, f, 3), e = E.outBack(clamp(p)), s = lerp(1.4, 1, e);
    const c = G(); c.translate(cx, cy); c.rotate(rot); c.scale(s, s); c.globalAlpha = clamp(p * 4); c.fillStyle = o.bg || OR; const w = tw + size * 0.9, h = size * 1.35;
    c.beginPath(); c.moveTo(-w / 2, -h / 2); jagPath(c, -w / 2, w / 2, -h / 2, 3, 33); c.lineTo(w / 2, h / 2); c.lineTo(-w / 2, h / 2); c.closePath(); c.fill();
    setF(f, 3); c.fillStyle = o.col || BLK; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(str, 0, size * 0.06); D();
  }
  function note(str, x, y, size, p, o) { o = o || {}; hand(str, x, y, size, p, { col: o.col || WHT, rot: o.rot || -0.04, align: o.align, q: o.q }); }

  // ---------------- blueprint ----------------
  function bgGrid(t) { if (swapBg()) return;
    if (VID.collecting) return; fillScreen(BLK); const c = G(), off = lmod(t * 6, 30);
    c.strokeStyle = 'rgba(255,255,255,0.05)'; c.lineWidth = 1;
    for (let x = -30 + off; x <= W; x += 30) { c.beginPath(); c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, H); c.stroke(); }
    for (let y = -30 + off; y <= H; y += 30) { c.beginPath(); c.moveTo(0, y + 0.5); c.lineTo(W, y + 0.5); c.stroke(); }
    c.strokeStyle = 'rgba(255,255,255,0.1)'; for (let x = -150 + lmod(t * 6, 150); x <= W; x += 150) { c.beginPath(); c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, H); c.stroke(); }
    D();
  }
  function crop(r, p, o) {
    if (VID.collecting || p <= 0) return; o = o || {}; const L = 22 * E.outC(clamp(p)), g = 8, c = G(); c.strokeStyle = o.col || 'rgba(255,255,255,0.85)'; c.lineWidth = 2;
    [[r[0], r[1]], [r[0] + r[2], r[1]], [r[0], r[1] + r[3]], [r[0] + r[2], r[1] + r[3]]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x - g - L, y); c.lineTo(x - g, y); c.moveTo(x + g, y); c.lineTo(x + g + L, y); c.moveTo(x, y - g - L); c.lineTo(x, y - g); c.moveTo(x, y + g); c.lineTo(x, y + g + L); c.stroke(); });
    D();
  }
  function dim(x0, x1, y, p, lab, o) {   // dimension line that draws out from the centre, arrowheads, centred label
    if (VID.collecting || p <= 0) return; o = o || {}; const e = E.inOutC(clamp(p)), cx = (x0 + x1) / 2, a = cx - (cx - x0) * e, b = cx + (x1 - cx) * e, c = G();
    c.strokeStyle = o.col || OR; c.lineWidth = 2; c.beginPath(); c.moveTo(a, y); c.lineTo(b, y); c.stroke();
    if (e > 0.98) [[x0, 1], [x1, -1]].forEach(([x, d]) => { c.beginPath(); c.moveTo(x + d * 14, y - 8); c.lineTo(x, y); c.lineTo(x + d * 14, y + 8); c.stroke(); c.beginPath(); c.moveTo(x, y - 14); c.lineTo(x, y + 14); c.stroke(); });
    if (lab) { const f = F(700, 18, 'Mono'), tw = textW(lab, f, 3); c.fillStyle = BLK; c.fillRect(cx - tw / 2 - 12, y - 12, tw + 24, 24); c.globalAlpha = clamp((p - 0.5) * 2); setF(f, 3); c.fillStyle = o.lcol || WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(lab, cx + 1.5, y + 1); }
    D();
  }
  // tracked leader: ring at the point, elbow line to a label row (ly) at x = lx; idx tag + mono label
  function leader(pt, lx, ly, lab, idx, p, o) {
    if (VID.collecting || !pt || p <= 0) return; o = o || {}; const [px, py, nf] = pt, a = (o.a === undefined ? 1 : o.a) * (nf === undefined ? 1 : nf), col = o.col || OR;
    const c = G(); c.globalAlpha = a; c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 2.5;
    const pr = E.outBack(clamp(p * 3)); c.beginPath(); c.arc(px, py, 7 * pr, 0, 7); c.fill(); c.globalAlpha = a * 0.6; c.beginPath(); c.arc(px, py, 10 + 10 * pr + 4 * Math.sin(p * 9), 0, 7); c.stroke(); c.globalAlpha = a;
    const L1 = Math.abs(ly - py), L2 = Math.abs(lx - px), tot = L1 + L2, dl = tot * E.inOutC(clamp((p - 0.15) / 0.45));
    c.beginPath(); c.moveTo(px, py); const yy = py + Math.sign(ly - py) * Math.min(dl, L1); c.lineTo(px, yy); if (dl > L1) c.lineTo(px + Math.sign(lx - px) * (dl - L1), ly); c.stroke();
    const pt2 = clamp((p - 0.55) / 0.35);
    if (pt2 > 0) { const f = F(700, o.size || 24, 'Mono'), right = o.right !== undefined ? o.right : lx >= px, tag = idx || '', tf = F(800, (o.size || 24) * 0.8, 'Mono'), tgw = tag ? textW(tag, tf, 1) + 18 : 0, tw = textW(lab, f, 3);
      const bx = right ? lx + 8 : lx - 8 - (tgw + tw + 22); c.globalAlpha = a * E.outC(pt2);
      if (tag) { c.fillStyle = col; c.fillRect(bx, ly - 17, tgw, 34); setF(tf, 1); c.fillStyle = BLK; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(tag, bx + 9, ly + 1); }
      c.fillStyle = 'rgba(11,11,11,0.85)'; c.fillRect(bx + tgw, ly - 17, tw + 22, 34); setF(f, 3); c.fillStyle = WHT; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(lab, bx + tgw + 11, ly + 1); }
    D();
  }
  function steps(list, active, y, t, p, o) {
    if (VID.collecting || p <= 0) return; o = o || {}; const n = list.length, gw = (W - 144 - (n - 1) * 24) / n, c = G(); c.globalAlpha = clamp(p);
    list.forEach((st, i) => { const x = 72 + i * (gw + 24), on = i === active, done = i < active;
      c.fillStyle = on ? OR : done ? ORA(0.55) : WA(0.35); setF(F(700, 18, 'Mono'), 3); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText('0' + (i + 1), x, y);
      setF(F(800, 25, 'Mont'), 1.5); c.fillStyle = on ? WHT : WA(0.45); c.fillText(st, x, y + 36);
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x, y + 52, gw, 4); c.fillStyle = OR; c.fillRect(x, y + 52, gw * (done ? 1 : on ? clamp(o.prog === undefined ? 1 : o.prog) : 0), 4); });
    D();
  }

  // ---------------- editorial ----------------
  function bgPaper(t) { if (swapBg()) return; if (VID.collecting) return; fillScreen(PAPER); const c = G(); const g = c.createRadialGradient(W / 2, H * 0.42, 200, W / 2, H / 2, 1300); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(120,100,70,0.12)'); c.fillStyle = g; c.fillRect(0, 0, W, H); D(); }

  // ---------------- outros (o = seconds into the outro) ----------------
  function ctaBlock(o, y, t0, style) {
    const pp = clamp((o - t0) / 0.4), press = o > t0 + 0.9 && o < t0 + 1.12 ? 0.94 : 1;
    if (style === 'grunge') label(CONTACT.cta, W / 2, y, Math.min(54, 54 * 940 / (textW(CONTACT.cta, F(400, 54, 'Bebas'), 3) + 49)), -0.025, pp);
    else if (pp > 0) { const c = G(); c.translate(W / 2, y); c.scale(press, press); c.translate(-W / 2, -y); D(); pill(CONTACT.cta, W / 2, y, { size: Math.min(32, fitSize(CONTACT.cta, 800, 900, 32, 'Mont', 2.5)), p: pp, bg: OR, col: BLK }); }
    if (style !== 'grunge' && style !== 'editorial') ripple(W / 2 + 250, y + 10, o, t0 + 0.9);
    const ph = CONTACT.phone, n = Math.floor(clamp((o - t0 - 0.4) / 0.8) * ph.length), dark = style !== 'editorial';
    if (n > 0) caps(ph.slice(0, n), W / 2, y + 130, 72, 1, 0, { w: 800, ls: 1, ls0: 0, rise: 0, col: dark ? WHT : BLK });
    caps(CONTACT.web, W / 2, y + 196, 32, clamp((o - t0 - 1.3) / 0.4), 0, { w: 700, ls: 5, col: OR, maxW: 960 });
    caps(footLine('  ·  '), W / 2, y + 270, 20, clamp((o - t0 - 1.5) / 0.4), 0, { w: 500, fam: 'Mono', ls: 2, col: dark ? WA(0.6) : INKA(0.55), maxW: 980 });
  }
  function outro(style, o, tag) {
    if (style === 'kinetic') {
      logoBuild(W / 2, 700, 860, 0.3, o);
      caps(tag, W / 2, 860, 24, clamp((o - 1.3) / 0.4), 0, { w: 700, fam: 'Mono', ls: 4, col: WA(0.8), maxW: 960 });
      ctaBlock(o, 980, 1.5, 'kinetic');
    } else if (style === 'grunge') {
      const p = clamp((o - 0.25) / 0.35), e = E.outBack(p), s = lerp(1.5, 1, e);
      if (p > 0 && !VID.collecting) { const c = G(), gi = BRAND.parts && IMG.grunge ? IMG.grunge : IMG.logoW, [gw, gh] = BRAND.parts ? [860, 860 * 460 / 2048] : logoBox(860); c.globalAlpha = clamp(p * 3); c.translate(W / 2, 700); c.scale(s, s); c.rotate(-0.02 * (1 - e)); c.drawImage(gi, -gw / 2, -gh / 2, gw, gh); D(); }
      caps(tag, W / 2, 880, 26, clamp((o - 0.9) / 0.4), 0, { w: 700, fam: 'Mono', ls: 4, col: WA(0.85), maxW: 960 });
      ctaBlock(o, 1000, 1.2, 'grunge');
    } else if (style === 'blueprint') {
      const [bw, bh] = logoBox(860), sc = bh / 460, y0 = 700 - bh / 2, r = [W / 2 - bw / 2 - 20, y0 - 40, bw + 40, bh + 80];
      crop(r, clamp(o / 0.4));
      const scan = clamp((o - 0.2) / 0.9), c = G(); if (!VID.collecting && scan > 0) { c.beginPath(); c.rect(r[0], r[1], r[2] * E.inOutS(scan), r[3]); c.clip(); c.drawImage(IMG.logoW, W / 2 - bw / 2, y0, bw, bh); } D();
      if (scan > 0 && scan < 1 && !VID.collecting) { const c2 = G(); c2.fillStyle = OR; c2.fillRect(r[0] + r[2] * E.inOutS(scan) - 2, r[1], 4, r[3]); D(); }
      dim(W / 2 - Math.max(430, bw / 2), W / 2 + Math.max(430, bw / 2), r[1] - 34, clamp((o - 0.9) / 0.5), tag);
      ctaBlock(o, 1000, 1.4, 'blueprint');
    } else {   // editorial
      logoBuild(W / 2, 680, 820, 0.25, o, { img: IMG.logoB, soft: true, speed: 0.8 });
      serifLines([tag], W / 2, 870, Math.min(54, fitSize(tag, 600, 960, 54, 'Corm', 0, 'italic')), 60, o, 1.3, { align: 'center', col: BLK });
      ctaBlock(o, 990, 1.6, 'editorial');
    }
  }
  return { init, ar, wholeIn, clip, shots, shotAt, band, pin, brackets, words, outlineFill, flap, typed, serifLines, wrap, quote, chips, ripple, rail, bgKinetic,
    part, mark, logoBuild, ctaBlock, bgGrunge, mount, tape, paint, stamp, label, note, bgGrid, crop, dim, leader, steps, bgPaper, outro, G, D, lmod, at };
})();
