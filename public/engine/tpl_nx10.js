'use strict';
/* NexGen Studio V25 (Nov 13): the first real-3D showpieces, drawn with three.js through kit15 (K15).
   ?v=ringx   3D Carousel     five shots stand on a ring that turns to face each one, mirrored in a dark floor
   ?v=showx   The Showroom    one clip on a tall screen in a dark showroom, the camera drifting around it, name and price below
   ?v=flyx    Fly-Through     the camera flies down a corridor of shots hung in space, pausing at each
   ?v=cubex   Photo Cube      four shots on the faces of a slowly turning cube
   Footage is shown whole on its card (never cropped) and plays at real speed. Names, prices and labels are fields with
   placeholders. If 3D is not available on a device the shots are shown flat instead, so the video still works. */
STUDIO_REG['nx10'] = (() => {
  const V = QS.get('v') || 'ringx';
  // Per-element model (b): tpl_free sets window.__NX_BLOCK_EL to the block's `el` data before calling this
  // function; positions below fall back to the original hardcoded values when EL is null, so rendering
  // is byte-for-byte the old path. 3D objects (cards, cube, slabs) live in 3D space and are not 2D-draggable;
  // the 2D text overlays on top of them are exposed.
  const EL = (typeof window !== 'undefined' && window.__NX_BLOCK_EL) || null;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const posOf = (o, d) => (o && typeof o.x === 'number' && isFinite(o.x) && typeof o.y === 'number' && isFinite(o.y)) ? [o.x, o.y] : d;
  const elP = id => (EL && EL.pos && EL.pos[id]) || null;
  const { TAU, pk, up, seg, SP, SS, SB, onAcc, INKD, CARD, MUTE, tx, fit, rr, logoImg, shot, pic, touch, stage, words, pillBtn, close, closeCues, bed } = SHOWKIT();
  const dash = s => !s || String(s).trim() === '-', CAT = BRAND.cat || BRAND.industry || 'general', SV = (BRAND.services || []).map(up);
  const frameOf = (s, lt) => { const m = VID.meta(s.c); if (!m) return null; const ts = m.still ? 0 : clamp(s.in + Math.max(0, lt), 0, (m.n - 1.5) / 30); return VID.get(s.c, VID.idx(s.c, ts), 'f'); };
  const fitBox = (img, mw, mh) => { if (!img) return [mw, mh]; const k = Math.min(mw / img.width, mh / img.height); return [img.width * k, img.height * k]; };
  const io = x => x * x * (3 - 2 * x);
  // if 3D is off: the current shot, whole, on the stage
  function flat(s, lt) { const img = frameOf(s, lt); if (!img || VID.collecting) return; const [w, h] = fitBox(img, 960, 1100); ctx.drawImage(img, 540 - w / 2, 900 - h / 2, w, h); }
  function glow(y, a) { const c = ctx, g = c.createRadialGradient(540, y, 20, 540, y, 760); g.addColorStop(0, ORA(0.34 * a)); g.addColorStop(1, ORA(0)); c.fillStyle = g; c.fillRect(0, y - 760, W, 1520); }
  function label(s, n, of, lt, len, y, x) { if (VID.collecting) return; x = x || 540; const c = ctx, a = clamp((lt - 0.45) * 6) * (1 - seg(lt, len - 0.3, 0.25)), e = SP(lt, 0.45, 0.8); if (a <= 0) return; c.save(); c.globalAlpha *= a;
    tx(String(n).padStart(2, '0') + ' / ' + String(of).padStart(2, '0'), x, y - 122 + (1 - e) * 30, { size: 28, wt: 700, ls: 5, col: OR }); if (!dash(s)) tx(s, x, y + (1 - e) * 50, { size: fit(s, 400, 'Bebas', 920, 118, 3), wt: 400, fam: 'Bebas', ls: 3, col: WHT, shadow: 'rgba(0,0,0,0.5)' }); c.restore(); }
  let BT = null;
  function brand(t) { K17.top(t, 0.15, BT); }
  const defs = (n, dealer) => Array.from({ length: n }, (x, i) => SV[i] || (dealer ? 'YEAR MAKE MODEL' : ['OUR WORK', 'UP CLOSE', 'THE DETAILS', 'ON THE JOB', 'THE RESULT'][i]));

  // ================================================================ 3D CAROUSEL
  function ringx() {
    const N = 5, dealer = CAT === 'dealership', D = defs(N, dealer);
    const TITLE = TX('title', pk({ general: 'TAKE A LOOK AROUND', auto: dealer ? 'ON THE LOT' : 'FRESH FROM THE BAY', food: 'ON THE MENU', estate: 'STEP INSIDE', home: 'RECENT WORK', beauty: 'THE LOOKBOOK', retail: 'NEW IN' }), { label: 'Title', group: 'Title', upper: true, max: 22 });
    const LB = D.map((d, i) => TX('l' + (i + 1), d, { label: 'Label ' + (i + 1) + ' (a dash leaves it off)', group: 'Labels', upper: true, max: 26 })), SH = D.map((d, i) => shot('s' + (i + 1), 'Shot ' + (i + 1), 3, 'v'));
    const END = TX('end', pk({ general: 'COME SEE THE REST', auto: dealer ? 'COME TAKE A LOOK' : 'YOURS COULD BE NEXT', food: 'COME HUNGRY', estate: 'COME SEE IT' }), { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const T0 = 1.3, STEP = 2.2, OUT = T0 + N * STEP, DUR = OUT + 4.1, RAD = 4.6, CW = 4.1, CH = 4.4;
    function elements() { const tiP = posOf(elP('title'), [540, 420]); const els = [
      { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0, d: T0, box: [tiP[0] - 470, tiP[1] - 130, 940, 130], dup: false, del: false },
    ];
      for (let i = 0; i < N; i++) { const lbP = posOf(elP('label' + (i + 1)), [540, 1480]); els.push({ id: 'label' + (i + 1), kind: 'pos', label: LB[i], x: lbP[0], y: lbP[1], t0: T0 + i * STEP, d: STEP, box: [lbP[0] - 460, lbP[1] - 150, 920, 200], dup: false, del: false }); }
      return els; }
    const build = (T, K) => { const scene = new T.Scene(), ring = new T.Group(), cards = []; scene.add(ring);
      for (let i = 0; i < N; i++) { const a = i / N * TAU, g = new T.Group(), c = K.card({ radius: 0.16 }), r = K.card({ radius: 0.16, fade: 0.55 }); g.position.set(Math.sin(a) * RAD, 0, Math.cos(a) * RAD); g.rotation.y = a; r.scale.y = -1; g.add(c, r); ring.add(g); cards.push({ g, c, r, a }); }
      const cam = K.cam(38, 17); return { scene, camera: cam, update(t, o) { ring.rotation.y = -o.rot; ring.position.y = 0.5; cam.position.set(Math.sin(t * 0.3) * 0.5, 1.3 + o.lift, 17.4 - o.push); cam.lookAt(0, -0.25, 0);
        cards.forEach((k, i) => { const img = o.imgs[i], [w, h] = fitBox(img, CW, CH), tex = K.tex('ring' + i, img), face = Math.cos(k.a - o.rot), dim = clamp(0.62 - face * 0.62, 0, 0.7);
          k.c.userData.set(tex, w, h); k.c.material.uniforms.dim.value = dim; k.c.position.y = 0; k.r.userData.set(tex, w, h); k.r.scale.set(w, -h, 1); k.r.position.y = -h - 0.14; k.r.material.uniforms.opacity.value = 0.3; k.r.material.uniforms.dim.value = dim; k.c.position.y = 0; k.r.position.y = -h - 0.14; k.g.scale.setScalar(o.grow); }); } }; };
    function render(t) {
      stage(t); const st = (t - T0) / STEP, i = clamp(Math.floor(st), 0, N - 1), f = clamp(st - i), turn = i + (st < 0 ? 0 : st >= N ? 0 : io(clamp((f - 0.78) / 0.22))), rot = Math.min(turn, N - 1) / N * TAU, lt = t - T0 - i * STEP;
      const imgs = SH.map((s, j) => frameOf(s, t - T0 - j * STEP > 0 ? Math.min(t - T0 - j * STEP, STEP) : 0)); if (VID.collecting) return;
      glow(1180, 1); const okGL = K15.draw('ringx', build, t, { rot, imgs, grow: 0.2 + 0.8 * SP(t, 0.15, 0.9), lift: 0, push: 1.2 * io(clamp(t / DUR)), alpha: clamp(t * 4) }); if (!okGL) flat(SH[i], lt);
      brand(t); if (t < T0) { const [tix, tiy] = posOf(elP('title'), [540, 420]); words(TITLE, tix, tiy, t, 0.3, { size: fit(TITLE, 400, 'Bebas', 940, 130, 3), fam: 'Bebas', wt: 400, ls: 3, a: 1 - seg(t, T0 - 0.25, 0.25), shadow: 'rgba(0,0,0,0.5)' }); }
      else { const [lbx, lby] = posOf(elP('label' + (i + 1)), [540, 1480]); label(LB[i], i + 1, N, lt, STEP, lby, lbx); } close(t, OUT, END);
    }
    return { dur: DUR, render, elements, cues() { const ev = [['whoosh', 0.15, 0.3, 0], ['thud', 0.7, 0.2, 0]]; for (let i = 0; i < N; i++) ev.push(['pop', T0 + i * STEP + 0.45, 0.24, 0], ['swish', T0 + i * STEP + STEP * 0.78, i < N - 1 ? 0.34 : 0, i % 2 ? 0.3 : -0.3]); closeCues(ev, OUT); return { dur: DUR, beds: [bed('lounge', DUR)], events: ev.filter(e => e[2] > 0) }; } };
  }

  // ================================================================ THE SHOWROOM
  function showx() {
    const dealer = CAT === 'dealership';
    const NM = TX('name', dealer ? 'YEAR MAKE MODEL' : pk({ general: 'WHAT THIS IS', auto: 'THE FULL DETAIL', food: 'THE HOUSE SPECIAL', estate: 'THE PROPERTY', retail: 'THE NEW ARRIVAL', beauty: 'THE LOOK' }), { label: 'Name', group: 'Name & price', upper: true, max: 30 });
    const SUB = TX('sub', dealer ? 'TRIM  ·  COLOUR' : 'A SHORT DETAIL', { label: 'Second line (a dash leaves it off)', group: 'Name & price', upper: true, max: 38 });
    const PR = TX('price', dealer ? '$00,000' : '-', { label: 'Price (a dash leaves it off)', group: 'Name & price', max: 14, hint: 'A placeholder: type the real price, or a dash.' }), KICK = TX('kick', pk({ general: 'NOW SHOWING', auto: dealer ? 'IN THE SHOWROOM' : 'NOW SHOWING', estate: 'NOW SHOWING' }), { label: 'Small line on top', group: 'Name & price', upper: true, max: 22 });
    const END = TX('end', pk({ general: 'COME SEE IT', auto: dealer ? 'COME TAKE A TEST DRIVE' : 'BOOK YOURS', food: 'COME TRY IT' }), { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const SH = shot('s1', 'Your clip', 9, 'v'), OUT = 8.6, DUR = OUT + 4.1, MW = 5.4, MH = 5.8;
    function elements() { const kiP = posOf(elP('kick'), [540, 318]), nmP = posOf(elP('name'), [540, 1452]), suP = posOf(elP('sub'), [540, 1500]), prP = posOf(elP('price'), [540, 1338]); return [
      { id: 'kick', kind: 'pos', label: KICK, x: kiP[0], y: kiP[1], t0: 0.9, d: DUR - 0.9, box: [kiP[0] - 300, kiP[1] - 28, 600, 50], dup: false, del: false },
      { id: 'name', kind: 'pos', label: NM, x: nmP[0], y: nmP[1], t0: 0.9, d: DUR - 0.9, box: [nmP[0] - 470, nmP[1] - 112, 940, 130], dup: false, del: false },
      { id: 'sub', kind: 'pos', label: SUB, x: suP[0], y: suP[1], t0: 0.9, d: DUR - 0.9, box: [suP[0] - 450, suP[1] - 30, 900, 50], dup: false, del: false },
      { id: 'price', kind: 'pos', label: PR, x: prP[0], y: prP[1], t0: 1.6, d: DUR - 1.6, box: [prP[0] - 350, prP[1] - 60, 700, 120], dup: false, del: false },
    ].filter(e => e.id !== 'kick' || !dash(KICK)).filter(e => e.id !== 'sub' || !dash(SUB)).filter(e => e.id !== 'price' || !dash(PR)); }
    const build = (T, K) => { const scene = new T.Scene(), c = K.card({ radius: 0.12, border: 0.035 }), r = K.card({ radius: 0.12, fade: 0.5 }), g = new T.Group(); g.add(c, r); scene.add(g);
      const beams = [-1, 1].map(sx => { const m = new T.Mesh(new T.PlaneGeometry(1, 1), new T.ShaderMaterial({ uniforms: { c1: { value: new T.Color() }, a: { value: 1 } }, transparent: true, depthTest: false, premultipliedAlpha: true, blending: T.CustomBlending, blendSrc: T.OneFactor, blendDst: T.OneFactor, side: T.DoubleSide,
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: 'precision highp float; uniform vec3 c1; uniform float a; varying vec2 vUv; void main(){ float w = mix(0.06, 0.5, 1.0 - vUv.y); float k = smoothstep(w, 0.0, abs(vUv.x - 0.5)) * pow(vUv.y, 1.4) * a; gl_FragColor = vec4(mix(c1, vec3(1.0), 0.5) * k * 0.5, k * 0.25); }' })); m.scale.set(7, 16, 1); m.position.set(sx * 3.6, 6.4, -1.5); scene.add(m); return m; });
      const cam = K.cam(36, 18); return { scene, camera: cam, update(t, o) { const [w, h] = fitBox(o.img, MW, MH), tex = K.tex('show', o.img); c.userData.set(tex, w, h); r.userData.set(tex, w, h); r.scale.set(w, -h, 1); c.position.y = 0; r.position.y = -h - 0.12; r.material.uniforms.opacity.value = 0.32; c.material.uniforms.edge.value.copy(K.col('#ffffff'));
        g.rotation.y = Math.sin(t * 0.42) * 0.3 * o.sway; g.scale.setScalar(o.grow); g.position.y = 0.6; cam.position.set(Math.sin(t * 0.3) * 1.6, 1.2 + Math.sin(t * 0.24) * 0.4, 19 - o.push); cam.lookAt(0, -0.3, 0);
        beams.forEach((m, i) => { m.rotation.z = (i ? -1 : 1) * (0.34 + Math.sin(t * 0.7 + i * 2) * 0.16); m.material.uniforms.c1.value.copy(K.col(OR)); m.material.uniforms.a.value = o.beam; }); } }; };
    function render(t) {
      stage(t); const img = frameOf(SH, t); if (VID.collecting) return; glow(1100, 1);
      const okGL = K15.draw('showx', build, t, { img, grow: 0.3 + 0.7 * SP(t, 0.1, 0.85), sway: clamp(t / 1.5), push: 2.2 * io(clamp(t / OUT)), beam: clamp(t * 1.5), alpha: clamp(t * 4) }); if (!okGL) flat(SH, t);
      brand(t); const c = ctx, a = clamp((t - 0.9) * 5), e = SP(t, 0.9, 0.8); if (a > 0) { c.save(); c.globalAlpha *= a;
        if (!dash(KICK)) { const [kix, kiy] = posOf(elP('kick'), [540, 318]); tx(KICK, kix, kiy + (1 - e) * -20, { size: 28, wt: 700, ls: 6, col: OR }); }
        const [nmx, nmy] = posOf(elP('name'), [540, 1452]); tx(NM, nmx, nmy + (1 - e) * 60, { size: fit(NM, 400, 'Bebas', 940, 112, 3), wt: 400, fam: 'Bebas', ls: 3, col: WHT, shadow: 'rgba(0,0,0,0.55)' }); if (!dash(SUB)) { const [sux, suy] = posOf(elP('sub'), [540, 1500]); tx(SUB, sux, suy + (1 - e) * 70, { size: fit(SUB, 600, 'Mont', 900, 30, 4), wt: 600, ls: 4, col: WA(0.85) }); } c.restore(); }
      if (!dash(PR) && t > 1.6) { const k = SB(t, 1.6, 0.9); const [prx, pry] = posOf(elP('price'), [540, 1338]); pillBtn(PR, prx, pry, { s: 0.5 + 0.5 * k, a: clamp((t - 1.6) * 6), size: 50, maxW: 700 }); }
      close(t, OUT, END);
    }
    return { dur: DUR, render, elements, cues() { const ev = [['whoosh', 0.1, 0.32, 0], ['thud', 0.75, 0.26, 0], ['swish', 0.95, 0.24, 0], ['pop', 1.65, 0.3, 0], ['sparkle', 2.4, 0.16, 0.3]]; closeCues(ev, OUT); return { dur: DUR, beds: [bed('night', DUR)], events: ev }; } };
  }

  // ================================================================ FLY-THROUGH
  function flyx() {
    const N = 4, dealer = CAT === 'dealership', D = defs(N, dealer);
    const TITLE = TX('title', pk({ general: 'COME ON IN', auto: dealer ? 'WALK THE LOT' : 'A LOOK INSIDE', food: 'STEP INSIDE', estate: 'TAKE THE TOUR', home: 'A LOOK AT THE WORK' }), { label: 'Title', group: 'Title', upper: true, max: 22 });
    const LB = D.map((d, i) => TX('l' + (i + 1), d, { label: 'Label ' + (i + 1) + ' (a dash leaves it off)', group: 'Labels', upper: true, max: 26 })), SH = D.map((d, i) => shot('s' + (i + 1), 'Shot ' + (i + 1), 3, 'v'));
    const END = TX('end', pk({ general: 'THERE’S MORE TO SEE', auto: dealer ? 'COME TAKE A LOOK' : 'BOOK YOURS', estate: 'BOOK A VIEWING' }), { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const T0 = 1.2, STEP = 2.4, OUT = T0 + N * STEP, DUR = OUT + 4.1, GAP = 13, CW = 4.6, CH = 5.4;
    function elements() { const tiP = posOf(elP('title'), [540, 1500]); const els = [
      { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0, d: T0, box: [tiP[0] - 470, tiP[1] - 130, 940, 130], dup: false, del: false },
    ];
      for (let i = 0; i < N; i++) { const lbP = posOf(elP('label' + (i + 1)), [540, 1500]); els.push({ id: 'label' + (i + 1), kind: 'pos', label: LB[i], x: lbP[0], y: lbP[1], t0: T0 + i * STEP, d: STEP, box: [lbP[0] - 460, lbP[1] - 150, 920, 200], dup: false, del: false }); }
      return els; }
    const build = (T, K) => { const scene = new T.Scene(), cards = [];
      for (let i = 0; i < N; i++) { const c = K.card({ radius: 0.16, border: 0.03 }); c.position.set((i % 2 ? 1 : -1) * 0.9, 1.0, -i * GAP); c.rotation.y = (i % 2 ? -1 : 1) * 0.16; scene.add(c); cards.push(c); }
      const n = 700, g = new T.BufferGeometry(), pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = (K.rnd(i, 1) - 0.5) * 22; pos[i * 3 + 1] = (K.rnd(i, 2) - 0.5) * 26; pos[i * 3 + 2] = 12 - K.rnd(i, 3) * (N * GAP + 30); } g.setAttribute('position', new T.BufferAttribute(pos, 3));
      const pm = new T.PointsMaterial({ size: 0.09, color: 0xffffff, transparent: true, opacity: 0.7, depthWrite: false, sizeAttenuation: true }); scene.add(new T.Points(g, pm));
      const cam = K.cam(44, 12); return { scene, camera: cam, update(t, o) { cards.forEach((c, i) => { const img = o.imgs[i], [w, h] = fitBox(img, CW, CH); c.userData.set(K.tex('fly' + i, img), w, h); const dz = cam.position.z - c.position.z; c.material.uniforms.opacity.value = clamp((dz - 1.5) / 3) * clamp((o.z + 46 - (-i * GAP)) / 12 + 1); c.material.uniforms.dim.value = clamp((dz - 13) / 16, 0, 0.6); });
        cam.position.set(o.x, 0.3 + Math.sin(t * 0.5) * 0.15, o.z); cam.rotation.set(0, 0, Math.sin(t * 0.35) * 0.012); pm.color.copy(K.col(OR)).lerp(new T.Color(1, 1, 1), 0.6); } }; };
    function render(t) {
      stage(t); const st = (t - T0) / STEP, i = clamp(Math.floor(st), 0, N - 1), f = clamp(st - i), lt = t - T0 - i * STEP;
      const imgs = SH.map((s, j) => frameOf(s, t - T0 - j * STEP > 0 ? Math.min(t - T0 - j * STEP, STEP) : 0)); if (VID.collecting) return;
      // dwell in front of each card, then accelerate through it to the next
      const pre = t < T0 ? io(clamp(t / T0)) : 1, adv = st < 0 ? 0 : st >= N ? N - 1 + io(clamp((st - N) * 1.2)) * 0.6 : i + (i < N - 1 ? Math.pow(clamp((f - 0.7) / 0.3), 2.2) : 0), z = 26 - 14.5 * pre - adv * 13, x = (i % 2 ? 1 : -1) * 0.9 * (1 - Math.pow(clamp((f - 0.7) / 0.3), 2) * 2) * (t < T0 ? pre : 1) * (i < N - 1 || f < 0.7 ? 1 : 1);
      const okGL = K15.draw('flyx', build, t, { imgs, z, x: x * 0.92, alpha: clamp(t * 4) }); if (!okGL) flat(SH[i], lt);
      brand(t); if (t < T0) { const [tix, tiy] = posOf(elP('title'), [540, 1500]); words(TITLE, tix, tiy, t, 0.25, { size: fit(TITLE, 400, 'Bebas', 940, 130, 3), fam: 'Bebas', wt: 400, ls: 3, a: 1 - seg(t, T0 - 0.25, 0.25), shadow: 'rgba(0,0,0,0.5)' }); }
      else { const [lbx, lby] = posOf(elP('label' + (i + 1)), [540, 1500]); label(LB[i], i + 1, N, lt, STEP * 0.78, lby, lbx); } close(t, OUT, END);
    }
    return { dur: DUR, render, elements, cues() { const ev = [['whoosh', 0.1, 0.34, 0], ['thud', 1.0, 0.2, 0]]; for (let i = 0; i < N; i++) { ev.push(['pop', T0 + i * STEP + 0.45, 0.22, i % 2 ? 0.3 : -0.3]); if (i < N - 1) ev.push(['whoosh', T0 + i * STEP + STEP * 0.72, 0.36, i % 2 ? -0.4 : 0.4]); } closeCues(ev, OUT); return { dur: DUR, beds: [bed('pulse', DUR)], events: ev }; } };
  }

  // ================================================================ PHOTO CUBE
  function cubex() {
    const N = 4, dealer = CAT === 'dealership', D = defs(N, dealer);
    const TITLE = TX('title', pk({ general: 'FROM EVERY ANGLE', auto: 'FROM EVERY ANGLE', food: 'FOUR FAVOURITES', estate: 'FOUR ROOMS', beauty: 'FOUR LOOKS' }), { label: 'Title', group: 'Title', upper: true, max: 22 });
    const LB = D.map((d, i) => TX('l' + (i + 1), d, { label: 'Label ' + (i + 1) + ' (a dash leaves it off)', group: 'Labels', upper: true, max: 26 })), SH = D.map((d, i) => shot('s' + (i + 1), 'Side ' + (i + 1), 3, 'l'));
    const END = TX('end', pk({ general: 'SEE IT FOR YOURSELF', auto: dealer ? 'COME TAKE A LOOK' : 'BOOK YOURS', food: 'COME TRY THEM' }), { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const T0 = 1.2, STEP = 2.3, OUT = T0 + N * STEP, DUR = OUT + 4.1, SZ = 5.6;
    function elements() { const tiP = posOf(elP('title'), [540, 1480]); const els = [
      { id: 'title', kind: 'pos', label: TITLE, x: tiP[0], y: tiP[1], t0: 0, d: T0, box: [tiP[0] - 470, tiP[1] - 130, 940, 130], dup: false, del: false },
    ];
      for (let i = 0; i < N; i++) { const lbP = posOf(elP('label' + (i + 1)), [540, 1480]); els.push({ id: 'label' + (i + 1), kind: 'pos', label: LB[i], x: lbP[0], y: lbP[1], t0: T0 + i * STEP, d: STEP, box: [lbP[0] - 460, lbP[1] - 150, 920, 200], dup: false, del: false }); }
      return els; }
    const build = (T, K) => { const scene = new T.Scene(), cube = new T.Group(), faces = [], backs = []; scene.add(cube);
      for (let i = 0; i < N; i++) { const a = i * TAU / 4, g = new T.Group(), bk = new T.Mesh(new T.PlaneGeometry(SZ, SZ), new T.MeshBasicMaterial({ color: 0x030304 })), c = K.card({ radius: 0.1 }); g.position.set(Math.sin(a) * SZ / 2, 0, Math.cos(a) * SZ / 2); g.rotation.y = a; c.position.z = 0.01; g.add(bk, c); cube.add(g); faces.push(c); backs.push(bk); }
      const cap = new T.MeshBasicMaterial({ color: 0x030304 }); [1, -1].forEach(s => { const m = new T.Mesh(new T.PlaneGeometry(SZ, SZ), cap); m.rotation.x = -s * Math.PI / 2; m.position.y = s * SZ / 2; cube.add(m); });
      const edges = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(SZ * 1.004, SZ * 1.004, SZ * 1.004)), new T.LineBasicMaterial({ color: 0xffffff })); cube.add(edges);
      const cam = K.cam(36, 17); return { scene, camera: cam, update(t, o) { cube.rotation.set(0.2 + Math.sin(t * 0.5) * 0.05, -o.rot + 0.0, 0); cube.scale.setScalar(o.grow); cube.position.y = 1.7 + Math.sin(t * 0.8) * 0.12; edges.material.color.copy(K.col(OR));
        faces.forEach((c, i) => { const img = o.imgs[i], [w, h] = fitBox(img, SZ * 0.94, SZ * 0.94); c.userData.set(K.tex('cube' + i, img), w, h); c.material.uniforms.dim.value = clamp(0.5 - Math.cos(i * TAU / 4 - o.rot) * 0.5, 0, 0.55); }); cam.position.set(0, 2.2, 24 - o.push); cam.lookAt(0, 0.1, 0); } }; };
    function render(t) {
      stage(t); const st = (t - T0) / STEP, i = clamp(Math.floor(st), 0, N - 1), f = clamp(st - i), turn = Math.min(i + (st < 0 || st >= N ? 0 : io(clamp((f - 0.76) / 0.24))), N - 1), lt = t - T0 - i * STEP;
      const imgs = SH.map((s, j) => frameOf(s, t - T0 - j * STEP > 0 ? Math.min(t - T0 - j * STEP, STEP) : 0)); if (VID.collecting) return; glow(1240, 1);
      const spinIn = (1 - E.outExpo(clamp(t / 1.1))) * TAU * 0.6, okGL = K15.draw('cubex', build, t, { imgs, rot: turn * TAU / 4 + spinIn, grow: 0.2 + 0.8 * SP(t, 0.1, 0.9), push: 1.0 * io(clamp(t / DUR)), alpha: clamp(t * 4) }); if (!okGL) flat(SH[i], lt);
      brand(t); if (t < T0) { const [tix, tiy] = posOf(elP('title'), [540, 1480]); words(TITLE, tix, tiy, t, 0.3, { size: fit(TITLE, 400, 'Bebas', 940, 130, 3), fam: 'Bebas', wt: 400, ls: 3, a: 1 - seg(t, T0 - 0.25, 0.25), shadow: 'rgba(0,0,0,0.5)' }); }
      else { const [lbx, lby] = posOf(elP('label' + (i + 1)), [540, 1480]); label(LB[i], i + 1, N, lt, STEP, lby, lbx); } close(t, OUT, END);
    }
    return { dur: DUR, render, elements, cues() { const ev = [['whoosh', 0.1, 0.34, 0], ['thud', 0.9, 0.22, 0]]; for (let i = 0; i < N; i++) { ev.push(['pop', T0 + i * STEP + 0.45, 0.22, 0]); if (i < N - 1) ev.push(['swish', T0 + i * STEP + STEP * 0.76, 0.34, i % 2 ? 0.3 : -0.3]); } closeCues(ev, OUT); return { dur: DUR, beds: [bed('lounge', DUR)], events: ev }; } };
  }

  // ================================================================ 3D LOGO REVEAL (a bumper: opens or closes any video)
  function logorev() {
    const LINE = TX('line', BRAND.tagline ? up(BRAND.tagline) : '-', { label: 'Line under the logo (a dash leaves it off)', group: 'Text', upper: true, max: 40 }), CTA = TX('cta', up((BRAND.contact && BRAND.contact.cta) || '-'), { label: 'Button (a dash leaves it off)', group: 'Text', upper: true, max: 26 });
    const MOVE = TX('move', 'spin', { label: 'How it arrives', group: 'Motion', options: [['spin', 'Spins in'], ['slam', 'Slams in'], ['rise', 'Rises']].map(([value, label]) => ({ value, label })) }), DUR = 5.5, G3 = typeof K16 !== 'undefined' && K16.ok;
    function elements() { const liP = posOf(elP('line'), [540, 1160]), ctP = posOf(elP('cta'), [540, 1290]); return [
      { id: 'line', kind: 'pos', label: LINE, x: liP[0], y: liP[1], t0: 1.6, d: DUR - 1.6, box: [liP[0] - 460, liP[1] - 40, 920, 60], dup: false, del: false },
      { id: 'cta', kind: 'pos', label: CTA, x: ctP[0], y: ctP[1], t0: 2.3, d: DUR - 2.3, box: [ctP[0] - 400, ctP[1] - 50, 800, 100], dup: false, del: false },
    ].filter(e => e.id !== 'line' || !dash(LINE)).filter(e => e.id !== 'cta' || !dash(CTA)); }
    function render(t) {
      stage(t); if (VID.collecting) return; const c = ctx, img = G3 ? K16.logoOf() : logoImg(false), out = 1 - seg(t, DUR - 0.5, 0.4); glow(800, clamp(t * 1.5)); c.save(); c.globalAlpha *= out;
      const nm = up(BRAND.short || BRAND.name || ''), o = Object.assign(img ? { img, side: OR } : { lines: [nm], face: '#ffffff', side: OR }, { p: clamp((t - 0.15) / 1.3), move: ['spin', 'slam', 'rise'].includes(MOVE) ? MOVE : 'spin', sway: 0.7, scale: 1.02 + 0.06 * clamp(t / DUR), at: [0, -180, W, H], alpha: clamp(t * 5) });
      if (!(G3 && K15.draw('logorev', K16.slabScene(30, 0.16), t, o))) { const k = SB(t, 0.2, 0.9); c.save(); c.translate(540, 780); c.scale(k, k); if (img) { const s = Math.min(760 / img.width, 360 / img.height); c.drawImage(img, -img.width * s / 2, -img.height * s / 2, img.width * s, img.height * s); } else tx(nm, 0, 30, { size: fit(nm, 900, 'Mont', 900, 120, 2), wt: 900, ls: 2, col: WHT }); c.restore(); }
      const lk = E.outC(seg(t, 1.5, 0.6)); c.fillStyle = OR; c.fillRect(540 - 130 * lk, 1078, 260 * lk, 6);
      if (!dash(LINE)) { const [lix, liy] = posOf(elP('line'), [540, 1160]); tx(LINE, lix, liy + (1 - SP(t, 1.6, 0.8)) * 40, { size: fit(LINE, 700, 'Mont', 920, 40, 5), wt: 700, ls: 5, col: WA(0.92), a: seg(t, 1.6, 0.4) }); }
      if (!dash(CTA) && t > 2.3) { const [ctx2, cty] = posOf(elP('cta'), [540, 1290]); pillBtn(CTA, ctx2, cty, { s: 0.5 + 0.5 * SB(t, 2.3, 0.9), a: clamp((t - 2.3) * 6), size: 36, maxW: 800 }); }
      c.restore();
    }
    return { dur: DUR, render, elements, cues() { return { dur: DUR, beds: [bed('lounge', DUR)], events: [['whoosh', 0.1, 0.36, 0], ['thud', 1.15, 0.3, 0], ['sparkle', 1.5, 0.22, 0.2], ['pop', 2.35, 0.26, 0]] }; } };
  }

  // ================================================================ 3D HEADLINE
  function headx() {
    const L1 = TX('l1', 'YOUR HEADLINE', { label: 'Line 1', group: 'Headline', upper: true, max: 18 }), L2 = TX('l2', 'GOES HERE', { label: 'Line 2 (a dash leaves it off)', group: 'Headline', upper: true, max: 18 });
    const SUB = TX('sub', '-', { label: 'Small line in a pill (a dash leaves it off)', group: 'Headline', upper: true, max: 34 }), END = TX('end', pk({ general: 'COME SEE US', auto: 'COME SEE US', food: 'COME HUNGRY' }), { label: 'Ending line', group: 'Ending', upper: true, max: 30 });
    const SH = shot('s1', 'Background', 8, 'v'), OUT = 7.4, DUR = OUT + 4.1, G3 = typeof K16 !== 'undefined' && K16.ok; let BG = null;
    const two = !dash(L2);
    function elements() { const l1P = posOf(elP('l1'), [540, two ? 760 : 900]), l2P = posOf(elP('l2'), [540, 1010]), suP = posOf(elP('sub'), [540, two ? 1250 : 1150]); const els = [
      { id: 'l1', kind: 'pos', label: L1, x: l1P[0], y: l1P[1], t0: 0.35, d: DUR - 0.35, box: [l1P[0] - 490, l1P[1] - 150, 980, 150], dup: false, del: false },
    ];
      if (two) els.push({ id: 'l2', kind: 'pos', label: L2, x: l2P[0], y: l2P[1], t0: 0.95, d: DUR - 0.95, box: [l2P[0] - 490, l2P[1] - 150, 980, 150], dup: false, del: false });
      if (!dash(SUB)) els.push({ id: 'sub', kind: 'pos', label: SUB, x: suP[0], y: suP[1], t0: 1.9, d: DUR - 1.9, box: [suP[0] - 450, suP[1] - 50, 900, 100], dup: false, del: false });
      return els; }
    function render(t) {
      stage(t); const img = frameOf(SH, t); if (VID.collecting) return; const c = ctx;
      if (img) { if (!BG) { BG = document.createElement('canvas'); BG.width = 216; BG.height = 384; BG.g = BG.getContext('2d'); } const kc = Math.max(216 / img.width, 384 / img.height) * 1.1; BG.g.filter = 'blur(6px)'; BG.g.drawImage(img, (216 - img.width * kc) / 2, (384 - img.height * kc) / 2, img.width * kc, img.height * kc); c.drawImage(BG, 0, 0, W, H);
        c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(0, 0, W, H); const [w, h] = fitBox(img, W, H); c.save(); c.globalAlpha *= 0.55; c.drawImage(img, 540 - w / 2, 960 - h / 2, w, h); c.restore(); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, 0, W, H); }
      brand(t); const fade = 1 - seg(t, OUT - 0.3, 0.3);
      const one = (key, s, t0, y, face, side, move, x) => { if (t < t0) return; x = x || 540; const o = { lines: [s], face, side, p: clamp((t - t0) / 1.1), move, sway: 0.8, scale: 1.04, at: [x - 540, y - 960, W, H], alpha: clamp((t - t0) * 8) * fade };
        if (!(G3 && K15.draw(key, K16.slabScene(28, 0.15), t - t0, o))) tx(s, x, y + 40, { size: fit(s, 900, 'Mont', 980, 150, 2), wt: 900, ls: 2, col: face, a: o.alpha, shadow: 'rgba(0,0,0,0.6)' }); };
      const [l1x, l1y] = posOf(elP('l1'), [540, two ? 760 : 900]); one('headx1', L1, 0.35, l1y, '#ffffff', OR, 'slam', l1x);
      if (two) { const [l2x, l2y] = posOf(elP('l2'), [540, 1010]); one('headx2', L2, 0.95, l2y, OR, '#ffffff', 'spin', l2x); }
      if (!dash(SUB) && t > 1.9) { const [sux, suy] = posOf(elP('sub'), [540, two ? 1250 : 1150]); pillBtn(SUB, sux, suy, { s: 0.5 + 0.5 * SB(t, 1.9, 0.9), a: clamp((t - 1.9) * 6) * fade, size: 36, maxW: 900 }); }
      close(t, OUT, END);
    }
    return { dur: DUR, render, elements, cues() { const ev = [['whoosh', 0.2, 0.3, 0], ['thud', 0.55, 0.34, 0], ['whoosh', 0.9, 0.3, 0.3], ['thud', 1.75, 0.22, 0], ['pop', 1.95, 0.26, 0]]; closeCues(ev, OUT); return { dur: DUR, beds: [bed('pulse', DUR)], events: ev }; } };
  }

  const P = ({ ringx, showx, flyx, cubex, logorev, headx }[V] || ringx)(); if (V !== 'logorev') BT = K17.fields();
  DIR = { dur: P.dur, bg: BLK, finish: { vig: 0.14, grain: 0.1 }, edl: [], shakes: [], preload: () => K3.init(), render: P.render, cues: P.cues, ...(P.elements ? { elements: P.elements } : {}) };
});
