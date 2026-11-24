'use strict';
/* NexGen templates V16 (Nov 6): printing & screen printing, plus detailing, HVAC and restaurant pieces.
   ?v=pressx    Screen Print Pull  the screen lowers on a shirt, ink, the squeegee pulls and your logo/design prints, flash cure
   ?v=mockx     Merch Mockups      your logo or design on 2–4 products (tee, hoodie, cap, tote, mug, card, sticker), then all
   ?v=cardsx    Business Cards     a stack drops, the top card flips to the back, the cards fan out; matte, gloss or foil
   ?v=flyerx    Print Run          sheets fly out of the press onto a stack while the count runs; the top flyer comes forward
   ?v=glossx    Gloss Meter        a polisher takes the swirl marks out of the paint while the gloss reading climbs
   ?v=filterx   Air Filter         the dirty filter slides out, a clean one slides in, the airflow picks up
   ?v=deliverx  Delivery Tracker   a map with the route, the rider moving along it and the order steps ticking off
   The design defaults to the brand's own logo; switch to "your design image" to use an uploaded file. Prices, quantities
   and times are sample text to replace; a lone dash (-) leaves an optional line off. */
(() => {
  const P = (accent, ink, text, accent2, paper, deep1, deep2) => ({ accent, ink, text, accent2, paper, deep1, deep2 });
  Object.assign(K7.FAM, {
    pressx: { pal: P('#FF4F00', '#0D0D0F', '#F5F5F2', '#00B4D8', '#F5F5F2', '#1B1B20', '#060608'), fonts: { sans: 'mont', serif: 'dmserif', display: 'bebas', script: 'marker' }, music: 'pulse', bpm: 116 },
    mockx: { pal: P('#7C5CFF', '#0C0B14', '#F4F3FA', '#FF5C8A', '#F4F3FA', '#18152A', '#05040A'), fonts: { sans: 'mont', serif: 'fraunces', display: 'archivoblack', script: 'pacifico' }, music: 'day', bpm: 108 },
    cardsx: { pal: P('#D4AF37', '#0E0D0B', '#F7F4EC', '#B8B8B8', '#F7F4EC', '#1D1A15', '#060504'), fonts: { sans: 'mont', serif: 'playfair', display: 'bodoni', script: 'greatvibes' }, music: 'lounge', bpm: 90 },
    flyerx: { pal: P('#00B4D8', '#0A0F14', '#F2F7FA', '#FF4F9A', '#F2F7FA', '#13202B', '#03070A'), fonts: { sans: 'mont', serif: 'dmserif', display: 'anton', script: 'marker' }, music: 'pulse', bpm: 120 },
    glossx: { pal: P('#FF8A00', '#08090B', '#F4F5F7', '#5CE1E6', '#F4F5F7', '#15181D', '#040506'), fonts: { sans: 'mont', serif: 'lora', display: 'oswald', script: 'kalam' }, music: 'cinematic', bpm: 92 },
    filterx: { pal: P('#4CC9F0', '#07101A', '#F2F7FA', '#90E0EF', '#F2F7FA', '#0F1E2C', '#03080D'), fonts: { sans: 'inter', serif: 'lora', display: 'oswald', script: 'kalam' }, music: 'day', bpm: 100 },
    deliverx: { pal: P('#FF5A36', '#0E0B0A', '#FFF7F2', '#2EC4B6', '#FFF7F2', '#1F1714', '#060403'), fonts: { sans: 'mont', serif: 'dmserif', display: 'anton', script: 'marker' }, music: 'day', bpm: 112 },
  });
})();

STUDIO_REG['nx6'] = (() => {
  const V = QS.get('v') || 'pressx';
  const FM = K7.FAM[V] || K7.FAM.pressx;
  if (!window.STUDIO) setBrandColors(FM.pal);
  const G = K3.G, D = K3.D, seg = K7.seg, TAU = Math.PI * 2, mix = K7.mix;
  const IND = BRAND.cat || BRAND.industry || 'general';
  const NONE = k => ['nofoot.' + k, 0];
  const opts = list => list.map(([value, label]) => ({ value, label }));
  const shot = (k, label, d, ph) => { const s = SHOT(k, NONE(k), { label, group: 'Footage', kind: 'any', ph, d: d + 0.3 }); return { c: s[0], in: s[1], d, start: 0 }; };
  const fa = (t, t0, d) => E.outC(seg(t, t0, d || 0.5));
  const musicBed = dur => ['music', 0, dur, 0.95, { style: FM.music, bpm: FM.bpm, key: 0, end: dur - 0.6 }];
  const lum = h => { const v = [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16) / 255); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const onCol = h => (/^#[0-9a-f]{6}$/i.test(h) && lum(h) > 0.45 ? '#0B0B0B' : '#FFFFFF');
  const rich = (s, col, hl) => String(s || '').split(/(\*[^*]+\*)/).filter(Boolean).map(p => (p[0] === '*' ? [p.slice(1, -1), hl || OR] : [p, col || WHT]));
  const plain = s => String(s || '').replace(/\*/g, '');
  const off = s => (/^[-–—]$/.test(String(s || '').trim()) ? '' : s);
  const DASH = 'Type a dash (-) to leave it off.';
  const ph = (s, t, r, o) => { const w = K3.wholeIn(s.c, r); K3.clip(s.c, s.in, Math.max(0, t - (s.start || 0)), w, o); return w; };
  function within(path, fn) { ctx.save(); if (!VID.collecting && path) { ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); ctx.beginPath(); path(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clip(); } fn(); ctx.restore(); }
  function card(r, rad, a, col) { if (VID.collecting || a <= 0) return; const c = G(); c.globalAlpha = a; c.fillStyle = col || DEEP1; c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 60; c.shadowOffsetY = 24; c.beginPath(); c.roundRect(r[0], r[1], r[2], r[3], rad); c.fill(); D(); }
  const bg = (a, b) => { if (VID.collecting) return; const c = G(), g = c.createRadialGradient(W / 2, H * 0.42, 60, W / 2, H * 0.45, H * 0.85); g.addColorStop(0, a || DEEP1); g.addColorStop(1, b || DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); };
  function chip(str, x, y, o) {
    o = o || {}; const p = o.p === undefined ? 1 : o.p; if (p <= 0 || VID.collecting || !str) return 0;
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
    if (o.line) { const f = F(800, Math.min(70, fitSize(plain(o.line), 800, 900, 70, 'Mont', -1)), 'Mont'); T(rich(o.line, WHT, o.hl), W / 2, y + lh / 2 + 150, f, { align: 'center', p: seg(ot, 0.7, 0.5), ls: -1 }); }
    const cy = y + lh / 2 + (o.gap || 320), cp = seg(ot, 1.3, 0.4);
    if (cp > 0 && !VID.collecting) { const f = F(800, Math.min(34, fitSize(CONTACT.cta, 800, 740, 34, 'Mont', 5)), 'Mont'), tw = textW(CONTACT.cta, f, 5), bw = Math.min(960, tw + 100), c = G(); c.globalAlpha = E.outC(cp);
      c.fillStyle = OR; c.beginPath(); c.roundRect(W / 2 - bw / 2, cy - 46, bw, 92, 46); c.fill(); setF(f, 5); c.fillStyle = onCol(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CONTACT.cta, W / 2, cy + 2); D(); }
    K7.txt(K7.contact().join('   ·   '), W / 2, cy + 125, F(700, 28, 'Mont'), WA(0.8), { align: 'center', a: fa(ot, 1.8, 0.4), ls: 3 });
    if (CONTACT.lic) K7.txt(CONTACT.lic, W / 2, cy + 180, F(600, 22, 'Mont'), WA(0.6), { align: 'center', a: fa(ot, 1.9, 0.4), ls: 3 });
  }
  const closeCues = (ev, OUT) => { ev.push(['swell', OUT - 0.45, 0.25, 0], ['whoosh', OUT, 0.3, 0], ['pop', OUT + 0.45, 0.3, 0], ['chime', OUT + 1.3, 0.28, 0], ['tink', OUT + 1.9, 0.18, 0.3]); };
  const head = (str, t, t0, y, o) => { if (!str) return; o = o || {}; const f = F(o.w || 900, Math.min(o.max || 96, fitSize(plain(str), o.w || 900, o.maxW || 940, o.max || 96, o.fam || 'Mont', -2)), o.fam || 'Mont'); T(rich(str, o.col, o.hl), o.x || W / 2, y, f, { align: o.align || 'center', ls: -2, p: seg(t, t0, 0.45), q: o.q || 0 }); };
  const ret = (dur, ev, OUT) => { closeCues(ev, OUT); return { dur, beds: [musicBed(dur)], events: ev }; };
  const isPh = c => /^(phl:|phv:|nofoot\.)/.test(String(c));
  // the brand logo tinted one colour (an ink print), cached per colour
  const TINT = new Map();
  function tinted(col, light) {
    const src = light ? IMG.logoW : IMG.logoB, k = col + (light ? 'w' : 'b') + (src && src.width); if (TINT.has(k)) return TINT.get(k); if (!src || !src.width) return src;
    const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'); g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height); TINT.set(k, c); return c;
  }
  // a design inside rect r (global px): the logo (one ink colour, or as is on a light/dark surface) or the uploaded design, whole
  function design(mode, S, t, r, surface, ink, a) {
    if (mode === 'image') { ph(S, t, r, { alpha: a }); return; } if (VID.collecting) return;
    const im = ink ? tinted(ink, false) : lum(surface) > 0.5 ? IMG.logoB : IMG.logoW; if (!im || !im.width) return; const k = Math.min(r[2] / im.width, r[3] / im.height), w = im.width * k, h = im.height * k, c = G(); c.globalAlpha = a; c.drawImage(im, r[0] + (r[2] - w) / 2, r[1] + (r[3] - h) / 2, w, h); D();
  }
  const GARM = { white: '#F4F4F2', black: '#1A1A1C', gray: '#9A9EA4', navy: '#1E2A44', red: '#B3212E', kraft: '#C9A877' };
  const garm = (k) => (k === 'accent' ? OR : GARM[k] || GARM.black);
  const DESIGN_OPTS = opts([['logo', 'Your logo (from the brand kit)'], ['image', 'Your design image']]);

  // ---------------------------------------------------------------- products, drawn at the origin; each returns its print area [x, y, w, h]
  const shade = (col, k) => mix(col, '#000000', k);
  const PROD = {
    tee: ['T-shirt', (c, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(-105, -300); c.quadraticCurveTo(0, -250, 105, -300); c.lineTo(245, -250); c.lineTo(330, -110); c.lineTo(240, -60); c.lineTo(205, -110); c.lineTo(205, 320); c.quadraticCurveTo(0, 335, -205, 320); c.lineTo(-205, -110); c.lineTo(-240, -60); c.lineTo(-330, -110); c.lineTo(-245, -250); c.closePath(); c.fill();
      c.strokeStyle = shade(col, 0.18); c.lineWidth = 14; c.beginPath(); c.moveTo(-105, -300); c.quadraticCurveTo(0, -238, 105, -300); c.stroke(); c.strokeStyle = shade(col, 0.08); c.lineWidth = 4; c.beginPath(); c.moveTo(-205, -110); c.lineTo(-180, 300); c.moveTo(205, -110); c.lineTo(180, 300); c.stroke(); return [-135, -190, 270, 260]; }],
    hoodie: ['Hoodie', (c, col) => { c.fillStyle = shade(col, 0.15); c.beginPath(); c.ellipse(0, -300, 140, 90, 0, Math.PI, TAU); c.fill(); c.fillStyle = col; c.beginPath(); c.moveTo(-120, -300); c.quadraticCurveTo(0, -220, 120, -300); c.lineTo(250, -250); c.lineTo(320, 200); c.lineTo(255, 215); c.lineTo(215, -40); c.lineTo(215, 300); c.lineTo(-215, 300); c.lineTo(-215, -40); c.lineTo(-255, 215); c.lineTo(-320, 200); c.lineTo(-250, -250); c.closePath(); c.fill();
      c.fillStyle = shade(col, 0.12); c.beginPath(); c.roundRect(-130, 120, 260, 120, 30); c.fill(); c.fillRect(-215, 280, 430, 30); c.strokeStyle = '#E8E8E8'; c.lineWidth = 6; c.beginPath(); c.moveTo(-30, -255); c.lineTo(-36, -150); c.moveTo(30, -255); c.lineTo(36, -150); c.stroke(); return [-125, -190, 250, 220]; }],
    cap: ['Cap', (c, col) => { c.fillStyle = shade(col, 0.2); c.beginPath(); c.ellipse(0, 60, 300, 70, 0, 0, TAU); c.fill(); c.fillStyle = col; c.beginPath(); c.moveTo(-250, 60); c.bezierCurveTo(-250, -230, 250, -230, 250, 60); c.closePath(); c.fill(); c.fillStyle = shade(col, 0.25); c.beginPath(); c.arc(0, -158, 16, 0, TAU); c.fill();
      c.strokeStyle = shade(col, 0.15); c.lineWidth = 4; c.beginPath(); c.moveTo(0, -150); c.lineTo(0, 55); c.stroke(); return [-150, -120, 300, 150]; }],
    tote: ['Tote bag', (c, col) => { c.strokeStyle = shade(col, 0.15); c.lineWidth = 22; c.beginPath(); c.arc(-90, -170, 70, Math.PI, TAU); c.moveTo(160, -170); c.arc(90, -170, 70, 0, Math.PI, true); c.stroke(); c.fillStyle = col; c.beginPath(); c.moveTo(-230, -170); c.lineTo(230, -170); c.lineTo(250, 300); c.lineTo(-250, 300); c.closePath(); c.fill(); return [-160, -90, 320, 300]; }],
    mug: ['Mug', (c, col) => { c.strokeStyle = col; c.lineWidth = 36; c.beginPath(); c.ellipse(190, 0, 80, 110, 0, -1.3, 1.3); c.stroke(); c.fillStyle = col; c.beginPath(); c.roundRect(-190, -200, 380, 400, [16, 16, 40, 40]); c.fill(); c.fillStyle = shade(col, 0.2); c.beginPath(); c.ellipse(0, -200, 190, 26, 0, 0, TAU); c.fill();
      const g = c.createLinearGradient(-190, 0, 190, 0); g.addColorStop(0, 'rgba(0,0,0,0.18)'); g.addColorStop(0.35, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0.25)'); c.fillStyle = g; c.fillRect(-190, -180, 380, 370); return [-140, -130, 280, 250]; }],
    card: ['Business cards', (c, col) => { c.save(); c.rotate(-0.12); c.translate(30, 40); c.fillStyle = shade(col, 0.12); c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 30; c.beginPath(); c.roundRect(-300, -172, 600, 344, 12); c.fill(); c.restore(); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 40; c.shadowOffsetY = 14; c.fillStyle = col; c.beginPath(); c.roundRect(-300, -172, 600, 344, 12); c.fill(); c.shadowBlur = 0; c.shadowOffsetY = 0; return [-200, -110, 400, 220]; }],
    sticker: ['Stickers', (c, col) => { c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 30; c.shadowOffsetY = 10; c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(0, 0, 250, 0, TAU); c.fill(); c.shadowBlur = 0; c.shadowOffsetY = 0; c.fillStyle = col; c.beginPath(); c.arc(0, 0, 226, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.moveTo(150, -190); c.quadraticCurveTo(230, -120, 236, -20); c.lineTo(205, -20); c.quadraticCurveTo(200, -110, 140, -170); c.fill(); return [-150, -150, 300, 300]; }],
    banner: ['Banners', (c, col) => { c.fillStyle = '#6B7280'; c.fillRect(-300, -190, 8, 380); c.fillRect(292, -190, 8, 380); c.fillStyle = col; c.fillRect(-290, -150, 580, 300); c.fillStyle = '#D1D5DB'; [[-280, -140], [280, -140], [-280, 140], [280, 140]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 7, 0, TAU); c.fill(); }); return [-250, -120, 500, 240]; }],
  };
  const PROD_OPTS = opts(Object.entries(PROD).map(([k, v]) => [k, v[0]]));

  // ================================================================ SCREEN PRINT PULL
  const INKS = { accent: null, black: '#16161A', white: '#F7F7F5', red: '#D62828', blue: '#1D4ED8', gold: '#E9B949', green: '#2E9E5B' };
  function pressx() {
    const TITLE = TX('title', 'Custom *screen printing.*', { label: 'Headline', group: 'Words', max: 28, hint: 'Wrap a word in *stars* to colour it.' });
    const MODE = TX('design', 'logo', { label: 'Design', group: 'The print', options: DESIGN_OPTS });
    const SHIRT = TX('shirt', 'black', { label: 'Shirt colour', group: 'The print', options: opts([['black', 'Black'], ['white', 'White'], ['gray', 'Heather gray'], ['navy', 'Navy'], ['red', 'Red'], ['accent', 'Accent colour']]) });
    const INK = TX('ink', 'accent', { label: 'Ink colour (logo)', group: 'The print', options: opts([['accent', 'Accent colour'], ['white', 'White'], ['black', 'Black'], ['red', 'Red'], ['blue', 'Blue'], ['gold', 'Gold'], ['green', 'Green']]) });
    const LINE = off(TX('line', 'T-SHIRTS  ·  HOODIES  ·  HATS', { label: 'Line under it', group: 'Words', upper: true, max: 40, hint: DASH }));
    const CURE = off(TX('cure', 'FLASH CURED', { label: 'Label at the cure', group: 'Words', upper: true, max: 16, hint: DASH }));
    const END = TX('end', 'Your logo. *Your shirts.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const S = shot('art', 'Your design image (when Design is “your design image”)', 7);
    const sc = garm(SHIRT), ink = INKS[INK] || OR, CX = 540, CY = 900, SDN = 0.6, BEAD = 1.0, PULL = 1.3, PE = 2.4, LIFT = 2.6, CUREt = 3.1, OUT = 6.4, DUR = OUT + 4.2;
    const PA = [CX - 135, CY - 190, 270, 260];
    return {
      dur: DUR, shakes: [[SDN + 0.35, 5]],
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = 1 - q, sin = E.outC(seg(t, 0.15, 0.5)), sx = (1 - sin) * -900;
          head(TITLE, t, 0.1, 320, { q, max: 96 });
          if (!VID.collecting) { const c = G(); c.globalAlpha = a; c.translate(sx, 0); c.fillStyle = '#2B2E35'; c.beginPath(); c.roundRect(CX - 260, CY - 260, 520, 600, 18); c.fill(); c.translate(CX, CY); PROD.tee[1](c, sc); D(); }
          // the print, revealed down to the squeegee
          const py = E.inOutS(seg(t, PULL, PE - PULL)); if (py > 0) within(() => ctx.rect(PA[0] + sx, PA[1] - 10, PA[2], (PA[3] + 20) * py), () => design(MODE, S, t, [PA[0] + sx, PA[1], PA[2], PA[3]], sc, MODE === 'logo' ? ink : null, a * 0.96));
          // flash cure glow
          const cu = seg(t, CUREt, 0.5) * (1 - seg(t, CUREt + 0.9, 0.5)); if (cu > 0 && !VID.collecting) { const c = G(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(CX, CY - 60, 20, CX, CY - 60, 420); g.addColorStop(0, 'rgba(255,140,60,' + 0.45 * cu + ')'); g.addColorStop(1, 'rgba(255,90,20,0)'); c.fillStyle = g; c.fillRect(CX - 420, CY - 480, 840, 840);
            c.globalCompositeOperation = 'source-over'; c.fillStyle = '#2B2E35'; c.globalAlpha = cu; c.beginPath(); c.roundRect(CX - 240, CY - 470 - (1 - E.outC(cu)) * 200, 480, 70, 14); c.fill(); c.fillStyle = 'rgba(255,120,40,0.9)'; for (let k = 0; k < 5; k++) c.fillRect(CX - 210 + k * 88, CY - 408 - (1 - E.outC(cu)) * 200, 70, 8); D(); }
          // the screen: frame and mesh, down onto the shirt, up and away after the pull
          const dn = E.outQ(seg(t, SDN - 0.4, 0.4)), up = E.inOutC(seg(t, LIFT, 0.5)), fy = lerp(-700, 0, dn) - up * 900; if (dn > 0 && up < 1 && !VID.collecting) { const c = G(), FR = [CX - 230, CY - 290 + fy, 460, 400]; c.globalAlpha = a;
            c.fillStyle = 'rgba(232,224,168,0.12)'; c.fillRect(FR[0], FR[1], FR[2], FR[3]); c.strokeStyle = 'rgba(255,255,255,0.05)'; c.lineWidth = 1; for (let x = FR[0]; x < FR[0] + FR[2]; x += 6) { c.beginPath(); c.moveTo(x, FR[1]); c.lineTo(x, FR[1] + FR[3]); c.stroke(); }
            c.fillStyle = 'rgba(190,90,40,0.28)'; c.fillRect(FR[0], FR[1], FR[2], PA[1] - (CY - 290) - 10); c.fillRect(FR[0], PA[1] + PA[3] + 10 + fy, FR[2], FR[1] + FR[3] - (PA[1] + PA[3] + 10 + fy)); c.fillRect(FR[0], PA[1] - 10 + fy, PA[0] - FR[0] - 10, PA[3] + 20); c.fillRect(PA[0] + PA[2] + 10, PA[1] - 10 + fy, FR[0] + FR[2] - PA[0] - PA[2] - 10, PA[3] + 20);
            const gr = c.createLinearGradient(FR[0], 0, FR[0] + FR[2], 0); gr.addColorStop(0, '#9AA1AB'); gr.addColorStop(0.5, '#E5E8EC'); gr.addColorStop(1, '#8A919B'); c.strokeStyle = gr; c.lineWidth = 26; c.strokeRect(FR[0], FR[1], FR[2], FR[3]);
            // ink bead and squeegee
            const bead = seg(t, BEAD, 0.25), sy = PA[1] - 20 + fy + (PA[3] + 40) * py; if (bead > 0 && up <= 0) { c.fillStyle = ink; c.beginPath(); for (let x = PA[0]; x <= PA[0] + PA[2]; x += 10) c.lineTo(x, sy - 6 - 12 * bead * (0.6 + 0.4 * Math.sin(x * 0.07))); c.lineTo(PA[0] + PA[2], sy); c.lineTo(PA[0], sy); c.fill(); }
            if (t > PULL - 0.3 && t < LIFT + 0.2) { const sp = E.outC(seg(t, PULL - 0.3, 0.3)) * (1 - seg(t, PE, 0.3)); c.globalAlpha = a * sp; c.fillStyle = '#222'; c.beginPath(); c.roundRect(PA[0] - 50, sy + 4, PA[2] + 100, 16, 6); c.fill(); c.fillStyle = '#8B5A2B'; c.beginPath(); c.roundRect(PA[0] - 60, sy + 18, PA[2] + 120, 46, 12); c.fill(); c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(PA[0] - 50, sy + 24, PA[2] + 100, 6); }
            D(); }
          if (CURE) chip(CURE, CX, CY + 400, { p: seg(t, CUREt + 0.2, 0.4) * a, size: 28, bg: OR, col: onCol(OR), fam: 'Mono', w: 700, ls: 4 });
          if (LINE) K7.txt(LINE, W / 2, CY + 500, F(700, Math.min(30, fitSize(LINE, 700, 940, 30, 'Mont', 3)), 'Mont'), WA(0.85), { align: 'center', a: fa(t, CUREt + 0.5, 0.4) * a, ls: 3 });
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.15, 0.25, -0.4], ['thud', 0.6, 0.3, 0], ['clack', SDN + 0.35, 0.35, 0], ['pour', BEAD, 0.2, 0], ['swish', PULL, 0.25, 0], ['ink', PULL + 0.1, 0.3, 0], ['swish', PULL + 0.6, 0.2, 0], ['air', LIFT + 0.2, 0.25, 0], ['burn', CUREt, 0.18, 0], ['sizzle', CUREt + 0.1, 0.14, 0], ['pop', CUREt + 0.2, 0.25, 0], ['sparkle', CUREt + 0.5, 0.18, 0]]; return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ MERCH MOCKUPS
  function mockx() {
    const TITLE = TX('title', 'Your brand on *everything.*', { label: 'Headline', group: 'Words', max: 28, hint: 'Wrap a word in *stars* to colour it.' });
    const MODE = TX('design', 'logo', { label: 'Design', group: 'Products', options: DESIGN_OPTS });
    const NP = +TX('count', '4', { label: 'Products', group: 'Products', options: opts([['2', '2'], ['3', '3'], ['4', '4']]) });
    const PR = [['p1', 'tee'], ['p2', 'hoodie'], ['p3', 'cap'], ['p4', 'mug']].slice(0, NP).map(([k, d], i) => ({ k: TX(k, d, { label: 'Product ' + (i + 1), group: 'Products', options: PROD_OPTS }), col: garm(TX(k + 'c', ['black', 'gray', 'white', 'white'][i], { label: 'Product ' + (i + 1) + ' colour', group: 'Products', options: opts([['black', 'Black'], ['white', 'White'], ['gray', 'Heather gray'], ['navy', 'Navy'], ['red', 'Red'], ['kraft', 'Kraft'], ['accent', 'Accent colour']]) })) }));
    const END = TX('end', 'Merch that *repps you.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const S = shot('art', 'Your design image (when Design is “your design image”)', 7), n = PR.length, SLOT = 0.9, GRID = 0.5 + n * SLOT + 0.1, OUT = 6.6, DUR = OUT + 4.2;
    const cells = n === 2 ? [[300, 860], [780, 860]] : n === 3 ? [[300, 720], [780, 720], [540, 1110]] : [[300, 720], [780, 720], [300, 1110], [780, 1110]];
    function prod(p, x, y, s, a, t) { if (VID.collecting) return; const c = G(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s); const pa = PROD[p.k][1](c, p.col); D(); design(MODE, S, t, [x + pa[0] * s, y + pa[1] * s, pa[2] * s, pa[3] * s], p.col, null, a); }
    return {
      dur: DUR, shakes: [],
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = 1 - q, g = E.inOutC(seg(t, GRID, 0.7));
          head(TITLE, t, 0.1, 330, { q, max: 96 });
          PR.forEach((p, i) => { const t0 = 0.5 + i * SLOT, inn = E.outC(seg(t, t0 - 0.35, 0.45)), out = i < n - 1 ? E.inC(seg(t, t0 + SLOT - 0.35, 0.35)) : 0;
            const carX = lerp(1500, 540, inn) - out * 960, cx = lerp(carX, cells[i][0], g), cy = lerp(900, cells[i][1], g), s = lerp(1.05, 0.55, g);
            if (g > 0 || (inn > 0 && out < 1)) prod(p, cx, cy, s, a, t);
            if (g <= 0 && inn > 0 && out < 1) chip(PROD[p.k][0].toUpperCase(), carX, 1290, { p: seg(t, t0, 0.3) * (1 - out), size: 30, bg: OR, col: onCol(OR), ls: 3 });
            if (g > 0) K7.txt(PROD[p.k][0].toUpperCase(), cells[i][0], cells[i][1] + 210, F(800, 24, 'Mono'), WA(0.75), { align: 'center', a: g * a, ls: 4 }); });
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.05, 0.2, 0]]; for (let i = 0; i < 4; i++) ev.push(['whoosh', 0.2 + i * SLOT, 0.28, 0.4], ['pop', 0.5 + i * SLOT, 0.22, 0]); ev.push(['swish', 3.7, 0.25, 0], ['sparkle', 4.2, 0.2, 0]); return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ BUSINESS CARDS
  const FOIL = {};
  function cardsx() {
    const TITLE = TX('title', 'Make a *first impression.*', { label: 'Headline', group: 'Words', max: 28, hint: 'Wrap a word in *stars* to colour it.' });
    const CC = TX('stock', 'black', { label: 'Card stock', group: 'The cards', options: opts([['black', 'Black'], ['white', 'White'], ['kraft', 'Kraft'], ['navy', 'Navy'], ['accent', 'Accent colour']]) });
    const FIN = TX('finish', 'foil', { label: 'Finish', group: 'The cards', options: opts([['matte', 'Matte'], ['gloss', 'Gloss (shine)'], ['foil', 'Gold foil logo']]) });
    const NAME = TX('name', (BRAND.name || 'YOUR NAME').toUpperCase(), { label: 'Name on the back', group: 'The cards', upper: true, max: 26 }), ROLE = off(TX('role', 'OWNER', { label: 'Title on the back', group: 'The cards', upper: true, max: 26, hint: DASH }));
    const QTY = off(TX('qty', '500 CARDS', { label: 'Quantity', group: 'Offer', upper: true, max: 16, hint: DASH })), PRICE = off(TX('price', '$49', { label: 'Price (sample)', group: 'Offer', max: 10, hint: DASH }));
    const END = TX('end', 'Cards that *get kept.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const col = garm(CC), ink = onCol(col), CW = 640, CH = 366, CX = 540, CY = 860, DROP = 0.3, FLIP = 1.2, FAN = 2.3, OFF = 3.2, OUT = 6.4, DUR = OUT + 4.2;
    function face(c, back, t) {
      c.fillStyle = col; c.beginPath(); c.roundRect(-CW / 2, -CH / 2, CW, CH, 14); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.08)'; c.lineWidth = 2; c.stroke();
      if (!back) { const im = FIN === 'foil' ? tinted('#D4AF37', false) : ink === '#FFFFFF' ? IMG.logoW : IMG.logoB; if (im && im.width) { const k = Math.min(380 / im.width, 170 / im.height); c.drawImage(im, -im.width * k / 2, -im.height * k / 2, im.width * k, im.height * k);
          if (FIN === 'foil') { const fc = FOIL.c || (FOIL.c = document.createElement('canvas')); fc.width = im.width; fc.height = im.height; const fg = fc.getContext('2d'); fg.drawImage(im, 0, 0); fg.globalCompositeOperation = 'source-atop'; const x = ((t * 0.45) % 1.6 - 0.3) * im.width, g = fg.createLinearGradient(x - im.width * 0.15, 0, x + im.width * 0.15, 0);
            g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,250,225,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); fg.fillStyle = g; fg.fillRect(0, 0, fc.width, fc.height); c.drawImage(fc, -im.width * k / 2, -im.height * k / 2, im.width * k, im.height * k); } } }
      else { c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillStyle = FIN === 'foil' ? '#D4AF37' : ink; c.font = F(800, Math.min(40, fitSize(NAME, 800, CW - 110, 40, 'Mont', 2)), 'Mont'); c.fillText(NAME, -CW / 2 + 55, -40); if (ROLE) { c.font = F(700, 20, 'Mono'); c.fillStyle = rgbaOf(ink, 0.7); c.fillText(ROLE, -CW / 2 + 55, -6); }
        c.fillStyle = FIN === 'foil' ? '#D4AF37' : OR; c.fillRect(-CW / 2 + 55, 18, 70, 4); c.font = F(600, 24, 'Mont'); c.fillStyle = rgbaOf(ink, 0.85); [CONTACT.phone, CONTACT.web, CONTACT.email].filter(Boolean).slice(0, 3).forEach((s, i) => c.fillText(s, -CW / 2 + 55, 62 + i * 34)); }
      if (FIN === 'gloss') { const x = -CW + ((t * 420) % (CW * 2.6)); const g = c.createLinearGradient(x - 120, -CH, x + 120, CH); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.save(); c.beginPath(); c.roundRect(-CW / 2, -CH / 2, CW, CH, 14); c.clip(); c.fillStyle = g; c.fillRect(-CW / 2, -CH / 2, CW, CH); c.restore(); }
    }
    return {
      dur: DUR, shakes: [[DROP + 0.4, 6]],
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = 1 - q, dp = E.outBack(seg(t, DROP, 0.5)), fl = E.inOutC(seg(t, FLIP, 0.7)), fan = E.outBack(seg(t, FAN, 0.7));
          head(TITLE, t, 0.1, 330, { q, max: 96 });
          if (!VID.collecting) { const c = G(); c.globalAlpha = a * clamp(dp * 2); const y0 = CY - (1 - dp) * 900;
            for (let k = 9; k >= 1; k--) { const ang = fan * (k - 5) * 0.11; c.save(); c.translate(CX - fan * (k - 5) * 26, y0 + k * 3 * (1 - fan) + fan * 40); c.rotate(ang); c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 16; c.shadowOffsetY = 6; face(c, false, t); c.restore(); }
            const ang = Math.PI * fl, sx = Math.abs(Math.cos(ang)); c.save(); c.translate(CX, y0 - 30 * Math.sin(ang) - fan * 30); c.rotate(-fan * 0.06); c.scale(Math.max(0.02, sx), 1); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 30; c.shadowOffsetY = 14; face(c, ang > Math.PI / 2, t); c.restore(); D(); }
          if (QTY) chip(QTY, W / 2, CY + 400, { p: seg(t, OFF, 0.4) * a, size: 34, bg: 'rgba(255,255,255,0.1)', border: WA(0.3), w: 900, ls: 3 });
          if (PRICE) { const pp = E.outBack(seg(t, OFF + 0.3, 0.5)) * a; if (pp > 0 && !VID.collecting) { const c = G(), R = 105; c.translate(CX + 300, CY - 250); c.rotate((1 - pp) * 1.4 + 0.18); c.scale(pp, pp); c.fillStyle = OR; c.beginPath(); for (let i = 0; i < 32; i++) { const an = (i / 32) * TAU, rr = i % 2 ? R * 0.88 : R; c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } c.closePath(); c.fill();
            const sz = Math.min(64, fitSize(PRICE, 900, R * 1.45, 64, 'Mont', -1)); setF(F(900, sz, 'Mont'), -1); c.fillStyle = onCol(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(PRICE, 0, 4); D(); } }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', DROP, 0.25, 0], ['thud', DROP + 0.4, 0.35, 0], ['paper', FLIP, 0.3, 0.2], ['pageflip', FLIP + 0.3, 0.3, 0.2], ['shimmer', FLIP + 0.7, 0.14, 0], ['paper', FAN, 0.25, -0.3], ['swish', FAN + 0.1, 0.2, 0.3], ['pop', OFF, 0.25, 0], ['impact', OFF + 0.3, 0.3, 0.3], ['coin', OFF + 0.35, 0.2, 0.3]]; return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ PRINT RUN
  function flyerx() {
    const TITLE = TX('title', 'Fresh off *the press.*', { label: 'Headline', group: 'Words', max: 28, hint: 'Wrap a word in *stars* to colour it.' });
    const MODE = TX('design', 'sample', { label: 'The flyer', group: 'The flyer', options: opts([['sample', 'A flyer in your brand colours'], ['image', 'Your flyer image']]) });
    const FH = TX('fhead', 'GRAND OPENING', { label: 'Flyer headline (brand-colour flyer)', group: 'The flyer', upper: true, max: 22 }), FS = off(TX('fsub', 'SATURDAY  ·  10 AM', { label: 'Flyer line', group: 'The flyer', upper: true, max: 26, hint: DASH }));
    const QTY = TX('qty', '1,000 FLYERS', { label: 'Quantity (counts up)', group: 'Words', upper: true, max: 18 });
    const TURN = off(TX('turn', 'READY TOMORROW', { label: 'Turnaround (sample)', group: 'Words', upper: true, max: 20, hint: DASH }));
    const END = TX('end', 'Print it *with us.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const S = shot('art', 'Your flyer image (when The flyer is “your flyer image”)', 7, 'v'), FW = 400, FHh = 518, RUN = 0.8, RE = 2.8, POP = 3.0, OUT = 6.6, DUR = OUT + 4.2, SY = 1120, N = 14;
    const qm = String(QTY).match(/^([^\d]*)(\d[\d,]*)(.*)$/), qn = qm ? Number(qm[2].replace(/,/g, '')) : 0;
    function flyer(x, y, w, h, rot, a, t) {
      if (MODE === 'image') { if (!VID.collecting) { const c = G(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 20; c.fillStyle = '#FFFFFF'; c.fillRect(-w / 2, -h / 2, w, h); D(); } ph(S, t, [x - w / 2, y - h / 2, w, h], { alpha: a, rot }); return; }
      if (VID.collecting) return; const c = G(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); c.scale(w / FW, h / FHh); c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 20; c.fillStyle = PAPER || '#F5F5F2'; c.fillRect(-FW / 2, -FHh / 2, FW, FHh); c.shadowBlur = 0;
      c.fillStyle = OR; c.fillRect(-FW / 2, -FHh / 2, FW, FHh * 0.52); c.fillStyle = 'rgba(255,255,255,0.12)'; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(-FW / 2 + 60 + k * 60, -FHh / 2 + 40 + (k % 2) * 60, 30 + k * 6, 0, TAU); c.fill(); }
      c.fillStyle = onCol(OR); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; const words = FH.split(' '), l2 = words.length > 1 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [FH];
      const sz = Math.min(64, ...l2.map(s => fitSize(s, 900, FW - 50, 64, 'Mont', -1))); c.font = F(900, sz, 'Mont'); l2.forEach((s, i) => c.fillText(s, 0, -FHh / 2 + FHh * 0.3 + (i - (l2.length - 1) / 2) * sz * 1.02));
      const ink = onCol(PAPER || '#F5F5F2'); if (FS) { c.fillStyle = ink; c.font = F(800, Math.min(26, fitSize(FS, 800, FW - 60, 26, 'Mont', 2)), 'Mont'); c.fillText(FS, 0, FHh * 0.1); }
      const im = ink === '#FFFFFF' ? IMG.logoW : IMG.logoB; if (im && im.width) { const k = Math.min(220 / im.width, 90 / im.height); c.drawImage(im, -im.width * k / 2, FHh * 0.2, im.width * k, im.height * k); } D();
    }
    return {
      dur: DUR, shakes: [],
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = 1 - q, pk = E.inOutC(seg(t, POP, 0.7)), pin = E.outBack(seg(t, 0.1, 0.5));
          head(TITLE, t, 0.1, 300, { q, max: 90 });
          // the press: a body with an output slot and a status light
          if (!VID.collecting) { const c = G(); c.globalAlpha = a * clamp(pin * 2); c.translate(0, (1 - pin) * -300); c.fillStyle = '#2A2F38'; c.beginPath(); c.roundRect(170, 380, 740, 220, 26); c.fill(); c.fillStyle = '#3A404B'; c.beginPath(); c.roundRect(200, 410, 680, 80, 14); c.fill(); c.fillStyle = '#0B0D10'; c.fillRect(270, 560, 540, 16);
            c.fillStyle = t > RUN && t < RE ? (Math.floor(t * 6) % 2 ? '#22C55E' : '#86EFAC') : '#22C55E'; c.beginPath(); c.arc(860, 450, 12, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,0.4)'; c.font = F(700, 18, 'Mono'); c.fillText('PRESS', 230, 458); D(); }
          // sheets fly from the slot to the stack
          const done = Math.floor(clamp((t - RUN) / (RE - RUN)) * N);
          for (let k = 0; k < Math.min(N, done + 1); k++) { const t0 = RUN + (k * (RE - RUN)) / N, u = E.inOutC(seg(t, t0, 0.35)); if (u <= 0) continue; const y = lerp(470, SY - k * 2.2, u), rot = (1 - u) * (k % 2 ? 0.25 : -0.25) + (hash(k) - 0.5) * 0.04, x = 540 + (hash(k * 3) - 0.5) * 12;
            if (k === N - 1 && pk > 0) continue; const sq = lerp(0.2, 1, u); flyer(x, y, FW * (u < 1 ? sq * 0.9 + 0.1 : 1), FHh * (u < 1 ? sq : 1), rot, a, t); }
          if (pk > 0) flyer(540, lerp(SY - N * 2.2, 880, pk), FW * lerp(1, 1.45, pk), FHh * lerp(1, 1.45, pk), lerp(0.02, -0.03, pk), a, t);
          const cnt = qn ? (qm[1] + Math.round(qn * clamp((t - RUN) / (RE - RUN))).toLocaleString('en-US') + qm[3]) : QTY;
          chip(cnt, W / 2, 1450, { p: seg(t, RUN, 0.3) * a, size: 40, bg: OR, col: onCol(OR), w: 900, ls: 2 });
          if (TURN) chip(TURN, W / 2, 1550, { p: seg(t, POP + 0.4, 0.4) * a, size: 28, bg: 'rgba(255,255,255,0.1)', border: WA(0.3), fam: 'Mono', w: 700, ls: 4 });
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.1, 0.22, 0], ['switch', RUN - 0.2, 0.25, 0.3], ['rumble', RUN, 0.12, 0]]; for (let k = 0; k < N; k++) ev.push(['paper', RUN + (k * (RE - RUN)) / N + 0.1, 0.12, ((k % 3) - 1) * 0.2]); ev.push(['ticks', RUN, 0.1, 0, { dur: RE - RUN, n: 16 }], ['whoosh', POP, 0.3, 0], ['pop', POP + 0.4, 0.22, 0]); return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ GLOSS METER
  const PAINTS = { black: ['#0C0E12', '#2A3140'], red: ['#6E0C14', '#C8202E'], blue: ['#0B2A5B', '#2457B8'], white: ['#BFC5CD', '#F4F6F8'], silver: ['#4F565F', '#B9C0C8'], gray: ['#2B2F35', '#5F6670'] };
  function glossx() {
    const TITLE = TX('title', 'Paint *correction.*', { label: 'Headline', group: 'Words', max: 26, hint: 'Wrap a word in *stars* to colour it.' });
    const PC = TX('paint', 'black', { label: 'Paint colour', group: 'Style', options: opts([['black', 'Black'], ['red', 'Red'], ['blue', 'Blue'], ['white', 'White'], ['silver', 'Silver'], ['gray', 'Gray']]) });
    const FROM = TX('from', '41', { label: 'Gloss reading before (sample)', group: 'Readings', max: 5 }), TO = TX('to', '94', { label: 'Gloss reading after (sample)', group: 'Readings', max: 5 }), UNIT = TX('unit', 'GU', { label: 'Unit', group: 'Readings', upper: true, max: 6 });
    const LBL = off(TX('label', 'SWIRLS & HAZE REMOVED', { label: 'Line at the end', group: 'Words', upper: true, max: 28, hint: DASH }));
    const END = TX('end', 'Showroom *shine.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const pc = PAINTS[PC] || PAINTS.black, PR = [90, 420, 900, 620], P0 = 1.0, P1 = 3.2, OUT = 6.4, DUR = OUT + 4.2, f0 = parseFloat(FROM) || 0, f1 = parseFloat(TO) || 0;
    const swirls = Array.from({ length: 70 }, (_, i) => [PR[0] + hash(i * 3.3) * PR[2], PR[1] + hash(i * 5.7) * PR[3], 20 + hash(i * 2.1) * 120, hash(i * 7.9) * TAU, 0.6 + hash(i) * 1.4]);
    return {
      dur: DUR, shakes: [],
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = fa(t, 0.05, 0.5) * (1 - q), pp = seg(t, P0, P1 - P0), clean = E.inOutS(pp);
          head(TITLE, t, 0.1, 330, { q, max: 96 }); card(PR, 34, a, pc[0]);
          within(() => ctx.roundRect(PR[0], PR[1], PR[2], PR[3], 34), () => { if (VID.collecting) return; const c = G(); c.globalAlpha = a; const g = c.createLinearGradient(PR[0], PR[1], PR[0] + PR[2], PR[1] + PR[3]); g.addColorStop(0, pc[1]); g.addColorStop(0.55, pc[0]); g.addColorStop(1, mix(pc[0], '#000000', 0.35)); c.fillStyle = g; c.fillRect(PR[0], PR[1], PR[2], PR[3]);
            // the reflection of a light bar: blurry before, crisp after
            c.save(); c.translate(PR[0] + PR[2] * 0.55, PR[1] + PR[3] * 0.45); c.rotate(-0.25); c.filter = 'blur(' + Math.round(lerp(26, 0, clean)) + 'px)'; c.fillStyle = 'rgba(255,255,255,' + lerp(0.18, 0.75, clean) + ')'; c.fillRect(-420, -16, 840, 32); c.fillRect(-420, 46, 840, 10); c.filter = 'none'; c.restore();
            c.strokeStyle = 'rgba(255,255,255,' + 0.22 * (1 - clean) + ')'; c.lineWidth = 1.4; swirls.forEach(([x, y, r, a0, sp]) => { c.beginPath(); c.arc(x, y, r, a0, a0 + sp); c.stroke(); c.beginPath(); c.arc(x, y, r * 0.8, a0 + 0.3, a0 + 0.3 + sp * 0.8); c.stroke(); });
            if (pp > 0 && pp < 1) { const u = pp * TAU * 1.5, px = PR[0] + PR[2] / 2 + Math.sin(u) * 300, py = PR[1] + PR[3] / 2 + Math.sin(u * 2) * 150; c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.arc(px + 12, py + 16, 130, 0, TAU); c.fill(); c.fillStyle = '#FF8A00'; c.beginPath(); c.arc(px, py, 128, 0, TAU); c.fill(); c.fillStyle = '#E07400'; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(px, py, 28 + k * 17, 0, TAU); c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 2; c.stroke(); }
              c.fillStyle = '#2A2F36'; c.beginPath(); c.arc(px, py, 50, 0, TAU); c.fill(); c.fillStyle = '#C9CED6'; c.beginPath(); c.arc(px, py, 16, 0, TAU); c.fill(); }
            D(); });
          // the gloss meter
          if (!VID.collecting) { const mp = E.outBack(seg(t, 0.5, 0.5)), c = G(), MX = 540, MY = 1190; c.globalAlpha = (1 - q) * clamp(mp * 2); c.translate(MX, MY + (1 - mp) * 200); c.fillStyle = '#1E2229'; c.beginPath(); c.roundRect(-300, -90, 600, 180, 30); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 3; c.stroke();
            c.fillStyle = '#0B1A10'; c.beginPath(); c.roundRect(-270, -66, 330, 132, 16); c.fill(); const v = lerp(f0, f1, E.inOutS(pp)), s = (Number.isInteger(f0) && Number.isInteger(f1)) ? String(Math.round(v)) : v.toFixed(1);
            c.font = F(700, 86, 'Mono'); c.fillStyle = '#7CFFA0'; c.textAlign = 'right'; c.textBaseline = 'middle'; c.shadowColor = '#7CFFA0'; c.shadowBlur = 16; c.fillText(s, 20, 6); c.shadowBlur = 0; c.font = F(700, 26, 'Mono'); c.fillText(UNIT, 50, 26);
            c.fillStyle = 'rgba(255,255,255,0.6)'; c.font = F(700, 20, 'Mono'); c.textAlign = 'left'; c.fillText('GLOSS', 90, -30); const bw = 170 * clamp(f1 ? v / Math.max(f1, 100) : 0); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(90, 0, 170, 18); c.fillStyle = OR; c.fillRect(90, 0, bw, 18); D(); }
          if (LBL) chip(LBL, W / 2, 1350, { p: seg(t, P1 + 0.3, 0.4) * (1 - q), size: 30, bg: OR, col: onCol(OR), ls: 2 });
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.05, 0.22, 0], ['pop', 0.5, 0.22, 0], ['switch', P0 - 0.1, 0.25, 0], ['rumble', P0, 0.18, 0], ['ticks', P0, 0.1, 0, { dur: P1 - P0, n: 20 }], ['shimmer', P1 - 0.3, 0.2, 0], ['chime', P1, 0.28, 0], ['sparkle', P1 + 0.1, 0.22, 0], ['pop', P1 + 0.3, 0.22, 0]]; return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ AIR FILTER
  function filterx() {
    const TITLE = TX('title', 'When did you last *change it?*', { label: 'Headline', group: 'Words', max: 30, hint: 'Wrap a word in *stars* to colour it.' });
    const DL = TX('dirty', 'DIRTY', { label: 'Old filter label', group: 'Words', upper: true, max: 12 }), CL = TX('clean', 'NEW', { label: 'New filter label', group: 'Words', upper: true, max: 12 });
    const LINE = off(TX('line', 'Breathe *easier.*', { label: 'Line at the end', group: 'Words', max: 30, hint: DASH }));
    const END = TX('end', 'Book your *tune-up.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const FR = [190, 470, 700, 640], OUTt = 1.4, INt = 2.1, AIR = 2.7, OUT = 6.4, DUR = OUT + 4.2;
    function filt(c, x, y, dirty) { c.save(); c.translate(x, y); c.fillStyle = '#C9A877'; c.fillRect(0, 0, FR[2], FR[3]); c.fillStyle = dirty ? '#7D7466' : '#F4F6F8'; c.fillRect(26, 26, FR[2] - 52, FR[3] - 52);
      for (let k = 0; k < 22; k++) { const xx = 26 + (k * (FR[2] - 52)) / 22; c.fillStyle = dirty ? 'rgba(40,30,20,0.25)' : 'rgba(0,0,0,0.07)'; c.fillRect(xx, 26, (FR[2] - 52) / 44, FR[3] - 52); }
      if (dirty) { c.fillStyle = 'rgba(60,45,30,0.45)'; for (let i = 0; i < 260; i++) c.fillRect(26 + hash(i * 3.1) * (FR[2] - 60), 26 + hash(i * 7.3) * (FR[3] - 60), 3 + hash(i) * 7, 2 + hash(i * 2) * 4); }
      c.strokeStyle = '#A88A5C'; c.lineWidth = 4; c.strokeRect(13, 13, FR[2] - 26, FR[3] - 26); c.restore(); }
    return {
      dur: DUR, shakes: [[INt + 0.45, 5]],
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = 1 - q, o1 = E.inC(seg(t, OUTt, 0.55)), i1 = E.outBack(seg(t, INt, 0.55)), air = seg(t, AIR, 0.6);
          head(TITLE, t, 0.1, 330, { q, max: 92 });
          if (!VID.collecting) { const c = G(); c.globalAlpha = a; c.fillStyle = '#1C232C'; c.beginPath(); c.roundRect(FR[0] - 40, FR[1] - 40, FR[2] + 80, FR[3] + 80, 20); c.fill();
            // airflow arrows through the vent: weak and grey with the old filter, strong and blue with the new one
            const strong = air, n = Math.round(lerp(6, 16, strong)); for (let i = 0; i < n; i++) { const sp = lerp(0.25, 1.1, strong), u = ((t * sp + hash(i * 3.3)) % 1), x = FR[0] + 40 + hash(i * 5.1) * (FR[2] - 80), y = FR[1] + FR[3] + 20 - u * (FR[3] + 220);
              c.globalAlpha = a * Math.sin(u * Math.PI) * lerp(0.35, 0.9, strong); c.strokeStyle = mix('#7A8088', '#4CC9F0', strong); c.lineWidth = lerp(3, 6, strong); c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y + 60); c.lineTo(x, y); c.lineTo(x - 12, y + 16); c.moveTo(x, y); c.lineTo(x + 12, y + 16); c.stroke(); }
            c.globalAlpha = a; if (o1 < 1) filt(c, FR[0] - o1 * 1100, FR[1], true); if (i1 > 0) filt(c, FR[0] + (1 - i1) * 1100, FR[1], false); D(); }
          chip(o1 < 1 ? DL : CL, FR[0] + 40 + (o1 < 1 ? -o1 * 1100 : (1 - i1) * 1100), FR[1] + 60, { p: (o1 < 1 ? seg(t, 0.4, 0.3) : seg(t, INt + 0.3, 0.3)) * a, size: 28, align: 'left', bg: o1 < 1 ? '#8C2F1E' : OR, col: o1 < 1 ? '#FFFFFF' : onCol(OR), fam: 'Mono', w: 700, ls: 4 });
          if (!VID.collecting) { const c = G(), mp = fa(t, 0.6, 0.4) * a, MY = FR[1] + FR[3] + 120; c.globalAlpha = mp; c.font = F(700, 22, 'Mono'); c.fillStyle = WA(0.7); c.textAlign = 'left'; c.fillText('AIRFLOW', FR[0], MY - 24); c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); c.roundRect(FR[0], MY, FR[2], 22, 11); c.fill();
            c.fillStyle = mix('#E8532E', '#22C55E', air); c.beginPath(); c.roundRect(FR[0], MY, FR[2] * lerp(0.28, 0.95, E.outC(air)), 22, 11); c.fill(); D(); }
          if (LINE) head(LINE, t, AIR + 0.6, FR[1] + FR[3] + 250, { q, max: 72, w: 800 });
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.05, 0.22, 0], ['air', 0.6, 0.12, 0], ['swish', OUTt, 0.28, -0.4], ['paper', OUTt + 0.1, 0.2, -0.4], ['whoosh', INt, 0.28, 0.4], ['clack', INt + 0.45, 0.35, 0], ['riser', AIR - 0.3, 0.15, 0], ['air', AIR + 0.1, 0.35, 0], ['air', AIR + 0.6, 0.3, 0], ['sparkle', AIR + 0.3, 0.2, 0]]; return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ DELIVERY TRACKER
  function deliverx() {
    const TITLE = TX('title', 'Your order is *on the way.*', { label: 'Headline', group: 'Words', max: 30, hint: 'Wrap a word in *stars* to colour it.' });
    const ST = [['s1', 'ORDER PLACED'], ['s2', 'IN THE KITCHEN'], ['s3', 'OUT FOR DELIVERY'], ['s4', 'AT YOUR DOOR']].map(([k, d], i) => TX(k, d, { label: 'Step ' + (i + 1), group: 'Steps', upper: true, max: 20 }));
    const ETA = off(TX('eta', '25 MIN', { label: 'Arrival time (sample)', group: 'Words', upper: true, max: 10, hint: DASH }));
    const LINE = off(TX('line', 'Order on our site or app', { label: 'Line at the end', group: 'Words', max: 34, hint: DASH }));
    const END = TX('end', 'Hungry? *Order now.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const MR = [90, 420, 900, 560], STEPt = [0.6, 1.2, 1.9, 3.6], RIDE = [1.9, 3.5], OUT = 6.6, DUR = OUT + 4.2;
    const route = [[200, 870], [200, 720], [430, 720], [430, 560], [700, 560], [700, 720], [880, 720], [880, 880]], segL = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1])), tot = segL.reduce((a, b) => a + b, 0);
    const at = u => { let d = u * tot; for (let i = 0; i < segL.length; i++) { if (d <= segL[i]) { const k = d / segL[i]; return [lerp(route[i][0], route[i + 1][0], k), lerp(route[i][1], route[i + 1][1], k), i]; } d -= segL[i]; } const L = route[route.length - 1]; return [L[0], L[1], segL.length - 1]; };
    return {
      dur: DUR, shakes: [[STEPt[3], 6]],
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = fa(t, 0.05, 0.5) * (1 - q), u = E.inOutS(seg(t, RIDE[0], RIDE[1] - RIDE[0]));
          head(TITLE, t, 0.1, 330, { q, max: 92 }); card(MR, 30, a, '#E9EEF2');
          within(() => ctx.roundRect(MR[0], MR[1], MR[2], MR[3], 30), () => { if (VID.collecting) return; const c = G(); c.globalAlpha = a; c.fillStyle = '#E9EEF2'; c.fillRect(MR[0], MR[1], MR[2], MR[3]);
            c.fillStyle = '#CFE8D0'; c.fillRect(560, 760, 240, 160); c.fillStyle = '#BFDDF2'; c.beginPath(); c.moveTo(MR[0], 470); c.bezierCurveTo(400, 430, 650, 500, MR[0] + MR[2], 440); c.lineTo(MR[0] + MR[2], 480); c.bezierCurveTo(650, 540, 400, 470, MR[0], 510); c.fill();
            c.strokeStyle = '#FFFFFF'; c.lineWidth = 18; for (let x = 200; x < 1000; x += 230) { c.beginPath(); c.moveTo(x, MR[1]); c.lineTo(x, MR[1] + MR[3]); c.stroke(); } for (let y = 560; y < 1000; y += 160) { c.beginPath(); c.moveTo(MR[0], y); c.lineTo(MR[0] + MR[2], y); c.stroke(); }
            c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 12; c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath(); route.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke();
            const rp = E.outC(seg(t, 1.0, 0.8)); c.strokeStyle = OR; c.lineWidth = 10; c.setLineDash([1, 0]); c.beginPath(); const [ex, ey, ei] = at(rp); c.moveTo(route[0][0], route[0][1]); for (let i = 1; i <= ei; i++) c.lineTo(route[i][0], route[i][1]); c.lineTo(ex, ey); c.stroke();
            const pin = (x, y, col, lab) => { c.fillStyle = col; c.beginPath(); c.arc(x, y - 40, 26, Math.PI, 0); c.lineTo(x, y); c.closePath(); c.fill(); c.beginPath(); c.arc(x, y - 40, 26, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x, y - 40, 10, 0, TAU); c.fill(); };
            pin(route[0][0], route[0][1], OR); pin(route[route.length - 1][0], route[route.length - 1][1], '#1F2937');
            if (t >= RIDE[0] - 0.1) { const [rx, ry] = at(u); c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(rx, ry + 30, 40, 10, 0, 0, TAU); c.fill(); c.fillStyle = OR; c.beginPath(); c.arc(rx, ry, 38, 0, TAU); c.fill(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 5; c.beginPath(); c.arc(rx - 14, ry + 10, 9, 0, TAU); c.arc(rx + 16, ry + 10, 9, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(rx - 14, ry + 10); c.lineTo(rx + 2, ry - 6); c.lineTo(rx + 16, ry + 10); c.moveTo(rx + 2, ry - 6); c.lineTo(rx - 4, ry - 18); c.stroke(); }
            D(); });
          if (ETA) chip(ETA, MR[0] + MR[2] - 30, MR[1] + 50, { p: seg(t, 0.8, 0.35) * (1 - q), size: 30, align: 'right', bg: '#1F2937', w: 900 });
          if (!VID.collecting) { const c = G(), y0 = MR[1] + MR[3] + 90; c.globalAlpha = fa(t, 0.4, 0.4) * (1 - q); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(150, y0, 780, 8); const cur = STEPt.filter(s => t >= s).length; c.fillStyle = OR; c.fillRect(150, y0, 780 * E.outC(clamp(cur > 0 ? (cur - 1 + seg(t, STEPt[Math.max(0, cur - 1)], 0.4)) / 3 : 0)), 8);
            ST.forEach((s, i) => { const x = 150 + (i * 780) / 3, on = seg(t, STEPt[i], 0.3); c.fillStyle = mix('#3A3F48', OR, on); c.beginPath(); c.arc(x, y0 + 4, 22, 0, TAU); c.fill(); if (on > 0.5) { c.strokeStyle = onCol(OR); c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 9, y0 + 4); c.lineTo(x - 2, y0 + 11); c.lineTo(x + 10, y0 - 4); c.stroke(); }
              c.font = F(800, Math.min(22, fitSize(s, 800, 230, 22, 'Mont', 1)), 'Mont'); c.textAlign = 'center'; c.fillStyle = on > 0.5 ? WHT : WA(0.5); s.split(' ').reduce((ls, w) => { const l = ls[ls.length - 1]; if (l && (l + ' ' + w).length <= 11) ls[ls.length - 1] = l + ' ' + w; else ls.push(w); return ls; }, []).slice(0, 2).forEach((l, j) => c.fillText(l, x, y0 + 64 + j * 26)); }); D(); }
          if (LINE) K7.txt(LINE, W / 2, MR[1] + MR[3] + 270, F(700, 34, 'Mont'), WA(0.85), { align: 'center', a: fa(t, STEPt[3] + 0.4, 0.4) * (1 - q) });
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.05, 0.22, 0], ['notify', STEPt[0], 0.25, -0.3], ['notify', STEPt[1], 0.22, -0.1], ['sizzle', STEPt[1] + 0.1, 0.12, 0], ['notify', STEPt[2], 0.22, 0.1], ['rumble', RIDE[0], 0.15, 0.2], ['whoosh', RIDE[0] + 0.8, 0.18, 0.3], ['bell', STEPt[3], 0.3, 0.3], ['chime', STEPt[3] + 0.1, 0.22, 0], ['pop', STEPt[3] + 0.4, 0.2, 0]]; return ret(DUR, ev, OUT); },
    };
  }

  const MAKE = { pressx, mockx, cardsx, flyerx, glossx, filterx, deliverx };
  const PP = (MAKE[V] || pressx)();
  DIR = { dur: PP.dur, bg: BLK, bgSwap: true, finish: { vig: 0.2, grain: 0.12 }, edl: [], shakes: PP.shakes, preload: PP.preload || (() => K3.init()), render: PP.render, cues: PP.cues, fam: V,
    setup() { if (!window.STUDIO && LIGHTPAL) { const w = IMG.logoW; IMG.logoW = IMG.logoB; IMG.logoB = w; } } };
});
