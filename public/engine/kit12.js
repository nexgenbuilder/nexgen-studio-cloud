'use strict';
/* Brand pieces (V18, Nov 8): the brand kit as overlay graphics for the timeline editor. Requires kit8 (K8) and kit9 (K9).
   Each piece fills itself from the brand kit (logo, colours, phone, website, area, call to action, licence) and is an ordinary
   motion-graphic layer {kind:'mg', type:'bk_…'}, so it can be placed, animated and keyframed, and it draws in the preview and
   the export with the same code. Facts are never invented: an offer stays a "+ ADD" marker until typed, offers are off where
   the brand kit turns them off (DPG), and the licence line only reads the brand kit's licence.
   Like every kit 9 element, each draws centred on the current origin and never resets the canvas transform.
   With nx-brandbar.js the pieces snap to spots that follow the split screen (top, either half, the split line, bottom, corners). */
(() => {
  if (typeof K9 === 'undefined' || typeof K8 === 'undefined') return;
  K9.CATS.push(['bkit', 'Brand pieces']);
  const def = (id, o) => { if (K9.EL[id]) return; o.id = id; o.cat = 'bkit'; o.d = o.d || 4; o.fields = o.fields || []; o.ex = o.ex || {}; o.defs = {}; o.fields.forEach(f => (o.defs[f[0]] = f[3])); K9.EL[id] = o; K9.ORDER.push(id); };
  const val = (L, k) => { const e = K9.EL[L.type]; let x = L[k]; if (x === undefined || x === null) x = e && e.defs[k]; return typeof x === 'function' ? x() : x; };
  const str = (L, k) => { const x = val(L, k); return x == null ? '' : String(x).trim(); };
  const up = s => String(s || '').toUpperCase();
  const tw = (s, wt, size, fam, ls) => textW(s, F(wt, size, fam), ls || 0);
  const fit = (s, wt, fam, maxW, maxS, ls) => { if (!s) return maxS; const w0 = textW(s, F(wt, 100, fam), 0); return Math.min(maxS, 100 * Math.max(10, maxW - (ls || 0) * s.length) / Math.max(1, w0)); };   // letter spacing stays in px
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, Math.max(0, h), Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2))); };
  const famOf = (L, slot) => (L.font && window.NX && NX.fontFamily ? NX.fontFamily(L.font) : null) || slot;
  const tx = (s, x, y, o) => K9.tx(s, x, y, o);
  const PH = new Path2D('M6.6 3.5h3.2l1.7 4.3-2.2 1.4a11.5 11.5 0 005.5 5.5l1.4-2.2 4.3 1.7v3.2a2 2 0 01-2.2 2A16.6 16.6 0 014.6 5.7a2 2 0 012-2.2z');
  const GLOBE = new Path2D('M12 3a9 9 0 100 18 9 9 0 000-18zM3.4 12h17.2M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9M12 3C9.6 5.5 8.4 8.5 8.4 12s1.2 6.5 3.6 9');
  const PIN = new Path2D('M12 21s-6-5.6-6-11a6 6 0 0112 0c0 5.4-6 11-6 11zM12 12.4a2.4 2.4 0 100-.01');
  function glyph(p, x, y, s, col, fill) { const c = ctx; c.save(); c.translate(x, y); c.scale(s / 24, s / 24); c.translate(-12, -12); if (fill) { c.fillStyle = col; c.fill(p); } else { c.strokeStyle = col; c.lineWidth = 2.2; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(p); } c.restore(); }
  const BANDS = [['glass', 'Glass'], ['solid', 'Ink'], ['brand', 'Brand colour'], ['clear', 'No band']];
  const inkOn = band => (band === 'brand' ? K8.onCol(OR) : WHT);
  const lightOn = band => band === 'brand' && K8.onCol(OR) !== '#FFFFFF';
  // a band behind a piece, wiping in from the left; k = 0..1
  function bandBg(band, w, h, k, a) {
    if (band === 'clear' || k <= 0) return; const c = ctx; c.save(); c.globalAlpha *= a; c.beginPath(); c.rect(-w / 2, -h / 2 - 2, w * k, h + 4); c.clip();
    c.fillStyle = band === 'glass' ? 'rgba(10,10,14,0.64)' : band === 'brand' ? OR : BLK; c.fillRect(-w / 2, -h / 2, w, h);
    if (band !== 'brand') { c.fillStyle = OR; c.fillRect(-w / 2, h / 2 - 6, w, 6); }
    c.restore();
  }
  // the brand's logo inside a box (light version on dark, dark on light); falls back to the name when there is no logo
  function logo(cx, cy, maxW, maxH, onLight, a) {
    const img = onLight ? (IMG.logoB || IMG.logoW) : (IMG.logoW || IMG.logoB), c = ctx;
    if (img && img.width) { const ar = img.height / img.width, w = Math.min(maxW, maxH / ar), h = w * ar; c.save(); c.globalAlpha *= a; c.drawImage(img, cx - w / 2, cy - h / 2, w, h); c.restore(); return w; }
    const n = up(BRAND.short || BRAND.name || 'YOUR BRAND'), fs = fit(n, 900, 'Mont', maxW, maxH * 0.7, 2); tx(n, cx, cy + fs * 0.36, { size: fs, wt: 900, ls: 2, col: onLight ? BLK : WHT, a }); return tw(n, 900, fs, 'Mont', 2);
  }
  const logoW = (maxW, maxH) => { const img = IMG.logoW || IMG.logoB; if (img && img.width) return Math.min(maxW, maxH / (img.height / img.width)); return Math.min(maxW, maxH * 3); };
  const env = s => E.outC(s.p) * (1 - E.inC(s.q));

  // ------------------------------------------------------------------ logo bar
  def('bk_logobar', { name: 'Logo bar', desc: 'Your logo on a band across the screen, with a short line under it. From the brand kit.', d: 6, ex: { line: 'Award-winning design & build.' },
    fields: [['line', 'Line under the logo', 'text', () => (typeof CONTACT !== 'undefined' && CONTACT.tagline) || '', { max: 44 }], ['band', 'Band', 'seg', 'glass', BANDS], ['align', 'Logo', 'seg', 'center', [['center', 'Centred'], ['left', 'Left']]]],
    box: () => [-540, -112, 1080, 224],
    draw(L, s) { const band = str(L, 'band') || 'glass', line = str(L, 'line'), k = E.outC(clamp(s.p * 1.2)), a = 1 - E.inC(s.q), on = lightOn(band), left = str(L, 'align') === 'left';
      bandBg(band, 1080, 224, k, a); const la = clamp((s.lt - 0.2) / 0.4) * a, ly = line ? -26 : 0, lh = line ? 112 : 150, lw = logoW(left ? 520 : 760, lh);
      logo(left ? -450 + lw / 2 : 0, ly + (1 - E.outC(clamp((s.lt - 0.2) / 0.5))) * 16, left ? 520 : 760, lh, on, la);
      if (line) { const t = up(line), fs = fit(t, 700, famOf(L, 'Mont'), 900, 27, 5); tx(t, left ? -450 : 0, 74, { size: fs, wt: 700, fam: famOf(L, 'Mont'), ls: 5, col: band === 'brand' ? inkOn(band) : OR, align: left ? 'left' : 'center', a: clamp((s.lt - 0.45) / 0.4) * a }); }
    } });

  // ------------------------------------------------------------------ contact bar
  const contactItems = (L, wantArea) => { const sh = str(L, 'show') || 'pw', it = [];
    if (sh !== 'w' && CONTACT.phone) it.push([PH, CONTACT.phone, true]); if (sh !== 'p' && CONTACT.web) it.push([GLOBE, up(CONTACT.web), false]);
    if (wantArea && sh === 'pwa' && CONTACT.area) it.push([PIN, up(CONTACT.area), false]); return it; };
  def('bk_contact', { name: 'Contact bar', desc: 'Phone and website on a band, from the brand kit. Add the area if you like.', d: 4, ex: {},
    fields: [['show', 'Show', 'seg', 'pw', [['pw', 'Phone & website'], ['p', 'Phone'], ['w', 'Website'], ['pwa', '+ area']]], ['band', 'Band', 'seg', 'glass', BANDS]],
    box: L => [-540, str(L, 'show') === 'pwa' ? -95 : -75, 1080, str(L, 'show') === 'pwa' ? 190 : 150],
    draw(L, s) { const band = str(L, 'band') || 'glass', two = str(L, 'show') === 'pwa', h = two ? 190 : 150, k = E.outC(clamp(s.p * 1.2)), a = 1 - E.inC(s.q), col = inkOn(band), acc = band === 'brand' ? col : OR, fam = famOf(L, 'Mont');
      bandBg(band, 1080, h, k, a); const row = contactItems(L, false), ta = clamp((s.lt - 0.25) / 0.4) * a, y0 = two ? -22 : 0;
      if (!row.length) { K9.need('phone or website in the brand kit', 0, y0, 30, { raw: true }); }
      else { const cw = 900 / row.length; row.forEach(([g, t, big], i) => { const cx = -450 + cw * (i + 0.5), fs = fit(t, big ? 800 : 700, fam, cw - 80, big ? 46 : 32, big ? 1 : 3), w = tw(t, big ? 800 : 700, fs, fam, big ? 1 : 3) + 52;
        glyph(g, cx - w / 2 + 16, y0, big ? 34 : 28, acc, g === PH); tx(t, cx - w / 2 + 52, y0 + fs * 0.36, { size: fs, wt: big ? 800 : 700, fam, ls: big ? 1 : 3, col, align: 'left', a: ta }); }); }
      if (two && CONTACT.area) { const t = up(CONTACT.area), fs = fit(t, 700, fam, 760, 24, 4), w = tw(t, 700, fs, fam, 4) + 40; glyph(PIN, -w / 2 + 12, 52, 24, acc); tx(t, -w / 2 + 40, 52 + fs * 0.36, { size: fs, wt: 700, fam, ls: 4, col, align: 'left', a: ta * 0.9 }); }
    } });

  // ------------------------------------------------------------------ offer bar
  def('bk_offer', { name: 'Offer bar', desc: 'A ribbon with your real offer and its end date. Stays a marker until you type it; off where the brand kit turns offers off.', d: 4, ex: { offer: '15% OFF YOUR FIRST VISIT', sub: 'ENDS SUNDAY' },
    fields: [['offer', 'Your offer', 'text', '', { req: 'offer', max: 30 }], ['sub', 'Details or end date', 'text', '', { max: 40 }], ['band', 'Band', 'seg', 'brand', [['brand', 'Brand colour'], ['solid', 'Ink'], ['glass', 'Glass']]]],
    box: () => [-540, -95, 1080, 190],
    draw(L, s) { if (!K9.allowed('discount')) { K9.need('Offers are off for this brand (brand kit rules)', 0, 0, 28, { raw: true }); return; }
      const band = str(L, 'band') || 'brand', offer = up(str(L, 'offer')), sub = up(str(L, 'sub')), k = E.outC(clamp(s.p * 1.2)), a = 1 - E.inC(s.q), col = inkOn(band), fam = famOf(L, 'Mont');
      bandBg(band, 1080, 190, k, a); const c = ctx, tagW = 150;
      c.save(); c.globalAlpha *= a * clamp((s.lt - 0.15) / 0.3); c.fillStyle = band === 'brand' ? K8.rgba(col, 0.16) : OR; rr(-480, -36, tagW, 72, 12); c.fill(); c.restore();
      tx('OFFER', -480 + tagW / 2, 11, { size: 28, wt: 800, fam, ls: 4, col: band === 'brand' ? col : K8.onCol(OR), a: a * clamp((s.lt - 0.15) / 0.3) });
      if (!offer) { K9.need('offer', 90, 0, 34); return; }
      const pk = E.outBack(clamp((s.lt - 0.3) / 0.45)), fs = fit(offer, 900, fam, 640, 64, 1); c.save(); c.translate(90, sub ? -12 : 0); c.scale(pk, pk); tx(offer, 0, fs * 0.36, { size: fs, wt: 900, fam, ls: 1, col, a }); c.restore();
      if (sub) { const f2 = fit(sub, 700, fam, 640, 26, 4); tx(sub, 90, 56, { size: f2, wt: 700, fam, ls: 4, col: band === 'brand' ? K8.rgba(col, 0.85) : 'rgba(255,255,255,0.85)', a: a * clamp((s.lt - 0.6) / 0.4) }); }
    } });

  // ------------------------------------------------------------------ corner logo
  def('bk_corner', { name: 'Corner logo', desc: 'Your logo, small, in a corner for the whole video.', d: 8, ex: {},
    fields: [['size', 'Size', 'range', 230, [140, 380, 10]], ['back', 'Behind it', 'seg', 'none', [['none', 'Nothing'], ['pill', 'Dark pill'], ['brand', 'Brand pill']]]],
    box: L => { const w = +val(L, 'size') || 230, maxH = w * 0.45, lw = logoW(w, maxH), h = maxH + (str(L, 'back') !== 'none' ? 36 : 0); return [-lw / 2 - 26, -h / 2, lw + 52, h]; },
    draw(L, s) { const w = +val(L, 'size') || 230, back = str(L, 'back') || 'none', a = clamp(s.p * 2) * (1 - E.inC(s.q)), maxH = w * 0.45, lw = logoW(w, maxH), c = ctx;
      if (back !== 'none') { const bh = maxH + 36; c.save(); c.globalAlpha *= a * 0.92; c.fillStyle = back === 'brand' ? OR : 'rgba(10,10,14,0.7)'; rr(-lw / 2 - 26, -bh / 2, lw + 52, bh, bh / 2); c.fill(); c.restore(); }
      c.save(); if (back === 'none') { c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 14; c.shadowOffsetY = 2; } logo(0, 0, w, maxH, back === 'brand' && K8.onCol(OR) !== '#FFFFFF', a); c.restore();
    } });

  // ------------------------------------------------------------------ side ribbon
  def('bk_ribbon', { name: 'Side ribbon', desc: 'A brand-colour ribbon down the edge with your name and phone.', d: 8, ex: {},
    fields: [['text', 'Ribbon text', 'text', () => up((typeof BRAND !== 'undefined' && (BRAND.short || BRAND.name)) || ''), { max: 26 }], ['phone', 'Add the phone', 'seg', 'yes', [['yes', 'Yes'], ['no', 'No']]]],
    box: () => [-58, -960, 116, 1920],
    draw(L, s) { const c = ctx, k = E.outC(clamp(s.p * 1.3)), a = 1 - E.inC(s.q), col = K8.onCol(OR), fam = famOf(L, 'Mont');
      c.save(); c.globalAlpha *= a; c.fillStyle = OR; c.fillRect(-58, -960, 116, 1920 * k); c.restore();
      if (k < 0.6) return; const t = [str(L, 'text'), str(L, 'phone') !== 'no' ? CONTACT.phone : ''].filter(Boolean).join('   ·   '); if (!t) return;
      const fs = fit(up(t), 800, fam, 1300, 34, 6); c.save(); c.rotate(-Math.PI / 2); tx(up(t), 0, fs * 0.36, { size: fs, wt: 800, fam, ls: 6, col, a: a * clamp((s.lt - 0.35) / 0.4) }); c.restore();
    } });

  // ------------------------------------------------------------------ licence line
  def('bk_licence', { name: 'Licence line', desc: 'The licence number from the brand kit, small and clean.', d: 8, ex: {},
    fields: [['back', 'Behind it', 'seg', 'pill', [['pill', 'Dark pill'], ['none', 'Nothing']]]],
    box: () => { const t = CONTACT.lic || '+ ADD LICENCE IN THE BRAND KIT', w = Math.min(1000, tw(up(t), 700, 24, 'Mont', 3) + 64); return [-w / 2, -30, w, 60]; },
    draw(L, s) { const t = up(CONTACT.lic), a = clamp(s.p * 2) * (1 - E.inC(s.q)); if (!t) { K9.need('licence in the brand kit', 0, 0, 26, { raw: true }); return; }
      const w = tw(t, 700, 24, 'Mont', 3) + 64; if (str(L, 'back') !== 'none') { const c = ctx; c.save(); c.globalAlpha *= a * 0.9; c.fillStyle = 'rgba(10,10,14,0.66)'; rr(-w / 2, -28, w, 56, 28); c.fill(); c.restore(); }
      tx(t, 0, 9, { size: 24, wt: 700, ls: 3, col: 'rgba(255,255,255,0.92)', a, shadow: str(L, 'back') === 'none' ? 'rgba(0,0,0,0.6)' : undefined });
    } });

  // ------------------------------------------------------------------ split-line label
  def('bk_seam', { name: 'Split-line label', desc: 'A label on the line between the halves: your name on a pill, a full bar, or two labels (before and after).', d: 8, ex: { style: 'pair', text: 'BEFORE', text2: 'AFTER' },
    fields: [['style', 'Style', 'seg', 'pill', [['pill', 'Pill'], ['bar', 'Full bar'], ['pair', 'Two labels']]], ['text', 'Label', 'text', () => up((typeof BRAND !== 'undefined' && (BRAND.short || BRAND.name)) || ''), { max: 30 }], ['text2', 'Second label (two labels)', 'text', '', { max: 24 }], ['tone', 'Colour', 'seg', 'brand', [['brand', 'Brand colour'], ['ink', 'Ink'], ['white', 'White']]]],
    box: L => { const st = str(L, 'style') || 'pill'; if (st === 'bar') return [-540, -46, 1080, 92]; if (st === 'pair') return [-540, -122, 1080, 244]; const w = Math.min(980, tw(up(str(L, 'text')) || 'LABEL', 800, 40, 'Mont', 4) + 110); return [-w / 2, -48, w, 96]; },
    draw(L, s) { const st = str(L, 'style') || 'pill', t1 = up(str(L, 'text')), t2 = up(str(L, 'text2')), a = 1 - E.inC(s.q), fam = famOf(L, 'Mont'), c = ctx, tone = str(L, 'tone'), FILL = tone === 'ink' ? BLK : tone === 'white' ? WHT : OR, fg = K8.onCol(FILL);
      if (st === 'bar') { const k = E.outC(clamp(s.p * 1.2)); c.save(); c.globalAlpha *= a; c.beginPath(); c.rect(-540, -50, 1080 * k, 100); c.clip(); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 18; c.fillStyle = FILL; c.fillRect(-540, -46, 1080, 92); c.restore();
        if (t1) { const fs = fit(t1, 800, fam, 900, 40, 6); tx(t1, 0, fs * 0.36, { size: fs, wt: 800, fam, ls: 6, col: fg, a: a * clamp((s.lt - 0.3) / 0.3) }); } return; }
      if (st === 'pair') { const lab = (t, x, y, d) => { if (!t) return; const fs = fit(t, 800, fam, 420, 44, 5), w = tw(t, 800, fs, fam, 5) + 64, k = E.outBack(clamp((s.lt - d) / 0.4)); if (k <= 0) return;
          c.save(); c.translate(x, y); c.scale(k, k); c.save(); c.globalAlpha *= a; c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 16; c.fillStyle = FILL; rr(-w / 2, -38, w, 76, 12); c.fill(); c.restore(); tx(t, 0, fs * 0.36, { size: fs, wt: 800, fam, ls: 5, col: fg, a }); c.restore(); };
        c.save(); c.globalAlpha *= a * clamp(s.p * 2); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillRect(-540, -3, 1080, 6); c.restore();
        lab(t1 || 'BEFORE', -260, -66, 0.1); lab(t2 || 'AFTER', 260, 66, 0.35); return; }
      const lab = t1 || 'LABEL', fs = fit(lab, 800, fam, 860, 40, 4), w = tw(lab, 800, fs, fam, 4) + 110, k = E.outBack(clamp(s.p * 1.3)); if (k <= 0) return;
      c.save(); c.scale(k, k); c.save(); c.globalAlpha *= a; c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 20; c.fillStyle = FILL; rr(-w / 2, -44, w, 88, 44); c.fill(); c.restore(); tx(lab, 0, fs * 0.36, { size: fs, wt: 800, fam, ls: 4, col: fg, a }); c.restore();
    } });

  K9.BRAND_PIECES = ['bk_logobar', 'bk_contact', 'cta', 'bk_offer', 'bk_corner', 'bk_ribbon', 'bk_licence', 'bk_seam', 'lower'];
})();
