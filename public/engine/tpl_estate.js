'use strict';
/* Real estate campaigns (Oct 29). Every template reads the same property profile (PROP, kit7 K7.PROFILE) and the listing's
   photos in order, so one listing produces a whole campaign. Facts are never invented: an optional fact that is empty is
   left out and the layout closes up; a required one that is empty shows a clear "+ ADD …" marker and the export check lists
   it. Photos are always shown whole (never cropped to fill the vertical frame). A plain engine render uses a sample listing
   and library footage for previews only.
   ?v=sig     The Signature Listing   magazine cover, page turns, back page with the price
   ?v=listed  Just Listed             slam title, price odometer, facts with icons, photo carousel
   ?v=open    Open House              doors open on the hero, a calendar tile, a filmstrip, RSVP
   ?v=drop    The Price Drop          the old price struck and dropped, the new price lands, split screen
   ?v=sold    Sold Stories            a yard sign swings in, the SOLD rider snaps on, the agent close
   ?v=hood    The Neighborhood Edit   a drawn street grid with pins for places you name, editorial chapters
   ?v=tour    Room by Room            doorway transitions room to room, labels and a progress rail
   ?v=agent   Meet Your Agent         portrait, name, what you do, an optional stat, a contact card */
STUDIO_REG['estate'] = (() => {
  const V = QS.get('v') || 'sig';
  const FM = K7.FAM[V] || K7.FAM.sig;
  if (!window.STUDIO) setBrandColors(FM.pal);
  if (!window.STUDIO && !PRM.prop) PRM.prop = Object.assign({}, K7.DEMO);
  const G = K3.G, D = K3.D, up = K7.up, nz = K7.nz, seg = K7.seg, mix = K7.mix;
  const DSP = 'Bebas', SANS = 'Mont', SER = 'Corm', SCR = 'Hand', TAU = Math.PI * 2;
  const NONE = k => ['nofoot.' + k, 0];
  const DEMO_PH = [['c02', 9.0], ['c11', 15.0], ['c12', 8.5], ['c08', 6.0], ['c05', 4.1], ['c10', 4.0], ['c07', 12.05]];
  const PH = ((typeof PRM !== 'undefined' && PRM.photos) || []).filter(Boolean);
  const isPh = c => /^(ph[lv]:|nofoot\.)/.test(c);
  // listing photos fill the photo slots in order (each clip can still swap any slot)
  function photos(labels, ds) {
    return labels.map((lab, k) => {
      const def = PH[k] ? [PH[k], 0] : window.STUDIO ? NONE('s' + (k + 1)) : DEMO_PH[k % DEMO_PH.length], d = Array.isArray(ds) ? ds[k] : ds;
      const s = SHOT('s' + (k + 1), def, { label: lab, group: 'Photos', kind: 'any', d: d + 0.3, hint: k === 0 ? 'Your listing photos fill these in order. Change any one here.' : undefined });
      return { c: s[0], in: s[1], d, start: 0 };
    });
  }
  const fact = (k, req) => PROP(k, { label: K7.profileLabel(k), req: !!req, group: 'Listing', multiline: k === 'feat' });
  const vert = s => K7.isVert(s.c);
  const topIn = (c, box) => { const r = K3.wholeIn(c, box); return [r[0], box[1], r[2], r[3]]; };   // whole, top-aligned in box
  const musicBed = (dur, o) => ['music', 0, dur, 0.95, Object.assign({ style: FM.music, bpm: FM.bpm, key: 0, end: dur - 0.6 }, o || {})];
  function shade(y0, y1, a0, a1, col) { if (VID.collecting) return; const c = G(), g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, rgbaOf(col || BLK, a0)); g.addColorStop(1, rgbaOf(col || BLK, a1)); c.fillStyle = g; c.fillRect(-20, y0, W + 40, y1 - y0); D(); }
  const fill = (r, col, a) => { if (VID.collecting) return; const c = G(); if (a !== undefined) c.globalAlpha = a; c.fillStyle = col; c.fillRect(r[0], r[1], r[2], r[3]); D(); };
  const fade = (str, x, y, f, col, p, o) => { if (p <= 0 || !str) return; o = o || {}; K7.txt(str, x, y + (1 - E.outC(clamp(p))) * (o.rise === undefined ? 20 : o.rise), f, col, Object.assign({}, o, { a: E.outC(clamp(p)) * (o.a === undefined ? 1 : o.a) })); };
  const ctaSize = (s, w, max, fam, ls) => Math.min(max, fitSize(s, w, 840, max, fam, ls));
  // a row of facts with line icons, centred on cx (only the facts that were given)
  function factRow(list, cx, y, size, col, p, o) {
    if (VID.collecting || !list.length || p <= 0) return; o = o || {}; const ic = { beds: 'bed', baths: 'bath', sqft: 'area', lot: 'lot' }, f = F(o.w || 700, size, o.fam || SANS), gap = size * 1.4;
    const parts = list.map(x => ({ x, s: x.n + (x.u ? ' ' + x.u : ''), w: size * 1.3 + textW(x.n + (x.u ? ' ' + x.u : ''), f, o.ls || 1) }));
    const tot = parts.reduce((a, b) => a + b.w, 0) + gap * (parts.length - 1); let x = o.align === 'left' ? cx : cx - tot / 2;
    parts.forEach((pt, i) => {
      const a = E.outC(clamp(p * 1.6 - i * 0.2)) * (o.a === undefined ? 1 : o.a); if (a <= 0) { x += pt.w + gap; return; }
      if (ic[pt.x.k]) K7.icon(ic[pt.x.k], x + size * 0.5, y - size * 0.35, size * 1.05, o.icol || col, { a, lw: 1.8 });
      K7.txt(pt.s, x + size * 1.3, y, f, col, { a, ls: o.ls || 1 });
      if (i < parts.length - 1) fill([x + pt.w + gap / 2 - 1, y - size * 0.95, 2, size * 1.2], o.rule || rgbaOf(col.length === 7 ? col : '#FFFFFF', 0.35), a);
      x += pt.w + gap;
    });
  }
  // the price, or a fill-in marker when it is required and missing
  const priceOr = (s, deal) => K7.money(s, deal);

  // ================================================================ THE SIGNATURE LISTING
  // A magazine: a masthead wiped on, the cover photo opened like an architectural shutter, cover lines, two spreads turned
  // like pages, a back page with the price and the agent. Deliberate, slow, light.
  function sig() {
    const ADDR = fact('addr', true), AREA = fact('area'), PRICE = fact('price'), DEAL = fact('deal');
    const FT = K7.facts({ beds: fact('beds'), baths: fact('baths'), sqft: fact('sqft') }), FEAT = K7.lines(fact('feat')), BLURB = fact('blurb'), AG = fact('agent'), AGT = fact('agent_title'), AGP = fact('agent_phone'), URL = fact('url');
    const MAST = TX('mast', up(BRAND.short || BRAND.name), { label: 'Masthead', group: 'Cover', upper: true, max: 16 });
    const KICK = TX('kick', 'FEATURED PROPERTY', { label: 'Cover line', group: 'Cover', upper: true, max: 26 });
    const OFFER = TX('offer', 'Offered at', { label: 'Line above the price', group: 'Back page', max: 20 });
    const END = TX('end', 'SCHEDULE A PRIVATE TOUR', { label: 'Call to action', group: 'Back page', upper: true, max: 30 });
    const S = photos(['Cover photo', 'Spread 1 · large', 'Spread 1 · small', 'Spread 2 · large', 'Spread 2 · small'], [4.6, 4.0, 3.6, 4.0, 3.6]);
    const TA = 4.2, TB = 8.2, TC = 12.2, TD = 0.7, DUR = 16.8;
    S[0].start = 0; S[1].start = S[2].start = TA - 0.1; S[3].start = S[4].start = TB - 0.1;
    let MM = null; const m = () => MM || (MM = { ms: Math.min(200, fitSize(MAST, 700, 936, 200, SER, 14)), al: K7.fitLines(ADDR, 500, SER, 520, 70, 3, { style: 'italic' }) });
    function paper() { if (BACKDROP() || VID.collecting) return; const c = G(), g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, DEEP2); g.addColorStop(1, DEEP1); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); }
    function aperture(s, t, r, t0) { const u = E.inOutC(seg(t, t0, 1.2)); if (u <= 0 && !VID.collecting) return; ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.rect(r[0], r[1] + r[3] / 2 * (1 - u), r[2], r[3] * u); ctx.clip(); } K7.photo(s, t, r); ctx.restore(); if (!VID.collecting && u > 0 && u < 1) { const c = G(); c.fillStyle = OR; c.fillRect(r[0], r[1] + r[3] / 2 * (1 - u) - 1, r[2], 2); c.fillRect(r[0], r[1] + r[3] / 2 * (1 + u) - 1, r[2], 2); D(); } }
    function cover(t) {
      paper(); const { ms, al } = m();
      if (!VID.collecting) { const p = E.inOutC(seg(t, 0.15, 0.9)), c = G(); c.beginPath(); c.rect(0, 0, 72 + 936 * p, 360); c.clip(); setF(F(700, ms, SER), 14); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(MAST, W / 2 + 7, 300); D();
        rule(72, 330, 936, seg(t, 0.6, 0.8), { col: WHT, from: 'l', h: 2 }); rule(72, 338, 936, seg(t, 0.7, 0.8), { col: WHT, from: 'l', h: 1 });
        fade(KICK, 72, 386, F(600, 22, SANS), WHT, seg(t, 0.9, 0.6), { ls: 5 }); if (AREA) fade(up(AREA), 1008, 386, F(600, 22, SANS), WA(0.6), seg(t, 1.0, 0.6), { ls: 5, align: 'right' }); }
      const s = S[0], v = vert(s), r = v ? topIn(s.c, [72, 420, 520, 880]) : topIn(s.c, [72, 420, 936, 527]);
      aperture(s, t, r, 0.6);
      if (VID.collecting) return;
      const cx = v ? r[0] + r[2] + 40 : 72, y0 = v ? 470 : r[1] + r[3] + 110;
      FT.forEach((f, i) => { const y = y0 + i * 112, p = seg(t, 1.6 + i * 0.25, 0.7); fade(f.n, cx, y, F(500, 76, SER), WHT, p); fade(f.u === 'BED' || f.u === 'BEDS' ? 'BEDROOMS' : f.u === 'BATH' || f.u === 'BATHS' ? 'BATHROOMS' : f.u, cx + textW(f.n, F(500, 76, SER), 0) + 16, y - 6, F(600, 20, SANS), WA(0.6), p, { ls: 4 }); rule(cx, y + 30, v ? 300 : 360, p, { col: WA(0.25), from: 'l', h: 1 }); });
      const ax = v ? cx : 960, aal = v ? 'left' : 'right', ay = v ? y0 + FT.length * 112 + 60 : y0;
      if (ADDR) al.lines.forEach((ln, i) => fade(ln, ax, ay + i * al.size * 1.05, F(500, al.size, SER, 'italic'), WHT, seg(t, 1.9 + i * 0.15, 0.8), { align: aal }));
      else K7.need('address', ax, ay, 26, { align: aal, col: WHT });
      const foot = BLURB || (FEAT.length ? 'Inside: ' + FEAT.slice(0, 2).join(' · ') : '');
      if (foot) { rule(72, 1330, 936, seg(t, 2.4, 0.8), { col: WA(0.3), from: 'l', h: 1 }); const L = K7.fitLines(foot, 500, SER, 880, 42, 2, { style: 'italic' }); L.lines.forEach((ln, i) => fade(ln, 72, 1380 + i * L.size * 1.1, F(500, L.size, SER, 'italic'), WA(0.8), seg(t, 2.5 + i * 0.12, 0.8))); }
    }
    function spread(k, t) {
      paper(); const A = S[1 + 2 * k], B = S[2 + 2 * k], t0 = k ? TB : TA;
      const side = k ? 72 : W - 72 - 600, ra = vert(A) ? topIn(A.c, [k ? W - 72 - 560 : 72, 260, 560, 996]) : topIn(A.c, [72, 260, 936, 700]);
      const capY = ra[1] + ra[3] + 150, rb = vert(B) ? topIn(B.c, [side + 160, Math.max(capY + 170, 1000), 440, 600]) : topIn(B.c, [side, Math.max(capY + 190, 1040), 600, 400]);
      aperture(A, t, ra, t0 + 0.35);
      if (!VID.collecting) { const p = seg(t, t0 + 0.9, 0.6), c = G(); c.globalAlpha = E.outC(p); c.shadowColor = 'rgba(0,0,0,0.25)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.fillStyle = DEEP2; c.fillRect(rb[0] - 14, rb[1] - 14 + (1 - E.outC(p)) * 40, rb[2] + 28, rb[3] + 28); D(); }
      ctx.save(); ctx.globalAlpha = E.outC(seg(t, t0 + 1.0, 0.6)); K7.photo(B, t, [rb[0], rb[1] + (1 - E.outC(seg(t, t0 + 0.9, 0.6))) * 40, rb[2], rb[3]]); ctx.restore();
      if (VID.collecting) return;
      const cap = FEAT[k], ly = capY, cx = k ? W - 110 : 72, cal = k ? 'right' : 'left';
      fade('0' + (k + 2), cx, ly - 46, F(600, 22, SANS), OR, seg(t, t0 + 1.4, 0.6), { ls: 5, align: cal });
      if (cap) { const L = K7.fitLines(cap, 500, SER, 900, 72, 2, { style: 'italic' }); L.lines.forEach((ln, i) => fade(ln, cx, ly + 30 + i * L.size * 1.05, F(500, L.size, SER, 'italic'), WHT, seg(t, t0 + 1.5 + i * 0.15, 0.8), { align: cal })); }
      else rule(cx - (k ? 300 : 0), ly + 10, 300, seg(t, t0 + 1.5, 0.8), { col: OR, from: 'l', h: 1.5 });
      fade(MAST + '   ·   ' + (k + 2), W / 2, H - 140, F(600, 18, SANS), WA(0.45), seg(t, t0 + 1.0, 0.6), { ls: 6, align: 'center' });
    }
    function back(t) {
      paper(); if (VID.collecting) return; const t0 = TC; let y = 520;
      if (PRICE) { fade(OFFER, W / 2, y, F(500, 50, SER, 'italic'), WA(0.75), seg(t, t0 + 0.4, 0.8), { align: 'center' }); const ps = priceOr(PRICE, DEAL); fade(ps, W / 2, y + 150, F(700, Math.min(150, fitSize(ps, 700, 936, 150, SER, 0)), SER), WHT, seg(t, t0 + 0.6, 0.9), { align: 'center' }); y += 230; }
      if (FT.length) { fade(K7.factStr(FT, '   ·   '), W / 2, y, F(600, 24, SANS), WA(0.7), seg(t, t0 + 0.9, 0.7), { align: 'center', ls: 4 }); y += 60; }
      if (ADDR) { fade(ADDR + (AREA ? ', ' + AREA : ''), W / 2, y, F(500, Math.min(40, fitSize(ADDR + (AREA ? ', ' + AREA : ''), 500, 936, 40, SER, 0, 'italic')), SER, 'italic'), WHT, seg(t, t0 + 1.0, 0.7), { align: 'center' }); y += 40; }
      rule(W / 2, y + 40, 160, seg(t, t0 + 1.2, 0.8), { col: OR }); y += 150;
      if (AG) fade(AG, W / 2, y, F(500, 60, SER, 'italic'), WHT, seg(t, t0 + 1.4, 0.8), { align: 'center' }); else y -= 60;
      if (AGT) fade(up(AGT), W / 2, y + 50, F(600, 20, SANS), OR, seg(t, t0 + 1.5, 0.7), { align: 'center', ls: 5 });
      const ph = K7.agentPhone({ agent_phone: AGP }), web = URL || CONTACT.web; fade([ph, web].filter(Boolean).join('   ·   '), W / 2, y + (AGT ? 110 : 70), F(600, 26, SANS), WA(0.75), seg(t, t0 + 1.6, 0.7), { align: 'center', ls: 2 });
      const cp = seg(t, t0 + 1.9, 0.8); if (cp > 0) { const cy = y + (AGT ? 200 : 160), c = G(), f = F(600, ctaSize(END, 600, 24, SANS, 6), SANS), bw = textW(END, f, 6) + 100; c.globalAlpha = E.outC(cp); c.strokeStyle = WHT; c.lineWidth = 1.5; c.strokeRect(W / 2 - bw / 2, cy - 36, bw, 72); setF(f, 6); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(END, W / 2 + 3, cy + 1); D(); }
      K7.logo(W / 2, Math.min(H - 330, y + 330), 380, E.outC(seg(t, t0 + 2.1, 0.8)));
    }
    function turn(t, tc, A, B) {   // page turn right to left: B is revealed under the lifting page, the page's back passes over A
      const u = seg(t, tc, TD); if (u <= 0) { A(t); return; } if (u >= 1) { B(t); return; }
      A(t); const e = E.inOutC(u), fx = W * (1 - e), bw = 220 * Math.sin(Math.PI * u);
      ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.rect(fx, 0, W - fx + 40, H); ctx.clip(); } B(t); ctx.restore();
      if (VID.collecting) return; const c = G(); let g = c.createLinearGradient(fx, 0, fx + 160, 0); g.addColorStop(0, 'rgba(0,0,0,0.28)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(fx, 0, 160, H);
      g = c.createLinearGradient(fx - bw, 0, fx, 0); g.addColorStop(0, DEEP1); g.addColorStop(0.7, mix(DEEP1, '#000000', 0.06)); g.addColorStop(1, mix(DEEP1, '#000000', 0.18)); c.fillStyle = g; c.fillRect(fx - bw, 0, bw, H); D();
    }
    return {
      dur: DUR, shakes: [],
      render(t) {
        if (t < TA + TD) turn(t, TA, cover, t2 => spread(0, t2));
        else if (t < TB + TD) turn(t, TB, t2 => spread(0, t2), t2 => spread(1, t2));
        else turn(t, TC, t2 => spread(1, t2), back);
      },
      cues() {
        const ev = [['air', 0.2, 0.2, -0.3], ['air', 0.65, 0.25, 0], ['tink', 1.7, 0.12, 0.3], ['tink', 1.95, 0.1, 0.3], ['tink', 2.2, 0.1, 0.3]];
        [TA, TB, TC].forEach(tc => { ev.push(['paper', tc + 0.05, 0.35, 0.4]); ev.push(['air', tc + 0.45, 0.16, 0]); });
        ev.push(['chime', TC + 0.7, 0.18, 0]); ev.push(['tink', TC + 1.9, 0.12, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ JUST LISTED
  // Immediate recognition: JUST / LISTED slam with a highlight bar, the hero photo, the price rolls up digit by digit, the
  // address and facts with icons, a carousel of photos with feature tags, then an inquiry close.
  function listed() {
    const ADDR = fact('addr', true), AREA = fact('area'), PRICE = fact('price'), DEAL = fact('deal');
    const FT = K7.facts({ beds: fact('beds'), baths: fact('baths'), sqft: fact('sqft') }), FEAT = K7.lines(fact('feat')), AG = fact('agent'), AGP = fact('agent_phone'), URL = fact('url');
    const H1 = TX('h1', 'JUST', { label: 'Headline 1', group: 'Headline', upper: true, max: 10 }), H2 = TX('h2', 'LISTED', { label: 'Headline 2', group: 'Headline', upper: true, max: 10 });
    const CTA = TX('cta', 'SCHEDULE A SHOWING', { label: 'Call to action', group: 'Ending', upper: true, max: 28 });
    const S = photos(['Hero photo', 'Photo 2', 'Photo 3', 'Photo 4'], [4.6, 2.0, 2.0, 2.0]);
    const T1 = 1.2, C0 = 5.6, CD = 1.85, OUT = C0 + 3 * CD, DUR = OUT + 3.6;
    S[0].start = T1; S.slice(1).forEach((s, k) => (s.start = C0 + k * CD));
    const PS = priceOr(PRICE, DEAL);
    let MM = null; const m = () => MM || (MM = { hs: Math.min(330, fitSize(H1, 700, 980, 330, DSP, 2), fitSize(H2, 700, 980, 330, DSP, 2)), psz: Math.min(230, fitSize(PS || '$0', 700, 936, 230, DSP, 2)), al: K7.fitLines(ADDR, 600, SANS, 936, 56, 2) });
    function odo(str, cx, y, size, p, col) {   // digits roll up to the price; other characters slide in
      if (VID.collecting || !str) return; const f = F(700, size, DSP), ls = 2, chars = [...str], ws = chars.map(ch => textW(ch, f, ls)), tot = ws.reduce((a, b) => a + b, 0); let x = cx - tot / 2; const c = G(); setF(f, ls); c.fillStyle = col; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
      c.beginPath(); c.rect(cx - tot / 2 - 20, y - size * 0.95, tot + 40, size * 1.15); c.clip();
      chars.forEach((ch, i) => {
        const u = E.outQ(clamp(p * 1.5 - i * 0.05));
        if (/\d/.test(ch)) { const target = +ch, roll = (1 - u) * (10 + i * 3), v = target + roll; for (const d of [Math.floor(v), Math.floor(v) + 1]) { const off = (v - d) * size * 1.02; c.fillText(String(((d % 10) + 10) % 10), x, y - off); } }
        else { c.globalAlpha = u; c.fillText(ch, x, y + (1 - u) * size * 0.5); c.globalAlpha = 1; }
        x += ws[i];
      });
      D();
    }
    return {
      dur: DUR, shakes: [[0.3, 10], [0.6, 10]],
      render(t) {
        if (!BACKDROP() && !VID.collecting) { const c = G(), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, DEEP1); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); }
        const sh0 = S[0], v = vert(sh0), band = v ? null : [0, 330, W, W / K3.ar(sh0.c)], q = seg(t, OUT - 0.3, 0.35);
        // photos: the hero, then the carousel pushes in from the right
        if (t >= T1 - 0.05 && t < OUT) {
          const k = t < C0 ? 0 : 1 + Math.min(2, Math.floor((t - C0) / CD)), sh = S[k], into = k === 0 ? 1 : E.inOutC(seg(t, sh.start - 0.05, 0.45));
          const rectOf = s => (vert(s) ? K3.wholeIn(s.c, [0, 0, W, H]) : (() => { const h = W / K3.ar(s.c); return [0, 330, W, h]; })());
          const op = seg(t, T1 - 0.05, 0.3);
          ctx.save(); ctx.globalAlpha = op * (1 - q);
          if (k > 0 && into < 1) { const pv = S[k - 1], r = rectOf(pv); K7.photo(pv, t, [r[0] - into * W * 0.3, r[1], r[2], r[3]], { lt: 1 }); }
          const r = rectOf(sh); K7.photo(sh, t, [r[0] + (1 - into) * W, r[1], r[2], r[3]], { lt: 1 }); ctx.restore();
          if (!VID.collecting) { if (r[3] >= H - 2) shade(H * 0.42, H * 0.62, 0, 0.94, DEEP2); else fill([0, r[1] + r[3], W, 6], OR, op * (1 - q)); }
          if (k > 0 && FEAT[k - 1] && !VID.collecting) { const fp = seg(t, sh.start + 0.25, 0.4) * (1 - seg(t, sh.start + CD - 0.2, 0.2)) * (1 - q), f = F(700, 30, SANS), tw = textW(up(FEAT[k - 1]), f, 3), y = r[3] >= H - 2 ? 940 : r[1] + r[3] - 70, c = G(); c.globalAlpha = E.outC(fp); c.fillStyle = DEEP2; c.fillRect(72, y - 34, tw + 60, 64); c.strokeStyle = OR; c.lineWidth = 3; c.strokeRect(72, y - 34, tw + 60, 64); setF(f, 3); c.fillStyle = WHT; c.textBaseline = 'middle'; c.fillText(up(FEAT[k - 1]), 102, y); D(); }
        }
        if (VID.collecting) return;
        // headline: slams, then becomes the corner tag
        const { hs, psz, al } = m(), sh = seg(t, T1 - 0.2, 0.4);
        if (sh < 1) { const a = 1 - E.inC(sh), y1 = 860, y2 = y1 + hs * 0.95;
          for (const [str, t0, y] of [[H1, 0.25, y1], [H2, 0.55, y2]]) { const p = seg(t, t0, 0.18); if (p <= 0) continue; const c = G(), s = lerp(1.4, 1, E.outC(p)); c.globalAlpha = a * clamp(p * 3); c.translate(W / 2, y); c.scale(s, s); setF(F(700, hs, DSP), 2); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; if (str === H2) { const bp = E.inOutC(seg(t, 0.75, 0.35)), w = textW(str, F(700, hs, DSP), 2) + 60; c.fillStyle = OR; c.fillRect(-w / 2, -hs * 0.78, w * bp, hs * 0.86); c.fillStyle = bp > 0.5 ? K7.on(OR) : WHT; } else c.fillStyle = WHT; c.fillText(str, 0, 0); D(); } }
        if (t >= T1 && t < OUT) { const p = seg(t, T1 + 0.1, 0.3), f = F(700, 34, DSP), str = H1 + ' ' + H2, w = textW(str, f, 4) + 44, y = v ? 290 : band[1] + 30, c = G(); c.globalAlpha = E.outC(p) * (1 - q); c.fillStyle = OR; c.fillRect(72, y, w * E.outC(p), 60); setF(f, 4); c.fillStyle = K7.on(OR); c.textBaseline = 'middle'; c.fillText(str, 94, y + 32); D(); }
        // the listing card: price, address, facts
        if (t >= T1 + 0.3 && t < OUT) {
          const y0 = v ? 1150 : band[1] + band[3] + 210, a = 1 - q;
          if (PS) odo(PS, W / 2, y0, psz, seg(t, T1 + 0.4, 1.5), OR); else fade('NEW TO THE MARKET', W / 2, y0 - 40, F(700, 70, DSP), OR, seg(t, T1 + 0.4, 0.5), { align: 'center', ls: 3, a });
          if (ADDR) al.lines.forEach((ln, i) => fade(ln, W / 2, y0 + 90 + i * al.size * 1.15, F(600, al.size, SANS), WHT, seg(t, T1 + 1.0 + i * 0.1, 0.5), { align: 'center', a }));
          else K7.need('address', W / 2, y0 + 100, 26, { align: 'center', col: WHT, a });
          const ay = y0 + 90 + Math.max(1, al.lines.length) * al.size * 1.15;
          if (AREA) fade(up(AREA), W / 2, ay + 10, F(600, 26, SANS), ACC2, seg(t, T1 + 1.2, 0.5), { align: 'center', ls: 5, a });
          factRow(FT, W / 2, ay + 100, 40, WHT, seg(t, T1 + 1.4, 0.8), { icol: OR, a });
        }
        // close
        if (t >= OUT) {
          const o = t - OUT, f = F(700, ctaSize(CTA, 700, 64, DSP, 3), DSP), tw = textW(CTA, f, 3), p = seg(o, 0.2, 0.4);
          const c = G(); c.fillStyle = OR; c.fillRect(W / 2 - (tw + 100) / 2, 700, (tw + 100) * E.outC(p), 120); setF(f, 3); c.fillStyle = K7.on(OR); c.globalAlpha = clamp(p * 2 - 0.6); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CTA, W / 2, 764); D();
          if (AG) fade(AG, W / 2, 920, F(700, 54, SANS), WHT, seg(o, 0.6, 0.5), { align: 'center' });
          fade([K7.agentPhone({ agent_phone: AGP }), URL || CONTACT.web].filter(Boolean).join('   ·   '), W / 2, 990, F(600, 30, SANS), WA(0.8), seg(o, 0.75, 0.5), { align: 'center', ls: 2 });
          if (ADDR) fade(up(H1 + ' ' + H2) + '  ·  ' + up(ADDR), W / 2, 1060, F(600, 22, SANS), ACC2, seg(o, 0.9, 0.5), { align: 'center', ls: 3 });
          K7.logo(W / 2, 1250, 460, E.outC(seg(o, 1.0, 0.6)));
        }
      },
      cues() {
        const ev = [['impact', 0.25, 0.5, -0.2], ['impact', 0.55, 0.5, 0.2], ['whoosh', 0.75, 0.25, 0], ['whoosh', T1, 0.25, 0], ['ticks', T1 + 0.4, 0.3, 0, { dur: 1.3, n: 18 }], ['pop', T1 + 1.7, 0.3, 0]];
        S.slice(1).forEach(s => { ev.push(['whoosh', s.start, 0.22, 0.4]); ev.push(['tink', s.start + 0.3, 0.12, 0.2]); });
        ev.push(['swell', OUT - 0.4, 0.25, 0]); ev.push(['clack', OUT + 0.2, 0.35, 0]); ev.push(['chime', OUT + 1.0, 0.2, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ OPEN HOUSE
  // An invitation: two doors (with the invitation on them) swing open onto the hero photo; a calendar tile, the time and the
  // address; a filmstrip of photos drifting past; "see you there" with an RSVP line.
  function open() {
    const DATE = fact('oh_date', true), TIME = fact('oh_time', true), ADDR = fact('addr', true), AREA = fact('area');
    const FT = K7.facts({ beds: fact('beds'), baths: fact('baths'), sqft: fact('sqft') }), FEAT = K7.lines(fact('feat')), AG = fact('agent'), AGP = fact('agent_phone'), URL = fact('url');
    const INV = TX('inv', 'you’re invited', { label: 'Script line on the doors', group: 'Doors', max: 22 });
    const HEAD = TX('head', 'OPEN HOUSE', { label: 'Headline', group: 'Doors', upper: true, max: 14 });
    const PEEK = TX('peek', 'Have a look around', { label: 'Line over the photos', group: 'Photos', max: 30 });
    const END = TX('end', 'see you there', { label: 'Closing script line', group: 'Ending', max: 20 });
    const CTA = TX('cta', 'RSVP OR JUST STOP BY', { label: 'Call to action', group: 'Ending', upper: true, max: 28 });
    const S = photos(['Front of the house', 'Photo 2', 'Photo 3', 'Photo 4'], [6.0, 4.8, 4.8, 4.8]);
    const DO = 1.25, H0 = 1.2, F0 = 6.9, OUT = 11.5, DUR = 15.2;
    S[0].start = H0; S[1].start = S[2].start = S[3].start = F0 - 0.2;
    const dm = /(\d{1,2})(?!\d)/.exec(DATE), DAYN = dm ? dm[1] : '', DTOP = up(DAYN ? DATE.replace(dm[0], '').replace(/[,\s]+$/, '').replace(/^[,\s]+/, '').replace(/\s*,\s*/g, ' · ') : DATE);
    const TBG = LIGHTPAL ? '#FFFFFF' : PAPER;
    function door(side, ang, a) {   // side -1 left, 1 right; hinge on the outer edge; ang 0 (closed) .. ~1.35 (open)
      if (VID.collecting || a <= 0) return; const hx = side < 0 ? 0 : W, w = W / 2 * Math.cos(ang), sk = Math.sin(ang) * 110, c = G();
      const far = hx - side * w, q = [[hx, 0], [far, sk], [far, H - sk], [hx, H]];
      c.globalAlpha = a; c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fillStyle = mix(OR, '#000000', 0.15 + 0.35 * Math.sin(ang)); c.fill();
      const P = (u, v) => [lerp(lerp(q[0][0], q[1][0], u), lerp(q[3][0], q[2][0], u), v), lerp(lerp(q[0][1], q[1][1], u), lerp(q[3][1], q[2][1], u), v)];
      c.strokeStyle = 'rgba(0,0,0,0.28)'; c.lineWidth = 6; for (const [v0, v1] of [[0.08, 0.46], [0.54, 0.92]]) { const pts = [P(0.18, v0), P(0.82, v0), P(0.82, v1), P(0.18, v1)]; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.stroke(); }
      const [kx, ky] = P(0.9, 0.62); c.fillStyle = ACC2; c.beginPath(); c.arc(kx, ky, 16 * Math.cos(ang * 0.7), 0, TAU); c.fill(); D();
    }
    function strip(t, y) {   // the filmstrip drifting left
      const fw = 620, gap = 34, u = t - F0, off = 140 - u * 120;
      S.slice(1).forEach((s, i) => { const x = off + i * (fw + gap), r = topIn(s.c, [x, y, fw, 620]); if (x > W || x + fw < 0) return; const a = seg(t, F0 + i * 0.15, 0.5); if (!VID.collecting && a > 0) fill([r[0] - 10, r[1] - 10, r[2] + 20, r[3] + 20], '#FFFFFF', a); ctx.save(); ctx.globalAlpha = a; K7.photo(s, t, r); ctx.restore(); });
    }
    return {
      dur: DUR, shakes: [],
      render(t) {
        if (!BACKDROP() && !VID.collecting) { const c = G(); c.fillStyle = BLK; c.fillRect(-20, -20, W + 40, H + 40); D(); }
        const q = seg(t, OUT - 0.35, 0.35), sh = S[0], v = vert(sh), hr = v ? K3.wholeIn(sh.c, [0, 0, W, H]) : topIn(sh.c, [72, 330, 936, 700]);
        // hero
        if (t >= H0 && t < F0 + 0.3) { const a = 1 - seg(t, F0 - 0.2, 0.4); ctx.save(); ctx.globalAlpha = a; K7.photo(sh, t, hr); ctx.restore(); if (v && !VID.collecting) { ctx.save(); ctx.globalAlpha = a; shade(H * 0.5, H * 0.62, 0, 1, BLK); fill([0, H * 0.62, W, H], BLK); ctx.restore(); } }
        // date tile, time, address
        if (t >= DO + 0.8 && t < F0 + 0.2 && !VID.collecting) {
          const a = 1 - seg(t, F0 - 0.25, 0.4), y0 = v ? 1230 : hr[1] + hr[3] + 80, p = seg(t, DO + 1.0, 0.6), c = G(), tw = 330, th = 380;
          c.globalAlpha = a * E.outC(p); c.translate(0, (1 - E.outC(p)) * 80); c.shadowColor = 'rgba(0,0,0,0.18)'; c.shadowBlur = 30; c.shadowOffsetY = 10; c.fillStyle = TBG; c.fillRect(72, y0, tw, th); c.shadowBlur = 0; c.shadowColor = 'transparent';
          c.fillStyle = OR; c.fillRect(72, y0, tw, 90); D();
          if (DATE) { K7.txt(DTOP, 72 + tw / 2, y0 + 58, F(700, Math.min(30, fitSize(DTOP || ' ', 700, tw - 30, 30, SANS, 3)), SANS), K7.on(OR), { align: 'center', ls: 3, a: a * E.outC(p) }); if (DAYN) K7.txt(DAYN, 72 + tw / 2, y0 + 300, F(700, 220, SER), K7.on(TBG), { align: 'center', a: a * E.outC(p) }); }
          else K7.need('date', 72 + tw / 2, y0 + 240, 20, { align: 'center', col: K7.on(TBG), a: a * E.outC(p) });
          const x = 72 + tw + 50, wcol = 1008 - x;
          if (TIME) { K7.icon('clock', x + 22, y0 + 50, 44, OR, { a: a * seg(t, DO + 1.3, 0.5) }); fade(TIME, x + 64, y0 + 70, F(700, Math.min(64, fitSize(TIME, 700, wcol - 70, 64, SER, 0)), SER), WHT, seg(t, DO + 1.3, 0.5), { a }); }
          else K7.need('time', x, y0 + 70, 20, { col: WHT, a });
          const al = K7.fitLines(ADDR, 600, SANS, wcol - 60, 40, 3);
          if (ADDR) { K7.icon('pin', x + 22, y0 + 160, 44, OR, { a: a * seg(t, DO + 1.5, 0.5) }); al.lines.forEach((ln, i) => fade(ln, x + 64, y0 + 175 + i * al.size * 1.15, F(600, al.size, SANS), WHT, seg(t, DO + 1.5 + i * 0.1, 0.5), { a })); }
          else K7.need('address', x, y0 + 175, 20, { col: WHT, a });
          if (AREA) fade(up(AREA), x + 64, y0 + 190 + Math.max(1, al.lines.length) * al.size * 1.15, F(600, 22, SANS), OR, seg(t, DO + 1.7, 0.5), { ls: 4, a });
          factRow(FT, 72, y0 + th + 90, 30, WHT, seg(t, DO + 1.9, 0.7), { align: 'left', icol: OR, a, rule: rgbaOf(WHT, 0.3) });
        }
        // filmstrip
        if (t >= F0 - 0.2 && t < OUT + 0.2) {
          ctx.save(); ctx.globalAlpha = 1 - q; strip(t, 560); ctx.restore();
          if (!VID.collecting) { fade(PEEK, W / 2, 470, F(500, Math.min(66, fitSize(PEEK, 500, 936, 66, SER, 0, 'italic')), SER, 'italic'), WHT, seg(t, F0, 0.7), { align: 'center', a: 1 - q });
            const fy = 1240; FEAT.slice(0, 3).forEach((ft, i) => fade('—  ' + ft, 72, fy + i * 56, F(600, 36, SANS), WHT, seg(t, F0 + 0.6 + i * 0.25, 0.5), { a: 1 - q }));
            const dline = [DATE, TIME].filter(Boolean).join('  ·  '); if (dline) fade(up(dline), 72, fy + Math.min(3, FEAT.length) * 56 + 4, F(700, 30, SANS), OR, seg(t, F0 + 1.2, 0.5), { ls: 4, a: 1 - q }); }
        }
        // doors (on top until they are open)
        if (t < DO + 1.2) {
          const ang = E.inOutC(seg(t, DO, 1.0)) * 1.53, a = 1 - seg(t, DO + 0.95, 0.15);
          door(-1, ang, a); door(1, ang, a);
          if (!VID.collecting) { const tq = seg(t, DO - 0.15, 0.2), ta = seg(t, 0.15, 0.5) * (1 - tq);
            if (ta > 0) { const c = G(); c.globalAlpha = ta; c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(W / 2 - 3, 0, 6, H); D(); }
            fade(INV, W / 2, 760, F(400, Math.min(120, fitSize(INV, 400, 900, 120, SCR, 0)), SCR), ACC2, ta, { align: 'center' });
            fade(HEAD, W / 2, 980, F(700, Math.min(230, fitSize(HEAD, 700, 940, 230, DSP, 4)), DSP), '#FFFFFF', seg(t, 0.35, 0.5) * (1 - tq), { align: 'center', ls: 4 });
            const dl = [DATE, TIME].filter(Boolean).join('  ·  '); if (dl) fade(up(dl), W / 2, 1060, F(700, 30, SANS), ACC2, seg(t, 0.55, 0.5) * (1 - tq), { align: 'center', ls: 4 }); }
        }
        // close
        if (t >= OUT && !VID.collecting) {
          const o = t - OUT;
          fade(END, W / 2, 640, F(400, Math.min(160, fitSize(END, 400, 920, 160, SCR, 0)), SCR), OR, seg(o, 0.2, 0.8), { align: 'center' });
          const dl = [DATE, TIME].filter(Boolean).join('  ·  '); if (dl) fade(up(dl), W / 2, 760, F(700, 34, SANS), WHT, seg(o, 0.5, 0.6), { align: 'center', ls: 4 });
          if (ADDR) fade(ADDR + (AREA ? ', ' + AREA : ''), W / 2, 820, F(600, Math.min(34, fitSize(ADDR + (AREA ? ', ' + AREA : ''), 600, 936, 34, SANS, 0)), SANS), WA(0.75), seg(o, 0.6, 0.6), { align: 'center' });
          const cp = seg(o, 0.8, 0.5); if (cp > 0) { const f = F(700, ctaSize(CTA, 700, 34, SANS, 4), SANS), bw = textW(CTA, f, 4) + 100, c = G(); c.globalAlpha = E.outC(cp); c.fillStyle = OR; c.fillRect(W / 2 - bw / 2, 900, bw, 90); setF(f, 4); c.fillStyle = K7.on(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CTA, W / 2 + 2, 946); D(); }
          fade([AG, K7.agentPhone({ agent_phone: AGP })].filter(Boolean).join('   ·   '), W / 2, 1080, F(600, 30, SANS), WHT, seg(o, 1.0, 0.5), { align: 'center' });
          if (URL || CONTACT.web) fade(up(URL || CONTACT.web), W / 2, 1130, F(600, 22, SANS), WA(0.6), seg(o, 1.1, 0.5), { align: 'center', ls: 4 });
          K7.logo(W / 2, 1300, 420, E.outC(seg(o, 1.2, 0.6)));
        }
      },
      cues() {
        const ev = [['chime', 0.3, 0.16, 0], ['air', DO, 0.3, 0], ['switch', DO - 0.05, 0.25, 0.3], ['whoosh', DO + 0.3, 0.2, -0.4], ['whoosh', DO + 0.3, 0.2, 0.4], ['pop', DO + 1.0, 0.25, -0.3], ['tink', DO + 1.3, 0.12, 0.3], ['tink', DO + 1.5, 0.12, 0.3]];
        ev.push(['air', F0, 0.2, 0]); ev.push(['chime', OUT + 0.2, 0.2, 0]); ev.push(['pop', OUT + 0.8, 0.25, 0]);
        return { dur: DUR, beds: [musicBed(DUR, { key: 2 })], events: ev };
      },
    };
  }

  // ================================================================ THE PRICE DROP
  // Typographic: the old price (if given) is struck through in red and falls away under gravity, the new price slams in
  // with an arrow; the photo holds the lower half; facts and address; a showing close.
  function drop() {
    const PRICE = fact('price', true), WAS = fact('was'), DEAL = fact('deal'), ADDR = fact('addr', true), AREA = fact('area');
    const FT = K7.facts({ beds: fact('beds'), baths: fact('baths'), sqft: fact('sqft') }), AG = fact('agent'), AGP = fact('agent_phone'), URL = fact('url');
    const LAB = TX('lab', 'NEW PRICE', { label: 'Label over the price', group: 'Price', upper: true, max: 16 });
    const WASL = TX('wasl', 'WAS', { label: 'Label over the old price', group: 'Price', upper: true, max: 10 });
    const CTA = TX('cta', 'SCHEDULE A SHOWING', { label: 'Call to action', group: 'Ending', upper: true, max: 28 });
    const S = photos(['Hero photo', 'Photo 2', 'Photo 3'], [3.6, 2.6, 2.6]);
    const NP = 1.75, P0 = 0.35, OUT = 9.6, DUR = 13.2;
    S[0].start = P0; S[1].start = 4.2; S[2].start = 6.9;
    const NEW = priceOr(PRICE, DEAL), OLD = priceOr(WAS, DEAL);
    let MM = null; const m = () => MM || (MM = { ns: Math.min(250, fitSize(NEW || '$0', 400, 940, 250, DSP, 1)), os: Math.min(170, fitSize(OLD || '$0', 400, 880, 170, DSP, 1)) });
    return {
      dur: DUR, shakes: [[NP + 0.05, 14]],
      render(t) {
        const sp = E.outQ(seg(t, 0, 0.5)), py = 760, q = seg(t, OUT - 0.3, 0.35);
        if (!BACKDROP() && !VID.collecting) { const c = G(); c.fillStyle = DEEP2; c.fillRect(-20, -20, W + 40, H + 40); c.fillStyle = BLK; c.fillRect(0, 0, W, py * sp); c.fillStyle = OR; c.fillRect(0, py * sp - 8, W, 8); D(); }
        // photos in the lower half: push up between them
        if (t >= P0 && t < OUT + 0.3) {
          const k = t < S[1].start ? 0 : t < S[2].start ? 1 : 2, sh = S[k], into = k ? E.inOutC(seg(t, sh.start - 0.05, 0.5)) : E.outQ(seg(t, P0, 0.6)), box = [0, py + 30, W, 520];
          const r = vert(sh) ? K3.wholeIn(sh.c, box) : topIn(sh.c, box);
          ctx.save(); ctx.globalAlpha = 1 - q; if (!VID.collecting) { ctx.beginPath(); ctx.rect(0, py, W, 560); ctx.clip(); }
          if (k > 0 && into < 1) { const pv = S[k - 1], r2 = vert(pv) ? K3.wholeIn(pv.c, box) : topIn(pv.c, box); K7.photo(pv, t, [r2[0], r2[1] - into * 560, r2[2], r2[3]], { lt: 1 }); }
          K7.photo(sh, t, [r[0], r[1] + (1 - into) * 560, r[2], r[3]], { lt: 1 }); ctx.restore();
        }
        if (VID.collecting) return;
        const { ns, os } = m(), cy = 520;
        // old price: struck, then it falls
        if (WAS && t < NP + 1.2) {
          const p = seg(t, P0 + 0.1, 0.4), fall = Math.max(0, t - 1.35), y = cy + 80 + 1600 * fall * fall, rot = fall * 0.9, a = (1 - seg(t, 1.6, 0.5)) * E.outC(p);
          const c = G(); c.globalAlpha = a; c.translate(W / 2, y); c.rotate(rot); setF(F(400, os, DSP), 1); c.fillStyle = WA(0.8); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(OLD, 0, 0);
          const w = textW(OLD, F(400, os, DSP), 1) + 60, sk = E.outC(seg(t, 0.95, 0.25)); c.strokeStyle = OR; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(-w / 2, -os * 0.2); c.lineTo(-w / 2 + w * sk, -os * 0.2 - os * 0.32 * sk); c.stroke(); D();
          fade(WASL, W / 2, cy - os * 0.95 + 80, F(700, 30, SANS), WA(0.6), p * (1 - seg(t, 1.35, 0.2)), { align: 'center', ls: 6 });
        }
        if (!WAS && t < NP + 0.2) { const p = seg(t, P0 + 0.1, 0.4), x2 = seg(t, NP - 0.2, 0.2); fade(LAB, W / 2, cy + 40, F(400, 150, DSP), WA(0.85), p * (1 - x2), { align: 'center', ls: 6 }); const ab = Math.sin(t * 9) * 14; K7.icon('arrow', W / 2, cy + 160 + ab, 90, OR, { a: E.outC(p) * (1 - x2), lw: 2.4 }); }
        // the new price
        const np = seg(t, NP, 0.16);
        if (np > 0 && t < OUT + 0.3) {
          const c = G(), s = lerp(1.5, 1, E.outC(np)); c.globalAlpha = clamp(np * 3) * (1 - q); c.translate(W / 2, cy + 110); c.scale(s, s); setF(F(400, ns, DSP), 1); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
          if (NEW) c.fillText(NEW, 0, 0); D(); if (!NEW) K7.need('price', W / 2, cy + 40, 30, { align: 'center', col: WHT });
          const lp = seg(t, NP + 0.15, 0.3), f = F(700, 40, SANS), lw = textW(LAB, f, 5) + 50 + 60, c2 = G(); c2.globalAlpha = E.outC(lp) * (1 - q); c2.fillStyle = OR; c2.fillRect(W / 2 - lw / 2, cy - ns * 0.86 + 40, lw, 74); setF(f, 5); c2.fillStyle = K7.on(OR); c2.textBaseline = 'middle'; c2.textAlign = 'left'; c2.fillText(LAB, W / 2 - lw / 2 + 25, cy - ns * 0.86 + 79); D();
          const ab = Math.abs(Math.sin((t - NP) * 5)) * Math.exp(-(t - NP) * 1.5) * 18; K7.icon('arrow', W / 2 + lw / 2 - 38, cy - ns * 0.86 + 77 + ab, 44, K7.on(OR), { a: E.outC(lp) * (1 - q), lw: 2.6 });
        }
        // address + facts under the photo
        if (t >= NP + 0.4 && t < OUT + 0.3) {
          const a = 1 - q, y = py + 590, al = ADDR + (AREA ? ', ' + AREA : '');
          if (ADDR) fade(al, W / 2, y, F(700, Math.min(42, fitSize(al, 700, 936, 42, SANS, 0)), SANS), WHT, seg(t, NP + 0.5, 0.5), { align: 'center', a }); else K7.need('address', W / 2, y, 22, { align: 'center', col: WHT, a });
          factRow(FT, W / 2, y + 64, 30, WA(0.85), seg(t, NP + 0.7, 0.6), { icol: OR, a });
        }
        if (t >= OUT) {
          const o = t - OUT, f = F(700, ctaSize(CTA, 700, 40, SANS, 5), SANS), bw = textW(CTA, f, 5) + 100, p = seg(o, 0.3, 0.35), c = G();
          c.globalAlpha = E.outC(p); c.fillStyle = OR; c.fillRect(W / 2 - bw / 2, 760, bw, 100); setF(f, 5); c.fillStyle = K7.on(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CTA, W / 2 + 2, 812); D();
          if (NEW) fade(up(LAB) + '  ' + NEW, W / 2, 660, F(400, 90, DSP), WHT, seg(o, 0.1, 0.4), { align: 'center', ls: 1 });
          fade([AG, K7.agentPhone({ agent_phone: AGP })].filter(Boolean).join('   ·   '), W / 2, 960, F(600, 32, SANS), WHT, seg(o, 0.6, 0.5), { align: 'center' });
          if (URL || CONTACT.web) fade(up(URL || CONTACT.web), W / 2, 1012, F(600, 22, SANS), WA(0.6), seg(o, 0.7, 0.5), { align: 'center', ls: 4 });
          K7.logo(W / 2, 1180, 420, E.outC(seg(o, 0.9, 0.5)));
        }
      },
      cues() {
        const ev = [['whoosh', 0.05, 0.25, 0]];
        ev.push(['pop', P0 + 0.1, 0.25, 0]); ev.push(['whoosh', 0.95, 0.3, 0.2]); ev.push(['clack', 1.0, 0.35, 0.2]); ev.push(['boom', 1.45, 0.4, 0]);
        ev.push(['impact', NP, 0.6, 0]); ev.push(['boom', NP, 0.35, 0]); ev.push(['pop', NP + 0.15, 0.3, 0]);
        ev.push(['whoosh', S[1].start, 0.22, 0]); ev.push(['whoosh', S[2].start, 0.22, 0]); ev.push(['clack', OUT + 0.3, 0.35, 0]); ev.push(['chime', OUT + 0.9, 0.2, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ SOLD STORIES
  // The yard sign: a post and arm, the brokerage panel swings in on its chains, the SOLD rider drops onto the arm and a gold
  // shine passes over it; the address; the agent close with an optional portrait.
  function sold() {
    const ADDR = fact('addr', true), AREA = fact('area'), AG = fact('agent'), AGT = fact('agent_title'), AGP = fact('agent_phone'), URL = fact('url');
    const KICK = TX('kick', 'JUST SOLD', { label: 'Line above the address', group: 'Sold', upper: true, max: 18 });
    const RIDER = TX('rider', 'SOLD', { label: 'Sign rider', group: 'Sold', upper: true, max: 8 });
    const ROLE = TX('role', '', { label: 'Your role', group: 'Sold', max: 40, hint: 'Optional, e.g. Represented the sellers. Leave empty to leave it out.' });
    const CTA = TX('cta', 'Thinking of selling? Let’s talk.', { label: 'Closing line', group: 'Ending', max: 40 });
    const S = photos(['Hero photo'], [9.0]); S[0].start = 0;
    const AP = SHOT('portrait', NONE('portrait'), { label: 'Agent portrait (optional)', group: 'Agent', kind: 'any', ph: 'v', d: 5, hint: 'Leave the placeholder and the ending works without a portrait' });
    const SG = 0.8, RD = 2.35, OUT = 8.8, DUR = 13.6, AY = 1060;
    const hasPortrait = !isPh(AP[0]);
    function sign(t) {
      if (VID.collecting) return; const px = 160, c = G();
      const pin = E.outC(seg(t, SG - 0.3, 0.5)); c.globalAlpha = pin; c.translate(0, (1 - pin) * 300);
      c.fillStyle = '#3B2A1E'; c.fillRect(px - 22, AY - 70, 44, H - AY + 120); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(px - 22, AY - 70, 10, H - AY + 120);
      c.fillStyle = '#3B2A1E'; c.fillRect(px - 22, AY - 16, 820, 32); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(px - 22, AY - 16, 820, 7);
      // the panel on its chains, swinging
      const u = Math.max(0, t - SG), ang = 0.5 * Math.exp(-u * 1.6) * Math.cos(u * 4.2) * seg(t, SG, 0.05), bx = px + 160, bw = 600, bh = 330, cx = bx + bw / 2;
      c.save(); c.translate(cx, AY + 16); c.rotate(ang);
      c.strokeStyle = '#8A8A8A'; c.lineWidth = 4; for (const x of [-bw / 2 + 60, bw / 2 - 60]) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 56); c.stroke(); }
      c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.fillStyle = PAPER; c.fillRect(-bw / 2, 56, bw, bh); c.shadowColor = 'transparent';
      c.strokeStyle = BLK; c.lineWidth = 6; c.strokeRect(-bw / 2 + 14, 70, bw - 28, bh - 28);
      const [lw, lh] = logoBox(420); c.drawImage(IMG.logoB, -lw / 2, 56 + 60, lw, lh);
      const nm = up(AG || URL || CONTACT.web || ''), ph = K7.agentPhone({ agent_phone: AGP });
      setF(F(700, Math.min(34, fitSize(nm || ' ', 700, bw - 80, 34, SANS, 3)), SANS), 3); c.fillStyle = BLK; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(nm, 0, 56 + bh - 92);
      if (ph) { setF(F(600, 30, SANS), 2); c.fillText(ph, 0, 56 + bh - 46); }
      c.restore();
      // the rider drops onto the arm, then the shine
      const rp = seg(t, RD, 0.5); if (rp > 0) {
        const ry = AY - 16 - 160, by = lerp(-500, 0, E.outBack(clamp(rp))), f = F(400, 140, DSP); c.save(); c.translate(0, by);
        c.fillStyle = ACC2; c.fillRect(bx, ry, bw, 160); c.strokeStyle = PAPER; c.lineWidth = 6; c.strokeRect(bx + 10, ry + 10, bw - 20, 140);
        setF(f, 18); c.fillStyle = PAPER; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(RIDER, cx + 9, ry + 88);
        const sh = seg(t, RD + 0.7, 0.8); if (sh > 0 && sh < 1) { c.save(); c.beginPath(); c.rect(bx, ry, bw, 160); c.clip(); const gx = lerp(bx - 300, bx + bw + 300, E.inOutS(sh)), g = c.createLinearGradient(gx - 140, 0, gx + 140, 0); g.addColorStop(0, rgbaOf(OR, 0)); g.addColorStop(0.5, rgbaOf(OR, 0.85)); g.addColorStop(1, rgbaOf(OR, 0)); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(bx, ry, bw, 160); c.restore(); }
        c.restore();
      }
      D();
    }
    return {
      dur: DUR, shakes: [[RD + 0.3, 12]],
      render(t) {
        if (!BACKDROP() && !VID.collecting) { const c = G(); c.fillStyle = BLK; c.fillRect(-20, -20, W + 40, H + 40); D(); }
        const q = seg(t, OUT - 0.35, 0.35), sh = S[0], v = vert(sh), r = v ? K3.wholeIn(sh.c, [0, 0, W, H]) : topIn(sh.c, [0, 120, W, 600]);
        if (t < OUT + 0.1) { ctx.save(); ctx.globalAlpha = seg(t, 0, 0.6) * (1 - q); K7.photo(sh, t, r); ctx.restore(); if (v && !VID.collecting) { ctx.save(); ctx.globalAlpha = 1 - q; shade(0, 420, 0.6, 0, BLK); shade(H * 0.36, H * 0.6, 0, 0.88, BLK); fill([0, H * 0.6, W, H], BLK, 0.88); ctx.restore(); } }
        if (t >= OUT && hasPortrait) { const o = t - OUT, box = [72, 380, 430, 760], rp = K3.wholeIn(AP[0], box), p = seg(o, 0.2, 0.6); fill([rp[0] - 10, rp[1] - 10, rp[2] + 20, rp[3] + 20], OR, E.outC(p)); ctx.save(); ctx.globalAlpha = E.outC(p); K3.clip(AP[0], AP[1], o, rp); ctx.restore(); }
        if (VID.collecting) return;
        if (t < OUT + 0.1) {
          ctx.save(); ctx.globalAlpha = 1 - q; sign(t); ctx.restore();
          const y0 = v ? 700 : r[1] + r[3] + 40;
          fade(KICK, 72, y0, F(700, 30, SANS), OR, seg(t, RD + 0.9, 0.5), { ls: 7, a: 1 - q });
          if (ADDR) { const L = K7.fitLines(ADDR, 600, SER, 936, 68, 1, { style: 'italic' }); L.lines.forEach((ln, i) => fade(ln, 72, y0 + 80 + i * L.size * 1.05, F(600, L.size, SER, 'italic'), WHT, seg(t, RD + 1.0 + i * 0.12, 0.6), { a: 1 - q })); }
          else K7.need('address', 72, y0 + 80, 24, { col: WHT, a: 1 - q });
          const meta = [AREA && up(AREA), ROLE && up(ROLE)].filter(Boolean).join('   ·   ');
          if (meta) fade(meta, 72, y0 + (ADDR ? 168 : 120), F(600, 22, SANS), WA(0.7), seg(t, RD + 1.3, 0.6), { ls: 4, a: 1 - q });
        }
        if (t >= OUT) {
          const o = t - OUT, nm = K7.agentName({ agent: AG }), ph = K7.agentPhone({ agent_phone: AGP });
          const x = hasPortrait ? 560 : W / 2, al = hasPortrait ? 'left' : 'center', mw = hasPortrait ? 448 : 936, L = K7.fitLines(nm, 600, SER, mw, 76, 2, { style: 'italic' }), y = hasPortrait ? 560 : 640;
          L.lines.forEach((ln, i) => fade(ln, x, y + i * L.size * 1.05, F(600, L.size, SER, 'italic'), WHT, seg(o, 0.4 + i * 0.1, 0.6), { align: al }));
          let yy = y + L.lines.length * L.size * 1.05;
          if (AGT) { fade(up(AGT), x, yy, F(600, 22, SANS), OR, seg(o, 0.6, 0.5), { align: al, ls: 5 }); yy += 60; }
          if (ph) { fade(ph, x, yy + 20, F(600, 36, SANS), WHT, seg(o, 0.7, 0.5), { align: al }); yy += 70; }
          if (URL || CONTACT.web) fade(up(URL || CONTACT.web), x, yy + 10, F(600, 20, SANS), WA(0.6), seg(o, 0.8, 0.5), { align: al, ls: 4 });
          const cy = hasPortrait ? 1260 : yy + 140, cl = K7.fitLines(CTA, 500, SER, 936, 60, 2, { style: 'italic' });
          rule(W / 2, cy - 70, 140, seg(o, 1.0, 0.6), { col: OR });
          cl.lines.forEach((ln, i) => fade(ln, W / 2, cy + i * cl.size * 1.1, F(500, cl.size, SER, 'italic'), WHT, seg(o, 1.1 + i * 0.1, 0.6), { align: 'center' }));
          K7.logo(W / 2, cy + cl.lines.length * cl.size * 1.1 + 140, 400, E.outC(seg(o, 1.4, 0.6)));
        }
      },
      cues() {
        const ev = [['air', 0.1, 0.2, 0], ['whoosh', SG - 0.1, 0.25, -0.3], ['clack', SG + 0.15, 0.3, -0.2], ['tink', SG + 0.5, 0.1, 0.2], ['tink', SG + 1.0, 0.08, -0.2], ['whoosh', RD, 0.3, 0], ['impact', RD + 0.32, 0.55, 0], ['shimmer', RD + 0.75, 0.3, 0.2], ['chime', RD + 1.1, 0.2, 0]];
        ev.push(['air', OUT, 0.2, 0]); ev.push(['chime', OUT + 1.1, 0.2, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ THE NEIGHBORHOOD EDIT
  // An editorial local guide: a street grid draws itself, the neighbourhood name sits over it, pins drop only for the places
  // you name, then three chapters of your lifestyle footage with numbered lines. No amenities are ever assumed.
  function hood() {
    const AREA = fact('area', true), AG = fact('agent'), AGP = fact('agent_phone'), URL = fact('url');
    const KICK = TX('kick', 'THE NEIGHBORHOOD EDIT', { label: 'Small line', group: 'Opening', upper: true, max: 26 });
    const SP = [1, 2, 3, 4].map(k => TX('spot' + k, '', { label: 'Local spot ' + k, group: 'Places you name', max: 28, hint: k === 1 ? 'Optional. Only places you name get a pin, e.g. Corner Bakery, Riverside Park.' : 'Optional' }));
    const LN = ['Morning walks.', 'Long lunches.', 'Easy evenings.'].map((d, k) => TX('l' + (k + 1), d, { label: 'Chapter ' + (k + 1) + ' line', group: 'Chapters', max: 24 }));
    const END = TX('end', 'Find your place here.', { label: 'Closing line', group: 'Ending', max: 30 });
    const S = K3.shots(LN.map((l, k) => { const s = SHOT('s' + (k + 1), window.STUDIO ? NONE('s' + (k + 1)) : DEMO_PH[k + 3], { label: 'Chapter ' + (k + 1) + ' footage', group: 'Footage', kind: 'any', d: 3.4 }); return [s[0], s[1], 3.0]; }));
    const C0 = 3.4, CD = 3.0, OUT = C0 + 3 * CD, DUR = OUT + 4.0; S.forEach((s, k) => (s.start = C0 + k * CD));
    const spots = SP.map((s, k) => ({ s, k })).filter(x => nz(x.s));
    const PINS = [[0.22, 0.3], [0.68, 0.22], [0.42, 0.66], [0.8, 0.7]];
    function map(t, r, p, a) {   // an abstract street grid (not a real map): streets, an avenue, a park block
      if (VID.collecting || a <= 0) return; const [x, y, w, h] = r, c = G(); c.globalAlpha = a; c.beginPath(); c.rect(x, y, w, h); c.clip();
      c.fillStyle = rgbaOf(ACC2, 0.16); c.fillRect(x + w * 0.52, y + h * 0.36, w * 0.2, h * 0.22);
      c.strokeStyle = WA(0.55); c.lineCap = 'round';
      for (let i = 0; i < 7; i++) { const yy = y + h * (0.08 + i * 0.14) + Math.sin(i * 1.7) * 8, u = E.inOutC(clamp(p * 1.4 - i * 0.07)); c.lineWidth = i === 3 ? 7 : 3; c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w * u, yy + w * u * 0.03 * (i % 2 ? 1 : -1)); c.stroke(); }
      for (let i = 0; i < 6; i++) { const xx = x + w * (0.1 + i * 0.17) + Math.cos(i * 2.1) * 10, u = E.inOutC(clamp(p * 1.4 - 0.15 - i * 0.07)); c.lineWidth = i === 2 ? 7 : 3; c.beginPath(); c.moveTo(xx, y); c.lineTo(xx - h * u * 0.04, y + h * u); c.stroke(); }
      const u = E.inOutC(clamp(p * 1.3 - 0.4)); c.strokeStyle = OR; c.lineWidth = 9; c.beginPath(); c.moveTo(x, y + h * 0.95); c.lineTo(x + w * u, y + h * (0.95 - 0.9 * u)); c.stroke();
      D();
    }
    function pins(t, r, t0, a) {
      if (VID.collecting) return;
      spots.forEach(({ s, k }, j) => { const [u, v] = PINS[k], px = r[0] + r[2] * u, py = r[1] + r[3] * v, p = seg(t, t0 + j * 0.35, 0.45); if (p <= 0) return; const c = G(), dy = (1 - E.outBack(p)) * -120; c.globalAlpha = a * clamp(p * 3); c.translate(px, py + dy);
        c.fillStyle = OR; c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-30, -40, -30, -76, 0, -76); c.bezierCurveTo(30, -76, 30, -40, 0, 0); c.fill(); setF(F(700, 26, SANS), 0); c.fillStyle = K7.on(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(k + 1), 0, -50); D(); });
    }
    return {
      dur: DUR, shakes: [],
      render(t) {
        if (!BACKDROP() && !VID.collecting) { const c = G(), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, DEEP2); g.addColorStop(1, DEEP1); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); }
        const q = seg(t, OUT - 0.3, 0.4), mr = [72, 300, 936, 760];
        // opening: the map, the name, the pins and a legend
        if (t < C0 + 0.3) {
          const a = 1 - seg(t, C0 - 0.3, 0.5); map(t, mr, seg(t, 0.1, 1.6), a);
          pins(t, mr, 1.2, a);
          if (!VID.collecting) {
            fade(KICK, 72, 250, F(600, 24, SANS), OR, seg(t, 0.3, 0.6), { ls: 6, a });
            if (AREA) { const L = K7.fitLines(AREA, 400, SER, 936, 170, 2, { style: 'italic' }); L.lines.forEach((ln, i) => fade(ln, 72, 1200 + i * L.size * 0.95, F(400, L.size, SER, 'italic'), WHT, seg(t, 0.8 + i * 0.15, 0.9), { a })); }
            else K7.need('neighbourhood', 72, 1200, 30, { col: WHT, a });
            spots.forEach(({ s, k }, j) => fade((k + 1) + '   ' + s, 72, 1460 + j * 56, F(600, 30, SANS), WHT, seg(t, 1.4 + j * 0.3, 0.5), { a }));
          }
        }
        // chapters: framed footage with a hard offset block, a numbered line, the pin it belongs to (if named)
        if (t >= C0 - 0.1 && t < OUT + 0.3) {
          const k = clamp(Math.floor((t - C0) / CD), 0, 2), t0 = C0 + k * CD, sh = S[k], into = E.inOutC(seg(t, t0 - 0.1, 0.6)), out = E.inC(seg(t, t0 + CD - 0.25, 0.35));
          const box = vert(sh) ? [W - 72 - 560, 260, 560, 996] : [72, 330, 936, 700], r = topIn(sh.c, box), dx = (1 - into) * 400 - out * 400, a = clamp(into * 1.5) * (1 - out) * (1 - q);
          map(t, [0, 0, W, H], 1, 0.12 * (1 - q));
          fill([r[0] + 24 + dx, r[1] + 24, r[2], r[3]], OR, a);
          ctx.save(); ctx.globalAlpha = a; K7.photo(sh, t, [r[0] + dx, r[1], r[2], r[3]]); ctx.restore();
          if (!VID.collecting) {
            const tx = vert(sh) ? 72 : 72, ty = vert(sh) ? 1360 : r[1] + r[3] + 170;
            fade('No. ' + (k + 1), tx, ty - 90, F(600, 24, SANS), OR, seg(t, t0 + 0.3, 0.5) * (1 - out), { ls: 5, a: 1 - q });
            const L = K7.fitLines(LN[k], 400, SER, vert(sh) ? 380 : 936, 110, 3, { style: 'italic' });
            L.lines.forEach((ln, i) => fade(ln, tx, ty + i * L.size, F(400, L.size, SER, 'italic'), WHT, seg(t, t0 + 0.4 + i * 0.1, 0.6) * (1 - out), { a: 1 - q }));
            const sp = spots[k]; if (sp) { K7.icon('pin', tx + 18, ty + L.lines.length * L.size + 20, 36, OR, { a: seg(t, t0 + 0.8, 0.5) * (1 - out) * (1 - q) }); fade(sp.s, tx + 50, ty + L.lines.length * L.size + 32, F(600, 30, SANS), WHT, seg(t, t0 + 0.8, 0.5) * (1 - out), { a: 1 - q }); }
          }
        }
        if (t >= OUT && !VID.collecting) {
          const o = t - OUT; map(t, [72, 260, 936, 560], 1, 0.35 * seg(o, 0, 0.6)); pins(t, [72, 260, 936, 560], OUT + 0.2, seg(o, 0, 0.6));
          if (AREA) fade(AREA, W / 2, 920, F(400, Math.min(110, fitSize(AREA, 400, 936, 110, SER, 0, 'italic')), SER, 'italic'), WHT, seg(o, 0.3, 0.8), { align: 'center' });
          fade(END, W / 2, 1010, F(600, Math.min(40, fitSize(END, 600, 936, 40, SANS, 1)), SANS), WA(0.8), seg(o, 0.6, 0.6), { align: 'center' });
          const cp = seg(o, 0.9, 0.5); if (cp > 0) { const f = F(700, ctaSize(CONTACT.cta, 700, 30, SANS, 4), SANS), bw = textW(CONTACT.cta, f, 4) + 100, c = G(); c.globalAlpha = E.outC(cp); c.fillStyle = OR; c.fillRect(W / 2 - bw / 2, 1080, bw, 84); setF(f, 4); c.fillStyle = K7.on(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CONTACT.cta, W / 2 + 2, 1123); D(); }
          fade([AG, K7.agentPhone({ agent_phone: AGP })].filter(Boolean).join('   ·   '), W / 2, 1240, F(600, 28, SANS), WHT, seg(o, 1.1, 0.5), { align: 'center' });
          K7.logo(W / 2, 1400, 400, E.outC(seg(o, 1.3, 0.6)));
        }
      },
      cues() {
        const ev = [['pencil', 0.1, 0.18, -0.3, {}], ['pencil', 0.6, 0.16, 0.3, {}], ['air', 0.8, 0.2, 0]];
        spots.forEach((_, j) => ev.push(['pop', 1.2 + j * 0.35 + 0.3, 0.25, -0.4 + j * 0.3]));
        S.forEach(s => { ev.push(['whoosh', s.start, 0.2, 0.3]); ev.push(['tink', s.start + 0.45, 0.1, 0]); });
        ev.push(['air', OUT, 0.2, 0]); ev.push(['chime', OUT + 0.9, 0.2, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ ROOM BY ROOM
  // A walk-through: each room opens through a doorway (a narrow slit widening, framed in the accent) while the last room
  // slips aside; the room's name, a line about it, an index and a progress rail that names every room.
  function tour() {
    const ADDR = fact('addr'), AREA = fact('area'), AG = fact('agent'), AGP = fact('agent_phone'), URL = fact('url');
    const KICK = TX('kick', 'ROOM BY ROOM', { label: 'Small line', group: 'Opening', upper: true, max: 22 });
    const RM = ['ENTRY', 'LIVING ROOM', 'KITCHEN', 'PRIMARY SUITE', 'OUTDOORS'].map((d, k) => TX('r' + (k + 1), d, { label: 'Room ' + (k + 1), group: 'Rooms', upper: true, max: 18, req: true, hint: k === 0 ? 'Sample names: match them to your photos' : undefined }));
    const NT = [1, 2, 3, 4, 5].map(k => TX('n' + k, '', { label: 'Room ' + k + ' note', group: 'Rooms', max: 40, hint: k === 1 ? 'Optional, in your words' : undefined }));
    const CTA = TX('cta', 'BOOK A PRIVATE TOUR', { label: 'Call to action', group: 'Ending', upper: true, max: 26 });
    const RD = 2.3, R0 = 2.0, OUT = R0 + 5 * RD, DUR = OUT + 3.6;
    const S = photos(['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5'], RD + 0.3); S.forEach((s, k) => (s.start = R0 + k * RD));
    const rectOf = s => (vert(s) ? K3.wholeIn(s.c, [0, 0, W, H]) : (() => { const h = W / K3.ar(s.c); return [0, 820 - h / 2, W, h]; })());
    function rail(k, y, a) {   // five segments, the rooms named under them
      if (VID.collecting || a <= 0) return; const x0 = 72, w = 936, sw = w / 5;
      for (let i = 0; i < 5; i++) { fill([x0 + i * sw + 4, y, sw - 8, 6], i <= k ? OR : WA(0.25), a); K7.txt(RM[i], x0 + i * sw + sw / 2, y + 44, F(600, Math.min(18, fitSize(RM[i], 600, sw - 10, 18, SANS, 2)), SANS), i === k ? WHT : WA(0.45), { align: 'center', ls: 2, a }); }
    }
    return {
      dur: DUR, shakes: [],
      render(t) {
        if (!BACKDROP() && !VID.collecting) { const c = G(), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, DEEP1); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); }
        const q = seg(t, OUT - 0.3, 0.35);
        if (t < R0 + 0.3 && !VID.collecting) {
          const a = 1 - seg(t, R0 - 0.3, 0.4); fade(KICK, W / 2, 760, F(600, 24, SANS), OR, seg(t, 0.2, 0.6), { align: 'center', ls: 8, a });
          const L = K7.fitLines(ADDR || BRAND.name, 500, SER, 900, 90, 2, { style: 'italic' }); L.lines.forEach((ln, i) => fade(ln, W / 2, 880 + i * L.size * 1.05, F(500, L.size, SER, 'italic'), WHT, seg(t, 0.4 + i * 0.12, 0.8), { align: 'center', a }));
          if (AREA) fade(up(AREA), W / 2, 900 + L.lines.length * L.size * 1.05, F(600, 22, SANS), WA(0.6), seg(t, 0.7, 0.6), { align: 'center', ls: 6, a });
          rail(-1, 1200, a * seg(t, 0.9, 0.6));
        }
        if (t >= R0 - 0.05 && t < OUT + 0.3) {
          const k = clamp(Math.floor((t - R0) / RD), 0, 4), sh = S[k], t0 = R0 + k * RD, u = E.inOutC(seg(t, t0 - 0.05, 0.6)), r = rectOf(sh);
          ctx.save(); ctx.globalAlpha = 1 - q;
          if (k > 0 && u < 1) { const pv = S[k - 1], r2 = rectOf(pv); K7.photo(pv, t, [r2[0] - u * 120, r2[1], r2[2], r2[3]], { lt: 1 }); if (!VID.collecting) fill([0, 0, W, H], '#000000', 0.45 * u); }
          const sw = W * u; if (!VID.collecting && u < 1) { ctx.beginPath(); ctx.rect(W / 2 - sw / 2, 0, sw, H); ctx.clip(); } K7.photo(sh, t, r, { lt: 1 }); ctx.restore();
          if (!VID.collecting && u > 0 && u < 1) { fill([W / 2 - sw / 2 - 10, 0, 10, H], OR, (1 - q) * (1 - u)); fill([W / 2 + sw / 2, 0, 10, H], OR, (1 - q) * (1 - u)); }
          if (!VID.collecting) {
            if (r[3] >= H - 2) shade(H * 0.55, H, 0, 0.9, DEEP2);
            const a = (1 - q) * (1 - seg(t, t0 + RD - 0.2, 0.2)), ly = r[3] >= H - 2 ? 1380 : r[1] + r[3] + 170;
            fade(RM[k], 72, ly, F(700, Math.min(130, fitSize(RM[k], 700, 936, 130, DSP, 2)), DSP), WHT, seg(t, t0 + 0.35, 0.4), { a, ls: 2 });
            if (NT[k]) fade(NT[k], 74, ly + 70, F(500, Math.min(44, fitSize(NT[k], 500, 936, 44, SER, 0, 'italic')), SER, 'italic'), WA(0.85), seg(t, t0 + 0.55, 0.5), { a });
            K7.txt('0' + (k + 1) + ' / 05', 1008, 300, F(700, 26, 'Mono'), OR, { align: 'right', ls: 3, a: 1 - q });
            rail(k, 1640, 1 - q);
          }
        }
        if (t >= OUT && !VID.collecting) {
          const o = t - OUT, f = F(700, ctaSize(CTA, 700, 70, DSP, 3), DSP), bw = textW(CTA, f, 3) + 100, p = seg(o, 0.3, 0.4), c = G();
          c.strokeStyle = OR; c.lineWidth = 3; c.globalAlpha = E.outC(p); c.strokeRect(W / 2 - bw / 2, 720, bw, 130); setF(f, 3); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CTA, W / 2, 790); D();
          if (ADDR) fade(ADDR + (AREA ? ', ' + AREA : ''), W / 2, 940, F(500, Math.min(44, fitSize(ADDR + (AREA ? ', ' + AREA : ''), 500, 936, 44, SER, 0, 'italic')), SER, 'italic'), WHT, seg(o, 0.5, 0.6), { align: 'center' });
          fade([AG, K7.agentPhone({ agent_phone: AGP })].filter(Boolean).join('   ·   '), W / 2, 1020, F(600, 28, SANS), WA(0.8), seg(o, 0.7, 0.5), { align: 'center' });
          if (URL || CONTACT.web) fade(up(URL || CONTACT.web), W / 2, 1070, F(600, 20, SANS), WA(0.55), seg(o, 0.8, 0.5), { align: 'center', ls: 4 });
          K7.logo(W / 2, 1230, 400, E.outC(seg(o, 1.0, 0.6)));
        }
      },
      cues() {
        const ev = [['air', 0.2, 0.2, 0], ['tink', 0.9, 0.1, 0]];
        S.forEach((s, k) => { ev.push(['air', s.start, 0.22, (k % 2 ? 0.3 : -0.3)]); ev.push(['switch', s.start + 0.35, 0.12, 0]); });
        ev.push(['swell', OUT - 0.3, 0.2, 0]); ev.push(['chime', OUT + 0.6, 0.2, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ MEET YOUR AGENT
  // Personal brand: the portrait fills the frame, the name is set huge in two lines, the script hello; what you do slams in
  // one word at a time; an optional stat you enter; a paper contact card slides up.
  function agent() {
    const AG = fact('agent'), AGT = fact('agent_title'), AGP = fact('agent_phone'), URL = fact('url');
    const HELLO = TX('hello', 'meet your agent', { label: 'Script line', group: 'Opening', max: 22 });
    const VS = [0, 1, 2].map(k => TX('v' + (k + 1), K5.svc(k), { label: 'What you do ' + (k + 1), group: 'What you do', upper: true, max: 16 }));
    const STAT = TX('stat', '', { label: 'A number you can stand behind', group: 'Optional stat', max: 10, hint: 'Optional, e.g. 15 YEARS. Leave empty to leave it out.' });
    const STATL = TX('statl', '', { label: 'What the number means', group: 'Optional stat', upper: true, max: 30 });
    const CTA = TX('cta', 'Thinking of moving? Let’s talk.', { label: 'Closing line', group: 'Ending', max: 40 });
    const AP = SHOT('portrait', window.STUDIO ? NONE('portrait') : ['v04', 4.0], { label: 'Your portrait (vertical fills the screen)', group: 'Portrait', kind: 'any', ph: 'v', d: 10 });
    const V0 = 4.0, VD = 1.35, ST0 = V0 + 3 * VD, OUT = ST0 + 1.9, DUR = OUT + 3.8;
    const NAME = K7.agentName({ agent: AG }), parts = NAME.split(/\s+/), NL = parts.length > 1 ? [parts.slice(0, -1).join(' '), parts[parts.length - 1]] : [NAME];
    let MM = null; const m = () => MM || (MM = { ns: Math.min(240, ...NL.map(l => fitSize(up(l), 400, 936, 240, DSP, 2))) });
    return {
      dur: DUR, shakes: [[V0 + 0.1, 6], [V0 + VD + 0.1, 6], [V0 + 2 * VD + 0.1, 6]],
      render(t) {
        if (!BACKDROP() && !VID.collecting) { const c = G(); c.fillStyle = BLK; c.fillRect(-20, -20, W + 40, H + 40); D(); }
        const r = K3.wholeIn(AP[0], vert({ c: AP[0] }) ? [0, 0, W, H] : [0, 200, W, 760]), full = r[3] >= H - 2, q = seg(t, OUT - 0.3, 0.4);
        if (t < OUT + 0.2) { ctx.save(); ctx.globalAlpha = seg(t, 0, 0.6) * (1 - q); K3.clip(AP[0], AP[1], t, r); ctx.restore(); if (!VID.collecting) { ctx.save(); ctx.globalAlpha = 1 - q; if (full) shade(H * 0.45, H * 0.8, 0, 0.95, BLK); fill([0, H * 0.8, W, H * 0.2], BLK, full ? 0.95 : 0); if (t > V0 - 0.3) fill([0, 0, W, H], BLK, 0.62 * seg(t, V0 - 0.3, 0.4)); ctx.restore(); } }
        if (VID.collecting) return;
        // the name
        if (t < V0 + 0.2) {
          const a = 1 - seg(t, V0 - 0.35, 0.35), ns = m().ns, y0 = full ? 1310 - (NL.length - 1) * ns * 0.9 : r[1] + r[3] + 260;
          fade(HELLO, 72, y0 - ns * 0.95 - 30, F(400, 72, SCR), OR, seg(t, 0.5, 0.6), { a });
          NL.forEach((ln, i) => T([[up(ln), WHT]], 72, y0 + i * ns * 0.9, F(400, ns, DSP), { p: seg(t, 0.8 + i * 0.15, 0.5), ls: 2, alpha: a }));
          if (AGT) fade(up(AGT), 74, y0 + (NL.length - 1) * ns * 0.9 + 70, F(600, 26, SANS), OR, seg(t, 1.4, 0.5), { ls: 6, a });
        }
        // what you do, one word at a time
        VS.forEach((w, k) => {
          const t0 = V0 + k * VD, p = seg(t, t0, 0.16), x2 = seg(t, t0 + VD - 0.18, 0.2); if (p <= 0 || x2 >= 1) return;
          const sz = Math.min(220, fitSize(w, 400, 936, 220, DSP, 3)), c = G(), s = lerp(1.35, 1, E.outC(p)); c.globalAlpha = clamp(p * 3) * (1 - x2); c.translate(W / 2, 1000 - x2 * 160); c.scale(s, s); setF(F(400, sz, DSP), 3); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(w, 0, 0);
          const uw = textW(w, F(400, sz, DSP), 3) * E.inOutC(seg(t, t0 + 0.12, 0.35)); c.fillStyle = OR; c.fillRect(-uw / 2, 34, uw, 10); D();
        });
        if (!STAT && t >= ST0 && t < OUT + 0.2) { const p = seg(t, ST0, 0.3), a = 1 - q, ns = m().ns * 0.7; NL.forEach((ln, i) => fade(up(ln), W / 2, 900 + i * ns * 0.9, F(400, ns, DSP), i ? OR : WHT, seg(t, ST0 + i * 0.12, 0.35), { align: 'center', a, ls: 2 })); }
        if (STAT && t >= ST0 && t < OUT + 0.2) { const p = seg(t, ST0, 0.3), a = 1 - q; fade(STAT, W / 2, 1000, F(400, Math.min(300, fitSize(STAT, 400, 936, 300, DSP, 2)), DSP), OR, p, { align: 'center', a, ls: 2 }); if (STATL) fade(STATL, W / 2, 1080, F(600, 30, SANS), WHT, seg(t, ST0 + 0.3, 0.4), { align: 'center', ls: 5, a }); }
        // the contact card
        if (t >= OUT) {
          const o = t - OUT, p = E.outQ(seg(o, 0.1, 0.6)), cy = lerp(H, 420, p), cw = 880, ch = 720, c = G();
          c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 40; c.shadowOffsetY = 16; c.fillStyle = PAPER; c.fillRect(W / 2 - cw / 2, cy, cw, ch); c.shadowColor = 'transparent'; c.fillStyle = OR; c.fillRect(W / 2 - cw / 2, cy, 12, ch); D();
          const ink = K7.on(PAPER), x = W / 2 - cw / 2 + 80, nl = K7.fitLines(NAME, 400, DSP, cw - 160, 120, 2);
          nl.lines.forEach((ln, i) => K7.txt(up(ln), x, cy + 170 + i * nl.size * 0.92, F(400, nl.size, DSP), ink, { ls: 2, a: seg(o, 0.5, 0.4) }));
          let y = cy + 170 + nl.lines.length * nl.size * 0.92;
          if (AGT) { K7.txt(up(AGT), x, y, F(600, 24, SANS), OR, { ls: 5, a: seg(o, 0.6, 0.4) }); y += 70; }
          const ph = K7.agentPhone({ agent_phone: AGP }); if (ph) { K7.icon('phone', x + 20, y + 10, 36, ink, { a: seg(o, 0.7, 0.4) }); K7.txt(ph, x + 60, y + 22, F(700, 40, SANS), ink, { a: seg(o, 0.7, 0.4) }); y += 80; }
          if (URL || CONTACT.web) { K7.txt(up(URL || CONTACT.web), x, y + 10, F(600, 24, SANS), rgbaOf(ink, 0.6), { ls: 3, a: seg(o, 0.8, 0.4) }); }
          const [lw, lh] = logoBox(300); if (seg(o, 0.9, 0.4) > 0) { const c2 = G(); c2.globalAlpha = seg(o, 0.9, 0.4); c2.drawImage(IMG.logoB, x, cy + ch - 80 - lh, lw, lh); D(); }
          const cl = K7.fitLines(CTA, 500, SER, 840, 64, 2, { style: 'italic' }); cl.lines.forEach((ln, i) => fade(ln, W / 2, cy + ch + 110 + i * cl.size * 1.1, F(500, cl.size, SER, 'italic'), WHT, seg(o, 1.1 + i * 0.1, 0.6), { align: 'center' }));
        }
      },
      cues() {
        const ev = [['air', 0.3, 0.2, 0], ['whoosh', 0.8, 0.2, -0.2], ['tink', 1.4, 0.12, 0.2]];
        VS.forEach((_, k) => { ev.push(['impact', V0 + k * VD, 0.42, 0]); ev.push(['whoosh', V0 + k * VD + 0.1, 0.18, 0.2]); });
        ev.push(['boom', ST0, 0.35, 0]); ev.push(['chime', ST0 + 0.3, 0.18, 0]);
        ev.push(['whoosh', OUT + 0.1, 0.25, 0]); ev.push(['paper', OUT + 0.2, 0.25, 0]); ev.push(['chime', OUT + 1.1, 0.2, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  const MAKE = { sig, listed, open, drop, sold, hood, tour, agent };
  const P = (MAKE[V] || sig)();
  const light = LIGHTPAL;
  DIR = { bgSwap: true, dur: P.dur, bg: BLK, finish: { vig: light ? 0.1 : 0.26, grain: light ? 0.08 : 0.16 }, edl: [], shakes: P.shakes, preload: () => K3.init(), render: P.render, cues: P.cues, fam: V,
    setup() { if (!window.STUDIO && LIGHTPAL) { const w = IMG.logoW; IMG.logoW = IMG.logoB; IMG.logoB = w; } } };
});
