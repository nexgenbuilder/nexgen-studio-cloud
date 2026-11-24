'use strict';
/* Restaurant creative families, part 2 (V10, Oct 30). Ten more visual systems, each with its own composition, type, motion,
   transitions, close and score, built on the V10 engines: K8 typography, K9 motion graphics and KT transitions.
   Footage starts as placeholders for every brand (no stock food); a vertical source fills its frame, a landscape one shows whole.
   Prices, dates and hours are optional and hidden when empty; the names in the fields are sample text to replace.
   ?v=burger    The Burger Drop        launch energy: a 3-2-1 countdown, the drop, an ingredient stack that builds, a date strip
   ?v=sushi     The Art of Sushi       an ivory page, an ink ensō, pieces revealed by a rising curtain, a red seal
   ?v=cheese    The Cheese Pull        the hook: "wait for it", a stretch-o-meter that maxes out, an elastic title, cheese drips
   ?v=pour      The Pour               a drink in an arch-shaped glass, the pour level rising, ingredients drop in, a toast
   ?v=menuedit  The Menu Edit          a printed menu card, items highlighted in turn with round footage insets, a page turn
   ?v=street    Street Food Stories    wheatpaste posters slapped up, a spray-painted tag with drips, a ticker
   ?v=late      Late Night Bites       synthwave: a neon sign, a CRT frame, a scrolling grid floor, VHS glitch cuts
   ?v=fresh     Fresh & Local          kraft paper, botanical sprigs drawn on, stitched frames, handwritten notes, a stamp
   ?v=cater     Catering & Events      black and gold: an art-deco frame, a script title, two-up panels, package tiers
   ?v=brunch    Morning Ritual         a sunrise, rounded frames with steam rising, pill tags, coffee-ring marks */
STUDIO_REG['food2'] = (() => {
  const V = QS.get('v') || 'burger';
  const FM = K7.FAM[V] || K7.FAM.burger;
  if (!window.STUDIO) setBrandColors(FM.pal);
  const G = K3.G, D = K3.D, seg = K7.seg, mix = K7.mix, TAU = Math.PI * 2;
  const NONE = k => ['nofoot.' + k, 0];
  function shots(list, t0, group) {
    const S = K3.shots(list.map(([k, label, d, kind, ph]) => { const s = SHOT(k, NONE(k), { label, group: group || 'Footage', kind: kind || 'any', ph, d: d + 0.3 }); return [s[0], s[1], d]; }));
    S.forEach(s => (s.start += t0 || 0)); return S;
  }
  const vert = s => K7.isVert(s.c);
  const cur = (S, t) => K3.shotAt(S, clamp(t, S[0].start, S[S.length - 1].start + S[S.length - 1].d - 1 / 60));
  const musicBed = (dur, o) => ['music', 0, dur, 0.95, Object.assign({ style: FM.music, bpm: FM.bpm, key: 0, end: dur - 0.6 }, o || {})];
  function shade(y0, y1, a0, a1, col) { if (VID.collecting) return; const c = G(), g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, rgbaOf(col || BLK, a0)); g.addColorStop(1, rgbaOf(col || BLK, a1)); c.fillStyle = g; c.fillRect(-20, y0, W + 40, y1 - y0); D(); }
  const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
  // V10 engines inside a template: K8 text and K9 graphics at a place and a time, KT transitions between two draws
  const L8 = o => Object.assign({ kind: 'text', style: 'type', x: 540, y: 960, t0: 0, d: 3, color: 'white' }, o);
  function type(L, t) { const lt = t - L.t0; if (lt < 0 || lt >= L.d || !L.text) return; const s = K8.xf(L, lt); K8.withLayer(s, K8.box(L), () => K8.type(L, t, s)); }
  function gfx(L, t) { const lt = t - L.t0; if (lt < 0 || lt >= L.d) return; const e = K9.EL[L.type]; if (!e) return; const s = K8.xf(L, lt);
    if (e.full) { if (VID.collecting) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= s.op; K9.draw(L, t, s); ctx.restore(); } else K8.withLayer(s, K9.box(L), () => K9.draw(L, t, s)); }
  function cut(id, t, tc, d, A, B, o) { const u = (t - (tc - d / 2)) / d; if (u <= 0) A(); else if (u >= 1) B(); else KT.run(id, u, A, B, Object.assign({ t }, o || {})); }
  const contactLine = () => K7.contact().join('   ·   ');
  // the close: the logo, an ending line (K8 layer), the call to action (pill, outline or neon) and the contact block
  function close(t, OUT, o) {
    const ot = t - OUT, y = o.y || 640, [lw, lh] = logoBox(o.lw || 680), lp = seg(ot, o.logoAt || 0.2, 0.5);
    if (lp > 0 && !VID.collecting) { const c = G(), s = lerp(o.pop || 1.15, 1, E.outBack(clamp(lp))); c.globalAlpha = clamp(lp * 2.5); c.translate(W / 2, y); c.scale(s, s);
      if (o.glow) { c.shadowColor = o.glow; c.shadowBlur = 40; } c.drawImage(o.dark ? LOGO_LIGHT() : IMG.logoW, -lw / 2, -lh / 2, lw, lh); D(); }
    if (o.line) type(L8(Object.assign({ text: o.line, x: 540, y: y + lh / 2 + 150, w: 980, t0: OUT + 0.75, d: 30, color: o.dark ? 'ink' : 'white' }, o.lineL || {})), t);
    const cy = y + lh / 2 + (o.ctaGap || 330), cp = seg(ot, 1.5, 0.4);
    if (o.cta === 'pill') gfx({ kind: 'mg', type: 'cta', text: CONTACT.cta, color: o.ctaCol || 'accent', x: 540, y: cy, t0: OUT + 1.4, d: 30 }, t);
    else if (cp > 0 && !VID.collecting) { const f = F(o.ctaW || 800, Math.min(36, fitSize(CONTACT.cta, o.ctaW || 800, 820, 36, o.ctaFam || 'Mont', 5)), o.ctaFam || 'Mont'), tw = textW(CONTACT.cta, f, 5), bw = Math.min(960, tw + 100), c = G(); c.globalAlpha = E.outC(cp);
      const col = o.ctaCol ? K8.col(o.ctaCol) : OR;
      if (o.cta === 'neon') { c.shadowColor = col; c.shadowBlur = 30; c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.roundRect(W / 2 - bw / 2, cy - 46, bw, 92, 46); c.stroke(); c.shadowBlur = 12; }
      else if (o.cta === 'underline') { c.fillStyle = col; c.fillRect(W / 2 - tw / 2, cy + 22, tw * E.inOutC(cp), 3); }
      else { c.strokeStyle = col; c.lineWidth = 3; c.strokeRect(W / 2 - bw / 2, cy - 46, bw, 92); }
      setF(f, 5); c.fillStyle = o.dark ? INKA(1) : WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CONTACT.cta, W / 2, cy + 2); D(); }
    const ip = seg(ot, 2.0, 0.4); if (ip > 0) K7.txt(contactLine(), W / 2, cy + 125, F(700, 28, 'Mont'), o.dark ? INKA(0.75) : WA(0.8), { align: 'center', a: E.outC(ip), ls: 3 });
    if (ip > 0 && CONTACT.lic) K7.txt(CONTACT.lic, W / 2, cy + 180, F(600, 22, 'Mont'), WA(0.6), { align: 'center', a: E.outC(ip), ls: 3 });
  }
  const shaky = (S, t, cy, o) => { const { sh } = cur(S, t); return K7.photo(sh, t, stageRect(sh, cy, o && o.w), o); };
  function stageRect(s, cy, w) { w = w || W; if (vert(s)) return K3.wholeIn(s.c, [0, 0, W, H]); const h = w / K3.ar(s.c); return [(W - w) / 2, cy - h / 2, w, h]; }
  const inBox = (s, box) => K3.wholeIn(s.c, box);
  // a whole photo in r, turned by rot (radians) and scaled by sc about (px, py), then moved by (ox, oy): footage draws reset the
  // canvas transform, so the turn and move go to the footage call itself
  function photoT(s, t, r, o) { const w = K3.wholeIn(s.c, r), cx = w[0] + w[2] / 2, cy = w[1] + w[3] / 2, px = o.px === undefined ? cx : o.px, py = o.py === undefined ? cy : o.py, sc = o.sc || 1, rot = o.rot || 0;
    const vx = (cx - px) * sc, vy = (cy - py) * sc, co = Math.cos(rot), sn = Math.sin(rot), nx = px + vx * co - vy * sn + (o.ox || 0), ny = py + vx * sn + vy * co + (o.oy || 0);
    K3.clip(s.c, s.in, Math.max(0, t - (s.start || 0)), w, { alpha: o.alpha === undefined ? 1 : o.alpha, dx: nx - cx, dy: ny - cy, rot, s: sc }); return w; }

  // ================================================================ THE BURGER DROP
  // Launch energy: a 3-2-1 countdown slams in, the drop hits with a flash and a shake, the item's name lands as a stacked poster
  // with rays behind it, then the ingredients build up as coloured layers, top bun to bottom, like the thing itself.
  function burger() {
    const BT = 60 / FM.bpm;
    const KICK = TX('kick', 'INTRODUCING', { label: 'Small line', group: 'The drop', upper: true, max: 22 });
    const DISH = TX('dish', 'THE SMASH STACK', { label: 'Item name', group: 'The drop', upper: true, max: 24, req: true });
    const LAYERS = TX('layers', 'BRIOCHE BUN\nHOUSE SAUCE\nPICKLES\nAMERICAN CHEESE\nSMASHED PATTY', { label: 'What’s in it (one per line, top to bottom)', group: 'The stack', multiline: true, upper: true, max: 140 });
    const WHEN = TX('when', '', { label: 'Drop day or time', group: 'The drop', upper: true, max: 22, hint: 'Optional, e.g. FRIDAY 11AM. Empty shows the item name instead.' });
    const PRICE = TX('price', '', { label: 'Price', group: 'The drop', max: 9, hint: 'Optional. Empty hides it.' });
    const END = TX('end', 'GET YOURS', { label: 'Ending line', group: 'Ending', upper: true, max: 20 });
    const DROP = 1.7, T2 = DROP + 8 * BT, T3 = T2 + 12 * BT, OUT = T3 + 7 * BT, DUR = OUT + 4.4;
    const S = shots([['s1', 'The hero shot', T2 - DROP, 'any', 'v'], ['s2', 'Close-up', T3 - T2, 'any', 'v'], ['s3', 'In hand or served', OUT - T3, 'any', 'v']], DROP);
    const LS = lines(LAYERS).slice(0, 6), CL = ['#E3A548', '#F2E3C7', '#7CB342', '#FFC400', '#6B3B22', '#E8442E'];
    const name = L8({ text: DISH, slot: 'Bebas', size: 190, w: 920, lead: 0.88, fx: { shadow: 'hard', shcol: 'accent' }, anim: { in: 'punch', out: 'shrink', outD: 0.25 }, y: 1080, t0: DROP + 0.2, d: T2 - DROP - 0.1 });
    const kick = L8({ text: KICK, slot: 'Mono', wt: 800, size: 34, track: 300, color: 'accent', anim: { in: 'tracking', inD: 0.7, out: 'fade' }, y: 820, t0: DROP + 0.35, d: T2 - DROP - 0.4 });
    const counts = ['3', '2', '1'].map((n, k) => L8({ text: n, slot: 'Bebas', size: 600, color: k === 2 ? 'accent' : 'white', fx: { shadow: 'soft' }, anim: { in: 'punch', inD: 0.32, out: 'grow', outD: 0.14 }, t0: 0.15 + k * 0.5, d: 0.5 }));
    const endL = { text: END, slot: 'Bebas', size: 170, color: 'accent', fx: { shadow: 'hard', shcol: 'ink' }, anim: { in: 'punch', out: 'none' } };
    return {
      dur: DUR, shakes: [[DROP, 16], [T2, 7], [T3, 6], [OUT + 0.2, 9]],
      render(t) {
        BACKDROP(() => { if (!VID.collecting) { const c = G(), g = c.createRadialGradient(W / 2, H * 1.1, 40, W / 2, H, H); g.addColorStop(0, DEEP1); g.addColorStop(0.6, BLK); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); } });
        if (t < DROP) { counts.forEach(L => type(L, t)); if (!VID.collecting) { const k = seg(t, 0.15, DROP - 0.15), c = G(); c.strokeStyle = OR; c.lineWidth = 8; c.beginPath(); c.arc(W / 2, H / 2, 470, -Math.PI / 2, -Math.PI / 2 + TAU * k); c.stroke(); D(); } }
        if (t >= DROP && t < OUT) {
          const A = () => shaky(S, Math.min(t, T2 - 0.01), 760), B = () => { const sh = S[1]; K7.photo(sh, t, stageRect(sh, 620)); }, Cc = () => { const sh = S[2]; K7.photo(sh, t, stageRect(sh, 760)); };
          if (t < T2 + 0.3) cut('stripes', t, T2, 0.5, A, B, { col: 'accent' }); else if (t < T3 + 0.3) cut('snapcut', t, T3, 0.3, B, Cc); else Cc();
          if (t < T2) { shade(H * 0.5, H, 0, 0.9); gfx({ kind: 'mg', type: 'rays', x: 540, y: 1080, size: 640, count: 20, color: 'accent', t0: DROP + 0.15, d: T2 - DROP }, t); type(kick, t); type(name, t); }
          else if (t < T3) {   // the stack builds from the top bun down, each layer dropping onto the pile
            shade(H * 0.42, H, 0, 0.92); const n = LS.length, bh = 88, gap = 10, x0 = 160, w = 760, yb = 1410;
            LS.forEach((ln, k) => { const ti = T2 + 0.25 + k * BT * 1.5, p = seg(t, ti, 0.45); if (p <= 0 || VID.collecting) return; const e = K8.ease('bounce')(p), y = yb - (n - k) * (bh + gap) - (1 - e) * 900, c = G();
              c.globalAlpha = clamp(p * 4); c.fillStyle = CL[k % CL.length]; c.beginPath(); c.roundRect(x0, y, w, bh, k === 0 ? [46, 46, 14, 14] : k === n - 1 && /BUN/.test(ln) ? [14, 14, 46, 46] : 14); c.fill();
              c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x0 + 10, y + bh - 10, w - 20, 6); const col = K8.onCol(CL[k % CL.length]), fs = Math.min(48, fitSize(ln, 400, w - 80, 48, 'Bebas', 3)); setF(F(400, fs, 'Bebas'), 3); c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ln, x0 + w / 2, y + bh / 2 + 3); D(); });
            type(L8({ text: DISH, slot: 'Bebas', size: 110, w: 920, color: 'white', fx: { shadow: 'hard', shcol: 'accent' }, anim: { in: 'cascade', out: 'fade' }, y: 430, t0: T2 + 0.1, d: T3 - T2 }), t);
          } else {
            const strip = WHEN ? 'DROPS ' + WHEN : DISH; if (!K9.allowed('limited')) type(L8({ text: strip, slot: 'Bebas', size: 110, color: 'ink', fx: { deco: 'box', dcol: 'accent' }, rot: -7, anim: { in: 'wipe', out: 'fade' }, y: 1165, t0: T3 + 0.15, d: OUT - T3 + 0.2 }), t); else gfx({ kind: 'mg', type: 'limited', text: strip, tilt: -7, color: 'accent', x: 540, y: 1165, t0: T3 + 0.15, d: OUT - T3 + 0.2 }, t);
            if (PRICE && K9.allowed('burst')) gfx({ kind: 'mg', type: 'burst', text: PRICE, size: 170, color: 'accent2', x: 790, y: 560, t0: T3 + 0.6, d: OUT - T3 }, t);
          }
        }
        if (t >= OUT) { gfx({ kind: 'mg', type: 'rays', x: 540, y: 640, size: 760, count: 22, color: 'accent', t0: OUT, d: 30 }, t); close(t, OUT, { y: 640, line: END, lineL: endL, cta: 'pill' }); }
      },
      cues() {
        const ev = [['riser', 0.1, 0.3, 0], ['impact', 0.15, 0.45, 0], ['impact', 0.65, 0.5, 0], ['impact', 1.15, 0.55, 0], ['boom', DROP, 0.6, 0], ['impact', DROP, 0.7, 0], ['flash', DROP, 0.3, 0]];
        LS.forEach((ln, k) => ev.push(['thud', T2 + 0.25 + k * BT * 1.5 + 0.2, 0.5, (k - 2) * 0.15]));
        ev.push(['swish', T2, 0.4, 0], ['snap', T3, 0.5, 0], ['whoosh', T3 + 0.15, 0.3, 0], ['drop', OUT, 0.5, 0], ['impact', OUT + 0.25, 0.5, 0], ['pop', OUT + 1.5, 0.35, 0]);
        if (PRICE) ev.push(['pop', T3 + 0.6, 0.4, 0.3]);
        return { dur: DUR, beds: [musicBed(DUR, { drop: DROP })], events: ev };
      },
    };
  }

  // ================================================================ THE ART OF SUSHI
  // Culinary editorial: an ivory page, hairlines, an ink ensō brushed in one breath, each piece revealed by a curtain rising
  // inside a tall frame, its name in italic serif, a red seal stamped at the corner. No shake, no particles, nothing fast.
  function sushi() {
    const KICK = TX('kick', 'OMAKASE', { label: 'Small line', group: 'Opening', upper: true, max: 18 });
    const TITLE = TX('title', 'The Art of Sushi', { label: 'Title', group: 'Opening', max: 24 });
    const P3 = [['Otoro', 'fatty tuna · aged soy'], ['Hotate', 'scallop · yuzu · sea salt'], ['Unagi', 'grilled eel · sweet glaze']].map(([n, d], k) => ({
      n: TX(k ? 'dish' + (k + 1) : 'dish', n, { label: 'Piece ' + (k + 1) + ' name', group: 'Piece ' + (k + 1), max: 20, req: true }),
      d: TX(k ? 'desc' + (k + 1) : 'desc', d, { label: 'Piece ' + (k + 1) + ' notes', group: 'Piece ' + (k + 1), max: 36 }) }));
    const END = TX('end', 'Reserve the counter', { label: 'Closing line', group: 'Ending', max: 28 });
    const T0 = 3.2, PD = 3.4, OUT = T0 + 3 * PD, DUR = OUT + 4.2;
    const S = shots(P3.map((p, k) => ['s' + (k + 1), 'Piece ' + (k + 1), PD + 0.3, 'any', 'v']), T0);
    S.forEach((s, k) => (s.start = T0 + k * PD));
    const FR = [190, 300, 700, 920];
    const seal = (x, y, s, p, ch) => { if (VID.collecting || p <= 0) return; const c = G(), e = p < 1 ? lerp(1.6, 1, E.inC(p)) : 1; c.translate(x, y); c.rotate(-0.08); c.scale(e * s, e * s); c.globalAlpha = clamp(p * 3) * 0.92; c.fillStyle = OR; c.beginPath(); c.roundRect(-46, -46, 92, 92, 10); c.fill();
      const on = K8.onCol(OR); c.strokeStyle = on; c.lineWidth = 3; c.strokeRect(-36, -36, 72, 72); setF(F(700, 50, 'Corm'), 0); c.fillStyle = on; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, 0, 4); D(); };
    function enso(cx, cy, r, p, a) {   // one brush stroke: width swells and tapers, with a dry-brush gap at the end
      if (VID.collecting || p <= 0) return; const c = G(), n = 520, a0 = -2.2, sweep = TAU * 0.92 * E.inOutS(clamp(p)); c.globalAlpha = a === undefined ? 1 : a; c.fillStyle = WA(0.92);
      for (let i = 0; i < n; i++) { const u = i / n, an = a0 + sweep * u; if (u * TAU * 0.92 > sweep + 1e-6) break; const w = (6 + 22 * Math.sin(Math.PI * Math.min(1, u * 1.15))) * (0.85 + 0.15 * Math.sin(u * 40)) * (u > 0.8 && Math.sin(u * 260) > 0.6 ? 0.55 : 1), rr = r + Math.sin(u * 7) * 6;
        c.beginPath(); c.arc(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr, w / 2, 0, TAU); c.fill(); }
      D(); }
    const titleL = L8({ text: TITLE, slot: 'Corm', wt: 600, ital: true, size: 104, color: 'white', w: 520, anim: { in: 'blur', inD: 1.2, out: 'fade' }, y: 940, t0: 0.9, d: T0 - 0.7 });
    const kickL = L8({ text: KICK, slot: 'Mont', wt: 500, size: 30, track: 520, color: 'accent', anim: { in: 'tracking', inD: 1.4, out: 'fade' }, y: 790, t0: 0.6, d: T0 - 0.4 });
    return {
      dur: DUR,
      render(t) {
        BACKDROP(() => { if (!VID.collecting) { const c = G(), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, DEEP2); g.addColorStop(1, DEEP1); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); } });
        if (!VID.collecting) { const c = G(); c.strokeStyle = rgbaOf(ACC2, 0.55); c.lineWidth = 1.5; const k = E.inOutS(seg(t, 0.2, 1.6)); c.beginPath(); c.moveTo(110, 120); c.lineTo(110, 120 + (H - 240) * k); c.moveTo(W - 110, H - 120); c.lineTo(W - 110, H - 120 - (H - 240) * k); c.stroke(); D(); }
        if (t < T0 + 0.6) { const q = seg(t, T0 - 0.3, 0.8); enso(540, 900, 300, seg(t, 0.2, 1.5), 1 - q); type(kickL, t); type(titleL, t); seal(760, 1150, 1, seg(t, 1.9, 0.3) * (1 - q), (BRAND.short || BRAND.name || 'A').charAt(0)); }
        if (t >= T0 && t < OUT + 0.6) {
          const i = Math.min(2, Math.floor((t - T0) / PD)), lt = t - (T0 + i * PD), sh = S[i], r = inBox(sh, FR), q = t >= OUT ? seg(t, OUT, 0.6) : 0;
          if (i > 0 && lt < 0.8) { const prev = S[i - 1], pr = inBox(prev, FR); K7.photo(prev, t, pr, { alpha: 1 - seg(lt, 0.2, 0.6) }); }
          const up = E.inOutS(seg(lt, 0.05, 0.9)); ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.rect(r[0], r[1] + r[3] * (1 - up), r[2], r[3] * up); ctx.clip(); } K7.photo(sh, t, r, { alpha: 1 - q }); ctx.restore();
          if (!VID.collecting) { const c = G(); c.globalAlpha = (1 - q) * up; c.strokeStyle = rgbaOf(ACC2, 0.8); c.lineWidth = 1.5; c.strokeRect(r[0] - 14, r[1] - 14, r[2] + 28, r[3] + 28); D(); }
          const np = seg(lt, 0.5, 0.6), num = 'N° ' + (i + 1); K7.txt(num, 70, 640, F(500, 26, 'Mont'), OR, { a: E.outC(np) * (1 - q), ls: 6 });
          type(L8({ text: P3[i].n, slot: 'Corm', wt: 600, ital: true, size: 108, color: 'white', anim: { in: 'charup', inD: 0.6, stagger: 0.05, out: 'fade', outD: 0.3 }, y: 1320, t0: T0 + i * PD + 0.55, d: PD - 0.2 }), t);
          type(L8({ text: P3[i].d.toUpperCase(), slot: 'Mont', wt: 500, size: 26, track: 260, color: 'white', anim: { in: 'fade', inD: 0.6, out: 'fade', outD: 0.3 }, y: 1405, t0: T0 + i * PD + 1.0, d: PD - 0.65 }), t);
          seal(r[0] + r[2] + 4, r[1] + r[3] - 10, 0.8, seg(lt, 1.35, 0.25) * (1 - q), String(i + 1));
        }
        if (t >= OUT) { enso(540, 660, 390, seg(t, OUT + 0.1, 1.2)); close(t, OUT, { y: 640, lw: 520, line: END, lineL: { slot: 'Corm', wt: 600, ital: true, size: 84, color: 'white', anim: { in: 'blur', inD: 1.0 } }, cta: 'underline', ctaCol: 'accent', ctaGap: 360 }); }
      },
      cues() {
        const ev = [['paper', 0.3, 0.25, 0], ['air', 0.4, 0.2, -0.3], ['tink', 2.0, 0.22, 0.3]];
        S.forEach((s, k) => { ev.push(['air', s.start + 0.1, 0.2, (k - 1) * 0.3]); ev.push(['tink', s.start + 1.4, 0.2, 0.3]); ev.push(['clack', s.start + 1.42, 0.12, 0.3]); });
        ev.push(['paper', OUT + 0.1, 0.2, 0], ['chime', OUT + 1.3, 0.18, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ THE CHEESE PULL
  // The food hook: "wait for it" types itself over one long shot while a stretch-o-meter fills like molten cheese; when it
  // maxes out the title springs in elastic with drips falling from it, then cheese-drip cuts carry the rest.
  function cheese() {
    const HOOK = TX('hook', 'wait for it…', { label: 'Hook line', group: 'The hook', max: 24 });
    const BIG = TX('big', 'THE PULL', { label: 'Big word', group: 'The hook', upper: true, max: 12 });
    const DISH = TX('dish', 'Four-Cheese Deep Dish', { label: 'Item name', group: 'The dish', max: 28, req: true });
    const DESC = TX('desc', 'Stretchy, golden, straight from the oven.', { label: 'Description', group: 'The dish', max: 48 });
    const PRICE = TX('price', '', { label: 'Price', group: 'The dish', max: 9, hint: 'Optional. Empty hides it.' });
    const END = TX('end', 'COME GET IT', { label: 'Ending line', group: 'Ending', upper: true, max: 18 });
    const PEAK = 5.0, T2 = 6.2, T3 = 9.4, OUT = 12.6, DUR = OUT + 4.2;
    const S = shots([['s1', 'The pull (one long shot)', T2 + 0.3, 'any', 'v'], ['s2', 'The whole dish', T3 - T2 + 0.3, 'any', 'v'], ['s3', 'A bite', OUT - T3 + 0.3, 'any', 'v']], 0);
    S[1].start = T2; S[2].start = T3;
    const drips = (y0, t, t0, n, a) => { if (VID.collecting) return; const c = G(); c.fillStyle = OR; c.globalAlpha = a === undefined ? 1 : a;
      for (let i = 0; i < n; i++) { const x = 140 + (i + 0.5) / n * 800 + (hash(i) - 0.5) * 60, lt = t - t0 - hash(i * 3.1) * 0.6; if (lt <= 0) continue; const len = Math.min(240, lt * 260) * (0.5 + hash(i * 7)), r = 12 + hash(i * 2) * 12;
        c.beginPath(); c.moveTo(x - r, y0); c.lineTo(x - r * 0.7, y0 + len); c.arc(x, y0 + len, r * 0.75, Math.PI, 0, true); c.lineTo(x + r, y0); c.fill(); const fy = y0 + len + lt * lt * 600; if (lt > 0.4) { c.beginPath(); c.arc(x, fy, r * 0.55, 0, TAU); c.fill(); } } D(); };
    function meter(t) {   // a gooey vertical gauge on the right that fills to the peak
      if (VID.collecting) return; const k = E.inOutS(seg(t, 0.8, PEAK - 0.8)), a = 1 - seg(t, PEAK + 0.3, 0.4); if (a <= 0) return; const x = 940, y0 = 420, h = 1000, w = 70, c = G(); c.globalAlpha = a;
      c.fillStyle = 'rgba(0,0,0,0.45)'; c.beginPath(); c.roundRect(x - w / 2 - 8, y0 - 8, w + 16, h + 16, 44); c.fill(); c.save(); c.beginPath(); c.roundRect(x - w / 2, y0, w, h, 36); c.clip();
      const top = y0 + h * (1 - k); c.fillStyle = OR; c.beginPath(); c.moveTo(x - w, y0 + h + 10); for (let xx = x - w; xx <= x + w; xx += 6) c.lineTo(xx, top + Math.sin(xx * 0.2 + t * 6) * 6); c.lineTo(x + w, y0 + h + 10); c.fill(); c.restore();
      c.strokeStyle = WHT; c.lineWidth = 4; c.beginPath(); c.roundRect(x - w / 2, y0, w, h, 36); c.stroke(); for (let i = 1; i < 10; i++) { c.fillStyle = WA(0.6); c.fillRect(x - w / 2 - 22, y0 + i * h / 10, 16, 3); }
      c.translate(x - 76, y0 + h / 2); c.rotate(-Math.PI / 2); setF(F(700, 24, 'Mont'), 6); c.fillStyle = WA(0.85); c.textAlign = 'center'; c.fillText('STRETCH-O-METER', 0, 0); D(); }
    const hookL = L8({ text: HOOK, slot: 'Hand', wt: 700, size: 110, color: 'white', fx: { shadow: 'soft' }, anim: { in: 'typewriter', stagger: 0.09, out: 'fade' }, y: 420, t0: 0.4, d: PEAK - 0.2 });
    const bigL = L8({ text: BIG, slot: 'Bebas', size: 260, color: 'accent', layout: 'stack', w: 900, fx: { shadow: 'hard', shcol: 'ink', stroke: 6, scol: 'ink' }, anim: { in: 'elastic', inD: 1.1, out: 'sink', loop: 'wave', loopAmt: 0.6 }, y: 820, t0: PEAK, d: T2 - PEAK + 0.1 });
    return {
      dur: DUR, shakes: [[PEAK, 10], [OUT + 0.3, 6]],
      render(t) {
        BACKDROP(() => { if (!VID.collecting) { const c = G(), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, DEEP1); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); } });
        if (t < OUT) {
          const A = () => K7.photo(S[0], t, stageRect(S[0], 900)), B = () => K7.photo(S[1], t, stageRect(S[1], 800)), Cc = () => K7.photo(S[2], t, stageRect(S[2], 800));
          if (t < T2 + 0.6) cut('paint', t, T2, 0.9, A, B, { col: 'accent' }); else if (t < T3 + 0.4) cut('bounce', t, T3, 0.6, B, Cc); else Cc();
          if (t < T2) { shade(0, 640, 0.65, 0); meter(t); type(hookL, t); if (t >= PEAK) { fillScreen(BLK, 0.35 * (1 - seg(t, PEAK, 0.6))); type(bigL, t); drips(1080, t, PEAK + 0.5, 9, 1 - seg(t, T2 - 0.3, 0.3)); } }
          else { shade(H * 0.4, H, 0, 0.9);
            type(L8({ text: DISH, slot: 'Bebas', size: 140, color: 'white', w: 900, fx: { shadow: 'soft', extrude: 12, ecol: 'accent' }, anim: { in: 'bounce', out: 'drop' }, y: 1110, t0: T2 + 0.5, d: T3 - T2 + 0.2 }), t);
            type(L8({ text: DESC, slot: 'Mont', wt: 700, size: 44, w: 860, color: 'white', fx: { shadow: 'soft' }, anim: { in: 'words', out: 'fade' }, y: 1310, t0: T2 + 1.0, d: T3 - T2 - 0.6 }), t);
            if (t >= T3) { type(L8({ text: DISH, slot: 'Bebas', size: 96, color: 'accent', w: 900, fx: { shadow: 'soft' }, anim: { in: 'stagger', out: 'fade' }, y: 380, t0: T3 + 0.3, d: OUT - T3 }), t);
              if (PRICE && K9.allowed('sticker')) gfx({ kind: 'mg', type: 'sticker', text: PRICE, size: 150, color: 'accent', x: 780, y: 1240, t0: T3 + 0.8, d: OUT - T3 - 0.6 }, t); }
          }
        }
        if (t >= OUT) { close(t, OUT, { y: 620, line: END, lineL: { slot: 'Bebas', size: 150, color: 'accent', fx: { shadow: 'hard', shcol: 'ink' }, anim: { in: 'elastic', inD: 1.0 } }, cta: 'pill' }); drips(-10, t, OUT, 11, 0.95); }
      },
      cues() {
        const ev = [['typing', 0.4, 0.35, 0], ['swell', 1.2, 0.18, 0], ['riser', PEAK - 1.5, 0.3, 0], ['impact', PEAK, 0.6, 0], ['pop', PEAK + 0.05, 0.5, 0], ['ink', T2, 0.45, 0], ['thud', T3 + 0.25, 0.55, 0], ['pop', OUT + 0.2, 0.4, 0], ['ink', OUT + 0.1, 0.3, 0]];
        if (PRICE) ev.push(['pop', T3 + 0.8, 0.4, 0.3]);
        return { dur: DUR, beds: [musicBed(DUR), ['sizzle', 0, T2, 0.12]], events: ev };
      },
    };
  }

  // ================================================================ THE POUR
  // A drink showcase: the footage sits inside an arch like a glass, a slim pour-level gauge rises beside it, the name surfaces
  // with a liquid reveal, ingredients drop into a list, bubbles rise, and a script toast closes it.
  function pour() {
    const KICK = TX('kick', 'HOUSE COCKTAIL', { label: 'Small line', group: 'The drink', upper: true, max: 24 });
    const DRINK = TX('dish', 'Smoked Old Fashioned', { label: 'Drink name', group: 'The drink', max: 28, req: true });
    const ING = TX('ing', 'Bourbon\nDemerara\nAngostura bitters\nOrange peel', { label: 'What’s in it (one per line)', group: 'The drink', multiline: true, max: 120 });
    const TOAST = TX('toast', 'Cheers', { label: 'Toast word', group: 'Ending', max: 14 });
    const END = TX('end', 'Pull up a seat', { label: 'Closing line', group: 'Ending', max: 26 });
    const T1 = 3.4, T2 = 9.2, OUT = 13.4, DUR = OUT + 4.3;
    const S = shots([['s1', 'The pour', T2 + 0.3, 'any', 'v'], ['s2', 'The finished glass', OUT - T2 + 0.3, 'any', 'v']], 0); S[1].start = T2;
    const IN = lines(ING).slice(0, 5), AR = [170, 560, 740, 860];
    function arch(r, path) { const [x, y, w, h] = r, rad = w / 2; path.moveTo(x, y + h); path.lineTo(x, y + rad); path.arc(x + rad, y + rad, rad, Math.PI, 0); path.lineTo(x + w, y + h); path.closePath(); }
    function caustics(t) { if (VID.collecting) return; const c = G(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const x = W * (0.2 + 0.6 * hash(i)) + Math.sin(t * 0.5 + i) * 120, y = H * (0.15 + 0.7 * hash(i * 3)) + Math.cos(t * 0.4 + i) * 90, r = 260 + 140 * hash(i * 5); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgbaOf(ACC2, 0.08)); g.addColorStop(1, rgbaOf(ACC2, 0)); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); } D(); }
    return {
      dur: DUR,
      render(t) {
        BACKDROP(() => { if (!VID.collecting) { const c = G(), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, DEEP1); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); } });
        caustics(t);
        if (t < OUT) {
          const q = 0, sh = t < T2 ? S[0] : S[1]; const draw = s => () => { ctx.save(); if (!VID.collecting) { ctx.beginPath(); arch(AR, ctx); ctx.clip(); } K7.photo(s, t, AR); if (!VID.collecting) { const c = K3.G(); c.fillStyle = BLK; c.globalAlpha = 0.0; K3.D(); } ctx.restore(); };
          if (!VID.collecting) { const c = G(); c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); arch(AR, c); c.fill(); D(); }
          cut('ripple', t, T2, 0.9, draw(S[0]), draw(S[1])); void q; void sh;
          if (!VID.collecting) { const c = G(), k = E.inOutS(seg(t, 0.1, 1.2)); c.strokeStyle = OR; c.lineWidth = 3; c.setLineDash([4000 * k, 4000]); c.beginPath(); arch([AR[0] - 16, AR[1] - 16, AR[2] + 32, AR[3] + 32], c); c.stroke(); D(); }
          // the pour level: a slim tube on the right fills while the pour runs
          if (!VID.collecting && t < T2 + 0.6) { const k = E.inOutS(seg(t, 0.6, T2 - 1.4)), a = 1 - seg(t, T2, 0.5), x = 975, y0 = 600, h = 780, c = G(); c.globalAlpha = a; c.strokeStyle = WA(0.7); c.lineWidth = 3; c.beginPath(); c.roundRect(x - 16, y0, 32, h, 16); c.stroke();
            c.fillStyle = OR; c.beginPath(); c.roundRect(x - 10, y0 + h - (h - 12) * k - 6, 20, (h - 12) * k, 10); c.fill(); for (let i = 1; i < 8; i++) c.fillRect(x - 34, y0 + i * h / 8, 12, 2); D(); }
          type(L8({ text: KICK, slot: 'Mont', wt: 500, size: 28, track: 480, color: 'accent', anim: { in: 'tracking', out: 'fade' }, y: 330, t0: 0.3, d: T2 - 0.1 }), t);
          type(L8({ text: DRINK, slot: 'Corm', wt: 700, ital: true, size: 112, w: 940, color: 'white', fx: { shadow: 'soft' }, anim: { in: 'liquid', inD: 1.1, out: 'sink' }, y: 440, t0: 0.6, d: T2 - 0.4 }), t);
          if (t >= T1 && t < T2 + 0.4) { const q2 = seg(t, T2 - 0.2, 0.4); shade(1020, 1420, 0, 0.7 * (1 - q2)); IN.forEach((ln, k) => { const ti = T1 + 0.3 + k * 0.9, p = seg(t, ti, 0.5); if (p <= 0 || VID.collecting) return; const y = 1090 + k * 70, dy = -(1 - E.outBack(clamp(p))) * 200, c = G();
              c.globalAlpha = clamp(p * 3) * (1 - q2); c.fillStyle = ACC2; c.beginPath(); c.moveTo(110, y - 40 + dy); c.bezierCurveTo(90, y - 16 + dy, 96, y + dy, 110, y + dy); c.bezierCurveTo(124, y + dy, 130, y - 16 + dy, 110, y - 40 + dy); c.fill();
              setF(F(600, 46, 'Corm'), 0); c.fillStyle = WHT; c.textAlign = 'left'; c.fillText(ln, 152, y - 6); D(); }); }
          if (t >= T2) { if (!VID.collecting) { const c = G(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 26; i++) { const lt = (t - T2 + hash(i) * 3) % 3, x = AR[0] + AR[2] * (0.2 + 0.6 * hash(i * 7)) + Math.sin(lt * 3 + i) * 10, y = AR[1] + AR[3] - lt / 3 * AR[3] * 0.9, r = 3 + hash(i * 3) * 6; c.strokeStyle = WA(0.45 * Math.sin(Math.PI * lt / 3)); c.lineWidth = 2; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); } D(); }
            type(L8({ text: TOAST, slot: 'Hand', wt: 400, size: 190, color: 'accent', fx: { glow: 0.6, gcol: 'accent' }, anim: { in: 'outline', inD: 1.4, out: 'fade' }, y: 1290, t0: T2 + 0.8, d: OUT - T2 - 0.4 }), t); }
        }
        if (t >= OUT) { if (!VID.collecting) { const k = E.inOutC(seg(t, OUT, 0.9)), r = [540 - 250, 640 - 330, 500, 640], c = G(); c.strokeStyle = OR; c.lineWidth = 3; c.globalAlpha = k; c.beginPath(); arch([r[0] - 18, r[1] - 18, r[2] + 36, r[3] + 36], c); c.stroke(); D(); }
          close(t, OUT, { y: 640, lw: 420, line: END, lineL: { slot: 'Corm', wt: 700, ital: true, size: 96, anim: { in: 'liquid' } }, cta: 'outline', ctaGap: 470 }); }
      },
      cues() {
        const ev = [['pour', 0.6, 0.45, 0], ['air', 0.6, 0.2, 0], ['ink', T2, 0.4, 0], ['pour', T2 + 0.1, 0.3, 0.2], ['chime', T2 + 0.9, 0.2, 0], ['shimmer', OUT + 0.4, 0.2, 0]];
        IN.forEach((ln, k) => ev.push(['tink', T1 + 0.5 + k * 0.9, 0.25, (k % 2 ? 0.3 : -0.3)]));
        return { dur: DUR, beds: [musicBed(DUR), ['room', 0, DUR, 0.18]], events: ev };
      },
    };
  }

  // ================================================================ THE MENU EDIT
  // Menu storytelling: a printed card slides up, the title is set, then each item takes its turn: a marker underline, its notes,
  // and a round inset of that dish popping in at the edge of the card. A page turn reveals the back with the brand.
  function menuedit() {
    const TITLE = TX('title', 'Our Menu', { label: 'Title', group: 'Card', max: 20 });
    const SUB = TX('sub', 'a few favourites', { label: 'Script line', group: 'Card', max: 26 });
    const IT = [['Burrata', 'heirloom tomato · basil oil'], ['Short rib', 'red wine jus · creamy polenta'], ['Olive oil cake', 'citrus · whipped mascarpone']].map(([n, d], k) => ({
      n: TX(k ? 'dish' + (k + 1) : 'dish', n, { label: 'Item ' + (k + 1), group: 'Item ' + (k + 1), max: 24, req: true }), d: TX(k ? 'desc' + (k + 1) : 'desc', d, { label: 'Item ' + (k + 1) + ' notes', group: 'Item ' + (k + 1), max: 40 }),
      p: TX('price' + (k + 1), '', { label: 'Item ' + (k + 1) + ' price', group: 'Item ' + (k + 1), max: 8, hint: 'Optional. Empty hides it.' }) }));
    const END = TX('end', 'Book your table', { label: 'Back page line', group: 'Ending', max: 26 });
    const T0 = 2.6, ID = 3.1, TURN = T0 + 3 * ID, OUT = TURN + 0.9, DUR = OUT + 4.0;
    const S = shots(IT.map((x, k) => ['s' + (k + 1), 'Item ' + (k + 1), ID + 0.4, 'any', 'v']), T0); S.forEach((s, k) => (s.start = T0 + k * ID));
    const CARD = [70, 210, 940, 1420], ROWS = [730, 930, 1130];
    function card(t, a) {   // the printed card with deckled edges and a double rule
      if (VID.collecting) return; const up = E.outQ(seg(t, 0.05, 0.9)), y = CARD[1] + (1 - up) * 1500, c = G(); c.globalAlpha = a === undefined ? 1 : a;
      c.shadowColor = 'rgba(0,0,0,0.25)'; c.shadowBlur = 40; c.shadowOffsetY = 18; c.fillStyle = DEEP2; c.beginPath(); for (let i = 0; i <= 60; i++) c.lineTo(CARD[0] + (i / 60) * CARD[2], y + (hash(i) - 0.5) * 6); for (let i = 0; i <= 60; i++) c.lineTo(CARD[0] + CARD[2] + (hash(i + 70) - 0.5) * 6, y + (i / 60) * CARD[3]);
      for (let i = 60; i >= 0; i--) c.lineTo(CARD[0] + (i / 60) * CARD[2], y + CARD[3] + (hash(i + 140) - 0.5) * 6); for (let i = 60; i >= 0; i--) c.lineTo(CARD[0] + (hash(i + 210) - 0.5) * 6, y + (i / 60) * CARD[3]); c.fill(); c.shadowColor = 'transparent';
      c.strokeStyle = OR; c.lineWidth = 2; c.strokeRect(CARD[0] + 30, y + 30, CARD[2] - 60, CARD[3] - 60); c.lineWidth = 1; c.strokeRect(CARD[0] + 40, y + 40, CARD[2] - 80, CARD[3] - 80); D(); return y; }
    function row(it, k, t, on) {
      if (VID.collecting) return; const y = ROWS[k], p = seg(t, 0.9 + k * 0.25, 0.5), a = E.outC(p) * (on ? 1 : 0.55), c = G(); if (p <= 0) { D(); return; } c.globalAlpha = a;
      const fs = Math.min(64, fitSize(it.n, 700, it.p ? 560 : 700, 64, 'Corm', 0)), f = F(700, fs, 'Corm'); setF(f, 0); c.fillStyle = WHT; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText(it.n, 150, y); const nw = textW(it.n, f, 0);
      if (it.p) { const pf = F(700, 50, 'Corm'), pw = textW(it.p, pf, 0); setF(pf, 0); c.textAlign = 'right'; c.fillText(it.p, 930, y); c.fillStyle = WA(0.5); for (let x = 150 + nw + 20; x < 930 - pw - 20; x += 16) c.fillRect(x, y - 8, 4, 4); }
      setF(F(500, 34, 'Corm', 'italic'), 0); c.textAlign = 'left'; c.fillStyle = WA(0.7); c.fillText(it.d, 150, y + 58); D(); }
    return {
      dur: DUR,
      render(t) {
        BACKDROP(() => { if (!VID.collecting) { const c = G(); c.fillStyle = DEEP1; c.fillRect(-20, -20, W + 40, H + 40); D(); } });
        const front = () => {
          card(t);
          type(L8({ text: TITLE, slot: 'Bebas', size: 150, color: 'white', anim: { in: 'wipe', inD: 0.8, out: 'none' }, y: 420, t0: 0.6, d: 30 }), t);
          type(L8({ text: SUB, slot: 'Hand', wt: 700, size: 80, color: 'accent', anim: { in: 'letters', stagger: 0.05, out: 'none' }, y: 540, t0: 1.1, d: 30 }), t);
          const k = t < T0 ? -1 : Math.min(2, Math.floor((t - T0) / ID));
          IT.forEach((it, j) => { if (k === j && !VID.collecting) { const lt = t - (T0 + j * ID), w = E.inOutC(seg(lt, 0.15, 0.5)) * 560, c = G(); c.fillStyle = rgbaOf(ACC2, 0.45); c.beginPath(); c.moveTo(140, ROWS[j] + 12); c.lineTo(140 + w, ROWS[j] + 6); c.lineTo(140 + w, ROWS[j] + 22); c.lineTo(140, ROWS[j] + 26); c.fill(); D(); } row(it, j, t, k < 0 || k === j); });
          if (k >= 0) { const lt = t - (T0 + k * ID), sh = S[k], p = E.outBack(seg(lt, 0.25, 0.5)) * (1 - E.inC(seg(lt, ID - 0.3, 0.3))), R0 = 175, cx = 540, cy = 1415;
            if (p > 0) { if (!VID.collecting) { const c = G(); c.fillStyle = '#FFFFFF'; c.shadowColor = 'rgba(0,0,0,0.3)'; c.shadowBlur = 30; c.beginPath(); c.arc(cx, cy, (R0 + 10) * p, 0, TAU); c.fill(); D(); }
              const r = [cx - R0 * p, cy - R0 * p, 2 * R0 * p, 2 * R0 * p]; footage(sh.c, sh.in + Math.max(0, t - sh.start), { rect: r, fit: 'cover', q: 'h', clip: () => ctx.arc(cx, cy, R0 * p, 0, TAU) }); } }
        };
        const back = () => { if (!VID.collecting) { const c = G(); c.fillStyle = DEEP1; c.fillRect(0, 0, W, H); D(); } card(t); close(t, OUT, { y: 700, lw: 560, line: END, lineL: { slot: 'Corm', wt: 700, ital: true, size: 90, color: 'white', anim: { in: 'wipe' } }, cta: 'outline', ctaCol: 'accent' }); };
        if (t < TURN - 0.45) front(); else if (t < TURN + 0.45) cut('page', t, TURN, 0.9, front, back); else back();
      },
      cues() {
        const ev = [['swish', 0.1, 0.3, 0], ['paper', 0.25, 0.3, 0], ['pencil', 1.1, 0.3, 0]];
        S.forEach((s, k) => { ev.push(['pencil', s.start + 0.15, 0.25, -0.2]); ev.push(['pop', s.start + 0.35, 0.35, 0.3]); });
        ev.push(['pageflip', TURN - 0.3, 0.5, 0], ['chime', OUT + 1.3, 0.18, 0]);
        return { dur: DUR, beds: [musicBed(DUR), ['room', 0, DUR, 0.12]], events: ev };
      },
    };
  }

  // ================================================================ STREET FOOD STORIES
  // Urban food culture: footage pasted up as wheatpaste posters with torn edges and tape, each new one slapped over the last,
  // a spray-painted tag with drips, a stencil kicker and a ticker running along the bottom.
  function street() {
    const KICK = TX('kick', 'STREET FOOD STORIES', { label: 'Stencil line', group: 'Opening', upper: true, max: 24 });
    const TAG = TX('dish', 'Birria tacos', { label: 'Spray-painted item', group: 'The food', max: 18, req: true });
    const WHERE = TX('where', '', { label: 'Where to find you (ticker)', group: 'The food', upper: true, max: 40, hint: 'Optional, e.g. THE CORNER OF 5TH & MAIN. Empty uses the business name.' });
    const CAP = ['s1', 's2', 's3'].map((k, i) => TX('cap' + (i + 1), ['ON THE GRILL', 'FOLDED FRESH', 'SAUCE IT UP'][i], { label: 'Poster ' + (i + 1) + ' caption', group: 'Posters', upper: true, max: 18 }));
    const END = TX('end', 'pull up', { label: 'Ending tag', group: 'Ending', max: 14 });
    const PD = 3.6, OUT = 3 * PD + 0.4, DUR = OUT + 4.3;
    const S = shots([['s1', 'Poster 1', PD + 4, 'any', 'v'], ['s2', 'Poster 2', PD + 4, 'any', 'v'], ['s3', 'Poster 3', PD + 1, 'any', 'v']], 0); S.forEach((s, k) => (s.start = 0.3 + k * PD));
    const POS = [[-4, 0, 0], [3.5, 30, 60], [-2, -20, 120]];
    function wall(t) { if (VID.collecting) return; const c = G(); c.fillStyle = BLK; c.fillRect(-20, -20, W + 40, H + 40); const r = rng(5); for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.04})`; c.save(); c.translate(r() * W, r() * H); c.rotate((r() - 0.5) * 0.3); c.fillRect(-150, -100, 300 + r() * 200, 200 + r() * 160); c.restore(); }
      if (NOISE.length) { c.globalAlpha = 0.5; c.fillStyle = NOISE[1]; c.fillRect(0, 0, W, H); } D(); }
    function poster(s, k, t) {
      const lt = t - s.start; if (lt < 0) return; const [rot, dx, dy] = POS[k], p = seg(lt, 0, 0.35), sc = p < 1 ? lerp(1.25, 1, E.inC(p)) : 1, box = [150 + dx, 500 + dy, 780, 800], r = inBox(s, box), cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2, b = 26;
      if (!VID.collecting) { const c = G(); c.translate(cx, cy); c.rotate(rot * Math.PI / 180); c.scale(sc, sc); c.translate(-cx, -cy); c.globalAlpha = clamp(p * 4); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; c.fillStyle = '#F1ECE2'; c.beginPath();
        const n = 40; for (let i = 0; i <= n; i++) c.lineTo(r[0] - b + (r[2] + 2 * b) * i / n, r[1] - b + (hash(i + k * 50) - 0.5) * 14); for (let i = 0; i <= n; i++) c.lineTo(r[0] + r[2] + b + (hash(i + 99 + k) - 0.5) * 14, r[1] - b + (r[3] + 2 * b) * i / n);
        for (let i = n; i >= 0; i--) c.lineTo(r[0] - b + (r[2] + 2 * b) * i / n, r[1] + r[3] + b + (hash(i + 7 + k) - 0.5) * 14); for (let i = n; i >= 0; i--) c.lineTo(r[0] - b + (hash(i + 33 + k) - 0.5) * 14, r[1] - b + (r[3] + 2 * b) * i / n); c.fill(); D(); }
      photoT(s, t, r, { rot: rot * Math.PI / 180, sc, alpha: clamp(p * 4) });
      if (!VID.collecting) { const c = G(); c.translate(cx, cy); c.rotate(rot * Math.PI / 180); c.scale(sc, sc); c.translate(-cx, -cy); c.globalAlpha = clamp(p * 4) * 0.16; c.fillStyle = '#000'; for (let y = r[1]; y < r[1] + r[3]; y += 9) for (let x = r[0] + (y / 9 % 2) * 4; x < r[0] + r[2]; x += 9) { c.beginPath(); c.arc(x, y, 1.7, 0, TAU); c.fill(); }
        c.globalAlpha = clamp(p * 4) * 0.8; c.fillStyle = '#D9CBA8'; for (const [tx0, ty0, ta] of [[r[0] - 10, r[1] - 20, -0.5], [r[0] + r[2] - 120, r[1] - 26, 0.4]]) { c.save(); c.translate(tx0 + 60, ty0 + 18); c.rotate(ta); c.fillRect(-70, -20, 140, 40); c.restore(); }
        const cap = CAP[k]; if (cap) { const f = F(400, 64, 'Bebas'); setF(f, 4); const w = textW(cap, f, 4) + 40; c.globalAlpha = clamp(p * 4); c.fillStyle = OR; c.fillRect(r[0] + 30, r[1] + 44, w, 84); c.fillStyle = WHT; c.textBaseline = 'middle'; c.fillText(cap, r[0] + 50, r[1] + 88); } D(); }
    }
    function spray(str, x, y, t, t0, size, rot) {   // a spray-painted tag with growing drips
      type(L8({ text: str, slot: 'Hand', wt: 400, size, w: 1000, color: 'accent2', rot, fx: { shadow: 'soft', glow: 0.25, gcol: 'accent2' }, anim: { in: 'letters', stagger: 0.07, inD: 0.2, out: 'none' }, x, y, t0, d: 30 }), t);
      if (VID.collecting) return; const lt = t - t0 - 0.5; if (lt <= 0) return; const c = G(), w = textW(str, F(400, size, 'Hand'), 0); c.translate(x, y); c.rotate((rot || 0) * Math.PI / 180); c.fillStyle = ACC2;
      for (let i = 0; i < 7; i++) { const dx = -w / 2 + (i + 0.5) / 7 * w + (hash(i * 3) - 0.5) * 30, len = Math.min(140, lt * 90 * (0.4 + hash(i))), wd = 5 + hash(i * 5) * 5; c.fillRect(dx - wd / 2, size * 0.1, wd, len); c.beginPath(); c.arc(dx, size * 0.1 + len, wd * 0.8, 0, TAU); c.fill(); } D(); }
    return {
      dur: DUR, shakes: S.map(s => [s.start + 0.33, 5]),
      render(t) {
        BACKDROP(() => { wall(t); });
        if (t < OUT) { S.forEach((s, k) => { if (t >= s.start && t < OUT + 0.1) poster(s, k, t); });
          type(L8({ text: KICK, slot: 'Bebas', size: 66, track: 120, w: 1000, color: 'white', fx: { shadow: 'hard', shcol: 'accent' }, anim: { in: 'stagger', out: 'fade' }, y: 320, t0: 0.2, d: OUT - 0.1 }), t);
          spray(TAG, 540, 1325, t, 1.1, 120, -5);
          gfx({ kind: 'mg', type: 'ticker', text: (WHERE || BRAND.name) + '  •  ' + TAG.toUpperCase(), color: 'accent', speed: 1.2, x: 540, y: 420, t0: 0.6, d: OUT }, t); }
        if (t >= OUT) { const lh = logoBox(640)[1]; spray(END, 540, 600 + lh / 2 + 230, t, OUT + 0.8, 190, -6); close(t, OUT, { y: 600, lw: 640, cta: 'pill', ctaGap: 560, ctaCol: 'accent' }); }
      },
      cues() {
        const ev = []; S.forEach((s, k) => { ev.push(['paper', s.start, 0.45, (k - 1) * 0.3]); ev.push(['stamp', s.start + 0.33, 0.45, 0]); ev.push(['clack', s.start + 0.5, 0.2, 0.3]); });
        ev.push(['air', 1.1, 0.35, -0.3], ['air', 1.6, 0.3, 0.3], ['air', OUT + 0.8, 0.35, 0], ['air', OUT + 1.2, 0.3, 0.2], ['pop', OUT + 1.5, 0.3, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ LATE NIGHT BITES
  // Synthwave after dark: a neon sign buzzes on over a scrolling perspective grid and a striped sun, footage plays inside a
  // rounded CRT with scanlines, a REC dot blinks, and each item cuts in with an RGB glitch.
  function late() {
    const TITLE = TX('title', 'LATE NIGHT BITES', { label: 'Neon sign', group: 'Opening', upper: true, max: 20 });
    const HOURS = TX('hours', '', { label: 'Late hours', group: 'Opening', upper: true, max: 22, hint: 'Optional, e.g. OPEN TILL 2AM. Empty hides it.' });
    const D3 = ['LOADED FRIES', 'SPICY WINGS', 'MIDNIGHT RAMEN'].map((n, k) => TX(k ? 'dish' + (k + 1) : 'dish', n, { label: 'Item ' + (k + 1), group: 'Items', upper: true, max: 18, req: !k }));
    const END = TX('end', 'COME THROUGH', { label: 'Ending line', group: 'Ending', upper: true, max: 18 });
    const BT = 60 / FM.bpm, T0 = 3.0, ID = 8 * BT, OUT = T0 + 3 * ID, DUR = OUT + 4.2;
    const S = shots(D3.map((d, k) => ['s' + (k + 1), 'Item ' + (k + 1), ID + 0.4, 'any', 'v']), T0); S.forEach((s, k) => (s.start = T0 + k * ID));
    const TV = [170, 330, 740, 740];
    function scene(t, dim) { if (VID.collecting) return; const c = G(), g = c.createLinearGradient(0, 0, 0, 1180); g.addColorStop(0, DEEP2); g.addColorStop(1, DEEP1); c.fillStyle = g; c.fillRect(-20, -20, W + 40, 1200);
      const sy = 1180, sr = 300, sg = c.createLinearGradient(0, sy - sr, 0, sy); sg.addColorStop(0, ACC2); sg.addColorStop(1, OR); c.save(); c.globalAlpha = 1 - (dim || 0); c.beginPath(); c.rect(0, sy - sr, W, sr); c.clip(); c.fillStyle = sg; c.beginPath(); c.arc(W / 2, sy, sr, Math.PI, 0); c.fill();
      c.fillStyle = DEEP1; for (let i = 0; i < 7; i++) { const y = sy - 30 - i * 38, h = 4 + i * 2.2; c.fillRect(0, y, W, h); } c.restore();
      c.fillStyle = BLK; c.fillRect(-20, 1180, W + 40, H - 1160); c.strokeStyle = rgbaOf(OR, 0.75); c.lineWidth = 2.5; c.shadowColor = OR; c.shadowBlur = 12;
      for (let i = -12; i <= 12; i++) { c.beginPath(); c.moveTo(W / 2 + i * 26, 1180); c.lineTo(W / 2 + i * 260, H + 20); c.stroke(); } const off = (t * 0.6) % 1; for (let k = 0; k < 12; k++) { const z = (k + off) / 12, y = 1180 + (H - 1180) * z * z; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } D(); }
    function crt(t, draw) { if (!VID.collecting) { const c = G(); c.fillStyle = '#05040A'; c.shadowColor = rgbaOf(ACC2, 0.6); c.shadowBlur = 40; c.beginPath(); c.roundRect(TV[0] - 26, TV[1] - 26, TV[2] + 52, TV[3] + 52, 70); c.fill(); D(); }
      ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.roundRect(TV[0] + SH.x, TV[1] + SH.y, TV[2], TV[3], 54); ctx.clip(); } draw(); ctx.restore();
      if (VID.collecting) return; const c = G(); c.beginPath(); c.roundRect(TV[0], TV[1], TV[2], TV[3], 54); c.clip(); c.fillStyle = 'rgba(0,0,0,0.22)'; for (let y = TV[1]; y < TV[1] + TV[3]; y += 5) c.fillRect(TV[0], y, TV[2], 2);
      const by = TV[1] + ((t * 220) % (TV[3] + 200)) - 100; c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(TV[0], by, TV[2], 60); const v = c.createRadialGradient(W / 2, TV[1] + TV[3] / 2, TV[3] * 0.3, W / 2, TV[1] + TV[3] / 2, TV[3] * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)'); c.fillStyle = v; c.fillRect(TV[0], TV[1], TV[2], TV[3]); D(); }
    return {
      dur: DUR,
      render(t) {
        BACKDROP(() => { scene(t, 0.8 * seg(t, OUT, 0.6)); });
        if (t < OUT) {
          const draw = k => () => { const s = S[k], r = K3.wholeIn(s.c, TV); K7.photo(s, t, [TV[0] + (TV[2] - r[2]) / 2, TV[1] + (TV[3] - r[3]) / 2, r[2], r[3]].map((v, i) => (i < 2 ? v : v))); };
          const k = t < T0 ? 0 : Math.min(2, Math.floor((t - T0) / ID));
          crt(t, () => { if (t < T0 + 0.25) { if (!VID.collecting) fillScreen('#000'); if (t >= T0 - 0.25) cut('signal', t, T0, 0.5, () => {}, draw(0)); } else if (k < 2 && t > S[k + 1].start - 0.25) cut('rgb', t, S[k + 1].start, 0.5, draw(k), draw(k + 1)); else if (k > 0 && t < S[k].start + 0.25) cut('rgb', t, S[k].start, 0.5, draw(k - 1), draw(k)); else draw(k)(); });
          if (!VID.collecting) { const c = G(), on = Math.floor(t * 2) % 2 === 0; if (on) { c.fillStyle = '#FF2B2B'; c.beginPath(); c.arc(TV[0] + 50, TV[1] + 56, 13, 0, TAU); c.fill(); } setF(F(700, 30, 'Mono'), 3); c.fillStyle = WHT; c.fillText('REC', TV[0] + 74, TV[1] + 67); c.textAlign = 'right'; c.fillText('PLAY ▶', TV[0] + TV[2] - 40, TV[1] + 67); D(); }
          type(L8({ text: TITLE, slot: 'Bebas', size: 122, color: 'accent', w: 900, lead: 0.92, fx: { fill: 'neon', glow: 1 }, anim: { in: 'glitch', out: 'none', loop: 'flicker', loopAmt: 1.2 }, y: 1250, t0: 0.4, d: 30 }), t);
          if (HOURS) type(L8({ text: HOURS, slot: 'Mono', wt: 800, size: 40, track: 200, color: 'accent2', fx: { glow: 0.6, gcol: 'accent2' }, anim: { in: 'typewriter', out: 'none' }, y: 445, t0: 1.4, d: 30 }), t);
          if (t >= T0) { const kk = Math.min(2, Math.floor((t - T0) / ID)); if (D3[kk]) type(L8({ text: D3[kk], slot: 'Mont', wt: 900, size: 92, color: 'white', fx: { glow: 0.5, gcol: 'accent2', shadow: 'layered', shcol: 'accent' }, anim: { in: 'glitch', out: 'glitch', outD: 0.25 }, y: 985, t0: T0 + kk * ID + 0.15, d: ID - 0.2 }), t); }
        }
        if (t >= OUT) { close(t, OUT, { y: 520, lw: 600, glow: OR, line: END, lineL: { slot: 'Bebas', size: 130, color: 'accent', fx: { fill: 'neon', glow: 1 }, anim: { in: 'glitch', loop: 'flicker' } }, cta: 'neon', ctaCol: 'accent2', ctaGap: 430 }); }
      },
      cues() {
        const ev = [['switch', 0.35, 0.4, 0], ['glitch', 0.4, 0.35, 0], ['switch', 0.55, 0.3, 0.2], ['glitch', T0, 0.4, 0]];
        S.forEach((s, k) => { if (k) ev.push(['glitch', s.start, 0.4, 0]); ev.push(['click', s.start + 0.15, 0.3, 0.3]); });
        ev.push(['glitch', OUT + 0.6, 0.35, 0], ['switch', OUT + 0.7, 0.3, 0], ['shimmer', OUT + 1.4, 0.18, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ FRESH & LOCAL
  // Farm to table: kraft paper, botanical sprigs drawn on with a pen, footage in stitched seed-packet frames, notes written
  // by hand with a drawn arrow, and a rotating stamp with the area (or the name) at the close.
  function fresh() {
    const TITLE = TX('title', 'Fresh & Local', { label: 'Title', group: 'Opening', max: 22 });
    const SUB = TX('sub', 'from our kitchen to your table', { label: 'Line under it', group: 'Opening', max: 36 });
    const N3 = ['made with care', 'seasonal plates', 'good food, simply'].map((n, k) => TX('note' + (k + 1), n, { label: 'Note ' + (k + 1), group: 'Notes', max: 24 }));
    const END = TX('end', 'See you at the table', { label: 'Closing line', group: 'Ending', max: 28 });
    const T0 = 3.0, PD = 3.3, OUT = T0 + 3 * PD, DUR = OUT + 4.2;
    const S = shots(N3.map((n, k) => ['s' + (k + 1), 'Shot ' + (k + 1), PD + 0.4, 'any', 'v']), T0); S.forEach((s, k) => (s.start = T0 + k * PD));
    const FR = [130, 300, 820, 900];
    function sprig(x, y, sc, rot, p, col) {   // a stem with paired leaves, drawn on as p goes 0 -> 1
      if (VID.collecting || p <= 0) return; const c = G(); c.translate(x, y); c.rotate(rot); c.scale(sc, sc); c.strokeStyle = col; c.lineWidth = 3; c.lineCap = 'round'; const L = 300, k = E.inOutS(clamp(p));
      c.beginPath(); c.moveTo(0, 0); for (let i = 0; i <= 30 * k; i++) { const u = i / 30; c.lineTo(Math.sin(u * 3) * 20, -u * L); } c.stroke();
      for (let i = 1; i <= 6; i++) { const u = i / 7, lp = clamp((k - u) * 5); if (lp <= 0) continue; const px = Math.sin(u * 3) * 20, py = -u * L, side = i % 2 ? 1 : -1, len = 70 * (1 - u * 0.4) * lp;
        c.save(); c.translate(px, py); c.rotate(side * 0.9); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * 0.5, -len * 0.35, len, 0); c.quadraticCurveTo(len * 0.5, len * 0.35, 0, 0); c.stroke(); c.globalAlpha = 0.25; c.fillStyle = col; c.fill(); c.restore(); } D(); }
    function stamp(cx, cy, r, p, t, txt) { if (VID.collecting || p <= 0) return; const c = G(), s = lerp(1.6, 1, E.inC(clamp(p))); c.translate(cx, cy); c.rotate(-0.2 + t * 0.15); c.scale(s, s); c.globalAlpha = clamp(p * 3) * 0.85; c.strokeStyle = OR; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); c.beginPath(); c.arc(0, 0, r - 46, 0, TAU); c.stroke();
      setF(F(700, 28, 'Mont'), 4); c.fillStyle = OR; c.textAlign = 'center'; c.textBaseline = 'middle'; const ch = (txt + '  •  ').toUpperCase(), n = ch.length; for (let i = 0; i < n; i++) { c.save(); c.rotate(i / n * TAU); c.fillText(ch[i], 0, -r + 23); c.restore(); } D(); }
    return {
      dur: DUR,
      render(t) {
        BACKDROP(() => { if (!VID.collecting) { const c = G(); c.fillStyle = DEEP2; c.fillRect(-20, -20, W + 40, H + 40); if (NOISE.length) { c.globalAlpha = 0.6; c.fillStyle = NOISE[2]; c.fillRect(0, 0, W, H); } D(); } });
        sprig(90, 1860, 1.3, 0.2, seg(t, 0.2, 1.6), ACC2); sprig(1000, 300, 1.0, Math.PI + 0.3, seg(t, 0.6, 1.6), ACC2); sprig(980, 1880, 0.9, -0.35, seg(t, 1.0, 1.4), OR);
        if (t < T0 + 0.3) { const q = seg(t, T0 - 0.2, 0.5);
          type(L8({ text: TITLE, slot: 'Corm', wt: 700, size: 140, color: 'white', w: 1000, anim: { in: 'wordup', out: 'fade', outD: 0.4 }, y: 860, t0: 0.4, d: T0 }), t);
          type(L8({ text: SUB, slot: 'Hand', wt: 700, size: 70, color: 'accent', w: 1000, anim: { in: 'letters', stagger: 0.04, out: 'fade', outD: 0.4 }, y: 1010, t0: 1.0, d: T0 - 0.6 }), t); void q; }
        if (t >= T0 && t < OUT + 0.5) {
          const k = Math.min(2, Math.floor((t - T0) / PD)), lt = t - (T0 + k * PD), sh = S[k], r = inBox(sh, FR), q = t >= OUT ? seg(t, OUT, 0.5) : 0, p = E.outBack(seg(lt, 0, 0.55)), rot = [-1.5, 1.8, -1][k] * Math.PI / 180;
          if (!VID.collecting) { const c = G(), cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2; c.translate(cx, cy + (1 - p) * 300); c.rotate(rot); c.translate(-cx, -cy); c.globalAlpha = clamp(p * 3) * (1 - q); c.fillStyle = '#FFFDF7'; c.shadowColor = 'rgba(60,40,20,0.25)'; c.shadowBlur = 30; c.beginPath(); c.roundRect(r[0] - 30, r[1] - 30, r[2] + 60, r[3] + 120, 28); c.fill(); c.shadowColor = 'transparent';
            c.setLineDash([14, 10]); c.strokeStyle = rgbaOf(ACC2, 0.9); c.lineWidth = 3; c.beginPath(); c.roundRect(r[0] - 16, r[1] - 16, r[2] + 32, r[3] + 92, 20); c.stroke(); D(); }
          photoT(sh, t, r, { rot, oy: (1 - p) * 300, alpha: clamp(p * 3) * (1 - q) });
          type(L8({ text: N3[k], slot: 'Hand', wt: 700, size: 92, color: 'white', anim: { in: 'letters', stagger: 0.05, out: 'fade', outD: 0.3 }, x: 520, y: r[1] + r[3] + 70, rot: -3, t0: T0 + k * PD + 0.6, d: PD - 0.4 }), t);
          if (!VID.collecting) { const ap = seg(lt, 1.2, 0.5), c = G(); c.globalAlpha = 1 - q; c.strokeStyle = OR; c.lineWidth = 6; c.lineCap = 'round'; const x0 = 860, y0 = r[1] + r[3] + 40; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + 60 * ap, y0 - 120 * ap, x0 + 20 * ap, y0 - 200 * ap); c.stroke(); if (ap > 0.9) { c.beginPath(); c.moveTo(x0 + 20, y0 - 200); c.lineTo(x0 - 6, y0 - 168); c.moveTo(x0 + 20, y0 - 200); c.lineTo(x0 + 46, y0 - 176); c.stroke(); } D(); }
        }
        if (t >= OUT) { stamp(540, 1500, 140, seg(t, OUT + 1.0, 0.35), t, CONTACT.area ? 'FROM ' + CONTACT.area : BRAND.name);
          close(t, OUT, { y: 600, lw: 600, line: END, lineL: { slot: 'Hand', wt: 700, size: 100, color: 'white', anim: { in: 'letters', stagger: 0.04 } }, cta: 'outline', ctaCol: 'accent', ctaGap: 420 }); }
      },
      cues() {
        const ev = [['paper', 0.2, 0.25, 0], ['pencil', 0.3, 0.25, -0.3], ['pencil', 1.0, 0.3, 0.2]];
        S.forEach((s, k) => { ev.push(['swish', s.start, 0.3, 0]); ev.push(['pencil', s.start + 0.6, 0.25, 0.2]); ev.push(['pencil', s.start + 1.2, 0.2, 0.3]); });
        ev.push(['stamp', OUT + 1.0, 0.4, 0.3], ['chime', OUT + 1.6, 0.15, 0]);
        return { dur: DUR, beds: [musicBed(DUR), ['birds', 0, DUR, 0.1]], events: ev };
      },
    };
  }

  // ================================================================ CATERING & EVENTS
  // Black and gold: an art-deco frame draws itself, a script title in gold, the kinds of events in tracked caps, two panels
  // open side by side, three package tiers set like an invitation, then a full hero and the booking line.
  function cater() {
    const TITLE = TX('title', 'Let us cater your next event', { label: 'Script title', group: 'Opening', max: 34 });
    const EVTS = TX('events', 'WEDDINGS · CORPORATE · CELEBRATIONS', { label: 'Kinds of events', group: 'Opening', upper: true, max: 44 });
    const TIERS = ['Cocktail reception', 'Plated dinner', 'Family-style feast'].map((n, k) => TX('tier' + (k + 1), n, { label: 'Package ' + (k + 1), group: 'Packages', max: 26 }));
    const HERO = TX('hero', 'Your event, your menu', { label: 'Line over the hero shot', group: 'Hero', max: 28 });
    const END = TX('end', 'Book your event', { label: 'Closing line', group: 'Ending', max: 24 });
    const T1 = 3.6, T2 = 7.8, T3 = 11.6, OUT = 14.6, DUR = OUT + 4.2;
    const S = shots([['s1', 'Panel left', T2 - T1 + 0.3, 'any', 'v'], ['s2', 'Panel right', T2 - T1 + 0.3, 'any', 'v'], ['s3', 'Full hero', OUT - T3 + 0.3, 'any', 'v']], T1); S[1].start = T1; S[2].start = T3;
    function deco(p, a) { if (VID.collecting || p <= 0) return; const c = G(), k = E.inOutS(clamp(p)), m = 60, L = 2 * (W - 2 * m) + 2 * (H - 2 * m); c.globalAlpha = a === undefined ? 1 : a; c.strokeStyle = OR; c.lineWidth = 2;
      c.setLineDash([L * k, L]); c.strokeRect(m, m, W - 2 * m, H - 2 * m); c.setLineDash([(L - 160) * k, L]); c.strokeRect(m + 16, m + 16, W - 2 * m - 32, H - 2 * m - 32); c.setLineDash([]);
      for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) { c.save(); c.translate(x, y); c.scale(sx, sy); c.globalAlpha *= clamp(k * 2 - 0.6); for (let i = 1; i <= 4; i++) { c.beginPath(); c.arc(0, 0, 30 + i * 18, 0, Math.PI / 2); c.stroke(); } c.restore(); } D(); }
    return {
      dur: DUR,
      render(t) {
        BACKDROP(() => { if (!VID.collecting) { const c = G(), g = c.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, H * 0.7); g.addColorStop(0, DEEP1); g.addColorStop(1, BLK); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); } });
        deco(seg(t, 0.1, 1.8), t >= T3 && t < OUT ? 0.4 : 1);
        if (t < T1 + 0.3) {
          type(L8({ text: TITLE, slot: 'Hand', wt: 400, size: 130, w: 860, color: 'accent', fx: { fill: 'gold', shadow: 'soft' }, anim: { in: 'blur', inD: 1.2, out: 'fade', outD: 0.4 }, y: 880, t0: 0.7, d: T1 - 0.4 }), t);
          type(L8({ text: EVTS, slot: 'Mont', wt: 500, size: 26, track: 260, w: 1000, color: 'white', anim: { in: 'tracking', out: 'fade', outD: 0.4 }, y: 1130, t0: 1.6, d: T1 - 1.3 }), t); }
        if (t >= T1 && t < T2 + 0.5) {
          const q = seg(t, T2, 0.5);
          [[S[0], [90, 470, 430, 820], 0], [S[1], [560, 470, 430, 820], 0.25]].forEach(([s, box, dl]) => { const p = E.inOutS(seg(t, T1 + dl, 0.9)), r = inBox(s, box); ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.rect(r[0], r[1], r[2], r[3] * p); ctx.clip(); } K7.photo(s, t, r, { alpha: 1 - q }); ctx.restore();
            if (!VID.collecting) { const c = G(); c.globalAlpha = (1 - q) * clamp(p * 2); c.strokeStyle = OR; c.lineWidth = 1.5; c.strokeRect(r[0] - 12, r[1] - 12, r[2] + 24, r[3] + 24); D(); } });
          type(L8({ text: EVTS, slot: 'Mont', wt: 500, size: 26, track: 260, w: 900, color: 'accent', anim: { in: 'fade', out: 'fade' }, y: 1400, t0: T1 + 0.6, d: T2 - T1 }), t); }
        if (t >= T2 && t < T3 + 0.4) { const q = seg(t, T3 - 0.1, 0.4);
          type(L8({ text: 'Our packages', slot: 'Hand', wt: 400, size: 110, color: 'accent', fx: { fill: 'gold' }, anim: { in: 'blur', out: 'fade' }, y: 620, t0: T2 + 0.2, d: T3 - T2 }), t);
          TIERS.forEach((n, k) => { const p = seg(t, T2 + 0.6 + k * 0.45, 0.6); if (p <= 0 || VID.collecting) return; const y = 860 + k * 190, c = G(); c.globalAlpha = E.outC(p) * (1 - q); c.fillStyle = OR; c.save(); c.translate(540, y - 70); c.rotate(Math.PI / 4); c.fillRect(-8, -8, 16, 16); c.restore();
            setF(F(600, 64, 'Corm'), 0); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(n, 540, y + 10); c.fillStyle = rgbaOf(OR, 0.6); c.fillRect(540 - 140 * E.outC(p), y + 40, 280 * E.outC(p), 1.5); D(); }); }
        if (t >= T3 && t < OUT) { K7.photo(S[2], t, stageRect(S[2], 900), { alpha: E.outC(seg(t, T3, 0.5)) }); shade(H * 0.55, H, 0, 0.92);
          type(L8({ text: HERO, slot: 'Hand', wt: 400, size: 130, w: 1000, color: 'accent', fx: { fill: 'gold', shadow: 'soft' }, anim: { in: 'blur', out: 'fade' }, y: 1300, t0: T3 + 0.5, d: OUT - T3 }), t); }
        if (t >= OUT) close(t, OUT, { y: 700, lw: 600, line: END, lineL: { slot: 'Hand', wt: 400, size: 120, color: 'accent', fx: { fill: 'gold' }, anim: { in: 'blur' } }, cta: 'outline', ctaGap: 380 });
      },
      cues() { const ev = [['shimmer', 0.3, 0.2, 0], ['air', 0.8, 0.2, 0], ['air', T1, 0.25, -0.3], ['air', T1 + 0.25, 0.2, 0.3], ['chime', T2 + 0.3, 0.18, 0]];
        TIERS.forEach((n, k) => ev.push(['tink', T2 + 0.7 + k * 0.45, 0.2, (k - 1) * 0.3])); ev.push(['swell', T3 - 0.6, 0.2, 0], ['shimmer', OUT + 0.4, 0.2, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ MORNING RITUAL
  // Cafe and brunch: a sunrise warms the page, footage sits in soft rounded frames with steam curling up from the top, the menu
  // pops in as pill tags, coffee-ring marks and a small ticking clock keep it homely.
  function brunch() {
    const TITLE = TX('title', 'Good morning', { label: 'Script title', group: 'Opening', max: 20 });
    const SUB = TX('sub', 'BREAKFAST & BRUNCH', { label: 'Line under it', group: 'Opening', upper: true, max: 28 });
    const ITEMS = TX('items', 'Buttermilk pancakes\nAvocado toast\nCold brew', { label: 'Menu tags (one per line)', group: 'Menu', multiline: true, max: 90 });
    const HOURS = TX('hours', '', { label: 'Hours', group: 'Menu', upper: true, max: 18, hint: 'Optional, e.g. 7AM–2PM. Empty hides it.' });
    const END = TX('end', 'Start your day with us', { label: 'Closing line', group: 'Ending', max: 28 });
    const T0 = 3.2, T1 = 7.6, T2 = 11.6, OUT = 14.6, DUR = OUT + 4.2;
    const S = shots([['s1', 'Coffee or the counter', T1 - T0 + 0.3, 'any', 'v'], ['s2', 'A plate', T2 - T1 + 0.3, 'any', 'v'], ['s3', 'The room', OUT - T2 + 0.3, 'any', 'v']], T0); S[1].start = T1; S[2].start = T2;
    const IT = lines(ITEMS).slice(0, 4), FR = [150, 330, 780, 800];
    function steam(x, y, t, a) { if (VID.collecting || a <= 0) return; const c = G(); c.strokeStyle = WA(0.55 * a); c.lineCap = 'round'; c.lineWidth = 10; for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i / 3) % 1; c.globalAlpha = Math.sin(Math.PI * ph); c.beginPath(); for (let k = 0; k <= 20; k++) { const u = k / 20; c.lineTo(x + (i - 1) * 60 + Math.sin(u * 6 + t * 2 + i) * 22, y - ph * 120 - u * 160); } c.stroke(); } D(); }
    function rings() { if (VID.collecting) return; const c = G(); c.strokeStyle = WA(0.1); for (const [x, y, r] of [[900, 260, 90], [140, 1700, 110]]) { for (let i = 0; i < 40; i++) { c.lineWidth = 3 + hash(i + x) * 6; c.globalAlpha = 0.25 + hash(i * 3 + y) * 0.5; c.beginPath(); c.arc(x, y, r, i / 40 * TAU, (i + 1) / 40 * TAU); c.stroke(); } } D(); }
    return {
      dur: DUR,
      render(t) {
        BACKDROP(() => { if (!VID.collecting) { const k = E.inOutS(seg(t, 0, 3.0)), c = G(), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, mix(DEEP1, ACC2, 0.35 * k)); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40);
          const sy = lerp(H + 260, 1320, E.outC(seg(t, 0.1, 2.8))); const sg = c.createRadialGradient(W / 2, sy, 20, W / 2, sy, 520); sg.addColorStop(0, rgbaOf(ACC2, 0.95)); sg.addColorStop(0.5, rgbaOf(ACC2, 0.35)); sg.addColorStop(1, rgbaOf(ACC2, 0)); c.fillStyle = sg; c.fillRect(0, sy - 520, W, 1040); D(); } });
        rings();
        if (t < T0 + 0.3) { type(L8({ text: TITLE, slot: 'Hand', wt: 400, size: 170, w: 1000, color: 'accent', fx: { shadow: 'soft' }, anim: { in: 'letters', stagger: 0.06, out: 'fade', outD: 0.4 }, y: 820, t0: 0.6, d: T0 }), t);
          type(L8({ text: SUB, slot: 'Mont', wt: 700, size: 34, track: 300, color: 'white', anim: { in: 'tracking', out: 'fade', outD: 0.4 }, y: 990, t0: 1.4, d: T0 - 0.8 }), t);
          if (HOURS) type(L8({ text: HOURS, slot: 'Mont', wt: 800, size: 40, color: 'accent', fx: { deco: 'pill', dcol: 'white' }, anim: { in: 'pop', out: 'fade', outD: 0.4 }, y: 1120, t0: 1.9, d: T0 - 1.3 }), t); }
        if (t >= T0 && t < OUT) {
          const k = t < T1 ? 0 : t < T2 ? 1 : 2, s = S[k], lt = t - s.start, r = inBox(s, FR), p = E.outBack(seg(lt, 0, 0.6));
          const draw = j => () => { const sj = S[j], rj = inBox(sj, FR); if (!VID.collecting) { const c = G(); c.fillStyle = '#FFFFFF'; c.shadowColor = 'rgba(80,40,20,0.22)'; c.shadowBlur = 40; c.shadowOffsetY = 16; c.beginPath(); c.roundRect(rj[0] - 16, rj[1] - 16, rj[2] + 32, rj[3] + 32, 70); c.fill(); D(); }
            ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.roundRect(rj[0] + SH.x, rj[1] + SH.y, rj[2], rj[3], 58); ctx.clip(); } K7.photo(sj, t, rj); ctx.restore(); };
          if (k > 0 && lt < 0.4) cut('softwipe', t, s.start, 0.8, draw(k - 1), draw(k), { dir: 'up' }); else { ctx.save(); if (k === 0) ctx.globalAlpha = clamp(p * 3); draw(k)(); ctx.restore(); }
          if (k === 0) steam(540, r[1] - 10, t, clamp((t - T0) * 2));
          IT.forEach((it, j) => { const ti = T0 + 0.6 + j * 0.35; if (t < ti) return; const dc = j % 2 ? 'accent2' : 'white'; type(L8({ text: it, slot: 'Mont', wt: 800, size: 46, color: K8.onCol(K8.col(dc)), fx: { deco: 'pill', dcol: dc }, anim: { in: 'pop', out: 'fade' }, x: 540 + [-80, 90, -50, 70][j], y: 1190 + j * 72, rot: [-3, 2, -2, 3][j], t0: ti, d: OUT - ti }), t); });
          if (!VID.collecting) { const c = G(), cx = 930, cy = 1070, a = clamp((t - T0) * 2); c.globalAlpha = a; c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(cx, cy, 58, 0, TAU); c.fill(); c.strokeStyle = '#2A2420'; c.lineWidth = 4; c.stroke(); c.lineCap = 'round';
            c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(t * 0.6 - 1.5) * 28, cy + Math.sin(t * 0.6 - 1.5) * 28); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(t * 6 - 1.5) * 42, cy + Math.sin(t * 6 - 1.5) * 42); c.stroke(); D(); }
        }
        if (t >= OUT) close(t, OUT, { y: 620, lw: 600, line: END, lineL: { slot: 'Hand', wt: 400, size: 92, color: 'accent', anim: { in: 'letters', stagger: 0.04 } }, cta: 'pill', ctaGap: 400 });
      },
      cues() { const ev = [['air', 0.2, 0.2, 0], ['tink', 0.7, 0.2, 0.3], ['pour', T0 + 0.1, 0.25, 0]];
        IT.forEach((it, j) => ev.push(['pop', T0 + 0.6 + j * 0.35, 0.35, (j % 2 ? 0.3 : -0.3)])); ev.push(['air', T1, 0.25, 0], ['air', T2, 0.25, 0], ['bell', OUT + 1.4, 0.2, 0]);
        return { dur: DUR, beds: [musicBed(DUR), ['birds', 0, DUR, 0.14]], events: ev }; },
    };
  }

  const MAKE = { burger, sushi, cheese, pour, menuedit, street, late, fresh, cater, brunch };
  const P = (MAKE[V] || burger)();
  const light = ['sushi', 'menuedit', 'fresh', 'brunch'].includes(V);
  DIR = { dur: P.dur, bg: BLK, bgSwap: true, finish: { vig: light ? 0.1 : 0.28, grain: light ? 0.1 : 0.2 }, edl: [], shakes: P.shakes, preload: () => K3.init(), render: P.render, cues: P.cues, fam: V,
    setup() { if (!window.STUDIO && LIGHTPAL) { const w = IMG.logoW; IMG.logoW = IMG.logoB; IMG.logoB = w; } } };
});
