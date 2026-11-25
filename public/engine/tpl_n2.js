'use strict';
/* Round 5 concepts, part 2 (kit3 + kit4).
   ?v=chat      #54 The Group Chat (20 s): a dramatized group chat; the videos are sent as messages, the link card is the CTA.
   ?v=listed    #55 Just Listed (15 s): real-estate listing parody, swipe between three "listings", save, tap, morph to the CTA.
   ?v=signs     #57 5 Signs You Need a Backyard Upgrade (30 s): flat colour cards, a different transition into every fix.
   ?v=sound     #59 Turn Your Sound On (15 s): no music; each shot gets its own sound and an animated sound word.
   ?v=questions #60 3 Questions to Ask Before You Hire (30 s): notepad pages, handwritten questions, typed answers, page tears.
   Facts only from dpgoutdoorliving.com; captions name projects, never a service DPG doesn't list. */
STUDIO_REG['n2'] = (() => {
  const V = QS.get('v') || 'chat';
  // Per-element model: tpl_free sets window.__NX_BLOCK_EL to the block's `el` data before calling this
  // factory; positions below fall back to the original hardcoded values when EL is null, so rendering
  // is byte-for-byte the old path. (Same pattern as tpl_trade.js.)
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const lmod = K3.lmod, G = K3.G, D = K3.D;
  const whole = (c, r) => K3.wholeIn(c, r);
  const play = (c, inn, lt, r, o) => K3.clip(c, inn, lt, whole(c, r), o);
  const bandR = (c, cy) => { const h = Math.round(W / K3.ar(c)); return [0, cy - h / 2, W, h]; };
  const fit = (str, w, maxW, maxS, fam, ls, st) => Math.min(maxS, fitSize(str, w, maxW, maxS, fam, ls, st));
  const FULL = () => [0, 0, W, H];
  function heart(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.95); c.bezierCurveTo(x - r * 1.7, y - r * 0.05, x - r * 0.85, y - r * 1.45, x, y - r * 0.5);
    c.bezierCurveTo(x + r * 0.85, y - r * 1.45, x + r * 1.7, y - r * 0.05, x, y + r * 0.95); c.closePath(); }
  // multi-line word slam: lines of words, continuous word timing across lines
  function slam(lines, x, y, size, lh, t, t0, o) { o = o || {}; let k = 0; lines.forEach((ln, i) => { const ws = ln.split(' ');
    K3.words(ws, x, y + i * lh, size, t, t0 + k * (o.step || 0.09), Object.assign({ step: o.step || 0.09 }, o, { hl: o.hlLine === i ? o.hlWord : -1 })); k += ws.length; }); }
  const outroCTA = (o, y, t0) => K3.ctaBlock(o, y, t0, 'kinetic');

  // ======================= #54 The Group Chat =======================
  function chat() {
    const TOP = 404, BOT = 1226, BX0 = 140, BX1 = 1012, MAXT = 650, PADX = 30, PADY = 20;
    const AV = { S: '#3B3B3B', J: '#5A5A5A' };
    const TITLE = TX('chatTitle', 'saturday plans', { label: 'Chat name', group: 'The chat', max: 24 });
    const HINT = TX('inputHint', 'Message', { label: 'Input placeholder', group: 'The chat', max: 20 });
    const NAMES = { S: TX('name1', 'Sam', { label: 'Friend 1', group: 'The chat', max: 12 }), J: TX('name2', 'Jess', { label: 'Friend 2', group: 'The chat', max: 12 }) };
    const INI = { S: (NAMES.S[0] || 'S').toUpperCase(), J: (NAMES.J[0] || 'J').toUpperCase() };
    const MSG0 = [
      { t: 1.0, who: 'S', txt: 'where are we doing saturday', typing: 0.45 },
      { t: 2.2, who: 'J', txt: 'not my place. my yard is a dirt lot', typing: 0.5 },
      { t: 3.3, who: 'me', txt: 'mine.', compose: 0.45 },
      { t: 4.3, who: 'S', txt: 'since when do you host', typing: 0.45 },
      { t: 5.3, who: 'me', vid: ['c12', 0.1, 8.1] },
      { t: 7.0, who: 'S', txt: 'WAIT', big: true },
      { t: 7.6, who: 'S', txt: 'since WHEN' },
      { t: 8.6, who: 'me', vid: ['c09', 3.55, 3.35] },
      { t: 10.6, who: 'J', txt: 'is that a pizza oven', typing: 0.55 },
      { t: 11.8, who: 'me', txt: 'yep. ' + BRAND.name + ' built it', compose: 0.7 },
      { t: 12.6, who: 'me', link: true },
      { t: 14.2, who: 'J', txt: 'booking a consultation. bye', typing: 0.6 },
    ];
    let nm = 0, nv = 0; const WHO = { S: 'Friend 1', J: 'Friend 2', me: 'You' };
    const MSG = MSG0.map(m => { if (m.link) return Object.assign({}, m, { id: 'link' });
      if (m.vid) { nv++; const v = SHOT('vid' + nv, [m.vid[0], m.vid[1]], { label: 'Video you send (' + nv + ')', group: 'Messages', kind: 'land', d: m.vid[2] }); return Object.assign({}, m, { id: 'vid' + nv, vid: [v[0], v[1], m.vid[2]] }); }
      nm++; return Object.assign({}, m, { id: 'm' + nm, txt: TX('m' + nm, m.txt, { label: WHO[m.who] + (m.big ? ' (big)' : ''), group: 'Messages', max: m.big ? 10 : 40 }) }); });
    const O1 = TX('outro1', 'BE THE BACKYARD', { label: 'Ending, line 1', group: 'Ending', upper: true, max: 18 });
    const O2 = TX('outro2', 'EVERYONE TEXTS ABOUT.', { label: 'Ending, line 2 (2nd word highlighted)', group: 'Ending', upper: true, max: 22 });
    const HEART = 13.35, OUT = 15.4, DUR = 20;
    let prepped = false;
    function prep() {
      if (prepped) return; prepped = true;
      MSG.forEach(m => { if (m.vid) { m.w = 680; m.h = 391; } else if (m.link) { m.w = 620; m.h = 376; }
        else { m.f = F(m.big ? 900 : 600, m.big ? 74 : 45, 'Mont'); m.lh = m.big ? 82 : 58; m.lines = K3.wrap(m.txt, m.f, MAXT);
          m.w = Math.max(...m.lines.map(l => textW(l, m.f, 0))) + 2 * PADX; m.h = m.lines.length * m.lh + 2 * PADY; } });
    }
    function layout(t) {
      const items = []; let y = 0, prev = null;
      for (const m of MSG) { const t0 = m.t - (m.typing || 0); if (t < t0) break;
        const typing = !!m.typing && t < m.t, e = typing ? E.outC(clamp((t - t0) / 0.2, 0, 1)) : E.outC(clamp((t - m.t) / 0.28, 0, 1));
        const newRun = !prev || prev.who !== m.who, gap = prev ? (newRun ? 30 : 10) : 0, lab = newRun && m.who !== 'me' ? 36 : 0;
        const full = typing ? 84 : m.h, hh = typing ? full * e : (m.typing ? lerp(84, full, e) : full * e);
        y += gap + lab; items.push({ m, y, full, hh, typing, lab }); y += hh; prev = m; }
      items.forEach((it, k) => { it.lastRun = !items[k + 1] || items[k + 1].m.who !== it.m.who; });
      return { items, total: y };
    }
    function bubbleAt(m, x, y, t, s, a) {   // pop scale s around the sender-side bottom corner
      const me = m.who === 'me', ax = me ? x + m.w : x, ay = y + m.h, sx = v => ax + (v - ax) * s, sy = v => ay + (v - ay) * s;
      const R = [sx(x), sy(y), m.w * s, m.h * s], rad = me ? [30, 30, 8, 30] : [30, 30, 30, 8];
      if (m.vid) {
        if (!VID.collecting) { const c = G(); c.globalAlpha = a; c.fillStyle = OR; rrect(R[0], R[1], R[2], R[3], rad.map(v => v * s)); c.fill(); D(); }
        const lt = t - m.t; ctx.save(); ctx.globalAlpha = a; play(m.vid[0], m.vid[1], lmod(lt, m.vid[2]), [R[0] + 10 * s, R[1] + 10 * s, R[2] - 20 * s, R[3] - 20 * s]); ctx.restore();
        if (!VID.collecting && lt < 1.2) { const c = G(); c.globalAlpha = a * (1 - clamp((lt - 0.6) / 0.6)); setF(F(700, 18, 'Mono'), 2); c.fillStyle = WHT; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
          c.shadowColor = 'rgba(0,0,0,0.7)'; c.shadowBlur = 8; c.fillText('0:0' + Math.round(m.vid[2]), R[0] + 26 * s, R[1] + R[3] - 26 * s); D(); }
        return;
      }
      if (VID.collecting) return;
      const c = G(); c.globalAlpha = a; c.translate(ax, ay); c.scale(s, s); c.translate(-ax, -ay);
      if (m.link) {
        c.save(); rrect(x, y, m.w, m.h, rad); c.clip(); c.fillStyle = '#F2F2F2'; c.fillRect(x, y, m.w, m.h); c.fillStyle = BLK; c.fillRect(x, y, m.w, 220);
        const [lw, lh] = logoBox(420); c.drawImage(IMG.logoW, x + m.w / 2 - lw / 2, y + 110 - lh / 2, lw, lh); c.restore();
        c.textAlign = 'left'; c.textBaseline = 'alphabetic'; setF(F(700, Math.min(31, fitSize(BRAND.name, 700, m.w - 52, 31, 'Mont')), 'Mont'), 0); c.fillStyle = BLK; c.fillText(BRAND.name, x + 26, y + 272);
        setF(F(500, Math.min(27, fitSize(ctaSentence(), 500, m.w - 52, 27, 'Mont')), 'Mont'), 0); c.fillStyle = '#444'; c.fillText(ctaSentence(), x + 26, y + 314);
        setF(F(500, Math.min(21, fitSize(CONTACT.web.toLowerCase(), 500, m.w - 52, 21, 'Mono', 1)), 'Mono'), 1); c.fillStyle = '#777'; c.fillText(CONTACT.web.toLowerCase(), x + 26, y + 352);
      } else {
        c.fillStyle = me ? OR : '#262626'; rrect(x, y, m.w, m.h, m.h > 100 ? rad : (me ? [m.h / 2, m.h / 2, 8, m.h / 2] : [m.h / 2, m.h / 2, m.h / 2, 8])); c.fill();
        setF(m.f, 0); c.fillStyle = me ? BLK : WHT; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
        m.lines.forEach((l, i) => c.fillText(l, x + PADX, y + PADY + (i + 1) * m.lh - m.lh * 0.27));
      }
      D();
    }
    function typingBubble(x, y, t, e) { if (VID.collecting) return; const c = G(), s = lerp(0.6, 1, E.outBack(e)); c.globalAlpha = clamp(e * 2); c.translate(x, y + 84); c.scale(s, s); c.translate(-x, -(y + 84));
      c.fillStyle = '#262626'; rrect(x, y, 132, 84, [42, 42, 42, 8]); c.fill();
      for (let k = 0; k < 3; k++) { const o = Math.max(0, Math.sin(t * 7 - k * 0.9)); c.fillStyle = `rgba(255,255,255,${0.4 + 0.5 * o})`; c.beginPath(); c.arc(x + 36 + k * 30, y + 42 - o * 7, 8.5, 0, 7); c.fill(); }
      D(); }
    function header() {
      if (VID.collecting) return; const c = G();
      c.fillStyle = '#121212'; c.fillRect(0, 0, W, 392); c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(0, 390, W, 2);
      c.strokeStyle = OR; c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(94, 296); c.lineTo(72, 320); c.lineTo(94, 344); c.stroke();
      [['S', 152], ['J', 196]].forEach(([l, x]) => { c.fillStyle = AV[l]; c.beginPath(); c.arc(x, 320, 32, 0, 7); c.fill(); c.strokeStyle = '#121212'; c.lineWidth = 5; c.stroke();
        setF(F(700, 26, 'Mont'), 0); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(INI[l], x, 322); });
      setF(F(700, Math.min(36, fitSize(TITLE, 700, 520, 36, 'Mont')), 'Mont'), 0); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillStyle = WHT; const [tix, tiy] = posOf(elP('title'), [256, 314]); c.fillText(TITLE, tix, tiy);
      setF(F(500, Math.min(21, fitSize(NAMES.S + ', ' + NAMES.J + ', you', 500, 470, 21, 'Mono', 1)), 'Mono'), 1); c.fillStyle = 'rgba(255,255,255,0.5)'; const [mbx, mby] = posOf(elP('members'), [256, 350]); c.fillText(NAMES.S + ', ' + NAMES.J + ', you', mbx, mby);
      setF(F(700, 18, 'Mono'), 3); c.textAlign = 'right'; c.fillStyle = 'rgba(255,255,255,0.6)'; const [drx, dry] = posOf(elP('dram'), [1012, 350]); c.fillText('DRAMATIZATION', drx, dry); D();
    }
    function inputBar(t) {
      if (VID.collecting) return; let txt = '', pulse = 0;
      for (const m of MSG) { if (!m.compose) continue; const t0 = m.t - m.compose; if (t >= t0 && t < m.t) txt = m.txt.slice(0, Math.ceil(m.txt.length * clamp((t - t0) / (m.compose - 0.1)))); if (t >= m.t && t < m.t + 0.25) pulse = Math.sin(Math.PI * (t - m.t) / 0.25); }
      for (const m of MSG) if (m.vid && t >= m.t - 0.1 && t < m.t + 0.15) pulse = Math.sin(Math.PI * (t - m.t + 0.1) / 0.25);
      const c = G(); c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 2; rrect(72, 1262, 840, 76, 38); c.stroke();
      const [ipx, ipy] = posOf(elP('input'), [104, 1301]);
      setF(F(500, 30, 'Mont'), 0); c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = txt ? WHT : 'rgba(255,255,255,0.35)'; c.fillText(txt || HINT, ipx, ipy);
      if (txt && Math.floor(t * 4) % 2 === 0) { c.fillStyle = OR; c.fillRect(ipx + 2 + textW(txt, F(500, 30, 'Mont'), 0), ipy - 19, 3, 38); }
      c.translate(968, 1300); c.scale(1 + 0.18 * pulse, 1 + 0.18 * pulse); c.fillStyle = txt || pulse > 0 ? OR : '#333'; c.beginPath(); c.arc(0, 0, 36, 0, 7); c.fill();
      c.strokeStyle = BLK; c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(0, 14); c.lineTo(0, -14); c.moveTo(-11, -3); c.lineTo(0, -14); c.lineTo(11, -3); c.stroke(); D();
    }
    function chatUI(t) {
      prep(); if (!VID.collecting) fillScreen(BLK);
      const L = layout(t), off = Math.min(0, BOT - (TOP + L.total));
      ctx.save(); ctx.setTransform(1, 0, 0, 1, SH.x, SH.y); ctx.beginPath(); ctx.rect(0, 392, W, BOT + 26 - 392); ctx.clip();
      for (const it of L.items) {
        const m = it.m, me = m.who === 'me';
        let y = TOP + off + it.y;
        const [bx, by] = posOf(elP(m.id), [me ? BX1 - m.w : BX0, y]); y = by;
        if (y > BOT + 40 || y + it.full < 380) continue;
        if (it.lab && !VID.collecting) { const c = G(); setF(F(500, 21, 'Mono'), 1); c.fillStyle = 'rgba(255,255,255,0.5)'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText(NAMES[m.who], BX0 + 6, y - 12); D(); }
        if (it.typing) typingBubble(BX0, y, t, E.outC(clamp((t - (m.t - m.typing)) / 0.2)));
        else { const p = clamp((t - m.t) / 0.3); bubbleAt(m, bx, y, t, lerp(0.62, 1, E.outBack(p)), clamp(p * 3)); }
        if (!me && it.lastRun && !VID.collecting) { const c = G(), ay = y + (it.typing ? 84 : m.h) - 26; c.fillStyle = AV[m.who]; c.beginPath(); c.arc(100, ay, 26, 0, 7); c.fill();
          setF(F(700, 21, 'Mont'), 0); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(INI[m.who], 100, ay + 1); D(); }
        if (m.link && t >= HEART && !VID.collecting) {   // Jess hearts the link card
          const p = clamp((t - HEART) / 0.35), s = E.outBack(p), hx = BX1 - m.w + 8, hy = y + 6, c = G();
          c.translate(hx, hy); c.scale(s, s); c.fillStyle = '#262626'; c.beginPath(); c.arc(0, 0, 32, 0, 7); c.fill(); c.strokeStyle = BLK; c.lineWidth = 5; c.stroke(); c.fillStyle = OR; heart(c, 0, 1, 15); c.fill(); D();
          if (p < 1) K3.ripple(hx, hy, t, HEART); }
      }
      ctx.restore();
      header(); inputBar(t);
    }
    function elements() {
      prep();
      const tiP = posOf(elP('title'), [256, 314]), mbP = posOf(elP('members'), [256, 350]), drP = posOf(elP('dram'), [1012, 350]);
      const inP = posOf(elP('input'), [104, 1301]);
      const z = Math.min(fit(O2, 900, 950, 96, 'Mont', -3), fit(O1, 900, 950, 96, 'Mont', -3));
      const o1P = posOf(elP('outro1'), [W / 2, 560]), o2P = posOf(elP('outro2'), [W / 2, 560 + z * 1.12]);
      const lgP = posOf(elP('outroLogo'), [W / 2, 830]), ctP = posOf(elP('cta'), [W / 2, 1000]);
      const msgs = MSG.map(m => { const L2 = layout(m.t), it = L2.items.find(x => x.m === m);
        const off = Math.min(0, BOT - (TOP + L2.total)), y = TOP + off + (it ? it.y : 0);
        const [mx, my] = posOf(elP(m.id), [m.who === 'me' ? BX1 - m.w : BX0, y]);
        const kind = m.link ? 'card' : m.vid ? 'box' : 'pos';
        const label = m.link ? 'Link card' : m.vid ? 'Video you send' : m.txt;
        const e = { id: m.id, kind, label, x: mx, y: my, t0: m.t, d: OUT - m.t, box: [mx - 10, my - 10, m.w + 20, m.h + 20], dup: false, del: false };
        if (kind !== 'pos') { e.w = m.w; e.h = m.h; }
        return e; });
      return [
        { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0, d: OUT, box: [tiP[0], tiP[1] - 40, 520, 60], dup: false, del: false },
        { id: 'members', kind: 'pos', label: NAMES.S + ', ' + NAMES.J + ', you', x: mbP[0], y: mbP[1], t0: 0, d: OUT, box: [mbP[0], mbP[1] - 30, 470, 50], dup: false, del: false },
        { id: 'dram', kind: 'pos', label: 'DRAMATIZATION', x: drP[0], y: drP[1], t0: 0, d: OUT, box: [drP[0] - 200, drP[1] - 30, 200, 50], dup: false, del: false },
        { id: 'input', kind: 'pos', label: HINT, x: inP[0], y: inP[1], t0: 0, d: DUR, box: [inP[0] - 32, inP[1] - 39, 840, 76], dup: false, del: false },
        ...msgs,
        { id: 'outro1', kind: 'pos', label: O1, x: o1P[0], y: o1P[1], t0: OUT + 0.25, d: DUR - (OUT + 0.25), box: [o1P[0] - 470, o1P[1] - 80, 940, 160], dup: false, del: false },
        { id: 'outro2', kind: 'pos', label: O2, x: o2P[0], y: o2P[1], t0: OUT + 0.65, d: DUR - (OUT + 0.65), box: [o2P[0] - 470, o2P[1] - 80, 940, 160], dup: false, del: false },
        { id: 'outroLogo', kind: 'pos', label: 'Logo', x: lgP[0], y: lgP[1], t0: OUT + 0.2, d: DUR - (OUT + 0.2), box: [lgP[0] - 300, lgP[1] - 60, 600, 120], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: CONTACT.cta, x: ctP[0], y: ctP[1], t0: OUT + 1.65, d: DUR - (OUT + 1.65), box: [ctP[0] - 400, ctP[1] - 45, 800, 90], dup: false, del: false },
      ];
    }
    let SZ = null;
    return {
      dur: DUR, shakes: [[7.0, 12]], elements,
      render(t) {
        fillScreen(BLK);
        if (t < OUT) chatUI(t);
        else if (t < OUT + 0.5) { const u = (t - OUT) / 0.5; if (VID.collecting) chatUI(t); else { const cv = K4.into('n2chat', () => chatUI(t)); const c = K4.GI(); c.globalAlpha = 1 - E.inC(u); c.drawImage(cv, 0, -E.inC(u) * 420); D(); } }
        if (t >= OUT + 0.2) { const o = t - OUT - 0.2, z = SZ || (SZ = Math.min(fit(O2, 900, 950, 96, 'Mont', -3), fit(O1, 900, 950, 96, 'Mont', -3))), w2 = O2.split(' ');
          const [o1x, o1y] = posOf(elP('outro1'), [W / 2, 560]);
          K3.words(O1.split(' '), o1x, o1y, z, o, 0.05, { step: 0.12 });
          const [o2x, o2y] = posOf(elP('outro2'), [W / 2, 560 + z * 1.12]);
          K3.words(w2, o2x, o2y, z, o, 0.45, { step: 0.12, hl: Math.min(1, w2.length - 1) });
          const [lgx, lgy] = posOf(elP('outroLogo'), [W / 2, 830]);
          K3.logoBuild(lgx, lgy, 600, 1.0, o, { speed: 1.4 });
          outroCTA(o, posOf(elP('cta'), [W / 2, 1000])[1], 1.45); }
      },
      cues() {
        const ev = [];
        MSG.forEach(m => { if (m.who === 'me') { ev.push(['air', m.t + 0.05, 0.2, 0.3]); ev.push(['tick', m.t, 0.22, 0.3]); if (m.compose) ev.push(['ticks', m.t - m.compose, 0.1, 0.2, { dur: m.compose - 0.1, n: Math.round(m.txt.length * 0.6) }]); }
          else { ev.push(['pop', m.t, 0.3, -0.25]); if (m.typing) ev.push(['ticks', m.t - m.typing, 0.05, -0.3, { dur: m.typing, n: 6 }]); } });
        ev.push(['impact', 7.0, 0.35, 0]); ev.push(['pop', HEART, 0.35, 0.2]); ev.push(['shimmer', HEART + 0.1, 0.16, 0.2]); ev.push(['chime', 12.65, 0.14, 0.3]);
        ev.push(['whoosh', OUT + 0.15, 0.3, 0]); ev.push(['impact', OUT + 0.95, 0.3, 0]); ev.push(['chime', OUT + 2.2, 0.22, 0]); ev.push(['ticks', OUT + 2.2, 0.14, 0, { dur: 0.8, n: 14 }]);
        return { dur: DUR, beds: [['music', 0, DUR, 0.85, { style: 'lounge', bpm: 100, key: 1, end: 18.6 }]], events: ev };
      },
    };
  }

  // ======================= #55 Just Listed =======================
  function listed() {
    const CX0 = 70, CW = 940, CY0 = 400, CH = 850, PH = [84, 414, 912, 513];
    const L0 = [
      { ph: [['c09', 3.55, 1.9], ['c09', 10.5, 3.4]], title: 'Your new favorite room', stats: '1 STONE OVEN  ·  1 LOUNGE  ·  ENDLESS EVENINGS' },
      { ph: [['c12', 0.1, 8.1]], title: 'Sunsets included', stats: '1 PAVILION  ·  1 OUTDOOR KITCHEN  ·  0 REASONS TO LEAVE' },
      { ph: [['c07', 12.05, 1.9], ['c07', 24.0, 2.85]], title: 'Hosting season, all year', stats: '1 BOCCE COURT  ·  1 PAVILION  ·  LATE NIGHTS' },
    ];
    const HD1 = TX('head1', 'JUST', { label: 'Headline, word 1', group: 'Headline', upper: true, max: 10 }), HD2 = TX('head2', 'LISTED.', { label: 'Headline, word 2 (highlighted)', group: 'Headline', upper: true, max: 10 });
    const L = L0.map((l, k) => { const g = 'Listing ' + (k + 1), n = k + 1;
      const ph = l.ph.map(([c, inn, d], j) => { const sh = SHOT(`l${n}p${j + 1}`, [c, inn], { label: 'Photo ' + (j + 1), group: g, kind: 'land', d: Math.min(d, 4.2) }); return [sh[0], sh[1], d]; });
      return { ph, title: TX(`l${n}title`, l.title, { label: 'Title', group: g, max: 28 }), addr: TX(`l${n}addr`, projOf(ph[0][0]) + '  ·  ' + BRAND.short.toUpperCase() + ' PORTFOLIO', { label: 'Address line', group: g, upper: true, max: 40 }),
        stats: TX(`l${n}stats`, l.stats, { label: 'Details line', group: g, upper: true, max: 54 }) }; });
    const BTNT = TX('button', 'SCHEDULE A SHOWING', { label: 'Button (turns into the CTA)', group: 'Ending', upper: true, max: 24 });
    const OL1 = TX('outro1', 'NEXT LISTING:', { label: 'Ending, line 1', group: 'Ending', upper: true, max: 16 }), OL2 = TX('outro2', 'YOURS.', { label: 'Ending, line 2 (highlighted)', group: 'Ending', upper: true, max: 12 });
    const ST = [0.2, 3.65, 6.95], SW = 0.45, HEARTS = [2.3, 5.45, 8.25], BTN = 9.0, OUT = 10.4, DUR = 15;
    const HX = PH[0] + PH[2] - 52, HY = PH[1] + 52, BY = 1180;
    let SZ = null; const sizes = () => SZ || (SZ = { hd: fit(HD1 + ' ' + HD2, 900, 940, 104, 'Mont', -3), st: L.map(l => fit(l.stats, 700, 860, 23, 'Mono', 1)),
      out: Math.min(fit(OL1.split(' ').slice(-1)[0] + ' ' + OL2, 900, 950, 110, 'Mont', -3), fit(OL1, 900, 950, 110, 'Mont', -3)) });
    function card(k, t, dy) {
      const l = L[k], lt = t - ST[k], y = v => v + dy, z = sizes();
      const [ccx, ccy] = posOf(elP('card' + (k + 1)), [CX0, y(CY0)]), ox = ccx - CX0, oy = ccy - y(CY0);
      if (!VID.collecting) { const c = G(); c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 50; c.shadowOffsetY = 18; c.fillStyle = WHT; rrect(CX0 + ox, y(CY0) + oy, CW, CH, 30); c.fill(); D(); }
      // listing photo carousel: auto-advances with a slide, dots under the photo
      const vis = Math.max(0, t - (k ? ST[k] - SW : ST[0])), pr0 = [PH[0] + ox, y(PH[1]) + oy, PH[2], PH[3]];
      const [prx, pry] = posOf(elP('photo' + (k + 1)), [pr0[0], pr0[1]]), pr = [prx, pry, pr0[2], pr0[3]];
      let acc = 0, pi = 0;
      for (let i = 0; i < l.ph.length; i++) { pi = i; if (vis < acc + l.ph[i][2] || i === l.ph.length - 1) break; acc += l.ph[i][2]; }
      const plt = vis - acc, cur = l.ph[pi], clipR = () => ctx.rect(pr[0], pr[1], pr[2], pr[3]);
      if (pi > 0 && plt < 0.32) { const u = E.inOutC(plt / 0.32), pv = l.ph[pi - 1];
        play(pv[0], pv[1], pv[2] + plt, pr, { clip: clipR, dx: -u * PH[2] }); play(cur[0], cur[1], plt, pr, { clip: clipR, dx: (1 - u) * PH[2] }); }
      else play(cur[0], cur[1], plt, pr);
      if (VID.collecting) return;
      if (l.ph.length > 1) { const c0 = G(); l.ph.forEach((_, i) => { c0.fillStyle = i === pi ? WHT : 'rgba(255,255,255,0.5)'; c0.beginPath(); c0.arc(W / 2 + ox + (i - (l.ph.length - 1) / 2) * 26, pr[1] + pr[3] - 26, i === pi ? 7 : 6, 0, 7); c0.fill(); }); D(); }
      const bp = k === 0 ? clamp((lt - 0.55) / 0.3) : 1, tp = k === 0 ? clamp((lt - 0.75) / 0.4) : 1;
      const [bgx, bgy] = posOf(elP('badge' + (k + 1)), [pr[0] + 30 + textW('JUST LISTED', F(800, 22, 'Mont'), 2.5) / 2 + 26, pr[1] + 44]);
      pill('JUST LISTED', bgx, bgy, { size: 22, p: bp, bg: OR, col: BLK, padx: 52 });
      // save button
      const liked = t >= HEARTS[k] + 0.12, hp = clamp((t - HEARTS[k] - 0.12) / 0.3), c = G(), hs = t >= HEARTS[k] && t < HEARTS[k] + 0.12 ? 0.88 : 1 + 0.25 * Math.sin(Math.PI * hp) * (hp < 1 ? 1 : 0);
      const [hvx, hvy] = posOf(elP('save' + (k + 1)), [pr[0] + pr[2] - 52, pr[1] + 52]);
      c.translate(hvx, hvy); c.scale(hs, hs); c.fillStyle = WHT; c.shadowColor = 'rgba(0,0,0,0.3)'; c.shadowBlur = 12; c.beginPath(); c.arc(0, 0, 34, 0, 7); c.fill(); c.shadowBlur = 0;
      heart(c, 0, 2, 15); if (liked) { c.fillStyle = OR; c.fill(); } else { c.strokeStyle = BLK; c.lineWidth = 3.5; c.stroke(); } D();
      // text block
      const c2 = G(); c2.globalAlpha = tp; c2.textAlign = 'left'; c2.textBaseline = 'alphabetic';
      const [tix, tiy] = posOf(elP('title' + (k + 1)), [PH[0] + ox + 20, y(992) + oy]);
      setF(F(800, Math.min(46, fitSize(l.title, 800, 860, 46, 'Mont', -0.5)), 'Mont'), -0.5); c2.fillStyle = BLK; c2.fillText(l.title, tix, tiy + (1 - E.outC(tp)) * 16);
      const [adx, ady] = posOf(elP('addr' + (k + 1)), [PH[0] + ox + 22, y(1034) + oy]);
      setF(F(500, Math.min(19, fitSize(l.addr, 500, 860, 19, 'Mono', 2)), 'Mono'), 2); c2.fillStyle = '#8A8A8A'; c2.fillText(l.addr, adx, ady);
      const [stx, sty] = posOf(elP('stats' + (k + 1)), [PH[0] + ox + 22, y(1082) + oy]);
      setF(F(700, z.st[k], 'Mono'), 1); c2.fillStyle = BLK; c2.fillText(l.stats, stx, sty);
      c2.fillStyle = '#E6E6E6'; c2.fillRect(PH[0] + ox + 20, y(1108) + oy, PH[2] - 40, 2); D();
      // the button: SCHEDULE A SHOWING -> tap -> BOOK A DESIGN CONSULTATION
      const mp = k === 2 ? E.inOutC(clamp((t - BTN - 0.18) / 0.4)) : 0, press = k === 2 && t >= BTN && t < BTN + 0.16 ? 0.96 : 1, c3 = G();
      const [btx, bty] = posOf(elP('button' + (k + 1)), [W / 2 + ox, y(BY) + oy]);
      c3.globalAlpha = tp; c3.translate(btx, bty); c3.scale(press, press); c3.translate(-btx, -bty);
      c3.fillStyle = mp > 0.5 ? OR : BLK; rrect(PH[0] + ox, bty - 38, PH[2], 76, 38); c3.fill();
      setF(F(800, Math.min(27, fitSize(BTNT, 800, 840, 27, 'Mont', 2.5)), 'Mont'), 2.5); c3.textAlign = 'center'; c3.textBaseline = 'middle';
      if (mp < 1) { c3.globalAlpha = tp * clamp(1 - mp * 2); c3.fillStyle = WHT; c3.fillText(BTNT, btx, bty + 2); }
      setF(F(800, 27, 'Mont'), 2.5);
      if (mp > 0) { setF(F(800, Math.min(27, fitSize(CONTACT.cta, 800, 840, 27, 'Mont', 2.5)), 'Mont'), 2.5); c3.globalAlpha = tp * clamp(mp * 2 - 1); c3.fillStyle = BLK; c3.fillText(CONTACT.cta, btx, bty + 2); }
      D();
    }
    function cardsAt(t) {   // which card(s), with the slide-up intro and swipe transitions
      if (t < ST[0]) return;
      if (t < ST[0] + 0.55) { card(0, t, (1 - E.outC((t - ST[0]) / 0.55)) * 1400); return; }
      for (let k = 1; k < L.length; k++) if (t >= ST[k] - SW && t < ST[k]) { K4.run('swipe', FULL(), (t - (ST[k] - SW)) / SW, () => card(k - 1, t, 0), () => card(k, t, 0)); return; }
      const k = t >= ST[2] ? 2 : t >= ST[1] ? 1 : 0;
      if (t >= OUT) card(k, t, -E.inC(clamp((t - OUT) / 0.45)) * 1700); else card(k, t, 0);
    }
    function elements() {
      const hdP = posOf(elP('headline'), [CX0, 362]), cnP = posOf(elP('counter'), [W - 74, 352]);
      const o1P = posOf(elP('outro1'), [W / 2, 560]), o2P = posOf(elP('outro2'), [W / 2, 560 + sizes().out * 1.12]);
      const lgP = posOf(elP('outroLogo'), [W / 2, 830]), ctP = posOf(elP('cta'), [W / 2, 1000]);
      const per = L.map((l, k) => {
        const cdP = posOf(elP('card' + (k + 1)), [CX0, CY0]), phP = posOf(elP('photo' + (k + 1)), [PH[0], PH[1]]);
        const bdP = posOf(elP('badge' + (k + 1)), [PH[0] + 30 + textW('JUST LISTED', F(800, 22, 'Mont'), 2.5) / 2 + 26, PH[1] + 44]);
        const svP = posOf(elP('save' + (k + 1)), [PH[0] + PH[2] - 52, PH[1] + 52]);
        const tiP = posOf(elP('title' + (k + 1)), [PH[0] + 20, 992]), adP = posOf(elP('addr' + (k + 1)), [PH[0] + 22, 1034]);
        const stP = posOf(elP('stats' + (k + 1)), [PH[0] + 22, 1082]), btP = posOf(elP('button' + (k + 1)), [W / 2, BY]);
        const end = k < 2 ? ST[k + 1] : OUT;
        return [
          { id: 'card' + (k + 1), kind: 'card', label: l.title, x: cdP[0], y: cdP[1], w: CW, h: CH, t0: ST[k], d: end - ST[k], box: [cdP[0], cdP[1], CW, CH], dup: false, del: false },
          { id: 'photo' + (k + 1), kind: 'box', label: 'Photo ' + (k + 1), x: phP[0], y: phP[1], w: PH[2], h: PH[3], t0: ST[k], d: end - ST[k], box: [phP[0], phP[1], PH[2], PH[3]], dup: false, del: false },
          { id: 'badge' + (k + 1), kind: 'pos', label: 'JUST LISTED', x: bdP[0], y: bdP[1], t0: ST[k] + 0.55, d: end - (ST[k] + 0.55), box: [bdP[0] - 130, bdP[1] - 30, 260, 60], dup: false, del: false },
          { id: 'save' + (k + 1), kind: 'pos', label: 'Save', x: svP[0], y: svP[1], t0: ST[k], d: end - ST[k], box: [svP[0] - 40, svP[1] - 40, 80, 80], dup: false, del: false },
          { id: 'title' + (k + 1), kind: 'pos', label: l.title, x: tiP[0], y: tiP[1], t0: ST[k] + 0.75, d: end - (ST[k] + 0.75), box: [tiP[0], tiP[1] - 50, 860, 80], dup: false, del: false },
          { id: 'addr' + (k + 1), kind: 'pos', label: l.addr, x: adP[0], y: adP[1], t0: ST[k] + 0.75, d: end - (ST[k] + 0.75), box: [adP[0], adP[1] - 30, 860, 50], dup: false, del: false },
          { id: 'stats' + (k + 1), kind: 'pos', label: l.stats, x: stP[0], y: stP[1], t0: ST[k] + 0.75, d: end - (ST[k] + 0.75), box: [stP[0], stP[1] - 30, 860, 50], dup: false, del: false },
          { id: 'button' + (k + 1), kind: 'pos', label: BTNT, x: btP[0], y: btP[1], t0: ST[k], d: end - ST[k], box: [btP[0] - 470, btP[1] - 40, 940, 80], dup: false, del: false },
        ];
      }).flat();
      return [
        { id: 'headline', kind: 'pos', label: HD1 + ' ' + HD2, x: hdP[0], y: hdP[1], t0: 0.05, d: OUT + 0.3 - 0.05, box: [hdP[0], hdP[1] - 80, 940, 160], dup: false, del: false },
        { id: 'counter', kind: 'pos', label: 'Listing counter', x: cnP[0], y: cnP[1], t0: 0.5, d: OUT + 0.3 - 0.5, box: [cnP[0] - 120, cnP[1] - 40, 120, 60], dup: false, del: false },
        ...per,
        { id: 'outro1', kind: 'pos', label: OL1, x: o1P[0], y: o1P[1], t0: OUT + 0.3, d: DUR - (OUT + 0.3), box: [o1P[0] - 470, o1P[1] - 80, 940, 160], dup: false, del: false },
        { id: 'outro2', kind: 'pos', label: OL2, x: o2P[0], y: o2P[1], t0: OUT + 0.65, d: DUR - (OUT + 0.65), box: [o2P[0] - 470, o2P[1] - 80, 940, 160], dup: false, del: false },
        { id: 'outroLogo', kind: 'pos', label: 'Logo', x: lgP[0], y: lgP[1], t0: OUT + 0.25, d: DUR - (OUT + 0.25), box: [lgP[0] - 300, lgP[1] - 60, 600, 120], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: CONTACT.cta, x: ctP[0], y: ctP[1], t0: OUT + 1.4, d: DUR - (OUT + 1.4), box: [ctP[0] - 400, ctP[1] - 45, 800, 90], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [[0.42, 6]], elements,
      render(t) {
        K3.bgKinetic(t, 820, 60 / 104 * 2);
        cardsAt(t);
        const z = sizes(), hq = clamp((t - OUT) / 0.3);
        if (t < OUT + 0.3) { const [hdx, hdy] = posOf(elP('headline'), [CX0, 362]); K3.words([HD1, HD2], hdx, hdy, z.hd, t, 0.05, { align: 'left', hl: 1, step: 0.16, q: hq });
          const k = t >= ST[2] - SW / 2 ? 2 : t >= ST[1] - SW / 2 ? 1 : 0; const [cnx, cny] = posOf(elP('counter'), [W - 74, 352]); caps((k + 1) + ' / 3', cnx, cny, 22, clamp((t - 0.5) / 0.3), hq, { w: 700, fam: 'Mono', ls: 3, align: 'right', col: 'rgba(255,255,255,0.7)' }); }
        // finger taps
        HEARTS.forEach((h, hi) => { const [hcx, hcy] = posOf(elP('card' + (hi + 1)), [CX0, CY0]), hox = hcx - CX0, hoy = hcy - CY0;
          if (t >= h - 0.15 && t < h + 0.25 && !VID.collecting) { const c = G(); c.globalAlpha = 0.55 * (1 - clamp((t - h) / 0.25)); c.fillStyle = WHT; c.beginPath(); c.arc(HX + hox + 6, HY + hoy + 6, 38, 0, 7); c.fill(); D(); } K3.ripple(HX + hox, HY + hoy, t, h); });
        const [b3x, b3y] = posOf(elP('card3'), [CX0, CY0]), b3ox = b3x - CX0, b3oy = b3y - CY0;
        if (t >= BTN - 0.15 && t < BTN + 0.25 && !VID.collecting) { const c = G(); c.globalAlpha = 0.5 * (1 - clamp((t - BTN) / 0.25)); c.fillStyle = WHT; c.beginPath(); c.arc(W / 2 + b3ox + 160, BY + b3oy + 8, 40, 0, 7); c.fill(); D(); }
        K3.ripple(W / 2 + b3ox + 160, BY + b3oy, t, BTN);
        if (t >= OUT + 0.25) { const o = t - OUT - 0.25;
          const [o1x, o1y] = posOf(elP('outro1'), [W / 2, 560]);
          K3.words(OL1.split(' '), o1x, o1y, z.out, o, 0.05, { step: 0.14 });
          const o2 = OL2.split(' '); const [o2x, o2y] = posOf(elP('outro2'), [W / 2, 560 + z.out * 1.12]); K3.words(o2, o2x, o2y, z.out, o, 0.4, { hl: o2.map((_, i) => i) });
          const [lgx, lgy] = posOf(elP('outroLogo'), [W / 2, 830]);
          K3.logoBuild(lgx, lgy, 600, 0.75, o, { speed: 1.5 });
          outroCTA(o, posOf(elP('cta'), [W / 2, 1000])[1], 1.15); }
      },
      cues() {
        const ev = [['impact', 0.42, 0.3, 0], ['whoosh', 0.45, 0.3, 0], ['pop', 0.78, 0.25, -0.3]];
        HEARTS.forEach(h => { ev.push(['pop', h + 0.1, 0.32, 0.4]); ev.push(['tink', h + 0.16, 0.12, 0.4]); });
        ST.slice(1).forEach(s => ev.push(['whoosh', s - SW + 0.25, 0.3, 0.3]));
        ev.push(['tick', BTN, 0.3, 0]); ev.push(['chime', BTN + 0.4, 0.22, 0]);
        ev.push(['whoosh', OUT + 0.3, 0.3, 0]); ev.push(['impact', OUT + 0.7, 0.3, 0]); ev.push(['chime', OUT + 1.9, 0.2, 0]);
        return { dur: DUR, beds: [['music', 0, DUR, 0.9, { style: 'day', bpm: 104, key: 0, end: 13.6 }]], events: ev };
      },
    };
  }

  // ======================= #57 5 Signs You Need a Backyard Upgrade =======================
  function signs() {
    const INTRO = 2.2, SD = 4.6, CARD = 2.0, TR = 0.45, PUSH = 0.3, CY = 1000;
    const SG0 = [
      { bg: OR, fg: BLK, num: BLK, txt: 'Your patio furniture lives in the garage.', fix: 'A patio worth sitting on.', hl: 'PATIO', shots: [['c11', 14.95, 2.9]], tr: 'toss' },
      { bg: BLK, fg: WHT, num: OR, txt: 'You host at the park.', fix: 'A backyard everyone comes to.', hl: 'EVERYONE', shots: [['c07', 12.0, 2.9]], tr: 'slices' },
      { bg: PAPER, fg: BLK, num: OR, txt: 'Your grill lives under a tarp.', fix: 'An outdoor kitchen.', hl: 'KITCHEN.', shots: [['c10', 17.0, 2.9]], tr: 'paver' },
      { bg: OR, fg: BLK, num: BLK, txt: 'Your yard is just… grass.', fix: 'A full landscape design.', hl: 'DESIGN.', shots: [['c12', 0.1, 2.9]], tr: 'whip' },
      { bg: BLK, fg: WHT, num: OR, txt: 'You’ve said “next summer” three summers in a row.', fix: 'This is the summer.', hl: 'SUMMER.', shots: [['c05', 4.1, 0.95], ['c09', 10.55, 0.95], ['c07', 24.0, 1.0]], tr: 'glitch', pj: BRAND.short.toUpperCase() + ' PORTFOLIO' },
    ];
    const IN0 = TX('introNum', '5 SIGNS', { label: 'Opening number', group: 'Opening', upper: true, max: 10 });
    const IN1 = TX('intro1', 'YOU NEED A', { label: 'Opening, line 1', group: 'Opening', upper: true, max: 16, hint: 'After “5 SIGNS”' });
    const IN2 = TX('intro2', 'BACKYARD UPGRADE.', { label: 'Opening, line 2 (highlighted)', group: 'Opening', upper: true, max: 18 });
    const SG = SG0.map((s0, k) => { const g = 'Sign ' + (k + 1), n = k + 1;
      const txt = TX(`s${n}sign`, s0.txt, { label: 'The sign', group: g, max: 56 }), fix = TX(`s${n}fix`, s0.fix, { label: 'The fix', group: g, max: 30 });
      const hl = TX(`s${n}hl`, s0.hl, { label: 'Word to highlight in the fix', group: g, upper: true, max: 14 });
      const shots = s0.shots.map(([c, inn, d], j) => { const sh = SHOT(`s${n}shot${j + 1}`, [c, inn], { label: s0.shots.length > 1 ? 'Montage shot ' + (j + 1) : 'Footage for the fix', group: g, kind: 'land', d: d + (k === SG0.length - 1 && j === s0.shots.length - 1 ? 0.5 : 0) }); return [sh[0], sh[1], d]; });
      const pj = TX(`s${n}cap`, s0.pj || projOf(shots[0][0]), { label: 'Caption under the footage', group: g, upper: true, max: 30 });
      return Object.assign({}, s0, { txt, fix, hl, shots, pj }); });
    const OU1 = TX('outro1', 'NODDED AT ONE?', { label: 'Ending, line 1', group: 'Ending', upper: true, max: 18 });
    const OU2 = TX('outro2', 'LET’S DESIGN YOURS.', { label: 'Ending, line 2 (last word highlighted)', group: 'Ending', upper: true, max: 22 });
    const N = SG.length, OUT = INTRO + N * SD, DUR = 30, S0 = k => INTRO + k * SD;
    let prepped = false;
    function prep() { if (prepped) return; prepped = true;
      SG.forEach(s => { let size = 96; for (; size > 60; size -= 2) { s.lines = K3.wrap(s.txt.toUpperCase(), F(900, size, 'Mont'), 950); if (s.lines.length <= 3 && Math.max(...s.lines.map(l => textW(l, F(900, size, 'Mont'), -2))) <= 950) break; } s.size = size;
        let fs = 88; for (; fs > 56; fs -= 2) { s.flines = K3.wrap(s.fix.toUpperCase(), F(900, fs, 'Mont'), 950); if (s.flines.length <= 2 && Math.max(...s.flines.map(l => textW(l, F(900, fs, 'Mont'), -2))) <= 950) break; } s.fsize = fs; });
    }
    function drawCard(k, lt) {
      const s = SG[k]; if (!VID.collecting) fillScreen(s.bg);
      if (VID.collecting) return;
      const c = G(); for (let i = 0; i < N; i++) { c.fillStyle = s.fg === WHT ? 'rgba(255,255,255,0.25)' : 'rgba(11,11,11,0.2)'; c.fillRect(64 + i * 194, 292, 180, 6); if (i <= k) { c.fillStyle = s.fg === WHT ? OR : BLK; c.fillRect(64 + i * 194, 292, i < k ? 180 : 180 * clamp((lt - 0.2) / 0.5), 6); } } D();
      const [snx, sny] = posOf(elP('signnum' + (k + 1)), [64, 360]);
      caps('SIGN 0' + (k + 1) + ' OF 05', snx, sny, 22, clamp((lt - 0.2) / 0.3), 0, { w: 700, fam: 'Mono', ls: 4, align: 'left', col: s.fg, ls0: 0 });
      const p = clamp((lt - PUSH - 0.02) / 0.3), e = E.outBack(p), sc = lerp(1.6, 1, e);
      if (p > 0) { const c2 = G(); c2.globalAlpha = clamp(p * 3); const [bnx, bny] = posOf(elP('bignum' + (k + 1)), [56, 880]); c2.translate(bnx, bny); c2.scale(sc, sc); setF(F(400, 660, 'Bebas'), 0); c2.fillStyle = s.num; c2.textAlign = 'left'; c2.textBaseline = 'alphabetic'; c2.fillText(String(k + 1), 0, 0); D(); }
      const [sgx, sgy] = posOf(elP('sign' + (k + 1)), [64, 1010]);
      slam(s.lines, sgx, sgy, s.size, s.size * 1.04, lt, PUSH + 0.3, { align: 'left', col: s.fg, ls: -2, step: 0.075, s0: 1.12 });
    }
    function fixShot(k, lt, rect) {
      const s = SG[k]; let acc = 0;
      for (let i = 0; i < s.shots.length; i++) { const [c, inn, d] = s.shots[i]; if (lt < acc + d || i === s.shots.length - 1) { const r = bandR(c, CY); play(c, inn, Math.min(lt - acc, d - 0.02), rect || r); return r; } acc += d; }
    }
    function drawFix(k, lt) {
      const s = SG[k]; if (!VID.collecting) fillScreen(BLK);
      const r = fixShot(k, lt);
      if (VID.collecting) return;
      const [flx, fly] = posOf(elP('fixlabel' + (k + 1)), [64, 330]);
      caps('SIGN 0' + (k + 1) + '  ·  THE FIX', flx, fly, 21, 1, 0, { w: 700, fam: 'Mono', ls: 4, align: 'left', col: 'rgba(255,255,255,0.6)', ls0: 0 });
      let hli = s.flines.findIndex(l => l.split(' ').includes(s.hl)), hlw = hli >= 0 ? s.flines[hli].split(' ').indexOf(s.hl) : -1;
      if (hli < 0) { hli = s.flines.findIndex(l => l.split(' ').some(w => w.replace(/[^A-Z0-9’']/g, '') === s.hl.replace(/[^A-Z0-9’']/g, '')));
        hlw = hli >= 0 ? s.flines[hli].split(' ').findIndex(w => w.replace(/[^A-Z0-9’']/g, '') === s.hl.replace(/[^A-Z0-9’']/g, '')) : -1; }
      if (hli < 0) { hli = s.flines.length - 1; hlw = s.flines[hli].split(' ').length - 1; }
      const [fxx, fxy] = posOf(elP('fix' + (k + 1)), [64, 450]);
      slam(s.flines, fxx, fxy, s.fsize, s.fsize * 1.04, lt, 0.05, { align: 'left', col: WHT, ls: -2, step: 0.06, s0: 1.1, hlLine: hli, hlWord: hlw });
      const [cpx, cpy] = posOf(elP('cap' + (k + 1)), [W / 2, r[1] + r[3] + 56]);
      caps(s.pj, cpx, cpy, 21, clamp((lt - 0.3) / 0.4), 0, { w: 700, fam: 'Mono', ls: 5, col: 'rgba(255,255,255,0.75)', maxW: 960 });
    }
    function intro(t) {
      if (!VID.collecting) fillScreen(OR);
      const [i0x, i0y] = posOf(elP('introNum'), [W / 2, 720]);
      K3.words(IN0.split(' '), i0x, i0y, 330, t, 0.1, { fam: 'Bebas', w: 400, col: BLK, step: 0.2, ls: 6, s0: 1.3 });
      const z = Math.min(fit(IN2, 900, 960, 100, 'Mont', -3), fit(IN1, 900, 960, 100, 'Mont', -3)), w2 = IN2.split(' ');
      const [i1x, i1y] = posOf(elP('intro1'), [W / 2, 850]);
      K3.words(IN1.split(' '), i1x, i1y, z, t, 0.55, { col: BLK, step: 0.1 });
      const [i2x, i2y] = posOf(elP('intro2'), [W / 2, 850 + z * 1.1]);
      K3.words(w2, i2x, i2y, z, t, 0.85, { col: BLK, hl: w2.map((_, i) => i), hlCol: BLK, hlText: OR, step: 0.12 });
    }
    function outro(o) {
      const z = Math.min(fit(OU2, 900, 950, 100, 'Mont', -3), fit(OU1, 900, 950, 100, 'Mont', -3)), w2 = OU2.split(' ');
      const [o1x, o1y] = posOf(elP('outro1'), [W / 2, 560]);
      K3.words(OU1.split(' '), o1x, o1y, z, o, 0.1, { step: 0.12 });
      const [o2x, o2y] = posOf(elP('outro2'), [W / 2, 560 + z * 1.12]);
      K3.words(w2, o2x, o2y, z, o, 0.5, { step: 0.12, hl: w2.length - 1 });
      const [lgx, lgy] = posOf(elP('outroLogo'), [W / 2, 830]);
      K3.logoBuild(lgx, lgy, 600, 1.0, o, { speed: 1.4 });
      outroCTA(o, posOf(elP('cta'), [W / 2, 1000])[1], 1.4);
    }
    function elements() {
      const zI = Math.min(fit(IN2, 900, 960, 100, 'Mont', -3), fit(IN1, 900, 960, 100, 'Mont', -3));
      const zO = Math.min(fit(OU2, 900, 950, 100, 'Mont', -3), fit(OU1, 900, 950, 100, 'Mont', -3));
      const i0P = posOf(elP('introNum'), [W / 2, 720]), i1P = posOf(elP('intro1'), [W / 2, 850]), i2P = posOf(elP('intro2'), [W / 2, 850 + zI * 1.1]);
      const o1P = posOf(elP('outro1'), [W / 2, 560]), o2P = posOf(elP('outro2'), [W / 2, 560 + zO * 1.12]);
      const lgP = posOf(elP('outroLogo'), [W / 2, 830]), ctP = posOf(elP('cta'), [W / 2, 1000]);
      const per = SG.map((s, k) => {
        const snP = posOf(elP('signnum' + (k + 1)), [64, 360]), bnP = posOf(elP('bignum' + (k + 1)), [56, 880]);
        const sgP = posOf(elP('sign' + (k + 1)), [64, 1010]), flP = posOf(elP('fixlabel' + (k + 1)), [64, 330]);
        const fxP = posOf(elP('fix' + (k + 1)), [64, 450]);
        const r = bandR(s.shots[0][0], CY), cpP = posOf(elP('cap' + (k + 1)), [W / 2, r[1] + r[3] + 56]);
        return [
          { id: 'signnum' + (k + 1), kind: 'pos', label: 'SIGN 0' + (k + 1) + ' OF 05', x: snP[0], y: snP[1], t0: S0(k) + 0.2, d: CARD - 0.2, box: [snP[0], snP[1] - 40, 300, 60], dup: false, del: false },
          { id: 'bignum' + (k + 1), kind: 'pos', label: String(k + 1), x: bnP[0], y: bnP[1], t0: S0(k) + PUSH + 0.02, d: CARD - PUSH - 0.02, box: [bnP[0] - 60, bnP[1] - 500, 400, 560], dup: false, del: false },
          { id: 'sign' + (k + 1), kind: 'pos', label: s.txt, x: sgP[0], y: sgP[1], t0: S0(k) + PUSH + 0.3, d: CARD - PUSH - 0.3, box: [sgP[0], sgP[1] - 80, 950, 320], dup: false, del: false },
          { id: 'fixlabel' + (k + 1), kind: 'pos', label: 'SIGN 0' + (k + 1) + ' · THE FIX', x: flP[0], y: flP[1], t0: S0(k) + CARD, d: SD - CARD, box: [flP[0], flP[1] - 40, 400, 60], dup: false, del: false },
          { id: 'fix' + (k + 1), kind: 'pos', label: s.fix, x: fxP[0], y: fxP[1], t0: S0(k) + CARD + 0.05, d: SD - CARD - 0.05, box: [fxP[0], fxP[1] - 80, 950, 260], dup: false, del: false },
          { id: 'cap' + (k + 1), kind: 'pos', label: s.pj || 'Caption under the footage', x: cpP[0], y: cpP[1], t0: S0(k) + CARD + 0.3, d: SD - CARD - 0.3, box: [cpP[0] - 470, cpP[1] - 40, 940, 70], dup: false, del: false },
        ];
      }).flat();
      return [
        { id: 'introNum', kind: 'pos', label: IN0, x: i0P[0], y: i0P[1], t0: 0.1, d: INTRO - 0.1, box: [i0P[0] - 470, i0P[1] - 200, 940, 400], dup: false, del: false },
        { id: 'intro1', kind: 'pos', label: IN1, x: i1P[0], y: i1P[1], t0: 0.55, d: INTRO - 0.55, box: [i1P[0] - 470, i1P[1] - 80, 940, 160], dup: false, del: false },
        { id: 'intro2', kind: 'pos', label: IN2, x: i2P[0], y: i2P[1], t0: 0.85, d: INTRO - 0.85, box: [i2P[0] - 470, i2P[1] - 80, 940, 160], dup: false, del: false },
        ...per,
        { id: 'outro1', kind: 'pos', label: OU1, x: o1P[0], y: o1P[1], t0: OUT + 0.1, d: DUR - (OUT + 0.1), box: [o1P[0] - 470, o1P[1] - 80, 940, 160], dup: false, del: false },
        { id: 'outro2', kind: 'pos', label: OU2, x: o2P[0], y: o2P[1], t0: OUT + 0.5, d: DUR - (OUT + 0.5), box: [o2P[0] - 470, o2P[1] - 80, 940, 160], dup: false, del: false },
        { id: 'outroLogo', kind: 'pos', label: 'Logo', x: lgP[0], y: lgP[1], t0: OUT, d: DUR - OUT, box: [lgP[0] - 300, lgP[1] - 60, 600, 120], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: CONTACT.cta, x: ctP[0], y: ctP[1], t0: OUT + 1.4, d: DUR - (OUT + 1.4), box: [ctP[0] - 400, ctP[1] - 45, 800, 90], dup: false, del: false },
      ];
    }
    return {
      dur: DUR, shakes: [[0.1, 8], [0.3, 8]].concat(SG.map((s, k) => [S0(k) + PUSH + 0.32, 12])), elements,
      render(t) {
        prep();
        if (t < INTRO) { intro(t); return; }
        if (t >= OUT) {   // last fix -> blinds open onto the outro
          const o = t - OUT; if (o < 0.5) K4.run('blinds', FULL(), o / 0.5, () => drawFix(N - 1, t - S0(N - 1) - CARD), () => { if (!VID.collecting) fillScreen(BLK); outro(o); }, { n: 9 });
          else { fillScreen(BLK); outro(o); } return;
        }
        const k = Math.min(N - 1, Math.floor((t - INTRO) / SD)), lt = t - S0(k);
        if (lt < PUSH) {   // the next card slides up over the previous fix (or the intro)
          if (k === 0) intro(t); else drawFix(k - 1, t - S0(k - 1) - CARD);
          if (VID.collecting) drawCard(k, lt); else { const cv = K4.into('n2card', () => drawCard(k, lt)), c = K4.GI(); c.drawImage(cv, 0, H * (1 - E.outC(lt / PUSH))); D(); }
        } else if (lt < CARD) drawCard(k, lt);
        else if (lt < CARD + TR) K4.run(SG[k].tr, FULL(), (lt - CARD) / TR, () => drawCard(k, lt), () => drawFix(k, lt - CARD), { t, dir: k % 2 ? -1 : 1, cols: 6, rows: 10, n: 9, border: '#FFFFFF', bw: 18 });
        else drawFix(k, lt - CARD);
      },
      cues() {
        prep();
        const ev = [['impact', 0.1, 0.4, 0], ['impact', 0.3, 0.35, 0], ['snap', 0.55, 0.25, 0], ['snap', 0.65, 0.25, 0], ['snap', 0.75, 0.25, 0], ['impact', 0.85, 0.3, 0], ['impact', 0.97, 0.3, 0]];
        const TRS = { toss: [['air', 0.15, 0.3], ['paper', 0.42, 0.3]], slices: [['whoosh', 0.25, 0.35]], paver: [['clack', 0.1, 0.3], ['clack', 0.2, 0.3], ['clack', 0.3, 0.3]], whip: [['whoosh', 0.22, 0.4]], glitch: [['switch', 0.0, 0.3], ['tick', 0.12, 0.25], ['impact', 0.22, 0.3]] };
        SG.forEach((s, k) => { const t0 = S0(k); ev.push(['whoosh', t0 + 0.12, 0.28, 0]); ev.push(['impact', t0 + PUSH + 0.32, 0.4, 0]);
          s.lines.join(' ').split(' ').forEach((w, i) => ev.push(['snap', t0 + PUSH + 0.3 + i * 0.075, 0.12, (i % 2 ? 0.2 : -0.2)]));
          TRS[s.tr].forEach(([ty, d, g]) => ev.push([ty, t0 + CARD + d, g, 0])); ev.push(['pop', t0 + CARD + TR, 0.22, 0]); });
        ev.push(['whoosh', OUT + 0.2, 0.3, 0]); ev.push(['impact', OUT + 0.55, 0.3, 0]); ev.push(['chime', OUT + 2.1, 0.22, 0]); ev.push(['ticks', OUT + 2.1, 0.14, 0, { dur: 0.8, n: 14 }]);
        return { dur: DUR, beds: [['music', 0, DUR, 0.9, { style: 'pulse', bpm: 122, key: 2, start: 0, end: OUT, hits: [0.1].concat(SG.map((s, k) => S0(k) + PUSH + 0.32)) }]], events: ev };
      },
    };
  }

  // ======================= #59 Turn Your Sound On =======================
  function sound() {
    const T0 = 1.4, SD = 2.1, TI = 0.45, CY = 960;
    const SN = [
      { c: 'c07', in: 15.05, word: 'crackle', pj: 'THE ENTERTAINER', tr: 'iris' },
      { c: 'c03', in: 15.0, word: 'shimmer', pj: 'MODERN POOL RETREAT', full: true, tr: 'liquid' },
      { c: 'c10', in: 17.0, word: 'sizzle', pj: 'TOWNHOME TERRACE', tr: 'whip' },
      { c: 'c09', in: 14.0, word: 'clink', pj: 'STONE OVEN TERRACE', tr: 'iris', clinks: [0.55, 1.2] },
      { c: 'c12', in: 0.1, word: 'hush', pj: 'DUSK PAVILION', tr: 'leak' },
    ];
    const N = SN.length, END = T0 + N * SD, DUR = 15;
    const rectOf = s => s.full ? FULL() : bandR(s.c, CY);
    const drawS = (s, lt) => { if (!s.full && !VID.collecting) { const c = K4.GI(); c.fillStyle = BLK; c.fillRect(0, 0, W, H); D(); } play(s.c, s.in, lt, rectOf(s)); };
    let SZ = null; const szOf = w => (SZ || (SZ = {}))[w] || (SZ[w] = fit(w, 900, 900, 190, 'Mont', 2));
    function speaker(cx, cy, t, a) { if (VID.collecting) return; const c = G(); c.globalAlpha = a; c.fillStyle = WHT; c.beginPath(); c.moveTo(cx - 60, cy - 26); c.lineTo(cx - 30, cy - 26); c.lineTo(cx + 6, cy - 62); c.lineTo(cx + 6, cy + 62); c.lineTo(cx - 30, cy + 26); c.lineTo(cx - 60, cy + 26); c.closePath(); c.fill();
      c.strokeStyle = OR; c.lineWidth = 9; c.lineCap = 'round'; [0, 1, 2].forEach(k => { const p = clamp((t - 0.2 - k * 0.16) / 0.25); if (p <= 0) return; c.globalAlpha = a * p * (0.6 + 0.4 * Math.sin(t * 6 - k)); c.beginPath(); c.arc(cx + 12, cy, 34 + k * 30, -0.75, 0.75); c.stroke(); }); D(); }
    function word(s, lt, t, q) {   // per-letter sound animation
      if (VID.collecting) return; const str = s.word, size = szOf(str), f = F(900, size, 'Mont'), ws = [...str].map(ch => textW(ch, f, 2)), tot = ws.reduce((a, b) => a + b, 0), fr = Math.floor(t * 30);
      let x = W / 2 - tot / 2; const y = s.full ? 520 : Math.min(500, bandR(s.c, CY)[1] - 130), qq = E.inC(clamp(q));
      [...str].forEach((ch, i) => {
        const p = clamp((lt - 0.08 - i * 0.05) / 0.22); if (p <= 0) { x += ws[i]; return; }
        let dx = 0, dy = (1 - E.outBack(p)) * 40, sc = 1, al = clamp(p * 3), col = WHT, glow = 0;
        if (s.word === 'crackle') { const pop = hash(fr * 3.7 + i * 11.3) > 0.82 ? 1 : 0.25; dy += (hash(fr * 1.3 + i * 7.1) - 0.5) * 22 * pop; sc = 1 + 0.08 * pop * hash(fr + i); glow = 30; col = '#FFE7C7'; }
        else if (s.word === 'shimmer') { dy += Math.sin(t * 4.2 - i * 0.7) * 16; al *= 0.75 + 0.25 * Math.sin(t * 6 - i * 1.1); glow = 18; }
        else if (s.word === 'sizzle') { dx = (hash(fr * 5.1 + i * 3.3) - 0.5) * 7; dy += (hash(fr * 2.9 + i * 9.1) - 0.5) * 7; }
        else if (s.word === 'clink') { for (const ck of s.clinks) { const u = (lt - ck - i * 0.03) / 0.35; if (u >= 0 && u < 1) { sc = 1 + 0.28 * (1 - E.outC(u)); dy -= 18 * Math.sin(Math.PI * u); } } }
        else if (s.word === 'hush') { al *= 0.55 + 0.45 * Math.sin(t * 1.8 - i * 0.5); dx = (i - (str.length - 1) / 2) * 6 * Math.min(1, lt / 2); }
        const c = G(); c.globalAlpha = al * (1 - qq); c.translate(x + ws[i] / 2 + dx, y + dy); c.scale(sc, sc); setF(f, 2); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
        if (glow) { c.shadowColor = s.word === 'crackle' ? 'rgba(255,101,0,0.95)' : 'rgba(255,255,255,0.6)'; c.shadowBlur = glow; } else { c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 20; }
        c.fillStyle = col; c.fillText(ch, -ws[i] / 2, 0); D(); x += ws[i];
      });
      if (s.word === 'clink') s.clinks.forEach(ck => { const u = (lt - ck) / 0.4; if (u < 0 || u > 1) return; const c = G(); c.globalAlpha = 1 - u; c.strokeStyle = OR; c.lineWidth = 5; c.lineCap = 'round';
        for (let k = 0; k < 8; k++) { const ang = k / 8 * Math.PI * 2, r0 = 40 + 120 * E.outC(u), r1 = r0 + 40; const cx = W / 2 + tot / 2 + 40, cy = y - size * 0.55; c.beginPath(); c.moveTo(cx + Math.cos(ang) * r0 * 0.5, cy + Math.sin(ang) * r0 * 0.5); c.lineTo(cx + Math.cos(ang) * r1 * 0.5, cy + Math.sin(ang) * r1 * 0.5); c.stroke(); } D(); });
    }
    function introDraw(t) {
      if (!VID.collecting) fillScreen(BLK);
      speaker(W / 2, 600, t, clamp(t / 0.2));
      const z = fit('SOUND ON', 900, 900, 150, 'Mont', -3);
      K3.words(['TURN', 'YOUR'], W / 2, 830, z * 0.62, t, 0.15, { step: 0.12 });
      K3.words(['SOUND', 'ON'], W / 2, 830 + z * 1.0, z, t, 0.4, { step: 0.14, hl: 1 });
      K4.wave(W / 2, 1110, 420, 70 * clamp((t - 0.6) / 0.3), t, 22, 0.9);
    }
    function outro(o) {
      const z = fit('WEEKEND AT HOME.', 900, 950, 96, 'Mont', -3);
      K3.words(['SOUNDS', 'LIKE', 'A'], W / 2, 560, z, o, 0.1, { step: 0.11 });
      K3.words(['WEEKEND', 'AT', 'HOME.'], W / 2, 560 + z * 1.12, z, o, 0.4, { step: 0.11, hl: 2 });
      K3.logoBuild(W / 2, 830, 580, 0.7, o, { speed: 1.6 });
      outroCTA(o, 990, 0.95);
    }
    return {
      dur: DUR, shakes: [],
      render(t) {
        fillScreen(BLK);
        if (t < T0) { introDraw(t); return; }
        if (t < END) {
          const i = Math.min(N - 1, Math.floor((t - T0) / SD)), s = SN[i], lt = t - T0 - i * SD, pv = SN[i - 1];
          const A = i === 0 ? () => introDraw(t) : () => drawS(pv, lt + SD);
          if (lt < TI) K4.run(s.tr, FULL(), lt / TI, A, () => drawS(s, lt), { t, dir: 1, cx: W / 2, cy: i === 0 ? 600 : CY });
          else if (i === N - 1 && lt > SD - 0.5) { drawS(s, lt); fillScreen(BLK, E.inOutS((lt - (SD - 0.5)) / 0.5)); }
          else drawS(s, lt);
          if (s.full) scrim(0, 760, 0.65, 0);
          const q = (lt - (SD - 0.3)) / 0.3;
          word(s, lt, t, q);
          K4.wave(W / 2, s.full ? 600 : Math.min(500, bandR(s.c, CY)[1] - 130) + 88, 440, (s.word === 'hush' ? 26 : 60) * clamp(lt / 0.3) * (1 - clamp(q)), t, 24, 0.9);
          caps('SOUND 0' + (i + 1) + ' / 05', 72, 300, 20, clamp(lt / 0.3), clamp(q), { w: 700, fam: 'Mono', ls: 4, align: 'left', col: OR, ls0: 0, shadow: 'rgba(0,0,0,0.6)' });
          const r = rectOf(s); caps(s.pj, W / 2, s.full ? 1480 : r[1] + r[3] + 60, 21, clamp((lt - 0.3) / 0.4), clamp(q), { w: 700, fam: 'Mono', ls: 5, col: 'rgba(255,255,255,0.8)', shadow: 'rgba(0,0,0,0.7)' });
        } else outro(t - END);
      },
      cues() {
        const S = k => T0 + k * SD, ev = [['switch', 0.25, 0.4, 0], ['pop', 0.45, 0.2, 0], ['pop', 0.6, 0.2, 0]];
        ev.push(['shimmer', S(1) + 0.05, 0.12, 0]);
        SN[3].clinks.forEach(ck => { ev.push(['tink', S(3) + ck, 0.5, 0.15]); ev.push(['chime', S(3) + ck + 0.01, 0.12, 0.15, { f0: 2637 }]); });
        ev.push(['impact', END + 0.45, 0.25, 0]); ev.push(['chime', END + 1.6, 0.22, 0]); ev.push(['ticks', END + 1.6, 0.14, 0, { dur: 0.8, n: 14 }]);
        return { dur: DUR, beds: [['room', 0, DUR, 0.12], ['fire', S(0) - 0.25, S(1) + 0.3, 0.9], ['water', S(1) - 0.25, S(2) + 0.3, 0.9], ['sizzle', S(2) - 0.2, S(3) + 0.3, 0.85],
          ['room', S(3) - 0.5, S(4) + 0.3, 0.6], ['crickets', S(4) - 0.3, END + 1.2, 0.8]], events: ev };
      },
    };
  }

  // ======================= #60 3 Questions to Ask Before You Hire =======================
  function questions() {
    const TITLE = 3.0, QD = 7.0, TEAR = 0.5, INK = LIGHTPAL ? BLK : '#1E1B18', dpg = !!BRAND.parts;
    const QD0 = dpg ? [
      { q: 'Is your license number on everything?', a: 'California requires licensed contractors to put their license number on contracts and ads. Ours: CA Lic. #1073434.', c: 'c10', in: 4.0 },
      { q: 'Who’s my point of contact during the build?', a: 'At DPG, your designer stays your primary point of contact.', c: 'c12', in: 0.3 },
      { q: 'What happens when it’s finished?', a: 'A final walk-through, with manuals and warranties in hand.', c: 'c10', in: 21.0 },
    ] : [
      { q: 'Who’s my point of contact?', a: 'Ask for one person you can reach from start to finish.', c: 'c10', in: 4.0 },
      { q: 'What exactly is included?', a: 'Get it in writing, line by line, before any work starts.', c: 'c12', in: 0.3 },
      { q: 'What if something isn’t right?', a: 'Ask how follow-ups are handled once the job is done.', c: 'c10', in: 21.0 },
    ];
    const H1 = TX('h1', '3 QUESTIONS', { label: 'Title line 1', group: 'Title page', upper: true, max: 14 });
    const H2 = TX('h2', 'TO ASK BEFORE YOU HIRE', { label: 'Title line 2', group: 'Title page', upper: true, max: 26 });
    const H3 = TX('h3', dpg ? 'A LANDSCAPE CONTRACTOR' : 'ANYONE', { label: 'Title line 3 (highlighted)', group: 'Title page', upper: true, max: 26 });
    const NOTE = TX('note', 'save this for later', { label: 'Handwritten note', group: 'Title page', max: 24 });
    const QL = QD0.map((x, k) => { const sh = SHOT('s' + (k + 1), [x.c, x.in], { label: 'Photo for question ' + (k + 1), group: 'Footage', kind: 'land', d: QD - 1.2 });
      return { q: TX('q' + (k + 1), x.q, { label: 'Question ' + (k + 1) + ' (handwritten)', group: 'Question ' + (k + 1), max: 48 }), a: TX('a' + (k + 1), x.a, { label: 'Answer ' + (k + 1) + ' (typed)', group: 'Question ' + (k + 1), max: 120 }), c: sh[0], in: sh[1] }; });
    const O1 = TX('o1', 'ASK US', { label: 'Ending line 1', group: 'Ending', upper: true, max: 12 }), O2 = TX('o2', 'ALL THREE.', { label: 'Ending line 2 (highlighted)', group: 'Ending', upper: true, max: 14 });
    const OUT = TITLE + QL.length * QD, DUR = 30, PR = [140, 600, 800, 450], AF = F(700, 33, 'Mono'), QF = F(700, 66, 'Hand');
    let prepped = false;
    function prep() { if (prepped) return; prepped = true; QL.forEach(x => { x.ql = K3.wrap(x.q, QF, 780); x.al = K3.wrap(x.a, AF, 800); x.alen = x.a.length; }); }
    function page() {   // ruled notepad page with a margin line
      if (VID.collecting) return; fillScreen(PAPER); const c = G();
      c.fillStyle = 'rgba(30,27,24,0.07)'; for (let y = 330; y < H; y += 62) c.fillRect(0, y, W, 2);
      c.fillStyle = ORA(0.5); c.fillRect(118, 250, 2, H); D();
    }
    function binding() {   // spiral binding across the top (stays put while pages tear)
      if (VID.collecting) return; const c = G(); c.fillStyle = BLK; c.fillRect(0, 0, W, 214);
      for (let k = 0; k < 15; k++) { const x = 56 + k * 69; c.fillStyle = '#2A2A2A'; c.beginPath(); c.arc(x, 246, 11, 0, 7); c.fill(); c.strokeStyle = '#9A9A9A'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, 246); c.bezierCurveTo(x - 4, 220, x + 10, 200, x + 6, 180); c.stroke(); }
      D();
    }
    function checkbox(x, y, p, tick) { if (VID.collecting || p <= 0) return; const c = G(); c.globalAlpha = clamp(p * 2); c.strokeStyle = INK; c.lineWidth = 4; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x, y + 2); c.lineTo(x + 50, y); c.lineTo(x + 52, y + 50); c.lineTo(x + 1, y + 51); c.closePath(); c.stroke(); D();
      if (tick > 0) handArrow([[x + 8, y + 24], [x + 22, y + 42], [x + 64, y - 18]], tick, { col: OR, lw: 8 }); }
    function print(x, lt, k) {   // the taped photo
      const [ppx, ppy] = posOf(elP('photo' + (k + 1)), [PR[0], PR[1]]), r = [ppx, ppy, PR[2], PR[3]], inn = x.in + Math.max(0, lt - 1.3);
      const drawB = () => play(x.c, inn, 0, r);
      if (lt < 1.3) return;
      if (lt < 1.9) { K4.run('toss', r, (lt - 1.3) / 0.6, () => {}, drawB, { border: '#FCFBF7', bw: 18, rot0: 0.28, dx0: 700, dy0: 260 }); return; }
      if (!VID.collecting) { const c = G(); c.shadowColor = 'rgba(0,0,0,0.3)'; c.shadowBlur = 24; c.shadowOffsetY = 8; c.fillStyle = '#FCFBF7'; c.fillRect(r[0] - 18, r[1] - 18, r[2] + 36, r[3] + 36); D(); }
      drawB();
      K3.tape(r[0] + 30, r[1] - 12, -0.42, clamp((lt - 1.95) / 0.15)); K3.tape(r[0] + r[2] - 30, r[1] - 12, 0.42, clamp((lt - 2.05) / 0.15));
    }
    function qpage(k, lt) {
      prep(); page(); const x = QL[k];
      const [qnx, qny] = posOf(elP('qnum' + (k + 1)), [150, 330]);
      caps('QUESTION 0' + (k + 1), qnx, qny, 22, clamp((lt - 0.3) / 0.3), 0, { w: 700, fam: 'Mono', ls: 5, align: 'left', col: OR, ls0: 0 });
      const aT = 2.1, cps = 40, aEnd = aT + x.alen / cps, tick = clamp((lt - aEnd - 0.3) / 0.35);
      const [ckx, cky] = posOf(elP('check' + (k + 1)), [150, 392]);
      checkbox(ckx, cky, clamp((lt - 0.45) / 0.2), tick);
      const [qqx, qqy] = posOf(elP('q' + (k + 1)), [226, 440]);
      x.ql.forEach((l, i) => hand(l, qqx, qqy + i * 72, 66, clamp((lt - 0.6 - i * 0.55) / 0.55), { col: INK, shadow: false }));
      print(x, lt, k);
      if (!VID.collecting && lt > aT) { let n = Math.floor((lt - aT) * cps); const c = G(); setF(AF, 0); c.fillStyle = INK; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
        const [anx, any] = posOf(elP('a' + (k + 1)), [140, 1124]);
        x.al.forEach((l, i) => { if (n <= 0) return; const s = l.slice(0, n); c.fillText(s, anx, any + i * 50); if (n < l.length + 1 && n <= l.length) { c.fillStyle = OR; c.fillRect(anx + 2 + textW(s, AF, 0), any - 27 + i * 50, 4, 34); c.fillStyle = INK; } n -= l.length + 1; }); D();
        if (tick > 0) { const li = x.al.length - 1, w = textW(x.al[li], AF, 0); handArrow([[anx, any + 14 + li * 50], [anx + w * 0.5, any + 18 + li * 50], [anx + w + 8, any + 12 + li * 50]], clamp((lt - aEnd - 0.5) / 0.4), { col: OR, lw: 5 }); } }
    }
    function titlePage(t) {
      page(); const z1 = fit(H1, 900, 820, 130, 'Mont', -3), z2 = Math.min(fit(H3, 800, 820, 60, 'Mont', -1), fit(H2, 800, 820, 60, 'Mont', -1)), w3 = H3.split(' ');
      const [h1x, h1y] = posOf(elP('h1'), [150, 480]);
      K3.words(H1.split(' '), h1x, h1y, z1, t, 0.1, { align: 'left', col: INK, step: 0.16 });
      const uw = textW(H1, F(900, z1, 'Mont'), -3); handArrow([[h1x + 2, 508], [h1x + uw * 0.35, 514], [h1x + uw * 0.7, 506], [h1x + uw, 512]], clamp((t - 0.6) / 0.4), { col: OR, lw: 7 });
      const [h2x, h2y] = posOf(elP('h2'), [150, 600]);
      K3.words(H2.split(' '), h2x, h2y, z2, t, 0.5, { align: 'left', col: INK, w: 800, step: 0.08, ls: -1 });
      const [h3x, h3y] = posOf(elP('h3'), [150, 600 + z2 * 1.3]);
      K3.words(w3, h3x, h3y, z2, t, 0.95, { align: 'left', col: INK, w: 800, step: 0.08, ls: -1, hl: w3.map((x, i) => i).filter(i => w3.length < 2 || i > 0), hlText: K5 ? K5.onAcc() : WHT });
      const [ntx, nty] = posOf(elP('note'), [160, 900]);
      hand(NOTE, ntx, nty, 56, clamp((t - 1.5) / 0.6), { col: INK, rot: -0.04, shadow: false });
      handArrow([[590, 884], [700, 868], [800, 920], [870, 1040], [930, 1180]], clamp((t - 2.0) / 0.5), { col: OR, lw: 5, head: 18 });
    }
    function tear(u, drawOld) {   // the old page rips off the binding and falls away
      if (VID.collecting) { drawOld(); return; }
      const cv = K4.into('n2old', drawOld), c = K4.GI(), e = E.inC(clamp(u));
      c.translate(60, 250); c.rotate(-e * 0.55); c.translate(e * -140, e * 1100); c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 40 * (1 - e) + 10; c.globalAlpha = 1 - e * 0.4;
      c.drawImage(cv, 0, 250, W, H - 250, -60, 0, W, H - 250); D();
    }
    function outroPage(o) {
      page(); const z = Math.min(fit(O2, 900, 820, 140, 'Mont', -3), fit(O1, 900, 820, 140, 'Mont', -3)), w2 = O2.split(' ');
      const [o1x, o1y] = posOf(elP('outro1'), [W / 2, 520]);
      K3.words(O1.split(' '), o1x, o1y, z, o, 0.1, { col: INK, step: 0.14 });
      const [o2x, o2y] = posOf(elP('outro2'), [W / 2, 520 + z * 1.08]);
      K3.words(w2, o2x, o2y, z, o, 0.4, { col: INK, step: 0.14, hl: w2.map((x, i) => i), hlText: K5 ? K5.onAcc() : WHT });
      const [lgx, lgy] = posOf(elP('outroLogo'), [W / 2, 800]);
      K3.logoBuild(lgx, lgy, 640, 0.75, o, { img: IMG.logoB, soft: true, speed: 1.3 });
      K3.ctaBlock(o, posOf(elP('cta'), [W / 2, 980])[1], 1.25, 'editorial');
    }
    function elements() {
      const z2 = Math.min(fit(H3, 800, 820, 60, 'Mont', -1), fit(H2, 800, 820, 60, 'Mont', -1));
      const h1P = posOf(elP('h1'), [150, 480]), h2P = posOf(elP('h2'), [150, 600]), h3P = posOf(elP('h3'), [150, 600 + z2 * 1.3]), ntP = posOf(elP('note'), [160, 900]);
      const zO = Math.min(fit(O2, 900, 820, 140, 'Mont', -3), fit(O1, 900, 820, 140, 'Mont', -3));
      const o1P = posOf(elP('outro1'), [W / 2, 520]), o2P = posOf(elP('outro2'), [W / 2, 520 + zO * 1.08]);
      const lgP = posOf(elP('outroLogo'), [W / 2, 800]), ctP = posOf(elP('cta'), [W / 2, 980]);
      const per = QL.map((x, k) => {
        const t0 = TITLE + k * QD;
        const qnP = posOf(elP('qnum' + (k + 1)), [150, 330]), ckP = posOf(elP('check' + (k + 1)), [150, 392]);
        const qqP = posOf(elP('q' + (k + 1)), [226, 440]), phP = posOf(elP('photo' + (k + 1)), [PR[0], PR[1]]);
        const anP = posOf(elP('a' + (k + 1)), [140, 1124]);
        return [
          { id: 'qnum' + (k + 1), kind: 'pos', label: 'QUESTION 0' + (k + 1), x: qnP[0], y: qnP[1], t0: t0 + 0.3, d: QD - 0.3, box: [qnP[0], qnP[1] - 40, 300, 60], dup: false, del: false },
          { id: 'check' + (k + 1), kind: 'box', label: 'Checkbox ' + (k + 1), x: ckP[0], y: ckP[1], w: 52, h: 52, t0: t0 + 0.45, d: QD - 0.45, box: [ckP[0], ckP[1], 52, 52], dup: false, del: false },
          { id: 'q' + (k + 1), kind: 'pos', label: x.q, x: qqP[0], y: qqP[1], t0: t0 + 0.6, d: QD - 0.6, box: [qqP[0], qqP[1] - 70, 780, 260], dup: false, del: false },
          { id: 'photo' + (k + 1), kind: 'box', label: 'Photo ' + (k + 1), x: phP[0], y: phP[1], w: PR[2], h: PR[3], t0: t0 + 1.3, d: QD - 1.3, box: [phP[0], phP[1], PR[2], PR[3]], dup: false, del: false },
          { id: 'a' + (k + 1), kind: 'pos', label: x.a, x: anP[0], y: anP[1], t0: t0 + 2.1, d: QD - 2.1, box: [anP[0], anP[1] - 40, 800, 160], dup: false, del: false },
        ];
      }).flat();
      return [
        { id: 'h1', kind: 'pos', label: H1, x: h1P[0], y: h1P[1], t0: 0.1, d: TITLE - 0.1, box: [h1P[0], h1P[1] - 100, 820, 200], dup: false, del: false },
        { id: 'h2', kind: 'pos', label: H2, x: h2P[0], y: h2P[1], t0: 0.5, d: TITLE - 0.5, box: [h2P[0], h2P[1] - 60, 820, 120], dup: false, del: false },
        { id: 'h3', kind: 'pos', label: H3, x: h3P[0], y: h3P[1], t0: 0.95, d: TITLE - 0.95, box: [h3P[0], h3P[1] - 60, 820, 120], dup: false, del: false },
        { id: 'note', kind: 'pos', label: NOTE, x: ntP[0], y: ntP[1], t0: 1.5, d: TITLE - 1.5, box: [ntP[0], ntP[1] - 60, 500, 120], dup: false, del: false },
        ...per,
        { id: 'outro1', kind: 'pos', label: O1, x: o1P[0], y: o1P[1], t0: OUT + 0.1, d: DUR - (OUT + 0.1), box: [o1P[0] - 470, o1P[1] - 100, 940, 200], dup: false, del: false },
        { id: 'outro2', kind: 'pos', label: O2, x: o2P[0], y: o2P[1], t0: OUT + 0.4, d: DUR - (OUT + 0.4), box: [o2P[0] - 470, o2P[1] - 100, 940, 200], dup: false, del: false },
        { id: 'outroLogo', kind: 'pos', label: 'Logo', x: lgP[0], y: lgP[1], t0: OUT, d: DUR - OUT, box: [lgP[0] - 320, lgP[1] - 60, 640, 120], dup: false, del: false },
        { id: 'cta', kind: 'pos', label: CONTACT.cta, x: ctP[0], y: ctP[1], t0: OUT + 1.25, d: DUR - (OUT + 1.25), box: [ctP[0] - 400, ctP[1] - 45, 800, 90], dup: false, del: false },
      ];
    }
    const pageAt = (t) => t < TITLE ? (() => titlePage(t)) : t < OUT ? (() => { const k = Math.floor((t - TITLE) / QD); qpage(k, t - TITLE - k * QD); }) : (() => outroPage(t - OUT));
    return {
      dur: DUR, shakes: [], elements,
      render(t) {
        const starts = [TITLE, TITLE + QD, TITLE + 2 * QD, OUT];
        const s = starts.find(x => t >= x && t < x + TEAR);
        if (s !== undefined) { pageAt(t)(); const told = s - 0.0001; tear((t - s) / TEAR, () => { const tt = t; (told < TITLE ? () => titlePage(tt) : told < OUT ? () => { const k = Math.floor((told - TITLE) / QD); qpage(k, tt - TITLE - k * QD); } : () => outroPage(tt - OUT))(); }); }
        else pageAt(t)();
        binding();
      },
      cues() {
        prep();
        const ev = [['impact', 0.12, 0.3, 0], ['snap', 0.28, 0.2, 0], ['pencil', 0.6, 0.3, 0, {}], ['scribble', 1.5, 0.22, 0.2, { dur: 0.6 }], ['pencil', 2.0, 0.22, 0.3, {}]];
        QL.forEach((x, k) => { const t0 = TITLE + k * QD, aEnd = 2.1 + x.a.length / 40; ev.push(['paper', t0 + 0.1, 0.4, 0]); ev.push(['scribble', t0 + 0.6, 0.22, -0.2, { dur: Math.min(1.6, 0.55 * x.ql.length + 0.3) }]);
          ev.push(['air', t0 + 1.4, 0.25, 0.4]); ev.push(['paper', t0 + 1.85, 0.25, 0]); ev.push(['ticks', t0 + 2.1, 0.08, 0.1, { dur: aEnd - 2.1, n: Math.round(x.a.length / 2) }]);
          ev.push(['pencil', t0 + aEnd + 0.3, 0.32, -0.3, {}]); ev.push(['tink', t0 + aEnd + 0.6, 0.12, -0.3]); });
        ev.push(['paper', OUT + 0.1, 0.4, 0]); ev.push(['impact', OUT + 0.45, 0.25, 0]); ev.push(['chime', OUT + 2.0, 0.22, 0]); ev.push(['ticks', OUT + 2.3, 0.14, 0, { dur: 0.8, n: 14 }]);
        return { dur: DUR, beds: [['music', 0, DUR, 0.9, { style: 'sketch', bpm: 100, key: 0, end: OUT }]], events: ev };
      },
    };
  }

  const P = V === 'listed' ? listed() : V === 'signs' ? signs() : V === 'sound' ? sound() : V === 'questions' ? questions() : chat();
  const fin = V === 'questions' ? { vig: 0.05, grain: 0.1 } : { vig: 0.22, grain: 0.18 };
  DIR = { dur: P.dur, bg: V === 'questions' ? PAPER : BLK, finish: fin, edl: [], shakes: P.shakes, preload: () => K3.init(), render: P.render, cues: P.cues, ...(P.elements ? { elements: P.elements } : {}) };
});
