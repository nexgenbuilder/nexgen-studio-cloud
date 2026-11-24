'use strict';
/* Text Studio additions (V16, Nov 6): three more collections for kit 11, loaded right after kit11.js.
   Placements: the same kinds of overlay built for each part of the frame (corners, edges, sides, top and bottom), so a
   label can sit where the footage leaves room. Info & showcase: overlays any business can use to explain or show something.
   Printing & merch: sets for print shops. Same rules as kit 11: brand fonts and colours, industry lines per sector, and
   facts (prices, days, numbers) insert as clear placeholders, with sample values only in previews. */
(() => {
  if (typeof K11 === 'undefined') return;
  K11.CATS.push(['place', 'Placements'], ['info', 'Info & showcase'], ['print', 'Printing & merch']);
  const T = (role, text, o) => Object.assign({ k: 't', role, text }, o), M = (role, type, o) => Object.assign({ k: 'm', role, type }, o);
  const def = (id, name, cat, desc, layers, o) => { if (K11.BY[id]) return; const c = Object.assign({ id, name, cat, desc, d: 4, layers }, o || {}); K11.C.push(c); K11.BY[id] = c; };
  const SH = { shadow: 'soft' };

  // ------------------------------------------------------------------ placements
  def('pl_tl', 'Corner tag · top left', 'place', 'A boxed tag and a short line tucked into the top-left corner.', [
    T('Tag', 'NEW', { x: 290, y: 330, w: 440, align: 'left', slot: 'Mono', size: 30, track: 300, color: 'ink', fx: { deco: 'box', dcol: 'accent' }, anim: { in: 'wipe', out: 'fade' }, t0: 0, ind: { food: 'ON THE MENU', estate: 'JUST LISTED', home: 'NEW PROJECT', beauty: 'FRESH CUT', auto: 'IN THE BAY', retail: 'JUST IN', hosp: 'THIS WEEK', pro: 'NEW' } }),
    T('Line', 'Our latest work', { x: 290, y: 420, w: 440, align: 'left', slot: 'Mont', wt: 800, size: 50, color: 'white', fx: SH, anim: { in: 'wordup', out: 'fade' }, t0: 0.3, ind: { food: 'Made fresh today', estate: 'Take a look inside', beauty: 'Look at this fade', auto: 'Look at that shine', retail: 'Fresh off the line' } }),
  ]);
  def('pl_tr', 'Corner badge · top right', 'place', 'A spinning badge in the top-right corner with a handwritten note under it.', [
    M('Badge', 'sticker', { x: 850, y: 420, text: 'NEW', sub: '', t0: 0 }),
    T('Note', 'just finished', { x: 820, y: 580, slot: 'Hand', size: 62, color: 'white', rot: -0.06, fx: SH, anim: { in: 'letters', out: 'fade' }, t0: 0.5, ind: { food: 'fresh out', estate: 'just listed', beauty: 'fresh', auto: 'just detailed', retail: 'just dropped' } }),
  ]);
  def('pl_top', 'Top title bar', 'place', 'A boxed title across the top with a tracked line under it; leaves the middle clear for the footage.', [
    T('Title', 'THE TRANSFORMATION', { x: 540, y: 330, w: 960, slot: 'Bebas', size: 104, color: 'white', fx: { deco: 'box', dcol: 'ink' }, anim: { in: 'wipe', out: 'wipe' }, t0: 0, ind: { food: 'HOW WE MAKE IT', estate: 'THE TOUR', beauty: 'THE GLOW-UP', auto: 'THE DETAIL', retail: 'THE DROP', hosp: 'THE NIGHT' } }),
    T('Sub', 'WATCH TILL THE END', { x: 540, y: 440, slot: 'Mono', size: 26, track: 300, color: 'accent', fx: SH, anim: { in: 'tracking', out: 'fade' }, t0: 0.4 }),
  ]);
  def('pl_bottom', 'Bottom title bar', 'place', 'A boxed line low in the frame with the brand name under it, above where captions sit.', [
    T('Title', 'Done right.', { x: 540, y: 1260, w: 940, slot: 'Mont', wt: 900, size: 80, color: 'ink', fx: { deco: 'box', dcol: 'accent' }, anim: { in: 'rise', out: 'fade' }, t0: 0, ind: { food: 'Made fresh.', estate: 'Welcome home.', beauty: 'Fresh cut.', auto: 'Showroom shine.', retail: 'Just dropped.', hosp: 'See you there.' } }),
    T('Brand', '{brand}', { x: 540, y: 1360, slot: 'Mono', size: 26, track: 300, color: 'white', fx: SH, tok: 'brand', anim: { in: 'fade', out: 'fade' }, t0: 0.3 }),
  ]);
  def('pl_left', 'Side word · left edge', 'place', 'A short word stacked letter by letter down the left edge, out of the way of the subject.', [
    T('Side', 'NEW', { x: 120, y: 900, slot: 'Bebas', size: 110, layout: 'vertical', color: 'white', fx: SH, anim: { in: 'cascade', out: 'apart' }, t0: 0, ind: { food: 'FRESH', estate: 'HOME', home: 'BUILT', beauty: 'SHARP', auto: 'CLEAN', retail: 'NEW', hosp: 'LIVE' } }),
  ]);
  def('pl_right', 'Side word · right edge', 'place', 'A short accent word stacked down the right edge.', [
    T('Side', 'LOOK', { x: 960, y: 900, slot: 'Bebas', size: 110, layout: 'vertical', color: 'accent', fx: SH, anim: { in: 'cascade', out: 'apart' }, t0: 0, ind: { food: 'YUM', estate: 'TOUR', beauty: 'FADE', auto: 'SHINE', retail: 'SHOP' } }),
  ]);
  def('pl_frame', 'Top & bottom', 'place', 'A line at the top and a handwritten answer at the bottom, framing the shot between them.', [
    T('Top', 'BEFORE YOU BOOK', { x: 540, y: 340, slot: 'Mont', wt: 900, size: 76, color: 'white', fx: { shadow: 'hard', shcol: 'accent' }, anim: { in: 'punch', out: 'fade' }, t0: 0, ind: { food: 'BEFORE YOU ORDER', estate: 'BEFORE YOU BUY', retail: 'BEFORE YOU SHOP' } }),
    T('Bottom', 'watch this', { x: 540, y: 1320, slot: 'Hand', size: 90, color: 'accent', fx: SH, anim: { in: 'letters', out: 'fade' }, t0: 0.6 }),
  ]);
  def('pl_split', 'Left & right labels', 'place', 'Two boxed labels low in the frame, one per side: before and after, this and that.', [
    T('Left', 'BEFORE', { x: 280, y: 1260, slot: 'Bebas', size: 84, color: 'white', fx: { deco: 'box', dcol: 'ink' }, anim: { in: 'slide', dir: 'left', out: 'slide', outDir: 'left' }, t0: 0 }),
    T('Right', 'AFTER', { x: 800, y: 1260, slot: 'Bebas', size: 84, color: 'ink', fx: { deco: 'box', dcol: 'accent' }, anim: { in: 'slide', dir: 'right', out: 'slide', outDir: 'right' }, t0: 0.15 }),
  ]);
  def('pl_center', 'Centre stamp', 'place', 'A tilted stamp that punches into the middle and shakes.', [
    T('Stamp', 'MUST SEE', { x: 540, y: 960, slot: 'Bebas', size: 190, rot: -0.12, color: 'ink', fx: { deco: 'box', dcol: 'accent' }, anim: { in: 'punch', out: 'grow', loop: 'jitter', loopAmt: 0.25 }, t0: 0, ind: { food: 'MUST TRY', beauty: 'FRESH', auto: 'SPOTLESS', retail: 'NEW IN' } }),
  ]);
  def('pl_pin', 'Location tag · low', 'place', 'Your area with a map pin, low and to the left.', [
    M('Pin', 'pin', { x: 330, y: 1290, text: '{area}', t0: 0, tok: 'area', demo: { text: 'Your Area' } }),
  ]);

  // ------------------------------------------------------------------ info & showcase
  def('in_dyk', 'Did you know?', 'info', 'A typed kicker and a big fact line. Type a fact you can stand behind.', [
    T('Kicker', 'DID YOU KNOW?', { x: 540, y: 720, slot: 'Mono', size: 36, track: 300, color: 'accent', fx: SH, anim: { in: 'typewriter', out: 'fade' }, t0: 0 }),
    T('Fact', 'Type the fact here', { x: 540, y: 900, w: 900, slot: 'Mont', wt: 900, size: 86, lead: 1.05, color: 'white', fx: SH, anim: { in: 'words', stagger: 0.1, out: 'fade' }, t0: 0.6, ph: true, demo: 'Small details make the biggest difference.' }),
  ], { d: 5 });
  def('in_top3', 'Top 3', 'info', 'A big “TOP 3” and three lines that slide in one at a time.', [
    T('Title', 'TOP 3', { x: 540, y: 560, slot: 'Bebas', size: 220, color: 'accent', fx: { shadow: 'hard', shcol: 'ink' }, anim: { in: 'punch', out: 'fade' }, t0: 0 }),
    T('One', '1  First reason', { x: 540, y: 820, w: 820, align: 'left', slot: 'Mont', wt: 800, size: 64, color: 'white', fx: SH, anim: { in: 'slide', dir: 'left', out: 'fade' }, t0: 0.5, ph: true, demo: '1  Fresh every day' }),
    T('Two', '2  Second reason', { x: 540, y: 930, w: 820, align: 'left', slot: 'Mont', wt: 800, size: 64, color: 'white', fx: SH, anim: { in: 'slide', dir: 'left', out: 'fade' }, t0: 0.9, ph: true, demo: '2  Local and family run' }),
    T('Three', '3  Third reason', { x: 540, y: 1040, w: 820, align: 'left', slot: 'Mont', wt: 800, size: 64, color: 'white', fx: SH, anim: { in: 'slide', dir: 'left', out: 'fade' }, t0: 1.3, ph: true, demo: '3  Easy to book' }),
  ], { d: 5 });
  def('in_myth', 'Myth vs fact', 'info', 'A boxed MYTH and its line, then FACT and the answer. Type both.', [
    T('Myth tag', 'MYTH', { x: 540, y: 620, slot: 'Bebas', size: 90, color: 'white', fx: { deco: 'box', dcol: 'ink' }, anim: { in: 'pop', out: 'fade' }, t0: 0 }),
    T('Myth', 'Type the myth', { x: 540, y: 750, w: 880, slot: 'Mont', wt: 800, size: 62, color: 'white', fx: SH, anim: { in: 'words', out: 'fade' }, t0: 0.3, ph: true, demo: 'It has to cost a fortune.' }),
    T('Fact tag', 'FACT', { x: 540, y: 960, slot: 'Bebas', size: 90, color: 'ink', fx: { deco: 'box', dcol: 'accent' }, anim: { in: 'punch', out: 'fade' }, t0: 1.4 }),
    T('Fact', 'Type the fact', { x: 540, y: 1090, w: 880, slot: 'Mont', wt: 800, size: 62, color: 'white', fx: SH, anim: { in: 'words', out: 'fade' }, t0: 1.7, ph: true, demo: 'Ask us. You might be surprised.' }),
  ], { d: 5 });
  def('in_how', 'How it works', 'info', 'Three numbered steps stack in under a title.', [
    T('Title', 'HOW IT WORKS', { x: 540, y: 520, slot: 'Bebas', size: 120, color: 'white', fx: { deco: 'underline', dcol: 'accent' }, anim: { in: 'wipe', out: 'fade' }, t0: 0 }),
    M('Step 1', 'numlabel', { x: 540, y: 720, num: '01', text: 'STEP ONE', sub: '', t0: 0.3, demo: { text: 'BOOK ONLINE', sub: '' } }),
    M('Step 2', 'numlabel', { x: 540, y: 940, num: '02', text: 'STEP TWO', sub: '', t0: 0.7, demo: { text: 'WE DO THE WORK', sub: '' } }),
    M('Step 3', 'numlabel', { x: 540, y: 1160, num: '03', text: 'STEP THREE', sub: '', t0: 1.1, demo: { text: 'YOU ENJOY IT', sub: '' } }),
  ], { d: 5 });
  def('in_from', 'Starting at', 'info', 'A kicker, a price tag and a short note. The price stays a marker until you type it.', [
    T('Kicker', 'STARTING AT', { x: 540, y: 640, slot: 'Mono', size: 34, track: 300, color: 'accent', fx: SH, anim: { in: 'tracking', out: 'fade' }, t0: 0 }),
    M('Price', 'pricetag', { x: 540, y: 930, price: '', label: '', t0: 0.3, demo: { price: '$99', label: 'FROM' } }),
    T('Note', 'Ask about packages', { x: 540, y: 1270, slot: 'Mont', wt: 700, size: 48, color: 'white', fx: SH, anim: { in: 'rise', out: 'fade' }, t0: 0.7 }),
  ]);
  def('in_hours', 'Open today', 'info', 'OPEN TODAY, your hours (typed by you) and your area with a pin.', [
    T('Open', 'OPEN TODAY', { x: 540, y: 820, slot: 'Bebas', size: 170, color: 'accent', fx: { shadow: 'hard', shcol: 'ink' }, anim: { in: 'punch', out: 'fade' }, t0: 0 }),
    T('Hours', 'ADD HOURS', { x: 540, y: 960, slot: 'Mont', wt: 800, size: 66, color: 'white', fx: SH, anim: { in: 'wordup', out: 'fade' }, t0: 0.4, ph: true, demo: '9 AM – 7 PM' }),
    M('Pin', 'pin', { x: 540, y: 1150, text: '{area}', t0: 0.7, tok: 'area', demo: { text: 'Your Area' } }),
  ]);
  def('in_vs', 'This or that', 'info', 'Two choices slide in from each side with a VS in the middle and a comment prompt.', [
    T('Left', 'THIS', { x: 280, y: 940, slot: 'Bebas', size: 160, color: 'white', fx: SH, anim: { in: 'slide', dir: 'left', out: 'slide', outDir: 'left' }, t0: 0, ind: { food: 'TACOS', beauty: 'FADE', auto: 'WAX', estate: 'CITY' } }),
    T('VS', 'VS', { x: 540, y: 940, slot: 'Mont', wt: 900, size: 64, color: 'ink', fx: { deco: 'pill', dcol: 'accent' }, anim: { in: 'pop', out: 'fade' }, t0: 0.35 }),
    T('Right', 'THAT', { x: 800, y: 940, slot: 'Bebas', size: 160, color: 'accent', fx: SH, anim: { in: 'slide', dir: 'right', out: 'slide', outDir: 'right' }, t0: 0.15, ind: { food: 'BURRITO', beauty: 'TAPER', auto: 'CERAMIC', estate: 'SUBURBS' } }),
    T('Ask', 'comment your pick', { x: 540, y: 1110, slot: 'Hand', size: 70, color: 'white', fx: SH, anim: { in: 'letters', out: 'fade' }, t0: 0.8 }),
  ]);
  def('in_new', 'Now offering', 'info', 'A NEW badge, a kicker and the name of the service or product.', [
    M('Badge', 'sticker', { x: 830, y: 640, text: 'NEW', sub: '', t0: 0.4 }),
    T('Kicker', 'NOW OFFERING', { x: 540, y: 880, slot: 'Mono', size: 34, track: 300, color: 'accent', fx: SH, anim: { in: 'tracking', out: 'fade' }, t0: 0 }),
    T('Name', 'Your new service', { x: 540, y: 1010, w: 920, slot: 'Mont', wt: 900, size: 100, color: 'white', fx: SH, anim: { in: 'wordup', out: 'fade' }, t0: 0.2, ind: { food: 'Catering', home: 'Paver patios', beauty: 'Beard care', auto: 'Ceramic coating', estate: 'Virtual tours', retail: 'Custom orders', hosp: 'Private events' } }),
  ]);
  def('in_tip', 'Pro tip', 'info', 'A PRO TIP pill and a big tip line. Type a tip in your own words.', [
    T('Tag', 'PRO TIP', { x: 540, y: 780, slot: 'Mono', size: 32, track: 260, color: 'ink', fx: { deco: 'pill', dcol: 'accent' }, anim: { in: 'pop', out: 'fade' }, t0: 0 }),
    T('Tip', 'Type your tip here', { x: 540, y: 950, w: 900, slot: 'Mont', wt: 900, size: 84, lead: 1.05, color: 'white', fx: SH, anim: { in: 'words', stagger: 0.1, out: 'fade' }, t0: 0.4, ph: true, demo: 'Book early. The best slots go first.' }),
  ], { d: 5 });
  def('in_ask', 'Question hook', 'info', 'A two-line question rises in, then a handwritten answer.', [
    T('Question', 'EVER WONDERED\nHOW WE DO IT?', { x: 540, y: 880, w: 940, slot: 'Mont', wt: 900, size: 104, lead: 1.0, color: 'white', fx: SH, anim: { in: 'wordup', out: 'shrink' }, t0: 0, ind: { food: 'EVER WONDERED\nHOW WE MAKE IT?', estate: 'WHAT DOES\nTHIS ONE COST?', auto: 'HOW DOES IT\nGET THIS SHINY?' } }),
    T('Answer', 'here’s how', { x: 560, y: 1100, slot: 'Hand', size: 80, color: 'accent', rot: -0.04, fx: SH, anim: { in: 'letters', out: 'fade' }, t0: 0.9 }),
  ]);

  // ------------------------------------------------------------------ printing & merch
  def('pr_custom', 'Your logo on anything', 'print', 'Two stacked lines slam in, then your services run along a tape.', [
    T('Top', 'YOUR LOGO', { x: 540, y: 820, slot: 'Bebas', size: 180, color: 'white', fx: SH, anim: { in: 'stagger', out: 'drop' }, t0: 0 }),
    T('Bottom', 'ON ANYTHING', { x: 540, y: 990, slot: 'Bebas', size: 180, color: 'accent', fx: { shadow: 'hard', shcol: 'ink' }, anim: { in: 'stagger', out: 'drop' }, t0: 0.25 }),
    M('Tape', 'ticker', { x: 540, y: 1200, text: '{services}', t0: 0.4, tok: 'services' }),
  ], { ind: ['retail', 'pro'] });
  def('pr_turn', 'Order by / ready by', 'print', 'Order-by and ready-by days. Type your real turnaround.', [
    T('Kicker', 'ORDER BY', { x: 540, y: 700, slot: 'Mono', size: 34, track: 300, color: 'accent', fx: SH, anim: { in: 'tracking', out: 'fade' }, t0: 0 }),
    T('Day 1', 'ADD DAY', { x: 540, y: 840, slot: 'Bebas', size: 150, color: 'white', fx: SH, anim: { in: 'punch', out: 'fade' }, t0: 0.2, ph: true, demo: 'THURSDAY' }),
    T('Then', 'ready by', { x: 540, y: 960, slot: 'Hand', size: 70, color: 'accent', fx: SH, anim: { in: 'letters', out: 'fade' }, t0: 0.7 }),
    T('Day 2', 'ADD DAY', { x: 540, y: 1100, slot: 'Bebas', size: 150, color: 'white', fx: SH, anim: { in: 'punch', out: 'fade' }, t0: 1.1, ph: true, demo: 'MONDAY' }),
  ], { d: 5, ind: ['retail', 'pro'] });
  def('pr_bulk', 'Bulk pricing', 'print', 'A title and quantity rows that type out; fill in your real prices.', [
    T('Title', 'BULK PRICING', { x: 540, y: 700, slot: 'Bebas', size: 140, color: 'accent', fx: { deco: 'underline', dcol: 'accent' }, anim: { in: 'wipe', out: 'fade' }, t0: 0 }),
    T('Rows', '25+ .......... ADD\n50+ .......... ADD\n100+ ......... ADD', { x: 540, y: 900, w: 720, align: 'left', slot: 'Mono', size: 46, lead: 1.6, color: 'white', anim: { in: 'typewriter', out: 'fade' }, t0: 0.4, ph: true, demo: '25+ .......... $12 EA\n50+ .......... $10 EA\n100+ ......... $8 EA' }),
  ], { d: 5, ind: ['retail', 'pro'] });
  def('pr_proof', 'Proof approved', 'print', 'A tilted PROOF APPROVED stamp punches in, then a handwritten “printing next”.', [
    T('Stamp', 'PROOF APPROVED', { x: 540, y: 900, slot: 'Bebas', size: 130, rot: -0.1, color: 'ink', fx: { deco: 'box', dcol: 'accent' }, anim: { in: 'punch', out: 'grow' }, t0: 0 }),
    T('Next', 'printing next', { x: 560, y: 1080, slot: 'Hand', size: 78, color: 'white', fx: SH, anim: { in: 'letters', out: 'fade' }, t0: 0.7 }),
  ], { ind: ['retail', 'pro'] });
  def('pr_spec', 'Print specs', 'print', 'A spec card for a print job: stock, size, finish and quantity. Fill in the job’s details.', [
    T('Title', 'THE SPECS', { x: 540, y: 680, slot: 'Bebas', size: 120, color: 'white', fx: { deco: 'underline', dcol: 'accent' }, anim: { in: 'wipe', out: 'fade' }, t0: 0 }),
    T('Rows', 'STOCK ......... ADD\nSIZE .......... ADD\nFINISH ........ ADD\nQUANTITY ...... ADD', { x: 540, y: 880, w: 760, align: 'left', slot: 'Mono', size: 42, lead: 1.6, color: 'white', anim: { in: 'typewriter', out: 'fade' }, t0: 0.4, ph: true, demo: 'STOCK ......... 16 PT\nSIZE .......... 3.5 × 2 IN\nFINISH ........ SOFT TOUCH\nQUANTITY ...... 500' }),
  ], { d: 5, ind: ['retail', 'pro'] });
})();
