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
    const DUR = 10.0, SW = 4.6, BOX = [30, 74, 210, 232];
    function bg(t, P) {
      rect(g, 0, 0, 269, 479, P.INK); rect(g, 14, 20, 255, 470, P.PANEL); rectO(g, 14, 20, 255, 470, P.EDGE, 2);
      for (let y = 30; y < 470; y += 16) { rect(g, 16, y, 22, y + 7, P.RED); rect(g, 247, y, 253, y + 7, P.RED); }
      rect(g, 24, 26, 245, 64, P.INK); rectO(g, 24, 26, 245, 64, P.YEL, 2);
      for (let x = 30; x < 242; x += 8) { const on = (Math.floor(t * 6) + x / 8) % 3 !== 0; pt(g, x, 30, on ? P.YEL : P.DRED); pt(g, x, 60, on ? P.DRED : P.YEL); }
      rectO(g, 26, 70, 243, 310, P.EDGE, 4);
    }
    function ui(t, P) {
      const w = tw(MQ, 'ps16'); txt(g, 135, 37, MQ, { f: 'ps16', k: w > 210 ? 1 : 1, col: blink(t, 2) || t > 1 ? P.YEL : P.WHITE, sh: P.DRED, a: 'm' });
      if (t > SW - 0.15 && t < SW + 0.2) { const r = rng(Math.floor(t * 30) + 3); for (let i = 0; i < 700; i++) pt(g, 30 + Math.floor(r() * 210), 74 + Math.floor(r() * 232), [P.WHITE, P.GREY, P.DIM][Math.floor(r() * 3)]); }
      rect(g, 26, 316, 243, 372, P.BAR); rectO(g, 26, 316, 243, 372, P.EDGE, 2);
      ellipse(g, 46, 326, 62, 342, P.DIM); rect(g, 52, 342, 56, 360, P.GREY); ellipse(g, 46, 336 + Math.round(2 * Math.sin(t * 5)), 62, 350 + Math.round(2 * Math.sin(t * 5)), P.RED);
      [[150, 336, P.RED], [176, 330, P.YEL], [202, 336, P.GREEN], [228, 330, '#468CE6']].forEach(([x, y, c], i) => { const down = Math.floor(t * 4 + i) % 5 === 0; ellipse(g, x - 8, y + (down ? 2 : 0), x + 8, y + 12 + (down ? 2 : 0), c); });
      logoAny(LOGO, g, 100, 330, 1, false);
      if (t > 1.0) txt(g, 135, 384, typed(L1, t - 1.0, 30), { col: P.WHITE, a: 'm' });
      if (t > 1.6) txt(g, 135, 400, typed(L2, t - 1.6, 30), { col: P.GREY, a: 'm' });
      if (t > 2.4) { const u = ease((t - 2.4) / 0.3), bw = Math.round(Math.min(236, Math.max(180, tw(OFF) + 16)) * u); rect(g, 135 - bw / 2, 416, 135 + bw / 2, 434, P.RED); if (u >= 1) txt(g, 135, 422, OFF, { col: P.INK, a: 'm' }); }
      if (t > 3.2) { if (t < DUR - 2 ? blink(t) : true) button(g, 135, 442, CTA, blink(t)); }
      if (t > DUR - 2.2 && blink(t, 2)) txt(g, 135, 290, 'INSERT COIN', { col: P.YEL, sh: P.INK, a: 'm' });
    }
    const holes = t => [{ s: t < SW ? S1 : S2, lt: t < SW ? t : t - SW, box: BOX, crt }];
    return { dur: DUR, render: t => compose(t, bg, holes, ui), cues: () => ({ dur: DUR, beds: [bed(DUR)], events: [cue('coindrop', 0.2, 0.5), cue('blip', 1.0, 0.4), cue('blip', 1.6, 0.4), cue('select', 2.4), cue('coin', 3.2), cue('hit', SW - 0.1, 0.3), cue('fanfare', DUR - 2.2, 0.5)] }) };
  }

  // ============================================ GAME HUD (10s, 3 shots)
  function pxhud() {
    const S = [shot('s1', 'Shot 1', 3.4), shot('s2', 'Shot 2', 3.4), shot('s3', 'Shot 3', 3.4)], crt = CRT() === 'on';
    const LV = W_('level', BNAME.slice(0, 16), 'Level name (your name)', 16, 'HUD'), SCORE = W_('score', '999999', 'Score it counts up to', 7, 'HUD');
    const D = [w_('say1', 'Welcome, player one.', 'Dialogue 1', 34, 'Dialogue'), w_('say2', 'New games every week.', 'Dialogue 2', 34, 'Dialogue'), w_('say3', 'Bring your crew tonight.', 'Dialogue 3', 34, 'Dialogue')].filter(s => s && s.trim());
    const WHO = W_('speaker', 'HOST', 'Speaker name', 10, 'Dialogue'), CTA = W_('cta', 'PLAY TODAY', 'Button', 16, 'Call to action');
    const DUR = 10.2, LEN = DUR / 3, BOX = [0, 28, 270, 330];
    const target = parseInt(String(SCORE).replace(/\D/g, ''), 10) || 999999;
    function bg(t, P) { rect(g, 0, 0, 269, 479, P.INK); }
    function heart(x, y, c) { ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'].forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'X') pt(g, x + i, y + j, c); })); }
    function ui(t, P) {
      rect(g, 0, 0, 269, 27, P.INK); txt(g, 6, 4, '1UP', { col: P.RED }); const sc = String(Math.min(target, Math.floor(target * clamp(t / (DUR - 2))))).padStart(String(target).length, '0'); txt(g, 6, 15, sc, { col: P.WHITE });
      txt(g, 135, 4, 'LEVEL', { col: P.RED, a: 'm' }); txt(g, 135, 15, LV, { col: P.YEL, a: 'm' }); for (let i = 0; i < 3; i++) heart(236 + i * 10 - 10, 8, P.RED);
      rect(g, 0, 358, 269, 479, P.INK); rect(g, 8, 364, 261, 440, P.INK); rectO(g, 8, 364, 261, 440, P.WHITE, 2); rect(g, 16, 358, 16 + tw(WHO) + 12, 370, P.RED); txt(g, 22, 361, WHO, { col: P.INK });
      const per = (DUR - 1.6) / Math.max(1, D.length), i = Math.min(D.length - 1, Math.floor(Math.max(0, t - 0.4) / per)), lt = t - 0.4 - i * per;
      if (t > 0.4 && D[i]) { const s = typed(D[i], lt, 22), ws = s.split(' '); let a = '', b = ''; for (const w of ws) { if (!b && (a + ' ' + w).trim().length <= 30) a = (a + ' ' + w).trim(); else b = (b + ' ' + w).trim(); }
        txt(g, 18, 378, a, { f: 'vt', col: P.WHITE }); if (b) txt(g, 18, 396, b, { f: 'vt', col: P.WHITE }); if (lt > D[i].length / 22 && blink(t, 4)) tri(g, 246, 424, 7, P.YEL); }
      if (t > DUR - 1.6) button(g, 135, 448, CTA, blink(t)); else if (blink(t, 1.5)) txt(g, 135, 452, 'PRESS START', { col: P.GREY, a: 'm' });
    }
    const holes = t => { const i = Math.min(2, Math.floor(t / LEN)); return [{ s: S[i], lt: t - i * LEN, box: BOX, crt }]; };
    const per = (DUR - 1.6) / Math.max(1, D.length);
    return { dur: DUR, render: t => compose(t, bg, holes, ui), cues: () => ({ dur: DUR, beds: [bed(DUR)], events: [cue('select', 0.1), ...D.map((_, i) => cue('blip', 0.4 + i * per, 0.4)), cue('drop', LEN, 0.35), cue('drop', LEN * 2, 0.35), cue('coin', DUR - 1.6)] }) };
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
      if (t > T0 && t < END) { const lt = t - T0 - i * STEP, s = WORDS[i], k = tw(s, 'ps16') * 3 > 250 ? 2 : 3, sh = lt < 0.15 ? (rng(Math.floor(t * 40))() < 0.5 ? -3 : 3) : 0, y = Math.round(180 - 40 * (1 - bounce(lt / 0.25)));
        txt(g, 135 + sh, y, s, { f: 'ps16', k, col: i % 2 ? P.YEL : P.WHITE, sh: P.DRED, a: 'm' });
        txt(g, 262, 40, 'COMBO x' + (i + 1), { col: P.RED, sh: P.INK, a: 'r' }); }
      if (t >= END) { const u = t - END; txt(g, 135, Math.round(170 - 30 * clamp(u / 0.6)), POP, { f: 'ps16', k: 2, col: P.GREEN, sh: P.INK, a: 'm' });
        WORDS.forEach((w, j) => { if (u > 0.3 + j * 0.06) txt(g, 135, 230 + j * 18, w, { f: 'ps16', col: j % 2 ? P.YEL : P.WHITE, sh: P.INK, a: 'm' }); });
        if (u > 1.0) { txt(g, 135, 340, SUB, { col: P.WHITE, sh: P.INK, a: 'm' }); logoAny(LOGO, g, 135, 360, 2, false); }
        if (u > 1.6) button(g, 135, 420, CTA, blink(t)); }
    }
    const holes = () => [{ s: S1, lt: 0, box: [0, 0, 270, 480], crt }];
    const holesT = t => holes().map(h => Object.assign(h, { lt: t }));
    return { dur: DUR, render: t => compose(t, bg, holesT, ui), cues: () => ({ dur: DUR, beds: [bed(DUR)], events: [...WORDS.map((_, i) => cue('hit', T0 + i * STEP, 0.45)), cue('powerup', END, 0.6), cue('coin', END + 0.3), cue('select', END + 1.6)] }) };
  }

  // ============================================ HIGH SCORES (9s)
  function pxscores() {
    const HEAD = W_('head', 'HIGH SCORES', 'Title', 12), SUB = W_('sub', 'THIS WEEK AT ' + BNAME.slice(0, 14), 'Sub-line', 28);
    const ROWS = [1, 2, 3, 4, 5].map(i => [W_('name' + i, ['ACE', 'MAX', 'JAY', 'KIM', 'ZOE'][i - 1], 'Row ' + i + ' name', 12, 'Table'), W_('score' + i, ['00000', '00000', '00000', '00000', '00000'][i - 1], 'Row ' + i + ' score / price', 8, 'Table')]).filter(r => r[0] && r[0].trim());
    const CTA = W_('cta', 'BEAT THE TOP SCORE', 'Button', 22, 'Call to action'), DUR = 9.0;
    function render(t) {
      const P = PX.begin(); stars(g, t, 7, 30); scan(g);
      txt(g, 135, 40, HEAD, { f: 'ps16', col: blink(t, 4) && t < 1.2 ? P.WHITE : P.RED, sh: P.DRED, a: 'm' }); txt(g, 135, 64, typed(SUB, t - 0.4, 30), { col: P.GREY, a: 'm' });
      txt(g, 24, 96, 'RANK', { col: P.YEL }); txt(g, 92, 96, 'NAME', { col: P.YEL }); txt(g, 246, 96, 'SCORE', { col: P.YEL, a: 'r' });
      const ord = ['1ST', '2ND', '3RD', '4TH', '5TH'], cols = [P.YEL, P.WHITE, P.WHITE, P.GREY, P.GREY];
      ROWS.forEach(([n, s], i) => { const t0 = 1.2 + (ROWS.length - 1 - i) * 0.55; if (t < t0) return; const y = 124 + i * 30, c = i === 0 && blink(t, 4) && t > 4.4 ? P.RED : cols[i];
        txt(g, 24, y, ord[i], { f: 'ps16', col: c }); txt(g, 92, y, typed(n, t - t0, 20), { f: 'ps16', col: c }); txt(g, 246, y, typed(s, t - t0 - 0.2, 20), { f: 'ps16', col: c, a: 'r' }); });
      if (t > 4.8) { logoAny(LOGO, g, 135, 300, 2, false); }
      if (t > 5.6) button(g, 135, 380, CTA, blink(t));
    }
    return { dur: DUR, render: pixelOnly(render), cues: () => ({ dur: DUR, beds: [bed(DUR)], events: [cue('select', 0.1), ...ROWS.map((_, i) => cue('blip', 1.2 + i * 0.55, 0.45)), cue('fanfare', 4.4, 0.55), cue('coin', 5.6)] }) };
  }

  // ============================================ SELECT YOUR PLAYER (10s)
  function pxselect() {
    const HEAD = W_('head', 'SELECT YOUR PLAYER', 'Title', 18);
    const PL = [1, 2, 3, 4].map(i => [W_('p' + i, ['ALEX', 'SAM', 'RIO', 'JO'][i - 1], 'Player ' + i + ' name', 8, 'Players'), W_('r' + i, ['OWNER', 'GAME MASTER', 'PARTY HOST', 'SNACK BAR'][i - 1], 'Player ' + i + ' role', 12, 'Players')]);
    const PICK = Math.max(1, Math.min(4, parseInt(TX('pick', '1', { label: 'Who gets picked', group: 'Players', options: [1, 2, 3, 4].map(n => ({ value: String(n), label: 'Player ' + n })) }), 10))) - 1;
    const SEL = W_('selected', 'SELECTED!', 'Pick line', 12), CTA = W_('cta', 'MEET THE CREW', 'Button', 18, 'Call to action'), DUR = 10.0;
    const LOOKS = [['#C6865A', '#281C16', '#FF3B52', '#28325A', 'cap'], ['#FFD6AA', '#DCB45A', '#468CE6', '#323238', 'long'], ['#8D5536', '#1E1E22', '#3DC878', '#1E1E28', 'beanie'], ['#E9B482', '#96281E', '#FAC83C', '#6E5032', 'bun']];
    const PATH = [0, 1, 3, 2, 0, 1, 3, 2]; let path = PATH.slice(0, 5); path.push(PICK);
    function render(t) {
      const P = PX.begin(); scan(g); txt(g, 135, 28, HEAD, { col: P.WHITE, a: 'm' }); rect(g, 30, 42, 240, 43, P.RED);
      const cur = t < 1.0 ? -1 : t < 5.4 ? path[Math.min(path.length - 1, Math.floor((t - 1.0) / 0.8))] : PICK, picked = t > 5.4;
      PL.forEach(([n, r], i) => { const x = 18 + (i % 2) * 120, y = 58 + Math.floor(i / 2) * 150, on = i === cur;
        rect(g, x, y, x + 113, y + 140, P.PANEL); rectO(g, x, y, x + 113, y + 140, on ? (picked && blink(t, 6) ? P.YEL : P.RED) : P.EDGE, on ? 3 : 2);
        sprite(g, x + 44, y + 100, LOOKS[i], t + i, 4, { happy: true, walk: on && picked }); txt(g, x + 57, y + 108, n, { col: on ? P.YEL : P.WHITE, a: 'm' }); txt(g, x + 57, y + 122, r, { f: 'vt', col: P.GREY, a: 'm' });
        if (on && !picked) txt(g, x + 57, y + 6, 'P1', { col: P.RED, a: 'm' }); });
      if (picked) { const u = ease((t - 5.4) / 0.3); rect(g, 135 - 120 * u, 368, 135 + 120 * u, 396, P.RED); if (u >= 1) txt(g, 135, 378, 'P1: ' + PL[PICK][0] + ' ' + SEL, { col: P.INK, a: 'm' }); }
      if (t > 6.4) { logoAny(LOGO, g, 135, 404, 1, false); button(g, 135, 432, CTA, blink(t)); }
    }
    return { dur: DUR, render: pixelOnly(render), cues: () => ({ dur: DUR, beds: [bed(DUR)], events: [cue('select', 0.2), ...path.slice(0, 5).map((_, i) => cue('tick', 1.0 + i * 0.8, 0.45)), cue('powerup', 5.4, 0.6), cue('coin', 6.4)] }) };
  }

  // ============================================ NEW CHALLENGER (9s, 1 shot)
  function pxvs() {
    const S1 = shot('s1', 'Event footage', 4.2), crt = CRT() === 'on';
    const EV = W_('event', 'FRIDAY NIGHT TOURNAMENT', 'Event name', 26), DATE = W_('date', 'DATE', 'Date', 20, 'When & where'), TIME = W_('time', 'TIME', 'Time', 20, 'When & where'), PLACE = W_('place', 'PLACE', 'Place', 26, 'When & where');
    const PRIZE = W_('prize', '', 'Prize or entry (optional)', 26, 'When & where'), CTA = W_('cta', 'SIGN UP', 'Button', 16, 'Call to action'), DUR = 9.0;
    function bg(t, P) { rect(g, 0, 0, 269, 479, P.INK); if (t < 2.2) { const on = blink(t, 6); rect(g, 0, 0, 269, 479, on ? P.DRED : P.INK); } scan(g); }
    function ui(t, P) {
      if (t < 2.2) { for (let x = -40; x < 300; x += 20) { const o = Math.floor(t * 40) % 20; poly(g, [[x + o, 96], [x + o + 10, 96], [x + o + 20, 106], [x + o + 10, 106]], P.YEL); poly(g, [[x - o, 360], [x - o + 10, 360], [x - o + 20, 370], [x - o + 10, 370]], P.YEL); }
        txt(g, 135, 150, 'WARNING!', { f: 'ps16', k: 2, col: blink(t, 4) ? P.YEL : P.RED, sh: P.INK, a: 'm' }); txt(g, 135, 210, 'HERE COMES A', { f: 'ps16', col: P.WHITE, a: 'm' }); txt(g, 135, 232, 'NEW CHALLENGER!', { f: 'ps16', col: P.WHITE, a: 'm' }); return; }
      const lt = t - 2.2; rectO(g, 18, 40, 251, 210, P.RED, 3);
      const ws = EV.split(' '); let a = '', b = ''; for (const w of ws) { if (!b && (a + ' ' + w).trim().length <= 15) a = (a + ' ' + w).trim(); else b = (b + ' ' + w).trim(); }
      txt(g, 135, 222, typed(a, lt, 20), { f: 'ps16', col: P.YEL, sh: P.DRED, a: 'm' }); if (b) txt(g, 135, 242, typed(b, lt - 0.6, 20), { f: 'ps16', col: P.YEL, sh: P.DRED, a: 'm' });
      [[DATE, 'DATE'], [TIME, 'TIME'], [PLACE, 'WHERE'], [PRIZE, 'PRIZE']].filter(r => r[0] && r[0].trim()).forEach(([v, k], i) => { const t0 = 1.2 + i * 0.35; if (lt < t0) return; const y = 278 + i * 24;
        rect(g, 18, y, 251, y + 18, P.PANEL); rect(g, 18, y, 72, y + 18, P.RED); txt(g, 45, y + 5, k, { col: P.INK, a: 'm' }); txt(g, 80, y + 5, typed(v, lt - t0, 30), { col: P.WHITE }); });
      if (lt > 3.0) { logoAny(LOGO, g, 135, 384, 1, false); button(g, 135, 420, CTA, blink(t)); }
    }
    const holes = t => (t < 2.2 ? [] : [{ s: S1, lt: t - 2.2, box: [21, 43, 228, 165], crt }]);
    return { dur: DUR, render: t => compose(t, bg, holes, ui), cues: () => ({ dur: DUR, beds: [['chip', 2.2, DUR, 0.5, { style: 'chip' }]], events: [cue('gameover', 0.1, 0.4), cue('hit', 0.9, 0.5), cue('hit', 1.5, 0.5), cue('powerup', 2.2, 0.6), cue('blip', 3.4), cue('blip', 3.75), cue('blip', 4.1), cue('coin', 5.2)] }) };
  }

  // ============================================ TOKEN BOARD (9s)
  function pxtokens() {
    const HEAD = W_('head', 'TOKEN BOARD', 'Title', 12), SUB = W_('sub', 'PICK YOUR PACK', 'Sub-line', 24);
    const PK = [1, 2, 3, 4].map(i => [W_('pack' + i, ['STARTER', 'PLAYER', 'PRO', 'PARTY'][i - 1], 'Pack ' + i + ' name', 12, 'Packs'), W_('tokens' + i, ['20 TOKENS', '50 TOKENS', '120 TOKENS', 'UP TO 10 KIDS'][i - 1], 'Pack ' + i + ' detail', 16, 'Packs'), W_('price' + i, '$XX', 'Pack ' + i + ' price', 7, 'Packs')]).filter(p => p[0] && p[0].trim());
    const FINE = w_('fine', '', 'Small print (optional)', 40, 'Packs'), CTA = W_('cta', 'INSERT TOKENS', 'Button', 18, 'Call to action'), DUR = 9.0;
    function coin(x, y, P) { ellipse(g, x, y, x + 13, y + 13, P.YEL, '#BE8C28', 2); txt(g, x + 7, y + 3, '$', { col: '#BE8C28', a: 'm' }); }
    function render(t) {
      const P = PX.begin(); stars(g, t, 4, 24); scan(g);
      txt(g, 135, 34, HEAD, { f: 'ps16', col: P.YEL, sh: P.DRED, a: 'm' }); txt(g, 135, 56, typed(SUB, t - 0.3, 30), { col: P.GREY, a: 'm' });
      PK.forEach(([n, d, p], i) => { const t0 = 0.9 + i * 0.6; if (t < t0) return; const y = 82 + i * 62, x = Math.round(-260 + 274 * ease((t - t0) / 0.3));
        rect(g, x, y, x + 241, y + 52, P.PANEL); rectO(g, x, y, x + 241, y + 52, i === PK.length - 1 && blink(t, 3) && t > 4 ? P.YEL : P.EDGE, 2);
        for (let k = 0; k < Math.min(4, i + 1); k++) coin(x + 8 + k * 6, y + 19 - k * 2, P);
        txt(g, x + 50, y + 10, n, { f: 'ps16', col: P.WHITE }); txt(g, x + 50, y + 30, d, { f: 'vt', col: P.GREY }); txt(g, x + 233, y + 18, p, { f: 'ps16', col: P.YEL, a: 'r' }); });
      if (FINE) txt(g, 135, 334, FINE, { f: 'vt', col: P.DIM, a: 'm' });
      if (t > 4.2) { logoAny(LOGO, g, 135, 352, 1, false); button(g, 135, 392, CTA, blink(t)); }
    }
    return { dur: DUR, render: pixelOnly(render), cues: () => ({ dur: DUR, beds: [bed(DUR)], events: [cue('coindrop', 0.1, 0.5), ...PK.map((_, i) => cue('coin', 0.9 + i * 0.6, 0.45)), cue('select', 4.2), cue('fanfare', 4.6, 0.5)] }) };
  }

  const MAKE = { pxcab, pxhud, pxtype, pxscores, pxselect, pxvs, pxtokens };
  const Pm = (MAKE[V] || pxcab)();
  DIR = { dur: Pm.dur, bg: BLK, finish: { vig: 0, grain: 0 }, edl: [], shakes: [], preload: () => Promise.all([PX.fontsP, K3.init ? K3.init() : null]), render: Pm.render, cues: Pm.cues };
});
