'use strict';
/* NexGen Studio: the industry registry (Oct 29). Three separate dimensions:
   sector (industry)  ->  creative family (a visual system: look, type, motion, sound)  ->  objective (what the clip is for).
   A family's look and music live in the engine (K7.FAM) so a plain engine render and the studio agree; this file adds names,
   descriptions, the sectors, the objectives and the template entries the studio lists. To add a family: write its
   composition in an engine module (one variant), add its look to K7.FAM, and add one entry below. */
window.NX = window.NX || {};
(() => {
  NX.SECTORS = [
    { id: 'food', name: 'Restaurants & food', short: 'Restaurants', ind: ['restaurant'], fam: 'Restaurant', blurb: 'Grills, fine dining, quick service, specials, single items and the bar.' },
    { id: 'estate', name: 'Real estate', short: 'Real estate', ind: ['realestate'], fam: 'Real estate', blurb: 'One listing, a whole campaign: every template reads the same property details and photos.' },
    { id: 'home', name: 'Home services', short: 'Home services', ind: ['hardscape', 'fencing', 'landscaping', 'roofing', 'cleaning', 'pressure'], fam: 'Home services', blurb: 'Builders, trades and outdoor living.' },
    { id: 'beauty', name: 'Beauty & grooming', short: 'Beauty', ind: ['barbershop', 'salon'], fam: 'Beauty', blurb: 'Salons, barbershops and studios.' },
    { id: 'auto', name: 'Automotive', short: 'Automotive', ind: ['detailing'], fam: 'Automotive', blurb: 'Detailing, dealers and shops.' },
    { id: 'hosp', name: 'Hospitality & events', short: 'Events', ind: ['events'], fam: 'Events', blurb: 'Venues, parties, launches and festivals.' },
    { id: 'retail', name: 'Retail & products', short: 'Retail', ind: ['retail'], fam: 'Retail', blurb: 'Drops, new arrivals and sales.' },
    { id: 'pro', name: 'Professional services', short: 'Professional', ind: ['pro'], fam: 'Professional', blurb: 'Advisors, agencies, clinics and consultants.' },
  ];
  NX.OBJECTIVES = {
    show: 'Show it off', promo: 'Promote an offer', menu: 'Menu & specials', event: 'Event / open house', listing: 'New listing', update: 'Price update',
    sold: 'Sold / results', local: 'Neighbourhood', lead: 'Get leads', brand: 'Brand & trust', launch: 'Launch',
  };
  // [template id, family id, sector, name, objectives, poster time, vibe, blurb, engine file (default: the sector's)]
  const E = [
    // ---------------- restaurants
    ['fire', 'fire', 'food', 'Fire & Flame', ['show', 'promo'], 3.6, 'Hot · heavy · hard cuts', 'Grills, barbecue, anything that sizzles. Words slam in white-hot and cool, grill bars sear across the cuts, a few embers rise, the logo is branded on.'],
    ['chef', 'chef', 'food', 'The Chef’s Table', ['menu', 'show', 'brand'], 5.6, 'Ivory · serif · slow', 'Fine dining on an ivory page: a hand-drawn hairline frame, three courses in Roman numerals, slow curtain reveals and jazz piano.'],
    ['rush', 'rush', 'food', 'The Lunch Rush', ['promo', 'menu'], 5.8, 'Loud · geometric · fast', 'Quick service: a clock-hand title, combo maths with sticker frames, a giant price burst and stripe wipes on the beat.'],
    ['ticket', 'today', 'food', 'Today’s Special', ['promo', 'menu'], 4.6, 'Kitchen ticket · lo-fi', 'A kitchen ticket prints the special, gets stamped and hangs on the rail while your footage plays behind it.'],
    ['icons', 'icon', 'food', 'Menu Icons', ['show', 'menu'], 4.8, 'Swiss grid · precise', 'One item presented like a design object: a six-column grid, the name set vertically, slat reveals, a numbered parts list and a spec sheet.'],
    ['afterhours', 'after', 'food', 'After Hours', ['menu', 'event', 'promo'], 3.4, 'Neon · reflections · on the beat', 'Cocktails and nightlife: a neon sign buzzes on, footage on a wet bar top with its reflection, drink names cut on the beat.'],
    // restaurants, part 2 (V10): file food2
    ['burger', 'burger', 'food', 'The Burger Drop', ['launch', 'promo'], 2.4, 'Launch hype · countdown · stacked', 'A new item drops: a 3-2-1 countdown, a flash and a shake, the name lands as a stacked poster with rays, then the ingredients build up layer by layer.', 'food2'],
    ['sushi', 'sushi', 'food', 'The Art of Sushi', ['show', 'menu', 'brand'], 4.6, 'Ink brush · ivory · still', 'Culinary editorial: an ink ensō brushed in one stroke, each piece revealed by a rising curtain in a tall frame, italic names and a red seal.', 'food2'],
    ['cheese', 'cheese', 'food', 'The Cheese Pull', ['show', 'promo'], 5.4, 'The hook · gooey · elastic', 'Built to stop the scroll: “wait for it” types over one long shot while a stretch-o-meter fills, then THE PULL springs in with cheese drips.', 'food2'],
    ['pour', 'pour', 'food', 'The Pour', ['show', 'menu'], 2.2, 'Arch glass · liquid · soulful', 'A drink showcase: footage in an arch-shaped glass, a pour level rising, the name surfacing like liquid, ingredients dropping in and a toast.', 'food2'],
    ['menuedit', 'menuedit', 'food', 'The Menu Edit', ['menu'], 3.6, 'Printed card · marker · page turn', 'Menu storytelling: a printed card, each item underlined in marker with a round footage inset, optional prices on dotted leaders, a page turn to the back.', 'food2'],
    ['street', 'street', 'food', 'Street Food Stories', ['show', 'local', 'promo'], 4.4, 'Wheatpaste · spray paint · raw', 'Urban food culture: footage slapped up as wheatpaste posters with tape and halftone, a spray-painted tag that drips and a ticker with where to find you.', 'food2'],
    ['latenight', 'late', 'food', 'Late Night Bites', ['menu', 'promo', 'event'], 4.0, 'Synthwave · CRT · glitch', 'After dark: a neon sign over a scrolling grid and a striped sun, footage on a rounded CRT with a REC dot, items cutting in with RGB glitches.', 'food2'],
    ['fresh', 'fresh', 'food', 'Fresh & Local', ['brand', 'show'], 4.4, 'Kraft paper · botanical · handwritten', 'Farm to table: kraft paper, sprigs drawn on with a pen, footage in stitched frames that drop in, handwritten notes with arrows and a rotating stamp.', 'food2'],
    ['catering', 'cater', 'food', 'Catering & Events', ['event', 'lead'], 5.0, 'Black & gold · art deco · script', 'An invitation in black and gold: an art-deco frame draws itself, a script title, two panels side by side, package tiers and a booking line.', 'food2'],
    ['brunch', 'brunch', 'food', 'Morning Ritual', ['menu', 'show'], 4.4, 'Sunrise · soft · steam', 'Cafe and brunch: a sunrise warms the page, rounded frames with steam rising, menu items pop in as tags and a little clock ticks.', 'food2'],
    // ---------------- real estate
    ['sig', 'sig', 'estate', 'The Signature Listing', ['listing', 'show'], 3.4, 'Magazine · architectural', 'A magazine cover for a premium listing: masthead, architectural framing, refined facts, page-turn spreads and a modern classical score.'],
    ['jlisted', 'listed', 'estate', 'Just Listed', ['listing'], 3.2, 'Bold · instant · clear', 'Instant recognition: JUST LISTED slams in, the price rolls up big, address and beds, baths and square feet read at a glance.'],
    ['openhouse', 'open', 'estate', 'Open House', ['event', 'listing'], 4.4, 'Invitation · warm', 'An invitation: doors open on the hero photo, a calendar tile with the date and time, the address, a photo strip and an RSVP line.'],
    ['pricedrop', 'drop', 'estate', 'The Price Drop', ['update'], 3.6, 'Typographic · split screen', 'The old price is struck through and falls away, the new price lands, the photo holds the other half of the screen.'],
    ['sold', 'sold', 'estate', 'Sold Stories', ['sold', 'lead'], 3.4, 'Yard sign · gold', 'A yard sign swings in and the SOLD rider snaps on, a gold shine, then the agent and a “thinking of selling?” call to action.'],
    ['hood', 'hood', 'estate', 'The Neighborhood Edit', ['local', 'brand'], 4.6, 'Editorial guide · drawn map', 'Local lifestyle as an editorial guide: a drawn street grid, pins only for the places you name, your lifestyle footage.'],
    ['tour', 'tour', 'estate', 'Room by Room', ['show', 'listing'], 4.2, 'Walk-through · calm', 'A walk-through: each room slides in like stepping through a doorway, with its label, a line about it and a progress rail.'],
    ['agent', 'agent', 'estate', 'Meet Your Agent', ['lead', 'brand'], 3.6, 'Portrait · personal brand', 'Agent-branded lead generation: the portrait, the name, what you do, a contact block and a “thinking of moving?” call to action.'],
    // real estate, part 2 (V10): file estate2
    ['aerial', 'aerial', 'estate', 'Aerial Tour', ['show', 'listing'], 2.6, 'Drone HUD · technical · calm', 'A drone’s-eye view: corner brackets and a drifting compass, a pin dropping on the property with the address typed into a tag, then fact chips and feature callouts.', 'estate2'],
    ['residence', 'resid', 'estate', 'The Residence', ['listing', 'show', 'brand'], 2.8, 'Quiet luxury · chapters · gold', 'Quiet luxury: a gold hairline, the title in spaced capitals, then chapters in Roman numerals, each room in a tall gallery frame with an italic name.', 'estate2'],
    ['journal', 'journal', 'estate', 'Home Journal', ['show', 'brand'], 6.0, 'Scrapbook · polaroids · handwritten', 'A personal scrapbook: polaroids tossed onto a desk and taped down, captions written from your features, a typed address label and a ticked checklist of facts.', 'estate2'],
    ['development', 'devel', 'estate', 'New Development', ['launch', 'lead'], 2.6, 'Blueprint · isometric · status', 'A blueprint grid and an isometric building that draws itself, the development’s name, a status you choose, renderings in technical frames and amenity tiles.', 'estate2'],
    ['comingsoon', 'soon', 'estate', 'Coming Soon', ['launch', 'listing'], 5.6, 'Teaser · blur · spotlight', 'A teaser: the photo stays blurred while a spotlight drifts across it, COMING SOON in stencil capitals, only the area named unless you choose the address.', 'estate2'],
    ['lease', 'lease', 'estate', 'Now Leasing', ['listing', 'promo'], 3.0, 'App cards · chips · bright', 'App language: a listing card slides up with the photo, rent and size chips, amenities that pop in, swipes between photos and a tour button.', 'estate2'],
    ['luxury', 'luxe', 'estate', 'The Luxury Collection', ['listing', 'brand'], 2.6, 'Black & gold · letterbox · slow', 'Black and gold: letterbox bars, slow gold dust, a light sweep across the gold address, photos in fine gold frames and an understated close.', 'estate2'],
    ['commercial', 'comm', 'estate', 'Commercial Space', ['listing', 'lead'], 6.0, 'Spec sheet · map pin · split', 'Business-like: a drawn street map with a pin on the site, a spec sheet that fills in from the listing, split-screen photos and the deal type.', 'estate2'],
    // ---------------- other industries
    ['blueprint', 'blueprint', 'home', 'The Blueprint', ['show', 'brand'], 4.2, 'Technical · annotated', 'Construction language: blueprint paper, dimension lines, material callouts on your footage and an approval stamp.'],
    ['salon', 'salon', 'beauty', 'Salon Editorial', ['show', 'brand'], 3.6, 'Fashion spread · serif', 'A fashion spread: big serif type, colour-blocked panels and the look’s credits set like a magazine.'],
    ['barber', 'barber', 'beauty', 'Barbershop Culture', ['show', 'promo'], 3.2, 'Pole stripes · stencil', 'Pole-stripe wipes, stencil type, a straight-razor cut between shots, sticker badges and a boom-bap beat.'],
    ['vreveal', 'reveal', 'auto', 'Vehicle Reveal', ['show', 'promo'], 4.0, 'Dark studio · light sweep', 'A dark studio: a light sweep uncovers the vehicle, spec bars fill, HUD details and a driving synth score.'],
    ['event', 'event', 'hosp', 'Event Countdown', ['event'], 3.4, 'Ticket stub · countdown', 'A ticket stub with perforations, the days counting down, the lineup and the date, party house underneath.'],
    ['pdrop', 'product', 'retail', 'Product Drop', ['launch', 'promo'], 3.0, 'Hype drop · strobe', 'Drop energy: strobe cuts, the drop date and time in huge type, a barcode label and the options.'],
    ['expert', 'expert', 'pro', 'Expert Authority', ['brand', 'lead'], 4.2, 'Calm · clean grid', 'Calm authority: a clean grid, a pull quote, credentials you list and steady, confident motion.'],
    // other industries, part 2 (V10): file trade2
    ['crew', 'crew', 'home', 'Meet the Crew', ['brand', 'lead'], 6.4, 'Documentary · ID badges · hazard band', 'The people behind the work: a hazard band with the title, each person in a taped frame with an ID badge that clips on with their name and role.', 'trade2'],
    ['timeline', 'timeline', 'home', 'Project Timeline', ['show', 'brand'], 7.0, 'Process · progress rail · stamps', 'Start to finish: a progress rail runs along the bottom, milestones light up as each stage wipes in, the last one gets a check.', 'trade2'],
    ['glowup', 'glowup', 'beauty', 'The Glow Up', ['show', 'promo'], 5.0, 'Before/after slider · sparkles · dreamy', 'A before/after slider sweeps across the frame, sparkles twinkle, a script title floats and the service name settles under it.', 'trade2'],
    ['swatch', 'swatch', 'beauty', 'Colour Swatches', ['show', 'menu'], 4.4, 'Swatch book · editorial · chic', 'A colour story: a swatch book fans open, the footage shows through a swatch window, each colour named on its card.', 'trade2'],
    ['shine', 'shine', 'auto', 'Detail Shine', ['show', 'promo'], 4.0, 'Gloss · glint · chrome', 'A glint sweeps the frame on every cut, water beads run down the glass, chrome type and your steps ticking across a bar.', 'trade2'],
    ['garage', 'garage', 'auto', 'Service Bay', ['show', 'promo'], 4.2, 'Shop floor · gauge · checklist', 'Diamond plate and stencil type, a gauge needle that climbs as each job on your checklist ticks off, warning-stripe wipes on the beat.', 'trade2'],
    ['party', 'party', 'hosp', 'Party Night', ['event', 'promo'], 5.0, 'Nightlife · confetti · on the beat', 'A 3-2-1 build, confetti on the drop, the event name bounces in, the date and the lineup flash on the beat under a mirror-ball light field.', 'trade2'],
    ['venue', 'venue', 'hosp', 'Wedding Venue', ['show', 'event', 'brand'], 5.4, 'Romantic · arch · botanical', 'A fine arch drawn with sprigs growing up its sides, script headings and each space you name shown inside the arch, a waltz underneath.', 'trade2'],
    ['arrivals', 'arrivals', 'retail', 'New Arrivals', ['launch', 'show'], 4.0, 'Lookbook · index numbers · grid', 'An editorial lookbook: huge index numbers, a three-up grid with NEW tags, then each piece full height with its name and optional price.', 'trade2'],
    ['flashsale', 'flash', 'retail', 'Flash Sale', ['promo'], 4.2, 'Urgent · countdown · hazard', 'A ticking countdown and hazard stripes, then the offer you type slammed huge with what it is on and when it ends.', 'trade2'],
    ['tips', 'tips', 'pro', 'Quick Tips', ['brand', 'lead'], 4.6, 'Educational · flip cards · progress', 'Three numbered cards flip over one at a time with your tip on the back, a progress bar across the top and a “save this” note.', 'trade2'],
    ['clientstory', 'story', 'pro', 'Client Story', ['brand', 'lead'], 7.0, 'Testimonial · serif · quiet', 'A review from your brand kit, word for word: quote marks draw themselves and the words arrive a phrase at a time beside your footage.', 'trade2'],
  ];
  const FILE = { food: 'food', estate: 'estate' };
  const secOf = id => NX.SECTORS.find(s => s.id === id);
  NX.FAMILIES = E.map(([tid, cf, sector, name, obj, pt, vibe, blurb, file]) => ({ id: cf, tid, sector, name, obj, vibe, blurb }));
  NX.FAM_TPLS = E.map(([tid, cf, sector, name, obj, pt, vibe, blurb, file]) => ({
    id: tid, name, file: file || FILE[sector] || 'trade', v: cf, fam: secOf(sector).fam, cf, sector, obj, vibe, blurb, posterT: pt, live: true, isNew: true, ind: secOf(sector).ind,
  })).filter(t => window.STUDIO_REG && STUDIO_REG[t.file]);
  NX.sectorOfInd = ind => { const s = NX.SECTORS.find(x => x.ind.includes(ind)); return s ? s.id : null; };
  NX.familyOf = tid => NX.FAMILIES.find(f => f.tid === tid) || null;
})();
