'use strict';
/* NexGen Studio V19 (Nov 11): live soundtracks. Older templates ship a soundtrack file rendered ahead of time (audio/<id>.mp4).
   A template marked liveAudio has none: its music and effects are mixed here, in the browser, from the cues the engine
   reports (DIR.cues(): a music bed by name and timed effects from the studio's own sound library, audio/sfx.mp4), so the
   sound always matches the picture, even when a typed line changes the timing. The same mix plays in the preview, inside a
   template block in the timeline editor, and is encoded to AAC for the MP4 export. */
window.NX = window.NX || {};
(() => {
  const A = NX.app; if (!A) return; const S = A.S;
  const LEAD = { whoosh: 1, air: 1, riser: 1, swell: 1, paper: 1, swish: 1, burn: 1, ink: 1, reverse: 1 };
  const BEDS = ['lounge', 'night', 'pulse', 'sketch', 'cinematic', 'day', 'chip'];
  const ST = { key: '', url: '', tpl: '', ver: 0, bufs: new Map(), meta: null, cache: new Map() };
  const is = id => { const t = A.TPL(id); return !!(t && t.liveAudio); };
  const load = url => { if (ST.bufs.has(url)) return ST.bufs.get(url); const p = fetch(url).then(r => { if (!r.ok) throw new Error(url + ' ' + r.status); return r.arrayBuffer(); }).then(ab => new OfflineAudioContext(2, 1, 48000).decodeAudioData(ab)); ST.bufs.set(url, p); p.catch(() => ST.bufs.delete(url)); return p; };
  const metaP = () => ST.meta || (ST.meta = fetch('audio/sfx.json').then(r => r.json()).catch(() => ({})));
  const chipP = () => ST.chip || (ST.chip = fetch('audio/sfx_chip.json').then(r => r.json()).catch(() => ({})));   // V26: 8-bit effects for the Pixel family, cue names 'c_<name>'
  async function render(cues) {
    const dur = Math.max(0.5, +cues.dur || 1), sr = 48000, oc = new OfflineAudioContext(2, Math.ceil(dur * sr), sr), master = oc.createGain(), lim = oc.createDynamicsCompressor();
    lim.threshold.value = -4; lim.knee.value = 3; lim.ratio.value = 16; lim.attack.value = 0.003; lim.release.value = 0.2; master.gain.value = 0.92; master.connect(lim); lim.connect(oc.destination);
    for (const b of cues.beds || []) { const o = b[4] || {}, style = BEDS.includes(o.style) ? o.style : 'pulse', t0 = Math.max(0, +b[1] || 0), t1 = Math.min(dur, +b[2] || dur), v = (b[3] === undefined ? 0.9 : +b[3]) * 0.8;
      try { const buf = await load('audio/bed_' + style + '.mp4'), src = oc.createBufferSource(), g = oc.createGain(); src.buffer = buf; src.loop = true; src.connect(g); g.connect(master);
        const fo = Math.max(t0 + 0.1, Math.min(t1, (o.end === undefined ? t1 : +o.end)) - 1.2); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + 0.05); g.gain.setValueAtTime(v, fo); g.gain.linearRampToValueAtTime(0, Math.min(dur, fo + 1.8)); src.start(t0); } catch (e) { console.warn(e); } }
    const ev = []; for (const e of cues.events || []) { const o = e[4] || {}; if (e[0] === 'ticks') { const n = o.n || 8, d = o.dur || 0.6; for (let k = 0; k < n; k++) ev.push(['tick', e[1] + d * k / n, e[2], e[3]]); } else ev.push(e); }
    if (ev.length) { try { const meta = await metaP(), buf = ev.some(e => !/^c_/.test(e[0])) ? await load('audio/sfx.mp4') : null, chip = ev.some(e => /^c_/.test(e[0])) ? [await chipP(), await load('audio/sfx_chip.mp4')] : null;
      for (const [name, at, vol, pan] of ev) { const isC = chip && /^c_/.test(name), m = isC ? chip[0][name.slice(2)] : meta[name]; if (!m) continue; const st = at - (LEAD[name] ? m.peak : 0), src = oc.createBufferSource(), g = oc.createGain(); src.buffer = isC ? chip[1] : buf; g.gain.value = vol === undefined ? 0.6 : vol;
        if (pan && oc.createStereoPanner) { const p = oc.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); src.connect(g); g.connect(p); p.connect(master); } else { src.connect(g); g.connect(master); }
        if (st >= dur) continue; if (st >= 0) src.start(st, m.at, m.len); else if (m.len + st > 0) src.start(0, m.at - st, m.len + st); } } catch (e) { console.warn(e); } }
    return oc.startRendering();
  }
  function cached(cues) { const k = JSON.stringify(cues); if (!ST.cache.has(k)) { if (ST.cache.size > 8) ST.cache.delete(ST.cache.keys().next().value); const p = render(cues); ST.cache.set(k, p); p.catch(() => ST.cache.delete(k)); } return ST.cache.get(k); }
  function wavOf(buf) {
    const ch = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate, out = new DataView(new ArrayBuffer(44 + n * ch * 2)); let o = 0;
    const w = s => { for (let i = 0; i < s.length; i++) out.setUint8(o++, s.charCodeAt(i)); }, u32 = v => { out.setUint32(o, v, true); o += 4; }, u16 = v => { out.setUint16(o, v, true); o += 2; };
    w('RIFF'); u32(36 + n * ch * 2); w('WAVE'); w('fmt '); u32(16); u16(1); u16(ch); u32(sr); u32(sr * ch * 2); u16(ch * 2); u16(16); w('data'); u32(n * ch * 2);
    const data = []; for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c));
    for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, data[c][i])); out.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7FFF, true); o += 2; }
    return new Blob([out.buffer], { type: 'audio/wav' });
  }
  const cuesNow = () => { try { const c = typeof DIR.cues === 'function' ? DIR.cues() : DIR.cues; return c && c.dur ? c : null; } catch (e) { console.warn(e); return null; } };
  // the open clip: mix when its cues change, then hand the preview its soundtrack
  function sync() {
    const p = S.proj; if (!p || !is(p.tpl) || !S.tpl || S.tpl.id !== p.tpl) return; const cues = cuesNow(); if (!cues) return;
    const key = p.tpl + '|' + JSON.stringify(cues); if (key === ST.key) return; ST.key = key; const v = ++ST.ver;
    cached(cues).then(buf => { if (v !== ST.ver) return; const old = ST.url; ST.url = URL.createObjectURL(wavOf(buf)); ST.tpl = p.tpl;
      if (S.proj && S.proj.tpl === p.tpl) { const playing = S.playing, keepT = S.t; if (playing) A.pause(); A.setTemplateAudio(); if (playing) { A.setT(keepT, false); A.play(); } }
      if (old) setTimeout(() => URL.revokeObjectURL(old), 3000); }).catch(e => console.warn('soundtrack', e));
  }
  A.onOpen.push(sync); A.onRebuild.push(sync);
  // ------------------------------------------------------------------ sound packs (V20)
  // The older templates' soundtracks used to be one file each (audio/<name>.mp4, 223 files). They now sit end to end in
  // PACK.n pack files (audio/pack_NN.mp4) and PACK.files[name] = [pack, offset, length] says where each one is. A soundtrack
  // is fetched as a byte range; where the host ignores ranges the whole pack arrives once and is kept for the session.
  // Identical soundtracks (variants of one template) share one entry. To add one: append its bytes to a pack and its entry here.
  const PACK = {"n":11,"files":{"aerial":[0,0,401705],"afterhours":[0,401705,352402],"agent":[0,754107,298033],"arrivals":[0,1052140,511770],"ba":[0,1563910,300437],"banner":[0,1864347,335743],"barber":[0,2200090,267481],"bax":[0,2467571,232971],"bax_a":[0,2467571,232971],"bax_b":[0,2467571,232971],"bbchairx":[0,2700542,224441],"bbpolex":[0,2924983,233233],"beadx":[0,3158216,220675],"blueprint":[0,3378891,293985],"blueprintx":[0,3672876,227870],"bo_contact":[0,3900746,320755],"bo_frame":[0,4221501,347609],"bo_headline":[0,4569110,322556],"bo_message":[0,4891666,322344],"bo_offer":[0,5214010,340187],"bo_side":[0,5554197,321491],"bo_special":[0,5875688,316847],"brunch":[1,0,404286],"burger":[1,404286,419934],"cardsx":[1,824220,224181],"cardsx_p":[1,824220,224181],"catering":[1,1048401,389733],"chalkx":[1,1438134,233647],"chalkx_b":[1,1438134,233647],"chat":[1,1671781,511225],"checkx":[1,2183006,226337],"checkx_a":[1,2183006,226337],"cheese":[1,2409343,367451],"chef":[1,2776794,361663],"cinema":[1,3138457,297338],"clientstory":[1,3435795,355290],"combox":[1,3791085,228944],"comingsoon":[1,4020029,379796],"commercial":[1,4399825,455181],"crew":[1,4855006,365104],"dayinlife":[1,5220110,475267],"deliverx":[1,5695377,226729],"development":[2,0,426033],"dish":[2,426033,260851],"drive":[2,686884,404211],"episode":[2,1091095,340217],"event":[2,1431312,292815],"expand":[2,1724127,395296],"expert":[2,2119423,306097],"filterx":[2,2425520,222001],"fire":[2,2647521,299552],"flashsale":[2,2947073,342566],"flyerx":[2,3289639,235062],"fresh":[2,3524701,357256],"gallery":[2,3881957,748453],"garage":[2,4630410,387606],"glossx":[2,5018016,223640],"glowup":[2,5241656,392592],"heatx":[2,5634248,234195],"herox":[2,5868443,230281],"herox_a":[3,0,231829],"herox_b":[3,231829,231829],"herox_h":[3,463658,231647],"herox_r":[3,695305,231003],"hood":[3,926308,348840],"icons":[3,1275148,331337],"jlisted":[3,1606485,317388],"journal":[3,1923873,424491],"kinetic":[3,2348364,325848],"latenight":[3,2674212,454892],"lease":[3,3129104,375158],"listed":[3,3504262,379835],"loop":[3,3884097,360230],"lower3":[3,4244327,306452],"luxury":[3,4550779,379608],"menu":[3,4930387,317320],"menuedit":[3,5247707,351576],"mockx":[3,5599283,227345],"mockx_p":[3,5599283,227345],"myth":[3,5826628,369548],"neonx":[4,0,228587],"neonx_f":[4,0,228587],"neonx_h":[4,0,228587],"nightx":[4,228587,229957],"notes":[4,458544,422879],"numbers":[4,881423,346202],"oneword":[4,1227625,492712],"openhouse":[4,1720337,322971],"papelx":[4,2043308,223664],"papelx_e":[4,2043308,223664],"party":[4,2266972,440352],"pdrop":[4,2707324,285202],"pick":[4,2992526,447369],"pizzax":[4,3439895,229913],"plansx":[4,3669808,229729],"plansx_a":[4,3669808,229729],"plansx_b":[4,3669808,229729],"plansx_p":[4,3669808,229729],"postcard":[4,3899537,302240],"pour":[4,4201777,381828],"pov":[4,4583605,388353],"pressx":[4,4971958,225917],"pricedrop":[4,5197875,299139],"process":[4,5497014,393650],"questions":[5,0,759526],"rate":[5,759526,456894],"recipex":[5,1216420,230362],"redoorx":[5,1446782,228654],"relistx":[5,1675436,233139],"reply":[5,1908575,321608],"residence":[5,2230183,422032],"resignx":[5,2652215,229780],"reveal":[5,2881995,232235],"review":[5,3114230,366725],"rush":[5,3480955,327495],"salon":[5,3808450,309913],"service":[5,4118363,403152],"shapes":[5,4521515,301059],"shine":[5,4822574,402363],"sig":[5,5224937,342028],"signs":[6,0,800779],"sold":[6,800779,286008],"special":[6,1086787,302204],"specialx":[6,1388991,229527],"split":[6,1618518,329450],"spot":[6,1947968,379199],"spotlight":[6,2327167,431430],"stainx":[6,2758597,232923],"sting":[6,2991520,121964],"stories":[6,3113484,386111],"street":[6,3499595,322251],"sushi":[6,3821846,364915],"swatch":[6,4186761,435489],"team":[6,4622250,804903],"textfill":[6,5427153,309534],"thermox":[6,5736687,223531],"thisor":[7,0,490101],"ticker":[7,490101,299687],"ticket":[7,789788,323929],"timeline":[7,1113717,406519],"tips":[7,1520236,409948],"top3":[7,1930184,423139],"tour":[7,2353323,352483],"trailer":[7,2705806,751977],"upgrade":[7,3457783,453858],"vanx":[7,3911641,221172],"vanx_a":[7,3911641,221172],"venue":[7,4132813,386123],"vreveal":[7,4518936,285610],"wall":[7,4804546,457282],"wordswap":[7,5261828,315593],"hol_count_blackfriday":[7,5577421,282767],"hol_greet_blackfriday":[7,5860188,269036],"hol_hours_blackfriday":[8,0,224438],"hol_special_blackfriday":[8,224438,337551],"hol_count_christmas":[8,561989,261509],"hol_greet_christmas":[8,823498,254027],"hol_hours_christmas":[8,1077525,207396],"hol_special_christmas":[8,1284921,315922],"hol_count_cinco":[8,1600843,269091],"hol_greet_cinco":[8,1869934,257140],"hol_hours_cinco":[8,2127074,216237],"hol_special_cinco":[8,2343311,325254],"hol_count_easter":[8,2668565,266078],"hol_greet_easter":[8,2934643,253785],"hol_hours_easter":[8,3188428,208815],"hol_special_easter":[8,3397243,316418],"hol_count_fathers":[8,3713661,264639],"hol_greet_fathers":[8,3978300,253488],"hol_hours_fathers":[8,4231788,209514],"hol_special_fathers":[8,4441302,317162],"hol_count_halloween":[8,4758464,264028],"hol_greet_halloween":[8,5022492,252366],"hol_hours_halloween":[8,5274858,207688],"hol_special_halloween":[8,5482546,318827],"hol_count_hanukkah":[8,5801373,261841],"hol_greet_hanukkah":[9,0,250353],"hol_hours_hanukkah":[9,250353,208017],"hol_special_hanukkah":[9,458370,312086],"hol_count_holidays":[9,770456,264843],"hol_greet_holidays":[9,1035299,251912],"hol_hours_holidays":[9,1287211,208665],"hol_special_holidays":[9,1495876,317328],"hol_count_july4":[9,1813204,264308],"hol_greet_july4":[9,2077512,251316],"hol_hours_july4":[9,2328828,209232],"hol_special_july4":[9,2538060,317623],"hol_count_labor":[9,2855683,264042],"hol_greet_labor":[9,3119725,251867],"hol_hours_labor":[9,3371592,210921],"hol_special_labor":[9,3582513,316202],"hol_count_memorial":[9,3898715,256275],"hol_greet_memorial":[9,4154990,244456],"hol_hours_memorial":[9,4399446,205082],"hol_special_memorial":[9,4604528,306950],"hol_count_mothers":[9,4911478,260490],"hol_greet_mothers":[9,5171968,247049],"hol_hours_mothers":[9,5419017,204731],"hol_special_mothers":[9,5623748,309039],"hol_count_muertos":[9,5932787,257369],"hol_greet_muertos":[10,0,244879],"hol_hours_muertos":[10,244879,204133],"hol_special_muertos":[10,449012,307576],"hol_count_newyear":[10,756588,268830],"hol_greet_newyear":[10,1025418,257644],"hol_hours_newyear":[10,1283062,216952],"hol_special_newyear":[10,1500014,324847],"hol_count_stpat":[10,1824861,268267],"hol_greet_stpat":[10,2093128,257655],"hol_hours_stpat":[10,2350783,216253],"hol_special_stpat":[10,2567036,325470],"hol_count_thanksgiving":[10,2892506,262954],"hol_greet_thanksgiving":[10,3155460,254469],"hol_hours_thanksgiving":[10,3409929,209527],"hol_special_thanksgiving":[10,3619456,317656],"hol_count_valentines":[10,3937112,257718],"hol_greet_valentines":[10,4194830,246910],"hol_hours_valentines":[10,4441740,204661],"hol_special_valentines":[9,5623748,309039],"hol_count_veterans":[10,4646401,255997],"hol_greet_veterans":[10,4902398,245802],"hol_hours_veterans":[10,5148200,204885],"hol_special_veterans":[10,5353085,306790]}};
  const PK = { whole: new Map(), blobs: new Map(), urls: new Map() };
  const packUrl = i => 'audio/pack_' + String(i + 1).padStart(2, '0') + '.mp4';
  function packBlob(name) {
    const e = PACK.files[name]; if (!e) return fetch('audio/' + name + '.mp4').then(r => { if (!r.ok) throw new Error('soundtrack ' + name + ' ' + r.status); return r.blob(); });
    if (PK.blobs.has(name)) return PK.blobs.get(name);
    const cut = ab => new Blob([ab.slice(e[1], e[1] + e[2])], { type: 'video/mp4' });
    const p = (PK.whole.has(e[0]) ? PK.whole.get(e[0]).then(cut) : fetch(packUrl(e[0]), { headers: { Range: 'bytes=' + e[1] + '-' + (e[1] + e[2] - 1) } }).then(async r => {
      if (r.status === 206) { const ab = await r.arrayBuffer(); if (ab.byteLength === e[2]) return new Blob([ab], { type: 'video/mp4' }); }
      if (!r.ok) throw new Error('sound pack ' + (e[0] + 1) + ' ' + r.status);
      const w = r.status === 206 ? fetch(packUrl(e[0])).then(x => x.arrayBuffer()) : r.arrayBuffer(); PK.whole.set(e[0], w); w.catch(() => PK.whole.delete(e[0])); return w.then(cut); }));
    PK.blobs.set(name, p); p.catch(() => PK.blobs.delete(name)); return p;
  }
  const packUrlOf = name => { if (!PK.urls.has(name)) { const p = packBlob(name).then(b => URL.createObjectURL(b)); PK.urls.set(name, p); p.then(u => { p.url = u; }, () => PK.urls.delete(name)); } return PK.urls.get(name); };
  const nameOf = src => { const m = /^audio\/(.+)\.mp4$/.exec(src || ''); return m && PACK.files[m[1]] ? m[1] : ''; };
  const srcA = A.HOOK.audioSrc;
  // the preview's soundtrack: the packed one as a blob URL once it has arrived (the preview is told when it does)
  const srcP = p => { const s = srcA(p), n = nameOf(s); if (!n) return s; const pr = packUrlOf(n); if (pr.url) return pr.url;
    pr.then(() => { if (S.proj === p || (S.proj && S.proj.id === p.id)) { const playing = S.playing, keepT = S.t; if (playing) A.pause(); A.setTemplateAudio(); if (playing) { A.setT(keepT, false); A.play(); } } }).catch(e => console.warn(e)); return null; };
  NX.apack = { has: n => !!PACK.files[n], blob: packBlob, url: name => (PACK.files[name] ? packUrlOf(name) : Promise.resolve('audio/' + name + '.mp4')),
    // for the export: the open clip's soundtrack URL, waiting for a packed one to arrive
    ready: async p => { const n = nameOf(srcA(p)); if (n) await packUrlOf(n); return A.HOOK.audioSrc(p); } };
  const src0 = srcP; A.HOOK.audioSrc = p => (is(p.tpl) ? (ST.tpl === p.tpl && ST.url ? ST.url : null) : src0(p));
  // export: the same mix, encoded to AAC
  const x0 = A.XHOOK.audio;
  A.XHOOK.audio = p => (is(p.tpl) ? async (MB, output, dur) => {
    const cues = cuesNow(), buf = await cached(cues || { dur, beds: [], events: [] });
    let ok = false; try { ok = await MB.canEncodeAudio('aac', { numberOfChannels: 2, sampleRate: 48000, bitrate: 160000 }); } catch (e) {}
    if (!ok) { try { const m = await import(new URL('vendor/aac-encoder.mjs', document.baseURI).href); m.registerAacEncoder(); } catch (e) { throw new Error('This browser can’t encode AAC audio. Export works in Chrome or Edge on a Mac or Windows computer.'); } }
    const src = new MB.AudioBufferSource({ codec: 'aac', bitrate: 160000 }); output.addAudioTrack(src);
    const sr = buf.sampleRate, ch = buf.numberOfChannels; let fed = 0;
    const feed = async upTo => { const end = Math.min(buf.length, Math.round(Math.min(upTo, dur) * sr)); while (fed < end) { const n = Math.min(end - fed, sr), piece = new AudioBuffer({ length: n, numberOfChannels: ch, sampleRate: sr }); for (let c = 0; c < ch; c++) piece.copyToChannel(buf.getChannelData(c).subarray(fed, fed + n), c); await src.add(piece); fed += n; } };
    return { feed, finish: async () => { await feed(dur + 1); src.close(); } };
  } : (x0 ? x0(p) : null));
  NX.liveAudio = { is, render, forBlock: m => cached(typeof m.dir.cues === 'function' ? m.dir.cues() : m.dir.cues) };
})();
