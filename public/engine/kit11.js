'use strict';
/* Motion kit 11 (V12, Oct 30): the Text Studio's compositions. Requires kit8 (K8) and kit9 (K9).
   A composition is a designed set of layers (animated text from K8, motion graphics from K9, animated captions) that inserts
   into an edit as ordinary, separately editable timeline layers sharing a group id. Fonts are the brand's slots and colours
   are brand tokens, so the same composition looks different for every business.
   Facts are never invented: prices, numbers, addresses, names, dates and handles insert as clear placeholders ("ADD PRICE")
   or as K9 "+ ADD" markers, or come from the brand kit / listing (tokens). Sample values ("demo") appear only in previews.
   Industry copy: a composition may carry lines per sector (food, estate, home, beauty, auto, hosp, retail, pro) so a barbershop
   gets "THE FRESH CUT" where a builder gets "BUILT TO LAST".
   comp = { id, name, cat, d, desc, ind?: [sectors it suits], layers: [ {k:'t'|'m', role, ...layer, t0, d?, tok?, ph?, demo?, ind?: {sector: text}} ] } */
const K11 = (() => {
  const CATS = [['editorial', 'Bold editorial'], ['luxury', 'Luxury minimal'], ['cinematic', 'Cinematic titles'], ['street', 'Street culture'], ['neon', 'Neon kinetic'], ['experimental', 'Experimental type'],
    ['promo', 'Promotional offers'], ['hooks', 'Social hooks'], ['captions', 'Animated captions'], ['product', 'Product highlights'], ['restaurant', 'Restaurant specials'], ['estate', 'Real estate'],
    ['tech', 'Technical callouts'], ['stats', 'Statistics & counters'], ['lower', 'Lower thirds'], ['end', 'End cards'], ['brand', 'Brand statements']];
  const C = [], BY = {};
  const T = (role, text, o) => Object.assign({ k: 't', role, text }, o);
  const M = (role, type, o) => Object.assign({ k: 'm', role, type }, o);
  function def(id, name, cat, desc, layers, o) { const c = Object.assign({ id, name, cat, desc, d: 4, layers }, o || {}); C.push(c); BY[id] = c; }
  const SH = { shadow: 'soft' };

  // ------------------------------------------------------------------ bold editorial
  def('ed_stack', 'Stacked statement', 'editorial', 'Three stacked words slam in under a tracked kicker, a rule draws under them.', [
    T('Kicker', 'THE NEW STANDARD', { x: 540, y: 560, slot: 'Mono', size: 30, track: 400, color: 'accent', anim: { in: 'tracking', out: 'fade' }, t0: 0, ind: { food: 'NOW SERVING', estate: 'NEW ON THE MARKET', home: 'OUR LATEST BUILD', beauty: 'NEW THIS WEEK', auto: 'FRESH OUT OF THE BAY', retail: 'JUST DROPPED' } }),
    T('Headline', 'BUILT\nDIFFERENT', { x: 540, y: 970, slot: 'Bebas', size: 250, layout: 'stack', lead: 0.84, color: 'white', fx: { shadow: 'hard', shcol: 'accent' }, anim: { in: 'stagger', out: 'drop' }, t0: 0.2, ind: { food: 'MADE\nFRESH', estate: 'COME\nHOME', beauty: 'FRESH\nCUTS', auto: 'SHOW\nROOM', retail: 'NEW\nSEASON', hosp: 'BIG\nNIGHT' } }),
    M('Rule', 'divider', { x: 540, y: 1270, text: '', width: 520, color: 'accent', t0: 0.7 }),
  ]);
  def('ed_split', 'Split headline', 'editorial', 'Two halves of a headline arrive from opposite sides and lock together.', [
    T('Top word', 'MAKE', { x: 540, y: 820, slot: 'Mont', wt: 900, size: 210, track: -20, color: 'white', fx: SH, anim: { in: 'slide', dir: 'left', out: 'slide', outDir: 'left' }, t0: 0 }),
    T('Bottom word', 'WAVES', { x: 540, y: 1020, slot: 'Mont', wt: 900, ital: true, size: 210, track: -20, color: 'accent', fx: SH, anim: { in: 'slide', dir: 'right', out: 'slide', outDir: 'right' }, t0: 0.12 }),
    T('Line', 'a little louder this season', { x: 540, y: 1150, slot: 'Hand', size: 70, color: 'white', anim: { in: 'words', out: 'fade' }, t0: 0.7 }),
  ]);
  def('ed_marker', 'Marker highlight', 'editorial', 'A bold two-line headline with a marker stroke swiped behind it, then a handwritten aside.', [
    T('Headline', 'THIS IS\nYOUR SIGN', { x: 540, y: 900, slot: 'Mont', wt: 900, size: 150, lead: 1.0, color: 'white', fx: { deco: 'marker', dcol: 'accent', shadow: 'soft' }, anim: { in: 'wordup', out: 'shrink' }, t0: 0 }),
    T('Aside', 'to book that project', { x: 560, y: 1120, slot: 'Hand', size: 76, color: 'accent2', rot: -0.05, anim: { in: 'letters', out: 'fade' }, t0: 0.8, ind: { food: 'to try something new', beauty: 'to book that cut', auto: 'to treat your car', estate: 'to come take a look' } }),
  ]);
  def('ed_poster', 'Poster title', 'editorial', 'An oversized single word in outline that fills with colour, a small tracked caption underneath.', [
    T('Word', 'BOLD', { x: 540, y: 960, slot: 'Bebas', size: 380, track: 20, color: 'white', fx: { stroke: 6, scol: 'accent' }, anim: { in: 'outline', out: 'tracking' }, t0: 0, ind: { food: 'TASTE', estate: 'HOME', home: 'BUILT', beauty: 'FRESH', auto: 'SHINE', hosp: 'PARTY', retail: 'NEW', pro: 'CLEAR' } }),
    T('Caption', 'ISSUE NO. 1  ·  THIS WEEK', { x: 540, y: 1150, slot: 'Mono', size: 26, track: 300, color: 'white', anim: { in: 'fade', inDelay: 0.6, out: 'fade' }, t0: 0 }),
  ]);
  // ------------------------------------------------------------------ luxury minimal
  def('lx_serif', 'Fine serif', 'luxury', 'An italic serif title focuses in, a wide-tracked label and a hairline settle under it.', [
    T('Title', 'The Art of Living', { x: 540, y: 920, slot: 'Corm', wt: 500, ital: true, size: 130, color: 'white', fx: SH, anim: { in: 'blur', inD: 1.1, out: 'blur' }, t0: 0, ind: { food: 'The Art of Dining', beauty: 'The Art of the Cut', auto: 'The Art of Detail', home: 'The Art of Building' } }),
    M('Hairline', 'divider', { x: 540, y: 1030, text: '', width: 340, color: 'white', t0: 0.5 }),
    T('Label', 'THE COLLECTION', { x: 540, y: 1100, slot: 'Mont', wt: 500, size: 26, track: 600, color: 'accent', anim: { in: 'tracking', out: 'fade' }, t0: 0.7 }),
  ]);
  def('lx_gold', 'Gold signature', 'luxury', 'A gold serif word with a light sweep, signed with the brand name.', [
    T('Word', 'Signature', { x: 540, y: 930, slot: 'Corm', wt: 600, ital: true, size: 190, fx: { fill: 'gold', shadow: 'soft', sweep: true }, anim: { in: 'tracking', inD: 1.0, out: 'blur' }, t0: 0 }),
    T('Brand', '{brand}', { x: 540, y: 1080, slot: 'Mono', size: 26, track: 500, color: 'white', case: 'upper', anim: { in: 'fade', out: 'fade' }, t0: 0.8, tok: 'brand' }),
  ]);
  def('lx_frame', 'Hairline frame', 'luxury', 'A fine frame draws around two quiet lines of spaced capitals.', [
    M('Frame', 'border', { x: 540, y: 960, t0: 0 }),
    T('Line one', 'PRIVATE', { x: 540, y: 900, slot: 'Mont', wt: 400, size: 62, w: 660, track: 440, color: 'white', anim: { in: 'fade', inD: 0.9, out: 'fade' }, t0: 0.3, ind: { food: 'CHEF’S', beauty: 'PRIVATE', auto: 'SHOWROOM' } }),
    T('Line two', 'RESIDENCE', { x: 540, y: 1010, slot: 'Mont', wt: 400, size: 62, w: 660, track: 440, color: 'white', anim: { in: 'fade', inD: 0.9, out: 'fade' }, t0: 0.6, ind: { food: 'TABLE', beauty: 'SUITE', auto: 'FINISH', home: 'PROJECT' } }),
  ]);
  def('lx_number', 'Quiet numeral', 'luxury', 'A large thin numeral, an italic name beside it and a fine rule: a chapter in a lookbook.', [
    T('Numeral', 'I', { x: 300, y: 980, slot: 'Corm', wt: 500, size: 300, color: 'accent', anim: { in: 'blur', out: 'fade' }, t0: 0 }),
    T('Name', 'Crafted slowly', { x: 600, y: 930, slot: 'Corm', wt: 500, ital: true, size: 92, align: 'left', w: 520, color: 'white', anim: { in: 'charup', out: 'fade' }, t0: 0.3 }),
    T('Detail', 'BY HAND · TO ORDER', { x: 600, y: 1010, slot: 'Mono', size: 22, track: 300, align: 'left', w: 520, color: 'white', anim: { in: 'fade', out: 'fade' }, t0: 0.7 }),
  ]);
  // ------------------------------------------------------------------ cinematic
  def('cn_credits', 'Opening credits', 'cinematic', 'A film-style credit: small caps, the brand name tracking out wide, “presents”.', [
    T('Top', 'A FILM BY', { x: 540, y: 820, slot: 'Mono', size: 24, track: 700, color: 'white', anim: { in: 'fade', out: 'fade' }, t0: 0 }),
    T('Name', '{brand}', { x: 540, y: 960, slot: 'Bebas', size: 150, track: 140, color: 'white', case: 'upper', w: 960, fx: { glow: 0.3, gcol: 'accent' }, anim: { in: 'tracking', inD: 1.6, out: 'blur' }, t0: 0.4, tok: 'brand' }),
    T('Bottom', 'PRESENTS', { x: 540, y: 1080, slot: 'Mono', size: 24, track: 700, color: 'accent', anim: { in: 'fade', out: 'fade' }, t0: 1.2 }),
  ]);
  def('cn_chapter', 'Chapter title', 'cinematic', 'A labelled divider opens, an italic chapter name focuses in beneath it.', [
    M('Divider', 'divider', { x: 540, y: 860, text: 'CHAPTER ONE', width: 720, color: 'white', t0: 0 }),
    T('Title', 'The Beginning', { x: 540, y: 1000, slot: 'Corm', wt: 500, ital: true, size: 140, color: 'white', fx: SH, anim: { in: 'blur', inD: 1.0, out: 'fade' }, t0: 0.5 }),
  ]);
  def('cn_trailer', 'Trailer title', 'cinematic', 'Two halves of a heavy title split apart and lock, with a long cinematic shadow.', [
    T('Title', 'BEYOND THE\nORDINARY', { x: 540, y: 950, slot: 'Bebas', size: 190, track: 60, lead: 0.92, color: 'white', fx: { shadow: 'long', shcol: 'accent' }, anim: { in: 'halves', out: 'wipe' }, t0: 0 }),
    T('Date', 'COMING SOON', { x: 540, y: 1180, slot: 'Mont', wt: 700, size: 30, track: 500, color: 'accent', anim: { in: 'tracking', out: 'fade' }, t0: 0.9 }),
  ]);
  def('cn_subtitle', 'Title & subtitle', 'cinematic', 'An outlined title fills in, an italic subtitle writes itself underneath.', [
    T('Title', 'NIGHTFALL', { x: 540, y: 920, slot: 'Mont', wt: 900, size: 140, track: 40, w: 940, color: 'white', fx: { fill: 'outline', stroke: 4, scol: 'white' }, anim: { in: 'outline', out: 'fade' }, t0: 0, ind: { food: 'SUPPER', estate: 'ESTATE', home: 'THE BUILD', beauty: 'THE CUT', auto: 'DETAIL' } }),
    T('Subtitle', 'a story in three parts', { x: 540, y: 1040, slot: 'Corm', wt: 500, ital: true, size: 66, color: 'white', anim: { in: 'typewriter', out: 'fade' }, t0: 0.8 }),
  ]);
  // ------------------------------------------------------------------ street culture
  def('st_sticker', 'Sticker bomb', 'street', 'A tilted, hard-shadowed title, an offer sticker slapped on, playful shapes around it.', [
    M('Shapes', 'shapes', { x: 540, y: 960, t0: 0 }),
    T('Title', 'FRESH\nDROP', { x: 540, y: 940, slot: 'Bebas', size: 250, lead: 0.86, rot: -0.1, color: 'white', fx: { shadow: 'hard', shcol: 'accent2' }, anim: { in: 'punch', out: 'drop' }, t0: 0.1, ind: { food: 'NEW\nMENU', beauty: 'FRESH\nCUTS', auto: 'NEW\nSHINE', estate: 'NEW\nLISTING', hosp: 'THIS\nWEEKEND' } }),
    M('Sticker', 'sticker', { x: 830, y: 650, text: 'NEW', sub: '', t0: 0.6 }),
  ]);
  def('st_tape', 'Caution tape', 'street', 'A scrolling tape, a boxed italic headline punched in over it.', [
    M('Tape', 'ticker', { x: 540, y: 1180, text: '{services}', t0: 0, tok: 'services' }),
    T('Headline', 'NO APPOINTMENT\nNEEDED', { x: 540, y: 930, slot: 'Mont', wt: 900, ital: true, size: 110, lead: 1.08, color: 'ink', fx: { deco: 'box', dcol: 'accent' }, anim: { in: 'punch', out: 'shrink' }, t0: 0.2, ind: { beauty: 'WALK-INS\nWELCOME', food: 'NO RESERVATION\nNEEDED', auto: 'DROP-INS\nWELCOME' } }),
  ]);
  def('st_spray', 'Spray tag', 'street', 'A handwritten tag sprays on letter by letter with a glow, a pill label underneath.', [
    T('Tag', 'pull up', { x: 540, y: 930, slot: 'Hand', size: 230, rot: -0.07, color: 'accent2', fx: { glow: 0.5, gcol: 'accent2', shadow: 'soft' }, anim: { in: 'letters', stagger: 0.08, out: 'fade' }, t0: 0 }),
    T('Label', 'THIS WEEKEND', { x: 540, y: 1110, slot: 'Bebas', size: 70, track: 120, color: 'ink', fx: { deco: 'pill', dcol: 'white' }, anim: { in: 'pop', out: 'fade' }, t0: 0.9 }),
  ]);
  // ------------------------------------------------------------------ neon kinetic
  def('ne_sign', 'Neon sign', 'neon', 'A neon script flickers on with a glitch, a second neon word glows underneath.', [
    T('Script', 'open late', { x: 540, y: 900, slot: 'Hand', wt: 700, size: 210, color: 'accent', fx: { fill: 'neon', glow: 1 }, anim: { in: 'glitch', out: 'fade', loop: 'flicker' }, t0: 0 }),
    T('Word', 'TONIGHT', { x: 540, y: 1080, slot: 'Mont', wt: 900, size: 64, track: 500, color: 'accent2', fx: { fill: 'neon', glow: 0.8 }, anim: { in: 'fade', inD: 0.6, out: 'fade', loop: 'breathe' }, t0: 0.7 }),
  ]);
  def('ne_pulse', 'Neon pulse', 'neon', 'A glowing headline scales in and pulses on the beat inside expanding rings.', [
    M('Rings', 'rings', { x: 540, y: 960, t0: 0 }),
    T('Headline', 'TURN IT UP', { x: 540, y: 960, slot: 'Bebas', size: 220, color: 'white', fx: { fill: 'neon', glow: 1.2, gcol: 'accent' }, anim: { in: 'zoom', out: 'grow', loop: 'pulse' }, t0: 0.2 }),
  ]);
  def('ne_glitch', 'Glitch hook', 'neon', 'A layered headline glitches in and keeps bursting, a typed line underneath.', [
    T('Headline', 'WAIT FOR IT', { x: 540, y: 920, slot: 'Mont', wt: 900, size: 124, w: 960, color: 'white', fx: { shadow: 'layered', shcol: 'accent' }, anim: { in: 'glitch', out: 'glitch', loop: 'glitch' }, t0: 0 }),
    T('Line', 'the reveal is worth it', { x: 540, y: 1060, slot: 'Mono', size: 36, color: 'accent2', anim: { in: 'typewriter', out: 'backspace' }, t0: 0.8 }),
  ]);
  // ------------------------------------------------------------------ experimental
  def('ex_arc', 'Curved type', 'experimental', 'A line of type bends round a circle and turns slowly around a bold centre word.', [
    T('Ring', 'ALL WEEK LONG · ALL WEEK LONG', { x: 540, y: 960, slot: 'Mont', wt: 800, size: 46, track: 160, w: 760, layout: 'arc', color: 'white', anim: { in: 'spin', inD: 1.2, out: 'fade', loop: 'swing' }, t0: 0 }),
    T('Centre', 'NEW', { x: 540, y: 990, slot: 'Bebas', size: 200, color: 'accent', anim: { in: 'pop', out: 'shrink' }, t0: 0.5 }),
  ]);
  def('ex_wave', 'Wave line', 'experimental', 'An italic serif line rides a wave and keeps rolling.', [
    T('Line', 'go with the flow', { x: 540, y: 960, slot: 'Corm', wt: 600, ital: true, size: 130, layout: 'wave', color: 'white', fx: SH, anim: { in: 'wave', out: 'fade', loop: 'wave' }, t0: 0 }),
  ]);
  def('ex_vertical', 'Vertical stack', 'experimental', 'A tall vertical word down the side, a handwritten pair of lines beside it.', [
    T('Tall word', 'FRESH', { x: 250, y: 960, slot: 'Bebas', size: 190, layout: 'vertical', color: 'accent', anim: { in: 'cascade', out: 'apart' }, t0: 0, ind: { estate: 'HOME', auto: 'CLEAN', home: 'BUILT', beauty: 'SHARP' } }),
    T('Side lines', 'made\ndaily', { x: 640, y: 940, slot: 'Hand', size: 140, lead: 0.95, align: 'left', w: 520, color: 'white', anim: { in: 'words', out: 'fade' }, t0: 0.5, ind: { estate: 'built\nto stay', auto: 'every\nsingle time', home: 'to\nlast', beauty: 'every\nweek' } }),
  ]);
  def('ex_handoff', 'Word handoff', 'experimental', 'One word at a time, big, each handing off to the next, then the full line.', [
    T('Words', 'FAST. FRESH. LOCAL.', { x: 540, y: 960, slot: 'Mont', wt: 900, size: 150, color: 'white', fx: SH, anim: { in: 'kinetic', inD: 0.42, out: 'grow' }, t0: 0, ind: { home: 'DREAM. DESIGN. BUILD.', beauty: 'CUT. STYLE. GO.', auto: 'WASH. POLISH. PROTECT.', estate: 'LOOK. LOVE. LIVE.', pro: 'PLAN. ACT. GROW.' } }),
  ]);
  def('ex_disassemble', 'Letter disassembly', 'experimental', 'Letters rain in one by one, then fly apart on the way out.', [
    T('Word', 'TAKE IT APART', { x: 540, y: 960, slot: 'Bebas', size: 200, w: 900, color: 'white', fx: { shadow: 'drop' }, anim: { in: 'cascade', out: 'apart' }, t0: 0 }),
    M('Lines', 'lines', { x: 540, y: 960, t0: 0 }),
  ]);
  // ------------------------------------------------------------------ promotional (prices and offers start as markers)
  def('pr_burst', 'Sale burst', 'promo', 'A starburst with your offer pops in over speed rays; it shows a marker until you type it.', [
    M('Rays', 'rays', { x: 540, y: 960, t0: 0 }),
    M('Burst', 'burst', { x: 540, y: 900, text: '', sub: '', t0: 0.2, demo: { text: 'SALE', sub: 'THIS WEEK' } }),
    T('Line', 'WHILE IT LASTS', { x: 540, y: 1220, slot: 'Mont', wt: 900, size: 54, track: 300, color: 'white', anim: { in: 'tracking', out: 'fade' }, t0: 0.8 }),
  ]);
  def('pr_tag', 'Price tag', 'promo', 'A swinging price tag drops in under a tracked “today only”; type the real price.', [
    T('Kicker', 'TODAY ONLY', { x: 540, y: 760, slot: 'Mono', size: 30, track: 500, color: 'accent', anim: { in: 'tracking', out: 'fade' }, t0: 0 }),
    M('Tag', 'pricetag', { x: 540, y: 1000, price: '', label: '', t0: 0.3, demo: { price: '$14.99', label: 'ONLY' } }),
  ]);
  def('pr_percent', 'Percent off', 'promo', 'A discount label slams in and a heavy line says what it’s on.', [
    M('Discount', 'discount', { x: 540, y: 880, text: '', sub: '', t0: 0, demo: { text: '-20%', sub: 'TODAY' } }),
    T('On', 'ON EVERYTHING', { x: 540, y: 1150, slot: 'Mont', wt: 900, size: 80, color: 'white', fx: SH, anim: { in: 'wordup', out: 'fade' }, t0: 0.5 }),
  ]);
  def('pr_limited', 'Limited time', 'promo', 'A limited-time banner unrolls with the end date you add underneath.', [
    M('Banner', 'limited', { x: 540, y: 900, text: 'LIMITED TIME', t0: 0 }),
    T('Ends', 'ADD THE END DATE', { x: 540, y: 1080, slot: 'Mont', wt: 800, size: 46, track: 200, color: 'white', anim: { in: 'pop', out: 'fade' }, t0: 0.6, ph: true, demo: 'ENDS SUNDAY' }),
  ]);
  def('pr_cta', 'Order button', 'promo', 'A big call-to-action button pops, gets tapped and ripples, with a line above it.', [
    T('Line', 'Ready when you are', { x: 540, y: 820, slot: 'Corm', wt: 600, ital: true, size: 100, color: 'white', fx: SH, anim: { in: 'blur', out: 'fade' }, t0: 0 }),
    M('Button', 'cta', { x: 540, y: 1000, text: '{cta}', t0: 0.5, tok: 'cta' }),
  ]);
  // ------------------------------------------------------------------ social hooks
  def('hk_pov', 'POV hook', 'hooks', '“POV:” in the brand colour, the line arriving word by word, left-aligned like a real post.', [
    T('POV', 'POV:', { x: 540, y: 820, slot: 'Mont', wt: 900, size: 120, align: 'left', w: 860, color: 'accent', fx: SH, anim: { in: 'pop', out: 'fade' }, t0: 0 }),
    T('Line', 'you finally found\nthe one', { x: 540, y: 980, slot: 'Mont', wt: 800, size: 92, align: 'left', w: 860, lead: 1.05, color: 'white', fx: SH, anim: { in: 'words', stagger: 0.12, out: 'fade' }, t0: 0.4, ind: { food: 'you found your\nnew favourite spot', estate: 'you walked in and\nknew it was home', home: 'your backyard\nfinally looks like this', beauty: 'you finally found\nyour barber', auto: 'your car looks\nbetter than new' } }),
  ]);
  def('hk_wait', 'Wait for it', 'hooks', 'A handwritten “wait for it…” types itself, then hops while a tap prompt pulses.', [
    T('Hook', 'wait for it…', { x: 540, y: 900, slot: 'Hand', size: 160, color: 'white', fx: SH, anim: { in: 'typewriter', out: 'fade', loop: 'bounce' }, t0: 0 }),
    M('Tap', 'tap', { x: 540, y: 1150, t0: 0.9 }),
  ]);
  def('hk_comment', 'Comment prompt', 'hooks', 'Ask for one word in the comments: a boxed headline and a small follow-up.', [
    T('Ask', 'COMMENT “YES”', { x: 540, y: 900, slot: 'Bebas', size: 170, color: 'ink', fx: { deco: 'box', dcol: 'accent2' }, anim: { in: 'punch', out: 'shrink', loop: 'jitter', loopAmt: 0.3 }, t0: 0 }),
    T('Follow', 'if you want part 2', { x: 540, y: 1070, slot: 'Mont', wt: 700, size: 54, color: 'white', fx: SH, anim: { in: 'rise', out: 'fade' }, t0: 0.6 }),
  ]);
  def('hk_save', 'Save this', 'hooks', 'A boxed “save this” with a reason underneath and a swipe prompt.', [
    T('Save', 'SAVE THIS', { x: 540, y: 880, slot: 'Bebas', size: 200, color: 'white', fx: { deco: 'box', dcol: 'accent' }, anim: { in: 'zoom', out: 'shrink' }, t0: 0 }),
    T('Why', 'for your next project', { x: 540, y: 1050, slot: 'Mont', wt: 700, size: 58, color: 'white', fx: SH, anim: { in: 'wordup', out: 'fade' }, t0: 0.5, ind: { food: 'for your next date night', beauty: 'for your next cut', auto: 'for your next detail', estate: 'for your house hunt' } }),
    M('Swipe', 'swipe', { x: 540, y: 1300, t0: 1.0 }),
  ]);
  def('hk_stop', 'Stop scrolling', 'hooks', 'A heavy two-line hook that punches in and jitters, outlined for contrast on any footage.', [
    T('Hook', 'STOP\nSCROLLING', { x: 540, y: 940, slot: 'Mont', wt: 900, size: 150, lead: 0.95, color: 'accent', fx: { stroke: 10, scol: 'ink', shadow: 'soft' }, anim: { in: 'punch', out: 'grow', loop: 'jitter', loopAmt: 0.5 }, t0: 0 }),
  ]);
  // ------------------------------------------------------------------ animated captions (type the script; it plays word by word)
  const CAPTXT = 'Here is how we do it, one step at a time, so you know exactly what to expect';
  def('cp_karaoke', 'Karaoke captions', 'captions', 'Each word fills with colour as it is said. Type or paste your script.', [
    T('Captions', CAPTXT, { x: 540, y: 1180, slot: 'Mont', wt: 900, size: 78, w: 900, case: 'upper', color: 'white', cap: { mode: 'karaoke', per: 3, hl: 'accent' }, t0: 0 }) ], { d: 5 });
  def('cp_pop', 'Word pop captions', 'captions', 'Words pop in one by one, two at a time, the newest in the brand colour.', [
    T('Captions', CAPTXT, { x: 540, y: 1150, slot: 'Bebas', size: 120, w: 900, case: 'upper', color: 'white', cap: { mode: 'pop', per: 2, hl: 'accent2' }, t0: 0 }) ], { d: 5 });
  def('cp_box', 'Highlight box captions', 'captions', 'A colour box jumps from word to word under the spoken one.', [
    T('Captions', CAPTXT, { x: 540, y: 1180, slot: 'Mont', wt: 800, size: 70, w: 900, color: 'white', cap: { mode: 'box', per: 3, hl: 'accent' }, t0: 0 }) ], { d: 5 });
  def('cp_bounce', 'Bounce captions', 'captions', 'Big single words that bounce on the beat, centred.', [
    T('Captions', CAPTXT, { x: 540, y: 1000, slot: 'Mont', wt: 900, size: 130, w: 900, case: 'upper', color: 'white', cap: { mode: 'bounce', per: 1, hl: 'accent' }, t0: 0 }) ], { d: 5 });
  def('cp_bar', 'Subtitle bar', 'captions', 'Classic subtitles on a soft bar, the spoken word underlined.', [
    T('Captions', CAPTXT, { x: 540, y: 1280, slot: 'Mont', wt: 600, size: 54, w: 860, color: 'white', cap: { mode: 'line', per: 6, hl: 'accent2', bg: 'bar', bgc: 'ink' }, t0: 0 }) ], { d: 5 });
  // ------------------------------------------------------------------ product highlights
  def('pd_name', 'Product name', 'product', 'A tracked kicker, a big product name and its features in one line.', [
    T('Kicker', 'THE ORIGINAL', { x: 540, y: 800, slot: 'Mono', size: 26, track: 500, color: 'accent', anim: { in: 'tracking', out: 'fade' }, t0: 0 }),
    T('Name', 'Product Name', { x: 540, y: 950, slot: 'Mont', wt: 900, size: 108, w: 960, color: 'white', fx: SH, anim: { in: 'charup', out: 'fade' }, t0: 0.25 }),
    T('Features', 'feature  ·  feature  ·  feature', { x: 540, y: 1080, slot: 'Mont', wt: 500, size: 36, track: 100, color: 'white', anim: { in: 'fade', out: 'fade' }, t0: 0.8 }),
  ]);
  def('pd_callouts', 'Feature callouts', 'product', 'Feature lines draw out from points on the product with a title above; type the real features.', [
    T('Title', 'WHAT MAKES IT', { x: 540, y: 520, slot: 'Bebas', size: 110, color: 'white', fx: SH, anim: { in: 'wipe', out: 'fade' }, t0: 0 }),
    M('Callouts', 'features', { x: 540, y: 960, items: '', t0: 0.4, demo: { items: 'Feature one\nFeature two\nFeature three' } }),
  ]);
  def('pd_new', 'New arrival', 'product', 'A NEW sticker slaps on a heavy product name that bounces in.', [
    T('Name', 'NEW ARRIVAL', { x: 540, y: 980, slot: 'Bebas', size: 190, color: 'white', fx: { shadow: 'hard', shcol: 'accent' }, anim: { in: 'bounce', out: 'drop' }, t0: 0 }),
    M('Sticker', 'sticker', { x: 760, y: 790, text: 'NEW', sub: '', t0: 0.5 }),
  ]);
  def('pd_inside', 'What’s inside', 'product', 'A tracked label and a handwritten list that writes itself line by line.', [
    T('Label', 'WHAT’S INSIDE', { x: 540, y: 760, slot: 'Mono', size: 30, track: 500, color: 'accent', anim: { in: 'tracking', out: 'fade' }, t0: 0 }),
    T('List', 'Ingredient one\nIngredient two\nIngredient three', { x: 540, y: 960, slot: 'Hand', size: 90, lead: 1.25, color: 'white', fx: SH, anim: { in: 'words', stagger: 0.18, out: 'fade' }, t0: 0.3, ind: { auto: 'Step one\nStep two\nStep three', beauty: 'Cut\nWash\nStyle', home: 'Design\nBuild\nFinish' } }),
  ]);
  // ------------------------------------------------------------------ restaurant
  def('rs_special', 'Today’s special', 'restaurant', 'A tracked “today’s special”, the dish in italic serif and a price tag you fill in.', [
    T('Kicker', 'TODAY’S SPECIAL', { x: 540, y: 740, slot: 'Mono', size: 30, track: 500, color: 'accent', anim: { in: 'tracking', out: 'fade' }, t0: 0 }),
    T('Dish', 'Dish Name', { x: 540, y: 880, slot: 'Corm', wt: 600, ital: true, size: 140, w: 940, color: 'white', fx: SH, anim: { in: 'blur', out: 'fade' }, t0: 0.2 }),
    M('Price', 'pricetag', { x: 540, y: 1120, price: '', label: '', t0: 0.7, demo: { price: '$14.99', label: 'TONIGHT' } }),
  ], { ind: ['food'] });
  def('rs_grill', 'Off the grill', 'restaurant', 'Hot, heavy type with a hard shadow, speed lines behind it.', [
    M('Lines', 'lines', { x: 540, y: 960, t0: 0 }),
    T('Headline', 'FRESH OFF\nTHE GRILL', { x: 540, y: 950, slot: 'Bebas', size: 220, lead: 0.88, color: 'accent2', fx: { shadow: 'hard', shcol: 'accent', stroke: 4, scol: 'ink' }, anim: { in: 'punch', out: 'drop' }, t0: 0.15 }),
  ], { ind: ['food'] });
  def('rs_signature', 'Signature dish', 'restaurant', 'A pill label, the dish name and what’s in it, centred like a menu.', [
    T('Label', 'SIGNATURE DISH', { x: 540, y: 760, slot: 'Mont', wt: 800, size: 30, track: 300, color: 'ink', fx: { deco: 'pill', dcol: 'accent' }, anim: { in: 'pop', out: 'fade' }, t0: 0 }),
    T('Dish', 'Dish Name', { x: 540, y: 920, slot: 'Corm', wt: 600, size: 150, w: 940, color: 'white', fx: SH, anim: { in: 'charup', out: 'fade' }, t0: 0.3 }),
    T('What’s in it', 'ingredient  ·  ingredient  ·  ingredient', { x: 540, y: 1040, slot: 'Mont', wt: 500, size: 34, color: 'white', anim: { in: 'fade', out: 'fade' }, t0: 0.8 }),
  ], { ind: ['food'] });
  def('rs_tonight', 'Available tonight', 'restaurant', 'A heavy word and a glowing script answer each other across a divider.', [
    T('Word', 'AVAILABLE', { x: 540, y: 860, slot: 'Mont', wt: 900, size: 110, track: 60, color: 'white', fx: SH, anim: { in: 'slide', dir: 'left', out: 'fade' }, t0: 0 }),
    T('Script', 'tonight', { x: 540, y: 1040, slot: 'Hand', wt: 700, size: 190, color: 'accent2', fx: { glow: 0.6, gcol: 'accent2' }, anim: { in: 'letters', out: 'fade', loop: 'float' }, t0: 0.4 }),
  ], { ind: ['food'] });
  def('rs_deal', 'Meal deal', 'restaurant', 'A combo headline with a big price you type, framed by a fine border.', [
    M('Frame', 'border', { x: 540, y: 960, t0: 0 }),
    T('Headline', 'MEAL DEAL', { x: 540, y: 820, slot: 'Bebas', size: 180, color: 'white', fx: { shadow: 'hard', shcol: 'accent' }, anim: { in: 'stagger', out: 'fade' }, t0: 0.2 }),
    T('Price', 'ADD PRICE', { x: 540, y: 1050, slot: 'Mont', wt: 900, size: 130, color: 'accent', fx: SH, anim: { in: 'pop', out: 'fade' }, t0: 0.6, ph: true, demo: '$14.99' }),
  ], { ind: ['food'] });
  // ------------------------------------------------------------------ real estate (facts come from the listing)
  def('re_listed', 'Just listed', 'estate', 'A boxed JUST LISTED, the address from the listing and the room counters.', [
    T('Status', 'JUST LISTED', { x: 540, y: 760, slot: 'Bebas', size: 170, color: 'ink', fx: { deco: 'box', dcol: 'accent' }, anim: { in: 'punch', out: 'fade' }, t0: 0 }),
    T('Address', '{addr}', { x: 540, y: 930, slot: 'Mont', wt: 700, size: 50, w: 900, color: 'white', fx: SH, anim: { in: 'typewriter', out: 'fade' }, t0: 0.5, tok: 'addr', demo: '18 Willow Bend Lane' }),
    M('Counters', 'counters', { x: 540, y: 1120, bed: '{beds}', bath: '{baths}', area: '{sqft}', car: '', t0: 0.9, tok: 'counters', demo: { bed: '4', bath: '3.5', area: '3,420', car: '2' } }),
  ], { ind: ['estate'] });
  def('re_price', 'Offered at', 'estate', 'The listing price reveals under “offered at”, the area underneath.', [
    M('Price', 'price', { x: 540, y: 900, price: '{price}', label: 'OFFERED AT', t0: 0, tok: 'price', demo: { price: '$1,295,000' } }),
    T('Area', '{area}', { x: 540, y: 1100, slot: 'Corm', wt: 500, ital: true, size: 70, color: 'white', fx: SH, anim: { in: 'blur', out: 'fade' }, t0: 0.8, tok: 'area', demo: 'Maple Grove' }),
  ], { ind: ['estate'] });
  def('re_specs', 'Property facts', 'estate', 'A specification panel with the listing’s facts and a tracked heading.', [
    T('Heading', 'THE DETAILS', { x: 540, y: 640, slot: 'Mono', size: 30, track: 500, color: 'accent', anim: { in: 'tracking', out: 'fade' }, t0: 0 }),
    M('Specs', 'specs', { x: 540, y: 960, rows: '{specrows}', t0: 0.3, tok: 'specs', demo: { rows: 'BEDS: 4\nBATHS: 3.5\nSQ FT: 3,420\nYEAR BUILT: 2019' } }),
  ], { ind: ['estate'] });
  def('re_room', 'Room label', 'estate', 'A numbered room label with a short note, like a property magazine.', [
    M('Room', 'numlabel', { x: 540, y: 980, num: '01', text: 'ROOM NAME', sub: '', t0: 0, demo: { text: 'THE KITCHEN', sub: 'Open plan · island' } }),
  ], { ind: ['estate'] });
  def('re_tour', 'Private tour', 'estate', 'A refined call to book a private tour, with the brand’s call-to-action button.', [
    T('Top', 'SCHEDULE YOUR', { x: 540, y: 800, slot: 'Mont', wt: 600, size: 36, track: 400, color: 'white', anim: { in: 'tracking', out: 'fade' }, t0: 0 }),
    T('Title', 'Private Tour', { x: 540, y: 930, slot: 'Corm', wt: 600, ital: true, size: 150, color: 'white', fx: { fill: 'gold', sweep: true, shadow: 'soft' }, anim: { in: 'blur', out: 'fade' }, t0: 0.3 }),
    M('Button', 'cta', { x: 540, y: 1120, text: '{cta}', t0: 0.9, tok: 'cta' }),
  ], { ind: ['estate'] });
  // ------------------------------------------------------------------ technical callouts
  def('tc_measure', 'Dimension line', 'tech', 'A measurement line draws across with the size you type and a technical label.', [
    T('Label', 'CUSTOM BUILT', { x: 540, y: 820, slot: 'Mono', size: 30, track: 400, color: 'accent', anim: { in: 'typewriter', out: 'fade' }, t0: 0 }),
    M('Measure', 'measure', { x: 540, y: 980, text: '', t0: 0.3, demo: { text: '24 FT' } }),
  ]);
  def('tc_pin', 'Location pin', 'tech', 'A map pin drops on the area you serve.', [
    T('Label', 'NOW SERVING', { x: 540, y: 760, slot: 'Mono', size: 30, track: 500, color: 'white', anim: { in: 'tracking', out: 'fade' }, t0: 0 }),
    M('Pin', 'pin', { x: 540, y: 1000, text: '{area}', t0: 0.3, tok: 'area', demo: { text: 'Your Area' } }),
  ]);
  def('tc_sheet', 'Spec sheet', 'tech', 'A monospaced spec sheet types out row by row under a stencil title; fill in the real values.', [
    T('Title', 'SPEC SHEET', { x: 540, y: 720, slot: 'Bebas', size: 120, track: 60, color: 'white', fx: { deco: 'underline', dcol: 'accent' }, anim: { in: 'wipe', out: 'fade' }, t0: 0 }),
    T('Rows', 'MATERIAL ...... ADD\nFINISH ........ ADD\nSIZE .......... ADD', { x: 540, y: 960, slot: 'Mono', size: 40, lead: 1.6, align: 'left', w: 760, color: 'white', anim: { in: 'typewriter', out: 'fade' }, t0: 0.4, ph: true, demo: 'MATERIAL ...... CEDAR\nFINISH ........ OIL\nSIZE .......... 12 FT' }),
  ]);
  def('tc_steps', 'Numbered steps', 'tech', 'Three numbered labels stack in, one per step.', [
    M('Step 1', 'numlabel', { x: 540, y: 760, num: '01', text: 'STEP ONE', sub: '', t0: 0 }),
    M('Step 2', 'numlabel', { x: 540, y: 980, num: '02', text: 'STEP TWO', sub: '', t0: 0.5 }),
    M('Step 3', 'numlabel', { x: 540, y: 1200, num: '03', text: 'STEP THREE', sub: '', t0: 1.0 }),
  ]);
  // ------------------------------------------------------------------ statistics & counters (your real numbers only)
  def('sx_count', 'Big number', 'stats', 'A number counts up big with its label. It shows a marker until you type your real figure.', [
    M('Number', 'stat', { x: 540, y: 960, value: '', label: 'YOUR LABEL', t0: 0, demo: { value: '3,500+', label: 'PROJECTS COMPLETED' } }),
  ]);
  def('sx_progress', 'Progress bar', 'stats', 'A labelled bar fills to the value you set, with a title.', [
    T('Title', 'IN PROGRESS', { x: 540, y: 820, slot: 'Bebas', size: 120, color: 'white', fx: SH, anim: { in: 'stagger', out: 'fade' }, t0: 0 }),
    M('Bar', 'progress', { x: 540, y: 1000, label: 'PROJECT', t0: 0.4 }),
  ]);
  def('sx_chart', 'Bar chart', 'stats', 'Bars grow in for each row you type: real figures only.', [
    T('Title', 'BY THE NUMBERS', { x: 540, y: 560, slot: 'Bebas', size: 110, color: 'white', fx: SH, anim: { in: 'wipe', out: 'fade' }, t0: 0 }),
    M('Chart', 'chart', { x: 540, y: 1000, rows: '', t0: 0.4, demo: { rows: 'MON: 40\nTUE: 55\nWED: 70\nTHU: 90' } }),
  ]);
  def('sx_duo', 'Two stats', 'stats', 'Two figures side by side with labels and a divider; type your own numbers.', [
    T('Number 1', 'ADD', { x: 300, y: 940, slot: 'Bebas', size: 180, color: 'accent', anim: { in: 'pop', out: 'fade' }, t0: 0, ph: true, demo: '30+' }),
    T('Label 1', 'YEARS', { x: 300, y: 1080, slot: 'Mono', size: 26, track: 300, color: 'white', anim: { in: 'fade', out: 'fade' }, t0: 0.3 }),
    T('Number 2', 'ADD', { x: 780, y: 940, slot: 'Bebas', size: 180, color: 'accent', anim: { in: 'pop', out: 'fade' }, t0: 0.4, ph: true, demo: '500' }),
    T('Label 2', 'PROJECTS', { x: 780, y: 1080, slot: 'Mono', size: 26, track: 300, color: 'white', anim: { in: 'fade', out: 'fade' }, t0: 0.7 }),
  ]);
  // ------------------------------------------------------------------ lower thirds
  def('lw_bars', 'Name & title bars', 'lower', 'Name and title bars slide in one after the other.', [
    M('Lower third', 'lower', { x: 540, y: 1300, text: 'Your Name', sub: 'YOUR TITLE', t0: 0 }) ]);
  def('lw_minimal', 'Minimal lower third', 'lower', 'A left-aligned name with an underline wiping in and a small coloured title.', [
    T('Name', 'Your Name', { x: 520, y: 1290, slot: 'Mont', wt: 800, size: 60, align: 'left', w: 820, color: 'white', fx: { deco: 'underline', dcol: 'accent', shadow: 'soft' }, anim: { in: 'wipe', out: 'fade' }, t0: 0 }),
    T('Title', 'YOUR TITLE', { x: 520, y: 1360, slot: 'Mono', size: 26, track: 300, align: 'left', w: 820, color: 'accent', anim: { in: 'fade', inDelay: 0.4, out: 'fade' }, t0: 0 }),
  ]);
  def('lw_handle', 'Social handle', 'lower', 'Your handle slides in with a follow line above it; type your real handle.', [
    T('Line', 'FOLLOW FOR MORE', { x: 540, y: 1220, slot: 'Mono', size: 26, track: 400, color: 'white', anim: { in: 'tracking', out: 'fade' }, t0: 0 }),
    M('Handle', 'handle', { x: 540, y: 1320, handle: '', t0: 0.3, demo: { handle: '@yourbrand' } }),
  ]);
  def('lw_caption', 'Photo caption', 'lower', 'A figure number and an italic caption under the shot, like a magazine.', [
    M('Caption', 'caption', { x: 540, y: 1300, num: 'FIG. 01', text: 'Add a caption for this shot', t0: 0 }) ]);
  // ------------------------------------------------------------------ end cards
  def('en_book', 'Book now card', 'end', 'The brand name, its call-to-action button and contact line.', [
    T('Brand', '{brand}', { x: 540, y: 820, slot: 'Bebas', size: 150, w: 940, case: 'upper', color: 'white', fx: SH, anim: { in: 'stagger', out: 'fade' }, t0: 0, tok: 'brand' }),
    M('Button', 'cta', { x: 540, y: 990, text: '{cta}', t0: 0.5, tok: 'cta' }),
    T('Contact', '{contact}', { x: 540, y: 1170, slot: 'Mont', wt: 600, size: 34, w: 940, color: 'white', anim: { in: 'fade', out: 'fade' }, t0: 1.0, tok: 'contact' }),
  ]);
  def('en_follow', 'Follow card', 'end', 'A follow prompt with your handle and a warm sign-off.', [
    T('Sign-off', 'See you next week', { x: 540, y: 820, slot: 'Hand', size: 120, color: 'white', fx: SH, anim: { in: 'letters', out: 'fade' }, t0: 0 }),
    M('Follow', 'follow', { x: 540, y: 1040, handle: '', t0: 0.6, demo: { handle: '@yourbrand' } }),
  ]);
  def('en_site', 'Website card', 'end', 'A boxed call to action and the website typed out underneath.', [
    T('Action', 'ORDER AHEAD', { x: 540, y: 880, slot: 'Mont', wt: 900, size: 120, color: 'ink', fx: { deco: 'box', dcol: 'white' }, anim: { in: 'zoom', out: 'fade' }, t0: 0, ind: { home: 'GET A QUOTE', estate: 'BOOK A TOUR', beauty: 'BOOK ONLINE', auto: 'BOOK A DETAIL', pro: 'BOOK A CALL', hosp: 'GET TICKETS', retail: 'SHOP ONLINE' } }),
    T('Website', '{web}', { x: 540, y: 1060, slot: 'Mono', size: 44, track: 100, case: 'upper', color: 'white', anim: { in: 'typewriter', out: 'fade' }, t0: 0.6, tok: 'web' }),
  ]);
  // ------------------------------------------------------------------ brand statements
  def('bs_manifesto', 'Manifesto', 'brand', 'A two-line statement rises word by word, signed with the brand name.', [
    T('Statement', 'WE BUILD\nWHAT LASTS', { x: 540, y: 920, slot: 'Mont', wt: 900, size: 150, lead: 1.0, color: 'white', fx: SH, anim: { in: 'wordup', stagger: 0.12, out: 'fade' }, t0: 0, ind: { food: 'MADE FROM\nSCRATCH', estate: 'THE ART\nOF LIVING', home: 'BUILT\nTO LAST', beauty: 'PRECISION IS\nEVERYTHING', auto: 'SHINE THAT\nLASTS', hosp: 'NIGHTS TO\nREMEMBER', retail: 'MADE TO\nBE WORN', pro: 'CLARITY\nFIRST' } }),
    T('Brand', '{brand}', { x: 540, y: 1160, slot: 'Mono', size: 28, track: 400, case: 'upper', color: 'accent', anim: { in: 'tracking', out: 'fade' }, t0: 0.9, tok: 'brand' }),
  ]);
  def('bs_three', 'Three words', 'brand', 'Three words land one after another, each in its own colour and motion.', [
    T('Word 1', 'DREAM.', { x: 540, y: 780, slot: 'Bebas', size: 190, color: 'white', anim: { in: 'slide', dir: 'left', out: 'fade' }, t0: 0, ind: { food: 'COOK.', beauty: 'CUT.', auto: 'WASH.', estate: 'LOOK.', pro: 'PLAN.' } }),
    T('Word 2', 'DESIGN.', { x: 540, y: 960, slot: 'Bebas', size: 190, color: 'accent', anim: { in: 'zoom', out: 'fade' }, t0: 0.45, ind: { food: 'SERVE.', beauty: 'STYLE.', auto: 'POLISH.', estate: 'LOVE.', pro: 'ACT.' } }),
    T('Word 3', 'BUILD.', { x: 540, y: 1140, slot: 'Bebas', size: 190, color: 'white', anim: { in: 'slide', dir: 'right', out: 'fade' }, t0: 0.9, ind: { food: 'REPEAT.', beauty: 'GO.', auto: 'PROTECT.', estate: 'LIVE.', pro: 'GROW.' } }),
  ]);
  def('bs_since', 'Since year', 'brand', 'SINCE, the year from your brand kit, and the brand name: a heritage stamp.', [
    T('Since', 'SINCE', { x: 540, y: 760, slot: 'Mono', size: 34, track: 600, color: 'white', anim: { in: 'tracking', out: 'fade' }, t0: 0 }),
    T('Year', '{since}', { x: 540, y: 990, slot: 'Bebas', size: 280, color: 'accent', fx: { shadow: 'soft' }, anim: { in: 'flip', out: 'fade' }, t0: 0.3, tok: 'since', demo: '1990' }),
    T('Brand', '{brand}', { x: 540, y: 1190, slot: 'Corm', wt: 600, ital: true, size: 70, color: 'white', anim: { in: 'blur', out: 'fade' }, t0: 0.8, tok: 'brand' }),
  ]);
  def('bs_promise', 'The promise', 'brand', 'A quote-style promise with drawn quote marks and a tagline from your brand kit.', [
    M('Quote marks', 'quote', { x: 540, y: 960, text: '{tagline}', by: '{brand}', t0: 0, tok: 'quote' }),
  ]);

  // ------------------------------------------------------------------ filling a composition: tokens from the brand kit / listing, placeholders, previews
  const cap1 = s => String(s || '').trim();
  function contactLine() { const C = typeof CONTACT !== 'undefined' ? CONTACT : {}; return [C.phone, C.web].filter(Boolean).join('   ·   '); }
  function tokVal(tok, ctx) {
    const B = typeof BRAND !== 'undefined' ? BRAND : {}, C = typeof CONTACT !== 'undefined' ? CONTACT : {}, P = (ctx && ctx.prop) || null, K = typeof K7 !== 'undefined' ? K7 : null;
    switch (tok) {
      case 'brand': return cap1(B.short && B.name && B.name.length > 22 ? B.short : B.name);
      case 'cta': return cap1(C.cta) || 'BOOK NOW';
      case 'web': return cap1(C.web);
      case 'contact': return contactLine();
      case 'since': return cap1(C.since);
      case 'tagline': return cap1(C.tagline);
      case 'services': return (B.services || []).slice(0, 4).join('  •  ') || cap1(B.name);
      case 'area': return cap1(P && P.area) || cap1(C.area);
      case 'addr': return cap1(P && P.addr);
      case 'price': return P && P.price && K ? K.money(P.price, P.deal) : '';
      case 'beds': return cap1(P && P.beds); case 'baths': return cap1(P && P.baths); case 'sqft': return cap1(P && P.sqft ? (K ? K.num(P.sqft) : P.sqft) : '');
      case 'specrows': { if (!P) return ''; const r = [['BEDS', P.beds], ['BATHS', P.baths], ['SQ FT', P.sqft ? (K ? K.num(P.sqft) : P.sqft) : ''], ['LOT', P.lot]].filter(x => x[1]); return r.map(x => x[0] + ': ' + x[1]).join('\n'); }
      default: return '';
    }
  }
  const PH = { brand: 'YOUR BRAND', cta: 'BOOK NOW', web: 'YOURSITE.COM', contact: 'ADD PHONE  ·  ADD WEBSITE', since: 'YEAR', tagline: 'Add your tagline in the brand kit', area: 'ADD AREA', addr: 'ADD ADDRESS', price: '', services: 'ADD YOUR SERVICES' };
  // the layers of a composition, ready to insert or preview: {kind, style, ...} with relative t0/d and the role name
  function layers(id, ctx) {
    const c = BY[id]; if (!c) return []; ctx = ctx || {}; const sec = ctx.sector || null, demo = !!ctx.demo, out = [];
    for (const l of c.layers) {
      const L = JSON.parse(JSON.stringify(l)); const role = L.role, k = L.k, tok = L.tok, ph = L.ph, dm = L.demo, ind = L.ind;
      delete L.k; delete L.role; delete L.tok; delete L.ph; delete L.demo; delete L.ind;
      L.t0 = +L.t0 || 0; L.d = +L.d || Math.max(0.6, c.d - L.t0); L.name = role;
      if (k === 't') {
        Object.assign(L, { kind: 'text', style: 'type' });
        if (ind && sec && ind[sec]) L.text = ind[sec];
        if (tok) { const v = tokVal(tok, ctx); L.text = v || (demo && dm) || PH[tok] || L.text.replace(/\{\w+\}/g, '').trim() || 'ADD TEXT'; }
        else if (ph && demo && dm) L.text = dm;
      } else {
        Object.assign(L, { kind: 'mg' });
        for (const key of Object.keys(L)) if (typeof L[key] === 'string' && /\{\w+\}/.test(L[key])) { const tk = L[key].slice(1, -1); L[key] = tokVal(tk, ctx) || ''; }
        if (tok === 'quote') { L.text = tokVal('tagline', ctx) || (demo ? 'Every project gets our full attention.' : ''); L.by = tokVal('brand', ctx); }
        if (demo && dm) for (const [kk, vv] of Object.entries(dm)) if (!L[kk]) L[kk] = vv;
      }
      out.push(L);
    }
    return out;
  }
  // a composition is offered when every graphic in it is allowed by the brand's rules (DPG: no prices, offers or sale bursts)
  const usable = id => { const c = BY[id]; return !!c && c.layers.every(l => l.k !== 'm' || typeof K9 === 'undefined' || K9.allowed(l.type)); };
  function preview(id, t, ctx) {   // library previews: the composition with sample values
    const Ls = layers(id, Object.assign({ demo: true }, ctx || {}));
    for (const L of Ls) { const lt = t - L.t0; if (lt < 0 || lt >= L.d) continue; const s = K8.xf(L, lt);
      if (L.kind === 'text') K8.withLayer(s, K8.box(L), () => K8.type(L, t, s));
      else { const e = K9.EL[L.type]; if (!e) continue; if (e.full) { ctx2(() => K9.draw(L, t, s), s); } else K8.withLayer(s, K9.box(L), () => K9.draw(L, t, s)); } }
  }
  function ctx2(fn, s) { if (VID.collecting) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= s.op; fn(); ctx.restore(); }
  return { CATS, C, BY, layers, usable, preview, tokVal };
})();
