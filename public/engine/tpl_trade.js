'use strict';
/* Industry signature families, beyond restaurants and real estate (Oct 29). One family per industry to start, each with its
   own composition, type, motion, transitions, closing and sound. Footage starts as placeholders (a plain engine render uses
   library footage). Nothing is claimed for the brand: credentials, stats, dates, sizes and names are fields the user fills;
   empty optional fields are left out.
   ?v=blueprint  The Blueprint (home services)        graph paper, a plotter line, dimension lines, numbered callouts, a title block
   ?v=salon      Salon Editorial (beauty)             colour-blocked magazine pages, a diptych, the credits, a script close
   ?v=barber     Barbershop Culture (beauty)          pole stripes cut by a razor line, stencil type, stickers, a round badge
   ?v=reveal     Vehicle Reveal (automotive)          a light sweep uncovers the footage, HUD brackets, a checklist, streak wipes
   ?v=event      Event Countdown (hospitality)        a ticket with perforations, optional countdown, the lineup, the stub tears
   ?v=product    Product Drop (retail)                strobe title (under 3 flashes a second), the drop time, tiles on the beat
   ?v=expert     Expert Authority (professional)      a clean grid, a pull quote, credentials you list, steady motion */
STUDIO_REG['trade'] = (() => {
  const V = QS.get('v') || 'blueprint';
  const FM = K7.FAM[V] || K7.FAM.blueprint;
  if (!window.STUDIO) setBrandColors(FM.pal);
  const G = K3.G, D = K3.D, up = K7.up, nz = K7.nz, seg = K7.seg, mix = K7.mix, TAU = Math.PI * 2;
  const DSP = 'Bebas', SANS = 'Mont', SER = 'Corm', SCR = 'Hand';
  const NONE = k => ['nofoot.' + k, 0];
  const DEMO = [['c07', 12.05], ['c09', 3.55], ['c12', 8.5], ['v03', 3.0], ['v05', 6.0], ['c05', 4.1]];
  function shots(list, t0, gap) {   // [[key, label, seconds, kind, ph]] -> shots one after another from t0
    let st = t0 || 0; return list.map(([k, label, d, kind, ph], i) => { const s = SHOT(k, window.STUDIO && !(V === 'blueprint' && K5.isDPG()) ? NONE(k) : DEMO[i % DEMO.length], { label, group: 'Footage', kind: kind || 'any', ph, d: d + 0.3 }); const o = { c: s[0], in: s[1], d, start: st }; st += d + (gap || 0); return o; });
  }
  const vert = s => K7.isVert(s.c);
  const topIn = (c, box) => { const r = K3.wholeIn(c, box); return [r[0], box[1], r[2], r[3]]; };
  const musicBed = (dur, o) => ['music', 0, dur, 0.95, Object.assign({ style: FM.music, bpm: FM.bpm, key: 0, end: dur - 0.6 }, o || {})];
  function shade(y0, y1, a0, a1, col) { if (VID.collecting) return; const c = G(), g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, rgbaOf(col || BLK, a0)); g.addColorStop(1, rgbaOf(col || BLK, a1)); c.fillStyle = g; c.fillRect(-20, y0, W + 40, y1 - y0); D(); }
  const fill = (r, col, a) => { if (VID.collecting) return; const c = G(); if (a !== undefined) c.globalAlpha = a; c.fillStyle = col; c.fillRect(r[0], r[1], r[2], r[3]); D(); };
  const fade = (str, x, y, f, col, p, o) => { if (p <= 0 || !str) return; o = o || {}; K7.txt(str, x, y + (1 - E.outC(clamp(p))) * (o.rise === undefined ? 20 : o.rise), f, col, Object.assign({}, o, { a: E.outC(clamp(p)) * (o.a === undefined ? 1 : o.a) })); };
  const ctaFit = (s, w, max, fam, ls) => Math.min(max, fitSize(s, w, 840, max, fam, ls));
  const svcs = n => Array.from({ length: n }, (_, k) => K5.svc(k));
  // a copy of the frame drawn so far (for transitions that move whole layers, since drawing helpers reset the transform)
  const BUF = document.createElement('canvas');
  function snap() { if (BUF.width !== W || BUF.height !== H) { BUF.width = W; BUF.height = H; } const g = BUF.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); g.drawImage(ctx.canvas, 0, 0); return BUF; }

  // ================================================================ THE BLUEPRINT
  function blueprint() {
    const HOMEIND = ['hardscape', 'fencing', 'landscaping', 'roofing', 'cleaning', 'pressure'];
    const TITLE = TX('title', K5.isDPG() || HOMEIND.includes(BRAND.industry) ? 'THE ' + K5.noun() + ' BUILD' : 'THE NEXT PROJECT', { label: 'Project name', group: 'Title block', upper: true, max: 24, req: true });
    const SHEET = TX('sheet', 'A-1', { label: 'Sheet number', group: 'Title block', upper: true, max: 6 });
    const CS = svcs(3).map((d, k) => TX('c' + (k + 1), d, { label: 'Callout ' + (k + 1), group: 'Callouts', upper: true, max: 24, hint: k === 0 ? 'Name what the shot shows' : undefined }));
    const END = TX('end', 'DRAWN UP. BUILT RIGHT.', { label: 'Ending line', group: 'Ending', upper: true, max: 28 });
    const S0 = 1.8, SD = 2.8, OUT = S0 + 3 * SD, DUR = OUT + 3.8;
    const S = shots(CS.map((c, k) => ['s' + (k + 1), 'Shot ' + (k + 1) + ' (callout ' + (k + 1) + ')', SD + 0.4]), S0); S.forEach((s, k) => (s.start = S0 + k * SD));
    function paper(t, p) {
      if (BACKDROP() || VID.collecting) return; const c = G(); c.fillStyle = BLK; c.fillRect(-20, -20, W + 40, H + 40); const g = c.createRadialGradient(W / 2, H * 0.4, 100, W / 2, H / 2, H * 0.8); g.addColorStop(0, rgbaOf(DEEP1, 0.9)); g.addColorStop(1, rgbaOf(DEEP2, 0.6)); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const u = E.inOutC(clamp(p)); c.fillStyle = WA(0.06); for (let x = 0; x <= W; x += 36) c.fillRect(x, 0, 1, H * u); for (let y = 0; y <= H; y += 36) c.fillRect(0, y, W * u, 1);
      c.fillStyle = WA(0.14); for (let x = 0; x <= W; x += 180) c.fillRect(x, 0, 1.5, H * u); for (let y = 0; y <= H; y += 180) c.fillRect(0, y, W * u, 1.5);
      c.strokeStyle = WA(0.6); c.lineWidth = 2; for (const [x, y] of [[60, 160], [W - 60, 160], [60, H - 160], [W - 60, H - 160]]) { c.beginPath(); c.arc(x, y, 16 * u, 0, TAU); c.moveTo(x - 28 * u, y); c.lineTo(x + 28 * u, y); c.moveTo(x, y - 28 * u); c.lineTo(x, y + 28 * u); c.stroke(); }
      D();
    }
    function dimLine(x0, x1, y, p, lab, vertical) {   // a dimension line drawn out from the centre, ticks at the ends, label in a gap
      if (VID.collecting || p <= 0) return; const c = G(), e = E.inOutC(clamp(p)); c.strokeStyle = WHT; c.fillStyle = WHT; c.lineWidth = 2;
      if (vertical) { c.translate(y, (x0 + x1) / 2); c.rotate(-Math.PI / 2); c.translate(-(x0 + x1) / 2, -y); }
      const m = (x0 + x1) / 2, h = (x1 - x0) / 2 * e, f = F(600, 24, SANS), tw = lab ? textW(lab, f, 4) + 30 : 0;
      c.beginPath(); c.moveTo(m - h, y); c.lineTo(m - tw / 2, y); c.moveTo(m + tw / 2, y); c.lineTo(m + h, y); c.stroke();
      for (const x of [m - h, m + h]) { c.beginPath(); c.moveTo(x - 9, y + 9); c.lineTo(x + 9, y - 9); c.moveTo(x, y - 18); c.lineTo(x, y + 18); c.stroke(); }
      if (lab && e > 0.5) { c.globalAlpha = (e - 0.5) * 2; setF(f, 4); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(lab, m + 2, y + 1); } D();
    }
    function titleBlock(x, y, w, a) {
      if (VID.collecting || a <= 0) return; const c = G(); c.globalAlpha = a; c.strokeStyle = WHT; c.lineWidth = 2; c.strokeRect(x, y, w, 230); c.beginPath(); c.moveTo(x, y + 78); c.lineTo(x + w, y + 78); c.moveTo(x, y + 150); c.lineTo(x + w, y + 150); c.moveTo(x + w - 170, y + 150); c.lineTo(x + w - 170, y + 230); c.stroke(); D();
      K7.txt('PROJECT', x + 18, y + 30, F(600, 16, SANS), OR, { ls: 4, a }); K7.txt(TITLE, x + 18, y + 64, F(700, Math.min(34, fitSize(TITLE, 700, w - 40, 34, DSP, 2)), DSP), WHT, { ls: 2, a });
      K7.txt('DRAWN BY', x + 18, y + 102, F(600, 16, SANS), OR, { ls: 4, a }); K7.txt(up(BRAND.name), x + 18, y + 134, F(700, Math.min(28, fitSize(up(BRAND.name), 700, w - 40, 28, SANS, 2)), SANS), WHT, { ls: 2, a });
      K7.txt('CONTACT', x + 18, y + 174, F(600, 16, SANS), OR, { ls: 4, a }); K7.txt(CONTACT.phone || CONTACT.web || '', x + 18, y + 210, F(700, 26, SANS), WHT, { ls: 1, a });
      K7.txt('SHEET', x + w - 152, y + 174, F(600, 16, SANS), OR, { ls: 4, a }); K7.txt(SHEET, x + w - 152, y + 214, F(700, 40, DSP), WHT, { ls: 2, a });
    }
    return {
      dur: DUR, shakes: [],
      render(t) {
        paper(t, seg(t, 0, 1.2)); const q = seg(t, OUT - 0.3, 0.4);
        if (t < S0 + 0.3 && !VID.collecting) { const a = 1 - seg(t, S0 - 0.3, 0.4); fade('SHEET ' + SHEET, 90, 420, F(600, 26, SANS), OR, seg(t, 0.5, 0.5), { ls: 6, a }); const L = K7.fitLines(TITLE, 700, DSP, 900, 190, 2, { ls: 2 }); L.lines.forEach((ln, i) => fade(ln, 90, 600 + i * L.size * 0.92, F(700, L.size, DSP), WHT, seg(t, 0.7 + i * 0.12, 0.5), { ls: 2, a })); dimLine(90, 990, 700 + L.lines.length * L.size * 0.92, seg(t, 1.0, 0.6) * a, up(BRAND.short || BRAND.name)); }
        // shots: a plotter line scans each one in; dimension lines along the frame; a numbered callout
        if (t >= S0 - 0.05 && t < OUT + 0.3) {
          const k = clamp(Math.floor((t - S0) / SD), 0, 2), sh = S[k], t0 = S0 + k * SD, box = vert(sh) ? [240, 300, 600, 1066] : [90, 380, 900, 700], r = topIn(sh.c, box), u = E.inOutS(seg(t, t0, 0.8));
          if (k > 0 && u < 1) { const pv = S[k - 1], r2 = topIn(pv.c, vert(pv) ? [240, 300, 600, 1066] : [90, 380, 900, 700]); ctx.save(); ctx.globalAlpha = 1 - q; K7.photo(pv, t, r2, { lt: SD }); ctx.restore(); }
          ctx.save(); ctx.globalAlpha = 1 - q; if (!VID.collecting && u < 1) { ctx.beginPath(); ctx.rect(0, r[1], W, r[3] * u); ctx.clip(); } K7.photo(sh, t, r); ctx.restore();
          if (!VID.collecting) {
            const a = 1 - q; if (u > 0 && u < 1) fill([0, r[1] + r[3] * u - 2, W, 4], OR, a);
            const c = G(); c.globalAlpha = a; c.strokeStyle = WHT; c.lineWidth = 2; c.strokeRect(r[0] - 12, r[1] - 12, r[2] + 24, r[3] + 24); D();
            dimLine(r[0], r[0] + r[2], r[1] - 54, seg(t, t0 + 0.5, 0.7) * a, '');
            dimLine(r[1], r[1] + r[3], r[0] - 54, seg(t, t0 + 0.6, 0.7) * a, '', true);
            const p = seg(t, t0 + 0.9, 0.6), mx = r[0] + r[2] - 60, my = r[1] + r[3] + 12, ly = r[1] + r[3] + 150, c2 = G(); c2.globalAlpha = a * E.outC(p); c2.strokeStyle = OR; c2.lineWidth = 3; c2.beginPath(); c2.moveTo(mx, my); c2.lineTo(mx, my + (ly - my - 40) * E.outC(p)); c2.lineTo(mx - 80 * E.outC(p), ly - 40); c2.stroke(); c2.fillStyle = OR; c2.beginPath(); c2.arc(mx, my, 10, 0, TAU); c2.fill(); D();
            const lp = seg(t, t0 + 1.2, 0.5); if (lp > 0) { const c3 = G(); c3.globalAlpha = a * E.outC(lp); c3.strokeStyle = OR; c3.lineWidth = 3; c3.beginPath(); c3.arc(130, ly - 52, 34, 0, TAU); c3.stroke(); setF(F(700, 34, DSP), 0); c3.fillStyle = OR; c3.textAlign = 'center'; c3.textBaseline = 'middle'; c3.fillText(String(k + 1), 130, ly - 49); D(); fade(CS[k], 190, ly - 30, F(700, Math.min(64, fitSize(CS[k], 700, 760, 64, DSP, 3)), DSP), WHT, lp, { ls: 3, a }); }
            titleBlock(W - 90 - 520, H - 420, 520, a * seg(t, S0 + 0.3, 0.5));
          }
        }
        // closing: the plotter draws the logo, the ending line, a title-block CTA
        if (t >= OUT && !VID.collecting) {
          const o = t - OUT, [lw, lh] = logoBox(640), ly = 640, sc = E.inOutS(seg(o, 0.2, 1.0));
          if (sc > 0) { const c = G(); c.beginPath(); c.rect(W / 2 - lw / 2 - 20, ly - lh / 2 - 20, lw + 40, (lh + 40) * sc); c.clip(); c.drawImage(IMG.logoW, W / 2 - lw / 2, ly - lh / 2, lw, lh); D(); if (sc < 1) fill([W / 2 - lw / 2 - 40, ly - lh / 2 - 20 + (lh + 40) * sc - 2, lw + 80, 4], OR); }
          dimLine(W / 2 - Math.max(360, lw / 2), W / 2 + Math.max(360, lw / 2), ly - lh / 2 - 70, seg(o, 0.9, 0.6), up(BRAND.short || BRAND.name));
          fade(END, W / 2, ly + lh / 2 + 140, F(700, Math.min(80, fitSize(END, 700, 940, 80, DSP, 3)), DSP), WHT, seg(o, 1.2, 0.5), { align: 'center', ls: 3 });
          const cp = seg(o, 1.5, 0.4); if (cp > 0) { const f = F(700, ctaFit(CONTACT.cta, 700, 34, SANS, 4), SANS), bw = textW(CONTACT.cta, f, 4) + 100, y = ly + lh / 2 + 220, c = G(); c.globalAlpha = E.outC(cp); c.fillStyle = OR; c.fillRect(W / 2 - bw / 2, y, bw, 88); setF(f, 4); c.fillStyle = K7.on(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CONTACT.cta, W / 2 + 2, y + 45); D(); }
          fade(K7.contact().join('   ·   '), W / 2, ly + lh / 2 + 380, F(600, 28, SANS), WA(0.85), seg(o, 1.8, 0.4), { align: 'center', ls: 2 });
        }
      },
      cues() {
        const ev = [['pencil', 0.1, 0.2, -0.3, {}], ['scribble', 0.4, 0.14, 0, { dur: 1.0 }], ['tick', 1.0, 0.2, 0]];
        S.forEach(s => { ev.push(['scribble', s.start, 0.12, 0.2, { dur: 0.8 }]); ev.push(['switch', s.start + 0.9, 0.16, 0.3]); ev.push(['tink', s.start + 1.2, 0.12, -0.2]); });
        ev.push(['scribble', OUT + 0.2, 0.14, 0, { dur: 1.0 }]); ev.push(['stamp', OUT + 1.5, 0.35, 0]); ev.push(['chime', OUT + 1.8, 0.18, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ SALON EDITORIAL
  function salon() {
    const KICK = TX('kick', 'SALON EDITORIAL', { label: 'Small line', group: 'Cover', upper: true, max: 24 });
    const TITLE = TX('title', 'The New Season', { label: 'Cover title', group: 'Cover', max: 22 });
    const CAPS = svcs(2).map((d, k) => TX('cap' + (k + 1), d, { label: 'Caption ' + (k + 1), group: 'Spread', upper: true, max: 22 }));
    const STY = TX('stylist', '', { label: 'Stylist', group: 'Credits', max: 26, hint: 'Optional. Leave empty to leave it out.' });
    const END = TX('end', 'book your chair', { label: 'Closing line (script)', group: 'Ending', max: 22 });
    const C0 = 0, SP = 4.4, CR = 8.8, OUT = 11.0, DUR = OUT + 3.6;
    const S = shots([['s1', 'Cover shot (vertical works best)', SP + 0.2, 'any', 'v'], ['s2', 'Spread, left', CR - SP, 'any', 'v'], ['s3', 'Spread, right', CR - SP, 'any', 'v']], 0); S[1].start = S[2].start = SP;
    const list = svcs(4);
    function wipe(t, tc) { const u = (t - (tc - 0.25)) / 0.5; if (u <= 0 || u >= 1 || VID.collecting) return; const c = G(), x = lerp(-W * 1.2, W * 1.2, E.inOutC(u)); c.fillStyle = OR; c.fillRect(x, 0, W * 0.9, H); c.fillStyle = WHT; c.fillRect(x + W * 0.9, 0, 24, H); D(); }
    return {
      dur: DUR, shakes: [],
      render(t) {
        if (!BACKDROP() && !VID.collecting) { const c = G(); c.fillStyle = BLK; c.fillRect(-20, -20, W + 40, H + 40); D(); }
        const q = seg(t, OUT - 0.25, 0.3);
        // cover: a colour block from the left with the title set vertically, the cover shot tall on the right
        if (t < SP + 0.3) {
          const bp = E.inOutC(seg(t, 0.1, 0.6)); fill([0, 0, 400 * bp, H], OR);
          const s = S[0], r = topIn(s.c, vert(s) ? [440, 300, 580, 1031] : [440, 560, 580, 600]); ctx.save(); ctx.globalAlpha = seg(t, 0.4, 0.6); K7.photo(s, t, r); ctx.restore();
          if (!VID.collecting) {
            const L = K7.fitLines(TITLE, 700, SER, 1300, 230, 1, { style: 'italic' }), c = G(), p = seg(t, 0.6, 0.8); c.beginPath(); c.rect(0, 0, 400, H); c.clip(); c.translate(260, 1700 + (1 - E.outC(p)) * 300); c.rotate(-Math.PI / 2); setF(F(700, L.size, SER, 'italic'), 0); c.fillStyle = K7.on(OR); c.globalAlpha = E.outC(p); c.textBaseline = 'alphabetic'; c.fillText(TITLE, 0, 0); D();
            fade(KICK, 440, 250, F(700, 22, SANS), WHT, seg(t, 0.8, 0.5), { ls: 6 }); fade('NO. 01', 1020, 250, F(700, 22, SANS), OR, seg(t, 0.9, 0.5), { ls: 6, align: 'right' });
            fade(up(BRAND.name), 440, r[1] + r[3] + 80, F(700, Math.min(30, fitSize(up(BRAND.name), 700, 580, 30, SANS, 4)), SANS), WHT, seg(t, 1.2, 0.5), { ls: 4 });
          }
        }
        // the spread: a diptych of two tall frames with captions
        if (t >= SP - 0.05 && t < CR + 0.3) {
          const a = 1 - seg(t, CR - 0.2, 0.4);
          const stack = !vert(S[1]) && !vert(S[2]);
          [S[1], S[2]].forEach((s, i) => { const box = stack ? [72, 380 + i * 600, 936, 520] : [72 + i * 480, 360, 456, 810], r = topIn(s.c, box), p = seg(t, SP + 0.2 + i * 0.25, 0.6); ctx.save(); ctx.globalAlpha = a * E.outC(p); K7.photo(s, t, [r[0], r[1] + (1 - E.outC(p)) * 60, r[2], r[3]]); ctx.restore();
            if (!VID.collecting) { fill([box[0], r[1] + r[3] + 30, 60 * E.outC(p), 4], OR, a); fade(CAPS[i], stack ? box[0] + 80 : box[0], stack ? r[1] + r[3] + 38 : r[1] + r[3] + 90, F(700, Math.min(28, fitSize(CAPS[i], 700, 456, 28, SANS, 4)), SANS), WHT, seg(t, SP + 0.6 + i * 0.25, 0.5), { ls: 4, a }); fade('0' + (i + 2), box[0] + box[2], stack ? r[1] + r[3] + 40 : r[1] - 30, F(500, 40, SER, 'italic'), OR, p, { align: 'right', a }); } });
          if (!VID.collecting) { const L = K7.fitLines(TITLE, 700, SER, 936, 110, 1, { style: 'italic' }); fade(TITLE, 72, 290, F(700, Math.min(90, L.size), SER, 'italic'), WHT, seg(t, SP + 0.1, 0.6), { a }); }
        }
        // the credits
        if (t >= CR - 0.1 && t < OUT + 0.2 && !VID.collecting) {
          const a = 1 - q; fade('THE CREDITS', 72, 520, F(700, 24, SANS), OR, seg(t, CR, 0.5), { ls: 8, a });
          const rows = list.map(s2 => [s2, '']).concat(STY ? [['STYLIST', STY]] : []);
          rows.forEach(([lab, val], i) => { const y = 640 + i * 110, p = seg(t, CR + 0.2 + i * 0.15, 0.5); fade(val ? lab : lab, 72, y, F(val ? 700 : 400, val ? 24 : 72, val ? SANS : SER, val ? undefined : 'italic'), WHT, p, { a, ls: val ? 6 : 0 }); if (val) fade(val, W - 72, y, F(500, 56, SER, 'italic'), WHT, p, { a, align: 'right' }); fill([72, y + 34, (W - 144) * E.inOutC(p), 1], WA(0.3), a); });
        }
        [SP, CR].forEach(tc => wipe(t, tc));
        if (t >= OUT && !VID.collecting) {
          const o = t - OUT, [lw, lh] = logoBox(520); fill([0, 0, W, 420 * E.inOutC(seg(o, 0, 0.5))], OR);
          K7.logo(W / 2, 720, 520, E.outC(seg(o, 0.3, 0.6)));
          fade(END, W / 2, 720 + lh / 2 + 170, F(400, Math.min(140, fitSize(END, 400, 920, 140, SCR, 0)), SCR), OR, seg(o, 0.6, 0.8), { align: 'center' });
          const cp = seg(o, 1.0, 0.5); if (cp > 0) { const f = F(700, ctaFit(CONTACT.cta, 700, 30, SANS, 5), SANS), bw = textW(CONTACT.cta, f, 5) + 100, y = 720 + lh / 2 + 250, c = G(); c.globalAlpha = E.outC(cp); c.strokeStyle = WHT; c.lineWidth = 2; c.strokeRect(W / 2 - bw / 2, y, bw, 84); setF(f, 5); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CONTACT.cta, W / 2 + 2.5, y + 43); D(); }
          fade(K7.contact().join('   ·   '), W / 2, 720 + lh / 2 + 410, F(600, 26, SANS), WA(0.75), seg(o, 1.3, 0.5), { align: 'center', ls: 3 });
        }
      },
      cues() {
        const ev = [['whoosh', 0.1, 0.25, -0.5], ['air', 0.5, 0.2, 0.3], ['tink', 1.2, 0.12, 0.2], ['whoosh', SP - 0.2, 0.3, -0.4], ['air', SP + 0.3, 0.16, 0], ['whoosh', CR - 0.2, 0.3, -0.4]];
        list.forEach((_, i) => ev.push(['tick', CR + 0.2 + i * 0.15, 0.2, 0]));
        ev.push(['air', OUT, 0.2, 0]); ev.push(['chime', OUT + 0.7, 0.2, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ BARBERSHOP CULTURE
  function barber() {
    const TITLE = TX('title', 'FRESH CUTS', { label: 'Headline', group: 'Opening', upper: true, max: 14 });
    const STK = svcs(3).map((d, k) => TX('st' + (k + 1), d, { label: 'Sticker ' + (k + 1), group: 'Stickers', upper: true, max: 16 }));
    const END = TX('end', 'PULL UP A CHAIR.', { label: 'Ending line', group: 'Ending', upper: true, max: 20 });
    const T0 = 1.4, SD = 2.3, OUT = T0 + 3 * SD + 0.4, DUR = OUT + 3.4;
    const S = shots(STK.map((s, k) => ['s' + (k + 1), 'Shot ' + (k + 1), SD + 0.4, 'any', 'v']), T0); S.forEach((s, k) => (s.start = T0 + k * SD));
    function pole(t, a, r) {   // moving red / cream / blue stripes
      if (VID.collecting || a <= 0) return; const c = G(); c.globalAlpha = a; if (r) { c.beginPath(); c.rect(r[0], r[1], r[2], r[3]); c.clip(); } c.fillStyle = PAPER; c.fillRect(-20, -20, W + 40, H + 40); c.translate(W / 2, H / 2); c.rotate(-0.55); const off = (t * 260) % 360;
      for (let x = -2200 + off; x < 2200; x += 360) { c.fillStyle = OR; c.fillRect(x, -2200, 120, 4400); c.fillStyle = ACC2; c.fillRect(x + 180, -2200, 120, 4400); } D();
    }
    function razor(t, tc, A, B) {   // a razor line slices diagonally; the two halves of A slide apart to show B
      const u = seg(t, tc - 0.05, 0.45); if (u <= 0) { A(); return; } if (u >= 1) { B(); return; }
      if (VID.collecting) { A(); B(); return; }
      A(); const buf = snap(); B();
      const sl = E.inC(clamp(u * 2.4)), sp = E.inOutC(clamp(u * 1.6 - 0.35)) * 900, ang = -0.42, nx = -Math.sin(ang), ny = Math.cos(ang);
      for (const sd of [-1, 1]) { ctx.save(); ctx.setTransform(1, 0, 0, 1, sd * sp * nx, sd * sp * ny); ctx.translate(W / 2, H / 2); ctx.rotate(ang); ctx.beginPath(); if (sd < 0) ctx.rect(-2400, -2400, 4800, 2400); else ctx.rect(-2400, 0, 4800, 2400); ctx.rotate(-ang); ctx.translate(-W / 2, -H / 2); ctx.clip(); ctx.drawImage(buf, 0, 0); ctx.restore(); }
      const c = G(); c.translate(W / 2, H / 2); c.rotate(ang); c.globalAlpha = 1 - clamp(u * 2.5 - 1.2); c.fillStyle = '#FFFFFF'; c.shadowColor = '#FFFFFF'; c.shadowBlur = 30; c.fillRect(-1400, -3, 2800 * Math.min(1, sl * 1.1), 6); D();
    }
    function sticker(str, x, y, rot, p, col, ink, round) {
      if (VID.collecting || p <= 0) return; const s = lerp(1.6, 1, E.outBack(clamp(p))), f = F(400, Math.min(62, fitSize(str, 400, 860, 62, DSP, 2)), DSP), w = textW(str, f, 2) + 70, c = G(); c.globalAlpha = clamp(p * 3); c.translate(x, y); c.rotate(rot); c.scale(s, s);
      c.fillStyle = '#000000'; c.globalAlpha *= 0.35; if (round) { c.beginPath(); c.arc(8, 10, w / 2, 0, TAU); c.fill(); } else c.fillRect(-w / 2 + 8, -54 + 10, w, 108); c.globalAlpha = clamp(p * 3);
      c.fillStyle = col; if (round) { c.beginPath(); c.arc(0, 0, w / 2, 0, TAU); c.fill(); } else c.fillRect(-w / 2, -54, w, 108); c.strokeStyle = '#FFFFFF'; c.lineWidth = 5; if (round) { c.beginPath(); c.arc(0, 0, w / 2 - 8, 0, TAU); c.stroke(); } else c.strokeRect(-w / 2 + 8, -46, w - 16, 92);
      setF(f, 2); c.fillStyle = ink; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(str, 1, 3); D();
    }
    const stage = (s, t) => { const r = vert(s) ? K3.wholeIn(s.c, [0, 0, W, H]) : topIn(s.c, [0, 600, W, 700]); if (!vert(s)) fill([0, 0, W, H], BLK); K7.photo(s, t, r, { lt: t - s.start }); if (r[3] >= H - 2) shade(H * 0.55, H, 0, 0.85, BLK); };
    return {
      dur: DUR, shakes: [[0.7, 10], [T0 + 0.1, 8]],
      render(t) {
        if (!BACKDROP() && !VID.collecting) { const c = G(); c.fillStyle = BLK; c.fillRect(-20, -20, W + 40, H + 40); D(); }
        const q = seg(t, OUT - 0.2, 0.3);
        if (t < T0 + 0.5) razor(t, T0, () => { pole(t, 1); if (!VID.collecting) { const ts = Math.min(240, fitSize(TITLE, 400, 960, 240, DSP, 4)), p = seg(t, 0.5, 0.25), c = G(), s = lerp(1.4, 1, E.outBack(p)); c.globalAlpha = clamp(p * 3); c.translate(W / 2, 1000); c.scale(s, s); setF(F(400, ts, DSP), 4); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = BLK; c.fillText(TITLE, 12, 14); c.strokeStyle = BLK; c.lineWidth = 12; c.lineJoin = 'round'; c.strokeText(TITLE, 0, 0); c.fillStyle = '#FFFFFF'; c.fillText(TITLE, 0, 0); D(); } }, () => stage(S[0], t));
        else if (t < OUT + 0.3) {
          const k = Math.min(2, Math.floor((t - T0) / SD));
          if (k > 0 && t < S[k].start + 0.45) razor(t, S[k].start, () => stage(S[k - 1], t), () => stage(S[k], t)); else stage(S[k], t);
          if (!VID.collecting) { const sk = S[k], p = seg(t, sk.start + 0.35, 0.3); sticker(STK[k], k % 2 ? 700 : 380, 1320, k % 2 ? 0.08 : -0.07, p * (1 - q), k === 1 ? ACC2 : OR, '#FFFFFF', false);
            const ts = Math.min(110, fitSize(TITLE, 400, 600, 110, DSP, 3)), c = G(); c.globalAlpha = 1 - q; setF(F(400, ts, DSP), 3); c.textBaseline = 'alphabetic'; c.fillStyle = OR; c.fillText(TITLE, 76, 338); c.fillStyle = '#FFFFFF'; c.fillText(TITLE, 72, 332); D(); }
        }
        if (t >= OUT && !VID.collecting) {
          const o = t - OUT, cx = W / 2, cy = 720, R = 300, p = E.outBack(seg(o, 0.1, 0.5)), c = G(); c.translate(cx, cy); c.scale(p, p);
          c.fillStyle = PAPER; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill(); c.strokeStyle = OR; c.lineWidth = 14; c.beginPath(); c.arc(0, 0, R - 14, 0, TAU); c.stroke(); c.strokeStyle = ACC2; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, R - 40, 0, TAU); c.stroke();
          const ring = (up(BRAND.name) + '  ★  ' + svcs(2).join('  ★  ') + '  ★  ').slice(0, 64), fr = F(400, 34, DSP); setF(fr, 4); c.fillStyle = BLK; c.textAlign = 'center'; c.textBaseline = 'middle';
          const tot = textW(ring, fr, 4), circ = TAU * (R - 78), scl = Math.min(1, circ / tot), spread = circ / (tot * scl); let ang = o * 0.15;
          for (const ch of ring) { const w = textW(ch, fr, 4) * scl * spread; ang += w / 2 / (R - 78); c.save(); c.rotate(ang); c.translate(0, -(R - 78)); c.scale(scl, scl); c.fillText(ch, 0, 0); c.restore(); ang += w / 2 / (R - 78); }
          const [lw, lh] = logoBox(300); c.drawImage(IMG.logoB, -lw / 2, -lh / 2, lw, lh); D();
          const es = Math.min(120, fitSize(END, 400, 960, 120, DSP, 3)), ep = seg(o, 0.6, 0.3); if (ep > 0) { const c2 = G(), s = lerp(1.3, 1, E.outBack(ep)); c2.globalAlpha = clamp(ep * 3); c2.translate(W / 2, 1180); c2.scale(s, s); setF(F(400, es, DSP), 3); c2.textAlign = 'center'; c2.fillStyle = OR; c2.fillText(END, 6, 6); c2.fillStyle = '#FFFFFF'; c2.fillText(END, 0, 0); D(); }
          sticker(CONTACT.cta, W / 2, 1330, -0.03, seg(o, 0.9, 0.3), OR, '#FFFFFF', false);
          fade(K7.contact().join('   ·   '), W / 2, 1460, F(700, 30, SANS), '#FFFFFF', seg(o, 1.2, 0.4), { align: 'center', ls: 3 });
        }
      },
      cues() {
        const ev = [['whoosh', 0.2, 0.3, -0.4], ['stamp', 0.55, 0.5, 0], ['whoosh', T0 - 0.1, 0.35, 0.4], ['clack', T0, 0.35, 0]];
        S.forEach((s, k) => { if (k) { ev.push(['whoosh', s.start - 0.1, 0.3, 0.3]); ev.push(['clack', s.start, 0.3, 0]); } ev.push(['pop', s.start + 0.35, 0.35, (k - 1) * 0.4]); });
        ev.push(['impact', OUT + 0.1, 0.45, 0]); ev.push(['stamp', OUT + 0.6, 0.4, 0]); ev.push(['pop', OUT + 0.9, 0.3, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ VEHICLE REVEAL
  function reveal() {
    const TITLE = TX('title', K5.svc(0), { label: 'Headline', group: 'Opening', upper: true, max: 20, hint: 'The vehicle, or the service' });
    const SUB = TX('sub', 'THE REVEAL', { label: 'Small line', group: 'Opening', upper: true, max: 24 });
    const CK = svcs(3).map((d, k) => TX('k' + (k + 1), d, { label: 'Checklist ' + (k + 1), group: 'Checklist', upper: true, max: 22 }));
    const END = TX('end', 'SEE IT IN PERSON.', { label: 'Ending line', group: 'Ending', upper: true, max: 22 });
    const T0 = 0.4, OUT = 10.0, DUR = OUT + 3.6;
    const S = shots([['s1', 'The reveal shot', 4.6], ['s2', 'Detail', 2.6], ['s3', 'Final look', 2.8]], T0); S[1].start = 5.0; S[2].start = 7.3;
    function hud(r, t, a) {   // corner brackets, a ticking ring, a scan line
      if (VID.collecting || a <= 0) return; const c = G(); c.globalAlpha = a; c.strokeStyle = WHT; c.lineWidth = 3; const L = 46;
      for (const [x, y, sx, sy] of [[r[0] - 16, r[1] - 16, 1, 1], [r[0] + r[2] + 16, r[1] - 16, -1, 1], [r[0] - 16, r[1] + r[3] + 16, 1, -1], [r[0] + r[2] + 16, r[1] + r[3] + 16, -1, -1]]) { c.beginPath(); c.moveTo(x, y + sy * L); c.lineTo(x, y); c.lineTo(x + sx * L, y); c.stroke(); }
      c.translate(r[0] + r[2] - 50, r[1] + 50); c.rotate(t * 0.8); c.strokeStyle = OR; c.lineWidth = 3; c.setLineDash([10, 12]); c.beginPath(); c.arc(0, 0, 30, 0, TAU); c.stroke(); c.setLineDash([]); D();
    }
    function streak(t, tc) { const u = (t - (tc - 0.2)) / 0.4; if (u <= 0 || u >= 1 || VID.collecting) return; const c = G(), x = lerp(-W * 0.4, W * 1.4, E.inOutC(u)), g = c.createLinearGradient(x - 320, 0, x, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.85, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0.95)'); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(x - 320, 0, 320, H); D(); fill([0, 0, W, H], '#FFFFFF', 0.12 * Math.sin(Math.PI * u)); }
    return {
      dur: DUR, shakes: [],
      render(t) {
        if (!BACKDROP() && !VID.collecting) { const c = G(), g = c.createRadialGradient(W / 2, H * 0.55, 50, W / 2, H * 0.55, H * 0.7); g.addColorStop(0, DEEP1); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); }
        const q = seg(t, OUT - 0.25, 0.3);
        if (t >= T0 && t < OUT + 0.3) {
          const k = t < S[1].start ? 0 : t < S[2].start ? 1 : 2, sh = S[k], r = vert(sh) ? K3.wholeIn(sh.c, [0, 0, W, H]) : topIn(sh.c, [0, 640, W, 700]);
          // the light sweep: footage shows where the light has passed (first shot), hard streaks between shots
          if (k === 0) { const u = seg(t, T0 + 0.2, 1.6), lx = lerp(-300, W + 300, E.inOutS(u)); ctx.save(); ctx.globalAlpha = 1 - q; if (!VID.collecting && u < 1) { ctx.beginPath(); ctx.rect(0, 0, lx, H); ctx.clip(); } K7.photo(sh, t, r); ctx.restore();
            if (!VID.collecting && u > 0 && u < 1) { const c = G(), g = c.createLinearGradient(lx - 260, 0, lx + 40, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.85, 'rgba(255,255,255,0.75)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(lx - 260, r[1] - 120, 300, r[3] + 240); D(); } }
          else { ctx.save(); ctx.globalAlpha = 1 - q; K7.photo(sh, t, r); ctx.restore(); }
          if (!VID.collecting) { if (r[3] >= H - 2) { shade(0, 520, 0.8, 0, DEEP2); shade(H * 0.55, H, 0, 0.9, DEEP2); } hud(r[3] >= H - 2 ? [90, 420, 900, 1000] : r, t, (1 - q) * seg(t, T0 + 1.6, 0.4)); }
        }
        if (VID.collecting) return;
        if (t < OUT + 0.2) {
          const a = 1 - q, ts = Math.min(220, fitSize(TITLE, 700, 960, 220, DSP, 14)), p = seg(t, 1.6, 0.6), y = 470, c = G(); c.globalAlpha = a; c.beginPath(); c.rect(0, y - ts, W * E.inOutC(p), ts * 1.2); c.clip(); setF(F(700, ts, DSP), lerp(40, 14, E.outC(p))); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(TITLE, W / 2 + 7, y); D();
          fade(SUB, W / 2, y + 60, F(700, 26, SANS), OR, seg(t, 2.0, 0.5), { align: 'center', ls: 10, a });
          fill([W / 2 - 60, y + 90, 120 * E.inOutC(seg(t, 2.1, 0.4)), 4], OR, a);
          CK.forEach((ck, i) => { const tk = 5.2 + i * 0.5, cp = seg(t, tk, 0.4), y2 = 1500 + i * 96; if (cp <= 0) return; const c2 = G(); c2.globalAlpha = a * E.outC(cp); c2.strokeStyle = OR; c2.lineWidth = 3; c2.strokeRect(90, y2 - 34, 44, 44); c2.beginPath(); c2.moveTo(100, y2 - 12); c2.lineTo(110, y2); c2.lineTo(128, y2 - 26 * E.outC(clamp(cp * 1.5 - 0.3))); c2.stroke(); D(); fade(ck, 160, y2, F(700, Math.min(56, fitSize(ck, 700, 840, 56, DSP, 4)), DSP), WHT, cp, { ls: 4, a }); });
        }
        [S[1].start, S[2].start].forEach(tc => streak(t, tc));
        if (t >= OUT) {
          const o = t - OUT, [lw, lh] = logoBox(700), ly = 700, u = seg(o, 0.2, 1.0), lx = lerp(-200, W + 200, E.inOutS(u));
          const c = G(); c.globalAlpha = seg(o, 0.2, 0.4); c.drawImage(IMG.logoW, W / 2 - lw / 2, ly - lh / 2, lw, lh); if (u > 0 && u < 1) { c.globalCompositeOperation = 'source-atop'; } D();
          if (u > 0 && u < 1) { const c2 = G(), g = c2.createLinearGradient(lx - 160, 0, lx + 160, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c2.globalCompositeOperation = 'lighter'; c2.fillStyle = g; c2.fillRect(lx - 160, ly - lh / 2 - 40, 320, lh + 80); D(); }
          fade(END, W / 2, ly + lh / 2 + 150, F(700, Math.min(110, fitSize(END, 700, 960, 110, DSP, 8)), DSP), WHT, seg(o, 0.9, 0.5), { align: 'center', ls: 8 });
          const cp = seg(o, 1.2, 0.4); if (cp > 0) { const f = F(700, ctaFit(CONTACT.cta, 700, 32, SANS, 5), SANS), bw = textW(CONTACT.cta, f, 5) + 100, y = ly + lh / 2 + 230, c3 = G(); c3.globalAlpha = E.outC(cp); c3.fillStyle = OR; c3.beginPath(); c3.moveTo(W / 2 - bw / 2 + 24, y); c3.lineTo(W / 2 + bw / 2, y); c3.lineTo(W / 2 + bw / 2 - 24, y + 86); c3.lineTo(W / 2 - bw / 2, y + 86); c3.closePath(); c3.fill(); setF(f, 5); c3.fillStyle = K7.on(OR); c3.textAlign = 'center'; c3.textBaseline = 'middle'; c3.fillText(CONTACT.cta, W / 2 + 2, y + 44); D(); }
          fade(K7.contact().join('   ·   '), W / 2, ly + lh / 2 + 390, F(600, 28, SANS), WA(0.8), seg(o, 1.5, 0.4), { align: 'center', ls: 3 });
        }
      },
      cues() {
        const ev = [['riser', 0.2, 0.3, 0, {}], ['whoosh', 0.9, 0.35, -0.5], ['impact', 1.65, 0.4, 0], ['ticks', 1.7, 0.18, 0, { dur: 0.6, n: 10 }]];
        [S[1].start, S[2].start].forEach(tc => { ev.push(['whoosh', tc, 0.35, 0.5]); ev.push(['impact', tc + 0.05, 0.3, 0]); });
        CK.forEach((_, i) => ev.push(['switch', 5.2 + i * 0.5, 0.2, -0.3]));
        ev.push(['whoosh', OUT + 0.2, 0.3, -0.4]); ev.push(['shimmer', OUT + 0.6, 0.25, 0.3]); ev.push(['impact', OUT + 1.2, 0.3, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ EVENT COUNTDOWN
  function event() {
    const NAME = TX('event', 'SUMMER NIGHTS', { label: 'Event name', group: 'The ticket', upper: true, max: 20, req: true });
    const DATE = TX('date', 'SATURDAY · 9 PM', { label: 'Date and time', group: 'The ticket', upper: true, max: 26, req: true, hint: 'Sample: put your real date and time here' });
    const PLACE = TX('place', up(BRAND.name), { label: 'Where', group: 'The ticket', upper: true, max: 30 });
    const DAYS = TX('days', '', { label: 'Days to go', group: 'Countdown', max: 3, hint: 'Optional, e.g. 3. Leave empty to show SAVE THE DATE instead.' });
    const LU = [1, 2, 3].map(k => TX('l' + k, '', { label: 'Lineup ' + k, group: 'Lineup', upper: true, max: 24, hint: k === 1 ? 'Optional: acts, DJs, features. Empty lines are left out.' : undefined }));
    const T1 = 3.4, SD = 2.6, OUT = T1 + 2 * SD + 1.6, DUR = OUT + 3.4;
    const S = shots([['s1', 'The crowd / the venue', SD * 2 + 0.6], ['s2', 'Highlight', SD * 2]], 0); S[0].start = 0; S[1].start = T1 + SD;
    const lineup = LU.filter(x => nz(x)), TX0 = 140, TY = 380, TW = 800, TH = 1160;
    function ticket(t, y0, a, tear) {   // ticket outline with notches and a perforation above the stub
      if (VID.collecting || a <= 0) return; const c = G(); c.globalAlpha = a; c.translate(0, y0);
      const path = () => { c.beginPath(); c.moveTo(TX0, TY); c.lineTo(TX0 + TW, TY); c.lineTo(TX0 + TW, TY + TH - 260 - 30); c.arc(TX0 + TW, TY + TH - 260, 30, -Math.PI / 2, Math.PI / 2, true); c.lineTo(TX0 + TW, TY + TH); c.lineTo(TX0, TY + TH); c.lineTo(TX0, TY + TH - 260 + 30); c.arc(TX0, TY + TH - 260, 30, Math.PI / 2, -Math.PI / 2, true); c.closePath(); };
      c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40; c.shadowOffsetY = 20; path(); c.fillStyle = PAPER; c.fill(); c.shadowColor = 'transparent';
      c.strokeStyle = rgbaOf(K7.on(PAPER), 0.35); c.lineWidth = 3; c.setLineDash([14, 12]); c.beginPath(); c.moveTo(TX0 + 40, TY + TH - 260); c.lineTo(TX0 + TW - 40, TY + TH - 260); c.stroke(); c.setLineDash([]); D();
    }
    return {
      dur: DUR, shakes: [[OUT + 0.3, 8]],
      render(t) {
        if (!BACKDROP() && !VID.collecting) { const c = G(), g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, DEEP1); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); }
        const q = seg(t, OUT - 0.3, 0.4), drop = E.outBack(seg(t, 0.15, 0.7)), y0 = (1 - drop) * -1500, ink = K7.on(PAPER), tear = seg(t, OUT - 0.1, 0.6);
        if (t < OUT + 0.6) {
          ticket(t, y0 + tear * 40, 1 - E.inC(tear));
          // footage window in the top half of the ticket
          const k = t < S[1].start ? 0 : 1, sh = S[k], box = [TX0 + 40, TY + 40 + y0, TW - 80, 500], r = K3.wholeIn(sh.c, box);
          ctx.save(); ctx.globalAlpha = (1 - E.inC(tear)) * seg(t, 0.5, 0.5); if (!VID.collecting) { ctx.beginPath(); ctx.rect(box[0], box[1], box[2], box[3]); ctx.clip(); } fill(box, '#000000'); K7.photo(sh, t, r); ctx.restore();
          if (!VID.collecting) {
            const a = 1 - E.inC(tear), x = TX0 + 60, yy = TY + 680 + y0;
            const L = K7.fitLines(NAME, 400, DSP, TW - 120, 130, 2); L.lines.forEach((ln, i) => fade(ln, x, yy + i * L.size * 0.95, F(400, L.size, DSP), ink, seg(t, 0.8 + i * 0.1, 0.4), { a, ls: 1 }));
            const dy = yy + (L.lines.length - 1) * L.size * 0.95 + 80; fade(DATE, x, dy, F(700, Math.min(40, fitSize(DATE, 700, TW - 120, 40, SANS, 3)), SANS), OR, seg(t, 1.1, 0.4), { a, ls: 3 });
            fade(PLACE, x, dy + 56, F(600, Math.min(28, fitSize(PLACE, 600, TW - 120, 28, SANS, 4)), SANS), rgbaOf(ink, 0.7), seg(t, 1.25, 0.4), { a, ls: 4 });
            fade('ADMIT ONE', TX0 + TW / 2, TY + TH - 150 + y0, F(400, 70, DSP), ink, seg(t, 1.4, 0.4), { align: 'center', a, ls: 8 });
            fade(up(BRAND.short || BRAND.name), TX0 + TW / 2, TY + TH - 90 + y0, F(700, 22, SANS), rgbaOf(ink, 0.6), seg(t, 1.5, 0.4), { align: 'center', a, ls: 6 });
            // countdown or save the date, then the lineup (over the ticket's lower half)
            if (t >= T1 - 0.2 && t < OUT) {
              const p = seg(t, T1, 0.5), b = [TX0, TY + 548 + y0, TW, 572], c = G(); c.globalAlpha = E.outC(p) * a; c.fillStyle = BLK; c.fillRect(b[0], b[1], b[2], b[3] * E.outC(p)); D();
              if (DAYS) { fade(DAYS, W / 2, b[1] + 330, F(400, Math.min(320, fitSize(DAYS, 400, 600, 320, DSP, 0)), DSP), OR, seg(t, T1 + 0.2, 0.4), { align: 'center', a }); fade(Number(DAYS) === 1 ? 'DAY TO GO' : 'DAYS TO GO', W / 2, b[1] + 420, F(700, 34, SANS), WHT, seg(t, T1 + 0.4, 0.4), { align: 'center', ls: 8, a }); }
              else { fade('SAVE', W / 2, b[1] + 220, F(400, 170, DSP), OR, seg(t, T1 + 0.2, 0.4), { align: 'center', a, ls: 4 }); fade('THE DATE', W / 2, b[1] + 380, F(400, 170, DSP), WHT, seg(t, T1 + 0.35, 0.4), { align: 'center', a, ls: 4 }); }
              if (lineup.length && t > T1 + SD - 0.2) { const lp = seg(t, T1 + SD, 0.4), c2 = G(); c2.globalAlpha = E.outC(lp) * a; c2.fillStyle = BLK; c2.fillRect(b[0], b[1], b[2], b[3]); D(); fade('LINEUP', W / 2, b[1] + 110, F(700, 26, SANS), OR, lp, { align: 'center', ls: 10, a }); lineup.forEach((ln, i) => fade(ln, W / 2, b[1] + 220 + i * 110, F(400, Math.min(90, fitSize(ln, 400, TW - 100, 90, DSP, 3)), DSP), WHT, seg(t, T1 + SD + 0.2 + i * 0.2, 0.4), { align: 'center', ls: 3, a })); }
            }
          }
        }
        if (t >= OUT && !VID.collecting) {
          const o = t - OUT, [lw, lh] = logoBox(520);
          K7.logo(W / 2, 620, 520, E.outC(seg(o, 0.5, 0.5)));
          fade(NAME, W / 2, 620 + lh / 2 + 150, F(400, Math.min(130, fitSize(NAME, 400, 960, 130, DSP, 3)), DSP), WHT, seg(o, 0.7, 0.4), { align: 'center', ls: 3 });
          fade(DATE, W / 2, 620 + lh / 2 + 220, F(700, 34, SANS), OR, seg(o, 0.85, 0.4), { align: 'center', ls: 4 });
          const cp = seg(o, 1.1, 0.4); if (cp > 0) { const f = F(700, ctaFit(CONTACT.cta, 700, 36, SANS, 5), SANS), bw = textW(CONTACT.cta, f, 5) + 110, y = 620 + lh / 2 + 290, c = G(); c.globalAlpha = E.outC(cp); c.fillStyle = OR; c.beginPath(); c.roundRect(W / 2 - bw / 2, y, bw, 92, 46); c.fill(); setF(f, 5); c.fillStyle = K7.on(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CONTACT.cta, W / 2 + 2, y + 47); D(); }
          fade(K7.contact().join('   ·   '), W / 2, 620 + lh / 2 + 460, F(600, 28, SANS), WA(0.8), seg(o, 1.3, 0.4), { align: 'center', ls: 2 });
        }
      },
      cues() {
        const ev = [['whoosh', 0.15, 0.3, 0], ['paper', 0.6, 0.3, 0], ['tick', 1.4, 0.2, 0], ['whoosh', T1, 0.25, 0], ['boom', T1 + 0.25, 0.35, 0]];
        if (lineup.length) { ev.push(['whoosh', T1 + SD, 0.2, 0]); lineup.forEach((_, i) => ev.push(['pop', T1 + SD + 0.2 + i * 0.2, 0.25, (i - 1) * 0.4])); }
        ev.push(['paper', OUT - 0.1, 0.4, 0]); ev.push(['whoosh', OUT + 0.2, 0.25, 0]); ev.push(['chime', OUT + 1.1, 0.2, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  // ================================================================ PRODUCT DROP
  function product() {
    const DROP = TX('drop', 'NEW DROP', { label: 'Headline', group: 'The drop', upper: true, max: 12 });
    const NAME = TX('name', 'THE CORE COLLECTION', { label: 'Product name', group: 'The drop', upper: true, max: 24, req: true });
    const WHEN = TX('when', 'FRI · 10 AM', { label: 'Drop date and time', group: 'The drop', upper: true, max: 18, req: true, hint: 'Sample: put your real drop time here' });
    const OPTS = TX('opts', '', { label: 'Options (sizes, colours)', group: 'The drop', upper: true, max: 30, hint: 'Optional, e.g. S · M · L · XL' });
    const BT = 60 / FM.bpm, b = k => 0.2 + k * BT, T1 = b(6), OUT = b(18), DUR = OUT + 3.4;
    const S = shots([['s1', 'Product shot 1', 4.0], ['s2', 'Product shot 2', 4.0], ['s3', 'Product shot 3', 4.0], ['s4', 'Product shot 4', 4.0]], T1); S.forEach(s => (s.start = T1));
    function bars(x, y, w, h, a) { if (VID.collecting) return; const r = rng(31), c = G(); c.globalAlpha = a; c.fillStyle = WHT; for (let xx = x; xx < x + w;) { const bw = 2 + Math.floor(r() * 7); if (r() > 0.35) c.fillRect(xx, y, bw, h); xx += bw + 3; } D(); }
    return {
      dur: DUR, shakes: [[b(0), 8], [b(2), 8], [b(4), 8]],
      render(t) {
        if (!BACKDROP() && !VID.collecting) { const c = G(); c.fillStyle = BLK; c.fillRect(-20, -20, W + 40, H + 40); D(); }
        const q = seg(t, OUT - 0.2, 0.3);
        // title: the word slams on the beat, inverting every other beat (at most 2.5 changes a second)
        if (t < T1 + 0.2 && !VID.collecting) {
          const k = Math.floor((t - b(0)) / (2 * BT)), inv = t >= b(0) && k % 2 === 1 && t < b(5), ds = Math.min(420, fitSize(DROP, 400, 1000, 420, DSP, 2));
          if (inv) fill([0, 0, W, H], OR); const p = seg(t, b(0), 0.12), c = G(), s = lerp(1.25, 1, E.outC(p)); c.globalAlpha = clamp(p * 3) * (1 - seg(t, T1 - 0.2, 0.3)); c.translate(W / 2, 1000); c.scale(s, s); setF(F(400, ds, DSP), 2); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = inv ? K7.on(OR) : WHT; c.fillText(DROP, 0, 0); D();
          const wp = seg(t, b(4), 0.2); if (wp > 0) { fade(WHEN, W / 2, 1300, F(400, Math.min(130, fitSize(WHEN, 400, 960, 130, DSP, 4)), DSP), inv ? K7.on(OR) : OR, wp, { align: 'center', ls: 4, a: 1 - seg(t, T1 - 0.2, 0.3) }); }
        }
        // tiles: four product shots that swap places on the beat
        if (t >= T1 - 0.05 && t < OUT + 0.2) {
          const step = Math.floor((t - T1) / (2 * BT)), slots = [[60, 300], [550, 300], [60, 790], [550, 790]], tw = 470, th = 470;
          S.forEach((s, i) => { const u = step > 0 ? E.inOutQ(clamp(((t - T1) - step * 2 * BT) / 0.28)) : 1, from = slots[(i + Math.max(0, step - 1)) % 4], to = slots[(i + step) % 4], x = lerp(from[0], to[0], u), y = lerp(from[1], to[1], u);
            const pop = E.outBack(seg(t, T1 + i * 0.08, 0.25)), box = [x + tw / 2 - tw / 2 * pop, y + th / 2 - th / 2 * pop, tw * pop, th * pop]; fill([box[0] - 6, box[1] - 6, box[2] + 12, box[3] + 12], i === 0 ? OR : WHT, 1 - q); fill(box, '#000000', 1 - q);
            ctx.save(); ctx.globalAlpha = 1 - q; if (!VID.collecting) { ctx.beginPath(); ctx.rect(box[0], box[1], box[2], box[3]); ctx.clip(); } K7.photo(s, t, K3.wholeIn(s.c, box)); ctx.restore(); });
          if (!VID.collecting) {
            const a = 1 - q; fade(NAME, 60, 1400, F(400, Math.min(110, fitSize(NAME, 400, 960, 110, DSP, 2)), DSP), WHT, seg(t, T1 + 0.3, 0.3), { ls: 2, a });
            fade(WHEN, 60, 1480, F(700, 40, SANS), OR, seg(t, T1 + 0.45, 0.3), { ls: 4, a });
            if (OPTS) { const ops = OPTS.split(/\s*[·,|/]\s*/).filter(Boolean).slice(0, 6); let x = 60; ops.forEach((o2, i) => { const f = F(700, 28, SANS), w = textW(o2, f, 2) + 40, p = seg(t, T1 + 0.6 + i * 0.08, 0.25); if (p > 0) { const c = G(); c.globalAlpha = a * E.outC(p); c.strokeStyle = WHT; c.lineWidth = 2; c.strokeRect(x, 1530, w, 56); setF(f, 2); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o2, x + w / 2, 1559); D(); } x += w + 14; }); }
            bars(60, 220, 300, 46, a * seg(t, T1, 0.3)); K7.txt(up(BRAND.short || BRAND.name) + ' / ' + NAME.slice(0, 18), 380, 256, F(700, 20, 'Mono'), WA(0.6), { ls: 3, a: a * seg(t, T1, 0.3) });
          }
        }
        if (t >= OUT && !VID.collecting) {
          const o = t - OUT, cs = Math.min(260, fitSize(CONTACT.cta, 400, 980, 260, DSP, 2)), p = seg(o, 0.1, 0.15), c = G(), s = lerp(1.3, 1, E.outC(p)); c.globalAlpha = clamp(p * 3); c.translate(W / 2, 760); c.scale(s, s); setF(F(400, cs, DSP), 2); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = OR; c.fillText(CONTACT.cta, 0, 0); D();
          fade(WHEN, W / 2, 900, F(700, 44, SANS), WHT, seg(o, 0.4, 0.3), { align: 'center', ls: 6 });
          fade(K7.contact().join('   ·   '), W / 2, 980, F(600, 30, SANS), WA(0.8), seg(o, 0.6, 0.3), { align: 'center', ls: 3 });
          K7.logo(W / 2, 1180, 460, E.outC(seg(o, 0.8, 0.4)));
        }
      },
      cues() {
        const ev = []; for (let k = 0; k < 6; k += 2) { ev.push(['impact', b(k), 0.45, 0]); ev.push(['boom', b(k), 0.25, 0]); } ev.push(['clack', b(4), 0.35, 0]);
        for (let k = 0; k < 4; k++) ev.push(['pop', T1 + k * 0.08, 0.3, -0.6 + k * 0.4]);
        for (let k = 2; k < 12; k += 2) ev.push(['tick', T1 + k * BT, 0.22, 0]);
        ev.push(['impact', OUT + 0.1, 0.5, 0]); ev.push(['chime', OUT + 0.8, 0.2, 0]);
        return { dur: DUR, beds: [musicBed(DUR, { start: b(0) })], events: ev };
      },
    };
  }

  // ================================================================ EXPERT AUTHORITY
  function expert() {
    const QUOTE = TX('quote', 'Good decisions start with clear answers.', { label: 'Your quote', group: 'Quote', max: 70, req: true, multiline: true, hint: 'In your own words' });
    const WHO = TX('who', BRAND.name, { label: 'Name', group: 'Quote', max: 30 });
    const ROLE = TX('role', '', { label: 'Title', group: 'Quote', max: 34, hint: 'Optional, e.g. Founder' });
    const CR = [1, 2, 3].map(k => TX('cr' + k, '', { label: 'Credential ' + k, group: 'Credentials', max: 36, hint: k === 1 ? 'Optional: only what you can stand behind. If all are empty, your services show instead.' : undefined }));
    const STAT = TX('stat', '', { label: 'A number you can stand behind', group: 'Optional stat', max: 10, hint: 'Optional' });
    const STATL = TX('statl', '', { label: 'What it means', group: 'Optional stat', upper: true, max: 30 });
    const T1 = 4.6, T2 = 8.6, OUT = 11.4, DUR = OUT + 3.6;
    const S = shots([['s1', 'You, or your workplace', OUT + 0.2, 'any', 'v']], 0);
    const creds = CR.filter(x => nz(x)), list = creds.length ? creds : svcs(3), listHead = creds.length ? 'CREDENTIALS' : 'HOW WE HELP';
    return {
      dur: DUR, shakes: [],
      render(t) {
        if (!BACKDROP() && !VID.collecting) { const c = G(); c.fillStyle = BLK; c.fillRect(-20, -20, W + 40, H + 40); c.fillStyle = WA(0.06); for (let k = 1; k < 6; k++) c.fillRect(k * W / 6, 0, 1, H); D(); }
        const q = seg(t, OUT - 0.3, 0.4), s = S[0], drift = Math.sin(t * 0.25) * 10;
        // the frame on the right, steady
        if (t < OUT + 0.3) { const r = vert(s) ? topIn(s.c, [W - 72 - 470, 260 + drift, 470, 836]) : topIn(s.c, [72, 260 + drift, 936, 600]), p = E.outC(seg(t, 0.3, 0.8)); fill([r[0] + 18, r[1] + 18, r[2], r[3]], OR, (1 - q) * p); ctx.save(); ctx.globalAlpha = (1 - q) * p; K7.photo(s, t, r); ctx.restore(); }
        if (VID.collecting) return;
        const vtop = vert(s) ? 0 : 1, qx = 72, qy = vtop ? 1000 : 400, qw = vtop ? 936 : 420;
        if (t < T1 + 0.3) {
          const a = 1 - seg(t, T1 - 0.3, 0.4), L = K7.fitLines(QUOTE, 500, SER, qw, vtop ? 96 : 62, 6, { style: 'italic' });
          fade('“', qx - 8, qy + 30, F(700, 220, SER), OR, seg(t, 0.4, 0.5), { a });
          L.lines.forEach((ln, i) => fade(ln, qx, qy + 120 + i * L.size * 1.15, F(500, L.size, SER, 'italic'), WHT, seg(t, 0.7 + i * 0.12, 0.6), { a }));
          const ay = qy + 120 + L.lines.length * L.size * 1.15 + 40; fill([qx, ay, 60 * E.outC(seg(t, 1.5, 0.5)), 3], OR, a);
          fade(WHO, qx, ay + 60, F(700, 32, SANS), WHT, seg(t, 1.6, 0.5), { a }); if (ROLE) fade(up(ROLE), qx, ay + 104, F(600, 22, SANS), WA(0.6), seg(t, 1.7, 0.5), { ls: 4, a });
        }
        if (t >= T1 && t < T2 + 0.3) {
          const a = 1 - seg(t, T2 - 0.3, 0.4); fade(listHead, qx, qy + 40, F(700, 22, SANS), OR, seg(t, T1, 0.5), { ls: 6, a });
          list.forEach((it, i) => { const y = qy + 140 + i * 120, p = seg(t, T1 + 0.3 + i * 0.25, 0.5); fill([qx, y + 30, qw * E.inOutC(p), 1], WA(0.3), a); fade('0' + (i + 1), qx, y, F(600, 22, SANS), OR, p, { a, ls: 3 }); fade(it, qx + 70, y, F(600, Math.min(40, fitSize(it, 600, qw - 70, 40, SANS, 0)), SANS), WHT, p, { a }); });
        }
        if (!STAT && t >= T2 && t < OUT + 0.2) { const a = 1 - q, L = K7.fitLines(QUOTE, 500, SER, qw, vtop ? 96 : 62, 6, { style: 'italic' }); L.lines.forEach((ln, i) => fade(ln, qx, qy + 120 + i * L.size * 1.15, F(500, L.size, SER, 'italic'), WHT, seg(t, T2 + i * 0.1, 0.6), { a })); fade('“', qx - 8, qy + 30, F(700, 220, SER), OR, seg(t, T2, 0.5), { a }); }
        if (STAT && t >= T2 && t < OUT + 0.2) { const a = 1 - q; fade(STAT, qx, qy + 260, F(700, Math.min(220, fitSize(STAT, 700, qw, 220, DSP, 2)), DSP), OR, seg(t, T2, 0.5), { a, ls: 2 }); if (STATL) fade(STATL, qx, qy + 330, F(600, 26, SANS), WHT, seg(t, T2 + 0.3, 0.5), { a, ls: 4 }); }
        if (t >= OUT) {
          const o = t - OUT; K7.logo(W / 2, 600, 460, E.outC(seg(o, 0.2, 0.6)));
          fade(WHO, W / 2, 800, F(700, 44, SANS), WHT, seg(o, 0.5, 0.5), { align: 'center' }); if (ROLE) fade(up(ROLE), W / 2, 850, F(600, 22, SANS), WA(0.6), seg(o, 0.6, 0.5), { align: 'center', ls: 4 });
          fill([W / 2 - 40, 900, 80 * E.outC(seg(o, 0.7, 0.5)), 3], OR);
          const cp = seg(o, 0.9, 0.5); if (cp > 0) { const f = F(600, ctaFit(CONTACT.cta, 600, 30, SANS, 3), SANS), bw = textW(CONTACT.cta, f, 3) + 100, c = G(); c.globalAlpha = E.outC(cp); c.fillStyle = OR; c.fillRect(W / 2 - bw / 2, 960, bw, 84); setF(f, 3); c.fillStyle = K7.on(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CONTACT.cta, W / 2 + 1.5, 1003); D(); }
          fade(K7.contact().join('   ·   '), W / 2, 1120, F(600, 26, SANS), WA(0.75), seg(o, 1.1, 0.5), { align: 'center', ls: 1 });
        }
      },
      cues() {
        const ev = [['air', 0.3, 0.18, 0], ['tink', 0.7, 0.1, 0], ['air', T1, 0.16, 0]]; list.forEach((_, i) => ev.push(['tick', T1 + 0.3 + i * 0.25, 0.16, 0]));
        ev.push(['chime', T2, 0.16, 0]); ev.push(['air', OUT, 0.18, 0]); ev.push(['chime', OUT + 0.9, 0.18, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev };
      },
    };
  }

  const MAKE = { blueprint, salon, barber, reveal, event, product, expert };
  const P = (MAKE[V] || blueprint)();
  DIR = { bgSwap: true, dur: P.dur, bg: BLK, finish: { vig: LIGHTPAL ? 0.1 : 0.28, grain: LIGHTPAL ? 0.08 : 0.18 }, edl: [], shakes: P.shakes, preload: () => K3.init(), render: P.render, cues: P.cues, fam: V,
    setup() { if (!window.STUDIO && LIGHTPAL) { const w = IMG.logoW; IMG.logoW = IMG.logoB; IMG.logoB = w; } } };
});
