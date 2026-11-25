'use strict';
/* NexGen templates, batch 2 (Oct 28): formats and restaurant templates. TX/SHOT fields with brand-aware defaults.
   Formats:     ?v=ba Before & After   ?v=top3 Top 3   ?v=process How It Works   ?v=myth Myth vs Fact   ?v=reveal Wait For It
   Restaurant:  ?v=menu Menu Board     ?v=dish Dish Reveal                       ?v=special Today's Special
   Before/after and restaurant shots have no library default (DPG has no before footage and no food): they start as
   placeholders for every brand. */
STUDIO_REG['nx2'] = (() => {
  const V = QS.get('v') || 'ba';
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
  const fitT = (s, w, max, maxW, fam, ls) => Math.min(max, fitSize(s, w, maxW || 960, 400, fam || 'Mont', ls === undefined ? -2 : ls));
  const NONE = k => ['nofoot.' + k, 0];   // no default footage: a placeholder in the studio
  const lines2 = (s, f, maxW) => K3.wrap(s, f, maxW).slice(0, 3);

  // ---------------------------------------------------------------- Before & After: a slider wipes between two takes of one view
  function ba() {
    const SB = SHOT('s1', NONE('before'), { label: 'Before', group: 'Footage', kind: 'land', d: 9, hint: 'Film before and after from the same spot' });
    const SA = SHOT('s2', NONE('after'), { label: 'After (same angle)', group: 'Footage', kind: 'land', d: 9 });
    const H1 = TX('h1', 'WAIT FOR', { label: 'Headline line 1', group: 'Headline', upper: true, max: 16 }), H2 = TX('h2', 'THE AFTER.', { label: 'Headline line 2 (highlighted)', group: 'Headline', upper: true, max: 16 });
    const LB = TX('lb', 'BEFORE', { label: 'Before label', group: 'Labels', upper: true, max: 12 }), LA = TX('la', 'AFTER', { label: 'After label', group: 'Labels', upper: true, max: 12 });
    const CAP = TX('cap', K5.svc(0), { label: 'Caption', group: 'Labels', upper: true, max: 28 });
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const T0 = 0.4, OUT = 9.0, DUR = 13.5, CY = 840;
    const HZ = Math.min(fitT(H1, 900, 120, 960, 'Mont', -3), fitT(H2, 900, 120, 960, 'Mont', -3));
    function elements() {
      const h1P = posOf(elP('headline'), [540, 330]), h2P = posOf(elP('headline2'), [540, 330 + HZ * 1.05]);
      const bP = posOf(elP('before'), [24, 558]), aP = posOf(elP('after'), [1056, 558]), caP = posOf(elP('caption'), [540, 1230]);
      return [
        { id: 'headline', kind: 'pos', label: H1, x: h1P[0], y: h1P[1], t0: 0.1, d: OUT - 0.1, box: [h1P[0] - 480, h1P[1] - 90, 960, 160], dup: false, del: false },
        { id: 'headline2', kind: 'pos', label: H2, x: h2P[0], y: h2P[1], t0: 0.4, d: OUT - 0.4, box: [h2P[0] - 480, h2P[1] - 90, 960, 160], dup: false, del: false },
        { id: 'before', kind: 'pos', label: LB, x: bP[0], y: bP[1], t0: T0 + 0.4, d: OUT - (T0 + 0.4), box: [bP[0], bP[1], 200, 44], dup: false, del: false },
        { id: 'after', kind: 'pos', label: LA, x: aP[0], y: aP[1], t0: T0 + 0.4, d: OUT - (T0 + 0.4), box: [aP[0] - 200, aP[1], 200, 44], dup: false, del: false },
        { id: 'caption', kind: 'pos', label: CAP, x: caP[0], y: caP[1], t0: 1.0, d: OUT - 1.0, box: [caP[0] - 480, caP[1] - 40, 960, 80], dup: false, del: false },
      ];
    }
    const sx = t => { const k = [[T0, 1.0], [1.6, 1.0], [3.2, 0.0], [4.6, 0.55], [5.6, 0.2], [6.6, 0.65], [7.6, 0.0], [OUT, 0.0]]; for (let i = 1; i < k.length; i++) if (t < k[i][0]) { const u = E.inOutC(clamp((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]))); return lerp(k[i - 1][1], k[i][1], u); } return 0; };
    return {
      dur: DUR, shakes: [[3.2, 5]], elements,
      render(t) {
        K3.bgKinetic(t, CY, 2); const q = clamp((t - (OUT - 0.3)) / 0.3);
        if (t < OUT) {
          const z = HZ, [h1x, h1y] = posOf(elP('headline'), [W / 2, 330]), [h2x, h2y] = posOf(elP('headline2'), [W / 2, 330 + z * 1.05]);
          K3.words(H1.split(' '), h1x, h1y, z, t, 0.1, { step: 0.14, q }); K3.words(H2.split(' '), h2x, h2y, z, t, 0.4, { step: 0.14, hl: H2.split(' ').length - 1, shadow: true, q, hlText: K5.onAcc() });
          const R = K3.wholeIn(SA[0], [0, CY - 304, W, 607]), op = E.outQ(clamp((t - T0) / 0.4)) * (1 - E.inC(q)), r = [R[0], R[1] + R[3] / 2 * (1 - op), R[2], R[3] * op];
          if (op > 0.01) {
            const x = r[0] + r[2] * sx(t), lt = Math.max(0, t - T0);
            K3.clip(SA[0], SA[1], lt, R, { clip: () => ctx.rect(r[0], r[1], r[2], r[3]) });
            K3.clip(SB[0], SB[1], lt, K3.wholeIn(SB[0], [0, CY - 304, W, 607]), { clip: () => ctx.rect(r[0], r[1], x - r[0], r[3]) });
            if (!VID.collecting) { const c = G(); c.fillStyle = WHT; c.fillRect(x - 3, r[1], 6, r[3]); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 20; c.beginPath(); c.arc(x, r[1] + r[3] / 2, 34, 0, 7); c.fill(); c.shadowBlur = 0;
              c.fillStyle = BLK; [[-1, -12], [1, 12]].forEach(([d, o]) => { c.beginPath(); c.moveTo(x + o, r[1] + r[3] / 2 - 10); c.lineTo(x + o + d * 10, r[1] + r[3] / 2); c.lineTo(x + o, r[1] + r[3] / 2 + 10); c.fill(); }); D();
              const f = F(800, 24, 'Mono');
              const [lbx, lby] = posOf(elP('before'), [r[0] + 24, r[1] + 22]), [lax, lay] = posOf(elP('after'), [r[0] + r[2] - 24, r[1] + 22]);
              [[LB, lbx, lby, 0], [LA, lax, lay, 1]].forEach(([lab, xx, yy, right]) => { const w = textW(lab, f, 3) + 28, g = G(); g.globalAlpha = op * clamp((t - T0 - 0.4) / 0.3); g.fillStyle = right ? OR : BLK; g.fillRect(right ? xx - w : xx, yy, w, 44); setF(f, 3); g.fillStyle = right ? K5.onAcc() : WHT; g.textBaseline = 'middle'; g.fillText(lab, (right ? xx - w : xx) + 14, yy + 23); D(); }); }
          }
          const [cax, cay] = posOf(elP('caption'), [W / 2, 1230]);
          kicker(CAP, cax, cay, clamp((t - 1.0) / 0.4), { align: 'center', size: 26, ls: 5, maxW: 960, q });
          K5.ctaRow(t, 1330, 1.4, 1 - q);
        }
        if (t >= OUT + 0.1) K3.outro('kinetic', t - OUT, TAG);
      },
      cues() {
        const ev = [['impact', 0.1, 0.3, 0], ['snap', 0.4, 0.3, 0.2], ['whoosh', 1.9, 0.3, 0.4], ['whoosh', 3.0, 0.3, -0.4], ['impact', 3.2, 0.35, 0], ['shimmer', 3.3, 0.2, 0], ['air', 4.4, 0.2, 0.3], ['air', 5.4, 0.2, -0.3], ['air', 6.4, 0.2, 0.3], ['air', 7.4, 0.2, -0.3]];
        K5.outroCues(ev, OUT); return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'pulse', bpm: 120, key: 2, end: DUR - 0.6 }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Top 3: a countdown, each with a shot and a line
  function top3() {
    const S = K5.shotsOf([L[0], L[3], L[1]], [4.0, 4.0, 4.0], 'land', 'Footage', ['Shot for number 3', 'Shot for number 2', 'Shot for number 1']);
    const T1 = TX('t1', K5.pick('3 THINGS TO PLAN', '3 THINGS TO KNOW'), { label: 'Title', group: 'Title', upper: true, max: 22 });
    const T2 = TX('t2', 'BEFORE YOUR NEXT ' + K5.noun(), { label: 'Title line 2', group: 'Title', upper: true, max: 30 });
    const RS = (K5.isDPG() ? ['START WITH A DESIGN', 'CHOOSE MATERIALS THAT LAST', 'PLAN HOW YOU’LL USE IT'] : ['ASK WHAT’S INCLUDED', 'SEE REAL, RECENT WORK', 'GET IT IN WRITING'])
      .map((r, k) => TX('r' + (k + 1), r, { label: 'Number ' + (3 - k), group: 'The list', upper: true, max: 30 }));
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const INTRO = 2.6, OUT = INTRO + S.total + 0.3, DUR = 18.5, CY = 860;
    S.forEach(s => (s.start += INTRO)); S.total += INTRO;
    const TZ = fitT(T1, 900, 130, 960, 'Mont', -3);
    function elements() {
      const tiP = posOf(elP('title'), [540, 760]), t2P = posOf(elP('title2'), [540, 760 + TZ * 0.9]);
      const nuP = posOf(elP('number'), [540, 380]), ruP = posOf(elP('rule'), [540, 1250]);
      return [
        { id: 'title', kind: 'pos', label: T1, x: tiP[0], y: tiP[1], t0: 0.1, d: INTRO + 0.2 - 0.1, box: [tiP[0] - 480, tiP[1] - 110, 960, 160], dup: false, del: false },
        { id: 'title2', kind: 'pos', label: T2, x: t2P[0], y: t2P[1], t0: 0.8, d: INTRO + 0.2 - 0.8, box: [t2P[0] - 480, t2P[1] - 30, 960, 60], dup: false, del: false },
        { id: 'number', kind: 'pos', label: 'Number', x: nuP[0], y: nuP[1], t0: INTRO, d: OUT - INTRO, box: [nuP[0] - 110, nuP[1] - 110, 220, 220], dup: false, del: false },
        { id: 'rule', kind: 'pos', label: RS[0], x: ruP[0], y: ruP[1], t0: INTRO + 0.3, d: OUT - (INTRO + 0.3), box: [ruP[0] - 470, ruP[1] - 70, 940, 220], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [[0.1, 6]].concat(S.map(s => [s.start, 7])), elements,
      render(t) {
        K3.bgKinetic(t, CY, 2); const q = clamp((t - (OUT - 0.3)) / 0.3);
        if (t < INTRO + 0.2) { const qq = clamp((t - INTRO) / 0.2), z = TZ, [tix, tiy] = posOf(elP('title'), [W / 2, 760]), [t2x, t2y] = posOf(elP('title2'), [W / 2, 760 + z * 0.9]);
          K3.words(T1.split(' '), tix, tiy, z, t, 0.1, { step: 0.12, hl: 0, q: qq, hlText: K5.onAcc() }); caps(T2, t2x, t2y, 30, clamp((t - 0.8) / 0.4), qq, { fam: 'Mono', w: 700, ls: 5, maxW: 980 }); }
        else if (t < OUT) {
          const b = K3.band(S, t, { cy: CY, open: [INTRO, 0.35], close: [OUT - 0.1, 0.35], tr: 'push', flash: 0.5, under: OR }); K3.brackets(b.r, b.lt, OR);
          const k = b.i, lt = t - S[k].start, qk = k < 2 ? clamp((lt - (S[k].d - 0.25)) / 0.25) : q;
          if (!VID.collecting) { const e = E.outBack(clamp(lt / 0.35)), c = G(), [nbx, nby] = posOf(elP('number'), [W / 2, 380]); c.globalAlpha = clamp(lt / 0.15) * (1 - qk); c.translate(nbx, nby); c.scale(e, e); c.fillStyle = OR; c.beginPath(); c.arc(0, 0, 110, 0, 7); c.fill();
            setF(F(900, 150, 'Mont'), -4); c.fillStyle = K5.onAcc(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(3 - k), 0, 8); D(); }
          const f = F(900, 66, 'Mont'), ls = lines2(RS[k], f, 940), [rux, ruy] = posOf(elP('rule'), [W / 2, 1250]);
          ls.forEach((ln, i) => T([[ln, WHT]], rux, ruy + i * 72, F(900, Math.min(66, fitSize(ln, 900, 960, 66, 'Mont', -1)), 'Mont'), { align: 'center', ls: -1, p: clamp((lt - 0.3 - i * 0.1) / 0.35), q: qk }));
        }
        if (t >= OUT + 0.1) K3.outro('kinetic', t - OUT, TAG);
      },
      cues() {
        const ev = [['impact', 0.1, 0.4, 0], ['snap', 0.25, 0.3, 0], ['tick', 0.9, 0.2, 0]]; S.forEach((s, i) => { ev.push(['whoosh', s.start, 0.3, 0]); ev.push(['impact', s.start + 0.05, 0.4, 0]); ev.push(['pop', s.start + 0.3, 0.3, 0]); });
        K5.outroCues(ev, OUT); return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'pulse', bpm: 120, key: 0, end: DUR - 0.6 }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- How It Works: four steps on a rail, a shot for each
  function process() {
    const S = K5.shotsOf([L[3], L[5], L[2], L[1]], [3.3, 3.3, 3.3, 3.3], 'land', 'Footage', ['Step 1 shot', 'Step 2 shot', 'Step 3 shot', 'Step 4 shot']);
    const TITLE = TX('title', 'HOW IT WORKS', { label: 'Title', group: 'Title', upper: true, max: 20 });
    const STEP = (K5.isDPG() ? ['DESIGN', 'MATERIALS', 'BUILD', 'WALK-THROUGH'] : ['CALL', 'PLAN', 'WORK', 'DONE']).map((s, k) => TX('st' + (k + 1), s, { label: 'Step ' + (k + 1) + ' name', group: 'Steps', upper: true, max: 12 }));
    const CAP = (K5.isDPG() ? ['Your designer maps it out with you.', 'Pick the pavers and finishes you love.', 'Then the build begins.', 'A final walk-through before we call it done.'] : ['Tell us what you need.', 'We set the plan and the timing.', 'The work gets done right.', 'We check it with you before we leave.'])
      .map((s, k) => TX('c' + (k + 1), s, { label: 'Step ' + (k + 1) + ' line', group: 'Steps', max: 44 }));
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const T0 = 1.1, OUT = T0 + S.total + 0.3, DUR = 18.5, CY = 880;
    S.forEach(s => (s.start += T0)); S.total += T0;
    function elements() {
      const tiP = posOf(elP('title'), [540, 330]), stP = posOf(elP('steps'), [72, 470]), caP = posOf(elP('caption'), [540, 1274]);
      return [
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0, d: OUT, box: [tiP[0] - 480, tiP[1] - 70, 960, 130], dup: false, del: false },
        { id: 'steps', kind: 'pos', label: 'Steps', x: stP[0], y: stP[1], t0: T0, d: OUT - T0, box: [stP[0], stP[1], 936, 92], dup: false, del: false },
        { id: 'caption', kind: 'pos', label: CAP[0], x: caP[0], y: caP[1], t0: T0 + 0.35, d: OUT - (T0 + 0.35), box: [caP[0] - 470, caP[1] - 40, 940, 160], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        K3.bgGrid(t); const q = clamp((t - (OUT - 0.3)) / 0.3);
        if (t < OUT) {
          const [tix, tiy] = posOf(elP('title'), [W / 2, 330]);
          K3.outlineFill(TITLE, tix, tiy, fitT(TITLE, 800, 96, 940, 'Mont', -2), clamp(t / 0.7), clamp((t - 0.6) / 0.4) * (1 - q), { align: 'center' });
          if (t >= T0) { const b = K3.band(S, t, { cy: CY, open: [T0, 0.4], close: [OUT - 0.1, 0.35], tr: 'scan', flash: false }); const k = b.i, lt = t - S[k].start;
            const [, sty] = posOf(elP('steps'), [72, 470]);
            K3.steps(STEP, k, sty, t, clamp((t - T0) / 0.4) * (1 - q), { prog: clamp(lt / S[k].d) });
            if (!b.closed) { K3.crop(b.r, clamp(lt / 0.4)); const f = F(600, 46, 'Corm', 'italic'), ls = lines2(CAP[k], f, 920), [cax, cay] = posOf(elP('caption'), [W / 2, b.r[1] + b.r[3] + 90]);
              ls.forEach((ln, i) => serif(ln, cax, cay + i * 54, 46, clamp((lt - 0.35 - i * 0.1) / 0.5), k < 3 ? clamp((lt - (S[k].d - 0.3)) / 0.3) : q, { col: WHT })); } }
        }
        if (t >= OUT + 0.1) K3.outro('blueprint', t - OUT, TAG);
      },
      cues() {
        const ev = [['pencil', 0.1, 0.3, 0, {}], ['scribble', 0.3, 0.2, 0, { dur: 0.6 }]]; S.forEach((s, i) => { ev.push(['air', s.start, 0.25, 0]); ev.push(['switch', s.start + 0.05, 0.3, 0]); ev.push(['tink', s.start + 0.4, 0.12, 0]); });
        ev.push(['whoosh', OUT, 0.3, 0]); ev.push(['tink', OUT + 1.2, 0.2, 0]); ev.push(['chime', OUT + 1.5, 0.25, 0]); ev.push(['ticks', OUT + 1.8, 0.2, 0, { dur: 0.8, n: 14 }]);
        return { dur: DUR, beds: [['music', 0, DUR, 0.9, { style: 'sketch', bpm: 100, key: 2, end: DUR - 0.6 }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Myth vs Fact: the myth gets struck out, the fact plays over footage
  function myth() {
    const S = K5.shotsOf([L[6], L[1]], [4.2, 4.2], 'land', 'Footage', ['Shot for fact 1', 'Shot for fact 2']);
    const DEF = K5.isDPG() ? [['PAVERS ARE ONLY FOR PATIOS.', 'They run driveways, walkways and pool decks too.'], ['A NEW BACKYARD IS HARD TO START.', 'It starts with one design consultation.']]
      : [['THEY’RE ALL THE SAME.', 'The details show. Ask to see real work.'], ['GETTING STARTED IS COMPLICATED.', 'It starts with one call.']];
    const MS = DEF.map((d, k) => TX('m' + (k + 1), d[0], { label: 'Myth ' + (k + 1), group: 'Round ' + (k + 1), upper: true, max: 34 }));
    const FS = DEF.map((d, k) => TX('f' + (k + 1), d[1], { label: 'Fact ' + (k + 1), group: 'Round ' + (k + 1), max: 52 }));
    const MYTHL = TX('mythlabel', 'MYTH', { label: 'Myth label', group: 'Labels', upper: true, max: 12 });
    const FACTL = TX('factlabel', 'FACT', { label: 'Fact label', group: 'Labels', upper: true, max: 12 });
    const STAMPW = TX('stampword', 'NOT QUITE', { label: 'Stamp word', group: 'Labels', upper: true, max: 12 });
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const RD = 6.6, MD = 2.4, OUT = 2 * RD + 0.2, DUR = 17.5, CY = 900;
    function elements() {
      const mlP = posOf(elP('mythlabel'), [540, 520]), mtP = posOf(elP('mythtext'), [540, 700]), stP = posOf(elP('stamp'), [870, 520]);
      const faP = posOf(elP('fact'), [540, 400]), ftP = posOf(elP('facttext'), [540, 1290]);
      return [
        { id: 'mythlabel', kind: 'pos', label: MYTHL, x: mlP[0], y: mlP[1], t0: 0, d: MD, box: [mlP[0] - 200, mlP[1] - 40, 400, 70], dup: false, del: false },
        { id: 'mythtext', kind: 'pos', label: MS[0], x: mtP[0], y: mtP[1], t0: 0.2, d: MD - 0.2, box: [mtP[0] - 470, mtP[1] - 80, 940, 260], dup: false, del: false },
        { id: 'stamp', kind: 'pos', label: 'Stamp', x: stP[0], y: stP[1], t0: 1.6, d: MD - 1.6, box: [stP[0] - 90, stP[1] - 90, 180, 180], dup: false, del: false },
        { id: 'fact', kind: 'pos', label: FACTL, x: faP[0], y: faP[1], t0: MD, d: RD - MD, box: [faP[0] - 150, faP[1] - 50, 300, 100], dup: false, del: false },
        { id: 'facttext', kind: 'pos', label: FS[0], x: ftP[0], y: ftP[1], t0: MD + 0.4, d: RD - MD - 0.4, box: [ftP[0] - 470, ftP[1] - 60, 940, 200], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [[MD - 0.6, 9], [RD + MD - 0.6, 9]], elements,
      render(t) {
        const q = clamp((t - (OUT - 0.3)) / 0.3);
        if (t < OUT) {
          const k = t < RD ? 0 : 1, lt = t - k * RD, s = S[k];
          if (lt < MD) {   // the myth
            K3.bgGrunge(t, 9 + k); const qq = clamp((lt - (MD - 0.2)) / 0.2);
            const [mlx, mly] = posOf(elP('mythlabel'), [W / 2, 520]);
            caps(MYTHL, mlx, mly, 34, clamp(lt / 0.3), qq, { fam: 'Mono', w: 800, ls: 10, col: 'rgba(255,255,255,0.6)' });
            const f = F(900, 84, 'Mont'), ls = lines2(MS[k], f, 920), z = Math.min(84, ...ls.map(l => fitSize(l, 900, 940, 84, 'Mont', -2))), [mtx, mty] = posOf(elP('mythtext'), [W / 2, 700]);
            ls.forEach((ln, i) => { T([[ln, WHT]], mtx, mty + i * z * 1.1, F(900, z, 'Mont'), { align: 'center', ls: -2, p: clamp((lt - 0.2 - i * 0.1) / 0.35), q: qq });
              if (!VID.collecting && lt > 1.1) { const w = textW(ln, F(900, z, 'Mont'), -2), st = E.inOutC(clamp((lt - 1.1 - i * 0.12) / 0.3)), c = G(); c.globalAlpha = 1 - qq; c.fillStyle = OR; c.fillRect(mtx - w / 2 - 20, mty + i * z * 1.1 - z * 0.36, (w + 40) * st, 12); D(); } });
            const [stx, sty] = posOf(elP('stamp'), [W / 2 + 330, 520]);
            K3.stamp(stx, sty, 90, (STAMPW + '  •  ').repeat(2), '✕', clamp((lt - 1.6) / 0.3) * (1 - qq), { col: OR, rot: -0.15 });
          } else {        // the fact
            K3.bgKinetic(t, CY, 2); const lf = lt - MD, qq = k ? q : clamp((lt - (RD - 0.25)) / 0.25), R = K3.wholeIn(s.c, [0, CY - 304, W, 607]), op = E.outQ(clamp(lf / 0.4)) * (1 - E.inC(qq));
            if (op > 0.01) K3.clip(s.c, s.in, lf, R, { clip: () => ctx.rect(R[0], R[1] + R[3] / 2 * (1 - op), R[2], R[3] * op) });
            const [fax, fay] = posOf(elP('fact'), [W / 2, 400]);
            pill(FACTL, fax, fay, { size: 34, p: clamp(lf / 0.3), q: qq, bg: OR, col: K5.onAcc() });
            const f = F(600, 58, 'Corm', 'italic'), ls = lines2(FS[k], f, 940), [ftx, fty] = posOf(elP('facttext'), [W / 2, 1290]);
            ls.forEach((ln, i) => serif(ln, ftx, fty + i * 66, 58, clamp((lf - 0.4 - i * 0.12) / 0.5), qq, { col: WHT }));
          }
        }
        if (t >= OUT + 0.1) { K3.bgKinetic(t, 700, 2); K3.outro('kinetic', t - OUT, TAG); }
      },
      cues() {
        const ev = []; [0, RD].forEach(s => { ev.push(['impact', s + 0.1, 0.35, 0]); ev.push(['pencil', s + 1.1, 0.35, 0, {}]); ev.push(['stamp', s + 1.65, 0.45, 0.3]); ev.push(['whoosh', s + MD, 0.35, 0]); ev.push(['chime', s + MD + 0.2, 0.25, 0]); });
        K5.outroCues(ev, OUT); return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'night', bpm: 100, key: -2, click: MD, end: DUR - 0.5 }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Wait For It: a countdown, a flash, the reveal
  function reveal() {
    const RL = K5.fitList([VT[3], VT[4]], [5, 3]);
    const SR = SHOT('s1', RL[0], { label: 'The reveal (vertical works best)', group: 'Footage', kind: 'any', d: 5 });
    const S2 = SHOT('s2', RL[1], { label: 'Second shot', group: 'Footage', kind: 'any', d: 3 });
    const HOOK = TX('hook', 'WAIT FOR IT…', { label: 'Hook', group: 'Words', upper: true, max: 16 });
    const WORD = TX('word', 'THE REVEAL.', { label: 'Word on the reveal', group: 'Words', upper: true, max: 14 });
    const CAP = TX('cap', K5.isDPG() ? (projOf(SR[0]) || K5.svc(0)) : K5.svc(0), { label: 'Caption', group: 'Words', upper: true, max: 28 });   // DPG names the project shown
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const CD = 3.0, R1 = 4.2, OUT = CD + R1 + 2.4, DUR = 13;
    function elements() {
      const hoP = posOf(elP('hook'), [540, 520]), coP = posOf(elP('count'), [540, 980]);
      const woP = posOf(elP('word'), [540, 560]), caP = posOf(elP('caption'), [540, 1220]);
      return [
        { id: 'hook', kind: 'pos', label: HOOK, x: hoP[0], y: hoP[1], t0: 0, d: CD, box: [hoP[0] - 480, hoP[1] - 80, 960, 160], dup: false, del: false },
        { id: 'count', kind: 'pos', label: 'Countdown', x: coP[0], y: coP[1], t0: 0, d: CD, box: [coP[0] - 300, coP[1] - 300, 600, 600], dup: false, del: false },
        { id: 'word', kind: 'pos', label: WORD, x: woP[0], y: woP[1], t0: CD, d: R1, box: [woP[0] - 480, woP[1] - 120, 960, 240], dup: false, del: false },
        { id: 'caption', kind: 'pos', label: CAP, x: caP[0], y: caP[1], t0: CD + 0.8, d: OUT - (CD + 0.8), box: [caP[0] - 480, caP[1] - 40, 960, 80], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [[CD, 14]], elements,
      render(t) {
        if (t < CD) {
          if (!VID.collecting) fillScreen(BLK);
          K5.whole(SR[0], SR[1], 0, [0, 0, W, H], { alpha: 0.14, filter: 'blur(14px)' });
          const [hox, hoy] = posOf(elP('hook'), [W / 2, 520]);
          T([[HOOK, WHT]], hox, hoy, F(900, fitT(HOOK, 900, 110, 940, 'Mont', -2), 'Mont'), { align: 'center', ls: -2, p: clamp(t / 0.35) });
          const k = Math.min(2, Math.floor(t)), lt = t - k, fl = 0.75 + 0.25 * Math.sin(t * 40), [cox, coy] = posOf(elP('count'), [W / 2, 980]);
          if (!VID.collecting) { const e = E.outBack(clamp(lt / 0.3)), c = G(); c.globalAlpha = (1 - clamp((lt - 0.8) / 0.2)) * fl; c.translate(cox, coy); c.scale(e, e); setF(F(400, 520, 'Bebas'), 0); c.fillStyle = OR; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(3 - k), 0, 20); D();
            const g = G(); g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 6; g.beginPath(); g.arc(cox, coy, 300, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lt); g.stroke(); D(); }
        } else if (t < OUT) {
          const lt = t - CD, s = lt < R1 ? SR : S2, l2 = lt < R1 ? lt : lt - R1;
          K5.whole(s[0], s[1], l2, [0, 0, W, H]); scrim(H * 0.5, H, 0, 0.65);
          if (lt < R1 + 0.2) { const [wox, woy] = posOf(elP('word'), [W / 2, 560]); K3.words([WORD], wox, woy, fitT(WORD, 900, 170, 980, 'Mont', -4), lt, 0.15, { hl: 0, s0: 1.6, shadow: true, q: clamp((lt - (R1 - 0.2)) / 0.2), hlText: K5.onAcc() }); }
          const [cax, cay] = posOf(elP('caption'), [W / 2, 1220]);
          kicker(CAP, cax, cay, clamp((lt - 0.8) / 0.4), { align: 'center', size: 28, ls: 5, maxW: 960, q: clamp((t - (OUT - 0.3)) / 0.3), shadow: ['rgba(0,0,0,0.6)', 20, 2] });
          K5.ctaRow(t, 1320, CD + 1.4, 1 - clamp((t - (OUT - 0.3)) / 0.3));
          if (!VID.collecting && lt < 0.35) fillScreen('#FFFFFF', 1 - lt / 0.35);
        }
        if (t >= OUT) { K3.bgKinetic(t, 700, 2); K3.outro('kinetic', t - OUT, TAG); }
      },
      cues() {
        const ev = [['tick', 0.02, 0.4, 0], ['tick', 1.02, 0.4, 0], ['tick', 2.02, 0.45, 0], ['riser', CD, 0.4, 0], ['impact', CD, 0.55, 0], ['boom', CD + 0.02, 0.5, 0], ['shimmer', CD + 0.1, 0.3, 0], ['whoosh', CD + R1, 0.25, 0]];
        K5.outroCues(ev, OUT); return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'pulse', bpm: 120, key: 0, start: CD, end: DUR - 0.6 }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Restaurant · Menu Board
  function menu() {
    const S = K5.shotsOf([NONE('dish1'), NONE('dish2'), NONE('dish3')], [3.4, 3.4, 3.4], 'land', 'Footage', ['Dish 1', 'Dish 2', 'Dish 3']);
    const TITLE = TX('title', 'ON THE MENU', { label: 'Title', group: 'Title', upper: true, max: 20 });
    const SUB = TX('sub', up(BRAND.name), { label: 'Small line', group: 'Title', upper: true, max: 30 });
    const DN = ['House Special', 'Seasonal Plate', 'Dessert'].map((d, k) => TX('d' + (k + 1), d, { label: 'Dish ' + (k + 1) + ' name', group: 'Dish ' + (k + 1), max: 24 }));
    const DX = ['Our take on a classic.', 'Built for sharing.', 'Save room for this one.'].map((d, k) => TX('x' + (k + 1), d, { label: 'Dish ' + (k + 1) + ' description', group: 'Dish ' + (k + 1), max: 44 }));
    const DP = [0, 1, 2].map(k => TX('p' + (k + 1), '', { label: 'Dish ' + (k + 1) + ' price (optional)', group: 'Dish ' + (k + 1), max: 8 }));
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const T0 = 0.8, OUT = T0 + S.total + 0.3, DUR = 15, CY = 790;
    S.forEach(s => (s.start += T0)); S.total += T0;
    function elements() {
      const suP = posOf(elP('sub'), [540, 300]), tiP = posOf(elP('title'), [540, 410]);
      const diP = posOf(elP('dish'), [540, 1184]), deP = posOf(elP('desc'), [540, 1246]), prP = posOf(elP('price'), [910, 1044]);
      return [
        { id: 'sub', kind: 'pos', label: SUB, x: suP[0], y: suP[1], t0: 0, d: OUT, box: [suP[0] - 480, suP[1] - 30, 960, 60], dup: false, del: false },
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.15, d: OUT - 0.15, box: [tiP[0] - 480, tiP[1] - 80, 960, 140], dup: false, del: false },
        { id: 'dish', kind: 'pos', label: DN[0], x: diP[0], y: diP[1], t0: T0 + 0.2, d: OUT - (T0 + 0.2), box: [diP[0] - 480, diP[1] - 60, 960, 110], dup: false, del: false },
        { id: 'desc', kind: 'pos', label: DX[0], x: deP[0], y: deP[1], t0: T0 + 0.45, d: OUT - (T0 + 0.45), box: [deP[0] - 470, deP[1] - 40, 940, 80], dup: false, del: false },
        { id: 'price', kind: 'pos', label: 'Price', x: prP[0], y: prP[1], t0: T0 + 0.7, d: OUT - (T0 + 0.7), box: [prP[0] - 120, prP[1] - 50, 240, 100], dup: false, del: false },
      ].filter(e => e.id !== 'price' || DP.some(x => x));
    }
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        K3.bgKinetic(t, CY, 2.5); const q = clamp((t - (OUT - 0.3)) / 0.3);
        if (t < OUT) {
          const [sux, suy] = posOf(elP('sub'), [W / 2, 300]);
          caps(SUB, sux, suy, 22, clamp(t / 0.4), q, { fam: 'Mono', w: 700, ls: 6, col: OR, maxW: 960 });
          const [tix, tiy] = posOf(elP('title'), [W / 2, 410]);
          K3.serifLines([TITLE.charAt(0) + TITLE.slice(1).toLowerCase()], tix, tiy, fitT(TITLE, 600, 96, 940, 'Corm', 0), 100, t, 0.15, { align: 'center', col: WHT, q });
          const b = K3.band(S, t, { cy: CY, h: Math.round(W * 9 / 16), open: [T0, 0.4], close: [OUT - 0.1, 0.35], tr: 'dissolve', flash: false });   // fixed height: a vertical clip shows whole in the band and the text stays on screen
          const k = b.i, lt = t - S[k].start, qk = k < 2 ? clamp((lt - (S[k].d - 0.25)) / 0.25) : q;
          if (!b.closed) { const y = b.r[1] + b.r[3] + 90, [dnx, dny] = posOf(elP('dish'), [W / 2, y]), [dxx, dxy] = posOf(elP('desc'), [W / 2, y + 62]);
            T([[DN[k], WHT]], dnx, dny, F(800, fitT(DN[k], 800, 70, DP[k] ? 760 : 940, 'Mont', -1), 'Mont'), { align: 'center', ls: -1, p: clamp((lt - 0.2) / 0.4), q: qk });
            serif(DX[k], dxx, dxy, Math.min(46, fitSize(DX[k], 600, 940, 46, 'Corm', 0, 'italic')), clamp((lt - 0.45) / 0.5), qk, { col: 'rgba(255,255,255,0.85)' });
            if (DP[k]) { const [prx, pry] = posOf(elP('price'), [W - 170, b.r[1] + b.r[3] - 50]); pill(DP[k], prx, pry, { size: 30, p: clamp((lt - 0.7) / 0.3), q: qk, bg: OR, col: K5.onAcc() }); }
            K5.pips(3, k, b.r[1] - 40, 1 - q); }
          K5.ctaRow(t, 1330, 1.5, 1 - q);
        }
        if (t >= OUT + 0.1) K3.outro('kinetic', t - OUT, TAG);
      },
      cues() {
        const ev = [['air', 0.2, 0.25, 0], ['tink', 0.4, 0.12, 0]]; S.forEach((s, i) => { ev.push(['air', s.start, 0.25, i % 2 ? 0.3 : -0.3]); ev.push(['pop', s.start + 0.3, 0.2, 0]); });
        K5.outroCues(ev, OUT); return { dur: DUR, beds: [['music', 0, DUR, 0.95, { style: 'lounge', bpm: 96, key: 3, end: DUR - 0.5 }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Restaurant · Dish Reveal: the dish name, full of footage, opens up
  function dish() {
    const S1 = SHOT('s1', NONE('dish'), { label: 'The dish (vertical fills the letters best)', group: 'Footage', kind: 'any', d: 5 });
    const S2 = SHOT('s2', NONE('table'), { label: 'Second shot', group: 'Footage', kind: 'any', d: 3.5 });
    const KICK = TX('kick', 'SAY HELLO TO', { label: 'Small line', group: 'Words', upper: true, max: 22 });
    const NAME = TX('name', 'THE SPECIAL', { label: 'Dish name', group: 'Words', upper: true, max: 14, hint: 'Short names fill the letters best' });
    const NOTE = TX('note', 'come hungry.', { label: 'Handwritten note', group: 'Words', max: 24 });
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const WD = 2.4, OUT = 8.6, DUR = 12.5;
    const DLINES = NAME.split(' ').length > 1 && NAME.length > 9 ? [NAME.split(' ').slice(0, Math.ceil(NAME.split(' ').length / 2)).join(' '), NAME.split(' ').slice(Math.ceil(NAME.split(' ').length / 2)).join(' ')] : [NAME];
    const DZ = Math.min(380, ...DLINES.map(l => fitSize(l, 400, 980, 700, 'Bebas', 4)));
    function elements() {
      const naP = posOf(elP('name'), [540, 960]), kiP = posOf(elP('kick'), [540, 960 - DZ * DLINES.length * 0.5 - 50]), noP = posOf(elP('note'), [540, 1240]);
      return [
        { id: 'name', kind: 'pos', label: NAME, x: naP[0], y: naP[1], t0: 0, d: WD, box: [naP[0] - 480, naP[1] - 200, 960, 400], dup: false, del: false },
        { id: 'kick', kind: 'pos', label: KICK, x: kiP[0], y: kiP[1], t0: 0.2, d: WD - 0.2, box: [kiP[0] - 480, kiP[1] - 40, 960, 70], dup: false, del: false },
        { id: 'note', kind: 'pos', label: NOTE, x: noP[0], y: noP[1], t0: WD + 0.8, d: OUT - (WD + 0.8), box: [noP[0] - 480, noP[1] - 60, 960, 120], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [[0.1, 6]], elements,
      render(t) {
        if (t < OUT) {
          const lines = DLINES;
          const z = DZ, grow = clamp((t - WD) / 0.7);
          const drawF = () => K5.whole(S1[0], S1[1], t, [0, 0, W, H]);
          if (!VID.collecting && grow < 1) fillScreen(BLK);
          if (grow < 1) { const [nax, nay] = posOf(elP('name'), [W / 2, 960]), [kix, kiy] = posOf(elP('kick'), [W / 2, 960 - z * lines.length * 0.5 - 50]);
            K5.footWord(lines, nax, nay, z, 'Bebas', drawF, grow, clamp(t / 0.25), { pop: t / 0.6, stroke: OR, strokeA: 0.85 });
            caps(KICK, kix, kiy, 28, clamp((t - 0.2) / 0.3), clamp((t - (WD - 0.1)) / 0.2), { fam: 'Mono', w: 700, ls: 6, col: OR }); }
          else { const s = t < WD + 3.2 ? S1 : S2, lt = t < WD + 3.2 ? t : t - WD - 3.2; K5.whole(s[0], s[1], lt, [0, 0, W, H]); scrim(H * 0.5, H, 0, 0.6);
            const [nox, noy] = posOf(elP('note'), [W / 2, 1240]);
            hand(NOTE, nox, noy, 92, clamp((t - WD - 0.8) / 0.8), { col: WHT, align: 'center', q: clamp((t - (OUT - 0.3)) / 0.3) }); K5.ctaRow(t, 1330, WD + 1.4, 1 - clamp((t - (OUT - 0.3)) / 0.3)); }
          K5.bug(t, 0.2, 1 - clamp((t - OUT + 0.3) / 0.3));
        }
        if (t >= OUT) { K3.bgKinetic(t, 700, 2.5); K3.outro('kinetic', t - OUT, TAG); }
      },
      cues() {
        const ev = [['impact', 0.05, 0.4, 0], ['boom', 0.07, 0.3, 0], ['riser', WD, 0.3, 0], ['whoosh', WD + 0.3, 0.35, 0], ['shimmer', WD + 0.6, 0.2, 0], ['scribble', WD + 0.8, 0.2, 0, { dur: 0.8 }], ['air', WD + 3.2, 0.2, 0]];
        K5.outroCues(ev, OUT); return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'lounge', bpm: 96, key: 5, end: DUR - 0.5 }]], events: ev };
      },
    };
  }

  // ---------------------------------------------------------------- Restaurant · Today's Special: a chalkboard and a framed shot
  function special() {
    const S = K5.shotsOf([NONE('special1'), NONE('special2')], [4.2, 4.2], 'land', 'Footage', ['The special', 'Second shot']);
    const TITLE = TX('title', 'Today’s Special', { label: 'Title (handwritten)', group: 'Board', max: 22 });
    const NAME = TX('name', 'CHEF’S PLATE', { label: 'Dish name', group: 'Board', upper: true, max: 22 });
    const DESC = TX('desc', 'ask your server about tonight’s plate', { label: 'Description (handwritten)', group: 'Board', max: 44 });
    const PRICE = TX('price', '', { label: 'Price (optional)', group: 'Board', max: 8 });
    const TAG = TX('tag', tagDef(), { label: 'Ending line', group: 'Ending', upper: true, max: 36 });
    const T0 = 1.2, OUT = T0 + S.total + 0.3, DUR = 14.5, PR0 = [140, 720, 800, 450], CH = 'rgba(244,240,230,0.94)';
    const PR = EL && EL.box ? [num(EL.box.x, PR0[0]), num(EL.box.y, PR0[1]), num(EL.box.w, PR0[2]), num(EL.box.h, PR0[3])] : PR0;
    S.forEach(s => (s.start += T0)); S.total += T0;
    function elements() {
      const tiP = posOf(elP('title'), [540, 360]), naP = posOf(elP('name'), [540, 560]);
      const deP = posOf(elP('desc'), [540, 1300]), prP = posOf(elP('price'), [870, 1190]), ctP = posOf(elP('cta'), [540, 1392]);
      return [
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.1, d: OUT - 0.1, box: [tiP[0] - 480, tiP[1] - 80, 960, 140], dup: false, del: false },
        { id: 'name', kind: 'pos', label: NAME, x: naP[0], y: naP[1], t0: 0.7, d: OUT - 0.7, box: [naP[0] - 480, naP[1] - 60, 960, 110], dup: false, del: false },
        { id: 'photo', kind: 'box', label: 'Photo', x: PR[0], y: PR[1], w: PR[2], h: PR[3], t0: T0, d: S.total, box: [PR[0], PR[1], PR[2], PR[3]], dup: false, del: false },
        { id: 'desc', kind: 'pos', label: DESC, x: deP[0], y: deP[1], t0: T0 + 0.5, d: OUT - (T0 + 0.5), box: [deP[0] - 470, deP[1] - 50, 940, 90], dup: false, del: false },
        { id: 'price', kind: 'pos', label: PRICE, x: prP[0], y: prP[1], t0: T0 + 1.2, d: OUT - (T0 + 1.2), box: [prP[0] - 100, prP[1] - 100, 200, 200], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: CONTACT.cta, x: ctP[0], y: ctP[1], t0: T0 + 1.6, d: OUT - (T0 + 1.6), box: [ctP[0] - 400, ctP[1] - 45, 800, 90], dup: false, del: false },
      ].filter(e => e.id !== 'price' || PRICE);
    }
    function board(t) { if (VID.collecting) return; fillScreen('#1D2622'); const c = G(), r = rng(17); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,255,255,${0.015 + r() * 0.035})`; c.beginPath(); c.ellipse(r() * W, r() * H, 60 + r() * 220, 20 + r() * 80, r() * 3, 0, 7); c.fill(); }
      c.strokeStyle = '#6B4A2E'; c.lineWidth = 34; c.strokeRect(17, 17, W - 34, H - 34); c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 4; c.strokeRect(36, 36, W - 72, H - 72); D(); }
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        board(t); const q = clamp((t - (OUT - 0.3)) / 0.3);
        if (t < OUT) {
          const [tix, tiy] = posOf(elP('title'), [W / 2, 360]);
          hand(TITLE, tix, tiy, 110, clamp((t - 0.1) / 0.9), { col: CH, align: 'center', shadow: false, q });
          handArrow([[300, 400], [540, 412], [780, 398]], clamp((t - 0.9) / 0.4), { col: OR, lw: 6, q });
          const [nax, nay] = posOf(elP('name'), [W / 2, 560]);
          T([[NAME, CH]], nax, nay, F(800, fitT(NAME, 800, 84, 900, 'Mont', 1), 'Mont'), { align: 'center', ls: 1, p: clamp((t - 0.7) / 0.4), q });
          if (t >= T0) { ctx.save(); ctx.globalAlpha = clamp((t - T0) / 0.4) * (1 - q); K3.mount(PR, 0.012, 23, { pad: 18, col: '#F2EBDD' }); ctx.restore(); if (t > T0 + 0.2) K5.seq(S, t, PR, ['cut', 'toss'], 0.7); }
          const [dex, dey] = posOf(elP('desc'), [W / 2, 1300]);
          hand(DESC, dex, dey, 64, clamp((t - T0 - 0.5) / 1.0), { col: CH, align: 'center', shadow: false, q });
          if (PRICE) { const [prx, pry] = posOf(elP('price'), [W - 210, 1190]); K3.stamp(prx, pry, 100, ' • '.repeat(10), PRICE, clamp((t - T0 - 1.2) / 0.3) * (1 - q), { col: OR, rot: 0.15 }); }
          const [ctx2, cty] = posOf(elP('cta'), [W / 2, 1392]);
          pill(CONTACT.cta, ctx2, cty, { size: Math.min(30, fitSize(CONTACT.cta, 800, 900, 30, 'Mont', 2.5)), p: clamp((t - T0 - 1.6) / 0.4), q, bg: OR, col: K5.onAcc() });
        }
        if (t >= OUT + 0.1) { K3.bgKinetic(t, 700, 2.5); K3.outro('kinetic', t - OUT, TAG); }
      },
      cues() {
        const ev = [['scribble', 0.1, 0.25, 0, { dur: 0.9 }], ['pencil', 0.9, 0.2, 0, {}], ['paper', T0 + 0.1, 0.35, 0], ['scribble', T0 + 0.5, 0.2, 0, { dur: 1.0 }]]; S.forEach((s, i) => { if (i) ev.push(['air', s.start, 0.3, 0.3]); });
        if (PRICE) ev.push(['stamp', T0 + 1.25, 0.4, 0.3]); K5.outroCues(ev, OUT);
        return { dur: DUR, beds: [['music', 0, DUR, 0.95, { style: 'sketch', bpm: 100, key: 5, end: DUR - 0.5 }]], events: ev };
      },
    };
  }

  const MAKE = { ba, top3, process, myth, reveal, menu, dish, special };
  const P = (MAKE[V] || ba)();
  DIR = { bgSwap: true, dur: P.dur, bg: BLK, finish: { vig: 0.22, grain: 0.2 }, edl: [], shakes: P.shakes, preload: () => K3.init(), render: P.render, cues: P.cues, ...(P.elements ? { elements: P.elements } : {}) };
});
