// NexGen Studio V23, phase 2: one-tap motion. A Motion tab that works on whatever is selected (text, a graphic or
// overlay, a clip) and on the whole video. A preset sets the entrance, its length and easing, and the exit in one
// tap and plays the result; Speed is the one simple control; Fine tune opens the detailed controls that were already
// there. Presets only write the fields the engine already reads (L.anim, L.kf, m.tr, m.cam, tl.grade, tl.mblur), so
// projects stay compatible and every element stays editable.
(() => {
  'use strict';
  const NX = window.NX, A = NX.app, X = NX.editor, ED = X.ED, XT = X.XT, api = X.api, S = A.S, el = A.el;
  const r3 = v => Math.round(v * 1000) / 1000, clone = o => JSON.parse(JSON.stringify(o));
  const P = { speed: 'normal', opts: { text: true, trans: true, cam: true, look: true } };
  const SPEEDS = { slow: ['Slow', 1.4], normal: ['Normal', 1], fast: ['Fast', 0.68] };
  const ease = (...ids) => ids.find(i => K8.EASES.some(e => e[0] === i)) || 'out';

  document.head.appendChild(el('style', '', `
.mp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 8px; margin: 0 0 6px; }
.mp-card { text-align: left; border: 1px solid var(--line); background: var(--surface); color: var(--fg); border-radius: 12px; padding: 10px 11px; min-height: 60px; font: inherit; cursor: pointer; display: flex; flex-direction: column; gap: 3px; }
.mp-card b { font: 700 13px/1.2 var(--f-ui); } .mp-card span { font: 500 11.5px/1.3 var(--f-ui); color: var(--dim); }
.mp-card.on { border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); background: var(--accent-soft); }
.mp-card.big { min-height: 84px; } .mp-card .x { align-self: flex-end; margin-top: -4px; font: 600 11px/1 var(--f-ui); color: var(--dim); text-decoration: underline; }
.mp-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 10px 0 4px; } .mp-row .lab { font: 600 12px/1 var(--f-ui); color: var(--dim); margin-right: 2px; }
.mp-row button { border: 1px solid var(--line); background: var(--surface); color: var(--fg); border-radius: 999px; padding: 0 14px; min-height: 36px; font: 600 12.5px/1 var(--f-ui); cursor: pointer; }
.mp-row button[aria-pressed=true] { background: var(--accent); border-color: var(--accent); color: #fff; }
.mp-note { font: 500 12.5px/1.45 var(--f-ui); color: var(--dim); margin: 4px 0 10px; }
.mp-ft { margin: 8px 0 4px; } .mp-ft summary { font: 600 12.5px/1 var(--f-ui); color: var(--dim); cursor: pointer; padding: 10px 0; }
.mp-ft label { display: flex; align-items: center; gap: 10px; min-height: 40px; font: 500 13px/1.3 var(--f-ui); }
.mp-ft input { width: 20px; height: 20px; accent-color: var(--accent); }
`));

  // ------------------------------------------------------------------ text: entrance + exit in one preset (K8 type engine)
  const TEXT = [
    ['cine', 'Cinematic reveal', 'Out of focus, then sharp', { in: 'blur', inD: 0.9, by: 'word', stagger: 0.09, out: 'blur', outD: 0.5 }],
    ['pop', 'Punchy pop', 'Each word springs in', { in: 'springpop', inD: 0.5, by: 'word', stagger: 0.07, out: 'shrink', outD: 0.25 }],
    ['rise', 'Clean rise', 'Lines slide up into place', { in: 'rise', inD: 0.6, by: 'line', stagger: 0.12, out: 'fade', outD: 0.35 }],
    ['words', 'Word by word', 'Reads at speaking pace', { in: 'wordup', inD: 0.4, by: 'word', stagger: 0.14, out: 'fade', outD: 0.3 }],
    ['kinetic', 'Kinetic', 'One big word at a time', { in: 'kinetic', inD: 0.42, out: 'fade', outD: 0.3 }],
    ['lux', 'Luxury tracking', 'Letters drift together', { in: 'tracking', inD: 1.1, by: 'all', out: 'tracking', outD: 0.6 }],
    ['mask', 'Mask reveal', 'Wipes on, wipes off', { in: 'wipe', inD: 0.6, by: 'line', stagger: 0.1, out: 'wipe', outD: 0.4 }],
    ['type', 'Typewriter', 'Typed, then deleted', { in: 'typewriter', inD: 0.9, out: 'backspace', outD: 0.5 }],
    ['drop', 'Drop & bounce', 'Falls in and settles', { in: 'springdrop', inD: 0.6, by: 'word', stagger: 0.06, out: 'drop', outD: 0.35 }],
    ['whip', 'Whip in', 'Fast, with a streak', { in: 'whipin', inD: 0.45, by: 'line', stagger: 0.08, out: 'slide', outD: 0.3 }],
    ['cascade', 'Letter cascade', 'Letters tumble into place', { in: 'cascade', inD: 0.5, by: 'letter', stagger: 0.03, out: 'apart', outD: 0.45 }],
    ['flip', '3D flip', 'Turns over to face you', { in: 'flip', inD: 0.6, by: 'word', stagger: 0.08, out: 'flip', outD: 0.35 }],
    ['glitch', 'Glitch hit', 'Digital snap on and off', { in: 'glitch', inD: 0.45, by: 'all', out: 'glitch', outD: 0.3 }],
    ['outline', 'Outline to fill', 'Drawn, then filled in', { in: 'outline', inD: 0.8, by: 'all', out: 'fade', outD: 0.35 }],
    ['soft', 'Soft fade', 'Quiet and neutral', { in: 'fade', inD: 0.6, by: 'all', out: 'fade', outD: 0.5 }],
    ['slam', 'Slam', 'Each word hits hard', { in: 'slam', inD: 0.42, stagger: 0.1, out: 'shrink', outD: 0.25 }],
    ['twist', 'Twist in', 'Words twist into place', { in: 'twist', inD: 0.6, stagger: 0.08, out: 'fade', outD: 0.3 }],
    ['skew', 'Speed slide', 'Leans in fast', { in: 'skewin', inD: 0.55, stagger: 0.1, out: 'slide', outD: 0.3 }],
    ['rain', 'Letter rain', 'Letters fall and bounce', { in: 'rain', inD: 0.7, stagger: 0.035, out: 'drop', outD: 0.35 }],
    ['scatter', 'Scatter', 'Letters fly together', { in: 'scatter', inD: 0.8, stagger: 0.02, out: 'apart', outD: 0.45 }],
    ['zoomblur', 'Zoom blur', 'Rushes at the camera', { in: 'zoomblur', inD: 0.5, stagger: 0.12, out: 'blur', outD: 0.35 }],
    ['roll', 'Roll in', 'Letters roll along the line', { in: 'roll', inD: 0.6, stagger: 0.03, out: 'fade', outD: 0.3 }],
    ['stomp', 'Stomp', 'Words stomp down', { in: 'stomp', inD: 0.5, stagger: 0.11, out: 'shrink', outD: 0.25 }],
    ['hinge', 'Hinge swing', 'Swings down like a sign', { in: 'hinge', inD: 0.9, stagger: 0.12, out: 'drop', outD: 0.4 }],
    ['shake', 'Shake hit', 'Lands and rattles', { in: 'shake', inD: 0.6, out: 'fade', outD: 0.25 }],
    ['unfold', 'Unfold', 'Words open sideways', { in: 'unfold', inD: 0.5, stagger: 0.09, out: 'fade', outD: 0.3 }],
    ['rgb', 'Colour split', 'A colour-fringe hit', { in: 'rgbhit', inD: 0.5, out: 'glitch', outD: 0.3 }],
    ['bounce', 'Bounce letters', 'Letters drop and bounce', { in: 'bounce', inD: 0.85, stagger: 0.04, out: 'fade', outD: 0.3 }],
    ['elastic', 'Elastic', 'Stretches and snaps back', { in: 'elastic', inD: 1.0, stagger: 0.1, out: 'shrink', outD: 0.25 }],
    ['wave', 'Wave', 'Rolls in like a wave', { in: 'wave', out: 'fade', outD: 0.3 }],
    ['liquid', 'Liquid rise', 'Fills up from below', { in: 'liquid', out: 'fade', outD: 0.4 }],
    ['halves', 'Split halves', 'Two halves meet', { in: 'halves', out: 'fade', outD: 0.3 }],
    ['spinw', 'Spin words', 'Words spin to a stop', { in: 'spin', out: 'shrink', outD: 0.25 }],
    ['stretch', 'Spring stretch', 'Springs out wide', { in: 'springstretch', out: 'fade', outD: 0.3 }],
    ['swingd', 'Swing down', 'Hangs and settles', { in: 'swing', out: 'drop', outD: 0.35 }],
    ['none', 'No motion', 'Appears and disappears', { in: 'none', out: 'none' }],
  ];
  function textAnim(def, k) {
    const a = Object.assign({}, def); if (!K8.IN[a.in]) a.in = 'fade'; if (!K8.OUT[a.out]) a.out = 'fade';
    for (const p of ['inD', 'outD', 'stagger']) if (a[p]) a[p] = r3(a[p] * k);
    return a;
  }

  // ------------------------------------------------------------------ graphics, stickers, overlays, presenter: keyframes on the shared layer transform
  const base = (L, p) => K8.KF_PROPS[p](L);
  const MP = ['x', 'y', 'sx', 'sy', 'rot', 'op', 'blur'];
  const LAYER = [
    ['soft', 'Soft fade', 'Fades in and out', { in: ['op'], out: ['op'] }],
    ['pop', 'Pop', 'Springs up to size', { in: ['op', 'scale'], out: ['op', 'shrink'], e: ['spring', 'back'] }],
    ['rise', 'Rise', 'Slides up into place', { in: ['op', 'up'], out: ['op'] }],
    ['drop', 'Drop', 'Falls in and bounces', { in: ['op', 'down'], out: ['op'], e: ['bounce'] }],
    ['left', 'From the left', 'Slides in, exits right', { in: ['op', 'fromL'], out: ['op', 'toR'] }],
    ['right', 'From the right', 'Slides in, exits left', { in: ['op', 'fromR'], out: ['op', 'toL'] }],
    ['spin', 'Spin in', 'Turns and grows', { in: ['op', 'scale', 'spin'], out: ['op', 'shrink'], e: ['back'] }],
    ['focus', 'Focus pull', 'Soft, then sharp', { in: ['op', 'blur', 'settle'], out: ['op'] }],
    ['slam', 'Slam', 'Lands big, then settles', { in: ['op', 'big'], out: ['op'], e: ['sharp'] }],
    ['flip', 'Flip open', 'Opens like a card', { in: ['op', 'flipx'], out: ['op', 'shrink'], e: ['back'] }],
    ['swing', 'Swing in', 'Swings up into place', { in: ['op', 'swing', 'up'], out: ['op'], e: ['spring', 'back'] }],
    ['below', 'From below', 'Rises from off screen', { in: ['op', 'upBig'], out: ['op'] }],
    ['above', 'From above', 'Drops from off screen', { in: ['op', 'downBig'], out: ['op'] }],
    ['wobble', 'Wobble pop', 'Pops in with a wobble', { in: ['op', 'scale', 'wob'], out: ['op', 'shrink'], e: ['bounce'] }],
    ['none', 'No motion', 'Remove the preset', {}],
  ];
  function layerKf(L, def, k) {
    const d = Math.max(0.4, +L.d || 2), i = Math.min(d * 0.45, 0.5 * k), o = Math.min(d * 0.3, 0.32 * k), kf = {}, eIn = ease(...(def.e || []), 'sharp', 'out'), eOut = ease('in');
    const add = (p, keys) => { kf[p] = (kf[p] || []).concat(keys.map(q => ({ t: r3(q[0]), v: r3(q[1]), e: q[2] }))); };
    const into = (p, from, e) => add(p, [[0, from, e || eIn], [i, base(L, p)]]), away = (p, to) => add(p, [[d - o, base(L, p), eOut], [d, to]]);
    for (const m of def.in || []) {
      if (m === 'op') into('op', 0, ease('out')); else if (m === 'scale') { into('sx', base(L, 'sx') * 0.55); into('sy', base(L, 'sy') * 0.55); }
      else if (m === 'settle') { into('sx', base(L, 'sx') * 1.18, ease('out')); into('sy', base(L, 'sy') * 1.18, ease('out')); }
      else if (m === 'up') into('y', base(L, 'y') + 110); else if (m === 'down') into('y', base(L, 'y') - 220);
      else if (m === 'fromL') into('x', base(L, 'x') - 320); else if (m === 'fromR') into('x', base(L, 'x') + 320);
      else if (m === 'spin') into('rot', base(L, 'rot') - 120); else if (m === 'big') { into('sx', base(L, 'sx') * 2.2); into('sy', base(L, 'sy') * 2.2); }
      else if (m === 'flipx') into('sx', base(L, 'sx') * 0.02); else if (m === 'swing') into('rot', base(L, 'rot') - 35); else if (m === 'wob') into('rot', base(L, 'rot') + 18);
      else if (m === 'upBig') into('y', base(L, 'y') + 760); else if (m === 'downBig') into('y', base(L, 'y') - 760); else if (m === 'blur') into('blur', 22, ease('out'));
    }
    for (const m of def.out || []) {
      if (m === 'op') away('op', 0); else if (m === 'shrink') { away('sx', base(L, 'sx') * 0.6); away('sy', base(L, 'sy') * 0.6); }
      else if (m === 'toR') away('x', base(L, 'x') + 320); else if (m === 'toL') away('x', base(L, 'x') - 320);
    }
    return kf;
  }

  // ------------------------------------------------------------------ clips: how this one arrives
  const CLIP = [['cut', 'Clean cut'], ['dissolve', 'Smooth dissolve'], ['whip', 'Whip pan'], ['zoompunch', 'Zoom punch'], ['push', 'Push'], ['slide', 'Slide over'], ['leak', 'Light leak'], ['flash', 'Flash'],
    ['cube3d', '3D cube turn'], ['flip3d', '3D card flip'], ['doors3d', '3D doors'], ['through3d', '3D fly through'], ['turn3d', '3D turntable'], ['fall3d', '3D fall away'],
    ['fade', 'Dip to black'], ['circle', 'Circle reveal'], ['wipe', 'Accent wipe'], ['glitch', 'Glitch'], ['focus', 'Soft focus'], ['softwipe', 'Soft wipe']];
  const trOf = (id, k) => { const T = KT.get(id); return !T || id === 'cut' ? null : { type: T.id, d: r3(Math.max(0.2, T.d * k)) }; };
  const isStill = c => !!(NX.META[c] && NX.META[c].still);

  // ------------------------------------------------------------------ whole-video styles: text, cuts, photo movement and colour that belong together
  const STYLES = [
    ['cinematic', 'Cinematic', 'Slow dissolves, focus-pull titles, film colour', { text: 'cine', tr: ['dissolve', 'leak', 'filmdis', 'fade'], cam: ['push', 'pull'], amt: 0.45, grade: 'film', mblur: 0.5, k: 1.15 }],
    ['social', 'Punchy social', 'Whips and zoom hits, words that pop', { text: 'pop', tr: ['whip', 'zoompunch', 'snapzoom', 'push'], cam: ['punch', 'push'], amt: 0.6, grade: 'punch', mblur: 0.5, k: 0.85 }],
    ['editorial', 'Clean editorial', 'Tidy cuts and slides, lines that rise', { text: 'rise', tr: ['cut', 'slide', 'dissolve'], cam: ['push', 'left', 'right'], amt: 0.3, grade: 'cool', mblur: 0.3, k: 1 }],
    ['luxury', 'Luxury', 'Unhurried, wide letter-spacing, warm light', { text: 'lux', tr: ['softwipe', 'filmdis', 'focus'], cam: ['pull', 'drift'], amt: 0.35, grade: 'warm', mblur: 0.3, k: 1.35 }],
    ['promo', 'Bold promo', 'Colour wipes and titles that drop in', { text: 'drop', tr: ['wipe', 'stripes', 'split', 'push'], cam: ['push', 'punch'], amt: 0.5, grade: 'punch', mblur: 0.5, k: 0.9 }],
    ['neon', 'Night & neon', 'Glitch cuts and digital titles', { text: 'glitch', tr: ['glitch', 'rgb', 'digital', 'flash'], cam: ['drift', 'push'], amt: 0.4, grade: 'night', mblur: 0.5, k: 0.9 }],
    ['friendly', 'Friendly local', 'Circles, flips and word-by-word titles', { text: 'words', tr: ['circle', 'paver', 'slide', 'dissolve'], cam: ['push', 'up'], amt: 0.4, grade: 'fresh', mblur: 0.3, k: 1 }],
    ['dealer', 'Dealer bold', 'Slamming titles, 3D cube turns, punchy colour', { text: 'slam', tr: ['cube3d', 'zoompunch', 'turn3d', 'whip'], cam: ['punch', 'push'], amt: 0.5, grade: 'punch', mblur: 0.5, k: 0.9 }],
    ['depth', '3D showcase', 'Flips, doors and fly-throughs between shots', { text: 'flip', tr: ['flip3d', 'doors3d', 'through3d', 'fall3d'], cam: ['depth', 'push'], amt: 0.45, grade: 'teal', mblur: 0.3, k: 1 }],
    ['hype', 'Hype', 'Shake hits, flashes and glitches', { text: 'shake', tr: ['flash', 'glitch', 'zoompunch', 'whip'], cam: ['punch'], amt: 0.6, grade: 'punch', mblur: 0.5, k: 0.75 }],
    ['elegant', 'Soft & elegant', 'Liquid titles and slow film dissolves', { text: 'liquid', tr: ['softwipe', 'filmdis', 'dissolve'], cam: ['pull', 'push'], amt: 0.3, grade: 'film', mblur: 0, k: 1.3 }],
    ['playful', 'Playful', 'Letter rain, circles and turntables', { text: 'rain', tr: ['circle', 'turn3d', 'slide', 'dissolve'], cam: ['up', 'push'], amt: 0.4, grade: 'fresh', mblur: 0.3, k: 1 }],
    ['street', 'Street', 'Skewed speed titles, whips and RGB splits', { text: 'skew', tr: ['whip', 'rgb', 'snapzoom', 'push'], cam: ['drift', 'punch'], amt: 0.5, grade: 'moody', mblur: 0.5, k: 0.85 }],
    ['calm', 'Calm & trustworthy', 'Soft fades, nothing flashy', { text: 'soft', tr: ['dissolve'], cam: ['push'], amt: 0.25, grade: 'none', mblur: 0, k: 1.2 }],
  ];

  const mine = { get() { try { return JSON.parse(localStorage.getItem('nx.mymotion') || '[]'); } catch (e) { return []; } }, set(v) { try { localStorage.setItem('nx.mymotion', JSON.stringify(v.slice(0, 24))); } catch (e) { } } };

  // ------------------------------------------------------------------ apply
  let pvT = 0;
  function preview(t0, len) {   // play just the part that changed
    clearInterval(pvT); const end = Math.min(S.dur - 0.05, t0 + len); A.pause(); A.setT(Math.max(0, t0)); setTimeout(() => { Promise.resolve(A.play()).catch(() => { }); pvT = setInterval(() => { if (!S.playing) { clearInterval(pvT); return; } if (S.t >= end) { clearInterval(pvT); A.pause(); } }, 60); }, 60);
  }
  const kOf = () => SPEEDS[P.speed][1];
  function applyText(id, presetId, custom) {
    const def = custom || (TEXT.find(p => p[0] === presetId) || [])[3]; if (!def) return false; let t0 = 0, len = 2;
    api.change(t => { const L = t.layers.find(x => x.id === id); if (!L) return; const keep = L.anim && L.anim.loop && L.anim.loop !== 'none' ? { loop: L.anim.loop, loopAmt: L.anim.loopAmt, loopSp: L.anim.loopSp } : {};
      L.anim = Object.assign(textAnim(def, custom ? 1 : kOf()), keep); L.mp = presetId; t0 = L.t0; len = Math.min(L.d, 2.6); });
    after(); preview(t0 - 0.1, len + 0.2); return true;
  }
  function applyLayer(id, presetId) {
    const def = (LAYER.find(p => p[0] === presetId) || [])[3]; if (!def) return false; let t0 = 0, len = 2;
    api.change(t => { const L = t.layers.find(x => x.id === id); if (!L) return; const kf = Object.assign({}, L.kf || {}); for (const p of MP) delete kf[p];
      Object.assign(kf, layerKf(L, def, kOf())); if (Object.keys(kf).length) L.kf = kf; else delete L.kf; L.mp = presetId; t0 = L.t0; len = Math.min(L.d, 2.4); });
    after(); preview(t0 - 0.1, len + 0.2); return true;
  }
  function applyClip(id, trId) {
    const t = api.TL(), i = t.main.findIndex(m => m.id === id); if (i < 0) return false; if (i === 0) { A.toast('The first clip opens the video, so there is nothing to cut from. Pick a later clip.'); return false; }
    api.change(tl => { const m = tl.main[i], prev = m.tr || {}; m.tr = trOf(trId, kOf()); if (m.tr && prev.sfx === 'none') m.tr.sfx = 'none'; });
    after(); const b = api.F().M.find(m => m.id === id); if (b) preview(b.start - 1, 2.2); return true;
  }
  function applyCam(id, type) { api.change(tl => { const m = tl.main.find(x => x.id === id); if (!m) return; if (type === 'none') delete m.cam; else m.cam = { type, amt: (m.cam && m.cam.amt) || 0.45 }; }); after(); const b = api.F().M.find(m => m.id === id); if (b) preview(b.start, Math.min(b.d, 3)); }
  function applyStyle(styleId, opts) {
    const st = STYLES.find(s => s[0] === styleId); if (!st) return null; const D = st[3], o = Object.assign({}, P.opts, opts || {}), k = D.k * kOf(), n = { text: 0, cuts: 0, cams: 0 };
    const tdef = (TEXT.find(p => p[0] === D.text) || [])[3];
    api.change(t => {
      if (o.text && tdef) for (const L of t.layers) if (L.kind === 'text' && L.style === 'type') { const keep = L.anim && L.anim.loop && L.anim.loop !== 'none' ? { loop: L.anim.loop, loopAmt: L.anim.loopAmt, loopSp: L.anim.loopSp } : {}; L.anim = Object.assign(textAnim(tdef, k), keep); L.mp = D.text; n.text++; }
      if (o.trans) { const pool = D.tr.filter(id => id === 'cut' || KT.get(id)); t.main.forEach((m, i) => { if (i === 0 || m.type === 'tpl') return; const prev = m.tr || {}; m.tr = trOf(pool[(i - 1) % pool.length], k); if (m.tr && prev.sfx === 'none') m.tr.sfx = 'none'; n.cuts++; }); }
      if (o.cam) { let j = 0; for (const m of t.main) if (m.type === 'clip' && isStill(m.c)) { m.cam = { type: D.cam[j++ % D.cam.length], amt: D.amt }; n.cams++; } }   // photos only: video plays as shot
      if (o.look) { if (D.grade === 'none' || !K13.GRADES[D.grade]) delete t.grade; else t.grade = { id: D.grade, amt: 0.7 }; if (D.mblur) t.mblur = D.mblur; else delete t.mblur; }
      t.mstyle = styleId;
    });
    after(); preview(0, Math.min(S.dur, 8));
    A.toast(st[1] + ' applied: ' + [n.text ? n.text + ' text layer' + (n.text > 1 ? 's' : '') : '', n.cuts ? n.cuts + ' cut' + (n.cuts > 1 ? 's' : '') : '', n.cams ? n.cams + ' photo move' + (n.cams > 1 ? 's' : '') : ''].filter(Boolean).join(', ') + '. Undo puts it all back.');
    return n;
  }
  function after() { A.refresh(true); api.renderTimeline(); api.scheduleMix(); if (ED.panel === 'motion') api.renderPanel(); }

  // ------------------------------------------------------------------ the Motion tab
  function fineTune() {
    const o = ED.sel && api.findAny(ED.sel); if (!o) return; if (api.kindOf(o) === 'layer') ED.itab = 'animate'; api.renderInspector();
    if (NX.touch && NX.touch.T.on) NX.touch.sheet('insp', 'Fine tune'); else { const i = document.querySelector('#insp'); if (i) i.scrollTop = 0; }
  }
  function cards(box, list, cur, fn, big) { const g = el('div', 'mp-grid'); for (const [id, name, desc] of list) { const b = el('button', 'mp-card' + (big ? ' big' : '') + (cur === id ? ' on' : '')); b.type = 'button'; b.setAttribute('aria-pressed', String(cur === id)); b.appendChild(el('b', '', name)); if (desc) b.appendChild(el('span', '', desc)); b.onclick = () => fn(id); g.appendChild(b); } box.appendChild(g); return g; }
  function speedRow(box, redo) { const r = el('div', 'mp-row'); r.appendChild(el('span', 'lab', 'Speed')); for (const k of Object.keys(SPEEDS)) { const b = el('button', '', SPEEDS[k][0]); b.type = 'button'; b.setAttribute('aria-pressed', String(P.speed === k)); b.onclick = () => { P.speed = k; if (redo) redo(); else api.renderPanel(); }; r.appendChild(b); }
    const f = el('button', '', 'Fine tune…'); f.type = 'button'; f.onclick = fineTune; if (ED.sel) r.appendChild(f); box.appendChild(r); }
  XT.tabs.push(['motion', 'Motion', 'text']);
  XT.panels.motion = (box) => {
    const sec = t => box.appendChild(el('div', 'ep-sec', t)), t = api.TL(), id = ED.sel, o = id && api.findAny(id), kind = o && api.kindOf(o);
    const L = kind === 'layer' ? t.layers.find(x => x.id === id) : null, M = kind === 'main' ? t.main.find(x => x.id === id) : null;
    if (L && L.kind === 'text' && L.style === 'type') {
      sec('Motion for this text'); cards(box, TEXT, L.mp, pid => applyText(id, pid)); speedRow(box, () => { if (L.mp && TEXT.some(p => p[0] === L.mp)) applyText(id, L.mp); else api.renderPanel(); });
      const my = mine.get(); sec('My presets');
      if (my.length) { const g = el('div', 'mp-grid'); my.forEach((m, i) => { const b = el('button', 'mp-card'); b.type = 'button'; b.appendChild(el('b', '', m.name)); const x = el('span', 'x', 'Remove'); x.onclick = e => { e.stopPropagation(); const v = mine.get(); v.splice(i, 1); mine.set(v); api.renderPanel(); }; b.appendChild(x); b.onclick = () => applyText(id, 'my' + i, m.anim); g.appendChild(b); }); box.appendChild(g); }
      const r = el('div', 'mp-row'), nm = el('input'); nm.type = 'text'; nm.placeholder = 'Name it, e.g. Dave’s headline'; nm.maxLength = 28; nm.style.cssText = 'flex:1 1 150px;min-height:40px;border:1px solid var(--line);border-radius:10px;padding:0 12px;background:var(--surface);color:var(--fg);font:500 13px var(--f-ui)';
      const sv = el('button', '', 'Save this motion'); sv.type = 'button'; sv.onclick = () => { const v = mine.get(); v.unshift({ name: nm.value.trim() || 'My motion ' + (v.length + 1), anim: clone(L.anim || {}) }); mine.set(v); A.toast('Saved. It is in My presets for any text, in any project on this device.'); api.renderPanel(); }; r.append(nm, sv); box.appendChild(r);
    } else if (L && L.kind === 'text') { sec('Motion for this text'); box.appendChild(el('p', 'mp-note', 'This is a classic text style with its own built-in animation. Pick a style from the Text tab’s typography gallery to use motion presets, or change its animation under Fine tune.')); speedRow(box); }
    else if (L && L.kind !== 'seg') { sec('Motion for this ' + (L.kind === 'pip' ? 'picture' : L.kind === 'mg' ? 'graphic' : 'layer')); cards(box, LAYER, L.mp, pid => applyLayer(id, pid)); speedRow(box, () => { if (L.mp) applyLayer(id, L.mp); else api.renderPanel(); }); }
    else if (M && M.type !== 'tpl') {
      sec('How this clip arrives'); const cur = M.tr ? M.tr.type : 'cut'; cards(box, CLIP.filter(c => c[0] === 'cut' || KT.get(c[0])), cur, tid => applyClip(id, tid)); speedRow(box, () => { if (M.tr) applyClip(id, M.tr.type); else api.renderPanel(); });
      if (M.type === 'clip' && isStill(M.c)) { sec('Bring the photo to life'); cards(box, [['none', 'Still'], ['push', 'Slow push in'], ['pull', 'Slow pull back'], ['left', 'Pan left'], ['right', 'Pan right'], ['drift', 'Handheld drift'], ['depth', 'Depth push']].filter(c => K13.CAMS[c[0]]), (M.cam && M.cam.type) || 'none', c => applyCam(id, c)); }
      else if (M.type === 'clip') box.appendChild(el('p', 'mp-note', 'Video clips play as shot. Camera moves for video are under Fine tune if you want them.'));
    } else box.appendChild(el('p', 'mp-note', 'Tap a text, a graphic or a clip to give it motion with one tap. Or style the whole video below.'));

    sec('Style the whole video');
    box.appendChild(el('p', 'mp-note', 'One tap sets the titles, the cuts, how photos move and the colour so they belong together. Nothing is added, removed, moved or retimed, captions are left alone, and one Undo puts everything back.'));
    cards(box, STYLES, t.mstyle, sid => applyStyle(sid), true);
    const ft = el('details', 'mp-ft'); ft.appendChild(el('summary', '', 'Fine tune: what a style may change'));
    for (const [k, lab] of [['text', 'Title and text animation'], ['trans', 'Transitions between clips'], ['cam', 'Camera moves on photos (video is never zoomed)'], ['look', 'Colour look and motion blur']]) { const l = el('label'), c = el('input'); c.type = 'checkbox'; c.checked = P.opts[k]; c.onchange = () => { P.opts[k] = c.checked; }; l.append(c, el('span', '', lab)); ft.appendChild(l); }
    box.appendChild(ft);
  };
  // the tab follows the selection
  let lastSel; new MutationObserver(() => { if (ED.sel === lastSel) return; lastSel = ED.sel; if (ED.panel === 'motion') api.renderPanel(); }).observe(document.querySelector('#einsp'), { childList: true });
  function open() { ED.panel = 'motion'; api.renderPanel(); if (NX.touch && NX.touch.T.on) NX.touch.sheet('rail', 'Motion'); }

  NX.presets = { TEXT, LAYER, CLIP, STYLES, P, applyText, applyLayer, applyClip, applyCam, applyStyle, layerKf, open, mine };
})();
