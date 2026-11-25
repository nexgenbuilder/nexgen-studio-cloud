'use strict';
/* NexGen Studio V27 (Nov 18): Pixel family, part 2 (needs engine/tpl_pixel.js, which defines PX).
   ?v=pxbf     Black Friday     BLACK FRIDAY slams in, the old price on a tag gets sliced, the new price drops, a % OFF burst
   ?v=pxthanks Thanksgiving     a pixel turkey, falling leaves, a thank-you line, then the old price struck and the new one
   ?v=pxloot   Loot Drop        a treasure chest opens, a LEGENDARY item card rises, the price drops from old to new
   ?v=pxba     Before & After   split screen: the business before (top) and after (bottom) in one of nine pixel scenes,
                                six stat lines each, a level counter, WHICH ONE IS YOURS?, then the ending card.
   Prices, offers and dates are fields: the defaults are Webflix's November sale and are replaced per clip. */
STUDIO_REG['pixel2'] = (() => {
  const V = QS.get('v') || 'pxbf';
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const { g, clamp, ease, bounce, typed, rng, rect, rectO, pt, line, ellipse, poly, txt, tw, sprite, people, logoAny, scan, stars, tri, button, wipe, flash, cue, bed } = PX;
  const isWF = /webflix/i.test((typeof BRAND !== 'undefined' && BRAND.name) || '') || !window.STUDIO;
  const LOGO = PX.logoSetup(isWF);
  const W_ = (k, d, label, max, group) => TX(k, d, { label, max, group: group || 'Words', upper: true });
  const w_ = (k, d, label, max, group) => TX(k, d, { label, max, group: group || 'Words' });
  const blink = (t, hz) => Math.floor(t * (hz || 3)) % 2 === 0;
  const C = (r, gg, b) => `rgb(${r},${gg},${b})`;
  const ORANGE = C(240, 130, 40), BROWN = C(120, 70, 35), DBROWN = C(70, 38, 20), GOLD = C(255, 196, 60);
  function grid(rows, pal, x, y, k) { for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) { const ch = rows[j][i]; if (ch !== '.' && pal[ch]) rect(g, x + i * k, y + j * k, x + i * k + k - 1, y + j * k + k - 1, pal[ch]); } }
  function priceDrop(cx, y, t0, t, was, now, k, col, P, o) {   // the old price struck through, then the new one bounces in
    if (t < t0) return; const [wx, wy] = (o && o.was) || [cx, y]; txt(g, wx, wy, was, { f: 'ps16', col: P.GREY, a: 'm' }); const w = tw(was, 'ps16');
    if (t > t0 + 0.35) { const u = clamp((t - t0 - 0.35) / 0.2); rect(g, wx - w / 2 - 3, wy + 6, wx - w / 2 - 3 + Math.round((w + 6) * u), wy + 8, P.RED); }
    if (t > t0 + 0.7) { const [nx, ny] = (o && o.now) || [cx, y + 24]; txt(g, nx, Math.round(ny - 84 + 84 * bounce((t - t0 - 0.7) / 0.5)), now, { f: 'ps16', k, col, sh: P.DRED, a: 'm' }); }
  }
  function confetti(t, t0, seed, n, P) { if (t < t0) return; const r = rng(seed || 4), cols = [P.RED, P.WHITE, P.YEL, P.GREEN];
    for (let i = 0; i < (n || 70); i++) { const x0 = Math.floor(r() * 270), sp = 50 + r() * 70, ph = r(), c = cols[Math.floor(r() * 4)]; const y = ((t - t0) * sp + ph * 480) % 480, x = x0 + Math.round(4 * Math.sin(t * 4 + ph * 9)); rect(g, x, y, x + 1, y + 2, c); } }
  function starburst(cx, cy, r, c, t) { const P = []; for (let i = 0; i < 24; i++) { const a = i / 24 * 2 * Math.PI + t * 0.8, rr = i % 2 === 0 ? r : r * 0.78; P.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); } poly(g, P, c); }
  const SALE = (who) => ({ was: W_('was', '$800', 'Old price', 8, 'Price'), now: W_('now', '$400', 'New price', 6, 'Price'), off: W_('off', '50%', 'Discount', 4, 'Price'),
    what: W_('what', 'WEBFLIX WEBSITES', 'What is on sale', 22, 'Offer'), when: W_('when', 'NOVEMBER ONLY', 'When it ends', 22, 'Offer'), cta: W_('cta', 'DM "START"', 'Button', 18, 'Call to action') });

  // ============================================ BLACK FRIDAY (10s)
  const TAG = ['....WWWWWWWWWWWWWWWWWWWWWW', '...WWWWWWWWWWWWWWWWWWWWWWW', '..WWWWWWWWWWWWWWWWWWWWWWWW', '.WW..WWWWWWWWWWWWWWWWWWWWW', 'WW....WWWWWWWWWWWWWWWWWWWW',
    'WW....WWWWWWWWWWWWWWWWWWWW', '.WW..WWWWWWWWWWWWWWWWWWWWW', '..WWWWWWWWWWWWWWWWWWWWWWWW', '...WWWWWWWWWWWWWWWWWWWWWWW', '....WWWWWWWWWWWWWWWWWWWWWW'];
  function pxbf() {
    const H1 = W_('head1', 'BLACK', 'Big word 1', 7), H2 = W_('head2', 'FRIDAY', 'Big word 2', 7), BAN = W_('banner', '* BOSS LEVEL SALE *', 'Banner', 28), S = SALE();
    const OFFL = W_('offlabel', 'OFF', 'Off label', 4);
    const DUR = 10.0;
    function render(t) {
      const P = PX.begin();
      if (t < 0.4) { if (Math.floor(t * 20) % 2) flash(g, C(30, 10, 16)); return; }
      scan(g); confetti(t, 4.4, 4, 70, P);
      const sh = (t > 0.9 && t < 1.2) || (t > 3.6 && t < 3.9) ? (rng(Math.floor(t * 40))() < 0.5 ? -2 : 2) : 0;
      const [h1x, h1y] = posOf(elP('head1'), [135, 44]); txt(g, h1x + sh, Math.round(-40 + (h1y + 40) * bounce((t - 0.4) / 0.4)), H1, { f: 'ps16', k: 2, col: P.WHITE, sh: P.EDGE, a: 'm' });
      if (t > 0.8) { const [h2x, h2y] = posOf(elP('head2'), [135, 84]); txt(g, h2x - sh, Math.round(-40 + (h2y + 40) * bounce((t - 0.8) / 0.4)), H2, { f: 'ps16', k: 2, col: P.RED, sh: P.DRED, a: 'm' }); }
      if (t > 1.6) { const [bnx, bny] = posOf(elP('banner'), [135, 163]); const u = ease((t - 1.6) / 0.3), bw = Math.round(250 * u); rect(g, bnx - bw / 2, bny - 5, bnx + bw / 2, bny + 13, P.RED); if (u >= 1) txt(g, bnx, bny, typed(BAN, t - 1.9, 40), { col: P.INK, a: 'm' }); }
      if (t > 2.4 && t < 4.8) {
        const [tgx, tgy] = posOf(elP('tag'), [31, 200]); const k = 8, twd = TAG[0].length * k, tx = tgx, ty = Math.round(tgy - 200 * (1 - bounce((t - 2.4) / 0.35))), split = clamp((t - 3.6) / 1.0);
        TAG.forEach((row, j) => { const off = Math.round(split * 60 * (j < 5 ? 1 : -1)), dy = j >= 5 ? Math.round(split * split * 220) : -Math.round(split * 120);
          for (let i = 0; i < row.length; i++) if (row[i] === 'W') rect(g, tx + i * k - off, ty + j * k + dy, tx + i * k - off + k - 1, ty + j * k + dy + k - 1, P.WHITE); });
        if (split === 0) txt(g, tgx + 120, tgy + 14, S.was, { f: 'ps16', k: 2, col: P.INK, a: 'm' });
        if (t > 3.4 && t < 3.75) { const x0 = Math.round(-20 + 320 * (t - 3.4) / 0.35); for (let s = -2; s <= 2; s++) line(g, [x0 - 60, 180 + s, x0, 320 + s], s ? P.WHITE : P.YEL); }
        if (t > 3.6 && t < 3.75) flash(g, P.WHITE);
      }
      if (t > 4.3) { const [wx, wy] = posOf(elP('was'), [135, 196]), [nx, ny] = posOf(elP('now'), [135, 224]); txt(g, wx, wy, S.was, { f: 'ps16', col: P.GREY, a: 'm' }); const w = tw(S.was, 'ps16'); rect(g, wx - w / 2 - 3, wy + 6, wx + w / 2 + 3, wy + 8, P.RED);
        txt(g, nx, Math.round(ny - 74 + 74 * bounce((t - 4.3) / 0.5)), S.now, { f: 'ps16', k: 3, col: P.YEL, sh: P.DRED, a: 'm' }); }
      if (t > 5.0) { const [ox, oy] = posOf(elP('off'), [222, 196]); const sc = 1 + 0.08 * Math.sin(t * 8); starburst(ox, oy, Math.round(30 * sc), P.RED, t); starburst(ox, oy, Math.round(24 * sc), blink(t, 4) ? P.WHITE : P.YEL, -t);
        txt(g, ox, oy - 10, S.off, { col: P.INK, a: 'm' }); txt(g, ox, oy + 2, OFFL, { col: P.INK, a: 'm' }); }
      if (t > 5.6) { const [wax, way] = posOf(elP('what'), [135, 290]); txt(g, wax, way, typed(S.what, t - 5.6, 30), { col: P.WHITE, a: 'm' }); const [wnx, wny] = posOf(elP('when'), [135, 308]); txt(g, wnx, wny, typed(S.when, t - 6.3, 30), { col: P.YEL, a: 'm' }); }
      if (t > 7.2) { const [lgx, lgy] = posOf(elP('logo'), [135, 340]); logoAny(LOGO, g, lgx, lgy, 2, false); const [cx, cy] = posOf(elP('cta'), [135, 396]); button(g, cx, cy, S.cta, blink(t)); }
    }
    function elements() {
      const [h1x, h1y] = posOf(elP('head1'), [135, 44]), [h2x, h2y] = posOf(elP('head2'), [135, 84]);
      const [bnx, bny] = posOf(elP('banner'), [135, 163]), [tgx, tgy] = posOf(elP('tag'), [31, 200]);
      const [wx, wy] = posOf(elP('was'), [135, 196]), [nx, ny] = posOf(elP('now'), [135, 224]), [ox, oy] = posOf(elP('off'), [222, 196]);
      const [wax, way] = posOf(elP('what'), [135, 290]), [wnx, wny] = posOf(elP('when'), [135, 308]);
      const [lgx, lgy] = posOf(elP('logo'), [135, 340]), [cx, cy] = posOf(elP('cta'), [135, 396]);
      return [
        { id: 'head1', kind: 'pos', label: H1, x: h1x, y: h1y, t0: 0.4, d: DUR - 0.4, box: [h1x - 90, h1y - 10, 180, 40], dup: false, del: false },
        { id: 'head2', kind: 'pos', label: H2, x: h2x, y: h2y, t0: 0.8, d: DUR - 0.8, box: [h2x - 90, h2y - 10, 180, 40], dup: false, del: false },
        { id: 'banner', kind: 'box', label: BAN, x: bnx, y: bny, w: 250, h: 18, t0: 1.6, d: DUR - 1.6, box: [bnx - 125, bny - 5, 250, 18], dup: false, del: false },
        { id: 'tag', kind: 'box', label: 'Price tag ' + S.was, x: tgx, y: tgy, w: 208, h: 80, t0: 2.4, d: 2.4, box: [tgx, tgy, 208, 80], dup: false, del: false },
        { id: 'was', kind: 'pos', label: 'Was ' + S.was, x: wx, y: wy, t0: 4.3, d: DUR - 4.3, box: [wx - 60, wy - 8, 120, 24], dup: false, del: false },
        { id: 'now', kind: 'pos', label: 'Now ' + S.now, x: nx, y: ny, t0: 5.0, d: DUR - 5.0, box: [nx - 80, ny - 12, 160, 48], dup: false, del: false },
        { id: 'off', kind: 'pos', label: S.off + ' ' + OFFL, x: ox, y: oy, t0: 5.0, d: DUR - 5.0, box: [ox - 30, oy - 30, 60, 60], dup: false, del: false },
        { id: 'what', kind: 'pos', label: S.what, x: wax, y: way, t0: 5.6, d: DUR - 5.6, box: [wax - 110, way - 4, 220, 16], dup: false, del: false },
        { id: 'when', kind: 'pos', label: S.when, x: wnx, y: wny, t0: 6.3, d: DUR - 6.3, box: [wnx - 110, wny - 4, 220, 16], dup: false, del: false },
        { id: 'logo', kind: 'pos', label: 'Logo', x: lgx, y: lgy, t0: 7.2, d: DUR - 7.2, box: [lgx - 60, lgy, 120, 40], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: S.cta, x: cx, y: cy, t0: 7.2, d: DUR - 7.2, box: [cx - 80, cy - 4, 160, 28], dup: false, del: false },
      ];
    }
    const cues = () => ({ dur: DUR, beds: [['chip', 1.6, DUR, 0.5, { style: 'chip' }]], events: [cue('hit', 0.4, 0.6), cue('hit', 0.8, 0.6), cue('select', 1.6), cue('drop', 2.4), cue('shoot', 3.4), cue('hit', 3.6, 0.6), cue('drop', 4.3), cue('powerup', 4.8, 0.6), cue('coin', 5.0), cue('fanfare', 7.2, 0.6)] });
    return { dur: DUR, render, cues, elements };
  }

  // ============================================ THANKSGIVING (10s)
  const TURKEY = ['....R..O..Y..R....', '...RRO.OO.YY.RR...', '..RROOYOOYYOORR...', '.RROOYYBBBBYYOORR.', '.ROOYYBBBBBBYYOOR.', '..OOYBBBBBBBBYOO..', '....BBBBBBBBHH....', '...BBBBBBBBHHHH...',
    '...BBBBBBBBHkHA...', '...BBBBBBBBHHHHA..', '...bBBBBBBBBHWW...', '....bBBBBBBBBW....', '.....bbBBBBbb.....', '......L....L......', '.....LLL..LLL.....'];
  const TPAL = { R: C(200, 50, 40), O: ORANGE, Y: GOLD, B: BROWN, b: DBROWN, H: C(190, 140, 100), k: '#120C16', A: C(240, 170, 40), W: C(220, 40, 50), L: C(240, 170, 40) };
  function pxthanks() {
    const TOP = W_('top', 'HAPPY', 'Small top line', 16), HEAD = W_('head', 'THANKSGIVING', 'Headline', 16), L1 = W_('line1', "WE'RE THANKFUL FOR", 'Thank-you line 1', 26), L2 = W_('line2', 'SMALL BUSINESSES', 'Thank-you line 2', 26);
    const L3 = w_('line3', "So here's our thanks:", 'Lead-in to the price', 30), S = SALE(), BAR = W_('offer', '50% OFF WEBSITES', 'Offer bar', 28, 'Offer');
    const DUR = 10.0;
    function leaves(t) { const r = rng(11), cols = [ORANGE, C(200, 60, 30), GOLD, C(150, 80, 30)]; for (let i = 0; i < 40; i++) { const x0 = Math.floor(r() * 270), sp = 20 + r() * 25, ph = r(), c = cols[Math.floor(r() * 4)]; const y = Math.round((t * sp + ph * 480) % 480), x = x0 + Math.round(10 * Math.sin(t * 1.5 + ph * 7)); rect(g, x, y, x + 2, y + 1, c); pt(g, x + 1, y - 1, c); } }
    function render(t) {
      const P = PX.begin(); g.fillStyle = C(34, 20, 16); g.fillRect(0, 0, 270, 480); g.fillStyle = C(40, 25, 19); for (let y = 0; y < 480; y += 3) g.fillRect(0, y, 270, 1);
      leaves(t);
      const [tpx, tpy] = posOf(elP('top'), [135, 40]); txt(g, tpx, tpy, typed(TOP, t - 0.2, 20), { col: GOLD, a: 'm' }); const [hx, hy] = posOf(elP('head'), [135, 56]); txt(g, hx, hy, typed(HEAD, t - 0.5, 20), { f: 'ps16', col: ORANGE, sh: DBROWN, a: 'm' });
      if (t > 1.0) { const [tkx, tky] = posOf(elP('turkey'), [135, 92]); const k = 6, twd = TURKEY[0].length * k, y = Math.round(tky - 212 + 212 * bounce((t - 1.0) / 0.6)) + Math.round(2 * Math.sin(t * 6)); grid(TURKEY, TPAL, tkx - twd / 2, y, k); rect(g, tkx - 95, tky + 104, tkx + 95, tky + 108, DBROWN); }
      if (t > 2.6) { const [l1x, l1y] = posOf(elP('line1'), [135, 214]); txt(g, l1x, l1y, typed(L1, t - 2.6, 30), { col: P.WHITE, a: 'm' }); const [l2x, l2y] = posOf(elP('line2'), [135, 230]); txt(g, l2x, l2y, typed(L2, t - 3.2, 30), { col: P.WHITE, a: 'm' }); }
      if (t > 4.0) { const [l3x, l3y] = posOf(elP('line3'), [135, 254]); txt(g, l3x, l3y, typed(L3, t - 4.0, 30), { f: 'vt', col: P.GREY, a: 'm' }); }
      const [wx, wy] = posOf(elP('was'), [135, 276]), [nx, ny] = posOf(elP('now'), [135, 300]); priceDrop(wx, wy, 4.6, t, S.was, S.now, 3, GOLD, P, { was: [wx, wy], now: [nx, ny] });
      if (t > 6.4) { const [ofx, ofy] = posOf(elP('offer'), [135, 366]); const bw = Math.round(240 * ease((t - 6.4) / 0.3)); rect(g, ofx - bw / 2, ofy - 6, ofx + bw / 2, ofy + 14, P.RED); if (bw >= 240) txt(g, ofx, ofy, BAR, { col: P.INK, a: 'm' }); const [wnx, wny] = posOf(elP('when'), [135, 388]); txt(g, wnx, wny, typed(S.when, t - 6.8, 30), { col: GOLD, a: 'm' }); }
      if (t > 7.6) { const [lgx, lgy] = posOf(elP('logo'), [135, 406]); logoAny(LOGO, g, lgx, lgy, 1, false); const [cx, cy] = posOf(elP('cta'), [135, 436]); button(g, cx, cy, S.cta, blink(t)); }
    }
    function elements() {
      const [tpx, tpy] = posOf(elP('top'), [135, 40]), [hx, hy] = posOf(elP('head'), [135, 56]), [tkx, tky] = posOf(elP('turkey'), [135, 92]);
      const [l1x, l1y] = posOf(elP('line1'), [135, 214]), [l2x, l2y] = posOf(elP('line2'), [135, 230]), [l3x, l3y] = posOf(elP('line3'), [135, 254]);
      const [wx, wy] = posOf(elP('was'), [135, 276]), [nx, ny] = posOf(elP('now'), [135, 300]);
      const [ofx, ofy] = posOf(elP('offer'), [135, 366]), [wnx, wny] = posOf(elP('when'), [135, 388]);
      const [lgx, lgy] = posOf(elP('logo'), [135, 406]), [cx, cy] = posOf(elP('cta'), [135, 436]);
      return [
        { id: 'top', kind: 'pos', label: TOP, x: tpx, y: tpy, t0: 0.2, d: DUR - 0.2, box: [tpx - 60, tpy - 4, 120, 16], dup: false, del: false },
        { id: 'head', kind: 'pos', label: HEAD, x: hx, y: hy, t0: 0.5, d: DUR - 0.5, box: [hx - 100, hy - 8, 200, 28], dup: false, del: false },
        { id: 'turkey', kind: 'pos', label: 'Turkey', x: tkx, y: tky, t0: 1.0, d: DUR - 1.0, box: [tkx - 54, tky - 28, 108, 118], dup: false, del: false },
        { id: 'line1', kind: 'pos', label: L1, x: l1x, y: l1y, t0: 2.6, d: DUR - 2.6, box: [l1x - 110, l1y - 4, 220, 16], dup: false, del: false },
        { id: 'line2', kind: 'pos', label: L2, x: l2x, y: l2y, t0: 3.2, d: DUR - 3.2, box: [l2x - 110, l2y - 4, 220, 16], dup: false, del: false },
        { id: 'line3', kind: 'pos', label: L3, x: l3x, y: l3y, t0: 4.0, d: DUR - 4.0, box: [l3x - 110, l3y - 4, 220, 16], dup: false, del: false },
        { id: 'was', kind: 'pos', label: 'Was ' + S.was, x: wx, y: wy, t0: 4.6, d: DUR - 4.6, box: [wx - 60, wy - 8, 120, 24], dup: false, del: false },
        { id: 'now', kind: 'pos', label: 'Now ' + S.now, x: nx, y: ny, t0: 5.3, d: DUR - 5.3, box: [nx - 80, ny - 12, 160, 48], dup: false, del: false },
        { id: 'offer', kind: 'box', label: BAR, x: ofx, y: ofy, w: 240, h: 20, t0: 6.4, d: DUR - 6.4, box: [ofx - 120, ofy - 6, 240, 20], dup: false, del: false },
        { id: 'when', kind: 'pos', label: S.when, x: wnx, y: wny, t0: 6.8, d: DUR - 6.8, box: [wnx - 110, wny - 4, 220, 16], dup: false, del: false },
        { id: 'logo', kind: 'pos', label: 'Logo', x: lgx, y: lgy, t0: 7.6, d: DUR - 7.6, box: [lgx - 30, lgy, 60, 20], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: S.cta, x: cx, y: cy, t0: 7.6, d: DUR - 7.6, box: [cx - 80, cy - 4, 160, 28], dup: false, del: false },
      ];
    }
    const cues = () => ({ dur: DUR, beds: [bed(DUR)], events: [cue('blip', 0.5), cue('drop', 1.0), cue('select', 1.6), cue('blip', 2.6), cue('tick', 4.6), cue('bonk', 4.95), cue('drop', 5.3), cue('powerup', 5.8, 0.6), cue('coin', 6.4), cue('fanfare', 7.6, 0.6)] });
    return { dur: DUR, render, cues, elements };
  }

  // ============================================ LOOT DROP (9s)
  const CHEST = ['..bbbbbbbbbbbbbbbbbb..', '.bBBBBBBBBBBBBBBBBBBb.', 'bBBBBBBBBBBBBBBBBBBBBb', 'bBBBBBBBBBBBBBBBBBBBBb', 'GGGGGGGGGGGGGGGGGGGGGG', 'bBBBBBBBBGGGGBBBBBBBBb',
    'bBBBBBBBBGkkGBBBBBBBBb', 'bBBBBBBBBGGGGBBBBBBBBb', 'bBBBBBBBBBBBBBBBBBBBBb', 'GGGGGGGGGGGGGGGGGGGGGG', 'bBBBBBBBBBBBBBBBBBBBBb', 'bbbbbbbbbbbbbbbbbbbbbb'];
  const CPAL = { b: DBROWN, B: C(150, 90, 45), G: GOLD, k: '#120C16' };
  function pxloot() {
    const HEAD = W_('head', 'LOOT DROP!', 'Headline', 12), ITEM = W_('item', 'WEBSITE', 'Item name', 16), RAR = W_('rarity', 'RARITY: LEGENDARY', 'Item tag', 24), S = SALE();
    const PRICEL = W_('pricelabel', 'PRICE', 'Price label', 8);
    const DUR = 9.0;
    function render(t) {
      const P = PX.begin(); stars(g, t, 3, 30); scan(g);
      const [hx, hy] = posOf(elP('head'), [135, 26]); txt(g, hx, hy, HEAD, { f: 'ps16', col: blink(t, 4) ? P.WHITE : P.YEL, sh: P.DRED, a: 'm' });
      const [chx, chy] = posOf(elP('chest'), [135, 262]); const k = 6, cw = CHEST[0].length * k, cx = chx - cw / 2, base = chy, shake = t > 0.6 && t < 1.6 ? [-2, 0, 2][Math.floor(rng(Math.floor(t * 30))() * 3)] : 0, open = t > 1.6;
      if (open) for (let i = 0; i < 9; i++) { const a = Math.PI * (0.15 + 0.7 * i / 8) + 0.05 * Math.sin(t * 3); line(g, [chx, base - 60, chx + Math.round(160 * Math.cos(a)), base - 60 - Math.round(160 * Math.sin(a))], i % 2 ? C(90, 70, 20) : C(140, 110, 30), 3); }
      const body = open ? CHEST.slice(4) : CHEST, by = base - body.length * k;
      if (open) grid(CHEST.slice(0, 4), CPAL, cx, by - 4 * k - 22, k);
      grid(body, CPAL, cx + shake, by, k);
      if (t > 1.6 && t < 3.6) { const r = rng(2), tt = t - 1.6; for (let i = 0; i < 22; i++) { const vx = -90 + r() * 180, vy = -200 + r() * 80; ellipse(g, Math.round(chx + vx * tt), Math.round(base - 60 + vy * tt + 160 * tt * tt), Math.round(chx + 5 + vx * tt), Math.round(base - 55 + vy * tt + 160 * tt * tt), GOLD); } }
      if (t > 2.2) { const [ix, iy] = posOf(elP('item'), [60, 60]); const cy = Math.round(iy + 132 - 132 * ease((t - 2.2) / 0.6)); rect(g, ix, cy, ix + 150, cy + 64, P.PANEL); rectO(g, ix, cy, ix + 150, cy + 64, GOLD, 2);
        logoAny(LOGO === 'none' ? 'none' : LOGO, g, ix + 75, cy + 8, 1, false); txt(g, ix + 75, cy + 32, ITEM, { col: P.WHITE, a: 'm' }); txt(g, ix + 75, cy + 46, RAR, { f: 'vt', col: GOLD, a: 'm' }); }
      if (t > 3.4) { const [pbx, pby] = posOf(elP('pricebox'), [20, 276]); rect(g, pbx, pby, pbx + 230, pby + 76, P.INK); rectO(g, pbx, pby, pbx + 230, pby + 76, P.WHITE, 2); txt(g, pbx + 10, pby + 8, PRICEL, { col: P.GREY }); }
      const [wx, wy] = posOf(elP('was'), [135, 284]), [nx, ny] = posOf(elP('now'), [135, 308]); priceDrop(wx, wy, 3.5, t, S.was, S.now, 2, P.YEL, P, { was: [wx, wy], now: [nx, ny] });
      if (t > 5.0) { const [ofx, ofy] = posOf(elP('off'), [135, 364]); txt(g, ofx, ofy, typed(S.off + ' OFF', t - 5.0, 20), { f: 'ps16', col: P.RED, sh: P.DRED, a: 'm' }); const [wnx, wny] = posOf(elP('when'), [135, 388]); txt(g, wnx, wny, typed(S.when, t - 5.4, 30), { col: P.YEL, a: 'm' }); }
      if (t > 6.6) { const [cx, cy] = posOf(elP('cta'), [135, 408]); button(g, cx, cy, S.cta, blink(t)); }
    }
    function elements() {
      const [hx, hy] = posOf(elP('head'), [135, 26]), [chx, chy] = posOf(elP('chest'), [135, 262]);
      const [ix, iy] = posOf(elP('item'), [60, 60]), [pbx, pby] = posOf(elP('pricebox'), [20, 276]);
      const [wx, wy] = posOf(elP('was'), [135, 284]), [nx, ny] = posOf(elP('now'), [135, 308]);
      const [ofx, ofy] = posOf(elP('off'), [135, 364]), [wnx, wny] = posOf(elP('when'), [135, 388]), [cx, cy] = posOf(elP('cta'), [135, 408]);
      return [
        { id: 'head', kind: 'pos', label: HEAD, x: hx, y: hy, t0: 0, d: DUR, box: [hx - 80, hy - 8, 160, 28], dup: false, del: false },
        { id: 'chest', kind: 'pos', label: 'Treasure chest', x: chx, y: chy, t0: 0, d: DUR, box: [chx - 66, chy - 72, 132, 72], dup: false, del: false },
        { id: 'item', kind: 'card', label: ITEM + ' · ' + RAR, x: ix, y: iy, w: 150, h: 64, t0: 2.2, d: DUR - 2.2, box: [ix, iy, 150, 64], dup: false, del: false },
        { id: 'pricebox', kind: 'box', label: PRICEL, x: pbx, y: pby, w: 230, h: 76, t0: 3.4, d: DUR - 3.4, box: [pbx, pby, 230, 76], dup: false, del: false },
        { id: 'was', kind: 'pos', label: 'Was ' + S.was, x: wx, y: wy, t0: 3.5, d: DUR - 3.5, box: [wx - 60, wy - 8, 120, 24], dup: false, del: false },
        { id: 'now', kind: 'pos', label: 'Now ' + S.now, x: nx, y: ny, t0: 4.2, d: DUR - 4.2, box: [nx - 80, ny - 12, 160, 48], dup: false, del: false },
        { id: 'off', kind: 'pos', label: S.off + ' OFF', x: ofx, y: ofy, t0: 5.0, d: DUR - 5.0, box: [ofx - 70, ofy - 8, 140, 28], dup: false, del: false },
        { id: 'when', kind: 'pos', label: S.when, x: wnx, y: wny, t0: 5.4, d: DUR - 5.4, box: [wnx - 110, wny - 4, 220, 16], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: S.cta, x: cx, y: cy, t0: 6.6, d: DUR - 6.6, box: [cx - 80, cy - 4, 160, 28], dup: false, del: false },
      ];
    }
    const cues = () => ({ dur: DUR, beds: [['chip', 1.6, DUR, 0.5, { style: 'chip' }]], events: [cue('tick', 0.6), cue('tick', 0.9), cue('tick', 1.2), cue('powerup', 1.6, 0.6), cue('coin', 2.2), cue('tick', 3.5), cue('bonk', 3.85), cue('drop', 4.2), cue('coin', 4.7), cue('fanfare', 5.0, 0.6), cue('select', 6.6)] });
    return { dur: DUR, render, cues, elements };
  }

  // ============================================ BEFORE & AFTER: scenes (each draws a 270x120 strip at oy)
  const INK = '#120C16', WH = '#F4F2F7', GRY = '#B8B4C0', DIMC = '#78727F', RD = '#FF3B52', DRD = '#5A0E1C', GRN = '#3DDC84', YL = '#FFD25A';
  const mk = oy => (x0, y0, x1, y1, c) => rect(g, x0, oy + y0, x1, oy + y1, c);
  const big = (x, y, p, t, o) => sprite(g, x, y, p, t + ((o && o.ph) || 0), 2, o);
  const DOGS = document.createElement('canvas'); DOGS.width = 14; DOGS.height = 10; const dg = DOGS.getContext('2d');
  function bigdog(x, y, t) { dg.clearRect(0, 0, 14, 10); const c = C(190, 130, 70), dk = C(120, 80, 40), x0 = 3, y0 = 9, wag = Math.floor(t * 6) % 2;
    rect(dg, x0, y0 - 4, x0 + 6, y0 - 2, c); rect(dg, x0 + 5, y0 - 7, x0 + 8, y0 - 4, c); pt(dg, x0 + 7, y0 - 6, INK); pt(dg, x0 + 9, y0 - 5, INK); pt(dg, x0 + 5, y0 - 8, dk);
    rect(dg, x0, y0 - 1, x0, y0, dk); rect(dg, x0 + 5, y0 - 1, x0 + 5, y0, dk); pt(dg, x0 - 1, y0 - 5 - wag, c); pt(dg, x0 - 2, y0 - 6 - wag, c);
    g.imageSmoothingEnabled = false; g.drawImage(DOGS, x - 6, y - 18, 28, 20); }
  function sign(oy, s, after, t, x0, x1, y, col) { x0 = x0 === undefined ? 86 : x0; x1 = x1 === undefined ? 192 : x1; y = y === undefined ? 6 : y; const R = mk(oy), cx = (x0 + x1) / 2;
    R(x0, y, x1, y + 15, after ? C(40, 14, 22) : C(35, 30, 34));
    if (after) { txt(g, cx + 1, oy + y + 5, s, { col: DRD, a: 'm' }); txt(g, cx, oy + y + 4, s, { col: col || RD, a: 'm' }); }
    else { const fl = Math.floor(t * 3.1) % 5 === 0; txt(g, cx, oy + y + 4, s.slice(0, -1) + (fl ? '' : s.slice(-1)), { col: C(105, 96, 104), a: 'm' }); } }
  function pings(oy, t, x0, y0) { for (let k = 0; k < 2; k++) { const pu = ((t + k * 0.9) % 1.8) / 1.8; if (pu < 0.8) txt(g, x0 + k * 18, oy + y0 - Math.round(28 * pu), '+1', { col: GRN, sh: INK }); } }
  const fly = (oy, t, x, y) => pt(g, Math.round(x + 14 * Math.sin(t * 2.3)), Math.round(oy + y + 6 * Math.sin(t * 5.1)), INK);
  const sparkle = (x, y) => { [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([a, b]) => pt(g, x + a, y + b, WH)); };

  function cafe(oy, t, after, S) {
    const R = mk(oy), ppl = people(14, 3);
    if (!after) {
      R(0, 0, 269, 99, C(75, 63, 69)); for (let i = 0; i < 270; i += 23) R(i, 0, i, 99, C(68, 57, 63)); line(g, [150, oy + 30, 156, oy + 40, 153, oy + 48], C(55, 46, 52));
      for (let i = 0; i < 270; i += 8) R(i, 100, i + 7, 119, (i / 8) % 2 ? C(58, 50, 54) : C(47, 40, 44));
      R(36, 26, 92, 74, C(40, 34, 38)); R(39, 29, 89, 71, C(110, 112, 118)); line(g, [42, oy + 32, 86, oy + 68], C(90, 92, 98)); R(63, 29, 64, 71, C(40, 34, 38));
      sign(oy, S, false, t); R(198, 26, 252, 60, C(50, 44, 40)); R(200, 28, 250, 58, C(44, 62, 52)); [30, 22, 36, 18].forEach((w, k) => R(204, 33 + k * 6, 204 + w, 33 + k * 6, C(78, 92, 82)));
      const cx = 120, cy = oy + 44; ellipse(g, cx - 7, cy - 7, cx + 7, cy + 7, C(230, 225, 215), C(40, 34, 38), 1); line(g, [cx, cy, cx + Math.round(5 * Math.sin(t * 0.8)), cy - Math.round(5 * Math.cos(t * 0.8))], INK);
      R(6, 40, 28, 99, C(60, 46, 40)); R(9, 44, 25, 70, C(95, 98, 104)); pt(g, 24, oy + 76, YL);
      R(66, 94, 92, 96, C(110, 90, 75)); R(78, 97, 80, 110, C(90, 74, 62)); big(94, oy + 112, people(1, 7)[0], t, { happy: false, item: 'phone', seated: true, face: -1 });
      big(214, oy + 93, BA_OWNER.cafe, t, { happy: false, item: 'paper', face: -1 });
      R(176, 82, 264, 107, C(95, 80, 70)); R(176, 82, 264, 84, C(120, 104, 92)); R(186, 72, 198, 82, C(120, 120, 126)); R(189, 75, 195, 78, C(80, 80, 86));
      for (let k = 0; k < 4; k++) R(240 - k, 78 - k * 2, 252 - k, 79 - k * 2, C(230, 225, 205));
      fly(oy, t, 140, 60); line(g, [0, oy, 10, oy + 10], C(110, 104, 112)); line(g, [0, oy + 6, 6, oy], C(110, 104, 112));
    } else {
      R(0, 0, 269, 99, C(156, 79, 53)); for (let row = 0; row < 100; row += 6) { const off = (row / 6) % 2 === 0 ? 0 : 7; R(0, row, 269, row, C(127, 62, 42)); for (let i = off; i < 270; i += 14) R(i, row, i, row + 5, C(127, 62, 42)); }
      for (let i = 0; i < 270; i += 10) { R(i, 100, i + 9, 119, (i / 10) % 2 ? C(120, 76, 40) : C(104, 64, 33)); R(i, 100, i, 119, C(80, 48, 24)); }
      line(g, [0, oy + 1, 269, oy + 1], C(60, 40, 30)); for (let i = 4; i < 270; i += 9) { const sag = Math.round(3 * Math.sin(i / 270 * Math.PI)); pt(g, i, oy + 2 + sag, (Math.floor(t * 4) + Math.floor(i / 9)) % 3 ? YL : C(150, 110, 50)); }
      R(36, 26, 92, 74, C(60, 40, 30)); R(39, 29, 89, 71, C(130, 200, 245)); R(39, 58, 89, 71, C(110, 185, 120)); R(63, 29, 64, 71, C(60, 40, 30));
      R(44, 66, 52, 74, C(200, 110, 60)); R(45, 58, 51, 65, C(61, 170, 90)); R(43, 61, 53, 62, C(61, 170, 90));
      sign(oy, S, true, t); R(198, 26, 252, 60, C(25, 25, 30)); R(200, 28, 250, 58, C(12, 12, 18)); [[26, YL], [20, WH], [30, GRN], [16, WH]].forEach(([w, c], k) => R(204, 32 + k * 6, 204 + w, 33 + k * 6, c));
      for (let qy = 0; qy < 5; qy++) for (let qx = 0; qx < 5; qx++) if ((qx * 3 + qy * 5 + qx * qy) % 3) pt(g, 240 + qx, oy + 46 + qy, WH);
      R(6, 40, 28, 99, C(90, 52, 30)); R(9, 44, 25, 99, C(255, 230, 170));
      const cyc = 3, u = (t % cyc) / cyc; if (u < 0.8) big(Math.round(16 + 70 * u), oy + 104, ppl[8 + Math.floor(t / cyc) % 4], t, { walk: true });
      const u2 = ((t + 1.5) % cyc) / cyc; if (u2 < 0.85) big(Math.round(92 - 84 * u2), oy + 106, ppl[(Math.floor(t / cyc) + 2) % 6 + 4], t, { walk: true, item: 'cup', face: -1 });
      big(204, oy + 93, BA_OWNER.cafe, t, { item: 'tablet', face: -1 }); big(236, oy + 93, ppl[13], t, { ph: 0.7, face: -1 });
      R(176, 82, 264, 107, C(120, 70, 40)); R(176, 82, 264, 84, C(180, 110, 60)); R(176, 104, 264, 107, RD); R(184, 70, 198, 82, C(200, 200, 210)); R(187, 73, 195, 77, C(60, 60, 70)); R(200, 76, 205, 82, C(30, 30, 36)); R(201, 77, 204, 80, GRN);
      for (let k = 0; k < 3; k++) { const p = (t * 12 + k * 3) % 9; pt(g, 190 + k * 2 + (Math.floor(p) % 2), oy + 68 - Math.floor(p), C(235, 235, 240)); }
      R(42, 96, 70, 98, C(140, 90, 55)); R(55, 99, 57, 110, C(110, 70, 40)); R(46, 93, 48, 95, WH); R(62, 93, 64, 95, WH);
      [47, 63].forEach(sx => { const p = (t * 10 + sx) % 8; pt(g, sx + (Math.floor(p) % 2), oy + 91 - Math.floor(p), C(240, 240, 240)); });
      big(26, oy + 114, ppl[0], t, { item: 'cup', seated: true }); big(72, oy + 114, ppl[1], t, { ph: 0.4, item: 'cup', seated: true, face: -1 }); bigdog(50, oy + 118, t);
      for (let q = 0; q < 4; q++) big(100 + q * 18, oy + 118, ppl[3 + q], t, { ph: q * 0.6 });
      pings(oy, t, 150, 70);
    }
  }
  function chair(R, x, red) { const c = red ? C(200, 40, 50) : C(110, 90, 90), m = C(150, 150, 160); R(x, 92, x + 14, 99, c); R(x + 12, 78, x + 15, 99, c); R(x + 5, 100, x + 8, 108, m); R(x + 1, 109, x + 12, 110, m); }
  function pole(oy, x, t, spin) { const R = mk(oy); R(x, 30, x + 7, 31, C(200, 200, 210)); R(x, 62, x + 7, 63, C(200, 200, 210)); const off = spin ? Math.floor(t * 12) : 0;
    for (let yy = 32; yy < 62; yy++) for (let xx = x + 1; xx < x + 7; xx++) { const k = (yy + xx + off) % 9; pt(g, xx, oy + yy, k < 3 ? RD : k < 6 ? WH : C(60, 90, 200)); } }
  function barbershop(oy, t, after, S) {
    const R = mk(oy), ppl = people(14, 5);
    if (!after) {
      R(0, 0, 269, 99, C(78, 72, 66)); for (let i = 0; i < 270; i += 18) R(i, 0, i, 99, C(70, 64, 59)); for (let i = 0; i < 270; i += 8) R(i, 100, i + 7, 119, (i / 8) % 2 ? C(66, 60, 58) : C(54, 48, 47));
      sign(oy, S, false, t); R(150, 24, 250, 70, C(60, 56, 52)); R(152, 26, 248, 68, C(95, 98, 104)); line(g, [160, oy + 30, 180, oy + 60], C(110, 112, 118));
      pole(oy, 20, t, false); chair(R, 170, false); chair(R, 220, false);
      R(40, 40, 70, 62, C(220, 210, 180)); txt(g, 55, oy + 47, 'WALK', { col: DIMC, a: 'm' }); txt(g, 55, oy + 55, 'INS?', { col: DIMC, a: 'm' });
      big(100, oy + 112, BA_OWNER.barbershop, t, { happy: false, item: 'phone', seated: true }); R(92, 100, 128, 104, C(90, 70, 60)); fly(oy, t, 200, 50);
    } else {
      R(0, 0, 269, 99, C(24, 30, 36)); for (let i = 0; i < 270; i += 30) R(i, 0, i + 1, 99, C(32, 40, 48)); for (let i = 0; i < 270; i += 10) R(i, 100, i + 9, 119, (i / 10) % 2 ? WH : INK); R(0, 112, 269, 119, C(30, 30, 34));
      sign(oy, S, true, t, undefined, undefined, undefined, C(80, 220, 255)); R(150, 24, 250, 70, C(180, 150, 60)); R(152, 26, 248, 68, C(170, 210, 235)); for (let k = 0; k < 3; k++) line(g, [156 + k * 30, oy + 28, 176 + k * 30, oy + 60], C(210, 235, 250));
      pole(oy, 20, t, true);
      [[170, 0, 1], [220, 2, 3]].forEach(([cx, cu, ba]) => { chair(R, cx, true); big(cx + 3, oy + 104, ppl[cu], t, { seated: true, face: -1 }); R(cx - 1, 84, cx + 12, 96, C(240, 240, 245));
        const bx = cx - 18 + Math.round(2 * Math.sin(t * 6 + cx)); big(bx, oy + 112, ppl[ba], t, { ph: cx * 0.1 }); if (Math.floor(t * 10 + cx) % 2) { pt(g, bx + 15, oy + 82, C(230, 230, 230)); pt(g, bx + 17, oy + 80, C(200, 200, 200)); } });
      R(40, 98, 120, 101, C(120, 70, 40)); R(42, 102, 44, 110, C(90, 50, 30)); R(116, 102, 118, 110, C(90, 50, 30));
      for (let q = 0; q < 3; q++) big(46 + q * 24, oy + 104, ppl[5 + q], t, { ph: q, seated: true, item: q === 1 ? 'phone' : undefined });
      pings(oy, t, 110, 60);
    }
  }
  function pizza(oy, t, after, S) {
    const R = mk(oy), ppl = people(14, 8);
    if (!after) {
      R(0, 0, 269, 99, C(80, 66, 60)); for (let i = 0; i < 270; i += 8) R(i, 100, i + 7, 119, (i / 8) % 2 ? C(60, 52, 50) : C(48, 42, 41)); sign(oy, S, false, t);
      R(180, 30, 250, 82, C(90, 84, 80)); ellipse(g, 192, oy + 46, 238, oy + 92, C(30, 26, 26), null, 0, true);
      R(176, 82, 264, 107, C(95, 80, 70)); R(176, 82, 264, 84, C(120, 104, 92)); big(150, oy + 112, BA_OWNER.pizza, t, { happy: false });
      R(30, 30, 80, 62, C(60, 56, 52)); R(33, 33, 77, 59, C(110, 112, 118)); R(70, 96, 92, 97, C(110, 90, 75)); R(80, 98, 82, 110, C(90, 74, 62));
      R(20, 40, 34, 70, C(230, 225, 210)); txt(g, 27, oy + 50, '?', { col: DIMC, a: 'm' }); fly(oy, t, 120, 50);
    } else {
      R(0, 0, 269, 99, C(150, 60, 40)); for (let row = 0; row < 100; row += 6) { const off = (row / 6) % 2 === 0 ? 0 : 7; R(0, row, 269, row, C(120, 46, 30)); for (let i = off; i < 270; i += 14) R(i, row, i, row + 5, C(120, 46, 30)); }
      for (let i = 0; i < 270; i += 10) R(i, 100, i + 9, 119, (i / 10) % 2 ? C(230, 230, 230) : C(200, 40, 50)); sign(oy, S, true, t, undefined, undefined, undefined, C(255, 200, 80));
      R(180, 30, 250, 82, C(170, 90, 60)); ellipse(g, 192, oy + 46, 238, oy + 92, C(40, 20, 10), null, 0, true);
      for (let k = 0; k < 10; k++) { const fx = 200 + (k * 7) % 30, fh = 4 + Math.floor(4 * Math.abs(Math.sin(t * 9 + k))); R(fx, 68 - fh, fx + 2, 68, k % 2 ? YL : C(255, 120, 30)); }
      R(176, 82, 264, 107, C(120, 70, 40)); R(176, 82, 264, 84, C(180, 110, 60)); R(176, 104, 264, 107, GRN);
      for (let k = 0; k < 4; k++) { R(230, 74 - k * 4, 252, 77 - k * 4, C(230, 200, 150)); line(g, [230, oy + 77 - k * 4, 252, oy + 77 - k * 4], C(180, 140, 90)); }
      big(196, oy + 93, BA_OWNER.pizza, t, { face: -1 }); ellipse(g, 184, oy + 78, 200, oy + 84, C(240, 170, 60)); pt(g, 189, oy + 80, RD); pt(g, 194, oy + 81, RD);
      R(20, 30, 70, 62, C(90, 50, 30)); R(23, 33, 67, 59, C(12, 12, 18)); [[30, YL], [22, WH], [36, GRN], [18, WH]].forEach(([w, c], k) => R(27, 37 + k * 5, 27 + w, 38 + k * 5, c));
      R(84, 96, 108, 97, C(140, 90, 55)); R(95, 98, 97, 110, C(110, 70, 40)); ellipse(g, 88, oy + 92, 104, oy + 96, C(240, 170, 60));
      big(70, oy + 114, ppl[0], t, { seated: true }); big(110, oy + 114, ppl[1], t, { ph: 0.5, seated: true, face: -1 }); for (let q = 0; q < 3; q++) big(130 + q * 16, oy + 118, ppl[3 + q], t, { ph: q * 0.6 });
      const u = (t % 3) / 3; if (u < 0.85) { const dx = Math.round(160 - 150 * u); big(dx, oy + 106, ppl[9], t, { walk: true, face: -1 }); R(dx - 4, 82, dx + 6, 88, C(230, 200, 150)); }
      pings(oy, t, 120, 60);
    }
  }
  // house exteriors
  function sky(R, after) {
    if (after) { R(0, 0, 269, 70, C(120, 190, 245)); R(0, 50, 269, 70, C(150, 210, 250)); for (let x = 0; x < 270; x += 16) R(x, 64, x + 14, 74, C(70, 150, 80)); R(0, 72, 269, 91, C(100, 175, 90)); }
    else { R(0, 0, 269, 70, C(130, 130, 140)); R(0, 50, 269, 70, C(145, 145, 150)); for (let x = 0; x < 270; x += 16) R(x, 64, x + 14, 74, C(100, 105, 90)); R(0, 72, 269, 91, C(125, 125, 95)); }
  }
  const cloud = (oy, x, y, c) => { rect(g, x, oy + y, x + 20, oy + y + 4, c); rect(g, x + 4, oy + y - 3, x + 14, oy + y, c); };
  function house(oy, x, wall, roof, dirty, lit) {
    const R = mk(oy); R(x, 40, x + 90, 92, wall); for (let k = 0; k < 18; k++) R(x - 6 + k, 40 - k, x + 96 - k, 40 - k, roof); R(x + 60, 8, x + 68, 24, C(110, 60, 50));
    const win = lit === false ? C(90, 100, 110) : C(255, 230, 150); [x + 10, x + 62].forEach(wx => { R(wx, 52, wx + 18, 68, C(240, 240, 240)); R(wx + 2, 54, wx + 16, 66, win); R(wx + 9, 54, wx + 9, 66, C(240, 240, 240)); });
    R(x + 36, 60, x + 52, 92, C(120, 60, 40)); pt(g, x + 49, oy + 77, YL);
    if (dirty) { const r = rng(3); for (let i = 0; i < 60; i++) { const sx = x + Math.floor(r() * 90), sy = 41 + Math.floor(r() * 51); line(g, [sx, oy + sy, sx, oy + Math.min(92, sy + 3 + Math.floor(r() * 9))], C(90, 85, 70)); } }
  }
  function car(oy, x, y, body, t, shine, dusty, flip) {
    const R = mk(oy); R(x, y - 8, x + 32, y - 2, body); R(x + 6, y - 14, x + 24, y - 9, body); R(x + 8, y - 13, x + 14, y - 9, C(170, 210, 240)); R(x + 16, y - 13, x + 22, y - 9, C(170, 210, 240));
    [x + 5, x + 23].forEach(wx => { R(wx, y - 3, wx + 5, y + 1, INK); R(wx + 2, y - 2, wx + 3, y, GRY); }); R(flip ? x : x + 31, y - 7, flip ? x + 1 : x + 32, y - 6, YL);
    if (shine && Math.floor(t * 3 + x) % 4 === 0) { pt(g, x + 10, oy + y - 7, WH); pt(g, x + 11, oy + y - 8, WH); }
    if (dusty) { const r = rng(x + 1); for (let i = 0; i < 14; i++) pt(g, x + Math.floor(r() * 32), oy + y - 2 - Math.floor(r() * 12), C(150, 140, 120)); }
  }
  function van(oy, x, y, body, label) { const R = mk(oy); R(x, y - 22, x + 60, y - 3, body); R(x + 50, y - 20, x + 58, y - 11, C(170, 210, 240)); R(x + 2, y - 17, x + 46, y - 7, WH);
    txt(g, x + 24, oy + y - 16, String(label || '').slice(0, 5), { col: body, a: 'm' }); [x + 6, x + 46].forEach(wx => { R(wx, y - 4, wx + 6, y + 1, INK); R(wx + 2, y - 3, wx + 4, y - 1, GRY); }); }
  const lawn = (R, after) => { if (after) for (let i = 0; i < 270; i += 12) R(i, 92, i + 11, 119, (i / 12) % 2 ? C(80, 180, 80) : C(70, 160, 70)); else R(0, 92, 269, 119, C(130, 140, 70)); };
  function landscaping(oy, t, after, S, VAN) {
    const R = mk(oy), ppl = people(10, 4); sky(R, after); cloud(oy, 30 + (Math.round(t * 4) % 300) - 30, 14, after ? WH : C(170, 170, 175));
    house(oy, 150, after ? C(230, 220, 200) : C(180, 170, 150), after ? C(150, 70, 50) : C(110, 90, 80), false, true);
    if (!after) { R(0, 88, 269, 119, C(120, 120, 60)); const r = rng(1), cols = [C(110, 130, 50), C(150, 140, 70), C(90, 110, 40), C(160, 130, 80)];
      for (let i = 0; i < 260; i++) { const x = Math.floor(r() * 270), h = 6 + Math.floor(r() * 16), c = cols[Math.floor(r() * 4)]; line(g, [x, oy + 119, x + Math.round(1.5 * Math.sin(t * 2 + x)), oy + 119 - h], c); }
      R(40, 30, 44, 92, C(90, 70, 50)); line(g, [42, oy + 40, 30, oy + 28], C(90, 70, 50)); line(g, [42, oy + 46, 56, oy + 34], C(90, 70, 50)); }
    else { for (let i = 0; i < 270; i += 12) R(i, 88, i + 11, 119, (i / 12) % 2 ? C(80, 180, 80) : C(70, 160, 70)); R(150, 84, 240, 92, C(60, 140, 60)); for (let k = 0; k < 6; k++) ellipse(g, 150 + k * 15, oy + 80, 164 + k * 15, oy + 92, C(60, 150, 60));
      const r = rng(2), fl = [RD, YL, C(240, 120, 200)]; for (let i = 0; i < 14; i++) pt(g, 150 + Math.floor(r() * 90), oy + 82 + Math.floor(r() * 8), fl[Math.floor(r() * 3)]);
      ellipse(g, 28, oy + 20, 58, oy + 54, C(60, 160, 70)); R(41, 54, 45, 90, C(110, 70, 40)); van(oy, 70, 100, C(40, 130, 60), VAN);
      const u = (t % 4) / 4, mx = Math.round(10 + 230 * (u < 0.5 ? u : 1 - u)), face = u < 0.5 ? 1 : -1; big(mx, oy + 117, ppl[1], t, { walk: true, face }); R(mx + (face > 0 ? 14 : -12), 110, mx + (face > 0 ? 24 : -2), 116, RD); pings(oy, t, 100, 60); }
  }
  function pressure(oy, t, after, S, VAN) {
    const R = mk(oy), ppl = people(10, 6); sky(R, after); house(oy, 120, after ? C(235, 235, 240) : C(170, 160, 140), C(70, 80, 100), !after, true);
    R(0, 92, 269, 119, after ? C(110, 150, 80) : C(110, 110, 80)); R(130, 92, 200, 119, after ? C(210, 210, 215) : C(120, 115, 100));
    if (!after) { const r = rng(5); for (let i = 0; i < 40; i++) { const x = 130 + Math.floor(r() * 68), y = 93 + Math.floor(r() * 25); R(x, y, x + 2 + Math.floor(r() * 4), y + 1, r() < 0.5 ? C(80, 90, 60) : C(70, 65, 55)); }
      R(20, 60, 100, 92, C(140, 120, 90)); for (let k = 0; k < 11; k++) line(g, [20 + k * 8, oy + 60, 20 + k * 8, oy + 92], C(110, 95, 70)); car(oy, 150, 112, C(120, 110, 100), t, false, true); }
    else { R(20, 60, 100, 92, C(230, 210, 170)); for (let k = 0; k < 11; k++) line(g, [20 + k * 8, oy + 60, 20 + k * 8, oy + 92], C(200, 180, 140)); van(oy, 202, 114, C(40, 110, 200), VAN);
      big(150, oy + 116, ppl[2], t, { face: -1 }); const jx = 140 - Math.round(40 * Math.sin(t * 2.4)); for (let k = 0; k < 12; k++) pt(g, 148 - Math.floor(k * (148 - jx) / 12), oy + 100 + Math.floor(k / 3), k % 2 ? C(200, 230, 255) : WH);
      const r = rng(Math.floor(t * 10) + 1); for (let i = 0; i < 8; i++) pt(g, jx - 4 + Math.floor(r() * 8), oy + 101 + Math.floor(r() * 7), C(190, 230, 255));
      [[60, 70], [170, 100], [230, 60]].forEach(([sx, sy]) => { if (Math.floor(t * 4 + sx) % 3 === 0) sparkle(sx, oy + sy); }); pings(oy, t, 30, 50); }
  }
  function hvac(oy, t, after, S, VAN) {
    const R = mk(oy), ppl = people(10, 9); sky(R, after);
    if (!after) { R(0, 0, 269, 70, C(230, 160, 90)); R(0, 50, 269, 70, C(240, 190, 110)); ellipse(g, 220, oy + 6, 250, oy + 36, C(255, 220, 80));
      for (let k = 0; k < 5; k++) { const y = 20 + k * 10, ph = t * 3 + k; for (let x = 10; x < 200; x += 3) pt(g, x, oy + y + Math.round(2 * Math.sin(x / 8 + ph)), C(250, 200, 130)); } }
    house(oy, 100, C(220, 210, 190), C(130, 70, 50), false, after); lawn(R, after);
    if (!after) { R(100, 92, 269, 119, C(170, 150, 90)); R(210, 74, 244, 96, C(130, 100, 70)); R(213, 77, 241, 93, C(90, 70, 50)); line(g, [216, oy + 80, 238, oy + 90], C(60, 45, 30)); line(g, [216, oy + 90, 238, oy + 80], C(60, 45, 30));
      txt(g, 227, oy + 62, '...', { col: C(120, 60, 40), a: 'm' }); R(112, 54, 126, 66, C(255, 170, 140)); pt(g, 116, oy + 58, INK); pt(g, 122, oy + 58, INK); if (Math.floor(t * 4) % 2) pt(g, 126, oy + 61, C(120, 200, 255));
      txt(g, 40, oy + 74, 'HOT!', { col: RD, a: 'm' }); }
    else { R(210, 74, 244, 96, C(200, 205, 215)); R(213, 77, 241, 93, C(60, 64, 72)); for (let k = 0; k < 4; k++) { const a = t * 14 + k * Math.PI / 2; line(g, [227, oy + 85, 227 + Math.round(7 * Math.cos(a)), oy + 85 + Math.round(7 * Math.sin(a))], C(200, 220, 240)); }
      for (let k = 0; k < 5; k++) { const p = (t * 1.2 + k * 0.2) % 1; pt(g, 228 + Math.round(14 * Math.sin(k * 2.1 + t)), oy + 70 - Math.round(30 * p), C(190, 230, 255)); }
      van(oy, 20, 114, C(220, 60, 50), VAN); big(180, oy + 116, ppl[3], t, { face: 1, item: 'tablet' }); R(112, 54, 126, 66, C(255, 214, 170)); pt(g, 116, oy + 58, INK); pt(g, 122, oy + 58, INK); pt(g, 119, oy + 62, C(150, 50, 60)); pings(oy, t, 70, 40); }
  }
  function estate(oy, t, after, S) {
    const R = mk(oy), ppl = people(10, 12); sky(R, after); cloud(oy, 20, 12, after ? WH : C(170, 170, 175));
    house(oy, 130, after ? C(240, 236, 225) : C(190, 180, 165), after ? C(60, 70, 90) : C(100, 95, 95), false, after); lawn(R, after); R(166, 92, 182, 119, C(200, 200, 200)); R(60, 64, 62, 100, C(120, 90, 60));
    if (!after) { R(40, 66, 90, 84, C(200, 190, 170)); txt(g, 65, oy + 71, 'FOR SALE', { col: C(140, 60, 60), a: 'm' }); line(g, [40, oy + 66, 90, oy + 84], C(160, 150, 130));
      const r = rng(4); for (let i = 0; i < 50; i++) { const x = Math.floor(r() * 270); line(g, [x, oy + 119, x, oy + 112 - Math.floor(r() * 4)], C(110, 120, 60)); } }
    else { R(38, 64, 92, 86, RD); R(40, 66, 90, 84, WH); txt(g, 65, oy + 72, 'SOLD!', { col: RD, a: 'm' });
      [RD, YL, C(90, 160, 240)].forEach((c, k) => { const bx = 110 + k * 7, by = 40 + Math.round(3 * Math.sin(t * 2 + k)); ellipse(g, bx, oy + by, bx + 6, oy + by + 8, c); line(g, [bx + 3, oy + by + 9, 118, oy + 80], GRY); });
      big(196, oy + 116, ppl[1], t, { face: -1 }); big(214, oy + 116, ppl[2], t, { ph: 0.3, face: -1 }); big(100, oy + 116, BA_OWNER.real_estate, t, { face: 1, item: 'tablet' });
      const dx = 30 + Math.round(200 * (0.5 + 0.5 * Math.sin(t * 0.7))), dy = 18 + Math.round(4 * Math.sin(t * 3)), bl = Math.floor(t * 20) % 2 ? GRY : WH; R(dx, dy, dx + 10, dy + 2, C(40, 40, 48)); R(dx - 2, dy - 1, dx + 1, dy - 1, bl); R(dx + 9, dy - 1, dx + 12, dy - 1, bl); pt(g, dx + 5, oy + dy + 3, RD);
      car(oy, 230, 118, C(70, 140, 220), t, true, false, true); }
  }
  function carpet(oy, t, after, S, VAN) {
    const R = mk(oy), ppl = people(10, 14);
    R(0, 0, 269, 99, after ? C(210, 200, 180) : C(150, 140, 125)); R(0, 96, 269, 119, after ? C(190, 160, 130) : C(150, 120, 95));
    R(150, 20, 220, 60, C(240, 240, 240)); R(153, 23, 217, 57, after ? C(150, 210, 245) : C(120, 125, 130)); R(185, 23, 186, 57, C(240, 240, 240));
    const cA = after ? C(90, 110, 160) : C(100, 95, 110), cB = after ? C(70, 90, 140) : C(85, 80, 95); R(20, 68, 110, 96, cA); R(16, 62, 26, 96, cB); R(104, 62, 114, 96, cB);
    R(240, 50, 242, 96, C(60, 50, 40)); poly(g, [[232, oy + 40], [250, oy + 40], [246, oy + 50], [236, oy + 50]], after ? C(255, 220, 150) : C(160, 150, 120));
    if (!after) { const r = rng(7), sc = [C(110, 80, 50), C(90, 70, 60), C(120, 60, 60)]; for (let i = 0; i < 9; i++) { const x = 10 + Math.floor(r() * 240), y = 100 + Math.floor(r() * 16); ellipse(g, x, oy + y, x + 6 + Math.floor(r() * 8), oy + y + 3 + Math.floor(r() * 2), sc[Math.floor(r() * 3)]); }
      bigdog(130, oy + 112, t); big(50, oy + 96, ppl[0], t, { happy: false, seated: true }); fly(oy, t, 200, 80); }
    else { for (let k = 0; k < 270; k += 18) R(k, 96, k + 8, 119, C(200, 172, 142)); [[40, 110], [120, 104], [200, 112]].forEach(([sx, sy]) => { if (Math.floor(t * 4 + sx) % 3 === 0) sparkle(sx, oy + sy); });
      van(oy, 155, 56, C(120, 60, 180), VAN); big(40, oy + 96, ppl[0], t, { seated: true }); big(62, oy + 96, ppl[1], t, { ph: 0.4, seated: true }); bigdog(90, oy + 98, t);
      const tx = 150 + Math.round(40 * Math.sin(t * 1.5)); big(tx, oy + 116, ppl[3], t, { face: -1 }); line(g, [tx - 2, oy + 96, tx - 14, oy + 116], C(80, 80, 90)); R(tx - 20, 115, tx - 10, 117, C(80, 80, 90));
      R(230, 104, 250, 116, C(230, 230, 240)); R(232, 106, 248, 110, C(120, 60, 180)); pings(oy, t, 20, 40); }
  }
  function dealer(oy, t, after, S) {
    const R = mk(oy), ppl = people(12, 15); sky(R, after); cloud(oy, 160, 10, after ? WH : C(170, 170, 175));
    R(170, 30, 269, 92, after ? C(230, 230, 235) : C(170, 168, 165)); R(176, 40, 262, 80, after ? C(150, 200, 235) : C(110, 115, 120)); sign(oy, S, after, t, 174, 266, 30);
    R(0, 92, 269, 119, after ? C(90, 90, 96) : C(110, 108, 104)); for (let k = 0; k < 170; k += 40) R(k + 30, 108, k + 31, 119, after ? C(230, 230, 230) : C(150, 148, 140));
    if (!after) { [10, 60].forEach(x => car(oy, x, 104, C(130, 125, 115), t, false, true)); line(g, [0, oy + 30, 170, oy + 30], C(120, 120, 120)); for (let k = 0; k < 170; k += 10) poly(g, [[k, oy + 30], [k + 6, oy + 30], [k + 3, oy + 36]], C(130, 110, 110));
      big(130, oy + 112, BA_OWNER.car_dealership, t, { happy: false, face: -1 }); const r = rng(9); for (let k = 0; k < 30; k++) pt(g, Math.floor(r() * 270), oy + 93 + Math.floor(r() * 25), C(85, 82, 80)); }
    else { line(g, [0, oy + 30, 170, oy + 30], C(200, 200, 200)); const fc = [RD, YL, C(60, 120, 230)]; for (let k = 0; k < 170; k += 10) poly(g, [[k, oy + 30], [k + 6, oy + 30], [k + 3, oy + 37 + Math.round(2 * Math.sin(t * 6 + k))]], fc[(k / 10) % 3]);
      [C(220, 40, 50), C(40, 90, 200), C(240, 240, 245), C(30, 30, 34)].forEach((c, i) => car(oy, 6 + i * 40, 104 + (i % 2) * 12, c, t, true));
      const bx = 150, by = 92, sw = Math.sin(t * 7), OR2 = C(255, 140, 30); for (let s = 0; s < 10; s++) { const sx = bx + Math.round(sw * s * 0.8 * (s > 4 ? 1 : 0.4)); rect(g, sx, oy + by - s * 4 - 4, sx + 5, oy + by - s * 4, OR2); }
      const hx = bx + Math.round(sw * 8); rect(g, hx - 1, oy + by - 46, hx + 6, oy + by - 40, OR2); pt(g, hx + 1, oy + by - 44, INK); pt(g, hx + 4, oy + by - 44, INK);
      line(g, [hx - 1, oy + by - 34, hx - 8, oy + by - 40 + Math.round(6 * Math.cos(t * 9))], OR2, 2); line(g, [hx + 6, oy + by - 34, hx + 13, oy + by - 40 - Math.round(6 * Math.cos(t * 9))], OR2, 2);
      big(196, oy + 116, BA_OWNER.car_dealership, t, { face: -1, item: 'tablet' }); big(214, oy + 116, ppl[4], t, { ph: 0.5, face: -1 }); const u = (t % 3) / 3; if (u < 0.9) big(Math.round(20 + 160 * u), oy + 119, ppl[6], t, { walk: true }); pings(oy, t, 60, 50); }
  }
  const BA_OWNER = { cafe: ['#E9B482', '#281C16', '#F4F2F7', '#323238', 'bun'], barbershop: ['#8D5536', '#1E1E22', '#1E1E22', '#323238', 'bald'], pizza: ['#E9B482', '#281C16', '#F4F2F7', '#323238', 'short'],
    real_estate: ['#E9B482', '#281C16', '#1E1E22', '#1E1E28', 'bun'], car_dealership: ['#C6865A', '#1E1E22', '#F4F2F7', '#1E1E28', 'short'] };
  const SCENES = { cafe, barbershop, pizza, landscaping, pressure_washing: pressure, hvac, real_estate: estate, carpet_cleaning: carpet, car_dealership: dealer };
  // starting words for each scene (sample copy: the ✓ lines must match what you actually deliver)
  const BA = {
    cafe: { name: 'Coffee shop', sign: 'MAIN ST CAFE', t: ['TWO COFFEE SHOPS.', 'SAME STREET.', 'ONE LEVELED UP.'], b: ['Old website from 2014', 'No online ordering', 'Inventory? Just guessing', 'Books kept on paper', 'No photos or video posts', 'No way to bring regulars back'], a: ['Fast mobile website', 'Online orders 24/7', 'Live inventory tracking', 'Sales dashboard, no paper', 'Fresh video content daily', 'Loyalty rewards that work'] },
    barbershop: { name: 'Barbershop', sign: 'FRESH CUTS', t: ['TWO BARBERSHOPS.', 'SAME BLOCK.', 'ONE IS BOOKED.'], b: ['Website? Just an old Facebook', 'Phone tag for appointments', 'Walk-ins only, empty chairs', 'No photos of your best cuts', 'Paper appointment book', 'No reason for clients to return'], a: ['Sharp mobile website', 'Online booking 24/7', 'Text reminders, fewer no-shows', 'Daily videos of fresh cuts', 'Easy to find on Google', 'Rewards that bring clients back'] },
    pizza: { name: 'Pizza shop', sign: "TONY'S PIZZA", t: ['TWO PIZZA SHOPS.', 'SAME TOWN.', 'ONE IS SLAMMED.'], b: ['Paper menu, no website', 'Orders only by phone', 'Specials nobody ever sees', 'No food photos or videos', 'Slow weeknights', 'Customers forget you exist'], a: ['Mouth-watering menu website', 'Online ordering 24/7', 'Daily specials posted', 'Fresh food videos daily', 'Easy to find on Google', 'Loyalty rewards for regulars'] },
    landscaping: { name: 'Landscaping', sign: 'GREEN CREW', van: 'MOW', t: ['TWO LANDSCAPERS.', 'SAME NEIGHBORHOOD.', 'ONE GOT THE JOB.'], b: ['No website, word of mouth only', 'Missed calls = missed jobs', 'Best work stuck on a phone', 'Quotes on scraps of paper', 'Not showing up on Google', 'Slow season, empty schedule'], a: ['Website that shows your work', 'Online quote requests', 'Before & after gallery', 'Easy to find on Google', 'Videos of every finished yard', 'Full schedule all season'] },
    pressure_washing: { name: 'Pressure washing', sign: 'SPARKLE WASH', van: 'WASH', t: ['TWO WASH COMPANIES.', 'SAME TOWN.', 'ONE SHINES.'], b: ['No website to send people to', 'Results nobody gets to see', 'Quotes by text, then ghosted', 'No reviews on display', 'Invisible on Google', 'Waiting for the phone to ring'], a: ['Website as clean as your work', 'Before & after showcase', 'Instant online quotes', 'Reviews front and center', 'Easy to find on Google', 'Satisfying videos daily'] },
    hvac: { name: 'HVAC', sign: 'COOL AIR CO', van: 'HVAC', t: ['TWO HVAC COMPANIES.', 'SAME HEAT WAVE.', 'ONE GOT CALLED.'], b: ['Outdated website', 'No emergency call button', "Customers can't book service", 'Not on page one of Google', 'No reviews shown', 'Jobs going to the other guy'], a: ['Fast mobile HVAC website', 'Tap-to-call emergency button', 'Online service requests', 'Easy to find on Google', 'Reviews that build trust', 'Daily tips & job videos'] },
    carpet_cleaning: { name: 'Carpet cleaning', sign: 'FRESH STEP', van: 'CLEAN', t: ['TWO CLEANING COMPANIES.', 'SAME STAINS.', 'ONE GOT BOOKED.'], b: ['No website', 'Bookings by phone only', 'No before & after proof', 'Reviews nobody can find', 'Invisible on Google', 'One-time customers'], a: ['Fresh website for your company', 'Online booking & quotes', 'Before & after gallery', 'Reviews front and center', 'Easy to find on Google', 'Reminders that rebook clients'] },
    real_estate: { name: 'Real estate', sign: 'HOME TEAM', t: ['TWO AGENTS.', 'SAME LISTING.', 'ONE SOLD IT.'], b: ['No personal website', 'Listings only on big portals', 'Phone photos, no video', 'Leads go to other agents', 'No follow-up system', 'Listing sits on the market'], a: ['Your own agent website', 'Premium listing pages', 'Video & drone tours', 'Buyer & seller lead capture', 'Daily content for your brand', 'SOLD sign goes up faster'] },
    car_dealership: { name: 'Car dealership', sign: 'AUTO MAX', t: ['TWO CAR LOTS.', 'SAME STREET.', 'ONE MOVES CARS.'], b: ['Inventory not online', 'Prices only by phone', 'No photos or video', 'Leads lost in voicemail', 'Invisible on Google', 'Cars sitting for months'], a: ['Full inventory online', 'Photos, price & features per car', 'New arrival videos daily', 'Leads sent to your phone', 'Easy to find on Google', 'Test drives booked online'] },
  };
  const IND2SCENE = { pizza: 'pizza', restaurant: 'cafe', burgers: 'cafe', tacos: 'cafe', mexican: 'cafe', italian: 'cafe', sandwiches: 'cafe', barbershop: 'barbershop', salon: 'barbershop',
    landscaping: 'landscaping', hardscape: 'landscaping', fencing: 'landscaping', pressure: 'pressure_washing', roofing: 'pressure_washing', hvac: 'hvac', carpet: 'carpet_cleaning', cleaning: 'carpet_cleaning', commercial: 'carpet_cleaning',
    realestate: 'real_estate', dealership: 'car_dealership', detailing: 'car_dealership' };
  STUDIO_REG.pixel2.SCENES = BA;

  function pxba() {
    const ind = (typeof BRAND !== 'undefined' && BRAND.industry) || '';
    const SC = TX('scene', IND2SCENE[ind] || 'cafe', { label: 'Business scene', group: 'Scene', options: Object.keys(BA).map(k => ({ value: k, label: BA[k].name })) });
    const D = BA[SC] || BA.cafe, scene = SCENES[SC] || cafe;
    const SIGN = W_('sign', D.sign, 'Shop sign', 12, 'Scene'), VAN = D.van ? W_('van', D.van, 'Truck label', 5, 'Scene') : '';
    const T = [W_('title1', D.t[0], 'Intro line 1', 30, 'Intro'), W_('title2', D.t[1], 'Intro line 2', 30, 'Intro'), W_('title3', D.t[2], 'Punch line', 16, 'Intro')];
    const B = D.b.map((s, i) => w_('before' + (i + 1), s, 'Before ' + (i + 1), 30, 'Before (red X)')).filter(s => s && s.trim());
    const A = D.a.map((s, i) => w_('after' + (i + 1), s, 'After ' + (i + 1), 30, 'After (green check)')).filter(s => s && s.trim());
    const TAGB = W_('tag_before', 'BEFORE', 'Top label', 12, 'Labels'), TAGA = W_('tag_after', 'AFTER: WEBFLIX', 'Bottom label', 18, 'Labels');
    const Q1 = W_('q1', 'WHICH ONE', 'Question line 1', 12, 'Ending'), Q2 = W_('q2', 'IS YOURS?', 'Question line 2', 12, 'Ending');
    const E1 = W_('end1', 'LEVEL UP', 'Ending line 1', 15, 'Ending'), E2 = W_('end2', 'YOUR BUSINESS', 'Ending line 2', 15, 'Ending'), EL = W_('end_line', 'WEBSITES  ·  LEADS  ·  CONTENT', 'Ending sub-line', 36, 'Ending'), CTA = W_('cta', 'DM "START"', 'Button', 18, 'Call to action');
    const N = Math.max(B.length, A.length), TT = 3.4, SPLIT = 0.6 + N * 1.2 + 4.2, ENDT = 4.6, DUR = TT + SPLIT + ENDT;
    const PRESS = W_('press', 'PRESS START', 'Press Start line', 12, 'Intro'), VS = W_('vs', 'VS', 'Versus badge', 4, 'Labels');
    function title(t, P) { stars(g, t, 1, 26); const [t1x, t1y] = posOf(elP('title1'), [135, 170]); txt(g, t1x, t1y, typed(T[0], t, 22), { col: P.GREY, a: 'm' }); const [t2x, t2y] = posOf(elP('title2'), [135, 190]); txt(g, t2x, t2y, typed(T[1], t - 0.9, 22), { col: P.GREY, a: 'm' }); const [t3x, t3y] = posOf(elP('title3'), [135, 222]); txt(g, t3x, t3y, typed(T[2], t - 1.8, 14), { f: 'ps16', col: P.RED, sh: P.DRED, a: 'm' }); if (t > 2.6 && blink(t, 2)) { const [psx, psy] = posOf(elP('press'), [135, 300]); txt(g, psx, psy, PRESS, { col: P.WHITE, a: 'm' }); } }
    function panel(after, prog, P) {
      const [px, py] = posOf(elP(after ? 'after' : 'before'), [4, after ? 380 : 136]), y0 = py, L = after ? A : B; rect(g, px, y0, px + 261, y0 + 96, P.PANEL); rectO(g, px, y0, px + 261, y0 + 96, P.EDGE, 1); let shown = 0;
      L.forEach((ln, i) => { const st = prog - (i * 1.2 + (after ? 0.6 : 0)); if (st <= 0) return; shown++; const yy = y0 + 4 + i * 15;
        if (st > 0.05) { if (after) [[6, 7], [7, 8], [8, 9], [9, 8], [10, 7], [11, 6], [12, 5]].forEach(([x, y]) => rect(g, px + x, yy + y, px + x, yy + y + 1, P.GREEN));
          else for (let k = 0; k < 6; k++) { pt(g, px + 6 + k, yy + 4 + k, P.RED); pt(g, px + 11 - k, yy + 4 + k, P.RED); pt(g, px + 7 + k, yy + 4 + k, P.RED); pt(g, px + 12 - k, yy + 4 + k, P.RED); } }
        txt(g, px + 18, yy, typed(ln, st, 34), { f: 'vt', col: after ? P.WHITE : P.GREY }); });
      return shown;
    }
    function split(t, P) {
      const [, sby] = posOf(elP('scenebefore'), [0, 14]); scene(sby, t, false, SIGN, VAN); const [, say] = posOf(elP('sceneafter'), [0, 258]); scene(say, t, true, SIGN, VAN);
      const prog = t - 0.6; panel(false, prog, P); const n = panel(true, prog, P), lv = 1 + Math.round(98 * clamp(n / Math.max(1, A.length)));
      rect(g, 0, 0, 269, 12, P.BAR); const [tbx, tby] = posOf(elP('tagbefore'), [5, 3]); txt(g, tbx, tby, TAGB, { col: P.GREY }); const [lbx, lby] = posOf(elP('lvbefore'), [264, 3]); txt(g, lbx, lby, 'LV  1', { col: P.RED, a: 'r' });
      rect(g, 0, 244, 269, 256, P.RED); const [tax, tay] = posOf(elP('tagafter'), [5, 247]); txt(g, tax, tay, TAGA, { col: P.INK }); const [lax, lay] = posOf(elP('lvafter'), [264, 247]); txt(g, lax, lay, 'LV ' + String(lv).padStart(2, ' '), { col: P.INK, a: 'r' });
      rect(g, 0, 234, 269, 243, P.INK); const off = Math.floor(t * 20) % 8; for (let x = -8; x < 278; x += 8) rect(g, x + off, 236, x + off + 3, 241, P.RED);
      const [vx, vy] = posOf(elP('vs'), [136, 235]); rect(g, vx - 18, vy - 2, vx + 16, vy + 9, P.INK); rectO(g, vx - 18, vy - 2, vx + 16, vy + 9, P.WHITE, 1); txt(g, vx, vy, VS, { col: P.WHITE, a: 'm' });
      const q0 = SPLIT - 3.0; if (t > q0) { const [qx, qy] = posOf(elP('q1'), [135, 222]); const u = clamp((t - q0) / 0.4), bw = Math.round(230 * u); if (bw > 4) { rect(g, qx - bw / 2, qy - 12, qx + bw / 2, qy + 46, P.INK); rectO(g, qx - bw / 2, qy - 12, qx + bw / 2, qy + 46, P.RED, 2); }
        if (u >= 1) { txt(g, qx, qy, Q1, { f: 'ps16', col: P.WHITE, a: 'm' }); const [q2x, q2y] = posOf(elP('q2'), [135, 244]); txt(g, q2x, q2y, Q2, { f: 'ps16', col: P.RED, a: 'm' }); } }
      if (t < 0.35) wipe(g, t / 0.35);
    }
    function ending(t, P) {
      stars(g, t, 5, 26); const [lgx, lgy] = posOf(elP('logo'), [135, 110]); const ly = Math.round(-80 + (lgy + 80) * (1 - Math.pow(1 - clamp(t / 0.6), 3))); const yb = logoAny(LOGO, g, lgx, ly, 3, false);
      if (LOGO === 'pixel' && t > 0.6) PX.wordmark(g, lgx, yb + 8, 2);
      const [e1x, e1y] = posOf(elP('end1'), [135, 230]); txt(g, e1x, e1y, typed(E1, t - 0.7, 16), { f: 'ps16', col: P.WHITE, a: 'm' }); const [e2x, e2y] = posOf(elP('end2'), [135, 252]); txt(g, e2x, e2y, typed(E2, t - 1.2, 16), { f: 'ps16', col: P.WHITE, a: 'm' });
      const [elx, ely] = posOf(elP('endline'), [135, 286]); txt(g, elx, ely, typed(EL, t - 2.0, 40), { f: 'vt', col: P.GREY, a: 'm' });
      if (t > 2.6) { const [ex, ey] = posOf(elP('endcta'), [135, 338]); const on = blink(t); rect(g, ex - 75, ey - 8, ex + 75, ey + 14, on ? P.RED : P.INK); rectO(g, ex - 75, ey - 8, ex + 75, ey + 14, P.RED, 2); txt(g, ex, ey, CTA, { col: on ? P.INK : P.RED, a: 'm' }); }
    }
    function elements() {
      const [t1x, t1y] = posOf(elP('title1'), [135, 170]), [t2x, t2y] = posOf(elP('title2'), [135, 190]), [t3x, t3y] = posOf(elP('title3'), [135, 222]), [psx, psy] = posOf(elP('press'), [135, 300]);
      const [sbx, sby] = posOf(elP('scenebefore'), [0, 14]), [sax, say] = posOf(elP('sceneafter'), [0, 258]);
      const [tbx, tby] = posOf(elP('tagbefore'), [5, 3]), [lbx, lby] = posOf(elP('lvbefore'), [264, 3]);
      const [tax, tay] = posOf(elP('tagafter'), [5, 247]), [lax, lay] = posOf(elP('lvafter'), [264, 247]);
      const [bx, by] = posOf(elP('before'), [4, 136]), [ax, ay] = posOf(elP('after'), [4, 380]);
      const [vx, vy] = posOf(elP('vs'), [136, 235]), [qx, qy] = posOf(elP('q1'), [135, 222]), [q2x, q2y] = posOf(elP('q2'), [135, 244]);
      const [lgx, lgy] = posOf(elP('logo'), [135, 110]), [e1x, e1y] = posOf(elP('end1'), [135, 230]), [e2x, e2y] = posOf(elP('end2'), [135, 252]);
      const [elx, ely] = posOf(elP('endline'), [135, 286]), [ex, ey] = posOf(elP('endcta'), [135, 338]);
      return [
        { id: 'title1', kind: 'pos', label: T[0], x: t1x, y: t1y, t0: 0, d: TT, box: [t1x - 110, t1y - 4, 220, 16], dup: false, del: false },
        { id: 'title2', kind: 'pos', label: T[1], x: t2x, y: t2y, t0: 0.9, d: TT - 0.9, box: [t2x - 110, t2y - 4, 220, 16], dup: false, del: false },
        { id: 'title3', kind: 'pos', label: T[2], x: t3x, y: t3y, t0: 1.8, d: TT - 1.8, box: [t3x - 110, t3y - 8, 220, 28], dup: false, del: false },
        { id: 'press', kind: 'pos', label: PRESS, x: psx, y: psy, t0: 2.6, d: 0.8, box: [psx - 60, psy - 4, 120, 16], dup: false, del: false },
        { id: 'scenebefore', kind: 'box', label: 'Before scene', x: sbx, y: sby, w: 270, h: 120, t0: TT, d: SPLIT, box: [sbx, sby, 270, 120], dup: false, del: false },
        { id: 'sceneafter', kind: 'box', label: 'After scene', x: sax, y: say, w: 270, h: 120, t0: TT, d: SPLIT, box: [sax, say, 270, 120], dup: false, del: false },
        { id: 'tagbefore', kind: 'pos', label: TAGB, x: tbx, y: tby, t0: TT, d: SPLIT, box: [tbx, tby - 4, 100, 16], dup: false, del: false },
        { id: 'lvbefore', kind: 'pos', label: 'LV 1', x: lbx, y: lby, t0: TT, d: SPLIT, box: [lbx - 50, lby - 4, 50, 16], dup: false, del: false },
        { id: 'tagafter', kind: 'pos', label: TAGA, x: tax, y: tay, t0: TT, d: SPLIT, box: [tax, tay - 4, 140, 16], dup: false, del: false },
        { id: 'lvafter', kind: 'pos', label: 'LV counter', x: lax, y: lay, t0: TT, d: SPLIT, box: [lax - 50, lay - 4, 50, 16], dup: false, del: false },
        { id: 'before', kind: 'box', label: 'Before list', x: bx, y: by, w: 261, h: 96, t0: TT + 0.6, d: SPLIT - 0.6, box: [bx, by, 261, 96], dup: false, del: false },
        { id: 'after', kind: 'box', label: 'After list', x: ax, y: ay, w: 261, h: 96, t0: TT + 1.2, d: SPLIT - 1.2, box: [ax, ay, 261, 96], dup: false, del: false },
        { id: 'vs', kind: 'pos', label: VS, x: vx, y: vy, t0: TT, d: SPLIT, box: [vx - 18, vy - 2, 34, 11], dup: false, del: false },
        { id: 'q1', kind: 'pos', label: Q1, x: qx, y: qy, t0: TT + SPLIT - 3.0, d: 3.0, box: [qx - 115, qy - 12, 230, 58], dup: false, del: false },
        { id: 'q2', kind: 'pos', label: Q2, x: q2x, y: q2y, t0: TT + SPLIT - 3.0, d: 3.0, box: [q2x - 115, q2y - 12, 230, 58], dup: false, del: false },
        { id: 'logo', kind: 'pos', label: 'Logo', x: lgx, y: lgy, t0: TT + SPLIT, d: ENDT, box: [lgx - 90, lgy, 180, 60], dup: false, del: false },
        { id: 'end1', kind: 'pos', label: E1, x: e1x, y: e1y, t0: TT + SPLIT + 0.7, d: ENDT - 0.7, box: [e1x - 90, e1y - 8, 180, 28], dup: false, del: false },
        { id: 'end2', kind: 'pos', label: E2, x: e2x, y: e2y, t0: TT + SPLIT + 1.2, d: ENDT - 1.2, box: [e2x - 110, e2y - 8, 220, 28], dup: false, del: false },
        { id: 'endline', kind: 'pos', label: EL, x: elx, y: ely, t0: TT + SPLIT + 2.0, d: ENDT - 2.0, box: [elx - 120, ely - 4, 240, 16], dup: false, del: false },
        { id: 'endcta', kind: 'pos', label: CTA, x: ex, y: ey, t0: TT + SPLIT + 2.6, d: ENDT - 2.6, box: [ex - 75, ey - 8, 150, 22], dup: false, del: false },
      ];
    }
    function render(t) { const P = PX.begin(); if (t < TT) title(t, P); else if (t < TT + SPLIT) split(t - TT, P); else ending(t - TT - SPLIT, P); }
    const cues = () => { const ev = [cue('blip', 0.0, 0.35), cue('blip', 0.9, 0.35), cue('drop', 1.8), cue('select', TT)];
      for (let i = 0; i < N; i++) { const tb = TT + 0.6 + i * 1.2; if (i < B.length) ev.push(cue('bonk', tb, 0.5)); if (i < A.length) ev.push(cue('coin', tb + 0.6, 0.5)); }
      ev.push(cue('select', TT + SPLIT - 3.0), cue('powerup', TT + SPLIT, 0.6), cue('fanfare', TT + SPLIT + 0.7, 0.6), cue('coin', TT + SPLIT + 2.6));
      return { dur: DUR, beds: [bed(DUR)], events: ev }; };
    return { dur: DUR, render, cues, elements };
  }

  const MAKE = { pxbf, pxthanks, pxloot, pxba };
  const Pm = (MAKE[V] || pxbf)();
  DIR = { dur: Pm.dur, bg: BLK, finish: { vig: 0, grain: 0 }, edl: [], shakes: [], preload: () => PX.fontsP,
    render(t) { if (VID.collecting) return; Pm.render(t); PX.blit(); }, cues: Pm.cues, ...(Pm.elements ? { elements: Pm.elements } : {}) };
});
