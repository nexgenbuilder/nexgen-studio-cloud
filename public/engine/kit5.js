'use strict';
/* Kit 5 (NexGen templates, Oct 28): brand-aware copy helpers, landscape-in-vertical frame layouts, banners, footage inside
   letters, CTA rows and the standard sound cues. Footage is always drawn whole (contain-fit) unless a template is built on
   vertical clips. Requires kit, kit3, kit4. */
const K5 = (() => {
  const G = K3.G, D = K3.D;
  const lum = h => { const n = parseInt(String(h).slice(1, 7), 16), f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(n >> 16 & 255) + 0.7152 * f(n >> 8 & 255) + 0.0722 * f(n & 255); };
  const onAcc = () => (lum(OR) > 0.36 ? BLK : WHT);
  const onPaper = () => (lum(PAPER) > 0.4 ? BLK : WHT);
  const isDPG = () => !!BRAND.parts;
  const svc = i => { const s = BRAND.services || []; return String(s.length ? s[i % s.length] : ['OUR WORK', 'THE DETAILS', 'THE FINISH', 'THE RESULT'][i % 4]).toUpperCase(); };
  const noun = () => String(BRAND.noun || 'PROJECT').toUpperCase();
  const pick = (dpg, other) => (isDPG() ? dpg : other);
  // DPG library shots with clean in-points (each inside one source shot); other brands get placeholders automatically
  const LAND = [['c02', 9.0], ['c12', 8.5], ['c07', 12.05], ['c09', 3.55], ['c11', 15.0], ['c05', 4.1], ['c08', 5.99], ['c10', 4.0], ['c11', 12.05], ['c05', 24.1], ['c07', 24.0], ['c09', 10.55], ['c02', 0.05], ['c12', 0.1]];
  const VERT = [['v01', 0.1], ['v04', 4.0], ['v03', 3.0], ['v05', 6.0], ['v02', 0.1], ['v01', 7.0], ['v04', 9.0], ['v03', 12.0], ['v05', 15.0], ['v02', 4.0]];
  // shot boundaries of the DPG library clips (pairs of start, end in s; from library/sources.json). Kept here, not read at run
  // time, because templates build before clip metadata loads; it lets defaults pick in-points that never run over a cut.
  const SEGS = (() => { const R = { c02: [0,3,3,5.966,5.967,8.966,8.967,11.966,11.967,14.933,14.933,18], c05: [0,4,4,8.966,8.967,13.966,13.967,18.966,18.967,24.033,24.033,30], c07: [0,3,3,6,6,8.966,8.967,11.966,11.967,14.966,14.967,17.966,17.967,20.966,20.967,23.933,23.933,26.933,26.933,30], c08: [0,2,2,3.966,3.967,5.966,5.967,8.466,8.467,10.966,10.967,13.433,13.433,16], c09: [0,3.5,3.5,6.966,6.967,10.466,10.467,13.966,13.967,16.933,16.933,20], c10: [0,15.9,16.9,20.2,20.8,30], c11: [0,3,3,5.966,5.967,8.966,8.967,11.966,11.967,14.933,14.933,18], c12: [0,8.3,8.467,12], v01: [0,3.5,3.5,6.966,6.967,10.466,10.467,13.966,13.967,16.933,16.933,20], v02: [0,3.966,3.967,7.966,7.967,10.966,10.967,15], v03: [0,3,3,6,6,8.966,8.967,11.966,11.967,14.966,14.967,17.966,17.967,20.966,20.967,23.933,23.933,27.433,27.433,30], v04: [0,4,4,8.966,8.967,13.966,13.967,18.966,18.967,23.933,23.933,30], v05: [0,3,3,6,6,8.966,8.967,11.966,11.967,14.966,14.967,17.966,17.967,20.966,20.967,23.933,23.933,27.033,27.033,30] };
    const o = {}; for (const k in R) { o[k] = []; for (let i = 0; i < R[k].length; i += 2) o[k].push([R[k][i], R[k][i + 1]]); } return o; })();
  const segAt = (c, inn) => (SEGS[c] || []).find(g => inn + 0.04 >= g[0] && inn + 0.04 < g[1]);
  const r2 = x => Math.round(x * 100) / 100, fl2 = x => Math.floor(x * 100) / 100;
  // move library defaults so each shot's footage [in, in + d] sits inside one source shot: the same clip first (nearest
  // segment), then another clip of the same shape not already used; shots outside the library are left as they are
  function fitList(list, ds) {
    const used = new Set(), key = (c, g) => c + '@' + g[0], out = [];
    const ok = (c, inn, d) => { const g = segAt(c, inn); return g && !used.has(key(c, g)) && inn + d <= g[1] + 0.04 ? g : null; };
    const inSeg = (c, g, inn, d) => (g[1] - g[0] >= d + 0.06 && !used.has(key(c, g)) ? r2(clamp(inn, g[0] + 0.05, fl2(g[1] - d - 0.01))) : null);
    list.forEach(([c, inn], k) => {
      const d = Array.isArray(ds) ? ds[k] : ds;
      if (!SEGS[c]) { out.push([c, inn]); return; }
      let pick = ok(c, inn, d) ? [c, inn] : null;
      if (!pick) { const gs = SEGS[c].slice().sort((a, b) => Math.abs(a[0] - inn) - Math.abs(b[0] - inn)); for (const g of gs) { const i = inSeg(c, g, inn, d); if (i !== null) { pick = [c, i]; break; } } }
      if (!pick) {
        const pool = (c[0] === 'v' ? VERT : LAND), usedC = new Set(out.map(x => x[0]));
        for (const [c2, i2] of pool) if (!usedC.has(c2) && ok(c2, i2, d)) { pick = [c2, i2]; break; }
        if (!pick) for (const pass of [0, 1]) { for (const [c2] of pool) { if (pick || (pass === 0 && usedC.has(c2))) continue; for (const g of SEGS[c2]) { const i = inSeg(c2, g, g[0], d); if (i !== null) { pick = [c2, i]; break; } } } if (pick) break; }
      }
      pick = pick || [c, inn]; const g = segAt(pick[0], pick[1]); if (g) used.add(key(pick[0], g)); out.push(pick);
    });
    return out;
  }
  function fill(r, col, a) { if (VID.collecting) return; const c = G(); if (a !== undefined) c.globalAlpha = a; c.fillStyle = col; c.fillRect(r[0], r[1], r[2], r[3]); D(); }
  function whole(c, inn, lt, r, o) { const w = K3.wholeIn(c, r); K3.clip(c, inn, lt, w, o); return w; }
  // shots in a rect, each drawn whole, with a transition from kit4 between them (names[i] is the transition into shot i)
  function seq(S, t, R, names, trD) {
    trD = trD || 0.5; const { i, sh, lt } = K3.shotAt(S, clamp(t, 0, S.total - 1 / 60)), nx = S[i + 1];
    const A = (s, l) => () => whole(s.c, s.in, l, R), nm = k => (Array.isArray(names) ? names[k] : names) || 'cut';
    if (i > 0 && lt < trD / 2 && nm(i) !== 'cut') K4.run(nm(i), R, (lt + trD / 2) / trD, A(S[i - 1], t - S[i - 1].start), A(sh, lt), { t });
    else if (nx && t > nx.start - trD / 2 && nm(i + 1) !== 'cut') K4.run(nm(i + 1), R, (t - (nx.start - trD / 2)) / trD, A(sh, lt), A(nx, t - nx.start), { t });
    else A(sh, lt)();
    return { i, sh, lt };
  }
  function shotsOf(list, d, kind, group, labels) {   // SHOT fields for a list of [clip, in] with durations d (number or array)
    list = fitList(list, list.map((x, k) => (Array.isArray(d) ? d[k] : d) + 0.5));
    return K3.shots(list.map(([c, inn], k) => { const dd = Array.isArray(d) ? d[k] : d; const s = SHOT('s' + (k + 1), [c, inn], { label: (labels && labels[k]) || 'Shot ' + (k + 1), group: group || 'Footage', kind: kind || 'land', d: dd + 0.5 }); return [s[0], s[1], dd]; }));
  }
  // a big word with the footage inside the letters; grow 0..1 opens the word up until it is the whole frame
  function footWord(lines, cx, cy, size, fam, drawFill, grow, alpha, o) {
    o = o || {}; const g = clamp(grow || 0), s = lerp(1, 24, E.inExpo(g)) * (o.pop ? lerp(1.14, 1, E.outC(clamp(o.pop))) : 1), lh = size * 0.9, wt = fam === 'Bebas' ? 400 : 900;
    const txt = c => lines.forEach((ln, i) => c(ln, 0, (i - (lines.length - 1) / 2) * lh + size * 0.04));
    const mask = () => { const c = G(); c.translate(cx, cy); c.scale(s, s); setF(F(wt, size, fam), 4); c.fillStyle = WHT; c.textAlign = 'center'; c.textBaseline = 'middle'; txt((l, x, y) => c.fillText(l, x, y)); D(); };
    knockout(mask, drawFill, alpha === undefined ? 1 : alpha);
    if (!VID.collecting && g > 0.9) { ctx.save(); ctx.globalAlpha = (g - 0.9) / 0.1 * (alpha === undefined ? 1 : alpha); drawFill(); ctx.restore(); }
    if (!VID.collecting && o.stroke && g < 0.04) { const c = G(); c.globalAlpha = (alpha === undefined ? 1 : alpha) * (o.strokeA === undefined ? 1 : o.strokeA); c.translate(cx, cy); c.scale(s, s); setF(F(wt, size, fam), 4); c.strokeStyle = o.stroke; c.lineWidth = 3 / s; c.textAlign = 'center'; c.textBaseline = 'middle'; txt((l, x, y) => c.strokeText(l, x, y)); D(); }
  }
  // brand rows
  function bug(t, t0, a, dark) { ctx.save(); ctx.globalAlpha = a === undefined ? 1 : a; K3.logoBuild(185, 196, 250, t0 === undefined ? 0.4 : t0, t, { img: dark ? IMG.logoB : IMG.logoW, soft: !!dark }); ctx.restore(); }
  function ctaRow(t, y, t0, a, dark) {
    pill(CONTACT.cta, W / 2, y, { size: Math.min(30, fitSize(CONTACT.cta, 800, 900, 30, 'Mont', 2.5)), p: clamp((t - t0) / 0.4), alpha: a === undefined ? 1 : a, bg: OR, col: onAcc() });
    const line = [CONTACT.phone, CONTACT.web].filter(Boolean).join('   ·   ');
    if (line) caps(line, W / 2, y + 90, 27, clamp((t - t0 - 0.3) / 0.4) * (a === undefined ? 1 : a), 0, { w: 800, ls: 2, maxW: 980, col: dark ? BLK : WHT });
  }
  function topBand(t, t0, h, col, q) {   // colour band from the top edge; returns the band's bottom y
    const e = E.outQ(clamp((t - t0) / 0.45)) * (1 - E.inC(clamp(q || 0))), y1 = h * e;
    if (!VID.collecting && y1 > 0) { const c = G(); c.fillStyle = col || OR; c.fillRect(-30, -30, W + 60, y1 + 30); c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(-30, y1 - 6, W + 60, 6); D(); }
    return y1;
  }
  function bottomBar(t, t0, y0, col, q) {   // colour bar from y0 to the bottom edge, rising in
    const e = E.outQ(clamp((t - t0) / 0.45)) * (1 - E.inC(clamp(q || 0))), y = H - (H - y0) * e;
    if (!VID.collecting && e > 0) { const c = G(); c.fillStyle = col || BLK; c.fillRect(-30, y, W + 60, H - y + 30); c.fillStyle = ORA(0.9); c.fillRect(-30, y, W + 60, 6); D(); }
    return y;
  }
  function infoRow(t, t0, y, dark, a) {   // logo left, phone and website right
    const p = clamp((t - t0) / 0.45) * (a === undefined ? 1 : a); if (p <= 0) return; const [lw, lh] = logoBox(300);
    if (!VID.collecting) { const c = G(); c.globalAlpha = p; c.drawImage(dark ? IMG.logoB : IMG.logoW, 64, y - lh / 2, lw, lh); D(); }
    const room = W - 64 - lw - 100;
    caps(CONTACT.phone || '', W - 64, y + 4, Math.min(54, fitSize(CONTACT.phone || ' ', 800, room, 54, 'Mont', 1)), p, 0, { w: 800, ls: 1, align: 'right', col: dark ? BLK : WHT, ls0: 0 });
    caps(CONTACT.web || '', W - 64, y + 50, Math.min(24, fitSize(CONTACT.web || ' ', 700, room, 24, 'Mont', 4)), p, 0, { w: 700, ls: 4, align: 'right', col: dark ? BLK : OR, ls0: 0 });
  }
  function pips(n, k, y, a) { if (VID.collecting) return; const c = G(); c.globalAlpha = a === undefined ? 1 : a; for (let j = 0; j < n; j++) { c.fillStyle = j <= k ? OR : 'rgba(255,255,255,0.25)'; c.fillRect(W / 2 - n * 30 / 2 + j * 30, y, 22, 6); } D(); }
  function outroCues(ev, OUT, style) {
    if (style === 'editorial') { ev.push(['air', OUT, 0.25, 0]); ev.push(['chime', OUT + 1.6, 0.25, 0]); ev.push(['ticks', OUT + 2.0, 0.16, 0, { dur: 0.8, n: 14 }]); return; }
    if (style === 'grunge') { ev.push(['whoosh', OUT + 0.1, 0.3, 0]); ev.push(['stamp', OUT + 0.5, 0.45, 0]); ev.push(['stamp', OUT + 1.6, 0.4, 0]); return; }
    ev.push(['swell', OUT - 0.5, 0.3, 0]); ev.push(['whoosh', OUT, 0.3, 0]);
    [0, 0.12, 0.24].forEach(d => ev.push(['clack', OUT + 0.38 + d, 0.45, (d - 0.12) * 3])); ev.push(['tink', OUT + 0.75, 0.2, 0]);
    ev.push(['chime', OUT + 1.55, 0.3, 0]); ev.push(['ticks', OUT + 1.9, 0.25, 0, { dur: 0.8, n: 14 }]); ev.push(['pop', OUT + 2.4, 0.4, 0.3]);
  }
  return { lum, onAcc, onPaper, isDPG, svc, noun, pick, LAND, VERT, fitList, fill, whole, seq, shotsOf, footWord, bug, ctaRow, topBand, bottomBar, infoRow, pips, outroCues };
})();
