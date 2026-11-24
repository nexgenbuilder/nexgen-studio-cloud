'use strict';
/* NexGen Studio V19 (Nov 11): the Polish tools in the timeline editor. Engine side: engine/kit13.js and tpl_free.js.
   - Clip inspector: Speed (0.25× to 4×, with ramps), Camera move (push, pull, pan, tilt, drift, punch, depth) and
     Colour grade, per clip. Nothing changes a clip until one of these is set.
   - Layer inspector (Animate tab): motion blur for one layer.
   - The "Polish" tab: motion blur and glow for the whole edit, one grade for every clip, camera moves on every clip,
     and Cut to the beat (clip lengths snapped to the music bed's beat grid; tempos measured from the bed files).
   DPG keeps its footage rule by default: whole, real speed, no zoom. The controls are there, with a reminder. */
(() => {
  const X = NX.editor; if (!X || !X.XT || !X.api || !NX.app || typeof K13 === 'undefined') return;
  const A = NX.app, el = A.el, api = X.api, XT = X.XT, ED = X.ED, S = A.S;
  const { TL, F, change, upd, rangeRow, segRow, selRow, grp, acts, r3 } = api;
  const css = document.createElement('style'); css.textContent = `
.pr-chips { display: flex; flex-wrap: wrap; gap: 6px; margin: -4px 0 12px; }
.pr-chips button { background: var(--well); border: 1px solid var(--line2); border-radius: 99px; padding: 5px 11px; font: 600 12px/1 var(--f-ui); color: var(--mute); }
.pr-chips button:hover { color: var(--fg); border-color: var(--dim); }
.pr-chips button[aria-pressed="true"] { color: var(--fg); border-color: var(--accent); background: var(--accent-soft); }
.pr-sw { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 6px; margin: 0 0 12px; }
.pr-sw button { border: 1px solid var(--line); border-radius: 8px; padding: 0; overflow: hidden; background: var(--raise); color: var(--fg); font: 600 10.5px/1.2 var(--f-ui); text-align: center; min-width: 0; }
.pr-sw button i { display: block; height: 30px; background: linear-gradient(120deg, #3b6ea5 0%, #d9a05b 45%, #e9e2d0 70%, #4b7d4f 100%); }
.pr-sw button span { display: block; padding: 5px 2px 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pr-sw button[aria-pressed="true"] { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
.pr-card { border: 1px solid var(--line); background: var(--raise); border-radius: 10px; padding: 12px; margin: 0 0 12px; }
.pr-card .fld:last-of-type { margin-bottom: 10px; }
.pr-row { display: flex; gap: 8px; flex-wrap: wrap; }
.pr-meta { font: 500 11.5px/1.4 var(--f-mono); color: var(--dim); margin: 8px 0 0; }
`; document.head.appendChild(css);
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const metaOf = c => NX.META[c];
  const isStill = c => !!(metaOf(c) && metaOf(c).still);
  const builtOf = id => (F() ? F().M.find(m => m.id === id) : null);
  const dpgNote = box => { if (A.B().builtin) box.appendChild(el('p', 'hint', 'DPG footage normally plays whole, at real speed, with no zoom. Leave these off to keep that rule.')); };
  // CSS preview of a grade on a swatch (the same filter the engine uses; the tints as a gradient over it)
  function gradeSwatch(id, name, cur, on) {
    const G = K13.GRADES[id], b = el('button'); b.type = 'button'; b.title = G.desc || name; b.setAttribute('aria-pressed', String(cur === id));
    const i = el('i'); if (G.f) i.style.filter = G.f(0.9); b.appendChild(i); b.appendChild(el('span', '', name)); b.onclick = on; return b;
  }
  function gradeUI(box, cur, set, key) {
    const sw = el('div', 'pr-sw'); for (const [id, G] of Object.entries(K13.GRADES)) sw.appendChild(gradeSwatch(id, G.name, (cur && cur.id) || 'none', () => set(id === 'none' ? null : { id, amt: cur && cur.amt !== undefined ? cur.amt : 0.7 })));
    box.appendChild(sw);
    if (cur && cur.id && cur.id !== 'none') box.appendChild(rangeRow('Strength', 0.1, 1, 0.05, cur.amt === undefined ? 0.7 : cur.amt, v => set({ id: cur.id, amt: Math.round(v * 100) / 100 }, key), v => Math.round(v * 100) + '%'));
  }

  // ------------------------------------------------------------------ the clip inspector
  const mc0 = XT.mainClip;
  XT.mainClip = (box, o, r) => { if (mc0) mc0(box, o, r); try { clipPolish(box, o); } catch (e) { console.warn('polish', e); } };
  function clipPolish(box, o) {
    const m = metaOf(o.c); if (!m) return; const still = !!m.still, b = builtOf(o.id), avail = m.n / 30 - (o.in || 0);
    const fit = x => { x.d = r3(Math.max(0.3, Math.min(x.d, K13.maxLen(x, avail)))); };
    if (!still) {
      const g = grp(box, 'Speed'); dpgNote(g);
      const sp = K13.spOf(o);
      g.appendChild(rangeRow('Speed', 0.25, 4, 0.05, sp, v => upd(o.id, x => { if (Math.abs(v - 1) < 0.026) delete x.sp; else x.sp = Math.round(v * 100) / 100; fit(x); }, 'sp'), v => v.toFixed(2).replace(/0$/, '') + '×'));
      const ch = el('div', 'pr-chips'); for (const v of [0.5, 1, 1.5, 2, 3]) { const bt = el('button', '', v + '×'); bt.type = 'button'; bt.setAttribute('aria-pressed', String(Math.abs(sp - v) < 0.01)); bt.onclick = () => { upd(o.id, x => { if (v === 1) delete x.sp; else x.sp = v; fit(x); }); api.renderInspector(); }; ch.appendChild(bt); }
      g.appendChild(ch);
      g.appendChild(selRow('Speed ramp', Object.entries(K13.RAMPS).map(([k, R]) => [k, R.name + (R.desc ? ' · ' + R.desc : '')]), K13.rampOf(o), v => { upd(o.id, x => { if (v === 'none') delete x.ramp; else x.ramp = v; fit(x); }); api.renderInspector(); }));
      if (K13.timed(o)) g.appendChild(el('p', 'pr-meta', (b ? b.d : o.d).toFixed(1) + ' s on the timeline plays ' + K13.srcLen(Object.assign({}, o, { d: b ? b.d : o.d })).toFixed(1) + ' s of the clip' + (sp < 0.95 || K13.rampOf(o) === 'hero' || K13.rampOf(o) === 'land' ? ' · slow parts are frame-blended' : '')));
    }
    const g2 = grp(box, 'Camera move'); if (still) g2.appendChild(el('p', 'hint', 'A still photo comes alive with a slow move.')); else dpgNote(g2);
    const cams = Object.entries(K13.CAMS).filter(([k]) => k !== 'depth' || still).map(([k, C]) => [k, C.name + (C.desc ? ' · ' + C.desc : '')]);
    const cur = o.cam && K13.CAMS[o.cam.type] ? o.cam.type : 'none';
    g2.appendChild(selRow('Move', cams, cur, v => { upd(o.id, x => { if (v === 'none') delete x.cam; else x.cam = { type: v, amt: x.cam && x.cam.amt !== undefined ? x.cam.amt : 0.5 }; }); api.renderInspector(); }));
    if (cur !== 'none') g2.appendChild(rangeRow('How much', 0.05, 1, 0.05, o.cam.amt === undefined ? 0.5 : o.cam.amt, v => upd(o.id, x => { x.cam = { type: cur, amt: Math.round(v * 100) / 100 }; }, 'cam'), v => (v < 0.34 ? 'subtle' : v < 0.67 ? 'medium' : 'strong')));
    const g3 = grp(box, 'Colour grade'); const tg = TL().grade;
    if (tg && tg.id && !(o.grade && o.grade.id)) g3.appendChild(el('p', 'hint', 'Using the edit’s grade (' + K13.GRADES[tg.id].name + '). Pick one here to give this clip its own.'));
    gradeUI(g3, o.grade, (v, key) => { upd(o.id, x => { if (v) x.grade = v; else delete x.grade; }, key ? 'gr' : undefined); if (!key) api.renderInspector(); }, 'gr');
    if (o.grade && o.grade.id) acts(g3, [['Use on every clip', () => { change(t => { t.grade = Object.assign({}, o.grade); t.main.forEach(x => { if (x.type === 'clip') delete x.grade; }); }); A.toast('Every clip now uses ' + K13.GRADES[o.grade.id].name + '.'); api.renderInspector(); }]]);
  }

  // ------------------------------------------------------------------ the layer inspector: motion blur
  const li0 = XT.inspect.layer;
  XT.inspect.layer = (box, o, legacy) => {
    const r = li0 ? li0(box, o, legacy) : false;
    if (o && o.kind !== 'seg' && ED.itab === 'anim') { try {
      const g = grp(box, 'Motion blur'), cur = o.mblur === undefined || o.mblur === null ? 'auto' : o.mblur > 0 ? 'on' : 'off', all = +(TL().mblur || 0);
      g.appendChild(segRow('This layer', [['auto', 'Same as the edit (' + (all > 0 ? 'on' : 'off') + ')'], ['on', 'On'], ['off', 'Off']], cur, v => { upd(o.id, x => { if (v === 'auto') delete x.mblur; else x.mblur = v === 'on' ? 0.6 : 0; }); api.renderInspector(); }));
      if (cur === 'on') g.appendChild(rangeRow('Shutter', 0.2, 1, 0.05, o.mblur, v => upd(o.id, x => { x.mblur = Math.round(v * 100) / 100; }, 'mb'), v => Math.round(v * 360) + '°'));
      g.appendChild(el('p', 'hint', 'Blurs the layer along its path while it moves, like a real camera. It is sharp again the moment it stops.'));
    } catch (e) { console.warn('mblur', e); } }
    return r;
  };

  // ------------------------------------------------------------------ whole-edit actions
  const clips = t => t.main.filter(x => x.type === 'clip' && metaOf(x.c));
  function autoCamera(amt) {
    const V = ['push', 'pull'], P = ['push', 'right', 'depth', 'pull', 'left', 'depth']; let i = 0, j = 0;
    change(t => clips(t).forEach(x => { x.cam = isStill(x.c) ? { type: P[j++ % P.length], amt } : { type: V[i++ % V.length], amt: Math.min(amt, 0.4) }; }));
    A.toast('Added a camera move to every clip and photo. Change any of them in the clip’s panel.'); api.renderInspector();
  }
  function clearCamera() { change(t => t.main.forEach(x => { delete x.cam; })); api.renderInspector(); }
  // per: beats per clip, or 0 to keep each clip's length and move its cut to the nearest beat
  function beatCut(per, punch) {
    const t0 = TL(), B = K13.BEATS[t0.music && t0.music.bed]; if (!B) { A.toast('Pick a music bed first (Audio tab). The cuts follow its beat.'); return; }
    const bt = 60 / B[0], f = F(); let moved = 0;
    change(t => { let s = 0;
      t.main.forEach(it => {
        const built = f && f.M.find(m => m.id === it.id), d0 = built ? built.d : +it.d || 2;
        if (it.type !== 'clip' || !metaOf(it.c)) { s += d0; return; }
        const m = metaOf(it.c), maxD = K13.maxLen(it, m.n / 30 - (+it.in || 0));
        let end = Math.round((s + (per ? per * bt : Math.max(bt, d0))) / bt) * bt;
        while (end - s > maxD + 1e-6 && end - s > bt + 1e-6) end -= bt;
        if (end - s < 0.3 || end - s > maxD + 1e-6) end = s + Math.min(maxD, d0);
        const d = r3(end - s); if (Math.abs(d - d0) > 0.004) moved++;
        it.d = d; if (punch && !(it.cam && it.cam.type && it.cam.type !== 'punch')) it.cam = { type: 'punch', amt: 0.35 };
        s += d;
      });
    });
    A.toast(moved ? moved + ' cut' + (moved > 1 ? 's' : '') + ' moved onto the beat (' + B[0] + ' beats a minute).' : 'Every cut is already on the beat.'); api.renderInspector();
  }

  // ------------------------------------------------------------------ the Polish tab
  const PST = { per: 4, punch: false, camAmt: 0.4 };
  XT.tabs.push(['polish', 'Polish', 'trans']);
  XT.panels.polish = (box, h) => {
    const t = TL(); if (!t) return; const nClips = clips(t).length;
    h.sec('Motion blur'); h.note('Text, graphics and stickers blur along their path while they move, the way a real camera sees them. Sharp when still.');
    const mb = +(t.mblur || 0);
    box.appendChild(segRow('Whole edit', [['0', 'Off'], ['0.35', 'Light'], ['0.5', 'Natural'], ['0.9', 'Heavy']], mb <= 0 ? '0' : mb < 0.45 ? '0.35' : mb < 0.7 ? '0.5' : '0.9', v => change(tl => { if (+v) tl.mblur = +v; else delete tl.mblur; })));
    h.sec('Glow'); h.note('A soft bloom on the bright parts of the picture.');
    box.appendChild(rangeRow('Glow', 0, 1, 0.05, +(t.glow || 0), v => change(tl => { if (v > 0.01) tl.glow = Math.round(v * 100) / 100; else delete tl.glow; }, { key: 'glow' }), v => (v < 0.02 ? 'off' : Math.round(v * 100) + '%')));
    h.sec('Colour grade'); h.note('One look across every clip and photo. A clip with its own grade keeps it.');
    gradeUI(box, t.grade, (v, key) => { change(tl => { if (v) tl.grade = v; else delete tl.grade; }, key ? { key: 'tgr' } : undefined); if (!key) api.renderPanel(); }, 'tgr');
    h.sec('Camera moves'); h.note('Slow pushes, pans and depth moves so nothing sits still. Photos get the most.');
    if (A.B().builtin) h.note('DPG footage normally plays whole with no zoom. Use these only when that is what you want.');
    box.appendChild(rangeRow('How much', 0.1, 1, 0.05, PST.camAmt, v => { PST.camAmt = v; }, v => (v < 0.34 ? 'subtle' : v < 0.67 ? 'medium' : 'strong')));
    const r1 = el('div', 'pr-row'); const b1 = el('button', 'btn sm', 'Add to every clip'); b1.type = 'button'; b1.disabled = !nClips; b1.onclick = () => autoCamera(PST.camAmt); r1.appendChild(b1);
    const b2 = el('button', 'btn sm ghost', 'Remove all'); b2.type = 'button'; b2.disabled = !t.main.some(x => x.cam); b2.onclick = clearCamera; r1.appendChild(b2); box.appendChild(r1);
    h.sec('Cut to the beat');
    const B = K13.BEATS[t.music && t.music.bed], bed = (api.BEDS.find(x => x[0] === (t.music && t.music.bed)) || [])[1];
    if (!B) { h.note('Pick a music bed and the cuts can land on its beat.'); const r = el('div', 'pr-row'), b = el('button', 'btn sm', 'Choose music'); b.type = 'button'; b.onclick = () => { ED.panel = 'audio'; api.renderPanel(); }; r.appendChild(b); box.appendChild(r); return; }
    h.note(bed + ' runs at ' + B[0] + ' beats a minute, so one beat is ' + (60 / B[0]).toFixed(2) + ' s. Clip lengths change; nothing else moves.');
    box.appendChild(segRow('Each clip lasts', [['0', 'Keep mine, snap'], ['2', '2 beats'], ['4', '4 beats'], ['8', '8 beats']], String(PST.per), v => { PST.per = +v; }));
    const ck = el('label', 'chk'), ci = el('input'); ci.type = 'checkbox'; ci.checked = PST.punch; ci.onchange = () => { PST.punch = ci.checked; }; ck.appendChild(ci); ck.appendChild(document.createTextNode('Punch in on every cut')); box.appendChild(ck);
    const r2 = el('div', 'pr-row'); r2.style.marginTop = '10px'; const b3 = el('button', 'btn sm primary', 'Cut to the beat'); b3.type = 'button'; b3.disabled = !nClips; b3.onclick = () => beatCut(PST.per, PST.punch); r2.appendChild(b3); box.appendChild(r2);
    if (!nClips) h.note('Add footage or photos to the main track first.');
  };
  NX.pro = { beatCut, autoCamera, clearCamera };
})();
