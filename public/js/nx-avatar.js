'use strict';
/* NexGen Studio V22 (Nov 12): avatars and presenters in the timeline editor. Engine side: engine/kit14.js, tpl_free.js.
   An avatar clip (Google Flow, HeyGen, a phone recording of the owner: any talking-head video) can now be:
   - cut out of a green or blue screen and stood in front of photos and footage, with an outline and a shadow;
   - shown in a round bubble, a rounded card or full frame, reframed (zoom, up / down) so the face sits right;
   - heard: its own voice plays, the music drops under it, and its words can be captioned word by word (paste the script).
   The Avatar tab builds a whole video from one avatar clip and the brand's photos and clips, three ways:
     Hook, then show     the avatar opens full screen with a big hook line, then shrinks to a bubble over the b-roll
     Presenter           the avatar, cut out, stands in front of the b-roll the whole time
     Hook, then voice    the avatar opens full screen, then the picture goes to the b-roll while the voice carries on
   Everything it builds is an ordinary edit: every clip, line and layer can be changed afterwards.
   Background removal needs the avatar on a plain green or blue background (ask for one when generating it): the studio
   keys that colour out. Videos with a transparent background lose their transparency on upload, so use a screen colour. */
(() => {
  const X = NX.editor; if (!X || !X.XT || !X.api || !NX.app || typeof K14 === 'undefined') return;
  const A = NX.app, el = A.el, api = X.api, XT = X.XT, ED = X.ED, S = A.S;
  const { TL, F, change, upd, rangeRow, segRow, selRow, grp, acts, r3 } = api;
  const css = document.createElement('style'); css.textContent = `
.av-pick { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0 0 12px; }
.av-pick button { position: relative; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; padding: 0; background: #000; aspect-ratio: 9 / 14; }
.av-pick button img { width: 100%; height: 100%; object-fit: cover; display: block; }
.av-pick button small { position: absolute; left: 0; right: 0; bottom: 0; padding: 12px 6px 5px; font: 600 10.5px/1.2 var(--f-ui); color: #fff; background: linear-gradient(transparent, rgba(0,0,0,.75)); text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.av-pick button[aria-pressed="true"] { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }
.av-rec { display: grid; gap: 8px; margin: 0 0 12px; }
.av-rec button { display: grid; grid-template-columns: 54px 1fr; gap: 12px; align-items: center; text-align: left; border: 1px solid var(--line); background: var(--raise); border-radius: 12px; padding: 10px 12px; color: var(--fg); }
.av-rec button[aria-pressed="true"] { border-color: var(--accent); background: var(--accent-soft); }
.av-rec b { display: block; font-size: 13px; } .av-rec span { display: block; font-size: 12px; color: var(--mute); line-height: 1.35; margin-top: 2px; }
.av-rec svg { width: 54px; height: 84px; display: block; }
.av-ta { width: 100%; resize: vertical; background: var(--well); border: 1px solid var(--line2); border-radius: 9px; padding: 9px 11px; color: var(--fg); font: 500 13px/1.5 var(--f-ui); margin: 0 0 8px; }
.av-ta:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.av-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 0 0 12px; }
`; document.head.appendChild(css);
  const AV = { clip: '', recipe: 'hook', hook: '', script: '', arm: false, busy: false };
  const metaOf = c => NX.META[c], clipOf = c => NX.CLIPS.get(c);
  const videos = () => NX.brandClips().filter(r => !r.still && r.src !== 'lib').sort((a, b) => (b.kind === 'vert') - (a.kind === 'vert') || (b.audio ? 1 : 0) - (a.audio ? 1 : 0));
  const others = c => { const av = AVSET(); return NX.brandClips().filter(r => r.id !== c && !av.has(r.id)); };
  // clips used as an avatar before, per brand (so they are not also used as b-roll)
  const AVSET = () => { try { return new Set(JSON.parse(localStorage.getItem('nx.avatars.' + A.B().id) || '[]')); } catch (e) { return new Set(); } };
  const remember = c => { try { const s = AVSET(); s.add(c); localStorage.setItem('nx.avatars.' + A.B().id, JSON.stringify([...s].slice(-20))); } catch (e) {} };
  const uid = () => api.uid();

  // ------------------------------------------------------------------ building blocks
  const CAMS = ['push', 'right', 'depth', 'pull', 'left', 'depth'];
  function broll(M, total, seg) {
    const out = []; let left = total, i = 0, guard = 0; seg = seg || 2.6;
    while (left > 0.05 && guard++ < 200) { const r = M[i % M.length]; let d = r.still ? seg : Math.min(seg + 0.8, Math.max(0.6, r.dur - 0.1)); if (left - d < 0.9) d = r.still ? left : Math.min(left, Math.max(0.6, r.dur - 0.1)); d = Math.min(d, left); if (d < 0.05) break;
      const it = { id: uid(), type: 'clip', c: r.id, in: 0, d: r3(d), layout: A.B().builtin ? 'fit' : r.kind === 'vert' ? 'fill' : 'blur', pos: 'center', sound: false, tr: out.length ? { type: 'dissolve', d: 0.3 } : null };
      if (r.still && !A.B().builtin) it.cam = { type: CAMS[i % CAMS.length], amt: 0.45 };
      out.push(it); left -= d; i++; }
    return out;
  }
  function hookLayers(text, t0, d, y) {
    const ls = String(text || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 2), out = [], fitS = (s, max) => Math.round(Math.min(max, 920 / (Math.max(4, s.length) * 0.74)));   // one line each: sized to the width
    const s1 = ls[0] ? fitS(ls[0], 124) : 0, s2 = ls[1] ? fitS(ls[1], 104) : 0;
    if (ls[0]) out.push({ id: uid(), kind: 'text', style: 'type', name: 'Hook', text: ls[0], x: 540, y, w: 1000, slot: 'Mont', wt: 900, size: s1, case: 'upper', color: 'white', fx: { shadow: 'soft' }, anim: { in: 'springpop', out: 'fade' }, t0: r3(t0), d: r3(d) });
    if (ls[1]) out.push({ id: uid(), kind: 'text', style: 'type', name: 'Hook, line 2', text: ls[1], x: 540, y: Math.round(y + s1 * 0.62 + s2 * 0.78 + 26), w: 1000, slot: 'Mont', wt: 900, size: s2, case: 'upper', color: 'ink', fx: { deco: 'box', dcol: 'accent' }, anim: { in: 'springrise', out: 'fade' }, t0: r3(t0 + 0.35), d: r3(Math.max(0.6, d - 0.35)) });
    return out;
  }
  const endCard = () => ({ id: uid(), type: 'end', style: 'kinetic', d: 4, tr: { type: 'dissolve', d: 0.5 } });
  const RECIPES = {
    hook: { name: 'Hook, then show', desc: 'The avatar opens full screen with your hook line, then shrinks to a bubble while your photos and clips play.',
      icon: '<rect x="2" y="2" width="50" height="80" rx="6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="9" y="12" width="36" height="8" rx="2" fill="currentColor"/><circle cx="16" cy="66" r="9" fill="currentColor"/>' },
    presenter: { name: 'Presenter', desc: 'The avatar, cut out of its green or blue screen, stands in front of your photos and clips the whole time.',
      icon: '<rect x="2" y="2" width="50" height="80" rx="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="27" cy="44" r="8" fill="currentColor"/><path d="M11 82c0-14 7-22 16-22s16 8 16 22z" fill="currentColor"/>' },
    voice: { name: 'Hook, then voice', desc: 'The avatar opens full screen, then the picture goes to your photos and clips while the voice carries on.',
      icon: '<rect x="2" y="2" width="50" height="80" rx="6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="9" y="12" width="36" height="8" rx="2" fill="currentColor"/><path d="M12 62v8M19 56v20M26 60v12M33 54v24M40 62v8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' },
  };
  function plan(recipe, c, hook) {
    const m = metaOf(c), r = clipOf(c), D = r3(Math.min(90, m.n / 30 - 0.1)), M = others(c), hookLen = r3(Math.min(3.4, Math.max(1.6, D * 0.35))), main = [], layers = [];
    const ava = (o) => Object.assign({ id: uid(), kind: 'pip', c, sound: true, frame: 'circle', x: 250, y: 1290, w: 330, zoom: 1.25, fy: 0.3 }, o);
    if (recipe === 'presenter' && M.length) {
      main.push(...broll(M, D)); const w = 700, h = w * m.h / m.w;
      layers.push(ava({ name: 'Avatar', frame: 'none', key: { on: true, col: 'auto', tol: 0.5, soft: 0.4 }, w, x: 540, y: Math.round(1920 - h / 2), in: 0, t0: 0, d: D, shadow: true, outline: 0 }));
      layers.push(...hookLayers(hook, 0.2, Math.min(3.2, D - 0.4), 360));
    } else if (!M.length) {   // nothing to cut to: the avatar carries the whole video
      main.push({ id: uid(), type: 'clip', c, in: 0, d: D, layout: 'fill', pos: 'center' }); layers.push(...hookLayers(hook, 0.2, Math.min(3.2, D - 0.4), 1090));
    } else {
      main.push({ id: uid(), type: 'clip', c, in: 0, d: hookLen, layout: 'fill', pos: 'center' }); main.push(...broll(M, r3(D - hookLen)));
      layers.push(...hookLayers(hook, 0.2, hookLen - 0.35, 1090));
      layers.push(ava(recipe === 'voice' ? { name: 'Avatar voice', hide: true, in: hookLen, t0: hookLen, d: r3(D - hookLen) } : { name: 'Avatar', in: hookLen, t0: hookLen, d: r3(D - hookLen), frame: 'circle' }));
    }
    main.push(endCard()); return { main, layers, D, noBroll: !M.length };
  }
  // word-by-word captions from a clip's own voice: clip audio from `inn` for `d` seconds, shown from t0
  async function captionsFrom(c, inn, d, t0, script, linkTo) {
    if (!NX.voice) return 0; script = String(script || '').trim(); if (!script) return 0;
    const buf = await api.clipBuf(c); if (!buf) { A.toast('This clip has no sound to time the captions to.'); return 0; }
    const sr = buf.sampleRate, a = Math.floor(inn * sr), n = Math.min(buf.length - a, Math.floor(d * sr)); if (n < sr * 0.3) return 0;
    const x = new Float32Array(n), ch0 = buf.getChannelData(0), ch1 = buf.numberOfChannels > 1 ? buf.getChannelData(1) : null; for (let i = 0; i < n; i++) x[i] = ch1 ? (ch0[a + i] + ch1[a + i]) / 2 : ch0[a + i];
    const r = NX.voice.alignScript(x, sr, script); if (!r.times) { A.toast('No speech was found in this clip.'); return 0; }
    change(t => { const old = linkTo && t.layers.find(L => L.id === linkTo.capId); if (old) t.layers = t.layers.filter(L => L !== old);
      const L = { id: uid(), kind: 'text', style: 'type', name: 'Avatar captions', x: 540, y: ((linkTo && linkTo.key && linkTo.key.on) || (!linkTo && AV.recipe === 'presenter')) ? 1430 : 1180, slot: 'Mont', wt: 900, size: 78, w: 900, color: 'white', case: 'upper', text: r.words.join(' '), t0: r3(t0), d: r3(d), cap: { mode: 'karaoke', per: 3, hl: 'accent', start: 0, times: r.times } };
      t.layers.push(L); if (linkTo) { const o = t.layers.find(z => z.id === linkTo.id); if (o) { o.capId = L.id; o.script = script; } } });
    return r.words.length;
  }
  async function build() {
    const c = AV.clip, m = metaOf(c); if (!m || AV.busy) return; const t0 = TL(), used = t0.main.some(x => x.type === 'clip' || x.type === 'tpl') || t0.layers.length;
    if (used && !AV.arm) { AV.arm = true; api.renderPanel(); return; } AV.arm = false; AV.busy = true; remember(c);
    const hook = AV.hook.trim() || 'WAIT.\nWATCH THIS', P = plan(AV.recipe, c, hook);
    change(t => { t.main = P.main; t.layers = P.layers; t.sfx = []; t.music = Object.assign({}, t.music, { vol: Math.min(t.music.vol === undefined ? 0.7 : t.music.vol, 0.45) }); if (!A.B().builtin && !t.grade) t.mblur = t.mblur || 0.5; delete t.vo; });
    let words = 0; if (AV.script.trim()) { try { words = await captionsFrom(c, 0, P.D, 0, AV.script, null); } catch (e) { console.warn(e); } }
    AV.busy = false; A.setT(0, false); api.renderPanel(); api.renderTimeline(); api.renderInspector();
    const found = AV.recipe === 'presenter' && !P.noBroll;
    setTimeout(() => { try { A.setT(0); } catch (e) { } }, 300);   // refresh the clock: the length just changed
    A.toast((P.noBroll ? 'Built with the avatar on screen throughout: this brand has no other photos or clips to cut to yet.' : 'Built: ' + RECIPES[AV.recipe].name.toLowerCase() + ', ' + Math.round(P.D) + ' s plus the ending.') + (words ? ' ' + words + ' words captioned.' : '') + (found ? ' If the background still shows, select the avatar and adjust the cut-out.' : ''), 7000);
  }

  // ------------------------------------------------------------------ the Avatar tab
  XT.tabs.push(['avatar', 'Avatar', 'media']);
  XT.panels.avatar = (box, h) => {
    const vids = videos(); h.sec('Your avatar clip'); h.note('A talking-head video: an avatar from Google Flow, or a recording of you. Pick it, pick a format, and the studio builds the video around it with this brand’s photos and clips.');
    const head = el('div', 'av-row'); const add = el('button', 'btn sm', '+ Add a clip'); add.type = 'button'; add.onclick = A.pickFiles; head.appendChild(add); box.appendChild(head);
    if (!vids.length) { h.note('No video clips for this brand yet. Add your avatar clip (MP4 or MOV) to begin.'); return; }
    if (!vids.some(r => r.id === AV.clip)) { const prev = AVSET(); AV.clip = (vids.find(r => prev.has(r.id)) || vids[0]).id; }
    const g = el('div', 'av-pick'); for (const r of vids.slice(0, 12)) { const b = el('button'); b.type = 'button'; b.title = r.name; b.setAttribute('aria-pressed', String(r.id === AV.clip)); const im = el('img'); im.alt = ''; if (r.poster) im.src = r.poster; b.appendChild(im); b.appendChild(el('small', '', r.dur.toFixed(0) + ' s' + (r.audio ? '' : ' · silent'))); b.onclick = () => { AV.clip = r.id; AV.arm = false; api.renderPanel(); }; g.appendChild(b); } box.appendChild(g);
    const cur = clipOf(AV.clip); if (cur && !cur.audio) h.note('This clip has no sound, so the video will have no voice.');
    h.sec('Format'); const rc = el('div', 'av-rec'); for (const [k, R] of Object.entries(RECIPES)) { const b = el('button'); b.type = 'button'; b.setAttribute('aria-pressed', String(AV.recipe === k)); b.innerHTML = '<svg viewBox="0 0 54 84" aria-hidden="true">' + R.icon + '</svg>'; const d = el('div'); d.appendChild(el('b', '', R.name)); d.appendChild(el('span', '', R.desc)); b.appendChild(d); b.onclick = () => { AV.recipe = k; AV.arm = false; api.renderPanel(); }; rc.appendChild(b); } box.appendChild(rc);
    if (AV.recipe === 'presenter') h.note('Needs the avatar on a plain green or blue background. Ask for one when you generate it; the studio removes that colour.');
    const nB = others(AV.clip).length; if (!nB) h.note('This brand has no other photos or clips yet, so the avatar will stay on screen. Add some for b-roll.');
    h.sec('Hook line'); h.note('The big words over the first seconds. One or two short lines.');
    const ta = el('textarea', 'av-ta'); ta.id = 'avHook'; ta.rows = 2; ta.maxLength = 60; ta.placeholder = 'WAIT.\nWATCH THIS'; ta.value = AV.hook; ta.setAttribute('aria-label', 'Hook line'); ta.oninput = () => { AV.hook = ta.value; }; box.appendChild(ta);
    h.sec('Captions (optional)'); h.note('Paste what the avatar says, punctuation included, and every word is captioned in time with the voice.');
    const sc = el('textarea', 'av-ta'); sc.id = 'avScript'; sc.rows = 4; sc.placeholder = 'Paste the avatar’s script here…'; sc.value = AV.script; sc.setAttribute('aria-label', 'Avatar script'); sc.oninput = () => { AV.script = sc.value; }; box.appendChild(sc);
    const row = el('div', 'av-row'); const go = el('button', 'btn primary', AV.arm ? 'Replace this edit with it' : 'Build the video'); go.type = 'button'; go.disabled = AV.busy; go.onclick = build; row.appendChild(go); box.appendChild(row);
    if (AV.arm) h.note('This replaces what is on the timeline now. Undo brings it back.');
  };

  // ------------------------------------------------------------------ the layer inspector: presenter controls on picture-in-picture
  const li0 = XT.inspect.layer;
  XT.inspect.layer = (box, o, legacy) => {
    if (!o || o.kind !== 'pip') return li0 ? li0(box, o, legacy) : false;
    if (!(li0 && li0(box, o, legacy))) legacy(box, o);
    try { presenter(box, o); } catch (e) { console.warn('avatar', e); } return true;
  };
  function presenter(box, o) {
    const r = clipOf(o.c), m = metaOf(o.c); if (!m) return; const cut = !!(o.key && o.key.on), h = (o.w || 600) * m.h / m.w;
    const g = grp(box, 'Presenter');
    g.appendChild(segRow('Background', [['keep', 'Keep it'], ['cut', 'Cut it out']], cut ? 'cut' : 'keep', v => { upd(o.id, x => { if (v === 'cut') { x.key = Object.assign({ col: 'auto', tol: 0.5, soft: 0.4 }, x.key || {}, { on: true }); x.frame = 'none'; } else if (x.key) x.key.on = false; }); api.renderInspector(); }));
    if (cut) {
      g.appendChild(segRow('Screen colour', [['auto', 'Auto'], ['green', 'Green'], ['blue', 'Blue']], o.key.col || 'auto', v => upd(o.id, x => { x.key.col = v; })));
      g.appendChild(rangeRow('Remove', 0, 1, 0.05, o.key.tol === undefined ? 0.5 : o.key.tol, v => upd(o.id, x => { x.key.tol = Math.round(v * 100) / 100; }, 'ktol'), v => (v < 0.34 ? 'less' : v < 0.67 ? 'normal' : 'more')));
      g.appendChild(rangeRow('Edge softness', 0, 1, 0.05, o.key.soft === undefined ? 0.4 : o.key.soft, v => upd(o.id, x => { x.key.soft = Math.round(v * 100) / 100; }, 'ksoft'), v => Math.round(v * 100) + '%'));
      g.appendChild(segRow('Outline', [['0', 'None'], ['white', 'White'], ['accent', 'Brand colour']], !(+o.outline > 0) ? '0' : o.outlineCol === 'accent' ? 'accent' : 'white', v => upd(o.id, x => { if (v === '0') { x.outline = 0; } else { x.outline = x.outline > 0 ? x.outline : 10; x.outlineCol = v; } })));
      g.appendChild(segRow('Shadow', [['on', 'On'], ['off', 'Off']], o.shadow === false ? 'off' : 'on', v => upd(o.id, x => { x.shadow = v === 'on'; })));
      if (K14.found(o.c, o.key.col || 'auto') === false) g.appendChild(el('p', 'warn', 'No green or blue screen was found around the edges of this clip, so little will be removed. Generate the avatar on a plain green background.'));
      else g.appendChild(el('p', 'hint', 'Works on a plain green or blue background. If a rim of colour stays, raise Remove.'));
    } else {
      g.appendChild(rangeRow('Zoom in', 1, 2.5, 0.05, o.zoom || 1, v => upd(o.id, x => { x.zoom = Math.round(v * 100) / 100; }, 'zoom'), v => v.toFixed(2) + '×'));
      g.appendChild(rangeRow('Up / down', 0, 1, 0.02, o.fy === undefined ? 0.5 : o.fy, v => upd(o.id, x => { x.fy = Math.round(v * 100) / 100; }, 'fy'), v => (v < 0.4 ? 'higher' : v > 0.6 ? 'lower' : 'middle')));
    }
    const place = (x, y, w) => () => { upd(o.id, z => { z.x = x; z.y = y; if (w) z.w = w; }); api.renderInspector(); };
    acts(g, cut ? [['Stand left', place(300, Math.round(1920 - 620 * m.h / m.w / 2), 620)], ['Stand centre', place(540, Math.round(1920 - 700 * m.h / m.w / 2), 700)], ['Stand right', place(780, Math.round(1920 - 620 * m.h / m.w / 2), 620)]]
      : [['Bottom left', place(250, 1290)], ['Bottom right', place(830, 1290)], ['Top left', place(250, 420)]]);
    const g2 = grp(box, 'Voice');
    if (!(r && r.audio)) g2.appendChild(el('p', 'note', 'This clip has no sound.'));
    else {
      g2.appendChild(segRow('Its sound', [['on', 'Play it'], ['off', 'Mute']], o.sound === true ? 'on' : 'off', v => { upd(o.id, x => { x.sound = v === 'on'; }); api.renderInspector(); }));
      if (o.sound === true) {
        g2.appendChild(rangeRow('Volume', 0, 1.5, 0.05, o.vol === undefined ? 1 : o.vol, v => upd(o.id, x => { x.vol = Math.round(v * 100) / 100; }, 'pvol'), v => Math.round(v * 100) + '%'));
        g2.appendChild(segRow('On screen', [['show', 'Show'], ['hide', 'Voice only']], o.hide ? 'hide' : 'show', v => upd(o.id, x => { if (v === 'hide') x.hide = true; else delete x.hide; })));
        const ta = el('textarea', 'av-ta'); ta.rows = 3; ta.placeholder = 'Paste what is said here for word-by-word captions…'; ta.value = o.script || ''; ta.setAttribute('aria-label', 'Script for captions'); g2.appendChild(ta);
        acts(g2, [[o.capId && TL().layers.some(L => L.id === o.capId) ? 'Time the captions again' : 'Caption this voice', async () => { const n = await captionsFrom(o.c, +o.in || 0, o.d, o.t0, ta.value, o); if (n) { A.toast(n + ' words captioned.'); api.renderTimeline(); api.renderInspector(); } else if (!ta.value.trim()) A.toast('Paste the script first: the words that are said.'); }]]);
      }
    }
  }

  // Home: an intent that opens a new edit on the Avatar tab
  (A.HOOK.intents = A.HOOK.intents || []).push(box => { const b = el('button', 'intent'); b.type = 'button'; const i = el('i'); i.innerHTML = '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.8-4 3.8-6 7.5-6s6.700 2 7.500 6"/></svg>'; b.appendChild(i); b.appendChild(document.createTextNode('Avatar video')); b.onclick = () => { X.blank(); ED.panel = 'avatar'; setTimeout(() => api.renderPanel(), 60); }; box.appendChild(b); });
  try { const ib = document.getElementById('intents'); if (ib && ib.children.length) A.HOOK.intents[A.HOOK.intents.length - 1](ib); } catch (e) {}
  NX.avatar = { AV, plan, build, captionsFrom, RECIPES };
})();
