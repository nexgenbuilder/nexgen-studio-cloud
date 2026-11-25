'use strict';
/* NexGen Clip Studio: the timeline editor. A free edit is a project whose template is 'free' (engine/tpl_free.js) and
   whose tl holds a magnetic main track (clips, colour cards, whole templates as blocks, the brand ending), overlay layers
   (text styles, stickers, picture-in-picture) and audio (a music bed, template soundtracks, sound effects). This module
   draws the timeline, the panels and the inspector, handles dragging on the timeline and on the preview, mixes the audio
   in the browser and feeds the mix to the MP4 export. */
(() => {
const A = NX.app, $ = A.$, el = A.el, S = A.S, fmtT = A.fmtT, clone = A.clone;
const FREE_TPL = { id: 'free', name: 'Free edit', file: 'free', v: 'free', fam: 'Edit', hidden: true, blurb: 'Your own edit on the timeline.', posterT: 0.5 };
NX.TPLS.push(FREE_TPL);
const uid = () => 'i' + A.uid8();
const r3 = x => Math.round(x * 1000) / 1000;

// ------------------------------------------------------------------------------------------------ styles
const CSS = `
body.mode-edit .rail .tabs, body.mode-edit .rail .pane { display: none !important; }
body.mode-edit .insp > :not(#einsp) { display: none !important; }
body.mode-edit .screen { cursor: default; touch-action: none; }
body.mode-edit #ov { pointer-events: none; }
#einsp { display: none; }
body.mode-edit #einsp { display: block; }
.ep-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 12px 0 10px; position: sticky; top: 0; z-index: 3; background: var(--surface); }
.ep-tabs button { background: transparent; border: 1px solid var(--line); border-radius: 8px; padding: 7px 4px; font: 700 10px/1.1 var(--f-mono); letter-spacing: .1em; text-transform: uppercase; color: var(--dim); }
.ep-tabs button[aria-selected="true"] { color: var(--fg); border-color: var(--accent); background: var(--accent-soft); }
.ep-body { overflow: auto; min-height: 0; flex: 1; padding-bottom: 20px; scrollbar-width: thin; }
.ep-sec { font: 700 10px/1 var(--f-mono); letter-spacing: .16em; text-transform: uppercase; color: var(--dim); margin: 14px 0 8px; }
.ep-sec:first-child { margin-top: 2px; }
.ep-note { font-size: 12px; color: var(--dim); margin: 0 0 10px; }
.ep-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ep-btn { background: var(--raise); border: 1px solid var(--line); border-radius: 8px; padding: 10px; text-align: left; min-width: 0; color: var(--fg); position: relative; }
.ep-btn:hover { border-color: var(--mute); }
.ep-btn[aria-pressed="true"] { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
.ep-btn small { display: block; font: 500 10px/1.3 var(--f-mono); color: var(--dim); margin-top: 3px; }
.ep-btn:has(.pv) { background: #1B1B22; border-color: #1B1B22; color: #F2F2F6; } .ep-btn:has(.pv) small { color: rgba(255,255,255,.6); } .ep-btn:has(.pv):hover { border-color: var(--accent); }
.ep-btn .pv { display: block; color: #fff; line-height: 1.05; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
.ep-media { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ep-clip { position: relative; background: var(--raise); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; padding: 0; text-align: left; color: var(--fg); }
.ep-clip:hover { border-color: var(--mute); }
.ep-clip .fi { aspect-ratio: 16 / 10; background: #000; display: grid; place-items: center; overflow: hidden; }
.ep-clip .fi img { max-width: 100%; max-height: 100%; display: block; }
.ep-clip .fn { padding: 6px 8px 7px; font-weight: 700; font-size: 11.5px; line-height: 1.25; overflow-wrap: anywhere; }
.ep-clip .fn small { display: block; font: 500 10px/1.3 var(--f-mono); color: var(--dim); }
.ep-clip .pip { position: absolute; right: 5px; top: 5px; font: 700 9px/1 var(--f-mono); letter-spacing: .08em; background: rgba(0,0,0,.72); color: #fff; border: 1px solid rgba(255,255,255,.3); border-radius: 4px; padding: 4px 5px; }
.ep-clip .pip:hover { background: var(--accent); color: var(--accent-ink); }
.ep-tpl { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.ep-tpl button { background: none; border: 0; padding: 0; text-align: left; color: var(--fg); min-width: 0; }
.ep-tpl img { width: 100%; aspect-ratio: 9 / 16; object-fit: cover; border-radius: 5px; border: 1px solid var(--line); display: block; background: var(--well); }
.ep-tpl span { display: block; font-size: 11px; font-weight: 700; margin-top: 4px; line-height: 1.2; }
.ep-tpl button:hover img { border-color: var(--accent); }
.sw { display: inline-block; width: 14px; height: 14px; border-radius: 3px; vertical-align: -2px; margin-right: 6px; box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
/* timeline */
.tlx-bar { display: flex; align-items: center; gap: 6px; padding: 8px 0; flex-wrap: wrap; }
.tlx-bar .sp { flex: 1; }
.tlx-bar .tool:disabled { opacity: .35; cursor: default; }
.tlx-bar .zoom { width: 110px; accent-color: var(--accent); }
.tlx-body { position: relative; flex: 1; min-height: 0; overflow: auto; border: 1px solid var(--line); border-radius: 8px; background: var(--well); scrollbar-width: thin; touch-action: pan-y; }
.tl-in { position: relative; min-height: 100%; }
.tl-ruler { position: absolute; left: 0; right: 0; top: 0; height: 22px; border-bottom: 1px solid var(--line); cursor: ew-resize; }
.tl-tick { position: absolute; top: 0; height: 22px; border-left: 1px solid var(--line2); padding-left: 4px; font: 500 9.5px/22px var(--f-mono); color: var(--dim); white-space: nowrap; pointer-events: none; }
.tl-tick.minor { height: 6px; top: 16px; padding: 0; }
.tl-lane { position: absolute; left: 0; right: 0; }
.tl-lane.main { background: color-mix(in srgb, var(--fg) 4%, transparent); }
.tl-lname { position: sticky; left: 6px; display: inline-block; font: 700 9px/1 var(--f-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--dim); padding-top: 4px; pointer-events: none; z-index: 1; }
.ti { position: absolute; border-radius: 6px; overflow: hidden; cursor: grab; box-shadow: inset 0 0 0 1px rgba(0,0,0,.4); user-select: none; touch-action: none; }
.ti.sel { box-shadow: 0 0 0 2px var(--accent), inset 0 0 0 1px rgba(0,0,0,.4); z-index: 3; }
.ti.drag { opacity: .75; z-index: 5; cursor: grabbing; }
.ti .lab { position: absolute; left: 6px; right: 6px; top: 4px; font: 700 10px/1.2 var(--f-ui); color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 3px rgba(0,0,0,.9); pointer-events: none; }
.ti .dur { position: absolute; left: 6px; bottom: 3px; font: 500 9px/1 var(--f-mono); color: rgba(255,255,255,.85); text-shadow: 0 1px 3px rgba(0,0,0,.9); pointer-events: none; }
.ti .h { position: absolute; top: 0; bottom: 0; width: 9px; cursor: ew-resize; background: transparent; }
.ti .h.l { left: 0; } .ti .h.r { right: 0; }
.ti.sel .h { background: var(--accent); opacity: .9; }
.ti.sel .h::after { content: ""; position: absolute; left: 3px; top: 35%; bottom: 35%; width: 3px; border-radius: 2px; background: var(--accent-ink); opacity: .6; }
.ti.m-clip { background-color: #2c2622; background-repeat: repeat-x; background-size: auto 100%; }
.ti.m-tpl { background-color: #3a2f27; background-repeat: repeat-x; background-size: auto 100%; }
.ti.m-tpl::before { content: "TEMPLATE"; position: absolute; right: 6px; bottom: 3px; font: 700 8.5px/1 var(--f-mono); letter-spacing: .1em; color: rgba(255,255,255,.75); }
.ti.m-end { background: repeating-linear-gradient(135deg, var(--accent) 0 10px, color-mix(in srgb, var(--accent) 70%, #000) 10px 20px); }
.ti.k-text { background: #6d58d6; } .ti.k-sticker { background: #b9852b; } .ti.k-pip { background: #2f8c86; } .ti.k-mg { background: #b8457e; } .ti.k-type { background: #5b4bd0; } .ti.k-gif { background: #7d5ba6; }
.ti.k-text .lab, .ti.k-sticker .lab, .ti.k-pip .lab, .ti.k-mg .lab, .ti.k-type .lab { top: 50%; transform: translateY(-50%); }
.ti .kfd { position: absolute; bottom: 2px; width: 7px; height: 7px; margin-left: -3.5px; background: #fff; transform: rotate(45deg); box-shadow: 0 0 0 1px rgba(0,0,0,.5); pointer-events: none; }
.ti.msel { box-shadow: 0 0 0 2px #fff, inset 0 0 0 1px rgba(0,0,0,.4); z-index: 3; }
.ep-tabs { grid-template-columns: repeat(3, 1fr); }
.ti.a-bed { background: #2e4a3a; cursor: pointer; }
.ti.a-blk { background: repeating-linear-gradient(135deg, rgba(255,255,255,.35) 0 4px, rgba(255,255,255,.08) 4px 8px); box-shadow: none; pointer-events: none; border-radius: 2px; }
.sfx { position: absolute; width: 14px; height: 14px; margin-left: -7px; border-radius: 50%; background: #e7c66c; border: 2px solid var(--well); padding: 0; cursor: grab; z-index: 4; touch-action: none; }
.sfx.sel { box-shadow: 0 0 0 2px var(--accent); }
.trc { position: absolute; width: 15px; height: 15px; margin-left: -7.5px; border-radius: 3px; transform: rotate(45deg); background: var(--panel); border: 1px solid var(--line2); padding: 0; z-index: 4; cursor: pointer; }
.trc.on { background: var(--accent); border-color: var(--accent); }
.trc:hover { border-color: var(--fg); }
.tl-ph { position: absolute; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: var(--fg); pointer-events: none; z-index: 6; }
.tl-ph::before { content: ""; position: absolute; top: 0; left: -5px; border: 6px solid transparent; border-top: 8px solid var(--fg); }
.tl-drop { position: absolute; width: 3px; margin-left: -1.5px; background: var(--accent); z-index: 7; pointer-events: none; border-radius: 2px; }
.tl-snap { position: absolute; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: var(--accent); pointer-events: none; z-index: 6; }
.tl-empty { position: absolute; left: 14px; font-size: 12px; color: var(--dim); pointer-events: none; }
/* inspector */
.ei-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
.ei-head h2 { margin: 0; font: 800 15px/1.2 var(--f-ui); }
.ei-head p { margin: 3px 0 0; font: 500 11px/1.3 var(--f-mono); color: var(--dim); }
.seg { display: flex; flex-wrap: wrap; gap: 4px; }
.seg button { background: var(--well); border: 1px solid var(--line2); border-radius: 6px; padding: 6px 9px; font-size: 12px; font-weight: 600; color: var(--mute); }
.seg button[aria-pressed="true"] { color: var(--fg); border-color: var(--accent); background: var(--accent-soft); }
.rng { display: flex; align-items: center; gap: 10px; }
.rng input[type=range] { flex: 1; accent-color: var(--accent); min-width: 0; }
.rng output { font: 600 11.5px/1 var(--f-mono); color: var(--mute); min-width: 52px; text-align: right; }
.ei-acts { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
.ei-thumb { width: 100%; max-height: 150px; object-fit: contain; background: #000; border-radius: 6px; display: block; margin-bottom: 10px; }
.sugg { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
.sugg button { text-align: left; background: var(--well); border: 1px dashed var(--line2); border-radius: 6px; padding: 7px 9px; font-size: 12.5px; color: var(--fg); }
.sugg button:hover { border-color: var(--accent); }
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: CSS }));

// ------------------------------------------------------------------------------------------------ catalogues
const TEXTS = [
  { style: 'headline', name: 'Headline', text: 'YOUR HEADLINE', size: 130, y: 560, pv: ['900 19px Mont', 'HEADLINE'] },
  { style: 'headline', name: 'Highlight', text: 'MAKE IT\nPOP', size: 140, y: 560, hl: true, pv: ['900 19px Mont', 'POP', 1] },
  { style: 'slam', name: 'Word by word', text: 'BUILT TO LAST', size: 120, y: 620, hl: true, pv: ['900 17px Mont', 'WORD BY WORD'] },
  { style: 'caption', name: 'Caption', text: 'Say what the viewer is looking at', size: 58, y: 1380, pv: ['800 14px Mont', 'Social caption', 2] },
  { style: 'kicker', name: 'Kicker', text: 'NEW PROJECT', size: 30, y: 420, pv: ['700 12px Mono', '■ KICKER'] },
  { style: 'caps', name: 'Tracked caps', text: 'SPACED OUT LABEL', size: 40, y: 1500, pv: ['700 12px Mont', 'S P A C E D'] },
  { style: 'serif', name: 'Serif', text: 'Quietly beautiful.', size: 84, y: 600, pv: ['italic 600 20px Corm', 'Quietly'] },
  { style: 'hand', name: 'Handwritten', text: 'look at this!', size: 92, y: 1500, pv: ['700 22px Hand', 'look at this!'] },
  { style: 'typed', name: 'Typewriter', text: 'typing it out...', size: 56, y: 1300, pv: ['800 14px Mont', 'typing it_'] },
  { style: 'flap', name: 'Split flap', text: 'NOW BOOKING', size: 64, y: 700, pv: ['800 14px Mono', 'N0W B#OK'] },
  { style: 'outline', name: 'Outline fill', text: 'BEFORE', size: 150, y: 600, pv: ['800 20px Mont', 'OUTLINE', 3] },
  { style: 'pill', name: 'Button', text: 'TAP TO BOOK', size: 34, y: 1500, pv: ['800 11px Mont', 'BUTTON', 4] },
  { style: 'number', name: 'Counter', text: '100', size: 180, y: 760, pv: ['900 20px Mont', '0 → 100'] },
  { style: 'quote', name: 'Review quote', text: '', by: '', size: 58, y: 860, pv: ['italic 600 18px Corm', '“In their words”'] },
  { style: 'maskword', name: 'Footage in text', text: 'FRESH', size: 420, y: 960, color: 'ink', pv: ['400 26px Bebas', 'FOOTAGE', 5] },
];
const STICKERS = [
  { type: 'cta', name: 'Call to action', y: 1500, d: 3, size: 32, note: 'From the brand kit' },
  { type: 'contact', name: 'Phone & website', y: 1420, d: 3, note: 'From the brand kit' },
  { type: 'logo', name: 'Logo', y: 420, w: 640, d: 3, note: 'Builds in' },
  { type: 'badge', name: 'Badge', y: 640, size: 150, d: 3, note: 'Stamps on' },
  { type: 'chips', name: 'Service chips', y: 1560, d: 3, note: 'Brand services' },
  { type: 'steps', name: 'Process steps', y: 1450, d: 4.5, items: ['PLAN', 'BUILD', 'ENJOY'], note: '3 to 5 steps' },
  { type: 'arrow', name: 'Arrow', x: 640, y: 900, d: 2, note: 'Hand drawn' },
  { type: 'label', name: 'Label', text: 'JUST FINISHED', y: 420, size: 60, d: 2.5, note: 'Slapped on' },
  { type: 'callout', name: 'Callout', text: 'LOOK HERE', x: 420, y: 1000, d: 2.5, note: 'Dot and tag' },
  { type: 'brackets', name: 'Focus corners', y: 820, w: 760, h: 460, d: 2, note: 'Frame a detail' },
  { type: 'scrim', name: 'Shade for text', y: 1500, d: 4, note: 'Darkens the bottom' },
  { type: 'progress', name: 'Progress bar', y: 0, d: 0, note: 'Top of the screen' },
  { type: 'banner', name: 'Top banner', y: 190, h: 380, color: 'accent', d: 4, note: 'Title band above the footage' },
  { type: 'banner', name: 'Info bar', y: 1760, h: 300, color: 'ink', d: 4, note: 'Logo, phone and website' },
  { type: 'lowerthird', name: 'Lower third', y: 1560, d: 3.5, note: 'Name and detail slide in' },
  { type: 'logobug', name: 'Logo corner', x: 880, y: 140, w: 230, d: 0, note: 'Stays on the whole video' },
  // chunk #4: vector stickers — canvas-drawn, no image assets (see engine/tpl_free.js drawSticker)
  { type: 'starburst', name: 'Starburst', text: 'SALE', y: 640, size: 1, d: 3, note: 'Offer star' },
  { type: 'heart', name: 'Heart', y: 640, size: 1, d: 3, note: 'Pops in' },
  { type: 'check', name: 'Tick', y: 640, size: 1, d: 3, note: 'Done, approved' },
  { type: 'flame', name: 'Flame', y: 640, size: 1, d: 3, note: 'Hot, new, trending' },
  { type: 'sparkle', name: 'Sparkle', y: 640, size: 1, d: 3, note: 'Shine on a detail' },
  { type: 'bolt', name: 'Lightning', y: 640, size: 1, d: 3, note: 'Fast, power' },
  { type: 'pin', name: 'Map pin', text: 'HERE', y: 640, size: 1, d: 3, note: 'This spot' },
  { type: 'star', name: 'Star', y: 640, size: 1, d: 3, note: 'Rated, featured' },
  { type: 'tag', name: 'Price tag', text: '$19', y: 640, size: 1, d: 3, note: 'A price, on a tag' },
  { type: 'gift', name: 'Gift', y: 640, size: 1, d: 3, note: 'Offer, giveaway' },
];
// How many animated overlays the Graphics tab offers (K9.ORDER). Counted live
// so the number can't go stale — a hardcoded 61 was already wrong (71 offered).
const mgCount = () => (typeof K9 !== 'undefined' && K9.ORDER ? K9.ORDER.length : 61);
const TRANS = [['cut', 'Cut'], ['dissolve', 'Dissolve'], ['fade', 'Dip to black'], ['flash', 'Flash'], ['whip', 'Whip'], ['swipe', 'Swipe'], ['slices', 'Slices'], ['blinds', 'Blinds'],
  ['iris', 'Iris'], ['brush', 'Brush'], ['liquid', 'Liquid'], ['leak', 'Light leak'], ['glitch', 'Glitch'], ['paver', 'Tile flip'], ['toss', 'Photo toss'], ['word', 'Through the name'], ['logo', 'Through the logo'],
  ['textmask', 'Through your word'], ['wipe', 'Accent wipe'], ['split', 'Split open'], ['stripes', 'Colour stripes'], ['push', 'Push up'], ['slide', 'Slide over'], ['circle', 'Circle reveal']];
const BEDS = [['none', 'No music', ''], ['lounge', 'Lounge', 'warm, relaxed, upscale'], ['night', 'After dark', 'moody groove'], ['pulse', 'Pulse', 'upbeat, driving'],
  ['sketch', 'Sketch', 'light and playful'], ['cinematic', 'Cinematic', 'big and emotional'], ['day', 'Daylight', 'bright and easy']];
const SFX = { whoosh: 'Whoosh', air: 'Air swish', riser: 'Riser', swell: 'Swell', impact: 'Impact', boom: 'Boom', pop: 'Pop', snap: 'Snap', switch: 'Click', tick: 'Tick',
  stamp: 'Stamp', clack: 'Clack', paper: 'Paper', chime: 'Chime', shimmer: 'Shimmer', tink: 'Tink',
  swish: 'Quick swish', burn: 'Film burn', reverse: 'Reverse cymbal', ink: 'Liquid swoosh', drop: 'Bass drop', braam: 'Braam', thud: 'Thud', rumble: 'Rumble', glitch: 'Glitch', click: 'UI click', notify: 'Notification',
  typing: 'Typing', pageflip: 'Page flip', pencil: 'Pencil', shutter: 'Camera shutter', flash: 'Camera flash', sizzle: 'Sizzle', pour: 'Pour', register: 'Cash register', coin: 'Coin', bell: 'Service bell', sparkle: 'Sparkle', heartbeat: 'Heartbeat' };
// the sound effects by category (all original, synthesised in-house: audio_gen/gen.py and gen_sfx2.py)
const SFX_CATS = [['Whooshes', ['whoosh', 'air', 'swish', 'burn', 'reverse', 'ink']], ['Impacts & drops', ['impact', 'boom', 'drop', 'braam', 'thud', 'rumble']], ['Risers', ['riser', 'swell']],
  ['Glitch & UI', ['glitch', 'switch', 'click', 'snap', 'tick', 'pop', 'notify', 'typing']], ['Paper & print', ['paper', 'pageflip', 'pencil', 'stamp', 'clack']], ['Camera', ['shutter', 'flash']],
  ['Food & drink', ['sizzle', 'pour']], ['Promotional', ['register', 'coin', 'bell', 'sparkle']], ['Elegant', ['chime', 'shimmer', 'tink', 'heartbeat']]];
const LEAD = { whoosh: 1, air: 1, riser: 1, swell: 1, paper: 1, shimmer: 0, swish: 1, burn: 1, ink: 1, reverse: 1 };
const CARDS = [['ink', 'Ink'], ['accent', 'Accent'], ['paper', 'Paper'], ['gradient', 'Gradient'], ['kinetic', 'Kinetic glow'], ['grunge', 'Grunge'], ['grid', 'Blueprint grid']];
const ENDS = [['kinetic', 'Kinetic', 'logo build, pill CTA'], ['grunge', 'Grunge', 'stamped logo, rough label'], ['blueprint', 'Blueprint', 'scan line, dimension'], ['editorial', 'Editorial', 'paper, serif tagline']];
const COLORS = [['white', 'White', '#FFFFFF'], ['accent', 'Accent', null], ['ink', 'Ink', null], ['paper', 'Paper', null]];
const swatchOf = k => (k === 'accent' ? OR : k === 'ink' ? BLK : k === 'paper' ? PAPER : '#FFFFFF');

// extension points (V10): nx-motion.js adds the typography and graphics panels, the motion inspector and keyframes
const XT = { panels: {}, inspect: {}, textTop: null, trans: null, checks: [], tabs: [] };
// ------------------------------------------------------------------------------------------------ state + edits
const ED = { on: false, userZoom: false, sel: null, selEl: null, multi: new Set(), itab: 'edit', pxs: 60, undo: [], redo: [], drag: null, panel: 'media', lastKey: '', lastAt: 0, replace: null, seekTo: null, fitNext: true };
const TL = () => S.proj && S.proj.tl;
const F = () => window.FREE;
function blankTL() { return { v: 1, main: [{ id: uid(), type: 'end', style: 'kinetic', d: 4 }], layers: [], sfx: [], music: { bed: 'lounge', vol: 0.7 }, autoSfx: true }; }
function normTL(t) { t = t || {}; t.main = Array.isArray(t.main) ? t.main : []; t.layers = Array.isArray(t.layers) ? t.layers : []; t.sfx = Array.isArray(t.sfx) ? t.sfx : [];
  t.music = Object.assign({ bed: 'none', vol: 0.7 }, t.music || {}); if (t.autoSfx === undefined) t.autoSfx = true; [...t.main, ...t.layers, ...t.sfx].forEach(x => { if (!x.id) x.id = uid(); }); return t; }
// ---- command-based undo ----
// The undo stack holds commands, not bare snapshots: { label, before, after }.
// Every user gesture commits exactly ONE command (a drag is one undo step),
// and the Undo/Redo buttons say what they will undo. `before`/`after` are
// still whole-timeline JSON — the state representation never changed, so old
// behaviour is preserved; only the bookkeeping is explicit.
function change(mut, o) {
  o = o || {}; const t = TL(); if (!t) return; const before = JSON.stringify(t);
  mut(t);
  const after = JSON.stringify(t); if (after === before) return;
  const now = performance.now(), merge = o.key && o.key === ED.lastKey && now - ED.lastAt < 1500;
  if (!o.noUndo) {
    if (merge && ED.undo.length) ED.undo[ED.undo.length - 1].after = after;   // same gesture, still one command
    else { ED.undo.push({ label: o.label || 'Edit', before, after }); if (ED.undo.length > 150) ED.undo.shift(); ED.redo = []; }
  }
  ED.lastKey = o.key || ''; ED.lastAt = now;
  A.edited(true); scheduleMix(); paintBar();
}
function undo() { if (!ED.undo.length) return; const c = ED.undo.pop(); ED.redo.push(c); S.proj.tl = JSON.parse(c.before); afterHistory(); }
function redo() { if (!ED.redo.length) return; const c = ED.redo.pop(); ED.undo.push(c); S.proj.tl = JSON.parse(c.after); afterHistory(); }
function afterHistory() { ED.lastKey = ''; if (ED.sel && !findAny(ED.sel)) ED.sel = null; A.edited(true); scheduleMix(); paintBar(); }
function findAny(id) { const t = TL(); if (!t) return null; if (id === 'music') return { kind: 'music' }; return t.main.find(x => x.id === id) || t.layers.find(x => x.id === id) || t.sfx.find(x => x.id === id) || null; }
const kindOf = o => (!o ? null : o.kind === 'music' ? 'music' : o.type && !o.kind && TL().main.includes(o) ? 'main' : TL().sfx.includes(o) ? 'sfx' : 'layer');
const builtOf = id => (F() ? F().M.find(m => m.id === id) : null);
function select(id, keepMulti) { const was = ED.sel; ED.sel = id; ED.selEl = null; ED.replace = null; if (!keepMulti) ED.multi.clear(); paintSel(); renderInspector(); drawOv(); if (was !== id && (ED.panel === 'trans' || ED.panel === 'text')) renderPanel(); }

// ------------------------------------------------------------------------------------------------ adding things
function insertIndex() {
  const t = TL(), f = F(); if (!t.main.length) return 0;
  let i = f && f.M.length ? f.at(Math.min(S.t, S.dur - 0.01)) + 1 : t.main.length;
  const last = t.main.length - 1; if (t.main[last].type === 'end' && i > last) i = last;
  return clamp(i, 0, t.main.length);
}
function addMain(item) { item.id = item.id || uid(); ED.multi.clear(); change(t => t.main.splice(insertIndex(), 0, item), { label: 'Add to timeline' }); ED.sel = item.id; ED.seekTo = item.id; }
function addClip(r) {
  if (ED.replace) { const id = ED.replace; ED.replace = null; change(t => { const it = t.main.find(x => x.id === id) || t.layers.find(x => x.id === id); if (it) { it.c = r.id; it.in = 0; if (it.type === 'clip') it.d = Math.min(it.d, r.dur); } }); select(id); return; }
  addMain({ type: 'clip', c: r.id, in: 0, d: r3(TL().split && !TL().main.length ? Math.min(60, r.dur) : Math.min(4, r.dur)), layout: 'fit', pos: 'center', tr: TL().main.length > 1 ? { type: 'dissolve', d: 0.45 } : null });
}
function layerTimes(d) { const t0 = Math.max(0, Math.min(S.t, S.dur - 0.5)); return { t0: r3(t0), d: r3(Math.max(0.6, Math.min(d, Math.max(1, S.dur - t0)))) }; }
function addLayer(L) { L.id = uid(); ED.itab = 'edit'; ED.multi.clear(); change(t => t.layers.push(L), { label: 'Add layer' }); ED.sel = L.id; renderInspector(); }
function addText(p) { const L = Object.assign({ kind: 'text', x: 540, color: 'white' }, clone(p), layerTimes(p.style === 'quote' ? 5 : 2.6)); delete L.name; delete L.pv;
  if (p.style === 'quote') { const r = (A.B().reviews || [])[0]; L.text = r ? r.text : 'Paste a real review here, word for word.'; L.by = r ? r.by : 'NAME  ·  WHERE IT WAS POSTED'; } addLayer(L); }
function addSticker(p) { const L = Object.assign({ kind: 'sticker', x: 540 }, clone(p), layerTimes(p.d || 3)); if (p.type === 'progress' || p.type === 'logobug') { L.t0 = 0; L.d = r3(S.dur); }
  const br = A.B(); if (p.type === 'banner' && p.y < 960) { L.text = (br.services || [])[0] || 'OUR LATEST WORK'; L.sub = br.name; } if (p.type === 'lowerthird') { L.text = br.name; L.sub = (br.services || [])[0] || ''; }
  if (p.type === 'badge') L.text = (A.B().contact && A.B().contact.badge) || A.B().name; delete L.name; delete L.note; addLayer(L); }
function addPip(r) { addLayer(Object.assign({ kind: 'pip', c: r.id, in: 0, x: 540, y: 1250, w: r.kind === 'vert' ? 340 : 600, frame: 'white' }, layerTimes(Math.min(4, r.dur)))); }
function addBlock(tpl) { addMain({ type: 'tpl', tpl: tpl.id, text: {}, shot: {}, d: tpl.dur || 15, tr: TL().main.length > 1 ? { type: 'dissolve', d: 0.4 } : null }); }
function addSfx(name) { const s = { id: uid(), name, at: r3(S.t), vol: 0.9 }; change(t => t.sfx.push(s), { label: 'Add sound' }); ED.sel = s.id; renderInspector(); }

// ------------------------------------------------------------------------------------------------ entering / leaving edit mode
const tlx = $('#tlx'), ePanel = $('#ePanel'), einsp = el('div'); einsp.id = 'einsp'; $('#insp').appendChild(einsp);
function enter() {
  ED.on = true; ED.userZoom = false; document.body.classList.add('mode-edit'); tlx.hidden = false; ePanel.hidden = false;
  const had = !!TL(); if (!had) S.proj.tl = blankTL(); normTL(S.proj.tl);
  buildBar(); renderPanel(); ED.fitNext = true; if (!had) A.refresh(true);
}
function exit() { if (!ED.on) return; ED.on = false; document.body.classList.remove('mode-edit'); tlx.hidden = true; ePanel.hidden = true; ED.sel = null; ED.selEl = null; drawOv(); }
A.onOpen.push(p => { ED.undo = []; ED.redo = []; ED.sel = null; ED.selEl = null; if (p.tpl === 'free') { enter(); scheduleMix(true); preloadFonts(); } else exit(); });
function preloadFonts() { const t = TL(); if (!t) return; const keys = [...new Set(t.layers.map(L => L.font).filter(Boolean))]; if (keys.length) Promise.all(keys.map(k => NX.useFont(k))).then(() => A.refresh(true)); }
A.onRebuild.push(() => {
  if (!ED.on || !S.proj || S.proj.tpl !== 'free') return;
  $('#scrub').max = S.dur; $('#tplChip').textContent = 'Free edit · ' + fmtT(S.dur).replace(/\.0$/, '');
  if (ED.seekTo) { const b = builtOf(ED.seekTo); ED.seekTo = null; if (b) A.setT(b.start + Math.min(0.5, b.d / 3)); }
  if (S.t > S.dur) A.setT(S.dur - 0.05);
  if (ED.fitNext || (!ED.userZoom && !ED.drag)) { ED.fitNext = false; fitZoom(); }
  renderTimeline(); renderInspector(); drawOv();
});
A.onOpen.push(p => { if (p.tpl === 'free') setTimeout(() => { if (ED.on) { fitZoom(); renderTimeline(); renderInspector(); } }, 0); });
A.onTime.push(t => { if (!ED.on) return; const ph = tlx.querySelector('.tl-ph'); if (ph) ph.style.left = (t * ED.pxs) + 'px';
  if (S.playing) { const b = tlx.querySelector('.tlx-body'), x = t * ED.pxs; if (b && (x < b.scrollLeft || x > b.scrollLeft + b.clientWidth - 40)) b.scrollLeft = x - 60; }
  drawOv(); });
A.onClips.push(() => { if (ED.on && ED.panel === 'media') renderPanel(); });
A.HOOK.poster = p => { if (p.tpl !== 'free' || !p.tl) return null; for (const it of p.tl.main || []) { if (it.type === 'clip') { const r = NX.CLIPS.get(it.c); if (r && r.poster) return r.poster; } if (it.type === 'tpl') return A.posterFor(it.tpl); } return null; };

// open a template clip in the editor, or start blank
function openInEditor() {
  const p = S.proj, tpl = S.tpl; if (!p || tpl.id === 'free') return;
  const q = A.newProject(FREE_TPL); q.name = (p.name || tpl.name).replace(/ · [A-Z][a-z]{2} \d+$/, '') + ' · edit';
  q.tl = normTL({ main: [{ id: uid(), type: 'tpl', tpl: tpl.id, text: clone(p.text || {}), shot: clone(p.shot || {}), d: S.dur }], layers: [], sfx: [], music: { bed: 'none', vol: 0.7 }, autoSfx: true });
  A.openProject(q); A.markDirty(); A.toast('Opened in the editor. The template is one block on the timeline: add footage, text and stickers around it.', 6000);
}
function blankEdit() { const q = A.newProject(FREE_TPL); q.name = 'Edit · ' + new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); q.tl = blankTL(); A.openProject(q); }
$('#toEditBtn').hidden = false; $('#toEditBtn').onclick = openInEditor;
$('#newEditBtn').hidden = false; $('#newEditBtn').onclick = blankEdit;

// ------------------------------------------------------------------------------------------------ timeline
let bar, body, inner;
function buildBar() {
  tlx.textContent = '';
  bar = el('div', 'tlx-bar'); tlx.appendChild(bar);
  const b = (txt, fn, title, id) => { const x = el('button', 'tool', txt); x.type = 'button'; x.onclick = fn; if (title) x.title = title; if (id) x.id = id; bar.appendChild(x); return x; };
  b('Undo', undo, 'Undo (Ctrl/Cmd+Z)', 'edUndo'); b('Redo', redo, 'Redo (Shift+Ctrl/Cmd+Z)', 'edRedo');
  bar.appendChild(el('span', 'sp'));
  b('Split', split, 'Split at the playhead (S)', 'edSplit'); b('Duplicate', duplicate, 'Duplicate', 'edDup'); b('Delete', del, 'Delete (Del)', 'edDel');
  const sp = el('span', 'sp'); bar.appendChild(sp);
  b('−', () => { ED.userZoom = true; zoom(ED.pxs / 1.4); }, 'Zoom out'); const z = el('input', 'zoom'); z.type = 'range'; z.min = 8; z.max = 300; z.step = 1; z.value = ED.pxs; z.setAttribute('aria-label', 'Timeline zoom'); z.id = 'edZoom'; z.oninput = () => { ED.userZoom = true; zoom(+z.value); }; bar.appendChild(z);
  b('+', () => { ED.userZoom = true; zoom(ED.pxs * 1.4); }, 'Zoom in'); b('Fit', () => { ED.userZoom = false; fitZoom(); renderTimeline(); }, 'Fit the whole edit');
  body = el('div', 'tlx-body'); inner = el('div', 'tl-in'); body.appendChild(inner); tlx.appendChild(body);
  body.addEventListener('pointerdown', onTlDown); body.addEventListener('pointermove', onTlMove); body.addEventListener('pointerup', onTlUp); body.addEventListener('pointercancel', onTlUp);
  body.addEventListener('wheel', e => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); ED.userZoom = true; zoom(ED.pxs * (e.deltaY < 0 ? 1.15 : 1 / 1.15)); } }, { passive: false });
  paintBar();
}
function paintBar() {
  if (!bar) return; const o = findAny(ED.sel), k = o ? kindOf(o) : null;
  const set = (id, on) => { const x = document.getElementById(id); if (x) x.disabled = !on; };
  set('edUndo', ED.undo.length); set('edRedo', ED.redo.length); set('edSplit', o && (k === 'layer' || (k === 'main' && o.type !== 'tpl'))); set('edDup', o && (k === 'main' || k === 'layer')); set('edDel', o && k !== 'music');
  const u = document.getElementById('edUndo'), r = document.getElementById('edRedo');
  if (u) u.title = ED.undo.length ? 'Undo: ' + ED.undo[ED.undo.length - 1].label + ' (Ctrl/Cmd+Z)' : 'Undo (Ctrl/Cmd+Z)';
  if (r) r.title = ED.redo.length ? 'Redo: ' + ED.redo[ED.redo.length - 1].label + ' (Shift+Ctrl/Cmd+Z)' : 'Redo (Shift+Ctrl/Cmd+Z)';
}
function zoom(v) { const b = body, mid = b ? (b.scrollLeft + b.clientWidth / 2) / ED.pxs : 0; ED.pxs = clamp(v, 8, 300); const z = document.getElementById('edZoom'); if (z) z.value = ED.pxs; renderTimeline(); if (b) b.scrollLeft = mid * ED.pxs - b.clientWidth / 2; }
function fitZoom() { if (!body) return; ED.pxs = clamp((body.clientWidth - 60) / Math.max(1, S.dur), 8, 300); const z = document.getElementById('edZoom'); if (z) z.value = ED.pxs; }
const LANE = { ruler: 24, ov: 30, gap: 6, main: 58, audio: 30 };
let GEO = { yMain: 0, yAudio: 0, nOv: 1 };
function laneLayers() {   // overlay lanes: greedy by start time, new lanes go above
  const t = TL(), order = t.layers.slice().sort((a, b) => a.t0 - b.t0), ends = [], lane = {}, segs = order.some(L => L.kind === 'seg');
  if (segs) ends.push(Infinity);   // lane 0: the split screen's other half (section clips may butt up against each other)
  for (const L of order) { if (L.kind === 'seg') { lane[L.id] = 0; continue; } let k = ends.findIndex(e => e <= L.t0 + 1e-3); if (k < 0) { k = ends.length; ends.push(0); } ends[k] = L.t0 + L.d; lane[L.id] = k; }
  return { lane, n: Math.max(1, ends.length) };
}
function labelOf(it) {
  if (it.type === 'clip') { const r = NX.CLIPS.get(it.c); return r ? (r.audio && it.sound !== false ? '♪ ' : '') + r.name : 'Removed footage'; }
  if (it.type === 'tpl') { const T = A.TPL(it.tpl); return T ? T.name : it.tpl; }
  if (it.type === 'end') return 'Ending · ' + (it.style || 'kinetic');
  if (it.type === 'card') return 'Card · ' + ((CARDS.find(c => c[0] === it.bg) || [0, 'Ink'])[1]);
  if (it.kind === 'text' && it.style === 'type') return (it.text || 'Text').replace(/\n/g, ' ');
  if (it.kind === 'mg') { const e = K9.EL[it.type]; return e ? e.name + (it.text && typeof it.text === 'string' ? ' · ' + it.text : '') : it.type; }
  if (it.kind === 'text') return (it.text || (TEXTS.find(x => x.style === it.style) || TEXTS[0]).name).replace(/\n/g, ' ');
  if (it.kind === 'sticker') return it.type === 'banner' ? (it.y > 960 ? 'Info bar' : 'Top banner · ' + (it.text || '')) : (STICKERS.find(x => x.type === it.type) || { name: it.type }).name;
  if (it.kind === 'gif') return 'GIF · ' + (it.title || it.name || 'animated');
  if (it.kind === 'pip') { const r = NX.CLIPS.get(it.c); return 'PiP · ' + (r ? r.name : 'footage'); }
  if (it.kind === 'seg') { const r = it.c && NX.CLIPS.get(it.c), half = (TL().split || {}).main === 'top' ? 'Bottom' : 'Top'; return (r && r.audio && it.sound !== false ? '♪ ' : '') + half + ' half · ' + (it.c ? (r ? r.name : 'removed footage') : 'colour panel'); }
  return '';
}
function renderTimeline() {
  if (!ED.on || !inner || !F()) return;
  ED.ac = '';
  const t = TL(), f = F(), pxs = ED.pxs, dur = S.dur, { lane, n } = laneLayers();
  GEO = { nOv: n, yOv: LANE.ruler + 4, yMain: LANE.ruler + 4 + n * LANE.ov + LANE.gap, yAudio: 0 }; GEO.yAudio = GEO.yMain + LANE.main + LANE.gap;
  const H = GEO.yAudio + LANE.audio + 10, Wd = Math.max(body.clientWidth - 2, dur * pxs + 140);
  inner.textContent = ''; inner.style.width = Wd + 'px'; inner.style.height = H + 'px';
  // ruler
  const ru = el('div', 'tl-ruler'); inner.appendChild(ru);
  const step = pxs >= 140 ? 0.5 : pxs >= 60 ? 1 : pxs >= 28 ? 2 : pxs >= 14 ? 5 : 10;
  for (let s = 0; s <= dur + 1e-6 + 140 / pxs; s += step) { const tk = el('div', 'tl-tick', Number.isInteger(s) ? fmtT(s).replace(/\.0$/, '') : ''); tk.style.left = (s * pxs) + 'px'; ru.appendChild(tk);
    if (step >= 1 && pxs * step >= 50) { const m = el('div', 'tl-tick minor'); m.style.left = ((s + step / 2) * pxs) + 'px'; ru.appendChild(m); } }
  // lanes
  const ln = (y, h, cls, name) => { const d = el('div', 'tl-lane ' + cls); d.style.top = y + 'px'; d.style.height = h + 'px'; if (name) d.appendChild(el('span', 'tl-lname', name)); inner.appendChild(d); return d; };
  ln(GEO.yOv, n * LANE.ov, 'ov', ''); ln(GEO.yMain, LANE.main, 'main', ''); ln(GEO.yAudio, LANE.audio, 'audio', '');
  if (!t.layers.length) { const e = el('div', 'tl-empty', 'Text, stickers, picture-in-picture and split-screen clips go here'); e.style.top = (GEO.yOv + 7) + 'px'; inner.appendChild(e); }
  // main track
  f.M.forEach((it, i) => {
    const d = el('div', 'ti m-' + it.type); d.dataset.id = it.id; d.dataset.kind = 'main';
    d.style.left = (it.start * pxs) + 'px'; d.style.width = Math.max(4, it.d * pxs - 1) + 'px'; d.style.top = GEO.yMain + 'px'; d.style.height = LANE.main + 'px';
    const shade = 'linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,0) 46%, rgba(0,0,0,0) 70%, rgba(0,0,0,.5))';
    if (it.type === 'clip') { const r = NX.CLIPS.get(it.c); if (r && r.poster) d.style.backgroundImage = shade + ', url("' + r.poster + '")'; }
    else if (it.type === 'tpl') { const pv = A.posterFor(it.tpl); if (pv) { d.style.backgroundImage = shade + ', url("' + pv + '")'; d.style.backgroundRepeat = 'no-repeat'; d.style.backgroundSize = '100% 100%, auto 100%'; } }
    else if (it.type === 'card') d.style.background = it.bg === 'accent' ? OR : it.bg === 'paper' ? PAPER : it.bg === 'gradient' ? 'linear-gradient(90deg,' + BLK + ',' + OR + ')' : it.bg === 'grid' ? '#16202a' : it.bg === 'grunge' ? '#2a2723' : '#151515';
    d.appendChild(el('span', 'lab', labelOf(it))); d.appendChild(el('span', 'dur', it.d.toFixed(1) + ' s'));
    const hl = el('i', 'h l'), hr = el('i', 'h r'); if (it.type !== 'tpl') d.appendChild(hl); d.appendChild(hr);
    if (it.id === ED.sel) d.classList.add('sel'); if (ED.multi.has(it.id) && it.id !== ED.sel) d.classList.add('msel');
    inner.appendChild(d);
    if (i > 0) { const raw = t.main.find(x => x.id === it.id), on = raw && raw.tr && raw.tr.type && raw.tr.type !== 'cut';
      const c = el('button', 'trc' + (on ? ' on' : '')); c.type = 'button'; c.title = 'Transition: ' + (on ? ((KT.get(raw.tr.type) || {}).name || raw.tr.type) : 'Cut'); c.setAttribute('aria-label', c.title);
      c.style.left = (it.start * pxs) + 'px'; c.style.top = (GEO.yMain - 8) + 'px'; c.onclick = e => { e.stopPropagation(); select(it.id); ED.panel = 'trans'; renderPanel(); }; inner.appendChild(c); }
  });
  if (!f.M.length) { const e = el('div', 'tl-empty', 'Add footage from Media, or a whole template from Templates'); e.style.top = (GEO.yMain + 20) + 'px'; inner.appendChild(e); }
  // overlays
  for (const L of t.layers) {
    const d = el('div', 'ti k-' + (L.style === 'type' ? 'type' : L.kind)); d.dataset.id = L.id; d.dataset.kind = 'layer';
    d.style.left = (L.t0 * pxs) + 'px'; d.style.width = Math.max(6, L.d * pxs - 1) + 'px'; d.style.top = (GEO.yOv + (n - 1 - lane[L.id]) * LANE.ov) + 'px'; d.style.height = (LANE.ov - 4) + 'px';
    if (L.kind === 'seg') { const r = L.c && NX.CLIPS.get(L.c); if (r && r.poster) d.style.backgroundImage = 'linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.25)), url("' + r.poster + '")'; }
    d.appendChild(el('span', 'lab', labelOf(L))); d.appendChild(el('i', 'h l')); d.appendChild(el('i', 'h r'));
    if (L.kf) { const ts = new Set(); Object.values(L.kf).forEach(a => Array.isArray(a) && a.forEach(k => ts.add(Math.round(k.t * 100) / 100))); ts.forEach(tk => { const m = el('i', 'kfd'); m.style.left = (tk * pxs) + 'px'; d.appendChild(m); }); }
    if (L.id === ED.sel) d.classList.add('sel'); if (ED.multi.has(L.id) && L.id !== ED.sel) d.classList.add('msel'); inner.appendChild(d);
  }
  // audio: music bed, template soundtracks, sound effects
  const bed = BEDS.find(b => b[0] === t.music.bed) || BEDS[0];
  const a = el('div', 'ti a-bed'); a.dataset.id = 'music'; a.dataset.kind = 'music'; a.style.left = '0px'; a.style.width = Math.max(40, dur * pxs - 1) + 'px'; a.style.top = GEO.yAudio + 'px'; a.style.height = (LANE.audio - 4) + 'px';
  a.appendChild(el('span', 'lab', '♪ ' + (bed[0] === 'none' ? 'No music · template sound only' : bed[1] + ' · ' + Math.round(t.music.vol * 100) + '%'))); a.lastChild.style.top = '50%'; a.lastChild.style.transform = 'translateY(-50%)';
  if (ED.sel === 'music') a.classList.add('sel'); inner.appendChild(a);
  f.M.filter(m => m.type === 'tpl').forEach(m => { const s = el('div', 'ti a-blk'); s.title = 'Template soundtrack'; s.style.left = (m.start * pxs) + 'px'; s.style.width = (m.d * pxs) + 'px'; s.style.top = (GEO.yAudio + LANE.audio - 10) + 'px'; s.style.height = '6px'; inner.appendChild(s); });
  for (const x of t.sfx) { const b = el('button', 'sfx' + (x.id === ED.sel ? ' sel' : '')); b.type = 'button'; b.dataset.id = x.id; b.dataset.kind = 'sfx'; b.title = (SFX[x.name] || x.name) + ' at ' + fmtT(x.at); b.setAttribute('aria-label', b.title);
    b.style.left = (x.at * pxs) + 'px'; b.style.top = (GEO.yAudio + LANE.audio / 2 - 9) + 'px'; inner.appendChild(b); }
  const ph = el('div', 'tl-ph'); ph.style.left = (S.t * pxs) + 'px'; inner.appendChild(ph);
  paintBar();
}
function paintSel() { if (!inner) return; inner.querySelectorAll('.ti, .sfx').forEach(x => { x.classList.toggle('sel', x.dataset.id === ED.sel); x.classList.toggle('msel', ED.multi.has(x.dataset.id) && x.dataset.id !== ED.sel); }); paintBar(); }
function snapList(skipId) {
  const f = F(), xs = [0, S.t, S.dur]; f.M.forEach(m => { if (m.id !== skipId) { xs.push(m.start, m.start + m.d); } });
  TL().layers.forEach(L => { if (L.id !== skipId) xs.push(L.t0, L.t0 + L.d); }); return xs;
}
const snap = (v, list) => { let best = v, bd = 7 / ED.pxs; for (const x of list) { const d = Math.abs(x - v); if (d < bd) { bd = d; best = x; } } return best; };
// ---- drag polish: snap lines on the timeline ----
// A vertical accent line at the time an edge snapped to, shown while dragging
// (layers + sound effects; main-track moves already show the .tl-drop marker).
function showTlSnap(t) { if (!inner) return; let s = inner.querySelector('.tl-snap'); if (!s) { s = el('div', 'tl-snap'); inner.appendChild(s); } s.style.left = (t * ED.pxs) + 'px'; }
function hideTlSnap() { const s = inner && inner.querySelector('.tl-snap'); if (s) s.remove(); }
function onTlDown(e) {
  if (e.button !== 0) return;
  const trc = e.target.closest('.trc'); if (trc) return;
  const rect = inner.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top, tAt = clamp(x / ED.pxs, 0, S.dur);
  const ti = e.target.closest('.ti[data-id], .sfx');
  body.setPointerCapture(e.pointerId);
  if (!ti) { ED.drag = { mode: 'seek' }; if (S.playing) A.pause(); A.setT(tAt); if (y > LANE.ruler) select(null); return; }
  const id = ti.dataset.id, kind = ti.dataset.kind;
  if ((e.shiftKey || e.metaKey || e.ctrlKey) && (kind === 'main' || kind === 'layer')) { const cur = findAny(ED.sel), ck = cur ? kindOf(cur) : null; if (ck !== kind) ED.multi.clear(); else if (ED.sel) ED.multi.add(ED.sel);
    if (ED.multi.has(id) && ED.multi.size > 1) { ED.multi.delete(id); ED.sel = [...ED.multi][ED.multi.size - 1]; } else { ED.multi.add(id); ED.sel = id; } ED.drag = null; paintSel(); renderInspector(); drawOv(); if (ED.panel === 'trans') renderPanel(); return; }
  // ---- drag polish: multi-select drag on the timeline ----
  // Layers and sound effects drag as a group when the grabbed item is part of
  // the multi-selection: each item keeps its own snapshot (its own offset from
  // the drag start) and the whole group commits as ONE undo command. Main-track
  // items still move one at a time (reordering a scattered group has no safe
  // meaning); shift-click still selects them, but the drag moves only the one.
  // NOTE: the group is captured BEFORE select() below — select() clears the
  // multi-selection, so reading it afterwards would always give a group of one.
  const groupIds = (kind === 'layer' || kind === 'sfx') && ED.multi.size && ED.multi.has(id)
    ? [...ED.multi].filter(mid => { const it = findAny(mid); return it && kindOf(it) === kind; }) : [id];
  if (groupIds[0] !== id) groupIds.unshift(id);
  if (ED.sel !== id || ED.multi.size) select(id, groupIds.length > 1);
  if (kind === 'music') { ED.drag = null; return; }
  const h = e.target.closest('.h'), o = findAny(id), b = builtOf(id);
  const items = groupIds.map(gid => { const it = findAny(gid); return { id: gid, orig: clone(it), el: inner.querySelector('[data-id="' + gid + '"]'), built: kind === 'main' ? builtOf(gid) : null }; });
  const glabel = items.length > 1 ? (kind === 'layer' ? 'Move ' + items.length + ' layers' : 'Move ' + items.length + ' sounds') : (h ? 'Trim' : kind === 'sfx' ? 'Move sound' : 'Move');
  ED.drag = { mode: h ? (h.classList.contains('l') ? 'trimL' : 'trimR') : 'move', id, kind, x0: e.clientX, el: ti, orig: clone(o), built: b ? { start: b.start, d: b.d } : null, moved: false, snaps: snapList(id), items, label: glabel, snapT: null };
  hideTlSnap();
}
function onTlMove(e) {
  const g = ED.drag; if (!g) return;
  const rect = inner.getBoundingClientRect();
  if (g.mode === 'seek') { A.setT(clamp((e.clientX - rect.left) / ED.pxs, 0, S.dur)); return; }
  const dx = e.clientX - g.x0, dt = dx / ED.pxs; if (Math.abs(dx) > 3) g.moved = true; if (!g.moved) return;
  const pxs = ED.pxs, o = g.orig;
  // ---- drag polish: a snap line shows whenever an edge IS aligned with a snap
  // target — including when the drag lands exactly on it (snap() then returns
  // the value unchanged, so comparing against the raw value would miss it).
  const aligned = v => { for (const s of g.snaps) if (Math.abs(s - v) < 1e-6) return s; return null; };
  if (g.kind === 'sfx') {
    const raw = o.at + dt, sn = snap(raw, g.snaps), at0 = clamp(sn, 0, S.dur);
    g.val = g.items.map(it => { const v = it.id === g.id ? at0 : clamp(it.orig.at + (at0 - o.at), 0, S.dur); if (it.el) it.el.style.left = (v * pxs) + 'px'; return { id: it.id, at: v }; });
    const sT = aligned(at0); if (sT !== null) showTlSnap(sT); else hideTlSnap();
    return;
  }
  if (g.kind === 'layer') {
    const prim = g.items[0].orig;   // == o; the primary drives the snap, the group follows by the same delta
    let pv, snapT = null;
    if (g.mode === 'move') {
      let t0 = prim.t0 + dt; const s1 = snap(t0, g.snaps), s2 = snap(t0 + prim.d, g.snaps) - prim.d;
      const useEnd = Math.abs(s2 - t0) < Math.abs(s1 - t0); t0 = useEnd ? s2 : s1;
      pv = { t0: clamp(t0, 0, Math.max(0, S.dur - 0.2)), d: prim.d };
      snapT = aligned(pv.t0); if (snapT === null) snapT = aligned(pv.t0 + pv.d);
    } else if (g.mode === 'trimL') {
      const raw = prim.t0 + dt, sn = snap(raw, g.snaps);
      const t0 = clamp(sn, 0, prim.t0 + prim.d - 0.3); pv = { t0, d: prim.t0 + prim.d - t0 };
      snapT = aligned(pv.t0);
    } else {
      const raw = prim.t0 + prim.d + dt, sn = snap(raw, g.snaps);
      const e2 = clamp(sn, prim.t0 + 0.3, Math.max(prim.t0 + 0.3, S.dur + 30)); pv = { t0: prim.t0, d: e2 - prim.t0 };
      snapT = aligned(pv.t0 + pv.d);
    }
    const dtEff = g.mode === 'move' || g.mode === 'trimL' ? pv.t0 - prim.t0 : (pv.t0 + pv.d) - (prim.t0 + prim.d);
    g.val = g.items.map(it => {
      const oo = it.orig; let v;
      if (g.mode === 'move') v = { t0: clamp(oo.t0 + dtEff, 0, Math.max(0, S.dur - 0.2)), d: oo.d };
      else if (g.mode === 'trimL') { const t0 = clamp(oo.t0 + dtEff, 0, oo.t0 + oo.d - 0.3); v = { t0, d: oo.t0 + oo.d - t0 }; }
      else { const e2 = clamp(oo.t0 + oo.d + dtEff, oo.t0 + 0.3, Math.max(oo.t0 + 0.3, S.dur + 30)); v = { t0: oo.t0, d: e2 - oo.t0 }; }
      if (it.el) { it.el.style.left = (v.t0 * pxs) + 'px'; it.el.style.width = Math.max(6, v.d * pxs - 1) + 'px'; }
      return { id: it.id, t0: v.t0, d: v.d };
    });
    g.snapT = snapT; if (snapT !== null) showTlSnap(snapT); else hideTlSnap();
    return;
  }
  // main track
  const b = g.built; if (!b) return;
  if (g.mode === 'move') {
    g.el.classList.add('drag'); g.el.style.transform = 'translateX(' + dx + 'px)';
    const tp = (e.clientX - rect.left) / pxs, others = F().M.filter(m => m.id !== g.id); let idx = 0; for (const m of others) if (m.start + m.d / 2 < tp) idx++;
    g.val = idx; let dl = inner.querySelector('.tl-drop'); if (!dl) { dl = el('div', 'tl-drop'); inner.appendChild(dl); }
    const at = idx < others.length ? others[idx].start - (others[idx].start > b.start ? b.d : 0) : (others.length ? others[others.length - 1].start + others[others.length - 1].d - (others[others.length - 1].start > b.start ? b.d : 0) : 0);
    dl.style.left = (at * pxs) + 'px'; dl.style.top = GEO.yMain + 'px'; dl.style.height = LANE.main + 'px'; return;
  }
  const maxD = o.type === 'clip' ? (() => { const m = NX.META[o.c]; return m ? K13.maxLen(o, m.n / 30 - (o.in || 0)) : 60; })() : o.type === 'tpl' ? ((F().BLOCKS[o.id] || {}).dir || { dur: 60 }).dur : 60;
  if (g.mode === 'trimR') { const end = snap(b.start + b.d + dt, g.snaps), d = clamp(end - b.start, 0.3, maxD); g.val = { d }; g.el.style.width = Math.max(4, d * pxs - 1) + 'px'; }
  else { let dd = dt; if (o.type === 'clip') dd = clamp(dd, -(o.in || 0) / K13.spOf(o), b.d - 0.3); else dd = clamp(dd, -30, b.d - 0.3); const st = snap(b.start + dd, g.snaps); dd = clamp(st - b.start, o.type === 'clip' ? -(o.in || 0) / K13.spOf(o) : -30, b.d - 0.3);
    g.val = { dd }; g.el.style.left = ((b.start + dd) * pxs) + 'px'; g.el.style.width = Math.max(4, (b.d - dd) * pxs - 1) + 'px'; }
}
function onTlUp() {
  const g = ED.drag; ED.drag = null; hideTlSnap(); if (!g || !g.moved || g.val === undefined) { if (g && g.el) { g.el.classList.remove('drag'); g.el.style.transform = ''; } return; }
  const id = g.id;
  change(t => {
    if (g.kind === 'sfx') { for (const v of g.val) { const x = t.sfx.find(s => s.id === v.id); if (x) x.at = r3(v.at); } return; }
    if (g.kind === 'layer') { for (const v of g.val) { const L = t.layers.find(s => s.id === v.id); if (L) { L.t0 = r3(v.t0); L.d = r3(v.d); } } return; }
    const i = t.main.findIndex(m => m.id === id); if (i < 0) return; const it = t.main[i];
    if (g.mode === 'move') { t.main.splice(i, 1); t.main.splice(g.val, 0, it); if (t.main[0] && t.main[0].tr) t.main[0].tr = null; }
    else if (g.mode === 'trimR') it.d = r3(g.val.d);
    else { if (it.type === 'clip') it.in = r3(Math.max(0, (it.in || 0) + g.val.dd * K13.spOf(it))); it.d = r3((g.built.d) - g.val.dd); }
  }, { label: g.label || 'Drag' });
}
function split() {
  const o = findAny(ED.sel); if (!o) return; const k = kindOf(o), t = S.t;
  if (k === 'layer') { if (t <= o.t0 + 0.1 || t >= o.t0 + o.d - 0.1) { A.toast('Move the playhead inside the layer to split it.'); return; }
    const n = Object.assign(clone(o), { id: uid(), t0: r3(t), d: r3(o.t0 + o.d - t) }); if (o.c && (o.kind === 'seg' || o.kind === 'pip')) n.in = r3((+o.in || 0) + (t - o.t0)); change(tl => { const L = tl.layers.find(x => x.id === o.id); L.d = r3(t - L.t0); tl.layers.push(n); }, { label: 'Split' }); return; }
  if (k !== 'main') return; const b = builtOf(o.id); if (!b) return;
  if (o.type === 'tpl') { A.toast('Template blocks can be trimmed from the end, not split.'); return; }
  if (t <= b.start + 0.15 || t >= b.start + b.d - 0.15) { A.toast('Move the playhead inside the clip to split it.'); return; }
  const lt = t - b.start, n = Object.assign(clone(o), { id: uid(), d: r3(b.d - lt), tr: null }); if (o.type === 'clip') { n.in = r3((o.in || 0) + K13.srcT(Object.assign({}, o, { d: b.d }), lt)); delete n.ramp; }   // a speed ramp belongs to the whole clip: the halves keep the speed, not the ramp
  change(tl => { const i = tl.main.findIndex(x => x.id === o.id); tl.main[i].d = r3(lt); if (o.type === 'clip') delete tl.main[i].ramp; tl.main.splice(i + 1, 0, n); }, { label: 'Split' }); ED.sel = n.id;
}
function duplicate() {
  const o = findAny(ED.sel); if (!o) return; const k = kindOf(o), n = Object.assign(clone(o), { id: uid() });
  if (k === 'layer') { n.t0 = r3(o.t0 + o.d); change(tl => tl.layers.push(n), { label: 'Duplicate' }); }
  else if (k === 'main') change(tl => { const i = tl.main.findIndex(x => x.id === o.id); tl.main.splice(i + 1, 0, n); }, { label: 'Duplicate' });
  else return; ED.sel = n.id;
}
function del() {
  const o = findAny(ED.sel); if (!o) return; const k = kindOf(o);
  change(tl => { if (k === 'layer') tl.layers = tl.layers.filter(x => x.id !== o.id); else if (k === 'sfx') tl.sfx = tl.sfx.filter(x => x.id !== o.id); else if (k === 'main') { tl.main = tl.main.filter(x => x.id !== o.id); if (tl.main[0]) tl.main[0].tr = null; } }, { label: 'Delete' });
  ED.sel = null;
}
document.addEventListener('keydown', e => {
  if (!ED.on || e.target.closest('input, textarea, select, [contenteditable]') || [...document.querySelectorAll('.modal')].some(m => !m.hidden)) return;
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
  else if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
  else if ((e.key === 'Delete' || e.key === 'Backspace') && ED.sel) { e.preventDefault(); del(); }
  else if (!mod && e.key.toLowerCase() === 's') { e.preventDefault(); split(); }
  else if (e.key === 'Escape' && ED.sel) select(null);
}, true);

// ------------------------------------------------------------------------------------------------ dragging on the preview
const scr = $('#screen'), ov = $('#ov'), og = ov.getContext('2d');
const visibleLayers = () => (TL() ? TL().layers.filter(L => S.t >= L.t0 && S.t < L.t0 + L.d) : []);
const boxOf = L => (window.FREE && FREE.bbox ? FREE.bbox(L, S.t) : [L.x - 100, L.y - 50, 200, 100]);
const isFull = L => L.kind === 'mg' && K9.EL[L.type] && K9.EL[L.type].full;
// ---- per-element model (b): elements inside a nested template block ----
// A block's template declares its elements via dir.elements() (computed from
// the same values render() uses, so it cannot drift). Positions live on the
// block item as `el` (plain JSON, API-writable); absent `el` = old behaviour.
const blockEls = id => { try { const b = F() && F().BLOCKS[id]; return b && b.dir && typeof b.dir.elements === 'function' ? (b.dir.elements() || []) : []; } catch (e) { return []; } };
const elDesc = () => { if (!ED.selEl) return null; return blockEls(ED.selEl.blockId).find(e => e.id === ED.selEl.elId) || null; };
const elItem = () => (ED.selEl && TL() ? TL().main.find(x => x.id === ED.selEl.blockId) : null);
function elApply(desc, x, y) {   // write a dragged position into the block's `el`, in place (same object the template captured)
  const it = elItem(); if (!it || !desc) return false; it.el = it.el || {};
  if (desc.kind === 'callout') { if (String(desc.id).startsWith('x')) { const ex = (it.el.extra || []).find(e => 'x' + e.id === desc.id); if (ex) { ex.x = Math.round(x); ex.y = Math.round(y); } }
    else { it.el.pos = it.el.pos || {}; it.el.pos[desc.id] = { x: Math.round(x), y: Math.round(y) }; } return true; }
  if (desc.kind === 'focus') { const k = String(desc.id).replace(/^fx/, ''); it.el.fx = it.el.fx || {}; it.el.fx[k] = { x: Math.round(x), y: Math.round(y) }; return true; }
  if (desc.kind === 'box') { it.el.box = { x: Math.round(x), y: Math.round(y), w: desc.w, h: desc.h }; return true; }
  if (desc.kind === 'card') { it.el.card = { y: Math.round(y), h: desc.h }; return true; }
  if (desc.kind === 'pos') { it.el.pos = it.el.pos || {}; it.el.pos[desc.id] = { x: Math.round(x), y: Math.round(y) }; return true; }
  return false;
}
function dupEl(o, d) {   // duplicate a callout: a concurrent copy, offset down-right (duration never changes)
  if (d.kind !== 'callout') return;
  const nid = A.uid8().slice(0, 6);
  change(t => { const it = t.main.find(x => x.id === o.id); if (!it) return; it.el = it.el || {}; it.el.extra = it.el.extra || [];
    it.el.extra.push({ id: nid, text: d.label, x: Math.round(clamp(d.x + 90, 0, 1080)), y: Math.round(clamp(d.y + 90, 0, 1920)), t0: d.t0 }); });
  ED.selEl = { blockId: o.id, elId: 'x' + nid }; A.refresh(true); renderInspector(); drawOv(); A.toast('Callout duplicated. Drag it to its new spot.');
}
function delEl(o, d) {   // delete a callout: an original is hidden (reset brings it back), a duplicate is removed
  if (d.kind !== 'callout') return;
  change(t => { const it = t.main.find(x => x.id === o.id); if (!it) return; it.el = it.el || {};
    if (String(d.id).startsWith('x')) it.el.extra = (it.el.extra || []).filter(e => 'x' + e.id !== d.id);
    else { it.el.hide = it.el.hide || []; if (!it.el.hide.includes(d.id)) it.el.hide.push(d.id); } });
  ED.selEl = null; A.refresh(true); renderInspector(); drawOv(); A.toast('Callout removed. “Reset all element positions” brings it back.');
}
const resizable = L => L.kind === 'text' || L.kind === 'pip' || L.kind === 'gif' || (L.kind === 'mg' && !isFull(L)) || ['logo', 'badge', 'brackets', 'label', 'cta'].includes(L.type);
const rotatable = L => !isFull(L) && L.kind !== 'seg' && !['progress', 'scrim', 'banner', 'logobug'].includes(L.type);
const rotHandle = b => [b[0] + b[2] / 2, b[1] - 70];
// move every key of a property with its base value, so dragging a moving layer moves its whole path
function shiftKeys(L, o, prop, fn) { if (o.kf && Array.isArray(o.kf[prop]) && o.kf[prop].length) { L.kf = L.kf || {}; L.kf[prop] = o.kf[prop].map(k => Object.assign({}, k, { v: fn(k.v) })); } }
function drawOv() {
  og.clearRect(0, 0, 1080, 1920); if (!ED.on || !TL()) return;
  const L = TL().layers.find(x => x.id === ED.sel);
  const g = ED.cdrag;
  if (g && g.guides) { og.strokeStyle = 'rgba(255,255,255,.6)'; og.lineWidth = 2; og.setLineDash([10, 8]); if (g.guides.v) for (const gx of g.guides.v) { og.beginPath(); og.moveTo(gx, 0); og.lineTo(gx, 1920); og.stroke(); } if (g.guides.h) for (const gy of g.guides.h) { og.beginPath(); og.moveTo(0, gy); og.lineTo(1080, gy); og.stroke(); } og.setLineDash([]); }
  const ed = elDesc();
  if (ed) { const b = ed.box, ac = ED.ac || (ED.ac = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff6500');
    og.strokeStyle = ac; og.lineWidth = 4; og.setLineDash([16, 10]); og.strokeRect(b[0] - 12, b[1] - 12, b[2] + 24, b[3] + 24); og.setLineDash([]);
    og.fillStyle = ac; og.beginPath(); og.arc(ed.x, ed.y, 12, 0, 7); og.fill();
    og.fillStyle = '#fff'; og.font = '700 22px Mont, sans-serif'; og.textAlign = 'left'; og.textBaseline = 'top'; og.fillText(ed.label, b[0] - 12, b[1] - 44); return; }
  if (!L || !(S.t >= L.t0 && S.t < L.t0 + L.d) || L.type === 'progress') return;
  // ---- drag polish: the rest of a multi-selection gets a dashed outline ----
  if (ED.multi.size > 1) { og.strokeStyle = 'rgba(255,255,255,.75)'; og.lineWidth = 3; og.setLineDash([6, 8]); for (const mid of ED.multi) { if (mid === ED.sel) continue; const M = TL().layers.find(x => x.id === mid); if (!M || !(S.t >= M.t0 && S.t < M.t0 + M.d)) continue; const mb = boxOf(M); og.strokeRect(mb[0] - 8, mb[1] - 8, mb[2] + 16, mb[3] + 16); } og.setLineDash([]); }
  const b = boxOf(L), ac = ED.ac || (ED.ac = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff6500');
  og.strokeStyle = ac; og.lineWidth = 4; og.setLineDash([16, 10]); og.strokeRect(b[0] - 12, b[1] - 12, b[2] + 24, b[3] + 24); og.setLineDash([]);
  if (resizable(L)) { og.fillStyle = ac; for (const [x, y] of corners(b)) og.fillRect(x - 14, y - 14, 28, 28); }
  if (rotatable(L)) { const [hx, hy] = rotHandle(b); og.strokeStyle = ac; og.lineWidth = 4; og.beginPath(); og.moveTo(hx, b[1] - 12); og.lineTo(hx, hy + 18); og.stroke(); og.fillStyle = '#fff'; og.beginPath(); og.arc(hx, hy, 18, 0, 7); og.fill(); og.stroke(); }
}
const corners = b => [[b[0] - 12, b[1] - 12], [b[0] + b[2] + 12, b[1] - 12], [b[0] - 12, b[1] + b[3] + 12], [b[0] + b[2] + 12, b[1] + b[3] + 12]];
const toCanvas = e => { const r = C.getBoundingClientRect(); return [(e.clientX - r.left) * 1080 / r.width, (e.clientY - r.top) * 1920 / r.height]; };
scr.addEventListener('pointerdown', e => {
  if (!ED.on || e.button !== 0) return;
  const [x, y] = toCanvas(e), sel = TL().layers.find(L => L.id === ED.sel);
  if (sel && rotatable(sel) && S.t >= sel.t0 && S.t < sel.t0 + sel.d) { const b = boxOf(sel), [hx, hy] = rotHandle(b); if (Math.hypot(hx - x, hy - y) < 40) {
    ED.cdrag = { mode: 'rotate', id: sel.id, orig: clone(sel), c: [b[0] + b[2] / 2, b[1] + b[3] / 2], a0: Math.atan2(y - (b[1] + b[3] / 2), x - (b[0] + b[2] / 2)), before: JSON.stringify(TL()), label: 'Rotate layer' }; scr.setPointerCapture(e.pointerId); return; } }
  if (sel && resizable(sel) && S.t >= sel.t0 && S.t < sel.t0 + sel.d) { const b = boxOf(sel); if (corners(b).some(([cx, cy]) => Math.abs(cx - x) < 34 && Math.abs(cy - y) < 34)) {
    ED.cdrag = { mode: 'resize', id: sel.id, orig: clone(sel), c: [b[0] + b[2] / 2, b[1] + b[3] / 2], d0: Math.hypot(x - (b[0] + b[2] / 2), y - (b[1] + b[3] / 2)), before: JSON.stringify(TL()), label: 'Resize layer' }; scr.setPointerCapture(e.pointerId); return; } }
  const hit = visibleLayers().slice().reverse().sort((a, b) => (a.kind === 'seg') - (b.kind === 'seg')).find(L => { if (L.type === 'progress' || L.type === 'scrim' || isFull(L)) return false; const b = boxOf(L); return x >= b[0] - 24 && x <= b[0] + b[2] + 24 && y >= b[1] - 24 && y <= b[1] + b[3] + 24; });
  if (!hit) {   // no layer hit: an element of the template block under the playhead, active right now?
    const f = F();
    if (f && f.M.length) { const cur = f.M[f.at(Math.min(S.t, S.dur - 0.01))];
      if (cur && cur.type === 'tpl') { const els = blockEls(cur.id).filter(e => S.t >= e.t0 && S.t < e.t0 + e.d);
        // ---- an element picked in the inspector wins the hit-test: big
        // containers listed last (swatch card, pixel CTA) used to swallow the
        // small element on top of them when its box sat inside theirs.
        // Falls back to the plain reverse hit-test when nothing is selected
        // or the selection is not active right now.
        let eh = null;
        if (ED.selEl && ED.selEl.blockId === cur.id) { const s = els.find(e => e.id === ED.selEl.elId); if (s) { const b = s.box; if (x >= b[0] - 24 && x <= b[0] + b[2] + 24 && y >= b[1] - 24 && y <= b[1] + b[3] + 24) eh = s; } }
        if (!eh) eh = els.slice().reverse().find(e => { const b = e.box; return x >= b[0] - 24 && x <= b[0] + b[2] + 24 && y >= b[1] - 24 && y <= b[1] + b[3] + 24; });
        if (eh) { if (S.playing) A.pause(); select(cur.id); ED.selEl = { blockId: cur.id, elId: eh.id };
          ED.cdrag = { mode: 'el', id: cur.id, elId: eh.id, x0: x, y0: y, orig: { x: eh.x, y: eh.y }, desc: eh, before: JSON.stringify(TL()), moved: false, label: 'Move element' };
          scr.setPointerCapture(e.pointerId); renderInspector(); drawOv(); return; } } }
    if (f && f.M.length) select(f.M[f.at(Math.min(S.t, S.dur - 0.01))].id); else select(null); return; }
  if (S.playing) A.pause();
  // ---- drag polish: shift/ctrl/cmd-click toggles a layer in the multi-selection ----
  if (e.shiftKey || e.metaKey || e.ctrlKey) {
    if (ED.multi.has(hit.id)) { ED.multi.delete(hit.id); if (ED.sel === hit.id) ED.sel = [...ED.multi].pop() || null; }
    else { if (ED.sel && !ED.multi.has(ED.sel)) ED.multi.add(ED.sel); ED.multi.add(hit.id); ED.sel = hit.id; }
    paintSel(); renderInspector(); drawOv(); return;
  }
  if (ED.multi.has(hit.id)) select(hit.id, true); else if (ED.sel !== hit.id) select(hit.id);
  // ---- drag polish: multi-select drag — each dragged layer keeps its own snapshot ----
  const group = ED.multi.size && ED.multi.has(hit.id) ? [...ED.multi].filter(mid => { const it = findAny(mid); return it && kindOf(it) === 'layer'; }) : [hit.id];
  ED.cdrag = { mode: 'move', id: hit.id, x0: x, y0: y, orig: clone(hit), before: JSON.stringify(TL()), moved: false, guides: null, items: group.map(mid => ({ id: mid, orig: clone(findAny(mid)) })), label: group.length > 1 ? 'Move ' + group.length + ' layers' : 'Move layer' };
  scr.setPointerCapture(e.pointerId);
});
let cRaf = 0;
scr.addEventListener('pointermove', e => {
  const g = ED.cdrag; if (!g) return; const [x, y] = toCanvas(e);
  if (g.mode === 'el') {   // dragging a template-block element: preview live, commit one undo entry on release (cUp)
    if (Math.abs(x - g.x0) + Math.abs(y - g.y0) > 6) g.moved = true; if (!g.moved) return;
    let nx = g.orig.x + (x - g.x0), ny = g.orig.y + (y - g.y0);
    if (g.desc.kind === 'card') nx = g.orig.x;
    if (g.desc.kind === 'box') { nx = clamp(nx, 0, 1080 - (g.desc.w || 960)); ny = clamp(ny, 0, 1920 - (g.desc.h || 900)); }
    else { nx = clamp(nx, 40, 1040); ny = clamp(ny, 40, 1880); }
    elApply(g.desc, Math.round(nx), Math.round(ny));
    cancelAnimationFrame(cRaf); cRaf = requestAnimationFrame(() => { A.refresh(true); drawOv(); }); return;
  }
  const L = TL().layers.find(l => l.id === g.id); if (!L) return;
  if (g.mode === 'move' && L.kind === 'seg') { if (Math.abs(x - g.x0) + Math.abs(y - g.y0) > 6) g.moved = true; if (!g.moved || !L.c || (L.fit || 'fill') !== 'fill') return;
    const m = NX.META[L.c], b = boxOf(L), z = Math.max(1, +L.z || 1); if (!m || b[3] < 4) return;
    const S0 = Math.max(b[2] / m.w, b[3] / m.h) * z, spanX = Math.max(1e-3, 1 - b[2] / S0 / m.w), spanY = Math.max(1e-3, 1 - b[3] / S0 / m.h);   // how far the window can travel, as a share of the clip
    const fx0 = g.orig.fx === undefined ? 0.5 : +g.orig.fx, fy0 = g.orig.fy === undefined ? 0.5 : +g.orig.fy;
    L.fx = Math.round(clamp(fx0 - (x - g.x0) / S0 / m.w, 0.5 - spanX / 2, 0.5 + spanX / 2) * 1000) / 1000; L.fy = Math.round(clamp(fy0 - (y - g.y0) / S0 / m.h, 0.5 - spanY / 2, 0.5 + spanY / 2) * 1000) / 1000; }
  else if (g.mode === 'move') { let nx = g.orig.x + (x - g.x0), ny = g.orig.y + (y - g.y0); if (Math.abs(x - g.x0) + Math.abs(y - g.y0) > 6) g.moved = true; if (!g.moved) return;
    // ---- drag polish: snap LINES in the preview ----
    // Frame edges/center plus every other visible layer's edges/center: the
    // dragged layer's edges and centre snap to them and a dashed guide draws
    // along each snapped axis (earlier code only snapped the centre to 540/960).
    const b0 = boxOf(g.orig), w = b0[2], h = b0[3];
    const tx = [0, 540, 1080], ty = [0, 960, 1920];
    for (const o of visibleLayers()) { if (o.id === g.id) continue; const ob = boxOf(o); tx.push(ob[0] + ob[2] / 2, ob[0], ob[0] + ob[2]); ty.push(ob[1] + ob[3] / 2, ob[1], ob[1] + ob[3]); }
    const snapAxis = (v, list, size) => { const near = val => { let best = null, bd = 18; for (const t of list) { const d = Math.abs(t - val); if (d < bd) { bd = d; best = t; } } return best; };
      let t = near(v); if (t !== null) return [t, t];
      t = near(v - size / 2); if (t !== null) return [t + size / 2, t];
      t = near(v + size / 2); if (t !== null) return [t - size / 2, t];
      return [v, null]; };
    const guides = { v: [], h: [] }; let gv, gh;
    [nx, gv] = snapAxis(nx, tx, w); if (gv !== null) guides.v.push(gv);
    [ny, gh] = snapAxis(ny, ty, h); if (gh !== null) guides.h.push(gh);
    g.guides = guides.v.length || guides.h.length ? guides : null;
    const dx = Math.round(clamp(nx, 0, 1080)) - g.orig.x, dy = Math.round(clamp(ny, 0, 1920)) - g.orig.y;
    L.x = g.orig.x + dx; L.y = g.orig.y + dy; shiftKeys(L, g.orig, 'x', v => v + dx); shiftKeys(L, g.orig, 'y', v => v + dy);
    // ---- drag polish: the multi-selected layers follow the primary by the same delta ----
    if (g.items) for (const it of g.items) { if (it.id === g.id) continue; const L2 = TL().layers.find(l => l.id === it.id); if (!L2) continue; L2.x = Math.round(clamp(it.orig.x + dx, 0, 1080)); L2.y = Math.round(clamp(it.orig.y + dy, 0, 1920)); shiftKeys(L2, it.orig, 'x', v => v + dx); shiftKeys(L2, it.orig, 'y', v => v + dy); } }
  else if (g.mode === 'rotate') { g.moved = true; let deg = (g.orig.rot || 0) + (Math.atan2(y - g.c[1], x - g.c[0]) - g.a0) * 180 / Math.PI; deg = ((deg + 540) % 360) - 180; for (const sn of [-180, -90, 0, 90, 180]) if (Math.abs(deg - sn) < 4) deg = sn; L.rot = Math.round(deg * 10) / 10; if (L.rot === 0) delete L.rot; shiftKeys(L, g.orig, 'rot', v => v + ((L.rot || 0) - (g.orig.rot || 0))); }
  else { g.moved = true; const k = clamp(Math.hypot(x - g.c[0], y - g.c[1]) / Math.max(10, g.d0), 0.25, 4), o = g.orig;
    if (L.kind === 'mg') { const sx = clamp((o.sx || 1) * k, 0.15, 6), f = sx / (o.sx || 1); L.sx = Math.round(sx * 1000) / 1000; L.sy = Math.round(clamp((o.sy || 1) * f, 0.15, 6) * 1000) / 1000; shiftKeys(L, o, 'sx', v => v * f); shiftKeys(L, o, 'sy', v => v * f); }
    else if (L.kind === 'pip' || L.type === 'logo') L.w = Math.round(clamp((o.w || 600) * k, 160, 1080));
    else if (L.kind === 'gif') L.w = Math.round(clamp((o.w || 480) * k, 120, 1080));
    else if (L.type === 'brackets') { L.w = Math.round(clamp((o.w || 700) * k, 120, 1080)); L.h = Math.round(clamp((o.h || 420) * k, 80, 1900)); }
    else L.size = Math.round(clamp((o.size || 80) * k, 12, L.style === 'type' ? 900 : 320)); }
  cancelAnimationFrame(cRaf); cRaf = requestAnimationFrame(() => { A.refresh(true); drawOv(); });
});
const cUp = () => { const g = ED.cdrag; ED.cdrag = null; if (!g) return; if (g.moved) { ED.undo.push({ label: g.label || 'Drag', before: g.before, after: JSON.stringify(TL()) }); if (ED.undo.length > 150) ED.undo.shift(); ED.redo = []; ED.lastKey = ''; A.markDirty(); scheduleMix(); renderInspector(); paintBar(); } drawOv(); };
scr.addEventListener('pointerup', cUp); scr.addEventListener('pointercancel', cUp);
scr.addEventListener('dblclick', () => { if (!ED.on) return; const ta = einsp.querySelector('textarea, input[type=text]'); if (ta) { ta.focus(); ta.select(); } });

// ------------------------------------------------------------------------------------------------ panels (left)
function renderPanel() {
  if (!ED.on) return; ePanel.textContent = '';
  const tabs = el('div', 'ep-tabs'); tabs.setAttribute('role', 'tablist');
  const TABS = [['media', 'Media'], ['text', 'Text'], ['graphics', 'Graphics'], ['stickers', 'Stickers'], ['trans', 'Transitions'], ['audio', 'Audio'], ['blocks', 'Templates']];
  for (const [k, l, after] of XT.tabs) if (!TABS.some(x => x[0] === k)) { const i = TABS.findIndex(x => x[0] === after); TABS.splice(i < 0 ? TABS.length : i + 1, 0, [k, l]); }
  TABS.forEach(([k, l]) => {
    const b = el('button', '', l); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(ED.panel === k)); b.onclick = () => { ED.panel = k; renderPanel(); }; tabs.appendChild(b); });
  ePanel.appendChild(tabs); const box = el('div', 'ep-body'); ePanel.appendChild(box);
  const sec = s => box.appendChild(el('div', 'ep-sec', s)), note = s => box.appendChild(el('p', 'ep-note', s));
  const btn = (parent, title, sub, fn, pressed) => { const b = el('button', 'ep-btn'); b.type = 'button'; b.appendChild(document.createTextNode(title)); if (sub) b.appendChild(el('small', '', sub)); b.onclick = fn; if (pressed !== undefined) b.setAttribute('aria-pressed', String(pressed)); parent.appendChild(b); return b; };
  if (XT.panels[ED.panel]) { XT.panels[ED.panel](box, { sec, note, btn }); return; }
  if (ED.panel === 'media') {
    const head = el('div', 'foot-head'); head.appendChild(el('b', '', ED.replace ? 'Pick the replacement' : (A.B().short || A.B().name) + ' footage'));
    const add = el('button', 'btn sm', '+ Add'); add.type = 'button'; add.onclick = A.pickFiles; head.appendChild(add); box.appendChild(head);
    note(ED.replace ? 'Click a clip to swap it in.' : 'Click to add at the playhead. PiP adds it as a small frame over the video.');
    const g = el('div', 'ep-media'); box.appendChild(g);
    const rows = NX.brandClips().sort((x, y) => (x.src === 'lib') - (y.src === 'lib'));
    if (!rows.length) note('No footage for this brand yet. Add MP4 or MOV clips; they are stored with the brand.');
    for (const r of rows) {
      const b = el('div', 'ep-clip'); b.tabIndex = 0; b.setAttribute('role', 'button'); b.title = 'Add ' + r.name;
      const fi = el('div', 'fi'), im = el('img'); im.alt = ''; im.loading = 'lazy'; if (r.poster) im.src = r.poster; fi.appendChild(im); b.appendChild(fi);
      const fn = el('div', 'fn', r.name); fn.appendChild(el('small', '', (r.kind === 'vert' ? '9:16' : '16:9') + ' · ' + r.dur.toFixed(0) + ' s')); b.appendChild(fn);
      b.onclick = () => addClip(r); b.onkeydown = e => { if (e.key === 'Enter') addClip(r); };
      if (!ED.replace) { const p = el('button', 'pip', 'PIP'); p.type = 'button'; p.title = 'Add as picture-in-picture'; p.onclick = e => { e.stopPropagation(); addPip(r); }; b.appendChild(p); }
      g.appendChild(b);
    }
  } else if (ED.panel === 'text') {
    if (XT.textTop) { XT.textTop(box, { sec, note, btn }); sec('Classic styles'); }
    note('Click a style to add it at the playhead, then type in the panel on the right. Drag it on the preview to place it.');
    const g = el('div', 'ep-grid'); box.appendChild(g);
    for (const p of TEXTS) { const b = el('button', 'ep-btn'); b.type = 'button'; const pv = el('span', 'pv', p.pv[1]); pv.style.font = p.pv[0];
      if (p.pv[2] === 1) { pv.style.background = OR; pv.style.color = BLK; pv.style.display = 'inline-block'; pv.style.padding = '0 4px'; }
      if (p.pv[2] === 2) { pv.style.background = 'rgba(0,0,0,.85)'; pv.style.display = 'inline-block'; pv.style.padding = '2px 6px'; pv.style.borderRadius = '4px'; }
      if (p.pv[2] === 3) { pv.style.color = 'transparent'; pv.style.webkitTextStroke = '1px #fff'; }
      if (p.pv[2] === 4) { pv.style.background = OR; pv.style.color = BLK; pv.style.display = 'inline-block'; pv.style.padding = '4px 10px'; pv.style.borderRadius = '99px'; }
      if (p.pv[2] === 5) { pv.style.background = 'linear-gradient(120deg,#6aa0c8,#e0a050 55%,#3c7a4a)'; pv.style.webkitBackgroundClip = 'text'; pv.style.backgroundClip = 'text'; pv.style.color = 'transparent'; pv.style.letterSpacing = '1px'; }
      b.appendChild(pv); b.appendChild(el('small', '', p.name)); b.onclick = () => addText(p); g.appendChild(b); }
  } else if (ED.panel === 'graphics' || ED.panel === 'stickers') {
    if (ED.panel === 'stickers') {
      note('Stickers sit on top of the video. Tap one to add it at the playhead, then drag it on the preview. The ' + mgCount() + ' animated overlays live in Graphics; animated GIFs live in the GIFs tab.');
      stickerGrid(box, note, btn);
      sec('More');
      btn(box, 'Animated graphics', mgCount() + ' overlays in Graphics', () => { ED.panel = 'graphics'; renderPanel(); });
      btn(box, 'GIFs', 'Search, link or upload an animated GIF', () => { ED.panel = 'gifs'; renderPanel(); });
    } else stickerGrid(box, note, btn);
  } else if (ED.panel === 'trans') {
    const o = findAny(ED.sel), k = o ? kindOf(o) : null, i = k === 'main' ? TL().main.indexOf(o) : -1;
    if (i > 0) { sec('Into “' + labelOf(o) + '”'); const g = el('div', 'ep-grid'); box.appendChild(g); const cur = o.tr && o.tr.type ? o.tr.type : 'cut';
      for (const [tk, tn] of TRANS) { if (tk === 'logo' && !A.B().builtin) continue; btn(g, tn, '', () => change(t => { const it = t.main.find(x => x.id === o.id); it.tr = tk === 'cut' ? null : { type: tk, d: (it.tr && it.tr.d) || 0.5 }; }), cur === tk); }
      if (cur !== 'cut') { const rr = rangeRow('Length', 0.15, 1.2, 0.05, o.tr.d || 0.5, v => change(t => { t.main.find(x => x.id === o.id).tr.d = v; }, { key: 'trd' + o.id }), v => v.toFixed(2) + ' s'); box.appendChild(rr); } }
    else note('Select a clip on the timeline (any but the first), or click a diamond between two clips, to choose the transition into it.');
    sec('Every cut'); const g2 = el('div', 'ep-grid'); box.appendChild(g2);
    for (const [tk, tn] of TRANS.filter(x => ['cut', 'dissolve', 'fade', 'whip', 'swipe', 'slices', 'leak', 'glitch'].includes(x[0]))) btn(g2, tn, 'all cuts', () => change(t => t.main.forEach((it, j) => { if (j > 0) it.tr = tk === 'cut' ? null : { type: tk, d: 0.5 }; })));
  } else if (ED.panel === 'audio') {
    const t = TL(); sec('Music bed'); note('Original music. It loops to fit the edit, fades at the end and steps aside while a template block plays its own soundtrack.');
    const g = el('div', 'ep-grid'); box.appendChild(g);
    for (const [k, n, d] of BEDS) { const b = btn(g, n, d || 'silence', () => change(tl => { tl.music.bed = k; }), t.music.bed === k);
      if (k !== 'none') { const pl = el('span', 'pip', '▶'); pl.title = 'Preview'; pl.style.position = 'absolute'; pl.style.right = '6px'; pl.style.top = '6px'; pl.onclick = e => { e.stopPropagation(); previewBed(k, pl); }; b.appendChild(pl); } }
    box.appendChild(rangeRow('Music volume', 0, 1, 0.05, t.music.vol, v => change(tl => { tl.music.vol = v; }, { key: 'vol' }), v => Math.round(v * 100) + '%'));
    const ck = el('label', 'chk'), ci = el('input'); ci.type = 'checkbox'; ci.checked = !!t.autoSfx; ci.onchange = () => change(tl => { tl.autoSfx = ci.checked; }); ck.appendChild(ci); ck.appendChild(document.createTextNode('Whoosh on every transition')); box.appendChild(ck);
    sec('Sound effects'); note('Adds the sound at the playhead. Drag the yellow dots on the audio track to move them. ' + Object.keys(SFX).length + ' original sounds.');
    for (const [cat, keys] of SFX_CATS) { box.appendChild(el('div', 'ep-sec', cat)); const g2 = el('div', 'ep-grid'); box.appendChild(g2); for (const k of keys) { const n = SFX[k]; const b = btn(g2, n, '', () => addSfx(k)); b.onmouseenter = () => {}; const pl = el('span', 'pip', '▶'); pl.style.position = 'absolute'; pl.style.right = '6px'; pl.style.top = '6px'; pl.onclick = e => { e.stopPropagation(); previewSfx(k); }; b.appendChild(pl); } }
  } else if (ED.panel === 'blocks') {
    sec('Templates as blocks'); note('A whole template drops in with its timing, music and effects. Edit its lines in the panel on the right.');
    const g = el('div', 'ep-tpl'); box.appendChild(g);
    for (const tp of NX.TPLS.filter(x => !x.hidden && !x.hol && !x.cf)) { const b = el('button'); b.type = 'button'; const im = el('img'); im.alt = ''; im.loading = 'lazy'; const pv = A.posterFor(tp.id) || (tp.live ? '' : 'posters/' + tp.id + '.jpg'); if (pv) im.src = pv; b.appendChild(im); b.appendChild(el('span', '', tp.name + (tp.dur ? ' · ' + Math.round(tp.dur) + 's' : ''))); b.onclick = () => addBlock(tp); g.appendChild(b); }
    sec('Colour cards'); const g2 = el('div', 'ep-grid'); box.appendChild(g2);
    for (const [k, n] of CARDS) { const b = btn(g2, '', '', () => addMain({ type: 'card', bg: k, d: 2, tr: TL().main.length ? { type: 'dissolve', d: 0.4 } : null })); const sw = el('span', 'sw'); sw.style.background = k === 'accent' ? OR : k === 'paper' ? PAPER : k === 'gradient' ? 'linear-gradient(135deg,' + BLK + ',' + OR + ')' : k === 'grid' ? '#16202a' : k === 'grunge' ? '#2a2723' : BLK; b.prepend(sw); b.insertBefore(document.createTextNode(n), b.childNodes[1]); }
    sec('Ending'); note('The brand’s logo, call to action, phone, website' + (A.B().builtin ? ' and licence.' : '.'));
    const g3 = el('div', 'ep-grid'); box.appendChild(g3); for (const [k, n, d] of ENDS) btn(g3, n, d, () => { const t = TL(), last = t.main[t.main.length - 1]; if (last && last.type === 'end') { change(tl => { tl.main[tl.main.length - 1].style = k; }); select(last.id); } else { ED.sel = null; change(tl => tl.main.push({ id: uid(), type: 'end', style: k, d: 4, tr: tl.main.length ? { type: 'dissolve', d: 0.5 } : null })); } });
  }
}
function stickerGrid(box, note, btn) { note('Brand stickers pull the logo, colours, services and contact block from the brand kit.'); const g = el('div', 'ep-grid'); box.appendChild(g); for (const p of STICKERS) btn(g, p.name, p.note, () => addSticker(p)); }
let bedAudio = null;
function previewBed(k, pl) { if (bedAudio && bedAudio._k === k && !bedAudio.paused) { bedAudio.pause(); pl.textContent = '▶'; return; } if (bedAudio) bedAudio.pause(); bedAudio = new Audio('audio/bed_' + k + '.mp4'); bedAudio._k = k; bedAudio.volume = 0.8; bedAudio.play().catch(() => {}); ePanel.querySelectorAll('.pip').forEach(x => { if (x.textContent === '■') x.textContent = '▶'; }); pl.textContent = '■'; bedAudio.onended = () => (pl.textContent = '▶'); setTimeout(() => { if (bedAudio && bedAudio._k === k) { bedAudio.pause(); pl.textContent = '▶'; } }, 12000); }
async function previewSfx(k) { try { const ac = AU.live || (AU.live = new AudioContext()); const buf = await loadBuf('audio/sfx.mp4', ac); const m = AU.meta && AU.meta[k]; if (!m) return; const s = ac.createBufferSource(); s.buffer = buf; s.connect(ac.destination); s.start(0, m.at, m.len); } catch (e) {} }

// ------------------------------------------------------------------------------------------------ inspector (right)
function rangeRow(label, min, max, step, val, on, fmt) {
  const w = el('div', 'fld'), lab = el('span', 'lab', label); w.appendChild(lab); const r = el('div', 'rng'), i = el('input'); i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = val; i.setAttribute('aria-label', label);
  const o = el('output', '', fmt ? fmt(+val) : String(val)); i.oninput = () => { o.textContent = fmt ? fmt(+i.value) : i.value; on(+i.value); }; r.appendChild(i); r.appendChild(o); w.appendChild(r); return w;
}
function segRow(label, opts, val, on) {
  const w = el('div', 'fld'); w.appendChild(el('span', 'lab', label)); const s = el('div', 'seg');
  for (const [k, n, sw] of opts) { const b = el('button'); b.type = 'button'; if (sw) { const x = el('span', 'sw'); x.style.background = sw; b.appendChild(x); } b.appendChild(document.createTextNode(n)); b.setAttribute('aria-pressed', String(val === k)); b.onclick = () => { s.querySelectorAll('button').forEach(y => y.setAttribute('aria-pressed', String(y === b))); on(k); }; s.appendChild(b); }
  w.appendChild(s); return w;
}
function textRow(label, val, on, o) {
  o = o || {}; const w = el('div', 'fld'), id = 'e-' + A.uid8(), lab = el('label', '', label); lab.htmlFor = id; w.appendChild(lab);
  const i = el(o.area ? 'textarea' : 'input'); i.id = id; if (!o.area) { i.type = 'text'; i.autocomplete = 'off'; } else i.rows = o.rows || 3; i.value = val || ''; if (o.ph) i.placeholder = o.ph; if (o.max) i.maxLength = o.max; if (o.up) i.classList.add('up');
  const warn = el('p', 'warn'); warn.hidden = true; const sync = () => { const ws = o.lint ? A.lint(i.value) : []; warn.hidden = !ws.length; warn.textContent = ws.join(' '); };
  i.oninput = () => { on(i.value); sync(); }; w.appendChild(i); if (o.hint) w.appendChild(el('p', 'hint', o.hint)); w.appendChild(warn); sync(); return w;
}
function selRow(label, opts, val, on) { const w = el('div', 'fld'), id = 'e-' + A.uid8(), lab = el('label', '', label); lab.htmlFor = id; w.appendChild(lab); const s = el('select'); s.id = id; opts.forEach(([k, n]) => { const o = el('option', '', n); o.value = k; s.appendChild(o); }); s.value = val; s.onchange = () => on(s.value); w.appendChild(s); return w; }
function fontRow(o) {
  const lib = (window.NX && NX.allFontLib) ? NX.allFontLib() : (NX.FONTLIB || {}), cats = { sans: 'Sans', display: 'Display', serif: 'Serif', script: 'Script', mono: 'Mono' };
  const w = el('div', 'fld'), id = 'e-' + A.uid8(), lab = el('label', '', 'Font'); lab.htmlFor = id; w.appendChild(lab); const s = el('select'); s.id = id;
  const o0 = el('option', '', 'Brand font'); o0.value = ''; s.appendChild(o0);
  for (const [c, n] of Object.entries(cats)) { const og = el('optgroup'); og.label = n; for (const [k, f] of Object.entries(lib)) if (f.c === c) { const op = el('option', '', f.l); op.value = k; og.appendChild(op); } s.appendChild(og); }
  s.value = o.font || ''; const pv = el('div', 'fontpv', (o.text || 'Aa Bb Cc').split('\n')[0].slice(0, 30));
  const paint = () => { const ff = s.value && window.NX && NX.fontCSS ? NX.fontCSS(s.value) : null; if (ff) NX.useFont(s.value).then(() => (pv.style.fontFamily = ff)); else pv.style.fontFamily = ''; };
  s.onchange = () => { const k = s.value; paint(); (k ? NX.useFont(k) : Promise.resolve()).then(() => upd(o.id, x => { if (k) x.font = k; else delete x.font; })); };
  w.appendChild(s); w.appendChild(pv); paint(); return w;
}
function head(box, title, meta) { const h = el('div', 'ei-head'), d = el('div'); d.appendChild(el('h2', '', title)); if (meta) d.appendChild(el('p', '', meta)); h.appendChild(d); box.appendChild(h); return h; }
function grp(box, title) { const g = el('section', 'grp'), hd = el('header'); hd.appendChild(el('h3', '', title)); g.appendChild(hd); box.appendChild(g); return g; }
function acts(box, list) { const a = el('div', 'ei-acts'); for (const [n, fn, cls] of list) { const b = el('button', 'btn sm' + (cls ? ' ' + cls : ''), n); b.type = 'button'; b.onclick = fn; a.appendChild(b); } box.appendChild(a); return a; }
const upd = (id, fn, key) => change(t => { const o = t.main.find(x => x.id === id) || t.layers.find(x => x.id === id) || t.sfx.find(x => x.id === id); if (o) fn(o, t); }, key ? { key: key + id } : undefined);
function timing(g, L) {
  g.appendChild(rangeRow('Starts at', 0, Math.max(0.1, S.dur - 0.2), 0.05, L.t0, v => upd(L.id, o => { o.t0 = r3(v); }, 't0'), fmtT));
  g.appendChild(rangeRow('Stays for', 0.4, Math.max(1, S.dur), 0.05, L.d, v => upd(L.id, o => { o.d = r3(v); }, 'd'), v => v.toFixed(1) + ' s'));
}
function posRow(g, L) { g.appendChild(segRow('Position', [['top', 'Top'], ['mid', 'Middle'], ['low', 'Bottom']], L.y < 760 ? 'top' : L.y > 1200 ? 'low' : 'mid', k => upd(L.id, o => { o.x = 540; o.y = k === 'top' ? 470 : k === 'mid' ? 960 : 1480; }))); }
let renderT = 0;
function renderInspector() {
  if (!ED.on) return; clearTimeout(renderT);
  const active = document.activeElement; if (active && einsp.contains(active) && (active.tagName === 'TEXTAREA' || (active.tagName === 'INPUT' && (active.type === 'text' || active.type === 'range')))) return;   // don't rebuild under the cursor or a slider
  einsp.textContent = ''; const box = einsp, t = TL(); if (!t) return;
  const o = findAny(ED.sel), k = o ? kindOf(o) : null, f = F();
  if (!o) {
    head(box, 'Free edit', fmtT(S.dur).replace(/\.0$/, '') + ' · ' + t.main.length + ' on the main track · ' + t.layers.length + ' layers');
    const g = grp(box, 'How it works');
    g.appendChild(el('p', 'note', 'Add footage, templates and cards from the left; they play in order on the main track. Text, stickers and picture-in-picture sit above it and can overlap. Click anything on the timeline or the preview to edit it here. Drag on the preview to place text, and drag a corner to resize.'));
    const g2 = grp(box, 'Sound');
    const bed = BEDS.find(b => b[0] === t.music.bed) || BEDS[0]; g2.appendChild(el('p', 'note', 'Music: ' + bed[1] + (bed[0] !== 'none' ? ' at ' + Math.round(t.music.vol * 100) + '%' : '') + ' · ' + t.sfx.length + ' sound effects' + (t.autoSfx ? ' · whoosh on transitions' : '')));
    acts(g2, [['Change music', () => { ED.panel = 'audio'; renderPanel(); }]]);
    const lastM = t.main[t.main.length - 1]; if (!(lastM && (lastM.type === 'end' || lastM.type === 'tpl'))) { const g3 = grp(box, 'Ending'); g3.appendChild(el('p', 'note', 'Finish with the brand ending: logo, call to action, phone and website' + (A.B().builtin ? ', plus the licence.' : '.'))); acts(g3, [['Add the ending', () => change(tl => tl.main.push({ id: uid(), type: 'end', style: 'kinetic', d: 4, tr: tl.main.length ? { type: 'dissolve', d: 0.5 } : null }))]]); }
    return;
  }
  if (ED.multi.size > 1 && XT.inspect.multi) { XT.inspect.multi(box, [...ED.multi]); return; }
  if (k === 'music') { head(box, 'Music', 'Loops to the edit length'); const g = grp(box, 'Music bed');
    g.appendChild(selRow('Track', BEDS.map(b => [b[0], b[1] + (b[2] ? ' · ' + b[2] : '')]), t.music.bed, v => change(tl => { tl.music.bed = v; })));
    g.appendChild(rangeRow('Volume', 0, 1, 0.05, t.music.vol, v => change(tl => { tl.music.vol = v; }, { key: 'vol' }), v => Math.round(v * 100) + '%')); acts(box, [['More audio', () => { ED.panel = 'audio'; renderPanel(); }]]); return; }
  if (k === 'sfx') { head(box, SFX[o.name] || o.name, 'Sound effect at ' + fmtT(o.at)); const g = grp(box, 'Sound');
    g.appendChild(selRow('Sound', Object.entries(SFX), o.name, v => upd(o.id, x => { x.name = v; })));
    g.appendChild(rangeRow('At', 0, S.dur, 0.02, o.at, v => upd(o.id, x => { x.at = r3(v); }, 'at'), fmtT));
    g.appendChild(rangeRow('Volume', 0, 1.5, 0.05, o.vol === undefined ? 0.9 : o.vol, v => upd(o.id, x => { x.vol = v; }, 'sv'), v => Math.round(v * 100) + '%'));
    acts(box, [['Play it', () => previewSfx(o.name)], ['Delete', del, 'danger']]); return; }
  if (k === 'main') {
    const b = builtOf(o.id), i = t.main.indexOf(o);
    if (o.type === 'clip') {
      const r = NX.CLIPS.get(o.c), m = NX.META[o.c]; head(box, r ? r.name : 'Removed footage', (r ? (r.kind === 'vert' ? '9:16' : '16:9') + ' · ' : '') + (b ? b.d.toFixed(1) : o.d) + ' s on the timeline');
      if (r && r.poster) { const im = el('img', 'ei-thumb'); im.src = r.poster; im.alt = ''; box.appendChild(im); }
      const g = grp(box, 'Framing');
      g.appendChild(segRow('Layout', [['fit', 'Fit, whole'], ['blur', 'Blur behind'], ['fill', 'Fill (crops)']], o.layout || 'fit', v => upd(o.id, x => { x.layout = v; })));
      if (r && r.kind !== 'vert' && o.layout !== 'fill') g.appendChild(segRow('Place it', [['upper', 'Higher'], ['center', 'Centre'], ['lower', 'Lower']], o.pos || 'center', v => upd(o.id, x => { x.pos = v; })));
      if (o.layout === 'fill' && r && r.kind !== 'vert') g.appendChild(el('p', 'warn', 'Fill crops the sides of landscape footage.'));
      if ((o.layout || 'fit') === 'fit' && r && r.kind !== 'vert') g.appendChild(segRow('Space above and below', [['ink', 'Ink', BLK], ['paper', 'Paper', PAPER], ['accent', 'Accent', OR], ['gradient', 'Gradient'], ['kinetic', 'Glow'], ['grid', 'Grid']], o.bg || 'ink', v => upd(o.id, x => { x.bg = v === 'ink' ? undefined : v; })));
      const g2 = grp(box, 'Timing');
      if (m) { const dur = m.n / 30; g2.appendChild(rangeRow('Starts in the clip at', 0, Math.max(0, dur - 0.3), 0.05, o.in || 0, v => upd(o.id, x => { x.in = r3(v); x.d = r3(Math.min(x.d, K13.maxLen(x, dur - v))); }, 'in'), v => v.toFixed(2) + ' s'));
        g2.appendChild(rangeRow('Length', 0.3, Math.max(0.3, K13.maxLen(o, dur - (o.in || 0))), 0.05, b ? b.d : o.d, v => upd(o.id, x => { x.d = r3(v); }, 'cd'), v => v.toFixed(1) + ' s')); }
      if (XT.mainClip) XT.mainClip(box, o, r);
      soundGrp(box, o, r);
      if (i > 0) trRow(box, o);
      acts(box, [['Replace footage', () => { ED.replace = o.id; ED.panel = 'media'; renderPanel(); A.toast('Pick the new footage on the left.'); }], ['Split', split], ['Duplicate', duplicate], ['Delete', del, 'danger']]);
    } else if (o.type === 'tpl') {
      const T = A.TPL(o.tpl), blk = f && f.BLOCKS[o.id]; head(box, (T ? T.name : o.tpl) + ' block', 'Plays the whole template with its own music and effects');
      if (blk) {
        const full = blk.dir.dur; const g0 = grp(box, 'Length'); g0.appendChild(rangeRow('Plays for', Math.min(2, full), full, 0.1, b ? b.d : full, v => upd(o.id, x => { x.d = r3(v); }, 'bd'), v => v.toFixed(1) + ' s of ' + full.toFixed(1)));
        const groups = new Map(); blk.fields.forEach(fl => { if (fl.type === 'shot') return; const gname = fl.group || 'Copy'; if (!groups.has(gname)) groups.set(gname, []); groups.get(gname).push(fl); });
        for (const [gname, fs] of groups) { const g = grp(box, gname); for (const fl of fs) {
          const cur = o.text && o.text[fl.key] !== undefined ? o.text[fl.key] : (blk.pack[fl.key] !== undefined ? blk.pack[fl.key] : fl.def);
          if (fl.type === 'select') g.appendChild(selRow(fl.label, fl.options.map(op => [op.value, op.label]), cur, v => upd(o.id, x => { x.text = x.text || {}; x.text[fl.key] = v; })));
          else g.appendChild(textRow(fl.label + (fl.max ? ' · max ' + fl.max : ''), cur, v => upd(o.id, x => { x.text = x.text || {}; if (v.trim() === '') delete x.text[fl.key]; else x.text[fl.key] = v; }, 'bt' + fl.key), { up: fl.upper, max: fl.max ? fl.max + 10 : undefined, lint: true })); } }
        const shots = blk.fields.filter(fl => fl.type === 'shot'), ph = shots.filter(fl => { const v = o.shot && o.shot[fl.key]; return !(v && NX.meta(v.c)) && NX.isPh(fl.def[0]); });
        const gs = grp(box, 'Footage in the block'); gs.appendChild(el('p', 'note', shots.length + ' shots' + (ph.length ? ' · ' + ph.length + ' still placeholders' : '') + '. Fill uses this brand’s footage in order.'));
        acts(gs, [['Fill with my footage', () => fillBlock(o, shots)], ['Use the template’s footage', () => upd(o.id, x => { x.shot = {}; })]]);
        const els = blk.dir && typeof blk.dir.elements === 'function' ? (() => { try { return blk.dir.elements() || []; } catch (e) { return []; } })() : [];
        if (els.length) { const ge = grp(box, 'Elements — drag on the preview');
          ge.appendChild(el('p', 'note', 'Each element can be moved by dragging it on the preview (or tap Select, then drag). Callouts can also be duplicated or deleted. Moving one never changes how the rest of the block looks.'));
          for (const d of els) { const row = el('div', 'fld');
            row.appendChild(el('span', 'lab', d.label + '  ·  ' + Math.round(d.x) + ', ' + Math.round(d.y)));
            const a = el('div', 'ei-acts');
            const sb = el('button', 'btn sm', 'Select'); sb.type = 'button';
            sb.onclick = () => { ED.sel = o.id; ED.selEl = { blockId: o.id, elId: d.id }; if (S.t < d.t0 || S.t >= d.t0 + d.d) A.setT(d.t0 + Math.min(0.3, d.d / 3)); renderInspector(); drawOv(); };
            a.appendChild(sb);
            if (d.dup) { const du = el('button', 'btn sm', 'Duplicate'); du.type = 'button'; du.onclick = () => dupEl(o, d); a.appendChild(du); }
            if (d.del) { const de = el('button', 'btn sm danger', 'Delete'); de.type = 'button'; de.onclick = () => delEl(o, d); a.appendChild(de); }
            row.appendChild(a); ge.appendChild(row); }
          acts(ge, [['Reset all element positions', () => { upd(o.id, x => { delete x.el; }); ED.selEl = null; A.refresh(true); renderInspector(); drawOv(); }]]);
        }
      }
      if (i > 0) trRow(box, o);
      acts(box, [['Duplicate', duplicate], ['Delete', del, 'danger']]);
    } else if (o.type === 'card') {
      head(box, 'Colour card', 'A plain background for text');
      const g = grp(box, 'Card'); g.appendChild(segRow('Background', CARDS, o.bg || 'ink', v => upd(o.id, x => { x.bg = v; })));
      g.appendChild(rangeRow('Length', 0.4, 10, 0.1, o.d, v => upd(o.id, x => { x.d = r3(v); }, 'kd'), v => v.toFixed(1) + ' s'));
      if (i > 0) trRow(box, o); acts(box, [['Add text on it', () => { ED.panel = 'text'; renderPanel(); }], ['Split', split], ['Duplicate', duplicate], ['Delete', del, 'danger']]);
    } else if (o.type === 'end') {
      head(box, 'Ending', 'Logo, call to action, phone, website' + (A.B().builtin ? ', licence' : '') + ' from the brand kit');
      const g = grp(box, 'Ending'); g.appendChild(segRow('Style', ENDS.map(e => [e[0], e[1]]), o.style || 'kinetic', v => upd(o.id, x => { x.style = v; })));
      g.appendChild(textRow('Line under the logo', o.tag || '', v => upd(o.id, x => { if (v.trim()) x.tag = v; else delete x.tag; }, 'tag'), { ph: o.style === 'editorial' ? (A.B().contact.tagline || '') : ((A.B().contact.tagline || '').replace(/[.!]+$/, '').toUpperCase()), max: 44, lint: true, hint: 'Empty uses the brand tagline.' }));
      g.appendChild(rangeRow('Length', 2.5, 7, 0.1, o.d, v => upd(o.id, x => { x.d = r3(v); }, 'ed'), v => v.toFixed(1) + ' s'));
      if (i > 0) trRow(box, o); acts(box, [['Delete', del, 'danger']]);
    }
    return;
  }
  // layers
  if (XT.inspect.layer && XT.inspect.layer(box, o, legacyLayerInsp)) return;
  legacyLayerInsp(box, o);
}
// a clip's own sound (talking heads, voice): on by default for footage uploaded with sound; music ducks under it in the mix
function soundGrp(box, o, r) {
  if (!r || !(r.audio || r.src === 'up')) return;
  const gs = grp(box, 'Sound');
  if (!r.audio) { gs.appendChild(el('p', 'note', 'This clip was added before the studio kept sound. Upload it again to use its sound.')); return; }
  if (K13.timed(o)) { gs.appendChild(el('p', 'note', 'This clip’s speed was changed, so it plays without its own sound. Set the speed back to 1× to hear it.')); return; }
  gs.appendChild(segRow('Clip sound', [['on', 'On'], ['off', 'Off']], o.sound === false ? 'off' : 'on', v => upd(o.id, x => { if (v === 'off') x.sound = false; else delete x.sound; })));
  if (o.sound !== false) gs.appendChild(rangeRow('Volume', 0, 1.5, 0.05, o.vol === undefined ? 1 : o.vol, v => upd(o.id, x => { x.vol = Math.round(v * 100) / 100; }, 'cvol' + o.id), v => Math.round(v * 100) + '%'));
  gs.appendChild(el('p', 'note', 'Music drops under clip sound automatically.'));
}
function legacyLayerInsp(box, o, opts) {
  opts = opts || {}; const hd = opts.noHead ? () => {} : head;
  if (o.kind === 'text') {
    const st = TEXTS.find(x => x.style === o.style) || TEXTS[0]; hd(box, st.name, 'Text · ' + fmtT(o.t0) + ' to ' + fmtT(o.t0 + o.d));
    const g = grp(box, 'Text');
    const multi = ['headline', 'quote', 'caption'].includes(o.style);
    g.appendChild(textRow(o.style === 'quote' ? 'Review, word for word' : 'Text', o.text, v => upd(o.id, x => { x.text = v; }, 'tx'), { area: multi, rows: o.style === 'quote' ? 4 : 2, lint: o.style !== 'quote', hint: o.style === 'headline' ? 'Press Enter for a new line.' : o.style === 'quote' ? 'Only real, published reviews, exactly as written.' : '' }));
    if (o.style === 'quote') { g.appendChild(textRow('Who and where', o.by, v => upd(o.id, x => { x.by = v; }, 'by'), { max: 44 }));
      const revs = A.B().reviews || []; if (revs.length) g.appendChild(selRow('Use a review from the brand kit', [['', 'Choose…']].concat(revs.map((r, j) => [String(j), r.text.slice(0, 50) + '…'])), '', v => { if (v === '') return; const r = revs[+v]; upd(o.id, x => { x.text = r.text; x.by = r.by; }); renderInspector(); })); }
    if (A.CAP.sample && o.style !== 'quote' && o.style !== 'number') suggestRow(g, o);
    const g2 = grp(box, 'Look');
    g2.appendChild(selRow('Style', TEXTS.filter((x, j, a) => a.findIndex(y => y.style === x.style) === j).map(x => [x.style, x.name]), o.style, v => upd(o.id, x => { x.style = v; })));
    if (o.style !== 'quote') g2.appendChild(fontRow(o));
    g2.appendChild(segRow(o.style === 'maskword' ? 'Around the word' : 'Colour', COLORS.map(c => [c[0], c[1], swatchOf(c[0])]), o.color || (o.style === 'maskword' ? 'ink' : 'white'), v => upd(o.id, x => { x.color = v; })));
    if (['headline', 'slam', 'caption'].includes(o.style)) g2.appendChild(segRow('Highlight', [['off', 'None'], ['on', o.style === 'caption' ? 'Last word' : o.style === 'slam' ? 'Last word' : 'Last line']], o.hl ? 'on' : 'off', v => upd(o.id, x => { x.hl = v === 'on'; })));
    g2.appendChild(rangeRow('Size', 16, o.style === 'maskword' ? 700 : 260, 1, o.size || 80, v => upd(o.id, x => { x.size = v; }, 'sz'), v => v + ' px'));
    if (o.style === 'maskword') g2.appendChild(el('p', 'hint', 'The footage shows through the letters, then the word opens up into the full shot at the end of the layer.'));
    posRow(g2, o);
    const g3 = grp(box, 'Timing'); timing(g3, o);
    acts(box, [['Split', split], ['Duplicate', duplicate], ['Delete', del, 'danger']]); return;
  }
  if (o.kind === 'sticker') {
    const st = STICKERS.find(x => x.type === o.type) || { name: o.type }; hd(box, st.name, 'Sticker · ' + fmtT(o.t0) + ' to ' + fmtT(o.t0 + o.d));
    const g = grp(box, 'Sticker');
    if (o.type === 'banner' || o.type === 'lowerthird') { g.appendChild(textRow(o.type === 'banner' && o.y > 960 ? 'Big line (empty = phone)' : 'Title', o.text || '', v => upd(o.id, x => { x.text = v; }, 'tx'), { lint: true, max: 40 }));
      g.appendChild(textRow(o.type === 'banner' && o.y > 960 ? 'Small line (empty = website)' : 'Small line', o.sub || '', v => upd(o.id, x => { x.sub = v; }, 'sb'), { lint: true, max: 40 })); g.appendChild(fontRow(o)); }
    if (o.type === 'banner') { g.appendChild(segRow('Colour', [['accent', 'Accent', OR], ['ink', 'Ink', BLK], ['paper', 'Paper', PAPER], ['white', 'White', '#fff']], o.color || 'accent', v => upd(o.id, x => { x.color = v; })));
      g.appendChild(segRow('Where', [['top', 'Top'], ['low', 'Bottom']], o.y > 960 ? 'low' : 'top', v => upd(o.id, x => { x.y = v === 'low' ? 1760 : 190; })));
      g.appendChild(rangeRow('Height', 160, 700, 10, o.h || (o.y < 960 ? 380 : 300), v => upd(o.id, x => { x.h = v; }, 'h'), v => v + ' px')); }
    if (o.type === 'logobug') { g.appendChild(segRow('Colour', [['white', 'Light'], ['ink', 'Dark']], o.color || 'white', v => upd(o.id, x => { x.color = v; }))); g.appendChild(rangeRow('Width', 100, 600, 5, o.w || 230, v => upd(o.id, x => { x.w = v; }, 'w'), v => v + ' px')); }
    if (['label', 'callout', 'badge', 'starburst', 'tag', 'pin'].includes(o.type)) g.appendChild(textRow(o.type === 'badge' ? 'Ring text' : 'Text', o.text, v => upd(o.id, x => { x.text = v; }, 'tx'), { up: true, max: 32, lint: true, hint: o.type === 'badge' ? 'Only claims that are true for this business.' : '' }));
    if (['starburst', 'heart', 'check', 'flame', 'sparkle', 'bolt', 'pin', 'star', 'tag', 'gift'].includes(o.type)) {
      g.appendChild(segRow('Colour', [['accent', 'Accent', OR], ['white', 'White', '#fff'], ['ink', 'Ink', BLK]], o.color || 'accent', v => upd(o.id, x => { x.color = v; })));
      g.appendChild(rangeRow('Size', 0.4, 2.5, 0.05, o.size || 1, v => upd(o.id, x => { x.size = v; }, 'sz'), v => Math.round(v * 100) + '%'));
    }
    if (o.type === 'badge') g.appendChild(textRow('Centre', o.center || '', v => upd(o.id, x => { x.center = v; }, 'ce'), { up: true, max: 8, ph: (A.B().short || '').toUpperCase() }));
    if (o.type === 'chips' || o.type === 'steps') g.appendChild(textRow(o.type === 'steps' ? 'Steps (comma separated)' : 'Chips (comma separated, empty = brand services)', (o.items || []).join(', '), v => upd(o.id, x => { x.items = v.split(',').map(s => s.trim()).filter(Boolean).slice(0, o.type === 'steps' ? 5 : 4); }, 'it'), { up: true }));
    if (['cta', 'contact'].includes(o.type)) g.appendChild(el('p', 'note', 'Text comes from the brand kit: ' + (o.type === 'cta' ? A.B().contact.cta : A.B().contact.phone + ' · ' + A.B().contact.web) + '.'));
    if (['logo', 'contact'].includes(o.type)) g.appendChild(segRow('Colour', [['white', 'Light'], ['ink', 'Dark']], o.color || 'white', v => upd(o.id, x => { x.color = v; })));
    if (['arrow', 'brackets', 'badge'].includes(o.type)) g.appendChild(segRow('Colour', [['accent', 'Accent', OR], ['white', 'White', '#fff']], o.color || 'accent', v => upd(o.id, x => { x.color = v; })));
    if (o.type === 'logo') g.appendChild(rangeRow('Width', 200, 1000, 10, o.w || 640, v => upd(o.id, x => { x.w = v; }, 'w'), v => v + ' px'));
    if (o.type === 'badge') g.appendChild(rangeRow('Size', 70, 300, 2, o.size || 150, v => upd(o.id, x => { x.size = v; }, 'sz'), v => v + ' px'));
    if (o.type === 'label') g.appendChild(rangeRow('Size', 24, 140, 1, o.size || 56, v => upd(o.id, x => { x.size = v; }, 'sz'), v => v + ' px'));
    if (o.type === 'brackets') { g.appendChild(rangeRow('Width', 120, 1080, 10, o.w || 700, v => upd(o.id, x => { x.w = v; }, 'w'), v => v + ' px')); g.appendChild(rangeRow('Height', 80, 1800, 10, o.h || 420, v => upd(o.id, x => { x.h = v; }, 'h'), v => v + ' px')); }
    if (o.type === 'banner') {} else if (o.type === 'scrim') g.appendChild(segRow('Where', [['top', 'Top'], ['low', 'Bottom']], o.y > 960 ? 'low' : 'top', v => upd(o.id, x => { x.y = v === 'low' ? 1500 : 400; })));
    else if (o.type !== 'progress' && o.type !== 'steps') posRow(g, o);
    const g3 = grp(box, 'Timing'); timing(g3, o); acts(box, [['Duplicate', duplicate], ['Delete', del, 'danger']]); return;
  }
  if (o.kind === 'gif') {
    const G = window.NX && NX.gif, ref = G && G.refOf(o), st = ref && G.state(ref);
    hd(box, 'GIF · ' + (o.title || o.name || 'animated'), 'Animated image · ' + fmtT(o.t0) + ' to ' + fmtT(o.t0 + o.d) + (st ? (st.animated ? ' · ' + st.frames.length + ' frames, loops' : ' · still image') : ' · loading…'));
    const g = grp(box, 'GIF');
    g.appendChild(el('p', 'note', 'From ' + (o.src === 'giphy' ? 'GIPHY' : o.src === 'tenor' ? 'Tenor' : o.src === 'upload' ? 'an uploaded file' : 'a link') + ' · stored in the studio, so it keeps working in the video. Credit the provider in the video caption when you publish.'));
    g.appendChild(rangeRow('Width', 120, 1080, 10, o.w || 480, v => upd(o.id, x => { x.w = v; }, 'w'), v => v + ' px'));
    g.appendChild(segRow('Play', [['loop', 'Loop'], ['once', 'Play once, hold last frame']], o.loop === false ? 'once' : 'loop', v => upd(o.id, x => { x.loop = v === 'loop'; })));
    posRow(g, o);
    const g3 = grp(box, 'Timing'); timing(g3, o);
    acts(box, [['Duplicate', duplicate], ['Delete', del, 'danger']]); return;
  }
  if (o.kind === 'pip') {
    const r = NX.CLIPS.get(o.c), m = NX.META[o.c]; hd(box, 'Picture-in-picture', r ? r.name : 'Removed footage');
    const g = grp(box, 'Frame');
    g.appendChild(segRow('Frame', [['white', 'White'], ['accent', 'Accent'], ['round', 'Rounded'], ['none', 'None']].concat(A.B().builtin ? [] : [['circle', 'Circle'], ['arch', 'Arch']]), o.frame || 'white', v => upd(o.id, x => { x.frame = v; })));
    if ((o.frame === 'circle' || o.frame === 'arch')) g.appendChild(el('p', 'warn', 'A circle or arch frame crops the edges of the footage.'));
    g.appendChild(rangeRow('Width', 160, 1080, 10, o.w || 600, v => upd(o.id, x => { x.w = v; }, 'w'), v => v + ' px'));
    if (m) g.appendChild(rangeRow('Starts in the clip at', 0, Math.max(0, m.n / 30 - 0.5), 0.05, o.in || 0, v => upd(o.id, x => { x.in = r3(v); }, 'in'), v => v.toFixed(2) + ' s'));
    posRow(g, o); const g3 = grp(box, 'Timing'); timing(g3, o);
    acts(box, [['Replace footage', () => { ED.replace = o.id; ED.panel = 'media'; renderPanel(); }], ['Duplicate', duplicate], ['Delete', del, 'danger']]);
  }
}
function trRow(box, o) {
  if (XT.trRow) { XT.trRow(box, o); return; }
  const g = grp(box, 'Transition in'); const cur = o.tr && o.tr.type ? o.tr.type : 'cut';
  g.appendChild(selRow('Type', TRANS.filter(x => x[0] !== 'logo' || A.B().builtin), cur, v => upd(o.id, x => { x.tr = v === 'cut' ? null : { type: v, d: (x.tr && x.tr.d) || 0.5 }; })));
  if (cur !== 'cut') g.appendChild(rangeRow('Length', 0.15, 1.2, 0.05, o.tr.d || 0.5, v => upd(o.id, x => { x.tr.d = v; }, 'trd'), v => v.toFixed(2) + ' s'));
  if (cur === 'textmask' || cur === 'word') g.appendChild(textRow('Word', o.tr.text || '', v => upd(o.id, x => { if (v.trim()) x.tr.text = v.slice(0, 14); else delete x.tr.text; }, 'trt'), { up: true, max: 14, ph: (A.B().short || '').toUpperCase(), hint: 'Short words work best.' }));
}
function fillBlock(o, shots) {
  const pool = NX.brandClips().sort((a, b) => String(a.addedAt || '').localeCompare(String(b.addedAt || ''))); if (!pool.length) { A.toast('Add footage for this brand first.'); return; }
  const by = { vert: pool.filter(r => r.kind === 'vert'), land: pool.filter(r => r.kind === 'land') }; let n = 0, used = {};
  upd(o.id, x => { x.shot = x.shot || {}; for (const fl of shots) { const want = fl.kind === 'vert' || fl.kind === 'land' ? fl.kind : NX.isPh(fl.def[0]) ? (fl.def[0].startsWith('phv:') ? 'vert' : 'land') : null; const list = want ? by[want] : pool; if (!list.length) continue;
    const r = list[n % list.length], k = used[r.id] = (used[r.id] || 0) + 1, room = Math.max(0, r.dur - (fl.d || 2) - 0.1); x.shot[fl.key] = { c: r.id, in: r3(room > 0 ? ((k - 1) * 2.3) % room : 0) }; n++; } });
  A.toast(n ? 'Filled ' + n + ' shots in the block.' : 'None of this brand’s footage fits these shots.');
}
function suggestRow(g, o) {
  const b = el('button', 'btn sm', '✦ Suggest lines'); b.type = 'button'; const out = el('div', 'sugg'); g.appendChild(b); g.appendChild(out);
  b.onclick = async () => {
    b.disabled = true; b.textContent = 'Thinking…'; out.textContent = '';
    const br = A.B(), ind = A.indOf(br), rules = br.rules || {}, maxc = { headline: 28, slam: 24, caption: 70, kicker: 26, caps: 28, serif: 32, hand: 28, typed: 40, flap: 18, outline: 12, pill: 22 }[o.style] || 30;
    const prompt = 'Write 4 alternative on-screen lines for a short vertical social video for ' + br.name + ' (' + ind.label + '; services: ' + (br.services || []).slice(0, 6).join(', ') + (br.contact.area ? '; area: ' + br.contact.area : '') + ').\n' +
      'The line is a "' + o.style + '" text overlay. Current text: "' + (o.text || '') + '". Keep the same purpose, each under ' + maxc + ' characters' + (['headline', 'slam', 'kicker', 'caps', 'flap', 'outline', 'pill'].includes(o.style) ? ', in capitals' : '') + '.\n' +
      'Rules: no hashtags or emoji; no invented facts (years, awards, guarantees, prices, review counts)' + (rules.superlatives !== false ? '; no superlatives like best or #1' : '') + (rules.stars !== false ? '; no star ratings' : '') + (rules.prices ? '; no prices or discounts' : '') + (br.dpgRules ? '; say "pool deck" not "pool"; no lighting or fire features as services' : '') + (rules.words ? '; avoid: ' + rules.words : '') + '.\n' +
      'Answer with only JSON: {"lines": ["...", "...", "...", "..."]}';
    try { const r = await A.CAP.sample.json(prompt, { modelTier: 'quick', cache: false }); const lines = (r && Array.isArray(r.lines) ? r.lines : []).filter(x => typeof x === 'string' && x.trim()).slice(0, 4);
      if (!lines.length) throw { code: 'invalid_json' };
      for (const ln of lines) { const s = el('button', '', ln); s.type = 'button'; s.onclick = () => { upd(o.id, x => { x.text = ln; }); const ta = einsp.querySelector('textarea, input[type=text]'); if (ta) ta.value = ln; }; out.appendChild(s); } }
    catch (e) { out.appendChild(el('p', 'note', e && e.code === 'not_granted' ? 'Claude isn’t allowed for this page.' : e && e.code === 'rate_limited' ? 'Too many requests. Try again in a minute.' : 'No suggestions this time. Try again.')); }
    b.disabled = false; b.textContent = '✦ Suggest lines';
  };
}

// ------------------------------------------------------------------------------------------------ audio: mix in the browser
const AU = { bufs: new Map(), meta: null, url: '', ver: 0, t: 0, live: null };
fetch('audio/sfx.json').then(r => r.json()).then(m => (AU.meta = m)).catch(() => {});
function clipBuf(id) {   // a clip's own soundtrack, decoded once (null when it has none)
  const key = 'clip:' + id; if (AU.bufs.has(key)) return AU.bufs.get(key);
  const p = NX.FB.blob(id).then(b => b.arrayBuffer()).then(ab => new OfflineAudioContext(2, 1, 48000).decodeAudioData(ab)).catch(e => { console.warn('clip sound', id, e && e.message); return null; });
  AU.bufs.set(key, p); return p;
}
function voiceOf(t, f, dur) {   // clips playing their own sound: [start, offset in the clip, length, volume, clip]
  const out = [], has = (c, o) => { const r = NX.CLIPS.get(c); return r && r.audio && o.sound !== false && !K13.timed(o); };   // a clip whose speed was changed plays silent
  if (f) for (const m of f.M) if (m.type === 'clip' && !m.missing && has(m.c, m)) out.push([m.start, +m.in || 0, m.d, m.vol === undefined ? 1 : +m.vol, m.c]);
  for (const L of t.layers) if (L.kind === 'seg' && L.c && has(L.c, L) && L.t0 < dur) out.push([L.t0, +L.in || 0, Math.min(L.d, dur - L.t0), L.vol === undefined ? 1 : +L.vol, L.c]);
  for (const L of t.layers) if (L.kind === 'pip' && L.sound === true && L.c && has(L.c, L) && L.t0 < dur) out.push([L.t0, +L.in || 0, Math.min(L.d, dur - L.t0), L.vol === undefined ? 1 : +L.vol, L.c]);   // V22: an avatar or presenter speaks
  return out;
}
function loadBuf(url, ac) {
  const key = url; if (AU.bufs.has(key)) return AU.bufs.get(key);
  const p = fetch(url).then(r => { if (!r.ok) throw new Error(url + ' ' + r.status); return r.arrayBuffer(); }).then(ab => (ac || new OfflineAudioContext(2, 1, 48000)).decodeAudioData(ab));
  AU.bufs.set(key, p); p.catch(() => AU.bufs.delete(key)); return p;
}
async function mixBuffer() {
  const t = TL(), f = F(), dur = Math.max(0.5, S.dur), sr = 48000, N = Math.ceil(dur * sr);
  const oc = new OfflineAudioContext(2, N, sr), master = oc.createGain(), lim = oc.createDynamicsCompressor();   // a gentle limiter so stacked sounds never clip
  lim.threshold.value = -4; lim.knee.value = 3; lim.ratio.value = 16; lim.attack.value = 0.003; lim.release.value = 0.2; master.gain.value = 0.92; master.connect(lim); lim.connect(oc.destination);
  const blocks = f ? f.M.filter(m => m.type === 'tpl') : [], voice = voiceOf(t, f, dur);
  if (t.music && t.music.bed && t.music.bed !== 'none') {
    try { const b = await loadBuf('audio/bed_' + t.music.bed + '.mp4'), src = oc.createBufferSource(), g = oc.createGain(); src.buffer = b; src.loop = true; src.connect(g); g.connect(master);
      const v = clamp(t.music.vol, 0, 1.2) * 0.9, pts = [[0, 0], [0.04, v]];
      for (const m of blocks) { const a = Math.max(0.05, m.start - 0.25), z = m.start + m.d; pts.push([a, v], [Math.max(a + 0.01, m.start), 0], [Math.max(m.start + 0.02, z - 0.05), 0], [z + 0.3, v]); }
      if (t.music.duck !== false) { const iv = voice.map(x => [x[0], x[0] + x[2]]).concat(XT.duck ? XT.duck(t, dur) : []).sort((a, b) => a[0] - b[0]), U = []; for (const [a, b] of iv) { const l = U[U.length - 1]; if (l && a <= l[1] + 0.6) l[1] = Math.max(l[1], b); else U.push([a, b]); }
        const dv = v * 0.28; for (const [a, b] of U) pts.push([Math.max(0.05, a - 0.25), v], [Math.max(0.06, a), dv], [Math.max(a + 0.02, b), dv], [b + 0.35, v]); }
      const fo = Math.max(0.1, dur - 1.4), valAt = x => { let val = 0; for (const [tt, vv] of pts) if (tt <= x) val = vv; return val; };
      const P = pts.filter(q => q[0] < fo).concat([[fo, valAt(fo)], [dur, 0]]).sort((a, b) => a[0] - b[0]);
      g.gain.setValueAtTime(P[0][1], P[0][0]); for (const [tt, vv] of P.slice(1)) g.gain.linearRampToValueAtTime(vv, tt);
      src.start(0); } catch (e) { console.warn(e); }
  }
  // Holiday blocks ship their soundtrack under hol_<v>_<hol> in the packs,
  // not under the tpl id — resolve the name from the registry (the same
  // hol_<v>_<hol> formula HOOK.audioSrc uses for the preview), so the
  // editor mix uses the project's holiday track instead of 404ing on
  // audio/<tpl>.mp4. Other templates are unaffected: the name is the tpl id.
  // (HOOK.audioSrc itself can't be used here — the wrapped version returns
  // a pack blob URL or null, not the pack name.)
  const sndOf = m => { const t = A.TPL(m.tpl); return (t && t.hol) ? 'hol_' + t.v + '_' + ((S.proj || {}).hol || NX.defaultHol()) : m.tpl; };
  for (const m of blocks) {
    try { let b; if (NX.liveAudio && NX.liveAudio.is(m.tpl)) b = await NX.liveAudio.forBlock(m); else { const n = sndOf(m); b = await loadBuf(NX.apack ? await NX.apack.url(n) : 'audio/' + n + '.mp4'); } const src = oc.createBufferSource(), g = oc.createGain(); src.buffer = b; src.connect(g); g.connect(master);
      const end = m.start + m.d; g.gain.setValueAtTime(1, m.start); if (m.d < m.dir.dur - 0.05) { g.gain.setValueAtTime(1, Math.max(m.start, end - 0.3)); g.gain.linearRampToValueAtTime(0, end); }
      src.start(m.start, 0, Math.min(b.duration, m.d + 0.05)); } catch (e) { console.warn(e); }
  }
  for (const [st, off, len, vol, c] of voice) {
    try { const b = await clipBuf(c); if (!b) continue; const L = Math.min(len, b.duration - off); if (L <= 0.03) continue;
      const src = oc.createBufferSource(), g = oc.createGain(); src.buffer = b; src.connect(g); g.connect(master);
      g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(vol, st + 0.015); g.gain.setValueAtTime(vol, Math.max(st + 0.015, st + L - 0.03)); g.gain.linearRampToValueAtTime(0, st + L);
      src.start(st, off, L); } catch (e) { console.warn(e); }
  }
  if (XT.mix) { try { await XT.mix(oc, master, t, f, dur); } catch (e) { console.warn(e); } }   // V19: the voiceover (nx-voice.js)
  const shots = [];
  // each transition syncs its own sound (tr.sfx: 'auto' = the transition's sound, 'none', or a named effect)
  if (t.autoSfx && f) f.M.forEach(m => { if (!m.tr) return; const nm = m.tr.sfx === 'none' ? '' : m.tr.sfx && m.tr.sfx !== 'auto' ? m.tr.sfx : ((KT.get(m.tr.type) || {}).sfx || 'whoosh'); if (nm) shots.push({ name: nm, at: m.start, vol: m.tr.sfxVol === undefined ? 0.6 : m.tr.sfxVol }); });
  for (const s of t.sfx) shots.push(s);
  if (shots.length && AU.meta) {
    try { const b = await loadBuf('audio/sfx.mp4');
      for (const s of shots) { const m = AU.meta[s.name]; if (!m) continue; const st = s.at - (LEAD[s.name] ? m.peak : 0); const src = oc.createBufferSource(), g = oc.createGain(); src.buffer = b; src.connect(g); g.connect(master); g.gain.value = s.vol === undefined ? 0.9 : s.vol;
        if (st >= 0) src.start(st, m.at, m.len); else if (m.len + st > 0) src.start(0, m.at - st, m.len + st); } } catch (e) { console.warn(e); }
  }
  return oc.startRendering();
}
function wavOf(buf) {
  const ch = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate, out = new DataView(new ArrayBuffer(44 + n * ch * 2)); let o = 0;
  const w = s => { for (let i = 0; i < s.length; i++) out.setUint8(o++, s.charCodeAt(i)); }, u32 = v => { out.setUint32(o, v, true); o += 4; }, u16 = v => { out.setUint16(o, v, true); o += 2; };
  w('RIFF'); u32(36 + n * ch * 2); w('WAVE'); w('fmt '); u32(16); u16(1); u16(ch); u32(sr); u32(sr * ch * 2); u16(ch * 2); u16(16); w('data'); u32(n * ch * 2);
  const data = []; for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c));
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, data[c][i])); out.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7FFF, true); o += 2; }
  return new Blob([out.buffer], { type: 'audio/wav' });
}
function scheduleMix(now) {
  clearTimeout(AU.t); const v = ++AU.ver;
  AU.t = setTimeout(async () => {
    if (!S.proj || S.proj.tpl !== 'free') return;
    try { const buf = await mixBuffer(); if (v !== AU.ver || S.proj.tpl !== 'free') return;
      const url = URL.createObjectURL(wavOf(buf)), old = AU.url; AU.url = url;
      const playing = S.playing, keepT = S.t; if (playing) A.pause(); A.setTemplateAudio(); if (old) setTimeout(() => URL.revokeObjectURL(old), 3000); if (playing) { A.setT(keepT, false); A.play(); } }
    catch (e) { console.warn('mix', e); }
  }, now ? 50 : 600);
}
const baseAudio = A.HOOK.audioSrc;
A.HOOK.audioSrc = p => (p.tpl === 'free' ? AU.url || null : baseAudio(p));

// export: the same mix, encoded to AAC (native WebCodecs, or the bundled WASM encoder where the browser has none)
A.XHOOK.audio = p => (p.tpl === 'free' ? async (MB, output, dur) => {
  const buf = await mixBuffer();
  let ok = false; try { ok = await MB.canEncodeAudio('aac', { numberOfChannels: 2, sampleRate: 48000, bitrate: 160000 }); } catch (e) {}
  if (!ok) { try { const m = await import(new URL('vendor/aac-encoder.mjs', document.baseURI).href); m.registerAacEncoder(); } catch (e) { throw new Error('This browser can’t encode AAC audio. Export works in Chrome or Edge on a Mac or Windows computer.'); } }
  const src = new MB.AudioBufferSource({ codec: 'aac', bitrate: 160000 }); output.addAudioTrack(src);
  const sr = buf.sampleRate, ch = buf.numberOfChannels; let fed = 0;
  const feed = async upTo => { const end = Math.min(buf.length, Math.round(Math.min(upTo, dur) * sr)); while (fed < end) { const n = Math.min(end - fed, sr); const piece = new AudioBuffer({ length: n, numberOfChannels: ch, sampleRate: sr }); for (let c = 0; c < ch; c++) piece.copyToChannel(buf.getChannelData(c).subarray(fed, fed + n), c); await src.add(piece); fed += n; } };
  return { feed, finish: async () => { await feed(dur + 1); src.close(); } };
} : null);
A.XHOOK.check = () => {
  if (!S.proj || S.proj.tpl !== 'free') return '';
  const t = TL(), f = F(); if (!t.main.length && !t.layers.length) return 'This edit is empty. Add footage, text or a template first.';
  const miss = f ? f.M.filter(m => m.type === 'clip' && m.missing).length : 0; if (miss) return miss + ' clip' + (miss > 1 ? 's use' : ' uses') + ' footage that was removed. Export anyway, or replace it first.';
  const lastM = t.main[t.main.length - 1];
  if (A.B().builtin && !(lastM && (lastM.type === 'end' || lastM.type === 'tpl'))) return 'DPG videos end with the contact and licence card. Add an ending (Templates → Ending), or export anyway.';
  let ph = 0; if (f) for (const m of f.M) if (m.type === 'tpl' && f.BLOCKS[m.id]) ph += f.BLOCKS[m.id].fields.filter(fl => fl.type === 'shot' && NX.isPh(fl.def[0]) && !(m.shot && m.shot[fl.key] && NX.meta(m.shot[fl.key].c))).length;
  if (ph) return ph + ' shot' + (ph > 1 ? 's' : '') + ' inside template blocks still show “Add footage” placeholders. Export anyway, or fill them first.';
  const mg = f && f.missing ? f.missing() : []; if (mg.length) return mg.length + ' graphic' + (mg.length > 1 ? 's still need' : ' still needs') + ' your details (' + mg.slice(0, 3).map(x => K9.EL[x.L.type].name + ': ' + x.need.join(', ')).join('; ') + '). They show “+ ADD” markers until filled. Export anyway, or fill them first.';
  for (const fn of XT.checks) { const m = fn(); if (m) return m; }
  return '';
};
NX.editor = { open: openInEditor, blank: blankEdit, mixBuffer, ED, XT,
  api: { soundGrp, clipBuf, loadBuf, wavOf, suggest: suggestRow, addSfx, BEDS, ENDS, TL, F, change, upd, select, findAny, kindOf, labelOf, renderPanel, renderInspector, renderTimeline, drawOv, addLayer, addMain, layerTimes, uid, r3, rangeRow, segRow, textRow, selRow, fontRow, grp, head, acts, timing, posRow, trRow, del, duplicate, split, scheduleMix, stickerGrid, previewSfx, TEXTS, STICKERS, TRANS, SFX, SFX_CATS, CARDS, COLORS, swatchOf, isFull } };
})();
