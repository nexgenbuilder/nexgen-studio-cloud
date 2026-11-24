'use strict';
/* Motion kit 17 (V27, Nov 15): contact and branding everywhere.
   - Brand kit now also holds a street address, email, hours and social handles (Instagram, Facebook, TikTok, YouTube, X, WhatsApp).
   - Seven new brand pieces (Brand tab): Address line, Socials, Website & email, Hours chip, Contact card, Info strip
     (logo + phone + a second line as one top or lower banner) and Info card (a heading, a big line, a price and a note,
     with the logo and contact built in). Each fills itself from the brand kit and sits on any spot.
   - K17.fields() / K17.top(): a "Logo" position (top bar, top left, top right, off) and an optional contact strip for the
     dealership and 3D templates.
   Social networks show the icon uploaded for them in the Brand tab; until one is uploaded, a lettered badge (IG, FB, TT, YT, X, WA). */
const K17 = (() => {
  const C = CONTACT, up = s => String(s || '').toUpperCase();
  const val = (L, k) => (L[k] !== undefined && L[k] !== null && L[k] !== '' ? L[k] : ((K9.EL[L.type] || { defs: {} }).defs[k]));
  const str = (L, k) => { const x = val(L, k); return x == null ? '' : String(x).trim(); };
  const tw = (s, wt, size, fam, ls) => textW(s, F(wt, size, fam), ls || 0), tx = (s, x, y, o) => K9.tx(s, x, y, o);
  const fit = (s, wt, fam, maxW, maxS, ls) => { if (!s) return maxS; const w0 = textW(s, F(wt, 100, fam), 0); return Math.min(maxS, 100 * Math.max(10, maxW - (ls || 0) * s.length) / Math.max(1, w0)); };
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, Math.max(0, h), Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2))); };
  const PH = new Path2D('M6.6 3.5h3.2l1.7 4.3-2.2 1.4a11.5 11.5 0 005.5 5.5l1.4-2.2 4.3 1.7v3.2a2 2 0 01-2.2 2A16.6 16.6 0 014.6 5.7a2 2 0 012-2.2z');
  const GLOBE = new Path2D('M12 3a9 9 0 100 18 9 9 0 000-18zM3.4 12h17.2M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9M12 3C9.6 5.5 8.4 8.5 8.4 12s1.2 6.5 3.6 9');
  const PIN = new Path2D('M12 21s-6-5.6-6-11a6 6 0 0112 0c0 5.4-6 11-6 11zM12 12.4a2.4 2.4 0 100-.01');
  const MAIL = new Path2D('M3.5 6h17v12h-17zM3.5 7l8.5 6.5L20.500 7'), CLOCK = new Path2D('M12 3a9 9 0 100 18 9 9 0 000-18zM12 7.500v4.800l3.200 1.900');
  function glyph(p, x, y, s, col, fill) { const c = ctx; c.save(); c.translate(x, y); c.scale(s / 24, s / 24); c.translate(-12, -12); if (fill) { c.fillStyle = col; c.fill(p); } else { c.strokeStyle = col; c.lineWidth = 2.2; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(p); } c.restore(); }
  const handle = (k, v) => { v = String(v || '').trim(); if (!v) return ''; return (k === 'ig' || k === 'tt' || k === 'yt' || k === 'x') && !/^@/.test(v) && !/[\/. ]/.test(v) ? '@' + v : v; };
  const ICONS = {};   // V28: icons the user uploads in the Brand tab (key -> { img, clear }); without one a lettered badge is drawn
  const socials = () => [['IG', 'ig'], ['FB', 'fb'], ['TT', 'tt'], ['YT', 'yt'], ['X', 'x'], ['WA', 'wa']].map(([b, k]) => ({ badge: b, key: k, t: handle(k, C[k]) })).filter(x => x.t);
  const IT = { phone: () => C.phone && { g: PH, fill: true, t: C.phone }, web: () => C.web && { g: GLOBE, t: C.web }, email: () => C.email && { g: MAIL, t: up(C.email) }, address: () => C.address && { g: PIN, t: up(C.address) }, area: () => C.area && { g: PIN, t: up(C.area) }, hours: () => C.hours && { g: CLOCK, t: up(C.hours) } };
  const items = keys => keys.map(k => IT[k]()).filter(Boolean);
  // one centred line of icon + text items; shrinks to fit maxW
  function row(list, cx, y, maxW, size, o) {
    if (!list.length) return 0; const fam = o.fam || 'Mont', wt = o.wt || 700, ls = o.ls === undefined ? 2 : o.ls, a = o.a === undefined ? 1 : o.a, wOf = z => list.reduce((s, it) => s + z * 1.55 + tw(it.t, wt, z, fam, ls), 0) + (list.length - 1) * z * 1.1;
    let z = size; const w0 = wOf(z); if (w0 > maxW) z = Math.max(12, z * maxW / w0); const w = wOf(z); let x = o.align === 'left' ? cx : cx - w / 2; const c = ctx;
    for (const it of list) { const i2 = z * 1.15; const ic = it.badge && ICONS[it.key]; c.save(); c.globalAlpha *= a; if (ic) { const r = i2 * 0.66, im = ic.img, k2 = Math.min(2 * r / im.width, 2 * r / im.height) * (ic.clear ? 1 : 0.92); c.beginPath(); c.roundRect(x + i2 / 2 - r, y - r, 2 * r, 2 * r, r * 0.42); c.clip(); if (!ic.clear) { c.fillStyle = '#fff'; c.fillRect(x + i2 / 2 - r, y - r, 2 * r, 2 * r); } c.imageSmoothingQuality = 'high'; c.drawImage(im, x + i2 / 2 - im.width * k2 / 2, y - im.height * k2 / 2, im.width * k2, im.height * k2); } else if (it.badge) { c.fillStyle = o.acc; c.beginPath(); c.arc(x + i2 / 2, y, i2 * 0.62, 0, 7); c.fill(); } else glyph(it.g, x + i2 / 2, y, i2, o.acc, it.fill); c.restore();
      if (it.badge && !ic) tx(it.badge, x + i2 / 2, y + z * 0.2, { size: z * 0.56, wt: 900, fam: 'Mont', col: K8.onCol(o.acc), a });
      x += z * 1.55; tx(it.t, x, y + z * 0.36, { size: z, wt, fam, ls, col: o.col, align: 'left', a }); x += tw(it.t, wt, z, fam, ls) + z * 1.1; }
    return w;
  }
  const BANDS = [['glass', 'Glass'], ['solid', 'Ink'], ['brand', 'Brand colour'], ['clear', 'No band']], inkOn = band => (band === 'brand' ? K8.onCol(OR) : WHT), accOn = band => (band === 'brand' ? K8.onCol(OR) : OR);
  function bandBg(band, w, h, k, a) { if (band === 'clear' || k <= 0) return; const c = ctx; c.save(); c.globalAlpha *= a; c.beginPath(); c.rect(-w / 2, -h / 2 - 2, w * k, h + 4); c.clip(); c.fillStyle = band === 'glass' ? 'rgba(10,10,14,0.64)' : band === 'brand' ? OR : BLK; c.fillRect(-w / 2, -h / 2, w, h); if (band !== 'brand') { c.fillStyle = OR; c.fillRect(-w / 2, h / 2 - 6, w, 6); } c.restore(); }
  function logo(cx, cy, maxW, maxH, onLight, a, align) { const img = onLight ? (IMG.logoB || IMG.logoW) : (IMG.logoW || IMG.logoB), c = ctx;
    if (img && img.width) { const ar = img.height / img.width, w = Math.min(maxW, maxH / ar), h = w * ar, x = align === 'left' ? cx : cx - w / 2; c.save(); c.globalAlpha *= a; c.drawImage(img, x, cy - h / 2, w, h); c.restore(); return w; }
    const n = up(BRAND.short || BRAND.name || 'YOUR BRAND'), fs = fit(n, 900, 'Mont', maxW, maxH * 0.62, 2); tx(n, cx, cy + fs * 0.36, { size: fs, wt: 900, ls: 2, col: onLight ? BLK : WHT, a, align: align === 'left' ? 'left' : 'center' }); return tw(n, 900, fs, 'Mont', 2); }
  const TONES = [['light', 'Light'], ['dark', 'Dark'], ['brand', 'Brand colour'], ['glass', 'Glass']];
  const tone = k => (k === 'dark' ? { bg: 'rgba(12,12,16,0.94)', fg: WHT, acc: OR, light: false } : k === 'brand' ? { bg: OR, fg: K8.onCol(OR), acc: K8.onCol(OR), light: K8.onCol(OR) !== '#FFFFFF' } : k === 'glass' ? { bg: 'rgba(10,10,14,0.62)', fg: WHT, acc: OR, light: false } : { bg: '#FFFFFF', fg: '#14141A', acc: OR, light: true });
  function panel(x, y, w, h, T, a) { const c = ctx; c.save(); c.globalAlpha *= a; c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 36; c.shadowOffsetY = 12; c.fillStyle = T.bg; rr(x, y, w, h, 28); c.fill(); c.restore(); }
  const need = s => K9.need(s, 0, 0, 30, { raw: true });

  // ------------------------------------------------------------------ the pieces
  const def = (id, o) => { if (K9.EL[id]) return; o.id = id; o.cat = 'bkit'; o.d = o.d || 5; o.fields = o.fields || []; o.ex = o.ex || {}; o.defs = {}; o.fields.forEach(f => (o.defs[f[0]] = f[3])); K9.EL[id] = o; K9.ORDER.push(id); if (K9.BRAND_PIECES && !K9.BRAND_PIECES.includes(id)) K9.BRAND_PIECES.push(id); };
  const bar = (keysOf, miss) => ({ box: L => { const n = keysOf(L).length; return [-540, n > 1 ? -92 : -62, 1080, n > 1 ? 184 : 124]; },
    draw(L, s) { const band = str(L, 'band') || 'glass', lines = keysOf(L).map(k => (k === 'social' ? socials() : items(k))).filter(l => l.length), h = keysOf(L).length > 1 ? 184 : 124, k = E.outC(clamp(s.p * 1.2)), a = 1 - E.inC(s.q), ta = clamp((s.lt - 0.25) / 0.4) * a;
      bandBg(band, 1080, h, k, a); if (!lines.length) { need(miss); return; } lines.forEach((l, i) => row(l, 0, (i - (lines.length - 1) / 2) * 62, 980, lines.length > 1 ? 30 : 34, { col: inkOn(band), acc: accOn(band), a: ta })); } });
  def('bk_address', Object.assign({ name: 'Address line', desc: 'Your street address on a band, from the brand kit. Add the hours if you like.', fields: [['show', 'Show', 'seg', 'a', [['a', 'Address'], ['ah', 'Address + hours'], ['h', 'Hours']]], ['band', 'Band', 'seg', 'glass', BANDS]] },
    bar(L => ({ a: [['address']], ah: [['address'], ['hours']], h: [['hours']] }[str(L, 'show') || 'a']), 'address in the brand kit')));
  def('bk_web', Object.assign({ name: 'Website & email', desc: 'Your website, your email, or both on a band, from the brand kit.', fields: [['show', 'Show', 'seg', 'we', [['we', 'Website & email'], ['w', 'Website'], ['e', 'Email']]], ['band', 'Band', 'seg', 'glass', BANDS]] },
    bar(L => ({ we: [['web', 'email']], w: [['web']], e: [['email']] }[str(L, 'show') || 'we']), 'website or email in the brand kit')));
  def('bk_social', { name: 'Socials', desc: 'Your social handles from the brand kit: a row across the screen, or a small stack for a corner.', fields: [['look', 'Look', 'seg', 'row', [['row', 'Row'], ['stack', 'Stacked']]], ['band', 'Band', 'seg', 'glass', BANDS]],
    box: L => { if (str(L, 'look') !== 'stack') return [-540, -62, 1080, 124]; const n = Math.max(1, socials().length), w = Math.min(560, Math.max(260, ...socials().map(x => tw(x.t, 700, 30, 'Mont', 2) + 110))); return [-w / 2, -(n * 62 + 36) / 2, w, n * 62 + 36]; },
    draw(L, s) { const band = str(L, 'band') || 'glass', list = socials(), a = 1 - E.inC(s.q), k = E.outC(clamp(s.p * 1.2)), ta = clamp((s.lt - 0.25) / 0.4) * a; if (!list.length) { bandBg(band, 1080, 124, k, a); need('social handles in the brand kit'); return; }
      if (str(L, 'look') !== 'stack') { bandBg(band, 1080, 124, k, a); row(list, 0, 0, 980, 32, { col: inkOn(band), acc: accOn(band), a: ta }); return; }
      const b = K9.EL.bk_social.box(L), c = ctx; if (band !== 'clear') { c.save(); c.globalAlpha *= a * k; c.fillStyle = band === 'glass' ? 'rgba(10,10,14,0.64)' : band === 'brand' ? OR : BLK; rr(b[0], b[1], b[2], b[3], 26); c.fill(); c.restore(); }
      list.forEach((it, i) => row([it], b[0] + 30, b[1] + 18 + 31 + i * 62, b[2] - 60, 30, { col: inkOn(band), acc: accOn(band), a: clamp((s.lt - 0.2 - i * 0.08) / 0.35) * a, align: 'left' })); } });
  def('bk_hours', { name: 'Hours chip', desc: 'Your opening hours on a small pill, from the brand kit. Sits well in a corner.', fields: [['back', 'Pill', 'seg', 'dark', [['dark', 'Dark'], ['brand', 'Brand colour'], ['light', 'Light']]]],
    box: () => { const t = up(C.hours || 'YOUR HOURS'), w = Math.min(820, tw(t, 700, 30, 'Mont', 2) + 120); return [-w / 2, -40, w, 80]; },
    draw(L, s) { if (!C.hours) { need('hours in the brand kit'); return; } const b = K9.EL.bk_hours.box(L), T = tone(str(L, 'back') === 'brand' ? 'brand' : str(L, 'back') === 'light' ? 'light' : 'dark'), a = clamp(s.p * 2) * (1 - E.inC(s.q)), c = ctx, k = 0.7 + 0.3 * E.outC(clamp(s.p));
      c.save(); c.scale(k, k); c.globalAlpha *= a; c.fillStyle = T.bg; rr(b[0], b[1], b[2], b[3], 40); c.fill(); c.restore(); row(items(['hours']), 0, 0, b[2] - 60, 30, { col: T.fg, acc: T.acc, a }); } });
  const cardRows = L => { const sh = str(L, 'items') || 'all', r = (sh === 'main' ? ['phone', 'web', 'address'] : sh === 'social' ? ['web'] : ['phone', 'web', 'email', 'address', 'hours']).map(k => IT[k]()).filter(Boolean); return sh === 'main' ? r : r.concat(socials()); };
  def('bk_card', { name: 'Contact card', desc: 'Everything a customer needs on one card: logo, phone, website, email, address, hours and socials. Lines the brand kit leaves empty are dropped. Sits in a corner or the middle.', d: 5,
    fields: [['items', 'Show', 'seg', 'all', [['all', 'Everything'], ['main', 'Phone, web, address'], ['social', 'Web & socials']]], ['logo', 'Logo', 'seg', 'on', [['on', 'On'], ['off', 'Off']]], ['tone', 'Card', 'seg', 'light', TONES], ['size', 'Size', 'range', 1, [0.6, 1.5, 0.05]]],
    box: L => { const z = +val(L, 'size') || 1, n = Math.max(1, cardRows(L).length), h = (n * 60 + 56 + (str(L, 'logo') !== 'off' ? 120 : 0)) * z, w = 600 * z; return [-w / 2, -h / 2, w, h]; },
    draw(L, s) { const list = cardRows(L), z = +val(L, 'size') || 1, T = tone(str(L, 'tone') || 'light'), hasLogo = str(L, 'logo') !== 'off', n = Math.max(1, list.length), h = n * 60 + 56 + (hasLogo ? 120 : 0), a = clamp(s.p * 2.5) * (1 - E.inC(s.q)), k = E.outC(clamp(s.p)), c = ctx;
      c.save(); c.scale(z, z); c.translate(0, (1 - k) * 60); panel(-300, -h / 2, 600, h, T, a); let y = -h / 2 + 28;
      if (hasLogo) { logo(0, y + 54, 440, 84, T.light, a); c.save(); c.globalAlpha *= a * 0.5; c.fillStyle = T.acc; c.fillRect(-250, y + 112, 500, 3); c.restore(); y += 120; }
      if (!list.length) need('contact details in the brand kit'); list.forEach((it, i) => row([it], -256, y + 30 + i * 60, 512, 29, { col: T.fg, acc: T.acc, a: clamp((s.lt - 0.2 - i * 0.07) / 0.35) * a, align: 'left' })); c.restore(); } });
  def('bk_strip', { name: 'Info strip', desc: 'A banner for the top or the bottom: your logo with the phone number beside it, and a second line for the address, website, email or socials.', d: 6,
    fields: [['logo', 'Logo', 'seg', 'left', [['left', 'Left'], ['center', 'Centre']]], ['line2', 'Second line', 'seg', 'aw', [['aw', 'Address & website'], ['we', 'Website & email'], ['s', 'Socials'], ['none', 'None']]], ['band', 'Band', 'seg', 'solid', BANDS]],
    box: L => { const h = (str(L, 'line2') || 'aw') === 'none' ? 150 : 216; return [-540, -h / 2, 1080, h]; },
    draw(L, s) { const band = str(L, 'band') || 'solid', l2 = str(L, 'line2') || 'aw', two = l2 !== 'none', h = two ? 216 : 150, k = E.outC(clamp(s.p * 1.2)), a = 1 - E.inC(s.q), ta = clamp((s.lt - 0.2) / 0.4) * a, col = inkOn(band), acc = accOn(band), y1 = two ? -34 : 0, light = band === 'brand' && K8.onCol(OR) !== '#FFFFFF';
      bandBg(band, 1080, h, k, a); const ph = items(['phone']);
      if (str(L, 'logo') === 'center') { logo(0, y1, 420, 92, light, ta); } else { logo(-480, y1, ph.length ? 420 : 900, 92, light, ta, 'left'); if (ph.length) { const z = fit(ph[0].t, 800, 'Mont', 380, 44, 1), w = tw(ph[0].t, 800, z, 'Mont', 1) + z * 1.55; row(ph, 480 - w, y1, 440, z, { col, acc, a: ta, wt: 800, ls: 1, align: 'left' }); } }
      if (two) { const list = l2 === 's' ? socials() : items(l2 === 'we' ? ['web', 'email'] : ['address', 'web']).concat(str(L, 'logo') === 'center' ? ph : []); if (list.length) row(list, 0, 58, 980, 28, { col, acc, a: ta * 0.95 }); } } });
  const infoH = L => 56 + (str(L, 'brand') !== 'off' ? 104 : 0) + (str(L, 'head') ? 56 : 0) + (str(L, 'big') ? 112 : 0) + (str(L, 'price') ? 120 : 0) + (str(L, 'note') ? 52 : 0) + (str(L, 'brand') === 'full' ? 70 : 0);
  def('bk_info', { name: 'Info card', desc: 'A card that joins information with the brand: a heading, a big line, a price and a note, with the logo on top and the phone and website along the bottom. For a daily special, a vehicle, a service or an offer.', d: 6,
    ex: { head: 'TODAY’S SPECIAL', big: 'YOUR ITEM', price: '$0.00', note: 'A short detail' },
    fields: [['head', 'Heading', 'text', '', { max: 26 }], ['big', 'Big line', 'text', '', { max: 30 }], ['price', 'Price or amount', 'text', '', { max: 14 }], ['note', 'Small line', 'text', '', { max: 44 }], ['brand', 'Logo & contact', 'seg', 'full', [['full', 'Logo + contact'], ['logo', 'Logo'], ['off', 'Off']]], ['tone', 'Card', 'seg', 'light', TONES]],
    box: L => { const h = Math.max(180, infoH(L)); return [-420, -h / 2, 840, h]; },
    draw(L, s) { const T = tone(str(L, 'tone') || 'light'), br = str(L, 'brand') || 'full', h = Math.max(180, infoH(L)), a = clamp(s.p * 2.5) * (1 - E.inC(s.q)), k = E.outC(clamp(s.p)), c = ctx, hd = up(str(L, 'head')), big = up(str(L, 'big')), pr = str(L, 'price'), note = str(L, 'note');
      c.save(); c.translate(0, (1 - k) * 80); panel(-420, -h / 2, 840, h, T, a); c.save(); c.globalAlpha *= a; c.fillStyle = T.acc; rr(-420, -h / 2, 16, h, 8); c.fill(); c.restore(); let y = -h / 2 + 28;
      if (!hd && !big && !pr && !note) need('Type the heading and the big line');
      if (br !== 'off') { logo(-372, y + 48, 420, 76, T.light, a, 'left'); y += 104; }
      const st = (i) => clamp((s.lt - 0.2 - i * 0.1) / 0.35) * a;
      if (hd) { tx(hd, -372, y + 40, { size: fit(hd, 800, 'Mont', 740, 30, 4), wt: 800, ls: 4, col: T.light ? OR : T.acc, align: 'left', a: st(0) }); y += 56; }
      if (big) { tx(big, -372, y + 88, { size: fit(big, 400, 'Bebas', 740, 100, 1.5), wt: 400, fam: 'Bebas', ls: 1.5, col: T.fg, align: 'left', a: st(1) }); y += 112; }
      if (pr) { const z = fit(pr, 400, 'Bebas', 500, 104, 1), w = tw(pr, 400, z, 'Bebas', 1) + 64; c.save(); c.globalAlpha *= st(2); c.fillStyle = T.light ? OR : T.acc; rr(-372, y + 8, w, 104, 20); c.fill(); c.restore(); tx(pr, -340, y + 60 + z * 0.36, { size: z, wt: 400, fam: 'Bebas', ls: 1, col: K8.onCol(T.light ? OR : T.acc), align: 'left', a: st(2) }); y += 120; }
      if (note) { tx(note, -372, y + 36, { size: fit(note, 600, 'Mont', 740, 28, 0.5), wt: 600, ls: 0.5, col: T.fg, align: 'left', a: st(3) * 0.75 }); y += 52; }
      if (br === 'full') { c.save(); c.globalAlpha *= a * 0.25; c.fillStyle = T.fg; c.fillRect(-372, y + 8, 744, 2); c.restore(); const list = items(['phone', 'web']); if (list.length) row(list, -372, y + 44, 744, 26, { col: T.fg, acc: T.light ? OR : T.acc, a: st(4), align: 'left' }); }
      c.restore(); } });

  // ------------------------------------------------------------------ templates: where the logo sits, and a contact strip under it
  function fields() { const o = l => l.map(([value, label]) => ({ value, label }));
    return { pos: TX('logopos', 'top', { label: 'Logo', group: 'Branding', options: o([['top', 'Top bar'], ['tl', 'Top left'], ['tr', 'Top right'], ['off', 'Off']]) }),
      strip: TX('cstrip', 'off', { label: 'Contact strip under the logo', group: 'Branding', options: o([['off', 'Off'], ['pw', 'Phone & website'], ['addr', 'Address & hours'], ['social', 'Socials'], ['all', 'Phone, website & address']]) }) }; }
  function top(t, t0, f) {
    f = f || { pos: 'top', strip: 'off' }; if (VID.collecting || (f.pos === 'off' && f.strip === 'off')) return; const e = E.outC(clamp((t - (t0 || 0.15)) / 0.6)); if (e <= 0) return; const c = ctx; c.save(); c.translate(0, -260 * (1 - e));
    const g = c.createLinearGradient(0, 0, 0, 380); g.addColorStop(0, 'rgba(0,0,0,0.74)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 380);
    if (f.pos === 'top') logo(540, 196, 380, 96, false, 1); else if (f.pos === 'tl') logo(70, 196, 300, 84, false, 1, 'left'); else if (f.pos === 'tr') { const img = IMG.logoW || IMG.logoB, w = img && img.width ? Math.min(300, 84 / (img.height / img.width)) : Math.min(300, tw(up(BRAND.short || BRAND.name || ''), 900, 52, 'Mont', 2)); logo(1010 - w, 196, 300, 84, false, 1, 'left'); }
    const o = { col: WHT, acc: OR, a: 1 }, y = f.pos === 'off' ? 200 : 290;
    if (f.strip === 'pw') row(items(['phone', 'web']), 540, y, 960, 28, o); else if (f.strip === 'addr') row(items(['address', 'hours']), 540, y, 960, 26, o); else if (f.strip === 'social') row(socials(), 540, y, 960, 26, o);
    else if (f.strip === 'all') { row(items(['phone', 'web']), 540, y, 960, 28, o); row(items(['address']), 540, y + 44, 960, 24, o); }
    c.restore();
  }
  return { row, items, socials, logo, fields, top, tone, ICONS };
})();
