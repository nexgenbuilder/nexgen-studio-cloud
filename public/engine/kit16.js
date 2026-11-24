'use strict';
/* Motion kit 16 (V26, Nov 15): 3D that earns its place, more kinetic type, and a vehicle details overlay.
   - Six 3D transitions (Transitions > 3D): Cube turn, Card flip, Doors, Fall away, Fly through, Turntable.
   - Graphics > 3D now holds two pieces: 3D title (extruded text) and 3D logo (the brand logo as a solid slab).
     The seven 3D background layers from V25 are no longer listed (projects that use them still play).
   - Twelve new text entrances for the type engine (Fine tune > Entrance, and the Motion tab presets).
   - Graphics > Informational > Vehicle details: name, two price lines, mileage, title status, VIN and stock number.
   Needs kit15 (three.js). Without it the 3D parts are simply not listed; the rest still loads. */
const K16 = (() => {
  const TAU = Math.PI * 2, io = x => x * x * (3 - 2 * x), spring = x => (x >= 1 ? 1 : 1 - Math.exp(-6.5 * x) * Math.cos(9 * x));
  const T = window.THREE, GL = !!T && typeof K15 !== 'undefined';
  const col = k => (K8.col ? K8.col(k) : k);
  const FNT = (wt, size, fam) => (typeof F === 'function' ? F(wt, size, fam) : wt + ' ' + size + 'px ' + fam + ', sans-serif');

  // ================================================================ new text entrances
  const IN = K8.IN, add = (k, o) => { if (!IN[k]) IN[k] = Object.assign({ cat: 'Kinetic', st: 0.08, d: 0.5, ease: 'out' }, o); };
  add('slam', { name: 'Slam', by: 'word', d: 0.42, st: 0.1, ease: 'sharp', fn: (e, r, U, o) => { const s = 1 + (1 - e) * 2.6 * o.amt; return { sx: s, sy: s, rot: (1 - e) * (hash(U.k * 3.1) - 0.5) * 0.5, a: clamp(r * 8), blur: (1 - e) * 10 }; } });
  add('twist', { name: 'Twist in', by: 'word', d: 0.6, st: 0.08, ease: 'back', fn: (e, r, U, o) => ({ rot: (1 - e) * (U.k % 2 ? 1 : -1) * 0.9 * o.amt, sx: Math.max(0.05, e), sy: Math.max(0.05, e), a: clamp(r * 4) }) });
  add('skewin', { name: 'Skew slide', by: 'line', d: 0.55, st: 0.1, ease: 'snap', dir: 'left', fn: (e, r, U, o) => ({ dx: o.v[0] * (1 - e) * 700 * o.amt, dy: o.v[1] * (1 - e) * 500 * o.amt, skew: -o.v[0] * (1 - e) * 0.9, a: clamp(r * 4) }) });
  add('rain', { name: 'Letter rain', by: 'char', d: 0.7, st: 0.035, ease: 'bounce', fn: (e, r, U, o) => ({ dy: -(1 - e) * o.size * (2 + hash(U.k * 1.7) * 3) * o.amt, rot: (1 - e) * (hash(U.k * 2.3) - 0.5) * 1.2, a: clamp(r * 8) }) });
  add('scatter', { name: 'Scatter in', by: 'char', d: 0.8, st: 0.02, ease: 'out', fn: (e, r, U, o) => { const s = 0.3 + 0.7 * e; return { dx: (1 - e) * (hash(U.k * 1.3) - 0.5) * 900 * o.amt, dy: (1 - e) * (hash(U.k * 2.9) - 0.5) * 900 * o.amt, rot: (1 - e) * (hash(U.k * 4.1) - 0.5) * 3, sx: s, sy: s, a: clamp(r * 3) }; } });
  add('zoomblur', { name: 'Zoom blur', by: 'line', d: 0.5, st: 0.12, ease: 'sharp', fn: (e, r, U, o) => { const s = 1 + (1 - e) * 3 * o.amt; return { sx: s, sy: s, blur: (1 - e) * 22, a: clamp(r * 5) }; } });
  add('roll', { name: 'Roll in', by: 'char', d: 0.6, st: 0.03, ease: 'out', fn: (e, r, U, o) => ({ dx: -(1 - e) * o.size * 1.2 * o.amt, rot: -(1 - e) * 2.4, a: clamp(r * 5) }) });
  add('stomp', { name: 'Stomp', by: 'word', d: 0.5, st: 0.11, ease: 'bounce', fn: (e, r, U, o) => ({ dy: -(1 - e) * o.size * 2.2 * o.amt, sy: 1 + (1 - e) * 0.8, a: clamp(r * 8) }) });
  add('hinge', { name: 'Hinge swing', by: 'line', d: 0.9, st: 0.12, ease: 'elastic', fn: (e, r, U, o) => ({ rot: -(1 - e) * 1.1 * o.amt, dx: -(1 - e) * o.size * 0.6, a: clamp(r * 5) }) });
  add('shake', { name: 'Shake hit', by: 'all', d: 0.6, st: 0, ease: 'out', fn: (e, r, U, o) => { const s = 1 + (1 - e) * 0.5; return { dx: Math.sin(r * 46) * (1 - r) * 46 * o.amt, dy: Math.cos(r * 39) * (1 - r) * 24 * o.amt, sx: s, sy: s, a: clamp(r * 8) }; } });
  add('unfold', { name: 'Unfold', by: 'word', d: 0.5, st: 0.09, ease: 'out', fn: (e, r) => ({ sx: Math.max(0.02, e), a: clamp(r * 5) }) });
  add('rgbhit', { name: 'Colour split hit', cat: 'FX', by: 'all', d: 0.5, st: 0, ease: 'sharp', fn: (e, r, U, o) => { const s = 1 + (1 - e) * 0.4 * o.amt; return { rgb: (1 - e) * 26 * o.amt, sx: s, sy: s, a: clamp(r * 8) }; } });

  // ================================================================ vehicle details overlay (2D)
  if (typeof K9 !== 'undefined') {
    const str = (L, k) => String(L[k] === undefined || L[k] === null ? '' : L[k]).trim();
    const txt = (c, s, x, y, o) => { c.font = FNT(o.wt || 700, o.size, o.fam || 'Mont'); c.fillStyle = o.col; c.textAlign = o.align || 'left'; c.textBaseline = 'alphabetic'; try { c.letterSpacing = (o.ls || 0) + 'px'; } catch (e) { } c.fillText(s, x, y); try { c.letterSpacing = '0px'; } catch (e) { } };
    const fitS = (s, wt, fam, maxW, size, ls) => { const c = ctx; c.font = FNT(wt, size, fam); try { c.letterSpacing = (ls || 0) + 'px'; } catch (e) { } const w = c.measureText(s).width; try { c.letterSpacing = '0px'; } catch (e) { } return w > maxW ? Math.floor(size * maxW / w) : size; };
    const rows = L => { const r = [], br = str(L, 'brand'); if (br === 'logo' || br === 'full') r.push(['logo', 100]); if (str(L, 'name')) r.push(['name', 104]); if (str(L, 'price')) r.push(['price', 112]); if (str(L, 'down')) r.push(['down', 112]); if (str(L, 'miles') || str(L, 'title')) r.push(['chips', 86]); if (str(L, 'vin') || str(L, 'stock')) r.push(['vin', 56]); if (br === 'full') r.push(['contact', 70]); return r; };
    const hOf = L => rows(L).reduce((a, r) => a + r[1], 0) + 56;
    const e = { id: 'vehicle', name: 'Vehicle details', cat: 'info', d: 6, full: false, inD: 0.6, outD: 0.4, defs: {}, desc: 'A listing card for one vehicle: its name, a price line, a second line such as the down payment, mileage, title status, VIN and stock number. Empty lines are left off.',
      ex: { name: 'YEAR MAKE MODEL', plabel: 'FULL PRICE', price: '$0,000', dlabel: 'DOWN PAYMENT', down: '$000', miles: '00,000 MILES', title: 'TITLE STATUS', vin: 'VIN 00000000000000000' },
      fields: [['name', 'Vehicle (year, make, model)', 'text', '', { max: 34 }], ['plabel', 'Price label', 'text', 'FULL PRICE', { max: 18 }], ['price', 'Price', 'text', '', { max: 14 }], ['dlabel', 'Second label', 'text', 'DOWN PAYMENT', { max: 18 }], ['down', 'Second amount', 'text', '', { max: 14 }],
        ['miles', 'Mileage', 'text', '', { max: 20 }], ['title', 'Title status', 'text', '', { max: 20 }], ['vin', 'VIN', 'text', '', { max: 26 }], ['stock', 'Stock number', 'text', '', { max: 20 }], ['brand', 'Logo & contact', 'seg', 'off', [['off', 'Off'], ['logo', 'Logo'], ['full', 'Logo + contact']]], ['color', 'Accent', 'col', 'accent']],
      box: L => { const h = Math.max(160, hOf(L)); return [-450, -h / 2, 900, h]; },
      draw(L, s) {
        const c = ctx, R = rows(L); if (!R.some(r => r[0] !== 'logo' && r[0] !== 'contact')) { K9.need('Add the vehicle details', 0, 0, 30, { raw: true }); return; }
        const h = hOf(L), k = E.outC(clamp(s.p)), a = clamp(s.p * 3) * (1 - E.inC(s.q)), acc = s.c1 || col('accent'), ink = col('ink'), paper = '#FFFFFF', mute = 'rgba(20,20,26,0.6)';
        c.save(); c.globalAlpha *= a; c.translate(0, (1 - k) * 120);
        c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 44; c.shadowOffsetY = 16; c.fillStyle = paper; c.beginPath(); c.roundRect(-450, -h / 2, 900, h, 32); c.fill(); c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0;
        c.fillStyle = acc; c.beginPath(); c.roundRect(-450, -h / 2, 16, h, 8); c.fill();
        let y = -h / 2 + 28; R.forEach(([kind, rh], i) => { const rk = E.outC(clamp((s.lt - 0.25 - i * 0.12) / 0.4)); c.save(); c.globalAlpha *= rk; c.translate((1 - rk) * 40, 0); const by = y + rh;
          if (kind === 'logo') { if (typeof K17 !== 'undefined') K17.logo(-400, y + 52, 420, 72, true, 1, 'left'); }
          else if (kind === 'contact') { c.fillStyle = 'rgba(20,20,26,0.14)'; c.fillRect(-406, y + 6, 812, 2); if (typeof K17 !== 'undefined') K17.row(K17.items(['phone', 'web']), -406, y + 42, 812, 26, { col: '#14141A', acc, a: 1, align: 'left' }); }
          else if (kind === 'name') { const n = str(L, 'name').toUpperCase(); txt(c, n, -400, by - 22, { size: fitS(n, 400, 'Bebas', 800, 92, 1.5), wt: 400, fam: 'Bebas', ls: 1.5, col: '#14141A' }); }
          else if (kind === 'price' || kind === 'down') { const lab = (str(L, kind === 'price' ? 'plabel' : 'dlabel') || (kind === 'price' ? 'FULL PRICE' : 'DOWN PAYMENT')).toUpperCase(), v = str(L, kind), hot = kind === 'price';
            c.fillStyle = hot ? acc : 'rgba(20,20,26,0.06)'; c.beginPath(); c.roundRect(-410, y + 6, 820, rh - 14, 18); c.fill(); const on = hot ? K8.onCol(acc) : '#14141A';
            txt(c, lab, -380, by - 40, { size: fitS(lab, 800, 'Mont', 400, 36, 2.5), wt: 800, ls: 2.5, col: on }); txt(c, v, 384, by - 30, { size: fitS(v, 400, 'Bebas', 380, 86, 1), wt: 400, fam: 'Bebas', ls: 1, col: on, align: 'right' }); }
          else if (kind === 'chips') { let x = -410; for (const f of ['miles', 'title']) { const v = str(L, f).toUpperCase(); if (!v) continue; const fs = fitS(v, 700, 'Mont', 360, 28, 2); c.font = FNT(700, fs, 'Mont'); try { c.letterSpacing = '2px'; } catch (e2) { } const w = c.measureText(v).width + 44; try { c.letterSpacing = '0px'; } catch (e2) { }
            c.strokeStyle = '#14141A'; c.lineWidth = 3; c.beginPath(); c.roundRect(x, y + 14, w, 56, 28); c.stroke(); txt(c, v, x + 22, y + 52, { size: fs, wt: 700, ls: 2, col: '#14141A' }); x += w + 14; } }
          else { const v = [str(L, 'vin'), str(L, 'stock') ? 'STOCK ' + str(L, 'stock') : ''].filter(Boolean).join('   ·   ').toUpperCase(); txt(c, v, -406, by - 14, { size: fitS(v, 600, 'Mont', 810, 24, 2), wt: 600, ls: 2, col: mute }); }
          c.restore(); y += rh; });
        c.restore();
      } };
    e.fields.forEach(f => (e.defs[f[0]] = f[3])); K9.EL.vehicle = e; const at = K9.ORDER.indexOf('specs'); K9.ORDER.splice(at < 0 ? K9.ORDER.length : at + 1, 0, 'vehicle');
  }
  if (!GL) return { ok: false, spring, io };

  // ================================================================ 3D transitions
  const CZ = 1 / Math.tan(20 * Math.PI / 180), PW = 2 * W / H;
  const ctex = cv => { const x = new T.CanvasTexture(cv); x.encoding = T.sRGBEncoding; x.minFilter = T.LinearFilter; x.magFilter = T.LinearFilter; x.generateMipmaps = false; return x; };
  const trBuild = kind => () => {
    const scene = new T.Scene(), cam = K15.cam(40, CZ), blank = () => document.createElement('canvas'), tA = ctex(blank()), tB = ctex(blank());
    const plane = (t, u0, u1, v0, v1) => { const g = new T.PlaneGeometry(PW * (u1 - u0), 2 * (v1 - v0)), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0)); return new T.Mesh(g, new T.MeshBasicMaterial({ map: t, transparent: true })); };
    const G = new T.Group(); scene.add(G); const A = plane(tA, 0, 1, 0, 1), B = plane(tB, 0, 1, 0, 1); let P1, P2, H1, H2;
    if (kind === 'doors') { P1 = new T.Group(); P2 = new T.Group(); H1 = plane(tA, 0, 0.5, 0, 1); H2 = plane(tA, 0.5, 1, 0, 1); P1.position.x = -PW / 2; H1.position.x = PW / 4; P2.position.x = PW / 2; H2.position.x = -PW / 4; P1.add(H1); P2.add(H2); G.add(B, P1, P2); }
    else if (kind === 'fall') { P1 = new T.Group(); P1.add(A); G.add(B, P1); }
    else G.add(A, B);
    const sh = (m, k) => m.material.color.setScalar(Math.max(0.12, Math.min(1, k)));
    return { scene, camera: cam, update(u, o) {
      tA.image = o.a; tA.needsUpdate = true; tB.image = o.b; tB.needsUpdate = true; const e = E.inOutC(clamp(u)), d = o.dir, s = d === 'right' || d === 'down' ? -1 : 1, vert = d === 'up' || d === 'down';
      if (kind === 'cube') { const dp = vert ? 1 : PW / 2; A.position.set(0, 0, dp); A.rotation.set(0, 0, 0); if (vert) { B.position.set(0, -s * 1, 0); B.rotation.set(s * Math.PI / 2, 0, 0); G.rotation.set(-s * e * Math.PI / 2, 0, 0); } else { B.position.set(s * PW / 2, 0, 0); B.rotation.set(0, s * Math.PI / 2, 0); G.rotation.set(0, -s * e * Math.PI / 2, 0); }
        G.position.z = -dp - Math.sin(Math.PI * e) * dp * 0.55; sh(A, 1 - e * 0.75); sh(B, 0.25 + e * 0.75); }
      else if (kind === 'flip') { A.position.z = 0.002; B.position.z = -0.002; if (vert) { B.rotation.set(Math.PI, 0, 0); G.rotation.set(s * e * Math.PI, 0, 0); } else { B.rotation.set(0, Math.PI, 0); G.rotation.set(0, -s * e * Math.PI, 0); } G.position.z = -Math.sin(Math.PI * e) * 1.3; A.visible = e < 0.5; B.visible = e >= 0.5; sh(A, 1 - e * 1.2); sh(B, e * 1.2 - 0.2); }
      else if (kind === 'doors') { const an = e * 1.62; P1.rotation.y = an; P2.rotation.y = -an; B.position.z = -0.9 * (1 - e); sh(B, 0.3 + 0.7 * e); sh(H1, 1 - e * 0.6); sh(H2, 1 - e * 0.6); H1.material.opacity = H2.material.opacity = 1 - clamp((e - 0.8) / 0.2); }
      else if (kind === 'fall') { const up = d === 'up'; P1.position.y = up ? 1 : -1; A.position.y = up ? -1 : 1; P1.rotation.x = (up ? 1 : -1) * e * Math.PI / 2; B.position.z = -0.7 * (1 - e); sh(B, 0.3 + 0.7 * e); sh(A, 1 - e * 0.7); A.material.opacity = 1 - clamp((e - 0.85) / 0.15); }
      else if (kind === 'through') { A.position.z = e * e * CZ * 0.96; A.rotation.z = e * 0.22; A.material.opacity = 1 - e * e * e; A.renderOrder = 2; B.position.z = -2.4 * (1 - io(e)); sh(B, 0.3 + 0.7 * e); }
      else { const R = 1.7, a1 = -s * e * 1.25, a2 = s * (1 - e) * 1.25; A.position.set(R * Math.sin(a1), 0, R * Math.cos(a1) - R); A.rotation.y = a1; B.position.set(R * Math.sin(a2), 0, R * Math.cos(a2) - R); B.rotation.y = a2; sh(A, 1 - e * 0.7); sh(B, 0.3 + 0.7 * e); G.position.z = -Math.sin(Math.PI * e) * 0.5; }
    } };
  };
  if (typeof KT !== 'undefined' && typeof K4 !== 'undefined') {
    if (!KT.CATS.some(c => c[0] === '3d')) KT.CATS.push(['3d', '3D']);
    const def = (id, kind, name, desc, o) => { const run = (u, A, B, oo) => { const a = K4.into('k16A', A), b = K4.into('k16B', B); fillScreen('#000'); if (!K15.draw('tr3:' + kind, trBuild(kind), u, { a, b, dir: oo.dir })) (u < 0.5 ? A : B)(); };
      const t = Object.assign({ id, cat: '3d', name, desc, d: 0.7, dirs: null, color: false, zoom: false, dpgOff: false, text: false, sfx: 'whoosh', fn: run }, o); if (!KT.MAP[id]) { KT.LIST.push(t); KT.MAP[id] = t; } };
    def('cube3d', 'cube', 'Cube turn', 'Both shots sit on a cube that turns to the next face.', { d: 0.8, dirs: ['left', 'right', 'up', 'down'] });
    def('flip3d', 'flip', 'Card flip', 'The shot flips over like a card; the next shot is on its back.', { d: 0.75, dirs: ['left', 'right', 'up', 'down'] });
    def('doors3d', 'doors', 'Doors', 'The shot splits down the middle and swings open like double doors.', { d: 0.8 });
    def('fall3d', 'fall', 'Fall away', 'The shot tips backward like a board falling flat, the next shot behind it.', { d: 0.75, dirs: ['down', 'up'] });
    def('through3d', 'through', 'Fly through', 'The camera flies straight through the shot to the next one waiting in the distance.', { d: 0.7 });
    def('turn3d', 'turn', 'Turntable', 'The shots swing past on a turntable, one out and the next in.', { d: 0.8, dirs: ['left', 'right'] });
  }

  // ================================================================ extruded slabs: text or a logo with real depth
  function slab(n, depth) { const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 512; const tex = ctex(cv), g = new T.Group(), geo = new T.PlaneGeometry(1, 0.5), face = new T.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.25 }), side = new T.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.25 });
    for (let i = n - 1; i >= 0; i--) { const m = new T.Mesh(geo, i ? side : face); m.position.z = -depth * i / (n - 1); m.renderOrder = n - i; g.add(m); } return { g, cv, tex, face, side, sig: '' }; }
  function setText(S, lines) { const sig = 't:' + lines.join('\n'); if (S.sig === sig) return; S.sig = sig; const c = S.cv.getContext('2d'); c.clearRect(0, 0, 1024, 512); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; const n = lines.length, max = n > 1 ? 210 : 300;
    lines.forEach((s, i) => { let size = max; c.font = FNT(900, size, 'Mont'); const w = c.measureText(s).width; if (w > 980) size = Math.floor(size * 980 / w); c.font = FNT(900, size, 'Mont'); c.fillText(s, 512, 256 + (i - (n - 1) / 2) * max * 1.02 + size * 0.04); }); S.tex.needsUpdate = true; }
  function setImage(S, img) { const sig = 'i:' + (img.src || '') + img.width + 'x' + img.height; if (S.sig === sig) return; S.sig = sig; const c = S.cv.getContext('2d'); c.clearRect(0, 0, 1024, 512); const k = Math.min(980 / img.width, 470 / img.height); c.drawImage(img, 512 - img.width * k / 2, 256 - img.height * k / 2, img.width * k, img.height * k); S.tex.needsUpdate = true; }
  const logoOf = () => (typeof IMG !== 'undefined' ? IMG.logoW || IMG.logoB : null);
  // entrance + idle sway for a slab; p = entrance 0..1, t = seconds
  function pose(S, t, p, move, sway, scale) { const k = spring(clamp(p)), g = S.g; let s = scale; g.position.set(0, 0, 0); g.rotation.set(0, 0, 0);
    if (move === 'slam') { const z = Math.pow(1 - clamp(p * 1.7), 2); s *= 1 + z * 2.6; g.rotation.z = z * 0.25; } else if (move === 'rise') { g.position.y = -(1 - k) * 0.55; g.rotation.x = (1 - k) * 1.0; } else { g.rotation.y = -(1 - k) * 2.4; s *= 0.3 + 0.7 * k; }
    g.rotation.y += Math.sin(t * 1.1) * 0.24 * sway; g.rotation.x += Math.sin(t * 0.8 + 1) * 0.08 * sway; g.scale.setScalar(s); }
  const slabScene = (n, depth) => () => { const scene = new T.Scene(), S = slab(n, depth); scene.add(S.g); return { scene, camera: K15.cam(40, CZ), S, update(t, o) { if (o.img) setImage(S, o.img); else setText(S, o.lines); S.face.color.copy(o.img ? new T.Color(1, 1, 1) : K15.lin(o.face)); S.side.color.copy(K15.lin(o.side)); if (o.img) S.side.color.multiplyScalar(0.55); pose(S, t, o.p, o.move, o.sway, o.scale || 0.98); } }; };

  if (typeof K9 !== 'undefined') {
    for (let i = K9.ORDER.length - 1; i >= 0; i--) if (/^gl_/.test(K9.ORDER[i])) K9.ORDER.splice(i, 1);   // V25's background layers: kept for old projects, no longer offered
    const num = (L, k, d) => { const x = +L[k]; return isFinite(x) && L[k] !== undefined && L[k] !== null && L[k] !== '' ? x : d; };
    const MOVE = ['move', 'Entrance', 'seg', 'spin', [['spin', 'Spin'], ['slam', 'Slam'], ['rise', 'Rise']]], SWAY = ['sway', 'Sway', 'range', 1, [0, 2, 0.1]];
    const reg = (id, o, opts) => { const e = Object.assign({ id, cat: '3d', d: 4, full: false, inD: 0.9, outD: 0.4, ex: {}, defs: {}, box: () => [-480, -250, 960, 500] }, o); e.fields.forEach(f => (e.defs[f[0]] = f[3]));
      e.draw = (L, s) => { const o2 = opts(L, s); if (!o2) return; Object.assign(o2, { p: s.p, move: L.move || 'spin', sway: num(L, 'sway', 1), at: [-W / 2, -H / 2, W, H], alpha: 1 - E.inC(s.q) }); if (!K15.draw('mg3:' + id + ':' + (L.id || 'pv'), slabScene(26, 0.13), s.lt, o2)) K9.need('3D needs WebGL, which is off on this device', 0, 0, 30, { raw: true }); };
      K9.EL[id] = e; K9.ORDER.push(id); };
    reg('title3d', { name: '3D title', desc: 'Your words as solid 3D letters that spin, slam or rise in and keep turning gently. One or two short lines.', ex: { text: 'BIG NEWS' },
      fields: [['text', 'Text', 'text', '', { max: 22 }], ['text2', 'Second line', 'text', '', { max: 22 }], ['color', 'Face colour', 'col', 'white'], ['col2', 'Side colour', 'col', 'accent'], MOVE, SWAY] },
      (L, s) => ({ lines: [String(L.text || 'YOUR TITLE').toUpperCase(), String(L.text2 || '').toUpperCase()].filter(Boolean), face: s.c1 || col(L.color || 'white'), side: col(L.col2 || 'accent') }));
    reg('logo3d', { name: '3D logo', desc: 'The brand logo as a solid slab with real depth. It spins in and keeps turning gently. Drop it on the last shot.', fields: [['col2', 'Side colour', 'col', 'ink'], MOVE, SWAY] },
      (L) => { const img = logoOf(); return img ? { img, side: col(L.col2 || 'ink') } : { lines: [String((typeof BRAND !== 'undefined' && (BRAND.short || BRAND.name)) || 'YOUR LOGO').toUpperCase()], face: '#ffffff', side: col(L.col2 || 'accent') }; });
  }
  return { ok: true, slabScene, slab, setText, setImage, pose, logoOf, spring, io, CZ };
})();
