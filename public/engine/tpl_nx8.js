'use strict';
/* NexGen templates V20 (Nov 11): six more motion showpieces on the showpiece toolkit (SHOWKIT, tpl_nx7.js): springs, a real
   shutter on everything that moves and a virtual camera. Any industry; the brand's colours, fonts, logo, services, contact.
   ?v=mapx      Find Us        a map draws itself, a route runs to your door, the pin drops, and a card rises with your
                               area, address and hours (typed by you; a dash leaves a line off)
   ?v=feedx     The Feed       a social feed scrolls by and stops on your post; a double-tap heart, a caption, then you
   ?v=calx      Book It        a calendar springs in, a ring hops to a day, time-of-day chips pop, a tap on your call to action
   ?v=gridx     Photo Wall     six photos assemble into a wall; the camera pushes into two of them, then pulls back
   ?v=stingx    Logo Pop       a five-second bumper: your colour bursts open, the logo springs in and catches the light
   ?v=browserx  Your Website   a browser window types your address, your page loads and scrolls, the cursor clicks your button
   Sample copy is there to be replaced; nothing is invented as fact (no like counts, no dates, no prices, no availability:
   the calendar is a picture of a month, the day and the times are yours to set). Soundtracks are mixed live (nx-sound.js). */
STUDIO_REG['nx8'] = (() => {
  const V = QS.get('v') || 'mapx';
  // Per-element model (b): tpl_free sets window.__NX_BLOCK_EL to the block's `el` data before calling this
  // function; positions below fall back to the original hardcoded values when EL is null, so rendering
  // is byte-for-byte the old path. Note: these showpieces draw inside a camera() transform, so element
  // positions are in template space — the camera adds a small live offset between the inspector overlay
  // box and the visible text. Drag still moves the element.
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const { TAU, SEC, pk, up, seg, SP, SS, SB, onAcc, INKD, CARD, MUTE, tx, fit, rr, logoImg, services, shot, pic, touch, stage, camera, shutter, within, words, ripple, pointer, pillBtn, close, closeCues, bed } = SHOWKIT();
  const dash = s => !s || String(s).trim() === '-';
  const NAME = BRAND.name || 'Your business', INI = up(BRAND.short || BRAND.name || 'B').replace(/[^A-Z0-9]/g, '').slice(0, 2) || 'B';
  const HEART = new Path2D('M0 22 C-34 -4 -22 -30 0 -12 C22 -30 34 -4 0 22 Z');
  const shadow = (c, b, y, a) => { c.shadowColor = 'rgba(0,0,0,' + (a === undefined ? 0.4 : a) + ')'; c.shadowBlur = b; c.shadowOffsetY = y; };
  const noShadow = c => { c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0; };
  // an arrow cursor travelling from p0 to p1 and clicking at tTap
  function cursor(t, t0, tTap, p0, p1) {
    if (VID.collecting || t < t0 || t > tTap + 0.6) return; const u = E.inOutC(seg(t, t0, tTap - t0 - 0.05)), x = lerp(p0[0], p1[0], u), y = lerp(p0[1], p1[1], u), pr = 1 - 0.18 * Math.sin(Math.PI * seg(t, tTap - 0.06, 0.2)), a = clamp((t - t0) * 6) * (1 - seg(t, tTap + 0.35, 0.25)), c = ctx;
    c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(pr * 2.6, pr * 2.6); shadow(c, 10, 4, 0.45); c.fillStyle = '#FFFFFF'; c.strokeStyle = '#14141A'; c.lineWidth = 1.6; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 24); c.lineTo(6.5, 18.5); c.lineTo(11, 28); c.lineTo(15, 26); c.lineTo(10.5, 17); c.lineTo(18, 17); c.closePath(); c.fill(); noShadow(c); c.stroke(); c.restore();
  }

  // ================================================================ FIND US
  function mapx() {
    const AREA = TX('area', CONTACT.area ? up(CONTACT.area) : 'YOUR AREA', { label: 'Area', group: 'Your card', upper: true, max: 30 });
    const ADDR = TX('addr', '-', { label: 'Street address (a dash leaves it off)', group: 'Your card', max: 44 });
    const HOURS = TX('hours', '-', { label: 'Hours (a dash leaves them off)', group: 'Your card', max: 40, hint: 'For example: Mon to Sat, 9 to 6' });
    const BTN = TX('btn', 'GET DIRECTIONS', { label: 'Button', group: 'Your card', upper: true, max: 22 });
    const HEAD = TX('head', pk({ general: 'COME SEE US', food: 'COME EAT', estate: 'COME TAKE A LOOK', home: 'WE COME TO YOU', beauty: 'WALK-INS WELCOME', auto: 'DROP IT OFF', hosp: 'COME SEE THE SPACE', retail: 'COME BY THE SHOP', pro: 'STOP BY' }), { label: 'Headline', group: 'Headline', upper: true, max: 22 });
    const END = TX('end', 'SEE YOU SOON', { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const PIN = posOf(elP('pin'), [600, 900]), TR = 1.0, TP = 2.7, TCARD = 3.7, TC = 6.0, TAP = 6.9, OUT = 7.7, DUR = OUT + 4.1, MOVE = [[0, 1.4], [TP - 0.2, TCARD + 1.3], [TC, OUT + 1.2]];
    const lines = [dash(ADDR) ? '' : ADDR, dash(HOURS) ? '' : HOURS].filter(Boolean), cardH = 330 + lines.length * 62;
    const cardY0 = 1700 - cardH - 40, BX0 = [100, cardY0, 880, cardH], BX = EL && EL.box ? [num(EL.box.x, BX0[0]), num(EL.box.y, BX0[1]), num(EL.box.w, BX0[2]), num(EL.box.h, BX0[3])] : BX0;
    function elements() { const heP = posOf(elP('headline'), [540, 190]), nmP = posOf(elP('name'), [BX[0] + 162, BX[1] + 86]), arP = posOf(elP('area'), [BX[0] + 162, BX[1] + 128]), deP = posOf(elP('details'), [BX[0] + 40, BX[1] + 206]), btP = posOf(elP('btn'), [BX[0] + BX[2] / 2, BX[1] + BX[3] - 80]); return [
      { id: 'headline', kind: 'pos', label: HEAD, x: heP[0], y: heP[1], t0: 0.3, d: DUR - 0.3, box: [heP[0] - 450, heP[1] - 120, 900, 120], dup: false, del: false },
      { id: 'pin', kind: 'pos', label: 'Map pin', x: PIN[0], y: PIN[1], t0: TP, d: DUR - TP, box: [PIN[0] - 80, PIN[1] - 190, 160, 190], dup: false, del: false },
      { id: 'card', kind: 'box', label: 'Info card', x: BX[0], y: BX[1], w: BX[2], h: BX[3], t0: TCARD, d: DUR - TCARD, box: [BX[0], BX[1], BX[2], BX[3]], dup: false, del: false },
      { id: 'name', kind: 'pos', label: NAME, x: nmP[0], y: nmP[1], t0: TCARD, d: DUR - TCARD, box: [nmP[0], nmP[1] - 48, 660, 60], dup: false, del: false },
      { id: 'area', kind: 'pos', label: AREA, x: arP[0], y: arP[1], t0: TCARD, d: DUR - TCARD, box: [arP[0], arP[1] - 24, 660, 40], dup: false, del: false },
      { id: 'details', kind: 'pos', label: 'Address & hours', x: deP[0], y: deP[1], t0: TCARD, d: DUR - TCARD, box: [deP[0], deP[1] - 34, 800, 34 + (lines.length - 1) * 62 + 34], dup: false, del: false },
      { id: 'btn', kind: 'pos', label: BTN, x: btP[0], y: btP[1], t0: TCARD + 0.75, d: DUR - (TCARD + 0.75), box: [btP[0] - 380, btP[1] - 40, 760, 80], dup: false, del: false },
    ].filter(e => e.id !== 'details' || lines.length); }
    // the streets: a deterministic sketch of a town, not a real place
    const R = rng(41), VS = [], HS = []; for (let x = 130; x < 1080; x += 150 + R() * 90) VS.push([x, 10 + R() * 14]); for (let y = 330; y < 1700; y += 160 + R() * 100) HS.push([y, 10 + R() * 14]);
    const ROUTE = [[120, 1560], [120, 1300], [430, 1300], [430, 1040], [600, 1040], PIN]; let RL = 0; const RS = ROUTE.map((p, i) => { if (i) RL += Math.hypot(p[0] - ROUTE[i - 1][0], p[1] - ROUTE[i - 1][1]); return RL; });
    function town(t) {
      const c = ctx, e = SS(t, 0.1, 0.9); c.save(); c.globalAlpha *= clamp(t * 5);
      shadow(c, 70, 26, 0.45); c.fillStyle = '#E9ECF1'; rr(60, 270, 960, 1460, 44); c.fill(); noShadow(c); rr(60, 270, 960, 1460, 44); c.clip();
      c.fillStyle = '#CFE5D2'; rr(690, 1160, 260, 300, 30); c.fill(); rr(150, 420, 220, 170, 30); c.fill();   // parks
      c.strokeStyle = '#BFD8EE'; c.lineWidth = 70; c.lineCap = 'round'; c.beginPath(); c.moveTo(1040, 380); c.bezierCurveTo(820, 520, 900, 760, 1060, 860); c.stroke();   // water
      c.strokeStyle = '#FFFFFF'; c.lineCap = 'butt';
      VS.forEach(([x, w], i) => { const k = E.outQ(seg(t, 0.15 + i * 0.05, 0.6)); c.lineWidth = w + 10; c.beginPath(); c.moveTo(x, 270); c.lineTo(x, 270 + 1460 * k); c.stroke(); });
      HS.forEach(([y, w], i) => { const k = E.outQ(seg(t, 0.2 + i * 0.05, 0.6)); c.lineWidth = w + 10; c.beginPath(); c.moveTo(60, y); c.lineTo(60 + 960 * k, y); c.stroke(); });
      // the route to the door
      const k = E.inOutC(seg(t, TR, TP - TR - 0.15)) * RL; if (k > 0) { c.strokeStyle = OR; c.lineWidth = 16; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(ROUTE[0][0], ROUTE[0][1]);
        for (let i = 1; i < ROUTE.length; i++) { if (RS[i] <= k) c.lineTo(ROUTE[i][0], ROUTE[i][1]); else { const u = (k - RS[i - 1]) / (RS[i] - RS[i - 1]); c.lineTo(lerp(ROUTE[i - 1][0], ROUTE[i][0], u), lerp(ROUTE[i - 1][1], ROUTE[i][1], u)); break; } } c.stroke();
        c.fillStyle = '#FFFFFF'; c.strokeStyle = OR; c.lineWidth = 8; c.beginPath(); c.arc(ROUTE[0][0], ROUTE[0][1], 18, 0, TAU); c.fill(); c.stroke(); }
      c.restore();
      // the pin: drops, lands, rings
      if (t >= TP) { const d = K13.BOUNCY(seg(t, TP, 0.9)), a = clamp((t - TP) * 8); for (let i = 0; i < 2; i++) { const u = ((t - TP - 0.35) * 0.7 + i * 0.5) % 1; if (t > TP + 0.35) { c.save(); c.globalAlpha *= (1 - u) * 0.5; c.strokeStyle = OR; c.lineWidth = 6; c.beginPath(); c.ellipse(PIN[0], PIN[1], 30 + 130 * u, (30 + 130 * u) * 0.45, 0, 0, TAU); c.stroke(); c.restore(); } }
        c.save(); c.globalAlpha *= a; c.translate(PIN[0], PIN[1] - (1 - d) * 700); c.scale(1 + (1 - d) * 0.25, 1 + (1 - d) * 0.25); shadow(c, 26, 14, 0.4); c.fillStyle = OR; c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-78, -84, -70, -190, 0, -190); c.bezierCurveTo(70, -190, 78, -84, 0, 0); c.fill(); noShadow(c);
        c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(0, -118, 44, 0, TAU); c.fill(); tx(INI, 0, -104, { size: 38, wt: 900, col: INKD }); c.restore(); }
    }
    function card(t) {
      const e = SP(t, TCARD, 0.85), a = clamp((t - TCARD) * 6); if (a <= 0) return; const c = ctx, y0 = BX[1], cardH = BX[3], fl = 5 * Math.sin(t * 1.3);
      c.save(); c.globalAlpha *= a; c.translate(0, (1 - e) * 500 + fl); shadow(c, 60, 22, 0.42); c.fillStyle = CARD; rr(BX[0], y0, BX[2], cardH, 40); c.fill(); noShadow(c);
      c.fillStyle = OR; rr(BX[0] + 40, y0 + 44, 92, 92, 24); c.fill(); tx(INI, BX[0] + 86, y0 + 104, { size: 40, wt: 900, col: onAcc() });
      const [nmx, nmy] = posOf(elP('name'), [BX[0] + 162, y0 + 86]); tx(NAME, nmx, nmy, { size: fit(NAME, 800, 'Mont', 660, 48, -0.5), wt: 800, ls: -0.5, col: INKD, align: 'left' });
      const [arx, ary] = posOf(elP('area'), [BX[0] + 162, y0 + 128]); tx(AREA, arx, ary, { size: fit(AREA, 700, 'Mont', 660, 24, 3), wt: 700, ls: 3, col: MUTE, align: 'left' });
      const [dex, dey] = posOf(elP('details'), [BX[0] + 40, y0 + 206]); lines.forEach((ln, i) => tx(ln, dex, dey + i * 62, { size: fit(ln, 500, 'Mont', 800, 34, 0), wt: 500, col: INKD, align: 'left', a: seg(t, TCARD + 0.4 + i * 0.12, 0.3) }));
      const by = y0 + cardH - 80; const [btx, bty] = posOf(elP('btn'), [BX[0] + BX[2] / 2, by]); pillBtn(BTN, btx, bty, { s: SB(t, TCARD + 0.75, 0.8) * (1 + 0.04 * Math.sin(Math.PI * seg(t, TAP - 0.05, 0.3))), a: clamp((t - TCARD - 0.75) * 6), size: 32, maxW: 760 }); c.restore(); ripple(btx, bty + fl, t, TAP, OR);
    }
    function scene(t) {
      stage(t); const k = SS(t, TP - 0.1, 1.0), z = lerp(0.92, 1.12, k) - 0.06 * SS(t, TCARD, 0.8) + 0.3 * E.inC(seg(t, OUT - 0.15, 0.6)), cx = lerp(540, 560, k) - 20 * SS(t, TCARD, 0.8), cy = lerp(960, 900, k) + 90 * SS(t, TCARD, 0.8);
      camera(cx, cy, z, 0, () => { town(t); const [hex, hey] = posOf(elP('headline'), [540, 190]); words(HEAD, hex, hey, t, 0.3, { size: fit(HEAD, 400, 'Bebas', 900, 120, 3), fam: 'Bebas', wt: 400, ls: 3, a: 1 - seg(t, TP - 0.3, 0.3), shadow: 'rgba(0,0,0,0.4)' }); card(t); const [btx, bty] = posOf(elP('btn'), [BX[0] + BX[2] / 2, BX[1] + BX[3] - 80]); pointer(t, TC, TAP, [880, 1780], [btx + 60, bty]); });
      close(t, OUT, END);
    }
    return { dur: DUR, shakes: [[TP + 0.32, 7]], render: t => shutter(t, within(t, MOVE), scene), elements,
      cues() { const ev = [['paper', 0.15, 0.3, 0], ['pop', 0.45, 0.22, 0], ['pencil', TR, 0.4, -0.2], ['whoosh', TP + 0.05, 0.3, 0], ['thud', TP + 0.33, 0.5, 0.1], ['sparkle', TP + 0.5, 0.14, 0.2], ['swish', TCARD, 0.3, 0], ['pop', TCARD + 0.45, 0.3, 0], ['pop', TCARD + 0.85, 0.26, 0], ['click', TAP, 0.5, 0]]; closeCues(ev, OUT);
        return { dur: DUR, beds: [bed('day', DUR)], events: ev }; } };
  }

  // ================================================================ THE FEED
  function feedx() {
    const CAP = TX('cap', pk({ general: 'New work, fresh off the job.', food: 'Fresh out of the kitchen.', estate: 'Just listed. Take a look inside.', home: 'Just wrapped this one up.', beauty: 'Fresh out of the chair.', auto: 'Fresh out of the bay.', hosp: 'Last weekend was something.', retail: 'Just landed in the shop.', pro: 'A look at what we have been working on.' }), { label: 'Caption under your post', group: 'Your post', max: 46 });
    const AREA = TX('area', CONTACT.area || '-', { label: 'Location line (a dash leaves it off)', group: 'Your post', max: 30 });
    const END = TX('end', 'FOLLOW ALONG', { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const S1 = shot('s1', 'Your post', 9, 'l'), S2 = shot('s2', 'A post above yours', 3, 'l'), S3 = shot('s3', 'Another post above', 3, 'l');
    const PH = 1300, TS = 2.4, TH = 4.3, OUT = 8.2, DUR = OUT + 4.1, MOVE = [[0, TS + 1.0], [TH - 0.1, TH + 1.2], [OUT - 0.3, OUT + 1.2]];
    const PB0 = [70, 330], PB = EL && EL.box ? [num(EL.box.x, PB0[0]), num(EL.box.y, PB0[1])] : PB0;
    function elements() { return [
      { id: 'post', kind: 'box', label: 'Your post', x: PB[0], y: PB[1], w: 940, h: PH - 60, t0: TS, d: DUR - TS, box: [PB[0], PB[1], 940, PH - 60], dup: false, del: false },
    ]; }
    const scrollY = t => { const a = E.inOutS(seg(t, 0.15, TS - 0.15)), b = K13.SOFT(seg(t, TS - 0.25, 0.9)); return lerp(0, 2 * PH - 160, a) + 160 * b; };   // two posts go by, then yours settles
    function post(i, y, t) {
      if (y > 2300 || y < -PH - 200) { if (i === 2) touch(S1, t); return; } const c = ctx, mine = i === 2, s = [S2, S3, S1][i];
      c.save(); c.translate(mine ? PB[0] - 70 : 0, y + (mine ? PB[1] - 330 : 0)); shadow(c, 50, 18, 0.35); c.fillStyle = CARD; rr(70, 0, 940, PH - 60, 44); c.fill(); noShadow(c);
      c.fillStyle = mine ? OR : '#D9DBE1'; c.beginPath(); c.arc(150, 84, 44, 0, TAU); c.fill();
      if (mine) { tx(INI, 150, 98, { size: 36, wt: 900, col: onAcc() }); tx(NAME, 218, 80, { size: fit(NAME, 800, 'Mont', 620, 36, -0.3), wt: 800, ls: -0.3, col: INKD, align: 'left' }); if (!dash(AREA)) tx(AREA, 218, 120, { size: fit(AREA, 500, 'Mont', 620, 26, 0), wt: 500, col: MUTE, align: 'left' }); }
      else { c.fillStyle = '#D9DBE1'; rr(218, 56, 300, 26, 13); c.fill(); c.fillStyle = '#E7E8EC'; rr(218, 98, 190, 20, 10); c.fill(); }
      c.fillStyle = '#C9CBD3'; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(900 + k * 22, 84, 6, 0, TAU); c.fill(); }
      pic(s, mine ? t - TS : t, 100, 160, 880, 880, 24);
      // actions: heart, comment, send
      const liked = mine && t >= TH + 0.12, hk = mine ? SB(t, TH + 0.12, 0.7) : 1; c.save(); c.translate(150, 1110); c.scale(1.5 * (liked ? 0.6 + 0.4 * hk : 1), 1.5 * (liked ? 0.6 + 0.4 * hk : 1)); if (liked) { c.fillStyle = OR; c.fill(HEART); } else { c.strokeStyle = INKD; c.lineWidth = 3.4; c.lineJoin = 'round'; c.stroke(HEART); } c.restore();
      c.strokeStyle = INKD; c.lineWidth = 5; c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath(); c.arc(262, 1106, 30, 0.6, TAU - 0.9 + 0.6); c.lineTo(238, 1146); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(346, 1084); c.lineTo(406, 1078); c.lineTo(378, 1136); c.lineTo(368, 1108); c.closePath(); c.stroke();
      if (mine) { const n = clamp(Math.floor((t - TH - 0.9) / 0.035), 0, CAP.length), nm = up(BRAND.short || NAME).slice(0, 16), nw = textW(nm, F(800, 34, 'Mont'), 1) + 20, fs = fit(CAP, 500, 'Mont', 860 - nw, 38, 0); if (t > TH + 0.7) { tx(nm, 110, 1196, { size: 34, wt: 800, ls: 1, col: INKD, align: 'left', a: seg(t, TH + 0.7, 0.25) }); tx(CAP.slice(0, n), 110 + nw, 1196, { size: fs, wt: 500, col: INKD, align: 'left' }); } }
      else { c.fillStyle = '#E7E8EC'; rr(110, 1174, 560, 22, 11); c.fill(); }
      c.restore();
    }
    function bigHeart(t) { const lt = t - TH; if (lt < 0 || lt > 1.3 || VID.collecting) return; const e = K13.BOUNCY(seg(lt, 0, 0.7)), a = clamp(lt * 10) * (1 - seg(lt, 0.85, 0.35)), c = ctx; c.save(); c.globalAlpha *= a; c.translate(540, 600 + 30 - seg(lt, 0.7, 0.6) * 60); c.scale(6.2 * e, 6.2 * e); shadow(c, 8, 3, 0.35); c.fillStyle = '#FFFFFF'; c.fill(HEART); c.restore();
      for (let i = 0; i < 7; i++) { const u = seg(lt, 0.25 + i * 0.05, 1.0); if (u <= 0 || u >= 1) continue; c.save(); c.globalAlpha *= (1 - u) * 0.9; c.translate(540 + (hash(i * 3.1) - 0.5) * 520 + Math.sin(u * 5 + i) * 30, 700 - u * (300 + hash(i * 7.7) * 260)); c.scale(1 + hash(i * 2.2), 1 + hash(i * 2.2)); c.fillStyle = OR; c.fill(HEART); c.restore(); } }
    function scene(t) {
      stage(t); const sy = scrollY(t), z = 1 + 0.04 * Math.sin(Math.PI * seg(t, TH, 0.4)) + 0.3 * E.inC(seg(t, OUT - 0.15, 0.6));
      camera(540, 960, z, 0, () => { for (let i = 0; i < 3; i++) post(i, 330 + i * PH - sy, t); bigHeart(t); });
      close(t, OUT, END);
    }
    return { dur: DUR, render: t => shutter(t, within(t, MOVE), scene), elements,
      cues() { const ev = [['swish', 0.2, 0.3, 0], ['swish', 1.1, 0.28, 0], ['thud', TS + 0.2, 0.2, 0], ['click', TH - 0.12, 0.4, 0], ['click', TH, 0.5, 0], ['pop', TH + 0.08, 0.4, 0], ['sparkle', TH + 0.3, 0.18, 0]]; for (let x = TH + 0.9; x < TH + 0.9 + CAP.length * 0.035 - 0.3; x += 0.95) ev.push(['typing', x, 0.22, 0]); closeCues(ev, OUT);
        return { dur: DUR, beds: [bed('sketch', DUR)], events: ev }; } };
  }

  // ================================================================ BOOK IT
  function calx() {
    const HEAD = TX('head', pk({ general: 'PICK YOUR DAY', food: 'SAVE YOUR TABLE', estate: 'BOOK A SHOWING', home: 'BOOK YOUR ESTIMATE', beauty: 'BOOK YOUR CHAIR', auto: 'BOOK YOUR DETAIL', hosp: 'SAVE YOUR DATE', retail: 'PLAN YOUR VISIT', pro: 'BOOK A CALL' }), { label: 'Headline', group: 'Headline', upper: true, max: 22 });
    const MONTH = TX('month', 'THIS MONTH', { label: 'Label on the calendar', group: 'Calendar', upper: true, max: 18, hint: 'A month name, or THIS MONTH' });
    const DAY = clamp(parseInt(TX('day', '15', { label: 'Day the ring lands on (1 to 30)', group: 'Calendar', max: 2 }), 10) || 15, 1, 30);
    const TM = ['MORNING', 'AFTERNOON', 'EVENING'].map((d, i) => TX('t' + (i + 1), d, { label: 'Time chip ' + (i + 1), group: 'Calendar', upper: true, max: 14 }));
    const END = TX('end', pk({ general: 'YOUR SPOT IS WAITING', food: 'YOUR TABLE IS WAITING', beauty: 'YOUR CHAIR IS WAITING' }), { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const X0 = 110, Y0 = 520, CW = 860 / 7, RH = 118, TRING = 1.7, HOPS = [((DAY + 9) % 30) + 1, ((DAY + 20) % 30) + 1, DAY], TLAND = TRING + 1.35, TCH = TLAND + 0.6, TC = TCH + 1.0, TAP = TC + 0.9, TBTN = TAP + 0.5, TAP2 = TBTN + 1.3, OUT = TAP2 + 0.7, DUR = OUT + 4.1, MOVE = [[0, 1.6], [TRING, TLAND + 0.6], [TCH, TCH + 1.0], [TC, OUT + 1.2]];
    const CAL0 = [70, 520, 940, 860], CAL = EL && EL.box ? [num(EL.box.x, CAL0[0]), num(EL.box.y, CAL0[1]), num(EL.box.w, CAL0[2]), num(EL.box.h, CAL0[3])] : CAL0, CX = CAL[0] + 40, CY = CAL[1];
    const pos = d => [CX + ((d - 1) % 7 + 0.5) * CW, CY + 230 + Math.floor((d - 1) / 7) * RH];
    function cal(t) {
      const c = ctx, e = SP(t, 0.15, 0.9), H0 = 230 + 5 * RH + 40; c.save(); c.globalAlpha *= clamp(t * 5); c.translate(540, CY + H0 / 2 + (1 - e) * 900); c.rotate((1 - e) * -0.08); c.scale(0.88 + 0.12 * e, 0.88 + 0.12 * e); c.translate(-540, -(CY + H0 / 2));
      shadow(c, 70, 26, 0.45); c.fillStyle = CARD; rr(CAL[0], CY, CAL[2], H0, 44); c.fill(); noShadow(c);
      c.save(); rr(CAL[0], CY, CAL[2], H0, 44); c.clip(); c.fillStyle = OR; c.fillRect(CAL[0], CY, CAL[2], 112); c.restore(); const [mox, moy] = posOf(elP('month'), [540, CY + 74]); tx(MONTH, mox, moy, { size: fit(MONTH, 800, 'Mont', 800, 44, 6), wt: 800, ls: 6, col: onAcc() });
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((d, i) => tx(d, CX + (i + 0.5) * CW, CY + 168, { size: 26, wt: 700, col: MUTE }));
      for (let d = 1; d <= 30; d++) { const [x, y] = pos(d), k = SB(t, 0.55 + d * 0.022, 0.6), sel = d === DAY && t >= TLAND; if (k <= 0) continue; c.save(); c.translate(x, y); c.scale(k, k);
        if (sel) { const s = SB(t, TLAND, 0.7); c.fillStyle = OR; c.beginPath(); c.arc(0, -14, 50 * s, 0, TAU); c.fill(); } tx(String(d), 0, 0, { size: 40, wt: sel ? 800 : 600, col: sel ? onAcc() : INKD }); c.restore(); }
      // the ring hops day to day, then lands
      if (t >= TRING && t < TLAND + 0.05) { const n = HOPS.length, f = (t - TRING) / ((TLAND - TRING) / n), i = Math.min(n - 1, Math.floor(f)), u = K13.SOFT(clamp((f - i) * 1.5)), a = i ? pos(HOPS[i - 1]) : [540, Y0 - 80], b = pos(HOPS[i]), x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) - Math.sin(Math.PI * clamp((f - i) * 1.5)) * 70;
        c.strokeStyle = OR; c.lineWidth = 8; c.beginPath(); c.arc(x, y - 14, 52, 0, TAU); c.stroke(); }
      c.restore();
    }
    const chipY = CY + 230 + 5 * RH + 150, chipX = i => 540 + (i - 1) * 300;
    function chips(t) { const c = ctx; const [tmx, tmy] = posOf(elP('times'), [540, chipY]); TM.forEach((s, i) => { if (!s || t < TCH + i * 0.12) return; const k = SB(t, TCH + i * 0.12, 0.8), on = i === 1 && t >= TAP, fs = fit(s, 800, 'Mont', 220, 28, 2), pu = on ? 1 + 0.08 * Math.sin(Math.PI * seg(t, TAP, 0.35)) : 1;
      c.save(); c.translate(chipX(i) + (tmx - 540), tmy); c.scale(k * pu, k * pu); shadow(c, 22, 8, 0.3); c.fillStyle = on ? OR : CARD; rr(-135, -48, 270, 96, 48); c.fill(); noShadow(c); tx(s, 0, fs * 0.36, { size: fs, wt: 800, ls: 2, col: on ? onAcc() : INKD }); c.restore(); }); ripple(chipX(1) + (tmx - 540), tmy, t, TAP, OR); }
    function elements() { const heP = posOf(elP('headline'), [540, 380]), moP = posOf(elP('month'), [540, CY + 74]), tmP = posOf(elP('times'), [540, chipY]), ctP = posOf(elP('cta'), [540, chipY + 170]); return [
      { id: 'headline', kind: 'pos', label: HEAD, x: heP[0], y: heP[1], t0: 0.35, d: DUR - 0.35, box: [heP[0] - 450, heP[1] - 130, 900, 130], dup: false, del: false },
      { id: 'calendar', kind: 'box', label: 'Calendar', x: CAL[0], y: CAL[1], w: CAL[2], h: CAL[3], t0: 0, d: DUR, box: [CAL[0], CAL[1], CAL[2], CAL[3]], dup: false, del: false },
      { id: 'month', kind: 'pos', label: MONTH, x: moP[0], y: moP[1], t0: 0, d: DUR, box: [moP[0] - 400, moP[1] - 44, 800, 60], dup: false, del: false },
      { id: 'times', kind: 'pos', label: 'Time chips', x: tmP[0], y: tmP[1], t0: TCH, d: DUR - TCH, box: [tmP[0] - 405, tmP[1] - 48, 810, 96], dup: false, del: false },
      { id: 'cta', kind: 'pos', label: CONTACT.cta, x: ctP[0], y: ctP[1], t0: TBTN, d: DUR - TBTN, box: [ctP[0] - 430, ctP[1] - 50, 860, 100], dup: false, del: false },
    ]; }
    function scene(t) {
      stage(t); const z = 1 + 0.03 * SS(t, TRING, 1.2) + 0.3 * E.inC(seg(t, OUT - 0.15, 0.6));
      camera(540, 960 + 40 * SS(t, TCH, 0.8), z, 0, () => {
        const [hex, hey] = posOf(elP('headline'), [540, 380]); words(HEAD, hex, hey, t, 0.35, { size: fit(HEAD, 400, 'Bebas', 900, 130, 3), fam: 'Bebas', wt: 400, ls: 3, shadow: 'rgba(0,0,0,0.4)' }); cal(t); chips(t);
        const [tmx, tmy] = posOf(elP('times'), [540, chipY]), [ctx3, cty] = posOf(elP('cta'), [540, chipY + 170]), by = chipY + 170; if (t >= TBTN) pillBtn(CONTACT.cta, ctx3, cty, { s: SB(t, TBTN, 0.8) * (1 + 0.04 * Math.sin(Math.PI * seg(t, TAP2 - 0.05, 0.3))), a: clamp((t - TBTN) * 6), size: 34, maxW: 860 }); ripple(ctx3, cty, t, TAP2, OR);
        pointer(t, TC, TAP, [880, 1800], [chipX(1) + (tmx - 540) + 40, tmy + 20]); pointer(t, TBTN + 0.5, TAP2, [chipX(1) + (tmx - 540) + 40, tmy + 20], [ctx3 + 60, cty + 14]);
      });
      close(t, OUT, END);
    }
    return { dur: DUR, render: t => shutter(t, within(t, MOVE), scene), elements,
      cues() { const ev = [['whoosh', 0.15, 0.26, 0], ['thud', 0.75, 0.2, 0]]; for (let k = 0; k < 6; k++) ev.push(['tick', 0.6 + k * 0.11, 0.2, (k - 3) * 0.15]); const hop = (TLAND - TRING) / 3; for (let i = 0; i < 3; i++) ev.push([i < 2 ? 'tick' : 'pop', TRING + (i + 0.66) * hop, i < 2 ? 0.4 : 0.42, 0]);
        ev.push(['sparkle', TLAND + 0.05, 0.14, 0]); TM.forEach((s, i) => ev.push(['pop', TCH + i * 0.12, 0.24, (i - 1) * 0.4])); ev.push(['click', TAP, 0.5, 0], ['pop', TBTN + 0.05, 0.3, 0], ['click', TAP2, 0.55, 0]); closeCues(ev, OUT);
        return { dur: DUR, beds: [bed('lounge', DUR)], events: ev }; } };
  }

  // ================================================================ PHOTO WALL
  function gridx() {
    const TITLE = TX('title', pk({ general: 'OUR WORK', food: 'THE MENU', estate: 'ON THE MARKET', home: 'OUR PROJECTS', beauty: 'THE CUTS', auto: 'THE DETAILS', hosp: 'THE EVENTS', retail: 'IN THE SHOP', pro: 'OUR WORK' }), { label: 'Title', group: 'Title', upper: true, max: 18 });
    const SV = services(2), LA = TX('la', SV[0] || 'A CLOSER LOOK', { label: 'Label on the first close-up', group: 'Labels', upper: true, max: 24 }), LB = TX('lb', SV[1] || 'AND ANOTHER', { label: 'Label on the second close-up', group: 'Labels', upper: true, max: 24 });
    const END = TX('end', pk({ general: 'THERE’S MORE TO SEE', food: 'THERE’S MORE ON THE MENU' }), { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const SH6 = [0, 1, 2, 3, 4, 5].map(i => shot('s' + (i + 1), 'Photo ' + (i + 1), 10, 'l')), TW = 440, TH2 = 480, GX = 540 - TW - 14, GY = 420;
    const cell = i => [GX + (i % 2) * (TW + 28), GY + Math.floor(i / 2) * (TH2 + 28)], cen = i => { const [x, y] = cell(i); return [x + TW / 2, y + TH2 / 2]; };
    const A = 0, B = 3, TA = 2.3, TB = 5.0, TBACK = 7.6, OUT = 8.9, DUR = OUT + 4.1, MOVE = [[0, 2.0], [TA - 0.1, TA + 1.1], [TB - 0.1, TB + 1.1], [TBACK - 0.1, OUT + 1.2]];
    const FROM = [[-900, -300], [900, -500], [-1000, 200], [1000, 100], [-800, 900], [900, 1000]];
    function elements() { const tiP = posOf(elP('title'), [540, 320]), laP = posOf(elP('labelA'), [cen(A)[0], cen(A)[1] + TH2 / 2 - 52]), lbP = posOf(elP('labelB'), [cen(B)[0], cen(B)[1] + TH2 / 2 - 52]); return [
      { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 1.1, d: DUR - 1.1, box: [tiP[0] - 450, tiP[1] - 130, 900, 130], dup: false, del: false },
      { id: 'labelA', kind: 'pos', label: LA, x: laP[0], y: laP[1], t0: TA + 0.45, d: TB - TA, box: [laP[0] - 200, laP[1] - 24, 400, 48], dup: false, del: false },
      { id: 'labelB', kind: 'pos', label: LB, x: lbP[0], y: lbP[1], t0: TB + 0.45, d: TBACK - TB, box: [lbP[0] - 200, lbP[1] - 24, 400, 48], dup: false, del: false },
    ]; }
    function scene(t) {
      stage(t); const ka = SS(t, TA, 0.9), kb = SS(t, TB, 0.9), kc = SS(t, TBACK, 0.9), ca = cen(A), cb = cen(B);
      let cx = 540, cy = 960, z = 1; cx = lerp(cx, ca[0], ka); cy = lerp(cy, ca[1], ka); z = lerp(z, 2.05, ka); cx = lerp(cx, cb[0], kb); cy = lerp(cy, cb[1], kb); cx = lerp(cx, 540, kc); cy = lerp(cy, 960, kc); z = lerp(z, 1, kc);
      z *= 1 + 0.03 * Math.sin(t * 0.6) + 0.3 * E.inC(seg(t, OUT - 0.15, 0.6)); const whip = Math.sin(Math.PI * seg(t, TB, 0.7)) * 0.02;
      camera(cx, cy, z, whip, () => {
        const c = ctx; for (let i = 0; i < 6; i++) { const e = SP(t, 0.2 + i * 0.13, 0.9), [x, y] = cell(i), a = clamp((t - 0.2 - i * 0.13) * 6); if (a <= 0) { touch(SH6[i], t); continue; }
          c.save(); c.globalAlpha *= a; c.translate(x + TW / 2 + FROM[i][0] * (1 - e), y + TH2 / 2 + FROM[i][1] * (1 - e) + 5 * Math.sin(t * 1.1 + i * 1.7)); c.rotate((1 - e) * (i % 2 ? 0.4 : -0.4)); c.scale(0.7 + 0.3 * e, 0.7 + 0.3 * e);
          shadow(c, 40, 16, 0.45); c.fillStyle = '#FFFFFF'; rr(-TW / 2, -TH2 / 2, TW, TH2, 26); c.fill(); noShadow(c); pic(SH6[i], t, -TW / 2 + 12, -TH2 / 2 + 12, TW - 24, TH2 - 24, 16); c.restore(); }
        const lab = (s, i, t0, t1, id) => { if (!s || t < t0 + 0.45 || t > t1 + 0.2) return; const [x, y] = cen(i), k = SB(t, t0 + 0.45, 0.8), a = 1 - seg(t, t1 - 0.1, 0.25), fs = fit(s, 800, 'Mont', 330, 22, 2), w = textW(s, F(800, fs, 'Mont'), 2) + 44;
          c.save(); c.globalAlpha *= a; const [lx, ly] = posOf(elP(id), [x, y + TH2 / 2 - 52]); c.translate(lx, ly); c.rotate(-0.03); c.scale(k, k); shadow(c, 12, 4, 0.35); c.fillStyle = OR; rr(-w / 2, -24, w, 48, 10); c.fill(); noShadow(c); tx(s, 0, fs * 0.36, { size: fs, wt: 800, ls: 2, col: onAcc() }); c.restore(); };
        lab(LA, A, TA, TB, 'labelA'); lab(LB, B, TB, TBACK, 'labelB');
        const [tix, tiy] = posOf(elP('title'), [540, 320]); words(TITLE, tix, tiy, t, 1.1, { size: fit(TITLE, 400, 'Bebas', 900, 130, 3), fam: 'Bebas', wt: 400, ls: 3, shadow: 'rgba(0,0,0,0.45)', a: clamp(1 - seg(t, TA, 0.3) + seg(t, TBACK + 0.3, 0.4)) });
      });
      close(t, OUT, END);
    }
    return { dur: DUR, render: t => shutter(t, within(t, MOVE), scene), elements,
      cues() { const ev = []; for (let i = 0; i < 6; i++) ev.push(['paper', 0.25 + i * 0.13, 0.28, i % 2 ? 0.4 : -0.4]); ev.push(['thud', 1.05, 0.22, 0], ['pop', 1.3, 0.26, 0], ['whoosh', TA + 0.1, 0.32, -0.3], ['pop', TA + 0.6, 0.28, 0], ['swish', TB + 0.05, 0.36, 0.4], ['pop', TB + 0.6, 0.28, 0], ['whoosh', TBACK + 0.1, 0.28, 0]); closeCues(ev, OUT);
        return { dur: DUR, beds: [bed('pulse', DUR)], events: ev }; } };
  }

  // ================================================================ LOGO POP
  function stingx() {
    const LINE = TX('line', CONTACT.tagline ? up(CONTACT.tagline) : pk({ general: 'GOOD WORK, DONE RIGHT', food: 'MADE FRESH DAILY', estate: 'LET’S FIND YOUR PLACE', home: 'BUILT RIGHT', beauty: 'LOOK SHARP', auto: 'SHOWROOM CLEAN', hosp: 'YOUR EVENT, HANDLED', retail: 'COME SEE WHAT’S NEW', pro: 'HERE TO HELP' }), { label: 'Line under the logo (a dash leaves it off)', group: 'Line', upper: true, max: 36 });
    const DUR = 5, T0 = 0.15, TL = 0.75;
    function elements() { const lgP = posOf(elP('logo'), [540, 900]), liP = posOf(elP('line'), [540, 1400]), coP = posOf(elP('contact'), [540, 1490]); const con = [CONTACT.phone, up(CONTACT.web)].filter(Boolean).join('   ·   '); return [
      { id: 'logo', kind: 'pos', label: 'Logo', x: lgP[0], y: lgP[1], t0: TL, d: DUR - TL, box: [lgP[0] - 350, lgP[1] - 210, 700, 420], dup: false, del: false },
      { id: 'line', kind: 'pos', label: LINE, x: liP[0], y: liP[1], t0: TL + 0.75, d: DUR - (TL + 0.75), box: [liP[0] - 450, liP[1] - 92, 900, 92], dup: false, del: false },
      { id: 'contact', kind: 'pos', label: 'Contact line', x: coP[0], y: coP[1], t0: TL + 1.5, d: DUR - (TL + 1.5), box: [coP[0] - 450, coP[1] - 28, 900, 50], dup: false, del: false },
    ].filter(e => e.id !== 'line' || !dash(LINE)).filter(e => e.id !== 'contact' || con); }
    function scene(t) {
      stage(t, { dots: 0.05 }); const c = ctx, k = K13.SOFT(seg(t, T0, 0.8)), out = E.inC(seg(t, DUR - 0.45, 0.4));
      camera(540, 960, 1 + 0.05 * seg(t, 0, DUR) + 0.08 * (1 - K13.SPRING(seg(t, TL, 0.9))), 0, () => {
        const [lgx, lgy] = posOf(elP('logo'), [540, 900]);
        // the colour bursts open, then tucks back to a disc behind the logo
        const r = lerp(0, 1500, E.outQ(seg(t, T0, 0.5))) * (1 - 0.74 * SS(t, TL - 0.1, 0.7)); c.fillStyle = OR; c.beginPath(); c.arc(lgx, lgy, Math.max(0, r), 0, TAU); c.fill();
        for (let i = 0; i < 3; i++) { const u = seg(t, TL + 0.05 + i * 0.12, 0.9); if (u <= 0 || u >= 1) continue; c.save(); c.globalAlpha *= (1 - u) * 0.7; c.strokeStyle = i % 2 ? WHT : OR; c.lineWidth = 10 * (1 - u) + 2; c.beginPath(); c.arc(lgx, lgy, 380 + 420 * E.outC(u), 0, TAU); c.stroke(); c.restore(); }
        for (let i = 0; i < 14; i++) { const u = seg(t, TL + 0.02, 0.8 + hash(i) * 0.4); if (u <= 0 || u >= 1) continue; const ang = i / 14 * TAU + hash(i * 3.3), d = 360 + E.outC(u) * (260 + hash(i * 5.1) * 260); c.save(); c.globalAlpha *= 1 - u; c.translate(lgx + Math.cos(ang) * d, lgy + Math.sin(ang) * d); c.rotate(ang + u * 3); c.fillStyle = i % 3 ? OR : WHT; c.fillRect(-14, -5, 28, 10); c.restore(); }
        // the logo: springs up out of the disc and catches a sweep of light
        const img = logoImg(K8.onCol(OR) !== '#FFFFFF'), [lw0, lh0] = logoBox(560), e = K13.BOUNCY(seg(t, TL, 1.0)), la = clamp((t - TL) * 8);
        if (img && la > 0 && !VID.collecting) { const sc = scratch('nx8logo', 700, 420), g = sc.g; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, 700, 420); g.drawImage(img, 350 - lw0 / 2, 210 - lh0 / 2, lw0, lh0);
          const sx = lerp(-200, 900, E.inOutS(seg(t, TL + 0.75, 0.8))); g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(sx - 120, 0, sx + 120, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 700, 420); g.globalCompositeOperation = 'source-over';
          c.save(); c.globalAlpha *= la * (1 - out); c.translate(lgx, lgy + (1 - e) * 260); c.rotate((1 - e) * -0.14); c.scale(0.5 + 0.5 * e, 0.5 + 0.5 * e); c.drawImage(sc, -350, -210); c.restore(); }
        if (!dash(LINE)) { const [lix, liy] = posOf(elP('line'), [540, 1400]); words(LINE, lix, liy, t, TL + 0.75, { size: fit(LINE, 400, 'Bebas', 900, 92, 3), fam: 'Bebas', wt: 400, ls: 3, st: 0.07, a: 1 - out }); }
        const con = [CONTACT.phone, up(CONTACT.web)].filter(Boolean).join('   ·   '); if (con) { const [cox, coy] = posOf(elP('contact'), [540, 1490]); tx(con, cox, coy, { size: fit(con, 700, 'Mont', 900, 28, 3), wt: 700, ls: 3, col: WA(0.86), a: seg(t, TL + 1.5, 0.4) * (1 - out) }); }
      });
      if (out > 0) fillScreen(DEEP2, out);
    }
    return { dur: DUR, shakes: [[TL + 0.3, 6]], render: t => shutter(t, t < 3.2 || t > DUR - 0.5, scene), elements,
      cues() { return { dur: DUR, beds: [], events: [['riser', T0 + 0.5, 0.2, 0], ['whoosh', T0 + 0.1, 0.36, 0], ['impact', TL + 0.28, 0.42, 0], ['sparkle', TL + 0.4, 0.2, 0], ['shimmer', TL + 0.8, 0.18, 0], ['pop', TL + 0.8, 0.22, 0], ['chime', TL + 1.5, 0.24, 0]] }; } };
  }

  // ================================================================ YOUR WEBSITE
  function browserx() {
    const URLT = TX('url', (CONTACT.web || 'yourbusiness.com').toLowerCase().replace(/^https?:\/\//, ''), { label: 'Web address typed in the bar', group: 'The browser', max: 34 });
    const HEAD = TX('head', pk({ general: 'Good work,\ndone right.', food: 'Made fresh,\nevery day.', estate: 'Find the place\nthat fits.', home: 'Built right,\nstart to finish.', beauty: 'Walk in.\nLook sharp.', auto: 'Clean inside\nand out.', hosp: 'Your event,\nhandled.', retail: 'Come see\nwhat’s new.', pro: 'Straight answers,\nreal help.' }), { label: 'Headline on your page (two lines)', group: 'Your page', multiline: true, max: 44 });
    const END = TX('end', 'IT’S ALL ONLINE', { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const S1 = shot('s1', 'Top of your page', 9, 'l'), S2 = shot('s2', 'Lower on your page', 6, 'l'), SV = services(3);
    const BX = 70, BY = 300, BW = 940, BH = 1380, T0 = 0.9, TYPE = URLT.length * 0.06, TGO = T0 + TYPE + 0.3, TLOAD = TGO + 0.35, TSC = TLOAD + 2.0, TC = TSC + 1.5, TAP = TC + 0.9, OUT = TAP + 0.7, DUR = OUT + 4.1, MOVE = [[0, 1.2], [TGO, TLOAD + 1.3], [TSC - 0.1, TSC + 1.2], [TC, OUT + 1.2]];
    const WBOX0 = [BX, BY, BW, BH], WBOX = EL && EL.box ? [num(EL.box.x, WBOX0[0]), num(EL.box.y, WBOX0[1]), num(EL.box.w, WBOX0[2]), num(EL.box.h, WBOX0[3])] : WBOX0;
    function elements() { return [
      { id: 'window', kind: 'box', label: 'Browser window', x: WBOX[0], y: WBOX[1], w: WBOX[2], h: WBOX[3], t0: 0, d: DUR, box: [WBOX[0], WBOX[1], WBOX[2], WBOX[3]], dup: false, del: false },
    ]; }
    const PAGE = 2060, VIEW = WBOX[3] - 150, scroll = t => (PAGE - VIEW) * SS(t, TSC, 1.1), btnY = 1660;
    function page(t) {   // your page, in page coordinates (0 at the top of the page), clipped to the window
      const c = ctx, lo = clamp((t - TLOAD) * 4), ls = String(HEAD).split('\n'), fs = Math.min(...ls.map(l => fit(l, 800, 'Mont', 760, 84, -1)));
      c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, BW, PAGE); if (lo <= 0) { touch(S1, 0); touch(S2, 0); return; }
      c.save(); c.globalAlpha *= lo; pic(S1, t - TLOAD, 0, 0, BW, 760, 0); const g = c.createLinearGradient(0, 240, 0, 760); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.72)'); c.fillStyle = g; c.fillRect(0, 0, BW, 760);
      const img = logoImg(false), [lw, lh] = logoBox(250); if (img) c.drawImage(img, 44, 40, lw, lh);
      ls.forEach((ln, i) => { const e = SP(t, TLOAD + 0.3 + i * 0.14, 0.8); tx(ln, 50, 610 - (ls.length - 1 - i) * fs * 1.08 + (1 - e) * 60, { size: fs, wt: 800, ls: -1, col: '#FFFFFF', align: 'left', a: clamp((t - TLOAD - 0.3 - i * 0.14) * 6) }); });
      c.fillStyle = OR; rr(50, 660, 300 * E.outC(seg(t, TLOAD + 0.7, 0.5)), 10, 5); c.fill();
      tx('WHAT WE DO', 50, 870, { size: 26, wt: 800, ls: 6, col: MUTE, align: 'left' });
      const list = SV.length ? SV : ['OUR WORK', 'OUR PEOPLE', 'OUR PROMISE']; list.forEach((s, i) => { const y = 920 + i * 150, k = SS(t, TLOAD + 0.55 + i * 0.12, 0.7); c.save(); c.translate((1 - k) * 200, 0); c.globalAlpha *= clamp(k * 3); c.fillStyle = '#F1F2F5'; rr(50, y, BW - 100, 124, 24); c.fill(); c.fillStyle = OR; rr(74, y + 24, 76, 76, 20); c.fill(); tx(String(i + 1), 112, y + 76, { size: 36, wt: 900, col: onAcc() }); tx(s, 184, y + 76, { size: fit(s, 800, 'Mont', BW - 300, 34, 1), wt: 800, ls: 1, col: INKD, align: 'left' }); c.restore(); });
      pic(S2, t - TSC, 50, 1400, BW - 100, 170, 24);
      const pu = 1 + 0.05 * Math.sin(Math.PI * seg(t, TAP - 0.05, 0.3)); pillBtn(CONTACT.cta, BW / 2, btnY, { s: pu, size: 32, maxW: 800 });
      const con = [CONTACT.phone, CONTACT.web].filter(Boolean).join('  ·  '); if (con) tx(con, BW / 2, 1790, { size: fit(con, 600, 'Mont', 800, 26, 1), wt: 600, ls: 1, col: MUTE });
      c.fillStyle = '#F1F2F5'; c.fillRect(0, 1870, BW, 190); tx('© ' + NAME, BW / 2, 1975, { size: fit('© ' + NAME, 500, 'Mont', 800, 24, 0), wt: 500, col: MUTE });
      c.restore();
    }
    function win(t) {
      const c = ctx, e = SP(t, 0.15, 0.9), BX = WBOX[0], BY = WBOX[1], BW = WBOX[2], BH = WBOX[3]; c.save(); c.globalAlpha *= clamp(t * 5); c.translate(540, BY + BH / 2 + (1 - e) * 1000); c.rotate((1 - e) * 0.06); c.scale(0.86 + 0.14 * e, 0.86 + 0.14 * e); c.translate(-540, -(BY + BH / 2));
      shadow(c, 80, 30, 0.5); c.fillStyle = '#F4F5F7'; rr(BX, BY, BW, BH, 36); c.fill(); noShadow(c);
      ['#FF5F57', '#FEBC2E', '#28C840'].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(BX + 56 + i * 44, BY + 62, 14, 0, TAU); c.fill(); });
      const press = 1 - 0.03 * Math.sin(Math.PI * seg(t, TGO - 0.05, 0.25)); c.save(); c.translate(BX + BW / 2 + 70, BY + 62); c.scale(press, press); c.fillStyle = '#FFFFFF'; rr(-330, -34, 660, 68, 34); c.fill(); c.strokeStyle = t < TGO ? OR : '#DADCE2'; c.lineWidth = 3; c.stroke();
      const n = clamp(Math.floor((t - T0) / 0.06), 0, URLT.length), str = URLT.slice(0, n), fs = fit(URLT, 500, 'Mont', 560, 30, 0); tx(str, -296, fs * 0.36, { size: fs, wt: 500, col: INKD, align: 'left' }); if (t < TGO && Math.floor(t * 2.4) % 2 === 0) { c.fillStyle = OR; c.fillRect(-292 + textW(str, F(500, fs, 'Mont'), 0), -fs * 0.55, 3, fs * 1.1); } c.restore();
      // loading bar, then the page
      const lb = E.outC(seg(t, TGO, 0.4)) * (1 - seg(t, TLOAD + 0.15, 0.2)); if (lb > 0) { c.fillStyle = OR; c.fillRect(BX, BY + 122, BW * E.outC(seg(t, TGO, 0.45)), 6); }
      c.save(); c.beginPath(); c.roundRect(BX, BY + 128, BW, BH - 128, [0, 0, 36, 36]); c.clip(); c.translate(BX, BY + 128 - scroll(t)); page(t); c.restore();
      c.restore();
    }
    function scene(t) {
      stage(t); const z = 1 + 0.035 * SS(t, TLOAD, 0.9) + 0.3 * E.inC(seg(t, OUT - 0.15, 0.6));
      camera(540, 960, z, 0, () => { win(t); cursor(t, TC, TAP, [900, 1750], [WBOX[0] + WBOX[2] / 2 + 60, WBOX[1] + 128 + btnY - (PAGE - VIEW) + 6]); ripple(WBOX[0] + WBOX[2] / 2, WBOX[1] + 128 + btnY - (PAGE - VIEW), t, TAP, OR); });
      close(t, OUT, END);
    }
    return { dur: DUR, render: t => shutter(t, within(t, MOVE), scene), elements,
      cues() { const ev = [['whoosh', 0.15, 0.26, 0], ['thud', 0.75, 0.2, 0]]; for (let x = T0; x < T0 + TYPE - 0.2; x += 0.95) ev.push(['typing', x, 0.3, 0]); ev.push(['click', TGO, 0.45, 0], ['swish', TGO + 0.1, 0.26, 0], ['pop', TLOAD + 0.35, 0.26, 0], ['swish', TSC, 0.32, 0]); [0, 1, 2].forEach(i => ev.push(['tick', TSC + 0.3 + i * 0.12, 0.3, (i - 1) * 0.3])); ev.push(['click', TAP, 0.55, 0], ['sparkle', TAP + 0.05, 0.14, 0]); closeCues(ev, OUT);
        return { dur: DUR, beds: [bed('night', DUR)], events: ev }; } };
  }

  const P = ({ mapx, feedx, calx, gridx, stingx, browserx }[V] || mapx)();
  DIR = { dur: P.dur, bg: BLK, finish: { vig: 0.16, grain: 0.14 }, edl: [], shakes: P.shakes || [], preload: () => K3.init(), render: P.render, cues: P.cues, ...(P.elements ? { elements: P.elements } : {}) };
});
