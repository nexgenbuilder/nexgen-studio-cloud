'use strict';
/* NexGen Studio V16 (Nov 6): placement for overlays. In the editor's inspector, any text, sticker, motion graphic or
   picture-in-picture layer gets a Placement group: a 3 × 3 grid (corners, edges, centre) that keeps clear of the app
   buttons and captions, plus Across / Down sliders for exact spots. A layer that belongs to a text set can move alone or
   with its whole set (the set keeps its own arrangement). Loads after the editor modules; changes go through the editor's
   own undoable update. */
(() => {
  const X = NX.editor; if (!X || !X.XT || !X.api || !NX.app) return;
  const A = NX.app, el = A.el, api = X.api, XT = X.XT, ED = X.ED;
  const COLS = [['l', 'left', 0.25], ['c', 'centre', 0.5], ['r', 'right', 0.75]], ROWS = [['t', 'Top', 400], ['m', 'Middle', 960], ['b', 'Bottom', 1290]];
  const ARROW = { tl: '↖', tc: '↑', tr: '↗', ml: '←', mc: '•', mr: '→', bl: '↙', bc: '↓', br: '↘' };
  const FULL = new Set(['progress', 'scrim', 'banner', 'steps']);
  const halfW = L => Math.min(500, (L.w || (L.kind === 'pip' ? 600 : L.kind === 'text' && L.style !== 'type' ? 380 : 300)) / 2);
  const fitX = (L, x) => (halfW(L) >= 470 ? 540 : Math.max(halfW(L) + 50, Math.min(1080 - halfW(L) - 50, x)));
  const cellOf = L => { const r = L.y < 680 ? 't' : L.y > 1130 ? 'b' : 'm', c = L.x < 400 ? 'l' : L.x > 680 ? 'r' : 'c'; return r + c; };
  const movable = o => o && typeof o.x === 'number' && typeof o.y === 'number' && ['text', 'sticker', 'mg', 'pip'].includes(o.kind) && !FULL.has(o.type) && !(o.kind === 'mg' && o.full);
  function moveTo(o, x, y, whole) {
    if (whole && o.grp) {
      api.change(tl => { const parts = tl.layers.filter(l => l.grp === o.grp && typeof l.x === 'number'), me = parts.find(l => l.id === o.id) || o, dx = x - me.x, dy = y - me.y;
        parts.forEach(l => { l.x = Math.round(l.x + dx); l.y = Math.round(Math.max(120, Math.min(1800, l.y + dy))); }); });
    } else api.upd(o.id, L => { L.x = Math.round(x); L.y = Math.round(y); });
    api.renderInspector(); if (api.drawOv) api.drawOv();
  }
  function placement(box, o) {
    if (box.querySelector('.nxp-grid')) return;
    const g = api.grp(box, 'Placement'); let whole = !!o.grp;
    if (o.grp) g.appendChild(api.segRow('Move', [['set', 'The whole set'], ['part', 'Just this part']], 'set', v => { whole = v === 'set'; }));
    const grid = el('div', 'nxp-grid'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:6px 0 10px';
    const cur = cellOf(o);
    for (const [rk, rn, ry] of ROWS) for (const [ck, cn, cx] of COLS) {
      const k = rk + ck, b = el('button', 'btn sm' + (k === cur ? '' : ' ghost'), ARROW[k]); b.type = 'button'; b.title = rn + (ck === 'c' ? (rk === 'm' ? '' : ' centre') : ' ' + cn); b.setAttribute('aria-label', 'Place ' + (rk === 'm' && ck === 'c' ? 'in the centre' : b.title.toLowerCase()));
      b.style.cssText = 'font-size:18px;line-height:1;padding:10px 0'; b.onclick = () => moveTo(o, fitX(o, 1080 * cx), ry, whole); grid.appendChild(b);
    }
    g.appendChild(grid);
    g.appendChild(api.rangeRow('Across', 40, 1040, 1, o.x, v => api.upd(o.id, L => { L.x = Math.round(v); }, 'px'), v => Math.round(v) + ' px'));
    g.appendChild(api.rangeRow('Down', 120, 1800, 1, o.y, v => api.upd(o.id, L => { L.y = Math.round(v); }, 'py'), v => Math.round(v) + ' px'));
    g.appendChild(el('p', 'hint', 'Top and bottom keep clear of the app’s buttons and captions. Drag on the preview for any other spot.'));
  }
  const prev = XT.inspect.layer;
  XT.inspect.layer = (box, o, legacy) => {
    const r = prev ? prev(box, o, legacy) : false;
    if (movable(o)) {
      const add = () => { try { const tabs = box.querySelector('.itabs'); if (tabs && ED.itab && ED.itab !== 'edit') return; const live = api.findAny(o.id); if (live && box.isConnected !== false) placement(box, live); } catch (e) { console.warn('placement', e); } };
      if (r) add(); else Promise.resolve().then(add);   // the classic inspector fills the box after this hook returns
    }
    return r;
  };
})();
