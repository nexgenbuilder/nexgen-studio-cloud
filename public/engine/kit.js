'use strict';
/* DPG footage kit — timeline helpers, type styles and overlays shared by every video.
   Readable text stays inside SAFE (set in core.js per format). */
// the brand's contact block (the studio replaces these per client): badge · since · licence line, CTA, tagline, service area
const CONTACT = { phone: '(925) 239-5645', web: 'DPGOUTDOORLIVING.COM', lic: 'CA LIC. #1073434', since: 'SINCE 1990', badge: 'AWARD-WINNING',
  cta: 'BOOK A DESIGN CONSULTATION', tagline: 'Award-winning design & build.', area: 'THE GREATER BAY AREA' };
// 'AWARD-WINNING  ·  SINCE 1990  ·  CA LIC. #1073434' with separator a after the first part and b after the second
function footLine(a, b) { const p = [CONTACT.badge, CONTACT.since, CONTACT.lic].filter(Boolean); return p.map((x, i) => (i === 0 ? '' : i === 1 ? a : (b === undefined ? a : b)) + x).join(''); }
const tagCaps = () => (CONTACT.tagline || '').replace(/[.!]+$/, '').toUpperCase();   // 'AWARD-WINNING DESIGN & BUILD'
const ctaSentence = () => CONTACT.cta.charAt(0) + CONTACT.cta.slice(1).toLowerCase();
// project names by clip; a Clip Studio upload carries its own (meta.project)
const PROJECTS = { c01: 'DUSK PAVILION', c02: 'HILLSIDE VILLA', c03: 'MODERN POOL RETREAT', c04: 'MODERN POOL RETREAT', c05: 'MODERN POOL RETREAT', c06: 'THE ENTERTAINER',
  c07: 'THE ENTERTAINER', c08: 'COURTYARD ESTATE', c09: 'STONE OVEN TERRACE', c10: 'TOWNHOME TERRACE', c11: 'HILLSIDE VILLA', c12: 'DUSK PAVILION', w24: 'THE PORTFOLIO',
  v01: 'DUSK PAVILION', v02: 'COURTYARD ESTATE', v03: 'THE ENTERTAINER', v04: 'HILLSIDE VILLA', v05: 'STONE OVEN TERRACE' };
function projOf(c) { const m = VID.meta(c); return (m && m.project) || PROJECTS[c] || ''; }

// ---------- timeline ----------
const ramp = (t, a, d) => clamp((t - a) / d);
const win = (t, a, b, fi, fo) => Math.min(ramp(t, a, fi), 1 - ramp(t, b - fo, fo));
const pulse = (t, a, d) => { const u = (t - a) / d; return u < 0 || u > 1 ? 0 : Math.sin(Math.PI * u); };

// ---------- overlays ----------
function scrim(y0, y1, a0, a1, rgb) {
  if (VID.collecting) return;
  rgb = rgb || '0,0,0'; const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, `rgba(${rgb},${a0})`); g.addColorStop(1, `rgba(${rgb},${a1})`);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = g; ctx.fillRect(0, Math.min(y0, y1), W, Math.abs(y1 - y0)); ctx.restore();
}
function scrimX(x0, x1, a0, a1, rgb) {   // horizontal gradient (left-side text plates in 16:9)
  if (VID.collecting) return;
  rgb = rgb || '0,0,0'; const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, `rgba(${rgb},${a0})`); g.addColorStop(1, `rgba(${rgb},${a1})`);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = g; ctx.fillRect(Math.min(x0, x1), 0, Math.abs(x1 - x0), H); ctx.restore();
}
function wash(col, a) { if (a <= 0) return; fillScreen(col, a); }
function band(y0, y1, a, rgb) {   // soft dark plate behind a block of text
  if (a <= 0 || VID.collecting) return; rgb = rgb || '0,0,0';
  const pad = 170, g = ctx.createLinearGradient(0, y0 - pad, 0, y1 + pad);
  g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(0.3, `rgba(${rgb},${0.55 * a})`); g.addColorStop(0.7, `rgba(${rgb},${0.55 * a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = g; ctx.fillRect(0, y0 - pad, W, y1 - y0 + 2 * pad); ctx.restore();
}
function letterbox(p, ratio) {   // cinematic bars that close in/out (p 0..1), ratio e.g. 2.39
  if (p <= 0) return; const ih = W / (ratio || 2.39), bh = Math.max(0, (H - ih) / 2) * E.inOutC(p);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = BLK; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh); ctx.restore();
}
function progressBar(t, dur, o) {  // thin social progress line at the very top
  o = o || {}; const y = o.y === undefined ? 0 : o.y;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(0, y, W, o.h || 6);
  ctx.fillStyle = o.col || OR; ctx.fillRect(0, y, W * clamp(t / dur), o.h || 6); ctx.restore();
}

// ---------- type ----------
function serif(str, x, y, size, p, q, o) {   // elegant italic serif: fade + rise + tracking settles
  o = o || {}; q = q || 0; if (p <= 0 || q >= 1) return;
  const e = E.outC(clamp(p)), x2 = E.inC(clamp(q));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y);
  setF(F(o.w || 600, size, 'Corm', o.style === undefined ? 'italic' : o.style), lerp(o.ls0 === undefined ? 8 : o.ls0, o.ls || 0, e));
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'alphabetic';
  ctx.globalAlpha = e * (1 - x2) * (o.alpha === undefined ? 1 : o.alpha);
  if (o.shadow !== false) { ctx.shadowColor = o.shadowCol || 'rgba(0,0,0,0.5)'; ctx.shadowBlur = o.shadowBlur || 34; ctx.shadowOffsetY = 3; }
  ctx.fillStyle = o.col || WHT; ctx.fillText(str, x, y + (1 - e) * (o.rise === undefined ? 26 : o.rise) - x2 * 14);
  ctx.restore();
}
function caps(str, x, y, size, p, q, o) {     // tracked uppercase label
  o = o || {}; q = q || 0; if (p <= 0 || q >= 1) return;
  const e = E.outC(clamp(p)), x2 = E.inC(clamp(q)), ls = o.ls === undefined ? 6 : o.ls;
  if (o.maxW) size = Math.min(size, fitSize(str, o.w || 700, o.maxW, size, o.fam || 'Mont', ls));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y);
  setF(F(o.w || 700, size, o.fam || 'Mont'), lerp(ls + (o.ls0 === undefined ? 6 : o.ls0), ls, e));
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'alphabetic';
  ctx.globalAlpha = e * (1 - x2) * (o.alpha === undefined ? 1 : o.alpha);
  if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = 24; ctx.shadowOffsetY = 2; }
  ctx.fillStyle = o.col || WHT; ctx.fillText(str, x, y + (1 - e) * (o.rise === undefined ? 12 : o.rise));
  ctx.restore();
}
function rule(cx, y, w, p, o) {               // hairline that grows from the centre (or from the left with o.from='l')
  o = o || {}; if (p <= 0) return; const e = E.inOutC(clamp(p)), q = o.q ? E.inC(clamp(o.q)) : 0;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); ctx.globalAlpha = (o.alpha === undefined ? 1 : o.alpha) * (1 - q);
  ctx.fillStyle = o.col || WHT;
  if (o.from === 'l') ctx.fillRect(cx, y, w * e, o.h || 2); else ctx.fillRect(cx - w * e / 2, y, w * e, o.h || 2);
  ctx.restore();
}
function pill(str, cx, cy, o) {
  o = o || {}; const p = o.p === undefined ? 1 : o.p; if (p <= 0) return;
  const size = o.size || 32, ls = o.ls === undefined ? 2.5 : o.ls, f = F(o.w || 800, size, o.fam || 'Mont');
  const tw = textW(str, f, ls), pw = tw + (o.padx || 70), ph = size * (o.hmul || 2.2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y);
  const s = lerp(0.7, 1, E.outBack(clamp(p))); ctx.globalAlpha = clamp(p * 3) * (o.alpha === undefined ? 1 : o.alpha) * (1 - (o.q ? E.inC(o.q) : 0));
  ctx.translate(cx, cy); ctx.scale(s, s);
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = 3; rrect(-pw / 2, -ph / 2, pw, ph, ph / 2); ctx.stroke(); }
  else { ctx.fillStyle = o.bg || OR; rrect(-pw / 2, -ph / 2, pw, ph, o.radius === undefined ? ph / 2 : o.radius); ctx.fill(); }
  setF(f, ls); ctx.fillStyle = o.col || BLK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, ls / 2, size * 0.06);
  ctx.restore();
}
function kicker(str, x, y, p, o) {            // orange square + mono label
  o = o || {}; if (p <= 0) return; const q = o.q || 0; if (q >= 1) return;
  let size = o.size || 28; const ls = o.ls === undefined ? 4 : o.ls; if (o.maxW) size = Math.min(size, fitSize(str, 700, o.maxW - size, size, 'Mono', ls));
  const col = o.col || WHT, s = Math.round(size * 0.42), f = F(700, size, 'Mono');
  let x0 = x; if (o.align === 'center') x0 = x - (textW(str, f, ls) + s + 14) / 2;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); ctx.globalAlpha *= clamp(p * 4) * (1 - E.inC(q)); ctx.fillStyle = o.sq || OR; ctx.fillRect(x0, y - Math.round(size * 0.36) - s / 2 + 1, s, s); ctx.restore();
  T([[str, col]], x0 + s + 14, y, f, { ls, p: E.outC(clamp(p * 1.3)), q, shadow: o.shadow });
}
// stacked heavy headline. lines: array of strings or [[seg,col],...]; hlWord: {line, word} gets an orange block
function headline(lines, cx, y0, t, a, b, o) {
  o = o || {}; const w = o.w || 900, fam = o.fam || 'Mont', ls = o.ls === undefined ? -1.5 : o.ls, maxW = o.maxW || (SAFE.x1 - SAFE.x0 - 20);
  const strs = lines.map(l => typeof l === 'string' ? l : l.map(s => s[0]).join(''));
  const size = o.size || Math.min(o.max || 150, ...strs.map(s => fitSize(s, w, maxW, 400, fam, ls)));
  const lh = size * (o.lh || 1.0), stag = o.stag === undefined ? 0.07 : o.stag;
  strs.forEach((s, i) => {
    const p = ramp(t, a + i * stag, o.inD || 0.42), q = b === undefined ? 0 : ramp(t, b + i * stag * 0.5, o.outD || 0.28);
    if (p <= 0 || q >= 1) return;
    const y = y0 + i * lh;
    let segs = typeof lines[i] === 'string' ? [[lines[i], o.col || WHT]] : lines[i];
    if (o.hl && o.hl.line === i) {   // orange block behind the line, wipes in after the text lands
      const hp = E.inOutQ(ramp(t, a + i * stag + (o.hlDelay || 0.25), 0.3)) * (1 - E.inC(q));
      const tw = textW(s, F(w, size, fam), ls), x0 = (o.align === 'left' ? cx : cx - tw / 2) - size * 0.12;
      if (hp > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); ctx.fillStyle = o.hlCol || OR; ctx.fillRect(x0, y - size * 0.86, (tw + size * 0.24) * hp, size * 1.0); ctx.restore(); }
      if (hp > 0.6) segs = segs.map(sg => [sg[0], o.hlText || BLK]);
    }
    T(segs, cx, y, F(w, size, fam), { align: o.align || 'center', ls, p, q, shadow: o.shadow === false || (o.hl && o.hl.line === i) ? null : ['rgba(0,0,0,0.45)', 36, 4] });
  });
  return { size, lh, bottom: y0 + (strs.length - 1) * lh };
}
// social caption: words pop in one by one; `hot` index list renders orange; boxed = black boxes behind lines
function captions(words, cx, y, t, a, rate, o) {
  o = o || {}; const size = o.size || 64, f = F(o.w || 800, size, o.fam || 'Mont'), ls = o.ls || 0, maxW = o.maxW || 900;
  // greedy line wrap
  const lines = []; let cur = []; let cw = 0; const sp = textW(' ', f, ls);
  for (const wd of words) { const ww = textW(wd, f, ls); if (cur.length && cw + sp + ww > maxW) { lines.push(cur); cur = []; cw = 0; } cur.push(wd); cw += (cur.length > 1 ? sp : 0) + ww; }
  if (cur.length) lines.push(cur);
  const lh = size * 1.22; let k = 0; const q = o.q || 0; if (q >= 1) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); setF(f, ls); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  lines.forEach((ln, li) => {
    const lw = ln.reduce((s, wd, i) => s + textW(wd, f, ls) + (i ? sp : 0), 0); let x = cx - lw / 2; const yy = y + li * lh;
    if (o.boxed) {   // box grows with the words shown so far
      let shown = 0, wsum = 0; for (let i = 0; i < ln.length; i++) { if (t >= a + (k + i) / rate) { shown++; wsum += textW(ln[i], f, ls) + (i ? sp : 0); } }
      if (shown) { ctx.globalAlpha = 1 - E.inC(q); ctx.fillStyle = o.boxCol || 'rgba(11,11,11,0.86)'; rrect(x - size * 0.28, yy - size * 0.92, wsum + size * 0.56, size * 1.18, 10); ctx.fill(); }
    }
    ln.forEach((wd, i) => {
      const ti = a + k / rate, p = clamp((t - ti) / 0.16);
      if (p > 0) {
        const s = lerp(0.6, 1, E.outBack(p)), ww = textW(wd, f, ls);
        ctx.save(); ctx.translate(x + ww / 2, yy - size * 0.35); ctx.scale(s, s); ctx.translate(-(x + ww / 2), -(yy - size * 0.35));
        ctx.globalAlpha = clamp(p * 2) * (1 - E.inC(q));
        if (!o.boxed) { ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 3; }
        ctx.fillStyle = (o.hot && o.hot.includes(k)) ? OR : (o.col || WHT); ctx.fillText(wd, x, yy); ctx.restore();
      }
      x += textW(wd, f, ls) + sp; k++;
    });
  });
  ctx.restore();
  return { lines: lines.length, lh, end: a + words.length / rate };
}
// rolling odometer: target like '28,000,000'; p 0..1 (columns settle right-to-left)
function odo(target, x, y, size, p, o) {
  o = o || {}; if (p <= 0 || VID.collecting) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); setF(F(o.w || 900, size, o.fam || 'Mont'), o.ls || 0);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const dw = ctx.measureText('0').width * 1.02, chars = target.split('');
  const widths = chars.map(c => /\d/.test(c) ? dw : ctx.measureText(c).width + (o.ls || 0));
  const tot = widths.reduce((a, b) => a + b, 0); let cx = (o.align === 'left' ? x : o.align === 'right' ? x - tot : x - tot / 2);
  const asc = ctx.measureText('0').actualBoundingBoxAscent, lh = asc * 1.35;
  if (o.shadow) { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 40; }
  ctx.beginPath(); ctx.rect(cx - 30, y - asc - asc * 0.2, tot + 60, asc * 1.42); ctx.clip();
  const digits = chars.filter(c => /\d/.test(c)).length; let di = 0;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i], wdt = widths[i], mx = cx + wdt / 2;
    ctx.fillStyle = o.col || WHT;
    if (/\d/.test(c)) {
      const kk = digits - 1 - di, spins = (o.spins || 2) + kk * 0.6, dur = 0.55 + 0.45 * (di / Math.max(1, digits - 1));
      const pc = E.outQ(clamp(p / dur)), val = (+c + 10 * Math.round(spins)) * pc, fl = Math.floor(val), fr = val - fl;
      ctx.globalAlpha = clamp(p * 6) * (o.alpha === undefined ? 1 : o.alpha);
      ctx.fillText(String(fl % 10), mx, y - fr * lh); ctx.fillText(String((fl + 1) % 10), mx, y - fr * lh + lh);
      di++;
    } else { ctx.globalAlpha = clamp(p * 4) * (o.alpha === undefined ? 1 : o.alpha); ctx.fillText(c, mx, y); }
    cx += wdt;
  }
  ctx.restore(); return tot;
}
// annotation: dot at (px,py), leader to the label box near (lx,ly); box kept inside SAFE
function callout(px, py, lx, ly, label, p, o) {
  o = o || {}; if (p <= 0) return; const q = o.q || 0; if (q >= 1) return;
  const col = o.col || OR, a = (o.alpha === undefined ? 1 : o.alpha) * (1 - E.inC(clamp(q)));
  const size = o.size || 28, f = F(o.w || 700, size, o.fam || 'Mono'), ls = o.ls === undefined ? 2 : o.ls, tw = textW(label, f, ls), bw = tw + 34, bh = size * 1.8;
  const right = lx >= px, bx = clamp(right ? lx : lx - bw, SAFE.x0, SAFE.x1 - bw), ex = right ? bx : bx + bw;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); ctx.globalAlpha = a;
  const pd = E.outBack(clamp(p * 4));
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 10;
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, py, 10 * pd, 0, 7); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 10 + 13 * pd, 0, 7); ctx.globalAlpha = a * 0.55; ctx.stroke(); ctx.globalAlpha = a;
  const pl = E.inOutC(clamp((p - 0.15) / 0.45));
  if (pl > 0) { ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(lerp(px, ex, pl), lerp(py, ly, pl)); ctx.stroke(); }
  ctx.restore();
  const pt = clamp((p - 0.5) / 0.5);
  if (pt > 0) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); ctx.globalAlpha = a * E.outC(pt);
    const w = bw * E.outQ(pt), x0 = right ? bx : bx + bw - w;
    ctx.fillStyle = o.bg || 'rgba(11,11,11,0.86)'; rrect(x0, ly - bh / 2, w, bh, 6); ctx.fill();
    ctx.beginPath(); ctx.rect(x0, ly - bh / 2, w, bh); ctx.clip();
    setF(f, ls); ctx.fillStyle = o.tcol || WHT; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(label, bx + 17, ly + 1);
    ctx.restore();
  }
}
// giant condensed word with footage inside the letters (drawFill draws the footage)
function bigWord(str, cx, cy, size, drawFill, p, o) {
  o = o || {}; if (p <= 0) return;
  const e = E.outQ(clamp(p)), f = F(400, size, 'Bebas'), ls = o.ls === undefined ? size * 0.01 : o.ls;
  const mask = () => { ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); setF(f, ls); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = WHT;
    ctx.translate(cx, cy); const s = lerp(o.s0 || 1.25, 1, e); ctx.scale(s, s); ctx.fillText(str, 0, size * 0.04); ctx.restore(); };
  knockout(mask, drawFill, o.alpha === undefined ? clamp(p * 3) : o.alpha);
  if (o.stroke) { ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); setF(f, ls); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 3;
    ctx.globalAlpha = clamp(p * 3); ctx.translate(cx, cy); const s = lerp(o.s0 || 1.25, 1, e); ctx.scale(s, s); ctx.strokeText(str, 0, size * 0.04); ctx.restore(); }
}
// handwritten note (Caveat) that writes on left-to-right
function hand(str, x, y, size, p, o) {
  o = o || {}; if (p <= 0) return; const q = o.q || 0; if (q >= 1) return;
  const f = F(o.w || 700, size, 'Hand'), tw = textW(str, f, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); setF(f, 0); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const x0 = o.align === 'center' ? x - tw / 2 : o.align === 'right' ? x - tw : x;
  ctx.beginPath(); ctx.rect(x0 - 20, y - size * 1.2, (tw + 40) * E.inOutS(clamp(p)), size * 1.7); ctx.clip();
  ctx.globalAlpha = 1 - E.inC(q); if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 2; }
  ctx.fillStyle = o.col || WHT; if (o.rot) { ctx.translate(x0, y); ctx.rotate(o.rot); ctx.translate(-x0, -y); } ctx.fillText(str, x0, y);
  ctx.restore(); return tw;
}
// hand-drawn arrow / circle strokes (p draws on)
function handArrow(pts, p, o) {
  o = o || {}; if (p <= 0 || VID.collecting) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); ctx.strokeStyle = o.col || OR; ctx.lineWidth = o.lw || 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.globalAlpha = 1 - (o.q ? E.inC(o.q) : 0);
  // total length
  let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  let left = L * clamp(p); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length && left > 0; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]), u = Math.min(1, left / d);
    ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)); left -= d;
  }
  ctx.stroke();
  if (o.head && p > 0.92) {   // arrow head at the end
    const n = pts.length, a = pts[n - 2], b = pts[n - 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), hl = o.head;
    ctx.beginPath(); ctx.moveTo(b[0] - hl * Math.cos(ang - 0.5), b[1] - hl * Math.sin(ang - 0.5)); ctx.lineTo(b[0], b[1]); ctx.lineTo(b[0] - hl * Math.cos(ang + 0.5), b[1] - hl * Math.sin(ang + 0.5)); ctx.stroke();
  }
  ctx.restore();
}
// mono timestamp with rolling digits, e.g. stamp('6:58','AM', ...)
function stamp(hm, ap, cx, y, size, p, q, o) {
  o = o || {}; if (p <= 0 || (q || 0) >= 1) return;
  const a = (1 - E.inC(clamp(q || 0)));
  ctx.save(); ctx.globalAlpha = a; ctx.restore();
  const tw = odo(hm, cx - size * 0.32, y, size, p, { w: 800, fam: 'Mono', col: o.col || WHT, alpha: a, spins: 1, shadow: true });
  caps(ap, cx - size * 0.32 + (tw || 0) / 2 + size * 0.1, y, size * 0.3, clamp(p * 1.5), q, { w: 700, fam: 'Mono', ls: 3, align: 'left', col: o.apCol || OR, shadow: 'rgba(0,0,0,0.5)' });
}

// ---------- end cards ----------
// style: 'dark' (blurred footage behind, darkened) | 'paper' | 'black'
function endCard(lt, o) {
  o = o || {}; const sp = o.speed || 1, k = x => x / sp;
  const dark = o.style !== 'paper', fg = dark ? WHT : BLK, sub = dark ? WA(0.74) : INKA(0.66);
  if (W > H) return endCardWide(lt, o);
  const y = o.y || 0;
  drawLogo(dark ? 'w' : 'b', 540, 548 + y, o.logoW || 780, E.outQ(ramp(lt, k(0.05), k(0.55))));
  if (o.tag) {
    if (o.tagFont === 'serif') serif(o.tag, 540, 752 + y, o.tagSize || 58, ramp(lt, k(0.35), k(0.6)), 0, { col: fg, shadow: false });
    else caps(o.tag, 540, 742 + y, o.tagSize || 34, ramp(lt, k(0.35), k(0.5)), 0, { col: fg, w: 800, ls: 3 });
  }
  pill(o.cta || CONTACT.cta, 540, 872 + y, { p: ramp(lt, k(0.55), k(0.4)), size: 31, bg: o.ctaBg || OR, col: o.ctaCol || BLK });
  caps(CONTACT.phone, 540, 1010 + y, 76, ramp(lt, k(0.7), k(0.45)), 0, { col: fg, w: 800, ls: 1 });
  caps(CONTACT.web, 540, 1078 + y, 34, ramp(lt, k(0.8), k(0.45)), 0, { col: dark ? OR : BLK, w: 700, ls: 5 });
  caps(o.foot || footLine(' · ', '  ·  '), 540, 1176 + y, 23, ramp(lt, k(0.95), k(0.5)), 0, { col: sub, w: 500, fam: 'Mono', ls: 2 });
}
function endCardWide(lt, o) {
  const sp = o.speed || 1, k = x => x / sp, dark = o.style !== 'paper', fg = dark ? WHT : BLK, sub = dark ? WA(0.74) : INKA(0.66);
  const cx = W / 2;
  drawLogo(dark ? 'w' : 'b', cx, 330, 860, E.outQ(ramp(lt, k(0.05), k(0.55))));
  if (o.tag) {
    if (o.tagFont === 'serif') serif(o.tag, cx, 560, 64, ramp(lt, k(0.35), k(0.6)), 0, { col: fg, shadow: false });
    else caps(o.tag, cx, 556, 36, ramp(lt, k(0.35), k(0.5)), 0, { col: fg, w: 800, ls: 4 });
  }
  pill(o.cta || CONTACT.cta, cx, 668, { p: ramp(lt, k(0.55), k(0.4)), size: 30, bg: OR, col: BLK });
  caps(CONTACT.phone + '   ·   ' + CONTACT.web, cx, 800, 46, ramp(lt, k(0.7), k(0.45)), 0, { col: fg, w: 800, ls: 2 });
  caps(o.foot || footLine(' · ', '  ·  '), cx, 880, 22, ramp(lt, k(0.95), k(0.5)), 0, { col: sub, w: 500, fam: 'Mono', ls: 2 });
}
