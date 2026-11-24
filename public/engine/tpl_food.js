'use strict';
/* Restaurant creative families (Oct 29). Six visual systems, each with its own composition, type, motion, transitions,
   closing and sound — not one layout recoloured. Colours/fonts come from the family look (K7.FAM) unless the studio applies
   another look. Footage starts as placeholders for every brand (no stock food); a vertical source fills the frame, a
   landscape one is shown whole. Prices are optional and hidden when empty, except where the price is the point (Lunch
   Rush), where a sample price is marked as sample text until it is changed.
   ?v=fire   Fire & Flame      heat-glow type that cools, restrained embers, grill-bar wipes, a branded logo
   ?v=chef   The Chef's Table  ivory pages, hairline frame, three courses with curtain reveals, slow
   ?v=rush   The Lunch Rush    clock-wipe title, combo maths with sticker frames, a price burst, stripe wipes
   ?v=today  Today's Special   a kitchen ticket prints, gets stamped and hangs on the rail over the footage
   ?v=icon   Menu Icons        one item on a Swiss grid: vertical name, slat reveals, a parts list, a spec table
   ?v=after  After Hours       a neon sign flickers on, a bar-top reflection, kinetic names cut on the beat */
STUDIO_REG['food'] = (() => {
  const V = QS.get('v') || 'fire';
  const FM = K7.FAM[V] || K7.FAM.fire;
  if (!window.STUDIO) setBrandColors(FM.pal);
  const G = K3.G, D = K3.D, up = K7.up, nz = K7.nz, seg = K7.seg, mix = K7.mix;
  const NONE = k => ['nofoot.' + k, 0];
  // [[key, label, seconds, kind, placeholder shape]] -> shots one after another from t0
  function shots(list, t0, group) {
    const S = K3.shots(list.map(([k, label, d, kind, ph]) => { const s = SHOT(k, NONE(k), { label, group: group || 'Footage', kind: kind || 'any', ph, d: d + 0.3 }); return [s[0], s[1], d]; }));
    S.forEach(s => (s.start += t0 || 0)); return S;
  }
  const cur = (S, t) => K3.shotAt(S, clamp(t, S[0].start, S[S.length - 1].start + S[S.length - 1].d - 1 / 60));
  const vert = s => K7.isVert(s.c);
  // a shot on the stage: a vertical source fills the frame; a landscape one sits whole across the width, centred on cy
  function stageRect(s, cy, w) { w = w || W; if (vert(s)) return K3.wholeIn(s.c, [0, 0, W, H]); const h = w / K3.ar(s.c); return [(W - w) / 2, cy - h / 2, w, h]; }
  function stage(s, t, cy, o) { return K7.photo(s, t, stageRect(s, cy, o && o.w), o); }
  const musicBed = (dur, o) => ['music', 0, dur, 0.95, Object.assign({ style: FM.music, bpm: FM.bpm, key: 0, end: dur - 0.6 }, o || {})];
  function shade(y0, y1, a0, a1, col) { if (VID.collecting) return; const c = G(), g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, rgbaOf(col || BLK, a0)); g.addColorStop(1, rgbaOf(col || BLK, a1)); c.fillStyle = g; c.fillRect(-20, y0, W + 40, y1 - y0); D(); }
  const fillAll = (col, a) => { if (!VID.collecting) fillScreen(col, a); };
  const DSP = 'Bebas', SANS = 'Mont', SER = 'Corm', SCR = 'Hand', TAU0 = Math.PI * 2;

  // ================================================================ FIRE & FLAME
  // Heat as the motion language: words slam in white-hot and cool to bone; grill bars sear across the cuts; a few embers
  // rise only from the bottom; the logo is branded hot and cools. Hard cuts on the beat of a heavy, slow groove.
  function fire() {
    const BT = 60 / FM.bpm, b = k => 0.5 + k * BT;
    const W1 = TX('w1', 'FIRE.', { label: 'Word 1', group: 'Opening', upper: true, max: 10 });
    const W2 = TX('w2', 'SMOKE.', { label: 'Word 2', group: 'Opening', upper: true, max: 10 });
    const W3 = TX('w3', 'TIME.', { label: 'Word 3', group: 'Opening', upper: true, max: 10 });
    const DISH = TX('dish', 'THE SMOKEHOUSE PLATE', { label: 'Dish name', group: 'The dish', upper: true, max: 26, req: true });
    const TAGS = TX('tags', 'HOT OFF THE GRILL', { label: 'Small line above', group: 'The dish', upper: true, max: 30 });
    const DESC = TX('desc', 'Charred, sliced and served hot.', { label: 'Description', group: 'The dish', max: 56 });
    const PRICE = TX('price', '', { label: 'Price', group: 'The dish', max: 9, hint: 'Optional. Leave it empty and no price shows.' });
    const END = TX('end', 'COME HUNGRY.', { label: 'Ending line', group: 'Ending', upper: true, max: 22 });
    const T1 = b(1), T2 = b(3), T3 = b(7), T4 = b(10), OUT = b(13), DUR = OUT + 4.7;
    const S = shots([['s1', 'Flames or the grill', T2 - T1, 'any', 'v'], ['s2', 'The dish (hero)', T3 - T2, 'any', 'v'], ['s3', 'Close-up', T4 - T3, 'any', 'v'], ['s4', 'Plated and served', OUT - T4, 'any', 'v']], T1);
    const words = [W1, W2, W3];
    let M = null; const m = () => M || (M = { hs: Math.min(400, ...words.map(w => fitSize(w, 900, 940, 400, DSP, 2))), DL: K7.fitLines(DISH, 900, DSP, 940, 200, 2, { ls: 2 }),
      XL: K7.fitLines(DESC.toUpperCase(), 900, DSP, 940, 132, 3, { ls: 1 }), ENDS: Math.min(170, fitSize(END, 900, 940, 170, DSP, 2)) });   // measured on the first frame, once fonts are in
    // white-hot -> cooled text. h: 1 hot .. 0 cool
    function heat(str, x, y, size, h, o) {
      if (VID.collecting || !str) return; o = o || {}; const c = G(), f = F(900, size, o.fam || DSP); setF(f, o.ls === undefined ? 2 : o.ls);
      c.textAlign = o.align || 'left'; c.textBaseline = 'alphabetic'; c.globalAlpha = o.a === undefined ? 1 : o.a;
      if (o.s && o.s !== 1) { c.translate(x, y); c.scale(o.s, o.s); c.translate(-x, -y); }
      const hh = clamp(h);
      if (hh > 0.01) { c.shadowColor = rgbaOf(OR, Math.min(1, 0.35 + hh)); c.shadowBlur = size * (0.12 + 0.28 * hh); c.fillStyle = OR; c.fillText(str, x, y); c.shadowBlur = size * 0.05; c.fillText(str, x, y); }
      c.shadowColor = 'transparent'; c.shadowBlur = 0; c.fillStyle = hh > 0.5 ? mix('#FFF1C9', '#FFFFFF', (hh - 0.5) * 2) : mix(WHT, '#FFE2A0', hh * 2); c.fillText(str, x, y);
      if (hh > 0.05 && hh < 0.9) { c.globalAlpha *= hh; c.strokeStyle = ACC2; c.lineWidth = 1.5; c.strokeText(str, x, y); }
      D();
    }
    function embers(t, n, a) {
      if (VID.collecting || a <= 0) return; const c = G(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < n; i++) {
        const r1 = hash(i * 7.13 + 1), r2 = hash(i * 3.71 + 2), r3 = hash(i * 5.17 + 3), life = 2.4 + r1 * 2.4, ph = (t / life + r2) % 1;
        const x = W * (0.06 + 0.88 * r3) + Math.sin((t + i) * 1.6 + r1 * 6) * 26 * ph, y = H + 20 - ph * H * (0.3 + 0.18 * r1);
        const k = Math.sin(ph * Math.PI) * (0.55 + 0.45 * Math.sin(t * 11 + i * 2.3)) * a, s = 10 + r2 * 16;
        if (k <= 0.02) continue; c.globalAlpha = k; c.drawImage(K7.spark(r1 > 0.7 ? ACC2 : OR), x - s / 2, y - s / 2, s, s);
      }
      D();
    }
    function backdrop(t) {
      if (VID.collecting) return; const c = G(), g = c.createRadialGradient(W / 2, H * 1.05, 60, W / 2, H * 0.95, H * 0.85);
      g.addColorStop(0, DEEP1); g.addColorStop(0.55, BLK); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40);
      c.globalAlpha = 0.05; for (let i = 0; i < 5; i++) { const r = 380 + 160 * hash(i + 4), x = W * hash(i * 2.7 + 1) + Math.sin(t * 0.2 + i) * 60, y = H - ((t * 40 + i * 420) % (H + 600)) + 300, sg = c.createRadialGradient(x, y, 0, x, y, r); sg.addColorStop(0, '#FFFFFF'); sg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = sg; c.fillRect(x - r, y - r, r * 2, r * 2); }
      D();
    }
    // grill bars sear across a cut at time tc
    function sear(t, tc) {
      const u = (t - (tc - 0.2)) / 0.42; if (u <= 0 || u >= 1 || VID.collecting) return; const c = G(); c.translate(W / 2, H / 2); c.rotate(-0.62);
      const off = lerp(-1500, 1500, E.inOutC(u));
      for (let k = -3; k <= 3; k++) { const x = off + k * 250; c.fillStyle = '#0A0807'; c.fillRect(x - 58, -1500, 116, 3000); c.fillStyle = OR; c.shadowColor = OR; c.shadowBlur = 30; c.fillRect(x + 50, -1500, 8, 3000); c.shadowBlur = 0; }
      D();
    }
    return {
      dur: DUR, shakes: [[b(0), 10], [b(1), 9], [b(2), 11], [T2 + 0.15, 6], [OUT + 0.6, 7]],
      render(t) {
        backdrop(t);
        // heat wire (before the first word)
        if (t < b(0) + 0.15 && !VID.collecting) { const u = E.outC(seg(t, 0.05, 0.4)), c = G(); c.globalCompositeOperation = 'lighter'; c.fillStyle = OR; c.shadowColor = OR; c.shadowBlur = 40; c.fillRect(W / 2 - 520 * u, 958, 1040 * u, 4); D(); }
        // footage: hard cuts on the beat
        if (t >= T1 && t < OUT) {
          const { i, sh } = cur(S, t), r = stageRect(sh, i === 1 ? 700 : 900);
          stage(sh, t, i === 1 ? 700 : 900);
          if (!VID.collecting) {
            if (r[3] >= H - 2) { shade(0, 520, 0.6, 0, BLK); shade(H * 0.48, H, 0, 0.92, BLK); }
            else { const c = G(); c.fillStyle = OR; c.globalAlpha = 0.85; c.fillRect(0, r[1] - 3, W, 3); c.fillRect(0, r[1] + r[3], W, 3); D(); }
            if (t < T2) fillAll(BLK, 0.42);
          }
        }
        if (VID.collecting) return;
        // the hook: three words slam in, white-hot, and cool
        if (t < T2 + 0.3) {
          const hs = m().hs, out = E.inC(seg(t, T2 - 0.1, 0.28)), lh = hs * 0.86, y0 = 960 - lh + hs * 0.36;
          words.forEach((w, k) => {
            const tw = b(k), p = seg(t, tw, 0.12); if (p <= 0) return;
            heat(w, 72, y0 + k * lh - out * (500 + k * 140), hs, 1 - seg(t, tw + 0.12, 1.3), { s: lerp(1.3, 1, E.outC(p)), a: clamp(p * 3) * (1 - out) });
          });
        }
        // the dish: hero footage, the name cools from white-hot, tags + description, optional price
        if (t >= T2 && t < T3 + 0.25) {
          const DL = m().DL, q = seg(t, T3 - 0.1, 0.25), sh = S[1], landscape = !vert(sh), lh = DL.size * 0.88, br = stageRect(sh, 700);
          const yb = landscape ? Math.max(1300, br[1] + br[3] + 110 + DL.size * 0.8 + (DL.lines.length - 1) * lh) : 1370, yTop = yb - (DL.lines.length - 1) * lh - DL.size * 0.8;
          const tp = seg(t, T2 + 0.15, 0.35);
          if (tp > 0) { const c = G(); c.globalAlpha = tp * (1 - q); setF(F(700, 30, SANS), 7); c.fillStyle = OR; c.fillRect(72, yTop - 52, 28 * E.outC(tp), 4); c.fillStyle = ACC2; c.textBaseline = 'alphabetic'; c.fillText(TAGS, 72 + 46, yTop - 40); D(); }
          DL.lines.forEach((ln, k) => { const p = seg(t, T2 + 0.25 + k * 0.12, 0.16); if (p > 0) heat(ln, 72, yb - (DL.lines.length - 1 - k) * lh, DL.size, 1 - seg(t, T2 + 0.4, 1.5), { s: lerp(1.15, 1, E.outC(p)), a: clamp(p * 3) * (1 - q) }); });
          if (PRICE) { const pp = seg(t, T2 + 0.9, 0.25); if (pp > 0) { const c = G(), f = F(900, 64, DSP), w = textW(PRICE, f, 2) + 56; c.globalAlpha = (1 - q) * clamp(pp * 3); c.translate(W - 72 - w / 2, yTop - 70); c.rotate(-0.06); c.scale(lerp(1.4, 1, E.outC(pp)), lerp(1.4, 1, E.outC(pp))); c.fillStyle = OR; c.fillRect(-w / 2, -48, w, 96); setF(f, 2); c.fillStyle = K7.on(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(PRICE, 0, 4); D(); } }
        }
        // the close-ups: the dish name rides as a header, the description sits low
        if (t >= T3 && t < OUT) {
          const p = seg(t, T3 + 0.15, 0.3), q = seg(t, OUT - 0.25, 0.25), size = Math.min(84, fitSize(DISH, 900, 940, 84, DSP, 2));
          heat(DISH, 72, 330, size, 0.25 * (1 - p) + 0.12, { a: E.outC(p) * (1 - q) });
          const c = G(); c.globalAlpha = E.outC(p) * (1 - q); c.fillStyle = OR; c.fillRect(72, 352, 120 * E.outC(p), 4); D();
          if (PRICE) K7.txt(PRICE, W - 72, 330, F(900, 72, DSP), ACC2, { align: 'right', a: E.outC(p) * (1 - q), ls: 2 });
          // the description, big and low, one line per beat
          const XL = m().XL, lh = XL.size * 0.9, yb = 1380;
          XL.lines.forEach((ln, k) => { const lp = seg(t, T3 + 0.25 + k * BT * 0.5, 0.14); if (lp > 0) heat(ln, 72, yb - (XL.lines.length - 1 - k) * lh, XL.size, 0.55 * (1 - seg(t, T3 + 0.3 + k * BT * 0.5, 1.0)), { s: lerp(1.12, 1, E.outC(lp)), a: clamp(lp * 3) * (1 - q), ls: 1 }); });
        }
        [T2, T3, T4].forEach(tc => sear(t, tc));
        // embers: a few, only from the bottom, never over the dish name for long
        embers(t, t < T2 || t >= OUT ? 16 : 7, t < T2 || t >= OUT ? 1 : 0.6);
        // closing: the logo is branded hot and cools, the ending line, a stamped CTA
        if (t >= OUT) {
          const o = t - OUT, lp = seg(o, 0.25, 0.25), h = 1 - seg(o, 0.5, 1.6), [lw, lh] = logoBox(760);
          if (lp > 0) {
            const c = G(), s = lerp(1.25, 1, E.outC(lp)); c.translate(W / 2, 640); c.scale(s, s); c.globalAlpha = clamp(lp * 3);
            if (h > 0.02) { c.shadowColor = rgbaOf(OR, 0.9); c.shadowBlur = 60 * h; c.drawImage(K7.tinted(IMG.logoW, OR), -lw / 2, -lh / 2, lw, lh); c.shadowBlur = 0; }
            c.globalAlpha *= 1 - h * 0.85; c.drawImage(IMG.logoW, -lw / 2, -lh / 2, lw, lh); D();
          }
          const ep = seg(o, 1.0, 0.16); if (ep > 0) heat(END, W / 2, 640 + lh / 2 + 210, m().ENDS, 1 - seg(o, 1.1, 1.4), { align: 'center', s: lerp(1.2, 1, E.outC(ep)), a: clamp(ep * 3) });
          const cp = seg(o, 1.7, 0.3), cy = 640 + lh / 2 + 360;
          if (cp > 0) { const c = G(), f = F(800, Math.min(34, fitSize(CONTACT.cta, 800, 840, 34, SANS, 5)), SANS), tw = textW(CONTACT.cta, f, 5), bw = Math.min(960, tw + 90); c.globalAlpha = E.outC(cp); c.strokeStyle = OR; c.lineWidth = 4; c.strokeRect(W / 2 - bw / 2, cy - 44, bw, 88); setF(f, 5); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CONTACT.cta, W / 2 + 2.5, cy + 2); D(); }
          const ip = seg(o, 2.1, 0.4); if (ip > 0) K7.txt(K7.contact().join('   ·   '), W / 2, cy + 120, F(700, 30, SANS), WA(0.8), { align: 'center', a: E.outC(ip), ls: 3 });
        }
      },
      cues() {
        const ev = [['air', 0.1, 0.25, 0], ['impact', b(0), 0.55, -0.1], ['boom', b(0), 0.35, 0], ['impact', b(1), 0.5, 0.1], ['impact', b(2), 0.6, 0], ['boom', b(2), 0.3, 0], ['whoosh', T2, 0.35, 0]];
        [T2, T3, T4].forEach(tc => { ev.push(['whoosh', tc, 0.28, 0.2]); ev.push(['clack', tc, 0.3, 0]); });
        ev.push(['impact', T2 + 0.3, 0.3, 0]); ev.push(['swell', OUT - 0.4, 0.3, 0]); ev.push(['impact', OUT + 0.25, 0.5, 0]); ev.push(['stamp', OUT + 1.7, 0.4, 0]); ev.push(['tink', OUT + 2.1, 0.2, 0.2]);
        return { dur: DUR, beds: [musicBed(DUR, { start: b(0) }), ['sizzle', 0, DUR, 0.22], ['fire', OUT - 0.5, DUR, 0.3]], events: ev };
      },
    };
  }

  // ================================================================ THE CHEF'S TABLE
  // Fine dining: an ivory page, a hairline frame drawn by hand, roman-numeral courses that alternate sides, images revealed
  // by a slow curtain, nothing faster than a breath. No particles, no shake.
  function chef() {
    const KICK = TX('kick', 'THE CHEF’S TABLE', { label: 'Small line', group: 'Opening', upper: true, max: 30 });
    const SUB = TX('sub', 'A tasting menu in three courses', { label: 'Line under the name', group: 'Opening', max: 46 });
    const C = [['Seared scallop', 'brown butter · citrus · fennel'], ['Wagyu striploin', 'smoked salt · bone marrow jus'], ['Dark chocolate', 'sea salt · olive oil · hazelnut']].map(([n, d], k) => ({
      n: TX(k ? 'dish' + (k + 1) : 'dish', n, { label: 'Course ' + (k + 1) + ' name', group: 'Course ' + ['one', 'two', 'three'][k], max: 28, req: true }),
      d: TX(k ? 'desc' + (k + 1) : 'desc', d, { label: 'Course ' + (k + 1) + ' notes', group: 'Course ' + ['one', 'two', 'three'][k], max: 42 }) }));
    const END = TX('end', 'Reserve your table', { label: 'Closing line', group: 'Ending', max: 30 });
    const T0 = 3.0, CD = 3.4, OUT = T0 + 3 * CD, DUR = OUT + 4.0;
    const S = shots(C.map((c, k) => ['s' + (k + 1), 'Course ' + (k + 1), CD + 0.4]), T0 - 0.2);
    S.forEach((s, k) => (s.start = T0 + k * CD - 0.2));
    const RN = ['I', 'II', 'III'], LAB = ['FIRST COURSE', 'SECOND COURSE', 'THIRD COURSE'];
    const NAME = BRAND.name; let NS0 = 0; const NSf = () => NS0 || (NS0 = Math.min(96, fitSize(NAME, 600, 900, 96, SER, 0, 'italic')));
    function frame(p, a) {   // hairline frame inset 54px, drawn clockwise from the top centre
      if (VID.collecting || p <= 0) return; const c = G(), x0 = 54, y0 = 54, x1 = W - 54, y1 = H - 54, L = 2 * (x1 - x0) + 2 * (y1 - y0), d = L * E.inOutS(clamp(p));
      c.globalAlpha = a === undefined ? 1 : a; c.strokeStyle = OR; c.lineWidth = 1.6; c.beginPath();
      const pts = [[W / 2, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0], [W / 2, y0]]; let left = d; c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length && left > 0; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i], sl = Math.hypot(bx - ax, by - ay), u = Math.min(1, left / sl); c.lineTo(ax + (bx - ax) * u, ay + (by - ay) * u); left -= sl; }
      c.stroke(); D();
    }
    const fadeUp = (str, x, y, f, col, p, o) => { if (p <= 0) return; o = o || {}; K7.txt(str, x, y + (1 - E.outC(p)) * 22, f, col, Object.assign({}, o, { a: E.outC(p) * (o.a === undefined ? 1 : o.a) })); };
    return {
      dur: DUR, shakes: [],
      render(t) {
        if (!VID.collecting) { const c = G(), g = c.createRadialGradient(W / 2, H * 0.42, 100, W / 2, H / 2, H * 0.75); g.addColorStop(0, DEEP2); g.addColorStop(1, DEEP1); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); }
        frame(seg(t, 0.1, 2.2));
        // title
        if (t < T0 + 0.2) {
          const q = seg(t, T0 - 0.6, 0.7);
          fadeUp(KICK, W / 2, 760, F(600, 26, SANS), OR, seg(t, 0.6, 0.9), { align: 'center', ls: 10, a: 1 - q });
          if (!VID.collecting) rule(W / 2, 800, 140, seg(t, 0.9, 0.9), { col: OR, alpha: 1 - q });
          fadeUp(NAME, W / 2, 920, F(500, NSf(), SER, 'italic'), WHT, seg(t, 1.1, 1.0), { align: 'center', a: 1 - q });
          fadeUp(SUB, W / 2, 1000, F(500, 40, SER), WA(0.7), seg(t, 1.6, 1.0), { align: 'center', a: 1 - q });
        }
        // courses
        for (let k = 0; k < 3; k++) {
          const t0 = T0 + k * CD, a = seg(t, t0, 0.6) * (1 - seg(t, t0 + CD - 0.45, 0.5)); if (a <= 0) continue;
          const sh = S[k], right = k % 2 === 1, v = vert(sh);
          const fw = v ? 540 : 860, fh = v ? 960 : fw / K3.ar(sh.c), by = Math.max(250, (H - fh - 300) / 2 - 30), box = [right ? W - 100 - fw : 100, by, fw, fh];
          const r = K3.wholeIn(sh.c, box), cu = E.inOutS(seg(t, t0 + 0.1, 1.3));
          if (cu > 0) { ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.rect(r[0], r[1], r[2], r[3] * cu); ctx.clip(); K7.photo(sh, t, r); ctx.restore(); }
          if (VID.collecting) continue;
          rule(r[0], r[1] + r[3] + 26, r[2], seg(t, t0 + 0.9, 1.0), { col: OR, alpha: a, from: 'l', h: 1.6 });
          const ax = right ? r[0] + r[2] : r[0], al = right ? 'right' : 'left', y = r[1] + r[3] + 120;
          fadeUp(LAB[k], ax, y, F(600, 24, SANS), OR, seg(t, t0 + 1.0, 0.9), { align: al, ls: 8, a });
          const ns = Math.min(78, fitSize(C[k].n, 500, 760, 78, SER, 0, 'italic'));
          fadeUp(C[k].n, ax, y + 96, F(500, ns, SER, 'italic'), WHT, seg(t, t0 + 1.25, 1.0), { align: al, a });
          fadeUp(up(C[k].d), ax, y + 156, F(500, Math.min(24, fitSize(up(C[k].d), 500, 760, 24, SANS, 4)), SANS), WA(0.72), seg(t, t0 + 1.55, 1.0), { align: al, ls: 4, a });
          fadeUp(RN[k], right ? 100 : W - 100, y + 156, F(500, 220, SER), rgbaOf(OR, 0.9), seg(t, t0 + 0.7, 1.4), { align: right ? 'left' : 'right', a });
        }
        // closing
        if (t >= OUT - 0.2 && !VID.collecting) {
          const o = t - OUT, [lw, lh] = logoBox(420);
          const lp = seg(o, 0.2, 1.0); if (lp > 0) { const c = G(); c.globalAlpha = E.outC(lp); c.drawImage(IMG.logoW, W / 2 - lw / 2, 560 - lh / 2, lw, lh); D(); }
          fadeUp(KICK, W / 2, 560 + lh / 2 + 90, F(600, 24, SANS), OR, seg(o, 0.6, 0.9), { align: 'center', ls: 10 });
          fadeUp(END, W / 2, 560 + lh / 2 + 200, F(500, Math.min(88, fitSize(END, 500, 900, 88, SER, 0, 'italic')), SER, 'italic'), WHT, seg(o, 0.9, 1.0), { align: 'center' });
          rule(W / 2, 560 + lh / 2 + 250, 120, seg(o, 1.2, 0.9), { col: OR });
          if (CONTACT.phone) fadeUp(CONTACT.phone, W / 2, 560 + lh / 2 + 340, F(500, 58, SER), WHT, seg(o, 1.4, 1.0), { align: 'center', ls: 1 });
          if (CONTACT.web) fadeUp(up(CONTACT.web), W / 2, 560 + lh / 2 + 400, F(600, 24, SANS), WA(0.6), seg(o, 1.6, 1.0), { align: 'center', ls: 6 });
          const cp = seg(o, 1.9, 1.0); if (cp > 0) { const c = G(), f = F(600, Math.min(24, fitSize(CONTACT.cta, 600, 840, 24, SANS, 5)), SANS), tw = textW(CONTACT.cta, f, 6), bw = tw + 90, y = 560 + lh / 2 + 500; c.globalAlpha = E.outC(cp); c.strokeStyle = OR; c.lineWidth = 1.6; c.strokeRect(W / 2 - bw / 2, y - 36, bw, 72); setF(f, 6); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CONTACT.cta, W / 2 + 3, y + 1); D(); }
        }
      },
      cues() {
        const ev = [['air', 0.6, 0.18, 0], ['chime', 1.2, 0.18, -0.2], ['paper', T0 - 0.1, 0.18, 0]];
        for (let k = 0; k < 3; k++) { ev.push(['air', T0 + k * CD + 0.1, 0.16, (k % 2 ? 0.3 : -0.3)]); ev.push(['tink', T0 + k * CD + 1.3, 0.12, (k % 2 ? 0.4 : -0.4)]); }
        ev.push(['air', OUT, 0.2, 0]); ev.push(['chime', OUT + 1.0, 0.2, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ THE LUNCH RUSH
  // Quick service: a clock-hand wipe, the title slammed from both sides, combo maths (three sticker frames + = a price
  // burst), then each item at full size behind diagonal stripe wipes. Hard offset shadows, square corners, fast.
  function rush() {
    const BT = 60 / FM.bpm, b = k => 0.3 + k * BT;
    const L1 = TX('l1', 'LUNCH', { label: 'Title word 1', group: 'Opening', upper: true, max: 9 });
    const L2 = TX('l2', 'RUSH', { label: 'Title word 2', group: 'Opening', upper: true, max: 9 });
    const HOURS = TX('hours', '', { label: 'Hours', group: 'Opening', upper: true, max: 18, hint: 'Optional, e.g. 11AM – 2PM. Leave it empty and it doesn’t show.' });
    const IT = ['BURGER', 'FRIES', 'DRINK'].map((d, k) => TX(k ? 'dish' + (k + 1) : 'dish', d, { label: 'Item ' + (k + 1), group: 'The combo', upper: true, max: 14 }));
    const PRICE = TX('price', '$9.99', { label: 'Combo price', group: 'The combo', max: 8, req: true, hint: 'Sample price. Put your real price here.' });
    const DEAL = TX('deal', 'THE LUNCH COMBO', { label: 'Deal name', group: 'The combo', upper: true, max: 22 });
    const END = TX('end', 'GRAB IT FAST.', { label: 'Ending line', group: 'Ending', upper: true, max: 18 });
    const C0 = b(4), SH0 = b(14), OUT = b(23), DUR = OUT + 3.2;
    const S = K3.shots(IT.map((it, k) => { const s = SHOT('s' + (k + 1), NONE('s' + (k + 1)), { label: 'Item ' + (k + 1), group: 'Footage', kind: 'any', d: 5.2 }); return [s[0], s[1], 1]; }));
    const pop = (t, t0) => E.outBack(seg(t, t0, 0.22));
    let TS0 = 0; const TSf = () => TS0 || (TS0 = Math.min(260, fitSize(L1, 900, 1000, 260, DSP, 0), fitSize(L2, 900, 1000, 260, DSP, 0)));
    const pm = /^(\D*)(\d+)(?:[.,](\d{1,2}))?(.*)$/.exec(nz(PRICE)) || ['', nz(PRICE), '', '', ''];
    function priceTxt(cx, cy, size, col, a) {   // $9 with superscript 99
      if (VID.collecting) return; const [_, pre, main, cents, post] = pm, c = G(); c.globalAlpha = a; c.fillStyle = col; c.textBaseline = 'alphabetic';
      const fM = F(900, size, DSP), fS = F(900, size * 0.42, DSP), wPre = textW(pre, fS, 0), wMain = textW(main || PRICE, fM, -2), wC = cents ? textW(cents, fS, 0) : 0, wPost = post ? textW(post, fS, 0) : 0, x0 = cx - (wPre + wMain + wC + wPost) / 2;
      setF(fS, 0); c.fillText(pre, x0, cy - size * 0.36); setF(fM, -2); c.fillText(main || PRICE, x0 + wPre, cy); setF(fS, 0); if (cents) c.fillText(cents, x0 + wPre + wMain + 4, cy - size * 0.36); if (post) c.fillText(post, x0 + wPre + wMain + wC + 6, cy);
      D();
    }
    function burst(cx, cy, r, rot, s, a) {
      if (VID.collecting || s <= 0) return; const c = G(); c.globalAlpha = a; c.translate(cx, cy); c.rotate(rot); c.scale(s, s); c.beginPath();
      for (let i = 0; i < 36; i++) { const rr = i % 2 ? r * 0.84 : r, an = i / 36 * Math.PI * 2; c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
      c.closePath(); c.fillStyle = ACC2; c.save(); c.translate(12, 14); c.fill(); c.restore(); c.fillStyle = OR; c.fill(); c.lineWidth = 8; c.strokeStyle = ACC2; c.stroke(); D();
    }
    function sticker(sh, t, cx, cy, w, h, rot, s, a, lt) {   // footage whole inside a cream-bordered frame with a hard shadow
      if (s <= 0) return; const box = K3.wholeIn(sh.c, [0, 0, w, h]), bw = box[2], bh = box[3];
      if (!VID.collecting) { const c = G(); c.globalAlpha = a; c.translate(cx, cy); c.rotate(rot); c.scale(s, s); c.fillStyle = ACC2; c.fillRect(-bw / 2 - 14 + 12, -bh / 2 - 14 + 14, bw + 28, bh + 28); c.fillStyle = PAPER; c.fillRect(-bw / 2 - 14, -bh / 2 - 14, bw + 28, bh + 28); D(); }
      const sw = bw * s, shh = bh * s; ctx.save(); ctx.globalAlpha = a; K7.photo(sh, t, [cx - sw / 2, cy - shh / 2, sw, shh], { lt }); ctx.restore();
    }
    function stripes(t, a) {   // the moving diagonal stripes behind everything
      if (VID.collecting) return; const c = G(); c.globalAlpha = a; c.fillStyle = DEEP1; c.translate(W / 2, H / 2); c.rotate(-0.5); const off = (t * 90) % 180;
      for (let x = -1500 + off; x < 1500; x += 180) c.fillRect(x, -1500, 70, 3000); D();
    }
    function wipe(t, tc) {   // diagonal stripes sweep across a cut
      const u = (t - (tc - 0.17)) / 0.36; if (u <= 0 || u >= 1 || VID.collecting) return; const c = G(); c.translate(W / 2, H / 2); c.rotate(0.45); const off = lerp(-2300, 2300, E.inOutC(u));
      for (let k = 0; k < 7; k++) { c.fillStyle = k % 2 ? ACC2 : OR; c.fillRect(off + (k - 3) * 170 - 90, -1600, 180, 3200); } D();
    }
    function labelBox(str, cx, cy, size, p, o) {   // a black skewed label with cream type
      if (VID.collecting || p <= 0) return; o = o || {}; const f = F(900, size, DSP), w = textW(str, f, 0) + size * 0.9, h = size * 1.25, c = G(), s = lerp(0.6, 1, E.outBack(clamp(p)));
      c.globalAlpha = clamp(p * 3) * (o.a === undefined ? 1 : o.a); c.translate(cx, cy); c.rotate(o.rot || -0.05); c.scale(s, s); c.fillStyle = o.bg || ACC2; c.fillRect(-w / 2, -h / 2, w, h);
      setF(f, 0); c.fillStyle = o.col || OR; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(str, 0, size * 0.06); D();
    }
    return {
      dur: DUR, shakes: [[b(0) + 0.2, 8], [b(1) + 0.2, 8], [b(10) + 0.1, 12], [OUT + 0.05, 6]],
      render(t) {
        fillAll(BLK); stripes(t, t < OUT ? 0.55 : 0.35);
        const sx = W / 2;
        // title: two words from both sides, a clock-hand wipe, a mustard disc
        if (t < C0 + 0.3) {
          const q = seg(t, C0 - 0.2, 0.3), dp = E.outElastic(seg(t, b(2), 0.7));
          if (!VID.collecting && dp > 0) { const c = G(); c.globalAlpha = 1 - q; c.fillStyle = OR; c.beginPath(); c.arc(sx, 760, 400 * dp, 0, TAU0); c.fill();
            const hp = seg(t, b(2), 0.5); if (hp > 0 && hp < 1) { c.fillStyle = ACC2; c.beginPath(); c.moveTo(sx, 760); c.arc(sx, 760, 400 * dp, -Math.PI / 2, -Math.PI / 2 + hp * TAU0); c.closePath(); c.globalAlpha = 0.18 * (1 - q); c.fill(); c.globalAlpha = 1 - q; c.save(); c.translate(sx, 760); c.rotate(hp * TAU0); c.fillRect(-7, -380 * dp, 14, 380 * dp); c.restore(); }
            for (let k = 0; k < 12; k++) { c.save(); c.translate(sx, 760); c.rotate(k / 12 * TAU0); c.fillStyle = ACC2; c.fillRect(-4, -386 * dp, 8, k % 3 ? 22 : 44); c.restore(); }
            D(); }
          const TS = TSf(), p1 = seg(t, b(0), 0.26), p2 = seg(t, b(1), 0.26), y1 = 760 - TS * 0.12, y2 = y1 + TS * 0.9;
          for (const [str, p, y, dir] of [[L1, p1, y1, -1], [L2, p2, y2, 1]]) {
            if (p <= 0 || VID.collecting) continue; const x = sx + dir * (1 - E.outBack(p)) * 900 - dir * q * 1200, c = G(); setF(F(900, TS, DSP), 0); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
            c.fillStyle = ACC2; c.fillText(str, x + 10, y + 12); c.fillStyle = WHT; c.fillText(str, x, y); D();
          }
          if (HOURS) labelBox(HOURS, sx, y2 + 170, 54, seg(t, b(3), 0.25) * (1 - q), { rot: 0.03 });
        }
        // the combo: frames pop on the beat, + signs, =, the price burst
        if (t >= C0 - 0.1 && t < SH0 + 0.3) {
          const q = seg(t, SH0 - 0.15, 0.3), hy = 290;
          if (!VID.collecting) { const hp = seg(t, C0, 0.3), c = G(); c.globalAlpha = E.outC(hp) * (1 - q); setF(F(900, 72, DSP), 0); c.textAlign = 'center'; c.fillStyle = ACC2; c.fillText(L1 + ' ' + L2, sx + 5, hy + 6); c.fillStyle = WHT; c.fillText(L1 + ' ' + L2, sx, hy); D(); }
          const xs = [190, 540, 890], rots = [-0.07, 0.05, -0.04], ry = 640;
          IT.forEach((it, k) => {
            const tk = C0 + k * 2 * BT, s = pop(t, tk); if (s <= 0) return;
            sticker(S[k], t, xs[k], ry, 286, 230, rots[k], s * (1 - q * 0.3), 1 - q, t - tk);
            if (!VID.collecting) { const L = K7.fitLines(it, 800, SANS, 300, 42, 2); L.lines.forEach((ln, j) => K7.txt(ln, xs[k], ry + 200 + j * L.size * 1.05, F(800, L.size, SANS), WHT, { align: 'center', a: clamp(s) * (1 - q), ls: 1 })); }
          });
          if (!VID.collecting) for (let k = 0; k < 2; k++) { const ps = pop(t, C0 + (2 * k + 1) * BT); if (ps > 0) { const c = G(), x = (xs[k] + xs[k + 1]) / 2; c.globalAlpha = 1 - q; c.translate(x, ry); c.scale(ps, ps); c.fillStyle = ACC2; c.fillRect(-34 + 6, -11 + 7, 68, 22); c.fillRect(-11 + 6, -34 + 7, 22, 68); c.fillStyle = OR; c.fillRect(-34, -11, 68, 22); c.fillRect(-11, -34, 22, 68); D(); } }
          const es = pop(t, b(9)); if (es > 0 && !VID.collecting) { const c = G(); c.globalAlpha = 1 - q; c.translate(sx, 970); c.scale(es, es); c.fillStyle = ACC2; c.fillRect(-110, -34, 220, 22); c.fillRect(-110, 12, 220, 22); D(); }
          const bs = pop(t, b(10)); burst(sx, 1270, 280, t * 0.25, bs * (1 - q * 0.4), 1 - q);
          if (bs > 0) priceTxt(sx, 1270 + 70, Math.min(230, 230 * 4 / Math.max(4, nz(PRICE).length)), K7.on(OR), clamp(bs * 2) * (1 - q));
          labelBox(DEAL, sx, 1630, 52, seg(t, b(11), 0.25) * (1 - q), { rot: -0.03 });
        }
        // each item at full size: stripe wipes on the beat, a skewed label, the price chip
        if (t >= SH0 && t < OUT) {
          const k = Math.min(2, Math.floor((t - SH0) / (3 * BT))), tk = SH0 + k * 3 * BT, sh = S[k];
          const r = stageRect(sh, 860); K7.photo(sh, t, r, { lt: t - tk + 1.2 });
          if (!VID.collecting) { if (r[3] >= H - 2) shade(H * 0.55, H, 0, 0.75, BLK); labelBox(IT[k], sx, 1330, Math.min(130, fitSize(IT[k], 900, 860, 130, DSP, 0)), seg(t, tk + 0.12, 0.24));
            K7.txt((k + 1) + ' / 3', 72, 300, F(900, 40, DSP), OR, {}); burst(W - 170, 320, 120, t * 0.4, 1, 1); priceTxt(W - 170, 352, Math.min(100, 100 * 4 / Math.max(4, nz(PRICE).length)), K7.on(OR), 1); }
        }
        [SH0, SH0 + 3 * BT, SH0 + 6 * BT].forEach(tc => wipe(t, tc));
        // closing
        if (t >= OUT && !VID.collecting) {
          const o = t - OUT; if (o < 0.07) fillAll(PAPER);
          const [lw, lh] = logoBox(560), lp = pop(t, OUT + 0.1); if (lp > 0) { const c = G(); c.translate(sx, 620); c.scale(lp, lp); c.drawImage(IMG.logoW, -lw / 2, -lh / 2, lw, lh); D(); }
          const es = Math.min(150, fitSize(END, 900, 960, 150, DSP, 0)), ep = seg(t, OUT + 0.35, 0.25); if (ep > 0) { const c = G(), x = sx + (1 - E.outBack(ep)) * 800; setF(F(900, es, DSP), 0); c.textAlign = 'center'; c.fillStyle = ACC2; c.fillText(END, x + 8, 620 + lh / 2 + 220 + 10); c.fillStyle = WHT; c.fillText(END, x, 620 + lh / 2 + 220); D(); }
          labelBox(CONTACT.cta, sx, 620 + lh / 2 + 370, Math.min(48, fitSize(CONTACT.cta, 900, 900, 48, DSP, 0)), seg(t, OUT + 0.7, 0.25), { rot: 0, bg: ACC2, col: OR });
          const ip = seg(t, OUT + 1.0, 0.3); if (ip > 0) K7.txt(K7.contact().join('   ·   '), sx, 620 + lh / 2 + 490, F(800, 32, SANS), WHT, { align: 'center', a: ip, ls: 2 });
          if (HOURS) labelBox(HOURS, sx, 620 + lh / 2 + 600, 40, seg(t, OUT + 1.2, 0.25), { rot: 0.03, bg: OR, col: K7.on(OR) });
        }
      },
      cues() {
        const ev = [['whoosh', b(0), 0.3, -0.5], ['clack', b(0) + 0.2, 0.45, -0.3], ['whoosh', b(1), 0.3, 0.5], ['clack', b(1) + 0.2, 0.45, 0.3], ['ticks', b(2), 0.3, 0, { dur: 0.5, n: 12 }], ['pop', b(2) + 0.5, 0.3, 0]];
        if (HOURS) ev.push(['pop', b(3), 0.3, 0]);
        for (let k = 0; k < 3; k++) { ev.push(['pop', C0 + k * 2 * BT, 0.45, (k - 1) * 0.5]); if (k < 2) ev.push(['tink', C0 + (2 * k + 1) * BT, 0.25, 0]); }
        ev.push(['clack', b(9), 0.4, 0]); ev.push(['impact', b(10), 0.5, 0]); ev.push(['chime', b(10) + 0.05, 0.3, 0]); ev.push(['pop', b(11), 0.35, 0]);
        [SH0, SH0 + 3 * BT, SH0 + 6 * BT].forEach(tc => { ev.push(['whoosh', tc, 0.3, 0.3]); ev.push(['clack', tc + 0.12, 0.35, 0]); });
        ev.push(['impact', OUT, 0.45, 0]); ev.push(['pop', OUT + 0.1, 0.4, 0]); ev.push(['whoosh', OUT + 0.35, 0.25, 0.4]); ev.push(['clack', OUT + 0.7, 0.4, 0]);
        return { dur: DUR, beds: [musicBed(DUR, { start: b(0) })], events: ev };
      },
    };
  }

  // ================================================================ TODAY'S SPECIAL
  // The kitchen ticket: it prints line by line from the pass, a rubber stamp lands, then it hangs on the ticket rail and
  // sways while the footage plays behind it. Mono type on paper; the ticket drops away for the closing.
  function today() {
    const DAY = TX('day', 'TODAY', { label: 'Day', group: 'The ticket', upper: true, max: 10, hint: 'TODAY, or a weekday like TUESDAY' });
    const DISH = TX('dish', 'SHORT RIB RAGU', { label: 'Dish name', group: 'The ticket', upper: true, max: 30, req: true });
    const DESC = TX('desc', 'Slow-braised short rib, fresh pappardelle, parmesan', { label: 'Description', group: 'The ticket', max: 70, req: true });
    const PRICE = TX('price', '', { label: 'Price', group: 'The ticket', max: 9, hint: 'Optional. Leave it empty and no price prints.' });
    const STAMP = TX('stamp', 'TODAY ONLY', { label: 'Stamp', group: 'The ticket', upper: true, max: 14 });
    const NOTE = TX('note', '', { label: 'Handwritten note', group: 'Over the footage', max: 30, hint: 'Optional, e.g. ask for it by name' });
    const END = TX('end', 'COME HUNGRY.', { label: 'Ending line', group: 'Ending', upper: true, max: 20 });
    const P0 = 0.55, P1 = 3.9, ST = 4.15, MV = 5.0, F0 = 5.7, SD = 2.0, OUT = F0 + 3 * SD, DUR = OUT + 3.6;
    const S = shots([['s1', 'The special', SD + 0.2, 'any', 'v'], ['s2', 'Close-up', SD + 0.2, 'any', 'v'], ['s3', 'Served', SD + 0.2, 'any', 'v']], F0);
    S.forEach((s, k) => (s.start = F0 + k * SD));
    // ticket layout (paper coords, 600 wide)
    const TW = 600, M = 46;
    let LY = null;
    const ly = () => LY || (LY = (() => {   // measured on the first frame, once fonts are in
      const dl = K7.fitLines(DISH, 800, 'Mono', TW - 2 * M, 54, 3), ds = K7.fitLines(DESC, 500, 'Mono', TW - 2 * M, 28, 4);
      const rows = [], add = (kind, txt, h, o) => rows.push(Object.assign({ kind, txt, h }, o || {}));
      add('c', up(BRAND.short || BRAND.name), 64, { f: F(800, 30, 'Mono') }); add('dash', '', 34);
      add('c', (DAY === 'TODAY' ? 'TODAY’S' : DAY + '’S') + ' SPECIAL', 58, { f: F(800, 34, 'Mono'), col: 'acc' }); add('dash', '', 34);
      dl.lines.forEach(l => add('l', l, dl.size * 1.12, { f: F(800, dl.size, 'Mono') })); add('gap', '', 16);
      ds.lines.forEach(l => add('l', l, ds.size * 1.4, { f: F(500, ds.size, 'Mono') }));
      if (PRICE) { add('dash', '', 40); add('price', PRICE, 60, { f: F(800, 34, 'Mono') }); }
      add('stamp', '', 170); add('bar', '', 70); add('gap', '', 30);
      let yy = 40; rows.forEach(r => { r.y = yy; yy += r.h; }); return { rows, TH: yy + 30 };
    })());
    function ticket(x, y, s, rot, vis, a) {   // draws the ticket with its top-centre at x, y; vis = visible length (paper px)
      if (VID.collecting || a <= 0) return; const { rows, TH } = ly(), c = G(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); c.scale(s, s); c.translate(-TW / 2, 0);
      const L = Math.min(TH, vis); c.save(); c.beginPath(); c.rect(-20, 0, TW + 60, L + 4); c.clip();
      c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 30; c.shadowOffsetY = 14; c.fillStyle = PAPER; c.beginPath(); c.moveTo(0, 0); c.lineTo(TW, 0); c.lineTo(TW, TH - 14);
      for (let x2 = TW; x2 >= 0; x2 -= 20) c.lineTo(x2, TH - (x2 / 20 % 2 ? 0 : 14)); c.closePath(); c.fill(); c.shadowColor = 'transparent';
      const ink = LIGHTPAL ? WHT : '#23201C';
      for (const r of rows) {
        if (r.y > L) break; c.fillStyle = r.col === 'acc' ? OR : ink; c.textBaseline = 'alphabetic';
        if (r.kind === 'c') { setF(r.f, 4); c.textAlign = 'center'; c.fillText(r.txt, TW / 2, r.y + r.h * 0.62); }
        else if (r.kind === 'l') { setF(r.f, 0); c.textAlign = 'left'; c.fillText(r.txt, M, r.y + r.h * 0.78); }
        else if (r.kind === 'dash') { c.globalAlpha = 0.55 * a; for (let x2 = M; x2 < TW - M; x2 += 22) c.fillRect(x2, r.y + r.h / 2, 12, 3); c.globalAlpha = a; }
        else if (r.kind === 'price') { setF(r.f, 2); c.textAlign = 'left'; c.fillText('PRICE', M, r.y + r.h * 0.7); c.textAlign = 'right'; c.fillText(r.txt, TW - M, r.y + r.h * 0.7); c.globalAlpha = 0.5 * a; for (let x2 = M + 150; x2 < TW - M - textW(r.txt, r.f, 2) - 24; x2 += 16) c.fillRect(x2, r.y + r.h * 0.62, 5, 5); c.globalAlpha = a; }
        else if (r.kind === 'bar') { const rr = rng(77); for (let x2 = M; x2 < TW - M;) { const w = 2 + Math.floor(rr() * 7); if (rr() > 0.35) c.fillRect(x2, r.y + 6, w, r.h - 24); x2 += w + 2 + Math.floor(rr() * 4); } }
      }
      c.restore();
      // the stamp
      const sp = seg(TT, ST, 0.18); if (sp > 0) { const f = F(800, 54, 'Mono'), w = textW(STAMP, f, 6) + 70, sc = lerp(1.7, 1, E.outC(sp)); const srow = rows.find(r => r.kind === 'stamp'); c.save(); c.translate(TW / 2, srow.y + srow.h / 2); c.rotate(-0.1); c.scale(sc, sc); c.globalAlpha = a * clamp(sp * 3) * 0.88; c.strokeStyle = OR; c.lineWidth = 7; c.strokeRect(-w / 2, -54, w, 108); c.lineWidth = 2.5; c.strokeRect(-w / 2 + 12, -42, w - 24, 84); setF(f, 6); c.fillStyle = OR; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(STAMP, 3, 3);
        c.globalCompositeOperation = 'destination-out'; const rr = rng(13); for (let i = 0; i < 90; i++) { c.globalAlpha = 0.5 * rr(); c.fillRect(-w / 2 + rr() * w, -54 + rr() * 108, 2 + rr() * 6, 2 + rr() * 5); } c.restore(); }
      D();
    }
    let TT = 0;
    function steel(t) { if (VID.collecting) return; const c = G(), g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, DEEP1); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); c.globalAlpha = 0.05; c.fillStyle = WHT; const rr = rng(5); for (let i = 0; i < 70; i++) c.fillRect(0, rr() * H, W, 1); D(); }
    function rail(y, a) { if (VID.collecting || a <= 0) return; const c = G(); c.globalAlpha = a; const g = c.createLinearGradient(0, y - 18, 0, y + 18); g.addColorStop(0, '#9A9E9C'); g.addColorStop(0.5, '#E9ECEA'); g.addColorStop(1, '#6E7270'); c.fillStyle = g; c.fillRect(0, y - 16, W, 32); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, y + 16, W, 6); D(); }
    return {
      dur: DUR, shakes: [[ST + 0.05, 9]],
      render(t) {
        TT = t; steel(t);
        // footage behind the hanging ticket: pushes left
        if (t >= MV && t < OUT + 0.4) {
          const fo = 1 - seg(t, OUT - 0.1, 0.5), { i, sh } = cur(S, Math.max(t, F0)), into = i > 0 ? seg(t, sh.start - 0.2, 0.4) : seg(t, MV, 0.7), r = stageRect(sh, 1000);
          const off = (1 - E.inOutC(into)) * W;
          if (i > 0 && into < 1) { const pv = S[i - 1], r2 = stageRect(pv, 1000); K7.photo(pv, t, [r2[0] - (W - off), r2[1], r2[2], r2[3]], { alpha: fo }); }
          K7.photo(sh, t, [r[0] + off, r[1], r[2], r[3]], { lt: Math.max(0, t - sh.start), alpha: fo });
          if (!VID.collecting && fo > 0) { ctx.save(); ctx.globalAlpha = fo; if (r[3] >= H - 2) { shade(0, 640, 0.75, 0, BLK); shade(H * 0.62, H, 0, 0.88, BLK); } else shade(H * 0.66, H, 0, 0.7, BLK); ctx.restore(); }
        }
        if (VID.collecting) return;
        // the pass: printer head at the top, then the rail
        const hq = seg(t, MV - 0.2, 0.5);
        if (hq < 1) { const c = G(); c.globalAlpha = 1 - hq; c.fillStyle = '#2B2F2D'; c.fillRect(40, 170, W - 80, 80); c.fillStyle = '#0B0C0C'; c.fillRect(70, 236, W - 140, 14); setF(F(700, 22, 'Mono'), 5); c.fillStyle = 'rgba(255,255,255,0.4)'; c.textAlign = 'center'; c.fillText('ORDER UP', W / 2, 220); D(); }
        rail(250, seg(t, MV - 0.1, 0.4) * (1 - seg(t, OUT - 0.3, 0.4)));
        // the ticket: prints, gets stamped, moves to the rail and sways, drops away for the closing
        const { rows, TH } = ly(), steps = rows.length, u = seg(t, P0, P1 - P0), su = u * steps, vis = TH * ((Math.floor(su) + E.outC(su % 1)) / steps), mv = E.inOutC(seg(t, MV, 0.7));
        const drop = E.inC(seg(t, OUT - 0.2, 0.6));
        const x = lerp(W / 2, 286, mv), y = lerp(250, 268, mv) + drop * 2400, s = lerp(Math.min(1.5, 1380 / TH), 0.66, mv), rot = mv * (0.04 * Math.sin((t - MV) * 2.1)) + drop * 0.5;
        ticket(x, y, s, rot, u >= 1 ? TH : vis, 1);
        if (mv > 0) { const c = G(); c.translate(x, y); c.rotate(rot); c.fillStyle = '#C9CDCB'; c.fillRect(-40, -22, 80, 34); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(-40, 8, 80, 4); D(); }
        // over the footage: the dish name big and low, the handwritten note
        if (t >= F0 && t < OUT) {
          const p = seg(t, F0 + 0.2, 0.4), q = seg(t, OUT - 0.3, 0.3), L = K7.fitLines(DISH, 400, DSP, 940, 170, 2);
          L.lines.forEach((ln, k) => T([[ln, WHT]], 72, 1320 + k * L.size * 1.0 - (L.lines.length - 1) * L.size * 1.0, F(400, L.size, DSP), { p: seg(t, F0 + 0.2 + k * 0.1, 0.45), q, ls: 1 }));
          if (NOTE) { const np = seg(t, F0 + 1.0, 0.8); if (np > 0) hand(NOTE, 78, 1415, 56, np, { col: ACC2, rot: -0.03, align: 'left', q }); }
          const c = G(); c.globalAlpha = E.outC(p) * (1 - q); c.fillStyle = OR; c.fillRect(72, 1360, 90 * E.outC(p), 6); D();
        }
        // closing
        if (t >= OUT) {
          const o = t - OUT, es = Math.min(190, fitSize(END, 400, 940, 190, DSP, 1)), [lw, lh] = logoBox(520);
          T([[END, WHT]], W / 2, 820, F(400, es, DSP), { align: 'center', p: seg(o, 0.3, 0.5), ls: 1 });
          const cp = seg(o, 0.8, 0.3); if (cp > 0) { const c = G(), f = F(800, Math.min(32, fitSize(CONTACT.cta, 800, 840, 32, 'Mono', 5)), 'Mono'), bw = Math.min(960, textW(CONTACT.cta, f, 4) + 90); c.globalAlpha = E.outC(cp); c.fillStyle = OR; c.fillRect(W / 2 - bw / 2, 900, bw * E.outC(cp), 84); setF(f, 4); c.fillStyle = K7.on(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CONTACT.cta, W / 2 + 2, 943); D(); }
          const ip = seg(o, 1.1, 0.4); if (ip > 0) K7.txt(K7.contact().join('   ·   '), W / 2, 1060, F(700, 28, 'Mono'), WA(0.8), { align: 'center', a: ip, ls: 2 });
          const lp = seg(o, 1.3, 0.5); if (lp > 0) K7.logo(W / 2, 1200 + lh / 2, 520, E.outC(lp));
        }
      },
      cues() {
        const ev = [['switch', 0.3, 0.3, 0]]; const steps = ly().rows.length;
        for (let k = 0; k < steps; k++) ev.push(['ticks', P0 + (P1 - P0) * k / steps, 0.12, 0, { dur: (P1 - P0) / steps * 0.8, n: 5 }]);
        ev.push(['paper', P1 + 0.1, 0.25, 0]); ev.push(['stamp', ST, 0.6, 0]); ev.push(['paper', MV + 0.1, 0.3, -0.3]); ev.push(['clack', MV + 0.65, 0.35, -0.3]);
        S.forEach((s, k) => { if (k) ev.push(['whoosh', s.start, 0.22, 0.3]); });
        ev.push(['paper', OUT - 0.1, 0.35, 0]); ev.push(['whoosh', OUT + 0.3, 0.2, 0]); ev.push(['stamp', OUT + 0.8, 0.3, 0]); ev.push(['tink', OUT + 1.3, 0.15, 0]);
        return { dur: DUR, beds: [musicBed(DUR, { start: 0.2 })], events: ev };
      },
    };
  }

  // ================================================================ MENU ICONS
  // One item, presented like a design object: a six-column grid, the name set vertically along the left edge, the footage
  // revealed in slats, a numbered parts list hanging off the frame, a spec table, precise linear motion.
  function icon() {
    const NUM = TX('num', '01', { label: 'Number', group: 'The item', max: 3 });
    const KICK = TX('kick', 'SIGNATURE ITEM', { label: 'Small line', group: 'The item', upper: true, max: 24 });
    const NAME = TX('dish', 'THE DOUBLE SMASH', { label: 'Item name', group: 'The item', upper: true, max: 22, req: true });
    const PARTS = ['TOASTED BRIOCHE BUN', 'TWO SMASHED PATTIES', 'HOUSE SAUCE'].map((d, k) => TX('p' + (k + 1), d, { label: 'Part ' + (k + 1), group: 'What’s in it', upper: true, max: 26 }));
    const SERVED = TX('served', '', { label: 'Served with', group: 'Spec sheet', max: 26, hint: 'Optional. Empty rows are left out.' });
    const PAIRS = TX('pairs', '', { label: 'Pairs with', group: 'Spec sheet', max: 26, hint: 'Optional' });
    const PRICE = TX('price', '', { label: 'Price', group: 'Spec sheet', max: 9, hint: 'Optional' });
    const END = TX('end', 'Built to be the favourite.', { label: 'Closing line', group: 'Ending', max: 36 });
    const T1 = 1.0, T2 = 6.6, OUT = 11.2, DUR = OUT + 3.8;
    const S = shots([['s1', 'The item', T2 - T1 + 0.4, 'any'], ['s2', 'Another angle', OUT - T2, 'any']], T1);
    S[1].start = T2;
    const X0 = 72, X1 = W - 72, CW = (X1 - X0) / 6;
    const spec = [['SERVED WITH', SERVED], ['PAIRS WITH', PAIRS], ['PRICE', PRICE]].filter(r => nz(r[1]));
    let NS0 = 0; const NSf = () => NS0 || (NS0 = Math.min(230, fitSize(NAME, 900, 1300, 230, DSP, 0)));
    function grid(p, q) {
      if (VID.collecting || p <= 0) return; const c = G(); c.globalAlpha = 1 - q; c.fillStyle = WA(0.12);
      for (let k = 0; k <= 6; k++) { const h = 1480 * E.inOutC(clamp(p * 1.4 - k * 0.06)); c.fillRect(X0 + k * CW - 0.5, 210, 1, h); }
      for (const y of [270, 1690]) c.fillRect(X0, y, (X1 - X0) * E.inOutC(p), 1); D();
    }
    function frameOf(sh) { return vert(sh) ? K3.wholeIn(sh.c, [X0 + 3 * CW - 20, 540, 3 * CW + 20, 760]) : K3.wholeIn(sh.c, [X0 + 1.5 * CW, 540, 4.5 * CW, 560]); }
    function slats(sh, t, r, u, lt) {   // the frame revealed (or swapped) in six vertical slats
      const n = 6, sw = r[2] / n;
      for (let k = 0; k < n; k++) { const v = E.inOutC(clamp(u * 1.6 - k * 0.12)); if (v <= 0) continue; ctx.save(); ctx.beginPath(); ctx.rect(r[0] + k * sw, r[1] + r[3] * (1 - v), sw + 0.5, r[3] * v); ctx.clip(); K7.photo(sh, t, r, { lt }); ctx.restore(); }
    }
    return {
      dur: DUR, shakes: [],
      render(t) {
        if (!VID.collecting) { const c = G(); c.fillStyle = BLK; c.fillRect(-20, -20, W + 40, H + 40); D(); }
        const q = seg(t, OUT - 0.4, 0.5); grid(seg(t, 0.05, 1.1), q);
        // header row
        if (!VID.collecting && t < OUT + 0.2) {
          const hp = seg(t, 0.3, 0.4); K7.txt(KICK, X0, 250, F(700, 22, 'Mono'), WHT, { a: E.outC(hp) * (1 - q), ls: 4 });
          K7.txt(up(BRAND.short || BRAND.name), X1, 250, F(700, 22, 'Mono'), WA(0.55), { align: 'right', a: E.outC(hp) * (1 - q), ls: 4 });
          const np = seg(t, 0.5, 0.6); if (np > 0) { const c = G(); c.globalAlpha = (1 - q) * E.outC(np); setF(F(900, 230, DSP), -4); c.textAlign = 'right'; c.textBaseline = 'alphabetic'; c.strokeStyle = WHT; c.lineWidth = 2.5; c.strokeText(NUM, X1 - (1 - E.outC(np)) * 60, 470); setF(F(700, 26, 'Mono'), 2); c.fillStyle = OR; c.fillText('Nº', X1 - textW(NUM, F(900, 230, DSP), -4) - 18, 300); D(); }
        }
        // the name, vertical along the left edge
        if (!VID.collecting && t < OUT + 0.2) { const NS = NSf(), p = seg(t, 1.0, 0.7), c = G(); c.globalAlpha = 1 - q; c.beginPath(); c.rect(X0 - 10, 280, NS + 30, 1400); c.clip(); c.translate(X0 + NS * 0.78, 1680 + (1 - E.outC(p)) * 1400); c.rotate(-Math.PI / 2); setF(F(900, NS, DSP), 0); c.fillStyle = WHT; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText(NAME, 0, 0); D(); }
        // the frame: slats in, slats to the second shot
        if (t >= T1 + 0.3 && t < OUT + 0.3) {
          const sh0 = S[0], sh1 = S[1], r0 = frameOf(sh0), r1 = frameOf(sh1), sw = seg(t, T2, 0.9);
          ctx.save(); ctx.globalAlpha = 1 - q;
          if (sw < 1) slats(sh0, t, r0, seg(t, T1 + 0.4, 1.0), t - T1);
          if (sw > 0) slats(sh1, t, r1, sw, t - T2);
          ctx.restore();
          if (!VID.collecting) { const r = sw > 0.5 ? r1 : r0, c = G(); c.globalAlpha = (1 - q) * seg(t, T1 + 1.2, 0.4); c.strokeStyle = WHT; c.lineWidth = 2; c.strokeRect(r[0] - 10, r[1] - 10, r[2] + 20, r[3] + 20); c.fillStyle = OR; for (const [x, y] of [[r[0] - 10, r[1] - 10], [r[0] + r[2] + 10, r[1] - 10], [r[0] - 10, r[1] + r[3] + 10], [r[0] + r[2] + 10, r[1] + r[3] + 10]]) c.fillRect(x - 5, y - 5, 10, 10); D(); }
        }
        if (VID.collecting) return;
        // callouts: numbered ticks on the frame's bottom edge, the numbered parts list below
        const r0 = frameOf(S[0]), pq = seg(t, T2 - 0.3, 0.4), lx = X0 + 1.5 * CW, ly0 = Math.max(r0[1] + r0[3] + 190, 1170);
        if (t >= T1 + 1.6 && pq < 1) PARTS.forEach((pt, k) => {
          const tk = T1 + 1.7 + k * 0.7, p = seg(t, tk, 0.5); if (p <= 0) return;
          const mx = r0[0] + r0[2] * (0.2 + 0.3 * k), my = r0[1] + r0[3] + 10, c = G(); c.globalAlpha = 1 - pq;
          c.fillStyle = OR; c.fillRect(mx - 1, my, 2, 46 * E.outC(p)); c.fillRect(mx - 6, my - 6, 12, 12); setF(F(700, 22, 'Mono'), 1); c.textAlign = 'center'; c.fillText('0' + (k + 1), mx, my + 76); D();
          const ry = ly0 + k * 92, lp = seg(t, tk + 0.2, 0.5); if (lp <= 0) return;
          const c2 = G(); c2.globalAlpha = 1 - pq; c2.fillStyle = WA(0.35); c2.fillRect(lx, ry + 26, (X1 - lx) * E.inOutC(lp), 1); c2.fillStyle = OR; c2.fillRect(lx, ry - 26, 44, 34); setF(F(700, 22, 'Mono'), 1); c2.fillStyle = K7.on(OR); c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText('0' + (k + 1), lx + 22, ry - 8); D();
          K7.txt(pt, lx + 66 + (1 - E.outC(lp)) * 30, ry, F(700, Math.min(38, fitSize(pt, 700, X1 - lx - 70, 38, SANS, 1)), SANS), WHT, { a: E.outC(lp) * (1 - pq), ls: 1 });
        });
        // spec table (only the rows that were given; if none, the closing line takes the space)
        if (t >= T2 + 0.5 && t < OUT + 0.2) {
          const r1 = frameOf(S[1]), y0 = Math.max(r1[1] + r1[3] + 120, 1220);
          const rowsT = spec.length ? spec : [['', END]];
          rowsT.forEach(([lab, val], k) => {
            const p = seg(t, T2 + 0.8 + k * 0.3, 0.5), y = y0 + k * 110; if (p <= 0) return; const c = G(); c.globalAlpha = 1 - q; c.fillStyle = WA(0.4); c.fillRect(lx, y + 34, (X1 - lx) * E.inOutC(p), 1); D();
            if (lab) K7.txt(lab, lx, y, F(700, 22, 'Mono'), OR, { a: E.outC(p) * (1 - q), ls: 3 });
            K7.txt(lab ? val : val, lab ? X1 : lx, y, lab ? F(700, Math.min(40, fitSize(val, 700, 420, 40, SANS, 0)), SANS) : F(400, Math.min(52, fitSize(val, 400, X1 - lx, 52, SER, 0, 'italic')), SER, 'italic'), WHT, { align: lab ? 'right' : 'left', a: E.outC(p) * (1 - q) });
          });
        }
        // closing
        if (t >= OUT) {
          const o = t - OUT, [lw, lh] = logoBox(440), ns = Math.min(150, fitSize(NAME, 900, 940, 150, DSP, 0));
          const lp = seg(o, 0.2, 0.5); if (lp > 0) K7.logo(W / 2, 540, 440, E.outC(lp));
          const np = seg(o, 0.45, 0.5); if (np > 0) { const c = G(); c.beginPath(); c.rect(0, 540 + lh / 2 + 40, W, ns * 1.1); c.clip(); setF(F(900, ns, DSP), 0); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(NAME, W / 2, 540 + lh / 2 + 40 + ns * 0.92 + (1 - E.outC(np)) * ns); D(); }
          const ep = seg(o, 0.8, 0.6); if (ep > 0) K7.txt(END, W / 2, 540 + lh / 2 + 110 + ns, F(400, Math.min(56, fitSize(END, 400, 940, 56, SER, 0, 'italic')), SER, 'italic'), WA(0.8), { align: 'center', a: E.outC(ep) });
          const cp = seg(o, 1.1, 0.4); if (cp > 0) { const c = G(), f = F(700, Math.min(30, fitSize(CONTACT.cta, 700, 840, 30, 'Mono', 5)), 'Mono'), bw = Math.min(940, textW(CONTACT.cta, f, 4) + 100), y = 540 + lh / 2 + 230 + ns; c.globalAlpha = E.outC(cp); c.fillStyle = OR; c.fillRect(W / 2 - bw / 2, y, bw, 86); setF(f, 4); c.fillStyle = K7.on(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CONTACT.cta, W / 2 + 2, y + 44); D();
            K7.txt(K7.contact().join('   /   '), W / 2, y + 160, F(700, 26, 'Mono'), WA(0.7), { align: 'center', a: seg(o, 1.4, 0.4), ls: 2 }); }
        }
      },
      cues() {
        const ev = [['ticks', 0.1, 0.18, 0, { dur: 1.0, n: 10 }], ['clack', 0.55, 0.3, 0.4], ['whoosh', 1.0, 0.2, -0.4]];
        for (let k = 0; k < 6; k++) ev.push(['tick', T1 + 0.4 + k * 0.12, 0.25, -0.5 + k * 0.2]);
        PARTS.forEach((_, k) => { ev.push(['switch', T1 + 1.7 + k * 0.7, 0.18, 0.2]); ev.push(['tink', T1 + 2.1 + k * 0.7, 0.12, 0.3]); });
        for (let k = 0; k < 6; k++) ev.push(['tick', T2 + k * 0.12, 0.25, -0.5 + k * 0.2]);
        (spec.length ? spec : [1]).forEach((_, k) => ev.push(['switch', T2 + 0.8 + k * 0.3, 0.15, 0]));
        ev.push(['air', OUT, 0.2, 0]); ev.push(['clack', OUT + 0.45, 0.3, 0]); ev.push(['chime', OUT + 1.1, 0.2, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ AFTER HOURS
  // The bar at night: a neon sign buzzes on, the footage sits on a wet bar top with its reflection rippling below, drink
  // names arrive with tracking that snaps tight on the beat, light breathes with the kick. Cuts every six beats.
  function after() {
    const BT = 60 / FM.bpm, b = k => 0.2 + k * BT;
    const SIGN = TX('sign', 'after hours', { label: 'Neon sign', group: 'Opening', max: 16, hint: 'Shown in the neon script' });
    const KICK = TX('kick', 'COCKTAILS', { label: 'Line under the sign', group: 'Opening', upper: true, max: 12 });
    const DR = [['MIDNIGHT MULE', 'VODKA · GINGER · LIME'], ['SMOKE & HONEY', 'MEZCAL · HONEY · BITTERS'], ['VELVET SOUR', 'WHISKEY · LEMON · CHERRY']].map(([n, d], k) => ({
      n: TX(k ? 'dish' + (k + 1) : 'dish', n, { label: 'Drink ' + (k + 1), group: 'Drink ' + (k + 1), upper: true, max: 18, req: true }), d: TX(k ? 'desc' + (k + 1) : 'desc', d, { label: 'What’s in it', group: 'Drink ' + (k + 1), upper: true, max: 32 }) }));
    const HOURS = TX('hours', '', { label: 'Hours', group: 'Ending', upper: true, max: 24, hint: 'Optional, e.g. THURS – SAT TILL 2AM' });
    const END = TX('end', 'see you tonight', { label: 'Closing line (neon script)', group: 'Ending', max: 20 });
    const LEGAL = TX('legal', '', { label: 'Small print', group: 'Ending', max: 40, hint: 'Optional, e.g. 21+ · Please drink responsibly' });
    const D0 = b(4), DL = 6 * BT, OUT = D0 + 3 * DL, DUR = OUT + 3.6;
    const S = shots(DR.map((d, k) => ['s' + (k + 1), 'Drink ' + (k + 1), DL + 0.2, 'any']), D0);
    S.forEach((s, k) => (s.start = D0 + k * DL));
    const beat = t => { if (t < D0) return 0; const u = ((t - D0) / BT) % 1; return Math.exp(-u * 5); };
    let SS0 = 0; const SSf = () => SS0 || (SS0 = Math.min(230, fitSize(SIGN, 600, 900, 230, SCR, 0)));
    function flick(t, t0) {   // a neon tube coming on: a few stutters, then steady with a faint hum
      const u = t - t0; if (u < 0) return 0; if (u > 1.1) return 0.93 + 0.07 * Math.sin(t * 37) * Math.sin(t * 13);
      const on = [[0, 0.06], [0.14, 0.2], [0.26, 0.28], [0.45, 0.62], [0.7, 2]]; return on.some(([a, z]) => u >= a && u < z) ? 1 : 0.08;
    }
    function neon(str, x, y, f, col, k, o) {   // glowing text: soft halo, bright core
      if (VID.collecting || k <= 0) return; o = o || {}; const c = G(); setF(f, o.ls || 0); c.textAlign = o.align || 'center'; c.textBaseline = 'alphabetic';
      if (o.s && o.s !== 1) { c.translate(x, y); c.scale(o.s, o.s); c.translate(-x, -y); }
      c.globalAlpha = (o.a === undefined ? 1 : o.a) * k; c.globalCompositeOperation = 'lighter'; c.shadowColor = col; c.fillStyle = col;
      c.shadowBlur = 60; c.fillText(str, x, y); c.shadowBlur = 22; c.fillText(str, x, y); c.globalCompositeOperation = 'source-over'; c.shadowBlur = 6; c.fillStyle = mix(col, '#FFFFFF', 0.72); c.fillText(str, x, y); D();
    }
    function reflect(y0, h, y1, rh, a, t) {   // mirror rows [y0, y0+h) below y1 with a ripple
      if (VID.collecting || a <= 0) return; const src = ctx.canvas, c = G(); c.setTransform(1, 0, 0, 1, 0, 0);
      for (let j = 0; j < rh; j += 4) { const sy = y0 + h - 1 - j * (h / rh); if (sy < y0) break; const dx = Math.sin(j * 0.09 + t * 2.4) * (2 + j * 0.03); c.globalAlpha = a * (1 - j / rh) * (1 - j / rh); c.drawImage(src, 0, sy, W, 4, dx, y1 + j, W, 4); }
      D();
    }
    return {
      dur: DUR, shakes: [],
      render(t) {
        if (!VID.collecting) { const c = G(), g = c.createRadialGradient(W / 2, 760, 50, W / 2, 900, 1300); g.addColorStop(0, mix(DEEP1, OR, 0.06 + 0.05 * beat(t))); g.addColorStop(0.5, BLK); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); }
        const k1 = flick(t, 0.25), mv = E.inOutC(seg(t, D0 - 0.35, 0.5)), q = seg(t, OUT - 0.35, 0.35);
        // footage on the bar top
        let band = null;
        if (t >= D0 - 0.05 && t < OUT) {
          const { i, sh } = cur(S, Math.max(t, D0)), lt = t - S[i].start, r = vert(sh) ? K3.wholeIn(sh.c, [0, 0, W, H]) : stageRect(sh, 760);
          const ip = seg(t, S[i].start, 0.14);
          ctx.save(); ctx.globalAlpha = (1 - q) * (i === 0 ? seg(t, D0 - 0.05, 0.3) : 1); K7.photo(sh, t, r, { lt }); ctx.restore();
          if (!VID.collecting) {
            if (r[3] >= H - 2) { shade(0, 700, 0.85, 0, BLK); shade(H * 0.5, H, 0, 0.92, BLK); }
            else { band = r; const c = G(); c.globalAlpha = (1 - q) * (0.75 + 0.25 * beat(t)); c.fillStyle = OR; c.shadowColor = OR; c.shadowBlur = 24; c.fillRect(0, r[1] - 3, W, 3); c.fillStyle = ACC2; c.shadowColor = ACC2; c.fillRect(0, r[1] + r[3], W, 2); D(); reflect(r[1], r[3], r[1] + r[3] + 4, 420, 0.32 * (1 - q), t); }
            if (ip < 1) fillAll('#FFFFFF', 0.14 * (1 - ip));
          }
        }
        if (VID.collecting) return;
        // the sign: big and centred at first, then up into the header where it breathes with the beat
        if (t < OUT) {
          const SS = SSf(), sy = lerp(760, 300, mv), sc = lerp(1, 0.46, mv), kk = k1 * (1 - q) * (mv > 0 ? 0.82 + 0.18 * beat(t) : 1);
          neon(SIGN, W / 2, sy, F(400, SS, SCR), OR, kk, { s: sc });
          neon(KICK, W / 2, sy + 190 * sc, F(400, Math.min(84, fitSize(KICK, 400, 860, 84, DSP, 6)), DSP), ACC2, flick(t, 0.95) * (1 - q), { ls: 6, s: sc });
          if (mv < 1) reflect(sy - SS * 0.9, SS * 1.6 + 200, 1180, 380, 0.22 * (1 - mv), t);
        }
        // the drinks: kinetic names, ingredients, an index
        if (t >= D0 && t < OUT) {
          const k = Math.min(2, Math.floor((t - D0) / DL)), t0 = D0 + k * DL, p = seg(t, t0 + 0.15, 0.55), x2 = seg(t, t0 + DL - 0.3, 0.3);
          const y = band ? Math.min(1300, band[1] + band[3] + 210) : 1340, nm = DR[k].n, fs = Math.min(118, fitSize(nm, 800, 960, 118, SANS, 2));
          const ls = lerp(46, 2, E.outExpo(p)) + x2 * 30;
          neon(nm, W / 2, y, F(800, fs, SANS), OR, E.outC(p) * (1 - x2) * (0.8 + 0.2 * beat(t)), { ls, a: 0.75 });
          K7.txt(nm, W / 2, y, F(800, fs, SANS), WHT, { align: 'center', ls, a: E.outC(p) * (1 - x2) });
          K7.txt(DR[k].d, W / 2, y + 74, F(700, 28, 'Mono'), ACC2, { align: 'center', ls: 4, a: seg(t, t0 + 0.5, 0.4) * (1 - x2) });
          K7.txt('0' + (k + 1) + ' / 03', W / 2, y + 140, F(700, 22, 'Mono'), WA(0.5), { align: 'center', ls: 4, a: seg(t, t0 + 0.6, 0.4) * (1 - x2) });
        }
        // closing: the logo comes on like neon, the script line, hours, a neon-outlined CTA
        if (t >= OUT) {
          const o = t - OUT, kk = flick(t, OUT + 0.1), [lw, lh] = logoBox(640), ly = 560;
          if (kk > 0) { const c = G(); c.globalAlpha = kk; c.globalCompositeOperation = 'lighter'; c.shadowColor = OR; c.shadowBlur = 50; c.drawImage(K7.tinted(IMG.logoW, OR), W / 2 - lw / 2, ly - lh / 2, lw, lh); c.globalCompositeOperation = 'source-over'; c.shadowBlur = 0; c.globalAlpha = kk * 0.85; c.drawImage(IMG.logoW, W / 2 - lw / 2, ly - lh / 2, lw, lh); D(); }
          neon(END, W / 2, ly + lh / 2 + 200, F(400, Math.min(150, fitSize(END, 400, 900, 150, SCR, 0)), SCR), ACC2, flick(t, OUT + 0.6));
          let y = ly + lh / 2 + 300;
          if (HOURS) { K7.txt(HOURS, W / 2, y, F(700, 30, 'Mono'), WHT, { align: 'center', ls: 5, a: seg(o, 1.2, 0.4) }); y += 80; }
          const cp = seg(o, 1.4, 0.4); if (cp > 0) { const c = G(), f = F(800, Math.min(32, fitSize(CONTACT.cta, 800, 840, 32, SANS, 5)), SANS), bw = Math.min(940, textW(CONTACT.cta, f, 4) + 100); c.globalAlpha = E.outC(cp); c.strokeStyle = OR; c.shadowColor = OR; c.shadowBlur = 26; c.lineWidth = 4; c.strokeRect(W / 2 - bw / 2, y, bw, 88); c.shadowBlur = 0; setF(f, 4); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CONTACT.cta, W / 2 + 2, y + 45); D(); }
          K7.txt(K7.contact().join('   ·   '), W / 2, y + 160, F(700, 26, 'Mono'), WA(0.7), { align: 'center', ls: 2, a: seg(o, 1.7, 0.4) });
          if (LEGAL) K7.txt(LEGAL, W / 2, y + 230, F(500, 22, 'Mono'), WA(0.5), { align: 'center', ls: 1, a: seg(o, 1.9, 0.4) });
        }
      },
      cues() {
        const ev = [['switch', 0.25, 0.3, 0], ['switch', 0.39, 0.2, 0], ['switch', 0.7, 0.25, 0], ['switch', 0.95, 0.25, 0.3], ['air', D0 - 0.4, 0.2, 0]];
        S.forEach((s, k) => { ev.push(['whoosh', s.start, 0.2, (k - 1) * 0.4]); ev.push(['tink', s.start + 0.4, 0.22, (k - 1) * 0.3]); ev.push(['tink', s.start + 0.52, 0.14, (k - 1) * 0.3]); });
        ev.push(['switch', OUT + 0.1, 0.3, 0]); ev.push(['switch', OUT + 0.6, 0.25, 0]); ev.push(['chime', OUT + 1.4, 0.2, 0]);
        return { dur: DUR, beds: [musicBed(DUR, { start: D0, intro: D0 })], events: ev };
      },
    };
  }

  const MAKE = { fire, chef, rush, today, icon, after };
  const P = (MAKE[V] || fire)();
  DIR = { dur: P.dur, bg: BLK, finish: { vig: V === 'chef' || V === 'icon' ? 0.12 : 0.3, grain: V === 'chef' || V === 'icon' ? 0.1 : 0.22 }, edl: [], shakes: P.shakes, preload: () => K3.init(), render: P.render, cues: P.cues, fam: V,
    setup() { if (!window.STUDIO && LIGHTPAL) { const w = IMG.logoW; IMG.logoW = IMG.logoB; IMG.logoB = w; } } };
});
