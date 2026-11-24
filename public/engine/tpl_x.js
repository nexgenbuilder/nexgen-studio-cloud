'use strict';
/* Round 5b: the vertical clips (v01..v05, Oct 25) in play. The landscape band opens out into the vertical twin of the
   same moment: xalign.py gives the similarity transform (vertical px -> landscape px), so the vertical starts exactly on
   top of the matching slice of the band and then expands to full screen; the landscape fades out unscaled.
   ?v=frame     #61 Some Backyards Don't Fit in a Frame (15 s, Bold Kinetic)
   ?v=stories   #62 Stories (15 s, engagement): native-feeling story frames, poll, Q&A and link stickers on vertical clips
   ?v=gatefold  #63 The Full Story (30 s, Editorial): magazine spreads that unfold into full-bleed verticals; Patty P.'s review
   ?v=uncropped #64 No Cut Corners (15 s, Grunge Street): torn-paper bands ripped open into full-bleed verticals
   ?v=scale     #65 Full Scale (30 s, Blueprint): The Entertainer, annotated band -> full-scale vertical sheets
   ?v=tallwall  #66 The Vertical Wall (15 s seamless loop): three columns of 9:16 tiles scrolling in opposite directions */
STUDIO_REG['x'] = (() => {
  const V = QS.get('v') || 'frame';
  const lmod = K3.lmod, G = K3.G, D = K3.D;
  const whole = (c, r) => K3.wholeIn(c, r);
  const play = (c, inn, lt, r, o) => K3.clip(c, inn, lt, whole(c, r), o);
  const FULLR = [0, 0, 1080, 1920];
  const lerpR = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u), lerp(a[3], b[3], u)];
  const bandAt = (c, cy, bx, bw) => { bx = bx || 0; bw = bw || W; const h = Math.round(bw / K3.ar(c)); return [bx, cy - h / 2, bw, h]; };
  const fit = (str, w, maxW, maxS, fam, ls) => Math.min(maxS, fitSize(str, w, maxW, maxS, fam, ls));
  const PJ = { c12: 'DUSK PAVILION', v01: 'DUSK PAVILION', c08: 'COURTYARD ESTATE', v02: 'COURTYARD ESTATE', c07: 'THE ENTERTAINER', v03: 'THE ENTERTAINER',
    c11: 'HILLSIDE VILLA', c02: 'HILLSIDE VILLA', v04: 'HILLSIDE VILLA', c09: 'STONE OVEN TERRACE', v05: 'STONE OVEN TERRACE', c05: 'MODERN POOL RETREAT', c03: 'MODERN POOL RETREAT', c04: 'MODERN POOL RETREAT' };

  // expand pairs: the landscape shot (lc from li, d s of band) and its vertical twin. vl = the vertical's playlist [[in, dur], ...]
  // from the moment the expand starts (a hard cut to the next piece when one runs out). xf = [s, tx, ty] maps vertical px ->
  // landscape px: measured by xalign.py where the vertical is the same footage (Hillside Villa: 113 inliers, 0.3 deg), else
  // GEN, the vertical centred on the band at the band's scale, with a quick dissolve inside the slice.
  const GEN = [1, 420, -420];
  const XP = {
    pav:    { lc: 'c12', li: 0.3, d: 2.3, vc: 'v01', vl: [[0.4, 9]], xf: GEN },
    ent:    { lc: 'c07', li: 15.0, d: 1.4, vc: 'v03', vl: [[16.4, 1.5], [18.0, 9]], xf: [0.8905, 457.6, -321.9], seam: true },
    villa:  { lc: 'c11', li: 15.0, d: 1.2, vc: 'v04', vl: [[21.833, 9]], xf: [0.9608, 430.9, -394.5], seam: true },
    entpav: { lc: 'c07', li: 24.0, d: 2.2, vc: 'v03', vl: [[23.95, 9]], xf: GEN },
    pavk:   { lc: 'c12', li: 8.5, d: 1.5, vc: 'v01', vl: [[10.5, 9]], xf: GEN },
    gpav:   { lc: 'c12', li: 0.1, d: 2.6, vc: 'v01', vl: [[0.05, 9]], xf: GEN },
    court:  { lc: 'c08', li: 5.98, d: 2.4, vc: 'v02', vl: [[11.0, 9]], xf: GEN },
    oven:   { lc: 'c09', li: 3.55, d: 2.4, vc: 'v05', vl: [[18.0, 9]], xf: [0.982, 453.9, -370.9], seam: true },
    villa2: { lc: 'c02', li: 8.98, d: 2.6, vc: 'v04', vl: [[4.05, 9]], xf: GEN },
    spav:   { lc: 'c07', li: 24.0, d: 2.0, vc: 'v03', vl: [[23.95, 9]], xf: GEN },
    sint:   { lc: 'c07', li: 27.0, d: 2.0, vc: 'v03', vl: [[6.02, 9]], xf: GEN },
    sboc:   { lc: 'c07', li: 12.05, d: 2.0, vc: 'v03', vl: [[11.98, 9]], xf: GEN },
    sfire:  { lc: 'c07', li: 3.05, d: 2.0, vc: 'v03', vl: [[3.02, 9]], xf: GEN },
  };
  function vseg(x, lt) { let acc = 0; for (let i = 0; i < x.vl.length; i++) { if (lt < acc + x.vl[i][1] || i === x.vl.length - 1) return [x.vl[i][0], lt - acc]; acc += x.vl[i][1]; } }
  const vclip = (x, lt, rect, o) => { const [vi, l] = vseg(x, lt); return K3.clip(x.vc, vi, l, rect, o); };
  // the vertical twin's rect on screen when it sits exactly over its slice of band B
  const v0Rect = (x, B) => { const k = B[2] / 1920; return [B[0] + x.xf[1] * k, B[1] + x.xf[2] * k, 1080 * x.xf[0] * k, 1920 * x.xf[0] * k]; };
  // expand: u 0 -> 1, the vertical opens out of the band to full screen; ltV = seconds since the expand started
  function expand(x, u, ltL, ltV, B, o) {
    o = o || {}; const e = E.inOutC(clamp(u)), V0 = v0Rect(x, B), Vr = lerpR(V0, o.to || FULLR, e), M = lerpR(B, o.to || FULLR, E.inOutC(clamp(u * 1.12)));
    const la = 1 - clamp(u / 0.38);
    if (la > 0) { ctx.save(); ctx.globalAlpha *= la; play(x.lc, x.li, ltL, B); ctx.restore(); }
    vclip(x, ltV, Vr, { clip: () => ctx.rect(M[0], M[1], M[2], M[3]), alpha: x.seam ? 1 : clamp(u / 0.22) });
    return { M, Vr, e };
  }
  // collapse: the full-screen vertical of pair p (at its local time plt) folds into band B while the next landscape fades in
  function collapse(p, plt, nc, ni, nlt, u, B, o) {
    o = o || {}; const e = E.inOutC(clamp(u)), vh = B[3] * 1.6, Vc = [B[0] + B[2] / 2 - vh * 9 / 32, B[1] + B[3] / 2 - vh / 2, vh * 9 / 16, vh];
    const Vr = lerpR(FULLR, Vc, e), M = lerpR(FULLR, B, E.inOutC(clamp(u * 1.1)));
    vclip(p, plt, Vr, { clip: () => ctx.rect(M[0], M[1], M[2], M[3]) });
    const na = clamp((u - 0.45) / 0.55); if (na > 0) { ctx.save(); ctx.globalAlpha *= na; play(nc, ni, nlt, B); ctx.restore(); }
    return { M, e };
  }
  const full = (x, lt, o) => vclip(x, lt, FULLR, o);

  // ======================= #61 Some Backyards Don't Fit in a Frame =======================
  function frame() {
    const CY = 1000, XD = 0.65, CD = 0.5;
    // beats: band (with the frame) -> expand -> full -> collapse into the next band
    const BEATS0 = [
      { x: XP.pav, lines: ['SOME BACKYARDS', 'DON’T FIT', 'IN A FRAME.'], full: 1.65 },
      { x: XP.ent, lines: ['THIS ONE', 'DIDN’T EITHER.'], full: 1.45 },
      { x: XP.villa, lines: ['NOT EVEN', 'CLOSE.'], full: 1.1 },
    ];
    // editable: each beat's lines (the last word of the last line gets the orange block) and its landscape -> vertical pair;
    // a changed pair loses its measured alignment and dissolves into the vertical instead
    const BEATS = BEATS0.map((b, k) => { const g = 'Beat ' + (k + 1), n = k + 1;
      const lines = b.lines.map((l, j) => TX(`b${n}l${j + 1}`, l, { label: 'Line ' + (j + 1) + (j === b.lines.length - 1 ? ' (last word highlighted)' : ''), group: g, upper: true, max: 16 }));
      const L = SHOT(`b${n}land`, [b.x.lc, b.x.li], { label: 'Landscape shot (in the frame)', group: g, kind: 'land', d: b.x.d + XD });
      const Vt = SHOT(`b${n}vert`, [b.x.vc, b.x.vl[0][0]], { label: 'Vertical shot (breaks out)', group: g, kind: 'vert', d: XD + b.full + CD });
      const ch = shotChanged(L, [b.x.lc, b.x.li]) || shotChanged(Vt, [b.x.vc, b.x.vl[0][0]]);
      const x = ch ? Object.assign({}, b.x, { lc: L[0], li: L[1], vc: Vt[0], vl: [[Vt[1], 99]], xf: GEN, seam: false }) : b.x;
      const last = lines[lines.length - 1].split(' ');
      return Object.assign({}, b, { x, lines, hl: [lines.length - 1, last.length - 1] }); });
    const CAP2 = TX('cap2', 'SHOT VERTICAL. BUILT BY ' + BRAND.short.toUpperCase() + '.', { label: 'Caption under the vertical', group: 'Captions', upper: true, max: 32 });
    const OUTL = TX('outro', 'YOURS WON’T EITHER.', { label: 'Ending line (last word highlighted)', group: 'Ending', upper: true, max: 22 });
    let t0 = 0; BEATS.forEach((b, i) => { b.t0 = t0; b.cIn = i ? CD : 0; b.tx = t0 + b.cIn + b.x.d; b.tf = b.tx + XD; b.t1 = b.tf + b.full; t0 = b.t1; });
    const END = t0, DUR = 15;
    let SZ = null; const sz = () => SZ || (SZ = { l: BEATS.map(b => Math.min(...b.lines.map(l => fit(l, 900, 950, 104, 'Mont', -3)))), out: fit(OUTL, 900, 950, 96, 'Mont', -3) });
    function frameRect(B, p, br) {   // white frame around the band; br = break-out 0..1 (flies to the screen edges)
      if (VID.collecting || p <= 0) return; const pad = 16, R = lerpR([B[0] + pad, B[1] - pad, B[2] - 2 * pad, B[3] + 2 * pad], [-40, -40, W + 80, H + 80], E.inC(clamp(br)));
      const c = G(); c.globalAlpha = 1 - clamp(br * 1.3); c.strokeStyle = WHT; c.lineWidth = 6; const L = (2 * R[2] + 2 * R[3]) * E.inOutC(clamp(p));
      c.setLineDash([L, 1e5]); c.beginPath(); c.moveTo(R[0], R[1]); c.lineTo(R[0] + R[2], R[1]); c.lineTo(R[0] + R[2], R[1] + R[3]); c.lineTo(R[0], R[1] + R[3]); c.closePath(); c.stroke(); D();
    }
    function words(b, i, t, push) {
      const z = sz().l[i], y0 = 330 + z;
      b.lines.forEach((l, k) => { const ws = l.split(' '); K3.words(ws, 64, y0 + k * z * 1.04 - push * 260, z, t, b.t0 + b.cIn + 0.1 + k * 0.32, { align: 'left', step: 0.12, hl: b.hl[0] === k ? b.hl[1] : -1, q: push * 1.4 }); });
    }
    return {
      dur: DUR, shakes: BEATS.map(b => [b.tx + 0.1, 10]),
      render(t) {
        K3.bgKinetic(t, CY, 60 / 112 * 4);
        if (t < END) {
          let i = 0; BEATS.forEach((b, k) => { if (t >= b.t0) i = k; }); const b = BEATS[i], x = b.x, B = bandAt(x.lc, CY), pv = BEATS[i - 1];
          const lt = t - b.t0, ltL = t - (b.t0 + b.cIn);
          if (t < b.t0 + b.cIn) collapse(pv.x, t - pv.tx, x.lc, x.li, 0, lt / b.cIn, B);
          else if (t < b.tx) play(x.lc, x.li, ltL, B);
          else if (t < b.tf) expand(x, (t - b.tx) / XD, ltL, t - b.tx, B);
          else full(x, t - b.tx);
          const br = clamp((t - b.tx) / XD);
          frameRect(B, clamp((t - (b.t0 + b.cIn) + 0.05) / 0.4), br);
          if (t < b.tf) words(b, i, t, E.inC(clamp((t - b.tx) / (XD * 0.7))));
          if (t >= b.tx + 0.3) { scrim(1500, H, 0, 0.55); scrim(0, 520, 0.5, 0);
            caps('N° 0' + (i + 1) + '  ·  ' + (PJ[x.vc] || projOf(x.vc)), 64, 330, 22, clamp((t - b.tx - 0.35) / 0.35), clamp((t - (b.t1 - 0.2)) / 0.2), { w: 700, fam: 'Mono', ls: 4, align: 'left', col: WHT, ls0: 0, shadow: 'rgba(0,0,0,0.6)' });
            caps(CAP2, 64, 1200, 22, clamp((t - b.tx - 0.5) / 0.35), clamp((t - (b.t1 - 0.2)) / 0.2), { w: 700, fam: 'Mono', ls: 3, align: 'left', col: OR, ls0: 0, shadow: 'rgba(0,0,0,0.6)', maxW: 950 }); }
        } else {   // the last vertical folds into a white frame that becomes the outro
          const o = t - END, last = BEATS[BEATS.length - 1];
          if (o < 0.5) { const u = E.inOutC(o / 0.5), R = lerpR(FULLR, [140, 380, 800, 1422], u); full(last.x, t - last.tx, { clip: () => ctx.rect(R[0], R[1], R[2], R[3]), alpha: 1 - u }); }
          const z = sz().out, ow = OUTL.split(' '); K3.words(ow, W / 2, 560, z, o, 0.3, { step: 0.13, hl: ow.length - 1 });
          K3.logoBuild(W / 2, 760, 600, 0.75, o, { speed: 1.5 });
          K3.ctaBlock(o, 930, 0.85, 'kinetic');
        }
      },
      cues() {
        const ev = [];
        BEATS.forEach((b, i) => { if (i) ev.push(['whoosh', b.t0 + 0.2, 0.3, 0]); b.lines.forEach((l, k) => ev.push(['impact', b.t0 + b.cIn + 0.1 + k * 0.32, 0.25, 0]));
          ev.push(['swell', b.tx - 0.5, 0.3, 0]); ev.push(['boom', b.tx + 0.1, 0.5, 0]); ev.push(['air', b.tx + 0.15, 0.3, 0]); });
        ev.push(['whoosh', END + 0.15, 0.3, 0]); ev.push(['impact', END + 0.56, 0.35, 0]); ev.push(['chime', END + 2.0, 0.22, 0]);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'pulse', bpm: 112, key: 0, start: 0, end: END, hits: BEATS.map(b => b.tx + 0.1) }]], events: ev };
      },
    };
  }

  // ======================= #62 Stories =======================
  function stories() {
    const ST0 = [
      { c: 'v01', in: 0.1, d: 3.3, kind: 'poll', g: 'Story 1 · poll' },
      { c: 'v03', in: 15.0, d: 2.9, kind: 'label', g: 'Story 2 · sticker' },
      { c: 'v04', in: 18.0, d: 3.6, kind: 'qa', g: 'Story 3 · question box' },
      { c: 'v05', in: 16.0, d: 2.4, kind: 'link', g: 'Story 4 · link' },
    ];
    const ST = ST0.map((s, k) => { const sh = SHOT('st' + (k + 1), [s.c, s.in], { label: 'Vertical clip', group: s.g, kind: 'vert', d: s.d + (k === ST0.length - 1 ? 0.35 : 0) }); return Object.assign({}, s, { c: sh[0], in: sh[1] }); });
    const X = {
      poll: TX('poll', 'WOULD YOU HOST HERE?', { label: 'Poll question', group: ST0[0].g, upper: true, max: 24 }),
      yes: TX('pollA', 'YES', { label: 'Answer 1', group: ST0[0].g, upper: true, max: 12 }),
      abs: TX('pollB', 'ABSOLUTELY', { label: 'Answer 2 (gets tapped)', group: ST0[0].g, upper: true, max: 12 }),
      same: TX('pollNote', 'SAME.', { label: 'Note under the tap', group: ST0[0].g, upper: true, max: 12 }),
      lab: TX('sticker', 'GAME NIGHT, UPGRADED.', { label: 'Sticker', group: ST0[1].g, upper: true, max: 24 }),
      labCap: TX('stickerCap', 'THE BOCCE COURT AT THE ENTERTAINER', { label: 'Caption', group: ST0[1].g, upper: true, max: 40 }),
      qaHead: TX('qaHead', 'ASK US ANYTHING', { label: 'Box title', group: ST0[2].g, upper: true, max: 20 }),
      qaQ: TX('qaQ', 'where do I even start?', { label: 'Question (typed in)', group: ST0[2].g, max: 34 }),
      qaLab: TX('qaLabel', 'OUR ANSWER', { label: 'Answer label', group: ST0[2].g, upper: true, max: 16 }),
      qaA: TX('qaA', 'A one-on-one design consultation.', { label: 'Answer', group: ST0[2].g, max: 34 }),
    };
    let t0 = 0; ST.forEach(s => { s.t0 = t0; t0 += s.d; }); const END = t0, DUR = 15;
    function ui(t, i, lt) {   // progress bars + header (generic story UI)
      if (VID.collecting) return; scrim(0, 520, 0.55, 0); const c = G(), n = ST.length, gw = (W - 48 - (n - 1) * 8) / n;
      for (let k = 0; k < n; k++) { const x = 24 + k * (gw + 8); c.fillStyle = 'rgba(255,255,255,0.35)'; rrect(x, 284, gw, 6, 3); c.fill(); const f = k < i ? 1 : k === i ? clamp(lt / ST[k].d) : 0;
        if (f > 0) { c.fillStyle = WHT; rrect(x, 284, gw * f, 6, 3); c.fill(); } }
      c.fillStyle = BLK; c.beginPath(); c.arc(70, 350, 32, 0, 7); c.fill(); c.strokeStyle = OR; c.lineWidth = 4; c.stroke(); D();
      K3.mark(70, 350, 30);
      const c2 = G(); setF(F(700, 28, 'Mont'), 0); c2.fillStyle = WHT; c2.textAlign = 'left'; c2.textBaseline = 'alphabetic'; c2.shadowColor = 'rgba(0,0,0,0.5)'; c2.shadowBlur = 8;
      setF(F(700, Math.min(28, fitSize(BRAND.name, 700, 600, 28, 'Mont')), 'Mont'), 0); c2.fillText(BRAND.name, 118, 344); setF(F(500, 20, 'Mono'), 1); c2.fillStyle = 'rgba(255,255,255,0.75)'; c2.fillText(PJ[ST[i].c] || projOf(ST[i].c), 118, 374); D();
    }
    function tap(x, y, t, t0) { if (t >= t0 - 0.12 && t < t0 + 0.2 && !VID.collecting) { const c = G(); c.globalAlpha = 0.5 * (1 - clamp((t - t0) / 0.2)); c.fillStyle = WHT; c.beginPath(); c.arc(x + 6, y + 6, 40, 0, 7); c.fill(); D(); } K3.ripple(x, y, t, t0); }
    function sticker(s, lt, t) {
      if (VID.collecting) return;
      if (s.kind === 'poll') {   // poll sticker; the viewer picks ABSOLUTELY (no vote counts shown)
        const p = E.outBack(clamp((lt - 0.4) / 0.35)), cx = W / 2, cy = 1020, c = G(); c.globalAlpha = clamp(p * 3); c.translate(cx, cy); c.scale(p, p); c.rotate(-0.03);
        c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 30; c.fillStyle = WHT; rrect(-380, -170, 760, 340, 34); c.fill(); c.shadowBlur = 0;
        setF(F(900, Math.min(46, fitSize(X.poll, 900, 700, 46, 'Mont', -1)), 'Mont'), -1); c.fillStyle = BLK; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(X.poll, 0, -84);
        const picked = lt >= 2.0, pp = clamp((lt - 2.0) / 0.3);
        [[X.yes, -175], [X.abs, 175]].forEach(([w, x], k) => { c.fillStyle = k === 1 && picked ? OR : '#EFEFEF'; rrect(x - 160, -30, 320, 120, 22); c.fill();
          setF(F(800, Math.min(34, fitSize(w, 800, 286, 34, 'Mont', 1)), 'Mont'), 1); c.fillStyle = BLK; c.textBaseline = 'middle'; c.fillText(w, x, 32); c.textBaseline = 'alphabetic'; });
        if (picked) { c.globalAlpha = clamp(p * 3) * pp; setF(F(700, 22, 'Mono'), 2); c.fillStyle = OR; c.fillText(X.same, 175, 130); }
        D(); tap(W / 2 + 175, 1052, t, s.t0 + 2.0);
      } else if (s.kind === 'label') {   // text sticker slapped on
        K3.label(X.lab, W / 2, 720, Math.min(72, 860 / (textW(X.lab, F(400, 100, 'Bebas'), 3) / 100 + 0.9)), -0.04, clamp((lt - 0.35) / 0.3));
        caps(X.labCap, W / 2, 830, 22, clamp((lt - 0.8) / 0.4), 0, { w: 700, fam: 'Mono', ls: 3, shadow: 'rgba(0,0,0,0.7)', maxW: 960 });
      } else if (s.kind === 'qa') {   // question box, typed question, then the answer card
        const p = E.outBack(clamp((lt - 0.3) / 0.35)), c = G(); c.globalAlpha = clamp(p * 3); c.translate(W / 2, 900); c.scale(p, p);
        c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 30; c.fillStyle = OR; rrect(-400, -150, 800, 110, [34, 34, 0, 0]); c.fill(); c.fillStyle = WHT; rrect(-400, -40, 800, 170, [0, 0, 34, 34]); c.fill(); c.shadowBlur = 0;
        setF(F(800, Math.min(36, fitSize(X.qaHead, 800, 740, 36, 'Mont', 1)), 'Mont'), 1); c.fillStyle = BLK; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(X.qaHead, 0, -95);
        const q = X.qaQ, n = Math.floor(clamp((lt - 0.8) / 0.9) * q.length); setF(F(600, Math.min(38, fitSize(q, 600, 740, 38, 'Mont')), 'Mont'), 0); c.fillStyle = '#222'; c.fillText(q.slice(0, n) || ' ', 0, 45); D();
        if (lt > 2.0) { const p2 = E.outBack(clamp((lt - 2.0) / 0.35)), c2 = G(); c2.globalAlpha = clamp(p2 * 3); c2.translate(W / 2, 1150); c2.scale(p2, p2); c2.rotate(0.02); c2.fillStyle = BLK; rrect(-390, -70, 780, 140, 30); c2.fill();
          setF(F(500, 22, 'Mono'), 2); c2.fillStyle = OR; c2.textAlign = 'center'; c2.textBaseline = 'alphabetic'; c2.fillText(X.qaLab, 0, -22); setF(F(800, Math.min(38, fitSize(X.qaA, 800, 720, 38, 'Mont')), 'Mont'), 0); c2.fillStyle = WHT; c2.fillText(X.qaA, 0, 34); D(); }
      } else if (s.kind === 'link') {   // link sticker, tapped
        const p = E.outBack(clamp((lt - 0.3) / 0.35)), press = lt > 1.4 && lt < 1.55 ? 0.94 : 1, c = G(); c.globalAlpha = clamp(p * 3); c.translate(W / 2, 1020); c.scale(p * press, p * press);
        c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 24; c.fillStyle = WHT; rrect(-360, -56, 720, 112, 56); c.fill(); c.shadowBlur = 0;
        c.strokeStyle = OR; c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-304, 14); c.lineTo(-276, -14); c.moveTo(-296, -14); c.lineTo(-276, -14); c.lineTo(-276, 6); c.stroke();
        setF(F(800, Math.min(32, fitSize(CONTACT.cta, 800, 580, 32, 'Mont', 1.5)), 'Mont'), 1.5); c.fillStyle = BLK; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(CONTACT.cta, -250, 2); D();
        tap(W / 2 + 160, 1020, t, s.t0 + 1.4);
      }
    }
    return {
      dur: DUR, shakes: [],
      render(t) {
        fillScreen(BLK);
        if (t < END) {
          let i = 0; ST.forEach((s, k) => { if (t >= s.t0) i = k; }); const s = ST[i], lt = t - s.t0;
          K3.clip(s.c, s.in, lt, FULLR);
          ui(t, i, lt); sticker(s, lt, t);
          if (i < ST.length - 1) tap(900, 1500, t, s.t0 + s.d - 0.05);
        } else {   // end card: the link opened
          const o = t - END; if (o < 0.35) { const sv = ST[ST.length - 1]; K3.clip(sv.c, sv.in, sv.d + o, FULLR, { alpha: 1 - o / 0.35 }); }
          K3.logoBuild(W / 2, 640, 720, 0.2, o, { speed: 1.5 });
          caps(tagCaps(), W / 2, 800, 24, clamp((o - 0.7) / 0.4), 0, { w: 700, fam: 'Mono', ls: 4, col: 'rgba(255,255,255,0.8)', maxW: 980 });
          K3.ctaBlock(o, 920, 0.6, 'kinetic');
        }
      },
      cues() {
        const ev = [['pop', ST[0].t0 + 0.45, 0.3, 0], ['tick', ST[0].t0 + 2.0, 0.3, 0.3], ['pop', ST[0].t0 + 2.05, 0.25, 0.3]];
        ST.forEach((s, i) => { if (i < ST.length - 1) ev.push(['tick', s.t0 + s.d - 0.05, 0.28, 0.5]); });
        ev.push(['stamp', ST[1].t0 + 0.4, 0.35, 0]); ev.push(['pop', ST[2].t0 + 0.35, 0.3, 0]); ev.push(['ticks', ST[2].t0 + 0.8, 0.1, 0, { dur: 0.9, n: 14 }]); ev.push(['pop', ST[2].t0 + 2.05, 0.3, 0]);
        ev.push(['pop', ST[3].t0 + 0.35, 0.3, 0]); ev.push(['tick', ST[3].t0 + 1.4, 0.3, 0]); ev.push(['chime', ST[3].t0 + 1.6, 0.25, 0]); ev.push(['ticks', END + 1.4, 0.14, 0, { dur: 0.8, n: 14 }]);
        return { dur: DUR, beds: [['music', 0, DUR, 0.9, { style: 'day', bpm: 108, key: 2, end: 13.4 }]], events: ev };
      },
    };
  }

  // ======================= #63 The Full Story =======================
  function gatefold() {
    const CY = 900, XD = 0.8, CD = 0.55, INK = BLK, MUTE = 'rgba(11,11,11,0.62)';
    const SP = [
      { x: XP.gpav, full: 2.05, title: 'Dusk Pavilion', cap: 'PAVILION, PAVERS AND PLANTING', line: 'Made for the hour after sunset.' },
      { x: XP.court, full: 2.05, title: 'Courtyard Estate', cap: 'PAVER DRIVEWAY, STONE AND PLANTING', line: 'An entrance worth the drive.' },
      { x: XP.oven, full: 1.55, title: 'Stone Oven Terrace', cap: 'OUTDOOR KITCHEN AND LOUNGE TERRACE', line: 'Dinner, cooked outside.' },
      { x: XP.villa2, full: 2.05, title: 'Hillside Villa', cap: 'POOL DECK AND PATIO OVER THE HILLS', line: 'A view worth the whole page.' },
    ];
    let t0 = 0.4; SP.forEach(s => { s.t0 = t0; s.tx = s.t0 + s.x.d; s.tf = s.tx + XD; s.tc = s.tf + s.full; t0 = s.tc + CD; });
    const QT = t0, OUT = QT + 2.5, DUR = 30;
    const Q = { text: 'Good communication, great service, gorgeous pavers. Love this company!', by: 'PATTY P.  ·  WALNUT CREEK' };
    function creases(M, u) {   // paper fold shading along the opening edges
      if (VID.collecting || u <= 0 || u >= 1) return; const k = Math.sin(Math.PI * u), c = G();
      [[M[1], 1], [M[1] + M[3], -1]].forEach(([y, d]) => { const g = c.createLinearGradient(0, y, 0, y + d * 120); g.addColorStop(0, `rgba(0,0,0,${0.45 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, Math.min(y, y + d * 120), W, 120);
        c.fillStyle = `rgba(255,255,255,${0.7 * k})`; c.fillRect(0, y - 1, W, 2); });
      D();
    }
    return {
      dur: DUR, shakes: [],
      render(t) {
        K3.bgPaper(t);
        caps('THE FULL STORY', 72, 300, 21, clamp(t / 0.4), clamp((t - QT) / 0.3), { w: 700, fam: 'Mono', ls: 5, align: 'left', col: OR, ls0: 0 });
        caps(BRAND.name.toUpperCase() + '  ·  PORTFOLIO', W - 72, 300, 21, clamp(t / 0.4), clamp((t - QT) / 0.3), { w: 700, fam: 'Mono', ls: 3, align: 'right', col: MUTE, ls0: 0 });
        if (t < QT) {
          let i = 0; SP.forEach((s, k) => { if (t >= s.t0) i = k; }); const s = SP[i], x = s.x, B = bandAt(x.lc, CY, 60, 960), lt = t - s.t0;
          if (t < s.t0) return;
          if (t < s.tx) { play(x.lc, x.li, lt, B); if (!VID.collecting) { const c = G(); c.strokeStyle = 'rgba(11,11,11,0.25)'; c.lineWidth = 2; c.strokeRect(B[0] - 0.5, B[1] - 0.5, B[2] + 1, B[3] + 1); D(); } }
          else if (t < s.tf) { const r = expand(x, (t - s.tx) / XD, lt, t - s.tx, B); creases(r.M, (t - s.tx) / XD); }
          else if (t < s.tc) full(x, t - s.tx);
          else { const u = (t - s.tc) / CD, M = lerpR(FULLR, [0, 1920 / 2, W, 0], E.inOutC(u)); full(x, t - s.tx, { clip: () => ctx.rect(M[0], M[1], M[2], M[3]) }); creases(M, u); }
          // page type: title + caption on the band; a serif line over the full-bleed page
          const pa = 1 - clamp((t - s.tx) / 0.3);
          if (pa > 0) { ctx.save(); ctx.globalAlpha = pa; K3.serifLines([s.title], 66, 470, 96, 100, t, s.t0 + 0.15, { col: INK });
            caps('N° 0' + (i + 1), 72, 540, 20, clamp((lt - 0.4) / 0.4), 0, { w: 700, fam: 'Mono', ls: 4, align: 'left', col: OR, ls0: 0 });
            caps(s.cap, 72, B[1] + B[3] + 50, 20, clamp((lt - 0.6) / 0.4), 0, { w: 700, fam: 'Mono', ls: 3, align: 'left', col: MUTE, ls0: 0 }); ctx.restore(); }
          if (t >= s.tf - 0.1 && t < s.tc + 0.2) { const q = (t - (s.tc - 0.25)) / 0.25; scrim(980, H, 0, 0.82); scrim(0, 560, 0.5, 0);
            K3.serifLines([s.line], W / 2, 1230, 64, 70, t, s.tf + 0.1, { align: 'center', col: WHT, q });
            caps(PJ[x.vc] + '  ·  SHOT VERTICAL', W / 2, 1300, 20, clamp((t - s.tf - 0.4) / 0.4), clamp(q), { w: 700, fam: 'Mono', ls: 4, col: 'rgba(255,255,255,0.8)' }); }
        } else if (t < OUT + 0.4) {
          K3.quote(Q.text, Q.by, 90, 600, 900, 70, t, QT + 0.3, { col: INK, byCol: OR, q: (t - OUT) / 0.4 });
          caps('A REVIEW FROM ' + CONTACT.web, 90, 1150, 18, clamp((t - QT - 1.6) / 0.4), clamp((t - OUT) / 0.4), { w: 700, fam: 'Mono', ls: 3, align: 'left', col: MUTE, ls0: 0 });
        }
        if (t >= OUT + 0.1) { const o = t - OUT - 0.1;
          K3.logoBuild(W / 2, 640, 760, 0.1, o, { img: IMG.logoB, soft: true, speed: 1.2 });
          K3.serifLines(['The full story starts with a conversation.'], W / 2, 830, 46, 52, o, 0.6, { align: 'center', col: INK });
          K3.ctaBlock(o, 950, 0.7, 'editorial'); }
      },
      cues() {
        const ev = [['paper', 0.3, 0.25, 0]];
        SP.forEach(s => { ev.push(['paper', s.t0 + 0.1, 0.22, 0]); ev.push(['tink', s.t0 + 0.3, 0.1, -0.3]); ev.push(['swell', s.tx - 0.4, 0.22, 0]); ev.push(['air', s.tx + 0.2, 0.3, 0]); ev.push(['paper', s.tx + 0.35, 0.3, 0]);
          ev.push(['shimmer', s.tf + 0.1, 0.14, 0]); ev.push(['paper', s.tc + 0.1, 0.25, 0]); });
        ev.push(['air', QT, 0.25, 0]); ev.push(['chime', OUT + 0.4, 0.22, 0]); ev.push(['ticks', OUT + 1.4, 0.14, 0, { dur: 0.8, n: 14 }]);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'cinematic', bpm: 84, key: 1, drop: SP[0].tx, lift: SP[2].t0, end: QT }]], events: ev };
      },
    };
  }

  // ======================= #64 No Cut Corners =======================
  function uncropped() {
    const CY = 905, XD = 0.7, CD = 0.5;
    const BT = [
      { x: XP.entpav, note: 'the whole thing →', big: 'UNCROPPED.', rot: -0.02 },
      { x: XP.pavk, note: 'no shortcuts here', big: 'NO CUT CORNERS.', rot: 0.018 },
    ];
    let t0 = 0; BT.forEach((b, i) => { b.t0 = t0; b.cIn = i ? CD : 0; b.tx = t0 + b.cIn + b.x.d; b.tf = b.tx + XD; b.t1 = b.tf + (i ? 2.2 : 2.0); t0 = b.t1; });
    const END = t0, DUR = 15;
    function torn(M, u, seed) {   // torn paper edges riding the opening window
      if (VID.collecting || u <= 0 || u >= 1) return; const c = G(), r = rng(seed), a = 1 - clamp((u - 0.7) / 0.3);
      c.globalAlpha = a; c.fillStyle = '#EDE6DA'; c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 20;
      const th = 30 + 40 * u; [[M[1], -1], [M[1] + M[3], 1]].forEach(([y, d]) => { c.beginPath(); c.moveTo(-10, y + d * th); for (let x = -10; x <= W + 20; x += 18) c.lineTo(x, y + (r() - 0.5) * 22 + d * 4); c.lineTo(W + 20, y + d * th);
        for (let x = W + 20; x >= -10; x -= 22) c.lineTo(x, y + d * (th + (r() - 0.5) * 14)); c.closePath(); c.fill(); });
      D();
    }
    return {
      dur: DUR, shakes: BT.map(b => [b.tx + 0.05, 12]),
      render(t) {
        K3.bgGrunge(t, 11);
        if (t < END) {
          let i = 0; BT.forEach((b, k) => { if (t >= b.t0) i = k; }); const b = BT[i], x = b.x, B = bandAt(x.lc, CY, 60, 960), pv = BT[i - 1], ltL = t - (b.t0 + b.cIn);
          if (t < b.tx) { ctx.save(); ctx.globalAlpha = i && t < b.t0 + b.cIn ? clamp((t - b.t0) / b.cIn) : 1; K3.mount(B, b.rot, 21 + i, { pad: 20 }); ctx.restore(); }
          if (t < b.t0 + b.cIn) collapse(pv.x, t - pv.tx, x.lc, x.li, 0, (t - b.t0) / b.cIn, B);
          else if (t < b.tx) { play(x.lc, x.li, ltL, B); K3.tape(B[0] + 90, B[1] - 6, -0.3, 1); K3.tape(B[0] + B[2] - 90, B[1] + B[3] + 6, -0.25, 1);
            K3.note(b.note, 90, B[1] - 60, 64, clamp((ltL - 0.3) / 0.6), { col: WHT, rot: -0.05 });
            K3.words(b.big.split(' '), 64, 470, fit(b.big, 900, 950, 120, 'Mont', -3), t, b.t0 + b.cIn + 0.5, { align: 'left', step: 0.14, fam: 'Mont', hl: -1 }); }
          else if (t < b.tf) { const r = expand(x, (t - b.tx) / XD, ltL, t - b.tx, B); torn(r.M, (t - b.tx) / XD, 40 + i); }
          else full(x, t - b.tx);
          if (t >= b.tf - 0.1) { const q = (t - (b.t1 - 0.25)) / 0.25; scrim(0, 700, 0.6, 0);
            K3.paint(W / 2, 520, 900, 170, b.rot * 2, clamp((t - b.tf + 0.05) / 0.25), 60 + i, OR);
            const z = fit(b.big, 400, 840, 170, 'Bebas', 4); if (!VID.collecting && clamp(q) < 1) { const c = G(); c.globalAlpha = clamp((t - b.tf - 0.05) / 0.12) * (1 - clamp(q)); c.translate(W / 2, 520); c.rotate(b.rot * 2);
              setF(F(400, z, 'Bebas'), 4); c.fillStyle = BLK; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(b.big, 2, z * 0.04); D(); }
            caps(PJ[x.vc] + '  ·  SHOT VERTICAL', W / 2, 1180, 22, clamp((t - b.tf - 0.3) / 0.4), clamp(q), { w: 700, fam: 'Mono', ls: 4, shadow: 'rgba(0,0,0,0.7)' }); }
        } else {
          const o = t - END, last = BT[BT.length - 1]; if (o < 0.4) full(last.x, t - last.tx, { alpha: 1 - o / 0.4 });
          K3.outro('grunge', o, 'NO CUT CORNERS. ANYWHERE.');
        }
      },
      cues() {
        const ev = [];
        BT.forEach((b, i) => { if (i) ev.push(['whoosh', b.t0 + 0.15, 0.3, 0]); ev.push(['stamp', b.t0 + b.cIn + 0.1, 0.3, 0]); ev.push(['scribble', b.t0 + b.cIn + 0.3, 0.2, -0.3, { dur: 0.7 }]);
          b.big.split(' ').forEach((w, k) => ev.push(['impact', b.t0 + b.cIn + 0.5 + k * 0.14, 0.22, 0]));
          ev.push(['paper', b.tx + 0.05, 0.45, 0]); ev.push(['boom', b.tx + 0.1, 0.45, 0]); ev.push(['stamp', b.tf + 0.05, 0.4, 0]); });
        ev.push(['whoosh', END + 0.1, 0.3, 0]); ev.push(['stamp', END + 0.5, 0.45, 0]); ev.push(['stamp', END + 1.6, 0.4, 0]);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'night', bpm: 104, key: -2, click: BT[0].tx + 0.1, end: DUR }], ['crickets', 0, BT[0].tx + 0.4, 0.3]], events: ev };
      },
    };
  }

  // ======================= #65 Full Scale =======================
  function scale() {
    const CY = 880, XD = 0.6, CD = 0.5;
    const SHEETS = [
      { x: XP.spav, full: 2.2, n: '01', name: 'PAVILION', labs: [['PAVILION', 0.38, 0.33], ['OUTDOOR KITCHEN', 0.62, 0.5], ['PAVER PATIO', 0.45, 0.8]] },
      { x: XP.sint, full: 1.85, n: '02', name: 'UNDER THE PAVILION', labs: [['PAVILION', 0.5, 0.3], ['OUTDOOR KITCHEN', 0.84, 0.56]] },
      { x: XP.sboc, full: 1.85, n: '03', name: 'BOCCE COURT', labs: [['BOCCE COURT', 0.5, 0.62], ['PLANTING', 0.2, 0.7]] },
      { x: XP.sfire, full: 1.85, n: '04', name: 'LAWN & FIRE BOWL', labs: [['PLANTING', 0.3, 0.42], ['WALKWAY', 0.82, 0.66]] },
    ];
    let t0 = 0.3; SHEETS.forEach(s => { s.t0 = t0; s.tx = s.t0 + s.x.d; s.tf = s.tx + XD; s.tc = s.tf + s.full; t0 = s.tc + CD; });
    const WRAP = t0, OUT = WRAP + 3.6, DUR = 30, BX = 60, BW = 960, WR = [0, 2, 3];
    return {
      dur: DUR, shakes: [],
      render(t) {
        K3.bgGrid(t);
        caps('THE ENTERTAINER  ·  FULL-SCALE SHEETS', 72, 300, 21, clamp(t / 0.4), clamp((t - OUT) / 0.3), { w: 700, fam: 'Mono', ls: 4, align: 'left', col: OR, ls0: 0 });
        if (t < WRAP) {
          let i = 0; SHEETS.forEach((s, k) => { if (t >= s.t0) i = k; }); const s = SHEETS[i], x = s.x, B = bandAt(x.lc, CY, BX, BW), lt = t - s.t0;
          if (t < s.t0) return;
          if (t < s.tx) { play(x.lc, x.li, lt, B); K3.crop(B, clamp(lt / 0.4));
            K3.dim(B[0], B[0] + B[2], B[1] - 40, clamp((lt - 0.3) / 0.6), '16 : 9  ·  AS SEEN ON A TV');
            K3.outlineFill('SHEET ' + s.n, 66, 470, 92, clamp((lt - 0.1) / 0.5), clamp((lt - 0.6) / 0.4), { col: WHT });
            caps(s.name, 72, 540, 24, clamp((lt - 0.5) / 0.4), 0, { w: 700, fam: 'Mono', ls: 5, align: 'left', col: OR, ls0: 0 }); }
          else if (t < s.tf) { const r = expand(x, (t - s.tx) / XD, lt, t - s.tx, B); K3.crop(r.M, 1, { col: OR }); }
          else if (t < s.tc) {
            full(x, t - s.tx); const lf = t - s.tf;
            scrim(0, 560, 0.6, 0); K3.crop([40, 380, W - 80, H - 760], clamp(lf / 0.3), { col: OR });
            K3.dim(40, W - 40, 350, clamp((lf - 0.1) / 0.5), '9 : 16  ·  FULL SCALE');
            s.labs.forEach(([lab, px, py], k) => { const pt = [px * W, py * H, 1], right = px < 0.5; K3.leader(pt, right ? px * W + 140 : px * W - 140, py * H - 120 - k * 20, lab, '0' + (k + 1), clamp((lf - 0.3 - k * 0.35) / 0.9), { right, a: 1 - clamp((t - (s.tc - 0.25)) / 0.25) }); });
          } else { const u = (t - s.tc) / CD, Bn = SHEETS[i + 1] ? bandAt(SHEETS[i + 1].x.lc, CY, BX, BW) : [BX, CY, BW, 0], M = lerpR(FULLR, Bn, E.inOutC(u));
            full(x, t - s.tx, { clip: () => ctx.rect(M[0], M[1], M[2], M[3]) }); K3.crop(M, 1, { col: OR }); }
        } else if (t < OUT + 0.4) {   // the three verticals side by side, full scale, as a sheet
          const w = 316, h = w * 16 / 9, gap = 22, x0 = (W - 3 * w - 2 * gap) / 2, y0 = 470, q = clamp((t - OUT) / 0.4), lt = t - WRAP;
          WR.map(j => SHEETS[j]).forEach((s, k) => { const p = E.outC(clamp((lt - k * 0.15) / 0.5)), r = [x0 + k * (w + gap), y0 + (1 - p) * 80, w, h];
            if (p > 0) { ctx.save(); ctx.globalAlpha = p * (1 - q); vclip(s.x, Math.min(2.8, 0.4 + lt), r); ctx.restore(); K3.crop(r, p * (1 - q), { col: 'rgba(255,255,255,0.7)' });
              caps(s.n + '  ' + s.name, r[0] + w / 2, r[1] + h + 40, 17, p * (1 - q), 0, { w: 700, fam: 'Mono', ls: 2, col: WHT }); } });
          K3.outlineFill('THE WHOLE PICTURE.', W / 2, 420, 64, clamp(lt / 0.6), clamp((lt - 0.5) / 0.4), { col: WHT, align: 'center' });
        }
        if (t >= OUT + 0.15) K3.outro('blueprint', t - OUT - 0.15, 'DESIGNED AND BUILT TO FULL SCALE');
      },
      cues() {
        const ev = [];
        SHEETS.forEach(s => { ev.push(['tick', s.t0 + 0.1, 0.2, 0]); ev.push(['pencil', s.t0 + 0.3, 0.2, 0, {}]); ev.push(['swell', s.tx - 0.4, 0.22, 0]); ev.push(['whoosh', s.tx + 0.25, 0.3, 0]);
          ev.push(['ticks', s.tf + 0.1, 0.12, 0, { dur: 0.6, n: 10 }]); s.labs.forEach((l, k) => ev.push(['tick', s.tf + 0.6 + k * 0.35, 0.2, 0.3])); ev.push(['whoosh', s.tc + 0.2, 0.22, 0]); });
        ev.push(['whoosh', WRAP + 0.1, 0.25, 0]); ev.push(['chime', OUT + 1.2, 0.22, 0]); ev.push(['ticks', OUT + 1.6, 0.14, 0, { dur: 0.8, n: 14 }]);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'sketch', bpm: 100, key: 3, end: OUT }]], events: ev };
      },
    };
  }

  // ======================= #66 The Vertical Wall (seamless loop) =======================
  function tallwall() {
    const WB = 96, wbt = 60 / WB, wbar = 4 * wbt, WL = 15, OFF = 0.3, TW = 344, TH = Math.round(TW * 16 / 9), GP = 12, X = [GP, GP * 2 + TW, GP * 3 + TW * 2];
    // per column: tiles, each a 3-shot playlist (one shot per bar, 6 bars per loop)
    const COLS = [
      [[['v01', 0.2], ['v01', 7.2], ['v01', 14.2]], [['v03', 18.2], ['v03', 3.2], ['v03', 24.2]], [['c03', 0.3], ['c03', 10.2], ['c03', 20.2]], [['v05', 16.2], ['v05', 24.0], ['v05', 4.2]]],
      [[['v04', 18.2], ['v04', 1.0], ['v04', 25.0]], [['v02', 8.2], ['v02', 0.3], ['v02', 11.2]], [['c04', 3.1], ['c04', 18.1], ['c04', 6.1]], [['v01', 10.6], ['v01', 3.6], ['v01', 17.2]]],
      [[['v03', 12.2], ['v03', 21.2], ['v03', 9.2]], [['v05', 12.2], ['v05', 20.2], ['v05', 28.0]], [['v04', 6.2], ['v04', 13.0], ['v04', 9.6]], [['v02', 4.2], ['v02', 12.0], ['v02', 0.3]]],
    ];
    const RH = COLS[0].length * (TH + GP);
    function tile(r, list, j, t) {
      const u = t - OFF - j * wbt, k = lmod(Math.floor(u / wbar), list.length), lt = lmod(u, wbar), sh = list[k];
      if (!VID.collecting) { const c = K4.GI(); c.fillStyle = BLK; c.fillRect(r[0], r[1], r[2], r[3]); D(); }
      K3.clip(sh[0], sh[1], lt, r);
      if (!VID.collecting && lt < 0.18) { const c = K4.GI(); c.fillStyle = `rgba(255,255,255,${0.45 * (1 - lt / 0.18)})`; c.fillRect(r[0], r[1], r[2], r[3]); D(); }
    }
    return {
      dur: WL,
      render(t) {
        fillScreen(BLK);
        COLS.forEach((col, ci) => { const dir = ci === 1 ? 1 : -1, off = lmod(t / WL * RH, RH);
          col.forEach((list, k) => { for (const rep of [-1, 0, 1]) { const y = k * (TH + GP) + rep * RH + dir * off - 120; if (y + TH > 0 && y < H) tile([X[ci], Math.round(y), TW, TH], list, (k + ci) % 4, t); } }); });
        if (!VID.collecting) { const r = [70, 742, 940, 436], c = K4.GI(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 50; c.fillStyle = 'rgba(11,11,11,0.94)'; rrect(r[0], r[1], r[2], r[3], 18); c.fill(); c.shadowBlur = 0;
          const pb = Math.pow(1 - lmod(t - OFF, wbar) / wbar, 3); c.strokeStyle = ORA(0.35 + 0.5 * pb); c.lineWidth = 3; rrect(r[0], r[1], r[2], r[3], 18); c.stroke(); D(); }
        caps('SHOT VERTICAL  ·  BUILT BY ' + BRAND.short.toUpperCase(), W / 2, 816, 21, 1, 0, { w: 700, fam: 'Mono', ls: 5, maxW: 900 });
        drawLogo('w', W / 2, 908, 560);
        caps(tagCaps(), W / 2, 1016, 26, 1, 0, { w: 800, ls: 4, maxW: 900 });
        pill(CONTACT.cta, W / 2, 1090, { size: Math.min(24, fitSize(CONTACT.cta, 800, 820, 24, 'Mont', 2.5)) });
        caps(CONTACT.phone + '   ·   ' + CONTACT.web, W / 2, 1150, 21, 1, 0, { w: 800, ls: 2 });
      },
      cues() {
        const ev = []; for (let b = 0; b < Math.round(WL / wbt); b++) ev.push(['tick', b * wbt, 0.06, b % 2 ? 0.4 : -0.4]);
        return { dur: WL, loop: true, rot: -OFF, beds: [['music', 0, WL, 1.0, { style: 'lounge', bpm: WB, key: -1 }]], events: ev };
      },
    };
  }

  const P = V === 'stories' ? stories() : V === 'gatefold' ? gatefold() : V === 'uncropped' ? uncropped() : V === 'scale' ? scale() : V === 'tallwall' ? tallwall() : frame();
  const fin = V === 'gatefold' ? { vig: 0.06, grain: 0.12 } : V === 'tallwall' ? { vig: 0.3, grain: 0.15 } : { vig: 0.22, grain: 0.18 };
  DIR = { dur: P.dur, bg: V === 'gatefold' ? PAPER : BLK, finish: fin, edl: [], shakes: P.shakes, preload: () => K3.init({ grunge: V === 'uncropped' }), render: P.render, cues: P.cues };
});
