'use strict';
/* Round 5 concepts, part 1 (new copy, new edits; kit3 + kit4).
   ?v=sketch   #52 Drawn First, Built Second (30 s): every shot starts as a moving pencil drawing (frames/k*, from
               make_sketch.py) with a handwritten note, the headline reads DESIGNED., then the real footage paints or irises
               in and it rolls to BUILT. Ends on a half-drawn / half-built split.
   ?v=elements #53 The Elements (30 s): Fire · Water · Stone · Air. Each chapter has its own type animation, particles,
               ambience and transition (type fly-through, tide, paver-tile flip, whip pan); vertical clips run full-bleed.
   ?v=gallery  #56 On Permanent Display (30 s): a gallery wall, the camera dollies frame to frame past museum placards and
               stops at an empty frame that turns into the CTA.
   ?v=trailer  #58 Coming Soon to Your Backyard (30 s): movie-trailer cut, title cards on booms, an accelerating montage
               with flash frames, a billing block made of DPG's process facts.
   Captions name projects or what is visibly there, never a service DPG doesn't list (no lighting, no pools, no fire). */
STUDIO_REG['n1'] = (() => {
  const V = QS.get('v') || 'sketch';
  const lmod = K3.lmod, G = K3.G, D = K3.D;
  const whole = (c, r) => K3.wholeIn(c, r);
  const play = (c, inn, lt, r, o) => K3.clip(c, inn, lt, whole(c, r), o);
  const bandR = (c, cy) => { const h = Math.round(W / K3.ar(c)); return [0, cy - h / 2, W, h]; };
  const fit = (str, w, maxW, maxS, fam, ls, st) => Math.min(maxS, fitSize(str, w, maxW, maxS, fam, ls, st));
  const INK = '#2B2622';
  const kf = (tg, ts) => { if (!Array.isArray(tg[0])) return tg; let a = tg[0]; if (ts <= a[0]) return [a[1], a[2]];
    for (let i = 1; i < tg.length; i++) { const b = tg[i]; if (ts <= b[0]) { const u = (ts - a[0]) / (b[0] - a[0]); return [lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; } a = b; } return [a[1], a[2]]; };

  // ======================= #52 Drawn First, Built Second =======================
  function sketch() {
    const CY = 960, PW = 0.6;
    const SH = K3.shots([
      { c: 'c12', in: 0.3, d: 5.0, sk: 2.4, rd: 0.75, note: 'pavilion + paver steps', tg: [[0.3, 0.6, 0.2], [2.7, 0.64, 0.21]], pj: 'DUSK PAVILION', rv: 'brush' },
      { c: 'c09', in: 3.5, d: 2.8, sk: 1.0, rd: 0.6, note: 'stone pizza oven', tg: [0.5, 0.42], pj: 'STONE OVEN TERRACE', rv: 'iris' },
      { c: 'c08', in: 5.98, d: 1.8, sk: 0.7, rd: 0.5, note: 'paver driveway', tg: [0.5, 0.78], pj: 'COURTYARD ESTATE', rv: 'brush' },
      { c: 'c11', in: 14.95, d: 2.35, sk: 0.9, rd: 0.55, note: 'patio over the hills', tg: [0.5, 0.6], pj: 'HILLSIDE VILLA', rv: 'iris' },
      { c: 'c10', in: 2.5, d: 3.0, sk: 1.0, rd: 0.6, note: 'terrace lounge', tg: [[2.5, 0.55, 0.55], [3.5, 0.6, 0.62]], pj: 'TOWNHOME TERRACE', rv: 'brush' },
      { c: 'c07', in: 23.95, d: 2.3, sk: 0.9, rd: 0.55, note: 'pavilion', tg: [0.33, 0.45], pj: 'THE ENTERTAINER', rv: 'iris' },
      { c: 'c12', in: 8.48, d: 2.85, sk: 1.0, rd: 0.6, note: 'outdoor kitchen', tg: [0.55, 0.62], pj: 'DUSK PAVILION', rv: 'brush' },
      { c: 'c05', in: 4.0, d: 4.5, sk: 1.2, rd: 0.6, note: 'pergola + pool deck', tg: [0.56, 0.3], pj: 'MODERN POOL RETREAT', rv: 'iris', split: true },
    ]);
    const N = SH.length, LAST = SH[N - 1], END = SH.total, DUR = 30, SY = 1452;
    const kid = c => 'k' + c.slice(1);
    let SZ = null;
    const sizes = () => SZ || (SZ = { st: fit('DESIGNED.', 900, 950, 140, 'Mont', -4), hk: fit('EVERY DPG BACKYARD', 900, 950, 82, 'Mont', -2),
      end: fit('BUILT SECOND.', 900, 950, 116, 'Mont', -4) });
    const tgPt = (s, lt, f) => { const p = kf(s.tg, K3.at(s.c, s.in, lt)); return [f[0] + p[0] * f[2], f[1] + p[1] * f[3]]; };
    function pencil(x, y) {   // a little pencil whose graphite tip sits at (x, y)
      const c = G(); c.translate(x, y); c.rotate(-0.55);
      c.fillStyle = '#E8DCC4'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-10, -28); c.lineTo(10, -28); c.closePath(); c.fill();
      c.fillStyle = INK; c.beginPath(); c.moveTo(0, 0); c.lineTo(-3.6, -10); c.lineTo(3.6, -10); c.closePath(); c.fill();
      c.fillStyle = OR; c.fillRect(-10, -122, 20, 94); c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(3.5, -122, 6.5, 94);
      c.fillStyle = '#B9B9B9'; c.fillRect(-10, -140, 20, 18); c.fillStyle = WHT; c.fillRect(-10, -156, 20, 16); D();
    }
    function drawSk(s, lt, r, reveal) {   // the sketch twin, multiplied onto paper; reveal = left-to-right draw-on
      const k = kid(s.c), f = whole(s.c, r), w = r[2] * clamp(reveal);
      if (!VID.collecting) { const c = G(); c.fillStyle = PAPER; c.fillRect(r[0], r[1], w, r[3]); D(); }
      footageSrc(k, K3.at(k, s.in, lt), { rect: f, fit: 'cover', q: 'f', op: 'multiply', clip: () => ctx.rect(r[0], r[1], w, r[3]) });
      if (reveal > 0 && reveal < 1 && !VID.collecting) { const x = r[0] + w, c = G(); c.fillStyle = INK; c.globalAlpha = 0.75; c.fillRect(x - 1.5, r[1], 3, r[3]); D();
        pencil(x, r[1] + r[3] * (0.5 + 0.38 * Math.sin(reveal * 34))); }
    }
    const drawReal = (s, lt, r) => play(s.c, s.in, lt, r);
    function frameLines(r, built, i) {
      if (VID.collecting) return; const c = G(); c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(r[0] + 0.5, r[1] - 10.5, r[2] - 1, r[3] + 21);
      setF(F(700, 16, 'Mono'), 3); c.fillStyle = INK; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
      c.fillText(built ? 'AS BUILT  ·  DPG OUTDOOR LIVING' : 'CONCEPT SKETCH  ·  ILLUSTRATIVE', 14, r[1] + r[3] + 40);
      c.textAlign = 'right'; c.fillText('N° 0' + (i + 1) + ' / 0' + N, W - 14, r[1] + r[3] + 40); D();
    }
    function noteArrow(s, lt, r) {   // handwritten note above the band, a curved orange arrow and a loop around the feature
      if (VID.collecting) return;
      const n0 = Math.min(0.3, s.sk * 0.2), p = clamp((lt - n0) / 0.45), pa = clamp((lt - n0 - 0.25) / 0.4), pc = clamp((lt - n0 - 0.55) / 0.3), q = clamp((lt - s.sk) / 0.25);
      if (p <= 0 || q >= 1) return;
      const f = whole(s.c, r), [tx, ty] = tgPt(s, lt, f), fnt = F(700, 58, 'Hand'), tw = textW(s.note, fnt, 0), nx = W - 70, ny = r[1] - 24;
      hand(s.note, nx, ny, 58, p, { col: INK, align: 'right', rot: -0.025, shadow: false, q });
      const rx = 64, ry = 38, sx = nx - tw * 0.5, sy = ny + 12, ex = tx + (sx > tx ? 22 : -22), ey = ty - ry - 4, cx = (sx + ex) / 2 + (ex < sx ? 60 : -60), cy = sy + (ey - sy) * 0.15;
      const pts = []; for (let k = 0; k <= 12; k++) { const u = k / 12; pts.push([(1 - u) * (1 - u) * sx + 2 * (1 - u) * u * cx + u * u * ex, (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * cy + u * u * ey]); }
      handArrow(pts, pa, { col: OR, lw: 5, head: 17, q });
      if (pc > 0) { const c = G(); c.globalAlpha = 1 - q; c.strokeStyle = OR; c.lineWidth = 4.5; c.lineCap = 'round'; c.beginPath(); c.ellipse(tx, ty, rx, ry, -0.12, -1.9, -1.9 + 6.6 * E.inOutS(pc)); c.stroke(); D(); }
    }
    function stateWord(t, a) {   // DESIGNED. <-> BUILT., rolls on every flip
      if (VID.collecting || a <= 0) return; const z = sizes(); let st = 0, ch = 0, first = false;
      for (let k = 0; k < N; k++) { const s = SH[k]; if (t >= s.start) { const b = t >= s.start + s.sk; st = b ? 1 : 0; ch = b ? s.start + s.sk : s.start; first = k === 0 && b; } }
      const words = ['DESIGNED.', 'BUILT.'], u = E.inOutC(clamp((t - ch) / 0.3)), f = F(900, z.st, 'Mont'), y = 482, h = z.st;
      const c = G(); c.globalAlpha = a; c.beginPath(); c.rect(0, y - h * 1.0, W, h * 1.25); c.clip(); setF(f, -4); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      if (u < 1 && !first && ch > 0.01) { c.fillStyle = st ? INK : OR; c.fillText(words[1 - st], 62, y - u * h * 1.1); }
      c.fillStyle = st ? OR : INK; c.fillText(words[st], 62, y + (1 - (ch > 0.01 ? u : 1)) * h * 1.1); D();
    }
    function body(t) {
      const z = sizes(), tt = Math.min(t, END - 0.01), { i, sh, lt } = K3.shotAt(SH, tt), pv = SH[i - 1], r = bandR(sh.c, CY), f = whole(sh.c, r);
      const tp = tgPt(sh, lt, f), built = lt >= sh.sk + sh.rd * 0.5;
      // the band: pencil wipe over the previous real shot -> sketch hold -> brush / iris reveal -> real (-> split)
      if (lt < PW) { if (pv) drawReal(pv, t - pv.start, bandR(pv.c, CY)); drawSk(sh, lt, r, E.inOutS(lt / PW)); }
      else if (lt < sh.sk) drawSk(sh, lt, r, 1);
      else if (lt < sh.sk + sh.rd) K4.run(sh.rv, r, (lt - sh.sk) / sh.rd, () => drawSk(sh, lt, r, 1), () => drawReal(sh, lt, r), { col: OR, seed: 3 + i, cx: tp[0], cy: tp[1] });
      else if (sh.split && lt > sh.sk + sh.rd + 0.25) {   // comparison slider: built on the left, the drawing on the right
        const u = E.inOutS(clamp((lt - (sh.sk + sh.rd + 0.25)) / 0.85)), sx = r[0] + r[2] * lerp(1, 0.5, u);
        drawSk(sh, lt, r, 1); K4.clipTo(c => c.rect(r[0], r[1], sx - r[0], r[3]), () => drawReal(sh, lt, r));
        if (!VID.collecting) { const c = G(), my = r[1] + r[3] / 2; c.fillStyle = WHT; c.fillRect(sx - 2, r[1], 4, r[3]); c.fillStyle = OR; c.beginPath(); c.arc(sx, my, 26, 0, 7); c.fill(); c.fillStyle = BLK;
          [[-13, -4], [13, 4]].forEach(([a1, a2]) => { c.beginPath(); c.moveTo(sx + a1, my); c.lineTo(sx + a2, my - 8); c.lineTo(sx + a2, my + 8); c.closePath(); c.fill(); });
          setF(F(800, 18, 'Mono'), 3); c.textBaseline = 'alphabetic'; c.globalAlpha = u; c.fillStyle = WHT; c.textAlign = 'left'; c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 10; c.fillText('BUILT', r[0] + 20, r[1] + 38);
          c.shadowBlur = 0; c.fillStyle = INK; c.textAlign = 'right'; c.fillText('DRAWN', r[0] + r[2] - 20, r[1] + 38); D(); } }
      else drawReal(sh, lt, r);
      // frame: lerp between band heights during the wipe
      let fr = r; if (pv && lt < PW) { const a = bandR(pv.c, CY), u = E.inOutS(lt / PW); fr = [0, lerp(a[1], r[1], u), W, lerp(a[3], r[3], u)]; }
      frameLines(fr, built, i);
      noteArrow(sh, lt, r);
      // top: kicker, hook (shot 1) or the DESIGNED./BUILT. roll, end line on the last shot
      caps('N° 0' + (i + 1) + '  ·  ' + sh.pj, 64, 300, 21, clamp((lt - 0.05) / 0.35), 0, { w: 700, fam: 'Mono', ls: 4, align: 'left', col: INK, ls0: 0 });
      const endAt = LAST.start + LAST.sk + LAST.rd + 0.45;
      if (t < SH[0].sk + 0.05) { const q = (t - (SH[0].sk - 0.25)) / 0.25;
        K3.words(['EVERY', 'DPG', 'BACKYARD'], 62, 420, z.hk, t, 0.1, { align: 'left', col: INK, ls: -2, step: 0.17, s0: 1.08, q });
        K3.words(['STARTS', 'AS', 'A', 'DESIGN.'], 62, 420 + z.hk * 1.08, z.hk, t, 0.65, { align: 'left', col: INK, hl: 3, hlText: WHT, ls: -2, step: 0.17, s0: 1.08, q }); }
      else stateWord(t, 1 - clamp((t - endAt + 0.3) / 0.3));
      if (t >= endAt) { K3.words(['DRAWN', 'FIRST.'], 62, 420, z.end, t, endAt, { align: 'left', col: INK, ls: -4, step: 0.16, s0: 1.08 });
        K3.words(['BUILT', 'SECOND.'], 62, 420 + z.end * 1.04, z.end, t, endAt + 0.4, { align: 'left', col: INK, hl: 1, hlText: WHT, ls: -4, step: 0.16, s0: 1.08 }); }
      // bottom: design -> build status and progress pips, or the consultation line at the end
      if (!VID.collecting) {
        const c = G(); c.textBaseline = 'alphabetic'; c.textAlign = 'left';
        if (t < endAt) { const fd = F(800, 34, 'Mont'), wd = textW('DESIGN', fd, 3); setF(fd, 3); c.fillStyle = built ? 'rgba(43,38,34,0.32)' : INK; c.fillText('DESIGN', 64, SY);
          c.strokeStyle = OR; c.lineWidth = 3; c.lineCap = 'round'; const ax = 64 + wd + 22; c.beginPath(); c.moveTo(ax, SY - 12); c.lineTo(ax + 64, SY - 12); c.moveTo(ax + 50, SY - 24); c.lineTo(ax + 64, SY - 12); c.lineTo(ax + 50, SY); c.stroke();
          c.fillStyle = built ? OR : 'rgba(43,38,34,0.32)'; c.fillText('BUILD', ax + 88, SY);
          for (let k = 0; k < N; k++) { c.fillStyle = k < i || (k === i && built) ? OR : 'rgba(43,38,34,0.18)'; c.fillRect(W - 64 - (N - k) * 34 + 6, SY - 18, 26, 7); } }
        else { c.globalAlpha = clamp((t - endAt - 0.9) / 0.4); setF(F(700, 20, 'Mono'), 2); c.fillStyle = INK; c.textAlign = 'center'; c.fillText('EVERY PROJECT STARTS WITH A ONE-ON-ONE DESIGN CONSULTATION.', W / 2, SY); }
        D();
      }
    }
    return {
      dur: DUR, shakes: [],
      render(t) {
        K3.bgPaper(t);
        if (t < END - 0.02) body(t);
        else if (t < END + 0.45) {   // the whole layout fades to paper
          if (VID.collecting) body(t); else { const cv = K4.into('n1body', () => body(t)); const c = K4.GI(); c.globalAlpha = 1 - E.inOutS((t - END + 0.02) / 0.47); c.drawImage(cv, 0, 0); D(); }
        }
        if (t >= END + 0.25) {   // pencil-drawn logo, then the CTA block
          const o = t - END - 0.25, sc = 760 / 2048, x0 = W / 2 - 380, y0 = 700 - 230 * sc, p = E.inOutS(clamp((o - 0.05) / 0.9));
          if (!VID.collecting && p > 0) { const c = G(); c.beginPath(); c.rect(x0 - 10, y0 - 10, 780 * p, 460 * sc + 20); c.clip(); c.drawImage(IMG.logoB, x0, y0, 760, 460 * sc); D();
            if (p < 1) pencil(x0 - 10 + 780 * p, y0 + 460 * sc * (0.5 + 0.42 * Math.sin(p * 28))); }
          caps('DRAWN FIRST. BUILT SECOND.', W / 2, 880, 22, clamp((o - 0.9) / 0.4), 0, { w: 700, fam: 'Mono', ls: 5, col: OR });
          K3.ctaBlock(o, 990, 1.15, 'editorial');
        }
      },
      cues() {
        const ev = [];
        SH.forEach((s, i) => { const n0 = Math.min(0.3, s.sk * 0.2);
          ev.push(['pencil', s.start + 0.02, 0.32, -0.3, {}]); ev.push(['scribble', s.start + n0, 0.2, 0.35, { dur: Math.max(0.45, Math.min(0.9, s.sk - n0)) }]);
          ev.push(['swell', s.start + s.sk - 0.3, 0.14, 0]);
          ev.push(s.rv === 'iris' ? ['shimmer', s.start + s.sk + 0.05, 0.2, 0] : ['whoosh', s.start + s.sk + 0.2, 0.22, 0.2]);
          ev.push(['clack', s.start + s.sk + s.rd * 0.5, 0.16, -0.2]); });
        [0.1, 0.27, 0.44, 0.65, 0.82, 0.99, 1.16].forEach(d => ev.push(['snap', d, 0.16, 0]));
        const endAt = LAST.start + LAST.sk + LAST.rd + 0.45; ev.push(['air', LAST.start + LAST.sk + LAST.rd + 0.3, 0.2, 0.3]);
        [0, 0.16, 0.4, 0.56].forEach(d => ev.push(['snap', endAt + d, 0.28, 0])); ev.push(['impact', endAt + 0.56, 0.3, 0]);
        ev.push(['pencil', END + 0.3, 0.35, 0, {}]); ev.push(['chime', END + 1.4, 0.24, 0]); ev.push(['ticks', END + 1.8, 0.15, 0, { dur: 0.8, n: 14 }]);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'cinematic', bpm: 90, key: 2, drop: SH[0].sk, lift: SH[4].start, end: END }]], events: ev };
      },
    };
  }

  // ======================= #53 The Elements =======================
  function elements() {
    const T0 = 1.6, CY = 960, TD = 0.6, TI = 0.45, FULL = [0, 0, W, H];
    const CH = [
      { name: 'FIRE', mode: 'fire', tr: 'word', within: 'leak', shots: [['c07', 15.05, 2.1, 'THE ENTERTAINER'], ['c09', 10.55, 2.1, 'STONE OVEN TERRACE'], ['c07', 24.0, 2.1, 'THE ENTERTAINER']] },
      { name: 'WATER', mode: 'water', tr: 'liquid', within: 'liquid', shots: [['c03', 15.0, 2.3, 'MODERN POOL RETREAT', 1], ['c04', 3.05, 1.9, 'MODERN POOL RETREAT', 1], ['c11', 3.05, 2.1, 'HILLSIDE VILLA']] },
      { name: 'STONE', mode: 'stone', tr: 'paver', within: 'cut', shots: [['c09', 3.55, 2.1, 'STONE OVEN TERRACE'], ['c08', 5.98, 2.1, 'COURTYARD ESTATE'], ['c07', 27.0, 2.1, 'THE ENTERTAINER']] },
      { name: 'AIR', mode: 'air', tr: 'whip', within: 'whip', shots: [['c11', 15.0, 2.1, 'HILLSIDE VILLA'], ['c02', 9.0, 2.0, 'HILLSIDE VILLA'], ['c05', 24.1, 1.9, 'MODERN POOL RETREAT']] },
    ];
    const list = []; CH.forEach((ch, ci) => ch.shots.forEach(([c, inn, d, cap, full], k) => list.push({ c, in: inn, d, cap, full: !!full, ci, k })));
    const S = K3.shots(list), END = T0 + S.total, DUR = 30;
    CH.forEach((ch, ci) => { const ss = S.filter(s => s.ci === ci); ch.t0 = T0 + ss[0].start; ch.t1 = T0 + ss[ss.length - 1].start + ss[ss.length - 1].d; });
    const rectOf = s => s.full ? FULL : bandR(s.c, CY);
    const drawS = (s, lt) => { if (!s.full && !VID.collecting) { const c = K4.GI(); c.fillStyle = BLK; c.fillRect(0, 0, W, H); D(); } play(s.c, s.in, lt, rectOf(s)); };
    const black = () => { if (!VID.collecting) fillScreen(BLK); };
    let SZ = null; const sizeOf = n => (SZ || (SZ = {}))[n] || (SZ[n] = fit(n + '.', 900, 900, 200, 'Mont', 4));
    const stoneHits = [0, 1, 2, 3, 4, 5].map(k => CH[2].t0 + 0.15 + k * 0.11 + 0.18);
    return {
      dur: DUR, shakes: stoneHits.map(x => [x, 6]).concat(S.filter(s => s.ci === 2 && s.k > 0).map(s => [T0 + s.start, 10])),
      render(t) {
        fillScreen(BLK);
        if (t < T0) { const f = F(700, 30, 'Mono'), str = 'FOUR ELEMENTS. ONE BACKYARD.'; K3.typed(str, W / 2 - textW(str, f, 4) / 2, 970, f, t, 0.15, 26, { ls: 4 }); K4.embers(FULL, t, 16, 0.5); return; }
        if (t < END) {
          const tl = t - T0, { i, sh, lt } = K3.shotAt(S, tl), pv = S[i - 1], ch = CH[sh.ci];
          if (sh.ci === 0 && !VID.collecting) { const c = K4.GI(), g = c.createRadialGradient(W / 2, CY, 100, W / 2, CY, 900); g.addColorStop(0, ORA(0.16)); g.addColorStop(1, ORA(0)); c.fillStyle = g; c.fillRect(0, 0, W, H); D(); }
          const last = i === S.length - 1;
          if (lt < TD && (i === 0 || pv.ci !== sh.ci)) K4.run(ch.tr, FULL, lt / TD, i === 0 ? black : () => drawS(pv, tl - pv.start), () => drawS(sh, lt), { text: ch.name, size: 400, t, cols: 6, rows: 10, dir: 1 });
          else if (lt < TI && i > 0 && ch.within !== 'cut') K4.run(ch.within, FULL, lt / TI, () => drawS(pv, tl - pv.start), () => drawS(sh, lt), { t, dir: i % 2 ? 1 : -1 });
          else if (last && lt > sh.d - TI) K4.run('whip', FULL, (lt - (sh.d - TI)) / TI, () => drawS(sh, lt), black, { dir: 1 });
          else drawS(sh, lt);
          if (sh.ci === 2 && sh.k > 0 && lt < 0.9) K4.dust(W / 2, rectOf(sh)[1] + rectOf(sh)[3], t, T0 + sh.start, 26, 0.45);
          if (sh.ci === 0) K4.embers(FULL, t, 44, 0.9);
          if (sh.ci === 3) K4.wind([0, 260, W, 1400], t, 16, 0.3);
          // the element word, chapter counter, project caption
          const cl = t - ch.t0, q = (t - (ch.t1 - 0.3)) / 0.3;
          if (sh.full) scrim(0, 700, 0.6, 0);
          K4.elementWord(ch.name + '.', W / 2, 470, sizeOf(ch.name), t, ch.t0 + 0.15, ch.mode, { q });
          if (sh.ci === 2 && cl < 1.3) K4.dust(W / 2, 480, t, ch.t0 + 0.42, 30, 0.35);
          caps('0' + (sh.ci + 1) + '  /  04', 72, 300, 20, clamp(cl / 0.3), clamp(q), { w: 700, fam: 'Mono', ls: 4, align: 'left', col: OR, ls0: 0, shadow: 'rgba(0,0,0,0.6)' });
          const r = rectOf(sh), yc = sh.full ? 1480 : r[1] + r[3] + 64;
          caps(sh.cap, W / 2, yc, 22, clamp((lt - 0.2) / 0.4), clamp((lt - (sh.d - 0.25)) / 0.25), { w: 700, fam: 'Mono', ls: 5, col: 'rgba(255,255,255,0.85)', shadow: 'rgba(0,0,0,0.7)' });
        } else {   // outro: the four words, the logo, the CTA
          const o = t - END;
          caps('FIRE  ·  WATER  ·  STONE  ·  AIR', W / 2, 470, 34, clamp(o / 0.35), 0, { w: 800, ls: 6, col: WHT });
          caps('ALL FOUR. ONE BACKYARD.', W / 2, 540, 24, clamp((o - 0.3) / 0.35), 0, { w: 700, fam: 'Mono', ls: 4, col: OR });
          K3.logoBuild(W / 2, 720, 760, 0.35, o, { speed: 1.6 });
          pill(CONTACT.cta, W / 2, 905, { size: Math.min(30, fitSize(CONTACT.cta, 800, 900, 30, 'Mont', 2.5)), p: clamp((o - 1.0) / 0.35) });
          caps(CONTACT.phone + '   ·   ' + CONTACT.web, W / 2, 1005, 30, clamp((o - 1.25) / 0.35), 0, { w: 800, ls: 2 });
          caps(footLine('  ·  '), W / 2, 1066, 20, clamp((o - 1.45) / 0.35), 0, { w: 500, fam: 'Mono', ls: 2, col: 'rgba(255,255,255,0.6)' });
          K4.embers([0, 300, W, 1100], t, 10, 0.35);
        }
      },
      cues() {
        const ev = [['ticks', 0.15, 0.12, 0, { dur: 1.1, n: 26 }], ['swell', T0 - 0.8, 0.3, 0]];
        CH.forEach((ch, ci) => {
          ev.push(ci === 0 ? ['boom', ch.t0, 0.5, 0] : ci === 1 ? ['air', ch.t0 + 0.1, 0.45, 0] : ci === 2 ? ['impact', ch.t0 + 0.25, 0.45, 0] : ['whoosh', ch.t0 + 0.3, 0.45, 0]);
          if (ci === 2) stoneHits.forEach((x, k) => ev.push(['impact', x, 0.26, (k - 2.5) * 0.2]));
          if (ci === 3) ev.push(['air', ch.t0 + 0.5, 0.3, 0.4]);
          if (ci === 0) ev.push(['whoosh', ch.t0 + 0.35, 0.3, 0]);
        });
        S.forEach((s, i) => { if (!i || S[i - 1].ci !== s.ci) return; const t = T0 + s.start;
          ev.push(s.ci === 0 ? ['swell', t - 0.2, 0.2, 0] : s.ci === 1 ? ['air', t + 0.1, 0.28, 0] : s.ci === 2 ? ['stamp', t, 0.45, 0] : ['whoosh', t + 0.25, 0.32, i % 2 ? 0.4 : -0.4]); });
        ev.push(['whoosh', END - 0.15, 0.35, 0.3]); ev.push(['impact', END + 0.05, 0.3, 0]);
        [0.35, 0.47, 0.59].forEach(d => ev.push(['clack', END + d, 0.3, 0])); ev.push(['chime', END + 1.05, 0.24, 0]);
        return { dur: DUR, beds: [['music', 0, DUR, 0.9, { style: 'cinematic', bpm: 100, key: -2, drop: T0, lift: CH[2].t0, end: END }],
          ['fire', CH[0].t0, CH[0].t1 + 0.3, 0.6], ['water', CH[1].t0 - 0.2, CH[1].t1 + 0.4, 0.6], ['birds', CH[3].t0, CH[3].t1 + 0.6, 0.35]], events: ev };
      },
    };
  }

  // ======================= #56 On Permanent Display =======================
  function gallery() {
    const WALL = '#ECE7DF', FLOOR0 = 1590, CYF = 860, IN = 2.2, SEG = 4.6, MV = 1.0;
    const ART0 = [
      { medium: 'Pavers, stone, pavilion', list: [['c12', 0.1, 8.1]] },
      { medium: 'Pergola, pool deck, planting', list: [['c03', 10.0, 4.9], ['c03', 0.2, 4.75]] },
      { medium: 'Pavers, stone, planting', list: [['c08', 10.98, 2.4], ['c08', 13.43, 2.5], ['c08', 5.98, 2.4]] },
      { medium: 'Stone, pavers, outdoor kitchen', list: [['c09', 3.55, 3.35], ['c09', 10.5, 3.4]] },
      { medium: 'Pavilion, patio, bocce court', list: [['c07', 24.0, 2.85], ['c07', 12.05, 2.85], ['c07', 27.0, 2.9]] },
    ];
    const TW = { kick: TX('kick', 'NOW ON VIEW', { label: 'Kicker', group: 'Title wall', upper: true, max: 18 }),
      l1: TX('wall1', 'The ' + BRAND.short, { label: 'Title, line 1', group: 'Title wall', max: 14 }), l2: TX('wall2', 'Collection', { label: 'Title, line 2 (orange)', group: 'Title wall', max: 14 }),
      sub: TX('wallSub', BRAND.descriptor || tagCaps(), { label: 'Line under the title', group: 'Title wall', upper: true, max: 40 }) };
    const ART = ART0.map((a, k) => { const g = 'Artwork ' + (k + 1), n = k + 1, kind = K3.ar(a.list[0][0]) < 1 ? 'vert' : 'land';
      const list = a.list.map(([c, inn, d], j) => { const sh = SHOT(`a${n}s${j + 1}`, [c, inn], { label: a.list.length > 1 ? 'Clip ' + (j + 1) + ' (loops)' : 'Clip (loops)', group: g, kind, d }); return [sh[0], sh[1], d]; });
      return { title: TX(`a${n}title`, projOf(list[0][0]), { label: 'Title on the placard', group: g, upper: true, max: 22 }), medium: TX(`a${n}medium`, a.medium, { label: 'Medium', group: g, max: 30 }), list }; });
    const EF = { pl1: TX('emptyTitle', 'YOUR BACKYARD', { label: 'Placard title', group: 'The empty frame', upper: true, max: 22 }),
      pl2: TX('emptyMedium', 'Medium: yours to choose', { label: 'Placard medium', group: 'The empty frame', max: 30 }),
      pl3: TX('emptyBy', 'BY COMMISSION', { label: 'Placard credit', group: 'The empty frame', upper: true, max: 22 }),
      h1: TX('emptyLine1', 'Your backyard,', { label: 'Line 1', group: 'The empty frame', max: 24 }), h2: TX('emptyLine2', 'on permanent display.', { label: 'Line 2 (orange)', group: 'The empty frame', max: 26 }) };
    const N = ART.length, X = k => 1500 + k * 1100, EMPTY = X(N), ARR = k => IN + MV + k * SEG, LAST = IN + N * SEG, OUT = LAST + 1.4, DUR = 30;
    function camX(t) {
      if (t < IN) return 0;
      for (let k = 0; k <= N; k++) { const a = IN + k * SEG, from = k === 0 ? 0 : X(k - 1) - W / 2, to = (k < N ? X(k) : EMPTY) - W / 2;
        if (t < a + MV) return lerp(from, to, E.inOutC((t - a) / MV)); if (k === N || t < a + SEG) return to; }
      return EMPTY - W / 2;
    }
    const artSize = c => { const a = K3.ar(c); return a < 1 ? [450, 800] : a < 1.6 ? [690, 460] : [760, 428]; };
    function frame(x, w, h, art, t, k) {   // spotlight, shadow, frame, mat; the artwork plays its playlist on a loop
      const fw = 30, mat = 64, x0 = x - w / 2 - mat - fw, y0 = CYF - h / 2 - mat - fw, W0 = w + 2 * (mat + fw), H0 = h + 2 * (mat + fw);
      if (!VID.collecting) {
        const c = K4.GI(), g = c.createRadialGradient(x, y0 - 160, 30, x, CYF, 880); g.addColorStop(0, 'rgba(255,249,238,0.8)'); g.addColorStop(0.5, 'rgba(255,249,238,0.2)'); g.addColorStop(1, 'rgba(255,249,238,0)');
        c.fillStyle = g; c.fillRect(x - 900, 0, 1800, FLOOR0);
        c.fillStyle = '#1A1A1A'; c.fillRect(x - 34, 96, 68, 22); c.fillRect(x - 5, 60, 10, 40); c.beginPath(); c.ellipse(x, 124, 26, 16, 0, 0, 7); c.fill();
        c.shadowColor = 'rgba(40,30,20,0.45)'; c.shadowBlur = 50; c.shadowOffsetY = 26; c.fillStyle = '#1D1814'; c.fillRect(x0, y0, W0, H0); c.shadowBlur = 0; c.shadowOffsetY = 0;
        c.fillStyle = '#2A221C'; c.fillRect(x0 + 6, y0 + 6, W0 - 12, H0 - 12); c.fillStyle = '#F6F3EE'; c.fillRect(x0 + fw, y0 + fw, W0 - 2 * fw, H0 - 2 * fw);
        c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 2; c.strokeRect(x - w / 2 - 3, CYF - h / 2 - 3, w + 6, h + 6); D();
      }
      const r = [x - w / 2, CYF - h / 2, w, h];
      if (art) { const tot = art.list.reduce((s, l) => s + l[2], 0), lt = lmod(t - (ARR(k) - 2.2), tot); let acc = 0;
        for (const [c, inn, d] of art.list) { if (lt < acc + d) { play(c, inn, lt - acc, r); break; } acc += d; } }
      return [x0, y0, W0, H0, r];
    }
    function placard(x, y, title, medium, by, a) {
      if (VID.collecting || a <= 0) return; const c = K4.GI(); c.globalAlpha = a; c.shadowColor = 'rgba(0,0,0,0.18)'; c.shadowBlur = 12; c.shadowOffsetY = 4; c.fillStyle = '#FFFFFF'; c.fillRect(x, y, 380, 178); c.shadowBlur = 0; c.shadowOffsetY = 0;
      setF(F(800, Math.min(23, fitSize(title, 800, 332, 23, 'Mont', 2)), 'Mont'), 2); c.fillStyle = ONLIGHT(); c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.fillText(title, x + 24, y + 48);
      setF(F(600, Math.min(30, fitSize(medium, 600, 332, 30, 'Corm', 0, 'italic')), 'Corm', 'italic'), 0); c.fillStyle = 'rgba(11,11,11,0.8)'; c.fillText(medium, x + 24, y + 96);
      setF(F(700, Math.min(16, fitSize(by, 700, 332, 16, 'Mono', 2)), 'Mono'), 2); c.fillStyle = OR; c.fillText(by, x + 24, y + 148); D();
    }
    return {
      dur: DUR,
      render(t) {
        const cx = camX(t);
        if (!VID.collecting) { const c = K4.GI(), g = c.createLinearGradient(0, 0, 0, FLOOR0); g.addColorStop(0, '#E0DAD0'); g.addColorStop(0.5, WALL); g.addColorStop(1, '#E6E0D6'); c.fillStyle = g; c.fillRect(0, 0, W, FLOOR0);
          c.fillStyle = '#D6CFC4'; c.fillRect(0, FLOOR0 - 14, W, 14); const f = c.createLinearGradient(0, FLOOR0, 0, H); f.addColorStop(0, '#5A4A3C'); f.addColorStop(1, '#2C231C'); c.fillStyle = f; c.fillRect(0, FLOOR0, W, H - FLOOR0);
          c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 2; for (let k = 0; k < 9; k++) { const fx = lmod(k * 240 - cx, 240 * 9) - 240; c.beginPath(); c.moveTo(fx, FLOOR0); c.lineTo(W / 2 + (fx - W / 2) * 2.4, H); c.stroke(); }
          c.strokeStyle = 'rgba(0,0,0,0.12)'; [1660, 1760, 1880].forEach(y => { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }); D(); }
        // the title wall
        const tx = 540 - cx;
        if (tx > -700) {
          caps(TW.kick, tx, 400, 22, clamp((t - 0.1) / 0.5), 0, { w: 700, fam: 'Mono', ls: 6, col: OR, maxW: 960 });
          K3.logoBuild(tx, 560, 440, 0.2, t, { img: LOGO_LIGHT(), soft: true, speed: 0.9 });
          K3.serifLines([TW.l1], tx, 800, Math.min(132, fitSize(TW.l1, 600, 960, 132, 'Corm')), 136, t, 0.55, { align: 'center', col: ONLIGHT(), style: '', w: 600 });
          K3.serifLines([TW.l2], tx, 930, Math.min(132, fitSize(TW.l2, 600, 960, 132, 'Corm', 0, 'italic')), 136, t, 0.75, { align: 'center', col: OR, w: 600 });
          caps(TW.sub, tx, 1060, 21, clamp((t - 1.2) / 0.5), 0, { w: 700, fam: 'Mono', ls: 4, col: 'rgba(11,11,11,0.7)', maxW: 960 });
        }
        // the artworks
        ART.forEach((art, k) => { const x = X(k) - cx; if (x < -700 || x > W + 700) return; const [w, h] = artSize(art.list[0][0]), fr = frame(x, w, h, art, t, k);
          const a = clamp((t - ARR(k) - 0.15) / 0.4) * (1 - clamp((t - (ARR(k) + SEG - MV - 0.25)) / 0.25));
          placard(fr[0] + fr[2] - 380, fr[1] + fr[3] + 40, art.title, art.medium, BRAND.name.toUpperCase(), a);
          caps('N° 0' + (k + 1), x, fr[1] - 40, 18, a, 0, { w: 700, fam: 'Mono', ls: 4, col: 'rgba(11,11,11,0.55)' }); });
        // the empty frame: "reserved", then it becomes the CTA
        const ex = EMPTY - cx;
        if (ex < W + 700) { const fr = frame(ex, 690, 460, null, t, N), o = t - OUT, cf = clamp(o / 0.4);
          if (!VID.collecting && cf < 1) { const c = K4.GI(); c.globalAlpha = 1 - cf; setF(F(600, 44, 'Corm', 'italic'), 0); c.fillStyle = 'rgba(11,11,11,0.35)'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('reserved', ex, CYF); D(); }
          if (o > 0) { drawLogo(LIGHTPAL ? 'w' : 'b', ex, 702, 400, E.outQ(clamp(o / 0.6)));
            pill(CONTACT.cta, ex, 815, { size: Math.min(24, fitSize(CONTACT.cta, 800, 640, 24, 'Mont', 2.5)), p: clamp((o - 0.35) / 0.35) });
            caps(CONTACT.phone, ex, 918, 54, clamp((o - 0.6) / 0.35), 0, { w: 800, ls: 1, col: ONLIGHT() });
            caps(CONTACT.web, ex, 968, 22, clamp((o - 0.85) / 0.35), 0, { w: 700, ls: 4, col: OR });
            caps(footLine('  ·  '), ex, 1032, 15, clamp((o - 1.05) / 0.35), 0, { w: 500, fam: 'Mono', ls: 2, col: 'rgba(11,11,11,0.6)' }); }
          const a = clamp((t - (LAST + MV) - 0.1) / 0.4); placard(fr[0] + fr[2] - 380, fr[1] + fr[3] + 40, EF.pl1, EF.pl2, EF.pl3, a);
          K3.serifLines([EF.h1], ex, 380, Math.min(64, fitSize(EF.h1, 600, 960, 64, 'Corm')), 70, t, LAST + MV + 0.15, { align: 'center', col: ONLIGHT(), style: '', w: 600 });
          K3.serifLines([EF.h2], ex, 452, Math.min(64, fitSize(EF.h2, 600, 960, 64, 'Corm', 0, 'italic')), 70, t, LAST + MV + 0.35, { align: 'center', col: OR, w: 600 }); }
      },
      cues() {
        const ev = [['air', 0.15, 0.2, 0]];
        for (let k = 0; k <= N; k++) { const a = IN + k * SEG; ev.push(['air', a + 0.2, 0.22, 0.35]); ev.push(['tink', a + MV + 0.2, 0.12, 0.4]); }
        ev.push(['chime', OUT + 0.1, 0.26, 0]); ev.push(['shimmer', OUT + 0.4, 0.18, 0]);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'lounge', bpm: 90, key: -1, end: OUT }], ['room', 0, DUR, 0.25]], events: ev };
      },
    };
  }

  // ======================= #58 Coming Soon to Your Backyard =======================
  function trailer() {
    const CY = 960;
    const SEQ0 = [   // [kind, t0, d, ...]
      ['shot', 1.4, 1.9, 'c12', 0.1], ['card', 3.3, 1.2, 'THIS SEASON'],
      ['shot', 4.5, 1.9, 'c11', 15.0], ['card', 6.4, 1.2, 'ONE BACKYARD'],
      ['shot', 7.6, 1.9, 'c07', 24.0], ['card', 9.5, 1.2, 'WILL CHANGE'],
      ['shot', 10.7, 1.7, 'c09', 3.55], ['card', 12.4, 1.2, 'EVERY WEEKEND.'],
    ];
    let ns = 0, nc = 0;
    const SEQ = SEQ0.map(s => { if (s[0] === 'card') { nc++; return ['card', s[1], s[2], TX('card' + nc, s[3], { label: 'Title card ' + nc, group: 'Title cards', upper: true, max: 18 })]; }
      ns++; const sh = SHOT('shot' + ns, [s[3], s[4]], { label: 'Before card ' + ns, group: 'Title cards', kind: 'land', d: s[2] }); return ['shot', s[1], s[2], sh[0], sh[1]]; });
    const MON0 = [['c05', 4.1], ['c08', 5.99], ['c10', 4.0], ['c09', 10.55], ['c07', 12.05], ['c11', 3.05], ['c12', 8.6], ['c02', 9.0], ['c07', 15.05], ['c05', 14.0], ['c09', 3.6], ['c12', 5.4]];
    const MD = [1.0, 0.9, 0.8, 0.7, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.35, 0.4];
    const MON = MON0.map((x, i) => SHOT('mon' + (i + 1), x, { label: 'Montage ' + (i + 1), group: 'Montage', kind: 'land', d: MD[i] }));
    let m0 = 13.6; const MS = MON.map((x, i) => { const o = { c: x[0], in: x[1], t0: m0, d: MD[i] }; m0 += MD[i]; return o; });
    const MEND = m0, TITLE = MEND + 0.8, SOON = TITLE + 2.6, BILL = SOON + 1.6, DUR = 30;
    const OVER = [['DESIGNED.', 14.4, 0.9], ['BUILT.', 16.3, 0.8], ['LIVED IN.', 17.9, 0.75]].map((o, i) => [TX('over' + (i + 1), o[0], { label: 'Word over the montage ' + (i + 1), group: 'Montage', upper: true, max: 12 }), o[1], o[2]]);
    const BIG = TX('title', 'BUILT BY ' + BRAND.short.toUpperCase(), { label: 'Title', group: 'Title and ending', upper: true, max: 16 });
    const SOONTX = [TX('soon1', 'COMING SOON', { label: 'Ending card, line 1', group: 'Title and ending', upper: true, max: 18 }), TX('soon2', 'TO YOUR BACKYARD', { label: 'Ending card, line 2', group: 'Title and ending', upper: true, max: 20 })].join('\n');
    const BILLING = (BRAND.billing || []).concat(CONTACT.lic ? [CONTACT.lic] : []);
    const bfit = (s, max, maxW, ls) => Math.min(max, max * maxW / textW(s, F(400, max, 'Bebas'), ls));
    function card(txt, lt, d, o) {   // Bebas title card; '\n' splits lines
      if (VID.collecting) return; o = o || {}; const a = clamp(lt / 0.12) * (1 - clamp((lt - (d - 0.15)) / 0.15)), s = 1 + 0.05 * (lt / d), lines = txt.split('\n');
      const size = Math.min(...lines.map(l => bfit(l, o.max || 190, 900, (o.max || 190) * 0.08))), c = G();
      c.globalAlpha = a; c.translate(W / 2, CY); c.scale(s, s); setF(F(400, size, 'Bebas'), size * 0.08); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.shadowColor = 'rgba(255,255,255,0.3)'; c.shadowBlur = 26; lines.forEach((l, k) => c.fillText(l, size * 0.04, (k - (lines.length - 1) / 2) * size * 0.95)); D();
      const k = Math.pow(clamp(1 - lt / 0.7), 2) * a;   // anamorphic streak through the title
      if (k > 0.01) { const c2 = K4.GI(); c2.globalCompositeOperation = 'lighter'; const g = c2.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(255,101,0,0)'); g.addColorStop(0.5, `rgba(255,190,120,${0.9 * k})`); g.addColorStop(1, 'rgba(255,101,0,0)');
        c2.fillStyle = g; c2.fillRect(0, CY - 2, W, 4); c2.globalAlpha = 0.35 * k; c2.fillRect(0, CY - 16, W, 32); D(); }
    }
    function shot(c, inn, lt, d, fade) { const a = fade ? clamp(lt / 0.35) * (1 - clamp((lt - (d - 0.3)) / 0.3)) : 1; ctx.save(); ctx.globalAlpha = a; play(c, inn, lt, bandR(c, CY)); ctx.restore(); }
    return {
      dur: DUR, shakes: [[3.3, 6], [6.4, 6], [9.5, 6], [12.4, 9], [TITLE, 14]],
      render(t) {
        fillScreen(BLK);
        if (t < 1.5) {   // studio-style opener: the logo, then PRESENTS
          const a = clamp(t / 0.5) * (1 - clamp((t - 1.2) / 0.3)); drawLogo('w', W / 2, CY - 30, 620, 1, a);
          caps('PRESENTS', W / 2, CY + 110, 26, clamp((t - 0.45) / 0.4) * (1 - clamp((t - 1.2) / 0.3)), 0, { w: 500, ls: 16, col: WA(0.85) }); }
        for (const s of SEQ) { if (t >= s[1] && t < s[1] + s[2]) { const lt = t - s[1]; if (s[0] === 'card') card(s[3], lt, s[2]); else shot(s[3], s[4], lt, s[2], true); } }
        for (const s of MS) { if (t >= s.t0 && t < s.t0 + s.d) { const lt = t - s.t0; shot(s.c, s.in, lt, s.d, false); if (lt < 1 / 30 + 0.001 && !VID.collecting) fillScreen(WHT, 0.65); } }
        for (const [w, t0, d] of OVER) { if (t >= t0 && t < t0 + d && !VID.collecting) { const lt = t - t0, a = clamp(lt / 0.08) * (1 - clamp((lt - d + 0.1) / 0.1)), c = G(); c.globalAlpha = a;
          setF(F(400, Math.min(150, bfit(w, 150, 940, 12)), 'Bebas'), 12); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 24; c.fillText(w, W / 2 + 6, 540 + (1 - E.outC(clamp(lt / 0.3))) * 20); D(); } }
        if (t >= TITLE && t < SOON + 0.2) { const lt = t - TITLE, a = clamp(lt / 0.08) * (1 - clamp((t - SOON) / 0.2)), s = 1.12 - 0.12 * E.outQ(clamp(lt / 0.5));
          if (!VID.collecting) { const size = bfit(BIG, 240, 940, 14), c = G(); c.globalAlpha = a; c.translate(W / 2, CY - 40); c.scale(s, s); setF(F(400, size, 'Bebas'), 14); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(BIG, 7, 0); D();
            const c2 = G(); c2.globalAlpha = a; c2.fillStyle = OR; const w = 640 * E.inOutC(clamp((lt - 0.3) / 0.5)); c2.fillRect(W / 2 - w / 2, CY + 80, w, 6); D(); } }
        if (t >= SOON && t < BILL + 0.2) card(SOONTX, t - SOON, BILL - SOON + 0.2, { max: 150 });
        if (t >= BILL) { const o = t - BILL;
          K3.logoBuild(W / 2, 440, 560, 0.0, o, { speed: 2 });
          BILLING.forEach((l, k) => { const sz = bfit(l, k === 0 ? 34 : 30, 900, 2); caps(l, W / 2, 590 + k * 44, sz, clamp((o - 0.2 - k * 0.1) / 0.4), 0, { w: 400, fam: 'Bebas', ls: 2, ls0: 2, col: k === 0 ? WHT : WA(0.72) }); });
          pill(CONTACT.cta, W / 2, 930, { size: Math.min(30, fitSize(CONTACT.cta, 800, 900, 30, 'Mont', 2.5)), p: clamp((o - 0.8) / 0.35) });
          caps(CONTACT.phone + '   ·   ' + CONTACT.web, W / 2, 1030, 30, clamp((o - 1.0) / 0.35), 0, { w: 800, ls: 2 });
          caps(CONTACT.area ? 'NOW SHOWING ACROSS ' + CONTACT.area : 'NOW SHOWING', W / 2, 1100, 20, clamp((o - 1.2) / 0.4), 0, { w: 700, fam: 'Mono', ls: 4, col: OR, maxW: 960 }); }
        if (!VID.collecting) { const c = K4.GI(); c.fillStyle = BLK; c.fillRect(0, 0, W, 120); c.fillRect(0, H - 120, W, 120); D(); }
      },
      cues() {
        const ev = [['swell', 0.1, 0.3, 0], ['shimmer', 0.5, 0.15, 0]];
        [3.3, 6.4, 9.5, 12.4].forEach(d => ev.push(['impact', d, 0.35, 0]));
        ev.push(['riser', 17.6, 0.4, 0]); ev.push(['riser', 19.1, 0.5, 0]); MS.forEach((s, i) => { if (i) ev.push(['snap', s.t0, 0.22 + 0.02 * i, (i % 2 ? 0.3 : -0.3)]); });
        OVER.forEach(([w, t0]) => ev.push(['impact', t0, 0.3, 0]));
        ev.push(['impact', TITLE, 0.6, 0]); ev.push(['shimmer', TITLE + 0.3, 0.22, 0]); ev.push(['boom', SOON, 0.4, 0]); ev.push(['chime', BILL + 0.8, 0.22, 0]);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'pulse', bpm: 128, key: -3, start: 13.6, end: MEND, hits: [3.3, 6.4, 9.5, 12.4, TITLE] }], ['room', 0, 13.8, 0.5], ['room', TITLE, DUR, 0.3]], events: ev };
      },
    };
  }

  const P = V === 'elements' ? elements() : V === 'gallery' ? gallery() : V === 'trailer' ? trailer() : sketch();
  const fin = V === 'gallery' ? { vig: 0.18, grain: 0.1 } : V === 'sketch' ? { vig: 0.06, grain: 0.12 } : { vig: 0.25, grain: 0.2 };
  DIR = { dur: P.dur, bg: V === 'sketch' ? PAPER : BLK, finish: fin, edl: [], shakes: P.shakes, preload: () => K3.init(), render: P.render, cues: P.cues };
});
