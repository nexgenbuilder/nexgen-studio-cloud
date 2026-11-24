'use strict';
/* NexGen Clip Studio: brands. A brand kit is name, industry, colours, fonts, logo, contact block, services, billing lines,
   reviews (word for word) and ad rules. applyBrand() pushes the active kit into the video engine (BRAND, CONTACT, colours,
   logos, the canvas fonts) before any template builds. DPG Outdoor Living is built in, with its footage library. */
window.NX = window.NX || {};
(() => {
  // ------------------------------------------------------------ fonts. The engine draws with five families: Mont (headline sans),
  // Corm (editorial serif), Bebas (condensed display), Hand (handwritten) and Mono. A brand kit picks a font for each of the first
  // four slots from NX.FONTLIB (fonts.js); editor text layers can also use any library font directly as family "NXF-<key>".
  const LIB = () => NX.FONTLIB || {};
  const fileOf = (f, w, it) => `fonts/${f.p}-latin-${w}-${it ? 'italic' : 'normal'}.woff2`;
  const nearest = (list, w) => list.slice().sort((a, b) => Math.abs(a - w) - Math.abs(b - w) || b - a)[0];
  function facesFor(family, key, weights, italics) {   // one FontFace per requested weight, each pointing at the nearest shipped file
    const f = LIB()[key]; if (!f) return [];
    const out = [];
    for (const w of weights) if (f.n.length) out.push(new FontFace(family, `url(${fileOf(f, nearest(f.n, w), false)})`, { weight: String(w), style: 'normal' }));
    for (const w of italics) { const src = f.i.length ? fileOf(f, nearest(f.i, w), true) : f.n.length ? fileOf(f, nearest(f.n, w), false) : null; if (src) out.push(new FontFace(family, `url(${src})`, { weight: String(w), style: 'italic' })); }
    return out;
  }
  NX.SLOTS = {
    sans: { family: 'Mont', label: 'Headline', cats: ['sans'], def: 'mont', w: [400, 500, 600, 700, 800, 900], it: [] },
    serif: { family: 'Corm', label: 'Serif', cats: ['serif'], def: 'corm', w: [400, 500, 600, 700], it: [400, 500, 600, 700] },
    display: { family: 'Bebas', label: 'Display', cats: ['display', 'sans'], def: 'bebas', w: [400, 700, 900], it: [] },
    script: { family: 'Hand', label: 'Script', cats: ['script'], def: 'caveat', w: [400, 500, 600, 700], it: [] },
  };
  NX.FONTS = { sans: {}, serif: {}, display: {}, script: {} };   // per slot: key -> {label}, for pickers
  setTimeout(() => { for (const [k, f] of Object.entries(LIB())) for (const [sl, S] of Object.entries(NX.SLOTS)) if (S.cats.includes(f.c) && !(sl === 'display' && f.c === 'sans' && !/oswald|barlowc|spartan|archivo|bricolage|syne/.test(k))) NX.FONTS[sl][k] = { label: f.l }; }, 0);
  const cur = { sans: null, serif: null, display: null, script: null }, faces = { sans: [], serif: [], display: [], script: [] };
  NX.loadFixedFonts = () => Promise.all([['Mono', 500, 'fonts/jetbrains-mono-latin-500-normal.woff2'], ['Mono', 700, 'fonts/jetbrains-mono-latin-700-normal.woff2'], ['Mono', 800, 'fonts/jetbrains-mono-latin-800-normal.woff2']]
    .map(([fam, w, url]) => { const f = new FontFace(fam, `url(${url})`, { weight: String(w) }); document.fonts.add(f); return f.load(); }));
  NX.setFonts = async fonts => {
    fonts = fonts || {};
    for (const [sl, S] of Object.entries(NX.SLOTS)) {
      let key = fonts[sl]; if (!LIB()[key]) key = S.def; if (cur[sl] === key) continue;
      const nf = facesFor(S.family, key, S.w, S.it);
      try { await Promise.all(nf.map(f => f.load())); } catch (e) { console.warn('font', key, e); continue; }
      faces[sl].forEach(f => document.fonts.delete(f)); nf.forEach(f => document.fonts.add(f)); faces[sl] = nf; cur[sl] = key;
    }
    TWC.clear();
  };
  const used = new Map();
  NX.useFont = key => {   // a library font as its own family, for editor text layers and the pickers' previews
    if (!LIB()[key]) return Promise.resolve(false); if (used.has(key)) return used.get(key);
    const nf = facesFor('NXF-' + key, key, [400, 500, 600, 700, 800, 900], LIB()[key].i.length ? [400, 500, 600, 700] : []);
    const p = Promise.all(nf.map(f => f.load())).then(() => { nf.forEach(f => document.fonts.add(f)); TWC.clear(); return true; }).catch(e => { console.warn('font', key, e); used.delete(key); return false; });
    used.set(key, p); return p;
  };
  NX.fontFamily = key => (LIB()[key] ? 'NXF-' + key : null);

  // ------------------------------------------------------------ built-in brand: DPG Outdoor Living
  NX.DPG = {
    id: 'dpg', builtin: true, name: 'DPG Outdoor Living', short: 'DPG', industry: 'hardscape', parts: true, descriptor: 'AWARD-WINNING LANDSCAPE DESIGN & BUILD',
    colors: { accent: '#FF6500', ink: '#0B0B0B', paper: '#F4F1EA' }, fonts: { sans: 'mont', serif: 'corm', display: 'bebas', script: 'caveat' }, logo: { builtin: true },
    contact: { phone: '(925) 239-5645', web: 'DPGOUTDOORLIVING.COM', lic: 'CA LIC. #1073434', since: 'SINCE 1990', badge: 'AWARD-WINNING', cta: 'BOOK A DESIGN CONSULTATION',
      tagline: 'Award-winning design & build.', area: 'THE GREATER BAY AREA' },
    services: BRAND.services.slice(), billing: BRAND.billing.slice(), reviews: JSON.parse(JSON.stringify(BRAND.reviews)),
    rules: { superlatives: true, prices: true, stars: true, words: '' }, dpgRules: true,
  };
  // a starting palette per industry for new brands without a logo (a logo's own colour replaces the accent)
  const IND_PAL = { hardscape: ['#E8A33D', '#10140F', '#F3F1EA'], fencing: ['#D08A3C', '#121417', '#F4F1EC'], detailing: ['#2F80ED', '#0A0F1A', '#EEF3FA'], barbershop: ['#C9A227', '#0B0B0C', '#F4F1E8'],
    landscaping: ['#3FAE5A', '#0C1610', '#F0F5EF'], roofing: ['#E04F3F', '#121418', '#F3F2F0'], cleaning: ['#14B8A6', '#0A1614', '#EEF6F4'], pressure: ['#3B82F6', '#0A1220', '#EEF3FA'],
    restaurant: ['#E63946', '#121212', '#FBF4EA'], realestate: ['#B08D57', '#101418', '#F4F1EB'], salon: ['#D6336C', '#141012', '#F7EFEF'], events: ['#FFB800', '#0F0A1E', '#FFF8EA'],
    retail: ['#FF3D00', '#0A0A0A', '#F4F4F2'], pro: ['#1D4ED8', '#0B1220', '#F3F5F8'], general: ['#7C5CFF', '#0E0E14', '#F2F1F6'] };
  NX.newBrand = (name, industry) => {
    const ind = NX.INDUSTRIES[industry] || NX.INDUSTRIES.general, short = name.trim().split(/\s+/)[0].replace(/[^\w&'-]/g, '').slice(0, 14) || name, ip = IND_PAL[industry] || IND_PAL.general;
    const b = { id: 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: name.trim(), short, industry, colors: { accent: ip[0], ink: ip[1], paper: ip[2] },
      fonts: { sans: 'mont', serif: 'corm', display: 'bebas', script: 'caveat' }, logo: { asset: null, onDark: 'white', onLight: 'original' }, mark: null,
      contact: { phone: '', web: '', lic: '', since: '', badge: '', cta: ind.cta, tagline: ind.tagline, area: '' },
      services: ind.services.slice(), billing: ind.billing.slice(), reviews: [], rules: { superlatives: true, prices: false, stars: true, words: '' }, createdAt: new Date().toISOString() };
    return b;
  };

  // ------------------------------------------------------------ logos: trim, key out a white background, white / dark silhouettes, wordmark fallback
  const loadImage = src => new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = () => rej(new Error('Logo did not load')); i.src = src; });
  function toCanvas(im, maxW) { const s = Math.min(1, (maxW || 2048) / im.width), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.width * s)); c.height = Math.max(1, Math.round(im.height * s)); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); return c; }
  function keyAndTrim(c) {
    const g = c.getContext('2d', { willReadFrequently: true }), d = g.getImageData(0, 0, c.width, c.height), p = d.data, W0 = c.width, H0 = c.height;
    let opaque = true; for (let i = 3; i < p.length; i += 16) if (p[i] < 250) { opaque = false; break; }
    if (opaque) {   // a logo saved on white: lift the near-white background
      const cs = [0, (W0 - 1) * 4, (H0 - 1) * W0 * 4, ((H0 - 1) * W0 + W0 - 1) * 4], whiteCorners = cs.every(i => p[i] > 235 && p[i + 1] > 235 && p[i + 2] > 235);
      if (whiteCorners) for (let i = 0; i < p.length; i += 4) { const mn = Math.min(p[i], p[i + 1], p[i + 2]), mx = Math.max(p[i], p[i + 1], p[i + 2]); if (mx - mn < 24 && mn > 200) p[i + 3] = Math.round(255 * clamp((255 - mn) / 55)); }
      g.putImageData(d, 0, 0);
    }
    let x0 = W0, y0 = H0, x1 = -1, y1 = -1;
    for (let y = 0; y < H0; y++) for (let x = 0; x < W0; x++) if (p[(y * W0 + x) * 4 + 3] > 12) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return c;
    const t = document.createElement('canvas'); t.width = x1 - x0 + 1; t.height = y1 - y0 + 1; t.getContext('2d').drawImage(c, x0, y0, t.width, t.height, 0, 0, t.width, t.height); return t;
  }
  function silhouette(c, col) { const t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const g = t.getContext('2d'); g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, t.width, t.height); return t; }
  function wordmark(b, col) {
    const t = document.createElement('canvas'), g = t.getContext('2d'), name = b.name.toUpperCase(), f = '900 200px Mont';
    g.font = f; g.letterSpacing = '6px'; const w = Math.ceil(g.measureText(name).width) + 40; t.width = Math.min(4000, w); t.height = 240;
    const g2 = t.getContext('2d'); g2.font = f; g2.letterSpacing = '6px'; g2.fillStyle = col; g2.textBaseline = 'middle'; g2.fillText(name, 20, 128); return t;
  }
  NX.dominantColor = c => {   // the most common saturated hue in a logo, for the wizard's colour suggestion
    const s = toCanvas(c, 160), d = s.getContext('2d').getImageData(0, 0, s.width, s.height).data, bins = {};
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; const r = d[i], g = d[i + 1], bl = d[i + 2], mx = Math.max(r, g, bl), mn = Math.min(r, g, bl); if (mx - mn < 60 || mx < 70) continue;
      const k = (r >> 5) + ',' + (g >> 5) + ',' + (bl >> 5); bins[k] = (bins[k] || 0) + 1; }
    const top = Object.entries(bins).sort((a, b) => b[1] - a[1])[0]; if (!top) return null;
    const [r, g, bl] = top[0].split(',').map(x => (+x << 5) + 16); return '#' + [r, g, bl].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  };
  NX.processLogoFile = async file => { const url = URL.createObjectURL(file); try { return keyAndTrim(toCanvas(await loadImage(url), 2048)); } finally { setTimeout(() => URL.revokeObjectURL(url), 5000); } };
  const imgCache = new Map();
  async function brandImages(b) {
    if (b.logo && b.logo.builtin) return { w: await loadImage('assets/logo_white.png'), b: await loadImage('assets/logo_black.png'), ar: 460 / 2048, mark: null, grunge: await loadImage('assets/logo_grunge.png').catch(() => null) };
    const key = JSON.stringify([b.logo, b.mark, b.name, b.colors.ink, b.fonts && b.fonts.sans]);
    if (imgCache.has(key)) return imgCache.get(key);
    let base = null;
    if (b.logo && (b.logo.asset || b.logo.url)) { try { base = keyAndTrim(toCanvas(await loadImage(b.logo.url || ('/_blob/' + b.logo.asset)), 2048)); } catch (e) { console.warn(e); } }
    let out;
    if (base) out = { w: b.logo.onDark === 'original' ? base : silhouette(base, '#FFFFFF'), b: b.logo.onLight === 'dark' ? silhouette(base, b.colors.ink) : base, ar: base.height / base.width };
    else { const wm = wordmark(b, '#FFFFFF'); out = { w: wm, b: silhouette(wm, b.colors.ink), ar: wm.height / wm.width }; }
    out.mark = null;
    if (b.mark && (b.mark.asset || b.mark.url)) { try { out.mark = toCanvas(await loadImage(b.mark.url || ('/_blob/' + b.mark.asset)), 512); } catch (e) {} }
    imgCache.set(key, out); return out;
  }
  NX.brandImages = brandImages;

  // ------------------------------------------------------------ apply a brand to the engine
  NX.applyBrand = async b => {
    BRAND.id = b.id; BRAND.name = b.name; BRAND.short = b.short || b.name; BRAND.parts = !!b.parts; BRAND.descriptor = b.descriptor || '';
    BRAND.services = (b.services || []).map(s => s.toUpperCase());
    BRAND.industry = b.industry || 'general'; BRAND.noun = ((NX.INDUSTRIES[b.industry] || {}).noun || 'PROJECT').toUpperCase();
    BRAND.billing = (b.billing || []).map(s => NX.fillTokens(s, b).toUpperCase()).filter(Boolean).slice(0, 6);
    BRAND.reviews = (b.reviews || []).filter(r => r && r.text).map((r, i) => ({ id: r.id || ('r' + i), text: r.text, by: (r.by || '').toUpperCase() }));
    setBrandColors(b.colors);
    Object.assign(CONTACT, { phone: '', web: '', lic: '', since: '', badge: '', cta: 'BOOK NOW', tagline: '', area: '', address: '', email: '', hours: '', ig: '', fb: '', tt: '', yt: '', x: '', wa: '' }, b.contact || {});
    CONTACT.cta = (CONTACT.cta || 'BOOK NOW').toUpperCase(); CONTACT.web = (CONTACT.web || '').toUpperCase().replace(/^HTTPS?:\/\//, '').replace(/\/$/, '');
    ['lic', 'since', 'badge', 'area'].forEach(k => (CONTACT[k] = (CONTACT[k] || '').toUpperCase()));
    await NX.setFonts(b.fonts);   // first: a wordmark logo is drawn in the brand's sans
    const im = await brandImages(b); IMG.logoW = im.w; IMG.logoB = im.b; IMG.mark = im.mark; LOGO_AR = im.ar; if (im.grunge) IMG.grunge = im.grunge;
    VID.clear();
  };
  // contrast helper for the kit editor
  NX.contrast = (a, b) => { const L = h => { const v = [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
    const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
})();
