'use strict';
/* Motion kit 9 (V10, Oct 30): the motion graphics library. Requires kit8 (K8).
   Every element draws centred on the current origin and never resets the canvas transform, so the layer system can move,
   scale, rotate, fade, blur and keyframe it like any other layer (preview and export run this same code).
   Element spec: { name, cat, desc, d (default seconds), full (screen overlay, ignores position), fields: [[key, label, type,
   default, extra]], ex (sample values for library previews only), box(L) -> local [x, y, w, h], draw(L, s) }.
   Facts are never invented: prices, offers, numbers, reviews, comments, ratings and handles start empty and draw a clear
   "+ ADD …" marker until the business types them; star ratings are off for brands whose rules forbid them (DPG). */
const K9 = (() => {
  const TAU = Math.PI * 2, EL = {}, ORDER = [];
  const CATS = [['promo', 'Promotional'], ['editorial', 'Editorial'], ['cine', 'Cinematic'], ['geo', 'Geometric'], ['info', 'Informational'], ['social', 'Social']];
  function def(id, o) { o.id = id; o.d = o.d || 3; o.fields = o.fields || []; o.ex = o.ex || {}; o.defs = {}; o.fields.forEach(f => (o.defs[f[0]] = f[3])); EL[id] = o; ORDER.push(id); }
  const C = k => K8.col(k);
  const v = (L, k) => { const e = EL[L.type]; let x = L[k]; if (x === undefined || x === null) x = e && e.defs[k]; return typeof x === 'function' ? x() : x; };
  const str = (L, k) => { const x = v(L, k); return x == null ? '' : String(x).trim(); };
  const num = (L, k, d) => { const x = +v(L, k); return Number.isFinite(x) ? x : d; };
  const famOf = (L, slot) => (L.font && window.NX && NX.fontFamily ? NX.fontFamily(L.font) : null) || slot;
  const dpg = () => (window.K5 && K5.isDPG ? K5.isDPG() : BRAND.id === 'dpg');
  // ------------------------------------------------------------------ drawing helpers (transform-safe)
  function tx(s, x, y, o) {
    if (!s) return 0; o = o || {}; const c = ctx; c.save(); c.font = F(o.wt || 800, o.size || 40, o.fam || 'Mont', o.it || ''); c.letterSpacing = (o.ls || 0) + 'px';
    c.textAlign = o.align || 'center'; c.textBaseline = o.base || 'alphabetic'; if (o.a !== undefined) c.globalAlpha *= clamp(o.a);
    if (o.shadow) { c.shadowColor = o.shadow; c.shadowBlur = (o.size || 40) * 0.3; c.shadowOffsetY = (o.size || 40) * 0.05; }
    if (o.stroke) { c.lineJoin = 'round'; c.strokeStyle = o.stroke; c.lineWidth = o.sw || 4; c.strokeText(s, x, y); }
    c.fillStyle = o.col || WHT; c.fillText(s, x, y); c.restore(); return textW(s, F(o.wt || 800, o.size || 40, o.fam || 'Mont', o.it || ''), o.ls || 0);
  }
  const tw = (s, wt, size, fam, ls, it) => textW(s, F(wt, size, fam, it || ''), ls || 0);
  const fitS = (s, wt, fam, maxW, maxS, ls, it) => (s ? Math.min(maxS, fitSize(s, wt, maxW, maxS, fam, ls || 0, it || '')) : maxS);
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, Math.max(0, h), Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2))); };
  const PATHS = {
    bed: 'M3 18V8M3 14h18v4M21 14v-2a3 3 0 00-3-3h-7v5M7.5 12.2a1.7 1.7 0 100-.01', bath: 'M4 12h16v2a5 5 0 01-5 5H9a5 5 0 01-5-5v-2zM6 12V6a2 2 0 014 0M7 19l-1 2M17 19l1 2',
    area: 'M4 4h16v16H4zM8 8l8 8M8 8h3M8 8v3M16 16h-3M16 16v-3', car: 'M4 16v-4l2-5h12l2 5v4M4 16h16v3H4zM7 13h.01M17 13h.01', pin: 'M12 21s-6-5.6-6-11a6 6 0 0112 0c0 5.4-6 11-6 11zM12 12.4a2.4 2.4 0 100-.01',
    check: 'M5 12.5l4.2 4.2L19 7', clock: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2', at: 'M16 12a4 4 0 11-8 0 4 4 0 018 0zM16 12v1.5a2.5 2.5 0 005 0V12a9 9 0 10-3.5 7.1', chev: 'M6 15l6-6 6 6',
    plus: 'M12 5v14M5 12h14', arrow: 'M5 12h14M13 6l6 6-6 6', home: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
  };
  const FILLP = {
    star: 'M12 2.6l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z',
    heart: 'M12 21s-7.6-4.7-9.6-9.3C1 8.2 3.3 4.4 7.1 4.4c2.1 0 3.6 1.1 4.9 2.9 1.3-1.8 2.8-2.9 4.9-2.9 3.8 0 6.1 3.8 4.7 7.3C19.6 16.3 12 21 12 21z',
    hand: 'M9.2 11.2V4.6a1.6 1.6 0 013.2 0v5.2h.4V8.7a1.6 1.6 0 013.2 0v1.1h.4V9.4a1.6 1.6 0 013.2 0v1h.1a1.5 1.5 0 013 .3V15a6.5 6.5 0 01-6.5 6.5h-1.6a6 6 0 01-4.9-2.6l-4.3-5.8a1.5 1.5 0 012.3-1.9z',
  };
  const PC = new Map(); const path = d => { let p = PC.get(d); if (!p) { p = new Path2D(d); PC.set(d, p); } return p; };
  function icon(name, x, y, s, col, o) { o = o || {}; const c = ctx; c.save(); c.translate(x, y); c.scale(s / 24, s / 24); c.translate(-12, -12);
    if (FILLP[name]) { c.fillStyle = col; c.fill(path(FILLP[name])); } else { c.strokeStyle = col; c.lineWidth = o.lw || 2; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(path(PATHS[name] || PATHS.plus)); } c.restore(); }
  // a clear fill-in marker for a required field that is still empty (the editor also warns before export)
  function need(label, x, y, size, o) {
    o = o || {}; const c = ctx, s = size || 44, t = (o.raw ? '' : '+ ADD ') + String(label).toUpperCase(), w = tw(t, 800, s * 0.6, 'Mont', 2) + s * 1.1, h = s * 1.5;
    c.save(); c.globalAlpha *= 0.92; c.fillStyle = 'rgba(12,12,16,0.55)'; rr(x - w / 2, y - h / 2, w, h, h / 2); c.fill(); c.setLineDash([s * 0.28, s * 0.2]); c.lineWidth = Math.max(2, s * 0.06); c.strokeStyle = 'rgba(255,255,255,0.85)'; c.stroke(); c.restore();
    tx(t, x, y + s * 0.21, { size: s * 0.6, wt: 800, ls: 2, col: '#FFFFFF' });
  }
  // numbers with their dressing: "$1.2M" -> {pre:'$', n:1.2, dec:1, suf:'M', comma}
  function parseNum(sv) {
    const m = /^([^\d]*?)(\d[\d,]*(?:\.\d+)?|\.\d+)(.*)$/.exec(String(sv || '').trim()); if (!m) return null;
    const raw = m[2], n = parseFloat(raw.replace(/,/g, '')); if (!Number.isFinite(n)) return null;
    return { pre: m[1], n, dec: raw.includes('.') ? raw.split('.')[1].length : 0, suf: m[3], comma: raw.includes(',') || n >= 10000 };
  }
  function fmtNum(P, x) { let s = x.toFixed(P.dec); if (P.comma) { const [a, b] = s.split('.'); s = a.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (b ? '.' + b : ''); } return s; }
  const lines = s => String(s || '').split(/\n|,(?![^(]*\))/).map(x => x.trim()).filter(Boolean);
  const pairs = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean).map(x => { const i = x.indexOf(':'); return i > 0 ? [x.slice(0, i).trim(), x.slice(i + 1).trim()] : [x, '']; });
  const env = s => E.outC(s.p) * (1 - E.inC(s.q));

  // ================================================================== PROMOTIONAL
  def('burst', { name: 'Sale burst', cat: 'promo', desc: 'A spinning starburst badge that pops in with your offer.', d: 3, ex: { text: 'SALE', sub: 'THIS WEEK' },
    fields: [['text', 'Big text', 'text', '', { req: 'offer', max: 10 }], ['sub', 'Small text', 'text', '', { max: 18 }], ['size', 'Size', 'range', 190, [100, 320, 2]], ['color', 'Colour', 'col', 'accent']],
    box: L => { const r = num(L, 'size', 190); return [-r, -r, 2 * r, 2 * r]; },
    draw(L, s) { const r = num(L, 'size', 190), sc = E.outBack(clamp(s.p * 1.15)) * (1 - E.inC(s.q)) * (1 + Math.sin(s.lt * 6) * 0.012), c = ctx; if (sc <= 0) return;
      c.save(); c.scale(sc, sc); c.save(); c.rotate(s.lt * 0.35); const n = 18; c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU, rad = i % 2 ? r * 0.8 : r; c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); } c.closePath();
      c.fillStyle = 'rgba(0,0,0,0.3)'; c.save(); c.translate(8, 12); c.fill(); c.restore(); c.fillStyle = s.c1; c.fill(); c.setLineDash([10, 9]); c.lineWidth = 3; c.strokeStyle = K8.rgba(s.fg, 0.45); c.beginPath(); c.arc(0, 0, r * 0.66, 0, TAU); c.stroke(); c.restore();
      const t = str(L, 'text'), sub = str(L, 'sub');
      if (!t) { c.restore(); need('offer', 0, 0, r * 0.22); return; }
      const fs = fitS(t, 900, famOf(L, 'Mont'), r * 1.32, r * 0.62, -2); tx(t.toUpperCase(), 0, sub ? fs * 0.42 : fs * 0.36, { size: fs, wt: 900, fam: famOf(L, 'Mont'), col: s.fg, ls: -2 });
      if (sub) tx(sub.toUpperCase(), 0, -fs * 0.5, { size: Math.min(r * 0.17, fitS(sub.toUpperCase(), 700, 'Mono', r * 1.2, r * 0.17, 3)), wt: 700, fam: 'Mono', ls: 3, col: s.fg });
      c.restore(); } });
  def('pricetag', { name: 'Price tag', cat: 'promo', desc: 'A hang tag drops in on its string and swings with the price.', d: 3.5, ex: { price: '$14.99', label: 'ONLY' },
    fields: [['price', 'Price', 'text', '', { req: 'price', max: 10 }], ['label', 'Small line', 'text', '', { max: 14 }], ['color', 'Tag colour', 'col', 'accent']],
    box: () => [-190, -330, 380, 600],
    draw(L, s) { const c = ctx, w = 340, h = 400, top = -150, drop = (1 - E.outBack(clamp(s.p * 1.2))) * -700, ang = 0.42 * Math.exp(-s.lt * 2.2) * Math.cos(s.lt * 6.5) + Math.sin(s.lt * 1.4) * 0.025;
      c.save(); c.globalAlpha *= 1 - E.inC(s.q); c.translate(0, drop - s.q * 300); const px = 0, py = -320; c.translate(px, py); c.rotate(ang); c.translate(-px, -py);
      c.strokeStyle = K8.rgba('white', 0.85); c.lineWidth = 4; c.beginPath(); c.moveTo(px, py); c.lineTo(0, top + 40); c.stroke(); c.fillStyle = WHT; c.beginPath(); c.arc(px, py, 10, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(-w / 2 + 70, top); c.lineTo(w / 2 - 70, top); c.lineTo(w / 2, top + 80); c.lineTo(w / 2, top + h); c.lineTo(-w / 2, top + h); c.lineTo(-w / 2, top + 80); c.closePath();
      c.save(); c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 40; c.shadowOffsetY = 18; c.fillStyle = s.c1; c.fill(); c.restore();
      c.save(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(0, top + 44, 15, 0, TAU); c.fill(); c.restore(); c.strokeStyle = K8.rgba(s.fg, 0.35); c.lineWidth = 3; c.beginPath(); c.arc(0, top + 44, 22, 0, TAU); c.stroke();
      c.setLineDash([12, 10]); c.strokeStyle = K8.rgba(s.fg, 0.4); c.lineWidth = 3; c.strokeRect(-w / 2 + 22, top + 100, w - 44, h - 122); c.setLineDash([]);
      const p = str(L, 'price'), lab = str(L, 'label');
      if (lab) tx(lab.toUpperCase(), 0, top + 160, { size: 30, wt: 700, fam: 'Mono', ls: 5, col: s.fg });
      if (!p) need('price', 0, top + 270, 40); else priceText(p, 0, top + (lab ? 300 : 280), fitS(p, 900, famOf(L, 'Mont'), w - 70, 150, -2), s.fg, famOf(L, 'Mont'));
      c.restore(); } });
  function priceText(p, x, y, size, col, fam, o) {   // "$14.99" with raised small cents; anything else as typed
    o = o || {}; const P = parseNum(p); fam = fam || 'Mont';
    if (P && P.dec === 2 && !P.suf.trim() && P.n < 100000) { const [a, b] = fmtNum(P, o.val === undefined ? P.n : o.val).split('.'), big = P.pre + a, sm = '.' + b, ws = size * 0.48, w1 = tw(big, 900, size, fam, -2), w2 = tw(sm, 900, ws, fam, 0), x0 = x - (w1 + w2) / 2;
      tx(big, x0, y, { size, wt: 900, fam, col, align: 'left', ls: -2, stroke: o.stroke, sw: o.sw }); tx(sm, x0 + w1 + 4, y - size * 0.36, { size: ws, wt: 900, fam, col, align: 'left', stroke: o.stroke, sw: o.sw }); return w1 + w2; }
    const s = P && o.val !== undefined ? P.pre + fmtNum(P, o.val) + P.suf : p; return tx(s, x, y, { size, wt: 900, fam, col, ls: -2, stroke: o.stroke, sw: o.sw });
  }
  def('price', { name: 'Price reveal', cat: 'promo', desc: 'A giant price counts up and lands with a burst. Works for $14.99 or $1.2M.', d: 3.2, ex: { price: '$1,295,000', label: 'OFFERED AT' },
    fields: [['price', 'Price', 'text', '', { req: 'price', max: 14 }], ['label', 'Line above', 'text', '', { max: 22 }], ['was', 'Old price (struck through)', 'text', '', { max: 14 }], ['size', 'Size', 'range', 210, [90, 340, 2]], ['color', 'Price colour', 'col', 'white'], ['col2', 'Accent', 'col', 'accent']],
    box: L => { const z = num(L, 'size', 210); return [-500, -z * 1.25, 1000, z * 1.75]; },
    draw(L, s) { const z = num(L, 'size', 210), p = str(L, 'price'), lab = str(L, 'label'), was = str(L, 'was'), fam = famOf(L, 'Mont'), c = ctx; c.save(); c.globalAlpha *= 1 - E.inC(s.q);
      if (lab) tx(lab.toUpperCase(), 0, -z * 0.86, { size: z * 0.15, wt: 700, fam: 'Mono', ls: 6, col: s.c2, a: E.outC(clamp(s.p * 2)) });
      if (!p) { need('price', 0, -z * 0.2, 46); c.restore(); return; }
      const P = parseNum(p), cnt = E.outExpo(clamp((s.lt - 0.1) / 1.0)), land = clamp((s.lt - 1.05) / 0.5), size = fitS(p, 900, fam, 960, z, -2);
      const bump = 1 + Math.sin(Math.PI * clamp(land * 1.6)) * 0.07; c.save(); c.scale(bump, bump); c.globalAlpha *= clamp(s.p * 4);
      priceText(p, 0, size * 0.32, size, s.c1, fam, { val: P ? P.n * cnt : undefined, stroke: 'rgba(0,0,0,0.25)', sw: 2 }); c.restore();
      if (land > 0 && land < 1) { c.save(); c.strokeStyle = s.c2; c.lineWidth = 7; c.lineCap = 'round'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + 0.2, r0 = size * (0.9 + land * 0.5), r1 = r0 + size * 0.28 * (1 - land); c.globalAlpha = 1 - land; c.beginPath(); c.moveTo(Math.cos(a) * r0 * 1.35, Math.sin(a) * r0 * 0.75); c.lineTo(Math.cos(a) * r1 * 1.35, Math.sin(a) * r1 * 0.75); c.stroke(); } c.restore(); }
      const ul = E.inOutC(clamp((s.lt - 0.9) / 0.5)); if (ul > 0) { const w = Math.min(900, tw(p, 900, size, fam, -2)) * ul; c.fillStyle = s.c2; c.fillRect(-w / 2, size * 0.48, w, Math.max(5, size * 0.05)); }
      if (was) { const ws = size * 0.3, a = E.outC(clamp((s.lt - 0.3) / 0.4)), y = size * 0.95, w = tw(was, 700, ws, fam, 0); tx(was, 0, y, { size: ws, wt: 700, fam, col: K8.rgba(s.c1, 0.75), a });
        const k = E.inOutC(clamp((s.lt - 0.6) / 0.35)); if (k > 0) { c.strokeStyle = s.c2; c.lineWidth = Math.max(4, ws * 0.1); c.beginPath(); c.moveTo(-w / 2 - 10, y - ws * 0.3); c.lineTo(-w / 2 - 10 + (w + 20) * k, y - ws * 0.3 - ws * 0.1 * k); c.stroke(); } }
      c.restore(); } });
  def('discount', { name: 'Discount label', cat: 'promo', desc: 'A notched ribbon flag slides in with the discount.', d: 3, ex: { text: '-20%', sub: 'TODAY' },
    fields: [['text', 'Discount', 'text', '', { req: 'discount', max: 8 }], ['sub', 'Small text', 'text', '', { max: 12 }], ['color', 'Colour', 'col', 'accent']],
    box: () => [-260, -95, 520, 190],
    draw(L, s) { const c = ctx, k = E.outQ(clamp(s.p * 1.2)), x = (1 - k) * -800 + s.q * 900, t = str(L, 'text'), sub = str(L, 'sub'), w = 500, h = 170; c.save(); c.translate(x, 0); c.transform(1, 0, -0.08 * (1 - k), 1, 0, 0);
      c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(w / 2, -h / 2); c.lineTo(w / 2 - 50, 0); c.lineTo(w / 2, h / 2); c.lineTo(-w / 2, h / 2); c.closePath();
      c.save(); c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.fillStyle = s.c1; c.fill(); c.restore();
      c.fillStyle = K8.rgba(s.fg, 0.12); c.fillRect(-w / 2, -h / 2, 26, h);
      if (!t) need('discount', -20, 0, 40); else { const fam = famOf(L, 'Mont'), su = sub.toUpperCase(), ss = sub ? Math.min(32, fitS(su, 800, 'Mont', 130, 32, 2)) : 0, sw = sub ? tw(su, 800, ss, 'Mont', 2) + 24 : 0, fs = fitS(t, 900, fam, 390 - sw, 130, -2), bw = tw(t, 900, fs, fam, -2), x0 = -25 - (bw + sw) / 2;
        tx(t, x0, fs * 0.36, { size: fs, wt: 900, fam, col: s.fg, align: 'left', ls: -2 }); if (sub) tx(su, x0 + bw + 24, ss * 0.36, { size: ss, wt: 800, ls: 2, col: s.fg, align: 'left' }); }
      c.restore(); } });
  def('limited', { name: 'Limited-time banner', cat: 'promo', desc: 'A tilted hazard-striped band with your line scrolling across.', d: 3.5, ex: { text: 'LIMITED TIME' },
    fields: [['text', 'Text', 'text', '', { req: 'text', max: 28 }], ['tilt', 'Tilt', 'range', -5, [-20, 20, 1]], ['color', 'Colour', 'col', 'accent']],
    box: () => [-620, -80, 1240, 160],
    draw(L, s) { const c = ctx, t = str(L, 'text'), k = E.inOutC(clamp(s.p * 1.3)), out = E.inC(s.q), h = 128; c.save(); c.rotate(num(L, 'tilt', -5) * Math.PI / 180);
      c.beginPath(); c.rect(-720 + 1440 * out, -h / 2 - 20, 1440 * k * (1 - out), h + 40); c.clip(); c.fillStyle = s.c1; c.fillRect(-720, -h / 2, 1440, h);
      c.save(); c.beginPath(); c.rect(-720, -h / 2, 1440, 14); c.rect(-720, h / 2 - 14, 1440, 14); c.clip(); c.fillStyle = BLK; c.fillRect(-720, -h / 2, 1440, h); c.fillStyle = s.c1; for (let x = -760 + (s.lt * 60 % 40); x < 760; x += 40) { c.beginPath(); c.moveTo(x, -h / 2); c.lineTo(x + 20, -h / 2); c.lineTo(x, h / 2); c.lineTo(x - 20, h / 2); c.fill(); } c.restore();
      if (!t) { need('text', 0, 0, 38); c.restore(); return; }
      const u = t.toUpperCase() + '   ★   ', fs = 62, w = tw(u, 900, fs, famOf(L, 'Mont'), 1), off = -(s.lt * 160) % w; for (let x = -720 + off - w; x < 760; x += w) tx(u, x, fs * 0.36, { size: fs, wt: 900, fam: famOf(L, 'Mont'), col: s.fg, align: 'left', ls: 1 });
      c.restore(); } });
  def('countdown', { name: 'Countdown clock', cat: 'promo', desc: 'A flip clock that really counts down while it is on screen, or a days-left tile.', d: 5, ex: { from: 10, label: 'DOORS OPEN IN' },
    fields: [['mode', 'Type', 'seg', 'clock', [['clock', 'Clock (seconds)'], ['days', 'Days left']]], ['from', 'Count from', 'num', 10, [0, 3599]], ['label', 'Label', 'text', '', { max: 24 }], ['color', 'Colour', 'col', 'accent']],
    box: () => [-420, -190, 840, 380],
    draw(L, s) { const c = ctx, mode = v(L, 'mode'), from = Math.max(0, Math.round(num(L, 'from', 10))), lab = str(L, 'label'), a = env(s); c.save(); c.globalAlpha *= a; c.translate(0, (1 - E.outBack(clamp(s.p * 1.2))) * 120);
      if (lab) tx(lab.toUpperCase(), 0, -120, { size: 34, wt: 700, fam: 'Mono', ls: 6, col: WHT, shadow: 'rgba(0,0,0,0.5)' });
      const box = (x, ch, flip, w, h) => { c.save(); c.translate(x, 20); c.fillStyle = 'rgba(0,0,0,0.35)'; rr(-w / 2 + 6, -h / 2 + 10, w, h, 18); c.fill(); c.fillStyle = BLK; rr(-w / 2, -h / 2, w, h, 18); c.fill();
        c.save(); c.scale(1, 1 - 2 * Math.min(flip, 1 - flip) * 1.6 > 0 ? 1 - 2 * Math.min(flip, 1 - flip) * 1.6 : 0.02); tx(ch, 0, h * 0.25, { size: h * 0.72, wt: 800, fam: 'Mont', col: WHT }); c.restore();
        c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(-w / 2, -2, w, 4); c.fillStyle = s.c1; c.fillRect(-w / 2, h / 2 - 10, w, 10); c.restore(); };
      if (mode === 'days') { const n = String(from); const w = 190, gap = 18, tot = n.length * w + (n.length - 1) * gap; [...n].forEach((ch, i) => box(-tot / 2 + w / 2 + i * (w + gap), ch, clamp((s.lt - 0.2 - i * 0.12) / 0.5) < 1 ? clamp((s.lt - 0.2 - i * 0.12) / 0.5) : 0, w, 250));
        tx(from === 1 ? 'DAY LEFT' : 'DAYS LEFT', 0, 230, { size: 44, wt: 900, col: s.c1, ls: 4, shadow: 'rgba(0,0,0,0.5)' }); }
      else { const rem = Math.max(0, from - Math.max(0, s.lt - 0.4)), sec = Math.ceil(rem - 1e-6), mm = Math.floor(sec / 60), ss = sec % 60, digs = [Math.floor(mm / 10), mm % 10, Math.floor(ss / 10), ss % 10].map(String);
        const fr = 1 - (rem - Math.floor(rem)), w = 150, h = 210, xs = [-345, -180, 180, 345];
        digs.forEach((ch, i) => { const changes = i === 3 || (i === 2 && ss % 10 === 9) || (i === 1 && ss === 59) || (i === 0 && ss === 59 && mm % 10 === 9); box(xs[i], ch, changes && rem > 0 && s.lt > 0.4 && fr < 0.22 ? fr / 0.22 : 0, w, h); });
        for (const dy of [-34, 34]) { c.fillStyle = sec % 2 || rem <= 0 ? s.c1 : WHT; c.beginPath(); c.arc(0, 20 + dy, 13, 0, TAU); c.fill(); } }
      c.restore(); } });
  def('sticker', { name: 'Offer sticker', cat: 'promo', desc: 'A scalloped sticker slaps on and wobbles.', d: 3, ex: { text: 'HOT!', sub: 'NEW RECIPE' },
    fields: [['text', 'Big text', 'text', '', { req: 'text', max: 8 }], ['sub', 'Small text', 'text', '', { max: 14 }], ['size', 'Size', 'range', 160, [90, 280, 2]], ['color', 'Colour', 'col', 'accent2']],
    box: L => { const r = num(L, 'size', 160) * 1.08; return [-r, -r, 2 * r, 2 * r]; },
    draw(L, s) { const r = num(L, 'size', 160), c = ctx, slap = clamp(s.p * 1.6), sc = (slap < 1 ? lerp(1.9, 1, E.inC(slap)) : 1 + Math.sin((s.lt - 0.35) * 20) * 0.06 * Math.exp(-(s.lt - 0.35) * 6)) * (1 - E.inC(s.q)), rot = -0.12 + Math.sin(s.lt * 2) * 0.04;
      if (sc <= 0) return; c.save(); c.globalAlpha *= clamp(s.p * 5); c.rotate(rot); c.scale(sc, sc);
      const bump = n => { c.beginPath(); for (let i = 0; i <= 120; i++) { const a = i / 120 * TAU, rad = r * (1 + 0.05 * Math.cos(a * n)); c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); } c.closePath(); };
      bump(22); c.save(); c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 24; c.shadowOffsetY = 10; c.fillStyle = WHT; c.fill(); c.restore(); c.save(); c.scale(0.9, 0.9); bump(22); c.fillStyle = s.c1; c.fill(); c.restore();
      const t = str(L, 'text'), sub = str(L, 'sub'); if (!t) { need('text', 0, 0, r * 0.22); c.restore(); return; }
      const fs = fitS(t.toUpperCase(), 900, famOf(L, 'Bebas'), r * 1.4, r * 0.85); tx(t.toUpperCase(), 0, sub ? fs * 0.45 : fs * 0.35, { size: fs, wt: 900, fam: famOf(L, 'Bebas'), col: s.fg });
      if (sub) tx(sub.toUpperCase(), 0, -fs * 0.42, { size: fitS(sub.toUpperCase(), 800, 'Mont', r * 1.25, r * 0.16, 2), wt: 800, ls: 2, col: s.fg });
      c.restore(); } });
  def('cta', { name: 'Call-to-action button', cat: 'promo', desc: 'A button pops in, a finger taps it and it ripples.', d: 3.2, ex: { text: 'ORDER NOW' },
    fields: [['text', 'Button text', 'text', () => (typeof CONTACT !== 'undefined' && CONTACT.cta) || 'BOOK NOW', { max: 26 }], ['color', 'Colour', 'col', 'accent']],
    box: L => { const w = Math.min(900, tw(str(L, 'text').toUpperCase(), 800, 46, 'Mont', 2) + 190); return [-w / 2, -70, w, 200]; },
    draw(L, s) { const c = ctx, t = str(L, 'text').toUpperCase() || 'BOOK NOW', fs = fitS(t, 800, famOf(L, 'Mont'), 720, 46, 2), w = tw(t, 800, fs, famOf(L, 'Mont'), 2) + 190, h = 124;
      const press = clamp((s.lt - 1.25) / 0.12) * (1 - clamp((s.lt - 1.4) / 0.2)), sc = E.outBack(clamp(s.p * 1.3)) * (1 - 0.06 * press) * (1 - E.inC(s.q)); if (sc <= 0) return;
      c.save(); c.scale(sc, sc); c.save(); c.shadowColor = K8.rgba(s.c1, 0.55); c.shadowBlur = 40; c.shadowOffsetY = 10; c.fillStyle = s.c1; rr(-w / 2, -h / 2, w, h, h / 2); c.fill(); c.restore();
      tx(t, -32, fs * 0.36, { size: fs, wt: 800, fam: famOf(L, 'Mont'), ls: 2, col: s.fg }); c.fillStyle = s.fg; c.beginPath(); c.arc(w / 2 - 66, 0, 34, 0, TAU); c.fill(); icon('arrow', w / 2 - 66, 0, 40, s.c1, { lw: 3 });
      const rp = clamp((s.lt - 1.3) / 0.8); if (rp > 0 && rp < 1) { c.strokeStyle = K8.rgba(s.c1, 1 - rp); c.lineWidth = 6; rr(-w / 2 - 40 * rp, -h / 2 - 40 * rp, w + 80 * rp, h + 80 * rp, h / 2 + 40 * rp); c.stroke(); }
      const hk = E.outC(clamp((s.lt - 0.55) / 0.6)), hx = lerp(w / 2 + 150, w * 0.18, hk), hy = lerp(260, 40, hk) + press * 10; if (s.lt > 0.55) { c.save(); c.globalAlpha *= clamp((s.lt - 0.55) * 4) * (1 - clamp((s.lt - 2.2) / 0.4)); c.translate(hx, hy); c.rotate(-0.35); c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 16; icon('hand', 0, 30, 130, WHT); c.restore(); }
      c.restore(); } });
  def('ticker', { name: 'Ticker tape', cat: 'promo', desc: 'A band of text scrolling across the screen, like a news ticker.', d: 4, ex: { text: 'FRESH DAILY  •  OPEN LATE  •  ORDER AHEAD' },
    fields: [['text', 'Text', 'text', () => (BRAND.services || []).slice(0, 4).join('  •  ') || BRAND.name, { max: 120 }], ['tilt', 'Tilt', 'range', 0, [-20, 20, 1]], ['speed', 'Speed', 'range', 1, [0.3, 3, 0.1]], ['color', 'Colour', 'col', 'ink']],
    box: () => [-620, -60, 1240, 120],
    draw(L, s) { const c = ctx, t = (str(L, 'text') || BRAND.name).toUpperCase() + '   •   ', h = 104, k = E.inOutC(clamp(s.p * 1.5)), out = E.inC(s.q); c.save(); c.rotate(num(L, 'tilt', 0) * Math.PI / 180);
      c.beginPath(); c.rect(-720, -h / 2 * k * (1 - out) - 2, 1440, h * k * (1 - out) + 4); c.clip(); c.fillStyle = s.c1; c.fillRect(-720, -h / 2, 1440, h); c.fillStyle = OR; c.fillRect(-720, -h / 2, 1440, 6); c.fillRect(-720, h / 2 - 6, 1440, 6);
      const fs = 50, fam = famOf(L, 'Mont'), w = Math.max(200, tw(t, 800, fs, fam, 2)), off = -(s.lt * 150 * num(L, 'speed', 1)) % w; for (let x = -720 + off - w; x < 780; x += w) tx(t, x, fs * 0.36, { size: fs, wt: 800, fam, col: s.fg, align: 'left', ls: 2 }); c.restore(); } });
  def('rays', { name: 'Burst rays', cat: 'promo', desc: 'Comic-style rays burst out behind a price or product.', d: 3, ex: {},
    fields: [['count', 'Rays', 'range', 18, [8, 36, 1]], ['size', 'Size', 'range', 520, [200, 1100, 10]], ['color', 'Colour', 'col', 'accent']],
    box: L => { const r = num(L, 'size', 520); return [-r, -r, 2 * r, 2 * r]; },
    draw(L, s) { const c = ctx, n = Math.round(num(L, 'count', 18)), r = num(L, 'size', 520) * E.outBack(clamp(s.p * 1.2)), a = 1 - E.inC(s.q); if (r <= 1) return; c.save(); c.globalAlpha *= a; c.rotate(s.lt * 0.25);
      const g = c.createRadialGradient(0, 0, r * 0.1, 0, 0, r); g.addColorStop(0, K8.rgba(s.c1, 0.95)); g.addColorStop(1, K8.rgba(s.c1, 0)); c.fillStyle = g;
      for (let i = 0; i < n; i++) { const a0 = i / n * TAU, w = TAU / n * 0.42; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r, a0 - w / 2, a0 + w / 2); c.closePath(); c.fill(); } c.restore(); } });

  // ================================================================== EDITORIAL
  def('divider', { name: 'Section divider', cat: 'editorial', desc: 'Two rules draw out from the centre around a small label.', d: 3, ex: { text: 'CHAPTER ONE' },
    fields: [['text', 'Label', 'text', '', { max: 26 }], ['width', 'Width', 'range', 760, [300, 1000, 10]], ['color', 'Colour', 'col', 'white']],
    box: L => { const w = num(L, 'width', 760); return [-w / 2, -40, w, 80]; },
    draw(L, s) { const c = ctx, w = num(L, 'width', 760), t = str(L, 'text').toUpperCase(), k = E.inOutC(clamp(s.p * 1.2)) * (1 - E.inOutC(s.q)), fs = 30, tw0 = t ? tw(t, 700, fs, 'Mono', 6) + 60 : 0;
      c.fillStyle = s.c1; const half = (w / 2 - tw0 / 2) * k; c.fillRect(-tw0 / 2 - half, -2, half, 3); c.fillRect(tw0 / 2, -2, half, 3);
      for (const x of [-tw0 / 2 - half, tw0 / 2 + half]) { c.save(); c.translate(x, 0); c.rotate(Math.PI / 4); c.fillRect(-6, -6, 12, 12); c.restore(); }
      if (t) tx(t, 0, fs * 0.36, { size: fs, wt: 700, fam: 'Mono', ls: 6, col: s.c1, a: clamp((k - 0.4) / 0.6) }); } });
  def('frame', { name: 'Animated frame', cat: 'editorial', desc: 'A border draws itself around the whole screen.', d: 3, full: true, ex: {},
    fields: [['style', 'Style', 'seg', 'double', [['single', 'Single'], ['double', 'Double'], ['corners', 'Corners']]], ['inset', 'Inset', 'range', 54, [16, 160, 2]], ['color', 'Colour', 'col', 'white']],
    box: () => [0, 0, W, H],
    draw(L, s) { const c = ctx, m = num(L, 'inset', 54), st = v(L, 'style'), k = E.inOutC(clamp(s.p * 0.8)), a = 1 - E.inC(s.q); c.save(); c.globalAlpha *= a; c.strokeStyle = s.c1; c.lineWidth = 4;
      const rect = (i) => { const x = i, y = i, w = W - 2 * i, h = H - 2 * i, per = 2 * (w + h); c.setLineDash([per * k, per]); c.beginPath(); c.moveTo(W / 2, y); c.lineTo(x + w, y); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.lineTo(x, y); c.lineTo(W / 2, y); c.stroke(); };
      if (st === 'corners') { const len = 120 * k; c.lineWidth = 7; for (const [x, y, dx, dy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) { c.beginPath(); c.moveTo(x + dx * len, y); c.lineTo(x, y); c.lineTo(x, y + dy * len); c.stroke(); } }
      else { rect(m); if (st === 'double') { c.lineWidth = 2; rect(m + 16); } }
      c.restore(); } });
  def('numlabel', { name: 'Numbered label', cat: 'editorial', desc: 'A big number and a two-line label slide in, for steps and chapters.', d: 3, ex: { num: '01', text: 'THE KITCHEN', sub: 'Open plan · island' },
    fields: [['num', 'Number', 'text', '01', { max: 4 }], ['text', 'Label', 'text', 'FIRST LOOK', { max: 22 }], ['sub', 'Second line', 'text', '', { max: 30 }], ['color', 'Number colour', 'col', 'accent']],
    box: () => [-420, -120, 840, 240],
    draw(L, s) { const c = ctx, n = str(L, 'num'), t = str(L, 'text').toUpperCase(), sub = str(L, 'sub'), k = E.outQ(clamp(s.p * 1.2)), out = E.inC(s.q), fam = famOf(L, 'Mont');
      const nw = tw(n, 900, 200, fam, -6), tot = nw + 50 + Math.max(tw(t, 900, 58, fam, 0), sub ? tw(sub, 600, 36, 'Mont', 0) : 0), x0 = -tot / 2; c.save(); c.globalAlpha *= 1 - out;
      c.save(); c.beginPath(); c.rect(x0 - 20, -150, nw + 40, 300); c.clip(); tx(n, x0, 70 + (1 - k) * 220, { size: 200, wt: 900, fam, col: s.c1, align: 'left', ls: -6 }); c.restore();
      c.fillStyle = WHT; c.fillRect(x0 + nw + 22, -70, 5, 140 * k);
      c.save(); c.beginPath(); c.rect(x0 + nw + 40, -110, 900, 220); c.clip(); const ox = (1 - k) * -300; tx(t, x0 + nw + 50 + ox, sub ? -2 : 22, { size: 58, wt: 900, fam, col: WHT, align: 'left' });
      if (sub) tx(sub, x0 + nw + 52 + ox * 1.3, 52, { size: 36, wt: 600, col: K8.rgba('white', 0.75), align: 'left' }); c.restore(); c.restore(); } });
  def('lower', { name: 'Lower third', cat: 'editorial', desc: 'Name and detail bars slide in one after the other.', d: 4, ex: { text: 'Your Name', sub: 'YOUR TITLE' },
    fields: [['text', 'Name', 'text', () => BRAND.name, { max: 30 }], ['sub', 'Detail', 'text', () => (BRAND.services || [])[0] || '', { max: 36 }], ['color', 'Accent', 'col', 'accent']],
    box: L => { const w = Math.max(tw(str(L, 'text'), 800, 56, 'Mont', 0), tw(str(L, 'sub').toUpperCase(), 700, 28, 'Mono', 4)) + 90; return [-w / 2, -80, w, 170]; },
    draw(L, s) { const c = ctx, t = str(L, 'text'), sub = str(L, 'sub').toUpperCase(), fam = famOf(L, 'Mont'), fs = fitS(t, 800, fam, 860, 56, 0), w1 = tw(t, 800, fs, fam, 0) + 70, w2 = sub ? tw(sub, 700, 28, 'Mono', 4) + 50 : 0, W0 = Math.max(w1, w2) + 20, x0 = -W0 / 2;
      const k1 = E.outQ(clamp(s.p * 1.3)), k2 = E.outQ(clamp(s.p * 1.3 - 0.3)), out = E.inC(s.q); c.save(); c.globalAlpha *= 1 - out;
      c.fillStyle = s.c1; c.fillRect(x0, -80, 14, sub ? 160 : 100); c.save(); c.beginPath(); c.rect(x0 + 14, -90, w1 * k1, 110); c.clip(); c.fillStyle = 'rgba(12,12,14,0.9)'; c.fillRect(x0 + 14, -80, w1, 100); tx(t, x0 + 46, -10, { size: fs, wt: 800, fam, col: '#FFFFFF', align: 'left' }); c.restore();
      if (sub) { c.save(); c.beginPath(); c.rect(x0 + 14, 20, w2 * k2, 70); c.clip(); c.fillStyle = s.c1; c.fillRect(x0 + 14, 20, w2, 60); tx(sub, x0 + 38, 60, { size: 28, wt: 700, fam: 'Mono', ls: 4, col: s.fg, align: 'left' }); c.restore(); }
      c.restore(); } });
  def('headpanel', { name: 'Headline panel', cat: 'editorial', desc: 'A solid panel wipes in and the headline reveals line by line.', d: 3.5, ex: { kicker: 'THIS SEASON', text: 'The new\nmenu is here' },
    fields: [['kicker', 'Kicker', 'text', '', { max: 24 }], ['text', 'Headline', 'area', 'What’s new', { max: 40 }], ['color', 'Panel colour', 'col', 'accent']],
    box: () => [-470, -210, 940, 420],
    draw(L, s) { const c = ctx, k = E.inOutC(clamp(s.p * 1.1)), out = E.inOutC(s.q), ls = String(v(L, 'text') || '').split('\n').filter(Boolean).slice(0, 3), kick = str(L, 'kicker').toUpperCase(), fam = famOf(L, 'Mont');
      const fs = Math.min(110, ...ls.map(l => fitS(l, 900, fam, 800, 110, -2))), h = ls.length * fs * 1.02 + (kick ? 90 : 40) + 70, w = 920; c.save();
      c.beginPath(); c.rect(-w / 2 + w * out, -h / 2, w * (k - out), h); c.clip(); c.fillStyle = s.c1; c.fillRect(-w / 2, -h / 2, w, h); c.fillStyle = BLK; c.fillRect(-w / 2, h / 2 - 16, w, 16);
      let y = -h / 2 + 60; if (kick) { tx(kick, -w / 2 + 56, y + 12, { size: 30, wt: 700, fam: 'Mono', ls: 5, col: s.fg, align: 'left', a: clamp((s.lt - 0.35) / 0.3) }); y += 60; }
      ls.forEach((l, i) => { const p = E.outQ(clamp((s.lt - 0.35 - i * 0.12) / 0.5)); c.save(); c.beginPath(); c.rect(-w / 2, y, w, fs * 1.05); c.clip(); tx(l, -w / 2 + 52, y + fs * 0.82 + (1 - p) * fs * 1.1, { size: fs, wt: 900, fam, col: s.fg, align: 'left', ls: -2 }); c.restore(); y += fs * 1.02; });
      c.restore(); } });
  def('masthead', { name: 'Magazine title', cat: 'editorial', desc: 'A masthead with rules and an issue line, like a magazine cover.', d: 3.5, ex: { text: 'Residence', line: 'ISSUE 04  ·  THE HILLSIDE HOUSE' },
    fields: [['text', 'Title', 'text', () => BRAND.short || BRAND.name, { max: 16 }], ['line', 'Issue line', 'text', '', { max: 40 }], ['color', 'Colour', 'col', 'white']],
    box: () => [-500, -170, 1000, 340],
    draw(L, s) { const c = ctx, t = str(L, 'text'), line = str(L, 'line').toUpperCase(), fam = famOf(L, 'Corm'), fs = fitS(t, 700, fam, 940, 230, 4), k = E.inOutC(clamp(s.p)), a = 1 - E.inC(s.q);
      c.save(); c.globalAlpha *= a; c.fillStyle = s.c1; const rw = 940 * k; c.fillRect(-rw / 2, -fs * 0.82, rw, 3); c.fillRect(-rw / 2, fs * 0.28, rw, 3);
      c.save(); c.beginPath(); c.rect(-520, -fs * 0.8, 1040, fs * 1.07); c.clip(); tx(t, 0, fs * 0.15 + (1 - E.outQ(clamp((s.lt - 0.2) / 0.7))) * fs, { size: fs, wt: 700, fam, col: s.c1, ls: 4 }); c.restore();
      if (line) tx(line, 0, fs * 0.28 + 56, { size: 26, wt: 700, fam: 'Mono', ls: 5, col: s.c1, a: clamp((s.lt - 0.7) / 0.4) }); c.restore(); } });
  def('caption', { name: 'Image caption', cat: 'editorial', desc: 'A figure number, a hairline and a short caption, set like a book.', d: 3.5, ex: { num: 'FIG. 02', text: 'Morning light in the breakfast nook' },
    fields: [['num', 'Number', 'text', 'FIG. 01', { max: 10 }], ['text', 'Caption', 'text', '', { req: 'caption', max: 48 }], ['color', 'Colour', 'col', 'white']],
    box: () => [-460, -70, 920, 140],
    draw(L, s) { const c = ctx, n = str(L, 'num').toUpperCase(), t = str(L, 'text'), fam = famOf(L, 'Corm'), k = E.outC(clamp(s.p)), a = 1 - E.inC(s.q); c.save(); c.globalAlpha *= a;
      if (n) tx(n, -450, -22, { size: 24, wt: 700, fam: 'Mono', ls: 4, col: OR, align: 'left', a: k }); c.fillStyle = s.c1; c.fillRect(-450, -6, 900 * E.inOutC(clamp(s.p * 1.2)), 2);
      if (!t) need('caption', 0, 50, 34); else tx(t, -450, 52 + (1 - k) * 18, { size: fitS(t, 600, fam, 900, 50, 0, 'italic'), wt: 600, it: 'italic', fam, col: s.c1, align: 'left', a: clamp((s.lt - 0.2) / 0.5), shadow: 'rgba(0,0,0,0.45)' }); c.restore(); } });
  def('quote', { name: 'Quote marks', cat: 'editorial', desc: 'Oversized quote marks frame a real quote, word for word.', d: 5, ex: { text: 'They made the whole process feel easy.', by: 'A REAL CUSTOMER' },
    fields: [['text', 'Quote (word for word)', 'area', '', { req: 'a real quote', max: 160 }], ['by', 'Who said it', 'text', '', { max: 40 }], ['color', 'Mark colour', 'col', 'accent']],
    box: () => [-460, -260, 920, 520],
    draw(L, s) { const c = ctx, t = String(v(L, 'text') || '').trim(), by = str(L, 'by').toUpperCase(), fam = famOf(L, 'Corm'), a = 1 - E.inC(s.q); c.save(); c.globalAlpha *= a;
      const qk = E.outBack(clamp(s.p * 1.3)); c.save(); c.translate(-380, -150); c.scale(qk, qk); tx('“', 0, 150, { size: 380, wt: 700, fam, col: s.c1 }); c.restore();
      if (!t) { need('a real quote', 0, 20, 36); c.restore(); return; }
      const fs = t.length > 110 ? 50 : t.length > 60 ? 58 : 68, words = t.split(/\s+/), rows = []; let cur = ''; for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (cur && tw(tr, 600, fs, fam, 0, 'italic') > 840) { rows.push(cur); cur = w; } else cur = tr; } if (cur) rows.push(cur);
      const y0 = -((rows.length - 1) * fs * 1.15) / 2 + 20; rows.forEach((r, i) => tx(r, 0, y0 + i * fs * 1.15, { size: fs, wt: 600, it: 'italic', fam, col: WHT, a: clamp((s.lt - 0.3 - i * 0.15) / 0.5), shadow: 'rgba(0,0,0,0.45)' }));
      if (by) tx('—  ' + by, 0, y0 + rows.length * fs * 1.15 + 40, { size: 28, wt: 700, fam: 'Mono', ls: 4, col: s.c1, a: clamp((s.lt - 0.6 - rows.length * 0.15) / 0.4) }); c.restore(); } });

  // ================================================================== CINEMATIC (screen overlays)
  const full = { full: true, box: () => [0, 0, W, H] };
  const lit = (fn) => { const c = ctx; c.save(); c.globalCompositeOperation = 'lighter'; try { fn(c); } finally { c.restore(); } };
  def('streaks', Object.assign({ name: 'Light streaks', cat: 'cine', desc: 'Anamorphic light streaks glide across the frame.', d: 3, ex: {},
    fields: [['amount', 'Amount', 'range', 1, [0.2, 2, 0.1]], ['color', 'Colour', 'col', '#8FD3FF']],
    draw(L, s) { const k = env(s) * num(L, 'amount', 1); lit(c => { for (let i = 0; i < 6; i++) { const y = H * (0.18 + 0.64 * hash(i * 3.1)), sp = 300 + hash(i * 5.3) * 500, len = 500 + hash(i * 2.2) * 700, x = lmod(s.lt * sp + hash(i * 7.7) * 2400, 2400) - 700;
      const g = c.createLinearGradient(x - len, 0, x + len, 0); g.addColorStop(0, K8.rgba(s.c1, 0)); g.addColorStop(0.5, K8.rgba(s.c1, 0.55 * k)); g.addColorStop(1, K8.rgba(s.c1, 0)); c.fillStyle = g; c.fillRect(x - len, y - 3, len * 2, 6);
      const g2 = c.createLinearGradient(x - len * 0.6, 0, x + len * 0.6, 0); g2.addColorStop(0, 'rgba(255,255,255,0)'); g2.addColorStop(0.5, `rgba(255,255,255,${0.7 * k})`); g2.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g2; c.fillRect(x - len * 0.6, y - 1, len * 1.2, 2);
      const r = c.createRadialGradient(x, y, 0, x, y, 90); r.addColorStop(0, K8.rgba(s.c1, 0.35 * k)); r.addColorStop(1, K8.rgba(s.c1, 0)); c.fillStyle = r; c.fillRect(x - 90, y - 90, 180, 180); } }); } }, full));
  const lmod = (a, b) => ((a % b) + b) % b;
  def('grain', Object.assign({ name: 'Film grain', cat: 'cine', desc: 'Moving film grain with a faint exposure flicker.', d: 4, ex: {},
    fields: [['amount', 'Amount', 'range', 0.6, [0.1, 1.5, 0.05]], ['flicker', 'Flicker', 'seg', 'on', [['on', 'On'], ['off', 'Off']]]],
    draw(L, s) { const c = ctx, k = num(L, 'amount', 0.6) * (1 - E.inC(s.q)) * clamp(s.p * 3), f = Math.floor(s.t * 30); if (!NOISE.length) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
      c.translate(Math.floor(hash(f * 1.7) * 256), Math.floor(hash(f * 2.3 + 5) * 256)); c.fillStyle = NOISE[f % 4]; c.globalAlpha *= clamp(k * 1.2, 0, 1); c.globalCompositeOperation = 'overlay'; c.fillRect(-256, -256, W + 512, H + 512);
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = clamp(k * 0.6); c.fillRect(-256, -256, W + 512, H + 512); c.restore();
      if (v(L, 'flicker') !== 'off') { const fl = (hash(f * 0.91) - 0.5) * 0.06 * k; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = fl > 0 ? `rgba(255,248,235,${fl})` : `rgba(0,0,0,${-fl})`; c.fillRect(0, 0, W, H); c.restore(); } } }, full));
  def('flare', Object.assign({ name: 'Lens flare', cat: 'cine', desc: 'A moving light source with a starburst and lens ghosts.', d: 3, ex: {},
    fields: [['amount', 'Amount', 'range', 1, [0.2, 2, 0.1]], ['path', 'Path', 'seg', 'across', [['across', 'Across'], ['down', 'Top down'], ['still', 'Still']]], ['color', 'Colour', 'col', '#FFD9A0']],
    draw(L, s) { const k = env(s) * num(L, 'amount', 1), u = clamp(s.lt / s.d), pth = v(L, 'path'), x = pth === 'still' ? W * 0.78 : pth === 'down' ? W * 0.7 : lerp(-W * 0.1, W * 1.1, u), y = pth === 'still' ? H * 0.2 : pth === 'down' ? lerp(-H * 0.05, H * 0.45, u) : H * (0.22 + 0.06 * Math.sin(u * 3));
      lit(c => { const r = c.createRadialGradient(x, y, 0, x, y, 520); r.addColorStop(0, `rgba(255,255,255,${0.9 * k})`); r.addColorStop(0.08, K8.rgba(s.c1, 0.65 * k)); r.addColorStop(0.35, K8.rgba(s.c1, 0.12 * k)); r.addColorStop(1, K8.rgba(s.c1, 0)); c.fillStyle = r; c.fillRect(x - 520, y - 520, 1040, 1040);
        c.strokeStyle = `rgba(255,255,255,${0.35 * k})`; c.lineWidth = 2; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI + s.lt * 0.15, l = 160 + 120 * hash(i); c.beginPath(); c.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
        const g = c.createLinearGradient(0, y, W, y); g.addColorStop(0, K8.rgba(s.c1, 0)); g.addColorStop(clamp(x / W), `rgba(200,225,255,${0.4 * k})`); g.addColorStop(1, K8.rgba(s.c1, 0)); c.fillStyle = g; c.fillRect(0, y - 2, W, 4);
        const cx = W / 2, cy = H / 2; [[0.5, 60, '#7FD4FF'], [0.75, 110, '#FFB36B'], [1.25, 40, '#B4FF9E'], [1.6, 150, '#9E8CFF'], [2.0, 70, '#FF8CC8']].forEach(([f, rad, col0], i) => { const gx = x + (cx - x) * f * 1.05, gy = y + (cy - y) * f * 1.05, rg = c.createRadialGradient(gx, gy, rad * 0.3, gx, gy, rad);
          rg.addColorStop(0, K8.rgba(col0, 0)); rg.addColorStop(0.8, K8.rgba(col0, 0.18 * k)); rg.addColorStop(1, K8.rgba(col0, 0)); c.fillStyle = rg; c.beginPath(); for (let j = 0; j < 6; j++) { const a = j / 6 * TAU + i; c.lineTo(gx + Math.cos(a) * rad, gy + Math.sin(a) * rad); } c.fill(); }); }); } }, full));
  def('particles', Object.assign({ name: 'Floating particles', cat: 'cine', desc: 'Soft bokeh lights drift up through the frame.', d: 4, ex: {},
    fields: [['amount', 'Amount', 'range', 1, [0.2, 2.5, 0.1]], ['color', 'Colour', 'col', '#FFE3B0']],
    draw(L, s) { const k = env(s), n = Math.round(36 * num(L, 'amount', 1)); lit(c => { for (let i = 0; i < n; i++) { const sp = 30 + hash(i * 3.7) * 90, life = (H + 200) / sp, ph = lmod(s.t + hash(i * 1.3) * life, life) / life, x = hash(i * 7.1) * W + Math.sin(s.t * 0.7 + i) * 40, y = H + 100 - ph * (H + 200), r = 6 + hash(i * 2.9) * 26, tw0 = 0.5 + 0.5 * Math.sin(s.t * 2 + i * 3);
      const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, K8.rgba(s.c1, 0.5 * k * tw0 * Math.sin(Math.PI * ph))); g.addColorStop(0.6, K8.rgba(s.c1, 0.22 * k * tw0 * Math.sin(Math.PI * ph))); g.addColorStop(1, K8.rgba(s.c1, 0)); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); } }); } }, full));
  def('smoke', Object.assign({ name: 'Smoke & haze', cat: 'cine', desc: 'Slow drifting smoke for atmosphere: grills, bars, fireplaces.', d: 5, ex: {},
    fields: [['amount', 'Amount', 'range', 1, [0.2, 2.5, 0.1]], ['color', 'Colour', 'col', '#FFFFFF']],
    draw(L, s) { const c = ctx, k = env(s) * num(L, 'amount', 1); c.save(); for (let i = 0; i < 16; i++) { const life = 6 + hash(i * 2.3) * 5, ph = lmod(s.t + hash(i * 5.1) * life, life) / life, x = W * (0.1 + 0.8 * hash(i * 9.3)) + Math.sin(s.t * 0.4 + i) * 60 + ph * 120 * (hash(i) - 0.5), y = H * 1.05 - ph * H * 0.9, r = 160 + ph * 380 * (0.6 + hash(i * 4.4));
      const g = c.createRadialGradient(x, y, 0, x, y, r), al = 0.11 * k * Math.sin(Math.PI * ph); g.addColorStop(0, K8.rgba(s.c1, al)); g.addColorStop(0.5, K8.rgba(s.c1, al * 0.5)); g.addColorStop(1, K8.rgba(s.c1, 0)); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); } c.restore(); } }, full));
  def('dust', Object.assign({ name: 'Dust & scratches', cat: 'cine', desc: 'Old-film specks, hairs and scratches.', d: 4, ex: {},
    fields: [['amount', 'Amount', 'range', 1, [0.2, 2, 0.1]]],
    draw(L, s) { const c = ctx, k = env(s) * num(L, 'amount', 1), f = Math.floor(s.t * 24); c.save(); c.fillStyle = `rgba(250,245,235,${0.75 * k})`; c.strokeStyle = `rgba(250,245,235,${0.4 * k})`;
      for (let i = 0; i < 14; i++) { if (hash(f * 3.1 + i) > 0.55) continue; const x = hash(f * 7.3 + i * 1.7) * W, y = hash(f * 1.9 + i * 4.1) * H, r = 1 + hash(f + i * 9) * 4; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
      if (hash(f * 0.7) < 0.35) { const x = hash(f * 2.7) * W, y = hash(f * 5.3) * H; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 30, y + 20, x + 10 + hash(f) * 40, y + 60); c.stroke(); }
      for (let j = 0; j < 2; j++) { const x = W * (0.2 + 0.6 * hash(Math.floor(s.t * 2) * 1.3 + j)) + Math.sin(s.t * 9 + j) * 6; if (hash(Math.floor(s.t * 2) + j * 7) < 0.6) { c.fillStyle = `rgba(255,255,255,${0.12 * k})`; c.fillRect(x, 0, 2, H); } } c.restore(); } }, full));
  def('glowedge', Object.assign({ name: 'Glowing edges', cat: 'cine', desc: 'A coloured glow breathes in from the edges of the frame.', d: 4, ex: {},
    fields: [['amount', 'Amount', 'range', 1, [0.2, 2, 0.1]], ['color', 'Colour', 'col', 'accent']],
    draw(L, s) { const c = ctx, k = env(s) * num(L, 'amount', 1) * (0.75 + 0.25 * Math.sin(s.lt * 2.4)); c.save(); const r = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.hypot(W, H) * 0.56);
      r.addColorStop(0, K8.rgba(s.c1, 0)); r.addColorStop(0.7, K8.rgba(s.c1, 0.28 * k)); r.addColorStop(1, K8.rgba(s.c1, 0.75 * k)); c.globalCompositeOperation = 'lighter'; c.fillStyle = r; c.fillRect(0, 0, W, H); c.restore(); } }, full));
  def('burn', Object.assign({ name: 'Film burn', cat: 'cine', desc: 'Orange light burns in from the edge and fades away.', d: 2.5, ex: {},
    fields: [['side', 'From', 'seg', 'right', [['left', 'Left'], ['right', 'Right'], ['top', 'Top'], ['bottom', 'Bottom']]], ['amount', 'Amount', 'range', 1, [0.3, 2, 0.1]]],
    draw(L, s) { const u = clamp(s.lt / s.d), k = Math.sin(Math.PI * u) * num(L, 'amount', 1), sd = v(L, 'side'), ex = sd === 'left' ? 0 : sd === 'right' ? W : W / 2, ey = sd === 'top' ? 0 : sd === 'bottom' ? H : H * 0.45;
      lit(c => { for (let i = 0; i < 5; i++) { const ox = ex + (hash(i * 3.3) - 0.5) * 500 + (sd === 'left' ? 1 : sd === 'right' ? -1 : 0) * 200 * u, oy = ey + (hash(i * 7.9) - 0.5) * 900, r = (300 + hash(i) * 500) * (0.6 + u);
        const g = c.createRadialGradient(ox, oy, 0, ox, oy, r); g.addColorStop(0, `rgba(255,230,170,${0.85 * k})`); g.addColorStop(0.3, `rgba(255,120,30,${0.6 * k})`); g.addColorStop(0.7, `rgba(200,30,10,${0.25 * k})`); g.addColorStop(1, 'rgba(120,0,0,0)'); c.fillStyle = g; c.fillRect(ox - r, oy - r, 2 * r, 2 * r); } }); } }, full));
  def('letterbox', Object.assign({ name: 'Letterbox bars', cat: 'cine', desc: 'Cinema bars slide in at the top and bottom.', d: 4, ex: {},
    fields: [['size', 'Bar height', 'range', 260, [60, 600, 10]], ['color', 'Colour', 'col', '#000000']],
    draw(L, s) { const c = ctx, h = num(L, 'size', 260) * E.inOutC(clamp(s.p)) * (1 - E.inOutC(s.q)); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = s.c1; c.fillRect(0, 0, W, h); c.fillRect(0, H - h, W, h); c.restore(); } }, full));
  def('leak', Object.assign({ name: 'Light leak', cat: 'cine', desc: 'Warm light leaks wash across the frame.', d: 3, ex: {},
    fields: [['amount', 'Amount', 'range', 1, [0.2, 2, 0.1]], ['color', 'Colour', 'col', '#FF9A3D']],
    draw(L, s) { const k = env(s) * num(L, 'amount', 1); lit(c => { [[0, 0.9], [1, 0.6], [2, 0.75]].forEach(([i, a]) => { const x = lerp(-300, W + 300, lmod(s.lt * (0.12 + i * 0.05) + i * 0.33, 1.3) / 1.3), y = H * (0.2 + 0.3 * i), r = 600 + i * 200;
      const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, K8.rgba(i === 1 ? '#FF4D6D' : s.c1, 0.5 * a * k)); g.addColorStop(0.5, K8.rgba(s.c1, 0.18 * a * k)); g.addColorStop(1, K8.rgba(s.c1, 0)); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }); }); } }, full));
  def('embers', Object.assign({ name: 'Embers & sparks', cat: 'cine', desc: 'Glowing embers rise and flicker: grills, fire pits, launches.', d: 4, ex: {},
    fields: [['amount', 'Amount', 'range', 1, [0.2, 2.5, 0.1]]],
    draw(L, s) { const c = ctx; c.save(); c.globalAlpha *= env(s); K4.embers([0, 0, W, H], s.t, Math.round(60 * num(L, 'amount', 1)), 0.95); c.restore(); } }, full));
  def('confetti', Object.assign({ name: 'Confetti', cat: 'cine', desc: 'A confetti shower in your colours for openings and wins.', d: 4, ex: {},
    fields: [['amount', 'Amount', 'range', 1, [0.2, 2.5, 0.1]]],
    draw(L, s) { const c = ctx, n = Math.round(90 * num(L, 'amount', 1)), cols = [OR, ACC2, '#FFFFFF', PAPER], a = 1 - E.inC(s.q); c.save(); c.globalAlpha *= a;
      for (let i = 0; i < n; i++) { const t0 = hash(i * 1.7) * 0.8, lt = s.lt - t0; if (lt < 0) continue; const vx = (hash(i * 3.1) - 0.5) * 700, x = W * hash(i * 9.7) + vx * Math.min(lt, 1) * 0.4 + Math.sin(lt * 4 + i) * 40, y = -60 + lt * (260 + hash(i * 5.5) * 260) + lt * lt * 40, rot = lt * (3 + hash(i) * 6) + i;
        if (y > H + 60) continue; c.save(); c.translate(x, y); c.rotate(rot); c.scale(1, Math.cos(lt * 7 + i)); c.fillStyle = cols[i % 4]; c.fillRect(-9, -5, 18, 10); c.restore(); } c.restore(); } }, full));

  // ================================================================== GEOMETRIC
  def('rings', { name: 'Animated circles', cat: 'geo', desc: 'A ring draws itself while echoes ripple outward.', d: 3, ex: {},
    fields: [['size', 'Size', 'range', 260, [80, 520, 4]], ['color', 'Colour', 'col', 'accent']],
    box: L => { const r = num(L, 'size', 260) * 1.6; return [-r, -r, 2 * r, 2 * r]; },
    draw(L, s) { const c = ctx, r = num(L, 'size', 260), a = 1 - E.inC(s.q); c.save(); c.globalAlpha *= a; c.lineCap = 'round';
      c.strokeStyle = s.c1; c.lineWidth = 12; c.beginPath(); c.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + TAU * E.inOutC(clamp(s.p * 0.9))); c.stroke();
      for (let i = 0; i < 3; i++) { const ph = lmod(s.lt * 0.6 + i / 3, 1); c.strokeStyle = K8.rgba(s.c1, (1 - ph) * 0.6 * clamp(s.p * 2)); c.lineWidth = 4; c.beginPath(); c.arc(0, 0, r * (1 + ph * 0.6), 0, TAU); c.stroke(); }
      c.setLineDash([4, 18]); c.strokeStyle = K8.rgba('white', 0.6 * clamp(s.p * 2)); c.lineWidth = 4; c.save(); c.rotate(s.lt * 0.4); c.beginPath(); c.arc(0, 0, r * 0.82, 0, TAU); c.stroke(); c.restore(); c.restore(); } });
  def('squares', { name: 'Rotating squares', cat: 'geo', desc: 'Nested outlined squares turn against each other.', d: 3, ex: {},
    fields: [['size', 'Size', 'range', 240, [80, 500, 4]], ['color', 'Colour', 'col', 'white']],
    box: L => { const r = num(L, 'size', 240) * 1.5; return [-r, -r, 2 * r, 2 * r]; },
    draw(L, s) { const c = ctx, r = num(L, 'size', 240), k = E.outBack(clamp(s.p * 1.2)) * (1 - E.inC(s.q)); if (k <= 0) return; c.save(); c.scale(k, k); [[1, 1, 8, s.c1], [0.72, -1.4, 5, OR], [0.48, 2, 4, s.c1]].forEach(([f, sp, lw, cc]) => { c.save(); c.rotate(s.lt * sp * 0.6 + f); c.strokeStyle = cc; c.lineWidth = lw; c.strokeRect(-r * f, -r * f, 2 * r * f, 2 * r * f); c.restore(); }); c.restore(); } });
  def('lines', { name: 'Speed lines', cat: 'geo', desc: 'Parallel diagonal bars sweep in, one after another.', d: 3, ex: {},
    fields: [['count', 'Lines', 'range', 6, [2, 12, 1]], ['width', 'Width', 'range', 760, [200, 1200, 10]], ['color', 'Colour', 'col', 'accent'], ['col2', 'Second colour', 'col', 'white']],
    box: L => { const w = num(L, 'width', 760); return [-w / 2, -200, w, 400]; },
    draw(L, s) { const c = ctx, n = Math.round(num(L, 'count', 6)), w = num(L, 'width', 760), h = 24, gap = 22, tot = n * (h + gap); c.save(); c.rotate(-0.35);
      for (let i = 0; i < n; i++) { const k = E.outQ(clamp(s.p * 1.4 - i * 0.08)), q = E.inC(clamp(s.q * 1.4 - i * 0.05)), y = -tot / 2 + i * (h + gap); c.fillStyle = i % 2 ? s.c2 : s.c1; c.fillRect(-w / 2 + w * q, y, w * (k - q), h); } c.restore(); } });
  def('grid', Object.assign({ name: 'Grid system', cat: 'geo', desc: 'A design grid draws in across the frame, with crosses at the joins.', d: 3.5, ex: {},
    fields: [['cols', 'Columns', 'range', 6, [2, 12, 1]], ['color', 'Colour', 'col', 'white']],
    draw(L, s) { const c = ctx, n = Math.round(num(L, 'cols', 6)), cw = W / n, rows = Math.ceil(H / cw), a = 1 - E.inC(s.q); c.save(); c.globalAlpha *= a; c.strokeStyle = K8.rgba(s.c1, 0.28); c.lineWidth = 2;
      for (let i = 1; i < n; i++) { const k = E.inOutC(clamp(s.p * 1.3 - i * 0.04)); c.beginPath(); c.moveTo(i * cw, 0); c.lineTo(i * cw, H * k); c.stroke(); }
      for (let j = 1; j < rows; j++) { const k = E.inOutC(clamp(s.p * 1.3 - 0.2 - j * 0.03)); c.beginPath(); c.moveTo(0, j * cw); c.lineTo(W * k, j * cw); c.stroke(); }
      c.strokeStyle = K8.rgba(s.c1, 0.75 * clamp(s.p * 2 - 1)); for (let i = 1; i < n; i++) for (let j = 1; j < rows; j++) { const x = i * cw, y = j * cw; c.beginPath(); c.moveTo(x - 8, y); c.lineTo(x + 8, y); c.moveTo(x, y - 8); c.lineTo(x, y + 8); c.stroke(); } c.restore(); } }, full));
  def('shapes', { name: 'Playful shapes', cat: 'geo', desc: 'Triangles, rings, squiggles and plus signs pop in around a point.', d: 3.5, ex: {},
    fields: [['size', 'Spread', 'range', 380, [150, 600, 5]]],
    box: L => { const r = num(L, 'size', 380) + 80; return [-r, -r, 2 * r, 2 * r]; },
    draw(L, s) { const c = ctx, R = num(L, 'size', 380), cols = [OR, ACC2, '#FFFFFF', OR, ACC2, '#FFFFFF', OR]; c.save(); c.lineWidth = 9; c.lineCap = 'round'; c.lineJoin = 'round';
      for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + 0.4, k = E.outBack(clamp(s.p * 1.5 - i * 0.07)) * (1 - E.inC(clamp(s.q * 1.3 - i * 0.03))); if (k <= 0) continue; const x = Math.cos(a) * R * (0.8 + 0.25 * hash(i)), y = Math.sin(a) * R * (0.8 + 0.25 * hash(i * 2)) + Math.sin(s.lt * 2 + i) * 10;
        c.save(); c.translate(x, y); c.rotate(s.lt * (i % 2 ? 0.8 : -0.6) + i); c.scale(k, k); c.strokeStyle = cols[i]; c.fillStyle = cols[i]; const z = 34;
        switch (i % 5) { case 0: c.beginPath(); c.moveTo(0, -z); c.lineTo(z * 0.9, z * 0.6); c.lineTo(-z * 0.9, z * 0.6); c.closePath(); c.stroke(); break; case 1: c.beginPath(); c.arc(0, 0, z * 0.8, 0, TAU); c.stroke(); break;
          case 2: c.beginPath(); c.moveTo(-z, 0); for (let k2 = 0; k2 <= 4; k2++) c.quadraticCurveTo(-z + k2 * z * 0.5 + z * 0.25, (k2 % 2 ? -1 : 1) * z * 0.5, -z + (k2 + 1) * z * 0.5, 0); c.stroke(); break; case 3: c.beginPath(); c.moveTo(-z * 0.7, 0); c.lineTo(z * 0.7, 0); c.moveTo(0, -z * 0.7); c.lineTo(0, z * 0.7); c.stroke(); break; default: c.fillRect(-z * 0.5, -z * 0.5, z, z); }
        c.restore(); } c.restore(); } });
  def('border', { name: 'Dynamic border', cat: 'geo', desc: 'A thick border draws round a region, then a light runs along it.', d: 3.5, ex: {},
    fields: [['w', 'Width', 'range', 760, [200, 1060, 10]], ['h', 'Height', 'range', 560, [120, 1800, 10]], ['radius', 'Corners', 'range', 28, [0, 200, 2]], ['color', 'Colour', 'col', 'accent']],
    box: L => { const w = num(L, 'w', 760), h = num(L, 'h', 560); return [-w / 2 - 10, -h / 2 - 10, w + 20, h + 20]; },
    draw(L, s) { const c = ctx, w = num(L, 'w', 760), h = num(L, 'h', 560), rad = num(L, 'radius', 28), per = 2 * (w + h), k = E.inOutC(clamp(s.p * 0.9)), a = 1 - E.inC(s.q); c.save(); c.globalAlpha *= a; c.lineWidth = 12; c.lineCap = 'round';
      c.strokeStyle = s.c1; c.setLineDash([per * k, per * 2]); rr(-w / 2, -h / 2, w, h, rad); c.stroke(); if (k >= 1) { const ph = lmod(s.lt * 0.5, 1); c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 6; c.setLineDash([per * 0.12, per]); c.lineDashOffset = -per * ph; rr(-w / 2, -h / 2, w, h, rad); c.stroke(); } c.restore(); } });
  def('blob', { name: 'Organic blob', cat: 'geo', desc: 'A soft shape that morphs slowly, to sit behind text or a product.', d: 4, ex: {},
    fields: [['size', 'Size', 'range', 320, [100, 700, 5]], ['color', 'Colour', 'col', 'accent']],
    box: L => { const r = num(L, 'size', 320) * 1.2; return [-r, -r, 2 * r, 2 * r]; },
    draw(L, s) { const c = ctx, r = num(L, 'size', 320) * E.outBack(clamp(s.p * 1.1)) * (1 - E.inC(s.q)); if (r <= 1) return; c.save(); c.beginPath();
      for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU, rad = r * (1 + 0.09 * Math.sin(a * 3 + s.lt * 1.3) + 0.06 * Math.sin(a * 5 - s.lt * 1.7) + 0.04 * Math.cos(a * 2 + s.lt)); c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); } c.closePath(); c.fillStyle = s.c1; c.globalAlpha *= 0.95; c.fill(); c.restore(); } });

  // ================================================================== INFORMATIONAL
  def('progress', { name: 'Progress bar', cat: 'info', desc: 'A labelled bar fills to the value you set.', d: 3, ex: { label: 'RENOVATION', value: 80 },
    fields: [['label', 'Label', 'text', '', { max: 24 }], ['value', 'Fill to (%)', 'num', 100, [0, 100]], ['show', 'Show the %', 'seg', 'on', [['on', 'Yes'], ['off', 'No']]], ['color', 'Colour', 'col', 'accent']],
    box: () => [-400, -80, 800, 140],
    draw(L, s) { const c = ctx, val = clamp(num(L, 'value', 100) / 100), k = E.inOutC(clamp((s.lt - 0.2) / 1.2)) * val, a = env(s), lab = str(L, 'label').toUpperCase(); c.save(); c.globalAlpha *= a;
      c.fillStyle = 'rgba(255,255,255,0.18)'; rr(-380, 0, 760, 34, 17); c.fill(); c.fillStyle = s.c1; rr(-380, 0, Math.max(34, 760 * k), 34, 17); c.fill();
      if (lab) tx(lab, -380, -22, { size: 30, wt: 700, fam: 'Mono', ls: 4, col: WHT, align: 'left' }); if (v(L, 'show') !== 'off') tx(Math.round(k * 100) + '%', 380, -22, { size: 34, wt: 800, col: WHT, align: 'right' }); c.restore(); } });
  def('stat', { name: 'Animated statistic', cat: 'info', desc: 'A number counts up with its label. Use your own real figure.', d: 3, ex: { value: '3,500+', label: 'PROJECTS COMPLETED' },
    fields: [['value', 'Number', 'text', '', { req: 'number', max: 12 }], ['label', 'Label', 'text', '', { max: 28 }], ['size', 'Size', 'range', 200, [80, 320, 2]], ['color', 'Number colour', 'col', 'accent']],
    box: L => { const z = num(L, 'size', 200); return [-480, -z * 0.9, 960, z * 1.45]; },
    draw(L, s) { const c = ctx, z = num(L, 'size', 200), val = str(L, 'value'), lab = str(L, 'label').toUpperCase(), fam = famOf(L, 'Mont'), a = 1 - E.inC(s.q); c.save(); c.globalAlpha *= a;
      if (!val) { need('number', 0, -z * 0.2, 44); c.restore(); return; }
      const P = parseNum(val), k = E.outExpo(clamp((s.lt - 0.1) / 1.2)), shown = P ? P.pre + fmtNum(P, P.n * k) + P.suf : val, fs = fitS(val, 900, fam, 960, z, -3);
      c.save(); c.globalAlpha *= clamp(s.p * 4); c.translate(0, (1 - E.outBack(clamp(s.p * 1.4))) * 60); tx(shown, 0, 0, { size: fs, wt: 900, fam, col: s.c1, ls: -3, shadow: 'rgba(0,0,0,0.35)' }); c.restore();
      if (lab) tx(lab, 0, fs * 0.42, { size: Math.min(36, fitS(lab, 700, 'Mono', 960, 36, 5)), wt: 700, fam: 'Mono', ls: 5, col: WHT, a: clamp((s.lt - 0.5) / 0.4), shadow: 'rgba(0,0,0,0.5)' }); c.restore(); } });
  def('features', { name: 'Feature callouts', cat: 'info', desc: 'Up to five features tick in one by one.', d: 4, ex: { items: 'Chef’s kitchen\nHeated floors\nTwo-car garage' },
    fields: [['items', 'Features (one per line)', 'area', '', { req: 'features', max: 160 }], ['color', 'Tick colour', 'col', 'accent']],
    box: () => [-420, -230, 840, 460],
    draw(L, s) { const c = ctx, it = lines(v(L, 'items')).slice(0, 5), fam = famOf(L, 'Mont'); if (!it.length) { need('features', 0, 0, 40); return; }
      const rowH = 96, y0 = -((it.length - 1) * rowH) / 2, a = 1 - E.inC(s.q); c.save(); c.globalAlpha *= a;
      it.forEach((t, i) => { const k = clamp((s.lt - 0.15 - i * 0.32) / 0.45); if (k <= 0) return; const y = y0 + i * rowH, e = E.outBack(k); c.save(); c.translate(-380, y); c.save(); c.scale(e, e); c.fillStyle = s.c1; c.beginPath(); c.arc(0, 0, 32, 0, TAU); c.fill(); icon('check', 0, 0, 40, s.fg, { lw: 3.4 }); c.restore();
        c.beginPath(); c.rect(52, -50, 800, 100); c.clip(); tx(t, 64 - (1 - E.outQ(k)) * 300, 18, { size: fitS(t, 800, fam, 720, 54, 0), wt: 800, fam, col: WHT, align: 'left', shadow: 'rgba(0,0,0,0.45)' }); c.restore(); }); c.restore(); } });
  def('pin', { name: 'Map pin', cat: 'info', desc: 'A drawn map card; the pin drops and ripples on the place you name.', d: 3.5, ex: { text: 'Maple Grove' },
    fields: [['text', 'Place', 'text', '', { req: 'place', max: 30 }], ['sub', 'Second line', 'text', '', { max: 36 }], ['color', 'Pin colour', 'col', 'accent']],
    box: () => [-320, -260, 640, 520],
    draw(L, s) { const c = ctx, w = 600, h = 420, k = E.outBack(clamp(s.p * 1.2)) * (1 - E.inC(s.q)), t = str(L, 'text'), sub = str(L, 'sub'); if (k <= 0) return; c.save(); c.scale(k, k);
      c.save(); c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 40; c.shadowOffsetY = 16; c.fillStyle = PAPER; rr(-w / 2, -h / 2, w, h, 28); c.fill(); c.restore();
      c.save(); rr(-w / 2, -h / 2, w, h - 120, 28); c.clip(); c.fillStyle = K8.mix(PAPER, '#9BB7A0', 0.35); c.fillRect(-w / 2, -h / 2, w, h); c.strokeStyle = '#FFFFFF'; c.lineCap = 'round';
        const r = rng(11); for (let i = 0; i < 7; i++) { c.lineWidth = i < 2 ? 18 : 8; c.beginPath(); const y = -h / 2 + r() * (h - 120), x = -w / 2 + r() * w; if (i % 2) { c.moveTo(-w / 2 - 20, y); c.lineTo(w / 2 + 20, y + (r() - 0.5) * 80); } else { c.moveTo(x, -h / 2 - 20); c.lineTo(x + (r() - 0.5) * 120, h / 2); } c.stroke(); }
        c.strokeStyle = 'rgba(80,140,200,0.6)'; c.lineWidth = 22; c.beginPath(); c.moveTo(-w / 2, 40); c.bezierCurveTo(-120, -10, 60, 120, w / 2, 60); c.stroke(); c.restore();
      const drop = E.outBack(clamp((s.lt - 0.35) / 0.5)), py = -h / 2 + (h - 120) / 2 + 30; for (let i = 0; i < 2; i++) { const ph = lmod(s.lt * 0.8 - 0.5 - i * 0.5, 1); if (s.lt < 0.8) continue; c.strokeStyle = K8.rgba(s.c1, (1 - ph) * 0.8); c.lineWidth = 4; c.beginPath(); c.ellipse(0, py, 20 + ph * 90, (20 + ph * 90) * 0.35, 0, 0, TAU); c.stroke(); }
      c.save(); c.translate(0, py - 70 - (1 - drop) * 300); c.globalAlpha *= clamp((s.lt - 0.35) * 5); c.fillStyle = s.c1; c.beginPath(); c.moveTo(0, 70); c.bezierCurveTo(-60, 0, -55, -60, 0, -60); c.bezierCurveTo(55, -60, 60, 0, 0, 70); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(0, -18, 20, 0, TAU); c.fill(); c.restore();
      if (!t) need('place', 0, h / 2 - 62, 32); else { tx(t, -w / 2 + 40, h / 2 - (sub ? 66 : 46), { size: fitS(t, 800, famOf(L, 'Mont'), w - 80, 48, 0), wt: 800, fam: famOf(L, 'Mont'), col: BLK, align: 'left' }); if (sub) tx(sub.toUpperCase(), -w / 2 + 40, h / 2 - 28, { size: 24, wt: 700, fam: 'Mono', ls: 3, col: K8.rgba(BLK, 0.6), align: 'left' }); }
      c.restore(); } });
  def('measure', { name: 'Measurement line', cat: 'info', desc: 'A dimension line draws out from the centre with its measurement.', d: 3, ex: { text: '24 FT' },
    fields: [['text', 'Measurement', 'text', '', { req: 'measurement', max: 14 }], ['len', 'Length', 'range', 640, [120, 1040, 10]], ['color', 'Colour', 'col', 'white']],
    box: L => { const l = num(L, 'len', 640); return [-l / 2 - 20, -90, l + 40, 130]; },
    draw(L, s) { const c = ctx, l = num(L, 'len', 640), k = E.inOutC(clamp(s.p * 1.1)), a = 1 - E.inC(s.q), t = str(L, 'text').toUpperCase(), half = l / 2 * k; c.save(); c.globalAlpha *= a; c.strokeStyle = s.c1; c.fillStyle = s.c1; c.lineWidth = 4;
      c.beginPath(); c.moveTo(-half, 0); c.lineTo(half, 0); c.stroke(); for (const sx of [-1, 1]) { const x = sx * half; c.beginPath(); c.moveTo(x, -26); c.lineTo(x, 26); c.stroke(); c.beginPath(); c.moveTo(x, 0); c.lineTo(x - sx * 22, -11); c.lineTo(x - sx * 22, 11); c.closePath(); c.fill(); }
      if (!t) need('measurement', 0, -44, 30); else { const fs = 44, w = tw(t, 800, fs, 'Mono', 3) + 36; c.fillStyle = 'rgba(0,0,0,0.55)'; rr(-w / 2, -80, w, 60, 8); c.globalAlpha *= clamp((k - 0.5) * 2); c.fill(); tx(t, 0, -36, { size: fs, wt: 800, fam: 'Mono', ls: 3, col: s.c1 }); } c.restore(); } });
  def('specs', { name: 'Specification panel', cat: 'info', desc: 'Label and value rows slide in on a clean panel.', d: 4, ex: { rows: 'BEDS: 4\nBATHS: 3.5\nSQ FT: 3,420\nYEAR BUILT: 2019' },
    fields: [['rows', 'Rows (Label: value, one per line)', 'area', '', { req: 'details', max: 220 }], ['color', 'Accent', 'col', 'accent']],
    box: L => { const n = Math.max(1, pairs(v(L, 'rows')).length); return [-400, -n * 47 - 30, 800, n * 94 + 60]; },
    draw(L, s) { const c = ctx, rows = pairs(v(L, 'rows')).slice(0, 7), fam = famOf(L, 'Mont'); if (!rows.length) { need('details', 0, 0, 38); return; }
      const rh = 94, h = rows.length * rh + 40, w = 800, k = E.inOutC(clamp(s.p)), a = 1 - E.inC(s.q); c.save(); c.globalAlpha *= a; c.fillStyle = 'rgba(10,10,14,0.78)'; rr(-w / 2, -h / 2, w, h * k, 22); c.fill(); c.fillStyle = s.c1; c.fillRect(-w / 2, -h / 2, 10, h * k);
      rows.forEach(([lab, val], i) => { const p = E.outQ(clamp((s.lt - 0.25 - i * 0.12) / 0.45)); if (p <= 0) return; const y = -h / 2 + 20 + i * rh + rh / 2; c.save(); c.globalAlpha *= p; c.translate((1 - p) * 60, 0);
        tx(lab.toUpperCase(), -w / 2 + 50, y + 10, { size: 28, wt: 700, fam: 'Mono', ls: 4, col: K8.rgba('white', 0.7), align: 'left' }); tx(val, w / 2 - 44, y + 16, { size: fitS(val, 800, fam, 420, 48, 0), wt: 800, fam, col: WHT, align: 'right' });
        if (i < rows.length - 1) { c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(-w / 2 + 50, y + rh / 2, w - 94, 2); } c.restore(); }); c.restore(); } });
  def('counters', { name: 'Icon counters', cat: 'info', desc: 'Beds, baths, square feet and parking count up under their icons. Empty ones hide.', d: 3.5, ex: { bed: '4', bath: '3.5', area: '3,420', car: '2' },
    fields: [['bed', 'Bedrooms', 'text', '', { max: 4 }], ['bath', 'Bathrooms', 'text', '', { max: 4 }], ['area', 'Square feet', 'text', '', { max: 8 }], ['car', 'Parking', 'text', '', { max: 3 }], ['color', 'Icon colour', 'col', 'accent']],
    box: () => [-480, -130, 960, 260],
    draw(L, s) { const c = ctx, items = [['bed', 'BEDS'], ['bath', 'BATHS'], ['area', 'SQ FT'], ['car', 'PARKING']].map(([k, lab]) => [k, lab, str(L, k)]).filter(x => x[2]); if (!items.length) { need('the numbers', 0, 0, 38); return; }
      const cw = Math.min(250, 940 / items.length), x0 = -((items.length - 1) * cw) / 2, a = 1 - E.inC(s.q), fam = famOf(L, 'Mont'); c.save(); c.globalAlpha *= a;
      items.forEach(([k, lab, val], i) => { const p = clamp((s.lt - 0.1 - i * 0.18) / 0.5); if (p <= 0) return; const x = x0 + i * cw, e = E.outBack(p), P = parseNum(val), cnt = E.outExpo(clamp((s.lt - 0.2 - i * 0.18) / 0.9));
        c.save(); c.translate(x, 0); c.save(); c.translate(0, -70); c.scale(e, e); icon(k, 0, 0, 64, s.c1, { lw: 1.8 }); c.restore();
        tx(P ? P.pre + fmtNum(P, P.n * cnt) + P.suf : val, 0, 40, { size: fitS(val, 900, fam, cw - 20, 74, -1), wt: 900, fam, col: WHT, ls: -1, a: clamp(p * 3), shadow: 'rgba(0,0,0,0.45)' });
        tx(lab, 0, 84, { size: 24, wt: 700, fam: 'Mono', ls: 4, col: K8.rgba('white', 0.75), a: clamp(p * 2 - 0.5) }); if (i < items.length - 1) { c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(cw / 2 - 1, -80, 2, 170 * E.outC(p)); } c.restore(); }); c.restore(); } });
  def('chart', { name: 'Bar chart', cat: 'info', desc: 'Bars grow to the values you enter, with labels.', d: 4, ex: { rows: 'MON: 40\nTUE: 55\nWED: 70\nTHU: 90' },
    fields: [['rows', 'Bars (Label: value, one per line)', 'area', '', { req: 'values', max: 160 }], ['color', 'Bar colour', 'col', 'accent']],
    box: () => [-420, -260, 840, 520],
    draw(L, s) { const c = ctx, rows = pairs(v(L, 'rows')).slice(0, 6).map(([l, x]) => [l, parseFloat(String(x).replace(/[^\d.\-]/g, '')), x]).filter(r => Number.isFinite(r[1])); if (!rows.length) { need('values', 0, 0, 38); return; }
      const mx = Math.max(...rows.map(r => r[1]), 1e-6), n = rows.length, w = 800, h = 400, bw = w / n * 0.62, a = 1 - E.inC(s.q); c.save(); c.globalAlpha *= a; c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-w / 2, h / 2, w * E.inOutC(clamp(s.p * 1.5)), 3);
      rows.forEach(([lab, val, raw], i) => { const k = E.outBack(clamp((s.lt - 0.2 - i * 0.12) / 0.6)), bh = Math.max(0, val / mx) * (h - 60) * k, x = -w / 2 + (i + 0.5) * (w / n); c.fillStyle = i === rows.length - 1 ? s.c1 : K8.rgba(s.c1, 0.6); rr(x - bw / 2, h / 2 - bh, bw, bh, 8); c.fill();
        tx(String(raw).trim(), x, h / 2 - bh - 16, { size: 34, wt: 800, col: WHT, a: clamp(k * 2 - 1) }); tx(lab.toUpperCase(), x, h / 2 + 44, { size: Math.min(26, fitS(lab.toUpperCase(), 700, 'Mono', w / n - 10, 26, 2)), wt: 700, fam: 'Mono', ls: 2, col: K8.rgba('white', 0.8) }); }); c.restore(); } });

  // ================================================================== SOCIAL
  // stars follow the brand kit's 'Flag star ratings' rule (on by default): only a brand that switched it off shows them; never DPG
  const starsAllowed = () => PV.on || (!dpg() && !!(window.NX && NX.app && NX.app.B && NX.app.B().rules && NX.app.B().rules.stars === false));
  const PV = { on: false };
  function stars(x, y, size, val, col, k) { for (let i = 0; i < 5; i++) { const cx = x + (i - 2) * size * 1.12, f = clamp(val - i), p = clamp(k * 5 - i * 0.6); if (p <= 0) continue; ctx.save(); ctx.translate(cx, y); ctx.scale(E.outBack(p), E.outBack(p)); icon('star', 0, 0, size, 'rgba(255,255,255,0.22)');
    if (f > 0) { ctx.beginPath(); ctx.rect(-size / 2, -size / 2, size * f, size); ctx.clip(); icon('star', 0, 0, size, col); } ctx.restore(); } }
  def('review', { name: 'Review card', cat: 'social', desc: 'A real review on a card, word for word. Stars only if you enter the rating.', d: 5, ex: { text: 'Friendly team, spotless work and they finished on schedule.', by: 'Jordan M.', rating: '5' },
    fields: [['text', 'Review (word for word)', 'area', '', { req: 'a real review', max: 220 }], ['by', 'Reviewer name', 'text', '', { max: 30 }], ['rating', 'Their star rating (optional)', 'text', '', { max: 3 }], ['color', 'Accent', 'col', 'accent']],
    box: () => [-450, -230, 900, 460],
    draw(L, s) { const c = ctx, t = String(v(L, 'text') || '').trim(), by = str(L, 'by'), rt = parseFloat(str(L, 'rating')), k = E.outQ(clamp(s.p * 1.1)), a = 1 - E.inC(s.q), fam = famOf(L, 'Mont');
      const fs = t.length > 140 ? 38 : 44, words = t.split(/\s+/).filter(Boolean), rows = []; let cur = ''; for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (cur && tw(tr, 600, fs, fam, 0) > 780) { rows.push(cur); cur = w; } else cur = tr; } if (cur) rows.push(cur);
      const showStars = Number.isFinite(rt) && rt > 0 && starsAllowed(), h = 150 + Math.max(1, rows.length) * fs * 1.3 + (showStars ? 70 : 20), w = 880; c.save(); c.globalAlpha *= a * clamp(s.p * 3); c.translate(0, (1 - k) * 160);
      c.save(); c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 40; c.shadowOffsetY = 14; c.fillStyle = '#FFFFFF'; rr(-w / 2, -h / 2, w, h, 30); c.fill(); c.restore();
      const top = -h / 2 + 50; c.fillStyle = s.c1; c.beginPath(); c.arc(-w / 2 + 84, top + 34, 38, 0, TAU); c.fill(); tx((by || '?').charAt(0).toUpperCase(), -w / 2 + 84, top + 50, { size: 44, wt: 800, col: s.fg });
      tx(by || 'Reviewer', -w / 2 + 140, top + 28, { size: 36, wt: 800, fam, col: '#111', align: 'left' }); tx('REVIEW', -w / 2 + 140, top + 64, { size: 22, wt: 700, fam: 'Mono', ls: 3, col: 'rgba(0,0,0,0.5)', align: 'left' });
      let y = top + 120; if (showStars) { c.save(); c.translate(-w / 2 + 48 + 2 * 46 * 1.12 + 23, y); stars(0, 0, 46, Math.min(5, rt), '#F5B301', clamp((s.lt - 0.3) / 0.8)); c.restore(); y += 70; }
      if (!t) need('a real review', 0, y + 10, 34); else rows.forEach((r, i) => tx(r, -w / 2 + 48, y + i * fs * 1.3 + fs * 0.4, { size: fs, wt: 600, fam, col: '#222', align: 'left', a: clamp((s.lt - 0.3 - i * 0.1) / 0.4) }));
      c.restore(); } });
  def('rating', { name: 'Rating display', cat: 'social', desc: 'Stars fill to a rating you enter yourself. Off for brands whose rules forbid ratings.', d: 3.5, ex: { value: '4.9', label: 'GUEST RATING' },
    fields: [['value', 'Rating (out of 5)', 'text', '', { req: 'rating', max: 4 }], ['label', 'Where it comes from', 'text', '', { max: 30 }], ['color', 'Star colour', 'col', '#F5B301']],
    box: () => [-360, -150, 720, 300],
    draw(L, s) { const c = ctx, val = parseFloat(str(L, 'value')), lab = str(L, 'label').toUpperCase(), a = 1 - E.inC(s.q);
      if (!starsAllowed()) { need('Star ratings are off in this brand kit', 0, 0, 30, { raw: true }); return; } if (!Number.isFinite(val)) { need('rating', 0, 0, 40); return; }
      const v0 = clamp(val, 0, 5), k = clamp((s.lt - 0.1) / 1.0); c.save(); c.globalAlpha *= a; tx((v0 * E.outC(clamp(k * 1.2))).toFixed(1), 0, -20, { size: 150, wt: 900, fam: famOf(L, 'Mont'), col: WHT, shadow: 'rgba(0,0,0,0.4)', a: clamp(s.p * 3) });
      stars(0, 60, 74, v0, s.c1, k); if (lab) tx(lab, 0, 150, { size: 28, wt: 700, fam: 'Mono', ls: 5, col: K8.rgba('white', 0.8), a: clamp((s.lt - 0.8) / 0.4) }); c.restore(); } });
  def('comment', { name: 'Comment reply', cat: 'social', desc: 'A comment bubble, for replying to a real comment on camera.', d: 4, ex: { name: 'sam.k', text: 'How long did the whole remodel take?' },
    fields: [['name', 'Commenter', 'text', '', { max: 24 }], ['text', 'Their comment (word for word)', 'area', '', { req: 'the comment', max: 120 }]],
    box: () => [-430, -150, 860, 300],
    draw(L, s) { const c = ctx, t = String(v(L, 'text') || '').trim(), nm = str(L, 'name'), k = E.outBack(clamp(s.p * 1.3)) * (1 - E.inC(s.q)), fs = 40, fam = famOf(L, 'Mont'); if (k <= 0) return;
      const words = t.split(/\s+/).filter(Boolean), rows = []; let cur = ''; for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (cur && tw(tr, 700, fs, fam, 0) > 700) { rows.push(cur); cur = w; } else cur = tr; } if (cur) rows.push(cur);
      const h = 100 + Math.max(1, rows.length) * fs * 1.25, w = Math.max(520, Math.min(820, Math.max(...rows.map(r => tw(r, 700, fs, fam, 0)), 300) + 80)); c.save(); c.translate(-w / 2, -h / 2); c.scale(k, k); c.translate(w / 2, h / 2);
      c.save(); c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 30; c.shadowOffsetY = 10; c.fillStyle = '#FFFFFF'; rr(-w / 2, -h / 2, w, h, 26); c.fill(); c.beginPath(); c.moveTo(-w / 2 + 60, h / 2 - 2); c.lineTo(-w / 2 + 40, h / 2 + 40); c.lineTo(-w / 2 + 110, h / 2 - 2); c.fill(); c.restore();
      c.fillStyle = OR; c.beginPath(); c.arc(-w / 2 + 52, -h / 2 + 46, 22, 0, TAU); c.fill(); tx('Reply to ' + (nm ? nm + '’s' : 'a') + ' comment', -w / 2 + 88, -h / 2 + 56, { size: 28, wt: 600, fam, col: 'rgba(0,0,0,0.55)', align: 'left' });
      if (!t) need('the comment', 0, 20, 32); else rows.forEach((r, i) => tx(r, -w / 2 + 40, -h / 2 + 118 + i * fs * 1.25, { size: fs, wt: 700, fam, col: '#111', align: 'left' })); c.restore(); } });
  def('follow', { name: 'Follow prompt', cat: 'social', desc: 'Your logo, your handle and a follow button that gets tapped.', d: 3.5, ex: { handle: '@yourbrand' },
    fields: [['handle', 'Handle', 'text', '', { req: 'handle', max: 30 }], ['color', 'Button colour', 'col', 'accent']],
    box: () => [-400, -80, 800, 160],
    draw(L, s) { const c = ctx, hd = str(L, 'handle'), k = E.outBack(clamp(s.p * 1.3)) * (1 - E.inC(s.q)), fam = famOf(L, 'Mont'); if (k <= 0) return; const tap = s.lt > 1.3, w = 780, h = 140; c.save(); c.scale(k, k);
      c.save(); c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 30; c.fillStyle = 'rgba(16,16,20,0.92)'; rr(-w / 2, -h / 2, w, h, h / 2); c.fill(); c.restore();
      c.save(); c.beginPath(); c.arc(-w / 2 + 70, 0, 50, 0, TAU); c.fillStyle = BLK; c.fill(); c.clip(); if (PV.on) { c.fillStyle = OR; c.fillRect(-w / 2 + 20, -50, 100, 100); } else if (IMG.logoW) { const [lw, lh] = logoBox(86); c.drawImage(IMG.logoW, -w / 2 + 70 - lw / 2, -lh / 2, lw, lh); } c.restore(); c.strokeStyle = OR; c.lineWidth = 4; c.beginPath(); c.arc(-w / 2 + 70, 0, 52, 0, TAU); c.stroke();
      if (!hd) need('handle', -40, 0, 30); else tx(hd, -w / 2 + 140, 14, { size: fitS(hd, 800, fam, 360, 42, 0), wt: 800, fam, col: WHT, align: 'left' });
      const bw = 250, bx = w / 2 - bw / 2 - 26, press = clamp((s.lt - 1.2) / 0.1) * (1 - clamp((s.lt - 1.3) / 0.15)); c.save(); c.translate(bx, 0); c.scale(1 - press * 0.08, 1 - press * 0.08); c.fillStyle = tap ? 'rgba(255,255,255,0.15)' : s.c1; rr(-bw / 2, -40, bw, 80, 40); c.fill();
      tx(tap ? 'Following' : 'Follow', tap ? 20 : 0, 12, { size: 34, wt: 800, fam, col: tap ? WHT : s.fg }); if (tap) icon('check', -bw / 2 + 32, 0, 28, WHT, { lw: 3 }); c.restore();
      const hk = E.outC(clamp((s.lt - 0.5) / 0.6)); if (s.lt > 0.5 && s.lt < 2.4) { c.save(); c.globalAlpha *= clamp((s.lt - 0.5) * 4) * (1 - clamp((s.lt - 2) / 0.4)); c.translate(lerp(bx + 220, bx + 30, hk), lerp(200, 50, hk) + press * 8); c.rotate(-0.3); icon('hand', 0, 30, 110, WHT); c.restore(); }
      c.restore(); } });
  def('handle', { name: 'Social handle', cat: 'social', desc: 'Your @handle on a clean pill.', d: 3, ex: { handle: '@yourbrand' },
    fields: [['handle', 'Handle', 'text', '', { req: 'handle', max: 30 }], ['color', 'Colour', 'col', 'accent']],
    box: L => { const w = Math.min(900, tw(str(L, 'handle') || '+ ADD HANDLE', 800, 50, 'Mont', 0) + 160); return [-w / 2, -60, w, 120]; },
    draw(L, s) { const c = ctx, hd = str(L, 'handle'), fam = famOf(L, 'Mont'); if (!hd) { need('handle', 0, 0, 36); return; } const fs = fitS(hd, 800, fam, 720, 50, 0), w = tw(hd, 800, fs, fam, 0) + 160, k = E.inOutC(clamp(s.p * 1.2)), out = E.inC(s.q);
      c.save(); c.globalAlpha *= 1 - out; c.beginPath(); c.rect(-w / 2 - 10, -70, (w + 20) * k, 140); c.clip(); c.fillStyle = 'rgba(14,14,18,0.9)'; rr(-w / 2, -54, w, 108, 54); c.fill(); c.fillStyle = s.c1; c.beginPath(); c.arc(-w / 2 + 54, 0, 38, 0, TAU); c.fill(); icon('at', -w / 2 + 54, 0, 44, s.fg, { lw: 2.4 });
      tx(hd, -w / 2 + 110, fs * 0.36, { size: fs, wt: 800, fam, col: WHT, align: 'left' }); c.restore(); } });
  def('swipe', { name: 'Swipe prompt', cat: 'social', desc: 'Chevrons pulse upward over a short prompt.', d: 3, ex: {},
    fields: [['text', 'Prompt', 'text', 'SWIPE UP', { max: 20 }], ['color', 'Colour', 'col', 'white']],
    box: () => [-220, -160, 440, 260],
    draw(L, s) { const c = ctx, a = env(s), t = str(L, 'text').toUpperCase(); c.save(); c.globalAlpha *= a; for (let i = 0; i < 3; i++) { const ph = lmod(s.lt * 1.4 - i * 0.18, 1); c.save(); c.globalAlpha *= Math.sin(Math.PI * ph); icon('chev', 0, -40 - i * 44 - ph * 30, 80, s.c1, { lw: 3 }); c.restore(); }
      if (t) tx(t, 0, 60, { size: 34, wt: 800, ls: 4, col: s.c1, shadow: 'rgba(0,0,0,0.5)' }); c.restore(); } });
  def('story', { name: 'Story progress', cat: 'social', desc: 'Segmented progress bars across the top, like stories.', d: 6, ex: {},
    fields: [['n', 'Segments', 'range', 4, [2, 10, 1]], ['color', 'Colour', 'col', 'white']],
    box: () => [-500, -10, 1000, 20],
    draw(L, s) { const c = ctx, n = Math.round(num(L, 'n', 4)), w = 1000, gap = 10, sw = (w - gap * (n - 1)) / n, per = s.d / n, a = clamp(s.p * 4) * (1 - E.inC(s.q)); c.save(); c.globalAlpha *= a;
      for (let i = 0; i < n; i++) { const x = -w / 2 + i * (sw + gap), f = clamp((s.lt - i * per) / per); c.fillStyle = 'rgba(255,255,255,0.35)'; rr(x, -4, sw, 8, 4); c.fill(); if (f > 0) { c.fillStyle = s.c1; rr(x, -4, sw * f, 8, 4); c.fill(); } } c.restore(); } });
  def('likes', { name: 'Like burst', cat: 'social', desc: 'Hearts float up and sway from one point.', d: 3, ex: {},
    fields: [['amount', 'Amount', 'range', 1, [0.3, 2.5, 0.1]], ['color', 'Colour', 'col', '#FF3B6B']],
    box: () => [-260, -900, 520, 980],
    draw(L, s) { const c = ctx, n = Math.round(16 * num(L, 'amount', 1)); c.save(); c.globalAlpha *= 1 - E.inC(s.q); for (let i = 0; i < n; i++) { const t0 = (i / n) * Math.max(0.5, s.d - 1.4), lt = s.lt - t0; if (lt < 0 || lt > 1.6) continue; const u = lt / 1.6, x = Math.sin(lt * 4 + i) * 60 * u + (hash(i) - 0.5) * 120 * u, y = -u * 800, sz = 60 + hash(i * 3) * 50;
      c.save(); c.translate(x, y); c.globalAlpha *= (1 - u) * clamp(lt * 8); const e = E.outBack(clamp(lt * 4)); c.scale(e, e); icon('heart', 0, 0, sz, i % 3 ? s.c1 : '#FFFFFF'); c.restore(); } c.restore(); } });
  def('tap', { name: 'Tap here', cat: 'social', desc: 'A finger taps the spot with a ripple, to point at a button or detail.', d: 3, ex: {},
    fields: [['color', 'Ripple colour', 'col', 'white']],
    box: () => [-120, -120, 240, 300],
    draw(L, s) { const c = ctx, a = clamp(s.p * 3) * (1 - E.inC(s.q)), ph = lmod(s.lt, 1.1) / 1.1, press = ph < 0.18 ? Math.sin(ph / 0.18 * Math.PI) : 0; c.save(); c.globalAlpha *= a;
      for (let i = 0; i < 2; i++) { const r = lmod(ph - i * 0.25, 1); c.strokeStyle = K8.rgba(s.c1, (1 - r) * 0.85); c.lineWidth = 6; c.beginPath(); c.arc(0, 0, 20 + r * 90, 0, TAU); c.stroke(); }
      c.fillStyle = K8.rgba(s.c1, 0.35 + press * 0.4); c.beginPath(); c.arc(0, 0, 26, 0, TAU); c.fill(); c.save(); c.translate(26, 92 - press * 14); c.rotate(-0.3); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 18; icon('hand', 0, 0, 150, '#FFFFFF'); c.restore(); c.restore(); } });

  // brand rules: DPG never shows prices, offers, sales, ratings or typed-in reviews (its reviews come word for word from the brand kit
  // through the classic Review quote); a brand that flags prices in its kit gets no price or discount graphics
  const DPG_OFF = ['price', 'pricetag', 'discount', 'burst', 'limited', 'rating', 'review'], PRICE_OFF = ['price', 'pricetag', 'discount'];
  function allowed(id) { if (PV.on) return true; if (dpg() && DPG_OFF.includes(id)) return false;
    const r = window.NX && NX.app && NX.app.B && NX.app.B().rules; if (r && r.prices === true && PRICE_OFF.includes(id)) return false; if (id === 'rating' && !starsAllowed()) return false; return true; }
  // ------------------------------------------------------------------ public
  function state(L, t, xs) {
    const e = EL[L.type], lt = t - L.t0, d = Math.max(0.3, +L.d || e.d), inD = e.inD || 0.55, outD = e.outD || 0.4;
    const s = { lt, d, t, p: clamp(lt / inD), q: clamp((lt - (d - outD)) / outD), c1: xs && xs.color ? xs.color : C(L.color || e.defs.color || 'accent'), c2: C(L.col2 || e.defs.col2 || 'ink') };
    s.fg = K8.onCol(s.c1); return s;
  }
  function draw(L, t, xs) { const e = EL[L.type]; if (!e || VID.collecting) return; if (!allowed(L.type)) { if (!e.full) need('Off for this brand (brand kit rules)', 0, 0, 30, { raw: true }); return; } const s = state(L, t, xs); ctx.save(); try { e.draw(L, s); } finally { ctx.restore(); } }
  function box(L) { const e = EL[L.type]; if (!e) return [-100, -100, 200, 200]; if (e.full) return [-(+L.x || 540), -(+L.y || 960), W, H]; return e.box(L); }
  // required fields still empty (the editor warns before export)
  function missing(L) { const e = EL[L.type]; if (!e) return []; if (L.type === 'counters') return ['bed', 'bath', 'area', 'car'].some(k => str(L, k)) ? [] : ['the numbers'];
    return e.fields.filter(f => f[4] && f[4].req && !str(L, f[0])).map(f => f[4].req); }
  function preview(id, t, dur) {   // library previews: the element with its sample values, centred
    const e = EL[id]; if (!e) return; const L = Object.assign({ kind: 'mg', type: id, x: 540, y: e.full ? 960 : (id === 'story' ? 120 : id === 'likes' ? 1500 : 960), t0: 0, d: dur }, e.ex);
    const s = K8.xf(L, t); PV.on = true;
    try { if (e.full) { ctx.save(); ctx.globalAlpha *= s.op; draw(L, t, s); ctx.restore(); } else K8.withLayer(s, box(L), () => draw(L, t, s)); } finally { PV.on = false; }
  }
  return { EL, ORDER, CATS, draw, box, missing, preview, parseNum, fmtNum, icon, need, tx, starsAllowed, allowed };
})();
