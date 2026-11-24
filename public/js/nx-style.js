'use strict';
/* NexGen Studio: looks. A look is the colours (background, text, accent, second accent, cards), the four fonts and an
   optional seasonal touch (particles + an edge decoration) for one clip. It starts from the brand kit, or from the
   occasion for holiday templates, and can be switched to a preset vibe, a holiday look, or set colour by colour.
   NX.lookFor() resolves a clip's look; NX.applyLook() pushes it into the engine; NX.styleUI() draws the Style pane. */
window.NX = window.NX || {};
(() => {
  const P = (accent, ink, text, accent2, paper, deep1, deep2) => ({ accent, ink, text, accent2, paper, deep1, deep2 });
  // preset vibes: palette + font pairing. Light vibes have a light background with dark text.
  NX.VIBES = [
    { id: 'midnight', name: 'Midnight', pal: P('#4DA3FF', '#0B1426', '#FFFFFF', '#9CC9FF', '#EEF3FA', '#13254A', '#050A14'), fonts: { sans: 'inter', serif: 'fraunces', display: 'anton', script: 'kalam' } },
    { id: 'noir', name: 'Noir & Gold', pal: P('#D4AF37', '#0A0A0A', '#F7F3EA', '#F3E5AB', '#F5EFE0', '#1C1A14', '#000000'), fonts: { sans: 'raleway', serif: 'bodoni', display: 'abril', script: 'greatvibes' } },
    { id: 'clean', name: 'Clean White', light: true, pal: P('#FF4D2E', '#FAFAF7', '#111111', '#111111', '#111111', '#F0EFEA', '#FFFFFF'), fonts: { sans: 'inter', serif: 'instrument', display: 'anton', script: 'caveat' } },
    { id: 'blush', name: 'Blush', light: true, pal: P('#D94F70', '#FBEDEB', '#3A1F26', '#8C5A66', '#3A1F26', '#F6DADE', '#FFF8F7'), fonts: { sans: 'raleway', serif: 'playfair', display: 'abril', script: 'parisienne' } },
    { id: 'forest', name: 'Forest', pal: P('#C9A86A', '#0F1F17', '#F1EFE6', '#8FBF9A', '#F1EFE6', '#1B3527', '#06100B'), fonts: { sans: 'mont', serif: 'fraunces', display: 'bebas', script: 'caveat' } },
    { id: 'ocean', name: 'Ocean', pal: P('#2ED3C6', '#062A3A', '#EAFBFA', '#A7F0EA', '#EAF6F7', '#0B4257', '#021820'), fonts: { sans: 'poppins', serif: 'lora', display: 'righteous', script: 'pacifico' } },
    { id: 'sunset', name: 'Sunset', pal: P('#FF7A45', '#1E0E1A', '#FFF3E8', '#FFC07A', '#FFF1E6', '#3A1630', '#0D050B'), fonts: { sans: 'bricolage', serif: 'fraunces', display: 'abril', script: 'lobster' } },
    { id: 'electric', name: 'Electric', pal: P('#C6FF00', '#0B0B12', '#FFFFFF', '#7CF3FF', '#F2F2F2', '#15151F', '#030306'), fonts: { sans: 'archivo', serif: 'dmserif', display: 'archivoblack', script: 'marker' } },
    { id: 'sand', name: 'Sand', light: true, pal: P('#B5562C', '#F2E9DC', '#2A1E16', '#6B4F3A', '#2A1E16', '#EADBC6', '#FBF6EF'), fonts: { sans: 'spartan', serif: 'playfair', display: 'teko', script: 'satisfy' } },
    { id: 'royal', name: 'Royal', pal: P('#A78BFA', '#160B33', '#F4F0FF', '#F0ABFC', '#F3F0FF', '#2A1660', '#07031A'), fonts: { sans: 'raleway', serif: 'cinzel', display: 'abril', script: 'greatvibes' } },
    { id: 'cherry', name: 'Cherry', pal: P('#FF3B4E', '#2A0A0E', '#FFF1F1', '#FFB4A2', '#FFF1F1', '#4A1219', '#0E0305'), fonts: { sans: 'mont', serif: 'dmserif', display: 'anton', script: 'pacifico' } },
    { id: 'mint', name: 'Mint', light: true, pal: P('#0E9F6E', '#EAF6F0', '#0F2A20', '#145A43', '#0F2A20', '#D3EEE2', '#F7FCFA'), fonts: { sans: 'dmsans', serif: 'lora', display: 'righteous', script: 'kalam' } },
    { id: 'pop', name: 'Pop', pal: P('#FFD400', '#1A1AFF', '#FFFFFF', '#FF6EC7', '#FFF7D6', '#3434FF', '#0B0BAA'), fonts: { sans: 'poppins', serif: 'yeseva', display: 'luckiest', script: 'pacifico' } },
    { id: 'mono', name: 'Monochrome', pal: P('#FFFFFF', '#111111', '#FFFFFF', '#9A9A9A', '#EDEDED', '#1E1E1E', '#050505'), fonts: { sans: 'grotesk', serif: 'baskerville', display: 'bebas', script: 'marker' } },
  ];
  NX.FONT_PAIRS = [
    ['Classic', { sans: 'mont', serif: 'corm', display: 'bebas', script: 'caveat' }], ['Modern', { sans: 'inter', serif: 'fraunces', display: 'anton', script: 'kalam' }],
    ['Bold', { sans: 'archivo', serif: 'dmserif', display: 'archivoblack', script: 'marker' }], ['Friendly', { sans: 'poppins', serif: 'lora', display: 'righteous', script: 'pacifico' }],
    ['Elegant', { sans: 'raleway', serif: 'bodoni', display: 'abril', script: 'dancing' }], ['Luxe', { sans: 'raleway', serif: 'cinzel', display: 'abril', script: 'greatvibes' }],
    ['Street', { sans: 'barlowc', serif: 'lora', display: 'shoulders', script: 'marker' }], ['Kitchen', { sans: 'bricolage', serif: 'fraunces', display: 'abril', script: 'lobster' }],
    ['Playful', { sans: 'fredoka', serif: 'yeseva', display: 'luckiest', script: 'pacifico' }], ['Retro', { sans: 'bricolage', serif: 'yeseva', display: 'monoton', script: 'lobster' }],
    ['Studio', { sans: 'spartan', serif: 'playfair', display: 'teko', script: 'satisfy' }], ['Festive', { sans: 'mont', serif: 'playfair', display: 'abril', script: 'mountains' }],
    ['Spooky', { sans: 'archivo', serif: 'yeseva', display: 'creepster', script: 'kaushan' }], ['Sale', { sans: 'archivo', serif: 'dmserif', display: 'bungee', script: 'marker' }],
  ];
  const FX_P = [['', 'None'], ['snow', 'Snow'], ['confetti', 'Confetti'], ['sparkles', 'Sparkle'], ['hearts', 'Hearts'], ['leaves', 'Leaves'], ['petals', 'Petals'], ['stars', 'Stars'], ['shamrocks', 'Shamrocks'], ['bats', 'Bats'], ['marigold', 'Marigold'], ['embers', 'Embers']];
  const FX_D = [['', 'None'], ['lights', 'Lights'], ['ornaments', 'Ornaments'], ['bunting', 'Bunting'], ['papel', 'Papel picado'], ['florals', 'Flowers'], ['webs', 'Webs'], ['frost', 'Frost']];
  const ICO = {
    '': '<circle cx="12" cy="12" r="8"/><path d="M6.5 17.5l11-11"/>', snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5"/>',
    confetti: '<path d="M4 20l5-13 8 8z"/><path d="M14 4l1 2M19 6l-2 1M20 11h-2M12 3v2"/>', sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
    hearts: '<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>', leaves: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19L13 11"/>',
    petals: '<path d="M12 4c3 3 3 7 0 10-3-3-3-7 0-10zM5 12c3-1 6 0 7 2-2 2-5 2-7-2zM19 12c-3-1-6 0-7 2 2 2 5 2 7-2z"/><path d="M12 14v6"/>', stars: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z"/>',
    shamrocks: '<circle cx="12" cy="7.5" r="3.2"/><circle cx="7.8" cy="13" r="3.2"/><circle cx="16.2" cy="13" r="3.2"/><path d="M12 13v8"/>', bats: '<path d="M2 9c3 0 4 2 5 3 1-2 3-3 5-3s4 1 5 3c1-1 2-3 5-3-1 3-3 7-6 7-1-1-2-2-4-2s-3 1-4 2c-3 0-5-4-6-7z"/>',
    marigold: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>', embers: '<path d="M12 21c-4 0-6-3-6-6 0-4 4-6 4-10 3 2 5 4 5 7 1-1 1-2 1-3 2 2 3 4 3 6 0 3-3 6-7 6z"/>',
    lights: '<path d="M2 5c5 4 15 4 20 0"/><path d="M6 7.5v2M12 9v2M18 7.5v2"/><circle cx="6" cy="12" r="1.8"/><circle cx="12" cy="13.5" r="1.8"/><circle cx="18" cy="12" r="1.8"/>',
    ornaments: '<path d="M8 2v6M16 2v9"/><circle cx="8" cy="11.5" r="3.5"/><circle cx="16" cy="15" r="3.5"/>', bunting: '<path d="M2 5c5 3 15 3 20 0"/><path d="M5 6.5l2 6 2-5.4M11 7.6l1 6 1.5-6M15.5 7.4l2 5.6 1.5-6.4"/>',
    papel: '<path d="M3 4h18"/><rect x="4" y="4" width="7" height="9"/><rect x="13" y="4" width="7" height="9"/><circle cx="7.5" cy="8.5" r="1.5"/><circle cx="16.5" cy="8.5" r="1.5"/>',
    florals: '<circle cx="12" cy="12" r="2"/><path d="M12 4a3 3 0 010 6 3 3 0 010-6zM12 14a3 3 0 010 6 3 3 0 010-6zM4 12a3 3 0 016 0 3 3 0 01-6 0zM14 12a3 3 0 016 0 3 3 0 01-6 0z"/>',
    webs: '<path d="M3 3l18 18M3 3v12M3 3h12M3 9c3 0 6 3 6 6M3 15c5 0 10-5 12-12"/>', frost: '<path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19"/>',
  };
  const ico = k => '<svg class="i" viewBox="0 0 24 24">' + (ICO[k] || ICO['']) + '</svg>';

  // ------------------------------------------------------------------ resolving a clip's look
  NX.defaultHol = () => HOL.upcoming()[0].id;
  const brandPal = b => Object.assign({ text: '#FFFFFF' }, b.colors);
  NX.lookFor = (proj, tpl, brand) => {
    const st = (proj && proj.style) || {}, hol = tpl && tpl.hol ? (proj.hol && HOL.THEMES[proj.hol] ? proj.hol : NX.defaultHol()) : null;
    const fam = tpl && tpl.cf && K7.FAM[tpl.cf];
    let colors = brandPal(brand), fonts = Object.assign({}, brand.fonts), vibe = st.vibe || (hol ? 'occasion' : fam && !fam.brandFirst ? 'family' : 'brand');   // brandFirst (V24): the format opens in the brand's own colours
    const th = v => HOL.THEMES[v.slice(4)];
    if (vibe === 'occasion' && hol) { colors = Object.assign({}, HOL.THEMES[hol].pal); fonts = Object.assign({}, HOL.THEMES[hol].fonts); }
    else if (vibe === 'family' && fam) { colors = Object.assign({}, fam.pal); fonts = Object.assign({}, fam.fonts); }
    else if (vibe.startsWith('hol:') && th(vibe)) { colors = Object.assign({}, th(vibe).pal); fonts = Object.assign({}, th(vibe).fonts); }
    else { const v = NX.VIBES.find(x => x.id === vibe); if (v) { colors = Object.assign({}, v.pal); fonts = Object.assign({}, v.fonts); } }
    if (st.colors) colors = Object.assign({}, colors, st.colors);
    if (st.fonts) fonts = Object.assign({}, fonts, st.fonts);
    return { colors, fonts, fx: st.fx || null, hol, vibe, bg: st.bg && st.bg.c ? Object.assign({}, st.bg) : null };
  };
  // the brand's base logo pair, recorded after every applyBrand so light palettes can swap them
  const BASE = { w: null, b: null };
  const ab = NX.applyBrand; NX.applyBrand = async b => { await ab(b); BASE.w = IMG.logoW; BASE.b = IMG.logoB; };
  NX.applyLook = async (L, tpl) => {
    setBrandColors(L.colors);
    await NX.setFonts(L.fonts);
    if (BASE.w) { if (LIGHTPAL) { IMG.logoW = BASE.b; IMG.logoB = BASE.w; } else { IMG.logoW = BASE.w; IMG.logoB = BASE.b; } }
    window.HOLFX = tpl && tpl.hol ? (L.fx || null) : null;
    // the person's own background (photo or video). DPG media is always shown whole, never cropped.
    const bb = NX.app && NX.app.B ? NX.app.B() : null; window.BGX = L.bg ? Object.assign({ whole: !!(bb && (bb.builtin || bb.dpgRules)) }, L.bg) : null;
    window.OVERLAY = tpl && !tpl.hol && L.fx && (L.fx.p || L.fx.d) ? (t => HOL.overlay(t, L.fx)) : null;
    TWC.clear();
  };
  NX.lookKey = L => JSON.stringify([L.colors, L.fonts, L.fx, L.hol, L.bg]);

  // ------------------------------------------------------------------ the Style pane
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };
  const SLOTS = [['ink', 'Background'], ['text', 'Text'], ['accent', 'Accent'], ['accent2', 'Accent 2'], ['paper', 'Cards']];
  function vibeCard(name, pal, fonts, pressed, onclick, sub) {
    const b = el('button', 'vibe'); b.type = 'button'; b.setAttribute('aria-pressed', String(!!pressed));
    const vs = el('div', 'vs'); vs.style.background = `linear-gradient(160deg, ${pal.deep1 || pal.ink} 0%, ${pal.ink} 70%)`;
    const big = el('span', 'big', 'Aa'); big.style.color = pal.text || '#fff'; vs.appendChild(big);
    if (fonts && fonts.display) NX.useFont(fonts.display).then(ok => { const ff = ok && NX.fontCSS ? NX.fontCSS(fonts.display) : null; if (ff) big.style.fontFamily = ff; });
    const dots = el('span', 'dots'); [pal.accent, pal.accent2 || pal.accent, pal.paper].forEach(c => { const i = el('i'); i.style.background = c; dots.appendChild(i); }); vs.appendChild(dots);
    b.appendChild(vs); const vn = el('div', 'vn'); vn.appendChild(el('span', '', name)); if (sub) vn.appendChild(el('small', '', sub)); b.appendChild(vn);
    b.onclick = onclick; return b;
  }
  NX.styleUI = (box, A) => {
    const S = A.S, proj = S.proj, tpl = S.tpl, brand = A.B(); box.textContent = '';
    if (!proj || !tpl) return;
    const st = proj.style = proj.style || {}, L = NX.lookFor(proj, tpl, brand);
    const changed = (structural, keepUI) => { A.styleChanged(structural, keepUI); };
    const sec = (title, note, right) => { const s = el('section', 'st-sec'), h = el('h3'); h.appendChild(el('span', '', title)); if (right) h.appendChild(right); s.appendChild(h); if (note) s.appendChild(el('p', '', note)); box.appendChild(s); return s; };

    // occasion (holiday templates)
    if (tpl.hol) {
      const s = sec('Occasion', 'The holiday sets the greeting, the decorations and the music.'), g = el('div', 'occ'); s.appendChild(g);
      for (const { id, days } of HOL.upcoming()) {
        const th = HOL.THEMES[id], b = el('button'); b.type = 'button'; b.setAttribute('aria-pressed', String(L.hol === id));
        const bar = el('i'); bar.style.background = `linear-gradient(90deg, ${th.pal.ink}, ${th.pal.accent}, ${th.pal.accent2})`; b.appendChild(bar);
        b.appendChild(document.createTextNode(th.name)); b.appendChild(el('small', '', days === 0 ? 'today' : days === 1 ? 'tomorrow' : 'in ' + days + ' days'));
        b.onclick = () => { const old = HOL.THEMES[L.hol]; if (old && proj.name && proj.name.startsWith(old.name + ' ')) proj.name = th.name + proj.name.slice(old.name.length); proj.hol = id; if (st.vibe && st.vibe.startsWith('hol:')) delete st.vibe; changed(true); }; g.appendChild(b);
      }
    }
    // same content, another family (industry templates): the clip's own words and footage rendered in each sibling style
    if (A.variantSibs && A.variantSibs().length) {
      const sv = sec('Try another style', 'Same words, same footage, a different design. Tap one to switch; your edits come with you.'), g0 = el('div', 'var-row'); sv.appendChild(g0);
      for (const t of A.variantSibs()) {
        const fam = K7.FAM[t.cf], b = el('button', 'var-c'); b.type = 'button'; b.dataset.id = t.id; b.title = t.blurb;
        const pv = el('div', 'pv'); pv.style.background = `linear-gradient(165deg, ${fam.pal.deep1}, ${fam.pal.ink} 55%, ${fam.pal.deep2})`; const bar = el('i'); bar.style.background = fam.pal.accent; pv.appendChild(bar); b.appendChild(pv);
        b.appendChild(el('span', '', t.name)); b.onclick = () => A.switchFamily(t); g0.appendChild(b);
      }
      setTimeout(() => A.variantThumbs((id, src) => { const c = box.querySelector('.var-c[data-id="' + id + '"] .pv'); if (!c) return; let im = c.querySelector('img'); if (!im) { im = el('img'); im.alt = ''; c.appendChild(im); } im.src = src; }), 200);
    }
    // looks
    const famL = tpl.cf && K7.FAM[tpl.cf], famN = famL && NX.familyOf(tpl.id), base = tpl.hol ? 'occasion' : famL && !famL.brandFirst ? 'family' : 'brand';
    const reset = el('button', 'reset', 'Back to ' + (tpl.hol ? 'the occasion' : famL && !famL.brandFirst ? 'the ' + (famN ? famN.name : 'family') : 'brand') + ' look'); reset.type = 'button';
    reset.onclick = () => { delete st.vibe; delete st.colors; delete st.fonts; changed(); };
    let s = sec('Looks', 'One tap changes the colours and fonts together. Fine-tune below.', (st.vibe || st.colors || st.fonts) ? reset : null);
    let g = el('div', 'vibes'); s.appendChild(g);
    const isV = v => (st.vibe || base) === v && !st.colors && !st.fonts;
    g.appendChild(vibeCard(brand.builtin ? 'DPG brand' : (brand.short || brand.name), brandPal(brand), brand.fonts, isV('brand'), () => { st.vibe = 'brand'; delete st.colors; delete st.fonts; changed(); }, 'Brand kit'));
    if (tpl.hol) { const th = HOL.THEMES[L.hol]; g.appendChild(vibeCard(th.name, th.pal, th.fonts, isV('occasion'), () => { delete st.vibe; delete st.colors; delete st.fonts; changed(); }, 'Occasion')); }
    if (famL) g.insertBefore(vibeCard(famN ? famN.name : 'Family', famL.pal, famL.fonts, isV('family'), () => { delete st.vibe; delete st.colors; delete st.fonts; changed(); }, 'This style’s look'), g.firstChild);
    for (const v of NX.VIBES) g.appendChild(vibeCard(v.name, v.pal, v.fonts, isV(v.id), () => { st.vibe = v.id; delete st.colors; delete st.fonts; changed(); }, v.light ? 'Light' : ''));
    if (!tpl.hol) {
      const more = el('details'); more.style.marginTop = '12px'; const sm = el('summary', '', 'Holiday looks'); sm.style.cssText = 'cursor:pointer;font-size:13px;font-weight:600;color:var(--mute)'; more.appendChild(sm);
      const g2 = el('div', 'vibes'); g2.style.marginTop = '10px'; more.appendChild(g2); s.appendChild(more);
      for (const { id, days } of HOL.upcoming()) { const th = HOL.THEMES[id]; g2.appendChild(vibeCard(th.name, th.pal, th.fonts, isV('hol:' + id), () => { st.vibe = 'hol:' + id; delete st.colors; delete st.fonts; if (!st.fx) st.fx = { p: th.fx, d: HOL.OVER_DECOR.includes(th.decor) ? th.decor : '', a: 1 }; changed(); }, days < 45 ? 'in ' + days + ' d' : '')); }
      if (st.vibe && st.vibe.startsWith('hol:')) more.open = true;
    }
    // background: the template's own, or the person's photo or video behind everything (templates that support it)
    if (typeof DIR !== 'undefined' && DIR && DIR.bgSwap) {
      const bg = st.bg && st.bg.c ? st.bg : null, clear = el('button', 'reset', 'Use the template’s background'); clear.type = 'button'; clear.onclick = () => { delete st.bg; changed(); };
      const sb = sec('Background', 'Put your own photo or video behind this design. Your footage in the shots stays as it is.', bg ? clear : null);
      const row = el('div', 'bg-row'); sb.appendChild(row);
      const own = el('button', 'bg-t own'); own.type = 'button'; own.setAttribute('aria-pressed', String(!bg)); own.appendChild(el('span', 'bt', 'Template')); own.onclick = () => { delete st.bg; changed(); }; row.appendChild(own);
      const up = el('button', 'bg-t add'); up.type = 'button'; up.appendChild(el('span', 'bt', '+ Upload a photo')); up.title = 'Add a photo from this device';
      up.onclick = () => { const inp = el('input'); inp.type = 'file'; inp.accept = 'image/*,video/*'; inp.onchange = () => { const f = inp.files && inp.files[0]; if (!f) return; const job = A.queueFootage(f); if (job) job.done = id => { if (!id) return; st.bg = Object.assign({ blur: 0, dim: 0.35, tint: false }, st.bg || {}, { c: id, in: 0 }); changed(); }; }; inp.click(); };
      row.appendChild(up);
      const media = NX.brandClips().slice().sort((a, b) => (b.still ? 1 : 0) - (a.still ? 1 : 0) || String(b.addedAt || '').localeCompare(String(a.addedAt || ''))).slice(0, 30);
      for (const r of media) { const b = el('button', 'bg-t'); b.type = 'button'; b.title = r.name; b.setAttribute('aria-pressed', String(!!bg && bg.c === r.id)); const im = el('img'); im.alt = ''; im.loading = 'lazy'; if (r.poster) im.src = r.poster; b.appendChild(im);
        b.appendChild(el('span', 'bk', r.still ? 'Photo' : 'Video')); b.onclick = () => { st.bg = Object.assign({ blur: 0, dim: 0.35, tint: false }, st.bg || {}, { c: r.id, in: r.still ? 0 : Math.min(2, (r.dur || 4) / 3) }); changed(); }; row.appendChild(b); }
      if (!media.length) sb.appendChild(el('p', '', 'Upload a photo, or add photos and clips in Footage, and they show up here.')).style.cssText = 'font-size:12px;color:var(--dim);margin:8px 0 0';
      if (bg) {
        const slider = (label, key, min, max, step, fmt) => { const w = el('div', 'fld bg-sl'), lab = el('label'), v = el('b', '', fmt(bg[key] || 0)), inp = el('input'); lab.appendChild(document.createTextNode(label + ' ')); lab.appendChild(v); inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step; inp.value = bg[key] || 0; inp.setAttribute('aria-label', label);
          inp.oninput = () => { bg[key] = +inp.value; v.textContent = fmt(+inp.value); changed(false, true); }; inp.onchange = () => changed(); w.appendChild(lab); w.appendChild(inp); sb.appendChild(w); };
        slider('Blur', 'blur', 0, 40, 1, x => x ? x + ' px' : 'off'); slider('Darken', 'dim', 0, 0.85, 0.05, x => Math.round(x * 100) + '%');
        const tl = el('label', 'bg-tint'), cb = el('input'); cb.type = 'checkbox'; cb.checked = !!bg.tint; cb.onchange = () => { bg.tint = cb.checked; changed(); }; tl.appendChild(cb); tl.appendChild(document.createTextNode(' Tint it with the accent colour')); sb.appendChild(tl);
        if (brand.builtin || brand.dpgRules) sb.appendChild(el('p', '', 'DPG media is shown whole, never cropped.')).style.cssText = 'font-size:12px;color:var(--dim);margin:8px 0 0';
      }
    }
    // colours
    const shuffle = el('button', 'reset', 'Shuffle'); shuffle.type = 'button';
    shuffle.onclick = () => { const pool = NX.VIBES.map(v => v.pal).concat(Object.values(HOL.THEMES).map(t => t.pal)); const p = pool[Math.floor(Math.random() * pool.length)]; st.colors = Object.assign({}, p); changed(); };
    s = sec('Colours', 'Tap a colour to change it. Background is behind titles and endings; Cards is the panel colour.', shuffle);
    const sw = el('div', 'swatches'); s.appendChild(sw);
    for (const [k, label] of SLOTS) {
      const w = el('label', 'swc'), i = el('i'), inp = el('input'); inp.type = 'color'; const cur = (L.colors[k] || '#FFFFFF').toLowerCase(); inp.value = cur; i.style.background = cur;
      inp.setAttribute('aria-label', label + ' colour'); inp.oninput = () => { i.style.background = inp.value; st.colors = Object.assign({}, st.colors || {}, { [k]: inp.value.toUpperCase() }); if (k === 'ink') { delete st.colors.deep1; delete st.colors.deep2; } changed(false, true); };
      inp.onchange = () => changed();
      w.appendChild(i); w.appendChild(inp); w.appendChild(document.createTextNode(label)); sw.appendChild(w);
    }
    const lum = h => { const v = [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16) / 255); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
    const cr = NX.contrast(L.colors.text || '#FFFFFF', L.colors.ink); if (cr < 3.5) s.appendChild(el('p', 'warn', 'Text and background are close in brightness, so titles may be hard to read.')).style.cssText = 'font-size:12px;color:var(--warn);margin:8px 0 0';
    if (lum(L.colors.ink) > 0.55) s.appendChild(el('p', '', 'Light look: logos switch to their dark version automatically.')).style.cssText = 'font-size:12px;color:var(--dim);margin:8px 0 0';
    // fonts
    s = sec('Fonts', 'A pairing sets all four, or pick each one.');
    const pairs = el('div', 'pairs'); s.appendChild(pairs);
    for (const [name, f] of NX.FONT_PAIRS) {
      const b = el('button', '', name); b.type = 'button'; b.setAttribute('aria-pressed', String(JSON.stringify(f) === JSON.stringify(L.fonts)));
      NX.useFont(f.display).then(ok => { const ff = ok && NX.fontCSS ? NX.fontCSS(f.display) : null; if (ff) b.style.fontFamily = ff; }); b.onclick = () => { st.fonts = Object.assign({}, f); changed(); }; pairs.appendChild(b);
    }
    const det = el('details'); det.style.marginTop = '12px'; const sm2 = el('summary', '', 'Pick each font'); sm2.style.cssText = 'cursor:pointer;font-size:13px;font-weight:600;color:var(--mute)'; det.appendChild(sm2); s.appendChild(det);
    for (const [sl, SL] of Object.entries(NX.SLOTS)) {
      const w = el('div', 'fld'); w.style.marginTop = '10px'; const id = 'st-' + sl, lab = el('label', '', SL.label); lab.htmlFor = id; w.appendChild(lab);
      const sel = el('select'); sel.id = id; const opts = Object.assign({}, NX.FONTS[sl]); if (!opts[L.fonts[sl]]) { const lib = (window.NX && NX.allFontLib) ? NX.allFontLib() : NX.FONTLIB; if (lib[L.fonts[sl]]) opts[L.fonts[sl]] = { label: lib[L.fonts[sl]].l }; }
      Object.entries(opts).forEach(([k, v]) => { const o = el('option', '', v.label); o.value = k; sel.appendChild(o); }); sel.value = L.fonts[sl];
      const pv = el('div', 'fontpv'); pv.textContent = sl === 'script' ? 'see you this weekend!' : sl === 'serif' ? 'Quietly beautiful work.' : sl === 'display' ? 'BUILT TO LAST' : 'BOOK YOUR SPOT';
      pv.style.fontWeight = sl === 'sans' ? '800' : sl === 'serif' ? '600' : '400'; if (sl === 'serif') pv.style.fontStyle = 'italic';
      const prev = () => NX.useFont(sel.value).then(ok => { const ff = ok && NX.fontCSS ? NX.fontCSS(sel.value) : null; if (ff) pv.style.fontFamily = ff; }); prev();
      sel.onchange = () => { st.fonts = Object.assign({}, st.fonts || {}, { [sl]: sel.value }); prev(); changed(); };
      w.appendChild(sel); w.appendChild(pv); det.appendChild(w);
    }
    // seasonal touch
    const th = L.hol ? HOL.THEMES[L.hol] : null, fx = st.fx || (th ? { p: th.fx, d: th.decor, a: 1 } : { p: '', d: '', a: 1 });
    s = sec(tpl.hol ? 'Effects' : 'Seasonal touch', tpl.hol ? 'Particles and decorations for this occasion. Change or turn them off.' : 'Add falling snow, confetti, lights and more over any template.');
    const sub = t => { const p = el('p', '', t); p.style.cssText = 'font-size:12px;font-weight:600;color:var(--mute);margin:8px 0 6px'; s.appendChild(p); };
    sub('Particles'); g = el('div', 'fx-grid'); s.appendChild(g);
    for (const [k, label] of FX_P) { const b = el('button', 'fx'); b.type = 'button'; b.innerHTML = ico(k); b.appendChild(document.createTextNode(label)); b.setAttribute('aria-pressed', String((fx.p || '') === k)); b.onclick = () => { st.fx = Object.assign({}, fx, { p: k }); changed(); }; g.appendChild(b); }
    sub(tpl.hol ? 'Decoration along the top' : 'Decoration'); g = el('div', 'fx-grid'); s.appendChild(g);
    for (const [k, label] of FX_D) { const b = el('button', 'fx'); b.type = 'button'; b.innerHTML = ico(k); b.appendChild(document.createTextNode(label)); b.setAttribute('aria-pressed', String((fx.d || '') === k)); b.onclick = () => { st.fx = Object.assign({}, fx, { d: k }); changed(); }; g.appendChild(b); }
    const am = el('label', 'amount'); am.appendChild(document.createTextNode('Amount')); const rg = el('input'); rg.type = 'range'; rg.min = '0.4'; rg.max = '1.8'; rg.step = '0.1'; rg.value = String(fx.a || 1);
    rg.oninput = () => { st.fx = Object.assign({}, fx, { a: +rg.value }); changed(false, true); }; am.appendChild(rg); s.appendChild(am);
    if (st.fx) { const r2 = el('button', 'reset', tpl.hol ? 'Use the occasion’s effects' : 'Remove the seasonal touch'); r2.type = 'button'; r2.style.marginTop = '10px'; r2.onclick = () => { delete st.fx; changed(); }; s.appendChild(r2); }
  };
})();
