'use strict';
/* Holiday templates (Oct 28). One set of four layouts for every occasion in HOL.THEMES (kit6): the occasion comes from the
   studio (PRM.hol) or ?h=, and sets the copy, decorations, particles and music. Colours and fonts come from the active
   palette (the studio applies the occasion's palette by default); a plain engine render uses the occasion's palette.
   ?v=greet  Holiday Greeting   ?v=special  Holiday Special   ?v=hours  Holiday Hours   ?v=count  Countdown */
STUDIO_REG['hol'] = (() => {
  const V = QS.get('v') || 'greet';
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null; const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d); const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d; const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const HID = (typeof PRM !== 'undefined' && PRM.hol && HOL.THEMES[PRM.hol]) ? PRM.hol : (HOL.THEMES[QS.get('h')] ? QS.get('h') : 'christmas');
  const TH = HOL.THEMES[HID], CP = HOL.copy(HID), L = K5.LAND, VT = K5.VERT;
  if (!window.STUDIO) setBrandColors(TH.pal);
  const G = K3.G, D = K3.D;
  const up = s => String(s || '').toUpperCase();
  const FXP = () => { const f = window.HOLFX; return f ? f.p : TH.fx; }, FXD = () => { const f = window.HOLFX; return f ? f.d : TH.decor; };
  const amt = () => (window.HOLFX && window.HOLFX.a) || 1;
  const fitT = (s, w, max, maxW, fam, ls, style) => Math.min(max, fitSize(s, w, maxW || 940, 400, fam || 'Mont', ls === undefined ? 0 : ls, style));
  const tagDef = () => up(TH.greet).replace(/[!¡]/g, '');
  function lines2(s, max) {   // split a long line at the space nearest the middle
    s = String(s || ''); if (s.length <= max) return [s]; const mid = s.length / 2; let b = -1;
    for (let i = 0; i < s.length; i++) if (s[i] === ' ' && (b < 0 || Math.abs(i - mid) < Math.abs(b - mid))) b = i;
    return b < 0 ? [s] : [s.slice(0, b), s.slice(b + 1)];
  }
  // particles + the edge decoration (+ the theme's second particle field), drawn over the scene
  function seasonal(t, o) {
    o = o || {}; const q = o.q || 0, d = FXD();
    if (d && !o.noDecor) HOL.decor(d, t, { p: clamp((t - (o.d0 || 0.15)) / 0.9), q: o.qd || 0, cols: TH.decor === d ? TH.cols : undefined });
    const p = FXP(); if (p) HOL.particles(p, t, { amt: amt(), cols: TH.fx === p ? TH.cols : undefined, alpha: 1 - q * 0.4 });
    if (TH.fx2 && !window.HOLFX) HOL.particles(TH.fx2, t, { amt: 0.6, cols: TH.cols, alpha: 0.9 });
  }
  // the occasion's larger pieces, placed for each layout
  function hero(t, which, o) {
    o = o || {}; const q = o.q || 0, has = k => TH.hero.includes(k) && (!o.only || o.only.includes(k));
    if (has('bokeh')) HOL.decor('bokeh', t, { cols: TH.cols, q, n: 14 });
    if (has('fireworks')) HOL.decor('fireworks', t, { cols: TH.cols, q, y0: 160, y1: which === 'greet' ? 620 : 520 });
    if (has('moon')) HOL.decor('moon', t, { p: clamp((t - 0.2) / 1.0), q, x: W * 0.76, y: 300, r: which === 'greet' ? 140 : 110 });
    if (has('burst')) HOL.decor('burst', t, { cx: W / 2, cy: o.burstY || 860, r: 480, p: clamp((t - 0.2) / 0.6), q });
    if (has('balloons') && which === 'greet') HOL.decor('balloons', t, { cols: TH.cols, q });
    if (has('ornaments') && !o.noOrn) HOL.decor('ornaments', t, { cols: [OR, ACC2, mix2()], p: clamp((t - 0.5) / 1.1), q });
    if (has('florals')) HOL.decor('florals', t, { cols: TH.cols, p: clamp((t - 0.3) / 1.2), q, spots: which === 'greet' ? [[-20, H * 0.18, 1], [W + 20, H * 0.74, -1]] : [[-40, H * 0.04, 1], [W + 40, H * 0.96, -1]] });
    if (has('papel') && FXD() !== 'papel') HOL.decor('papel', t, { cols: TH.cols, p: clamp((t - 0.2) / 0.9), q });
    if (has('pumpkins') && !o.noBottom) HOL.decor('pumpkins', t, { p: clamp((t - 0.6) / 1.0), q, y: H - 70 });
    if (has('candles') && !o.noBottom) HOL.decor('candles', t, { p: clamp((t - 0.6) / 1.0), q, y: H - 60 });
    if (has('flag') && !o.noBottom) HOL.decor('flag', t, { p: clamp((t - 0.4) / 0.8), q, y: H - 290 });
    if (has('menorah') && o.menorah) HOL.decor('menorah', t, Object.assign({ q }, o.menorah));
  }
  const mix2 = () => HOL.mix(OR, ACC2, 0.5);
  // a footage shot that fills the frame when vertical and sits whole in a band when landscape
  function bgShot(s, t, a, cy) {
    const r = K3.wholeIn(s.c, [0, 0, W, H]); ctx.save(); ctx.globalAlpha = a;
    if (r[3] >= H - 2) K3.clip(s.c, s.in, t - s.start, [0, 0, W, H]);
    else { const band = K3.wholeIn(s.c, [0, (cy || 1000) - 304, W, 607]); K3.clip(s.c, s.in, t - s.start, band); }
    ctx.restore(); return r[3] >= H - 2;
  }
  function scrim(a) {   // top and bottom shading so text reads over footage
    if (VID.collecting) return; const c = G(); c.globalAlpha = a;
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, HOL.hexA(BLK, 0.75)); g.addColorStop(0.32, HOL.hexA(BLK, 0.42)); g.addColorStop(0.62, HOL.hexA(BLK, 0.5)); g.addColorStop(1, HOL.hexA(BLK, 0.85));
    c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40);
    if (LIGHTPAL) { const r = c.createRadialGradient(W / 2, 880, 60, W / 2, 880, 640); r.addColorStop(0, HOL.hexA(BLK, 0.82)); r.addColorStop(0.6, HOL.hexA(BLK, 0.45)); r.addColorStop(1, HOL.hexA(BLK, 0)); c.fillStyle = r; c.fillRect(0, 0, W, H); }
    D();
  }
  // a script line written on from the left (Hand = the script slot)
  function script(lines, cy, size, t0, t, o) {
    o = o || {}; if (VID.collecting) return; const q = o.q || 0, lh = size * 1.02;
    lines.forEach((ln, i) => {
      const p = clamp((t - t0 - i * 0.35) / 1.0); if (p <= 0) return; const y = cy + (i - (lines.length - 1) / 2) * lh, f = F(o.w || 700, size, 'Hand'), w = textW(ln, f, 0) + size;
      const c = G(); c.globalAlpha = (1 - q) * clamp(p * 2.5); c.beginPath(); c.rect(W / 2 - w / 2 - 40, y - size * 1.3, (w + 80) * E.outC(p), size * 2); c.clip();
      setF(f, 0); c.textAlign = 'center'; c.textBaseline = 'middle';
      if (!LIGHTPAL) { c.shadowColor = HOL.hexA(OR, 0.55); c.shadowBlur = 36; }
      c.fillStyle = o.col || WHT; c.fillText(ln, W / 2, y + (1 - E.outC(p)) * 18); D();
    });
  }
  function flourish(cy, w, p, q) {   // a thin rule with a diamond in the middle
    if (p <= 0 || VID.collecting) return; const c = G(), e = E.inOutC(clamp(p)); c.globalAlpha = 1 - (q || 0); c.fillStyle = ACC2;
    c.fillRect(W / 2 - w / 2 * e, cy - 1.5, w * e, 3); c.translate(W / 2, cy); c.rotate(Math.PI / 4); c.fillStyle = OR; const s = 12 * E.outBack(clamp(p * 1.3)); c.fillRect(-s / 2, -s / 2, s, s); D();
  }
  function musicBed(dur, o) { return ['music', 0, dur, 0.95, Object.assign({ style: TH.music, bpm: { jingle: 112, party: 118, romance: 76, anthem: 104, spooky: 92, day: 100, pulse: 120 }[TH.music] || 100, key: 0, end: dur - 0.6, soft: TH.tone === 'somber', bells: HID !== 'hanukkah' }, o || {})]; }

  // ---------------------------------------------------------------- Holiday Greeting: footage, the greeting written on, decorations, the ending
  function greet() {
    const S0 = K5.shotsOf([VT[1], VT[3]], [3.6, 3.6], 'any', 'Footage', ['Background shot 1 (vertical fills the screen)', 'Background shot 2']);
    const KICK = TX('kick', CP.kick, { label: 'Small line above', group: 'Greeting', upper: true, max: 32 });
    const GREET = TX('greet', CP.greet, { label: 'Greeting', group: 'Greeting', max: 30, hint: 'Shown in the script font' });
    const SUB = TX('sub', CP.sub, { label: 'Line below', group: 'Greeting', max: 64 });
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const OUT = 7.0, DUR = 12, CY = 900, GL = lines2(GREET, 13);
    const gsize = Math.min(GL.length > 1 ? 190 : 170, ...GL.map(l => fitSize(l, 700, 930, 220, 'Hand', 0)));
    function elements() {
      const lh = gsize * 1.02, yb = CY + gsize * (GL.length > 1 ? 1.0 : 0.62) + 30;
      return [
        { id: 'kick', kind: 'pos', label: KICK, x: W / 2, y: CY - gsize * (GL.length > 1 ? 1.15 : 0.75) - 40, t0: 0.5, d: OUT - 0.5, box: [W / 2 - 450, CY - gsize * (GL.length > 1 ? 1.15 : 0.75) - 62, 900, 44], dup: false, del: false },
        { id: 'greet', kind: 'pos', label: GREET, x: W / 2, y: CY, t0: 0.9, d: OUT - 0.9, box: [W / 2 - 465, CY - lh * (GL.length / 2), 930, lh * GL.length], dup: false, del: false },
        { id: 'flourish', kind: 'pos', label: 'Flourish under the greeting', x: W / 2, y: yb, t0: 2.0, d: OUT - 2.0, box: [W / 2 - 180, yb - 6, 360, 12], dup: false, del: false },
        { id: 'sub', kind: 'pos', label: SUB, x: W / 2, y: yb + 78, t0: 2.3, d: OUT - 2.3, box: [W / 2 - 450, yb + 56, 900, 44], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        const qo = clamp((t - (OUT - 0.4)) / 0.5);
        BACKDROP(() => HOL.backdrop(t, { cols: TH.cols }));
        if (t < OUT + 0.2) {   // two background shots with a dissolve; vertical fills the frame, landscape sits whole in the middle
          const sh = K3.shotAt(S0, clamp(t, 0, S0.total - 1 / 60)).sh, full = K3.wholeIn(sh.c, [0, 0, W, H])[3] >= H - 2;
          ctx.save(); ctx.globalAlpha = 1 - qo; K5.seq(S0, t, full ? [0, 0, W, H] : [0, 1060 - 304, W, 607], ['cut', 'dissolve'], 0.9); ctx.restore();
          if (!VID.collecting) scrim((full ? 1 : 0.6) * (1 - qo)); }
        if (VID.collecting) return;
        hero(t, 'greet', { q: qo * 0, menorah: TH.hero.includes('menorah') ? { cx: W / 2, y: 1660, size: 0.95, lit: clamp((t - 0.8) / 3.2), p: clamp((t - 0.3) / 0.8), q: qo } : null, noBottom: false });
        if (t < OUT) {
          const q = qo;
          const [kx, ky] = posOf(elP('kick'), [W / 2, CY - gsize * (GL.length > 1 ? 1.15 : 0.75) - 40]);
          caps(KICK, kx, ky, 30, clamp((t - 0.5) / 0.5), q, { w: 700, ls: 8, col: ACC2, maxW: 900, shadow: LIGHTPAL ? null : 'rgba(0,0,0,0.5)' });
          const gy = posOf(elP('greet'), [W / 2, CY])[1];
          script(GL, gy, gsize, 0.9, t, { q });
          const yb = gy + gsize * (GL.length > 1 ? 1.0 : 0.62) + 30; flourish(posOf(elP('flourish'), [W / 2, yb])[1], 360, clamp((t - 2.0) / 0.6), q);
          const [sx, sy] = posOf(elP('sub'), [W / 2, yb + 78]);
          T(SUB, sx, sy, F(600, fitT(SUB, 600, 46, 900, 'Corm', 0, 'italic'), 'Corm', 'italic'), { align: 'center', p: clamp((t - 2.3) / 0.6), q, mode: 'fade', shadow: LIGHTPAL ? null : ['rgba(0,0,0,0.5)', 16] });
        }
        seasonal(t, {});
        if (t >= OUT) K3.outro('kinetic', t - OUT, TAG);
      },
      cues() {
        const ev = [['whoosh', 0.25, 0.25, 0], ['shimmer', 0.95, 0.35, 0], ['chime', 1.2, 0.3, -0.2], ['tink', 2.05, 0.2, 0.3], ['air', 2.3, 0.2, 0]];
        if (TH.hero.includes('menorah')) for (let k = 0; k < 9; k++) ev.push(['tink', 0.8 + k * 0.36, 0.14, (k - 4) * 0.15]);
        if (TH.hero.includes('fireworks')) [1.6, 3.2, 4.6, 6.1].forEach((x, i) => ev.push(['boom', x, 0.22, (i % 2 ? 0.4 : -0.4)]));
        K5.outroCues(ev, OUT);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Holiday Special: a hook, footage unwrapped from gift paper, the offer, CTA
  function special() {
    const S = K5.shotsOf([L[0], L[3]], [3.4, 3.4], 'land', 'Footage');
    const hookDef = K5.isDPG() ? up(TH.greet).replace(/[!¡]/g, '') : TH.tone === 'sale' ? up(TH.name) : TH.tone === 'somber' ? up(TH.name) + ' WEEKEND' : up(TH.name) + ' SPECIAL';
    const HOOK = TX('hook', hookDef, { label: 'Headline', group: 'Top', upper: true, max: 26 });
    const KICK = TX('kick', K5.isDPG() ? 'FROM ' + up(BRAND.short || BRAND.name) : up(BRAND.name), { label: 'Small line above', group: 'Top', upper: true, max: 30 });
    const HEAD = TX('head', CP.offer[0], { label: 'Offer headline', group: 'Offer', upper: true, max: 30, hint: K5.isDPG() ? '' : 'Put your real offer here, or keep this invitation' });
    const DET = TX('det', CP.offer[1], { label: 'Offer details', group: 'Offer', max: 44 });
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const T0 = 1.3, OUT = T0 + S.total + 0.5, DUR = 15, PR = [90, 560, 900, 506];
    S.forEach(s => (s.start += T0)); S.total += T0;
    function wrap(t, u, R) {   // gift paper over the frame that splits open (u 0..1) as the ribbon pulls away
      if (VID.collecting || u >= 1) return; const c = G(), [x, y, w, h] = R || PR, e = E.inOutC(clamp(u)), half = w / 2;
      c.beginPath(); c.rect(x, y, w, h); c.clip();
      for (const sd of [-1, 1]) {
        c.save(); c.translate(sd * e * (half + 40), 0);
        const px = sd < 0 ? x : x + half; c.fillStyle = OR; c.fillRect(px, y, half, h);
        c.globalAlpha = 0.18; c.fillStyle = WHT; for (let i = -6; i < 20; i++) { c.save(); c.beginPath(); c.rect(px, y, half, h); c.clip(); c.translate(px + i * 60, y); c.rotate(0.6); c.fillRect(0, -40, 14, h * 2); c.restore(); }
        c.globalAlpha = 1; c.restore();
      }
      const rb = 1 - E.inC(clamp(u * 1.6)); c.globalAlpha = rb; c.fillStyle = ACC2;
      c.fillRect(x + half - 26, y - (1 - rb) * 300, 52, h); c.fillRect(x - (1 - rb) * 500, y + h / 2 - 26, w, 52);
      c.translate(x + half, y + h / 2 - (1 - rb) * 260); c.fillStyle = HOL.mix(ACC2, '#000000', 0.15);
      for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 58, -10, 62, 34, sd * 0.45, 0, TAU0); c.fill(); }
      c.fillStyle = ACC2; c.beginPath(); c.arc(0, -6, 24, 0, TAU0); c.fill(); D();
    }
    const TAU0 = Math.PI * 2;
    function elements() {
      const hs = fitT(HOOK, 400, 150, 940, 'Bebas', 2);
      return [
        { id: 'kick', kind: 'pos', label: KICK, x: W / 2, y: 300, t0: 0.2, d: OUT - 0.2, box: [W / 2 - 450, 278, 900, 44], dup: false, del: false },
        { id: 'hook', kind: 'pos', label: HOOK, x: W / 2, y: 330 + hs * 0.95, t0: 0.35, d: OUT - 0.35, box: [W / 2 - 470, 330 + hs * 0.95 - hs / 2, 940, hs], dup: false, del: false },
        { id: 'frame', kind: 'box', label: 'Footage frame', x: PR[0], y: PR[1], w: PR[2], h: PR[3], t0: 0.9, d: OUT - 0.9, box: [PR[0], PR[1], PR[2], PR[3]], dup: false, del: false },
        { id: 'head', kind: 'pos', label: HEAD, x: W / 2, y: 1172, t0: T0 + 1.0, d: OUT - (T0 + 1.0), box: [W / 2 - 430, 1150, 860, 44], dup: false, del: false },
        { id: 'det', kind: 'pos', label: DET, x: W / 2, y: 1236, t0: T0 + 1.3, d: OUT - (T0 + 1.3), box: [W / 2 - 430, 1214, 860, 44], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: 'Call to action', x: W / 2, y: 1322, t0: T0 + 1.7, d: OUT - (T0 + 1.7), box: [W / 2 - 300, 1300, 600, 44], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        BACKDROP(() => HOL.backdrop(t, { cols: TH.cols })); if (!VID.collecting) hero(t, 'special', { only: ['bokeh', 'fireworks', 'moon', 'burst', 'florals'], burstY: 420 });
        const q = clamp((t - (OUT - 0.35)) / 0.35);
        if (t < OUT) {
          const [kx, ky] = posOf(elP('kick'), [W / 2, 300]);
          caps(KICK, kx, ky, 28, clamp((t - 0.2) / 0.4), q, { w: 700, ls: 7, col: ACC2, maxW: 900 });
          const hs = fitT(HOOK, 400, 150, 940, 'Bebas', 2), [hx, hy] = posOf(elP('hook'), [W / 2, 330 + hs * 0.95]); T([[HOOK, TH.tone === 'sale' ? OR : WHT]], hx, hy, F(400, hs, 'Bebas'), { align: 'center', ls: 2, p: clamp((t - 0.35) / 0.45), q });
          if (t >= 0.9) {
            const a = clamp((t - 0.9) / 0.35) * (1 - q), [fx, fy] = posOf(elP('frame'), [PR[0], PR[1]]), [x, y, w, h] = [fx, fy, PR[2], PR[3]];
            if (!VID.collecting) { const c = G(); c.globalAlpha = a; c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 40; c.shadowOffsetY = 16; c.fillStyle = PAPER; c.fillRect(x - 14, y - 14, w + 28, h + 28); D(); }
            if (t >= T0 + 0.1) { ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); K5.seq(S, t, [x, y, w, h], ['cut', 'dissolve'], 0.6); ctx.restore(); }
            ctx.save(); ctx.globalAlpha = a; wrap(t, (t - T0 - 0.25) / 0.9, [x, y, w, h]); ctx.restore();
          }
          const hyy = 1172, hz = fitT(HEAD, 900, 76, 860, 'Mont', 0), [hdx, hdy] = posOf(elP('head'), [W / 2, hyy]);
          T(HEAD, hdx, hdy, F(900, hz, 'Mont'), { align: 'center', p: clamp((t - T0 - 1.0) / 0.45), q });
          const [dx2, dy2] = posOf(elP('det'), [W / 2, hyy + 64]);
          T(DET, dx2, dy2, F(600, fitT(DET, 600, 40, 860, 'Mont', 0), 'Mont'), { align: 'center', p: clamp((t - T0 - 1.3) / 0.45), q, mode: 'fade', col: HOL.hexA(WHT, 0.85) });
          K5.ctaRow(t, posOf(elP('cta'), [W / 2, 1322])[1], T0 + 1.7, 1 - q);
        }
        if (!VID.collecting) seasonal(t, {});
        if (t >= OUT) K3.outro('kinetic', t - OUT, TAG);
      },
      cues() {
        const ev = [['impact', 0.38, 0.4, 0], ['whoosh', 0.9, 0.25, 0], ['paper', T0 + 0.3, 0.45, 0], ['shimmer', T0 + 0.5, 0.3, 0], ['pop', T0 + 1.0, 0.3, 0], ['tink', T0 + 1.75, 0.2, 0.3]];
        S.forEach((s, i) => { if (i) ev.push(['air', s.start, 0.25, 0.2]); }); K5.outroCues(ev, OUT);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Holiday Hours: logo, the occasion, an hours card, contact
  function hours() {
    const titleDef = (HID === 'christmas' || HID === 'holidays' ? 'HOLIDAY' : up(TH.name)) + ' HOURS';
    const TITLE = TX('title', titleDef, { label: 'Title', group: 'Hours', upper: true, max: 26 });
    const ROWS = CP.hours.map(([d, h], i) => [TX('d' + (i + 1), d, { label: 'Day ' + (i + 1), group: 'Hours', upper: true, max: 20, req: true }), TX('h' + (i + 1), h, { label: 'Hours ' + (i + 1), group: 'Hours', upper: true, max: 20, req: true })]);
    const NOTE = TX('note', TH.greet.replace(/[!¡]/g, '') + '!', { label: 'Note under the card', group: 'Hours', max: 40 });
    const SCRIPT = TX('script', TH.greet.replace(/[!¡]/g, ''), { label: 'Script line', group: 'Hours', max: 30 });
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const OUT = 6.6, DUR = 10, CARD = [100, 760, 880, 470];
    function elements() {
      const rows = ROWS.map(([d, hh], i) => ([
        { id: 'day' + (i + 1), kind: 'pos', label: d, x: CARD[0] + 60, y: CARD[1] + 110 + i * 130, t0: 1.5 + i * 0.22, d: OUT - (1.5 + i * 0.22), box: [CARD[0] + 60, CARD[1] + 110 + i * 130 - 22, 400, 44], dup: false, del: false },
        { id: 'hrs' + (i + 1), kind: 'pos', label: hh, x: CARD[0] + CARD[2] - 60, y: CARD[1] + 110 + i * 130, t0: 1.5 + i * 0.22, d: OUT - (1.5 + i * 0.22), box: [CARD[0] + CARD[2] - 420, CARD[1] + 110 + i * 130 - 22, 360, 44], dup: false, del: false },
      ])).flat();
      const line = [CONTACT.phone, CONTACT.web].filter(Boolean).join('   ·   ');
      return [
        { id: 'logo', kind: 'pos', label: 'Business logo', x: W / 2, y: 330, t0: 0.2, d: OUT - 0.2, box: [W / 2 - 200, 230, 400, 200], dup: false, del: false },
        { id: 'script', kind: 'pos', label: SCRIPT, x: W / 2, y: 530, t0: 0.6, d: OUT - 0.6, box: [W / 2 - 450, 482, 900, 96], dup: false, del: false },
        { id: 'title', kind: 'pos', label: TITLE, x: W / 2, y: 690, t0: 0.9, d: OUT - 0.9, box: [W / 2 - 450, 638, 900, 104], dup: false, del: false },
        { id: 'card', kind: 'card', label: 'Hours card', x: CARD[0], y: CARD[1], w: CARD[2], h: CARD[3], t0: 1.2, d: OUT - 1.2, box: [CARD[0], CARD[1], CARD[2], CARD[3]], dup: false, del: false },
        ...rows,
        { id: 'note', kind: 'pos', label: NOTE, x: W / 2, y: 1330, t0: 2.4, d: OUT - 2.4, box: [W / 2 - 450, 1308, 900, 44], dup: false, del: false },
        { id: 'contact', kind: 'pos', label: line || 'Contact', x: W / 2, y: 1420, t0: 2.7, d: OUT - 2.7, box: [W / 2 - 480, 1398, 960, 44], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        BACKDROP(() => HOL.backdrop(t, { cols: TH.cols })); if (VID.collecting) return;
        const q = clamp((t - (OUT - 0.35)) / 0.35);
        hero(t, 'hours', { only: ['bokeh', 'moon', 'florals', 'ornaments', 'flag'], q });
        if (t < OUT) {
          ctx.save(); ctx.globalAlpha = 1 - q; const [lx, ly] = posOf(elP('logo'), [W / 2, 330]); K3.logoBuild(lx, ly, 400, 0.2, t, { img: IMG.logoW }); ctx.restore();
          script([SCRIPT], posOf(elP('script'), [W / 2, 530])[1], Math.min(96, fitSize(SCRIPT, 700, 900, 96, 'Hand', 0)), 0.6, t, { q });
          const ts = fitT(TITLE, 400, 104, 900, 'Bebas', 3), [tx2, ty2] = posOf(elP('title'), [W / 2, 690]); T([[TITLE, OR]], tx2, ty2, F(400, ts, 'Bebas'), { align: 'center', ls: 3, p: clamp((t - 0.9) / 0.4), q });
          const [cx0, cy0] = posOf(elP('card'), [CARD[0], CARD[1]]), [x, y, w, h] = [cx0, cy0, CARD[2], CARD[3]], a = clamp((t - 1.2) / 0.4) * (1 - q), c = G();
          c.globalAlpha = a; c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 40; c.shadowOffsetY = 14; c.fillStyle = PAPER; rrect(x, y + (1 - E.outC(clamp((t - 1.2) / 0.5))) * 40, w, h, 28); c.fill(); D();
          ROWS.forEach(([d, hh], i) => {
            const p = clamp((t - 1.5 - i * 0.22) / 0.45); if (p <= 0) return; const ry = y + 110 + i * 130, c2 = G(); c2.globalAlpha = E.outC(p) * (1 - q);
            const dx = (1 - E.outC(p)) * -30, sz = Math.min(44, fitSize(d, 800, 400, 44, 'Mont', 1)), hz = Math.min(44, fitSize(hh, 800, 360, 44, 'Mont', 1));
            const [ddx, ddy] = posOf(elP('day' + (i + 1)), [x + 60, ry]), [hhx, hhy] = posOf(elP('hrs' + (i + 1)), [x + w - 60, ry]);
            setF(F(800, sz, 'Mont'), 1); c2.fillStyle = BLK; c2.textAlign = 'left'; c2.textBaseline = 'middle'; c2.fillText(d, ddx + dx, ddy);
            setF(F(800, hz, 'Mont'), 1); c2.fillStyle = HOL.mix(OR, BLK, LIGHTPAL ? 0.1 : 0.25); c2.textAlign = 'right'; c2.fillText(hh, hhx + dx, hhy);
            if (i < ROWS.length - 1) { c2.fillStyle = HOL.hexA(BLK, 0.14); c2.fillRect(x + 60, ddy + 65, w - 120, 2); } D();
          });
          const [nx2, ny2] = posOf(elP('note'), [W / 2, 1330]);
          T(NOTE, nx2, ny2, F(600, fitT(NOTE, 600, 52, 900, 'Corm', 0, 'italic'), 'Corm', 'italic'), { align: 'center', p: clamp((t - 2.4) / 0.5), q, mode: 'fade' });
          const line = [CONTACT.phone, CONTACT.web].filter(Boolean).join('   ·   ');
          if (line) { const [cpx, cpy] = posOf(elP('contact'), [W / 2, 1420]); caps(line, cpx, cpy, 28, clamp((t - 2.7) / 0.5), q, { w: 800, ls: 2, maxW: 960, col: WHT }); }
        }
        seasonal(t, {});
        if (t >= OUT) K3.outro('kinetic', t - OUT, TAG);
      },
      cues() {
        const ev = [['shimmer', 0.6, 0.3, 0], ['whoosh', 1.2, 0.22, 0]]; ROWS.forEach((r, i) => ev.push(['tick', 1.55 + i * 0.22, 0.3, 0.2])); ev.push(['chime', 2.4, 0.25, 0]);
        K5.outroCues(ev, OUT); return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Countdown: flip numbers land on the days left, footage, a line, CTA
  function count() {
    const S = K5.shotsOf([L[0], L[3], L[1]], [2.3, 2.3, 2.3], 'land', 'Footage');
    const days = CP.days, numDef = days === 0 ? 'TODAY' : String(days);
    const labDef = days === 0 ? up(TH.name) + ' IS HERE' : (days === 1 ? 'DAY UNTIL ' : 'DAYS UNTIL ') + (HID === 'newyear' ? 'THE NEW YEAR' : up(TH.name));
    const lineDef = K5.isDPG() ? 'PLAN YOUR NEXT PROJECT' : BRAND.industry === 'restaurant' ? 'CELEBRATE WITH US' : 'BOOK BEFORE ' + TH.H;
    const NUM = TX('num', numDef, { label: 'Days to go', group: 'Countdown', max: 5, hint: 'Set when you post it' });
    const LAB = TX('lab', labDef, { label: 'Under the number', group: 'Countdown', upper: true, max: 30 });
    const LINE = TX('line', lineDef, { label: 'Headline', group: 'Countdown', upper: true, max: 30 });
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const T0 = 1.9, OUT = T0 + S.total + 0.4, DUR = 12.5, PR = [170, 868, 740, 416], NUMV = parseInt(NUM, 10);
    S.forEach(s => (s.start += T0)); S.total += T0;
    function flipNum(t) {   // a split-flap number: ticks down from NUM + 6 and lands at 1.4 s
      if (VID.collecting) return; const land = 1.4, n = isFinite(NUMV) ? NUMV : null;
      const step = n === null ? 0 : Math.max(0, Math.min(6, Math.ceil((land - t) / 0.2))), shown = n === null ? NUM : String(n + step), pop = clamp((t - land) / 0.35);
      const s = (t < land ? 1 : 1 + 0.08 * Math.sin(Math.PI * pop)) * E.outBack(clamp(t / 0.4)), f = F(400, Math.min(300, fitSize(shown, 400, 820, 300, 'Bebas', 4)), 'Bebas'), tw = textW(shown, f, 4);
      const cw = Math.max(320, tw + 120), ch = 300, cy = 520, c = G(), [nx, ny] = posOf(elP('number'), [W / 2, cy]); c.translate(nx, ny); c.scale(s, s);
      c.fillStyle = HOL.mix(BLK, WHT, 0.1); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 30; c.shadowOffsetY = 12; rrect(-cw / 2, -ch / 2, cw, ch, 26); c.fill(); c.shadowColor = 'transparent';
      setF(f, 4); c.fillStyle = OR; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(shown, 2, 14);
      const ph = (t * 5) % 1; c.fillStyle = HOL.hexA(BLK, 0.55); c.fillRect(-cw / 2, -2, cw, 4); if (t < land) { c.globalAlpha = 0.25 * (1 - ph); c.fillStyle = BLK; c.fillRect(-cw / 2, -ch / 2, cw, ch / 2 * (1 - ph)); }
      D();
      if (t > land && t < land + 0.9) HOL.particles('sparkles', t * 3, { amt: 0.5, alpha: 1 - clamp((t - land) / 0.9), cols: [OR, ACC2] });
    }
    function elements() {
      const f = F(400, Math.min(300, fitSize(NUM, 400, 820, 300, 'Bebas', 4)), 'Bebas'), tw = textW(NUM, f, 4), cw = Math.max(320, tw + 120);
      return [
        { id: 'occasion', kind: 'pos', label: up(TH.name), x: W / 2, y: 300, t0: 0.1, d: OUT - 0.1, box: [W / 2 - 450, 278, 900, 44], dup: false, del: false },
        { id: 'number', kind: 'box', label: NUM + ' days to go', x: W / 2, y: 520, w: cw, h: 300, t0: 0, d: OUT, box: [W / 2 - cw / 2, 370, cw, 300], dup: false, del: false },
        { id: 'lab', kind: 'pos', label: LAB, x: W / 2, y: 730, t0: 1.5, d: OUT - 1.5, box: [W / 2 - 480, 708, 960, 44], dup: false, del: false },
        { id: 'line', kind: 'pos', label: LINE, x: W / 2, y: 820, t0: 1.75, d: OUT - 1.75, box: [W / 2 - 470, 798, 940, 44], dup: false, del: false },
        { id: 'frame', kind: 'box', label: 'Footage frame', x: PR[0], y: PR[1], w: PR[2], h: PR[3], t0: T0 - 0.2, d: OUT - (T0 - 0.2), box: [PR[0], PR[1], PR[2], PR[3]], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: 'Call to action', x: W / 2, y: 1342, t0: T0 + 0.8, d: OUT - (T0 + 0.8), box: [W / 2 - 300, 1320, 600, 44], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [[1.4, 8]], elements,
      render(t) {
        BACKDROP(() => HOL.backdrop(t, { cols: TH.cols })); if (!VID.collecting) hero(t, 'count', { only: ['bokeh', 'fireworks', 'moon', 'florals'] });
        const q = clamp((t - (OUT - 0.35)) / 0.35);
        if (t < OUT) {
          const [ocx, ocy] = posOf(elP('occasion'), [W / 2, 300]);
          caps(up(TH.name), ocx, ocy, 28, clamp((t - 0.1) / 0.4), q, { w: 700, ls: 8, col: ACC2, maxW: 900 });
          ctx.save(); ctx.globalAlpha = 1 - q; flipNum(t); ctx.restore();
          const [lbx, lby] = posOf(elP('lab'), [W / 2, 730]);
          caps(LAB, lbx, lby, 44, clamp((t - 1.5) / 0.4), q, { w: 800, ls: 5, maxW: 960 });
          const [lnx, lny] = posOf(elP('line'), [W / 2, 820]);
          T([[LINE, ACC2]], lnx, lny, F(800, fitT(LINE, 800, 54, 940, 'Mont', 1), 'Mont'), { align: 'center', ls: 1, p: clamp((t - 1.75) / 0.4), q });
          if (t >= T0 - 0.2) {
            const a = clamp((t - (T0 - 0.2)) / 0.35) * (1 - q), [fx, fy] = posOf(elP('frame'), [PR[0], PR[1]]), [x, y, w, h] = [fx, fy, PR[2], PR[3]];
            if (!VID.collecting) { const c = G(); c.globalAlpha = a; c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 36; c.shadowOffsetY = 14; c.fillStyle = PAPER; c.fillRect(x - 12, y - 12, w + 24, h + 24); D(); }
            ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); K5.seq(S, t, [x, y, w, h], ['cut', 'push', 'push'], 0.5); ctx.restore();
          }
          K5.ctaRow(t, posOf(elP('cta'), [W / 2, 1342])[1], T0 + 0.8, 1 - q);
        }
        if (!VID.collecting) seasonal(t, {});
        if (t >= OUT) K3.outro('kinetic', t - OUT, TAG);
      },
      cues() {
        const ev = [['ticks', 0.15, 0.3, 0, { dur: 1.25, n: 7 }], ['impact', 1.4, 0.5, 0], ['shimmer', 1.45, 0.3, 0], ['whoosh', 1.75, 0.2, 0], ['paper', T0 - 0.1, 0.3, 0]];
        S.forEach((s, i) => { if (i) ev.push(['whoosh', s.start, 0.22, 0.2]); }); K5.outroCues(ev, OUT);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  const MAKE = { greet, special, hours, count };
  const P = (MAKE[V] || greet)();
  DIR = { dur: P.dur, bg: BLK, bgSwap: true, finish: { vig: 0.2, grain: 0.14 }, edl: [], shakes: P.shakes, preload: () => K3.init(), render: P.render, cues: P.cues, ...(P.elements ? { elements: P.elements } : {}), hol: HID };
});
