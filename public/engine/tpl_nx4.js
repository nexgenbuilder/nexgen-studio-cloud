'use strict';
/* NexGen templates V14 (Nov 5): drawn motion pieces for home services and restaurants, from the Remotion motion library.
   ?v=stainx   Stain Removal     a stain on carpet: sprayed, foamed, then a cleaning wand pass takes it away, "GONE."
   ?v=nightx   The Night Shift   an office building at night, cleaned floor by floor while a clock runs, then sunrise
   ?v=checkx   The Checklist     a clipboard: each item gets ticked in pen, then a stamp
   ?v=plansx   Plans & Packages  2–3 plan cards with features; one gets picked with a badge
   ?v=vanx     On the Way        the service van drives in with your logo, brakes, "on the way" and an arrival time
   ?v=pizzax   Pizza Builder     dough, sauce, cheese, three toppings you choose, the cutter, a slice pulls away
   ?v=heatx    Heat Meter        a salsa heat gauge: the needle sweeps to your level, heat waves rise, the chiles fill
   ?v=papelx   Fiesta Banner     papel picado strings drop and swing, your photo lands, the headline and details
   ?v=recipex  Recipe Card       a handwritten recipe card with your photo taped on and a house stamp
   Defaults follow the brand's industry. Prices, offers and numbers are sample text to replace. A field can't be emptied
   in the studio (it returns to its default), so a lone dash (-) leaves an optional line off. */
(() => {
  const P = (accent, ink, text, accent2, paper, deep1, deep2) => ({ accent, ink, text, accent2, paper, deep1, deep2 });
  Object.assign(K7.FAM, {
    stainx: { pal: P('#38BDF8', '#0A1218', '#F2F7FA', '#22D3EE', '#F2F7FA', '#11202B', '#03080C'), fonts: { sans: 'mont', serif: 'lora', display: 'oswald', script: 'kalam' }, music: 'pulse', bpm: 112 },
    nightx: { pal: P('#FFC94D', '#060A16', '#F3F5FA', '#7CC4FF', '#F3F5FA', '#0E1630', '#02040A'), fonts: { sans: 'mont', serif: 'fraunces', display: 'oswald', script: 'kalam' }, music: 'night', bpm: 96 },
    checkx: { pal: P('#22C55E', '#0B1210', '#F3F6F4', '#14B8A6', '#F3F6F4', '#13201B', '#040806'), fonts: { sans: 'mont', serif: 'lora', display: 'bebas', script: 'marker' }, music: 'day', bpm: 100 },
    plansx: { pal: P('#7C5CFF', '#0C0B14', '#F4F3FA', '#22D3EE', '#F4F3FA', '#17142A', '#05040A'), fonts: { sans: 'mont', serif: 'fraunces', display: 'archivoblack', script: 'kalam' }, music: 'pulse', bpm: 116 },
    vanx: { pal: P('#FF7A1A', '#0B0E13', '#F4F5F7', '#2F80ED', '#F4F5F7', '#161B24', '#04060A'), fonts: { sans: 'mont', serif: 'dmserif', display: 'oswald', script: 'marker' }, music: 'day', bpm: 104 },
    pizzax: { pal: P('#FFB000', '#120A07', '#FFF6EA', '#E4572E', '#FFF6EA', '#24140C', '#060302'), fonts: { sans: 'mont', serif: 'dmserif', display: 'anton', script: 'marker' }, music: 'sketch', bpm: 100 },
    heatx: { pal: P('#FF3B1F', '#0E0705', '#FFF3EA', '#FFB000', '#FFF3EA', '#2A0F08', '#070202'), fonts: { sans: 'mont', serif: 'dmserif', display: 'anton', script: 'marker' }, music: 'pulse', bpm: 120 },
    papelx: { pal: P('#FF006E', '#120A1A', '#FFF7EE', '#FFB000', '#FFF7EE', '#24122E', '#06030A'), fonts: { sans: 'mont', serif: 'dmserif', display: 'righteous', script: 'pacifico' }, music: 'day', bpm: 110 },
    recipex: { pal: P('#C0392B', '#14100C', '#FBF6EA', '#E9C46A', '#FBF6EA', '#241B13', '#070504'), fonts: { sans: 'mont', serif: 'playfair', display: 'abril', script: 'caveat' }, music: 'lounge', bpm: 84 },
  });
})();

STUDIO_REG['nx4'] = (() => {
  const V = QS.get('v') || 'stainx';
  // Per-element model: positions below fall back to the original hardcoded values when EL is null,
  // so rendering is byte-for-byte the old path. (Same pattern as tpl_trade.js.)
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const elNum = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const FM = K7.FAM[V] || K7.FAM.stainx;
  if (!window.STUDIO) setBrandColors(FM.pal);
  const G = K3.G, D = K3.D, seg = K7.seg, TAU = Math.PI * 2;
  const IND = BRAND.cat || BRAND.industry || 'general';
  const FOOD = ['restaurant', 'pizza', 'burgers', 'tacos', 'mexican', 'italian', 'sandwiches'];
  const pick = (map, d) => map[IND] || (FOOD.includes(IND) ? map.restaurant : null) || map[d || 'general'];
  const NONE = k => ['nofoot.' + k, 0];
  const opts = list => list.map(([value, label]) => ({ value, label }));
  const shot = (k, label, d, ph) => { const s = SHOT(k, NONE(k), { label, group: 'Footage', kind: 'any', ph, d: d + 0.3 }); return { c: s[0], in: s[1], d, start: 0 }; };
  const fa = (t, t0, d) => E.outC(seg(t, t0, d || 0.5));
  const musicBed = dur => ['music', 0, dur, 0.95, { style: FM.music, bpm: FM.bpm, key: 0, end: dur - 0.6 }];
  const lum = h => { const v = [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16) / 255); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const onCol = h => (/^#[0-9a-f]{6}$/i.test(h) && lum(h) > 0.45 ? '#0B0B0B' : '#FFFFFF');
  const mix = K7.mix;
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
  // handwriting that writes itself on, left to right (a cached text sprite revealed by width)
  const HC = new Map();
  function handImg(str, f, col) {
    const k = str + '|' + f + '|' + col; if (HC.has(k)) return HC.get(k);
    const size = parseFloat(f.match(/(\d+(?:\.\d+)?)px/)[1]), tw = Math.ceil(textW(str, f, 0)), pad = Math.ceil(size * 0.5), c = document.createElement('canvas'); c.width = tw + pad * 2; c.height = Math.ceil(size * 1.8);
    const g = c.getContext('2d'); g.font = f; g.fillStyle = col; g.textBaseline = 'alphabetic'; g.fillText(str, pad, size * 1.25);
    const o = { c, w: tw, pad, base: size * 1.25 }; if (document.fonts.check(f)) HC.set(k, o); return o;
  }
  function hand(str, x, y, f, col, p, align) {
    if (!str || p <= 0 || VID.collecting) return 0; const im = handImg(str, f, col), x0 = align === 'right' ? x - im.w : align === 'center' ? x - im.w / 2 : x, sw = im.pad + (im.w + im.pad) * clamp(p);
    const c = G(); c.drawImage(im.c, 0, 0, sw, im.c.height, x0 - im.pad, y - im.base, sw, im.c.height); D(); return im.w;
  }
  const fontOf = key => (window.NX && NX.fontFamily && NX.fontFamily(key)) || 'Hand';
  const wtOf = key => Math.max(...(((window.NX && NX.FONTLIB && NX.FONTLIB[key]) || { n: [700] }).n));
  // a chile pepper icon (pointing down-left), 80 px tall at s = 1
  const CHILE = new Path2D('M8,-30 C26,-26 30,-4 20,14 C10,32 -14,42 -32,38 C-14,28 -2,14 0,-6 C2,-18 2,-26 8,-30 Z');
  const STEM = new Path2D('M8,-30 C8,-38 14,-42 22,-44');

  // ================================================================ STAIN REMOVAL
  const STAINS = { wine: ['RED WINE', '#7A1F35'], coffee: ['COFFEE', '#6B4423'], pet: ['PET STAIN', '#8C6D2F'], mud: ['MUD', '#4E3B2A'], juice: ['JUICE', '#B0412E'], grease: ['GREASE', '#3E3A2F'] };
  const CARPETS = { beige: '#CDBB9C', gray: '#A9A9A6', cream: '#E3D9C4', blue: '#7D8FA8', brown: '#8E7558' };
  const RUG = new Map();
  function rugTex(col) {   // carpet texture: speckle plus short fibres, made once per colour
    if (RUG.has(col)) return RUG.get(col); const w = 450, h = 390, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), r = rng(7);
    g.fillStyle = col; g.fillRect(0, 0, w, h); const id = g.getImageData(0, 0, w, h);
    for (let i = 0; i < id.data.length; i += 4) { const n = (r() - 0.5) * 34; id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n; } g.putImageData(id, 0, 0);
    g.lineCap = 'round'; for (let i = 0; i < 2600; i++) { const x = r() * w, y = r() * h, a = r() * TAU, l = 3 + r() * 6; g.strokeStyle = r() < 0.5 ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.10)'; g.lineWidth = 1 + r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    RUG.set(col, c); return c;
  }
  function stainx() {
    const KIND = TX('kind', IND === 'carpet' || FOOD.includes(IND) ? 'wine' : 'coffee', { label: 'Stain', group: 'Style', options: opts([['wine', 'Red wine'], ['coffee', 'Coffee'], ['pet', 'Pet stain'], ['mud', 'Mud'], ['juice', 'Juice'], ['grease', 'Grease']]) });
    const RUGC = TX('carpet', 'beige', { label: 'Carpet colour', group: 'Style', options: opts([['beige', 'Beige'], ['gray', 'Gray'], ['cream', 'Cream'], ['blue', 'Blue'], ['brown', 'Brown']]) });
    const TITLE = TX('title', 'That *stain?*', { label: 'Headline', group: 'Words', max: 26, hint: 'Wrap a word in *stars* to colour it.' });
    const LBL = off(TX('label', STAINS[KIND][0], { label: 'Stain label', group: 'Words', upper: true, max: 16, hint: DASH }));
    const S1 = TX('s1', 'PRE-TREAT', { label: 'Step 1', group: 'Words', upper: true, max: 16 }), S2 = TX('s2', 'AGITATE', { label: 'Step 2', group: 'Words', upper: true, max: 16 }), S3 = TX('s3', 'EXTRACT', { label: 'Step 3', group: 'Words', upper: true, max: 16 });
    const BIG = TX('big', 'GONE.', { label: 'The payoff', group: 'Words', upper: true, max: 10 });
    const END = TX('end', 'Fresh carpet, *fresh start.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const PR0 = [90, 470, 900, 780];
    const PR = (EL && EL.box) ? [elNum(EL.box.x, PR0[0]), elNum(EL.box.y, PR0[1]), elNum(EL.box.w, PR0[2]), elNum(EL.box.h, PR0[3])] : PR0;
    const SX = 520 + (PR[0] - 90), SY = 860 + (PR[1] - 470), SR = 175, col = STAINS[KIND][1], rug = CARPETS[RUGC] || CARPETS.beige;
    const IN = 0.6, SPRAY = 1.3, FOAM = 2.1, WAND = 2.9, WEND = 4.1, PAY = 4.3, OUT = 6.6, DUR = OUT + 4.2;
    const blob = new Path2D(); { const n = 26, pts = []; for (let i = 0; i < n; i++) { const a = (i / n) * TAU, r = SR * (0.72 + 0.5 * hash(i * 3.1 + 2)); pts.push([SX + Math.cos(a) * r, SY + Math.sin(a) * r * 0.78]); }
      for (let i = 0; i <= n; i++) { const p = pts[i % n], q = pts[(i + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; if (i === 0) blob.moveTo(m[0], m[1]); else blob.quadraticCurveTo(p[0], p[1], m[0], m[1]); } blob.closePath(); }
    const drops = [[SX + 230, SY - 120, 26], [SX - 240, SY + 90, 18], [SX + 170, SY + 170, 14], [SX - 150, SY - 170, 11]];
    const bub = Array.from({ length: 46 }, (_, i) => { const a = hash(i * 7.3) * TAU, r = Math.sqrt(hash(i * 1.9)) * SR * 0.95; return [SX + Math.cos(a) * r, SY + Math.sin(a) * r * 0.8, 12 + hash(i * 4.1) * 26, hash(i * 2.2) * 0.4]; });
    function elements() {
      const tiP = posOf(elP('title'), [W / 2, 360]);
      const lbP = posOf(elP('label'), [PR[0] + PR[2] - 30, PR[1] + 56]);
      const stP = posOf(elP('step'), [PR[0] + 30, PR[1] + 56]);
      const poP = posOf(elP('payoff'), [W / 2, PR[1] + PR[3] / 2 + 70]);
      const els = [
        { id: 'rug', kind: 'box', label: 'Carpet', x: PR[0], y: PR[1], w: PR[2], h: PR[3], t0: 0.05, d: OUT - 0.05, box: [PR[0], PR[1], PR[2], PR[3]], dup: false, del: false },
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.1, d: OUT - 0.1, box: [tiP[0] - 470, tiP[1] - 60, 940, 120], dup: false, del: false },
        { id: 'step', kind: 'pos', label: S1 + ' / ' + S2 + ' / ' + S3, x: stP[0], y: stP[1], t0: SPRAY, d: PAY - SPRAY, box: [stP[0] - 10, stP[1] - 30, 400, 60], dup: false, del: false },
        { id: 'payoff', kind: 'pos', label: BIG, x: poP[0], y: poP[1], t0: PAY, d: OUT - PAY, box: [poP[0] - 380, poP[1] - 160, 760, 220], dup: false, del: false },
      ];
      if (LBL) els.push({ id: 'label', kind: 'pos', label: LBL, x: lbP[0], y: lbP[1], t0: IN + 0.3, d: WAND + 0.4 - (IN + 0.3), box: [lbP[0] - 200, lbP[1] - 30, 210, 60], dup: false, del: false });
      return els;
    }
    return {
      dur: DUR, shakes: [[PAY, 10]], elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = fa(t, 0.05, 0.5) * (1 - q), oy = (1 - E.outC(seg(t, 0, 0.6))) * 120, r = [PR[0], PR[1] + oy, PR[2], PR[3]];
          { const [tix, tiy] = posOf(elP('title'), [W / 2, 360]); head(TITLE, t, 0.1, tiy, { q, x: tix }); }
          card(r, 40, a);
          const wx = lerp(r[0] - 90, r[0] + r[2] + 90, E.inOutS(seg(t, WAND, WEND - WAND)));
          within(() => ctx.roundRect(r[0], r[1], r[2], r[3], 40), () => {
            if (VID.collecting) return; const c = G(); c.globalAlpha = a; c.translate(0, oy);
            c.drawImage(rugTex(rug), PR[0], PR[1], PR[2], PR[3]);
            const vg = c.createRadialGradient(W / 2, PR[1] + PR[3] / 2, 200, W / 2, PR[1] + PR[3] / 2, 640); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)'); c.fillStyle = vg; c.fillRect(PR[0], PR[1], PR[2], PR[3]);
            // groomed, clean carpet behind the wand
            c.save(); c.beginPath(); c.rect(PR[0], PR[1], wx - PR[0], PR[3]); c.clip(); for (let x = PR[0], k = 0; x < PR[0] + PR[2]; x += 56, k++) { c.fillStyle = k % 2 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'; c.fillRect(x, PR[1], 56, PR[3]); } c.restore();
            // the stain and the foam ahead of the wand
            c.save(); c.beginPath(); c.rect(wx, PR[1], PR[0] + PR[2] - wx + 100, PR[3]); c.clip();
            const sp = E.outBack(seg(t, IN, 0.4)); if (sp > 0) { c.save(); c.translate(SX, SY); c.scale(sp, sp); c.translate(-SX, -SY); const sg = c.createRadialGradient(SX, SY, 10, SX, SY, SR * 1.2); sg.addColorStop(0, rgbaOf(col, 0.9)); sg.addColorStop(1, rgbaOf(col, 0.55));
              c.fillStyle = sg; c.fill(blob); c.strokeStyle = rgbaOf(col, 0.35); c.lineWidth = 10; c.stroke(blob); c.fillStyle = rgbaOf(col, 0.75); drops.forEach(([x, y, rr]) => { c.beginPath(); c.arc(x, y, rr, 0, TAU); c.fill(); }); c.restore(); }
            const wet = seg(t, SPRAY + 0.3, 0.6); if (wet > 0) { c.fillStyle = 'rgba(255,255,255,' + 0.12 * wet + ')'; c.fill(blob); }
            bub.forEach(([x, y, rr, d]) => { const u = E.outBack(seg(t, FOAM + d, 0.35)); if (u <= 0) return; c.globalAlpha = a * 0.92; c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x, y, rr * u, 0, TAU); c.fill(); c.strokeStyle = 'rgba(160,200,220,0.6)'; c.lineWidth = 2; c.stroke(); c.globalAlpha = a; });
            c.restore();
            // spray mist
            const mp = seg(t, SPRAY + 0.3, 0.7); if (mp > 0 && mp < 1) { for (let i = 0; i < 70; i++) { const u = (mp * 2.2 + hash(i)) % 1, ang = Math.PI + 0.25 + (hash(i * 3) - 0.5) * 0.7, d = u * 380; c.globalAlpha = a * (1 - u) * 0.8; c.fillStyle = '#E6F6FF'; c.beginPath(); c.arc(860 + Math.cos(ang) * d, 640 + Math.sin(ang) * d * -0.6 + d * 0.5, 3 + hash(i * 5) * 4, 0, TAU); c.fill(); } c.globalAlpha = a; }
            // the wand: a cleaning head across the carpet, water trailing
            if (wx > PR[0] - 80 && wx < PR[0] + PR[2] + 80) { const gr = c.createLinearGradient(wx - 26, 0, wx + 26, 0); gr.addColorStop(0, '#8F98A3'); gr.addColorStop(0.5, '#F2F5F8'); gr.addColorStop(1, '#8F98A3');
              c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(wx - 14, PR[1] + 40, 60, PR[3] - 80); c.fillStyle = gr; c.beginPath(); c.roundRect(wx - 28, PR[1] + 30, 56, PR[3] - 60, 18); c.fill(); c.fillStyle = OR; c.fillRect(wx - 7, PR[1] + 30, 14, PR[3] - 60);
              c.fillStyle = 'rgba(220,240,255,0.7)'; for (let i = 0; i < 24; i++) { c.beginPath(); c.arc(wx - 40 - hash(i * 3 + Math.floor(t * 30)) * 70, PR[1] + 50 + hash(i * 7) * (PR[3] - 100), 3 + hash(i) * 4, 0, TAU); c.fill(); } }
            D();
          });
          // the spray bottle (outside the clip so it can hang over the edge)
          const bp = E.outC(seg(t, SPRAY, 0.35)) * (1 - E.inC(seg(t, FOAM - 0.1, 0.35))); if (bp > 0 && !VID.collecting) { const c = G(), squeeze = Math.sin(clamp((t - SPRAY - 0.3) / 0.7) * Math.PI * 6) > 0.4 ? 0.12 : 0; c.globalAlpha = a; c.translate(lerp(1250, 930, bp), 600 + oy); c.rotate(-0.35);
            c.fillStyle = OR; c.beginPath(); c.roundRect(-55, 40, 110, 210, 28); c.fill(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-35, 80, 18, 140); c.fillStyle = '#E9EDF2'; c.beginPath(); c.roundRect(-34, -20, 68, 64, 10); c.fill();
            c.fillStyle = '#C9D0D8'; c.beginPath(); c.moveTo(-34, -20); c.lineTo(-110, -14); c.lineTo(-110, 8); c.lineTo(-34, 18); c.fill(); c.save(); c.translate(-30, 30); c.rotate(squeeze); c.fillStyle = '#AEB6C0'; c.beginPath(); c.roundRect(-16, 0, 22, 70, 8); c.fill(); c.restore(); D(); }
          if (LBL) { const [lbx, lby] = posOf(elP('label'), [r[0] + r[2] - 30, r[1] + 56]); chip(LBL, lbx, lby, { p: seg(t, IN + 0.3, 0.35) * (1 - seg(t, WAND + 0.4, 0.3)), size: 26, align: 'right', fam: 'Mono', w: 700, ls: 4, bg: rgbaOf(col, 0.95) }); }
          const step = t < FOAM ? [S1, SPRAY] : t < WAND ? [S2, FOAM] : [S3, WAND];
          if (t >= SPRAY && t < PAY) { const [spx, spy] = posOf(elP('step'), [r[0] + 30, r[1] + 56]); chip('0' + (t < FOAM ? 1 : t < WAND ? 2 : 3) + '   ' + step[0], spx, spy, { p: seg(t, step[1], 0.3), size: 28, align: 'left', bg: OR, col: onCol(OR) }); }
          const pp = seg(t, PAY, 0.4); if (pp > 0 && !VID.collecting) { const c = G(), s = lerp(2.2, 1, E.outBack(pp)), f = F(900, Math.min(220, fitSize(BIG, 900, 760, 220, 'Mont', -4)), 'Mont'), [pox, poy] = posOf(elP('payoff'), [W / 2, PR[1] + PR[3] / 2 + 70 + oy]); c.globalAlpha = clamp(pp * 4) * (1 - q); c.translate(pox, poy); c.scale(s, s); setF(f, -4);
            c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 40; c.fillStyle = WHT; c.fillText(BIG, 0, 0); c.shadowBlur = 0; c.fillStyle = OR; c.fillRect(-textW(BIG, f, -4) / 2, 22, textW(BIG, f, -4) * E.outC(seg(t, PAY + 0.25, 0.4)), 14); D();
            K4.sparkles([PR[0], PR[1] + oy, PR[2], PR[3]], t, 26, 0.9 * (1 - q) * clamp(pp * 3)); }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.05, 0.25, 0], ['thud', IN, 0.3, 0], ['pop', IN + 0.3, 0.2, 0.3], ['whoosh', SPRAY, 0.22, 0.4], ['air', SPRAY + 0.4, 0.3, -0.1], ['air', SPRAY + 0.75, 0.25, -0.1], ['ink', FOAM, 0.22, 0], ['sparkle', FOAM + 0.3, 0.12, 0],
        ['riser', WAND - 0.1, 0.15, 0], ['swish', WAND + 0.3, 0.25, -0.4], ['air', WAND + 0.7, 0.3, 0], ['swish', WAND + 0.9, 0.22, 0.4], ['impact', PAY, 0.42, 0], ['sparkle', PAY + 0.2, 0.25, 0]]; return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ THE NIGHT SHIFT
  const mins = s => { const m = String(s).match(/(\d{1,2}):(\d{2})\s*([AP])/i); return m ? ((+m[1] % 12) + (/p/i.test(m[3]) ? 12 : 0)) * 60 + +m[2] : null; };
  const clockStr = m => { m = ((Math.round(m / 5) * 5) % 1440 + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; return ((h + 11) % 12 + 1) + ':' + String(mm).padStart(2, '0') + (h < 12 ? ' AM' : ' PM'); };
  function nightx() {
    const TITLE = TX('title', IND === 'commercial' ? 'Cleaned *overnight.*' : 'We work *after hours.*', { label: 'Headline', group: 'Words', max: 26, hint: 'Wrap a word in *stars* to colour it.' });
    const NAME = off(TX('sign', (BRAND.short || 'OFFICE').toUpperCase().slice(0, 14), { label: 'Rooftop sign', group: 'Words', upper: true, max: 14, hint: DASH }));
    const NF = +TX('floors', '6', { label: 'Floors', group: 'Style', options: opts([['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8']]) });
    const T1 = TX('t1', '10:00 PM', { label: 'Start time', group: 'Words', max: 9 }), T2 = TX('t2', '6:00 AM', { label: 'Done by', group: 'Words', max: 9 });
    const L1 = TX('l1', 'WHILE YOU SLEEP', { label: 'Night line', group: 'Words', upper: true, max: 20 }), L2 = TX('l2', 'READY BY MORNING', { label: 'Morning line', group: 'Words', upper: true, max: 20 });
    const END = TX('end', 'Clean when *you walk in.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const BX0 = 270, BT0 = 540, BW0 = 540, BH0 = 710;
    const BD = (EL && EL.box) ? [elNum(EL.box.x, BX0), elNum(EL.box.y, BT0), elNum(EL.box.w, BW0), elNum(EL.box.h, BH0)] : [BX0, BT0, BW0, BH0];
    const BX = BD[0], BT = BD[1], BW = BD[2], BB = BD[1] + BD[3], fh = (BB - BT) / NF, W0 = 0.8, W1 = 3.8, DAWN = 4.0, OUT = 6.6, DUR = OUT + 4.2, m1 = mins(T1), m2 = mins(T2);
    function elements() {
      const tiP = posOf(elP('title'), [W / 2, 330]);
      const sgP = posOf(elP('sign'), [W / 2, BT - 54]);
      const clP = posOf(elP('clock'), [W / 2, 425]);
      const els = [
        { id: 'building', kind: 'box', label: 'Building', x: BX, y: BT, w: BW, h: BB - BT, t0: 0, d: OUT, box: [BX, BT, BW, BB - BT], dup: false, del: false },
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.1, d: OUT - 0.1, box: [tiP[0] - 470, tiP[1] - 60, 940, 120], dup: false, del: false },
        { id: 'clock', kind: 'pos', label: T1 + ' – ' + T2, x: clP[0], y: clP[1], t0: 0.5, d: OUT - 0.5, box: [clP[0] - 350, clP[1] - 35, 700, 70], dup: false, del: false },
      ];
      if (NAME) els.push({ id: 'sign', kind: 'pos', label: NAME, x: sgP[0], y: sgP[1], t0: 0, d: OUT, box: [sgP[0] - 300, sgP[1] - 35, 600, 70], dup: false, del: false });
      return els;
    }
    const stars = Array.from({ length: 70 }, (_, i) => [hash(i * 3.3) * W, 120 + hash(i * 5.1) * 900, 1 + hash(i * 7.7) * 2.2]);
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        const q = seg(t, OUT - 0.35, 0.35), u = E.inOutS(seg(t, DAWN, 1.3));
        if (!VID.collecting) { const c = G(), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, mix('#070C1E', '#3B4E8C', u)); g.addColorStop(0.55, mix('#0E1834', '#E9877A', u)); g.addColorStop(0.75, mix('#141F3D', '#FFC58A', u)); g.addColorStop(1, mix('#05070F', '#2A2230', u)); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40);
          stars.forEach(([x, y, r], i) => { c.globalAlpha = (1 - u) * (0.4 + 0.6 * Math.abs(Math.sin(t * 1.7 + i))); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); });
          c.globalAlpha = 1 - u; c.fillStyle = '#F4F1E6'; c.beginPath(); c.arc(880, 175, 46, 0, TAU); c.fill(); c.fillStyle = mix('#070C1E', '#3B4E8C', u); c.beginPath(); c.arc(902, 162, 42, 0, TAU); c.fill();
          if (u > 0) { const sy = lerp(1350, 1020, u), sg = c.createRadialGradient(780, sy, 20, 780, sy, 420); sg.addColorStop(0, 'rgba(255,214,140,' + u + ')'); sg.addColorStop(1, 'rgba(255,170,90,0)'); c.globalAlpha = 1; c.fillStyle = sg; c.fillRect(300, sy - 420, 900, 840); c.fillStyle = '#FFE2A8'; c.beginPath(); c.arc(780, sy, 90, 0, TAU); c.fill(); }
          // the building
          c.globalAlpha = 1; const body = mix('#18213A', '#334262', u); c.fillStyle = mix('#0A0F1E', '#262B3C', u); c.fillRect(-20, BB, W + 40, H - BB + 20);
          c.fillStyle = body; c.fillRect(BX, BT, BW, BB - BT); c.fillStyle = mix('#232E4E', '#43547A', u); c.fillRect(BX - 16, BT - 18, BW + 32, 24); c.fillRect(BX + BW - 130, BT - 90, 90, 72);
          for (let k = 0; k < NF; k++) { const fy = BB - (k + 1) * fh, tk = W0 + (k * (W1 - W0)) / NF, dur = (W1 - W0) / NF; c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(BX, fy + fh - 6, BW, 6);
            for (let j = 0; j < 4; j++) { const wx = BX + 40 + j * ((BW - 80 - 90) / 4 + 30), ww = (BW - 80 - 90) / 4, wy = fy + fh * 0.22, wh = fh * 0.56;
              const on = seg(t, tk + j * 0.05, 0.08) * (1 - seg(t, tk + dur * 1.25 + j * 0.04, 0.15)), done = seg(t, tk + dur * 1.25, 0.2);
              c.fillStyle = mix(mix('#0D1424', '#FFD27A', on), '#FFE3B8', u * 0.85); c.fillRect(wx, wy, ww, wh); if (done > 0 && u < 1) { c.fillStyle = 'rgba(160,215,255,' + 0.22 * done * (1 - u) + ')'; c.fillRect(wx, wy, ww, wh); }
              if (u > 0) { c.fillStyle = 'rgba(255,255,255,' + 0.25 * u + ')'; c.beginPath(); c.moveTo(wx, wy + wh); c.lineTo(wx + ww * 0.45, wy); c.lineTo(wx + ww * 0.65, wy); c.lineTo(wx + ww * 0.2, wy + wh); c.fill(); } }
            const act = seg(t, tk, dur * 1.25); if (act > 0 && act < 1) { const sx = BX + 40 + act * (BW - 80), sy = fy + fh * 0.5; c.globalCompositeOperation = 'lighter'; c.drawImage(K7.spark('#9FD8FF'), sx - 40, sy - 40, 80, 80); c.globalCompositeOperation = 'source-over'; } }
          if (NAME) { const f = F(900, Math.min(44, fitSize(NAME, 900, BW - 80, 44, 'Mont', 4)), 'Mont'), tw = textW(NAME, f, 4), [sgx, sgy] = posOf(elP('sign'), [W / 2, BT - 54]); c.fillStyle = '#0B0F1C'; c.fillRect(sgx - tw / 2 - 24, sgy - 32, tw + 48, 60); setF(f, 4); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = mix(OR, '#FFFFFF', 0.1); c.shadowColor = OR; c.shadowBlur = 24 * (1 - u); c.fillText(NAME, sgx, sgy); c.shadowBlur = 0; }
          D(); }
        if (t < OUT) {
          { const [tix, tiy] = posOf(elP('title'), [W / 2, 330]); head(TITLE, t, 0.1, tiy, { q, x: tix }); }
          const cm = m1 !== null && m2 !== null ? clockStr(m1 + (((m2 - m1 + 1440) % 1440) || 480) * E.inOutS(seg(t, W0, DAWN - W0))) : t < DAWN ? T1 : T2;
          const line = t < DAWN + 0.4 ? cm + '   ·   ' + L1 : T2 + '   ·   ' + L2, [clx, cly] = posOf(elP('clock'), [W / 2, 425]); chip(line, clx, cly, { p: seg(t, 0.5, 0.4) * (1 - q), size: 30, bg: t < DAWN + 0.4 ? 'rgba(8,12,28,0.85)' : OR, col: t < DAWN + 0.4 ? WHT : onCol(OR), fam: 'Mont' });
          if (q > 0) fillScreen(BLK, q);
        }
        if (t >= OUT) { bg(); close(t, OUT, { y: 620, line: END }); }
      },
      cues() { const ev = [['whoosh', 0.1, 0.22, 0], ['tick', 0.5, 0.2, 0]]; for (let k = 0; k < 6; k++) ev.push(['switch', W0 + (k * (W1 - W0)) / 6, 0.22, (k % 2 ? 0.3 : -0.3)], ['shimmer', W0 + (k * (W1 - W0)) / 6 + 0.2, 0.07, 0]);
        ev.push(['ticks', W0, 0.08, 0, { dur: DAWN - W0, n: 24 }], ['swell', DAWN - 0.2, 0.25, 0], ['chime', DAWN + 0.6, 0.28, 0]); return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ THE CHECKLIST
  const CHECK = {
    cleaning: ['DEEP CLEAN CHECKLIST', 'Counters & backsplash\nCabinet fronts\nSinks & faucets\nBaseboards\nFloors, every corner\nTrash out', 'DONE', 'Every room. Every visit.'],
    carpet: ['CARPET CLEANING CHECKLIST', 'Furniture moved\nStains pre-treated\nDeep clean\nSpot check\nFibers groomed\nFurniture back', 'DONE', 'Room by room.'],
    commercial: ['NIGHTLY CHECKLIST', 'Desks wiped\nTrash & recycling out\nRestrooms restocked\nBreak room cleaned\nFloors vacuumed\nDoors locked', 'INSPECTED', 'Ready before your team walks in.'],
    hvac: ['TUNE-UP CHECKLIST', 'Filter replaced\nCoils cleaned\nRefrigerant checked\nThermostat tested\nDrain line flushed\nSystem tested', 'PASSED', 'Every visit, every system.'],
    detailing: ['FULL DETAIL CHECKLIST', 'Foam wash\nWheels & tires\nClay bar\nPolish & wax\nInterior vacuum\nGlass, inside & out', 'DETAILED', 'Every inch.'],
    pressure: ['WASH CHECKLIST', 'Driveway\nSidewalks\nHouse siding\nFence\nPatio\nFinal rinse', 'DONE', 'Every surface.'],
    roofing: ['ROOF INSPECTION', 'Shingles\nFlashing\nVents\nGutters\nAttic check\nPhotos for you', 'INSPECTED', 'Top to bottom.'],
    hardscape: ['BACKYARD BUILD CHECKLIST', 'Design approved\nExcavation & base\nPavers set\nJoints sanded\nCleanup\nFinal walk-through', 'DONE', 'Built start to finish.'],
    fencing: ['FENCE INSTALL CHECKLIST', 'Property line marked\nPosts set in concrete\nRails attached\nPickets hung\nGate swings true\nCleanup', 'DONE', 'Straight, every post.'],
    barbershop: ['THE FULL SERVICE', 'Consultation\nFade\nBeard shape-up\nHot towel\nStyle\nMirror check', 'FRESH', 'Every cut.'],
    restaurant: ['OPENING CHECKLIST', 'Salsas made\nPrep done\nGrill fired up\nTables set\nMusic on\nDoors open', 'OPEN', 'See you soon.'],
    general: ['THE CHECKLIST', 'Step one\nStep two\nStep three\nStep four\nStep five', 'DONE', 'Done right.'],
  };
  CHECK.landscaping = CHECK.hardscape; CHECK.salon = CHECK.barbershop;
  function checkx() {
    const Cd = pick(CHECK);
    const TITLE = TX('title', '', { label: 'Headline above (optional)', group: 'Words', max: 26 });
    const HEADR = TX('head', Cd[0], { label: 'Clipboard title', group: 'Words', upper: true, max: 28 });
    const ITEMS = lines(TX('items', Cd[1], { label: 'Items (one per line)', group: 'Words', multiline: true, max: 200, hint: '2 to 7 lines.' })).slice(0, 7);
    const STAMP = off(TX('stamp', Cd[2], { label: 'Stamp', group: 'Words', upper: true, max: 10, hint: DASH }));
    const FOOT = off(TX('foot', Cd[3], { label: 'Note at the bottom', group: 'Words', max: 34, hint: DASH }));
    const END = TX('end', 'Done *right.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const n = Math.max(1, ITEMS.length), STEP = Math.min(0.5, 2.8 / n), at = i => 1.2 + i * STEP, ST = 4.4, OUT = 6.6, DUR = OUT + 4.2;
    const BR0 = [150, 390, 780, 890];
    const BR = (EL && EL.box) ? [elNum(EL.box.x, BR0[0]), elNum(EL.box.y, BR0[1]), elNum(EL.box.w, BR0[2]), elNum(EL.box.h, BR0[3])] : BR0;
    const PP = [BR[0] + 40, BR[1] + 70, BR[2] - 80, BR[3] - 100], rowH = Math.min(86, 520 / n), fs = Math.min(40, rowH * 0.47), INK = lum(OR) > 0.6 ? mix(OR, '#000000', 0.35) : OR;
    function elements() {
      const tiP = posOf(elP('title'), [W / 2, 320]);
      const hdP = posOf(elP('head'), [PP[0] + 40, PP[1] + 105]);
      const ftP = posOf(elP('foot'), [PP[0] + 40, PP[1] + PP[3] - 50]);
      const smP = posOf(elP('stamp'), [PP[0] + PP[2] - 175, PP[1] + PP[3] - 92]);
      const els = [
        { id: 'board', kind: 'box', label: 'Clipboard', x: BR[0], y: BR[1], w: BR[2], h: BR[3], t0: 0.05, d: OUT - 0.05, box: [BR[0], BR[1], BR[2], BR[3]], dup: false, del: false },
        { id: 'head', kind: 'pos', label: HEADR, x: hdP[0], y: hdP[1], t0: 0.5, d: OUT - 0.5, box: [hdP[0] - 10, hdP[1] - 45, 620, 60], dup: false, del: false },
      ];
      if (TITLE) els.push({ id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.1, d: OUT - 0.1, box: [tiP[0] - 470, tiP[1] - 50, 940, 110], dup: false, del: false });
      ITEMS.forEach((s, i) => { const ip = posOf(elP('item' + (i + 1)), [PP[0] + 40, PP[1] + 200 + i * rowH]); els.push({ id: 'item' + (i + 1), kind: 'pos', label: s, x: ip[0], y: ip[1], t0: at(i), d: OUT - at(i), box: [ip[0] - 10, ip[1] - fs, 560, fs + 20], dup: false, del: false }); });
      if (FOOT) els.push({ id: 'foot', kind: 'pos', label: FOOT, x: ftP[0], y: ftP[1], t0: ST - 0.3, d: OUT - (ST - 0.3), box: [ftP[0] - 10, ftP[1] - 35, 500, 50], dup: false, del: false });
      if (STAMP) els.push({ id: 'stamp', kind: 'pos', label: STAMP, x: smP[0], y: smP[1], t0: ST, d: OUT - ST, box: [smP[0] - 140, smP[1] - 60, 280, 120], dup: false, del: false });
      return els;
    }
    return {
      dur: DUR, shakes: [[ST, 9]], elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = fa(t, 0.05, 0.5) * (1 - q), oy = (1 - E.outC(seg(t, 0, 0.6))) * 160;
          if (TITLE) { const [tix, tiy] = posOf(elP('title'), [W / 2, 320]); head(TITLE, t, 0.1, tiy, { q, max: 84, x: tix }); }
          if (!VID.collecting) { const c = G(); c.globalAlpha = a; c.translate(0, oy);
            c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 60; c.shadowOffsetY = 26; const g = c.createLinearGradient(BR[0], BR[1], BR[0] + BR[2], BR[1] + BR[3]); g.addColorStop(0, '#A8733F'); g.addColorStop(1, '#7A4F28'); c.fillStyle = g; c.beginPath(); c.roundRect(BR[0], BR[1], BR[2], BR[3], 30); c.fill(); c.shadowBlur = 0; c.shadowOffsetY = 0;
            c.fillStyle = '#FFFFFF'; c.shadowColor = 'rgba(0,0,0,0.25)'; c.shadowBlur = 12; c.fillRect(PP[0], PP[1], PP[2], PP[3]); c.shadowBlur = 0;
            const mg = c.createLinearGradient(0, BR[1] - 40, 0, BR[1] + 70); mg.addColorStop(0, '#E5E8EC'); mg.addColorStop(1, '#9AA2AC'); c.fillStyle = mg; c.beginPath(); c.roundRect(W / 2 - 120, BR[1] - 40, 240, 100, 18); c.fill(); c.fillStyle = '#6C747E'; c.beginPath(); c.roundRect(W / 2 - 60, BR[1] - 20, 120, 26, 13); c.fill();
            const [hdx, hdy] = posOf(elP('head'), [PP[0] + 40, PP[1] + 105]);
            setF(F(800, Math.min(40, fitSize(HEADR, 800, PP[2] - 80, 40, 'Mont', 2)), 'Mont'), 2); c.fillStyle = '#1A1D23'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText(HEADR, hdx, hdy); c.fillStyle = INK; c.fillRect(hdx, hdy + 20, 120, 6);
            ITEMS.forEach((s, i) => { const y = PP[1] + 200 + i * rowH, [itx, ity] = posOf(elP('item' + (i + 1)), [PP[0] + 40, y]), ck = E.inOutC(seg(t, at(i), 0.3)); c.strokeStyle = '#B8BEC6'; c.lineWidth = 3; c.strokeRect(itx, ity - fs * 0.95, fs * 1.1, fs * 1.1);
              setF(F(ck > 0.6 ? 700 : 600, Math.min(fs, fitSize(s, 700, PP[2] - 160, fs, 'Mont')), 'Mont'), 0); c.fillStyle = ck > 0.6 ? '#1A1D23' : '#6B717A'; c.fillText(s, itx + fs * 1.6, ity);
              if (ck > 0) { const x0 = itx, y0 = ity - fs * 0.95, s1 = fs * 1.1, P1 = [x0 + s1 * 0.15, y0 + s1 * 0.55], P2 = [x0 + s1 * 0.42, y0 + s1 * 0.85], P3 = [x0 + s1 * 1.05, y0 - s1 * 0.15], L1 = Math.hypot(P2[0] - P1[0], P2[1] - P1[1]), L2 = Math.hypot(P3[0] - P2[0], P3[1] - P2[1]), d = (L1 + L2) * ck;
                c.strokeStyle = INK; c.lineWidth = 8; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(P1[0], P1[1]); if (d <= L1) c.lineTo(lerp(P1[0], P2[0], d / L1), lerp(P1[1], P2[1], d / L1)); else { c.lineTo(P2[0], P2[1]); c.lineTo(lerp(P2[0], P3[0], (d - L1) / L2), lerp(P2[1], P3[1], (d - L1) / L2)); } c.stroke(); } });
            if (FOOT) { const [ftx, fty] = posOf(elP('foot'), [PP[0] + 40, PP[1] + PP[3] - 50]); c.globalAlpha = a * fa(t, ST - 0.3, 0.4); setF(F(600, Math.min(30, fitSize(FOOT, 600, PP[2] - 380, 30, 'Mont')), 'Mont'), 0); c.fillStyle = '#6B717A'; c.fillText(FOOT, ftx, fty); c.globalAlpha = a; }
            D();
            const sp = seg(t, ST, 0.35); if (STAMP && sp > 0) { const c2 = G(), s = lerp(2.4, 1, E.outQ(sp)), f = F(900, Math.min(60, fitSize(STAMP, 900, 250, 60, 'Mont', 4)), 'Mont'), tw = textW(STAMP, f, 4), [smx, smy] = posOf(elP('stamp'), [PP[0] + PP[2] - 175, PP[1] + PP[3] - 92 + oy]); c2.globalAlpha = clamp(sp * 4) * 0.9 * (1 - q); c2.translate(smx, smy); c2.rotate(-0.16); c2.scale(s, s);
              c2.strokeStyle = '#D62839'; c2.lineWidth = 8; c2.beginPath(); c2.roundRect(-tw / 2 - 34, -58, tw + 68, 116, 18); c2.stroke(); c2.lineWidth = 3; c2.beginPath(); c2.roundRect(-tw / 2 - 22, -46, tw + 44, 92, 12); c2.stroke(); setF(f, 4); c2.fillStyle = '#D62839'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText(STAMP, 0, 4); D(); } }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.05, 0.25, 0], ['clack', 0.5, 0.3, 0]]; for (let i = 0; i < 6; i++) ev.push(['pencil', 1.2 + i * 0.466, 0.3, 0.1], ['tick', 1.45 + i * 0.466, 0.12, 0.2]); ev.push(['stamp', ST, 0.5, 0.2], ['thud', ST + 0.02, 0.25, 0]); return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ PLANS & PACKAGES
  const PLANS = {
    cleaning: [['Monthly', '$160', '/ visit', 'Full house clean\nKitchen & baths\nFloors throughout'], ['Biweekly', '$135', '/ visit', 'Everything in Monthly\nSame team each time\nFlexible scheduling'], ['Weekly', '$115', '/ visit', 'Everything in Biweekly\nLinens changed\nPriority booking'], 2],
    carpet: [['2 Rooms', '$99', '', 'Pre-treat\nDeep clean\nGroomed fibers'], ['4 Rooms', '$179', '', 'Everything in 2 Rooms\nStain treatment\nOne hallway'], ['Whole Home', '$249', '', 'Up to 6 rooms\nStairs included\nDeodorizer'], 2],
    commercial: [['Weekly', '$299', '/ mo', '1 visit a week\nTrash & restrooms\nFloors'], ['3× a week', '$699', '/ mo', 'Everything in Weekly\nBreak room\nGlass & entry'], ['Nightly', '$1,190', '/ mo', 'Every weeknight\nFloor care\nSupplies restocked'], 2],
    hvac: [['Basic', '$12', '/ mo', '1 tune-up a year\nFilter reminders\nPriority booking'], ['Comfort', '$19', '/ mo', '2 tune-ups a year\nFilters included\nPriority booking'], ['Total', '$29', '/ mo', '2 tune-ups a year\nFilters included\nRepair discount'], 2],
    detailing: [['Express', '$79', '', 'Foam wash\nWheels & tires\nInterior vacuum'], ['Full Detail', '$199', '', 'Everything in Express\nClay bar & wax\nInterior shampoo'], ['Ceramic', '$599', '', 'Paint correction\nCeramic coating\nFull detail'], 2],
    barbershop: [['Cut Club', '$45', '/ mo', '1 cut a month\nPriority booking'], ['Cut + Beard', '$65', '/ mo', '1 cut a month\nBeard trims\nHot towel'], ['Unlimited', '$99', '/ mo', 'Cuts every week\nBeard trims\nProduct discount'], 3],
    pressure: [['Driveway', '$149', '', 'Driveway\nWalkway\nRinse down'], ['Curb Appeal', '$299', '', 'Driveway & walks\nHouse siding\nFront porch'], ['Whole Property', '$449', '', 'Everything in Curb Appeal\nFence\nPatio'], 2],
    general: [['Starter', '$99', '', 'Feature one\nFeature two'], ['Standard', '$199', '', 'Everything in Starter\nFeature three'], ['Premium', '$299', '', 'Everything in Standard\nFeature four'], 2],
  };
  PLANS.salon = PLANS.barbershop; PLANS.pro = PLANS.general;
  function plansx() {
    const Pd = pick(PLANS);
    const TITLE = TX('title', 'Pick your *plan.*', { label: 'Headline', group: 'Words', max: 26, hint: 'Wrap a word in *stars* to colour it.' });
    const NP = +TX('count', '3', { label: 'Plans', group: 'Plans', options: opts([['2', '2 plans'], ['3', '3 plans']]) });
    const PL = [0, 1, 2].slice(0, NP).map(k => ({ name: TX('n' + (k + 1), Pd[k][0], { label: 'Plan ' + (k + 1), group: 'Plans', max: 16 }), price: TX('pr' + (k + 1), Pd[k][1], { label: 'Plan ' + (k + 1) + ' price', group: 'Plans', max: 8 }),
      per: off(TX('pe' + (k + 1), Pd[k][2] || '-', { label: 'Plan ' + (k + 1) + ' period', group: 'Plans', max: 8, hint: 'e.g. / mo. ' + DASH })), feat: lines(TX('f' + (k + 1), Pd[k][3], { label: 'Plan ' + (k + 1) + ' features (one per line)', group: 'Plans', multiline: true, max: 90 })).slice(0, 3) }));
    const HL = Math.min(NP, +TX('pick', String(Math.min(NP, Pd[3])), { label: 'Highlighted plan', group: 'Plans', options: opts([['0', 'None'], ['1', 'Plan 1'], ['2', 'Plan 2'], ['3', 'Plan 3']]) })) - 1;
    const BADGE = off(TX('badge', 'OUR PICK', { label: 'Badge on the highlighted plan', group: 'Plans', upper: true, max: 14, hint: DASH }));
    const NOTE = off(TX('note', 'Ask about custom plans.', { label: 'Footnote', group: 'Words', max: 34, hint: DASH }));
    const END = TX('end', 'Pick yours *today.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const n = PL.length, ch = n === 3 ? 250 : 300, gap = 34, y0 = 460, HT = 3.2, OUT = 6.4, DUR = OUT + 4.2, cardC = mix(DEEP1, '#FFFFFF', 0.07);
    function elements() {
      const tiP = posOf(elP('title'), [W / 2, 345]);
      const ntP = posOf(elP('note'), [W / 2, y0 + n * (ch + gap) + 40]);
      const els = [{ id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.1, d: OUT - 0.1, box: [tiP[0] - 470, tiP[1] - 60, 940, 120], dup: false, del: false }];
      PL.forEach((p, i) => { const cp = posOf(elP('plan' + (i + 1)), [90, y0 + i * (ch + gap)]); els.push({ id: 'plan' + (i + 1), kind: 'card', label: p.name + ' ' + p.price, x: cp[0], y: cp[1], w: 900, h: ch, t0: 0.5 + i * 0.3, d: OUT - (0.5 + i * 0.3), box: [cp[0], cp[1], 900, ch], dup: false, del: false }); });
      if (NOTE) els.push({ id: 'note', kind: 'pos', label: NOTE, x: ntP[0], y: ntP[1], t0: HT + 0.5, d: OUT - (HT + 0.5), box: [ntP[0] - 400, ntP[1] - 35, 800, 60], dup: false, del: false });
      return els;
    }
    return {
      dur: DUR, shakes: [[HT, 6]], elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35); { const [tix, tiy] = posOf(elP('title'), [W / 2, 345]); head(TITLE, t, 0.1, tiy, { q, max: 100, x: tix }); }
          PL.forEach((p, i) => {
            const k = E.outBack(seg(t, 0.5 + i * 0.3, 0.55)), dx = (1 - k) * (i % 2 ? 1100 : -1100), hl = i === HL, hp = hl ? E.outBack(seg(t, HT, 0.4)) : 0, dim = HL >= 0 && !hl ? 1 - 0.45 * seg(t, HT, 0.4) : 1, a = clamp(k * 2) * dim * (1 - q);
            const [plx, ply] = posOf(elP('plan' + (i + 1)), [90 + dx, y0 + i * (ch + gap)]), r = [plx, ply, 900, ch];
            card(r, 30, a, cardC); if (VID.collecting || a <= 0) return;
            const c = G(); c.globalAlpha = a;
            if (hp > 0) { c.strokeStyle = OR; c.lineWidth = 6; c.shadowColor = OR; c.shadowBlur = 30 * clamp(hp); c.beginPath(); c.roundRect(r[0], r[1], r[2], r[3], 30); c.stroke(); c.shadowBlur = 0; }
            setF(F(800, Math.min(46, fitSize(p.name, 800, 470, 46, 'Mont', -1)), 'Mont'), -1); c.fillStyle = WHT; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText(p.name, r[0] + 44, r[1] + 76);
            p.feat.forEach((f, j) => { c.globalAlpha = a * fa(t, 1.4 + i * 0.35 + j * 0.12, 0.35); setF(F(600, Math.min(28, fitSize(f, 600, 440, 28, 'Mont')), 'Mont'), 0); c.fillStyle = OR; c.fillText('✓', r[0] + 44, r[1] + 130 + j * 40); c.fillStyle = WA(0.85); c.fillText(f, r[0] + 82, r[1] + 130 + j * 40); });
            c.globalAlpha = a; const pf = F(900, Math.min(84, fitSize(p.price, 900, 330, 84, 'Mont', -3)), 'Mont'); setF(pf, -3); c.textAlign = 'right'; c.fillStyle = hl && hp > 0 ? OR : WHT; c.fillText(p.price, r[0] + r[2] - 44, r[1] + r[3] / 2 + (p.per ? 18 : 30));
            if (p.per) { setF(F(600, 28, 'Mont'), 0); c.fillStyle = WA(0.6); c.fillText(p.per, r[0] + r[2] - 44, r[1] + r[3] / 2 + 62); }
            D();
            if (hl && BADGE) chip(BADGE, r[0] + r[2] - 40, r[1], { p: hp, size: 26, align: 'right', bg: OR, col: onCol(OR), fam: 'Mono', w: 700, ls: 4 });
          });
          if (NOTE) { const [ntx, nty] = posOf(elP('note'), [W / 2, y0 + n * (ch + gap) + 40]); K7.txt(NOTE, ntx, nty, F(600, 30, 'Mont'), WA(0.7), { align: 'center', a: fa(t, HT + 0.5, 0.4) * (1 - q) }); }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.05, 0.22, 0]]; [0, 1, 2].forEach(i => ev.push(['whoosh', 0.5 + i * 0.3, 0.25, i % 2 ? 0.4 : -0.4], ['thud', 0.75 + i * 0.3, 0.22, 0])); for (let i = 0; i < 3; i++) ev.push(['tick', 1.4 + i * 0.35, 0.18, 0]);
        ev.push(['riser', HT - 0.1, 0.12, 0], ['impact', HT, 0.32, 0], ['sparkle', HT + 0.1, 0.18, 0.3], ['pop', HT + 0.3, 0.25, 0.3]); return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ ON THE WAY (service van)
  const VANT = { detailing: 'Mobile *detailing.*', hvac: 'Help is *on the way.*', cleaning: 'Your cleaners are *on the way.*', carpet: 'We come *to you.*', commercial: 'Your crew is *on the way.*', general: 'We come *to you.*' };
  function vanx() {
    const TITLE = TX('title', VANT[IND] || VANT.general, { label: 'Headline', group: 'Words', max: 30, hint: 'Wrap a word in *stars* to colour it.' });
    const SIDE = off(TX('side', (BRAND.services || []).slice(0, 3).join('  ·  ') || 'SERVICE · REPAIR · INSTALL', { label: 'Line on the van', group: 'Van', upper: true, max: 40, hint: DASH }));
    const BADGE = off(TX('badge', 'ON THE WAY', { label: 'Badge', group: 'Words', upper: true, max: 16, hint: DASH }));
    const ETA = off(TX('eta', 'ARRIVING 9:30 AM', { label: 'Arrival line', group: 'Words', upper: true, max: 22, hint: DASH }));
    const VCOL = TX('vcol', 'white', { label: 'Van colour', group: 'Van', options: opts([['white', 'White'], ['accent', 'Accent colour'], ['ink', 'Dark']]) });
    const LAD = TX('ladder', ['detailing', 'cleaning', 'carpet', 'commercial', 'barbershop', 'salon'].includes(IND) ? 'no' : 'yes', { label: 'Roof ladder', group: 'Van', options: opts([['yes', 'Yes'], ['no', 'No']]) });
    const END = TX('end', 'Book your *visit.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const ARR = 0.4, STOP = 1.6, BT = 1.9, ET = 2.3, FL = 2.8, OUT = 6.2, DUR = OUT + 4.2, GY = 1090;
    function elements() {
      const tiP = posOf(elP('title'), [W / 2, 340]);
      const vnP = posOf(elP('van'), [540, GY]);
      const bgP = posOf(elP('badge'), [W / 2, GY - 450]);
      const etP = posOf(elP('eta'), [W / 2, GY + 170]);
      const els = [
        { id: 'van', kind: 'box', label: 'Service van', x: vnP[0], y: vnP[1], w: 780, h: 366, t0: ARR, d: OUT - ARR, box: [vnP[0] - 390, vnP[1] - 366, 780, 366], dup: false, del: false },
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.1, d: OUT - 0.1, box: [tiP[0] - 470, tiP[1] - 60, 940, 120], dup: false, del: false },
      ];
      if (BADGE) els.push({ id: 'badge', kind: 'pos', label: BADGE, x: bgP[0], y: bgP[1], t0: BT, d: OUT - BT, box: [bgP[0] - 300, bgP[1] - 40, 600, 80], dup: false, del: false });
      if (ETA) els.push({ id: 'eta', kind: 'pos', label: ETA, x: etP[0], y: etP[1], t0: ET, d: OUT - ET, box: [etP[0] - 300, etP[1] - 35, 600, 70], dup: false, del: false });
      return els;
    }
    const body = VCOL === 'accent' ? OR : VCOL === 'ink' ? '#1C1F26' : '#F4F5F7', txt = onCol(body), logo = () => (txt === '#FFFFFF' ? IMG.logoW : IMG.logoB);
    function van(c, t) {   // drawn at the origin: x 0..780 (front on the left), ground at y = 0
      c.fillStyle = 'rgba(0,0,0,0.45)'; c.beginPath(); c.ellipse(390, 4, 420, 18, 0, 0, TAU); c.fill();
      if (LAD === 'yes') { c.strokeStyle = '#8E969F'; c.lineWidth = 7; c.beginPath(); c.moveTo(230, -346); c.lineTo(750, -346); c.moveTo(230, -366); c.lineTo(750, -366); c.stroke(); c.lineWidth = 5; for (let x = 250; x < 750; x += 46) { c.beginPath(); c.moveTo(x, -346); c.lineTo(x, -366); c.stroke(); } c.fillStyle = '#5E656E'; c.fillRect(300, -336, 12, 18); c.fillRect(660, -336, 12, 18); }
      c.fillStyle = body; c.beginPath(); c.moveTo(780, -50); c.lineTo(780, -300); c.quadraticCurveTo(780, -320, 760, -320); c.lineTo(190, -320); c.quadraticCurveTo(160, -320, 140, -296); c.lineTo(52, -205); c.quadraticCurveTo(8, -196, 4, -160); c.lineTo(0, -80); c.quadraticCurveTo(0, -50, 30, -50); c.closePath(); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, -88, 780, 38); c.fillStyle = '#2A3038'; c.beginPath(); c.moveTo(170, -298); c.lineTo(292, -298); c.lineTo(292, -205); c.lineTo(78, -205); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.moveTo(190, -294); c.lineTo(230, -294); c.lineTo(150, -209); c.lineTo(110, -209); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 3; c.beginPath(); c.moveTo(300, -310); c.lineTo(300, -60); c.stroke(); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(262, -170, 26, 7);
      const fl = Math.floor((t - FL) * 6) % 2 === 0 && t > FL && t < FL + 0.7; c.fillStyle = fl ? '#FFF8D6' : '#FFE08A'; c.beginPath(); c.roundRect(2, -150, 22, 34, 8); c.fill(); if (fl) { const g = c.createRadialGradient(0, -133, 4, 0, -133, 160); g.addColorStop(0, 'rgba(255,240,190,0.7)'); g.addColorStop(1, 'rgba(255,240,190,0)'); c.fillStyle = g; c.fillRect(-160, -293, 200, 320); }
      c.fillStyle = '#D62828'; c.fillRect(768, -260, 12, 60); c.fillStyle = OR; c.fillRect(300, -100, 480, 9);
      const im = logo(); if (im) { const [lw, lh] = logoBox(360); c.drawImage(im, 540 - lw / 2, -248 - lh / 2, lw, lh); }
      if (SIDE) { const f = F(800, Math.min(26, fitSize(SIDE, 800, 420, 26, 'Mont')), 'Mont'); c.font = f; c.letterSpacing = '0px'; c.fillStyle = txt; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(SIDE, 540, -176); }
      if (CONTACT.phone) { c.font = F(800, 30, 'Mont'); c.fillStyle = txt; c.textAlign = 'center'; c.fillText(CONTACT.phone, 540, -134); }
      const rot = (1500 - curX) / 62; [150, 625].forEach(x => { c.fillStyle = '#121418'; c.beginPath(); c.arc(x, -62, 76, Math.PI, TAU); c.fill(); c.fillStyle = '#16181C'; c.beginPath(); c.arc(x, -62, 62, 0, TAU); c.fill(); c.fillStyle = '#B8C0C8'; c.beginPath(); c.arc(x, -62, 30, 0, TAU); c.fill();
        c.strokeStyle = '#7C858F'; c.lineWidth = 6; for (let k = 0; k < 5; k++) { const a = rot + (k * TAU) / 5; c.beginPath(); c.moveTo(x, -62); c.lineTo(x + Math.cos(a) * 28, -62 + Math.sin(a) * 28); c.stroke(); } });
    }
    let curX = 1500;
    return {
      dur: DUR, shakes: [[STOP, 7]], elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), mv = E.outQ(seg(t, ARR, STOP - ARR)), x = lerp(1500, 540, mv), sp = (1 - mv) * clamp((t - ARR) * 8), lt = t - STOP, tilt = lt > 0 ? -0.035 * Math.sin(lt * 14) * Math.exp(-lt * 6) : 0; curX = x;
          { const [tix, tiy] = posOf(elP('title'), [W / 2, 340]); head(TITLE, t, 0.1, tiy, { q, max: 96, x: tix }); }
          if (!VID.collecting) { const c = G(); c.globalAlpha = 1 - q; c.fillStyle = '#20242C'; c.fillRect(-20, GY, W + 40, 90); c.fillStyle = 'rgba(255,255,255,0.65)'; for (let k = -1; k < 8; k++) { const xx = ((k * 200 - (1500 - x) * 0.9) % 1600 + 1600) % 1600 - 200; c.fillRect(xx, GY + 40, 110, 8); }
            c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 4; c.lineCap = 'round'; for (let k = 0; k < 6; k++) { const yy = GY - 60 - k * 45, l = 120 + hash(k) * 160; c.globalAlpha = (1 - q) * sp * 0.8; c.beginPath(); c.moveTo(x + 430 + hash(k * 3) * 60, yy); c.lineTo(x + 430 + hash(k * 3) * 60 + l, yy); c.stroke(); }
            c.globalAlpha = 1 - q; const [vx, vy] = posOf(elP('van'), [x, GY]); c.translate(vx - 390, vy); c.translate(60, 0); c.rotate(tilt); c.translate(-60, 0); van(c, t); D(); }
          if (BADGE) { const [bgx, bgy] = posOf(elP('badge'), [W / 2, GY - 450]); chip(BADGE, bgx, bgy, { p: seg(t, BT, 0.4) * (1 - q), size: 34, bg: OR, col: onCol(OR), w: 900, ls: 3 }); }
          if (ETA) { const ep = seg(t, ET, 0.4) * (1 - q), [etx, ety] = posOf(elP('eta'), [W / 2, GY + 170]); const w = chip('      ' + ETA, etx, ety, { p: ep, size: 32, bg: 'rgba(255,255,255,0.1)', border: WA(0.3) });
            if (ep > 0 && !VID.collecting) { const c = G(), ix = etx - w / 2 + 40, iy = ety; c.globalAlpha = clamp(ep * 3); c.strokeStyle = OR; c.lineWidth = 4; c.beginPath(); c.arc(ix, iy, 16, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(ix, iy); c.lineTo(ix, iy - 10); c.moveTo(ix, iy); c.lineTo(ix + 8, iy + 3); c.stroke(); D(); } }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.05, 0.2, 0], ['rumble', ARR, 0.3, 0.5], ['whoosh', ARR + 0.7, 0.3, 0.2], ['thud', STOP, 0.3, 0], ['clack', STOP + 0.05, 0.2, 0], ['pop', BT, 0.3, 0], ['notify', ET, 0.25, 0], ['click', FL, 0.3, -0.3], ['click', FL + 0.34, 0.3, -0.3]]; return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ PIZZA BUILDER
  const TOP = {
    pepperoni: ['Pepperoni', (c) => { c.fillStyle = '#B5302A'; c.beginPath(); c.arc(0, 0, 30, 0, TAU); c.fill(); c.strokeStyle = '#8E2420'; c.lineWidth = 4; c.stroke(); c.fillStyle = '#7E1E19'; [[-10, -8], [9, 6], [-4, 12], [12, -10]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 3.5, 0, TAU); c.fill(); }); }],
    mushroom: ['Mushrooms', (c) => { c.fillStyle = '#E7D9C0'; c.beginPath(); c.roundRect(-8, -2, 16, 26, 5); c.fill(); c.fillStyle = '#C9B28E'; c.beginPath(); c.ellipse(0, -4, 28, 18, 0, Math.PI, TAU); c.closePath(); c.fill(); c.strokeStyle = 'rgba(90,60,30,0.35)'; c.lineWidth = 2; for (let x = -18; x <= 18; x += 9) { c.beginPath(); c.moveTo(x, -4); c.lineTo(x * 0.6, -14); c.stroke(); } }],
    olive: ['Black olives', (c) => { c.strokeStyle = '#1A1A1A'; c.lineWidth = 9; c.beginPath(); c.arc(0, 0, 13, 0, TAU); c.stroke(); }],
    pepper: ['Green peppers', (c) => { c.strokeStyle = '#3E8E3A'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 24, 0.3, 3.9); c.stroke(); }],
    onion: ['Red onion', (c) => { c.strokeStyle = '#B07CC6'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 26, 0.6, 5.2); c.stroke(); c.beginPath(); c.arc(0, 0, 16, 1.2, 4.6); c.stroke(); }],
    sausage: ['Italian sausage', (c) => { c.fillStyle = '#7A4A2A'; c.beginPath(); for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU, r = 18 + 6 * Math.sin(i * 2.7); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); c.fillStyle = 'rgba(255,220,180,0.25)'; c.beginPath(); c.arc(-5, -5, 6, 0, TAU); c.fill(); }],
    basil: ['Fresh basil', (c) => { c.fillStyle = '#2F7D32'; c.beginPath(); c.ellipse(0, 0, 30, 15, 0.5, 0, TAU); c.fill(); c.strokeStyle = '#1F5A22'; c.lineWidth = 3; c.beginPath(); c.moveTo(-24, -12); c.lineTo(24, 12); c.stroke(); }],
    pineapple: ['Pineapple', (c) => { c.fillStyle = '#F5C542'; c.beginPath(); c.moveTo(-20, -14); c.lineTo(20, -14); c.lineTo(14, 16); c.lineTo(-14, 16); c.closePath(); c.fill(); c.strokeStyle = '#D9A520'; c.lineWidth = 3; c.stroke(); }],
    jalapeno: ['Jalapeños', (c) => { c.strokeStyle = '#4A9A3A'; c.lineWidth = 8; c.beginPath(); c.arc(0, 0, 18, 0, TAU); c.stroke(); c.fillStyle = '#E9E3B0'; [[-5, -4], [5, 3], [0, 7]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 3, 0, TAU); c.fill(); }); }],
  };
  const TOP_OPTS = opts(Object.entries(TOP).map(([k, v]) => [k, v[0]]));
  function pizzax() {
    const TITLE = TX('title', 'Built *fresh.*', { label: 'Headline', group: 'Words', max: 26, hint: 'Wrap a word in *stars* to colour it.' });
    const TP = [['t1', 'pepperoni'], ['t2', 'mushroom'], ['t3', 'pepper']].map(([k, d], i) => TX(k, d, { label: 'Topping ' + (i + 1), group: 'Toppings', options: TOP_OPTS }));
    const NAME = TX('name', 'The *Works*', { label: 'Pizza name', group: 'Words', max: 26 }), PRICE = off(TX('price', '$19', { label: 'Price', group: 'Words', max: 10, hint: DASH }));
    const SAUCE = TX('sauce', 'HOUSE SAUCE', { label: 'Sauce step', group: 'Toppings', upper: true, max: 18 }), CHEESE = TX('cheese', 'MOZZARELLA', { label: 'Cheese step', group: 'Toppings', upper: true, max: 18 });
    const END = TX('end', 'Hot out of *the oven.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const CX = 540, CY = 800, R = 320, DO = 0.3, SA = 0.9, CH = 1.6, TO = 2.4, CUT = 3.6, PULL = 4.4, NM = 4.6, OUT = 6.8, DUR = OUT + 4.2;
    function elements() {
      const tiP = posOf(elP('title'), [W / 2, 320]);
      const pzP = posOf(elP('pizza'), [CX, CY]);
      const stP = posOf(elP('stage'), [CX, CY + R + 110]);
      const nmP = posOf(elP('name'), [CX, CY + R + 140]);
      const prP = posOf(elP('price'), [CX + R - 10, CY - R + 40]);
      const els = [
        { id: 'pizza', kind: 'box', label: 'Pizza', x: pzP[0], y: pzP[1], w: (R + 50) * 2, h: (R + 50) * 2, t0: DO, d: OUT - DO, box: [pzP[0] - (R + 50), pzP[1] - (R + 50), (R + 50) * 2, (R + 50) * 2], dup: false, del: false },
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.1, d: OUT - 0.1, box: [tiP[0] - 470, tiP[1] - 60, 940, 120], dup: false, del: false },
        { id: 'stage', kind: 'pos', label: 'Build stage', x: stP[0], y: stP[1], t0: SA, d: NM - SA, box: [stP[0] - 300, stP[1] - 35, 600, 70], dup: false, del: false },
        { id: 'name', kind: 'pos', label: NAME, x: nmP[0], y: nmP[1], t0: NM, d: OUT - NM, box: [nmP[0] - 470, nmP[1] - 90, 940, 110], dup: false, del: false },
      ];
      if (PRICE) els.push({ id: 'price', kind: 'pos', label: PRICE, x: prP[0], y: prP[1], t0: NM + 0.2, d: OUT - (NM + 0.2), box: [prP[0] - 120, prP[1] - 120, 240, 240], dup: false, del: false });
      return els;
    }
    const cheese = Array.from({ length: 80 }, (_, i) => { const r = Math.sqrt((i + 0.5) / 80) * R * 0.8, a = i * 2.39996; return [Math.cos(a) * r, Math.sin(a) * r, 22 + hash(i * 3) * 18, hash(i * 7) * 0.5, hash(i) * TAU]; });
    const tops = Array.from({ length: 21 }, (_, i) => { const r = Math.sqrt((i + 0.5) / 21) * R * 0.74, a = i * 2.39996 + 0.7; return [Math.cos(a) * r, Math.sin(a) * r, i % 3, hash(i * 5) * TAU]; });
    const wedge = (c, rr) => { c.moveTo(0, 0); c.arc(0, 0, rr, 0, Math.PI / 4); c.closePath(); };
    const stage = t => (t < SA ? '' : t < CH ? SAUCE : t < TO ? CHEESE : t < CUT ? TOP[TP[Math.min(2, Math.floor((t - TO) / 0.35))]][0].toUpperCase() : '');
    function pie(c, t) {
      const dk = E.outBack(seg(t, DO, 0.45)); if (dk <= 0) return; c.save(); c.scale(dk, dk);
      c.fillStyle = '#E3B574'; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill(); c.fillStyle = '#F2DCAE'; c.beginPath(); c.arc(0, 0, R - 26, 0, TAU); c.fill();
      c.strokeStyle = '#C8894A'; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, R - 4, 0, TAU); c.stroke(); c.fillStyle = 'rgba(150,90,40,0.35)'; for (let i = 0; i < 28; i++) { const a = hash(i * 9) * TAU; c.beginPath(); c.arc(Math.cos(a) * (R - 13), Math.sin(a) * (R - 13), 4 + hash(i) * 4, 0, TAU); c.fill(); }
      const sp = E.outC(seg(t, SA, 0.6)); if (sp > 0) { const rs = (R - 34) * sp; c.fillStyle = '#B8321F'; c.beginPath(); for (let i = 0; i <= 48; i++) { const a = (i / 48) * TAU + sp * 2, r = rs * (1 + 0.03 * Math.sin(i * 5 + 1)); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill();
        c.strokeStyle = 'rgba(230,90,60,0.45)'; c.lineWidth = 5; c.beginPath(); for (let i = 0; i < 160 * sp; i++) { const a = i * 0.25, r = (i / 160) * rs * 0.9; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.stroke(); }
      cheese.forEach(([x, y, r, d, rot]) => { const u = seg(t, CH + d, 0.35); if (u <= 0) return; const m = 1 + 0.18 * seg(t, CH + d + 0.4, 0.5); c.save(); c.translate(x, y - (1 - E.outC(u)) * 120); c.rotate(rot); c.globalAlpha *= clamp(u * 3); c.fillStyle = '#F7E6A6'; c.beginPath(); c.ellipse(0, 0, r * m, r * 0.7 * m, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,248,214,0.8)'; c.beginPath(); c.ellipse(-r * 0.25, -r * 0.2, r * 0.35, r * 0.2, 0, 0, TAU); c.fill(); c.restore(); });
      const bake = seg(t, TO + 1.1, 0.8); if (bake > 0) { c.fillStyle = 'rgba(200,120,40,' + 0.12 * bake + ')'; c.beginPath(); c.arc(0, 0, R - 26, 0, TAU); c.fill(); }
      tops.forEach(([x, y, k, rot], i) => { const u = seg(t, TO + k * 0.35 + (i % 7) * 0.03, 0.3); if (u <= 0) return; const s = lerp(1.7, 1, E.outQ(u)); c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.globalAlpha *= clamp(u * 3); TOP[TP[k]][1](c); c.restore(); });
      for (let k = 0; k < 4; k++) { const u = seg(t, CUT + k * 0.14, 0.18); if (u <= 0) continue; const a = (k * Math.PI) / 4; c.strokeStyle = 'rgba(110,60,25,0.55)'; c.lineWidth = 5; c.beginPath(); c.moveTo(-Math.cos(a) * R, -Math.sin(a) * R); c.lineTo(lerp(-Math.cos(a) * R, Math.cos(a) * R, u), lerp(-Math.sin(a) * R, Math.sin(a) * R, u)); c.stroke(); }
      c.restore();
    }
    return {
      dur: DUR, shakes: [[NM, 8]], elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = 1 - q, [pcx, pcy] = posOf(elP('pizza'), [CX, CY]);
          { const [tix, tiy] = posOf(elP('title'), [W / 2, 320]); head(TITLE, t, 0.1, tiy, { q, max: 100, x: tix }); }
          if (!VID.collecting) { const c = G(); c.globalAlpha = a * fa(t, 0, 0.4); c.translate(pcx, pcy);
            c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 60; c.shadowOffsetY = 26; c.fillStyle = '#8A5A2E'; c.fillRect(-55, R + 20, 110, 230); c.beginPath(); c.arc(0, 0, R + 50, 0, TAU); c.fill(); c.shadowBlur = 0; c.shadowOffsetY = 0;
            c.strokeStyle = 'rgba(60,35,15,0.25)'; c.lineWidth = 3; for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(-R - 50, k * 52); c.bezierCurveTo(-R / 2, k * 52 + 14, R / 2, k * 52 - 14, R + 50, k * 52); c.stroke(); }
            const pull = E.outC(seg(t, PULL, 0.7)), d = pull * 170, dx = Math.cos(Math.PI / 8) * d, dy = Math.sin(Math.PI / 8) * d;
            if (pull <= 0) pie(c, t);
            else { c.save(); c.beginPath(); c.rect(-R - 60, -R - 60, 2 * R + 120, 2 * R + 120); wedge(c, R + 8); c.clip('evenodd'); pie(c, t); c.restore();
              const str = 1 - seg(t, PULL + 0.45, 0.3); if (str > 0) { c.strokeStyle = 'rgba(247,230,166,' + str + ')'; c.lineCap = 'round'; for (let k = 0; k < 5; k++) { const a1 = k < 3 ? 0 : Math.PI / 4, rr = R * (0.3 + 0.15 * (k % 3)), x1 = Math.cos(a1) * rr, y1 = Math.sin(a1) * rr; c.lineWidth = lerp(8, 2, pull); c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo(x1 + dx / 2, y1 + dy / 2 + 26 * pull, x1 + dx, y1 + dy); c.stroke(); } }
              c.save(); c.translate(dx, dy); c.beginPath(); wedge(c, R + 8); c.clip(); pie(c, t); c.restore(); }
            const cu = seg(t, CUT, 0.75); if (cu > 0 && cu < 1) { const k = Math.min(3, Math.floor((t - CUT) / 0.14)), u = seg(t, CUT + k * 0.14, 0.18), an = (k * Math.PI) / 4, px = lerp(-Math.cos(an) * R, Math.cos(an) * R, u), py = lerp(-Math.sin(an) * R, Math.sin(an) * R, u);
              c.fillStyle = '#C9D0D8'; c.beginPath(); c.arc(px, py, 34, 0, TAU); c.fill(); c.strokeStyle = '#8F98A3'; c.lineWidth = 4; c.stroke(); c.strokeStyle = '#2B2F36'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(px, py); c.lineTo(px + 110, py - 110); c.stroke(); }
            D(); }
          const st = stage(t); if (st && t < NM) { const [stx, sty] = posOf(elP('stage'), [pcx, pcy + R + 110]); chip(st, stx, sty, { p: seg(t, t < CH ? SA : t < TO ? CH : TO + Math.floor((t - TO) / 0.35) * 0.35, 0.25), size: 32, bg: OR, col: onCol(OR), ls: 3 }); }
          { const [nmx, nmy] = posOf(elP('name'), [pcx, pcy + R + 140]); head(NAME, t, NM, nmy, { q, max: 96, x: nmx }); }
          if (PRICE) { const pp = E.outBack(seg(t, NM + 0.2, 0.5)) * a; if (pp > 0 && !VID.collecting) { const c = G(), RR = 115, [prx, pry] = posOf(elP('price'), [pcx + R - 10, pcy - R + 40]); c.translate(prx, pry); c.rotate((1 - pp) * 1.6 + 0.17); c.scale(pp, pp); c.fillStyle = OR; c.beginPath(); for (let i = 0; i < 36; i++) { const an = (i / 36) * TAU, rr = i % 2 ? RR * 0.88 : RR; c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } c.closePath(); c.fill();
            const sz = Math.min(76, fitSize(PRICE, 900, RR * 1.5, 76, 'Mont', -1)); setF(F(900, sz, 'Mont'), -1); c.fillStyle = onCol(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(PRICE, 0, 4); D(); } }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.05, 0.22, 0], ['thud', DO + 0.15, 0.35, 0], ['pour', SA, 0.22, 0], ['swish', CH, 0.2, -0.2]]; for (let k = 0; k < 8; k++) ev.push(['tick', CH + 0.05 * k, 0.1, (k % 2 ? 0.3 : -0.3)]);
        [0, 1, 2].forEach(k => ev.push(['pop', TO + k * 0.35, 0.22, k - 1], ['pop', TO + k * 0.35 + 0.12, 0.16, 1 - k])); for (let k = 0; k < 4; k++) ev.push(['swish', CUT + k * 0.14, 0.18, 0.2]);
        ev.push(['sizzle', TO + 1.1, 0.12, 0], ['swish', PULL, 0.22, 0.3], ['impact', NM, 0.38, 0], ['coin', NM + 0.25, 0.22, 0.3]); return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ HEAT METER
  const HEATC = ['#3FB950', '#C9D93B', '#F2A33A', '#E8532E', '#B3122E'];
  function heatx() {
    const TITLE = TX('title', 'How *hot* can you go?', { label: 'Headline', group: 'Words', max: 28, hint: 'Wrap a word in *stars* to colour it.' });
    const LV = +TX('level', '5', { label: 'Heat level', group: 'The salsa', options: opts([['1', '1 · mildest'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5 · hottest']]) });
    const LB = ['MILD', 'MEDIUM', 'HOT', 'EXTRA HOT', 'FUEGO'].map((d, i) => TX('l' + (i + 1), d, { label: 'Level ' + (i + 1) + ' name', group: 'Level names', upper: true, max: 12 }));
    const NAME = TX('name', IND === 'pizza' ? 'Hot *honey* drizzle' : IND === 'burgers' ? 'The *Inferno* Burger' : 'Salsa *Diabla*', { label: 'Name', group: 'The salsa', max: 28, hint: 'Wrap a word in *stars* to colour it.' });
    const END = TX('end', 'Bring a *glass of milk.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const CX = 540, CY = 900, R = 360, SW = 0.8, REACH = 2.3, CHT = 2.6, OUT = 6.4, DUR = OUT + 4.2, col = HEATC[LV - 1];
    function elements() {
      const tiP = posOf(elP('title'), [W / 2, 330]);
      const ggP = posOf(elP('gauge'), [CX, CY]);
      const lvP = posOf(elP('level'), [CX, CY + 150]);
      const chP = posOf(elP('chiles'), [CX, CY + 250]);
      const nmP = posOf(elP('name'), [CX, CY + 390]);
      return [
        { id: 'gauge', kind: 'box', label: 'Heat gauge', x: ggP[0], y: ggP[1], w: (R + 30) * 2, h: (R + 30) * 2, t0: 0.2, d: OUT - 0.2, box: [ggP[0] - (R + 30), ggP[1] - (R + 30), (R + 30) * 2, (R + 30) * 2], dup: false, del: false },
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.1, d: OUT - 0.1, box: [tiP[0] - 470, tiP[1] - 60, 940, 120], dup: false, del: false },
        { id: 'level', kind: 'pos', label: LB[LV - 1], x: lvP[0], y: lvP[1], t0: REACH + 0.1, d: OUT - (REACH + 0.1), box: [lvP[0] - 400, lvP[1] - 120, 800, 150], dup: false, del: false },
        { id: 'chiles', kind: 'pos', label: 'Chile row', x: chP[0], y: chP[1], t0: CHT, d: OUT - CHT, box: [chP[0] - 300, chP[1] - 60, 600, 120], dup: false, del: false },
        { id: 'name', kind: 'pos', label: NAME, x: nmP[0], y: nmP[1], t0: CHT + 0.4, d: OUT - (CHT + 0.4), box: [nmP[0] - 470, nmP[1] - 90, 940, 110], dup: false, del: false },
      ];
    }
    const angOf = v => Math.PI + (v / 5) * Math.PI, target = LV - 0.5;
    return {
      dur: DUR, shakes: [[REACH, 4 + LV * 3], [REACH + 0.5, LV * 1.5]], elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = 1 - q, hp = seg(t, REACH, 0.6), gk = E.outBack(seg(t, 0.2, 0.6)), [gx, gy] = posOf(elP('gauge'), [CX, CY]);
          if (!VID.collecting && hp > 0) { const c = G(), g = c.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75); g.addColorStop(0, rgbaOf(col, 0)); g.addColorStop(1, rgbaOf(col, 0.12 * LV * hp * a)); c.fillStyle = g; c.fillRect(0, 0, W, H); D(); }
          { const [tix, tiy] = posOf(elP('title'), [W / 2, 330]); head(TITLE, t, 0.1, tiy, { q, max: 96, x: tix }); }
          if (!VID.collecting && gk > 0) { const c = G(); c.globalAlpha = a * clamp(gk * 2); c.translate(gx, gy); c.scale(0.6 + 0.4 * gk, 0.6 + 0.4 * gk);
            c.fillStyle = mix(DEEP1, '#000000', 0.3); c.beginPath(); c.arc(0, 0, R + 30, Math.PI, TAU); c.lineTo(R + 30, 30); c.lineTo(-R - 30, 30); c.closePath(); c.fill();
            for (let i = 0; i < 5; i++) { const a0 = angOf(i) + 0.03, a1 = angOf(i + 1) - 0.03, lit = i < LV ? seg(t, SW + (i / LV) * (REACH - SW), 0.2) : 0; c.strokeStyle = mix(mix(HEATC[i], '#2A2A2A', 0.55), HEATC[i], lit); c.lineWidth = 64; c.beginPath(); c.arc(0, 0, R - 40, a0, a1); c.stroke();
              const mid = (a0 + a1) / 2; c.save(); c.translate(Math.cos(mid) * (R - 40), Math.sin(mid) * (R - 40)); c.rotate(mid + Math.PI / 2); c.scale(0.4, 0.4); c.fillStyle = 'rgba(255,255,255,' + (0.35 + 0.65 * lit) + ')'; c.fill(CHILE); c.restore();
              setF(F(700, 22, 'Mono'), 2); c.fillStyle = WA(0.45 + 0.55 * lit); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(LB[i], Math.cos(mid) * (R + 64), Math.sin(mid) * (R + 64)); }
            const sw = seg(t, SW, REACH - SW), v = sw <= 0 ? 0 : target * (sw < 1 ? E.outBack(sw) : 1) + (t > REACH && LV >= 4 ? Math.sin(t * 60) * 0.04 : 0), an = angOf(clamp(v, 0, 5));
            c.strokeStyle = WHT; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-Math.cos(an) * 40, -Math.sin(an) * 40); c.lineTo(Math.cos(an) * (R - 95), Math.sin(an) * (R - 95)); c.stroke(); c.fillStyle = OR; c.beginPath(); c.arc(0, 0, 40, 0, TAU); c.fill(); c.fillStyle = WHT; c.beginPath(); c.arc(0, 0, 14, 0, TAU); c.fill();
            if (hp > 0) { c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8 + LV * 6; i++) { const per = 1.2 + hash(i) * 0.8, u = ((t - REACH) / per + hash(i * 3)) % 1, x = (hash(i * 5) - 0.5) * R * 1.6, y = -R * 0.4 - u * 520; c.globalAlpha = a * hp * (1 - u) * 0.9; c.drawImage(K7.spark(HEATC[Math.min(4, 2 + (i % 3))]), x - 14, y - 14, 28, 28); }
              c.globalCompositeOperation = 'source-over'; c.strokeStyle = 'rgba(255,190,140,' + 0.05 * LV * hp * a + ')'; c.lineWidth = 4; for (let k = -2; k <= 2; k++) { c.beginPath(); for (let y = 0; y < 300; y += 10) { c.lineTo(k * 120 + Math.sin(y * 0.04 - t * 6 + k) * 16, -R - 60 - y); } c.stroke(); } }
            D(); }
          const lp = seg(t, REACH + 0.1, 0.35); if (lp > 0 && !VID.collecting) { const c = G(), s = lerp(2, 1, E.outBack(lp)), str = LB[LV - 1], f = F(900, Math.min(140, fitSize(str, 900, 860, 140, 'Mont', -3)), 'Mont'), [lvx, lvy] = posOf(elP('level'), [gx, gy + 150]); c.globalAlpha = clamp(lp * 4) * a; c.translate(lvx, lvy); c.scale(s, s); setF(f, -3); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.shadowColor = col; c.shadowBlur = 40; c.fillStyle = col; c.fillText(str, 0, 0); D(); }
          if (!VID.collecting) for (let i = 0; i < 5; i++) { const u = E.outBack(seg(t, CHT + i * 0.1, 0.3)); if (u <= 0) continue; const c = G(), [chx, chy] = posOf(elP('chiles'), [gx, gy + 250]); c.globalAlpha = a * clamp(u * 2); c.translate(chx + (i - 2) * 120, chy); c.scale(0.85 * u, 0.85 * u); c.rotate(-0.4); c.fillStyle = i < LV ? HEATC[i] : 'rgba(255,255,255,0.15)'; c.fill(CHILE); c.strokeStyle = '#3E8E3A'; c.lineWidth = 7; c.lineCap = 'round'; c.stroke(STEM); D(); }
          { const [nmx, nmy] = posOf(elP('name'), [gx, gy + 390]); head(NAME, t, CHT + 0.4, nmy, { q, max: 84, x: nmx }); }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.05, 0.22, 0], ['switch', 0.3, 0.25, 0], ['riser', SW, 0.2, 0], ['ticks', SW, 0.16, 0, { dur: REACH - SW, n: 12 }], ['impact', REACH, 0.42, 0], ['boom', REACH + 0.05, 0.28, 0], ['sizzle', REACH + 0.2, 0.25, 0], ['burn', REACH + 0.1, 0.18, 0]];
        for (let i = 0; i < 5; i++) ev.push(['pop', CHT + i * 0.1, 0.2, (i - 2) * 0.2]); ev.push(['swish', CHT + 0.4, 0.2, 0]); return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ FIESTA BANNER (papel picado)
  const PICADO = ['#E63946', '#F4A261', '#E9C46A', '#2A9D8F', '#3A86FF', '#8338EC', '#FF006E'];
  const FLAGS = new Map();
  function flag(col, k) {   // a tissue-paper flag with cut-outs (true holes), made once per colour and pattern
    const key = col + k; if (FLAGS.has(key)) return FLAGS.get(key); const w = 124, h = 164, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    g.fillStyle = col; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h - 18); for (let i = 0, x = w; x >= -0.1; i++, x -= 7.75) g.lineTo(x, i % 2 ? h : h - 18); g.lineTo(0, h - 18); g.closePath(); g.fill();
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; const cx = w / 2, cy = 76;
    if (k % 3 === 0) { g.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; g.moveTo(cx, cy); g.ellipse(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20, 11, 5, a, 0, TAU); } g.fill(); }
    else if (k % 3 === 1) { g.beginPath(); g.moveTo(cx, cy - 34); g.lineTo(cx + 26, cy); g.lineTo(cx, cy + 34); g.lineTo(cx - 26, cy); g.closePath(); g.fill(); }
    else { g.beginPath(); g.arc(cx, cy - 10, 18, Math.PI, TAU); g.arc(cx, cy + 10, 18, 0, Math.PI); g.fill(); }
    [[16, 22], [w - 16, 22], [16, h - 46], [w - 16, h - 46]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 6, 0, TAU); g.fill(); });
    for (let x = 14; x < w - 10; x += 16) { g.beginPath(); g.arc(x, h - 30, 3, 0, TAU); g.fill(); }
    FLAGS.set(key, c); return c;
  }
  const PAPEL = { mexican: ['¡*Fiesta* Friday!', 'Mariachi  ·  Margaritas  ·  Tacos', 'FRIDAY · 7 PM'], tacos: ['¡*Taco* Fiesta!', 'Tacos  ·  Aguas frescas  ·  Music', 'TUESDAY · ALL DAY'], restaurant: ['¡*Fiesta* night!', 'Live music  ·  Specials  ·  Family', 'FRIDAY · 7 PM'],
    events: ['*Fiesta* night', 'Live music  ·  Food  ·  Dancing', 'SATURDAY · 8 PM'], general: ['¡*Fiesta* time!', 'Music  ·  Food  ·  Fun', 'SATURDAY · 6 PM'] };
  function papelx() {
    const Pd = pick(PAPEL);
    const TITLE = TX('title', Pd[0], { label: 'Headline', group: 'Words', max: 24, hint: 'Wrap a word in *stars* to colour it.' });
    const LINE = off(TX('line', Pd[1], { label: 'Line under it', group: 'Words', max: 40, hint: DASH })), WHEN = off(TX('when', Pd[2], { label: 'When', group: 'Words', upper: true, max: 24, hint: DASH }));
    const END = TX('end', '¡*Nos vemos!*', { label: 'Closing line', group: 'Ending', max: 30 });
    const S = shot('photo', 'Your photo or clip', 6.6), DR = [0.2, 0.45], PH = 0.9, TT = 1.4, LN = 1.8, WN = 2.1, OUT = 6.4, DUR = OUT + 4.2, BOX0 = [170, 640, 740, 450];
    const BOX = (EL && EL.box) ? [elNum(EL.box.x, BOX0[0]), elNum(EL.box.y, BOX0[1]), elNum(EL.box.w, BOX0[2]), elNum(EL.box.h, BOX0[3])] : BOX0;
    function elements() {
      const b1P = posOf(elP('banner1'), [W / 2, 270]);
      const b2P = posOf(elP('banner2'), [W / 2, 420]);
      const tiP = posOf(elP('title'), [W / 2, 1210]);
      const lnP = posOf(elP('line'), [W / 2, 1275]);
      const wnP = posOf(elP('when'), [W / 2, 1350]);
      const els = [
        { id: 'photo', kind: 'box', label: 'Photo', x: BOX[0], y: BOX[1], w: BOX[2], h: BOX[3], t0: PH, d: OUT - PH, box: [BOX[0], BOX[1], BOX[2], BOX[3]], dup: false, del: false },
        { id: 'banner1', kind: 'pos', label: 'Banner string 1', x: b1P[0], y: b1P[1], t0: DR[0], d: OUT - DR[0], box: [b1P[0] - 500, b1P[1] - 90, 1000, 180], dup: false, del: false },
        { id: 'banner2', kind: 'pos', label: 'Banner string 2', x: b2P[0], y: b2P[1], t0: DR[1], d: OUT - DR[1], box: [b2P[0] - 500, b2P[1] - 90, 1000, 180], dup: false, del: false },
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: TT, d: OUT - TT, box: [tiP[0] - 470, tiP[1] - 100, 940, 130], dup: false, del: false },
      ];
      if (LINE) els.push({ id: 'line', kind: 'pos', label: LINE, x: lnP[0], y: lnP[1], t0: LN, d: OUT - LN, box: [lnP[0] - 450, lnP[1] - 40, 900, 70], dup: false, del: false });
      if (WHEN) els.push({ id: 'when', kind: 'pos', label: WHEN, x: wnP[0], y: wnP[1], t0: WN, d: OUT - WN, box: [wnP[0] - 350, wnP[1] - 35, 700, 70], dup: false, del: false });
      return els;
    }
    const conf = Array.from({ length: 70 }, (_, i) => [hash(i * 3.1) * W, -60 - hash(i * 5.3) * 500, 180 + hash(i * 7.1) * 260, hash(i * 2.3) * TAU, PICADO[i % 7]]);
    return {
      dur: DUR, shakes: [[PH + 0.35, 6]], elements,
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = 1 - q;
          // the photo, tossed in like a print
          const pk = E.outBack(seg(t, PH, 0.6)), rot = lerp(-0.35, -0.04, E.outC(seg(t, PH, 0.6))), dy = (1 - E.outC(seg(t, PH, 0.6))) * 900, r = K3.wholeIn(S.c, BOX), cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2;
          if (t >= PH) { if (!VID.collecting) { const c = G(); c.globalAlpha = a; c.translate(cx, cy + dy); c.rotate(rot); c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 50; c.shadowOffsetY = 20; c.fillStyle = '#FFFDF7'; c.fillRect(-r[2] / 2 - 18, -r[3] / 2 - 18, r[2] + 36, r[3] + 36); D(); }
            ph(S, t, BOX, { alpha: a, rot, dy, s: 0.98 + 0.02 * pk }); }
          // two strings of papel picado drop in and swing
          if (!VID.collecting) [[270, 0, DR[0]], [420, 62, DR[1]]].forEach(([y, ox, t0], bi) => { const [, byy] = posOf(elP('banner' + (bi + 1)), [W / 2, y]); const u = E.outBack(seg(t, t0, 0.6)), yy = lerp(-260, byy, u), lt = t - t0, c = G(); c.globalAlpha = a;
            c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 3; c.beginPath(); for (let x = -40; x <= W + 40; x += 20) c.lineTo(x, yy + 26 * Math.sin((x / W) * Math.PI)); c.stroke();
            for (let i = 0; i < 9; i++) { const x = -40 + ox + i * 136, sy = yy + 26 * Math.sin(((x + 62) / W) * Math.PI), sw = (Math.sin(lt * 3 + i * 1.3) * 0.18 * Math.exp(-Math.max(0, lt) * 0.9) + Math.sin(t * 1.6 + i) * 0.03);
              c.save(); c.translate(x + 62, sy); c.rotate(sw); c.drawImage(flag(PICADO[(i + (ox ? 3 : 0)) % 7], i + (ox ? 1 : 0)), -62, 0); c.restore(); } D(); });
          if (!VID.collecting && t > TT) { const c = G(); conf.forEach(([x, y0, sp, r0, col], i) => { const lt = t - TT, y = y0 + lt * sp, rr = r0 + lt * (3 + (i % 4)); if (y > H + 40) return; c.save(); c.globalAlpha = a; c.translate(x + Math.sin(lt * 2 + i) * 30, y); c.rotate(rr); c.fillStyle = col; c.fillRect(-9, -5, 18, 10); c.restore(); }); D(); }
          { const [tix, tiy] = posOf(elP('title'), [W / 2, 1210]); head(TITLE, t, TT, tiy, { q, max: 110, x: tix }); }
          if (LINE) { const [lnx, lny] = posOf(elP('line'), [W / 2, 1275]); K7.txt(LINE, lnx, lny, F(700, Math.min(34, fitSize(LINE, 700, 900, 34, 'Mont')), 'Mont'), WA(0.85), { align: 'center', a: fa(t, LN, 0.4) * a }); }
          if (WHEN) { const [wnx, wny] = posOf(elP('when'), [W / 2, 1350]); chip(WHEN, wnx, wny, { p: seg(t, WN, 0.4) * a, size: 32, bg: OR, col: onCol(OR), ls: 3 }); }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['paper', DR[0] + 0.2, 0.3, -0.3], ['paper', DR[1] + 0.2, 0.3, 0.3], ['whoosh', PH, 0.3, 0], ['thud', PH + 0.35, 0.3, 0], ['pop', TT, 0.3, 0], ['sparkle', TT + 0.05, 0.25, 0], ['swish', LN, 0.18, 0], ['pop', WN, 0.28, 0.2]]; return ret(DUR, ev, OUT); },
    };
  }

  // ================================================================ RECIPE CARD
  const RECIPE = {
    italian: ['Nonna’s Lasagna', 'Fresh pasta sheets\nSlow-simmered ragù\nRicotta & mozzarella\nParmigiano\nFresh basil'], mexican: ['Mole Poblano', 'Ancho & pasilla chiles\nMexican chocolate\nToasted sesame\nAlmonds & spices\nSlow-cooked chicken'],
    tacos: ['Al Pastor', 'Guajillo chiles\nAchiote\nPineapple\nOnion & cilantro\nCorn tortillas'], pizza: ['Our Dough', 'Flour\nWater\nSea salt\nYeast\nPatience'], burgers: ['The House Sauce', 'Mayo\nKetchup\nChopped pickles\nMustard\nOur spice mix'],
    sandwiches: ['The Italian Sub', 'Fresh roll\nCapicola\nSalami\nProvolone\nOil & vinegar'], restaurant: ['House Favorite', 'Fresh ingredients\nOur house sauce\nFresh herbs\nMade to order'], general: ['House Recipe', 'Ingredient one\nIngredient two\nIngredient three\nIngredient four'],
  };
  function recipex() {
    const Rd = pick(RECIPE);
    const FONT = TX('font', 'caveat', { label: 'Handwriting', group: 'Style', options: opts([['caveat', 'Handwriting'], ['kalam', 'Casual handwriting'], ['dancing', 'Script'], ['marker', 'Marker'], ['pacifico', 'Retro script']]) });
    const TITLE = TX('title', Rd[0], { label: 'Recipe name', group: 'The card', max: 24 });
    const FROM = off(TX('from', 'FROM THE KITCHEN OF ' + (BRAND.short || BRAND.name || '').toUpperCase(), { label: 'Line at the top', group: 'The card', upper: true, max: 40, hint: DASH }));
    const ING = lines(TX('items', Rd[1], { label: 'Ingredients (one per line)', group: 'The card', multiline: true, max: 160, hint: 'Up to 6 lines.' })).slice(0, 6);
    const NOTE = off(TX('note', 'Ask for it tonight.', { label: 'Note at the bottom', group: 'The card', max: 30, hint: DASH }));
    const STAMP = off(TX('stamp', 'HOUSE RECIPE', { label: 'Stamp', group: 'The card', upper: true, max: 16, hint: DASH }));
    const END = TX('end', 'Made *the way we like it.*', { label: 'Closing line', group: 'Ending', max: 30 });
    const S = shot('photo', 'Photo of the dish', 7), fam = fontOf(FONT), wt = wtOf(FONT), SC = { caveat: 1.15, kalam: 0.95, dancing: 1.05, marker: 0.85, pacifico: 0.82 }[FONT] || 1;
    const CR0 = [100, 700, 880, 590];
    const CR = (EL && EL.box) ? [elNum(EL.box.x, CR0[0]), elNum(EL.box.y, CR0[1]), elNum(EL.box.w, CR0[2]), elNum(EL.box.h, CR0[3])] : CR0;
    const n = Math.max(1, ING.length), STEP = Math.min(0.42, 2.0 / n), at = i => 2.0 + i * STEP, ST = 4.6, OUT = 6.8, DUR = OUT + 4.2, PB = [330, 285, 420, 330], INK = '#22304F';
    function elements() {
      const frP = posOf(elP('from'), [CR[0] + 100, CR[1] + 42]);
      const tiP = posOf(elP('title'), [CR[0] + 100, CR[1] + 112]);
      const phP = posOf(elP('photo'), [PB[0], PB[1]]);
      const ntP = posOf(elP('note'), [CR[0] + 100, CR[1] + CR[3] - 30]);
      const smP = posOf(elP('stamp'), [CR[0] + CR[2] - 150, CR[1] + CR[3] - 130]);
      const els = [
        { id: 'card', kind: 'box', label: 'Recipe card', x: CR[0], y: CR[1], w: CR[2], h: CR[3], t0: 0.1, d: OUT - 0.1, box: [CR[0], CR[1], CR[2], CR[3]], dup: false, del: false },
        { id: 'photo', kind: 'box', label: 'Dish photo', x: phP[0], y: phP[1], w: PB[2], h: PB[3], t0: 0.6, d: OUT - 0.6, box: [phP[0], phP[1], PB[2], PB[3]], dup: false, del: false },
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 1.1, d: OUT - 1.1, box: [tiP[0] - 10, tiP[1] - 80, 700, 100], dup: false, del: false },
      ];
      if (FROM) els.push({ id: 'from', kind: 'pos', label: FROM, x: frP[0], y: frP[1], t0: 0.1, d: OUT - 0.1, box: [frP[0] - 10, frP[1] - 25, 700, 40], dup: false, del: false });
      ING.forEach((s, i) => { const ip = posOf(elP('item' + (i + 1)), [CR[0] + 100, CR[1] + 168 + i * 60]); els.push({ id: 'item' + (i + 1), kind: 'pos', label: s, x: ip[0], y: ip[1], t0: at(i), d: OUT - at(i), box: [ip[0] - 70, ip[1] - 50, 600, 70], dup: false, del: false }); });
      if (NOTE) els.push({ id: 'note', kind: 'pos', label: NOTE, x: ntP[0], y: ntP[1], t0: ST - 0.5, d: OUT - (ST - 0.5), box: [ntP[0] - 10, ntP[1] - 45, 600, 60], dup: false, del: false });
      if (STAMP) els.push({ id: 'stamp', kind: 'pos', label: STAMP, x: smP[0], y: smP[1], t0: ST, d: OUT - ST, box: [smP[0] - 110, smP[1] - 110, 220, 220], dup: false, del: false });
      return els;
    }
    return {
      dur: DUR, shakes: [[ST, 8]], elements,
      preload: async () => { await K3.init(); if (window.NX && NX.useFont) await NX.useFont(FONT); },
      render(t) {
        bg();
        if (t < OUT) {
          const q = seg(t, OUT - 0.35, 0.35), a = fa(t, 0.1, 0.5) * (1 - q), oy = (1 - E.outC(seg(t, 0.1, 0.6))) * 500;
          if (!VID.collecting) { const c = G(); c.globalAlpha = a; c.translate(0, oy); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 50; c.shadowOffsetY = 20; c.fillStyle = '#FBF6EA'; c.fillRect(CR[0], CR[1], CR[2], CR[3]); c.shadowBlur = 0; c.shadowOffsetY = 0;
            c.strokeStyle = '#9BC1E6'; c.lineWidth = 2; for (let y = CR[1] + 175; y < CR[1] + CR[3] - 20; y += 60) { c.beginPath(); c.moveTo(CR[0], y); c.lineTo(CR[0] + CR[2], y); c.stroke(); }
            c.strokeStyle = '#E57373'; c.lineWidth = 3; c.beginPath(); c.moveTo(CR[0], CR[1] + 130); c.lineTo(CR[0] + CR[2], CR[1] + 130); c.moveTo(CR[0] + 80, CR[1]); c.lineTo(CR[0] + 80, CR[1] + CR[3]); c.stroke();
            if (FROM) { const [frx, fry] = posOf(elP('from'), [CR[0] + 100, CR[1] + 42]); setF(F(700, Math.min(20, fitSize(FROM, 700, CR[2] - 140, 20, 'Mono', 3)), 'Mono'), 3); c.fillStyle = '#8A7F6E'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText(FROM, frx, fry); }
            D(); }
          const ts = Math.min(76 * SC, fitSize(TITLE, wt, CR[2] - 140, 76 * SC, fam)), [tix, tiy] = posOf(elP('title'), [CR[0] + 100, CR[1] + 112 + oy]); hand(TITLE, tix, tiy, F(wt, ts, fam), INK, E.inOutC(seg(t, 1.1, 0.7)), 'left');
          const is = Math.min(46 * SC, fitSize(ING.reduce((m, s) => (s.length > m.length ? s : m), ''), wt, CR[2] - 330, 46 * SC, fam));
          ING.forEach((s, i) => { const y = CR[1] + 168 + i * 60 + oy, [itx, ity] = posOf(elP('item' + (i + 1)), [CR[0] + 100, y]), p = E.inOutC(seg(t, at(i), 0.4)); if (p > 0 && !VID.collecting) { const c = G(); c.globalAlpha = a * clamp(p * 3); c.strokeStyle = INK; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(itx - 56, ity - 14); c.lineTo(itx - 46, ity - 4); c.lineTo(itx - 30, ity - 26); c.stroke(); D(); } hand(s, itx, ity, F(wt, is, fam), INK, p, 'left'); });
          if (NOTE) { const [ntx, nty] = posOf(elP('note'), [CR[0] + 100, CR[1] + CR[3] - 30 + oy]); hand(NOTE, ntx, nty, F(wt, Math.min(40 * SC, fitSize(NOTE, wt, CR[2] - 380, 40 * SC, fam)), fam), '#B03A2E', E.inOutC(seg(t, ST - 0.5, 0.5)), 'left'); }
          // the photo, taped on
          const pk = E.outC(seg(t, 0.6, 0.55)), rot = lerp(-0.4, -0.05, pk), pdy = (1 - pk) * -600, [pbx, pby] = posOf(elP('photo'), [PB[0], PB[1]]), PB2 = [pbx, pby, PB[2], PB[3]], pr = K3.wholeIn(S.c, PB2), pcx = pr[0] + pr[2] / 2, pcy = pr[1] + pr[3] / 2;
          if (pk > 0) { if (!VID.collecting) { const c = G(); c.globalAlpha = a; c.translate(pcx, pcy + pdy); c.rotate(rot); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40; c.shadowOffsetY = 16; c.fillStyle = '#FFFFFF'; c.fillRect(-pr[2] / 2 - 18, -pr[3] / 2 - 18, pr[2] + 36, pr[3] + 70); D(); }
            ph(S, t, PB2, { alpha: a, rot, dy: pdy });
            const tp = seg(t, 1.0, 0.25); if (tp > 0 && !VID.collecting) { const c = G(); c.globalAlpha = a * tp * 0.85; c.translate(pcx, pcy + pdy); c.rotate(rot); [[-pr[2] / 2, -pr[3] / 2 - 10, -0.6], [pr[2] / 2, -pr[3] / 2 - 10, 0.6]].forEach(([x, y, r]) => { c.save(); c.translate(x, y); c.rotate(r); c.fillStyle = '#EADFC4'; c.fillRect(-60, -18, 120, 36); c.restore(); }); D(); } }
          const sp = seg(t, ST, 0.35); if (STAMP && sp > 0 && !VID.collecting) { const c = G(), s = lerp(2.4, 1, E.outQ(sp)), wds = STAMP.split(' '), l2 = wds.length > 1 ? [wds.slice(0, Math.ceil(wds.length / 2)).join(' '), wds.slice(Math.ceil(wds.length / 2)).join(' ')] : [STAMP];
            c.globalAlpha = clamp(sp * 4) * 0.85 * (1 - q); const [smx, smy] = posOf(elP('stamp'), [CR[0] + CR[2] - 150, CR[1] + CR[3] - 130 + oy]); c.translate(smx, smy); c.rotate(-0.25); c.scale(s, s); c.strokeStyle = '#C0392B'; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, 105, 0, TAU); c.stroke(); c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 90, 0, TAU); c.stroke();
            c.fillStyle = '#C0392B'; c.textAlign = 'center'; c.textBaseline = 'middle'; const sz = Math.min(34, ...l2.map(w => fitSize(w, 900, 150, 34, 'Mont', 2))); setF(F(900, sz, 'Mont'), 2); l2.forEach((w, i) => c.fillText(w, 0, (i - (l2.length - 1) / 2) * sz * 1.1)); setF(F(900, 18, 'Mont'), 0); c.fillText('★  ★  ★', 0, l2.length > 1 ? 58 : 40); D(); }
        }
        if (t >= OUT) close(t, OUT, { y: 620, line: END });
      },
      cues() { const ev = [['whoosh', 0.1, 0.25, 0], ['paper', 0.3, 0.25, 0], ['whoosh', 0.6, 0.22, 0.2], ['paper', 1.0, 0.2, 0.3], ['pencil', 1.1, 0.3, -0.1], ['pencil', 1.45, 0.25, 0.1]]; for (let i = 0; i < 5; i++) ev.push(['pencil', 2.0 + i * 0.4, 0.24, ((i % 3) - 1) * 0.2]);
        ev.push(['pencil', ST - 0.5, 0.2, 0], ['stamp', ST, 0.5, 0.2], ['thud', ST + 0.02, 0.22, 0]); return ret(DUR, ev, OUT); },
    };
  }

  const MAKE = { stainx, nightx, checkx, plansx, vanx, pizzax, heatx, papelx, recipex };
  const PP = (MAKE[V] || stainx)();
  DIR = { dur: PP.dur, bg: BLK, bgSwap: true, finish: { vig: 0.2, grain: 0.12 }, edl: [], shakes: PP.shakes, preload: PP.preload || (() => K3.init()), render: PP.render, cues: PP.cues, fam: V,
    ...(PP.elements ? { elements: PP.elements } : {}),
    setup() { if (!window.STUDIO && LIGHTPAL) { const w = IMG.logoW; IMG.logoW = IMG.logoB; IMG.logoB = w; } } };
});
