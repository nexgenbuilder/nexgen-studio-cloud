'use strict';
/* Motion kit 10 (V10, Oct 30): the transition studio. Requires kit3 (K3), kit4 (K4), kit8 (K8).
   One registry, one API: KT.run(id, u, A, B, o) draws the transition at progress u (0..1) between A() and B(), which each draw a
   whole frame. o = { t (seconds, for animated textures), dir, amt (intensity 0..2), col (colour token or #hex), ease (timing profile),
   text (typographic transitions) }. The editor's preview, the library's previews and the export all call this same code.
   Each entry: { id, cat, name, desc, d (default seconds), dirs (allowed directions, first is the default), color (uses a colour),
   zoom (scales the footage: hidden for DPG, whose footage is never zoomed), dpgOff, text (uses a word), sfx (sound it syncs to) }. */
const KT = (() => {
  const TAU = Math.PI * 2, into = K4.into, clipTo = K4.clipTo, GI = K4.GI, D = () => ctx.restore();
  const LIST = [], MAP = {};
  const CATS = [['cine', 'Cinematic'], ['dyn', 'Dynamic'], ['geo', 'Geometric'], ['glitch', 'Glitch'], ['liquid', 'Liquid'], ['photo', 'Photo'], ['type', 'Typographic'], ['social', 'Social'], ['premium', 'Premium'], ['creative', 'Creative']];
  const HV = ['left', 'right', 'up', 'down'], LR = ['left', 'right'], UD = ['up', 'down'];
  function def(id, cat, name, desc, o, fn) { const t = Object.assign({ id, cat, name, desc, d: 0.6, dirs: null, color: false, zoom: false, dpgOff: false, text: false, sfx: 'whoosh', fn }, o); LIST.push(t); MAP[id] = t; }
  const C = (o, d) => K8.col(o.col || d || 'accent');
  const V = d => (d === 'right' ? [1, 0] : d === 'up' ? [0, -1] : d === 'down' ? [0, 1] : [-1, 0]);   // direction of travel
  const imgA = A => into('ktA', A), imgB = B => into('ktB', B);
  function put(c, cv, cx, cy, sx, sy, rot, a) { c.save(); c.translate(cx, cy); if (rot) c.rotate(rot); c.scale(sx, sy === undefined ? sx : sy); if (a !== undefined) c.globalAlpha *= a; c.drawImage(cv, -W / 2, -H / 2); c.restore(); }
  const blackBg = () => fillScreen('#000');
  const word = o => String(o.text || (typeof BRAND !== 'undefined' && (BRAND.short || BRAND.name)) || 'WOW').toUpperCase().slice(0, 14);
  const WARP = { auto: u => u, smooth: E.inOutS, early: u => E.outC(u), late: u => E.inC(u), linear: u => u };
  const lmod = (a, b) => ((a % b) + b) % b;
  function run(id, u, A, B, o) {
    o = Object.assign({ t: 0, dir: '', amt: 1, col: '', ease: 'auto', text: '' }, o || {});
    const T = MAP[id] || MAP[ALIAS[id]] || MAP.dissolve; u = clamp((WARP[o.ease] || WARP.auto)(clamp(u)));
    if (!o.dir || (T.dirs && !T.dirs.includes(o.dir))) o.dir = T.dirs ? T.dirs[0] : '';
    o.amt = clamp(+o.amt || (o.amt === 0 ? 0 : 1), 0, 2);
    if (VID.collecting) { A(); B(); return; }
    if (u <= 0) { A(); return; } if (u >= 1 && T.id !== 'cut') { B(); return; }
    T.fn(u, A, B, o);
  }
  const ALIAS = {};
  const R0 = () => [0, 0, W, H];
  const k4 = name => (u, A, B, o) => K4.run(name, R0(), u, A, B, { t: o.t, text: word(o), col: o.col ? C(o) : undefined, dir: o.dir === 'right' ? -1 : 1 });
  // multi-copy blur along a vector (for motion and zoom blur on whole frames)
  function smear(c, cv, cx, cy, s, dx, dy, n, a) { for (let j = 0; j < n; j++) { const f = n === 1 ? 0 : j / (n - 1) - 0.5; c.save(); c.globalAlpha *= (a === undefined ? 1 : a) / n * (j === Math.floor(n / 2) ? 1.6 : 0.85); c.translate(cx + dx * f, cy + dy * f); c.scale(s, s); c.drawImage(cv, -W / 2, -H / 2); c.restore(); } }
  function zsmear(c, cv, s0, s1, n, a) { for (let j = 0; j < n; j++) { const s = lerp(s0, s1, n === 1 ? 0 : j / (n - 1)); c.save(); c.globalAlpha *= (a === undefined ? 1 : a) * (j === 0 ? 1 : 0.5 / n); c.translate(W / 2, H / 2); c.scale(s, s); c.drawImage(cv, -W / 2, -H / 2); c.restore(); } }
  function chan(cv, col) { const s = scratch('ktC' + col); const g = s.g; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'copy'; g.drawImage(cv, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = col; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'destination-in'; g.drawImage(cv, 0, 0); g.globalCompositeOperation = 'source-over'; return s; }
  function dip(u, A, B, col) { if (u < 0.5) { A(); fillScreen(col, E.inOutS(u * 2)); } else { B(); fillScreen(col, 1 - E.inOutS(u * 2 - 1)); } }

  // ================================================================ CINEMATIC
  def('cut', 'cine', 'Cut', 'A straight cut, no transition.', { d: 0.2, sfx: '' }, (u, A, B) => (u < 0.5 ? A : B)());
  def('dissolve', 'cine', 'Cross dissolve', 'The classic soft blend from one shot into the next.', { d: 0.6, sfx: 'air' }, (u, A, B) => { A(); ctx.save(); ctx.globalAlpha *= E.inOutS(u); B(); ctx.restore(); });
  def('filmdis', 'cine', 'Film dissolve', 'A dissolve with a breath of film grain, gate weave and exposure.', { d: 0.9, sfx: 'air' }, (u, A, B, o) => {
    const a = imgA(A), b = imgB(B), k = Math.sin(Math.PI * u), fr = Math.floor(o.t * 24), wy = (hash(fr * 3.7) - 0.5) * 8 * k * o.amt, c = GI(); blackBg();
    c.drawImage(a, 0, wy); c.globalAlpha = E.inOutS(u); c.drawImage(b, 0, wy); c.globalAlpha = 1;
    c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,236,210,${0.16 * k * o.amt})`; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over';
    if (NOISE.length) { c.translate(Math.floor(hash(fr * 1.7) * 256), Math.floor(hash(fr * 2.3) * 256)); c.fillStyle = NOISE[fr % 4]; c.globalAlpha = 0.9 * k * o.amt; c.fillRect(-256, -256, W + 512, H + 512); } D(); });
  def('burn', 'cine', 'Film burn', 'Orange light burns in from the edge and hides the cut.', { d: 0.9, dirs: ['right', 'left', 'up', 'down'], sfx: 'burn' }, (u, A, B, o) => {
    (u < 0.5 ? A : B)(); const k = Math.pow(Math.sin(Math.PI * u), 1.6) * 0.8 * o.amt, [vx, vy] = V(o.dir), ex = vx > 0 ? 0 : vx < 0 ? W : W / 2, ey = vy > 0 ? 0 : vy < 0 ? H : H * 0.45, c = GI(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { const ox = ex + (hash(i * 3.3) - 0.5) * 600 + vx * W * u * 0.7, oy = ey + (hash(i * 7.9) - 0.5) * 1100 + vy * H * u * 0.7, r = (380 + hash(i) * 520) * (0.4 + u * 0.9);
      const g = c.createRadialGradient(ox, oy, 0, ox, oy, r); g.addColorStop(0, `rgba(255,240,200,${0.95 * k})`); g.addColorStop(0.3, `rgba(255,130,40,${0.75 * k})`); g.addColorStop(0.7, `rgba(210,40,10,${0.35 * k})`); g.addColorStop(1, 'rgba(120,0,0,0)'); c.fillStyle = g; c.fillRect(ox - r, oy - r, 2 * r, 2 * r); } D(); });
  def('flare', 'cine', 'Lens flare', 'A bright flare sweeps across and flashes over the cut.', { d: 0.8, dirs: LR, color: true, sfx: 'swell' }, (u, A, B, o) => {
    (u < 0.5 ? A : B)(); const k = Math.pow(Math.sin(Math.PI * u), 1.5) * o.amt, x = o.dir === 'right' ? lerp(-0.2 * W, 1.2 * W, u) : lerp(1.2 * W, -0.2 * W, u), y = H * 0.4, col = o.col ? C(o) : '#FFD9A0', c = GI(); c.globalCompositeOperation = 'lighter';
    const g = c.createRadialGradient(x, y, 0, x, y, H * 0.55); g.addColorStop(0, `rgba(255,255,255,${0.9 * k})`); g.addColorStop(0.12, K8.rgba(col, 0.55 * k)); g.addColorStop(0.5, K8.rgba(col, 0.12 * k)); g.addColorStop(1, K8.rgba(col, 0)); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI + u, l = 220 + 160 * hash(i); c.strokeStyle = `rgba(255,255,255,${0.35 * k})`; c.lineWidth = 3; c.beginPath(); c.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
    const s = c.createLinearGradient(0, y, W, y); s.addColorStop(0, K8.rgba(col, 0)); s.addColorStop(clamp(x / W), `rgba(230,240,255,${0.8 * k})`); s.addColorStop(1, K8.rgba(col, 0)); c.fillStyle = s; c.fillRect(0, y - 6, W, 12);
    c.fillStyle = `rgba(255,255,255,${Math.max(0, Math.sin(Math.PI * u) - 0.88) * 4})`; c.fillRect(0, 0, W, H); D(); });
  def('leak', 'cine', 'Light leak', 'A warm bloom of light across a soft blend.', { d: 0.8, sfx: 'shimmer' }, k4('leak'));
  def('exposure', 'cine', 'Exposure flash', 'The shot overexposes to white and the next one develops out of it.', { d: 0.7, sfx: 'flash' }, (u, A, B, o) => {
    const first = u < 0.5, k = first ? E.inC(u * 2) : 1 - E.outC(u * 2 - 1), cv = first ? imgA(A) : imgB(B), c = GI(); c.drawImage(cv, 0, 0); c.globalCompositeOperation = 'lighter';
    c.globalAlpha = clamp(k * 1.2 * o.amt); c.drawImage(cv, 0, 0); c.globalAlpha = clamp(k * o.amt); c.drawImage(cv, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.fillStyle = `rgba(255,255,255,${clamp(k * k * o.amt)})`; c.fillRect(0, 0, W, H); D(); });
  def('focus', 'cine', 'Soft focus', 'The shot melts out of focus while the next one sharpens in.', { d: 0.9, sfx: 'air' }, (u, A, B, o) => {
    const a = imgA(A), c = GI(); c.drawImage(K8.blurred(a, E.inC(clamp(u * 1.3)) * 34 * o.amt), 0, 0, W, H); const b = imgB(B); c.globalAlpha = E.inOutS(u); c.drawImage(K8.blurred(b, (1 - E.outC(clamp(u * 1.3 - 0.3))) * 34 * o.amt), 0, 0, W, H); D(); });
  def('fade', 'cine', 'Dip to black', 'Fade down to black, then up into the next shot.', { d: 0.8, sfx: 'air' }, (u, A, B) => dip(u, A, B, LIGHTPAL ? '#000000' : BLK));
  def('dipwhite', 'cine', 'Dip to white', 'A clean fade through white.', { d: 0.7, sfx: 'shimmer' }, (u, A, B) => dip(u, A, B, '#FFFFFF'));
  def('bars', 'cine', 'Cinema bars', 'Letterbox bars close like a curtain and open on the next shot.', { d: 0.9, color: true, sfx: 'whoosh' }, (u, A, B, o) => {
    (u < 0.5 ? A : B)(); const k = u < 0.5 ? E.inOutC(u * 2) : 1 - E.inOutC(u * 2 - 1), h = (H / 2 + 2) * k, c = GI(); c.fillStyle = o.col ? C(o) : '#000'; c.fillRect(0, 0, W, h); c.fillRect(0, H - h, W, h); D(); });
  def('iris', 'cine', 'Iris open', 'The next shot opens out of a circle.', { d: 0.7, color: true, sfx: 'whoosh' }, (u, A, B, o) => K4.run('iris', R0(), u, A, B, { col: C(o) }));
  def('irisclose', 'cine', 'Iris close', 'Old-film iris: closes to black, opens on the next shot.', { d: 0.9, sfx: 'whoosh' }, (u, A, B) => {
    const first = u < 0.5, k = first ? E.inOutC(u * 2) : 1 - E.inOutC(u * 2 - 1), r = (1 - k) * Math.hypot(W, H) * 0.55; (first ? A : B)(); const c = GI(); c.fillStyle = '#000'; c.beginPath(); c.rect(0, 0, W, H); c.arc(W / 2, H / 2, Math.max(0, r), 0, TAU, true); c.fill('evenodd'); D(); });
  def('glass', 'cine', 'Glass refraction', 'Seen through fluted glass: strips bend and resolve into the next shot.', { d: 0.9, sfx: 'shimmer' }, (u, A, B, o) => {
    const a = imgA(A), b = imgB(B), n = Math.round(12 + o.amt * 6), sw = W / n, k = Math.sin(Math.PI * u), e = E.inOutS(u), c = GI(); blackBg();
    for (let i = 0; i < n; i++) { const dx = Math.sin(i * 1.7 + u * 7) * 90 * k * o.amt, x = i * sw; c.save(); c.beginPath(); c.rect(x, 0, sw + 1, H); c.clip(); c.globalAlpha = 1; c.drawImage(a, dx, 0); c.globalAlpha = e; c.drawImage(b, -dx, 0); c.globalAlpha = 0.18 * k; c.fillStyle = '#fff'; c.fillRect(x, 0, 3, H); c.restore(); } D(); });
  // ================================================================ DYNAMIC
  def('whip', 'dyn', 'Whip pan', 'A fast pan with motion blur into the next shot.', { d: 0.45, dirs: LR, sfx: 'whoosh' }, k4('whip'));
  def('snapzoom', 'dyn', 'Snap zoom', 'Rockets into the shot with a zoom blur and snaps out on the next.', { d: 0.5, zoom: true, sfx: 'whoosh' }, (u, A, B, o) => {
    const c = GI(); blackBg(); if (u < 0.5) { const k = E.inC(u * 2), a = imgA(A); zsmear(c, a, 1 + k * 0.9 * o.amt, 1 + k * 1.4 * o.amt, 6); } else { const k = E.outC(u * 2 - 1), b = imgB(B); zsmear(c, b, 1 + (1 - k) * 0.6 * o.amt, 1 + (1 - k) * 1.0 * o.amt, 6); }
    c.fillStyle = `rgba(255,255,255,${Math.max(0, 1 - Math.abs(u - 0.5) / 0.15) * 0.6})`; c.fillRect(0, 0, W, H); D(); });
  def('zoompunch', 'dyn', 'Zoom punch', 'The next shot punches in from close up and settles.', { d: 0.45, zoom: true, sfx: 'impact' }, (u, A, B, o) => {
    const c = GI(); blackBg(); if (u < 0.4) { const a = imgA(A); put(c, a, W / 2, H / 2, 1 + E.inC(u / 0.4) * 0.12 * o.amt); } else { const b = imgB(B), k = E.outBack(clamp((u - 0.4) / 0.6)); put(c, b, W / 2, H / 2, 1 + (1 - k) * 0.35 * o.amt); }
    c.fillStyle = `rgba(255,255,255,${Math.max(0, 1 - Math.abs(u - 0.42) / 0.1) * 0.7})`; c.fillRect(0, 0, W, H); D(); });
  def('speedramp', 'dyn', 'Speed ramp', 'A push that accelerates into a blur and brakes on the next shot.', { d: 0.6, dirs: HV, dpgOff: true, sfx: 'riser' }, (u, A, B, o) => {
    const [vx, vy] = V(o.dir), e = E.inOutQ(u), vel = Math.sin(Math.PI * u), a = imgA(A), b = imgB(B), c = GI(); blackBg();
    const off = e * (vx ? W : H); smear(c, a, W / 2 + vx * off, H / 2 + vy * off, 1, vx * 400 * vel * o.amt, vy * 400 * vel * o.amt, 7); smear(c, b, W / 2 + vx * (off - (vx ? W : H)), H / 2 + vy * (off - (vx ? W : H)), 1, vx * 400 * vel * o.amt, vy * 400 * vel * o.amt, 7); D(); });
  def('mblur', 'dyn', 'Motion blur slide', 'Slides through with heavy directional motion blur.', { d: 0.5, dirs: HV, sfx: 'whoosh' }, (u, A, B, o) => {
    const [vx, vy] = V(o.dir), e = E.inOutC(u), vel = Math.sin(Math.PI * u), a = imgA(A), b = imgB(B), sp = vx ? W : H, c = GI(); blackBg();
    smear(c, a, W / 2 + vx * e * sp, H / 2 + vy * e * sp, 1, vx * 260 * vel * o.amt, vy * 260 * vel * o.amt, 6); smear(c, b, W / 2 + vx * (e - 1) * sp, H / 2 + vy * (e - 1) * sp, 1, vx * 260 * vel * o.amt, vy * 260 * vel * o.amt, 6); D(); });
  def('shake', 'dyn', 'Camera shake', 'A jolt of camera shake hides the cut.', { d: 0.5, sfx: 'impact' }, (u, A, B, o) => {
    const cv = u < 0.5 ? imgA(A) : imgB(B), fr = Math.floor(o.t * 30), k = Math.sin(Math.PI * u) * o.amt, dx = (hash(fr * 3.1) - 0.5) * 90 * k, dy = (hash(fr * 7.7) - 0.5) * 70 * k, c = GI(); blackBg();
    c.drawImage(cv, dx, dy); if (k > 0.5) { c.globalAlpha = 0.35; c.drawImage(cv, dx * -0.6, dy * -0.6); } D(); });
  def('push', 'dyn', 'Push', 'The next shot pushes the current one out of frame.', { d: 0.5, dirs: ['up', 'down', 'left', 'right'], sfx: 'whoosh' }, (u, A, B, o) => {
    const [vx, vy] = V(o.dir), e = E.inOutC(u), a = imgA(A), b = imgB(B), c = GI(); c.drawImage(a, vx * e * W, vy * e * H); c.drawImage(b, vx * (e - 1) * W, vy * (e - 1) * H); D(); });
  def('pullback', 'dyn', 'Dynamic pullback', 'The shot pulls away into the distance, revealing the next behind it.', { d: 0.7, sfx: 'whoosh' }, (u, A, B, o) => {
    B(); const a = imgA(A), e = E.inOutC(u), s = lerp(1, 0.28, e), c = GI(); c.globalAlpha = 1 - E.inC(clamp((u - 0.6) / 0.4)); c.save(); c.translate(W / 2, H / 2); c.scale(s, s); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 60 / s; c.beginPath(); c.roundRect(-W / 2, -H / 2, W, H, 60 * e / s); c.fillStyle = '#000'; c.fill(); c.clip(); c.shadowBlur = 0; c.drawImage(a, -W / 2, -H / 2); c.restore(); D(); });
  def('spin', 'dyn', 'Rotational', 'A spinning hand-off: out turning one way, in turning back.', { d: 0.6, dirs: LR, sfx: 'whoosh' }, (u, A, B, o) => {
    const sg = o.dir === 'right' ? 1 : -1, c = GI(); blackBg();
    if (u < 0.5) { const k = E.inC(u * 2); put(c, imgA(A), W / 2, H / 2, 1 - 0.45 * k, 1 - 0.45 * k, sg * k * Math.PI * 0.5 * o.amt, 1); } else { const k = 1 - E.outC(u * 2 - 1); put(c, imgB(B), W / 2, H / 2, 1 - 0.45 * k, 1 - 0.45 * k, -sg * k * Math.PI * 0.5 * o.amt, 1); } D(); });
  def('slide', 'dyn', 'Slide over', 'The next shot slides over with an accent edge.', { d: 0.55, dirs: HV, color: true, sfx: 'swish' }, (u, A, B, o) => {
    const [vx, vy] = V(o.dir), e = E.inOutC(u), a = imgA(A), b = imgB(B), c = GI(); c.drawImage(a, vx * e * W, vy * e * H); const bx = -vx * (1 - e) * W, by = -vy * (1 - e) * H; c.drawImage(b, bx, by); c.fillStyle = C(o);
    if (vx) c.fillRect(vx < 0 ? bx - 10 : bx + W, 0, 10, H); else c.fillRect(0, vy < 0 ? by - 10 : by + H, W, 10); D(); });
  // ================================================================ GEOMETRIC
  def('wipe', 'geo', 'Accent wipe', 'A slanted wipe with a band of your accent colour.', { d: 0.6, color: true, sfx: 'swish' }, (u, A, B, o) => {
    A(); const e = E.inOutC(u), x = lerp(-W * 0.6, W * 1.6, e), sl = 380; clipTo(c => { c.moveTo(-10, -10); c.lineTo(x + sl, -10); c.lineTo(x - sl, H + 10); c.lineTo(-10, H + 10); c.closePath(); }, B);
    const c = K3.G(); c.fillStyle = C(o); c.beginPath(); c.moveTo(x + sl, -10); c.lineTo(x + sl + 26, -10); c.lineTo(x - sl + 26, H + 10); c.lineTo(x - sl, H + 10); c.closePath(); c.fill(); K3.D(); });
  def('diag', 'geo', 'Diagonal wipe', 'A hard diagonal edge sweeps across with a fine line.', { d: 0.55, dirs: LR, color: true, sfx: 'swish' }, (u, A, B, o) => {
    A(); const e = E.inOutC(u), sl = H * 0.6, x = o.dir === 'left' ? lerp(W + sl, -sl, e) : lerp(-sl, W + sl, e), path = c => { if (o.dir === 'left') { c.moveTo(x - sl / 2, H + 10); c.lineTo(x + sl / 2, -10); c.lineTo(W + 10, -10); c.lineTo(W + 10, H + 10); } else { c.moveTo(-10, -10); c.lineTo(x + sl / 2, -10); c.lineTo(x - sl / 2, H + 10); c.lineTo(-10, H + 10); } c.closePath(); };
    clipTo(path, B); const c = GI(); c.strokeStyle = o.col ? C(o) : '#FFFFFF'; c.lineWidth = 6; c.beginPath(); c.moveTo(x + sl / 2, -10); c.lineTo(x - sl / 2, H + 10); c.stroke(); D(); });
  def('split', 'geo', 'Split open', 'The frame splits in two and opens onto the next shot.', { d: 0.6, dirs: ['up', 'left'], color: true, sfx: 'whoosh' }, (u, A, B, o) => {
    B(); const e = E.inOutC(u), a = imgA(A), c = GI(), cc = C(o);
    if (o.dir === 'left') { c.drawImage(a, 0, 0, W / 2, H, -e * W / 2, 0, W / 2, H); c.drawImage(a, W / 2, 0, W / 2, H, W / 2 + e * W / 2, 0, W / 2, H); c.fillStyle = cc; c.fillRect(W / 2 - e * W / 2 - 8, 0, 8, H); c.fillRect(W / 2 + e * W / 2, 0, 8, H); }
    else { c.drawImage(a, 0, 0, W, H / 2, 0, -e * H / 2, W, H / 2); c.drawImage(a, 0, H / 2, W, H / 2, 0, H / 2 + e * H / 2, W, H / 2); c.fillStyle = cc; c.fillRect(0, H / 2 - e * H / 2 - 8, W, 8); c.fillRect(0, H / 2 + e * H / 2, W, 8); } D(); });
  def('panels', 'geo', 'Rotating panels', 'Vertical panels turn over one after another to reveal the next shot.', { d: 0.8, sfx: 'clack' }, (u, A, B, o) => {
    const a = imgA(A), b = imgB(B), n = Math.round(4 + o.amt * 3), pw = W / n, c = GI(); blackBg();
    for (let i = 0; i < n; i++) { const p = clamp(u * 1.6 - i * (0.6 / n)), sx = Math.abs(Math.cos(p * Math.PI)), src = p < 0.5 ? a : b, x = i * pw; if (sx < 0.01) continue;
      c.save(); c.translate(x + pw / 2, 0); c.scale(sx, 1); c.drawImage(src, x, 0, pw, H, -pw / 2, 0, pw, H); if (p > 0 && p < 1) { c.fillStyle = `rgba(0,0,0,${0.5 * (1 - sx)})`; c.fillRect(-pw / 2, 0, pw, H); } c.restore(); } D(); });
  def('grid', 'geo', 'Grid reveal', 'The next shot pops in square by square.', { d: 0.8, sfx: 'pop' }, (u, A, B, o) => {
    A(); const b = imgB(B), cs = Math.round(lerp(270, 135, o.amt / 2)), cols = Math.ceil(W / cs), rows = Math.ceil(H / cs), c = GI();
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const p = clamp((u * 1.5 - hash(i * 13.7 + j * 7.1) * 0.5) / 1), s = E.outBack(clamp(p * 1.4)); if (s <= 0) continue; const x = i * cs, y = j * cs;
      c.save(); c.beginPath(); c.rect(x + cs / 2 - cs * s / 2, y + cs / 2 - cs * s / 2, cs * s, cs * s); c.clip(); c.drawImage(b, 0, 0); c.restore(); } D(); });
  def('blinds', 'geo', 'Blinds', 'Vertical blinds open onto the next shot.', { d: 0.7, sfx: 'swish' }, k4('blinds'));
  def('shutters', 'geo', 'Shutters', 'Horizontal slats close in colour, then open on the next shot.', { d: 0.8, color: true, sfx: 'clack' }, (u, A, B, o) => {
    (u < 0.5 ? A : B)(); const n = Math.round(8 + o.amt * 4), sh = H / n, c = GI(); c.fillStyle = C(o, 'ink');
    for (let i = 0; i < n; i++) { const p = u < 0.5 ? E.inOutC(clamp(u * 2 * 1.3 - i * 0.3 / n)) : 1 - E.inOutC(clamp((u - 0.5) * 2 * 1.3 - i * 0.3 / n)); c.fillRect(0, i * sh + sh / 2 - sh * p / 2, W, sh * p + 1); } D(); });
  def('shape', 'geo', 'Geometric mask', 'The next shot grows out of a turning diamond.', { d: 0.7, color: true, sfx: 'whoosh' }, (u, A, B, o) => {
    A(); const e = E.inOutC(u), r = e * Math.hypot(W, H) * 0.75, rot = (1 - e) * 0.8, path = c => { for (let i = 0; i < 4; i++) { const a = rot + i * Math.PI / 2; c.lineTo(W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r); } c.closePath(); };
    clipTo(path, B); const c = GI(); c.strokeStyle = C(o); c.lineWidth = 12; c.beginPath(); path(c); c.stroke(); D(); });
  def('morph', 'geo', 'Shape morph', 'A circle morphs into a rounded window that grows to fill the frame.', { d: 0.8, color: true, sfx: 'whoosh' }, (u, A, B, o) => {
    A(); const e = E.inOutC(u), w = lerp(120, W + 40, e), h = lerp(120, H + 40, E.inOutC(clamp(u * 1.2 - 0.1))), r = lerp(60, 0, E.inC(u)), x = W / 2 - w / 2, y = H / 2 - h / 2;
    clipTo(c => c.roundRect(x, y, w, h, Math.min(r * 3, w / 2, h / 2)), B); const c = GI(); c.strokeStyle = C(o); c.lineWidth = 10 * (1 - e); c.beginPath(); c.roundRect(x, y, w, h, Math.min(r * 3, w / 2, h / 2)); c.stroke(); D(); });
  def('tiles', 'geo', 'Sliding tiles', 'Columns of the next shot slide in from above and below.', { d: 0.7, sfx: 'swish' }, (u, A, B, o) => {
    A(); const b = imgB(B), n = Math.round(4 + o.amt * 2), cw = W / n, c = GI(); for (let i = 0; i < n; i++) { const p = E.outQ(clamp(u * 1.5 - i * 0.08)), dy = (i % 2 ? 1 : -1) * (1 - p) * H; c.drawImage(b, i * cw, 0, cw + 1, H, i * cw, dy, cw + 1, H); } D(); });
  def('paver', 'geo', 'Tile flip', 'The frame breaks into tiles that flip over in a diagonal wave.', { d: 0.9, color: true, sfx: 'clack' }, (u, A, B, o) => K4.run('paver', R0(), u, A, B, { t: o.t }));
  def('circle', 'geo', 'Circle reveal', 'A growing circle with an accent ring reveals the next shot.', { d: 0.6, color: true, sfx: 'whoosh' }, (u, A, B, o) => {
    A(); const e = E.inOutC(u), r = e * Math.hypot(W, H) * 0.55; if (r < 1) return; clipTo(c => c.arc(W / 2, H / 2, r, 0, TAU), B); const c = K3.G(); c.strokeStyle = C(o); c.lineWidth = 14; c.beginPath(); c.arc(W / 2, H / 2, r, 0, TAU); c.stroke(); K3.D(); });
  def('stripes', 'geo', 'Colour stripes', 'Bands of your colours sweep across and away.', { d: 0.7, color: true, sfx: 'swish' }, (u, A, B, o) => {
    (u < 0.5 ? A : B)(); const c = GI(), n = 6, h = H / n, cs = [C(o), o.col ? K8.mix(C(o), '#000000', 0.5) : BLK];
    for (let k = 0; k < n; k++) { const v = clamp(u * 1.6 - k * 0.1), cov = v < 0.5 ? E.inOutC(v * 2) : 1 - E.inOutC(v * 2 - 1), dir = k % 2 ? 1 : -1, w = W * cov; c.fillStyle = cs[k % 2]; if (w > 0) c.fillRect(dir > 0 ? (v < 0.5 ? 0 : W - w) : (v < 0.5 ? W - w : 0), k * h, w, h + 1); } D(); });
  // ================================================================ GLITCH
  def('glitch', 'glitch', 'Glitch', 'Horizontal strips jump sideways with a white flash.', { d: 0.5, sfx: 'glitch' }, k4('glitch'));
  def('rgb', 'glitch', 'RGB split', 'The colour channels tear apart and snap back on the next shot.', { d: 0.5, sfx: 'glitch' }, (u, A, B, o) => {
    const cv = u < 0.5 ? imgA(A) : imgB(B), off = Math.sin(Math.PI * u) * 70 * o.amt, fr = Math.floor(o.t * 30), jy = (hash(fr) - 0.5) * 20 * Math.sin(Math.PI * u), c = GI(); blackBg(); c.globalCompositeOperation = 'lighter';
    c.drawImage(chan(cv, '#FF0000'), -off, jy); c.drawImage(chan(cv, '#00FF00'), 0, 0); c.drawImage(chan(cv, '#0000FF'), off, -jy); D(); });
  def('digital', 'glitch', 'Digital distortion', 'Blocks of both shots shear and stutter across the cut.', { d: 0.5, sfx: 'glitch' }, (u, A, B, o) => {
    const a = imgA(A), b = imgB(B), base = u < 0.5 ? a : b, fr = Math.floor(o.t * 15), k = Math.sin(Math.PI * u), c = GI(); c.drawImage(base, 0, 0);
    const n = Math.round(14 * o.amt + 4); for (let i = 0; i < n; i++) { const h1 = hash(fr * 7.1 + i * 3.3), h2 = hash(fr * 1.9 + i * 9.7), w = 120 + h1 * 700, h = 20 + h2 * 140, x = hash(i * 5.5 + fr) * W, y = hash(i * 2.2 + fr * 3) * H, dx = (hash(i + fr * 11) - 0.5) * 300 * k, src = hash(i * 4.4 + fr) < u ? b : a;
      if (hash(i * 8.8 + fr * 0.5) > k + 0.2) continue; c.drawImage(src, x, y, w, h, x + dx, y, w, h); } if (k > 0.6 && hash(fr * 13) > 0.5) { c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(0, hash(fr) * H, W, 8 + hash(fr * 3) * 30); } D(); });
  def('pixel', 'glitch', 'Pixel displacement', 'The shot breaks into big pixels and rebuilds as the next one.', { d: 0.7, sfx: 'glitch' }, (u, A, B, o) => {
    const cv = u < 0.5 ? imgA(A) : imgB(B), s = Math.max(1, Math.round(1 + Math.sin(Math.PI * u) * 70 * o.amt)), w = Math.max(1, Math.round(W / s)), h = Math.max(1, Math.round(H / s)), m = scratch('ktPx', w, h);
    m.g.imageSmoothingEnabled = true; m.g.setTransform(1, 0, 0, 1, 0, 0); m.g.drawImage(cv, 0, 0, w, h); const c = GI(); c.imageSmoothingEnabled = false; c.drawImage(m, 0, 0, w, h, 0, 0, W, H); D(); });
  def('scan', 'glitch', 'Scanline roll', 'The next shot rolls in like a CRT, with scanlines and a bright seam.', { d: 0.6, dirs: UD, sfx: 'glitch' }, (u, A, B, o) => {
    const e = E.inOutC(u), a = imgA(A), b = imgB(B), sg = o.dir === 'down' ? 1 : -1, y = sg * (1 - e) * -H, c = GI(); c.drawImage(a, 0, y + sg * H); c.drawImage(b, 0, y);
    const seam = sg > 0 ? y + H : y; c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, seam - 60, 0, seam + 60); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(200,230,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, seam - 60, W, 120);
    c.globalCompositeOperation = 'source-over'; c.fillStyle = `rgba(0,0,0,${0.28 * Math.sin(Math.PI * u) * o.amt})`; for (let yy = 0; yy < H; yy += 6) c.fillRect(0, yy, W, 3); D(); });
  def('signal', 'glitch', 'Signal interference', 'Static and tearing wash over the cut, like a lost signal.', { d: 0.6, sfx: 'glitch' }, (u, A, B, o) => {
    const cv = u < 0.5 ? imgA(A) : imgB(B), k = Math.sin(Math.PI * u) * o.amt, fr = Math.floor(o.t * 30), roll = (hash(fr * 2.1) - 0.5) * 300 * k, c = GI(); c.drawImage(cv, 0, roll); c.drawImage(cv, 0, roll - Math.sign(roll || 1) * H);
    for (let i = 0; i < 8; i++) { const y = hash(fr * 5 + i) * H, h = 6 + hash(fr + i * 3) * 40; c.drawImage(cv, 0, y, W, h, (hash(i * 7 + fr) - 0.5) * 200 * k, y, W, h); }
    if (NOISE.length) { c.save(); c.scale(3, 3); c.translate(Math.floor(hash(fr * 1.7) * 256), Math.floor(hash(fr * 2.3) * 256)); c.fillStyle = NOISE[fr % 4]; c.globalAlpha = clamp(k * 2.2); for (let r = 0; r < 2; r++) c.fillRect(-256, -256, W / 3 + 512, H / 3 + 512); c.restore(); } D(); });
  def('noise', 'glitch', 'Digital noise', 'The next shot fizzes in block by block through digital noise.', { d: 0.7, sfx: 'glitch' }, (u, A, B, o) => {
    A(); const b = imgB(B), bs = Math.round(lerp(90, 30, o.amt / 2)), cols = Math.ceil(W / bs), rows = Math.ceil(H / bs), fr = Math.floor(o.t * 30), c = GI();
    c.beginPath(); for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const th = hash(i * 3.7 + j * 11.3) * 0.85 + (hash(i + j * 5 + fr) - 0.5) * 0.12; if (u > th) c.rect(i * bs, j * bs, bs, bs); } c.save(); c.clip(); c.drawImage(b, 0, 0); c.restore();
    c.globalAlpha = 0.5 * Math.sin(Math.PI * u); for (let k = 0; k < 40; k++) { const i = Math.floor(hash(k * 3 + fr) * cols), j = Math.floor(hash(k * 7 + fr * 2) * rows); c.fillStyle = hash(k + fr) > 0.5 ? '#fff' : '#000'; c.fillRect(i * bs, j * bs, bs, bs); } D(); });
  def('chroma', 'glitch', 'Chromatic aberration', 'Colour fringes bloom outward from the centre across the cut.', { d: 0.55, zoom: true, sfx: 'glitch' }, (u, A, B, o) => {
    const cv = u < 0.5 ? imgA(A) : imgB(B), k = Math.sin(Math.PI * u) * 0.06 * o.amt, c = GI(); blackBg(); c.globalCompositeOperation = 'lighter';
    put(c, chan(cv, '#FF0000'), W / 2, H / 2, 1 + k); put(c, chan(cv, '#00FF00'), W / 2, H / 2, 1); put(c, chan(cv, '#0000FF'), W / 2, H / 2, 1 - k * 0.5); D(); });
  // ================================================================ LIQUID
  def('liquid', 'liquid', 'Liquid tide', 'A wave-edged tide rises over the frame.', { d: 0.8, sfx: 'ink' }, k4('liquid'));
  function blobPath(c, cx, cy, r, seed, t) { c.moveTo(cx + r, cy); for (let i = 1; i <= 48; i++) { const a = i / 48 * TAU, rr = r * (1 + 0.12 * Math.sin(a * 5 + seed) + 0.07 * Math.sin(a * 9 - seed * 2 + t * 3)); c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } c.closePath(); }
  def('ink', 'liquid', 'Ink spread', 'Ink blooms out from a few points and floods into the next shot.', { d: 0.9, color: true, sfx: 'ink' }, (u, A, B, o) => {
    A(); const e = E.inOutC(u), seeds = [[0.3, 0.3], [0.72, 0.55], [0.4, 0.78], [0.62, 0.18]], R = Math.hypot(W, H) * 0.62;
    const path = (c, grow) => seeds.forEach(([sx, sy], i) => blobPath(c, sx * W, sy * H, Math.max(1, (e * (1.15 - i * 0.08) + grow) * R), i * 2.1 + 1, o.t));
    const c = GI(); c.fillStyle = C(o, 'ink'); c.beginPath(); path(c, 0.04); c.fill(); D(); clipTo(c2 => path(c2, 0), B); });
  def('ripple', 'liquid', 'Water ripple', 'A ring of ripples spreads from the centre and washes in the next shot.', { d: 0.8, sfx: 'ink' }, (u, A, B, o) => {
    const a = imgA(A), e = E.inOutC(u), r = e * Math.hypot(W, H) * 0.56, k = Math.sin(Math.PI * u) * o.amt, c = GI();
    for (let y = 0; y < H; y += 12) { const d = Math.abs(Math.hypot(0, y - H / 2) - r), dx = Math.sin(y * 0.05 - u * 30) * 30 * k * Math.exp(-d / 260); c.drawImage(a, 0, y, W, 12, dx, y, W, 12); }
    c.save(); c.beginPath(); c.arc(W / 2, H / 2, Math.max(1, r), 0, TAU); c.clip(); const b = imgB(B); c.drawImage(b, 0, 0); c.restore();
    for (let i = 0; i < 3; i++) { const rr = r - i * 40; if (rr <= 0) continue; c.strokeStyle = `rgba(255,255,255,${0.35 * k * (1 - i / 3)})`; c.lineWidth = 4; c.beginPath(); c.arc(W / 2, H / 2, rr, 0, TAU); c.stroke(); } D(); });
  def('fluid', 'liquid', 'Fluid reveal', 'Soft blobs rise and merge, carrying the next shot up the frame.', { d: 0.9, sfx: 'ink' }, (u, A, B, o) => {
    A(); const path = c => { for (let i = 0; i < 10; i++) { const p = clamp(u * 1.5 - hash(i * 3.3) * 0.5), x = (i + 0.5) / 10 * W + (hash(i) - 0.5) * 120, y = lerp(H + 380, -500, E.inOutS(p)), r = 220 + hash(i * 7.7) * 200 + p * 260; c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); c.rect(x - r, y, 2 * r, H + 400); } };
    clipTo(path, B); });
  def('warp', 'liquid', 'Organic distortion', 'Both shots ripple like heat haze as one becomes the other.', { d: 0.8, sfx: 'air' }, (u, A, B, o) => {
    const a = imgA(A), b = imgB(B), k = Math.sin(Math.PI * u) * o.amt, e = E.inOutS(u), c = GI(); blackBg();
    for (let y = 0; y < H; y += 10) { const dx = Math.sin(y * 0.012 + u * 9) * 110 * k + Math.sin(y * 0.031 - u * 5) * 40 * k; c.globalAlpha = 1; c.drawImage(a, 0, y, W, 10, dx, y, W, 10); c.globalAlpha = e; c.drawImage(b, 0, y, W, 10, -dx, y, W, 10); } D(); });
  def('paint', 'liquid', 'Paint drip', 'Paint runs down the frame and the next shot follows behind it.', { d: 1.0, color: true, sfx: 'ink' }, (u, A, B, o) => {
    A(); const n = 12, cw = W / n, path = (c, lag) => { for (let i = 0; i < n; i++) { const p = clamp(u * 1.4 - hash(i * 5.1) * 0.4 - lag), y = E.inOutS(p) * (H + 400) - 200, x = i * cw; c.rect(x - 1, -10, cw + 2, Math.max(0, y + 10)); c.moveTo(x + cw, y); c.arc(x + cw / 2, y, cw / 2 + 1, 0, Math.PI); } };
    const c = GI(); c.fillStyle = C(o); c.beginPath(); path(c, 0); c.fill(); D(); clipTo(c2 => path(c2, 0.12), B); });
  // ================================================================ PHOTO
  def('toss', 'photo', 'Photo toss', 'The next shot is tossed in like a print landing on a table.', { d: 0.7, sfx: 'paper' }, k4('toss'));
  // keep the part of a polygon where f(p) >= 0 (one half-plane)
  function clipHalf(poly, f) { const out = []; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a), fb = f(b); if (fa >= 0) out.push(a); if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); } } return out; }
  def('page', 'photo', 'Page turn', 'The corner lifts and the page turns over onto the next shot.', { d: 0.9, sfx: 'paper' }, (u, A, B, o) => {
    B(); const a = imgA(A), e = E.inOutC(u), cc = (W + H) * (1 - e) * 1.02 - 20, rect = [[0, 0], [W, 0], [W, H], [0, H]], c = GI();
    const keep = clipHalf(rect, p => cc - (p[0] + p[1])), flap = clipHalf(rect, p => (p[0] + p[1]) - cc).map(([x, y]) => [cc - y, cc - x]);
    const poly = (pts) => { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); };
    if (keep.length > 2) { c.save(); poly(keep); c.clip(); c.drawImage(a, 0, 0); c.restore(); }
    if (flap.length > 2) { c.save(); c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 50; c.shadowOffsetX = -10; c.shadowOffsetY = -10; poly(flap);
      const g = c.createLinearGradient(cc / 2, cc / 2, cc / 2 - 420, cc / 2 - 420); g.addColorStop(0, '#DCD6CA'); g.addColorStop(0.25, '#F3EFE7'); g.addColorStop(1, '#FFFFFF'); c.fillStyle = g; c.fill(); c.restore(); }
    D(); });
  def('filmstrip', 'photo', 'Film strip', 'Both shots ride up a strip of film with sprocket holes.', { d: 0.8, dirs: UD, sfx: 'clack' }, (u, A, B, o) => {
    const a = imgA(A), b = imgB(B), e = E.inOutC(u), s = 0.84, fh = H * s, gap = 60, step = fh + gap, sg = o.dir === 'down' ? -1 : 1, c = GI(); c.fillStyle = '#0c0c0e'; c.fillRect(0, 0, W, H);
    const y0 = (H - fh) / 2 - sg * e * step; [[a, y0], [b, y0 + sg * step]].forEach(([cv, y]) => { c.drawImage(cv, (W - W * s) / 2, y, W * s, fh); });
    c.fillStyle = '#e8e2d6'; const off = lmod(-sg * e * step, 70); for (let y = -70 + off; y < H + 70; y += 70) { c.beginPath(); c.roundRect(28, y, 34, 44, 8); c.roundRect(W - 62, y, 34, 44, 8); c.fill(); } D(); });
  def('collage', 'photo', 'Collage', 'The next shot assembles from four pieces sliding in from every side.', { d: 0.8, sfx: 'swish' }, (u, A, B, o) => {
    A(); const b = imgB(B), c = GI(), q = [[0, 0, -1, 0], [W / 2, 0, 0, -1], [0, H / 2, 0, 1], [W / 2, H / 2, 1, 0]];
    q.forEach(([x, y, dx, dy], i) => { const p = E.outQ(clamp(u * 1.4 - i * 0.12)); c.save(); c.translate(dx * (1 - p) * W, dy * (1 - p) * H); c.beginPath(); c.rect(x, y, W / 2, H / 2); c.clip(); c.drawImage(b, 0, 0); c.restore(); c.strokeStyle = `rgba(255,255,255,${0.9 * (1 - clamp((u - 0.8) / 0.2))})`; c.lineWidth = 6; c.strokeRect(x + dx * (1 - p) * W, y + dy * (1 - p) * H, W / 2, H / 2); }); D(); });
  def('flip', 'photo', 'Picture flip', 'The picture flips over like a card to show the next shot.', { d: 0.7, dirs: ['left', 'up'], sfx: 'swish' }, (u, A, B, o) => {
    const e = E.inOutC(u), k = Math.cos(e * Math.PI), cv = e < 0.5 ? imgA(A) : imgB(B), c = GI(); blackBg(); const sx = o.dir === 'up' ? 1 : Math.abs(k), sy = o.dir === 'up' ? Math.abs(k) : 1;
    put(c, cv, W / 2, H / 2, Math.max(0.005, sx) * (1 - 0.08 * Math.sin(Math.PI * e)), Math.max(0.005, sy) * (1 - 0.08 * Math.sin(Math.PI * e))); c.fillStyle = `rgba(0,0,0,${0.55 * (1 - Math.abs(k))})`; c.fillRect(0, 0, W, H); D(); });
  def('shutter', 'photo', 'Camera shutter', 'Aperture blades snap shut and open on the next shot.', { d: 0.5, sfx: 'shutter' }, (u, A, B, o) => {
    const first = u < 0.5, k = first ? E.inC(u * 2) : 1 - E.outC(u * 2 - 1), r = (1 - k) * Math.hypot(W, H) * 0.56, rot = k * 1.2; (first ? A : B)(); const c = GI();
    c.fillStyle = '#121214'; c.beginPath(); c.rect(0, 0, W, H); for (let i = 0; i < 6; i++) { const a = rot + i * TAU / 6; c.lineTo(W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r); } c.closePath(); c.fill('evenodd');
    c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { const a = rot + i * TAU / 6, x = W / 2 + Math.cos(a) * r, y = H / 2 + Math.sin(a) * r; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a + 1.9) * 2000, y + Math.sin(a + 1.9) * 2000); c.stroke(); } D(); });
  // ================================================================ TYPOGRAPHIC
  def('textmask', 'type', 'Through your word', 'The next shot plays inside a giant word that flies at the camera.', { d: 0.9, text: true, sfx: 'whoosh' }, (u, A, B, o) => {
    A(); const txt = word(o), sz = Math.min(560, fitSize(txt, 400, 900, 700, 'Bebas', 4)), s = lerp(1, 22, E.inExpo(clamp(u / 0.92))), m = scratch('ktM'), g = m.g; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
    const b = imgB(B); g.drawImage(b, 0, 0); g.globalCompositeOperation = 'destination-in'; g.translate(W / 2, H / 2); g.scale(s, s); g.font = F(400, sz, 'Bebas'); g.letterSpacing = '4px'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(txt, 0, sz * 0.04);
    const c = GI(); c.drawImage(m, 0, 0); if (u > 0.8) { c.globalAlpha = (u - 0.8) / 0.2; c.drawImage(b, 0, 0); } D(); });
  def('word', 'type', 'Through the name', 'The next shot appears inside your business name as it rushes forward.', { d: 0.9, text: true, sfx: 'whoosh' }, k4('word'));
  def('wordzoom', 'type', 'Word zoom', 'Your word slams in, grows until it fills the screen, and opens on the next shot.', { d: 0.9, color: true, text: true, sfx: 'impact' }, (u, A, B, o) => {
    const txt = word(o), col = C(o), sz = Math.min(420, fitSize(txt, 400, 860, 600, 'Bebas', 2)), s = lerp(0.6, 16, E.inExpo(clamp(u / 0.62))), c = GI();
    if (u < 0.55) A(); else { B(); c.fillStyle = col; c.globalAlpha = 1 - E.outC(clamp((u - 0.55) / 0.45)); c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
    if (u < 0.62) { c.translate(W / 2, H / 2); c.scale(s, s); c.font = F(400, sz, 'Bebas'); c.letterSpacing = '2px'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col; c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 30 / s; c.fillText(txt, 0, sz * 0.04); } D(); });
  def('letterwipe', 'type', 'Letter wipe', 'Giant letters of your word sweep across one after another.', { d: 0.9, color: true, text: true, sfx: 'swish' }, (u, A, B, o) => {
    const txt = word(o).replace(/\s+/g, '').slice(0, 6) || 'GO', n = txt.length, cols = [C(o), o.col ? K8.mix(C(o), '#000000', 0.45) : BLK], c = GI();
    (u < 0.5 ? A : B)(); for (let i = 0; i < n; i++) { const p = clamp((u - i * 0.05) * 1.25), x = lerp(W * 1.05, -W * 1.05, E.inOutC(p)), bg = cols[i % 2]; if (p <= 0 || p >= 1) continue;
      c.fillStyle = bg; c.fillRect(x, 0, W, H); c.font = F(400, H * 0.62, 'Bebas'); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = K8.onCol(bg); c.fillText(txt[i], x + W / 2, H / 2 + H * 0.03); } D(); });
  def('charreveal', 'type', 'Character reveal', 'The next shot shows through a field of your letters that grow until they merge.', { d: 0.9, text: true, sfx: 'shimmer' }, (u, A, B, o) => {
    A(); const txt = word(o).replace(/\s+/g, '') || 'A', e = E.inC(u), sz = lerp(70, 1100, e), m = scratch('ktM'), g = m.g; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
    g.drawImage(imgB(B), 0, 0); const mk = scratch('ktM2'), h = mk.g; h.setTransform(1, 0, 0, 1, 0, 0); h.clearRect(0, 0, W, H); h.font = F(400, sz, 'Bebas'); h.textAlign = 'center'; h.textBaseline = 'middle'; h.fillStyle = '#fff'; const step = sz * 0.72; let k = 0;
    for (let y = H / 2 - Math.ceil(H / 2 / step) * step; y < H + step; y += step) for (let x = W / 2 - Math.ceil(W / 2 / step) * step; x < W + step; x += step) h.fillText(txt[k++ % txt.length], x, y + sz * 0.04);
    g.globalCompositeOperation = 'destination-in'; g.drawImage(mk, 0, 0);
    const c = GI(); c.drawImage(m, 0, 0); if (u > 0.75) { c.globalAlpha = (u - 0.75) / 0.25; c.drawImage(scratch('ktB'), 0, 0); } D(); });
  def('handoff', 'type', 'Text handoff', 'A colour panel carries your word across; the cut happens behind it.', { d: 0.9, dirs: LR, color: true, text: true, sfx: 'swish' }, (u, A, B, o) => {
    const txt = word(o), col = C(o), sg = o.dir === 'right' ? -1 : 1, pin = E.inOutC(clamp(u / 0.45)), pout = E.inOutC(clamp((u - 0.55) / 0.45)), c = GI();
    (u < 0.5 ? A : B)(); const x0 = sg * (1 - pin) * W - sg * pout * W; c.fillStyle = col; c.fillRect(x0, 0, W, H);
    const sz = Math.min(360, fitSize(txt, 400, 900, 500, 'Bebas', 4)); c.font = F(400, sz, 'Bebas'); c.letterSpacing = '4px'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = K8.onCol(col); c.fillText(txt, x0 + W / 2 + sg * (1 - pin) * 200 - sg * pout * 200, H / 2 + sz * 0.04); D(); });
  def('typescene', 'type', 'Typographic scene', 'Rows of your word slide in to fill the screen, then part to reveal the next shot.', { d: 1.0, color: true, text: true, sfx: 'whoosh' }, (u, A, B, o) => {
    const txt = (word(o) + ' • ').repeat(6), col = C(o), rows = 7, rh = H / rows, c = GI(); (u < 0.5 ? A : B)();
    for (let i = 0; i < rows; i++) { const sg = i % 2 ? 1 : -1, pin = E.inOutC(clamp(u * 2.2 - i * 0.06)), pout = E.inOutC(clamp((u - 0.55) * 2.2 - i * 0.06)), x = sg * (1 - pin) * W + sg * pout * W * -1; if (pin <= 0 || pout >= 1) continue;
      c.save(); c.translate(x, 0); c.fillStyle = i % 2 ? K8.mix(col, '#000000', 0.35) : col; c.fillRect(0, i * rh, W, rh + 1); c.font = F(400, rh * 0.8, 'Bebas'); c.letterSpacing = '6px'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = K8.onCol(col); c.fillText(txt, -((u * 600 * sg) % 400) - 200, i * rh + rh / 2 + rh * 0.04); c.restore(); } D(); });
  // ================================================================ SOCIAL
  def('flash', 'social', 'Flash', 'A white flash covers the cut, like a camera flash.', { d: 0.4, color: true, sfx: 'flash' }, (u, A, B, o) => { (u < 0.5 ? A : B)(); fillScreen(o.col ? C(o) : '#FFFFFF', Math.max(0, 1 - Math.abs(u - 0.5) / 0.5) * 0.9 * clamp(o.amt)); });
  def('snapcut', 'social', 'Snap cut', 'A hard cut with a two-frame flash and a jolt.', { d: 0.3, sfx: 'snap' }, (u, A, B, o) => {
    const c = GI(); if (u < 0.5) A(); else { const b = imgB(B), k = Math.max(0, 1 - (u - 0.5) / 0.5); c.drawImage(b, (hash(Math.floor(o.t * 30)) - 0.5) * 40 * k * o.amt, 0); } c.fillStyle = `rgba(255,255,255,${Math.abs(u - 0.5) < 0.1 ? 0.85 : 0})`; c.fillRect(0, 0, W, H); D(); });
  def('bounce', 'social', 'Bounce drop', 'The next shot drops in from the top and bounces to a stop.', { d: 0.7, sfx: 'thud' }, (u, A, B, o) => {
    A(); const b = imgB(B), p = clamp(u * 1.1), y = -(1 - outBounce(p)) * H, sq = p > 0.36 ? 1 + 0.04 * Math.sin(p * 30) * (1 - p) : 1, c = GI(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 50; c.translate(W / 2, y + H); c.scale(1 / sq, sq); c.drawImage(b, -W / 2, -H); D(); });
  const outBounce = u => K8.ease('bounce')(u);
  def('beatflash', 'social', 'Beat flash', 'Two quick colour flashes on the beat, cut in between.', { d: 0.5, color: true, sfx: 'snap' }, (u, A, B, o) => {
    (u < 0.5 ? A : B)(); const f = Math.max(0, 1 - Math.abs(u - 0.3) / 0.07) + Math.max(0, 1 - Math.abs(u - 0.62) / 0.07); fillScreen(o.col ? C(o) : '#FFFFFF', clamp(f) * 0.85 * clamp(o.amt)); });
  def('stickerpop', 'social', 'Sticker pop', 'The next shot pops in as a sticker with a white border, then fills the screen.', { d: 0.7, sfx: 'pop' }, (u, A, B, o) => {
    A(); const b = imgB(B), p = E.outBack(clamp(u * 1.25)), s = lerp(0.15, 1, p), rot = (1 - clamp(u * 1.3)) * -0.3, bw = 30 * (1 - clamp((u - 0.7) / 0.3)), c = GI();
    c.translate(W / 2, H / 2); c.rotate(rot); c.scale(s, s); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 50; c.fillStyle = '#FFFFFF'; c.beginPath(); c.roundRect(-W / 2 - bw, -H / 2 - bw, W + 2 * bw, H + 2 * bw, 40 * (1 - u) + 1); c.fill(); c.shadowBlur = 0;
    c.beginPath(); c.roundRect(-W / 2, -H / 2, W, H, 30 * (1 - u)); c.clip(); c.drawImage(b, -W / 2, -H / 2); D(); });
  def('punchzoom', 'social', 'Punch zoom', 'Quick punch in, flash, and the next shot lands.', { d: 0.4, zoom: true, sfx: 'impact' }, (u, A, B, o) => {
    const c = GI(); blackBg(); if (u < 0.5) put(c, imgA(A), W / 2, H / 2, 1 + E.inC(u * 2) * 0.15 * o.amt); else put(c, imgB(B), W / 2, H / 2, 1 + (1 - E.outC(u * 2 - 1)) * 0.15 * o.amt);
    c.fillStyle = `rgba(255,255,255,${Math.max(0, 1 - Math.abs(u - 0.5) / 0.12) * 0.75})`; c.fillRect(0, 0, W, H); D(); });
  def('swipe', 'social', 'Swipe', 'A carousel swipe with a slight tilt, like flicking through stories.', { d: 0.6, sfx: 'swish' }, k4('swipe'));
  // ================================================================ PREMIUM
  def('softwipe', 'premium', 'Soft reveal', 'A feathered wipe that drifts the next shot in.', { d: 0.9, dirs: HV, sfx: 'air' }, (u, A, B, o) => {
    A(); const [vx, vy] = V(o.dir), e = E.inOutS(u), m = scratch('ktM'), g = m.g; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H); g.drawImage(imgB(B), 0, 0); g.globalCompositeOperation = 'destination-in';
    const L = vx ? W : H, f = 500, pos = lerp(-f, L + f, e), x0 = vx ? (vx < 0 ? L - pos : pos) : 0, y0 = vy ? (vy < 0 ? L - pos : pos) : 0, sgn = (vx || vy) < 0 ? 1 : -1;
    const gr = vx ? g.createLinearGradient(x0 - sgn * f / 2, 0, x0 + sgn * f / 2, 0) : g.createLinearGradient(0, y0 - sgn * f / 2, 0, y0 + sgn * f / 2); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H); const c = GI(); c.drawImage(m, 0, 0); D(); });
  def('curtain', 'premium', 'Curtain', 'Two curtains draw together and part on the next shot.', { d: 1.0, color: true, sfx: 'swell' }, (u, A, B, o) => {
    (u < 0.5 ? A : B)(); const k = u < 0.5 ? E.inOutC(u * 2) : 1 - E.inOutC(u * 2 - 1), w = (W / 2 + 4) * k, col = C(o, '#5A1220'), c = GI();
    for (const side of [-1, 1]) { const x = side < 0 ? 0 : W - w; const g = c.createLinearGradient(x, 0, x + w, 0); for (let i = 0; i <= 8; i++) g.addColorStop(i / 8, i % 2 ? K8.mix(col, '#000000', 0.35) : col); c.fillStyle = g; c.fillRect(x, 0, w, H);
      c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(side < 0 ? w - 14 : x, 0, 14, H); } D(); });
  def('elegant', 'premium', 'Elegant fade', 'A slow fade through your paper colour.', { d: 1.0, color: true, sfx: 'shimmer' }, (u, A, B, o) => dip(u, A, B, o.col ? C(o) : PAPER));
  def('goldline', 'premium', 'Gold line', 'A fine gold line draws across, then the frame opens along it.', { d: 1.0, color: true, sfx: 'shimmer' }, (u, A, B, o) => {
    const col = o.col ? C(o) : '#D4AF37', draw = E.inOutC(clamp(u / 0.4)), open = E.inOutC(clamp((u - 0.4) / 0.6)), c = GI();
    if (open <= 0) { A(); } else { B(); const a = imgA(A); c.drawImage(a, 0, 0, W, H / 2, 0, -open * H / 2, W, H / 2); c.drawImage(a, 0, H / 2, W, H / 2, 0, H / 2 + open * H / 2, W, H / 2); }
    c.globalAlpha = 1 - clamp((u - 0.75) / 0.25); c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 20; const w = W * draw; c.fillRect(W / 2 - w / 2, H / 2 - open * H / 2 - 2, w, 4); if (open > 0) c.fillRect(0, H / 2 + open * H / 2 - 2, W, 4); D(); });
  // ================================================================ CREATIVE
  def('brush', 'creative', 'Brush stroke', 'A rough brush stroke sweeps the next shot in.', { d: 0.7, color: true, sfx: 'swish' }, (u, A, B, o) => K4.run('brush', R0(), u, A, B, { col: C(o) }));
  function strokes(c, k, rev, lw, col) { const P = [[[-200, 300], [W + 200, -100]], [[-200, 900], [W + 200, 500]], [[-200, 1500], [W + 200, 1100]], [[-200, 2100], [W + 200, 1700]]], len = Math.hypot(W + 400, 400);
    c.lineCap = 'round'; c.strokeStyle = col; c.lineWidth = lw; P.forEach(([a, b], i) => { const p = clamp(k * 1.6 - i * 0.18); if (p <= 0) return; c.setLineDash([len, len]); c.lineDashOffset = rev ? -len * p : len * (1 - p); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }); c.setLineDash([]); }
  def('paintstroke', 'creative', 'Paint strokes', 'Thick strokes of paint cover the frame, then wipe away onto the next shot.', { d: 1.0, color: true, sfx: 'swish' }, (u, A, B, o) => {
    const c = GI(); if (u < 0.5) { A(); strokes(c, E.inOutC(u * 2), false, 720, C(o)); } else { B(); strokes(c, E.inOutC(u * 2 - 1), true, 720, C(o)); } D(); });
  def('scribble', 'creative', 'Scribble', 'A marker scribbles over the frame and erases onto the next shot.', { d: 1.0, color: true, sfx: 'pencil' }, (u, A, B, o) => {
    const c = GI(), first = u < 0.5, k = first ? E.inOutS(u * 2) : 1 - E.inOutS(u * 2 - 1); (first ? A : B)(); c.strokeStyle = C(o); c.lineWidth = 240; c.lineCap = 'round'; c.lineJoin = 'round';
    const n = 16, P = i => [i % 2 ? W + 60 : -60, -120 + i * (H + 240) / n + (i % 2 ? 40 : 0)], upto = k * n; c.beginPath(); c.moveTo(...P(0));
    for (let i = 1; i <= Math.ceil(upto) && i <= n; i++) { const f = Math.min(1, upto - (i - 1)), [x0, y0] = P(i - 1), [x1, y1] = P(i); c.lineTo(lerp(x0, x1, f), lerp(y0, y1, f)); } if (upto > 0) c.stroke(); D(); });
  def('particles', 'creative', 'Particle dissolve', 'The next shot appears through hundreds of growing dots.', { d: 0.9, sfx: 'shimmer' }, (u, A, B, o) => {
    A(); const n = Math.round(260 + o.amt * 120), rmax = lerp(150, 80, o.amt / 2); clipTo(c => { for (let i = 0; i < n; i++) { const p = clamp((u - hash(i * 3.3) * 0.55) / 0.45), r = p * rmax; if (r <= 0.5) continue; const x = hash(i * 7.7) * W, y = hash(i * 1.9 + 4) * H; c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); } if (u > 0.97) c.rect(0, 0, W, H); }, B); });
  def('logo', 'creative', 'Through the logo', 'The next shot grows out of your logo.', { d: 0.9, sfx: 'whoosh' }, k4('logo'));
  def('slices', 'geo', 'Slices', 'Horizontal slices slide away to reveal the next shot.', { d: 0.6, sfx: 'swish' }, k4('slices'));
  const visible = (o) => LIST.filter(t => !(o && o.dpg && (t.zoom || t.dpgOff)) && !(t.id === 'logo' && o && !o.parts));
  return { LIST, MAP, CATS, run, visible, get: id => MAP[id] || MAP[ALIAS[id]] || null };
})();
