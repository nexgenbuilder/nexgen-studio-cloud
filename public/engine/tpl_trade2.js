'use strict';
/* Creative families for other industries, part 2 (V10, Oct 30): two each for home services, beauty, automotive, events, retail
   and professional services. Each has its own composition, type, motion, transitions, close and score. Footage is always
   shown whole. Names, steps, items and offers in the fields are sample text to replace; offers start empty (a marker shows
   until one is typed) and prices are optional. Reviews come word for word from the brand kit. No stars, no "best".
   ?v=crew     Meet the Crew        crew ID badges clip on, tape labels, a hazard band, a documentary feel
   ?v=timeline Project Timeline     a progress rail runs along the bottom with milestones; each stage wipes in on it
   ?v=glowup   The Glow Up          a before/after slider sweeps across, sparkles, a dreamy script title
   ?v=swatch   Colour Swatches      a swatch book fans out, the footage shows through a swatch window, colour names typed
   ?v=shine    Detail Shine         a light glint sweeps the frame, water beads run down, chrome type, the steps
   ?v=garage   Service Bay          a gauge needle sweeps, a checklist ticks off, diamond plate, stencil type
   ?v=party    Party Night          confetti, a mirror-ball light field, the date bounces in, the lineup flashes on the beat
   ?v=venue    Wedding Venue        a drawn arch with botanical line art, script headings, the spaces in turn
   ?v=arrivals New Arrivals         an editorial lookbook: big index numbers, a sliding grid, NEW tags
   ?v=flash    Flash Sale           a countdown, a giant offer you type, hazard stripes, the clock ticking
   ?v=tips     Quick Tips           numbered cards flip over one by one with a progress bar and a "save this" note
   ?v=story    Client Story         a review from the brand kit, word for word, with drawn quote marks beside the footage */
STUDIO_REG['trade2'] = (() => {
  const V = QS.get('v') || 'crew';
  // Per-element model: tpl_free sets window.__NX_BLOCK_EL to the block's `el` data before calling this
  // factory; positions below fall back to the original hardcoded values when EL is null, so rendering
  // is byte-for-byte the old path. (Same pattern as tpl_nx7.js / tpl_nx8.js.)
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const FM = K7.FAM[V] || K7.FAM.crew;
  if (!window.STUDIO) setBrandColors(FM.pal);
  const G = K3.G, D = K3.D, up = K7.up, seg = K7.seg, TAU = Math.PI * 2;
  const NONE = k => ['nofoot.' + k, 0];
  function shots(list, t0, group) {
    const S = K3.shots(list.map(([k, label, d, kind, ph]) => { const s = SHOT(k, NONE(k), { label, group: group || 'Footage', kind: kind || 'any', ph, d: d + 0.3 }); return [s[0], s[1], d]; }));
    S.forEach(s => (s.start += t0 || 0)); return S;
  }
  const vert = s => K7.isVert(s.c);
  const musicBed = (dur, o) => ['music', 0, dur, 0.95, Object.assign({ style: FM.music, bpm: FM.bpm, key: 0, end: dur - 0.6 }, o || {})];
  function shade(y0, y1, a0, a1, col) { if (VID.collecting) return; const c = G(), g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, rgbaOf(col || BLK, a0)); g.addColorStop(1, rgbaOf(col || BLK, a1)); c.fillStyle = g; c.fillRect(-20, y0, W + 40, y1 - y0); D(); }
  const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
  const L8 = o => Object.assign({ kind: 'text', style: 'type', x: 540, y: 960, t0: 0, d: 3, color: 'white', w: 980 }, o);
  function type(L, t) { const lt = t - L.t0; if (lt < 0 || lt >= L.d || !L.text) return; const s = K8.xf(L, lt); K8.withLayer(s, K8.box(L), () => K8.type(L, t, s)); }
  function gfx(L, t) { const lt = t - L.t0; if (lt < 0 || lt >= L.d) return; const e = K9.EL[L.type]; if (!e) return; const s = K8.xf(L, lt);
    if (e.full) { if (VID.collecting) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= s.op; K9.draw(L, t, s); ctx.restore(); } else K8.withLayer(s, K9.box(L), () => K9.draw(L, t, s)); }
  function cut(id, t, tc, d, A, B, o) { const u = (t - (tc - d / 2)) / d; if (u <= 0) A(); else if (u >= 1) B(); else KT.run(id, u, A, B, Object.assign({ t }, o || {})); }
  const stageRect = (s, cy) => (vert(s) ? K3.wholeIn(s.c, [0, 0, W, H]) : (h => [0, cy - h / 2, W, h])(W / K3.ar(s.c)));
  const stage = (s, t, cy, o) => K7.photo(s, t, stageRect(s, cy), o);
  const inBox = (s, box) => K3.wholeIn(s.c, box);
  function photoT(s, t, r, o) { const w = K3.wholeIn(s.c, r), cx = w[0] + w[2] / 2, cy = w[1] + w[3] / 2, px = o.px === undefined ? cx : o.px, py = o.py === undefined ? cy : o.py, sc = o.sc || 1, rot = o.rot || 0;
    const vx = (cx - px) * sc, vy = (cy - py) * sc, co = Math.cos(rot), sn = Math.sin(rot), nx = px + vx * co - vy * sn + (o.ox || 0), ny = py + vx * sn + vy * co + (o.oy || 0);
    K3.clip(s.c, s.in, Math.max(0, t - (s.start || 0)), w, { alpha: o.alpha === undefined ? 1 : o.alpha, dx: nx - cx, dy: ny - cy, rot, s: sc }); return w; }
  const fa = (t, t0, d) => E.outC(seg(t, t0, d || 0.5));
  // the close: logo, an ending line, the brand's call to action (pill, outline or underline), contact and the licence line
  function close(t, OUT, o) {
    const ot = t - OUT, y = o.y || 620, [lw, lh] = logoBox(o.lw || 600), lp = seg(ot, 0.2, 0.5);
    if (lp > 0 && !VID.collecting) { const c = G(), s = lerp(1.12, 1, E.outBack(clamp(lp))); c.globalAlpha = clamp(lp * 2.5); c.translate(W / 2, y); c.scale(s, s); c.drawImage(IMG.logoW, -lw / 2, -lh / 2, lw, lh); D(); }
    if (o.line) type(L8(Object.assign({ text: o.line, y: y + lh / 2 + 150, t0: OUT + 0.7, d: 30 }, o.lineL || {})), t);
    const cy = y + lh / 2 + (o.gap || 340), cp = seg(ot, 1.4, 0.4);
    if (o.cta === 'pill') gfx({ kind: 'mg', type: 'cta', text: CONTACT.cta, color: o.ctaCol || 'accent', x: 540, y: cy, t0: OUT + 1.3, d: 30 }, t);
    else if (cp > 0 && !VID.collecting) { const f = F(800, Math.min(34, fitSize(CONTACT.cta, 800, 740, 34, 'Mont', 5)), 'Mont'), tw = textW(CONTACT.cta, f, 5), bw = Math.min(960, tw + 100), c = G(), col = o.ctaCol ? K8.col(o.ctaCol) : OR; c.globalAlpha = E.outC(cp);
      if (o.cta === 'underline') { c.fillStyle = col; c.fillRect(W / 2 - tw / 2, cy + 24, tw * E.inOutC(cp), 3); } else { c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.roundRect(W / 2 - bw / 2, cy - 46, bw, 92, o.cta === 'round' ? 46 : 0); c.stroke(); }
      setF(f, 5); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CONTACT.cta, W / 2, cy + 2); D(); }
    K7.txt(K7.contact().join('   ·   '), W / 2, cy + 125, F(700, 28, 'Mont'), WA(0.8), { align: 'center', a: fa(ot, 2.0, 0.4), ls: 3 });
    if (CONTACT.lic) K7.txt(CONTACT.lic, W / 2, cy + 180, F(600, 22, 'Mont'), WA(0.6), { align: 'center', a: fa(ot, 2.1, 0.4), ls: 3 });
  }
  const bg = (a, b, radial) => { if (VID.collecting) return; const c = G(), g = radial ? c.createRadialGradient(W / 2, H * 0.45, 60, W / 2, H * 0.45, H * 0.8) : c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a || DEEP1); g.addColorStop(1, b || DEEP2); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40); D(); };

  // ================================================================ MEET THE CREW
  // Documentary: a hazard band slides across with the title in stencil; each person gets a tall frame with a tape label and an
  // ID badge that clips on (name, role, years with you if you add it); ends on the brand.
  function crew() {
    const TITLE = TX('title', 'MEET THE CREW', { label: 'Title', group: 'Opening', upper: true, max: 18 });
    const P3 = [0, 1, 2].map(k => ({ n: TX('name' + (k + 1), 'FIRST NAME', { label: 'Person ' + (k + 1) + ' name', group: 'Person ' + (k + 1), upper: true, max: 18, req: true, hint: 'Sample text: type their real name.' }),
      r: TX('role' + (k + 1), 'Role on the crew', { label: 'Person ' + (k + 1) + ' role', group: 'Person ' + (k + 1), max: 26, req: true }), y: TX('yrs' + (k + 1), '', { label: 'Person ' + (k + 1) + ' extra line', group: 'Person ' + (k + 1), upper: true, max: 22, hint: 'Optional, e.g. ON THE TEAM SINCE 2019. Empty hides it.' }) }));
    const END = TX('end', 'THE PEOPLE BEHIND THE WORK', { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const T0 = 2.8, PD = 3.4, OUT = T0 + 3 * PD, DUR = OUT + 4.4;
    const S = shots(P3.map((p, k) => ['s' + (k + 1), 'Person ' + (k + 1), PD + 0.4, 'any', 'v']), T0); S.forEach((s, k) => (s.start = T0 + k * PD));
    const FR = [110, 300, 860, 1060];
    function band(y, p, rot, txt) { if (VID.collecting || p <= 0) return; const c = G(), off = -(1 - E.outQ(p)) * W * 1.4; c.translate(W / 2, y); c.rotate(rot); c.translate(-W / 2 + off, 0); c.fillStyle = OR; c.fillRect(-200, -60, W + 400, 120); c.save(); c.beginPath(); c.rect(-200, -60, W + 400, 120); c.clip(); c.fillStyle = BLK;
      for (let i = -10; i < 30; i++) { c.beginPath(); c.moveTo(i * 80, -60); c.lineTo(i * 80 + 40, -60); c.lineTo(i * 80 - 20, 60); c.lineTo(i * 80 - 60, 60); c.fill(); } c.restore(); c.fillStyle = OR; c.fillRect(60, -42, W - 120, 84); setF(F(400, 76, 'Bebas'), 6); c.fillStyle = BLK; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, W / 2, 4); D(); }
    function badge(p, k, t, pos) {   // an ID badge on a lanyard clip
      if (VID.collecting || p <= 0) return; const e = E.outBack(clamp(p)), x = pos ? pos[0] : 690, y = (pos ? pos[1] : 1020) + (1 - e) * 300, rot = (-4 + Math.sin(t * 1.6) * 1.2) * Math.PI / 180, c = G(); c.translate(x, y); c.rotate(rot); c.globalAlpha = clamp(p * 3);
      c.fillStyle = '#F4F1EA'; c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 30; c.beginPath(); c.roundRect(-230, 0, 460, 330, 22); c.fill(); c.shadowColor = 'transparent'; c.fillStyle = OR; c.beginPath(); c.roundRect(-230, 0, 460, 70, [22, 22, 0, 0]); c.fill();
      c.fillStyle = '#9AA0A6'; c.fillRect(-40, -30, 80, 46); c.fillStyle = '#16181B'; c.fillRect(-26, -8, 52, 10); setF(F(700, 22, 'Mont'), 5); c.fillStyle = K8.onCol(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(up(BRAND.short || BRAND.name).slice(0, 24), 0, 36);
      const nm = P3[k].n, fs = Math.min(76, fitSize(nm, 400, 400, 76, 'Bebas', 2)); setF(F(400, fs, 'Bebas'), 2); c.fillStyle = '#16181B'; c.fillText(nm, 0, 140); setF(F(600, 30, 'Mont'), 0); c.fillStyle = '#4A4F55'; c.fillText(P3[k].r, 0, 200);
      if (P3[k].y) { setF(F(700, 20, 'Mont'), 4); c.fillStyle = OR; c.fillText(P3[k].y, 0, 252); } c.fillStyle = '#16181B'; for (let i = 0; i < 26; i++) c.fillRect(-150 + i * 12, 280, hash(i + k * 30) > 0.5 ? 6 : 3, 26); D(); }
    function elements() {
      const baP = posOf(elP('badge'), [690, 1020]), coP = posOf(elP('count'), [120, 1100]);
      return [
        { id: 'badge', kind: 'pos', label: 'ID badge', x: baP[0], y: baP[1], t0: T0 + 0.45, d: OUT - (T0 + 0.45), box: [baP[0] - 230, baP[1], 460, 330], dup: false, del: false },
        { id: 'count', kind: 'pos', label: 'Person number', x: coP[0], y: coP[1], t0: T0 + 0.3, d: OUT - (T0 + 0.3), box: [coP[0] - 20, coP[1] - 120, 200, 170], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, elements,
      render(t) {
        BACKDROP(() => { bg(DEEP1, DEEP2); });
        if (!VID.collecting && NOISE.length) { const c = G(); c.globalAlpha = 0.35; c.fillStyle = NOISE[0]; c.fillRect(0, 0, W, H); D(); }
        if (t < T0 + 0.4) { const a = 1 - seg(t, T0 - 0.2, 0.5); band(760, seg(t, 0.2, 0.7) * a, -0.06, TITLE); band(1150, seg(t, 0.5, 0.7) * a, 0.05, up(BRAND.short || BRAND.name)); }
        if (t >= T0 && t < OUT + 0.4) { const k = Math.min(2, Math.floor((t - T0) / PD)), lt = t - (T0 + k * PD), q = seg(t, OUT - 0.1, 0.4);
          const draw = j => () => { const r = inBox(S[j], FR); K7.photo(S[j], t, r, { alpha: 1 - q }); if (!VID.collecting) { const c = G(); c.globalAlpha = 1 - q; c.strokeStyle = WA(0.9); c.lineWidth = 4; c.strokeRect(r[0] - 10, r[1] - 10, r[2] + 20, r[3] + 20);
            c.fillStyle = rgbaOf('#E8DCC2', 0.85); c.save(); c.translate(r[0] + 60, r[1] - 6); c.rotate(-0.3); c.fillRect(-60, -18, 120, 36); c.restore(); c.save(); c.translate(r[0] + r[2] - 60, r[1] - 6); c.rotate(0.3); c.fillRect(-60, -18, 120, 36); c.restore(); D(); } };
          if (k > 0 && lt < 0.3) cut('push', t, T0 + k * PD, 0.6, draw(k - 1), draw(k), { dir: 'left' }); else draw(k)();
          const [bgx, bgy] = posOf(elP('badge'), [690, 1020]); badge(seg(lt, 0.45, 0.6) * (1 - seg(lt, PD - 0.3, 0.3)) * (1 - q), k, t, [bgx, bgy]);
          const [cnx, cny] = posOf(elP('count'), [120, 1100]); K7.txt('0' + (k + 1), cnx, cny, F(400, 150, 'Bebas'), OR, { a: fa(lt, 0.3) * (1 - seg(lt, PD - 0.3, 0.3)) * (1 - q) }); }
        if (t >= OUT) { band(320, seg(t, OUT, 0.6), -0.03, TITLE); close(t, OUT, { y: 680, line: END, lineL: { slot: 'Bebas', size: 76, track: 40, color: 'white', anim: { in: 'stagger' } }, cta: 'pill' }); }
      },
      cues() { const ev = [['whoosh', 0.2, 0.4, -0.3], ['whoosh', 0.5, 0.35, 0.3], ['thud', 0.75, 0.35, 0]]; S.forEach((s, k) => { if (k) ev.push(['swish', s.start - 0.1, 0.35, 0]); ev.push(['clack', s.start + 0.65, 0.4, 0.3]); ev.push(['tick', s.start + 0.9, 0.2, 0.3]); });
        ev.push(['whoosh', OUT, 0.35, 0], ['chime', OUT + 1.3, 0.16, 0]); return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ PROJECT TIMELINE
  // Process storytelling: a rail along the bottom fills from start to finish; milestones light up as each stage arrives, the
  // stage wipes in on the rail's colour, its label stamps above it; the last one gets a check.
  function timeline() {
    const TITLE = TX('title', 'FROM START TO FINISH', { label: 'Title', group: 'Opening', upper: true, max: 26 });
    const ST = ['START', 'IN PROGRESS', 'FINISHED'].map((n, k) => TX('stage' + (k + 1), n, { label: 'Stage ' + (k + 1), group: 'Stages', upper: true, max: 16 }));
    const WHEN = [0, 1, 2].map(k => TX('when' + (k + 1), '', { label: 'Stage ' + (k + 1) + ' time', group: 'Stages', upper: true, max: 12, hint: 'Optional, e.g. DAY 1 or WEEK 3. Empty hides it.' }));
    const END = TX('end', 'YOUR PROJECT IS NEXT', { label: 'Ending line', group: 'Ending', upper: true, max: 24 });
    const T0 = 2.6, PD = 4.0, OUT = T0 + 3 * PD, DUR = OUT + 4.4;
    const S = shots(ST.map((s, k) => ['s' + (k + 1), 'Stage ' + (k + 1), PD + 0.4, 'any']), T0); S.forEach((s, k) => (s.start = T0 + k * PD));
    const railGeom = () => { const [x, y] = posOf(elP('rail'), [180, 1360]); return { RX0: x, RX1: x + 720, RY: y, MX: k => x + 360 * k }; };
    function rail(t, a) { if (VID.collecting || a <= 0) return; const { RX0, RX1, RY, MX } = railGeom(), p = clamp((t - T0) / (3 * PD - 0.6)), c = G(); c.globalAlpha = a; c.fillStyle = WA(0.25); c.beginPath(); c.roundRect(RX0, RY - 6, RX1 - RX0, 12, 6); c.fill(); c.fillStyle = OR; c.beginPath(); c.roundRect(RX0, RY - 6, (RX1 - RX0) * p, 12, 6); c.fill();
      for (let k = 0; k < 3; k++) { const on = t >= T0 + k * PD, x = MX(k); c.fillStyle = on ? OR : BLK; c.strokeStyle = on ? OR : WA(0.5); c.lineWidth = 4; c.beginPath(); c.arc(x, RY, on ? 22 : 16, 0, TAU); c.fill(); c.stroke();
        if (k === 2 && t > T0 + 2 * PD + 0.5) { c.strokeStyle = K8.onCol(OR); c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 9, RY); c.lineTo(x - 2, RY + 8); c.lineTo(x + 11, RY - 8); c.stroke(); }
        setF(F(800, 22, 'Mont'), 3); c.fillStyle = on ? WHT : WA(0.5); c.textAlign = 'center'; c.fillText(ST[k], x, RY + 62); if (WHEN[k]) { setF(F(700, 20, 'Mont'), 3); c.fillStyle = OR; c.fillText(WHEN[k], x, RY - 40); } } D(); }
    function elements() {
      const tiP = posOf(elP('title'), [540, 860]), raP = posOf(elP('rail'), [180, 1360]);
      const sts = [0, 1, 2].map(k => { const sp = posOf(elP('stage' + (k + 1)), [540, 360]); return { id: 'stage' + (k + 1), kind: 'pos', label: 'Stage ' + (k + 1) + ' · ' + ST[k], x: sp[0], y: sp[1], t0: T0 + k * PD + 0.3, d: PD - 0.5, box: [sp[0] - 400, sp[1] - 80, 800, 130], dup: false, del: false }; });
      return [
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.4, d: T0 - 0.1, box: [tiP[0] - 410, tiP[1] - 110, 820, 200], dup: false, del: false },
        ...sts,
        { id: 'rail', kind: 'pos', label: 'Progress rail', x: raP[0], y: raP[1], t0: T0, d: OUT - T0, box: [raP[0], raP[1] - 60, 720, 130], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, elements,
      render(t) {
        BACKDROP(() => { bg(DEEP2, DEEP1); });
        if (!VID.collecting) { const c = G(); c.strokeStyle = WA(0.06); c.lineWidth = 1; for (let x = 60; x < W; x += 60) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } D(); }
        if (t < T0 + 0.3) { const [tx, ty] = posOf(elP('title'), [540, 860]); type(L8({ text: TITLE, slot: 'Bebas', size: 150, w: 820, lead: 0.92, color: 'white', anim: { in: 'stagger', out: 'fade', outD: 0.3 }, x: tx, y: ty, t0: 0.4, d: T0 - 0.1 }), t);
          if (!VID.collecting) { const c = G(), k = E.inOutC(seg(t, 1.0, 1.2)) * (1 - seg(t, T0 - 0.2, 0.4)), { RX0, RX1 } = railGeom(); c.fillStyle = OR; c.fillRect(RX0, 1080, (RX1 - RX0) * k, 10); D(); } }
        if (t >= T0 && t < OUT) { const k = Math.min(2, Math.floor((t - T0) / PD)), lt = t - (T0 + k * PD), q = seg(t, OUT - 0.3, 0.3);
          const draw = j => () => { const r = inBox(S[j], [40, 440, 1000, 860]); K7.photo(S[j], t, r, { alpha: 1 - q }); };
          if (k > 0 && lt < 0.35) cut('wipe', t, T0 + k * PD, 0.7, draw(k - 1), draw(k), { col: 'accent', dir: 'right' }); else draw(k)();
          const [sx, sy] = posOf(elP('stage' + (k + 1)), [540, 360]); gfx({ kind: 'mg', type: 'numlabel', num: '0' + (k + 1), text: ST[k], color: 'accent', x: sx, y: sy, t0: T0 + k * PD + 0.3, d: PD - 0.5 }, t);
          rail(t, 1 - q); }
        if (t >= OUT) close(t, OUT, { y: 640, line: END, lineL: { slot: 'Bebas', size: 100, color: 'accent', anim: { in: 'wipe' } }, cta: 'outline' });
      },
      cues() { const ev = [['whoosh', 0.4, 0.3, 0], ['tick', 1.0, 0.25, 0]]; S.forEach((s, k) => { if (k) ev.push(['whoosh', s.start - 0.15, 0.35, 0.3]); ev.push(['stamp', s.start + 0.35, 0.4, 0]); ev.push(['click', s.start + 0.05, 0.3, (k - 1) * 0.4]); });
        ev.push(['chime', T0 + 2 * PD + 0.55, 0.22, 0.3], ['chime', OUT + 1.3, 0.16, 0]); return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ THE GLOW UP
  // Beauty before/after: the before plays in a soft rounded frame, a slider handle sweeps across and reveals the after, then
  // sparkles twinkle, a script title floats in, the service name settles under it.
  function glowup() {
    const TITLE = TX('title', 'the glow up', { label: 'Script title', group: 'Opening', max: 20 });
    const SERV = TX('serv', 'YOUR SERVICE', { label: 'Service name', group: 'The look', upper: true, max: 28, req: true, hint: 'Sample text: the service shown.' });
    const B = TX('b', 'BEFORE', { label: 'Before label', group: 'The look', upper: true, max: 10 }), A = TX('a', 'AFTER', { label: 'After label', group: 'The look', upper: true, max: 10 });
    const END = TX('end', 'Book your glow up', { label: 'Closing line', group: 'Ending', max: 26 });
    const T1 = 2.6, SW = 6.0, T3 = 9.6, OUT = 13.2, DUR = OUT + 4.3;
    const S = shots([['s1', 'Before', SW + 1.4, 'any', 'v'], ['s2', 'After', T3 - T1 + 0.4, 'any', 'v'], ['s3', 'The finished look', OUT - T3 + 0.4, 'any', 'v']], 0); S[0].start = 0.3; S[1].start = T1; S[2].start = T3;
    const FR = [130, 300, 820, 1000];
    function sparkles(t, t0, n, a) { if (VID.collecting) return; const c = G(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const lt = t - t0 - hash(i) * 2; if (lt < 0) continue; const ph = (lt * (0.6 + hash(i * 3))) % 1, x = 120 + hash(i * 5) * 840, y = 300 + hash(i * 7) * 1300, s = 20 + 30 * hash(i * 11), k = Math.sin(Math.PI * ph);
      c.globalAlpha = a * k; c.fillStyle = i % 3 ? '#FFFFFF' : ACC2; c.beginPath(); c.moveTo(x, y - s * k); c.quadraticCurveTo(x, y, x + s * k * 0.3, y); c.quadraticCurveTo(x, y, x, y + s * k); c.quadraticCurveTo(x, y, x - s * k * 0.3, y); c.quadraticCurveTo(x, y, x, y - s * k); c.fill();
      c.beginPath(); c.moveTo(x - s * k * 0.6, y); c.quadraticCurveTo(x, y, x, y - s * k * 0.15); c.quadraticCurveTo(x, y, x + s * k * 0.6, y); c.quadraticCurveTo(x, y, x, y + s * k * 0.15); c.fill(); } D(); }
    function elements() {
      const beP = posOf(elP('before'), [250, 370]), afP = posOf(elP('after'), [830, 370]);
      const tiP = posOf(elP('title'), [540, 1290]), seP = posOf(elP('serv'), [540, 1185]);
      return [
        { id: 'before', kind: 'pos', label: B, x: beP[0], y: beP[1], t0: 0.6, d: SW - 0.3, box: [Math.max(0, beP[0] - 300), beP[1] - 60, 600, 130], dup: false, del: false },
        { id: 'after', kind: 'pos', label: A, x: afP[0], y: afP[1], t0: T1 + 0.6, d: T3 - T1 - 1.2, box: [Math.min(afP[0] - 300, 530), afP[1] - 60, 600, 130], dup: false, del: false },
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.5, d: OUT - 0.7, box: [tiP[0] - 450, tiP[1] - 100, 900, 200], dup: false, del: false },
        { id: 'serv', kind: 'pos', label: SERV, x: seP[0], y: seP[1], t0: SW, d: OUT - SW - 0.2, box: [seP[0] - 410, seP[1] - 60, 820, 120], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, elements,
      render(t) {
        BACKDROP(() => { bg(DEEP2, DEEP1); });
        if (t < OUT) { const q = seg(t, OUT - 0.3, 0.3), rr = (s) => inBox(s, FR);
          const frame = (r, a) => { if (VID.collecting) return; const c = G(); c.globalAlpha = a; c.fillStyle = '#FFFFFF'; c.shadowColor = rgbaOf(OR, 0.35); c.shadowBlur = 50; c.beginPath(); c.roundRect(r[0] - 14, r[1] - 14, r[2] + 28, r[3] + 28, 64); c.fill(); D(); };
          if (t < T3 - 0.4) { const r0 = rr(S[0]), r1 = rr(S[1]), r = [Math.min(r0[0], r1[0]), Math.min(r0[1], r1[1]), Math.max(r0[2], r1[2]), Math.max(r0[3], r1[3])]; frame(r, 1 - q);
            const k = E.inOutS(seg(t, T1, SW - T1)), sx = r[0] + r[2] * (1 - k);
            ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.roundRect(r[0] + SH.x, r[1] + SH.y, r[2], r[3], 50); ctx.clip(); } K7.photo(S[0], t, r0); if (t >= T1) { ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.rect(sx + SH.x, r[1] + SH.y, r[0] + r[2] - sx, r[3]); ctx.clip(); } K7.photo(S[1], t, r1); ctx.restore(); } ctx.restore();
            if (t >= T1 && k < 1 && !VID.collecting) { const c = G(); c.fillStyle = '#FFFFFF'; c.fillRect(sx - 3, r[1], 6, r[3]); c.beginPath(); c.arc(sx, r[1] + r[3] / 2, 36, 0, TAU); c.fill(); c.fillStyle = OR; c.beginPath(); c.moveTo(sx - 20, r[1] + r[3] / 2); c.lineTo(sx - 8, r[1] + r[3] / 2 - 10); c.lineTo(sx - 8, r[1] + r[3] / 2 + 10); c.fill(); c.beginPath(); c.moveTo(sx + 20, r[1] + r[3] / 2); c.lineTo(sx + 8, r[1] + r[3] / 2 - 10); c.lineTo(sx + 8, r[1] + r[3] / 2 + 10); c.fill(); D(); }
            const la = 1 - seg(t, T3 - 1.0, 0.4); const [bx, by] = posOf(elP('before'), [250, r[1] + 70]); type(L8({ text: B, slot: 'Mont', wt: 800, size: 28, track: 300, color: 'white', w: 400, fx: { deco: 'pill', dcol: 'ink' }, anim: { in: 'pop', out: 'fade' }, x: bx, y: by, t0: 0.6, d: SW - 0.3 }), t);
            if (t > T1 + 0.6) { const [ax, ay] = posOf(elP('after'), [830, r[1] + 70]); type(L8({ text: A, slot: 'Mont', wt: 800, size: 28, track: 300, color: K8.onCol(OR), w: 400, fx: { deco: 'pill', dcol: 'accent' }, anim: { in: 'pop', out: 'fade' }, x: ax, y: ay, t0: T1 + 0.6, d: T3 - T1 - 1.2 }), t); } void la;
          } else { const r = rr(S[2]), p = E.outC(seg(t, T3 - 0.4, 0.8)); frame(r, (1 - q) * p); ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.roundRect(r[0] + SH.x, r[1] + SH.y, r[2], r[3], 50); ctx.clip(); } K7.photo(S[2], t, r, { alpha: p * (1 - q) }); ctx.restore(); }
          sparkles(t, SW - 0.4, 22, fa(t, SW - 0.4, 0.6) * (1 - q));
          const [tx, ty] = posOf(elP('title'), [540, 1290]); type(L8({ text: TITLE, slot: 'Hand', wt: 400, size: 130, color: 'accent', fx: { shadow: 'soft' }, anim: { in: 'blur', inD: 1.0, out: 'fade', outD: 0.3, loop: 'float', loopAmt: 0.5 }, x: tx, y: ty, t0: 0.5, d: OUT - 0.7 }), t);
          const [sx, sy] = posOf(elP('serv'), [540, 1185]); type(L8({ text: SERV, slot: 'Mont', wt: 700, size: 30, track: 300, color: 'white', fx: { deco: 'pill', dcol: 'ink' }, anim: { in: 'tracking', out: 'fade', outD: 0.3 }, x: sx, y: sy, t0: SW, d: OUT - SW - 0.2 }), t); }
        if (t >= OUT) { sparkles(t, OUT, 14, 0.8); close(t, OUT, { y: 620, line: END, lineL: { slot: 'Hand', wt: 400, size: 110, color: 'accent', anim: { in: 'blur' } }, cta: 'round', gap: 360 }); }
      },
      cues() { const ev = [['air', 0.4, 0.2, 0], ['pop', 0.7, 0.3, -0.3], ['swell', T1 - 0.2, 0.2, 0], ['swish', T1 + 0.1, 0.25, 0.4], ['swish', SW - 1.0, 0.25, -0.4], ['sparkle', SW - 0.3, 0.3, 0], ['pop', T1 + 0.65, 0.3, 0.3], ['shimmer', T3 - 0.3, 0.2, 0], ['sparkle', OUT + 0.2, 0.2, 0]];
        return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ COLOUR SWATCHES
  // A colour story: a swatch book fans open, each swatch card carries a colour name you type; the footage shows through a
  // swatch-shaped window as the cards turn; an editorial serif and a wide grotesk; quick, chic cuts on the beat.
  function swatch() {
    const TITLE = TX('title', 'COLOUR STORY', { label: 'Title', group: 'Opening', upper: true, max: 18 });
    const CN = ['Shade one', 'Shade two', 'Shade three'].map((n, k) => TX('shade' + (k + 1), n, { label: 'Colour ' + (k + 1) + ' name', group: 'Colours', max: 18, req: true, hint: 'Sample text: name the colour shown.' }));
    const CC = [0, 1, 2].map(k => TX('col' + (k + 1), '', { label: 'Colour ' + (k + 1) + ' swatch (hex)', group: 'Colours', max: 7, hint: 'Optional, e.g. #B5651D. Empty uses the brand colours.' }));
    const END = TX('end', 'Find your shade', { label: 'Closing line', group: 'Ending', max: 24 });
    const BT = 60 / FM.bpm, T0 = 3.0, PD = 8 * BT, OUT = T0 + 3 * PD, DUR = OUT + 4.2;
    const S = shots(CN.map((n, k) => ['s' + (k + 1), 'Colour ' + (k + 1), PD + 0.4, 'any', 'v']), T0); S.forEach((s, k) => (s.start = T0 + k * PD));
    const hexOk = s => /^#[0-9a-f]{6}$/i.test(s), SWC = k => (hexOk(CC[k]) ? CC[k] : [OR, ACC2, K7.mix(OR, '#000000', 0.45)][k]);
    const WIN = EL && EL.box ? [num(EL.box.x, 140) + 30, num(EL.box.y, 270) + 30, num(EL.box.w, 800) - 60, num(EL.box.h, 1190) - 330] : [170, 300, 740, 860];
    function fan(t, p, a, oy) { if (VID.collecting || p <= 0) return; const c = G(); c.globalAlpha = a; for (let k = 4; k >= 0; k--) { const ang = (-24 + k * 12) * E.outBack(clamp(p)) * Math.PI / 180, col = SWC(k % 3); c.save(); c.translate(540, 1420 + (oy || 0)); c.rotate(ang); c.shadowColor = 'rgba(0,0,0,0.3)'; c.shadowBlur = 20;
      c.fillStyle = '#F6EFEA'; c.beginPath(); c.roundRect(-110, -760, 220, 820, 18); c.fill(); c.shadowColor = 'transparent'; c.fillStyle = col; c.beginPath(); c.roundRect(-96, -746, 192, 560, 10); c.fill(); c.fillStyle = '#141012'; c.beginPath(); c.arc(0, 20, 12, 0, TAU); c.fill(); c.restore(); } D(); }
    function elements() {
      const tiP = posOf(elP('title'), [540, 420]);
      const CF = [WIN[0] - 30, WIN[1] - 30, WIN[2] + 60, WIN[3] + 330];
      const shs = [0, 1, 2].map(k => { const sp = posOf(elP('shade' + (k + 1)), [WIN[0], WIN[1] + WIN[3] + 230]); return { id: 'shade' + (k + 1), kind: 'pos', label: CN[k], x: sp[0], y: sp[1], t0: T0 + k * PD, d: PD, box: [sp[0], sp[1] - 70, 700, 100], dup: false, del: false }; });
      return [
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.6, d: T0 - 0.3, box: [tiP[0] - 410, tiP[1] - 90, 820, 180], dup: false, del: false },
        ...shs,
        { id: 'card', kind: 'box', label: 'Swatch card', x: CF[0], y: CF[1], w: CF[2], h: CF[3], t0: T0, d: OUT - T0, box: CF, dup: false, del: false },
      ];
    }
    return {
      dur: DUR, elements,
      render(t) {
        BACKDROP(() => { bg(DEEP1, DEEP2, true); });
        if (t < T0 + 0.4) { const a = 1 - seg(t, T0 - 0.2, 0.5); fan(t, seg(t, 0.3, 1.2), a);
          const [tx, ty] = posOf(elP('title'), [540, 420]); type(L8({ text: TITLE, slot: 'Mont', wt: 800, size: 96, track: 80, color: 'white', anim: { in: 'split', out: 'fade', outD: 0.3 }, x: tx, y: ty, t0: 0.6, d: T0 - 0.3 }), t); }
        if (t >= T0 && t < OUT + 0.4) { const k = Math.min(2, Math.floor((t - T0) / PD)), lt = t - (T0 + k * PD), q = seg(t, OUT - 0.1, 0.4), col = SWC(k);
          const card = j => () => { if (!VID.collecting) { const c = G(), cj = SWC(j); c.fillStyle = '#F6EFEA'; c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 40; c.beginPath(); c.roundRect(WIN[0] - 30, WIN[1] - 30, WIN[2] + 60, WIN[3] + 330, 26); c.fill(); c.shadowColor = 'transparent'; c.fillStyle = cj; c.fillRect(WIN[0], WIN[1] + WIN[3] + 20, WIN[2], 110); D(); }
            const r = inBox(S[j], WIN); ctx.save(); if (!VID.collecting) { ctx.beginPath(); ctx.roundRect(WIN[0] + SH.x, WIN[1] + SH.y, WIN[2], WIN[3], 14); ctx.clip(); ctx.fillStyle = SWC(j); ctx.fillRect(WIN[0] + SH.x, WIN[1] + SH.y, WIN[2], WIN[3]); } K7.photo(S[j], t, r); ctx.restore();
            if (!VID.collecting) { const c = G(), nm = CN[j], fs = Math.min(64, fitSize(nm, 500, 700, 64, 'Corm', 0)); setF(F(500, fs, 'Corm', 'italic'), 0); c.fillStyle = '#141012'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; const [nx, ny] = posOf(elP('shade' + (j + 1)), [WIN[0], WIN[1] + WIN[3] + 230]); c.fillText(nm, nx, ny);
              setF(F(700, 22, 'Mont'), 4); c.fillStyle = '#6B5E58'; c.textAlign = 'right'; c.fillText((hexOk(CC[j]) ? CC[j].toUpperCase() : 'N° 0' + (j + 1)), WIN[0] + WIN[2], WIN[1] + WIN[3] + 230); D(); } };
          ctx.save(); if (q > 0) ctx.globalAlpha = 1 - q; if (k > 0 && lt < 0.3) cut('panels', t, T0 + k * PD, 0.6, card(k - 1), card(k), { col: 'accent' }); else card(k)(); ctx.restore(); void col; }
        if (t >= OUT) { fan(t, seg(t, OUT, 1.0), 0.5, 560); close(t, OUT, { y: 600, line: END, lineL: { slot: 'Corm', wt: 500, ital: true, size: 96, color: 'white', anim: { in: 'blur' } }, cta: 'underline', gap: 340 }); }
      },
      cues() { const ev = [['paper', 0.3, 0.3, 0], ['swish', 0.4, 0.3, -0.3], ['swish', 0.6, 0.3, 0.3]]; S.forEach((s, k) => { ev.push(['snap', s.start - 0.05, 0.35, 0]); ev.push(['tink', s.start + 0.5, 0.18, 0.3]); }); ev.push(['paper', OUT, 0.25, 0], ['shimmer', OUT + 1.2, 0.16, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ DETAIL SHINE
  // Gloss: a bright glint sweeps across the frame on every cut, water beads slide down the glass, a chrome title, and the steps
  // you list tick across a bar; cool, wet, precise.
  function shine() {
    const TITLE = TX('title', 'SHINE', { label: 'Big word', group: 'Opening', upper: true, max: 10 });
    const STEPS = TX('steps', 'STEP ONE\nSTEP TWO\nSTEP THREE\nSTEP FOUR', { label: 'Your steps (one per line)', group: 'The steps', multiline: true, upper: true, max: 80, req: true, hint: 'Sample text: list what you actually do.' });
    const END = TX('end', 'BOOK YOUR DETAIL', { label: 'Ending line', group: 'Ending', upper: true, max: 22 });
    const ST = lines(STEPS).slice(0, 4), T0 = 2.4, PD = 3.0, OUT = T0 + 4 * PD, DUR = OUT + 4.3;
    const S = shots(ST.concat(ST.length < 4 ? ['', '', '', ''].slice(ST.length) : []).slice(0, 4).map((x, k) => ['s' + (k + 1), 'Shot ' + (k + 1), PD + 0.4, 'any']), T0); S.forEach((s, k) => (s.start = T0 + k * PD));
    function glint(t, t0, a) { const p = seg(t, t0, 0.7); if (VID.collecting || p <= 0 || p >= 1) return; const c = G(), x = -400 + (W + 800) * E.inOutS(p); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; const g = c.createLinearGradient(x - 160, 0, x + 160, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.translate(x, H / 2); c.rotate(0.35); c.translate(-x, -H / 2); c.fillStyle = g; c.fillRect(x - 160, -400, 320, H + 800); D(); }
    function beads(t, a) { if (VID.collecting || a <= 0) return; const c = G(); for (let i = 0; i < 26; i++) { const sp = 40 + hash(i) * 120, x = hash(i * 3) * W, y = (hash(i * 5) * H + t * sp * (hash(i * 9) > 0.7 ? 1 : 0.08)) % H, r = 6 + hash(i * 7) * 12; c.globalAlpha = a * 0.75;
      const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.4, 'rgba(255,255,255,0.15)'); g.addColorStop(1, 'rgba(255,255,255,0.35)'); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, r * 0.85, r, 0, 0, TAU); c.fill(); } D(); }
    function elements() {
      const tiP = posOf(elP('title'), [540, 960]);
      const sts = [0, 1, 2, 3].map(k => { const sp = posOf(elP('step' + (k + 1)), [540, 1300]); return { id: 'step' + (k + 1), kind: 'pos', label: ST[k], x: sp[0], y: sp[1], t0: T0 + k * PD + 0.15, d: PD - 0.1, box: [sp[0] - 400, sp[1] - 90, 800, 180], dup: false, del: false }; });
      return [
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.3, d: T0, box: [tiP[0] - 450, tiP[1] - 200, 900, 400], dup: false, del: false },
        ...sts,
      ];
    }
    return {
      dur: DUR, elements,
      render(t) {
        BACKDROP(() => { bg(DEEP1, DEEP2); });
        if (t < T0 + 0.3) { const [tx, ty] = posOf(elP('title'), [540, 960]); type(L8({ text: TITLE, slot: 'Bebas', size: 420, track: 60, color: 'white', fx: { fill: 'chrome', sweep: true, shadow: 'soft' }, anim: { in: 'zoom', out: 'fade', outD: 0.3 }, x: tx, y: ty, t0: 0.3, d: T0 - 0.0 }), t); glint(t, 1.2, 1); }
        if (t >= T0 && t < OUT) { const k = Math.min(3, Math.floor((t - T0) / PD)), lt = t - (T0 + k * PD), q = seg(t, OUT - 0.3, 0.3); const draw = j => () => stage(S[j], t, 900, { alpha: 1 - q });
          if (k > 0 && lt < 0.25) cut('flash', t, T0 + k * PD, 0.5, draw(k - 1), draw(k), { col: 'white' }); else draw(k)();
          glint(t, T0 + k * PD + 0.2, 0.9); beads(t, 0.6 * (1 - q)); shade(1150, H, 0, 0.85);
          if (ST[k]) { const [sx, sy] = posOf(elP('step' + (k + 1)), [540, 1300]); type(L8({ text: ST[k], slot: 'Bebas', size: 120, color: 'white', fx: { fill: 'chrome', sweep: true }, anim: { in: 'slide', dir: 'left', out: 'slide', outDir: 'right', outD: 0.25 }, x: sx, y: sy, t0: T0 + k * PD + 0.15, d: PD - 0.1 }), t); }
          if (!VID.collecting) { const c = G(), n = Math.max(1, ST.length), w = (900 - (n - 1) * 14) / n; c.globalAlpha = 1 - q; for (let i = 0; i < n; i++) { c.fillStyle = WA(0.2); c.fillRect(90 + i * (w + 14), 1400, w, 8); if (i < k) { c.fillStyle = OR; c.fillRect(90 + i * (w + 14), 1400, w, 8); } else if (i === k) { c.fillStyle = OR; c.fillRect(90 + i * (w + 14), 1400, w * clamp(lt / PD), 8); } } D(); } }
        if (t >= OUT) { beads(t, 0.4); close(t, OUT, { y: 620, line: END, lineL: { slot: 'Bebas', size: 110, color: 'white', fx: { fill: 'chrome', sweep: true }, anim: { in: 'tracking' } }, cta: 'pill' }); glint(t, OUT + 0.9, 0.8); }
      },
      cues() { const ev = [['whoosh', 0.3, 0.3, 0], ['shimmer', 1.2, 0.3, 0]]; S.forEach((s, k) => { if (k) ev.push(['flash', s.start - 0.05, 0.3, 0]); ev.push(['shimmer', s.start + 0.2, 0.2, (k % 2 ? 0.3 : -0.3)]); ev.push(['swish', s.start + 0.15, 0.25, -0.2]); });
        ev.push(['shimmer', OUT + 0.9, 0.25, 0], ['chime', OUT + 1.4, 0.16, 0]); return { dur: DUR, beds: [musicBed(DUR), ['water', 0, OUT, 0.06]], events: ev }; },
    };
  }

  // ================================================================ SERVICE BAY
  // Shop floor: diamond-plate texture, a stencil title, a gauge whose needle sweeps up as each job on your checklist ticks off,
  // hard cuts on a driving beat, warning-stripe wipes.
  function garage() {
    const TITLE = TX('title', 'IN THE BAY', { label: 'Title', group: 'Opening', upper: true, max: 16 });
    const JOBS = TX('jobs', 'JOB ONE\nJOB TWO\nJOB THREE', { label: 'Your jobs (one per line)', group: 'The checklist', multiline: true, upper: true, max: 80, req: true, hint: 'Sample text: list the work you actually do.' });
    const END = TX('end', 'BOOK YOUR SERVICE', { label: 'Ending line', group: 'Ending', upper: true, max: 22 });
    const BT = 60 / FM.bpm, J = lines(JOBS).slice(0, 4), T0 = 2.2, PD = 8 * BT, N = 3, OUT = T0 + N * PD + 0.2, DUR = OUT + 4.3;   // three shots whatever the list length, so the soundtrack keeps its timing
    const S = shots(Array.from({ length: N }, (x, k) => ['s' + (k + 1), 'Shot ' + (k + 1), PD + 0.4, 'any']), T0); S.forEach((s, k) => (s.start = T0 + k * PD));
    function plate() { if (VID.collecting) return; const c = G(); c.fillStyle = DEEP1; c.fillRect(-20, -20, W + 40, H + 40); c.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = 0; y < H; y += 40) for (let x = (y / 40 % 2) * 20; x < W; x += 40) { c.save(); c.translate(x, y); c.rotate(0.7); c.fillRect(-12, -3, 24, 6); c.restore(); } D(); }
    function gauge(cx, cy, r, v, a) { if (VID.collecting || a <= 0) return; const c = G(), a0 = Math.PI * 0.8, a1 = Math.PI * 2.2; c.globalAlpha = a; c.fillStyle = 'rgba(0,0,0,0.7)'; c.beginPath(); c.arc(cx, cy, r + 20, 0, TAU); c.fill(); c.strokeStyle = WA(0.85); c.lineWidth = 4;
      for (let i = 0; i <= 40; i++) { const an = a0 + (a1 - a0) * i / 40, l = i % 5 ? 14 : 30; c.strokeStyle = i > 32 ? OR : WA(0.85); c.beginPath(); c.moveTo(cx + Math.cos(an) * (r - l), cy + Math.sin(an) * (r - l)); c.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); c.stroke(); }
      const an = a0 + (a1 - a0) * clamp(v); c.strokeStyle = OR; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - Math.cos(an) * 20, cy - Math.sin(an) * 20); c.lineTo(cx + Math.cos(an) * (r - 24), cy + Math.sin(an) * (r - 24)); c.stroke(); c.fillStyle = WHT; c.beginPath(); c.arc(cx, cy, 14, 0, TAU); c.fill(); D(); }
    function elements() {
      const tiP = posOf(elP('title'), [540, 700]), gaP = posOf(elP('gauge'), [540, 1260]);
      const jobs = J.map((j, i) => { const jp = posOf(elP('job' + (i + 1)), [150, 1120 + i * 76]); return { id: 'job' + (i + 1), kind: 'pos', label: j, x: jp[0], y: jp[1], t0: T0 + 0.2 + i * 0.12, d: OUT - (T0 + 0.2 + i * 0.12), box: [jp[0], jp[1] - 40, 800, 70], dup: false, del: false }; });
      return [
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.3, d: T0 - 0.1, box: [tiP[0] - 400, tiP[1] - 100, 800, 200], dup: false, del: false },
        { id: 'gauge', kind: 'pos', label: 'Gauge', x: gaP[0], y: gaP[1], t0: 0.4, d: T0 - 0.4, box: [gaP[0] - 240, gaP[1] - 240, 480, 480], dup: false, del: false },
        ...jobs,
      ];
    }
    return {
      dur: DUR, elements, shakes: S.map(s => [s.start, 5]).concat([[OUT + 0.3, 6]]),
      render(t) {
        BACKDROP(() => { plate(); });
        if (t < T0 + 0.3) { const a = 1 - seg(t, T0 - 0.2, 0.4); const [gx, gy] = posOf(elP('gauge'), [540, 1260]); gauge(gx, gy, 220, E.outBack(seg(t, 0.4, 1.2)) * 0.95 - seg(t, 1.6, 0.5) * 0.9, a);
          const [tx, ty] = posOf(elP('title'), [540, 700]); type(L8({ text: TITLE, slot: 'Bebas', size: 190, track: 40, color: 'white', fx: { stroke: 0, shadow: 'hard', shcol: 'accent' }, anim: { in: 'punch', out: 'fade', outD: 0.3 }, x: tx, y: ty, t0: 0.3, d: T0 - 0.1 }), t); }
        if (t >= T0 && t < OUT) { const k = Math.min(N - 1, Math.floor((t - T0) / PD)), lt = t - (T0 + k * PD), q = seg(t, OUT - 0.3, 0.3), draw = j => () => stage(S[j], t, 760, { alpha: 1 - q });
          if (k > 0 && lt < 0.3) cut('stripes', t, T0 + k * PD, 0.6, draw(k - 1), draw(k), { col: 'accent' }); else draw(k)();
          shade(950, H, 0, 0.92); gauge(840, 1230, 130, (k + E.outC(clamp(lt / 0.8))) / N, 1 - q);
          const prog = (k + clamp(lt / PD)) / N; J.forEach((j, i) => { const y = 1120 + i * 76, on = prog >= (i + 0.5) / J.length, p = seg(t, T0 + 0.2 + i * 0.12, 0.3) * (1 - q); if (p <= 0) return; if (!VID.collecting) { const c = G(); c.globalAlpha = E.outC(p); c.strokeStyle = WHT; c.lineWidth = 4; c.strokeRect(80, y - 36, 44, 44); if (on) { c.strokeStyle = OR; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(88, y - 16); c.lineTo(100, y - 2); c.lineTo(122, y - 32); c.stroke(); } D(); }
            K7.txt(j, ...posOf(elP('job' + (i + 1)), [150, y]), F(400, 56, 'Bebas'), on ? WHT : WA(0.55), { a: E.outC(p), ls: 3 }); }); }
        if (t >= OUT) { gauge(540, 1500, 150, 0.98, 0.4 * fa(t, OUT)); close(t, OUT, { y: 600, line: END, lineL: { slot: 'Bebas', size: 120, color: 'accent', fx: { shadow: 'hard', shcol: 'ink' }, anim: { in: 'punch' } }, cta: 'outline' }); }
      },
      cues() { const ev = [['switch', 0.3, 0.3, 0], ['rumble', 0.4, 0.3, 0], ['impact', 0.35, 0.45, 0]]; S.forEach((s, k) => { if (k) ev.push(['snap', s.start - 0.05, 0.4, 0]); ev.push(['click', s.start + 0.5, 0.35, -0.3]); });
        ev.push(['impact', OUT + 0.3, 0.45, 0], ['clack', OUT + 1.4, 0.3, 0]); return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ PARTY NIGHT
  // Nightlife energy: a mirror-ball light field drifts, confetti bursts on the drop, the event name bounces in, the date and
  // the lineup flash on the beat, beat-flash cuts.
  function party() {
    const NAME = TX('name', 'THE PARTY', { label: 'Event name', group: 'The event', upper: true, max: 20, req: true, hint: 'Sample text: your event’s name.' });
    const DATE = TX('date', '', { label: 'Date', group: 'The event', upper: true, max: 18, hint: 'Optional, e.g. SAT 11.15. Empty hides it.' });
    const LINE = TX('lineup', 'DJ NAME\nSPECIAL GUEST', { label: 'Lineup (one per line)', group: 'The event', multiline: true, upper: true, max: 80, hint: 'Sample text: who is actually on.' });
    const END = TX('end', 'GET ON THE LIST', { label: 'Ending line', group: 'Ending', upper: true, max: 20 });
    const BT = 60 / FM.bpm, DROP = 8 * BT, T2 = DROP + 8 * BT, T3 = T2 + 8 * BT, OUT = T3 + 8 * BT, DUR = OUT + 4.2;
    const S = shots([['s1', 'The crowd', T2 + 0.3, 'any', 'v'], ['s2', 'The night', T3 - T2 + 0.3, 'any', 'v'], ['s3', 'The moment', OUT - T3 + 0.3, 'any', 'v']], 0); S[1].start = T2; S[2].start = T3;
    const LU = lines(LINE).slice(0, 4);
    function lights(t, a) { if (VID.collecting || a <= 0) return; const c = G(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 46; i++) { const an = i * 2.4 + t * 0.4, rr = 200 + hash(i) * 900, x = W / 2 + Math.cos(an) * rr, y = 700 + Math.sin(an) * rr * 0.7, s = 6 + hash(i * 3) * 10; c.globalAlpha = a * (0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i))); c.drawImage(K7.spark(i % 3 ? OR : ACC2), x - s * 3, y - s * 3, s * 6, s * 6); } D(); }
    function elements() {
      const coP = posOf(elP('count'), [540, 960]), naP = posOf(elP('name'), [540, 1150]), liP = posOf(elP('lineup'), [540, 360]);
      const els = [
        { id: 'count', kind: 'pos', label: 'Countdown 3·2·1', x: coP[0], y: coP[1], t0: 0, d: DROP, box: [coP[0] - 400, coP[1] - 200, 800, 400], dup: false, del: false },
        { id: 'name', kind: 'pos', label: NAME, x: naP[0], y: naP[1], t0: DROP, d: OUT - DROP - 0.1, box: [naP[0] - 480, naP[1] - 100, 960, 200], dup: false, del: false },
        { id: 'lineup', kind: 'pos', label: 'Lineup · ' + LU[0], x: liP[0], y: liP[1], t0: T2, d: T3 - T2, box: [liP[0] - 400, liP[1] - 80, 800, 160], dup: false, del: false },
      ];
      if (DATE) { const daP = posOf(elP('date'), [540, 1360]); els.push({ id: 'date', kind: 'pos', label: DATE, x: daP[0], y: daP[1], t0: DROP + 4 * BT, d: OUT - DROP - 4 * BT, box: [daP[0] - 400, daP[1] - 60, 800, 120], dup: false, del: false }); }
      return els;
    }
    return {
      dur: DUR, elements, shakes: [[DROP, 12], [T2, 5], [T3, 5], [OUT + 0.2, 6]],
      render(t) {
        BACKDROP(() => { bg(DEEP1, DEEP2, true); });
        if (t < OUT) { const draw = j => () => stage(S[j], t, 900), q = seg(t, OUT - 0.3, 0.3);
          if (t < DROP) { if (!VID.collecting) { ctx.save(); ctx.filter = 'brightness(0.45)'; } stage(S[0], t, 900); if (!VID.collecting) ctx.restore(); }
          else if (t < T2 + 0.25) cut('beatflash', t, T2, 0.5, draw(0), draw(1), { col: 'accent' }); else if (t < T3 + 0.25) cut('rgb', t, T3, 0.5, draw(1), draw(2)); else { ctx.save(); ctx.globalAlpha = 1 - q; draw(2)(); ctx.restore(); }
          lights(t, t < DROP ? 1 : 0.5); shade(H * 0.55, H, 0, 0.8);
          if (t < DROP) { const n = Math.min(3, Math.floor(t / (2 * BT))); const [cx, cy] = posOf(elP('count'), [540, 960]); type(L8({ text: ['3', '2', '1', ''][n], slot: 'Bebas', size: 420, color: 'accent2', fx: { glow: 0.5, gcol: 'accent2' }, anim: { in: 'punch', inD: 0.25, out: 'none' }, x: cx, y: cy, t0: n * 2 * BT, d: 2 * BT }), t); }
          if (t >= DROP) { gfx({ kind: 'mg', type: 'confetti', x: 540, y: 960, t0: DROP, d: 3 }, t);
            const [nx, ny] = posOf(elP('name'), [540, 1150]); type(L8({ text: NAME, slot: 'Bebas', size: 180, w: 960, lead: 0.9, color: 'white', fx: { shadow: 'layered', shcol: 'accent' }, anim: { in: 'bounce', out: 'fade', outD: 0.25, loop: 'pulse', loopAmt: 0.4 }, x: nx, y: ny, t0: DROP, d: OUT - DROP - 0.1 }), t);
            if (DATE) { const [dx, dy] = posOf(elP('date'), [540, 1360]); type(L8({ text: DATE, slot: 'Mont', wt: 900, size: 54, track: 200, color: K8.onCol(ACC2), fx: { deco: 'pill', dcol: 'accent2' }, anim: { in: 'pop', out: 'fade' }, x: dx, y: dy, t0: DROP + 4 * BT, d: OUT - DROP - 4 * BT }), t); }
            if (t >= T2) { const i = Math.floor((t - T2) / (2 * BT)) % Math.max(1, LU.length); if (LU[i]) { const [lx, ly] = posOf(elP('lineup'), [540, 360]); type(L8({ text: LU[i], slot: 'Bebas', size: 110, color: 'accent', fx: { glow: 0.6 }, anim: { in: 'glitch', out: 'none' }, x: lx, y: ly, t0: T2 + Math.floor((t - T2) / (2 * BT)) * 2 * BT, d: 2 * BT }), t); } } } }
        if (t >= OUT) { lights(t, 0.6); gfx({ kind: 'mg', type: 'confetti', x: 540, y: 960, t0: OUT + 0.2, d: 3.5 }, t); close(t, OUT, { y: 600, line: END, lineL: { slot: 'Bebas', size: 120, color: 'accent2', anim: { in: 'bounce' } }, cta: 'pill', gap: 430 }); }
      },
      cues() { const ev = [['impact', 0.02, 0.45, 0], ['impact', 2 * BT, 0.5, 0], ['impact', 4 * BT, 0.55, 0], ['riser', DROP - 2.0, 0.3, 0], ['boom', DROP, 0.6, 0], ['clap', DROP, 0.5, 0], ['pop', DROP + 0.05, 0.4, 0.3], ['flash', T2, 0.3, 0], ['glitch', T3, 0.35, 0]];
        if (DATE) ev.push(['pop', DROP + 4 * BT, 0.35, 0]); ev.push(['pop', OUT + 0.2, 0.4, 0], ['clap', OUT + 0.3, 0.35, 0]); return { dur: DUR, beds: [musicBed(DUR, { drop: DROP })], events: ev }; },
    };
  }

  // ================================================================ WEDDING VENUE
  // Romance and calm: an arch is drawn in a fine line with botanical sprigs growing up its sides, script headings, each space
  // you name shown inside the arch in turn, a waltz underneath.
  function venue() {
    const TITLE = TX('title', 'Celebrate here', { label: 'Script title', group: 'Opening', max: 22 });
    const SP = ['The ceremony', 'The reception', 'The details'].map((n, k) => TX('space' + (k + 1), n, { label: 'Space ' + (k + 1), group: 'Spaces', max: 22 }));
    const END = TX('end', 'Book a private tour', { label: 'Closing line', group: 'Ending', max: 26 });
    const T0 = 3.4, PD = 3.6, OUT = T0 + 3 * PD, DUR = OUT + 4.4;
    const S = shots(SP.map((n, k) => ['s' + (k + 1), 'Space ' + (k + 1), PD + 0.4, 'any', 'v']), T0); S.forEach((s, k) => (s.start = T0 + k * PD));
    const AR = EL && EL.box ? [num(EL.box.x, 190), num(EL.box.y, 300), num(EL.box.w, 700), num(EL.box.h, 980)] : [190, 300, 700, 980];
    function archPath(c, r, g) { const [x, y, w, h] = r, rad = w / 2; c.beginPath(); c.moveTo(x - g, y + h + g); c.lineTo(x - g, y + rad); c.arc(x + rad, y + rad, rad + g, Math.PI, 0); c.lineTo(x + w + g, y + h + g); }
    function vines(p, a) { if (VID.collecting || p <= 0) return; const c = G(); c.globalAlpha = a; c.strokeStyle = ACC2; c.lineWidth = 2.5; c.lineCap = 'round'; for (const side of [-1, 1]) { const x0 = side < 0 ? AR[0] - 30 : AR[0] + AR[2] + 30, n = 10;
      for (let i = 0; i < n; i++) { const u = i / n; if (u > p) break; const y = AR[1] + AR[3] + 20 - u * (AR[3] - 120), lp = clamp((p - u) * 6), len = 46 * lp; c.save(); c.translate(x0, y); c.rotate(side * (0.9 + (i % 2) * 0.4)); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * 0.5, -len * 0.4, len, 0); c.quadraticCurveTo(len * 0.5, len * 0.4, 0, 0); c.stroke(); c.restore(); } } D(); }
    function elements() {
      const tiP = posOf(elP('title'), [540, 860]), brP = posOf(elP('brand'), [540, 1060]);
      const sps = [0, 1, 2].map(k => { const sp = posOf(elP('space' + (k + 1)), [540, 1350]); return { id: 'space' + (k + 1), kind: 'pos', label: SP[k], x: sp[0], y: sp[1], t0: T0 + k * PD + 0.5, d: PD - 0.4, box: [sp[0] - 350, sp[1] - 80, 700, 160], dup: false, del: false }; });
      return [
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 1.0, d: T0 - 0.6, box: [tiP[0] - 350, tiP[1] - 100, 700, 200], dup: false, del: false },
        { id: 'brand', kind: 'pos', label: up(BRAND.short || BRAND.name), x: brP[0], y: brP[1], t0: 1.8, d: T0 - 1.8, box: [brP[0] - 400, brP[1] - 30, 800, 60], dup: false, del: false },
        ...sps,
        { id: 'arch', kind: 'box', label: 'Arch frame', x: AR[0], y: AR[1], w: AR[2], h: AR[3], t0: 0.2, d: OUT - 0.2, box: AR, dup: false, del: false },
      ];
    }
    return {
      dur: DUR, elements,
      render(t) {
        BACKDROP(() => { bg(DEEP2, DEEP1); });
        const ap = seg(t, 0.2, 1.8);
        if (!VID.collecting && ap > 0) { const c = G(), L = 3200; c.strokeStyle = OR; c.lineWidth = 2; c.setLineDash([L * E.inOutS(ap), L]); archPath(c, AR, 26); c.stroke(); c.setLineDash([]); D(); }
        vines(seg(t, 0.8, 2.4), 1);
        if (t < T0 + 0.4) { const a = 1 - seg(t, T0 - 0.2, 0.5); const [tx, ty] = posOf(elP('title'), [540, 860]); type(L8({ text: TITLE, slot: 'Hand', wt: 400, size: 140, w: 700, color: 'accent', anim: { in: 'blur', inD: 1.2, out: 'fade', outD: 0.4 }, x: tx, y: ty, t0: 1.0, d: T0 - 0.6 }), t);
          const [bx, by] = posOf(elP('brand'), [540, 1060]); K7.txt(up(BRAND.short || BRAND.name), bx, by, F(500, 26, 'Mont'), WHT, { align: 'center', ls: 8, a: fa(t, 1.8, 0.8) * a }); }
        if (t >= T0 && t < OUT + 0.5) { const k = Math.min(2, Math.floor((t - T0) / PD)), lt = t - (T0 + k * PD), q = seg(t, OUT - 0.1, 0.6);
          const draw = j => () => { const r = inBox(S[j], AR); ctx.save(); if (!VID.collecting) { ctx.translate(SH.x, SH.y); archPath(ctx, AR, 0); ctx.closePath(); ctx.clip(); ctx.translate(-SH.x, -SH.y); } K7.photo(S[j], t, r, { alpha: (1 - q) * fa(t, T0, 0.8) }); ctx.restore(); };
          if (k > 0 && lt < 0.5) cut('elegant', t, T0 + k * PD, 1.0, draw(k - 1), draw(k)); else draw(k)();
          const [sx, sy] = posOf(elP('space' + (k + 1)), [540, 1350]); type(L8({ text: SP[k], slot: 'Hand', wt: 400, size: 104, color: 'accent', anim: { in: 'blur', inD: 0.8, out: 'fade', outD: 0.35 }, x: sx, y: sy, t0: T0 + k * PD + 0.5, d: PD - 0.4 }), t);
          K7.txt(['I', 'II', 'III'][k], W / 2, 1425, F(500, 30, 'Corm'), WA(0.7), { align: 'center', ls: 6, a: fa(lt, 0.7) * (1 - seg(lt, PD - 0.3, 0.3)) * (1 - q) }); }
        if (t >= OUT) close(t, OUT, { y: 640, lw: 460, line: END, lineL: { slot: 'Hand', wt: 400, size: 96, color: 'accent', anim: { in: 'blur' } }, cta: 'underline', gap: 330 });
      },
      cues() { const ev = [['air', 0.3, 0.2, 0], ['pencil', 0.4, 0.2, -0.3], ['pencil', 1.2, 0.2, 0.3], ['chime', 1.2, 0.16, 0]]; S.forEach((s, k) => { ev.push(['air', s.start - 0.2, 0.2, 0]); ev.push(['tink', s.start + 0.6, 0.14, k % 2 ? 0.3 : -0.3]); }); ev.push(['shimmer', OUT + 0.5, 0.16, 0], ['bell', OUT + 1.5, 0.14, 0]);
        return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ NEW ARRIVALS
  // An editorial lookbook: huge index numbers, a three-up grid that slides along, NEW tags stamped on, item names in a wide
  // grotesk with optional prices, then each piece full height.
  function arrivals() {
    const TITLE = TX('title', 'NEW ARRIVALS', { label: 'Title', group: 'Opening', upper: true, max: 18 });
    const IT = [0, 1, 2].map(k => ({ n: TX('item' + (k + 1), 'ITEM NAME', { label: 'Item ' + (k + 1), group: 'Item ' + (k + 1), upper: true, max: 22, req: true, hint: 'Sample text: the product’s name.' }), p: TX('price' + (k + 1), '', { label: 'Item ' + (k + 1) + ' price', group: 'Item ' + (k + 1), max: 9, hint: 'Optional. Empty hides it.' }) }));
    const END = TX('end', 'SHOP THE DROP', { label: 'Ending line', group: 'Ending', upper: true, max: 20 });
    const BT = 60 / FM.bpm, T0 = 2.4, T1 = T0 + 8 * BT, PD = 8 * BT, OUT = T1 + 3 * PD, DUR = OUT + 4.2;
    const S = shots(IT.map((x, k) => ['s' + (k + 1), 'Item ' + (k + 1), OUT - T0 + 0.4, 'any', 'v']), T0);
    const prices = K9.allowed('pricetag');
    function elements() {
      const tiP = posOf(elP('title'), [540, 900]), brP = posOf(elP('brand'), [540, 1180]);
      const els = [
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.3, d: T0, box: [tiP[0] - 490, tiP[1] - 100, 980, 200], dup: false, del: false },
        { id: 'brand', kind: 'pos', label: up(BRAND.short || BRAND.name), x: brP[0], y: brP[1], t0: 1.0, d: T0 - 1.0, box: [brP[0] - 400, brP[1] - 40, 800, 80], dup: false, del: false },
        ...[0, 1, 2].map(k => { const bnP = posOf(elP('bignum' + (k + 1)), [60, 1405]), itP = posOf(elP('item' + (k + 1)), [770, 1330]); return [
          { id: 'bignum' + (k + 1), kind: 'pos', label: '0' + (k + 1), x: bnP[0], y: bnP[1], t0: T1 + k * PD, d: PD, box: [bnP[0], bnP[1] - 200, 260, 260], dup: false, del: false },
          { id: 'item' + (k + 1), kind: 'pos', label: 'Item ' + (k + 1) + ' · ' + IT[k].n, x: itP[0], y: itP[1], t0: T1 + k * PD + 0.2, d: PD - 0.3, box: [itP[0], itP[1] - 60, 540, 120], dup: false, del: false },
        ]; }).flat(),
      ];
      [0, 1, 2].forEach(k => { if (IT[k].p && prices) { const prP = posOf(elP('price' + (k + 1)), [960, 1410]); els.push({ id: 'price' + (k + 1), kind: 'pos', label: 'Price ' + (k + 1) + ' · ' + IT[k].p, x: prP[0], y: prP[1], t0: T1 + k * PD + 0.5, d: PD - 0.5, box: [prP[0] - 300, prP[1] - 50, 300, 90], dup: false, del: false }); } });
      return els;
    }
    return {
      dur: DUR, elements,
      render(t) {
        BACKDROP(() => { bg(DEEP2, DEEP1); });
        if (t < T0 + 0.4) { const [tx, ty] = posOf(elP('title'), [540, 900]); type(L8({ text: TITLE, slot: 'Bebas', size: 230, w: 980, lead: 0.86, color: 'white', anim: { in: 'halves', out: 'fade', outD: 0.3 }, x: tx, y: ty, t0: 0.3, d: T0 }), t);
          const [bx, by] = posOf(elP('brand'), [540, 1180]); K7.txt(up(BRAND.short || BRAND.name), bx, by, F(700, 26, 'Mont'), OR, { align: 'center', ls: 8, a: fa(t, 1.0) * (1 - seg(t, T0 - 0.2, 0.4)) }); }
        if (t >= T0 && t < T1 + 0.4) {   // the three-up grid slides in, NEW tags stamp on
          const q = seg(t, T1 - 0.1, 0.5); IT.forEach((it, k) => { const p = E.outQ(seg(t, T0 + k * 0.25, 0.6)), x = 60 + k * 330 + (1 - p) * 900, box = [x, 420, 300, 860], r = inBox(S[k], box);
            if (!VID.collecting) { const c = G(); c.globalAlpha = 1 - q; c.fillStyle = 'rgba(0,0,0,0.06)'; c.fillRect(box[0], box[1], box[2], box[3]); D(); } K7.photo(S[k], t, r, { alpha: 1 - q });
            K7.txt('0' + (k + 1), x + 6, 400, F(400, 110, 'Bebas'), WHT, { a: p * (1 - q) }); K7.txt(it.n, x + 6, 1340, F(800, Math.min(26, fitSize(it.n, 800, 290, 26, 'Mont', 1)), 'Mont'), WHT, { a: p * (1 - q), ls: 1 });
            if (seg(t, T0 + 0.9 + k * 0.25, 0.25) > 0) type(L8({ text: 'NEW', slot: 'Mont', wt: 900, size: 30, track: 200, w: 300, color: K8.onCol(OR), rot: -8, fx: { deco: 'box', dcol: 'accent' }, anim: { in: 'pop', out: 'fade' }, x: x + 236, y: 470, t0: T0 + 0.9 + k * 0.25, d: T1 - T0 - 0.8 - k * 0.25 }), t); }); }
        if (t >= T1 && t < OUT) { const k = Math.min(2, Math.floor((t - T1) / PD)), lt = t - (T1 + k * PD), q = seg(t, OUT - 0.3, 0.3), draw = j => () => K7.photo(S[j], t, inBox(S[j], [0, 260, W, 1040]), { alpha: 1 - q });
          if (k > 0 && lt < 0.3) cut('slide', t, T1 + k * PD, 0.6, draw(k - 1), draw(k), { dir: 'left' }); else draw(k)();
          const [bnx, bny] = posOf(elP('bignum' + (k + 1)), [60, 1405]); K7.txt('0' + (k + 1), bnx, bny, F(400, 260, 'Bebas'), OR, { a: fa(lt, 0.1) * (1 - q) });
          const [ix, iy] = posOf(elP('item' + (k + 1)), [770, 1330]); type(L8({ text: IT[k].n, slot: 'Bebas', size: 90, w: 540, align: 'left', color: 'white', anim: { in: 'wipe', out: 'fade', outD: 0.25 }, x: ix, y: iy, t0: T1 + k * PD + 0.2, d: PD - 0.3 }), t);
          if (IT[k].p && prices) { const [px, py] = posOf(elP('price' + (k + 1)), [960, 1410]); K7.txt(IT[k].p, px, py, F(800, 44, 'Mont'), WHT, { align: 'right', a: fa(lt, 0.5) * (1 - q) }); } }
        if (t >= OUT) close(t, OUT, { y: 620, line: END, lineL: { slot: 'Bebas', size: 120, color: 'white', anim: { in: 'halves' } }, cta: 'outline' });
      },
      cues() { const ev = [['whoosh', 0.3, 0.3, 0], ['snap', 0.5, 0.35, 0]]; IT.forEach((x, k) => { ev.push(['swish', T0 + k * 0.25, 0.3, (k - 1) * 0.4]); ev.push(['stamp', T0 + 0.95 + k * 0.25, 0.35, (k - 1) * 0.4]); }); for (let k = 0; k < 3; k++) ev.push(['snap', T1 + k * PD, 0.35, 0]);
        ev.push(['chime', OUT + 1.3, 0.16, 0]); return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ FLASH SALE
  // Urgency you define: a ticking countdown, hazard stripes, the offer you type slammed huge (a marker shows until you do),
  // the end date if you add one; off for brand kits that never run sales.
  function flash() {
    const KICK = TX('kick', 'FLASH SALE', { label: 'Headline', group: 'The sale', upper: true, max: 14 });
    const OFFER = TX('offer', '', { label: 'Your offer', group: 'The sale', upper: true, max: 16, req: true, hint: 'Type the real offer, e.g. 20% OFF. A marker shows until you do.' });
    const WHAT = TX('what', '', { label: 'What it’s on', group: 'The sale', upper: true, max: 30, hint: 'Optional, e.g. ALL OUTERWEAR. Empty hides it.' });
    const ENDS = TX('ends', '', { label: 'Ends', group: 'The sale', upper: true, max: 18, hint: 'Optional, e.g. ENDS SUNDAY. Empty hides it.' });
    const BT = 60 / FM.bpm, T1 = 8 * BT, T2 = T1 + 8 * BT, OUT = T2 + 12 * BT, DUR = OUT + 4.2;
    const S = shots([['s1', 'Shot 1', T2 - T1 + 0.3, 'any', 'v'], ['s2', 'Shot 2', OUT - T2 + 0.3, 'any', 'v']], T1); S[1].start = T2;
    const ok = K9.allowed('discount');
    const OL = K7.fitLines(OFFER || 'X', 400, 'Bebas', 1000, 260, 2), OY = 1290 - OL.lines.length * OL.size * 0.86 / 2;
    function stripes(t, y, h, a) { if (VID.collecting || a <= 0) return; const c = G(); c.globalAlpha = a; c.fillStyle = OR; c.fillRect(-20, y, W + 40, h); c.save(); c.beginPath(); c.rect(-20, y, W + 40, h); c.clip(); c.fillStyle = ACC2; const off = (t * 160) % 80; for (let x = -100; x < W + 100; x += 80) { c.beginPath(); c.moveTo(x + off, y); c.lineTo(x + off + 40, y); c.lineTo(x + off + 40 - h, y + h); c.lineTo(x + off - h, y + h); c.fill(); } c.restore(); D(); }
    function elements() {
      const kiP = posOf(elP('kick'), [540, 760]), cdP = posOf(elP('countdown'), [540, 1230]);
      const els = [
        { id: 'kick', kind: 'pos', label: KICK, x: kiP[0], y: kiP[1], t0: 0.2, d: T1, box: [kiP[0] - 500, kiP[1] - 120, 1000, 240], dup: false, del: false },
        { id: 'countdown', kind: 'pos', label: 'Countdown', x: cdP[0], y: cdP[1], t0: 0.9, d: T1 - 0.9, box: [cdP[0] - 400, cdP[1] - 200, 800, 400], dup: false, del: false },
      ];
      if (OFFER) { const ofP = posOf(elP('offer'), [540, OY]); els.push({ id: 'offer', kind: 'pos', label: OFFER, x: ofP[0], y: ofP[1], t0: T1 + 0.1, d: OUT - T1 - 0.2, box: [ofP[0] - 500, ofP[1] - 130, 1000, 260], dup: false, del: false }); }
      if (WHAT) { const whP = posOf(elP('what'), [540, 1345]); els.push({ id: 'what', kind: 'pos', label: WHAT, x: whP[0], y: whP[1], t0: T1 + 0.8, d: OUT - T1 - 0.9, box: [whP[0] - 500, whP[1] - 55, 1000, 110], dup: false, del: false }); }
      if (ENDS) { const enP = posOf(elP('ends'), [540, 1415]); els.push({ id: 'ends', kind: 'pos', label: ENDS, x: enP[0], y: enP[1], t0: T2 + 0.2, d: OUT - T2 - 0.3, box: [enP[0] - 500, enP[1] - 55, 1000, 110], dup: false, del: false }); }
      return els;
    }
    return {
      dur: DUR, elements, shakes: [[T1, 10], [T2, 6], [OUT + 0.2, 6]],
      render(t) {
        BACKDROP(() => { bg(DEEP1, DEEP2, true); });
        if (!ok) { K7.need('Not for this brand kit', W / 2, 960, 30, { align: 'center', col: WHT }); return; }
        if (t < T1) { stripes(t, 300, 70, 1); stripes(t, 1550, 70, 1); const [kx, ky] = posOf(elP('kick'), [540, 760]); type(L8({ text: KICK, slot: 'Bebas', size: 240, w: 1000, lead: 0.88, color: 'white', fx: { shadow: 'hard', shcol: 'accent2' }, anim: { in: 'punch', out: 'none', loop: 'jitter', loopAmt: 0.5 }, x: kx, y: ky, t0: 0.2, d: T1 }), t);
          const [cx, cy] = posOf(elP('countdown'), [540, 1230]); gfx({ kind: 'mg', type: 'countdown', from: 3, color: 'accent2', x: cx, y: cy, t0: 0.9, d: T1 - 0.9 }, t); }
        if (t >= T1 && t < OUT) { const draw = j => () => stage(S[j], t, 760), q = seg(t, OUT - 0.3, 0.3); if (t < T2 + 0.25) { if (t > T2 - 0.25) cut('snapcut', t, T2, 0.5, draw(0), draw(1)); else draw(0)(); } else { ctx.save(); ctx.globalAlpha = 1 - q; draw(1)(); ctx.restore(); }
          shade(H * 0.5, H, 0, 0.92); stripes(t, 210, 56, 1 - q);
          if (OFFER) { const [ox, oy] = posOf(elP('offer'), [540, OY]); type(L8({ text: OFFER, slot: 'Bebas', size: OL.size, w: 1000, lead: 0.86, color: 'accent', fx: { shadow: 'hard', shcol: 'accent2', stroke: 6, scol: 'ink' }, anim: { in: 'punch', out: 'fade', outD: 0.25, loop: 'pulse', loopAmt: 0.4 }, x: ox, y: oy, t0: T1 + 0.1, d: OUT - T1 - 0.2 }), t); } else K7.need('your offer', W / 2, 1200, 30, { align: 'center', col: WHT, a: 1 - q });
          if (WHAT) { const [wx, wy] = posOf(elP('what'), [540, 1345]); type(L8({ text: WHAT, slot: 'Mont', wt: 900, size: 46, track: 100, color: 'white', anim: { in: 'words', out: 'fade' }, x: wx, y: wy, t0: T1 + 0.8, d: OUT - T1 - 0.9 }), t); }
          if (ENDS && t >= T2) { const [ex, ey] = posOf(elP('ends'), [540, 1415]); type(L8({ text: ENDS, slot: 'Mont', wt: 900, size: 40, track: 200, color: K8.onCol(ACC2), fx: { deco: 'box', dcol: 'accent2' }, anim: { in: 'pop', out: 'fade' }, x: ex, y: ey, t0: T2 + 0.2, d: OUT - T2 - 0.3 }), t); } }
        if (t >= OUT) { stripes(t, 180, 56, fa(t, OUT)); close(t, OUT, { y: 620, line: KICK, lineL: { slot: 'Bebas', size: 150, color: 'accent', fx: { shadow: 'hard', shcol: 'accent2' }, anim: { in: 'punch' } }, cta: 'pill', ctaCol: 'accent' }); }
      },
      cues() { const ev = [['impact', 0.2, 0.5, 0], ['tick', 0.9, 0.35, 0], ['tick', 0.9 + 2 * BT, 0.35, 0], ['tick', 0.9 + 4 * BT, 0.35, 0], ['riser', T1 - 1.5, 0.3, 0], ['boom', T1, 0.6, 0], ['impact', T1 + 0.1, 0.5, 0], ['snap', T2, 0.4, 0]];
        if (ENDS) ev.push(['pop', T2 + 0.2, 0.35, 0]); ev.push(['impact', OUT + 0.7, 0.45, 0], ['register', OUT + 1.4, 0.3, 0]); return { dur: DUR, beds: [musicBed(DUR, { drop: T1 })], events: ev }; },
    };
  }

  // ================================================================ QUICK TIPS
  // Educational: a "3 quick tips" title, then numbered cards that flip over one at a time with your tip on the back, a progress
  // bar across the top, footage under the card, and a "save this" note at the end.
  function tips() {
    const TITLE = TX('title', '3 quick tips', { label: 'Title', group: 'Opening', max: 22 });
    const TP = [0, 1, 2].map(k => TX('tip' + (k + 1), 'Your tip ' + ['one', 'two', 'three'][k] + ', in a few words', { label: 'Tip ' + (k + 1), group: 'Tips', max: 60, req: true, hint: 'Sample text: your own advice.' }));
    const SAVE = TX('save', 'Save this for later', { label: 'Note at the end', group: 'Ending', max: 24 });
    const T0 = 2.8, PD = 4.0, OUT = T0 + 3 * PD, DUR = OUT + 4.4;
    const S = shots(TP.map((x, k) => ['s' + (k + 1), 'Tip ' + (k + 1), PD + 0.4, 'any']), T0); S.forEach((s, k) => (s.start = T0 + k * PD));
    function card(k, lt, a) {   // a card that flips from its number to the tip
      if (VID.collecting || a <= 0) return; const fp = E.inOutC(seg(lt, 0.6, 0.6)), sx = Math.abs(Math.cos(fp * Math.PI)), back = fp > 0.5, c = G(); c.globalAlpha = a; c.translate(CB[0] + CB[2] / 2, CB[1] + CB[3] / 2 + (1 - E.outBack(seg(lt, 0, 0.5))) * 500); c.scale(Math.max(0.02, sx), 1);
      c.shadowColor = 'rgba(30,27,46,0.25)'; c.shadowBlur = 40; c.shadowOffsetY = 14; c.fillStyle = back ? '#FFFFFF' : OR; c.beginPath(); c.roundRect(-430, -250, 860, 500, 40); c.fill(); c.shadowColor = 'transparent';
      if (!back) { setF(F(400, 300, 'Bebas'), 0); c.fillStyle = K8.onCol(OR); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(k + 1), 0, 20); }
      else { setF(F(800, 26, 'Mont'), 4); c.fillStyle = OR; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText('TIP ' + (k + 1), -370, -170); const L = K7.fitLines(TP[k], 700, 'Mont', 740, 64, 4); setF(F(700, L.size, 'Mont'), 0); c.fillStyle = '#1E1B2E'; L.lines.forEach((ln, i) => c.fillText(ln, -370, -90 + (i + 1) * L.size * 1.2)); } D(); }
    const CB = EL && EL.box ? [num(EL.box.x, 110), num(EL.box.y, 900), num(EL.box.w, 860), num(EL.box.h, 500)] : [110, 900, 860, 500];
    function elements() {
      const tiP = posOf(elP('title'), [540, 860]);
      return [
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0.4, d: T0 - 0.1, box: [tiP[0] - 450, tiP[1] - 100, 900, 200], dup: false, del: false },
        { id: 'card', kind: 'box', label: 'Tip card', x: CB[0], y: CB[1], w: CB[2], h: CB[3], t0: T0, d: OUT - T0, box: CB, dup: false, del: false },
      ];
    }
    return {
      dur: DUR, elements,
      render(t) {
        BACKDROP(() => { bg(DEEP1, DEEP2); });
        if (t < T0 + 0.3) { const [tx, ty] = posOf(elP('title'), [540, 860]); type(L8({ text: TITLE, slot: 'Bebas', size: 150, w: 900, color: 'white', anim: { in: 'bounce', out: 'fade', outD: 0.3 }, x: tx, y: ty, t0: 0.4, d: T0 - 0.1 }), t);
          for (let i = 0; i < 3; i++) { const p = seg(t, 1.0 + i * 0.15, 0.4) * (1 - seg(t, T0 - 0.2, 0.4)); if (p <= 0 || VID.collecting) continue; const c = G(); c.globalAlpha = E.outC(p); c.fillStyle = i ? WA(0.3) : OR; c.beginPath(); c.arc(460 + i * 80, 1040, 18, 0, TAU); c.fill(); D(); } }
        if (t >= T0 && t < OUT) { const k = Math.min(2, Math.floor((t - T0) / PD)), lt = t - (T0 + k * PD), q = seg(t, OUT - 0.3, 0.3), draw = j => () => K7.photo(S[j], t, inBox(S[j], [40, 260, 1000, 600]), { alpha: 1 - q });
          if (k > 0 && lt < 0.3) cut('swipe', t, T0 + k * PD, 0.6, draw(k - 1), draw(k), { dir: 'left' }); else draw(k)();
          if (!VID.collecting) { const c = G(); c.globalAlpha = 1 - q; for (let i = 0; i < 3; i++) { c.fillStyle = WA(0.25); c.beginPath(); c.roundRect(60 + i * 330, 190, 300, 10, 5); c.fill(); const f = i < k ? 1 : i === k ? clamp(lt / PD) : 0; if (f > 0) { c.fillStyle = OR; c.beginPath(); c.roundRect(60 + i * 330, 190, 300 * f, 10, 5); c.fill(); } } D(); }
          card(k, lt, (1 - q) * (1 - seg(lt, PD - 0.25, 0.25))); }
        if (t >= OUT) { close(t, OUT, { y: 620, line: SAVE, lineL: { slot: 'Bebas', size: 90, color: 'accent', anim: { in: 'bounce' } }, cta: 'round', gap: 340 });
          if (!VID.collecting) { const p = seg(t, OUT + 1.0, 0.4), c = G(); if (p > 0) { c.globalAlpha = E.outC(p); c.translate(880, 1360); c.rotate(0.12); c.strokeStyle = OR; c.lineWidth = 6; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-40, -60); c.lineTo(40, -60); c.lineTo(40, 60); c.lineTo(0, 30); c.lineTo(-40, 60); c.closePath(); c.stroke(); } D(); } }
      },
      cues() { const ev = [['pop', 0.45, 0.35, 0], ['tick', 1.0, 0.25, -0.3], ['tick', 1.15, 0.25, 0], ['tick', 1.3, 0.25, 0.3]]; S.forEach((s, k) => { if (k) ev.push(['swish', s.start - 0.1, 0.3, -0.3]); ev.push(['whoosh', s.start, 0.25, 0]); ev.push(['pageflip', s.start + 0.6, 0.4, 0]); });
        ev.push(['pop', OUT + 1.0, 0.3, 0.3], ['notify', OUT + 1.4, 0.25, 0]); return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  // ================================================================ CLIENT STORY
  // A review from the brand kit, word for word: two quote marks draw themselves, the words arrive a phrase at a time in a warm
  // serif beside the footage, the reviewer's name settles under a rule. No stars, no ratings.
  const REVS = (BRAND.reviews && BRAND.reviews.length) ? BRAND.reviews : [{ id: 'none', text: 'Add a real customer review, word for word, to this brand kit to use this template.', by: 'YOUR CUSTOMER' }];
  const revLabel = r => r.by.split('·').map(x => x.trim()).filter(Boolean).map((x, i) => i ? x : x.charAt(0) + x.slice(1).toLowerCase().replace(/ (\w)/g, (m, c) => ' ' + c.toUpperCase())).join(' · ');
  function story() {
    const RV = TX('review', REVS[0].id, { label: 'Review (word for word, from the brand kit)', group: 'The review', options: REVS.map(r => ({ value: r.id, label: revLabel(r) })) });
    const KICK = TX('kick', 'CLIENT STORY', { label: 'Small line', group: 'The review', upper: true, max: 20 });
    const R = REVS.find(r => r.id === RV) || REVS[0];
    const T1 = 1.8, OUT = 13.0, DUR = OUT + 4.4;
    const RL = K7.fitLines(R.text, 500, 'Corm', 850, 58, 4, { style: 'italic' }), RH = RL.lines.length * RL.size * 1.18, RT = 1090;
    const S = shots([['s1', 'The work', 5.8, 'any', 'v'], ['s2', 'More of the work', OUT - 5.6, 'any', 'v']], 0); S[0].start = 0.2; S[1].start = 5.8;
    // a big opening quote mark wiped on from the left, with a short rule growing under it
    const qm = (x, y, s, p) => { if (VID.collecting || p <= 0) return; const c = G(), k = E.inOutS(clamp(p)), f = F(700, 240 * s, 'Corm'); setF(f, 0); const w = textW('\u201C', f, 0); c.beginPath(); c.rect(x - 10, y - 220 * s, (w + 20) * k, 300 * s); c.clip();
      c.fillStyle = OR; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText('\u201C', x, y + 120 * s); D(); };
    function elements() {
      const kiP = posOf(elP('kick'), [100, 950]), reP = posOf(elP('review'), [525, RT + RH / 2]);
      const byY = Math.min(1425, RT + RH + 58), byP = posOf(elP('by'), [100, byY]);
      return [
        { id: 'kick', kind: 'pos', label: KICK, x: kiP[0], y: kiP[1], t0: 0.8, d: OUT - 0.8, box: [kiP[0], kiP[1] - 40, 500, 70], dup: false, del: false },
        { id: 'review', kind: 'pos', label: R.text, x: reP[0], y: reP[1], t0: T1, d: OUT - T1, box: [reP[0] - 425, RT, 850, RH + 80], dup: false, del: false },
        { id: 'by', kind: 'pos', label: R.by, x: byP[0], y: byP[1], t0: OUT - 2.6, d: 2.6, box: [byP[0], byP[1] - 40, 600, 70], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, elements,
      render(t) {
        BACKDROP(() => { bg(DEEP1, DEEP2); });
        if (t < OUT) { const q = seg(t, OUT - 0.4, 0.4), box = [60, 260, 960, 640], draw = j => () => K7.photo(S[j], t, inBox(S[j], box), { alpha: (1 - q) * fa(t, 0.2, 0.8) });
          if (t > 5.4 && t < 6.2) cut('dissolve', t, 5.8, 0.8, draw(0), draw(1)); else draw(t < 5.8 ? 0 : 1)();
          const [kx, ky] = posOf(elP('kick'), [100, 950]); K7.txt(KICK, kx, ky, F(700, 26, 'Mont'), OR, { a: fa(t, 0.8) * (1 - q), ls: 6 });
          qm(96, 1046, 1.0, seg(t, 1.0, 0.8) * (1 - q));
          const [rx, ry] = posOf(elP('review'), [525, RT + RH / 2]); type(L8({ text: R.text, slot: 'Corm', wt: 500, ital: true, size: RL.size, w: 850, align: 'left', lead: 1.18, color: 'white', anim: { in: 'words', stagger: 0.06, out: 'fade', outD: 0.35 }, x: rx, y: ry, t0: T1, d: OUT - T1 }), t);
          if (!VID.collecting) { const c = G(), k = E.inOutC(seg(t, OUT - 3.0, 0.6)) * (1 - q); c.fillStyle = OR; c.fillRect(100, RT + RH + 18, 120 * k, 3); D(); }
          const [bx, by] = posOf(elP('by'), [100, Math.min(1425, RT + RH + 58)]); K7.txt(R.by, bx, by, F(700, 26, 'Mont'), WA(0.85), { a: fa(t, OUT - 2.6) * (1 - q), ls: 4 }); }
        if (t >= OUT) close(t, OUT, { y: 640, line: 'Thank you for trusting us', lineL: { slot: 'Corm', wt: 500, ital: true, size: 72, color: 'white', anim: { in: 'blur' } }, cta: 'outline', gap: 320 });
      },
      cues() { const ev = [['air', 0.3, 0.2, 0], ['pencil', 1.0, 0.25, -0.3], ['pencil', 1.4, 0.25, -0.2], ['air', 5.8, 0.2, 0], ['tink', OUT - 2.6, 0.16, 0], ['chime', OUT + 1.2, 0.16, 0]]; return { dur: DUR, beds: [musicBed(DUR)], events: ev }; },
    };
  }

  const MAKE = { crew, timeline, glowup, swatch, shine, garage, party, venue, arrivals, flash, tips, story };
  const P = (MAKE[V] || crew)();
  const light = ['timeline', 'glowup', 'venue', 'arrivals', 'tips'].includes(V);
  DIR = { dur: P.dur, bg: BLK, bgSwap: true, finish: { vig: light ? 0.08 : 0.26, grain: light ? 0.06 : 0.16 }, edl: [], shakes: P.shakes, preload: () => K3.init(), render: P.render, cues: P.cues, fam: V,
    ...(P.elements ? { elements: P.elements } : {}),
    setup() { if (!window.STUDIO && LIGHTPAL) { const w = IMG.logoW; IMG.logoW = IMG.logoB; IMG.logoB = w; } } };
});
