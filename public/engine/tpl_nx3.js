'use strict';
/* NexGen templates V13 (Nov 5): new families built from the Remotion motion library.
   ?v=bax      Before & After, 9 ways  one pair of shots revealed as a wipe, slider, vertical wipe, stack, split, flip,
                                       circle, cleaning passes or a camera flash (one field switches the style)
   ?v=chalkx   Chalkboard Menu         slate, black, sidewalk A-frame, wood or your own board photo; seven chalk fonts;
                                       each line writes itself on with chalk dust; a price gets circled
   ?v=herox    Spotlight               your photo with motion around it: callouts point at what's in it and a price burst,
                                       or a camera tour that zooms to each point in turn
   ?v=specialx Special of the Day      a tear-off calendar flips to the day, the dish slides in, the old price is struck and
                                       the new one slams in, with a ticking "until" line
   ?v=combox   Meal Combo              items fly in with + signs, the separate prices are struck, the combo price slams in
   ?v=thermox  The Thermostat          a thermostat dial cools (frost creeps in) or heats to the target temperature
   Defaults follow the brand's industry. Prices, offers and numbers are sample text to replace. */
(() => {
  const P = (accent, ink, text, accent2, paper, deep1, deep2) => ({ accent, ink, text, accent2, paper, deep1, deep2 });
  Object.assign(K7.FAM, {
    bax: { pal: P('#7AE7C7', '#0B0F14', '#F4F6F8', '#5CE1E6', '#F4F6F8', '#131A22', '#05070A'), fonts: { sans: 'mont', serif: 'fraunces', display: 'anton', script: 'caveat' }, music: 'pulse', bpm: 112 },
    chalkx: { pal: P('#FFE58A', '#141615', '#F5F4EC', '#E9C46A', '#F5F4EC', '#1F2421', '#0A0B0A'), fonts: { sans: 'mont', serif: 'playfair', display: 'bebas', script: 'caveat' }, music: 'sketch', bpm: 96 },
    herox: { pal: P('#FFC400', '#0B0A09', '#FFFFFF', '#FF3B1F', '#F6EEE2', '#1C140B', '#030202'), fonts: { sans: 'archivo', serif: 'dmserif', display: 'anton', script: 'marker' }, music: 'night', bpm: 108 },
    specialx: { pal: P('#FFB627', '#0E1110', '#FFF8EC', '#E63946', '#FFF8EC', '#1B201D', '#060807'), fonts: { sans: 'mont', serif: 'fraunces', display: 'anton', script: 'kalam' }, music: 'day', bpm: 86 },
    combox: { pal: P('#FFD60A', '#111111', '#FFFFFF', '#FF3B30', '#FFF7E6', '#1E1A12', '#050505'), fonts: { sans: 'archivo', serif: 'dmserif', display: 'archivoblack', script: 'marker' }, music: 'pulse', bpm: 124 },
    thermox: { pal: P('#5CE1E6', '#071018', '#F2F7FA', '#FF6B35', '#F2F7FA', '#0E1E2B', '#03080C'), fonts: { sans: 'inter', serif: 'lora', display: 'oswald', script: 'kalam' }, music: 'cinematic', bpm: 90 },
  });
})();

STUDIO_REG['nx3'] = (() => {
  const V = QS.get('v') || 'bax';
  // Per-element model: positions below fall back to the original hardcoded values when EL is null,
  // so rendering is byte-for-byte the old path. (Same pattern as tpl_trade.js.)
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const elNum = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const FM = K7.FAM[V] || K7.FAM.bax;
  if (!window.STUDIO) setBrandColors(FM.pal);
  const G = K3.G, D = K3.D, seg = K7.seg, TAU = Math.PI * 2;
  const IND = BRAND.cat || BRAND.industry || 'general';   // BRAND.cat: the brand's own category (pizza, hvac…), set by js/nx-reg3.js
  const NONE = k => ['nofoot.' + k, 0];
  const opts = list => list.map(([value, label]) => ({ value, label }));
  const shot = (k, label, d, ph, group) => { const s = SHOT(k, NONE(k), { label, group: group || 'Footage', kind: 'any', ph, d: d + 0.3 }); return { c: s[0], in: s[1], d, start: 0 }; };
  const fa = (t, t0, d) => E.outC(seg(t, t0, d || 0.5));
  const musicBed = dur => ['music', 0, dur, 0.95, { style: FM.music, bpm: FM.bpm, key: 0, end: dur - 0.6 }];
  const lum = h => { const v = [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16) / 255); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const onCol = h => (/^#[0-9a-f]{6}$/i.test(h) && lum(h) > 0.45 ? '#0B0B0B' : '#FFFFFF');
  const hexOr = (s, d) => (/^#[0-9a-f]{6}$/i.test(s || '') ? s : d);
  const num = (s, d) => { const n = parseFloat(String(s).replace(/[^\d.-]/g, '')); return isFinite(n) ? n : d; };
  const xy = (s, d) => { const m = String(s || '').match(/(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)/); return m ? [clamp(+m[1], 0, 100), clamp(+m[2], 0, 100)] : d; };
  // *word* in a line is drawn in the accent colour
  const rich = (s, col, hl) => String(s || '').split(/(\*[^*]+\*)/).filter(Boolean).map(p => (p[0] === '*' ? [p.slice(1, -1), hl || OR] : [p, col || WHT]));
  const plain = s => String(s || '').replace(/\*/g, '');
  // a field can't be emptied in the studio (an empty field goes back to its default), so a lone dash means "leave it off"
  const off = s => (/^[-–—]$/.test(String(s || '').trim()) ? '' : s);
  const DASH = 'Type a dash (-) to leave it off.';
  const ph = (s, t, r, o) => { const w = K3.wholeIn(s.c, r); K3.clip(s.c, s.in, Math.max(0, t - (s.start || 0)), w, o); return w; };
  const union = (a, b) => { const x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]); return [x, y, Math.max(a[0] + a[2], b[0] + b[2]) - x, Math.max(a[1] + a[3], b[1] + b[3]) - y]; };
  function within(path, fn) { ctx.save(); if (!VID.collecting && path) { ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); ctx.beginPath(); path(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clip(); } fn(); ctx.restore(); }
  function card(r, rad, a, col) { if (VID.collecting || a <= 0) return; const c = G(); c.globalAlpha = a; c.fillStyle = col || DEEP1; c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 60; c.shadowOffsetY = 24; c.beginPath(); c.roundRect(r[0], r[1], r[2], r[3], rad); c.fill(); D(); }
  const bg = (a, b) => { if (VID.collecting) return; const c = G(), g = c.createRadialGradient(W / 2, H * 0.42, 60, W / 2, H * 0.45, H * 0.85); g.addColorStop(0, a || DEEP1); g.addColorStop(1, b || DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); };
  function chip(str, x, y, o) {   // rounded label; o: {p, bg, col, size, align, border}
    o = o || {}; const p = o.p === undefined ? 1 : o.p; if (p <= 0 || VID.collecting || !str) return 0;
    const size = o.size || 30, f = F(o.w || 800, size, o.fam || 'Mont'), tw = textW(str, f, o.ls || 0), pw = tw + size * 1.2, phh = size * 1.9;
    const x0 = o.align === 'right' ? x - pw : o.align === 'left' ? x : x - pw / 2, s = lerp(0.6, 1, E.outBack(clamp(p)));
    const c = G(); c.globalAlpha = clamp(p * 3) * (o.a === undefined ? 1 : o.a); c.translate(x0 + (o.align === 'right' ? pw : o.align === 'left' ? 0 : pw / 2), y); c.scale(s, s); c.translate(-(o.align === 'right' ? pw : o.align === 'left' ? 0 : pw / 2), 0);
    c.fillStyle = o.bg || 'rgba(8,10,14,0.82)'; c.beginPath(); c.roundRect(0, -phh / 2, pw, phh, phh / 2); c.fill();
    if (o.border) { c.strokeStyle = o.border; c.lineWidth = 2.5; c.stroke(); }
    setF(f, o.ls || 0); c.fillStyle = o.col || WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(str, pw / 2, size * 0.05); D(); return pw;
  }
  // the close: logo, an ending line, the call to action, contact and licence line
  function close(t, OUT, o) {
    o = o || {}; const ot = t - OUT, y = o.y || 620, [lw, lh] = logoBox(o.lw || 600), lp = seg(ot, 0.2, 0.5);
    if (lp > 0 && !VID.collecting) { const c = G(), s = lerp(1.12, 1, E.outBack(clamp(lp))); c.globalAlpha = clamp(lp * 2.5); c.translate(W / 2, y); c.scale(s, s); c.drawImage(IMG.logoW, -lw / 2, -lh / 2, lw, lh); D(); }
    if (o.line) { const f = F(800, Math.min(70, fitSize(plain(o.line), 800, 900, 70, 'Mont', -1)), 'Mont'); T(rich(o.line, WHT, o.hl), W / 2, y + lh / 2 + 150, f, { align: 'center', p: seg(ot, 0.7, 0.5), ls: -1 }); }
    const cy = y + lh / 2 + (o.gap || 320), cp = seg(ot, 1.3, 0.4);
    if (cp > 0 && !VID.collecting) { const f = F(800, Math.min(34, fitSize(CONTACT.cta, 800, 740, 34, 'Mont', 5)), 'Mont'), tw = textW(CONTACT.cta, f, 5), bw = Math.min(960, tw + 100), c = G(); c.globalAlpha = E.outC(cp);
      c.fillStyle = OR; c.beginPath(); c.roundRect(W / 2 - bw / 2, cy - 46, bw, 92, 46); c.fill(); setF(f, 5); c.fillStyle = onCol(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CONTACT.cta, W / 2, cy + 2); D(); }
    K7.txt(K7.contact().join('   ·   '), W / 2, cy + 125, F(700, 28, 'Mont'), WA(0.8), { align: 'center', a: fa(ot, 1.8, 0.4), ls: 3 });
    if (CONTACT.lic) K7.txt(CONTACT.lic, W / 2, cy + 180, F(600, 22, 'Mont'), WA(0.6), { align: 'center', a: fa(ot, 1.9, 0.4), ls: 3 });
  }
  const closeCues = (ev, OUT) => { ev.push(['swell', OUT - 0.45, 0.25, 0], ['whoosh', OUT, 0.3, 0], ['pop', OUT + 0.45, 0.3, 0], ['chime', OUT + 1.3, 0.28, 0], ['tink', OUT + 1.9, 0.18, 0.3]); };
  const head = (str, t, t0, y, o) => { if (!str) return; o = o || {}; const f = F(o.w || 900, Math.min(o.max || 96, fitSize(plain(str), o.w || 900, o.maxW || 940, o.max || 96, o.fam || 'Mont', -2)), o.fam || 'Mont'); T(rich(str, o.col, o.hl), o.x || W / 2, y, f, { align: o.align || 'center', ls: -2, p: seg(t, t0, 0.45), q: o.q || 0, shadow: o.shadow }); };

  // ---------------------------------------------------------------- industry defaults
  const FOOD = ['restaurant', 'pizza', 'burgers', 'tacos', 'mexican', 'italian', 'sandwiches'];
  const BA = { carpet: ['SAME CARPET.', 'LIKE NEW.'], cleaning: ['SAME KITCHEN.', 'SPOTLESS.'], commercial: ['SAME OFFICE.', 'SPOTLESS.'], hvac: ['OLD UNIT.', 'NEW SYSTEM.'], detailing: ['SAME CAR.', 'NEW SHINE.'],
    fencing: ['SAME YARD.', 'NEW FENCE.'], hardscape: ['SAME YARD.', 'NEW LIFE.'], landscaping: ['SAME YARD.', 'NEW LIFE.'], barbershop: ['SAME YOU.', 'FRESH CUT.'], salon: ['SAME YOU.', 'NEW LOOK.'],
    realestate: ['EMPTY.', 'STAGED.'], pressure: ['SAME DRIVEWAY.', 'LIKE NEW.'], roofing: ['OLD ROOF.', 'NEW ROOF.'], general: ['BEFORE.', 'AFTER.'] };
  const baCap = FOOD.includes(IND) ? ['ORDERED.', 'SERVED HOT.'] : BA[IND] || BA.general;

  // ================================================================ BEFORE & AFTER, 9 WAYS
  function bax() {
    const STY = TX('style', 'wipe', { label: 'Reveal style', group: 'Style', options: opts([['wipe', 'Wipe, left to right'], ['slider', 'Slider, back and forth'], ['vertical', 'Wipe, top to bottom'], ['stack', 'Stacked: before over after'], ['split', 'Side by side'], ['flip', 'Card flip'], ['circle', 'Circle reveal'], ['wand', 'Cleaning passes'], ['flash', 'Camera flash']]) });
    const TITLE = TX('title', '', { label: 'Headline above (optional)', group: 'Words', max: 30, hint: 'Wrap a word in *stars* to colour it.' });
    const BL = TX('bl', IND === 'realestate' ? 'EMPTY' : 'BEFORE', { label: 'Before label', group: 'Words', upper: true, max: 12 }), AL = TX('al', IND === 'realestate' ? 'STAGED' : 'AFTER', { label: 'After label', group: 'Words', upper: true, max: 12 });
    const C1 = off(TX('c1', baCap[0], { label: 'Caption line 1', group: 'Words', upper: true, max: 18, hint: DASH })), C2 = off(TX('c2', baCap[1], { label: 'Caption line 2 (accent)', group: 'Words', upper: true, max: 18, hint: DASH }));
    const END = TX('end', 'See the *difference.*', { label: 'Closing line', group: 'Ending', max: 28 });
    const T1 = 0.9, CAP = 3.6, OUT = 6.4, DUR = OUT + 4.2;
    const SB = shot('sb', 'Before', OUT + 0.2), SA = shot('sa', 'After', OUT + 0.2);
    const top = TITLE ? 440 : 380, FR0 = [90, top, 900, 1000];
    const FR = (EL && EL.box) ? [elNum(EL.box.x, FR0[0]), elNum(EL.box.y, FR0[1]), elNum(EL.box.w, FR0[2]), elNum(EL.box.h, FR0[3])] : FR0;
    const capSz = Math.min(96, fitSize(C1.length > C2.length ? C1 : C2, 900, FR[2] - 90, 96, 'Mont', -2));
    const shakes = STY === 'flash' ? [[T1 + 0.6, 12]] : STY === 'stack' ? [[T1 + 0.6, 6]] : [[CAP, 6]];
    const handle = (x, y, vert, r) => { if (VID.collecting) return; const c = G(); c.fillStyle = OR; c.shadowColor = OR; c.shadowBlur = 24; if (vert) c.fillRect(r[0], y - 4, r[2], 8); else c.fillRect(x - 4, r[1], 8, r[3]); c.shadowBlur = 0;
      const hx = vert ? r[0] + r[2] / 2 : x, hy = vert ? y : r[1] + r[3] / 2; c.beginPath(); c.arc(hx, hy, 42, 0, TAU); c.fill(); c.strokeStyle = onCol(OR); c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round';
      c.translate(hx, hy); if (vert) c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(-8, -12); c.lineTo(-20, 0); c.lineTo(-8, 12); c.moveTo(8, -12); c.lineTo(20, 0); c.lineTo(8, 12); c.stroke(); D(); };
    const tagB = (r, a, right) => { const [tx, ty] = posOf(elP('before'), [right ? r[0] + r[2] - 26 : r[0] + 26, r[1] + 52]); return chip(BL, tx, ty, { p: a, size: 28, align: right ? 'right' : 'left', fam: 'Mono', w: 700, ls: 4 }); };
    const tagA = (r, a) => { const [tx, ty] = posOf(elP('after'), [r[0] + 26, r[1] + 52]); return chip(AL, tx, ty, { p: a, size: 28, align: 'left', fam: 'Mono', w: 700, ls: 4, bg: OR, col: onCol(OR) }); };
    function caption(t, r) {
      const p = seg(t, CAP, 0.5); if (p <= 0 || (!C1 && !C2)) return;
      if (!VID.collecting) { const c = G(), g = c.createLinearGradient(0, r[1] + r[3] * 0.55, 0, r[1] + r[3]); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + 0.72 * E.outC(p) + ')'); c.fillStyle = g; c.beginPath(); c.roundRect(r[0], r[1], r[2], r[3], 40); c.fill(); D(); }
      const sz = Math.min(96, fitSize(C1.length > C2.length ? C1 : C2, 900, r[2] - 90, 96, 'Mont', -2));
      const [c1x, c1y] = posOf(elP('caption1'), [r[0] + 44, r[1] + r[3] - 44 - sz * 0.95]);
      T([[C1, WHT]], c1x, c1y, F(900, sz, 'Mont'), { p, ls: -2 });
      const [c2x, c2y] = posOf(elP('caption2'), [r[0] + 44, r[1] + r[3] - 44]);
      T([[C2, OR]], c2x, c2y, F(900, sz, 'Mont'), { p: seg(t, CAP + 0.12, 0.5), ls: -2 });
    }
    function elements() {
      const tiP = posOf(elP('title'), [W / 2, top - 110]);
      const bP = posOf(elP('before'), [FR[0] + 26, FR[1] + 52]);
      const aP = posOf(elP('after'), [FR[0] + 26, FR[1] + 52]);
      const c1P = posOf(elP('caption1'), [FR[0] + 44, FR[1] + FR[3] - 44 - capSz * 0.95]);
      const c2P = posOf(elP('caption2'), [FR[0] + 44, FR[1] + FR[3] - 44]);
      const els = [
        { id: 'frame', kind: 'box', label: 'Before / After frame', x: FR[0], y: FR[1], w: FR[2], h: FR[3], t0: 0.1, d: OUT - 0.1, box: [FR[0], FR[1], FR[2], FR[3]], dup: false, del: false },
        { id: 'before', kind: 'pos', label: BL, x: bP[0], y: bP[1], t0: T1, d: OUT - T1, box: [bP[0] - 10, bP[1] - 30, 220, 60], dup: false, del: false },
        { id: 'after', kind: 'pos', label: AL, x: aP[0], y: aP[1], t0: T1, d: OUT - T1, box: [aP[0] - 10, aP[1] - 30, 220, 60], dup: false, del: false },
      ];
      if (TITLE) els.push({ id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.1, d: OUT - 0.1, box: [tiP[0] - 470, tiP[1] - 60, 940, 120], dup: false, del: false });
      if (C1) els.push({ id: 'caption1', kind: 'pos', label: C1, x: c1P[0], y: c1P[1], t0: CAP, d: OUT - CAP, box: [c1P[0] - 10, c1P[1] - capSz, 860, capSz + 20], dup: false, del: false });
      if (C2) els.push({ id: 'caption2', kind: 'pos', label: C2, x: c2P[0], y: c2P[1], t0: CAP + 0.12, d: OUT - (CAP + 0.12), box: [c2P[0] - 10, c2P[1] - capSz, 860, capSz + 20], dup: false, del: false });
      return els;
    }
    return {
      dur: DUR, shakes, elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = fa(t, 0.1, 0.5) * (1 - q);
          if (TITLE) { const [tix, tiy] = posOf(elP('title'), [W / 2, top - 110]); head(TITLE, t, 0.1, tiy, { q, x: tix }); }
          const rB = K3.wholeIn(SB.c, FR), rA = K3.wholeIn(SA.c, FR), r = union(rB, rA);
          const rr = () => ctx.roundRect(r[0], r[1], r[2], r[3], 40);
          if (STY === 'stack' || STY === 'split') {
            const isS = STY === 'stack', b1 = isS ? [90, top - 20, 900, 500] : [90, top, 440, 1000], b2 = isS ? [90, top + 540, 900, 500] : [550, top, 440, 1000];
            const k1 = E.outC(seg(t, 0.15, 0.6)), k2 = E.outBack(seg(t, T1, 0.7)), r1 = K3.wholeIn(SB.c, b1), r2 = K3.wholeIn(SA.c, b2);
            const o1 = isS ? [0, (1 - k1) * -300] : [(1 - k1) * -700, 0], o2 = isS ? [0, (1 - k2) * 1000] : [(1 - k2) * 700, 0];
            card([r1[0] + o1[0], r1[1] + o1[1], r1[2], r1[3]], 34, a); card([r2[0] + o2[0], r2[1] + o2[1], r2[2], r2[3]], 34, (t >= T1 ? 1 : 0) * (1 - q));
            within(() => ctx.roundRect(r1[0] + o1[0], r1[1] + o1[1], r1[2], r1[3], 34), () => ph(SB, t, b1, { dx: o1[0], dy: o1[1], alpha: a }));
            if (t >= T1) within(() => ctx.roundRect(r2[0] + o2[0], r2[1] + o2[1], r2[2], r2[3], 34), () => ph(SA, t, b2, { dx: o2[0], dy: o2[1], alpha: 1 - q }));
            tagB([r1[0] + o1[0], r1[1] + o1[1]], a); if (t >= T1) tagA([r2[0] + o2[0], r2[1] + o2[1]], seg(t, T1 + 0.4, 0.4) * (1 - q));
            const mk = E.outBack(seg(t, T1 + 0.4, 0.5)) * (1 - q);
            if (mk > 0 && !VID.collecting) { const c = G(), cx = isS ? W / 2 : 540, cy = isS ? top + 500 : top + 500; c.translate(cx, cy); c.scale(mk, mk); c.fillStyle = OR; c.beginPath(); c.arc(0, 0, 54, 0, TAU); c.fill();
              if (isS) { c.strokeStyle = onCol(OR); c.lineWidth = 7; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(0, -22); c.lineTo(0, 22); c.moveTo(-16, 8); c.lineTo(0, 24); c.lineTo(16, 8); c.stroke(); }
              else { setF(F(900, 40, 'Mont'), 0); c.fillStyle = onCol(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('VS', 0, 2); } D(); }
            const capR = isS ? [r2[0], r2[1], r2[2], r2[3]] : [90, top, 900, 1000]; if (t >= T1) caption(t, capR);
          } else {
            if (STY !== 'flip') card(r, 40, a);
            if (STY === 'flip') {
              const ang = E.inOutC(seg(t, T1, 1.0)) * Math.PI, w = Math.abs(Math.cos(ang)), cx = r[0] + r[2] / 2, show = ang < Math.PI / 2 ? SB : SA;
              card([cx - (r[2] * w) / 2, r[1], r[2] * w, r[3]], 40 * w, a * (w > 0.02 ? 1 : 0));
              within(() => ctx.roundRect(cx - (r[2] * w) / 2, r[1], r[2] * w, r[3], 40 * w), () => ph(show, t, FR, { alpha: a }));
              if (!VID.collecting && w < 1) { const c = G(); c.globalAlpha = (1 - w) * 0.6; c.fillStyle = '#000'; c.fillRect(cx - (r[2] * w) / 2, r[1], r[2] * w, r[3]); D(); }
              const rw = [cx - (r[2] * w) / 2, r[1], r[2] * w, r[3]];
              if (ang < Math.PI / 2) tagB(rw, a * clamp(w * 3 - 2)); else { tagA(rw, clamp(w * 3 - 2) * (1 - q)); const gl = seg(t, T1 + 1.0, 0.6); if (gl > 0 && gl < 1 && !VID.collecting) within(rr, () => { const c = G(), x = r[0] - 300 + (r[2] + 600) * gl, g = c.createLinearGradient(x - 120, 0, x + 120, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.4)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(r[0], r[1], r[2], r[3]); D(); }); }
            } else if (STY === 'flash') {
              const FL = T1 + 0.6, aft = t >= FL, z = aft ? lerp(1.12, 1, E.outC(seg(t, FL, 0.5))) : 1 + 0.05 * seg(t, 0, FL);
              within(rr, () => ph(aft ? SA : SB, t, FR, { alpha: a, s: z }));
              if (aft) tagA(r, 1 - q); else { tagB(r, a); if (!VID.collecting && Math.floor(t * 3) % 2 === 0) { const c = G(); c.fillStyle = '#FF3B3B'; c.beginPath(); c.arc(r[0] + r[2] - 120, r[1] + 52, 10, 0, TAU); c.fill(); setF(F(700, 24, 'Mono'), 2); c.fillStyle = '#fff'; c.textBaseline = 'middle'; c.fillText('REC', r[0] + r[2] - 100, r[1] + 53); D(); } }
              const fl = seg(t, FL - 0.03, 0.05) * (1 - seg(t, FL + 0.03, 0.35)); if (fl > 0) fillScreen('#FFFFFF', fl);
            } else if (STY === 'circle') {
              within(rr, () => ph(SB, t, FR, { alpha: a }));
              const k = E.outC(seg(t, T1, 1.4)), rad = k * Math.hypot(r[2], r[3]) / 2, cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2;
              if (rad > 1) within(() => { ctx.roundRect(r[0], r[1], r[2], r[3], 40); }, () => within(() => ctx.arc(cx, cy, rad, 0, TAU), () => ph(SA, t, FR, { alpha: 1 - q })));
              if (k > 0 && k < 0.99 && !VID.collecting) within(rr, () => { const c = G(); c.strokeStyle = OR; c.lineWidth = 8; c.shadowColor = OR; c.shadowBlur = 30; c.beginPath(); c.arc(cx, cy, rad, 0, TAU); c.stroke(); D(); });
              tagB([r[0], r[1], r[2]], a * (1 - seg(t, T1 + 0.3, 0.3)), true); tagA(r, seg(t, T1 + 0.7, 0.3) * (1 - q));
            } else if (STY === 'wand') {
              within(rr, () => ph(SB, t, FR, { alpha: a }));
              const N = 5, sh = r[3] / N, pk = k => E.inOutS(seg(t, T1 + k * 0.32, 0.42));
              for (let k = 0; k < N; k++) { const q2 = pk(k); if (q2 <= 0) continue; const ltr = k % 2 === 0, x0 = ltr ? r[0] : r[0] + r[2] * (1 - q2);
                within(() => { ctx.roundRect(r[0], r[1], r[2], r[3], 40); }, () => within(() => ctx.rect(x0, r[1] + k * sh, r[2] * q2, sh + 1), () => ph(SA, t, FR, { alpha: 1 - q }))); }
              const act = [0, 1, 2, 3, 4].find(k => pk(k) > 0 && pk(k) < 1);
              if (act !== undefined && !VID.collecting) { const q2 = pk(act), x = act % 2 === 0 ? r[0] + r[2] * q2 : r[0] + r[2] * (1 - q2), y0 = r[1] + act * sh; within(rr, () => { const c = G(), g = c.createLinearGradient(x - 26, 0, x + 26, 0); g.addColorStop(0, '#9AA1AB'); g.addColorStop(0.5, '#F4F6F8'); g.addColorStop(1, '#9AA1AB');
                c.fillStyle = g; c.beginPath(); c.roundRect(x - 26, y0 - 8, 52, sh + 16, 14); c.fill(); c.fillStyle = OR; c.fillRect(x - 6, y0 - 8, 12, sh + 16); c.globalAlpha = 0.5; c.fillStyle = '#FFFFFF'; for (let i = 0; i < 10; i++) { const px = x + (act % 2 === 0 ? -1 : 1) * (20 + hash(i + t * 30) * 60), py = y0 + hash(i * 3 + t * 20) * sh; c.beginPath(); c.arc(px, py, 4 + hash(i) * 6, 0, TAU); c.fill(); } D(); }); }
              tagB([r[0], r[1], r[2]], a * (1 - seg(t, T1 + 0.2, 0.3)), true); tagA(r, seg(t, T1 + 1.6, 0.3) * (1 - q));
            } else {   // wipe, slider, vertical
              let pos;
              if (STY === 'slider') { const u = t - T1; pos = u < 0 ? 0.5 : u < 0.8 ? lerp(0.5, 0.12, E.inOutC(u / 0.8)) : u < 1.8 ? lerp(0.12, 0.88, E.inOutC((u - 0.8) / 1.0)) : lerp(0.88, 0.5, E.inOutC(clamp((u - 1.8) / 0.6))); }
              else pos = E.inOutC(seg(t, T1, 1.6));
              const vert = STY === 'vertical';
              within(rr, () => ph(SB, t, FR, { alpha: a }));
              if (pos > 0) within(() => { ctx.roundRect(r[0], r[1], r[2], r[3], 40); }, () => within(() => (vert ? ctx.rect(r[0], r[1], r[2], r[3] * pos) : ctx.rect(r[0], r[1], r[2] * pos, r[3])), () => ph(SA, t, FR, { alpha: 1 - q })));
              if ((STY === 'slider' || (pos > 0.002 && pos < 0.998)) && t < CAP + 0.2) within(rr, () => handle(r[0] + r[2] * pos, r[1] + r[3] * pos, vert, r));
              if (STY === 'slider') { tagA(r, a * (1 - seg(t, CAP, 0.3))); tagB([r[0], r[1], r[2]], a * (1 - seg(t, CAP, 0.3)), true); }
              else { tagA(r, seg(pos, 0.2, 0.15) * (1 - q)); if (vert) chip(BL, r[0] + 26, r[1] + r[3] - 60, { p: a * (1 - seg(pos, 0.6, 0.15)), size: 28, align: 'left', fam: 'Mono', w: 700, ls: 4 }); else tagB([r[0], r[1], r[2]], a * (1 - seg(pos, 0.7, 0.15)), true); }
            }
            caption(t, r);
          }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() {
        // the same beats for every style, so one soundtrack serves all nine: the reveal starts at T1, the caption lands at CAP
        const ev = [['whoosh', 0.1, 0.25, 0], ['swish', T1, 0.3, -0.2], ['air', T1 + 0.55, 0.22, 0.2], ['sparkle', T1 + 1.5, 0.16, 0], ['impact', CAP, 0.32, 0], ['pop', CAP + 0.12, 0.25, 0.2]];
        closeCues(ev, OUT);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ CHALKBOARD MENU
  const CHALK_FONTS = [['caveat', 'Chalk handwriting'], ['kalam', 'Casual handwriting'], ['marker', 'Marker'], ['bebas', 'Block caps'], ['oswald', 'Tall condensed'], ['playfair', 'Serif'], ['dancing', 'Script'], ['pacifico', 'Retro script'], ['mont', 'Clean sans']];
  const MENUS = {
    pizza: ['Pizza Menu', 'Margherita | $15\nPepperoni | $17\nMeat lovers | $19\nGarlic knots | $6'], burgers: ['Burger Board', 'Single smash | $8\nDouble smash | $11\nChicken sandwich | $10\nLoaded fries | $6'],
    tacos: ['Tacos', 'Al pastor | $3\nAsada | $3.50\nBirria | $4\nQuesabirria | $11'], mexican: ['Platillos del Día', 'Enchiladas | $15\nChile relleno | $14\nPozole | $13\nFlan | $6'],
    italian: ['Stasera', 'Lasagna | $19\nCarbonara | $18\nMargherita | $16\nTiramisu | $8'], sandwiches: ['Lunch Board', 'Italian sub | $12\nTurkey club | $11\nVeggie wrap | $10\nSoup of the day | $6'],
    restaurant: ['Today’s Specials', 'Birria tacos (3) | $13\nQuesabirria | $11\nConsomé cup | $5\nHorchata | $4'],
    barbershop: ['The Menu', 'Haircut | $30\nSkin fade | $35\nBeard trim | $15\nCut + beard | $45'], general: ['Today’s Specials', 'Item one | $10\nItem two | $12\nItem three | $9\nItem four | $6'],
  };
  const SPECK = (() => { const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'), id = g.createImageData(96, 96), r = rng(11); for (let i = 0; i < id.data.length; i += 4) id.data[i + 3] = r() < 0.3 ? Math.floor(110 + r() * 145) : 0; g.putImageData(id, 0, 0); return c; })();
  const CHK = new Map();
  function chalkImg(str, f, col, tex) {
    const k = str + '|' + f + '|' + col + '|' + tex; if (CHK.has(k)) return CHK.get(k);
    const size = parseFloat(f.match(/(\d+(?:\.\d+)?)px/)[1]), tw = Math.ceil(textW(str, f, 0)), pad = Math.ceil(size * 0.5), c = document.createElement('canvas'); c.width = tw + pad * 2; c.height = Math.ceil(size * 1.8);
    const g = c.getContext('2d'); g.font = f; g.fillStyle = col; g.textBaseline = 'alphabetic'; g.fillText(str, pad, size * 1.25);
    if (tex) { g.globalCompositeOperation = 'destination-out'; g.fillStyle = g.createPattern(SPECK, 'repeat'); g.fillRect(0, 0, c.width, c.height); }
    const o = { c, w: tw, pad, base: size * 1.25 }; if (document.fonts.check(f)) CHK.set(k, o); return o;
  }
  function chalk(str, x, y, f, col, p, align, tex, dust) {
    if (!str || p <= 0 || VID.collecting) return 0; const im = chalkImg(str, f, col, tex), x0 = align === 'right' ? x - im.w : align === 'center' ? x - im.w / 2 : x, sw = im.pad + (im.w + im.pad) * clamp(p);
    const c = G(); c.drawImage(im.c, 0, 0, sw, im.c.height, x0 - im.pad, y - im.base, sw, im.c.height);
    if (dust && p < 1) { const ex = x0 + im.w * p; c.fillStyle = col; for (let i = 0; i < 8; i++) { const a = (window.FRAME_T * 30 + i * 3) % 12; c.globalAlpha = 0.7 * (1 - a / 12); c.beginPath(); c.arc(ex + (hash(i) - 0.5) * 18, y - im.base * 0.5 + hash(i * 7) * im.base * 0.6 + a * 4, 2.5, 0, TAU); c.fill(); } }
    D(); return im.w;
  }
  function chalkx() {
    const BOARD = TX('board', 'slate', { label: 'Board', group: 'Style', options: opts([['slate', 'Green slate, wood frame'], ['black', 'Black board, metal frame'], ['aframe', 'Sidewalk A-frame'], ['wood', 'Wood planks'], ['photo', 'Your own board photo']]) });
    const FONT = TX('font', 'caveat', { label: 'Chalk lettering', group: 'Style', options: opts(CHALK_FONTS) });
    const TEXd = TX('tex', 'yes', { label: 'Chalky texture', group: 'Style', options: opts([['yes', 'On'], ['no', 'Off']]) }), TEXO = TEXd === 'yes';
    const M = MENUS[IND] || (FOOD.includes(IND) ? MENUS.restaurant : MENUS.general);
    const HEAD = TX('head', M[0], { label: 'Board title', group: 'Menu', max: 22 });
    const ITEMS = TX('items', M[1], { label: 'Items (one per line: name | price)', group: 'Menu', multiline: true, max: 160, hint: 'Up to 6 lines. Leave the price off a line if you like.' });
    const CIRC = TX('circle', '1', { label: 'Circle a price', group: 'Menu', options: opts([['0', 'None'], ['1', 'Line 1'], ['2', 'Line 2'], ['3', 'Line 3'], ['4', 'Line 4'], ['5', 'Line 5'], ['6', 'Line 6']]) });
    const NOTE = off(TX('note', 'Until we sell out!', { label: 'Note at the bottom', group: 'Menu', max: 30, hint: DASH }));
    const PCOL = TX('pcol', '', { label: 'Price colour (hex, optional)', group: 'Style', max: 7, hint: 'e.g. #FFE58A. Empty uses the accent.' });
    const AREA = TX('area', '12, 12', { label: 'Writing margin on your photo (x %, y %)', group: 'Style', max: 9, hint: 'Only for “Your own board photo”.' });
    const TITLE = TX('title', '', { label: 'Headline above (optional)', group: 'Menu', max: 28 });
    const END = TX('end', 'Come *hungry.*', { label: 'Closing line', group: 'Ending', max: 28 });
    const BP = shot('bp', 'Board photo (only for “Your own board photo”)', 8, 'v');
    const rows = ITEMS.split('\n').map(l => l.split('|').map(x => x.trim())).filter(r => r[0]).slice(0, 6);
    const n = Math.max(1, rows.length), fam = (window.NX && NX.fontFamily && NX.fontFamily(FONT)) || 'Hand', lib = (window.NX && NX.FONTLIB && NX.FONTLIB[FONT]) || { n: [700] }, wt = Math.max(...lib.n);
    const SCALE = { caveat: 1.15, kalam: 0.95, marker: 0.85, bebas: 1.15, oswald: 1.0, playfair: 0.92, dancing: 1.05, pacifico: 0.82, mont: 0.9 }[FONT] || 1;
    const isImg = BOARD === 'photo', af = BOARD === 'aframe';
    const BW0 = af ? 860 : 940, BX0 = (W - BW0) / 2, BY00 = TITLE ? 420 : 330, BH0 = isImg ? (TITLE ? 1060 : 1140) : af ? (TITLE ? 940 : 990) : TITLE ? 900 : 960;
    const BD = (EL && EL.box) ? [elNum(EL.box.x, BX0), elNum(EL.box.y, BY00), elNum(EL.box.w, BW0), elNum(EL.box.h, BH0)] : [BX0, BY00, BW0, BH0];
    const [BX, BY0, BW, BH] = BD, BY = BY0;
    const [mx, my] = xy(AREA, [12, 12]), pad = af ? 100 : 80, AR = isImg ? [BX + (BW * mx) / 100, BY + (BH * my) / 100, BW * (1 - (2 * mx) / 100), BH * (1 - (2 * my) / 100)] : [BX + pad, BY + pad, BW - pad * 2, BH - pad * 2];
    const textC = WHT === '#FFFFFF' ? '#F5F4EC' : WHT, priceC = hexOr(PCOL, OR), hs = Math.min(110, fitSize(HEAD, wt, AR[2] - 40, 110, fam)) * Math.min(1, SCALE);
    // rows share the space between the title and the note: up to 120 px apart, closer when there are more lines
    const ROW0 = hs * 1.25 + 75, rowH = Math.min(135, (AR[3] - 10 - (NOTE ? 90 : 20) - ROW0) / Math.max(1, n - 0.4)), is = Math.min(70, rowH * 0.58) * SCALE;
    // fixed beats for any number of lines (one soundtrack): lines share the 1.5 s – 3.6 s window, the close is always at 7 s
    const HD = 0.5, STEPR = Math.min(0.42, 2.1 / n), rowAt = i => 1.5 + i * STEPR, CIRC_T = rowAt(n) + 0.1, NOTE_T = CIRC_T + 0.5, OUT = 7.0, DUR = OUT + 4.2, ci = +CIRC - 1;
    let OY = 0;   // the board rises in: every board and chalk draw adds OY (the engine's draw helpers reset the transform)
    function boardDraw(a) {
      const BY = BY0 + OY;
      if (VID.collecting) { if (isImg) ph(BP, window.FRAME_T || 0, [BX, BY, BW, BH]); return; }
      const c = G(); c.globalAlpha = a;
      if (BOARD === 'slate' || BOARD === 'black') {
        const fr = BOARD === 'slate' ? 26 : 16, g = c.createLinearGradient(BX, BY, BX + BW, BY + BH); if (BOARD === 'slate') { g.addColorStop(0, '#8A5A36'); g.addColorStop(0.5, '#6B4226'); g.addColorStop(1, '#8A5A36'); } else { g.addColorStop(0, '#D9DDE3'); g.addColorStop(0.5, '#8D949E'); g.addColorStop(1, '#D9DDE3'); }
        c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 70; c.shadowOffsetY = 30; c.fillStyle = g; c.beginPath(); c.roundRect(BX, BY, BW, BH, 22); c.fill(); c.shadowBlur = 0; c.shadowOffsetY = 0;
        const s = c.createRadialGradient(BX + BW * 0.3, BY + BH * 0.2, 40, BX + BW * 0.5, BY + BH * 0.5, BH * 0.8); if (BOARD === 'slate') { s.addColorStop(0, '#34433B'); s.addColorStop(1, '#1F2923'); } else { s.addColorStop(0, '#2A2D2C'); s.addColorStop(1, '#121413'); }
        c.fillStyle = s; c.beginPath(); c.roundRect(BX + fr, BY + fr, BW - fr * 2, BH - fr * 2, 8); c.fill();
      } else if (af) {
        c.fillStyle = '#6B4226'; [[BX + 40, -6], [BX + BW - 70, 6]].forEach(([x, r]) => { c.save(); c.translate(x + 15, BY + BH - 40); c.rotate((r * Math.PI) / 180); c.fillRect(-15, 0, 30, 170); c.restore(); });
        c.fillStyle = 'rgba(0,0,0,0.4)'; c.beginPath(); c.ellipse(W / 2, BY + BH + 150, BW / 2, 22, 0, 0, TAU); c.fill();
        const tz = (m) => { c.beginPath(); c.moveTo(BX + BW * 0.06 + m, BY + m); c.lineTo(BX + BW * 0.94 - m, BY + m); c.lineTo(BX + BW - m, BY + BH - m); c.lineTo(BX + m, BY + BH - m); c.closePath(); };
        const g = c.createLinearGradient(BX, BY, BX + BW, BY + BH); g.addColorStop(0, '#9A6A42'); g.addColorStop(1, '#6B4226'); c.fillStyle = g; tz(0); c.fill();
        const s = c.createRadialGradient(BX + BW * 0.4, BY + BH * 0.25, 40, W / 2, BY + BH / 2, BH * 0.8); s.addColorStop(0, '#2D302F'); s.addColorStop(1, '#161817'); c.fillStyle = s; tz(30); c.fill();
        c.fillStyle = '#6B4226'; c.beginPath(); c.roundRect(W / 2 - 50, BY - 26, 100, 40, 12); c.fill();
      } else if (BOARD === 'wood') {
        c.save(); c.beginPath(); c.roundRect(BX, BY, BW, BH, 20); c.clip(); const ph2 = BH / 9;
        for (let i = 0; i < 9; i++) { c.fillStyle = ['#4A2F1E', '#553623', '#3F281A'][i % 3]; c.fillRect(BX, BY + i * ph2, BW, ph2 - 3); c.strokeStyle = 'rgba(30,18,10,0.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(BX, BY + i * ph2 + ph2 * 0.4); c.bezierCurveTo(BX + BW * 0.3, BY + i * ph2 + ph2 * 0.55, BX + BW * 0.6, BY + i * ph2 + ph2 * 0.3, BX + BW, BY + i * ph2 + ph2 * 0.45); c.stroke(); }
        const v = c.createRadialGradient(W / 2, BY + BH * 0.45, BH * 0.2, W / 2, BY + BH / 2, BH * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.5)'); c.fillStyle = v; c.fillRect(BX, BY, BW, BH); c.restore();
        c.strokeStyle = '#2E1D12'; c.lineWidth = 14; c.beginPath(); c.roundRect(BX + 7, BY + 7, BW - 14, BH - 14, 16); c.stroke();
      }
      if (!isImg) { c.globalAlpha = a; for (let i = 0; i < 4; i++) { const x = BX + 200 + hash(i) * (BW - 400), y = BY + 200 + hash(i * 5) * (BH - 400), g = c.createRadialGradient(x, y, 10, x, y, 230); g.addColorStop(0, 'rgba(255,255,255,0.045)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(x - 240, y - 240, 480, 480); } }
      D();
      if (isImg) { within(() => ctx.roundRect(BX, BY, BW, BH, 30), () => ph(BP, window.FRAME_T || 0, [BX, BY, BW, BH], { alpha: a })); }
    }
    function elements() {
      const tiP = posOf(elP('title'), [W / 2, BY - 90]);
      const hdP = posOf(elP('head'), [AR[0] + AR[2] / 2, AR[1] + hs * 0.95]);
      const ntP = posOf(elP('note'), [AR[0] + AR[2] / 2, AR[1] + AR[3] - 10]);
      const els = [
        { id: 'board', kind: 'box', label: 'Chalkboard', x: BX, y: BY0, w: BW, h: BH, t0: 0.05, d: OUT - 0.05, box: [BX, BY0, BW, BH], dup: false, del: false },
        { id: 'head', kind: 'pos', label: HEAD, x: hdP[0], y: hdP[1], t0: HD, d: OUT - HD, box: [hdP[0] - 400, hdP[1] - hs, 800, hs + 20], dup: false, del: false },
      ];
      if (TITLE) els.push({ id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.1, d: OUT - 0.1, box: [tiP[0] - 470, tiP[1] - 60, 940, 120], dup: false, del: false });
      rows.forEach((r, i) => {
        const ip = posOf(elP('item' + (i + 1)), [AR[0] + 10, AR[1] + ROW0 + i * rowH]);
        els.push({ id: 'item' + (i + 1), kind: 'pos', label: r[0], x: ip[0], y: ip[1], t0: rowAt(i), d: OUT - rowAt(i), box: [ip[0] - 10, ip[1] - is, 500, is + 20], dup: false, del: false });
        if (r[1]) { const pp = posOf(elP('price' + (i + 1)), [AR[0] + AR[2] - 10, AR[1] + ROW0 + i * rowH]); els.push({ id: 'price' + (i + 1), kind: 'pos', label: r[1], x: pp[0], y: pp[1], t0: rowAt(i) + 0.32, d: OUT - (rowAt(i) + 0.32), box: [pp[0] - 160, pp[1] - is, 170, is + 20], dup: false, del: false }); }
      });
      if (NOTE) els.push({ id: 'note', kind: 'pos', label: NOTE, x: ntP[0], y: ntP[1], t0: NOTE_T, d: OUT - NOTE_T, box: [ntP[0] - 400, ntP[1] - is * 0.78, 800, is + 20], dup: false, del: false });
      return els;
    }
    return {
      dur: DUR, shakes: [], elements,
      preload: async () => { await K3.init(); if (window.NX && NX.useFont) await NX.useFont(FONT); },
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = fa(t, 0.05, 0.5) * (1 - q);
          if (TITLE) { const [tix, tiy] = posOf(elP('title'), [W / 2, BY - 90]); head(TITLE, t, 0.1, tiy, { q, x: tix }); }
          OY = (1 - E.outC(seg(t, 0, 0.6))) * 120; ctx.save(); ctx.globalAlpha = 1 - q;
          boardDraw(a);
          const hf = F(wt, hs, fam), hy = AR[1] + OY + hs * 0.95;
          const [hdx, hdy] = posOf(elP('head'), [AR[0] + AR[2] / 2, hy]);
          chalk(HEAD, hdx, hdy, hf, textC, E.inOutC(seg(t, HD, 0.8)), 'center', TEXO, true);
          if (!VID.collecting) { const u = E.inOutC(seg(t, HD + 0.7, 0.35)), c = G(), w0 = AR[0] + AR[2] * 0.22, w1 = AR[0] + AR[2] * 0.78, yy = hy + hs * 0.28; c.strokeStyle = textC; c.lineWidth = 6; c.lineCap = 'round'; c.globalAlpha = 0.9;
            c.beginPath(); c.moveTo(w0, yy); const steps = 24; for (let i = 1; i <= steps * u; i++) { const x = lerp(w0, w1, i / steps); c.lineTo(x, yy + Math.sin(i * 0.9) * 5); } c.stroke(); D(); }
          const y0 = AR[1] + OY + ROW0;
          rows.forEach((r, i) => {
            const yy = y0 + i * rowH, nf = F(wt, is, fam), pf = F(wt, is * 1.05, fam);
            const [nmx, nmy] = posOf(elP('item' + (i + 1)), [AR[0] + 10, yy]);
            chalk(r[0], nmx, nmy, nf, textC, E.inOutC(seg(t, rowAt(i), 0.45)), 'left', TEXO, true);
            if (r[1]) { const [prx, pry] = posOf(elP('price' + (i + 1)), [AR[0] + AR[2] - 10, yy]); const pw = chalk(r[1], prx, pry, pf, priceC, E.inOutC(seg(t, rowAt(i) + 0.32, 0.2)), 'right', TEXO, true);
              if (i === ci && !VID.collecting) { const u = E.inOutC(seg(t, CIRC_T, 0.5)); if (u > 0) { const c = G(), cx = prx - pw / 2, cy = pry - is * 0.32, rx = pw / 2 + 30, ry = is * 0.75; c.strokeStyle = priceC; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.ellipse(cx, cy, rx, ry, -0.08, -Math.PI * 0.6, -Math.PI * 0.6 + TAU * 1.08 * u); c.stroke(); D(); } } }
          });
          if (NOTE) { const [ntx, nty] = posOf(elP('note'), [AR[0] + AR[2] / 2, AR[1] + OY + AR[3] - 10]); chalk(NOTE, ntx, nty, F(wt, is * 0.78, fam), rgbaOf(textC.length === 7 ? textC : '#F5F4EC', 0.85), E.inOutC(seg(t, NOTE_T, 0.6)), 'center', TEXO, true); }
          ctx.restore();
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() {
        // chalk scratches through the whole writing window (any number of lines), the circle, the note
        const ev = [['whoosh', 0.05, 0.22, 0]];
        for (let x = HD, k = 0; x < 3.75; x += 0.29, k++) ev.push(['pencil', x, 0.22 + 0.08 * hash(k), ((k % 3) - 1) * 0.25]);
        ev.push(['swish', 3.7, 0.18, 0.3], ['pencil', 4.2, 0.25, 0], ['pencil', 4.5, 0.2, 0]);
        closeCues(ev, OUT); return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ SPOTLIGHT (your photo + callouts, or a zoom tour)
  // [name, price or offer, ribbon, [[callout, 'x %, y %'] ×4]]. Food prices are sample text; other trades start with no offer
  const HERO = {
    burgers: ['The *Double* Smash', '$11', 'HOUSE FAVORITE', [['Toasted bun', '66, 26'], ['Crisp lettuce', '26, 43'], ['American cheese', '76, 60'], ['Two smashed patties', '26, 67']]],
    sandwiches: ['The *Italian* Sub', '$12', 'HOUSE FAVORITE', [['Fresh-baked roll', '30, 38'], ['Red onion', '74, 49'], ['Provolone', '76, 60'], ['Capicola & salami', '28, 66']]],
    pizza: ['The *Works*', '$19', 'FROM THE OVEN', [['Hand-tossed crust', '14, 50'], ['Pepperoni', '62, 34'], ['Fresh mozzarella', '44, 62'], ['Fresh basil', '72, 66']]],
    tacos: ['Al *Pastor* Tacos', '$12', 'MUST TRY', [['Handmade tortillas', '26, 40'], ['Al pastor', '54, 50'], ['Cilantro & onion', '66, 34'], ['Fresh lime', '80, 72']]],
    mexican: ['Enchiladas *Rojas*', '$15', 'RECETA DE CASA', [['Mexican rice', '30, 36'], ['Red chile sauce', '66, 46'], ['Refried beans', '30, 68'], ['Crema & cilantro', '72, 62']]],
    italian: ['Spaghetti *Pomodoro*', '$17', 'HOUSE MADE', [['Fresh spaghetti', '30, 40'], ['Tomato sauce', '52, 50'], ['Basil', '58, 40'], ['Parmigiano', '46, 58']]],
    restaurant: ['Today’s *Favorite*', '$12', 'HOUSE FAVORITE', [['Made fresh', '30, 40'], ['House sauce', '66, 46'], ['Fresh herbs', '62, 30'], ['Served hot', '44, 66']]],
    hvac: ['Your new *AC system*', '', 'NOW INSTALLING', [['Quiet fan', '42, 50'], ['Weatherproof cabinet', '28, 72'], ['New line set', '70, 40'], ['Pro install', '66, 78']]],
    carpet: ['Deep *steam* clean', '', 'THIS WEEK', [['Deep-cleaned fibers', '50, 78'], ['Spot treatment', '26, 70'], ['Fast drying', '74, 74']]],
    cleaning: ['The *deep clean*', '', 'BOOK NOW', [['Counters & backsplash', '26, 62'], ['Sink & faucet', '52, 54'], ['Cabinet fronts', '70, 82'], ['Windows', '50, 18']]],
    commercial: ['Nightly *office* clean', '', 'AFTER HOURS', [['Desks sanitized', '40, 64'], ['Floors vacuumed', '62, 88'], ['Glass cleaned', '50, 30'], ['Trash out', '20, 80']]],
    fencing: ['Cedar *privacy* fence', '', 'NEW BUILD', [['Cedar pickets', '40, 56'], ['Posts set in concrete', '18, 72'], ['Custom height', '76, 44'], ['Clean finish', '60, 76']]],
    hardscape: ['The *backyard* build', '', 'NEW BUILD', [['Pergola', '50, 22'], ['Paver patio', '34, 86'], ['Outdoor kitchen', '70, 62'], ['Seat walls', '20, 70']]],
    barbershop: ['The *full service*', '$45', 'CUT + BEARD', [['Skin fade', '50, 30'], ['Hot towel', '24, 50'], ['Beard shape-up', '70, 56'], ['Classic chair', '50, 66']]],
    detailing: ['Ceramic *coating*', '', 'SHOWROOM SHINE', [['Paint correction', '64, 52'], ['Wheels & tires', '30, 74'], ['Glass treated', '54, 40'], ['Deep gloss', '40, 56']]],
    realestate: ['Just *listed*', '', 'NEW LISTING', [['Curb appeal', '50, 24'], ['Open floor plan', '34, 54'], ['Big backyard', '82, 80'], ['Mature trees', '16, 56']]],
    retail: ['The *new* drop', '', 'JUST IN', [['The detail', '30, 40'], ['The material', '70, 40'], ['The fit', '50, 70']]],
    general: ['Our *signature*', '', 'BOOK NOW', [['Feature one', '30, 40'], ['Feature two', '70, 40'], ['Feature three', '50, 70']]],
  };
  HERO.landscaping = HERO.hardscape; HERO.salon = HERO.barbershop; HERO.pressure = HERO.cleaning; HERO.roofing = HERO.general;
  function herox() {
    const Hd = HERO[IND] || (FOOD.includes(IND) ? HERO.restaurant : HERO.general);
    const MODE = TX('motion', 'callouts', { label: 'Motion', group: 'Style', options: opts([['callouts', 'Callouts point at the photo'], ['tour', 'Camera tour: zoom to each point']]) });
    const NAME = TX('name', Hd[0], { label: 'Name', group: 'Words', max: 30, hint: 'Wrap a word in *stars* to colour it.' });
    const PRICE = off(TX('price', Hd[1], { label: 'Price or offer (badge)', group: 'Words', max: 14, hint: 'Empty: no badge. ' + DASH }));
    const BADGE = off(TX('badge', Hd[2], { label: 'Ribbon', group: 'Words', upper: true, max: 18, hint: DASH }));
    const NCO = +TX('count', String(Math.min(4, Hd[3].length)), { label: 'Callouts', group: 'Callouts', options: opts([['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']]) });
    const CO = [0, 1, 2, 3].slice(0, NCO).map(k => { const d = Hd[3][k] || ['Feature ' + (k + 1), ['30, 40', '70, 40', '50, 70', '50, 30'][k]]; return { label: TX('c' + (k + 1), d[0], { label: 'Callout ' + (k + 1), group: 'Callouts', max: 24 }), pos: xy(TX('p' + (k + 1), d[1], { label: 'Callout ' + (k + 1) + ' point (x %, y %)', group: 'Callouts', max: 9, hint: k === 0 ? 'Where it points on your photo: 0, 0 is top left, 100, 100 bottom right.' : undefined }), [50, 50]) }; }).filter(c => c.label);
    const END = TX('end', 'Come *see us.*', { label: 'Closing line', group: 'Ending', max: 28 });
    // one set of beats for both motions and any number of callouts (one soundtrack): points from 0.8 s, 0.8 s apart,
    // the name and price at 4.3 s, the close at 6.7 s
    const n = CO.length, tour = MODE === 'tour';
    const T0 = 0.5, STEP = tour ? 3.2 / Math.max(1, n) : 0.8, CT = i => T0 + 0.3 + i * STEP, PRICE_T = 4.3, OUT = 6.7, DUR = OUT + 4.2;
    const S = shot('hero', 'Your photo or clip', OUT + 0.2);
    const BOX0 = [150, 370, 780, 780], CARD0 = [90, 400, 900, 1080];
    const FR0 = tour ? CARD0 : BOX0;
    const FR = (EL && EL.box) ? [elNum(EL.box.x, FR0[0]), elNum(EL.box.y, FR0[1]), elNum(EL.box.w, FR0[2]), elNum(EL.box.h, FR0[3])] : FR0;
    function elements() {
      const nmP = tour ? posOf(elP('name'), [FR[0] + 44, FR[1] + FR[3] - 54]) : posOf(elP('name'), [W / 2, 1290]);
      const bgP = tour ? posOf(elP('badge'), [FR[0] + 26, FR[1] + 52]) : posOf(elP('badge'), [FR[0] + 20, FR[1] + 20]);
      const prP = posOf(elP('price'), [FR[0] + FR[2] - 40, FR[1] + FR[3] - 80]);
      const els = [
        { id: 'photo', kind: 'box', label: 'Photo', x: FR[0], y: FR[1], w: FR[2], h: FR[3], t0: 0.05, d: OUT - 0.05, box: [FR[0], FR[1], FR[2], FR[3]], dup: false, del: false },
        ...CO.map((c, i) => { const cp = posOf(elP('callout' + (i + 1)), [FR[0] + (FR[2] * c.pos[0]) / 100, FR[1] + (FR[3] * c.pos[1]) / 100]); return { id: 'callout' + (i + 1), kind: 'callout', label: c.label, x: cp[0], y: cp[1], t0: CT(i), d: OUT - CT(i), box: [cp[0] - 24, cp[1] - 24, 48, 48], dup: true, del: true }; }),
      ];
      if (BADGE) els.push({ id: 'badge', kind: 'pos', label: BADGE, x: bgP[0], y: bgP[1], t0: 0.3, d: OUT - 0.3, box: [bgP[0] - 10, bgP[1] - 40, 400, 80], dup: false, del: false });
      if (PRICE) els.push({ id: 'price', kind: 'pos', label: PRICE, x: prP[0], y: prP[1], t0: PRICE_T, d: OUT - PRICE_T, box: [prP[0] - 130, prP[1] - 130, 260, 260], dup: false, del: false });
      els.push({ id: 'name', kind: 'pos', label: NAME, x: nmP[0], y: nmP[1], t0: PRICE_T - 0.3, d: OUT - (PRICE_T - 0.3), box: [nmP[0] - (tour ? 10 : 470), nmP[1] - 90, 940, 110], dup: false, del: false });
      return els;
    }
    return {
      dur: DUR, shakes: [[PRICE_T, 8]], elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), k = E.outBack(seg(t, 0.05, 0.7)), a = clamp(seg(t, 0.05, 0.3) * 2) * (1 - q);
          if (!tour) {
            const BOX = FR, r = K3.wholeIn(S.c, BOX), bob = Math.sin(t * 1.8) * 8 * k, cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2;
            if (!VID.collecting) { const c = G(); c.globalAlpha = a; const g = c.createConicGradient(t * 0.25, cx, cy); for (let i = 0; i < 16; i++) { g.addColorStop(i / 16, ORA(0.16)); g.addColorStop(i / 16 + 0.025, ORA(0.16)); g.addColorStop(i / 16 + 0.03, ORA(0)); g.addColorStop((i + 1) / 16 - 0.001, ORA(0)); }
              c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 900, 0, TAU); c.fill(); const m = c.createRadialGradient(cx, cy, 100, cx, cy, 900); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(0.55, rgbaOf(DEEP2, 0.6)); m.addColorStop(1, DEEP2); c.fillStyle = m; c.fillRect(0, 0, W, H); D(); }
            const sr = [cx - (r[2] / 2) * (0.5 + 0.5 * k), cy - (r[3] / 2) * (0.5 + 0.5 * k) + bob, r[2] * (0.5 + 0.5 * k), r[3] * (0.5 + 0.5 * k)];
            card(sr, 40, a); within(() => ctx.roundRect(sr[0], sr[1], sr[2], sr[3], 40), () => ph(S, t, BOX, { alpha: a, s: 0.5 + 0.5 * k, dy: bob }));
            // callouts: one column per side, pushed apart so labels never overlap
            const pts = CO.map((c, i) => { const [px, py] = posOf(elP('callout' + (i + 1)), [r[0] + (r[2] * c.pos[0]) / 100, r[1] + (r[3] * c.pos[1]) / 100]); return { i, label: c.label, left: px < r[0] + r[2] / 2, dx: px, dy: py + bob, ly: py }; });
            for (const side of [true, false]) { const col = pts.filter(p => p.left === side).sort((x, y) => x.ly - y.ly); for (let j = 1; j < col.length; j++) if (col[j].ly - col[j - 1].ly < 82) col[j].ly = col[j - 1].ly + 82; }
            for (const p of pts) {
              const d = E.outBack(seg(t, CT(p.i), 0.35)) * (1 - q), ln = E.outC(seg(t, CT(p.i) + 0.1, 0.35)) * (1 - q), ch = seg(t, CT(p.i) + 0.3, 0.35) * (1 - q); if (d <= 0) continue;
              if (!VID.collecting) { const c = G(), ex = p.left ? 40 : W - 40, bx = p.dx + (p.left ? -50 : 50), L1 = Math.hypot(bx - p.dx, p.ly - p.dy), L2 = Math.abs(ex - bx), tot = L1 + L2, u = tot * ln;
                c.strokeStyle = WA(0.8); c.lineWidth = 3; c.beginPath(); c.moveTo(p.dx, p.dy); if (u <= L1) c.lineTo(lerp(p.dx, bx, u / L1), lerp(p.dy, p.ly, u / L1)); else { c.lineTo(bx, p.ly); c.lineTo(lerp(bx, ex, (u - L1) / L2), p.ly); } c.stroke();
                const pu = ((t - CT(p.i)) % 1 + 1) % 1; c.strokeStyle = ORA(1 - pu); c.lineWidth = 3; c.beginPath(); c.arc(p.dx, p.dy, 14 + 26 * pu, 0, TAU); c.stroke();
                c.fillStyle = OR; c.beginPath(); c.arc(p.dx, p.dy, 14 * d, 0, TAU); c.fill(); c.strokeStyle = BLK; c.lineWidth = 4; c.stroke(); D(); }
              chip(p.label, p.left ? 30 : W - 30, p.ly, { p: ch, size: 30, align: p.left ? 'left' : 'right', border: ORA(0.8) });
            }
            if (BADGE) { const bp = E.outBack(seg(t, 0.5, 0.4)) * (1 - q); if (bp > 0 && !VID.collecting) { const c = G(), [bgx, bgy] = posOf(elP('badge'), [sr[0] + 20, sr[1] + 20]); c.translate(bgx, bgy); c.rotate(-0.14); c.scale(bp, bp); const f = F(700, 26, 'Mono'), tw = textW(BADGE, f, 4); c.fillStyle = WHT; c.beginPath(); c.roundRect(-20, -28, tw + 48, 56, 10); c.fill(); setF(f, 4); c.fillStyle = BLK; c.textBaseline = 'middle'; c.fillText(BADGE, 4, 2); D(); } }
            if (PRICE) { const pp = E.outBack(seg(t, PRICE_T, 0.5)) * (1 - q); if (pp > 0 && !VID.collecting) { const c = G(), R = 125, [prx, pry] = posOf(elP('price'), [sr[0] + sr[2] - 40, sr[1] + sr[3] - 80]); c.translate(prx, pry); c.rotate((1 - pp) * 1.6 + 0.17); c.scale(pp, pp); c.fillStyle = OR; c.shadowColor = ORA(0.5); c.shadowBlur = 40; c.beginPath();
              for (let i = 0; i < 36; i++) { const ang = (i / 36) * TAU, rr = i % 2 ? R * 0.88 : R; c.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr); } c.closePath(); c.fill(); c.shadowBlur = 0; const sz = Math.min(80, fitSize(PRICE, 900, R * 1.5, 80, 'Mont', -1)); setF(F(900, sz, 'Mont'), -1); c.fillStyle = onCol(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(PRICE, 0, 4); D(); } }
            { const [nmx, nmy] = posOf(elP('name'), [W / 2, 1290]); head(NAME, t, PRICE_T - 0.3, nmy, { q, max: 100, x: nmx }); }
          } else {
            const CARD = FR, r = K3.wholeIn(S.c, CARD), cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2;
            const kf = [[0, 1.08, 50, 50], [T0, 1, 50, 50]]; CO.forEach((c, i) => { const s0 = T0 + i * STEP; const [fx, fy] = posOf(elP('callout' + (i + 1)), [r[0] + (r[2] * c.pos[0]) / 100, r[1] + (r[3] * c.pos[1]) / 100]); const fxp = (fx - r[0]) / r[2] * 100, fyp = (fy - r[1]) / r[3] * 100; kf.push([s0 + 0.35, 2.1, fxp, fyp], [s0 + STEP, 2.1, fxp, fyp]); }); kf.push([T0 + n * STEP + 0.4, 1, 50, 50]);
            let cam = kf[kf.length - 1]; for (let i = 0; i < kf.length - 1; i++) if (t >= kf[i][0] && t < kf[i + 1][0]) { const u = E.inOutC((t - kf[i][0]) / Math.max(0.01, kf[i + 1][0] - kf[i][0])); cam = [t, lerp(kf[i][1], kf[i + 1][1], u), lerp(kf[i][2], kf[i + 1][2], u), lerp(kf[i][3], kf[i + 1][3], u)]; break; }
            const s = cam[1], px = r[0] + (r[2] * cam[2]) / 100, py = r[1] + (r[3] * cam[3]) / 100, mxs = Math.max(0, (r[2] * s - r[2]) / 2), mys = Math.max(0, (r[3] * s - r[3]) / 2);
            const dx = clamp(-(px - cx) * s, -mxs, mxs), dy = clamp(-(py - cy) * s, -mys, mys);
            card(r, 40, a); within(() => ctx.roundRect(r[0], r[1], r[2], r[3], 40), () => ph(S, t, CARD, { alpha: a, s, dx, dy }));
            const act = t >= T0 && t < T0 + n * STEP ? Math.min(n - 1, Math.floor((t - T0) / STEP)) : -1;
            if (act >= 0) { const ap = E.outBack(seg(t, T0 + act * STEP + 0.3, 0.3)), c0 = CO[act], [cpx, cpy] = posOf(elP('callout' + (act + 1)), [r[0] + (r[2] * c0.pos[0]) / 100, r[1] + (r[3] * c0.pos[1]) / 100]), sx = cx + (cpx - cx) * s + dx, sy = cy + (cpy - cy) * s + dy;
              if (!VID.collecting && ap > 0) within(() => ctx.roundRect(r[0], r[1], r[2], r[3], 40), () => { const c = G(); c.strokeStyle = OR; c.lineWidth = 7; c.shadowColor = OR; c.shadowBlur = 24; c.globalAlpha = clamp(ap); c.beginPath(); c.arc(sx, sy, 64 * ap, 0, TAU); c.stroke(); D(); });
              chip(String(act + 1).padStart(2, '0') + '   ' + c0.label, W / 2, r[1] + r[3] - 70, { p: ap, size: 40, border: ORA(0.8) }); }
            if (BADGE) { const [bgx, bgy] = posOf(elP('badge'), [r[0] + 26, r[1] + 52]); chip(BADGE, bgx, bgy, { p: seg(t, 0.3, 0.3) * (1 - q), size: 26, align: 'left', fam: 'Mono', w: 700, ls: 4, bg: WHT, col: BLK }); }
            const ep = seg(t, PRICE_T - 0.3, 0.5) * (1 - q);
            if (ep > 0) { if (!VID.collecting) within(() => ctx.roundRect(r[0], r[1], r[2], r[3], 40), () => { const c = G(), g = c.createLinearGradient(0, r[1] + r[3] * 0.55, 0, r[1] + r[3]); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + 0.75 * ep + ')'); c.fillStyle = g; c.fillRect(r[0], r[1], r[2], r[3]); D(); });
              const sz = Math.min(84, fitSize(plain(NAME), 900, r[2] - (PRICE ? 330 : 90), 84, 'Mont', -2)), [nmx, nmy] = posOf(elP('name'), [r[0] + 44, r[1] + r[3] - 54]); T(rich(NAME), nmx, nmy, F(900, sz, 'Mont'), { p: ep, ls: -2 });
              if (PRICE) { const [prx, pry] = posOf(elP('price'), [r[0] + r[2] - 40, r[1] + r[3] - 80]); chip(PRICE, prx, pry, { p: seg(t, PRICE_T, 0.4) * (1 - q), size: 44, align: 'right', bg: OR, col: onCol(OR), w: 900 }); } }
          }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() {
        const ev = [['whoosh', 0.05, 0.3, 0], ['pop', 0.5, 0.25, -0.3]];
        CO.forEach((c, i) => { const pan = c.pos[0] < 50 ? -0.35 : 0.35; ev.push(['swish', CT(i) - 0.3, 0.18, pan], ['pop', CT(i), 0.26, pan]); });
        ev.push(['impact', PRICE_T, 0.36, 0]); if (PRICE) ev.push(['coin', PRICE_T + 0.05, 0.22, 0.2]); closeCues(ev, OUT);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ SPECIAL OF THE DAY
  const SPECIAL = { pizza: ['FRIDAY', 'Supreme *Pizza*', '$22', '$16', 'Today only · pickup or delivery'], burgers: ['WEDNESDAY', 'Bacon *Jam* Burger', '$14', '$10', 'Today only · while it lasts'],
    tacos: ['TUESDAY', 'Taco *Tuesday*', '$3', '$1.50', 'All day Tuesday'], mexican: ['SUNDAY', 'Mole *Poblano*', '$19', '$15', 'Sundays only'], italian: ['THURSDAY', 'Nonna’s *Lasagna*', '$22', '$17', 'Tonight only'],
    sandwiches: ['MONDAY', 'Turkey *Club*', '$13', '$9.99', 'Today only · 11 AM–3 PM'], restaurant: ['TUESDAY', 'Birria *Tacos*', '$15', '$11', 'Today only · until 9 PM'] };
  const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  function specialx() {
    const Sd = SPECIAL[IND] || SPECIAL.restaurant;
    const DAY = TX('day', Sd[0], { label: 'Day', group: 'The special', options: opts(DAYS.map(d => [d, d[0] + d.slice(1).toLowerCase()]).concat([['TODAY', 'Today'], ['TONIGHT', 'Tonight'], ['THIS WEEKEND', 'This weekend']])) });
    const PREV = TX('prev', 'auto', { label: 'Page that tears off first', group: 'The special', options: opts([['auto', 'The day before'], ['none', 'None']]) });
    const LABEL = TX('label', 'SPECIAL OF THE DAY', { label: 'Label', group: 'The special', upper: true, max: 24 });
    const NAME = TX('name', Sd[1], { label: 'Dish', group: 'The special', max: 28, hint: 'Wrap a word in *stars* to colour it.' });
    const OLD = off(TX('old', Sd[2], { label: 'Regular price (crossed out)', group: 'The special', max: 10, hint: DASH })), NEW = TX('price', Sd[3], { label: 'Special price', group: 'The special', max: 10 });
    const UNTIL = off(TX('until', Sd[4], { label: 'Until line', group: 'The special', max: 34, hint: DASH })), STICK = off(TX('stick', 'TODAY ONLY', { label: 'Sticker', group: 'The special', upper: true, max: 12, hint: DASH }));
    const END = TX('end', 'See you *today.*', { label: 'Closing line', group: 'Ending', max: 28 });
    const prevDay = PREV === 'none' || !DAYS.includes(DAY) ? '' : DAYS[(DAYS.indexOf(DAY) + 6) % 7];
    const TEAR = 0.45, PH = 0.95, STK = 1.5, NM = 1.7, STR = 2.5, SLAM = 2.85, UNT = 3.3, OUT = 6.6, DUR = OUT + 4.2;
    const S = shot('dish', 'The dish', OUT + 0.2), BOX0 = [140, 595, 800, 455];
    const BOX = (EL && EL.box) ? [elNum(EL.box.x, BOX0[0]), elNum(EL.box.y, BOX0[1]), elNum(EL.box.w, BOX0[2]), elNum(EL.box.h, BOX0[3])] : BOX0;
    const pf = F(900, 130, 'Mont'), nw = textW(NEW, pf, -3), of = F(800, 70, 'Mont'), ow = OLD ? textW(OLD, of, 0) + 40 : 0, px0 = W / 2 - (nw + ow) / 2;
    function elements() {
      const calP = posOf(elP('calendar'), [W / 2 - 160, 250]);
      const lbP = posOf(elP('label'), [W / 2, 530]);
      const stP = posOf(elP('sticker'), [BOX[0] + BOX[2] - 20, BOX[1] + 95]);
      const nmP = posOf(elP('name'), [W / 2, 1140]);
      const olP = posOf(elP('old'), [px0, 1268]);
      const prP = posOf(elP('price'), [px0 + ow + nw / 2, 1228]);
      const unP = posOf(elP('until'), [W / 2, 1365]);
      const els = [
        { id: 'calendar', kind: 'box', label: 'Calendar', x: calP[0], y: calP[1], w: 320, h: 210, t0: 0, d: TEAR + 0.7, box: [calP[0], calP[1], 320, 210], dup: false, del: false },
        { id: 'dish', kind: 'box', label: 'Dish photo', x: BOX[0], y: BOX[1], w: BOX[2], h: BOX[3], t0: PH, d: OUT - PH, box: [BOX[0], BOX[1], BOX[2], BOX[3]], dup: false, del: false },
        { id: 'label', kind: 'pos', label: LABEL, x: lbP[0], y: lbP[1], t0: 0.6, d: OUT - 0.6, box: [lbP[0] - 300, lbP[1] - 40, 600, 60], dup: false, del: false },
        { id: 'name', kind: 'pos', label: NAME, x: nmP[0], y: nmP[1], t0: NM, d: OUT - NM, box: [nmP[0] - 470, nmP[1] - 90, 940, 110], dup: false, del: false },
        { id: 'price', kind: 'pos', label: NEW, x: prP[0], y: prP[1], t0: SLAM, d: OUT - SLAM, box: [prP[0] - nw / 2 - 10, prP[1] - 100, nw + 20, 130], dup: false, del: false },
      ];
      if (STICK) els.push({ id: 'sticker', kind: 'pos', label: STICK, x: stP[0], y: stP[1], t0: STK, d: OUT - STK, box: [stP[0] - 100, stP[1] - 100, 200, 200], dup: false, del: false });
      if (OLD) els.push({ id: 'old', kind: 'pos', label: OLD, x: olP[0], y: olP[1], t0: STR - 0.4, d: OUT - (STR - 0.4), box: [olP[0] - 10, olP[1] - 60, ow, 80], dup: false, del: false });
      if (UNTIL) els.push({ id: 'until', kind: 'pos', label: UNTIL, x: unP[0], y: unP[1], t0: UNT, d: OUT - UNT, box: [unP[0] - 400, unP[1] - 40, 800, 80], dup: false, del: false });
      return els;
    }
    const page = (c, x, y, w, h, d) => { c.fillStyle = '#FFFFFF'; c.beginPath(); c.roundRect(x, y, w, h, [0, 0, 18, 18]); c.fill(); setF(F(700, 20, 'Mono'), 4); c.fillStyle = '#8A8F98'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText('TODAY', x + w / 2, y + 52);
      const sz = Math.min(64, fitSize(d, 900, w - 40, 64, 'Mont', -1)); setF(F(900, sz, 'Mont'), -1); c.fillStyle = '#14181F'; c.fillText(d, x + w / 2, y + 52 + sz + 14); };
    return {
      dur: DUR, shakes: [[SLAM, 10]], elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = 1 - q;
          if (!VID.collecting) { const k = E.outBack(seg(t, 0, 0.5)), c = G(), Wc = 320, Hc = 210, [calX, calY] = posOf(elP('calendar'), [W / 2 - 160, 250 - (1 - k) * 300]); c.globalAlpha = a; c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40; c.shadowOffsetY = 18; c.fillStyle = '#FFFFFF'; c.beginPath(); c.roundRect(calX, calY, Wc, Hc, 18); c.fill(); c.shadowBlur = 0; c.shadowOffsetY = 0;
            page(c, calX, calY + 56, Wc, Hc - 56, DAY);
            if (prevDay && t < TEAR + 0.7) { const u = E.inC(seg(t, TEAR, 0.6)); c.save(); c.translate(calX + Wc, calY + 56); c.rotate(u * 0.7); c.translate(u * 120, u * u * 700); c.globalAlpha = a * (1 - u * 0.7); page(c, -Wc, 0, Wc, Hc - 56, prevDay); c.restore(); }
            c.fillStyle = OR; c.beginPath(); c.roundRect(calX, calY, Wc, 56, [18, 18, 0, 0]); c.fill(); c.fillStyle = '#C9CED6'; [calX + 80, calX + Wc - 80].forEach(x => { c.beginPath(); c.roundRect(x - 11, calY - 18, 22, 46, 11); c.fill(); }); D(); }
          { const [lbx, lby] = posOf(elP('label'), [W / 2, 530]); caps(LABEL, lbx, lby, 30, seg(t, 0.6, 0.4), q, { fam: 'Mono', w: 700, ls: 6, col: OR }); }
          const pk = E.outBack(seg(t, PH, 0.6)), r = K3.wholeIn(S.c, BOX), ox = (1 - pk) * 1000;
          card([r[0] + ox, r[1], r[2], r[3]], 36, a * (t >= PH ? 1 : 0)); if (t >= PH) within(() => ctx.roundRect(r[0] + ox, r[1], r[2], r[3], 36), () => ph(S, t, BOX, { alpha: a, dx: ox }));
          const sp = E.outBack(seg(t, STK, 0.4)) * a; if (sp > 0 && !VID.collecting && STICK) { const c = G(), [stx, sty] = posOf(elP('sticker'), [r[0] + r[2] - 20 + ox, r[1] + 95]); c.translate(stx, sty); c.rotate(0.2 + (1 - sp) * -1); c.scale(sp, sp); c.fillStyle = OR; c.beginPath(); c.arc(0, 0, 100, 0, TAU); c.fill(); c.fillStyle = onCol(OR); c.textAlign = 'center'; c.textBaseline = 'middle';
            const wds = STICK.split(' '), sz = Math.min(40, ...wds.map(w => fitSize(w, 900, 150, 40, 'Mont', 0))); setF(F(900, sz, 'Mont'), 0); wds.slice(0, 2).forEach((w, i) => c.fillText(w, 0, (i - (Math.min(2, wds.length) - 1) / 2) * sz * 1.05)); D(); }
          { const [nmx, nmy] = posOf(elP('name'), [W / 2, 1140]); head(NAME, t, NM, nmy, { q, max: 92, x: nmx }); }
          if (OLD && !VID.collecting) { const c = G(), p = fa(t, STR - 0.4, 0.4) * a, [olx, oly] = posOf(elP('old'), [px0, 1268]); c.globalAlpha = p; setF(of, 0); c.fillStyle = WA(0.55); c.textBaseline = 'alphabetic'; c.fillText(OLD, olx, oly); const u = seg(t, STR, 0.3); c.strokeStyle = '#FF4D4D'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(olx - 6, oly - 18); c.lineTo(olx - 6 + (ow - 30) * u, oly - 34); c.stroke(); D(); }
          const sl = seg(t, SLAM, 0.35); if (sl > 0 && !VID.collecting) { const c = G(), s = lerp(2, 1, E.outBack(sl)), [prx, pry] = posOf(elP('price'), [px0 + ow + nw / 2, 1228]); c.globalAlpha = clamp(sl * 4) * a; c.translate(prx, pry); c.scale(s, s); setF(pf, -3); c.fillStyle = OR; c.shadowColor = ORA(0.4); c.shadowBlur = 50; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(NEW, 0, 0); D(); }
          const up2 = fa(t, UNT, 0.4) * a; if (up2 > 0 && UNTIL && !VID.collecting) { const c = G(), f = F(700, 34, 'Mont'), tw = textW(UNTIL, f, 0), bw = tw + 120, [unx, uny] = posOf(elP('until'), [W / 2, 1365]); c.globalAlpha = up2; c.fillStyle = WA(0.1); c.beginPath(); c.roundRect(unx - bw / 2, uny - 36, bw, 72, 36); c.fill();
            const ix = unx - bw / 2 + 46; c.strokeStyle = OR; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.arc(ix, uny, 18, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(ix, uny); c.lineTo(ix + 11 * Math.sin(t * 6), uny - 11 * Math.cos(t * 6)); c.moveTo(ix, uny); c.lineTo(ix + 7 * Math.sin(t * 0.6), uny - 7 * Math.cos(t * 0.6)); c.stroke();
            setF(f, 0); c.fillStyle = WHT; c.textBaseline = 'middle'; c.fillText(UNTIL, ix + 34, uny + 2); D(); }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.05, 0.25, 0], ['thud', 0.4, 0.25, 0]]; if (prevDay) ev.push(['paper', TEAR, 0.4, 0.3], ['pageflip', TEAR + 0.05, 0.3, 0.3]); ev.push(['whoosh', PH, 0.35, 0.3], ['pop', STK, 0.35, 0.3], ['swish', NM, 0.2, 0]);
        if (OLD) ev.push(['swish', STR, 0.25, -0.2]); ev.push(['impact', SLAM, 0.45, 0], ['register', SLAM + 0.05, 0.3, 0.2], ['tick', UNT, 0.2, 0], ['ticks', UNT + 0.2, 0.12, 0, { dur: 1.0, n: 6 }]); closeCues(ev, OUT);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ MEAL COMBO
  // menu icons drawn on a 100 x 100 grid: [shape, ...args, colour] with 'a' standing for the accent colour
  const IC = {
    burger: [['p', 'M14,46 C14,22 30,14 50,14 C70,14 86,22 86,46 Z', '#DB974C'], ['p', 'M10,50 Q20,44 30,50 T50,50 T70,50 T90,50 L90,56 L10,56 Z', '#4FA83D'], ['r', 12, 55, 76, 6, 0, '#F7C744'], ['r', 10, 60, 80, 14, 7, '#5A3826'], ['p', 'M14,76 H86 V80 Q86,88 78,88 H22 Q14,88 14,80 Z', '#CF8D44'], ['e', 30, 28, 3, 1.8, '#FFF3D6'], ['e', 46, 22, 3, 1.8, '#FFF3D6'], ['e', 62, 27, 3, 1.8, '#FFF3D6'], ['e', 52, 36, 3, 1.8, '#FFF3D6']],
    fries: [['r', 23, 20, 7, 46, 2, '#F6C945'], ['r', 33, 14, 7, 46, 2, '#F6C945'], ['r', 43, 20, 7, 46, 2, '#F6C945'], ['r', 53, 12, 7, 46, 2, '#F6C945'], ['r', 63, 18, 7, 46, 2, '#F6C945'], ['r', 71, 24, 7, 40, 2, '#F6C945'], ['p', 'M22,42 L78,42 L70,90 L30,90 Z', '#D62828'], ['s', 'M34,52 Q50,62 66,52', '#FFFFFF', 4]],
    drink: [['r', 56, 4, 6, 30, 3, '#FFFFFF'], ['r', 26, 20, 48, 10, 4, '#E9ECEF'], ['p', 'M28,30 L72,30 L66,92 L34,92 Z', '#D62828'], ['r', 31, 50, 38, 12, 0, '#FFFFFF']],
    taco: [['p', 'M12,42 C12,94 88,94 88,42 Z', '#F2C14E'], ['s', 'M18,46 C20,64 80,64 82,46', '#8B3A1E', 9], ['s', 'M12,42 Q22,32 32,42 T52,42 T72,42 T88,42', '#4FA83D', 9], ['c', 28, 36, 3.5, '#F8F9FA'], ['c', 44, 32, 3.5, '#E63946'], ['c', 60, 36, 3.5, '#F8F9FA'], ['c', 74, 34, 3.5, '#E63946']],
    chips: [['p', 'M18,58 L30,26 L42,58 Z', '#F2C14E'], ['p', 'M32,58 L46,22 L58,58 Z', '#F2C14E'], ['p', 'M46,58 L58,30 L68,58 Z', '#F2C14E'], ['p', 'M10,56 C10,86 74,86 74,56 Z', '#C0392B'], ['p', 'M58,70 C58,92 94,92 94,70 Z', '#FFFFFF'], ['e', 76, 70, 18, 5, '#C4321E']],
    pizza: [['p', 'M50,92 L14,24 Q50,8 86,24 Z', '#F7D57A'], ['s', 'M14,24 Q50,8 86,24', '#D99A4E', 10], ['c', 40, 38, 7, '#B7282E'], ['c', 60, 40, 7, '#B7282E'], ['c', 50, 60, 7, '#B7282E']],
    wings: [['e', 32, 40, 14, 20, '#C2571A'], ['r', 28, 56, 8, 18, 3, '#F1EADA'], ['c', 28, 76, 5, '#F1EADA'], ['c', 36, 76, 5, '#F1EADA'], ['e', 66, 44, 14, 20, '#C2571A'], ['r', 62, 60, 8, 18, 3, '#F1EADA'], ['c', 62, 80, 5, '#F1EADA'], ['c', 70, 80, 5, '#F1EADA']],
    pasta: [['s', 'M18,50 C28,26 40,58 52,36 S74,30 82,50', '#F2D06B', 5], ['s', 'M22,50 C31,28 42,55 54,37 S73,33 80,50', '#F2D06B', 5], ['s', 'M26,50 C34,30 44,52 56,38 S72,36 78,50', '#F2D06B', 5], ['e', 50, 40, 14, 9, '#C1121F'], ['e', 58, 34, 7, 4, '#2E8B3E'], ['p', 'M10,50 C10,92 90,92 90,50 Z', '#FFFFFF']],
    salad: [['c', 30, 44, 14, '#4FA83D'], ['c', 48, 36, 16, '#6BBF59'], ['c', 66, 44, 14, '#4FA83D'], ['c', 54, 38, 7, '#E63946'], ['p', 'M10,50 C10,92 90,92 90,50 Z', '#FFFFFF']],
    dessert: [['p', 'M28,56 L72,56 L66,90 L34,90 Z', 'a'], ['p', 'M24,58 C20,40 36,30 50,30 C64,30 80,40 76,58 Z', '#FDE2E4'], ['p', 'M36,36 C40,20 60,20 64,36 Z', '#FAD2D8'], ['c', 50, 16, 6, '#D90429']],
    sandwich: [['p', 'M8,50 C8,30 20,26 34,26 L66,26 C80,26 92,30 92,50 Z', '#C5833F'], ['r', 6, 49, 88, 7, 3, '#4FA83D'], ['r', 8, 55, 84, 8, 3, '#F2A3A6'], ['r', 10, 62, 80, 5, 0, '#F7C744'], ['r', 6, 67, 88, 16, 8, '#CF9450']],
    burrito: [['p', 'M22,74 L70,30 Q82,22 88,34 Q92,44 82,52 L34,88 Q22,94 16,84 Q12,78 22,74 Z', '#F3D9A4'], ['p', 'M70,30 Q82,22 88,34 Q92,44 82,52 Z', '#C9CED6'], ['e', 22, 80, 8, 12, '#8B3A1E']],
    coffee: [['p', 'M22,34 H74 V74 Q74,90 58,90 H38 Q22,90 22,74 Z', 'a'], ['s', 'M74,44 Q90,44 90,58 Q90,70 74,70', 'a', 8], ['e', 48, 36, 24, 5, '#5A3826'], ['s', 'M40,26 C34,18 46,12 40,4', '#FFFFFF', 4], ['s', 'M54,26 C48,18 60,12 54,4', '#FFFFFF', 4]],
  };
  function icon(kind, cx, cy, size, a) {
    const L = IC[kind] || IC.burger; if (VID.collecting) return; const c = G(), s = size / 100; c.globalAlpha = a; c.translate(cx - size / 2, cy - size / 2); c.scale(s, s);
    for (const it of L) { const col = it[it.length - 1] === 'a' ? OR : it[it.length - 1];
      if (it[0] === 'p') { c.fillStyle = col; c.fill(new Path2D(it[1])); } else if (it[0] === 's') { c.strokeStyle = it[2] === 'a' ? OR : it[2]; c.lineWidth = it[3]; c.lineCap = 'round'; c.stroke(new Path2D(it[1])); }
      else if (it[0] === 'r') { c.fillStyle = col; c.beginPath(); c.roundRect(it[1], it[2], it[3], it[4], it[5]); c.fill(); } else if (it[0] === 'e') { c.fillStyle = col; c.beginPath(); c.ellipse(it[1], it[2], it[3], it[4], 0, 0, TAU); c.fill(); } else if (it[0] === 'c') { c.fillStyle = col; c.beginPath(); c.arc(it[1], it[2], it[3], 0, TAU); c.fill(); } }
    D();
  }
  const COMBO = { burgers: [['Smash burger', '$9', 'burger'], ['Fries', '$4', 'fries'], ['Soda', '$3', 'drink'], '$16', '$11.99', 'SAVE $4'], pizza: [['Large pizza', '$18', 'pizza'], ['Wings (8)', '$11', 'wings'], ['2-liter', '$4', 'drink'], '$33', '$25', 'SAVE $8'],
    tacos: [['3 Tacos', '$9', 'taco'], ['Chips & salsa', '$4', 'chips'], ['Horchata', '$4', 'drink'], '$17', '$12', 'SAVE $5'], mexican: [['Burrito', '$12', 'burrito'], ['Chips & guac', '$6', 'chips'], ['Margarita', '$8', 'drink'], '$26', '$19', 'SAVE $7'],
    italian: [['Any pasta', '$17', 'pasta'], ['Caesar salad', '$9', 'salad'], ['Tiramisu', '$8', 'dessert'], '$34', '$26', 'SAVE $8'], sandwiches: [['Any sub', '$11', 'sandwich'], ['Chips', '$2', 'chips'], ['Fountain drink', '$3', 'drink'], '$16', '$11.99', 'SAVE $4'],
    restaurant: [['3 Tacos', '$10', 'taco'], ['Chips & salsa', '$5', 'chips'], ['Agua fresca', '$4', 'drink'], '$19', '$14', 'SAVE $5'] };
  const ICON_OPTS = opts([['burger', 'Burger'], ['fries', 'Fries'], ['drink', 'Drink'], ['taco', 'Taco'], ['chips', 'Chips & salsa'], ['pizza', 'Pizza slice'], ['wings', 'Wings'], ['pasta', 'Pasta'], ['salad', 'Salad'], ['dessert', 'Dessert'], ['sandwich', 'Sandwich'], ['burrito', 'Burrito'], ['coffee', 'Coffee']]);
  function combox() {
    const Cd = COMBO[IND] || COMBO.restaurant;
    const TITLE = TX('title', 'Make it a *combo.*', { label: 'Headline', group: 'Words', max: 26, hint: 'Wrap a word in *stars* to colour it.' });
    const NIT = +TX('count', '3', { label: 'Items', group: 'Items', options: opts([['2', '2 items'], ['3', '3 items']]) });
    const IT = [0, 1, 2].slice(0, NIT).map(k => ({ name: TX('n' + (k + 1), Cd[k][0], { label: 'Item ' + (k + 1), group: 'Items', max: 18 }), price: TX('pr' + (k + 1), Cd[k][1], { label: 'Item ' + (k + 1) + ' price', group: 'Items', max: 8 }), icon: TX('ic' + (k + 1), Cd[k][2], { label: 'Item ' + (k + 1) + ' icon', group: 'Items', options: ICON_OPTS }) })).filter(i => i.name);
    const SEP = off(TX('sep', Cd[3], { label: 'Total if bought separately', group: 'Price', max: 10, hint: DASH })), LBL = TX('lbl', 'COMBO PRICE', { label: 'Combo label', group: 'Price', upper: true, max: 16 });
    const PRICE = TX('price', Cd[4], { label: 'Combo price', group: 'Price', max: 10 }), SAVE = off(TX('save', Cd[5], { label: 'Sticker', group: 'Price', upper: true, max: 12, hint: DASH }));
    const END = TX('end', 'Order the *combo.*', { label: 'Closing line', group: 'Ending', max: 28 });
    const n = Math.max(1, IT.length), D0 = n === 3 ? 236 : 280, GAP = n === 3 ? 96 : 120, rowW = n * D0 + (n - 1) * GAP, x0 = W / 2 - rowW / 2, CY = 680;
    const at = i => 0.5 + i * 0.32, MERGE = at(3) + 0.35, SLAM = MERGE + 0.5, OUT = 6.2, DUR = OUT + 4.2;   // fixed beats for 1–3 items (one soundtrack)
    const comboPf = F(900, Math.min(170, fitSize(PRICE, 900, 640, 170, 'Mont', -4)), 'Mont'), comboPw = Math.max(textW(PRICE, comboPf, -4), textW(LBL, F(700, 30, 'Mono'), 6)) + 140;
    function elements() {
      const tiP = posOf(elP('title'), [W / 2, 330]);
      const seP = posOf(elP('separately'), [W / 2, 985]);
      const cbP = posOf(elP('combo'), [W / 2 - comboPw / 2, 1185 - 120]);
      const els = [];
      if (TITLE) els.push({ id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.05, d: OUT - 0.05, box: [tiP[0] - 470, tiP[1] - 60, 940, 120], dup: false, del: false });
      IT.forEach((it, i) => { const cx = x0 + i * (D0 + GAP) + D0 / 2, cp = posOf(elP('item' + (i + 1)), [cx - D0 / 2, CY - D0 / 2]); els.push({ id: 'item' + (i + 1), kind: 'card', label: it.name, x: cp[0], y: cp[1], w: D0, h: D0, t0: at(i), d: OUT - at(i), box: [cp[0], cp[1], D0, D0], dup: false, del: false }); });
      if (SEP) els.push({ id: 'separately', kind: 'pos', label: 'Separately ' + SEP, x: seP[0], y: seP[1], t0: MERGE - 0.2, d: OUT - (MERGE - 0.2), box: [seP[0] - 300, seP[1] - 50, 600, 80], dup: false, del: false });
      els.push({ id: 'combo', kind: 'box', label: LBL + ' ' + PRICE, x: cbP[0], y: cbP[1], w: comboPw, h: 240, t0: SLAM, d: OUT - SLAM, box: [cbP[0], cbP[1], comboPw, 240], dup: false, del: false });
      return els;
    }
    return {
      dur: DUR, shakes: [[SLAM, 12]], elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = 1 - q, hud = E.outC(seg(t, MERGE, 0.4));
          { const [tix, tiy] = posOf(elP('title'), [W / 2, 330]); head(TITLE, t, 0.05, tiy, { q, max: 100, x: tix }); }
          IT.forEach((it, i) => {
            const k = E.outBack(seg(t, at(i), 0.5)), from = [-900, 900, -900][i % 3], cx = x0 + i * (D0 + GAP) + D0 / 2, cy = CY + (1 - k) * from + Math.sin((t - MERGE) * 3 + i) * 6 * hud, [ix0, iy0] = posOf(elP('item' + (i + 1)), [cx - D0 / 2, cy - D0 / 2]), ix = ix0 + D0 / 2, iy = iy0 + D0 / 2;
            if (k <= 0 || VID.collecting) return; const c = G(); c.globalAlpha = clamp(k * 2) * a; c.translate(ix, iy); c.rotate((1 - k) * (i % 2 ? 0.5 : -0.5));
            c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40; c.shadowOffsetY = 20; c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(0, 0, D0 / 2, 0, TAU); c.fill(); c.shadowBlur = 0; c.shadowOffsetY = 0; c.strokeStyle = ORA(0.35); c.lineWidth = 10; c.stroke(); D();
            icon(it.icon, ix, iy, D0 * 0.72, clamp(k * 2) * a);
            const tf = F(800, Math.min(36, fitSize(it.name, 800, D0 + 40, 36, 'Mont')), 'Mont'); T([[it.name, WHT]], ix, CY + D0 / 2 + 62, tf, { align: 'center', p: seg(t, at(i) + 0.25, 0.4), q });
            if (it.price && !VID.collecting) { const c2 = G(), pf = F(700, 32, 'Mont'), pw = textW(it.price, pf, 0); c2.globalAlpha = fa(t, at(i) + 0.3, 0.4) * a; setF(pf, 0); c2.fillStyle = WA(0.6); c2.textAlign = 'center'; c2.fillText(it.price, ix, CY + D0 / 2 + 112); const u = seg(t, MERGE, 0.3); if (u > 0) { c2.strokeStyle = '#FF4D4D'; c2.lineWidth = 5; c2.beginPath(); c2.moveTo(ix - pw / 2 - 6, CY + D0 / 2 + 101); c2.lineTo(ix - pw / 2 - 6 + (pw + 12) * u, CY + D0 / 2 + 101); c2.stroke(); } D(); }
          });
          for (let i = 0; i < n - 1; i++) { const k = E.outBack(seg(t, at(i + 1) + 0.15, 0.3)) * a; if (k <= 0 || VID.collecting) continue; const c = G(), x = x0 + (i + 1) * (D0 + GAP) - GAP / 2; c.translate(x, CY); c.scale(k, k); c.fillStyle = OR; c.beginPath(); c.arc(0, 0, 38, 0, TAU); c.fill(); c.strokeStyle = onCol(OR); c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(-15, 0); c.lineTo(15, 0); c.moveTo(0, -15); c.lineTo(0, 15); c.stroke(); D(); }
          if (SEP && !VID.collecting) { const c = G(), f = F(700, 40, 'Mont'), s = 'Separately ' + SEP, tw = textW(s, f, 0), [sex, sey] = posOf(elP('separately'), [W / 2, 985]); c.globalAlpha = fa(t, MERGE - 0.2, 0.4) * a; setF(f, 0); c.fillStyle = WA(0.6); c.textAlign = 'center'; c.fillText(s, sex, sey); const u = seg(t, MERGE + 0.1, 0.3); c.strokeStyle = '#FF4D4D'; c.lineWidth = 6; c.beginPath(); c.moveTo(sex - tw / 2 - 8, sey - 13); c.lineTo(sex - tw / 2 - 8 + (tw + 16) * u, sey - 13); c.stroke(); D(); }
          const sl = seg(t, SLAM, 0.4); if (sl > 0 && !VID.collecting) { const c = G(), s = lerp(1.8, 1, E.outBack(sl)), pw = comboPw, pf = comboPf, [cbx, cby] = posOf(elP('combo'), [W / 2 - comboPw / 2, 1185 - 120]);
            c.globalAlpha = clamp(sl * 4) * a; c.translate(cbx + comboPw / 2, cby + 120); c.scale(s, s); c.fillStyle = OR; c.shadowColor = ORA(0.45); c.shadowBlur = 60; c.beginPath(); c.roundRect(-pw / 2, -120, pw, 240, 40); c.fill(); c.shadowBlur = 0;
            setF(F(700, 30, 'Mono'), 6); c.fillStyle = onCol(OR); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(LBL, 0, -62); setF(pf, -4); c.fillText(PRICE, 0, 80);
            if (SAVE) { const sp = E.outBack(seg(t, SLAM + 0.35, 0.35)); if (sp > 0) { c.translate(pw / 2 - 10, -110); c.rotate(0.25); c.scale(sp, sp); const sf = F(900, 38, 'Mont'), sw = textW(SAVE, sf, 0) + 48; c.fillStyle = '#FF3B3B'; c.beginPath(); c.roundRect(-sw / 2, -34, sw, 68, 16); c.fill(); setF(sf, 0); c.fillStyle = '#FFFFFF'; c.textBaseline = 'middle'; c.fillText(SAVE, 0, 2); } } D(); }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.05, 0.25, 0]]; [0, 1, 2].forEach(i => ev.push(['whoosh', at(i), 0.25, i % 2 ? 0.3 : -0.3], ['thud', at(i) + 0.3, 0.28, 0], ['pop', at(i) + 0.45, 0.2, 0]));
        ev.push(['swish', MERGE, 0.25, 0], ['impact', SLAM, 0.45, 0], ['register', SLAM + 0.1, 0.3, 0], ['pop', SLAM + 0.35, 0.3, 0.3]); closeCues(ev, OUT);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ THE THERMOSTAT
  const FROST = (() => { const out = []; const arm = (x, y, ang, len, depth, seed) => { const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len; out.push([x, y, x2, y2]); if (depth > 0) for (let k = 1; k <= 3; k++) { const u = k / 4, bx = x + Math.cos(ang) * len * u, by = y + Math.sin(ang) * len * u, bl = len * (0.42 - u * 0.1) * (0.8 + hash(seed + k * 7 + depth) * 0.4); arm(bx, by, ang + 0.75, bl, depth - 1, seed + k); arm(bx, by, ang - 0.75, bl, depth - 1, seed + k * 3); } };
    [0.25, 0.55, 0.85].forEach((u, i) => arm(0, 0, (Math.PI / 2) * u, 260 - i * 30, 2, i * 11)); return out; })();
  function thermox() {
    const MODE = TX('mode', 'cool', { label: 'Mode', group: 'Temperature', options: opts([['cool', 'Cooling (frost creeps in)'], ['heat', 'Heating (warm glow)']]) });
    const cool = MODE === 'cool';
    const FROM = num(TX('from', cool ? '91' : '58', { label: 'Starting temperature', group: 'Temperature', max: 4 }), cool ? 91 : 58), TO = num(TX('to', cool ? '72' : '70', { label: 'Target temperature', group: 'Temperature', max: 4 }), cool ? 72 : 70);
    const STATUS = TX('status', cool ? 'COOLING' : 'HEATING', { label: 'Status', group: 'Temperature', upper: true, max: 14 });
    const TITLE = TX('title', cool ? 'Too *hot* inside?' : 'Cold house? *Fixed.*', { label: 'Headline', group: 'Words', max: 26, hint: 'Wrap a word in *stars* to colour it.' });
    const SUB = off(TX('sub', 'Back to *comfort.*', { label: 'Line under the dial', group: 'Words', max: 34, hint: DASH }));
    const END = TX('end', cool ? 'Stay *cool.*' : 'Stay *warm.*', { label: 'Closing line', group: 'Ending', max: 28 });
    const T0 = 0.6, T1 = 3.2, SUBT = 3.4, OUT = 6.4, DUR = OUT + 4.2, CX = 540, CY = 780, R = 290;
    const WARM = '#FF6B35', COOLC = '#4CC9F0', c0 = cool ? WARM : COOLC, c1 = cool ? COOLC : WARM;
    const mix = (a, b, u) => { const p = h => [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16)), A = p(a), B = p(b); return '#' + A.map((x, k) => Math.round(x + (B[k] - x) * u).toString(16).padStart(2, '0')).join(''); };
    const lo = Math.min(FROM, TO) - 8, hi = Math.max(FROM, TO) + 8, ang = v => ((135 + ((v - lo) / (hi - lo)) * 270) * Math.PI) / 180;
    const DIAL0 = [CX - (R + 46), CY - (R + 46), (R + 46) * 2, (R + 46) * 2];
    const DIAL = (EL && EL.box) ? [elNum(EL.box.x, DIAL0[0]), elNum(EL.box.y, DIAL0[1]), elNum(EL.box.w, DIAL0[2]), elNum(EL.box.h, DIAL0[3])] : DIAL0;
    function elements() {
      const tiP = posOf(elP('title'), [W / 2, 340]);
      const suP = posOf(elP('sub'), [CX, CY + R + 150]);
      const els = [
        { id: 'dial', kind: 'box', label: 'Thermostat dial', x: DIAL[0], y: DIAL[1], w: DIAL[2], h: DIAL[3], t0: 0.05, d: OUT - 0.05, box: [DIAL[0], DIAL[1], DIAL[2], DIAL[3]], dup: false, del: false },
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.1, d: OUT - 0.1, box: [tiP[0] - 470, tiP[1] - 60, 940, 120], dup: false, del: false },
      ];
      if (SUB) els.push({ id: 'sub', kind: 'pos', label: SUB, x: suP[0], y: suP[1], t0: SUBT, d: OUT - SUBT, box: [suP[0] - 400, suP[1] - 50, 800, 100], dup: false, del: false });
      return els;
    }
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = 1 - q, k = E.inOutC(seg(t, T0, T1 - T0)), temp = lerp(FROM, TO, k), cur = mix(c0, c1, k), dial = E.outBack(seg(t, 0.05, 0.6)), DCX = DIAL[0] + DIAL[2] / 2, DCY = DIAL[1] + DIAL[3] / 2;
          if (!VID.collecting) { const c = G(), g = c.createRadialGradient(DCX, DCY, 60, DCX, DCY, 900); g.addColorStop(0, rgbaOf(cur, 0.3 * a)); g.addColorStop(1, rgbaOf(cur, 0)); c.fillStyle = g; c.fillRect(0, 0, W, H); D(); }
          if (cool && !VID.collecting && k > 0) { const c = G(); c.strokeStyle = 'rgba(230,247,255,0.55)'; c.lineWidth = 4; c.lineCap = 'round'; c.globalAlpha = a;
            [[0, 0, 0], [W, 0, Math.PI / 2], [W, H, Math.PI], [0, H, -Math.PI / 2]].forEach(([x, y, rot]) => { c.save(); c.translate(x, y); c.rotate(rot); const nn = Math.floor(FROST.length * k); c.beginPath(); for (let i = 0; i < nn; i++) { const s = FROST[i]; c.moveTo(s[0], s[1]); c.lineTo(s[2], s[3]); } c.stroke(); c.restore(); }); D(); }
          if (!cool && !VID.collecting) { const c = G(), pu = 0.5 + 0.5 * Math.sin(t * 3); c.globalAlpha = k * a * (0.5 + 0.3 * pu); const g = c.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); g.addColorStop(0, 'rgba(255,107,53,0)'); g.addColorStop(1, 'rgba(255,107,53,0.45)'); c.fillStyle = g; c.fillRect(0, 0, W, H); D(); }
          { const [tix, tiy] = posOf(elP('title'), [W / 2, 340]); head(TITLE, t, 0.1, tiy, { q, max: 96, hl: WARM, x: tix }); }
          if (!VID.collecting && dial > 0) { const c = G(); c.globalAlpha = clamp(dial * 2) * a; c.translate(DCX, DCY); c.scale(0.6 + 0.4 * dial, 0.6 + 0.4 * dial);
            c.fillStyle = '#0E1117'; c.beginPath(); c.arc(0, 0, R + 46, 0, TAU); c.fill(); c.strokeStyle = '#2A2F3A'; c.lineWidth = 4; c.stroke(); c.fillStyle = '#12161E'; c.beginPath(); c.arc(0, 0, R - 40, 0, TAU); c.fill();
            const a0 = ang(FROM), a1 = ang(temp);
            for (let i = 0; i < 55; i++) { const an = ((135 + (i / 54) * 270) * Math.PI) / 180, on = an >= Math.min(a0, a1) - 0.01 && an <= Math.max(a0, a1) + 0.01, major = i % 6 === 0, r1 = R - (major ? 26 : 12), r2 = R + 16;
              c.strokeStyle = on ? cur : '#2F3542'; c.lineWidth = major ? 7 : 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(Math.cos(an) * r1, Math.sin(an) * r1); c.lineTo(Math.cos(an) * r2, Math.sin(an) * r2); c.stroke(); }
            c.fillStyle = cur; c.shadowColor = cur; c.shadowBlur = 20; c.beginPath(); c.arc(Math.cos(a1) * (R - 64), Math.sin(a1) * (R - 64), 18, 0, TAU); c.fill(); c.shadowBlur = 0;
            const done = seg(t, T1, 0.3), bump = 1 + 0.06 * Math.sin(done * Math.PI); c.scale(bump, bump); setF(F(900, 230, 'Mont'), -8); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; const s = String(Math.round(temp)), tw = textW(s, F(900, 230, 'Mont'), -8); c.fillText(s, -18, 70); setF(F(900, 110, 'Mont'), 0); c.fillStyle = cur; c.textAlign = 'left'; c.fillText('°', tw / 2 - 14, -20);
            c.setTransform(1, 0, 0, 1, SH.x, SH.y); c.globalAlpha = fa(t, 0.4, 0.4) * a; setF(F(700, 32, 'Mono'), 8); c.fillStyle = cur; c.textAlign = 'center'; c.fillText(STATUS, DCX, DCY + 150); if (Math.floor(t * 2) % 2) { c.beginPath(); c.arc(DCX + textW(STATUS, F(700, 32, 'Mono'), 8) / 2 + 24, DCY + 139, 8, 0, TAU); c.fill(); } D(); }
          { const [sux, suy] = posOf(elP('sub'), [DCX, DCY + R + 150]); head(SUB, t, SUBT, suy, { q, max: 64, w: 800, hl: c1, x: sux }); }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END, hl: c1 });
      },
      cues() { const ev = [['whoosh', 0.05, 0.22, 0], ['switch', 0.4, 0.3, 0], ['air', T0, 0.25, 0], ['ticks', T0, 0.18, 0, { dur: T1 - T0, n: Math.min(30, Math.abs(TO - FROM)) }], ['chime', T1, 0.3, 0], ['swish', SUBT, 0.2, 0]];
        if (cool) ev.push(['shimmer', T0 + 0.6, 0.15, 0]); closeCues(ev, OUT); return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  const MAKE = { bax, chalkx, herox, specialx, combox, thermox };
  const PP = (MAKE[V] || bax)();
  DIR = { dur: PP.dur, bg: BLK, bgSwap: true, finish: { vig: 0.22, grain: 0.14 }, edl: [], shakes: PP.shakes, preload: PP.preload || (() => K3.init()), render: PP.render, cues: PP.cues, fam: V,
    ...(PP.elements ? { elements: PP.elements } : {}),
    setup() { if (!window.STUDIO && LIGHTPAL) { const w = IMG.logoW; IMG.logoW = IMG.logoB; IMG.logoB = w; } } };
});
