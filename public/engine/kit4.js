'use strict';
/* Motion kit 4 (round 5): transition library + effects. A transition gets a region R = [x, y, w, h], progress u (0..1)
   and two draw functions A() / B() that draw the outgoing / incoming shot (each drawn whole, e.g. with K3.clip).
   Footage is never cropped or zoomed: transitions move, mask, flip or blur whole frames. Requires kit3 (K3). */
const K4 = (() => {
  const G = K3.G, D = K3.D, lmod = K3.lmod;
  const GI = () => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); return ctx; };
  function into(name, fn) {   // render into a full-frame offscreen canvas
    const c = scratch(name); const keep = ctx; ctx = c.g;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, W, H);
    try { fn(); } finally { ctx = keep; } return c;
  }
  function clipTo(path, fn) { ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); ctx.beginPath(); path(ctx); ctx.clip(); fn(); ctx.restore(); }
  const both = (A, B) => { A(); B(); };
  function bg(R, col) { const c = GI(); c.fillStyle = col || BLK; c.fillRect(R[0], R[1], R[2], R[3]); D(); }

  const T = {
    cut(R, u, A, B) { (u < 0.5 ? A : B)(); },
    // soft cross-fade (studio templates; the round-5 films don't use it)
    dissolve(R, u, A, B) { A(); if (u <= 0) return; ctx.save(); ctx.globalAlpha *= E.inOutS(clamp(u)); clipTo(c => c.rect(R[0], R[1], R[2], R[3]), B); ctx.restore(); },
    // paver flip: the frame splits into tiles that flip over in a diagonal wave, grout lines flash between
    paver(R, u, A, B, o) {
      o = o || {}; if (VID.collecting) return both(A, B);
      const cols = o.cols || 6, rows = o.rows || Math.max(2, Math.round(R[3] / (R[2] / cols))), a = into('k4a', A), b = into('k4b', B);
      const tw = R[2] / cols, th = R[3] / rows; bg(R, o.under || BLK); const c = GI();
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const d = (i + j) / (cols + rows - 2), p = clamp(u * 1.7 - d * 0.7), sx = Math.abs(Math.cos(p * Math.PI)), src = p < 0.5 ? a : b;
        const x = R[0] + i * tw, y = R[1] + j * th; if (sx < 0.015) continue;
        c.save(); c.translate(x + tw / 2, y + th / 2); c.scale(sx, 1); c.drawImage(src, x, y, tw, th, -tw / 2, -th / 2, tw, th);
        if (p > 0 && p < 1) { c.fillStyle = `rgba(0,0,0,${0.45 * (1 - sx)})`; c.fillRect(-tw / 2, -th / 2, tw, th); }
        c.restore();
      }
      const gl = Math.sin(Math.PI * clamp(u)); if (gl > 0.02) { c.strokeStyle = ORA(0.8 * gl); c.lineWidth = 3;
        for (let i = 1; i < cols; i++) { c.beginPath(); c.moveTo(R[0] + i * tw, R[1]); c.lineTo(R[0] + i * tw, R[1] + R[3]); c.stroke(); }
        for (let j = 1; j < rows; j++) { c.beginPath(); c.moveTo(R[0], R[1] + j * th); c.lineTo(R[0] + R[2], R[1] + j * th); c.stroke(); } }
      D();
    },
    // horizontal slices slide out left/right in turn, revealing the next shot underneath
    slices(R, u, A, B, o) {
      o = o || {}; if (VID.collecting) return both(A, B);
      const n = o.n || 7, a = into('k4a', A); B(); const c = GI(), h = R[3] / n;
      for (let k = 0; k < n; k++) { const p = E.inQ(clamp(u * 1.5 - k * 0.07)), dx = (k % 2 ? 1 : -1) * p * R[2] * 1.05; if (p >= 1) continue;
        c.drawImage(a, R[0], R[1] + k * h, R[2], h + 1, R[0] + dx, R[1] + k * h, R[2], h + 1); }
      D();
    },
    iris(R, u, A, B, o) {
      o = o || {}; A(); const cx = o.cx === undefined ? R[0] + R[2] / 2 : o.cx, cy = o.cy === undefined ? R[1] + R[3] / 2 : o.cy, r = E.inOutC(clamp(u)) * Math.hypot(R[2], R[3]) * 0.6;
      if (r < 1) return; clipTo(c => { c.rect(R[0], R[1], R[2], R[3]); }, () => clipTo(c => c.arc(cx, cy, r, 0, 7), B));
      if (!VID.collecting && u < 1) { const c = G(); c.beginPath(); c.rect(R[0], R[1], R[2], R[3]); c.clip(); c.strokeStyle = o.col || OR; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke(); D(); }
    },
    // the next shot grows out of the DPG "D"
    logo(R, u, A, B, o) {
      o = o || {}; if (VID.collecting) return both(A, B);
      A(); const cx = R[0] + R[2] / 2, cy = R[1] + R[3] / 2, s = lerp(0.25, 9, E.inQ(clamp(u / 0.85))), sc = s * 0.5;
      const m = into('k4m', () => { if (BRAND.parts) K3.part('D', cx - 181 * sc, cy - 183 * sc, sc); else { const [lw, lh] = logoBox(800 * sc); ctx.drawImage(IMG.logoW, cx - lw / 2, cy - lh / 2, lw, lh); } });
      const b = into('k4b', B); b.g.save(); b.g.setTransform(1, 0, 0, 1, 0, 0); b.g.globalCompositeOperation = 'destination-in'; b.g.drawImage(m, 0, 0); b.g.restore();
      const c = GI(); c.beginPath(); c.rect(R[0], R[1], R[2], R[3]); c.clip(); c.drawImage(b, 0, 0); D();
      const f = clamp((u - 0.7) / 0.3); if (f > 0) { ctx.save(); ctx.globalAlpha = E.inOutS(f); clipTo(c => c.rect(R[0], R[1], R[2], R[3]), B); ctx.restore(); }
    },
    // rough brush stroke sweeps across
    brush(R, u, A, B, o) {
      o = o || {}; A(); const e = E.inOutC(clamp(u)), fx = R[0] - 260 + e * (R[2] + 520), r = rng(o.seed || 5), pts = [];
      for (let y = R[1] - 20; y <= R[1] + R[3] + 20; y += 18) pts.push([fx + (r() - 0.5) * 120 + (y - R[1]) * 0.25, y]);
      clipTo(c => { c.rect(R[0], R[1], R[2], R[3]); }, () => clipTo(c => { c.moveTo(R[0] - 400, R[1] - 40); pts.forEach(p => c.lineTo(p[0], p[1])); c.lineTo(R[0] - 400, R[1] + R[3] + 40); c.closePath(); }, B));
      if (!VID.collecting && u > 0 && u < 1) { const c = G(); c.strokeStyle = o.col || OR; c.lineWidth = 10; c.lineJoin = 'round'; c.beginPath(); c.rect(R[0], R[1], R[2], R[3]); c.clip(); c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); D(); }
    },
    // a wave-edged tide rises over the frame
    liquid(R, u, A, B, o) {
      A(); const e = E.inOutS(clamp(u)), yf = R[1] + R[3] + 60 - e * (R[3] + 120), tt = (o && o.t) || 0;
      const wave = c => { c.moveTo(R[0], R[1] + R[3]); for (let x = R[0]; x <= R[0] + R[2] + 12; x += 12) c.lineTo(x, yf + 26 * Math.sin(x * 0.011 + tt * 5) + 12 * Math.sin(x * 0.031 - tt * 3)); c.lineTo(R[0] + R[2], R[1] + R[3]); c.closePath(); };
      clipTo(c => c.rect(R[0], R[1], R[2], R[3]), () => clipTo(wave, B));
      if (!VID.collecting && u > 0 && u < 1) { const c = G(); c.beginPath(); c.rect(R[0], R[1], R[2], R[3]); c.clip(); c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 5; c.beginPath();
        for (let x = R[0]; x <= R[0] + R[2] + 12; x += 12) { const y = yf + 26 * Math.sin(x * 0.011 + tt * 5) + 12 * Math.sin(x * 0.031 - tt * 3); x === R[0] ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); D(); }
    },
    // warm light bloom across a soft cross-fade
    leak(R, u, A, B) {
      A(); ctx.save(); ctx.globalAlpha = E.inOutS(clamp(u)); B(); ctx.restore();
      if (VID.collecting) return; const k = Math.sin(Math.PI * clamp(u)), c = GI(); c.globalCompositeOperation = 'lighter';
      const x = R[0] + R[2] * lerp(-0.1, 1.1, u), g = c.createRadialGradient(x, R[1] + R[3] * 0.4, 20, x, R[1] + R[3] * 0.4, R[2] * 0.9);
      g.addColorStop(0, `rgba(255,220,170,${0.85 * k})`); g.addColorStop(0.35, `rgba(255,120,30,${0.5 * k})`); g.addColorStop(1, 'rgba(255,101,0,0)');
      c.fillStyle = g; c.fillRect(R[0], R[1], R[2], R[3]); D();
    },
    // horizontal strips jump sideways, white flash in the middle
    glitch(R, u, A, B, o) {
      if (VID.collecting) return both(A, B);
      const a = into('k4a', A), b = into('k4b', B), src = u < 0.5 ? a : b, amp = Math.sin(Math.PI * clamp(u)) * 140, fr = Math.floor(((o && o.t) || 0) * 30);
      bg(R); const c = GI(); let y = R[1], k = 0;
      while (y < R[1] + R[3]) { const h = 8 + Math.floor(hash(fr * 3.1 + k * 7.7) * 60), dx = (hash(fr * 9.3 + k * 1.9) - 0.5) * 2 * amp * (hash(k + fr) > 0.35 ? 1 : 0.1);
        c.drawImage(src, R[0], y, R[2], h, R[0] + dx, y, R[2], h); y += h; k++; }
      const fl = Math.max(0, 1 - Math.abs(u - 0.5) / 0.12); if (fl > 0) { c.fillStyle = `rgba(255,255,255,${0.7 * fl})`; c.fillRect(R[0], R[1], R[2], R[3]); }
      D();
    },
    // the next shot is tossed in like a print landing on a table
    toss(R, u, A, B, o) {
      o = o || {}; if (VID.collecting) return both(A, B);
      A(); const b = into('k4b', B), e = E.outBack(clamp(u)), rot = lerp(o.rot0 === undefined ? -0.32 : o.rot0, 0, e), dx = lerp(o.dx0 === undefined ? W * 0.7 : o.dx0, 0, E.outC(clamp(u))), dy = lerp(o.dy0 === undefined ? 300 : o.dy0, 0, E.outC(clamp(u))), s = lerp(0.8, 1, e);
      const cx = R[0] + R[2] / 2, cy = R[1] + R[3] / 2, c = GI(); c.translate(cx + dx, cy + dy); c.rotate(rot); c.scale(s, s); c.translate(-cx, -cy);
      c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 50 * (1 - clamp(u)) + 20; c.shadowOffsetY = 12;
      c.fillStyle = o.border || '#F4F1EA'; const bw = o.bw === undefined ? 14 : o.bw; c.fillRect(R[0] - bw, R[1] - bw, R[2] + 2 * bw, R[3] + 2 * bw); c.shadowBlur = 0; c.shadowOffsetY = 0;
      c.beginPath(); c.rect(R[0], R[1], R[2], R[3]); c.clip(); c.drawImage(b, 0, 0); D();
    },
    // carousel swipe: out to the left with a slight tilt, in from the right
    swipe(R, u, A, B, o) {
      if (VID.collecting) return both(A, B);
      const a = into('k4a', A), b = into('k4b', B), e = E.inOutC(clamp(u)), cx = R[0] + R[2] / 2, cy = R[1] + R[3] / 2, c = GI();
      [[a, -e, -0.07 * e], [b, 1 - e, 0.07 * (1 - e)]].forEach(([img, k, rot]) => { c.save(); c.translate(cx + k * W * 1.08, cy); c.rotate(rot); c.translate(-cx, -cy); c.beginPath(); c.rect(R[0], R[1], R[2], R[3]); c.clip(); c.drawImage(img, 0, 0); c.restore(); });
      D();
    },
    // the next shot plays inside a giant word that flies through
    word(R, u, A, B, o) {
      o = o || {}; if (VID.collecting) return both(A, B);
      A(); const cx = R[0] + R[2] / 2, cy = R[1] + R[3] / 2, s = lerp(1, 30, E.inExpo(clamp(u / 0.9))), size = o.size || 300;
      const m = into('k4m', () => { const c = G(); c.translate(cx, cy); c.scale(s, s); setF(F(400, size, 'Bebas'), 4); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.text || BRAND.short, 0, size * 0.05); D(); });
      const b = into('k4b', B); b.g.save(); b.g.setTransform(1, 0, 0, 1, 0, 0); b.g.globalCompositeOperation = 'destination-in'; b.g.drawImage(m, 0, 0); b.g.restore();
      const c = GI(); c.beginPath(); c.rect(R[0], R[1], R[2], R[3]); c.clip(); c.drawImage(b, 0, 0); D();
      const f = clamp((u - 0.75) / 0.25); if (f > 0) { ctx.save(); ctx.globalAlpha = f; clipTo(cc => cc.rect(R[0], R[1], R[2], R[3]), B); ctx.restore(); }
    },
    // horizontal whip with motion blur
    whip(R, u, A, B, o) {
      if (VID.collecting) return both(A, B);
      const dir = (o && o.dir) || 1, first = u < 0.5, e = first ? E.inC(u * 2) : 1 - E.outC((u - 0.5) * 2), src = into('k4a', first ? A : B);
      const off = (first ? -1 : 1) * dir * e * R[2] * 0.85, spread = e * 220, n = 7, acc = scratch('k4w');
      acc.g.setTransform(1, 0, 0, 1, 0, 0); acc.g.clearRect(0, 0, W, H); acc.g.globalCompositeOperation = 'lighter';
      for (let k = 0; k < n; k++) { acc.g.globalAlpha = 1 / n; acc.g.drawImage(src, off + (k / (n - 1) - 0.5) * spread * dir, 0); }
      acc.g.globalAlpha = 1; acc.g.globalCompositeOperation = 'source-over';
      bg(R); const c = GI(); c.beginPath(); c.rect(R[0], R[1], R[2], R[3]); c.clip(); c.drawImage(acc, 0, 0); D();
    },
    // vertical blinds open onto the next shot
    blinds(R, u, A, B, o) {
      o = o || {}; A(); const n = o.n || 8, bw = R[2] / n;
      for (let k = 0; k < n; k++) { const p = E.inOutC(clamp(u * 1.4 - k * 0.05)); if (p <= 0) continue; const w = bw * p, x = R[0] + k * bw + (bw - w) / 2;
        clipTo(c => c.rect(x, R[1], w + 0.5, R[3]), B); }
    },
  };
  function run(name, R, u, A, B, o) { (T[name] || T.cut)(R, clamp(u), A, B, o); }

  // ---------------- particles ----------------
  function embers(R, t, n, a) { if (VID.collecting) return; const c = GI(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) { const sp = 60 + hash(i * 3.7) * 140, life = (R[3] + 40) / sp, ph = lmod(t + hash(i * 1.3) * life, life) / life;
      const x = R[0] + hash(i * 7.1) * R[2] + Math.sin(t * 2 + i) * 18, y = R[1] + R[3] - ph * (R[3] + 40), r = 1.5 + hash(i * 2.9) * 3.5, fl = 0.5 + 0.5 * Math.sin(t * 13 + i * 5);
      c.fillStyle = `rgba(255,${Math.round(120 + 80 * fl)},40,${(a === undefined ? 0.9 : a) * (1 - ph) * (0.5 + 0.5 * fl)})`; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
    D(); }
  function sparkles(R, t, n, a) { if (VID.collecting) return; const c = GI(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) { const per = 0.8 + hash(i * 5.1) * 1.6, ph = lmod(t + hash(i * 9.9) * per, per) / per, k = Math.sin(Math.PI * ph) ** 3, x = R[0] + hash(i * 4.3) * R[2], y = R[1] + hash(i * 6.7) * R[3], s = 2 + 7 * k;
      c.fillStyle = `rgba(255,236,200,${(a === undefined ? 0.9 : a) * k})`; c.beginPath(); c.moveTo(x - s, y); c.lineTo(x, y - s * 0.25); c.lineTo(x + s, y); c.lineTo(x, y + s * 0.25); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s * 0.25, y); c.lineTo(x, y + s); c.lineTo(x - s * 0.25, y); c.closePath(); c.fill(); }
    D(); }
  function dust(cx, cy, t, t0, n, a) { const u = (t - t0) / 0.9; if (u < 0 || u > 1 || VID.collecting) return; const c = GI();
    for (let i = 0; i < n; i++) { const ang = Math.PI * (1 + hash(i * 3.3)), sp = 120 + hash(i * 7.7) * 380, x = cx + Math.cos(ang) * sp * E.outC(u) * (0.6 + hash(i)), y = cy + Math.sin(ang) * sp * 0.35 * E.outC(u) + 60 * u * u;
      c.fillStyle = `rgba(230,220,205,${(a === undefined ? 0.5 : a) * (1 - u)})`; c.beginPath(); c.arc(x, y, 3 + hash(i * 2.2) * 9 * (0.5 + u), 0, 7); c.fill(); }
    D(); }

  // ---------------- element type ----------------
  // per-letter treatments for big single words. mode: 'fire' | 'water' | 'stone' | 'air' | 'light'. p = 0..1 build, q = exit
  function elementWord(str, cx, cy, size, t, t0, mode, o) {
    if (VID.collecting) return; o = o || {}; const f = F(o.w || 900, size, o.fam || 'Mont'), ls = o.ls === undefined ? 4 : o.ls, lt = t - t0, q = o.q ? E.inC(clamp(o.q)) : 0;
    const ws = [...str].map(ch => textW(ch, f, ls)), tot = ws.reduce((a, b) => a + b, 0); let x = cx - tot / 2;
    [...str].forEach((ch, i) => {
      const w = ws[i], c = G(); setF(f, ls); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      let dy = 0, dx = 0, rot = 0, al = 1, s = 1, col = o.col || WHT, trail = 0;
      if (mode === 'fire') { const p = clamp((lt - i * 0.06) / 0.35); al = E.outC(p) * (0.75 + 0.25 * Math.sin(t * 23 + i * 3) * Math.sin(t * 7 + i)); dy = (1 - E.outC(p)) * 40 + Math.sin(t * 9 + i * 2) * 2;
        c.shadowColor = 'rgba(255,101,0,0.95)'; c.shadowBlur = 28 + 14 * Math.sin(t * 11 + i); const g = c.createLinearGradient(0, cy - size * 0.8, 0, cy + size * 0.1); g.addColorStop(0, '#FFE2B0'); g.addColorStop(0.55, '#FF8A1E'); g.addColorStop(1, OR); col = g; }
      else if (mode === 'water') { const p = clamp((lt - i * 0.07) / 0.5); al = E.outC(p); dy = Math.sin(t * 3.2 - i * 0.7) * size * 0.06 + (1 - E.outC(p)) * size * 0.3; c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 20; }
      else if (mode === 'stone') { const p = clamp((lt - i * 0.11) / 0.18); if (p <= 0) { D(); x += w; return; } dy = -(1 - E.inC(p)) * size * 1.2; s = p >= 1 ? 1 + 0.05 * Math.max(0, 1 - (lt - i * 0.11 - 0.18) / 0.15) : 1; c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 16; }
      else if (mode === 'air') { const p = clamp((lt - i * 0.06) / 0.55), e = E.outC(p); al = clamp(p * 1.8); dx = (1 - e) * size * 2.2; trail = 1 - e;
        dy = Math.sin(t * 2.4 + i * 0.8) * size * 0.03; rot = (1 - e) * 0.22 + Math.sin(t * 1.7 + i * 1.3) * 0.015; c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 18; }
      else if (mode === 'light') { const on = lt > i * 0.12 ? 1 : 0, fl = on ? (lt - i * 0.12 < 0.12 ? (Math.floor((lt - i * 0.12) * 60) % 2) : 1) : 0.12; al = fl; c.shadowColor = 'rgba(255,214,150,0.95)'; c.shadowBlur = on ? 40 : 0; col = on ? '#FFF4E0' : 'rgba(255,255,255,0.2)'; }
      c.translate(x + w / 2 + dx, cy + dy - q * size * 0.6); if (rot) c.rotate(rot); c.scale(s, s); c.fillStyle = col;
      if (trail > 0.02) for (let g = 3; g >= 1; g--) { c.globalAlpha = al * (1 - q) * 0.22 * trail * (4 - g) / 3; c.fillText(ch, -w / 2 + g * size * 0.22 * trail, 0); }
      c.globalAlpha = al * (1 - q); c.fillText(ch, -w / 2, 0);
      D(); x += w;
    });
  }
  // wind streaks: thin lines racing right to left
  function wind(R, t, n, a) { if (VID.collecting) return; const c = GI(); c.lineCap = 'round';
    for (let i = 0; i < n; i++) { const sp = 900 + hash(i * 4.1) * 900, len = 90 + hash(i * 2.7) * 260, span = R[2] + len * 2, ph = lmod(t * sp + hash(i * 8.3) * span, span);
      const x = R[0] + R[2] + len - ph, y = R[1] + hash(i * 5.9) * R[3] + Math.sin(t * 3 + i) * 6, k = Math.sin(Math.PI * ph / span);
      c.strokeStyle = `rgba(255,255,255,${(a === undefined ? 0.35 : a) * k})`; c.lineWidth = 1.5 + hash(i * 3.3) * 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + len, y - len * 0.04); c.stroke(); }
    D(); }
  // audio-style waveform bars (decorative)
  function wave(cx, cy, w, h, t, n, a) { if (VID.collecting) return; const c = G(), bw = w / n; c.globalAlpha = a === undefined ? 1 : a; c.fillStyle = OR;
    for (let i = 0; i < n; i++) { const k = 0.25 + 0.75 * Math.abs(Math.sin(t * 7 + i * 0.9) * Math.sin(t * 3.1 + i * 0.37)), bh = h * k; rrect(cx - w / 2 + i * bw + bw * 0.2, cy - bh / 2, bw * 0.6, bh, bw * 0.3); c.fill(); }
    D(); }
  return { into, clipTo, run, T, embers, sparkles, dust, wind, elementWord, wave, GI };
})();
