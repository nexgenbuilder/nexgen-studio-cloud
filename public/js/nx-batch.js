'use strict';
/* NexGen Studio V21 (Nov 11): Make a set. One brand in, a set of finished videos out.
   Home > "Make a set": choose how many (5, 8 or 10) and the mix. The studio picks formats that suit the brand (the motion
   showpieces first, then the best-scoring templates for its industry, one per family), fills every one with the brand's
   own photos and clips in rotation (each video leads with a different one) and with the industry's starting words, and
   shows the set as cards. From there: open any one to change its words, keep them all in Projects, or export them all:
   each is rendered to an MP4 in turn and the set is saved as one zip.
   Nothing is invented: the words are each template's sample copy for the industry, there to be replaced. Loads last. */
(() => {
  const A = NX.app; if (!A || !NX.quick) return; const el = A.el, S = A.S, CAP = A.CAP, QK = NX.quick;
  const css = document.createElement('style'); css.textContent = `
.bt-sheet { width: min(100%, 980px); }
.bt-body { padding: 18px 22px; overflow: auto; min-height: 0; }
.bt-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin: 0 0 16px; }
.bt-row .lab { font-size: 12.5px; font-weight: 600; color: var(--mute); min-width: 118px; }
.bt-note { font-size: 13px; color: var(--mute); margin: 0 0 14px; max-width: 70ch; }
.bt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; }
.bt-card { border: 1px solid var(--line); border-radius: 14px; background: var(--surface-2); overflow: hidden; display: flex; flex-direction: column; min-width: 0; }
.bt-card .th { aspect-ratio: 9 / 16; background: var(--sunk); display: grid; place-items: center; color: var(--dim); font-size: 12px; position: relative; }
.bt-card .th img { width: 100%; height: 100%; object-fit: cover; display: block; }
.bt-card .th .st { position: absolute; left: 8px; top: 8px; }
.bt-card .th .pg { position: absolute; left: 0; bottom: 0; height: 5px; background: var(--grad); }
.bt-card .nm { padding: 9px 10px 2px; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bt-card .mt { padding: 0 10px 8px; font: 500 11.5px/1.3 var(--f-mono); color: var(--dim); }
.bt-card .ac { display: flex; gap: 6px; padding: 0 8px 10px; flex-wrap: wrap; }
.bt-prog { height: 8px; border-radius: 4px; background: var(--sunk); overflow: hidden; margin: 0 0 8px; }
.bt-prog i { display: block; height: 100%; width: 0; background: var(--grad); transition: width .2s; }
.bt-status { font-size: 13px; color: var(--mute); margin: 0 0 14px; min-height: 1.4em; }
`; document.head.appendChild(css);
  const SHOW = ['searchx', 'phonex', 'stackx', 'typex', 'mapx', 'feedx', 'calx', 'gridx', 'browserx'];
  const BT = { n: 8, kind: 'mix', items: [], busy: '', run: false, stop: false, zip: null, seed: 0 };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const brandMedia = () => (NX.brandClips ? NX.brandClips() : []).filter(r => r && r.id);

  // ------------------------------------------------------------------ the modal
  const modal = el('div', 'modal'); modal.id = 'btModal'; modal.hidden = true; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'btTitle');
  const sheet = el('div', 'sheet bt-sheet'), head = el('header'), hd = el('div'), h2 = el('h2', '', 'Make a set'), hp = el('p', '', ''); h2.id = 'btTitle'; hd.appendChild(h2); hd.appendChild(hp); head.appendChild(hd);
  const body = el('div', 'bt-body'), foot = el('footer'); sheet.appendChild(head); sheet.appendChild(body); sheet.appendChild(foot); modal.appendChild(sheet); document.body.appendChild(modal);
  const btn = (cls, label, on) => { const b = el('button', 'btn ' + cls, label); b.type = 'button'; b.onclick = on; return b; };
  const chips = (label, opts, cur, on) => { const r = el('div', 'bt-row'); r.appendChild(el('span', 'lab', label)); const c = el('div', 'chips'); for (const [v, t] of opts) { const b = el('button', '', t); b.type = 'button'; b.setAttribute('aria-pressed', String(v === cur)); b.onclick = () => on(v); c.appendChild(b); } r.appendChild(c); return r; };
  function open() { if (BT.run) { modal.hidden = false; return; } BT.items = []; BT.zip = null; BT.busy = ''; modal.hidden = false; paint(); }
  function close() { if (BT.run) { BT.stop = true; A.cancelExport(); } modal.hidden = true; }
  modal.addEventListener('mousedown', e => { if (e.target === modal && !BT.run) close(); });

  // ------------------------------------------------------------------ choosing and filling
  function choose(b, n, kind) {
    const ok = id => { const t = A.TPL(id); return t && !QK.excluded(t, b); }, show = SHOW.filter(ok), rot = show.slice(BT.seed % Math.max(1, show.length)).concat(show.slice(0, BT.seed % Math.max(1, show.length)));
    if (kind === 'show') return rot.slice(0, n).map(id => A.TPL(id));
    const M = brandMedia(); QK.Q.media = new Set(M.map(r => r.id)); QK.Q.brief = ''; QK.Q.goal = ''; QK.Q.vibe = '';
    const want = kind === 'foot' ? n : Math.max(0, n - Math.min(rot.length, Math.ceil(n / 2))), fams = new Set(), rest = [];
    for (const c of QK.shortlist(b, Math.max(want * 3, 12))) { const t = c.t, fk = t.cf || t.fam || t.id; if (SHOW.includes(t.id) || t.hol || t.id === 'stingx') continue; if (kind === 'foot' && !c.info.fields.some(f => f.type === 'shot')) continue;
      if (fams.has(fk) && fk !== 'Signature') continue; fams.add(fk); rest.push(t); if (rest.length >= want) break; }
    const first = kind === 'foot' ? [] : rot.slice(0, n - rest.length).map(id => A.TPL(id)), out = [];   // alternate so the set reads as a mix
    for (let i = 0; i < Math.max(first.length, rest.length); i++) { if (first[i]) out.push(first[i]); if (rest[i]) out.push(rest[i]); }
    return out.slice(0, n);
  }
  async function buildSet() {
    const b = A.B(), M = brandMedia(); BT.busy = 'Choosing formats for ' + b.name + '…'; BT.items = []; BT.zip = null; paint(); await sleep(30);
    await A.stopThumbs(); await A.waitIdle();
    const picks = choose(b, BT.n, BT.kind); BT.seed++;
    picks.forEach((t, i) => {
      const info = QK.fieldsOf(t, b); if (!info) return;
      const proj = A.newProject(t, {}); proj.text = {}; proj.shot = {}; proj.batch = true; proj.name = t.name + ' · ' + (b.short || b.name);
      const order = M.length ? M.slice(i % M.length).concat(M.slice(0, i % M.length)).map(r => r.id) : [];   // each video leads with a different photo
      Object.assign(proj.shot, QK.assignShots(info.fields, M, order).shot);
      BT.items.push({ t, proj, dur: info.dur, shots: info.fields.filter(f => f.type === 'shot').length, thumb: '', state: '', blob: null, p: 0 });
    });
    BT.busy = ''; paint();
    for (const it of BT.items) { if (modal.hidden || !BT.items.includes(it)) break; try { it.thumb = await A.renderOne(it.t, it.proj, A.POSTER(it.t.id), true); } catch (e) { console.warn('set thumb', e); } paintCard(it); }
  }

  // ------------------------------------------------------------------ keeping and exporting
  async function keepAll() {
    if (!CAP.db) { A.toast('Saving works when the studio is opened on claude.ai.', 6000); return; } let n = 0;
    for (const it of BT.items) { if (it.proj.saved) continue; try { await A.saveProjectDoc(it.proj); n++; } catch (e) { A.toast('Couldn’t save “' + it.proj.name + '” (' + (e.code || e.message) + ').', 6000); break; } }
    A.toast(n ? n + ' video' + (n > 1 ? 's' : '') + ' kept in Projects.' : 'They are already in Projects.'); paint();
  }
  const safe = s => String(s || '').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_');
  const fileOf = (it, i) => String(i + 1).padStart(2, '0') + '_' + safe(it.t.name).slice(0, 40) + '_9x16.mp4';
  async function exportAll() {
    if (BT.run || !BT.items.length) return; BT.run = true; BT.stop = false; BT.zip = null; const prev = S.proj; paint();
    const st = body.querySelector('.bt-status'), bar = body.querySelector('.bt-prog i'), N = BT.items.length; let done = 0;
    try {
      for (let i = 0; i < N && !BT.stop; i++) {
        const it = BT.items[i]; if (it.blob) { done++; continue; } it.state = 'Rendering'; it.p = 0; paintCard(it);
        A.openProject(it.proj, { stay: true }); await sleep(120); await A.waitIdle();
        try { it.blob = await A.exportBlob((n, T, eta) => { it.p = n / T; const pg = it.card && it.card.querySelector('.pg'); if (pg) pg.style.width = (it.p * 100) + '%'; if (bar) bar.style.width = ((done + it.p) / N * 100) + '%'; if (st) st.textContent = 'Video ' + (i + 1) + ' of ' + N + ': ' + it.t.name + (eta ? ' · about ' + eta + ' left on this one' : ''); });
          it.state = 'Ready'; done++; }
        catch (e) { if (BT.stop) { it.state = ''; break; } console.error(e); it.state = 'Failed'; it.err = String(e && e.message || e); }
        paintCard(it);
      }
    } finally { BT.run = false; if (prev && prev !== S.proj) { try { A.openProject(prev, { stay: true }); } catch (e) {} } A.scheduleThumbs(3000); }
    const ok = BT.items.filter(x => x.blob);
    if (ok.length) { try { BT.zip = await zipOf(ok.map(x => ({ name: fileOf(x, BT.items.indexOf(x)), blob: x.blob }))); } catch (e) { console.error(e); } }
    paint(); if (!BT.stop && ok.length) saveZip();
  }
  async function saveZip() {
    if (!BT.zip) return; if (!CAP.downloads) { A.toast('Saving files isn’t available in this view. Open the studio on claude.ai in Chrome or Edge.', 7000); return; }
    const b = A.B(), name = safe(b.short || b.name).slice(0, 24) + '_set_' + new Date().toISOString().slice(0, 10) + '.zip';
    try { await CAP.downloads.save({ filename: name, data: BT.zip }); A.toast('Saved ' + name); } catch (e) { if (e && e.code === 'declined') return; A.toast(e && e.code === 'rate_limited' ? 'A save prompt is already open.' : 'Couldn’t save the zip (' + (e.code || e.message) + '). Save the videos one at a time from their cards.', 7000); }
  }
  async function saveOne(it) {
    if (!it.blob) return; if (!CAP.downloads) { A.toast('Saving files isn’t available in this view.', 6000); return; }
    const name = safe(A.B().short || A.B().name).slice(0, 20) + '_' + fileOf(it, BT.items.indexOf(it));
    try { await CAP.downloads.save({ filename: name, data: it.blob }); A.toast('Saved ' + name); } catch (e) { if (!(e && e.code === 'declined')) A.toast('Couldn’t save the file (' + (e.code || e.message) + ').', 6000); }
  }
  // a plain (stored, uncompressed) zip: MP4s don't compress, so this is all a set needs
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = u8 => { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  async function zipOf(files) {
    const enc = new TextEncoder(), parts = [], cen = []; let off = 0; const d = new Date(), dt = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(), tm = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    for (const f of files) {
      const data = new Uint8Array(await f.blob.arrayBuffer()), nm = enc.encode(f.name), crc = crc32(data), lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true); lh.setUint16(10, tm, true); lh.setUint16(12, dt, true); lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, nm.length, true); lh.setUint16(28, 0, true);
      parts.push(lh.buffer, nm, data);
      const ch = new DataView(new ArrayBuffer(46)); ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, tm, true); ch.setUint16(14, dt, true); ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true); ch.setUint16(28, nm.length, true); ch.setUint32(42, off, true);
      cen.push(ch.buffer, nm); off += 30 + nm.length + data.length;
    }
    const cenSize = cen.reduce((a, x) => a + x.byteLength, 0), end = new DataView(new ArrayBuffer(22)); end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, cenSize, true); end.setUint32(16, off, true);
    return new Blob(parts.concat(cen, [end.buffer]), { type: 'application/zip' });
  }

  // ------------------------------------------------------------------ painting
  function paintCard(it) {
    const c = it.card; if (!c || !c.isConnected) return; c.textContent = '';
    const th = el('div', 'th'); if (it.thumb) { const im = el('img'); im.src = it.thumb; im.alt = ''; th.appendChild(im); } else th.appendChild(el('span', '', 'Drawing…'));
    if (it.state) th.appendChild(el('span', 'st pill ' + (it.state === 'Ready' ? 'ok' : it.state === 'Failed' ? 'warn' : 'acc'), it.state));
    if (it.state === 'Rendering') { const pg = el('i', 'pg'); pg.style.width = (it.p * 100) + '%'; th.appendChild(pg); } c.appendChild(th);
    c.appendChild(el('div', 'nm', it.t.name)); c.appendChild(el('div', 'mt', Math.round(it.dur) + ' s' + (it.shots ? ' · ' + it.shots + ' photo' + (it.shots > 1 ? 's' : '') : ' · no footage') + (it.proj.saved ? ' · kept' : '')));
    const ac = el('div', 'ac'); const lock = BT.run;
    const o = btn('sm', 'Open', () => { modal.hidden = true; A.openProject(it.proj, { step: 'text' }); A.markDirty(); }); o.disabled = lock; ac.appendChild(o);
    if (it.blob) ac.appendChild(btn('sm', 'Save', () => saveOne(it)));
    else { const r = btn('sm ghost', 'Remove', () => { BT.items = BT.items.filter(x => x !== it); BT.zip = null; paint(); }); r.disabled = lock; ac.appendChild(r); }
    if (it.err) c.title = it.err; c.appendChild(ac);
  }
  function paint() {
    const b = A.B(), M = brandMedia(), ph = M.filter(r => r.still).length; body.textContent = ''; foot.textContent = '';
    hp.textContent = b.name + ' · ' + A.indOf(b).label + ' · ' + (M.length ? (M.length - ph) + ' clip' + (M.length - ph === 1 ? '' : 's') + ' and ' + ph + ' photo' + (ph === 1 ? '' : 's') + ' to work with' : 'no photos or clips yet');
    if (BT.busy) { body.appendChild(el('p', 'bt-note', BT.busy)); foot.appendChild(btn('', 'Close', close)); return; }
    if (!BT.items.length) {
      body.appendChild(el('p', 'bt-note', 'Pick how many and the studio builds that many different videos for ' + (b.short || b.name) + ' at once: a different format each, filled with this brand’s photos, clips, colours and contact details. You can open any of them to change the words before you export.'));
      body.appendChild(chips('How many videos', [[5, '5'], [8, '8'], [10, '10']], BT.n, v => { BT.n = v; paint(); }));
      body.appendChild(chips('What kind', [['mix', 'Best mix'], ['show', 'Motion showpieces'], ['foot', 'Footage-led']], BT.kind, v => { BT.kind = v; paint(); }));
      body.appendChild(el('p', 'bt-note', BT.kind === 'show' ? 'The animated showpieces: search, phone, feed, map, calendar and more. They look finished even with only a few photos.' : BT.kind === 'foot' ? 'Templates built around your photos and clips, one from each family that fits ' + A.indOf(b).label.toLowerCase() + '.' : 'Half motion showpieces, half the templates that score best for this brand and its footage.'));
      if (!M.length) body.appendChild(el('p', 'bt-note', 'This brand has no photos or clips yet, so photo slots will show the branded placeholder. Add some in Footage first for a set you can post.'));
      foot.appendChild(el('span', 'grow', 'Words start as sample copy for the industry. Nothing is made up as fact.')); foot.appendChild(btn('', 'Cancel', close)); foot.appendChild(btn('primary', 'Build the set', buildSet)); return;
    }
    if (BT.run || BT.items.some(x => x.blob)) { const pr = el('div', 'bt-prog'); pr.appendChild(el('i')); body.appendChild(pr); const done = BT.items.filter(x => x.blob).length; pr.firstChild.style.width = (done / BT.items.length * 100) + '%';
      body.appendChild(el('p', 'bt-status', BT.run ? 'Starting…' : done === BT.items.length ? 'All ' + done + ' videos are ready' + (BT.zip ? ' (' + (BT.zip.size / 1048576).toFixed(0) + ' MB as one zip).' : '.') : done + ' of ' + BT.items.length + ' videos are ready.')); }
    else body.appendChild(el('p', 'bt-note', 'Here is the set. Open one to change its words or photos, remove any you don’t want, then keep or export them all. Exporting renders each video in turn; leave this tab open while it works.'));
    const g = el('div', 'bt-grid'); for (const it of BT.items) { it.card = el('div', 'bt-card'); g.appendChild(it.card); } body.appendChild(g); BT.items.forEach(paintCard);
    if (BT.run) { foot.appendChild(el('span', 'grow', 'Rendering. You can keep this open in the background.')); foot.appendChild(btn('', 'Stop', () => { BT.stop = true; A.cancelExport(); })); return; }
    foot.appendChild(el('span', 'grow', BT.items.length + ' videos · ' + Math.round(BT.items.reduce((a, x) => a + x.dur, 0)) + ' s in all'));
    foot.appendChild(btn('ghost', 'Start over', () => { BT.items = []; BT.zip = null; paint(); })); foot.appendChild(btn('', 'Close', close));
    const k = btn('', 'Keep all in Projects', keepAll); k.disabled = !CAP.db || BT.items.every(x => x.proj.saved); foot.appendChild(k);
    if (BT.zip) foot.appendChild(btn('primary', 'Save the zip', saveZip));
    if (BT.items.some(x => !x.blob)) foot.appendChild(btn(BT.zip ? '' : 'primary', BT.items.some(x => x.blob) ? 'Export the rest' : 'Export all', exportAll));
  }

  // Home: an intent next to the others
  (A.HOOK.intents = A.HOOK.intents || []).push(box => { const b = el('button', 'intent'); b.type = 'button'; const i = el('i'); i.innerHTML = '<svg class="i" viewBox="0 0 24 24"><rect x="3" y="5" width="8" height="14" rx="2"/><rect x="13" y="5" width="8" height="14" rx="2"/></svg>'; b.appendChild(i); b.appendChild(document.createTextNode('Make a set')); b.onclick = open; box.appendChild(b); });
  try { A.buildGallery && document.getElementById('intents') && A.HOOK.intents[A.HOOK.intents.length - 1](document.getElementById('intents')); } catch (e) {}
  NX.batch = { open, close, BT, buildSet, exportAll, keepAll, zipOf, choose };
})();
