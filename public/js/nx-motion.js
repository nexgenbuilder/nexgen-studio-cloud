'use strict';
/* NexGen Studio V10: motion design in the editor. Adds to nx-editor.js through its extension points:
   - Text panel: the typography style gallery (engine K8.STYLES) above the classic styles
   - Graphics panel: the motion graphics library (engine K9) with search and categories, plus the brand stickers
   - Layer inspector in tabs: Edit (basic) · Style (effects) · Animate (entrance, exit, loop, motion presets) · Keyframes (advanced)
   - Multi-select actions, copy / paste animation. Everything edits the project's tl, which the engine renders for preview and export. */
(() => {
const X = NX.editor, A = NX.app, api = X.api, ED = X.ED, el = A.el, S = A.S, fmtT = A.fmtT, clone = A.clone, XT = X.XT;
const { TL, F, change, upd, select, findAny, renderPanel, renderInspector, addLayer, layerTimes, uid, r3, rangeRow, segRow, textRow, selRow, grp, head, acts, timing } = api;

const CSS = `
.mx-chips { display: flex; flex-wrap: wrap; gap: 5px; margin: 0 0 10px; }
.mx-chips button { background: var(--well); border: 1px solid var(--line2); border-radius: 99px; padding: 5px 10px; font: 600 11.5px/1 var(--f-ui); color: var(--mute); }
.mx-chips button[aria-pressed="true"] { color: var(--fg); border-color: var(--accent); background: var(--accent-soft); }
.mx-search { width: 100%; box-sizing: border-box; background: var(--well); border: 1px solid var(--line2); border-radius: 8px; padding: 8px 10px; color: var(--fg); font: 500 13px var(--f-ui); margin: 0 0 8px; }
.mx-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.mx-tile { position: relative; display: block; background: var(--raise); border: 1px solid var(--line); border-radius: 9px; padding: 0; overflow: hidden; text-align: left; color: var(--fg); min-width: 0; }
.mx-tile:hover, .mx-tile:focus-visible { border-color: var(--accent); }
.mx-tile .pv { display: grid; place-items: center; aspect-ratio: 4 / 3; background: #15151B center / cover no-repeat; overflow: hidden; color: #fff; font: 900 18px/1 Mont, sans-serif; text-align: center; padding: 4px; }
.mx-tile b { display: block; padding: 6px 8px 0; font: 700 11.5px/1.25 var(--f-ui); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mx-tile small { display: block; padding: 2px 8px 7px; font: 500 10px/1.3 var(--f-mono); color: var(--dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mx-tile .fav { position: absolute; right: 5px; top: 5px; width: 24px; height: 24px; border-radius: 50%; border: 0; background: rgba(0,0,0,.55); color: #fff; font-size: 13px; line-height: 24px; padding: 0; }
.mx-tile .fav[aria-pressed="true"] { color: #FFC857; }
.mx-add { width: 100%; margin: 0 0 10px; }
.itabs { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 3px; margin: 0 0 12px; background: var(--well); border: 1px solid var(--line); border-radius: 9px; padding: 3px; }
.itabs button { background: transparent; border: 0; border-radius: 6px; padding: 7px 2px; font: 700 11px/1 var(--f-ui); color: var(--dim); }
.itabs button[aria-selected="true"] { background: var(--raise); color: var(--fg); box-shadow: 0 1px 2px rgba(0,0,0,.25); }
.colrow { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
.colrow button { width: 30px; height: 30px; border-radius: 7px; border: 2px solid transparent; padding: 0; box-shadow: inset 0 0 0 1px rgba(255,255,255,.18); }
.colrow button[aria-pressed="true"] { border-color: var(--accent); }
.colrow input[type=color] { width: 36px; height: 30px; padding: 0; border: 1px solid var(--line2); border-radius: 7px; background: var(--well); }
.kf-row { border-top: 1px solid var(--line); padding: 8px 0; }
.kf-row:first-of-type { border-top: 0; }
.kf-top { display: flex; align-items: center; gap: 6px; }
.kf-top .nm { font: 700 12px/1.2 var(--f-ui); flex: 1; min-width: 0; }
.kf-top .val { font: 600 11px/1 var(--f-mono); color: var(--mute); min-width: 50px; text-align: right; }
.kf-dia { width: 26px; height: 26px; border: 0; background: transparent; padding: 0; position: relative; }
.kf-dia::before { content: ""; position: absolute; left: 7px; top: 7px; width: 11px; height: 11px; transform: rotate(45deg); border: 2px solid var(--mute); border-radius: 2px; }
.kf-dia.has::before { border-color: var(--accent); }
.kf-dia.on::before { background: var(--accent); border-color: var(--accent); }
.kf-nav { border: 0; background: transparent; color: var(--mute); font: 700 14px/1 var(--f-ui); padding: 2px 4px; }
.kf-nav:disabled { opacity: .3; }
.kf-row input[type=range] { width: 100%; accent-color: var(--accent); margin: 6px 0 0; }
.kf-keys { display: flex; flex-direction: column; gap: 4px; margin-top: 6px; }
.kf-key { display: grid; grid-template-columns: 64px 1fr auto; gap: 6px; align-items: center; font: 600 11px/1 var(--f-mono); color: var(--mute); }
.kf-key input[type=number] { width: 100%; box-sizing: border-box; background: var(--well); border: 1px solid var(--line2); border-radius: 5px; color: var(--fg); padding: 4px; font: 600 11px var(--f-mono); }
.kf-key select { min-width: 0; font-size: 11px; padding: 3px; }
.kf-key .x { border: 0; background: transparent; color: var(--dim); font-size: 15px; padding: 0 4px; }
.bz { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-top: 4px; }
.bz input { width: 100%; box-sizing: border-box; background: var(--well); border: 1px solid var(--line2); border-radius: 5px; color: var(--fg); padding: 4px; font: 600 11px var(--f-mono); }
.mx-motions { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
.mx-motions button { background: var(--well); border: 1px solid var(--line2); border-radius: 7px; padding: 7px 8px; font: 600 11.5px/1.2 var(--f-ui); color: var(--fg); text-align: left; }
.mx-motions button:hover { border-color: var(--accent); }
.mx-sub { font: 700 10px/1 var(--f-mono); letter-spacing: .14em; text-transform: uppercase; color: var(--dim); margin: 12px 0 6px; }
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: CSS }));

// ------------------------------------------------------------------ shared bits
const tile = (kind, id, title, sub, fn, fallback) => {
  const b = el('button', 'mx-tile'); b.type = 'button'; b.title = title + (sub ? ' — ' + sub : ''); const pv = el('span', 'pv'); b.appendChild(pv); b.appendChild(el('b', '', title)); if (sub) b.appendChild(el('small', '', sub));
  if (NX.PV && NX.PV.attach) NX.PV.attach(pv, kind, id, fallback); else if (fallback) fallback(pv);
  if (NX.CLIB && NX.CLIB.favBtn) b.appendChild(NX.CLIB.favBtn(kind, id));
  b.onclick = e => { if (e.target.closest('.fav')) return; fn(); if (NX.CLIB && NX.CLIB.recent) NX.CLIB.recent(kind, id); }; return b;
};
const chips = (box, list, cur, on) => { const w = el('div', 'mx-chips'); for (const [k, n] of list) { const b = el('button', '', n); b.type = 'button'; b.setAttribute('aria-pressed', String(cur === k)); b.onclick = () => on(k); w.appendChild(b); } box.appendChild(w); return w; };
const curClip = () => { const f = F(); if (f && f.M.length) { const it = f.M[f.at(Math.min(S.t, S.dur - 0.01))]; if (it && it.type === 'clip' && !it.missing) return it.c; } const r = NX.brandClips()[0]; return r ? r.id : null; };
const TOK = () => [['white', 'White', WHT], ['accent', 'Accent', OR], ['accent2', 'Accent 2', ACC2], ['ink', 'Ink', BLK], ['paper', 'Paper', PAPER]];
function colorRow(label, val, on) {
  const w = el('div', 'fld'); w.appendChild(el('span', 'lab', label)); const r = el('div', 'colrow'); const isHex = typeof val === 'string' && val.startsWith('#');
  for (const [k, n, c] of TOK()) { const b = el('button'); b.type = 'button'; b.title = n; b.setAttribute('aria-label', n); b.style.background = c; b.setAttribute('aria-pressed', String(val === k)); b.onclick = () => on(k); r.appendChild(b); }
  const ci = el('input'); ci.type = 'color'; ci.title = 'Custom colour'; ci.setAttribute('aria-label', label + ': custom colour'); ci.value = isHex ? val : K8.col(val || 'white'); ci.oninput = () => on(ci.value); r.appendChild(ci); w.appendChild(r); return w;
}
const IGNORE = new Set();
// ------------------------------------------------------------------ adding
function addType(P) {
  const L = Object.assign({ kind: 'text', style: 'type', x: 540, y: 960 }, clone(P ? P.L : { slot: 'Mont', wt: 900, size: 120, color: 'white', fx: { shadow: 'soft' }, anim: { in: 'rise', out: 'fade' } }), { text: P ? (P.addText || P.text) : 'YOUR TEXT' }, layerTimes(3));
  if (L.fx && L.fx.fill === 'footage') { const c = curClip(); if (c) L.fx.clip = c; }
  if (L.font) NX.useFont(L.font).then(() => A.refresh(true));
  addLayer(L);
}
function restyle(id, P) { upd(id, x => { const keep = { text: x.text, x: x.x, y: x.y, t0: x.t0, d: x.d, kf: x.kf, rot: x.rot, sx: x.sx, sy: x.sy, opacity: x.opacity }; for (const k of Object.keys(x)) if (!['id', 'kind', 'style'].includes(k)) delete x[k]; Object.assign(x, clone(P.L), keep);
  for (const k of Object.keys(keep)) if (keep[k] === undefined) delete x[k]; if (x.fx && x.fx.fill === 'footage' && !x.fx.clip) { const c = curClip(); if (c) x.fx.clip = c; } }); }
const Y_DEF = { lower: 1500, cta: 1480, handle: 1500, follow: 1500, swipe: 1560, story: 110, ticker: 1700, limited: 1620, likes: 1500, tap: 1100, caption: 1450, countdown: 820, price: 900, pricetag: 900, review: 1150, comment: 1250, divider: 1300, numlabel: 520, masthead: 420, discount: 640, burst: 640, sticker: 620 };
function addMg(id) { const e = K9.EL[id]; if (!e) return; const L = Object.assign({ kind: 'mg', type: id, x: 540, y: e.full ? 960 : (Y_DEF[id] || 960) }, layerTimes(e.d)); addLayer(L); }
api.addType = addType; api.addMg = addMg;

// ------------------------------------------------------------------ Text panel: the style gallery
const TCATS = [['all', 'All'], ['Headline', 'Headline'], ['Kinetic', 'Kinetic'], ['Effects', 'Effects'], ['Elegant', 'Elegant'], ['Text', 'Captions'], ['Shapes', 'Shapes']];
XT.textTop = (box, h) => {
  const sel = findAny(ED.sel), canRestyle = sel && sel.kind === 'text' && sel.style === 'type';
  const add = el('button', 'btn mx-add', '+ Add text'); add.type = 'button'; add.onclick = () => addType(null); box.appendChild(add);
  if (canRestyle) chips(box, [['add', 'Click adds new text'], ['restyle', 'Click restyles the selected text']], ED.styleMode || 'add', k => { ED.styleMode = k; renderPanel(); });
  h.sec('Animated text styles'); h.note('Every style uses your brand fonts and colours. Change the font, effects and animation in the panel on the right.');
  chips(box, TCATS, ED.tcat || 'all', k => { ED.tcat = k; renderPanel(); });
  const g = el('div', 'mx-grid'); box.appendChild(g);
  for (const P of K8.STYLES) { if (ED.tcat && ED.tcat !== 'all' && P.cat !== ED.tcat) continue;
    g.appendChild(tile('style', P.id, P.name, P.cat, () => (canRestyle && ED.styleMode === 'restyle' ? restyle(sel.id, P) : addType(P)), pv => { pv.textContent = P.text.split('\n')[0].slice(0, 14); pv.style.fontFamily = { Mont: 'Mont', Bebas: 'Bebas', Corm: 'Corm', Hand: 'Hand', Mono: 'Mono' }[P.L.slot] || 'Mont'; pv.style.color = K8.col(P.L.color || 'white'); })); }
};
// ------------------------------------------------------------------ Graphics panel
XT.panels.graphics = (box, h) => {
  const q = el('input', 'mx-search'); q.type = 'search'; q.placeholder = 'Search graphics: price, map, review…'; q.setAttribute('aria-label', 'Search graphics'); q.value = ED.gq || ''; box.appendChild(q);
  const cats = [['all', 'All']].concat(K9.CATS).concat([['brand', 'Brand stickers']]);
  chips(box, cats, ED.gcat || 'all', k => { ED.gcat = k; renderPanel(); });
  const g = el('div', 'mx-grid'); box.appendChild(g); const extra = el('div'); box.appendChild(extra);
  let off = 0; const paint = () => { off = 0; g.textContent = ''; extra.textContent = ''; const term = (ED.gq || '').toLowerCase().trim(), cat = ED.gcat || 'all';
    if (cat !== 'brand') for (const id of K9.ORDER) { const e = K9.EL[id]; if (cat !== 'all' && e.cat !== cat) continue; if (term && !(e.name + ' ' + e.desc + ' ' + e.cat).toLowerCase().includes(term)) continue;
      if (!K9.allowed(id)) { off++; continue; }
      g.appendChild(tile('mg', id, e.name, (K9.CATS.find(c => c[0] === e.cat) || [0, ''])[1], () => addMg(id), pv => { pv.textContent = e.name; pv.style.font = '800 13px/1.15 Mont, sans-serif'; })); }
    if (!g.children.length && cat !== 'brand') g.appendChild(el('p', 'ep-note', 'Nothing matches. Try another word.'));
    if (cat === 'all' || cat === 'brand') { h.sec.call(null, 'Brand stickers'); extra.appendChild(box.lastChild); api.stickerGrid(extra, s => extra.appendChild(el('p', 'ep-note', s)), h.btn); } };
  q.oninput = () => { ED.gq = q.value; paint(); }; paint();
  if (off) box.appendChild(el('p', 'ep-note', A.B().builtin ? 'Price, offer, sale, rating and typed-review graphics are off for DPG. Use the classic Review quote for DPG’s published reviews.' : 'Some graphics are hidden by this brand kit’s rules (prices or star ratings). Change the rules in the brand kit to use them.'));
};

// ------------------------------------------------------------------ inspector
const TABS = { type: [['edit', 'Edit'], ['style', 'Style'], ['anim', 'Animate'], ['keys', 'Keyframes']], mg: [['edit', 'Edit'], ['anim', 'Animate'], ['keys', 'Keyframes']], legacy: [['edit', 'Edit'], ['anim', 'Animate'], ['keys', 'Keyframes']] };
XT.inspect.layer = (box, o, legacy) => {
  const kind = o.kind === 'text' && o.style === 'type' ? 'type' : o.kind === 'mg' ? 'mg' : 'legacy', tabs = TABS[kind];
  if (!tabs.some(t => t[0] === ED.itab)) ED.itab = 'edit';
  const title = kind === 'type' ? 'Text' : kind === 'mg' ? (K9.EL[o.type] || { name: o.type }).name : o.kind === 'gif' ? 'GIF' : o.kind === 'pip' ? 'Picture-in-picture' : o.kind === 'text' ? ((api.TEXTS.find(x => x.style === o.style) || {}).name || 'Text') : ((api.STICKERS.find(x => x.type === o.type) || {}).name || 'Sticker');
  head(box, title, fmtT(o.t0) + ' to ' + fmtT(o.t0 + o.d) + (K8.hasKf(o) ? ' · keyframed' : ''));
  const tb = el('div', 'itabs'); tb.setAttribute('role', 'tablist'); box.appendChild(tb);
  for (const [k, n] of tabs) { const b = el('button', '', n); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(ED.itab === k)); b.onclick = () => { ED.itab = k; renderInspector(); }; tb.appendChild(b); }
  const body = el('div'); box.appendChild(body);
  if (ED.itab === 'edit') { if (kind === 'type') typeEdit(body, o); else if (kind === 'mg') mgEdit(body, o); else { legacy(body, o, { noHead: true }); transformGrp(body, o); } }
  else if (ED.itab === 'style') typeStyle(body, o);
  else if (ED.itab === 'anim') animTab(body, o, kind);
  else keysTab(body, o, kind);
  if (ED.itab !== 'edit' || kind !== 'legacy') { const a = [['Duplicate', api.duplicate], ...api.layerOrderActs(), ['Delete', api.del, 'danger']]; if (NX.CLIB && NX.CLIB.savePreset && kind !== 'legacy') a.unshift(['Save as preset', () => NX.CLIB.savePreset(o)]); acts(box, a); }
  return true;
};
function transformGrp(box, o) {
  const g = grp(box, 'Transform');
  g.appendChild(rangeRow('Rotation', -180, 180, 1, o.rot || 0, v => upd(o.id, x => { if (v) x.rot = v; else delete x.rot; }, 'rot'), v => Math.round(v) + '°'));
  if (o.kind !== 'text' || o.style === 'type') g.appendChild(rangeRow('Scale', 0.2, 4, 0.01, o.sx || 1, v => upd(o.id, x => { const f = v / (x.sx || 1); x.sx = v; x.sy = Math.round((x.sy || 1) * f * 1000) / 1000; }, 'sc'), v => Math.round(v * 100) + '%'));
  g.appendChild(rangeRow('Opacity', 0, 1, 0.01, o.opacity === undefined ? 1 : o.opacity, v => upd(o.id, x => { if (v >= 1) delete x.opacity; else x.opacity = v; }, 'op'), v => Math.round(v * 100) + '%'));
}
// ---------------- type: edit
function fontSelect(o) {
  const w = el('div', 'fld'), id = 'mx-' + A.uid8(), lab = el('label', '', 'Font'); lab.htmlFor = id; w.appendChild(lab); const s = el('select'); s.id = id;
  const og0 = el('optgroup'); og0.label = 'Brand fonts'; [['Mont', 'Headline (brand)'], ['Bebas', 'Display (brand)'], ['Corm', 'Serif (brand)'], ['Hand', 'Script (brand)'], ['Mono', 'Typewriter mono']].forEach(([k, n]) => { const op = el('option', '', n); op.value = 'slot:' + k; og0.appendChild(op); }); s.appendChild(og0);
  const lib = (window.NX && NX.allFontLib) ? NX.allFontLib() : (NX.FONTLIB || {}); for (const [c, n] of Object.entries({ sans: 'Sans', display: 'Display', serif: 'Serif', script: 'Script', mono: 'Mono' })) { const og = el('optgroup'); og.label = n; for (const [k, f] of Object.entries(lib)) if (f.c === c) { const op = el('option', '', f.l); op.value = 'lib:' + k; og.appendChild(op); } s.appendChild(og); }
  s.value = o.font && lib[o.font] ? 'lib:' + o.font : 'slot:' + (o.slot || 'Mont');
  s.onchange = () => { const [t, k] = s.value.split(':'); if (t === 'lib') NX.useFont(k).then(() => upd(o.id, x => { x.font = k; })); else upd(o.id, x => { delete x.font; x.slot = k; }); };
  w.appendChild(s); return w;
}
function typeEdit(box, o) {
  const g = grp(box, 'Text');
  g.appendChild(textRow('Text', o.text, v => upd(o.id, x => { x.text = v; }, 'tx'), { area: true, rows: 3, lint: true, hint: 'Press Enter for a new line.' }));
  if (A.CAP && A.CAP.sample && api.suggest) api.suggest(g, o);
  const g2 = grp(box, 'Type');
  g2.appendChild(fontSelect(o));
  g2.appendChild(selRow('Weight', [[400, 'Regular'], [500, 'Medium'], [600, 'Semibold'], [700, 'Bold'], [800, 'Extra bold'], [900, 'Black']].map(([k, n]) => [String(k), n]), String(K8.fontOf(o).wt), v => upd(o.id, x => { x.wt = +v; })));
  const it = el('label', 'chk'), ii = el('input'); ii.type = 'checkbox'; ii.checked = !!o.ital; ii.onchange = () => upd(o.id, x => { if (ii.checked) x.ital = true; else delete x.ital; }); it.appendChild(ii); it.appendChild(document.createTextNode('Italic')); g2.appendChild(it);
  g2.appendChild(rangeRow('Size', 16, 600, 1, o.size || 110, v => upd(o.id, x => { x.size = v; }, 'sz'), v => v + ' px'));
  g2.appendChild(rangeRow('Tracking', -120, 600, 5, o.track || 0, v => upd(o.id, x => { if (v) x.track = v; else delete x.track; }, 'tr'), v => (v / 1000).toFixed(2) + ' em'));
  g2.appendChild(rangeRow('Line height', 0.6, 2, 0.01, o.lead || 1.08, v => upd(o.id, x => { x.lead = v; }, 'ld'), v => v.toFixed(2)));
  g2.appendChild(segRow('Align', [['left', 'Left'], ['center', 'Centre'], ['right', 'Right']], o.align || 'center', v => upd(o.id, x => { x.align = v; })));
  g2.appendChild(segRow('Case', [['none', 'As typed'], ['upper', 'UPPER'], ['lower', 'lower'], ['title', 'Title']], o.case || 'none', v => upd(o.id, x => { if (v === 'none') delete x.case; else x.case = v; })));
  g2.appendChild(colorRow('Colour', o.color || 'white', v => upd(o.id, x => { x.color = v; }, 'col')));
  const g3 = grp(box, 'Layout');
  g3.appendChild(segRow('Shape', K8.LAYOUTS, o.layout || 'wrap', v => upd(o.id, x => { if (v === 'wrap') delete x.layout; else x.layout = v; })));
  const lay = o.layout || 'wrap';
  if (lay === 'wrap' || lay === 'stack' || lay === 'wave') g3.appendChild(rangeRow(lay === 'stack' ? 'Stack width' : 'Wrap width', 200, 1040, 10, o.w || 900, v => upd(o.id, x => { x.w = v; }, 'w'), v => v + ' px'));
  if (lay === 'arc') g3.appendChild(rangeRow('Curve', -320, 320, 5, o.arc || 140, v => upd(o.id, x => { x.arc = v; }, 'arc'), v => v + '°'));
  if (lay === 'wave') g3.appendChild(rangeRow('Wave', 0, 3, 0.05, o.wamp === undefined ? 1 : o.wamp, v => upd(o.id, x => { x.wamp = v; }, 'wa'), v => v.toFixed(2)));
  g3.appendChild(segRow('Position', [['top', 'Top'], ['mid', 'Middle'], ['low', 'Bottom']], o.y < 760 ? 'top' : o.y > 1200 ? 'low' : 'mid', k => upd(o.id, x => { const ny = k === 'top' ? 470 : k === 'mid' ? 960 : 1480, dy = ny - x.y; x.x = 540; x.y = ny; if (x.kf && x.kf.y) x.kf.y = x.kf.y.map(q => Object.assign({}, q, { v: q.v + dy })); })));
  transformGrp(box, o);
  const g4 = grp(box, 'Timing'); timing(g4, o);
  const ie = K8.inEndOf(o); if (ie > o.d - 0.3) g4.appendChild(el('p', 'warn', 'The entrance takes ' + ie.toFixed(1) + ' s, longer than the layer stays. Lengthen the layer or speed up the animation.'));
}
// ---------------- type: style
function typeStyle(box, o) {
  const fx = Object.assign({}, o.fx || {}), set = (k, v, key) => upd(o.id, x => { x.fx = x.fx || {}; if (v === undefined || v === null || v === '' || v === 0 || v === false || v === 'none') delete x.fx[k]; else x.fx[k] = v; }, key);
  const g = grp(box, 'Fill');
  g.appendChild(segRow('Fill', K8.FILLS, fx.fill || 'solid', v => upd(o.id, x => { x.fx = x.fx || {}; if (v === 'solid') delete x.fx.fill; else x.fx.fill = v; if (v === 'footage' && !x.fx.clip) { const c = curClip(); if (c) x.fx.clip = c; } })));
  if (fx.fill === 'gradient' || fx.fill === 'duo') g.appendChild(colorRow('Second colour', fx.col2 || (fx.fill === 'duo' ? 'accent' : 'accent2'), v => set('col2', v, 'c2')));
  if (fx.fill === 'gradient') { g.appendChild(rangeRow('Angle', 0, 360, 5, fx.ang || 90, v => set('ang', v, 'ang'), v => v + '°'));
    const ck = el('label', 'chk'), ci = el('input'); ci.type = 'checkbox'; ci.checked = !!fx.animG; ci.onchange = () => set('animG', ci.checked); ck.appendChild(ci); ck.appendChild(document.createTextNode('Animate the gradient')); g.appendChild(ck); }
  if (fx.fill === 'footage') { const clips = NX.brandClips(); if (!clips.length) g.appendChild(el('p', 'warn', 'Add footage or photos for this brand to fill the letters with it.'));
    else { g.appendChild(selRow('Footage', clips.map(r => [r.id, r.name]), fx.clip || clips[0].id, v => set('clip', v))); const m = NX.META[fx.clip]; if (m) g.appendChild(rangeRow('Starts in the clip at', 0, Math.max(0, m.n / 30 - 0.5), 0.05, fx.cin || 0, v => set('cin', v, 'cin'), v => v.toFixed(2) + ' s')); }
    if (A.B().builtin) g.appendChild(el('p', 'hint', 'The letters crop the footage; the clip itself plays untouched at normal speed.')); }
  const ck2 = el('label', 'chk'), ci2 = el('input'); ci2.type = 'checkbox'; ci2.checked = !!fx.sweep; ci2.onchange = () => set('sweep', ci2.checked); ck2.appendChild(ci2); ck2.appendChild(document.createTextNode('Light sweep after it lands')); g.appendChild(ck2);
  const g2 = grp(box, 'Outline, shadow & glow');
  g2.appendChild(rangeRow('Outline', 0, 30, 0.5, fx.stroke || 0, v => set('stroke', v, 'sw'), v => v + ' px'));
  if (fx.stroke) g2.appendChild(colorRow('Outline colour', fx.scol || 'ink', v => set('scol', v, 'sc')));
  g2.appendChild(segRow('Shadow', K8.SHADOWS, fx.shadow || 'none', v => set('shadow', v)));
  if (fx.shadow && fx.shadow !== 'none' && fx.shadow !== 'soft') g2.appendChild(colorRow('Shadow colour', fx.shcol || (fx.shadow === 'layered' ? 'accent' : 'ink'), v => set('shcol', v, 'shc')));
  g2.appendChild(rangeRow('Glow', 0, 1.5, 0.05, fx.glow || 0, v => set('glow', v, 'gl'), v => Math.round(v * 100) + '%'));
  if (fx.glow) g2.appendChild(colorRow('Glow colour', fx.gcol || o.color || 'white', v => set('gcol', v, 'gc')));
  g2.appendChild(rangeRow('3D depth', 0, 90, 1, fx.extrude || 0, v => set('extrude', v, 'ex'), v => v + ' px'));
  if (fx.extrude) g2.appendChild(colorRow('Depth colour', fx.ecol || 'ink', v => set('ecol', v, 'ec')));
  g2.appendChild(rangeRow('Slant', -30, 30, 1, fx.slant || 0, v => set('slant', v, 'sl'), v => v + '°'));
  const g3 = grp(box, 'Decoration');
  g3.appendChild(segRow('Behind or under the text', K8.DECOS, fx.deco || 'none', v => set('deco', v)));
  if (fx.deco && fx.deco !== 'none') { g3.appendChild(colorRow('Decoration colour', fx.dcol || 'accent', v => set('dcol', v, 'dc'))); g3.appendChild(el('p', 'hint', 'It draws on with the entrance and leaves with the exit.')); }
}
// ---------------- motion sync: several elements sharing one motion ----------------
// tl.motionGroups = [{id, name, base:{x,y}, kf}]. An item with mgroup set plays its group's keyframes instead of its
// own; the group's x/y keys are absolute positions for an element at group.base, so each member shifts them by (its own
// base - group.base) — a row drifts together, each from where it is. Scale, rotation and opacity are shared absolutely.
// The engine (tpl_free.js: effKf) keeps the same convention.
const groupsOf = tl => (tl && Array.isArray(tl.motionGroups) ? tl.motionGroups : []);
const groupById = (tl, id) => groupsOf(tl).find(g => g && g.id === id) || null;
const itemBase = (o, isMain) => isMain ? { x: 540, y: 960 } : { x: +o.x || 540, y: +o.y || 960 };
const itemKf = (o, isMain) => isMain ? (o.motion && o.motion.kf) || null : o.kf || null;
const groupMembers = (tl, gid) => {
  const out = [];
  for (const L of tl.layers || []) if (L.mgroup === gid) out.push({ o: L, main: false });
  for (const m of tl.main || []) if (m.mgroup === gid) out.push({ o: m, main: true });
  return out;
};
const nextGroupName = tl => { const n = groupsOf(tl).length; return 'Group ' + String.fromCharCode(65 + (n % 26)) + (n >= 26 ? ' ' + (Math.floor(n / 26) + 1) : ''); };
function createGroup(tl, o, isMain) {
  const g = { id: 'mg' + A.uid8().slice(0, 6), name: nextGroupName(tl), base: itemBase(o, isMain), kf: clone(itemKf(o, isMain)) || {} };
  tl.motionGroups = groupsOf(tl).concat([g]);
  return g;
}
// the keyframes an item actually plays (group-resolved, for copy/paste and unlink)
function effKfOf(o, isMain, tl) {
  const g = o.mgroup ? groupById(tl, o.mgroup) : null, own = itemKf(o, isMain);
  if (!g || !g.kf) return own ? clone(own) : null;
  const b = itemBase(o, isMain), out = {};
  for (const [p, ks] of Object.entries(g.kf)) {
    if (!Array.isArray(ks)) continue;
    if (p === 'x') out[p] = ks.map(k => Object.assign({}, k, { v: k.v + (b.x - (+(g.base && g.base.x) || 540)) }));
    else if (p === 'y') out[p] = ks.map(k => Object.assign({}, k, { v: k.v + (b.y - (+(g.base && g.base.y) || 960)) }));
    else out[p] = clone(ks);
  }
  return out;
}
function unlinkGroup(tl, o, isMain) {
  const kf = effKfOf(o, isMain, tl), gid = o.mgroup;
  change(t => {
    const it = isMain ? t.main.find(x => x.id === o.id) : t.layers.find(x => x.id === o.id); if (!it) return;
    delete it.mgroup;
    if (kf && Object.keys(kf).length) { if (isMain) it.motion = { kf }; else it.kf = kf; }
    else { if (isMain) delete it.motion; else delete it.kf; }
    if (gid && !groupMembers(t, gid).length) t.motionGroups = groupsOf(t).filter(g => g.id !== gid);
  }, { label: 'Unlink motion' });
}
// the Sync row: individual motion, or in sync with a group. Used by the Animate tab (layers) and main-item inspectors.
function syncRow(box, o, isMain) {
  const tl = TL(), g = o.mgroup ? groupById(tl, o.mgroup) : null;
  const gg = grp(box, 'Motion sync');
  if (!g) {
    gg.appendChild(el('p', 'note', 'This element moves on its own. Put it in a sync group and every element in the group moves together — a row or a grid drifting as one.'));
    const gs = groupsOf(tl);
    if (gs.length) gg.appendChild(selRow('Sync with', [['', 'Just this one']].concat(gs.map(x => [x.id, x.name + ' (' + groupMembers(tl, x.id).length + ')'])), '', v => {
      if (!v) return;
      change(t => { const it = isMain ? t.main.find(x => x.id === o.id) : t.layers.find(x => x.id === o.id); if (!it) return; it.mgroup = v; if (isMain) delete it.motion; else delete it.kf; });
      renderInspector();
    }));
    acts(gg, [['New sync group', () => { change(t => { const it = isMain ? t.main.find(x => x.id === o.id) : t.layers.find(x => x.id === o.id); if (!it || it.mgroup) return; const ng = createGroup(t, it, isMain); it.mgroup = ng.id; if (isMain) delete it.motion; else delete it.kf; }, { label: 'New sync group' }); renderInspector(); }]]);
  } else {
    const members = groupMembers(tl, g.id);
    gg.appendChild(el('p', 'note', 'In sync with ' + g.name + ' — ' + members.length + ' element' + (members.length === 1 ? '' : 's') + ' move together: ' + members.map(m => api.labelOf(m.o)).join(', ') + '. A preset moves them all; the keyframes live on the group.'));
    gg.appendChild(selRow('Group', groupsOf(tl).map(x => [x.id, x.name + ' (' + groupMembers(tl, x.id).length + ')']), g.id, v => {
      change(t => { const it = isMain ? t.main.find(x => x.id === o.id) : t.layers.find(x => x.id === o.id); if (!it) return; it.mgroup = v; if (isMain) delete it.motion; else delete it.kf; });
      renderInspector();
    }));
    acts(gg, [['Unlink (keep this motion)', () => { unlinkGroup(TL(), o, isMain); renderInspector(); }]]);
  }
  return gg;
}
// Motion for a main-track item (clip, card, template block, ending, container): presets move the whole scene, and the
// item can join a sync group. Keyframes stay on layers; presets are the simple keyframe model for scenes.
function applyMainMotion(id, k, gen) {
  const tl = TL(), it = tl && tl.main.find(x => x.id === id); if (!it) return;
  if (it.mgroup) {
    const g = groupById(tl, it.mgroup);
    change(t => { const gg = groupById(t, it.mgroup); if (!gg) return;
      if (k === 'none') { gg.kf = {}; return; }
      const kf = gen(gg.base, it.d); gg.kf = {};
      for (const [p, ks] of Object.entries(kf)) gg.kf[p] = ks.map(q => ({ t: r3(clamp(q.t, 0, it.d)), v: Math.round(q.v * 1000) / 1000, e: q.e || 'smooth' }));
    }, { label: 'Motion (group)' });
    A.toast(k === 'none' ? 'Group motion removed.' : 'Group motion added — every element in the group moves together.');
    return;
  }
  change(t => { const m = t.main.find(x => x.id === id); if (!m) return;
    if (k === 'none') { delete m.motion; return; }
    const kf = gen({ x: 540, y: 960 }, m.d); m.motion = { kf: {} };
    for (const [p, ks] of Object.entries(kf)) m.motion.kf[p] = ks.map(q => ({ t: r3(clamp(q.t, 0, m.d)), v: Math.round(q.v * 1000) / 1000, e: q.e || 'smooth' }));
  });
  A.toast(k === 'none' ? 'Motion removed.' : 'Motion added. Play it to see the whole scene move.');
}
function mainMotion(box, o) {
  const g = grp(box, 'Motion');
  g.appendChild(el('p', 'note', 'Moves the whole scene — a slow push in, a drift, a float. ' + (o.motion && o.motion.kf ? 'It has motion now.' : 'Pick a preset; No motion takes it off.')));
  const mw = el('div', 'mx-motions'); g.appendChild(mw);
  for (const [k, n, gen] of K8.MOTIONS) { const b = el('button', '', n); b.type = 'button'; b.onclick = () => applyMainMotion(o.id, k, gen); mw.appendChild(b); }
  syncRow(box, o, true);
  return g;
}
// in / out transitions for one layer: L.tin / L.tout = {type, d, dir}. The whole layer arrives and leaves —
// crossfade, slide, wipe or zoom — on top of whatever entrance its own content has.
const IO_TYPES = [['none', 'None'], ['fade', 'Fade'], ['slide', 'Slide'], ['wipe', 'Wipe'], ['zoom', 'Zoom'], ['blur', 'Blur'], ['spin', 'Spin']];
const IO_DIRS = [['left', 'Left'], ['right', 'Right'], ['top', 'Top'], ['bottom', 'Bottom']];
function inOutGrp(box, o, refresh) {
  refresh = refresh || renderInspector;
  const g = grp(box, 'Whole layer — in / out');
  g.appendChild(el('p', 'note', 'How the whole layer arrives and leaves. An entrance above animates what is inside the layer; this moves the layer itself.'));
  const setIO = (which, patch, redraw) => { upd(o.id, x => { const cur = Object.assign({}, x[which] || {}); Object.assign(cur, patch);
    if (!cur.type || cur.type === 'none') delete x[which]; else x[which] = cur; }); if (redraw) refresh(); };
  const tin = o.tin || {}, tout = o.tout || {};
  g.appendChild(selRow('In', IO_TYPES, tin.type || 'none', v => setIO('tin', { type: v }, true)));
  if (tin.type === 'slide' || tin.type === 'wipe') g.appendChild(segRow(tin.type === 'slide' ? 'From' : 'Reveal from', IO_DIRS, tin.dir || 'left', v => setIO('tin', { dir: v })));
  if (tin.type === 'slide') g.appendChild(rangeRow('Swoop distance', 0.1, 1.5, 0.05, tin.amt || 1, v => setIO('tin', { amt: Math.round(v * 100) / 100 }), v => Math.round(v * 100) + '%'));
  if (tin.type === 'spin') g.appendChild(rangeRow('Spin amount', 0.1, 1.5, 0.05, tin.amt || 1, v => setIO('tin', { amt: Math.round(v * 100) / 100 }), v => Math.round(v * 100) + '%'));
  if (tin.type && tin.type !== 'none') g.appendChild(rangeRow('In length', 0.15, 1.2, 0.05, tin.d || 0.5, v => setIO('tin', { d: Math.round(v * 100) / 100 }), v => v.toFixed(2) + ' s'));
  g.appendChild(selRow('Out', IO_TYPES, tout.type || 'none', v => setIO('tout', { type: v }, true)));
  if (tout.type === 'slide' || tout.type === 'wipe') g.appendChild(segRow(tout.type === 'slide' ? 'Towards' : 'Leaves towards', IO_DIRS, tout.dir || 'right', v => setIO('tout', { dir: v })));
  if (tout.type === 'slide') g.appendChild(rangeRow('Swoop distance', 0.1, 1.5, 0.05, tout.amt || 1, v => setIO('tout', { amt: Math.round(v * 100) / 100 }), v => Math.round(v * 100) + '%'));
  if (tout.type === 'spin') g.appendChild(rangeRow('Spin amount', 0.1, 1.5, 0.05, tout.amt || 1, v => setIO('tout', { amt: Math.round(v * 100) / 100 }), v => Math.round(v * 100) + '%'));
  if (tout.type && tout.type !== 'none') g.appendChild(rangeRow('Out length', 0.15, 1.2, 0.05, tout.d || 0.4, v => setIO('tout', { d: Math.round(v * 100) / 100 }), v => v.toFixed(2) + ' s'));
  return g;
}

// ---------------- text entrances: one preset list any text element can pick ----------------
// Classic text layers get the entrance as a whole-layer in-transition (tin) — or, for Typed, the 'typed' style itself,
// which writes the line on character by character. Kinetic ('type') text gets the matching K8 entrance (anim.in).
// The length slider under the buttons sets the in-transition's duration (classic) — kinetic text uses its own Duration
// row below. What already existed, reused rather than rebuilt: K8.IN (typewriter, letters, words, bounce, blur, spin…),
// the 'typed' style, and the K8.MOTIONS presets.
const TEXT_ENTRANCES = [
  { id: 'typed', name: 'Typed', classic: 'typed', type: { in: 'typewriter' } },
  { id: 'fade', name: 'Fade in', classic: { type: 'fade' }, type: { in: 'fade' } },
  { id: 'swoopl', name: 'Swoop from left', classic: { type: 'slide', dir: 'left', amt: 1 }, type: { in: 'slide', dir: 'left' } },
  { id: 'swoopr', name: 'Swoop from right', classic: { type: 'slide', dir: 'right', amt: 1 }, type: { in: 'slide', dir: 'right' } },
  { id: 'rise', name: 'Rise', classic: { type: 'slide', dir: 'bottom', amt: 0.35 }, type: { in: 'rise' } },
  { id: 'drop', name: 'Drop in', classic: { type: 'slide', dir: 'top', amt: 1 }, type: { in: 'slide', dir: 'top' } },
  { id: 'pop', name: 'Pop in', classic: { type: 'zoom' }, type: { in: 'pop' } },
  { id: 'blur', name: 'Blur in', classic: { type: 'blur' }, type: { in: 'blur' } },
  { id: 'wipe', name: 'Wipe in', classic: { type: 'wipe', dir: 'left' }, type: { in: 'wipe', dir: 'left' } },
  { id: 'spin', name: 'Spin in', classic: { type: 'spin' }, type: { in: 'spin' } },
  { id: 'letters', name: 'Letter by letter', classic: null, type: { in: 'letters' } },
  { id: 'words', name: 'Word by word', classic: null, type: { in: 'words' } },
  { id: 'bounce', name: 'Bounce in', classic: null, type: { in: 'bounce' } },
];
function applyTextEntrance(o, kind, p) {
  if (kind === 'type') {
    if (!p.type) return;
    upd(o.id, x => { x.anim = x.anim || {}; x.anim.in = p.type.in; if (p.type.dir) x.anim.dir = p.type.dir; else delete x.anim.dir; delete x.anim.inD; });
  } else {
    if (p.classic === 'typed') { upd(o.id, x => { x.style = 'typed'; delete x.tin; }); }
    else if (p.classic) { const t = Object.assign({ d: (o.tin && o.tin.d) || 0.5 }, p.classic); upd(o.id, x => { x.tin = t; }); }
  }
  renderInspector();
}
function textEntranceGrp(box, o, kind) {
  const g = grp(box, 'Entrance');
  const list = TEXT_ENTRANCES.filter(p => kind === 'type' ? !!p.type : !!p.classic);
  const mw = el('div', 'mx-motions'); g.appendChild(mw);
  for (const p of list) { const b = el('button', '', p.name); b.type = 'button'; b.onclick = () => applyTextEntrance(o, kind, p); mw.appendChild(b); }
  if (kind !== 'type' && o.tin && o.tin.type && o.tin.type !== 'none') g.appendChild(rangeRow('Entrance length', 0.15, 1.2, 0.05, o.tin.d || 0.5, v => upd(o.id, x => { if (x.tin) x.tin.d = Math.round(v * 100) / 100; }, 'entd'), v => v.toFixed(2) + ' s'));
  if (kind === 'type') g.appendChild(el('p', 'hint', 'Fine-tune the entrance below (duration, stagger, easing). The exit lives there too.'));
  else g.appendChild(el('p', 'hint', 'Typed switches the style itself; the rest arrive as a whole-layer entrance. The out-transition is in “Whole layer — in / out” below.'));
  return g;
}
// in/out for a multi-selection: the SAME settings on every element, but each keeps its own clock — the transition runs
// from when that element starts and ends. Stagger their starts and they reveal one by one; line their ends up (End
// together, below) and they leave at the same moment.
function multiInOutGrp(box, layers) {
  const g = grp(box, 'In / out for all ' + layers.length);
  g.appendChild(el('p', 'note', 'Same settings, independent timing: each element’s in/out runs on its own start and end.'));
  const first = layers[0];
  const setAll = (which, patch, redraw) => { change(t => { for (const L0 of layers) { const L = t.layers.find(x => x.id === L0.id); if (!L) continue; const cur = Object.assign({}, L[which] || {}); Object.assign(cur, patch); if (!cur.type || cur.type === 'none') delete L[which]; else L[which] = cur; } }); if (redraw) renderInspector(); };
  const tin = first.tin || {}, tout = first.tout || {};
  g.appendChild(selRow('In', IO_TYPES, tin.type || 'none', v => setAll('tin', { type: v }, true)));
  if (tin.type === 'slide' || tin.type === 'wipe') g.appendChild(segRow(tin.type === 'slide' ? 'From' : 'Reveal from', IO_DIRS, tin.dir || 'left', v => setAll('tin', { dir: v })));
  if (tin.type && tin.type !== 'none') g.appendChild(rangeRow('In length', 0.15, 1.2, 0.05, tin.d || 0.5, v => setAll('tin', { d: Math.round(v * 100) / 100 }), v => v.toFixed(2) + ' s'));
  g.appendChild(selRow('Out', IO_TYPES, tout.type || 'none', v => setAll('tout', { type: v }, true)));
  if (tout.type === 'slide' || tout.type === 'wipe') g.appendChild(segRow(tout.type === 'slide' ? 'Towards' : 'Leaves towards', IO_DIRS, tout.dir || 'right', v => setAll('tout', { dir: v })));
  if (tout.type && tout.type !== 'none') g.appendChild(rangeRow('Out length', 0.15, 1.2, 0.05, tout.d || 0.4, v => setAll('tout', { d: Math.round(v * 100) / 100 }), v => v.toFixed(2) + ' s'));
  return g;
}

// ---------------- animate
function easeRow(label, val, on) {
  const w = el('div', 'fld'), id = 'mx-' + A.uid8(), lab = el('label', '', label); lab.htmlFor = id; w.appendChild(lab); const s = el('select'); s.id = id;
  [['auto', 'Automatic (the preset’s own)']].concat(K8.EASES.map(e => [e[0], e[1]])).concat([['bz', 'Custom curve…']]).forEach(([k, n]) => { const op = el('option', '', n); op.value = k; s.appendChild(op); });
  const isBz = typeof val === 'string' && val.startsWith('bz:'); s.value = isBz ? 'bz' : (val || 'auto'); w.appendChild(s);
  const bz = el('div', 'bz'); const nums = (isBz ? val.slice(3).split(',') : ['0.25', '0.1', '0.25', '1']).map((v, i) => { const n = el('input'); n.type = 'number'; n.step = '0.05'; n.min = i % 2 ? '-1' : '0'; n.max = i % 2 ? '2' : '1'; n.value = v; n.setAttribute('aria-label', ['x1', 'y1', 'x2', 'y2'][i]); n.onchange = () => on('bz:' + nums.map(x => clamp(+x.value || 0, i % 2 ? -1 : 0, i % 2 ? 2 : 1)).join(',')); bz.appendChild(n); return n; });
  bz.hidden = !isBz; w.appendChild(bz); if (isBz) w.appendChild(el('p', 'hint', 'Cubic bezier x1, y1, x2, y2, like CSS.'));
  s.onchange = () => { if (s.value === 'bz') { bz.hidden = false; on('bz:' + nums.map(x => x.value).join(',')); } else on(s.value === 'auto' ? '' : s.value); };
  return w;
}
const DIRS = { rise: 1, slide: 1, stagger: 1, wipe: 1, charup: 2, wordup: 2 };
function animTab(box, o, kind) {
  if (kind === 'type') {
    textEntranceGrp(box, o, 'type');
    const A0 = Object.assign({}, o.anim || {}), set = (k, v, key) => upd(o.id, x => { x.anim = x.anim || {}; if (v === '' || v === undefined || v === null) delete x.anim[k]; else x.anim[k] = v; }, key);
    const P = K8.IN[A0.in || 'rise'] || K8.IN.rise;
    const g = grp(box, 'Entrance');
    const cats = {}; for (const [k, p] of Object.entries(K8.IN)) (cats[p.cat] = cats[p.cat] || []).push([k, p.name]);
    const w = el('div', 'fld'), sid = 'mx-' + A.uid8(), lb = el('label', '', 'Animation'); lb.htmlFor = sid; w.appendChild(lb); const s = el('select'); s.id = sid;
    for (const [c, list] of Object.entries(cats)) { const og = el('optgroup'); og.label = c; for (const [k, n] of list) { const op = el('option', '', n); op.value = k; og.appendChild(op); } s.appendChild(og); }
    s.value = A0.in || 'rise'; s.onchange = () => upd(o.id, x => { x.anim = x.anim || {}; x.anim.in = s.value; delete x.anim.inD; delete x.anim.stagger; delete x.anim.by; delete x.anim.dir; }); w.appendChild(s); g.appendChild(w);
    if ((A0.in || 'rise') !== 'none') {
      g.appendChild(rangeRow(P.special === 'kinetic' ? 'Time per word' : 'Duration', 0.1, P.special === 'kinetic' ? 1.2 : 3, 0.05, A0.inD || P.d, v => set('inD', v, 'inD'), v => v.toFixed(2) + ' s'));
      g.appendChild(rangeRow('Delay', 0, 3, 0.05, A0.inDelay || 0, v => set('inDelay', v || '', 'dl'), v => v.toFixed(2) + ' s'));
      if (P.by !== 'all') { g.appendChild(segRow('Animate by', [['auto', 'Auto'], ['line', 'Line'], ['word', 'Word'], ['char', 'Letter']], A0.by || 'auto', v => set('by', v === 'auto' ? '' : v)));
        g.appendChild(rangeRow('Stagger', 0, 0.4, 0.005, A0.stagger >= 0 ? A0.stagger : P.st, v => set('stagger', v, 'st'), v => Math.round(v * 1000) + ' ms')); }
      if (DIRS[A0.in || 'rise']) g.appendChild(segRow('From', DIRS[A0.in || 'rise'] === 2 ? [['bottom', 'Below'], ['top', 'Above']] : [['bottom', 'Below'], ['top', 'Above'], ['left', 'Left'], ['right', 'Right']], A0.dir || P.dir || 'bottom', v => set('dir', v)));
      g.appendChild(easeRow('Easing', A0.ease, v => set('ease', v)));
      g.appendChild(rangeRow('Intensity', 0, 2, 0.05, A0.amt === undefined ? 1 : A0.amt, v => set('amt', v === 1 ? '' : v, 'amt'), v => Math.round(v * 100) + '%'));
    }
    const Q = K8.OUT[A0.out || 'fade'] || K8.OUT.fade, g2 = grp(box, 'Exit');
    g2.appendChild(selRow('Animation', Object.entries(K8.OUT).map(([k, p]) => [k, p.name]), A0.out || 'fade', v => upd(o.id, x => { x.anim = x.anim || {}; x.anim.out = v; delete x.anim.outD; delete x.anim.outDir; })));
    if ((A0.out || 'fade') !== 'none') { g2.appendChild(rangeRow('Duration', 0.1, 2, 0.05, A0.outD || Q.d, v => set('outD', v, 'oD'), v => v.toFixed(2) + ' s'));
      if (A0.out === 'slide' || A0.out === 'wipe') g2.appendChild(segRow('Towards', [['right', 'Right'], ['left', 'Left'], ['top', 'Up'], ['bottom', 'Down']], A0.outDir || Q.dir || 'right', v => set('outDir', v))); }
    const g3 = grp(box, 'While it holds');
    g3.appendChild(selRow('Loop', Object.entries(K8.LOOP).map(([k, p]) => [k, p.name]), A0.loop || 'none', v => set('loop', v === 'none' ? '' : v)));
    if (A0.loop && A0.loop !== 'none') { g3.appendChild(rangeRow('Amount', 0, 3, 0.05, A0.loopAmt === undefined ? 1 : A0.loopAmt, v => set('loopAmt', v, 'la'), v => Math.round(v * 100) + '%')); g3.appendChild(rangeRow('Speed', 0.2, 3, 0.05, A0.loopSp || 1, v => set('loopSp', v, 'ls'), v => v.toFixed(2) + '×')); }
    inOutGrp(box, o);
    syncRow(box, o, false);
  } else if (kind === 'mg') { box.appendChild(el('p', 'note', (K9.EL[o.type] || {}).desc || '')); box.appendChild(el('p', 'hint', 'This graphic has its own entrance and exit built in. Add movement on top with a motion preset, or set keyframes.'));
    inOutGrp(box, o);
    syncRow(box, o, false); }
  else { box.appendChild(el('p', 'hint', 'This element keeps its own entrance. Add movement on top with a motion preset, or set keyframes.'));
    if (o.kind === 'text') textEntranceGrp(box, o, 'legacy');
    inOutGrp(box, o);
    const gFx = grp(box, 'Effects');
    gFx.appendChild(rangeRow('Glow', 0, 2, 0.05, o.fxGlow || 0, v => upd(o.id, x => { if (v) x.fxGlow = v; else delete x.fxGlow; }, 'gl'), v => Math.round(v * 100) + '%'));
    gFx.appendChild(rangeRow('Drop shadow', 0, 2, 0.05, o.fxShadow || 0, v => upd(o.id, x => { if (v) x.fxShadow = v; else delete x.fxShadow; }, 'sh'), v => Math.round(v * 100) + '%'));
    gFx.appendChild(el('p', 'hint', 'Glow is the brand accent around the element; shadow drops it off the background. Both draw in the preview and the export.'));
    syncRow(box, o, false); }
  const g4 = grp(box, 'Move the whole layer'); g4.appendChild(el('p', 'hint', 'A motion preset writes keyframes from where the layer is now. Fine-tune them in Keyframes.'));
  const mw = el('div', 'mx-motions'); g4.appendChild(mw);
  for (const [k, n, gen] of K8.MOTIONS) { const b = el('button', '', n); b.type = 'button'; b.onclick = () => applyMotion([o.id], k, gen); mw.appendChild(b); }
  const g5 = grp(box, 'Reuse'); acts(g5, [['Copy animation', () => copyAnim(o)], ['Paste animation', () => pasteAnim([o.id])]]);
}
function applyMotion(ids, k, gen) {
  const tl = TL(), done = new Set(); let grouped = false;
  change(t => { for (const id of ids) { const L = t.layers.find(x => x.id === id); if (!L) continue;
    if (L.mgroup) { grouped = true; if (done.has(L.mgroup)) continue; done.add(L.mgroup);
      const g = groupById(t, L.mgroup); if (!g) continue;
      if (k === 'none') { g.kf = {}; continue; }
      const kf = gen(g.base, L.d); g.kf = {};
      for (const [p, ks] of Object.entries(kf)) g.kf[p] = ks.map(q => ({ t: r3(clamp(q.t, 0, L.d)), v: Math.round(q.v * 1000) / 1000, e: q.e || 'smooth' }));
      continue; }
    if (k === 'none') { delete L.kf; continue; }
    const kf = gen({ x: +L.x || 540, y: +L.y || 960 }, L.d); L.kf = L.kf || {}; for (const [p, ks] of Object.entries(kf)) L.kf[p] = ks.map(q => ({ t: r3(clamp(q.t, 0, L.d)), v: Math.round(q.v * 1000) / 1000, e: q.e || 'smooth' })); } });
  A.toast(k === 'none' ? 'Motion removed.' : grouped ? 'Motion added to the sync group — every element in it moves together. Each element keeps its own in/out.' : 'Motion added. Play it, or fine-tune the keyframes.');
}
function copyAnim(o) { ED.animClip = { anim: o.anim ? clone(o.anim) : null, kf: effKfOf(o, false, TL()), x: +o.x || 540, y: +o.y || 960, d: o.d }; try { sessionStorage.setItem('nx-anim', JSON.stringify(ED.animClip)); } catch (e) {} A.toast('Animation copied. Select another layer and paste.'); }
function pasteAnim(ids) {
  let c = ED.animClip; if (!c) { try { c = JSON.parse(sessionStorage.getItem('nx-anim') || 'null'); } catch (e) {} } if (!c) { A.toast('Copy an animation first.'); return; }
  change(t => { for (const id of ids) { const L = t.layers.find(x => x.id === id); if (!L) continue; if (c.anim && L.kind === 'text' && L.style === 'type') L.anim = clone(c.anim);
    if (c.kf) { const k = L.d / Math.max(0.1, c.d);
      if (L.mgroup) { const g = groupById(t, L.mgroup); if (g) { const dx = (+(g.base && g.base.x) || 540) - c.x, dy = (+(g.base && g.base.y) || 960) - c.y; g.kf = {}; for (const [p, ks] of Object.entries(c.kf)) g.kf[p] = ks.map(q => ({ t: r3(clamp(q.t * k, 0, L.d)), v: p === 'x' ? q.v + dx : p === 'y' ? q.v + dy : q.v, e: q.e })); } }
      else { const dx = (+L.x || 540) - c.x, dy = (+L.y || 960) - c.y; L.kf = {}; for (const [p, ks] of Object.entries(c.kf)) L.kf[p] = ks.map(q => ({ t: r3(clamp(q.t * k, 0, L.d)), v: p === 'x' ? q.v + dx : p === 'y' ? q.v + dy : q.v, e: q.e })); } }
    else if (!L.mgroup && (L.kind !== 'text' || L.style !== 'type')) delete L.kf; } });
  A.toast('Animation pasted' + (ids.length > 1 ? ' on ' + ids.length + ' layers.' : '.'));
}
// ---------------- keyframes
const KPROPS = { x: ['Position X', 0, 1080, 1, v => Math.round(v)], y: ['Position Y', 0, 1920, 1, v => Math.round(v)], sc: ['Scale', 0.05, 5, 0.01, v => Math.round(v * 100) + '%'], sx: ['Scale X', 0.05, 5, 0.01, v => Math.round(v * 100) + '%'], sy: ['Scale Y', 0.05, 5, 0.01, v => Math.round(v * 100) + '%'],
  rot: ['Rotation', -720, 720, 1, v => Math.round(v) + '°'], op: ['Opacity', 0, 1, 0.01, v => Math.round(v * 100) + '%'], blur: ['Blur', 0, 40, 0.5, v => v.toFixed(1) + ' px'], mask: ['Reveal (wipe)', 0, 1, 0.01, v => Math.round(v * 100) + '%'],
  track: ['Tracking', -200, 800, 5, v => (v / 1000).toFixed(2) + ' em'], glow: ['Glow', 0, 2, 0.05, v => Math.round(v * 100) + '%'], shadow: ['Shadow', 0, 2, 0.05, v => Math.round(v * 100) + '%'], color: ['Colour'] };
const BASE = { x: 'x', y: 'y', sx: 'sx', sy: 'sy', rot: 'rot', op: 'opacity', blur: 'blur' };
const NULLV = { track: 0, mask: 1, glow: 0, shadow: 1 };
const propsOf = kind => kind === 'type' ? ['x', 'y', 'sc', 'rot', 'op', 'blur', 'mask', 'track', 'glow', 'shadow', 'color'] : kind === 'mg' ? ['x', 'y', 'sc', 'sx', 'sy', 'rot', 'op', 'blur', 'mask', 'color'] : ['x', 'y', 'sc', 'rot', 'op', 'blur', 'mask'];
const ltOf = o => r3(clamp(S.t - o.t0, 0, o.d));
const keysOf = (o, p) => (o.kf && Array.isArray(o.kf[p === 'sc' ? 'sx' : p]) ? o.kf[p === 'sc' ? 'sx' : p] : []);
const curVal = (o, p, lt) => { const v = K8.val(o, p === 'sc' ? 'sx' : p, lt); return v == null ? (p === 'color' ? K8.col(o.color || 'white') : NULLV[p] !== undefined ? NULLV[p] : 0) : v; };
function setVal(L, p, v, lt) {
  for (const q of p === 'sc' ? ['sx', 'sy'] : [p]) {
    const ks = L.kf && L.kf[q];
    if ((!ks || !ks.length) && BASE[q]) { const f = BASE[q]; if (q === 'sy' && p === 'sc') { L.sy = Math.round((L.sy || 1) * (v / (L.sx || 1)) * 1000) / 1000; continue; } L[f] = typeof v === 'number' ? Math.round(v * 1000) / 1000 : v; continue; }
    L.kf = L.kf || {}; const arr = L.kf[q] = (L.kf[q] || []).map(k => Object.assign({}, k)); const i = arr.findIndex(k => Math.abs(k.t - lt) < 0.017), val = typeof v === 'number' ? Math.round(v * 1000) / 1000 : v;
    if (i >= 0) arr[i].v = val; else { arr.push({ t: lt, v: val, e: 'smooth' }); arr.sort((a, b) => a.t - b.t); }
  }
  if (p === 'sc' && (!L.kf || !L.kf.sx || !L.kf.sx.length)) { /* base scale already set above */ }
}
function toggleKey(o, p) {
  const lt = ltOf(o);
  change(t => { const L = t.layers.find(x => x.id === o.id); if (!L) return;
    for (const q of p === 'sc' ? ['sx', 'sy'] : [p]) { L.kf = L.kf || {}; const arr = (L.kf[q] || []).map(k => Object.assign({}, k)), i = arr.findIndex(k => Math.abs(k.t - lt) < 0.017);
      if (i >= 0) arr.splice(i, 1); else { const v = curVal(L, q, lt); arr.push({ t: lt, v: typeof v === 'number' ? Math.round(v * 1000) / 1000 : v, e: 'smooth' }); arr.sort((a, b) => a.t - b.t); }
      if (arr.length) L.kf[q] = arr; else delete L.kf[q]; }
    if (L.kf && !Object.keys(L.kf).length) delete L.kf; });
}
function keysTab(box, o, kind) {
  const lt = ltOf(o), inside = S.t >= o.t0 && S.t <= o.t0 + o.d;
  box.appendChild(el('p', 'hint', inside ? 'Playhead at ' + fmtT(S.t) + ' (' + lt.toFixed(2) + ' s into the layer). ◆ adds or removes a key here. Changing a value adds a key here once the property has keys.' : 'Move the playhead inside this layer to set keyframes.'));
  if (o.mgroup) { const g = groupById(TL(), o.mgroup); box.appendChild(el('p', 'warn', 'This layer moves with ' + (g ? g.name : 'a sync group') + ' — presets in Animate move the whole group. Unlink it to edit keyframes here.')); acts(box, [['Unlink (keep this motion)', () => { unlinkGroup(TL(), o, false); renderInspector(); }]]); return; }
  const g = grp(box, 'Properties');
  for (const p of propsOf(kind)) {
    const [name, mn, mx, st, fmt] = KPROPS[p], ks = keysOf(o, p), onKey = ks.some(k => Math.abs(k.t - lt) < 0.017), v = curVal(o, p, lt);
    const row = el('div', 'kf-row'), top = el('div', 'kf-top'); row.appendChild(top);
    const dia = el('button', 'kf-dia' + (ks.length ? ' has' : '') + (onKey ? ' on' : '')); dia.type = 'button'; dia.title = onKey ? 'Remove the key at the playhead' : 'Add a key at the playhead'; dia.setAttribute('aria-label', name + ': ' + dia.title); dia.disabled = !inside; dia.onclick = () => toggleKey(o, p); top.appendChild(dia);
    top.appendChild(el('span', 'nm', name + (ks.length ? ' · ' + ks.length : '')));
    const prev = ks.filter(k => k.t < lt - 0.017).pop(), next = ks.find(k => k.t > lt + 0.017);
    const nb = (txt, k, lab) => { const b = el('button', 'kf-nav', txt); b.type = 'button'; b.disabled = !k; b.title = lab; b.setAttribute('aria-label', name + ': ' + lab); b.onclick = () => A.setT(o.t0 + k.t + 1e-4); top.appendChild(b); };
    if (ks.length) { nb('‹', prev, 'Previous key'); nb('›', next, 'Next key'); }
    if (p === 'color') { row.appendChild(colorRow('', hexOf(v), c => change(t => { const L = t.layers.find(x => x.id === o.id), lt = ltOf(o); if (L) { const ks2 = L.kf && L.kf.color; if (!ks2 || !ks2.length) { L.kf = L.kf || {}; L.kf.color = [{ t: lt, v: K8.col(c), e: 'smooth' }]; } else setVal(L, 'color', K8.col(c), lt); } }, { key: 'kc' + o.id }))); }
    else { top.appendChild(el('span', 'val', fmt(v))); const r = el('input'); r.type = 'range'; r.min = mn; r.max = mx; r.step = st; r.value = v; r.disabled = !inside && !!ks.length; r.setAttribute('aria-label', name);
      r.oninput = () => { top.querySelector('.val').textContent = fmt(+r.value); change(t => { const L = t.layers.find(x => x.id === o.id), lt = ltOf(o); if (!L) return; const hasK = keysOf(L, p).length; if (!hasK && !BASE[p === 'sc' ? 'sx' : p]) { L.kf = L.kf || {}; for (const q of p === 'sc' ? ['sx', 'sy'] : [p]) L.kf[q] = [{ t: lt, v: +r.value, e: 'smooth' }]; } else setVal(L, p, +r.value, lt); }, { key: 'kv' + p + o.id }); };
      row.appendChild(r); }
    if (ks.length) { const kl = el('div', 'kf-keys'); row.appendChild(kl);
      ks.forEach((k, i) => { const kr = el('div', 'kf-key'), tn = el('input'); tn.type = 'number'; tn.step = '0.05'; tn.min = fmtNum(o.t0); tn.max = fmtNum(o.t0 + o.d); tn.value = (o.t0 + k.t).toFixed(2); tn.title = 'Key time (seconds)'; tn.setAttribute('aria-label', name + ' key ' + (i + 1) + ' time');
        tn.onchange = () => editKey(o, p, i, x => { x.t = r3(clamp(+tn.value - o.t0, 0, o.d)); }); kr.appendChild(tn);
        const es = el('select'); es.setAttribute('aria-label', name + ' key ' + (i + 1) + ' easing'); [...K8.EASES.map(e => [e[0], e[1]]), ['bz', 'Custom…']].forEach(([a, n]) => { const op = el('option', '', i === ks.length - 1 ? '(last key)' : n); op.value = a; es.appendChild(op); }); es.disabled = i === ks.length - 1;
        es.value = typeof k.e === 'string' && k.e.startsWith('bz:') ? 'bz' : (k.e || 'smooth'); es.onchange = () => { const v2 = es.value === 'bz' ? (prompt('Cubic bezier x1, y1, x2, y2', '0.25, 0.1, 0.25, 1') || '').replace(/\s+/g, '') : es.value; if (es.value === 'bz' && !/^-?[\d.]+,-?[\d.]+,-?[\d.]+,-?[\d.]+$/.test(v2)) { renderInspector(); return; } editKey(o, p, i, x => { x.e = es.value === 'bz' ? 'bz:' + v2 : v2; }); }; kr.appendChild(es);
        const x = el('button', 'x', '×'); x.type = 'button'; x.title = 'Delete this key'; x.setAttribute('aria-label', name + ' key ' + (i + 1) + ': delete'); x.onclick = () => editKey(o, p, i, null); kr.appendChild(x); kl.appendChild(kr); }); }
    g.appendChild(row);
  }
  if (propsOf(kind).includes('mask')) g.appendChild(segRow('Reveal from', [['left', 'Left'], ['right', 'Right'], ['top', 'Top'], ['bottom', 'Bottom'], ['center', 'Centre']], o.maskDir || 'left', v => upd(o.id, x => { if (v === 'left') delete x.maskDir; else x.maskDir = v; })));
  acts(box, [['Clear all keyframes', () => upd(o.id, x => { delete x.kf; })], ['Copy animation', () => copyAnim(o)], ['Paste animation', () => pasteAnim([o.id])]]);
}
const fmtNum = v => (Math.round(v * 100) / 100).toString();
const hexOf = v => (typeof v === 'string' && v.startsWith('#') ? v : K8.col(v || 'white'));
function editKey(o, p, i, fn) {
  change(t => { const L = t.layers.find(x => x.id === o.id); if (!L || !L.kf) return;
    for (const q of p === 'sc' ? ['sx', 'sy'] : [p]) { const arr = (L.kf[q] || []).map(k => Object.assign({}, k)); if (!arr[i]) continue; if (fn) fn(arr[i]); else arr.splice(i, 1); arr.sort((a, b) => a.t - b.t); if (arr.length) L.kf[q] = arr; else delete L.kf[q]; }
    if (!Object.keys(L.kf).length) delete L.kf; });
}
// ---------------- motion graphic: edit
function mgEdit(box, o) {
  const e = K9.EL[o.type]; if (!e) { box.appendChild(el('p', 'warn', 'Unknown graphic.')); return; }
  box.appendChild(el('p', 'note', e.desc));
  const miss = K9.missing(o); if (miss.length) box.appendChild(el('p', 'warn', 'Needs your details: ' + miss.join(', ') + '. Until then it shows a “+ ADD” marker. Use real facts only.'));
  const g = grp(box, 'Content');
  for (const [k, label, type, def, extra] of e.fields) {
    const cur = o[k] !== undefined ? o[k] : (typeof def === 'function' ? def() : def), ex = extra || {}, setv = (v, key) => upd(o.id, x => { if (v === '' || v === undefined) delete x[k]; else x[k] = v; }, key);
    if (type === 'text' || type === 'area') g.appendChild(textRow(label + (ex.max ? ' · max ' + ex.max : ''), cur == null ? '' : String(cur), v => setv(v, 'f' + k), { area: type === 'area', rows: 3, max: ex.max ? ex.max + 20 : undefined, lint: true, hint: ex.req ? 'Required. Real details only.' : '' }));
    else if (type === 'num') g.appendChild(rangeRow(label, ex[0] || 0, ex[1] || 100, 1, +cur || 0, v => setv(v, 'f' + k), v => String(Math.round(v))));
    else if (type === 'range') g.appendChild(rangeRow(label, ex[0], ex[1], ex[2], +cur, v => setv(v, 'f' + k), v => (Math.abs(ex[2]) < 1 ? v.toFixed(2) : String(Math.round(v)))));
    else if (type === 'seg') g.appendChild(segRow(label, ex, cur, v => setv(v)));
    else if (type === 'col') g.appendChild(colorRow(label, cur, v => setv(v, 'f' + k)));
  }
  if (!e.full) { const g2 = grp(box, 'Place'); g2.appendChild(segRow('Position', [['top', 'Top'], ['mid', 'Middle'], ['low', 'Bottom']], o.y < 760 ? 'top' : o.y > 1200 ? 'low' : 'mid', k => upd(o.id, x => { const ny = k === 'top' ? 520 : k === 'mid' ? 960 : 1450, dy = ny - x.y; x.x = 540; x.y = ny; if (x.kf && x.kf.y) x.kf.y = x.kf.y.map(q => Object.assign({}, q, { v: q.v + dy })); })));
    transformGrp(box, o); }
  else { const g2 = grp(box, 'Overlay'); g2.appendChild(rangeRow('Opacity', 0, 1, 0.01, o.opacity === undefined ? 1 : o.opacity, v => upd(o.id, x => { if (v >= 1) delete x.opacity; else x.opacity = v; }, 'op'), v => Math.round(v * 100) + '%')); }
  const g3 = grp(box, 'Timing'); timing(g3, o);
}
// ---------------- several selected
XT.inspect.multi = (box, ids) => {
  const t = TL(), items = ids.map(id => t.layers.find(x => x.id === id) || t.main.find(x => x.id === id)).filter(Boolean), layers = items.filter(x => t.layers.includes(x)), mains = items.filter(x => t.main.includes(x));
  head(box, items.length + ' selected', 'Shift- or Cmd-click on the timeline to add or remove');
  if (mains.length && XT.transMulti) XT.transMulti(box, mains);
  if (layers.length) {
    const g = grp(box, 'Animation for all ' + layers.length); const mw = el('div', 'mx-motions'); g.appendChild(mw);
    for (const [k, n, gen] of K8.MOTIONS) { const b = el('button', '', n); b.type = 'button'; b.onclick = () => applyMotion(layers.map(x => x.id), k, gen); mw.appendChild(b); }
    acts(g, [['Paste animation on all', () => pasteAnim(layers.map(x => x.id))]]);
    multiInOutGrp(box, layers);
    const g2 = grp(box, 'Timing'); acts(g2, [['Stagger them 0.2 s apart', () => change(tl => { const ls = layers.map(L => tl.layers.find(x => x.id === L.id)).filter(Boolean).sort((a, b) => a.t0 - b.t0), t0 = ls[0].t0; ls.forEach((L, i) => { L.t0 = r3(t0 + i * 0.2); }); })], ['Start together', () => change(tl => { const ls = layers.map(L => tl.layers.find(x => x.id === L.id)).filter(Boolean), t0 = Math.min(...ls.map(L => L.t0)); ls.forEach(L => { L.t0 = r3(t0); }); })], ['End together', () => change(tl => { const ls = layers.map(L => tl.layers.find(x => x.id === L.id)).filter(Boolean), end = Math.max(...ls.map(L => L.t0 + L.d)); ls.forEach(L => { L.t0 = r3(end - L.d); }); })]]);
  }
  acts(box, [['Delete all ' + items.length, () => { change(tl => { tl.layers = tl.layers.filter(x => !ids.includes(x.id)); tl.main = tl.main.filter(x => !ids.includes(x.id)); if (tl.main[0]) tl.main[0].tr = null; }); ED.multi.clear(); ED.sel = null; renderInspector(); }, 'danger']]);
};
document.addEventListener('keydown', e => {   // copy / paste animation: Alt+Cmd/Ctrl+C / V
  if (!ED.on || e.target.closest('input, textarea, select, [contenteditable]')) return; const mod = e.metaKey || e.ctrlKey;
  if (mod && e.altKey && e.key.toLowerCase() === 'c') { const o = findAny(ED.sel); if (o && TL().layers.includes(o)) { e.preventDefault(); copyAnim(o); } }
  else if (mod && e.altKey && e.key.toLowerCase() === 'v') { const ids = ED.multi.size ? [...ED.multi] : [ED.sel]; const ls = ids.filter(id => TL().layers.some(x => x.id === id)); if (ls.length) { e.preventDefault(); pasteAnim(ls); } }
}, true);
// ------------------------------------------------------------------ transitions (Transition Studio)
const TR_EASE = [['auto', 'Natural'], ['smooth', 'Smooth'], ['early', 'Front-loaded'], ['late', 'Back-loaded']];
const DIRN = { left: 'Left', right: 'Right', up: 'Up', down: 'Down' };
const trList = () => KT.visible({ dpg: !!A.B().builtin, parts: true });
const trCat = id => (KT.CATS.find(c => c[0] === id) || [0, ''])[1];
const sfxName = k => (api.SFX[k] || k || '').toString();
function trTargets() { const t = TL(); if (!t) return []; const ids = ED.multi.size > 1 ? [...ED.multi] : [ED.sel]; return t.main.filter((m, i) => i > 0 && ids.includes(m.id)); }
function applyTr(ids, id) {
  const T = KT.get(id); change(t => t.main.forEach((m, i) => { if (i === 0 || !ids.includes(m.id)) return; const prev = m.tr || {};
    if (id === 'cut' || !T) { m.tr = null; return; } m.tr = { type: id, d: T.d }; if (prev.text && T.text) m.tr.text = prev.text; if (prev.sfx === 'none') m.tr.sfx = 'none'; }));
  if (ED.panel === 'trans') renderPanel();
}
function setTr(ids, k, v, key) { change(t => t.main.forEach((m, i) => { if (i === 0 || !ids.includes(m.id) || !m.tr) return; if (v === '' || v === undefined || v === null) delete m.tr[k]; else m.tr[k] = v; }), key ? { key: key + ids.join() } : undefined); }
function trControls(box, ids, tr) {
  const T = KT.get(tr.type); if (!T) return; const g = grp(box, T.name);
  g.appendChild(el('p', 'note', T.desc));
  g.appendChild(rangeRow('Duration', 0.15, 2, 0.05, tr.d || T.d, v => setTr(ids, 'd', Math.round(v * 100) / 100, 'td'), v => v.toFixed(2) + ' s'));
  if (T.dirs) g.appendChild(segRow('Direction', T.dirs.map(d => [d, DIRN[d] || d]), tr.dir && T.dirs.includes(tr.dir) ? tr.dir : T.dirs[0], v => setTr(ids, 'dir', v === T.dirs[0] ? '' : v)));
  g.appendChild(rangeRow('Intensity', 0, 2, 0.05, tr.amt === undefined ? 1 : tr.amt, v => setTr(ids, 'amt', v === 1 ? '' : v, 'ta'), v => Math.round(v * 100) + '%'));
  g.appendChild(segRow('Timing', TR_EASE, tr.ease || 'auto', v => setTr(ids, 'ease', v === 'auto' ? '' : v)));
  if (T.color) { g.appendChild(colorRow('Colour', tr.col || '', v => setTr(ids, 'col', v, 'tc'))); if (tr.col) acts(g, [['Use the default colour', () => setTr(ids, 'col', '')]]); }
  if (T.text) g.appendChild(textRow('Word', tr.text || '', v => setTr(ids, 'text', v.trim() ? v.slice(0, 14) : '', 'tt'), { up: true, max: 14, ph: (A.B().short || '').toUpperCase(), hint: 'Short words work best. Empty uses the brand name.' }));
  const opts = [['auto', 'Automatic' + (T.sfx ? ' · ' + sfxName(T.sfx) : ' · none')], ['none', 'No sound']].concat(Object.entries(api.SFX).map(([k, n]) => [k, n]));
  g.appendChild(selRow('Sound on the cut', opts, tr.sfx || 'auto', v => setTr(ids, 'sfx', v === 'auto' ? '' : v)));
  if (tr.sfx !== 'none') g.appendChild(rangeRow('Sound volume', 0, 1.5, 0.05, tr.sfxVol === undefined ? 0.6 : tr.sfxVol, v => setTr(ids, 'sfxVol', v, 'tv'), v => Math.round(v * 100) + '%'));
  const nm = tr.sfx === 'none' ? '' : tr.sfx && tr.sfx !== 'auto' ? tr.sfx : T.sfx; acts(g, [['▶ Play the cut', () => { const m = F().M.find(x => x.id === ids[0]); if (m) { A.setT(Math.max(0, m.start - (tr.d || T.d) / 2 - 0.4)); A.play(); } }]].concat(nm ? [['♪ Hear the sound', () => api.previewSfx(nm)]] : []));
  if (!TL().autoSfx) g.appendChild(el('p', 'hint', 'Transition sounds are off for this edit (Audio → Whoosh on every transition).'));
}
XT.panels.trans = (box, h) => {
  const tg = trTargets(), cur = tg.length && tg[0].tr ? tg[0].tr.type : 'cut', ids = tg.map(m => m.id);
  if (tg.length) h.sec(tg.length > 1 ? 'Into the ' + tg.length + ' selected cuts' : 'Into “' + api.labelOf(tg[0]) + '”');
  else h.note('Select a clip on the timeline (any but the first), or click a diamond between two clips. Shift-click several clips to change them together.');
  const q = el('input', 'mx-search'); q.type = 'search'; q.placeholder = 'Search ' + trList().length + ' transitions'; q.setAttribute('aria-label', 'Search transitions'); q.value = ED.tq || ''; box.appendChild(q);
  const cats = [['all', 'All']].concat(NX.CLIB ? [['fav', '★ Favourites'], ['recent', 'Recent']] : []).concat(KT.CATS);
  chips(box, cats, ED.tcat2 || 'all', k => { ED.tcat2 = k; renderPanel(); });
  const g = el('div', 'mx-grid'); box.appendChild(g);
  const paint = () => { g.textContent = ''; const term = (ED.tq || '').toLowerCase().trim(), cat = ED.tcat2 || 'all', favs = NX.CLIB ? NX.CLIB.favs('tr') : [], rec = NX.CLIB ? NX.CLIB.recents('tr') : [];
    let list = trList(); if (cat === 'fav') list = list.filter(t => favs.includes(t.id)); else if (cat === 'recent') list = rec.map(id => KT.get(id)).filter(t => t && list.includes(t)); else if (cat !== 'all') list = list.filter(t => t.cat === cat);
    if (term) list = list.filter(t => (t.name + ' ' + t.desc + ' ' + trCat(t.cat)).toLowerCase().includes(term));
    for (const T of list) { const b = tile('tr', T.id, T.name, trCat(T.cat), () => { if (!tg.length) { A.toast('Select a clip first (any but the first), or click a diamond on the timeline.'); return; } applyTr(ids, T.id); }, pv => { pv.textContent = T.name; pv.style.font = '800 13px/1.15 Mont, sans-serif'; });
      if (T.id === cur && tg.length) b.setAttribute('aria-pressed', 'true'), b.style.borderColor = 'var(--accent)'; g.appendChild(b); }
    if (!list.length) g.appendChild(el('p', 'ep-note', cat === 'fav' ? 'Tap ★ on a transition to keep it here.' : cat === 'recent' ? 'Transitions you use show up here.' : 'Nothing matches. Try another word.')); };
  q.oninput = () => { ED.tq = q.value; paint(); }; paint();
  if (tg.length && tg[0].tr) trControls(box, ids, tg[0].tr);
  // a selected layer's own in/out lives here too, so the transition panel is the one place for all stitching
  const lo = findAny(ED.sel); if (lo && TL().layers.includes(lo) && !ED.multi.size) inOutGrp(box, lo, renderPanel);
  const g2 = grp(box, 'Every cut in the edit');
  const all = () => TL().main.filter((m, i) => i > 0).map(m => m.id);
  acts(g2, (tg.length && tg[0].tr ? [['Use this on every cut', () => { const src = clone(tg[0].tr); change(t => t.main.forEach((m, i) => { if (i > 0) m.tr = clone(src); })); A.toast('Applied to every cut.'); renderPanel(); }]] : []).concat([['Remove all transitions', () => change(t => t.main.forEach(m => { m.tr = null; }))]]));
  const sel = el('select'); sel.setAttribute('aria-label', 'Mix of transitions for every cut'); [['', 'Or mix them: pick a style…'], ['cine', 'Cinematic mix'], ['social', 'Social, fast'], ['premium', 'Premium, slow'], ['glitch', 'Glitchy'], ['photo', 'Photo album']].forEach(([k, n]) => { const op = el('option', '', n); op.value = k; sel.appendChild(op); });
  sel.onchange = () => { const k = sel.value; if (!k) return; const pool = trList().filter(t => t.cat === k || (k === 'social' && t.cat === 'dyn')).filter(t => t.id !== 'cut'); const ids2 = all(); change(t => t.main.forEach((m, i) => { if (i > 0) { const T = pool[(i * 7) % pool.length]; m.tr = { type: T.id, d: T.d }; } })); A.toast('Mixed ' + ids2.length + ' cuts.'); renderPanel(); };
  g2.appendChild(sel);
};
XT.trRow = (box, o) => {
  const g = grp(box, 'Transition in'), cur = o.tr && o.tr.type ? o.tr.type : 'cut';
  const w = el('div', 'fld'), id = 'mx-' + A.uid8(), lb = el('label', '', 'Transition'); lb.htmlFor = id; w.appendChild(lb); const s = el('select'); s.id = id;
  const o0 = el('option', '', 'Cut (none)'); o0.value = 'cut'; s.appendChild(o0);
  for (const [ck, cn] of KT.CATS) { const og = el('optgroup'); og.label = cn; for (const T of trList().filter(t => t.cat === ck && t.id !== 'cut')) { const op = el('option', '', T.name); op.value = T.id; og.appendChild(op); } s.appendChild(og); }
  s.value = KT.get(cur) ? cur : 'cut'; s.onchange = () => applyTr([o.id], s.value); w.appendChild(s); g.appendChild(w);
  acts(g, [['Browse with previews', () => { ED.panel = 'trans'; renderPanel(); }]]);
  if (o.tr && o.tr.type && KT.get(o.tr.type)) trControls(box, [o.id], o.tr);
};
XT.transMulti = (box, mains) => {
  const ids = mains.map(m => m.id), g = grp(box, 'Transition into the ' + ids.length + ' selected cuts'), s = el('select'); s.setAttribute('aria-label', 'Transition for the selected cuts');
  const o0 = el('option', '', 'Choose…'); o0.value = ''; s.appendChild(o0); const oc = el('option', '', 'Cut (none)'); oc.value = 'cut'; s.appendChild(oc);
  for (const [ck, cn] of KT.CATS) { const og = el('optgroup'); og.label = cn; for (const T of trList().filter(t => t.cat === ck && t.id !== 'cut')) { const op = el('option', '', T.name); op.value = T.id; og.appendChild(op); } s.appendChild(og); }
  s.onchange = () => { if (s.value) applyTr(ids, s.value); }; g.appendChild(s); acts(g, [['Browse with previews', () => { ED.panel = 'trans'; renderPanel(); }]]);
  const first = mains.find(m => m.tr); if (first) trControls(box, ids.filter(i => mains.find(m => m.id === i && m.tr)), first.tr);
};
// the Keyframes tab shows values at the playhead: refresh it when the playhead moves (not while playing)
let kT = 0; A.onTime.push(() => { if (!ED.on || S.playing || ED.itab !== 'keys' || !ED.sel) return; clearTimeout(kT); kT = setTimeout(() => { const a = document.activeElement; if (!(a && a.closest && a.closest('#einsp'))) renderInspector(); }, 120); });
NX.motion = { addType, addMg, applyMotion, copyAnim, pasteAnim, colorRow, tile, chips, applyMainMotion, mainMotion, syncRow, inOutGrp, textEntranceGrp, applyTextEntrance, multiInOutGrp, createGroup, groupMembers, effKfOf, unlinkGroup };
})();
