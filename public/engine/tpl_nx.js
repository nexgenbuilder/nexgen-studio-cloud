'use strict';
/* NexGen templates, batch 1 (Oct 28). Every line is a TX field and every shot a SHOT field, with defaults drawn from the brand
   (name, services, industry noun) so each template reads right for any client. Landscape footage is always shown whole.
   Banners & frames:  ?v=banner  Info Banner      ?v=lower3 Lower Third     ?v=postcard Postcard
                      ?v=split   Split Stack      ?v=ticker News Ticker     ?v=cinema   Widescreen
   Motion & reveals:  ?v=textfill Footage in the Text   ?v=kinetic Kinetic Type   ?v=sting Logo Sting
                      ?v=shapes  Shape Reveal           ?v=wordswap Word Swap */
STUDIO_REG['nx'] = (() => {
  const V = QS.get('v') || 'banner';
  // Per-element model: tpl_free sets window.__NX_BLOCK_EL to the block's `el` data before calling this
  // factory; positions below fall back to the original hardcoded values when EL is null, so rendering
  // is byte-for-byte the old path. (Same pattern as tpl_trade.js / tpl_nx9.js.)
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const G = K3.G, D = K3.D, L = K5.LAND, VT = K5.VERT;
  const up = s => String(s || '').toUpperCase();
  const tagDef = () => (K5.isDPG() ? 'AWARD-WINNING DESIGN & BUILD' : (tagCaps() || up(BRAND.name)));
  const tagSentence = () => CONTACT.tagline || BRAND.name;
  const capOf = (k, s) => (K5.isDPG() ? (projOf(s.c || s[0]) || K5.svc(k)) : K5.svc(k));   // DPG captions name the project shown
  const fitT = (s, w, max, maxW, fam, ls) => Math.min(max, fitSize(s, w, maxW || 960, 400, fam || 'Mont', ls === undefined ? -2 : ls));

  // ---------------------------------------------------------------- Info Banner: title band on top, footage, info bar below
  function banner() {
    const SL = [L[0], L[1], L[2], L[4]], N = 4, SD = 2.6;
    const S = K5.shotsOf(SL, SD, 'land', 'Footage');
    const KICK = TX('kick', up(BRAND.name), { label: 'Top banner · small line', group: 'Top banner', upper: true, max: 30 });
    const TT = S.map((s, k) => TX('t' + (k + 1), K5.isDPG() ? (projOf(s.c) || K5.svc(k)) : K5.svc(k), { label: 'Title during shot ' + (k + 1), group: 'Top banner', upper: true, max: 20 }));
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const T0 = 0.3, OUT = T0 + S.total + 0.2, DUR = 15, CY = 800;
    S.forEach(s => (s.start += T0)); S.total += T0;
    function elements() {
      const kiP = posOf(elP('kick'), [540, 320]), tiP = posOf(elP('title'), [540, 418]), coP = posOf(elP('count'), [1016, 1156]);
      return [
        { id: 'kick', kind: 'pos', label: KICK, x: kiP[0], y: kiP[1], t0: 0.35, d: OUT - 0.35, box: [kiP[0] - 480, kiP[1] - 30, 960, 60], dup: false, del: false },
        { id: 'title', kind: 'pos', label: TT[0], x: tiP[0], y: tiP[1], t0: 0.45, d: OUT - 0.45, box: [tiP[0] - 480, tiP[1] - 80, 960, 160], dup: false, del: false },
        { id: 'count', kind: 'pos', label: 'Shot counter', x: coP[0], y: coP[1], t0: 0.3, d: OUT - 0.3, box: [coP[0] - 130, coP[1] - 30, 190, 60], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [[T0, 6]], elements,
      render(t) {
        K3.bgKinetic(t, CY, 2);
        const q = clamp((t - (OUT - 0.3)) / 0.3);
        const b = K3.band(S, t, { cy: CY, open: [T0, 0.4], close: [OUT - 0.1, 0.35], tr: 'push', flash: 0.35, under: OR });
        const y1 = K5.topBand(t, 0, 470, OR, q);
        if (y1 > 2) {
          const [kix, kiy] = posOf(elP('kick'), [W / 2, y1 - 150]);
          caps(KICK, kix, kiy, 24, clamp((t - 0.35) / 0.4), q, { fam: 'Mono', w: 700, ls: 5, col: K5.onAcc(), maxW: 960 });
          const k = Math.max(0, b.i), sh = S[k], lt = t - sh.start, tt = TT[k];
          const [tix, tiy] = posOf(elP('title'), [W / 2, y1 - 52]);
          T([[tt, K5.onAcc()]], tix, tiy, F(900, fitT(tt, 900, 104), 'Mont'), { align: 'center', ls: -2, p: clamp(k ? (lt - 0.05) / 0.35 : (t - 0.45) / 0.4), q: k < N - 1 ? clamp((lt - (sh.d - 0.22)) / 0.22) : q });
        }
        if (!b.closed) { const [cox, coy] = posOf(elP('count'), [W - 64, b.r[1] + b.r[3] + 52]); caps(String(b.i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0'), cox, coy, 20, 1 - q, 0, { fam: 'Mono', w: 700, ls: 3, align: 'right', col: 'rgba(255,255,255,0.7)', ls0: 0 }); }
        K5.pips(N, b.i, 1200, (1 - q) * clamp((t - 0.5) / 0.3));
        const yb = K5.bottomBar(t, 0.2, 1290, BLK, q);
        K5.infoRow(t, 0.6, yb + 110, false, 1 - q);
        if (t >= OUT + 0.15) K3.outro('kinetic', t - OUT, TAG);
      },
      cues() {
        const ev = [['whoosh', 0.05, 0.3, 0], ['impact', 0.3, 0.35, 0], ['tick', 0.45, 0.3, 0]];
        S.forEach((s, i) => { if (i) { ev.push(['whoosh', s.start, 0.24, i % 2 ? 0.3 : -0.3]); ev.push(['tick', s.start + 0.05, 0.25, 0]); } });
        ev.push(['pop', 0.7, 0.25, 0]); K5.outroCues(ev, OUT);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'pulse', bpm: 120, key: 2, end: DUR - 0.6 }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Lower Third: vertical footage, name and detail slide in
  function lower3() {
    const S = K5.shotsOf([VT[0], VT[1], VT[2]], [3.4, 3.4, 3.4], 'vert', 'Footage');
    const N1 = TX('n1', BRAND.name, { label: 'Lower third 1 · title', group: 'Lower thirds', max: 26 });
    const L1 = TX('l1', K5.isDPG() ? 'AWARD-WINNING DESIGN & BUILD' : K5.svc(0), { label: 'Lower third 1 · small line', group: 'Lower thirds', upper: true, max: 30 });
    const N2 = TX('n2', K5.isDPG() ? (projOf(S[1].c) ? projOf(S[1].c).replace(/\b\w+/g, w => w[0] + w.slice(1).toLowerCase()) : 'Recent project') : 'Recent work', { label: 'Lower third 2 · title', group: 'Lower thirds', max: 26 });
    const L2 = TX('l2', K5.svc(1), { label: 'Lower third 2 · small line', group: 'Lower thirds', upper: true, max: 30 });
    const N3 = TX('n3', ctaSentence(), { label: 'Lower third 3 · title', group: 'Lower thirds', max: 26 });
    const L3 = TX('l3', CONTACT.phone || CONTACT.web || '', { label: 'Lower third 3 · small line', group: 'Lower thirds', upper: true, max: 30 });
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const OUT = S.total, DUR = 14.5, LT = [[N1, L1], [N2, L2], [N3, L3]];
    function thirdGeom(txt, sub) {
      const sz = Math.min(60, fitSize(txt, 800, 860, 80, 'Mont', 0)), f1 = F(800, sz, 'Mont'), f2 = F(700, 26, 'Mono');
      const bw = Math.max(textW(txt, f1, 0), sub ? textW(sub, f2, 4) : 0) + 76, bh = sz * 1.32 + (sub ? 58 : 0);
      return { sz, bw, bh };
    }
    function third(txt, sub, x0, y, p, q) {
      if (VID.collecting || p <= 0 || q >= 1) return; const { sz, bw, bh } = thirdGeom(txt, sub), e = E.outQ(clamp(p)), x = E.inC(clamp(q)), c = G();
      c.beginPath(); c.rect(x0, y - bh, (bw + 20) * e * (1 - x), bh + 4); c.clip();
      c.fillStyle = 'rgba(11,11,11,0.86)'; c.fillRect(x0, y - bh, bw, bh); c.fillStyle = OR; c.fillRect(x0, y - bh, 12, bh);
      setF(F(800, sz, 'Mont'), 0); c.fillStyle = WHT; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText(txt, x0 + 42, y - bh + sz * 1.06);
      if (sub) { setF(F(700, 26, 'Mono'), 4); c.fillStyle = OR; c.fillText(sub, x0 + 42, y - 26); } D();
    }
    function elements() {
      return [0, 1, 2].map(k => {
        const { bw, bh } = thirdGeom(LT[k][0], up(LT[k][1]));
        const [tx, ty] = posOf(elP('third' + (k + 1)), [60, 1210 - bh]);
        return { id: 'third' + (k + 1), kind: 'box', label: LT[k][0], x: tx, y: ty, w: bw + 20, h: bh + 4, t0: S[k].start + 0.5, d: S[k].d - 0.5, box: [tx, ty, bw + 20, bh + 4], dup: false, del: false };
      });
    }
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        if (t < OUT + 0.4) { const r = K5.seq(S, t, [0, 0, W, H], ['cut', 'leak', 'leak'], 0.7); if (t > OUT) K5.fill([0, 0, W, H], BLK, clamp((t - OUT) / 0.4));
          scrim(H * 0.45, H, 0, 0.7); scrim(0, 420, 0.5, 0); K5.bug(t, 0.3, 1 - clamp((t - OUT + 0.2) / 0.3));
          const k = r.i, lt = t - S[k].start, { bh } = thirdGeom(LT[k][0], up(LT[k][1]));
          const [thx, thy] = posOf(elP('third' + (k + 1)), [60, 1210 - bh]);
          third(LT[k][0], up(LT[k][1]), thx, thy + bh, (lt - 0.5) / 0.45, (lt - (S[k].d - 0.45)) / 0.3); }
        if (t >= OUT + 0.1) { K3.bgKinetic(t, 700, 2); K3.outro('kinetic', t - OUT, TAG); }
      },
      cues() {
        const ev = [['air', 0.4, 0.25, 0]]; S.forEach((s, i) => { ev.push(['whoosh', s.start + 0.5, 0.2, -0.4]); ev.push(['tick', s.start + 0.95, 0.2, -0.3]); });
        K5.outroCues(ev, OUT); return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'lounge', bpm: 96, key: 0, end: DUR - 0.5 }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Postcard: paper, serif title, a mounted photo, a stamp, a note
  function postcard() {
    const S = K5.shotsOf([L[4], L[1]], [4.4, 4.4], 'land', 'Footage');
    const GREET = TX('greet', 'Greetings from', { label: 'Small line', group: 'Title', max: 24 });
    const TITLE = TX('title', K5.isDPG() ? (projOf(S[0].c) || 'YOUR NEW BACKYARD') : 'YOUR NEW ' + K5.noun(), { label: 'Title', group: 'Title', upper: true, max: 22 });
    const NOTE1 = TX('note1', 'wish you were here!', { label: 'Note under photo 1', group: 'Notes', max: 26 });
    const NOTE2 = TX('note2', 'this could be yours', { label: 'Note under photo 2', group: 'Notes', max: 26 });
    const RING = TX('ring', up(BRAND.name), { label: 'Stamp ring text', group: 'Stamp', upper: true, max: 22 });
    const TAG = TX('tag', tagSentence(), { label: 'Ending line', group: 'Ending', max: 34 });
    const T0 = 0.8, OUT = T0 + S.total, DUR = 14.5, PR0 = [110, 640, 860, 484], INK = LIGHTPAL ? BLK : '#1E1B18';
    const PR = EL && EL.box ? [num(EL.box.x, PR0[0]), num(EL.box.y, PR0[1]), num(EL.box.w, PR0[2]), num(EL.box.h, PR0[3])] : PR0;
    S.forEach(s => (s.start += T0)); S.total += T0;
    function elements() {
      const grP = posOf(elP('greet'), [540, 330]), tiP = posOf(elP('title'), [540, 470]);
      const n1P = posOf(elP('note1'), [540, 1290]), n2P = posOf(elP('note2'), [540, 1290]);
      const stP = posOf(elP('stamp'), [PR[0] + PR[2] - 40, PR[1] - 20]);
      return [
        { id: 'greet', kind: 'pos', label: GREET, x: grP[0], y: grP[1], t0: 0.1, d: OUT - 0.1, box: [grP[0] - 480, grP[1] - 50, 960, 80], dup: false, del: false },
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.35, d: OUT - 0.35, box: [tiP[0] - 480, tiP[1] - 90, 960, 180], dup: false, del: false },
        { id: 'photo', kind: 'box', label: 'Photo', x: PR[0], y: PR[1], w: PR[2], h: PR[3], t0: T0, d: S.total, box: [PR[0], PR[1], PR[2], PR[3]], dup: false, del: false },
        { id: 'note1', kind: 'pos', label: NOTE1, x: n1P[0], y: n1P[1], t0: T0 + 0.6, d: S[0].d - 0.6, box: [n1P[0] - 480, n1P[1] - 60, 960, 120], dup: false, del: false },
        { id: 'note2', kind: 'pos', label: NOTE2, x: n2P[0], y: n2P[1], t0: T0 + S[0].d + 0.6, d: S[1].d - 0.6, box: [n2P[0] - 480, n2P[1] - 60, 960, 120], dup: false, del: false },
        { id: 'stamp', kind: 'pos', label: 'Stamp', x: stP[0], y: stP[1], t0: T0 + 0.9, d: OUT - (T0 + 0.9), box: [stP[0] - 104, stP[1] - 104, 208, 208], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        K3.bgPaper(t); const q = clamp((t - (OUT - 0.3)) / 0.3);
        if (t < OUT) {
          const [grx, gry] = posOf(elP('greet'), [W / 2, 330]);
          K3.serifLines([GREET], grx, gry, 58, 60, t, 0.1, { align: 'center', col: INK, q });
          const z = fitT(TITLE, 900, 120, 940), [tix, tiy] = posOf(elP('title'), [W / 2, 470]);
          K3.words(TITLE.split(' '), tix, tiy, z, t, 0.35, { col: INK, step: 0.12, q, hl: TITLE.split(' ').length - 1, hlText: K5.onAcc() });
          if (t >= T0) {
            const pv = clamp((t - T0) / 0.5);
            ctx.save(); ctx.globalAlpha = clamp(pv * 2) * (1 - q); K3.mount(PR, -0.015, 31, { pad: 22 }); ctx.restore();
            if (t < T0 + 0.25) { } else { const r = K5.seq(S, t, PR, ['cut', 'toss'], 0.7); ctx.save(); ctx.globalAlpha = 1 - q; K3.tape(PR[0] + 100, PR[1] - 8, -0.35, 1); K3.tape(PR[0] + PR[2] - 100, PR[1] - 8, 0.35, 1); ctx.restore();
              const k = r.i, lt = t - S[k].start, [ntx, nty] = posOf(elP(k ? 'note2' : 'note1'), [W / 2, 1290]);
              hand(k ? NOTE2 : NOTE1, ntx, nty, 70, clamp((lt - 0.6) / 0.9), { col: INK, align: 'center', shadow: false, q: k ? q : clamp((lt - (S[k].d - 0.3)) / 0.3) }); }
            const [stx, sty] = posOf(elP('stamp'), [PR[0] + PR[2] - 40, PR[1] - 20]);
            K3.stamp(stx, sty, 104, (RING + '  •  ').repeat(2).slice(0, 34), up(BRAND.short).slice(0, 6), clamp((t - T0 - 0.9) / 0.35) * (1 - q), { col: OR, rot: 0.2 });
          }
        }
        if (t >= OUT + 0.1) K3.outro('editorial', t - OUT, TAG);
      },
      cues() {
        const ev = [['paper', 0.2, 0.35, 0], ['pencil', 0.4, 0.25, 0, {}], ['paper', T0 + 0.1, 0.4, 0], ['stamp', T0 + 1.0, 0.45, 0.2]];
        S.forEach((s, i) => { if (i) ev.push(['air', s.start, 0.3, 0.3]); ev.push(['scribble', s.start + 0.6, 0.2, -0.2, { dur: 0.8 }]); });
        K5.outroCues(ev, OUT, 'editorial'); return { dur: DUR, beds: [['music', 0, DUR, 0.9, { style: 'sketch', bpm: 100, key: 0, end: OUT }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Split Stack: two landscape shots stacked, a slam band between
  function split() {
    const SL = K5.fitList([L[5], L[2], L[0], L[1]], 5);
    const sh = SL.map(([c, inn], k) => SHOT('s' + (k + 1), [c, inn], { label: (k % 2 ? 'Bottom' : 'Top') + ' shot · round ' + (k < 2 ? 1 : 2), group: 'Footage', kind: 'land', d: 5 }));
    const A1 = TX('a1', 'UP CLOSE', { label: 'Round 1 · top label', group: 'Round 1', upper: true, max: 16 }), B1 = TX('b1', 'STEP BACK', { label: 'Round 1 · bottom label', group: 'Round 1', upper: true, max: 16 });
    const M1 = TX('m1', 'EVERY ANGLE.', { label: 'Round 1 · middle line', group: 'Round 1', upper: true, max: 18 });
    const A2 = TX('a2', K5.pick('BY DAY', 'THE DETAILS'), { label: 'Round 2 · top label', group: 'Round 2', upper: true, max: 16 }), B2 = TX('b2', K5.pick('AFTER DARK', 'THE FINISH'), { label: 'Round 2 · bottom label', group: 'Round 2', upper: true, max: 16 });
    const M2 = TX('m2', K5.pick('ALL DAY. ALL NIGHT.', 'BUILT RIGHT.'), { label: 'Round 2 · middle line', group: 'Round 2', upper: true, max: 18 });
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const RD = 4.6, OUT = 2 * RD + 0.2, DUR = 14.5, R1 = [0, 290, W, 607], R2 = [0, 1023, W, 607], MB = [0, 897, W, 126];
    function tag(id, lab, r, p) { if (VID.collecting || p <= 0) return; const f = F(800, 24, 'Mono'), w = textW(lab, f, 3) + 30, c = G(), [tx, ty] = posOf(elP(id), [r[0] + 30, r[1] + 26]); c.globalAlpha = clamp(p * 3); c.fillStyle = BLK; c.fillRect(tx, ty, w * E.outQ(clamp(p)), 44); setF(f, 3); c.fillStyle = WHT; c.textBaseline = 'middle'; c.beginPath(); c.rect(tx, ty, w * E.outQ(clamp(p)), 44); c.clip(); c.fillText(lab, tx + 15, ty + 23); D(); }
    function elements() {
      const tP = posOf(elP('toplabel'), [30, 316]), bP = posOf(elP('bottomlabel'), [30, 1049]), mP = posOf(elP('midline'), [540, 987]);
      return [
        { id: 'toplabel', kind: 'pos', label: A1, x: tP[0], y: tP[1], t0: 0.4, d: OUT - 0.4, box: [tP[0], tP[1], 300, 44], dup: false, del: false },
        { id: 'bottomlabel', kind: 'pos', label: B1, x: bP[0], y: bP[1], t0: 0.55, d: OUT - 0.55, box: [bP[0], bP[1], 300, 44], dup: false, del: false },
        { id: 'midline', kind: 'pos', label: M1, x: mP[0], y: mP[1], t0: 0.25, d: OUT - 0.25, box: [mP[0] - 480, mP[1] - 60, 960, 120], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [[0.1, 6], [RD, 6]], elements,
      render(t) {
        K3.bgKinetic(t, 960, 2); const q = clamp((t - (OUT - 0.3)) / 0.3);
        if (t < OUT) {
          const k = t < RD ? 0 : 1, lt = t - k * RD, a = sh[2 * k], b = sh[2 * k + 1], pa = sh[2 * k - 2], pb = sh[2 * k - 1];
          const open = E.outQ(clamp(t / 0.45)), r1 = [R1[0], R1[1], R1[2] * open, R1[3]], r2 = [R2[0] + R2[2] * (1 - open), R2[1], R2[2] * open, R2[3]];
          const dA = (s, l, R) => () => K5.whole(s[0], s[1], l, R), u = k && lt < 0.6 ? lt / 0.6 : 1;
          ctx.save(); ctx.globalAlpha = 1 - q;
          if (u < 1) { K4.run('slices', R1, u, dA(pa, lt + RD, R1), dA(a, lt, R1)); K4.run('blinds', R2, u, dA(pb, lt + RD, R2), dA(b, lt, R2)); }
          else { K5.whole(a[0], a[1], lt, r1); K5.whole(b[0], b[1], lt, r2); }
          ctx.restore();
          tag('toplabel', k ? A2 : A1, R1, (lt - 0.4) / 0.3 - q * 3); tag('bottomlabel', k ? B2 : B1, R2, (lt - 0.55) / 0.3 - q * 3);
          const m = k ? M2 : M1, mb = E.outQ(clamp((t - 0.25) / 0.35)) * (1 - E.inC(q));
          K5.fill([0, MB[1] + MB[3] / 2 * (1 - mb), W, MB[3] * mb], OR);
          if (mb > 0.5) { const [mjx, mjy] = posOf(elP('midline'), [W / 2, MB[1] + 90]); K3.words(m.split(' '), mjx, mjy, fitT(m, 900, 78, 980, 'Mont', -3), lt, 0.5, { col: K5.onAcc(), step: 0.16, q: k ? q : clamp((lt - (RD - 0.25)) / 0.25), hl: -1 }); }
        }
        if (t >= OUT + 0.1) K3.outro('kinetic', t - OUT, TAG);
      },
      cues() {
        const ev = [['impact', 0.1, 0.4, 0], ['whoosh', 0.05, 0.3, 0]];
        [0, RD].forEach((s, k) => { if (k) { ev.push(['whoosh', s, 0.3, 0]); ev.push(['impact', s + 0.1, 0.3, 0]); } ev.push(['snap', s + 0.5, 0.3, 0]); ev.push(['tick', s + 0.45, 0.2, -0.3]); ev.push(['tick', s + 0.6, 0.2, 0.3]); });
        K5.outroCues(ev, OUT); return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'pulse', bpm: 120, key: 4, end: DUR - 0.6 }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- News Ticker: "just in" band, footage, scrolling service ticker
  function ticker() {
    const S = K5.shotsOf([L[3], L[6], L[1]], [2.8, 2.8, 2.8], 'land', 'Footage');
    const BOX = TX('box', 'JUST IN', { label: 'Tag box', group: 'Top banner', upper: true, max: 12 });
    const HEAD = TX('head', K5.isDPG() ? (projOf(S[0].c) ? projOf(S[0].c) + ' IS DONE' : 'ANOTHER ONE DONE') : 'FRESH OFF THE JOB', { label: 'Headline', group: 'Top banner', upper: true, max: 24 });
    const LIVE = TX('live', 'NOW BOOKING', { label: 'Line under the footage', group: 'Middle', upper: true, max: 22 });
    const TICK = TX('tick', (BRAND.services || []).slice(0, 6).join('  •  ') || 'OUR WORK  •  OUR TEAM', { label: 'Ticker text', group: 'Ticker', upper: true, max: 120 });
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const T0 = 0.35, OUT = T0 + S.total + 0.3, DUR = 14, CY = 820;
    S.forEach(s => (s.start += T0)); S.total += T0;
    function elements() {
      const bxP = posOf(elP('box'), [60, 270]), heP = posOf(elP('head'), [60, 410]), liP = posOf(elP('live'), [104, 1186]), tkP = posOf(elP('ticker'), [0, 1296]);
      return [
        { id: 'box', kind: 'pos', label: BOX, x: bxP[0], y: bxP[1], t0: 0.3, d: OUT - 0.3, box: [bxP[0], bxP[1], 260, 56], dup: false, del: false },
        { id: 'head', kind: 'pos', label: HEAD, x: heP[0], y: heP[1], t0: 0.5, d: OUT - 0.5, box: [heP[0], heP[1] - 70, 960, 120], dup: false, del: false },
        { id: 'live', kind: 'pos', label: LIVE, x: liP[0], y: liP[1], t0: 0.8, d: OUT - 0.8, box: [liP[0] - 24, liP[1] - 30, 400, 60], dup: false, del: false },
        { id: 'ticker', kind: 'box', label: 'Ticker strip', x: tkP[0], y: tkP[1], w: 1080, h: 64, t0: 0.2, d: OUT - 0.2, box: [tkP[0], tkP[1], 1080, 64], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [[T0, 6]], elements,
      render(t) {
        K3.bgKinetic(t, CY, 2); const q = clamp((t - (OUT - 0.3)) / 0.3);
        const b = K3.band(S, t, { cy: CY, open: [T0, 0.4], close: [OUT - 0.1, 0.35], tr: 'push', flash: 0.4 });
        const y1 = K5.topBand(t, 0, 470, OR, q);
        if (y1 > 2 && !VID.collecting) {
          const f = F(900, 30, 'Mont'), bw = textW(BOX, f, 3) + 44, p = clamp((t - 0.3) / 0.3), c = G(), [bxx, bxy] = posOf(elP('box'), [60, y1 - 200]);
          c.globalAlpha = 1 - q; c.fillStyle = BLK; c.fillRect(bxx, bxy, bw * E.outQ(p), 56);
          setF(f, 3); c.fillStyle = WHT; c.textBaseline = 'middle'; c.beginPath(); c.rect(bxx, bxy, bw * E.outQ(p), 56); c.clip(); c.fillText(BOX, bxx + 22, bxy + 29); D();
          const [hex, hey] = posOf(elP('head'), [60, y1 - 60]);
          T([[HEAD, K5.onAcc()]], hex, hey, F(900, fitT(HEAD, 900, 92, 960), 'Mont'), { ls: -2, p: clamp((t - 0.5) / 0.4), q });
        }
        if (!b.closed && !VID.collecting) { const [lix, liy] = posOf(elP('live'), [104, b.r[1] + b.r[3] + 62]), on = Math.floor(t * 2) % 2 === 0, c = G(); c.globalAlpha = 1 - q; c.fillStyle = on ? OR : ORA(0.35); c.beginPath(); c.arc(lix - 24, liy - 9, 10, 0, 7); c.fill(); D();
          caps(LIVE, lix, liy, 26, clamp((t - 0.8) / 0.4), q, { fam: 'Mono', w: 700, ls: 4, align: 'left', ls0: 0 }); }
        const yb = K5.bottomBar(t, 0.2, 1290, BLK, q);
        if (yb < H && !VID.collecting) {   // the ticker strip
          const c = G(), f = F(800, 30, 'Mont'), s = TICK + '      •      ', sw = textW(s, f, 2), x0 = -((t * 160) % sw), [tkx, tky] = posOf(elP('ticker'), [0, yb + 6]); c.globalAlpha = 1 - q;
          c.fillStyle = OR; c.fillRect(tkx, tky, W, 64); setF(f, 2); c.fillStyle = K5.onAcc(); c.textBaseline = 'middle'; c.beginPath(); c.rect(tkx, tky, W, 64); c.clip();
          for (let x = x0; x < W; x += sw) c.fillText(s, x, tky + 33); D();
        }
        K5.infoRow(t, 0.6, yb + 175, false, 1 - q);
        if (t >= OUT + 0.15) K3.outro('kinetic', t - OUT, TAG);
      },
      cues() {
        const ev = [['switch', 0.3, 0.35, -0.3], ['impact', 0.35, 0.3, 0], ['ticks', 0.5, 0.15, 0, { dur: 0.5, n: 10 }]];
        S.forEach((s, i) => { if (i) ev.push(['whoosh', s.start, 0.24, i % 2 ? 0.3 : -0.3]); }); K5.outroCues(ev, OUT);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'night', bpm: 104, key: -2, click: 0.3, end: DUR - 0.5 }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Widescreen: serif title above, footage, captions below
  function cinema() {
    const S = K5.shotsOf([L[1], L[4], L[3]], [3.2, 3.2, 3.2], 'land', 'Footage');
    const KICK = TX('kick', up(BRAND.name), { label: 'Small line', group: 'Title', upper: true, max: 30 });
    const TITLE = TX('title', K5.pick('A backyard\nworth the wait.', 'Made with\ncare.'), { label: 'Title (two lines)', group: 'Title', max: 40, multiline: true });
    const CAP = S.map((s, k) => TX('c' + (k + 1), capOf(k, s), { label: 'Caption under shot ' + (k + 1), group: 'Captions', upper: true, max: 28 }));
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const T0 = 0.9, OUT = T0 + S.total + 0.3, DUR = 14.5, CY = 900;
    S.forEach(s => (s.start += T0)); S.total += T0;
    const lines = TITLE.split('\n').slice(0, 2);
    function elements() {
      const kiP = posOf(elP('kick'), [540, 300]), tiP = posOf(elP('title'), [540, 440]), caP = posOf(elP('caption'), [540, 1284]);
      return [
        { id: 'kick', kind: 'pos', label: KICK, x: kiP[0], y: kiP[1], t0: 0.1, d: OUT - 0.1, box: [kiP[0] - 480, kiP[1] - 30, 960, 60], dup: false, del: false },
        { id: 'title', kind: 'pos', label: TITLE.split('\n').join(' '), x: tiP[0], y: tiP[1], t0: 0.3, d: OUT - 0.3, box: [tiP[0] - 480, tiP[1] - 120, 960, 260], dup: false, del: false },
        { id: 'caption', kind: 'pos', label: CAP[0], x: caP[0], y: caP[1], t0: T0 + 0.25, d: OUT - (T0 + 0.25), box: [caP[0] - 480, caP[1] - 30, 960, 60], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        const q = clamp((t - (OUT - 0.4)) / 0.4);
        const b = K3.band(S, t, { cy: CY, open: [T0, 0.7], close: [OUT - 0.15, 0.4], tr: 'dissolve', flash: false });
        const [kix, kiy] = posOf(elP('kick'), [W / 2, 300]);
        caps(KICK, kix, kiy, 22, clamp((t - 0.1) / 0.5), q, { fam: 'Mono', w: 700, ls: 6, col: OR, maxW: 960 });
        const z = Math.min(122, ...lines.map(l => fitSize(l, 600, 960, 200, 'Corm', 0, 'italic')));
        const [tix, tiy] = posOf(elP('title'), [W / 2, 440]);
        K3.serifLines(lines, tix, tiy, z, z * 1.02, t, 0.3, { align: 'center', col: WHT, q });
        if (!b.closed) { const k = b.i, lt = t - S[k].start, y = b.r[1] + b.r[3] + 70;
          rule(W / 2, y - 40, 120, clamp((lt - 0.1) / 0.5), { col: OR, h: 2, q: k < 2 ? clamp((lt - (S[k].d - 0.3)) / 0.3) : q });
          const [cax, cay] = posOf(elP('caption'), [W / 2, y + 10]);
          caps(CAP[k], cax, cay, 26, clamp((lt - 0.25) / 0.5), k < 2 ? clamp((lt - (S[k].d - 0.3)) / 0.3) : q, { fam: 'Mono', w: 700, ls: 6, maxW: 960 }); }
        if (t >= OUT + 0.15) { K3.bgKinetic(t, 700, 2.5); K3.outro('kinetic', t - OUT, TAG); }
      },
      cues() {
        const ev = [['air', 0.2, 0.25, 0], ['shimmer', 0.5, 0.2, 0], ['air', T0, 0.3, 0]];
        S.forEach((s, i) => { if (i) ev.push(['air', s.start, 0.2, i % 2 ? 0.3 : -0.3]); ev.push(['tink', s.start + 0.3, 0.1, 0]); }); K5.outroCues(ev, OUT);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'cinematic', bpm: 84, key: 0, drop: T0, lift: OUT + 10, end: OUT }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Footage in the Text: giant words full of footage that open up
  function textfill() {
    const BT = 3.3, N = 3, SL = K5.fitList([VT[0], VT[1], VT[3]], BT + 0.5);
    const sh = SL.map(([c, inn], k) => SHOT('s' + (k + 1), [c, inn], { label: 'Shot ' + (k + 1) + ' (vertical fills the letters best)', group: 'Footage', kind: 'any', d: BT + 0.5 }));
    const WD = K5.pick(['DESIGN', 'BUILD', 'ENJOY'], ['SEE', 'THE', 'DIFFERENCE']).map((w, k) => TX('w' + (k + 1), w, { label: 'Word ' + (k + 1), group: 'Words', upper: true, max: 12, hint: 'One short word per beat' }));
    const CAP = WD.map((w, k) => TX('c' + (k + 1), capOf(k, sh[k]), { label: 'Caption after word ' + (k + 1) + ' opens', group: 'Captions', upper: true, max: 26 }));
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const OUT = N * BT, DUR = 14;
    function elements() {
      const woP = posOf(elP('word'), [540, 900]), coP = posOf(elP('count'), [540, 380]), caP = posOf(elP('caption'), [540, 1220]);
      return [
        { id: 'word', kind: 'pos', label: WD[0], x: woP[0], y: woP[1], t0: 0, d: OUT, box: [woP[0] - 480, woP[1] - 200, 960, 400], dup: false, del: false },
        { id: 'count', kind: 'pos', label: 'Beat counter', x: coP[0], y: coP[1], t0: 0.2, d: 1.5, box: [coP[0] - 120, coP[1] - 30, 240, 60], dup: false, del: false },
        { id: 'caption', kind: 'pos', label: CAP[0], x: caP[0], y: caP[1], t0: 2.3, d: OUT - 2.3, box: [caP[0] - 480, caP[1] - 40, 960, 80], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [0, 1, 2].map(k => [k * BT + 1.6, 7]), elements,
      render(t) {
        if (t < OUT) {
          const k = Math.min(N - 1, Math.floor(t / BT)), lt = t - k * BT, s = sh[k], drawF = () => K5.whole(s[0], s[1], lt, [0, 0, W, H]);
          if (!VID.collecting) fillScreen(BLK);
          const z = Math.min(560, fitSize(WD[k], 400, 990, 900, 'Bebas', 4)), grow = clamp((lt - 1.55) / 0.65);
          const [wox, woy] = posOf(elP('word'), [W / 2, 900]);
          if (grow < 1) K5.footWord([WD[k]], wox, woy, z, 'Bebas', drawF, grow, clamp(lt / 0.2), { pop: lt / 0.5, stroke: OR, strokeA: 0.8 });
          else drawF();
          if (lt < 1.5) { const [cox, coy] = posOf(elP('count'), [W / 2, 380]); caps(String(k + 1).padStart(2, '0') + ' / 0' + N, cox, coy, 22, clamp((lt - 0.2) / 0.3), 0, { fam: 'Mono', w: 700, ls: 4, col: OR }); }
          if (grow >= 1) { scrim(H * 0.5, H, 0, 0.7); const [cax, cay] = posOf(elP('caption'), [W / 2, 1220]); kicker(CAP[k], cax, cay, clamp((lt - 2.3) / 0.3), { align: 'center', size: 28, ls: 5, maxW: 960, q: k < N - 1 ? clamp((lt - (BT - 0.2)) / 0.2) : clamp((t - (OUT - 0.2)) / 0.2), shadow: ['rgba(0,0,0,0.6)', 20, 2] }); }
          if (lt > BT - 0.12 && k < N - 1 && !VID.collecting) fillScreen('#FFFFFF', (lt - (BT - 0.12)) / 0.12 * 0.8);
          K5.bug(t, 0.2, 1 - clamp((t - OUT + 0.3) / 0.3));
        }
        if (t >= OUT) { if (t < OUT + 0.4) { const s = sh[N - 1]; K5.whole(s[0], s[1], t - (N - 1) * BT, [0, 0, W, H], { alpha: 1 - (t - OUT) / 0.4 }); } K3.outro('kinetic', t - OUT, TAG); }
      },
      cues() {
        const ev = [];
        for (let k = 0; k < N; k++) { const s = k * BT; ev.push(['impact', s + 0.02, 0.45, 0]); ev.push(['boom', s + 0.05, 0.3, 0]); ev.push(['riser', s + 1.55, 0.3, 0]); ev.push(['whoosh', s + 1.9, 0.35, 0]); ev.push(['shimmer', s + 2.2, 0.15, 0]); }
        K5.outroCues(ev, OUT); return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'pulse', bpm: 120, key: 1, end: DUR - 0.6 }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Kinetic Type: slam words with shapes, then the footage band
  function kinetic() {
    const S = K5.shotsOf([L[2], L[0], L[3]], [2.4, 2.4, 2.4], 'land', 'Footage');
    const WS = K5.pick(['DESIGN.', 'BUILD.', 'RELAX.', 'REPEAT.'], ['READY', 'FOR', 'A', 'CHANGE?']).map((w, k) => TX('w' + (k + 1), w, { label: 'Slam word ' + (k + 1), group: 'Opening words', upper: true, max: 12 }));
    const H1 = TX('h1', K5.pick('YOUR BACKYARD,', 'LET’S MAKE IT'), { label: 'Headline line 1', group: 'Headline', upper: true, max: 18 });
    const H2 = TX('h2', K5.pick('DONE RIGHT.', 'HAPPEN.'), { label: 'Headline line 2 (highlighted)', group: 'Headline', upper: true, max: 16 });
    const CH = [0, 1, 2].map(k => TX('chip' + (k + 1), K5.svc(k), { label: 'Tag ' + (k + 1), group: 'Tags', upper: true, max: 18 }));
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const bt = 0.5, P1 = WS.length * 0.6 + 0.3, OUT = P1 + S.total + 0.2, DUR = 14.5, CY = 840;
    S.forEach(s => (s.start += P1)); S.total += P1;
    const HZ = Math.min(fitT(H1, 900, 110, 960, 'Mont', -3), fitT(H2, 900, 120, 960, 'Mont', -3));
    function elements() {
      const woP = posOf(elP('word'), [540, 960]), h1P = posOf(elP('headline'), [540, 380]), h2P = posOf(elP('headline2'), [540, 380 + HZ * 1.05]), chP = posOf(elP('chips'), [540, 1230]);
      return [
        { id: 'word', kind: 'pos', label: WS[0], x: woP[0], y: woP[1], t0: 0, d: P1, box: [woP[0] - 480, woP[1] - 140, 960, 280], dup: false, del: false },
        { id: 'headline', kind: 'pos', label: H1, x: h1P[0], y: h1P[1], t0: P1 + 0.1, d: OUT - (P1 + 0.1), box: [h1P[0] - 480, h1P[1] - 90, 960, 160], dup: false, del: false },
        { id: 'headline2', kind: 'pos', label: H2, x: h2P[0], y: h2P[1], t0: P1 + 0.4, d: OUT - (P1 + 0.4), box: [h2P[0] - 480, h2P[1] - 90, 960, 160], dup: false, del: false },
        { id: 'chips', kind: 'pos', label: 'Tags', x: chP[0], y: chP[1], t0: P1 + 0.8, d: OUT - (P1 + 0.8), box: [chP[0] - 480, chP[1] - 40, 960, 80], dup: false, del: false },
      ];
    }
    function shapes(t, t0) {   // rings and bars on each beat
      if (VID.collecting) return; const lt = t - t0; if (lt < 0 || lt > 0.6) return; const u = lt / 0.6, c = G();
      c.strokeStyle = OR; c.globalAlpha = 1 - u; c.lineWidth = 10 * (1 - u) + 2; c.beginPath(); c.arc(W / 2, 900, 120 + 520 * E.outC(u), 0, 7); c.stroke();
      c.fillStyle = OR; c.globalAlpha = 0.85 * (1 - u); const bw = W * E.outQ(u); c.fillRect(0, 640, bw, 14); c.fillRect(W - bw, 1160, bw, 14); D();
    }
    return {
      dur: DUR, shakes: WS.map((w, k) => [k * 0.6, 8]).concat([[P1, 6]]), elements,
      render(t) {
        K3.bgKinetic(t, CY, 2); const q = clamp((t - (OUT - 0.3)) / 0.3);
        if (t < P1) { const k = Math.min(WS.length - 1, Math.floor(t / 0.6)), lt = t - k * 0.6; shapes(t, k * 0.6);
          const [wox, woy] = posOf(elP('word'), [W / 2, 960]);
          K3.words([WS[k]], wox, woy, fitT(WS[k], 900, 230, 980, 'Mont', -4), lt, 0, { hl: k % 2 ? 0 : -1, s0: 1.5, shadow: true, q: k < WS.length - 1 ? clamp((lt - 0.5) / 0.1) : clamp((t - (P1 - 0.15)) / 0.15) }); }
        else {
          const b = K3.band(S, t, { cy: CY, open: [P1, 0.35], close: [OUT - 0.1, 0.35], tr: 'jump', flash: 0.55, under: OR, drift: 8 }); K3.brackets(b.r, b.lt, OR);
          const zz = HZ, [h1x, h1y] = posOf(elP('headline'), [W / 2, 380]), [h2x, h2y] = posOf(elP('headline2'), [W / 2, 380 + zz * 1.05]);
          K3.words(H1.split(' '), h1x, h1y, zz, t, P1 + 0.1, { step: 0.14, q }); K3.words(H2.split(' '), h2x, h2y, zz, t, P1 + 0.4, { step: 0.14, hl: H2.split(' ').length - 1, shadow: true, q, hlText: K5.onAcc() });
          const [chx, chy] = posOf(elP('chips'), [W / 2, 1230]);
          K3.chips(CH, chx, chy, t, P1 + 0.8, { a: 1 - q, maxW: 990 }); K5.ctaRow(t, 1330, P1 + 1.2, 1 - q);
        }
        if (t >= OUT + 0.15) K3.outro('kinetic', t - OUT, TAG);
      },
      cues() {
        const ev = []; WS.forEach((w, k) => { ev.push(['impact', k * 0.6 + 0.01, 0.45, 0]); ev.push(['snap', k * 0.6 + 0.02, 0.3, (k % 2 ? 0.3 : -0.3)]); });
        ev.push(['whoosh', P1, 0.35, 0]); ev.push(['boom', P1 + 0.05, 0.3, 0]); S.forEach((s, i) => { if (i) { ev.push(['whoosh', s.start, 0.22, 0]); ev.push(['tick', s.start + 0.03, 0.2, 0]); } });
        K5.outroCues(ev, OUT); return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'pulse', bpm: 120, key: 3, end: DUR - 0.6 }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Logo Sting: rings, rays and the logo build (6 s, no footage)
  function sting() {
    const TAG = TX('tag', tagDef(), { label: 'Line under the logo', group: 'Sting', upper: true, max: 36 });
    const DUR = 6;
    function elements() {
      const taP = posOf(elP('tag'), [540, 1100]);
      return [
        { id: 'tag', kind: 'pos', label: TAG, x: taP[0], y: taP[1], t0: 2.0, d: 3.4, box: [taP[0] - 480, taP[1] - 40, 960, 80], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [[0.95, 9]], elements,
      render(t) {
        K3.bgKinetic(t, 900, 2);
        if (!VID.collecting) {
          const c = G();
          for (let k = 0; k < 3; k++) { const u = clamp((t - 0.1 - k * 0.14) / 1.1); if (u > 0 && u < 1) { c.strokeStyle = k === 1 ? WHT : OR; c.globalAlpha = (1 - u) * 0.9; c.lineWidth = 14 * (1 - u) + 2; c.beginPath(); c.arc(W / 2, 900, 60 + 760 * E.outC(u), 0, 7); c.stroke(); } }
          for (let k = 0; k < 12; k++) { const u = clamp((t - 0.55 - k * 0.025) / 0.7); if (u <= 0 || u >= 1) continue; const a = k / 12 * Math.PI * 2, r0 = 140 + 360 * E.outC(u), r1 = r0 + 160 * (1 - u);
            c.strokeStyle = OR; c.globalAlpha = 1 - u; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(W / 2 + Math.cos(a) * r0, 900 + Math.sin(a) * r0); c.lineTo(W / 2 + Math.cos(a) * r1, 900 + Math.sin(a) * r1); c.stroke(); }
          D();
          if (t > 0.9) K4.sparkles([140, 600, 800, 600], t, 26, 0.7 * clamp((t - 0.9) / 0.4) * (1 - clamp((t - 4.8) / 0.6)));
        }
        K3.logoBuild(W / 2, 880, 860, 0.85, t);
        const [tax, tay] = posOf(elP('tag'), [W / 2, 1100]);
        caps(TAG, tax, tay, 26, clamp((t - 2.0) / 0.5), clamp((t - 5.4) / 0.4), { fam: 'Mono', w: 700, ls: 5, col: 'rgba(255,255,255,0.85)', maxW: 960 });
        rule(W / 2, 1040, 200, clamp((t - 1.8) / 0.5), { col: OR, h: 3, q: clamp((t - 5.4) / 0.4) });
        if (!VID.collecting && t > 5.5) fillScreen(BLK, (t - 5.5) / 0.5);
      },
      cues() {
        const ev = [['riser', 0.6, 0.35, 0], ['whoosh', 0.55, 0.35, 0], ['impact', 0.95, 0.5, 0], ['boom', 0.97, 0.45, 0], ['clack', 1.25, 0.4, -0.3], ['clack', 1.37, 0.4, 0], ['clack', 1.49, 0.4, 0.3], ['shimmer', 1.6, 0.3, 0], ['chime', 2.1, 0.3, 0]];
        return { dur: DUR, beds: [['music', 0, DUR, 0.9, { style: 'cinematic', bpm: 90, key: 0, drop: 0.95, lift: 20, end: 5.4 }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Shape Reveal: footage opens through circles, panels and bars
  function shapes() {
    const S = K5.shotsOf([L[0], L[2], L[5]], [3.1, 3.1, 3.1], 'land', 'Footage');
    const KICK = TX('kick', up(BRAND.name), { label: 'Small line', group: 'Headline', upper: true, max: 30 });
    const H1 = TX('h1', K5.pick('SHAPED', 'MADE'), { label: 'Headline word 1', group: 'Headline', upper: true, max: 12 }), H2 = TX('h2', K5.pick('BY HAND.', 'TO MEASURE.'), { label: 'Headline word 2 (highlighted)', group: 'Headline', upper: true, max: 14 });
    const CAP = S.map((s, k) => TX('c' + (k + 1), capOf(k, s), { label: 'Caption under shot ' + (k + 1), group: 'Captions', upper: true, max: 26 }));
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const T0 = 0.5, OUT = T0 + S.total + 0.2, DUR = 14, BAND = [0, 597, W, 607];
    S.forEach(s => (s.start += T0)); S.total += T0;
    function reveal(k, lt, s) {
      const R = K3.wholeIn(s.c, BAND), u = E.inOutC(clamp(lt / 0.7)), draw = () => K3.clip(s.c, s.in, lt, R), c = R;
      if (u >= 1) { draw(); return; }
      if (k === 0) { const r = u * Math.hypot(R[2], R[3]) * 0.55; K4.clipTo(g => g.arc(R[0] + R[2] / 2, R[1] + R[3] / 2, Math.max(1, r), 0, 7), draw);
        if (!VID.collecting) { const g = G(); g.strokeStyle = OR; g.lineWidth = 10; g.beginPath(); g.arc(R[0] + R[2] / 2, R[1] + R[3] / 2, r, 0, 7); g.stroke(); D(); } }
      else if (k === 1) { for (let j = 0; j < 3; j++) { const v = E.inOutC(clamp(lt / 0.7 * 1.3 - j * 0.15)), w = c[2] / 3 + 60, x = c[0] + j * c[2] / 3 - 30 + (1 - v) * (j % 2 ? 1 : -1) * c[3];
          K4.clipTo(g => { g.moveTo(x + 60, c[1]); g.lineTo(x + w + 60, c[1]); g.lineTo(x + w - 60, c[1] + c[3]); g.lineTo(x - 60, c[1] + c[3]); g.closePath(); }, draw); } }
      else { const n = 5, h = c[3] / n; for (let j = 0; j < n; j++) { const v = E.outQ(clamp(lt / 0.7 * 1.4 - j * 0.08)), w = c[2] * v; K4.clipTo(g => g.rect(j % 2 ? c[0] + c[2] - w : c[0], c[1] + j * h, w, h + 1), draw);
          if (!VID.collecting && v < 1) { const g = G(); g.fillStyle = OR; g.fillRect(j % 2 ? c[0] + c[2] - w - 8 : c[0] + w, c[1] + j * h, 8, h); D(); } } }
    }
    function elements() {
      const kiP = posOf(elP('kick'), [540, 300]), heP = posOf(elP('headline'), [540, 470]), caP = posOf(elP('caption'), [540, 1290]);
      return [
        { id: 'kick', kind: 'pos', label: KICK, x: kiP[0], y: kiP[1], t0: 0.1, d: OUT - 0.1, box: [kiP[0] - 480, kiP[1] - 30, 960, 60], dup: false, del: false },
        { id: 'headline', kind: 'pos', label: H1 + ' ' + H2, x: heP[0], y: heP[1], t0: 0.2, d: OUT - 0.2, box: [heP[0] - 480, heP[1] - 80, 960, 160], dup: false, del: false },
        { id: 'caption', kind: 'pos', label: CAP[0], x: caP[0], y: caP[1], t0: T0 + 0.5, d: OUT - (T0 + 0.5), box: [caP[0] - 480, caP[1] - 30, 960, 60], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        K3.bgKinetic(t, 900, 2); const q = clamp((t - (OUT - 0.3)) / 0.3);
        if (t < OUT) {
          const [kix, kiy] = posOf(elP('kick'), [W / 2, 300]);
          kicker(KICK, kix, kiy, clamp((t - 0.1) / 0.3), { align: 'center', size: 22, ls: 5, maxW: 960, q });
          const z = Math.min(fitT(H1 + ' ' + H2, 900, 120, 980, 'Mont', -3));
          const [hex, hey] = posOf(elP('headline'), [W / 2, 470]);
          K3.words([H1, H2], hex, hey, z, t, 0.2, { hl: 1, step: 0.25, q, hlText: K5.onAcc() });
          if (t >= T0) { const { i, sh, lt } = K3.shotAt(S, clamp(t, T0, S.total - 0.01)); ctx.save(); ctx.globalAlpha = 1 - q; reveal(i, lt, sh); ctx.restore();
            const [cax, cay] = posOf(elP('caption'), [W / 2, 1290]);
            caps(CAP[i], cax, cay, 26, clamp((lt - 0.5) / 0.4), i < 2 ? clamp((lt - (sh.d - 0.25)) / 0.25) : q, { fam: 'Mono', w: 700, ls: 5, maxW: 960 }); K5.pips(3, i, 1340, 1 - q); }
        }
        if (t >= OUT + 0.1) K3.outro('kinetic', t - OUT, TAG);
      },
      cues() {
        const ev = [['impact', 0.2, 0.3, 0], ['snap', 0.45, 0.3, 0.2]]; S.forEach((s, i) => { ev.push(['whoosh', s.start + 0.2, 0.28, i % 2 ? 0.3 : -0.3]); ev.push(['tick', s.start + 0.6, 0.2, 0]); });
        K5.outroCues(ev, OUT); return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'night', bpm: 100, key: 0, click: T0, end: DUR - 0.5 }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Word Swap: "WE DO ___" with the word and footage rolling
  function wordswap() {
    const SL = K5.isDPG() ? [['c08', 5.99], ['c11', 15.0], ['c07', 12.05], ['c12', 8.5], ['c05', 4.1]] : [L[0], L[1], L[2], L[3], L[4]];
    const N = 5, WD = 1.8;
    const S = K5.shotsOf(SL, Array(N).fill(WD), 'land', 'Footage', SL.map((x, k) => 'Shot for word ' + (k + 1)));
    const LEAD = TX('lead', K5.pick('WE BUILD', 'WE DO'), { label: 'Lead line', group: 'Words', upper: true, max: 16 });
    const WS = [0, 1, 2, 3, 4].map(k => TX('w' + (k + 1), K5.svc(k), { label: 'Word ' + (k + 1), group: 'Words', upper: true, max: 20 }));
    const PAY = TX('pay', 'ALL OF IT.', { label: 'Payoff', group: 'Words', upper: true, max: 16 });
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const T0 = 0.4, ALL = T0 + N * WD, OUT = ALL + 1.7, DUR = 15, CY = 880;
    S.forEach(s => (s.start += T0)); S.total += T0;
    const words = WS.concat([PAY]), sz = Math.min(80, ...words.map(w => fitSize(w, 900, 880, 200, 'Mont', -1)));
    function elements() {
      const leP = posOf(elP('lead'), [540, 360]), woP = posOf(elP('word'), [540, 470]);
      return [
        { id: 'lead', kind: 'pos', label: LEAD, x: leP[0], y: leP[1], t0: 0, d: OUT, box: [leP[0] - 480, leP[1] - 60, 960, 120], dup: false, del: false },
        { id: 'word', kind: 'pos', label: WS[0], x: woP[0], y: woP[1], t0: 0, d: ALL, box: [woP[0] - 480, woP[1] - 80, 960, 160], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [[ALL, 8]], elements,
      render(t) {
        K3.bgKinetic(t, CY, 60 / 96 * 4); const q = clamp((t - (OUT - 0.3)) / 0.3);
        if (t < OUT) {
          const [lex, ley] = posOf(elP('lead'), [W / 2, 360]);
          T(LEAD, lex, ley, F(900, fitT(LEAD, 900, 72, 900, 'Mont', -1), 'Mont'), { align: 'center', ls: -1, p: clamp(t / 0.4), q });
          const k = t < T0 ? 0 : Math.min(N, Math.floor((t - T0) / WD)), lt = t - T0 - k * WD;
          if (t < ALL) K3.band(S, t, { cy: CY, open: [T0, 0.35], tr: 'push', flash: 0.3 });
          else { const s = S[N - 1]; const R = K3.wholeIn(s.c, [0, CY - 304, W, 607]); ctx.save(); ctx.globalAlpha = 1 - q; K3.clip(s.c, s.in, t - s.start, R); ctx.restore(); fillScreen(BLK, 0.45 * (1 - q)); }
          if (!VID.collecting) {   // slot word in an accent block that resizes as the words roll
            const cur = words[k], prev = words[Math.max(0, k - 1)], f = F(900, sz, 'Mont'), wc = textW(cur, f, -1), wp = textW(prev, f, -1), u = k > 0 ? E.inOutC(clamp(lt / 0.32)) : clamp(t / 0.3);
            const bw = lerp(k ? wp : 0, wc, u) + 48, bh = sz * 1.12, cy = 470, big = k === N ? 1 + 0.08 * Math.pow(1 - clamp(lt / 0.5), 2) : 1;
            const [wox, woy] = posOf(elP('word'), [W / 2, cy]);
            ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - q; ctx.translate(wox, woy); ctx.scale(big, big);
            ctx.fillStyle = OR; rrect(-bw / 2, -bh / 2, bw, bh, 8); ctx.fill(); ctx.beginPath(); ctx.rect(-bw / 2, -bh / 2, bw, bh); ctx.clip();
            setF(f, -1); ctx.fillStyle = K5.onAcc(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            if (k > 0 && u < 1) { ctx.fillText(prev, 0, sz * 0.04 - u * bh); ctx.fillText(cur, 0, sz * 0.04 + (1 - u) * bh); } else ctx.fillText(cur, 0, sz * 0.04);
            ctx.restore();
          }
          K5.pips(N + 1, k, 1230, 1 - q); K5.ctaRow(t, 1330, 1.0, 1 - q);
        }
        if (t >= OUT + 0.1) K3.outro('kinetic', t - OUT, TAG);
      },
      cues() {
        const ev = [['impact', 0.05, 0.3, 0]]; for (let k = 1; k <= N; k++) { ev.push(['whoosh', T0 + k * WD, 0.24, 0]); ev.push(['ticks', T0 + k * WD - 0.02, 0.2, 0, { dur: 0.32, n: 6 }]); }
        ev.push(['impact', ALL + 0.02, 0.45, 0]); ev.push(['shimmer', ALL + 0.1, 0.3, 0]); K5.outroCues(ev, OUT);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'lounge', bpm: 96, key: 0, end: DUR - 0.5 }]], events: ev };
      },
    };
  }

  const MAKE = { banner, lower3, postcard, split, ticker, cinema, textfill, kinetic, sting, shapes, wordswap };
  const P = (MAKE[V] || banner)();
  const BG = { postcard: PAPER };
  DIR = { bgSwap: true, dur: P.dur, bg: BG[V] || BLK, finish: V === 'postcard' ? { vig: 0.06, grain: 0.12 } : { vig: 0.22, grain: 0.2 }, edl: [], shakes: P.shakes, preload: () => K3.init(), render: P.render, cues: P.cues, ...(P.elements ? { elements: P.elements } : {}) };
});
