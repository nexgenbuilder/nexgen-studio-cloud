'use strict';
/* NexGen Studio: the app. One studio for every client. The journey: Home (search or browse templates, holiday packs,
   recent clips) → a template preview → the workspace (1 Footage, 2 Words, 3 Style) → Export. Each brand has its own
   footage, saved clips, brand kit and industry copy; every template renders for any brand, with branded placeholders for
   footage a client hasn't sent yet. Each clip has a look (colours, fonts, seasonal touch) from nx-style.js. */
(() => {
const $ = s => document.querySelector(s);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };
const svg = (path, cls) => { const s = '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24">' + path + '</svg>'; const t = document.createElement('template'); t.innerHTML = s; return t.content.firstChild; };
const IC = {
  foot: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M3 15h18M8 5v4M16 5v4M8 15v4M16 15v4"/>', text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
  style: '<path d="M12 3a9 9 0 100 18c1.1 0 1.6-.9 1.2-1.8-.5-1.1.2-2.2 1.4-2.2H17a4 4 0 004-4c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/>',
  ai: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>', brand: '<path d="M4 7l8-4 8 4v6c0 4-3.5 7-8 8-4.5-1-8-4-8-8z"/><path d="M9 12l2 2 4-4"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  show: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 15l5-5 4 4 3-3 6 6"/>', promo: '<path d="M3 11v2a1 1 0 001 1h3l5 4V6L7 10H4a1 1 0 00-1 1zM16 9a4 4 0 010 6M19 6a8 8 0 010 12"/>',
  hol: '<path d="M12 2l2 4 4.5.7-3.2 3.1.8 4.4L12 12l-4.1 2.2.8-4.4L5.5 6.7 10 6z"/><path d="M6 21h12M12 15v6"/>', trust: '<path d="M7 11V7a5 5 0 0110 0v4"/><rect x="4" y="11" width="16" height="10" rx="2"/>',
  eng: '<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-5A8 8 0 1121 12z"/>', food: '<path d="M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9"/>', blank: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 8v8M8 12h8"/>',
  check: '<path d="M5 12l5 5 9-10"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>',
};
const fmtT = t => { t = Math.max(0, t); const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); };
const sec = t => t.toFixed(2) + ' s';
const clone = o => JSON.parse(JSON.stringify(o));
const uid8 = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const today = () => new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ago = iso => { if (!iso) return ''; const s = (Date.now() - Date.parse(iso)) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); };
const mb = b => (b >= 1073741824 ? (b / 1073741824).toFixed(2) + ' GB' : Math.round(b / 1048576) + ' MB');
const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
const isHex = s => /^#?[0-9a-f]{6}$/i.test(String(s || '').trim());
const normHex = s => '#' + String(s).trim().replace('#', '').toUpperCase();
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const CLIPS = NX.CLIPS, META = NX.META, FB = NX.FB;

// ---------------------------------------------------------------- templates
const TPLS = [
  // Signature formats (V11, engine v_sig.js): the DPG winners rebuilt for any business, starting with copy for the brand's industry
  { id: 'wall', name: 'Video Wall', file: 'sig', v: 'wall', fam: 'Signature', sig: true, live: true, isNew: true, blurb: 'A wall of moving tiles around your brand band. One tile cuts on every beat, so it never stops moving. Use 6–8 clips or photos.' },
  { id: 'pick', name: 'Pick a Number', file: 'sig', v: 'pick', fam: 'Signature', sig: true, live: true, isNew: true, blurb: 'Six numbered options with a spotlight walking round them. “Which one would you pick? Comment your number.” Built for comments.' },
  { id: 'dayinlife', name: 'A Day in the Life', file: 'sig', v: 'day', fam: 'Signature', sig: true, live: true, isNew: true, blurb: 'A timestamp rolls through the day with one caption per hour and a sun arc overhead. Six shots, morning to night.' },
  { id: 'oneword', name: 'One Word', file: 'sig', v: 'oneword', fam: 'Signature', sig: true, live: true, isNew: true, blurb: 'Eight shots on the beat, one giant word on each. Bold, fast, and easy to make your own.' },
  { id: 'pov', name: 'POV', file: 'sig', v: 'pov', fam: 'Signature', sig: true, live: true, isNew: true, blurb: '“POV: …” captions appear word by word over four shots, the way people post them. Relatable and shareable.' },
  { id: 'notes', name: 'How We Do It', file: 'sig', v: 'notes', fam: 'Signature', sig: true, live: true, isNew: true, blurb: 'Four steps, each with a handwritten note and an arrow drawn on your footage, and a progress line.' },
  { id: 'numbers', name: 'By the Numbers', file: 'sig', v: 'numbers', fam: 'Signature', sig: true, live: true, isNew: true, blurb: 'Your own figures count up big over your footage. Type your real numbers; a marker shows until you do.' },
  { id: 'spotlight', name: 'Service Spotlight', file: 'sig', v: 'spotlight', fam: 'Signature', sig: true, live: true, isNew: true, blurb: 'Your service name filled with footage, a stacked headline with a highlight, then feature tags and your call to action.' },
  { id: 'rate', name: 'Rate This', file: 'sig', v: 'rate', fam: 'Signature', sig: true, live: true, isNew: true, blurb: '“Rate this 1–10” with a meter that bounces along, four quick shots and “drop your rating”. Built for comments.' },
  { id: 'reply', name: 'Comment Reply', file: 'sig', v: 'reply', fam: 'Signature', sig: true, live: true, isNew: true, blurb: 'A real comment pinned on screen, your answer captioned over three shots. Turns questions into content.' },
  { id: 'episode', name: 'Episode', file: 'sig', v: 'episode', fam: 'Signature', sig: true, live: true, isNew: true, blurb: 'A series frame you can repeat every week: episode number, series name, one lesson, “follow for the next one”.' },
  { id: 'loop', name: 'Seamless Loop', file: 'sig', v: 'loop', fam: 'Signature', sig: true, live: true, isNew: true, blurb: 'Eight shots push into each other on the beat and the last runs straight into the first, so it plays forever.' },
  // Brand overlays (V12, engine v_brand.js): the top area for the business, the footage whole in the middle, contact and offers below
  { id: 'bo_frame', name: 'Brand Frame', file: 'brand', v: 'frame', fam: 'Brand overlays', bo: true, live: true, isNew: true, blurb: 'Your logo and tagline in the top area, the footage whole in the middle, phone, area and website below. Nothing covers the footage.' },
  { id: 'bo_headline', name: 'Headline Banner', file: 'brand', v: 'headline', fam: 'Brand overlays', bo: true, live: true, isNew: true, blurb: 'A promotional headline on top, the footage in the middle, your call-to-action button and contact line below.' },
  { id: 'bo_contact', name: 'Contact Bar', file: 'brand', v: 'contact', fam: 'Brand overlays', bo: true, live: true, isNew: true, blurb: 'A logo bar on top and a full contact block below: phone, address or area, website, hours and your button.' },
  { id: 'bo_message', name: 'Center Message', file: 'brand', v: 'message', fam: 'Brand overlays', bo: true, live: true, isNew: true, blurb: 'Logo on top, a message panel with your services over the lower edge of the footage, contact below.' },
  { id: 'bo_side', name: 'Side Banner', file: 'brand', v: 'side', fam: 'Brand overlays', bo: true, live: true, isNew: true, blurb: 'A brand ribbon down the side with your name and phone, the footage beside it, contact below.' },
  { id: 'bo_special', name: 'Daily Special', file: 'brand', v: 'special', fam: 'Brand overlays', bo: true, live: true, isNew: true, blurb: 'Logo on top, today’s special below with an optional price and how to order. Type the real special.' },
  { id: 'bo_offer', name: 'Offer Banner', file: 'brand', v: 'offer', fam: 'Brand overlays', bo: true, live: true, isNew: true, blurb: 'An offer headline on top, the offer you type and your call to action below. Off for brand kits that never run offers.' },
  { id: 'spot', name: 'Project Spotlight', file: 'v2', v: 'spot_villa', fam: 'Showcase', blurb: 'Five shots in a framed band, a label for each, a progress rail and an end card.' },
  { id: 'service', name: 'Service Ad', file: 'kin', v: 'kitchens', fam: 'Promo', blurb: 'Three slam words over a band of five shots, service tags, the logo build.' },
  { id: 'thisor', name: 'This or That', file: 'v2', v: 'thisor', fam: 'Engagement', blurb: 'Four rounds of A over B. Viewers comment their picks.' },
  { id: 'upgrade', name: 'Which Upgrade?', file: 'v2', v: 'upgrade', fam: 'Engagement', blurb: 'Four options one at a time, then a numbered grid to vote on.' },
  { id: 'expand', name: 'Frame Break', file: 'x', v: 'frame', fam: 'Showcase', blurb: 'A landscape shot in a frame breaks out into a full-screen vertical, three times.' },
  { id: 'stories', name: 'Stories', file: 'x', v: 'stories', fam: 'Social', blurb: 'Four vertical story frames with a poll, a sticker, a question box and a link.' },
  { id: 'signs', name: '5 Signs', file: 'n2', v: 'signs', fam: 'Social', blurb: 'Five colour cards, each flipping into its fix with a different transition.' },
  { id: 'listed', name: 'Listing Cards', file: 'n2', v: 'listed', fam: 'Social', blurb: 'Listing cards with photo carousels; the button turns into the CTA.' },
  { id: 'chat', name: 'Group Chat', file: 'n2', v: 'chat', fam: 'Story', blurb: 'A dramatized group chat where your footage arrives as video messages.' },
  { id: 'gallery', name: 'Gallery Wall', file: 'n1', v: 'gallery', fam: 'Story', blurb: 'A museum wall: the camera glides past framed projects to an empty frame.' },
  { id: 'trailer', name: 'Movie Trailer', file: 'n1', v: 'trailer', fam: 'Promo', blurb: 'Title cards, a montage that speeds up, a BUILT BY title and a billing block.' },
  { id: 'review', name: 'Client Review', file: 'edit', v: 'review', fam: 'Trust', blurb: 'A published review, word for word, over four shots on warm paper.' },
  { id: 'banner', name: 'Info Banner', file: 'nx', v: 'banner', fam: 'Banners & frames', blurb: 'A title band on top, the footage whole in the middle, an info bar with logo and contact below.' },
  { id: 'cinema', name: 'Widescreen', file: 'nx', v: 'cinema', fam: 'Banners & frames', blurb: 'A big serif title above, the footage whole, elegant captions below.' },
  { id: 'ticker', name: 'News Ticker', file: 'nx', v: 'ticker', fam: 'Banners & frames', blurb: 'A “just in” banner, the footage, a scrolling ticker of services and an info bar.' },
  { id: 'split', name: 'Split Stack', file: 'nx', v: 'split', fam: 'Banners & frames', blurb: 'Two landscape shots stacked with a bold band of text between them, two rounds.' },
  { id: 'lower3', name: 'Lower Third', file: 'nx', v: 'lower3', fam: 'Banners & frames', blurb: 'Full-screen vertical footage with lower thirds sliding in and a corner logo.' },
  { id: 'postcard', name: 'Postcard', file: 'nx', v: 'postcard', fam: 'Banners & frames', blurb: 'Paper, a serif title, a mounted photo with tape, a stamp and handwritten notes.' },
  { id: 'textfill', name: 'Footage in the Text', file: 'nx', v: 'textfill', fam: 'Motion & reveals', blurb: 'Giant words full of footage that open up into the full shot.' },
  { id: 'kinetic', name: 'Kinetic Type', file: 'nx', v: 'kinetic', fam: 'Motion & reveals', blurb: 'Slam words with rings and bars on the beat, then the footage and the headline.' },
  { id: 'shapes', name: 'Shape Reveal', file: 'nx', v: 'shapes', fam: 'Motion & reveals', blurb: 'Footage opens through a circle, angled panels and sliding bars.' },
  { id: 'wordswap', name: 'Word Swap', file: 'nx', v: 'wordswap', fam: 'Motion & reveals', blurb: '“We do ___”: the word and the footage roll through your services.' },
  { id: 'sting', name: 'Logo Sting', file: 'nx', v: 'sting', fam: 'Motion & reveals', blurb: 'A 6-second logo animation: rings, rays, the logo build and the tagline. Great as an intro block.' },
  { id: 'ba', name: 'Before & After', file: 'nx2', v: 'ba', fam: 'Engagement', blurb: 'A slider wipes between before and after footage shot from the same spot.', live: true },
  { id: 'top3', name: 'Top 3', file: 'nx2', v: 'top3', fam: 'Engagement', blurb: 'A 3-2-1 countdown, each with a shot and a line.' },
  { id: 'myth', name: 'Myth vs Fact', file: 'nx2', v: 'myth', fam: 'Engagement', blurb: 'The myth gets struck out, then the fact plays over your footage.' },
  { id: 'reveal', name: 'Wait For It', file: 'nx2', v: 'reveal', fam: 'Engagement', blurb: 'A 3-2-1 countdown, a flash and the big reveal.' },
  { id: 'process', name: 'How It Works', file: 'nx2', v: 'process', fam: 'Trust', blurb: 'Four steps on a blueprint rail, a shot and a line for each.' },
  { id: 'questions', name: '3 Questions', file: 'n2', v: 'questions', fam: 'Trust', blurb: 'Notepad pages: handwritten questions, typed answers, page tears.' },
  { id: 'drive', name: 'Service Ad II', file: 'kin', v: 'drive', fam: 'Promo', blurb: 'Two slam lines over five shots, service tags and the logo build.' },
  { id: 'team', name: 'One Team', file: 'kin', v: 'team', fam: 'Promo', blurb: 'Eight services, one slam word each, over eight shots. 30 seconds.' },
  { id: 'menu', name: 'Menu Board', file: 'nx2', v: 'menu', fam: 'Restaurant', ind: ['restaurant'], blurb: 'Three dishes with names, descriptions and optional prices, each with its shot.', live: true },
  { id: 'dish', name: 'Dish Reveal', file: 'nx2', v: 'dish', fam: 'Restaurant', ind: ['restaurant'], blurb: 'The dish name, full of footage, opens up into the shot.', live: true },
  { id: 'special', name: 'Chalkboard Special', file: 'nx2', v: 'special', fam: 'Restaurant', ind: ['restaurant'], blurb: 'A chalkboard, a handwritten special and a framed shot.', live: true },
  // holidays (one layout for every occasion; the occasion is chosen per clip)
  { id: 'hgreet', name: 'Holiday Greeting', file: 'hol', v: 'greet', fam: 'Holidays', hol: true, live: true, isNew: true, blurb: 'Your footage, the greeting written on in a festive script, decorations and falling snow, confetti or leaves, then your ending.' },
  { id: 'hspecial', name: 'Holiday Special', file: 'hol', v: 'special', fam: 'Holidays', hol: true, live: true, isNew: true, blurb: 'A holiday headline, your footage unwrapped from gift paper, the offer and your call to action.' },
  { id: 'hhours', name: 'Holiday Hours', file: 'hol', v: 'hours', fam: 'Holidays', hol: true, live: true, isNew: true, blurb: 'Your logo, the occasion and an hours card for the days around the holiday. No footage needed.' },
  { id: 'hcount', name: 'Holiday Countdown', file: 'hol', v: 'count', fam: 'Holidays', hol: true, live: true, isNew: true, blurb: 'Flip numbers count down to the holiday, then your footage and a call to action.' },
].concat(NX.FAM_TPLS || []);   // the industry families (nx-registry.js)
const POSTER_T = { bo_frame: 4.0, bo_headline: 4.0, bo_contact: 4.0, bo_message: 4.0, bo_side: 4.0, bo_special: 4.0, bo_offer: 4.0, wall: 6.0, pick: 5.0, dayinlife: 7.2, oneword: 5.0, pov: 1.8, notes: 6.0, numbers: 3.2, spotlight: 1.6, rate: 3.0, reply: 3.0, episode: 5.0, loop: 3.0, spot: 3.2, service: 5.6, thisor: 2.6, upgrade: 12.5, stories: 2.4, signs: 1.4, listed: 2.6, chat: 7.4, gallery: 9.0, trailer: 22.2, expand: 1.7, review: 4.5,
  banner: 4.0, lower3: 4.5, postcard: 3.4, split: 2.0, ticker: 4.0, cinema: 4.5, textfill: 1.0, kinetic: 6.0, sting: 3.5, shapes: 4.2, wordswap: 4.3, drive: 5.6, team: 4.0, questions: 9.0,
  ba: 3.8, top3: 9.0, process: 9.0, myth: 1.9, reveal: 5.0, menu: 2.5, dish: 1.2, special: 3.0, hgreet: 3.8, hspecial: 4.4, hhours: 3.4, hcount: 3.2 };
const NEWISH = new Set(['banner', 'cinema', 'ticker', 'split', 'lower3', 'postcard', 'textfill', 'kinetic', 'shapes', 'wordswap', 'sting', 'ba', 'top3', 'myth', 'reveal', 'process']);
NX.TPLS = TPLS;
const TPL = id => TPLS.find(t => t.id === id);
const posterT = id => { const t = TPL(id); return (t && t.posterT) || POSTER_T[id] || 1; };
NX.LIB.forEach(r => NX.addClip(Object.assign({ src: 'lib', brand: 'dpg' }, r)));

// ---------------------------------------------------------------- capabilities
const CAP = { db: null, assets: null, downloads: null, user: null, sample: null, uid: null };
const capsReady = (async () => {
  const use = n => (window.claude && claude.use ? claude.use(n).catch(() => null) : Promise.resolve(null));
  const [db, assets, downloads, user, sample] = await Promise.all(['db', 'assets', 'downloads', 'user', 'sample'].map(use));
  Object.assign(CAP, { db, assets, downloads, user, sample });
  if (user) { try { CAP.uid = await user.id(); } catch (e) {} }
})();

// ---------------------------------------------------------------- state
const S = { brands: [], brand: null, tpl: null, proj: null, pack: {}, fields: [], dur: 15, t: 0, playing: false, scan: {}, groupT: {}, selKey: null,
  projects: [], restored: new Set(), brandRestored: false, filter: 'All', q: '', view: 'home', step: 'foot', lookKey: '' };
const R = { busy: false, want: null, lock: false, slowTimer: 0 };
const KIT = { draft: null, t: 0 };
const B = () => KIT.draft || S.brand;
const toastEl = $('#toast'); let toastT = 0;
function toast(msg, ms) { toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (toastEl.hidden = true), ms || 4200); }
function newProject(tpl, o) {
  const p = { id: 'p' + uid8(), brand: S.brand.id, name: tpl.name + ' · ' + today(), tpl: tpl.id, text: {}, shot: {}, style: {}, createdAt: new Date().toISOString(), updatedAt: null, saved: false };
  if (tpl.hol) { p.hol = (o && o.hol) || NX.defaultHol(); p.name = HOL.THEMES[p.hol].name + ' ' + tpl.name.replace('Holiday ', '').toLowerCase() + ' · ' + today(); }
  if (o && o.style) p.style = clone(o.style);
  return p;
}

// ---------------------------------------------------------------- views
function setView(v) {
  if (S.view === 'work' && v !== 'work' && S.playing) pause();
  S.view = v; document.body.classList.remove('view-home', 'view-projects', 'view-footage', 'view-work'); document.body.classList.add('view-' + v);
  document.querySelectorAll('.nav [data-view]').forEach(b => { if (b.dataset.view === v) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  if (v === 'footage') refreshMeter();
  if (v === 'home') { buildSeason(); buildSig(); buildRecent(); buildIndustries(); }
  if (v !== 'work') window.scrollTo(0, 0);
  if (v === 'work') requestRender(S.t);
}
document.querySelectorAll('.nav [data-view]').forEach(b => (b.onclick = () => setView(b.dataset.view)));
$('#logoBtn').onclick = () => setView('home');
$('#homeBtn').onclick = () => { flush(); setView('home'); };
$('#navBrand').onclick = () => openKit();
$('#createBtn').onclick = () => { setView('home'); setTimeout(() => { $('#search').focus(); document.getElementById('secTpl').scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); };
$('#projNew').onclick = () => $('#createBtn').click();
$('#seeAll').onclick = () => setView('projects');
function paintTheme() { const dk = document.documentElement.dataset.theme === 'dark'; const b = $('#themeBtn'); b.textContent = ''; b.appendChild(svg(dk ? IC.sun : IC.moon)); b.setAttribute('aria-label', dk ? 'Switch to light' : 'Switch to dark'); }
$('#themeBtn').onclick = () => { const dk = document.documentElement.dataset.theme !== 'dark'; if (dk) document.documentElement.dataset.theme = 'dark'; else delete document.documentElement.dataset.theme; ls.set('nx.theme', dk ? 'dark' : 'light'); paintTheme(); };
paintTheme();

// ---------------------------------------------------------------- brands
const DPG_LOCK = ['phone', 'web', 'lic', 'cta'];
function mergeDPG(doc) {
  const b = clone(NX.DPG);
  if (doc) {
    for (const k of ['colors', 'fonts', 'services', 'billing', 'reviews', 'descriptor', 'copy']) if (doc[k] !== undefined) b[k] = clone(doc[k]);
    if (doc.contact) for (const k in doc.contact) if (!DPG_LOCK.includes(k)) b.contact[k] = doc.contact[k];
    if (doc.rules && typeof doc.rules.words === 'string') b.rules.words = doc.rules.words;
  }
  return b;
}
function normBrand(d) {
  const ind = NX.INDUSTRIES[d.industry] ? d.industry : 'general', base = NX.newBrand(d.name || 'Brand', ind);
  const b = Object.assign(base, clone(d));
  b.industry = ind; b.colors = Object.assign({ accent: '#FF6500', ink: '#0E0F12', paper: '#F3F1EC' }, d.colors || {});
  b.fonts = Object.assign({ sans: 'mont', serif: 'corm', display: 'bebas', script: 'caveat' }, d.fonts || {}); b.contact = Object.assign(base.contact, d.contact || {});
  b.rules = Object.assign({ superlatives: true, prices: false, stars: true, words: '' }, d.rules || {});
  ['services', 'billing', 'reviews'].forEach(k => { if (!Array.isArray(b[k])) b[k] = []; });
  b.logo = Object.assign({ asset: null, onDark: 'white', onLight: 'original' }, d.logo || {});
  delete b.builtin; delete b.dpgRules; delete b.parts;
  return b;
}
function storable(b) {
  const o = clone(b); if (o.logo) delete o.logo.url; if (o.mark) delete o.mark.url;
  if (b.builtin) { const keep = { id: 'dpg', colors: o.colors, fonts: o.fonts, services: o.services, billing: o.billing, reviews: o.reviews, descriptor: o.descriptor, copy: o.copy || {}, rules: { words: o.rules.words || '' }, contact: {} };
    for (const k in o.contact) if (!DPG_LOCK.includes(k)) keep.contact[k] = o.contact[k]; return keep; }
  return o;
}
const sig = b => { const o = storable(b); delete o.updatedAt; delete o.createdAt; return JSON.stringify(o); };
S.brands = [mergeDPG(null)]; S.brand = S.brands[0];
const indOf = b => NX.INDUSTRIES[b.industry] || NX.INDUSTRIES.general;
function initials(b) {
  const sh = (b.short || '').replace(/[^A-Za-z0-9&]/g, ''); if (sh && sh.length <= 3) return sh.toUpperCase();
  const w = (b.name || '?').split(/\s+/).filter(x => /[A-Za-z0-9]/.test(x)); return ((w[0] || '?')[0] + (w[1] ? w[1][0] : (w[0] || '').slice(1, 2))).toUpperCase();
}
function chip(b) { const c = el('span', 'bchip', initials(b)); c.style.background = b.colors.ink; c.style.color = NX.contrast(b.colors.accent, b.colors.ink) >= 2.2 ? b.colors.accent : b.colors.paper; return c; }
function paintBrand() {
  const b = B(), c = $('#brandChip'), k = chip(b); c.textContent = k.textContent; c.style.background = k.style.background; c.style.color = k.style.color;
  $('#brandName').textContent = b.name; $('#brandInd').textContent = indOf(b).label;
  const nm = b.builtin ? (b.short || b.name) : b.name;
  $('#heroTitle').innerHTML = 'What are we making for <em>' + esc(nm) + '</em> today?';
  $('#heroSub').textContent = 'Say what you want to promote, add your photos and clips, and pick one of three finished drafts. ' + (footageCount(b.id) ? footageCount(b.id) + ' photos and clips in the library.' : 'Drafts show branded placeholders until you add footage.');
}
const footageCount = id => { let n = 0; for (const r of CLIPS.values()) if (r.brand === id) n++; return n; };
const savedCount = id => S.projects.filter(p => (p.brand || 'dpg') === id).length;
const menu = $('#brandMenu'), brandBtn = $('#brandBtn');
function openMenu() {
  menu.textContent = ''; menu.appendChild(el('div', 'mh', 'Your brands'));
  for (const b of S.brands) {
    const it = el('button', 'mi'); it.type = 'button'; it.setAttribute('role', 'menuitemradio'); it.setAttribute('aria-checked', String(b.id === S.brand.id));
    it.appendChild(chip(b)); const bt = el('span', 'bt'); bt.appendChild(el('span', 'bn', b.name));
    bt.appendChild(el('span', 'ind', indOf(b).label + ' · ' + savedCount(b.id) + ' clips · ' + footageCount(b.id) + ' footage')); it.appendChild(bt);
    it.onclick = () => { closeMenu(); if (b.id !== S.brand.id) switchBrand(b.id); }; menu.appendChild(it);
  }
  menu.appendChild(el('hr'));
  const mk = (ico, title, sub, fn) => { const it = el('button', 'mi'); it.type = 'button'; it.setAttribute('role', 'menuitem'); const p = el('span', 'plus'); p.appendChild(svg(ico)); it.appendChild(p);
    const bt = el('span', 'bt'); bt.appendChild(el('span', 'bn', title)); bt.appendChild(el('span', 'ind', sub)); it.appendChild(bt); it.onclick = () => { closeMenu(); fn(); }; menu.appendChild(it); };
  mk(IC.brand, 'Edit brand kit', 'Logo, colours, fonts, contact, reviews', openKit);
  mk(IC.plus, 'Add a client', 'A new brand in under a minute', openWizard);
  const dk = document.documentElement.dataset.theme === 'dark'; mk(dk ? IC.sun : IC.moon, dk ? 'Light mode' : 'Dark mode', 'The studio’s look (not your clips)', () => $('#themeBtn').click());
  const r = brandBtn.getBoundingClientRect();
  menu.style.left = Math.max(12, Math.min(r.right - 330, innerWidth - 342)) + 'px'; menu.style.top = (r.bottom + 8) + 'px';
  menu.hidden = false; brandBtn.setAttribute('aria-expanded', 'true');
  const cur = menu.querySelector('[aria-checked="true"]') || menu.querySelector('.mi'); if (cur) cur.focus();
}
function closeMenu() { if (menu.hidden) return; menu.hidden = true; brandBtn.setAttribute('aria-expanded', 'false'); }
brandBtn.onclick = e => { e.stopPropagation(); menu.hidden ? openMenu() : closeMenu(); };
document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target)) closeMenu(); });
menu.addEventListener('keydown', e => {
  const items = [...menu.querySelectorAll('.mi')], i = items.indexOf(document.activeElement);
  if (e.key === 'Escape') { closeMenu(); brandBtn.focus(); }
  else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const n = items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]; if (n) n.focus(); }
});
async function switchBrand(id) {
  S.sector = null;
  const b = S.brands.find(x => x.id === id); if (!b) return;
  if (S.playing) pause();
  await stopThumbs(); R.lock = true; await waitIdle();
  S.brand = b;
  try { await NX.applyBrand(b); } catch (e) { console.error(e); toast('Part of this brand kit (logo or fonts) did not load.'); }
  S.lookKey = '';
  R.lock = false;
  THUMB.map = {}; THUMB.cover = {}; THUMB.pack = {}; THUMB.key = ''; THUMB.done = false;
  S.filter = 'All'; S.q = ''; S.packHol = null; $('#search').value = '';
  paintBrand(); buildIntents(); buildFilters(); buildGallery(); buildProjects(); buildFootage(); buildSeason(); buildSig(); buildIndustries(); buildRecent();
  ls.set('nx.brand', id);
  const last = lastFor(id);
  if (last) openProject(Object.assign(clone(last), { saved: true }), { stay: true }); else openProject(newProject(S.tpl && !S.tpl.hidden ? S.tpl : TPL('spot')), { stay: true });
  scheduleThumbs();
}
function lastFor(id) { const k = ls.get('nx.last.' + id); return (k && S.projects.find(p => p.id === k && (p.brand || 'dpg') === id)) || null; }
async function reapply() {
  R.lock = true; await waitIdle();
  try { await NX.applyBrand(B()); } catch (e) { console.error(e); }
  S.lookKey = ''; R.lock = false; paintBrand(); await syncLook(); refresh(true);
}

// ---------------------------------------------------------------- looks (colours, fonts, seasonal touch) per clip
const curLook = () => NX.lookFor(S.proj, S.tpl, B());
async function syncLook(force, internal) {   // push the open clip's look into the engine when it changed
  if (!S.proj || !S.tpl) return false; const L = curLook(), k = NX.lookKey(L) + '|' + S.tpl.id;
  if (!force && k === S.lookKey) return false;
  if (!internal) await stopThumbs();
  const wasLocked = R.lock; R.lock = true; await waitIdle();
  try { await NX.applyLook(L, S.tpl); } catch (e) { console.error(e); }
  S.lookKey = k; if (!wasLocked) R.lock = false; return true;
}
let styleT = 0;
function styleChanged(structural, keepUI) {   // keepUI: a colour picker or slider is being dragged, so leave the pane as it is
  markDirty(); clearTimeout(styleT);
  styleT = setTimeout(async () => { await syncLook(); refresh(true); scheduleThumbs(2500); if (S.step === 'style' && !keepUI) NX.styleUI($('#paneStyle'), NX.app); if (structural) { setTemplateAudio(); paintTools(); $('#projName').value = S.proj.name; } }, keepUI ? 140 : 60);
  if (S.step === 'style' && !keepUI) NX.styleUI($('#paneStyle'), NX.app);
}

// ---------------------------------------------------------------- variations: this clip's words, footage (and listing) in the other families of its industry
const VAR = { key: '', map: {}, busy: false };
const variantSibs = () => (S.tpl && S.tpl.sector ? TPLS.filter(t => t.sector === S.tpl.sector && t.id !== S.tpl.id && !t.hidden) : []);
async function variantThumbs(paint) {
  if (!S.proj || !variantSibs().length) return;
  const key = S.proj.id + '|' + S.tpl.id + '|' + JSON.stringify([S.proj.text, S.proj.shot, S.proj.listing || null]);
  if (VAR.key !== key) { VAR.key = key; VAR.map = {}; }
  for (const id in VAR.map) paint(id, VAR.map[id]);
  if (VAR.busy || variantSibs().every(t => VAR.map[t.id])) return; VAR.busy = true;
  try {
    for (const t of variantSibs()) {
      if (VAR.map[t.id]) continue;
      for (let k = 0; k < 40 && (R.busy || S.playing || EX.running); k++) await sleep(100);
      if (VAR.key !== key || S.step !== 'style' || S.view !== 'work') break;
      await stopThumbs(); R.lock = true; await waitIdle();
      try {
        const proj = { id: S.proj.id, listing: S.proj.listing, text: S.proj.text, shot: S.proj.shot, style: {} };
        await NX.applyLook(NX.lookFor(proj, t, S.brand), t); window.HOLFX = null; window.OVERLAY = null;
        const src = await renderOne(t, proj, posterT(t.id)); if (src && VAR.key === key) { VAR.map[t.id] = src; paint(t.id, src); }
      } finally { await syncLook(true, true); R.lock = false; }
    }
  } finally { VAR.busy = false; requestRender(S.t); }
}
function switchFamily(t) {   // same clip, another family: words and footage keys carry over; the look starts from the new family
  if (!S.proj || !t) return; const old = S.tpl;
  S.proj.tpl = t.id; S.proj.style = {};
  if (old && S.proj.name && S.proj.name.includes(old.name)) S.proj.name = S.proj.name.replace(old.name, t.name);
  openProject(S.proj, { step: 'style', t: Math.min(posterT(t.id), 30) }); markDirty();
  toast('Now in ' + t.name + '. Your words and footage came with it.');
}

// ---------------------------------------------------------------- template build
function packCopy(tplId, b) {
  const ind = indOf(b), src = b.builtin ? [b.copy && b.copy[tplId]] : [NX.NEUTRAL[tplId], ind.copy && ind.copy[tplId], b.copy && b.copy[tplId]];
  const o = Object.assign({}, ...src.filter(Boolean)); for (const k in o) o[k] = NX.fillTokens(o[k], b); return o;
}
function buildWith(tpl, proj, b) {
  const pack = packCopy(tpl.id, b);
  QS.set('v', tpl.v); PRM.text = Object.assign({}, pack, proj.text); PRM.shot = proj.shot || {}; PRM.tl = proj.tl || null; PRM.hol = tpl.hol ? (proj.hol || NX.defaultHol()) : null; FIELDS.length = 0;
  PRM.prop = null; PRM.photos = null; if (HOOK.prm) HOOK.prm(tpl, proj, b);   // listing facts and photos (real estate, nx-listing.js)
  STUDIO_REG[tpl.file]();
  for (const f of FIELDS) if (f.type === 'shot' && NX.isPh(f.def[0])) NX.phLabels[f.def[0]] = !f.label || /^(footage|shot|clip|video)$/i.test(f.label) ? (f.group || 'Shot') : f.label;
  return pack;
}
function build() {
  const keepDir = DIR;
  try { S.pack = buildWith(S.tpl, S.proj, B()); } catch (e) { DIR = keepDir; console.error(e); toast('This change could not be applied: ' + (e && e.message || e)); return false; }
  S.fields = FIELDS.slice();
  for (const f of S.fields) if (f.type !== 'shot') {
    const pv = S.pack[f.key], ok = pv !== undefined && (f.type !== 'select' || f.options.some(o => o.value === pv));
    f.eff = ok ? pv : f.def;
  }
  S.dur = DIR.dur; return true;
}
const shotVal = f => { const o = S.proj.shot[f.key]; return o && NX.meta(o.c) ? [o.c, +o.in] : f.def; };
const fieldVal = f => (f.type === 'shot' ? shotVal(f) : (S.proj.text[f.key] !== undefined ? S.proj.text[f.key] : f.eff));
const phSlots = () => S.fields.filter(f => f.type === 'shot' && NX.isPh(shotVal(f)[0]));
const reqLeft = () => S.fields.filter(f => f.type !== 'shot' && f.req && (f.type === 'prop' ? !(HOOK.propVal && String(HOOK.propVal(f.key) || '').trim()) : S.proj.text[f.key] === undefined));

// ---------------------------------------------------------------- rendering
const afterRender = [];
async function drawFrame(t) {
  t = clamp(t, 0, S.dur - 1 / 60);
  VID.beginCollect(); ctx = DRYCTX;
  try { renderSync(t); } finally { ctx = MAINCTX; }
  const keys = VID.endCollect();
  await VID.ensure(keys, FB.mode === 'play');
  renderSync(t); window.__df = (window.__df || 0) + 1;
  for (const f of afterRender) try { f(t); } catch (e) {}
}
function requestRender(t) { if (R.lock) return; R.want = t; if (!R.busy) pump(); }
async function pump() {
  R.busy = true; clearTimeout(R.slowTimer); R.slowTimer = setTimeout(() => showLoading(true), 450);
  while (R.want !== null) { const t = R.want; R.want = null; try { await drawFrame(t); $('#ph').hidden = true; } catch (e) { console.error(e); toast(String(e && e.message || e)); break; } }
  clearTimeout(R.slowTimer); showLoading(false); R.busy = false;
}
function showLoading(on, txt) { $('#loading').hidden = !on; if (txt) $('#loadingTxt').textContent = txt; else if (on) $('#loadingTxt').textContent = 'Loading footage…'; }
function waitIdle() { return new Promise(r => { const k = () => (R.busy ? setTimeout(k, 30) : r()); k(); }); }
afterRender.push(() => { if (KIT.draft) { const g = $('#kitCanvas').getContext('2d'); g.drawImage(C, 0, 0, 540, 960); } });

let scanTok = 0;
function scheduleScan() { const tok = ++scanTok; setTimeout(() => runScan(tok), 350); }
async function runScan(tok) {
  const slots = S.fields.filter(f => f.type === 'shot'), hits = {}; slots.forEach(f => (hits[f.key] = []));
  if (!slots.length) { S.scan = {}; S.groupT = {}; drawTimeline(); return; }
  const vals = slots.map(f => [f, shotVal(f)]), step = 0.1, dur = S.dur;
  for (let t = 0, n = 0; t < dur - 1e-6; t += step, n++) {
    if (tok !== scanTok) return;
    VID.beginCollect(); ctx = DRYCTX; try { renderSync(t); } catch (e) {} finally { ctx = MAINCTX; }
    const keys = VID.endCollect();
    for (const k of keys) { const [c, , i] = k.split('/'), ts = +i / 30;
      for (const [f, v] of vals) if (v[0] === c && ts >= v[1] - 0.08 && ts <= v[1] + (f.d || 3) + 1.4) hits[f.key].push(t); }
    if (n % 25 === 24) await new Promise(r => setTimeout(r, 0));
  }
  if (tok !== scanTok) return;
  const scan = {};
  for (const k in hits) { const ts = [...new Set(hits[k].map(x => Math.round(x * 10)))].sort((a, b) => a - b), iv = [];
    for (const x of ts) { const last = iv[iv.length - 1]; if (last && x - last[1] <= 1) last[1] = x; else iv.push([x, x]); }
    scan[k] = iv.map(([a, b]) => [a / 10, (b + 1) / 10]); }
  S.scan = scan; S.groupT = {};
  for (const f of slots) { const iv = scan[f.key]; if (iv && iv.length && (S.groupT[f.group] === undefined || iv[0][0] < S.groupT[f.group])) S.groupT[f.group] = iv[0][0]; }
  drawTimeline(); refreshSeekButtons();
}

// ---------------------------------------------------------------- transport + playback
const audio = new Audio(); audio.preload = 'auto'; let audioOk = true, clock0 = 0, muted = false;
const HOOK = { audioSrc: p => { const t = TPL(p.tpl); return t && t.hol ? 'audio/hol_' + t.v + '_' + (p.hol || NX.defaultHol()) + '.mp4' : 'audio/' + p.tpl + '.mp4'; } };
function setTemplateAudio() { const src = HOOK.audioSrc(S.proj); if (src) { if (audio.getAttribute('src') !== src) audio.src = src; } else audio.removeAttribute('src'); audio.muted = muted; }
function setT(t, render) { S.t = clamp(t, 0, S.dur); updateTransport(); if (render !== false) requestRender(S.t); }
function updateTransport() {
  const u = S.dur ? S.t / S.dur : 0;
  $('#tc').innerHTML = '<b>' + fmtT(S.t) + '</b> / ' + fmtT(S.dur);
  $('#tlFill').style.width = (u * 100) + '%'; $('#tlHead').style.left = (u * 100) + '%';
  const sc = $('#scrub'); if (document.activeElement !== sc) sc.value = S.t;
  for (const f of onTime) try { f(S.t); } catch (e) {}
}
const onTime = [];
async function play() {
  if (S.playing || R.lock) return;
  if (S.t >= S.dur - 0.05) S.t = 0;
  S.playing = true; FB.setMode('play'); setPlayIcon();
  try { if (!audio.getAttribute('src')) throw 0; audio.currentTime = S.t; await audio.play(); audioOk = true; } catch (e) { audioOk = false; }
  clock0 = performance.now() - S.t * 1000; requestAnimationFrame(loop);
}
function pause() { if (!S.playing) return; S.playing = false; audio.pause(); FB.setMode('seek'); setPlayIcon(); requestRender(S.t); }
function loop() {
  if (!S.playing) return;
  let t = audioOk && !audio.paused ? audio.currentTime : (performance.now() - clock0) / 1000;
  if (t >= S.dur - 1 / 30) { S.t = S.dur - 1 / 30; pause(); updateTransport(); return; }
  S.t = t; updateTransport(); if (!R.busy) requestRender(t);
  requestAnimationFrame(loop);
}
function setPlayIcon() { $('#playIco').setAttribute('d', S.playing ? 'M4 2.5h3v11H4zM9 2.5h3v11H9z' : 'M4 2.5v11l9-5.5z'); $('#playBtn').setAttribute('aria-label', S.playing ? 'Pause' : 'Play'); }
$('#playBtn').onclick = () => (S.playing ? pause() : play());
$('#scrub').oninput = e => { if (S.playing) pause(); setT(+e.target.value); };
$('#muteBtn').onclick = e => { const b = e.currentTarget; muted = !muted; audio.muted = muted; b.querySelector('span').textContent = muted ? 'Muted' : 'Sound'; b.setAttribute('aria-pressed', String(muted)); };
$('#safeBtn').onclick = e => { const on = $('#safe').hidden; $('#safe').hidden = !on; e.currentTarget.setAttribute('aria-pressed', String(on)); };
const anyModal = () => [...document.querySelectorAll('.modal')].some(m => !m.hidden);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { const m = [...document.querySelectorAll('.modal')].find(x => !x.hidden); if (m) { const c = m.querySelector('[id$="Close"], [id$="Cancel"]'); if (c && !c.hidden) c.click(); return; } }
  if (e.target.closest('input, textarea, select, [contenteditable]') || anyModal() || S.view !== 'work') return;
  if (e.defaultPrevented) return;
  if (e.code === 'Space') { e.preventDefault(); S.playing ? pause() : play(); }
  else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); if (S.playing) pause(); setT(S.t + (e.key === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 1 : 1 / 30)); }
});
function drawTimeline() {
  const box = $('#tlShots'); box.textContent = '';
  for (const f of S.fields.filter(x => x.type === 'shot')) for (const [a, b] of (S.scan[f.key] || [])) {
    const d = el('button', 'tl-shot'); d.style.left = (a / S.dur * 100) + '%'; d.style.width = Math.max(0.4, (b - a) / S.dur * 100) + '%';
    d.title = f.group + ' · ' + f.label + ' (' + fmtT(a) + ')'; d.setAttribute('aria-label', d.title); d.dataset.key = f.key;
    if (NX.isPh(shotVal(f)[0])) d.classList.add('ph');
    if (f.key === S.selKey) d.classList.add('sel');
    d.onclick = () => { if (S.playing) pause(); setT(a + 0.05); if (S.step !== 'foot') goStep('foot'); selectSlot(f.key, true); };
    box.appendChild(d);
  }
}

// ---------------------------------------------------------------- copy check: the brand's ad rules, soft warnings on edited lines
function lintFor(b) {
  const L = [], r = b.rules || {};
  if (r.superlatives !== false) L.push([/(^|[^a-z])(best|number one|no\.\s?1|top[- ]rated|#\s?1|cheapest|lowest price)([^a-z]|$)/i, 'Skip superlatives like “best” or “#1”.' + (b.dpgRules ? ' Stick to DPG’s published facts.' : '')]);
  if (r.prices) L.push([/\$|\b(price|prices|pricing|cost|costs|discount|financing|finance|monthly payments?|% off)\b/i, 'Leave out prices, discounts and financing.']);
  if (r.stars !== false) L.push([/★|\b(\d|five|four)[- ]?stars?\b/i, 'No star ratings in ads.']);
  if (b.dpgRules) {
    L.push([/\bpools?\b(?!\s*decks?)/i, 'DPG builds pool decks, not pools. Say “pool deck”.']);
    L.push([/\b(lighting|lights)\b/i, 'Lighting isn’t one of DPG’s listed services, so don’t present it as one.']);
    L.push([/\b(fire ?pits?|fireplaces?|fire (bowls?|tables?|features?))\b/i, 'Fire features aren’t a listed DPG service, so don’t present them as one.']);
    L.push([/\blawns?\b/i, 'Lawns appear in ads only as synthetic lawns.', s => /synthetic/i.test(s)]);
  }
  for (const w of String(r.words || '').split(',').map(x => x.trim()).filter(Boolean)) {
    const e2 = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); L.push([new RegExp('(^|[^a-z])' + e2 + '([^a-z]|$)', 'i'), '“' + w + '” is on this brand’s list of words to avoid.']);
  }
  return s => { const out = []; for (const [re, msg, ok] of L) if (re.test(s) && !(ok && ok(s))) out.push(msg); return out; };
}
let lint = lintFor(S.brand);

// ---------------------------------------------------------------- workspace: steps, footage pane, words pane
const PROP_STEP = { k: 'prop', label: 'Listing', ico: IC.home, title: 'The listing', help: 'One set of property details and photos feeds every campaign for this listing. Leave a detail empty and it stays off the video.' };
const STEPS0 = [
  { k: 'foot', label: 'Footage', ico: IC.foot, title: 'Add your footage', help: 'Every shot slot in this template. Landscape footage is always shown whole.' },
  { k: 'text', label: 'Words', ico: IC.text, title: 'Make the words yours', help: 'Every line in the clip, scene by scene. Tap ▸ to jump to it.' },
  { k: 'style', label: 'Style', ico: IC.style, title: 'Pick a look', help: 'Colours, fonts and seasonal touches for this clip only. The brand kit stays as it is.' },
];
const usesListing = () => !!(S.tpl && S.tpl.sector === 'estate');
const stepsNow = () => (usesListing() ? [PROP_STEP].concat(STEPS0) : STEPS0);
const PANE = { foot: '#paneFoot', text: '#paneText', style: '#paneStyle', prop: '#paneProp' };
function paintTools() {
  const box = $('#tools'); box.textContent = '';
  const nShots = S.fields.filter(f => f.type === 'shot').length, ph = phSlots().length, req = reqLeft().filter(f => f.type !== 'prop').length, rp = reqLeft().filter(f => f.type === 'prop').length;
  stepsNow().forEach((st, i) => {
    const b = el('button', 'tool-b'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(S.step === st.k)); b.dataset.k = st.k;
    b.appendChild(svg(st.ico)); b.appendChild(el('span', '', st.label));
    const badge = st.k === 'foot' ? (nShots ? (ph ? String(ph) : '✓') : '') : st.k === 'text' ? (req ? String(req) : '') : st.k === 'prop' ? (rp ? String(rp) : '✓') : '';
    if (badge) { const d = el('span', 'dot' + (badge === '✓' ? ' ok' : ''), badge); d.title = badge === '✓' ? (st.k === 'prop' ? 'The details this video needs are in' : 'All shots have footage') : st.k === 'foot' ? badge + ' shots need footage' : st.k === 'prop' ? badge + ' listing details needed' : badge + ' lines to fill in'; b.appendChild(d); }
    b.onclick = () => goStep(st.k); box.appendChild(b);
  });
  box.appendChild(el('div', 'sep'));
  if (CAP.sample) { const b = el('button', 'tool-b'); b.type = 'button'; b.appendChild(svg(IC.ai)); b.appendChild(el('span', '', 'AI write')); b.onclick = () => NX.ai && NX.ai.open({}); box.appendChild(b); }
  const bk = el('button', 'tool-b'); bk.type = 'button'; bk.appendChild(svg(IC.brand)); bk.appendChild(el('span', '', 'Brand')); bk.onclick = openKit; box.appendChild(bk);
}
function goStep(k) {
  const SN = stepsNow(); if (!SN.some(s => s.k === k)) k = SN[0].k;
  S.step = k; const i = SN.findIndex(s => s.k === k), st = SN[i];
  Object.entries(PANE).forEach(([x, sel]) => { const p = $(sel); if (p) p.hidden = x !== k; });
  $('#stepNo').textContent = 'Step ' + (i + 1) + ' of ' + SN.length; $('#inspTitle').textContent = st.title;
  $('#inspMeta').textContent = k === 'foot' && !S.fields.some(f => f.type === 'shot') ? 'This template doesn’t use footage. Skip to the words.' : st.help;
  $('#prevStep').hidden = i === 0; $('#nextStep').textContent = i === SN.length - 1 ? 'Export' : 'Next: ' + SN[i + 1].label;
  if (k === 'prop' && HOOK.listingPane) HOOK.listingPane($('#paneProp'));
  $('#footNote').textContent = S.tpl ? S.tpl.name + ' · ' + fmtT(S.dur).replace(/\.0$/, '') : '';
  if (k === 'style') NX.styleUI($('#paneStyle'), NX.app);
  paintTools(); $('#inspBody').scrollTop = 0;
  if (innerWidth <= 1100 && S.view === 'work') { const top = $('#insp').getBoundingClientRect().top + scrollY - 70; if (scrollY > top) window.scrollTo({ top, behavior: 'smooth' }); }
}
$('#nextStep').onclick = () => { const SN = stepsNow(), i = SN.findIndex(s => s.k === S.step); if (i === SN.length - 1) startExport(false); else goStep(SN[i + 1].k); };
$('#prevStep').onclick = () => { const SN = stepsNow(), i = SN.findIndex(s => s.k === S.step); if (i > 0) goStep(SN[i - 1].k); };
function groupsOf(filter) { const m = new Map(); for (const f of S.fields) { if (!filter(f)) continue; const g = f.group || 'Copy'; if (!m.has(g)) m.set(g, []); m.get(g).push(f); } return m; }
function buildInspector() {
  lint = lintFor(B());
  const box = $('#groups'), sl = $('#slots'); box.textContent = ''; sl.textContent = '';
  for (const [g, fs] of groupsOf(f => f.type !== 'shot' && f.type !== 'prop')) {
    const card = el('section', 'grp'); card.dataset.group = g;
    const hd = el('header'); hd.appendChild(el('h3', '', g)); const acts = el('div', 'gacts');
    if (CAP.sample && fs.some(f => f.type === 'text')) { const ai = el('button', 'gai', '✦ Rewrite'); ai.type = 'button'; ai.title = 'Rewrite these lines with AI'; ai.onclick = () => NX.ai && NX.ai.open({ group: g }); acts.appendChild(ai); }
    const sk = el('button', 'seek'); sk.type = 'button'; sk.hidden = true; sk.dataset.group = g; acts.appendChild(sk); hd.appendChild(acts); card.appendChild(hd);
    for (const f of fs) card.appendChild(fieldRow(f));
    box.appendChild(card);
  }
  const shotGroups = groupsOf(f => f.type === 'shot');
  if (!shotGroups.size) { const p = el('div', 'banner ok'); p.appendChild(el('span', '', 'No footage needed for this template.')); const b = el('button', 'btn sm', 'Go to the words'); b.type = 'button'; b.onclick = () => goStep('text'); p.appendChild(b); sl.appendChild(p); }
  for (const [g, fs] of shotGroups) {
    const card = el('section', 'grp'); card.dataset.group = g;
    const hd = el('header'); hd.appendChild(el('h3', '', g)); const acts = el('div', 'gacts'); const sk = el('button', 'seek'); sk.type = 'button'; sk.hidden = true; sk.dataset.group = g; acts.appendChild(sk); hd.appendChild(acts); card.appendChild(hd);
    for (const f of fs) card.appendChild(slotRow(f));
    sl.appendChild(card);
  }
  refreshSeekButtons(); paintBanner();
  $('#aiBtn').hidden = !CAP.sample || !S.fields.some(f => f.type === 'text');
  if (S.step === 'prop' && HOOK.listingPane) HOOK.listingPane($('#paneProp'));
  paintTools();
}
function paintBanner() {
  const box = $('#banner'); box.textContent = ''; paintTools();
  const n = S.fields.filter(f => f.type === 'shot').length; if (!n) return;
  const ph = phSlots(), have = NX.brandClips().length, d = el('div', 'banner' + (ph.length ? '' : ' ok')), p = el('span');
  if (!ph.length) { p.appendChild(el('b', '', 'All ' + n + ' shots have footage.')); p.appendChild(document.createTextNode(' Tap any shot to change it.')); d.appendChild(p); const b = el('button', 'btn sm', 'Next: Words'); b.type = 'button'; b.onclick = () => goStep('text'); d.appendChild(b); box.appendChild(d); return; }
  if (have) { p.appendChild(el('b', '', ph.length + ' of ' + n + ' shots')); p.appendChild(document.createTextNode(' still show placeholders.')); }
  else { p.appendChild(el('b', '', 'No footage for ' + B().name + ' yet.')); p.appendChild(document.createTextNode(' Shots show branded placeholders until you add some.')); }
  d.appendChild(p);
  const bt = el('button', 'btn sm dark', have ? 'Fill with my footage' : 'Add footage'); bt.type = 'button'; bt.onclick = () => (have ? autoFill() : pickFiles()); d.appendChild(bt);
  box.appendChild(d);
}
function autoFill() {
  const pool = NX.brandClips().sort((a, b) => String(a.addedAt || '').localeCompare(String(b.addedAt || ''))); if (!pool.length) return;
  const by = { vert: pool.filter(r => r.kind === 'vert'), land: pool.filter(r => r.kind === 'land') }, used = {}, miss = new Set(); let n = 0;
  for (const f of phSlots()) {
    const want = f.kind === 'vert' || f.kind === 'land' ? f.kind : null, list = want ? by[want] : pool;
    if (!list.length) { miss.add(want); continue; }
    const r = list[n % list.length], k = used[r.id] = (used[r.id] || 0) + 1, d = f.d || 2, room = Math.max(0, r.dur - d - 0.1);
    S.proj.shot[f.key] = { c: r.id, in: Math.round((room > 0 ? ((k - 1) * 2.3) % room : 0) * 1000) / 1000 }; n++;
  }
  if (n) { edited(true); toast('Filled ' + n + ' shot' + (n > 1 ? 's' : '') + ' with ' + B().name + ' footage. Change any of them below.'); }
  if (miss.size) toast((n ? 'Some shots need ' : 'These shots need ') + [...miss].map(k => (k === 'vert' ? 'vertical 9:16' : 'landscape')).join(' and ') + ' footage, and there isn’t any yet.', 6000);
}
function refreshSeekButtons() {
  document.querySelectorAll('#insp .seek').forEach(b => { const g = b.dataset.group; let t = S.groupT[g];
    if (t === undefined) t = /ending|end card/i.test(g) ? Math.max(0, S.dur - 2.2) : /opening|title|headline|header|the chat|greeting|top|countdown|hours/i.test(g) ? 0.6 : undefined;
    b.hidden = t === undefined; if (t !== undefined) { b.textContent = '▸ ' + fmtT(t); b.title = 'Jump to ' + g; b.onclick = () => { if (S.playing) pause(); setT(t + 0.05); }; } });
}
function fieldRow(f) {
  const w = el('div', 'fld'), id = 'f-' + f.key, lab = el('label'); lab.htmlFor = id; lab.appendChild(document.createTextNode(f.label));
  const cnt = el('span', 'cnt'); lab.appendChild(cnt); w.appendChild(lab);
  let inp;
  if (f.type === 'select') { inp = el('select'); f.options.forEach(o => { const op = el('option', '', o.label); op.value = o.value; inp.appendChild(op); }); inp.value = fieldVal(f); }
  else if (f.multiline) { inp = el('textarea'); inp.value = fieldVal(f); inp.rows = 3; inp.spellcheck = true; }
  else { inp = el('input'); inp.type = 'text'; inp.value = fieldVal(f); inp.autocomplete = 'off'; inp.spellcheck = true; if (f.upper) inp.classList.add('up'); }
  inp.id = id; inp.dataset.key = f.key; w.appendChild(inp);
  if (f.hint) w.appendChild(el('p', 'hint', f.hint));
  const rq = el('p', 'warn', 'Sample text: change it to your real details.'); rq.hidden = true; w.appendChild(rq);
  const warn = el('p', 'warn'); warn.hidden = true; w.appendChild(warn);
  const row2 = el('div', 'row2'), rs = el('button', 'reset', 'Use the template’s text'); rs.type = 'button'; row2.appendChild(rs); w.appendChild(row2);
  const cur = () => S.fields.find(x => x.key === f.key) || f;
  const sync = () => {
    const v = inp.value, ov = S.proj.text[f.key] !== undefined, mx = cur().max;
    if (mx && f.type !== 'select') { cnt.textContent = v.length + ' / ' + mx; cnt.classList.toggle('over', v.length > mx); } else cnt.textContent = '';
    const ws = f.type !== 'select' && (ov || !B().builtin) ? lint(v) : []; warn.hidden = !ws.length; warn.textContent = ws.join(' ');
    row2.hidden = !ov; const need = f.req && !ov; rq.hidden = !need; w.classList.toggle('req', need);
  };
  inp.addEventListener('input', () => {
    const v = inp.value, e = cur().eff;
    if (f.type === 'select' ? v === e : (v.trim() === '' || v === e)) delete S.proj.text[f.key]; else S.proj.text[f.key] = v;
    sync(); edited(); if (f.req) paintTools();
  });
  if (f.type === 'select') inp.addEventListener('change', () => inp.dispatchEvent(new Event('input')));
  inp.addEventListener('blur', () => { if (f.type !== 'select' && inp.value.trim() === '') { inp.value = cur().eff; sync(); } });
  rs.onclick = () => { delete S.proj.text[f.key]; edited(); inp.value = cur().eff; sync(); };
  w._sync = sync; w._f = f; w._inp = inp; sync();
  return w;
}
function slotRow(f) {
  const w = el('div', 'slot'); w.dataset.key = f.key;
  const th = el('div', 'th'), cv = el('canvas'); th.appendChild(cv); w.appendChild(th);
  const si = el('div', 'si'); w.appendChild(si);
  const b = el('button', 'btn sm', 'Change'); b.type = 'button'; w.appendChild(b);
  b.onclick = () => openPicker(f.key); th.onclick = () => { const iv = (S.scan[f.key] || [])[0]; if (iv) { if (S.playing) pause(); setT(iv[0] + 0.05); } selectSlot(f.key); };
  w._paint = () => {
    const nf = S.fields.find(x => x.key === f.key) || f, v = shotVal(nf), ph = NX.isPh(v[0]), row = CLIPS.get(v[0]);
    const vert = ph ? v[0].startsWith('phv:') : row && row.kind === 'vert';
    w.classList.toggle('ph', ph); b.textContent = ph ? 'Add footage' : 'Change'; b.classList.toggle('dark', ph); b.setAttribute('aria-label', (ph ? 'Add footage: ' : 'Change footage: ') + nf.group + ', ' + nf.label);
    si.textContent = ''; si.appendChild(el('b', '', nf.label));
    if (ph) si.appendChild(el('span', '', 'Needs ' + (vert ? 'vertical 9:16' : nf.kind === 'land' ? 'landscape 16:9' : 'landscape or vertical') + ' footage · ' + (nf.d || 0).toFixed(1) + ' s'));
    else { si.appendChild(el('span', '', (row ? row.name : v[0]) + ' · from ' + sec(v[1]) + ' · uses ' + (nf.d || 0).toFixed(1) + ' s'));
      const issue = runwayIssue(v[0], v[1], nf.d || 0); if (issue) si.appendChild(el('em', '', issue)); }
    cv.width = vert ? 50 : 152; cv.height = 88; cv.style.width = vert ? '25px' : '76px'; cv.style.height = '44px';
    FB.draw(v[0], v[1] + 0.2, cv, 'h').catch(() => {});
  };
  w._paint();
  return w;
}
function runwayIssue(c, inn, d) {
  const m = META[c]; if (!m || !d) return '';
  const dur = m.n / 30; if (inn + d > dur + 0.05) return 'The clip ends ' + (inn + d - dur).toFixed(1) + ' s early; its last frame will hold.';
  const f0 = Math.round((inn + 0.04) * 30); let seg = m.segs[0]; for (const g of m.segs) if (f0 >= g[0] && f0 <= g[1]) seg = g;
  const end = (seg[1] + 1) / 30; if (inn + d > end + 0.05 && end < dur - 0.05) return 'There’s a cut in the clip at ' + sec(end) + '; the shot holds there.';
  return '';
}
function selectSlot(key, scroll) {
  S.selKey = key;
  document.querySelectorAll('.slot').forEach(s => s.classList.toggle('sel', s.dataset.key === key));
  document.querySelectorAll('.tl-shot').forEach(s => s.classList.toggle('sel', s.dataset.key === key));
  const s = document.querySelector('.slot[data-key="' + key + '"]');
  if (s && scroll) { s.scrollIntoView({ block: 'center', behavior: 'smooth' }); const g = s.closest('.grp'); if (g) { g.classList.remove('flash'); void g.offsetWidth; g.classList.add('flash'); } }
}
let rebuildT = 0, pendStruct = false;
function edited(structural) { markDirty(); refresh(structural); }
function refresh(structural) {
  pendStruct = pendStruct || !!structural; clearTimeout(rebuildT);
  rebuildT = setTimeout(() => {
    const st = pendStruct; pendStruct = false;
    if (!S.proj || !build()) return;
    syncInspector(st);
    requestRender(S.t); scheduleScan();
    for (const f of onRebuild) try { f(st); } catch (e) { console.error(e); }
  }, pendStruct ? 0 : 110);
}
const onRebuild = [];
function syncInspector(slots) {
  lint = lintFor(B());
  document.querySelectorAll('#groups .fld').forEach(w => { if (!w._f) return; const nf = S.fields.find(x => x.key === w._f.key); if (!nf) return; w._f = nf;
    if (S.proj.text[nf.key] === undefined && document.activeElement !== w._inp) w._inp.value = nf.eff;
    else if (S.proj.text[nf.key] !== undefined && document.activeElement !== w._inp) w._inp.value = S.proj.text[nf.key];
    w._sync(); });
  if (slots) { document.querySelectorAll('#slots .slot').forEach(w => w._paint()); paintBanner(); }
  const keys = S.fields.map(f => f.key).join(','); if (keys !== syncInspector._keys) { syncInspector._keys = keys; buildInspector(); }
}

// ---------------------------------------------------------------- open / switch
function openProject(p, opts) {
  opts = opts || {};
  if (S.playing) pause();
  const tpl = TPL(p.tpl); if (!tpl) { toast('That clip uses a template this studio doesn’t have yet.'); return; }
  if (!p.brand) p.brand = S.brand.id;
  if (!p.shot) p.shot = {}; if (!p.text) p.text = {}; if (!p.style) p.style = {};
  if (tpl.hol && !HOL.THEMES[p.hol]) p.hol = NX.defaultHol();
  const tplChanged = !S.tpl || S.tpl.id !== tpl.id;
  S.tpl = tpl; S.proj = p; S.selKey = null; S.scan = {}; S.groupT = {};
  if (tplChanged) VID.clear();
  if (!build()) return;
  syncInspector._keys = S.fields.map(f => f.key).join(',');
  $('#projName').value = p.name; $('#tplChip').textContent = tpl.name + ' · ' + fmtT(S.dur).replace(/\.0$/, '');
  $('#scrub').max = S.dur;
  const pv = posterFor(tpl.id, p.hol); $('#ph').hidden = !pv; if (pv) $('#ph').src = pv;
  setTemplateAudio(); buildInspector(); drawTimeline(); markCurrent();
  setSave(p.saved ? 'Saved' : 'Not saved yet', false, 'Change any line, shot or style and the clip saves to Projects.', p.saved);
  const tt = opts.t !== undefined ? opts.t : Math.min(S.dur - 0.1, posterT(tpl.id)); S.t = tt; updateTransport();
  goStep(opts.step || (usesListing() && (reqLeft().some(f => f.type === 'prop') || !p.saved) ? 'prop' : S.fields.some(f => f.type === 'shot') && (phSlots().length || !p.saved) ? 'foot' : 'text'));
  syncLook().then(changed => { if (S.proj !== p) return; if (changed) refresh(true); else requestRender(S.t); });
  scheduleScan(); prefetchFootage();
  ls.set('nx.last.' + S.brand.id, p.id);
  if (!opts.stay) setView('work');
  for (const f of onOpen) try { f(p); } catch (e) { console.error(e); }
}
const onOpen = [];
async function prefetchFootage() {
  const ids = [...new Set(S.fields.filter(f => f.type === 'shot').map(f => shotVal(f)[0]))].filter(id => CLIPS.has(id));
  let done = 0; const tok = S.proj.id;
  const upd = () => { if (S.proj.id !== tok) return; if (done < ids.length) showLoading(true, 'Loading footage ' + (done + 1) + ' of ' + ids.length + '…'); else if (!R.busy) showLoading(false); };
  upd(); await Promise.all(ids.map(id => FB.open(id).catch(() => {}).then(() => { done++; upd(); })));
}

// ---------------------------------------------------------------- home: intents, seasonal packs, recent clips, gallery
const THUMB = { key: '', map: {}, cover: {}, pack: {}, tok: 0, t: 0, wantPack: null };
const posterFor = (id, hol) => { const t = TPL(id); if (!t || t.hidden) return ''; if (t.hol && hol && THUMB.cover[hol] && id === 'hgreet') return THUMB.cover[hol]; return S.brand.builtin && !t.live ? 'posters/' + id + '.jpg' : THUMB.map[id] || ''; };
const posterOf = p => (HOOK.poster && HOOK.poster(p)) || posterFor(p.tpl, p.hol);
const FAM_ORDER = ['Signature', 'Websites', 'Pixel', 'Brand overlays', 'Showcase', 'Banners & frames', 'Motion & reveals', 'Holidays', 'Promo', 'Engagement', 'Social', 'Story', 'Trust', 'Restaurant', 'Real estate', 'Home services', 'Beauty', 'Automotive', 'Events', 'Retail', 'Professional'];
const FAMS = () => ['All'].concat(FAM_ORDER.filter(f => TPLS.some(t => !t.hidden && t.fam === f)));
function buildIntents() {
  const box = $('#intents'); box.textContent = ''; const ind = B().industry;
  const list = [['show', 'Show off a project', 'Showcase'], ['promo', 'Promote a service', 'Promo'], ['hol', 'Holiday post', 'Holidays'], ['trust', 'Build trust', 'Trust'], ['eng', 'Get comments', 'Engagement']];
  if (ind === 'restaurant') list.splice(0, 0, ['food', 'Menu & specials', 'Restaurant']);
  if (ind === 'realestate') list.splice(0, 2, ['home', 'New listing', 'Real estate'], ['promo', 'Open house & updates', 'Real estate']);
  const sc = NX.SECTORS.find(x => x.ind.includes(ind)); if (sc && !['food', 'estate'].includes(sc.id) && TPLS.some(t => t.sector === sc.id)) list.splice(0, 0, ['show', sc.short + ' styles', sc.fam]);
  for (const [ic, label, fam] of list) { const b = el('button', 'intent'); b.type = 'button'; const i = el('i'); i.appendChild(svg(IC[ic])); b.appendChild(i); b.appendChild(document.createTextNode(label));
    b.onclick = () => { S.filter = fam; S.q = ''; $('#search').value = ''; buildFilters(); buildGallery(); $('#secTpl').scrollIntoView({ behavior: 'smooth', block: 'start' }); }; box.appendChild(b); }
  const bl = el('button', 'intent'); bl.type = 'button'; const i = el('i'); i.appendChild(svg(IC.blank)); bl.appendChild(i); bl.appendChild(document.createTextNode('Start from scratch'));
  bl.onclick = () => { const n = $('#newEditBtn'); if (n.onclick) n.onclick(); else toast('The timeline editor is still loading.'); }; box.appendChild(bl);
  for (const fn of HOOK.intents || []) try { fn(box); } catch (e) { console.warn(e); }
}
// industries: sector tabs, one card per creative family (its live thumbnail, or its palette and display font until that renders)
const brandSector = b => NX.sectorOfInd((b || B()).industry) || null;
function buildIndustries() {
  const tabs = $('#indTabs'), row = $('#famRow'); if (!tabs || !row) return; tabs.textContent = ''; row.textContent = '';
  const mine = brandSector(); if (!S.sector || !NX.SECTORS.some(x => x.id === S.sector)) S.sector = mine || 'food';
  for (const sc of NX.SECTORS) { const n = TPLS.filter(t => t.sector === sc.id && !t.hidden).length; if (!n) continue;
    const b = el('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(S.sector === sc.id)); b.setAttribute('aria-pressed', String(S.sector === sc.id)); b.appendChild(document.createTextNode(sc.short + (sc.id === mine ? ' · yours' : ''))); b.appendChild(el('small', '', String(n)));
    b.onclick = () => { S.sector = sc.id; buildIndustries(); scheduleThumbs(80); }; tabs.appendChild(b); }
  const sc = NX.SECTORS.find(x => x.id === S.sector); $('#indSub').textContent = sc ? sc.blurb : '';
  $('#indHead').textContent = mine === S.sector ? 'Made for ' + (B().builtin ? 'your industry' : (B().short || B().name)) : 'Styles for ' + (sc ? sc.name.toLowerCase() : 'every industry');
  for (const t of TPLS.filter(x => x.sector === S.sector && !x.hidden)) {
    const fam = K7.FAM[t.cf], b = el('button', 'fcard'); b.type = 'button'; b.dataset.id = t.id; b.title = t.blurb;
    const fv = el('div', 'fv'); fv.style.background = `linear-gradient(165deg, ${fam.pal.deep1}, ${fam.pal.ink} 55%, ${fam.pal.deep2})`;
    const src = THUMB.map[t.id]; if (src) { const im = el('img'); im.alt = ''; im.src = src; fv.appendChild(im); }
    else { const fb = el('div', 'fb'), nm = el('b', '', t.name.toUpperCase()); nm.style.color = fam.pal.text; NX.useFont(fam.fonts.display).then(ok => { const ff = ok && NX.fontCSS ? NX.fontCSS(fam.fonts.display) : null; if (ff) nm.style.fontFamily = ff; }); const bar = el('i'); bar.style.background = fam.pal.accent; fb.appendChild(nm); fb.appendChild(bar); fv.appendChild(fb); }
    if (t.isNew) fv.appendChild(el('span', 'tag', 'NEW'));
    b.appendChild(fv); b.appendChild(el('span', 'fn', t.name)); b.appendChild(el('span', 'fm', t.vibe || ''));
    const fo = el('div', 'fo'); (t.obj || []).slice(0, 2).forEach(o => fo.appendChild(el('span', '', NX.OBJECTIVES[o] || o))); b.appendChild(fo);
    b.onclick = () => openPreview(t); row.appendChild(b);
  }
}
function buildSig() { buildRow('#sigRow', x => x.sig); buildRow('#boRow', x => x.bo); buildRow('#pxRow', x => x.px); buildRow('#webRow', x => x.web); }
function buildRow(sel, pick) {
  const row = $(sel); if (!row) return; row.textContent = '';
  for (const t of TPLS.filter(x => pick(x) && !x.hidden)) {
    const b = el('button', 'fcard'); b.type = 'button'; b.dataset.id = t.id; b.title = t.blurb;
    const fv = el('div', 'fv'); fv.style.background = 'linear-gradient(165deg, ' + (B().colors.accent || '#333') + ', #111 70%)';
    const src = THUMB.map[t.id]; if (src) { const im = el('img'); im.alt = ''; im.src = src; fv.appendChild(im); } else { const fb = el('div', 'fb'); fb.appendChild(el('b', '', t.name.toUpperCase())); fv.appendChild(fb); }
    b.appendChild(fv); b.appendChild(el('span', 'fn', t.name)); b.appendChild(el('span', 'fm', Math.round(t.dur || 0) ? Math.round(t.dur) + ' s · ' + (t.nShots || 0) + ' shots' : ''));
    b.onclick = () => openPreview(t); row.appendChild(b);
  }
}
function paintFam(id) { const c = document.querySelector('.fcard[data-id="' + id + '"] .fv'); if (!c || !THUMB.map[id]) return; const fb = c.querySelector('.fb'); if (fb) fb.remove(); let im = c.querySelector('img'); if (!im) { im = el('img'); im.alt = ''; c.prepend(im); } im.src = THUMB.map[id]; }
function buildSeason() {
  const row = $('#seasonRow'); row.textContent = '';
  for (const { id, days } of HOL.upcoming()) {   // every occasion, soonest first (the row scrolls)
    const th = HOL.THEMES[id], b = el('button', 'hcard'); b.type = 'button'; b.dataset.hol = id;
    b.style.background = `linear-gradient(160deg, ${th.pal.deep1 || th.pal.ink}, ${th.pal.ink} 60%, ${th.pal.accent})`;
    const src = THUMB.cover[id]; if (src) { const im = el('img'); im.alt = ''; im.src = src; b.appendChild(im); }
    b.appendChild(el('span', 'sh')); b.appendChild(el('span', 'when', days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : 'In ' + days + ' days'));
    const tx = el('span', 'tx'); tx.appendChild(el('b', '', th.name)); tx.appendChild(el('small', '', HOL.next(id).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) + ' · 4 templates')); b.appendChild(tx);
    b.onclick = () => openPack(id); row.appendChild(b);
  }
}
const packSrc = (hol, tid) => THUMB.pack[hol + ':' + tid] || (tid === 'hgreet' && THUMB.cover[hol]) || (hol === NX.defaultHol() ? THUMB.map[tid] : '') || '';
const packBg = hol => { const p = HOL.THEMES[hol].pal; return `linear-gradient(160deg, ${p.deep1 || p.ink}, ${p.ink} 60%, ${p.accent})`; };
function requestPack(hol) { if (!hol || TPLS.filter(x => x.hol).every(t => packSrc(hol, t.id))) return; THUMB.wantPack = hol; THUMB.packTries = THUMB.packTries || {}; THUMB.packTries[hol] = 0; stopThumbs().then(() => scheduleThumbs(60)); }
function paintPack(hol, tid) {
  const src = THUMB.pack[hol + ':' + tid]; if (!src) return;
  document.querySelectorAll('.tcard[data-id="' + tid + '"] img[data-cover="' + hol + '"]').forEach(i => { i.src = src; i.style.visibility = ''; const tg = i.parentElement.querySelector('.tag:not(.new)'); if (tg) tg.remove(); });
  const pi = document.querySelector('#tpPv img[data-cover="' + hol + '"][data-tid="' + tid + '"]'); if (pi) pi.src = src;
}
function paintCover(id) { const card = document.querySelector('.hcard[data-hol="' + id + '"]'); if (!card || card.querySelector('img')) return; const im = el('img'); im.alt = ''; im.src = THUMB.cover[id]; card.prepend(im); }
function openPack(id) { requestPack(id); S.filter = 'Holidays'; S.q = ''; S.packHol = id; $('#search').value = ''; buildFilters(); buildGallery(); $('#secTpl').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function buildRecent() {
  const row = $('#recentRow'); row.textContent = ''; const mine = S.projects.filter(p => (p.brand || 'dpg') === S.brand.id).slice(0, 10);
  $('#secRecent').hidden = !mine.length;
  for (const p of mine) row.appendChild(projCard(p, true));
}
function projCard(p, compact) {
  const c = el('div', 'pcard'); c.dataset.id = p.id; c.dataset.tpl = p.tpl; const tpl = TPL(p.tpl) || (NX.extraTpl && NX.extraTpl(p.tpl));
  const th = el('button', 'th'); th.type = 'button'; th.style.border = '0'; th.style.padding = '0'; th.setAttribute('aria-label', 'Open ' + (p.name || 'clip'));
  const img = el('img'); const ps = posterOf(p); if (ps) img.src = ps; img.alt = ''; th.appendChild(img); c.appendChild(th);
  const open = () => openProject(Object.assign(clone(p), { saved: true })); th.onclick = open;
  const nb = el('button', 'pn', p.name || 'Untitled clip'); nb.type = 'button'; nb.onclick = open; c.appendChild(nb);
  c.appendChild(el('div', 'pm', (tpl ? tpl.name : p.tpl) + ' · ' + ago(p.updatedAt)));
  if (!compact) {
    const pa = el('div', 'pa');
    const dup = el('button', 'btn sm ghost', 'Duplicate'); dup.type = 'button'; dup.onclick = () => { const q = clone(p); q.id = 'p' + uid8(); q.name = (p.name || 'Clip') + ' (copy)'; q.createdAt = new Date().toISOString(); q.saved = false; openProject(q); markDirty(); };
    const del = el('button', 'btn sm ghost danger', 'Delete'); del.type = 'button';
    del.onclick = async () => { if (del.dataset.arm !== '1') { del.dataset.arm = '1'; del.textContent = 'Confirm'; setTimeout(() => { del.dataset.arm = ''; del.textContent = 'Delete'; }, 3500); return; }
      try { await CAP.db.doc('projects/' + p.id).delete(); if (S.proj && S.proj.id === p.id) { S.proj.saved = false; setSave('Not saved', false, 'Deleted from Projects. Edit anything to save it again.'); } } catch (e) { toast('Could not delete: ' + (e.code || e.message)); } };
    pa.appendChild(dup); pa.appendChild(del); c.appendChild(pa);
  }
  return c;
}
function buildFilters() {
  const box = $('#tplFilters'); box.textContent = '';
  for (const f of FAMS()) { const b = el('button', '', f === 'All' ? 'All templates' : f); b.type = 'button'; b.setAttribute('aria-pressed', String(S.filter === f && !S.q)); b.onclick = () => { S.filter = f; S.q = ''; if (f !== 'Holidays') S.packHol = null; $('#search').value = ''; buildFilters(); buildGallery(); }; box.appendChild(b); }
}
const SYN = { 'before': 'ba', 'after': 'ba', 'menu': 'menu restaurant dish special', 'food': 'restaurant', 'review': 'review trust', 'testimonial': 'review', 'logo': 'sting', 'intro': 'sting', 'countdown': 'top3 reveal hcount', 'banner': 'banner lower3 ticker', 'holiday': 'holidays', 'sale': 'hspecial blackfriday', 'hours': 'hhours', 'greeting': 'hgreet' };
function holMatch(q) { if (!q) return null; for (const id of HOL.ORDER) { const th = HOL.THEMES[id]; if (th.name.toLowerCase().includes(q) || id.includes(q) || (q.length > 3 && th.greet.toLowerCase().includes(q))) return id; } if (/xmas|navidad/.test(q)) return 'christmas'; if (/4th|fourth|july|independence/.test(q)) return 'july4'; if (/patrick/.test(q)) return 'stpat'; if (/mother|mom/.test(q)) return 'mothers'; if (/father|dad/.test(q)) return 'fathers'; if (/new year|nye/.test(q)) return 'newyear'; if (/dead|muertos/.test(q)) return 'muertos'; return null; }
function buildGallery() {
  const g = $('#tgrid'); g.textContent = '';
  const ind = B().industry, rank = t => (t.ind ? (t.ind.includes(ind) ? 1 : -1) : 0), q = S.q.trim().toLowerCase(), hq = holMatch(q);
  const hol = hq || S.packHol || null;
  $('#tplHead').textContent = q ? 'Results for “' + S.q.trim() + '”' : S.filter === 'Holidays' && hol ? HOL.THEMES[hol].name + ' pack' : S.filter === 'All' ? 'All templates' : S.filter;
  $('#tplSub').textContent = S.filter === 'Holidays' || hq ? 'Pick a layout. You can switch the occasion later in Style.' : q ? '' : 'Tap a template to preview it.';
  let n = 0;
  for (const t of TPLS.slice().sort((a, b) => rank(b) - rank(a))) {
    if (t.hidden) continue;
    if (q) { const hay = (t.name + ' ' + t.blurb + ' ' + t.fam + ' ' + t.id).toLowerCase(), syn = Object.entries(SYN).filter(([k]) => q.includes(k)).map(([, v]) => v).join(' ');
      if (!(hay.includes(q) || (syn && syn.split(' ').some(s => s === t.id || t.fam.toLowerCase() === s)) || (hq && t.hol))) continue; }
    else if (S.filter !== 'All' && t.fam !== S.filter) continue;
    const b = el('button', 'tcard'); b.type = 'button'; b.dataset.id = t.id; b.title = t.blurb;
    const pv = el('div', 'pv'), img = el('img'); img.alt = ''; img.loading = 'lazy'; pv.appendChild(img);
    const src = t.hol && hol ? packSrc(hol, t.id) : posterFor(t.id);
    if (t.hol && hol) { img.dataset.cover = hol; if (!src) { pv.style.background = packBg(hol); } }
    if (src) img.src = src; else { if (!t.live) { img.src = 'posters/' + t.id + '.jpg'; img.style.filter = 'grayscale(1) brightness(.75)'; } else img.style.visibility = 'hidden'; pv.appendChild(el('span', 'tag', 'Rendering…')); }
    if (t.isNew) pv.appendChild(el('span', 'tag new', 'NEW'));
    if (S.brand.builtin && !t.live) {
      const vid = el('video'); vid.muted = true; vid.loop = true; vid.playsInline = true; vid.preload = 'none'; pv.appendChild(vid);
      b.onmouseenter = () => { if (!vid.src) vid.src = 'previews/' + t.id + '.mp4'; vid.classList.add('on'); vid.play().catch(() => {}); };
      b.onmouseleave = () => { vid.pause(); vid.classList.remove('on'); };
    }
    pv.appendChild(el('span', 'use', 'Preview'));
    b.appendChild(pv); b.appendChild(el('span', 'nm', t.hol && hol ? t.name.replace('Holiday', HOL.THEMES[hol].name) : t.name));
    b.appendChild(el('span', 'mt', (t.dur ? Math.round(t.dur) + ' s · ' : '') + (t.nShots ? t.nShots + ' shot' + (t.nShots > 1 ? 's' : '') : 'no footage needed') + (t.ind && t.ind.includes(ind) ? ' · for you' : '')));
    b.onclick = () => openPreview(t, hol); g.appendChild(b); n++;
  }
  if (!n) { const p = el('div', 'noresults'); p.appendChild(el('p', '', 'No templates match “' + S.q.trim() + '”.')); const b = el('button', 'btn', 'Show all templates'); b.type = 'button'; b.onclick = () => { S.q = ''; S.filter = 'All'; $('#search').value = ''; buildFilters(); buildGallery(); }; p.appendChild(b); g.appendChild(p); }
  markCurrent();
}
let searchT = 0;
$('#search').addEventListener('input', e => { clearTimeout(searchT); searchT = setTimeout(() => { S.q = e.target.value; buildFilters(); buildGallery(); }, 120); });
$('#search').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#secTpl').scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
function paintThumb(id) {
  const src = THUMB.map[id]; if (!src) return; paintFam(id);
  const card = document.querySelector('.tcard[data-id="' + id + '"]'); if (card) { const img = card.querySelector('img'); if (!img.dataset.cover) { img.src = src; img.style.filter = ''; img.style.visibility = ''; } const tg = card.querySelector('.tag:not(.new)'); if (tg) tg.remove(); }
  if (S.tpl && S.tpl.id === id && !$('#ph').hidden) $('#ph').src = src;
  document.querySelectorAll('.pcard[data-tpl="' + id + '"] img').forEach(i => { if (!i.getAttribute('src')) i.src = src; });
}
// template preview sheet
const TP = { t: null, hol: null };
function openPreview(t, hol) {
  TP.t = t; TP.hol = t.hol ? (hol || NX.defaultHol()) : null;
  $('#tpFam').textContent = t.cf && t.sector ? (NX.SECTORS.find(x => x.id === t.sector) || {}).short + '  ·  ' + (t.vibe || '') : t.fam; $('#tpName').textContent = t.hol ? t.name.replace('Holiday', HOL.THEMES[TP.hol].name) : t.name; $('#tpBlurb').textContent = t.blurb;
  const f = $('#tpFacts'); f.textContent = ''; const fact = (b, s) => { const d = el('div'); d.appendChild(el('b', '', b)); d.appendChild(el('span', '', s)); f.appendChild(d); };
  fact(t.dur ? Math.round(t.dur) + ' s' : '–', 'length'); fact(String(t.nShots || 0), t.nShots === 1 ? 'shot' : 'shots'); fact(String(t.nLines || 0), 'lines to edit');
  paintPreviewVis();
  const occ = $('#tpOcc'); occ.textContent = '';
  if (t.hol) { occ.appendChild(el('h4', '', 'Occasion')); const g = el('div', 'occ'); g.style.marginTop = '8px'; occ.appendChild(g);
    for (const { id, days } of HOL.upcoming()) { const th = HOL.THEMES[id], b = el('button'); b.type = 'button'; b.setAttribute('aria-pressed', String(TP.hol === id)); const bar = el('i'); bar.style.background = `linear-gradient(90deg, ${th.pal.ink}, ${th.pal.accent}, ${th.pal.accent2})`; b.appendChild(bar); b.appendChild(document.createTextNode(th.name)); b.appendChild(el('small', '', days === 0 ? 'today' : 'in ' + days + ' days'));
      b.onclick = () => { TP.hol = id; g.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); $('#tpName').textContent = t.name.replace('Holiday', th.name); paintPreviewVis(); }; g.appendChild(b); } }
  const ph = !S.brand.builtin && t.nShots && !NX.brandClips().length;
  $('#tpNote').textContent = (t.sector === 'estate' && HOOK.previewNote ? HOOK.previewNote() + ' ' : '') + (ph ? 'Shots show branded placeholders until you add ' + (S.brand.short || S.brand.name) + ' footage.' : S.brand.builtin && t.nShots && !t.cf ? 'Starts empty. Add your own footage to each shot.' : '');
  $('#tpModal').hidden = false; $('#tpUse').focus();
}
function paintPreviewVis() {
  const t = TP.t, box = $('#tpPv'); box.textContent = '';
  if (t.hol) requestPack(TP.hol);
  const src = t.hol ? packSrc(TP.hol, t.id) : posterFor(t.id); const img = el('img'); img.alt = ''; img.dataset.cover = t.hol ? TP.hol : ''; img.dataset.tid = t.id; if (src) img.src = src; else if (!t.live) img.src = 'posters/' + t.id + '.jpg'; else box.style.background = t.hol ? packBg(TP.hol) : ''; box.appendChild(img);
  if (S.brand.builtin && !t.live) { const v = el('video'); v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.src = 'previews/' + t.id + '.mp4'; v.oncanplay = () => v.play().catch(() => {}); box.appendChild(v); }
}
const closePreview = () => { $('#tpModal').hidden = true; const v = $('#tpPv video'); if (v) v.pause(); };
$('#tpClose').onclick = closePreview; $('#tpCancel').onclick = closePreview;
$('#tpUse').onclick = () => { const t = TP.t; closePreview(); openProject(newProject(t, { hol: TP.hol })); };

const OFF = document.createElement('canvas'); OFF.width = 1080; OFF.height = 1920; const OFFCTX = OFF.getContext('2d');
const SMALL = document.createElement('canvas'); SMALL.width = 216; SMALL.height = 384;
function scheduleThumbs(ms) { clearTimeout(THUMB.t); THUMB.t = setTimeout(renderThumbs, ms || 500); }
async function stopThumbs() { clearTimeout(THUMB.t); if (!THUMB.busy) return; THUMB.tok++; while (THUMB.busy) await sleep(25); }
const BIG = document.createElement('canvas'); BIG.width = 432; BIG.height = 768;
async function renderOne(t, proj, T, big) {   // a still of template t (current engine look) into a small JPEG (big: 432x768 for Quick Create drafts)
  let keys = null; const restore = () => { if (S.tpl && S.proj) build(); };
  try { buildWith(t, proj, S.brand); VID.beginCollect(); ctx = DRYCTX; try { renderSync(T); } finally { ctx = MAINCTX; } keys = VID.endCollect(); }
  catch (e) { console.warn('thumb', t.id, e); } finally { restore(); }
  if (!keys) return null;
  try { await VID.ensure(keys, false); } catch (e) { return null; }
  try { buildWith(t, proj, S.brand); ctx = OFFCTX; renderSync(T); } catch (e) { console.warn('thumb', t.id, e); return null; } finally { ctx = MAINCTX; restore(); }
  const out = big ? BIG : SMALL, g = out.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(OFF, 0, 0, out.width, out.height); return out.toDataURL('image/jpeg', big ? 0.86 : 0.82);
}
let lastEdit = 0;
const idleForThumbs = () => !S.playing && !R.busy && !KIT.draft && !EX.running && !R.lock && Date.now() - lastEdit > 1500 && !anyModal();
async function renderThumbs() {   // brand-rendered thumbnails and holiday covers; any interactive change stops it (stopThumbs) and it resumes later
  if (THUMB.busy || window.__noThumbs) return;
  const b = S.brand, key = b.id + sig(b) + (THUMB.ver || 0);
  if (THUMB.key !== key) { THUMB.key = key; THUMB.map = {}; THUMB.cover = {}; THUMB.pack = {}; THUMB.done = false; buildGallery(); buildSeason(); buildSig(); buildIndustries(); }
  const tok = ++THUMB.tok; THUMB.busy = true;
  try { await thumbJobs(b, tok); } finally { THUMB.busy = false; }
  const wp = THUMB.wantPack; if (wp && !TPLS.filter(x => x.hol).every(t => packSrc(wp, t.id)) && (THUMB.packTries[wp] = (THUMB.packTries[wp] || 0) + 1) < 3) scheduleThumbs(400);
}
async function thumbJobs(b, tok) {
  // jobs grouped by look so fonts swap as few times as possible: [look, [ [kind, tpl, proj, T, id] ... ]]
  const groups = new Map(), add = (L, job) => { const k = NX.lookKey(L); if (!groups.has(k)) groups.set(k, [L, []]); groups.get(k)[1].push(job); };
  const wantSec = new Set([brandSector(b), S.sector].filter(Boolean));
  for (const t of TPLS) { if (t.hidden || (b.builtin && !t.live) || THUMB.map[t.id] || (t.sector && !wantSec.has(t.sector))) continue; const proj = { text: {}, shot: {}, style: {}, hol: t.hol ? NX.defaultHol() : null }; add(NX.lookFor(proj, t, b), ['tpl', t, proj, posterT(t.id), t.id]); }
  const wp = THUMB.wantPack;   // a holiday pack someone opened: all four layouts for that occasion first
  if (wp) for (const t of TPLS.filter(x => x.hol)) { if (THUMB.pack[wp + ':' + t.id]) continue; const proj = { text: {}, shot: {}, style: {}, hol: wp }; add(NX.lookFor(proj, t, b), ['pack', t, proj, posterT(t.id), wp]); }
  for (const { id } of HOL.upcoming()) { if (THUMB.cover[id]) continue; const t = TPL('hgreet'), proj = { text: {}, shot: {}, style: {}, hol: id }; add(NX.lookFor(proj, t, b), ['cover', t, proj, 3.9, id]); }
  for (const [, [L, jobs]] of groups) {
    for (;;) { if (tok !== THUMB.tok) return; if (idleForThumbs()) break; await sleep(300); }
    R.lock = true; await waitIdle();
    try {
      await NX.applyLook(L, jobs[0][1]); S.lookKey = '';
      for (const [kind, t, proj, T, id] of jobs) {
        if (tok !== THUMB.tok) break;
        window.HOLFX = null; window.OVERLAY = null;
        const src = await renderOne(t, proj, T); if (!src) continue;
        if (kind === 'tpl') { THUMB.map[id] = src; paintThumb(id); if (t.hol) { THUMB.pack[proj.hol + ':' + t.id] = src; paintPack(proj.hol, t.id); } }
        else if (kind === 'pack') { THUMB.pack[id + ':' + t.id] = src; paintPack(id, t.id); }
        else { THUMB.cover[id] = src; THUMB.pack[id + ':hgreet'] = src; paintCover(id); paintPack(id, 'hgreet'); }
        await sleep(10);
      }
    } finally { await syncLook(true, true); R.lock = false; requestRender(S.t); }
    if (tok !== THUMB.tok) return;
    await sleep(40);
  }
  THUMB.done = true;
}
function markCurrent() {
  document.querySelectorAll('.tcard').forEach(b => b.setAttribute('aria-current', String(!!S.tpl && b.dataset.id === S.tpl.id && S.view === 'work')));
  document.querySelectorAll('.pcard').forEach(r => r.setAttribute('aria-current', String(!!S.proj && r.dataset.id === S.proj.id)));
}

// ---------------------------------------------------------------- projects (this brand)
function buildProjects() {
  const box = $('#plist'); box.textContent = '';
  const mine = S.projects.filter(p => (p.brand || 'dpg') === S.brand.id);
  const nc = el('button', 'newcard'); nc.type = 'button'; const i = el('i'); i.appendChild(svg(IC.plus)); nc.appendChild(i); nc.appendChild(document.createTextNode('New clip')); nc.appendChild(el('small', '', 'Start from a template')); nc.onclick = () => $('#createBtn').click(); box.appendChild(nc);
  if (!CAP.db) { box.appendChild(el('p', 'empty', 'Saved clips appear here when the studio is opened on claude.ai.')); return; }
  if (!mine.length) { box.appendChild(el('p', 'empty', 'No saved clips for ' + S.brand.name + ' yet. Pick a template, change any line, shot or style, and it saves here.')); }
  for (const p of mine) box.appendChild(projCard(p, false));
  markCurrent(); buildRecent();
}
$('#projName').addEventListener('input', e => { S.proj.name = e.target.value.slice(0, 80); markDirty(); });

// ---------------------------------------------------------------- footage library (this brand)
function buildFootage() {
  const b = S.brand, grid = $('#footGrid'); grid.textContent = '';
  $('#footTitle').textContent = (b.builtin ? 'DPG' : b.short || b.name) + ' footage';
  const rows = NX.brandClips().sort((x, y) => (x.src === 'up') === (y.src === 'up') ? String(y.addedAt || '').localeCompare(String(x.addedAt || '')) : x.src === 'up' ? -1 : 1);
  UPQ.forEach(u => grid.appendChild(u.tile2));
  grid.appendChild(addTile());
  for (const r of rows) { const t = clipTile(r, footSelMode ? () => toggleSel(r.id) : () => openManage(r.id)); if (footSelMode && footSel.has(r.id)) { t.classList.add('sel'); t.appendChild(el('span', 'tick', '✓')); } grid.appendChild(t); }
  $('#footAdd').hidden = !CAP.assets;
  $('#footSelBtn').hidden = !CAP.assets;
  for (const f of onClips) try { f(); } catch (e) { console.error(e); }
  paintBrand();
}
const onClips = [];
function clipTile(r, onclick, pressed) {
  const b = el('button', 'ftile'); b.type = 'button'; b.dataset.id = r.id; if (pressed !== undefined) b.setAttribute('aria-pressed', String(pressed));
  const fi = el('div', 'fi'), im = el('img'); im.alt = ''; im.loading = 'lazy'; if (r.poster) im.src = r.poster; fi.appendChild(im); b.appendChild(fi);
  const fn = el('div', 'fn', r.name); fn.appendChild(el('small', '', r.still ? 'Photo · ' + (r.kind === 'vert' ? 'vertical' : 'landscape') : (r.kind === 'vert' ? '9:16' : (r.w / r.h > 1.6 ? '16:9' : '3:2')) + ' · ' + r.dur.toFixed(0) + ' s' + (r.src === 'lib' ? ' · library' : ''))); b.appendChild(fn);
  b.onclick = onclick; return b;
}
async function refreshMeter() {
  if (!CAP.assets) { $('#meter').hidden = true; return; }
  try { const { usage } = await CAP.assets.list(); if (!usage.maxBytes) { $('#meter').hidden = true; return; }
    const u = usage.bytes / usage.maxBytes, warn = usage.warn || u >= 0.8;
    $('#meter').hidden = false; $('#meter').classList.toggle('warn', warn); $('#meterBar').style.width = (Math.min(1, u) * 100) + '%';
    $('#meterTxt').textContent = mb(usage.bytes) + ' of ' + mb(usage.maxBytes) + ' storage used · ' + Math.round(u * 100) + '% · ' + usage.files + ' files (all brands)' + (warn ? ' — nearly full' : ''); }
  catch (e) { $('#meter').hidden = true; }
}
// Projects that reference a clip id anywhere in their doc (shot maps,
// free-timeline items, any field) — used to block deletion of footage a
// project still needs. Mirrors api/_lib/r2.js findClipRefs server-side.
const clipRefs = id => {
  const out = [];
  for (const p of (S.projects || [])) {
    let hit = false;
    const walk = v => { if (hit) return; if (typeof v === 'string') { if (v === id) hit = true; return; } if (v && typeof v === 'object') for (const k in v) walk(v[k]); };
    walk(p);
    if (hit) out.push(p.name || p.id);
  }
  return out;
};
// ---------------------------------------------------------------- multi-select delete (footage grid)
let footSelMode = false; const footSel = new Set();
function toggleSel(id) { if (footSel.has(id)) footSel.delete(id); else footSel.add(id); paintSelBar(); buildFootage(); }
function paintSelBar() { const n = footSel.size; $('#footSelTxt').textContent = n ? n + ' selected' : 'Tap footage to select it'; const d = $('#footSelDel'); d.dataset.arm = ''; d.textContent = 'Delete selected'; }
function setSelMode(on) { footSelMode = on; footSel.clear(); $('#footSelBtn').textContent = on ? 'Done' : 'Select'; $('#footSelBar').hidden = !on; paintSelBar(); buildFootage(); }
$('#footSelBtn').onclick = () => setSelMode(!footSelMode);
$('#footSelCancel').onclick = () => setSelMode(false);
$('#footSelDel').onclick = async () => {
  const d = $('#footSelDel'); if (!footSel.size) return;
  if (d.dataset.arm !== '1') { d.dataset.arm = '1'; d.textContent = 'Tap again to delete for good'; return; }
  const blocked = [], rows = [];
  for (const id of [...footSel]) { const row = CLIPS.get(id); if (!row) continue; const refs = clipRefs(id); if (refs.length) blocked.push(row.name + ' (used in ' + refs.join(', ') + ')'); else rows.push(row); }
  try {
    for (const row of rows) await CAP.db.doc('clips/' + row.id).delete(); // local first
    const r = rows.length ? await CAP.assets.deleteMany(rows.map(x => x.asset)) : null;
    const serverBlocked = new Set((r && r.body && r.body.blocked || []).map(b => b.asset));
    for (const row of rows) {
      if (serverBlocked.has(row.asset)) { // raced: referenced elsewhere — restore the row
        await CAP.db.doc('clips/' + row.id).set(row);
        const b = (r.body.blocked || []).find(x => x.asset === row.asset);
        blocked.push(row.name + ' (used in ' + ((b && b.projects) || []).join(', ') + ')');
      } else { NX.dropClip(row.id); FB.forget(row.id); }
    }
    const n = rows.length - serverBlocked.size;
    toast('Removed ' + n + ' clip' + (n === 1 ? '' : 's') + (blocked.length ? '. Kept ' + blocked.length + ' in use: ' + blocked.join('; ') : '.'));
    setSelMode(false); buildFootage(); refreshMeter(); edited(true);
  } catch (e) { toast('Could not remove: ' + (e.code || e.message)); }
};
$('#footAdd').onclick = () => pickFiles();

// ---------------------------------------------------------------- saving (db)
let saveT = 0, saving = false, dirty = false;
function setSave(s, bad, tip, ok) { const e = $('#saveState'); e.textContent = s; e.title = tip || ''; e.classList.toggle('bad', !!bad); e.classList.toggle('ok', !!ok); e.classList.toggle('busy', /Saving|Unsaved/.test(s)); }
function markDirty() {
  if (!S.proj) return; dirty = true; lastEdit = Date.now();
  if (!CAP.db) { setSave('Saving off', false, 'Saving works when the studio is opened on claude.ai.'); return; }
  setSave('Unsaved changes'); clearTimeout(saveT); saveT = setTimeout(flush, 900);
}
async function flush() {
  if (!CAP.db || !dirty) return;
  if (saving) { clearTimeout(saveT); saveT = setTimeout(flush, 600); return; }
  saving = true; dirty = false; setSave('Saving…');
  const p = S.proj; p.updatedAt = new Date().toISOString();
  const body = { id: p.id, brand: p.brand || 'dpg', name: p.name, tpl: p.tpl, text: p.text, shot: p.shot, style: p.style || {}, createdAt: p.createdAt, updatedAt: p.updatedAt, by: CAP.uid || null };
  if (p.tl) body.tl = p.tl; if (p.hol) body.hol = p.hol; if (p.listing) body.listing = p.listing;
  try { await CAP.db.doc('projects/' + p.id).set(body); p.saved = true; if (S.proj === p) setSave('Saved', false, '', true); }
  catch (e) { dirty = true; const ro = e && (e.code === 'invalid_argument' || e.code === 'permission_denied' || e.code === 'not_granted');
    setSave(ro ? 'View only' : 'Couldn’t save', true, ro ? 'You can view this studio but not save to it.' : 'Saving failed (' + (e.code || 'error') + '). It will retry.'); if (ro) { saving = false; return; } }
  saving = false; if (dirty) { clearTimeout(saveT); saveT = setTimeout(flush, 900); }
}
window.addEventListener('beforeunload', () => { if (dirty) flush(); });

// ---------------------------------------------------------------- footage picker (slot mode) and clip details (manage mode)
const PK = { key: null, f: null, clip: null, inn: 0, playTok: 0, manage: false };
const pkClear = el('button', 'btn ghost', 'Clear the shot'); pkClear.type = 'button'; pkClear.hidden = true; $('#pkCancel').before(pkClear);
function openPicker(key) {
  if (S.playing) pause();
  const f = S.fields.find(x => x.key === key); if (!f) return;
  const v = shotVal(f); Object.assign(PK, { key, f, clip: NX.isPh(v[0]) ? null : v[0], inn: v[1], manage: false });
  const vert = NX.isPh(f.def[0]) ? f.def[0].startsWith('phv:') : f.kind === 'vert';
  const kindName = f.kind === 'vert' || vert && f.kind !== 'any' ? 'Vertical 9:16 footage' : f.kind === 'land' ? 'Landscape footage (shown whole, never cropped)' : 'Landscape or vertical footage';
  $('#pkTitle').textContent = f.group + ' · ' + f.label; $('#pkSub').textContent = kindName + ' · the shot uses ' + (f.d || 0).toFixed(1) + ' s from where it starts';
  $('#pkUse').hidden = false; $('#pkCancel').textContent = 'Cancel'; $('#pkPlay').textContent = 'Play the shot';
  pkClear.hidden = !(NX.isPh(f.def[0]) && S.proj.shot[key]);
  buildPickerLib(); $('#picker').hidden = false; selectClip(PK.clip, PK.inn); $('#pkClose').focus();
}
function openManage(id) {
  const row = CLIPS.get(id); if (!row) return;
  if (S.playing) pause();
  Object.assign(PK, { key: null, f: null, clip: id, inn: 0, manage: true });
  $('#pkTitle').textContent = row.name; $('#pkSub').textContent = (row.kind === 'vert' ? 'Vertical 9:16' : 'Landscape') + ' · ' + row.dur.toFixed(1) + ' s · ' + (row.src === 'lib' ? 'DPG library' : 'uploaded ' + ago(row.addedAt));
  $('#pkUse').hidden = true; pkClear.hidden = true; $('#pkCancel').textContent = 'Close'; $('#pkPlay').textContent = 'Play from here';
  buildPickerLib(); $('#picker').hidden = false; selectClip(id, 0); $('#pkClose').focus();
}
function closePicker() { PK.playTok++; $('#picker').hidden = true; const s = PK.key && document.querySelector('.slot[data-key="' + PK.key + '"] button'); if (s) s.focus(); }
$('#pkClose').onclick = closePicker; $('#pkCancel').onclick = closePicker;
pkClear.onclick = () => { delete S.proj.shot[PK.key]; closePicker(); edited(true); };
function okKind(row) {
  if (PK.manage || !PK.f) return true; const f = PK.f;
  if (f.kind === 'vert' || f.kind === 'land') return row.kind === f.kind;
  if (!f.kind && NX.isPh(f.def[0])) return row.kind === (f.def[0].startsWith('phv:') ? 'vert' : 'land');
  return true;
}
function buildPickerLib() {
  const box = $('#pkLib'); box.textContent = '';
  const all = NX.brandClips(), rows = all.filter(okKind), hidden = all.length - rows.length;
  const ups = rows.filter(r => r.src !== 'lib'), libs = rows.filter(r => r.src === 'lib');
  const mk = (title, list, withAdd) => {
    box.appendChild(el('div', 'pk-sec', title)); const g = el('div', 'pk-grid'); box.appendChild(g);
    if (withAdd) { UPQ.forEach(u => g.appendChild(u.tile)); g.appendChild(addTile()); }
    for (const r of list) g.appendChild(clipTile(r, () => selectClip(r.id, PK.f && r.id === PK.f.def[0] ? PK.f.def[1] : 0), r.id === PK.clip));
    return g;
  };
  mk(S.brand.builtin ? 'Your uploads' : S.brand.name + ' footage', ups, true);
  if (libs.length) mk('DPG library', libs, false);
  if (hidden > 0) box.appendChild(el('p', 'empty', hidden + ' more clip' + (hidden > 1 ? 's are' : ' is') + ' hidden because this shot needs ' + (okKind({ kind: 'vert' }) ? 'vertical' : 'landscape') + ' footage.'));
}
function addTile() {
  const t = el('div', 'ftile add'); t.tabIndex = 0; t.setAttribute('role', 'button');
  t.appendChild(svg(IC.plus)); t.appendChild(el('span', '', 'Add footage or photos')); t.appendChild(el('small', '', CAP.assets ? 'MP4 or MOV up to 60 s, or JPG / PNG photos. Drop files here or tap.' : 'Adding footage needs edit access to this studio.'));
  t.onclick = pickFiles; t.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickFiles(); } };
  t.ondragover = e => { e.preventDefault(); t.style.borderColor = 'var(--accent)'; }; t.ondragleave = () => (t.style.borderColor = '');
  t.ondrop = e => { e.preventDefault(); t.style.borderColor = ''; [...e.dataTransfer.files].filter(f => /^(video|image)\//.test(f.type) || /\.(mp4|mov|m4v|webm|jpe?g|png|webp|heic)$/i.test(f.name)).forEach(queueFootage); };
  return t;
}
function pickFiles() { if (!CAP.assets || !CAP.db) { toast('Adding footage needs edit access to this studio (open it on claude.ai as its owner or an editor).', 6000); return; } $('#upFile').click(); }
$('#upFile').onchange = e => { [...e.target.files].forEach(queueFootage); e.target.value = ''; };
function emptyView(msg) { const cv = $('#pkCanvas'), g = cv.getContext('2d'); cv.width = 640; cv.height = 360; g.fillStyle = '#0d0d10'; g.fillRect(0, 0, 640, 360); g.fillStyle = '#9a9aa8'; g.font = '600 18px UIInter, sans-serif'; g.textAlign = 'center'; g.fillText(msg, 320, 186); }
async function selectClip(id, inn) {
  const row = id && CLIPS.get(id); PK.playTok++;
  document.querySelectorAll('#pkLib .ftile[data-id]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
  const strip = $('#strip'); strip.querySelectorAll('.cut').forEach(c => c.remove());
  if (!row) {
    PK.clip = null; $('#pkUse').disabled = true; $('#pkPlay').disabled = true; $('#pkWin').hidden = true; $('#pkRange').disabled = true; $('#pkMeta').hidden = true;
    $('#pkStrip').getContext('2d').clearRect(0, 0, 800, 54); $('#pkTc').textContent = '';
    const n = $('#pkNote'); n.className = 'note'; n.textContent = NX.brandClips().length ? 'Pick footage for this shot.' : 'Add footage. It’s stored with ' + S.brand.name + ' and can be used in every template.';
    emptyView('No footage picked yet'); return;
  }
  PK.clip = id; $('#pkUse').disabled = false; $('#pkPlay').disabled = false; $('#pkRange').disabled = false;
  const d = PK.f ? (PK.f.d || 0) : 0, maxIn = Math.max(0, row.dur - Math.min(d, row.dur) - 1 / 30);
  PK.inn = clamp(inn || 0, 0, maxIn);
  const rg = $('#pkRange'); rg.max = maxIn.toFixed(3); rg.value = PK.inn;
  const cv = $('#pkCanvas'); cv.width = row.kind === 'vert' ? 338 : 640; cv.height = row.kind === 'vert' ? 600 : Math.round(640 * row.h / row.w);
  META[id].segs.slice(1).forEach(g => { const c = el('div', 'cut'); c.style.left = (g[0] / 30 / row.dur * 100) + '%'; strip.appendChild(c); });
  $('#pkWin').hidden = PK.manage || !!row.still; $('#pkRange').disabled = !!row.still;
  $('#pkMeta').hidden = row.src === 'lib' || !CAP.db; $('#pkProj').value = row.project || '';
  const del = $('#pkDel'); del.dataset.arm = ''; del.textContent = 'Remove from library';
  paintPick(); FB.strip(id, $('#pkStrip')).catch(() => {});
}
function paintPick() {
  const row = CLIPS.get(PK.clip); if (!row) return; const d = PK.f ? (PK.f.d || 0) : 0, n = $('#pkNote');
  if (row.still) { $('#pkTc').textContent = 'Photo'; n.className = 'note'; n.textContent = 'A photo holds for the whole shot and is always shown whole.'; }
  else if (PK.manage) { $('#pkTc').textContent = 'At ' + sec(PK.inn) + ' of ' + sec(row.dur); n.className = 'note'; n.textContent = 'Drag across the strip to look through the clip.'; }
  else {
    const w = $('#pkWin'); w.style.left = (PK.inn / row.dur * 100) + '%'; w.style.width = Math.max(1, Math.min(d, row.dur) / row.dur * 100) + '%';
    $('#pkTc').textContent = 'Starts at ' + sec(PK.inn) + ' · ends at ' + sec(Math.min(row.dur, PK.inn + d));
    const iss = runwayIssue(PK.clip, PK.inn, d); n.className = 'note' + (iss ? ' w' : ''); n.textContent = iss || 'Drag across the strip to choose where the shot starts. The highlighted window is what plays.';
  }
  FB.draw(PK.clip, PK.inn, $('#pkCanvas'), 'h').catch(e => (n.textContent = String(e.message || e)));
}
let pickRaf = 0;
$('#pkRange').oninput = e => { PK.playTok++; PK.inn = +e.target.value; cancelAnimationFrame(pickRaf); pickRaf = requestAnimationFrame(paintPick); };
$('#pkPlay').onclick = async () => {
  const row = CLIPS.get(PK.clip); if (!row) return;
  const tok = ++PK.playTok, d = Math.min(PK.f ? (PK.f.d || 2) : 4, row.dur - PK.inn), t0 = performance.now(), cv = $('#pkCanvas');
  FB.setMode('play');
  try { for (;;) { if (tok !== PK.playTok) break; const lt = (performance.now() - t0) / 1000; if (lt > d) break;
    const bmp = await FB.frame(PK.clip, Math.round((PK.inn + lt) * 30), 'h'); const g = cv.getContext('2d'); g.drawImage(bmp, 0, 0, cv.width, cv.height); bmp.close();
    await new Promise(r => requestAnimationFrame(r)); } }
  finally { FB.setMode('seek'); }
};
$('#pkUse').onclick = () => {
  if (!PK.clip || !PK.f) return;
  const f = PK.f, same = PK.clip === f.def[0] && Math.abs(PK.inn - f.def[1]) < 1e-3;
  if (same) delete S.proj.shot[f.key]; else S.proj.shot[f.key] = { c: PK.clip, in: Math.round(PK.inn * 1000) / 1000 };
  closePicker(); edited(true); FB.open(PK.clip).catch(() => {});
  const iv = (S.scan[f.key] || [])[0]; if (iv) setT(iv[0] + Math.min(0.6, (iv[1] - iv[0]) / 2), false);
};
$('#pkProj').addEventListener('change', async e => {
  const row = CLIPS.get(PK.clip); if (!row || row.src === 'lib' || !CAP.db) return;
  const v = e.target.value.trim().slice(0, 40); try { await CAP.db.doc('clips/' + row.id).update({ project: v.toUpperCase(), name: v || row.name }); } catch (er) { toast('Could not rename: ' + (er.code || er.message)); }
});
$('#pkDel').onclick = async () => {
  const b = $('#pkDel'), row = CLIPS.get(PK.clip); if (!row || row.src === 'lib') return;
  const refs = clipRefs(row.id);
  if (b.dataset.arm !== '1' && b.dataset.arm !== 'force') {
    if (refs.length) { b.dataset.arm = 'force'; b.textContent = 'Delete anyway'; toast('“' + row.name + '” is used in ' + refs.join(', ') + '. Tap again to delete it anyway.'); return; }
    b.dataset.arm = '1'; b.textContent = 'Remove it for good'; return;
  }
  const force = b.dataset.arm === 'force';
  try {
    await CAP.db.doc('clips/' + row.id).delete(); // local first: persist posts the db without the clip
    const r = CAP.assets ? await CAP.assets.delete(row.asset, force) : null;
    if (r && r.status === 409) { // raced: referenced elsewhere since the check — restore the row
      await CAP.db.doc('clips/' + row.id).set(row);
      toast('Still used in ' + ((r.body && r.body.projects) || []).join(', ') + ' — not deleted.');
      b.dataset.arm = ''; b.textContent = 'Remove from library'; return;
    }
    NX.dropClip(row.id); FB.forget(row.id);
    toast(force ? 'Removed “' + row.name + '”. Shots that used it go back to placeholders.' : 'Removed “' + row.name + '”.');
    if (PK.manage) closePicker(); else { const f = PK.f; selectClip(NX.isPh(f.def[0]) ? null : f.def[0], f.def[1]); buildPickerLib(); }
    buildFootage(); refreshMeter(); edited(true); }
  catch (e) { toast('Could not remove: ' + (e.code || e.message)); }
};

// ---------------------------------------------------------------- adding footage (transcode in the browser, then store)
const UPQ = []; let upChain = Promise.resolve();
const even = x => Math.max(2, Math.round(x / 2) * 2);
function queueFootage(file) {
  if (!CAP.assets || !CAP.db) { toast('Adding footage needs edit access to this studio.'); return; }
  const mkTile = () => { const t = el('div', 'ftile busy'), p = el('p', '', 'Waiting: ' + file.name), bar = el('div', 'pbar'), bi = el('i'); bar.appendChild(bi); t.appendChild(p); t.appendChild(bar); return [t, p, bi]; };
  const [tile, p1, b1] = mkTile(), [tile2, p2, b2] = mkTile();
  const job = { tile, tile2, brand: S.brand.id, say: (s, u) => { p1.textContent = p2.textContent = s; if (u !== undefined) b1.style.width = b2.style.width = (u * 100) + '%'; } };
  UPQ.push(job); if (!$('#picker').hidden) buildPickerLib(); buildFootage();
  upChain = upChain.then(() => (isPhoto(file) ? addPhoto(file, job) : addFootage(file, job))).catch(() => {});
  return job;
}
const isPhoto = f => /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic)$/i.test(f.name);
// a photo: decoded with its orientation, scaled to at most 2048 px on the long side, stored as a JPEG; it becomes a still clip
async function addPhoto(file, job) {
  const nm = file.name.replace(/\.[^.]+$/, ''), say = job.say;
  try {
    say('Reading ' + file.name + '…', 0.2);
    let bmp; try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) { throw new Error('This browser can’t read “' + file.name + '”. Use a JPG or PNG.'); }
    const sc = Math.min(1, 2048 / Math.max(bmp.width, bmp.height)), w = Math.round(bmp.width * sc), h = Math.round(bmp.height * sc), cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const g = cv.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(bmp, 0, 0, w, h); bmp.close();
    let out = null; for (const q of [0.9, 0.82, 0.72]) { out = await new Promise(r => cv.toBlob(r, 'image/jpeg', q)); if (out && out.size <= 6 * 1048576) break; }
    const pc = document.createElement('canvas'), pw = h > w ? 180 : 320; pc.width = pw; pc.height = Math.round(pw * h / w); pc.getContext('2d').drawImage(cv, 0, 0, pc.width, pc.height);
    say('Uploading ' + nm + '…', 0.7);
    const up = await CAP.assets.upload(out, { type: 'image/jpeg' });
    const id = 'u' + uid8(), n = 9000, row = { id, brand: job.brand, name: nm.slice(0, 40), project: nm.slice(0, 40).toUpperCase(), file: '', w, h, hw: Math.min(960, w), hh: Math.round(Math.min(960, w) * h / w), n, segs: [0, n - 1], asset: up.id, poster: pc.toDataURL('image/jpeg', 0.8), src: 'up', still: true, addedAt: new Date().toISOString(), by: CAP.uid || null };
    await CAP.db.doc('clips/' + id).set(row);
    NX.addClip(row); job.id = id;
    toast('Added the photo “' + row.name + '” to ' + ((S.brands.find(b => b.id === job.brand) || S.brand).name) + ' footage.');
    UPQ.splice(UPQ.indexOf(job), 1);
    if (!$('#picker').hidden && !PK.manage && job.brand === S.brand.id && okKind(CLIPS.get(id))) { buildPickerLib(); selectClip(id, 0); } else if (!$('#picker').hidden) buildPickerLib();
    buildFootage(); paintBanner(); refreshMeter(); if (job.done) job.done(id); return id;
  } catch (e) { console.error(e); toast(String(e && e.message || e), 7000); }
  UPQ.splice(UPQ.indexOf(job), 1); if (!$('#picker').hidden) buildPickerLib(); buildFootage(); if (job.done) job.done(null); return null;
}
async function addFootage(file, job) {
  const nm = file.name.replace(/\.[^.]+$/, ''), say = job.say;
  try {
    say('Reading ' + file.name + '…');
    const MB = await FB.mb();
    const input = new MB.Input({ source: new MB.BlobSource(file), formats: MB.ALL_FORMATS });
    const vt = await input.getPrimaryVideoTrack(); if (!vt) throw new Error('“' + file.name + '” has no video.');
    if (!(await vt.canDecode())) throw new Error('This browser can’t read “' + file.name + '”. Use Chrome or Edge, or export it as an H.264 MP4.');
    const dur = await input.computeDuration(), dw = vt.displayWidth, dh = vt.displayHeight, vert = dh > dw;
    const sc = Math.min(1, (vert ? 1080 : 1280) / dw, (vert ? 1920 : 1080) / dh), tw = even(dw * sc), th = even(dh * sc), end = Math.min(dur, 60);
    // V17: keep the clip's own sound (AAC, for talking heads and voice) where the browser can encode it; otherwise video only
    let keepAudio = !!(await input.getPrimaryAudioTrack().catch(() => null));
    if (keepAudio) { try { if (!(await MB.canEncodeAudio('aac', { numberOfChannels: 2, sampleRate: 48000, bitrate: 128000 }))) { const m = await import(new URL('vendor/aac-encoder.mjs', document.baseURI).href); m.registerAacEncoder(); } } catch (e) { keepAudio = false; } }
    let rate = Math.min(vert ? 5e6 : 4e6, Math.floor((18.5 * 8388608 - (keepAudio ? 128000 * end : 0)) / end * 0.9)), out = null;
    for (let a = 0; a < 3; a++) {
      const output = new MB.Output({ format: new MB.Mp4OutputFormat({ fastStart: 'in-memory' }), target: new MB.BufferTarget() });
      const conv = await MB.Conversion.init({ input, output, trim: { start: 0, end }, audio: keepAudio ? { codec: 'aac', bitrate: 128000, numberOfChannels: 2, sampleRate: 48000 } : { discard: true },
        video: { width: tw, height: th, fit: 'fill', codec: 'avc', bitrate: rate, keyFrameInterval: 1, frameRate: 30, forceTranscode: true } });
      if (!conv.isValid && keepAudio) { keepAudio = false; a--; continue; }
      if (!conv.isValid) throw new Error('“' + file.name + '” can’t be converted here.');
      conv.onProgress = u => say('Preparing ' + nm + ' · ' + Math.round(u * 100) + '%', u * 0.9);
      await conv.execute();
      out = new Blob([output.target.buffer], { type: 'video/mp4' }); if (out.size <= 19.5 * 1048576) break; rate *= 0.7;
    }
    if (out.size > 20 * 1048576) throw new Error('“' + file.name + '” is too detailed to fit the 20 MB limit. Try a shorter clip.');
    const pin = new MB.Input({ source: new MB.BlobSource(out), formats: MB.ALL_FORMATS }), ptr = await pin.getPrimaryVideoTrack(), hasAudio = !!(await pin.getPrimaryAudioTrack().catch(() => null));
    const n = Math.max(2, Math.floor((await pin.computeDuration()) * 30 + 0.01));
    const cs = new MB.CanvasSink(ptr, { width: vert ? 180 : 320 }), wc = await cs.getCanvas(Math.min(1, n / 60));
    const poster = wc ? wc.canvas.toDataURL('image/jpeg', 0.78) : '';
    say('Uploading ' + nm + '…', 0.94);
    const up = await CAP.assets.upload(out, { type: 'video/mp4' });
    const id = 'u' + uid8(), row = { id, brand: job.brand, name: nm.slice(0, 40), project: nm.slice(0, 40).toUpperCase(), file: '', w: tw, h: th, n, segs: [0, n - 1], asset: up.id, poster, src: 'up', addedAt: new Date().toISOString(), by: CAP.uid || null };
    if (hasAudio) row.audio = true;
    await CAP.db.doc('clips/' + id).set(row);
    NX.addClip(row);
    toast('Added “' + row.name + '” to ' + ((S.brands.find(b => b.id === job.brand) || S.brand).name) + ' footage.');
    UPQ.splice(UPQ.indexOf(job), 1);
    if (!$('#picker').hidden && !PK.manage && job.brand === S.brand.id && okKind(CLIPS.get(id))) { buildPickerLib(); selectClip(id, 0); }
    else if (!$('#picker').hidden) buildPickerLib();
    buildFootage(); paintBanner(); refreshMeter(); return;
  } catch (e) { console.error(e); toast(String(e && e.message || e), 7000); }
  UPQ.splice(UPQ.indexOf(job), 1); if (!$('#picker').hidden) buildPickerLib(); buildFootage();
}

// ---------------------------------------------------------------- export: review, render, save
const EX = { abort: false, blob: null, url: '', running: false };
$('#exportBtn').onclick = () => startExport(false);
$('#exGo').onclick = () => startExport(true);
$('#exCancel').onclick = () => { EX.abort = true; closeEx(); };
$('#exAgain').onclick = () => { closeEx(); const q = clone(S.proj); q.id = 'p' + uid8(); q.name = (S.proj.name || 'Clip').replace(/ · v\d+$/, '') + ' · v2'; q.createdAt = new Date().toISOString(); q.saved = false; openProject(q, { step: 'style' }); markDirty(); toast('A copy to restyle. The original is saved in Projects.'); };
function closeEx() { $('#exModal').hidden = true; const v = $('#exVideo'); v.pause(); v.removeAttribute('src'); v.load(); if (EX.url) { URL.revokeObjectURL(EX.url); EX.url = ''; } }
const fileBase = () => (B().short || B().name).replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_').slice(0, 20) + '_' + (S.proj.name || S.tpl.name).replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_').slice(0, 60) + '_9x16.mp4';
$('#exSave').onclick = async () => {
  if (!EX.blob) return;
  if (!CAP.downloads) { toast('Saving files isn’t available in this view. Open the studio on claude.ai in Chrome or Edge.', 7000); return; }
  const name = fileBase();
  try { await CAP.downloads.save({ filename: name, data: EX.blob }); toast('Saved ' + name); }
  catch (e) { if (e && e.code === 'declined') return; toast(e && e.code === 'rate_limited' ? 'A save prompt is already open.' : 'Couldn’t save the file (' + (e.code || e.message) + ').', 6000); }
};
// V21: the open clip as an MP4 blob with no dialog (the batch maker, nx-batch.js); prog(frame, frames, eta)
async function exportBlob(prog) {
  if (EX.running) throw new Error('An export is already running.'); if (S.playing) pause();
  await stopThumbs(); for (let k = 0; k < 100 && R.lock; k++) await sleep(50); if (R.lock) throw new Error('The preview is still updating. Try again in a moment.');
  const MB = await FB.mb();
  if (typeof VideoEncoder === 'undefined' || !(await MB.canEncodeVideo('avc', { width: 1080, height: 1920, bitrate: 1e7 }))) throw new Error('This browser can’t encode H.264 video. Export works in Chrome or Edge on a computer.');
  R.lock = true; EX.running = true; EX.abort = false; await waitIdle(); const keepT = S.t; let blob = null, err = null;
  for (const hw of ['no-preference', 'prefer-software']) { try { blob = await encode(MB, hw, prog || (() => {})); break; } catch (e) { err = e; if (EX.abort || (e && e.message === 'canceled')) break; } }
  FB.setMode('seek'); R.lock = false; EX.running = false; setT(keepT);
  if (!blob) throw err || new Error('Export failed.'); return blob;
}
// V21: store a clip in Projects without opening it
async function saveProjectDoc(p) {
  if (!CAP.db) throw new Error('Saving works when the studio is opened on claude.ai.'); p.updatedAt = new Date().toISOString();
  const body = { id: p.id, brand: p.brand || 'dpg', name: p.name, tpl: p.tpl, text: p.text, shot: p.shot, style: p.style || {}, createdAt: p.createdAt, updatedAt: p.updatedAt, by: CAP.uid || null };
  if (p.tl) body.tl = p.tl; if (p.hol) body.hol = p.hol; if (p.listing) body.listing = p.listing;
  await CAP.db.doc('projects/' + p.id).set(body); p.saved = true;
}
const XHOOK = { audio: null, check: null };
function exportChecks() {
  const out = [], n = S.fields.filter(f => f.type === 'shot').length, ph = phSlots().length, req = reqLeft().filter(f => f.type !== 'prop'), lints = S.fields.filter(f => f.type !== 'shot' && S.proj.text[f.key] !== undefined && lint(String(S.proj.text[f.key])).length).length;
  if (n) out.push(ph ? { w: true, b: ph + ' shot' + (ph > 1 ? 's show' : ' shows') + ' a placeholder', s: 'Add footage, or export with the branded placeholder.', fix: () => { closeEx(); goStep('foot'); } } : { b: 'Footage', s: 'All ' + n + ' shots have footage.' });
  out.push(req.length ? { w: true, b: req.length + ' line' + (req.length > 1 ? 's still have' : ' still has') + ' sample text', s: req.map(f => f.label).slice(0, 4).join(', ') + '. Put in your real details.', fix: () => { closeEx(); goStep('text'); const i = document.querySelector('#f-' + req[0].key); if (i) setTimeout(() => i.focus(), 200); } } : { b: 'Words', s: Object.keys(S.proj.text).length ? 'Your edits are in.' : 'Using the template’s words for ' + B().name + '.' });
  if (lints) out.push({ w: true, b: lints + ' line' + (lints > 1 ? 's' : '') + ' break' + (lints > 1 ? '' : 's') + ' a brand rule', s: 'See the notes under those lines.', fix: () => { closeEx(); goStep('text'); } });
  const extra = XHOOK.check ? XHOOK.check() : ''; if (extra) out.push({ w: true, b: 'Check the edit', s: extra });
  if (HOOK.moreChecks) for (const c of HOOK.moreChecks()) out.push(c);
  const L = curLook(); out.push({ b: 'Look', s: (L.vibe === 'brand' ? 'Brand colours' : L.vibe === 'family' ? ((NX.familyOf(S.tpl.id) || {}).name || 'Family') + ' look' : L.vibe === 'occasion' ? HOL.THEMES[L.hol].name + ' look' : (NX.VIBES.find(v => v.id === L.vibe) || {}).name || (L.vibe.startsWith('hol:') ? HOL.THEMES[L.vibe.slice(4)].name + ' look' : 'Custom look')) + (S.proj.style && (S.proj.style.colors || S.proj.style.fonts) ? ', customised' : '') + (L.fx && (L.fx.p || L.fx.d) ? ' · seasonal touch' : '') });
  return out;
}
function paintChecks(list) {
  const box = $('#exChecks'); box.textContent = '';
  for (const c of list) { const d = el('div', 'check' + (c.w ? ' w' : '')), i = el('i', '', c.w ? '!' : '✓'); d.appendChild(i); const tx = el('div'); tx.appendChild(el('b', '', c.b)); tx.appendChild(el('span', '', c.s)); d.appendChild(tx);
    if (c.fix) { const b = el('button', 'btn sm', 'Fix'); b.type = 'button'; b.onclick = c.fix; d.appendChild(b); } box.appendChild(d); }
}
async function startExport(force) {
  if (EX.running) return; if (S.playing) pause();
  if (force) { await stopThumbs(); for (let k = 0; k < 100 && R.lock; k++) await sleep(50); if (R.lock) { toast('One moment: the preview is still updating.'); return; } }
  const m = $('#exModal'); m.hidden = false; $('#exSave').hidden = true; $('#exAgain').hidden = true; $('#exVideo').hidden = true; $('#exCancel').textContent = 'Back to editing'; $('#exMsg').textContent = '';
  const st = $('#exStatus'), bar = $('#exBar'), cnt = $('#exCount'); bar.style.width = '0'; cnt.textContent = ''; EX.abort = false; EX.blob = null; $('#exBarBox').hidden = true; st.textContent = '';
  $('#exTitle').textContent = 'Export ' + (S.proj.name || S.tpl.name);
  if (!force) { const list = exportChecks(); paintChecks(list); $('#exChecks').hidden = false; const warn = list.some(c => c.w); $('#exGo').hidden = false; $('#exGo').textContent = warn ? 'Export anyway' : 'Export MP4'; $('#exMsg').textContent = warn ? 'You can fix these first or export as it is.' : 'Everything looks good.'; return; }
  $('#exChecks').hidden = true; $('#exGo').hidden = true; $('#exBarBox').hidden = false; $('#exMsg').textContent = '';
  st.textContent = 'Checking this browser…';
  let MB; try { MB = await FB.mb(); } catch (e) { st.textContent = 'The video encoder didn’t load. Reload the page and try again.'; return; }
  if (typeof VideoEncoder === 'undefined' || !(await MB.canEncodeVideo('avc', { width: 1080, height: 1920, bitrate: 1e7 }))) {
    st.textContent = 'This browser can’t encode H.264 video. Export works in Chrome or Edge on a computer.'; $('#exCancel').textContent = 'Close'; return; }
  R.lock = true; EX.running = true; await waitIdle(); const keepT = S.t;
  $('#exCancel').textContent = 'Cancel';
  const tries = ['no-preference', 'prefer-software'];
  for (let a = 0; a < tries.length; a++) {
    try { const blob = await encode(MB, tries[a], (n, N, eta) => { bar.style.width = (n / N * 100) + '%'; cnt.textContent = 'Frame ' + n + ' of ' + N + (eta ? ' · about ' + eta + ' left' : ''); });
      EX.blob = blob; EX.url = URL.createObjectURL(blob);
      st.innerHTML = '<span class="big">Your clip is ready.</span>'; cnt.textContent = (blob.size / 1048576).toFixed(1) + ' MB · ' + fmtT(S.dur).replace(/\.0$/, '') + ' · check it below, then save it.'; $('#exBarBox').hidden = true;
      const v = $('#exVideo'); v.src = EX.url; v.hidden = false; $('#exSave').hidden = false; $('#exAgain').hidden = false; $('#exCancel').textContent = 'Done'; break; }
    catch (e) {
      if (EX.abort || (e && e.message === 'canceled')) { st.textContent = 'Export canceled.'; break; }
      console.error(e); if (a === tries.length - 1) { st.textContent = 'Export failed: ' + (e && e.message || e); $('#exCancel').textContent = 'Close'; }
      else st.textContent = 'Retrying with the software encoder…';
    }
  }
  FB.setMode('seek'); R.lock = false; EX.running = false; setT(keepT); scheduleThumbs(3000);
}
async function encode(MB, hw, prog) {
  $('#exStatus').textContent = 'Rendering 1080 × 1920 at 30 fps. Keep this tab open.';
  const output = new MB.Output({ format: new MB.Mp4OutputFormat({ fastStart: 'in-memory' }), target: new MB.BufferTarget() });
  const vsrc = new MB.CanvasSource(C, { codec: 'avc', bitrate: 10e6, keyFrameInterval: 2, latencyMode: 'quality', hardwareAcceleration: hw });
  output.addVideoTrack(vsrc, { frameRate: 30 });
  let feedAudio = async () => {}, finishAudio = async () => {};
  if (XHOOK.audio && XHOOK.audio(S.proj)) { const h = await XHOOK.audio(S.proj)(MB, output, S.dur); feedAudio = h.feed; finishAudio = h.finish; }
  else {
    const ab = await (await fetch(NX.apack ? await NX.apack.ready(S.proj) : HOOK.audioSrc(S.proj))).blob();   // V20: soundtracks live in packs (nx-sound.js)
    const ain = new MB.Input({ source: new MB.BlobSource(ab), formats: MB.ALL_FORMATS }), atr = await ain.getPrimaryAudioTrack();
    if (atr) {
      const acfg = await atr.getDecoderConfig(), asrc = new MB.EncodedAudioPacketSource(atr.codec); output.addAudioTrack(asrc);
      const apk = new MB.EncodedPacketSink(atr).packets(); let anext = await apk.next(), first = true;
      feedAudio = async upTo => { while (!anext.done && anext.value.timestamp < upTo) { const pk = anext.value; if (pk.timestamp < S.dur) { await asrc.add(pk, first ? { decoderConfig: acfg } : undefined); first = false; } anext = await apk.next(); } };
      finishAudio = () => feedAudio(S.dur + 1);
    }
  }
  await output.start();
  try { if (window.NX && NX.gif && S.proj) await NX.gif.warmProject(S.proj); } catch (e) { console.warn('gif warm', e); }   // chunk #4: decode GIF layers before the first export frame, so no frame is blank
  const N = Math.round(S.dur * 30), t0 = performance.now(); FB.setMode('play');
  try {
    for (let n = 0; n < N; n++) {
      if (EX.abort) throw new Error('canceled');
      const t = n / 30; await feedAudio(t + 0.5);
      await drawFrame(t); await vsrc.add(t, 1 / 30);
      if (n % 3 === 0 || n === N - 1) { const el2 = (performance.now() - t0) / 1000, eta = n > 20 ? Math.max(0, el2 / (n + 1) * (N - n - 1)) : 0; prog(n + 1, N, eta ? (eta > 60 ? Math.round(eta / 60) + ' min' : Math.round(eta) + ' s') : ''); S.t = t; updateTransport(); }
    }
    await finishAudio();
    await output.finalize();
  } catch (e) { try { await output.cancel(); } catch (e2) {} throw e; }
  return new Blob([output.target.buffer], { type: 'video/mp4' });
}

// ---------------------------------------------------------------- brand kit editor
const FONT_PAIRS = NX.FONT_PAIRS;
const PALETTES = [['#FF6500', '#0B0B0B', '#F4F1EA'], ['#E11D48', '#111111', '#F5F2EE'], ['#2563EB', '#0B1220', '#EEF2F7'], ['#16A34A', '#0D1410', '#F1F4EE'],
  ['#EAB308', '#121212', '#F6F3EA'], ['#C08A4B', '#141110', '#F3EDE4'], ['#14B8A6', '#0A1514', '#EEF5F3'], ['#A855F7', '#0F0B16', '#F2EEF7'], ['#F5F5F5', '#0A0A0A', '#EDEDED']];
async function openKit() {
  if (S.playing) pause();
  KIT.draft = clone(S.brand); if (S.brand.logo && S.brand.logo.url) KIT.draft.logo.url = S.brand.logo.url;
  KIT.logoColor = null;
  renderKitForm(); $('#kitModal').hidden = false; $('#kitDel').hidden = !!S.brand.builtin; $('#kitDel').dataset.arm = ''; $('#kitDel').textContent = 'Delete brand';
  $('#kitTitle').textContent = 'Brand kit · ' + S.brand.name; $('#kitMsg').textContent = '';
  $('#kitPrev').classList.remove('closed'); $('#kitPrevToggle').textContent = 'Hide preview';
  $('#kitClose').focus();
  // the kit preview shows the brand's own look (not the clip's style)
  await stopThumbs(); R.lock = true; await waitIdle(); try { await NX.applyLook(NX.lookFor({ style: {} }, Object.assign({}, S.tpl, { hol: false }), KIT.draft), null); } catch (e) {} S.lookKey = ''; R.lock = false; refresh(true);
  paintLogoPrev();
}
$('#kitPrevToggle').onclick = () => { const p = $('#kitPrev'), c = !p.classList.contains('closed'); p.classList.toggle('closed', c); $('#kitPrevToggle').textContent = c ? 'Show preview' : 'Hide preview'; };
function kitInput(now) { $('#kitMsg').textContent = 'Unsaved changes'; clearTimeout(KIT.t); KIT.t = setTimeout(applyDraft, now ? 0 : 220); }
async function applyDraft() {
  const d = KIT.draft; if (!d) return;
  R.lock = true; await waitIdle();
  try { await NX.applyBrand(d); await NX.applyLook(NX.lookFor({ style: {} }, Object.assign({}, S.tpl, { hol: false }), d), null); } catch (e) { console.error(e); $('#kitMsg').textContent = 'The logo or a font did not load.'; }
  S.lookKey = ''; R.lock = false; if (KIT.draft !== d) return;
  paintBrand(); paintLogoPrev(); paintRatios(); refresh(true);
}
async function closeKit() { if (!KIT.draft) return; KIT.draft = null; clearTimeout(KIT.t); $('#kitModal').hidden = true; await reapply(); }
$('#kitClose').onclick = closeKit; $('#kitCancel').onclick = closeKit;
$('#kitPrevEnd').onclick = () => setT(Math.max(0, S.dur - 1.0));
$('#kitSave').onclick = saveKit;
$('#kitDel').onclick = async () => {
  const b = $('#kitDel'); if (S.brand.builtin) return;
  if (b.dataset.arm !== '1') { b.dataset.arm = '1'; b.textContent = 'Delete ' + S.brand.name + '?'; $('#kitMsg').textContent = 'Its saved clips and footage stay stored. Click again to delete the brand.'; return; }
  const id = S.brand.id;
  try { if (CAP.db) await CAP.db.doc('brands/' + id).delete(); } catch (e) { $('#kitMsg').textContent = 'Couldn’t delete (' + (e.code || e.message) + ').'; return; }
  KIT.draft = null; $('#kitModal').hidden = true; S.brands = S.brands.filter(x => x.id !== id); toast('Deleted the brand.'); switchBrand('dpg');
};
async function saveKit() {
  const d = KIT.draft; if (!d) return;
  d.name = (d.name || '').trim().slice(0, 40); if (!d.name) { $('#kitMsg').textContent = 'Give the brand a name.'; return; }
  d.short = (d.short || '').trim().slice(0, 14) || d.name.split(/\s+/)[0];
  const lines = a => (a || []).map(s => String(s).trim()).filter(Boolean);
  d.services = lines(d.services).slice(0, 8); d.billing = lines(d.billing).slice(0, 5);
  d.reviews = (d.reviews || []).filter(r => r && String(r.text || '').trim()).map((r, i) => ({ id: r.id || ('r' + uid8() + i), text: String(r.text).trim(), by: String(r.by || '').trim() }));
  d.updatedAt = new Date().toISOString();
  const btn = $('#kitSave'); btn.disabled = true; $('#kitMsg').textContent = 'Saving…';
  try {
    if (d.logo && d.logo.pendingBlob) {
      if (!CAP.assets) throw Object.assign(new Error('Storing a logo needs edit access to this studio.'), { code: 'no_assets' });
      const up = await CAP.assets.upload(d.logo.pendingBlob, { type: 'image/png' }); d.logo.asset = up.id; delete d.logo.pendingBlob;
    }
    if (CAP.db) await CAP.db.doc('brands/' + d.id).set(storable(d));
    else toast('Brand kits save when the studio is opened on claude.ai. This one lasts until you reload.', 6000);
  } catch (e) { btn.disabled = false; $('#kitMsg').textContent = 'Couldn’t save: ' + (e.message || e.code); return; }
  btn.disabled = false;
  const i = S.brands.findIndex(x => x.id === d.id); if (i >= 0) S.brands[i] = d; else S.brands.push(d);
  S.brand = d; KIT.draft = null; $('#kitModal').hidden = true;
  await reapply(); buildFootage(); scheduleThumbs(); buildGallery(); buildIntents();
  toast('Saved the ' + d.name + ' brand kit.');
}
function paintLogoPrev() {
  const dk = document.getElementById('kitLogoDark'), lt = document.getElementById('kitLogoLight'); if (!dk) return;
  const put = (cv, im) => { const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); if (!im) return; const s = Math.min(cv.width / im.width, cv.height / im.height); g.drawImage(im, (cv.width - im.width * s) / 2, (cv.height - im.height * s) / 2, im.width * s, im.height * s); };
  put(dk, LIGHTPAL ? IMG.logoB : IMG.logoW); put(lt, LIGHTPAL ? IMG.logoW : IMG.logoB);
  dk.parentElement.style.background = B().colors.ink; lt.parentElement.style.background = B().colors.paper;
}
function paintRatios() {
  const p = document.getElementById('kitRatio'); if (!p || !KIT.draft) return; const c = KIT.draft.colors;
  const a = NX.contrast(c.accent, c.ink), b2 = NX.contrast(c.paper, c.ink);
  p.textContent = 'Accent on ink ' + a.toFixed(1) + ':1 · ink on paper ' + b2.toFixed(1) + ':1' + (a < 3 ? ' · the accent is hard to read on the ink colour' : b2 < 7 ? ' · paper and ink are close; text on paper cards may be faint' : ' · good contrast');
  p.className = 'ratio' + (a < 3 || b2 < 7 ? ' w' : '');
}
function renderKitForm() {
  const d = KIT.draft, form = $('#kitForm'), dpg = !!d.builtin; form.textContent = '';
  const section = (title, note) => { const s = el('section', 'kit-sec'); s.appendChild(el('h3', '', title)); if (note) s.appendChild(el('p', '', note)); form.appendChild(s); return s; };
  const field = (label, get, set, o) => {
    o = o || {}; const w = el('div', 'fld'), id = 'k-' + uid8(), lab = el('label'); lab.htmlFor = id; lab.appendChild(document.createTextNode(label)); if (o.cnt) lab.appendChild(el('span', 'cnt', o.cnt)); w.appendChild(lab);
    const i = el(o.area ? 'textarea' : 'input'); i.id = id; if (!o.area) { i.type = 'text'; i.autocomplete = 'off'; } else i.rows = o.rows || 4;
    i.value = get() || ''; if (o.ph) i.placeholder = o.ph; if (o.max) i.maxLength = o.max; if (o.ro) i.readOnly = true; if (o.up) i.classList.add('up');
    i.addEventListener('input', () => { set(i.value); kitInput(); }); w.appendChild(i); if (o.hint) w.appendChild(el('p', 'hint', o.hint)); return w;
  };
  const select = (label, opts, get, set) => { const w = el('div', 'fld'), id = 'k-' + uid8(), lab = el('label', '', label); lab.htmlFor = id; w.appendChild(lab); const s = el('select'); s.id = id;
    opts.forEach(([v, t]) => { const o = el('option', '', t); o.value = v; s.appendChild(o); }); s.value = get(); s.onchange = () => { set(s.value); kitInput(true); }; w.appendChild(s); return w; };
  const row = (...xs) => { const r = el('div', 'row'); xs.forEach(x => r.appendChild(x)); return r; };
  let s = section('Identity', dpg ? 'DPG Outdoor Living is built in, with its footage library and claims rules.' : 'The name shows in titles, captions and endings. The industry sets the starting copy for every template.');
  s.appendChild(row(field('Business name', () => d.name, v => (d.name = v), { max: 40, ro: dpg }), field('Short name', () => d.short, v => (d.short = v), { max: 14, ro: dpg, hint: 'Used where space is tight, like “BUILT BY ' + (d.short || 'YOU').toUpperCase() + '”.' })));
  const indSel = dpg ? field('Industry', () => indOf(d).label, () => {}, { ro: true }) : select('Industry', Object.entries(NX.INDUSTRIES).map(([k, v]) => [k, v.label]), () => d.industry, v => {
    const old = indOf(d), nu = NX.INDUSTRIES[v]; d.industry = v;
    ['cta', 'tagline'].forEach(k => { if (!d.contact[k] || d.contact[k] === old[k]) d.contact[k] = nu[k]; });
    if (JSON.stringify(d.services) === JSON.stringify(old.services) || !d.services.length) d.services = nu.services.slice();
    if (JSON.stringify(d.billing) === JSON.stringify(old.billing) || !d.billing.length) d.billing = nu.billing.slice();
    renderKitForm(); paintLogoPrev(); paintRatios();
  });
  s.appendChild(row(indSel, field('Descriptor', () => d.descriptor, v => (d.descriptor = v.toUpperCase()), { max: 44, up: true, ph: 'e.g. MOBILE DETAILING & COATINGS', hint: 'A short line under the logo in some endings.' })));
  s = section('Logo', dpg ? 'DPG’s logo and its animated build are built in.' : 'Upload a PNG or SVG. A white background is removed automatically. Without a logo, the brand name is set as a wordmark.');
  const lb = el('div', 'logo-box');
  const ld = el('div', 'logo-prev dark'), lc = el('canvas'); lc.id = 'kitLogoDark'; lc.width = 480; lc.height = 128; ld.appendChild(lc);
  const ll = el('div', 'logo-prev light'), lc2 = el('canvas'); lc2.id = 'kitLogoLight'; lc2.width = 480; lc2.height = 128; ll.appendChild(lc2);
  lb.appendChild(ld); lb.appendChild(ll); s.appendChild(lb);
  if (!dpg) {
    const acts = el('div', 'insp-actions'), up = el('button', 'btn sm', d.logo && (d.logo.asset || d.logo.url) ? 'Replace logo' : 'Upload logo'); up.type = 'button';
    up.onclick = () => { const fi = $('#logoFile'); fi.onchange = async () => { const f = fi.files[0]; fi.value = ''; if (f) await useLogoFile(f); }; fi.click(); };
    acts.appendChild(up);
    if (d.logo && (d.logo.asset || d.logo.url)) { const rm = el('button', 'btn sm ghost', 'Use the wordmark instead'); rm.type = 'button'; rm.onclick = () => { d.logo = { asset: null, onDark: d.logo.onDark, onLight: d.logo.onLight }; renderKitForm(); kitInput(true); }; acts.appendChild(rm); }
    s.appendChild(acts);
    s.appendChild(row(select('On dark backgrounds', [['white', 'White version'], ['original', 'Original colours']], () => d.logo.onDark || 'white', v => (d.logo.onDark = v)),
      select('On light backgrounds', [['original', 'Original colours'], ['dark', 'Ink-colour version']], () => d.logo.onLight || 'original', v => (d.logo.onLight = v))));
  }
  s = section('Brand colours', 'The default look of every clip. Each clip can still switch looks in its Style step. Accent marks highlights, buttons and the logo build; ink is the dark background; paper is the light card colour.');
  const swatch = (label, k) => {
    const w = el('div', 'fld'), lab = el('label', '', label), id = 'k-' + uid8(); lab.htmlFor = id; w.appendChild(lab);
    const sw = el('div', 'swatch'), ci = el('input'); ci.type = 'color'; ci.value = d.colors[k].toLowerCase(); ci.setAttribute('aria-label', label + ' picker');
    const ti = el('input'); ti.type = 'text'; ti.id = id; ti.value = d.colors[k]; ti.maxLength = 7; ti.autocomplete = 'off';
    ci.oninput = () => { d.colors[k] = normHex(ci.value); ti.value = d.colors[k]; paintRatios(); kitInput(); };
    ti.oninput = () => { if (isHex(ti.value)) { d.colors[k] = normHex(ti.value); ci.value = d.colors[k].toLowerCase(); paintRatios(); kitInput(); } };
    sw.appendChild(ci); sw.appendChild(ti); w.appendChild(sw); return w;
  };
  const cr = el('div', 'row'); cr.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))'; cr.appendChild(swatch('Accent', 'accent')); cr.appendChild(swatch('Ink', 'ink')); cr.appendChild(swatch('Paper', 'paper')); s.appendChild(cr);
  const rt = el('p', 'ratio'); rt.id = 'kitRatio'; s.appendChild(rt);
  const pal = el('div', 'palettes'); pal.appendChild(el('span', '', 'Quick palettes'));
  const pals = (KIT.logoColor ? [[KIT.logoColor, d.colors.ink, d.colors.paper]] : []).concat(PALETTES);
  pals.forEach((p, i) => { const b = el('button'); b.type = 'button'; b.title = i === 0 && KIT.logoColor ? 'From your logo' : 'Use this palette'; p.forEach(c => { const x = el('i'); x.style.background = c; b.appendChild(x); });
    b.onclick = () => { d.colors = { accent: p[0], ink: p[1], paper: p[2] }; renderKitForm(); paintLogoPrev(); paintRatios(); kitInput(true); }; pal.appendChild(b); });
  s.appendChild(pal);
  s = section('Brand fonts', 'Four slots: headline (titles, labels, captions), serif (quotes, reviews, editorial lines), display (big condensed words and footage-in-text) and script (handwritten notes).');
  d.fonts = Object.assign({ sans: 'mont', serif: 'corm', display: 'bebas', script: 'caveat' }, d.fonts || {});
  const pairs = el('div', 'pairs'); s.appendChild(pairs);
  FONT_PAIRS.forEach(([name, f]) => { const b = el('button', '', name); b.type = 'button'; b.setAttribute('aria-pressed', String(JSON.stringify(f) === JSON.stringify(d.fonts)));
    NX.useFont(f.display).then(ok => { const ff = ok && NX.fontCSS ? NX.fontCSS(f.display) : null; if (ff) b.style.fontFamily = ff; }); b.onclick = () => { d.fonts = Object.assign({}, f); renderKitForm(); paintLogoPrev(); kitInput(true); }; pairs.appendChild(b); });
  const fr = el('div', 'row'); fr.style.marginTop = '12px'; s.appendChild(fr);
  for (const [sl, SL] of Object.entries(NX.SLOTS)) {
    const w = select(SL.label + ' font', Object.entries(NX.FONTS[sl]).map(([k, v]) => [k, v.label]), () => d.fonts[sl], v => { d.fonts[sl] = v; prev(); });
    const pv = el('div', 'fontpv'), prev = () => { const k = d.fonts[sl]; NX.useFont(k).then(() => { const ff = NX.fontCSS ? NX.fontCSS(k) : null; if (ff) pv.style.fontFamily = ff; }); };
    pv.textContent = sl === 'script' ? 'see you this weekend!' : sl === 'serif' ? 'Quietly beautiful work.' : sl === 'display' ? 'BUILT TO LAST' : 'BOOK YOUR SPOT';
    pv.style.fontWeight = sl === 'sans' ? '800' : sl === 'serif' ? '600' : '400'; if (sl === 'serif') pv.style.fontStyle = 'italic';
    w.appendChild(pv); fr.appendChild(w); prev();
  }
  s = section('Contact block', dpg ? 'Phone, website, licence and the call to action are fixed for DPG and appear on every ending.' : 'Shown on endings and CTA cards. Leave a line empty to drop it.');
  const C2 = d.contact, lk = k => dpg && DPG_LOCK.includes(k);
  s.appendChild(row(field('Phone', () => C2.phone, v => (C2.phone = v), { max: 24, ro: lk('phone') }), field('Website', () => C2.web, v => (C2.web = v), { max: 40, ro: lk('web') })));
  s.appendChild(row(field('Call to action', () => C2.cta, v => (C2.cta = v.toUpperCase()), { max: 30, up: true, ro: lk('cta') }), field('Licence line', () => C2.lic, v => (C2.lic = v.toUpperCase()), { max: 30, up: true, ro: lk('lic'), ph: 'e.g. LIC. #123456' })));
  s.appendChild(row(field('Tagline', () => C2.tagline, v => (C2.tagline = v), { max: 44 }), field('Badge', () => C2.badge, v => (C2.badge = v.toUpperCase()), { max: 24, up: true, ph: 'e.g. ' + (indOf(d).badge || 'FAMILY OWNED'), hint: 'Only a claim that’s true for this business.' })));
  s.appendChild(row(field('Service area', () => C2.area, v => (C2.area = v.toUpperCase()), { max: 32, up: true, ph: 'e.g. NORTH DALLAS' }), field('Since', () => C2.since, v => (C2.since = v.toUpperCase()), { max: 20, up: true, ph: 'e.g. SINCE 2015' })));
  s = section('Address, hours and socials', 'Used by the address line, hours chip, socials, contact card and info strip in the Brand tab, and by the contact strip on templates. Leave a line empty to drop it.');
  s.appendChild(row(field('Street address', () => C2.address || '', v => (C2.address = v), { max: 64, ph: 'e.g. 123 Main St, Riverside' }), field('Hours', () => C2.hours || '', v => (C2.hours = v), { max: 44, ph: 'e.g. Mon–Sat 9–7' })));
  s.appendChild(row(field('Email', () => C2.email || '', v => (C2.email = v.trim()), { max: 60 }), field('WhatsApp', () => C2.wa || '', v => (C2.wa = v), { max: 26, ph: 'number' }), field('X', () => C2.x || '', v => (C2.x = v.trim()), { max: 40, ph: '@handle' })));
  s.appendChild(row(field('Instagram', () => C2.ig || '', v => (C2.ig = v.trim()), { max: 40, ph: '@handle' }), field('Facebook', () => C2.fb || '', v => (C2.fb = v.trim()), { max: 50, ph: 'page name' })));
  s.appendChild(row(field('TikTok', () => C2.tt || '', v => (C2.tt = v.trim()), { max: 40, ph: '@handle' }), field('YouTube', () => C2.yt || '', v => (C2.yt = v.trim()), { max: 50, ph: '@channel' })));
  s = section('Services and billing', 'Services fill tags and chips. Billing lines roll at the end of the Movie Trailer; {brand} and {area} fill in.');
  s.appendChild(row(field('Services', () => (d.services || []).join('\n'), v => (d.services = v.split('\n').map(x => x.toUpperCase())), { area: true, rows: 6, cnt: 'one per line, up to 8' }),
    field('Trailer billing', () => (d.billing || []).join('\n'), v => (d.billing = v.split('\n')), { area: true, rows: 6, cnt: 'one per line, up to 5' })));
  s = section('Reviews', 'Paste reviews word for word from where they were published. The Client Review template shows them exactly as written, never edited.');
  (d.reviews || []).forEach((r, i) => {
    const box = el('div', 'rev');
    box.appendChild(field('Review ' + (i + 1), () => r.text, v => (r.text = v), { area: true, rows: 3 }));
    const rr = el('div', 'row'); rr.appendChild(field('Who and where', () => r.by, v => (r.by = v), { max: 40, ph: 'e.g. MARIA G. · GOOGLE' }));
    const rm = el('button', 'btn sm ghost danger', 'Remove'); rm.type = 'button'; rm.style.alignSelf = 'end'; rm.onclick = () => { d.reviews.splice(i, 1); renderKitForm(); kitInput(true); }; rr.appendChild(rm);
    box.appendChild(rr); s.appendChild(box);
  });
  const ar = el('button', 'btn sm', '+ Add a review'); ar.type = 'button'; ar.onclick = () => { (d.reviews = d.reviews || []).push({ id: 'r' + uid8(), text: '', by: '' }); renderKitForm(); }; s.appendChild(ar);
  s = section('Ad rules', 'Lines that break a rule get a soft warning while you edit. Nothing is blocked.');
  const R2 = d.rules = d.rules || {};
  const chk = (label, k) => { const w = el('label', 'chk'), i = el('input'); i.type = 'checkbox'; i.checked = !!R2[k]; i.disabled = dpg; i.onchange = () => { R2[k] = i.checked; kitInput(); }; w.appendChild(i); w.appendChild(document.createTextNode(label)); return w; };
  s.appendChild(chk('Flag superlatives (best, #1, top-rated)', 'superlatives')); s.appendChild(chk('Flag prices, discounts and financing', 'prices')); s.appendChild(chk('Flag star ratings', 'stars'));
  s.appendChild(field('Words to avoid', () => R2.words, v => (R2.words = v), { ph: 'comma separated, e.g. cheap, guaranteed', max: 200 }));
  if (dpg) s.appendChild(el('p', 'lock', 'DPG rules always apply: published facts only, reviews word for word, no prices or star ratings, “pool deck” not “pool”, no lighting or fire features presented as services, lawns only when synthetic, and the licence on every ending.'));
  paintRatios();
}
async function useLogoFile(f) {
  const d = KIT.draft; if (!d) return;
  $('#kitMsg').textContent = 'Reading the logo…';
  try {
    const cv = await NX.processLogoFile(f);
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    if (blob.size > 2 * 1048576) throw new Error('That logo is very large. Use one under 2 MB.');
    d.logo = Object.assign({ onDark: 'white', onLight: 'original' }, d.logo, { url: URL.createObjectURL(blob), pendingBlob: blob });
    KIT.logoColor = NX.dominantColor(cv);
    $('#kitMsg').textContent = KIT.logoColor ? 'Logo added. The first quick palette uses its colour.' : 'Logo added.';
    renderKitForm(); kitInput(true);
  } catch (e) { $('#kitMsg').textContent = String(e.message || e); }
}

// ---------------------------------------------------------------- new brand wizard
const WZ = { ind: 'general', logo: null };
function openWizard() {
  if (S.playing) pause();
  WZ.ind = 'general'; WZ.logo = null; ['wizName', 'wizPhone', 'wizWeb', 'wizArea'].forEach(id => ($('#' + id).value = '')); $('#wizLogo').value = ''; $('#wizMsg').textContent = '';
  const g = $('#wizInd'); g.textContent = '';
  for (const [k, v] of Object.entries(NX.INDUSTRIES)) {
    const b = el('button', '', v.label); b.type = 'button'; b.setAttribute('aria-pressed', String(k === WZ.ind)); b.appendChild(el('small', '', v.services.slice(0, 2).join(' · ').toLowerCase()));
    b.onclick = () => { WZ.ind = k; g.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); fillWizServices(); }; g.appendChild(b);
  }
  fillWizServices();
  $('#wizModal').hidden = false; $('#wizName').focus();
}
const titleCase = x => x.toLowerCase().replace(/(^|[\s&/-])([a-z])/g, (m, a, c) => a + c.toUpperCase());
function fillWizServices() { const i = $('#wizServices'), ind = NX.INDUSTRIES[WZ.ind]; i.value = WZ.ind === 'general' ? '' : ind.services.map(titleCase).join(', '); i.placeholder = WZ.ind === 'general' ? 'e.g. Installs, Repairs, Maintenance' : ''; }
const closeWizard = () => ($('#wizModal').hidden = true);
$('#wizClose').onclick = closeWizard; $('#wizCancel').onclick = closeWizard;
$('#wizCreate').onclick = async () => {
  const name = $('#wizName').value.trim(); if (!name) { $('#wizMsg').textContent = 'Type the business name.'; $('#wizName').focus(); return; }
  if (S.brands.some(b => b.name.toLowerCase() === name.toLowerCase())) { $('#wizMsg').textContent = 'There’s already a brand with that name.'; return; }
  const btn = $('#wizCreate'); btn.disabled = true; $('#wizMsg').textContent = 'Setting up ' + name + '…';
  const b = NX.newBrand(name, WZ.ind);
  const sv = $('#wizServices').value.split(',').map(x => x.trim().toUpperCase()).filter(Boolean).slice(0, 8); if (sv.length) b.services = sv;
  b.contact.phone = $('#wizPhone').value.trim(); b.contact.web = $('#wizWeb').value.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '').toUpperCase(); b.contact.area = $('#wizArea').value.trim().toUpperCase();
  try {
    const f = $('#wizLogo').files[0];
    if (f) {
      const cv = await NX.processLogoFile(f), blob = await new Promise(r => cv.toBlob(r, 'image/png')), col = NX.dominantColor(cv);
      if (col && NX.contrast(col, b.colors.ink) >= 2.4) b.colors.accent = col;
      b.logo.url = URL.createObjectURL(blob);
      if (CAP.assets) { const up = await CAP.assets.upload(blob, { type: 'image/png' }); b.logo.asset = up.id; }
    }
    if (CAP.db) await CAP.db.doc('brands/' + b.id).set(storable(b));
    else toast('Brands save when the studio is opened on claude.ai. This one lasts until you reload.', 6000);
  } catch (e) { btn.disabled = false; $('#wizMsg').textContent = 'Couldn’t create the brand: ' + (e.message || e.code); return; }
  btn.disabled = false; closeWizard();
  if (!S.brands.some(x => x.id === b.id)) S.brands.push(b);
  await switchBrand(b.id); setView('home');
  toast(name + ' is ready. Every template now uses its colours and ' + indOf(b).label.toLowerCase() + ' copy. Open Brand kit to fine-tune.', 6500);
};

// ---------------------------------------------------------------- db subscriptions
function subscribe() {
  const db = CAP.db; if (!db) return;
  db.collection('clips').onSnapshot(snap => {
    const seen = new Set();
    snap.docs.forEach(d => { const r = d.data(); if (!r || !r.id || !r.asset || !r.n) return; seen.add(r.id); NX.addClip(Object.assign({}, r, { src: 'up', brand: r.brand || 'dpg' })); });
    for (const [id, r] of CLIPS) if (r.src === 'up' && !seen.has(id)) NX.dropClip(id);
    if (!$('#picker').hidden) buildPickerLib();
    buildFootage();
    if (S.proj && Object.values(S.proj.shot).some(v => v && v.c && v.c[0] === 'u')) refresh(true); else paintBanner();
  }, e => console.warn('clips', e));
  db.collection('projects').orderBy('updatedAt', 'desc').limit(400).onSnapshot(snap => {
    S.projects = snap.docs.map(d => d.data()).filter(p => p && p.id && p.tpl);
    if (S.proj && S.projects.some(p => p.id === S.proj.id)) S.proj.saved = true;
    buildProjects(); restoreLast();
  }, e => { console.warn('projects', e); buildProjects(); });
  db.collection('brands').onSnapshot(snap => {
    const docs = snap.docs.map(d => d.data()).filter(b => b && b.id);
    const list = [mergeDPG(docs.find(b => b.id === 'dpg'))].concat(docs.filter(b => b.id !== 'dpg' && b.name).map(normBrand).sort((a, b) => a.name.localeCompare(b.name)));
    const cur = S.brand, nb = list.find(b => b.id === cur.id);
    if (nb && cur.logo && cur.logo.url && nb.logo && nb.logo.asset === cur.logo.asset) nb.logo.url = cur.logo.url;
    S.brands = list.map(b => (b.id === cur.id && nb && sig(b) === sig(cur) ? cur : b));
    if (!nb && !KIT.draft) { switchBrand('dpg'); return; }
    if (nb && !KIT.draft && S.brands.includes(nb)) { S.brand = nb; reapply(); scheduleThumbs(); }
    if (!S.brandRestored) { S.brandRestored = true; const want = ls.get('nx.brand'); if (want && want !== S.brand.id && list.some(b => b.id === want)) switchBrand(want); }
  }, e => console.warn('brands', e));
}
function restoreLast() {
  if (S.restored.has(S.brand.id)) return; S.restored.add(S.brand.id);
  const p = lastFor(S.brand.id);
  if (p && (!S.proj || (!S.proj.saved && !dirty && !Object.keys(S.proj.text).length && !Object.keys(S.proj.shot).length))) openProject(Object.assign(clone(p), { saved: true }), { stay: S.view !== 'work' });
}

// ---------------------------------------------------------------- public surface for the AI writer, the style pane and the editor
NX.app = { S, B, CAP, R, TPLS, TPL, toast, el, $, fmtT, sec, clone, uid8, build, buildWith, packCopy, requestRender, setT, pause, play, edited, refresh, markDirty, openProject, newProject,
  fieldVal, shotVal, syncInspector, buildInspector, lintFor: b => lintFor(b), lint: s => lint(s), indOf, openPicker, openManage, pickFiles, buildGallery, waitIdle, drawFrame,
  afterRender, onRebuild, onOpen, onTime, onClips, HOOK, phSlots, closePicker, buildFootage, posterOf, setSave, XHOOK, THUMB, scheduleThumbs, setTemplateAudio, updateTransport, buildProjects, markCurrent, posterFor,
  styleChanged, syncLook, setView, goStep, openPreview, queueFootage, isPhoto, renderOne, stopThumbs, flush, usesListing, reqLeft, paintTools, POSTER: id => posterT(id), variantSibs, variantThumbs, switchFamily, exportBlob, cancelExport: () => { EX.abort = true; }, saveProjectDoc };
$('#aiBtn').onclick = () => NX.ai && NX.ai.open({});

// ---------------------------------------------------------------- boot
async function boot() {
  setView('home');
  paintBrand(); buildIntents(); buildFilters(); buildGallery(); buildProjects(); buildFootage(); buildSeason(); buildSig(); buildIndustries();
  $('#ph').src = 'posters/spot.jpg';
  try {
    await Promise.all([NX.loadFixedFonts(), K3.init({ grunge: true })]);
    await NX.applyBrand(S.brand);
    buildNoise();
  } catch (e) { console.error(e); toast('Some studio files did not load. Reload the page.'); }
  for (const tp of TPLS) { if (tp.hidden) continue; try { buildWith(tp, { text: {}, shot: {}, hol: tp.hol ? NX.defaultHol() : null }, S.brand); tp.dur = DIR.dur; tp.nShots = FIELDS.filter(f => f.type === 'shot').length; tp.nLines = FIELDS.filter(f => f.type !== 'shot').length; } catch (e) { console.error(tp.id, e); } }
  buildGallery();
  openProject(newProject(TPL('spot')), { stay: true });
  await capsReady;
  if (!CAP.db) setSave('Saving off', false, 'Saving works when the studio is opened on claude.ai.');
  buildInspector(); buildFootage(); paintTools();
  if (CAP.db) subscribe(); else buildProjects();
  if (S.proj && dirty) markDirty();
  window.__nxReady = true;
  scheduleThumbs();
}
boot();
})();
