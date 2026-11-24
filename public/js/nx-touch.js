// NexGen Studio V23, phase 1: the touch-first editor. On a phone or tablet the editor becomes one screen that never
// scrolls: preview, timeline, and one contextual toolbar. Panels and the inspector open as sheets. Every gesture
// (pinch, two-finger rotate, long-press drag) has a button that does the same thing. Nothing here changes a project:
// it only drives the editor that is already there (NX.editor.api), so V20-V22 projects open the same way.
(() => {
  'use strict';
  const NX = window.NX, A = NX.app, E = NX.editor, ED = E.ED, api = E.api, S = A.S;
  const $ = s => document.querySelector(s), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), r3 = v => Math.round(v * 1000) / 1000;
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const T = { on: false, sheet: null, tall: false, lastSel: undefined };

  const css = `
body.mob.mode-edit { overflow: hidden; overscroll-behavior: none; }
body.mob.mode-edit #app { height: 100vh; height: 100dvh; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
body.mob.mode-edit #vWork { flex: 1; min-height: 0; display: flex; flex-direction: column; height: auto; }
body.mob.mode-edit .stage { order: 1; flex: 1; min-height: 0; position: relative; top: auto; padding: 8px 10px 6px; gap: 6px; border-bottom: 0; }
body.mob.mode-edit .screen { height: min(calc(100% - 58px), calc((100vw - 20px - var(--mside, 0px)) * 1.7778)); max-height: none; border-radius: 10px; }
body.mob.mode-edit .transport { width: 100%; max-width: 560px; }
body.mob.mode-edit #mtlh { order: 2; }
body.mob.mode-edit #tlx { order: 3; flex: 0 0 auto; height: 156px !important; min-height: 0; max-height: none; padding: 0 8px 6px; }
body.mob.mode-edit.mtall #tlx { height: 300px !important; }
body.mob.mode-edit #tlx .tlx-bar { display: none; }
body.mob.mode-edit #tlx .tlx-body { touch-action: none; }
body.mob.mode-edit .ti.sel .h { width: 22px; background: rgba(255,255,255,.28); }
body.mob.mode-edit .ti.sel .h::after { content: ""; position: absolute; top: 28%; bottom: 28%; left: 9px; width: 4px; border-radius: 2px; background: #fff; }
body.mob.mode-edit #mbar { order: 4; }
#mtlh, #mbar, #msh, .mtop { display: none; }
body.mob.mode-edit #mtlh { display: flex; align-items: center; gap: 6px; height: 46px; padding: 0 8px; flex: 0 0 auto; border-top: 1px solid var(--line); }
#mtlh .lab { font: 700 10px/1 var(--f-mono); letter-spacing: .1em; text-transform: uppercase; color: var(--dim); margin-right: auto; }
#mtlh button, .mtop button { min-width: 44px; height: 44px; border: 0; background: transparent; color: var(--fg); border-radius: 10px; font: 700 13px/1 var(--f-ui); display: grid; place-items: center; padding: 0 8px; }
#mtlh button:active, .mtop button:active, #mbar button:active { background: var(--accent-soft); }
#mtlh button svg, .mtop button svg, #mbar svg, #msh svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.mtop button:disabled { opacity: .3; }
body.mob.mode-edit .mtop { display: flex; gap: 2px; margin-left: auto; }
body.mob.mode-edit .bar .wbar { min-width: 0; flex: 1 1 60px; } body.mob.mode-edit .bar .proj-name { width: 100%; min-width: 0; }
body.mob.mode-edit #homeBtn span { display: none; }
body.mob.mode-edit #mbar { display: flex; gap: 6px; flex: 0 0 auto; height: 74px; padding: 6px 8px calc(6px + env(safe-area-inset-bottom, 0px)); box-sizing: content-box; overflow-x: auto; overflow-y: hidden; touch-action: pan-x; scrollbar-width: none; border-top: 1px solid var(--line); background: var(--panel); }
#mbar::-webkit-scrollbar { display: none; }
#mbar button { flex: 0 0 auto; min-width: 68px; height: 62px; border: 0; border-radius: 12px; background: var(--well); color: var(--fg); font: 600 11.5px/1.1 var(--f-ui); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 0 10px; white-space: nowrap; }
#mbar button.on { background: var(--accent); color: #fff; }
#mbar button.warn { color: #e5484d; }
#mbar button.done { background: transparent; border: 1px solid var(--line); min-width: 56px; }
#mbar .sepr { flex: 0 0 1px; background: var(--line); margin: 8px 2px; }
#mbar .what { flex: 0 0 auto; align-self: center; max-width: 96px; font: 700 10px/1.25 var(--f-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--dim); padding: 0 4px; overflow: hidden; }
body.mob.mode-edit #rail, body.mob.mode-edit #insp { position: fixed; left: 0; right: 0; bottom: 0; top: auto; height: 58vh; height: 58dvh; width: auto; max-height: none; min-height: 0; margin: 0; z-index: 40; background: var(--panel); border-radius: 18px 18px 0 0; box-shadow: 0 -10px 40px rgba(0,0,0,.28); padding: 58px 12px calc(16px + env(safe-area-inset-bottom, 0px)); overflow-y: auto; overscroll-behavior: contain; transform: translateY(105%); transition: transform .22s cubic-bezier(.2,.8,.2,1); visibility: hidden; display: block; border: 0; }
body.mob.mode-edit.sheet-rail #rail, body.mob.mode-edit.sheet-insp #insp { transform: none; visibility: visible; }
body.mob.mode-edit #rail .ep-tabs { display: none; }
body.mob.mode-edit #rail .epanel { height: auto; display: block; } body.mob.mode-edit #rail .ep-body { overflow: visible; height: auto; }
body.mob.mode-edit #einsp { padding: 0; }
body.mob.mode-edit #rail button, body.mob.mode-edit #insp button, body.mob.mode-edit #insp select, body.mob.mode-edit #rail select { min-height: 44px; }
body.mob.mode-edit #insp input[type=range], body.mob.mode-edit #rail input[type=range] { min-height: 36px; }
body.mob.mode-edit.msheet #msh { display: flex; align-items: center; gap: 8px; position: fixed; left: 0; right: 0; bottom: calc(58vh - 54px); bottom: calc(58dvh - 54px); height: 54px; z-index: 41; padding: 0 8px 0 16px; background: var(--panel); border-radius: 18px 18px 0 0; border-bottom: 1px solid var(--line); }
#msh::before { content: ""; position: absolute; top: 6px; left: 50%; width: 36px; height: 4px; margin-left: -18px; border-radius: 2px; background: var(--line); }
#msh b { font: 800 15px/1 var(--f-ui); margin-right: auto; }
#msh button { min-width: 44px; height: 44px; border: 0; background: transparent; color: var(--fg); border-radius: 10px; font: 700 13px/1 var(--f-ui); padding: 0 12px; }
body.mob.mode-edit.msheet .stage { margin-bottom: 58vh; margin-bottom: 58dvh; }
body.mob.mode-edit.msheet #tlx, body.mob.mode-edit.msheet #mtlh, body.mob.mode-edit.msheet #mbar { display: none; }
body.mob.mode-edit .toast { top: calc(68px + env(safe-area-inset-top, 0px)); bottom: auto; pointer-events: none; }
html:has(body.mob.mode-edit) { overflow: hidden; }
/* tablet: the sheet sits beside the preview, the timeline stays in view */
body.mob.mtab.mode-edit #tlx { height: 210px !important; } body.mob.mtab.mode-edit.mtall #tlx { height: 380px !important; }
body.mob.mtab.mode-edit #rail, body.mob.mtab.mode-edit #insp { left: auto; right: 0; top: 60px; bottom: auto; width: 380px; height: var(--msideh, 50vh); border-radius: 0 0 0 18px; transform: translateX(105%); box-shadow: -10px 0 40px rgba(0,0,0,.18); }
body.mob.mtab.mode-edit.sheet-rail #rail, body.mob.mtab.mode-edit.sheet-insp #insp { transform: none; }
body.mob.mtab.mode-edit.msheet #msh { left: auto; right: 0; width: 380px; top: 60px; bottom: auto; border-radius: 0; }
body.mob.mtab.mode-edit.msheet .stage { margin-bottom: 0; margin-right: 380px; --mside: 380px; }
body.mob.mtab.mode-edit.msheet #tlx { display: flex; } body.mob.mtab.mode-edit.msheet #mtlh, body.mob.mtab.mode-edit.msheet #mbar { display: flex; }
@media (prefers-reduced-motion: reduce) { body.mob.mode-edit #rail, body.mob.mode-edit #insp { transition: none; } }
`;
  document.head.appendChild(el('style', '', css));

  const I = {
    motion: '<path d="M3 12h4M5 7h3M5 17h3"/><circle cx="15" cy="12" r="6"/>',
    media: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="15.5" cy="9.5" r="1.4"/>',
    text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>', graphics: '<path d="m12 3 2.6 5.6 6 .7-4.4 4.2 1.1 6L12 16.6 6.700 19.5l1.100-6L3.400 9.300l6-.7z"/>',
    avatar: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.400 3.600-7 8-7s8 2.600 8 7"/>', audio: '<path d="M9 18V5l11-2v13"/><circle cx="6.500" cy="18" r="2.500"/><circle cx="17.500" cy="16" r="2.500"/>',
    voiceover: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', transitions: '<path d="M3 5h7v14H3zM14 5h7v14h-7zM10 12h4"/>',
    polish: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.500 2.500M15.500 15.500 18 18M18 6l-2.500 2.500M8.500 15.500 6 18"/>', brand: '<path d="M4 4h9l7 7-9 9-7-7z"/><circle cx="8.500" cy="8.500" r="1.400"/>',
    split: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>', templates: '<rect x="3" y="3" width="8" height="8" rx="1.500"/><rect x="13" y="3" width="8" height="8" rx="1.500"/><rect x="3" y="13" width="8" height="8" rx="1.500"/><rect x="13" y="13" width="8" height="8" rx="1.500"/>',
    video: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="var(--well)"/><circle cx="15" cy="12" r="2" fill="var(--well)"/><circle cx="8" cy="18" r="2" fill="var(--well)"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13.500 6.500l4 4"/>', cut: '<circle cx="6" cy="6" r="2.500"/><circle cx="6" cy="18" r="2.500"/><path d="M8 7.500 20 18M8 16.500 20 6"/>',
    dup: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>', del: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>', minus: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>', rot: '<path d="M20 12a8 8 0 1 1-2.300-5.700M20 4v5h-5"/>',
    left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>', trimL: '<path d="M6 4v16M10 12h10M14 8l-4 4 4 4"/>', trimR: '<path d="M18 4v16M4 12h10M10 8l4 4-4 4"/>',
    undo: '<path d="M9 7 4 12l5 5M4 12h10a6 6 0 0 1 0 12h-2" transform="translate(0 -3)"/>', redo: '<path d="m15 7 5 5-5 5M20 12H10a6 6 0 0 0 0 12h2" transform="translate(0 -3)"/>',
    done: '<path d="m5 12 5 5 9-10"/>', tracks: '<path d="M4 7h16M4 12h16M4 17h16"/>', fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', zin: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v6M8 11h6"/>', zout: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M8 11h6"/>'
  };
  const svg = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${(I[k] || I.video).replace(/(\d)\.(\d)00\b/g, '$1.$2')}</svg>`;
  const ico = (b, k, label) => { b.innerHTML = svg(k); if (label) b.appendChild(el('span', '', label)); return b; };
  const iconFor = l => { l = l.toLowerCase(); for (const k of ['media', 'text', 'motion', 'graphics', 'avatar', 'audio', 'voiceover', 'transitions', 'polish', 'brand', 'split', 'templates']) if (l.includes(k.slice(0, 5))) return k; return 'video'; };

  // ------------------------------------------------------------------ chrome: top buttons, timeline header, bar, sheet header
  const top = el('div', 'mtop'), bUndo = ico(el('button'), 'undo'), bRedo = ico(el('button'), 'redo');
  bUndo.type = bRedo.type = 'button'; bUndo.setAttribute('aria-label', 'Undo'); bRedo.setAttribute('aria-label', 'Redo');
  bUndo.onclick = () => { const b = $('#edUndo'); if (b) b.click(); }; bRedo.onclick = () => { const b = $('#edRedo'); if (b) b.click(); };
  top.append(bUndo, bRedo); const exp = $('#exportBtn'); exp.parentNode.insertBefore(top, exp);

  const tlh = el('div'); tlh.id = 'mtlh'; const tlab = el('span', 'lab', 'Timeline'); tlh.appendChild(tlab);
  const hb = (k, label, fn) => { const b = ico(el('button'), k); b.type = 'button'; b.setAttribute('aria-label', label); b.title = label; b.onclick = fn; tlh.appendChild(b); return b; };
  const zoomBy = f => { const z = $('#edZoom'); if (!z) return; z.value = clamp(+z.value * f, 8, 300); z.dispatchEvent(new Event('input')); };
  hb('zout', 'Zoom out', () => zoomBy(1 / 1.4)); hb('zin', 'Zoom in', () => zoomBy(1.4));
  hb('fit', 'Fit the whole video', () => { const f = [...document.querySelectorAll('#tlx .tlx-bar .tool')].find(b => b.textContent === 'Fit'); if (f) f.click(); });
  const bTracks = hb('tracks', 'Show more tracks', () => { T.tall = !T.tall; document.body.classList.toggle('mtall', T.tall); bTracks.setAttribute('aria-pressed', String(T.tall)); try { localStorage.setItem('nx.mtall', T.tall ? '1' : ''); } catch (e) { } setTimeout(sideH, 0); });
  try { T.tall = !!localStorage.getItem('nx.mtall'); } catch (e) { }

  const bar = el('div'); bar.id = 'mbar'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Editing tools');
  const sh = el('div'); sh.id = 'msh'; const shT = el('b'), shX = el('button', '', 'Done'); shX.type = 'button'; shX.onclick = () => sheet(null); sh.append(shT, shX);
  const work = $('#vWork'), tlx = $('#tlx'); work.insertBefore(tlh, tlx); work.appendChild(bar); document.body.appendChild(sh);

  function sheet(which, title) {
    T.sheet = which; const c = document.body.classList; c.toggle('sheet-rail', which === 'rail'); c.toggle('sheet-insp', which === 'insp'); c.toggle('msheet', !!which);
    if (which) { shT.textContent = title || ''; const s = $(which === 'rail' ? '#rail' : '#insp'); if (s) s.scrollTop = 0; }
    paintBar(); setTimeout(() => window.dispatchEvent(new Event('resize')), 240);
  }
  // on a tablet the side sheet fills the space above the timeline
  function sideH() { const r = tlh.getBoundingClientRect(); document.body.style.setProperty('--msideh', Math.max(240, Math.round(r.top - 60)) + 'px'); }

  const layerOf = id => { const t = api.TL(); return t ? t.layers.find(L => L.id === id) : null; };
  const mainOf = id => { const t = api.TL(); return t ? t.main.find(m => m.id === id) : null; };
  const canRot = L => !api.isFull(L) && L.kind !== 'seg' && !['progress', 'scrim', 'banner', 'logobug'].includes(L.type);
  const canSize = L => L.kind === 'text' || L.kind === 'pip' || (L.kind === 'mg' && !api.isFull(L)) || ['logo', 'badge', 'brackets', 'label', 'cta'].includes(L.type);
  function scaleL(L, o, k) {   // the same rule the corner handles use
    const kf = (p, fn) => { if (o.kf && Array.isArray(o.kf[p]) && o.kf[p].length) { L.kf = L.kf || {}; L.kf[p] = o.kf[p].map(x => Object.assign({}, x, { v: fn(x.v) })); } };
    if (L.kind === 'mg') { const sx = clamp((o.sx || 1) * k, 0.15, 6), f = sx / (o.sx || 1); L.sx = r3(sx); L.sy = r3(clamp((o.sy || 1) * f, 0.15, 6)); kf('sx', v => v * f); kf('sy', v => v * f); }
    else if (L.kind === 'pip' || L.type === 'logo') L.w = Math.round(clamp((o.w || 600) * k, 160, 1080));
    else if (L.type === 'brackets') { L.w = Math.round(clamp((o.w || 700) * k, 120, 1080)); L.h = Math.round(clamp((o.h || 420) * k, 80, 1900)); }
    else L.size = Math.round(clamp((o.size || 80) * k, 12, L.style === 'type' ? 900 : 320));
  }
  function rotL(L, o, deg) { deg = (((o.rot || 0) + deg + 540) % 360) - 180; for (const sn of [-180, -90, 0, 90, 180]) if (Math.abs(deg - sn) < 4) deg = sn; const d = deg - (o.rot || 0); L.rot = Math.round(deg * 10) / 10; if (L.rot === 0) delete L.rot;
    if (o.kf && Array.isArray(o.kf.rot) && o.kf.rot.length) { L.kf = L.kf || {}; L.kf.rot = o.kf.rot.map(x => Object.assign({}, x, { v: x.v + d })); } }
  const redraw = () => { A.refresh(true); api.drawOv(); };
  const edit = (id, fn, key) => { api.change(t => { const L = t.layers.find(x => x.id === id) || t.main.find(x => x.id === id); if (L) fn(L, JSON.parse(JSON.stringify(L))); }, { key }); redraw(); api.renderTimeline(); if (T.sheet === 'insp') api.renderInspector(); };
  function trimTo(id, side) {   // cut the start or the end of a clip at the playhead
    const f = api.F(), b = f && f.M.find(m => m.id === id); if (!b) return; const at = S.t - b.start; if (at < 0.15 || at > b.d - 0.15) { A.toast('Move the playhead inside the clip first.'); return; }
    edit(id, m => { if (side === 'L') { if (m.type === 'clip') m.in = r3((+m.in || 0) + at * (+m.sp || 1)); m.d = r3(m.d - at); } else m.d = r3(at); });
    if (side === 'L') A.setT(b.start);
  }

  function paintBar() {
    if (!T.on) return; bar.textContent = '';
    const add = (k, label, fn, cls) => { const b = ico(el('button', cls || ''), k, label); b.type = 'button'; b.onclick = fn; bar.appendChild(b); return b; };
    const id = ED.sel, L = id && layerOf(id), M = id && !L && mainOf(id), o = id && api.findAny(id);
    if (!o) {
      const tabs = [...document.querySelectorAll('#ePanel .ep-tabs button')], want = ['Media', 'Director', 'Text', 'Motion', 'Graphics', 'Avatar', 'Audio', 'Voiceover', 'Transitions', 'Polish', 'Brand', 'Split screen', 'Templates'];
      tabs.sort((a, b) => { const i = want.indexOf(a.textContent), j = want.indexOf(b.textContent); return (i < 0 ? 99 : i) - (j < 0 ? 99 : j); });
      for (const tb of tabs) { const label = tb.textContent; add(iconFor(label), label, () => { const cur = [...document.querySelectorAll('#ePanel .ep-tabs button')].find(x => x.textContent === label); if (cur) cur.click(); sheet('rail', label); }, T.sheet === 'rail' && tb.getAttribute('aria-selected') === 'true' ? 'on' : ''); }
      add('video', 'Whole video', () => { api.renderInspector(); sheet('insp', 'Whole video'); });
      return;
    }
    const kind = api.kindOf(o), name = (api.labelOf ? api.labelOf(o) : '') || (L ? L.name || L.kind : 'Clip');
    add('done', 'Done', () => { api.select(null); }, 'done');
    bar.appendChild(el('span', 'what', String(name).slice(0, 26)));
    add('edit', 'Edit', () => { api.renderInspector(); sheet('insp', String(name).slice(0, 30)); }, T.sheet === 'insp' ? 'on' : '');
    if (NX.presets && o && api.kindOf(o) !== 'music' && !(L && L.kind === 'seg') && !(M && M.type === 'tpl')) add('motion', 'Motion', () => NX.presets.open(), T.sheet === 'rail' && ED.panel === 'motion' ? 'on' : '');
    if (M && M.type !== 'tpl') { add('trimL', 'Start here', () => trimTo(id, 'L')); add('trimR', 'End here', () => trimTo(id, 'R')); }
    if (kind === 'layer' || (kind === 'main' && (!M || M.type !== 'tpl'))) add('cut', 'Split', () => api.split());
    if (L && canSize(L)) { add('minus', 'Smaller', () => edit(id, (x, o) => scaleL(x, o, 1 / 1.08), 'msz' + id)); add('plus', 'Bigger', () => edit(id, (x, o) => scaleL(x, o, 1.08), 'msz' + id)); }
    if (L && canRot(L)) add('rot', 'Rotate', () => edit(id, (x, o) => rotL(x, o, 15), 'mrot' + id));
    if (L) { add('left', 'Earlier', () => edit(id, x => { x.t0 = r3(Math.max(0, x.t0 - 0.1)); }, 'mt' + id)); add('right', 'Later', () => edit(id, x => { x.t0 = r3(x.t0 + 0.1); }, 'mt' + id)); }
    if (kind === 'main' || kind === 'layer') add('dup', 'Duplicate', () => api.duplicate());
    if (kind !== 'music') { bar.appendChild(el('span', 'sepr')); add('del', 'Delete', () => api.del(), 'warn'); }
  }
  function sync() {
    const u = $('#edUndo'), r = $('#edRedo'); bUndo.disabled = !u || u.disabled; bRedo.disabled = !r || r.disabled;
    if (!T.on) return;
    if (ED.sel !== T.lastSel) { const was = T.lastSel; T.lastSel = ED.sel;
      if (ED.sel && T.sheet === 'rail' && !document.body.classList.contains('mtab')) sheet(null);          // something was added: show it
      else if (!ED.sel && T.sheet === 'insp' && was) sheet(null);
      else if (ED.sel && T.sheet === 'insp') { const o = api.findAny(ED.sel); shT.textContent = String((api.labelOf && o ? api.labelOf(o) : '') || 'Edit').slice(0, 30); }
      bar.scrollLeft = 0; }
    paintBar();
  }
  let syncQ = 0; const syncSoon = () => { if (syncQ) return; syncQ = requestAnimationFrame(() => { syncQ = 0; sync(); }); };
  new MutationObserver(syncSoon).observe($('#einsp'), { childList: true });
  new MutationObserver(syncSoon).observe(tlx, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] });
  new MutationObserver(syncSoon).observe($('#ePanel'), { childList: true });

  function mode() {
    const coarse = matchMedia('(pointer: coarse)').matches, w = innerWidth, on = document.body.classList.contains('mode-edit') && (w <= 900 || (coarse && w <= 1180 && innerHeight > w));
    const c = document.body.classList; c.toggle('mob', on); c.toggle('mtab', on && w >= 700); c.toggle('mtall', on && T.tall);
    if (on !== T.on) { T.on = on; if (!on) { c.remove('sheet-rail', 'sheet-insp', 'msheet'); T.sheet = null; } else { T.lastSel = undefined; sync(); } setTimeout(() => window.dispatchEvent(new Event('resize')), 60); }
    if (on) sideH();
  }
  new MutationObserver(mode).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', mode); mode();

  // ------------------------------------------------------------------ timeline touch: swipe pans, tap selects, the selected clip drags and trims,
  // long-press picks a clip up, two fingers zoom. Events the editor should see are let through (or replayed).
  const pass = new WeakSet(), P = new Map(); let g = null, pinch = null;
  const tlBody = () => tlx.querySelector('.tlx-body');
  const replay = (type, e, target) => { const ev = new PointerEvent(type, { bubbles: true, cancelable: true, clientX: e.clientX, clientY: e.clientY, pointerId: e.pointerId, pointerType: e.pointerType, isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1 }); pass.add(ev); (target || e.target).dispatchEvent(ev); };
  function tlDown(e) {
    if (!T.on || e.pointerType !== 'touch' || pass.has(e)) return; const body = tlBody(); if (!body || !body.contains(e.target)) return;
    if (e.isPrimary) { P.clear(); pinch = null; if (g) clearTimeout(g.lp); g = null; }
    P.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (P.size === 2) {   // pinch: stop whatever one finger was doing
      if (g && g.mode === 'thru') replay('pointerup', e, body); if (g) clearTimeout(g.lp); g = null;
      const [a, b] = [...P.values()], z = $('#edZoom'); pinch = { d0: Math.max(20, Math.abs(a.x - b.x)), z0: z ? +z.value : ED.pxs }; e.stopImmediatePropagation(); e.preventDefault(); return; }
    if (P.size > 2) { e.stopImmediatePropagation(); return; }
    const ti = e.target.closest('.ti[data-id], .sfx'), rect = body.getBoundingClientRect(), inRuler = e.clientY - rect.top + 0 < 26 && body.scrollTop < 4;
    if (e.target.closest('.trc') || inRuler || (ti && (ti.classList.contains('sfx') || ti.dataset.id === ED.sel))) { g = { mode: 'thru', id: e.pointerId }; return; }   // scrub, drag or trim as before
    e.stopImmediatePropagation();
    g = { mode: 'wait', id: e.pointerId, x0: e.clientX, y0: e.clientY, sl: body.scrollLeft, st: body.scrollTop, ti, target: e.target, e0: e };
    if (ti) g.lp = setTimeout(() => { if (!g || g.mode !== 'wait') return; g.mode = 'thru'; try { navigator.vibrate && navigator.vibrate(12); } catch (x) { } replay('pointerdown', g.e0, g.target); }, 430);
  }
  let pz = 0;
  function tlMove(e) {
    if (!T.on || e.pointerType !== 'touch' || pass.has(e) || !P.has(e.pointerId)) return; const p = P.get(e.pointerId); p.x = e.clientX; p.y = e.clientY;
    if (pinch) { e.stopImmediatePropagation(); if (P.size >= 2) { const [a, b] = [...P.values()], k = Math.max(20, Math.abs(a.x - b.x)) / pinch.d0; cancelAnimationFrame(pz); pz = requestAnimationFrame(() => { const z = $('#edZoom'); if (!z) return; z.value = Math.round(clamp(pinch ? pinch.z0 * k : +z.value, 8, 300)); z.dispatchEvent(new Event('input')); }); } return; }
    if (!g || g.id !== e.pointerId || g.mode === 'thru') return;
    e.stopImmediatePropagation(); const dx = e.clientX - g.x0, dy = e.clientY - g.y0;
    if (g.mode === 'wait' && Math.abs(dx) + Math.abs(dy) > 9) { g.mode = 'pan'; clearTimeout(g.lp); }
    if (g.mode === 'pan') { const body = tlBody(); body.scrollLeft = g.sl - dx; body.scrollTop = g.st - dy; }
  }
  function tlUp(e) {
    if (e.pointerType !== 'touch' || pass.has(e) || !P.has(e.pointerId)) return; P.delete(e.pointerId);
    if (pinch) { e.stopImmediatePropagation(); if (P.size < 2) { pinch = P.size ? pinch : null; if (!P.size) pinch = null; } return; }
    if (!g || g.id !== e.pointerId) return; const was = g; g = null; clearTimeout(was.lp);
    if (was.mode === 'thru') return;
    e.stopImmediatePropagation();
    if (was.mode === 'wait' && e.type === 'pointerup') { if (was.ti) api.select(was.ti.dataset.id); else { replay('pointerdown', was.e0, was.target); replay('pointerup', e, tlBody()); } }
  }
  tlx.addEventListener('pointerdown', tlDown, true);   // the rest on the window: zooming rebuilds the timeline, and a finger whose element is gone must still be heard
  for (const [t, f] of [['pointermove', tlMove], ['pointerup', tlUp], ['pointercancel', tlUp]]) window.addEventListener(t, f, true);

  // ------------------------------------------------------------------ preview touch: one finger drags (as before), two fingers resize and turn the
  // selected layer, a double tap opens its controls
  const scr = $('#screen'), Q = new Map(); let two = null, lastTap = 0, tapAt = null;
  scr.addEventListener('pointerdown', e => {
    if (!T.on || e.pointerType !== 'touch' || pass.has(e)) return; if (e.isPrimary) { Q.clear(); two = null; } Q.set(e.pointerId, { x: e.clientX, y: e.clientY }); tapAt = Q.size === 1 ? { x: e.clientX, y: e.clientY, t: performance.now() } : null;
    if (Q.size !== 2) return;
    e.stopImmediatePropagation(); const c = new PointerEvent('pointercancel', { bubbles: true, pointerId: e.pointerId }); pass.add(c); scr.dispatchEvent(c);   // end the one-finger drag
    const L = ED.sel && layerOf(ED.sel); if (!L || !(canSize(L) || canRot(L))) { two = { none: true }; return; }
    const [a, b] = [...Q.values()]; two = { id: L.id, orig: JSON.parse(JSON.stringify(L)), before: JSON.stringify(api.TL()), d0: Math.max(24, Math.hypot(a.x - b.x, a.y - b.y)), a0: Math.atan2(b.y - a.y, b.x - a.x), moved: false };
  }, true);
  let pr = 0;
  scr.addEventListener('pointermove', e => {
    if (e.pointerType !== 'touch' || !Q.has(e.pointerId)) return; const p = Q.get(e.pointerId); p.x = e.clientX; p.y = e.clientY;
    if (!two) return; e.stopImmediatePropagation(); if (two.none || Q.size < 2) return;
    const [a, b] = [...Q.values()], L = layerOf(two.id); if (!L) return; const k = clamp(Math.hypot(a.x - b.x, a.y - b.y) / two.d0, 0.25, 4), da = (Math.atan2(b.y - a.y, b.x - a.x) - two.a0) * 180 / Math.PI;
    if (canSize(L)) scaleL(L, two.orig, k); if (canRot(L) && Math.abs(da) > 6) rotL(L, two.orig, da); two.moved = true;
    cancelAnimationFrame(pr); pr = requestAnimationFrame(redraw);
  }, true);
  const scrUp = e => {
    if (e.pointerType !== 'touch' || pass.has(e) || !Q.has(e.pointerId)) return; Q.delete(e.pointerId);
    if (two) { e.stopImmediatePropagation(); if (Q.size) return; const t = two; two = null;
      if (t.moved && JSON.stringify(api.TL()) !== t.before) { ED.undo.push(t.before); if (ED.undo.length > 150) ED.undo.shift(); ED.redo = []; ED.lastKey = ''; A.markDirty(); api.scheduleMix(); api.renderInspector(); api.renderTimeline(); redraw(); syncSoon(); } return; }
    if (T.on && e.type === 'pointerup' && tapAt && Math.hypot(e.clientX - tapAt.x, e.clientY - tapAt.y) < 10 && performance.now() - tapAt.t < 300) {
      const now = performance.now(); if (now - lastTap < 340 && ED.sel) { lastTap = 0; setTimeout(() => { const o = api.findAny(ED.sel); if (!o) return; api.renderInspector(); sheet('insp', String((api.labelOf ? api.labelOf(o) : '') || 'Edit').slice(0, 30)); }, 0); } else lastTap = now; }
  };
  scr.addEventListener('pointerup', scrUp, true); scr.addEventListener('pointercancel', scrUp, true);

  // ------------------------------------------------------------------ never lose work: save the moment the app goes to the background
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && A.flush) A.flush(); });
  window.addEventListener('pagehide', () => { if (A.flush) A.flush(); });

  NX.touch = { T, sheet, paintBar, scaleL, rotL, trimTo, mode };
})();
