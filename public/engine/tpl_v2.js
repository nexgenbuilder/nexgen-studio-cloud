'use strict';
/* Round 2 (Oct 24, 2026): 9:16 originals on the new vertical approach. Horizontal clips are only ever shown whole
   (a rect with the clip's own aspect: 16:9, or 3:2 for c08/c10); vertical clips (c03/c04) run full-bleed or in tall
   tiles. Footage plays at real speed with no zoom. Shots name master clips directly (no orientation resolver).
   ?v=thisor   #29 This or That: 4 rounds, A over B, comment your 4 picks
   ?v=upgrade  #30 Which upgrade would you add first? 4 options in the band, then a numbered 2x2 grid
   ?v=dream    #31 "My dream backyard has ___": slot word + matching clip, payoff "ALL OF IT." on the 16:9 wall
   ?v=bento    #32 Bento wall (seamless 20 s loop): landscape hero, brand band, tall vertical tile + 2 landscape tiles
   ?v=scroll   #33 Masonry wall (seamless 20 s loop): two columns of whole clips (16:9, 3:2, 9:16) scrolling opposite ways
   ?v=spot_<p> #35+ Built by DPG, framed spotlight per project (villa, oven, pav, court, town, ent)
   ?v=mpr      #34 Modern Pool Retreat: the landscape band expands into full-bleed vertical shots and collapses back */
STUDIO_REG['v2'] = (() => {
  const V = QS.get('v') || 'thisor';
  const lmod = (x, m) => ((x % m) + m) % m;
  const segOf = (c, t) => { const s = VID.meta(c).segs, f = Math.round(t * 30); let best = s[0], bd = 1e9;
    for (const g of s) { const d = f < g[0] ? g[0] - f : f > g[1] ? f - g[1] : 0; if (d < bd) { bd = d; best = g; } } return best; };
  const at = (c, inn, lt) => { const g = segOf(c, inn + 0.04); return clamp(inn + lt, g[0] / 30, g[1] / 30); };
  const ARX = { c03: 1080 / 1920, c04: 1080 / 1920, c08: 1762 / 1174, c10: 1762 / 1174 };   // known before VID.init (layouts are built at load)
  const AR = c => { if (ARX[c]) return ARX[c]; const m = VID.meta(c); return m ? m.w / m.h : 16 / 9; };
  const PJ = { c02: 'HILLSIDE VILLA', c03: 'MODERN POOL RETREAT', c04: 'MODERN POOL RETREAT', c05: 'MODERN POOL RETREAT', c07: 'THE ENTERTAINER',
    c08: 'COURTYARD ESTATE', c09: 'STONE OVEN TERRACE', c10: 'TOWNHOME TERRACE', c11: 'HILLSIDE VILLA', c12: 'DUSK PAVILION', w24: 'THE PORTFOLIO' };
  // the largest rect with clip c's aspect, centred in r (whole picture, never cropped)
  function wholeIn(c, r) { const a = AR(c); let w = r[2], h = w / a; if (h > r[3]) { h = r[3]; w = h * a; } return [r[0] + (r[2] - w) / 2, r[1] + (r[3] - h) / 2, w, h]; }
  function clip(c, inn, lt, rect, o) {
    const q = rect[2] <= 680 && rect[3] <= 1000 ? 'h' : 'f';
    return footageSrc(c, at(c, inn, lt), Object.assign({ rect, fit: 'cover', q }, o || {}));
  }
  function fillR(r, col) { if (VID.collecting) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = col; ctx.fillRect(r[0], r[1], r[2], r[3]); ctx.restore(); }
  function cutFX(r, lt) {     // the wall's cut accent: quick white flash + orange border that fades
    if (VID.collecting) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const fl = Math.pow(clamp(1 - lt / 0.14), 2) * 0.3; if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(r[0], r[1], r[2], r[3]); }
    const br = Math.pow(clamp(1 - lt / 0.5), 2); if (br > 0) { ctx.strokeStyle = ORA(br); ctx.lineWidth = 6; ctx.strokeRect(r[0] + 3, r[1] + 3, r[2] - 6, r[3] - 6); }
    ctx.restore();
  }
  function tag(str, r, fs, pos) {   // project label pill on a tile: 'bl' bottom-left (default) or 'tl'
    if (VID.collecting) return;
    fs = Math.min(fs, fitSize(str, 700, r[2] - fs * 3.2 - 20, fs, 'Mono', 2.5));
    const f = F(700, fs, 'Mono'), ls = 2.5, tw = textW(str, f, ls), m = Math.round(fs * 0.6), h = Math.round(fs * 2.1), w = tw + fs * 1.9 + 10;
    const y = pos === 'tl' ? r[1] + m : r[1] + r[3] - m - h;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(11,11,11,0.78)'; rrect(r[0] + m, y, w, h, 5); ctx.fill();
    const sq = Math.round(fs * 0.42); ctx.fillStyle = OR; ctx.fillRect(r[0] + m + fs * 0.75, y + h / 2 - sq / 2, sq, sq);
    setF(f, ls); ctx.fillStyle = WHT; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(str, r[0] + m + fs * 0.75 + sq + 10, y + h / 2 + 1);
    ctx.restore();
  }
  function badge(txt, x, y, rad, s, o) {   // orange disc with a black number/letter
    if (VID.collecting || s <= 0) return; o = o || {};
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s, s);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 12; ctx.fillStyle = o.bg || OR;
    if (o.square) { rrect(-rad, -rad, 2 * rad, 2 * rad, rad * 0.22); ctx.fill(); } else { ctx.beginPath(); ctx.arc(0, 0, rad, 0, 7); ctx.fill(); }
    ctx.shadowBlur = 0; setF(F(900, rad * 1.15, 'Mont'), 0); ctx.fillStyle = o.col || BLK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, rad * 0.08);
    ctx.restore();
  }
  function pillShine(str, cx, cy, size, t, bar) {
    pill(str, cx, cy, { size, p: 1, bg: OR, col: BLK, ls: 2.5 });
    if (VID.collecting) return;
    const f = F(800, size, 'Mont'), pw = textW(str, f, 2.5) + 70, ph = size * 2.2, u = lmod(t, 2 * bar) / (2 * bar);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); rrect(cx - pw / 2, cy - ph / 2, pw, ph, ph / 2); ctx.clip();
    const sx = lerp(cx - pw / 2 - 160, cx + pw / 2 + 160, E.inOutS(clamp(u / 0.36)));
    const g = ctx.createLinearGradient(sx - 90, 0, sx + 90, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.42)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - pw / 2, cy - ph / 2, pw, ph); ctx.restore();
  }
  function chevrons(cx, y, t, bar) {
    if (VID.collecting) return;
    const b = Math.sin(lmod(t, bar) / bar * Math.PI * 2) * 5;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.strokeStyle = OR; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 0; i < 2; i++) { const yy = y + b + i * 13; ctx.globalAlpha = i ? 0.55 : 1; ctx.beginPath(); ctx.moveTo(cx - 13, yy - 6); ctx.lineTo(cx, yy + 6); ctx.lineTo(cx + 13, yy - 6); ctx.stroke(); }
    ctx.restore();
  }
  function glowBG(cy, a) {
    if (VID.collecting) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createRadialGradient(W / 2, cy, 150, W / 2, cy, 1100); g.addColorStop(0, ORA(a === undefined ? 0.085 : a)); g.addColorStop(1, ORA(0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  function ctaLine(t, y, bar) {    // CTA block under a band: pill, phone + site, license
    pillShine(CONTACT.cta, W / 2, y, Math.min(28, fitSize(CONTACT.cta, 800, 900, 28, 'Mont', 2.5)), t, bar);
    caps(CONTACT.phone + '   ·   ' + CONTACT.web, W / 2, y + 96, 28, 1, 0, { w: 800, ls: 2, maxW: 980 });
    caps(footLine('  ·  '), W / 2, y + 144, 18, 1, 0, { w: 500, fam: 'Mono', ls: 2, col: 'rgba(255,255,255,0.55)', maxW: 980 });
  }
  // end card for these 9:16s, all inside the safe zone: optional headline + line, logo, CTA, phone, site, license
  function endCustom(lt, o) {
    o = o || {}; let y = 400;
    if (o.head) { headline(o.head, W / 2, y, lt, 0.05, undefined, { hl: o.hl === undefined ? null : { line: o.hl }, max: 104, maxW: 920 }); y += 104 * (o.head.length - 1) + 80; }
    if (o.sub) { caps(o.sub, W / 2, y, 24, ramp(lt, 0.3, 0.4), 0, { w: 700, fam: 'Mono', ls: 3, col: 'rgba(255,255,255,0.8)', maxW: 960 }); }
    drawLogo('w', W / 2, 700, 660, E.outQ(ramp(lt, 0.15, 0.55)));
    pill(CONTACT.cta, W / 2, 872, { p: ramp(lt, 0.5, 0.4), size: Math.min(30, fitSize(CONTACT.cta, 800, 900, 30, 'Mont', 2.5)) });
    caps(CONTACT.phone, W / 2, 1000, 70, ramp(lt, 0.65, 0.45), 0, { w: 800, ls: 1, maxW: 960 });
    caps(CONTACT.web, W / 2, 1064, 32, ramp(lt, 0.75, 0.45), 0, { w: 700, ls: 5, col: OR, maxW: 960 });
    caps(footLine('  ·  '), W / 2, 1150, 21, ramp(lt, 0.9, 0.5), 0, { w: 500, fam: 'Mono', ls: 2, col: 'rgba(255,255,255,0.6)', maxW: 980 });
  }
  // a shot list played inside a band rect, with push / flash transitions into a shot
  function lay(S, t0) { let s = t0 || 0; for (const sh of S) { sh.start = s; s += sh.d; } return s; }
  function bandPlay(S, t, R, o) {
    o = o || {};
    let i = 0; for (let k = 0; k < S.length; k++) if (t >= S[k].start - 1e-6) i = k;
    const sh = S[i], lt = t - sh.start, TD = 0.32;
    fillR(R, BLK);
    const win = () => ctx.rect(R[0], R[1], R[2], R[3]);
    if (sh.tr === 'push' && i > 0 && lt < TD) {
      const pv = S[i - 1], u = E.inOutC(lt / TD), dir = sh.dir || 1;
      clip(pv.c, pv.in, t - pv.start, wholeIn(pv.c, R), { clip: win, dx: -dir * u * R[2] });
      clip(sh.c, sh.in, lt, wholeIn(sh.c, R), { clip: win, dx: dir * (1 - u) * R[2] });
    } else clip(sh.c, sh.in, lt, wholeIn(sh.c, R), { clip: win });
    if (sh.tr === 'flash' && i > 0 && lt < 0.25 && !VID.collecting) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(255,255,255,${0.7 * Math.pow(1 - lt / 0.25, 2)})`; ctx.fillRect(R[0], R[1], R[2], R[3]); ctx.restore(); }
    return { i, lt, sh };
  }
  const S_ = (c, inn, d, extra) => Object.assign({ c, in: inn, d }, extra || {});

  // ======================= #29 This or That =======================
  function thisor() {
    const BPM = 116, bt = 60 / BPM, bar = 4 * bt, RD = 3.6, END = 14.4, DUR = 18;
    const AY = 418, BY = 1094, BH = 608, HALF = 1.8;
    const R0 = [
      ['POOL DAY', [['c02', 9.0], ['c11', 3.05]], 'POOL AT DUSK', [['c12', 3.5], ['c12', 5.6]]],
      ['OUTDOOR KITCHEN', [['c12', 8.6], ['c12', 10.15]], 'PIZZA OVEN', [['c09', 3.6], ['c09', 7.05]]],
      ['BOCCE NIGHTS', [['c07', 12.05], ['c07', 21.0]], 'FIRESIDE LOUNGE', [['c09', 10.55], ['c09', 12.1]]],
      ['MODERN', [['c05', 4.1], ['c05', 24.1]], 'MEDITERRANEAN', [['c11', 0.05], ['c02', 6.0]]],
    ];
    const KICK = TX('kick', 'BACKYARD EDITION', { label: 'Kicker', group: 'Opening', upper: true, max: 22, hint: '“· ROUND 1 OF 4” is added after it' });
    const HEAD = TX('head', 'THIS OR THAT?', { label: 'Headline', group: 'Opening', upper: true, max: 16 });
    const R = R0.map((r, k) => { const g = 'Round ' + (k + 1), n = k + 1;
      return [TX(`r${n}a`, r[0], { label: 'Option A', group: g, upper: true, max: 20 }),
        [SHOT(`r${n}a1`, r[1][0], { label: 'A · first shot', group: g, kind: 'land', d: HALF }), SHOT(`r${n}a2`, r[1][1], { label: 'A · second shot', group: g, kind: 'land', d: HALF + 0.34 })],
        TX(`r${n}b`, r[2], { label: 'Option B', group: g, upper: true, max: 20 }),
        [SHOT(`r${n}b1`, r[3][0], { label: 'B · first shot', group: g, kind: 'land', d: HALF }), SHOT(`r${n}b2`, r[3][1], { label: 'B · second shot', group: g, kind: 'land', d: HALF + 0.34 })]]; });
    const ASK = TX('ask', 'COMMENT YOUR 4 PICKS  ·  LIKE A-B-B-A', { label: 'Comment prompt', group: 'Ending', upper: true, max: 38 });
    const EHEAD = TX('endHead', 'YOUR PICKS?', { label: 'End card headline', group: 'Ending', upper: true, max: 16 });
    const ESUB = TX('endSub', 'COMMENT THEM LIKE A · B · B · A', { label: 'End card line', group: 'Ending', upper: true, max: 34 });
    function side(k, which, lt) { const sh = R[k][which === 'A' ? 1 : 3], s = lt < HALF ? 0 : 1; return { c: sh[s][0], in: sh[s][1], lt: lt - s * HALF }; }
    function bandDraw(t, y, which) {
      const r = [0, y, W, BH], k = Math.min(NR - 1, Math.floor(t / RD)), lt = t - k * RD, TD = 0.34, dir = which === 'A' ? 1 : -1;
      fillR(r, BLK);
      const win = () => ctx.rect(0, y, W, BH);
      if (k > 0 && lt < TD) {
        const u = E.inOutC(lt / TD), p = side(k - 1, which, lt + RD), n = side(k, which, lt);
        clip(p.c, p.in, p.lt, r, { clip: win, dx: -dir * u * W }); clip(n.c, n.in, n.lt, r, { clip: win, dx: dir * (1 - u) * W });
      } else { const n = side(k, which, lt); clip(n.c, n.in, n.lt, r, { clip: win }); if (lt > HALF && lt < HALF + 0.2) cutFX(r, lt - HALF); }
      if (VID.collecting) return;
      const lab = R[k][which === 'A' ? 0 : 2], p = clamp((lt - 0.12) / 0.3), db = Math.pow(1 - lmod(t, bar) / bar, 4);
      badge(which, 66, y + 66, 38, (k === 0 && t < 0.12 ? 1 : E.outBack(clamp((lt - 0.05) / 0.3))) * (1 + 0.07 * db), { square: true });
      const fs = Math.min(34, fitSize(lab, 800, 820, 34, 'Mont', 1.5)), f = F(800, fs, 'Mont'), tw = textW(lab, f, 1.5), x0 = 120;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k === 0 && t < 0.12 ? 1 : p;
      ctx.beginPath(); ctx.rect(x0, y + 28, (tw + 44) * (k === 0 && t < 0.12 ? 1 : E.outQ(p)), 76); ctx.clip();
      ctx.fillStyle = 'rgba(11,11,11,0.82)'; rrect(x0, y + 36, tw + 44, 60, 8); ctx.fill();
      setF(f, 1.5); ctx.fillStyle = WHT; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(lab, x0 + 22, y + 67);
      ctx.restore();
    }
    const NR = R.length;
    return {
      dur: DUR,
      render(t) {
        glowBG(1060, 0.07);
        const ea = 1 - ramp(t, END, 0.4);
        if (t < END + 0.4) {
          ctx.save(); ctx.globalAlpha = ea;
          const k = Math.min(NR - 1, Math.floor(t / RD));
          kicker(`${KICK}  ·  ROUND ${k + 1} OF ${NR}`, W / 2, 292, 1, { align: 'center', size: 22, ls: 4, maxW: 960 });
          headline([HEAD], W / 2, 382, 9, 0, undefined, { max: 92, maxW: 900 });
          bandDraw(t, AY, 'A'); bandDraw(t, BY, 'B');
          if (!VID.collecting) {   // divider with the OR disc
            ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(60, 1058, 380, 3); ctx.fillRect(W - 440, 1058, 380, 3); ctx.restore();
            badge('OR', W / 2, 1060, 42, 1 + 0.08 * Math.pow(1 - lmod(t, bar) / bar, 4));
          }
          caps(ASK, W / 2, 1780, 26, 1, 0, { w: 700, fam: 'Mono', ls: 3, maxW: 960 });
          ctx.restore();
        }
        if (t >= END) endCustom(t - END - 0.2, { head: [EHEAD], hl: 0, sub: ESUB });
      },
      cues() {
        const ev = [];
        for (let k = 1; k < NR; k++) { ev.push(['whoosh', k * RD, 0.32, -0.3]); ev.push(['whoosh', k * RD + 0.05, 0.26, 0.3]); }
        for (let k = 0; k < NR; k++) { ev.push(['pop', k * RD + 0.12, 0.4, -0.2]); ev.push(['pop', k * RD + 0.2, 0.4, 0.2]); ev.push(['tick', k * RD + HALF, 0.2, 0]); }
        ev.push(['whoosh', END, 0.3, 0]); ev.push(['impact', END + 0.3, 0.45, 0]); ev.push(['chime', END + 0.9, 0.3, 0]);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'pulse', bpm: BPM, key: 0 }]], events: ev };
      },
    };
  }

  // ======================= #30 Which upgrade would you add first? =======================
  function upgrade() {
    const BPM = 100, bt = 60 / BPM, bar = 4 * bt, DUR = 18, T1 = 0.25, OD = 2.6, G0 = T1 + 4 * OD, GT = 0.7;   // grid from G0
    const OPT0 = [['OUTDOOR KITCHEN', ['c12', 8.6], ['c12', 9.6]], ['PAVILION', ['c07', 24.0], ['c07', 27.0]],
      ['POOL DECK', ['c11', 12.05], ['c02', 0.05]], ['PAVER WALKWAY', ['c05', 19.1], ['c05', 21.6]]];
    const KICK = TX('kick', 'PICK ONE  ·  COMMENT 1-4', { label: 'Kicker', group: 'Opening', upper: true, max: 30 });
    const H1 = TX('head1', 'WHICH UPGRADE', { label: 'Headline, line 1', group: 'Opening', upper: true, max: 20 });
    const H2 = TX('head2', 'WOULD YOU ADD FIRST?', { label: 'Headline, line 2 (highlighted)', group: 'Opening', upper: true, max: 22 });
    const OPT = OPT0.map((o, k) => { const g = 'Option ' + (k + 1), n = k + 1;
      return [TX(`o${n}`, o[0], { label: 'Name', group: g, upper: true, max: 20 }),
        SHOT(`o${n}s1`, o[1], { label: 'Shot in the band', group: g, kind: 'land', d: k === 3 ? 3.2 : 2.9 }), SHOT(`o${n}s2`, o[2], { label: 'Second shot (grid)', group: g, kind: 'land', d: 2.4 })]; });
    const ASK = TX('ask', 'COMMENT 1, 2, 3 OR 4', { label: 'Comment prompt', group: 'Ending', upper: true, max: 22 });
    const BAND = [0, 560, W, 608];
    const cell = n => [n % 2 ? 544 : 0, n < 2 ? 560 : 870, 536, 302];
    return {
      dur: DUR,
      render(t) {
        glowBG(866);
        kicker(KICK, W / 2, 296, 1, { align: 'center', size: 22, ls: 4, maxW: 960 });
        headline([H1, H2], W / 2, 394, 9, 0, undefined, { hl: { line: 1 }, max: 80, maxW: 920, lh: 1.05 });
        if (t < G0) {   // one option at a time in the band
          const k = Math.min(3, Math.max(0, Math.floor((t - T1) / OD))), lt = t - T1 - k * OD, o = OPT[k], TD = 0.3;
          fillR(BAND, BLK);
          const win = () => ctx.rect(BAND[0], BAND[1], BAND[2], BAND[3]);
          if (k > 0 && lt < TD) { const u = E.inOutC(lt / TD), p = OPT[k - 1][1];
            clip(p[0], p[1], lt + OD, BAND, { clip: win, dx: -u * W }); clip(o[1][0], o[1][1], lt, BAND, { clip: win, dx: (1 - u) * W }); }
          else clip(o[1][0], o[1][1], Math.max(0, lt), BAND, { clip: win });
          if (!VID.collecting) {
            const p = k === 0 && t < T1 + 0.1 ? 1 : E.outBack(clamp((lt - 0.08) / 0.35));
            badge(String(k + 1), 92, 652, 56, p);
            T(o[0], 40, 1128, F(900, Math.min(58, fitSize(o[0], 900, 1000, 58, 'Mont')), 'Mont'), { p: clamp((lt - 0.15) / 0.4), shadow: ['rgba(0,0,0,0.75)', 30, 3] });
            OPT.forEach((x, j) => {   // the menu under the band
              const y = 1250 + j * 60, on = j === k;
              ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = on ? 1 : 0.38;
              badge(String(j + 1), 330, y - 12, 19, 1, on ? {} : { bg: 'rgba(255,255,255,0.85)' });
              setF(F(800, Math.min(32, fitSize(x[0], 800, 660, 32, 'Mont', 1.5)), 'Mont'), 1.5); ctx.fillStyle = on ? OR : WHT; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(x[0], 368, y);
              ctx.restore();
            });
          }
        } else {          // the band splits into a numbered 2x2 grid
          const g = t - G0;
          OPT.forEach((o, n) => {
            const c = cell(n), stag = n * 0.08, u = E.outQ(clamp((g - stag) / GT));
            const r = n === 3 ? [lerp(BAND[0], c[0], u), lerp(BAND[1], c[1], u), lerp(BAND[2], c[2], u), lerp(BAND[3], c[3], u)]
              : [c[0] + c[2] * (1 - u) / 2, c[1] + c[3] * (1 - u) / 2, c[2] * u, c[3] * u];
            if (r[2] < 4) return;
            const slot = Math.floor(lmod(g + n * bt, 2 * 2.4) / 2.4), lt = lmod(g + n * bt, 2.4), sh = o[1 + slot];
            const cont = n === 3 && g < 0.6, src = cont ? o[1] : sh;
            fillR(r, BLK); clip(src[0], src[1], cont ? g + OD : lt, r);
            if (u >= 1) { if (g > GT + 0.3) cutFX(r, lt); badge(String(n + 1), r[0] + 44, r[1] + 44, 28, 1 + 0.08 * Math.pow(1 - lmod(t, bar) / bar, 4)); tag(o[0], r, 17); }
          });
          const p = ramp(g, 0.5, 0.4);
          const asz = Math.min(42, fitSize(ASK, 900, 900, 42, 'Mont', 2));
          caps(ASK, W / 2 - 24, 1262, asz, p, 0, { w: 900, ls: 2 });
          if (p > 0.5) chevrons(W / 2 + textW(ASK, F(900, asz, 'Mont'), 2) / 2 + 6, 1246, t, bar);
          if (g > 0.8) ctaLine(t, 1372, bar);
        }
      },
      cues() {
        const ev = [];
        for (let k = 0; k < 4; k++) { if (k) ev.push(['whoosh', T1 + k * OD, 0.3, 0]); ev.push(['pop', T1 + k * OD + 0.1, 0.42, -0.1]); ev.push(['tick', T1 + k * OD + 0.05, 0.25, 0.3]); }
        ev.push(['swell', G0 - 0.6, 0.3, 0]); ev.push(['impact', G0 + 0.05, 0.42, 0]);
        for (let n = 0; n < 4; n++) ev.push(['pop', G0 + n * 0.08 + 0.6, 0.3, (n % 2 ? 0.4 : -0.4)]);
        ev.push(['chime', G0 + 1.0, 0.25, 0]);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'lounge', bpm: BPM, key: 2 }]], events: ev };
      },
    };
  }

  // ======================= #31 My dream backyard has ___ =======================
  function dream() {
    const BPM = 100, bt = 60 / BPM, bar = 4 * bt, WD = 2.2, DUR = 18;
    const WORDS = [['A POOL DECK', 'c11', 12.05], ['STRING LIGHTS', 'c07', 12.05], ['A FIRE TABLE', 'c09', 10.55], ['AN OUTDOOR KITCHEN', 'c12', 8.55],
      ['A PIZZA OVEN', 'c09', 3.6], ['A PERGOLA', 'c05', 4.1], ['ALL OF IT.', 'w24', 0.0]];
    const ALL = 6 * WD, BAND = [0, 560, W, 608];
    const sz = Math.min(76, ...WORDS.map(w => fitSize(w[0], 900, 880, 200, 'Mont', -1)));
    const word = t => { const k = Math.min(6, Math.floor(t / WD)); return { k, lt: t - k * WD }; };
    return {
      dur: DUR,
      render(t) {
        glowBG(866);
        kicker('FINISH THE SENTENCE', W / 2, 292, 1, { align: 'center', size: 22, ls: 5 });
        T('MY DREAM BACKYARD HAS', W / 2, 392, F(900, 66, 'Mont'), { align: 'center', ls: -1 });
        const { k, lt } = word(t), cur = WORDS[k], prev = WORDS[Math.max(0, k - 1)];
        // band: push on every new word; the payoff plays the 16:9 portfolio wall from its first frame
        fillR(BAND, BLK);
        const win = () => ctx.rect(BAND[0], BAND[1], BAND[2], BAND[3]), TD = 0.3, ltc = k === 6 ? lt : lt;
        if (k > 0 && lt < TD) { const u = E.inOutC(lt / TD);
          clip(prev[1], prev[2], lt + WD, BAND, { clip: win, dy: -u * BAND[3] }); clip(cur[1], cur[2], ltc, BAND, { clip: win, dy: (1 - u) * BAND[3] }); }
        else clip(cur[1], cur[2], ltc, BAND, { clip: win });
        if (k === 6 && lt < 0.3) cutFX(BAND, lt);
        if (!VID.collecting) {   // slot word in an orange block that resizes as the words roll
          const f = F(900, sz, 'Mont'), wc = textW(cur[0], f, -1), wp = textW(prev[0], f, -1), u = k > 0 ? E.inOutC(clamp(lt / 0.32)) : 1;
          const bw = lerp(wp, wc, u) + 48, bh = sz * 1.12, cy = 476;
          const big = k === 6 ? 1 + 0.06 * Math.pow(1 - clamp(lt / 0.5), 2) : 1;
          ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(W / 2, cy); ctx.scale(big, big);
          ctx.fillStyle = OR; rrect(-bw / 2, -bh / 2, bw, bh, 8); ctx.fill(); ctx.beginPath(); ctx.rect(-bw / 2, -bh / 2, bw, bh); ctx.clip();
          setF(f, -1); ctx.fillStyle = BLK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          if (k > 0 && u < 1) { ctx.fillText(prev[0], 0, sz * 0.04 - u * bh); ctx.fillText(cur[0], 0, sz * 0.04 + (1 - u) * bh); } else ctx.fillText(cur[0], 0, sz * 0.04);
          ctx.restore();
          if (k < 6) tag(PJ[cur[1]], BAND, 18);
          // progress pips
          for (let j = 0; j < 7; j++) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = j <= k ? OR : 'rgba(255,255,255,0.22)'; ctx.fillRect(W / 2 - 7 * 26 / 2 + j * 26, 1192, 18, 5); ctx.restore(); }
        }
        const p = k === 6 ? 1 : 1;
        caps('COMMENT YOURS', W / 2 - 22, 1268, 40, p, 0, { w: 900, ls: 2 });
        chevrons(W / 2 + textW('COMMENT YOURS', F(900, 40, 'Mont'), 2) / 2 + 6, 1252, t, bar);
        ctaLine(t, 1372, bar);
      },
      cues() {
        const ev = [];
        for (let k = 1; k < 7; k++) { ev.push(['whoosh', k * WD, 0.24, 0]); ev.push(['ticks', k * WD - 0.02, 0.22, 0, { dur: 0.32, n: 6 }]); }
        ev.push(['impact', ALL + 0.02, 0.45, 0]); ev.push(['shimmer', ALL + 0.1, 0.3, 0]);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'lounge', bpm: BPM, key: 0 }]], events: ev };
      },
    };
  }

  // ======================= walls (seamless 20 s loops at 96 BPM; cuts at 0.3 s + beat grid) =======================
  const WB = 96, wbt = 60 / WB, wbar = 4 * wbt, WL = 20, WOFF = 0.3;
  function wallBrand(t, y0, h, o) {
    o = o || {};
    if (!VID.collecting) {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = BLK; ctx.fillRect(0, y0, W, h);
      const gl = ctx.createRadialGradient(W / 2, y0 + h * 0.42, 40, W / 2, y0 + h * 0.42, 620); gl.addColorStop(0, ORA(0.10)); gl.addColorStop(1, ORA(0));
      ctx.fillStyle = gl; ctx.fillRect(0, y0, W, h);
      const pb = Math.pow(1 - lmod(t - WOFF, wbar) / wbar, 3); ctx.strokeStyle = ORA(0.3 + 0.55 * pb); ctx.lineWidth = 4; ctx.strokeRect(2, y0 + 2, W - 4, h - 4);
      ctx.restore();
    }
    const cy = y0 + h / 2;
    kicker(o.kick || 'THE PORTFOLIO', W / 2, cy - 196, 1, { align: 'center', size: 22, ls: 6 });
    drawLogo('w', W / 2, cy - 96, 600);
    caps('AWARD-WINNING DESIGN & BUILD', W / 2, cy + 20, 29, 1, 0, { w: 800, ls: 4 });
    caps('SERVING THE GREATER BAY AREA SINCE 1990', W / 2, cy + 62, 18, 1, 0, { w: 600, ls: 3, col: 'rgba(255,255,255,0.62)' });
    pillShine('BOOK A DESIGN CONSULTATION', W / 2, cy + 140, 26, t - WOFF, wbar);
    caps(CONTACT.phone + '   ·   ' + CONTACT.web, W / 2, cy + 222, 24, 1, 0, { w: 800, ls: 2.5 });
  }
  function wallTile(r, list, j, t, fs, pos) {   // list: [[c, in], ...] one per bar; tile j cuts on beat j
    const u = t - WOFF - j * wbt, k = lmod(Math.floor(u / wbar), list.length), lt = lmod(u, wbar), sh = list[k];
    fillR(r, BLK); clip(sh[0], sh[1], lt, wholeIn(sh[0], r)); cutFX(r, lt); tag(PJ[sh[0]], r, fs, pos);
  }
  function bento() {
    const HERO = [0, 0, W, 608], VT = [0, 1176, 418, 744], RT = [426, 1176, 654, 368], RB = [426, 1552, 654, 368];
    const L = {
      hero: [['c02', 9.0], ['c12', 3.5], ['c05', 4.1], ['c09', 17.0], ['c07', 6.05], ['c11', 15.0], ['c12', 0.2], ['c05', 24.1]],
      vt: [['c03', 0.2], ['c04', 3.05], ['c03', 10.0], ['c04', 6.05], ['c03', 15.0], ['c04', 18.0], ['c03', 25.0], ['c04', 24.0]],
      rt: [['c07', 12.05], ['c09', 3.6], ['c11', 3.05], ['c12', 8.6], ['c02', 0.1], ['c07', 21.0], ['c09', 7.05], ['c11', 12.05]],
      rb: [['c09', 10.55], ['c07', 24.0], ['c02', 3.05], ['c05', 14.0], ['c12', 5.6], ['c11', 6.0], ['c07', 27.0], ['c05', 19.1]],
    };
    return {
      dur: WL,
      render(t) {
        wallTile(HERO, L.hero, 0, t, 20); wallTile(VT, L.vt, 1, t, 15); wallTile(RT, L.rt, 2, t, 16); wallTile(RB, L.rb, 3, t, 16);
        wallBrand(t, 616, 552);
      },
      cues() {
        const ev = []; for (let b = 0; b < 32; b++) ev.push(['tick', b * wbt, 0.07, [0, -0.5, 0.4, 0.5][b % 4]]);
        return { dur: WL, loop: true, rot: -WOFF, beds: [['music', 0, WL, 1.0, { style: 'lounge', bpm: WB, key: 3 }]], events: ev };
      },
    };
  }
  function scrollWall() {
    const CW = 536, X = [0, 544], G = 8;
    // [clip, shots]: tile height follows the clip's own aspect (16:9, 3:2 or 9:16)
    const COLS = [
      [['c02', [['c02', 9.0], ['c11', 3.05], ['c02', 0.1], ['c11', 15.0]]], ['c03', [['c03', 0.2], ['c03', 10.0], ['c03', 15.0], ['c03', 25.0]]],
        ['c09', [['c09', 3.6], ['c09', 10.55], ['c09', 7.05], ['c09', 17.0]]], ['c10', [['c10', 0.5], ['c10', 4.0], ['c10', 17.0], ['c10', 21.0]]],
        ['c12', [['c12', 0.2], ['c12', 3.5], ['c12', 8.6], ['c12', 5.6]]]],
      [['c07', [['c07', 12.05], ['c07', 6.05], ['c07', 24.0], ['c07', 21.0]]], ['c08', [['c08', 5.98], ['c08', 8.48], ['c08', 10.98], ['c08', 13.44]]],
        ['c05', [['c05', 4.1], ['c05', 14.0], ['c05', 19.1], ['c05', 24.1]]], ['c04', [['c04', 3.05], ['c04', 18.0], ['c04', 6.05], ['c04', 24.0]]],
        ['c11', [['c11', 0.05], ['c11', 12.05], ['c02', 6.0], ['c11', 6.0]]]],
    ];
    const ringH = COLS.map(col => col.reduce((s, [c]) => s + Math.round(CW / AR(c)) + G, 0));
    return {
      dur: WL,
      render(t) {
        COLS.forEach((col, ci) => {
          const RH = ringH[ci], off = lmod(t / WL * RH, RH), dir = ci ? 1 : -1;
          let y = 0, j = 0;
          for (const [c, list] of col) {
            const h = Math.round(CW / AR(c));
            for (const rep of [-1, 0, 1]) {
              const yy = y + rep * RH + dir * off;
              if (yy + h > 0 && yy < H) wallTile([X[ci], Math.round(yy), CW, h], list, (j + ci * 2) % 4, t, 14);
            }
            y += h + G; j++;
          }
        });
        if (!VID.collecting) {   // floating brand plate
          const r = [70, 742, 940, 436];
          ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 50; ctx.fillStyle = 'rgba(11,11,11,0.94)'; rrect(r[0], r[1], r[2], r[3], 18); ctx.fill(); ctx.shadowBlur = 0;
          const pb = Math.pow(1 - lmod(t - WOFF, wbar) / wbar, 3); ctx.strokeStyle = ORA(0.35 + 0.5 * pb); ctx.lineWidth = 3; rrect(r[0], r[1], r[2], r[3], 18); ctx.stroke(); ctx.restore();
        }
        kicker('THE PORTFOLIO  ·  BUILT BY ' + BRAND.short.toUpperCase(), W / 2, 816, 1, { align: 'center', size: 21, ls: 5 });
        drawLogo('w', W / 2, 908, 560);
        caps('AWARD-WINNING DESIGN & BUILD', W / 2, 1016, 26, 1, 0, { w: 800, ls: 4 });
        pillShine('BOOK A DESIGN CONSULTATION', W / 2, 1090, 24, t - WOFF, wbar);
        caps(CONTACT.phone + '   ·   ' + CONTACT.web, W / 2, 1150, 21, 1, 0, { w: 800, ls: 2 });
      },
      cues() {
        const ev = []; for (let b = 0; b < 32; b++) ev.push(['tick', b * wbt, 0.06, b % 2 ? 0.4 : -0.4]);
        return { dur: WL, loop: true, rot: -WOFF, beds: [['music', 0, WL, 1.0, { style: 'lounge', bpm: WB, key: -3 }]], events: ev };
      },
    };
  }

  // ======================= Built by DPG, framed spotlights =======================
  const SPOTS = {
    villa: { title: 'Hillside Villa', key: 0, shots: [['c02', 0.05, 2.4, 'PATIO OVER THE HILLS'], ['c02', 3.05, 2.4, 'SPA & POOL DECK'], ['c11', 0.05, 2.4, 'VILLA TERRACE'],
      ['c02', 12.0, 2.4, 'STONE FACADE'], ['c11', 12.05, 2.4, 'LOUNGERS BY THE WATER']] },
    oven: { title: 'Stone Oven Terrace', key: -2, shots: [['c09', 0.05, 2.4, 'PAVERS WITH GRASS JOINTS'], ['c09', 3.55, 2.4, 'STONE PIZZA OVEN & FIREPLACE'], ['c09', 7.0, 2.4, 'THE OVEN, UP CLOSE'],
      ['c09', 10.5, 2.4, 'LOUNGE & FIRE TABLE'], ['c09', 17.0, 2.4, 'THE WHOLE TERRACE']] },
    pav: { title: 'Dusk Pavilion', key: 3, shots: [['c12', 0.1, 2.7, 'LIT PAVER STEPS'], ['c12', 2.8, 2.7, 'LOUNGE TERRACE', 1], ['c12', 5.5, 2.7, 'PAVILION AT DUSK', 1],
      ['c12', 8.5, 3.4, 'OUTDOOR KITCHEN']] },
    court: { title: 'Courtyard Estate', key: 2, shots: [['c08', 2.0, 1.95, 'STONE TOWER'], ['c08', 3.98, 1.95, 'ENTRY GATE'], ['c08', 5.98, 2.45, 'PAVER DRIVEWAY'],
      ['c08', 8.48, 2.45, 'DRIVEWAY & CRAPE MYRTLES'], ['c08', 10.98, 2.4, 'FOUNTAIN COURTYARD']] },
    town: { title: 'Townhome Terrace', key: -3, shots: [['c10', 0.3, 2.4, 'SIDE-YARD PATH'], ['c10', 4.0, 2.6, 'DECK LOUNGE & FIRE TABLE'], ['c10', 10.5, 2.6, 'DINING & KITCHEN ISLAND'],
      ['c10', 17.0, 2.6, 'GRILL & BAR COUNTER'], ['c10', 21.0, 2.4, 'UMBRELLA DECK']] },
    ent: { title: 'The Entertainer', key: 1, shots: [['c07', 6.05, 2.4, 'HOUSE & PAVILION'], ['c07', 9.05, 2.4, 'PAVILION & KITCHEN'], ['c07', 12.05, 2.4, 'BOCCE & STRING LIGHTS'],
      ['c07', 15.05, 2.4, 'FIRE BOWL ON THE BOCCE COURT'], ['c07', 24.0, 2.4, 'PAVILION AT DUSK']] },
  };
  function spot(key) {
    const P0 = SPOTS[key], BPM = 100, bar = 4 * 60 / BPM;
    const KICK = TX('kick', 'BUILT BY ' + BRAND.short.toUpperCase() + '  ·  PROJECT SPOTLIGHT', { label: 'Kicker', group: 'Title', upper: true, max: 36 });
    const P = Object.assign({}, P0, { title: TX('title', P0.title, { label: 'Project name', group: 'Title', max: 22 }),
      shots: P0.shots.map(([c, inn, d, lab, cont], i) => { const g = 'Shot ' + (i + 1), s = SHOT('s' + (i + 1), [c, inn], { label: 'Footage', group: g, kind: 'land', d: d + 0.32 });
        return [s[0], s[1], d, TX('l' + (i + 1), lab, { label: 'Label', group: g, upper: true, max: 28 }), cont]; }) });
    const ESUB = TX('endSub', 'BUILT BY ' + BRAND.short.toUpperCase(), { label: 'End card line', group: 'Ending', upper: true, max: 30 });
    const S = P.shots.map(([c, inn, d, lab, cont], i) => S_(c, inn, d, { lab, tr: i && !cont ? 'push' : null }));
    const END = lay(S, 0), DUR = END + 3.2;
    const BH = Math.round(W / AR(P.shots[0][0])), BAND = [0, 540, W, BH], BOT = 540 + BH;
    return {
      dur: DUR,
      render(t) {
        glowBG(540 + BH / 2, 0.07);
        const ea = 1 - ramp(t, END, 0.35);
        if (ea > 0) {
          ctx.save(); ctx.globalAlpha = ea;
          kicker(KICK, W / 2, 300, ramp(t, 0, 0.3), { align: 'center', size: 22, ls: 4, maxW: 960 });
          serif(P.title, W / 2, 440, Math.min(112, fitSize(P.title, 600, 960, 112, 'Corm', 0, 'italic')), t < 0.05 ? 1 : ramp(t, 0.05, 0.6), 0, { w: 600, col: WHT });
          rule(W / 2, 478, 240, ramp(t, 0.3, 0.5), { col: OR, h: 3 });
          const r = bandPlay(S, Math.min(t, END - 0.01), BAND);
          if (!VID.collecting) {
            ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);   // progress rail under the band, one segment per shot
            const n = S.length, gw = (W - 120 - (n - 1) * 8) / n;
            S.forEach((sh, i) => { const x = 60 + i * (gw + 8), u = clamp((t - sh.start) / sh.d); ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(x, BOT + 22, gw, 5); ctx.fillStyle = OR; ctx.fillRect(x, BOT + 22, gw * u, 5); });
            ctx.restore();
          }
          kicker(r.sh.lab, W / 2, BOT + 96, clamp((r.lt - 0.1) / 0.35), { align: 'center', size: 30, ls: 3, maxW: 960 });
          ctx.restore();
        }
        if (t >= END) endCustom(t - END - 0.15, { head: [P.title.toUpperCase()], sub: ESUB });
      },
      cues() {
        const ev = [];
        S.forEach((sh, i) => { if (sh.tr === 'push') ev.push(['whoosh', sh.start, 0.26, i % 2 ? 0.3 : -0.3]); ev.push(['tink', sh.start + 0.12, 0.12, 0]); });
        ev.push(['whoosh', END, 0.28, 0]); ev.push(['chime', END + 0.5, 0.3, 0]);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'lounge', bpm: BPM, key: P.key }]], events: ev };
      },
    };
  }

  // ======================= #34 Modern Pool Retreat: band <-> full-bleed vertical =======================
  function mpr() {
    const BPM = 100, bar = 4 * 60 / BPM, BAND = [0, 560, W, 608], XT = 0.6;
    const S = [S_('c05', 0.05, 2.6, { m: 'band', lab: 'HOUSE & POOL' }), S_('c03', 0.3, 2.4, { m: 'full', word: 'STEP OUTSIDE.' }),
      S_('c04', 3.05, 2.0, { m: 'full', word: 'SPARKLE.' }), S_('c05', 4.1, 2.4, { m: 'band', lab: 'POOL & PERGOLA' }),
      S_('c03', 10.0, 2.2, { m: 'full', word: 'SHADE.' }), S_('c04', 18.0, 2.0, { m: 'full', word: 'GATHER.' }),
      S_('c05', 24.1, 2.4, { m: 'band', lab: 'THE WHOLE RETREAT' })];
    const END = lay(S, 0), DUR = END + 3.2;
    const full = (sh, lt, o) => clip(sh.c, sh.in, lt, [0, 0, W, H], o);
    function topBlock(a) {
      ctx.save(); ctx.globalAlpha *= a;
      kicker('BUILT BY DPG  ·  PROJECT SPOTLIGHT', W / 2, 300, 1, { align: 'center', size: 22, ls: 4 });
      serif('Modern Pool Retreat', W / 2, 440, 104, 1, 0, { w: 600 });
      rule(W / 2, 478, 240, 1, { col: OR, h: 3 });
      ctx.restore();
    }
    return {
      dur: DUR,
      render(t) {
        glowBG(864, 0.07);
        if (t < END + 0.35) {
          ctx.save(); ctx.globalAlpha = 1 - ramp(t, END, 0.35);
          let i = 0; for (let k = 0; k < S.length; k++) if (t >= S[k].start) i = k;
          const sh = S[i], lt = t - sh.start, pv = S[i - 1];
          const xin = pv && pv.m !== sh.m && lt < XT ? E.inOutC(lt / XT) : 1;   // expand / collapse progress
          if (sh.m === 'full') {
            if (xin < 1 && pv.m === 'band') {   // expand: the vertical clip opens out of the band
              const r = [0, lerp(BAND[1], 0, xin), W, lerp(BAND[3], H, xin)];
              full(sh, lt, { clip: () => ctx.rect(r[0], r[1], r[2], r[3]) });
              clip(pv.c, pv.in, t - pv.start, BAND, { alpha: 1 - clamp(xin / 0.45) });
              topBlock(1 - clamp(xin / 0.5));
            } else {
              const push = pv && pv.m === 'full' && lt < 0.32 ? E.inOutC(lt / 0.32) : 1;
              if (push < 1) { full(pv, t - pv.start, { dx: -push * W }); full(sh, lt, { dx: (1 - push) * W }); } else full(sh, lt);
            }
            scrim(0, 520, 0.45, 0); scrim(1300, H, 0, 0.5);
            const ka = xin < 1 && pv.m === 'band' ? clamp((xin - 0.55) / 0.45) : 1;
            if (ka > 0) kicker(PJ[sh.c], W / 2, 300, ka, { align: 'center', size: 22, ls: 4, shadow: ['rgba(0,0,0,0.7)', 14, 2] });
            headline([sh.word], W / 2, 980, lt, pv && pv.m !== sh.m ? 0.35 : 0.1, undefined, { max: 150, maxW: 900 });
          } else {
            if (xin < 1 && pv.m === 'full') {   // collapse: the full-bleed shot folds back into the band
              const r = [0, lerp(0, BAND[1], xin), W, lerp(H, BAND[3], xin)];
              full(pv, t - pv.start, { clip: () => ctx.rect(r[0], r[1], r[2], r[3]) });
              clip(sh.c, sh.in, lt, BAND, { alpha: clamp((xin - 0.45) / 0.55) });
            } else bandPlay([sh], sh.start + lt, BAND);
            topBlock(xin);
            kicker(sh.lab, W / 2, 1264, clamp((lt - 0.3) / 0.4) * xin, { align: 'center', size: 30, ls: 3 });
          }
          ctx.restore();
        }
        if (t >= END) endCustom(t - END - 0.15, { head: ['MODERN POOL RETREAT'], sub: 'BUILT BY DPG' });
      },
      cues() {
        const ev = [];
        S.forEach((sh, i) => { if (!i) return; const pv = S[i - 1]; ev.push(pv.m !== sh.m ? ['swell', sh.start - 0.2, 0.3, 0] : ['whoosh', sh.start, 0.26, 0]); if (sh.m === 'full') ev.push(['impact', sh.start + 0.4, 0.3, 0]); });
        ev.push(['whoosh', END, 0.28, 0]); ev.push(['chime', END + 0.5, 0.3, 0]);
        return { dur: DUR, beds: [['music', 0, DUR, 1.0, { style: 'lounge', bpm: BPM, key: 5 }]], events: ev };
      },
    };
  }

  const P = V === 'thisor' ? thisor() : V === 'upgrade' ? upgrade() : V === 'dream' ? dream() : V === 'bento' ? bento() : V === 'scroll' ? scrollWall()
    : V === 'mpr' ? mpr() : V.startsWith('spot_') ? spot(V.slice(5)) : thisor();
  const loop = V === 'bento' || V === 'scroll';
  DIR = { dur: P.dur, bg: BLK, finish: loop ? { vig: 0.12, grain: 0.16 } : { vig: 0.22, grain: 0.2 }, edl: [], render: P.render, cues: P.cues };
});
