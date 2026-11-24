// NexGen Studio V26: still images from any design. The frame at the playhead, saved as a PNG: a reel cover, a story
// graphic, a static ad or a Google Business post from the same template or edit. Three shapes: the full 9:16 frame,
// and 4:5 or square cut from it (top, middle or bottom of the frame).
(() => {
  'use strict';
  const NX = window.NX, A = NX.app, el = A.el, $ = A.$;
  document.head.appendChild(el('style', '', `
body:not(.view-work) #stillBtn { display: none; }
#stillBtn { min-width: 44px; padding: 0 12px; } #stillBtn svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
#stillMenu { position: fixed; z-index: 60; right: max(12px, env(safe-area-inset-right, 0px)); top: calc(64px + env(safe-area-inset-top, 0px)); width: min(340px, calc(100vw - 24px)); background: var(--panel); color: var(--fg); border: 1px solid var(--line); border-radius: 16px; box-shadow: 0 18px 50px rgba(0,0,0,.3); padding: 14px; }
#stillMenu h4 { margin: 0 0 4px; font: 800 15px/1.2 var(--f-ui); } #stillMenu p { margin: 0 0 10px; font: 500 12.5px/1.45 var(--f-ui); color: var(--dim); }
#stillMenu .row { display: flex; gap: 8px; margin: 0 0 8px; } #stillMenu button { flex: 1; min-height: 46px; border: 1px solid var(--line); background: var(--surface); color: var(--fg); border-radius: 12px; font: 700 13px/1.15 var(--f-ui); cursor: pointer; padding: 6px 8px; }
#stillMenu button small { display: block; font: 500 11px/1.2 var(--f-ui); color: var(--dim); margin-top: 3px; } #stillMenu button[aria-pressed=true] { border-color: var(--accent); background: var(--accent-soft); }
#stillMenu .go { background: var(--accent); border-color: var(--accent); color: #fff; }
`));
  const SHAPES = { full: ['Full frame', '9:16 · 1080 × 1920', 1920], tall: ['Portrait', '4:5 · 1080 × 1350', 1350], sq: ['Square', '1:1 · 1080 × 1080', 1080] }, ST = { shape: 'full', from: 'mid' };
  const btn = el('button', 'btn'); btn.id = 'stillBtn'; btn.type = 'button'; btn.title = 'Save this frame as an image'; btn.setAttribute('aria-label', 'Save this frame as an image');
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="15.5" cy="9.500" r="1.400"/></svg>';
  const exp = $('#exportBtn'); exp.parentNode.insertBefore(btn, exp);
  let menu = null; const close = () => { if (menu) { menu.remove(); menu = null; } };
  function frame(shape, from) {   // the current frame, cut to the shape
    A.pause(); A.refresh(true); const src = ctx.canvas, k = src.width / 1080, h = SHAPES[shape][2], y = shape === 'full' ? 0 : from === 'top' ? 0 : from === 'bot' ? 1920 - h : (1920 - h) / 2;
    const cv = document.createElement('canvas'); cv.width = 1080; cv.height = h; const g = cv.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(src, 0, y * k, src.width, h * k, 0, 0, 1080, h); return cv;
  }
  const name = shape => ((A.B().short || A.B().name || 'brand') + '_' + ((A.S.proj && A.S.proj.name) || (A.S.tpl && A.S.tpl.name) || 'image')).replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_').slice(0, 70) + '_' + Math.round(A.S.t * 10) / 10 + 's_' + { full: '9x16', tall: '4x5', sq: '1x1' }[shape] + '.png';
  async function save() {
    if (!A.CAP.downloads) { A.toast('Saving files isn’t available in this view. Open the studio on claude.ai in Chrome or Edge.', 7000); return; }
    const cv = frame(ST.shape, ST.from), blob = await new Promise(r => cv.toBlob(r, 'image/png')), fn = name(ST.shape); if (!blob) { A.toast('Couldn’t make the image.'); return; }
    try { await A.CAP.downloads.save({ filename: fn, data: blob }); A.toast('Saved ' + fn); close(); } catch (e) { if (e && e.code === 'declined') return; A.toast(e && e.code === 'rate_limited' ? 'A save prompt is already open.' : 'Couldn’t save the image (' + ((e && (e.code || e.message)) || 'error') + ').', 6000); }
  }
  function open() {
    close(); menu = el('div'); menu.id = 'stillMenu'; menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-label', 'Save an image');
    const paint = () => { menu.textContent = ''; menu.appendChild(el('h4', '', 'Save this frame as an image')); menu.appendChild(el('p', '', 'Move the playhead to the moment you want first. Use it as a reel cover, a story, a static ad or a Google Business post.'));
      const r1 = el('div', 'row'); for (const k of Object.keys(SHAPES)) { const b = el('button', '', SHAPES[k][0]); b.type = 'button'; b.appendChild(el('small', '', SHAPES[k][1])); b.setAttribute('aria-pressed', String(ST.shape === k)); b.onclick = () => { ST.shape = k; paint(); }; r1.appendChild(b); } menu.appendChild(r1);
      if (ST.shape !== 'full') { menu.appendChild(el('p', '', 'This shape is cut from the vertical frame, so check nothing important is lost. Cut from:')); const r2 = el('div', 'row'); for (const [k, lab] of [['top', 'Top'], ['mid', 'Middle'], ['bot', 'Bottom']]) { const b = el('button', '', lab); b.type = 'button'; b.setAttribute('aria-pressed', String(ST.from === k)); b.onclick = () => { ST.from = k; paint(); }; r2.appendChild(b); } menu.appendChild(r2); }
      const r3 = el('div', 'row'), go = el('button', 'go', 'Save PNG'), no = el('button', '', 'Close'); go.type = no.type = 'button'; go.onclick = save; no.onclick = close; r3.append(no, go); menu.appendChild(r3); };
    paint(); document.body.appendChild(menu);
  }
  btn.onclick = () => (menu ? close() : open());
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  NX.still = { frame, save, open, ST };
})();
