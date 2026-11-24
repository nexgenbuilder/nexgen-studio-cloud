'use strict';
/* NexGen Studio V19 (Nov 11): voiceover-driven edits in the timeline editor.
   Drop in a voiceover (an ElevenLabs MP3, a WAV, an M4A, or a video with a voice track) and paste its script:
   - the voice plays on the edit and the music drops under it;
   - every word of the script is timed to the voice, and the captions follow it word by word;
   - "Cut scenes to the voice" re-times the clips on the main track so the picture changes on the sentences.
   How the timing works: the studio finds the pauses in the recording, matches them to the punctuation in the script and
   spreads the words between them by their syllables. It needs the script (it does not transcribe); on a clean
   recording most words land within a tenth or two of a second (in tests against known timings), and "Shift the captions" nudges them if needed.
   The voice is stored with the brand's footage as an AAC file. tl.vo = { asset, name, dur, t0, vol, script, pauses }.
   The captions are an ordinary animated-captions layer (cap.times carries the word timings), so every caption style,
   font, colour and position in the Text Studio works on them. */
(() => {
  const X = NX.editor; if (!X || !X.XT || !X.api || !NX.app) return;
  const A = NX.app, el = A.el, api = X.api, XT = X.XT, ED = X.ED, S = A.S, CAP = A.CAP;
  const { TL, F, change, rangeRow, segRow, r3 } = api;
  const css = document.createElement('style'); css.textContent = `
.vo-drop { display: flex; flex-direction: column; align-items: center; gap: 8px; border: 1.5px dashed var(--line2); border-radius: 12px; padding: 22px 14px; text-align: center; color: var(--mute); font-size: 12.5px; margin: 0 0 12px; background: var(--raise); }
.vo-drop.over { border-color: var(--accent); background: var(--accent-soft); }
.vo-card { border: 1px solid var(--line); background: var(--raise); border-radius: 10px; padding: 10px 12px; margin: 0 0 12px; }
.vo-card b { display: block; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vo-card small { display: block; font: 500 11px/1.4 var(--f-mono); color: var(--dim); margin-top: 2px; }
.vo-wave { display: block; width: 100%; height: 44px; margin-top: 8px; border-radius: 6px; background: var(--well); }
.vo-script { width: 100%; min-height: 150px; resize: vertical; background: var(--well); border: 1px solid var(--line2); border-radius: 9px; padding: 9px 11px; color: var(--fg); font: 500 13px/1.5 var(--f-ui); margin: 0 0 8px; }
.vo-script:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.vo-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 0 0 12px; }
.vo-ok { font-size: 12px; color: var(--ok); margin: 0 0 10px; } .vo-warn { font-size: 12px; color: var(--warn); margin: 0 0 10px; }
`; document.head.appendChild(css);
  const ST = { busy: '', bufs: new Map(), env: new Map(), mode: 'karaoke' };
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));

  // ------------------------------------------------------------------ analysis: where the voice is, and where it pauses
  // mono samples -> { segs: [[a, b]…] voiced stretches (s), env: loudness per 10 ms (0..1) }
  function voiced(x, sr) {
    const hop = Math.round(sr / 100), n = Math.floor(x.length / hop), env = new Float32Array(n);
    for (let i = 0; i < n; i++) { let s = 0; const o = i * hop; for (let j = 0; j < hop; j++) { const v = x[o + j]; s += v * v; } env[i] = Math.sqrt(s / hop); }
    const sm = new Float32Array(n); for (let i = 0; i < n; i++) { let s = 0, c = 0; for (let j = Math.max(0, i - 2); j <= Math.min(n - 1, i + 2); j++) { s += env[j]; c++; } sm[i] = s / c; }
    const sorted = Float32Array.from(sm).sort(), hi = sorted[Math.floor(n * 0.95)] || 1e-6, lo = sorted[Math.floor(n * 0.1)] || 0;
    const th = Math.max(lo * 2.5, hi * 0.07, 1e-4), segs = []; let a = -1;
    for (let i = 0; i < n; i++) { const on = sm[i] > th; if (on && a < 0) a = i; if (!on && a >= 0) { segs.push([a / 100, i / 100]); a = -1; } }
    if (a >= 0) segs.push([a / 100, n / 100]);
    const out = [];   // join stretches split by gaps shorter than a real pause, drop clicks
    for (const g of segs) { const l = out[out.length - 1]; if (l && g[0] - l[1] < 0.17) l[1] = g[1]; else out.push(g.slice()); }
    const keep = out.filter(g => g[1] - g[0] >= 0.09);
    for (let i = 0; i < n; i++) sm[i] = Math.min(1, sm[i] / hi);
    return { segs: keep, env: sm };
  }
  // the script as words: w (as typed), wt (how long it takes to say), brk (the pause its punctuation asks for: 0..3)
  const NUM = /^[\$£€]?[\d][\d,.:\/%-]*\w*$/;
  function syll(w) {
    const s = w.toLowerCase().replace(/[^a-záéíóúüñàèìòùâêîôûäëïöç0-9]/g, ''); if (!s) return 0.4;
    if (NUM.test(w.replace(/[.,!?;:…]+$/, ''))) return Math.max(2, s.replace(/[^0-9]/g, '').length * 1.6);
    const g = s.replace(/e$/, '').match(/[aeiouyáéíóúüàèìòùâêîôûäëïö]+/g); return Math.max(1, g ? g.length : 1);
  }
  function tokens(script) {
    const out = []; const lines = String(script || '').replace(/\r/g, '').split(/\n+/);
    lines.forEach(line => { const ws = line.trim().split(/\s+/).filter(Boolean); ws.forEach((w, i) => {
      if (!/[\p{L}\p{N}]/u.test(w)) { if (out.length) out[out.length - 1].brk = Math.max(out[out.length - 1].brk, /[—–-]/.test(w) ? 2 : 1); return; }   // a lone dash or symbol is a pause, not a word
      const brk = /[.!?…]["”’')\]]*$/.test(w) ? 3 : /[,;:—–]["”’')\]]*$/.test(w) ? 2 : 0;
      out.push({ w, wt: 0.6 * syll(w) + 0.25 + Math.min(1.6, w.replace(/[^\p{L}\p{N}]/gu, '').length * 0.11), brk: i === ws.length - 1 ? Math.max(brk, 2.5) : brk }); }); });
    if (out.length) out[out.length - 1].brk = 0;
    return out;
  }
  // match the script to the voiced stretches: each stretch gets a run of words. Dynamic programming over (stretch, last word):
  // a stretch should be as long as its words take to say, and a pause should fall on punctuation (the longer the pause, the
  // stronger the punctuation it wants). Returns [[start, end]…] per word, or null when there is nothing to match.
  function align(segs, tk) {
    const N = tk.length; if (!N || !segs.length) return null;
    let G = segs.map(g => g.slice());
    while (G.length > N) { let bi = 0, bg = 1e9; for (let i = 0; i + 1 < G.length; i++) { const d = G[i + 1][0] - G[i][1]; if (d < bg) { bg = d; bi = i; } } G[bi][1] = G[bi + 1][1]; G.splice(bi + 1, 1); }
    const K = G.length, len = G.map(g => g[1] - g[0]), tot = len.reduce((a, b) => a + b, 0), cw = new Float64Array(N + 1); for (let i = 0; i < N; i++) cw[i + 1] = cw[i] + tk[i].wt;
    const rate = tot / cw[N];   // seconds per unit of weight
    const INF = 1e18, cost = Array.from({ length: K + 1 }, () => new Float64Array(N + 1).fill(INF)), back = Array.from({ length: K + 1 }, () => new Int32Array(N + 1).fill(-1));
    cost[0][0] = 0;
    for (let k = 1; k <= K; k++) {
      const L = len[k - 1], pause = k < K ? G[k][0] - G[k - 1][1] : 0;
      for (let j = k; j <= N - (K - k); j++) {
        // the punctuation after word j-1 against the pause that follows this stretch
        const b = tk[j - 1].brk, pm = k < K ? (b > 0 ? -Math.min(pause, 1.2) * b * 0.9 : 0.5 + pause * 3.2) : 0;
        let best = INF, bi = -1;
        for (let i = k - 1; i < j; i++) { if (cost[k - 1][i] >= INF) continue; const need = (cw[j] - cw[i]) * rate, e = (need - L) / Math.max(0.35, Math.sqrt(L)), c = cost[k - 1][i] + e * e; if (c < best) { best = c; bi = i; } }
        if (bi >= 0) { cost[k][j] = best + pm; back[k][j] = bi; }
      }
    }
    if (cost[K][N] >= INF) return null;
    const cuts = new Array(K + 1); cuts[K] = N; for (let k = K; k > 0; k--) cuts[k - 1] = back[k][cuts[k]];
    const out = new Array(N);
    for (let k = 0; k < K; k++) { const i0 = cuts[k], i1 = cuts[k + 1], w = cw[i1] - cw[i0]; let t = G[k][0];
      for (let i = i0; i < i1; i++) { const d = len[k] * tk[i].wt / w; out[i] = [Math.round(t * 1000) / 1000, Math.round((t + d) * 1000) / 1000]; t += d; } }
    return out;
  }
  function alignScript(x, sr, script) { const v = voiced(x, sr), tk = tokens(script), times = align(v.segs, tk); return { times, words: tk.map(t => t.w), tk, segs: v.segs, env: v.env }; }
  const monoOf = buf => { const n = buf.length, a = buf.getChannelData(0), out = new Float32Array(n); if (buf.numberOfChannels < 2) { out.set(a); return out; } const b = buf.getChannelData(1); for (let i = 0; i < n; i++) out[i] = (a[i] + b[i]) / 2; return out; };

  // ------------------------------------------------------------------ the recording: decode, store, play
  function voBuf(vo) {
    if (!vo || !vo.asset) return Promise.resolve(null); if (ST.bufs.has(vo.asset)) return ST.bufs.get(vo.asset);
    const p = fetch(vo.url || '/_blob/' + vo.asset).then(r => { if (!r.ok) throw new Error('The voiceover did not load (' + r.status + ').'); return r.arrayBuffer(); }).then(ab => new OfflineAudioContext(2, 1, 48000).decodeAudioData(ab));
    ST.bufs.set(vo.asset, p); p.catch(() => ST.bufs.delete(vo.asset)); return p;
  }
  async function encodeAac(buf) {   // an AudioBuffer as an AAC track in an MP4 (the asset store takes video files, not audio)
    const MB = await NX.FB.mb(); let ok = false; try { ok = await MB.canEncodeAudio('aac', { numberOfChannels: 2, sampleRate: 48000, bitrate: 128000 }); } catch (e) {}
    if (!ok) { const m = await import(new URL('vendor/aac-encoder.mjs', document.baseURI).href); m.registerAacEncoder(); }
    const output = new MB.Output({ format: new MB.Mp4OutputFormat({ fastStart: 'in-memory' }), target: new MB.BufferTarget() });
    const src = new MB.AudioBufferSource({ codec: 'aac', bitrate: 128000 }); output.addAudioTrack(src); await output.start();
    const sr = buf.sampleRate, ch = buf.numberOfChannels; for (let o = 0; o < buf.length; o += sr) { const n = Math.min(sr, buf.length - o), piece = new AudioBuffer({ length: n, numberOfChannels: ch, sampleRate: sr }); for (let c = 0; c < ch; c++) piece.copyToChannel(buf.getChannelData(c).subarray(o, o + n), c); await src.add(piece); }
    src.close(); await output.finalize(); return new Blob([output.target.buffer], { type: 'video/mp4' });
  }
  async function addVoice(file) {
    if (!CAP.assets) { A.toast('Adding a voiceover needs edit access to this studio (open it on claude.ai as its owner or an editor).', 6000); return; }
    if (ST.busy) return;
    try {
      ST.busy = 'Reading ' + file.name + '…'; api.renderPanel();
      let dec; try { dec = await new OfflineAudioContext(2, 1, 48000).decodeAudioData(await file.arrayBuffer()); } catch (e) { throw new Error('This browser can’t read the sound in “' + file.name + '”. Use an MP3, WAV or M4A.'); }
      const maxS = 180; let buf = dec;
      if (dec.sampleRate !== 48000 || dec.numberOfChannels !== 2 || dec.duration > maxS) { const n = Math.round(Math.min(dec.duration, maxS) * 48000), oc = new OfflineAudioContext(2, n, 48000), s = oc.createBufferSource(); s.buffer = dec; s.connect(oc.destination); s.start(0); buf = await oc.startRendering(); }
      ST.busy = 'Preparing the voiceover…'; api.renderPanel();
      const blob = await encodeAac(buf); if (blob.size > 19.5 * 1048576) throw new Error('That recording is too long to store. Keep it under three minutes.');
      ST.busy = 'Uploading…'; api.renderPanel();
      const up = await CAP.assets.upload(blob, { type: 'video/mp4' });
      ST.bufs.set(up.id, Promise.resolve(buf));
      const name = file.name.replace(/\.[^.]+$/, '').slice(0, 60), prev = TL().vo;
      change(t => { t.vo = { asset: up.id, name, dur: r3(buf.duration), t0: prev ? prev.t0 || 0 : 0, vol: prev && prev.vol !== undefined ? prev.vol : 1, script: prev ? prev.script || '' : '' }; });
      if (dec.duration > maxS) A.toast('The recording was longer than three minutes; the first three are used.', 6000);
      else A.toast('Voiceover added. Paste its script and the captions will follow the voice.', 5200);
      if (TL().vo.script) await timeCaptions(true);
    } catch (e) { console.error(e); A.toast(String(e && e.message || e), 7000); }
    ST.busy = ''; api.renderPanel(); api.scheduleMix(true);
  }
  function removeVoice() { const id = TL().vo && TL().vo.cap; change(t => { delete t.vo; if (id) t.layers = t.layers.filter(L => L.id !== id); }); api.renderPanel(); api.renderTimeline(); }

  // the mix: the voice, and the stretch the music should drop under
  XT.duck = (t, dur) => (t.vo && t.vo.asset && (t.vo.vol === undefined || t.vo.vol > 0.02) ? [[Math.max(0, +t.vo.t0 || 0), Math.min(dur, (+t.vo.t0 || 0) + t.vo.dur)]] : []);
  const mix0 = XT.mix;
  XT.mix = async (oc, master, t, f, dur) => {
    if (mix0) await mix0(oc, master, t, f, dur);
    const vo = t.vo; if (!vo || !vo.asset) return; const b = await voBuf(vo); if (!b) return;
    const st = Math.max(0, +vo.t0 || 0); if (st >= dur) return;
    const src = oc.createBufferSource(), g = oc.createGain(); src.buffer = b; src.connect(g); g.connect(master); g.gain.value = clampN(vo.vol === undefined ? 1 : +vo.vol, 0, 1.5); src.start(st, 0, Math.min(b.duration, dur - st));
  };
  XT.checks.push(() => { const t = TL(), vo = t && t.vo; if (!vo || !vo.asset) return ''; const end = (+vo.t0 || 0) + vo.dur; return end > S.dur + 0.25 ? 'The voiceover runs ' + (end - S.dur).toFixed(1) + ' s past the end of the video, so its last words are cut off. Add footage, or use “Cut scenes to the voice”.' : ''; });

  // ------------------------------------------------------------------ captions timed to the voice
  const STYLES = { karaoke: [78, 3, 'Mont', 900, 1180, 'accent'], pop: [118, 2, 'Bebas', 400, 1150, 'accent2'], box: [70, 3, 'Mont', 800, 1180, 'accent'], bounce: [128, 1, 'Mont', 900, 1020, 'accent'], line: [54, 6, 'Mont', 600, 1290, 'accent2'] };
  async function analyse(vo) {
    if (ST.env.has(vo.asset + '|' + vo.script)) return ST.env.get(vo.asset + '|' + vo.script);
    const b = await voBuf(vo), r = alignScript(monoOf(b), b.sampleRate, vo.script); ST.env.set(vo.asset + '|' + vo.script, r); if (ST.env.size > 6) ST.env.delete(ST.env.keys().next().value); return r;
  }
  async function timeCaptions(quiet) {
    const vo = TL().vo; if (!vo || !vo.asset) return false;
    const script = String(vo.script || '').trim(); if (!script) { if (!quiet) A.toast('Paste the script first: the words the voice says.'); return false; }
    let r; try { r = await analyse(vo); } catch (e) { A.toast(String(e && e.message || e), 6000); return false; }
    if (!r.times) { A.toast('No speech was found in this recording.'); return false; }
    const text = r.words.join(' '), M = STYLES[ST.mode] || STYLES.karaoke, pauses = [];
    r.tk.forEach((k, i) => { if (i + 1 < r.times.length && (k.brk >= 3 || r.times[i + 1][0] - r.times[i][1] > 0.32)) pauses.push(Math.round((r.times[i][1] + r.times[i + 1][0]) / 2 * 100) / 100); });
    change(t => {
      let L = t.vo.cap ? t.layers.find(x => x.id === t.vo.cap) : null;
      if (!L) { L = { id: api.uid(), kind: 'text', style: 'type', x: 540, y: M[4], slot: M[2], wt: M[3], size: M[0], w: ST.mode === 'line' ? 860 : 900, color: 'white', name: 'Voiceover captions', cap: { mode: ST.mode, per: M[1], hl: M[5] } };
        if (ST.mode !== 'box' && ST.mode !== 'line') L.case = 'upper'; if (ST.mode === 'line') { L.cap.bg = 'bar'; L.cap.bgc = 'ink'; } t.layers.push(L); t.vo.cap = L.id; }
      L.text = text; L.t0 = r3(Math.max(0, +t.vo.t0 || 0)); L.d = r3(t.vo.dur + 0.4); L.cap = Object.assign({}, L.cap, { start: 0, times: r.times.map(x => [x[0] + (+t.vo.shift || 0), x[1] + (+t.vo.shift || 0)]) });
      t.vo.pauses = pauses; t.vo.nw = r.words.length;
    });
    if (!quiet) A.toast(r.words.length + ' words timed to the voice across ' + r.segs.length + ' phrases.');
    api.renderTimeline(); return true;
  }
  // the picture changes on the sentences: clips on the main track are re-timed so each cut lands in a pause of the voice
  function cutToVoice() {
    const t0 = TL(), vo = t0.vo; if (!vo || !vo.asset) return; const f = F();
    const clips = t0.main.filter(x => x.type === 'clip' && NX.META[x.c]); if (!clips.length) { A.toast('Add footage or photos to the main track first.'); return; }
    const first = t0.main.findIndex(x => x.type === 'clip'), lead = f ? f.M.slice(0, first).reduce((a, m) => a + m.d, 0) : 0, v0 = +vo.t0 || 0, end = v0 + vo.dur + 0.35;
    const P = (vo.pauses || []).map(p => p + v0 + (+vo.shift || 0)).filter(p => p > lead + 0.6 && p < end - 0.6);
    // choose clips.length - 1 cut points from the pauses, as evenly spread as the pauses allow
    const n = clips.length, ideal = Array.from({ length: n - 1 }, (_, i) => lead + (end - lead) * (i + 1) / n), cuts = []; let lastT = lead;
    ideal.forEach((x, i) => { const left = n - 1 - i, cand = P.filter(p => p > lastT + 0.7 && p < end - 0.7 * left); let c = cand.length ? cand.reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a)) : x; if (Math.abs(c - x) > (end - lead) / n * 0.75) c = x; c = Math.max(lastT + 0.5, c); cuts.push(c); lastT = c; });
    cuts.push(end); let s = lead, short = 0;
    s = 0; change(t => { let k = 0; t.main.forEach(it => { if (it.type !== 'clip' || !NX.META[it.c]) { const bm = f && f.M.find(m => m.id === it.id); s += bm ? bm.d : +it.d || 0; return; } const m = NX.META[it.c], want = cuts[k++] - s, maxD = K13.maxLen(it, m.n / 30 - (+it.in || 0)); if (want > maxD + 0.02) short++; it.d = r3(Math.max(0.3, Math.min(want, maxD))); s += it.d; }); });
    A.toast(short ? 'Scenes cut to the voice. ' + short + ' clip' + (short > 1 ? 's are' : ' is') + ' shorter than its part of the script, so the cuts after it come early: use a longer clip or add one.' : 'Scenes cut to the voice: ' + n + ' clips, each change on a pause.', 6500);
    api.renderInspector();
  }

  // ------------------------------------------------------------------ the Voiceover tab
  function drawWave(cv, vo) {
    const key = [...ST.env.keys()].find(k => k.startsWith(vo.asset + '|')), r = key ? ST.env.get(key) : null;
    const paint = env => { const w = cv.width = cv.clientWidth * 2 || 560, h = cv.height = 88, g = cv.getContext('2d'), cs = getComputedStyle(document.documentElement); g.clearRect(0, 0, w, h); g.fillStyle = cs.getPropertyValue('--accent').trim() || '#6A4BFF';
      for (let x = 0; x < w; x += 3) { const i0 = Math.floor(x / w * env.length), i1 = Math.max(i0 + 1, Math.floor((x + 3) / w * env.length)); let m = 0; for (let i = i0; i < i1 && i < env.length; i++) m = Math.max(m, env[i]); const bh = Math.max(2, m * (h - 8)); g.fillRect(x, (h - bh) / 2, 2, bh); } };
    if (r) { paint(r.env); return; }
    voBuf(vo).then(b => { if (b && cv.isConnected) paint(voiced(monoOf(b), b.sampleRate).env); }).catch(() => {});
  }
  XT.tabs.push(['voice', 'Voiceover', 'audio']);
  XT.panels.voice = (box, h) => {
    const t = TL(); if (!t) return; const vo = t.vo;
    h.sec('Voiceover');
    if (ST.busy) { box.appendChild(el('p', 'ep-note', ST.busy)); return; }
    const inp = el('input'); inp.type = 'file'; inp.accept = 'audio/*,video/mp4,video/quicktime,.mp3,.wav,.m4a,.aac,.ogg'; inp.hidden = true; inp.id = 'voFile'; inp.onchange = () => { const f = inp.files && inp.files[0]; inp.value = ''; if (f) addVoice(f); }; box.appendChild(inp);
    if (!vo || !vo.asset) {
      h.note('Add the voice (from ElevenLabs or a recording) and paste its script. The studio times every word to the voice, drops the music under it and can cut your scenes on the sentences.');
      const d = el('div', 'vo-drop'); d.appendChild(el('span', '', 'Drop an MP3, WAV or M4A here')); const b = el('button', 'btn sm primary', 'Choose a voiceover'); b.type = 'button'; b.onclick = () => inp.click(); d.appendChild(b);
      d.ondragover = e => { e.preventDefault(); d.classList.add('over'); }; d.ondragleave = () => d.classList.remove('over'); d.ondrop = e => { e.preventDefault(); d.classList.remove('over'); const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) addVoice(f); };
      box.appendChild(d); if (!CAP.assets) h.note('Adding a voiceover needs edit access to this studio.'); return;
    }
    const card = el('div', 'vo-card'); card.appendChild(el('b', '', vo.name || 'Voiceover')); card.appendChild(el('small', '', vo.dur.toFixed(1) + ' s' + (vo.nw ? ' · ' + vo.nw + ' words timed' : ' · not timed yet') + ((+vo.t0 || 0) + vo.dur > S.dur + 0.25 ? ' · longer than the video' : '')));
    const cv = el('canvas', 'vo-wave'); card.appendChild(cv); box.appendChild(card); setTimeout(() => drawWave(cv, vo), 0);
    box.appendChild(rangeRow('Starts at', 0, Math.max(0.5, S.dur - 0.5), 0.05, +vo.t0 || 0, v => { change(tl => { tl.vo.t0 = r3(v); const L = tl.layers.find(x => x.id === tl.vo.cap); if (L) L.t0 = r3(v); }, { key: 'vot0' }); }, A.fmtT));
    box.appendChild(rangeRow('Volume', 0, 1.5, 0.05, vo.vol === undefined ? 1 : vo.vol, v => change(tl => { tl.vo.vol = Math.round(v * 100) / 100; }, { key: 'vovol' }), v => Math.round(v * 100) + '%'));
    h.sec('The script'); h.note('Paste exactly what the voice says, punctuation included: the commas and full stops are how the words find their place.');
    const ta = el('textarea', 'vo-script'); ta.id = 'voScript'; ta.value = vo.script || ''; ta.placeholder = 'Paste the words of the voiceover here…'; ta.setAttribute('aria-label', 'Voiceover script');
    let tt = 0; const keep = () => { clearTimeout(tt); if (TL() && TL().vo && TL().vo.script !== ta.value) change(tl => { tl.vo.script = ta.value; }, { key: 'voscript' }); };
    ta.oninput = () => { clearTimeout(tt); tt = setTimeout(keep, 700); }; ta.onblur = keep; box.appendChild(ta);
    box.appendChild(segRow('Caption style', K8.CAP_MODES.map(m => [m[0], m[1]]), ST.mode, v => { ST.mode = v; const L = TL().layers.find(x => x.id === (TL().vo || {}).cap); if (L) { const M = STYLES[v]; change(tl => { const o = tl.layers.find(x => x.id === L.id); o.cap = Object.assign({}, o.cap, { mode: v, per: M[1], hl: M[5] }); o.size = M[0]; o.slot = M[2]; o.wt = M[3]; if (v === 'box' || v === 'line') delete o.case; else o.case = 'upper'; if (v === 'line') { o.cap.bg = 'bar'; o.cap.bgc = 'ink'; } else delete o.cap.bg; }); } }));
    const r1 = el('div', 'vo-row'); const b1 = el('button', 'btn sm primary', vo.nw ? 'Time the captions again' : 'Time the captions to the voice'); b1.type = 'button'; b1.onclick = async () => { b1.disabled = true; b1.textContent = 'Listening…'; await timeCaptions(); api.renderPanel(); }; r1.appendChild(b1);
    if (vo.cap && t.layers.some(x => x.id === vo.cap)) { const b = el('button', 'btn sm', 'Style the captions'); b.type = 'button'; b.onclick = () => { api.select(vo.cap); }; r1.appendChild(b); }
    box.appendChild(r1);
    if (vo.nw) {
      const sw = String(vo.script || '').trim().split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
      if (sw !== vo.nw) box.appendChild(el('p', 'vo-warn', 'The script changed since the captions were timed. Time them again.'));
      box.appendChild(rangeRow('Shift the captions', -0.5, 0.5, 0.01, +vo.shift || 0, v => { change(tl => { const d = v - (+tl.vo.shift || 0); tl.vo.shift = Math.round(v * 100) / 100; const L = tl.layers.find(x => x.id === tl.vo.cap); if (L && L.cap && Array.isArray(L.cap.times)) L.cap = Object.assign({}, L.cap, { times: L.cap.times.map(x => [Math.round((x[0] + d) * 1000) / 1000, Math.round((x[1] + d) * 1000) / 1000]) }); }, { key: 'voshift' }); }, v => (Math.abs(v) < 0.005 ? 'as timed' : (v > 0 ? 'later ' : 'earlier ') + Math.abs(v).toFixed(2) + ' s')));
      h.sec('Scenes'); h.note('Re-times the clips on the main track so the picture changes in the pauses between sentences, and the video ends with the voice.');
      const r2 = el('div', 'vo-row'); const b2 = el('button', 'btn sm', 'Cut scenes to the voice'); b2.type = 'button'; b2.onclick = cutToVoice; r2.appendChild(b2); box.appendChild(r2);
    }
    h.sec('Recording'); const r3w = el('div', 'vo-row'); const b3 = el('button', 'btn sm', 'Replace'); b3.type = 'button'; b3.onclick = () => inp.click(); r3w.appendChild(b3); const b4 = el('button', 'btn sm danger', 'Remove the voiceover'); b4.type = 'button'; b4.onclick = removeVoice; r3w.appendChild(b4); box.appendChild(r3w);
  };
  NX.voice = { voiced, tokens, align, alignScript, addVoice, timeCaptions, cutToVoice, ST };
})();