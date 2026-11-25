'use strict';
/* Real estate creative families, part 2 (V10, Oct 30). Eight more systems on the same property profile (PROP, K7.PROFILE) and
   the listing's photos in order, so one listing still makes a whole campaign. Facts are never invented: an empty optional fact
   is left out and the layout closes up; an empty required one shows a "+ ADD …" marker. Photos are always shown whole.
   Nothing here states a market claim, a status or a number the agent did not type.
   ?v=aerial  Aerial Tour          a drone HUD: brackets, a compass strip, a pin dropping on the property, data chips
   ?v=resid   The Residence        quiet luxury: gold hairlines, chapters in Roman numerals, a tall gallery frame
   ?v=journal Home Journal         polaroids tossed onto a desk with tape, handwritten captions, a checklist of facts
   ?v=devel   New Development      a blueprint grid, an isometric building drawn on, amenity tiles, a status you choose
   ?v=soon    Coming Soon          the photo stays blurred while a spotlight peeks through it, stencil type, "get on the list"
   ?v=lease   Now Leasing          app cards: a listing card slides up, rent and size chips, amenities, a tour button
   ?v=luxe    The Luxury Collection black and gold, letterbox bars, a light sweep across gold type, slow gold dust
   ?v=comm    Commercial Space     a spec sheet, a pin on a drawn street map, split-screen photos and the deal type */
STUDIO_REG['estate2'] = (() => {
  const V = QS.get('v') || 'aerial';
  const FM = K7.FAM[V] || K7.FAM.aerial;
  if (!window.STUDIO) setBrandColors(FM.pal);
  if (!window.STUDIO && !PRM.prop) PRM.prop = Object.assign({}, K7.DEMO);
  const G = K3.G, D = K3.D, up = K7.up, nz = K7.nz, seg = K7.seg, TAU = Math.PI * 2;
  const NONE = k => ['nofoot.' + k, 0];
  const DEMO_PH = [['c02', 9.0], ['c11', 15.0], ['c12', 8.5], ['c08', 6.0], ['c05', 4.1], ['c10', 4.0], ['c07', 12.05]];
  const PH = ((typeof PRM !== 'undefined' && PRM.photos) || []).filter(Boolean);
  function photos(labels, ds) {
    return labels.map((lab, k) => {
      const def = PH[k] ? [PH[k], 0] : window.STUDIO ? NONE('s' + (k + 1)) : DEMO_PH[k % DEMO_PH.length], d = Array.isArray(ds) ? ds[k] : ds;
      const s = SHOT('s' + (k + 1), def, { label: lab, group: 'Photos', kind: 'any', d: d + 0.3, hint: k === 0 ? 'Your listing photos fill these in order. Change any one here.' : undefined });
      return { c: s[0], in: s[1], d, start: 0 };
    });
  }
  const fact = (k, req) => PROP(k, { label: K7.profileLabel(k), req: !!req, group: 'Listing', multiline: k === 'feat' });
  const vert = s => K7.isVert(s.c);
  const musicBed = (dur, o) => ['music', 0, dur, 0.95, Object.assign({ style: FM.music, bpm: FM.bpm, key: 0, end: dur - 0.6 }, o || {})];
  // Per-element model — same contract as tpl_food.js: when this template runs as a
  // nested block inside a free edit, tpl_free sets window.__NX_BLOCK_EL to the
  // block's `el` data before calling this function and clears it after. The
  // template captures that (live) object at build time; render() reads positions
  // from it. No `el` -> EL is null and every position falls back to the original
  // hardcoded value, so rendering is byte-for-byte the old path.
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const mkEl = (id, label, dx, dy, t0, d, boxFn) => { const p = posOf(elP(id), [dx, dy]); return { id, kind: 'pos', label, x: p[0], y: p[1], t0, d, box: boxFn(p), dup: false, del: false }; };
  function shade(y0, y1, a0, a1, col) { if (VID.collecting) return; const c = G(), g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, rgbaOf(col || BLK, a0)); g.addColorStop(1, rgbaOf(col || BLK, a1)); c.fillStyle = g; c.fillRect(-20, y0, W + 40, y1 - y0); D(); }
  const L8 = o => Object.assign({ kind: 'text', style: 'type', x: 540, y: 960, t0: 0, d: 3, color: 'white', w: 980 }, o);
  function type(L, t) { const lt = t - L.t0; if (lt < 0 || lt >= L.d || !L.text) return; const s = K8.xf(L, lt); K8.withLayer(s, K8.box(L), () => K8.type(L, t, s)); }
  function gfx(L, t) { const lt = t - L.t0; if (lt < 0 || lt >= L.d) return; const e = K9.EL[L.type]; if (!e) return; const s = K8.xf(L, lt);
    if (e.full) { if (VID.collecting) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= s.op; K9.draw(L, t, s); ctx.restore(); } else K8.withLayer(s, K9.box(L), () => K9.draw(L, t, s)); }
  function cut(id, t, tc, d, A, B, o) { const u = (t - (tc - d / 2)) / d; if (u <= 0) A(); else if (u >= 1) B(); else KT.run(id, u, A, B, Object.assign({ t }, o || {})); }
  const stageRect = (s, cy) => (vert(s) ? K3.wholeIn(s.c, [0, 0, W, H]) : (h => [0, cy - h / 2, W, h])(W / K3.ar(s.c)));
  const stage = (s, t, cy, o) => K7.photo(s, t, stageRect(s, cy), o);
  const inBox = (s, box) => K3.wholeIn(s.c, box);
  // a whole photo in r, turned by rot (radians) and scaled by sc about (px, py), then moved by (ox, oy): footage draws reset the
  // canvas transform, so the turn and move go to the footage call itself
  function photoT(s, t, r, o) { const w = K3.wholeIn(s.c, r), cx = w[0] + w[2] / 2, cy = w[1] + w[3] / 2, px = o.px === undefined ? cx : o.px, py = o.py === undefined ? cy : o.py, sc = o.sc || 1, rot = o.rot || 0;
    const vx = (cx - px) * sc, vy = (cy - py) * sc, co = Math.cos(rot), sn = Math.sin(rot), nx = px + vx * co - vy * sn + (o.ox || 0), ny = py + vx * sn + vy * co + (o.oy || 0);
    K3.clip(s.c, s.in, Math.max(0, t - (s.start || 0)), w, { alpha: o.alpha === undefined ? 1 : o.alpha, dx: nx - cx, dy: ny - cy, rot, s: sc }); return w; }
  const dealWord = d => (d === 'rent' ? 'FOR LEASE' : d === 'sale' ? 'FOR SALE' : '');
  const fa = (t, t0, d) => E.outC(seg(t, t0, d || 0.5));
  const pill = (text, x, y, t0, d, t, size, id) => { const [px, py] = id ? posOf(elP(id), [x, y]) : [x, y]; type(L8({ text, slot: 'Mont', wt: 800, size: size || 36, track: 220, w: 900, x: px, y: py, color: K8.onCol(OR), fx: { deco: 'pill', dcol: 'accent' }, anim: { in: 'pop', out: 'fade', outD: 0.3 }, t0, d }), t); };
  // the listing's agent at the close: logo, the call to action, agent name and title, phone and link
  function agentClose(t, OUT, o) {
    const ot = t - OUT, y = o.y || 600, [lw, lh] = logoBox(o.lw || 560), lp = seg(ot, 0.2, 0.6);
    if (lp > 0 && !VID.collecting) { const c = G(); c.globalAlpha = E.outC(lp); c.translate(W / 2, y + (1 - E.outC(lp)) * 30); c.drawImage(IMG.logoW, -lw / 2, -lh / 2, lw, lh); D(); }
    let yy = y + lh / 2 + 150;
    if (o.cta) { const [cx2, cy2] = posOf(elP('cta'), [W / 2, yy]); type(L8(Object.assign({ text: o.cta, x: cx2, y: cy2, t0: OUT + 0.7, d: 30 }, o.ctaL || {})), t); yy = cy2 + (o.ctaH || 150); }
    const AGN = K7.agentName({ agent: o.ag }), ph = K7.agentPhone({ agent_phone: o.agp }), web = o.url || CONTACT.web;
    K7.txt(up(AGN), W / 2, yy, F(700, 36, 'Mont'), WHT, { align: 'center', ls: 4, a: fa(ot, 1.2) });
    if (o.agt) { yy += 46; K7.txt(o.agt, W / 2, yy, F(500, 28, 'Mont'), WA(0.7), { align: 'center', ls: 2, a: fa(ot, 1.35) }); }
    yy += 60; K7.txt([ph, web].filter(Boolean).join('   ·   '), W / 2, yy, F(600, 28, 'Mont'), o.infoCol || WA(0.85), { align: 'center', ls: 2, a: fa(ot, 1.5) });
    if (CONTACT.lic) K7.txt(CONTACT.lic, W / 2, yy + 46, F(600, 22, 'Mont'), WA(0.6), { align: 'center', ls: 3, a: fa(ot, 1.6) });
  }
  // the address, or a marker when it is required and empty
  function addr(ADDR, x, y, size, a, o) { o = o || {}; if (ADDR) K7.txt(ADDR, x, y, F(o.wt || 600, Math.min(size, fitSize(ADDR, o.wt || 600, o.w || 940, size, o.fam || 'Mont', o.ls || 0)), o.fam || 'Mont', o.style), o.col || WHT, { align: o.align || 'center', a, ls: o.ls || 0 });
    else K7.need('address', x, y, Math.round(size * 0.55), { align: o.align || 'center', col: o.col || WHT, a }); }
  // fact chips (beds, baths, size, lot) centred on cx
  function chips(list, cx, y, size, p, o) {
    if (VID.collecting || !list.length || p <= 0) return; o = o || {}; const ic = { beds: 'bed', baths: 'bath', sqft: 'area', lot: 'lot' }, f = F(700, size, o.fam || 'Mont'), pad = size * 0.8, gap = size * 0.6, h = size * 2.1;
    const parts = list.map(x => { const s = x.n + (x.u ? ' ' + x.u : ''); return { x, s, w: textW(s, f, 1) + pad * 2 + size * 1.4 }; });
    const tot = parts.reduce((a, b) => a + b.w, 0) + gap * (parts.length - 1), sc = Math.min(1, (o.maxW || 960) / tot); let x = cx - tot * sc / 2; const c = G(); c.translate(x, y); c.scale(sc, sc); c.translate(-x, -y);
    parts.forEach((pt, i) => { const a = E.outBack(clamp(p * 1.5 - i * 0.18)); if (a <= 0) { x += pt.w + gap; return; } c.save(); c.globalAlpha = clamp(a); c.translate(x + pt.w / 2, y); c.scale(a, a); c.translate(-(x + pt.w / 2), -y);
      c.fillStyle = o.bg || 'rgba(0,0,0,0.55)'; c.beginPath(); c.roundRect(x, y - h / 2, pt.w, h, o.r === undefined ? h / 2 : o.r); c.fill(); if (o.line) { c.strokeStyle = o.line; c.lineWidth = 2; c.stroke(); }
      c.restore(); if (ic[pt.x.k]) K7.icon(ic[pt.x.k], x + pad + size * 0.5, y, size * 1.1, o.icol || OR, { a: clamp(a), lw: 1.8 }); K7.txt(pt.s, x + pad + size * 1.4, y + size * 0.36, f, o.col || WHT, { a: clamp(a), ls: 1 }); x += pt.w + gap; });
    D(); }

  // ================================================================ AERIAL TOUR
  // A drone's view: corner brackets, a compass strip that drifts, an elevation scale without numbers, a pin dropping on the
  // property with the address typed into a tag, then data chips and the features as callouts. Whip pans between photos.
  function aerial() {
    const ADDR = fact('addr', true), AREA = fact('area'), PRICE = fact('price'), DEAL = fact('deal'), FT = K7.facts({ beds: fact('beds'), baths: fact('baths'), sqft: fact('sqft'), lot: fact('lot') }, ['beds', 'baths', 'sqft', 'lot']);
    const FEAT = K7.lines(fact('feat')).slice(0, 3), AG = fact('agent'), AGT = fact('agent_title'), AGP = fact('agent_phone'), URL = fact('url');
    const KICK = TX('kick', 'AERIAL TOUR', { label: 'HUD label', group: 'Opening', upper: true, max: 20 }), CTA = TX('cta', 'SCHEDULE A SHOWING', { label: 'Call to action', group: 'Ending', upper: true, max: 28 });
    const S = photos(['Opening view', 'Overview', 'The grounds', 'The approach'], [4.2, 3.7, 3.7, 3.7]), ST = [0, 4.0, 7.6, 11.2], OUT = 14.8, DUR = OUT + 4.4;
    S.forEach((s, k) => (s.start = ST[k]));
    const PS = K7.money(PRICE, DEAL);
    function hud(t, a) {
      if (VID.collecting || a <= 0) return; const c = G(); c.globalAlpha = a; c.strokeStyle = WA(0.9); c.lineWidth = 3; const L = 70, X0 = 70, Y0 = 270, X1 = W - 70, Y1 = 1640;
      for (const [x, y, sx, sy] of [[X0, Y0, 1, 1], [X1, Y0, -1, 1], [X0, Y1, 1, -1], [X1, Y1, -1, -1]]) { c.beginPath(); c.moveTo(x, y + sy * L); c.lineTo(x, y); c.lineTo(x + sx * L, y); c.stroke(); }
      const br = 1 + Math.sin(t * 2) * 0.04; c.globalAlpha = a * (1 - seg(t, OUT - 0.2, 0.4)); c.lineWidth = 2; c.beginPath(); c.arc(W / 2, 960, 46 * br, 0, TAU); c.stroke(); for (let i = 0; i < 4; i++) { const an = i * Math.PI / 2; c.beginPath(); c.moveTo(W / 2 + Math.cos(an) * 60, 960 + Math.sin(an) * 60); c.lineTo(W / 2 + Math.cos(an) * 84, 960 + Math.sin(an) * 84); c.stroke(); }
      c.save(); c.beginPath(); c.rect(W / 2 - 320, 160, 640, 70); c.clip(); const hd = (t * 7 + 20) % 360; setF(F(700, 24, 'Mono'), 2); c.textAlign = 'center'; c.fillStyle = WA(0.9);
      for (let dgr = -60; dgr <= 60; dgr += 5) { const ab = Math.round((hd + dgr) / 5) * 5, x = W / 2 + (ab - hd) * 5.2, m = ((ab % 360) + 360) % 360; c.fillRect(x - 1, 214 - (m % 45 === 0 ? 22 : 10), 2, m % 45 === 0 ? 22 : 10); const lab = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' }[m]; if (lab) c.fillText(lab, x, 186); }
      c.restore(); c.globalAlpha = a; c.fillStyle = OR; c.beginPath(); c.moveTo(W / 2, 232); c.lineTo(W / 2 - 10, 246); c.lineTo(W / 2 + 10, 246); c.fill();
      for (let i = 0; i <= 20; i++) c.fillRect(104, 640 + i * 32, i % 5 ? 14 : 26, 2); const my = 640 + 320 + Math.sin(t * 0.7) * 220; c.beginPath(); c.moveTo(136, my); c.lineTo(152, my - 10); c.lineTo(152, my + 10); c.fill();
      const [kx, ky] = posOf(elP('kick'), [X0 + 46, Y0 + 45]);
      if (Math.floor(t * 2) % 2 === 0) { c.fillStyle = OR; c.beginPath(); c.arc(kx - 20, ky - 1, 9, 0, TAU); c.fill(); } setF(F(700, 26, 'Mono'), 4); c.fillStyle = WHT; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(KICK, kx, ky); D(); }
    function pin(t, t0) {   // the pin drops onto the centre, rings pulse, a leader line runs to the tag
      const p = seg(t, t0, 0.5); if (p <= 0 || VID.collecting) return; const [px, py] = posOf(elP('pin'), [W / 2, 960]), y = py - (1 - E.outBack(p)) * 300, c = G();
      for (let i = 0; i < 2; i++) { const q = ((t - t0 - 0.4 + i * 0.6) % 1.2) / 1.2; if (t - t0 < 0.4) break; c.strokeStyle = rgbaOf(OR, 0.7 * (1 - q)); c.lineWidth = 3; c.beginPath(); c.ellipse(px, py, 20 + q * 90, (20 + q * 90) * 0.4, 0, 0, TAU); c.stroke(); } D();
      K7.icon('pin', px, y - 34, 76, OR, { lw: 2.2 }); const lp = E.inOutC(seg(t, t0 + 0.5, 0.4)); if (lp > 0) { const c2 = G(); c2.strokeStyle = WA(0.9); c2.lineWidth = 2; c2.beginPath(); c2.moveTo(px, py + 20); c2.lineTo(px + 140 * lp, py + 20 + 50 * lp); c2.lineTo(px + 140, py + 70 + 70 * seg(t, t0 + 0.9, 0.3)); c2.stroke(); D(); } }
    function elements() {
      const [lw, lh] = logoBox(560), ctaY = 620 + lh / 2 + 150;
      const [pinx, piny] = posOf(elP('pin'), [W / 2, 960]);
      const els = [
        mkEl('kick', KICK, 116, 315, 0.1, ST[1] - 0.1, p => [p[0] - 46, p[1] - 26, 300, 52]),
        { id: 'pin', kind: 'pos', label: 'Property pin', x: pinx, y: piny, t0: 0.9, d: ST[1] - 0.9, box: [pinx - 60, piny - 110, 120, 160], dup: false, del: false },
        mkEl('addr', ADDR || 'Address', 540, 1160, 1.8, ST[1] - 1.8, p => [p[0] - 430, p[1] - 60, 860, AREA ? 190 : 120]),
        mkEl('price', PS || 'Price', W / 2, 1250, ST[3] + 0.4, OUT - (ST[3] + 0.4), p => [p[0] - 400, p[1] - 150, 800, 200]),
        mkEl('cta', CTA, W / 2, ctaY, OUT + 0.7, DUR - (OUT + 0.7), p => [p[0] - 400, p[1] - 60, 800, 120]),
      ];
      if (FT.length) els.splice(3, 0, mkEl('facts', 'Beds · baths · size', W / 2, 1290, ST[1] + 0.4, ST[2] - (ST[1] + 0.4), p => [p[0] - 400, p[1] - 40, 800, 80]));
      if (FEAT.length) els.splice(4, 0, mkEl('feats', FEAT[0], 150, 1190, ST[2] + 0.4, ST[3] - (ST[2] + 0.4), p => [p[0], p[1] - 36, 700, 300]));
      return els;
    }
    return {
      dur: DUR,
      elements,
      render(t) {
        BACKDROP(() => { if (!VID.collecting) fillScreen(BLK); });
        const draw = k => () => stage(S[k], t, 960);
        const k = t < ST[1] ? 0 : t < ST[2] ? 1 : t < ST[3] ? 2 : 3;
        if (t < OUT + 0.6) { if (k > 0 && t < ST[k] + 0.25) cut('whip', t, ST[k], 0.5, draw(k - 1), draw(k), { dir: k % 2 ? 'left' : 'right' }); else if (k < 3 && t > ST[k + 1] - 0.25) cut('whip', t, ST[k + 1], 0.5, draw(k), draw(k + 1), { dir: k % 2 ? 'right' : 'left' }); else draw(k)(); }
        const q = seg(t, OUT, 0.6); if (q > 0) fillScreen(BLK, q * 0.85);
        hud(t, fa(t, 0.1, 0.6));
        if (t < ST[1] + 0.2) { shade(1000, 1500, 0, 0.6); pin(t, 0.9); const tp = seg(t, 1.6, 0.4), [ax, ay] = posOf(elP('addr'), [540, 1160]);
          if (tp > 0 && !VID.collecting) { const c = G(); c.globalAlpha = E.outC(tp) * (1 - seg(t, ST[1] - 0.3, 0.3)); c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(ax - 430, ay - 60, 860, AREA ? 190 : 120); c.fillStyle = OR; c.fillRect(ax - 430, ay - 60, 6, AREA ? 190 : 120); D(); }
          const a = 1 - seg(t, ST[1] - 0.3, 0.3); if (ADDR) type(L8({ text: ADDR, slot: 'Mono', wt: 700, size: 44, w: 800, align: 'left', x: ax, y: ay, anim: { in: 'typewriter', stagger: 0.035, out: 'fade', outD: 0.3 }, t0: 1.8, d: ST[1] - 1.7 }), t); else if (tp > 0) addr('', ax - 390, ay + 10, 44, a, { align: 'left' });
          if (AREA) type(L8({ text: up(AREA), slot: 'Mono', wt: 700, size: 30, track: 200, color: 'accent', anim: { in: 'fade', out: 'fade', outD: 0.3 }, x: ax, y: ay + 80, t0: 2.6, d: ST[1] - 2.5 }), t); }
        else if (k === 1) { shade(1050, 1500, 0, 0.6); const [fx, fy] = posOf(elP('facts'), [W / 2, 1290]); chips(FT, fx, fy, 30, seg(t, ST[1] + 0.4, 1.0) * (1 - seg(t, ST[2] - 0.3, 0.3))); }
        else if (k === 2) { if (FEAT.length) shade(1000, 1500, 0, 0.6); const [fex, fey] = posOf(elP('feats'), [150, 1190]); FEAT.forEach((f, i) => { const p = seg(t, ST[2] + 0.4 + i * 0.5, 0.5) * (1 - seg(t, ST[3] - 0.3, 0.3)); if (p <= 0 || VID.collecting) return; const px = [360, 720, 480][i], py = [820, 900, 1060][i], ty = fey + i * 90, c = G();
            c.globalAlpha = E.outC(p); c.strokeStyle = WA(0.9); c.lineWidth = 2; c.beginPath(); c.arc(px, py, 10, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(px, py + 10); c.lineTo(px, ty - 50); c.lineTo(fex, ty - 50); c.stroke(); D();
            K7.txt(up(f), fex, ty, F(700, 36, 'Mono'), WHT, { a: E.outC(p), ls: 3 }); }); }
        else if (t < OUT) { shade(1000, 1500, 0, 0.7); const a = 1 - seg(t, OUT - 0.3, 0.3), [px2, py2] = posOf(elP('price'), [W / 2, 1250]);
          if (PS) { type(L8({ text: PS, slot: 'Bebas', size: 150, color: 'white', anim: { in: 'rise', out: 'fade', outD: 0.3 }, x: px2, y: py2, t0: ST[3] + 0.4, d: OUT - ST[3] - 0.4 }), t); if (dealWord(DEAL)) K7.txt(dealWord(DEAL), px2, py2 + 95, F(700, 30, 'Mono'), OR, { align: 'center', ls: 6, a: fa(t, ST[3] + 0.8) * a }); }
          else addr(ADDR, px2, py2 + 20, 56, fa(t, ST[3] + 0.4) * a, { fam: 'Mono', wt: 700 }); }
        if (t >= OUT) agentClose(t, OUT, { y: 620, cta: CTA, ctaL: { slot: 'Bebas', size: 110, color: 'accent', anim: { in: 'tracking' } }, ag: AG, agt: AGT, agp: AGP, url: URL });
      },
      cues() { const ev = [['air', 0.1, 0.3, 0], ['click', 0.3, 0.25, 0], ['drop', 0.9, 0.35, 0], ['pop', 1.35, 0.35, 0], ['typing', 1.8, 0.3, 0]];
        S.forEach((s, k) => { if (k) ev.push(['whoosh', s.start - 0.15, 0.4, k % 2 ? -0.4 : 0.4]); });
        FT.forEach((x, i) => ev.push(['click', ST[1] + 0.45 + i * 0.25, 0.25, (i - 1.5) * 0.25])); FEAT.forEach((x, i) => ev.push(['tick', ST[2] + 0.45 + i * 0.5, 0.3, 0.2]));
        ev.push(['swell', ST[3] + 0.2, 0.2, 0], ['air', OUT, 0.3, 0], ['chime', OUT + 1.3, 0.18, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ THE RESIDENCE
  // Quiet luxury: a gold hairline draws down the page, the title in spaced capitals, then chapters (I. Arrival, II. Living ...)
  // each in a tall gallery frame with its numeral and an italic room name; slow, no shake, an elegant fade or gold line between.
  function resid() {
    const ADDR = fact('addr', true), AREA = fact('area'), PRICE = fact('price'), DEAL = fact('deal'), FT = K7.facts({ beds: fact('beds'), baths: fact('baths'), sqft: fact('sqft') }), AG = fact('agent'), AGT = fact('agent_title'), AGP = fact('agent_phone'), URL = fact('url');
    const TITLE = TX('title', 'THE RESIDENCE', { label: 'Title', group: 'Opening', upper: true, max: 22 });
    const CH = ['Arrival', 'Living', 'Kitchen', 'Retreat'].map((n, k) => TX('ch' + (k + 1), n, { label: 'Chapter ' + (k + 1), group: 'Chapters', max: 18 }));
    const OFFER = TX('pricehead', 'Offered at', { label: 'Line above the price', group: 'Ending', max: 20 }), CTA = TX('cta', 'Arrange a private viewing', { label: 'Call to action', group: 'Ending', max: 30 });
    const T0 = 3.6, CD = 3.0, OUT = T0 + 4 * CD + 0.6, DUR = OUT + 4.4;
    const S = photos(CH.map((c, k) => 'Chapter ' + (k + 1)), CD + 0.4); S.forEach((s, k) => (s.start = T0 + k * CD));
    const FR = [140, 320, 800, 920], PS = K7.money(PRICE, DEAL), RN = ['I', 'II', 'III', 'IV'];
    function rule(x, y0, y1, p) { if (VID.collecting || p <= 0) return; const c = G(); c.fillStyle = OR; c.globalAlpha = 0.85; c.fillRect(x, y0, 1.5, (y1 - y0) * E.inOutS(clamp(p))); D(); }
    function elements() {
      const sh0 = S[0], r0 = inBox(sh0, FR);
      const [lw, lh] = logoBox(400);
      let y = 470; if (PS) y += 230;
      const ctaY = y + 190 + lh / 2 + 150;
      const els = [
        mkEl('title', TITLE, W / 2, 900, 0.9, T0 - 0.9, p => [p[0] - 400, p[1] - 92, 800, 120]),
        mkEl('addr', ADDR || 'Address', W / 2, 1060, 2.0, T0 - 2.0, p => [p[0] - 400, p[1] - 40, 800, 60]),
        mkEl('frame', 'Gallery frame', r0[0], r0[1], T0, OUT - T0, p => [p[0], p[1], r0[2], r0[3]]),
        mkEl('chapter', CH[0], W / 2, 1366, T0 + 0.5, CD - 0.5, p => [p[0] - 400, p[1] - 76, 800, 180]),
        mkEl('cta', CTA, W / 2, ctaY, OUT + 0.7, DUR - (OUT + 0.7), p => [p[0] - 400, p[1] - 60, 800, 120]),
      ];
      if (PS) els.splice(4, 0, mkEl('offer', OFFER + ' ' + PS, W / 2, 470, OUT + 0.4, DUR - (OUT + 0.4), p => [p[0] - 400, p[1] - 40, 800, 230]));
      if (FT.length) els.splice(4, 0, mkEl('facts', 'Beds · baths · size', W / 2, y, OUT + 1.0, DUR - (OUT + 1.0), p => [p[0] - 400, p[1] - 26, 800, 52]));
      return els;
    }
    return {
      dur: DUR,
      elements,
      render(t) {
        BACKDROP(() => { if (!VID.collecting) { const c = G(), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, DEEP1); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); } });
        if (t < T0 + 0.4) { const a = 1 - seg(t, T0 - 0.2, 0.5), [tx, ty] = posOf(elP('title'), [W / 2, 900]); rule(tx, ty - 540, ty - 140, seg(t, 0.2, 1.4) * a);
          type(L8({ text: TITLE, slot: 'Corm', wt: 500, size: 92, track: 380, color: 'white', anim: { in: 'blur', inD: 1.4, out: 'fade', outD: 0.4 }, x: tx, y: ty, t0: 0.9, d: T0 - 0.5 }), t);
          if (!VID.collecting) { const c = G(), k = E.inOutS(seg(t, 1.6, 0.8)) * a; c.fillStyle = OR; c.fillRect(tx - 160 * k, ty + 80, 320 * k, 1.5); D(); }
          const [ax, ay] = posOf(elP('addr'), [W / 2, 1060]);
          addr(ADDR, ax, ay, 40, fa(t, 2.0, 0.8) * a, { fam: 'Corm', wt: 500, style: 'italic' });
          if (AREA) K7.txt(up(AREA), ax, ay + 70, F(500, 24, 'Mont'), OR, { align: 'center', ls: 8, a: fa(t, 2.3, 0.8) * a }); rule(ax, ay + 120, ay + 520, seg(t, 2.2, 1.2) * a); }
        if (t >= T0 && t < OUT + 0.5) {
          const k = Math.min(3, Math.floor((t - T0) / CD)), lt = t - (T0 + k * CD), q = seg(t, OUT - 0.2, 0.6);
          const draw = j => () => { const r0 = inBox(S[j], FR), [rx, ry] = posOf(elP('frame'), [r0[0], r0[1]]), r = [rx, ry, r0[2], r0[3]]; K7.photo(S[j], t, r, { alpha: 1 - q }); if (!VID.collecting) { const c = G(); c.globalAlpha = 1 - q; c.strokeStyle = OR; c.lineWidth = 1.5; c.strokeRect(r[0] - 18, r[1] - 18, r[2] + 36, r[3] + 36); D(); } };
          if (k > 0 && lt < 0.45) cut(k % 2 ? 'goldline' : 'elegant', t, T0 + k * CD, 0.9, draw(k - 1), draw(k), { col: 'accent' }); else draw(k)();
          const nm = seg(lt, 0.4, 0.8) * (1 - seg(lt, CD - 0.35, 0.35)) * (1 - q), [chx, chy] = posOf(elP('chapter'), [W / 2, 1366]);
          K7.txt(RN[k], chx, chy - 76, F(500, 40, 'Corm'), OR, { align: 'center', ls: 6, a: E.outC(nm) });
          type(L8({ text: CH[k], slot: 'Corm', wt: 500, ital: true, size: 92, color: 'white', anim: { in: 'blur', inD: 0.8, out: 'fade', outD: 0.35 }, x: chx, y: chy, t0: T0 + k * CD + 0.5, d: CD - 0.5 }), t);
        }
        if (t >= OUT) { const ot = t - OUT; rule(W / 2, 200, 420, seg(ot, 0.1, 1.0));
          const [ofx, ofy] = posOf(elP('offer'), [W / 2, 470]);
          let y = ofy; if (PS) { K7.txt(OFFER, ofx, y, F(500, 40, 'Corm', 'italic'), WA(0.8), { align: 'center', a: fa(ot, 0.4, 0.7) }); type(L8({ text: PS, slot: 'Corm', wt: 500, size: 110, track: 60, color: 'accent', anim: { in: 'blur', inD: 1.0 }, x: ofx, y: y + 120, t0: OUT + 0.6, d: 30 }), t); y += 230; }
          const [fx, fy] = posOf(elP('facts'), [W / 2, y]);
          chips(FT, fx, fy, 26, seg(ot, 1.0, 1.0), { bg: 'rgba(0,0,0,0)', line: rgbaOf(OR, 0.6), r: 4, icol: OR });
          agentClose(t, OUT, { y: fy + 190, lw: 400, cta: CTA, ctaL: { slot: 'Corm', wt: 500, ital: true, size: 66, color: 'white', anim: { in: 'blur' } }, ctaH: 120, ag: AG, agt: AGT, agp: AGP, url: URL }); }
      },
      cues() { const ev = [['air', 0.2, 0.2, 0], ['shimmer', 1.0, 0.18, 0]]; S.forEach((s, k) => { ev.push(['air', s.start - 0.1, 0.22, (k % 2 ? 0.3 : -0.3)]); ev.push(['tink', s.start + 0.6, 0.16, 0]); }); ev.push(['swell', OUT - 0.4, 0.2, 0], ['chime', OUT + 0.8, 0.16, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ HOME JOURNAL
  // A personal scrapbook: polaroids are tossed onto a paper desk and taped down, each with a handwritten caption from the
  // features; a typed address label; the facts ticked off a checklist; a handwritten sign-off.
  function journal() {
    const ADDR = fact('addr', true), AREA = fact('area'), FT = K7.facts({ beds: fact('beds'), baths: fact('baths'), sqft: fact('sqft'), lot: fact('lot') }, ['beds', 'baths', 'sqft', 'lot']), BLURB = fact('blurb'), AG = fact('agent'), AGT = fact('agent_title'), AGP = fact('agent_phone'), URL = fact('url');
    const FEAT = K7.lines(fact('feat'));
    const TITLE = TX('title', 'Home Journal', { label: 'Title', group: 'Opening', max: 20 }), CTA = TX('cta', 'Come see it in person', { label: 'Sign-off', group: 'Ending', max: 28 });
    const PD = 2.6, T0 = 2.8, OUT = T0 + 4 * PD + 2.8, DUR = OUT + 4.3;
    const S = photos(['Polaroid 1', 'Polaroid 2', 'Polaroid 3', 'Polaroid 4'], [OUT - T0, OUT - T0 - PD, OUT - T0 - 2 * PD, OUT - T0 - 3 * PD]); S.forEach((s, k) => (s.start = T0 + k * PD));
    const POS = [[300, 600, -7], [770, 690, 6], [330, 1070, 4], [760, 1120, -5]], CAP = [0, 1, 2, 3].map(k => FEAT[k] || '');
    function desk() { if (VID.collecting) return; const c = G(); c.fillStyle = DEEP1; c.fillRect(-20, -20, W + 40, H + 40); c.strokeStyle = WA(0.06); c.lineWidth = 2; for (let y = 140; y < H; y += 64) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } c.strokeStyle = rgbaOf(ACC2, 0.35); c.beginPath(); c.moveTo(96, 0); c.lineTo(96, H); c.stroke(); D(); }
    function polaroid(s, k, t) {
      const lt = t - s.start; if (lt < 0) return; const [x0, y0, rot] = POS[k], [x, y] = posOf(elP('polaroid' + (k + 1)), [x0, y0]), p = seg(lt, 0, 0.55), e = E.outBack(p), ang = (rot + (1 - e) * (k % 2 ? 40 : -40)) * Math.PI / 180, ox = (1 - e) * (k % 2 ? 700 : -700), w = 400, ph = 400, r = inBox(s, [x - w / 2 + 20, y - 240, w - 40, ph]);
      if (!VID.collecting) { const c = G(); c.translate(x + ox, y); c.rotate(ang); c.translate(-x, -y); c.shadowColor = 'rgba(0,0,0,0.25)'; c.shadowBlur = 24; c.shadowOffsetY = 10; c.fillStyle = '#FFFFFF'; c.fillRect(x - w / 2, y - 260, w, 520); c.shadowColor = 'transparent'; c.fillStyle = '#1E1E1E'; c.fillRect(x - w / 2 + 20, y - 240, w - 40, ph); D(); }
      photoT(s, t, r, { rot: ang, px: x, py: y, ox });
      if (!VID.collecting) { const c = G(); c.translate(x + ox, y); c.rotate(ang); c.translate(-x, -y); const tp = seg(lt, 0.5, 0.2); if (tp > 0) { c.globalAlpha = 0.75 * tp; c.fillStyle = rgbaOf(ACC2, 0.7); c.save(); c.translate(x, y - 262); c.rotate(-0.06); c.fillRect(-70, -20, 140, 40); c.restore(); }
        c.globalAlpha = 1; if (CAP[k]) { const cp = seg(lt, 0.7, 0.6), f = F(700, Math.min(46, fitSize(CAP[k], 700, w - 50, 46, 'Hand', 0)), 'Hand'), n = Math.round(CAP[k].length * cp); setF(f, 0); c.fillStyle = '#26221C'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CAP[k].slice(0, n), x, y + 205); } D(); }
    }
    function elements() {
      const [lw, lh] = logoBox(560), ctaY = 620 + lh / 2 + 150;
      const els = [
        mkEl('title', TITLE, W / 2, 820, 0.4, T0 - 0.4, p => [p[0] - 400, p[1] - 150, 800, 200]),
        mkEl('polaroid1', CAP[0] || 'Polaroid 1', POS[0][0], POS[0][1], S[0].start, OUT - S[0].start, p => [p[0] - 200, p[1] - 260, 400, 520]),
        mkEl('polaroid2', CAP[1] || 'Polaroid 2', POS[1][0], POS[1][1], S[1].start, OUT - S[1].start, p => [p[0] - 200, p[1] - 260, 400, 520]),
        mkEl('polaroid3', CAP[2] || 'Polaroid 3', POS[2][0], POS[2][1], S[2].start, OUT - S[2].start, p => [p[0] - 200, p[1] - 260, 400, 520]),
        mkEl('polaroid4', CAP[3] || 'Polaroid 4', POS[3][0], POS[3][1], S[3].start, OUT - S[3].start, p => [p[0] - 200, p[1] - 260, 400, 520]),
        mkEl('addr', ADDR || 'Address', W / 2, 640, OUT - 2.6, 2.6, p => [p[0] - 430, p[1] - 70, 860, 140]),
        mkEl('cta', CTA, W / 2, ctaY, OUT + 0.7, DUR - (OUT + 0.7), p => [p[0] - 400, p[1] - 60, 800, 120]),
      ];
      if (BLURB) els.splice(1, 0, mkEl('blurb', BLURB, W / 2, 1000, 1.2, T0 - 1.2, p => [p[0] - 430, p[1] - 50, 860, 80]));
      if (FT.length) els.push(mkEl('facts', 'Checklist', 300, 900, OUT - 2.0, 2.0, p => [p[0], p[1] - 34, 500, FT.length * 96 + 20]));
      return els;
    }
    return {
      dur: DUR,
      elements,
      render(t) {
        BACKDROP(() => { desk(); });
        if (t < T0 + 0.4) { const a = 1 - seg(t, T0 - 0.2, 0.5), [tx, ty] = posOf(elP('title'), [W / 2, 820]);
          type(L8({ text: TITLE, slot: 'Hand', wt: 700, size: 150, color: 'white', anim: { in: 'letters', stagger: 0.06, out: 'fade', outD: 0.4 }, x: tx, y: ty, t0: 0.4, d: T0 }), t);
          const [bx, by] = posOf(elP('blurb'), [W / 2, 1000]);
          if (BLURB) type(L8({ text: BLURB, slot: 'Corm', wt: 500, ital: true, size: 50, w: 860, color: 'white', anim: { in: 'words', out: 'fade', outD: 0.4 }, x: bx, y: by, t0: 1.2, d: T0 - 0.8 }), t);
          if (!VID.collecting) { const c = G(), k = E.inOutC(seg(t, 0.9, 0.6)) * a; c.strokeStyle = OR; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); for (let i = 0; i <= 30 * k; i++) c.lineTo(tx - 240 + i * 16, ty + 60 + Math.sin(i * 0.8) * 6); c.stroke(); D(); } }
        if (t >= T0 && t < OUT) { const q = seg(t, OUT - 2.8, 0.6) * 0.75; S.forEach((s, k) => polaroid(s, k, t)); if (q > 0) fillScreen(DEEP1, q);
          if (t >= OUT - 2.8) { const t1 = OUT - 2.6, [ax, ay] = posOf(elP('addr'), [W / 2, 640]);   // the label and the checklist over the desk
            if (!VID.collecting) { const p = seg(t, t1, 0.4), c = G(); c.globalAlpha = E.outC(p); c.translate(ax, ay); c.rotate(-0.02); c.fillStyle = '#F7F3EA'; c.shadowColor = 'rgba(0,0,0,0.2)'; c.shadowBlur = 16; c.fillRect(-430, -70, 860, 140); c.shadowColor = 'transparent'; c.fillStyle = rgbaOf(OR, 0.9); c.fillRect(-430, -70, 860, 8); D(); }
            if (ADDR) type(L8({ text: ADDR, slot: 'Mono', wt: 700, size: 44, w: 800, color: '#26221C', anim: { in: 'typewriter', stagger: 0.03 }, x: ax, y: ay, t0: t1 + 0.2, d: 30 }), t); else K7.need('address', ax, ay + 10, 22, { align: 'center', col: '#26221C', a: fa(t, t1) });
            if (AREA) K7.txt(AREA, ax, ay + 130, F(700, 54, 'Hand'), WHT, { align: 'center', a: fa(t, t1 + 0.5) });
            const [fx, fy] = posOf(elP('facts'), [300, 900]);
            FT.forEach((x, i) => { const y = fy + i * 96, p = seg(t, t1 + 0.6 + i * 0.3, 0.3); if (p <= 0 || VID.collecting) return; const c = G(); c.globalAlpha = E.outC(p); c.strokeStyle = WHT; c.lineWidth = 3; c.strokeRect(fx, y - 34, 44, 44); c.strokeStyle = OR; c.lineWidth = 6; c.lineCap = 'round'; const k = seg(t, t1 + 0.8 + i * 0.3, 0.2); c.beginPath(); c.moveTo(fx + 6, y - 12); c.lineTo(fx + 6 + 12 * Math.min(1, k * 2), y - 12 + 12 * Math.min(1, k * 2)); if (k > 0.5) c.lineTo(fx + 18 + 22 * (k - 0.5) * 2, y - 24 * (k - 0.5) * 2); c.stroke(); D();
              K7.txt(x.n + (x.u ? ' ' + x.u.toLowerCase() : ''), fx + 70, y, F(700, 56, 'Hand'), WHT, { a: E.outC(p) }); }); } }
        if (t >= OUT) agentClose(t, OUT, { y: 620, cta: CTA, ctaL: { slot: 'Hand', wt: 700, size: 92, color: 'accent', anim: { in: 'letters', stagger: 0.04 } }, ctaH: 130, ag: AG, agt: AGT, agp: AGP, url: URL });
      },
      cues() { const ev = [['pencil', 0.4, 0.3, 0], ['pencil', 0.95, 0.25, 0.2]]; S.forEach((s, k) => { ev.push(['swish', s.start, 0.35, k % 2 ? 0.4 : -0.4]); ev.push(['paper', s.start + 0.45, 0.3, 0]); ev.push(['pencil', s.start + 0.75, 0.2, 0.2]); });
        ev.push(['typing', OUT - 2.4, 0.3, 0]); FT.forEach((x, i) => ev.push(['pencil', OUT - 1.8 + i * 0.3, 0.25, 0.2])); ev.push(['paper', OUT + 0.1, 0.25, 0]);
        return { dur: DUR, beds: [musicBed(DUR), ['room', 0, DUR, 0.1]], events: ev }; },
    };
  }

  // ================================================================ NEW DEVELOPMENT
  // A blueprint grid; an isometric block draws itself floor by floor; the project name in a wide display face, the status you
  // pick (never assumed), renderings or progress photos in a technical frame, amenity tiles with line icons, a register line.
  function devel() {
    const ADDR = fact('addr'), AREA = fact('area'), FEAT = K7.lines(fact('feat')).slice(0, 6), AG = fact('agent'), AGT = fact('agent_title'), AGP = fact('agent_phone'), URL = fact('url'), PTYPE = fact('ptype');
    const NAME = TX('project', 'THE PROJECT NAME', { label: 'Development name', group: 'The project', upper: true, max: 24, req: true, hint: 'Sample text: type the development’s name.' });
    const STATUS = TX('status', 'REGISTER INTEREST', { label: 'Status', group: 'The project', options: ['REGISTER INTEREST', 'COMING SOON', 'NOW SELLING', 'NOW LEASING', 'NOW OPEN'].map(v => ({ value: v, label: v.charAt(0) + v.slice(1).toLowerCase() })) });
    const CTA = TX('cta', 'REGISTER YOUR INTEREST', { label: 'Call to action', group: 'Ending', upper: true, max: 28 });
    const T1 = 4.2, T2 = 8.0, T3 = 11.8, OUT = 15.2, DUR = OUT + 4.4;
    const S = photos(['Rendering or progress 1', 'Rendering or progress 2', 'Rendering or progress 3'], [T2 - T1 + 0.2, T3 - T2 + 0.2, OUT - T3 + 0.2]); S[0].start = T1; S[1].start = T2; S[2].start = T3;
    const ICONS = ['home', 'key', 'car', 'lot', 'area', 'star'], FR = [90, 380, 900, 820];
    function grid(t) { if (VID.collecting) return; const c = G(); c.fillStyle = BLK; c.fillRect(-20, -20, W + 40, H + 40); c.strokeStyle = rgbaOf(ACC2, 0.12); c.lineWidth = 1; for (let x = 0; x <= W; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y <= H; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      c.strokeStyle = rgbaOf(ACC2, 0.25); for (let x = 0; x <= W; x += 200) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y <= H; y += 200) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } D(); }
    function iso(cx, cy, p, a) {   // an isometric block drawn floor by floor: edges, then windows
      if (VID.collecting || p <= 0) return; const c = G(), u = 46, fl = 9, w = 5, d = 4, P = (x, y, z) => [cx + (x - y) * u * 0.866, cy + (x + y) * u * 0.5 - z * u * 0.8]; c.globalAlpha = a; c.lineWidth = 2; c.strokeStyle = OR;
      const fp = p * (fl + 2); for (let z = 0; z <= Math.min(fl, fp); z++) { const k = clamp(fp - z); c.globalAlpha = a * (z === 0 || z === fl ? 1 : 0.55); c.beginPath(); const pts = [P(0, 0, z), P(w, 0, z), P(w, d, z), P(0, d, z)]; c.moveTo(...pts[0]); for (let i = 1; i <= 4 * k; i++) c.lineTo(...pts[i % 4]); c.stroke(); }
      c.globalAlpha = a; const hk = clamp(fp / fl); for (const [x, y] of [[0, 0], [w, 0], [w, d], [0, d]]) { const A = P(x, y, 0), B = P(x, y, fl * hk); c.beginPath(); c.moveTo(...A); c.lineTo(...B); c.stroke(); }
      if (fp > fl) { const wk = clamp(fp - fl), c2 = c; c2.fillStyle = rgbaOf(ACC2, 0.55); for (let z = 0; z < fl; z++) for (let x = 0; x < w; x++) { if (hash(z * 7 + x) > wk) continue; const q = [P(x + 0.25, 0, z + 0.25), P(x + 0.75, 0, z + 0.25), P(x + 0.75, 0, z + 0.75), P(x + 0.25, 0, z + 0.75)]; c2.beginPath(); c2.moveTo(...q[0]); q.slice(1).forEach(v => c2.lineTo(...v)); c2.fill(); }
        for (let z = 0; z < fl; z++) for (let y = 0; y < d; y++) { if (hash(z * 13 + y + 50) > wk) continue; const q = [P(w, y + 0.25, z + 0.25), P(w, y + 0.75, z + 0.25), P(w, y + 0.75, z + 0.75), P(w, y + 0.25, z + 0.75)]; c2.beginPath(); c2.moveTo(...q[0]); q.slice(1).forEach(v => c2.lineTo(...v)); c2.fill(); } } D(); }
    function frame(s, t, a) { const r0 = inBox(s, FR), [rx, ry] = posOf(elP('frame'), [r0[0], r0[1]]), r = [rx, ry, r0[2], r0[3]]; K7.photo(s, t, r, { alpha: a }); if (VID.collecting) return r; const c = G(); c.globalAlpha = a; c.strokeStyle = OR; c.lineWidth = 2; const L = 40; for (const [x, y, sx, sy] of [[r[0], r[1], 1, 1], [r[0] + r[2], r[1], -1, 1], [r[0], r[1] + r[3], 1, -1], [r[0] + r[2], r[1] + r[3], -1, -1]]) { c.beginPath(); c.moveTo(x - sx * 14, y + sy * L); c.lineTo(x - sx * 14, y - sy * 14); c.lineTo(x + sx * L, y - sy * 14); c.stroke(); }
      setF(F(700, 20, 'Mono'), 3); c.fillStyle = OR; c.textAlign = 'left'; c.fillText('FIG. ' + (S.indexOf(s) + 1), r[0], r[1] - 34); D(); return r; }
    function elements() {
      const [lw, lh] = logoBox(560), ctaY = 560 + lh / 2 + 150;
      const sh0 = S[0], r0 = inBox(sh0, FR);
      const n = FEAT.length, cols = Math.min(3, n), x0 = W / 2 - (cols * 270 + (cols - 1) * 20) / 2;
      const els = [
        mkEl('name', NAME, W / 2, 450, 1.0, T1 - 1.0, p => [p[0] - 400, p[1] - 100, 800, 130]),
        mkEl('building', 'Building', 560, 1060, 0.2, T1 - 0.2, p => [p[0] - 320, p[1] - 500, 640, 600]),
        mkEl('status', STATUS, W / 2, 1380, 2.4, OUT - 2.4, p => [p[0] - 300, p[1] - 45, 600, 90]),
        mkEl('frame', 'Technical frame', r0[0], r0[1], T1, OUT - T1, p => [p[0], p[1], r0[2], r0[3]]),
        mkEl('framename', NAME, W / 2, 1270, T1 + 0.4, T2 - (T1 + 0.4), p => [p[0] - 400, p[1] - 80, 800, 160]),
        mkEl('cta', CTA, W / 2, ctaY, OUT + 0.7, DUR - (OUT + 0.7), p => [p[0] - 400, p[1] - 60, 800, 120]),
      ];
      if (FEAT.length) els.push(mkEl('amenities', FEAT[0], x0, 1060, T2 + 0.4, T3 - (T2 + 0.4), p => [p[0], p[1], cols * 270 + (cols - 1) * 20, Math.ceil(n / cols) * 166]));
      return els;
    }
    return {
      dur: DUR,
      elements,
      render(t) {
        BACKDROP(() => { grid(t); });
        if (t < T1 + 0.5) { const a = 1 - seg(t, T1 - 0.2, 0.6), [bx, by] = posOf(elP('building'), [560, 1060]); iso(bx, by, seg(t, 0.2, 2.8), a);
          const [nx, ny] = posOf(elP('name'), [W / 2, 450]);
          type(L8({ text: NAME, slot: 'Bebas', size: 100, track: 40, w: 1000, color: 'white', anim: { in: 'wipe', inD: 0.8, out: 'fade', outD: 0.4 }, x: nx, y: ny, t0: 1.0, d: T1 - 0.5 }), t);
          if (PTYPE || AREA) K7.txt(up([PTYPE, AREA].filter(Boolean).join('  ·  ')), nx, ny + 110, F(700, 28, 'Mono'), ACC2, { align: 'center', ls: 4, a: fa(t, 1.6) * a });
          pill(STATUS, 540, 1380, 2.4, T1 - 2.1, t, 40, 'status'); }
        if (t >= T1 && t < OUT) { const k = t < T2 ? 0 : t < T3 ? 1 : 2, q = seg(t, OUT - 0.4, 0.4); const draw = j => () => frame(S[j], t, 1 - q);
          if (k > 0 && t < S[k].start + 0.35) cut(k === 1 ? 'grid' : 'panels', t, S[k].start, 0.7, draw(k - 1), draw(k), { col: 'accent' }); else draw(k)();
          if (k === 0) { const [fnx, fny] = posOf(elP('framename'), [W / 2, 1270]); type(L8({ text: NAME, slot: 'Bebas', size: 80, track: 40, color: 'white', anim: { in: 'tracking', out: 'fade' }, x: fnx, y: fny, t0: T1 + 0.4, d: T2 - T1 - 0.2 }), t); if (ADDR || AREA) K7.txt(ADDR || AREA, fnx, fny + 80, F(600, 32, 'Mont'), WA(0.85), { align: 'center', a: fa(t, T1 + 0.8) * (1 - seg(t, T2 - 0.3, 0.3)) }); }
          else if (k === 1 && FEAT.length) { const n = FEAT.length, cols = Math.min(3, n), rows = Math.ceil(n / cols), tw = 270, th = 150, x0 = W / 2 - (cols * tw + (cols - 1) * 20) / 2, [amx, amy] = posOf(elP('amenities'), [x0, 1060]);
            FEAT.forEach((f, i) => { const p = seg(t, T2 + 0.4 + i * 0.2, 0.4) * (1 - seg(t, T3 - 0.3, 0.3)); if (p <= 0 || VID.collecting) return; const x = amx + (i % cols) * (tw + 20), y = amy + Math.floor(i / cols) * (th + 16), c = G(); c.globalAlpha = E.outC(p); c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(x, y + (1 - E.outC(p)) * 40, tw, th); c.strokeStyle = rgbaOf(OR, 0.8); c.lineWidth = 1.5; c.strokeRect(x, y + (1 - E.outC(p)) * 40, tw, th); D();
              K7.icon(ICONS[i % ICONS.length], x + 40, y + 50, 40, OR, { a: E.outC(p), lw: 1.8 }); K7.txt(up(f), x + 20, y + 115, F(700, Math.min(26, fitSize(up(f), 700, tw - 40, 26, 'Mont', 1)), 'Mont'), WHT, { a: E.outC(p), ls: 1 }); }); void rows; }
          else if (k === 2) pill(STATUS, 540, 1400, T3 + 0.3, OUT - T3 - 0.2, t, 40, 'status'); }
        if (t >= OUT) { iso(560, 1500, 1, 0.35 * fa(t, OUT, 0.8)); agentClose(t, OUT, { y: 560, cta: CTA, ctaL: { slot: 'Bebas', size: 84, track: 30, w: 1000, color: 'accent', anim: { in: 'wipe' } }, ctaH: 130, ag: AG, agt: AGT, agp: AGP, url: URL }); }
      },
      cues() { const ev = [['tick', 0.3, 0.2, 0], ['pencil', 0.4, 0.3, -0.2], ['pencil', 1.4, 0.3, 0.2], ['whoosh', 1.0, 0.3, 0], ['pop', 2.5, 0.35, 0], ['click', T1, 0.3, 0], ['click', T2, 0.3, 0], ['click', T3, 0.3, 0]];
        FEAT.forEach((f, i) => ev.push(['tick', T2 + 0.45 + i * 0.2, 0.25, (i % 3 - 1) * 0.3])); ev.push(['pop', T3 + 0.35, 0.35, 0], ['swell', OUT - 0.5, 0.2, 0], ['chime', OUT + 1.2, 0.16, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ COMING SOON
  // A teaser: the photo stays blurred while a spotlight drifts across it and shows a sharp glimpse; COMING SOON in stencil
  // capitals with a sweep; only the neighbourhood is named (the address stays private unless you add it); a "get on the list" close.
  function soon() {
    const AREA = fact('area'), ADDR = fact('addr'), FT = K7.facts({ beds: fact('beds'), baths: fact('baths'), sqft: fact('sqft') }), AG = fact('agent'), AGT = fact('agent_title'), AGP = fact('agent_phone'), URL = fact('url');
    const W1 = TX('w1', 'COMING', { label: 'Word 1', group: 'Headline', upper: true, max: 10 }), W2 = TX('w2', 'SOON', { label: 'Word 2', group: 'Headline', upper: true, max: 10 });
    const SHOW = TX('showaddr', 'area', { label: 'What to name', group: 'Headline', options: [{ value: 'area', label: 'The neighbourhood only' }, { value: 'addr', label: 'The full address' }, { value: 'none', label: 'Nothing yet' }] });
    const CTA = TX('cta', 'GET ON THE LIST', { label: 'Call to action', group: 'Ending', upper: true, max: 24 });
    const T1 = 5.2, T2 = 10.0, OUT = 13.8, DUR = OUT + 4.3;
    const S = photos(['The teaser photo', 'A second glimpse'], [T2 + 0.2, OUT - T2 + 0.4]); S[0].start = 0; S[1].start = T2;
    const PLACE = SHOW === 'addr' ? ADDR : SHOW === 'area' ? AREA : '';
    function peek(s, t, cx, cy, r, blur) {
      const R = stageRect(s, 900);
      if (!VID.collecting) { ctx.save(); ctx.filter = `blur(${blur}px) brightness(0.7)`; } K7.photo(s, t, R); if (!VID.collecting) ctx.restore();
      if (r <= 0) return; ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.arc(cx + SH.x, cy + SH.y, r, 0, TAU); ctx.clip(); } K7.photo(s, t, R); ctx.restore();
      if (!VID.collecting) { const c = G(); c.strokeStyle = WA(0.8); c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.stroke(); const g = c.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.4); g.addColorStop(0, rgbaOf(OR, 0.0)); g.addColorStop(0.3, rgbaOf(OR, 0.25)); g.addColorStop(1, rgbaOf(OR, 0)); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r * 1.4, 0, TAU); c.fill(); D(); } }
    function elements() {
      const [lw, lh] = logoBox(560), ctaY = 600 + lh / 2 + 150;
      const els = [
        mkEl('w1', W1, W / 2, 990, 0.6, OUT - 0.6, p => [p[0] - 400, p[1] - 230, 800, 260]),
        mkEl('w2', W2, W / 2, 1210, T1 - 0.3, OUT - (T1 - 0.3), p => [p[0] - 400, p[1] - 300, 800, 340]),
        mkEl('cta', CTA, W / 2, ctaY, OUT + 0.7, DUR - (OUT + 0.7), p => [p[0] - 400, p[1] - 60, 800, 120]),
      ];
      if (PLACE) els.splice(2, 0, mkEl('place', PLACE, W / 2, 1395, T1 + 0.6, OUT - (T1 + 0.6), p => [p[0] - 400, p[1] - 32, 800, 60]));
      if (FT.length) els.push(mkEl('facts', 'Beds · baths · size', W / 2, 330, T2 + 0.5, OUT - (T2 + 0.5), p => [p[0] - 400, p[1] - 30, 800, 60]));
      return els;
    }
    return {
      dur: DUR, shakes: [[T1, 8]],
      elements,
      render(t) {
        BACKDROP(() => { if (!VID.collecting) fillScreen(BLK); });
        if (t < OUT) { const s = t < T2 ? S[0] : S[1], u = t < T2 ? t : t - T2, cx = 540 + Math.sin(u * 0.55) * 260, cy = 900 + Math.cos(u * 0.4) * 300, r = 170 * E.outBack(seg(u, 0.6, 0.6)) * (1 - seg(t, OUT - 0.4, 0.4));
          if (t > T2 - 0.4 && t < T2 + 0.4) cut('focus', t, T2, 0.8, () => peek(S[0], t, cx, cy, r, 26), () => peek(S[1], t, cx, cy, r, 26)); else peek(s, t, cx, cy, r, 26); }
        if (t < OUT) { shade(850, H, 0, 0.75);
          const [w1x, w1y] = posOf(elP('w1'), [W / 2, 990]);
          type(L8({ text: W1, slot: 'Bebas', size: 230, track: 40, color: 'white', fx: { fill: 'outline', stroke: 4, scol: 'white' }, anim: { in: 'charup', stagger: 0.06, out: 'fade', outD: 0.3 }, x: w1x, y: w1y, t0: 0.6, d: OUT - 0.5 }), t);
          const [w2x, w2y] = posOf(elP('w2'), [W / 2, 1210]);
          type(L8({ text: W2, slot: 'Bebas', size: 300, track: 40, color: 'accent', fx: { sweep: true }, anim: { in: 'punch', out: 'fade', outD: 0.3 }, x: w2x, y: w2y, t0: T1 - 0.3, d: OUT - T1 + 0.2 }), t);
          const [plx, ply] = posOf(elP('place'), [W / 2, 1395]);
          if (PLACE) type(L8({ text: up(PLACE), slot: 'Mont', wt: 700, size: 32, track: 300, color: 'white', anim: { in: 'tracking', out: 'fade', outD: 0.3 }, x: plx, y: ply, t0: T1 + 0.6, d: OUT - T1 - 0.5 }), t);
          const [fx, fy] = posOf(elP('facts'), [W / 2, 330]);
          if (t >= T2) chips(FT, fx, fy, 26, seg(t, T2 + 0.5, 1.0) * (1 - seg(t, OUT - 0.4, 0.4)), { bg: 'rgba(0,0,0,0.55)' }); }
        if (t >= OUT) agentClose(t, OUT, { y: 600, cta: CTA, ctaL: { slot: 'Bebas', size: 120, track: 30, color: 'accent', fx: { sweep: true }, anim: { in: 'punch' } }, ctaH: 140, ag: AG, agt: AGT, agp: AGP, url: URL });
      },
      cues() { const ev = [['heartbeat', 0.4, 0.3, 0], ['air', 1.2, 0.25, -0.3], ['riser', T1 - 2.0, 0.3, 0], ['impact', T1 - 0.3, 0.55, 0], ['boom', T1 - 0.28, 0.4, 0], ['shimmer', T1 + 0.4, 0.2, 0.2], ['reverse', T2 - 0.5, 0.3, 0], ['air', T2 + 0.6, 0.25, 0.3], ['impact', OUT + 0.7, 0.45, 0]];
        return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ NOW LEASING
  // App language: a listing card slides up like a phone sheet with the photo, a NOW LEASING pill, rent from the listing and size
  // chips; amenities pop in as chips; swipes between photos; a big rounded "schedule a tour" button.
  function lease() {
    const ADDR = fact('addr', true), AREA = fact('area'), PRICE = fact('price'), DEAL = fact('deal'), PTYPE = fact('ptype'), FT = K7.facts({ beds: fact('beds'), baths: fact('baths'), sqft: fact('sqft') }), FEAT = K7.lines(fact('feat')).slice(0, 6), AG = fact('agent'), AGT = fact('agent_title'), AGP = fact('agent_phone'), URL = fact('url');
    const PILL = TX('pill', 'NOW LEASING', { label: 'Pill on the card', group: 'Card', upper: true, max: 18 }), CTA = TX('cta', 'SCHEDULE A TOUR', { label: 'Button', group: 'Ending', upper: true, max: 22 });
    const T0 = 0.6, SD = 3.0, OUT = T0 + 4 * SD + 0.4, DUR = OUT + 4.2;
    const S = photos(['Photo 1', 'Photo 2', 'Photo 3', 'Photo 4'], SD + 0.4); S.forEach((s, k) => (s.start = T0 + k * SD));
    const RENT = K7.money(PRICE, DEAL || 'rent'), CARD = [60, 250, 960, 1210], PR = [90, 280, 900, 620];
    function card(t, a) { if (VID.collecting) return; const p = E.outQ(seg(t, 0.1, 0.8)), [cdx, cdy] = posOf(elP('card'), [CARD[0], CARD[1]]), y = cdy + (1 - p) * 1400, c = G(); c.globalAlpha = a; c.shadowColor = 'rgba(15,23,42,0.18)'; c.shadowBlur = 50; c.shadowOffsetY = 20; c.fillStyle = '#FFFFFF'; c.beginPath(); c.roundRect(cdx, y, CARD[2], CARD[3], 48); c.fill(); D(); return [y - cdy, cdx - CARD[0]]; }
    function elements() {
      const [lw, lh] = logoBox(560), ctaY = 560 + lh / 2 + 150;
      const sh0 = S[0], r0 = inBox(sh0, PR);
      const els = [
        mkEl('card', 'Listing card', CARD[0], CARD[1], 0.1, OUT - 0.1, p => [p[0], p[1], CARD[2], CARD[3]]),
        mkEl('photo', 'Card photo', r0[0], r0[1], T0, OUT - T0, p => [p[0], p[1], r0[2], r0[3]]),
        mkEl('pill', PILL, 300, PR[1] + 76, 0.9, OUT - 0.9, p => [p[0] - 150, p[1] - 30, 300, 60]),
        mkEl('addr', ADDR || 'Address', 110, RENT ? 1050 : 990, 0.8, OUT - 0.8, p => [p[0], p[1] - 38, 860, 60]),
        mkEl('cta', CTA, W / 2, ctaY, OUT + 0.7, DUR - (OUT + 0.7), p => [p[0] - 400, p[1] - 60, 800, 120]),
      ];
      if (RENT) els.splice(3, 0, mkEl('rent', RENT, 110, 990, 0.8, OUT - 0.8, p => [p[0], p[1] - 76, 500, 100]));
      if (FT.length) els.push(mkEl('facts', 'Beds · baths · size', W / 2, 1176, 1.4, OUT - 1.4, p => [p[0] - 400, p[1] - 26, 800, 52]));
      if (FEAT.length) els.push(mkEl('amenities', FEAT[0], 300, 1262, T0 + SD + 0.3, OUT - (T0 + SD + 0.3), p => [p[0], p[1] - 28, 780, Math.ceil(FEAT.length / 2) * 64]));
      return els;
    }
    return {
      dur: DUR,
      elements,
      render(t) {
        BACKDROP(() => { if (!VID.collecting) { const c = G(), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, DEEP1); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); } });
        if (t < OUT) { const q = seg(t, OUT - 0.3, 0.3), [dy, dx] = card(t, 1 - q) || [0, 0]; const k = Math.min(3, Math.max(0, Math.floor((t - T0) / SD)));
          const draw = j => () => { const r0 = inBox(S[j], [PR[0] + dx, PR[1] + dy, PR[2], PR[3]]), [rx, ry] = posOf(elP('photo'), [r0[0], r0[1]]), r = [rx, ry, r0[2], r0[3]]; ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.roundRect(PR[0] + dx + SH.x, PR[1] + dy + SH.y, PR[2], PR[3], 34); ctx.clip(); ctx.fillStyle = '#0F172A'; ctx.fillRect(PR[0] + dx + SH.x, PR[1] + dy + SH.y, PR[2], PR[3]); } K7.photo(S[j], t, r, { alpha: 1 - q }); ctx.restore(); };
          if (k > 0 && t < S[k].start + 0.25) cut('swipe', t, S[k].start, 0.5, draw(k - 1), draw(k), { dir: 'left' }); else draw(k)();
          if (!VID.collecting) { const c = G(); c.globalAlpha = 1 - q; for (let i = 0; i < 4; i++) { c.fillStyle = i === k ? '#FFFFFF' : 'rgba(255,255,255,0.5)'; c.beginPath(); c.roundRect(W / 2 + dx - 66 + i * 36, PR[1] + dy + PR[3] - 40, i === k ? 40 : 14, 14, 7); c.fill(); } D(); }
          const [plx, ply] = posOf(elP('pill'), [300 + dx, PR[1] + 76]);
          pill(PILL, plx, ply + dy, 0.9, OUT - 0.9 - 0.3, t, 30);
          const a = (1 - q) * fa(t, 0.8, 0.5), tx = 110, ink = LIGHTPAL && K8.lum(WHT) < 0.2 ? WHT : '#111827';
          const [rtx, rty] = posOf(elP('rent'), [tx + dx, 990]), [ax, ay] = posOf(elP('addr'), [tx + dx, RENT ? 1050 : 990]);
          if (RENT) K7.txt(RENT, rtx, rty + dy, F(900, 76, 'Mont'), ink, { a });
          if (ADDR) K7.txt(ADDR, ax, ay + dy, F(600, Math.min(38, fitSize(ADDR, 600, 860, 38, 'Mont', 0)), 'Mont'), ink, { a: a * 0.85 }); else K7.need('address', ax, ay + dy, 20, { col: ink, a });
          if (AREA || PTYPE) K7.txt([PTYPE, AREA].filter(Boolean).join('  ·  '), ax, ay + (RENT ? 48 : 50) + dy, F(500, 30, 'Mont'), ink, { a: a * 0.6 });
          const [fx, fy] = posOf(elP('facts'), [W / 2 + dx, 1176]);
          chips(FT, fx, fy + dy, 26, seg(t, 1.4, 1.0) * (1 - q), { bg: rgbaOf(OR, 0.12), col: ink, icol: OR });
          const [amx, amy] = posOf(elP('amenities'), [300 + dx, 1262]);
          FEAT.forEach((f, i) => { const tt = T0 + SD + 0.3 + i * 0.35; if (t < tt) return; const x = amx + (i % 2) * 480, y = amy + Math.floor(i / 2) * 64 + dy; type(L8({ text: f, slot: 'Mont', wt: 700, size: 28, w: 470, color: ink, fx: { deco: 'pill', dcol: K8.mix('accent', '#FFFFFF', 0.85) }, anim: { in: 'pop', out: 'fade' }, x, y, t0: tt, d: OUT - tt }), t); });
        }
        if (t >= OUT) agentClose(t, OUT, { y: 560, cta: CTA, ctaL: { slot: 'Mont', wt: 900, size: 64, color: 'accent', anim: { in: 'pop' } }, ctaH: 110, ag: AG, agt: AGT, agp: AGP, url: URL });
      },
      cues() { const ev = [['swish', 0.1, 0.35, 0], ['pop', 0.95, 0.35, -0.3], ['notify', 1.0, 0.3, 0]]; S.forEach((s, k) => { if (k) ev.push(['swish', s.start - 0.1, 0.3, -0.3]); }); FT.forEach((x, i) => ev.push(['click', 1.5 + i * 0.25, 0.25, (i - 1) * 0.3]));
        FEAT.forEach((f, i) => ev.push(['pop', T0 + SD + 0.35 + i * 0.35, 0.3, i % 2 ? 0.3 : -0.3])); ev.push(['notify', OUT - SD + 0.6, 0.3, 0], ['click', OUT - SD + 1.2, 0.3, 0], ['chime', OUT + 1.2, 0.16, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ THE LUXURY COLLECTION
  // Black and gold: letterbox bars, slow gold dust, a light sweep across the gold title, each photo in a fine gold frame with
  // the feature in spaced capitals, diamonds between facts, and an understated close.
  function luxe() {
    const ADDR = fact('addr', true), AREA = fact('area'), PRICE = fact('price'), DEAL = fact('deal'), FT = K7.facts({ beds: fact('beds'), baths: fact('baths'), sqft: fact('sqft'), lot: fact('lot') }, ['beds', 'baths', 'sqft', 'lot']), FEAT = K7.lines(fact('feat')), AG = fact('agent'), AGT = fact('agent_title'), AGP = fact('agent_phone'), URL = fact('url');
    const KICK = TX('kick', 'THE COLLECTION', { label: 'Small line', group: 'Opening', upper: true, max: 22 }), CTA = TX('cta', 'BY PRIVATE APPOINTMENT', { label: 'Call to action', group: 'Ending', upper: true, max: 28 });
    const T0 = 4.0, PD = 3.2, OUT = T0 + 3 * PD + 0.4, DUR = OUT + 4.4;
    const S = photos(['Photo 1', 'Photo 2', 'Photo 3'], PD + 0.4); S.forEach((s, k) => (s.start = T0 + k * PD));
    const FR = [110, 340, 860, 900], PS = K7.money(PRICE, DEAL);
    function dust(t, a) { if (VID.collecting || a <= 0) return; const c = G(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const sp = 0.3 + hash(i) * 0.5, x = (hash(i * 3) * W + Math.sin(t * 0.3 + i) * 40), y = (H + 40) - ((t * 40 * sp + hash(i * 7) * H) % (H + 80)), r = 1.5 + hash(i * 5) * 2.5; c.globalAlpha = a * (0.3 + 0.5 * Math.sin(t * 2 + i) ** 2); c.drawImage(K7.spark(OR), x - r * 4, y - r * 4, r * 8, r * 8); } D(); }
    function bars(p) { if (VID.collecting || p <= 0) return; const c = G(), h = 150 * E.inOutC(p); c.fillStyle = '#000000'; c.fillRect(-20, -20, W + 40, h + 20); c.fillRect(-20, H - h, W + 40, h + 20); D(); }
    function elements() {
      const sh0 = S[0], r0 = inBox(sh0, FR);
      const [lw, lh] = logoBox(480);
      let y = 520; if (PS) y += 110; if (FT.length) y += 80;
      const ctaY = y + 200 + lh / 2 + 150;
      const els = [
        mkEl('kick', KICK, W / 2, 760, 0.4, T0 - 0.4, p => [p[0] - 300, p[1] - 28, 600, 50]),
        mkEl('addr', ADDR || 'Address', W / 2, 920, 1.0, T0 - 1.0, p => [p[0] - 400, p[1] - 92, 800, 120]),
        mkEl('frame', 'Gold frame', r0[0], r0[1], T0, OUT - T0, p => [p[0], p[1], r0[2], r0[3]]),
        mkEl('feature', FEAT[0] || 'Feature', W / 2, 1330, T0 + 0.5, PD - 0.5, p => [p[0] - 400, p[1] - 30, 800, 60]),
        mkEl('cta', CTA, W / 2, ctaY, OUT + 0.7, DUR - (OUT + 0.7), p => [p[0] - 400, p[1] - 60, 800, 120]),
      ];
      if (PS) els.splice(4, 0, mkEl('price', PS, W / 2, 520, OUT + 0.3, DUR - (OUT + 0.3), p => [p[0] - 400, p[1] - 110, 800, 140]));
      if (FT.length) els.splice(5, 0, mkEl('facts', 'Beds · baths · size', W / 2, PS ? 630 : 520, OUT + 0.8, DUR - (OUT + 0.8), p => [p[0] - 400, p[1] - 26, 800, 52]));
      return els;
    }
    return {
      dur: DUR,
      elements,
      render(t) {
        BACKDROP(() => { if (!VID.collecting) { const c = G(), g = c.createRadialGradient(W / 2, H * 0.45, 80, W / 2, H * 0.45, H * 0.75); g.addColorStop(0, DEEP1); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); } });
        if (t < T0 + 0.4) { const a = 1 - seg(t, T0 - 0.2, 0.5), [kx, ky] = posOf(elP('kick'), [W / 2, 760]);
          type(L8({ text: KICK, slot: 'Mont', wt: 500, size: 28, track: 600, color: 'accent', anim: { in: 'tracking', inD: 1.6, out: 'fade', outD: 0.4 }, x: kx, y: ky, t0: 0.4, d: T0 }), t);
          const [ax, ay] = posOf(elP('addr'), [W / 2, 920]);
          if (ADDR) type(L8({ text: ADDR, slot: 'Corm', wt: 500, size: 92, w: 900, color: 'accent', fx: { fill: 'gold', sweep: true }, anim: { in: 'blur', inD: 1.4, out: 'fade', outD: 0.4 }, x: ax, y: ay, t0: 1.0, d: T0 - 0.6 }), t); else addr('', ax, ay, 50, fa(t, 1.0) * a);
          if (AREA) K7.txt(up(AREA), ax, ay + 140, F(500, 26, 'Mont'), WA(0.75), { align: 'center', ls: 10, a: fa(t, 2.0, 0.8) * a }); }
        if (t >= T0 && t < OUT + 0.5) { const k = Math.min(2, Math.floor((t - T0) / PD)), lt = t - (T0 + k * PD), q = seg(t, OUT - 0.1, 0.5);
          const draw = j => () => { const r0 = inBox(S[j], FR), [rx, ry] = posOf(elP('frame'), [r0[0], r0[1]]), r = [rx, ry, r0[2], r0[3]]; K7.photo(S[j], t, r, { alpha: 1 - q }); if (!VID.collecting) { const c = G(); c.globalAlpha = 1 - q; c.strokeStyle = OR; c.lineWidth = 1.2; c.strokeRect(r[0] - 12, r[1] - 12, r[2] + 24, r[3] + 24); D(); } };
          if (k > 0 && lt < 0.5) cut(k === 1 ? 'curtain' : 'goldline', t, T0 + k * PD, 1.0, draw(k - 1), draw(k), { col: 'accent' }); else draw(k)();
          const f = FEAT[k], [fex, fey] = posOf(elP('feature'), [W / 2, 1330]); if (f) type(L8({ text: up(f), slot: 'Mont', wt: 500, size: 30, track: 400, color: 'accent', anim: { in: 'tracking', inD: 1.0, out: 'fade', outD: 0.35 }, x: fex, y: fey, t0: T0 + k * PD + 0.5, d: PD - 0.4 }), t); }
        bars(seg(t, 0.1, 1.2) * (1 - seg(t, OUT, 0.6)));
        dust(t, 0.9);
        if (t >= OUT) { const ot = t - OUT, [px2, py2] = posOf(elP('price'), [W / 2, 520]); let y = py2;
          if (PS) { type(L8({ text: PS, slot: 'Corm', wt: 500, size: 110, track: 40, color: 'accent', fx: { fill: 'gold', sweep: true }, anim: { in: 'blur', inD: 1.0 }, x: px2, y: py2, t0: OUT + 0.3, d: 30 }), t); y = py2 + 110; }
          if (FT.length) { const [fx, fy] = posOf(elP('facts'), [W / 2, y]); K7.txt(FT.map(x => x.n + (x.u ? ' ' + x.u : '')).join('   ◆   '), fx, fy, F(500, Math.min(26, fitSize(FT.map(x => x.n + ' ' + x.u).join('   ◆   '), 500, 940, 26, 'Mont', 4)), 'Mont'), WA(0.8), { align: 'center', ls: 4, a: fa(ot, 0.8, 0.8) }); y = fy + 80; }
          agentClose(t, OUT, { y: y + 200, lw: 480, cta: CTA, ctaL: { slot: 'Mont', wt: 500, size: 34, track: 500, color: 'accent', anim: { in: 'tracking', inD: 1.2 } }, ctaH: 110, ag: AG, agt: AGT, agp: AGP, url: URL }); }
      },
      cues() { const ev = [['shimmer', 0.4, 0.2, 0], ['swell', 0.8, 0.18, 0], ['sparkle', 1.4, 0.15, 0.3]]; S.forEach((s, k) => { ev.push(['air', s.start - 0.2, 0.22, 0]); ev.push(['shimmer', s.start + 0.6, 0.14, k % 2 ? 0.3 : -0.3]); }); ev.push(['swell', OUT - 0.5, 0.2, 0], ['sparkle', OUT + 0.6, 0.15, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ COMMERCIAL SPACE
  // Business-like: a drawn street map with a pin dropping on the site, a spec sheet whose rows fill in (type, size, lot, deal),
  // split-screen photos sliced in, features as a ruled spec list, and a direct close.
  function comm() {
    const ADDR = fact('addr', true), AREA = fact('area'), PRICE = fact('price'), DEAL = fact('deal'), PTYPE = fact('ptype'), SQ = fact('sqft'), LOT = fact('lot'), FEAT = K7.lines(fact('feat')).slice(0, 5), AG = fact('agent'), AGT = fact('agent_title'), AGP = fact('agent_phone'), URL = fact('url');
    const KICK = TX('kick', 'COMMERCIAL SPACE', { label: 'Small line', group: 'Opening', upper: true, max: 24 }), CTA = TX('cta', 'BOOK A SITE VISIT', { label: 'Call to action', group: 'Ending', upper: true, max: 24 });
    const T1 = 4.4, T2 = 8.6, T3 = 12.4, OUT = 15.6, DUR = OUT + 4.3;
    const S = photos(['Exterior', 'Interior', 'Detail', 'Wide'], [T2 - T1 + 0.2, T2 - T1 + 0.2, T3 - T2 + 0.2, OUT - T3 + 0.2]); S[0].start = S[1].start = T1; S[2].start = T2; S[3].start = T3;
    // the split: two vertical photos side by side, otherwise one above the other (photos stay whole either way)
    const SPL = () => (vert(S[0]) && vert(S[1]) ? [[S[0], [0, 300, W / 2 - 6, 880], 0], [S[1], [W / 2 + 6, 300, W / 2 - 6, 880], 0.2]] : [[S[0], [40, 300, W - 80, 430], 0], [S[1], [40, 746, W - 80, 430], 0.2]]);
    const PS = K7.money(PRICE, DEAL), SPEC = [['TYPE', PTYPE], ['SIZE', SQ ? K7.facts({ sqft: SQ })[0].n + ' SQ FT' : ''], ['LOT', LOT], ['TERMS', dealWord(DEAL)], ['PRICE', PS]].filter(r => r[1]);
    function map(t, p) { if (VID.collecting || p <= 0) return; const c = G(); c.globalAlpha = p; c.fillStyle = BLK; c.fillRect(-20, -20, W + 40, H + 40); c.strokeStyle = rgbaOf(OR, 0.18); c.lineWidth = 2; const r = rng(11);
      for (let i = 0; i < 9; i++) { const y = 200 + i * 190 + (r() - 0.5) * 60, k = E.inOutC(seg(t, 0.1 + i * 0.06, 0.8)); c.beginPath(); c.moveTo(0, y); c.lineTo(W * k, y + (r() - 0.5) * 80 * k); c.stroke(); }
      for (let i = 0; i < 6; i++) { const x = 90 + i * 190 + (r() - 0.5) * 60, k = E.inOutC(seg(t, 0.4 + i * 0.06, 0.8)); c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (r() - 0.5) * 80 * k, H * k); c.stroke(); }
      c.strokeStyle = rgbaOf(OR, 0.55); c.lineWidth = 10; const k = E.inOutC(seg(t, 0.8, 1.0)); c.beginPath(); c.moveTo(-20, 1240); c.quadraticCurveTo(540, 1100, W * k + 20, 760 * k + 1240 * (1 - k)); c.stroke(); D(); }
    function elements() {
      const [lw, lh] = logoBox(560), ctaY = 600 + lh / 2 + 150;
      const sp0 = SPL()[0], r00 = inBox(sp0[0], sp0[1]);
      const sp1 = SPL()[1], r01 = inBox(sp1[0], sp1[1]);
      const els = [
        mkEl('kick', KICK, W / 2, 470, 0.4, T1 - 0.4, p => [p[0] - 300, p[1] - 30, 600, 60]),
        mkEl('pin', 'Site pin', 540, 960, 1.3, T1 - 1.3, p => [p[0] - 60, p[1] - 110, 120, 160]),
        mkEl('addr', ADDR || 'Address', W / 2, 1210, 1.9, T1 - 1.9, p => [p[0] - 400, p[1] - 104, 800, 130]),
        mkEl('photo1', 'Exterior photo', r00[0], r00[1], T1, OUT - T1, p => [p[0], p[1], r00[2], r00[3]]),
        mkEl('photo2', 'Interior photo', r01[0], r01[1], T1, OUT - T1, p => [p[0], p[1], r01[2], r01[3]]),
        mkEl('price', PS || dealWord(DEAL) || 'Price', W / 2, 1230, T3 + 0.3, OUT - (T3 + 0.3), p => [p[0] - 400, p[1] - 120, 800, 240]),
        mkEl('cta', CTA, W / 2, ctaY, OUT + 0.7, DUR - (OUT + 0.7), p => [p[0] - 400, p[1] - 60, 800, 120]),
      ];
      if (SPEC.length) els.push(mkEl('spec', 'Spec sheet', 80, 1236, T1 + 0.6, T2 - (T1 + 0.6), p => [p[0], p[1] - 22, 870, SPEC.length * 44 + 20]));
      if (FEAT.length) els.push(mkEl('feats', FEAT[0], 90, 1170, T2 + 0.4, T3 - (T2 + 0.4), p => [p[0], p[1] - 32, 700, FEAT.length * 58]));
      return els;
    }
    return {
      dur: DUR, shakes: [[1.75, 4]],
      elements,
      render(t) {
        if (t < T1 + 0.4) { BACKDROP(() => map(t, 1)); const a = 1 - seg(t, T1 - 0.2, 0.6);
          const p = seg(t, 1.3, 0.45); if (p > 0) { const [px, py] = posOf(elP('pin'), [540, 960]), y = py - 20 - (1 - E.outBack(p)) * 260; if (!VID.collecting) { const c = G(); c.globalAlpha = a; for (let i = 0; i < 2; i++) { const q = ((t - 1.7 + i * 0.6) % 1.2) / 1.2; if (t < 1.7) break; c.strokeStyle = rgbaOf(OR, 0.7 * (1 - q)); c.lineWidth = 3; c.beginPath(); c.arc(px, py, 20 + q * 110, 0, TAU); c.stroke(); } D(); } K7.icon('pin', px, y - 30, 84, OR, { lw: 2.4, a }); }
          const [kx, ky] = posOf(elP('kick'), [W / 2, 470]);
          type(L8({ text: KICK, slot: 'Mont', wt: 800, size: 30, track: 400, color: 'accent', anim: { in: 'tracking', out: 'fade', outD: 0.4 }, x: kx, y: ky, t0: 0.4, d: T1 - 0.2 }), t);
          const [ax, ay] = posOf(elP('addr'), [W / 2, 1210]);
          if (ADDR) type(L8({ text: ADDR, slot: 'Bebas', size: 104, w: 940, color: 'white', anim: { in: 'wipe', out: 'fade', outD: 0.4 }, x: ax, y: ay, t0: 1.9, d: T1 - 1.7 }), t); else addr('', ax, ay, 46, fa(t, 1.9) * a);
          if (AREA) K7.txt(up(AREA), ax, ay + 90, F(700, 30, 'Mont'), WA(0.8), { align: 'center', ls: 5, a: fa(t, 2.4) * a }); }
        if (t >= T1 && t < OUT) { if (!VID.collecting) fillScreen(BLK); const k = t < T2 ? 0 : t < T3 ? 1 : 2, q = seg(t, OUT - 0.3, 0.3);
          if (k === 0) { SPL().forEach(([s, box, dl]) => { const p = E.inOutC(seg(t, T1 + dl, 0.6)), r0 = inBox(s, box), [rx, ry] = posOf(elP('photo' + (S.indexOf(s) + 1)), [r0[0], r0[1]]), r = [rx, ry, r0[2], r0[3]]; ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.rect(box[0] + SH.x, box[1] + box[3] * (1 - p) + SH.y, box[2], box[3] * p); ctx.clip(); } K7.photo(s, t, r); ctx.restore(); });
            const [spx, spy] = posOf(elP('spec'), [80, 1236]);
            SPEC.forEach(([lab, v], i) => { const y = spy + i * 44, p = seg(t, T1 + 0.6 + i * 0.25, 0.4) * (1 - seg(t, T2 - 0.3, 0.3)); if (p <= 0 || VID.collecting) return; const c = G(); c.globalAlpha = E.outC(p); c.fillStyle = rgbaOf(OR, 0.6); c.fillRect(spx, y + 14, 870 * E.inOutC(p), 1.5); D();
              K7.txt(lab, spx, y, F(700, 22, 'Mont'), OR, { a: E.outC(p), ls: 4 }); K7.txt(v, spx + 870, y, F(700, 30, 'Mont'), WHT, { a: E.outC(p), align: 'right' }); });
            if (!SPEC.length) K7.need('size or type', W / 2, 1300, 20, { align: 'center', col: WHT, a: fa(t, T1 + 0.6) }); }
          else { const s = S[k + 1], draw = j => () => stage(S[j], t, 860, { alpha: 1 - q }); if (t < s.start + 0.35) cut('slices', t, s.start, 0.7, k === 1 ? () => { SPL().forEach(([s2, b]) => { const r0 = inBox(s2, b), [rx, ry] = posOf(elP('photo' + (S.indexOf(s2) + 1)), [r0[0], r0[1]]); K7.photo(s2, t, [rx, ry, r0[2], r0[3]]); }); } : draw(2), draw(k + 1), { col: 'accent' }); else draw(k + 1)();
            shade(1000, H, 0, 0.85);
            if (k === 1) { const [fex, fey] = posOf(elP('feats'), [90, 1170]); FEAT.forEach((f, i) => { const y = fey + i * 58, p = seg(t, T2 + 0.4 + i * 0.25, 0.4) * (1 - seg(t, T3 - 0.3, 0.3)); if (p <= 0) return; K7.txt('—  ' + up(f), fex, y, F(700, 32, 'Mont'), WHT, { a: E.outC(p), ls: 2 }); }); }
            else { const [px2, py2] = posOf(elP('price'), [W / 2, 1230]); type(L8({ text: dealWord(DEAL) || KICK, slot: 'Bebas', size: 120, color: 'accent', anim: { in: 'wipe', out: 'fade', outD: 0.3 }, x: px2, y: py2, t0: T3 + 0.3, d: OUT - T3 - 0.2 }), t); if (PS) K7.txt(PS, px2, py2 + 120, F(800, 52, 'Mont'), WHT, { align: 'center', a: fa(t, T3 + 0.7) * (1 - q) }); } } }
        if (t >= OUT) { if (!VID.collecting) fillScreen(BLK); map(t - OUT + 2, 0.5); agentClose(t, OUT, { y: 600, cta: CTA, ctaL: { slot: 'Bebas', size: 104, color: 'accent', anim: { in: 'wipe' } }, ctaH: 130, ag: AG, agt: AGT, agp: AGP, url: URL }); }
      },
      cues() { const ev = [['pencil', 0.2, 0.25, 0], ['whoosh', 0.8, 0.25, 0], ['drop', 1.3, 0.4, 0], ['thud', 1.72, 0.45, 0], ['typing', 1.9, 0.2, 0], ['swish', T1, 0.35, -0.3], ['swish', T1 + 0.2, 0.3, 0.3]];
        SPEC.forEach((r, i) => ev.push(['tick', T1 + 0.65 + i * 0.25, 0.3, 0.2])); ev.push(['whoosh', T2 - 0.2, 0.35, 0]); FEAT.forEach((f, i) => ev.push(['tick', T2 + 0.45 + i * 0.25, 0.25, -0.2])); ev.push(['whoosh', T3 - 0.2, 0.35, 0], ['impact', T3 + 0.3, 0.4, 0], ['chime', OUT + 1.2, 0.16, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  const MAKE = { aerial, resid, journal, devel, soon, lease, luxe, comm };
  const P = (MAKE[V] || aerial)();
  const light = ['journal', 'lease'].includes(V);
  DIR = { dur: P.dur, bg: BLK, bgSwap: true, finish: { vig: light ? 0.08 : 0.26, grain: light ? 0.06 : 0.14 }, edl: [], shakes: P.shakes, preload: () => K3.init(), render: P.render, cues: P.cues, fam: V, ...(P.elements ? { elements: P.elements } : {}),
    setup() { if (!window.STUDIO && LIGHTPAL) { const w = IMG.logoW; IMG.logoW = IMG.logoB; IMG.logoB = w; } } };
});
