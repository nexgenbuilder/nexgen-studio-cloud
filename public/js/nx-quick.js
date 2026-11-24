'use strict';
/* NexGen Studio V12: Quick Create and the creative director.
   Quick Create is the three-step way in for someone who has never edited a video:
     1 What are we making?  a sentence about what to promote, an optional goal and feel
     2 Your photos & clips  pick from the brand's media (or upload); nothing is ever cropped
     3 Pick a draft         three finished drafts in different formats; open one, export or "Edit more"
   The creative director makes the drafts. With Claude (the page's sample capability, on the viewer's own account) it reads
   the brief, the brand kit and its ad rules, the media and a shortlist of fitting templates, then picks three formats, writes
   every line inside its character limit, orders the shots and says what it still needs (a price, a date) instead of
   inventing it. Without Claude the same shortlist, shot ordering and the templates' own industry copy make the drafts.
   In review, plain requests ("punchier", "swap shots 1 and 2", "try a different style") change the open draft. */
(() => {
const A = NX.app, $ = A.$, el = A.el, S = A.S, CAP = A.CAP;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clampS = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); if (s.length <= n) return s; const cut = s.slice(0, n + 1), sp = cut.lastIndexOf(' '); return (sp > n * 0.6 ? cut.slice(0, sp) : s.slice(0, n)).replace(/[\s,;:–—-]+$/, ''); };

// ------------------------------------------------------------------------------------------------ styles
const CSS = `
.qc-box { margin: 4px 0 18px; border: 1px solid var(--accent-line); background: color-mix(in srgb, var(--surface) 88%, transparent); border-radius: 18px; padding: 14px; box-shadow: var(--sh-2); }
.qc-box .qc-in { display: flex; gap: 10px; align-items: stretch; }
.qc-box textarea { flex: 1; min-width: 0; resize: none; border: 0; background: transparent; font: 500 16px/1.45 var(--f-ui); color: var(--fg); padding: 6px 4px; min-height: 52px; outline: none; }
.qc-box textarea::placeholder { color: var(--dim); }
.qc-box .qc-go { align-self: flex-end; }
.qc-box .qc-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-top: 8px; padding-top: 10px; border-top: 1px solid var(--line); }
.qc-box .qc-row .lab { font-size: 12px; color: var(--dim); font-weight: 600; margin-right: 4px; }
.qc-chip { border: 1px solid var(--line-2); background: var(--surface); border-radius: 99px; padding: 5px 11px; font-size: 12.5px; font-weight: 600; color: var(--mute); }
.qc-chip:hover { color: var(--fg); border-color: var(--dim); }
.qc-chip[aria-pressed="true"] { background: var(--accent-soft); color: var(--accent); border-color: var(--accent-line); }
.qc-link { background: none; border: 0; padding: 4px 2px; color: var(--accent); font-weight: 600; font-size: 12.5px; margin-left: auto; }
.qc-or { margin: 0 0 10px; font-size: 12.5px; color: var(--dim); }
.sheet.qc { width: min(100%, 980px); height: min(100%, 860px); }
.qc-steps { display: flex; gap: 6px; padding: 12px 22px; border-bottom: 1px solid var(--line); background: var(--surface-2); flex-wrap: wrap; }
.qc-steps span { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 600; color: var(--dim); padding: 4px 10px 4px 4px; border-radius: 99px; }
.qc-steps span i { width: 22px; height: 22px; border-radius: 99px; display: grid; place-items: center; background: var(--sunk); font-style: normal; font-size: 12px; }
.qc-steps span.on { color: var(--fg); background: var(--surface); box-shadow: var(--sh-1); }
.qc-steps span.on i { background: var(--grad); color: #fff; }
.qc-steps span.done i { background: var(--ok-soft); color: var(--ok); }
.qc-body { flex: 1; min-height: 0; overflow-y: auto; padding: 20px 22px 24px; }
.qc-body h3 { margin: 0 0 4px; font-size: 22px; font-weight: 650; letter-spacing: -.01em; }
.qc-body .sub { margin: 0 0 16px; color: var(--mute); font-size: 13.5px; }
.qc-big { width: 100%; min-height: 96px; resize: vertical; border: 1px solid var(--line-2); border-radius: 14px; padding: 14px 16px; font: 500 17px/1.45 var(--f-ui); background: var(--surface); color: var(--fg); }
.qc-big:focus { outline: 2px solid var(--accent); outline-offset: 1px; border-color: transparent; }
.qc-lbl { display: block; margin: 18px 0 8px; font-size: 12.5px; font-weight: 650; color: var(--mute); }
.qc-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.qc-media { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 10px; }
.qc-m { position: relative; border: 2px solid transparent; border-radius: 12px; padding: 0; overflow: hidden; background: var(--sunk); aspect-ratio: 9 / 12; cursor: pointer; }
.qc-m img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; background: #0d0d10; }
.qc-m .k { position: absolute; left: 6px; bottom: 6px; font-size: 10.5px; font-weight: 700; background: rgba(0,0,0,.66); color: #fff; border-radius: 6px; padding: 2px 6px; }
.qc-m .ck { position: absolute; right: 6px; top: 6px; width: 24px; height: 24px; border-radius: 99px; border: 2px solid #fff; background: rgba(0,0,0,.35); display: grid; place-items: center; color: #fff; font-size: 13px; font-weight: 800; }
.qc-m[aria-pressed="true"] { border-color: var(--accent); }
.qc-m[aria-pressed="true"] .ck { background: var(--accent); border-color: var(--accent); }
.qc-m.add { display: grid; place-items: center; border: 2px dashed var(--line-2); background: var(--surface); color: var(--mute); font-weight: 600; font-size: 13px; text-align: center; padding: 10px; }
.qc-note { font-size: 12.5px; color: var(--mute); margin: 12px 0 0; }
.qc-drafts { display: grid; grid-template-columns: repeat(3, minmax(0, 250px)); justify-content: center; gap: 18px; }
.qc-d { display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--line); border-radius: 16px; padding: 10px; background: var(--surface); text-align: left; }
.qc-d .pv { position: relative; aspect-ratio: 9 / 16; border-radius: 10px; overflow: hidden; background: linear-gradient(160deg, var(--sunk), var(--line)); cursor: pointer; border: 0; padding: 0; width: 100%; }
.qc-d .pv:hover img { transform: scale(1.02); } .qc-d .pv img { transition: transform .2s; }
.qc-d .pv img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.qc-d .pv .wait { position: absolute; inset: 0; display: grid; place-items: center; color: var(--dim); font-size: 12px; }
.qc-d b { font-size: 15px; } .qc-d .why { font-size: 12.5px; color: var(--mute); min-height: 34px; }
.qc-d .btn { width: 100%; }
.qc-think { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px 10px; color: var(--mute); text-align: center; }
.qc-think i { width: 34px; height: 34px; border-radius: 99px; border: 3px solid var(--accent-soft); border-top-color: var(--accent); animation: qcspin .8s linear infinite; }
@keyframes qcspin { to { transform: rotate(360deg); } }
.qc-week { display: grid; gap: 10px; }
.qc-w { display: grid; grid-template-columns: 74px minmax(0, 1fr) auto; gap: 12px; align-items: center; border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px; background: var(--surface); }
.qc-w .day { font-weight: 700; font-size: 13px; color: var(--accent); }
.qc-w p { margin: 2px 0 0; font-size: 12.5px; color: var(--mute); }
/* review: the workspace in quick mode */
.qpanel { grid-area: insp; display: none; flex-direction: column; min-height: 0; background: var(--surface); border-right: 1px solid var(--line); }
body.quick .qpanel { display: flex; }
body.quick #insp, body.quick #tools, body.quick #rail, body.quick #toEditBtn { display: none !important; }
body.quick .work { grid-template-columns: 420px minmax(0, 1fr); grid-template-areas: "insp stage"; }
.qp-head { padding: 18px 20px 12px; border-bottom: 1px solid var(--line); }
.qp-head .step { font-size: 12px; font-weight: 600; color: var(--accent); }
.qp-head h2 { margin: 2px 0; font-size: 19px; font-weight: 650; }
.qp-head p { margin: 0; font-size: 13px; color: var(--mute); }
.qp-body { flex: 1; min-height: 0; overflow-y: auto; padding: 14px 20px 22px; }
.qp-sec { margin: 0 0 18px; } .qp-sec h4 { margin: 0 0 8px; font-size: 12.5px; font-weight: 650; color: var(--mute); text-transform: none; }
.qp-dr { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.qp-dr button { border: 2px solid transparent; border-radius: 10px; padding: 0; overflow: hidden; background: var(--sunk); aspect-ratio: 9 / 16; position: relative; }
.qp-dr button img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.qp-dr button span { position: absolute; left: 0; right: 0; bottom: 0; font-size: 11px; font-weight: 700; padding: 14px 6px 5px; color: #fff; background: linear-gradient(transparent, rgba(0,0,0,.75)); text-align: left; }
.qp-dr button[aria-current="true"] { border-color: var(--accent); }
.qp-f { display: grid; gap: 4px; margin-bottom: 10px; } .qp-f label { font-size: 12.5px; font-weight: 600; }
.qp-f input, .qp-f textarea { border: 1px solid var(--line-2); border-radius: 10px; padding: 9px 11px; background: var(--surface); font-size: 14px; }
.qp-f .q { font-size: 12px; color: var(--mute); }
.qp-ask { display: flex; gap: 8px; } .qp-ask textarea { flex: 1; min-width: 0; min-height: 44px; resize: vertical; border: 1px solid var(--line-2); border-radius: 10px; padding: 9px 11px; background: var(--surface); }
.qp-msg { font-size: 12.5px; color: var(--mute); margin: 8px 0 0; min-height: 1em; }
.qp-ok { display: flex; gap: 8px; align-items: flex-start; font-size: 13px; color: var(--ok); background: var(--ok-soft); border-radius: 10px; padding: 9px 11px; }
.qp-foot { display: flex; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--line); background: var(--surface); }
.qp-foot .btn.primary { flex: 1; }
@media (max-width: 1100px) {
  body.quick .qpanel { order: 3; border-right: 0; }
  .qp-foot { position: sticky; bottom: 0; z-index: 3; }
  body.quick.view-work { padding-bottom: 0; }
}
@media (max-width: 760px) {
  .qc-box .qc-in { flex-direction: column; } .qc-box .qc-go { align-self: stretch; }
  .qc-drafts { grid-template-columns: minmax(0, 1fr); justify-content: stretch; } .qc-d { display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 4px 12px; align-items: start; }
  .qc-d .pv { grid-row: span 3; } .qc-media { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .qc-w { grid-template-columns: minmax(0, 1fr); }
}`;
const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

// ------------------------------------------------------------------------------------------------ what each template is for
const SIG_GOALS = { wall: ['show', 'promo'], pick: ['eng'], dayinlife: ['show', 'trust'], oneword: ['show', 'promo'], pov: ['show', 'eng'], notes: ['trust', 'show'], numbers: ['trust'],
  spotlight: ['promo', 'show'], rate: ['eng'], reply: ['eng', 'trust'], episode: ['trust'], loop: ['show'] };
const BO_GOALS = { bo_frame: ['show', 'promo'], bo_headline: ['promo', 'launch'], bo_contact: ['promo'], bo_message: ['show', 'trust'], bo_side: ['show'], bo_special: ['menu', 'promo'], bo_offer: ['promo'] };
const FAM_GOALS = { Showcase: ['show'], Promo: ['promo'], Engagement: ['eng'], Social: ['eng', 'show'], Story: ['show', 'trust'], Trust: ['trust'], 'Banners & frames': ['promo', 'show'], 'Motion & reveals': ['show', 'promo'], Restaurant: ['menu', 'promo'] };
const OBJ_GOAL = { show: 'show', promo: 'promo', menu: 'menu', event: 'event', listing: 'listing', update: 'listing', sold: 'trust', local: 'show', lead: 'promo', brand: 'trust', launch: 'launch' };
const goalsOf = t => { const g = new Set(); if (t.hol) g.add('hol'); (SIG_GOALS[t.id] || BO_GOALS[t.id] || []).forEach(x => g.add(x)); (FAM_GOALS[t.fam] || []).forEach(x => g.add(x)); (t.obj || []).forEach(o => OBJ_GOAL[o] && g.add(OBJ_GOAL[o])); return g; };
const sectorOf = t => t.sector || (t.ind && t.ind.length ? NX.sectorOfInd(t.ind[0]) : null);
const VIBE_WORDS = { bold: /bold|loud|fast|energ|punch|hard|beat|slam|kinetic|urgent|stencil|neon|hot/i, premium: /luxur|elegant|serif|premium|editorial|gold|refined|minimal|quiet|cinematic|magazine|still/i,
  warm: /warm|soft|friendly|hand|sunrise|steam|cozy|botanical|romantic|personal/i, fun: /playful|fun|pop|confetti|bounce|sticker|party|game|vote|comment/i };
const SIG_VIBE = { wall: 'bold', oneword: 'bold', loop: 'bold', pick: 'fun', rate: 'fun', pov: 'fun', reply: 'warm', dayinlife: 'warm', notes: 'warm', episode: 'premium', numbers: 'bold', spotlight: 'premium' };
const sectorKey = () => NX.sectorOfInd(A.B().industry) || 'general';
const GOALS = () => {
  const s = sectorKey(), g = [['show', 'Show off our work'], ['promo', 'Promote a service'], ['trust', 'Build trust'], ['eng', 'Get comments'], ['hol', 'Holiday post']];
  if (s === 'food') g.splice(0, 2, ['menu', 'A dish or special'], ['show', 'Show off the food'], ['promo', 'Promote an offer']);
  if (s === 'estate') g.splice(0, 2, ['listing', 'A new listing'], ['event', 'An open house'], ['show', 'Show a property']);
  if (s === 'hosp') g.splice(2, 0, ['event', 'An event']);
  if (s === 'retail') g.splice(1, 0, ['launch', 'A new arrival']);
  return g;
};
const VIBES = [['bold', 'Bold & fast'], ['premium', 'Premium'], ['warm', 'Warm & friendly'], ['fun', 'Fun']];
const EXAMPLE = { food: 'e.g. Weekend brisket special, Friday to Sunday only', estate: 'e.g. Just listed: 4-bed home with a pool deck, open house Saturday', home: 'e.g. Show off the backyard we just finished',
  beauty: 'e.g. Fresh fades, walk-ins welcome all week', auto: 'e.g. Ceramic coating for SUVs, we come to you', hosp: 'e.g. Halloween party this Saturday, DJ all night', retail: 'e.g. New fall jackets just dropped',
  pro: 'e.g. 3 mistakes small businesses make at tax time', general: 'e.g. Tell people what’s new this week' };

// ------------------------------------------------------------------------------------------------ state
const Q = { step: 1, brief: '', goal: '', vibe: '', media: new Set(), mediaTouched: false, drafts: [], cands: [], plan: null, busy: false, ctl: null, idx: 0, ai: false, msg: '', week: null, used: new Set() };

// ------------------------------------------------------------------------------------------------ the director
const media = () => NX.brandClips().filter(r => Q.media.has(r.id));
function holFromBrief(s) { s = (s || '').toLowerCase(); if (!s) return null; for (const id of HOL.ORDER) { const th = HOL.THEMES[id]; const nm = th.name.toLowerCase(); if (s.includes(nm) || s.includes(id) || nm.split(/[’' ]/).filter(w => w.length > 4).some(w => s.includes(w))) return id; } return null; }
function excluded(t, b) {
  if (t.hidden || t.id === 'free') return true;
  const sc = sectorOf(t), mine = NX.sectorOfInd(b.industry);
  if (sc && sc !== mine) return true;
  if ((t.id === 'flashsale' || t.id === 'bo_offer') && !K9.allowed('discount')) return true;
  if (t.id === 'bo_special' && NX.sectorOfInd(b.industry) !== 'food') return true;
  if ((t.id === 'clientstory' || t.id === 'review') && !(b.reviews && b.reviews.length) && !b.builtin) return true;
  return false;
}
// a template's fields as the engine declares them (the template is built once, then the open clip is rebuilt)
function fieldsOf(t, b) {
  const proj = { text: {}, shot: {}, style: {}, hol: t.hol ? (holFromBrief(Q.brief) || NX.defaultHol()) : null };
  let out = null;
  try { const pack = A.buildWith(t, proj, b); out = { dur: DIR.dur, fields: FIELDS.slice().map(f => Object.assign({}, f, { eff: f.type !== 'shot' && pack[f.key] !== undefined ? pack[f.key] : f.def })) }; }
  catch (e) { console.warn('director: fields', t.id, e); }
  finally { if (S.tpl && S.proj) A.build(); }
  return out;
}
const tokens = s => (String(s || '').toLowerCase().match(/[a-z]{4,}/g) || []);
function score(t, info, b, M) {
  const g = goalsOf(t); let s = 0;
  const goal = Q.goal || (holFromBrief(Q.brief) ? 'hol' : '');
  if (goal) { if (g.has(goal)) s += 4; else if (goal === 'menu' && g.has('promo')) s += 2; else if (goal === 'launch' && g.has('promo')) s += 2; else if (goal === 'event' && g.has('promo')) s += 1.5; else if (goal === 'listing' && sectorOf(t) === 'estate') s += 2; else s -= 2; }
  else if (t.hol) s -= 6;
  if (t.hol && goal !== 'hol') s -= 6;
  if (sectorOf(t) && sectorOf(t) === NX.sectorOfInd(b.industry)) s += 2.5;
  if (t.sig) s += 1.6; if (t.bo) s += 1.2;
  if (t.bo && /phone|call|contact|website|book|visit|address|open|hours|order/i.test(Q.brief)) s += 2;
  if (Q.vibe) { const re = VIBE_WORDS[Q.vibe]; if ((t.vibe && re.test(t.vibe)) || re.test(t.blurb || '') || SIG_VIBE[t.id] === Q.vibe) s += 1.5; }
  const bt = new Set(tokens(Q.brief)); if (bt.size) { const hit = tokens(t.name + ' ' + (t.blurb || '') + ' ' + (t.vibe || '')).filter(w => bt.has(w)).length; s += Math.min(2, hit * 0.7); }
  if (/before|after|transform/i.test(Q.brief) && t.id === 'ba') s += 3;
  if (/(\d+)\s+(tips|ways|mistakes|things|reasons|steps)/i.test(Q.brief) && ['tips', 'top3', 'notes', 'signs'].includes(t.id)) s += 2.5;
  if (/review|testimonial|customer said/i.test(Q.brief) && ['review', 'clientstory', 'reply'].includes(t.id)) s += 2.5;
  if (info) {
    const shots = info.fields.filter(f => f.type === 'shot'), n = shots.length, have = M.length;
    if (have) { if (n === 0) s -= 1.5; else if (n > have * 2.5) s -= 1.5; else if (n <= have) s += 0.8;
      const nv = M.filter(r => r.kind === 'vert').length, nl = have - nv;
      const fit = shots.filter(f => (f.kind === 'vert' ? nv : f.kind === 'land' ? nl : have) > 0).length / Math.max(1, n); s += (fit - 0.7) * 3; }
    else if (n > 4) s -= 1;
    const reqN = info.fields.filter(f => f.type !== 'shot' && f.req).length; s -= Math.min(2, reqN * 0.35);
  }
  return s;
}
// the shortlist: every template that fits the brand, scored; the best few with their fields
function shortlist(b, n) {
  const M = media(), pre = A.TPLS.filter(t => !excluded(t, b)).map(t => ({ t, s: score(t, null, b, M) })).sort((x, y) => y.s - x.s).slice(0, Math.max(n * 2, 14));
  const out = [];
  for (const c of pre) { const info = fieldsOf(c.t, b); if (!info) continue; out.push({ t: c.t, info, s: score(c.t, info, b, M) }); }
  return out.sort((x, y) => y.s - x.s).slice(0, n);
}
const familyKey = t => t.cf || t.fam || t.id;
function pickThree(cands, avoid) {
  const out = [], fams = new Set();
  for (const c of cands) { if (avoid && avoid.has(c.t.id)) continue; if (fams.has(familyKey(c.t)) && cands.length > 4) continue; out.push(c); fams.add(familyKey(c.t)); if (out.length === 3) break; }
  for (const c of cands) { if (out.length === 3) break; if (!out.includes(c) && !(avoid && avoid.has(c.t.id))) out.push(c); }
  return out;
}
// shots: each slot gets the next clip of the shape it wants; landscape clips are never cropped (templates show them whole)
function assignShots(fields, M, order) {
  const shot = {}, used = new Map(); let any = 0;
  const pool = order && order.length ? order.map(id => M.find(r => r.id === id)).filter(Boolean).concat(M.filter(r => !order.includes(r.id))) : M.slice();
  const want = f => (f.kind === 'vert' || f.kind === 'land' ? f.kind : null), pref = f => (String(f.def && f.def[0]).startsWith('phv') ? 'vert' : 'land');
  for (const f of fields.filter(x => x.type === 'shot')) {
    const w = want(f), p = pref(f);
    const ok = r => !w || r.kind === w;
    const cand = pool.filter(ok); if (!cand.length) continue;
    const fresh = cand.filter(r => !used.has(r.id)), byPref = (fresh.length ? fresh : cand).filter(r => r.kind === p), list = byPref.length && !(order && order.length) ? byPref : (fresh.length ? fresh : cand);
    const r = list[0], k = (used.get(r.id) || 0); used.set(r.id, k + 1); any++;
    const d = f.d || 2, room = Math.max(0, (r.dur || 0) - d - 0.1);
    shot[f.key] = { c: r.id, in: r.still ? 0 : Math.round((room > 0 ? Math.min(room, room * 0.25 + k * 2.1) % (room + 0.001) : 0) * 1000) / 1000 };
    // move used clips to the back so the next slot gets a different one
    const i = pool.indexOf(r); if (i >= 0) { pool.splice(i, 1); pool.push(r); }
  }
  return { shot, filled: any };
}
// numbers and money: an AI line may only use figures the business gave (in the brief, the brand kit or the template's own sample)
const nums = s => (String(s || '').match(/\d[\d,.]*/g) || []).map(x => x.replace(/[,.]+$/, '').replace(/,/g, ''));
function allowedNums(b, f) {
  const C = b.contact || {}; return new Set([].concat(nums(Q.brief), nums(C.phone), nums(C.since), nums(C.lic), nums(C.badge), nums(C.tagline), nums(f.eff), nums(f.def), nums((b.services || []).join(' '))));
}
function cleanLine(f, v, b) {
  if (typeof v !== 'string') return null; v = v.replace(/\s+/g, ' ').trim(); if (!v) return null;
  if (f.multiline) v = v.split(/\s*\n\s*|\s*\/\s*/).join('\n');
  if (f.upper) v = v.toUpperCase();
  if (f.max) v = f.multiline ? v.split('\n').map(l => clampS(l, f.max)).join('\n').slice(0, f.max * 4) : clampS(v, f.max);
  const ok = allowedNums(b, f); if (nums(v).some(n => !ok.has(n))) return null;   // a figure nobody gave: keep the template's line
  if (/[$€£]\s?\d/.test(v) && !/[$€£]\s?\d/.test(Q.brief)) return null;
  if (A.lint(v).length) return null;   // breaks a brand rule (superlatives, star ratings, banned words): keep the template's line
  return v;
}
function brandBlock(b) { return NX.ai && NX.ai.brandFacts ? NX.ai.brandFacts(b) : { business: b.name, industry: A.indOf(b).label }; }
function rulesBlock(b) { return NX.ai && NX.ai.brandRules ? NX.ai.brandRules(b) : ['Do not invent facts, prices, offers or numbers.']; }
function mediaBlock(M) { return M.map(r => ({ id: r.id, shape: r.kind === 'vert' ? 'vertical 9:16' : 'landscape 16:9', kind: r.still ? 'photo' : 'video', seconds: r.still ? null : Math.round((r.dur || 0) * 10) / 10, name: String(r.name || '').slice(0, 60), project: r.project || '' })); }
function candBlock(c) {
  return { id: c.t.id, name: c.t.name, what: c.t.blurb, feel: c.t.vibe || '', seconds: Math.round(c.info.dur),
    lines: c.info.fields.filter(f => f.type === 'text' || f.type === 'select').map(f => Object.assign({ key: f.key, role: (f.group || 'Copy') + ' · ' + (f.label || f.key), max: f.max || 40 }, f.upper ? { caps: true } : {}, f.multiline ? { lines: true } : {}, f.req ? { must_be_real: true } : {}, f.type === 'select' ? { options: f.options.map(o => o.value) } : { sample: String(f.eff || '').slice(0, 120) })),
    shots: c.info.fields.filter(f => f.type === 'shot').map(f => ({ slot: f.key, label: f.label || f.group || 'Shot', wants: f.kind === 'vert' ? 'vertical' : f.kind === 'land' ? 'landscape' : 'either', seconds: f.d || 2 })) };
}
function planPrompt(b, cands, M, n) {
  const goal = (GOALS().find(g => g[0] === Q.goal) || [0, ''])[1], vibe = (VIBES.find(v => v[0] === Q.vibe) || [0, ''])[1];
  return 'CREATIVE DIRECTOR PLAN\nYou are the creative director of a video studio for small businesses. Make ' + n + ' different short vertical social videos (9:16, Reels, TikTok, Shorts) from the business’s brief and media, using only the templates offered below. Each template has fixed motion, music and timing; you choose the template, write its on-screen lines and order the shots.\n\n' +
    'BRIEF FROM THE BUSINESS: ' + (Q.brief || '(none: make strong general videos for this business)') + '\n' + (goal ? 'GOAL: ' + goal + '\n' : '') + (vibe ? 'FEEL: ' + vibe + '\n' : '') +
    '\nBRAND FACTS (the only facts you may use):\n' + JSON.stringify(brandBlock(b), null, 1) + '\n\nRULES:\n- ' + rulesBlock(b).concat([
      'Every line must fit inside its "max" characters. Lines with "caps" are shown in capitals. Lines with "lines" may hold several short lines separated by \\n.',
      'Lines marked "must_be_real" (prices, offers, names, numbers, dates, reviews) may only be filled from the brief or the brand facts. If you do not have the real value, leave the key out and add a short question for it to "ask".',
      'Never invent a price, discount, date, time, number, award, guarantee, customer count or review.',
      'Pick ' + n + ' different templates so the drafts feel different (different formats, not the same idea twice). Prefer templates whose shot shapes match the media.',
      'Shots: assign media ids to slots in the order that tells the story best; a slot that wants vertical needs vertical media and landscape needs landscape. Reuse media only if there is not enough.',
      'Keep each line’s role (its group and label say what it does on screen). Short, concrete words, written like a person. No hashtags or emoji.',
    ]).join('\n- ') + '\n\nMEDIA (id, shape, kind, length):\n' + JSON.stringify(mediaBlock(M), null, 1) +
    '\n\nTEMPLATES YOU MAY USE:\n' + JSON.stringify(cands.map(candBlock), null, 1) +
    '\n\nAnswer with only JSON: {"drafts": [{"template": "<id>", "why": "<one short sentence for the business, under 90 characters>", "lines": {"<key>": "<text>"}, "shots": [{"slot": "<slot>", "media": "<media id>"}], "ask": [{"key": "<line key>", "question": "<short question>"}]}]}';
}
function draftFrom(c, plan, b, M) {
  const t = c.t, proj = A.newProject(t, {}); proj.text = {}; proj.shot = {}; proj.quick = true;
  if (t.hol) proj.hol = holFromBrief(Q.brief) || NX.defaultHol();
  const byKey = new Map(c.info.fields.map(f => [f.key, f])), asks = [];
  if (plan && plan.lines && typeof plan.lines === 'object') for (const [k, v] of Object.entries(plan.lines)) {
    const f = byKey.get(k); if (!f) continue;
    if (f.type === 'select') { if (f.options.some(o => o.value === v)) proj.text[k] = v; continue; }
    if (f.type !== 'text') continue; const s = cleanLine(f, v, b); if (s !== null && s !== f.eff) proj.text[k] = s;
  }
  let order = null;
  if (plan && Array.isArray(plan.shots)) { const valid = plan.shots.filter(x => x && byKey.has(x.slot) && byKey.get(x.slot).type === 'shot' && M.some(r => r.id === x.media));
    for (const x of valid) { const f = byKey.get(x.slot), r = M.find(m => m.id === x.media); if (f.kind && f.kind !== 'any' && f.kind !== r.kind) continue; const d = f.d || 2, room = Math.max(0, (r.dur || 0) - d - 0.1); proj.shot[x.slot] = { c: r.id, in: r.still ? 0 : Math.round(room * 0.3 * 1000) / 1000 }; }
    order = valid.map(x => x.media); }
  const rest = assignShots(c.info.fields.filter(f => !proj.shot[f.key]), M, order); Object.assign(proj.shot, rest.shot);
  if (plan && Array.isArray(plan.ask)) for (const a of plan.ask) { const f = byKey.get(a && a.key); if (f && f.type === 'text' && typeof a.question === 'string') asks.push({ key: f.key, q: clampS(a.question, 120) }); }
  const why = plan && typeof plan.why === 'string' ? clampS(plan.why, 110) : whyOf(t);
  return { t, proj, why, asks, info: c.info };
}
function whyOf(t) {
  if (t.sig) return { wall: 'A moving wall of your clips: eye-catching in the first second.', pick: 'Asks viewers to pick one, so people comment.', dayinlife: 'Shows the real work behind the business, hour by hour.', oneword: 'One bold word per shot, on the beat.', pov: 'A relatable POV caption people share.', notes: 'Shows how you do it, step by step.', numbers: 'Your real numbers, counted up big.', spotlight: 'Puts one service front and centre.', rate: 'Viewers rate it 1–10 in the comments.', reply: 'Answers a real question from a customer.', episode: 'A series people follow week to week.', loop: 'Loops seamlessly, so it gets watched twice.' }[t.id] || t.blurb;
  return (t.vibe ? t.vibe + '. ' : '') + String(t.blurb || '').split('. ')[0] + '.';
}
async function direct(avoid) {
  const b = A.B(), M = media(); Q.ai = false; Q.msg = '';
  const cands = shortlist(b, CAP.sample ? 9 : 8); Q.cands = cands;
  if (!cands.length) throw new Error('No template fits this brand yet.');
  let plans = null;
  if (CAP.sample && !(avoid && avoid.size)) {
    try {
      Q.ctl = new AbortController(); setThink('Your creative director is reading the brief and your media…');
      const res = await CAP.sample.json(planPrompt(b, cands, M, 3), { modelTier: 'default', cache: false, signal: Q.ctl.signal, onText: ({ text }) => { const n = (text.match(/"template"/g) || []).length; setThink(n ? 'Writing draft ' + Math.min(3, n) + ' of 3…' : 'Planning the drafts…'); } });
      if (res && Array.isArray(res.drafts)) plans = res.drafts.filter(d => d && cands.some(c => c.t.id === d.template)); Q.ai = !!(plans && plans.length);
    } catch (e) { if (e && e.code === 'cancelled') throw e; Q.msg = (NX.ai && NX.ai.errText ? NX.ai.errText(e) : '') || ''; console.warn('director', e); }
    finally { Q.ctl = null; }
  }
  const out = [], seen = new Set();
  for (const p of plans || []) { if (seen.has(p.template) || out.length === 3) continue; seen.add(p.template); out.push(draftFrom(cands.find(c => c.t.id === p.template), p, b, M)); }
  for (const c of pickThree(cands, new Set([...seen, ...(avoid || [])]))) { if (out.length === 3) break; if (seen.has(c.t.id)) continue; seen.add(c.t.id); out.push(draftFrom(c, null, b, M)); }
  return out;
}
// a poster still for each draft, in that draft's look
async function posters(drafts, onEach) {
  await A.stopThumbs(); A.R.lock = true; await A.waitIdle();
  try {
    for (const d of drafts) {
      try { await NX.applyLook(NX.lookFor(d.proj, d.t, A.B()), d.t); window.HOLFX = null; window.OVERLAY = null; d.poster = await A.renderOne(d.t, d.proj, Math.min((d.info.dur || 10) - 0.2, A.POSTER(d.t.id)), true); }
      catch (e) { console.warn('poster', d.t.id, e); }
      onEach(d); await sleep(10);
    }
  } finally { await A.syncLook(true, true); A.R.lock = false; A.requestRender(S.t); }
}

// ------------------------------------------------------------------------------------------------ Home: the quick box in the hero
function heroBox() {
  const hero = document.querySelector('#vHome .hero'); if (!hero || hero.querySelector('.qc-box')) return;
  const box = el('div', 'qc-box'); box.id = 'qcBox';
  const row1 = el('div', 'qc-in'), ta = el('textarea'); ta.id = 'qcBrief'; ta.rows = 2; ta.maxLength = 400; ta.setAttribute('aria-label', 'What do you want to promote?');
  const go = el('button', 'btn primary lg qc-go'); go.type = 'button'; go.id = 'qcGo'; go.innerHTML = '<span aria-hidden="true">✦</span> Make my video';
  go.onclick = () => { Q.brief = ta.value.trim(); open({ step: 2 }); };
  ta.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go.click(); } };
  row1.appendChild(ta); row1.appendChild(go); box.appendChild(row1);
  const row2 = el('div', 'qc-row'); row2.id = 'qcGoals'; box.appendChild(row2);
  const sub = $('#heroSub'); sub.after(box);
  const or = el('p', 'qc-or', 'Or pick a template yourself:'); box.after(or);
  paintHero();
}
function paintHero() {
  const ta = $('#qcBrief'); if (!ta) return; ta.placeholder = 'Tell me what to promote. ' + (EXAMPLE[sectorKey()] || EXAMPLE.general);
  const row = $('#qcGoals'); row.textContent = ''; row.appendChild(el('span', 'lab', 'It’s for'));
  for (const [k, n] of GOALS()) { const b = el('button', 'qc-chip', n); b.type = 'button'; b.setAttribute('aria-pressed', String(Q.goal === k)); b.onclick = () => { Q.goal = Q.goal === k ? '' : k; paintHero(); }; row.appendChild(b); }
  const wk = el('button', 'qc-link', 'Plan my week →'); wk.type = 'button'; wk.onclick = () => open({ step: 'week' }); row.appendChild(wk);
}

// ------------------------------------------------------------------------------------------------ the Quick Create sheet
const modal = el('div', 'modal'); modal.id = 'qcModal'; modal.hidden = true; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'qcTitle');
modal.innerHTML = '<div class="sheet qc"><header><div><h2 id="qcTitle">Make a video</h2><p id="qcSub">Three steps. Nothing to learn.</p></div><button class="btn ghost sm" id="qcClose" type="button">Close</button></header>' +
  '<div class="qc-steps" id="qcSteps"></div><div class="qc-body" id="qcBody"></div><footer><span class="grow" id="qcMsg"></span><button class="btn" id="qcBack" type="button">Back</button><button class="btn primary" id="qcNext" type="button">Next</button></footer></div>';
document.body.appendChild(modal);
$('#qcClose').onclick = () => close();
modal.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
function close() { if (Q.ctl) Q.ctl.abort(); modal.hidden = true; }
function open(o) {
  o = o || {}; if (A.S.playing) A.pause();
  if (!Q.mediaTouched) { Q.media = new Set(NX.brandClips().sort((a, b) => String(b.addedAt || '').localeCompare(String(a.addedAt || ''))).slice(0, 12).map(r => r.id)); }
  Q.step = o.step || 1; modal.hidden = false; paint();
  if (Q.step === 'week') planWeek();
}
const STEPS = [[1, 'What we’re making'], [2, 'Your photos & clips'], [3, 'Pick a draft']];
function paintSteps() {
  const box = $('#qcSteps'); box.textContent = ''; const cur = Q.step === 'week' ? 1 : Q.step;
  for (const [n, l] of STEPS) { const s = el('span', n === cur ? 'on' : n < cur ? 'done' : ''); s.appendChild(el('i', '', n < cur ? '✓' : String(n))); s.appendChild(document.createTextNode(l)); box.appendChild(s); }
}
function setThink(t) { const p = document.querySelector('#qcBody .qc-think span'); if (p) p.textContent = t; }
function paint() {
  paintSteps(); const body = $('#qcBody'), next = $('#qcNext'), back = $('#qcBack'), msg = $('#qcMsg'); body.textContent = ''; msg.textContent = ''; next.hidden = false; back.hidden = Q.step === 1;
  const b = A.B();
  if (Q.step === 1) {
    $('#qcTitle').textContent = 'Make a video for ' + (b.short || b.name); $('#qcSub').textContent = 'Three steps. Nothing to learn.';
    body.appendChild(el('h3', '', 'What are we making?')); body.appendChild(el('p', 'sub', 'One sentence is enough. Mention any price, date or offer exactly as it is; nothing gets made up.'));
    const ta = el('textarea', 'qc-big'); ta.id = 'qcBrief2'; ta.maxLength = 400; ta.placeholder = EXAMPLE[sectorKey()] || EXAMPLE.general; ta.value = Q.brief; ta.oninput = () => (Q.brief = ta.value.trim()); body.appendChild(ta);
    body.appendChild(el('span', 'qc-lbl', 'It’s for (optional)'));
    const g = el('div', 'qc-chips'); for (const [k, n] of GOALS()) { const c = el('button', 'qc-chip', n); c.type = 'button'; c.setAttribute('aria-pressed', String(Q.goal === k)); c.onclick = () => { Q.goal = Q.goal === k ? '' : k; paint(); }; g.appendChild(c); } body.appendChild(g);
    body.appendChild(el('span', 'qc-lbl', 'The feel (optional)'));
    const v = el('div', 'qc-chips'); for (const [k, n] of VIBES) { const c = el('button', 'qc-chip', n); c.type = 'button'; c.setAttribute('aria-pressed', String(Q.vibe === k)); c.onclick = () => { Q.vibe = Q.vibe === k ? '' : k; paint(); }; v.appendChild(c); } body.appendChild(v);
    const wk = el('button', 'qc-link', 'Not sure? Plan my week of posts →'); wk.type = 'button'; wk.style.marginTop = '18px'; wk.onclick = () => { Q.step = 'week'; paint(); planWeek(); }; body.appendChild(wk);
    next.textContent = 'Next: photos & clips'; next.onclick = () => { Q.step = 2; paint(); }; setTimeout(() => ta.focus(), 30);
  } else if (Q.step === 2) {
    $('#qcSub').textContent = Q.brief ? '“' + clampS(Q.brief, 90) + '”' : 'Three steps. Nothing to learn.';
    body.appendChild(el('h3', '', 'Your photos & clips')); body.appendChild(el('p', 'sub', 'Tap to choose what goes in. Landscape clips are always shown whole, never cropped.'));
    const all = NX.brandClips().sort((x, y) => String(y.addedAt || '').localeCompare(String(x.addedAt || ''))), grid = el('div', 'qc-media');
    const up = el('button', 'qc-m add'); up.type = 'button'; up.textContent = '+ Upload photos or clips'; up.onclick = () => A.pickFiles(); grid.appendChild(up);
    for (const r of all) {
      const m = el('button', 'qc-m'); m.type = 'button'; m.setAttribute('aria-pressed', String(Q.media.has(r.id))); m.title = r.name || '';
      if (r.poster) { const im = el('img'); im.alt = ''; im.src = r.poster; m.appendChild(im); }
      m.appendChild(el('span', 'k', (r.still ? 'Photo' : Math.round(r.dur || 0) + ' s') + ' · ' + (r.kind === 'vert' ? '9:16' : '16:9'))); m.appendChild(el('span', 'ck', Q.media.has(r.id) ? '✓' : ''));
      m.onclick = () => { Q.mediaTouched = true; if (Q.media.has(r.id)) Q.media.delete(r.id); else Q.media.add(r.id); paint(); }; grid.appendChild(m);
    }
    body.appendChild(grid);
    const n = media().length, tools = el('div', 'qc-chips'); tools.style.marginTop = '12px';
    const sa = el('button', 'qc-chip', 'Select all'); sa.type = 'button'; sa.onclick = () => { Q.mediaTouched = true; all.forEach(r => Q.media.add(r.id)); paint(); };
    const sn = el('button', 'qc-chip', 'Select none'); sn.type = 'button'; sn.onclick = () => { Q.mediaTouched = true; Q.media.clear(); paint(); };
    if (all.length) { tools.appendChild(sa); tools.appendChild(sn); body.appendChild(tools); }
    body.appendChild(el('p', 'qc-note', all.length ? (n ? n + ' selected. ' : 'Nothing selected: drafts will show placeholders you can fill later. ') + 'Pick more than you think: the director chooses the best fit for each shot.' : 'No photos or clips for ' + (b.short || b.name) + ' yet. Upload some, or carry on: drafts show placeholders you can fill later.'));
    next.textContent = '✦ Make 3 drafts'; next.onclick = () => { Q.step = 3; Q.used = new Set(); make(); };
  } else if (Q.step === 3) {
    body.appendChild(el('h3', '', 'Pick a draft')); body.appendChild(el('p', 'sub', 'Three different formats made from your brief and media. Open one to watch it, fill in anything it needs, then export.'));
    if (Q.busy) { const th = el('div', 'qc-think'); th.appendChild(el('i')); th.appendChild(el('span', '', 'Picking formats that fit…')); body.appendChild(th); next.hidden = true; return; }
    const grid = el('div', 'qc-drafts');
    Q.drafts.forEach((d, i) => {
      const c = el('div', 'qc-d'), pv = el('button', 'pv'); pv.type = 'button'; pv.dataset.i = i; pv.setAttribute('aria-label', 'Open draft ' + (i + 1) + ': ' + d.t.name); pv.onclick = () => useDraft(i);
      if (d.poster) { const im = el('img'); im.alt = d.t.name; im.src = d.poster; pv.appendChild(im); } else pv.appendChild(el('div', 'wait', 'Rendering…'));
      c.appendChild(pv); c.appendChild(el('b', '', (i + 1) + '. ' + d.t.name)); c.appendChild(el('span', 'why', d.why));
      const u = el('button', 'btn ' + (i === 0 ? 'primary' : '')); u.type = 'button'; u.textContent = 'Use this draft'; u.onclick = () => useDraft(i); c.appendChild(u);
      grid.appendChild(c);
    });
    body.appendChild(grid);
    const note = Q.ai ? 'Written by Claude from your brief, inside your brand rules.' : (CAP.sample ? (Q.msg ? 'Claude couldn’t write these (' + Q.msg + '), so they use each template’s words for your industry.' : 'These use each template’s words for your industry.') : 'These use each template’s words for your industry. Open the studio on claude.ai to have Claude write them from your brief.');
    body.appendChild(el('p', 'qc-note', note));
    next.textContent = 'Show 3 different ones'; next.onclick = () => { Q.drafts.forEach(d => Q.used.add(d.t.id)); make(Q.used); };
  } else if (Q.step === 'week') {
    back.hidden = false; $('#qcTitle').textContent = 'Your week of posts'; $('#qcSub').textContent = 'A plan for the next five days. Tap one to make it.';
    if (!Q.week) { const th = el('div', 'qc-think'); th.appendChild(el('i')); th.appendChild(el('span', '', 'Planning your week…')); body.appendChild(th); next.hidden = true; return; }
    const list = el('div', 'qc-week');
    for (const w of Q.week) { const r = el('div', 'qc-w'); r.appendChild(el('span', 'day', w.day)); const m = el('div'); m.appendChild(el('b', '', w.title)); m.appendChild(el('p', '', w.brief)); r.appendChild(m);
      const b2 = el('button', 'btn sm'); b2.type = 'button'; b2.textContent = 'Make this'; b2.onclick = () => { Q.brief = w.brief; Q.goal = w.goal || ''; Q.want = w.tpl || null; Q.step = 2; paint(); }; r.appendChild(b2); list.appendChild(r); }
    body.appendChild(list); next.hidden = true;
  }
  back.onclick = () => { if (Q.ctl) Q.ctl.abort(); Q.step = Q.step === 'week' ? 1 : Math.max(1, Q.step - 1); paint(); };
}
async function make(avoid) {
  if (Q.busy) return; Q.busy = true; paint();
  try {
    let ds = await direct(avoid);
    if (Q.want) { const w = A.TPL(Q.want); if (w && !ds.some(d => d.t.id === w.id) && !excluded(w, A.B())) { const info = fieldsOf(w, A.B()); if (info) ds = [draftFrom({ t: w, info }, null, A.B(), media())].concat(ds).slice(0, 3); } Q.want = null; }
    Q.drafts = ds; Q.busy = false; paint();
    await posters(ds, d => { const i = Q.drafts.indexOf(d), pv = document.querySelector('#qcBody .qc-d .pv[data-i="' + i + '"]'); if (pv && d.poster) { pv.textContent = ''; const im = el('img'); im.alt = d.t.name; im.src = d.poster; pv.appendChild(im); } });
  } catch (e) {
    Q.busy = false; if (e && e.code === 'cancelled') { Q.step = 2; paint(); return; }
    console.error(e); paint(); $('#qcMsg').textContent = 'Something went wrong: ' + (e && e.message || e);
  }
}
function useDraft(i) {
  const d = Q.drafts[i]; if (!d) return; Q.idx = i; close();
  document.body.classList.add('quick'); A.openProject(d.proj, { step: 'text' }); A.markDirty(); paintReview();
}

// ------------------------------------------------------------------------------------------------ week planner
async function planWeek() {
  Q.week = null; paint(); const b = A.B();
  const days = [], d0 = new Date(); for (let i = 0; i < 5; i++) { const d = new Date(d0.getTime() + (i + 1) * 864e5); days.push(d.toLocaleDateString(undefined, { weekday: 'short' }) + ' ' + d.getDate()); }
  const hol = HOL.upcoming().find(h => h.days <= 14);
  let plan = null;
  if (CAP.sample) {
    try {
      const sk = sectorKey(), opts = GOALS().map(g => g[0]);
      const res = await CAP.sample.json('WEEK PLAN\nPlan five short vertical social posts (one a day) for this small business. Mix the goals: show the work, build trust, get comments, promote something. ' + (hol ? 'A holiday is coming: ' + HOL.THEMES[hol.id].name + ' in ' + hol.days + ' days; one post may be for it.' : '') +
        '\nBRAND FACTS (the only facts you may use):\n' + JSON.stringify(brandBlock(b), null, 1) + '\nRULES:\n- ' + rulesBlock(b).join('\n- ') + '\n- Each brief is one sentence the owner could have written, with no invented prices, offers, numbers or dates.' +
        '\nGoals you may use: ' + opts.join(', ') + '\nDays: ' + days.join(', ') + '\nAnswer with only JSON: {"week": [{"day": "<day>", "goal": "<goal>", "title": "<4-7 words>", "brief": "<one sentence>"}]}', { modelTier: 'default', cache: false });
      if (res && Array.isArray(res.week)) plan = res.week.slice(0, 5).map((w, i) => ({ day: days[i], goal: opts.includes(w.goal) ? w.goal : '', title: clampS(w.title, 60), brief: clampS(w.brief, 200) })).filter(w => w.title && w.brief && !A.lint(w.brief).length);
    } catch (e) { console.warn('week', e); }
  }
  if (!plan || plan.length < 3) {
    const sv = (b.services || []).map(s => String(s).toLowerCase()); const one = sv[0] || 'what we do', two = sv[1] || one;
    const sk = sectorKey();
    plan = [
      { goal: sk === 'food' ? 'menu' : sk === 'estate' ? 'listing' : 'show', title: sk === 'food' ? 'The dish everyone orders' : sk === 'estate' ? 'Your newest listing' : 'Our latest work', brief: sk === 'food' ? 'Show off our most popular dish.' : sk === 'estate' ? 'Show off our newest listing.' : 'Show off a recent ' + one + ' project.', tpl: 'wall' },
      { goal: 'trust', title: 'How we do it', brief: 'Walk people through how we do ' + one + ', step by step.', tpl: 'notes' },
      { goal: 'eng', title: 'Which one would you pick?', brief: 'Ask viewers to pick their favourite, so they comment.', tpl: 'pick' },
      hol ? { goal: 'hol', title: HOL.THEMES[hol.id].name + ' post', brief: 'A ' + HOL.THEMES[hol.id].name + ' greeting from ' + (b.short || b.name) + '.', tpl: 'hgreet' } : { goal: 'show', title: 'A day with us', brief: 'A day in the life at ' + (b.short || b.name) + '.', tpl: 'dayinlife' },
      { goal: 'promo', title: 'Spotlight on ' + two, brief: 'Promote our ' + two + ' service.', tpl: 'spotlight' },
    ].map((w, i) => Object.assign(w, { day: days[i] }));
  }
  Q.week = plan; if (!modal.hidden && Q.step === 'week') paint();
}

// ------------------------------------------------------------------------------------------------ review: the workspace in quick mode
const panel = el('section', 'qpanel'); panel.id = 'qPanel'; panel.setAttribute('aria-label', 'Your draft');
panel.innerHTML = '<div class="qp-head"><div class="step" id="qpStep"></div><h2 id="qpTitle"></h2><p id="qpWhy"></p></div><div class="qp-body" id="qpBody"></div>' +
  '<div class="qp-foot"><button class="btn" id="qpMore" type="button">Edit more</button><button class="btn primary" id="qpExport" type="button"><svg class="i" viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>Export</button></div>';
$('#insp').before(panel);
$('#qpMore').onclick = () => exitQuick(true);
$('#qpExport').onclick = () => $('#exportBtn').click();
function exitQuick(toEditor) { if (!document.body.classList.contains('quick')) return; document.body.classList.remove('quick'); if (toEditor) A.goStep(A.phSlots().length ? 'foot' : 'text'); }
new MutationObserver(() => { const c = document.body.classList; if (c.contains('quick') && !c.contains('view-work')) c.remove('quick'); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });   // remove only when present: a no-op remove still writes the attribute
A.onOpen.push(p => { if (!Q.drafts.some(d => d.proj === p)) exitQuick(false); else if (document.body.classList.contains('quick')) paintReview(); });
A.onRebuild.push(() => { if (document.body.classList.contains('quick')) paintFill(); });

const TWEAKS = ['Make it punchier', 'More premium', 'Shorter lines', 'Swap shots 1 and 2', 'Try a different format'];
function paintReview() {
  const d = Q.drafts[Q.idx]; if (!d) return; const body = $('#qpBody'); body.textContent = '';
  $('#qpStep').textContent = 'Draft ' + (Q.idx + 1) + ' of ' + Q.drafts.length; $('#qpTitle').textContent = d.t.name; $('#qpWhy').textContent = d.why;
  const s1 = el('div', 'qp-sec'); s1.appendChild(el('h4', '', 'Your drafts')); const row = el('div', 'qp-dr');
  Q.drafts.forEach((x, i) => { const b = el('button'); b.type = 'button'; b.title = x.t.name; b.setAttribute('aria-current', String(i === Q.idx)); if (x.poster) { const im = el('img'); im.alt = ''; im.src = x.poster; b.appendChild(im); } b.appendChild(el('span', '', (i + 1) + '. ' + x.t.name));
    b.onclick = () => { if (i === Q.idx) return; Q.idx = i; A.openProject(x.proj, { step: 'text' }); A.markDirty(); paintReview(); }; row.appendChild(b); });
  s1.appendChild(row); body.appendChild(s1);
  const fill = el('div', 'qp-sec'); fill.id = 'qpFill'; body.appendChild(fill); paintFill();
  const s3 = el('div', 'qp-sec'); s3.appendChild(el('h4', '', 'Change something'));
  const ask = el('div', 'qp-ask'), ta = el('textarea'); ta.id = 'qpAsk'; ta.placeholder = CAP.sample ? 'Say it in plain words, e.g. “make the headline punchier” or “put the pool deck shot first”' : 'e.g. “swap shots 1 and 3” or “try a different format”'; ta.maxLength = 300;
  const go = el('button', 'btn dark'); go.type = 'button'; go.id = 'qpGo'; go.textContent = 'Apply'; go.onclick = () => tweak(ta.value.trim()); ta.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go.click(); } };
  ask.appendChild(ta); ask.appendChild(go); s3.appendChild(ask);
  const chips = el('div', 'qc-chips'); chips.style.marginTop = '8px'; for (const tx of TWEAKS) { if (!CAP.sample && /punch|premium|shorter/i.test(tx)) continue; const c = el('button', 'qc-chip', tx); c.type = 'button'; c.onclick = () => { ta.value = tx; tweak(tx); }; chips.appendChild(c); } s3.appendChild(chips);
  const msg = el('p', 'qp-msg'); msg.id = 'qpMsg'; s3.appendChild(msg); body.appendChild(s3);
  const s4 = el('div', 'qp-sec'); const again = el('button', 'btn sm ghost', '← Start over'); again.type = 'button'; again.onclick = () => { open({ step: 1 }); }; s4.appendChild(again); body.appendChild(s4);
}
// what the draft still needs: the director's questions, then lines that must be real (prices, names), then placeholder shots
function paintFill() {
  const box = $('#qpFill'), d = Q.drafts[Q.idx]; if (!box || !d || S.proj !== d.proj) return; box.textContent = '';
  const asks = new Map(d.asks.map(a => [a.key, a.q])), need = S.fields.filter(f => f.type === 'text' && (asks.has(f.key) || (f.req && S.proj.text[f.key] === undefined)));
  const props = A.reqLeft().filter(f => f.type === 'prop'), ph = A.phSlots().length;
  if (!need.length && !props.length && !ph) { const ok = el('div', 'qp-ok'); ok.appendChild(el('span', '', '✓')); ok.appendChild(el('span', '', 'Ready to export. Play it first, or change anything below.')); box.appendChild(ok); return; }
  box.appendChild(el('h4', '', 'Fill in before you export'));
  for (const f of need) {
    const w = el('div', 'qp-f'), id = 'qpf_' + f.key, lab = el('label', '', f.label || f.key); lab.htmlFor = id; w.appendChild(lab);
    if (asks.has(f.key)) w.appendChild(el('span', 'q', asks.get(f.key)));
    const inp = el(f.multiline ? 'textarea' : 'input'); inp.id = id; if (f.max) inp.maxLength = f.multiline ? f.max * 4 : f.max; inp.value = S.proj.text[f.key] !== undefined ? S.proj.text[f.key] : ''; inp.placeholder = String(f.eff || f.hint || '').slice(0, 80);
    inp.oninput = () => { const v = inp.value; if (v.trim()) S.proj.text[f.key] = f.upper ? v.toUpperCase() : v; else delete S.proj.text[f.key]; A.edited(); };
    w.appendChild(inp); if (f.hint) w.appendChild(el('span', 'q', f.hint)); box.appendChild(w);
  }
  if (props.length) { const p = el('p', 'qp-msg', 'This draft shows listing details (' + props.map(f => (f.label || f.key).toLowerCase()).slice(0, 3).join(', ') + '). '); const b = el('button', 'qc-link', 'Add the listing details'); b.type = 'button'; b.onclick = () => { exitQuick(false); A.goStep('prop'); }; p.appendChild(b); box.appendChild(p); }
  if (ph) { const p = el('p', 'qp-msg', ph + ' shot' + (ph > 1 ? 's' : '') + ' still show placeholders. '); const b = el('button', 'qc-link', 'Choose footage'); b.type = 'button'; b.onclick = () => { exitQuick(false); A.goStep('foot'); }; p.appendChild(b); box.appendChild(p); }
}
// ------------------------------------------------------------------------------------------------ tweaks in plain words
function swapShots(a, b) {
  const keys = S.fields.filter(f => f.type === 'shot').map(f => f.key), ka = keys[a - 1], kb = keys[b - 1]; if (!ka || !kb) return false;
  const va = A.shotVal(S.fields.find(f => f.key === ka)), vb = A.shotVal(S.fields.find(f => f.key === kb));
  S.proj.shot[ka] = { c: vb[0], in: vb[1] }; S.proj.shot[kb] = { c: va[0], in: va[1] }; return true;
}
function nextFormat() {
  const used = new Set(Q.drafts.map(x => x.t.id)), c = Q.cands.find(x => !used.has(x.t.id)) || shortlist(A.B(), 14).find(x => !used.has(x.t.id)); if (!c) return false;
  const cur = Q.drafts[Q.idx], order = S.fields.filter(f => f.type === 'shot').map(f => A.shotVal(f)[0]).filter(id => NX.CLIPS.has(id));
  const nd = draftFrom(c, { shots: [] }, A.B(), media()); const re = assignShots(c.info.fields, media(), order); nd.proj.shot = re.shot;
  Q.drafts[Q.idx] = nd; A.openProject(nd.proj, { step: 'text' }); A.markDirty();
  posters([nd], () => paintReview()); void cur; return true;
}
async function tweak(req) {
  const msg = $('#qpMsg'); if (!req) { msg.textContent = 'Type what you’d like to change.'; return; }
  const d = Q.drafts[Q.idx]; if (!d || S.proj !== d.proj) return;
  let m = req.match(/swap\s+(?:shots?\s*)?(\d+)\s*(?:and|with|&|,)\s*(?:shot\s*)?(\d+)/i);
  if (m) { if (swapShots(+m[1], +m[2])) { A.edited(true); msg.textContent = 'Swapped shots ' + m[1] + ' and ' + m[2] + '.'; } else msg.textContent = 'This draft doesn’t have those shots.'; return; }
  if (/different (format|style|template|one)|another (format|style|template|one)|try something else/i.test(req) && !CAP.sample) { const ok = nextFormat(); $('#qpMsg').textContent = ok ? 'Here’s another format with the same footage.' : 'No other format fits right now.'; return; }
  if (!CAP.sample) { msg.textContent = 'Changes in plain words need Claude: open the studio on claude.ai. You can also tap Edit more and change it by hand.'; return; }
  const b = A.B(), M = media().length ? media() : NX.brandClips(), cand = { t: d.t, info: { dur: S.dur, fields: S.fields } }, others = Q.cands.filter(c => !Q.drafts.some(x => x.t.id === c.t.id)).slice(0, 5);
  const cur = { template: d.t.id, lines: Object.fromEntries(S.fields.filter(f => f.type === 'text' || f.type === 'select').map(f => [f.key, String(A.fieldVal(f) || '')])), shots: S.fields.filter(f => f.type === 'shot').map((f, i) => ({ n: i + 1, slot: f.key, media: A.shotVal(f)[0] })) };
  const prompt = 'CREATIVE DIRECTOR TWEAK\nYou are the creative director. The business wants a change to this draft of a short vertical social video. Make only the change asked for.\n\nREQUEST: ' + req +
    '\n\nBRAND FACTS (the only facts you may use):\n' + JSON.stringify(brandBlock(b), null, 1) + '\n\nRULES:\n- ' + rulesBlock(b).concat(['Lines must fit inside "max". Never invent prices, offers, numbers or dates.', 'To change the format, set "template" to one of the other templates offered; otherwise leave it out.']).join('\n- ') +
    '\n\nBRIEF: ' + (Q.brief || '(none)') + '\n\nTHIS TEMPLATE:\n' + JSON.stringify(candBlock(cand), null, 1) + '\n\nCURRENT DRAFT:\n' + JSON.stringify(cur, null, 1) + '\n\nMEDIA:\n' + JSON.stringify(mediaBlock(M), null, 1) +
    (others.length ? '\n\nOTHER TEMPLATES (only if the request asks for a different format):\n' + JSON.stringify(others.map(candBlock), null, 1) : '') +
    '\n\nAnswer with only JSON: {"say": "<what you changed, one short sentence>", "template": "<id, only when switching>", "lines": {"<key>": "<text>"}, "shots": [{"slot": "<slot>", "media": "<media id>"}]}';
  const go = $('#qpGo'); go.disabled = true; msg.textContent = 'Working on it…';
  try {
    const res = await CAP.sample.json(prompt, { modelTier: 'default', cache: false });
    if (!res || typeof res !== 'object') throw { code: 'invalid_json' };
    if (res.template && res.template !== d.t.id) { const c = others.find(x => x.t.id === res.template); if (c) { const nd = draftFrom(c, res, b, M); Q.drafts[Q.idx] = nd; A.openProject(nd.proj, { step: 'text' }); A.markDirty(); posters([nd], () => paintReview()); $('#qpMsg').textContent = clampS(res.say || 'Switched format.', 160); return; } }
    const byKey = new Map(S.fields.map(f => [f.key, f])); let n = 0, k = 0;
    if (res.lines && typeof res.lines === 'object') for (const [key, v] of Object.entries(res.lines)) { const f = byKey.get(key); if (!f) continue; if (f.type === 'select') { if (f.options.some(o => o.value === v)) { S.proj.text[key] = v; n++; } continue; } if (f.type !== 'text') continue; const s = cleanLine(f, v, b); if (s !== null) { S.proj.text[key] = s; n++; } }
    if (Array.isArray(res.shots)) for (const x of res.shots) { const f = byKey.get(x && x.slot), r = M.find(q => q.id === (x && x.media)); if (!f || f.type !== 'shot' || !r || (f.kind && f.kind !== 'any' && f.kind !== r.kind)) continue; const room = Math.max(0, (r.dur || 0) - (f.d || 2) - 0.1); S.proj.shot[f.key] = { c: r.id, in: r.still ? 0 : Math.round(room * 0.3 * 1000) / 1000 }; k++; }
    if (n || k) { A.edited(true); A.syncInspector(); }
    msg.textContent = (n || k) ? clampS(res.say || 'Done.', 160) : 'Nothing changed. Try saying it another way.';
  } catch (e) { msg.textContent = (NX.ai && NX.ai.errText ? NX.ai.errText(e) : '') || 'Something went wrong. Try again.'; }
  go.disabled = false;
}

// ------------------------------------------------------------------------------------------------ wiring
heroBox();
$('#createBtn').onclick = () => open({ step: 1 });
A.onClips.push(() => { if (!modal.hidden && Q.step === 2) paint(); });
const keepHero = new MutationObserver(() => paintHero()); const bn = $('#brandName'); if (bn) keepHero.observe(bn, { childList: true, characterData: true, subtree: true });
NX.quick = { open, close, Q, direct, shortlist, exitQuick, paintReview, tweak, planWeek, excluded, fieldsOf, assignShots, score };
})();
