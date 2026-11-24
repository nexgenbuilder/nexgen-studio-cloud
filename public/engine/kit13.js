'use strict';
/* Motion kit 13 (V19, Nov 11): the polish pass. Requires core, vid, kit3, kit4, kit8.
   1. Springs: physically based easings ('spring', 'springsoft', 'springy', 'anticipate') registered with K8, so every
      entrance, keyframe and preset can use them, plus six spring / whip entrances for text (K8.IN).
   2. Motion blur: K13.mb(L, t, draw, TL) renders a moving layer at several sub-frame times and averages them (a real
      shutter, not a smear). L.mblur (0..1) or TL.mblur for the whole edit; a layer at rest draws once, exactly as before.
   3. Clip time: K13.srcT(it, lt) maps timeline time to source time for a clip's speed (it.sp, 0.25..4) and ramp
      (it.ramp: 'in' | 'out' | 'hero' | 'land'); K13.maxLen(it, avail) is how long the clip can run on the timeline.
   4. Camera: K13.cam(it, lt, d) is a virtual camera on a clip or photo (it.cam = {type, amt}): push, pull, pan, tilt,
      drift, punch (on the cut) and depth (photos: the middle moves faster than the edges).
   5. Grades: K13.GRADES, K13.gradeOf(it, TL) -> {filter, wash}; K13.wash(R, g) lays the tint over the clip's rect.
   6. Glow: K13.glow(amt) blooms the bright parts of the finished frame.
   Everything is off unless an edit asks for it and everything is a pure function of time, so preview and export match and
   old projects render exactly as they did. */
const K13 = (() => {
  const TAU = Math.PI * 2;

  // ------------------------------------------------------------------ springs
  // an under-damped spring from 0 to 1 that has settled (to 0.6%) at u = 1; z = damping ratio (lower = bouncier)
  function springOf(z) {
    const wT = 5.1 / z, wd = Math.sqrt(1 - z * z);
    return u => { if (u <= 0) return 0; if (u >= 1) return 1; const x = wT * u; return 1 - Math.exp(-z * x) * (Math.cos(wd * x) + (z / wd) * Math.sin(wd * x)); };
  }
  const SPRING = springOf(0.5), SOFT = springOf(0.72), BOUNCY = springOf(0.32);
  const anticipate = u => { if (u <= 0) return 0; if (u >= 1) return 1; const s = 1.9; return u < 0.5 ? 0.5 * (2 * u) * (2 * u) * ((s + 1) * 2 * u - s) : 0.5 * ((2 * u - 2) * (2 * u - 2) * ((s + 1) * (2 * u - 2) + s) + 2); };
  if (typeof K8 !== 'undefined' && K8.addEase) {
    K8.addEase('spring', 'Spring', SPRING); K8.addEase('springsoft', 'Spring, soft', SOFT); K8.addEase('springy', 'Spring, bouncy', BOUNCY); K8.addEase('anticipate', 'Wind up & go', anticipate);
    const add = (k, o) => { if (!K8.IN[k]) K8.IN[k] = o; };
    add('springpop', { name: 'Spring pop', cat: 'Spring', by: 'word', d: 0.75, st: 0.07, ease: 'spring', fn: (e, r) => ({ sx: Math.max(0, e), sy: Math.max(0, e), a: clamp(r * 6) }) });
    add('springrise', { name: 'Spring rise', cat: 'Spring', by: 'word', d: 0.8, st: 0.06, ease: 'spring', dir: 'bottom', fn: (e, r, U, o) => ({ dx: o.v[0] * (1 - e) * o.size * 0.9 * o.amt, dy: o.v[1] * (1 - e) * o.size * 0.9 * o.amt, a: clamp(r * 5) }) });
    add('springdrop', { name: 'Spring drop', cat: 'Spring', by: 'char', d: 0.85, st: 0.028, ease: 'springy', fn: (e, r, U, o) => ({ dy: -(1 - e) * o.size * 1.1 * o.amt, rot: (1 - e) * (U.ci % 2 ? 0.25 : -0.25), a: clamp(r * 7) }) });
    add('springstretch', { name: 'Spring squash', cat: 'Spring', by: 'line', d: 0.9, st: 0.1, ease: 'springy', fn: (e, r, U, o) => ({ sx: Math.max(0.05, 1 + (1 - e) * 0.5 * o.amt), sy: Math.max(0.05, e), a: clamp(r * 6) }) });
    add('whipin', { name: 'Whip in', cat: 'Spring', by: 'line', d: 0.5, st: 0.07, ease: 'springsoft', dir: 'left', fn: (e, r, U, o) => ({ dx: o.v[0] * (1 - e) * 1150 * o.amt, dy: o.v[1] * (1 - e) * 1500 * o.amt, skew: -o.v[0] * (1 - e) * 0.3, a: clamp(r * 8) }) });
    add('swing', { name: 'Swing down', cat: 'Spring', by: 'line', d: 1.0, st: 0.12, ease: 'springy', fn: (e, r, U, o) => ({ rot: -(1 - e) * 0.5 * o.amt, dy: -(1 - e) * o.size * 0.5, a: clamp(r * 5) }) });
  }

  // ------------------------------------------------------------------ motion blur
  const active = (L, lt) => {
    if (lt < 0 || lt >= L.d) return false;
    const inEnd = L.kind === 'text' && L.style === 'type' ? K8.inEndOf(L) + 0.12 : 0.7;
    if (lt < inEnd || lt > L.d - 0.65) return true;
    if (L.anim && L.anim.loop && L.anim.loop !== 'none') return true;
    if (!K8.hasKf(L)) return false;
    const a = K8.xf(L, lt), b = K8.xf(L, Math.max(0, lt - 1 / 30));
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) > 0.6 || Math.abs(a.sx - b.sx) + Math.abs(a.sy - b.sy) > 0.002 || Math.abs(a.rot - b.rot) > 0.002;
  };
  const amtOf = (L, TL) => (L.mblur !== undefined && L.mblur !== null ? +L.mblur : +(TL && TL.mblur) || 0);
  // draw(L, t) is the layer's ordinary renderer; amt 1 = a 360° shutter (one whole frame), 0.5 = the film-standard 180°
  function mb(L, t, draw, TL) {
    const amt = clamp(amtOf(L, TL), 0, 1), lt = t - L.t0;
    if (!(amt > 0.01) || !active(L, lt)) { draw(L, t); return; }
    if (VID.collecting) { draw(L, t); draw(L, Math.max(L.t0, t - amt / 30)); return; }   // the shutter also needs the footage frame just before this one
    const N = window.NX && NX.FB && NX.FB.mode === 'play' && !(NX.app && NX.app.R && NX.app.R.lock) ? 4 : 8, sh = amt / 30;
    const acc = scratch('k13acc'); acc.g.setTransform(1, 0, 0, 1, 0, 0); acc.g.globalCompositeOperation = 'source-over'; acc.g.globalAlpha = 1; acc.g.clearRect(0, 0, W, H);
    acc.g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < N; k++) {
      const tt = Math.max(L.t0, t - sh * (k / N));
      const sc = K4.into('k13mb', () => draw(L, tt));
      acc.g.globalAlpha = 1 / N; acc.g.drawImage(sc, 0, 0);
    }
    acc.g.globalAlpha = 1; acc.g.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(acc, 0, 0); ctx.restore();
  }

  // ------------------------------------------------------------------ clip time: speed and ramps
  const sm = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  const RAMPS = {
    none: { name: 'Steady', v: () => 1 },
    in: { name: 'Fast start', desc: 'Rushes in, then settles to the set speed', v: u => 1 + 2.4 * (1 - sm(0.05, 0.5, u)) },
    out: { name: 'Fast finish', desc: 'Plays at the set speed, then rushes out', v: u => 1 + 2.4 * sm(0.5, 0.95, u) },
    hero: { name: 'Slow in the middle', desc: 'Fast, slows right down for the moment, fast again', v: u => 0.4 + 2.2 * (1 - sm(0.12, 0.34, u) * (1 - sm(0.66, 0.88, u))) },
    land: { name: 'Slow-mo landing', desc: 'Quick, then drops into slow motion', v: u => 1.7 - 1.3 * sm(0.42, 0.6, u) },
  };
  const TAB = {};
  function table(name) {   // cumulative integral of the ramp's speed curve over u = 0..1 (64 steps), and its mean
    if (TAB[name]) return TAB[name]; const R = RAMPS[name] || RAMPS.none, n = 64, c = new Float64Array(n + 1); let acc = 0;
    for (let i = 0; i < n; i++) { acc += (R.v((i + 0.25) / n) + R.v((i + 0.75) / n)) / 2 / n; c[i + 1] = acc; }
    return (TAB[name] = { c, mean: acc, n });
  }
  const spOf = it => clamp(+it.sp || 1, 0.25, 4);
  const rampOf = it => (it.ramp && RAMPS[it.ramp] ? it.ramp : 'none');
  const timed = it => Math.abs(spOf(it) - 1) > 1e-3 || rampOf(it) !== 'none';
  // seconds of source played after lt seconds on the timeline (the clip runs it.d seconds)
  function srcT(it, lt) {
    const sp = spOf(it), rp = rampOf(it); if (rp === 'none') return lt * sp;
    const d = Math.max(0.05, +it.d || 1), T = table(rp), x = clamp(lt / d) * T.n, i = Math.min(T.n - 1, Math.floor(x));
    return sp * d * (T.c[i] + (T.c[i + 1] - T.c[i]) * (x - i));
  }
  const rateAt = (it, lt) => spOf(it) * (RAMPS[rampOf(it)] || RAMPS.none).v(clamp(lt / Math.max(0.05, +it.d || 1)));
  const maxLen = (it, avail) => avail / (spOf(it) * table(rampOf(it)).mean);
  const srcLen = it => spOf(it) * table(rampOf(it)).mean * (+it.d || 0);

  // ------------------------------------------------------------------ camera
  // z: zoom (1 = the framing the clip already has); ox / oy: -1..1 across the room the zoom leaves; dz: extra zoom of the
  // middle of the picture (depth move)
  const CAMS = {
    none: { name: 'Locked off' },
    push: { name: 'Slow push in', desc: 'Creeps toward the subject' },
    pull: { name: 'Slow pull back', desc: 'Starts close and opens up' },
    left: { name: 'Pan left' }, right: { name: 'Pan right' }, up: { name: 'Tilt up' }, down: { name: 'Tilt down' },
    drift: { name: 'Handheld drift', desc: 'A gentle float, as if held' },
    punch: { name: 'Punch on the cut', desc: 'Lands zoomed in and springs back' },
    depth: { name: 'Depth push', desc: 'Photos: the middle comes forward faster than the edges' },
  };
  function cam(it, lt, d) {
    const C = it.cam; if (!C || !C.type || C.type === 'none' || !CAMS[C.type]) return null;
    const a = clamp(C.amt === undefined ? 0.5 : +C.amt, 0.05, 1), u = clamp(lt / Math.max(0.1, d)), e = E.inOutS(u), k = 0.06 + 0.2 * a;
    switch (C.type) {
      case 'push': return { z: 1 + k * (0.15 + 0.85 * u), ox: 0, oy: 0 };
      case 'pull': return { z: 1 + k * (1 - 0.85 * u), ox: 0, oy: 0 };
      case 'left': return { z: 1 + k, ox: lerp(0.9, -0.9, e), oy: 0 };
      case 'right': return { z: 1 + k, ox: lerp(-0.9, 0.9, e), oy: 0 };
      case 'up': return { z: 1 + k, ox: 0, oy: lerp(0.9, -0.9, e) };
      case 'down': return { z: 1 + k, ox: 0, oy: lerp(-0.9, 0.9, e) };
      case 'drift': return { z: 1 + 0.05 + 0.07 * a + 0.012 * a * Math.sin(lt * 0.9 + 1), ox: 0.8 * Math.sin(lt * 0.71 + 0.4) * Math.cos(lt * 0.23), oy: 0.8 * Math.sin(lt * 0.53 + 2.1) };
      case 'punch': return { z: 1 + 0.02 + (0.1 + 0.22 * a) * (1 - SOFT(clamp(lt / 0.55))) + 0.02 * a * u, ox: 0, oy: 0 };
      case 'depth': return { z: 1 + k * 0.5 * (0.1 + 0.9 * u), ox: 0, oy: 0, dz: (0.03 + 0.07 * a) * u };
    }
    return null;
  }
  // footageSrc options for a camera state, on top of the options the clip already has
  function camOpts(o, c) {
    if (!c) return o; const z0 = o.z || 1, z = z0 * c.z, room = (1 - 1 / c.z) / 2;
    o.z = z; o.cx = clamp((o.cx === undefined ? 0.5 : o.cx) + c.ox * room, 0, 1); o.cy = clamp((o.cy === undefined ? 0.5 : o.cy) + c.oy * room, 0, 1); return o;
  }

  // ------------------------------------------------------------------ grades
  // f(a): canvas filter at strength a (0..1); sh: a dark colour screened in (tints the shadows); hi: a light colour
  // multiplied in (tints the highlights); sl: a colour laid over in soft light (an overall cast)
  const GRADES = {
    none: { name: 'None' },
    punch: { name: 'Punchy', desc: 'More contrast and colour', f: a => `contrast(${1 + 0.16 * a}) saturate(${1 + 0.26 * a})` },
    warm: { name: 'Golden hour', desc: 'Warm, sunny, inviting', f: a => `saturate(${1 + 0.14 * a}) contrast(${1 + 0.06 * a}) sepia(${0.14 * a})`, sl: ['#FFB36B', 0.2], hi: ['#FFF1DC', 0.5] },
    cool: { name: 'Clean & cool', desc: 'Crisp, modern, a little blue', f: a => `saturate(${1 - 0.04 * a}) contrast(${1 + 0.08 * a}) brightness(${1 + 0.03 * a})`, sl: ['#8CC2FF', 0.16], sh: ['#061426', 0.35] },
    teal: { name: 'Teal & orange', desc: 'The blockbuster look', f: a => `contrast(${1 + 0.12 * a}) saturate(${1 + 0.16 * a})`, sh: ['#042A30', 0.6], hi: ['#FFE4C4', 0.6] },
    film: { name: 'Film', desc: 'Soft contrast, lifted blacks', f: a => `contrast(${1 + 0.08 * a}) saturate(${1 - 0.14 * a}) sepia(${0.08 * a})`, sh: ['#1A1F2B', 0.55], hi: ['#FFF3E0', 0.45] },
    moody: { name: 'Moody', desc: 'Darker, deeper, quieter colour', f: a => `brightness(${1 - 0.08 * a}) contrast(${1 + 0.2 * a}) saturate(${1 - 0.2 * a})`, sh: ['#0B1220', 0.5] },
    fresh: { name: 'Fresh', desc: 'Bright and appetising (food, produce)', f: a => `saturate(${1 + 0.3 * a}) contrast(${1 + 0.07 * a}) brightness(${1 + 0.05 * a})`, hi: ['#FFF6EA', 0.4] },
    night: { name: 'Neon night', desc: 'Rich colour, violet shadows', f: a => `contrast(${1 + 0.16 * a}) saturate(${1 + 0.32 * a})`, sh: ['#1C0A33', 0.6] },
    mono: { name: 'Black & white', desc: 'Classic, high contrast', f: a => `grayscale(${a}) contrast(${1 + 0.18 * a})` },
  };
  function gradeOf(it, TL) {
    const g = it && it.grade && it.grade.id ? it.grade : TL && TL.grade && TL.grade.id ? TL.grade : null;
    if (!g || g.id === 'none' || !GRADES[g.id]) return null;
    const G0 = GRADES[g.id], a = clamp(g.amt === undefined ? 0.7 : +g.amt, 0, 1); if (a <= 0.01) return null;
    return { id: g.id, a, filter: G0.f ? G0.f(a) : '', G: G0 };
  }
  function wash(R, g) {
    if (!g || VID.collecting) return; const G0 = g.G; if (!G0.sh && !G0.hi && !G0.sl) return;
    const c = ctx; c.save(); c.setTransform(1, 0, 0, 1, SH.x, SH.y); c.beginPath(); c.rect(R[0], R[1], R[2], R[3]); c.clip();
    const lay = (mode, col, al) => { c.globalCompositeOperation = mode; c.globalAlpha = al * g.a; c.fillStyle = col; c.fillRect(R[0], R[1], R[2], R[3]); };
    if (G0.sh) lay('screen', G0.sh[0], G0.sh[1]); if (G0.hi) lay('multiply', G0.hi[0], G0.hi[1]); if (G0.sl) lay('soft-light', G0.sl[0], G0.sl[1]);
    c.restore();
  }

  // ------------------------------------------------------------------ glow
  // a soft bloom: the frame, blurred small and screened back over itself
  function glow(amt) {
    amt = clamp(+amt || 0, 0, 1); if (amt <= 0.01 || VID.collecting) return;
    const a = scratch('k13gA', 270, 480), b = scratch('k13gB', 68, 120), src = ctx.canvas;
    a.g.globalCompositeOperation = 'copy'; a.g.filter = 'none'; a.g.drawImage(src, 0, 0, 270, 480);
    b.g.globalCompositeOperation = 'copy'; b.g.drawImage(a, 0, 0, 68, 120);
    a.g.drawImage(b, 0, 0, 270, 480);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingQuality = 'high'; ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.55 * amt; ctx.drawImage(a, 0, 0, W, H); ctx.restore();
  }

  // ------------------------------------------------------------------ music beds: tempo and first downbeat (measured from the files)
  const BEATS = { lounge: [96, 0], night: [100, 0], pulse: [120, 0], sketch: [100, 0], cinematic: [96, 0], day: [100, 0] };   // each bed is a whole number of bars and loops cleanly

  return { SPRING, SOFT, BOUNCY, anticipate, springOf, mb, active, RAMPS, srcT, rateAt, maxLen, srcLen, timed, spOf, rampOf, CAMS, cam, camOpts, GRADES, gradeOf, wash, glow, BEATS, sm };
})();
