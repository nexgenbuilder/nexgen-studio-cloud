'use strict';
/* NexGen templates V15 (Nov 5): real estate, barbershop, neon and detailing pieces from the Remotion motion library.
   Real estate ones read the clip's listing (facts and photos, js/nx-listing.js): one listing feeds them all.
   ?v=relistx    Listing Card     the hero photo, a status ribbon, the price counts up, address, beds · baths · sq ft
   ?v=resignx    Yard Sign        the sign post rises on the lawn, the panel swings, the rider flips to your status
   ?v=blueprintx The Blueprint    your floor plan revealed on a blueprint grid with dimension lines and the size facts
   ?v=redoorx    Front Door       a front door with the house number opens, the camera walks in to the listing photo
   ?v=bbpolex    Barber Pole      a spinning barber pole; its stripes wipe across to your photo
   ?v=bbchairx   Chairs Open      2–4 barber chairs with names: open (with a time) or booked
   ?v=neonx      Neon Sign        a neon sign on brick flickers on, then the menu lines and prices, an OPEN sign blinks
   ?v=beadx      Ceramic Beading  rain on coated paint beads up, the panel tilts and the water rolls off
   Copy defaults follow the brand's industry; prices and times are sample text to replace. A lone dash (-) leaves an
   optional line off (an emptied field returns to its default in the studio). */
(() => {
  const P = (accent, ink, text, accent2, paper, deep1, deep2) => ({ accent, ink, text, accent2, paper, deep1, deep2 });
  Object.assign(K7.FAM, {
    relistx: { pal: P('#E8C47C', '#0D0F12', '#F6F3EC', '#C9A45C', '#F6F3EC', '#1A1D22', '#060708'), fonts: { sans: 'mont', serif: 'playfair', display: 'bodoni', script: 'greatvibes' }, music: 'lounge', bpm: 92 },
    resignx: { pal: P('#2563EB', '#0B1220', '#F5F7FA', '#F59E0B', '#F5F7FA', '#16233D', '#050A14'), fonts: { sans: 'mont', serif: 'lora', display: 'oswald', script: 'kalam' }, music: 'day', bpm: 104 },
    blueprintx: { pal: P('#7FD1FF', '#061A3A', '#EAF6FF', '#FFD166', '#EAF6FF', '#0B3D91', '#041B44'), fonts: { sans: 'mont', serif: 'fraunces', display: 'oswald', script: 'kalam' }, music: 'cinematic', bpm: 88 },
    redoorx: { pal: P('#D4A373', '#120E0B', '#FAF6F0', '#8FB996', '#FAF6F0', '#231C16', '#070504'), fonts: { sans: 'mont', serif: 'playfair', display: 'abril', script: 'greatvibes' }, music: 'lounge', bpm: 86 },
    bbpolex: { pal: P('#E63946', '#0B0D12', '#F5F6F8', '#1D4ED8', '#F5F6F8', '#171B24', '#05060A'), fonts: { sans: 'mont', serif: 'dmserif', display: 'anton', script: 'kaushan' }, music: 'pulse', bpm: 112 },
    bbchairx: { pal: P('#22C55E', '#0B0D10', '#F5F6F8', '#E63946', '#F5F6F8', '#1A1C22', '#060708'), fonts: { sans: 'mont', serif: 'dmserif', display: 'oswald', script: 'kaushan' }, music: 'day', bpm: 100 },
    neonx: { pal: P('#FF3EA5', '#0B0709', '#FFF4FA', '#3EE6FF', '#FFF4FA', '#1C0F14', '#050304'), fonts: { sans: 'mont', serif: 'dmserif', display: 'righteous', script: 'sacramento' }, music: 'night', bpm: 100 },
    beadx: { pal: P('#5CE1E6', '#06090D', '#F2F7FA', '#A7F3D0', '#F2F7FA', '#101820', '#030507'), fonts: { sans: 'mont', serif: 'lora', display: 'oswald', script: 'kalam' }, music: 'cinematic', bpm: 90 },
  });
})();

STUDIO_REG['nx5'] = (() => {
  const V = QS.get('v') || 'relistx';
  const FM = K7.FAM[V] || K7.FAM.relistx;
  if (!window.STUDIO) setBrandColors(FM.pal);
  const G = K3.G, D = K3.D, seg = K7.seg, TAU = Math.PI * 2, mix = K7.mix;
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const IND = BRAND.cat || BRAND.industry || 'general';
  const FOOD = ['restaurant', 'pizza', 'burgers', 'tacos', 'mexican', 'italian', 'sandwiches'];
  const NONE = k => ['nofoot.' + k, 0];
  const opts = list => list.map(([value, label]) => ({ value, label }));
  const shot = (k, label, d, ph, def) => { const s = SHOT(k, def || NONE(k), { label, group: 'Footage', kind: 'any', ph, d: d + 0.3 }); return { c: s[0], in: s[1], d, start: 0 }; };
  const lshot = (k, label, d, i) => shot(k, label, d, undefined, PRM.photos && PRM.photos[i] ? [PRM.photos[i], 0] : undefined);   // listing photos fill slots in order
  const fa = (t, t0, d) => E.outC(seg(t, t0, d || 0.5));
  const musicBed = dur => ['music', 0, dur, 0.95, { style: FM.music, bpm: FM.bpm, key: 0, end: dur - 0.6 }];
  const lum = h => { const v = [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16) / 255); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const onCol = h => (/^#[0-9a-f]{6}$/i.test(h) && lum(h) > 0.45 ? '#0B0B0B' : '#FFFFFF');
  const rich = (s, col, hl) => String(s || '').split(/(\*[^*]+\*)/).filter(Boolean).map(p => (p[0] === '*' ? [p.slice(1, -1), hl || OR] : [p, col || WHT]));
  const plain = s => String(s || '').replace(/\*/g, '');
  const off = s => (/^[-–—]$/.test(String(s || '').trim()) ? '' : s);
  const DASH = 'Type a dash (-) to leave it off.';
  const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
  const ph = (s, t, r, o) => { const w = K3.wholeIn(s.c, r); K3.clip(s.c, s.in, Math.max(0, t - (s.start || 0)), w, o); return w; };
  function within(path, fn) { ctx.save(); if (!VID.collecting && path) { ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); ctx.beginPath(); path(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clip(); } fn(); ctx.restore(); }
  function card(r, rad, a, col) { if (VID.collecting || a <= 0) return; const c = G(); c.globalAlpha = a; c.fillStyle = col || DEEP1; c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 60; c.shadowOffsetY = 24; c.beginPath(); c.roundRect(r[0], r[1], r[2], r[3], rad); c.fill(); D(); }
  const bg = (a, b) => { if (VID.collecting) return; const c = G(), g = c.createRadialGradient(W / 2, H * 0.42, 60, W / 2, H * 0.45, H * 0.85); g.addColorStop(0, a || DEEP1); g.addColorStop(1, b || DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); };
  function chip(str, x, y, o) {
    o = o || {}; const _cp = posOf(elP(o.el || ''), [x, y]); x = _cp[0]; y = _cp[1]; const p = o.p === undefined ? 1 : o.p; if (p <= 0 || VID.collecting || !str) return 0;
    const size = o.size || 30, f = F(o.w || 800, size, o.fam || 'Mont'), tw = textW(str, f, o.ls || 0), pw = tw + size * 1.2, phh = size * 1.9;
    const ax = o.align === 'right' ? pw : o.align === 'left' ? 0 : pw / 2, s = lerp(0.6, 1, E.outBack(clamp(p)));
    const c = G(); c.globalAlpha = clamp(p * 3) * (o.a === undefined ? 1 : o.a); c.translate(x, y); c.scale(s, s); c.translate(-ax, 0);
    c.fillStyle = o.bg || 'rgba(8,10,14,0.82)'; c.beginPath(); c.roundRect(0, -phh / 2, pw, phh, phh / 2); c.fill();
    if (o.border) { c.strokeStyle = o.border; c.lineWidth = 2.5; c.stroke(); }
    setF(f, o.ls || 0); c.fillStyle = o.col || WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(str, pw / 2, size * 0.05); D(); return pw;
  }
  function close(t, OUT, o) {
    o = o || {}; const ot = t - OUT, y = o.y || 620, [lw, lh] = logoBox(o.lw || 600), lp = seg(ot, 0.2, 0.5);
    if (lp > 0 && !VID.collecting) { const c = G(), s = lerp(1.12, 1, E.outBack(clamp(lp))); c.globalAlpha = clamp(lp * 2.5); c.translate(W / 2, y); c.scale(s, s); c.drawImage(IMG.logoW, -lw / 2, -lh / 2, lw, lh); D(); }
    const [enx, eny] = posOf(elP('end'), [W / 2, y + lh / 2 + 150]);
    if (o.line) { const f = F(800, Math.min(70, fitSize(plain(o.line), 800, 900, 70, 'Mont', -1)), 'Mont'); T(rich(o.line, WHT, o.hl), enx, eny, f, { align: 'center', p: seg(ot, 0.7, 0.5), ls: -1 }); }
    const cy = y + lh / 2 + (o.gap || 320), cp = seg(ot, 1.3, 0.4), cta = o.cta || CONTACT.cta;
    const [ct2x, cty] = posOf(elP('cta'), [W / 2, cy]);
    if (cp > 0 && !VID.collecting) { const f = F(800, Math.min(34, fitSize(cta, 800, 740, 34, 'Mont', 5)), 'Mont'), tw = textW(cta, f, 5), bw = Math.min(960, tw + 100), c = G(); c.globalAlpha = E.outC(cp);
      c.fillStyle = OR; c.beginPath(); c.roundRect(ct2x - bw / 2, cty - 46, bw, 92, 46); c.fill(); setF(f, 5); c.fillStyle = onCol(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(cta, ct2x, cty + 2); D(); }
    K7.txt((o.contact || K7.contact()).join('   ·   '), W / 2, cty + 125, F(700, 28, 'Mont'), WA(0.8), { align: 'center', a: fa(ot, 1.8, 0.4), ls: 3 });
    if (CONTACT.lic) K7.txt(CONTACT.lic, W / 2, cty + 180, F(600, 22, 'Mont'), WA(0.6), { align: 'center', a: fa(ot, 1.9, 0.4), ls: 3 });
  }
  // closing end-line + CTA descriptors (shared by every format in this file)
  const closeEls = (OUT, DUR, line) => {
    const _lb = logoBox(600) || [600, 240], ELH = (_lb[1] && isFinite(_lb[1])) ? _lb[1] : 240;
    const enP = posOf(elP('end'), [540, 620 + ELH / 2 + 150]), ctP = posOf(elP('cta'), [540, 620 + ELH / 2 + 320]);
    return [
      { id: 'end', kind: 'pos', label: plain(line) || 'Closing line', x: enP[0], y: enP[1], t0: OUT + 0.7, d: DUR - (OUT + 0.7), box: [enP[0] - 470, enP[1] - 50, 940, 110], dup: false, del: false },
      { id: 'cta', kind: 'pos', label: CONTACT.cta, x: ctP[0], y: ctP[1], t0: OUT + 1.3, d: DUR - (OUT + 1.3), box: [ctP[0] - 400, ctP[1] - 45, 800, 90], dup: false, del: false },
    ];
  };
  const closeCues = (ev, OUT) => { ev.push(['swell', OUT - 0.45, 0.25, 0], ['whoosh', OUT, 0.3, 0], ['pop', OUT + 0.45, 0.3, 0], ['chime', OUT + 1.3, 0.28, 0], ['tink', OUT + 1.9, 0.18, 0.3]); };
  const head = (str, t, t0, y, o) => { if (!str) return; o = o || {}; const [hx, hy] = posOf(elP(o.el || ''), [o.x || W / 2, y]); const f = F(o.w || 900, Math.min(o.max || 96, fitSize(plain(str), o.w || 900, o.maxW || 940, o.max || 96, o.fam || 'Mont', -2)), o.fam || 'Mont'); T(rich(str, o.col, o.hl), hx, hy, f, { align: o.align || 'center', ls: -2, p: seg(t, t0, 0.45), q: o.q || 0 }); };
  const ret = (dur, ev, OUT) => { closeCues(ev, OUT); return { dur, beds: [musicBed(dur)], events: ev }; };
  const fontOf = key => (window.NX && NX.fontFamily && NX.fontFamily(key)) || 'Hand';
  const wtOf = key => Math.max(...(((window.NX && NX.FONTLIB && NX.FONTLIB[key]) || { n: [700] }).n));
  // ---- listing facts (real estate): read from the clip's listing; a sample listing outside the studio
  const fact = (k, req) => { const f = K7.PROFILE.find(x => x.k === k) || { label: k, group: 'Property' }; const v = PROP(k, { label: f.label, group: f.group, req: !!req, multiline: !!f.multiline }); return PRM.prop ? v : String(K7.DEMO[k] || ''); };
  const digits = s => String(s || '').replace(/[,\s$]/g, '');
  // a number that counts up (digits only); typed text appears as typed
  const countStr = (s, u) => { const m = String(s || '').trim().match(/^(\$?)(\d[\d,]*(?:\.\d+)?)(.*)$/); if (!m) return s; const n = Number(m[2].replace(/,/g, '')), dec = u >= 1 ? (m[2].split('.')[1] || '').length : 0; return m[1] + (n * clamp(u)).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + m[3]; };
  const agentContact = () => { const ph = fact('agent_phone'), url = fact('url'); const c = K7.contact(); return [ph || CONTACT.phone, url || CONTACT.web].filter(Boolean).length ? [ph || CONTACT.phone, url || CONTACT.web].filter(Boolean) : c; };
  // line icons (stroke, 60 px box centred on 0,0)
  function icon(c, kind) {
    c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
    if (kind === 'beds') { c.moveTo(-26, 18); c.lineTo(-26, -14); c.moveTo(-26, 4); c.lineTo(26, 4); c.lineTo(26, 18); c.moveTo(-26, 4); c.lineTo(-26, -2); c.rect(-18, -10, 16, 10); c.moveTo(0, -4); c.lineTo(26, -4); c.lineTo(26, 4); }
    else if (kind === 'baths') { c.moveTo(-28, 0); c.lineTo(28, 0); c.moveTo(-24, 0); c.quadraticCurveTo(-22, 18, 0, 18); c.quadraticCurveTo(22, 18, 24, 0); c.moveTo(-14, 18); c.lineTo(-18, 26); c.moveTo(14, 18); c.lineTo(18, 26); c.moveTo(-20, 0); c.lineTo(-20, -20); c.quadraticCurveTo(-20, -26, -12, -26); c.lineTo(-8, -26); }
    else { c.moveTo(-24, -10); c.lineTo(-24, -24); c.lineTo(-10, -24); c.moveTo(24, 10); c.lineTo(24, 24); c.lineTo(10, 24); c.moveTo(-24, -24); c.lineTo(24, 24); c.moveTo(10, -24); c.lineTo(24, -24); c.lineTo(24, -10); c.moveTo(-24, 10); c.lineTo(-24, 24); c.lineTo(-10, 24); }
    c.stroke();
  }
  // a row of facts (beds, baths, sq ft) with icons, counting up from t0
  function factsRow(t, t0, y, a, list, cx) {
    if (!list.length || VID.collecting) return; const w = Math.min(320, 960 / list.length), x0 = (cx || W / 2) - (w * list.length) / 2;
    list.forEach((f, i) => { const p = seg(t, t0 + i * 0.18, 0.6); if (p <= 0) return; const c = G(), cx = x0 + w * (i + 0.5); c.globalAlpha = a * clamp(p * 3);
      c.save(); c.translate(cx, y - 70); c.strokeStyle = OR; icon(c, f.k); c.restore();
      const n = f.k === 'sqft' ? countStr(f.n, E.outC(p)) : f.n; setF(F(900, Math.min(54, fitSize(n, 900, w - 30, 54, 'Mont', -1)), 'Mont'), -1); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(n, cx, y + 6);
      setF(F(700, 22, 'Mono'), 4); c.fillStyle = WA(0.6); c.fillText(f.u, cx, y + 42); if (i) { c.fillStyle = WA(0.15); c.fillRect(x0 + w * i - 1, y - 100, 2, 150); } D(); });
  }

  // ================================================================ LISTING CARD
  const STATUS = [['auto', 'From the listing (for sale / for rent)'], ['JUST LISTED', 'Just listed'], ['NEW PRICE', 'New price'], ['OPEN HOUSE', 'Open house'], ['COMING SOON', 'Coming soon'], ['UNDER CONTRACT', 'Under contract'], ['SOLD', 'Sold'], ['JUST LEASED', 'Just leased']];
  function relistx() {
    const ADDR = fact('addr', true), AREA = fact('area'), PRICE = fact('price', true), DEAL = fact('deal'), FT = K7.facts({ beds: fact('beds'), baths: fact('baths'), sqft: fact('sqft') }), FEAT = K7.lines(fact('feat')).slice(0, 2);
    const ST0 = TX('status', 'JUST LISTED', { label: 'Ribbon', group: 'Words', options: opts(STATUS) }), STAT = ST0 === 'auto' ? (DEAL === 'rent' ? 'FOR RENT' : 'FOR SALE') : ST0;
    const END = TX('end', 'Your *private tour* awaits.', { label: 'Closing line', group: 'Ending', max: 30 });
    const S = lshot('s1', 'Hero photo (listing photo 1)', 7, 0), BOX = [90, 290, 900, 640], OUT = 6.6, DUR = OUT + 4.2, PR = K7.money(PRICE, DEAL);
    function elements() {
      const r = K3.wholeIn(S.c, BOX), py = r[1] + r[3] + 140;
      const els = [
        { id: 'photo', kind: 'box', label: 'Hero photo', x: BOX[0], y: BOX[1], w: BOX[2], h: BOX[3], t0: 0.1, d: OUT - 0.1, box: [BOX[0], BOX[1], BOX[2], BOX[3]], dup: false, del: false },
      ];
      FEAT.forEach((f, i) => { const fy = r[1] + r[3] - 48 - (FEAT.length - 1 - i) * 66, fp = posOf(elP('feat' + (i + 1)), [r[0] + 24, fy]); els.push({ id: 'feat' + (i + 1), kind: 'pos', label: f, x: fp[0], y: fp[1], t0: 3.0 + i * 0.2, d: OUT - (3.0 + i * 0.2), box: [fp[0], fp[1] - 30, 760, 60], dup: false, del: false }); });
      if (PR) { const pp = posOf(elP('price'), [540, py]); els.push({ id: 'price', kind: 'pos', label: PR, x: pp[0], y: pp[1], t0: 0.9, d: OUT - 0.9, box: [pp[0] - 470, pp[1] - 90, 940, 130], dup: false, del: false }); }
      if (ADDR) { const ap = posOf(elP('addr'), [540, py + 70]); els.push({ id: 'addr', kind: 'pos', label: ADDR, x: ap[0], y: ap[1], t0: 1.6, d: OUT - 1.6, box: [ap[0] - 470, ap[1] - 30, 940, 60], dup: false, del: false }); }
      if (AREA) { const rp = posOf(elP('area'), [540, py + 120]); els.push({ id: 'area', kind: 'pos', label: AREA.toUpperCase(), x: rp[0], y: rp[1], t0: 1.9, d: OUT - 1.9, box: [rp[0] - 470, rp[1] - 25, 940, 50], dup: false, del: false }); }
      if (FT.length) { const fx = posOf(elP('facts'), [540, py + 290]); els.push({ id: 'facts', kind: 'box', label: FT.map(f => f.n + ' ' + f.u).join(' · '), x: fx[0], y: fx[1], w: 960, h: 200, t0: 2.2, d: OUT - 2.2, box: [fx[0] - 480, fx[1] - 110, 960, 200], dup: false, del: false }); }
      return els.concat(closeEls(OUT, DUR, END));
    }
    return {
      dur: DUR, shakes: [[1.8, 5]], elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = fa(t, 0.1, 0.5) * (1 - q), [bx, by] = posOf(elP('photo'), [BOX[0], BOX[1]]), r = K3.wholeIn(S.c, [bx, by, BOX[2], BOX[3]]), dy = (1 - E.outC(seg(t, 0.1, 0.7))) * 80;
          card([r[0], r[1] + dy, r[2], r[3]], 28, a); within(() => ctx.roundRect(r[0], r[1] + dy, r[2], r[3], 28), () => ph(S, t, BOX, { alpha: a, dy }));
          const rp = E.outBack(seg(t, 0.6, 0.45)) * (1 - q); if (rp > 0 && !VID.collecting) within(() => ctx.roundRect(r[0], r[1] + dy, r[2], r[3], 28), () => { const c = G(), f = F(900, 30, 'Mont'); c.globalAlpha = clamp(rp * 3); c.translate(r[0] + 110, r[1] + dy + 110); c.rotate(-Math.PI / 4); c.scale(rp, 1); c.fillStyle = OR; c.fillRect(-260, -32, 520, 64); setF(f, 4); c.fillStyle = onCol(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(STAT, 0, 2); D(); });
          FEAT.forEach((f, i) => chip(f, r[0] + 24, r[1] + dy + r[3] - 48 - (FEAT.length - 1 - i) * 66, { p: seg(t, 3.0 + i * 0.2, 0.4) * (1 - q), size: 26, align: 'left', el: 'feat' + (i + 1) }));
          const py = r[1] + r[3] + 140, pp = seg(t, 0.9, 0.9);
          if (PR) { const s = countStr(PR, E.outC(pp)); if (pp > 0) { const [prx, pry] = posOf(elP('price'), [W / 2, py]); T([[s, WHT]], prx, pry, F(900, Math.min(118, fitSize(PR, 900, 940, 118, 'Mont', -3)), 'Mont'), { align: 'center', ls: -3, p: seg(t, 0.9, 0.3), q }); } }
          else if (!VID.collecting) K7.need('Price', W / 2, py - 30, 34, { align: 'center', a: a });
          if (ADDR) { const [adx, ady] = posOf(elP('addr'), [W / 2, py + 70]); T([[ADDR, WHT]], adx, ady, F(700, Math.min(44, fitSize(ADDR, 700, 940, 44, 'Mont')), 'Mont'), { align: 'center', p: seg(t, 1.6, 0.5), q }); }
          else if (!VID.collecting) K7.need('Street address', W / 2, py + 50, 28, { align: 'center', a: a });
          if (AREA) { const [arx, ary] = posOf(elP('area'), [W / 2, py + 120]); K7.txt(AREA.toUpperCase(), arx, ary, F(700, 26, 'Mono'), OR, { align: 'center', a: fa(t, 1.9, 0.4) * (1 - q), ls: 6 }); }
          { const [fx, fy] = posOf(elP('facts'), [W / 2, py + 290]); factsRow(t, 2.2, fy, 1 - q, FT, fx); }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END, contact: agentContact() });
      },
      cues() { const ev = [['whoosh', 0.1, 0.3, 0], ['swish', 0.6, 0.25, -0.3], ['stamp', 0.75, 0.25, -0.3], ['ticks', 0.9, 0.18, 0, { dur: 0.9, n: 12 }], ['impact', 1.8, 0.3, 0], ['typing', 1.6, 0.15, 0.2], ['pop', 2.2, 0.22, -0.3], ['pop', 2.4, 0.22, 0], ['pop', 2.6, 0.22, 0.3], ['pop', 3.0, 0.18, -0.2], ['pop', 3.2, 0.18, -0.2]]; return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ YARD SIGN
  function resignx() {
    const ADDR = fact('addr', true), AREA = fact('area'), PRICE = fact('price'), DEAL = fact('deal');
    const RIDER = TX('rider', 'JUST LISTED', { label: 'Rider on top of the sign', group: 'Words', options: opts(STATUS.slice(1).concat([['OPEN SUNDAY', 'Open Sunday']])) });
    const PANEL = TX('panel', DEAL === 'rent' ? 'FOR RENT' : 'FOR SALE', { label: 'Sign panel', group: 'Words', upper: true, max: 12 });
    const END = TX('end', 'Let’s get you *moving.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const S = lshot('s1', 'The house (listing photo 1)', 7, 0), BOX = [90, 290, 900, 560], RT = 2.0, OUT = 6.6, DUR = OUT + 4.2, PX = 170, ARMY = 905, ARMX = 610, PY0 = 935;
    const phone = fact('agent_phone') || CONTACT.phone;
    function elements() {
      const els = [
        { id: 'photo', kind: 'box', label: 'House photo', x: BOX[0], y: BOX[1], w: BOX[2], h: BOX[3], t0: 0.05, d: OUT - 0.05, box: [BOX[0], BOX[1], BOX[2], BOX[3]], dup: false, del: false },
      ];
      if (ADDR) { const ap = posOf(elP('addr'), [630, 1150]); els.push({ id: 'addr', kind: 'pos', label: ADDR, x: ap[0], y: ap[1], t0: 2.4, d: OUT - 2.4, box: [ap[0], ap[1] - 30, 400, 60], dup: false, del: false }); }
      if (AREA) { const rp = posOf(elP('area'), [630, 1195]); els.push({ id: 'area', kind: 'pos', label: AREA.toUpperCase(), x: rp[0], y: rp[1], t0: 2.6, d: OUT - 2.6, box: [rp[0], rp[1] - 25, 400, 50], dup: false, del: false }); }
      if (PRICE) { const pp = posOf(elP('price'), [630, 1300]); els.push({ id: 'price', kind: 'pos', label: K7.money(PRICE, DEAL), x: pp[0], y: pp[1], t0: 2.8, d: OUT - 2.8, box: [pp[0], pp[1] - 60, 400, 110], dup: false, del: false }); }
      return els.concat(closeEls(OUT, DUR, END));
    }
    return {
      dur: DUR, shakes: [[RT, 7]], elements,
      render(t) {
        if (!VID.collecting) { const c = G(), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#7FB7E6'); g.addColorStop(0.55, '#CFE6F5'); g.addColorStop(0.56, '#5E9E45'); g.addColorStop(1, '#2F5E25'); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40);
          c.strokeStyle = 'rgba(40,90,30,0.7)'; c.lineWidth = 3; for (let x = -10; x < W + 10; x += 9) { const h = 14 + hash(x) * 22; c.beginPath(); c.moveTo(x, 1058); c.lineTo(x + 4 - hash(x * 3) * 8, 1058 - h); c.stroke(); } D(); }
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = fa(t, 0.05, 0.5) * (1 - q), [bx, by] = posOf(elP('photo'), [BOX[0], BOX[1]]), PB = [bx, by, BOX[2], BOX[3]], r = K3.wholeIn(S.c, PB);
          if (!VID.collecting) { const c = G(); c.globalAlpha = a; c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 40; c.shadowOffsetY = 14; c.fillStyle = '#FFFFFF'; c.fillRect(r[0] - 14, r[1] - 14, r[2] + 28, r[3] + 28); D(); }
          ph(S, t, PB, { alpha: a });
          if (!VID.collecting) { const rise = E.outBack(seg(t, 0.2, 0.5)), oy = (1 - rise) * 700, c = G(); c.globalAlpha = 1 - q; c.translate(0, oy);
            c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(PX + 10, 1300, 70, 14, 0, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.fillRect(PX - 14, ARMY - 30, 28, 1330 - ARMY); c.fillRect(PX - 14, ARMY - 14, ARMX - PX + 40, 26); c.fillStyle = '#E5E7EB'; c.fillRect(PX + 4, ARMY - 30, 10, 1330 - ARMY);
            c.beginPath(); c.arc(PX, ARMY - 34, 18, 0, TAU); c.fillStyle = '#FFFFFF'; c.fill();
            // the rider on top of the arm flips in
            const rp = seg(t, RT, 0.35); if (rp > 0) { const f = F(900, Math.min(40, fitSize(RIDER, 900, 360, 40, 'Mont', 2)), 'Mont'); c.save(); c.translate(PX + 60 + 200, ARMY - 50); c.scale(1, Math.abs(Math.cos((1 - E.outBack(rp)) * Math.PI / 2))); c.fillStyle = '#D62828'; c.fillRect(-200, -34, 400, 68); c.strokeStyle = '#FFFFFF'; c.lineWidth = 4; c.strokeRect(-192, -26, 384, 52); setF(f, 2); c.fillStyle = '#FFFFFF'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(RIDER, 0, 2); c.restore(); }
            // the panel hangs from the arm and swings
            const lt = t - 0.6, sw = lt < 0 ? 0.6 : 0.35 * Math.cos(lt * 5) * Math.exp(-lt * 1.6) + (t > RT ? 0.05 * Math.sin((t - RT) * 9) * Math.exp(-(t - RT) * 3) : 0), PW = 380, PH = 270, hx = PX + 70 + PW / 2;
            c.save(); c.translate(hx, ARMY + 12); c.rotate(sw); c.strokeStyle = '#9CA3AF'; c.lineWidth = 3; c.beginPath(); c.moveTo(-PW / 2 + 40, 0); c.lineTo(-PW / 2 + 40, PY0 - ARMY - 12); c.moveTo(PW / 2 - 40, 0); c.lineTo(PW / 2 - 40, PY0 - ARMY - 12); c.stroke();
            c.translate(0, PY0 - ARMY - 12); c.shadowColor = 'rgba(0,0,0,0.3)'; c.shadowBlur = 20; c.shadowOffsetY = 8; c.fillStyle = '#FFFFFF'; c.fillRect(-PW / 2, 0, PW, PH); c.shadowBlur = 0; c.shadowOffsetY = 0; c.strokeStyle = OR; c.lineWidth = 8; c.strokeRect(-PW / 2 + 4, 4, PW - 8, PH - 8);
            const [lw0, lh0] = logoBox(260), ks = Math.min(1, 100 / lh0), lw = lw0 * ks, lh = lh0 * ks; if (IMG.logoB) c.drawImage(IMG.logoB, -lw / 2, 22 + (100 - lh) / 2, lw, lh); c.fillStyle = OR; c.fillRect(-PW / 2 + 4, 140, PW - 8, 70);
            setF(F(900, Math.min(48, fitSize(PANEL, 900, PW - 60, 48, 'Mont', 3)), 'Mont'), 3); c.fillStyle = onCol(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(PANEL, 0, 177); if (phone) { setF(F(800, 30, 'Mont'), 1); c.fillStyle = '#111827'; c.fillText(phone, 0, 240); }
            c.restore(); D(); }
          const tx = 630, tp = 2.4;
          if (ADDR) { const [adx, ady] = posOf(elP('addr'), [tx, 1150]); T([[ADDR, WHT]], adx, ady, F(800, Math.min(40, fitSize(ADDR, 800, 400, 40, 'Mont')), 'Mont'), { p: seg(t, tp, 0.45), q, shadow: ['rgba(0,0,0,0.5)', 12, 2] }); }
          else if (!VID.collecting) K7.need('Street address', tx, 1140, 22, { a });
          if (AREA) { const [arx, ary] = posOf(elP('area'), [tx, 1195]); K7.txt(AREA.toUpperCase(), arx, ary, F(700, 22, 'Mono'), '#FFFFFF', { a: fa(t, tp + 0.2, 0.4) * (1 - q), ls: 4 }); }
          if (PRICE) { const [prx, pry] = posOf(elP('price'), [tx, 1300]); T([[K7.moneyShort(PRICE, DEAL), WHT]], prx, pry, F(900, 76, 'Mont'), { p: seg(t, tp + 0.4, 0.45), q, ls: -2, shadow: ['rgba(0,0,0,0.5)', 16, 3] }); }
        }
        if (t >= OUT) { bg(); close(t, OUT, { y: 620, line: END, contact: agentContact() }); }
      },
      cues() { const ev = [['whoosh', 0.05, 0.22, 0], ['thud', 0.55, 0.35, -0.3], ['clack', 0.62, 0.25, -0.2], ['swish', 0.9, 0.12, -0.2], ['swish', RT - 0.05, 0.25, -0.2], ['stamp', RT + 0.2, 0.45, -0.2], ['impact', RT + 0.2, 0.25, 0], ['pop', 2.4, 0.22, 0.3], ['pop', 2.8, 0.25, 0.3]]; return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ THE BLUEPRINT
  function blueprintx() {
    const FT = K7.facts({ beds: fact('beds'), baths: fact('baths'), sqft: fact('sqft') }), ADDR = fact('addr');
    const TITLE = TX('title', 'The *layout.*', { label: 'Headline', group: 'Words', max: 26, hint: 'Wrap a word in *stars* to colour it.' });
    const DIM = off(TX('dim', '', { label: 'Dimension label (optional)', group: 'Words', max: 14, hint: 'e.g. 62 FT. Shown on the measuring line.' }));
    const END = TX('end', 'Room for *everything.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const S = shot('plan', 'Floor plan image', 7), BOX = [120, 430, 840, 640], SC0 = 0.6, SC1 = 2.0, OUT = 6.6, DUR = OUT + 4.2;
    function elements() {
      const r = K3.wholeIn(S.c, BOX);
      const tiP = posOf(elP('title'), [540, 330]);
      const els = [
        { id: 'title', kind: 'pos', label: plain(TITLE), x: tiP[0], y: tiP[1], t0: 0.1, d: OUT - 0.1, box: [tiP[0] - 470, tiP[1] - 60, 940, 120], dup: false, del: false },
        { id: 'plan', kind: 'box', label: 'Floor plan', x: BOX[0], y: BOX[1], w: BOX[2], h: BOX[3], t0: 0.2, d: OUT - 0.2, box: [BOX[0], BOX[1], BOX[2], BOX[3]], dup: false, del: false },
      ];
      if (DIM) { const dp = posOf(elP('dim'), [540, r[1] - 49]); els.push({ id: 'dim', kind: 'pos', label: DIM, x: dp[0], y: dp[1], t0: SC1, d: OUT - SC1, box: [dp[0] - 200, dp[1] - 20, 400, 40], dup: false, del: false }); }
      if (FT.length) { const fx = posOf(elP('facts'), [540, r[1] + r[3] + 210]); els.push({ id: 'facts', kind: 'box', label: FT.map(f => f.n + ' ' + f.u).join(' · '), x: fx[0], y: fx[1], w: 960, h: 200, t0: SC1 + 0.4, d: OUT - (SC1 + 0.4), box: [fx[0] - 480, fx[1] - 110, 960, 200], dup: false, del: false }); }
      if (ADDR) { const ap = posOf(elP('addr'), [540, r[1] + r[3] + 320]); els.push({ id: 'addr', kind: 'pos', label: ADDR.toUpperCase(), x: ap[0], y: ap[1], t0: SC1 + 1.0, d: OUT - (SC1 + 1.0), box: [ap[0] - 470, ap[1] - 25, 940, 50], dup: false, del: false }); }
      return els.concat(closeEls(OUT, DUR, END));
    }
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        if (!VID.collecting) { const c = G(), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, DEEP1); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40);
          for (let x = 0; x <= W; x += 40) { c.fillStyle = x % 200 === 0 ? 'rgba(160,210,255,0.16)' : 'rgba(160,210,255,0.06)'; c.fillRect(x, 0, x % 200 === 0 ? 2 : 1, H); }
          for (let y = 0; y <= H; y += 40) { c.fillStyle = y % 200 === 0 ? 'rgba(160,210,255,0.16)' : 'rgba(160,210,255,0.06)'; c.fillRect(0, y, W, y % 200 === 0 ? 2 : 1); } D(); }
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = fa(t, 0.2, 0.4) * (1 - q), [bx, by] = posOf(elP('plan'), [BOX[0], BOX[1]]), PB = [bx, by, BOX[2], BOX[3]], r = K3.wholeIn(S.c, PB), sc = E.inOutS(seg(t, SC0, SC1 - SC0)), yl = r[1] + r[3] * sc;
          head(TITLE, t, 0.1, 330, { q, max: 96, el: 'title' });
          if (!VID.collecting) { const c = G(); c.globalAlpha = a; c.strokeStyle = 'rgba(234,246,255,0.5)'; c.lineWidth = 2; c.setLineDash([10, 8]); c.strokeRect(r[0] - 20, r[1] - 20, r[2] + 40, r[3] + 40); c.setLineDash([]); D(); }
          within(() => ctx.rect(r[0] - 4, r[1] - 4, r[2] + 8, (r[3] + 8) * sc), () => { if (!VID.collecting) { const c = G(); c.globalAlpha = a; c.fillStyle = '#FFFFFF'; c.fillRect(r[0], r[1], r[2], r[3]); D(); } ph(S, t, PB, { alpha: a }); });
          if (sc > 0 && sc < 1 && !VID.collecting) { const c = G(), g = c.createLinearGradient(0, yl - 60, 0, yl + 4); g.addColorStop(0, 'rgba(127,209,255,0)'); g.addColorStop(1, 'rgba(127,209,255,0.5)'); c.fillStyle = g; c.fillRect(r[0] - 30, yl - 60, r[2] + 60, 64); c.fillStyle = OR; c.shadowColor = OR; c.shadowBlur = 20; c.fillRect(r[0] - 30, yl - 2, r[2] + 60, 4); D(); }
          // dimension lines along the top and left edges
          const dl = E.outC(seg(t, SC1, 0.6)); if (dl > 0 && !VID.collecting) { const c = G(); c.globalAlpha = (1 - q); c.strokeStyle = OR; c.fillStyle = OR; c.lineWidth = 3; const yT = r[1] - 50, xL = r[0] - 50;
            c.beginPath(); c.moveTo(r[0], yT); c.lineTo(r[0] + r[2] * dl, yT); c.moveTo(r[0], yT - 14); c.lineTo(r[0], yT + 14); if (dl > 0.98) { c.moveTo(r[0] + r[2], yT - 14); c.lineTo(r[0] + r[2], yT + 14); } c.moveTo(xL, r[1]); c.lineTo(xL, r[1] + r[3] * dl); c.moveTo(xL - 14, r[1]); c.lineTo(xL + 14, r[1]); c.stroke();
            if (DIM) { const [dmx, dmy] = posOf(elP('dim'), [W / 2, yT + 1]); setF(F(700, 24, 'Mono'), 3); const tw = textW(DIM, F(700, 24, 'Mono'), 3); c.fillStyle = DEEP1; c.fillRect(dmx - tw / 2 - 14, dmy - 17, tw + 28, 32); c.fillStyle = OR; c.textAlign = 'center'; c.textBaseline = 'middle'; c.globalAlpha = (1 - q) * dl; c.fillText(DIM, dmx, dmy); } D(); }
          { const [fx, fy] = posOf(elP('facts'), [W / 2, r[1] + r[3] + 210]); factsRow(t, SC1 + 0.4, fy, 1 - q, FT, fx); }
          if (ADDR) { const [adx, ady] = posOf(elP('addr'), [W / 2, r[1] + r[3] + 320]); K7.txt(ADDR.toUpperCase(), adx, ady, F(700, 24, 'Mono'), WA(0.7), { align: 'center', a: fa(t, SC1 + 1.0, 0.4) * (1 - q), ls: 5 }); }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END, contact: agentContact() });
      },
      cues() { const ev = [['whoosh', 0.1, 0.22, 0], ['riser', SC0, 0.15, 0], ['shimmer', SC0 + 0.2, 0.14, 0], ['ticks', SC0, 0.1, 0, { dur: SC1 - SC0, n: 14 }], ['swish', SC1, 0.22, -0.3], ['pencil', SC1 + 0.1, 0.25, 0.2], ['pop', SC1 + 0.4, 0.22, -0.3], ['pop', SC1 + 0.58, 0.22, 0], ['pop', SC1 + 0.76, 0.22, 0.3]]; return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ FRONT DOOR
  const DOORS = { red: '#9B2226', navy: '#1D3557', black: '#1B1B1E', green: '#2D6A4F', wood: '#8B5A2B', teal: '#1F7A7A' };
  function redoorx() {
    const ADDR = fact('addr', true), PRICE = fact('price'), DEAL = fact('deal'), AREA = fact('area');
    const DC = TX('door', 'navy', { label: 'Door colour', group: 'Style', options: opts([['navy', 'Navy'], ['red', 'Red'], ['black', 'Black'], ['green', 'Green'], ['teal', 'Teal'], ['wood', 'Natural wood'], ['accent', 'Accent colour']]) });
    const NUM = off(TX('num', (String(ADDR).match(/^\s*(\d+[A-Z]?)/i) || [0, '18'])[1], { label: 'House number', group: 'Style', max: 6, hint: 'From the listing address. ' + DASH }));
    const TITLE = TX('title', 'Welcome *home.*', { label: 'Headline', group: 'Words', max: 24, hint: 'Wrap a word in *stars* to colour it.' });
    const END = TX('end', 'Come see it *in person.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const S = lshot('s1', 'Inside (listing photo 1)', 7, 0), OPEN = 0.9, WALK = 1.8, OUT = 6.6, DUR = OUT + 4.2, DR = [355, 560, 370, 700], BIG = [60, 330, 960, 720], dcol = DC === 'accent' ? OR : DOORS[DC] || DOORS.navy;
    function elements() {
      const ty = BIG[1] + BIG[3] + 130;
      const els = [];
      if (NUM) { const np = posOf(elP('num'), [540, DR[1] - 108]); els.push({ id: 'num', kind: 'pos', label: NUM, x: np[0], y: np[1], t0: 0.1, d: OUT - 0.1, box: [np[0] - 100, np[1] - 45, 200, 90], dup: false, del: false }); }
      const tiP = posOf(elP('title'), [540, ty]); els.push({ id: 'title', kind: 'pos', label: plain(TITLE), x: tiP[0], y: tiP[1], t0: WALK + 0.9, d: OUT - (WALK + 0.9), box: [tiP[0] - 470, tiP[1] - 60, 940, 120], dup: false, del: false });
      if (ADDR) { const ap = posOf(elP('addr'), [540, ty + 70]); els.push({ id: 'addr', kind: 'pos', label: ADDR + (AREA ? '  ·  ' + AREA : ''), x: ap[0], y: ap[1], t0: WALK + 1.2, d: OUT - (WALK + 1.2), box: [ap[0] - 470, ap[1] - 30, 940, 60], dup: false, del: false }); }
      if (PRICE) { const pp = posOf(elP('price'), [540, ty + 150]); els.push({ id: 'price', kind: 'pos', label: K7.money(PRICE, DEAL), x: pp[0], y: pp[1], t0: WALK + 1.5, d: OUT - (WALK + 1.5), box: [pp[0] - 200, pp[1] - 40, 400, 80], dup: false, del: false }); }
      return els.concat(closeEls(OUT, DUR, END));
    }
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = 1 - q, w = E.inOutC(seg(t, WALK, 0.9)), s = lerp(1, 3.2, E.inC(w)), cx = DR[0] + DR[2] / 2, cy = DR[1] + DR[3] / 2;
          const rr = [lerp(DR[0], BIG[0], w), lerp(DR[1], BIG[1], w), lerp(DR[2], BIG[2], w), lerp(DR[3], BIG[3], w)];
          // inside the doorway: the photo
          if (t >= OPEN - 0.05) { if (!VID.collecting && w > 0.6) card(rr, 28 * w, a * seg(w, 0.6, 0.4)); within(() => ctx.roundRect(rr[0], rr[1], rr[2], rr[3], 28 * w), () => { if (!VID.collecting) { const c = G(); c.fillStyle = '#F3E9D8'; c.fillRect(rr[0], rr[1], rr[2], rr[3]); D(); } ph(S, t, rr, { alpha: a }); }); }
          // the house front (fades and grows as the camera walks in)
          if (w < 1 && !VID.collecting) { const c = G(); c.globalAlpha = a * (1 - E.inQ(w)); c.translate(cx, cy); c.scale(s, s); c.translate(-cx, -cy);
            c.save(); c.beginPath(); c.rect(-200, -200, W + 400, H + 400); c.rect(DR[0], DR[1], DR[2], DR[3]); c.clip('evenodd');
            c.fillStyle = '#E8E4DC'; c.fillRect(-200, -200, W + 400, H + 400); c.fillStyle = 'rgba(0,0,0,0.06)'; for (let y = 0; y < H; y += 46) c.fillRect(-200, y, W + 400, 4);
            c.fillStyle = '#FFFFFF'; c.fillRect(DR[0] - 40, DR[1] - 46, DR[2] + 80, 46); c.fillRect(DR[0] - 40, DR[1], 40, DR[3]); c.fillRect(DR[0] + DR[2], DR[1], 40, DR[3]); c.fillStyle = '#B8B2A7'; c.fillRect(DR[0] - 70, DR[1] + DR[3], DR[2] + 140, 34);
            c.fillStyle = '#5C6B5A'; [[DR[0] - 150, 1], [DR[0] + DR[2] + 150, -1]].forEach(([x]) => { c.fillStyle = '#7A4B2A'; c.beginPath(); c.moveTo(x - 60, DR[1] + DR[3] - 120); c.lineTo(x + 60, DR[1] + DR[3] - 120); c.lineTo(x + 45, DR[1] + DR[3]); c.lineTo(x - 45, DR[1] + DR[3]); c.fill(); c.fillStyle = '#3F7D4E'; for (let k = 0; k < 7; k++) { c.beginPath(); c.ellipse(x + (k - 3) * 16, DR[1] + DR[3] - 160 - Math.abs(k - 3) * -10, 26, 70, (k - 3) * 0.25, 0, TAU); c.fill(); } });
            c.fillStyle = '#C9A44C'; c.fillRect(DR[0] + DR[2] + 70, DR[1] + 120, 46, 90); c.fillStyle = '#FFF4C2'; c.globalAlpha *= 0.9; c.beginPath(); c.arc(DR[0] + DR[2] + 93, DR[1] + 160, 16, 0, TAU); c.fill(); c.globalAlpha = a * (1 - E.inQ(w));
            if (NUM) { const f = F(800, 46, 'Mont'), tw = textW(NUM, f, 2), [nux, nuy] = posOf(elP('num'), [cx, DR[1] - 108]); c.fillStyle = '#1F2226'; c.beginPath(); c.roundRect(nux - tw / 2 - 26, nuy - 42, tw + 52, 80, 10); c.fill(); setF(f, 2); c.fillStyle = '#E8C47C'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(NUM, nux, nuy); }
            c.restore();
            // the door swings open on its left hinge
            const op = E.inOutC(seg(t, OPEN, 0.8)), dw = DR[2] * Math.cos(op * Math.PI * 0.46); c.fillStyle = 'rgba(0,0,0,' + 0.5 * op + ')'; c.fillRect(DR[0], DR[1], DR[2], DR[3]);
            c.save(); c.translate(DR[0], DR[1]); c.scale(Math.max(0.02, dw / DR[2]), 1); c.fillStyle = dcol; c.fillRect(0, 0, DR[2], DR[3]); c.fillStyle = 'rgba(0,0,0,' + (0.15 + 0.35 * op) + ')'; c.fillRect(0, 0, DR[2], DR[3]);
            c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 6; [[40, 50, DR[2] - 80, 250], [40, 340, DR[2] - 80, 300]].forEach(([x, y, w2, h2]) => c.strokeRect(x, y, w2, h2)); c.fillStyle = '#D9B45A'; c.beginPath(); c.arc(DR[2] - 46, DR[3] / 2 + 20, 14, 0, TAU); c.fill();
            if (op < 0.2) { c.strokeStyle = '#2F5E25'; c.lineWidth = 22; c.beginPath(); c.arc(DR[2] / 2, 180, 70, 0, TAU); c.stroke(); c.fillStyle = '#C0392B'; for (let k = 0; k < 6; k++) { const an = k * 1.05; c.beginPath(); c.arc(DR[2] / 2 + Math.cos(an) * 70, 180 + Math.sin(an) * 70, 7, 0, TAU); c.fill(); } }
            c.restore(); c.globalCompositeOperation = 'lighter'; const gl = op * (1 - w); const g = c.createRadialGradient(cx, cy, 20, cx, cy, 500); g.addColorStop(0, 'rgba(255,220,160,' + 0.35 * gl + ')'); g.addColorStop(1, 'rgba(255,220,160,0)'); c.fillStyle = g; c.fillRect(cx - 500, cy - 500, 1000, 1000); D(); }
          const ty = BIG[1] + BIG[3] + 130; head(TITLE, t, WALK + 0.9, ty, { q, max: 100, el: 'title' });
          if (ADDR) { const [adx, ady] = posOf(elP('addr'), [W / 2, ty + 70]); K7.txt(ADDR + (AREA ? '  ·  ' + AREA : ''), adx, ady, F(700, Math.min(34, fitSize(ADDR + '  ·  ' + AREA, 700, 940, 34, 'Mont')), 'Mont'), WA(0.85), { align: 'center', a: fa(t, WALK + 1.2, 0.4) * a }); }
          else if (!VID.collecting && t > WALK + 1.2) K7.need('Street address', W / 2, ty + 60, 24, { align: 'center', a });
          if (PRICE) chip(K7.money(PRICE, DEAL), W / 2, ty + 150, { p: seg(t, WALK + 1.5, 0.4) * a, size: 40, bg: OR, col: onCol(OR), w: 900, el: 'price' });
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END, contact: agentContact() });
      },
      cues() { const ev = [['whoosh', 0.05, 0.2, 0], ['click', OPEN - 0.1, 0.4, 0], ['reverse', OPEN + 0.5, 0.2, -0.2], ['air', WALK + 0.4, 0.3, 0], ['shimmer', WALK + 0.8, 0.18, 0], ['swish', WALK + 0.9, 0.2, 0], ['pop', WALK + 1.5, 0.25, 0.2]]; return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ BARBER POLE
  const POLE = ['#D62828', '#FFFFFF', '#1D4ED8', '#FFFFFF'];
  function stripes(c, x, y, w, h, off, bw) { for (let k = -Math.ceil((h + w) / bw) - 4, i = 0; k < Math.ceil((w + h) / bw) + 4; k++, i++) { const x0 = x + k * bw - ((off % (bw * 4)) + bw * 4) % (bw * 4); c.fillStyle = POLE[((k % 4) + 4) % 4]; c.beginPath(); c.moveTo(x0, y + h); c.lineTo(x0 + bw, y + h); c.lineTo(x0 + bw + h * 0.9, y); c.lineTo(x0 + h * 0.9, y); c.closePath(); c.fill(); } }
  function bbpolex() {
    const TITLE = TX('title', 'Book your *next cut.*', { label: 'Headline', group: 'Words', max: 26, hint: 'Wrap a word in *stars* to colour it.' });
    const SUB = off(TX('sub', (BRAND.services || ['CUTS', 'FADES', 'BEARDS']).slice(0, 3).join('  ·  '), { label: 'Line under it', group: 'Words', upper: true, max: 40, hint: DASH }));
    const END = TX('end', 'Look *sharp.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const S = shot('s1', 'Your photo or clip (a fresh cut)', 6.8), BOX = [90, 300, 900, 820], WP = 1.7, WD = 0.9, OUT = 6.4, DUR = OUT + 4.2, PX = 430, PW = 220, PT = 420, PB = 1260;
    function elements() {
      const r = K3.wholeIn(S.c, BOX), yy = Math.min(1330, r[1] + r[3] + 130);
      const tiP = posOf(elP('title'), [540, yy]);
      const els = [
        { id: 'photo', kind: 'box', label: 'Your photo', x: BOX[0], y: BOX[1], w: BOX[2], h: BOX[3], t0: 0.1, d: OUT - 0.1, box: [BOX[0], BOX[1], BOX[2], BOX[3]], dup: false, del: false },
        { id: 'title', kind: 'pos', label: plain(TITLE), x: tiP[0], y: tiP[1], t0: WP + WD - 0.1, d: OUT - (WP + WD - 0.1), box: [tiP[0] - 470, tiP[1] - 60, 940, 120], dup: false, del: false },
      ];
      if (SUB) { const sp = posOf(elP('sub'), [540, yy + 64]); els.push({ id: 'sub', kind: 'pos', label: SUB, x: sp[0], y: sp[1], t0: WP + WD + 0.2, d: OUT - (WP + WD + 0.2), box: [sp[0] - 450, sp[1] - 25, 900, 50], dup: false, del: false }); }
      return els.concat(closeEls(OUT, DUR, END));
    }
    return {
      dur: DUR, shakes: [[WP + 0.45, 6]], elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = 1 - q, wp = E.inOutS(seg(t, WP, WD)), bxAt = y => lerp(-700, W + 700, wp) + (y - H / 2) * -0.45;
          const old = () => { if (VID.collecting) return; const c = G(), k = E.outBack(seg(t, 0.1, 0.6)); c.globalAlpha = a; c.translate(PX + PW / 2, (PT + PB) / 2); c.scale(k, k); c.translate(-(PX + PW / 2), -(PT + PB) / 2);
            c.save(); c.beginPath(); c.roundRect(PX, PT, PW, PB - PT, 24); c.clip(); stripes(c, PX - 40, PT, PW + 80, PB - PT, t * 260, 58);
            const sh = c.createLinearGradient(PX, 0, PX + PW, 0); sh.addColorStop(0, 'rgba(0,0,0,0.55)'); sh.addColorStop(0.3, 'rgba(255,255,255,0.25)'); sh.addColorStop(0.45, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.6)'); c.fillStyle = sh; c.fillRect(PX, PT, PW, PB - PT); c.restore();
            const ch = (y, h) => { const g = c.createLinearGradient(PX - 30, 0, PX + PW + 30, 0); g.addColorStop(0, '#6B7280'); g.addColorStop(0.35, '#F3F4F6'); g.addColorStop(1, '#4B5563'); c.fillStyle = g; c.beginPath(); c.roundRect(PX - 30, y, PW + 60, h, 14); c.fill(); };
            ch(PT - 60, 64); ch(PB - 4, 64); c.fillStyle = '#E5E7EB'; c.beginPath(); c.arc(PX + PW / 2, PT - 90, 46, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.arc(PX + PW / 2 - 14, PT - 104, 12, 0, TAU); c.fill();
            setF(F(900, 64, 'Mont'), 8); c.save(); c.translate(PX + PW + 110, (PT + PB) / 2); c.rotate(-Math.PI / 2); c.fillStyle = WA(0.12); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText((BRAND.short || 'BARBER').toUpperCase(), 0, 0); c.restore(); D(); };
          const neu = () => { const [bx, by] = posOf(elP('photo'), [BOX[0], BOX[1]]), PB = [bx, by, BOX[2], BOX[3]], r = K3.wholeIn(S.c, PB); card(r, 30, a); within(() => ctx.roundRect(r[0], r[1], r[2], r[3], 30), () => ph(S, t, PB, { alpha: a })); return r; };
          let r = null;
          if (wp <= 0) old(); else if (wp >= 1) r = neu();
          else { within(() => { ctx.moveTo(bxAt(0), 0); ctx.lineTo(W + 800, 0); ctx.lineTo(W + 800, H); ctx.lineTo(bxAt(H), H); ctx.closePath(); }, old);
            within(() => { ctx.moveTo(-800, 0); ctx.lineTo(bxAt(0), 0); ctx.lineTo(bxAt(H), H); ctx.lineTo(-800, H); ctx.closePath(); }, () => { r = neu(); });
            if (!VID.collecting) { const c = G(); c.beginPath(); c.moveTo(bxAt(0) - 260, 0); c.lineTo(bxAt(0) + 260, 0); c.lineTo(bxAt(H) + 260, H); c.lineTo(bxAt(H) - 260, H); c.closePath(); c.clip(); stripes(c, -900, 0, W + 1800, H, t * 900, 90); D(); } }
          if (r || wp >= 1) { const rr = r || K3.wholeIn(S.c, BOX), yy = Math.min(1330, rr[1] + rr[3] + 130); head(TITLE, t, WP + WD - 0.1, yy, { q, max: 96, el: 'title' }); if (SUB) { const [sux, suy] = posOf(elP('sub'), [W / 2, yy + 64]); K7.txt(SUB, sux, suy, F(700, Math.min(28, fitSize(SUB, 700, 900, 28, 'Mono', 4)), 'Mono'), OR, { align: 'center', a: fa(t, WP + WD + 0.2, 0.4) * a, ls: 4 }); } }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.05, 0.22, 0], ['pop', 0.4, 0.22, 0], ['shimmer', 0.6, 0.12, 0], ['riser', WP - 0.4, 0.15, 0], ['whoosh', WP + 0.45, 0.4, 0], ['impact', WP + 0.45, 0.25, 0], ['swish', WP + WD, 0.2, 0.3], ['pop', WP + WD + 0.2, 0.2, 0]]; return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ CHAIRS OPEN
  function chair(c, s) {   // a classic barber chair at the origin (floor at y = 0), about 240 px tall at s = 1
    c.save(); c.scale(s, s); const chrome = (x, y, w, h, r) => { const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#6B7280'); g.addColorStop(0.4, '#F3F4F6'); g.addColorStop(1, '#4B5563'); c.fillStyle = g; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); };
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(0, 0, 90, 14, 0, 0, TAU); c.fill(); chrome(-70, -18, 140, 18, 9); chrome(-14, -96, 28, 80, 6);
    c.fillStyle = '#7A1E2B'; c.beginPath(); c.roundRect(-78, -132, 156, 42, 14); c.fill(); c.beginPath(); c.roundRect(-64, -258, 128, 132, 18); c.fill(); c.beginPath(); c.roundRect(-34, -300, 68, 40, 12); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 3; for (let y = -244; y < -136; y += 26) { c.beginPath(); c.moveTo(-54, y); c.lineTo(54, y); c.stroke(); }
    chrome(-92, -150, 30, 12, 6); chrome(62, -150, 30, 12, 6); chrome(-92, -146, 12, 40, 4); chrome(80, -146, 12, 40, 4); chrome(-40, -78, 80, 10, 5); chrome(-16, -300 + 40, 6, 12, 2);
    c.restore();
  }
  function bbchairx() {
    const TITLE = TX('title', 'Chairs open *today.*', { label: 'Headline', group: 'Words', max: 26, hint: 'Wrap a word in *stars* to colour it.' });
    const NC = +TX('count', '3', { label: 'Chairs', group: 'Chairs', options: opts([['2', '2'], ['3', '3'], ['4', '4']]) });
    const DEF = [['MARCO', 'open', '2:30 PM'], ['DEV', 'booked', ''], ['LUIS', 'open', '4:00 PM'], ['TONY', 'open', '5:15 PM']];
    const CH = DEF.slice(0, NC).map((d, i) => ({ name: TX('n' + (i + 1), d[0], { label: 'Chair ' + (i + 1) + ' barber', group: 'Chairs', upper: true, max: 10 }), st: TX('s' + (i + 1), d[1], { label: 'Chair ' + (i + 1), group: 'Chairs', options: opts([['open', 'Open'], ['booked', 'Booked']]) }), time: TX('t' + (i + 1), d[2] || '3:00 PM', { label: 'Chair ' + (i + 1) + ' next opening', group: 'Chairs', max: 10 }) }));
    const OPENW = TX('openw', 'OPEN', { label: 'Open label', group: 'Words', upper: true, max: 10 }), BOOKW = TX('bookw', 'BOOKED', { label: 'Booked label', group: 'Words', upper: true, max: 10 });
    const FOOT = off(TX('foot', 'Walk in or book online.', { label: 'Line at the bottom', group: 'Words', max: 34, hint: DASH }));
    const END = TX('end', 'Grab your *chair.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const n = CH.length, cw = W / n, FLOOR = 1010, sc = n === 4 ? 0.82 : n === 3 ? 1 : 1.15, ST = 1.6, OUT = 6.4, DUR = OUT + 4.2;
    function elements() {
      const tiP = posOf(elP('title'), [540, 330]);
      const els = [
        { id: 'title', kind: 'pos', label: plain(TITLE), x: tiP[0], y: tiP[1], t0: 0.1, d: OUT - 0.1, box: [tiP[0] - 470, tiP[1] - 60, 940, 120], dup: false, del: false },
      ];
      CH.forEach((ch, i) => {
        const cx = cw * (i + 0.5);
        const nmP = posOf(elP('name' + (i + 1)), [cx, FLOOR + 80]);
        els.push({ id: 'name' + (i + 1), kind: 'pos', label: ch.name, x: nmP[0], y: nmP[1], t0: 0.9 + i * 0.15, d: OUT - (0.9 + i * 0.15), box: [nmP[0] - (cw - 40) / 2, nmP[1] - 30, cw - 40, 60], dup: false, del: false });
        const stP = posOf(elP('status' + (i + 1)), [cx, FLOOR + 150]);
        els.push({ id: 'status' + (i + 1), kind: 'pos', label: ch.st === 'open' ? OPENW : BOOKW, x: stP[0], y: stP[1], t0: ST + i * 0.25, d: OUT - (ST + i * 0.25), box: [stP[0] - 110, stP[1] - 35, 220, 70], dup: false, del: false });
        if (ch.st === 'open' && ch.time) { const tmP = posOf(elP('time' + (i + 1)), [cx, FLOOR + 230]); els.push({ id: 'time' + (i + 1), kind: 'pos', label: ch.time, x: tmP[0], y: tmP[1], t0: ST + i * 0.25 + 0.2, d: OUT - (ST + i * 0.25 + 0.2), box: [tmP[0] - 110, tmP[1] - 30, 220, 60], dup: false, del: false }); }
      });
      if (FOOT) { const fp = posOf(elP('foot'), [540, FLOOR + 320]); els.push({ id: 'foot', kind: 'pos', label: FOOT, x: fp[0], y: fp[1], t0: ST + n * 0.25 + 0.3, d: OUT - (ST + n * 0.25 + 0.3), box: [fp[0] - 470, fp[1] - 30, 940, 60], dup: false, del: false }); }
      return els.concat(closeEls(OUT, DUR, END));
    }
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = 1 - q;
          head(TITLE, t, 0.1, 330, { q, max: 96, el: 'title' });
          if (!VID.collecting) { const c = G(); c.globalAlpha = a; const fl = c.createLinearGradient(0, FLOOR, 0, FLOOR + 300); fl.addColorStop(0, 'rgba(255,255,255,0.08)'); fl.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = fl; c.fillRect(0, FLOOR, W, 300);
            for (let x = 0; x < W; x += 60) for (let y = 0; y < 5; y++) if ((x / 60 + y) % 2 === 0) { c.fillStyle = 'rgba(255,255,255,' + 0.05 * (1 - y / 5) + ')'; c.fillRect(x, FLOOR + y * 40, 60, 40); }
            CH.forEach((ch, i) => { const cx = cw * (i + 0.5), k = E.outBack(seg(t, 0.4 + i * 0.18, 0.6)), lit = seg(t, 1.0 + i * 0.1, 0.3), open = ch.st === 'open';
              c.save(); c.globalAlpha = a * clamp(k * 2); c.fillStyle = mix('#1F2937', open ? '#BDE8FF' : '#3A3F4A', lit * 0.35); c.strokeStyle = 'rgba(255,255,255,' + (0.15 + 0.3 * lit) + ')'; c.lineWidth = 4; c.beginPath(); c.roundRect(cx - 95 * sc, 470, 190 * sc, 230 * sc, 16); c.fill(); c.stroke();
              if (open && lit > 0) { c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(cx, 560, 10, cx, 560, 220 * sc); g.addColorStop(0, 'rgba(180,230,255,' + 0.25 * lit + ')'); g.addColorStop(1, 'rgba(180,230,255,0)'); c.fillStyle = g; c.fillRect(cx - 240, 340, 480, 440); c.globalCompositeOperation = 'source-over'; }
              c.translate(cx, FLOOR + (1 - k) * 300); c.rotate((1 - k) * (i % 2 ? 0.6 : -0.6)); chair(c, sc); c.restore(); }); D(); }
          CH.forEach((ch, i) => { const cx = cw * (i + 0.5), open = ch.st === 'open', p = seg(t, ST + i * 0.25, 0.35) * a;
            { const [nmx, nmy] = posOf(elP('name' + (i + 1)), [cx, FLOOR + 80]); K7.txt(ch.name, nmx, nmy, F(800, Math.min(34, fitSize(ch.name, 800, cw - 40, 34, 'Mont', 3)), 'Mont'), WHT, { align: 'center', a: fa(t, 0.9 + i * 0.15, 0.4) * a, ls: 3 }); }
            chip(open ? OPENW : BOOKW, cx, FLOOR + 150, { p, size: n === 4 ? 26 : 30, bg: open ? OR : 'rgba(255,255,255,0.12)', col: open ? onCol(OR) : WA(0.6), w: 900, ls: 3, el: 'status' + (i + 1) });
            if (open && ch.time) { const [tmx, tmy] = posOf(elP('time' + (i + 1)), [cx, FLOOR + 230]); K7.txt(ch.time, tmx, tmy, F(700, n === 4 ? 26 : 30, 'Mont'), WA(0.85), { align: 'center', a: fa(t, ST + i * 0.25 + 0.2, 0.3) * a }); } });
          if (FOOT) { const [ftx, fty] = posOf(elP('foot'), [W / 2, FLOOR + 320]); K7.txt(FOOT, ftx, fty, F(600, 32, 'Mont'), WA(0.7), { align: 'center', a: fa(t, ST + n * 0.25 + 0.3, 0.4) * a }); }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.05, 0.22, 0]]; for (let i = 0; i < 3; i++) ev.push(['thud', 0.6 + i * 0.18, 0.22, (i - 1) * 0.4], ['switch', 1.0 + i * 0.1, 0.15, (i - 1) * 0.4]); ev.push(['chime', ST, 0.22, -0.4], ['pop', ST + 0.25, 0.2, 0], ['chime', ST + 0.5, 0.22, 0.4]); return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ NEON SIGN
  const NEON = { pink: '#FF3EA5', cyan: '#3EE6FF', yellow: '#FFE45E', green: '#5CFF8A', purple: '#B36BFF', orange: '#FF9B3E', red: '#FF4D4D', white: '#F4F4FF' };
  const NEONM = { barbershop: ['Fresh Cuts', 'Haircut | $30\nSkin fade | $35\nBeard trim | $15\nCut + beard | $45'], salon: ['Hair Studio', 'Cut & style | $55\nColor | $95\nBlowout | $40\nTreatment | $35'],
    tacos: ['Tacos', 'Al pastor | $3\nAsada | $3.50\nBirria | $4\nAgua fresca | $3'], burgers: ['Burgers', 'Single | $8\nDouble | $11\nFries | $4\nShake | $6'], pizza: ['Pizza', 'By the slice | $4\nWhole pie | $18\nWings | $11\nGarlic knots | $6'],
    mexican: ['Cantina', 'Margarita | $9\nMichelada | $8\nNachos | $11\nTacos (3) | $12'], restaurant: ['Open Late', 'Tacos (3) | $12\nQuesabirria | $11\nNachos | $10\nAguas frescas | $4'], events: ['Tonight', 'Live music | 8 PM\nHappy hour | 5–7\nDJ | 10 PM'], general: ['Open Late', 'Item one | $10\nItem two | $12\nItem three | $9'] };
  const BRICK = new Map();
  function brickWall() { if (BRICK.has(1)) return BRICK.get(1); const c = document.createElement('canvas'); c.width = 540; c.height = 960; const g = c.getContext('2d'), r = rng(5); g.fillStyle = '#1A1210'; g.fillRect(0, 0, 540, 960);
    for (let y = 0, row = 0; y < 960; y += 32, row++) for (let x = row % 2 ? -32 : 0; x < 540; x += 64) { const v = 0.6 + r() * 0.4; g.fillStyle = 'rgb(' + Math.round(92 * v) + ',' + Math.round(42 * v) + ',' + Math.round(34 * v) + ')'; g.fillRect(x + 2, y + 2, 60, 28); g.fillStyle = 'rgba(0,0,0,' + r() * 0.25 + ')'; g.fillRect(x + 2, y + 2 + r() * 20, 60, 8); }
    BRICK.set(1, c); return c; }
  const flick = (t, t0, seed) => (t < t0 ? 0 : t > t0 + 0.45 ? 1 : hash(Math.floor(t * 24) + seed * 13.7) > 0.45 ? 1 : 0.12);
  function neonGlow(c, str, x, y, f, col, on, align) {
    if (on <= 0) return; c.font = f; c.textAlign = align || 'center'; c.textBaseline = 'alphabetic'; c.globalAlpha *= 1;
    c.fillStyle = rgbaOf(col, 0.08 + 0.04 * on); c.fillText(str, x + 4, y + 6);   // the unlit tube's shadow on the wall
    if (on < 0.5) { c.fillStyle = rgbaOf(col, 0.25); c.fillText(str, x, y); return; }
    c.shadowColor = col; c.shadowBlur = 50; c.fillStyle = col; c.fillText(str, x, y); c.shadowBlur = 18; c.fillText(str, x, y); c.shadowBlur = 0; c.fillStyle = mix(col, '#FFFFFF', 0.65); c.fillText(str, x, y);
  }
  function neonx() {
    const Nd = NEONM[IND] || (FOOD.includes(IND) ? NEONM.restaurant : NEONM.general);
    const TITLE = TX('title', Nd[0], { label: 'Neon title', group: 'Sign', max: 18 });
    const TF = TX('tfont', 'sacramento', { label: 'Title lettering', group: 'Sign', options: opts([['sacramento', 'Thin script'], ['greatvibes', 'Fancy script'], ['kaushan', 'Brush script'], ['pacifico', 'Retro script'], ['monoton', 'Retro lines'], ['righteous', 'Rounded'], ['bebas', 'Block caps']]) });
    const TC = TX('tcol', 'pink', { label: 'Title colour', group: 'Sign', options: opts(Object.keys(NEON).map(k => [k, k[0].toUpperCase() + k.slice(1)])) });
    const LC = TX('lcol', 'cyan', { label: 'Menu colour', group: 'Sign', options: opts(Object.keys(NEON).map(k => [k, k[0].toUpperCase() + k.slice(1)])) });
    const ITEMS = lines(TX('items', Nd[1], { label: 'Lines (one per line: name | price)', group: 'Sign', multiline: true, max: 160, hint: 'Up to 5 lines.' })).slice(0, 5).map(l => l.split('|').map(x => x.trim()));
    const OPEN = off(TX('open', 'OPEN', { label: 'Blinking sign', group: 'Sign', upper: true, max: 10, hint: DASH }));
    const END = TX('end', 'Come *through.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const tfam = fontOf(TF), twt = wtOf(TF), tcol = NEON[TC] || NEON.pink, lcol = NEON[LC] || NEON.cyan, n = Math.max(1, ITEMS.length), T0 = 0.5, at = i => 1.4 + i * Math.min(0.35, 1.6 / n), OT = 3.4, OUT = 6.4, DUR = OUT + 4.2;
    const TS = { sacramento: 1.5, greatvibes: 1.35, kaushan: 1.0, pacifico: 0.95, monoton: 0.8, righteous: 1.0, bebas: 1.2 }[TF] || 1;
    function elements() {
      const tiP = posOf(elP('title'), [540, 540]);
      const rowH = Math.min(110, 560 / n), fs = Math.min(64, rowH * 0.6);
      const els = [
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: T0, d: OUT - T0, box: [tiP[0] - 450, tiP[1] - 120, 900, 200], dup: false, del: false },
      ];
      ITEMS.forEach((it, i) => {
        const y = 720 + i * rowH;
        const ip = posOf(elP('item' + (i + 1)), [it[1] ? 130 : 540, y]);
        els.push({ id: 'item' + (i + 1), kind: 'pos', label: it[0], x: ip[0], y: ip[1], t0: at(i), d: OUT - at(i), box: it[1] ? [ip[0], ip[1] - fs, 560, fs * 1.6] : [ip[0] - 440, ip[1] - fs, 880, fs * 1.6], dup: false, del: false });
        if (it[1]) { const pp = posOf(elP('price' + (i + 1)), [950, y]); els.push({ id: 'price' + (i + 1), kind: 'pos', label: it[1], x: pp[0], y: pp[1], t0: at(i) + 0.15, d: OUT - (at(i) + 0.15), box: [pp[0] - 200, pp[1] - fs, 200, fs * 1.6], dup: false, del: false }); }
      });
      if (OPEN) { const by = 720 + n * rowH + 110, op = posOf(elP('open'), [540, by]); els.push({ id: 'open', kind: 'pos', label: OPEN, x: op[0], y: op[1], t0: OT, d: OUT - OT, box: [op[0] - 200, op[1] - 62, 400, 124], dup: false, del: false }); }
      return els.concat(closeEls(OUT, DUR, END));
    }
    return {
      dur: DUR, shakes: [], elements,
      preload: async () => { await K3.init(); if (window.NX && NX.useFont) await NX.useFont(TF); },
      render(t) {
        if (!VID.collecting) { const c = G(); c.drawImage(brickWall(), 0, 0, W, H); const v = c.createRadialGradient(W / 2, 760, 200, W / 2, 800, 1100); v.addColorStop(0, 'rgba(0,0,0,0.15)'); v.addColorStop(1, 'rgba(0,0,0,0.85)'); c.fillStyle = v; c.fillRect(0, 0, W, H); D(); }
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = 1 - q;
          if (!VID.collecting) { const c = G(); c.globalAlpha = a;
            const ton = flick(t, T0, 1), ts = Math.min(200 * TS, fitSize(TITLE, twt, 900, 200 * TS, tfam));
            if (ton >= 0.5) { c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(W / 2, 470, 40, W / 2, 470, 620); g.addColorStop(0, rgbaOf(tcol, 0.22)); g.addColorStop(1, rgbaOf(tcol, 0)); c.fillStyle = g; c.fillRect(0, 0, W, 1100); c.globalCompositeOperation = 'source-over'; }
            { const [tix, tiy] = posOf(elP('title'), [W / 2, 540]); neonGlow(c, TITLE, tix, tiy, F(twt, ts, tfam), tcol, ton); }
            const lon = flick(t, T0 + 0.5, 2); c.strokeStyle = lon >= 0.5 ? tcol : rgbaOf(tcol, 0.25); c.lineWidth = 6; c.lineCap = 'round'; if (lon >= 0.5) { c.shadowColor = tcol; c.shadowBlur = 24; } c.beginPath(); c.moveTo(W / 2 - 300, 600); c.lineTo(W / 2 + 300, 600); c.stroke(); c.shadowBlur = 0;
            const rowH = Math.min(110, 560 / n), fs = Math.min(64, rowH * 0.6);
            ITEMS.forEach((it, i) => { const on = flick(t, at(i), i + 3), y = 720 + i * rowH; const f = F(400, Math.min(fs, fitSize(it[0], 400, it[1] ? 560 : 880, fs, 'Bebas', 2)), 'Bebas'); c.letterSpacing = '2px';
              const [itx, ity] = posOf(elP('item' + (i + 1)), [it[1] ? 130 : W / 2, y]); neonGlow(c, it[0].toUpperCase(), itx, ity, f, lcol, on, it[1] ? 'left' : 'center'); if (it[1]) { const [prx, pry] = posOf(elP('price' + (i + 1)), [W - 130, y]); neonGlow(c, it[1], prx, pry, F(400, fs, 'Bebas'), tcol, flick(t, at(i) + 0.15, i + 9), 'right'); } c.letterSpacing = '0px'; });
            if (OPEN) { const [bx, by] = posOf(elP('open'), [W / 2, 720 + n * rowH + 110]), blink = t < OT ? 0 : Math.floor((t - OT) * 2.2) % 2 === 0 ? 1 : 0.2, f = F(400, 64, 'Bebas'), tw = textW(OPEN, f, 6); c.letterSpacing = '6px';
              c.strokeStyle = blink >= 0.5 ? '#FF4D4D' : 'rgba(255,77,77,0.25)'; c.lineWidth = 5; if (blink >= 0.5) { c.shadowColor = '#FF4D4D'; c.shadowBlur = 26; } c.beginPath(); c.roundRect(bx - tw / 2 - 40, by - 62, tw + 80, 88, 18); c.stroke(); c.shadowBlur = 0; neonGlow(c, OPEN, bx, by, f, '#FF4D4D', blink); c.letterSpacing = '0px'; }
            D(); }
        }
        if (t >= OUT) { if (!VID.collecting) fillScreen(BLK, 0.55); close(t, OUT, { y: 620, line: END }); }
      },
      cues() { const ev = [['click', T0, 0.3, 0], ['glitch', T0 + 0.05, 0.12, 0], ['switch', T0 + 0.45, 0.25, 0], ['shimmer', T0 + 0.5, 0.1, 0]]; for (let i = 0; i < 4; i++) ev.push(['click', 1.4 + i * 0.35, 0.2, -0.3], ['click', 1.55 + i * 0.35, 0.16, 0.3]); ev.push(['switch', OT, 0.2, 0.2], ['tick', OT + 0.9, 0.12, 0.2], ['tick', OT + 1.8, 0.12, 0.2]); return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ CERAMIC BEADING
  const PAINT = { black: ['#0E1116', '#2A3140'], red: ['#7A0E16', '#C8202E'], blue: ['#0B2A5B', '#2457B8'], white: ['#C9CED6', '#F4F6F8'], silver: ['#5A616B', '#B9C0C8'], green: ['#0E3B2A', '#1F7A55'] };
  function beadx() {
    const PC = TX('paint', 'black', { label: 'Paint colour', group: 'Style', options: opts([['black', 'Black'], ['red', 'Red'], ['blue', 'Blue'], ['white', 'White'], ['silver', 'Silver'], ['green', 'Green'], ['accent', 'Accent colour']]) });
    const TITLE = TX('title', 'Water just *rolls off.*', { label: 'Headline', group: 'Words', max: 28, hint: 'Wrap a word in *stars* to colour it.' });
    const BADGE = off(TX('badge', 'CERAMIC COATING', { label: 'Badge', group: 'Words', upper: true, max: 20, hint: DASH }));
    const SUB = off(TX('sub', 'Protect the paint you love.', { label: 'Line at the bottom', group: 'Words', max: 34, hint: DASH }));
    const END = TX('end', 'Book your *coating.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const pc = PC === 'accent' ? [mix(OR, '#000000', 0.55), OR] : PAINT[PC] || PAINT.black, PR = [60, 420, 960, 820], RAIN = 0.5, TILT = 2.3, OUT = 6.4, DUR = OUT + 4.2;
    const beads = Array.from({ length: 64 }, (_, i) => [PR[0] + 40 + hash(i * 3.7) * (PR[2] - 80), PR[1] + 40 + hash(i * 5.3) * (PR[3] - 80), 10 + Math.pow(hash(i * 1.7), 2) * 26, RAIN + hash(i * 2.9) * 1.2]);
    function elements() {
      const tiP = posOf(elP('title'), [540, 330]);
      const els = [
        { id: 'title', kind: 'pos', label: plain(TITLE), x: tiP[0], y: tiP[1], t0: 0.1, d: OUT - 0.1, box: [tiP[0] - 470, tiP[1] - 60, 940, 120], dup: false, del: false },
      ];
      if (BADGE) { const bp = posOf(elP('badge'), [PR[0] + 30, PR[1] + 56]); els.push({ id: 'badge', kind: 'pos', label: BADGE, x: bp[0], y: bp[1], t0: TILT + 1.2, d: OUT - (TILT + 1.2), box: [bp[0], bp[1] - 30, 500, 60], dup: false, del: false }); }
      if (SUB) { const sp = posOf(elP('sub'), [540, PR[1] + PR[3] + 90]); els.push({ id: 'sub', kind: 'pos', label: SUB, x: sp[0], y: sp[1], t0: TILT + 1.4, d: OUT - (TILT + 1.4), box: [sp[0] - 470, sp[1] - 30, 940, 60], dup: false, del: false }); }
      return els.concat(closeEls(OUT, DUR, END));
    }
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = fa(t, 0.05, 0.5) * (1 - q), tl = E.inQ(seg(t, TILT, 1.6));
          head(TITLE, t, 0.1, 330, { q, max: 96, el: 'title' });
          card(PR, 36, a, pc[0]);
          within(() => ctx.roundRect(PR[0], PR[1], PR[2], PR[3], 36), () => { if (VID.collecting) return; const c = G(); c.globalAlpha = a;
            const g = c.createLinearGradient(PR[0], PR[1], PR[0] + PR[2] * 0.6, PR[1] + PR[3]); g.addColorStop(0, pc[1]); g.addColorStop(0.5, pc[0]); g.addColorStop(1, mix(pc[0], '#000000', 0.4)); c.fillStyle = g; c.fillRect(PR[0], PR[1], PR[2], PR[3]);
            c.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 400; i++) c.fillRect(PR[0] + hash(i * 1.3) * PR[2], PR[1] + hash(i * 2.1) * PR[3], 2, 2);   // metallic flake
            const sx = PR[0] + ((t * 140) % (PR[2] + 600)) - 300; c.globalCompositeOperation = 'lighter'; [[0, 0.16, 160], [220, 0.08, 60]].forEach(([o, al, w]) => { const gg = c.createLinearGradient(sx + o - w, 0, sx + o + w, 0); gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, 'rgba(255,255,255,' + al + ')'); gg.addColorStop(1, 'rgba(255,255,255,0)');
              c.fillStyle = gg; c.save(); c.translate(sx + o, PR[1] + PR[3] / 2); c.rotate(0.35); c.fillRect(-w, -PR[3], w * 2, PR[3] * 2); c.restore(); }); c.globalCompositeOperation = 'source-over';
            // rain streaks
            for (let i = 0; i < 40; i++) { const t0 = RAIN + hash(i * 7.7) * 1.4, u = (t - t0) / 0.25; if (u < 0 || u > 1) continue; const x = PR[0] + hash(i * 3.1) * PR[2], y = PR[1] - 60 + u * (PR[3] * (0.3 + hash(i) * 0.7)); c.strokeStyle = 'rgba(220,240,255,0.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 60); c.lineTo(x, y); c.stroke(); }
            // beads: land, then roll off as the panel tilts (bigger beads go first)
            beads.forEach(([x, y, r, t0], i) => { const u = E.outBack(seg(t, t0, 0.25)); if (u <= 0) return; const roll = Math.max(0, tl * (1.3 + r / 30) - hash(i) * 0.25), dx = roll * roll * 900 + Math.sin(i) * 10 * roll, dy = roll * roll * 260, rr = r * u; const bx = x + dx, by = y + dy;
              c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(bx + rr * 0.25, by + rr * 0.35, rr * 0.95, rr * 0.75, 0, 0, TAU); c.fill();
              const bg2 = c.createRadialGradient(bx - rr * 0.3, by - rr * 0.35, rr * 0.1, bx, by, rr); bg2.addColorStop(0, 'rgba(255,255,255,0.35)'); bg2.addColorStop(0.5, rgbaOf(pc[1], 0.25)); bg2.addColorStop(0.85, 'rgba(0,0,0,0.25)'); bg2.addColorStop(1, 'rgba(255,255,255,0.35)');
              c.fillStyle = bg2; c.beginPath(); c.arc(bx, by, rr, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.ellipse(bx - rr * 0.35, by - rr * 0.4, rr * 0.22, rr * 0.14, -0.6, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.arc(bx + rr * 0.35, by + rr * 0.45, rr * 0.12, 0, TAU); c.fill();
              if (roll > 0.05) { c.strokeStyle = 'rgba(255,255,255,0.08)'; c.lineWidth = rr * 0.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(bx - rr, by - rr * 0.3); c.stroke(); } });
            D(); });
          if (BADGE) chip(BADGE, PR[0] + 30, PR[1] + 56, { p: seg(t, TILT + 1.2, 0.4) * (1 - q), size: 28, align: 'left', fam: 'Mono', w: 700, ls: 4, bg: OR, col: onCol(OR), el: 'badge' });
          if (SUB) { const [sux, suy] = posOf(elP('sub'), [W / 2, PR[1] + PR[3] + 90]); K7.txt(SUB, sux, suy, F(700, Math.min(40, fitSize(SUB, 700, 940, 40, 'Mont')), 'Mont'), WHT, { align: 'center', a: fa(t, TILT + 1.4, 0.4) * (1 - q) }); }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.05, 0.2, 0], ['pour', RAIN, 0.25, 0], ['tick', RAIN + 0.2, 0.12, -0.3], ['tick', RAIN + 0.45, 0.12, 0.3], ['tick', RAIN + 0.7, 0.12, -0.1], ['tick', RAIN + 0.95, 0.12, 0.2], ['shimmer', RAIN + 1.3, 0.14, 0], ['swish', TILT + 0.3, 0.25, 0.4], ['air', TILT + 0.7, 0.25, 0.4], ['sparkle', TILT + 1.2, 0.2, 0], ['pop', TILT + 1.2, 0.22, -0.3]]; return ret(DUR, ev, OUT); },
    };
  }

  const MAKE = { relistx, resignx, blueprintx, redoorx, bbpolex, bbchairx, neonx, beadx };
  const PP = (MAKE[V] || relistx)();
  DIR = { dur: PP.dur, bg: BLK, bgSwap: true, finish: { vig: 0.2, grain: 0.12 }, edl: [], shakes: PP.shakes, preload: PP.preload || (() => K3.init()), render: PP.render, cues: PP.cues, ...(PP.elements ? { elements: PP.elements } : {}), fam: V,
    setup() { if (!window.STUDIO && LIGHTPAL) { const w = IMG.logoW; IMG.logoW = IMG.logoB; IMG.logoB = w; } } };
});
