'use strict';
/* NexGen templates V19 (Nov 11): motion showpieces. Fully animated pieces any business can use, built on kit 13: every move
   is a spring, the whole scene is shot through a real shutter (motion blur on everything that moves) and a virtual camera
   pushes, whips and settles. They use the brand's own colours, fonts, logo, services and contact block.
   ?v=searchx  Search to Found   a search bar types what your customers look for, the results load and your business
                                 card springs up as the answer, with your photo, services and a tap on your call to action
   ?v=phonex   On Your Phone     a phone rises with your photo or clip on its screen, three notifications drop in, then
                                 the phone steps aside for your headline
   ?v=stackx   Photo Stack       four photos as a deck of prints: each one is flicked away to show the next, with a label
   ?v=typex    Spring Type       no footage at all: five lines of big type, each with its own move, cut on the beat
   Starting copy is sample text for the brand's industry and is there to be replaced. Nothing is invented as fact: no
   ratings, prices or counts. The music and effects are mixed in the browser from the cues (js/nx-sound.js). */
// The showpiece toolkit: stage, camera, shutter, springs, photo cards, pointer, buttons and the shared ending. Built per
// template build (it reads the brand), and shared with later showpiece files (tpl_nx8.js).
function SHOWKIT() {
  const TAU = Math.PI * 2;
  const SECT = { restaurant: 'food', realestate: 'estate', hardscape: 'home', fencing: 'home', landscaping: 'home', roofing: 'home', cleaning: 'home', pressure: 'home', barbershop: 'beauty', salon: 'beauty', detailing: 'auto', events: 'hosp', retail: 'retail', pro: 'pro' };
  const IND0 = (window.NX && NX.INDUSTRIES && NX.INDUSTRIES[BRAND.industry]) || {};
  const SEC = SECT[BRAND.industry] || SECT[IND0.base] || (BRAND.parts ? 'home' : 'general');
  const pk = P => P[SEC] || P.general;
  const up = s => String(s == null ? '' : s).toUpperCase();
  const seg = (t, a, d) => clamp((t - a) / d);
  const SP = (t, a, d) => K13.SPRING(seg(t, a, d || 0.7)), SS = (t, a, d) => K13.SOFT(seg(t, a, d || 0.6)), SB = (t, a, d) => K13.BOUNCY(seg(t, a, d || 0.9));
  const onAcc = () => K8.onCol(OR), INKD = '#14141A', CARD = '#FFFFFF', MUTE = '#6B6B78';
  const tx = (s, x, y, o) => K9.tx(s, x, y, o);
  const fit = (s, wt, fam, maxW, maxS, ls) => Math.min(maxS, fitSize(s || ' ', wt, maxW, maxS, fam, ls || 0));
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, Math.max(0, h), Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2))); };
  const logoImg = dark => (dark ? IMG.logoB || IMG.logoW : IMG.logoW || IMG.logoB);
  const services = n => { const s = (BRAND.services || []).map(up).filter(Boolean); return s.slice(0, n); };
  const shot = (key, label, d, ph) => { const s = SHOT(key, ['nofoot.' + key, 0], { label, group: 'Photos & clips', kind: 'any', ph: ph || 'v', d: d + 0.3 }); return { c: s[0], in: s[1] }; };
  // a photo or clip drawn cover-fit into a rounded box under the current transform (so cards can tilt, fly and scale)
  function pic(s, lt, x, y, w, h, r) {
    const m = VID.meta(s.c); if (!m) return; const ts = m.still ? 0 : clamp(s.in + Math.max(0, lt), 0, (m.n - 1.5) / 30), q = w * h > 420000 ? 'f' : 'h', img = VID.get(s.c, VID.idx(s.c, ts), q);
    if (VID.collecting || !img) return; const k = Math.max(w / img.width, h / img.height), sw = w / k, sh = h / k;
    ctx.save(); rr(x, y, w, h, r || 0); ctx.clip(); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h); ctx.restore();
  }
  const touch = (s, lt) => { const m = VID.meta(s.c); if (m) VID.get(s.c, VID.idx(s.c, m.still ? 0 : clamp(s.in + Math.max(0, lt), 0, (m.n - 1.5) / 30)), 'h'); };
  // the stage: the brand's dark, two slow glows in its accent and a fine dot grid (swap it in Style > Background)
  function stage(t, o) {
    o = o || {};
    BACKDROP(() => { if (VID.collecting) return; const c = ctx; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, DEEP1); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const glow = (x, y, r, a) => { const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, ORA(a)); gr.addColorStop(1, ORA(0)); c.fillStyle = gr; c.fillRect(x - r, y - r, r * 2, r * 2); };
      glow(W * 0.2 + 90 * Math.sin(t * 0.31), H * 0.22 + 70 * Math.cos(t * 0.27), 760, LIGHTPAL ? 0.16 : 0.3); glow(W * 0.85 + 80 * Math.cos(t * 0.23 + 1), H * 0.8 + 90 * Math.sin(t * 0.19 + 2), 820, LIGHTPAL ? 0.12 : 0.22);
      c.fillStyle = WA(o.dots === undefined ? 0.07 : o.dots); const dy = (t * 14) % 60; for (let y = -60 + dy; y < H + 60; y += 60) for (let x = 30; x < W; x += 60) c.fillRect(x, y, 3, 3);
      c.restore(); });
  }
  // everything inside fn is seen through a camera looking at (cx, cy) with zoom z and roll rot
  function camera(cx, cy, z, rot, fn) { ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); ctx.translate(W / 2, H / 2); ctx.scale(z, z); if (rot) ctx.rotate(rot); ctx.translate(-cx, -cy); try { fn(); } finally { ctx.restore(); } }
  // the scene through a shutter: rendered at several moments inside the frame and averaged, while anything is moving
  function shutter(t, moving, scene) {
    if (VID.collecting) { scene(t); if (moving) scene(Math.max(0, t - 0.6 / 30)); return; }   // the shutter also needs the footage frame just before this one
    if (!moving) { scene(t); return; }
    const N = window.NX && NX.FB && NX.FB.mode === 'play' && !(NX.app && NX.app.R && NX.app.R.lock) ? 4 : 8, acc = scratch('nx7acc');   // 4 or 8: the shares add back to exactly full
    acc.g.setTransform(1, 0, 0, 1, 0, 0); acc.g.globalCompositeOperation = 'copy'; acc.g.globalAlpha = 1 / N; acc.g.drawImage(K4.into('nx7s', () => scene(t)), 0, 0); acc.g.globalCompositeOperation = 'lighter';
    for (let k = 1; k < N; k++) acc.g.drawImage(K4.into('nx7s', () => scene(Math.max(0, t - 0.6 / 30 * k / N))), 0, 0);
    acc.g.globalAlpha = 1; acc.g.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(acc, 0, 0); ctx.restore();
  }
  const within = (t, list) => list.some(([a, b]) => t >= a && t <= b);
  // words that spring up one after another, centred on x (under the current transform)
  function words(str, x, y, t, t0, o) {
    o = o || {}; if (VID.collecting || !str || t < t0) return; const size = o.size || 90, fam = o.fam || 'Mont', wt = o.wt || 900, ls = o.ls || 0, f = F(wt, size, fam), ws = String(str).split(/\s+/).filter(Boolean), st = o.st === undefined ? 0.08 : o.st;
    const sw = textW(' ', f, ls), wd = ws.map(w => textW(w, f, ls)), tot = wd.reduce((a, b) => a + b, 0) + sw * (ws.length - 1); let cx = x - tot / 2; const a0 = o.a === undefined ? 1 : o.a;
    ws.forEach((w, i) => { const e = K13.SPRING(seg(t, t0 + i * st, o.d || 0.7)), a = clamp((t - t0 - i * st) * 7) * a0; if (a > 0) { ctx.save(); ctx.translate(cx + wd[i] / 2, y); ctx.translate(0, (1 - e) * size * 0.8); ctx.scale(0.6 + 0.4 * e, 0.6 + 0.4 * e);
      tx(w, 0, 0, { size, wt, fam, ls, col: o.hl === i ? OR : o.col || WHT, a, shadow: o.shadow }); ctx.restore(); } cx += wd[i] + sw; });
  }
  function ripple(x, y, t, t0, col) { const u = seg(t, t0, 0.6); if (u <= 0 || u >= 1 || VID.collecting) return; const c = ctx; c.save(); c.globalAlpha *= (1 - u) * 0.9; c.strokeStyle = col || OR; c.lineWidth = 8 * (1 - u) + 2; c.beginPath(); c.arc(x, y, 20 + 110 * E.outC(u), 0, TAU); c.stroke(); c.restore(); }
  // a finger-tip pointer travelling from p0 to p1 and pressing at tTap
  function pointer(t, t0, tTap, p0, p1) {
    if (VID.collecting || t < t0 || t > tTap + 0.5) return; const u = E.inOutC(seg(t, t0, tTap - t0 - 0.05)), x = lerp(p0[0], p1[0], u), y = lerp(p0[1], p1[1], u) - Math.sin(Math.PI * u) * 60, pr = 1 - 0.22 * Math.sin(Math.PI * seg(t, tTap - 0.08, 0.22)), a = clamp((t - t0) * 6) * (1 - seg(t, tTap + 0.25, 0.25)), c = ctx;
    c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(pr, pr); c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 22; c.shadowOffsetY = 8; c.fillStyle = 'rgba(255,255,255,0.94)'; c.beginPath(); c.arc(0, 0, 34, 0, TAU); c.fill(); c.shadowColor = 'transparent'; c.lineWidth = 5; c.strokeStyle = 'rgba(20,20,26,0.28)'; c.stroke(); c.restore();
  }
  function pillBtn(label, x, y, o) { o = o || {}; const size = o.size || 34, fam = 'Mont', t0 = up(label), fs = fit(t0, 800, fam, (o.maxW || 760) - 90, size, 2.5), w = textW(t0, F(800, fs, fam), 2.5) + 90, h = fs * 2.5, c = ctx;
    c.save(); c.globalAlpha *= o.a === undefined ? 1 : o.a; c.translate(x, y); c.scale(o.s || 1, o.s || 1); c.shadowColor = 'rgba(0,0,0,0.3)'; c.shadowBlur = 24; c.shadowOffsetY = 8; c.fillStyle = o.bg || OR; rr(-w / 2, -h / 2, w, h, h / 2); c.fill(); c.shadowColor = 'transparent';
    tx(t0, 0, fs * 0.36, { size: fs, wt: 800, fam, ls: 2.5, col: o.col || onAcc() }); c.restore(); return [w, h]; }
  // the ending every showpiece shares: the scene dims, the logo springs in, the line, the call to action, the contact block
  function close(t, OUT, line) {
    const ot = t - OUT; if (ot < 0 || VID.collecting) return; const c = ctx; c.save(); c.setTransform(1, 0, 0, 1, SH.x, SH.y);
    c.fillStyle = rgbaOf(DEEP2, seg(ot, 0, 0.45)); c.fillRect(-20, -20, W + 40, H + 40);
    const img = logoImg(LIGHTPAL), [lw, lh] = logoBox(620), e = SP(ot, 0.2, 0.8), la = clamp((ot - 0.2) * 5);
    if (img && la > 0) { c.save(); c.globalAlpha = la; c.translate(W / 2, 640); c.scale(0.7 + 0.3 * e, 0.7 + 0.3 * e); c.drawImage(img, -lw / 2, -lh / 2, lw, lh); c.restore(); }
    c.fillStyle = OR; const rw = 220 * E.outC(seg(ot, 0.55, 0.5)); c.fillRect(W / 2 - rw / 2, 640 + lh / 2 + 54, rw, 6);
    if (line) { const ls = String(line).split('\n'); ls.forEach((ln, i) => words(up(ln), W / 2, 640 + lh / 2 + 190 + i * 96, t, OUT + 0.7 + i * 0.18, { size: fit(up(ln), 400, 'Bebas', 920, 96, 2), fam: 'Bebas', wt: 400, ls: 2, st: 0.07 })); }
    const cy = 640 + lh / 2 + 190 + String(line || '').split('\n').length * 96 + 70, be = SB(ot, 1.25, 0.9);
    if (ot > 1.25) pillBtn(CONTACT.cta, W / 2, cy, { s: 0.5 + 0.5 * be, a: clamp((ot - 1.25) * 6), size: 34, maxW: 900 });
    const con = [CONTACT.phone, up(CONTACT.web)].filter(Boolean).join('   ·   '); if (con) tx(con, W / 2, cy + 132, { size: fit(con, 700, 'Mont', 900, 28, 3), wt: 700, ls: 3, col: WA(0.86), a: seg(ot, 1.8, 0.4) });
    if (CONTACT.lic) tx(CONTACT.lic, W / 2, cy + 180, { size: 22, wt: 600, ls: 3, col: WA(0.6), a: seg(ot, 1.95, 0.4) });
    c.restore();
  }
  const closeCues = (ev, OUT) => { ev.push(['swell', OUT - 0.1, 0.28, 0], ['whoosh', OUT + 0.15, 0.3, 0], ['pop', OUT + 0.55, 0.3, 0], ['tink', OUT + 0.75, 0.2, 0.2], ['pop', OUT + 1.4, 0.34, 0], ['chime', OUT + 1.8, 0.22, 0]); };
  const bed = (style, dur) => ['music', 0, dur, 0.85, { style, end: dur - 0.6 }];
  return { TAU, SEC, pk, up, seg, SP, SS, SB, onAcc, INKD, CARD, MUTE, tx, fit, rr, logoImg, services, shot, pic, touch, stage, camera, shutter, within, words, ripple, pointer, pillBtn, close, closeCues, bed };
}
STUDIO_REG['nx7'] = (() => {
  const V = QS.get('v') || 'searchx';
  // Per-element model (b): tpl_free sets window.__NX_BLOCK_EL to the block's `el` data before calling this
  // function; positions below fall back to the original hardcoded values when EL is null, so rendering
  // is byte-for-byte the old path. Note: these showpieces draw inside a camera() transform (zoom ~1.0-1.35,
  // centre ~960-1000), so element positions are in template space — the camera adds a small live offset
  // (up to ~50px) between the inspector overlay box and the visible text. Drag still moves the element.
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const { TAU, SEC, pk, up, seg, SP, SS, SB, onAcc, INKD, CARD, MUTE, tx, fit, rr, logoImg, services, shot, pic, touch, stage, camera, shutter, within, words, ripple, pointer, pillBtn, close, closeCues, bed } = SHOWKIT();

  // ================================================================ SEARCH TO FOUND
  function searchx() {
    const noun = pk({ general: 'services', food: 'restaurants', estate: 'homes for sale', home: 'patio builders', beauty: 'barber', auto: 'car detailing', hosp: 'event venue', retail: 'gift shop', pro: 'consultants' });
    const QUERY = TX('query', ((BRAND.services || [])[0] ? String(BRAND.services[0]).toLowerCase() : noun) + ' near me', { label: 'What they type in the search bar', group: 'The search', max: 30, hint: 'What your customers actually search for' });
    const LINE = TX('line', CONTACT.tagline || pk({ general: 'Here when you need us.', food: 'Made fresh, every day.', estate: 'Let’s find your place.', home: 'Built right, start to finish.', beauty: 'Walk in. Look sharp.', auto: 'Clean inside and out.', hosp: 'Your event, handled.', retail: 'Come see what’s new.', pro: 'Straight answers, real help.' }), { label: 'Line under your name', group: 'Your card', max: 44 });
    const AREA = TX('area', CONTACT.area ? up(CONTACT.area) : '-', { label: 'Area (a dash leaves it off)', group: 'Your card', upper: true, max: 30 });
    const END = TX('end', 'FOUND WHAT YOU\nWERE LOOKING FOR?', { label: 'Ending line', group: 'Ending', upper: true, multiline: true, max: 40 });
    const S1 = shot('s1', 'Photo on your card', 8, 'l'), CH = services(3);
    const T0 = 0.9, TYPE = QUERY.length * 0.07, TA = T0 + TYPE + 0.4, TB = TA + 0.3, TC = TB + 2.5, TAP = TC + 0.95, OUT = TAP + 0.75, DUR = OUT + 4.2;
    const NAME = BRAND.name || 'Your business', cardY = 590, cardH = 900 + (CH.length ? 80 : 0), PHH = 540;
    const BX0 = [90, cardY, 900, cardH], BX = EL && EL.box ? [num(EL.box.x, BX0[0]), num(EL.box.y, BX0[1]), num(EL.box.w, BX0[2]), num(EL.box.h, BX0[3])] : BX0;
    function elements() { const CCX = BX[0] + BX[2] / 2, barP = posOf(elP('searchbar'), [540, 430]), nmP = posOf(elP('name'), [BX[0] + 50, BX[1] + PHH + 110]), liP = posOf(elP('line'), [BX[0] + 50, BX[1] + PHH + 166]), ctP = posOf(elP('cta'), [CCX, BX[1] + BX[3] - 78]); return [
      { id: 'searchbar', kind: 'pos', label: 'Search bar', x: barP[0], y: barP[1], t0: 0, d: DUR, box: [barP[0] - 450, barP[1] - 62, 900, 124], dup: false, del: false },
      { id: 'card', kind: 'box', label: 'Business card', x: BX[0], y: BX[1], w: BX[2], h: BX[3], t0: TB + 0.45, d: DUR - (TB + 0.45), box: [BX[0], BX[1], BX[2], BX[3]], dup: false, del: false },
      { id: 'name', kind: 'pos', label: NAME, x: nmP[0], y: nmP[1], t0: TB + 0.45, d: DUR - (TB + 0.45), box: [nmP[0], nmP[1] - 62, BX[2] - 100, 80], dup: false, del: false },
      { id: 'line', kind: 'pos', label: LINE, x: liP[0], y: liP[1], t0: TB + 0.45, d: DUR - (TB + 0.45), box: [liP[0], liP[1] - 32, BX[2] - 100, 50], dup: false, del: false },
      { id: 'cta', kind: 'pos', label: CONTACT.cta, x: ctP[0], y: ctP[1], t0: TB + 1.35, d: DUR - (TB + 1.35), box: [ctP[0] - 380, ctP[1] - 40, 760, 80], dup: false, del: false },
    ].filter(e => e.id !== 'line' || LINE); }
    const MOVE = [[0, 1.2], [TA - 0.1, TB + 1.4], [TC, OUT + 1.2]];
    function bar(t) {   // the search bar: types, is pressed, then rides up to the top of the results
      const [barX, barY] = posOf(elP('searchbar'), [540, 430]);
      const e0 = SP(t, 0.15, 0.8), up2 = SS(t, TB, 0.6), y = lerp(lerp(1120, 860, e0), 430, up2) + (barY - 430), w = lerp(900, 880, up2), h = 124, press = 1 - 0.035 * Math.sin(Math.PI * seg(t, TA - 0.06, 0.26)), a = clamp(t * 6), c = ctx;
      c.save(); c.globalAlpha *= a; c.translate(barX, y); c.scale(press * (0.8 + 0.2 * e0), press * (0.8 + 0.2 * e0));
      c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 50; c.shadowOffsetY = 18; c.fillStyle = CARD; rr(-w / 2, -h / 2, w, h, h / 2); c.fill(); c.shadowColor = 'transparent';
      c.strokeStyle = OR; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.arc(-w / 2 + 68, -4, 20, 0, TAU); c.moveTo(-w / 2 + 83, 12); c.lineTo(-w / 2 + 98, 28); c.stroke();
      const n = clamp(Math.floor((t - T0) / 0.07), 0, QUERY.length), str = QUERY.slice(0, n), fs = fit(QUERY, 600, 'Mont', w - 260, 46, 0), f = F(600, fs, 'Mont');
      tx(str, -w / 2 + 122, fs * 0.36 - 2, { size: fs, wt: 600, col: INKD, align: 'left' });
      if (t < TA && Math.floor(t * 2.4) % 2 === 0) { c.fillStyle = OR; c.fillRect(-w / 2 + 126 + textW(str, f, 0), -fs * 0.55, 4, fs * 1.1); }
      const k = SB(t, TA - 0.05, 0.7); c.fillStyle = OR; c.beginPath(); c.arc(w / 2 - 62, 0, 44 * (t < TA - 0.05 ? 1 : 0.86 + 0.14 * k), 0, TAU); c.fill();
      c.strokeStyle = onAcc(); c.lineWidth = 6; c.beginPath(); c.moveTo(w / 2 - 78, 0); c.lineTo(w / 2 - 48, 0); c.moveTo(w / 2 - 60, -12); c.lineTo(w / 2 - 48, 0); c.lineTo(w / 2 - 60, 12); c.stroke();
      c.restore(); ripple(barX + w / 2 - 62, y, t, TA, OR);
    }
    function rows(t) {   // other results, as quiet placeholder rows behind and below your card
      const c = ctx; for (let i = 0; i < 3; i++) { const e = SS(t, TB + 0.1 + i * 0.09, 0.6), a = clamp((t - TB - 0.1 - i * 0.09) * 5) * (i === 0 ? 1 - seg(t, TB + 0.5, 0.3) : 0.55); if (a <= 0) continue;
        const y = cardY + 60 + i * 300 + (i ? cardH - 280 : 0) + (1 - e) * 120; c.save(); c.globalAlpha *= a; c.fillStyle = WA(0.1); rr(100, y, 880, 250, 28); c.fill(); c.fillStyle = WA(0.16); rr(132, y + 34, 180, 180, 20); c.fill(); rr(344, y + 48, 420, 26, 13); c.fill(); c.fillStyle = WA(0.1); rr(344, y + 100, 560, 20, 10); c.fill(); rr(344, y + 140, 360, 20, 10); c.fill(); c.restore(); }
    }
    function card(t) {   // your business, the answer
      const e = SP(t, TB + 0.45, 0.85), a = clamp((t - TB - 0.45) * 6); if (a <= 0) { touch(S1, 0); return; } const c = ctx, x = BX[0], w = BX[2], cardY = BX[1], cardH = BX[3], CCX = x + w / 2, fl = 6 * Math.sin(t * 1.3);
      c.save(); c.globalAlpha *= a; c.translate(CCX, cardY + cardH / 2 + (1 - e) * 260 + fl); c.scale(0.86 + 0.14 * e, 0.86 + 0.14 * e); c.rotate((1 - e) * 0.05); c.translate(-CCX, -(cardY + cardH / 2));
      c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 70; c.shadowOffsetY = 26; c.fillStyle = CARD; rr(x, cardY, w, cardH, 40); c.fill(); c.shadowColor = 'transparent';
      pic(S1, t - TB, x + 22, cardY + 22, w - 44, PHH, 26);
      c.fillStyle = OR; rr(x + 44, cardY + 44, 178, 50, 25); c.fill(); tx('NEAR YOU', x + 133, cardY + 78, { size: 22, wt: 800, ls: 3, col: onAcc() });
      const [nmx, nmy] = posOf(elP('name'), [x + 50, cardY + PHH + 110]); const ns = fit(NAME, 800, 'Mont', w - 100, 62, -0.5); tx(NAME, nmx, nmy, { size: ns, wt: 800, ls: -0.5, col: INKD, align: 'left', a: seg(t, TB + 0.7, 0.3) });
      if (LINE) { const [lix, liy] = posOf(elP('line'), [x + 50, cardY + PHH + 166]); tx(LINE, lix, liy, { size: fit(LINE, 500, 'Mont', w - 100, 32, 0), wt: 500, col: MUTE, align: 'left', a: seg(t, TB + 0.82, 0.3) }); }
      let yy = cardY + PHH + 226;
      if (AREA && AREA !== '-') { c.save(); c.globalAlpha *= seg(t, TB + 0.95, 0.3); c.strokeStyle = OR; c.lineWidth = 5; c.lineJoin = 'round'; c.translate(x + 62, yy - 8); c.beginPath(); c.moveTo(0, 20); c.bezierCurveTo(-22, -4, -16, -24, 0, -24); c.bezierCurveTo(16, -24, 22, -4, 0, 20); c.stroke(); c.restore(); tx(AREA, x + 92, yy, { size: 24, wt: 700, ls: 3, col: INKD, align: 'left', a: seg(t, TB + 0.95, 0.3) }); }
      if (CH.length) { yy += 34; let cx = x + 50; CH.forEach((s, i) => { const k = SB(t, TB + 1.1 + i * 0.1, 0.8), fs = 22, cw = textW(s, F(700, fs, 'Mont'), 2) + 44; if (cx + cw > x + w - 40 || t < TB + 1.1 + i * 0.1) { cx += cw + 14; return; }
        c.save(); c.translate(cx + cw / 2, yy + 26); c.scale(k, k); c.fillStyle = 'rgba(20,20,26,0.07)'; rr(-cw / 2, -24, cw, 48, 24); c.fill(); tx(s, 0, 8, { size: fs, wt: 700, ls: 2, col: INKD }); c.restore(); cx += cw + 14; }); yy += 46; }
      const by = cardY + cardH - 78, pulse = 1 + 0.04 * Math.sin(Math.PI * seg(t, TAP - 0.05, 0.3)); const [ctX, ctY] = posOf(elP('cta'), [CCX, by]); pillBtn(CONTACT.cta, ctX, ctY, { s: SB(t, TB + 1.35, 0.8) * pulse, a: clamp((t - TB - 1.35) * 6), size: 30, maxW: 760 });
      c.restore(); ripple(ctX, ctY + fl, t, TAP, OR);
    }
    function scene(t) {
      stage(t); const z = 1 + 0.03 * SS(t, TB, 0.8) + 0.32 * E.inC(seg(t, OUT - 0.15, 0.6)), cy = lerp(960, 1000, SS(t, TB, 0.8));
      camera(540, cy, z, 0, () => { rows(t); card(t); bar(t); pointer(t, TC, TAP, [860, 1640], [BX[0] + BX[2] / 2 + 60, BX[1] + BX[3] - 70]); });
      close(t, OUT, END);
    }
    return { dur: DUR, render: t => shutter(t, within(t, MOVE), scene), elements,
      cues() { const ev = [['whoosh', 0.12, 0.24, 0], ['pop', 0.5, 0.2, 0]]; for (let x = T0; x < T0 + TYPE - 0.2; x += 0.95) ev.push(['typing', x, 0.3, -0.1]);
        ev.push(['click', TA, 0.5, 0.3], ['swish', TB, 0.3, 0], ['pop', TB + 0.5, 0.36, 0], ['notify', TB + 0.75, 0.2, 0], ['tick', TB + 1.1, 0.3, -0.2], ['tick', TB + 1.2, 0.3, 0], ['tick', TB + 1.3, 0.3, 0.2], ['click', TAP, 0.55, 0], ['sparkle', TAP + 0.05, 0.14, 0]); closeCues(ev, OUT);
        return { dur: DUR, beds: [bed('day', DUR)], events: ev }; } };
  }

  // ================================================================ ON YOUR PHONE
  function phonex() {
    const N = pk({ general: ['Now booking this month', 'New work just posted', 'Message us any time'], food: ['New on the menu this week', 'Your table is waiting', 'Order ahead, skip the line'], estate: ['A new listing just went live', 'Open house this weekend', 'Ask for a private showing'],
      home: ['Now booking new projects', 'Fresh project photos posted', 'Ask for a free estimate'], beauty: ['Chairs open this week', 'Fresh cuts just posted', 'Book your spot in seconds'], auto: ['Detail slots open this week', 'Before and afters just posted', 'Book your detail online'],
      hosp: ['New dates just opened', 'See the latest event photos', 'Ask about your date'], retail: ['New arrivals are in', 'Back in stock this week', 'Come see what’s new'], pro: ['Now taking new clients', 'A new guide just posted', 'Book a first call'] });
    const NS = N.map((n, i) => TX('n' + (i + 1), n, { label: 'Notification ' + (i + 1), group: 'Notifications', max: 34, hint: i ? undefined : 'Sample lines: say what is true for you this week' }));
    const H1 = TX('h1', pk({ general: 'RIGHT WHERE\nYOUR CUSTOMERS ARE', food: 'DINNER IS ONE\nTAP AWAY', estate: 'YOUR NEXT HOME\nIS ONE TAP AWAY', home: 'YOUR PROJECT STARTS\nWITH ONE TAP', beauty: 'YOUR NEXT CUT\nIS ONE TAP AWAY', auto: 'A CLEAN CAR\nIS ONE TAP AWAY', hosp: 'YOUR DATE\nIS ONE TAP AWAY', retail: 'NEW IN.\nONE TAP AWAY', pro: 'HELP IS\nONE TAP AWAY' }), { label: 'Headline (two lines)', group: 'Headline', upper: true, multiline: true, max: 44 });
    const END = TX('end', 'SEE YOU SOON', { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const S1 = shot('s1', 'First screen', 8), S2 = shot('s2', 'Second screen', 5);
    const TN = [1.25, 1.95, 2.65], TW = 4.7, TH = 5.0, TAP = 7.25, OUT = 8.7, DUR = OUT + 4.1, PW = 560, PH = 1150;
    const MOVE = [[0, 3.6], [TW - 0.1, TH + 1.6], [TAP - 0.3, OUT + 1.2]];
    function elements() { const phP = posOf(elP('phone'), [540, 1180]); const ls = String(H1).split('\n'), fs = Math.min(...ls.map(l => fit(l, 400, 'Bebas', 940, 128, 2))); const h1P = posOf(elP('headline'), [540, 400]), h2P = posOf(elP('headline2'), [540, 400 + fs * 1.02]); const els = [
      { id: 'phone', kind: 'pos', label: 'Phone', x: phP[0], y: phP[1], t0: 0, d: DUR, box: [phP[0] - 280, phP[1] - 575, 560, 1150], dup: false, del: false },
      { id: 'headline', kind: 'pos', label: ls[0], x: h1P[0], y: h1P[1], t0: TH + 0.25, d: DUR - (TH + 0.25), box: [h1P[0] - 470, h1P[1] - 128, 940, 128], dup: false, del: false },
    ];
      if (ls.length > 1) els.push({ id: 'headline2', kind: 'pos', label: ls[1], x: h2P[0], y: h2P[1], t0: TH + 0.47, d: DUR - (TH + 0.47), box: [h2P[0] - 470, h2P[1] - 128, 940, 128], dup: false, del: false });
      return els; }
    function phone(t) {
      const [phX, phY] = posOf(elP('phone'), [540, 1180]);
      const e = SS(t, 0.1, 1.0), k = SS(t, TH, 0.9), sc = lerp(1, 0.74, k), cx = phX + 10 * Math.sin(t * 0.8), cy = lerp(lerp(2200, 960, e), 1180, k) + (phY - 1180) + 12 * Math.sin(t * 1.1), rot = lerp(lerp(-0.2, -0.045, e), 0.03, k) + 0.012 * Math.sin(t * 0.7), c = ctx;
      c.save(); c.translate(cx, cy); c.rotate(rot); c.scale(sc, sc);
      c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 90; c.shadowOffsetY = 40; c.fillStyle = '#0E0E12'; rr(-PW / 2, -PH / 2, PW, PH, 88); c.fill(); c.shadowColor = 'transparent';
      c.strokeStyle = 'rgba(255,255,255,0.14)'; c.lineWidth = 3; rr(-PW / 2 + 2, -PH / 2 + 2, PW - 4, PH - 4, 86); c.stroke();
      const sx = -PW / 2 + 18, sy = -PH / 2 + 18, sw = PW - 36, sh = PH - 36, u = E.inOutC(seg(t, TAP + 0.1, 0.5));
      c.save(); rr(sx, sy, sw, sh, 70); c.clip(); c.fillStyle = '#1b1b22'; c.fillRect(sx, sy, sw, sh);
      if (u < 1) pic(S1, t, sx - u * sw, sy, sw, sh, 0); else touch(S1, t); if (u > 0) pic(S2, t - TAP, sx + (1 - u) * sw, sy, sw, sh, 0); else touch(S2, 0);
      const g = c.createLinearGradient(0, sy, 0, sy + 260); g.addColorStop(0, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(sx, sy, sw, 260);
      c.restore(); c.fillStyle = '#0E0E12'; rr(-70, sy + 20, 140, 36, 18); c.fill();
      ripple(0, 120, t, TAP, '#FFFFFF');
      // notifications: wider than the phone, stacked from the top, the newest on top
      NS.forEach((txt, i) => { if (!txt || t < TN[i]) return; const e2 = SP(t, TN[i], 0.75), below = NS.filter((x, j) => j > i && t >= TN[j]).reduce((a2, x, j2) => a2 + SS(t, TN[i + 1 + j2], 0.5), 0), out = E.inC(seg(t, TW + (2 - i) * 0.07, 0.35)); if (out >= 1) return;
        const w = 640, h = 150, y = sy + 110 + below * (h + 16) - (1 - e2) * 260 - out * 900, a = clamp((t - TN[i]) * 7) * (1 - 0.14 * Math.min(2, below));
        c.save(); c.globalAlpha *= a; c.translate(0, y + h / 2); c.scale((0.9 + 0.1 * e2) * (1 - 0.04 * Math.min(2, below)), 0.9 + 0.1 * e2); c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 40; c.shadowOffsetY = 14; c.fillStyle = 'rgba(250,250,252,0.97)'; rr(-w / 2, -h / 2, w, h, 36); c.fill(); c.shadowColor = 'transparent';
        c.fillStyle = OR; rr(-w / 2 + 24, -h / 2 + 27, 96, 96, 24); c.fill(); const ini = up(BRAND.short || BRAND.name || 'B').replace(/[^A-Z0-9]/g, '').slice(0, 2) || 'B'; tx(ini, -w / 2 + 72, 16, { size: 42, wt: 900, col: onAcc() });
        const nm = up(BRAND.short || BRAND.name || ''); tx(nm, -w / 2 + 146, -18, { size: fit(nm, 800, 'Mont', 330, 24, 2), wt: 800, ls: 2, col: MUTE, align: 'left' }); tx('now', w / 2 - 30, -18, { size: 22, wt: 500, col: MUTE, align: 'right' });
        tx(txt, -w / 2 + 146, 30, { size: fit(txt, 700, 'Mont', w - 190, 34, 0), wt: 700, col: INKD, align: 'left' }); c.restore(); });
      c.restore();
    }
    function scene(t) {
      stage(t); const z = 1 + 0.05 * seg(t, 0, TW) - 0.05 * SS(t, TH, 0.8) + 0.3 * E.inC(seg(t, OUT - 0.15, 0.6));
      camera(540, 960, z, 0, () => {
        phone(t);
        const ls = String(H1).split('\n'), fs = Math.min(...ls.map(l => fit(l, 400, 'Bebas', 940, 128, 2)));
        const H1POS = [posOf(elP('headline'), [540, 400])]; if (ls.length > 1) H1POS.push(posOf(elP('headline2'), [540, 400 + fs * 1.02]));
        ls.forEach((ln, i) => words(ln, H1POS[i][0], H1POS[i][1], t, TH + 0.25 + i * 0.22, { size: fs, fam: 'Bebas', wt: 400, ls: 2, st: 0.07, shadow: 'rgba(0,0,0,0.4)', a: 1 - seg(t, OUT - 0.2, 0.3) }));
        if (t > TH + 0.9) { ctx.fillStyle = OR; const rw = 180 * E.outC(seg(t, TH + 0.9, 0.5)) * (1 - seg(t, OUT - 0.2, 0.3)); ctx.fillRect(H1POS[0][0] - rw / 2, H1POS[ls.length - 1][1] + fs * 0.47, rw, 8); }
      });
      close(t, OUT, END);
    }
    return { dur: DUR, render: t => shutter(t, within(t, MOVE), scene), elements,
      cues() { const ev = [['whoosh', 0.15, 0.28, 0], ['thud', 0.75, 0.2, 0]]; TN.forEach((x, i) => { ev.push(['notify', x, 0.34, (i - 1) * 0.3]); ev.push(['pop', x + 0.02, 0.2, (i - 1) * 0.3]); });
        ev.push(['swish', TW, 0.34, 0], ['whoosh', TH, 0.24, 0], ['pop', TH + 0.3, 0.24, -0.2], ['pop', TH + 0.55, 0.24, 0.2], ['click', TAP, 0.5, 0], ['swish', TAP + 0.12, 0.26, 0.2]); closeCues(ev, OUT);
        return { dur: DUR, beds: [bed('sketch', DUR)], events: ev }; } };
  }

  // ================================================================ PHOTO STACK
  function stackx() {
    const TITLE = TX('title', pk({ general: 'LATELY', food: 'ON THE MENU', estate: 'JUST LISTED', home: 'RECENT PROJECTS', beauty: 'FRESH THIS WEEK', auto: 'JUST DETAILED', hosp: 'RECENT EVENTS', retail: 'NEW IN', pro: 'RECENT WORK' }), { label: 'Title', group: 'Title', upper: true, max: 20 });
    const SV = services(4), LB = [0, 1, 2, 3].map(i => TX('c' + (i + 1), SV[i] || ['FIRST', 'SECOND', 'THIRD', 'FOURTH'][i] + ' PHOTO', { label: 'Label for photo ' + (i + 1), group: 'Labels', upper: true, max: 24 }));
    const END = TX('end', pk({ general: 'WANT TO SEE MORE?', food: 'HUNGRY YET?', estate: 'WANT A CLOSER LOOK?', home: 'YOURS COULD BE NEXT', beauty: 'YOU’RE NEXT', auto: 'YOUR CAR IS NEXT', hosp: 'YOURS COULD BE NEXT', retail: 'COME TAKE A LOOK', pro: 'LET’S TALK' }), { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const n = 4, T0 = 1.0, SD = 1.9, OUT = T0 + n * SD, DUR = OUT + 4.1, SH4 = [0, 1, 2, 3].map(i => shot('s' + (i + 1), 'Photo ' + (i + 1), SD + 1.2)), CW = 780, CH2 = 980, CY = 930;
    const MOVE = [[0, 1.5]].concat([1, 2, 3, 4].map(i => [T0 + i * SD - 0.15, T0 + i * SD + 0.95]));
    function elements() { const tiP = posOf(elP('title'), [540, 330]), lbP = posOf(elP('label'), [540, CY + CH2 / 2 + 34]), coP = posOf(elP('counter'), [540, CY + CH2 / 2 + 150]); return [
      { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.35, d: DUR - 0.35, box: [tiP[0] - 450, tiP[1] - 120, 900, 120], dup: false, del: false },
      { id: 'label', kind: 'pos', label: 'Photo label', x: lbP[0], y: lbP[1], t0: T0, d: OUT - T0, box: [lbP[0] - 400, lbP[1] - 44, 800, 88], dup: false, del: false },
      { id: 'counter', kind: 'pos', label: 'Photo counter', x: coP[0], y: coP[1], t0: T0, d: OUT - T0, box: [coP[0] - 150, coP[1] - 26, 300, 50], dup: false, del: false },
    ]; }
    const rot0 = i => [0.045, -0.06, 0.035, -0.03][i % 4], off = i => [[14, 10], [-18, 22], [20, 30], [-10, 40]][i % 4];
    function cardAt(i, t) {   // card i sits in the deck until its turn ends, then is flicked away
      const tin = 0.15 + (n - 1 - i) * 0.12, e = SP(t, tin, 0.9), go = T0 + (i + 1) * SD, u = seg(t, go, 0.55), depth = Math.max(0, i - Math.max(0, Math.floor((t - T0) / SD))), lift = SS(t, T0 + i * SD, 0.5), c = ctx;
      if (u >= 1 && i < n - 1) { touch(SH4[i], 0); return; } const dir = i % 2 ? -1 : 1, fly = i < n - 1 ? E.inC(u) : 0;
      const [ox, oy] = off(i), k = i === 0 ? 1 : lift, x = 540 + ox * (1 - k) * 1.6 + dir * fly * 1300, y = CY + oy * (1 - k) * 1.4 + (1 - e) * 1500 + fly * 260 + 6 * Math.sin(t * 1.2 + i), r = rot0(i) * (1 - k * 0.75) + (1 - e) * 0.3 * dir + dir * fly * 0.55, s = (1 - 0.035 * depth * (1 - k)) * (0.9 + 0.1 * e);
      c.save(); c.translate(x, y); c.rotate(r); c.scale(s, s); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 60; c.shadowOffsetY = 24; c.fillStyle = '#FFFFFF'; rr(-CW / 2, -CH2 / 2, CW, CH2, 30); c.fill(); c.shadowColor = 'transparent';
      pic(SH4[i], t - (T0 + i * SD), -CW / 2 + 22, -CH2 / 2 + 22, CW - 44, CH2 - 44, 16); c.restore();
    }
    function scene(t) {
      stage(t); const cur = clamp(Math.floor((t - T0) / SD), 0, n - 1), z = 1 + 0.035 * Math.sin(Math.PI * seg(t, T0 + cur * SD, SD)) + 0.3 * E.inC(seg(t, OUT - 0.15, 0.6));
      camera(540, 960, z, 0, () => {
        for (let i = n - 1; i >= 0; i--) cardAt(i, t);
        const fa = 1 - seg(t, OUT - 0.25, 0.3);
        const [tix, tiy] = posOf(elP('title'), [540, 330]); words(TITLE, tix, tiy, t, 0.35, { size: fit(TITLE, 400, 'Bebas', 900, 120, 3), fam: 'Bebas', wt: 400, ls: 3, st: 0.08, a: fa, shadow: 'rgba(0,0,0,0.4)' });
        if (t >= T0 && t < OUT + 0.3) { const lt = t - (T0 + cur * SD), lab = LB[cur], e = SB(lt, 0.12, 0.8), a = clamp((lt - 0.12) * 6) * (1 - seg(lt, SD - 0.22, 0.2)) * fa;
          if (lab && a > 0) { const fs = fit(lab, 800, 'Mont', 700, 40, 3), w = textW(lab, F(800, fs, 'Mont'), 3) + 84, c = ctx; c.save(); c.globalAlpha *= a; const [lbx, lby] = posOf(elP('label'), [540, CY + CH2 / 2 + 34]); c.translate(lbx, lby); c.rotate(-0.025); c.scale(e, e); c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 24; c.shadowOffsetY = 8; c.fillStyle = OR; rr(-w / 2, -44, w, 88, 16); c.fill(); c.shadowColor = 'transparent'; tx(lab, 0, fs * 0.36, { size: fs, wt: 800, ls: 3, col: onAcc() }); c.restore(); }
          const [cox, coy] = posOf(elP('counter'), [540, CY + CH2 / 2 + 150]); tx(String(cur + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), cox, coy, { size: 26, wt: 700, fam: 'Mono', ls: 6, col: WA(0.8), a: fa * clamp((t - T0) * 4) }); }
      });
      close(t, OUT, END);
    }
    return { dur: DUR, render: t => shutter(t, within(t, MOVE), scene), elements,
      cues() { const ev = [['paper', 0.2, 0.3, -0.2], ['paper', 0.34, 0.3, 0.2], ['paper', 0.48, 0.3, -0.1], ['thud', 0.75, 0.22, 0], ['pop', 1.15, 0.28, 0]];
        for (let i = 1; i < n; i++) { const x = T0 + i * SD; ev.push(['swish', x, 0.36, i % 2 ? 0.4 : -0.4], ['paper', x + 0.1, 0.3, 0], ['pop', x + 0.2, 0.26, 0]); } closeCues(ev, OUT);
        return { dur: DUR, beds: [bed('lounge', DUR)], events: ev }; } };
  }

  // ================================================================ SPRING TYPE
  function typex() {
    const D5 = pk({ general: ['NEW WEEK.', 'NEW WORK.', 'SAME CARE.', 'EVERY TIME.', 'LET’S GO'], food: ['HOT.', 'FRESH.', 'MADE TODAY.', 'COME HUNGRY.', 'SEE YOU TONIGHT'], estate: ['NEW KEYS.', 'NEW VIEW.', 'NEW START.', 'YOUR MOVE.', 'LET’S LOOK'], home: ['MEASURED.', 'BUILT.', 'FINISHED.', 'YOURS.', 'LET’S BUILD'],
      beauty: ['WALK IN.', 'SIT DOWN.', 'LOOK SHARP.', 'WALK OUT.', 'YOU’RE NEXT'], auto: ['WASHED.', 'POLISHED.', 'PROTECTED.', 'SPOTLESS.', 'BOOK IT'], hosp: ['THE DATE.', 'THE ROOM.', 'THE NIGHT.', 'HANDLED.', 'LET’S PLAN'], retail: ['JUST IN.', 'GOING FAST.', 'ONE STOP.', 'YOUR PICK.', 'COME BY'], pro: ['ASK.', 'PLAN.', 'DO.', 'DONE RIGHT.', 'LET’S TALK'] });
    const LN = D5.map((d, i) => TX('l' + (i + 1), d, { label: i === 4 ? 'Ending line' : 'Line ' + (i + 1), group: i === 4 ? 'Ending' : 'Lines', upper: true, max: i === 4 ? 26 : 16, hint: i ? undefined : 'Short lines hit hardest: one to three words' }));
    const BT = 0.6, SD = 2 * BT * 1.5, n = 4, OUT = 0.2 + n * SD, DUR = OUT + 4.0;   // on the bed's beat (100 a minute): three beats a line
    const big = (s, fam, wt, maxW, maxS, ls) => fit(s, wt, fam, maxW, maxS, ls);
    function elements() { return LN.slice(0, 4).map((s, i) => { const lp = posOf(elP('line' + (i + 1)), [540, 960]); return { id: 'line' + (i + 1), kind: 'pos', label: s, x: lp[0], y: lp[1], t0: 0.2 + i * SD, d: SD + 0.25, box: [lp[0] - 470, lp[1] - 165, 940, 330], dup: false, del: false }; }); }
    function line(i, t) {
      const t0 = 0.2 + i * SD, lt = t - t0, s = LN[i], c = ctx; if (lt < -0.05 || lt > SD + 0.25 || !s) return; const q = E.inC(seg(lt, SD - 0.16, 0.2)), acc = i % 2 === 1;
      const [lx, ly] = posOf(elP('line' + (i + 1)), [540, 960]);
      if (acc) { const u = E.outQ(seg(lt, 0, 0.45)); c.save(); c.fillStyle = OR; c.beginPath(); c.arc(lx, ly, 1300 * u * (1 - q * 0), 0, TAU); c.fill(); c.restore(); if (q > 0) { c.save(); c.fillStyle = DEEP2; c.beginPath(); c.arc(lx, ly, 1300 * q, 0, TAU); c.fill(); c.restore(); } }
      const col = acc ? onAcc() : WHT, a = 1 - q;
      if (i === 0) {   // letters drop in on springs, a rule swipes under
        const fs = big(s, 'Bebas', 400, 920, 330, 2), f = F(400, fs, 'Bebas'), chs = [...s], wd = chs.map(ch => textW(ch, f, 2)), tot = wd.reduce((x, y) => x + y, 0); let x = lx - tot / 2;
        chs.forEach((ch, k) => { const e = K13.BOUNCY(seg(lt, 0.03 + k * 0.035, 0.85)), al = clamp((lt - 0.03 - k * 0.035) * 9) * a; if (al > 0) { c.save(); c.translate(x + wd[k] / 2, ly + 20 - (1 - e) * fs * 1.2); c.rotate((1 - e) * (k % 2 ? 0.3 : -0.3)); tx(ch, 0, fs * 0.36, { size: fs, wt: 400, fam: 'Bebas', col, a: al }); c.restore(); } x += wd[k]; });
        c.fillStyle = OR; const rw = tot * E.outQ(seg(lt, 0.5, 0.4)) * a; c.fillRect(lx - tot / 2, ly + 20 + fs * 0.5, rw, 14);
      } else if (i === 1) {   // whips in from the left on the accent, leaning into it
        const fs = big(s, 'Mont', 900, 940, 230, -3), e = K13.SOFT(seg(lt, 0.12, 0.5)); c.save(); c.translate(lx - (1 - e) * 1400, ly); c.transform(1, 0, -0.32 * (1 - e) - 0.08, 1, 0, 0); tx(s, 0, fs * 0.36, { size: fs, wt: 900, ls: -3, col, a: a * clamp(lt * 8) }); c.restore();
      } else if (i === 2) {   // a column of outlines scrolls past, the filled line locks in the middle
        const fs = big(s, 'Bebas', 400, 940, 280, 3), e = K13.SPRING(seg(lt, 0.05, 0.8)), sc = (lt * 90) % (fs * 0.98);
        c.save(); c.font = F(400, fs, 'Bebas'); c.letterSpacing = '3px'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.lineWidth = 3; c.strokeStyle = WA(0.34 * a * clamp(lt * 5));
        for (let r = -4; r <= 4; r++) { if (r === 0) continue; c.strokeText(s, lx, ly + fs * 0.36 + r * fs * 0.98 - sc * Math.sign(r) * 0 + (1 - e) * r * 160); } c.restore();
        c.save(); c.translate(lx, ly); c.scale(0.5 + 0.5 * e, 0.5 + 0.5 * e); tx(s, 0, fs * 0.36, { size: fs, wt: 400, fam: 'Bebas', ls: 3, col: OR, a: a * clamp(lt * 8) }); c.restore();
      } else {   // punches in from far too big, on the accent
        const fs = big(s, 'Mont', 900, 940, 240, -3), e = K13.SOFT(seg(lt, 0.1, 0.55)), z = 1 + (1 - e) * 3.2; c.save(); c.translate(lx, ly); c.scale(z, z); c.rotate((1 - e) * -0.12); tx(s, 0, fs * 0.36, { size: fs, wt: 900, ls: -3, col, a: a * clamp((lt - 0.08) * 7) }); c.restore();
      }
    }
    function scene(t) {
      stage(t, { dots: 0.05 }); const i = clamp(Math.floor((t - 0.2) / SD), 0, n - 1), lt = t - 0.2 - i * SD, z = 1 + 0.06 * seg(lt, 0, SD) + 0.03 * Math.sin(Math.PI * seg(lt, 0, 0.3));
      if (t < OUT + 0.3) camera(540, 960, z, 0.012 * Math.sin(t * 1.7), () => { if (i > 0 && lt < 0.25) line(i - 1, t); line(i, t); });
      close(t, OUT, LN[4]);
    }
    return { dur: DUR, shakes: [0, 1, 2, 3].map(i => [0.2 + i * SD + (i === 0 ? 0.5 : 0.3), i === 3 ? 9 : 6]), render: t => shutter(t, t < OUT + 1.2, scene), elements,
      cues() { const ev = []; for (let i = 0; i < n; i++) { const x = 0.2 + i * SD; ev.push(i % 2 ? ['whoosh', x + 0.05, 0.34, i === 1 ? -0.4 : 0.4] : ['swish', x, 0.3, 0]); ev.push(['impact', x + (i === 0 ? 0.5 : 0.3), 0.34, 0]); if (i === 0) for (let k = 0; k < 5; k++) ev.push(['tick', x + 0.05 + k * 0.07, 0.3, (k - 2) * 0.2]); if (i === 2) ev.push(['riser', x + 0.9, 0.16, 0]); } closeCues(ev, OUT);
        return { dur: DUR, beds: [bed('night', DUR)], events: ev }; } };
  }

  const P = ({ searchx, phonex, stackx, typex }[V] || searchx)();
  DIR = { dur: P.dur, bg: BLK, finish: { vig: 0.16, grain: 0.14 }, edl: [], shakes: P.shakes || [], preload: () => K3.init(), render: P.render, cues: P.cues, ...(P.elements ? { elements: P.elements } : {}) };
});
