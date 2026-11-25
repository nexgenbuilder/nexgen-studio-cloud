'use strict';
/* NexGen Studio V28 (Nov 18): Pixel family, part 3: the arcade pack (needs engine/tpl_pixel.js).
   With the brand's footage (shown whole inside a pixel frame, never cropped; an optional CRT scanline look):
   ?v=pxcab     Arcade Cabinet   a marquee with your name in lights, your footage on the cabinet's screen, info lines and an offer
   ?v=pxhud     Game HUD         your footage under a game HUD (score counting up, lives, level = your name), dialogue lines typed in
   ?v=pxtype    Pixel Kinetic    five words or short lines slam in over your footage with shakes, a combo counter and a score pop
   Without footage:
   ?v=pxscores  High Scores      a five-row high-score table: players and scores, or menu items and prices
   ?v=pxselect  Select Player    four characters (your team or your services), a cursor picks one: P1 SELECTED
   ?v=pxvs      New Challenger   WARNING, HERE COMES A NEW CHALLENGER, then your event: name, date, time, place
   ?v=pxtokens  Token Board      up to four packages with their prices on a token board, INSERT TOKENS
   Prices, dates and names are fields; the defaults are placeholders to replace, never facts. */
STUDIO_REG['pixel3'] = (() => {
  const V = QS.get('v') || 'pxcab';
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const { g, clamp, ease, bounce, typed, rng, rect, rectO, pt, line, ellipse, poly, txt, tw, sprite, people, logoAny, scan, stars, tri, button, wipe, flash, cue, bed } = PX;
  const isWF = /webflix/i.test((typeof BRAND !== 'undefined' && BRAND.name) || '') || !window.STUDIO;
  const BNAME = ((typeof BRAND !== 'undefined' && (BRAND.short || BRAND.name)) || 'YOUR BRAND').toUpperCase();
  const LOGO = PX.logoSetup(isWF);
  const W_ = (k, d, label, max, group) => TX(k, d, { label, max, group: group || 'Words', upper: true });
  const w_ = (k, d, label, max, group) => TX(k, d, { label, max, group: group || 'Words' });
  const blink = (t, hz) => Math.floor(t * (hz || 3)) % 2 === 0;
  const NONE = k => ['nofoot.' + k, 0];
  const shot = (k, label, d) => { const s = SHOT(k, NONE(k), { label, group: 'Footage', kind: 'any', d: d + 0.3 }); return { c: s[0], in: s[1] }; };
  const CRT = () => TX('crt', 'on', { label: 'Footage look', group: 'Footage', options: [{ value: 'on', label: 'CRT scanlines' }, { value: 'off', label: 'Clean' }] });
  // footage inside a pixel-grid box [x, y, w, h], shown whole over the background colour; runs in the collect pass too
  function foot(s, lt, box, crt, P) {
    const r = box.map(v => v * 4); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); ctx.rect(r[0], r[1], r[2], r[3]); ctx.clip();
    if (!VID.collecting) { ctx.fillStyle = P.INK; ctx.fillRect(r[0], r[1], r[2], r[3]); }
    K3.clip(s.c, s.in, Math.max(0, lt), K3.wholeIn(s.c, r));
    if (!VID.collecting && crt) { ctx.fillStyle = 'rgba(0,0,0,0.22)'; for (let y = r[1]; y < r[1] + r[3]; y += 4) ctx.fillRect(r[0], y, r[2], 2); }
    ctx.restore();
  }
  // a frame with footage holes: background into the pixel layer, holes cleared, footage under, the UI on top
  function compose(t, bg, holes, ui) {
    let P = PX.pal();
    if (!VID.collecting) { P = PX.begin(); bg(t, P); for (const h of holes(t)) g.clearRect(h.box[0], h.box[1], h.box[2], h.box[3]); ui(t, P); }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (!VID.collecting) { ctx.fillStyle = P.INK; ctx.fillRect(0, 0, W, H); } ctx.restore();
    for (const h of holes(t)) foot(h.s, h.lt, h.box, h.crt, P);
    if (!VID.collecting) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(PX.LO, 0, 0, 1080, 1920); ctx.restore(); PX.flushLogos(); }
  }
  const pixelOnly = render => t => { if (VID.collecting) return; render(t); PX.blit(); };

  // ============================================ ARCADE CABINET (10s, 2 shots)
  function pxcab() {
    const MQ = W_('marquee', BNAME.slice(0, 14), 'Marquee (your name)', 14), S1 = shot('s1', 'Shot 1', 4.6), S2 = shot('s2', 'Shot 2', 4.6), crt = CRT() === 'on';
    const L1 = W_('line1', 'OPEN 7 DAYS', 'Info line 1', 22, 'Info'), L2 = W_('line2', '(555) 000-0000', 'Info line 2 (phone)', 22, 'Info'), OFF = W_('offer', 'ASK ABOUT THE DEAL', 'Offer', 26, 'Offer'), CTA = W_('cta', 'BOOK NOW', 'Button', 16, 'Call to action');
    const INSERT = W_('insert', 'INSERT COIN', 'Insert Coin line', 12, 'Offer');
    const DUR = 10.0, SW = 4.6, BOX = [30, 74, 210, 232];
    function bg(t, P) {
      rect(g, 0, 0, 269, 479, P.INK); rect(g, 14, 20, 255, 470, P.PANEL); rectO(g, 14, 20, 255, 470, P.EDGE, 2);
      for (let y = 30; y < 470; y += 16) { rect(g, 16, y, 22, y + 7, P.RED); rect(g, 247, y, 253, y + 7, P.RED); }
      const [mqx, mqy] = posOf(elP('marquee'), [24, 26]); rect(g, mqx, mqy, mqx + 221, mqy + 38, P.INK); rectO(g, mqx, mqy, mqx + 221, mqy + 38, P.YEL, 2);
      for (let x = mqx + 6; x < mqx + 218; x += 8) { const on = (Math.floor(t * 6) + x / 8) % 3 !== 0; pt(g, x, mqy + 4, on ? P.YEL : P.DRED); pt(g, x, mqy + 34, on ? P.DRED : P.YEL); }
      const [scx, scy] = posOf(elP('screen'), [30, 74]); rectO(g, scx - 4, scy - 4, scx + 213, scy + 236, P.EDGE, 4);
    }
    function ui(t, P) {
      const [mqx, mqy] = posOf(elP('marquee'), [24, 26]); const w = tw(MQ, 'ps16'); txt(g, mqx + 111, mqy + 11, MQ, { f: 'ps16', k: w > 210 ? 1 : 1, col: blink(t, 2) || t > 1 ? P.YEL : P.WHITE, sh: P.DRED, a: 'm' });
      const [scx, scy] = posOf(elP('screen'), [30, 74]);
      if (t > SW - 0.15 && t < SW + 0.2) { const r = rng(Math.floor(t * 30) + 3); for (let i = 0; i < 700; i++) pt(g, scx + Math.floor(r() * 210), scy + Math.floor(r() * 232), [P.WHITE, P.GREY, P.DIM][Math.floor(r() * 3)]); }
      const [cx, cy] = posOf(elP('controls'), [26, 316]); rect(g, cx, cy, cx + 217, cy + 56, P.BAR); rectO(g, cx, cy, cx + 217, cy + 56, P.EDGE, 2);
      ellipse(g, cx + 20, cy + 10, cx + 36, cy + 26, P.DIM); rect(g, cx + 26, cy + 26, cx + 30, cy + 44, P.GREY); ellipse(g, cx + 20, cy + 20 + Math.round(2 * Math.sin(t * 5)), cx + 36, cy + 34 + Math.round(2 * Math.sin(t * 5)), P.RED);
      [[124, 20, P.RED], [150, 14, P.YEL], [176, 20, P.GREEN], [202, 14, '#468CE6']].forEach(([x, y, c], i) => { const down = Math.floor(t * 4 + i) % 5 === 0; ellipse(g, cx + x - 8, cy + y + (down ? 2 : 0), cx + x + 8, cy + y + 12 + (down ? 2 : 0), c); });
      const [lgx, lgy] = posOf(elP('logo'), [100, 330]); logoAny(LOGO, g, lgx, lgy, 1, false);
      if (t > 1.0) { const [l1x, l1y] = posOf(elP('line1'), [135, 384]); txt(g, l1x, l1y, typed(L1, t - 1.0, 30), { col: P.WHITE, a: 'm' }); }
      if (t > 1.6) { const [l2x, l2y] = posOf(elP('line2'), [135, 400]); txt(g, l2x, l2y, typed(L2, t - 1.6, 30), { col: P.GREY, a: 'm' }); }
      if (t > 2.4) { const [ofx, ofy] = posOf(elP('offer'), [135, 422]); const u = ease((t - 2.4) / 0.3), bw = Math.round(Math.min(236, Math.max(180, tw(OFF) + 16)) * u); rect(g, ofx - bw / 2, ofy - 6, ofx + bw / 2, ofy + 12, P.RED); if (u >= 1) txt(g, ofx, ofy, OFF, { col: P.INK, a: 'm' }); }
      if (t > 3.2) { const [bx, by] = posOf(elP('cta'), [135, 442]); if (t < DUR - 2 ? blink(t) : true) button(g, bx, by, CTA, blink(t)); }
      if (t > DUR - 2.2 && blink(t, 2)) { const [ix, iy] = posOf(elP('insert'), [135, 290]); txt(g, ix, iy, INSERT, { col: P.YEL, sh: P.INK, a: 'm' }); }
    }
    const holes = t => { const [hx, hy] = posOf(elP('screen'), [30, 74]); return [{ s: t < SW ? S1 : S2, lt: t < SW ? t : t - SW, box: [hx, hy, 210, 232], crt }]; };
    function elements() {
      const [mqx, mqy] = posOf(elP('marquee'), [24, 26]), [scx, scy] = posOf(elP('screen'), [30, 74]);
      const [cx, cy] = posOf(elP('controls'), [26, 316]), [lgx, lgy] = posOf(elP('logo'), [100, 330]);
      const [l1x, l1y] = posOf(elP('line1'), [135, 384]), [l2x, l2y] = posOf(elP('line2'), [135, 400]);
      const [ofx, ofy] = posOf(elP('offer'), [135, 422]), [bx, by] = posOf(elP('cta'), [135, 442]), [ix, iy] = posOf(elP('insert'), [135, 290]);
      return [
        { id: 'marquee', kind: 'box', label: MQ, x: mqx, y: mqy, w: 221, h: 38, t0: 0, d: DUR, box: [mqx, mqy, 221, 38], dup: false, del: false },
        { id: 'screen', kind: 'box', label: 'Cabinet screen', x: scx, y: scy, w: 210, h: 232, t0: 0, d: DUR, box: [scx, scy, 210, 232], dup: false, del: false },
        { id: 'controls', kind: 'box', label: 'Controls', x: cx, y: cy, w: 217, h: 56, t0: 0, d: DUR, box: [cx, cy, 217, 56], dup: false, del: false },
        { id: 'logo', kind: 'pos', label: 'Logo', x: lgx, y: lgy, t0: 0, d: DUR, box: [lgx - 30, lgy, 60, 20], dup: false, del: false },
        { id: 'line1', kind: 'pos', label: L1, x: l1x, y: l1y, t0: 1.0, d: DUR - 1.0, box: [l1x - 110, l1y - 4, 220, 16], dup: false, del: false },
        { id: 'line2', kind: 'pos', label: L2, x: l2x, y: l2y, t0: 1.6, d: DUR - 1.6, box: [l2x - 110, l2y - 4, 220, 16], dup: false, del: false },
        { id: 'offer', kind: 'box', label: OFF, x: ofx, y: ofy, w: 236, h: 18, t0: 2.4, d: DUR - 2.4, box: [ofx - 118, ofy - 6, 236, 18], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: CTA, x: bx, y: by, t0: 3.2, d: DUR - 3.2, box: [bx - 80, by - 4, 160, 28], dup: false, del: false },
        { id: 'insert', kind: 'pos', label: INSERT, x: ix, y: iy, t0: DUR - 2.2, d: 2.2, box: [ix - 70, iy - 4, 140, 16], dup: false, del: false },
      ];
    }
    return { dur: DUR, render: t => compose(t, bg, holes, ui), cues: () => ({ dur: DUR, beds: [bed(DUR)], events: [cue('coindrop', 0.2, 0.5), cue('blip', 1.0, 0.4), cue('blip', 1.6, 0.4), cue('select', 2.4), cue('coin', 3.2), cue('hit', SW - 0.1, 0.3), cue('fanfare', DUR - 2.2, 0.5)] }), elements };
  }

  // ============================================ GAME HUD (10s, 3 shots)
  function pxhud() {
    const S = [shot('s1', 'Shot 1', 3.4), shot('s2', 'Shot 2', 3.4), shot('s3', 'Shot 3', 3.4)], crt = CRT() === 'on';
    const LV = W_('level', BNAME.slice(0, 16), 'Level name (your name)', 16, 'HUD'), SCORE = W_('score', '999999', 'Score it counts up to', 7, 'HUD');
    const D = [w_('say1', 'Welcome, player one.', 'Dialogue 1', 34, 'Dialogue'), w_('say2', 'New games every week.', 'Dialogue 2', 34, 'Dialogue'), w_('say3', 'Bring your crew tonight.', 'Dialogue 3', 34, 'Dialogue')].filter(s => s && s.trim());
    const WHO = W_('speaker', 'HOST', 'Speaker name', 10, 'Dialogue'), CTA = W_('cta', 'PLAY TODAY', 'Button', 16, 'Call to action');
    const ONEUP = W_('oneup', '1UP', 'Lives label', 4, 'HUD'), LVLBL = W_('levellabel', 'LEVEL', 'Level label', 8, 'HUD'), PRESS = W_('press', 'PRESS START', 'Press Start line', 12, 'HUD');
    const DUR = 10.2, LEN = DUR / 3, BOX = [0, 28, 270, 330];
    const target = parseInt(String(SCORE).replace(/\D/g, ''), 10) || 999999;
    function bg(t, P) { rect(g, 0, 0, 269, 479, P.INK); }
    function heart(x, y, c) { ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'].forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'X') pt(g, x + i, y + j, c); })); }
    function ui(t, P) {
      rect(g, 0, 0, 269, 27, P.INK); const [oux, ouy] = posOf(elP('oneup'), [6, 4]); txt(g, oux, ouy, ONEUP, { col: P.RED }); const [scx, scy] = posOf(elP('score'), [6, 15]); const sc = String(Math.min(target, Math.floor(target * clamp(t / (DUR - 2))))).padStart(String(target).length, '0'); txt(g, scx, scy, sc, { col: P.WHITE });
      const [llx, lly] = posOf(elP('levellabel'), [135, 4]); txt(g, llx, lly, LVLBL, { col: P.RED, a: 'm' }); const [lvx, lvy] = posOf(elP('level'), [135, 15]); txt(g, lvx, lvy, LV, { col: P.YEL, a: 'm' }); const [hvx, hvy] = posOf(elP('lives'), [236, 8]); for (let i = 0; i < 3; i++) heart(hvx - 10 + i * 10, hvy, P.RED);
      const [dx, dy] = posOf(elP('dialogue'), [8, 364]); rect(g, 0, 358, 269, 479, P.INK); rect(g, dx, dy, dx + 253, dy + 76, P.INK); rectO(g, dx, dy, dx + 253, dy + 76, P.WHITE, 2); const [spx, spy] = posOf(elP('speaker'), [22, 361]); rect(g, dx + 8, dy - 6, dx + 8 + tw(WHO) + 12, dy + 6, P.RED); txt(g, spx, spy, WHO, { col: P.INK });
      const per = (DUR - 1.6) / Math.max(1, D.length), i = Math.min(D.length - 1, Math.floor(Math.max(0, t - 0.4) / per)), lt = t - 0.4 - i * per;
      if (t > 0.4 && D[i]) { const s = typed(D[i], lt, 22), ws = s.split(' '); let a = '', b = ''; for (const w of ws) { if (!b && (a + ' ' + w).trim().length <= 30) a = (a + ' ' + w).trim(); else b = (b + ' ' + w).trim(); }
        const [sx, sy] = posOf(elP('say'), [18, 378]); txt(g, sx, sy, a, { f: 'vt', col: P.WHITE }); if (b) txt(g, sx, sy + 18, b, { f: 'vt', col: P.WHITE }); if (lt > D[i].length / 22 && blink(t, 4)) tri(g, dx + 238, dy + 60, 7, P.YEL); }
      if (t > DUR - 1.6) { const [cx, cy] = posOf(elP('cta'), [135, 448]); button(g, cx, cy, CTA, blink(t)); } else if (blink(t, 1.5)) { const [psx, psy] = posOf(elP('pressstart'), [135, 452]); txt(g, psx, psy, PRESS, { col: P.GREY, a: 'm' }); }
    }
    const holes = t => { const [hx, hy] = posOf(elP('screen'), [0, 28]); const i = Math.min(2, Math.floor(t / LEN)); return [{ s: S[i], lt: t - i * LEN, box: [hx, hy, 270, 330], crt }]; };
    const per = (DUR - 1.6) / Math.max(1, D.length);
    function elements() {
      const [hx, hy] = posOf(elP('screen'), [0, 28]), [oux, ouy] = posOf(elP('oneup'), [6, 4]), [scx, scy] = posOf(elP('score'), [6, 15]);
      const [llx, lly] = posOf(elP('levellabel'), [135, 4]), [lvx, lvy] = posOf(elP('level'), [135, 15]), [hvx, hvy] = posOf(elP('lives'), [236, 8]);
      const [dx, dy] = posOf(elP('dialogue'), [8, 364]), [spx, spy] = posOf(elP('speaker'), [22, 361]), [sx, sy] = posOf(elP('say'), [18, 378]);
      const [cx, cy] = posOf(elP('cta'), [135, 448]), [psx, psy] = posOf(elP('pressstart'), [135, 452]);
      return [
        { id: 'screen', kind: 'box', label: 'Footage', x: hx, y: hy, w: 270, h: 330, t0: 0, d: DUR, box: [hx, hy, 270, 330], dup: false, del: false },
        { id: 'oneup', kind: 'pos', label: ONEUP, x: oux, y: ouy, t0: 0, d: DUR, box: [oux, ouy - 4, 40, 16], dup: false, del: false },
        { id: 'score', kind: 'pos', label: 'Score ' + SCORE, x: scx, y: scy, t0: 0, d: DUR, box: [scx, scy - 4, 70, 16], dup: false, del: false },
        { id: 'levellabel', kind: 'pos', label: LVLBL, x: llx, y: lly, t0: 0, d: DUR, box: [llx - 40, lly - 4, 80, 16], dup: false, del: false },
        { id: 'level', kind: 'pos', label: LV, x: lvx, y: lvy, t0: 0, d: DUR, box: [lvx - 80, lvy - 4, 160, 16], dup: false, del: false },
        { id: 'lives', kind: 'pos', label: 'Lives', x: hvx, y: hvy, t0: 0, d: DUR, box: [hvx - 12, hvy - 2, 32, 12], dup: false, del: false },
        { id: 'dialogue', kind: 'box', label: 'Dialogue box', x: dx, y: dy, w: 253, h: 76, t0: 0.4, d: DUR - 0.4, box: [dx, dy, 253, 76], dup: false, del: false },
        { id: 'speaker', kind: 'pos', label: WHO, x: spx, y: spy, t0: 0.4, d: DUR - 0.4, box: [spx - 6, spy - 4, 60, 16], dup: false, del: false },
        { id: 'say', kind: 'pos', label: (D[0] || 'Dialogue'), x: sx, y: sy, t0: 0.4, d: DUR - 0.4, box: [sx, sy - 4, 230, 36], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: CTA, x: cx, y: cy, t0: DUR - 1.6, d: 1.6, box: [cx - 80, cy - 4, 160, 28], dup: false, del: false },
        { id: 'pressstart', kind: 'pos', label: PRESS, x: psx, y: psy, t0: 0, d: DUR - 1.6, box: [psx - 60, psy - 4, 120, 16], dup: false, del: false },
      ];
    }
    return { dur: DUR, render: t => compose(t, bg, holes, ui), cues: () => ({ dur: DUR, beds: [bed(DUR)], events: [cue('select', 0.1), ...D.map((_, i) => cue('blip', 0.4 + i * per, 0.4)), cue('drop', LEN, 0.35), cue('drop', LEN * 2, 0.35), cue('coin', DUR - 1.6)] }), elements };
  }

  // ============================================ PIXEL KINETIC (9s, footage behind)
  function pxtype() {
    const S1 = shot('s1', 'Background footage', 9.2), crt = CRT() === 'on';
    const WORDS = [W_('w1', 'NEW', 'Word 1', 10), W_('w2', 'GAMES', 'Word 2', 10), W_('w3', 'EVERY', 'Word 3', 10), W_('w4', 'WEEK', 'Word 4', 10), W_('w5', 'PLAY ON', 'Word 5', 10)].filter(s => s && s.trim());
    const POP = W_('pop', '+1000', 'Score pop', 8), SUB = W_('sub', BNAME.slice(0, 26), 'Sub-line', 26), CTA = W_('cta', 'COME PLAY', 'Button', 16, 'Call to action');
    const STEP = 0.9, T0 = 0.4, END = T0 + WORDS.length * STEP, DUR = Math.max(8, END + 3.2);
    function bg(t, P) { rect(g, 0, 0, 269, 479, P.INK); }
    function ui(t, P) {
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, 270, 480);
      const i = Math.min(WORDS.length - 1, Math.floor((t - T0) / STEP));
      if (t > T0 && t < END) { const lt = t - T0 - i * STEP, s = WORDS[i], k = tw(s, 'ps16') * 3 > 250 ? 2 : 3, sh = lt < 0.15 ? (rng(Math.floor(t * 40))() < 0.5 ? -3 : 3) : 0, [wx, wy] = posOf(elP('word' + (i + 1)), [135, 180]), y = Math.round(wy - 40 * (1 - bounce(lt / 0.25)));
        txt(g, wx + sh, y, s, { f: 'ps16', k, col: i % 2 ? P.YEL : P.WHITE, sh: P.DRED, a: 'm' });
        const [cbx, cby] = posOf(elP('combo'), [262, 40]); txt(g, cbx, cby, 'COMBO x' + (i + 1), { col: P.RED, sh: P.INK, a: 'r' }); }
      if (t >= END) { const u = t - END; const [ppx, ppy] = posOf(elP('pop'), [135, 140]); txt(g, ppx, Math.round(ppy + 30 - 30 * clamp(u / 0.6)), POP, { f: 'ps16', k: 2, col: P.GREEN, sh: P.INK, a: 'm' });
        const [rx, ry] = posOf(elP('recap'), [135, 230]); WORDS.forEach((w, j) => { if (u > 0.3 + j * 0.06) txt(g, rx, ry + j * 18, w, { f: 'ps16', col: j % 2 ? P.YEL : P.WHITE, sh: P.INK, a: 'm' }); });
        if (u > 1.0) { const [sbx, sby] = posOf(elP('sub'), [135, 340]); txt(g, sbx, sby, SUB, { col: P.WHITE, sh: P.INK, a: 'm' }); const [lgx, lgy] = posOf(elP('logo'), [135, 360]); logoAny(LOGO, g, lgx, lgy, 2, false); }
        if (u > 1.6) { const [cx, cy] = posOf(elP('cta'), [135, 420]); button(g, cx, cy, CTA, blink(t)); } }
    }
    const holes = () => [{ s: S1, lt: 0, box: [0, 0, 270, 480], crt }];
    const holesT = t => { const [hx, hy] = posOf(elP('screen'), [0, 0]); return holes().map(h => Object.assign(h, { lt: t, box: [hx, hy, 270, 480] })); };
    function elements() {
      const [hx, hy] = posOf(elP('screen'), [0, 0]), [cbx, cby] = posOf(elP('combo'), [262, 40]);
      const [ppx, ppy] = posOf(elP('pop'), [135, 140]), [rx, ry] = posOf(elP('recap'), [135, 230]);
      const [sbx, sby] = posOf(elP('sub'), [135, 340]), [lgx, lgy] = posOf(elP('logo'), [135, 360]), [cx, cy] = posOf(elP('cta'), [135, 420]);
      const words = WORDS.map((w, i) => { const [wx, wy] = posOf(elP('word' + (i + 1)), [135, 180]);
        return { id: 'word' + (i + 1), kind: 'pos', label: w, x: wx, y: wy, t0: T0 + i * STEP, d: STEP, box: [wx - 110, wy - 20, 220, 48], dup: false, del: false }; });
      return [
        { id: 'screen', kind: 'box', label: 'Footage', x: hx, y: hy, w: 270, h: 480, t0: 0, d: DUR, box: [hx, hy, 270, 480], dup: false, del: false },
        ...words,
        { id: 'combo', kind: 'pos', label: 'Combo counter', x: cbx, y: cby, t0: T0, d: END - T0, box: [cbx - 80, cby - 4, 80, 16], dup: false, del: false },
        { id: 'pop', kind: 'pos', label: POP, x: ppx, y: ppy, t0: END, d: DUR - END, box: [ppx - 80, ppy - 12, 160, 32], dup: false, del: false },
        { id: 'recap', kind: 'pos', label: 'Word recap', x: rx, y: ry, t0: END + 0.3, d: DUR - (END + 0.3), box: [rx - 110, ry - 8, 220, 90], dup: false, del: false },
        { id: 'sub', kind: 'pos', label: SUB, x: sbx, y: sby, t0: END + 1.0, d: DUR - (END + 1.0), box: [sbx - 120, sby - 4, 240, 16], dup: false, del: false },
        { id: 'logo', kind: 'pos', label: 'Logo', x: lgx, y: lgy, t0: END + 1.0, d: DUR - (END + 1.0), box: [lgx - 60, lgy, 120, 40], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: CTA, x: cx, y: cy, t0: END + 1.6, d: DUR - (END + 1.6), box: [cx - 80, cy - 4, 160, 28], dup: false, del: false },
      ];
    }
    return { dur: DUR, render: t => compose(t, bg, holesT, ui), cues: () => ({ dur: DUR, beds: [bed(DUR)], events: [...WORDS.map((_, i) => cue('hit', T0 + i * STEP, 0.45)), cue('powerup', END, 0.6), cue('coin', END + 0.3), cue('select', END + 1.6)] }), elements };
  }

  // ============================================ HIGH SCORES (9s)
  function pxscores() {
    const HEAD = W_('head', 'HIGH SCORES', 'Title', 12), SUB = W_('sub', 'THIS WEEK AT ' + BNAME.slice(0, 14), 'Sub-line', 28);
    const ROWS = [1, 2, 3, 4, 5].map(i => [W_('name' + i, ['ACE', 'MAX', 'JAY', 'KIM', 'ZOE'][i - 1], 'Row ' + i + ' name', 12, 'Table'), W_('score' + i, ['00000', '00000', '00000', '00000', '00000'][i - 1], 'Row ' + i + ' score / price', 8, 'Table')]).filter(r => r[0] && r[0].trim());
    const CTA = W_('cta', 'BEAT THE TOP SCORE', 'Button', 22, 'Call to action'), DUR = 9.0;
    const COL1 = W_('col1', 'RANK', 'Rank header', 6), COL2 = W_('col2', 'NAME', 'Name header', 6), COL3 = W_('col3', 'SCORE', 'Score header', 8);
    function render(t) {
      const P = PX.begin(); stars(g, t, 7, 30); scan(g);
      const [hx, hy] = posOf(elP('head'), [135, 40]); txt(g, hx, hy, HEAD, { f: 'ps16', col: blink(t, 4) && t < 1.2 ? P.WHITE : P.RED, sh: P.DRED, a: 'm' }); const [sbx, sby] = posOf(elP('sub'), [135, 64]); txt(g, sbx, sby, typed(SUB, t - 0.4, 30), { col: P.GREY, a: 'm' });
      const [c1x, c1y] = posOf(elP('colrank'), [24, 96]); txt(g, c1x, c1y, COL1, { col: P.YEL }); const [c2x, c2y] = posOf(elP('colname'), [92, 96]); txt(g, c2x, c2y, COL2, { col: P.YEL }); const [c3x, c3y] = posOf(elP('colscore'), [246, 96]); txt(g, c3x, c3y, COL3, { col: P.YEL, a: 'r' });
      const ord = ['1ST', '2ND', '3RD', '4TH', '5TH'], cols = [P.YEL, P.WHITE, P.WHITE, P.GREY, P.GREY];
      ROWS.forEach(([n, s], i) => { const t0 = 1.2 + (ROWS.length - 1 - i) * 0.55; if (t < t0) return; const [rx, ry] = posOf(elP('row' + (i + 1)), [24, 124 + i * 30]), y = ry, c = i === 0 && blink(t, 4) && t > 4.4 ? P.RED : cols[i];
        txt(g, rx, y, ord[i], { f: 'ps16', col: c }); txt(g, rx + 68, y, typed(n, t - t0, 20), { f: 'ps16', col: c }); txt(g, rx + 222, y, typed(s, t - t0 - 0.2, 20), { f: 'ps16', col: c, a: 'r' }); });
      if (t > 4.8) { const [lgx, lgy] = posOf(elP('logo'), [135, 300]); logoAny(LOGO, g, lgx, lgy, 2, false); }
      if (t > 5.6) { const [cx, cy] = posOf(elP('cta'), [135, 380]); button(g, cx, cy, CTA, blink(t)); }
    }
    function elements() {
      const [hx, hy] = posOf(elP('head'), [135, 40]), [sbx, sby] = posOf(elP('sub'), [135, 64]);
      const [c1x, c1y] = posOf(elP('colrank'), [24, 96]), [c2x, c2y] = posOf(elP('colname'), [92, 96]), [c3x, c3y] = posOf(elP('colscore'), [246, 96]);
      const [lgx, lgy] = posOf(elP('logo'), [135, 300]), [cx, cy] = posOf(elP('cta'), [135, 380]);
      const rows = ROWS.map(([n, s], i) => { const [rx, ry] = posOf(elP('row' + (i + 1)), [24, 124 + i * 30]); const t0 = 1.2 + (ROWS.length - 1 - i) * 0.55;
        return { id: 'row' + (i + 1), kind: 'card', label: n + ' · ' + s, x: rx, y: ry, w: 222, h: 20, t0, d: DUR - t0, box: [rx, ry, 222, 20], dup: false, del: false }; });
      return [
        { id: 'head', kind: 'pos', label: HEAD, x: hx, y: hy, t0: 0, d: DUR, box: [hx - 90, hy - 8, 180, 28], dup: false, del: false },
        { id: 'sub', kind: 'pos', label: SUB, x: sbx, y: sby, t0: 0.4, d: DUR - 0.4, box: [sbx - 120, sby - 4, 240, 16], dup: false, del: false },
        { id: 'colrank', kind: 'pos', label: COL1, x: c1x, y: c1y, t0: 0, d: DUR, box: [c1x, c1y - 4, 50, 16], dup: false, del: false },
        { id: 'colname', kind: 'pos', label: COL2, x: c2x, y: c2y, t0: 0, d: DUR, box: [c2x, c2y - 4, 50, 16], dup: false, del: false },
        { id: 'colscore', kind: 'pos', label: COL3, x: c3x, y: c3y, t0: 0, d: DUR, box: [c3x - 50, c3y - 4, 50, 16], dup: false, del: false },
        ...rows,
        { id: 'logo', kind: 'pos', label: 'Logo', x: lgx, y: lgy, t0: 4.8, d: DUR - 4.8, box: [lgx - 60, lgy, 120, 40], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: CTA, x: cx, y: cy, t0: 5.6, d: DUR - 5.6, box: [cx - 100, cy - 4, 200, 28], dup: false, del: false },
      ];
    }
    return { dur: DUR, render: pixelOnly(render), cues: () => ({ dur: DUR, beds: [bed(DUR)], events: [cue('select', 0.1), ...ROWS.map((_, i) => cue('blip', 1.2 + i * 0.55, 0.45)), cue('fanfare', 4.4, 0.55), cue('coin', 5.6)] }), elements };
  }

  // ============================================ SELECT YOUR PLAYER (10s)
  function pxselect() {
    const HEAD = W_('head', 'SELECT YOUR PLAYER', 'Title', 18);
    const PL = [1, 2, 3, 4].map(i => [W_('p' + i, ['ALEX', 'SAM', 'RIO', 'JO'][i - 1], 'Player ' + i + ' name', 8, 'Players'), W_('r' + i, ['OWNER', 'GAME MASTER', 'PARTY HOST', 'SNACK BAR'][i - 1], 'Player ' + i + ' role', 12, 'Players')]);
    const PICK = Math.max(1, Math.min(4, parseInt(TX('pick', '1', { label: 'Who gets picked', group: 'Players', options: [1, 2, 3, 4].map(n => ({ value: String(n), label: 'Player ' + n })) }), 10))) - 1;
    const SEL = W_('selected', 'SELECTED!', 'Pick line', 12), CTA = W_('cta', 'MEET THE CREW', 'Button', 18, 'Call to action'), DUR = 10.0;
    const P1 = W_('p1label', 'P1', 'Player tag', 4, 'Players');
    const LOOKS = [['#C6865A', '#281C16', '#FF3B52', '#28325A', 'cap'], ['#FFD6AA', '#DCB45A', '#468CE6', '#323238', 'long'], ['#8D5536', '#1E1E22', '#3DC878', '#1E1E28', 'beanie'], ['#E9B482', '#96281E', '#FAC83C', '#6E5032', 'bun']];
    const PATH = [0, 1, 3, 2, 0, 1, 3, 2]; let path = PATH.slice(0, 5); path.push(PICK);
    function render(t) {
      const P = PX.begin(); scan(g); const [hx, hy] = posOf(elP('head'), [135, 28]); txt(g, hx, hy, HEAD, { col: P.WHITE, a: 'm' }); rect(g, 30, 42, 240, 43, P.RED);
      const cur = t < 1.0 ? -1 : t < 5.4 ? path[Math.min(path.length - 1, Math.floor((t - 1.0) / 0.8))] : PICK, picked = t > 5.4;
      PL.forEach(([n, r], i) => { const [px, py] = posOf(elP('player' + (i + 1)), [18 + (i % 2) * 120, 58 + Math.floor(i / 2) * 150]), x = px, y = py, on = i === cur;
        rect(g, x, y, x + 113, y + 140, P.PANEL); rectO(g, x, y, x + 113, y + 140, on ? (picked && blink(t, 6) ? P.YEL : P.RED) : P.EDGE, on ? 3 : 2);
        sprite(g, x + 44, y + 100, LOOKS[i], t + i, 4, { happy: true, walk: on && picked }); txt(g, x + 57, y + 108, n, { col: on ? P.YEL : P.WHITE, a: 'm' }); txt(g, x + 57, y + 122, r, { f: 'vt', col: P.GREY, a: 'm' });
        if (on && !picked) txt(g, x + 57, y + 6, P1, { col: P.RED, a: 'm' }); });
      if (picked) { const [pkx, pky] = posOf(elP('pick'), [135, 378]); const u = ease((t - 5.4) / 0.3); rect(g, pkx - 120 * u, pky - 10, pkx + 120 * u, pky + 18, P.RED); if (u >= 1) txt(g, pkx, pky, P1 + ': ' + PL[PICK][0] + ' ' + SEL, { col: P.INK, a: 'm' }); }
      if (t > 6.4) { const [lgx, lgy] = posOf(elP('logo'), [135, 404]); logoAny(LOGO, g, lgx, lgy, 1, false); const [cx, cy] = posOf(elP('cta'), [135, 432]); button(g, cx, cy, CTA, blink(t)); }
    }
    function elements() {
      const [hx, hy] = posOf(elP('head'), [135, 28]), [pkx, pky] = posOf(elP('pick'), [135, 378]);
      const [lgx, lgy] = posOf(elP('logo'), [135, 404]), [cx, cy] = posOf(elP('cta'), [135, 432]);
      const players = PL.map(([n, r], i) => { const [px, py] = posOf(elP('player' + (i + 1)), [18 + (i % 2) * 120, 58 + Math.floor(i / 2) * 150]);
        return { id: 'player' + (i + 1), kind: 'card', label: n + ' · ' + r, x: px, y: py, w: 113, h: 140, t0: 0, d: DUR, box: [px, py, 113, 140], dup: false, del: false }; });
      return [
        { id: 'head', kind: 'pos', label: HEAD, x: hx, y: hy, t0: 0, d: DUR, box: [hx - 110, hy - 4, 220, 16], dup: false, del: false },
        ...players,
        { id: 'pick', kind: 'box', label: P1 + ': ' + PL[PICK][0] + ' ' + SEL, x: pkx, y: pky, w: 240, h: 28, t0: 5.4, d: DUR - 5.4, box: [pkx - 120, pky - 10, 240, 28], dup: false, del: false },
        { id: 'logo', kind: 'pos', label: 'Logo', x: lgx, y: lgy, t0: 6.4, d: DUR - 6.4, box: [lgx - 30, lgy, 60, 20], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: CTA, x: cx, y: cy, t0: 6.4, d: DUR - 6.4, box: [cx - 80, cy - 4, 160, 28], dup: false, del: false },
      ];
    }
    return { dur: DUR, render: pixelOnly(render), cues: () => ({ dur: DUR, beds: [bed(DUR)], events: [cue('select', 0.2), ...path.slice(0, 5).map((_, i) => cue('tick', 1.0 + i * 0.8, 0.45)), cue('powerup', 5.4, 0.6), cue('coin', 6.4)] }), elements };
  }

  // ============================================ NEW CHALLENGER (9s, 1 shot)
  function pxvs() {
    const S1 = shot('s1', 'Event footage', 4.2), crt = CRT() === 'on';
    const EV = W_('event', 'FRIDAY NIGHT TOURNAMENT', 'Event name', 26), DATE = W_('date', 'DATE', 'Date', 20, 'When & where'), TIME = W_('time', 'TIME', 'Time', 20, 'When & where'), PLACE = W_('place', 'PLACE', 'Place', 26, 'When & where');
    const PRIZE = W_('prize', '', 'Prize or entry (optional)', 26, 'When & where'), CTA = W_('cta', 'SIGN UP', 'Button', 16, 'Call to action'), DUR = 9.0;
    const WARN = W_('warn', 'WARNING!', 'Warning line', 10), WARN1 = W_('warn1', 'HERE COMES A', 'Warning line 2', 14), WARN2 = W_('warn2', 'NEW CHALLENGER!', 'Warning line 3', 16);
    const KD = W_('k_date', 'DATE', 'Date label', 6, 'When & where'), KT = W_('k_time', 'TIME', 'Time label', 6, 'When & where'), KP = W_('k_place', 'WHERE', 'Place label', 6, 'When & where'), KZ = W_('k_prize', 'PRIZE', 'Prize label', 6, 'When & where');
    function bg(t, P) { rect(g, 0, 0, 269, 479, P.INK); if (t < 2.2) { const on = blink(t, 6); rect(g, 0, 0, 269, 479, on ? P.DRED : P.INK); } scan(g); }
    function ui(t, P) {
      if (t < 2.2) { for (let x = -40; x < 300; x += 20) { const o = Math.floor(t * 40) % 20; poly(g, [[x + o, 96], [x + o + 10, 96], [x + o + 20, 106], [x + o + 10, 106]], P.YEL); poly(g, [[x - o, 360], [x - o + 10, 360], [x - o + 20, 370], [x - o + 10, 370]], P.YEL); }
        const [wx, wy] = posOf(elP('warn'), [135, 150]); txt(g, wx, wy, WARN, { f: 'ps16', k: 2, col: blink(t, 4) ? P.YEL : P.RED, sh: P.INK, a: 'm' }); const [w1x, w1y] = posOf(elP('warn1'), [135, 210]); txt(g, w1x, w1y, WARN1, { f: 'ps16', col: P.WHITE, a: 'm' }); const [w2x, w2y] = posOf(elP('warn2'), [135, 232]); txt(g, w2x, w2y, WARN2, { f: 'ps16', col: P.WHITE, a: 'm' }); return; }
      const [scx, scy] = posOf(elP('screen'), [21, 43]); rectO(g, scx - 3, scy - 3, scx + 230, scy + 167, P.RED, 3);
      const lt = t - 2.2;
      const ws = EV.split(' '); let a = '', b = ''; for (const w of ws) { if (!b && (a + ' ' + w).trim().length <= 15) a = (a + ' ' + w).trim(); else b = (b + ' ' + w).trim(); }
      const [evx, evy] = posOf(elP('event'), [135, 222]); txt(g, evx, evy, typed(a, lt, 20), { f: 'ps16', col: P.YEL, sh: P.DRED, a: 'm' }); if (b) txt(g, evx, evy + 20, typed(b, lt - 0.6, 20), { f: 'ps16', col: P.YEL, sh: P.DRED, a: 'm' });
      [[DATE, KD], [TIME, KT], [PLACE, KP], [PRIZE, KZ]].filter(r => r[0] && r[0].trim()).forEach(([v, k], i) => { const t0 = 1.2 + i * 0.35; if (lt < t0) return; const [rx, ry] = posOf(elP('detail' + (i + 1)), [18, 278 + i * 24]), y = ry;
        rect(g, rx, y, rx + 233, y + 18, P.PANEL); rect(g, rx, y, rx + 54, y + 18, P.RED); txt(g, rx + 27, y + 5, k, { col: P.INK, a: 'm' }); txt(g, rx + 62, y + 5, typed(v, lt - t0, 30), { col: P.WHITE }); });
      if (lt > 3.0) { const [lgx, lgy] = posOf(elP('logo'), [135, 384]); logoAny(LOGO, g, lgx, lgy, 1, false); const [cx, cy] = posOf(elP('cta'), [135, 420]); button(g, cx, cy, CTA, blink(t)); }
    }
    const holes = t => { const [hx, hy] = posOf(elP('screen'), [21, 43]); return (t < 2.2 ? [] : [{ s: S1, lt: t - 2.2, box: [hx, hy, 228, 165], crt }]); };
    function elements() {
      const [wx, wy] = posOf(elP('warn'), [135, 150]), [w1x, w1y] = posOf(elP('warn1'), [135, 210]), [w2x, w2y] = posOf(elP('warn2'), [135, 232]);
      const [scx, scy] = posOf(elP('screen'), [21, 43]), [evx, evy] = posOf(elP('event'), [135, 222]);
      const [lgx, lgy] = posOf(elP('logo'), [135, 384]), [cx, cy] = posOf(elP('cta'), [135, 420]);
      const rows = [[DATE, KD], [TIME, KT], [PLACE, KP], [PRIZE, KZ]].filter(r => r[0] && r[0].trim());
      const details = rows.map(([v, k], i) => { const [rx, ry] = posOf(elP('detail' + (i + 1)), [18, 278 + i * 24]); const t0 = 2.2 + 1.2 + i * 0.35;
        return { id: 'detail' + (i + 1), kind: 'card', label: k + ': ' + v, x: rx, y: ry, w: 233, h: 18, t0, d: DUR - t0, box: [rx, ry, 233, 18], dup: false, del: false }; });
      return [
        { id: 'warn', kind: 'pos', label: WARN, x: wx, y: wy, t0: 0, d: 2.2, box: [wx - 90, wy - 10, 180, 32], dup: false, del: false },
        { id: 'warn1', kind: 'pos', label: WARN1, x: w1x, y: w1y, t0: 0, d: 2.2, box: [w1x - 110, w1y - 8, 220, 28], dup: false, del: false },
        { id: 'warn2', kind: 'pos', label: WARN2, x: w2x, y: w2y, t0: 0, d: 2.2, box: [w2x - 110, w2y - 8, 220, 28], dup: false, del: false },
        { id: 'screen', kind: 'box', label: 'Event footage', x: scx, y: scy, w: 228, h: 165, t0: 2.2, d: DUR - 2.2, box: [scx, scy, 228, 165], dup: false, del: false },
        { id: 'event', kind: 'pos', label: EV, x: evx, y: evy, t0: 2.2, d: DUR - 2.2, box: [evx - 115, evy - 8, 230, 50], dup: false, del: false },
        ...details,
        { id: 'logo', kind: 'pos', label: 'Logo', x: lgx, y: lgy, t0: 5.2, d: DUR - 5.2, box: [lgx - 30, lgy, 60, 20], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: CTA, x: cx, y: cy, t0: 5.2, d: DUR - 5.2, box: [cx - 80, cy - 4, 160, 28], dup: false, del: false },
      ];
    }
    return { dur: DUR, render: t => compose(t, bg, holes, ui), cues: () => ({ dur: DUR, beds: [['chip', 2.2, DUR, 0.5, { style: 'chip' }]], events: [cue('gameover', 0.1, 0.4), cue('hit', 0.9, 0.5), cue('hit', 1.5, 0.5), cue('powerup', 2.2, 0.6), cue('blip', 3.4), cue('blip', 3.75), cue('blip', 4.1), cue('coin', 5.2)] }), elements };
  }

  // ============================================ TOKEN BOARD (9s)
  function pxtokens() {
    const HEAD = W_('head', 'TOKEN BOARD', 'Title', 12), SUB = W_('sub', 'PICK YOUR PACK', 'Sub-line', 24);
    const PK = [1, 2, 3, 4].map(i => [W_('pack' + i, ['STARTER', 'PLAYER', 'PRO', 'PARTY'][i - 1], 'Pack ' + i + ' name', 12, 'Packs'), W_('tokens' + i, ['20 TOKENS', '50 TOKENS', '120 TOKENS', 'UP TO 10 KIDS'][i - 1], 'Pack ' + i + ' detail', 16, 'Packs'), W_('price' + i, '$XX', 'Pack ' + i + ' price', 7, 'Packs')]).filter(p => p[0] && p[0].trim());
    const FINE = w_('fine', '', 'Small print (optional)', 40, 'Packs'), CTA = W_('cta', 'INSERT TOKENS', 'Button', 18, 'Call to action'), DUR = 9.0;
    function coin(x, y, P) { ellipse(g, x, y, x + 13, y + 13, P.YEL, '#BE8C28', 2); txt(g, x + 7, y + 3, '$', { col: '#BE8C28', a: 'm' }); }
    function render(t) {
      const P = PX.begin(); stars(g, t, 4, 24); scan(g);
      const [hx, hy] = posOf(elP('head'), [135, 34]); txt(g, hx, hy, HEAD, { f: 'ps16', col: P.YEL, sh: P.DRED, a: 'm' }); const [sbx, sby] = posOf(elP('sub'), [135, 56]); txt(g, sbx, sby, typed(SUB, t - 0.3, 30), { col: P.GREY, a: 'm' });
      PK.forEach(([n, d, p], i) => { const t0 = 0.9 + i * 0.6; if (t < t0) return; const [px, py] = posOf(elP('pack' + (i + 1)), [14, 82 + i * 62]); const y = py, x = Math.round(px - 274 + 274 * ease((t - t0) / 0.3));
        rect(g, x, y, x + 241, y + 52, P.PANEL); rectO(g, x, y, x + 241, y + 52, i === PK.length - 1 && blink(t, 3) && t > 4 ? P.YEL : P.EDGE, 2);
        for (let k = 0; k < Math.min(4, i + 1); k++) coin(x + 8 + k * 6, y + 19 - k * 2, P);
        txt(g, x + 50, y + 10, n, { f: 'ps16', col: P.WHITE }); txt(g, x + 50, y + 30, d, { f: 'vt', col: P.GREY }); txt(g, x + 233, y + 18, p, { f: 'ps16', col: P.YEL, a: 'r' }); });
      if (FINE) { const [fx, fy] = posOf(elP('fine'), [135, 334]); txt(g, fx, fy, FINE, { f: 'vt', col: P.DIM, a: 'm' }); }
      if (t > 4.2) { const [lgx, lgy] = posOf(elP('logo'), [135, 352]); logoAny(LOGO, g, lgx, lgy, 1, false); const [cx, cy] = posOf(elP('cta'), [135, 392]); button(g, cx, cy, CTA, blink(t)); }
    }
    function elements() {
      const [hx, hy] = posOf(elP('head'), [135, 34]), [sbx, sby] = posOf(elP('sub'), [135, 56]);
      const [lgx, lgy] = posOf(elP('logo'), [135, 352]), [cx, cy] = posOf(elP('cta'), [135, 392]);
      const packs = PK.map(([n, d, p], i) => { const [px, py] = posOf(elP('pack' + (i + 1)), [14, 82 + i * 62]); const t0 = 0.9 + i * 0.6;
        return { id: 'pack' + (i + 1), kind: 'card', label: n + ' · ' + d + ' · ' + p, x: px, y: py, w: 241, h: 52, t0, d: DUR - t0, box: [px, py, 241, 52], dup: false, del: false }; });
      const fine = FINE ? (() => { const [fx, fy] = posOf(elP('fine'), [135, 334]); return [{ id: 'fine', kind: 'pos', label: FINE, x: fx, y: fy, t0: 0, d: DUR, box: [fx - 120, fy - 4, 240, 16], dup: false, del: false }]; })() : [];
      return [
        { id: 'head', kind: 'pos', label: HEAD, x: hx, y: hy, t0: 0, d: DUR, box: [hx - 90, hy - 8, 180, 28], dup: false, del: false },
        { id: 'sub', kind: 'pos', label: SUB, x: sbx, y: sby, t0: 0.3, d: DUR - 0.3, box: [sbx - 100, sby - 4, 200, 16], dup: false, del: false },
        ...packs,
        ...fine,
        { id: 'logo', kind: 'pos', label: 'Logo', x: lgx, y: lgy, t0: 4.2, d: DUR - 4.2, box: [lgx - 30, lgy, 60, 20], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: CTA, x: cx, y: cy, t0: 4.2, d: DUR - 4.2, box: [cx - 80, cy - 4, 160, 28], dup: false, del: false },
      ];
    }
    return { dur: DUR, render: pixelOnly(render), cues: () => ({ dur: DUR, beds: [bed(DUR)], events: [cue('coindrop', 0.1, 0.5), ...PK.map((_, i) => cue('coin', 0.9 + i * 0.6, 0.45)), cue('select', 4.2), cue('fanfare', 4.6, 0.5)] }), elements };
  }

  const MAKE = { pxcab, pxhud, pxtype, pxscores, pxselect, pxvs, pxtokens };
  const Pm = (MAKE[V] || pxcab)();
  DIR = { dur: Pm.dur, bg: BLK, finish: { vig: 0, grain: 0 }, edl: [], shakes: [], preload: () => Promise.all([PX.fontsP, K3.init ? K3.init() : null]), render: Pm.render, cues: Pm.cues, ...(Pm.elements ? { elements: Pm.elements } : {}) };
});
