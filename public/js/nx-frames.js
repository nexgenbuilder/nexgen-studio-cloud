'use strict';
/* NexGen Clip Studio: footage. A registry of clips per brand (library clips + uploads), placeholder clips for slots a brand
   has no footage for yet, and the frame bank that decodes footage with WebCodecs (mediabunny) for the video engine. */
window.NX = window.NX || {};
(() => {
  const NXo = NX;
  // ------------------------------------------------------------ registry
  const CLIPS = new Map(), META = {};
  NXo.CLIPS = CLIPS; NXo.META = META;
  NXo.addClip = row => {
    const pairs = [], sg = Array.isArray(row.segs) ? row.segs : [];
    for (let i = 0; i + 1 < sg.length; i += 2) pairs.push([sg[i], sg[i + 1]]);
    if (!pairs.length) pairs.push([0, row.n - 1]);
    const vert = row.h > row.w, hw = row.hw || Math.min(960, row.w), hh = row.hh || Math.round(hw * row.h / row.w);
    META[row.id] = { n: row.n, w: row.w, h: row.h, hw, hh, orient: vert ? 'v' : 'h', segs: pairs, fps: 30, project: row.project || '', still: !!row.still };
    CLIPS.set(row.id, Object.assign({}, row, { kind: vert ? 'vert' : 'land', dur: row.n / 30 }));
  };
  NXo.dropClip = id => { CLIPS.delete(id); delete META[id]; };
  NXo.brandClips = () => [...CLIPS.values()].filter(r => r.brand === NXo.activeBrandId());
  NXo.isPh = c => typeof c === 'string' && (c.startsWith('phl:') || c.startsWith('phv:'));
  NXo.phLabels = {};   // placeholder clip id -> slot label, written when a template builds
  const phMeta = c => { const v = c.startsWith('phv:'); return { n: 5400, w: v ? 1080 : 1920, h: v ? 1920 : 1080, hw: v ? 540 : 960, hh: v ? 960 : 540, orient: v ? 'v' : 'h', segs: [[0, 5399]], fps: 30, project: (BRAND.name || '').toUpperCase(), ph: true }; };
  // meta the engine sees: only the active brand's clips, plus placeholders
  NXo.meta = c => { if (NXo.isPh(c)) return phMeta(c); const r = CLIPS.get(c); return r && r.brand === NXo.activeBrandId() ? META[c] : undefined; };
  NXo.activeBrandId = () => BRAND.id;

  // ------------------------------------------------------------ placeholder frames: brand colours, slow drifting stripes, the slot name
  function phFrame(c, i) {
    const v = c.startsWith('phv:'), w = v ? 540 : 960, h = v ? 960 : 540, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const g = cv.getContext('2d'), lab = NXo.phLabels[c] || 'Shot';
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, mix(BLK, OR, 0.22)); gr.addColorStop(1, mix(BLK, '#000000', 0.25)); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.save(); g.globalAlpha = 0.09; g.strokeStyle = OR; g.lineWidth = 26; const off = (i * 1.2) % 72;
    for (let x = -h - 72 + off; x < w + h; x += 72) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.stroke(); } g.restore();
    const cx = w / 2, cy = h / 2 - (v ? 40 : 20), s = v ? 1 : 0.8;
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 4 * s; g.lineJoin = 'round';
    g.beginPath(); g.roundRect(cx - 60 * s, cy - 38 * s, 92 * s, 76 * s, 10 * s); g.stroke();
    g.beginPath(); g.moveTo(cx + 36 * s, cy - 14 * s); g.lineTo(cx + 66 * s, cy - 32 * s); g.lineTo(cx + 66 * s, cy + 32 * s); g.lineTo(cx + 36 * s, cy + 14 * s); g.closePath(); g.stroke();
    g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = `700 ${Math.round(26 * s)}px Mono`; g.letterSpacing = '6px'; g.fillText('ADD FOOTAGE', cx, cy + 92 * s);
    g.font = `600 ${Math.round(22 * s)}px Mont`; g.letterSpacing = '1px'; g.fillStyle = 'rgba(255,255,255,0.72)'; g.fillText(lab.slice(0, 40), cx, cy + 130 * s);
    g.font = `700 ${Math.round(18 * s)}px Mono`; g.letterSpacing = '3px'; g.fillStyle = OR; g.fillText(v ? '9 : 16' : '16 : 9', cx, h - 36 * s);
    return createImageBitmap(cv).then(b => { b._k = w / (v ? 1080 : 1920); return b; });
  }
  function mix(a, b, u) { const p = x => [1, 3, 5].map(k => parseInt(x.slice(k, k + 2), 16)), A = p(a), B = p(b); return 'rgb(' + A.map((x, k) => Math.round(x + (B[k] - x) * u)).join(',') + ')'; }
  NXo.mixColor = mix;

  // ------------------------------------------------------------ frame bank
  const FB = (() => {
    let MB = null;
    const ready = import(new URL('vendor/mediabunny.min.mjs', document.baseURI).href).then(m => (MB = m));
    const blobs = new Map(), opened = new Map(), stills = new Map();   // stills: photo id -> Promise<ImageBitmap> (decoded once, copied per frame)
    function still(id) {
      if (stills.has(id)) return stills.get(id);
      const p = blob(id).then(b => createImageBitmap(b, { imageOrientation: 'from-image' })); stills.set(id, p); p.catch(() => stills.delete(id)); return p;
    }
    async function stillFrame(id, q) {   // a copy the engine cache may close; 'h' is the proxy size
      const src = await still(id), m = META[id], tw = q === 'h' ? Math.min(src.width, m.hw) : src.width, th = Math.max(1, Math.round(tw * src.height / src.width));
      const bmp = tw === src.width ? await createImageBitmap(src) : await createImageBitmap(src, { resizeWidth: tw, resizeHeight: th, resizeQuality: 'high' }); bmp._k = bmp.width / (q === 'h' ? m.hw : m.w); return bmp;
    }
    let mode = 'seek';
    const blobUrl = row => row.url || ('/_blob/' + row.asset);
    function blob(id) {
      if (blobs.has(id)) return blobs.get(id);
      const row = CLIPS.get(id); if (!row) return Promise.reject(new Error('Footage ' + id + ' is not in the library.'));
      const p = fetch(blobUrl(row)).then(r => { if (!r.ok) throw new Error('Footage “' + row.name + '” did not load (' + r.status + ').'); return r.blob(); });
      blobs.set(id, p); p.catch(() => blobs.delete(id)); return p;
    }
    function open(id) {
      if (opened.has(id)) return opened.get(id);
      const p = (async () => {
        await ready; const b = await blob(id);
        const input = new MB.Input({ source: new MB.BlobSource(b), formats: MB.ALL_FORMATS });
        const track = await input.getPrimaryVideoTrack(); if (!track) throw new Error('No video track in ' + id);
        return { id, input, track, t0: await track.getFirstTimestamp(), sink: new MB.VideoSampleSink(track), streams: [] };
      })();
      opened.set(id, p); p.catch(() => opened.delete(id)); return p;
    }
    async function toBmp(id, smp, q) {
      const m = META[id], vf = smp.toVideoFrame();
      try {
        const sw = vf.displayWidth, sh = vf.displayHeight; let tw = sw, th = sh;
        if (q === 'h') { tw = Math.min(sw, Math.round(m.hw * sw / m.w)); th = Math.max(1, Math.round(tw * sh / sw)); }
        const bmp = tw === sw ? await createImageBitmap(vf) : await createImageBitmap(vf, { resizeWidth: tw, resizeHeight: th, resizeQuality: 'medium' });
        bmp._k = bmp.width / (q === 'h' ? m.hw : m.w); return bmp;
      } finally { vf.close(); }
    }
    const pick = (st, T) => { let b = null; for (const s of st.streams) if (!s.closed && s.want <= T + 1e-6 && T - s.want < 1.0 && (!b || s.want > b.want)) b = s; return b; };
    function closeS(s) { s.closed = true; s.chain.then(() => { try { s.gen.return(); } catch (e) {} if (s.cur) { s.cur.close(); s.cur = null; } }); }
    function newStream(st, T) {
      const s = { gen: st.sink.samples(Math.max(st.t0, T - 0.05)), cur: null, want: T, chain: Promise.resolve(), closed: false, ended: false, used: performance.now() };
      st.streams.push(s);
      if (st.streams.length > 3) { st.streams.sort((a, b) => b.used - a.used); st.streams.splice(3).forEach(closeS); }
      return s;
    }
    async function advance(s, T) {
      for (;;) {
        if (s.cur) { if (s.cur.timestamp > T + 1e-6) return null; if (T < s.cur.timestamp + s.cur.duration - 1e-6 || s.ended) return s.cur; }
        else if (s.ended) return null;
        const r = await s.gen.next();
        if (r.done) { s.ended = true; continue; }
        if (s.cur) s.cur.close(); s.cur = r.value;
      }
    }
    async function single(st, T, q) { const smp = await st.sink.getSample(T); if (!smp) throw new Error('No frame at ' + T.toFixed(2) + ' s in ' + st.id); try { return await toBmp(st.id, smp, q); } finally { smp.close(); } }
    async function frame(id, i, q) {
      if (NXo.isPh(id)) return phFrame(id, i);
      if (META[id] && META[id].still) return stillFrame(id, q);
      const st = await open(id), T = st.t0 + (i + 0.5) / 30;
      if (mode !== 'play') return single(st, T, q);
      const s = pick(st, T) || newStream(st, T);
      s.want = Math.max(s.want, T); s.used = performance.now();
      const job = s.chain.then(async () => { const smp = await advance(s, T); return smp ? toBmp(id, smp, q) : single(st, T, q); });
      s.chain = job.catch(() => {});
      return job;
    }
    function setMode(m) {
      if (m === mode) return; mode = m;
      if (m !== 'play') for (const p of opened.values()) p.then(st => { st.streams.forEach(closeS); st.streams = []; }).catch(() => {});
    }
    setInterval(() => { const now = performance.now(); for (const p of opened.values()) p.then(st => { const keep = []; st.streams.forEach(s => (now - s.used > 4000 ? closeS(s) : keep.push(s))); st.streams = keep; }).catch(() => {}); }, 2000);
    async function draw(id, t, cv, q) {   // one frame, contain-fit, into a canvas (thumbnails, picker)
      const bmp = NXo.isPh(id) ? await phFrame(id, 0) : META[id] && META[id].still ? await stillFrame(id, q || 'h') : await single(await open(id), (await open(id)).t0 + Math.max(0, t) + 0.5 / 30, q || 'h');
      const g = cv.getContext('2d'), s = Math.min(cv.width / bmp.width, cv.height / bmp.height), w = bmp.width * s, h = bmp.height * s;
      g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(bmp, (cv.width - w) / 2, (cv.height - h) / 2, w, h); bmp.close();
    }
    async function strip(id, cv) {   // filmstrip across the whole clip (a photo repeats)
      if (META[id] && META[id].still) { const b = await stillFrame(id, 'h'), g = cv.getContext('2d'), cell = cv.height * b.width / b.height; g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height); for (let x = 0; x < cv.width; x += cell) g.drawImage(b, x, 0, cell, cv.height); b.close(); return; }
      const st = await open(id), m = META[id], dur = m.n / 30, g = cv.getContext('2d'), cell = cv.height * m.w / m.h, n = Math.max(1, Math.ceil(cv.width / cell));
      g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height);
      const ts = Array.from({ length: n }, (_, k) => st.t0 + (k + 0.5) * dur / n);
      let k = 0; for await (const smp of st.sink.samplesAtTimestamps(ts)) { if (smp) { smp.draw(g, k * cell, 0, cell, cv.height); smp.close(); } k++; }
    }
    const open2 = id => (META[id] && META[id].still ? still(id) : open(id));
    return { ready, mb: () => ready, blob, open: open2, frame, setMode, get mode() { return mode; }, draw, strip, forget(id) { blobs.delete(id); opened.delete(id); stills.delete(id); } };
  })();
  NXo.FB = FB;
  VID.setBackend({ meta: c => NXo.meta(c), load: (c, i, q) => FB.frame(c, i, q) });
  VID.setMax(30);
})();
