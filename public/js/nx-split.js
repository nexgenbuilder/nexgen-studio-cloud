'use strict';
/* NexGen Studio V17: split screen in the timeline editor.
   The screen splits top and bottom: the main track (say, a talking head) plays in one half and "section clips" (B-roll, a
   second angle, a photo, a colour panel) play in the other. Each section clip has its own footage, trim, framing (fill the
   half, or whole with a blurred or plain backdrop), focus and zoom, and its own sound switch. Between section clips the main
   track fills the screen again, and the split slides open and shut.
   This module adds: the "Split screen" tab (layouts, which half the main track fills, divider, opening, the main track's
   framing, footage for the other half one clip at a time or laid across the whole video), the section clip inspector,
   caption positions (top, thirds, middle, the split line, bottom; one caption or every caption, and where new captions go),
   and a "Split screen" start on Home. The engine side lives in engine/tpl_free.js (layers of kind 'seg', TL.split). */
(() => {
  const X = NX.editor; if (!X || !X.XT || !X.api || !NX.app) return;
  const A = NX.app, el = A.el, api = X.api, XT = X.XT, ED = X.ED, S = A.S;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), r3 = api.r3;
  const css = document.createElement('style'); css.textContent = `
.sp-lays { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; margin-bottom: 10px; }
.sp-lay { border: 1px solid var(--line); background: var(--raise); border-radius: 8px; padding: 6px 4px 5px; display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 600; color: var(--mute); line-height: 1.15; text-align: center; }
.sp-lay[aria-pressed="true"] { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); color: var(--fg); }
.sp-dia { width: 30px; aspect-ratio: 9 / 16; border-radius: 4px; overflow: hidden; display: flex; flex-direction: column; gap: 2px; background: var(--line2); padding: 0; }
.sp-dia i { display: grid; place-items: center; font: 700 8px/1 var(--f-mono); font-style: normal; color: #fff; }
.sp-dia .m { background: #5b4bd0; } .sp-dia .s { background: #2f8c86; }
.sp-key { display: flex; gap: 12px; font-size: 11.5px; color: var(--dim); margin: -2px 0 10px; } .sp-key b { display: inline-block; width: 9px; height: 9px; border-radius: 2px; margin-right: 5px; vertical-align: -1px; }
.ep-clip .sp-ck { position: absolute; left: 5px; top: 5px; width: 20px; height: 20px; border-radius: 5px; border: 1.5px solid rgba(255,255,255,.85); background: rgba(0,0,0,.45); color: #fff; font: 700 12px/1 var(--f-ui); display: grid; place-items: center; padding: 0; }
.ep-clip .sp-ck[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); }
.ep-clip .sp-snd { position: absolute; right: 5px; bottom: 30px; font: 700 9px/1 var(--f-mono); background: rgba(0,0,0,.72); color: #fff; border-radius: 4px; padding: 3px 5px; }
.sp-row { display: flex; gap: 6px; flex-wrap: wrap; margin: 8px 0 4px; }
.sp-sum { font-size: 12px; color: var(--mute); background: var(--raise); border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; margin: 0 0 10px; }
.ti.k-seg { background: #2f6f8c; background-size: auto 100%; }
.cp-pos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin: 4px 0 8px; }
.cp-pos button { border: 1px solid var(--line); background: var(--raise); border-radius: 8px; padding: 7px 4px; font-size: 11.5px; font-weight: 600; color: var(--mute); }
.cp-pos button[aria-pressed="true"] { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); color: var(--fg); }
`; document.head.appendChild(css);

  // ------------------------------------------------------------------ the layout
  const DEF = { ratio: 0.5, main: 'bottom', line: 'none', lc: 'accent', open: 'slide', mfit: 'fill', mfx: 0.5, mfy: 0.5, mz: 1 };
  const defSplit = () => Object.assign({}, DEF);   // library footage (DPG's) is always drawn whole in its half unless that clip says otherwise
  const LAYOUTS = [['half', 'Half & half', 0.5], ['bigtop', 'Big top', 0.62], ['bigbot', 'Big bottom', 0.38], ['band', 'Top band', 0.3], ['bandb', 'Bottom band', 0.7]];
  const SP = { pick: new Set(), replace: null };
  const TL = () => api.TL();
  const spl = t => Object.assign({}, DEF, (t || TL() || {}).split || {});
  const segs = t => ((t || TL() || {}).layers || []).filter(L => L.kind === 'seg');
  const halfName = t => (spl(t).main === 'top' ? 'Bottom' : 'Top');   // the half the section clips fill
  const mainName = t => (spl(t).main === 'top' ? 'top' : 'bottom');
  function seamY(t) {   // the line between the halves, in canvas px (matches the engine's layout)
    const p = spl(t), r = clamp(+p.ratio || 0.5, 0.2, 0.8), secTop = p.main !== 'top', share = secTop ? r : 1 - r, g = p.line === 'gap' ? 24 : 0;
    const secH = Math.round((1920 - 3 * g) * share), mainH = 1920 - 3 * g - secH; return Math.round(secTop ? g + secH + g / 2 : g + mainH + g / 2);
  }
  const splitAt = (t, at) => segs(t).some(L => at >= L.t0 && at < L.t0 + L.d);
  function setSplit(mut, key) {
    api.change(t => { t.split = Object.assign(defSplit(), t.split || {}); mut(t.split, t); followSeam(t); }, key ? { key } : undefined);
    api.renderPanel(); api.renderInspector();
  }
  function followSeam(t) {   // captions set to sit on the split line move with it
    if (t.capPos !== 'seam') return; const y = seamY(t);
    for (const L of t.layers) if (L.cap) moveY(L, y);
  }
  function moveY(L, y) { const dy = y - (+L.y || 0); L.y = Math.round(y); if (L.kf && Array.isArray(L.kf.y)) L.kf.y = L.kf.y.map(k => Object.assign({}, k, { v: Math.round(k.v + dy) })); }

  // ------------------------------------------------------------------ section clips
  const dur = () => Math.max(0.5, S.dur);
  function mainVoiceAt(t, at) {   // the main track has a clip playing its own sound at this moment
    const f = api.F(); if (!f) return false;
    return f.M.some(m => m.type === 'clip' && at >= m.start && at < m.start + m.d && m.sound !== false && (NX.CLIPS.get(m.c) || {}).audio);
  }
  function defaultFit(r) { return r && r.src !== 'lib' && r.kind === 'vert' ? 'fill' : r && r.src !== 'lib' ? 'fill' : 'blur'; }
  function freeSpot(t, from) {   // the first moment at or after `from` that no section clip covers, and how long it stays free
    const L = segs(t).slice().sort((a, b) => a.t0 - b.t0); let at = from;
    for (let k = 0; k < 40; k++) { const hit = L.find(x => at >= x.t0 - 1e-3 && at < x.t0 + x.d - 1e-3); if (!hit) break; at = hit.t0 + hit.d; }
    const next = L.find(x => x.t0 > at + 1e-3); return [at, (next ? next.t0 : dur()) - at];
  }
  function newSeg(r, t0, d, t) {
    const L = { kind: 'seg', t0: r3(t0), d: r3(d) };
    if (r) { L.c = r.id; L.in = r.dur > d + 1.2 ? 0.5 : 0; L.fit = defaultFit(r); if (r.audio && mainVoiceAt(t, t0)) L.sound = false; }
    else L.card = 'accent';
    return L;
  }
  function addSeg(r) {
    const t = TL(); if (!t) return;
    const [at, room] = freeSpot(t, clamp(S.t, 0, dur() - 0.3));
    if (room < 0.4 || at >= dur() - 0.3) { A.toast('The ' + halfName(t).toLowerCase() + ' half is full from here to the end. Move the playhead, or delete a clip there first.', 5200); return; }
    const d = Math.max(0.6, Math.min(room, r ? Math.max(0.6, r.dur - (r.dur > 3 ? 0.5 : 0)) : 3));
    if (!t.split) api.change(tl => { tl.split = defSplit(); }, { noUndo: true });
    api.addLayer(newSeg(r, at, d, t)); api.renderPanel();
    A.toast((r ? '“' + r.name + '”' : 'A colour panel') + ' plays in the ' + halfName(t).toLowerCase() + ' half from ' + A.fmtT(at) + '. Drag its ends on the timeline to change when.', 4800);
  }
  function layAcross(ids) {   // B-roll: the picked clips one after another across the whole video, replacing the clips already there
    const t = TL(), rows = ids.map(id => NX.CLIPS.get(id)).filter(Boolean); if (!t || !rows.length) return;
    const D = dur(), per = D / rows.length, out = []; let at = 0, i = 0;
    while (at < D - 0.25 && i < 80) { const r = rows[i % rows.length], inn = r.dur > per + 1.2 ? 0.5 : 0, d = Math.max(0.5, Math.min(per, r.dur - inn, D - at)); const L = newSeg(r, at, d, t); L.in = inn; L.id = api.uid(); out.push(L); at += d; i++; }
    api.change(tl => { tl.split = Object.assign(defSplit(), tl.split || {}); tl.layers = tl.layers.filter(L => L.kind !== 'seg').concat(out); followSeam(tl); });
    SP.pick.clear(); ED.sel = out[0] ? out[0].id : null; api.renderPanel(); api.renderInspector();
    A.toast(out.length + ' clips now run in the ' + halfName(t).toLowerCase() + ' half for the whole video.', 4600);
  }
  function replaceSeg(id, r) {
    api.upd(id, L => { L.c = r.id; delete L.card; L.in = 0; L.d = r3(Math.min(L.d, Math.max(0.5, r.dur))); L.fit = defaultFit(r); delete L.fx; delete L.fy; delete L.z; });
    SP.replace = null; api.select(id); api.renderPanel();
  }
  function removeSplit() { api.change(t => { t.layers = t.layers.filter(L => L.kind !== 'seg'); if (t.capPos === 'seam') delete t.capPos; }); ED.sel = null; api.renderPanel(); api.renderInspector(); }

  // ------------------------------------------------------------------ containers
  // One model for every container: a main-track item {type:'container', layout, zones}.
  // A zone is a slot: {kind:'clip'} (footage or a still) | {kind:'card'} (solid colour)
  // | {kind:'graphic'} (headline + highlight + badge + label + vector picture).
  // vsplit: graphic on top, footage below (the reference). hsplit: the same, left/right.
  // grid: rows x cols of cells, each a slot, scrolling as one time-driven loop.
  // overlay: footage with a graphic card on top of it.
  const GRAPHIC_DEF = () => ({ kind: 'graphic', bg: 'paper', headline: 'WITH THE PROPERTY DEED', hi: 'PROPERTY DEED', badge: '3D MODELS', label: 'PROPERTY DEED', art: 'house' });
  const CLIP_DEF = () => ({ kind: 'clip', fit: 'fill', fx: 0.5, fy: 0.5 });
  const CARD_DEF = () => ({ kind: 'graphic', bg: 'paper', headline: 'YOUR HEADLINE', hi: '', badge: '', label: 'PROPERTY DEED', art: 'none', x: 90, y: 1250, w: 900, h: 420, frame: 'rounded' });
  function addContainer(layout) {
    const t = TL(); if (!t) return;
    const base = { type: 'container', layout, d: 4, tr: t.main.length > 1 ? { type: 'dissolve', d: 0.45 } : null };
    if (layout === 'vsplit') Object.assign(base, { ratio: 0.5, line: 'none', lc: 'accent', zones: [GRAPHIC_DEF(), CLIP_DEF()] });
    else if (layout === 'hsplit') Object.assign(base, { ratio: 0.5, line: 'none', lc: 'accent', zones: [GRAPHIC_DEF(), CLIP_DEF()] });
    else if (layout === 'grid') Object.assign(base, { rows: 2, cols: 2, gap: 12, scroll: { dir: 'off', speed: 120 }, zones: [CLIP_DEF(), CLIP_DEF(), CLIP_DEF(), CLIP_DEF()] });
    else Object.assign(base, { zones: [CLIP_DEF(), CARD_DEF()] });
    api.addMain(base); api.renderPanel();
    A.toast({ vsplit: 'Split container added: a graphic card on top, footage below. Pick the footage for the bottom half in the panel on the right.', hsplit: 'Side-by-side added: a graphic card on the left, footage on the right. Pick the footage for the right half in the panel on the right.', grid: 'Grid added: four empty cells. Pick the footage for each cell in the panel on the right.', overlay: 'Overlay card added: pick the footage underneath, then drag the card on the preview to place it.' }[layout] || 'Container added.', 6000);
  }
  // the inspector for a selected container (called from nx-editor.js renderInspector)
  function containerInsp(box, o) {
    const t = TL(), i = t.main.indexOf(o), lay = o.layout || 'vsplit';
    const LAYNAME = { vsplit: 'Split container', hsplit: 'Side-by-side', grid: 'Grid', overlay: 'Overlay card' };
    const b = api.F() && api.F().M ? api.F().M.find(m => m.id === o.id) : null;
    api.head(box, LAYNAME[lay] || 'Container', (b ? b.d.toFixed(1) : o.d) + ' s on the timeline · ' + (o.zones || []).length + ' zone' + ((o.zones || []).length === 1 ? '' : 's'));
    const g0 = api.grp(box, 'Layout');
    g0.appendChild(api.segRow('Type', [['vsplit', 'Split'], ['hsplit', 'Side-by-side'], ['grid', 'Grid'], ['overlay', 'Overlay card']], lay, v => {
      api.upd(o.id, x => {
        x.layout = v;
        if (v === 'overlay' && x.zones[1] && x.zones[1].kind === 'graphic' && x.zones[1].x === undefined) Object.assign(x.zones[1], { x: 90, y: 1250, w: 900, h: 420, frame: 'rounded' });
        if ((v === 'vsplit' || v === 'hsplit') && x.ratio === undefined) x.ratio = 0.5;
        if (v === 'grid') { if (x.rows === undefined) x.rows = 2; if (x.cols === undefined) x.cols = 2; if (x.gap === undefined) x.gap = 12; if (!x.scroll) x.scroll = { dir: 'off', speed: 120 }; }
      }); api.renderInspector();
    }));
    if (lay === 'vsplit' || lay === 'hsplit') {
      g0.appendChild(api.rangeRow(lay === 'vsplit' ? 'Top half' : 'Left half', 20, 80, 1, Math.round((o.ratio || 0.5) * 100), v => api.upd(o.id, x => { x.ratio = Math.round(v) / 100; }, 'cr'), v => Math.round(v) + '%'));
      g0.appendChild(el('p', 'hint', 'Or drag the seam on the preview.'));
      g0.appendChild(api.segRow('Seam', [['none', 'None'], ['line', 'Thin line'], ['bar', 'Thick bar']], o.line || 'none', v => api.upd(o.id, x => { x.line = v; })));
      if (o.line && o.line !== 'none') g0.appendChild(api.segRow('Seam colour', [['accent', 'Brand'], ['white', 'White'], ['ink', 'Ink']], o.lc || 'accent', v => api.upd(o.id, x => { x.lc = v; })));
    }
    if (lay === 'grid') {
      g0.appendChild(api.rangeRow('Rows', 1, 4, 1, o.rows || 2, v => api.upd(o.id, x => { x.rows = v; }, 'gr'), v => String(v)));
      g0.appendChild(api.rangeRow('Columns', 1, 4, 1, o.cols || 2, v => api.upd(o.id, x => { x.cols = v; }, 'gc'), v => String(v)));
      g0.appendChild(api.rangeRow('Gap', 0, 40, 2, o.gap || 0, v => api.upd(o.id, x => { x.gap = v; }, 'gg'), v => v + ' px'));
      const sc = o.scroll || {};
      g0.appendChild(api.segRow('Scroll', [['off', 'Still'], ['up', 'Up'], ['down', 'Down'], ['left', 'Left'], ['right', 'Right']], sc.dir || 'off', v => { api.upd(o.id, x => { x.scroll = x.scroll || {}; x.scroll.dir = v; }); api.renderInspector(); }));
      if (sc.dir && sc.dir !== 'off') g0.appendChild(api.rangeRow('Scroll speed', 0, 300, 10, sc.speed || 120, v => api.upd(o.id, x => { x.scroll = x.scroll || {}; x.scroll.speed = v; }, 'gs'), v => v + ' px/s'));
      g0.appendChild(el('p', 'hint', 'Scroll loops: cells wrap around, so the grid never runs out. More cells than the grid shows scroll into view.'));
    }
    const zones = o.zones || [];
    const zlabels = lay === 'vsplit' ? ['Top', 'Bottom'] : lay === 'hsplit' ? ['Left', 'Right'] : lay === 'overlay' ? ['Footage', 'Card'] : zones.map((z, j) => 'Cell ' + (j + 1));
    const zi = Math.min(ED.selZone || 0, Math.max(0, zones.length - 1));
    const gz = api.grp(box, 'Zones');
    if (zones.length > 1) gz.appendChild(api.segRow('Zone', zlabels.map((n, j) => [String(j), n]), String(zi), v => { ED.selZone = +v; api.renderInspector(); api.drawOv(); }));
    if (zones[zi]) zoneInsp(gz, o, zi, zones[zi], lay);
    if (lay === 'grid') api.acts(gz, [['Add a cell', () => { if ((o.zones || []).length >= 16) { A.toast('16 cells is the most a grid holds.'); return; } api.upd(o.id, x => { x.zones = x.zones || []; x.zones.push(CLIP_DEF()); }); ED.selZone = (o.zones || []).length; api.renderInspector(); }], ['Remove this cell', () => { if ((o.zones || []).length <= 1) return; api.upd(o.id, x => { x.zones.splice(zi, 1); }); ED.selZone = Math.max(0, zi - 1); api.renderInspector(); }, 'danger']]);
    const gl = api.grp(box, 'Length');
    gl.appendChild(api.rangeRow('Plays for', 0.5, 30, 0.1, o.d, v => api.upd(o.id, x => { x.d = Math.round(v * 10) / 10; }, 'cd'), v => v.toFixed(1) + ' s'));
    if (NX.motion) NX.motion.mainMotion(box, o);
    if (i > 0) api.trRow(box, o);
    api.acts(box, [['Split', api.split], ['Duplicate', api.duplicate], ['Delete', api.del, 'danger']]);
  }
  function zoneInsp(g, o, zi, z, lay) {
    const kind = z.kind || 'clip';
    g.appendChild(api.segRow('Holds', [['clip', 'Footage / photo'], ['card', 'Colour panel'], ['graphic', 'Graphic card']], kind, v => {
      api.upd(o.id, x => { const s = x.zones[zi]; s.kind = v; if (v === 'card' && !s.card) s.card = 'accent'; if (v === 'graphic' && s.headline === undefined) Object.assign(s, { bg: 'paper', headline: 'YOUR HEADLINE', hi: '', badge: '', label: '', art: 'none' }); });
      api.renderInspector();
    }));
    g.appendChild(api.segRow('Shape', [['rect', 'Rectangle'], ['round', 'Rounded'], ['circle', 'Circle'], ['arch', 'Arch']], z.shape || 'rect', v => api.upd(o.id, x => { x.zones[zi].shape = v; })));
    if (z.shape === 'circle' || z.shape === 'arch') g.appendChild(el('p', 'hint', 'A circle or arch shape crops the edges of what is inside.'));
    if (kind === 'clip') {
      const r = z.c && NX.CLIPS.get(z.c);
      if (z.c) {
        g.appendChild(el('p', 'note', r ? r.name : 'Removed footage'));
        g.appendChild(api.segRow('Show it', [['fill', 'Fill the zone'], ['blur', 'Whole, blur behind'], ['fit', 'Whole, plain']], z.fit || 'fill', v => api.upd(o.id, x => { x.zones[zi].fit = v; })));
        if ((z.fit || 'fill') === 'fill') {
          g.appendChild(api.rangeRow('Zoom', 1, 3, 0.05, Math.max(1, +z.z || 1), v => api.upd(o.id, x => { x.zones[zi].z = Math.round(v * 100) / 100; if (x.zones[zi].z <= 1.001) delete x.zones[zi].z; }, 'zz' + zi), v => v.toFixed(2) + '×'));
          g.appendChild(api.rangeRow('Left / right', 0, 100, 1, Math.round((z.fx === undefined ? 0.5 : +z.fx) * 100), v => api.upd(o.id, x => { x.zones[zi].fx = Math.round(v) / 100; }, 'zx' + zi), v => Math.round(v) + '%'));
          g.appendChild(api.rangeRow('Up / down', 0, 100, 1, Math.round((z.fy === undefined ? 0.5 : +z.fy) * 100), v => api.upd(o.id, x => { x.zones[zi].fy = Math.round(v) / 100; }, 'zy' + zi), v => Math.round(v) + '%'));
        }
        const m = z.c && NX.META[z.c];
        if (m) g.appendChild(api.rangeRow('Starts in the clip at', 0, Math.max(0, m.n / 30 - 0.3), 0.05, +z.in || 0, v => api.upd(o.id, x => { x.zones[zi].in = api.r3(v); }, 'zin' + zi), v => v.toFixed(2) + ' s'));
        if (r && r.audio) g.appendChild(api.segRow('Clip sound', [['on', 'On'], ['off', 'Off']], z.sound === false ? 'off' : 'on', v => api.upd(o.id, x => { if (v === 'off') x.zones[zi].sound = false; else delete x.zones[zi].sound; })));
        api.acts(g, [['Replace footage', () => { ED.replace = { cid: o.id, zone: zi }; ED.panel = 'media'; api.renderPanel(); A.toast('Pick the new footage on the left.'); }], ['Remove footage', () => api.upd(o.id, x => { delete x.zones[zi].c; delete x.zones[zi].in; })]]);
        if (lay === 'grid') {
          const gc = api.grp(g, 'Image rotation');
          gc.appendChild(el('p', 'note', 'This cell cycles through its images over time — the one above, then each added image in turn.'));
          gc.appendChild(api.rangeRow('Each image for', 1, 10, 0.5, z.cycle || 3, v => api.upd(o.id, x => { x.zones[zi].cycle = v; }, 'cy' + zi), v => v.toFixed(1) + ' s'));
          (z.alts || []).forEach((a, ai) => { const r2 = a.c && NX.CLIPS.get(a.c); gc.appendChild(el('p', 'note', (ai + 2) + '. ' + (r2 ? r2.name : 'Removed footage'))); });
          api.acts(gc, [['Add image to the rotation', () => { ED.replace = { cid: o.id, zone: zi, alt: true }; ED.panel = 'media'; api.renderPanel(); A.toast('Pick the next image for this cell.'); }]].concat((z.alts || []).length ? [['Remove last image', () => api.upd(o.id, x => { x.zones[zi].alts.pop(); if (!x.zones[zi].alts.length) delete x.zones[zi].alts; })]] : []));
        }
      } else {
        g.appendChild(el('p', 'note', 'Nothing here yet — this zone shows “ADD FOOTAGE” until you pick a clip.'));
        api.acts(g, [['Pick footage', () => { ED.replace = { cid: o.id, zone: zi }; ED.panel = 'media'; api.renderPanel(); A.toast('Pick the footage on the left.'); }]]);
      }
    } else if (kind === 'card') {
      g.appendChild(api.segRow('Colour', [['accent', 'Brand'], ['ink', 'Ink'], ['paper', 'Paper'], ['white', 'White']], z.card || 'accent', v => api.upd(o.id, x => { x.zones[zi].card = v; })));
    } else {
      g.appendChild(api.textRow('Headline', z.headline || '', v => api.upd(o.id, x => { x.zones[zi].headline = v; }, 'gh'), { up: true, max: 60, lint: true }));
      g.appendChild(api.textRow('Highlight part', z.hi || '', v => api.upd(o.id, x => { x.zones[zi].hi = v; }, 'gi'), { up: true, max: 30, hint: 'The words of the headline drawn in the brand colour. Leave empty for one colour.' }));
      g.appendChild(api.textRow('Badge', z.badge || '', v => api.upd(o.id, x => { x.zones[zi].badge = v; }, 'gb'), { up: true, max: 20, hint: 'The small dark pill at the top, e.g. 3D MODELS. Empty hides it.' }));
      g.appendChild(api.textRow('Label', z.label || '', v => api.upd(o.id, x => { x.zones[zi].label = v; }, 'gl'), { up: true, max: 30, hint: 'The box at the bottom, e.g. PROPERTY DEED. Empty hides it.' }));
      g.appendChild(api.segRow('Background', [['paper', 'Paper'], ['ink', 'Ink'], ['accent', 'Brand'], ['white', 'White']], z.bg || 'paper', v => api.upd(o.id, x => { x.zones[zi].bg = v; })));
      g.appendChild(api.segRow('Picture', [['house', 'House'], ['none', 'None']], z.art || 'none', v => api.upd(o.id, x => { x.zones[zi].art = v; })));
      if (lay === 'overlay' && zi === 1) {
        g.appendChild(api.segRow('Frame', [['rounded', 'Rounded'], ['solid', 'Square'], ['outline', 'Outline']], z.frame || 'rounded', v => api.upd(o.id, x => { x.zones[zi].frame = v; })));
        g.appendChild(api.rangeRow('Left', 0, 1080, 5, z.x || 0, v => api.upd(o.id, x => { x.zones[zi].x = v; }, 'cx'), v => v + ' px'));
        g.appendChild(api.rangeRow('Top', 0, 1920, 5, z.y || 0, v => api.upd(o.id, x => { x.zones[zi].y = v; }, 'cy'), v => v + ' px'));
        g.appendChild(api.rangeRow('Width', 120, 1080, 5, z.w || 600, v => api.upd(o.id, x => { x.zones[zi].w = v; }, 'cw'), v => v + ' px'));
        g.appendChild(api.rangeRow('Height', 80, 1920, 5, z.h || 300, v => api.upd(o.id, x => { x.zones[zi].h = v; }, 'ch'), v => v + ' px'));
        g.appendChild(el('p', 'hint', 'Or drag the card on the preview to move it; drag a corner to resize it.'));
      }
    }
    if (lay === 'grid') {
      // cell label: optional per cell, off by default — a cell with it off shows just its video or image, nothing else
      const ov = z.overlay || {};
      const go = api.grp(g, 'Cell label');
      go.appendChild(api.segRow('Label on this cell', [['on', 'On'], ['off', 'Off']], ov.on ? 'on' : 'off', v => { api.upd(o.id, x => { const s = x.zones[zi]; s.overlay = s.overlay || {}; s.overlay.on = v === 'on'; if (v === 'on') { s.overlay.pos = s.overlay.pos || 'bottom'; s.overlay.style = s.overlay.style || 'chip'; } }); api.renderInspector(); }));
      if (ov.on) {
        go.appendChild(api.textRow('Label', ov.text || '', v => api.upd(o.id, x => { x.zones[zi].overlay = x.zones[zi].overlay || {}; x.zones[zi].overlay.text = v; }, 'ovt'), { max: 60, lint: true, hint: 'Price, dish name, property or car info — anything that identifies this cell.' }));
        go.appendChild(api.segRow('Position', [['bottom', 'Bottom'], ['top', 'Top']], ov.pos || 'bottom', v => api.upd(o.id, x => { x.zones[zi].overlay = x.zones[zi].overlay || {}; x.zones[zi].overlay.pos = v; })));
        go.appendChild(api.segRow('Style', [['chip', 'Chip'], ['scrim', 'Scrim']], ov.style || 'chip', v => api.upd(o.id, x => { x.zones[zi].overlay = x.zones[zi].overlay || {}; x.zones[zi].overlay.style = v; })));
      } else {
        go.appendChild(el('p', 'hint', 'Off: the cell shows just its video or image, nothing else.'));
      }
    }
  }
  XT.containerInsp = containerInsp;

  // ------------------------------------------------------------------ captions: where they sit
  const CAPPOS = [['top', 'Top', 330], ['upper', 'Upper third', 640], ['mid', 'Middle', 960], ['seam', 'Split line', null], ['lower', 'Lower third', 1280], ['bottom', 'Bottom', 1400]];
  const posY = (k, t) => (k === 'seam' ? seamY(t) : (CAPPOS.find(x => x[0] === k) || CAPPOS[4])[2]);
  const posOf = (L, t) => { const y = +L.y || 0; if (segs(t).length && Math.abs(y - seamY(t)) < 6) return 'seam'; const c = CAPPOS.find(x => x[2] !== null && Math.abs(x[2] - y) < 6); return c ? c[0] : ''; };
  function captionsTo(k, ids) {   // ids: one caption, or null for every caption in the video (and the spot new captions use)
    const t = TL(); if (!t) return; if (k === 'seam' && !segs(t).length) { A.toast('Add a clip to the other half first; then the split line is there to sit on.'); return; }
    const n = t.layers.filter(L => L.cap && (!ids || ids.includes(L.id))).length;
    api.change(tl => { const y = posY(k, tl); for (const L of tl.layers) if (L.cap && (!ids || ids.includes(L.id))) moveY(L, y); if (!ids) tl.capPos = k; });
    api.renderInspector(); if (api.drawOv) api.drawOv();
    if (!ids) A.toast(n ? n + ' caption' + (n > 1 ? 's' : '') + ' moved; new captions in this video go there too.' : 'New captions in this video will go there.', 4200);
  }
  function capGroup(box, o) {
    const t = TL(), hasSplit = segs(t).length > 0, g = api.grp(box, 'Caption position'), cur = posOf(o, t);
    let every = true;
    g.appendChild(api.segRow('Move', [['all', 'Every caption'], ['one', 'Just this one']], 'all', v => { every = v === 'all'; }));
    const grid = el('div', 'cp-pos');
    for (const [k, n] of CAPPOS) { if (k === 'seam' && !hasSplit) continue; const b = el('button', '', n); b.type = 'button'; b.setAttribute('aria-pressed', String(cur === k)); b.onclick = () => captionsTo(k, every ? null : [o.id]); grid.appendChild(b); }
    g.appendChild(grid);
    const after = [...box.querySelectorAll('.grp')].find(x => x !== g && /^Captions$/.test((x.querySelector('h3') || {}).textContent || ''));   // right under the caption style
    if (after && after.nextSibling !== g) after.after(g);
    g.appendChild(el('p', 'hint', (hasSplit ? 'Split line keeps captions on the seam, even if you change the layout. ' : '') + 'Top and bottom stay clear of the app’s buttons. Drag the caption on the preview for any other spot.'));
  }
  // new captions go where this video's captions were set (or onto the split line while the screen is split)
  const add0 = api.addLayer;
  api.addLayer = L => {
    try { const t = TL(); if (L && L.cap && t) { if (t.capPos && (t.capPos !== 'seam' || splitAt(t, L.t0))) L.y = posY(t.capPos, t); else if (!t.capPos && splitAt(t, L.t0)) L.y = seamY(t); } } catch (e) {}
    return add0(L);
  };

  // ------------------------------------------------------------------ the Split screen tab
  XT.tabs.push(['split', 'Split screen', 'media']);
  function dia(ratio, mainTop, small) {
    const d = el('span', 'sp-dia'); if (small) d.style.width = '22px';
    const top = el('i', mainTop ? 'm' : 's', mainTop ? 'M' : '+'), bot = el('i', mainTop ? 's' : 'm', mainTop ? '+' : 'M');
    top.style.flex = String(ratio); bot.style.flex = String(1 - ratio); d.appendChild(top); d.appendChild(bot); return d;
  }
  XT.panels.split = (box, h) => {
    const t = TL(); if (!t) return; const p = spl(t), list = segs(t), D = dur(), cover = list.reduce((a, L) => a + Math.max(0, Math.min(L.t0 + L.d, D) - L.t0), 0);
    const mainTop = p.main === 'top', half = halfName(t);
    h.sec('Split screen');
    h.note('Your main track plays in one half; the clips you add here play in the other. Where the other half is empty, the main track fills the screen again.');
    if (!t.main.length) { const s = el('p', 'sp-sum', 'Start with the main video (a talking head, say): add it from Media and it fills the ' + mainName(t) + ' half.'); box.appendChild(s);
      const r = el('div', 'sp-row'), b = el('button', 'btn sm', 'Open Media'); b.type = 'button'; b.onclick = () => { ED.panel = 'media'; api.renderPanel(); }; r.appendChild(b); box.appendChild(r); }
    if (list.length) box.appendChild(el('p', 'sp-sum', list.length + ' clip' + (list.length > 1 ? 's' : '') + ' in the ' + half.toLowerCase() + ' half · split for ' + cover.toFixed(1) + ' of ' + D.toFixed(1) + ' s'));
    // layouts
    const lays = el('div', 'sp-lays');
    for (const [k, n, r] of LAYOUTS) { const b = el('button', 'sp-lay'); b.type = 'button'; b.setAttribute('aria-pressed', String(Math.abs(p.ratio - r) < 0.02)); b.appendChild(dia(r, mainTop)); b.appendChild(document.createTextNode(n)); b.onclick = () => setSplit(s => { s.ratio = r; }); lays.appendChild(b); }
    box.appendChild(lays);
    const key = el('div', 'sp-key'); const k1 = el('span'), b1 = el('b'); b1.style.background = '#5b4bd0'; k1.appendChild(b1); k1.appendChild(document.createTextNode('M  main track')); const k2 = el('span'), b2 = el('b'); b2.style.background = '#2f8c86'; k2.appendChild(b2); k2.appendChild(document.createTextNode('+  clips you add here')); key.appendChild(k1); key.appendChild(k2); box.appendChild(key);
    box.appendChild(api.rangeRow('Top half', 20, 80, 1, Math.round(p.ratio * 100), v => setSplit(s => { s.ratio = Math.round(v) / 100; }, 'spr'), v => Math.round(v) + '%'));
    box.appendChild(api.segRow('Main track plays in', [['bottom', 'Bottom half'], ['top', 'Top half']], p.main === 'top' ? 'top' : 'bottom', v => setSplit(s => { if ((s.main === 'top') !== (v === 'top')) s.ratio = Math.round((1 - s.ratio) * 100) / 100; s.main = v; })));
    box.appendChild(api.segRow('Divider', [['none', 'None'], ['line', 'Thin line'], ['bar', 'Thick bar'], ['gap', 'Panels']], p.line, v => setSplit(s => { s.line = v; })));
    if (p.line !== 'none') box.appendChild(api.segRow(p.line === 'gap' ? 'Behind the panels' : 'Colour', [['accent', 'Brand'], ['white', 'White'], ['ink', 'Ink']], p.lc, v => setSplit(s => { s.lc = v; })));
    box.appendChild(api.segRow('The split', [['slide', 'Slides open'], ['cut', 'Cuts in']], p.open, v => setSplit(s => { s.open = v; })));
    // the main track in its half
    h.sec('Main track in its half');
    box.appendChild(api.segRow('Framing', [['fill', 'Fill the half'], ['fit', 'Whole clip']], p.mfit, v => setSplit(s => { s.mfit = v; })));
    if (p.mfit !== 'fit') {
      box.appendChild(api.rangeRow('Zoom', 1, 2.5, 0.05, p.mz, v => setSplit(s => { s.mz = Math.round(v * 100) / 100; }, 'spz'), v => v.toFixed(2) + '×'));
      box.appendChild(api.rangeRow('Show higher / lower', 0, 100, 1, Math.round(p.mfy * 100), v => setSplit(s => { s.mfy = Math.round(v) / 100; }, 'spy'), v => (v < 45 ? 'higher' : v > 55 ? 'lower' : 'centre')));
      if (p.mz > 1.01) box.appendChild(api.rangeRow('Show left / right', 0, 100, 1, Math.round(p.mfx * 100), v => setSplit(s => { s.mfx = Math.round(v) / 100; }, 'spx'), v => (v < 45 ? 'left' : v > 55 ? 'right' : 'centre')));
      box.appendChild(el('p', 'ep-note', 'Fill crops the main video to the half; Whole clip keeps every pixel with a soft blurred copy behind it.' + (A.B().builtin ? ' DPG’s own footage always shows whole; uploads follow this setting.' : '')));
    }
    // footage for the other half
    h.sec(half + ' half: what plays');
    h.note(SP.replace ? 'Click the clip to swap in.' : 'Click a clip to add it at the playhead. Or tick several and lay them across the whole video, B-roll style.');
    const head = el('div', 'sp-row');
    const up = el('button', 'btn sm', '+ Upload'); up.type = 'button'; up.onclick = A.pickFiles; head.appendChild(up);
    const card = el('button', 'btn sm', 'Colour panel'); card.type = 'button'; card.title = 'A plain brand-colour half, for text'; card.onclick = () => addSeg(null); head.appendChild(card);
    if (SP.replace) { const cx = el('button', 'btn sm ghost', 'Cancel swap'); cx.type = 'button'; cx.onclick = () => { SP.replace = null; api.renderPanel(); }; head.appendChild(cx); }
    box.appendChild(head);
    if (SP.pick.size && !SP.replace) { const r = el('div', 'sp-row'), b = el('button', 'btn sm primary', 'Lay ' + SP.pick.size + ' clip' + (SP.pick.size > 1 ? 's' : '') + ' across the whole video'); b.type = 'button'; b.onclick = () => layAcross([...SP.pick]); r.appendChild(b);
      const c = el('button', 'btn sm ghost', 'Clear'); c.type = 'button'; c.onclick = () => { SP.pick.clear(); api.renderPanel(); }; r.appendChild(c); box.appendChild(r);
      if (list.length) box.appendChild(el('p', 'ep-note', 'This replaces the ' + list.length + ' clip' + (list.length > 1 ? 's' : '') + ' already in the ' + half.toLowerCase() + ' half.')); }
    const g = el('div', 'ep-media'); box.appendChild(g);
    const rows = NX.brandClips().sort((x, y) => (x.src === 'lib') - (y.src === 'lib'));
    if (!rows.length) h.note('No footage for this brand yet. Upload MP4 or MOV clips; clips keep their sound.');
    for (const r of rows) {
      const b = el('div', 'ep-clip'); b.tabIndex = 0; b.setAttribute('role', 'button'); b.title = (SP.replace ? 'Swap in ' : 'Add to the ' + half.toLowerCase() + ' half: ') + r.name;
      const fi = el('div', 'fi'), im = el('img'); im.alt = ''; im.loading = 'lazy'; if (r.poster) im.src = r.poster; fi.appendChild(im); b.appendChild(fi);
      const fn = el('div', 'fn', r.name); fn.appendChild(el('small', '', (r.still ? 'photo' : (r.kind === 'vert' ? '9:16' : '16:9') + ' · ' + r.dur.toFixed(0) + ' s'))); b.appendChild(fn);
      if (r.audio) b.appendChild(el('span', 'sp-snd', '♪ SOUND'));
      const go = () => (SP.replace ? replaceSeg(SP.replace, r) : addSeg(r)); b.onclick = go; b.onkeydown = e => { if (e.key === 'Enter') go(); };
      if (!SP.replace) { const ck = el('button', 'sp-ck', SP.pick.has(r.id) ? '✓' : ''); ck.type = 'button'; ck.title = 'Tick to lay across the video'; ck.setAttribute('aria-pressed', String(SP.pick.has(r.id)));
        ck.onclick = e => { e.stopPropagation(); if (SP.pick.has(r.id)) SP.pick.delete(r.id); else SP.pick.add(r.id); api.renderPanel(); }; b.appendChild(ck); }
      g.appendChild(b);
    }
    // containers: one block on the main track with zones inside it
    h.sec('Containers');
    h.note('A container is one block on the main track with zones inside it: top and bottom, left and right, a grid of cells, or footage with a card on top. Each zone holds footage, a photo, a colour panel or a graphic card.');
    const cg = el('div', 'ep-grid');
    for (const [lay, name, sub] of [['vsplit', 'Split container', 'Graphic on top, footage below'], ['hsplit', 'Side-by-side', 'Graphic left, footage right'], ['grid', 'Grid 2×2', 'Four cells, scrolls'], ['overlay', 'Overlay card', 'A card over footage']]) {
      const b = el('button', 'ep-btn'); b.type = 'button'; b.appendChild(document.createTextNode(name)); b.appendChild(el('small', '', sub)); b.onclick = () => addContainer(lay); cg.appendChild(b);
    }
    box.appendChild(cg);
    // captions
    h.sec('Captions');
    const caps = t.layers.filter(L => L.cap).length;
    h.note(caps ? caps + ' caption block' + (caps > 1 ? 's' : '') + ' in this video. Put them on the seam between the halves, or pick a spot for each from the caption itself.' : 'Captions you add (Text → Animated captions) go on the split line while the screen is split.');
    const cr = el('div', 'sp-row');
    const seam = el('button', 'btn sm', 'Captions on the split line'); seam.type = 'button'; seam.disabled = !list.length; seam.onclick = () => captionsTo('seam', null); cr.appendChild(seam);
    const low = el('button', 'btn sm ghost', 'Lower third'); low.type = 'button'; low.onclick = () => captionsTo('lower', null); cr.appendChild(low);
    const add = el('button', 'btn sm ghost', 'Add captions'); add.type = 'button'; add.onclick = () => { ED.panel = 'text'; api.renderPanel(); setTimeout(() => { const ta = document.getElementById('tsCapText'); if (ta) { ta.scrollIntoView({ block: 'center' }); ta.focus(); } }, 60); }; cr.appendChild(add);
    box.appendChild(cr);
    if (list.length) { h.sec('Undo the split'); const r2 = el('div', 'sp-row'), rm = el('button', 'btn sm danger', 'Remove the split'); rm.type = 'button'; rm.onclick = removeSplit; r2.appendChild(rm); box.appendChild(r2); }
  };

  // ------------------------------------------------------------------ the section clip inspector
  function segInsp(box, o) {
    const t = TL(), r = o.c && NX.CLIPS.get(o.c), half = halfName(t), m = o.c && NX.META[o.c], fit = o.fit || 'fill';
    api.head(box, half + ' half', (o.c ? (r ? r.name : 'Removed footage') : 'Colour panel') + ' · ' + (+o.d).toFixed(1) + ' s on the timeline');
    if (r && r.poster) { const im = el('img', 'ei-thumb'); im.src = r.poster; im.alt = ''; box.appendChild(im); }
    if (o.c) {
      const g = api.grp(box, 'Framing');
      g.appendChild(api.segRow('Show it', [['fill', 'Fill the half'], ['blur', 'Whole, blur behind'], ['fit', 'Whole, plain']], fit, v => api.upd(o.id, L => { L.fit = v; })));
      if (fit === 'fill') {
        g.appendChild(api.rangeRow('Zoom', 1, 3, 0.05, Math.max(1, +o.z || 1), v => api.upd(o.id, L => { L.z = Math.round(v * 100) / 100; if (L.z <= 1.001) delete L.z; }, 'sz' + o.id), v => v.toFixed(2) + '×'));
        g.appendChild(api.rangeRow('Left / right', 0, 100, 1, Math.round((o.fx === undefined ? 0.5 : +o.fx) * 100), v => api.upd(o.id, L => { L.fx = Math.round(v) / 100; }, 'sfx' + o.id), v => Math.round(v) + '%'));
        g.appendChild(api.rangeRow('Up / down', 0, 100, 1, Math.round((o.fy === undefined ? 0.5 : +o.fy) * 100), v => api.upd(o.id, L => { L.fy = Math.round(v) / 100; }, 'sfy' + o.id), v => Math.round(v) + '%'));
        g.appendChild(el('p', 'hint', 'Or drag the footage on the preview to frame it.'));
        if (r && r.src === 'lib') g.appendChild(el('p', 'warn', 'Fill crops this footage to the half.'));
      } else if (fit === 'fit') g.appendChild(api.segRow('Around it', [['ink', 'Ink'], ['paper', 'Paper'], ['accent', 'Brand']], o.bg || 'ink', v => api.upd(o.id, L => { if (v === 'ink') delete L.bg; else L.bg = v; })));
      const g2 = api.grp(box, 'Timing');
      if (m) { const cd = m.n / 30; g2.appendChild(api.rangeRow('Starts in the clip at', 0, Math.max(0, cd - 0.3), 0.05, +o.in || 0, v => api.upd(o.id, L => { L.in = r3(v); L.d = r3(Math.min(L.d, Math.max(0.3, cd - v))); }, 'sin' + o.id), v => v.toFixed(2) + ' s')); }
      g2.appendChild(api.rangeRow('Length', 0.3, Math.max(0.3, Math.min(dur() - o.t0, m ? m.n / 30 - (+o.in || 0) : 60)), 0.05, +o.d, v => api.upd(o.id, L => { L.d = r3(v); }, 'sd' + o.id), v => v.toFixed(1) + ' s'));
      g2.appendChild(api.rangeRow('Starts at', 0, Math.max(0, dur() - 0.3), 0.05, +o.t0, v => api.upd(o.id, L => { L.t0 = r3(v); }, 'st' + o.id), A.fmtT));
      api.soundGrp(box, o, r);
    } else {
      const g = api.grp(box, 'Colour panel'); g.appendChild(api.segRow('Colour', [['accent', 'Brand'], ['ink', 'Ink'], ['paper', 'Paper'], ['white', 'White']], o.card || 'accent', v => api.upd(o.id, L => { L.card = v; })));
      g.appendChild(api.rangeRow('Length', 0.3, Math.max(0.3, dur() - o.t0), 0.05, +o.d, v => api.upd(o.id, L => { L.d = r3(v); }, 'sd' + o.id), v => v.toFixed(1) + ' s'));
      g.appendChild(el('p', 'hint', 'Add text from the Text tab and drag it onto this half.'));
    }
    const p = spl(t), gl = api.grp(box, 'Layout');
    gl.appendChild(api.rangeRow('Top half', 20, 80, 1, Math.round(p.ratio * 100), v => setSplit(s => { s.ratio = Math.round(v) / 100; }, 'spr'), v => Math.round(v) + '%'));
    api.acts(gl, [['Swap halves', () => setSplit(s => { s.main = s.main === 'top' ? 'bottom' : 'top'; s.ratio = Math.round((1 - s.ratio) * 100) / 100; })], ['More layout options', () => { ED.panel = 'split'; api.renderPanel(); }]]);
    api.acts(box, [[o.c ? 'Replace footage' : 'Use footage instead', () => { SP.replace = o.id; ED.panel = 'split'; api.renderPanel(); A.toast('Pick the footage on the left.'); }], ['Split at playhead', api.split], ['Duplicate', api.duplicate], ['Delete', api.del, 'danger']]);
  }
  const prev = XT.inspect.layer;
  XT.inspect.layer = (box, o, legacy) => {
    if (o && o.kind === 'seg') { segInsp(box, o); return true; }
    const r = prev ? prev(box, o, legacy) : false;
    if (o && o.cap) {
      const add = () => { try { const tabs = box.querySelector('.itabs'); if (tabs && ED.itab && ED.itab !== 'edit') return; if (box.querySelector('.cp-pos')) return; const live = api.findAny(o.id); if (live) capGroup(box, live); } catch (e) { console.warn('caption position', e); } };
      if (r) add(); else Promise.resolve().then(add);
    }
    return r;
  };
  // a main-track clip, while the screen is split: fill its half or sit whole in it (overrides the track's setting for this clip)
  XT.mainClip = (box, o, r) => {
    const t = TL(); if (!t || !segs(t).length) return; const g = api.grp(box, 'In its half (split screen)'), cur = o.sfit || (r && r.src === 'lib' ? 'fit' : spl(t).mfit);
    g.appendChild(api.segRow('Show it', [['fill', 'Fill the half'], ['fit', 'Whole clip']], cur, v => api.upd(o.id, x => { x.sfit = v; })));
    if (r && r.src === 'lib') g.appendChild(el('p', cur === 'fill' ? 'warn' : 'hint', cur === 'fill' ? 'Fill crops this footage to the half.' : 'Library footage shows whole unless you choose Fill.'));
  };
  // removed footage in a half: say so before export
  XT.checks.push(() => { const t = TL(), bad = segs(t).filter(L => L.c && !NX.META[L.c]).length; return bad ? bad + ' split-screen clip' + (bad > 1 ? 's use' : ' uses') + ' footage that was removed. Export anyway, or replace ' + (bad > 1 ? 'them' : 'it') + ' first.' : ''; });

  // ------------------------------------------------------------------ Home: start a split-screen video
  function startSplit() {
    if (!NX.editor.blank) return; NX.editor.blank(); let n = 0;
    const go = () => { if ((!ED.on || !TL()) && n++ < 100) { setTimeout(go, 60); return; } if (!TL()) return;
      api.change(t => { t.main = []; t.split = defSplit(); }, { noUndo: true });
      ED.panel = 'split'; api.renderPanel(); api.renderInspector();
      A.toast('Split screen: add your main video (a talking head, say) from Media, then pick what plays in the top half here.', 7000); };
    go();
  }
  function intent(box) {
    if (box.querySelector('[data-k="split"]')) return;
    const b = el('button', 'intent'); b.type = 'button'; b.dataset.k = 'split'; const i = el('i');
    i.innerHTML = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M6 12h12"/></svg>';
    b.appendChild(i); b.appendChild(document.createTextNode('Split screen')); b.onclick = startSplit;
    const blank = [...box.children].find(x => /scratch/i.test(x.textContent)); box.insertBefore(b, blank || null);
  }
  (A.HOOK.intents = A.HOOK.intents || []).push(intent);
  const ib = document.getElementById('intents'); if (ib && ib.children.length) intent(ib);

  NX.split = { seamY, segs, addSeg, layAcross, captionsTo, startSplit, setSplit, SP, newSeg, DEF, defSplit, defaultFit, posY, moveY };
})();
