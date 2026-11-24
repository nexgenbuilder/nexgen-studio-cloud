'use strict';
/* NexGen Studio V26 (Nov 18): the Pixel family. Retro pixel-art formats drawn on a true 270x480 pixel grid and scaled
   up 4x with no smoothing, so every frame is real pixel art at 1080x1920.
   ?v=pxstart  Press Start     logo drops in, "level up" headline, blinking PRESS START, then the call to action
   ?v=pxquest  Quest Checklist  a quest box, four items checked off with coin sounds, QUEST COMPLETE, the reward
   ?v=pxover   Game Over        static, GAME OVER drops in, the problem in three lines, CONTINUE? countdown, YES
   ?v=pxboss   Boss Fight       health bars, the rival hits you, a power-up refills your HP, you win
   ?v=pxcoin   Insert Coin      a coin drops in the slot, NEW GAME, the headline and three levels unlocking
   Colours follow the look: accent = the red, background = the ink, text = white, second accent = the yellow.
   Every word is a field. The logo is the pixel WEBFLIX mark, the brand's own logo pixelated, or none.
   Soundtracks mix live: a chiptune bed (audio/bed_chip.mp4) and 8-bit effects (audio/sfx_chip.*, cue names 'c_<name>'). */
const PX = (() => {
  const LW = 270, LH = 480;
  const LO = document.createElement('canvas'); LO.width = LW; LO.height = LH; const g = LO.getContext('2d');
  let ready = false;
  const FACES = [['PxPress', 'fonts/press-start-2p-latin-400-normal.woff2'], ['PxVT', 'fonts/vt323-latin-400-normal.woff2']];
  const fontsP = Promise.all(FACES.map(([n, u]) => new FontFace(n, `url(${u})`).load().then(f => document.fonts.add(f)))).then(() => { ready = true; }).catch(e => console.warn('pixel fonts', e));
  const FONT = { ps8: ['8px PxPress', 8], ps16: ['16px PxPress', 16], vt: ['16px PxVT', 16] };
  const clamp = (v, a, b) => Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v));
  const ease = u => 1 - Math.pow(1 - clamp(u), 3);
  const bounce = u => { u = clamp(u); if (u < 0.7) return (u / 0.7) * (u / 0.7); const v = (u - 0.7) / 0.3; return 1 - 0.12 * Math.sin(v * Math.PI); };
  const typed = (s, t, cps) => (t <= 0 ? '' : String(s).slice(0, Math.floor(t * (cps || 40))));
  const rng = seed => { let a = (seed * 2654435761) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const R = n => Math.round(n);
  // ------------------------------------------------ colours
  const hx = h => { const n = parseInt(String(h).slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const css = a => 'rgb(' + a.map(R).join(',') + ')';
  const mixA = (a, b, u) => a.map((x, i) => x + (b[i] - x) * u);
  let PK = '', PC = null;
  function pal() {
    const k = OR + BLK + WHT + ACC2; if (k === PK) return PC; PK = k;
    const r = hx(OR), i = hx(BLK), w = hx(WHT), y = hx(ACC2);
    PC = { RED: css(r), DRED: css(mixA(r, i, 0.62)), INK: css(i), WHITE: css(w), YEL: css(y), GREEN: '#3DDC84', GOLD: '#FFC43C',
      PANEL: css(mixA(i, w, 0.06)), EDGE: css(mixA(i, w, 0.18)), SCAN: css(mixA(i, w, 0.03)), GREY: css(mixA(w, i, 0.28)), DIM: css(mixA(w, i, 0.5)), BAR: css(mixA(i, w, 0.12)) };
    return PC;
  }
  // ------------------------------------------------ raster primitives (inclusive pixel boxes, like the Python engine)
  function rect(c, x0, y0, x1, y1, col) { x0 = R(x0); y0 = R(y0); x1 = R(x1); y1 = R(y1); if (x1 < x0) [x0, x1] = [x1, x0]; if (y1 < y0) [y0, y1] = [y1, y0]; c.fillStyle = col; c.fillRect(x0, y0, x1 - x0 + 1, y1 - y0 + 1); }
  function rectO(c, x0, y0, x1, y1, col, w) { w = w || 1; rect(c, x0, y0, x1, y0 + w - 1, col); rect(c, x0, y1 - w + 1, x1, y1, col); rect(c, x0, y0, x0 + w - 1, y1, col); rect(c, x1 - w + 1, y0, x1, y1, col); }
  function pt(c, x, y, col) { c.fillStyle = col; c.fillRect(R(x), R(y), 1, 1); }
  function line(c, pts, col, w) {
    w = w || 1; c.fillStyle = col; const o = Math.floor((w - 1) / 2);
    for (let i = 0; i + 3 < pts.length; i += 2) {
      let x0 = R(pts[i]), y0 = R(pts[i + 1]); const x1 = R(pts[i + 2]), y1 = R(pts[i + 3]);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx + dy;
      for (let n = 0; n < 4000; n++) { c.fillRect(x0 - o, y0 - o, w, w); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
    }
  }
  function spans(x0, y0, x1, y1) {   // ellipse in the box [x0..x1]x[y0..y1]: row -> [xa, xb]
    const rx = (x1 - x0 + 1) / 2, ry = (y1 - y0 + 1) / 2, cx = x0 + rx, cy = y0 + ry, out = {};
    for (let y = R(y0); y <= R(y1); y++) { const yy = (y + 0.5 - cy) / ry; if (Math.abs(yy) > 1) continue; const h = rx * Math.sqrt(1 - yy * yy); const a = R(cx - h), b = R(cx + h) - 1; if (b >= a) out[y] = [a, b]; }
    return out;
  }
  function ellipse(c, x0, y0, x1, y1, fill, outline, w, half) {
    const S = spans(x0, y0, x1, y1), cy = (y0 + y1) / 2;
    if (outline) { const I = spans(x0 + (w || 1), y0 + (w || 1), x1 - (w || 1), y1 - (w || 1)); c.fillStyle = outline;
      for (const y in S) { if (half && +y > cy) continue; const [a, b] = S[y], i = I[y]; if (!i) c.fillRect(a, +y, b - a + 1, 1); else { c.fillRect(a, +y, i[0] - a, 1); c.fillRect(i[1] + 1, +y, b - i[1], 1); if (fill) { c.fillStyle = fill; c.fillRect(i[0], +y, i[1] - i[0] + 1, 1); c.fillStyle = outline; } } } return; }
    c.fillStyle = fill; for (const y in S) { if (half && +y > cy) continue; const [a, b] = S[y]; c.fillRect(a, +y, b - a + 1, 1); }
  }
  function poly(c, P, col) {
    c.fillStyle = col; const ys = P.map(p => p[1]); const y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
    for (let y = y0; y <= y1; y++) { const yc = y + 0.5, xs = [];
      for (let i = 0; i < P.length; i++) { const [ax, ay] = P[i], [bx, by] = P[(i + 1) % P.length]; if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + (yc - ay) * (bx - ax) / (by - ay)); }
      xs.sort((a, b) => a - b); for (let k = 0; k + 1 < xs.length; k += 2) { const a = Math.ceil(xs[k] - 0.5), b = Math.floor(xs[k + 1] - 0.5); if (b >= a) c.fillRect(a, y, b - a + 1, 1); } }
  }
  // ------------------------------------------------ crisp text: drawn once per string, alpha thresholded, cached
  const TC = new Map();
  function timg(s, fk, col) {
    const key = fk + '|' + col + '|' + s; let im = TC.get(key); if (im) return im;
    const [font, size] = FONT[fk]; const m = g; m.save(); m.font = font; const w = Math.max(1, Math.ceil(m.measureText(s).width) + 2); m.restore();
    im = document.createElement('canvas'); im.width = w; im.height = Math.ceil(size * 1.4) + 2; const c = im.getContext('2d');
    c.font = font; c.textBaseline = 'top'; c.fillStyle = col; c.fillText(s, 0, fk === 'vt' ? -1 : 0);
    const d = c.getImageData(0, 0, im.width, im.height), a = d.data;
    for (let i = 3; i < a.length; i += 4) a[i] = a[i] >= 110 ? 255 : 0;
    c.putImageData(d, 0, 0); im.tw = w - 2;
    if (ready) { if (TC.size > 1500) TC.clear(); TC.set(key, im); }
    return im;
  }
  function txt(c, x, y, s, o) {
    o = o || {}; s = String(s || ''); if (!s) return 0; const fk = o.f || 'ps8', col = o.col || pal().WHITE, an = o.a || 'l', k = o.k || 1;
    const im = timg(s, fk, col), w = im.tw * k; const x0 = R(an === 'm' ? x - w / 2 : an === 'r' ? x - w : x);
    c.imageSmoothingEnabled = false;
    if (o.sh) { const sim = timg(s, fk, o.sh); c.drawImage(sim, x0 + k, R(y) + k, sim.width * k, sim.height * k); }
    c.drawImage(im, x0, R(y), im.width * k, im.height * k); return w;
  }
  const tw = (s, fk) => timg(String(s), fk || 'ps8', '#ffffff').tw;
  // ------------------------------------------------ people
  const SKIN = ['#FFD6AA', '#E9B482', '#C6865A', '#8D5536', '#603C28'], HAIR = ['#281C16', '#5A381E', '#DCB45A', '#96281E', '#1E1E22', '#C8C8CD'];
  const SHIRT = ['#FF3B52', '#468CE6', '#3DC878', '#FAC83C', '#AA5ADC', '#F08232', '#F4F2F7', '#28B4BE'], PANTS = ['#28325A', '#323238', '#6E5032', '#1E1E28'];
  const STY = ['cap', 'beanie', 'long', 'bun', 'short', 'short', 'bald', 'long'];
  function people(n, seed) { const r = rng(seed), pick = a => a[Math.floor(r() * a.length)]; const out = []; for (let i = 0; i < n; i++) out.push([pick(SKIN), pick(HAIR), pick(SHIRT), pick(PANTS), pick(STY)]); return out; }
  function person(c, x, y, p, t, o) {
    o = o || {}; const [skin, hair, shirt, pants, style] = p, face = o.face === undefined ? 1 : o.face, happy = o.happy !== false;
    const bob = o.walk ? 0 : ((Math.floor(t * 1.6 + x * 0.37) % 4 === 0) ? 1 : 0); y += bob; const shoe = '#191419'; let base;
    if (o.seated) { rect(c, x + 1, y - 4, x + 6, y - 3, pants); rect(c, x + 5, y - 2, x + 6, y, pants); pt(c, x + 7, y, shoe); base = y - 3; }
    else { const ph = o.walk ? Math.floor(t * 8) % 2 : 0;
      if (ph === 0) { rect(c, x + 1, y - 5, x + 2, y - 1, pants); rect(c, x + 4, y - 5, x + 5, y - 1, pants); rect(c, x + 1, y, x + 2, y, shoe); rect(c, x + 4, y, x + 5, y, shoe); }
      else { rect(c, x + 2, y - 5, x + 4, y - 1, pants); rect(c, x + 2, y, x + 4, y, shoe); } base = y - 5; }
    rect(c, x, base - 5, x + 6, base, shirt);
    rect(c, x - 1, base - 4, x - 1, base - 1, shirt); pt(c, x - 1, base, skin); rect(c, x + 7, base - 4, x + 7, base - 1, shirt); pt(c, x + 7, base, skin);
    const hy = base - 10; rect(c, x + 1, hy, x + 5, hy + 4, skin); const eye = '#141014';
    if (face >= 0) { pt(c, x + 3, hy + 2, eye); pt(c, x + 5, hy + 2, eye); } else { pt(c, x + 1, hy + 2, eye); pt(c, x + 3, hy + 2, eye); }
    if (happy) pt(c, face >= 0 ? x + 4 : x + 2, hy + 4, '#96323C');
    const capc = shirt.toUpperCase() === '#F4F2F7' ? '#FF3B52' : shirt;
    if (style === 'cap') { rect(c, x + 1, hy - 1, x + 5, hy, capc); if (face >= 0) rect(c, x + 5, hy, x + 7, hy, capc); else rect(c, x - 1, hy, x + 1, hy, capc); }
    else if (style === 'beanie') { rect(c, x + 1, hy - 2, x + 5, hy, '#3C3C8C'); pt(c, x + 3, hy - 3, '#F4F2F7'); }
    else if (style === 'long') { rect(c, x + 1, hy - 1, x + 5, hy, hair); rect(c, x, hy, x, hy + 5, hair); rect(c, x + 6, hy, x + 6, hy + 5, hair); }
    else if (style === 'bun') { rect(c, x + 1, hy - 1, x + 5, hy, hair); rect(c, x + 2, hy - 3, x + 4, hy - 2, hair); }
    else if (style !== 'bald') rect(c, x + 1, hy - 1, x + 5, hy, hair);
    if (o.item === 'cup') { rect(c, x + 8, base - 3, x + 9, base, '#F4F2F7'); pt(c, x + 8, base - 3, '#784628'); }
    else if (o.item === 'paper') { rect(c, x + 7, base - 6, x + 11, base - 1, '#EBE6D2'); rect(c, x + 8, base - 4, x + 10, base - 4, '#78727F'); rect(c, x + 8, base - 2, x + 10, base - 2, '#78727F'); }
    else if (o.item === 'tablet') { rect(c, x + 7, base - 5, x + 11, base - 1, '#1E1E24'); rect(c, x + 8, base - 4, x + 10, base - 2, '#3DDC84'); }
    else if (o.item === 'phone') { rect(c, x + 7, base - 4, x + 8, base - 1, '#1E1E24'); pt(c, x + 7, base - 3, '#78C8FF'); }
  }
  const SPR = document.createElement('canvas'); SPR.width = 18; SPR.height = 20; const sg = SPR.getContext('2d');
  function sprite(c, x, y, p, t, k, o) { sg.clearRect(0, 0, 18, 20); person(sg, 5, 18, p, t, o); c.imageSmoothingEnabled = false; c.drawImage(SPR, R(x - 5 * k), R(y - 18 * k), 18 * k, 20 * k); }
  // ------------------------------------------------ logos
  const MARK = ['wwwww.................wwwww.................rrrrrrrrrrrrrrrr', '.wwwww...............wwwwwwww..............rrrrrrrrrrrrrrrr.', '.wwwww..............wwwwwwwwww............rrrrrrrrrrrrrrrr..',
    '..wwwww.............wwwwwwwwwg............rrrrrrrrrrrrrrr...', '..wwwwww...........wwwww.wwwwgg..........rrrrrr.............', '...wwwww...........wwww...wwwgg.........rrrrr...............',
    '....wwwww.........wwwww....wwggg........rrrrr...............', '....wwwww........wwwww.....wwggg.......rrrrr................', '.....wwwww.......wwwww......wgggg......rrrrr..drrrrrrr......',
    '.....wwwww......wwwww........gggg.....rrrrr..ddrrrrrr.......', '......wwwww.....wwwww........ggggs....rrrrr..drrrrrr........', '.......wwww....wwwww..........gggss..rrrrr..ddrrrrrr........',
    '.......wwwww...wwwww...........ggs...rrrr...................', '........wwwwwwwwwww................rrrrrr...................', '........wwwwwwwwww............ddrrrrrrrr....................',
    '.........wwwwwwwww............rrrrrrrrrr....................', '..........wwwwwww..............rrrrrrrr.....................', '...........wwww..................rrrr.......................'];
  const MC = { w: '#FAFAFA', g: '#C4C4CA', s: '#8C8C96', r: '#EC1C34', d: '#A50E24' };
  function markGrid(c, cx, y, px) { const w = MARK[0].length * px, x0 = R(cx - w / 2); for (let j = 0; j < MARK.length; j++) for (let i = 0; i < MARK[j].length; i++) { const ch = MARK[j][i]; if (ch !== '.') rect(c, x0 + i * px, y + j * px, x0 + i * px + px - 1, y + j * px + px - 1, MC[ch]); } return y + MARK.length * px; }
  const WORD = { W: ['X...X', 'X...X', 'X...X', 'X.X.X', 'X.X.X', 'XX.XX', 'X...X'], E: ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'XXXXX'], B: ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X...X', 'X...X', 'XXXX.'],
    F: ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'X....'], L: ['X....', 'X....', 'X....', 'X....', 'X....', 'X....', 'XXXXX'], I: ['XXX', '.X.', '.X.', '.X.', '.X.', '.X.', 'XXX'], X: ['X...X', 'X...X', '.X.X.', '..X..', '.X.X.', 'X...X', 'X...X'] };
  function wordmark(c, cx, y, px, n) {
    const L = 'WEBFLIX', ws = [...L].map(ch => WORD[ch][0].length), tot = (ws.reduce((a, b) => a + b, 0) + 18) * px; let x = R(cx - tot / 2);
    for (let i = 0; i < 7; i++) { if (i < (n === undefined ? 7 : n)) { const col = i < 3 ? '#FAFAFA' : '#EC1C34'; WORD[L[i]].forEach((row, yy) => [...row].forEach((ch, xx) => { if (ch === 'X') rect(c, x + xx * px, y + yy * px, x + xx * px + px - 1, y + yy * px + px - 1, col); })); } x += (ws[i] + 3) * px; }
  }
  // The brand's own logo. Drawn on the full-size canvas after the pixel frame (PX.flushLogos), either as is (crisp, untouched)
  // or pixelated: drawn small at the chosen block size (2 / 4 / 8 px), hard edges, optionally in a 16-colour retro palette.
  const LQ = [], LC = new Map(); let LOPT = { block: 4, retro: false };
  const RETRO = ['#000000', '#FCFCFC', '#BCBCBC', '#7C7C7C', '#F83800', '#A81000', '#FCA044', '#F8B800', '#00B800', '#005800', '#0078F8', '#0000BC', '#6844FC', '#D800CC', '#F878F8', '#00E8D8'].map(h => hx(h));
  function logoSetup(isWF) {
    const mode = TX('logo', isWF ? 'pixel' : 'brand', { label: 'Logo', group: 'Logo', options: [{ value: 'pixel', label: 'Pixel WEBFLIX logo' }, { value: 'brand', label: 'Your logo, pixelated' }, { value: 'asis', label: 'Your logo, as is' }, { value: 'none', label: 'No logo' }] });
    const blk = TX('logo_px', '4', { label: 'Pixel size (pixelated logo)', group: 'Logo', options: [{ value: '2', label: 'Fine' }, { value: '4', label: 'Classic' }, { value: '8', label: 'Chunky' }] });
    const col = TX('logo_col', 'true', { label: 'Colours (pixelated logo)', group: 'Logo', options: [{ value: 'true', label: 'True colours' }, { value: 'retro', label: 'Retro palette' }] });
    LOPT = { block: +blk || 4, retro: col === 'retro' }; return mode;
  }
  function brandLogo(c, cx, y, w, asis) {
    const im = typeof IMG !== 'undefined' && IMG.logoW; if (!im) return y; const ar = (typeof LOGO_AR === 'number' && LOGO_AR > 0) ? LOGO_AR : im.height / im.width;
    let lw = w, lh = R(w * ar); if (lh > w * 0.6) { lh = R(w * 0.6); lw = R(lh / ar); }
    LQ.push({ im, cx, y: R(y), lw, lh, asis: !!asis, block: LOPT.block, retro: LOPT.retro }); return R(y) + lh;
  }
  function pixLogo(q, dw, dh) {
    const pw = Math.max(1, R(dw / q.block)), ph = Math.max(1, R(dh / q.block)), key = (q.im.src || '') + '|' + pw + 'x' + ph + '|' + q.retro; let cv = LC.get(key); if (cv) return cv;
    cv = document.createElement('canvas'); cv.width = pw; cv.height = ph; const c = cv.getContext('2d'); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(q.im, 0, 0, pw, ph);
    const d = c.getImageData(0, 0, pw, ph), a = d.data;
    for (let i = 0; i < a.length; i += 4) { a[i + 3] = a[i + 3] > 100 ? 255 : 0; if (q.retro && a[i + 3]) { let best = 0, bd = 1e9; for (let k = 0; k < RETRO.length; k++) { const p = RETRO[k], dd = (a[i] - p[0]) ** 2 + (a[i + 1] - p[1]) ** 2 + (a[i + 2] - p[2]) ** 2; if (dd < bd) { bd = dd; best = k; } } a[i] = RETRO[best][0]; a[i + 1] = RETRO[best][1]; a[i + 2] = RETRO[best][2]; } }
    c.putImageData(d, 0, 0); if (LC.size > 40) LC.clear(); LC.set(key, cv); return cv;
  }
  function flushLogos() {
    if (!LQ.length) return; const s = Math.min(W / LW, H / LH), ox = (W - LW * s) / 2, oy = (H - LH * s) / 2;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const q of LQ) { const dw = q.lw * s, dh = q.lh * s, x0 = R(ox + (q.cx - q.lw / 2) * s), y0 = R(oy + q.y * s);
      if (q.asis) { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(q.im, x0, y0, R(dw), R(dh)); }
      else { ctx.imageSmoothingEnabled = false; ctx.drawImage(pixLogo(q, dw, dh), x0, y0, R(dw), R(dh)); } }
    ctx.restore(); LQ.length = 0;
  }
  // the logo the clip chose: 'pixel' (the WEBFLIX mark), 'brand' (pixelated), 'asis' (untouched) or 'none'. size 1..4.
  function logoAny(mode, c, cx, y, size, words) {
    if (mode === 'none') return y;
    if (mode === 'brand' || mode === 'asis') return brandLogo(c, cx, y, Math.min(250, 58 * size), mode === 'asis');
    const yb = markGrid(c, cx, y, size); if (words && size >= 2) { wordmark(c, cx, yb + 6 * (size > 2 ? 1.5 : 1), size >= 3 ? 3 : 2, words === true ? 7 : words); return yb + 6 + 7 * (size >= 3 ? 3 : 2); } return yb;
  }
  // ------------------------------------------------ backgrounds and widgets
  function scan(c) { const P = pal(); c.fillStyle = P.SCAN; for (let y = 0; y < LH; y += 3) c.fillRect(0, y, LW, 1); }
  function stars(c, t, seed, n) { const P = pal(), r = rng(seed); for (let i = 0; i < (n || 26); i++) { const x = Math.floor(r() * LW), y = Math.floor(r() * LH), ph = r(), col = r() < 0.6 ? P.WHITE : P.RED; if ((t * 1.5 + ph) % 1 < 0.75) pt(c, x, y, col); } }
  function tri(c, x, y, h, col) { for (let i = 0; i < h; i++) { const k = Math.min(i, h - 1 - i); rect(c, x, y + i, x + k, y + i, col); } }
  function button(c, cx, y, label, on, w) { const P = pal(), bw = w || (tw(label) + 24), x0 = R(cx - bw / 2), x1 = R(cx + bw / 2); rect(c, x0 + 3, y + 3, x1 + 3, y + 23, on ? P.WHITE : P.EDGE); rect(c, x0, y, x1, y + 20, P.RED); txt(c, cx, y + 7, label, { col: P.INK, a: 'm' }); }
  function wipe(c, u, seed) { const P = pal(); c.fillStyle = P.INK; for (let by = 0; by < LH; by += 10) for (let bx = 0; bx < LW; bx += 10) if (((bx * 7 + by * 13 + (seed || 7)) % 97) / 97 > u) c.fillRect(bx, by, 10, 10); }
  function flash(c, col) { c.fillStyle = col; c.fillRect(0, 0, LW, LH); }
  function blit() {   // the pixel frame onto the 1080x1920 canvas, scaled with no smoothing
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; const s = Math.min(W / LW, H / LH), w = LW * s, h = LH * s;
    ctx.fillStyle = pal().INK; ctx.fillRect(0, 0, W, H); ctx.drawImage(LO, R((W - w) / 2), R((H - h) / 2), R(w), R(h)); ctx.restore(); flushLogos();
  }
  function begin() { LQ.length = 0; const P = pal(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.imageSmoothingEnabled = false; g.fillStyle = P.INK; g.fillRect(0, 0, LW, LH); return P; }
  // 'c_<name>' effects from audio/sfx_chip.mp4; one chiptune bed
  const cue = (name, at, vol, pan) => ['c_' + name, at, vol === undefined ? 0.55 : vol, pan || 0];
  const bed = dur => ['chip', 0, dur, 0.5, { style: 'chip' }];
  return { LW, LH, g, LO, fontsP, clamp, ease, bounce, typed, rng, pal, rect, rectO, pt, line, ellipse, poly, txt, tw, people, person, sprite, markGrid, wordmark, brandLogo, logoAny, logoSetup, flushLogos, scan, stars, tri, button, wipe, flash, blit, begin, cue, bed };
})();

STUDIO_REG['pixel'] = (() => {
  const V = QS.get('v') || 'pxstart';
  const { g, clamp, ease, bounce, typed, rng, rect, rectO, pt, line, txt, tw, sprite, logoAny, scan, stars, tri, button, wipe, flash, cue, bed } = PX;
  const isWF = /webflix/i.test((typeof BRAND !== 'undefined' && BRAND.name) || '') || !window.STUDIO;
  const LOGO = PX.logoSetup(isWF);
  const W_ = (k, d, label, max, group) => TX(k, d, { label, max, group: group || 'Words', upper: true });
  const w_ = (k, d, label, max, group) => TX(k, d, { label, max, group: group || 'Words' });
  const blink = (t, hz) => Math.floor(t * (hz || 3)) % 2 === 0;
  const shakeAt = (t, a, b) => (t > a && t < b ? (rng(Math.floor(t * 40))() < 0.5 ? -2 : 2) : 0);

  // ============================================ PRESS START (7s)
  function pxstart() {
    const PLAYER = W_('player', 'PLAYER 1 : YOUR BUSINESS', 'Top line', 26), L1 = W_('line1', 'LEVEL UP', 'Headline', 8), L2 = W_('line2', 'YOUR BUSINESS', 'Second line', 15), CTA = W_('cta', 'DM "START" TO PLAY', 'Button', 22, 'Call to action');
    const DUR = 7.0;
    function render(t) {
      const P = PX.begin(); stars(g, t, 2, 40); scan(g);
      const s = typed(PLAYER, t - 0.2, 30); if (s) { rectO(g, 24, 70, 246, 88, P.EDGE, 2); txt(g, 135, 76, s, { col: P.GREY, a: 'm' }); }
      if (t > 0.9) { const ly = Math.round(-90 + (128 + 90) * bounce((t - 0.9) / 0.7)); logoAny(LOGO, g, 135, ly, 4, false); }
      if (LOGO === 'pixel' && t > 1.7) PX.wordmark(g, 135, 212, 3, Math.min(7, Math.floor((t - 1.7) * 14) + 1));
      txt(g, 135, 262, typed(L1, t - 2.5, 16), { k: 2, col: P.WHITE, sh: P.DRED, a: 'm' });
      txt(g, 135, 286, typed(L2, t - 3.0, 16), { k: 2, col: P.WHITE, sh: P.DRED, a: 'm' });
      if (t > 3.9 && t < 5.6) { if (blink(t)) { tri(g, 68, 340, 11, P.RED); txt(g, 84, 342, 'PRESS START', { col: P.RED }); } }
      else if (t >= 5.6) { if (t < 6.0 && Math.floor(t * 16) % 2 === 0) flash(g, P.WHITE); else button(g, 135, 336, CTA, blink(t)); }
    }
    const cues = () => ({ dur: DUR, beds: [bed(DUR)], events: [cue('drop', 1.4), ...[0, 1, 2, 3, 4, 5, 6].map(i => cue('blip', 1.7 + i / 14, 0.4)), cue('blip', 2.5), cue('blip', 3.0), cue('select', 5.6), cue('coin', 6.0)] });
    return { dur: DUR, render, cues };
  }

  // ============================================ QUEST CHECKLIST
  function pxquest() {
    const Q = W_('quest', 'QUEST 01', 'Quest label', 12), TT = [W_('title1', 'GET YOUR', 'Title line 1', 14), W_('title2', 'BUSINESS', 'Title line 2', 14), W_('title3', 'ONLINE', 'Title line 3', 14)];
    const ITEMS = [w_('item1', 'A real website for your business', 'Item 1', 52, 'Checklist'), w_('item2', 'Looks sharp on every phone', 'Item 2', 52, 'Checklist'), w_('item3', 'Easy to find on Google', 'Item 3', 52, 'Checklist'), w_('item4', 'Customers call or book in one tap', 'Item 4', 52, 'Checklist')].filter(s => s && s.trim());
    const DONE = W_('done', 'QUEST COMPLETE!', 'Win line', 15), REWARD = W_('reward', 'REWARD: MORE CUSTOMERS FIND YOU', 'Reward', 36), CTA = W_('cta', 'START', 'Button', 12, 'Call to action');
    const TD = 2.4 + ITEMS.length * 1.25 + 0.2, DUR = TD + 3.0;
    const wrap = s => { const ws = s.split(' '); let a = '', b = ''; for (const w of ws) { if (!b && (a + ' ' + w).trim().length <= 26) a = (a + ' ' + w).trim(); else b = (b + ' ' + w).trim(); } return [a, b]; };
    function check(x, y, on, u, P) { rect(g, x, y, x + 15, y + 15, P.INK); rectO(g, x, y, x + 15, y + 15, P.WHITE, 1);
      if (on) { const pts = [[3, 8], [4, 9], [5, 10], [6, 11], [7, 10], [8, 9], [9, 8], [10, 7], [11, 6], [12, 5]]; pts.slice(0, Math.max(1, Math.round(pts.length * clamp(u)))).forEach(([a, b]) => rect(g, x + a, y + b, x + a, y + b + 1, P.RED)); } }
    function render(t) {
      const P = PX.begin(); scan(g);
      txt(g, 14, 40, Q, { col: P.GREY });
      if (t > 0.2) logoAny(LOGO, g, 225, 32, 1, false);
      if (t > 0.4) { const bw = Math.round(242 * ease((t - 0.4) / 0.5)); rect(g, 18, 70, 18 + bw, 144, P.DRED); rect(g, 14, 66, 14 + bw, 140, P.INK); rectO(g, 14, 66, 14 + bw, 140, P.RED, 3);
        TT.forEach((ln, i) => txt(g, 26, 78 + i * 20, typed(ln, t - 0.9 - i * 0.45, 20), { f: 'ps16', col: P.WHITE })); }
      ITEMS.forEach((it, i) => { const t0 = 2.4 + i * 1.25; if (t < t0) return; const x = Math.round(-260 + 274 * ease((t - t0) / 0.3)), y = 160 + i * 44;
        rect(g, x, y, x + 241, y + 36, P.PANEL); rectO(g, x, y, x + 241, y + 36, P.EDGE, 2); check(x + 8, y + 10, t > t0 + 0.45, (t - t0 - 0.45) / 0.2, P);
        txt(g, x + 30, y + 14, '0' + (i + 1), { col: P.RED }); const [a, b] = wrap(it); txt(g, x + 50, y + (b ? 4 : 11), a, { f: 'vt', col: P.WHITE }); if (b) txt(g, x + 50, y + 18, b, { f: 'vt', col: P.WHITE }); });
      if (t > TD) { const fl = Math.floor((t - TD) * 6) % 2 === 0 && t < TD + 1; txt(g, 135, 352, DONE, { f: 'ps16', col: fl ? P.YEL : P.WHITE, sh: P.DRED, a: 'm' }); txt(g, 135, 378, typed(REWARD, t - TD - 0.4, 40), { f: 'vt', col: P.GREY, a: 'm' }); }
      if (t > TD + 1.6) { const bw = Math.max(110, tw(CTA) + 44); button(g, 135, 412, CTA, blink(t), bw); tri(g, Math.round(135 - tw(CTA) / 2 - 14), 416, 11, P.INK); }
    }
    const cues = () => { const ev = [cue('drop', 0.4), ...[0, 1, 2].map(i => cue('blip', 0.9 + i * 0.45, 0.4))]; ITEMS.forEach((_, i) => ev.push(cue('drop', 2.4 + i * 1.25, 0.4), cue('coin', 2.85 + i * 1.25))); ev.push(cue('fanfare', TD), cue('select', TD + 1.6)); return { dur: DUR, beds: [bed(DUR)], events: ev }; };
    return { dur: DUR, render, cues };
  }

  // ============================================ GAME OVER (8s)
  function pxover() {
    const H1 = W_('head1', 'GAME', 'Big word 1', 5), H2 = W_('head2', 'OVER', 'Big word 2', 5);
    const L1 = w_('line1', 'No website?', 'Problem line 1', 34), L2 = w_('line2', 'Customers searching for you', 'Problem line 2', 34), L3 = w_('line3', 'find your competitor instead.', 'Problem line 3', 34);
    const BACK = W_('back', 'GET BACK IN THE GAME', 'Comeback line', 28), CTA = W_('cta', 'DM "START"', 'Button', 22, 'Call to action');
    const DUR = 8.0;
    function render(t) {
      const P = PX.begin();
      if (t < 0.5) { const r = rng(Math.floor(t * 30) + 1), cols = [P.WHITE, P.GREY, P.DIM, P.INK]; for (let i = 0; i < 900; i++) pt(g, Math.floor(r() * 270), Math.floor(r() * 480), cols[Math.floor(r() * 4)]); return; }
      g.fillStyle = P.BAR; for (let y = 0; y < 480; y += 3) g.fillRect(0, y, 270, 1);
      [H1, H2].forEach((wd, li) => [...wd].forEach((ch, k) => { const t0 = 0.6 + (li * 4 + k) * 0.12; if (t < t0) return; const yy = Math.round(-40 + (70 + li * 46 + 40) * bounce((t - t0) / 0.35)); const n = wd.length; txt(g, 135 - (n * 32) / 2 + k * 32 + 16, yy, ch, { f: 'ps16', k: 2, col: P.RED, sh: P.DRED, a: 'm' }); }));
      if (t > 1.8) { txt(g, 135, 180, typed(L1, t - 1.8, 30), { f: 'vt', col: P.WHITE, a: 'm' }); txt(g, 135, 198, typed(L2, t - 2.3, 30), { f: 'vt', col: P.GREY, a: 'm' }); txt(g, 135, 214, typed(L3, t - 3.1, 30), { f: 'vt', col: P.GREY, a: 'm' }); }
      if (t > 3.9) { rect(g, 40, 250, 230, 340, P.INK); rectO(g, 40, 250, 230, 340, P.WHITE, 2); txt(g, 135, 262, 'CONTINUE?', { f: 'ps16', col: P.WHITE, a: 'm' });
        const cnt = Math.max(7, 9 - Math.floor((t - 3.9) / 0.6)); if (t < 5.6) txt(g, 135, 284, String(cnt), { f: 'ps16', col: P.YEL, a: 'm' });
        const yes = t > 5.4; if (blink(t) || yes) tri(g, 70, 314, 9, P.RED); txt(g, 84, 315, 'YES', { col: yes ? P.RED : P.WHITE }); txt(g, 160, 315, 'NO', { col: P.DIM });
        if (t > 5.6 && t < 5.9 && Math.floor(t * 20) % 2 === 0) { flash(g, P.WHITE); return; } }
      if (t > 5.9) { txt(g, 135, 362, typed(BACK, t - 5.9, 30), { col: P.WHITE, a: 'm' }); logoAny(LOGO, g, 135, 382, 2, false); if (t > 6.6) button(g, 135, 432, CTA, blink(t)); }
    }
    const cues = () => ({ dur: DUR, beds: [['chip', 3.9, DUR, 0.45, { style: 'chip' }]], events: [...[0, 1, 2, 3, 4, 5, 6, 7].map(i => cue('blip', 0.6 + i * 0.12, 0.4)), cue('gameover', 1.6, 0.6), cue('tick', 3.9), cue('tick', 4.5), cue('tick', 5.1), cue('select', 5.5), cue('powerup', 5.9), cue('coin', 6.6)] });
    return { dur: DUR, render, cues };
  }

  // ============================================ BOSS FIGHT (11s)
  function pxboss() {
    const FOE = W_('foe', 'COMPETITOR', 'Rival name', 13, 'Fighters'), FOEN = W_('foe_note', 'HAS A WEBSITE', 'Rival note', 20, 'Fighters'), YOU = W_('you', 'YOU', 'Your name', 13, 'Fighters'), LOW = W_('you_low', 'NO WEBSITE - HP LOW', 'Low HP note', 24, 'Fighters');
    const POWER = W_('power', 'POWER-UP: A WEBFLIX WEBSITE', 'Power-up', 30), WIN = W_('win', 'YOU WIN!', 'Win line', 9), WINL = w_('win_line', 'Full HP. Back in the fight.', 'Win sub-line', 34), CTA = W_('cta', 'DM "START"', 'Button', 22, 'Call to action');
    const DUR = 11.0, FOEP = ['#E9B482', '#1E1E22', '#468CE6', '#1E1E28', 'short'], YOUP = ['#C6865A', '#281C16', '#F4F2F7', '#323238', 'cap'];
    function bar(y, label, note, n, ncol, P) { txt(g, 14, y, label, { col: P.WHITE }); txt(g, 256, y - 4, note, { f: 'vt', col: ncol, a: 'r' }); rect(g, 14, y + 12, 256, y + 30, P.INK); rectO(g, 14, y + 12, 256, y + 30, P.WHITE, 2);
      for (let i = 0; i < 12; i++) { const x = 18 + i * 20; rect(g, x, y + 16, x + 16, y + 26, i < n ? (n > 4 ? P.WHITE : P.RED) : P.BAR); } }
    function render(t) {
      const P = PX.begin(); scan(g); const sh = shakeAt(t, 3.0, 3.4) || shakeAt(t, 7.6, 8.0);
      txt(g, 135 + sh, 24, 'BOSS FIGHT', { f: 'ps16', col: (t < 1 && Math.floor(t * 4) % 2 === 0) ? P.WHITE : P.RED, sh: P.DRED, a: 'm' });
      const you = t < 3.0 ? 12 : (t < 5.4 ? 2 : Math.min(12, 2 + Math.floor((t - 5.4) * 14))), foe = t < 7.6 ? 12 : 3;
      if (t > 0.6) { bar(56, FOE, FOEN, foe, P.GREY, P); bar(100, YOU, t >= 3.0 && t < 5.6 ? LOW : '', you, P.RED, P); }
      rect(g, 0, 300, 269, 304, P.EDGE); for (let x = 0; x < 270; x += 12) rect(g, x, 305, x + 5, 308, P.BAR);
      const yx = 30 + sh, fx = 196 + (t < 7.6 ? 0 : 6);
      if (!(t > 3.0 && t < 3.4 && Math.floor(t * 20) % 2)) sprite(g, yx, 300, YOUP, t, 6, { happy: t > 5.6 });
      if (!(t > 7.6 && t < 8.0 && Math.floor(t * 20) % 2)) { sprite(g, fx, 300, FOEP, t, 7, { happy: t < 7.6, face: -1 }); rect(g, fx - 26, 218, fx - 4, 246, P.WHITE); rectO(g, fx - 26, 218, fx - 4, 246, '#468CE6', 2); txt(g, fx - 15, 224, 'W', { f: 'ps16', col: '#468CE6', a: 'm' }); }
      if (t > 2.2 && t < 3.0) { const u = (t - 2.2) / 0.8, px = Math.round(fx - 40 - (fx - 40 - yx - 40) * u); rect(g, px, 226, px + 18, 238, '#468CE6'); rect(g, px + 4, 229, px + 14, 235, P.WHITE); }
      if (t > 3.0 && t < 3.25) flash(g, P.DRED);
      if (t > 3.6 && t < 5.4) { const py = Math.round(-30 + 302 * bounce((t - 3.6) / 0.8)); rect(g, 100, py, 128, py + 26, P.RED); rectO(g, 100, py, 128, py + 26, P.WHITE, 2); txt(g, 114, py + 6, 'W', { f: 'ps16', col: P.WHITE, a: 'm' });
        if (blink(t, 6)) [[94, py - 4], [134, py + 2], [112, py - 10]].forEach(([a, b]) => pt(g, a, b, P.YEL)); }
      if (t > 3.8 && t < 7.0) { const msg = t < 5.6 ? POWER : 'HP RESTORED!'; rect(g, 10, 330, 260, 372, P.INK); rectO(g, 10, 330, 260, 372, P.WHITE, 2); txt(g, 135, 346, typed(msg, t - (t < 5.6 ? 3.8 : 5.6), 30), { col: t > 5.6 ? P.YEL : P.WHITE, a: 'm' }); }
      if (t > 5.4 && t < 5.7 && Math.floor(t * 20) % 2 === 0) flash(g, P.WHITE);
      if (t > 6.8 && t < 7.6) { const u = (t - 6.8) / 0.8, px = Math.round(yx + 50 + (fx - 50 - yx - 50) * u); for (let k = 0; k < 4; k++) rect(g, px - k * 10, 228 + (k % 2) * 5, px - k * 10 + 6, 234 + (k % 2) * 5, k ? P.DRED : P.RED); rect(g, px, 224, px + 13, 239, P.RED); rect(g, px + 4, 228, px + 9, 235, P.WHITE); }
      if (t > 8.2) { txt(g, 135, 332, WIN, { k: 2, col: P.YEL, sh: P.DRED, a: 'm' }); txt(g, 135, 362, typed(WINL, t - 8.4, 30), { f: 'vt', col: P.WHITE, a: 'm' }); if (t > 9.0) { logoAny(LOGO, g, 135, 392, 1, false); button(g, 135, 420, CTA, blink(t)); } }
    }
    const cues = () => ({ dur: DUR, beds: [bed(DUR)], events: [cue('hit', 0.0, 0.5), cue('blip', 0.6), cue('shoot', 2.2), cue('hit', 3.0, 0.6), cue('bonk', 3.0), cue('drop', 3.6), cue('powerup', 5.4, 0.6), cue('shoot', 6.8), cue('hit', 7.6, 0.6), cue('fanfare', 8.2, 0.6), cue('coin', 9.0)] });
    return { dur: DUR, render, cues };
  }

  // ============================================ INSERT COIN (10s)
  function pxcoin() {
    const TT = [W_('title1', 'YOUR', 'Headline line 1', 16), W_('title2', 'BUSINESS', 'Headline line 2', 16), W_('title3', 'DESERVES A', 'Headline line 3', 16), W_('title4', 'WEBSITE', 'Headline line 4 (accent)', 16)].filter(Boolean);
    const LV = [[W_('lv1', 'LV1', 'Level 1 tag', 3, 'Levels'), w_('lv1t', 'Launch your website', 'Level 1', 30, 'Levels')], [W_('lv2', 'LV2', 'Level 2 tag', 3, 'Levels'), w_('lv2t', 'Get found on Google', 'Level 2', 30, 'Levels')], [W_('lv3', 'LV3', 'Level 3 tag', 3, 'Levels'), w_('lv3t', 'Turn visitors into customers', 'Level 3', 30, 'Levels')]].filter(l => l[1] && l[1].trim());
    const INS = W_('insert', 'INSERT COIN', 'Blinking line', 15), CTA = W_('cta', 'DM "START" TO PLAY', 'Button', 22, 'Call to action');
    const DUR = 10.0, T7 = 4.6 + LV.length * 0.9 + 0.3;
    function render(t) {
      const P = PX.begin(); stars(g, t, 9, 30); scan(g);
      if (t < 1.6) { rect(g, 95, 220, 175, 300, P.PANEL); rectO(g, 95, 220, 175, 300, P.GREY, 2); rect(g, 131, 240, 139, 280, P.INK); rectO(g, 131, 240, 139, 280, P.RED, 1);
        const cy = Math.round(60 + 180 * Math.pow(clamp((t - 0.2) / 0.7), 2)); if (t < 0.95) { PX.ellipse(g, 125, cy - 10, 145, cy + 10, P.YEL, '#BE8C28', 2); txt(g, 135, cy - 4, '$', { col: '#BE8C28', a: 'm' }); }
        if (t > 0.95) txt(g, 135, 320, 'CREDIT 01', { col: P.YEL, a: 'm' }); return; }
      txt(g, 135, 40, '- NEW GAME -', { col: P.GREY, a: 'm' });
      const ly = Math.round(-80 + 144 * bounce((t - 1.7) / 0.6)); logoAny(LOGO, g, 135, ly, 4, false);
      if (LOGO === 'pixel' && t > 2.3) PX.wordmark(g, 135, 148, 2, Math.min(7, Math.floor((t - 2.3) * 14) + 1));
      TT.forEach((ln, i) => txt(g, 135, 178 + i * 20, typed(ln, t - 2.8 - i * 0.35, 20), { f: 'ps16', col: i === TT.length - 1 ? P.RED : P.WHITE, a: 'm' }));
      LV.forEach(([lv, lab], i) => { const t0 = 4.6 + i * 0.9; if (t < t0) return; const y = 270 + i * 40, u = ease((t - t0) / 0.25), w = Math.round(242 * u);
        rect(g, 14, y, 14 + w, y + 32, P.PANEL); rectO(g, 14, y, 14 + w, y + 32, P.EDGE, 2);
        if (u >= 1) { rect(g, 22, y + 7, 52, y + 25, P.RED); txt(g, 37, y + 12, lv, { col: P.INK, a: 'm' }); txt(g, 60, y + 9, typed(lab, t - t0 - 0.25, 40), { f: 'vt', col: P.WHITE }); } });
      if (t > T7 + 0.2) { if (blink(t)) txt(g, 135, 396, INS, { f: 'ps16', col: P.RED, sh: P.DRED, a: 'm' }); if (t > T7 + 0.7) button(g, 135, 424, CTA, true); }
      if (t < 1.9) wipe(g, (t - 1.6) / 0.3);
    }
    const cues = () => ({ dur: DUR, beds: [['chip', 1.6, DUR, 0.5, { style: 'chip' }]], events: [cue('coindrop', 0.9, 0.6), cue('select', 1.6), cue('drop', 1.9), ...[0, 1, 2, 3, 4, 5, 6].map(i => cue('blip', 2.3 + i / 14, 0.35)), ...LV.map((_, i) => cue('coin', 4.6 + i * 0.9)), cue('fanfare', T7 + 0.2, 0.6), cue('coin', T7 + 0.7)] });
    return { dur: DUR, render, cues };
  }

  const MAKE = { pxstart, pxquest, pxover, pxboss, pxcoin };
  const P = (MAKE[V] || pxstart)();
  DIR = { dur: P.dur, bg: BLK, finish: { vig: 0, grain: 0 }, edl: [], shakes: [], preload: () => PX.fontsP,
    render(t) { if (VID.collecting) return; P.render(t); PX.blit(); }, cues: P.cues };
});
