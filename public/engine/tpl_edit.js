'use strict';
/* Editorial (round 4): warm paper, Cormorant italic, letter-spaced mono captions, dissolves, quiet luxury.
   ?v=review #45 In Their Words 15 s: Roberta S.'s review, word for word from dpgoutdoorliving.com. The footage is another
             project and is captioned as such.
   ?v=film   #50 The DPG Portfolio 60 s: opening line, six project chapters, DPG's homepage numbers, Vince's review, outro. */
STUDIO_REG['edit'] = (() => {
  const V = QS.get('v') || 'review';
  // Per-element model: tpl_free sets window.__NX_BLOCK_EL to the block's `el` data before calling this
  // factory; positions below fall back to the original hardcoded values when EL is null, so rendering
  // is byte-for-byte the old path. (Same pattern as tpl_trade.js / tpl_nx9.js.)
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const INK = BLK, MUTE = 'rgba(11,11,11,0.62)';
  function bug(t, a) { ctx.save(); ctx.globalAlpha = a; K3.logoBuild(185, 196, 250, 0.3, t, { img: IMG.logoB, soft: true, speed: 0.8 }); ctx.restore(); }
  function rule(x, y, w, p, col) { if (VID.collecting || p <= 0) return; const c = K3.G(); c.fillStyle = col || OR; c.fillRect(x, y, w * E.inOutC(clamp(p)), 3); K3.D(); }

  // DPG's published reviews, word for word (dpgoutdoorliving.com): the studio offers a choice, never free text
  // the brand's reviews, word for word (DPG: dpgoutdoorliving.com); a brand with none shows a placeholder card
  const REVS = (BRAND.reviews && BRAND.reviews.length) ? BRAND.reviews : [{ id: 'none', text: 'Add a real customer review, word for word, to this brand kit to use this template.', by: 'YOUR CUSTOMER  ·  CITY' }];
  const REVIEWS = {}; REVS.forEach(r => (REVIEWS[r.id] = r));
  const revLabel = r => r.by.split('·').map(x => x.trim()).filter(Boolean).map((x, i) => i ? x : x.charAt(0) + x.slice(1).toLowerCase().replace(/ (\w)/g, (m, c) => ' ' + c.toUpperCase())).join(' · ');
  function review() {
    const RV = TX('review', REVS[0].id, { label: 'Review (word for word, from the brand kit)', group: 'The review', options: REVS.map(r => ({ value: r.id, label: revLabel(r) })) });
    const NUM = TX('num', 'N° 08', { label: 'Number', group: 'Header', max: 6 }), KICK = TX('kick', 'IN THEIR WORDS', { label: 'Kicker', group: 'Header', upper: true, max: 24 });
    const SH0 = [['c11', 15.0, 2.7], ['c02', 9.0, 2.7], ['c11', 12.05, 2.6], ['c02', 0.05, 2.6]];
    const S = K3.shots(SH0.map(([c, inn, d], i) => { const sh = SHOT('s' + (i + 1), [c, inn], { label: 'Shot ' + (i + 1), group: 'Footage', kind: 'land', d: d + 0.6 }); return [sh[0], sh[1], d, { tr: 'dissolve' }]; }));
    // projOf lives in kit.js; the static harness sandbox does not provide it, where the caption
    // default falls back to the bare prefix (the real studio resolves the project name).
    const PCAP = TX('projCap', 'PROJECT SHOWN: ' + (typeof projOf === 'function' ? projOf(S[0].c) : ''), { label: 'Caption under the footage', group: 'Footage', upper: true, max: 40 });
    const TAG = TX('tag', CONTACT.tagline || BRAND.name, { label: 'Ending line', group: 'Ending', max: 34 });
    const OUT = S.total, DUR = 15, CY = 620;
    const Q = REVIEWS[RV];
    // OUT from the shot list alone (the sandbox K3.shots stub sets no .total); equals S.total.
    const OUTL = SH0.reduce((a, s) => a + s[2], 0);
    // settled band height for the caption default: 16:9 land band at CY (K3.band settles at h).
    const bandH = Math.round(W / K3.ar(S[0].c));
    function elements() {
      const nmP = posOf(elP('num'), [72, 300]);
      const kiP = posOf(elP('kick'), [72 + Math.max(96, textW(NUM, F(700, 21, 'Mono'), 4) + 12), 300]);
      const pcP = posOf(elP('pcap'), [72, CY + bandH / 2 + 44]);
      const quP = posOf(elP('quote'), [72, 1000]);
      return [
        { id: 'num', kind: 'pos', label: NUM, x: nmP[0], y: nmP[1], t0: 0, d: OUTL, box: [nmP[0], nmP[1] - 21, 200, 30], dup: false, del: false },
        { id: 'kick', kind: 'pos', label: KICK, x: kiP[0], y: kiP[1], t0: 0, d: OUTL, box: [kiP[0], kiP[1] - 21, 500, 30], dup: false, del: false },
        { id: 'pcap', kind: 'pos', label: PCAP, x: pcP[0], y: pcP[1], t0: 0.8, d: OUTL - 0.8, box: [pcP[0], pcP[1] - 18, 936, 26], dup: false, del: false },
        { id: 'quote', kind: 'pos', label: 'Review quote', x: quP[0], y: quP[1], t0: 1.2, d: OUTL - 1.2, box: [quP[0], quP[1], 936, 420], dup: false, del: false },
      ];
    }
    return {
      dur: DUR,
      render(t) {
        K3.bgPaper(t);
        const body = 1 - clamp((t - OUT) / 0.4);
        const b = K3.band(S, t, { cy: CY, open: [0.2, 0.6], close: [OUT, 0.4], flash: false });
        if (body > 0) {
          ctx.save(); ctx.globalAlpha = body;
          bug(t, body);
          const [nux, nuy] = posOf(elP('num'), [72, 300]);
          caps(NUM, nux, nuy, 21, clamp(t / 0.4), 0, { w: 700, fam: 'Mono', ls: 4, align: 'left', col: OR, ls0: 0 });
          const [kix, kiy] = posOf(elP('kick'), [72 + Math.max(96, textW(NUM, F(700, 21, 'Mono'), 4) + 12), 300]);
          caps(KICK, kix, kiy, 21, clamp(t / 0.4), 0, { w: 700, fam: 'Mono', ls: 4, align: 'left', col: INK, ls0: 0 });
          if (!b.closed) { const [pcx, pcy] = posOf(elP('pcap'), [72, b.r[1] + b.r[3] + 44]); caps(PCAP, pcx, pcy, 18, clamp((t - 0.8) / 0.5), 0, { w: 700, fam: 'Mono', ls: 3, align: 'left', col: MUTE, ls0: 0, maxW: 936 }); }
          const [qux, quy] = posOf(elP('quote'), [72, 1000]);
          K3.quote(Q.text, Q.by, qux, quy, 936, 64, t, 1.2, { col: INK, byCol: OR });
          ctx.restore();
        }
        if (t >= OUT + 0.1) K3.outro('editorial', t - OUT, TAG);
      },
      cues() {
        const ev = [['air', 0.2, 0.25, 0], ['paper', 0.3, 0.2, 0], ['tink', 1.25, 0.12, -0.3]];
        S.forEach((s, i) => { if (i) ev.push(['air', s.start, 0.18, i % 2 ? 0.3 : -0.3]); });
        ev.push(['shimmer', 2.6, 0.15, 0]); ev.push(['air', OUT, 0.25, 0]); ev.push(['chime', OUT + 1.6, 0.25, 0]); ev.push(['ticks', OUT + 2.0, 0.16, 0, { dur: 0.8, n: 14 }]);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'cinematic', bpm: 84, key: 0, drop: 2.9, lift: OUT + 20, end: OUT }]], events: ev };
      },
      elements,
    };
  }

  function film() {
    const OPEN = 4.2, CY = 900;
    const CH = [
      { name: 'Hillside Villa', shots: [['c11', 15.0, 3.0, 'PATIO OVER THE HILLS'], ['c02', 9.0, 2.95, 'POOL & PALMS']] },
      { name: 'Modern Pool Retreat', shots: [['c05', 4.1, 3.0, 'POOL & PERGOLA'], ['c05', 24.1, 3.0, 'THE WHOLE RETREAT']] },
      { name: 'The Entertainer', shots: [['c07', 12.05, 2.9, 'BOCCE UNDER STRING LIGHTS'], ['c07', 24.0, 2.9, 'PAVILION & FIRE BOWL']] },
      { name: 'Courtyard Estate', shots: [['c08', 5.99, 2.45, 'PAVER DRIVEWAY'], ['c08', 10.98, 2.4, 'FOUNTAIN COURTYARD']] },
      { name: 'Stone Oven Terrace', shots: [['c09', 3.55, 3.0, 'STONE PIZZA OVEN'], ['c09', 10.5, 3.0, 'LOUNGE & FIRE TABLE']] },
      { name: 'Dusk Pavilion', shots: [['c12', 0.1, 3.2, 'LIT PAVER STEPS'], ['c12', 8.5, 3.2, 'OUTDOOR KITCHEN']] },
    ];
    const NUMS = [['3,500+', 'projects completed.'], ['28 million', 'pavers installed.'], ['Since 1990,', 'serving the Greater Bay Area.']];
    const Q = { text: 'DPG exceeded all my expectations. Their team was professional, detail-oriented, and passionate about their work.', by: 'VINCE  ·  EAST BAY' };
    const list = [['c12', 0.1, OPEN, { ch: -1 }]];
    CH.forEach((c, ci) => c.shots.forEach(([cc, inn, d, cap], k) => list.push([cc, inn, d, { tr: 'dissolve', ch: ci, cap, k }])));
    const NUM0 = OPEN + CH.reduce((a, c) => a + c.shots.reduce((x, s) => x + s[2], 0), 0);
    [['c05', 14.0, 3.0], ['c07', 6.05, 3.0], ['c10', 4.0, 3.0]].forEach(s => list.push([s[0], s[1], s[2], { tr: 'dissolve', ch: 6 }]));
    const S = K3.shots(list), REV = S.total, OUT = REV + 6.0, DUR = 60;
    CH.forEach((c, ci) => { const ss = S.filter(s => s.ch === ci); c.t0 = ss[0].start; c.t1 = ss[ss.length - 1].start + ss[ss.length - 1].d; });
    return {
      dur: DUR,
      render(t) {
        K3.bgPaper(t);
        const b = K3.band(S, t, { cy: CY, open: [OPEN - 0.6, 0.8], close: [REV, 0.6], flash: false });
        const body = 1 - clamp((t - OUT) / 0.4);
        if (body > 0) bug(t, body);
        // opening line
        if (t < OPEN + 0.3) {
          const q = (t - (OPEN - 0.5)) / 0.4;
          K3.serifLines(['Every backyard', 'tells a story.'], W / 2, 760, 100, 112, t, 0.25, { align: 'center', col: INK, q });
          caps('HERE ARE SIX OF OURS', W / 2, 1000, 22, clamp((t - 1.8) / 0.5), clamp(q), { w: 700, fam: 'Mono', ls: 5, col: OR });
        }
        // chapters
        const ci = b.sh.ch;
        if (ci >= 0 && ci < CH.length && t < REV) {
          const c = CH[ci], lt = t - c.t0, q = (t - (c.t1 - 0.35)) / 0.35;
          caps('N° 0' + (ci + 1), 72, 330, 21, clamp((lt - 0.05) / 0.4), clamp(q), { w: 700, fam: 'Mono', ls: 4, align: 'left', col: OR, ls0: 0 });
          caps('THE ' + BRAND.short.toUpperCase() + ' PORTFOLIO', 168, 330, 21, clamp((lt - 0.05) / 0.4), clamp(q), { w: 700, fam: 'Mono', ls: 4, align: 'left', col: MUTE, ls0: 0 });
          K3.serifLines([c.name], 66, 452, 96, 100, t, c.t0 + 0.1, { col: INK, q });
          rule(72, 488, 160, (lt - 0.4) / 0.6 - clamp(q));
          if (!b.closed && b.sh.cap) { const lt2 = t - b.sh.start, y = b.r[1] + b.r[3] + 56;
            caps(b.sh.cap, 72, y, 22, clamp((lt2 - 0.3) / 0.5), clamp((lt2 - (b.sh.d - 0.3)) / 0.3), { w: 700, fam: 'Mono', ls: 4, align: 'left', col: MUTE, ls0: 0 });
            caps('0' + (ci + 1) + ' / 06', W - 72, y, 20, clamp((lt - 0.3) / 0.5), clamp(q), { w: 700, fam: 'Mono', ls: 3, align: 'right', col: OR, ls0: 0 }); }
        }
        // numbers
        if (t >= NUM0 && t < REV + 0.4) {
          const per = (REV - NUM0) / 3, k = Math.min(2, Math.floor((t - NUM0) / per)), lt = t - NUM0 - k * per, it = NUMS[k], q = k < 2 ? (lt - (per - 0.35)) / 0.35 : (t - REV) / 0.35;
          caps('BY THE NUMBERS', 72, 300, 21, clamp((t - NUM0) / 0.4), clamp((t - REV) / 0.3), { w: 700, fam: 'Mono', ls: 4, align: 'left', col: OR, ls0: 0 });
          K3.serifLines([it[0]], 66, 440, 128, 130, t, NUM0 + k * per + 0.05, { col: INK, q, style: '', w: 600 });
          K3.serifLines([it[1]], 70, 506, 50, 56, t, NUM0 + k * per + 0.35, { col: MUTE, q });
        }
        // review
        if (t >= REV && t < OUT + 0.4) K3.quote(Q.text, Q.by, 90, 640, 900, 64, t, REV + 0.5, { col: INK, byCol: OR, q: (t - OUT) / 0.4 });
        if (t >= OUT + 0.1) K3.outro('editorial', t - OUT, 'Award-winning design & build.');
      },
      cues() {
        const ev = [['air', 0.25, 0.2, 0], ['paper', OPEN - 0.6, 0.25, 0]];
        S.forEach((s, i) => { if (i > 1) ev.push(['air', s.start, 0.16, i % 2 ? 0.3 : -0.3]); });
        CH.forEach(c => { ev.push(['paper', c.t0, 0.22, 0]); ev.push(['tink', c.t0 + 0.15, 0.1, -0.3]); });
        [0, 1, 2].forEach(k => ev.push(['chime', NUM0 + k * (REV - NUM0) / 3 + 0.1, 0.18, 0]));
        ev.push(['air', REV, 0.25, 0]); ev.push(['shimmer', REV + 0.5, 0.18, 0]); ev.push(['air', OUT, 0.25, 0]); ev.push(['chime', OUT + 1.6, 0.25, 0]); ev.push(['ticks', OUT + 2.0, 0.16, 0, { dur: 0.8, n: 14 }]);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'cinematic', bpm: 92, key: 0, drop: OPEN, lift: NUM0, end: OUT }]], events: ev };
      },
    };
  }
  const P = V === 'film' ? film() : review();
  DIR = { dur: P.dur, bg: PAPER, finish: { vig: 0.06, grain: 0.12 }, edl: [], preload: () => K3.init(), render: P.render, cues: P.cues, ...(P.elements ? { elements: P.elements } : {}) };
});
