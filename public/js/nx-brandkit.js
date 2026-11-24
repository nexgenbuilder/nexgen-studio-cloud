// NexGen Studio V27: brand layouts. One tap arranges the logo and the contact details for the whole video; every
// piece stays its own layer, so it can be moved, restyled, retimed or deleted afterwards.
(() => {
  'use strict';
  const NX = window.NX, X = NX.editor, A = NX.app; if (!X || !X.XT || !X.XT.panels.brand || typeof K9 === 'undefined' || !K9.EL.bk_strip) return;
  const api = X.api, XT = X.XT, ED = X.ED, el = A.el, r3 = api.r3;
  const LAYOUTS = [
    ['corner', 'Corner logo + contact bar', 'Logo top right, phone and website along the bottom', D => [['bk_corner', { anc: 'tr' }], ['bk_contact', { anc: 'bottom', band: 'glass' }]]],
    ['lower', 'Lower banner', 'One banner at the bottom: logo, phone, address and website', D => [['bk_strip', { anc: 'bottom' }]]],
    ['upper', 'Top banner', 'One banner at the top: logo, phone, address and website', D => [['bk_strip', { anc: 'top' }]]],
    ['social', 'Top logo + socials', 'Logo bar on top, your social handles along the bottom', D => [['bk_logobar', { anc: 'top' }], ['bk_social', { anc: 'bottom' }]]],
    ['card', 'Corner logo + contact card', 'Logo top left for the whole video, the full contact card for the last five seconds', D => [['bk_corner', { anc: 'tl' }], ['bk_card', { anc: 'bhm', t0: Math.max(0, D - 5), d: Math.min(5, D) }]]],
    ['ribbon', 'Side ribbon + address', 'Brand ribbon down the left edge, your address along the bottom', D => [['bk_ribbon', { anc: 'left' }], ['bk_address', { anc: 'bottom' }]]],
    ['full', 'Everything', 'Logo bar on top; phone, website, address and socials stacked at the bottom', D => [['bk_logobar', { anc: 'top' }], ['bk_contact', { anc: 'bottom', band: 'solid' }], ['bk_address', { anc: 'bottom', band: 'solid' }], ['bk_social', { anc: 'bottom', band: 'solid' }]]],
    ['web', 'Just the website', 'Logo top right, the website along the bottom', D => [['bk_corner', { anc: 'tr' }], ['bk_web', { anc: 'bottom', show: 'w' }]]],
  ];
  function apply(id) {
    const Lo = LAYOUTS.find(l => l[0] === id), t = api.TL(); if (!Lo || !t) return; const D = r3(Math.max(0.5, A.S.dur)), g = api.uid(), made = Lo[3](D).filter(p => K9.EL[p[0]]).map(([type, o]) => Object.assign({ id: api.uid(), kind: 'mg', type, x: 540, y: 960, t0: 0, d: D, grp: g, gname: Lo[1] }, o));
    api.change(tl => { tl.layers.push(...made); }); ED.sel = made[0].id; ED.multi.clear(); api.renderInspector(); api.renderPanel(); A.refresh(true);
    A.toast(Lo[1] + ' added for the whole video. Each piece is its own layer: tap one to move or restyle it. Undo removes them all.', 5200);
  }
  const p0 = XT.panels.brand;
  XT.panels.brand = (box, h) => { p0(box, h); const at = [...box.children].find(n => n.textContent === 'Pieces' && n.children.length === 0); if (!at) return;
    const sec = at.cloneNode(false); sec.textContent = 'Layouts'; box.insertBefore(sec, at); const g = el('div', 'bb-grid'); g.style.marginBottom = '6px';
    for (const [id, name, desc] of LAYOUTS) { const b = el('button', 'ep-btn'); b.type = 'button'; b.appendChild(el('b', '', name)); b.appendChild(el('small', '', desc)); b.onclick = () => apply(id); g.appendChild(b); } box.insertBefore(g, at); };
  // ------------------------------------------------------------------ social icons: uploaded once, used for every brand
  const NETS = [['ig', 'Instagram'], ['fb', 'Facebook'], ['tt', 'TikTok'], ['yt', 'YouTube'], ['x', 'X'], ['wa', 'WhatsApp']], IC = { doc: {} };
  async function loadIcon(k, rec) { try { const img = new Image(); img.src = rec.url || ('/_blob/' + rec.asset); await img.decode(); const cv = document.createElement('canvas'); cv.width = cv.height = 16; const g = cv.getContext('2d'); g.drawImage(img, 0, 0, 16, 16); let clear = false; try { const d = g.getImageData(0, 0, 16, 16).data; clear = d[3] < 40 && d[15 * 4 + 3] < 40; } catch (e) { } K17.ICONS[k] = { img, clear }; } catch (e) { delete K17.ICONS[k]; } }
  async function loadIcons() { try { if (!A.CAP.db) return; const s = await A.CAP.db.doc('studio/icons').get(); IC.doc = (s && (typeof s.data === 'function' ? s.data() : s.data || s)) || {}; await Promise.all(NETS.map(([k]) => (IC.doc[k] && IC.doc[k].asset ? loadIcon(k, IC.doc[k]) : null))); A.refresh(true); if (ED.panel === 'brand') api.renderPanel(); } catch (e) { console.warn('social icons', e); } }
  async function setIcon(k, file) {
    if (!A.CAP.assets || !A.CAP.db) { A.toast('Uploading icons needs edit access to this studio (open it on claude.ai as its owner).', 6000); return; }
    if (!file || !/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 3e6) { A.toast('Use a PNG, JPG or WebP image under 3 MB.'); return; }
    try { const old = IC.doc[k], up = await A.CAP.assets.upload(file); IC.doc[k] = { asset: up.id, url: up.url }; await A.CAP.db.doc('studio/icons').set(IC.doc); if (old && old.asset) A.CAP.assets.delete(old.asset).catch(() => { }); await loadIcon(k, IC.doc[k]); A.refresh(true); api.renderPanel(); A.toast('Icon saved. It is used for every brand.'); }
    catch (e) { A.toast('Couldn’t save the icon (' + ((e && (e.code || e.message)) || 'error') + ').', 6000); }
  }
  async function clearIcon(k) { const old = IC.doc[k]; if (!old) return; delete IC.doc[k]; delete K17.ICONS[k]; try { await A.CAP.db.doc('studio/icons').set(IC.doc); if (old.asset) A.CAP.assets.delete(old.asset).catch(() => { }); } catch (e) { } A.refresh(true); api.renderPanel(); }
  const p1 = XT.panels.brand;
  XT.panels.brand = (box, h) => { p1(box, h); if (![...box.children].some(n => n.textContent === 'Layouts')) return; h.sec('Social icons');
    h.note('Upload the icon for each network once and it is used for every brand, wherever social handles show. Square images work best; a PNG with a see-through background sits cleanest. Without an icon, a lettered badge is shown.');
    const g = el('div', 'bb-grid'); for (const [k, name] of NETS) { const has = !!K17.ICONS[k], b = el('button', 'ep-btn'); b.type = 'button'; b.style.cssText = 'display:flex;align-items:center;gap:10px;text-align:left';
      const sw = el('span'); sw.style.cssText = 'flex:none;width:36px;height:36px;border-radius:9px;background:#fff center/contain no-repeat;border:1px solid var(--line)'; if (has) sw.style.backgroundImage = 'url("' + K17.ICONS[k].img.src + '")'; const tx = el('span'); tx.appendChild(el('b', '', name)); tx.appendChild(el('small', '', has ? 'Tap to replace' : 'Tap to upload')); b.append(sw, tx);
      b.onclick = () => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/png,image/jpeg,image/webp'; inp.onchange = () => setIcon(k, inp.files[0]); inp.click(); }; g.appendChild(b);
      if (has) { const x = el('button', 'ep-btn', 'Remove ' + name + ' icon'); x.type = 'button'; x.style.fontSize = '12px'; x.onclick = () => clearIcon(k); g.appendChild(x); } }
    box.appendChild(g); };
  loadIcons();
  NX.brandkit = { LAYOUTS, apply, setIcon, clearIcon, loadIcons, NETS };
})();
