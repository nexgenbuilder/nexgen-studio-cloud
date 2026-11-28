'use strict';
/* NexGen Studio V24 (Nov 13): six formats for car dealers, detailers, carpet cleaners and photo / video studios.
   ?v=lotx    On the Lot         one vehicle: your footage with a brand bar, a spec card, a price tag and a badge
   ?v=reelx   Inventory Reel     three vehicles, each with its name and price, counted 01 to 03
   ?v=eventx  Sales Event        your event name, up to two offers, the dates and your terms over your footage
   ?v=walkx   Walkaround         one clip plays through while feature callouts pop on, with the name and price below
   ?v=wipex   The Reveal         before, then a shine sweeps across and leaves the after
   ?v=lensx   Through the Lens   a portfolio seen through a viewfinder: focus locks, the shutter fires, the next shot
   Footage is shown whole (never cropped or zoomed) on a soft blur of itself; clips play at real speed. Every name, price,
   spec, offer, date and term is a field: the defaults are placeholders to replace, not facts. Soundtracks mix live. */
(() => {   // gallery cards: each format's own colours and type until a brand is applied
  const P = (accent, ink, text, accent2, paper, deep1, deep2) => ({ accent, ink, text, accent2, paper, deep1, deep2 }), F4 = { sans: 'mont', serif: 'dmserif', display: 'bebas', script: 'marker' };
  Object.assign(K7.FAM, {
    listx: { pal: P('#E11D2E', '#0C0D10', '#F4F5F7', '#FFB020', '#F4F5F7', '#1A1C22', '#050608'), brandFirst: true, fonts: F4, music: 'pulse', bpm: 112 },
    lotx: { pal: P('#E11D2E', '#0C0D10', '#F4F5F7', '#FFB020', '#F4F5F7', '#1A1C22', '#050608'), brandFirst: true, fonts: F4, music: 'pulse', bpm: 112 },
    reelx: { pal: P('#FFB020', '#0B0C0F', '#F5F5F2', '#E11D2E', '#F5F5F2', '#1B1D24', '#050608'), brandFirst: true, fonts: F4, music: 'pulse', bpm: 116 },
    eventx: { pal: P('#FF3B30', '#0D0B0C', '#FFF6F2', '#FFD60A', '#FFF6F2', '#22151A', '#070405'), brandFirst: true, fonts: F4, music: 'pulse', bpm: 120 },
    walkx: { pal: P('#2F80ED', '#0A0F1A', '#EEF3FA', '#5CE1E6', '#EEF3FA', '#13202F', '#03070D'), brandFirst: true, fonts: F4, music: 'lounge', bpm: 96 },
    wipex: { pal: P('#14B8A6', '#0A1614', '#EEF6F4', '#5CE1E6', '#EEF6F4', '#12241F', '#030908'), brandFirst: true, fonts: F4, music: 'lounge', bpm: 96 },
    lensx: { pal: P('#E0B04A', '#0E0E10', '#F5F2EC', '#FF3B30', '#F5F2EC', '#1C1B1F', '#050506'), brandFirst: true, fonts: F4, music: 'night', bpm: 100 },
  });
})();

STUDIO_REG['nx9'] = (() => {
  const V = QS.get('v') || 'lotx';
  // Per-element model (b): when this template runs as a nested block inside a
  // free edit, tpl_free sets window.__NX_BLOCK_EL to the block's `el` data
  // before calling this function and clears it after. The template captures
  // that (live) object at build time; render() reads positions from it.
  // No `el` (standalone projects, old blocks) -> EL is null and every
  // position below falls back to the original hardcoded value, so rendering
  // is byte-for-byte the old path.
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  // In-block element order: el.order is the block's persisted draw order
  // (first = bottom, last = on top), written by the editor's order buttons.
  // Absent = the template's own order. Elements missing from the list keep
  // their natural place at the end, so a new duplicate still lands on top.
  const orderEls = list => {
    const ord = EL && Array.isArray(EL.order) ? EL.order : null;
    if (!ord) return list;
    const pos = new Map(ord.map((id, i) => [id, i]));
    return list.slice().sort((a, b) => {
      const pa = pos.has(a.id) ? pos.get(a.id) : 1e9, pb = pos.has(b.id) ? pos.get(b.id) : 1e9;
      return pa - pb;
    });
  };
  const { TAU, pk, up, seg, SP, SS, SB, onAcc, INKD, CARD, MUTE, tx, fit, rr, logoImg, shot, pic, touch, stage, words, pillBtn, close, closeCues, bed } = SHOWKIT();
  const dash = s => !s || String(s).trim() === '-';
  const CAT = BRAND.cat || BRAND.industry || 'general', NAME = BRAND.name || 'Your business';
  const shadow = (c, b, y, a) => { c.shadowColor = 'rgba(0,0,0,' + (a === undefined ? 0.4 : a) + ')'; c.shadowBlur = b; c.shadowOffsetY = y; };
  const noShadow = c => { c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0; };
  const frameOf = (s, lt, q) => { const m = VID.meta(s.c); if (!m) return null; const ts = m.still ? 0 : clamp(s.in + Math.max(0, lt), 0, (m.n - 1.5) / 30); return VID.get(s.c, VID.idx(s.c, ts), q || 'f'); };
  // the whole frame, never cropped: sharp and complete in the middle of the box, a soft blur of itself filling the rest
  let BG = null;
  function whole(s, lt, x, y, w, h, o) {
    o = o || {}; const img = frameOf(s, lt, 'f'); if (VID.collecting || !img) return; const c = ctx;
    if (!BG) { BG = document.createElement('canvas'); BG.width = 216; BG.height = 384; BG.g = BG.getContext('2d'); }
    const g = BG.g, kc = Math.max(BG.width / img.width, BG.height / img.height) * 1.12; g.save(); g.filter = 'blur(7px)'; g.drawImage(img, (BG.width - img.width * kc) / 2, (BG.height - img.height * kc) / 2, img.width * kc, img.height * kc); g.restore();
    c.save(); rr(x, y, w, h, o.r || 0); c.clip(); c.imageSmoothingQuality = 'high'; c.drawImage(BG, x, y, w, h); c.fillStyle = 'rgba(0,0,0,' + (o.dim === undefined ? 0.38 : o.dim) + ')'; c.fillRect(x, y, w, h);
    const k = Math.min(w / img.width, h / img.height), dw = img.width * k, dh = img.height * k, dy = y + (h - dh) * (o.py === undefined ? 0.5 : o.py);
    c.drawImage(img, x + (w - dw) / 2, dy, dw, dh); c.restore(); return [x + (w - dw) / 2, dy, dw, dh];
  }
  const shade = (y0, y1, a0, a1) => { const c = ctx, g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(0,0,0,' + a0 + ')'); g.addColorStop(1, 'rgba(0,0,0,' + a1 + ')'); c.fillStyle = g; c.fillRect(0, Math.min(y0, y1), W, Math.abs(y1 - y0)); };
  // the brand bar: logo (or the name) on a dark strip that drops in from the top
  let BT = null;   // V27: where the logo sits and an optional contact strip (Branding fields, set after the template's own)
  function bar(t, t0) { K17.top(t, t0 || 0.15, BT); }
  // a price tag that swings on its string
  function tag(label, price, x, y, t, t0) {
    if (dash(price) || t < t0 || VID.collecting) return; const c = ctx, e = SB(t, t0, 1.0), sw = Math.sin((t - t0) * 3.2) * 0.05 * Math.max(0, 1 - (t - t0) * 0.5), fs = fit(price, 400, 'Bebas', 330, 104, 1), w = Math.max(250, textW(price, F(400, fs, 'Bebas'), 1) + 96), h = 168;
    c.save(); c.globalAlpha *= clamp((t - t0) * 7); c.translate(x, y); c.rotate(-0.06 + sw + (1 - e) * 0.5); c.scale(0.5 + 0.5 * e, 0.5 + 0.5 * e);
    shadow(c, 26, 10, 0.4); c.fillStyle = OR; c.beginPath(); c.moveTo(-w + 46, -h / 2); c.lineTo(0, -h / 2); c.lineTo(0, h / 2); c.lineTo(-w + 46, h / 2); c.lineTo(-w, 0); c.closePath(); c.fill(); noShadow(c);
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.arc(-w + 44, 0, 12, 0, TAU); c.fill();
    if (label) tx(up(label), -w / 2 + 34, -38, { size: 24, wt: 800, ls: 3, col: onAcc(), a: 0.82 }); tx(price, -w / 2 + 34, label ? 50 : 34, { size: fs, wt: 400, fam: 'Bebas', ls: 1, col: onAcc() }); c.restore();
  }
  function chip(s, cx, y, k, o) { o = o || {}; if (!s || k <= 0) return 0; const c = ctx, fs = o.size || 28, w = textW(s, F(700, fs, 'Mont'), 2) + 44, h = fs * 2; c.save(); c.globalAlpha *= clamp(k * 3); c.translate(cx, y); c.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
    c.fillStyle = o.bg || 'rgba(20,20,26,0.07)'; rr(-w / 2, -h / 2, w, h, h / 2); c.fill(); tx(s, 0, fs * 0.36, { size: fs, wt: 700, ls: 2, col: o.col || INKD }); c.restore(); return w; }
  function badge(s, x, y, t, t0, rot) { if (dash(s) || t < t0 || VID.collecting) return; const c = ctx, e = SB(t, t0, 0.9), fs = fit(s, 900, 'Mont', 420, 40, 2), w = textW(s, F(900, fs, 'Mont'), 2) + 56;
    c.save(); c.globalAlpha *= clamp((t - t0) * 8); c.translate(x, y); c.rotate((rot === undefined ? -0.07 : rot) + (1 - e) * -0.4); c.scale(0.4 + 0.6 * e, 0.4 + 0.6 * e); shadow(c, 18, 8, 0.4); c.fillStyle = CARD; rr(-w / 2, -42, w, 84, 14); c.fill(); noShadow(c);
    c.strokeStyle = OR; c.lineWidth = 5; rr(-w / 2 + 8, -34, w - 16, 68, 9); c.stroke(); tx(s, 0, fs * 0.36, { size: fs, wt: 900, ls: 2, col: INKD }); c.restore(); }
  const fine = (s, t, t0, yb, xb) => { yb = yb || 1478; xb = xb || 540; if (dash(s) || VID.collecting) return; const a = seg(t, t0, 0.5); if (a <= 0) return; const wsz = 21, f = F(500, wsz, 'Mont'), out = []; let cur = '';
    for (const w of String(s).split(/\s+/)) { if (textW((cur + ' ' + w).trim(), f, 0.5) > 900 && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); } if (cur) out.push(cur);
    out.slice(0, 3).forEach((ln, i) => tx(ln, xb, yb - (Math.min(3, out.length) - 1 - i) * 28, { size: wsz, wt: 500, ls: 0.5, col: WA(0.78), a, shadow: 'rgba(0,0,0,0.6)' })); };
  // a wipe between two full-frame shots
  const cutK = (t, at) => E.inOutC(seg(t, at - 0.22, 0.44));

  // ================================================================ ON THE LOT
  function lotx() {
    const dealer = CAT === 'dealership';
    const NM = TX('name', dealer ? 'YEAR MAKE MODEL' : 'WHAT THIS IS', { label: dealer ? 'Vehicle (year, make, model)' : 'Name', group: 'The vehicle', upper: true, max: 34 });
    const SUB = TX('sub', dealer ? 'TRIM  ·  COLOUR' : 'A SHORT DETAIL', { label: 'Second line (a dash leaves it off)', group: 'The vehicle', upper: true, max: 40 });
    const PL = TX('plabel', 'OUR PRICE', { label: 'Label above the price', group: 'Price', upper: true, max: 18 }), PR = TX('price', '$00,000', { label: 'Price (a dash leaves the tag off)', group: 'Price', max: 14, hint: 'A placeholder: type the real price, or a dash for no price tag.' });
    const SPV = [1, 2, 3].map(i => TX('sp' + i, dealer ? ['MILEAGE', 'ENGINE', 'DRIVETRAIN'][i - 1] : ['DETAIL ONE', 'DETAIL TWO', 'DETAIL THREE'][i - 1], { label: 'Spec ' + i + ' (a dash leaves it off)', group: 'Specs', upper: true, max: 20 })).filter(s => !dash(s));
    const BD = TX('badge', dealer ? 'JUST ARRIVED' : 'NEW', { label: 'Badge (a dash leaves it off)', group: 'Extras', upper: true, max: 18 }), STK = TX('stock', '-', { label: 'Stock number (a dash leaves it off)', group: 'Extras', upper: true, max: 22 });
    const FINE = TX('fine', '-', { label: 'Terms or disclaimer (a dash leaves it off)', group: 'Extras', max: 170 }), END = TX('end', dealer ? 'COME TAKE A TEST DRIVE' : 'COME SEE IT', { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const SH3 = [shot('s1', 'Outside', 4, 'l'), shot('s2', 'Inside', 3.4, 'l'), shot('s3', 'A detail', 3.6, 'l')], CUT = [3.4, 6.2], OUT = 9.4, DUR = OUT + 4.1;
    // spec card box (inner texts follow the card unless dragged on their own)
    const CH0 = SPV.length ? 330 : 230, CX = num(EL && EL.box && EL.box.x, 60), CY = num(EL && EL.box && EL.box.y, 1130), CW = num(EL && EL.box && EL.box.w, 960), CH = num(EL && EL.box && EL.box.h, CH0);
    const elP = id => (EL && EL.pos && EL.pos[id]) || null;
    function elements() { const p = (id, d) => posOf(elP(id), d), tagP = p('tag', [CX + 970, CY + 6]), fineP = p('fine', [540, 1478]), nmP = p('name', [CX + 56, CY + 104]), suP = p('sub', [CX + 58, CY + 158]), stP = p('stock', [CX + 58, CY + 196]), spP = p('specs', [CX + 56, CY + CH - 66]), bdP = p('badge', [250, 380]); return orderEls([
      { id: 'card', kind: 'box', label: 'Spec card', x: CX, y: CY, w: CW, h: CH, t0: 0.5, d: DUR - 0.5, box: [CX, CY, CW, CH], dup: false, del: false },
      { id: 'name', kind: 'pos', label: NM, x: nmP[0], y: nmP[1], t0: 0.5, d: DUR - 0.5, box: [nmP[0], nmP[1] - 104, 560, 120], dup: false, del: false },
      { id: 'sub', kind: 'pos', label: SUB, x: suP[0], y: suP[1], t0: 0.5, d: DUR - 0.5, box: [suP[0], suP[1] - 31, 600, 50], dup: false, del: false },
      { id: 'stock', kind: 'pos', label: 'STOCK ' + STK, x: stP[0], y: stP[1], t0: 0.5, d: DUR - 0.5, box: [stP[0], stP[1] - 21, 400, 40], dup: false, del: false },
      { id: 'specs', kind: 'pos', label: 'Spec chips', x: spP[0], y: spP[1], t0: 0.5, d: DUR - 0.5, box: [spP[0], spP[1] - 30, CW - 112, 60], dup: false, del: false },
      { id: 'badge', kind: 'pos', label: BD, x: bdP[0], y: bdP[1], t0: 0.9, d: DUR - 0.9, box: [bdP[0] - 240, bdP[1] - 42, 480, 84], dup: false, del: false },
      { id: 'tag', kind: 'pos', label: 'Price tag', x: tagP[0], y: tagP[1], t0: 1.25, d: DUR - 1.25, box: [tagP[0] - 330, tagP[1] - 84, 330, 168], dup: false, del: false },
      { id: 'fine', kind: 'pos', label: 'Terms', x: fineP[0], y: fineP[1], t0: 2.2, d: DUR - 2.2, box: [fineP[0] - 450, fineP[1] - 84, 900, 84], dup: false, del: false },
    ].filter(e => e.id !== 'sub' || !dash(SUB)).filter(e => e.id !== 'stock' || !dash(STK)).filter(e => e.id !== 'specs' || SPV.length).filter(e => e.id !== 'badge' || !dash(BD)).filter(e => e.id !== 'fine' || !dash(FINE))); }
    function render(t) {
      stage(t); const c = ctx, i = t < CUT[0] ? 0 : t < CUT[1] ? 1 : 2, st = [0, CUT[0], CUT[1]];
      SH3.forEach((s, j) => { if (j !== i) touch(s, t - st[j]); });
      const ka = i > 0 ? cutK(t, st[i]) : 1; if (ka < 1 && i > 0) whole(SH3[i - 1], t - st[i - 1], 0, 0, W, H, { py: 0.4 });
      c.save(); if (ka < 1) { c.beginPath(); c.rect(W * (1 - ka), 0, W * ka, H); c.clip(); } whole(SH3[i], t - st[i], 0, 0, W, H, { py: 0.4 }); c.restore();
      if (ka > 0 && ka < 1) { c.fillStyle = OR; c.fillRect(W * (1 - ka) - 7, 0, 14, H); }
      if (VID.collecting) return;
      const [bx, by] = posOf(elP('badge'), [250, 380]);
      shade(1000, 1620, 0, 0.55); bar(t, 0.15); badge(BD, bx, by, t, 0.9);
      // the spec card
      const e = SP(t, 0.5, 0.85), a = clamp((t - 0.5) * 6), y0 = CY, ch = CH; if (a > 0) { c.save(); c.globalAlpha *= a; c.translate(0, (1 - e) * 500 + 4 * Math.sin(t * 1.2));
        shadow(c, 50, 18, 0.45); c.fillStyle = CARD; rr(CX, y0, CW, ch, 34); c.fill(); noShadow(c); c.fillStyle = OR; rr(CX, y0, 16, ch, 8); c.fill();
        const [nmx, nmy] = posOf(elP('name'), [CX + 56, y0 + 104]); tx(NM, nmx, nmy, { size: fit(NM, 400, 'Bebas', 560, 104, 1.5), wt: 400, fam: 'Bebas', ls: 1.5, col: INKD, align: 'left' });
        if (!dash(SUB)) { const [sux, suy] = posOf(elP('sub'), [CX + 58, y0 + 158]); tx(SUB, sux, suy, { size: fit(SUB, 600, 'Mont', 600, 31, 2.5), wt: 600, ls: 2.5, col: MUTE, align: 'left' }); }
        if (!dash(STK)) { const [stx, sty] = posOf(elP('stock'), [CX + 58, y0 + 196]); tx('STOCK ' + STK, stx, sty, { size: 21, wt: 600, ls: 2.5, col: MUTE, align: 'left' }); }
        const [spx, spy] = posOf(elP('specs'), [CX + 56, y0 + ch - 66]); let x = spx; SPV.forEach((s, j) => { const k = SB(t, 1.5 + j * 0.14, 0.8), w = textW(s, F(700, 30, 'Mont'), 2) + 44; if (k > 0) chip(s, x + w / 2, spy, k, { size: 30 }); x += w + 14; });
        c.restore(); const [tgx, tgy] = posOf(elP('tag'), [CX + 970, y0 + 6]); tag(PL, PR, tgx, tgy + (1 - e) * 500, t, 1.25); }
      const [fnx, fny] = posOf(elP('fine'), [540, 1478]); fine(FINE, t, 2.2, fny, fnx); close(t, OUT, END);
    }
    return { dur: DUR, render, elements, cues() { const ev = [['whoosh', 0.2, 0.26, 0], ['thud', 0.75, 0.22, 0], ['pop', 0.95, 0.26, -0.3], ['pop', 1.3, 0.3, 0.4], ['tick', 1.55, 0.3, -0.2], ['tick', 1.69, 0.3, 0], ['tick', 1.83, 0.3, 0.2], ['swish', CUT[0] - 0.2, 0.34, 0.3], ['swish', CUT[1] - 0.2, 0.34, -0.3]]; closeCues(ev, OUT); return { dur: DUR, beds: [bed('pulse', DUR)], events: ev }; } };
  }

  // ================================================================ INVENTORY REEL
  function reelx() {
    const dealer = CAT === 'dealership';
    const TITLE = TX('title', dealer ? 'NEW ON THE LOT' : pk({ general: 'JUST IN', auto: 'FRESH THIS WEEK', estate: 'NEW THIS WEEK', retail: 'NEW IN' }), { label: 'Title', group: 'Title', upper: true, max: 22 });
    const IT = [1, 2, 3].map(i => ({ n: TX('n' + i, dealer ? 'YEAR MAKE MODEL' : 'ITEM ' + i, { label: 'Name ' + i, group: 'Item ' + i, upper: true, max: 30 }), s: TX('d' + i, dealer ? 'TRIM  ·  MILEAGE' : 'A SHORT DETAIL', { label: 'Detail ' + i + ' (a dash leaves it off)', group: 'Item ' + i, upper: true, max: 34 }),
      p: TX('p' + i, '$00,000', { label: 'Price ' + i + ' (a dash leaves it off)', group: 'Item ' + i, max: 14, hint: 'A placeholder: type the real price, or a dash.' }), sh: shot('s' + i, 'Item ' + i, 3.4, 'l') }));
    const END = TX('end', dealer ? 'SEE THE FULL INVENTORY' : 'THERE’S MORE TO SEE', { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const T0 = 1.5, LEN = 3.0, OUT = T0 + LEN * 3, DUR = OUT + 4.1;
    const elP = id => (EL && EL.pos && EL.pos[id]) || null;
    function elements() { const p = (id, d) => posOf(elP(id), d), tiP = p('title', [540, 960]), coP = p('count', [96, 1210]), nmP = p('name', [96, 1320]), deP = p('detail', [98, 1380]), prP = p('price', [1010, 1120]); return orderEls([
      { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0, d: T0 + 0.3, box: [tiP[0] - 470, tiP[1] - 170, 940, 170], dup: false, del: false },
      { id: 'count', kind: 'pos', label: 'Item counter', x: coP[0], y: coP[1], t0: T0, d: OUT - T0, box: [coP[0], coP[1] - 150, 240, 170], dup: false, del: false },
      { id: 'name', kind: 'pos', label: 'Item name', x: nmP[0], y: nmP[1], t0: T0, d: OUT - T0, box: [nmP[0], nmP[1] - 110, 880, 130], dup: false, del: false },
      { id: 'detail', kind: 'pos', label: 'Item detail', x: deP[0], y: deP[1], t0: T0, d: OUT - T0, box: [deP[0], deP[1] - 30, 860, 50], dup: false, del: false },
      { id: 'price', kind: 'pos', label: 'Price tag', x: prP[0], y: prP[1], t0: T0 + 0.6, d: OUT - T0 - 0.6, box: [prP[0] - 330, prP[1] - 84, 330, 168], dup: false, del: false },
    ]); }
    function render(t) {
      stage(t); const c = ctx, i = clamp(Math.floor((t - T0) / LEN), 0, 2), lt = t - T0 - i * LEN;
      IT.forEach((it, j) => { if (j !== i) touch(it.sh, 0); });
      if (t < T0 + 0.3) { whole(IT[0].sh, 0, 0, 0, W, H, { dim: 0.6 }); if (!VID.collecting) { c.fillStyle = 'rgba(0,0,0,' + 0.5 * (1 - seg(t, T0 - 0.1, 0.4)) + ')'; c.fillRect(0, 0, W, H); const a = 1 - seg(t, T0 - 0.25, 0.3); const [tix, tiy] = posOf(elP('title'), [540, 960]); words(TITLE, tix, tiy, t, 0.25, { size: fit(TITLE, 400, 'Bebas', 940, 170, 3), fam: 'Bebas', wt: 400, ls: 3, a, shadow: 'rgba(0,0,0,0.5)' }); c.fillStyle = OR; c.globalAlpha = a; c.fillRect(540 - 110 * E.outC(seg(t, 0.5, 0.5)), 1030, 220 * E.outC(seg(t, 0.5, 0.5)), 8); c.globalAlpha = 1; } }
      if (t >= T0 - 0.05) { const k = i > 0 || t >= T0 ? E.outExpo(seg(lt, 0, 0.45)) : 0; if (i > 0 && k < 1) whole(IT[i - 1].sh, LEN + lt, 0, 0, W, H, { py: 0.38 });
        c.save(); c.translate(0, (1 - k) * H * (i ? 1 : 0)); if (i === 0) c.globalAlpha = seg(t, T0 - 0.05, 0.3); whole(IT[i].sh, lt, 0, 0, W, H, { py: 0.38 }); c.restore(); }
      if (VID.collecting || t < T0) { if (!VID.collecting) bar(t, 0.15); return; }
      shade(1040, 1620, 0, 0.6); bar(t, 0.15); const it = IT[i], e = SP(lt, 0.25, 0.8), a = clamp((lt - 0.25) * 6) * (1 - seg(lt, LEN - 0.22, 0.2));
      c.save(); c.globalAlpha *= a; const [cox, coy] = posOf(elP('count'), [96, 1210]); tx('0' + (i + 1), cox, coy + (1 - e) * 60, { size: 150, wt: 400, fam: 'Bebas', col: OR, align: 'left', shadow: 'rgba(0,0,0,0.5)' }); tx('/ 03', cox + 140, coy - 4 + (1 - e) * 60, { size: 40, wt: 700, ls: 2, col: WA(0.8), align: 'left' });
      const [nmx, nmy] = posOf(elP('name'), [96, 1320]); tx(it.n, nmx, nmy + (1 - e) * 80, { size: fit(it.n, 400, 'Bebas', 880, 110, 2), wt: 400, fam: 'Bebas', ls: 2, col: WHT, align: 'left', shadow: 'rgba(0,0,0,0.55)' });
      if (!dash(it.s)) { const [dex, dey] = posOf(elP('detail'), [98, 1380]); tx(it.s, dex, dey + (1 - e) * 90, { size: fit(it.s, 600, 'Mont', 860, 30, 3), wt: 600, ls: 3, col: WA(0.9), align: 'left', shadow: 'rgba(0,0,0,0.55)' }); } c.restore();
      c.save(); c.globalAlpha *= 1 - seg(lt, LEN - 0.22, 0.2); const [prx, pry] = posOf(elP('price'), [1010, 1120]); tag('', it.p, prx, pry, lt, 0.6); c.restore();
      for (let j = 0; j < 3; j++) { c.fillStyle = j === i ? OR : WA(0.4); rr(96 + j * 62, 1440, j === i ? 48 * clamp(lt / LEN + 0.15, 0, 1) + 6 : 48, 8, 4); c.fill(); if (j === i) { c.fillStyle = WA(0.25); rr(96 + j * 62, 1440, 48, 8, 4); c.fill(); } }
      close(t, OUT, END);
    }
    return { dur: DUR, render, elements, cues() { const ev = [['whoosh', 0.2, 0.26, 0], ['thud', 0.7, 0.2, 0]]; for (let i = 0; i < 3; i++) ev.push(['swish', T0 + i * LEN - 0.05, 0.36, i % 2 ? 0.3 : -0.3], ['pop', T0 + i * LEN + 0.6, 0.28, 0.4]); closeCues(ev, OUT); return { dur: DUR, beds: [bed('pulse', DUR)], events: ev }; } };
  }

  // ================================================================ SALES EVENT
  function eventx() {
    const EV = TX('event', pk({ general: 'YOUR EVENT NAME', auto: 'YOUR SALES EVENT' }), { label: 'Event name', group: 'The event', upper: true, max: 26 }), KICK = TX('kick', 'NOW ON', { label: 'Burst (a dash leaves it off)', group: 'The event', upper: true, max: 12 });
    const O1 = TX('o1', 'YOUR FIRST OFFER', { label: 'Offer 1', group: 'Offers', upper: true, max: 30, hint: 'A placeholder. Write the offer exactly as you advertise it.' }), O1S = TX('o1s', 'What it applies to', { label: 'Offer 1, small line (a dash leaves it off)', group: 'Offers', max: 44 });
    const O2 = TX('o2', 'YOUR SECOND OFFER', { label: 'Offer 2 (a dash leaves it off)', group: 'Offers', upper: true, max: 30 }), O2S = TX('o2s', 'What it applies to', { label: 'Offer 2, small line (a dash leaves it off)', group: 'Offers', max: 44 });
    const DATES = TX('dates', 'YOUR DATES', { label: 'Dates (a dash leaves them off)', group: 'The event', upper: true, max: 30 }), FINE = TX('fine', 'Add your terms here, or a dash to leave them off.', { label: 'Terms or disclaimer (a dash leaves it off)', group: 'Offers', max: 170 });
    const END = TX('end', pk({ general: 'DON’T MISS IT', auto: 'COME SEE US' }), { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const SH = shot('s1', 'Background', 9, 'l'), OFF = [[O1, O1S], [O2, O2S]].filter(o => !dash(o[0])), OUT = 8.6, DUR = OUT + 4.1, evL = EV.split(/\s+/).length > 2 ? [EV.split(/\s+/).slice(0, Math.ceil(EV.split(/\s+/).length / 2)).join(' '), EV.split(/\s+/).slice(Math.ceil(EV.split(/\s+/).length / 2)).join(' ')] : [EV];
    const elP = id => (EL && EL.pos && EL.pos[id]) || null;
    function elements() { const p = (id, d) => posOf(elP(id), d), by = 760 + evL.length * 150;
      const evP = p('event', [540, 760]), ev2P = p('event2', [540, 910]), buP = p('burst', [860, 420]), daP = p('dates', [540, by + 62 + OFF.length * 196]), fiP = p('fine', [540, 1640]);
      const els = [{ id: 'event', kind: 'pos', label: EV, x: evP[0], y: evP[1], t0: 0, d: DUR, box: [evP[0] - 480, evP[1] - 168, 960, 168], dup: false, del: false }];
      if (evL.length > 1) els.push({ id: 'event2', kind: 'pos', label: evL[1], x: ev2P[0], y: ev2P[1], t0: 0, d: DUR, box: [ev2P[0] - 480, ev2P[1] - 168, 960, 168], dup: false, del: false });
      if (!dash(KICK)) els.push({ id: 'burst', kind: 'pos', label: KICK, x: buP[0], y: buP[1], t0: 1.0, d: DUR - 1.0, box: [buP[0] - 140, buP[1] - 140, 280, 280], dup: false, del: false });
      OFF.forEach(([o, s], i) => { const ofP = p('offer' + (i + 1), [540, by + 10 + i * 196]); els.push({ id: 'offer' + (i + 1), kind: 'pos', label: o, x: ofP[0], y: ofP[1], t0: 1.6 + i * 0.5, d: DUR - (1.6 + i * 0.5), box: [ofP[0] - 470, ofP[1], 940, dash(s) ? 130 : 170], dup: false, del: false }); });
      if (!dash(DATES)) els.push({ id: 'dates', kind: 'pos', label: DATES, x: daP[0], y: daP[1], t0: 1.9 + OFF.length * 0.5, d: DUR - (1.9 + OFF.length * 0.5), box: [daP[0] - 450, daP[1] - 50, 900, 100], dup: false, del: false });
      if (!dash(FINE)) els.push({ id: 'fine', kind: 'pos', label: 'Terms', x: fiP[0], y: fiP[1], t0: 3.0, d: DUR - 3.0, box: [fiP[0] - 450, fiP[1] - 84, 900, 84], dup: false, del: false });
      return orderEls(els); }
    function render(t) {
      stage(t); const c = ctx; whole(SH, t, 0, 0, W, H, { py: 0.3, dim: 0.5 }); if (VID.collecting) return;
      shade(0, H, 0.25, 0.25); shade(700, 1650, 0, 0.72);
      // two accent bands sweep across
      for (let j = 0; j < 2; j++) { const k = E.outExpo(seg(t, 0.1 + j * 0.12, 0.7)), y = 560 + j * 44; c.save(); c.translate(540, y); c.rotate(-0.07); c.fillStyle = j ? WA(0.9) : OR; c.fillRect(-700, -12, 1400 * k, j ? 6 : 24); c.restore(); }
      bar(t, 0.15);
      const EVPOS = [posOf(elP('event'), [540, 760])]; if (evL.length > 1) EVPOS.push(posOf(elP('event2'), [540, 910]));
      evL.forEach((ln, i) => words(ln, EVPOS[i][0], EVPOS[i][1], t, 0.45 + i * 0.18, { size: fit(ln, 400, 'Bebas', 960, 168, 3), fam: 'Bebas', wt: 400, ls: 3, shadow: 'rgba(0,0,0,0.55)' }));
      const by = 760 + evL.length * 150;
      if (!dash(KICK) && t > 1.0) { const e = SB(t, 1.0, 0.9); const [bux, buy] = posOf(elP('burst'), [860, 420]); c.save(); c.translate(bux, buy); c.rotate(0.14 + Math.sin(t * 1.4) * 0.03); c.scale(0.3 + 0.7 * e, 0.3 + 0.7 * e); c.globalAlpha *= clamp((t - 1.0) * 8); shadow(c, 20, 8, 0.4); c.fillStyle = OR; c.beginPath(); for (let i = 0; i < 28; i++) { const r = i % 2 ? 118 : 138, an = i / 28 * TAU + t * 0.25; c.lineTo(Math.cos(an) * r, Math.sin(an) * r); } c.closePath(); c.fill(); noShadow(c);
        const ks = KICK.split(/\s+/); ks.slice(0, 2).forEach((w, i) => tx(w, 0, (ks.length > 1 ? -8 + i * 50 : 18), { size: fit(w, 900, 'Mont', 190, 52, 1), wt: 900, ls: 1, col: onAcc() })); c.restore(); }
      OFF.forEach(([o, s], i) => { const t0 = 1.6 + i * 0.5, e = SP(t, t0, 0.8), a = clamp((t - t0) * 6); if (a <= 0) return; const y = by + 10 + i * 196, h = dash(s) ? 130 : 170;
        const [ofx, ofy] = posOf(elP('offer' + (i + 1)), [540, y]);
        c.save(); c.globalAlpha *= a; c.translate(ofx + (i % 2 ? 1 : -1) * (1 - e) * 900, ofy + 4 * Math.sin(t * 1.3 + i)); c.rotate((i % 2 ? 1 : -1) * 0.012); shadow(c, 36, 14, 0.45); c.fillStyle = CARD; rr(-470, 0, 940, h, 26); c.fill(); noShadow(c); c.fillStyle = OR; rr(-470, 0, 18, h, 9); c.fill();
        tx(o, -420, dash(s) ? 88 : 80, { size: fit(o, 400, 'Bebas', 850, 82, 1.5), wt: 400, fam: 'Bebas', ls: 1.5, col: INKD, align: 'left' }); if (!dash(s)) tx(s, -418, 134, { size: fit(s, 600, 'Mont', 850, 32, 0.5), wt: 600, ls: 0.5, col: MUTE, align: 'left' }); c.restore(); });
      if (!dash(DATES)) { const t0 = 1.9 + OFF.length * 0.5, k = SB(t, t0, 0.9); if (t > t0) { const [dax, day] = posOf(elP('dates'), [540, by + 62 + OFF.length * 196]); pillBtn(DATES, dax, day, { s: 0.5 + 0.5 * k, a: clamp((t - t0) * 6), size: 36, maxW: 900 }); } }
      const [fix, fiy] = posOf(elP('fine'), [540, 1640]); fine(FINE, t, 3.0, fiy, fix); close(t, OUT, END);
    }
    return { dur: DUR, render, elements, cues() { const ev = [['whoosh', 0.12, 0.32, -0.3], ['thud', 0.6, 0.26, 0], ['pop', 1.05, 0.3, 0.4]]; OFF.forEach((o, i) => ev.push(['swish', 1.6 + i * 0.5, 0.32, i % 2 ? 0.4 : -0.4], ['thud', 1.95 + i * 0.5, 0.18, 0])); ev.push(['pop', 2.1 + OFF.length * 0.5, 0.28, 0]); closeCues(ev, OUT); return { dur: DUR, beds: [bed('pulse', DUR)], events: ev }; } };
  }

  // ================================================================ WALKAROUND
  function walkx() {
    const dealer = CAT === 'dealership';
    const NM = TX('name', dealer ? 'YEAR MAKE MODEL' : pk({ general: 'WHAT THIS IS', auto: 'THE FULL DETAIL', home: 'THE FINISHED JOB', estate: 'THE PROPERTY' }), { label: 'Name', group: 'Name & price', upper: true, max: 32 });
    const PR = TX('price', dealer ? '$00,000' : '-', { label: 'Price (a dash leaves it off)', group: 'Name & price', max: 14, hint: 'A placeholder: type the real price, or a dash.' }), PL = TX('plabel', 'OUR PRICE', { label: 'Label above the price', group: 'Name & price', upper: true, max: 18 });
    const DEF = dealer ? ['FEATURE ONE', 'FEATURE TWO', 'FEATURE THREE', 'FEATURE FOUR'] : (BRAND.services || []).map(up).slice(0, 4).concat(['POINT ONE', 'POINT TWO', 'POINT THREE', 'POINT FOUR']).slice(0, 4);
    const hideSet = new Set(Array.isArray(EL && EL.hide) ? EL.hide.filter(k => typeof k === 'string') : []);
    const RAW = [1, 2, 3, 4].map(i => ({ key: 'f' + i, text: TX('f' + i, DEF[i - 1], { label: 'Callout ' + i + ' (a dash leaves it off)', group: 'Callouts', upper: true, max: 26 }) }));
    const FT = RAW.filter(o => !dash(o.text) && !hideSet.has(o.key));
    const EXTRA = (Array.isArray(EL && EL.extra) ? EL.extra : []).filter(x => x && typeof x.text === 'string' && !dash(x.text) && typeof x.id === 'string');
    const END = TX('end', dealer ? 'COME TAKE A TEST DRIVE' : 'SEE IT FOR YOURSELF', { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const SH = shot('s1', 'Your walkaround clip', 12, 'l'), STEP = 2.3, T0 = 1.6, OUT = Math.max(7.5, T0 + FT.length * STEP + 0.6), DUR = OUT + 4.1, POS = [[250, 520], [830, 700], [270, 880], [810, 1010]];
    // every callout to draw, originals (filtered-index timing, as before) plus duplicates (concurrent with their source, so DUR never changes)
    const items = FT.map((o, fi) => { const oi = RAW.indexOf(o), [px, py] = posOf(EL && EL.pos && EL.pos[o.key], POS[oi % 4]); return { id: o.key, text: o.text, x: px, y: py, t0: T0 + fi * STEP }; })
      .concat(EXTRA.map(x => ({ id: 'x' + x.id, text: x.text, x: num(x.x, 540), y: num(x.y, 960), t0: num(x.t0, T0) })));
    // the label card's box for a callout pin, in canvas px (same geometry as the draw below: dot + leader + card)
    function calloutBox(s, px, py) { const fs = fit(s, 800, 'Mont', 520, 34, 2), w = textW(s, F(800, fs, 'Mont'), 2) + 56, left = px < 540, lx = left ? px + 70 : px - 70, cx = lx + (left ? w / 2 - 20 : -w / 2 + 20);
      const x0 = Math.min(px - 24, cx - w / 2), x1 = Math.max(px + 24, cx + w / 2); return [x0, py - 152, x1 - x0, 176]; }
    function drawCallout(it, lt) { const s = it.text, e = SP(lt, 0, 0.7), a = clamp(lt * 7) * (1 - seg(lt, STEP - 0.05, 0.28)), [px, py] = [it.x, it.y], left = px < 540, fs = fit(s, 800, 'Mont', 520, 34, 2), w = textW(s, F(800, fs, 'Mont'), 2) + 56, lx = left ? px + 70 : px - 70;
      const c = ctx; c.save(); c.globalAlpha *= a; c.strokeStyle = WHT; c.lineWidth = 4; const rk = seg(lt, 0, 0.35); c.beginPath(); c.arc(px, py, 16 + 6 * Math.sin(lt * 5), 0, TAU); c.stroke(); c.fillStyle = OR; c.beginPath(); c.arc(px, py, 9, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(px + (left ? 18 : -18), py - 12); c.lineTo(lerp(px, lx, rk), py - 12 - 58 * rk); c.stroke();
      c.translate(lx + (left ? w / 2 - 20 : -w / 2 + 20), py - 112); c.scale(0.6 + 0.4 * e, 0.6 + 0.4 * e); shadow(c, 20, 8, 0.4); c.fillStyle = CARD; rr(-w / 2, -40, w, 80, 16); c.fill(); noShadow(c); c.fillStyle = OR; rr(-w / 2, -40, 12, 80, 6); c.fill();
      tx(s, 6, fs * 0.36, { size: fs, wt: 800, ls: 2, col: INKD }); c.restore(); }
    function elements() { const nmP = posOf(EL && EL.pos && EL.pos.name, [80, 1340]), tgP = posOf(EL && EL.pos && EL.pos.tag, [1020, 1196]); return orderEls(items.map(it => ({ id: it.id, kind: 'callout', label: it.text, x: it.x, y: it.y, t0: it.t0, d: STEP + 0.25, box: calloutBox(it.text, it.x, it.y), dup: true, del: true })).concat([
      { id: 'name', kind: 'pos', label: NM, x: nmP[0], y: nmP[1], t0: 0.6, d: DUR - 0.6, box: [nmP[0], nmP[1] - 104, 580, 120], dup: false, del: false },
      { id: 'tag', kind: 'pos', label: 'Price tag', x: tgP[0], y: tgP[1], t0: 1.1, d: DUR - 1.1, box: [tgP[0] - 330, tgP[1] - 84, 330, 168], dup: false, del: false },
    ]).filter(e => e.id !== 'tag' || !dash(PR))); }
    function render(t) {
      stage(t); const c = ctx, box = whole(SH, t, 0, 0, W, H, { py: 0.36 }); if (VID.collecting) return;
      shade(1040, 1620, 0, 0.6); bar(t, 0.15);
      // Draw order is el.order (first = bottom, last = on top): the callouts,
      // the name and the price tag interleave in that order. With no el.order
      // this is the template's natural order, so existing renders are unchanged.
      const drawName = () => { const e = SP(t, 0.6, 0.8), a = clamp((t - 0.6) * 6); if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(0, (1 - e) * 200);
        const [nmx, nmy] = posOf(EL && EL.pos && EL.pos.name, [80, 1340]);
        tx(NM, nmx, nmy, { size: fit(NM, 400, 'Bebas', dash(PR) ? 920 : 580, 104, 2), wt: 400, fam: 'Bebas', ls: 2, col: WHT, align: 'left', shadow: 'rgba(0,0,0,0.55)' }); c.fillStyle = OR; c.fillRect(nmx + 2, nmy + 28, 150 * E.outC(seg(t, 0.9, 0.5)), 8);
        if (FT.length) tx((clamp(Math.floor((t - T0) / STEP), 0, FT.length - 1) + 1) + ' OF ' + FT.length, nmx + 2, nmy + 80, { size: 28, wt: 700, ls: 3, col: WA(0.85), align: 'left', a: seg(t, T0, 0.3) }); c.restore(); };
      const drawTag = () => { const e = SP(t, 0.6, 0.8), a = clamp((t - 0.6) * 6); if (a <= 0) return; const [tgx, tgy] = posOf(EL && EL.pos && EL.pos.tag, [1020, 1196]); tag(PL, PR, tgx, tgy + (1 - e) * 200, t, 1.1); };
      orderEls(items.map(it => ({ id: it.id, run: () => { const lt = t - it.t0; if (lt < 0 || lt > STEP + 0.25) return; drawCallout(it, lt); } })).concat([{ id: 'name', run: drawName }, { id: 'tag', run: drawTag }])).forEach(d => d.run());
      close(t, OUT, END);
    }
    return { dur: DUR, render, elements, cues() { const ev = [['whoosh', 0.2, 0.24, 0], ['pop', 1.15, 0.28, 0.4]]; FT.forEach((s, i) => ev.push(['pop', T0 + i * STEP, 0.3, i % 2 ? 0.4 : -0.4], ['tick', T0 + i * STEP + 0.2, 0.24, 0])); closeCues(ev, OUT); return { dur: DUR, beds: [bed('lounge', DUR)], events: ev }; } };
  }

  // ================================================================ THE REVEAL
  function wipex() {
    const SV = (BRAND.services || []).map(up);
    const TITLE = TX('title', pk({ general: 'THE DIFFERENCE', auto: 'THE DETAIL DIFFERENCE', home: 'THE DIFFERENCE' }), { label: 'Title', group: 'Title', upper: true, max: 24 }), JOB = TX('job', SV[0] || 'WHAT WE DID', { label: 'What was done (a dash leaves it off)', group: 'Title', upper: true, max: 28 });
    const LA = TX('la', 'BEFORE', { label: 'First label', group: 'Labels', upper: true, max: 12 }), LB = TX('lb', 'AFTER', { label: 'Second label', group: 'Labels', upper: true, max: 12 });
    const END = TX('end', pk({ general: 'YOURS COULD BE NEXT', auto: 'YOUR CAR IS NEXT', home: 'YOUR HOME IS NEXT' }), { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const SA = shot('s1', 'Before', 8, 'l'), SBf = shot('s2', 'After', 8, 'l'), TW = 2.6, WD = 1.5, OUT = 7.6, DUR = OUT + 4.1;
    const BX0 = [60, 470, 960, 900], BX = EL && EL.box ? [num(EL.box.x, BX0[0]), num(EL.box.y, BX0[1]), num(EL.box.w, BX0[2]), num(EL.box.h, BX0[3])] : BX0;
    function elements() { const tiP = posOf(EL && EL.pos && EL.pos.title, [540, 330]), joP = posOf(EL && EL.pos && EL.pos.job, [540, 1480]); return orderEls([
      { id: 'box', kind: 'box', label: 'Before / After frame', x: BX[0], y: BX[1], w: BX[2], h: BX[3], t0: 0, d: DUR, box: [BX[0] - 14, BX[1] - 14, BX[2] + 28, BX[3] + 28], dup: false, del: false },
      { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0, d: DUR, box: [tiP[0] - 470, tiP[1] - 120, 940, 120], dup: false, del: false },
      { id: 'job', kind: 'pos', label: JOB, x: joP[0], y: joP[1], t0: 1.2, d: DUR - 1.2, box: [joP[0] - 450, joP[1] - 50, 900, 100], dup: false, del: false },
    ].filter(e => e.id !== 'job' || !dash(JOB))); }
    function render(t) {
      stage(t); const c = ctx, [x, y, w, h] = BX, e = SP(t, 0.2, 0.85), k = E.inOutC(seg(t, TW, WD)), wx = x + w * k;
      c.save(); c.translate(0, (1 - e) * 700 + 5 * Math.sin(t * 1.1)); c.globalAlpha *= clamp((t - 0.2) * 6);
      if (!VID.collecting) { shadow(c, 60, 22, 0.5); c.fillStyle = CARD; rr(x - 14, y - 14, w + 28, h + 28, 40); c.fill(); noShadow(c); }
      whole(SA, t, x, y, w, h, { r: 28 }); c.save(); c.beginPath(); c.rect(x - 2, y - 2, w * k + 2, h + 4); c.clip(); whole(SBf, t, x, y, w, h, { r: 28 }); c.restore();
      if (!VID.collecting) {
        if (k > 0 && k < 1) { const g = c.createLinearGradient(wx - 150, 0, wx + 30, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.8, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.save(); rr(x, y, w, h, 28); c.clip(); c.fillStyle = g; c.fillRect(wx - 150, y, 180, h); c.restore();
          c.fillStyle = WHT; shadow(c, 16, 0, 0.5); c.fillRect(wx - 5, y - 26, 10, h + 52); noShadow(c); c.fillStyle = OR; c.beginPath(); c.arc(wx, y + h / 2, 44, 0, TAU); c.fill(); c.strokeStyle = onAcc(); c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(wx - 14, y + h / 2 - 12); c.lineTo(wx - 24, y + h / 2); c.lineTo(wx - 14, y + h / 2 + 12); c.moveTo(wx + 14, y + h / 2 - 12); c.lineTo(wx + 24, y + h / 2); c.lineTo(wx + 14, y + h / 2 + 12); c.stroke();
          for (let i = 0; i < 6; i++) { const u = ((t * 1.7 + i * 0.37) % 1), sx = wx - 40 - u * 120, sy = y + ((i * 173 + 90) % h), r = 10 * (1 - u); c.save(); c.globalAlpha *= (1 - u); c.fillStyle = WHT; c.translate(sx, sy); c.rotate(t * 2 + i); c.beginPath(); for (let j = 0; j < 8; j++) { const rr2 = j % 2 ? r * 0.35 : r * 1.6; c.lineTo(Math.cos(j / 8 * TAU) * rr2, Math.sin(j / 8 * TAU) * rr2); } c.fill(); c.restore(); } }
        const lab = (s, lx, a, col, bg) => { if (a <= 0 || dash(s)) return; const fs = 34, lw = textW(s, F(800, fs, 'Mont'), 3) + 52; c.save(); c.globalAlpha *= a; c.fillStyle = bg; rr(lx - lw / 2, y + 28, lw, 68, 14); c.fill(); tx(s, lx, y + 28 + 46, { size: fs, wt: 800, ls: 3, col }); c.restore(); };
        lab(LA, x + w - 130, clamp((t - 0.9) * 5) * (1 - seg(t, TW + WD * 0.7, 0.3)), WHT, 'rgba(20,20,26,0.78)'); lab(LB, x + 120, seg(t, TW + WD * 0.45, 0.3), onAcc(), OR);
      }
      c.restore(); if (VID.collecting) return;
      const [tix, tiy] = posOf(EL && EL.pos && EL.pos.title, [540, 330]);
      words(TITLE, tix, tiy, t, 0.5, { size: fit(TITLE, 400, 'Bebas', 940, 120, 3), fam: 'Bebas', wt: 400, ls: 3, shadow: 'rgba(0,0,0,0.45)' });
      if (!dash(JOB)) { const kk = SB(t, 1.2, 0.9); if (t > 1.2) { const [jox, joy] = posOf(EL && EL.pos && EL.pos.job, [540, 1480]); pillBtn(JOB, jox, joy, { s: 0.5 + 0.5 * kk, a: clamp((t - 1.2) * 6), size: 32, maxW: 900 }); } }
      close(t, OUT, END);
    }
    return { dur: DUR, render, elements, cues() { const ev = [['whoosh', 0.2, 0.3, 0], ['thud', 0.8, 0.24, 0], ['pop', 1.25, 0.26, 0], ['swish', TW, 0.42, 0], ['sparkle', TW + 0.5, 0.2, 0.2], ['sparkle', TW + WD, 0.24, -0.2], ['pop', TW + WD, 0.3, 0]]; closeCues(ev, OUT); return { dur: DUR, beds: [bed('lounge', DUR)], events: ev }; } };
  }

  // ================================================================ THROUGH THE LENS
  function lensx() {
    const SV = (BRAND.services || []).map(up), photo = CAT === 'photo';
    const LBL = [1, 2, 3, 4].map(i => TX('l' + i, SV[i - 1] || (photo ? ['PORTRAITS', 'WEDDINGS', 'EVENTS', 'BRANDS'] : ['OUR WORK', 'UP CLOSE', 'ON THE JOB', 'THE RESULT'])[i - 1], { label: 'Label on shot ' + i + ' (a dash leaves it off)', group: 'Labels', upper: true, max: 22 }));
    const TITLE = TX('title', photo ? 'THROUGH OUR LENS' : pk({ general: 'A CLOSER LOOK', auto: 'UP CLOSE' }), { label: 'Title', group: 'Title', upper: true, max: 22 }), END = TX('end', photo ? 'BOOK YOUR SESSION' : 'SEE MORE OF OUR WORK', { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const SH4 = [1, 2, 3, 4].map(i => shot('s' + i, 'Shot ' + i, 3, 'l')), T0 = 1.4, LEN = 2.2, OUT = T0 + LEN * 4, DUR = OUT + 4.1;
    const FX0 = [[540, 780], [430, 900], [640, 700], [540, 860]], FX = FX0.map((p, i) => posOf(EL && EL.fx && EL.fx[String(i + 1)], p));
    function elements() { const tiP = posOf(EL && EL.pos && EL.pos.title, [540, 980]), lbP = posOf(EL && EL.pos && EL.pos.label, [540, 1400]); return orderEls(FX.map((p, i) => ({ id: 'fx' + (i + 1), kind: 'focus', label: 'Focus point · shot ' + (i + 1), x: p[0], y: p[1], t0: T0 + i * LEN, d: LEN, box: [p[0] - 90, p[1] - 90, 180, 180], dup: false, del: false })).concat([
      { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0, d: T0, box: [tiP[0] - 460, tiP[1] - 150, 920, 150], dup: false, del: false },
      { id: 'label', kind: 'pos', label: 'Shot label', x: lbP[0], y: lbP[1], t0: T0, d: DUR - T0, box: [lbP[0] - 450, lbP[1] - 62, 900, 124], dup: false, del: false },
    ])); }
    function render(t) {
      stage(t); const c = ctx, i = clamp(Math.floor((t - T0) / LEN), 0, 3), lt = t - T0 - i * LEN, pre = t < T0;
      SH4.forEach((s, j) => { if (j !== i) touch(s, 0); });
      whole(SH4[i], pre ? 0 : lt, 0, 0, W, H, { py: 0.42, dim: 0.45 }); if (VID.collecting) return;
      if (pre) { c.fillStyle = 'rgba(0,0,0,' + 0.55 * (1 - seg(t, T0 - 0.3, 0.3)) + ')'; c.fillRect(0, 0, W, H); const [tix, tiy] = posOf(EL && EL.pos && EL.pos.title, [540, 980]); words(TITLE, tix, tiy, t, 0.3, { size: fit(TITLE, 400, 'Bebas', 920, 150, 3), fam: 'Bebas', wt: 400, ls: 3, a: 1 - seg(t, T0 - 0.3, 0.25), shadow: 'rgba(0,0,0,0.5)' }); }
      // the shutter: two blades close and open as the shot changes, then a flash
      const sk = pre ? 0 : Math.max(0, 1 - Math.abs(lt - 0.02) / 0.13); if (!pre && sk > 0) { c.fillStyle = '#000'; c.fillRect(0, 0, W, H / 2 * sk); c.fillRect(0, H - H / 2 * sk, W, H / 2 * sk); }
      const fl = pre ? 0 : (1 - seg(lt, 0.14, 0.3)) * (lt > 0.14 ? 0.55 : 0); if (fl > 0) { c.fillStyle = 'rgba(255,255,255,' + fl + ')'; c.fillRect(0, 0, W, H); }
      // viewfinder: frame corners, thirds, a focus box that hunts and locks, the recording light
      const va = seg(t, 0.2, 0.5); c.save(); c.globalAlpha *= va; c.strokeStyle = WA(0.9); c.lineWidth = 5; c.lineCap = 'square'; const M = 70, T = 330, Bm = 1560, CL = 90;
      [[M, T, 1, 1], [W - M, T, -1, 1], [M, Bm, 1, -1], [W - M, Bm, -1, -1]].forEach(([x, y, sx, sy]) => { c.beginPath(); c.moveTo(x + CL * sx, y); c.lineTo(x, y); c.lineTo(x, y + CL * sy); c.stroke(); });
      c.strokeStyle = WA(0.16); c.lineWidth = 2; for (let k = 1; k < 3; k++) { c.beginPath(); c.moveTo(M + (W - 2 * M) * k / 3, T); c.lineTo(M + (W - 2 * M) * k / 3, Bm); c.moveTo(M, T + (Bm - T) * k / 3); c.lineTo(W - M, T + (Bm - T) * k / 3); c.stroke(); }
      if (!pre) { const lock = seg(lt, 0.5, 0.35), [fx, fy] = FX[i], hx = fx + (1 - lock) * 60 * Math.sin(lt * 14), hy = fy + (1 - lock) * 40 * Math.cos(lt * 11), s = 150 - 30 * E.outC(lock), col = lock >= 1 ? OR : WA(0.95); c.strokeStyle = col; c.lineWidth = 5;
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { c.beginPath(); c.moveTo(hx + sx * s / 2, hy + sy * (s / 2 - 34)); c.lineTo(hx + sx * s / 2, hy + sy * s / 2); c.lineTo(hx + sx * (s / 2 - 34), hy + sy * s / 2); c.stroke(); });
        if (lock >= 1) { c.fillStyle = OR; c.beginPath(); c.arc(hx, hy, 6, 0, TAU); c.fill(); } }
      const blink = Math.floor(t * 1.6) % 2 === 0; c.fillStyle = '#FF3B30'; c.globalAlpha = va * (blink ? 1 : 0.25); c.beginPath(); c.arc(M + 22, T - 44, 11, 0, TAU); c.fill(); c.globalAlpha = va; tx('REC', M + 48, T - 33, { size: 28, wt: 700, ls: 3, col: WHT, align: 'left' });
      tx(String(i + 1).padStart(2, '0') + ' / 04', W - M, T - 33, { size: 28, wt: 700, ls: 3, col: WHT, align: 'right', a: pre ? 0 : 1 }); c.restore();
      if (!pre && !dash(LBL[i])) { const k = SB(lt, 0.75, 0.8), a = clamp((lt - 0.75) * 7) * (1 - seg(lt, LEN - 0.2, 0.2)), s = LBL[i], fs = fit(s, 400, 'Bebas', 820, 100, 3), w = textW(s, F(400, fs, 'Bebas'), 3) + 70;
        if (a > 0) { c.save(); c.globalAlpha *= a; const [lbx, lby] = posOf(EL && EL.pos && EL.pos.label, [540, 1400]); c.translate(lbx, lby); c.rotate(-0.025); c.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); shadow(c, 20, 8, 0.4); c.fillStyle = OR; rr(-w / 2, -fs * 0.62, w, fs * 1.24, 14); c.fill(); noShadow(c); tx(s, 0, fs * 0.36, { size: fs, wt: 400, fam: 'Bebas', ls: 3, col: onAcc() }); c.restore(); } }
      close(t, OUT, END);
    }
    return { dur: DUR, render, elements, cues() { const ev = [['whoosh', 0.2, 0.24, 0], ['thud', 0.7, 0.2, 0]]; for (let i = 0; i < 4; i++) ev.push(['click', T0 + i * LEN, 0.6, 0], ['tick', T0 + i * LEN + 0.85, 0.3, 0], ['pop', T0 + i * LEN + 0.8, 0.22, 0]); closeCues(ev, OUT); return { dur: DUR, beds: [bed('night', DUR)], events: ev }; } };
  }

  // ================================================================ VEHICLE LISTING
  function listx() {
    const NM = TX('name', 'YEAR MAKE MODEL', { label: 'Vehicle (year, make, model)', group: 'The vehicle', upper: true, max: 34 });
    const PL = TX('plabel', 'FULL PRICE', { label: 'Price label', group: 'Price', upper: true, max: 18 }), PR = TX('price', '$0,000', { label: 'Price (a dash leaves the line off)', group: 'Price', max: 14, hint: 'A placeholder: type the real price.' });
    const DL = TX('dlabel', 'DOWN PAYMENT', { label: 'Second label', group: 'Price', upper: true, max: 18 }), DN = TX('down', '$000', { label: 'Second amount (a dash leaves the line off)', group: 'Price', max: 14, hint: 'A placeholder: type the real amount, or a dash.' });
    const FH = TX('fhead', 'FEATURES & DETAILS', { label: 'Heading over the features', group: 'Features', upper: true, max: 26 });
    const FT = [1, 2, 3, 4, 5, 6].map(i => TX('f' + i, i < 5 ? 'FEATURE ' + ['ONE', 'TWO', 'THREE', 'FOUR'][i - 1] : '-', { label: 'Feature ' + i + ' (a dash leaves it off)', group: 'Features', upper: true, max: 30 })).filter(x => !dash(x));
    const MI = TX('miles', '00,000 MILES', { label: 'Mileage (a dash leaves it off)', group: 'Details', upper: true, max: 20 }), TI = TX('title', 'TITLE STATUS', { label: 'Title status (a dash leaves it off)', group: 'Details', upper: true, max: 20 });
    const VIN = TX('vin', 'VIN 00000000000000000', { label: 'VIN (a dash leaves it off)', group: 'Details', upper: true, max: 26 }), STK = TX('stock', '-', { label: 'Stock number (a dash leaves it off)', group: 'Details', upper: true, max: 22 });
    const FINE = TX('fine', '-', { label: 'Terms or disclaimer (a dash leaves it off)', group: 'Details', max: 170 }), END = TX('end', 'MESSAGE US TODAY', { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const SH3 = [shot('s1', 'Outside', 4.4, 'l'), shot('s2', 'Inside', 4.6, 'l'), shot('s3', 'A detail', 4.2, 'l')], CUT = [4.2, 8.6], OUT = 12.6, DUR = OUT + 4.1;
    const Y0 = num(EL && EL.card && EL.card.y, 930), CH = num(EL && EL.card && EL.card.h, 500);
    const elP = id => (EL && EL.pos && EL.pos[id]) || null;
    function elements() { const p = (id, d) => posOf(elP(id), d), nmP = p('name', [116, Y0 + 96]), prP = p('prices', [100, Y0 + 128]), feP = p('features', [116, Y0 + 150]), deP = p('details', [116, Y0 + 200]), viP = p('vin', [116, Y0 + 330]), skP = p('stock', [116, Y0 + 420]), fiP = p('fine', [540, 1478]); return orderEls([
      { id: 'card', kind: 'card', label: 'Listing card', x: 60, y: Y0, w: 960, h: CH, t0: 0, d: DUR, box: [60, Y0, 960, CH], dup: false, del: false },
      { id: 'name', kind: 'pos', label: NM, x: nmP[0], y: nmP[1], t0: 0.5, d: DUR - 0.5, box: [nmP[0], nmP[1] - 96, 860, 110], dup: false, del: false },
      { id: 'prices', kind: 'pos', label: 'Price rows', x: prP[0], y: prP[1], t0: 1.0, d: 3.2, box: [prP[0], prP[1], 880, 282], dup: false, del: false },
      { id: 'features', kind: 'pos', label: 'Features block', x: feP[0], y: feP[1], t0: CUT[0], d: CUT[1] - CUT[0], box: [feP[0], feP[1] - 26, 860, 300], dup: false, del: false },
      { id: 'details', kind: 'pos', label: 'Detail chips', x: deP[0], y: deP[1], t0: CUT[1], d: OUT - CUT[1], box: [deP[0], deP[1] - 42, 860, 84], dup: false, del: false },
      { id: 'vin', kind: 'pos', label: VIN, x: viP[0], y: viP[1], t0: CUT[1], d: OUT - CUT[1], box: [viP[0], viP[1] - 38, 860, 60], dup: false, del: false },
      { id: 'stock', kind: 'pos', label: 'STOCK ' + STK, x: skP[0], y: skP[1], t0: CUT[1], d: OUT - CUT[1], box: [skP[0], skP[1] - 28, 400, 40], dup: false, del: false },
      { id: 'fine', kind: 'pos', label: 'Terms', x: fiP[0], y: fiP[1], t0: 2.2, d: DUR - 2.2, box: [fiP[0] - 450, fiP[1] - 84, 900, 84], dup: false, del: false },
    ].filter(e => e.id !== 'prices' || !dash(PR)).filter(e => e.id !== 'vin' || !dash(VIN)).filter(e => e.id !== 'stock' || !dash(STK)).filter(e => e.id !== 'fine' || !dash(FINE))); }
    function render(t) {
      stage(t); const c = ctx, i = t < CUT[0] ? 0 : t < CUT[1] ? 1 : 2, st = [0, CUT[0], CUT[1]], en = [CUT[0], CUT[1], OUT + 1];
      SH3.forEach((s, j) => { if (j !== i) touch(s, t - st[j]); });
      const ka = i > 0 ? cutK(t, st[i]) : 1; if (ka < 1 && i > 0) whole(SH3[i - 1], t - st[i - 1], 0, 0, W, H, { py: 0.2 });
      c.save(); if (ka < 1) { c.beginPath(); c.rect(W * (1 - ka), 0, W * ka, H); c.clip(); } whole(SH3[i], t - st[i], 0, 0, W, H, { py: 0.2 }); c.restore();
      if (ka > 0 && ka < 1) { c.fillStyle = OR; c.fillRect(W * (1 - ka) - 7, 0, 14, H); }
      if (VID.collecting) return;
      shade(820, 1620, 0, 0.6); bar(t, 0.15);
      const e = SP(t, 0.5, 0.85), a = clamp((t - 0.5) * 6); if (a > 0) { c.save(); c.globalAlpha *= a; c.translate(0, (1 - e) * 600 + 3 * Math.sin(t * 1.2));
        shadow(c, 50, 18, 0.45); c.fillStyle = CARD; rr(60, Y0, 960, CH, 34); c.fill(); noShadow(c); c.fillStyle = OR; rr(60, Y0, 16, CH, 8); c.fill();
        const [nmx, nmy] = posOf(elP('name'), [116, Y0 + 96]); tx(NM, nmx, nmy, { size: fit(NM, 400, 'Bebas', 860, 96, 1.5), wt: 400, fam: 'Bebas', ls: 1.5, col: INKD, align: 'left' });
        for (let j = 0; j < 3; j++) { c.fillStyle = j === i ? OR : 'rgba(20,20,26,0.16)'; rr(880 + j * 34, Y0 + 30, 24, 8, 4); c.fill(); }
        const lt = t - st[i], ca = clamp((lt - (i ? 0.15 : 0.9)) * 5) * (i < 2 ? 1 - seg(lt, en[i] - st[i] - 0.25, 0.2) : 1); c.globalAlpha *= ca;
        if (i === 0) { const [prx, pry] = posOf(elP('prices'), [100, Y0 + 128]); [[PL, PR, true], [DL, DN, false]].filter(r => !dash(r[1])).forEach(([lab, v, hot], j) => { const k = SP(lt, 0.95 + j * 0.22, 0.8), y = pry + j * 147; c.save(); c.translate((1 - k) * 80, 0); c.globalAlpha *= clamp((lt - 0.95 - j * 0.22) * 6);
            c.fillStyle = hot ? OR : 'rgba(20,20,26,0.07)'; rr(prx, y, 880, 135, 22); c.fill(); const on = hot ? onAcc() : INKD; tx(lab, prx + 36, y + 82, { size: fit(lab, 800, 'Mont', 400, 36, 3), wt: 800, ls: 3, col: on, align: 'left' }); tx(v, prx + 850, y + 104, { size: fit(v, 400, 'Bebas', 400, 118, 1), wt: 400, fam: 'Bebas', ls: 1, col: on, align: 'right' }); c.restore(); }); }
        else if (i === 1) { const [fex, fey] = posOf(elP('features'), [116, Y0 + 150]); tx(FH, fex, fey, { size: 26, wt: 800, ls: 4, col: MUTE, align: 'left' }); const two = FT.length > 3, per = two ? Math.ceil(FT.length / 2) : FT.length, gap = per > 2 ? 100 : 120;
          FT.forEach((s, j) => { const k = SB(lt, 0.3 + j * 0.16, 0.8), x = fex + (two && j >= per ? 444 : 0), y = fey + 78 + (j % per) * gap, mw = two ? 350 : 800; if (k <= 0) return; c.save(); c.globalAlpha *= clamp((lt - 0.3 - j * 0.16) * 7);
            c.fillStyle = OR; c.beginPath(); c.arc(x + 24, y - 12, 24 * k, 0, TAU); c.fill(); c.strokeStyle = onAcc(); c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x + 13, y - 12); c.lineTo(x + 21, y - 3); c.lineTo(x + 36, y - 21); c.stroke();
            tx(s, x + 64, y, { size: fit(s, 700, 'Mont', mw, 34, 1), wt: 700, ls: 1, col: INKD, align: 'left' }); c.restore(); }); }
        else { const [dex, dey] = posOf(elP('details'), [116, Y0 + 200]); let x = dex; [MI, TI].filter(s => !dash(s)).forEach((s, j) => { const fs = fit(s, 800, 'Mont', 400, 38, 2), w = textW(s, F(800, fs, 'Mont'), 2) + 60, k = SB(lt, 0.3 + j * 0.18, 0.8); if (k > 0) { c.save(); c.translate(x + w / 2, dey); c.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); c.fillStyle = j ? 'rgba(20,20,26,0.08)' : OR; rr(-w / 2, -42, w, 84, 42); c.fill(); tx(s, 0, fs * 0.36, { size: fs, wt: 800, ls: 2, col: j ? INKD : onAcc() }); c.restore(); } x += w + 18; });
          if (!dash(VIN)) { const ka2 = seg(lt, 0.8, 0.4); const [vix, viy] = posOf(elP('vin'), [116, Y0 + 330]); tx(VIN, vix, viy, { size: fit(VIN, 700, 'Mont', 860, 38, 3), wt: 700, ls: 3, col: INKD, align: 'left', a: ka2 }); c.fillStyle = 'rgba(20,20,26,0.14)'; c.fillRect(vix, viy + 26, 860 * E.outC(ka2), 3); }
          if (!dash(STK)) { const [skx, sky] = posOf(elP('stock'), [116, Y0 + 420]); tx('STOCK ' + STK, skx, sky, { size: 28, wt: 600, ls: 3, col: MUTE, align: 'left', a: seg(lt, 1.0, 0.4) }); } }
        c.restore(); }
      const [fix, fiy] = posOf(elP('fine'), [540, 1478]); fine(FINE, t, 2.2, fiy, fix); close(t, OUT, END);
    }
    return { dur: DUR, render, elements, cues() { const ev = [['whoosh', 0.2, 0.26, 0], ['thud', 0.75, 0.22, 0], ['pop', 1.45, 0.3, -0.3], ['pop', 1.67, 0.3, 0.3], ['swish', CUT[0] - 0.2, 0.34, 0.3], ['swish', CUT[1] - 0.2, 0.34, -0.3], ['pop', CUT[1] + 0.3, 0.26, -0.2], ['pop', CUT[1] + 0.48, 0.26, 0.2]]; FT.forEach((s, j) => ev.push(['tick', CUT[0] + 0.3 + j * 0.16, 0.3, j % 2 ? 0.2 : -0.2])); closeCues(ev, OUT); return { dur: DUR, beds: [bed('pulse', DUR)], events: ev }; } };
  }

  const P = ({ lotx, reelx, eventx, walkx, wipex, lensx, listx }[V] || lotx)(); BT = K17.fields();
  DIR = { dur: P.dur, bg: BLK, finish: { vig: 0.14, grain: 0.1 }, edl: [], shakes: [], preload: () => K3.init(), render: P.render, cues: P.cues, ...(P.elements ? { elements: P.elements } : {}) };
});
