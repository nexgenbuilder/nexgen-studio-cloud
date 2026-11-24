'use strict';
/* NexGen Studio V12: the Text Studio, added to the editor's Text panel and the Creative Library.
   - Text compositions (engine K11, 71 designed sets in 17 collections): each inserts as separate, editable timeline layers
     sharing a group id; text from the brand kit / listing where it can be, clear placeholders where only the business knows
     (prices, numbers, names), industry copy for the brand's sector. Grouped parts select together or one at a time.
   - Animated captions: type or paste the script; it plays word by word (karaoke fill, word pop, highlight box, bounce, underline).
   - Looks and animations saved separately: a text's design (font, size, colour, effects) and its motion (entrance, exit, loop,
     timing) are presets of their own, so any look can be combined with any animation on any text. */
(() => {
if (!NX.editor || typeof K11 === 'undefined') return;
const X = NX.editor, A = NX.app, api = X.api, ED = X.ED, el = A.el, S = A.S, XT = X.XT, CAP = A.CAP;
const CSS = `
.ts-sec { margin: 4px 0 14px; }
.ts-search { width: 100%; background: var(--well); border: 1px solid var(--line2); border-radius: 9px; padding: 8px 11px; color: var(--fg); font: 500 13px var(--f-ui); margin: 0 0 8px; }
.ts-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.ts-tile { position: relative; display: flex; flex-direction: column; gap: 0; padding: 0; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--raise); text-align: left; color: var(--fg); }
.ts-tile .pv { display: grid; place-items: center; aspect-ratio: 9 / 12; background: #17141F center / cover no-repeat; color: #fff; font: 800 13px/1.15 Mont, sans-serif; text-align: center; padding: 6px; }
.ts-tile b { display: block; padding: 6px 8px 0; font: 700 12px/1.25 var(--f-ui); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ts-tile small { display: block; padding: 1px 8px 7px; font: 500 10.5px/1.3 var(--f-mono); color: var(--dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ts-tile:hover { border-color: var(--accent-line); }
.ts-more { margin-top: 8px; width: 100%; }
.ts-cap textarea { width: 100%; min-height: 70px; resize: vertical; background: var(--well); border: 1px solid var(--line2); border-radius: 9px; padding: 8px 11px; color: var(--fg); font: 500 13px/1.4 var(--f-ui); }
.ts-modes { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 6px; margin: 8px 0; }
.ts-modes button { border: 1px solid var(--line2); background: var(--surface); border-radius: 9px; padding: 8px 6px; font: 650 11.5px var(--f-ui); color: var(--mute); }
.ts-modes button[aria-pressed="true"] { border-color: var(--accent); color: var(--fg); background: var(--accent-soft); }
.ts-grp { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; background: var(--accent-soft); border: 1px solid var(--accent-line); border-radius: 10px; padding: 8px 10px; margin: 0 0 10px; font-size: 12.5px; }
.ts-grp b { font-weight: 700; }
.ts-pre { display: flex; flex-wrap: wrap; gap: 6px; }
.ts-pre button { border: 1px solid var(--line2); background: var(--surface); border-radius: 99px; padding: 5px 10px; font: 600 12px var(--f-ui); }
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: CSS }));
const TS = { cat: 'mine', q: '', n: 12, mode: 'karaoke', script: '' };
const sector = () => NX.sectorOfInd(A.B().industry) || null;
const catName = id => (K11.CATS.find(c => c[0] === id) || [0, id])[1];
const compCtx = () => ({ sector: sector(), prop: A.HOOK.listingFacts ? A.HOOK.listingFacts() : null });
const suits = c => !c.ind || !c.ind.length || c.ind.includes(sector());
// the compositions offered: usable for the brand's rules; "For you" puts the brand's own industry first
function comps(cat, q) {
  q = String(q || '').toLowerCase().trim();
  let L = K11.C.filter(c => K11.usable(c.id) && (cat === 'mine' ? suits(c) : cat === 'all' ? true : c.cat === cat));
  if (cat === 'mine') { const sc = sector(); L = L.slice().sort((a, b) => ((b.ind || []).includes(sc) ? 1 : 0) - ((a.ind || []).includes(sc) ? 1 : 0)); }
  if (q) L = L.filter(c => (c.name + ' ' + c.desc + ' ' + catName(c.cat) + ' ' + c.layers.map(l => l.text || '').join(' ')).toLowerCase().includes(q));
  return L;
}
// ------------------------------------------------------------------------------------------------ inserting
function insert(id) {
  const c = K11.BY[id]; if (!c) return false;
  if (!K11.usable(id)) { A.toast('“' + c.name + '” uses graphics this brand kit doesn’t allow (prices, offers or ratings).'); return false; }
  const Ls = K11.layers(id, compCtx()), g = 'g' + A.uid8(), t0 = Math.max(0, Math.min(S.t, Math.max(0, S.dur - 1))), ids = [];
  api.change(tl => { for (const L of Ls) { L.id = api.uid(); L.grp = g; L.gname = c.name; L.t0 = api.r3(t0 + L.t0); L.d = api.r3(Math.max(0.6, Math.min(L.d, S.dur - L.t0 > 0.6 ? S.dur - L.t0 : L.d))); tl.layers.push(L); ids.push(L.id); } });
  ED.multi.clear(); ids.forEach(i => ED.multi.add(i)); ED.sel = ids[0]; ED.itab = 'edit'; api.renderInspector(); if (api.renderTimeline) api.renderTimeline(); api.drawOv();
  if (NX.CLIB && NX.CLIB.recent) NX.CLIB.recent('comp', id);
  const ph = Ls.filter(L => /\bADD\b|YOUR (BRAND|LABEL|NAME|TITLE)|ROOM NAME|Dish Name|Product Name/.test(L.text || '') || (L.kind === 'mg' && K9.missing && K9.missing(L))).length;
  A.toast(c.name + ': ' + ids.length + ' layers added, grouped. Click any part to edit it.' + (ph ? ' Replace the placeholders with your real details.' : ''), 5200);
  return ids;
}
function ensureEditor() {
  const on = ED && ED.on; if (on) return true;
  if (S.tpl && S.tpl.id !== 'free') X.open(); else X.blank();
  return !!(ED && ED.on);
}
function insertAnywhere(id) { if (!ensureEditor()) { A.toast('Open the timeline editor first.'); return; } setTimeout(() => insert(id), 30); }
// ------------------------------------------------------------------------------------------------ captions
function addCaptions(text, mode) {
  text = String(text || '').replace(/\s+/g, ' ').trim(); if (!text) { A.toast('Type or paste what’s said first.'); return; }
  const words = text.split(' ').length, d = Math.max(2, Math.min(60, words * 0.42 + 0.6)), M = { karaoke: [78, 3, 'Mont', 900, 1180], pop: [120, 2, 'Bebas', 400, 1150], box: [70, 3, 'Mont', 800, 1180], bounce: [130, 1, 'Mont', 900, 1000], line: [54, 6, 'Mont', 600, 1280] }[mode] || [78, 3, 'Mont', 900, 1180];
  const L = { kind: 'text', style: 'type', text, x: 540, y: M[4], slot: M[2], wt: M[3], size: M[0], w: mode === 'line' ? 860 : 900, color: 'white', cap: { mode, per: M[1], hl: mode === 'pop' || mode === 'line' ? 'accent2' : 'accent' }, t0: api.r3(Math.max(0, Math.min(S.t, S.dur - 1))), d: api.r3(d), name: 'Captions' };
  if (mode !== 'box' && mode !== 'line') L.case = 'upper'; if (mode === 'line') { L.cap.bg = 'bar'; L.cap.bgc = 'ink'; }
  api.addLayer(L); A.toast('Captions added: ' + words + ' words over ' + d.toFixed(1) + ' s. Drag the ends on the timeline to fit the speech.', 5200);
}
function capControls(box, o) {
  const g = api.grp(box, 'Captions'), cp = o.cap || {};
  const modes = el('div', 'ts-modes'); for (const [k, n] of K8.CAP_MODES) { const b = el('button', '', n); b.type = 'button'; b.setAttribute('aria-pressed', String((cp.mode || 'karaoke') === k)); b.onclick = () => api.upd(o.id, x => { x.cap = Object.assign({}, x.cap, { mode: k }); if (k === 'line') { x.cap.bg = x.cap.bg || 'bar'; } }); modes.appendChild(b); } g.appendChild(modes);
  g.appendChild(api.rangeRow('Words on screen', 1, 8, 1, cp.per || 3, v => api.upd(o.id, x => { x.cap = Object.assign({}, x.cap, { per: v }); }, 'cper'), v => String(v)));
  g.appendChild(api.segRow('Spoken word', [['accent', 'Accent'], ['accent2', 'Accent 2'], ['white', 'White'], ['ink', 'Ink']], cp.hl || 'accent', v => api.upd(o.id, x => { x.cap = Object.assign({}, x.cap, { hl: v }); })));
  g.appendChild(api.segRow('Behind', [['none', 'Nothing'], ['bar', 'Bar'], ['pill', 'Pill']], cp.bg || 'none', v => api.upd(o.id, x => { x.cap = Object.assign({}, x.cap, { bg: v }); if (v === 'none') delete x.cap.bg; })));
  const words = String(o.text || '').split(/\s+/).filter(Boolean).length;
  api.acts(g, [['Fit length to the words (' + (words * 0.42 + 0.6).toFixed(1) + ' s)', () => api.upd(o.id, x => { x.d = api.r3(Math.max(2, words * 0.42 + 0.6)); })], ['Turn into plain text', () => api.upd(o.id, x => { delete x.cap; x.anim = { in: 'words', out: 'fade' }; })]]);
}
// ------------------------------------------------------------------------------------------------ looks and animations, saved separately
const LOOK_KEYS = ['slot', 'font', 'wt', 'ital', 'size', 'track', 'lead', 'align', 'case', 'w', 'layout', 'color', 'fx'], LOCAL = [];
const pick = (o, keys) => { const r = {}; for (const k of keys) if (o[k] !== undefined) r[k] = JSON.parse(JSON.stringify(o[k])); return r; };
function presets(kind) { const db = NX.CLIB && NX.CLIB.allPresets ? NX.CLIB.allPresets(kind) : []; return db.concat(LOCAL.filter(p => p.brand === A.B().id && p.kind === kind)); }
async function savePart(o, kind) {
  const data = kind === 'look' ? pick(o, LOOK_KEYS) : pick(o, ['anim', 'kf']); if (kind === 'motion') data.d = o.d;
  const def = kind === 'look' ? String(o.text || 'Text').split('\n')[0].slice(0, 20) + ' look' : ((K8.IN[(o.anim || {}).in] || {}).name || 'Custom') + ' motion';
  let name = null; try { name = (prompt(kind === 'look' ? 'Name this look (font, size, colour and effects; no animation):' : 'Name this animation (entrance, exit, loop and timing; no styling):', def) || '').trim(); } catch (e) { name = def; }
  if (!name) return;
  const p = { id: 'p' + A.uid8(), brand: A.B().id, kind, name: name.slice(0, 40), data, by: CAP.uid || '', createdAt: new Date().toISOString() };
  if (CAP.db) { try { await CAP.db.doc('presets/' + p.id).set(p); A.toast('Saved “' + p.name + '”. Apply it to any text from the Text panel.'); return; } catch (e) { /* falls back to this session */ } }
  LOCAL.unshift(p); A.toast('Saved “' + p.name + '” for this session.');
}
function applyPart(p, id) {
  const t = api.TL(), sel = id ? t.layers.find(x => x.id === id) : t && t.layers.find(x => x.id === ED.sel && x.style === 'type');
  if (!sel) { A.toast('Select a text on the timeline first, then apply “' + p.name + '”.'); return; }
  api.upd(sel.id, x => { if (p.kind === 'look') { for (const k of LOOK_KEYS) if (k !== 'w') delete x[k]; Object.assign(x, JSON.parse(JSON.stringify(p.data))); if (x.font) NX.useFont(x.font).then(() => A.refresh(true)); }
    else { x.anim = JSON.parse(JSON.stringify(p.data.anim || {})); if (p.data.kf) x.kf = JSON.parse(JSON.stringify(p.data.kf)); else delete x.kf; } });
  A.toast('Applied “' + p.name + '”.');
}
// ------------------------------------------------------------------------------------------------ the Text panel
function tile(c, onClick) {
  const b = el('button', 'ts-tile'); b.type = 'button'; b.title = c.name + ' — ' + c.desc; b.dataset.comp = c.id;
  const pv = el('span', 'pv'); b.appendChild(pv); b.appendChild(el('b', '', c.name)); b.appendChild(el('small', '', catName(c.cat) + ' · ' + c.layers.length + ' layer' + (c.layers.length > 1 ? 's' : '')));
  const fb = p => { p.textContent = String((c.layers.find(l => l.k === 't') || {}).text || c.name).replace(/\{\w+\}/g, 'BRAND').split('\n')[0].slice(0, 18); };
  if (NX.PV && NX.PV.attach) NX.PV.attach(pv, 'comp', c.id, fb); else fb(pv);
  if (NX.CLIB && NX.CLIB.favBtn) b.appendChild(NX.CLIB.favBtn('comp', c.id));
  b.onclick = e => { if (e.target.closest('.fav')) return; onClick(); }; return b;
}
function chips(box, list, cur, on) { const w = el('div', 'mx-chips'); for (const [k, n] of list) { const b = el('button', '', n); b.type = 'button'; b.setAttribute('aria-pressed', String(cur === k)); b.onclick = () => on(k); w.appendChild(b); } box.appendChild(w); return w; }
const prevTop = XT.textTop;
XT.textTop = (box, h) => {
  // compositions
  const sec = el('div', 'ts-sec'); box.appendChild(sec);
  h.sec('Text compositions'); sec.appendChild(box.lastChild);
  const note = el('p', 'ep-note', K11.C.length + ' designed text sets. Each adds as separate layers you can edit, move and retime. Your brand fonts and colours, your industry’s words.'); sec.appendChild(note);
  const q = el('input', 'ts-search'); q.type = 'search'; q.placeholder = 'Search: price, lower third, neon, listing…'; q.setAttribute('aria-label', 'Search text compositions'); q.value = TS.q; sec.appendChild(q);
  const cats = [['mine', 'For you'], ['all', 'All']].concat(K11.CATS);
  chips(sec, cats, TS.cat, k => { TS.cat = k; TS.n = 12; api.renderPanel(); });
  const grid = el('div', 'ts-grid'); sec.appendChild(grid); const more = el('button', 'btn sm ts-more'); more.type = 'button'; sec.appendChild(more);
  const paint = () => { grid.textContent = ''; const L = comps(TS.cat, TS.q); for (const c of L.slice(0, TS.n)) grid.appendChild(tile(c, () => insert(c.id)));
    if (!L.length) grid.appendChild(el('p', 'ep-note', 'Nothing matches. Try another word.')); more.hidden = L.length <= TS.n; more.textContent = 'Show ' + Math.min(24, L.length - TS.n) + ' more'; };
  more.onclick = () => { TS.n += 24; paint(); }; q.oninput = () => { TS.q = q.value; TS.n = 12; paint(); }; paint();
  // captions
  const cs = el('div', 'ts-sec ts-cap'); box.appendChild(cs); h.sec('Animated captions'); cs.appendChild(box.lastChild);
  cs.appendChild(el('p', 'ep-note', 'Type or paste what’s said. Captions play word by word, so the video works with the sound off.'));
  const ta = el('textarea'); ta.id = 'tsCapText'; ta.placeholder = 'e.g. Here’s how we turned this backyard around in two weeks'; ta.value = TS.script; ta.oninput = () => (TS.script = ta.value); cs.appendChild(ta);
  const md = el('div', 'ts-modes'); for (const [k, n] of K8.CAP_MODES) { const b = el('button', '', n); b.type = 'button'; b.setAttribute('aria-pressed', String(TS.mode === k)); b.onclick = () => { TS.mode = k; md.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); }; md.appendChild(b); } cs.appendChild(md);
  const add = el('button', 'btn sm dark'); add.type = 'button'; add.id = 'tsCapAdd'; add.textContent = 'Add captions'; add.onclick = () => addCaptions(ta.value, TS.mode); cs.appendChild(add);
  // saved looks and animations
  const looks = presets('look'), motions = presets('motion');
  if (looks.length || motions.length) {
    const ps = el('div', 'ts-sec'); box.appendChild(ps); h.sec('Your looks & animations'); ps.appendChild(box.lastChild);
    ps.appendChild(el('p', 'ep-note', 'Select a text, then tap a look or an animation to apply just that part.'));
    for (const [lab, list] of [['Looks', looks], ['Animations', motions]]) { if (!list.length) continue; ps.appendChild(el('p', 'ep-note', lab)); const w = el('div', 'ts-pre'); for (const p of list) { const b = el('button', '', p.name); b.type = 'button'; b.onclick = () => applyPart(p); w.appendChild(b); } ps.appendChild(w); }
  }
  if (prevTop) prevTop(box, h);
};
// the layer inspector: group row, caption controls, save look / animation
const prevLayer = XT.inspect.layer;
XT.inspect.layer = (box, o, legacy) => {
  const r = prevLayer(box, o, legacy);
  const tabs = box.querySelector('.itabs');
  if (o.grp) {
    const t = api.TL(), parts = t ? t.layers.filter(x => x.grp === o.grp) : [], row = el('div', 'ts-grp');
    row.appendChild(el('span', '', 'Part of ')); row.appendChild(el('b', '', o.gname || 'a composition')); row.appendChild(el('span', '', ' · ' + parts.length + ' layers'));
    const all = el('button', 'btn sm', 'Select all parts'); all.type = 'button'; all.onclick = () => { ED.multi.clear(); parts.forEach(x => ED.multi.add(x.id)); ED.sel = o.id; api.renderInspector(); api.drawOv(); };
    const un = el('button', 'btn sm ghost', 'Ungroup'); un.type = 'button'; un.onclick = () => api.change(tl => tl.layers.forEach(x => { if (x.grp === o.grp) { delete x.grp; delete x.gname; } }));
    row.appendChild(all); row.appendChild(un);
    if (tabs) tabs.before(row); else box.prepend(row);
  }
  if (o.cap && o.style === 'type' && ED.itab === 'edit') { const holder = el('div'); capControls(holder, o); const firstGrp = box.querySelector('.itabs ~ div'); if (firstGrp) firstGrp.prepend(holder); else box.appendChild(holder); }
  if (o.style === 'type' && !o.cap && (ED.itab === 'style' || ED.itab === 'anim')) api.acts(box, ED.itab === 'style' ? [['Save this look', () => savePart(o, 'look')]] : [['Save this animation', () => savePart(o, 'motion')]]);
  return r;
};
// a grouped layer clicked on the preview keeps its group visible on the timeline
NX.textStudio = { insert, insertAnywhere, addCaptions, comps, savePart, applyPart, presets, compCtx };
})();
