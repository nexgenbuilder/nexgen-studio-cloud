'use strict';
/* NexGen Studio V29-V30 (Nov 18): the website showcase formats, for showing businesses with no website or an old one, and
   the site you built them. Every word is a field; names, towns, addresses and notes are placeholders to replace.
   Website footage is either a full-page screenshot (it scrolls top to bottom) or a screen recording (it plays as is).
   ?v=drop / droplap / dropfull   Website Drop (phone / laptop / full-screen recording below the business)
   ?v=glow      Website Glow-Up    their old site in a device with red notes, a shine wipe, the new site with green notes
   ?v=oldnew    Old vs New         their site now (top) against what you built (bottom), both scrolling, notes on each
   ?v=nosite    No Website Found   a search types their name, their listing shows no website, then the site you built rises */
STUDIO_REG['site'] = (() => {
  const V = QS.get('v') || 'drop';
  // Per-element model: tpl_free sets window.__NX_BLOCK_EL to the block's `el` data before calling this
  // factory; positions below fall back to the original hardcoded values when EL is null, so rendering
  // is byte-for-byte the old path. (Same pattern as tpl_trade.js / tpl_nx9.js.)
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const cl = (v, a, b) => Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v));
  const NONE = k => ['nofoot.' + k, 0];
  const up = { upper: true };
  const TXU = (k, d, label, group, max) => TX(k, d, Object.assign({ label, group, max }, up));
  const TXL = (k, d, label, group, max) => TX(k, d, { label, group, max });
  const lum = h => { const n = parseInt(h.slice(1, 7), 16); return (0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255)) / 255; };
  const onAcc = () => (lum(OR) > 0.62 ? '#111111' : '#FFFFFF');
  const RED = '#E5252F', GRN = '#22B35E';
  function tx(s, x, y, size, wt, col, align, ls) { if (!s) return 0; setF(F(wt, size, 'Mont'), ls || 0); ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = col; ctx.fillText(s, x, y); return ctx.measureText(s).width; }
  const tw = (s, size, wt, ls) => { setF(F(wt, size, 'Mont'), ls || 0); return ctx.measureText(s).width; };
  const fit = (s, wt, maxW, maxS, ls) => Math.min(maxS, fitSize(s || ' ', wt, maxW, maxS, 'Mont', ls || 0));
  const ar = c => { const r = K3.wholeIn(c, [0, 0, 1000, 1000]); return r[2] / r[3]; };
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
  const LENF = def => +TX('len', def, { label: 'Length', group: 'Timing', options: ['12', '16', '20'].map(v => ({ value: v, label: v + ' seconds' })) }) || +def;
  const DEVF = (key, def, label, full) => TX(key, def, { label, group: 'Website', options: [{ value: 'phone', label: 'A phone' }, { value: 'laptop', label: 'A laptop' }].concat(full ? [{ value: 'full', label: 'Full screen (no device)' }] : []) });
  const MODEF = (key, label) => TX(key, 'scroll', { label, group: 'Website', options: [{ value: 'scroll', label: 'A full-page screenshot (scrolls)' }, { value: 'play', label: 'A screen recording (plays)' }] });
  const C = () => VID.collecting;

  // ------------------------------------------------ shared pieces
  // footage whole inside rect r over a dark blurred fill of itself
  function wholeBlur(s, lt, r, dim) {
    ctx.save(); ctx.beginPath(); ctx.rect(r[0], r[1], r[2], r[3]); ctx.clip();
    if (!C()) ctx.filter = 'blur(34px) brightness(' + (dim === undefined ? 0.5 : dim) + ')'; K3.clip(s[0], s[1], lt, [r[0] - 60, r[1] - 60, r[2] + 120, r[3] + 120]); if (!C()) ctx.filter = 'none';
    K3.clip(s[0], s[1], lt, K3.wholeIn(s[0], r)); ctx.restore();
  }
  // a device in box b (center x, top y, max w, max h): returns {screen:[x,y,w,h], urlH, kind}
  function device(kind, cx, top, maxW, maxH) {
    if (kind === 'phone') { const h = Math.min(maxH, maxW * 1.9), w = h / 1.9; return { kind, screen: [cx - w / 2 + 20, top + 20, w - 40, h - 40], urlH: Math.round(h * 0.08) }; }
    if (kind === 'laptop') { const w = Math.min(maxW, (maxH - 60) * 1.62), h = w / 1.62; return { kind, screen: [cx - w / 2 + 22, top + 22, w - 44, h - 44], urlH: Math.round(h * 0.09) }; }
    return { kind: 'full', screen: [cx - maxW / 2, top, maxW, maxH], urlH: 0 };
  }
  function frame(d, a) {
    if (C() || d.kind === 'full' || a <= 0) return; const [x, y, w, h] = d.screen; ctx.save(); ctx.globalAlpha = a;
    if (d.kind === 'phone') { ctx.fillStyle = '#0B0B0E'; rr(x - 20, y - 20, w + 40, h + 40, 70); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 4; rr(x - 20, y - 20, w + 40, h + 40, 70); ctx.stroke(); }
    else { ctx.fillStyle = '#0B0B0E'; rr(x - 22, y - 22, w + 44, h + 44, 24); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 3; rr(x - 22, y - 22, w + 44, h + 44, 24); ctx.stroke();
      ctx.fillStyle = '#2A2A30'; ctx.beginPath(); ctx.moveTo(x - 80, y + h + 22); ctx.lineTo(x + w + 80, y + h + 22); ctx.lineTo(x + w + 40, y + h + 58); ctx.lineTo(x - 40, y + h + 58); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  // the website inside a device's screen. p = scroll progress 0..1 (screenshots), lt = playback time (recordings)
  function site(d, s, mode, p, lt, a, url, urlT, empty) {
    const [x, y, w, h] = d.screen, uh = d.urlH, vy = y + uh, vh = h - uh;
    ctx.save(); if (!C()) ctx.globalAlpha = a; ctx.beginPath(); ctx.roundRect(x, y, w, h, d.kind === 'phone' ? 48 : d.kind === 'laptop' ? 8 : 0); ctx.clip();
    if (!C()) { ctx.fillStyle = d.kind === 'full' ? BLK : '#FFFFFF'; ctx.fillRect(x, y, w, h); }
    if (empty) { /* the screen before the site appears */ }
    else if (mode === 'scroll') { const ih = w / ar(s[0]), span = Math.max(0, ih - vh); K3.clip(s[0], s[1], 0, [x, ih < vh ? vy + (vh - ih) / 2 : vy - span * E.inOutS(cl(p)), w, ih]); }
    else if (d.kind === 'full') wholeBlur(s, lt, [x, vy, w, vh], 0.45);
    else K3.clip(s[0], s[1], lt, K3.wholeIn(s[0], [x, vy, w, vh]));
    if (!C() && uh > 0) { ctx.fillStyle = '#F1F2F5'; ctx.fillRect(x, y, w, uh); ctx.fillStyle = '#FFFFFF'; rr(x + 16, y + uh * 0.2, w - 32, uh * 0.6, uh * 0.3); ctx.fill();
      ctx.fillStyle = '#9A9CA3'; rr(x + 34, y + uh / 2 - 4, 16, 12, 3); ctx.fill(); ctx.strokeStyle = '#9A9CA3'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + 42, y + uh / 2 - 4, 5, Math.PI, 0); ctx.stroke();
      const n = urlT === undefined ? url.length : Math.floor(cl(urlT / 0.9) * url.length), cur = empty && urlT > 0 && Math.floor(urlT * 3) % 2 === 0 ? '|' : ''; tx(url.slice(0, n) + cur, x + 64, y + uh / 2 + 9, fit(url, 600, w - 110, Math.min(26, uh * 0.36)), 600, '#222', 'left'); }
    if (!C() && d.kind === 'phone') { ctx.fillStyle = '#0B0B0E'; rr(x + w / 2 - 66, y - 2, 132, 24, 12); ctx.fill(); }
    ctx.restore();
  }
  function buildBar(d, p, a, label) {
    if (C() || a <= 0) return; const [x, y, w, h] = d.screen, cy = y + d.urlH + (h - d.urlH) / 2, bw = w - 120; ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = d.kind === 'full' ? BLK : '#FFFFFF'; ctx.fillRect(x, y + d.urlH, w, h - d.urlH); const ink = d.kind === 'full' ? WHT : '#222';
    tx(label, x + w / 2, cy - 30, fit(label, 700, w - 80, 30), 700, ink, 'center'); ctx.fillStyle = d.kind === 'full' ? 'rgba(255,255,255,0.15)' : '#E6E7EB'; rr(x + 60, cy, bw, 16, 8); ctx.fill();
    ctx.fillStyle = OR; rr(x + 60, cy, Math.max(16, bw * p), 16, 8); ctx.fill(); tx(Math.round(p * 100) + '%', x + w / 2, cy + 58, 26, 800, ink, 'center'); ctx.restore();
  }
  function stamp(s, x, y, k, a, col, rot, maxS) {
    if (C() || a <= 0 || !s) return; const sc = 2.2 - 1.2 * E.outC(cl(k)); ctx.save(); ctx.globalAlpha = Math.min(1, cl(k) * 2) * a; ctx.translate(x, y); ctx.rotate(rot === undefined ? -0.16 : rot); ctx.scale(sc, sc);
    const sz = fit(s, 900, 700, maxS || 120, 6), w = tw(s, sz, 900, 6); ctx.strokeStyle = col; ctx.lineWidth = 12; rr(-w / 2 - 40, -sz * 0.95, w + 80, sz * 1.3, 18); ctx.stroke(); ctx.fillStyle = rgbaOf(col, 0.12); ctx.fill(); tx(s, 0, sz * 0.18, sz, 900, col, 'center', 6); ctx.restore();
  }
  function chip(s, x, y, good, a, align) {   // a ✓ / ✗ note
    if (C() || a <= 0 || !s) return; const sz = 34, w = tw(s, sz, 800, 1) + 96, x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x; ctx.save(); ctx.globalAlpha = a; ctx.translate((1 - E.outC(a)) * (align === 'right' ? 60 : -60), 0);
    ctx.fillStyle = 'rgba(12,12,16,0.82)'; rr(x0, y, w, 64, 32); ctx.fill(); ctx.fillStyle = good ? GRN : RED; ctx.beginPath(); ctx.arc(x0 + 34, y + 32, 20, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
    if (good) { ctx.moveTo(x0 + 24, y + 33); ctx.lineTo(x0 + 31, y + 40); ctx.lineTo(x0 + 45, y + 24); } else { ctx.moveTo(x0 + 27, y + 25); ctx.lineTo(x0 + 41, y + 39); ctx.moveTo(x0 + 41, y + 25); ctx.lineTo(x0 + 27, y + 39); } ctx.stroke();
    tx(s, x0 + 68, y + 44, sz, 800, '#FFFFFF', 'left', 1); ctx.restore();
  }
  function pill(s, x, y, size, bg, fg, a, align) { if (C() || a <= 0 || !s) return 0; const w = tw(s, size, 800, 3) + size * 1.4, h = size * 1.9, x0 = align === 'center' ? x - w / 2 : x; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = bg; rr(x0, y, w, h, h / 2); ctx.fill(); tx(s, x0 + size * 0.7, y + h * 0.66, size, 800, fg, 'left', 3); ctx.restore(); return w; }
  function band(s, y, h, u, t) { if (C() || u <= 0) return; ctx.fillStyle = OR; ctx.fillRect(0, y, W * u, h); if (u > 0.6) { const sz = fit(s, 900, 860, h * 0.5, 2); tx(s, 60, y + h / 2 + sz * 0.36, sz, 900, onAcc(), 'left', 2);
    const ax = W - 90, ay = y + h / 2 - 6 + 6 * Math.sin(t * 5); ctx.fillStyle = onAcc(); ctx.beginPath(); ctx.moveTo(ax - 22, ay - 10); ctx.lineTo(ax + 22, ay - 10); ctx.lineTo(ax, ay + 18); ctx.closePath(); ctx.fill(); } }
  // the ending card over region [y0, y1]; c1/c2 optionally move the line / button
  function ending(t, t0, y0, y1, l1, l2, c1, c2) {
    const e = cl((t - t0) / 0.4); if (C() || e <= 0) return; const a = E.outC(e), mid = (y0 + y1) / 2; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = rgbaOf(BLK, 0.86); ctx.fillRect(0, y0, W, y1 - y0);
    drawLogo(LIGHTPAL ? 'b' : 'w', W / 2, mid - 140, 520, cl((t - t0 - 0.1) / 0.6)); const s1 = fit(l1, 900, 940, 60);
    const [c1x, c1y] = c1 || [W / 2, mid + 100], [c2x, c2y] = c2 || [W / 2, mid + 220];
    tx(l1, c1x, c1y, s1, 900, WHT, 'center', 1);
    const s2 = fit(l2, 900, 700, 54, 2), bw = tw(l2, s2, 900, 2) + 90, pu = 1 + 0.03 * Math.sin(t * 6); ctx.translate(c2x, c2y); ctx.scale(pu, pu); ctx.fillStyle = OR; rr(-bw / 2, -50, bw, 100, 50); ctx.fill(); tx(l2, 0, s2 * 0.36, s2, 900, onAcc(), 'center', 2); ctx.restore();
  }
  const CTAF = () => [TXU('cta1', 'WANT ONE FOR YOUR BUSINESS?', 'Ending line', 'Call to action', 30), TXU('cta2', 'DM “WEBSITE”', 'Ending button', 'Call to action', 22)];
  const glowBg = y0 => { if (C()) return; ctx.fillStyle = BLK; ctx.fillRect(0, y0, W, H - y0); const g2 = ctx.createRadialGradient(W / 2, (y0 + H) / 2, 80, W / 2, (y0 + H) / 2, 800); g2.addColorStop(0, rgbaOf(OR, 0.22)); g2.addColorStop(1, rgbaOf(OR, 0)); ctx.fillStyle = g2; ctx.fillRect(0, y0, W, H - y0); };

  // ============================================ WEBSITE DROP
  function drop() {
    const LEN = LENF('16'), DEV = DEVF('device', V === 'droplap' ? 'laptop' : V === 'dropfull' ? 'full' : 'phone', 'Show the site on', true), MODE = MODEF('sitemode', 'Website footage is');
    const BIZ = SHOT('biz', NONE('biz'), { label: 'The business (storefront clip or photo)', group: 'Footage', kind: 'any', d: 3.4 });
    const SITE = SHOT('site', NONE('site'), { label: 'The website (screenshot or recording)', group: 'Footage', kind: DEV === 'phone' ? 'vert' : 'any', d: LEN });
    const SERIES = TXU('series', 'WEBSITE OF THE DAY', 'Series name', 'Series', 24), DAY = TXU('day', 'DAY 1', 'Episode', 'Series', 10);
    const NAME = TXU('biz_name', 'BUSINESS NAME', 'Business name', 'The business', 26), WHERE = TXL('biz_where', 'Town · what they do', 'Town and trade', 'The business', 34);
    const STAMP = TXU('stamp', 'NO WEBSITE', 'Stamp', 'The business', 14), BAND = TXU('band', 'SO WE BUILT THEM ONE', 'Band', 'The business', 26);
    const URL = TXL('url', 'theirbusiness.com', 'Website address', 'Website', 30), BUILD = TXL('building', 'Building the website…', 'Build line', 'Website', 30), [CTA1, CTA2] = CTAF();
    const DUR = LEN, T_ST = 0.9, T_BAND = 1.7, T_URL = 2.0, T_BUILD = 2.7, T_SITE = 3.6, T_END = DUR - 2.0;
    const d = DEV === 'full' ? device('full', W / 2, 988, W, H - 988) : DEV === 'laptop' ? device('laptop', W / 2, 1060, 932, 700) : device('phone', W / 2, 1008, 500, 900);
    { const dp = posOf(elP('device'), [d.screen[0], d.screen[1]]); d.screen = [dp[0], dp[1], d.screen[2], d.screen[3]]; }
    function elements() {
      const seP = posOf(elP('series'), [48, 56]), w1 = textW(SERIES, F(800, 30, 'Mont'), 3) + 42;
      const daP = posOf(elP('day'), [seP[0] + w1 + 12, seP[1]]), daW = textW(DAY, F(800, 30, 'Mont'), 3) + 42;
      const nmP = posOf(elP('name'), [60, 790]), whP = posOf(elP('where'), [62, 846]), stP = posOf(elP('stamp'), [W / 2, 420]);
      const baP = posOf(elP('band'), [0, 880]), dvP = posOf(elP('device'), [d.screen[0], d.screen[1]]);
      const bbP = posOf(elP('buildbar'), [d.screen[0], d.screen[1] + d.urlH]);
      const c1P = posOf(elP('cta1'), [W / 2, 540]), c2P = posOf(elP('cta2'), [W / 2, 660]);
      return [
        { id: 'series', kind: 'pos', label: SERIES, x: seP[0], y: seP[1], t0: 0.15, d: T_END - 0.15, box: [seP[0], seP[1], w1, 57], dup: false, del: false },
        { id: 'day', kind: 'pos', label: DAY, x: daP[0], y: daP[1], t0: 0.15, d: T_END - 0.15, box: [daP[0], daP[1], daW, 57], dup: false, del: false },
        { id: 'name', kind: 'pos', label: NAME, x: nmP[0], y: nmP[1], t0: 0.35, d: T_END - 0.35, box: [nmP[0], nmP[1] - 84, 960, 100], dup: false, del: false },
        { id: 'where', kind: 'pos', label: WHERE, x: whP[0], y: whP[1], t0: 0.6, d: T_END - 0.6, box: [whP[0], whP[1] - 38, 960, 50], dup: false, del: false },
        { id: 'stamp', kind: 'pos', label: STAMP, x: stP[0], y: stP[1], t0: T_ST, d: T_END - T_ST, box: [stP[0] - 360, stP[1] - 90, 720, 180], dup: false, del: false },
        { id: 'band', kind: 'box', label: BAND, x: baP[0], y: baP[1], w: W, h: 108, t0: T_BAND, d: DUR - T_BAND, box: [baP[0], baP[1], W, 108], dup: false, del: false },
        { id: 'device', kind: 'box', label: 'Website device', x: dvP[0], y: dvP[1], w: d.screen[2], h: d.screen[3], t0: T_BAND + 0.2, d: DUR - (T_BAND + 0.2), box: [dvP[0], dvP[1], d.screen[2], d.screen[3]], dup: false, del: false },
        { id: 'buildbar', kind: 'box', label: BUILD, x: bbP[0], y: bbP[1], w: d.screen[2], h: d.screen[3] - d.urlH, t0: T_BUILD, d: T_SITE + 0.3 - T_BUILD, box: [bbP[0], bbP[1], d.screen[2], d.screen[3] - d.urlH], dup: false, del: false },
        { id: 'cta1', kind: 'pos', label: CTA1, x: c1P[0], y: c1P[1], t0: T_END, d: DUR - T_END, box: [c1P[0] - 470, c1P[1] - 60, 940, 70], dup: false, del: false },
        { id: 'cta2', kind: 'pos', label: CTA2, x: c2P[0], y: c2P[1], t0: T_END, d: DUR - T_END, box: [c2P[0] - 400, c2P[1] - 50, 800, 100], dup: false, del: false },
      ];
    }
    function render(t) {
      wholeBlur(BIZ, t, [0, 0, W, 880]);
      if (!C()) { const gr = ctx.createLinearGradient(0, 520, 0, 880); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.75)'); ctx.fillStyle = gr; ctx.fillRect(0, 520, W, 360); }
      glowBg(880);
      const fa = E.outC(cl((t - T_BAND - 0.2) / 0.5)); frame(d, fa);
      if (t > T_SITE) site(d, SITE, MODE, (t - T_SITE - 0.9) / Math.max(0.5, T_END - T_SITE - 1.4), Math.max(0, t - T_SITE), fa * E.outC(cl((t - T_SITE) / 0.45)) + (1 - E.outC(cl((t - T_SITE) / 0.45))) * 0, URL, t - T_URL);
      if (t <= T_SITE + 0.45 && fa > 0) site(d, SITE, MODE, 0, 0, fa * (1 - E.outC(cl((t - T_SITE) / 0.45))), URL, t - T_URL, true);
      if (t > T_BUILD && t < T_SITE + 0.3) { const bbP = posOf(elP('buildbar'), [d.screen[0], d.screen[1] + d.urlH]);
        buildBar({ kind: d.kind, screen: [bbP[0], bbP[1] - d.urlH, d.screen[2], d.screen[3]], urlH: d.urlH }, E.inOutS(cl((t - T_BUILD) / (T_SITE - T_BUILD))), (1 - cl((t - T_SITE) / 0.3)) * fa, BUILD); }
      if (C()) return; const endA = cl((t - T_END) / 0.4);
      { const a = E.outC(cl((t - 0.15) / 0.4)) * (1 - endA), [sx, sy] = posOf(elP('series'), [48, 56]), w1 = pill(SERIES, sx, sy, 30, OR, onAcc(), a), [dx2, dy2] = posOf(elP('day'), [sx + w1 + 12, sy]); pill(DAY, dx2, dy2, 30, '#FFFFFF', '#111', a); }
      const [nx, ny] = posOf(elP('name'), [60, 790]);
      T(NAME, nx, ny, F(900, fit(NAME, 900, 960, 84), 'Mont'), { p: cl((t - 0.35) / 0.45), q: endA, col: '#FFFFFF', shadow: ['rgba(0,0,0,0.6)', 18, 4] });
      const [wx2, wy2] = posOf(elP('where'), [62, 846]);
      T(WHERE, wx2, wy2, F(600, fit(WHERE, 600, 960, 38), 'Mont'), { p: cl((t - 0.6) / 0.45), q: endA, col: 'rgba(255,255,255,0.85)', mode: 'fade' });
      const [stx, sty] = posOf(elP('stamp'), [W / 2, 420]);
      if (t > T_ST) stamp(STAMP, stx, sty, (t - T_ST) / 0.22, 1 - cl((t - T_END) / 0.4), RED);
      band(BAND, posOf(elP('band'), [0, 880])[1], 108, E.outC(cl((t - T_BAND) / 0.45)), t);
      ending(t, T_END, 0, 880, CTA1, CTA2, posOf(elP('cta1'), [W / 2, 540]), posOf(elP('cta2'), [W / 2, 660]));
    }
    const cues = () => ({ dur: DUR, beds: [['bed', 0, DUR, 0.75, { style: 'day', end: DUR }]], events: [['pop', 0.2, 0.3, -0.3], ['stamp', T_ST + 0.1, 0.5, 0], ['impact', T_ST + 0.12, 0.3, 0], ['whoosh', T_BAND, 0.3, 0.3], ['ticks', T_URL, 0.22, 0, { dur: 0.9, n: Math.min(14, URL.length) }], ['riser', T_SITE, 0.25, 0], ['pop', T_SITE, 0.35, 0], ['swish', T_SITE + 0.9, 0.25, 0.2], ['chime', T_END + 0.1, 0.35, 0], ['pop', T_END + 0.5, 0.3, 0.2]] });
    return { dur: DUR, render, cues, shakes: [[T_ST + 0.18, 7]], elements };
  }

  // ============================================ WEBSITE GLOW-UP
  function glow() {
    const LEN = LENF('16'), DEV = DEVF('device', 'phone', 'Show the sites on', false), MODE_O = MODEF('oldmode', 'Old site footage is'), MODE_N = MODEF('sitemode', 'New site footage is');
    const OLD = SHOT('old', NONE('old'), { label: 'Their old website', group: 'Footage', kind: DEV === 'phone' ? 'vert' : 'any', d: 5 }), NEW = SHOT('site', NONE('site'), { label: 'The new website', group: 'Footage', kind: DEV === 'phone' ? 'vert' : 'any', d: LEN });
    const HEAD = TXU('head', 'WEBSITE GLOW-UP', 'Headline', 'Words', 20), NAME = TXU('biz_name', 'BUSINESS NAME', 'Business name', 'Words', 26), URL = TXL('url', 'theirbusiness.com', 'Website address', 'Words', 30);
    const BAD = [1, 2, 3].map(i => TXL('bad' + i, ['Not built for phones', 'Hard to find the number', 'Last updated years ago'][i - 1], 'Before note ' + i, 'Before (red X)', 26));
    const GOOD = [1, 2, 3].map(i => TXL('good' + i, ['Fast on every phone', 'Tap to call, up top', 'Fresh, clear and current'][i - 1], 'After note ' + i, 'After (green check)', 26));
    const BEF = TXU('before', 'BEFORE', 'Before stamp', 'Words', 10), AFT = TXU('after', 'AFTER', 'After stamp', 'Words', 10), [CTA1, CTA2] = CTAF();
    const DUR = LEN, T_SW = 5.2, T_END = DUR - 2.0;
    const d = DEV === 'laptop' ? device('laptop', W / 2, 520, 980, 760) : device('phone', W / 2, 330, 640, 1220);
    { const dp = posOf(elP('device'), [d.screen[0], d.screen[1]]); d.screen = [dp[0], dp[1], d.screen[2], d.screen[3]]; }
    const sideX = DEV === 'laptop' ? W / 2 : W - 60, al = DEV === 'laptop' ? 'center' : 'right', y0 = DEV === 'laptop' ? 1240 : 1600;
    const stP0 = [DEV === 'laptop' ? W / 2 : 250, DEV === 'laptop' ? 400 : 560];
    function elements() {
      const heP = posOf(elP('head'), [W / 2, 130]), nmP = posOf(elP('name'), [W / 2, 200]), stP = posOf(elP('stamp'), stP0);
      const dvP = posOf(elP('device'), [d.screen[0], d.screen[1]]);
      const c1P = posOf(elP('cta1'), [W / 2, 1060]), c2P = posOf(elP('cta2'), [W / 2, 1180]);
      const notes = [0, 1, 2].map(i => { const np = posOf(elP('note' + (i + 1)), [sideX, y0 + i * 84]);
        const wEst = Math.max(textW(BAD[i], F(800, 34, 'Mont'), 1), textW(GOOD[i], F(800, 34, 'Mont'), 1)) + 96;
        const x0 = al === 'center' ? np[0] - wEst / 2 : np[0] - wEst;
        return { id: 'note' + (i + 1), kind: 'pos', label: BAD[i] + ' / ' + GOOD[i], x: np[0], y: np[1], t0: 1.6 + i * 0.9, d: T_END - (1.6 + i * 0.9), box: [x0, np[1], wEst, 64], dup: false, del: false }; });
      return [
        { id: 'head', kind: 'pos', label: HEAD, x: heP[0], y: heP[1], t0: 0.1, d: T_END - 0.1, box: [heP[0] - 480, heP[1] - 80, 960, 90], dup: false, del: false },
        { id: 'name', kind: 'pos', label: NAME, x: nmP[0], y: nmP[1], t0: 0.4, d: T_END - 0.4, box: [nmP[0] - 450, nmP[1] - 40, 900, 50], dup: false, del: false },
        { id: 'stamp', kind: 'pos', label: BEF + ' / ' + AFT, x: stP[0], y: stP[1], t0: 0.6, d: T_END - 0.6, box: [stP[0] - 350, stP[1] - 70, 700, 140], dup: false, del: false },
        ...notes,
        { id: 'device', kind: 'box', label: 'Website device', x: dvP[0], y: dvP[1], w: d.screen[2], h: d.screen[3], t0: 0, d: DUR, box: [dvP[0], dvP[1], d.screen[2], d.screen[3]], dup: false, del: false },
        { id: 'cta1', kind: 'pos', label: CTA1, x: c1P[0], y: c1P[1], t0: T_END, d: DUR - T_END, box: [c1P[0] - 470, c1P[1] - 60, 940, 70], dup: false, del: false },
        { id: 'cta2', kind: 'pos', label: CTA2, x: c2P[0], y: c2P[1], t0: T_END, d: DUR - T_END, box: [c2P[0] - 400, c2P[1] - 50, 800, 100], dup: false, del: false },
      ];
    }
    function render(t) {
      glowBg(0); frame(d, 1);
      const wipe = E.inOutS(cl((t - T_SW) / 0.7)), [x, y, w, h] = d.screen;
      site(d, OLD, MODE_O, (t - 0.8) / 4.2, t, 1, URL);
      if (wipe > 0) { ctx.save(); ctx.beginPath(); ctx.rect(x - 30, y - 30, w + 60, (h + 60) * wipe); ctx.clip(); site(d, NEW, MODE_N, (t - T_SW - 0.8) / Math.max(0.5, T_END - T_SW - 1.2), Math.max(0, t - T_SW), 1, URL); ctx.restore();
        if (!C() && wipe < 1) { const ly = y - 30 + (h + 60) * wipe, gr = ctx.createLinearGradient(0, ly - 60, 0, ly + 10); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0.95)'); ctx.fillStyle = gr; ctx.fillRect(x - 30, ly - 60, w + 60, 70); } }
      if (C()) return; const endA = cl((t - T_END) / 0.4);
      const [hx, hy] = posOf(elP('head'), [W / 2, 130]);
      T(HEAD, hx, hy, F(900, fit(HEAD, 900, 960, 80), 'Mont'), { align: 'center', p: cl((t - 0.1) / 0.45), q: endA, col: WHT });
      const [nx, ny] = posOf(elP('name'), [W / 2, 200]);
      T(NAME, nx, ny, F(700, fit(NAME, 700, 900, 40), 'Mont'), { align: 'center', p: cl((t - 0.4) / 0.45), q: endA, col: OR, mode: 'fade' });
      const before = t < T_SW + 0.3;
      const [stx, sty] = posOf(elP('stamp'), stP0);
      stamp(before ? BEF : AFT, stx, sty, before ? (t - 0.6) / 0.22 : (t - T_SW - 0.5) / 0.22, 1 - endA, before ? RED : GRN, -0.14, 66);
      (before ? BAD : GOOD).forEach((s, i) => { const t0 = before ? 1.6 + i * 0.9 : T_SW + 1.0 + i * 0.9, a = cl((t - t0) / 0.3) * (before ? 1 - cl((t - T_SW + 0.2) / 0.3) : 1 - endA);
        const [cx, cy] = posOf(elP('note' + (i + 1)), [sideX, y0 + i * 84]); chip(s, cx, cy, !before, a, al); });
      ending(t, T_END, 0, H, CTA1, CTA2, posOf(elP('cta1'), [W / 2, 1060]), posOf(elP('cta2'), [W / 2, 1180]));
    }
    const cues = () => { const ev = [['whoosh', 0.1, 0.3, 0], ['stamp', 0.7, 0.45, 0]]; [0, 1, 2].forEach(i => ev.push(['pop', 1.6 + i * 0.9, 0.3, -0.2])); ev.push(['riser', T_SW - 0.6, 0.3, 0], ['shimmer', T_SW, 0.4, 0], ['stamp', T_SW + 0.6, 0.45, 0]); [0, 1, 2].forEach(i => ev.push(['pop', T_SW + 1.0 + i * 0.9, 0.3, 0.2])); ev.push(['chime', T_END + 0.1, 0.35, 0]);
      return { dur: DUR, beds: [['bed', 0, DUR, 0.75, { style: 'pulse', end: DUR }]], events: ev }; };
    return { dur: DUR, render, cues, shakes: [[0.78, 6], [T_SW + 0.68, 6]], elements };
  }

  // ============================================ OLD VS NEW (split)
  function oldnew() {
    const LEN = LENF('16'), DEV = DEVF('device', 'laptop', 'Show the sites on', true), MODE_O = MODEF('oldmode', 'Old site footage is'), MODE_N = MODEF('sitemode', 'New site footage is');
    const OLD = SHOT('old', NONE('old'), { label: 'Their website now', group: 'Footage', kind: 'any', d: LEN }), NEW = SHOT('site', NONE('site'), { label: 'The website you built', group: 'Footage', kind: 'any', d: LEN });
    const TOP = TXU('top', 'THEIR WEBSITE NOW', 'Top label', 'Words', 24), BOT = TXU('bottom', 'WHAT WE BUILT', 'Bottom label', 'Words', 24), NAME = TXU('biz_name', 'BUSINESS NAME', 'Business name', 'Words', 26);
    const VS = TXU('vs', 'VS', 'Versus badge', 'Words', 6);
    const URL_O = TXL('oldurl', 'theirbusiness.com', 'Old address', 'Words', 30), URL = TXL('url', 'theirbusiness.com', 'New address', 'Words', 30);
    const BAD = [1, 2, 3].map(i => TXL('bad' + i, ['Not built for phones', 'Hard to find the number', 'Last updated years ago'][i - 1], 'Old note ' + i, 'Their site (red X)', 26));
    const GOOD = [1, 2, 3].map(i => TXL('good' + i, ['Fast on every phone', 'Tap to call, up top', 'Fresh, clear and current'][i - 1], 'New note ' + i, 'Your site (green check)', 26)), [CTA1, CTA2] = CTAF();
    const DUR = LEN, T_END = DUR - 2.0, MID = 960;
    const mk = top => (DEV === 'full' ? device('full', W / 2, top + 70, W, 872) : DEV === 'laptop' ? device('laptop', W / 2, top + 120, 760, 600) : device('phone', W / 2, top + 96, 400, 840));
    const dT = mk(0), dB = mk(MID);
    { const tp = posOf(elP('devicetop'), [dT.screen[0], dT.screen[1]]); dT.screen = [tp[0], tp[1], dT.screen[2], dT.screen[3]];
      const bp = posOf(elP('devicebottom'), [dB.screen[0], dB.screen[1]]); dB.screen = [bp[0], bp[1], dB.screen[2], dB.screen[3]]; }
    const cx2 = DEV === 'laptop' ? W / 2 : W - 40, al = DEV === 'laptop' ? 'center' : 'right', cy = (half, i) => (DEV === 'laptop' ? half + 690 : half + 560) + i * 76;
    const chipBox = (s, x, y) => { const wEst = textW(s, F(800, 34, 'Mont'), 1) + 96, x0 = al === 'center' ? x - wEst / 2 : x - wEst; return [x0, y, wEst, 64]; };
    function elements() {
      const tpP = posOf(elP('top'), [40, 24]), boP = posOf(elP('bottom'), [40, MID + 24]), vsP = posOf(elP('vs'), [W / 2, MID]);
      const nmP = posOf(elP('name'), [W - 40, MID + 46]);
      const dtP = posOf(elP('devicetop'), [dT.screen[0], dT.screen[1]]), dbP = posOf(elP('devicebottom'), [dB.screen[0], dB.screen[1]]);
      const c1P = posOf(elP('cta1'), [W / 2, 1060]), c2P = posOf(elP('cta2'), [W / 2, 1180]);
      const oldN = [0, 1, 2].map(i => { const p = posOf(elP('oldnote' + (i + 1)), [cx2, cy(0, i)]); return { id: 'oldnote' + (i + 1), kind: 'pos', label: BAD[i], x: p[0], y: p[1], t0: 1.2 + i * 0.9, d: T_END - (1.2 + i * 0.9), box: chipBox(BAD[i], p[0], p[1]), dup: false, del: false }; });
      const newN = [0, 1, 2].map(i => { const p = posOf(elP('newnote' + (i + 1)), [cx2, cy(MID, i)]); return { id: 'newnote' + (i + 1), kind: 'pos', label: GOOD[i], x: p[0], y: p[1], t0: 1.6 + i * 0.9, d: T_END - (1.6 + i * 0.9), box: chipBox(GOOD[i], p[0], p[1]), dup: false, del: false }; });
      return [
        { id: 'top', kind: 'pos', label: TOP, x: tpP[0], y: tpP[1], t0: 0.1, d: T_END - 0.1, box: [tpP[0], tpP[1], 400, 60], dup: false, del: false },
        { id: 'bottom', kind: 'pos', label: BOT, x: boP[0], y: boP[1], t0: 0.4, d: T_END - 0.4, box: [boP[0], boP[1], 400, 60], dup: false, del: false },
        { id: 'vs', kind: 'pos', label: VS, x: vsP[0], y: vsP[1], t0: 0, d: DUR, box: [vsP[0] - 54, vsP[1] - 54, 108, 108], dup: false, del: false },
        ...oldN, ...newN,
        { id: 'name', kind: 'pos', label: NAME, x: nmP[0], y: nmP[1], t0: 0.6, d: T_END - 0.6, box: [nmP[0] - 560, nmP[1] - 34, 560, 44], dup: false, del: false },
        { id: 'devicetop', kind: 'box', label: 'Their site device', x: dtP[0], y: dtP[1], w: dT.screen[2], h: dT.screen[3], t0: 0, d: DUR, box: [dtP[0], dtP[1], dT.screen[2], dT.screen[3]], dup: false, del: false },
        { id: 'devicebottom', kind: 'box', label: 'Your site device', x: dbP[0], y: dbP[1], w: dB.screen[2], h: dB.screen[3], t0: 0, d: DUR, box: [dbP[0], dbP[1], dB.screen[2], dB.screen[3]], dup: false, del: false },
        { id: 'cta1', kind: 'pos', label: CTA1, x: c1P[0], y: c1P[1], t0: T_END, d: DUR - T_END, box: [c1P[0] - 470, c1P[1] - 60, 940, 70], dup: false, del: false },
        { id: 'cta2', kind: 'pos', label: CTA2, x: c2P[0], y: c2P[1], t0: T_END, d: DUR - T_END, box: [c2P[0] - 400, c2P[1] - 50, 800, 100], dup: false, del: false },
      ];
    }
    function render(t) {
      if (!C()) { ctx.fillStyle = BLK; ctx.fillRect(0, 0, W, H); ctx.fillStyle = rgbaOf(RED, 0.10); ctx.fillRect(0, 0, W, MID); ctx.fillStyle = rgbaOf(OR, 0.12); ctx.fillRect(0, MID, W, H - MID); }
      const pr = (t - 1.2) / Math.max(0.5, T_END - 1.6);
      frame(dT, 1); site(dT, OLD, MODE_O, pr, t, 1, URL_O); frame(dB, 1); site(dB, NEW, MODE_N, pr, t, 1, URL);
      if (C()) return; const endA = cl((t - T_END) / 0.4);
      const [topx, topy] = posOf(elP('top'), [40, 24]);
      pill(TOP, topx, topy, 30, RED, '#FFFFFF', E.outC(cl((t - 0.1) / 0.4)) * (1 - endA));
      const [botx, boty] = posOf(elP('bottom'), [40, MID + 24]);
      pill(BOT, botx, boty, 30, OR, onAcc(), E.outC(cl((t - 0.4) / 0.4)) * (1 - endA));
      const [vsx, vsy] = posOf(elP('vs'), [W / 2, MID]);
      ctx.fillStyle = WHT; ctx.fillRect(0, vsy - 3, W, 6); { const r = 54; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(vsx, vsy, r, 0, 7); ctx.fill(); tx(VS, vsx, vsy + 16, 44, 900, '#111', 'center', 1); }
      BAD.forEach((s, i) => { const [cx, cy2] = posOf(elP('oldnote' + (i + 1)), [cx2, cy(0, i)]); chip(s, cx, cy2, false, cl((t - 1.2 - i * 0.9) / 0.3) * (1 - endA), al); });
      GOOD.forEach((s, i) => { const [cx, cy2] = posOf(elP('newnote' + (i + 1)), [cx2, cy(MID, i)]); chip(s, cx, cy2, true, cl((t - 1.6 - i * 0.9) / 0.3) * (1 - endA), al); });
      if (NAME) { const [nmx, nmy] = posOf(elP('name'), [W - 40, MID + 46]); T(NAME, nmx, nmy, F(800, fit(NAME, 800, 560, 34), 'Mont'), { align: 'right', p: cl((t - 0.6) / 0.4), q: endA, col: WHT, mode: 'fade' }); }
      ending(t, T_END, 0, H, CTA1, CTA2, posOf(elP('cta1'), [W / 2, 1060]), posOf(elP('cta2'), [W / 2, 1180]));
    }
    const cues = () => { const ev = [['whoosh', 0.1, 0.3, -0.3], ['whoosh', 0.4, 0.3, 0.3], ['impact', 0.6, 0.25, 0]]; [0, 1, 2].forEach(i => ev.push(['pop', 1.2 + i * 0.9, 0.28, -0.3], ['tink', 1.6 + i * 0.9, 0.3, 0.3])); ev.push(['chime', T_END + 0.1, 0.35, 0]);
      return { dur: DUR, beds: [['bed', 0, DUR, 0.75, { style: 'pulse', end: DUR }]], events: ev }; };
    return { dur: DUR, render, cues, shakes: [], elements };
  }

  // ============================================ NO WEBSITE FOUND
  function nosite() {
    const LEN = LENF('16'), MODE = MODEF('sitemode', 'Website footage is');
    const SITE = SHOT('site', NONE('site'), { label: 'The website you built', group: 'Footage', kind: 'vert', d: LEN });
    const Q = TXL('query', 'business name near me', 'What gets searched', 'Search', 34), NAME = TXL('biz_name', 'Business Name', 'Business name', 'The listing', 30), CAT = TXL('biz_where', 'What they do · Town', 'Trade and town', 'The listing', 34);
    const NOW = TXL('nowebsite', 'No website', 'Missing-website label', 'The listing', 18), STAMP = TXU('stamp', 'NO WEBSITE?', 'Stamp', 'Words', 14), FIX = TXU('fixed', 'WE FIXED THAT', 'Fix line', 'Words', 22);
    const BTNS = [1, 2, 3].map(i => TXU('btn' + i, ['CALL', 'DIRECTIONS', 'WEBSITE'][i - 1], 'Card button ' + i, 'The listing', 12));
    const URL = TXL('url', 'theirbusiness.com', 'Website address', 'Words', 30), [CTA1, CTA2] = CTAF();
    const DUR = LEN, T_CARD = 2.0, T_TAP = 3.6, T_ST = 4.1, T_FIX = 5.4, T_SITE = 5.9, T_END = DUR - 2.0;
    const d = device('phone', W / 2, 600, 640, 1240);
    function elements() {
      const srP = posOf(elP('search'), [70, 180]), caP = posOf(elP('card'), [70, 360]), stP = posOf(elP('stamp'), [W / 2, 1060]);
      const fxP = posOf(elP('fix'), [W / 2, 330]), dvP = posOf(elP('device'), [d.screen[0], d.screen[1] + 120]);
      const c1P = posOf(elP('cta1'), [W / 2, 1060]), c2P = posOf(elP('cta2'), [W / 2, 1180]);
      return [
        { id: 'search', kind: 'box', label: Q, x: srP[0], y: srP[1], w: W - 140, h: 120, t0: 0, d: T_FIX + 0.5, box: [srP[0], srP[1], W - 140, 120], dup: false, del: false },
        { id: 'card', kind: 'card', label: NAME, x: caP[0], y: caP[1], w: W - 140, h: 520, t0: T_CARD, d: T_FIX + 0.5 - T_CARD, box: [caP[0], caP[1], W - 140, 520], dup: false, del: false },
        { id: 'stamp', kind: 'pos', label: STAMP, x: stP[0], y: stP[1], t0: T_ST, d: T_FIX + 0.4 - T_ST, box: [stP[0] - 350, stP[1] - 70, 700, 140], dup: false, del: false },
        { id: 'fix', kind: 'pos', label: FIX, x: fxP[0], y: fxP[1], t0: T_FIX, d: T_END - T_FIX, box: [fxP[0] - 480, fxP[1] - 84, 960, 100], dup: false, del: false },
        { id: 'device', kind: 'box', label: 'Website device', x: dvP[0], y: dvP[1], w: d.screen[2], h: d.screen[3], t0: T_FIX, d: DUR - T_FIX, box: [dvP[0], dvP[1], d.screen[2], d.screen[3]], dup: false, del: false },
        { id: 'cta1', kind: 'pos', label: CTA1, x: c1P[0], y: c1P[1], t0: T_END, d: DUR - T_END, box: [c1P[0] - 470, c1P[1] - 60, 940, 70], dup: false, del: false },
        { id: 'cta2', kind: 'pos', label: CTA2, x: c2P[0], y: c2P[1], t0: T_END, d: DUR - T_END, box: [c2P[0] - 400, c2P[1] - 50, 800, 100], dup: false, del: false },
      ];
    }
    function card(t, a, dy, pos) {
      if (C() || a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(0, dy); const x = pos ? pos[0] : 70, y = pos ? pos[1] : 360, w = W - 140, h = 520;
      ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14; ctx.fillStyle = '#FFFFFF'; rr(x, y, w, h, 36); ctx.fill(); ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#E9EAEE'; rr(x + 40, y + 40, 150, 150, 24); ctx.fill(); ctx.fillStyle = '#C9CBD2'; ctx.fillRect(x + 75, y + 105, 80, 60); ctx.beginPath(); ctx.moveTo(x + 65, y + 108); ctx.lineTo(x + 115, y + 70); ctx.lineTo(x + 165, y + 108); ctx.closePath(); ctx.fill();
      tx(NAME, x + 220, y + 100, fit(NAME, 800, w - 260, 52), 800, '#111', 'left'); tx(CAT, x + 220, y + 152, fit(CAT, 500, w - 260, 34), 500, '#666', 'left');
      const btn = [[BTNS[0], true], [BTNS[1], true], [BTNS[2], false]], bw = (w - 120) / 3;
      btn.forEach(([s, on], i) => { const bx = x + 40 + i * (bw + 20), by = y + 260, tap = !on && t > T_TAP && t < T_TAP + 0.25;
        ctx.fillStyle = on ? rgbaOf(OR, 0.12) : (tap ? '#D5D7DD' : '#F1F2F5'); rr(bx, by, bw, 110, 24); ctx.fill(); tx(s, bx + bw / 2, by + 68, fit(s, 800, bw - 30, 30, 2), 800, on ? OR : '#AAACB3', 'center', 2);
        if (!on) { ctx.strokeStyle = '#C0C2C9'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bx + 24, by + 86); ctx.lineTo(bx + bw - 24, by + 24); ctx.stroke(); } });
      if (t > T_TAP) { const a2 = cl((t - T_TAP) / 0.3); ctx.globalAlpha = a * a2; ctx.fillStyle = rgbaOf(RED, 0.1); rr(x + 40, y + 400, w - 80, 80, 20); ctx.fill(); tx(NOW, x + w / 2, y + 452, fit(NOW, 800, w - 140, 36), 800, RED, 'center'); }
      if (t > T_TAP - 0.3 && t < T_TAP + 0.4) { const fx = x + 40 + 2 * (bw + 20) + bw / 2, fy = y + 330, k = cl((t - T_TAP + 0.3) / 0.3); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(fx, fy, 30 + 20 * k, 0, 7); ctx.fill(); }
      ctx.restore();
    }
    function render(t) {
      glowBg(0); const out = E.inC(cl((t - T_FIX) / 0.5)), endA = cl((t - T_END) / 0.4);
      // the search bar
      if (!C()) { const a = E.outC(cl(t / 0.4)) * (1 - out), [sbx, sby] = posOf(elP('search'), [70, 180]); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#FFFFFF'; rr(sbx, sby, W - 140, 120, 60); ctx.fill(); ctx.strokeStyle = '#9A9CA3'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(sbx + 70, sby + 56, 20, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sbx + 84, sby + 70); ctx.lineTo(sbx + 102, sby + 88); ctx.stroke();
        const n = Math.floor(cl((t - 0.4) / 1.2) * Q.length); tx(Q.slice(0, n) + (t < T_CARD && Math.floor(t * 3) % 2 === 0 ? '|' : ''), sbx + 130, sby + 76, fit(Q, 600, W - 320, 44), 600, '#222', 'left'); ctx.restore(); }
      card(t, E.outC(cl((t - T_CARD) / 0.4)) * (1 - out), (1 - E.outC(cl((t - T_CARD) / 0.4))) * 80 - out * 300, posOf(elP('card'), [70, 360]));
      const [stx, sty] = posOf(elP('stamp'), [W / 2, 1060]);
      if (t > T_ST && t < T_FIX + 0.4) stamp(STAMP, stx, sty, (t - T_ST) / 0.22, 1 - out, RED, -0.12, 110);
      if (t > T_FIX) { const [fxx, fxy] = posOf(elP('fix'), [W / 2, 330]);
        if (!C()) T(FIX, fxx, fxy, F(900, fit(FIX, 900, 960, 84), 'Mont'), { align: 'center', p: cl((t - T_FIX) / 0.45), q: endA, col: WHT });
        const rise = (1 - E.outC(cl((t - T_FIX) / 0.6))) * 900, dvP = posOf(elP('device'), [d.screen[0], d.screen[1] + 120]);
        const dd = { kind: 'phone', screen: [dvP[0], dvP[1] + rise, d.screen[2], d.screen[3]], urlH: d.urlH };
        frame(dd, 1); site(dd, SITE, MODE, (t - T_SITE - 0.8) / Math.max(0.5, T_END - T_SITE - 1.2), Math.max(0, t - T_SITE), 1, URL, t - T_FIX - 0.2); }
      ending(t, T_END, 0, H, CTA1, CTA2, posOf(elP('cta1'), [W / 2, 1060]), posOf(elP('cta2'), [W / 2, 1180]));
    }
    const cues = () => ({ dur: DUR, beds: [['bed', 0, DUR, 0.75, { style: 'day', end: DUR }]], events: [['pop', 0.1, 0.3, 0], ['ticks', 0.4, 0.22, 0, { dur: 1.2, n: Math.min(16, Q.length) }], ['swish', T_CARD, 0.3, 0], ['click', T_TAP, 0.4, 0.3], ['tick', T_TAP, 0.4, 0.3], ['glitch', T_TAP + 0.1, 0.3, 0], ['stamp', T_ST + 0.1, 0.5, 0], ['impact', T_ST + 0.12, 0.3, 0], ['whoosh', T_FIX, 0.35, 0], ['riser', T_SITE, 0.25, 0], ['pop', T_SITE, 0.3, 0], ['chime', T_END + 0.1, 0.35, 0]] });
    return { dur: DUR, render, cues, shakes: [[T_ST + 0.18, 7]], elements };
  }

  const MAKE = { drop, droplap: drop, dropfull: drop, glow, oldnew, nosite };
  const P = (MAKE[V] || drop)();
  DIR = { dur: P.dur, bg: BLK, finish: { vig: 0.12, grain: 0.08 }, edl: [], shakes: P.shakes || [], preload: () => (K3.init ? K3.init() : null), render: P.render, cues: P.cues, ...(P.elements ? { elements: P.elements } : {}) };
});
