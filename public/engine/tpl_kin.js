'use strict';
/* Bold Kinetic (round 4). ?v=kitchens #43 "Dinner's outside tonight." 15 s · ?v=drive #44 "First impressions start at the
   curb." 15 s (3:2 Courtyard Estate band) · ?v=team #49 One Team, Whole Backyard 30 s (eight services, one slam word each).
   Lines and service words are DPG's own ad lines and the services listed on dpgoutdoorliving.com. */
STUDIO_REG['kin'] = (() => {
  const V = QS.get('v') || 'kitchens';
  // Per-element model: tpl_free sets window.__NX_BLOCK_EL to the block's `el` data before calling this
  // factory; positions below fall back to the original hardcoded values when EL is null, so rendering
  // is byte-for-byte the old path. (Same pattern as tpl_trade.js.)
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const BPM = 120, bt = 0.5, bar = 2, CY = 864;
  const SPEC = {
    kitchens: { kick: 'OUTDOOR KITCHENS', key: 2, tag: "DINNER'S OUTSIDE TONIGHT",
      A: { w: ["DINNER'S", 'OUTSIDE'], t0: 0, hl: 1 }, B: { w: ['TONIGHT.'], t0: 4.6, hl: 0 },
      shots: [['c12', 8.5, 2.4], ['c10', 17.0, 2.2], ['c09', 3.6, 2.2], ['c09', 7.0, 2.0], ['c10', 10.5, 2.0]],
      chips: ['OUTDOOR KITCHENS', 'PATIOS', 'PERGOLAS'] },
    drive: { kick: 'PAVER DRIVEWAYS', key: -1, tag: 'FIRST IMPRESSIONS START AT THE CURB',
      A: { w: ['FIRST', 'IMPRESSIONS'], t0: 0, hl: 1 }, B: { w: ['START', 'AT', 'THE', 'CURB.'], t0: 4.4, hl: 3, step: 0.35 },
      shots: [['c08', 0.02, 1.95], ['c08', 2.02, 1.95], ['c08', 3.99, 1.95], ['c08', 5.99, 2.45], ['c08', 8.49, 2.45]],
      chips: ['DRIVEWAYS', 'PAVER WALKWAYS', 'LANDSCAPE DESIGN'] },
  };
  const TEAM = [['DRIVEWAYS', 'c08', 5.99], ['PATIOS', 'c09', 0.05], ['POOL DECKS', 'c11', 12.05], ['PERGOLAS', 'c05', 4.1],
    ['PAVILIONS', 'c07', 24.0], ['OUTDOOR KITCHENS', 'c12', 8.5], ['PAVER WALKWAYS', 'c05', 19.1], ['LANDSCAPE DESIGN', 'c11', 9.0]];

  function chrome(t, out, kick, n, i) {   // top rail, logo bug, shot counter, kicker
    const body = 1 - clamp((t - out) / 0.3); if (body <= 0) return body;
    K3.rail(60, W - 60, 238, t / out, { a: body });
    ctx.save(); ctx.globalAlpha = body; K3.logoBuild(185, 196, 250, 0.6, t); ctx.restore();
    const [cox, coy] = posOf(elP('counter'), [W - 60, 214]);
    caps(`${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`, cox, coy, 20, body, 0, { fam: 'Mono', w: 700, ls: 3, align: 'right', col: 'rgba(255,255,255,0.75)', ls0: 0 });
    const [kix, kiy] = posOf(elP('kicker'), [60, 304]);
    kicker(kick, kix, kiy, clamp((t - 0.3) / 0.3) * body, { size: 22, ls: 5, maxW: 960 });
    return body;
  }
  function single() {
    const P0 = SPEC[V], wl = (w, k, hl) => 'Word ' + (k + 1) + (k === hl ? ' (highlighted)' : '');
    const P = Object.assign({}, P0, {
      kick: TX('kick', P0.kick, { label: 'Kicker', group: 'Headline', upper: true, max: 26 }),
      A: Object.assign({}, P0.A, { w: P0.A.w.map((w, k) => TX('a' + (k + 1), w, { label: 'Line 1 · ' + wl(w, k, P0.A.hl), group: 'Headline', upper: true, max: 14, hint: 'Each box slams in on its own beat' })) }),
      B: Object.assign({}, P0.B, { w: P0.B.w.map((w, k) => TX('b' + (k + 1), w, { label: 'Line 2 · ' + wl(w, k, P0.B.hl), group: 'Headline', upper: true, max: 14 })) }),
      chips: P0.chips.map((c, k) => TX('chip' + (k + 1), c, { label: 'Tag ' + (k + 1), group: 'Tags', upper: true, max: 18 })),
      tag: TX('tag', P0.tag, { label: 'Ending line', group: 'Ending', upper: true, max: 36 }),
      shots: P0.shots.map(([c, inn, d], i) => { const sh = SHOT('s' + (i + 1), [c, inn], { label: 'Shot ' + (i + 1), group: 'Footage', kind: 'land', d }); return [sh[0], sh[1], d]; }) });
    const S = K3.shots(P.shots), OUT = S.total, DUR = 15;
    let fA = 0, fB = 0; const sizes = () => { if (!fA) { fB = Math.min(124, fitSize(P.B.w.join(' '), 900, 960, 200, 'Mont', -3)); fA = Math.min(112, fitSize(P.A.w.join(' '), 900, 940, 200, 'Mont', -3)); } };
    function elements() {
      const kiP = posOf(elP('kicker'), [60, 304]), cnP = posOf(elP('counter'), [W - 60, 214]);
      const aP = posOf(elP('line1'), [W / 2, 420]), bP = posOf(elP('line2'), [W / 2, 620]);
      const tgP = posOf(elP('tags'), [W / 2, 1268]), ctP = posOf(elP('cta'), [W / 2, 1366]), coP = posOf(elP('contact'), [W / 2, 1456]);
      return [
        { id: 'kicker', kind: 'pos', label: P.kick, x: kiP[0], y: kiP[1], t0: 0.3, d: DUR - 0.3, box: [kiP[0], kiP[1] - 40, 500, 60], dup: false, del: false },
        { id: 'counter', kind: 'pos', label: 'Shot counter', x: cnP[0], y: cnP[1], t0: 0, d: DUR, box: [cnP[0] - 200, cnP[1] - 40, 200, 60], dup: false, del: false },
        { id: 'line1', kind: 'pos', label: P.A.w.join(' '), x: aP[0], y: aP[1], t0: P.A.t0, d: DUR - P.A.t0, box: [aP[0] - 470, aP[1] - 90, 940, 180], dup: false, del: false },
        { id: 'line2', kind: 'pos', label: P.B.w.join(' '), x: bP[0], y: bP[1], t0: P.B.t0, d: DUR - P.B.t0, box: [bP[0] - 470, bP[1] - 90, 940, 180], dup: false, del: false },
        { id: 'tags', kind: 'pos', label: P.chips.join(' · '), x: tgP[0], y: tgP[1], t0: 1.6, d: DUR - 1.6, box: [tgP[0] - 495, tgP[1] - 40, 990, 80], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: CONTACT.cta, x: ctP[0], y: ctP[1], t0: 2.2, d: DUR - 2.2, box: [ctP[0] - 400, ctP[1] - 45, 800, 90], dup: false, del: false },
        { id: 'contact', kind: 'pos', label: CONTACT.phone + ' · ' + CONTACT.web, x: coP[0], y: coP[1], t0: 2.5, d: DUR - 2.5, box: [coP[0] - 490, coP[1] - 40, 980, 70], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [[0, 10], [P.B.t0 + bt * (P.B.w.length - 1) * ((P.B.step || bt) / bt), 6]], elements,
      render(t) {
        sizes(); K3.bgKinetic(t, CY, bar);
        const b = K3.band(S, t, { cy: CY, open: [0, 0.38], close: [OUT, 0.35], under: OR, drift: 8, flash: 0.55 });
        K3.brackets(b.r, b.lt, OR);
        const body = chrome(t, OUT, P.kick, S.length, b.i);
        if (body > 0) {
          const q = (t - (OUT - 0.25)) / 0.25;
          const [a1x, a1y] = posOf(elP('line1'), [W / 2, 420]);
          K3.words(P.A.w, a1x, a1y, fA, t, P.A.t0, { hl: P.A.hl, dim: t > P.B.t0 + 1 ? 0.55 * clamp((t - P.B.t0 - 1) / 0.3) : 0, q });
          const [b1x, b1y] = posOf(elP('line2'), [W / 2, 620]);
          K3.words(P.B.w, b1x, b1y, fB, t, P.B.t0, { hl: P.B.hl, shadow: true, q, step: P.B.step || bt });
          const [tgx, tgy] = posOf(elP('tags'), [W / 2, 1268]);
          K3.chips(P.chips, tgx, tgy, t, 1.6, { a: body, maxW: 990 });
          const [ct2x, ct2y] = posOf(elP('cta'), [W / 2, 1366]);
          pill(CONTACT.cta, ct2x, ct2y, { size: Math.min(30, fitSize(CONTACT.cta, 800, 900, 30, 'Mont', 2.5)), p: clamp((t - 2.2) / 0.4), alpha: body });
          const [cnx, cny] = posOf(elP('contact'), [W / 2, 1456]);
          caps(CONTACT.phone + '   ·   ' + CONTACT.web, cnx, cny, 27, clamp((t - 2.5) / 0.4) * body, 0, { w: 800, ls: 2, maxW: 980 });
        }
        if (t >= OUT + 0.2) K3.outro('kinetic', t - OUT, P.tag);
      },
      cues() {
        const ev = [['impact', 0.0, 0.55, 0], ['boom', 0.02, 0.4, 0], ['whoosh', 0.05, 0.3, 0]];
        P.A.w.forEach((w, k) => ev.push(['snap', P.A.t0 + k * bt + 0.02, 0.35, (k - 0.5) * 0.4])); if (P.A.hl !== undefined) ev.push(['pop', P.A.t0 + P.A.hl * bt + 0.2, 0.3, 0.2]);
        const sB = P.B.step || bt; P.B.w.forEach((w, k) => ev.push(['snap', P.B.t0 + k * sB + 0.02, 0.38, (k - 1) * 0.25])); ev.push(['impact', P.B.t0 + P.B.hl * sB, 0.42, 0]); ev.push(['pop', P.B.t0 + P.B.hl * sB + 0.2, 0.32, 0.2]);
        S.forEach((s, i) => { if (i) { ev.push(['whoosh', s.start, 0.22, i % 2 ? 0.3 : -0.3]); ev.push(['tick', s.start + 0.02, 0.25, 0.4]); } });
        [1.6, 1.75, 1.9].forEach(d => ev.push(['tink', d, 0.1, 0])); ev.push(['pop', 2.25, 0.3, 0]);
        outroCues(ev, OUT);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'pulse', bpm: BPM, key: P.key, end: DUR - 0.6 }]], events: ev };
      },
    };
  }
  function outroCues(ev, OUT) {
    ev.push(['swell', OUT - 0.5, 0.3, 0]); ev.push(['whoosh', OUT, 0.3, 0]);
    [0, 0.12, 0.24].forEach(d => ev.push(['clack', OUT + 0.38 + d, 0.45, (d - 0.12) * 3])); ev.push(['tink', OUT + 0.75, 0.2, 0]);
    ev.push(['chime', OUT + 1.55, 0.3, 0]); ev.push(['ticks', OUT + 1.9, 0.25, 0, { dur: 0.8, n: 14 }]); ev.push(['pop', OUT + 2.4, 0.4, 0.3]);
  }
  // ---------- #49 One Team, Whole Backyard (30 s) ----------
  function team() {
    const HOOK = 3.0, SEG = 2.5, N = TEAM.length, ALL = HOOK + N * SEG, OUT = ALL + 2.5, DUR = 30;
    const dpg = !!BRAND.parts, svcs = BRAND.services || [], up = x => String(x).toUpperCase();
    const A1 = TX('a1', 'ONE', { label: 'Opening line 1 · word 1', group: 'Opening', upper: true, max: 10 }), A2 = TX('a2', 'TEAM.', { label: 'Opening line 1 · word 2 (highlighted)', group: 'Opening', upper: true, max: 12 });
    const B1 = TX('b1', 'WHOLE', { label: 'Opening line 2 · word 1', group: 'Opening', upper: true, max: 10 }), B2 = TX('b2', dpg ? 'BACKYARD.' : 'JOB.', { label: 'Opening line 2 · word 2', group: 'Opening', upper: true, max: 14 });
    const WORDS = TEAM.map(([w], k) => TX('w' + (k + 1), dpg || !svcs.length ? w : up(svcs[k % svcs.length]), { label: 'Service word ' + (k + 1), group: 'Service words', upper: true, max: 18 }));
    const E1 = TX('e1', 'ALL', { label: 'Closing word 1', group: 'Closing', upper: true, max: 10 }), E2 = TX('e2', 'ONE', { label: 'Closing word 2', group: 'Closing', upper: true, max: 10 }), E3 = TX('e3', 'TEAM.', { label: 'Closing word 3 (highlighted)', group: 'Closing', upper: true, max: 12 });
    const KICK = TX('kick', dpg ? 'ONE TEAM  ·  WHOLE BACKYARD' : 'ONE TEAM  ·  WHOLE JOB', { label: 'Kicker and ending line', group: 'Ending', upper: true, max: 36 });
    const CHIPS = (dpg || svcs.length < 2 ? ['DESIGN', 'BUILD', 'ONE TEAM'] : [up(svcs[0]), up(svcs[1]), 'ONE TEAM']).map((c, k) => TX('chip' + (k + 1), c, { label: 'Tag ' + (k + 1), group: 'Tags', upper: true, max: 18 }));
    const H0 = SHOT('s0', ['c12', 0.1], { label: 'Opening shot', group: 'Footage', kind: 'land', d: HOOK + 0.4 });
    const SH = TEAM.map(([w, c, inn], k) => SHOT('s' + (k + 1), [c, inn], { label: 'Shot for service word ' + (k + 1), group: 'Footage', kind: 'land', d: SEG + 0.4 }));
    const HL = SHOT('s9', ['c07', 6.05], { label: 'Closing shot', group: 'Footage', kind: 'land', d: 2.9 });
    const S = K3.shots([[H0[0], H0[1], HOOK]].concat(SH.map(x => [x[0], x[1], SEG])).concat([[HL[0], HL[1], 2.5]]));
    let fw = null, fWB = 0; const sizes = () => { if (!fw) { fw = WORDS.map(w => Math.min(150, fitSize(w, 900, 940, 300, 'Mont', -3))); fWB = Math.min(124, fitSize(B1 + ' ' + B2, 900, 960, 200, 'Mont', -3)); } };
    function elements() {
      const kiP = posOf(elP('kicker'), [60, 304]), cnP = posOf(elP('counter'), [W - 60, 214]);
      const o1P = posOf(elP('open1'), [W / 2, 420]), o2P = posOf(elP('open2'), [W / 2, 620]), clP = posOf(elP('close'), [W / 2, 450]);
      const tgP = posOf(elP('tags'), [W / 2, 1268]), ctP = posOf(elP('cta'), [W / 2, 1366]), coP = posOf(elP('contact'), [W / 2, 1456]);
      const words = WORDS.map((w, k) => { const wp = posOf(elP('word' + (k + 1)), [W / 2, 470]); return { id: 'word' + (k + 1), kind: 'pos', label: w, x: wp[0], y: wp[1], t0: HOOK + k * SEG, d: SEG, box: [wp[0] - 470, wp[1] - 100, 940, 200], dup: false, del: false }; });
      return [
        { id: 'kicker', kind: 'pos', label: KICK, x: kiP[0], y: kiP[1], t0: 0.3, d: DUR - 0.3, box: [kiP[0], kiP[1] - 40, 500, 60], dup: false, del: false },
        { id: 'counter', kind: 'pos', label: 'Shot counter', x: cnP[0], y: cnP[1], t0: 0, d: DUR, box: [cnP[0] - 200, cnP[1] - 40, 200, 60], dup: false, del: false },
        { id: 'open1', kind: 'pos', label: A1 + ' ' + A2, x: o1P[0], y: o1P[1], t0: 0, d: HOOK + 0.3, box: [o1P[0] - 470, o1P[1] - 90, 940, 180], dup: false, del: false },
        { id: 'open2', kind: 'pos', label: B1 + ' ' + B2, x: o2P[0], y: o2P[1], t0: 1.0, d: HOOK + 0.3 - 1.0, box: [o2P[0] - 470, o2P[1] - 90, 940, 180], dup: false, del: false },
        ...words,
        { id: 'close', kind: 'pos', label: [E1, E2, E3].join(' '), x: clP[0], y: clP[1], t0: ALL, d: DUR - ALL, box: [clP[0] - 470, clP[1] - 90, 940, 180], dup: false, del: false },
        { id: 'tags', kind: 'pos', label: CHIPS.join(' · '), x: tgP[0], y: tgP[1], t0: 1.6, d: DUR - 1.6, box: [tgP[0] - 495, tgP[1] - 40, 990, 80], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: CONTACT.cta, x: ctP[0], y: ctP[1], t0: 2.2, d: DUR - 2.2, box: [ctP[0] - 400, ctP[1] - 45, 800, 90], dup: false, del: false },
        { id: 'contact', kind: 'pos', label: CONTACT.phone + ' · ' + CONTACT.web, x: coP[0], y: coP[1], t0: 2.5, d: DUR - 2.5, box: [coP[0] - 490, coP[1] - 40, 980, 70], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [[0, 10], [0.5, 6]].concat(TEAM.map((x, k) => [HOOK + k * SEG, 5])).concat([[ALL + 0.5, 8]]), elements,
      render(t) {
        sizes(); K3.bgKinetic(t, CY, bar);
        const b = K3.band(S, t, { cy: CY, open: [0, 0.38], close: [OUT, 0.35], under: OR, drift: 8, flash: 0.55 });
        K3.brackets(b.r, b.lt, OR);
        const seg = Math.floor((t - HOOK) / SEG), inSeg = t >= HOOK && t < ALL;
        const body = chrome(t, OUT, KICK, S.length, b.i);
        if (body > 0) {
          if (t < HOOK + 0.3) { const q = (t - HOOK) / 0.25;
            const [a1x, a1y] = posOf(elP('open1'), [W / 2, 420]);
            K3.words([A1, A2], a1x, a1y, Math.min(120, fitSize(A1 + ' ' + A2, 900, 960, 200, 'Mont', -3)), t, 0, { hl: 1, q });
            const [b1x, b1y] = posOf(elP('open2'), [W / 2, 620]);
            K3.words([B1, B2], b1x, b1y, fWB, t, 1.0, { shadow: true, q }); }
          if (inSeg) { const k = seg, lt = t - HOOK - k * SEG;
            const [w1x, w1y] = posOf(elP('word' + (k + 1)), [W / 2, 470]);
            K3.words([WORDS[k]], w1x, w1y, fw[k], lt, 0, { hl: 0, q: (lt - (SEG - 0.22)) / 0.22, s0: 1.3 }); }
          if (t >= ALL) { const lt = t - ALL;
            const [e1x, e1y] = posOf(elP('close'), [W / 2, 450]);
            K3.words([E1, E2, E3], e1x, e1y, Math.min(120, fitSize([E1, E2, E3].join(' '), 900, 960, 200, 'Mont', -3)), lt, 0, { hl: 2, q: (t - (OUT - 0.25)) / 0.25 }); }
          const [tgx, tgy] = posOf(elP('tags'), [W / 2, 1268]);
          K3.chips(CHIPS, tgx, tgy, t, 1.6, { a: body, maxW: 990 });
          const [ct2x, ct2y] = posOf(elP('cta'), [W / 2, 1366]);
          pill(CONTACT.cta, ct2x, ct2y, { size: Math.min(30, fitSize(CONTACT.cta, 800, 900, 30, 'Mont', 2.5)), p: clamp((t - 2.2) / 0.4), alpha: body });
          const [cnx, cny] = posOf(elP('contact'), [W / 2, 1456]);
          caps(CONTACT.phone + '   ·   ' + CONTACT.web, cnx, cny, 27, clamp((t - 2.5) / 0.4) * body, 0, { w: 800, ls: 2, maxW: 980 });
        }
        if (t >= OUT + 0.2) K3.outro('kinetic', t - OUT, KICK);
      },
      cues() {
        const ev = [['impact', 0.0, 0.55, 0], ['boom', 0.02, 0.4, 0], ['snap', 0.02, 0.35, -0.2], ['snap', 0.52, 0.35, 0.2], ['pop', 0.7, 0.3, 0], ['snap', 1.02, 0.35, -0.2], ['snap', 1.52, 0.35, 0.2]];
        TEAM.forEach((x, k) => { const s = HOOK + k * SEG; ev.push(['whoosh', s, 0.24, k % 2 ? 0.3 : -0.3]); ev.push(['impact', s + 0.02, 0.3, 0]); ev.push(['ticks', s + 0.05, 0.12, 0, { dur: 0.3, n: 6 }]); });
        ev.push(['whoosh', ALL, 0.28, 0]); [0, 0.5, 1.0].forEach(d => ev.push(['snap', ALL + d + 0.02, 0.36, 0])); ev.push(['impact', ALL + 1.0, 0.42, 0]);
        outroCues(ev, OUT);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'pulse', bpm: BPM, key: 4, end: DUR - 0.6 }]], events: ev };
      },
    };
  }
  const P = V === 'team' ? team() : single();
  DIR = { dur: P.dur, bg: BLK, finish: { vig: 0.2, grain: 0.22 }, edl: [], shakes: P.shakes, preload: () => K3.init(), render: P.render, cues: P.cues, ...(P.elements ? { elements: P.elements } : {}) };
});
