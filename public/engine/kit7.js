'use strict';
/* Kit 7 (Oct 29): shared infrastructure for the industry families (v_food, v_estate, v_trade). Infrastructure only —
   every family keeps its own composition, type, motion and closing in its own module. Here: text fitting, listing facts
   (formatting, graceful omission, fill-in markers for required facts), whole-frame photo/footage drawing, line icons and
   the brand row. Rules: footage and photos are drawn whole (contain-fit) inside their frames; a vertical source fills a
   vertical frame. Facts come only from the property profile or the brand kit; an empty optional fact is left out. */
const K7 = (() => {
  const G = K3.G, D = K3.D;
  const nz = s => String(s === undefined || s === null ? '' : s).trim();
  const up = s => nz(s).toUpperCase();

  // ---------------------------------------------------------------- text
  // the largest size (<= maxS) at which str wraps into <= maxL lines of <= maxW px; explicit \n breaks are kept
  function fitLines(str, w, fam, maxW, maxS, maxL, o) {
    o = o || {}; const ls = o.ls || 0, style = o.style, minS = o.minS || 18;
    const paras = nz(str).split('\n'); let size = maxS;
    for (; size >= minS; size -= Math.max(1, size * 0.04)) {
      const f = F(w, size, fam, style), out = [];
      for (const p of paras) out.push(...K3.wrap(p, f, maxW));
      if (out.length <= maxL && out.every(l => textW(l, f, ls) <= maxW + 0.5)) return { size, lines: out, f };
    }
    const f = F(w, minS, fam, style), out = []; for (const p of paras) out.push(...K3.wrap(p, f, maxW));
    return { size: minS, lines: out.slice(0, maxL), f };
  }
  // plain text at x, y (no animation): returns the width
  function txt(str, x, y, f, col, o) {
    o = o || {}; if (VID.collecting || !str) return 0; const c = G(); setF(f, o.ls || 0);
    c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic'; c.globalAlpha = o.a === undefined ? 1 : o.a; c.fillStyle = col || WHT;
    if (o.shadow) { c.shadowColor = o.shadow[0]; c.shadowBlur = o.shadow[1]; c.shadowOffsetY = o.shadow[2] || 0; }
    c.fillText(str, x, y); const w = c.measureText(str).width; D(); return w;
  }

  // ---------------------------------------------------------------- listing facts
  // A sample listing for template previews only (gallery thumbnails, standalone renders). Never shown in a clip.
  const DEMO = { addr: '18 Willow Bend Lane', area: 'Maple Grove', price: '1895000', deal: 'sale', beds: '4', baths: '3.5', sqft: '3420', ptype: 'Single-family home',
    feat: 'Chef’s kitchen\nCovered patio\nVaulted great room\nThree-car garage', blurb: 'Light-filled rooms on a quiet, tree-lined street', oh_date: 'Saturday, Nov 8', oh_time: '1 – 4 PM',
    was: '1975000', agent: 'Jordan Avery', agent_title: 'Listing agent', agent_phone: '(555) 014-2280', status: '' };
  // the property profile: every fact a listing can hold (the studio's Listing form is built from this). hint = an example only.
  const PROFILE = [
    { k: 'addr', label: 'Street address', group: 'Property', hint: 'e.g. 18 Willow Bend Lane' },
    { k: 'area', label: 'Neighbourhood or city', group: 'Property', hint: 'e.g. Maple Grove, Oak Park' },
    { k: 'ptype', label: 'Property type', group: 'Property', hint: 'e.g. Single-family home, Condo' },
    { k: 'deal', label: 'For sale or rent', group: 'Property', options: [['sale', 'For sale'], ['rent', 'For rent / lease']] },
    { k: 'price', label: 'Price', group: 'Price', hint: 'e.g. 1895000 or $3,200' },
    { k: 'was', label: 'Previous price', group: 'Price', hint: 'Only for a price update' },
    { k: 'beds', label: 'Bedrooms', group: 'Size', hint: 'e.g. 4' },
    { k: 'baths', label: 'Bathrooms', group: 'Size', hint: 'e.g. 3.5' },
    { k: 'sqft', label: 'Square feet', group: 'Size', hint: 'e.g. 3420' },
    { k: 'lot', label: 'Lot size', group: 'Size', hint: 'e.g. 0.4 acre' },
    { k: 'feat', label: 'Features & amenities', group: 'Highlights', multiline: true, hint: 'One per line' },
    { k: 'blurb', label: 'One-line description', group: 'Highlights', hint: 'In your words' },
    { k: 'oh_date', label: 'Open house date', group: 'Open house', hint: 'e.g. Saturday, Nov 8' },
    { k: 'oh_time', label: 'Open house time', group: 'Open house', hint: 'e.g. 1 – 4 PM' },
    { k: 'agent', label: 'Agent name', group: 'Agent', hint: 'Leave empty to use the brand name' },
    { k: 'agent_title', label: 'Agent title', group: 'Agent', hint: 'e.g. Listing agent' },
    { k: 'agent_phone', label: 'Agent phone', group: 'Agent', hint: 'Leave empty to use the brand phone' },
    { k: 'url', label: 'Listing link', group: 'Agent', hint: 'Shown instead of the brand website' },
  ];
  const profileLabel = k => (PROFILE.find(x => x.k === k) || { label: k }).label;
  const digits = s => nz(s).replace(/[,\s$]/g, '');
  const isNum = s => /^\d+(\.\d+)?$/.test(digits(s));
  function num(s) { s = nz(s); if (!isNum(s)) return s; const n = Number(digits(s)); return n.toLocaleString('en-US', { maximumFractionDigits: n % 1 ? 2 : 0 }); }
  // price as typed, or digits formatted as $1,895,000; rentals get /mo unless the user wrote a period
  function money(s, deal) {
    s = nz(s); if (!s) return ''; let out = isNum(s) ? '$' + num(s) : s;
    if (deal === 'rent' && !/\/|\bmo\b|month|week|wk|yr|year|night/i.test(out)) out += '/mo';
    return out;
  }
  // short price for tight spots: $1.9M, $850K (only from plain digits; typed text stays as typed)
  function moneyShort(s, deal) {
    if (!isNum(s) || deal === 'rent') return money(s, deal); const n = Number(digits(s));
    if (n >= 1e6) return '$' + (Math.round(n / 1e5) / 10).toString().replace(/\.0$/, '') + 'M';
    if (n >= 1e4) return '$' + Math.round(n / 1e3) + 'K'; return money(s, deal);
  }
  // facts that were given, in order, each {k, n (number/value), u (unit)}; empty ones are left out
  function facts(P, keys) {
    const out = [];
    for (const k of keys || ['beds', 'baths', 'sqft']) {
      const v = nz(P[k]); if (!v) continue;
      if (k === 'beds') out.push(/^0$|studio/i.test(v) ? { k, n: 'STUDIO', u: '' } : { k, n: v.replace(/\s*(beds?|bedrooms?|bd|br)\.?$/i, ''), u: /^1(\.0)?(\s|$)/.test(v) ? 'BED' : 'BEDS' });
      else if (k === 'baths') out.push({ k, n: v.replace(/\s*(baths?|bathrooms?|ba)\.?$/i, ''), u: /^1(\.0)?(\s|$)/.test(v) ? 'BATH' : 'BATHS' });
      else if (k === 'sqft') out.push({ k, n: num(v.replace(/\s*(sq\.?\s*ft\.?|sf|square feet)$/i, '')), u: 'SQ FT' });
      else if (k === 'lot') out.push({ k, n: up(v), u: /lot/i.test(v) ? '' : 'LOT' });
      else out.push({ k, n: up(v), u: '' });
    }
    return out;
  }
  const factStr = (list, sep) => list.map(x => (x.n + (x.u ? ' ' + x.u : ''))).join(sep || '  ·  ');
  const lines = s => nz(s).split('\n').map(x => x.trim()).filter(Boolean);
  // a clear fill-in marker for a required fact that is missing (the export check lists it too)
  function need(label, x, y, size, o) {
    o = o || {}; if (VID.collecting) return 0; const str = '+ ADD ' + up(label), f = F(700, size, 'Mono'), ls = size * 0.12, w = textW(str, f, ls) + size * 1.4, h = size * 2.0;
    const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x, c = G(); c.globalAlpha = o.a === undefined ? 1 : o.a;
    c.setLineDash([size * 0.4, size * 0.3]); c.lineWidth = Math.max(2, size * 0.08); c.strokeStyle = o.col || WHT; c.strokeRect(x0, y - h * 0.68, w, h); c.setLineDash([]);
    setF(f, ls); c.fillStyle = o.col || WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(str, x0 + w / 2, y - h * 0.68 + h / 2 + 1); D(); return w;
  }

  // ---------------------------------------------------------------- footage and photos (always whole)
  const isVert = c => K3.ar(c) < 0.9;
  // shot s (from K3.shots) whole inside rect r at clip time t; returns the drawn rect
  function photo(s, t, r, o) { o = o || {}; const w = K3.wholeIn(s.c, r); K3.clip(s.c, s.in, Math.max(0, o.lt !== undefined ? o.lt : t - (s.start || 0)), w, o.alpha !== undefined ? { alpha: o.alpha } : undefined); return w; }
  // the rect a shot will occupy inside r (for frames, shadows and captions placed before drawing)
  const fit = (s, r) => K3.wholeIn(s.c, r);

  // ---------------------------------------------------------------- line icons (stroke, size s, centred on x, y)
  function icon(name, x, y, s, col, o) {
    if (VID.collecting) return; o = o || {}; const c = G(); c.translate(x, y); c.scale(s / 24, s / 24); c.translate(-12, -12);
    c.strokeStyle = col || WHT; c.fillStyle = col || WHT; c.lineWidth = o.lw || 1.7; c.lineCap = 'round'; c.lineJoin = 'round'; c.globalAlpha = o.a === undefined ? 1 : o.a;
    const P = new Path2D({
      bed: 'M3 18V8M3 14h18v4M21 14v-2a3 3 0 00-3-3h-7v5M7.5 12.2a1.7 1.7 0 100-.01',
      bath: 'M4 12h16v2a5 5 0 01-5 5H9a5 5 0 01-5-5v-2zM6 12V6a2 2 0 014 0M7 19l-1 2M17 19l1 2',
      area: 'M4 4h16v16H4zM8 8l8 8M8 8h3M8 8v3M16 16h-3M16 16v-3',
      pin: 'M12 21s-6-5.6-6-11a6 6 0 0112 0c0 5.4-6 11-6 11zM12 12.4a2.4 2.4 0 100-.01',
      cal: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5',
      clock: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2',
      phone: 'M6 3h3l2 5-2.5 1.5a11 11 0 005 5L15 12l5 2v3a2 2 0 01-2 2A15 15 0 014 5a2 2 0 012-2z',
      home: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
      key: 'M14.5 4a5.5 5.5 0 11-4.4 8.8L4 19v2H2v-3l6.6-6.6A5.5 5.5 0 0114.5 4zM16 7.5a1 1 0 100-.01',
      lot: 'M3 20h18M5 20V9l7-5 7 5v11M3 9h18',
      car: 'M4 16v-4l2-5h12l2 5v4M4 16h16v3H4zM7 13h.01M17 13h.01',
      arrow: 'M12 4v16M5 13l7 7 7-7',
      star: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z',
    }[name] || 'M12 4a8 8 0 100 16 8 8 0 000-16z');
    c.stroke(P); D();
  }

  // ---------------------------------------------------------------- brand row
  // the logo (light version on the ink background unless dark is set) centred at x, y at nominal width w
  function logo(x, y, w, a, dark) {
    if (VID.collecting || (a !== undefined && a <= 0)) return [0, 0]; const [lw, lh] = logoBox(w), c = G(); c.globalAlpha = a === undefined ? 1 : a;
    c.drawImage(dark ? IMG.logoB : IMG.logoW, x - lw / 2, y - lh / 2, lw, lh); D(); return [lw, lh];
  }
  const contact = () => [CONTACT.phone, CONTACT.web].filter(Boolean);
  // agent line for real estate: the listing's agent (if given), else the brand
  const agentName = P => nz(P.agent) || BRAND.name;
  const agentPhone = P => nz(P.agent_phone) || CONTACT.phone || '';

  // ---------------------------------------------------------------- small motion helpers
  const seg = (t, a, d) => clamp((t - a) / d);                 // 0..1 over [a, a+d]
  const hold = (t, a, b, fi, fo) => Math.min(seg(t, a, fi), 1 - seg(t, b - fo, fo));
  function clipRect(r, fn) { const c = G(); c.beginPath(); c.rect(r[0], r[1], r[2], r[3]); c.clip(); try { fn(c); } finally { D(); } }
  // colour mix (hex in, hex out) and a cached soft glow sprite per colour (sparks, embers, neon dots)
  function mix(a, b, u) { const p = h => [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16)), A = p(a), B = p(b); return '#' + A.map((x, k) => Math.round(x + (B[k] - x) * clamp(u)).toString(16).padStart(2, '0')).join(''); }
  const SPR = new Map();
  function spark(col) {
    let s = SPR.get(col); if (s) return s; s = document.createElement('canvas'); s.width = s.height = 64; const g = s.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, '#FFFFFF'); r.addColorStop(0.18, col); r.addColorStop(0.5, rgbaOf(col, 0.25)); r.addColorStop(1, rgbaOf(col, 0)); g.fillStyle = r; g.fillRect(0, 0, 64, 64); SPR.set(col, s); return s;
  }

  // text colour that reads on a fill (white or near-black by luminance) and a tinted copy of an image (logos in glow/heat)
  const lumOf = h => { const v = [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const on = col => (lumOf(col) > 0.36 ? '#111111' : '#FFFFFF');
  const TNT = new Map();
  function tinted(img, col) {
    const k = col + '|' + (img.src || img.width + 'x' + img.height); let cv = TNT.get(k); if (cv && cv._img === img) return cv;
    cv = document.createElement('canvas'); cv.width = img.naturalWidth || img.width; cv.height = img.naturalHeight || img.height; const g = cv.getContext('2d');
    g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, cv.width, cv.height); cv._img = img; TNT.set(k, cv); return cv;
  }

  // ---------------------------------------------------------------- creative families: look and music per family
  // pal = {accent, ink (background), text, accent2, paper (cards), deep1, deep2}; fonts = library keys per slot (the studio
  // swaps them in; a plain engine render keeps the base faces). The studio's registry adds names, sectors and objectives.
  const P = (accent, ink, text, accent2, paper, deep1, deep2) => ({ accent, ink, text, accent2, paper, deep1, deep2 });
  const FAM = {
    // restaurants
    fire: { pal: P('#FF5A1F', '#0D0B0A', '#F6EFE6', '#FFB547', '#EFE7DB', '#21140D', '#050404'), fonts: { sans: 'barlowc', serif: 'dmserif', display: 'shoulders', script: 'marker' }, music: 'smoke', bpm: 84 },
    chef: { pal: P('#A07C3F', '#F5F0E6', '#1C1916', '#5E5346', '#1C1916', '#EEE7DA', '#FFFDF8'), fonts: { sans: 'raleway', serif: 'corm', display: 'cinzel', script: 'parisienne' }, music: 'salon', bpm: 72 },
    rush: { pal: P('#FFC83D', '#D9261C', '#FFF7E6', '#141414', '#FFF7E6', '#E5372B', '#A9170F'), fonts: { sans: 'archivo', serif: 'dmserif', display: 'archivoblack', script: 'marker' }, music: 'bounce', bpm: 124 },
    today: { pal: P('#E2432A', '#161817', '#F5F1E8', '#F2C14E', '#FBF7EE', '#262A28', '#0B0C0C'), fonts: { sans: 'grotesk', serif: 'fraunces', display: 'anton', script: 'kalam' }, music: 'lofi', bpm: 82 },
    icon: { pal: P('#1F4BFF', '#ECEAE4', '#111111', '#FF5A36', '#111111', '#E3E0D8', '#F7F6F2'), fonts: { sans: 'grotesk', serif: 'instrument', display: 'archivo', script: 'caveat' }, music: 'grid', bpm: 112 },
    after: { pal: P('#FF4FB0', '#08070D', '#F5EFFF', '#66E4FF', '#F5EFFF', '#1B1030', '#020205'), fonts: { sans: 'syne', serif: 'playfair', display: 'monoton', script: 'sacramento' }, music: 'velvet', bpm: 104 },
    // real estate
    sig: { pal: P('#A8865A', '#F4F1EB', '#121212', '#6E6A62', '#121212', '#ECE8E0', '#FFFFFF'), fonts: { sans: 'inter', serif: 'bodoni', display: 'bebas', script: 'greatvibes' }, music: 'atelier', bpm: 70 },
    listed: { pal: P('#FFD84D', '#0E1A2B', '#FFFFFF', '#8FB3E8', '#FFFFFF', '#17283F', '#070D16'), fonts: { sans: 'inter', serif: 'dmserif', display: 'oswald', script: 'kalam' }, music: 'listing', bpm: 118 },
    open: { pal: P('#2F6B4F', '#F8F5EE', '#1D2A23', '#C69B3B', '#1D2A23', '#EFEBE0', '#FFFFFF'), fonts: { sans: 'dmsans', serif: 'fraunces', display: 'teko', script: 'satisfy' }, music: 'day', bpm: 96 },
    drop: { pal: P('#FF3B30', '#101010', '#FFFFFF', '#FFD60A', '#F2F2F2', '#1C1C1C', '#000000'), fonts: { sans: 'grotesk', serif: 'dmserif', display: 'anton', script: 'marker' }, music: 'pulse', bpm: 120 },
    sold: { pal: P('#D4AF37', '#0B0B0B', '#F7F2E8', '#B3312B', '#F7F2E8', '#1A1712', '#000000'), fonts: { sans: 'mont', serif: 'playfair', display: 'abril', script: 'greatvibes' }, music: 'glow', bpm: 92 },
    hood: { pal: P('#C2552D', '#F2EDE3', '#2A2521', '#3E6B5A', '#2A2521', '#EAE3D6', '#FBF8F2'), fonts: { sans: 'spartan', serif: 'instrument', display: 'abril', script: 'caveat' }, music: 'sketch', bpm: 100 },
    tour: { pal: P('#CDB78E', '#1B1A18', '#F3F0E9', '#8E8B83', '#F3F0E9', '#262420', '#0D0C0B'), fonts: { sans: 'inter', serif: 'lora', display: 'teko', script: 'satisfy' }, music: 'cinematic', bpm: 90 },
    agent: { pal: P('#E9C46A', '#12161C', '#FFFFFF', '#9AA5B4', '#FFFFFF', '#1C232D', '#07090C'), fonts: { sans: 'mont', serif: 'fraunces', display: 'bebas', script: 'kalam' }, music: 'listing', bpm: 110 },
    // other industries
    blueprint: { pal: P('#FFB703', '#0E2A47', '#E8F1FA', '#8FC1E8', '#E8F1FA', '#143B60', '#071A2C'), fonts: { sans: 'barlowc', serif: 'lora', display: 'oswald', script: 'kalam' }, music: 'sketch', bpm: 100 },
    salon: { pal: P('#C8336B', '#F2EDE8', '#141111', '#8A7F78', '#141111', '#EAE3DC', '#FFFFFF'), fonts: { sans: 'dmsans', serif: 'playfair', display: 'abril', script: 'parisienne' }, music: 'runway', bpm: 100 },
    barber: { pal: P('#D62828', '#121212', '#F4EDE1', '#2B59C3', '#F4EDE1', '#1E1E1E', '#050505'), fonts: { sans: 'barlowc', serif: 'yeseva', display: 'bungee', script: 'kaushan' }, music: 'boom', bpm: 90 },
    reveal: { pal: P('#FF2E2E', '#050607', '#F1F3F5', '#9CA3AF', '#F1F3F5', '#14161A', '#000000'), fonts: { sans: 'archivo', serif: 'dmserif', display: 'teko', script: 'marker' }, music: 'drive', bpm: 110 },
    event: { pal: P('#FFB800', '#0F0A1E', '#FFF8EA', '#FF5D8F', '#FFF8EA', '#241547', '#05030B'), fonts: { sans: 'spartan', serif: 'yeseva', display: 'righteous', script: 'pacifico' }, music: 'party', bpm: 120 },
    product: { pal: P('#D4FF00', '#0A0A0A', '#FFFFFF', '#FF3D00', '#F2F2F2', '#161616', '#000000'), fonts: { sans: 'rubik', serif: 'baskerville', display: 'bebas', script: 'marker' }, music: 'pulse', bpm: 120 },
    expert: { pal: P('#1D4ED8', '#F7F7F5', '#0F172A', '#64748B', '#0F172A', '#EEF0F3', '#FFFFFF'), fonts: { sans: 'inter', serif: 'lora', display: 'oswald', script: 'kalam' }, music: 'cinematic', bpm: 90 },
    // V10 restaurants
    burger: { pal: P('#FFC400', '#0B0A09', '#FFFFFF', '#FF3B1F', '#F6EEE2', '#1C140B', '#030202'), fonts: { sans: 'archivo', serif: 'dmserif', display: 'anton', script: 'marker' }, music: 'trap', bpm: 140 },
    sushi: { pal: P('#C8372D', '#F4EFE6', '#151412', '#B08D57', '#151412', '#EAE3D6', '#FBF8F2'), fonts: { sans: 'inter', serif: 'corm', display: 'cinzel', script: 'sacramento' }, music: 'zen', bpm: 66 },
    cheese: { pal: P('#FFB800', '#1A0F05', '#FFF4E0', '#FF6A13', '#FFF4E0', '#2E1A08', '#0B0602'), fonts: { sans: 'fredoka', serif: 'yeseva', display: 'luckiest', script: 'kalam' }, music: 'funk', bpm: 108 },
    pour: { pal: P('#E8A33D', '#071214', '#F4EFE6', '#5FD3C8', '#F4EFE6', '#0E2226', '#020708'), fonts: { sans: 'raleway', serif: 'playfair', display: 'abril', script: 'parisienne' }, music: 'soul', bpm: 84 },
    menuedit: { pal: P('#9B2C2C', '#F3ECDF', '#2B2118', '#C9A227', '#2B2118', '#EBE2D2', '#FBF7EF'), fonts: { sans: 'spartan', serif: 'playfair', display: 'abril', script: 'dancing' }, music: 'bistro', bpm: 96 },
    street: { pal: P('#FF3D7F', '#262626', '#FFFFFF', '#F5E400', '#F0F0F0', '#333333', '#141414'), fonts: { sans: 'barlowc', serif: 'dmserif', display: 'bungee', script: 'marker' }, music: 'dusty', bpm: 90 },
    late: { pal: P('#FF2BD6', '#0A0618', '#F3EEFF', '#2BF0FF', '#F3EEFF', '#1A0F33', '#030108'), fonts: { sans: 'grotesk', serif: 'dmserif', display: 'monoton', script: 'kaushan' }, music: 'synth', bpm: 104 },
    fresh: { pal: P('#D9822B', '#EADBC2', '#2F3B24', '#7A9A3A', '#2F3B24', '#E0CFB2', '#F6EEDF'), fonts: { sans: 'dmsans', serif: 'fraunces', display: 'abril', script: 'caveat' }, music: 'folk', bpm: 112 },
    cater: { pal: P('#C9A55C', '#0C0C0C', '#F5EFE3', '#E8D9B5', '#F5EFE3', '#1A1814', '#030303'), fonts: { sans: 'raleway', serif: 'bodoni', display: 'cinzel', script: 'greatvibes' }, music: 'strings', bpm: 80 },
    brunch: { pal: P('#E07A5F', '#FFF6EC', '#3B2A20', '#F2CC8F', '#3B2A20', '#FBE9D7', '#FFFDF9'), fonts: { sans: 'poppins', serif: 'yeseva', display: 'righteous', script: 'pacifico' }, music: 'morning', bpm: 86 },
    // V10 real estate
    aerial: { pal: P('#4FD1FF', '#0A1118', '#FFFFFF', '#FFC857', '#EAF4FA', '#122030', '#02060A'), fonts: { sans: 'grotesk', serif: 'instrument', display: 'teko', script: 'satisfy' }, music: 'drone', bpm: 76 },
    resid: { pal: P('#D8C3A5', '#121110', '#F3EEE6', '#8C7B66', '#F3EEE6', '#1E1C1A', '#060505'), fonts: { sans: 'raleway', serif: 'corm', display: 'cinzel', script: 'parisienne' }, music: 'residence', bpm: 70 },
    journal: { pal: P('#2E5E4E', '#F6F1E7', '#22201C', '#C25B3F', '#22201C', '#EEE6D6', '#FFFCF5'), fonts: { sans: 'dmsans', serif: 'lora', display: 'abril', script: 'caveat' }, music: 'indie', bpm: 100 },
    devel: { pal: P('#E3C565', '#0E0F12', '#FFFFFF', '#7FA7C9', '#F2F2F2', '#181A20', '#040405'), fonts: { sans: 'spartan', serif: 'instrument', display: 'syne', script: 'satisfy' }, music: 'build', bpm: 120 },
    soon: { pal: P('#FF6B35', '#0B0B0C', '#FFFFFF', '#FFD166', '#F2F2F2', '#18181B', '#020203'), fonts: { sans: 'inter', serif: 'dmserif', display: 'anton', script: 'kaushan' }, music: 'tease', bpm: 100 },
    lease: { pal: P('#2563EB', '#F7F8FA', '#0F172A', '#F59E0B', '#0F172A', '#ECEFF5', '#FFFFFF'), fonts: { sans: 'dmsans', serif: 'fraunces', display: 'archivoblack', script: 'kalam' }, music: 'sunny', bpm: 116 },
    luxe: { pal: P('#D4AF37', '#050505', '#F5F1E8', '#B8A27A', '#F5F1E8', '#15130E', '#000000'), fonts: { sans: 'raleway', serif: 'playfair', display: 'bodoni', script: 'greatvibes' }, music: 'luxe', bpm: 72 },
    comm: { pal: P('#00B4D8', '#0B1626', '#FFFFFF', '#F4A261', '#EAF2F8', '#13233A', '#040A13'), fonts: { sans: 'inter', serif: 'fraunces', display: 'oswald', script: 'satisfy' }, music: 'corporate', bpm: 110 },
    // V10 other industries
    crew: { pal: P('#F5A524', '#16181B', '#F4F1EA', '#6FA8DC', '#F4F1EA', '#22262B', '#08090A'), fonts: { sans: 'barlowc', serif: 'dmserif', display: 'oswald', script: 'marker' }, music: 'docu', bpm: 92 },
    timeline: { pal: P('#16A34A', '#F4F5F0', '#1A1D1A', '#0EA5E9', '#1A1D1A', '#E8EAE2', '#FFFFFF'), fonts: { sans: 'spartan', serif: 'lora', display: 'archivoblack', script: 'kalam' }, music: 'stomp', bpm: 104 },
    glowup: { pal: P('#E8799A', '#FFF1F2', '#3A1F2B', '#F6C7A1', '#3A1F2B', '#FCE3E6', '#FFFBFB'), fonts: { sans: 'dmsans', serif: 'playfair', display: 'abril', script: 'sacramento' }, music: 'dreamy', bpm: 76 },
    swatch: { pal: P('#B98B6E', '#141012', '#F6EFEA', '#E3C4A8', '#F6EFEA', '#221B1E', '#060405'), fonts: { sans: 'syne', serif: 'bodoni', display: 'syne', script: 'parisienne' }, music: 'chic', bpm: 122 },
    shine: { pal: P('#3BC9FF', '#05080D', '#FFFFFF', '#B4F0FF', '#EAF7FF', '#0B1422', '#000205'), fonts: { sans: 'rubik', serif: 'dmserif', display: 'teko', script: 'kaushan' }, music: 'gloss', bpm: 118 },
    garage: { pal: P('#FF4D2E', '#141414', '#F2EEE6', '#FFC23D', '#F2EEE6', '#232323', '#060606'), fonts: { sans: 'oswald', serif: 'dmserif', display: 'shoulders', script: 'marker' }, music: 'garage', bpm: 132 },
    party: { pal: P('#FF2E93', '#0C0516', '#FFFFFF', '#FFE14D', '#FFFFFF', '#22103D', '#03010A'), fonts: { sans: 'syne', serif: 'dmserif', display: 'bungee', script: 'kaushan' }, music: 'disco', bpm: 120 },
    venue: { pal: P('#B08D57', '#FAF6F0', '#2B2621', '#9CAF88', '#2B2621', '#F1EBE1', '#FFFFFF'), fonts: { sans: 'raleway', serif: 'corm', display: 'cinzel', script: 'greatvibes' }, music: 'waltz', bpm: 120 },
    arrivals: { pal: P('#C8553D', '#F2F0EC', '#111111', '#111111', '#111111', '#E6E3DD', '#FFFFFF'), fonts: { sans: 'grotesk', serif: 'instrument', display: 'archivoblack', script: 'satisfy' }, music: 'chic', bpm: 122 },
    flash: { pal: P('#FFE600', '#E10600', '#FFFFFF', '#111111', '#FFFFFF', '#B00500', '#6E0300'), fonts: { sans: 'archivo', serif: 'dmserif', display: 'bungee', script: 'marker' }, music: 'hype', bpm: 150 },
    tips: { pal: P('#7C3AED', '#F7F5FF', '#1E1B2E', '#10B981', '#1E1B2E', '#EDE9FE', '#FFFFFF'), fonts: { sans: 'poppins', serif: 'fraunces', display: 'righteous', script: 'kalam' }, music: 'minimal', bpm: 104 },
    story: { pal: P('#E9B44C', '#1B1A17', '#F7F3EA', '#9C8F7A', '#F7F3EA', '#26241F', '#090908'), fonts: { sans: 'inter', serif: 'fraunces', display: 'fraunces', script: 'satisfy' }, music: 'warm', bpm: 78 },
  };
  return { nz, up, fitLines, txt, DEMO, PROFILE, profileLabel, num, money, moneyShort, facts, factStr, lines, need, isVert, photo, fit, icon, logo, contact, agentName, agentPhone, seg, hold, clipRect, mix, spark, lumOf, on, tinted, FAM };
})();
