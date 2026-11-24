'use strict';
/* Motion kit 15 (V25, Nov 13): real 3D. A three.js / WebGL stage that renders into the same 2D frame as everything else,
   so 3D sits in the layer stack, in previews and in exports like any other drawing. Every scene is a pure function of
   time (no clocks, no random drift between frames), which keeps the preview and the exported file identical.
     K15.ok()                      is 3D available here (three.js loaded and WebGL working)
     K15.draw(key, build, t, o)    build(THREE, K15) -> { scene, camera, update(t, o) } once per key, then render + composite
     K15.tex(key, img)             a texture slot fed with whatever frame the footage engine hands over
     K15.card(o)                   an unlit rounded picture card (used by the 3D templates)
   It also adds a "3D" shelf to the Graphics library: seven full-frame 3D layers.
   If three.js cannot load (offline, blocked) or the device has no WebGL, K15.ok() is false and 3D layers draw nothing. */
const K15 = (() => {
  const T = window.THREE; let R = null, cv = null, bad = !T; const SC = new Map(), TX = new Map();
  function init() {
    if (R || bad) return !!R;
    try { cv = document.createElement('canvas'); cv.width = W; cv.height = H; R = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, preserveDrawingBuffer: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
      R.setPixelRatio(1); R.setSize(W, H, false); R.setClearColor(0x000000, 0); R.outputEncoding = T.sRGBEncoding;
      cv.addEventListener('webglcontextlost', e => { e.preventDefault(); SC.clear(); TX.clear(); R = null; }); } catch (e) { bad = true; R = null; }
    return !!R;
  }
  const ok = () => !bad && (!!R || init());
  const col = c => { const k = new T.Color(); try { k.set(c); } catch (e) { k.set('#ffffff'); } return k; };       // as written (for our own shaders)
  const lin = c => col(c).convertSRGBToLinear();                                                                    // for lit materials
  function draw(key, build, t, o) {
    if (VID.collecting || !ok()) return false; let s = SC.get(key);
    if (!s) { if (SC.size > 7) { const k0 = SC.keys().next().value, old = SC.get(k0); SC.delete(k0); try { old.scene.traverse(m => { if (m.geometry) m.geometry.dispose(); if (m.material) m.material.dispose(); }); } catch (e) { } }
      try { s = build(T, API); } catch (e) { console.error('K15 build', key, e); bad = true; return false; } SC.set(key, s); }
    try { s.update(t, o || {}); R.clear(); R.render(s.scene, s.camera); } catch (e) { console.error('K15 render', key, e); return false; }
    const c = ctx, a = o && o.alpha !== undefined ? o.alpha : 1; if (a <= 0) return true; c.save(); c.globalAlpha *= a; if (o && o.blend) c.globalCompositeOperation = o.blend; const at = (o && o.at) || [0, 0, W, H]; c.drawImage(cv, at[0], at[1], at[2], at[3]); c.restore(); return true;
  }
  // footage frames arrive as bitmaps or canvases; none are flipped on upload, so the texture matrix turns them the right way up
  function tex(key, img) {
    let x = TX.get(key); if (!x) { x = new T.Texture(); x.flipY = false; x.premultiplyAlpha = false; x.minFilter = T.LinearFilter; x.magFilter = T.LinearFilter; x.generateMipmaps = false; x.encoding = T.LinearEncoding; x.repeat.set(1, -1); x.offset.set(0, 1); TX.set(key, x); }
    if (img && x.image !== img) { x.image = img; x.needsUpdate = true; } return x;
  }
  const CARD_V = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
  const CARD_F = 'uniform sampler2D map; uniform vec2 size; uniform float radius; uniform float opacity; uniform float fade; uniform float dim; uniform vec3 edge; uniform float border; varying vec2 vUv;' +
    'void main(){ vec2 p = (vUv - 0.5) * size; vec2 q = abs(p) - size * 0.5 + radius; float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius; float a = 1.0 - smoothstep(-0.006, 0.006, d);' +
    ' vec4 c = texture2D(map, vec2(vUv.x, 1.0 - vUv.y)); vec3 rgb = c.rgb * (1.0 - dim); if (border > 0.0) rgb = mix(rgb, edge, smoothstep(-border - 0.006, -border, d));' +
    ' float f = fade > 0.0 ? pow(clamp(vUv.y, 0.0, 1.0), 1.0 / max(fade, 0.01)) : 1.0; gl_FragColor = vec4(rgb, 1.0) * a * opacity * f; }';
  // a picture on a rounded card. size is in world units; set .userData.set(img, w, h) each frame
  function card(o) {
    o = o || {}; const m = new T.ShaderMaterial({ uniforms: { map: { value: null }, size: { value: new T.Vector2(1, 1) }, radius: { value: o.radius === undefined ? 0.04 : o.radius }, opacity: { value: 1 }, fade: { value: o.fade || 0 }, dim: { value: 0 }, edge: { value: col(o.edge || '#ffffff') }, border: { value: o.border || 0 } },
      vertexShader: CARD_V, fragmentShader: CARD_F, transparent: true, depthWrite: !o.fade, side: T.DoubleSide, premultipliedAlpha: true, blending: T.CustomBlending, blendSrc: T.OneFactor, blendDst: T.OneMinusSrcAlphaFactor });
    const mesh = new T.Mesh(new T.PlaneGeometry(1, 1), m); mesh.userData.set = (texture, w, h) => { m.uniforms.map.value = texture; m.uniforms.size.value.set(w, h); mesh.scale.set(w, h, 1); }; return mesh;
  }
  const cam = (fov, z) => { const c = new T.PerspectiveCamera(fov || 40, W / H, 0.1, 200); c.position.set(0, 0, z || 10); return c; };
  // a repeatable pseudo-random number for index i (scenes must look the same on every run)
  const rnd = (i, s) => { const x = Math.sin(i * 127.1 + (s || 0) * 311.7) * 43758.5453; return x - Math.floor(x); };
  const API = { ok, draw, tex, card, cam, col, lin, rnd, get THREE() { return T; }, get canvas() { return cv; } };

  // ================================================================ the 3D shelf in the Graphics library
  if (typeof K9 !== 'undefined' && T) {
    const C = k => (K8.col ? K8.col(k) : k), TAU = Math.PI * 2;
    const QUAD_V = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
    const quad = (T, frag, uni) => { const scene = new T.Scene(), m = new T.ShaderMaterial({ uniforms: uni, vertexShader: QUAD_V, fragmentShader: 'precision highp float; varying vec2 vUv; uniform float t; ' + frag, transparent: true, depthTest: false, premultipliedAlpha: true, blending: T.CustomBlending, blendSrc: T.OneFactor, blendDst: T.OneMinusSrcAlphaFactor }); scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), m)); return { scene, camera: new T.Camera(), m }; };
    const NOISE = 'vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return -1.0 + 2.0 * fract(sin(p) * 43758.5453); }' +
      'float ns(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f); return mix(mix(dot(h2(i), f), dot(h2(i + vec2(1, 0)), f - vec2(1, 0)), u.x), mix(dot(h2(i + vec2(0, 1)), f - vec2(0, 1)), dot(h2(i + vec2(1, 1)), f - vec2(1, 1)), u.x), u.y); }';
    const num = (L, k, d) => { const x = +L[k]; return isFinite(x) && L[k] !== undefined && L[k] !== null && L[k] !== '' ? x : d; };
    const SPD = ['sp', 'Speed', 'range', 1, [0.2, 3, 0.1]], AMT = ['amt', 'Strength', 'range', 1, [0.1, 1, 0.05]], BL = ['blend', 'Over footage', 'seg', 'normal', [['normal', 'Normal'], ['screen', 'Glow']]];
    const fadeOf = s => E.outC(clamp(s.p)) * (1 - E.inC(s.q));
    const reg = (id, o, build) => { const e = Object.assign({ id, cat: '3d', d: 6, full: true, box: () => [0, 0, W, H], ex: {}, defs: {}, inD: 0.6, outD: 0.5 }, o); e.fields.forEach(f => (e.defs[f[0]] = f[3]));
      e.draw = (L, s) => { const blend = (L.blend || e.defs.blend) === 'screen' ? 'screen' : null; if (!draw('mg:' + L.id + ':' + id, build, s.lt * num(L, 'sp', 1), { L, s, alpha: fadeOf(s) * num(L, 'amt', 1), blend, c1: s.c1, c2: C(L.col2 || e.defs.col2 || 'ink') }) && !VID.collecting && !ok()) K9.need('3D needs WebGL, which is off on this device', 540, 960, 30, { raw: true }); };
      K9.EL[id] = e; K9.ORDER.push(id); };
    if (!K9.CATS.some(c => c[0] === '3d')) K9.CATS.push(['3d', '3D']);

    reg('gl_flow', { name: 'Liquid gradient', desc: 'Your colours flowing into each other like slow liquid. A full background for text, or a glow over footage.', fields: [['color', 'Colour', 'col', 'accent'], ['col2', 'Second colour', 'col', 'ink'], SPD, AMT, BL] },
      T => { const q = quad(T, 'uniform vec3 c1; uniform vec3 c2; ' + NOISE + ' void main(){ vec2 p = vUv * vec2(1.0, 1.78); float n = ns(p * 1.3 + vec2(t * 0.11, -t * 0.07)); n += 0.5 * ns(p * 2.6 + n * 1.4 + vec2(-t * 0.09, t * 0.13)); float k = smoothstep(-0.55, 0.75, n + (vUv.y - 0.5) * 0.7);' +
          ' vec3 c = mix(c2, c1, k); c += 0.16 * c1 * smoothstep(0.35, 0.9, ns(p * 3.2 - t * 0.1 + n)); c *= 1.0 - 0.35 * length(vUv - 0.5); gl_FragColor = vec4(c, 1.0); }', { t: { value: 0 }, c1: { value: new T.Color() }, c2: { value: new T.Color() } });
        return { scene: q.scene, camera: q.camera, update(t, o) { q.m.uniforms.t.value = t; q.m.uniforms.c1.value.copy(col(o.c1)); q.m.uniforms.c2.value.copy(col(o.c2)); } }; });

    const points = (T, n, size, soft) => { const g = new T.BufferGeometry(), pos = new Float32Array(n * 3), sd = new Float32Array(n); for (let i = 0; i < n; i++) { pos[i * 3] = (rnd(i, 1) - 0.5) * 14; pos[i * 3 + 1] = (rnd(i, 2) - 0.5) * 22; pos[i * 3 + 2] = -rnd(i, 3) * 40; sd[i] = rnd(i, 4); } g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('seed', new T.BufferAttribute(sd, 1));
      const m = new T.ShaderMaterial({ uniforms: { t: { value: 0 }, c1: { value: new T.Color() }, size: { value: size }, soft: { value: soft }, rise: { value: 0 } }, transparent: true, depthTest: false, premultipliedAlpha: true, blending: T.CustomBlending, blendSrc: T.OneFactor, blendDst: T.OneFactor,
        vertexShader: 'attribute float seed; uniform float t; uniform float size; uniform float rise; varying float vA; varying float vS; void main(){ vec3 p = position; p.z = mod(p.z + t * (1.2 + seed * 2.2), 40.0) - 40.0; p.y = mod(p.y + rise * t * (0.4 + seed) + 11.0, 22.0) - 11.0; p.x += sin(t * 0.4 + seed * 40.0) * 0.5; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = size * (0.4 + seed) * 300.0 / -mv.z; vA = smoothstep(-40.0, -30.0, p.z) * smoothstep(0.0, -3.0, p.z) * (0.45 + 0.55 * sin(t * (1.0 + seed * 3.0) + seed * 30.0) * 0.5 + 0.275); vS = seed; }',
        fragmentShader: 'precision highp float; uniform vec3 c1; uniform float soft; varying float vA; varying float vS; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = soft > 0.5 ? smoothstep(1.0, 0.72, d) * 0.7 : pow(max(0.0, 1.0 - d), 2.2); vec3 c = mix(c1, vec3(1.0), soft > 0.5 ? 0.15 + 0.3 * vS : 0.55 * (1.0 - d)); gl_FragColor = vec4(c * a * vA, a * vA); }' });
      const scene = new T.Scene(); scene.add(new T.Points(g, m)); return { scene, camera: cam(50, 6), m }; };
    reg('gl_dust', { name: 'Depth particles', desc: 'Fine points of light drifting toward the camera, with real depth.', fields: [['color', 'Colour', 'col', 'white'], SPD, AMT, BL] }, T => { const p = points(T, 1100, 0.7, 0); return { scene: p.scene, camera: p.camera, update(t, o) { p.m.uniforms.t.value = t; p.m.uniforms.c1.value.copy(col(o.c1)); } }; });
    reg('gl_bokeh', { name: 'Bokeh lights', desc: 'Big soft out-of-focus lights floating up, like city lights behind a subject.', fields: [['color', 'Colour', 'col', 'accent'], SPD, AMT, BL], defs: {} }, T => { const p = points(T, 130, 2.8, 1); p.m.uniforms.rise.value = 0.6; return { scene: p.scene, camera: p.camera, update(t, o) { p.m.uniforms.t.value = t * 0.5; p.m.uniforms.c1.value.copy(col(o.c1)); } }; });

    reg('gl_grid', { name: 'Neon grid', desc: 'A glowing grid floor rushing toward you under a lit horizon.', fields: [['color', 'Colour', 'col', 'accent'], ['col2', 'Sky colour', 'col', 'ink'], SPD, AMT, BL] },
      T => { const q = quad(T, 'uniform vec3 c1; uniform vec3 c2; void main(){ vec2 uv = vUv; float hz = 0.46; vec3 c = c2 * (0.25 + 0.75 * smoothstep(1.0, hz, uv.y)); float glow = exp(-abs(uv.y - hz) * 16.0); c += c1 * glow * 0.9;' +
          ' if (uv.y < hz) { float z = 0.22 / (hz - uv.y); float x = (uv.x - 0.5) * z * 3.4; vec2 g = vec2(x, z * 2.0 + t * 1.6); vec2 f = abs(fract(g) - 0.5); float w = 0.035 * z + 0.012; float ln = 1.0 - smoothstep(0.0, w, min(f.x, f.y)); float fog = exp(-z * 0.16); c = mix(c, c1, ln * fog); c += c1 * 0.08 * fog; }' +
          ' else { float s = step(0.9985, fract(sin(dot(floor(uv * vec2(260.0, 460.0)), vec2(12.9898, 78.233))) * 43758.5453)); c += vec3(s) * (0.4 + 0.6 * sin(t * 2.0 + uv.x * 60.0)) * smoothstep(hz, 1.0, uv.y); } gl_FragColor = vec4(c, 1.0); }', { t: { value: 0 }, c1: { value: new T.Color() }, c2: { value: new T.Color() } });
        return { scene: q.scene, camera: q.camera, update(t, o) { q.m.uniforms.t.value = t; q.m.uniforms.c1.value.copy(col(o.c1)); q.m.uniforms.c2.value.copy(col(o.c2)); } }; });

    reg('gl_shapes', { name: 'Floating shapes', desc: 'Glossy 3D shapes turning slowly in studio light. Sits over footage or a background.', fields: [['color', 'Colour', 'col', 'accent'], ['col2', 'Second colour', 'col', 'white'], SPD, AMT] },
      T => { const scene = new T.Scene(), items = [], G = [new T.IcosahedronGeometry(1, 0), new T.TorusGeometry(0.8, 0.3, 20, 60), new T.SphereGeometry(0.9, 40, 28), new T.BoxGeometry(1.3, 1.3, 1.3), new T.OctahedronGeometry(1, 0), new T.TorusKnotGeometry(0.6, 0.22, 90, 14), new T.ConeGeometry(0.8, 1.5, 4)];
        const m1 = new T.MeshStandardMaterial({ metalness: 0.35, roughness: 0.28 }), m2 = new T.MeshStandardMaterial({ metalness: 0.1, roughness: 0.45 });
        const P = [[-2.3, 5.6, -2], [2.5, 4.2, -4], [-2.7, 0.8, -5], [2.6, -1.4, -2.5], [-2.2, -4.6, -3.5], [2.2, -6.0, -5], [0.2, 6.9, -7], [-0.4, -7.2, -7]];
        P.forEach((p, i) => { const m = new T.Mesh(G[i % G.length], i % 3 === 1 ? m2 : m1); m.position.set(p[0], p[1], p[2]); m.scale.setScalar(0.75 + rnd(i, 9) * 0.6); scene.add(m); items.push(m); });
        scene.add(new T.HemisphereLight(0xffffff, 0x222233, 0.75)); const d = new T.DirectionalLight(0xffffff, 1.5); d.position.set(4, 8, 10); scene.add(d); const r = new T.PointLight(0xffffff, 0.8, 40); r.position.set(-6, -4, 6); scene.add(r);
        return { scene, camera: cam(45, 16), update(t, o) { m1.color.copy(lin(o.c1)); m2.color.copy(lin(o.c2)); r.color.copy(lin(o.c1)); items.forEach((m, i) => { m.rotation.set(t * (0.25 + rnd(i, 5) * 0.3) + i, t * (0.2 + rnd(i, 6) * 0.3) + i * 2, 0); m.position.y = P[i][1] + Math.sin(t * 0.6 + i * 1.7) * 0.35; m.position.x = P[i][0] + Math.cos(t * 0.45 + i) * 0.2; const k = E.outBack ? E.outBack(clamp((o.s.lt - i * 0.07) / 0.7)) : clamp(o.s.lt / 0.7); m.scale.setScalar((0.75 + rnd(i, 9) * 0.6) * Math.max(0.001, k)); }); } }; });

    reg('gl_tunnel', { name: 'Light tunnel', desc: 'Rings of light flying past as the camera travels down a tunnel.', fields: [['color', 'Colour', 'col', 'accent'], ['col2', 'Second colour', 'col', 'white'], SPD, AMT, BL] },
      T => { const scene = new T.Scene(), rings = [], N = 26, g = new T.TorusGeometry(3.4, 0.035, 8, 96); for (let i = 0; i < N; i++) { const m = new T.Mesh(g, new T.MeshBasicMaterial({ transparent: true, premultipliedAlpha: true, blending: T.CustomBlending, blendSrc: T.OneFactor, blendDst: T.OneFactor, depthTest: false })); scene.add(m); rings.push(m); }
        return { scene, camera: cam(80, 0), update(t, o) { const a = col(o.c1), b = col(o.c2); rings.forEach((m, i) => { const z = -(((i * 2.4 - t * 6.0) % (N * 2.4)) + N * 2.4) % (N * 2.4); m.position.set(Math.sin(z * 0.11 + t * 0.3) * 0.7, Math.cos(z * 0.09 + t * 0.2) * 0.7, z - 0.5); m.scale.set(0.8, 1.42, 1); const k = Math.min(1, (-z) / 4) * Math.max(0, 1 - (-z) / (N * 2.4)); m.material.color.copy(i % 4 === 0 ? b : a).multiplyScalar(0.25 + 1.1 * k); m.material.opacity = k; }); } }; });

    reg('gl_waves', { name: 'Wave mesh', desc: 'A field of points rolling like a slow sea, lit in your colour.', fields: [['color', 'Colour', 'col', 'accent'], SPD, AMT, BL] },
      T => { const NX_ = 90, NZ = 70, g = new T.BufferGeometry(), pos = new Float32Array(NX_ * NZ * 3); let k = 0; for (let z = 0; z < NZ; z++) for (let x = 0; x < NX_; x++) { pos[k++] = (x / (NX_ - 1) - 0.5) * 30; pos[k++] = 0; pos[k++] = -z * 0.42; } g.setAttribute('position', new T.BufferAttribute(pos, 3));
        const m = new T.ShaderMaterial({ uniforms: { t: { value: 0 }, c1: { value: new T.Color() } }, transparent: true, depthTest: false, premultipliedAlpha: true, blending: T.CustomBlending, blendSrc: T.OneFactor, blendDst: T.OneFactor,
          vertexShader: 'uniform float t; varying float vA; varying float vH; void main(){ vec3 p = position; float h = sin(p.x * 0.55 + t * 0.9) * 0.55 + sin(p.z * 0.7 + t * 0.7) * 0.45 + sin((p.x + p.z) * 0.33 - t * 0.5) * 0.5; p.y = h; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = 260.0 / -mv.z; vA = smoothstep(-30.0, -8.0, p.z); vH = h; }',
          fragmentShader: 'precision highp float; uniform vec3 c1; varying float vA; varying float vH; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), 1.6) * vA; vec3 c = mix(c1, vec3(1.0), smoothstep(0.4, 1.4, vH) * 0.7); gl_FragColor = vec4(c * a, a); }' });
        const scene = new T.Scene(), pts = new T.Points(g, m); pts.position.set(0, -2.6, 0); scene.add(pts); const c = cam(55, 5); c.position.y = 1.6; c.lookAt(0, -2.4, -9);
        return { scene, camera: c, update(t, o) { m.uniforms.t.value = t; m.uniforms.c1.value.copy(col(o.c1)); } }; });
  }
  return API;
})();
