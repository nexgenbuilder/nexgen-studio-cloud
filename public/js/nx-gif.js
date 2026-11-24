'use strict';
/* NexGen Studio — Chunk #4: stickers + GIFs (2026-11-24).
 *
 * GIFs — how they enter the timeline (the decision, documented):
 * A GIF is an ANIMATED IMAGE, not a video clip. MediaBunny (the studio's
 * video decoder) has no GIF video track, so a GIF can never go through the
 * clip pipeline (VID / FB.frame) — it would fail with "No video track".
 * Instead a GIF enters as an overlay layer {kind:'gif'} and is decoded with
 * the browser's native ImageDecoder (Chromium/Edge; the studio's export
 * browsers), which honours the GIF's real per-frame delays. Frames are
 * decoded once into ImageBitmaps and cached; the engine draws the bitmap
 * for the current local time, looping, so a GIF animates in the preview
 * AND in export — export is just the same render(t) called at 30 fps, so
 * the frames it draws are the animated ones. No transcode to MP4 is
 * needed (and none is done: transparency survives, which a video transcode
 * would destroy — most GIF stickers are transparent).
 * The GIF bytes live in the studio's own storage (R2 via CAP.assets.upload,
 * same as footage), referenced by asset id, so the layer keeps working
 * after the search result's CDN link is gone and export never depends on
 * a hotlink. A pasted remote URL is also fetched once and copied into
 * storage the same way; the layer never stores a bare remote URL.
 * Limits: frames are decoded at most 540 px wide and at most 200 frames
 * (a longer GIF loops its first 200 frames); a GIF with no ImageDecoder
 * support falls back to its first frame, static.
 *
 * GIF search — API keys (the stop rule):
 * Search needs a key from Ricardo; there is NO no-key production route.
 * GIPHY: a free beta key from developers.giphy.com (dashboard -> Create
 * an App -> API), 100 calls/hour, production key by application (fee
 * discussed after review). The old shared public beta key is dead — do
 * NOT use it. Tenor (v2, Google Cloud): a free API key from the Google
 * Cloud Console (Tenor API enabled), default 1 request/second. Either
 * key is typed into the GIF panel and kept in this browser's localStorage
 * only (key 'nx.gifKey.v1'); it is never written to a project, the db, a
 * commit or a server. Until a key is saved, search stays off — but GIFs
 * can still be added by URL or file upload, so the layer machinery works
 * without any key. Attribution: "Powered by GIPHY" / "via Tenor" is shown
 * in the panel; exported MP4s that contain provider GIFs should credit
 * the provider in the video's caption/description (an MP4 cannot carry a
 * clickable credit). Rating filter is pg-13 (GIPHY) / high (Tenor).
 *
 * Stickers — the Bible's 61 animated overlays already exist as the K9
 * motion-graphics library (54 in kit9 + 7 brand pieces in kit12 = 61) and
 * the 16 canvas brand stickers in the editor; this chunk adds 10 vector
 * stickers drawn on canvas (no binary assets, no R2 upload needed) as new
 * {kind:'sticker'} types in nx-editor.js / engine/tpl_free.js, and gives
 * them their own Stickers tab alongside the Graphics library. */
window.NX = window.NX || {};
(() => {
const A = NX.app, CAP = A.CAP;
const LS_KEY = 'nx.gifKey.v1';
const MAX_W = 540, MAX_FRAMES = 200;

// ------------------------------------------------------------ key storage (localStorage only, never in a project)
function readKey() { try { const j = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); if (j && typeof j.key === 'string' && j.key.trim()) return { provider: j.provider === 'tenor' ? 'tenor' : 'giphy', key: j.key.trim(), type: j.type === 'stickers' ? 'stickers' : 'gifs' }; } catch (e) {} return { provider: 'giphy', key: '', type: 'gifs' }; }
function saveKey(cfg) { try { localStorage.setItem(LS_KEY, JSON.stringify({ provider: cfg.provider, key: cfg.key, type: cfg.type || 'gifs' })); } catch (e) {} }
function clearKey() { try { localStorage.removeItem(LS_KEY); } catch (e) {} }

// ------------------------------------------------------------ GIF decoding (ImageDecoder)
const cache = new Map();   // 'a:<assetId>' | 'u:<url>' -> {w,h,frames:[{bmp,delay}],dur,animated,ready}
function refOf(L) { if (!L) return null; if (L.asset) return { asset: L.asset }; if (L.url) return { url: L.url }; return null; }
function refKey(ref) { return ref.asset ? 'a:' + ref.asset : 'u:' + ref.url; }
function refUrl(ref) { return ref.asset ? '/_blob/' + ref.asset : ref.url; }
function load(ref) {
  const k = refKey(ref); if (cache.has(k)) return cache.get(k);
  const rec = { w: 0, h: 0, frames: [], dur: 0, animated: false, error: null, ready: null };
  cache.set(k, rec);
  rec.ready = (async () => {
    try {
      const r = await fetch(refUrl(ref)); if (!r.ok) throw new Error('GIF did not load (' + r.status + ')');
      const buf = await r.arrayBuffer();
      if (typeof ImageDecoder === 'undefined') throw new Error('no ImageDecoder');
      const dec = new ImageDecoder({ data: buf, type: 'image/gif' });
      await dec.tracks.ready;
      const tr = dec.tracks.selectedTrack; if (!tr) throw new Error('no GIF track');
      const n = Math.min(tr.frameCount || 1, MAX_FRAMES);
      for (let i = 0; i < n; i++) {
        const out = await dec.decode({ frameIndex: i });
        const img = out.image, delay = Math.max(20, Math.round((img.duration || 100000) / 1000));
        if (i === 0) { rec.w = img.displayWidth; rec.h = img.displayHeight; }
        const tw = Math.min(img.displayWidth, MAX_W), th = Math.max(1, Math.round(tw * img.displayHeight / img.displayWidth));
        const bmp = tw === img.displayWidth ? await createImageBitmap(img) : await createImageBitmap(img, { resizeWidth: tw, resizeHeight: th, resizeQuality: 'high' });
        img.close(); rec.frames.push({ bmp, delay }); rec.dur += delay;
      }
      try { dec.close(); } catch (e) {}
      rec.animated = rec.frames.length > 1;
      if (!rec.frames.length) throw new Error('empty GIF');
    } catch (e) {
      rec.error = String((e && e.message) || e);
      // Fallback: first frame only, as a static image, so the layer still shows something.
      try {
        const img = new Image(); img.decoding = 'async';
        await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('image load failed')); img.src = refUrl(ref); });
        const bmp = await createImageBitmap(img);
        rec.w = bmp.width; rec.h = bmp.height; rec.frames = [{ bmp, delay: 1e9 }]; rec.dur = 1e9; rec.animated = false; rec.error = null;
      } catch (e2) { rec.error = rec.error + ' / ' + String((e2 && e2.message) || e2); }
    }
    return rec;
  })();
  return rec;
}
function touch(L) { const ref = refOf(L); if (ref) { try { load(ref); } catch (e) {} } }
function frameAt(rec, tLocal, loop) {
  if (!rec || !rec.frames.length) return null;
  if (rec.frames.length === 1 || !loop) { if (!loop) { let ms = Math.max(0, tLocal * 1000), acc = 0; for (const f of rec.frames) { acc += f.delay; if (ms < acc) return f.bmp; } return rec.frames[rec.frames.length - 1].bmp; } return rec.frames[0].bmp; }
  let ms = ((tLocal * 1000) % rec.dur + rec.dur) % rec.dur, acc = 0;
  for (const f of rec.frames) { acc += f.delay; if (ms < acc) return f.bmp; }
  return rec.frames[rec.frames.length - 1].bmp;
}
async function warmProject(proj) {
  if (!proj || !Array.isArray(proj.tl && proj.tl.layers)) return;
  await Promise.allSettled(proj.tl.layers.filter(L => L && L.kind === 'gif').map(L => { const ref = refOf(L); return ref ? load(ref).ready : Promise.resolve(); }));
}
NX.gif = { load, touch, frameAt, warmProject, refOf, readKey, saveKey, clearKey, hasDecoder: () => typeof ImageDecoder !== 'undefined',
  state: ref => cache.get(refKey(ref)) || null, MAX_FRAMES };

// ------------------------------------------------------------ search providers
async function searchGiphy(q, cfg) {
  const end = cfg.type === 'stickers' ? '/v1/stickers/search' : '/v1/gifs/search';
  const u = 'https://api.giphy.com' + end + '?api_key=' + encodeURIComponent(cfg.key) + '&q=' + encodeURIComponent(q) + '&limit=12&rating=pg-13&bundle=messaging_non_clips';
  const r = await fetch(u); if (r.status === 401 || r.status === 403) throw new Error('key');
  if (r.status === 429) throw new Error('rate');
  if (!r.ok) throw new Error('http' + r.status);
  const j = await r.json();
  return (j.data || []).map(d => { const im = d.images || {}, o = im.original || {}, t = im.fixed_width_small || im.fixed_width || o; return { id: d.id, title: d.title || q, thumb: t.url, url: o.url || t.url, w: +(o.width || t.width || 480), h: +(o.height || t.height || 480) }; }).filter(x => x.url);
}
async function searchTenor(q, cfg) {
  const sf = cfg.type === 'stickers' ? '&searchfilter=sticker' : '';
  const u = 'https://tenor.googleapis.com/v2/search?q=' + encodeURIComponent(q) + '&key=' + encodeURIComponent(cfg.key) + '&client_key=nexgen-studio&limit=12&media_filter=gif,tinygif&contentfilter=high' + sf;
  const r = await fetch(u); if (r.status === 400 || r.status === 403) throw new Error('key');
  if (r.status === 429) throw new Error('rate');
  if (!r.ok) throw new Error('http' + r.status);
  const j = await r.json();
  return (j.results || []).map(d => { const m = d.media_formats || {}, g = m.gif || {}, t = m.tinygif || g; return { id: d.id, title: d.content_description || q, thumb: t.url, url: g.url || t.url, w: +(g.dims && g.dims[0] || 480), h: +(g.dims && g.dims[1] || 480) }; }).filter(x => x.url);
}
async function trending(cfg) {
  try {
    if (cfg.provider === 'tenor') { const r = await fetch('https://tenor.googleapis.com/v2/featured?key=' + encodeURIComponent(cfg.key) + '&client_key=nexgen-studio&limit=12&media_filter=gif,tinygif&contentfilter=high'); if (!r.ok) return []; const j = await r.json(); return (j.results || []).map(d => { const m = d.media_formats || {}, g = m.gif || {}, t = m.tinygif || g; return { id: d.id, title: d.content_description || 'Trending', thumb: t.url, url: g.url || t.url, w: +(g.dims && g.dims[0] || 480), h: +(g.dims && g.dims[1] || 480) }; }).filter(x => x.url); }
    const r = await fetch('https://api.giphy.com/v1/gifs/trending?api_key=' + encodeURIComponent(cfg.key) + '&limit=12&rating=pg-13'); if (!r.ok) return []; const j = await r.json();
    return (j.data || []).map(d => { const im = d.images || {}, o = im.original || {}, t = im.fixed_width_small || o; return { id: d.id, title: d.title || 'Trending', thumb: t.url, url: o.url || t.url, w: +(o.width || 480), h: +(o.height || 480) }; }).filter(x => x.url);
  } catch (e) { return []; }
}
const errText = e => e && e.message === 'key' ? 'That key was rejected. Check it in the key box below (GIPHY keys come from developers.giphy.com; Tenor keys from the Google Cloud Console).'
  : e && e.message === 'rate' ? 'Rate limit reached — GIPHY beta keys allow 100 searches an hour, Tenor 1 a second. Wait a bit and try again.'
  : 'Search failed (' + String((e && e.message) || e) + '). Check the connection and try again.';

// ------------------------------------------------------------ insert: fetch once, copy into studio storage, add the layer
async function insertFromUrl(gifUrl, meta, busy) {
  const X = NX.editor, api = X.api;
  if (!CAP.assets) { A.toast('Adding GIFs needs edit access to this studio.', 6000); return false; }
  if (busy) busy(true);
  try {
    const r = await fetch(gifUrl); if (!r.ok) throw new Error('Could not fetch that GIF (' + r.status + ')');
    const blob = await r.blob(); if (blob.type && blob.type !== 'image/gif' && !/gif/i.test(blob.type)) throw new Error('That link is not a GIF (' + (blob.type || 'unknown type') + ')');
    const up = await CAP.assets.upload(new Blob([blob], { type: 'image/gif' }), { type: 'image/gif', name: (meta.title || 'gif').slice(0, 40) + '.gif' });
    const ref = { asset: up.id }, rec = load(ref);
    await rec.ready;
    if (rec.error) { A.toast('GIF added, but it may show only its first frame here: ' + rec.error, 7000); }
    const ar = rec.w && rec.h ? rec.w / rec.h : (meta.w && meta.h ? meta.w / meta.h : 1);
    const L = Object.assign({ kind: 'gif', asset: up.id, name: (meta.title || 'GIF').slice(0, 40), title: (meta.title || 'GIF').slice(0, 40), src: meta.src || 'url', gifId: meta.id || '', ar: Math.round(ar * 1000) / 1000, w: 480, x: 540, y: 960, loop: true }, api.layerTimes(3));
    api.addLayer(L); A.toast('GIF added — drag it on the preview, trim it on the timeline.');
    return true;
  } catch (e) { A.toast('Could not add that GIF: ' + String((e && e.message) || e), 7000); return false; }
  finally { if (busy) busy(false); }
}
async function insertFromFile(file, busy) {
  if (!file) return false;
  if (busy) busy(true);
  try {
    const up = await CAP.assets.upload(file, { type: 'image/gif', name: file.name });
    const ref = { asset: up.id }, rec = load(ref); await rec.ready;
    const X = NX.editor, api = X.api, ar = rec.w && rec.h ? rec.w / rec.h : 1;
    const L = Object.assign({ kind: 'gif', asset: up.id, name: file.name.replace(/\.gif$/i, '').slice(0, 40), title: file.name.replace(/\.gif$/i, '').slice(0, 40), src: 'upload', gifId: '', ar: Math.round(ar * 1000) / 1000, w: 480, x: 540, y: 960, loop: true }, api.layerTimes(3));
    api.addLayer(L); A.toast('GIF added — drag it on the preview, trim it on the timeline.');
    return true;
  } catch (e) { A.toast('Could not add that GIF: ' + String((e && e.message) || e), 7000); return false; }
  finally { if (busy) busy(false); }
}

// ------------------------------------------------------------ editor panel (GIFs tab)
const X = NX.editor; if (X && X.XT) {
  const XT = X.XT, api = X.api, el = A.el;
  XT.tabs.push(['gifs', 'GIFs', 'stickers']);
  XT.panels.gifs = (box, h) => {
    const cfg = readKey();
    h.sec('Search');
    if (!cfg.key) h.note('GIF search needs an API key (see below). Until then you can still add GIFs by link or file — they work the same once they are in.');
    const row = el('div', 'fld'); box.appendChild(row);
    const q = el('input'); q.type = 'search'; q.placeholder = cfg.key ? 'Search GIFs: applause, dancing, keys…' : 'Add a key below to search'; q.setAttribute('aria-label', 'Search GIFs'); q.disabled = !cfg.key; row.appendChild(q);
    const go = el('button', 'btn', 'Search'); go.type = 'button'; go.disabled = !cfg.key; go.style.marginTop = '6px'; row.appendChild(go);
    const typeRow = el('div', 'seg'); typeRow.style.marginTop = '8px'; box.appendChild(typeRow);
    let kind = cfg.type || 'gifs';
    for (const [k, n] of [['gifs', 'GIFs'], ['stickers', 'Stickers']]) { const b = el('button', '', n); b.type = 'button'; b.setAttribute('aria-pressed', String(kind === k)); b.onclick = () => { kind = k; typeRow.querySelectorAll('button').forEach(y => y.setAttribute('aria-pressed', String(y === b))); doSearch(); }; typeRow.appendChild(b); }
    const msg = el('p', 'ep-note'); box.appendChild(msg);
    const grid = el('div', 'mx-grid'); box.appendChild(grid);
    const paint = list => { grid.textContent = ''; if (!list.length) { grid.appendChild(el('p', 'ep-note', 'Nothing found. Try another word.')); return; }
      for (const g of list) { const b = el('button', 'mx-tile'); b.type = 'button'; b.title = g.title;
        const pv = el('span', 'pv'); const im = el('img'); im.alt = g.title; im.loading = 'lazy'; im.src = g.thumb; im.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block'; pv.appendChild(im); b.appendChild(pv);
        b.appendChild(el('b', '', (g.title || 'GIF').slice(0, 42))); b.appendChild(el('small', '', (cfg.provider === 'giphy' ? 'GIPHY' : 'Tenor') + ' · tap to add'));
        b.onclick = () => { b.disabled = true; insertFromUrl(g.url, { title: g.title, id: g.id, src: cfg.provider, w: g.w, h: g.h }, on => { b.disabled = on; }); };
        grid.appendChild(b); } };
    let deb = 0;
    const doSearch = async () => { const term = q.value.trim(); if (!term) { msg.textContent = ''; grid.textContent = ''; if (cfg.key) { msg.textContent = 'Trending now:'; paint(await trending(Object.assign({}, cfg, { type: kind }))); } return; }
      msg.textContent = 'Searching…'; grid.textContent = '';
      try { const list = cfg.provider === 'tenor' ? await searchTenor(term, Object.assign({}, cfg, { type: kind })) : await searchGiphy(term, Object.assign({}, cfg, { type: kind })); msg.textContent = list.length ? list.length + ' results — tap one to add it.' : ''; paint(list); }
      catch (e) { msg.textContent = errText(e); } };
    q.oninput = () => { clearTimeout(deb); deb = setTimeout(doSearch, 450); };
    go.onclick = doSearch;
    if (cfg.key) { msg.textContent = 'Trending now:'; trending(Object.assign({}, cfg, { type: kind })).then(paint); }
    h.sec('Add your own GIF');
    h.note('Any GIF you add is copied into the studio’s storage, so it keeps working in the video even if the original link dies. It plays on a loop and you trim it like any layer.');
    const urlRow = el('div', 'fld'); box.appendChild(urlRow);
    const u = el('input'); u.type = 'url'; u.placeholder = 'Paste a GIF link (https://…)'; u.setAttribute('aria-label', 'GIF link'); urlRow.appendChild(u);
    const ub = el('button', 'btn', 'Add GIF from link'); ub.type = 'button'; ub.style.marginTop = '6px'; ub.onclick = () => { if (!u.value.trim()) { A.toast('Paste a GIF link first.'); return; } insertFromUrl(u.value.trim(), { title: 'GIF', src: 'url' }, on => { ub.disabled = on; }); }; urlRow.appendChild(ub);
    const fRow = el('div', 'fld'); box.appendChild(fRow);
    const fi = el('input'); fi.type = 'file'; fi.accept = 'image/gif,.gif'; fi.setAttribute('aria-label', 'Choose a GIF file'); fi.onchange = () => { if (fi.files && fi.files[0]) insertFromFile(fi.files[0], on => { fi.disabled = on; }); }; fRow.appendChild(fi);
    h.sec('GIF search key');
    h.note(cfg.key ? 'Key saved on this device (' + (cfg.provider === 'giphy' ? 'GIPHY' : 'Tenor') + '). It never leaves this browser or this project.' : 'No key saved. Search stays off until you add one — the link and file options above keep working.');
    const provRow = el('div', 'seg'); box.appendChild(provRow);
    let prov = cfg.provider;
    for (const [k, n] of [['giphy', 'GIPHY'], ['tenor', 'Tenor']]) { const b = el('button', '', n); b.type = 'button'; b.setAttribute('aria-pressed', String(prov === k)); b.onclick = () => { prov = k; provRow.querySelectorAll('button').forEach(y => y.setAttribute('aria-pressed', String(y === b))); }; provRow.appendChild(b); }
    const kRow = el('div', 'fld'); box.appendChild(kRow);
    const ki = el('input'); ki.type = 'password'; ki.placeholder = 'Paste the API key here'; ki.autocomplete = 'off'; ki.setAttribute('aria-label', 'GIF API key'); ki.value = cfg.key || ''; kRow.appendChild(ki);
    const kb = el('button', 'btn', cfg.key ? 'Update key' : 'Save key'); kb.type = 'button'; kb.style.marginTop = '6px';
    kb.onclick = () => { const v = ki.value.trim(); if (!v) { A.toast('Paste the key first.'); return; } saveKey({ provider: prov, key: v, type: kind }); A.toast('Key saved on this device. Search is on.'); api.renderPanel(); };
    kRow.appendChild(kb);
    if (cfg.key) { const cb = el('button', 'btn sm', 'Remove key'); cb.type = 'button'; cb.style.marginTop = '6px'; cb.onclick = () => { clearKey(); ki.value = ''; A.toast('Key removed from this device.'); api.renderPanel(); }; kRow.appendChild(cb); }
    const how = el('p', 'ep-note'); box.appendChild(how);
    how.textContent = prov === 'tenor'
      ? 'Tenor key: Google Cloud Console → enable the Tenor API → Credentials → API key (free; 1 request/second).'
      : 'GIPHY key: developers.giphy.com → Create an App → API (free beta key, 100 searches/hour; production key by application). The old shared public key no longer works — use your own.';
    const attr = el('p', 'ep-note'); box.appendChild(attr);
    attr.textContent = cfg.provider === 'tenor' ? 'GIFs via Tenor. Credit Tenor in the video caption when you publish.' : 'GIFs via GIPHY — Powered by GIPHY. Credit GIPHY in the video caption when you publish.';
  };
}
NX.gif.insertFromUrl = insertFromUrl;
NX.gif.insertFromFile = insertFromFile;
NX.gif.search = async (q, cfg) => (cfg || readKey()).provider === 'tenor' ? searchTenor(q, cfg || readKey()) : searchGiphy(q, cfg || readKey());
})();
