'use strict';
/* NexGen Studio V10: the Creative Library.
   NX.PV   animated previews from sprite sheets rendered by the engine itself (pv_build.py -> pv/<kind>_<part>.jpg + pv/atlas.json):
           a tile shows its poster frame and plays on hover or focus. Sheets load per kind, only when a panel needs them.
   NX.CLIB favourites and recents (each person's own: db data/users/<id>/library, or this browser when there is no db),
           brand presets (db presets/<id>: a text style, graphic or transition saved with its settings, shared by everyone on the brand),
           and the library browser: templates, transitions, text styles, text animations, motion graphics, effects and overlays,
           sound effects, music, font pairings, end cards, presets, favourites and recent, all searchable, previewable and usable. */
(() => {
const A = NX.app, el = A.el, S = A.S, CAP = A.CAP;
const ED = () => NX.editor && NX.editor.ED, api = () => NX.editor.api;

// ============================================================ previews
const PV = { meta: null, loading: null, imgs: {}, pending: [] };
function loadMeta() { if (!PV.loading) PV.loading = fetch('pv/atlas.json').then(r => (r.ok ? r.json() : {})).catch(() => ({})).then(m => { PV.meta = m; const p = PV.pending.splice(0); p.forEach(a => a()); return m; }); return PV.loading; }
function sheet(kind, part) { const k = kind + '_' + part; if (!PV.imgs[k]) { const im = new Image(); im.src = 'pv/' + k + '.jpg' + (PV.meta && PV.meta[kind] ? '?v=' + PV.meta[kind].v : ''); PV.imgs[k] = im; } return PV.imgs[k]; }
function paint(pv, kind, id, fi) {
  const m = PV.meta && PV.meta[kind], rr = m && m.rows[id]; if (!rr) return false; const [part, row] = rr;
  const tw = pv.clientWidth, th = pv.clientHeight; if (!tw || !th) return false;
  const s = Math.max(tw / m.w, th / m.h * (pv.dataset.fit === 'full' ? 1 : 0)), fw = m.w * s, fh = m.h * s, rows = Object.values(m.rows).filter(x => x[0] === part).length;
  const im = sheet(kind, part); pv.style.backgroundImage = 'url("' + im.src + '")'; pv.style.backgroundSize = (fw * m.n) + 'px ' + (fh * rows) + 'px';
  pv.style.backgroundPosition = (-fi * fw) + 'px ' + (-(row * fh) - (fh - th) / 2) + 'px'; pv.style.backgroundRepeat = 'no-repeat'; pv.textContent = ''; return true;
}
function attach(pv, kind, id, fallback) {
  if (fallback) fallback(pv);
  const go = () => { const m = PV.meta && PV.meta[kind]; if (!m || !m.rows[id]) return; const poster = () => paint(pv, kind, id, m.poster);
    const tryPaint = (n) => { if (!pv.isConnected && n > 0) return; if (!poster() && n < 30) requestAnimationFrame(() => tryPaint(n + 1)); }; tryPaint(0);
    let iv = 0, fi = 0; const host = pv.closest('button, .lib-item') || pv;
    const start = () => { if (iv) return; fi = 0; iv = setInterval(() => { fi = (fi + 1) % m.n; paint(pv, kind, id, fi); }, 95); };
    const stop = () => { clearInterval(iv); iv = 0; poster(); };
    host.addEventListener('pointerenter', start); host.addEventListener('pointerleave', stop); host.addEventListener('focus', start); host.addEventListener('blur', stop);
    if (pv.dataset.autoplay) start(); };
  if (PV.meta) go(); else { PV.pending.push(go); loadMeta(); }
}
NX.PV = { attach, loadMeta, paint };

// ============================================================ favourites, recents, presets
const PR = { favs: {}, recent: [], loaded: false, presets: [] };
const LSK = 'nx-clib';
async function prefsDoc() { if (!CAP.db || !CAP.uid) return null; return CAP.db.doc('data/users/' + CAP.uid + '/library'); }
async function loadPrefs() {
  if (PR.loaded) return; PR.loaded = true;
  try { const d = await prefsDoc(); if (d) { const snap = await d.get(); const v = snap && (snap.data ? snap.data() : snap); if (v && v.favs) { PR.favs = v.favs || {}; PR.recent = v.recent || []; return; } } } catch (e) {}
  try { const v = JSON.parse(localStorage.getItem(LSK) || 'null'); if (v) { PR.favs = v.favs || {}; PR.recent = v.recent || []; } } catch (e) {}
}
let saveT = 0;
function savePrefs() { clearTimeout(saveT); saveT = setTimeout(async () => { const body = { favs: PR.favs, recent: PR.recent.slice(0, 60) };
  try { localStorage.setItem(LSK, JSON.stringify(body)); } catch (e) {} try { const d = await prefsDoc(); if (d) await d.set(body); } catch (e) {} }, 500); }
const favs = kind => PR.favs[kind] || [];
const isFav = (kind, id) => favs(kind).includes(id);
function toggleFav(kind, id) { const l = favs(kind).slice(), i = l.indexOf(id); if (i >= 0) l.splice(i, 1); else l.unshift(id); PR.favs[kind] = l; savePrefs(); return i < 0; }
function recent(kind, id) { PR.recent = [{ k: kind, id, at: Date.now() }].concat(PR.recent.filter(r => !(r.k === kind && r.id === id))).slice(0, 60); savePrefs(); }
const recents = kind => PR.recent.filter(r => !kind || r.k === kind).map(r => (kind ? r.id : r));
function favBtn(kind, id) {
  const b = el('button', 'fav', isFav(kind, id) ? '★' : '☆'); b.type = 'button'; const lab = () => (isFav(kind, id) ? 'Remove from favourites' : 'Add to favourites'); b.title = lab(); b.setAttribute('aria-label', lab()); b.setAttribute('aria-pressed', String(isFav(kind, id)));
  b.onclick = e => { e.stopPropagation(); e.preventDefault(); const on = toggleFav(kind, id); b.textContent = on ? '★' : '☆'; b.setAttribute('aria-pressed', String(on)); b.title = lab(); b.setAttribute('aria-label', lab()); };
  return b;
}
loadPrefs();
// presets: brand-level, shared through the db
function subPresets() { if (!CAP.db) return; try { CAP.db.collection('presets').onSnapshot(snap => { const out = (snap.docs || []).map(d => (d.data ? d.data() : d)).filter(v => v && v.id && v.brand); PR.presets = out.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))); if (LIB.open) render(); }, e => console.warn('presets', e)); } catch (e) { console.warn('presets', e); } }
subPresets();
const brandPresets = kind => PR.presets.filter(p => p.brand === A.B().id && (!kind || p.kind === kind));
const LOCAL_PRESETS = [];   // without a db (local preview) presets live for this session only
function allPresets(kind) { return brandPresets(kind).concat(LOCAL_PRESETS.filter(p => p.brand === A.B().id && (!kind || p.kind === kind))); }
async function savePreset(L) {
  const kind = L.kind === 'mg' ? 'mg' : L.style === 'type' ? 'type' : null; if (!kind) return;
  const def = kind === 'type' ? (String(L.text || 'Text').split('\n')[0].slice(0, 24) + ' style') : ((K9.EL[L.type] || {}).name || 'Graphic');
  const name = (prompt('Name this preset (it is saved to the brand, for everyone who edits it):', def) || '').trim(); if (!name) return;
  const data = JSON.parse(JSON.stringify(L)); delete data.id; delete data.t0; ['x', 'y'].forEach(k => { if (data.kf && data.kf[k]) { const b0 = k === 'x' ? 540 : 960, d0 = data[k] - b0; data.kf[k] = data.kf[k].map(q => Object.assign({}, q, { v: q.v - d0 })); } }); data.x = 540; data.y = data.y > 1200 ? 1480 : data.y < 760 ? 470 : 960;
  const p = { id: 'p' + A.uid8(), brand: A.B().id, kind, name: name.slice(0, 40), data, by: CAP.uid || '', createdAt: new Date().toISOString() };
  if (CAP.db) { try { await CAP.db.doc('presets/' + p.id).set(p); A.toast('Saved “' + p.name + '” to ' + (A.B().short || A.B().name) + '’s presets.'); } catch (e) { A.toast('Couldn’t save the preset (you may not have edit access).'); } }
  else { LOCAL_PRESETS.unshift(p); A.toast('Saved for this session. Presets are stored with the brand when the studio is opened on claude.ai.'); }
}
async function saveTrPreset(tr) {
  const T = KT.get(tr.type); const name = (prompt('Name this transition preset:', T ? T.name + ' (custom)' : 'Transition') || '').trim(); if (!name) return;
  const p = { id: 'p' + A.uid8(), brand: A.B().id, kind: 'tr', name: name.slice(0, 40), data: JSON.parse(JSON.stringify(tr)), by: CAP.uid || '', createdAt: new Date().toISOString() };
  if (CAP.db) { try { await CAP.db.doc('presets/' + p.id).set(p); A.toast('Saved “' + p.name + '”.'); } catch (e) { A.toast('Couldn’t save the preset.'); } } else { LOCAL_PRESETS.unshift(p); A.toast('Saved for this session.'); }
}
async function deletePreset(p) { if (!confirm('Delete the preset “' + p.name + '” for everyone on this brand?')) return; if (CAP.db && PR.presets.includes(p)) { try { await CAP.db.doc('presets/' + p.id).delete(); } catch (e) { A.toast('Couldn’t delete it.'); } } else { const i = LOCAL_PRESETS.indexOf(p); if (i >= 0) LOCAL_PRESETS.splice(i, 1); } render(); }

// ============================================================ using things
const inEd = () => !!(ED() && ED().on);
function ensureEd() { if (!inEd()) { NX.editor.blank(); A.toast('Started a new edit for it. Add footage from Media.', 5000); } }
function usePreset(p) {
  if ((p.kind === 'look' || p.kind === 'motion') && NX.textStudio) { ensureEd(); NX.textStudio.applyPart(p); return; }
  if (p.kind === 'tr') { const ids = trIds(); if (!ids.length) { A.toast('Select a clip on the timeline first (any but the first).'); return; } api().change(t => t.main.forEach((m, i) => { if (i > 0 && ids.includes(m.id)) m.tr = JSON.parse(JSON.stringify(p.data)); })); return; }
  ensureEd(); const L = Object.assign(JSON.parse(JSON.stringify(p.data)), api().layerTimes(p.data.d || 3)); if (L.font) NX.useFont(L.font).then(() => A.refresh(true)); api().addLayer(L);
}
function trIds() { const e = ED(), t = api().TL(); if (!e || !t) return []; const ids = e.multi.size > 1 ? [...e.multi] : [e.sel]; return t.main.filter((m, i) => i > 0 && ids.includes(m.id)).map(m => m.id); }
const USE = {
  tpl: id => { const t = A.TPL(id); if (t) A.openProject(A.newProject(t)); },
  tr: id => { if (!inEd()) { A.toast('Open an edit and select a clip to use a transition (Create → Edit).'); return; } const ids = trIds(); if (!ids.length) { A.toast('Select a clip on the timeline first (any but the first).'); return; }
    const T = KT.get(id); api().change(t => t.main.forEach((m, i) => { if (i > 0 && ids.includes(m.id)) m.tr = id === 'cut' ? null : { type: id, d: T.d }; })); },
  style: id => { ensureEd(); const P = K8.STYLES.find(x => x.id === id); if (P) NX.motion.addType(P); },
  anim: (id, sub) => { ensureEd(); const e = ED(), t = api().TL(), sel = t && t.layers.find(x => x.id === e.sel && x.style === 'type'); const key = sub === 'tout' ? 'out' : sub === 'tloop' ? 'loop' : 'in';
    if (sel) api().upd(sel.id, x => { x.anim = x.anim || {}; x.anim[key] = id; if (key === 'in') { delete x.anim.inD; delete x.anim.stagger; } }); else { NX.motion.addType(null); const L = api().TL().layers.at(-1); api().upd(L.id, x => { x.anim = Object.assign({ in: 'rise', out: 'fade' }, x.anim, { [key]: id }); }); } },
  mg: id => { ensureEd(); NX.motion.addMg(id); },
  comp: id => { if (NX.textStudio) NX.textStudio.insertAnywhere(id); },
  sfx: id => { ensureEd(); api().addSfx(id); },
  music: id => { ensureEd(); api().change(t => { t.music.bed = id; }); A.toast('Music set to ' + ((api().BEDS.find(b => b[0] === id) || [0, id])[1]) + '.'); },
  fonts: id => { const pair = (NX.FONT_PAIRS.find(p => p[0] === id) || [])[1]; if (!pair || !S.proj) { A.toast('Open a video first, then pick a font pairing.'); return; } S.proj.style = S.proj.style || {}; S.proj.style.fonts = Object.assign({}, pair); A.styleChanged(true); A.toast('Fonts set to ' + id + ' for this video.'); },
  end: id => { ensureEd(); const t = api().TL(), last = t.main[t.main.length - 1]; if (last && last.type === 'end') api().change(tl => { tl.main[tl.main.length - 1].style = id; }); else api().change(tl => tl.main.push({ id: api().uid(), type: 'end', style: id, d: 4, tr: tl.main.length ? { type: 'dissolve', d: 0.5 } : null })); },
};

// ============================================================ the library browser
const CSS = `
#libModal .lib-wrap { width: min(1180px, 96vw); height: min(820px, 92vh); display: grid; grid-template-columns: 210px 1fr; grid-template-rows: auto 1fr; background: var(--panel); border-radius: 16px; overflow: hidden; border: 1px solid var(--line); }
#libModal .lib-top { grid-column: 1 / -1; display: flex; gap: 10px; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--line); }
#libModal .lib-top h2 { margin: 0; font: 800 17px/1 var(--f-ui); white-space: nowrap; }
#libModal .lib-top input { flex: 1; min-width: 0; background: var(--well); border: 1px solid var(--line2); border-radius: 9px; padding: 9px 12px; color: var(--fg); font: 500 14px var(--f-ui); }
#libModal .lib-nav { overflow: auto; padding: 10px 8px; border-right: 1px solid var(--line); }
#libModal .lib-nav button { display: flex; justify-content: space-between; width: 100%; background: transparent; border: 0; border-radius: 8px; padding: 9px 10px; font: 600 13px/1.2 var(--f-ui); color: var(--mute); text-align: left; }
#libModal .lib-nav button small { font: 600 11px var(--f-mono); color: var(--dim); }
#libModal .lib-nav button[aria-current="true"] { background: var(--accent-soft); color: var(--fg); }
#libModal .lib-nav hr { border: 0; border-top: 1px solid var(--line); margin: 8px 4px; }
#libModal .lib-main { display: grid; grid-template-columns: 1fr 300px; min-height: 0; }
#libModal .lib-list { overflow: auto; padding: 14px 16px 30px; }
#libModal .lib-list h3 { font: 700 10.5px/1 var(--f-mono); letter-spacing: .14em; text-transform: uppercase; color: var(--dim); margin: 16px 0 8px; }
#libModal .lib-list h3:first-child { margin-top: 0; }
#libModal .lib-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 10px; }
#libModal .lib-item { position: relative; background: var(--raise); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; padding: 0; text-align: left; color: var(--fg); }
#libModal .lib-item[aria-selected="true"] { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
#libModal .lib-item .pv { display: grid; place-items: center; aspect-ratio: 9 / 13; background: #15151B center / cover no-repeat; color: #fff; font: 800 15px/1.15 Mont, sans-serif; text-align: center; padding: 6px; overflow: hidden; }
#libModal .lib-item img.pv { object-fit: cover; width: 100%; padding: 0; }
#libModal .lib-item b { display: block; padding: 7px 9px 0; font: 700 12px/1.25 var(--f-ui); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#libModal .lib-item small { display: block; padding: 2px 9px 8px; font: 500 10.5px/1.3 var(--f-mono); color: var(--dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#libModal .lib-item .fav { position: absolute; right: 6px; top: 6px; width: 26px; height: 26px; border-radius: 50%; border: 0; background: rgba(0,0,0,.55); color: #fff; font-size: 14px; line-height: 26px; padding: 0; }
#libModal .lib-item .fav[aria-pressed="true"] { color: #FFC857; }
#libModal .lib-side { border-left: 1px solid var(--line); padding: 16px; overflow: auto; display: flex; flex-direction: column; gap: 10px; }
#libModal .lib-side .big { width: 100%; aspect-ratio: 9 / 16; max-height: 380px; border-radius: 10px; background: #15151B center / cover no-repeat; display: grid; place-items: center; color: #fff; font: 800 22px/1.1 Mont; text-align: center; overflow: hidden; }
#libModal .lib-side img.big { object-fit: cover; }
#libModal .lib-side h4 { margin: 0; font: 800 16px/1.2 var(--f-ui); }
#libModal .lib-side p { margin: 0; font-size: 13px; color: var(--mute); }
#libModal .lib-side .meta { font: 600 11px var(--f-mono); color: var(--dim); text-transform: uppercase; letter-spacing: .1em; }
#libModal .lib-side .row { display: flex; gap: 8px; flex-wrap: wrap; }
#libModal .lib-empty { color: var(--dim); font-size: 13px; padding: 30px 0; }
@media (max-width: 820px) { #libModal .lib-wrap { grid-template-columns: 1fr; grid-template-rows: auto auto 1fr; } #libModal .lib-nav { display: flex; overflow-x: auto; border-right: 0; border-bottom: 1px solid var(--line); padding: 6px; } #libModal .lib-nav button { width: auto; white-space: nowrap; } #libModal .lib-nav hr { display: none; }
  #libModal .lib-main { grid-template-columns: 1fr; } #libModal .lib-side { border-left: 0; border-top: 1px solid var(--line); max-height: 40vh; } #libModal .lib-side .big { max-height: 200px; width: auto; } }
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: CSS }));
const LIB = { open: false, sec: 'tr', q: '', sel: null, sub: 'tin' };
const modal = el('div', 'modal'); modal.id = 'libModal'; modal.hidden = true; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', 'Creative library');
const wrap = el('div', 'lib-wrap'); modal.appendChild(wrap); document.body.appendChild(modal);
const top = el('div', 'lib-top'); wrap.appendChild(top); top.appendChild(el('h2', '', 'Creative library'));
const search = el('input'); search.type = 'search'; search.placeholder = 'Search everything: “neon”, “price”, “glitch”, “luxury”…'; search.setAttribute('aria-label', 'Search the library'); top.appendChild(search);
const close = el('button', 'btn ghost', 'Close'); close.type = 'button'; top.appendChild(close);
const nav = el('nav', 'lib-nav'); nav.setAttribute('aria-label', 'Library sections'); wrap.appendChild(nav);
const main = el('div', 'lib-main'); wrap.appendChild(main); const list = el('div', 'lib-list'); main.appendChild(list); const side = el('div', 'lib-side'); main.appendChild(side);
close.onclick = () => closeLib(); modal.addEventListener('click', e => { if (e.target === modal) closeLib(); });
document.addEventListener('keydown', e => { if (LIB.open && e.key === 'Escape') { e.preventDefault(); closeLib(); } }, true);
search.oninput = () => { LIB.q = search.value; render(); };

const lc = s => String(s || '').toLowerCase();
function items(sec) {   // every section's items: {kind, pk (preview kind), id, name, cat, desc, use}
  const B = A.B(), out = [];
  if (sec === 'tpl') for (const t of NX.TPLS.filter(x => !x.hidden)) out.push({ kind: 'tpl', id: t.id, name: t.name, cat: t.fam || '', desc: t.blurb || '', img: A.posterFor(t.id) || (t.live ? '' : 'posters/' + t.id + '.jpg'), use: () => USE.tpl(t.id) });
  if (sec === 'tr') for (const T of KT.visible({ dpg: !!B.builtin, parts: true })) out.push({ kind: 'tr', pk: 'tr', id: T.id, name: T.name, cat: (KT.CATS.find(c => c[0] === T.cat) || [0, ''])[1], desc: T.desc + (T.sfx ? ' Sound: ' + (api().SFX[T.sfx] || T.sfx) + '.' : ''), use: () => USE.tr(T.id) });
  if (sec === 'comp' && typeof K11 !== 'undefined') for (const c of K11.C) { if (!K11.usable(c.id)) continue; out.push({ kind: 'comp', pk: 'comp', id: c.id, name: c.name, cat: (K11.CATS.find(x => x[0] === c.cat) || [0, ''])[1], desc: c.desc + ' Adds ' + c.layers.length + ' editable layer' + (c.layers.length > 1 ? 's' : '') + ', grouped.', use: () => USE.comp(c.id) }); }
  if (sec === 'style') for (const P of K8.STYLES) out.push({ kind: 'style', pk: 'style', id: P.id, name: P.name, cat: P.cat, desc: 'Animated text style: ' + (K8.IN[P.L.anim && P.L.anim.in] || {}).name + ' in, ' + (K8.OUT[P.L.anim && P.L.anim.out] || {}).name + ' out. Uses your brand fonts and colours.', use: () => USE.style(P.id) });
  if (sec === 'anim') for (const [sub, src, lab] of [['tin', K8.IN, 'Entrance'], ['tout', K8.OUT, 'Exit'], ['tloop', K8.LOOP, 'Loop']]) for (const [k, p] of Object.entries(src)) { if (k === 'none') continue; out.push({ kind: 'anim:' + sub, pk: sub, id: k, name: p.name, cat: lab + (p.cat ? ' · ' + p.cat : ''), sub, desc: lab + ' animation for text. Applies to the selected text, or adds new text with it.', use: () => USE.anim(k, sub) }); }
  if (sec === 'mg' || sec === 'fx') for (const id of K9.ORDER) { const e = K9.EL[id]; if ((sec === 'fx') !== (e.cat === 'cine') || !K9.allowed(id)) continue; out.push({ kind: 'mg', pk: 'mg', id, name: e.name, cat: (K9.CATS.find(c => c[0] === e.cat) || [0, ''])[1], desc: e.desc, use: () => USE.mg(id) }); }
  if (sec === 'sfx') for (const [cat, keys] of api().SFX_CATS) for (const k of keys) out.push({ kind: 'sfx', id: k, name: api().SFX[k], cat, desc: 'Original sound effect, made in-house. Plays at the playhead.', audio: () => api().previewSfx(k), use: () => USE.sfx(k) });
  if (sec === 'music') for (const [k, n, d] of api().BEDS) { if (k === 'none') continue; out.push({ kind: 'music', id: k, name: n, cat: 'Music bed', desc: 'Original music, ' + d + '. Loops to fit the edit.', bed: k, use: () => USE.music(k) }); }
  if (sec === 'fonts') for (const [n, f] of NX.FONT_PAIRS) out.push({ kind: 'fonts', id: n, name: n, cat: 'Font pairing', desc: ['sans', 'serif', 'display', 'script'].map(k => (((window.NX && NX.allFontLib) ? NX.allFontLib() : NX.FONTLIB)[f[k]] || {}).l).filter(Boolean).join(' · '), font: f, use: () => USE.fonts(n) });
  if (sec === 'end') for (const [k, n, d] of [['kinetic', 'Kinetic', 'Logo build and pill call to action'], ['grunge', 'Grunge', 'Stamped logo and rough label'], ['blueprint', 'Blueprint', 'Scan line and dimensions'], ['editorial', 'Editorial', 'Paper and a serif tagline']]) out.push({ kind: 'end', pk: 'end', id: k, name: n, cat: 'End card', desc: d + '. Uses the brand’s logo, call to action, phone and website.', use: () => USE.end(k) });
  if (sec === 'presets') for (const p of allPresets()) out.push({ kind: 'preset', id: p.id, name: p.name, cat: p.kind === 'tr' ? 'Transition' : p.kind === 'mg' ? 'Graphic' : p.kind === 'look' ? 'Text look' : p.kind === 'motion' ? 'Text animation' : 'Text style', desc: 'Saved to ' + (B.short || B.name) + '.', preset: p, use: () => usePreset(p) });
  return out;
}
const SECS = [['tpl', 'Templates'], ['tr', 'Transitions'], ['comp', 'Text compositions'], ['style', 'Text styles'], ['anim', 'Text animations'], ['mg', 'Motion graphics'], ['fx', 'Effects & overlays'], ['sfx', 'Sound effects'], ['music', 'Music'], ['fonts', 'Font pairings'], ['end', 'End cards'], ['-'], ['presets', 'Brand presets'], ['fav', '★ Favourites'], ['recent', 'Recent']];
const KIND_SEC = { tpl: 'tpl', tr: 'tr', comp: 'comp', style: 'style', mg: 'mg', sfx: 'sfx', music: 'music', fonts: 'fonts', end: 'end' };
function allItems() { return ['tpl', 'tr', 'comp', 'style', 'anim', 'mg', 'fx', 'sfx', 'music', 'fonts', 'end', 'presets'].flatMap(s => items(s)); }
const favKey = it => (it.kind.startsWith('anim:') ? it.kind : it.kind === 'preset' ? 'preset' : it.kind);
function render() {
  if (!LIB.open) return; nav.textContent = ''; list.textContent = '';
  for (const [k, n] of SECS) { if (k === '-') { nav.appendChild(el('hr')); continue; } const b = el('button'); b.type = 'button'; b.appendChild(document.createTextNode(n));
    const cnt = k === 'fav' ? Object.values(PR.favs).reduce((a, l) => a + l.length, 0) : k === 'recent' ? PR.recent.length : items(k).length; b.appendChild(el('small', '', String(cnt)));
    b.setAttribute('aria-current', String(LIB.sec === k && !LIB.q)); b.onclick = () => { LIB.sec = k; LIB.q = ''; search.value = ''; LIB.sel = null; render(); }; nav.appendChild(b); }
  let its;
  if (LIB.q.trim()) { const q = lc(LIB.q).trim(); its = allItems().filter(it => lc(it.name + ' ' + it.cat + ' ' + it.desc + ' ' + it.kind).includes(q)); list.appendChild(el('h3', '', its.length + ' results for “' + LIB.q.trim() + '”')); }
  else if (LIB.sec === 'fav') { const all = allItems(); its = all.filter(it => isFav(favKey(it), it.id)); }
  else if (LIB.sec === 'recent') { const all = allItems(); its = PR.recent.map(r => all.find(it => favKey(it) === r.k && it.id === r.id)).filter(Boolean); }
  else its = items(LIB.sec);
  if (!LIB.q.trim() && LIB.sec === 'anim') { const ch = el('div', 'mx-chips'); for (const [k, n] of [['tin', 'Entrances'], ['tout', 'Exits'], ['tloop', 'Loops']]) { const b = el('button', '', n); b.type = 'button'; b.setAttribute('aria-pressed', String(LIB.sub === k)); b.onclick = () => { LIB.sub = k; render(); }; ch.appendChild(b); } list.appendChild(ch); its = its.filter(it => it.sub === LIB.sub); }
  if (!its.length) { list.appendChild(el('p', 'lib-empty', LIB.sec === 'fav' ? 'Tap ☆ on anything to keep it here.' : LIB.sec === 'recent' ? 'Things you use show up here.' : LIB.sec === 'presets' ? 'Save a text style, a graphic or a transition with its settings (Save as preset in the editor), and it shows up here for everyone on this brand.' : 'Nothing matches.')); side.textContent = ''; return; }
  // group by category
  const groups = new Map(); for (const it of its) { const g = LIB.q.trim() || ['fav', 'recent'].includes(LIB.sec) ? (SECS.find(s => s[0] === (KIND_SEC[it.kind] || (it.kind.startsWith('anim') ? 'anim' : it.kind === 'preset' ? 'presets' : '')) ) || [0, it.cat])[1] : it.cat; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(it); }
  for (const [g, arr] of groups) { if (g) list.appendChild(el('h3', '', g)); const grid = el('div', 'lib-grid'); list.appendChild(grid); for (const it of arr) grid.appendChild(card(it)); }
  if (!LIB.sel || !its.includes(LIB.sel)) LIB.sel = its[0]; detail(LIB.sel);
}
function previewInto(pvEl, it, big) {
  if (it.pk) attach(pvEl, it.pk, it.id, p => { p.textContent = it.name; });
  else if (it.img !== undefined) { if (it.img) { pvEl.style.backgroundImage = 'url("' + it.img + '")'; } else { pvEl.textContent = it.name; const th = A.THUMB && A.THUMB.map && A.THUMB.map[it.id]; if (th) { pvEl.textContent = ''; pvEl.style.backgroundImage = 'url("' + th + '")'; } } }
  else if (it.font) { pvEl.textContent = big ? 'Aa Bb\n' + it.name : 'Aa'; pvEl.style.whiteSpace = 'pre-line'; NX.useFont(it.font.display).then(ok => { const ff = ok && NX.fontCSS ? NX.fontCSS(it.font.display) : null; if (ff) pvEl.style.fontFamily = ff; }); pvEl.style.fontSize = big ? '44px' : '34px'; pvEl.style.fontWeight = '400'; }
  else if (it.audio || it.bed) { pvEl.textContent = it.bed ? '♪' : '▶'; pvEl.style.fontSize = big ? '60px' : '34px'; pvEl.style.background = 'linear-gradient(160deg, #23233a, #121218)'; }
  else if (it.preset) { const d = it.preset.data; pvEl.textContent = it.preset.kind === 'type' ? String(d.text || '').split('\n')[0].slice(0, 16) : it.name; pvEl.style.color = d.color ? K8.col(d.color) : '#fff'; if (d.font) NX.useFont(d.font).then(ok => { const ff = ok && NX.fontCSS ? NX.fontCSS(d.font) : null; if (ff) pvEl.style.fontFamily = ff; }); else if (d.slot) pvEl.style.fontFamily = d.slot; }
  else pvEl.textContent = it.name;
}
function card(it) {
  const b = el('div', 'lib-item'); b.tabIndex = 0; b.setAttribute('role', 'button'); b.setAttribute('aria-label', it.name + ', ' + it.cat); b.setAttribute('aria-selected', String(LIB.sel === it));
  const pv = el('div', 'pv'); b.appendChild(pv); previewInto(pv, it); b.appendChild(el('b', '', it.name)); b.appendChild(el('small', '', it.cat));
  if (it.kind !== 'preset') b.appendChild(favBtn(favKey(it), it.id));
  const pick = () => { LIB.sel = it; list.querySelectorAll('.lib-item').forEach(x => x.setAttribute('aria-selected', String(x === b))); detail(it); if (it.audio) it.audio(); if (it.bed) playBed(it.bed); };
  b.onclick = e => { if (e.target.closest('.fav')) return; pick(); }; b.ondblclick = () => doUse(it); b.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); doUse(it); } else if (e.key === ' ') { e.preventDefault(); pick(); } };
  return b;
}
let bedA = null; function playBed(k) { if (bedA) bedA.pause(); bedA = new Audio('audio/bed_' + k + '.mp4'); bedA.volume = 0.8; bedA.play().catch(() => {}); setTimeout(() => { if (bedA) bedA.pause(); }, 12000); }
function doUse(it) { closeLib(); setTimeout(() => { try { it.use(); recent(favKey(it), it.id); } catch (e) { console.warn(e); A.toast('That didn’t work here. Open an edit first.'); } }, 60); }
function detail(it) {
  side.textContent = ''; if (!it) return; const big = el('div', 'big'); big.dataset.autoplay = '1'; big.dataset.fit = 'full'; side.appendChild(big); previewInto(big, it, true);
  side.appendChild(el('div', 'meta', it.cat)); side.appendChild(el('h4', '', it.name)); side.appendChild(el('p', '', it.desc));
  const row = el('div', 'row'); side.appendChild(row);
  const use = el('button', 'btn primary', it.kind === 'tpl' ? 'Use this template' : it.kind === 'fonts' ? 'Use for this video' : it.kind === 'tr' ? 'Apply to the selected cut' : it.kind.startsWith('anim') ? 'Apply to the selected text' : 'Add to the edit'); use.type = 'button'; use.onclick = () => doUse(it); row.appendChild(use);
  if (it.audio || it.bed) { const pl = el('button', 'btn', '▶ Play'); pl.type = 'button'; pl.onclick = () => (it.audio ? it.audio() : playBed(it.bed)); row.appendChild(pl); }
  if (it.kind !== 'preset') { const f = favBtn(favKey(it), it.id); f.className = 'btn'; f.textContent = isFav(favKey(it), it.id) ? '★ Favourite' : '☆ Favourite'; const o = f.onclick; f.onclick = e => { o(e); f.textContent = isFav(favKey(it), it.id) ? '★ Favourite' : '☆ Favourite'; render(); }; row.appendChild(f); }
  else { const d = el('button', 'btn danger', 'Delete preset'); d.type = 'button'; d.onclick = () => deletePreset(it.preset); row.appendChild(d); }
  if (it.kind === 'tr' && !inEd()) side.appendChild(el('p', '', 'Open an edit (Create → Edit) and select a clip to use it.'));
}
function openLib(sec) { LIB.open = true; if (sec) LIB.sec = sec; LIB.sel = null; modal.hidden = false; loadMeta().then(() => render()); render(); setTimeout(() => search.focus(), 50); }
function closeLib() { LIB.open = false; modal.hidden = true; if (bedA) bedA.pause(); }
// top bar button
const hdr = document.getElementById('themeBtn');
if (hdr) { const b = el('button', 'btn ghost', ''); b.id = 'libBtn'; b.type = 'button'; b.title = 'Creative library: templates, transitions, text, graphics, sounds'; b.innerHTML = '<svg class="i" viewBox="0 0 24 24"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg><span>Library</span>'; b.onclick = () => openLib(); hdr.parentNode.insertBefore(b, hdr); }
NX.CLIB = { favs, isFav, toggleFav, recent, recents, favBtn, savePreset, saveTrPreset, allPresets, usePreset, open: openLib, close: closeLib, items, USE };

// ============================================================ presets inside the editor panels
if (NX.editor && NX.editor.XT) {
  const XT = NX.editor.XT;
  const presetRow = (box, kind, title) => { const ps = allPresets(kind); if (!ps.length) return; box.appendChild(el('div', 'ep-sec', title)); const g = el('div', 'mx-grid'); box.appendChild(g);
    for (const p of ps) { const b = el('button', 'mx-tile'); b.type = 'button'; const pv = el('span', 'pv'); previewInto(pv, { preset: p, name: p.name }); b.appendChild(pv); b.appendChild(el('b', '', p.name)); b.appendChild(el('small', '', 'Brand preset')); b.onclick = () => usePreset(p); g.appendChild(b); } };
  const t0 = XT.textTop; XT.textTop = (box, h) => { presetRow(box, 'type', 'Your saved text styles'); t0(box, h); };
  const g0 = XT.panels.graphics; XT.panels.graphics = (box, h) => { presetRow(box, 'mg', 'Your saved graphics'); g0(box, h); };
  const tr0 = XT.panels.trans; XT.panels.trans = (box, h) => { tr0(box, h); const ps = allPresets('tr'); const t = api().TL(), e = ED(), sel = t && t.main.find((m, i) => i > 0 && m.id === e.sel && m.tr);
    if (ps.length || sel) { box.appendChild(el('div', 'ep-sec', 'Saved transitions')); if (ps.length) presetRow(box, 'tr', ''); if (sel) api().acts(box, [['Save this transition and its settings', () => saveTrPreset(sel.tr)]]); }
    const lb = el('button', 'btn sm', 'Open the full library'); lb.type = 'button'; lb.style.marginTop = '10px'; lb.onclick = () => openLib('tr'); box.appendChild(lb); };
}
})();
