'use strict';
/* Brand Overlay Studio (V12, Oct 30): a reusable advertising layout system for vertical 9:16 video.
   The screen is split into three areas: the top area holds the business (logo, name, tagline or a promotional headline),
   the middle holds the footage, whole and uncovered, and the bottom area holds how to reach the business (phone, website,
   address or area, the call to action, an offer or the day's special). With landscape footage the banners sit in the space a
   16:9 shot leaves above and below it, so nothing covers the footage; a vertical clip fills the screen and the banners sit
   on soft scrims at its top and bottom edges. Six banner styles (bold, warm, luxe, sharp, sleek, clean) follow the brand's
   industry by default and always use the brand's own colours, logo and fonts. Offers, specials and prices are never invented
   (a marker shows until they are typed; brands whose rules forbid prices or offers never see those parts).
   ?v=frame     Brand Frame        logo + tagline on top, phone · area · website below
   ?v=headline  Headline Banner    a promotional headline on top, the call-to-action button and phone below
   ?v=contact   Contact Bar        a slim logo bar on top, a full contact block below
   ?v=message   Center Message     logo on top, a message panel over the lower edge of the footage, contact below
   ?v=side      Side Banner        a brand ribbon down the left edge, the footage beside it, contact below
   ?v=special   Daily Special      logo on top, today's special (dish, optional price) and how to order below
   ?v=offer     Offer Banner       an offer headline on top, the offer you type and the call to action below */
STUDIO_REG['brand'] = (() => {
  const V = QS.get('v') || 'frame';
  const G = K3.G, D = K3.D, up = K7.up, seg = K7.seg;
  const DPG = K5.isDPG();
  const SECT = { restaurant: 'food', realestate: 'estate', hardscape: 'home', fencing: 'home', landscaping: 'home', roofing: 'home', cleaning: 'home', pressure: 'home', barbershop: 'beauty', salon: 'beauty', detailing: 'auto', events: 'hosp', retail: 'retail', pro: 'pro' };
  const SEC = SECT[BRAND.industry] || (BRAND.parts ? 'home' : 'general');
  const BARBER = /barber/i.test(BRAND.industry || '');
  const pk = P => (BARBER && P.barber !== undefined ? P.barber : P[SEC] !== undefined ? P[SEC] : P.general);
  const AUTO = { restaurant: 'warm', events: 'warm', salon: 'luxe', realestate: 'luxe', barbershop: 'sharp', detailing: 'sleek', retail: 'clean', pro: 'clean' };
  const LOOKS = [['auto', 'Match my industry'], ['bold', 'Bold (outdoor, trades)'], ['warm', 'Warm (restaurants, bars)'], ['luxe', 'Luxe (spa, beauty, property)'], ['sharp', 'Sharp (barbers, fitness)'], ['sleek', 'Sleek (automotive)'], ['clean', 'Clean (retail, services)']];
  const LOOK0 = TX('look', 'auto', { label: 'Banner style', group: 'Banner style', options: LOOKS.map(([value, label]) => ({ value, label })) });
  const TONE = TX('tone', 'auto', { label: 'Banner colour', group: 'Banner style', options: [{ value: 'auto', label: 'Style default' }, { value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }, { value: 'brand', label: 'Brand colour' }] });
  const LOOK = LOOK0 === 'auto' ? (AUTO[BRAND.industry] || 'bold') : LOOK0;
  const TONE_D = { bold: 'dark', warm: 'dark', luxe: 'light', sharp: 'dark', sleek: 'dark', clean: 'light' }[LOOK];
  const tone = TONE === 'auto' ? TONE_D : TONE;
  const BARC = tone === 'dark' ? BLK : tone === 'light' ? (LOOK === 'luxe' ? PAPER : '#FFFFFF') : OR;
  const INK = tone === 'brand' ? K8.onCol(OR) : tone === 'light' ? BLK : WHT;   // text on the bars
  const ACC = tone === 'brand' ? (K8.lum(OR) > 0.36 ? BLK : WHT) : OR;          // accent on the bars
  const SUBC = rgbaOf(INK, 0.72), LOGO = () => (tone === 'light' || (tone === 'brand' && K8.onCol(OR) !== '#FFFFFF') ? IMG.logoB : IMG.logoW);
  const TY = { bold: { d: 'Mont', w: 900, s: 'Mont', sw: 800, tr: 4 }, warm: { d: 'Corm', w: 600, s: 'Mont', sw: 600, tr: 3 }, luxe: { d: 'Corm', w: 500, s: 'Mont', sw: 500, tr: 8 }, sharp: { d: 'Bebas', w: 400, s: 'Mont', sw: 800, tr: 5 },
    sleek: { d: 'Mont', w: 800, s: 'Mono', sw: 700, tr: 4 }, clean: { d: 'Mont', w: 800, s: 'Mont', sw: 600, tr: 3 } }[LOOK];
  const NONE = k => ['nofoot.' + k, 0];
  const SD = 3.0, N = 5, DUR = N * SD;
  const S = K3.shots(Array.from({ length: N }, (x, k) => { const s = SHOT('s' + (k + 1), NONE('s' + (k + 1)), { label: 'Shot ' + (k + 1), group: 'Footage', kind: 'any', ph: 'l', d: SD + 0.6 }); return [s[0], s[1], SD]; }));
  const vert = s => K7.isVert(s.c);
  const fa = (t, t0, d) => E.outC(seg(t, t0, d || 0.5));
  const L8 = o => Object.assign({ kind: 'text', style: 'type', x: 540, y: 960, t0: 0, d: 60, color: INK, w: 960 }, o);
  function type(L, t) { const lt = t - L.t0; if (lt < 0 || lt >= L.d || !L.text) return; const s = K8.xf(L, lt); K8.withLayer(s, K8.box(L), () => K8.type(L, t, s)); }
  function gfx(L, t) { const lt = t - L.t0; if (lt < 0 || lt >= L.d) return; const e = K9.EL[L.type]; if (!e) return; const s = K8.xf(L, lt); K8.withLayer(s, K9.box(L), () => K9.draw(L, t, s)); }
  function cut(id, t, tc, d, A, B, o) { const u = (t - (tc - d / 2)) / d; if (u <= 0) A(); else if (u >= 1) B(); else KT.run(id, u, A, B, Object.assign({ t }, o || {})); }
  // ------------------------------------------------------------------ geometry: the top area, the footage band, the bottom area
  const SIDE = V === 'side' ? 112 : 0, BAND = [SIDE, 560, W - SIDE, Math.round((W - SIDE) * 9 / 16)], BY1 = BAND[1] + BAND[3];
  // ------------------------------------------------------------------ copy (industry defaults; sample text the business edits)
  const TAGLINE = TX('tagline', CONTACT.tagline ? up(CONTACT.tagline) : DPG ? up(BRAND.descriptor || 'DREAM. DESIGN. BUILD.') : pk({ general: 'QUALITY YOU CAN SEE', food: 'INCREDIBLE FOOD. UNFORGETTABLE NIGHTS.', estate: 'EXCEPTIONAL PROPERTIES. EXCEPTIONAL LIVING.', home: 'DREAM. DESIGN. BUILD.', beauty: 'LOOK GOOD. FEEL BETTER.', auto: 'PROTECT. PRESERVE. PERFORM.', hosp: 'GOOD TIMES. GREAT COMPANY.', retail: 'STEP INTO WHAT’S NEXT.', pro: 'CLEAR ADVICE. REAL RESULTS.' }), { label: 'Tagline', group: 'Top banner', upper: true, max: 44 });
  const AREA = TX('area', CONTACT.area || '', { label: 'Address or area', group: 'Bottom banner', upper: true, max: 40, hint: 'Optional, e.g. 123 MAIN ST or SERVING THE BAY AREA. Empty hides it.' });
  const HOURS = TX('hours', '', { label: 'Hours', group: 'Bottom banner', upper: true, max: 30, hint: 'Optional, e.g. OPEN DAILY 11–10. Empty hides it.' });
  const svcLine = (BRAND.services || []).slice(0, 3).map(s => up(s)).join('   /   ');
  // ------------------------------------------------------------------ drawing helpers
  const PH = 'M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z';
  const GLOBE = 'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9M12 3c-2.5 2.6-3.8 5.6-3.8 9s1.3 6.4 3.8 9';
  const PIN = 'M12 21s-6-5.6-6-11a6 6 0 0112 0c0 5.4-6 11-6 11zM12 12.4a2.4 2.4 0 100-4.8 2.4 2.4 0 000 4.8z', CLOCK = 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2';
  function ico(d, x, y, s, col, a, filled) { if (VID.collecting || a <= 0) return; const c = G(); c.globalAlpha = a; c.translate(x, y); c.scale(s / 24, s / 24); c.translate(-12, -12); const p = new Path2D(d); if (filled) { c.fillStyle = col; c.fill(p); } else { c.strokeStyle = col; c.lineWidth = 2; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(p); } D(); }
  function fitLs(s, w, maxW, maxS, fam, ls, st) { return Math.min(maxS, 100 * (maxW - (ls || 0) * s.length) / textW(s, F(w, 100, fam, st), 0)); }   // letter spacing stays in px as the size shrinks
  function txt(s, x, y, size, o) { if (!s) return 0; o = o || {}; const f = F(o.w || TY.sw, Math.min(size, fitLs(s, o.w || TY.sw, o.maxW || 900, size, o.fam || TY.s, o.ls == null ? TY.tr : o.ls, o.it || '')), o.fam || TY.s, o.it || ''); K7.txt(s, x, y, f, o.col || INK, { align: o.align || 'center', a: o.a === undefined ? 1 : o.a, ls: o.ls == null ? TY.tr : o.ls }); return textW(s, f, o.ls == null ? TY.tr : o.ls); }
  // a shot whole inside r; the rest of r is a soft blurred copy (DPG: its dark background)
  function whole(s, t, r, lt) {
    const w = K3.wholeIn(s.c, r);
    if (Math.abs(w[2] - r[2]) + Math.abs(w[3] - r[3]) > 6) { ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.rect(r[0] + SH.x, r[1] + SH.y, r[2], r[3]); ctx.clip(); }
      if (DPG) { if (!VID.collecting) { ctx.fillStyle = DEEP2; ctx.fillRect(r[0] + SH.x, r[1] + SH.y, r[2], r[3]); } } else K3.clip(s.c, s.in, lt, [r[0] - 30, r[1] - 30, r[2] + 60, r[3] + 60], { filter: 'blur(26px) brightness(0.55)' }); ctx.restore(); }
    K3.clip(s.c, s.in, lt, w); return w;
  }
  const rectOf = s => (vert(s) ? [0, 0, W, H] : BAND);
  const drawShot = k => () => { const s = S[k]; whole(s, FT, rectOf(s), Math.max(0, FT - s.start)); };
  let FT = 0;
  // bars: solid in the space a landscape shot leaves; a soft scrim over a vertical clip's edges
  function bars(t, full) {
    if (VID.collecting) return; const pt = E.outC(seg(t, 0, 0.55)), pb = E.outC(seg(t, 0.1, 0.55)), c = G();
    const top = BAND[1], bot = BY1;
    if (full) {   // vertical clip under: gradients so the footage still reads
      let g = c.createLinearGradient(0, 0, 0, top + 60); g.addColorStop(0, rgbaOf(BARC, 0.92)); g.addColorStop(0.75, rgbaOf(BARC, 0.7)); g.addColorStop(1, rgbaOf(BARC, 0)); c.globalAlpha = pt; c.fillStyle = g; c.fillRect(-20, -20, W + 40, top + 80);
      g = c.createLinearGradient(0, bot - 80, 0, H); g.addColorStop(0, rgbaOf(BARC, 0)); g.addColorStop(0.3, rgbaOf(BARC, 0.78)); g.addColorStop(1, rgbaOf(BARC, 0.95)); c.globalAlpha = pb; c.fillStyle = g; c.fillRect(-20, bot - 80, W + 40, H - bot + 100);
    } else {
      c.globalAlpha = 1; c.fillStyle = BARC; c.fillRect(-20, -20 - (1 - pt) * top, W + 40, top + 20); c.fillRect(-20, bot + (1 - pb) * (H - bot), W + 40, H - bot + 20);
      if (tone !== 'brand') { const g = c.createLinearGradient(0, 0, 0, top); g.addColorStop(0, rgbaOf(BLK, tone === 'dark' ? 0 : 0)); g.addColorStop(1, rgbaOf(tone === 'dark' ? '#FFFFFF' : '#000000', 0.04)); c.fillStyle = g; c.fillRect(0, 0, W, top * pt); }
    }
    // under the app's caption area: a quiet texture in the style and a faint logo, so the space is designed, not empty
    if (!full) { const y0 = 1470, a0 = Math.min(1, pb); c.save(); c.beginPath(); c.rect(0, y0, W, H - y0); c.clip(); c.globalAlpha = a0;
      if (LOOK === 'bold' || LOOK === 'sharp') { c.fillStyle = rgbaOf(OR, LOOK === 'sharp' ? 0.10 : 0.07); for (let x = -H; x < W; x += 64) { c.beginPath(); c.moveTo(x, H); c.lineTo(x + 24, H); c.lineTo(x + 24 + (H - y0), y0); c.lineTo(x + (H - y0), y0); c.fill(); } }
      else if (LOOK === 'sleek') { c.fillStyle = rgbaOf(INK, 0.06); for (let y = y0 + 10; y < H; y += 18) for (let x = (y / 18 % 2) * 9; x < W; x += 18) c.fillRect(x, y, 3, 3); }
      else if (LOOK === 'warm') { const g = c.createRadialGradient(W / 2, H, 40, W / 2, H, 620); g.addColorStop(0, rgbaOf(OR, 0.16)); g.addColorStop(1, rgbaOf(OR, 0)); c.fillStyle = g; c.fillRect(0, y0, W, H - y0); }
      else { c.fillStyle = rgbaOf(INK, 0.06); c.fillRect(0, y0, W, 1); }
      const im = LOGO(); if (im) { let [lw, lh] = logoBox(520); if (lh > 150) { lw *= 150 / lh; lh = 150; } c.globalAlpha = a0 * 0.07; c.drawImage(im, W / 2 - lw / 2, 1650 - lh / 2, lw, lh); }
      c.restore(); }
    // the style's signature edge
    c.globalAlpha = Math.min(pt, pb);
    if (LOOK === 'bold') { c.fillStyle = ACC; c.beginPath(); c.moveTo(W * 0.62, top - 10); c.lineTo(W * 0.74, top - 10); c.lineTo(W * 0.70, top); c.lineTo(W * 0.58, top); c.closePath(); c.fill(); c.fillRect(0, top - 4, W * 0.6 * pt, 4); }
    else if (LOOK === 'warm') { c.fillStyle = ACC; c.fillRect(W / 2 - 120 * pt, top - 3, 240 * pt, 3); c.fillRect(W / 2 - 120 * pb, bot, 240 * pb, 3); }
    else if (LOOK === 'luxe') { c.fillStyle = rgbaOf(INK, 0.5); c.fillRect(90, top - 26, (W - 180) * pt, 1); c.fillRect(90, bot + 25, (W - 180) * pb, 1); }
    else if (LOOK === 'sharp') { c.fillStyle = ACC; c.fillRect(0, top - 8, W * pt, 8); c.fillRect(W - W * pb, bot, W, 8); }
    else if (LOOK === 'sleek') { c.fillStyle = ACC; c.beginPath(); c.moveTo(0, top - 6); c.lineTo(W * pt, top - 6); c.lineTo(W * pt - 18, top); c.lineTo(0, top); c.fill(); c.beginPath(); c.moveTo(W, bot + 6); c.lineTo(W - W * pb, bot + 6); c.lineTo(W - W * pb + 18, bot); c.lineTo(W, bot); c.fill(); }
    else { c.fillStyle = rgbaOf(INK, 0.12); c.fillRect(0, top - 1, W, 1); c.fillRect(0, bot, W, 1); }
    D();
  }
  // ------------------------------------------------------------------ modules: top
  function logo(t, x, y, maxW, maxH, t0) { const p = seg(t, t0, 0.6); if (p <= 0 || VID.collecting) return; let [lw, lh] = logoBox(maxW); if (lh > maxH) { lw *= maxH / lh; lh = maxH; } const c = G(), s = lerp(1.08, 1, E.outC(p)); c.globalAlpha = E.outC(clamp(p * 1.6)); c.translate(x, y); c.scale(s, s); c.drawImage(LOGO(), -lw / 2, -lh / 2, lw, lh); D(); return [lw, lh]; }
  function topLogo(t, o) {
    o = o || {}; logo(t, W / 2 + SIDE / 2, o.y || 350, o.lw || 560, o.lh || 160, 0.3);
    if (o.tag !== false && TAGLINE) { const st = { bold: { fam: 'Mont', w: 800, col: ACC }, warm: { fam: 'Hand', w: 700, col: ACC, ls: 0 }, luxe: { fam: 'Mont', w: 500, col: SUBC, ls: 7 }, sharp: { fam: 'Bebas', w: 400, col: ACC, ls: 4 }, sleek: { fam: 'Mono', w: 700, col: ACC, ls: 3 }, clean: { fam: 'Mont', w: 600, col: SUBC } }[LOOK];
      const tg = LOOK === 'warm' ? TAGLINE.charAt(0) + TAGLINE.slice(1).toLowerCase() : TAGLINE; txt(tg, W / 2 + SIDE / 2, o.ty || 488, LOOK === 'warm' ? 48 : LOOK === 'sharp' ? 46 : 30, Object.assign({ a: fa(t, 0.6), maxW: 900 - SIDE }, st)); }
  }
  function topHeadline(t, text, kick) {
    const st = { bold: { slot: 'Mont', wt: 900, size: 96, track: -10 }, warm: { slot: 'Corm', wt: 600, ital: true, size: 100 }, luxe: { slot: 'Corm', wt: 500, size: 88, track: 60 }, sharp: { slot: 'Bebas', size: 130, track: 20 }, sleek: { slot: 'Mont', wt: 800, ital: true, size: 90 }, clean: { slot: 'Mont', wt: 800, size: 92, track: -10 } }[LOOK];
    if (kick) txt(kick, W / 2, 300, 26, { fam: 'Mono', w: 700, col: ACC, ls: 6, a: fa(t, 0.45) });
    type(L8(Object.assign({ text, y: 432, w: 940, lead: 0.98, color: INK, anim: { in: LOOK === 'luxe' ? 'blur' : LOOK === 'sharp' ? 'stagger' : 'wordup', out: 'none' }, t0: 0.5 }, st)), t);
  }
  // ------------------------------------------------------------------ modules: bottom
  function contactBlock(t, y, o) {
    o = o || {}; const ph = CONTACT.phone, web = CONTACT.web ? up(CONTACT.web) : '', a1 = fa(t, 0.7), a2 = fa(t, 0.9);
    if (LOOK === 'bold' && ph && !VID.collecting) {   // the phone in an angled accent slab, area and website beside
      const X0 = SIDE, c = G(), w0 = Math.min(560 - X0 / 2, textW(ph, F(800, 50, 'Mont'), 1) + 140), k = E.outC(seg(t, 0.6, 0.5)); c.fillStyle = OR; c.beginPath(); c.moveTo(X0, y - 52); c.lineTo(X0 + w0 * k, y - 52); c.lineTo(X0 + w0 * k - 46, y + 52); c.lineTo(X0, y + 52); c.closePath(); c.fill(); D();
      ico(PH, X0 + 70, y, 40, K8.onCol(OR), a1, true); txt(ph, X0 + 108, y + 17, 50, { fam: 'Mont', w: 800, col: K8.onCol(OR), align: 'left', ls: 1, a: a1, maxW: w0 - 160 });
      const rx = X0 + w0 + 26, rw = 965 - rx; let yy = AREA && web ? y - 14 : y + 9; if (AREA) { ico(PIN, rx + 14, yy - 10, 28, ACC, a2); txt(AREA, rx + 42, yy, 27, { align: 'left', maxW: rw - 42, a: a2, ls: 2 }); yy += 48; } if (web) { ico(GLOBE, rx + 14, yy - 10, 28, ACC, a2); txt(web, rx + 42, yy, 27, { align: 'left', maxW: rw - 42, a: a2, ls: 2 }); }
      y += 98;
    } else {
      if (ph) { const big = o.big || 56, tw = textW(ph, F(TY.sw, big, TY.s), 1); ico(PH, W / 2 - tw / 2 - 34, y - big * 0.32, big * 0.7, ACC, a1, true); txt(ph, W / 2 + 18, y, big, { a: a1, ls: 1 }); y += 66; } else y += 10;
      const row = [AREA, web].filter(Boolean); if (row.length) { txt(row.join('   ·   '), W / 2, y, 26, { col: SUBC, a: a2, ls: 3 }); y += 46; }
    }
    if (HOURS) { ico(CLOCK, W / 2 - textW(HOURS, F(TY.sw, 24, TY.s), 3) / 2 - 22, y - 8, 24, ACC, a2); txt(HOURS, W / 2 + 14, y, 24, { col: SUBC, a: a2, ls: 3 }); y += 44; }
    return y;   // the next free line
  }
  function licTop(t) { if (CONTACT.lic) txt(CONTACT.lic, W / 2 + SIDE / 2, BAND[1] - 18, 19, { fam: 'Mont', w: 600, col: rgbaOf(INK, 0.55), a: fa(t, 1.0), ls: 3 }); }
  function ctaBtn(t, y, t0) { gfx({ kind: 'mg', type: 'cta', text: CONTACT.cta || 'BOOK NOW', color: tone === 'brand' ? (K8.lum(OR) > 0.36 ? 'ink' : 'white') : 'accent', x: 540, y, t0, d: 60 }, t); }
  // ------------------------------------------------------------------ the layouts
  const okOffer = K9.allowed('discount'), okPrice = K9.allowed('pricetag');
  let HEAD, KICK, MSG, DISH, PRICE, OFFER, OFFSUB, LABEL;
  if (V === 'headline') { KICK = TX('kick', DPG ? up(BRAND.short || BRAND.name) : pk({ general: 'NOW BOOKING', food: 'NOW SERVING', estate: 'NOW SHOWING', home: 'NOW BOOKING', beauty: 'NOW BOOKING', auto: 'NOW BOOKING', hosp: 'NOW BOOKING', retail: 'JUST IN', pro: 'NOW TAKING CLIENTS' }), { label: 'Small line', group: 'Top banner', upper: true, max: 26 });
    HEAD = TX('head', DPG ? 'DREAM. DESIGN. BUILD.' : pk({ general: 'MADE FOR YOU', food: 'CRAFTED WITH PASSION', estate: 'LUXURY LIVING REDEFINED', home: 'TRANSFORM YOUR OUTDOORS', beauty: 'RELAX. RESTORE. GLOW.', barber: 'QUALITY CUTS. REAL CONFIDENCE.', auto: 'SHOWROOM SHINE', hosp: 'NIGHTS TO REMEMBER', retail: 'PREMIUM. MODERN. YOURS.', pro: 'ADVICE THAT WORKS' }), { label: 'Headline', group: 'Top banner', upper: true, max: 34 }); }
  if (V === 'message') MSG = TX('msg', DPG ? 'PREMIUM OUTDOOR LIVING' : pk({ general: 'QUALITY YOU CAN SEE', food: 'CRAFTED WITH PASSION', estate: 'EXCLUSIVE PROPERTIES', home: 'CUSTOM OUTDOOR SPACES', beauty: 'SELF CARE IS POWER', barber: 'SHARP CUTS. CLEAN FADES.', auto: 'PROTECT YOUR INVESTMENT', hosp: 'CELEBRATE HERE', retail: 'NEW SEASON. NEW LOOK.', pro: 'WORK WITH THE EXPERTS' }), { label: 'Main message', group: 'Message', upper: true, max: 30 });
  const MSUB = V === 'message' ? TX('msub', svcLine, { label: 'Services line', group: 'Message', upper: true, max: 50 }) : '';
  if (V === 'special') { LABEL = TX('label', 'TODAY’S SPECIAL', { label: 'Label', group: 'The special', upper: true, max: 24 });
    DISH = TX('dish', '', { label: 'The special', group: 'The special', max: 34, req: true, hint: 'Type the real dish or service, e.g. Smoked brisket plate. A marker shows until you do.' });
    PRICE = okPrice ? TX('price', '', { label: 'Price', group: 'The special', max: 10, hint: 'Optional. Empty hides it.' }) : ''; }
  if (V === 'offer') { HEAD = TX('head', 'SPECIAL OFFER', { label: 'Headline', group: 'Top banner', upper: true, max: 24 });
    OFFER = TX('offer', '', { label: 'Your offer', group: 'The offer', upper: true, max: 26, req: true, hint: 'Type the real offer, e.g. 15% OFF YOUR FIRST VISIT. A marker shows until you do.' });
    OFFSUB = TX('osub', '', { label: 'Details or end date', group: 'The offer', upper: true, max: 40, hint: 'Optional, e.g. ENDS SUNDAY. Empty hides it.' }); }
  const SIDE_T = V === 'side' ? TX('side', up(BRAND.name && BRAND.name.length <= 22 ? BRAND.name : (BRAND.short || BRAND.name)), { label: 'Side ribbon text', group: 'Side banner', upper: true, max: 22 }) : '';
  function sideRibbon(t) {
    if (VID.collecting) return; const p = E.outC(seg(t, 0.15, 0.6)), c = G(); c.fillStyle = OR; c.fillRect(-20, 0, (SIDE + 20) * p, H); D();
    if (p > 0.6) { const c2 = G(), s = SIDE_T + (CONTACT.phone ? '   ·   ' + CONTACT.phone : ''), f = F(800, Math.min(32, fitLs(s, 800, 1300, 32, 'Mont', 6)), 'Mont'); c2.globalAlpha = fa(t, 0.6); c2.translate(SIDE / 2 + 16, BAND[1] + BAND[3] / 2); c2.rotate(-Math.PI / 2); c2.font = f; c2.letterSpacing = '6px'; c2.fillStyle = K8.onCol(OR); c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText(s, 0, 0); D(); }
  }
  function msgPanel(t, b) {   // the centre overlay: a translucent panel over the footage's lower edge, an accent rule, the message and services
    const p = E.outC(seg(t, 0.9, 0.5)); if (p <= 0 || VID.collecting) return; const lsS = MSUB && fitLs(MSUB, 600, 820, 26, 'Mont', 4) < 20 ? 1 : 4, f = F(900, Math.min(66, fitLs(MSG, 900, 820, 66, 'Mont', 2)), 'Mont'), f2 = F(600, Math.min(26, fitLs(MSUB || ' ', 600, 820, 26, 'Mont', lsS)), 'Mont'), w0 = Math.min(930, Math.max(textW(MSG, f, 2), MSUB ? textW(MSUB, f2, lsS) : 0) + 100), h0 = MSUB ? 170 : 120;
    const x0 = Math.max(40, Math.min(970 - w0, W / 2 - w0 / 2)), y0 = b[1] + b[3] - h0 - 40, c = G(); c.globalAlpha = p; c.fillStyle = 'rgba(8,8,12,0.72)'; c.fillRect(x0, y0 + (1 - p) * 30, w0, h0); c.fillStyle = OR; c.fillRect(x0 + 30, y0 + 28 + (1 - p) * 30, 6, h0 - 56); D();
    K7.txt(MSG, x0 + 62, y0 + (MSUB ? 82 : 82) + (1 - p) * 30, f, WHT, { a: p, ls: 2 }); if (MSUB) K7.txt(MSUB, x0 + 62, y0 + 132 + (1 - p) * 30, f2, WA(0.85), { a: p * fa(t, 1.2), ls: lsS });
  }
  function specialBlock(t) {
    const y = BY1 + 60; txt(LABEL, W / 2, y, 26, { fam: 'Mono', w: 700, col: ACC, ls: 6, a: fa(t, 0.6) });
    if (DISH) type(L8({ text: DISH, slot: LOOK === 'warm' || LOOK === 'luxe' ? 'Corm' : TY.d, wt: LOOK === 'warm' ? 600 : TY.w, ital: LOOK === 'warm', size: 76, w: PRICE ? 640 : 940, x: PRICE ? 430 : 540, y: y + 80, anim: { in: 'blur', out: 'none' }, t0: 0.7 }), t);
    else K7.need('your special', W / 2, y + 84, 26, { align: 'center', col: INK });
    if (PRICE) { const p = E.outBack(seg(t, 1.1, 0.4)); if (p > 0 && !VID.collecting) { const c = G(), f = F(900, 56, 'Mont'), w0 = textW(PRICE, f, 1) + 60; c.globalAlpha = clamp(p); c.translate(860, y + 72); c.scale(p, p); c.rotate(-0.05); c.fillStyle = OR; c.beginPath(); c.roundRect(-w0 / 2, -46, w0, 92, 14); c.fill(); D(); K7.txt(PRICE, 860, y + 92, f, K8.onCol(OR), { align: 'center', a: clamp(p), ls: 1 }); } }
    const row = [CONTACT.phone, CONTACT.web ? up(CONTACT.web) : ''].filter(Boolean); if (row.length) txt(row.join('   ·   '), W / 2, y + 172, 30, { col: SUBC, a: fa(t, 1.2), ls: 2 });
  }
  function offerBlock(t) {
    const y = BY1 + 72;
    if (!okOffer) { txt('OFFERS ARE OFF FOR THIS BRAND KIT', W / 2, y, 24, { fam: 'Mono', w: 700, col: SUBC, ls: 4 }); contactBlock(t, y + 90, { big: 40 }); return; }
    if (OFFER) type(L8({ text: OFFER, slot: TY.d, wt: TY.w, size: LOOK === 'sharp' ? 110 : 80, w: 940, y, color: tone === 'light' ? OR : INK, anim: { in: 'punch', out: 'none', loop: 'pulse', loopAmt: 0.25 }, t0: 0.7 }), t);
    else K7.need('your offer', W / 2, y, 30, { align: 'center', col: INK });
    if (OFFSUB) txt(OFFSUB, W / 2, y + 70, 26, { col: SUBC, a: fa(t, 1.0), ls: 4 });
    ctaBtn(t, y + 148, 1.1);
  }
  // ------------------------------------------------------------------ render
  function render(t) {
    FT = t;
    BACKDROP(() => { if (VID.collecting) return; const c = G(); c.fillStyle = BARC; c.fillRect(-20, -20, W + 40, H + 40); D(); });
    const k = Math.min(N - 1, Math.floor(t / SD)), lt = t - k * SD, full = vert(S[k]);
    if (k > 0 && lt < 0.25) cut(full === vert(S[k - 1]) ? 'push' : 'dissolve', t, k * SD, 0.5, drawShot(k - 1), drawShot(k), { dir: 'left' }); else drawShot(k)();
    bars(t, full);
    if (V === 'side') sideRibbon(t);
    if (V === 'frame') { topLogo(t); contactBlock(t, BY1 + 76); }
    else if (V === 'headline') { topHeadline(t, HEAD, KICK); ctaBtn(t, BY1 + 82, 0.8); const row = [CONTACT.phone, CONTACT.web ? up(CONTACT.web) : ''].filter(Boolean); if (row.length) txt(row.join('   ·   '), W / 2, BY1 + 214, 30, { col: SUBC, a: fa(t, 1.1), ls: 2 }); }
    else if (V === 'contact') { topLogo(t, { y: 390, lw: 460, lh: 140, tag: false }); txt(TAGLINE, W / 2, 506, 24, { col: SUBC, ls: 5, a: fa(t, 0.6) }); ctaBtn(t, BY1 + 72, 0.8); contactBlock(t, BY1 + 180, { big: 50 }); }
    else if (V === 'message') { topLogo(t); msgPanel(t, full ? [0, BAND[1], W, BAND[3]] : BAND); contactBlock(t, BY1 + 76); }
    else if (V === 'side') { topLogo(t, { y: 360 }); contactBlock(t, BY1 + 86); }
    else if (V === 'special') { topLogo(t, { tag: true }); specialBlock(t); }
    else if (V === 'offer') { topHeadline(t, HEAD, up(BRAND.short || BRAND.name)); offerBlock(t); }
    licTop(t);
  }
  const MUS = { frame: ['pulse', 112], headline: ['drive', 104], contact: ['minimal', 100], message: ['build', 108], side: ['indie', 100], special: ['lofi', 90], offer: ['bounce', 120] }[V] || ['pulse', 112];
  DIR = {
    dur: DUR, bg: BARC, bgSwap: true, finish: { vig: 0, grain: 0.05 }, edl: [], shakes: [], preload: () => K3.init(), render,
    cues() { const ev = [['whoosh', 0.02, 0.32, -0.2], ['whoosh', 0.12, 0.3, 0.2], ['pop', 0.35, 0.28, 0], ['tick', 0.7, 0.22, -0.3], ['tick', 0.9, 0.22, 0.3]];
      for (let k = 1; k < N; k++) ev.push(['swish', k * SD - 0.12, 0.22, k % 2 ? 0.3 : -0.3]); if (V === 'offer' || V === 'headline' || V === 'contact') ev.push(['pop', 1.2, 0.25, 0]);
      return { dur: DUR, beds: [['music', 0, DUR, 0.95, { style: MUS[0], bpm: MUS[1], key: 0, end: DUR - 0.6 }]], events: ev }; },
    brand: V,
  };
});
