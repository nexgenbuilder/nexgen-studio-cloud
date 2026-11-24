'use strict';
/* NexGen Studio V13–V16 (Nov 5–6): the nx3–nx6 families (engine/tpl_nx3.js … tpl_nx6.js) in the gallery, plus ten new industries:
   heating & air, carpet cleaning, commercial cleaning, and six restaurant categories (pizza, burgers, tacos, Mexican,
   Italian, sandwiches). A category keeps its own starting copy and default text; through `base` the older templates read it
   as its parent industry (a pizzeria gets the restaurant copy there, a carpet cleaner the house-cleaning copy).
   Copy rules as in packs.js: no superlatives, no prices or offers, no claims a client hasn't stated. Loads after
   nx-registry.js and before nx-app.js. */
window.NX = window.NX || {};
(() => {
  const I = NX.INDUSTRIES, R = I.restaurant, CL = I.cleaning, GEN = I.general;
  const merge = (base, o) => { const out = {}; for (const k in base) out[k] = Object.assign({}, base[k]); for (const k in o) out[k] = Object.assign({}, out[k] || {}, o[k]); return out; };

  // ------------------------------------------------------------ industries
  const food = o => Object.assign({ base: 'restaurant', noun: 'TABLE', cta: 'ORDER NOW', badge: 'FAMILY OWNED' }, o, { copy: merge(R.copy, o.copy) });
  const FOODS = {
    pizza: food({
      label: 'Pizzeria', noun: 'PIE', tagline: 'Hot out of the oven.',
      services: ['PIZZA', 'WINGS', 'CALZONES', 'SALADS', 'DELIVERY', 'CATERING'],
      billing: ['{brand}  PRESENTS  A FRESH PIE PRODUCTION', 'DOUGH STRETCHED BY HAND', 'BAKED TO ORDER', 'OUT OF THE OVEN, INTO THE BOX', 'SERVING {area}'],
      copy: {
        spot: { kick: 'FROM OUR OVEN', title: 'The House Pie', l1: 'THE DOUGH', l2: 'THE SAUCE', l3: 'THE CHEESE', l4: 'INTO THE OVEN', l5: 'THE FIRST SLICE' },
        service: { kick: 'PIZZA NIGHT', a1: 'PIZZA', a2: 'NIGHT,', b1: 'SORTED.', chip1: 'PIZZA', chip2: 'WINGS', chip3: 'DELIVERY', tag: 'PIZZA NIGHT, SORTED' },
        thisor: { kick: 'PIZZA EDITION', r1a: 'PEPPERONI', r1b: 'MARGHERITA', r2a: 'THIN CRUST', r2b: 'THICK CRUST', r3a: 'RANCH', r3b: 'NO RANCH', r4a: 'FOLD IT', r4b: 'FORK & KNIFE' },
        upgrade: { head1: 'WHAT ARE YOU', head2: 'ORDERING FIRST?', o1: 'A WHOLE PIE', o2: 'BY THE SLICE', o3: 'THE WINGS', o4: 'GARLIC KNOTS' },
        stories: { poll: 'PIZZA TONIGHT?', pollB: 'OBVIOUSLY', sticker: 'FRESH OUT OF THE OVEN.', stickerCap: 'TONIGHT AT {short}', qaQ: 'what should I order first?', qaA: 'Start with a pie. Add the wings.' },
        trailer: { card1: 'THIS FRIDAY', card2: 'ONE SLICE', card3: 'WILL BECOME', card4: 'YOUR FAVORITE.', over1: 'STRETCHED.', over2: 'BAKED.', over3: 'SLICED.', title: 'NOW SLICING', soon2: 'TO YOUR DOOR' },
      },
    }),
    burgers: food({
      label: 'Burgers', noun: 'BURGER', tagline: 'Smashed to order.',
      services: ['SMASH BURGERS', 'CHICKEN SANDWICHES', 'FRIES', 'SHAKES', 'COMBOS', 'CATERING'],
      billing: ['{brand}  PRESENTS  A SMASH BURGER PRODUCTION', 'PATTIES SMASHED TO ORDER', 'BUNS TOASTED ON THE FLAT TOP', 'WRAPPED HOT', 'SERVING {area}'],
      copy: {
        spot: { kick: 'OFF THE FLAT TOP', title: 'The Double', l1: 'THE SMASH', l2: 'THE SEAR', l3: 'THE CHEESE', l4: 'THE STACK', l5: 'THE FIRST BITE' },
        service: { kick: 'SMASH BURGERS', a1: 'SMASHED', a2: 'TO', b1: 'ORDER.', chip1: 'BURGERS', chip2: 'FRIES', chip3: 'SHAKES', tag: 'SMASHED TO ORDER' },
        thisor: { kick: 'BURGER EDITION', r1a: 'SINGLE', r1b: 'DOUBLE', r2a: 'PICKLES', r2b: 'NO PICKLES', r3a: 'FRIES', r3b: 'ONION RINGS', r4a: 'SHAKE', r4b: 'SODA' },
        upgrade: { head1: 'HOW ARE YOU', head2: 'ORDERING IT?', o1: 'SINGLE', o2: 'DOUBLE', o3: 'MAKE IT A COMBO', o4: 'ADD A SHAKE' },
        stories: { poll: 'BURGER TONIGHT?', pollB: 'MAKE IT A DOUBLE', sticker: 'HOT OFF THE FLAT TOP.', stickerCap: 'TODAY AT {short}', qaQ: 'single or double?', qaA: 'Double. Trust us.' },
        trailer: { card2: 'ONE BITE', card4: 'YOUR NEW ORDER.', over1: 'SMASHED.', over2: 'SEARED.', over3: 'STACKED.', title: 'NOW GRILLING' },
      },
    }),
    tacos: food({
      label: 'Tacos & taqueria', noun: 'TACO', tagline: 'Tacos, your way.',
      services: ['TACOS', 'BURRITOS', 'QUESADILLAS', 'BIRRIA', 'CATERING', 'TACO BAR'],
      billing: ['{brand}  PRESENTS  A TAQUERIA PRODUCTION', 'TORTILLAS ON THE COMAL', 'MEAT OFF THE GRILL', 'SALSAS MADE IN HOUSE', 'SERVING {area}'],
      copy: {
        spot: { kick: 'FROM THE COMAL', title: 'Taco Night', l1: 'THE TORTILLA', l2: 'THE MEAT', l3: 'THE SALSA', l4: 'CILANTRO & ONION', l5: 'A SQUEEZE OF LIME' },
        service: { kick: 'TACOS & MORE', a1: 'TACO', a2: 'TUESDAY', b1: 'EVERY DAY.', chip1: 'TACOS', chip2: 'BURRITOS', chip3: 'CATERING', tag: 'TACO TUESDAY, EVERY DAY' },
        thisor: { kick: 'TACO EDITION', r1a: 'AL PASTOR', r1b: 'ASADA', r2a: 'CORN', r2b: 'FLOUR', r3a: 'SALSA ROJA', r3b: 'SALSA VERDE', r4a: 'TACOS', r4b: 'BURRITO' },
        upgrade: { head1: 'WHICH TACO', head2: 'ARE YOU ORDERING FIRST?', o1: 'AL PASTOR', o2: 'ASADA', o3: 'BIRRIA', o4: 'ONE OF EACH' },
        stories: { poll: 'TACOS TONIGHT?', pollB: 'SIEMPRE', sticker: 'FRESH OFF THE COMAL.', stickerCap: 'TODAY AT {short}', qaQ: 'what should I order first?', qaA: 'Al pastor. Then birria.' },
        trailer: { card2: 'ONE TACO', card4: 'YOUR TUESDAY.', over1: 'GRILLED.', over2: 'FOLDED.', over3: 'GONE.', title: 'NOW SERVING' },
      },
    }),
    mexican: food({
      label: 'Mexican restaurant', noun: 'MESA', tagline: 'Pull up a chair.',
      services: ['ENCHILADAS', 'TACOS', 'BURRITOS', 'MOLE', 'MARGARITAS', 'CATERING'],
      billing: ['{brand}  PRESENTS  UNA PRODUCCIÓN DE LA CASA', 'SALSAS MADE IN HOUSE', 'COOKED TO ORDER', 'SERVED HOT', 'SERVING {area}'],
      copy: {
        spot: { kick: 'DE NUESTRA COCINA', title: 'La Casa Plate', l1: 'THE SALSA', l2: 'ON THE GRILL', l3: 'THE RICE & BEANS', l4: 'THE FINAL TOUCH', l5: 'BUEN PROVECHO' },
        service: { kick: 'COMIDA MEXICANA', a1: 'MADE', a2: 'FOR THE', b1: 'MESA.', chip1: 'DINE IN', chip2: 'TAKEOUT', chip3: 'CATERING', tag: 'MADE FOR THE MESA' },
        thisor: { kick: 'MESA EDITION', r1a: 'ENCHILADAS', r1b: 'FAJITAS', r2a: 'SPICY', r2b: 'MILD', r3a: 'HORCHATA', r3b: 'JAMAICA', r4a: 'FLAN', r4b: 'CHURROS' },
        stories: { poll: '¿HAMBRE?', pollB: 'SIEMPRE', sticker: 'FRESH FROM THE KITCHEN.', stickerCap: 'TODAY AT {short}', qaQ: 'what should I order first?', qaA: 'The house plate. Then dessert.' },
        trailer: { card2: 'ONE MEAL', card4: 'YOUR FAVORITE SPOT.', over1: 'SEASONED.', over2: 'COOKED.', over3: 'SERVED.' },
      },
    }),
    italian: food({
      label: 'Italian restaurant', noun: 'TABLE', tagline: 'Mangia.',
      services: ['PASTA', 'PIZZA', 'ANTIPASTI', 'DESSERTS', 'WINE', 'CATERING'],
      billing: ['{brand}  PRESENTS  UNA PRODUZIONE DELLA CASA', 'SAUCE ON THE STOVE ALL DAY', 'PASTA COOKED TO ORDER', 'SERVED AT THE TABLE', 'SERVING {area}'],
      copy: {
        spot: { kick: 'DALLA CUCINA', title: 'The Sunday Table', l1: 'THE SAUCE', l2: 'THE PASTA', l3: 'THE PARMIGIANO', l4: 'THE BASIL', l5: 'BUON APPETITO' },
        service: { kick: 'PASTA & MORE', a1: 'PASTA', a2: 'NIGHT,', b1: 'ANY NIGHT.', chip1: 'PASTA', chip2: 'PIZZA', chip3: 'CATERING', tag: 'PASTA NIGHT, ANY NIGHT' },
        thisor: { kick: 'ITALIAN EDITION', r1a: 'RED SAUCE', r1b: 'ALFREDO', r2a: 'SPAGHETTI', r2b: 'RIGATONI', r3a: 'RED WINE', r3b: 'WHITE WINE', r4a: 'TIRAMISU', r4b: 'CANNOLI' },
        stories: { poll: 'PASTA TONIGHT?', pollB: 'SÌ', sticker: 'FRESH FROM THE KITCHEN.', stickerCap: 'TONIGHT AT {short}', qaQ: 'what should I order first?', qaA: 'Start with the house pasta.' },
        trailer: { card2: 'ONE PLATE', card4: 'YOUR SUNDAY DINNER.', over1: 'SIMMERED.', over2: 'TOSSED.', over3: 'SERVED.' },
      },
    }),
    sandwiches: food({
      label: 'Sandwiches & deli', noun: 'SANDWICH', tagline: 'Stacked to order.',
      services: ['SUBS', 'HOT SANDWICHES', 'WRAPS', 'SALADS', 'SOUPS', 'PARTY PLATTERS'],
      billing: ['{brand}  PRESENTS  A DELI COUNTER PRODUCTION', 'BREAD BAKED FRESH', 'SLICED TO ORDER', 'STACKED BY HAND', 'SERVING {area}'],
      copy: {
        spot: { kick: 'FROM THE COUNTER', title: 'The House Sub', l1: 'THE BREAD', l2: 'SLICED TO ORDER', l3: 'THE CHEESE', l4: 'THE TOPPINGS', l5: 'WRAPPED UP' },
        service: { kick: 'SUBS & SANDWICHES', a1: 'LUNCH', a2: 'IS', b1: 'STACKED.', chip1: 'SUBS', chip2: 'WRAPS', chip3: 'PLATTERS', tag: 'LUNCH IS STACKED' },
        thisor: { kick: 'DELI EDITION', r1a: 'ITALIAN', r1b: 'TURKEY CLUB', r2a: 'TOASTED', r2b: 'COLD', r3a: 'MAYO', r3b: 'MUSTARD', r4a: 'CHIPS', r4b: 'SOUP' },
        stories: { poll: 'LUNCH TODAY?', pollB: 'MAKE IT A FOOTLONG', sticker: 'STACKED TO ORDER.', stickerCap: 'TODAY AT {short}', qaQ: 'what should I order first?', qaA: 'The house sub. Toasted.' },
        trailer: { card2: 'ONE SUB', card4: 'YOUR LUNCH BREAK.', over1: 'SLICED.', over2: 'STACKED.', over3: 'WRAPPED.' },
      },
    }),
  };
  const HOME = {
    hvac: {
      label: 'Heating & air (HVAC)', noun: 'HOME', cta: 'BOOK A SERVICE CALL', tagline: 'Comfort, all year.', badge: 'LICENSED & INSURED',
      services: ['AC REPAIR', 'HEATING', 'TUNE-UPS', 'NEW SYSTEMS', 'DUCTWORK', 'THERMOSTATS'],
      billing: ['{brand}  PRESENTS  A COMFORT PRODUCTION', 'DIAGNOSED ON SITE', 'FIXED BY OUR TECHS', 'TESTED BEFORE WE LEAVE', 'SERVING {area}'],
      copy: merge(GEN.copy, {
        spot: { kick: 'ON THE JOB', title: 'The Tune-Up', l1: 'THE CHECK-IN', l2: 'COILS CLEANED', l3: 'FILTER SWAPPED', l4: 'SYSTEM TESTED', l5: 'COOL AIR' },
        service: { kick: 'AC & HEATING', a1: 'STAY', a2: 'COOL', b1: 'ALL SUMMER.', chip1: 'AC REPAIR', chip2: 'TUNE-UPS', chip3: 'NEW SYSTEMS', tag: 'STAY COOL ALL SUMMER' },
        thisor: { kick: 'COMFORT EDITION', r1a: '68°', r1b: '74°', r2a: 'CEILING FAN', r2b: 'AC ON BLAST', r3a: 'BLANKET', r3b: 'NO BLANKET', r4a: 'SMART THERMOSTAT', r4b: 'OLD DIAL' },
        upgrade: { head1: 'WHAT NEEDS', head2: 'A LOOK FIRST?', o1: 'THE AC', o2: 'THE FURNACE', o3: 'THE DUCTS', o4: 'THE THERMOSTAT' },
        stories: { poll: 'AC STRUGGLING?', pollB: 'EVERY AFTERNOON', sticker: 'COOL AIR, BACK ON.', stickerCap: 'ON THE JOB THIS WEEK', qaQ: 'how often should I get a tune-up?', qaA: 'Ask us. We’ll check your system.' },
        signs: { intro2: 'COOL HOME.', s1sign: 'Your AC runs all day and the house is still warm.', s1fix: 'A system that keeps up.', s1hl: 'KEEPS', s2sign: 'One room is a sauna, one is a fridge.', s2fix: 'Even air in every room.', s2hl: 'EVEN',
          s3sign: 'Your thermostat is mostly decoration.', s3fix: 'Controls that work.', s3hl: 'WORK.', s4sign: 'The furnace makes a new noise every winter.', s4fix: 'A quiet system.', s4hl: 'QUIET',
          s5sign: 'You’ve said “we’ll call someone” since June.', s5fix: 'This is the call.', s5hl: 'CALL.', outro2: 'LET’S FIX YOURS.' },
        chat: { chatTitle: 'movie night', name1: 'Nina', name2: 'Theo', m1: 'whose place for movie night', m2: 'not mine. my AC died', m3: 'mine.', m4: 'since when is your place cold', m6: 'it’s freezing in here', m7: 'who fixed it', m8: 'yep. {brand} came by', m9: 'calling them now. bye', outro1: 'BE THE COOL HOUSE' },
        trailer: { card1: 'THIS SUMMER', card2: 'ONE TUNE-UP', card3: 'WILL CHANGE', card4: 'HOW YOUR HOME FEELS.', over1: 'CHECKED.', over2: 'FIXED.', over3: 'COOL.', soon2: 'TO YOUR HOME' },
      }),
    },
    carpet: {
      base: 'cleaning', label: 'Carpet cleaning', noun: 'CARPET', cta: 'BOOK YOUR CLEANING', tagline: 'Carpets, refreshed.', badge: 'BONDED & INSURED',
      services: ['CARPET CLEANING', 'STAIN REMOVAL', 'UPHOLSTERY', 'AREA RUGS', 'TILE & GROUT', 'PET ODOR'],
      billing: ['{brand}  PRESENTS  A FRESH CARPET PRODUCTION', 'PRE-TREATED ROOM BY ROOM', 'DEEP CLEANED BY OUR TECHS', 'WALK-THROUGH BEFORE WE LEAVE', 'SERVING {area}'],
      copy: merge(CL.copy, {
        spot: { title: 'The Carpet Refresh', l1: 'THE PRE-TREAT', l2: 'THE DEEP CLEAN', l3: 'THE STAIN WORK', l4: 'GROOMED', l5: 'FRESH CARPET' },
        service: { kick: 'CARPET CLEANING', a1: 'FRESH', a2: 'CARPET,', b1: 'FRESH START.', chip1: 'CARPETS', chip2: 'STAINS', chip3: 'UPHOLSTERY', tag: 'FRESH CARPET, FRESH START' },
        thisor: { kick: 'CARPET EDITION', r1a: 'SHOES OFF', r1b: 'SHOES ON', r2a: 'PLUSH', r2b: 'BERBER', r3a: 'AREA RUG', r3b: 'WALL TO WALL', r4a: 'PET ON THE COUCH', r4b: 'PET ON THE FLOOR' },
        upgrade: { head1: 'WHICH ROOM', head2: 'NEEDS IT FIRST?', o1: 'LIVING ROOM', o2: 'STAIRS', o3: 'BEDROOMS', o4: 'THE BIG RUG' },
        stories: { poll: 'NEED THIS?', pollB: 'YESTERDAY', sticker: 'THAT STAIN? GONE.', stickerCap: 'ON THE JOB THIS WEEK', qaQ: 'how long until I can walk on it?', qaA: 'Ask us. We’ll walk you through drying.' },
        trailer: { card2: 'ONE CLEANING', card4: 'HOW YOUR HOME FEELS.', over1: 'TREATED.', over2: 'CLEANED.', over3: 'FRESH.' },
      }),
    },
    commercial: {
      base: 'cleaning', label: 'Commercial cleaning', noun: 'OFFICE', cta: 'GET A QUOTE', tagline: 'Clean when you walk in.', badge: 'BONDED & INSURED',
      services: ['OFFICE CLEANING', 'JANITORIAL', 'FLOOR CARE', 'WINDOWS', 'POST-CONSTRUCTION', 'DISINFECTION'],
      billing: ['{brand}  PRESENTS  AN AFTER-HOURS PRODUCTION', 'A CHECKLIST FOR EVERY FLOOR', 'CLEANED BY OUR TEAM', 'CHECKED BEFORE MORNING', 'SERVING {area}'],
      copy: merge(CL.copy, {
        spot: { kick: 'AFTER HOURS', title: 'The Night Shift', l1: 'LIGHTS ON', l2: 'DESKS WIPED', l3: 'FLOORS DONE', l4: 'GLASS POLISHED', l5: 'READY FOR MONDAY' },
        service: { kick: 'COMMERCIAL CLEANING', a1: 'CLEAN', a2: 'WHEN YOU', b1: 'WALK IN.', chip1: 'OFFICES', chip2: 'FLOOR CARE', chip3: 'JANITORIAL', tag: 'CLEAN WHEN YOU WALK IN' },
        thisor: { kick: 'OFFICE EDITION', r1a: 'OPEN OFFICE', r1b: 'PRIVATE OFFICES', r2a: 'CARPET', r2b: 'POLISHED CONCRETE', r3a: 'NIGHTLY', r3b: 'WEEKLY', r4a: 'BREAK ROOM', r4b: 'LOBBY' },
        upgrade: { head1: 'WHERE SHOULD', head2: 'WE START?', o1: 'THE LOBBY', o2: 'THE BREAK ROOM', o3: 'THE RESTROOMS', o4: 'THE FLOORS' },
        stories: { poll: 'WOULD YOUR TEAM NOTICE?', pollB: 'ON DAY ONE', sticker: 'READY FOR MONDAY.', stickerCap: 'AFTER HOURS THIS WEEK', qaQ: 'do you clean after we close?', qaA: 'We work around your hours.' },
        chat: { chatTitle: 'monday', name1: 'Dana', name2: 'Luis', m1: 'who cleaned the office??', m2: 'not me. i just got here', m3: 'look at the break room.', m4: 'since when does it look like this', m6: 'the FLOORS', m7: 'who did that', m8: '{brand}. after hours', m9: 'telling facilities to keep them', outro1: 'BE THE OFFICE' },
        trailer: { card1: 'THIS MONDAY', card2: 'ONE NIGHT', card3: 'WILL CHANGE', card4: 'HOW YOUR TEAM WALKS IN.', over1: 'WIPED.', over2: 'POLISHED.', over3: 'READY.', soon2: 'TO YOUR OFFICE' },
      }),
    },
  };
  // V16: printing & screen printing (print shops, sign shops, custom apparel)
  const PRINT = {
    label: 'Printing & screen printing', noun: 'ORDER', cta: 'GET A QUOTE', tagline: 'Your brand, printed.', badge: 'CUSTOM PRINTING',
    services: ['SCREEN PRINTING', 'CUSTOM APPAREL', 'BUSINESS CARDS', 'FLYERS', 'BANNERS', 'STICKERS', 'SIGNS', 'EMBROIDERY'],
    billing: ['{brand}  PRESENTS  A PRINT SHOP PRODUCTION', 'ART PREPPED IN HOUSE', 'PRINTED ON OUR PRESSES', 'PACKED AND READY', 'SERVING {area}'],
    copy: merge(GEN.copy, {
      spot: { kick: 'ON THE PRESS', title: 'The Print Run', l1: 'THE ARTWORK', l2: 'THE SCREEN', l3: 'THE INK', l4: 'THE PULL', l5: 'THE FINISHED PIECE' },
      service: { kick: 'CUSTOM PRINTING', a1: 'YOUR', a2: 'LOGO', b1: 'ON ANYTHING.', chip1: 'SHIRTS', chip2: 'CARDS', chip3: 'BANNERS', tag: 'YOUR LOGO ON ANYTHING' },
      thisor: { kick: 'PRINT EDITION', r1a: 'MATTE', r1b: 'GLOSS', r2a: 'BLACK TEE', r2b: 'WHITE TEE', r3a: 'HOODIE', r3b: 'CREWNECK', r4a: 'STICKERS', r4b: 'MAGNETS' },
      upgrade: { head1: 'WHAT ARE YOU', head2: 'PRINTING FIRST?', o1: 'SHIRTS', o2: 'BUSINESS CARDS', o3: 'BANNERS', o4: 'STICKERS' },
      stories: { poll: 'NEED MERCH?', pollB: 'FOR THE WHOLE TEAM', sticker: 'FRESH OFF THE PRESS.', stickerCap: 'ON THE PRESS THIS WEEK', qaQ: 'what do you need to start an order?', qaA: 'Your logo and a quantity. We’ll do the rest.' },
      trailer: { card1: 'THIS WEEK', card2: 'ONE LOGO', card3: 'BECOMES', card4: 'SHIRTS, CARDS AND SIGNS.', over1: 'DESIGNED.', over2: 'PRINTED.', over3: 'DELIVERED.', soon2: 'TO YOUR TEAM' },
    }),
  };
  // in place, each category right after its parent (the brand form lists industries in this order)
  const after = { restaurant: FOODS, cleaning: { carpet: HOME.carpet, commercial: HOME.commercial }, roofing: { hvac: HOME.hvac } };
  const order = []; for (const k of Object.keys(I)) { if (k === 'general' && !I.printing) order.push(['printing', PRINT]); order.push([k, I[k]]); if (after[k]) for (const [k2, v] of Object.entries(after[k])) if (!I[k2]) order.push([k2, v]); }
  for (const k of Object.keys(I)) delete I[k]; for (const [k, v] of order) I[k] = v;

  // sectors: the categories show the restaurant and home-services galleries first
  const sec = id => NX.SECTORS.find(s => s.id === id);
  sec('food').ind.push(...Object.keys(FOODS).filter(k => !sec('food').ind.includes(k)));
  sec('home').ind.push(...['hvac', 'carpet', 'commercial'].filter(k => !sec('home').ind.includes(k)));
  if (sec('retail') && !sec('retail').ind.includes('printing')) sec('retail').ind.push('printing');

  // the engine sees a category as its parent (older templates keep their industry copy); BRAND.cat keeps the category
  const applyBase = NX.applyBrand;
  NX.applyBrand = async b => { await applyBase(b); const ind = NX.INDUSTRIES[b.industry]; BRAND.cat = b.industry || 'general'; if (ind && ind.base) BRAND.industry = ind.base; };
  // starting colours for new brands in these industries (a logo's own colour replaces the accent)
  const PAL = { printing: ['#FF4F00', '#0D0D0F', '#F5F5F2'], pizza: ['#E4572E', '#14100E', '#FBF3E8'], burgers: ['#FFC400', '#0B0A09', '#F6EEE2'], tacos: ['#F2A541', '#12100D', '#FBF2E4'], mexican: ['#D7263D', '#12100F', '#FBF2E6'],
    italian: ['#2E8B57', '#101211', '#F7F2E8'], sandwiches: ['#E9A23B', '#141210', '#F8F1E4'], hvac: ['#2F80ED', '#0A1220', '#EEF3FA'], carpet: ['#14B8A6', '#0A1614', '#EEF6F4'], commercial: ['#3B82F6', '#0B1220', '#F3F5F8'] };
  const newBase = NX.newBrand;
  NX.newBrand = (name, industry) => { const b = newBase(name, industry), p = PAL[industry]; if (p) b.colors = { accent: p[0], ink: p[1], paper: p[2] }; return b; };

  // ------------------------------------------------------------ the nx3 families in the gallery
  // [template id, family id, sector, name, objectives, poster time, vibe, blurb]. A family that suits several sectors is listed
  // in each (one engine variant, its own template id per sector).
  const BAX = ['Nine reveals · one switch', 'Your before and after shots revealed nine ways: a wipe, a slider, a top-down wipe, stacked, side by side, a card flip, a circle, cleaning passes or a camera flash. One field switches the style; captions land on top.'];
  const SPOT = ['Your photo · callouts · badge', 'Your own photo with motion around it: callouts point at what’s in it and a price or offer badge spins in. Or switch to a camera tour that zooms to each point in turn.'];
  const CHALK = ['Chalk · write-on · your board', 'A chalkboard writes itself on, line by line with chalk dust, and circles a price. Slate, black, sidewalk A-frame, wood or a photo of your own board, in nine lettering styles.'];
  const E = [
    ['herox', 'herox', 'food', 'Food Spotlight', ['show', 'menu', 'promo'], 3.6, 'Your photo · ingredients · price', 'Your own food photo with motion around it: callouts point at what’s in it and a price burst spins in. Or switch to a camera tour that zooms to each ingredient in turn.'],
    ['specialx', 'specialx', 'food', 'Special of the Day', ['promo', 'menu'], 3.9, 'Tear-off calendar · price slam', 'A tear-off calendar flips to the day you pick, the dish slides in with a sticker, the regular price is crossed out and the special price slams in, with a ticking “until” line.'],
    ['combox', 'combox', 'food', 'Meal Combo', ['promo', 'menu'], 3.4, 'Plus signs · menu icons · price slam', 'Up to three items fly in with plus signs and menu icons, their prices get crossed out and the combo price slams in with a savings sticker.'],
    ['chalkx', 'chalkx', 'food', 'Chalkboard Menu', ['menu', 'promo'], 4.6, CHALK[0], CHALK[1]],
    ['bax', 'bax', 'home', 'Before & After', ['show', 'brand'], 4.2, BAX[0], BAX[1]],
    ['thermox', 'thermox', 'home', 'The Thermostat', ['promo', 'show', 'lead'], 3.7, 'Dial · frost or warm glow', 'A thermostat dial cools from hot to comfortable while frost creeps in from the corners, or heats up with a warm glow. Your temperatures, your headline.'],
    ['herox_h', 'herox', 'home', 'Photo Spotlight', ['show', 'promo'], 3.6, SPOT[0], SPOT[1]],
    ['bax_b', 'bax', 'beauty', 'Before & After', ['show', 'brand'], 4.2, BAX[0], BAX[1]],
    ['herox_b', 'herox', 'beauty', 'Photo Spotlight', ['show', 'promo'], 3.6, SPOT[0], SPOT[1]],
    ['chalkx_b', 'chalkx', 'beauty', 'Chalkboard Price List', ['menu', 'promo'], 4.6, CHALK[0], CHALK[1]],
    ['bax_a', 'bax', 'auto', 'Before & After', ['show', 'brand'], 4.2, BAX[0], BAX[1]],
    ['herox_a', 'herox', 'auto', 'Photo Spotlight', ['show', 'promo'], 3.6, SPOT[0], SPOT[1]],
    ['herox_r', 'herox', 'retail', 'Product Spotlight', ['show', 'launch', 'promo'], 3.6, SPOT[0], SPOT[1]],
    // V14 (engine/tpl_nx4.js)
    ['pizzax', 'pizzax', 'food', 'Pizza Builder', ['show', 'menu', 'promo'], 4.9, 'Drawn pie · your toppings · slice pull', 'A pizza builds itself: dough, sauce, cheese and three toppings you pick, then the cutter rolls, a slice pulls away with the cheese and the name and price land.', 'nx4'],
    ['heatx', 'heatx', 'food', 'Heat Meter', ['show', 'promo'], 3.4, 'Gauge · needle · heat waves', 'A heat gauge for your salsa, wings or spicy special: the needle sweeps to the level you pick, heat waves and embers rise and the chiles fill in.', 'nx4'],
    ['papelx', 'papelx', 'food', 'Fiesta Banner', ['event', 'promo'], 2.8, 'Papel picado · confetti · your photo', 'Two strings of papel picado drop in and swing, your photo lands like a print, confetti falls and the headline, line and day come in.', 'nx4'],
    ['recipex', 'recipex', 'food', 'Recipe Card', ['show', 'brand', 'menu'], 4.9, 'Handwritten · taped photo · house stamp', 'A recipe card writes itself out by hand, ingredient by ingredient, with your dish photo taped on top and a house-recipe stamp.', 'nx4'],
    ['stainx', 'stainx', 'home', 'Stain Removal', ['show', 'promo'], 4.6, 'Spray · foam · one pass', 'A stain on the carpet gets sprayed, foamed, then a cleaning wand passes and takes it away, leaving groomed carpet behind. Pick the stain and the carpet colour.', 'nx4'],
    ['nightx', 'nightx', 'home', 'The Night Shift', ['brand', 'show'], 3.0, 'Night building · clock · sunrise', 'An office building at night is cleaned floor by floor while the clock runs, then the sun comes up and it’s ready by morning. Your name on the roof.', 'nx4'],
    ['checkx', 'checkx', 'home', 'The Checklist', ['brand', 'show'], 4.8, 'Clipboard · pen ticks · stamp', 'A clipboard checklist ticks itself off in pen, item by item, then gets stamped. Up to seven items in your words.', 'nx4'],
    ['plansx', 'plansx', 'home', 'Service Plans', ['promo', 'lead'], 3.7, 'Plan cards · features · our pick', 'Two or three plans slide in with prices and features, then one gets picked with a badge. Prices are sample text to replace.', 'nx4'],
    ['vanx', 'vanx', 'home', 'On the Way', ['brand', 'lead'], 2.7, 'Your van · brakes · arrival time', 'Your service van drives in with your logo and phone on the side, brakes, and an “on the way” badge and arrival time pop up.', 'nx4'],
    ['checkx_a', 'checkx', 'auto', 'The Checklist', ['brand', 'show'], 4.8, 'Clipboard · pen ticks · stamp', 'A clipboard checklist ticks itself off in pen, item by item, then gets stamped. Up to seven items in your words.', 'nx4'],
    ['plansx_a', 'plansx', 'auto', 'Detail Packages', ['promo', 'lead'], 3.7, 'Package cards · features · our pick', 'Two or three packages slide in with prices and features, then one gets picked with a badge. Prices are sample text to replace.', 'nx4'],
    ['vanx_a', 'vanx', 'auto', 'On the Way', ['brand', 'lead'], 2.7, 'Your van · brakes · arrival time', 'Your mobile detailing van drives in with your logo and phone on the side, brakes, and an “on the way” badge and arrival time pop up.', 'nx4'],
    ['plansx_b', 'plansx', 'beauty', 'Memberships', ['promo', 'lead'], 3.7, 'Membership cards · features · our pick', 'Two or three memberships slide in with prices and perks, then one gets picked with a badge. Prices are sample text to replace.', 'nx4'],
    ['plansx_p', 'plansx', 'pro', 'Packages', ['promo', 'lead'], 3.7, 'Package cards · features · our pick', 'Two or three packages slide in with prices and features, then one gets picked with a badge. Prices are sample text to replace.', 'nx4'],
    ['papelx_e', 'papelx', 'hosp', 'Fiesta Banner', ['event', 'promo'], 2.8, 'Papel picado · confetti · your photo', 'Two strings of papel picado drop in and swing, your photo lands like a print, confetti falls and the headline, line and day come in.', 'nx4'],
    // V15 (engine/tpl_nx5.js)
    ['relistx', 'relistx', 'estate', 'Listing Card', ['listing', 'show'], 3.4, 'Hero photo · ribbon · price count', 'The listing’s hero photo with a status ribbon, the price counting up, the address and the beds, baths and square feet with icons. Everything comes from the listing.', 'nx5'],
    ['resignx', 'resignx', 'estate', 'Yard Sign', ['listing', 'sold'], 3.3, 'Sign post · swinging panel · rider flip', 'A yard sign rises on the lawn in front of the house, the panel swings with your logo and phone, and the rider flips to your status: just listed, open house, under contract, sold.', 'nx5'],
    ['blueprintx', 'blueprintx', 'estate', 'The Blueprint', ['listing', 'show'], 3.4, 'Floor plan · scan · dimensions', 'Your floor plan image revealed on a blueprint grid by a scanning line, with dimension lines and the beds, baths and square feet from the listing.', 'nx5'],
    ['redoorx', 'redoorx', 'estate', 'Front Door', ['listing', 'show'], 3.4, 'Door opens · walk in · welcome home', 'A front door with the house number swings open and the camera walks in to the listing’s photo, then “Welcome home”, the address and the price.', 'nx5'],
    ['bbpolex', 'bbpolex', 'beauty', 'Barber Pole', ['brand', 'show'], 3.2, 'Spinning pole · stripe wipe', 'A barber pole spins, then its stripes sweep across the screen and reveal your photo, with your headline and services.', 'nx5'],
    ['bbchairx', 'bbchairx', 'beauty', 'Chairs Open', ['promo', 'lead'], 3.2, 'Barber chairs · open or booked', 'Two to four barber chairs slide in under their mirrors, each with the barber’s name: open with the next time, or booked.', 'nx5'],
    ['neonx', 'neonx', 'beauty', 'Neon Sign', ['menu', 'brand'], 3.6, 'Neon on brick · flicker · OPEN', 'A neon sign on a brick wall flickers on, then each menu line and price, and an OPEN sign starts blinking. Pick the lettering and the colours.', 'nx5'],
    ['neonx_f', 'neonx', 'food', 'Neon Menu', ['menu', 'brand'], 3.6, 'Neon on brick · flicker · OPEN', 'A neon sign on a brick wall flickers on, then each menu line and price, and an OPEN sign starts blinking. Pick the lettering and the colours.', 'nx5'],
    ['neonx_h', 'neonx', 'hosp', 'Neon Sign', ['event', 'brand'], 3.6, 'Neon on brick · flicker · OPEN', 'A neon sign on a brick wall flickers on, then each line, and an OPEN sign starts blinking. Pick the lettering and the colours.', 'nx5'],
    ['beadx', 'beadx', 'auto', 'Ceramic Beading', ['show', 'promo'], 2.0, 'Rain · beads · roll-off', 'Rain lands on coated paint and beads up, then the panel tilts and the water rolls right off. Pick the paint colour.', 'nx5'],
    // V16 (engine/tpl_nx6.js)
    ['pressx', 'pressx', 'retail', 'Screen Print Pull', ['show', 'brand'], 3.6, 'Screen · squeegee · your logo', 'The screen lowers onto a shirt, ink goes on, the squeegee pulls and your logo or design prints, then a flash cure. Pick the shirt and ink colours.', 'nx6'],
    ['mockx', 'mockx', 'retail', 'Merch Mockups', ['show', 'launch'], 5.2, 'Tee · hoodie · cap · mug…', 'Your logo or design on two to four products (tee, hoodie, cap, tote, mug, business cards, stickers, banner), one at a time, then all together.', 'nx6'],
    ['cardsx', 'cardsx', 'retail', 'Business Cards', ['promo', 'show'], 3.6, 'Stack · flip · fan · foil', 'A stack of business cards drops, the top card flips to show the back with the contact details, the cards fan out. Matte, gloss or gold foil.', 'nx6'],
    ['flyerx', 'flyerx', 'retail', 'Print Run', ['promo', 'show'], 3.8, 'Press · flying sheets · count', 'Sheets fly out of the press onto a stack while the count runs up, then the top flyer comes forward. Use your flyer or one in your brand colours.', 'nx6'],
    ['mockx_p', 'mockx', 'pro', 'Merch Mockups', ['show', 'brand'], 5.2, 'Tee · hoodie · cap · mug…', 'Your logo on two to four products, one at a time, then all together.', 'nx6'],
    ['cardsx_p', 'cardsx', 'pro', 'Business Cards', ['brand', 'show'], 3.6, 'Stack · flip · fan · foil', 'A stack of business cards drops, the top card flips to show the back with the contact details, the cards fan out.', 'nx6'],
    ['glossx', 'glossx', 'auto', 'Gloss Meter', ['show', 'promo'], 3.4, 'Polisher · swirls out · reading', 'A polisher takes the swirl marks out of the paint while the gloss meter climbs from the before to the after reading.', 'nx6'],
    ['filterx', 'filterx', 'home', 'Air Filter', ['promo', 'lead'], 3.4, 'Dirty out · clean in · airflow', 'The dirty filter slides out, a clean one slides in and the airflow picks up, with an airflow bar.', 'nx6'],
    ['deliverx', 'deliverx', 'food', 'Delivery Tracker', ['promo', 'lead'], 3.8, 'Map · rider · order steps', 'A map with the route from your place to the door, the rider moving along it and the order steps ticking off.', 'nx6'],
  ];
  for (const [tid, cf, sector, name, obj, pt, vibe, blurb, file0] of E) {
    const file = file0 || 'nx3', sc = sec(sector); if (!(window.STUDIO_REG && STUDIO_REG[file]) || !sc || NX.FAM_TPLS.some(t => t.id === tid)) continue;
    NX.FAMILIES.push({ id: cf, tid, sector, name, obj, vibe, blurb });
    NX.FAM_TPLS.push({ id: tid, name, file, v: cf, fam: sc.fam, cf, sector, obj, vibe, blurb, posterT: pt, live: true, isNew: true, ind: sc.ind });
  }
})();
