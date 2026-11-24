'use strict';
/* NexGen Studio: listings (Oct 29). A real-estate brand keeps listings: the property profile (facts from K7.PROFILE) and
   the listing's photos in order. Every real-estate template reads the listing a clip belongs to, so one set of details and
   photos feeds the whole campaign. Facts are typed by the user; nothing is filled in for them. An empty optional fact stays
   off the video; an empty required one is flagged here, on the canvas and in the export check.
   Stored in db as listings/<id> = {id, brand, facts, photos, createdAt, updatedAt, by}. */
(() => {
  const A = NX.app; if (!A) return;
  const { S, CAP, el, $, toast } = A;
  const LS = { list: [], saveT: {}, local: !CAP.db };
  NX.listings = LS;
  const uid = () => 'l' + Math.random().toString(36).slice(2, 10);
  const mineList = () => LS.list.filter(l => l.brand === S.brand.id).sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
  const byId = id => LS.list.find(l => l.id === id) || null;
  const cur = () => (S.proj && S.proj.listing ? byId(S.proj.listing) : null);
  const label = l => (l && l.facts && (l.facts.addr || l.facts.area)) || 'Untitled listing';
  const brandPhoto = id => { const r = NX.CLIPS.get(id); return r && r.brand === S.brand.id ? r : null; };

  // ---------------------------------------------------------------- data
  function subscribe() {
    if (!CAP.db) return;
    CAP.db.collection('listings').onSnapshot(snap => {
      const docs = snap.docs.map(d => d.data()).filter(l => l && l.id && l.brand);
      // keep local edits that have not been written yet
      LS.list = docs.map(d => { const loc = LS.list.find(x => x.id === d.id); return loc && LS.saveT[d.id] ? loc : d; }).concat(LS.list.filter(x => !docs.some(d => d.id === x.id) && LS.saveT[x.id]));
      if (S.tpl && S.tpl.sector === 'estate') { A.refresh(true); if (S.step === 'prop') paint(); }
    }, e => console.warn('listings', e));
  }
  function save(l, now) {
    l.updatedAt = new Date().toISOString(); if (!CAP.db) return;
    clearTimeout(LS.saveT[l.id]); LS.saveT[l.id] = setTimeout(async () => {
      try { await CAP.db.doc('listings/' + l.id).set({ id: l.id, brand: l.brand, facts: l.facts || {}, photos: l.photos || [], createdAt: l.createdAt, updatedAt: l.updatedAt, by: CAP.uid || null }); }
      catch (e) { toast('Couldn’t save the listing (' + (e.code || e.message) + ').'); }
      delete LS.saveT[l.id];
    }, now ? 0 : 600);
  }
  function create(facts) {
    const l = { id: uid(), brand: S.brand.id, facts: Object.assign({}, facts || {}), photos: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    LS.list.push(l); save(l, true); return l;
  }
  function attach(l) { if (!S.proj) return; S.proj.listing = l.id; A.markDirty(); A.refresh(true); }

  // ---------------------------------------------------------------- engine hooks
  A.HOOK.prm = (tpl, proj) => {
    if (tpl.sector !== 'estate') return;
    let l = proj.listing ? byId(proj.listing) : null;
    if (!proj.id) { l = l || mineList()[0] || null; PRM.prop = l ? Object.assign({}, l.facts) : Object.assign({}, K7.DEMO); }   // gallery previews: the latest listing, else a sample
    else PRM.prop = l ? Object.assign({}, l.facts) : {};
    PRM.photos = l ? (l.photos || []).filter(brandPhoto) : [];
  };
  A.HOOK.propVal = k => { const l = cur(); return l && l.facts ? l.facts[k] : ''; };
  A.HOOK.listingFacts = () => { const l = (S.proj && S.proj.listing && byId(S.proj.listing)) || mineList()[0]; return l && l.facts ? Object.assign({}, l.facts) : null; };
  A.HOOK.previewNote = () => (mineList().length ? 'The preview shows your latest listing.' : 'The preview uses a sample listing. Your clip starts empty and uses only the details you add.');
  A.HOOK.moreChecks = () => {
    if (!A.usesListing()) return [];
    const miss = S.fields.filter(f => f.type === 'prop' && f.req && !String(A.HOOK.propVal(f.key) || '').trim());
    const l = cur(), out = [];
    out.push(miss.length ? { w: true, b: miss.length + ' listing detail' + (miss.length > 1 ? 's are' : ' is') + ' missing', s: miss.map(f => f.label).join(', ') + '. The video shows a “+ ADD” marker until you fill ' + (miss.length > 1 ? 'them' : 'it') + ' in.', fix: () => { $('#exModal').hidden = true; A.goStep('prop'); } }
      : { b: 'Listing', s: l ? label(l) + ' · only the details you entered are shown.' : 'No listing attached.' });
    return out;
  };
  // a new real-estate clip belongs to the brand's latest listing (if there is one)
  A.onOpen.push(p => { if (A.usesListing() && !p.listing && mineList().length) { p.listing = mineList()[0].id; A.refresh(true); } });

  // ---------------------------------------------------------------- the Listing pane
  let box = null;
  A.HOOK.listingPane = b => { box = b; paint(); };
  function paint() {
    if (!box || !S.proj || !A.usesListing()) return;
    const keepFocus = document.activeElement && box.contains(document.activeElement) ? document.activeElement.id : null;
    box.textContent = '';
    const l = cur(), list = mineList(), used = new Map(S.fields.filter(f => f.type === 'prop').map(f => [f.key, f]));
    // which listing
    const top = el('section', 'grp lst-top'), hd = el('header'); hd.appendChild(el('h3', '', 'Listing')); top.appendChild(hd);
    const row = el('div', 'lst-pick');
    const sel = el('select'); sel.id = 'lstSel'; sel.setAttribute('aria-label', 'Which listing');
    if (!l) { const o = el('option', '', list.length ? 'Choose a listing…' : 'No listing yet'); o.value = ''; sel.appendChild(o); }
    list.forEach(x => { const o = el('option', '', label(x)); o.value = x.id; sel.appendChild(o); }); sel.value = l ? l.id : '';
    sel.onchange = () => { const x = byId(sel.value); if (x) attach(x); paint(); };
    const nb = el('button', 'btn sm', '+ New listing'); nb.type = 'button'; nb.onclick = () => { attach(create()); paint(); setTimeout(() => { const i = $('#lp-addr'); if (i) i.focus(); }, 60); };
    row.appendChild(sel); row.appendChild(nb); top.appendChild(row);
    top.appendChild(el('p', 'hint', l ? 'Changes here update every clip made from this listing.' : 'Type the property’s details below; a listing is created as you go and every real estate template can use it.'));
    box.appendChild(top);
    // photos
    const ph = el('section', 'grp'), h2 = el('header'); h2.appendChild(el('h3', '', 'Photos' + (l && l.photos && l.photos.length ? ' · ' + l.photos.filter(brandPhoto).length : ''))); ph.appendChild(h2);
    ph.appendChild(el('p', 'hint', 'They fill the photo slots in this order: the first is the hero. Photos are always shown whole, never cropped.'));
    const g = el('div', 'lst-photos'); ph.appendChild(g);
    const photos = l ? (l.photos || []).filter(brandPhoto) : [];
    photos.forEach((id, i) => {
      const t = el('div', 'lp'), cv = el('canvas'); cv.width = 160; cv.height = 120; t.appendChild(cv); NX.FB.draw(id, 0, cv, 'h').catch(() => {});
      t.appendChild(el('span', 'n', String(i + 1)));
      const acts = el('div', 'acts'), mk = (txt, aria, fn, dis) => { const b = el('button', '', txt); b.type = 'button'; b.setAttribute('aria-label', aria); b.disabled = !!dis; b.onclick = fn; acts.appendChild(b); };
      mk('‹', 'Move earlier', () => { const a = l.photos.indexOf(id); if (a > 0) { [l.photos[a - 1], l.photos[a]] = [l.photos[a], l.photos[a - 1]]; save(l); A.refresh(true); paint(); } }, i === 0);
      mk('›', 'Move later', () => { const a = l.photos.indexOf(id); if (a < l.photos.length - 1) { [l.photos[a + 1], l.photos[a]] = [l.photos[a], l.photos[a + 1]]; save(l); A.refresh(true); paint(); } }, i === photos.length - 1);
      mk('×', 'Take it out of the listing', () => { l.photos = l.photos.filter(x => x !== id); save(l); A.refresh(true); paint(); });
      t.appendChild(acts); g.appendChild(t);
    });
    const add = el('button', 'lp add'); add.type = 'button'; add.appendChild(el('b', '', '+')); add.appendChild(el('span', '', 'Add photos'));
    add.onclick = () => { if (!CAP.assets || !CAP.db) { toast('Adding photos needs edit access to this studio.'); return; } $('#photoFile').click(); }; g.appendChild(add);
    const spare = NX.brandClips().filter(r => r.still && !photos.includes(r.id));
    if (spare.length) {
      const d = el('details', 'lst-spare'); d.appendChild(el('summary', '', 'Add from your photos (' + spare.length + ')')); const g2 = el('div', 'lst-photos'); d.appendChild(g2);
      spare.slice(0, 24).forEach(r => { const b = el('button', 'lp'); b.type = 'button'; b.setAttribute('aria-label', 'Add ' + r.name); const cv = el('canvas'); cv.width = 160; cv.height = 120; b.appendChild(cv); NX.FB.draw(r.id, 0, cv, 'h').catch(() => {}); b.onclick = () => { const L = cur() || (attach(create()), cur()); L.photos = (L.photos || []).concat(r.id); save(L); A.refresh(true); paint(); }; g2.appendChild(b); });
      ph.appendChild(d);
    }
    box.appendChild(ph);
    // the facts, grouped; what this template shows is marked, required ones flagged
    const groups = []; for (const f of K7.PROFILE) { let gr = groups.find(x => x.name === f.group); if (!gr) groups.push(gr = { name: f.group, fs: [] }); gr.fs.push(f); }
    const more = el('details', 'lst-more'); more.appendChild(el('summary', '', 'More details (not shown in this template)'));
    for (const gr of groups) {
      const sec = el('section', 'grp'), h = el('header'); h.appendChild(el('h3', '', gr.name)); sec.appendChild(h);
      let anyUsed = false;
      for (const f of gr.fs) {
        const u = used.get(f.k); if (u) anyUsed = true;
        const w = el('div', 'fld'), id = 'lp-' + f.k, lab = el('label'); lab.htmlFor = id; lab.appendChild(document.createTextNode(f.label));
        const val = l && l.facts ? (l.facts[f.k] || '') : '';
        if (u) lab.appendChild(el('span', 'cnt' + (u.req && !String(val).trim() ? ' need' : ''), u.req && !String(val).trim() ? 'Needed' : 'In this video'));
        w.appendChild(lab);
        let inp;
        if (f.options) { inp = el('select'); [['', 'Not set']].concat(f.options).forEach(([v, t]) => { const o = el('option', '', t); o.value = v; inp.appendChild(o); }); inp.value = val; }
        else if (f.multiline) { inp = el('textarea'); inp.rows = 4; inp.value = val; }
        else { inp = el('input'); inp.type = 'text'; inp.autocomplete = 'off'; inp.value = val; }
        inp.id = id; if (f.hint) inp.placeholder = f.hint;
        const onIn = () => {
          let L = cur(); if (!L) { L = create(); S.proj.listing = L.id; A.markDirty(); }
          L.facts = L.facts || {}; const v = inp.value; if (String(v).trim()) L.facts[f.k] = v; else delete L.facts[f.k];
          save(L); A.refresh(f.k === 'addr' || f.options ? true : false); A.paintTools();
          const c = lab.querySelector('.cnt'); if (c && u) { const need = u.req && !String(v).trim(); c.textContent = need ? 'Needed' : 'In this video'; c.classList.toggle('need', need); }
          if (f.k === 'addr') { const o = $('#lstSel'); if (o) { const op = [...o.options].find(x => x.value === L.id); if (op) op.textContent = label(L); else { paintSoon(); } } }
        };
        inp.addEventListener(f.options ? 'change' : 'input', onIn);
        w.appendChild(inp); sec.appendChild(w);
      }
      (anyUsed ? box : more).appendChild(sec);
    }
    if (more.children.length > 1) box.appendChild(more);
    // the whole campaign
    const camp = el('section', 'grp lst-camp'), h3 = el('header'); h3.appendChild(el('h3', '', 'The whole campaign')); camp.appendChild(h3);
    const n = A.TPLS.filter(t => t.sector === 'estate').length;
    camp.appendChild(el('p', 'hint', 'Make all ' + n + ' real estate clips for this listing at once: reveal, just listed, open house, price update, sold, neighbourhood, tour and agent. Each one is its own style; they all use these details and photos.'));
    const cb = el('button', 'btn dark', 'Make ' + n + ' clips for this listing'); cb.type = 'button'; cb.disabled = !l; cb.onclick = () => campaign(cur());
    camp.appendChild(cb); box.appendChild(camp);
    if (keepFocus) { const e = document.getElementById(keepFocus); if (e) { e.focus(); if (e.setSelectionRange && e.value) try { e.setSelectionRange(e.value.length, e.value.length); } catch (er) {} } }
  }
  let pT = 0; const paintSoon = () => { clearTimeout(pT); pT = setTimeout(paint, 400); };
  $('#photoFile').onchange = e => {
    const files = [...e.target.files]; e.target.value = ''; if (!files.length) return;
    let L = cur(); if (!L) { L = create(); attach(L); }
    files.forEach(f => { const job = A.queueFootage(f); if (job) job.done = id => { if (!id) return; const LL = byId(L.id); LL.photos = (LL.photos || []).concat(id); save(LL); A.refresh(true); paint(); }; });
    paint();
  };

  // ---------------------------------------------------------------- campaign: one clip per real-estate template
  async function campaign(l) {
    if (!l) return; const tpls = A.TPLS.filter(t => t.sector === 'estate'), made = [];
    for (const t of tpls) {
      if (S.tpl && S.tpl.id === t.id) { if (!S.proj.listing) S.proj.listing = l.id; A.markDirty(); continue; }
      if (S.projects.some(p => p.listing === l.id && p.tpl === t.id)) continue;
      const p = A.newProject(t); p.listing = l.id; p.name = label(l) + ' · ' + t.name; made.push(p);
    }
    if (!made.length) { toast('Every real estate clip for this listing is already in Projects.'); return; }
    if (CAP.db) {
      try { for (const p of made) { p.updatedAt = new Date().toISOString(); await CAP.db.doc('projects/' + p.id).set({ id: p.id, brand: p.brand, name: p.name, tpl: p.tpl, text: p.text, shot: p.shot, style: p.style, createdAt: p.createdAt, updatedAt: p.updatedAt, listing: p.listing, by: CAP.uid || null }); } }
      catch (e) { toast('Couldn’t save the campaign (' + (e.code || e.message) + ').'); return; }
    } else { S.projects = made.concat(S.projects); A.buildProjects(); }
    A.flush && A.flush();
    toast('Made ' + made.length + ' clips for ' + label(l) + '. They’re in Projects, each in its own style.', 6000);
    A.setView('projects');
  }
  NX.listingCampaign = campaign;
  subscribe();
})();
