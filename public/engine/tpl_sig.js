'use strict';
/* Signature formats (V11, Oct 30): the formats that won for DPG, rebuilt so any business can use them with its own photos and
   clips. They use the brand's own look, cut on the beat, keep every line of text inside the TikTok / Reels safe zone
   (y 300-1420, x 90-990), show footage whole (a soft blurred copy fills the gaps; DPG gets its dark background instead),
   and pick their starting copy from the brand's industry (restaurants, real estate, home services, beauty, automotive,
   events, retail, professional, or a general set). Starting copy is sample text: numbers, comments and offers are never
   invented (a "+ ADD" marker shows until they are typed). Backgrounds can be swapped (BACKDROP).
   ?v=wall      Video Wall         a wall of moving tiles around a brand band; one tile cuts on every beat; a loopable 20 s
   ?v=pick      Pick a Number      six numbered options; "which one would you pick? comment your number"
   ?v=day       A Day in the Life  a timestamp rolls through the day, one caption per hour, a sun arc moving overhead
   ?v=oneword   One Word           eight shots, one giant word each, on the bar
   ?v=pov       POV                boxed captions word by word over four shots ("POV: ...")
   ?v=notes     How It Works       four steps, a handwritten note and arrow on each, a progress line
   ?v=numbers   By the Numbers     three big numbers count up over the footage (the brand's own figures)
   ?v=spotlight Service Spotlight  the service name filled with footage, a stacked headline, feature tags
   ?v=rate      Rate This          "rate this 1-10", a meter sweeping, "drop your rating"
   ?v=reply     Comment Reply      a viewer's comment pinned on screen, the answer captioned over the footage
   ?v=episode   Episode            a repeatable series frame: episode number, series name, one lesson, "follow for the next one"
   ?v=loop      Seamless Loop      eight shots pushing into each other on the bar, the last runs into the first; no end card */
STUDIO_REG['sig'] = (() => {
  const V = QS.get('v') || 'wall';
  const MUS = { wall: ['pulse', 120], pick: ['bounce', 124], day: ['day', 96], oneword: ['drive', 100], pov: ['lofi', 88], notes: ['indie', 100], numbers: ['build', 120],
    spotlight: ['boom', 96], rate: ['bounce', 124], reply: ['lofi', 88], episode: ['minimal', 104], loop: ['pulse', 120] }[V] || ['pulse', 120];
  const BPM = MUS[1], BT = 60 / BPM, BAR = 4 * BT;
  const G = K3.G, D = K3.D, up = K7.up, seg = K7.seg, TAU = Math.PI * 2;
  const DPG = K5.isDPG();
  // Per-element model: tpl_free sets window.__NX_BLOCK_EL to the block's `el` data before calling this
  // factory; positions below fall back to the original hardcoded values when EL is null, so rendering
  // is byte-for-byte the old path. (Same pattern as tpl_trade.js / tpl_nx9.js.)
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const SECT = { restaurant: 'food', realestate: 'estate', hardscape: 'home', fencing: 'home', landscaping: 'home', roofing: 'home', cleaning: 'home', pressure: 'home', barbershop: 'beauty', salon: 'beauty', detailing: 'auto', events: 'hosp', retail: 'retail', pro: 'pro' };
  const SEC = QS.get('ind') ? (SECT[QS.get('ind')] || QS.get('ind')) : (SECT[BRAND.industry] || (BRAND.parts ? 'home' : 'general'));
  const pk = P => P[SEC] || P.general;
  const SZ = { top: 300, bot: 1420, l: 90, r: 990 };
  const NONE = k => ['nofoot.' + k, 0];
  function shots(list, t0) {
    const S = K3.shots(list.map(([k, label, d, ph]) => { const s = SHOT(k, NONE(k), { label, group: 'Footage', kind: 'any', ph: ph || 'v', d: d + 0.3 }); return [s[0], s[1], d]; }));
    S.forEach(s => (s.start += t0 || 0)); return S;
  }
  const vert = s => K7.isVert(s.c);
  const musicBed = (dur, o) => ['music', 0, dur, 0.95, Object.assign({ style: MUS[0], bpm: BPM, key: 0, end: dur - 0.6 }, o || {})];
  function shade(y0, y1, a0, a1) { if (VID.collecting) return; const c = G(), g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(0,0,0,' + a0 + ')'); g.addColorStop(1, 'rgba(0,0,0,' + a1 + ')'); c.fillStyle = g; c.fillRect(-20, y0, W + 40, y1 - y0); D(); }
  const L8 = o => Object.assign({ kind: 'text', style: 'type', x: 540, y: 960, t0: 0, d: 3, color: 'white', w: 900 }, o);
  function type(L, t) { const lt = t - L.t0; if (lt < 0 || lt >= L.d || !L.text) return; const s = K8.xf(L, lt); K8.withLayer(s, K8.box(L), () => K8.type(L, t, s)); }
  function gfx(L, t) { const lt = t - L.t0; if (lt < 0 || lt >= L.d) return; const e = K9.EL[L.type]; if (!e) return; const s = K8.xf(L, lt);
    if (e.full) { if (VID.collecting) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= s.op; K9.draw(L, t, s); ctx.restore(); } else K8.withLayer(s, K9.box(L), () => K9.draw(L, t, s)); }
  function cut(id, t, tc, d, A, B, o) { const u = (t - (tc - d / 2)) / d; if (u <= 0) A(); else if (u >= 1) B(); else KT.run(id, u, A, B, Object.assign({ t }, o || {})); }
  const fa = (t, t0, d) => E.outC(seg(t, t0, d || 0.5));
  const bg = () => BACKDROP(() => { if (VID.collecting) return; const c = G(), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, DEEP1); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); });
  // a shot whole inside r at time t (clip time from lt); the rest of r is a soft blurred copy of the same shot (DPG: its dark background)
  function whole(s, t, r, o) {
    o = o || {}; const lt = Math.max(0, o.lt !== undefined ? o.lt : t - (s.start || 0)), w = K3.wholeIn(s.c, r), a = o.alpha === undefined ? 1 : o.alpha;
    if (Math.abs(w[2] - r[2]) + Math.abs(w[3] - r[3]) > 6) {
      ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.rect(r[0] + SH.x, r[1] + SH.y, r[2], r[3]); ctx.clip(); }
      if (DPG || o.noFill) { if (!VID.collecting) { ctx.globalAlpha = a; ctx.fillStyle = DEEP2; ctx.fillRect(r[0] + SH.x, r[1] + SH.y, r[2], r[3]); } }
      else K3.clip(s.c, s.in, lt, [r[0] - 30, r[1] - 30, r[2] + 60, r[3] + 60], { alpha: a, filter: 'blur(26px) brightness(0.55)' });
      ctx.restore();
    }
    K3.clip(s.c, s.in, lt, w, { alpha: a }); return w;
  }
  const full = (s, t, o) => whole(s, t, [0, 0, W, H], o);
  // the close: logo, an ending line, the brand's call to action, contact, the licence line (DPG: CA LIC. #1073434)
  function close(t, OUT, o) {
    o = o || {}; const ot = t - OUT, y = o.y || 600, [lw, lh] = logoBox(o.lw || 600), lp = seg(ot, 0.15, 0.5);
    if (lp > 0 && !VID.collecting) { const c = G(), s = lerp(1.12, 1, E.outBack(clamp(lp))); c.globalAlpha = clamp(lp * 2.5); c.translate(W / 2, y); c.scale(s, s); c.drawImage(IMG.logoW, -lw / 2, -lh / 2, lw, lh); D(); }
    if (o.line) { const [enx, eny] = posOf(elP('end'), [540, y + lh / 2 + 140]); type(L8(Object.assign({ text: o.line, slot: 'Bebas', size: 104, w: 960, x: enx, y: eny, t0: OUT + 0.6, d: 30, anim: { in: 'wordup' } }, o.lineL || {})), t); }
    const cy = y + lh / 2 + (o.gap || 330), [ctx2, cty] = posOf(elP('cta'), [540, cy]); gfx({ kind: 'mg', type: 'cta', text: CONTACT.cta, color: 'accent', x: ctx2, y: cty, t0: OUT + 1.2, d: 30 }, t);
    const [cox, coy] = posOf(elP('endcontact'), [540, cy + 150]); K7.txt(K7.contact().join('   ·   '), cox, coy, F(700, 28, 'Mont'), WA(0.85), { align: 'center', a: fa(ot, 1.8, 0.4), ls: 3 });
    if (CONTACT.lic) { const [lx, ly] = posOf(elP('lic'), [540, cy + 200]); K7.txt(CONTACT.lic, lx, ly, F(600, 22, 'Mont'), WA(0.6), { align: 'center', a: fa(ot, 1.9, 0.4), ls: 3 }); }
  }
  // descriptors for the shared close() (ending line, CTA, contact line, licence) — same defaults as close() draws
  function closeEls(OUT, DUR, line) {
    const lh = logoBox(600)[1], cy = 600 + lh / 2 + 330;
    const enP = posOf(elP('end'), [540, 600 + lh / 2 + 140]), ctP = posOf(elP('cta'), [540, cy]), coP = posOf(elP('endcontact'), [540, cy + 150]);
    const els = [
      { id: 'end', kind: 'pos', label: line || 'Ending line', x: enP[0], y: enP[1], t0: OUT + 0.6, d: DUR - (OUT + 0.6), box: [enP[0] - 470, enP[1] - 50, 940, 110], dup: false, del: false },
      { id: 'cta', kind: 'pos', label: CONTACT.cta || 'Call to action', x: ctP[0], y: ctP[1], t0: OUT + 1.2, d: DUR - (OUT + 1.2), box: [ctP[0] - 400, ctP[1] - 45, 800, 90], dup: false, del: false },
      { id: 'endcontact', kind: 'pos', label: 'Contact line', x: coP[0], y: coP[1], t0: OUT + 1.8, d: DUR - (OUT + 1.8), box: [coP[0] - 470, coP[1] - 40, 940, 80], dup: false, del: false },
    ];
    if (CONTACT.lic) { const liP = posOf(elP('lic'), [540, cy + 200]); els.push({ id: 'lic', kind: 'pos', label: CONTACT.lic, x: liP[0], y: liP[1], t0: OUT + 1.9, d: DUR - (OUT + 1.9), box: [liP[0] - 470, liP[1] - 30, 940, 60], dup: false, del: false }); }
    return els;
  }
  const endFade = (t, OUT, k) => { const q = seg(t, OUT - 0.1, 0.5) * (k === undefined ? 0.88 : k); if (q > 0 && !VID.collecting) fillScreen(BLK, q); };
  // boxed captions, word by word (the TikTok caption look): white boxes, dark text, lines wrapped to the safe width
  function boxCap(str, cx, y, t, t0, o) {
    if (VID.collecting || !str || t < t0) return; o = o || {}; const size = o.size || 54, f = F(800, size, 'Mont'), maxW = o.w || 860, words = str.split(/\s+/), st = o.stagger || 0.14, a = o.alpha === undefined ? 1 : o.alpha;
    const ls = []; let cur = []; setF(f, 0); for (const w of words) { const tr = cur.concat(w).join(' '); if (textW(tr, f, 0) > maxW && cur.length) { ls.push(cur); cur = [w]; } else cur.push(w); } if (cur.length) ls.push(cur);
    let k = 0; const lh = size * 1.32, c = G(); c.globalAlpha = a; c.textBaseline = 'middle';
    ls.forEach((ln, li) => { const shown = ln.filter((w, j) => t >= t0 + (k + j) * st), tx = shown.join(' '); k += ln.length; if (!shown.length) return; const tw = textW(tx, f, 0), ly = y + li * lh, bx = cx - tw / 2 - 22;
      c.fillStyle = '#FFFFFF'; c.beginPath(); c.roundRect(bx, ly - lh / 2 + 4, tw + 44, lh - 8, 12); c.fill(); setF(f, 0); c.textAlign = 'left'; let x = cx - tw / 2;
      shown.forEach((w, j) => { const hot = o.hot && li === 0 && j === 0; c.fillStyle = hot ? OR : '#111111'; c.fillText(w, x, ly + 2); x += textW(w + ' ', f, 0); }); });
    D(); }

  // ================================================================ VIDEO WALL / PICK A NUMBER
  // Moving tiles around a brand band. Landscape footage: a 2 x 4 wall of 16:9 tiles; mostly vertical footage: 3 x 2 tall tiles.
  // One tile cuts to the next clip on every beat, clockwise, so the wall never stops moving. Pick a Number: six fixed options
  // with numbers, a spotlight walking round them on the beat, "comment your number".
  function wallCore(PICK) {
    const P = PICK ? pk({ general: ['WHICH ONE WOULD YOU PICK?'], food: ['WHICH DISH WOULD YOU ORDER?'], estate: ['WHICH HOME WOULD YOU PICK?'], home: ['WHICH BACKYARD WOULD YOU PICK?'],
        beauty: ['WHICH LOOK WOULD YOU GET?'], auto: ['WHICH FINISH WOULD YOU PICK?'], hosp: ['WHICH SETUP WOULD YOU BOOK?'], retail: ['WHICH ONE WOULD YOU GRAB?'], pro: ['WHICH ONE SOUNDS LIKE YOU?'] })
      : pk({ general: ['OUR WORK', 'MADE WITH CARE', 'SEE WHAT WE DO', 'YOUR TURN NEXT'], food: ['ON THE MENU', 'COME HUNGRY', 'PULL UP A CHAIR', 'SEE YOU SOON'], estate: ['NOW SHOWING', 'FIND YOUR PLACE', 'HOMES WORTH SEEING', 'LET’S TOUR'],
        home: ['THE PORTFOLIO', 'BUILT FOR LIVING', 'SEE THE WORK', 'YOUR PROJECT NEXT'], beauty: ['THE LOOKBOOK', 'FRESH CUTS', 'FIND YOUR LOOK', 'BOOK YOUR CHAIR'], auto: ['IN THE BAY', 'SHINE ON', 'DETAILS MATTER', 'BOOK YOUR SLOT'],
        hosp: ['THE MOMENTS', 'CELEBRATE HERE', 'NIGHTS TO REMEMBER', 'SAVE THE DATE'], retail: ['THE COLLECTION', 'NEW IN', 'FIND YOUR FAVOURITE', 'COME SEE IT'], pro: ['BEHIND THE WORK', 'DONE PROPERLY', 'SEE HOW WE WORK', 'LET’S TALK'] });
    const KICK = PICK ? '' : TX('kick', P[0], { label: 'Small line', group: 'The band', upper: true, max: 22 });
    const HL = PICK ? [TX('q', P[0], { label: 'Question', group: 'The question', upper: true, max: 34 })] : [1, 2, 3].map(k => TX('h' + k, P[k], { label: 'Headline ' + k, group: 'The band', upper: true, max: 22 }));
    const SUBQ = PICK ? TX('sub', 'COMMENT YOUR NUMBER', { label: 'Line under it', group: 'The question', upper: true, max: 26 }) : '';
    const END = TX('end', PICK ? 'COMMENT YOUR NUMBER' : HL[2], { label: 'Ending line', group: 'Ending', upper: true, max: 24 });
    const NT = PICK ? 6 : 8, LOOPN = 8, OUT = 8 * BAR, DUR = OUT + 4;
    const S = shots(Array.from({ length: PICK ? 6 : 8 }, (x, k) => ['s' + (k + 1), (PICK ? 'Option ' : 'Tile clip ') + (k + 1), 6]), 0);
    const portrait = S.filter(vert).length > S.length / 2 && !PICK;
    // tile rects
    const TI = []; if (PICK) { const tw = 516, th = 272, x0 = 18, y0 = 600; for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) TI.push([x0 + c * (tw + 12), y0 + r * (th + 12), tw, th]); }
    else if (portrait) { const tw = 344, th = 612; [[120], [1176]].forEach(([y], r) => { for (let c = 0; c < 3; c++) TI.push([12 + c * (tw + 12), y, tw, th]); }); }
    else { const tw = 520, th = 293, ys = [140, 445, 1182, 1487]; for (const y of ys) for (let c = 0; c < 2; c++) TI.push([14 + c * (tw + 12), y, tw, th]); }
    const ORDER = PICK ? [0, 1, 3, 5, 4, 2] : portrait ? [0, 1, 2, 5, 4, 3] : [0, 1, 3, 5, 7, 6, 4, 2];   // clockwise
    const nT = TI.length, BAND = PICK ? null : (EL && EL.box ? [num(EL.box.x, 0), num(EL.box.y, 750), num(EL.box.w, W), num(EL.box.h, 420)] : [0, 750, W, 420]);
    TI.forEach((r, i) => { const p = posOf(elP('tile' + (i + 1)), [r[0], r[1]]); r[0] = p[0]; r[1] = p[1]; });
    function elements() {
      const tiles = TI.map((r, i) => ({ id: 'tile' + (i + 1), kind: 'box', label: 'Tile ' + (i + 1), x: r[0], y: r[1], w: r[2], h: r[3], t0: 0, d: DUR, box: [r[0], r[1], r[2], r[3]], dup: false, del: false }));
      if (PICK) {
        const badges = TI.map((r, i) => { const bp = posOf(elP('badge' + (i + 1)), [r[0] + 46, r[1] + 46]); return { id: 'badge' + (i + 1), kind: 'pos', label: 'Number ' + (i + 1), x: bp[0], y: bp[1], t0: 0.6 + ORDER.indexOf(i) * BT, d: OUT - (0.6 + ORDER.indexOf(i) * BT), box: [bp[0] - 40, bp[1] - 40, 80, 80], dup: false, del: false }; });
        const qP = posOf(elP('question'), [540, 400]), sP = posOf(elP('sub'), [540, 540]);
        return [...tiles, ...badges,
          { id: 'question', kind: 'pos', label: HL[0], x: qP[0], y: qP[1], t0: 0.2, d: OUT - 0.2, box: [qP[0] - 470, qP[1] - 60, 940, 120], dup: false, del: false },
          { id: 'sub', kind: 'pos', label: SUBQ || 'Line under it', x: sP[0], y: sP[1], t0: 0.9, d: OUT - 0.9, box: [sP[0] - 450, sP[1] - 40, 900, 80], dup: false, del: false },
          ...closeEls(OUT, DUR, END)];
      }
      const kiP = posOf(elP('kick'), [540, 806]), hlP = posOf(elP('headline'), [540, 1040]), coP = posOf(elP('contact'), [540, 1132]);
      return [...tiles,
        { id: 'band', kind: 'box', label: 'Brand band', x: BAND[0], y: BAND[1], w: BAND[2], h: BAND[3], t0: 0.3, d: OUT - 0.3, box: [BAND[0], BAND[1], BAND[2], BAND[3]], dup: false, del: false },
        { id: 'kick', kind: 'pos', label: KICK || 'Small line', x: kiP[0], y: kiP[1], t0: 0.8, d: OUT - 0.8, box: [kiP[0] - 450, kiP[1] - 30, 900, 60], dup: false, del: false },
        { id: 'headline', kind: 'pos', label: HL[0], x: hlP[0], y: hlP[1], t0: 1, d: OUT - 1, box: [hlP[0] - 470, hlP[1] - 60, 940, 120], dup: false, del: false },
        { id: 'contact', kind: 'pos', label: 'Contact line', x: coP[0], y: coP[1], t0: 1.4, d: OUT - 1.4, box: [coP[0] - 470, coP[1] - 40, 940, 80], dup: false, del: false },
        ...closeEls(OUT, DUR, END)];
    }
    const beatOf = t => Math.floor(t / BT);
    function tileClip(i, t) {   // which clip a tile shows and since when: tile ORDER[j] cuts on beats j, j+nT, j+2nT ...
      const j = ORDER.indexOf(i), b = beatOf(t), n = b < j ? 0 : Math.floor((b - j) / nT) + 1, since = n ? (j + (n - 1) * nT) * BT : 0;
      return { k: PICK ? i : (i + n) % S.length, since, n };
    }
    return {
      dur: DUR, loop: false, elements,
      render(t) {
        bg();
        TI.forEach((r, i) => {
          const p = E.outBack(seg(t, 0.05 + ORDER.indexOf(i) * 0.06, 0.45)); if (p <= 0) return;
          const { k, since, n } = tileClip(i, t), s = S[k], cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2, rr = [cx - r[2] * p / 2, cy - r[3] * p / 2, r[2] * p, r[3] * p];
          ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.roundRect(rr[0] + SH.x, rr[1] + SH.y, rr[2], rr[3], 14); ctx.clip(); }
          whole(s, t, rr, { lt: (t - since) + k * 0.7 }); ctx.restore();
          const flash = n && t - since < 0.18 ? 1 - (t - since) / 0.18 : 0, spot = PICK && ORDER[beatOf(t) % nT] === i && t < OUT;
          if (!VID.collecting && (flash > 0 || spot)) { const c = G(); c.strokeStyle = OR; c.lineWidth = spot ? 8 : 6; c.globalAlpha = spot ? 1 : flash; c.beginPath(); c.roundRect(rr[0] + 2, rr[1] + 2, rr[2] - 4, rr[3] - 4, 13); c.stroke(); D(); }
          if (PICK && !VID.collecting) { const np = E.outBack(seg(t, 0.6 + ORDER.indexOf(i) * BT, 0.35)); if (np > 0) { const c = G(), [bx, by] = posOf(elP('badge' + (i + 1)), [rr[0] + 46, rr[1] + 46]), sc = spot ? 1.15 : 1; c.translate(bx, by); c.scale(np * sc, np * sc); c.fillStyle = spot ? OR : '#FFFFFF'; c.beginPath(); c.arc(0, 0, 32, 0, TAU); c.fill();
            setF(F(400, 46, 'Bebas'), 0); c.fillStyle = spot ? K8.onCol(OR) : '#111111'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(i + 1), 0, 3); D(); } }
        });
        if (!PICK) {   // the brand band
          const bp = E.inOutC(seg(t, 0.3, 0.6)); if (bp > 0 && !VID.collecting) { const c = G(), h = BAND[3] * bp, y = BAND[1] + (BAND[3] - h) / 2; c.fillStyle = rgbaOf(DEEP2, 0.94); c.fillRect(0, y, W, h); c.fillStyle = OR; c.fillRect(0, y, W, 4); c.fillRect(0, y + h - 4, W, 4); D(); }
          if (t < OUT) { const [lw, lh] = logoBox(520), lp = fa(t, 0.6, 0.5), c = !VID.collecting && G(); if (c) { c.globalAlpha = lp; c.drawImage(IMG.logoW, W / 2 - lw / 2, 880 - lh / 2, lw, lh); D(); }
            const [kix, kiy] = posOf(elP('kick'), [540, 806]); K7.txt(KICK, kix, kiy, F(700, 26, 'Mont'), OR, { align: 'center', a: fa(t, 0.8), ls: 8 });
            const hi = Math.min(2, Math.floor(Math.max(0, t - 1) / (2 * BAR))); const [hlx, hly] = posOf(elP('headline'), [540, 1040]); type(L8({ text: HL[hi], slot: 'Bebas', size: 96, w: 960, color: 'white', anim: { in: 'wordup', inD: 0.4, out: 'fade', outD: 0.2 }, x: hlx, y: hly, t0: hi ? 1 + hi * 2 * BAR : 1.0, d: hi < 2 ? (hi ? 2 * BAR : 2 * BAR) : OUT }), t);
            const [cox, coy] = posOf(elP('contact'), [540, 1132]); K7.txt(K7.contact().join('   ·   '), cox, coy, F(700, 24, 'Mont'), WA(0.8), { align: 'center', a: fa(t, 1.4), ls: 3 }); }
        } else if (t < OUT) {
          const [qux, quy] = posOf(elP('question'), [540, 400]); type(L8({ text: HL[0], slot: 'Bebas', size: 92, w: 940, lead: 0.92, color: 'white', fx: { shadow: 'soft' }, anim: { in: 'wordup', out: 'fade', outD: 0.2 }, x: qux, y: quy, t0: 0.2, d: OUT }), t);
          const [sux, suy] = posOf(elP('sub'), [540, 540]); if (SUBQ) type(L8({ text: SUBQ + '  ↓', slot: 'Mont', wt: 800, size: 30, track: 200, color: K8.onCol(OR), fx: { deco: 'pill', dcol: 'accent' }, anim: { in: 'pop', out: 'fade', outD: 0.2, loop: 'pulse', loopAmt: 0.3 }, x: sux, y: suy, t0: 0.9, d: OUT }), t);
        }
        if (t >= OUT) { endFade(t, OUT); close(t, OUT, { y: 600, line: END }); }
      },
      cues() { const ev = [['whoosh', 0.05, 0.3, 0]]; for (let b = PICK ? 1 : 1; b < OUT / BT; b++) ev.push([PICK ? 'tick' : 'click', b * BT, PICK ? 0.22 : 0.18, ((b % 4) - 1.5) * 0.25]);
        if (PICK) for (let i = 0; i < 6; i++) ev.push(['pop', 0.6 + i * BT + 0.1, 0.25, 0]); ev.push(['impact', OUT, 0.4, 0], ['chime', OUT + 1.4, 0.16, 0]); return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ A DAY IN THE LIFE
  function day() {
    const PK = pk({
      general: [['7:00', 'AM', 'Doors open.'], ['9:30', 'AM', 'Heads down.'], ['12:15', 'PM', 'Quick lunch, back at it.'], ['3:00', 'PM', 'The busy stretch.'], ['6:30', 'PM', 'Wrapping up.'], ['8:45', 'PM', 'Ready for tomorrow.'], 'Every hour of the day, with you.'],
      food: [['5:45', 'AM', 'Ovens on before sunrise.'], ['9:30', 'AM', 'Prep for the day.'], ['11:30', 'AM', 'Doors open.'], ['1:00', 'PM', 'The lunch rush.'], ['6:30', 'PM', 'Dinner service.'], ['10:15', 'PM', 'Last plate out.'], 'From first light to last call.'],
      estate: [['7:00', 'AM', 'First coffee, first listing.'], ['9:30', 'AM', 'The walk-through.'], ['12:00', 'PM', 'A midday showing.'], ['3:30', 'PM', 'Open house.'], ['6:00', 'PM', 'Keys in hand.'], ['8:30', 'PM', 'Planning tomorrow.'], 'Every hour, a step closer home.'],
      home: [['6:58', 'AM', 'Coffee before anyone’s up.'], ['9:40', 'AM', 'Breakfast on the deck.'], ['12:45', 'PM', 'Lunch with a view.'], ['3:30', 'PM', 'The longest afternoon.'], ['6:20', 'PM', 'Oven’s hot.'], ['9:10', 'PM', 'One more game.'], 'Every hour of the day, outside.'],
      beauty: [['8:00', 'AM', 'Setting up the chairs.'], ['10:00', 'AM', 'First appointment.'], ['12:30', 'PM', 'The fade.'], ['3:00', 'PM', 'Colour time.'], ['6:00', 'PM', 'Last client of the day.'], ['8:00', 'PM', 'Clean slate.'], 'Every hour, a fresh look.'],
      auto: [['7:30', 'AM', 'Bay doors up.'], ['9:00', 'AM', 'The foam bath.'], ['11:30', 'AM', 'Clay and polish.'], ['2:00', 'PM', 'The shine.'], ['5:00', 'PM', 'Keys back.'], ['7:00', 'PM', 'Lights down.'], 'Every hour, a cleaner ride.'],
      hosp: [['10:00', 'AM', 'Setting the room.'], ['1:00', 'PM', 'Florals in.'], ['4:00', 'PM', 'Sound check.'], ['6:30', 'PM', 'Doors open.'], ['9:00', 'PM', 'The first dance.'], ['11:30', 'PM', 'Last song.'], 'Every hour, a memory.'],
      retail: [['8:30', 'AM', 'Fresh deliveries.'], ['10:00', 'AM', 'Doors open.'], ['12:30', 'PM', 'New arrivals out.'], ['3:00', 'PM', 'Styling the window.'], ['6:00', 'PM', 'Evening shoppers.'], ['8:00', 'PM', 'Lights off.'], 'Every hour, something new.'],
      pro: [['7:30', 'AM', 'Inbox zero.'], ['9:00', 'AM', 'First meeting.'], ['12:00', 'PM', 'Working lunch.'], ['2:30', 'PM', 'Deep work.'], ['5:00', 'PM', 'Client call.'], ['7:00', 'PM', 'Plan for tomorrow.'], 'Every hour, working for you.'] });
    const HS = PK.slice(0, 6).map(([tm, ap, cap], k) => ({ tm: TX('time' + (k + 1), tm, { label: 'Hour ' + (k + 1) + ' time', group: 'Hour ' + (k + 1), max: 5 }), ap: TX('ampm' + (k + 1), ap, { label: 'AM or PM', group: 'Hour ' + (k + 1), options: [{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }] }),
      cap: TX('cap' + (k + 1), cap, { label: 'Hour ' + (k + 1) + ' caption', group: 'Hour ' + (k + 1), max: 34 }) }));
    const END = TX('end', PK[6], { label: 'Closing line', group: 'Ending', max: 36 });
    const SD = 3.0, OUT = 6 * SD, DUR = OUT + 4.2;
    const S = shots(HS.map((h, k) => ['s' + (k + 1), 'Hour ' + (k + 1), SD + 0.4]), 0); S.forEach((s, k) => (s.start = k * SD));
    function elements() {
      const tmP = posOf(elP('time'), [506, 470]), caP = posOf(elP('caption'), [540, 566]);
      return [
        { id: 'time', kind: 'pos', label: 'Timestamp', x: tmP[0], y: tmP[1], t0: 0, d: OUT, box: [tmP[0] - 180, tmP[1] - 120, 360, 140], dup: false, del: false },
        { id: 'caption', kind: 'pos', label: HS[0].cap, x: caP[0], y: caP[1], t0: 0.25, d: OUT - 0.25, box: [caP[0] - 450, caP[1] - 60, 900, 120], dup: false, del: false },
        ...closeEls(OUT, DUR, END),
      ];
    }
    return {
      dur: DUR, elements,
      render(t) {
        bg();
        const k = Math.min(5, Math.floor(t / SD)), lt = t - k * SD, draw = j => () => full(S[j], t, { lt: t - S[j].start });
        if (t < OUT) { if (k > 0 && lt < 0.3) cut('dissolve', t, k * SD, 0.6, draw(k - 1), draw(k)); else draw(k)(); }
        // evening grade: the later the hour, the warmer and darker the light
        if (!VID.collecting && t < OUT) { const ev = clamp((t / OUT - 0.55) / 0.45); if (ev > 0) { const c = G(); c.globalCompositeOperation = 'multiply'; c.fillStyle = rgbaOf(K7.mix(OR, '#1a1440', 0.6), 0.35 * ev); c.fillRect(0, 0, W, H); D(); } }
        shade(0, 700, 0.62, 0);
        if (t < OUT) {
          // the sun arc across the top, a dot travelling from sunrise to night
          if (!VID.collecting) { const c = G(), x0 = 120, x1 = 960, yb = 330, h = 120, p = clamp(t / OUT); c.strokeStyle = WA(0.35); c.lineWidth = 2; c.setLineDash([3, 9]); c.beginPath(); c.moveTo(x0, yb); c.quadraticCurveTo(540, yb - 2 * h, x1, yb); c.stroke(); c.setLineDash([]);
            const x = lerp(x0, x1, p), yy = yb - 4 * h * p * (1 - p), col = p > 0.75 ? '#CBD5FF' : OR; c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, yb); for (let i = 1; i <= 40; i++) { const u = p * i / 40; c.lineTo(lerp(x0, x1, u), yb - 4 * h * u * (1 - u)); } c.stroke();
            c.drawImage(K7.spark(col), x - 34, yy - 34, 68, 68); c.fillStyle = col; c.beginPath(); c.arc(x, yy, 9, 0, TAU); c.fill(); D(); }
          // the timestamp rolls up into place on every cut
          const h = HS[k], rp = E.outQ(seg(lt, 0, 0.45)), [tmx, tmy] = posOf(elP('time'), [506, 470]), y = tmy + (1 - rp) * 50;
          if (!VID.collecting) { const c = G(); c.globalAlpha = rp; setF(F(700, 118, 'Mono'), -2); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; const tw = textW(h.tm, F(700, 118, 'Mono'), -2); c.fillText(h.tm, tmx, y); setF(F(700, 40, 'Mono'), 2); c.fillStyle = OR; c.textAlign = 'left'; c.fillText(h.ap, tmx + tw / 2 + 12, y); D(); }
          const [cax, cay] = posOf(elP('caption'), [540, 566]); type(L8({ text: h.cap, slot: 'Corm', wt: 600, ital: true, size: 62, w: 900, color: 'white', fx: { shadow: 'soft' }, anim: { in: 'blur', inD: 0.5, out: 'fade', outD: 0.25 }, x: cax, y: cay, t0: k * SD + 0.25, d: SD - 0.3 }), t);
          const [lw, lh] = logoBox(220); if (!VID.collecting) { const c = G(); c.globalAlpha = 0.9 * fa(t, 0.4); c.drawImage(IMG.logoW, W / 2 - lw / 2, 1380 - lh / 2, lw, lh); D(); }
        }
        if (t >= OUT) { full(S[5], t, { lt: t - S[5].start }); endFade(t, OUT, 0.86); close(t, OUT, { y: 600, line: END, lineL: { slot: 'Corm', wt: 600, ital: true, size: 74, anim: { in: 'blur' } } }); }
      },
      cues() { const ev = []; S.forEach((s, k) => { ev.push(['tick', s.start + 0.02, 0.3, 0.2]); ev.push(['air', s.start + 0.2, 0.15, -0.2]); }); ev.push(['chime', OUT + 1.2, 0.18, 0]); return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ ONE WORD / SEAMLESS LOOP
  const WORDS = { general: ['IDEA', 'PLAN', 'CRAFT', 'DETAIL', 'FINISH', 'SHARE', 'ENJOY', 'REPEAT'], food: ['FIRE', 'SEAR', 'SLICE', 'STACK', 'SAUCE', 'PLATE', 'SAVOR', 'REPEAT'],
    estate: ['ARRIVE', 'OPEN', 'EXPLORE', 'GATHER', 'UNWIND', 'DREAM', 'STAY', 'HOME'], home: ['ARRIVE', 'BREATHE', 'DIVE', 'LINGER', 'SAVOR', 'PLAY', 'GLOW', 'REPEAT'],
    beauty: ['SIT', 'CLIP', 'FADE', 'LINE', 'STYLE', 'REVEAL', 'SMILE', 'REPEAT'], auto: ['RINSE', 'FOAM', 'SCRUB', 'CLAY', 'POLISH', 'PROTECT', 'SHINE', 'DRIVE'],
    hosp: ['ARRIVE', 'TOAST', 'DINE', 'DANCE', 'LAUGH', 'CELEBRATE', 'REMEMBER', 'REPEAT'], retail: ['DISCOVER', 'TRY', 'STYLE', 'MATCH', 'LOVE', 'WEAR', 'SHARE', 'REPEAT'],
    pro: ['LISTEN', 'PLAN', 'BUILD', 'REVIEW', 'LAUNCH', 'MEASURE', 'GROW', 'REPEAT'] };
  function oneword(LOOP) {
    const WS = pk(WORDS).map((w, k) => TX('w' + (k + 1), w, { label: 'Word ' + (k + 1), group: 'The words', upper: true, max: 12 }));
    const END = LOOP ? '' : TX('end', WS[7] === 'REPEAT' ? 'SEE YOU SOON' : 'BOOK TODAY', { label: 'Ending line', group: 'Ending', upper: true, max: 22 });
    const OUT = 8 * BAR, DUR = LOOP ? OUT : OUT + 3.8;
    const S = shots(WS.map((w, k) => ['s' + (k + 1), 'Shot ' + (k + 1), BAR + 0.4]), 0); S.forEach((s, k) => (s.start = k * BAR));
    const ltOf = (j, t) => { let lt = t - S[j].start; if (LOOP) { if (lt > OUT / 2) lt -= OUT; else if (lt < -OUT / 2) lt += OUT; } return lt; };   // the loop wraps: shot 8 runs into shot 1
    const draw = (j, t) => () => full(S[j], t, { lt: ltOf(j, t) });
    function elements() {
      const woP = posOf(elP('word'), [540, LOOP ? 1270 : 960]);
      if (LOOP) { const wbP = posOf(elP('web'), [540, 1380]); return [
        { id: 'word', kind: 'pos', label: WS[0], x: woP[0], y: woP[1], t0: 0.1, d: OUT - 0.1, box: [woP[0] - 470, woP[1] - 90, 940, 180], dup: false, del: false },
        { id: 'web', kind: 'pos', label: CONTACT.web || 'Website', x: wbP[0], y: wbP[1], t0: 0, d: DUR, box: [wbP[0] - 450, wbP[1] - 30, 900, 60], dup: false, del: false },
      ]; }
      const prP = posOf(elP('progress'), [540, 1390]);
      return [
        { id: 'word', kind: 'pos', label: WS[0], x: woP[0], y: woP[1], t0: 0.02, d: OUT - 0.02, box: [woP[0] - 470, woP[1] - 90, 940, 180], dup: false, del: false },
        { id: 'progress', kind: 'pos', label: 'Progress ticks', x: prP[0], y: prP[1], t0: 0, d: OUT, box: [prP[0] - 170, prP[1] - 10, 340, 25], dup: false, del: false },
        ...closeEls(OUT, DUR, END),
      ];
    }
    return {
      dur: DUR, shakes: LOOP ? [] : S.map(s => [s.start, 4]), elements,
      render(t) {
        bg();
        const k = Math.min(7, Math.floor(t / BAR)), lt = t - k * BAR;
        if (LOOP) {   // every cut is a push on the downbeat, including the one from the last shot back into the first
          const d = 0.5, dir = j => (j % 2 ? 'left' : 'up');
          if (lt < d / 2) cut('push', t, k * BAR, d, draw((k + 7) % 8, t), draw(k, t), { dir: dir(k) });
          else if (lt > BAR - d / 2) cut('push', t, (k + 1) * BAR, d, draw(k, t), draw((k + 1) % 8, t), { dir: dir(k + 1) });
          else draw(k, t)();
          shade(1100, H, 0, 0.55); const [lw, lh] = logoBox(300); if (!VID.collecting) { const c = G(); c.globalAlpha = 0.95; c.drawImage(IMG.logoW, W / 2 - lw / 2, 360 - lh / 2, lw, lh); D(); }
          const [wox, woy] = posOf(elP('word'), [540, 1270]); type(L8({ text: WS[k], slot: 'Bebas', size: 150, w: 900, color: k === 7 ? 'accent' : 'white', fx: { shadow: 'soft' }, anim: { in: 'tracking', inD: 0.5, out: 'fade', outD: 0.2 }, x: wox, y: woy, t0: k * BAR + 0.1, d: BAR - 0.15 }), t);
          const [wbx, wby] = posOf(elP('web'), [540, 1380]); K7.txt(CONTACT.web || '', wbx, wby, F(700, 26, 'Mont'), WA(0.85), { align: 'center', ls: 4 });
          return;
        }
        if (t < OUT) { draw(k, t)(); shade(700, 1250, 0, 0.25);
          const sz = Math.min(330, fitSize(WS[k], 400, 940, 330, 'Bebas', 4));
          const [wox, woy] = posOf(elP('word'), [540, 960]); type(L8({ text: WS[k], slot: 'Bebas', size: sz, w: 980, color: k === 7 ? 'accent' : 'white', fx: { shadow: 'soft' }, anim: { in: 'punch', inD: 0.3, out: 'fade', outD: 0.15 }, x: wox, y: woy, t0: k * BAR + 0.02, d: BAR - 0.05 }), t);
          const [lw, lh] = logoBox(240); if (!VID.collecting) { const c = G(); c.globalAlpha = 0.9 * fa(t, 0.3); c.drawImage(IMG.logoW, W / 2 - lw / 2, 360 - lh / 2, lw, lh); D(); }
          if (!VID.collecting) { const c = G(), [prx, pry] = posOf(elP('progress'), [540, 1390]); for (let i = 0; i < 8; i++) { c.fillStyle = i <= k ? OR : WA(0.35); c.fillRect(prx - 4 * 40 + i * 40 + 6, pry, 28, 5); } D(); } }
        else { full(S[7], t, { lt: t - S[7].start }); endFade(t, OUT, 0.88); close(t, OUT, { y: 600, line: END }); }
      },
      cues() { const ev = []; S.forEach((s, k) => ev.push([LOOP ? 'whoosh' : 'impact', s.start + 0.01, LOOP ? 0.22 : 0.3, 0])); if (!LOOP) ev.push(['chime', OUT + 1.2, 0.16, 0]);
        return LOOP ? { dur: DUR, loop: true, rot: 0, beds: [['music', 0, DUR, 1.0, { style: MUS[0], bpm: BPM, key: 0 }]], events: ev } : { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ POV
  function pov() {
    const CP = pk({ general: ['POV: you finally found the right people for the job.', 'Everything handled.', 'Exactly how you pictured it.', 'Telling everyone about it.'],
      food: ['POV: you found your new spot.', 'First bite.', 'Already planning the next visit.', 'Bringing the whole crew next time.'],
      estate: ['POV: you just walked into the one.', 'The kitchen.', 'The view.', 'Picturing your first night here.'],
      home: ['POV: you finally redid the backyard.', 'Morning coffee hits different.', 'Weekend plans:', 'Everyone ends up at your place.'],
      beauty: ['POV: you finally booked the appointment.', 'Sit back.', 'The reveal.', 'Feeling brand new.'],
      auto: ['POV: your car hasn’t looked this good in years.', 'The foam.', 'The shine.', 'Taking the long way home.'],
      hosp: ['POV: the night you’ll talk about for years.', 'Walking in.', 'The toast.', 'Nobody wants to leave.'],
      retail: ['POV: you found exactly what you were looking for.', 'Trying it on.', 'The one.', 'Already planning the next visit.'],
      pro: ['POV: you finally handed it off.', 'One call.', 'A clear plan.', 'Wondering why you waited.'] });
    const C4 = CP.map((c, k) => TX('c' + (k + 1), c, { label: 'Caption ' + (k + 1), group: 'Captions', max: 60 }));
    const END = TX('end', 'YOUR TURN', { label: 'Ending line', group: 'Ending', upper: true, max: 20 });
    const SD = 3.6, OUT = 4 * SD, DUR = OUT + 4.0;
    const S = shots(C4.map((c, k) => ['s' + (k + 1), 'Shot ' + (k + 1), SD + 0.4]), 0); S.forEach((s, k) => (s.start = k * SD));
    function elements() {
      const caP = posOf(elP('caption'), [540, 600]);
      return [
        { id: 'caption', kind: 'pos', label: C4[0], x: caP[0], y: caP[1], t0: 0.15, d: OUT - 0.15, box: [caP[0] - 450, caP[1] - 120, 900, 240], dup: false, del: false },
        ...closeEls(OUT, DUR, END),
      ];
    }
    return {
      dur: DUR, elements,
      render(t) {
        bg(); const k = Math.min(3, Math.floor(t / SD)), lt = t - k * SD, draw = j => () => full(S[j], t, { lt: t - S[j].start });
        if (t < OUT) { if (k > 0 && lt < 0.2) cut(k % 2 ? 'whip' : 'flash', t, k * SD, 0.4, draw(k - 1), draw(k), { dir: 'left', col: 'white' }); else draw(k)(); shade(300, 900, 0.25, 0);
          const [cax, cay] = posOf(elP('caption'), [540, 600]); boxCap(C4[k], cax, cay, t, k * SD + 0.15, { hot: /^POV:/i.test(C4[k]), alpha: 1 - seg(lt, SD - 0.15, 0.15) }); }
        else { full(S[3], t, { lt: t - S[3].start }); endFade(t, OUT, 0.86); close(t, OUT, { y: 600, line: END }); }
      },
      cues() { const ev = []; S.forEach((s, k) => { if (k) ev.push([k % 2 ? 'whoosh' : 'flash', s.start - 0.05, 0.3, 0]); C4[k].split(/\s+/).forEach((w, j) => { if (j < 9) ev.push(['tick', s.start + 0.15 + j * 0.14, 0.08, 0.2]); }); });
        ev.push(['pop', OUT + 0.6, 0.3, 0], ['chime', OUT + 1.3, 0.16, 0]); return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ HOW IT WORKS (notes)
  function notes() {
    const PK = pk({ general: [['CONSULT', 'We listen first'], ['PLAN', 'A plan you approve'], ['DO', 'Done with care'], ['ENJOY', 'Yours to enjoy']],
      food: [['ORDER', 'Online or in person'], ['WE COOK', 'Made when you order'], ['PICK UP', 'Ready when you arrive'], ['ENJOY', 'Dig in']],
      estate: [['MEET', 'Tell us what you want'], ['SEARCH', 'We find the matches'], ['TOUR', 'Walk the homes you like'], ['MOVE IN', 'Keys in hand']],
      home: [['CONSULT', 'A one-on-one consultation'], ['DESIGN', 'A custom design, shaped by you'], ['BUILD', 'Built and supervised start to finish'], ['ENJOY', 'Your new outdoor space']],
      beauty: [['BOOK', 'Pick a time that works'], ['CONSULT', 'Tell us the look'], ['CUT', 'Sit back and relax'], ['REVEAL', 'Your fresh look']],
      auto: [['BOOK', 'Choose your package'], ['INSPECT', 'We look over every panel'], ['DETAIL', 'Washed, polished, protected'], ['DRIVE', 'Like new again']],
      hosp: [['TOUR', 'See the space'], ['PLAN', 'Every detail planned'], ['SET UP', 'We set the room'], ['CELEBRATE', 'Your night']],
      retail: [['BROWSE', 'In store or online'], ['PICK', 'Find your favourite'], ['TRY', 'Try it on'], ['LOVE', 'Make it yours']],
      pro: [['CALL', 'A quick first call'], ['PLAN', 'A clear plan and price'], ['DELIVER', 'We do the work'], ['REVIEW', 'We check in after']] });
    const TITLE = TX('title', 'HOW IT WORKS', { label: 'Title', group: 'Opening', upper: true, max: 18 });
    const ST = PK.map(([s, n], k) => ({ s: TX('step' + (k + 1), s, { label: 'Step ' + (k + 1), group: 'Step ' + (k + 1), upper: true, max: 14 }), n: TX('note' + (k + 1), n, { label: 'Step ' + (k + 1) + ' note', group: 'Step ' + (k + 1), max: 34 }) }));
    const END = TX('end', 'START WITH STEP ONE', { label: 'Ending line', group: 'Ending', upper: true, max: 24 });
    const T0 = 1.6, SD = 3.6, OUT = T0 + 4 * SD, DUR = OUT + 4.0;
    const S = shots(ST.map((x, k) => ['s' + (k + 1), 'Step ' + (k + 1), SD + 0.4]), T0); S.forEach((s, k) => (s.start = T0 + k * SD));
    const AR = [[690, 900], [380, 980], [700, 1040], [400, 900]];
    function elements() {
      const tiP = posOf(elP('title'), [540, 900]), stP = posOf(elP('step'), [540, 350]), prP = posOf(elP('progress'), [540, 428]), noP = posOf(elP('note'), [540, 560]);
      const arrows = AR.map((a, k) => { const ap = posOf(elP('arrow' + (k + 1)), a); return { id: 'arrow' + (k + 1), kind: 'focus', label: 'Arrow target · step ' + (k + 1), x: ap[0], y: ap[1], t0: T0 + k * SD + 1.1, d: SD - 1.35, box: [ap[0] - 60, ap[1] - 60, 120, 120], dup: false, del: false }; });
      return [
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.15, d: T0 - 0.15, box: [tiP[0] - 470, tiP[1] - 90, 940, 180], dup: false, del: false },
        { id: 'step', kind: 'pos', label: 'STEP 1 · ' + ST[0].s, x: stP[0], y: stP[1], t0: T0 + 0.1, d: OUT - (T0 + 0.1), box: [stP[0] - 450, stP[1] - 40, 900, 80], dup: false, del: false },
        { id: 'progress', kind: 'pos', label: 'Step dots', x: prP[0], y: prP[1], t0: T0 + 0.1, d: OUT - (T0 + 0.1), box: [prP[0] - 90, prP[1] - 15, 180, 30], dup: false, del: false },
        { id: 'note', kind: 'pos', label: ST[0].n, x: noP[0], y: noP[1], t0: T0 + 0.45, d: OUT - (T0 + 0.45), box: [noP[0] - 430, noP[1] - 60, 860, 120], dup: false, del: false },
        ...arrows,
        ...closeEls(OUT, DUR, END),
      ];
    }
    return {
      dur: DUR, elements,
      render(t) {
        bg();
        if (t < T0 + 0.3) { full(S[0], t, { lt: 0 }); fillScreen(BLK, VID.collecting ? 0 : 0.55 * (1 - seg(t, T0 - 0.2, 0.5)));
          const [tix, tiy] = posOf(elP('title'), [540, 900]); type(L8({ text: TITLE, slot: 'Bebas', size: 150, w: 940, color: 'white', anim: { in: 'stagger', out: 'fade', outD: 0.25 }, x: tix, y: tiy, t0: 0.15, d: T0 }), t); }
        if (t >= T0 && t < OUT) {
          const k = Math.min(3, Math.floor((t - T0) / SD)), lt = t - (T0 + k * SD), draw = j => () => full(S[j], t, { lt: t - S[j].start });
          if (k > 0 && lt < 0.3) cut('wipe', t, T0 + k * SD, 0.6, draw(k - 1), draw(k), { col: 'accent', dir: 'right' }); else draw(k)(); shade(300, 820, 0.55, 0);
          const [stx, sty] = posOf(elP('step'), [540, 350]); type(L8({ text: 'STEP ' + (k + 1) + '  ·  ' + ST[k].s, slot: 'Mont', wt: 800, size: 34, track: 200, w: 900, color: K8.onCol(OR), fx: { deco: 'pill', dcol: 'accent' }, anim: { in: 'pop', out: 'fade', outD: 0.2 }, x: stx, y: sty, t0: T0 + k * SD + 0.1, d: SD - 0.15 }), t);
          if (!VID.collecting) { const c = G(), [prx, pry] = posOf(elP('progress'), [540, 428]); for (let i = 0; i < 4; i++) { c.fillStyle = i <= k ? OR : WA(0.4); c.beginPath(); c.arc(prx - 66 + i * 44, pry, i === k ? 9 : 6, 0, TAU); c.fill(); } D(); }
          const [nox, noy] = posOf(elP('note'), [540, 560]); type(L8({ text: ST[k].n, slot: 'Hand', wt: 700, size: 76, w: 860, color: 'white', rot: [-3, 2, -2, 3][k], fx: { shadow: 'soft' }, anim: { in: 'letters', stagger: 0.035, out: 'fade', outD: 0.25 }, x: nox, y: noy, t0: T0 + k * SD + 0.45, d: SD - 0.5 }), t);
          if (!VID.collecting) { const ap = E.inOutC(seg(lt, 1.1, 0.5)) * (1 - seg(lt, SD - 0.25, 0.25)); if (ap > 0) { const [tx, ty] = posOf(elP('arrow' + (k + 1)), AR[k]), x0 = 540, y0 = 640, c = G(); c.strokeStyle = WHT; c.lineWidth = 6; c.lineCap = 'round'; c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 8;
            const cx = (x0 + tx) / 2 + (k % 2 ? -120 : 120), cy = (y0 + ty) / 2; c.beginPath(); c.moveTo(x0, y0); for (let i = 1; i <= 24 * ap; i++) { const u = i / 24, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u; c.lineTo(a * x0 + b * cx + d * tx, a * y0 + b * cy + d * ty); } c.stroke();
            if (ap > 0.95) { const an = Math.atan2(ty - cy, tx - cx); c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx - 30 * Math.cos(an - 0.5), ty - 30 * Math.sin(an - 0.5)); c.moveTo(tx, ty); c.lineTo(tx - 30 * Math.cos(an + 0.5), ty - 30 * Math.sin(an + 0.5)); c.stroke(); } D(); } }
        }
        if (t >= OUT) { full(S[3], t, { lt: t - S[3].start }); endFade(t, OUT, 0.86); close(t, OUT, { y: 600, line: END }); }
      },
      cues() { const ev = [['whoosh', 0.15, 0.3, 0]]; S.forEach((s, k) => { ev.push(['swish', s.start - 0.05, 0.3, 0]); ev.push(['pop', s.start + 0.12, 0.3, -0.2]); ev.push(['pencil', s.start + 0.5, 0.25, 0.2]); ev.push(['pencil', s.start + 1.15, 0.22, 0.2]); });
        ev.push(['chime', OUT + 1.3, 0.16, 0]); return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ BY THE NUMBERS
  function numbers() {
    const LB = DPG ? [['3.5K', 'PROJECTS COMPLETED'], ['30+', 'YEARS OF EXPERIENCE'], ['28 MIL', 'PAVERS INSTALLED']]   // DPG's own homepage figures (dpgoutdoorliving.com)
      : pk({ general: ['PROJECTS COMPLETED', 'YEARS IN BUSINESS', 'CUSTOMERS SERVED'], food: ['DISHES ON THE MENU', 'YEARS SERVING', 'SEATS'], estate: ['HOMES SOLD', 'YEARS IN THE AREA', 'FAMILIES HELPED'],
        home: ['PROJECTS COMPLETED', 'YEARS OF EXPERIENCE', 'HAPPY HOMEOWNERS'], beauty: ['CUTS A WEEK', 'YEARS BEHIND THE CHAIR', 'STYLISTS'], auto: ['CARS DETAILED', 'YEARS IN THE BAY', 'PACKAGES'],
        hosp: ['EVENTS HOSTED', 'GUESTS WELCOMED', 'YEARS'], retail: ['PRODUCTS', 'HAPPY CUSTOMERS', 'YEARS OPEN'], pro: ['CLIENTS SERVED', 'YEARS OF EXPERIENCE', 'PROJECTS DELIVERED'] }).map(l => ['', l]);
    const TITLE = TX('title', 'BY THE NUMBERS', { label: 'Title', group: 'Opening', upper: true, max: 18 });
    const NS = LB.map(([n, l], k) => ({ n: TX('num' + (k + 1), n, { label: 'Number ' + (k + 1), group: 'Number ' + (k + 1), upper: true, max: 8, req: !DPG, hint: 'Your real figure, e.g. 250+ or 12. A marker shows until you type it.' }), l: TX('lab' + (k + 1), l, { label: 'Number ' + (k + 1) + ' label', group: 'Number ' + (k + 1), upper: true, max: 26 }) }));
    const END = TX('end', DPG ? 'SERVING THE GREATER BAY AREA SINCE 1990' : 'LET’S MAKE IT ONE MORE', { label: 'Ending line', group: 'Ending', upper: true, max: 40 });
    const T0 = 1.4, SD = 3.6, OUT = T0 + 3 * SD, DUR = OUT + 4.0;
    const S = shots(NS.map((x, k) => ['s' + (k + 1), 'Shot ' + (k + 1), SD + 0.4]), T0); S.forEach((s, k) => (s.start = T0 + k * SD));
    function elements() {
      const tiP = posOf(elP('title'), [540, 900]), nuP = posOf(elP('number'), [540, 900]), laP = posOf(elP('label'), [540, 1000]), coP = posOf(elP('counter'), [540, 360]);
      return [
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.15, d: T0 - 0.15, box: [tiP[0] - 470, tiP[1] - 90, 940, 180], dup: false, del: false },
        { id: 'number', kind: 'pos', label: NS[0].n || 'Big number', x: nuP[0], y: nuP[1], t0: T0 + 0.15, d: OUT - (T0 + 0.15), box: [nuP[0] - 470, nuP[1] - 150, 940, 300], dup: false, del: false },
        { id: 'label', kind: 'pos', label: NS[0].l, x: laP[0], y: laP[1], t0: T0 + 0.6, d: OUT - (T0 + 0.6), box: [laP[0] - 450, laP[1] - 40, 900, 80], dup: false, del: false },
        { id: 'counter', kind: 'pos', label: '01 / 03', x: coP[0], y: coP[1], t0: T0, d: OUT - T0, box: [coP[0] - 100, coP[1] - 30, 200, 60], dup: false, del: false },
        ...closeEls(OUT, DUR, END),
      ];
    }
    return {
      dur: DUR, elements,
      render(t) {
        bg();
        if (t < T0 + 0.3) { full(S[0], t, { lt: 0 }); if (!VID.collecting) fillScreen(BLK, 0.6); const [tix, tiy] = posOf(elP('title'), [540, 900]); type(L8({ text: TITLE, slot: 'Bebas', size: 150, w: 940, color: 'white', anim: { in: 'tracking', out: 'fade', outD: 0.25 }, x: tix, y: tiy, t0: 0.15, d: T0 }), t); }
        if (t >= T0 && t < OUT) {
          const k = Math.min(2, Math.floor((t - T0) / SD)), lt = t - (T0 + k * SD), draw = j => () => full(S[j], t, { lt: t - S[j].start });
          if (k > 0 && lt < 0.25) cut('flash', t, T0 + k * SD, 0.5, draw(k - 1), draw(k), { col: 'white' }); else draw(k)();
          if (!VID.collecting) { const c = G(); c.fillStyle = 'rgba(0,0,0,0.42)'; c.fillRect(0, 0, W, H); D(); }
          const N = NS[k], P = K9.parseNum(N.n), cp = E.outQ(seg(lt, 0.15, 1.3)), a = 1 - seg(lt, SD - 0.2, 0.2), [nux, nuy] = posOf(elP('number'), [540, 900]);
          if (N.n) { const str = P ? P.pre + K9.fmtNum(P, P.n * cp) + P.suf : N.n, sz = Math.min(300, fitSize(N.n + '0', 400, 940, 300, 'Bebas', 2)); if (!VID.collecting) { const c = G(); c.globalAlpha = a * fa(lt, 0.1, 0.3); setF(F(400, sz, 'Bebas'), 2); c.fillStyle = OR; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 30; c.fillText(str, nux, nuy); D(); } }
          else K7.need('your number', nux, nuy - 40, 30, { align: 'center', col: WHT, a });
          const [lax, lay] = posOf(elP('label'), [540, 1000]); type(L8({ text: N.l, slot: 'Mont', wt: 800, size: 44, track: 160, w: 900, color: 'white', anim: { in: 'words', out: 'fade', outD: 0.2 }, x: lax, y: lay, t0: T0 + k * SD + 0.6, d: SD - 0.65 }), t);
          const [cox, coy] = posOf(elP('counter'), [540, 360]); K7.txt(String(k + 1).padStart(2, '0') + ' / 03', cox, coy, F(700, 26, 'Mono'), WA(0.8), { align: 'center', a, ls: 6 });
        }
        if (t >= OUT) { full(S[2], t, { lt: t - S[2].start }); endFade(t, OUT, 0.88); close(t, OUT, { y: 600, line: END, lineL: { size: 78 } }); }
      },
      cues() { const ev = [['whoosh', 0.15, 0.3, 0]]; S.forEach((s, k) => { ev.push(['flash', s.start - 0.02, 0.25, 0]); ev.push(['riser', s.start + 0.15, 0.18, 0]); ev.push(['impact', s.start + 1.45, 0.35, 0]); }); ev.push(['chime', OUT + 1.3, 0.16, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ SERVICE SPOTLIGHT
  function spotlight() {
    const PK = pk({ general: ['SERVICES', 'WHAT WE DO', 'DONE', 'WITH CARE', 'SERVICE ONE\nSERVICE TWO\nSERVICE THREE'], food: ['BRUNCH', 'WEEKENDS', 'START', 'RIGHT HERE', 'ALL-DAY MENU\nCOFFEE BAR\nPATIO SEATING'],
      estate: ['THE VIEW', 'THIS IS', 'WHAT HOME', 'FEELS LIKE', 'OPEN FLOOR PLAN\nCHEF’S KITCHEN\nBIG BACKYARD'], home: ['POOL DECKS', 'POOL DAYS', 'START ON', 'THE DECK.', 'MORE OUTDOOR LIVING SPACE\nDURABLE\nLOW MAINTENANCE'],
      beauty: ['FADES', 'THE FRESH', 'CUT', 'YOU NEED', 'SKIN FADES\nBEARD TRIMS\nHOT TOWEL SHAVES'], auto: ['CERAMIC', 'SEE YOUR', 'REFLECTION', 'AGAIN', 'PAINT CORRECTION\nCERAMIC COATING\nINTERIOR DETAIL'],
      hosp: ['WEDDINGS', 'YOUR DAY', 'YOUR', 'WAY', 'CEREMONY\nRECEPTION\nCATERING'], retail: ['NEW IN', 'THE PIECES', 'YOU’LL', 'LIVE IN', 'NEW ARRIVALS\nGIFT IDEAS\nIN STORE NOW'], pro: ['STRATEGY', 'FROM IDEA', 'TO', 'RESULTS', 'CONSULTING\nPLANNING\nSUPPORT'] });
    const WORD = TX('word', PK[0], { label: 'Service name (filled with footage)', group: 'Opening', upper: true, max: 14, req: true, hint: 'Sample text: the service you are showing.' });
    const HD = [1, 2, 3].map(k => TX('hl' + k, PK[k], { label: 'Headline line ' + k + (k === 3 ? ' (highlighted)' : ''), group: 'Headline', upper: true, max: 14 }));
    const TAGS = TX('tags', PK[4], { label: 'Feature tags (one per line)', group: 'Features', multiline: true, upper: true, max: 90, req: true, hint: 'Sample text: list what you actually offer.' });
    const END = TX('end', 'BOOK YOURS', { label: 'Ending line', group: 'Ending', upper: true, max: 20 });
    const T1 = 2 * BAR, T2 = 4 * BAR, OUT = 6 * BAR + 0.4, DUR = OUT + 4.0, TG = String(TAGS).split('\n').map(x => x.trim()).filter(Boolean).slice(0, 3);
    const S = shots([['s1', 'Inside the word', T1 + 0.4], ['s2', 'Headline shot', T2 - T1 + 0.4], ['s3', 'Features shot', OUT - T2 + 0.4]], 0); S[1].start = T1; S[2].start = T2;
    function elements() {
      const woP = posOf(elP('word'), [540, 900]), brP = posOf(elP('brand'), [540, 380]);
      const hls = HD.map((h, i) => { const p = posOf(elP('hl' + (i + 1)), [540, 420 + i * 118]); return { id: 'hl' + (i + 1), kind: 'pos', label: h, x: p[0], y: p[1], t0: T1 + 0.2 + i * BT, d: T2 - T1 - 0.2 - i * BT, box: [p[0] - 470, p[1] - 70, 940, 140], dup: false, del: false }; });
      const tags = TG.map((g, i) => { const p = posOf(elP('tag' + (i + 1)), [540, 1130 + i * 96]); return { id: 'tag' + (i + 1), kind: 'pos', label: g, x: p[0], y: p[1], t0: T2 + 0.3 + i * 0.35, d: OUT - T2 - 0.3 - i * 0.35, box: [p[0] - 450, p[1] - 40, 900, 80], dup: false, del: false }; });
      return [
        { id: 'brand', kind: 'pos', label: 'Brand name', x: brP[0], y: brP[1], t0: 0.4, d: T1 - 0.4, box: [brP[0] - 300, brP[1] - 30, 600, 60], dup: false, del: false },
        { id: 'word', kind: 'pos', label: WORD, x: woP[0], y: woP[1], t0: 0.1, d: T1 + 0.1, box: [woP[0] - 470, woP[1] - 120, 940, 240], dup: false, del: false },
        ...hls, ...tags,
        ...closeEls(OUT, DUR, END),
      ];
    }
    return {
      dur: DUR, shakes: [[T1, 8]], elements,
      render(t) {
        bg();
        if (t < T1 + 0.3) {
          if (t >= T1 - 0.3) { const u = seg(t, T1 - 0.3, 0.6); full(S[1], t, { lt: t - T1, alpha: u }); }
          const sz = Math.min(330, fitSize(WORD.split(' ')[0] || WORD, 400, 960, 330, 'Bebas', 4)), q = seg(t, T1 - 0.35, 0.5);
          const [wox, woy] = posOf(elP('word'), [540, 900]); type(L8({ text: WORD, slot: 'Bebas', size: sz, w: 1000, lead: 0.86, color: 'white', sx: lerp(1, 1.6, E.inC(q)), sy: lerp(1, 1.6, E.inC(q)), opacity: 1 - q, fx: { fill: 'footage', clip: S[0].c, cin: S[0].in, stroke: 3, scol: 'white' }, anim: { in: 'zoom', inD: 0.6, out: 'none' }, x: wox, y: woy, t0: 0.1, d: T1 + 0.2 }), t);
          const [brx, bry] = posOf(elP('brand'), [540, 380]); K7.txt(up(BRAND.short || BRAND.name), brx, bry, F(700, 26, 'Mont'), WA(0.85), { align: 'center', a: fa(t, 0.4) * (1 - q), ls: 8 });
        }
        if (t >= T1 && t < OUT) {
          const draw = j => () => full(S[j], t, { lt: t - S[j].start }); if (t < T2 + 0.3) { if (t > T2 - 0.3) cut('stripes', t, T2, 0.6, draw(1), draw(2), { col: 'accent' }); else draw(1)(); } else draw(2)();
          if (t < T2) { shade(300, 900, 0.5, 0); HD.forEach((h, i) => { const hot = i === 2, [hx, hy] = posOf(elP('hl' + (i + 1)), [540, 420 + i * 118]), p = seg(t, T1 + 0.2 + i * BT, 0.3); if (hot && p > 0 && !VID.collecting) { const fz = Math.min(120, fitSize(h, 400, 900, 120, 'Bebas', 2)), w = textW(h, F(400, fz, 'Bebas'), 2) + 50, c = G(); c.fillStyle = OR; c.fillRect(hx - w / 2, hy - 66, w * E.outC(p), 118); D(); }
            type(L8({ text: h, slot: 'Bebas', size: 120, w: 940, color: hot ? K8.onCol(OR) : 'white', fx: hot ? {} : { shadow: 'soft' }, anim: { in: 'slide', dir: 'left', out: 'fade', outD: 0.2 }, x: hx, y: hy, t0: T1 + 0.2 + i * BT, d: T2 - T1 - 0.2 - i * BT }), t); }); }
          else { shade(1000, 1500, 0, 0.55); TG.forEach((g, i) => { const [tx, ty] = posOf(elP('tag' + (i + 1)), [540, 1130 + i * 96]); type(L8({ text: g, slot: 'Mont', wt: 800, size: 38, track: 120, w: 900, color: K8.onCol(OR), fx: { deco: 'pill', dcol: 'accent' }, anim: { in: 'slide', dir: 'right', out: 'fade', outD: 0.2 }, x: tx, y: ty, t0: T2 + 0.3 + i * 0.35, d: OUT - T2 - 0.3 - i * 0.35 }), t); }); }
        }
        if (t >= OUT) { full(S[2], t, { lt: t - S[2].start }); endFade(t, OUT, 0.88); close(t, OUT, { y: 600, line: END }); }
      },
      cues() { const ev = [['riser', 0.1, 0.25, 0], ['whoosh', T1 - 0.35, 0.4, 0], ['impact', T1, 0.5, 0]]; HD.forEach((h, i) => ev.push(['thud', T1 + 0.2 + i * BT, 0.35, 0])); ev.push(['swish', T2, 0.35, 0]); TG.forEach((g, i) => ev.push(['pop', T2 + 0.35 + i * 0.35, 0.3, 0.2]));
        ev.push(['chime', OUT + 1.3, 0.16, 0]); return { dur: DUR, beds: [musicBed(DUR, { drop: T1 })], events: ev }; },
    };
  }

  // ================================================================ RATE THIS
  function rate() {
    const NOUN = pk({ general: 'THIS', food: 'THIS PLATE', estate: 'THIS KITCHEN', home: 'THIS BACKYARD', beauty: 'THIS FADE', auto: 'THIS SHINE', hosp: 'THIS SETUP', retail: 'THIS FIT', pro: 'THIS SETUP' });
    const Q = TX('q', 'RATE ' + NOUN, { label: 'Headline', group: 'The question', upper: true, max: 24 }), SUBL = TX('sub', 'DROP YOUR RATING', { label: 'Call to comment', group: 'The question', upper: true, max: 24 });
    const END = TX('end', 'WE READ EVERY ONE', { label: 'Ending line', group: 'Ending', upper: true, max: 24 });
    const SD = 2 * BAR, OUT = 4 * SD + 0.3, DUR = OUT + 4.0;
    const S = shots([1, 2, 3, 4].map(k => ['s' + k, 'Shot ' + k, SD + 0.4]), 0); S.forEach((s, k) => (s.start = k * SD));
    function elements() {
      const quP = posOf(elP('question'), [540, 380]), meP = posOf(elP('meter'), [120, 464]), suP = posOf(elP('sub'), [540, 1300]);
      return [
        { id: 'question', kind: 'pos', label: Q, x: quP[0], y: quP[1], t0: 0.1, d: OUT - 0.1, box: [quP[0] - 470, quP[1] - 70, 940, 140], dup: false, del: false },
        { id: 'meter', kind: 'box', label: '1–10 scale', x: meP[0], y: meP[1], w: 840, h: 72, t0: 0.4, d: OUT - 0.4, box: [meP[0], meP[1], 840, 72], dup: false, del: false },
        { id: 'sub', kind: 'pos', label: SUBL, x: suP[0], y: suP[1], t0: 3 * SD + 0.2, d: OUT - (3 * SD + 0.2), box: [suP[0] - 450, suP[1] - 40, 900, 80], dup: false, del: false },
        ...closeEls(OUT, DUR, END),
      ];
    }
    return {
      dur: DUR, elements,
      render(t) {
        bg(); const k = Math.min(3, Math.floor(t / SD)), lt = t - k * SD, draw = j => () => full(S[j], t, { lt: t - S[j].start });
        if (t < OUT) { if (k > 0 && lt < 0.2) cut('snapcut', t, k * SD, 0.4, draw(k - 1), draw(k)); else draw(k)(); shade(300, 720, 0.6, 0);
          const [qux, quy] = posOf(elP('question'), [540, 380]); type(L8({ text: Q, slot: 'Bebas', size: 120, w: 940, color: 'white', fx: { shadow: 'hard', shcol: 'accent' }, anim: { in: 'punch', out: 'none' }, x: qux, y: quy, t0: 0.1, d: OUT }), t);
          // the 1-10 scale with a highlight that bounces along it, settling higher on every shot
          if (!VID.collecting) { const c = G(), [mex, mey] = posOf(elP('meter'), [120, 464]), x0 = mex, w = 840, y = mey + 36, cell = w / 10, p = fa(t, 0.4, 0.4), pos = clamp(4 + k * 1.6 + Math.sin(t * 5) * (k < 3 ? 2.2 : 0.4), 0, 9.4);
            c.globalAlpha = p; for (let i = 0; i < 10; i++) { const on = Math.abs(i - pos) < 0.6; c.fillStyle = on ? OR : 'rgba(0,0,0,0.55)'; c.beginPath(); c.roundRect(x0 + i * cell + 4, y - 36, cell - 8, 72, 12); c.fill(); setF(F(400, 46, 'Bebas'), 0); c.fillStyle = on ? K8.onCol(OR) : WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(i + 1), x0 + i * cell + cell / 2, y + 3); } D(); }
          if (t > 3 * SD) { const [sux, suy] = posOf(elP('sub'), [540, 1300]); type(L8({ text: SUBL + '  ↓', slot: 'Mont', wt: 900, size: 40, track: 120, color: K8.onCol(OR), rot: -4, fx: { deco: 'box', dcol: 'accent' }, anim: { in: 'pop', out: 'none', loop: 'pulse', loopAmt: 0.4 }, x: sux, y: suy, t0: 3 * SD + 0.2, d: OUT }), t); } }
        else { full(S[3], t, { lt: t - S[3].start }); endFade(t, OUT, 0.88); close(t, OUT, { y: 600, line: END }); }
      },
      cues() { const ev = [['impact', 0.1, 0.4, 0]]; S.forEach((s, k) => { if (k) ev.push(['snap', s.start, 0.35, 0]); }); for (let b = 2; b < OUT / BT; b += 2) ev.push(['tick', b * BT, 0.12, 0.3]); ev.push(['pop', 3 * SD + 0.2, 0.35, 0], ['chime', OUT + 1.3, 0.16, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ COMMENT REPLY
  function reply() {
    const PK = pk({ general: ['How long does it take?', ['Good question.', 'It depends on the details.', 'Message us and we’ll walk you through it.']],
      food: ['What’s the most popular dish?', ['Great question.', 'Honestly? Try a few.', 'Come in and ask for our favourite.']], estate: ['Is it still available?', ['Good question.', 'Things move fast.', 'Message me and I’ll check right now.']],
      home: ['How long does a project like this take?', ['Great question.', 'Every yard is different.', 'Book a consultation and we’ll walk you through it.']],
      beauty: ['How do I keep this fade fresh?', ['Good question.', 'Book a touch-up every few weeks.', 'And ask us about at-home care.']], auto: ['How long does a coating last?', ['Good question.', 'It depends on the product and the care.', 'Message us and we’ll explain the options.']],
      hosp: ['How many guests fit?', ['Good question.', 'It depends on the setup.', 'Book a tour and we’ll show you.']], retail: ['Do you ship?', ['Good question.', 'Ask us in store or online.', 'Message us for the details.']],
      pro: ['How do we get started?', ['Good question.', 'It starts with one call.', 'Book a time and we’ll map it out.']] });
    const WHO = TX('cname', 'a viewer', { label: 'Who asked (their name or handle)', group: 'The comment', max: 24 });
    const CMT = TX('comment', PK[0], { label: 'The comment', group: 'The comment', max: 70, req: true, hint: 'Paste a real comment you received.' });
    const AN = PK[1].map((a, k) => TX('a' + (k + 1), a, { label: 'Answer ' + (k + 1), group: 'Your answer', max: 56 }));
    const END = TX('end', 'KEEP THE QUESTIONS COMING', { label: 'Ending line', group: 'Ending', upper: true, max: 28 });
    const SD = 3.6, OUT = 3 * SD + 0.4, DUR = OUT + 4.0;
    const S = shots([1, 2, 3].map(k => ['s' + k, 'Shot ' + k, SD + 0.4]), 0); S.forEach((s, k) => (s.start = k * SD));
    function sticker(t) {   // the comment card: pops in big, then settles smaller near the top
      if (VID.collecting) return; const p = E.outBack(seg(t, 0.1, 0.4)), sm = E.inOutC(seg(t, 2.2, 0.5)), sc = p * lerp(1, 0.78, sm), [ccx, ccy] = posOf(elP('comment'), [540, 400]), cy = lerp(ccy + 160, ccy, sm), c = G(); if (p <= 0) { D(); return; }
      const f = F(700, 40, 'Mont'), L = K7.fitLines(CMT, 700, 'Mont', 700, 40, 3), w = 820, h = 120 + L.lines.length * L.size * 1.25; c.translate(ccx, cy); c.scale(sc, sc); c.rotate(-0.015);
      c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 30; c.fillStyle = '#FFFFFF'; c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 26); c.fill(); c.shadowColor = 'transparent';
      c.fillStyle = OR; c.beginPath(); c.arc(-w / 2 + 56, -h / 2 + 56, 26, 0, TAU); c.fill(); setF(F(800, 28, 'Mont'), 0); c.fillStyle = K8.onCol(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText((WHO || 'A').trim().charAt(0).toUpperCase(), -w / 2 + 56, -h / 2 + 58);
      setF(F(600, 24, 'Mont'), 0); c.fillStyle = '#6B6B6B'; c.textAlign = 'left'; c.fillText('Reply to ' + WHO + '’s comment', -w / 2 + 96, -h / 2 + 58);
      setF(F(700, L.size, 'Mont'), 0); c.fillStyle = '#111111'; L.lines.forEach((ln, i) => c.fillText(ln, -w / 2 + 40, -h / 2 + 116 + i * L.size * 1.25)); void f; D(); }
    function elements() {
      const cmP = posOf(elP('comment'), [540, 400]), anP = posOf(elP('answer'), [540, 760]);
      return [
        { id: 'comment', kind: 'card', label: CMT, x: cmP[0] - 410, y: cmP[1] - 130, w: 820, h: 260, t0: 0.1, d: OUT - 0.1, box: [cmP[0] - 410, cmP[1] - 130, 820, 260], dup: false, del: false },
        { id: 'answer', kind: 'pos', label: AN[0], x: anP[0], y: anP[1], t0: 2.6, d: OUT - 2.6, box: [anP[0] - 450, anP[1] - 120, 900, 240], dup: false, del: false },
        ...closeEls(OUT, DUR, END),
      ];
    }
    return {
      dur: DUR, elements,
      render(t) {
        bg(); const k = Math.min(2, Math.floor(t / SD)), lt = t - k * SD, draw = j => () => full(S[j], t, { lt: t - S[j].start });
        if (t < OUT) { if (k > 0 && lt < 0.2) cut('swipe', t, k * SD, 0.4, draw(k - 1), draw(k), { dir: 'left' }); else draw(k)(); shade(300, 760, 0.45, 0);
          if (CMT) sticker(t); else K7.need('the comment', W / 2, 460, 26, { align: 'center', col: WHT });
          const [anx, any] = posOf(elP('answer'), [540, 760]); boxCap(AN[k], anx, any, t, k * SD + (k ? 0.2 : 2.6), { size: 50, alpha: 1 - seg(lt, SD - 0.15, 0.15) }); }
        else { full(S[2], t, { lt: t - S[2].start }); endFade(t, OUT, 0.88); close(t, OUT, { y: 600, line: END, lineL: { size: 86 } }); }
      },
      cues() { const ev = [['notify', 0.1, 0.35, 0], ['pop', 0.15, 0.3, 0]]; S.forEach((s, k) => { if (k) ev.push(['swish', s.start, 0.3, 0]); }); ev.push(['chime', OUT + 1.3, 0.16, 0]); return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ EPISODE
  function episode() {
    const PK = pk({ general: ['TIP OF THE WEEK', 'One thing to check before you hire anyone', 'Ask to see recent work\nGet it in writing'], food: ['BEHIND THE PASS', 'How our kitchen gets ready for service', 'Prep starts early\nEverything has a place'],
      estate: ['LISTING OF THE WEEK', 'What makes this home stand out', 'Natural light\nRoom to grow'], home: ['BACKYARD BASICS', 'How to plan an outdoor space you’ll actually use', 'Start with how you live\nPlan the flow first'],
      beauty: ['FRESH CUT FRIDAY', 'How to keep your fade sharp', 'Book every 2–3 weeks\nAsk about line-ups'], auto: ['DETAIL DIARIES', 'The two-bucket wash, explained', 'One bucket to wash\nOne bucket to rinse'],
      hosp: ['PLANNING 101', 'Book your venue first', 'Pick a date range\nThen build the guest list'], retail: ['STYLE NOTES', 'Three ways to wear one piece', 'Dress it up\nKeep it casual'],
      pro: ['MONDAY MINUTE', 'One habit that saves hours', 'Batch the small stuff\nProtect your focus time'] });
    const SER = TX('series', PK[0], { label: 'Series name', group: 'The series', upper: true, max: 22 }), EP = TX('ep', '01', { label: 'Episode number', group: 'The series', max: 3 });
    const LES = TX('lesson', PK[1], { label: 'This episode’s lesson', group: 'This episode', max: 64 }), BUL = TX('points', PK[2], { label: 'Key points (one per line)', group: 'This episode', multiline: true, max: 80 });
    const BL = String(BUL).split('\n').map(x => x.trim()).filter(Boolean).slice(0, 2), nxt = String((parseInt(EP, 10) || 1) + 1).padStart(String(EP).length, '0');
    const SD = 4.0, OUT = 3 * SD, DUR = OUT + 4.0, FR0 = [70, 450, 940, 720], FR = EL && EL.box ? [num(EL.box.x, FR0[0]), num(EL.box.y, FR0[1]), num(EL.box.w, FR0[2]), num(EL.box.h, FR0[3])] : FR0;
    const S = shots([1, 2, 3].map(k => ['s' + k, 'Shot ' + k, SD + 0.4, 'l']), 0); S.forEach((s, k) => (s.start = k * SD));
    function elements() {
      const epP = posOf(elP('ep'), [220, 330]), seP = posOf(elP('series'), [660, 334]), prP = posOf(elP('progress'), [90, 400]), leP = posOf(elP('lesson'), [540, 1250]);
      const points = BL.map((b, i) => { const p = posOf(elP('point' + (i + 1)), [540, 1340 + i * 54]); return { id: 'point' + (i + 1), kind: 'pos', label: b, x: p[0], y: p[1], t0: SD * (i + 1) + 0.2, d: OUT - (SD * (i + 1) + 0.2), box: [p[0] - 450, p[1] - 30, 900, 60], dup: false, del: false }; });
      return [
        { id: 'frame', kind: 'box', label: 'Episode frame', x: FR[0], y: FR[1], w: FR[2], h: FR[3], t0: 0, d: OUT, box: [FR[0], FR[1], FR[2], FR[3]], dup: false, del: false },
        { id: 'ep', kind: 'pos', label: 'EP. ' + EP, x: epP[0], y: epP[1], t0: 0.1, d: OUT - 0.1, box: [epP[0] - 100, epP[1] - 40, 200, 80], dup: false, del: false },
        { id: 'series', kind: 'pos', label: SER, x: seP[0], y: seP[1], t0: 0.3, d: OUT - 0.3, box: [seP[0] - 100, seP[1] - 50, 560, 100], dup: false, del: false },
        { id: 'progress', kind: 'pos', label: 'Progress bar', x: prP[0], y: prP[1], t0: 0, d: OUT, box: [prP[0], prP[1] - 10, 900, 26], dup: false, del: false },
        { id: 'lesson', kind: 'pos', label: LES, x: leP[0], y: leP[1], t0: 0.6, d: OUT - 0.6, box: [leP[0] - 450, leP[1] - 60, 900, 120], dup: false, del: false },
        ...points,
        ...closeEls(OUT, DUR, 'FOLLOW FOR EP. ' + nxt),
      ];
    }
    return {
      dur: DUR, elements,
      render(t) {
        bg();
        if (t < OUT) {
          const k = Math.min(2, Math.floor(t / SD)), lt = t - k * SD, draw = j => () => { ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.roundRect(FR[0] + SH.x, FR[1] + SH.y, FR[2], FR[3], 30); ctx.clip(); } whole(S[j], t, FR, { lt: t - S[j].start }); ctx.restore(); };
          if (!VID.collecting) { const c = G(), p = fa(t, 0.1, 0.5); c.globalAlpha = p; c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.roundRect(FR[0] - 10, FR[1] - 10, FR[2] + 20, FR[3] + 20, 36); c.fill(); D(); }
          if (k > 0 && lt < 0.3) cut('softwipe', t, k * SD, 0.6, draw(k - 1), draw(k), { dir: 'up' }); else draw(k)();
          const [epx, epy] = posOf(elP('ep'), [220, 330]); type(L8({ text: 'EP. ' + EP, slot: 'Mont', wt: 900, size: 34, track: 160, w: 400, color: K8.onCol(OR), fx: { deco: 'pill', dcol: 'accent' }, anim: { in: 'pop', out: 'none' }, x: epx, y: epy, t0: 0.1, d: OUT }), t);
          const [sex, sey] = posOf(elP('series'), [660, 334]); type(L8({ text: SER, slot: 'Bebas', size: 66, w: 560, align: 'left', color: 'white', anim: { in: 'wipe', out: 'none' }, x: sex, y: sey, t0: 0.3, d: OUT }), t);
          if (!VID.collecting) { const c = G(), [prx, pry] = posOf(elP('progress'), [90, 400]); c.fillStyle = WA(0.25); c.fillRect(prx, pry, 900, 6); c.fillStyle = OR; c.fillRect(prx, pry, 900 * clamp(t / OUT), 6); D(); }
          const [lex, ley] = posOf(elP('lesson'), [540, 1250]); type(L8({ text: LES, slot: 'Mont', wt: 800, size: 46, w: 900, color: 'white', anim: { in: 'words', out: 'none' }, x: lex, y: ley, t0: 0.6, d: OUT }), t);
          BL.forEach((b, i) => { const tt = SD * (i + 1) + 0.2; if (t < tt) return; const [ptx, pty] = posOf(elP('point' + (i + 1)), [540, 1340 + i * 54]); K7.txt('✓  ' + b, ptx, pty, F(700, 34, 'Mont'), WA(0.92), { align: 'center', a: fa(t, tt, 0.4) }); });
        }
        if (t >= OUT) { endFade(t, OUT, 0.3); close(t, OUT, { y: 600, line: 'FOLLOW FOR EP. ' + nxt, lineL: { size: 92 } }); }
      },
      cues() { const ev = [['pop', 0.1, 0.3, -0.3], ['swish', 0.3, 0.25, 0.3]]; S.forEach((s, k) => { if (k) ev.push(['air', s.start, 0.25, 0]); }); BL.forEach((b, i) => ev.push(['tick', SD * (i + 1) + 0.2, 0.25, 0])); ev.push(['notify', OUT + 0.7, 0.25, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  const MAKE = { wall: () => wallCore(false), pick: () => wallCore(true), day, oneword: () => oneword(false), pov, notes, numbers, spotlight, rate, reply, episode, loop: () => oneword(true) };
  const P = (MAKE[V] || MAKE.wall)();
  DIR = { dur: P.dur, bg: BLK, bgSwap: true, finish: { vig: 0.22, grain: 0.12 }, edl: [], shakes: P.shakes, preload: () => K3.init(), render: P.render, cues: P.cues, sig: V, ...(P.elements ? { elements: P.elements } : {}) };
});
