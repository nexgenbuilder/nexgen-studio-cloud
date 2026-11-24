'use strict';
/* NexGen Studio V18: brand pieces in the timeline editor.
   The "Brand" tab adds the brand kit as overlay pieces (engine/kit12.js): logo bar, contact bar, call to action, offer bar,
   corner logo, side ribbon, licence line, split-line label, name & title. Each fills itself from the brand kit.
   "Where it sits": a piece can sit on a spot (top, top half, above / on / below the split line, bottom half, bottom, corners,
   edges). Spots follow the split screen: change the layout and the pieces move with it. Pieces on the same spot at the same
   time stack instead of overlapping. Drag a piece by hand (or move it with Placement) and it stays where you put it.
   Ready-made splits: talking head + B-roll, before / after, brand split: pick the combo, pick the clips, done. */
(() => {
  const X = NX.editor; if (!X || !X.XT || !X.api || !NX.app || typeof K9 === 'undefined' || !K9.BRAND_PIECES) return;
  const A = NX.app, el = A.el, api = X.api, XT = X.XT, ED = X.ED, S = A.S, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), r3 = api.r3;
  const css = document.createElement('style'); css.textContent = `
.bb-frame { width: 100%; display: flex; align-items: center; gap: 12px; text-align: left; padding: 12px; margin-bottom: 8px; }
.bb-frame .bb-mini { flex: none; }
.bb-mini { width: 34px; aspect-ratio: 9 / 16; border-radius: 5px; background: #2a2a33; position: relative; overflow: hidden; }
.bb-mini i { position: absolute; left: 0; right: 0; height: 18%; background: var(--accent); }
.bb-mini i.t { top: 14%; } .bb-mini i.b { bottom: 22%; height: 10%; }
.bb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.bb-grid .ep-btn b { display: block; font-size: 12.5px; }
.bb-dia { position: relative; width: 132px; aspect-ratio: 9 / 16; border-radius: 10px; overflow: hidden; background: #15151c; flex: none; }
.bb-dia .h { position: absolute; left: 0; right: 0; }
.bb-dia .h.t { background: #2f8c86; } .bb-dia .h.b { background: #5b4bd0; }
.bb-dia .sl { position: absolute; left: 0; right: 0; height: 2px; background: rgba(255,255,255,.85); }
.bb-dia .sz { position: absolute; left: 0; right: 0; background: rgba(0,0,0,.35); }
.bb-dia button { position: absolute; width: 16px; height: 16px; margin: -8px 0 0 -8px; border-radius: 50%; border: 2px solid #fff; background: rgba(0,0,0,.45); padding: 0; cursor: pointer; }
.bb-dia button:hover { background: var(--accent); }
.bb-dia button[aria-pressed="true"] { background: var(--accent); box-shadow: 0 0 0 3px rgba(255,255,255,.45); }
.bb-place { display: flex; gap: 12px; align-items: flex-start; }
.bb-place .bb-side { flex: 1; min-width: 0; font-size: 12px; color: var(--mute); }
.bb-place .bb-side b { display: block; font-size: 13px; color: var(--fg); margin-bottom: 4px; }
.bb-spots { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.bb-spots button { border: 1px solid var(--line); background: var(--raise); border-radius: 6px; padding: 4px 7px; font-size: 11px; font-weight: 600; color: var(--mute); }
.bb-spots button[aria-pressed="true"] { border-color: var(--accent); color: var(--fg); box-shadow: 0 0 0 1px var(--accent); }
.bb-combo { width: 100%; text-align: left; margin-bottom: 8px; }
.bb-pick .ep-clip[aria-pressed="true"] { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }
.bb-pick .ep-clip .n { position: absolute; left: 5px; top: 5px; min-width: 20px; height: 20px; border-radius: 10px; background: var(--accent); color: #fff; font: 700 11px/20px var(--f-ui); text-align: center; padding: 0 5px; }
.bb-step { font-size: 12.5px; font-weight: 650; margin: 14px 0 6px; }
`; document.head.appendChild(css);

  const TL = () => api.TL(), dur = () => Math.max(0.5, S.dur);
  // ------------------------------------------------------------------ spots and the split's geometry
  const SPOTS = [['top', 'Top'], ['tl', 'Top left'], ['tr', 'Top right'], ['thm', 'Top half'], ['above', 'Above the line'], ['seam', 'On the line'], ['below', 'Below the line'], ['bhm', 'Bottom half'], ['bottom', 'Bottom'], ['bl', 'Bottom left'], ['br', 'Bottom right'], ['left', 'Left edge'], ['right', 'Right edge']];
  const STACK = { top: 'down', tl: 'down', tr: 'down', bottom: 'up', bl: 'up', br: 'up', above: 'up', below: 'down' }, GROUP = { tl: 'top', tr: 'top', bl: 'bottom', br: 'bottom' };
  const T0 = 280, B0 = 1430;   // keep pieces clear of the app's tabs (top) and its caption and username area (bottom)
  function geo(t) {
    const p = Object.assign({ ratio: 0.5, main: 'bottom', line: 'none' }, (t && t.split) || {}), r = clamp(+p.ratio || 0.5, 0.2, 0.8), g = p.line === 'gap' ? 24 : 0, secTop = p.main !== 'top', share = secTop ? r : 1 - r;
    const secH = Math.round((1920 - 3 * g) * share), mainH = 1920 - 3 * g - secH, topH = secTop ? secH : mainH, botH = secTop ? mainH : secH;
    return { top: [g, g, 1080 - 2 * g, topH], bot: [g, 2 * g + topH, 1080 - 2 * g, botH], seam: g + topH + g / 2, split: !!(t && t.layers.some(L => L.kind === 'seg')) };
  }
  const localBox = L => { try { return L.kind === 'mg' ? K9.box(L) : [-150, -60, 300, 120]; } catch (e) { return [-150, -60, 300, 120]; } };
  const isFull = b => b[2] >= 1000;
  const spotsFor = L => { const b = localBox(L); if (L.type === 'bk_ribbon') return ['left', 'right']; if (isFull(b)) return ['top', 'thm', 'above', 'seam', 'below', 'bhm', 'bottom']; return SPOTS.map(s => s[0]).filter(k => k !== 'left' && k !== 'right'); };
  function spotXY(a, w, h, G) {
    let y = 960;
    if (a === 'top' || a === 'tl' || a === 'tr') y = T0 + h / 2;
    else if (a === 'bottom' || a === 'bl' || a === 'br') y = B0 - h / 2;
    else if (a === 'thm') y = clamp(G.top[1] + G.top[3] / 2, T0 + h / 2, G.seam - h / 2 - 8);
    else if (a === 'bhm') y = clamp(G.bot[1] + G.bot[3] / 2, G.seam + h / 2 + 8, B0 - h / 2);
    else if (a === 'above') y = G.seam - 14 - h / 2;
    else if (a === 'below') y = G.seam + 14 + h / 2;
    else if (a === 'seam') y = G.seam;
    let x = 540;
    if (w < 1000) { if (a === 'tl' || a === 'bl') x = 90 + w / 2; else if (a === 'tr') x = 1020 - w / 2; else if (a === 'br') x = 960 - w / 2; else if (a === 'left') x = w / 2; else if (a === 'right') x = 1080 - w / 2; }
    return [x, y];
  }
  // place every piece that sits on a spot; pieces on the same spot at the same time stack; a piece moved by hand keeps its place
  function follow(t) {
    if (!t || !Array.isArray(t.layers)) return; const G = geo(t), placed = {};
    for (const L of t.layers) {
      if (!L.anc) continue;
      if (L.ay !== undefined && (Math.abs((+L.y || 0) - L.ay) > 2 || Math.abs((+L.x || 0) - L.ax) > 2)) { delete L.anc; delete L.ax; delete L.ay; continue; }
      const b = localBox(L), w = b[2], h = b[3]; let [x, y] = spotXY(L.anc, w, h, G);
      const dir = STACK[L.anc]; if (dir) { const key = GROUP[L.anc] || L.anc, list = placed[key] || (placed[key] = []), x0 = x - w / 2, x1 = x + w / 2; let off = 0;   // stack only on pieces that would overlap (same time, same side)
        for (const o of list) if (o.t0 < L.t0 + L.d - 1e-3 && L.t0 < o.t1 - 1e-3 && o.x0 < x1 - 4 && x0 < o.x1 - 4) off = Math.max(off, o.off + o.h + 14); y += dir === 'down' ? off : -off; list.push({ t0: L.t0, t1: L.t0 + L.d, h, x0, x1, off }); }
      L.x = Math.round(x - (b[0] + w / 2)); L.y = Math.round(y - (b[1] + h / 2)); L.ax = L.x; L.ay = L.y;
    }
  }
  const ed0 = A.edited;   // every edit (layout, timing, deletes, undo) re-places the pieces on spots before the frame redraws
  A.edited = function () { try { if (ED.on && S.proj && S.proj.tpl === 'free') follow(TL()); } catch (e) { console.warn('brand spots', e); } return ed0.apply(this, arguments); };

  // ------------------------------------------------------------------ adding pieces
  const STAY = new Set(['bk_logobar', 'bk_corner', 'bk_ribbon', 'bk_licence', 'bk_seam']);
  const SPOT0 = { bk_logobar: 'top', bk_contact: 'bottom', cta: 'bottom', bk_offer: 'above', bk_corner: 'tr', bk_ribbon: 'left', bk_licence: 'bottom', bk_seam: 'seam', lower: 'bottom' };
  const NAMES = { cta: 'Call to action', lower: 'Name & title' };
  const nameOf = id => NAMES[id] || (K9.EL[id] || {}).name || id;
  function piece(id, o) { const e = K9.EL[id]; return Object.assign({ kind: 'mg', type: id, x: 540, y: 960, anc: SPOT0[id] || 'bottom' }, STAY.has(id) ? { t0: 0, d: r3(dur()) } : api.layerTimes(e ? e.d : 4), o || {}); }
  function addPiece(id) { api.addLayer(piece(id)); A.toast(nameOf(id) + ' added. Pick where it sits on the right; it follows the split if you change it.', 4200); }
  function brandFrame() {
    const g = api.uid(), a = piece('bk_logobar', { grp: g, gname: 'Brand frame', t0: 0, d: r3(dur()) }), b = piece('bk_contact', { grp: g, gname: 'Brand frame', t0: 0, d: r3(dur()) });
    a.id = api.uid(); b.id = api.uid();
    api.change(t => { t.layers.push(a, b); }); ED.sel = a.id; ED.multi.clear(); api.renderInspector(); api.renderPanel();
    A.toast('Brand frame added: your logo on top and your phone and website at the bottom, for the whole video.', 4600);
  }

  // ------------------------------------------------------------------ ready-made splits
  const COMBOS = [
    { id: 'talk', name: 'Talking head + B-roll', desc: 'You talking in the bottom half, footage cycling on top, captions on the line, your logo in the corner and your contact details at the end.',
      split: { ratio: 0.5, main: 'bottom', line: 'bar', lc: 'accent' }, mainLab: 'You talking (bottom half)', topLab: 'Footage for the top half · tick one or more', many: true, cap: 'seam',
      pieces: D => [['bk_corner', { anc: 'tr', t0: 0, d: D }], ['bk_contact', { anc: 'bottom', t0: Math.max(0, D - 4), d: Math.min(4, D), band: 'glass' }]] },
    { id: 'ba', name: 'Before / after', desc: 'The before clip on top, the after clip below, BEFORE and AFTER labels on the line, and your contact details at the end.',
      split: { ratio: 0.5, main: 'bottom', line: 'none', lc: 'white' }, mainLab: 'The after clip (bottom half)', topLab: 'The before clip (top half)', many: false,
      pieces: D => [['bk_seam', { anc: 'seam', style: 'pair', text: 'BEFORE', text2: 'AFTER', t0: 0, d: D }], ['bk_contact', { anc: 'bottom', t0: Math.max(0, D - 3), d: Math.min(3, D), band: 'glass' }]] },
    { id: 'frame', name: 'Brand split', desc: 'Two halves framed in your brand colour, your name on the line and your phone and website along the bottom the whole time.',
      split: { ratio: 0.5, main: 'bottom', line: 'gap', lc: 'accent' }, mainLab: 'Main video (bottom half)', topLab: 'Footage for the top half · tick one or more', many: true, cap: 'seam',
      pieces: D => [['bk_seam', { anc: 'seam', style: 'pill', tone: 'ink', t0: 0, d: D }], ['bk_contact', { anc: 'bottom', t0: 0, d: D, band: 'brand' }]] },
  ];
  const BP = { combo: null, main: null, top: [] };
  function openCombo(id) { const t = TL(); BP.combo = id; BP.top = []; BP.main = t && t.main.some(m => m.type === 'clip') ? 'keep' : null; ED.panel = 'brand'; api.renderPanel(); }
  function makeCombo() {
    const C = COMBOS.find(c => c.id === BP.combo), t = TL(); if (!C || !t) return;
    const mainR = BP.main && BP.main !== 'keep' ? NX.CLIPS.get(BP.main) : null, rows = BP.top.map(id => NX.CLIPS.get(id)).filter(Boolean);
    if ((!mainR && BP.main !== 'keep') || !rows.length) { A.toast('Pick the clips for both halves first.'); return; }
    const f = api.F(), D = r3(mainR ? Math.min(60, mainR.dur) : Math.max(0.5, f ? f.DUR : dur()));
    const voice = mainR ? !!mainR.audio : t.main.some(m => m.type === 'clip' && m.sound !== false && (NX.CLIPS.get(m.c) || {}).audio);
    const segs = [];
    if (!C.many) { const r = rows[0], L = NX.split.newSeg(r, 0, D, t); L.in = 0; L.d = D; L.id = api.uid(); if (r.audio && voice) L.sound = false; segs.push(L); }
    else { const per = D / rows.length; let at = 0, i = 0; while (at < D - 0.25 && i < 80) { const r = rows[i % rows.length], inn = r.dur > per + 1.2 ? 0.5 : 0, d = Math.max(0.5, Math.min(per, r.dur - inn, D - at)); const L = NX.split.newSeg(r, at, d, t); L.in = inn; L.id = api.uid(); if (r.audio && voice) L.sound = false; segs.push(L); at += d; i++; } }
    const pcs = C.pieces(D).map(([id, o]) => Object.assign(piece(id, o), { id: api.uid(), combo: C.id }));
    api.change(tl => {
      if (mainR) tl.main = [{ id: api.uid(), type: 'clip', c: mainR.id, in: 0, d: D, layout: 'fit', pos: 'center' }];
      tl.split = Object.assign(NX.split.defSplit(), C.split);
      tl.layers = tl.layers.filter(L => L.kind !== 'seg' && !L.combo).concat(segs, pcs);
      if (C.cap) { tl.capPos = C.cap; const y = NX.split.posY(C.cap, tl); for (const L of tl.layers) if (L.cap) NX.split.moveY(L, y); }
    });
    BP.combo = null; ED.sel = segs[0] ? segs[0].id : null; ED.multi.clear(); api.renderPanel(); api.renderInspector();
    A.toast(C.name + ' ready: ' + segs.length + ' clip' + (segs.length > 1 ? 's' : '') + ' in the top half, brand pieces placed. Add captions from Text and they land on the line.', 6000);
  }
  function clipGrid(box, sel, many, onPick) {
    const g = el('div', 'ep-media bb-pick'); box.appendChild(g);
    for (const r of NX.brandClips().sort((x, y) => (x.src === 'lib') - (y.src === 'lib'))) {
      const b = el('div', 'ep-clip'); b.tabIndex = 0; b.setAttribute('role', 'button'); b.title = r.name; const k = many ? sel.indexOf(r.id) : (sel === r.id ? 0 : -1); b.setAttribute('aria-pressed', String(k >= 0));
      const fi = el('div', 'fi'), im = el('img'); im.alt = ''; im.loading = 'lazy'; if (r.poster) im.src = r.poster; fi.appendChild(im); b.appendChild(fi);
      const fn = el('div', 'fn', r.name); fn.appendChild(el('small', '', (r.still ? 'photo' : (r.kind === 'vert' ? '9:16' : '16:9') + ' · ' + r.dur.toFixed(0) + ' s') + (r.audio ? ' · ♪' : ''))); b.appendChild(fn);
      if (many && k >= 0) b.appendChild(el('span', 'n', String(k + 1)));
      b.onclick = () => onPick(r); b.onkeydown = e => { if (e.key === 'Enter') onPick(r); }; g.appendChild(b);
    }
  }
  function comboPanel(box, h) {
    const C = COMBOS.find(c => c.id === BP.combo), t = TL();
    const back = el('button', 'btn sm ghost', '← Brand'); back.type = 'button'; back.onclick = () => { BP.combo = null; api.renderPanel(); }; box.appendChild(back);
    h.sec(C.name); h.note(C.desc);
    box.appendChild(el('div', 'bb-step', '1 · ' + C.mainLab));
    const hasMain = t.main.some(m => m.type === 'clip');
    if (hasMain) box.appendChild(api.segRow('', [['keep', 'Keep my main track'], ['pick', 'Pick a clip']], BP.main === 'keep' ? 'keep' : 'pick', v => { BP.main = v === 'keep' ? 'keep' : null; api.renderPanel(); }));
    if (!hasMain || BP.main !== 'keep') clipGrid(box, BP.main, false, r => { BP.main = r.id; api.renderPanel(); });
    box.appendChild(el('div', 'bb-step', '2 · ' + C.topLab));
    clipGrid(box, BP.top, C.many, r => { if (C.many) { const i = BP.top.indexOf(r.id); if (i >= 0) BP.top.splice(i, 1); else BP.top.push(r.id); } else BP.top = [r.id]; api.renderPanel(); });
    const ok = (BP.main === 'keep' || BP.main) && BP.top.length, row = el('div', 'sp-row'), go = el('button', 'btn sm primary', 'Make it'); go.type = 'button'; go.disabled = !ok; go.onclick = makeCombo; row.appendChild(go);
    const up = el('button', 'btn sm', '+ Upload'); up.type = 'button'; up.onclick = A.pickFiles; row.appendChild(up); box.appendChild(row);
    if (t.layers.some(L => L.kind === 'seg' || L.combo)) h.note('Making it replaces the clips in the top half and any earlier ready-made pieces. Your captions and other layers stay.');
  }

  // ------------------------------------------------------------------ the Brand tab
  XT.tabs.push(['brand', 'Brand', 'split']);
  XT.panels.brand = (box, h) => {
    if (BP.combo) { comboPanel(box, h); return; }
    h.sec('Brand');
    h.note('Your logo, contact details and offers, filled in from the brand kit. Tap one to add it, then pick where it sits. Pieces on a spot follow the split screen when you change it.');
    const fr = el('button', 'ep-btn bb-frame'); fr.type = 'button'; const mini = el('span', 'bb-mini'); mini.appendChild(el('i', 't')); mini.appendChild(el('i', 'b')); fr.appendChild(mini);
    const tx = el('span'); tx.appendChild(el('b', '', 'Brand frame')); tx.appendChild(el('small', '', 'Logo bar on top, phone and website at the bottom, for the whole video')); fr.appendChild(tx); fr.onclick = brandFrame; box.appendChild(fr);
    h.sec('Pieces');
    const g = el('div', 'bb-grid'); box.appendChild(g);
    for (const id of K9.BRAND_PIECES) { const e = K9.EL[id]; if (!e) continue; if (id === 'bk_offer' && !K9.allowed('discount')) continue;
      const b = el('button', 'ep-btn'); b.type = 'button'; b.appendChild(el('b', '', nameOf(id))); b.appendChild(el('small', '', id === 'bk_licence' && !CONTACT.lic ? 'Add a licence in the brand kit' : STAY.has(id) ? 'whole video' : 'at the playhead')); b.title = e.desc; b.onclick = () => addPiece(id); g.appendChild(b); }
    if (!K9.allowed('discount')) h.note('Offer bars are off for this brand (brand kit rules).');
    h.sec('Ready-made splits');
    for (const C of COMBOS) { const b = el('button', 'ep-btn bb-combo'); b.type = 'button'; b.appendChild(el('b', '', C.name)); b.appendChild(el('small', '', C.desc)); b.onclick = () => openCombo(C.id); box.appendChild(b); }
    h.sec('Brand kit');
    h.note('Change the logo, colours, phone or website in the brand kit and every piece updates.');
    const kr = el('div', 'sp-row'), kb = el('button', 'btn sm', 'Edit the brand kit'); kb.type = 'button'; kb.onclick = () => { const n = document.getElementById('navBrand'); if (n && n.onclick) n.onclick(); }; kr.appendChild(kb); box.appendChild(kr);
  };

  // ------------------------------------------------------------------ "Where it sits" in the inspector
  const DS = 132 / 1080;
  function spotGroup(box, o) {
    const t = TL(), G = geo(t), b = localBox(o), allowed = spotsFor(o), g = api.grp(box, 'Where it sits'), wrap = el('div', 'bb-place'), dia = el('div', 'bb-dia');
    const half = (cls, r) => { const d = el('div', 'h ' + cls); d.style.top = (r[1] * DS) + 'px'; d.style.height = (r[3] * DS) + 'px'; d.style.left = (r[0] * DS) + 'px'; d.style.right = (r[0] * DS) + 'px'; dia.appendChild(d); };
    if (G.split || t.split) { half('t', G.top); half('b', G.bot); const sl = el('div', 'sl'); sl.style.top = (G.seam * DS - 1) + 'px'; dia.appendChild(sl); }
    const sa = el('div', 'sz'); sa.style.top = '0'; sa.style.height = (250 * DS) + 'px'; dia.appendChild(sa); const sb = el('div', 'sz'); sb.style.bottom = '0'; sb.style.height = ((1920 - 1440) * DS) + 'px'; dia.appendChild(sb);
    const set = k => { api.upd(o.id, L => { L.anc = k; delete L.ax; delete L.ay; }); api.renderInspector(); if (api.drawOv) api.drawOv(); };
    for (const k of allowed) { let [x, y] = spotXY(k, b[2], b[3], G); if (k === 'above') y = Math.min(y, G.seam - 110); if (k === 'below') y = Math.max(y, G.seam + 110); if (k === 'thm') y = clamp(G.top[1] + G.top[3] / 2, 360, G.seam - 120); if (k === 'bhm') y = clamp(G.bot[1] + G.bot[3] / 2, G.seam + 120, 1290);   // dots spread out enough to tap
      const btn = el('button'); btn.type = 'button'; const nm = (SPOTS.find(s => s[0] === k) || [0, k])[1]; btn.title = nm; btn.setAttribute('aria-label', 'Sit ' + nm.toLowerCase()); btn.setAttribute('aria-pressed', String(o.anc === k));
      btn.style.left = (x * DS) + 'px'; btn.style.top = (y * DS) + 'px'; btn.onclick = () => set(k); dia.appendChild(btn); }
    wrap.appendChild(dia);
    const side = el('div', 'bb-side'), cur = SPOTS.find(s => s[0] === o.anc);
    side.appendChild(el('b', '', cur ? cur[1] : 'Where you put it'));
    side.appendChild(document.createTextNode(cur ? (t.split ? 'Follows the split: change the layout and it moves with it.' : 'Add a split and the halves and line spots follow it.') + ' Drag it on the preview to place it freely.' : 'Placed by hand. Pick a spot to snap it back, and it will follow the split again.'));
    const chips = el('div', 'bb-spots'); for (const k of allowed) { const nm = (SPOTS.find(s => s[0] === k) || [0, k])[1], c = el('button', '', nm); c.type = 'button'; c.setAttribute('aria-pressed', String(o.anc === k)); c.onclick = () => set(k); chips.appendChild(c); }
    side.appendChild(chips); wrap.appendChild(side); g.appendChild(wrap);
    const first = box.querySelector('.grp'); if (first && first !== g) first.before(g);   // at the top of the piece's settings
  }
  const prev = XT.inspect.layer;
  XT.inspect.layer = (box, o, legacy) => {
    const r = prev ? prev(box, o, legacy) : false;
    if (o && o.kind === 'mg' && K9.BRAND_PIECES.includes(o.type)) {
      const add = () => { try { const tabs = box.querySelector('.itabs'); if (tabs && ED.itab && ED.itab !== 'edit') return; if (box.querySelector('.bb-place')) return; const live = api.findAny(o.id); if (live) spotGroup(box, live); } catch (e) { console.warn('brand spot', e); } };
      if (r) add(); else Promise.resolve().then(add);
    }
    return r;
  };

  NX.brandbar = { follow, geo, spotXY, addPiece, brandFrame, openCombo, makeCombo, COMBOS, BP, SPOTS, piece };
})();
