'use strict';
/* NexGen Studio V24 (Nov 13): two new industries (car dealership, photo & video studio) and six formats from
   engine/tpl_nx9.js for dealers, detailers, carpet cleaners and studios. Everything a viewer could take as a fact
   (vehicle, price, spec, offer, dates, terms) is a field with a placeholder. Loads after nx-copy4.js, before nx-app.js. */
window.NX = window.NX || {};
(() => {
  const I = NX.INDUSTRIES; if (!I || !NX.SECTORS) return;
  const merge = (base, o) => { const out = {}; for (const k in base) out[k] = Object.assign({}, base[k]); for (const k in o) out[k] = Object.assign({}, out[k] || {}, o[k]); return out; };
  const G = I.general || { copy: {} }, PRO = I.pro || G;
  const NEW = {
    dealership: {
      base: 'general', label: 'Car dealership', noun: 'VEHICLE', cta: 'BOOK A TEST DRIVE', tagline: 'Find your next drive.', badge: 'TRADE-INS WELCOME',
      services: ['NEW VEHICLES', 'USED VEHICLES', 'FINANCING', 'TRADE-INS', 'SERVICE & PARTS', 'TEST DRIVES'],
      billing: ['{brand}  PRESENTS  WHAT’S ON THE LOT', 'WALKED AROUND BY OUR TEAM', 'TEST DRIVES BY APPOINTMENT', 'TRADE-INS WELCOME', 'SERVING {area}'],
      copy: merge(G.copy, {
        spot: { title: 'On the Lot This Week', l1: 'THE WALKAROUND', l2: 'UNDER THE HOOD', l3: 'THE INTERIOR', l4: 'THE TECH', l5: 'THE TEST DRIVE' },
        service: { kick: 'NOW ON THE LOT', a1: 'FIND', a2: 'YOUR', b1: 'NEXT DRIVE.', chip1: 'NEW', chip2: 'USED', chip3: 'TRADE-INS', tag: 'FIND YOUR NEXT DRIVE' },
        thisor: { kick: 'DEALER EDITION', r1a: 'TRUCK', r1b: 'SUV', r2a: 'NEW', r2b: 'PRE-OWNED', r3a: 'BLACK', r3b: 'WHITE', r4a: 'ROAD TRIP', r4b: 'DAILY DRIVER' },
        upgrade: { head1: 'WHAT ARE YOU', head2: 'SHOPPING FOR?', o1: 'TRUCKS', o2: 'SUVS', o3: 'SEDANS', o4: 'SOMETHING FAST' },
        stories: { poll: 'WOULD YOU DRIVE THIS?', sticker: 'JUST HIT THE LOT.', stickerCap: 'NEW THIS WEEK', qaQ: 'do you take trade-ins?', qaA: 'Bring it by. We’ll take a look.' },
        searchx: { query: 'car dealership near me' }, phonex: { n1: 'New arrivals are on the lot', n2: 'Walkaround videos just posted', n3: 'Book a test drive online', h1: 'YOUR NEXT DRIVE\nIS ONE TAP AWAY' },
        stackx: { title: 'ON THE LOT', end: 'COME TAKE A LOOK' }, typex: { l1: 'PICK IT.', l2: 'DRIVE IT.', l3: 'TRADE UP.', l4: 'DRIVE HOME.', l5: 'COME SEE US' }, mapx: { head: 'COME TAKE A TEST DRIVE' },
        feedx: { cap: 'Just hit the lot.' }, calx: { head: 'BOOK YOUR TEST DRIVE', end: 'THE KEYS ARE WAITING' }, gridx: { title: 'ON THE LOT' }, browserx: { head: 'Find your\nnext drive.' },
      }),
    },
    photo: {
      base: 'pro', label: 'Photo & video studio', noun: 'SHOOT', cta: 'BOOK YOUR SESSION', tagline: 'Your story, well shot.', badge: 'BY APPOINTMENT',
      services: ['PORTRAITS', 'WEDDINGS', 'EVENTS', 'BRAND SHOOTS', 'PRODUCT PHOTOS', 'VIDEO PRODUCTION'],
      billing: ['{brand}  PRESENTS  A LOOK THROUGH THE LENS', 'LIT AND SHOT BY OUR TEAM', 'EDITED IN HOUSE', 'DELIVERED READY TO SHARE', 'SERVING {area}'],
      copy: merge(PRO.copy, {
        spot: { title: 'From the Last Shoot', l1: 'THE SETUP', l2: 'THE LIGHT', l3: 'THE MOMENT', l4: 'THE EDIT', l5: 'THE FINAL FRAME' },
        service: { kick: 'NOW BOOKING', a1: 'YOUR', a2: 'STORY,', b1: 'WELL SHOT.', chip1: 'PORTRAITS', chip2: 'EVENTS', chip3: 'BRANDS', tag: 'YOUR STORY, WELL SHOT' },
        thisor: { kick: 'STUDIO EDITION', r1a: 'GOLDEN HOUR', r1b: 'STUDIO LIGHT', r2a: 'CANDID', r2b: 'POSED', r3a: 'COLOUR', r3b: 'BLACK & WHITE', r4a: 'PHOTO', r4b: 'VIDEO' },
        upgrade: { head1: 'WHAT ARE WE', head2: 'SHOOTING?', o1: 'PORTRAITS', o2: 'YOUR EVENT', o3: 'YOUR BRAND', o4: 'YOUR PRODUCT' },
        stories: { poll: 'FRAME IT?', sticker: 'FRESH FROM THE EDIT.', stickerCap: 'FROM A RECENT SHOOT', qaQ: 'how do I book a session?', qaA: 'Send us your date and what you have in mind.' },
        searchx: { query: 'photographer near me' }, phonex: { n1: 'Now booking sessions', n2: 'A new gallery just posted', n3: 'Send us your date', h1: 'YOUR SESSION\nIS ONE TAP AWAY' },
        stackx: { title: 'RECENT SHOOTS', end: 'YOURS COULD BE NEXT' }, typex: { l1: 'LIGHT.', l2: 'FRAME.', l3: 'SHOOT.', l4: 'DELIVER.', l5: 'LET’S SHOOT' }, mapx: { head: 'COME BY THE STUDIO' },
        feedx: { cap: 'One from the last shoot.' }, calx: { head: 'BOOK YOUR SESSION', end: 'YOUR DATE IS WAITING' }, gridx: { title: 'THE PORTFOLIO' }, browserx: { head: 'Your story,\nwell shot.' },
      }),
    },
  };
  // in place: dealership after detailing, the studio after professional services
  const after = { detailing: 'dealership', pro: 'photo' }, order = [];
  for (const k of Object.keys(I)) { order.push([k, I[k]]); const n = after[k]; if (n && !I[n]) order.push([n, NEW[n]]); }
  for (const k of Object.keys(NEW)) if (!order.some(o => o[0] === k)) order.push([k, NEW[k]]);
  for (const k of Object.keys(I)) delete I[k]; for (const [k, v] of order) I[k] = v;
  const sec = id => NX.SECTORS.find(s => s.id === id);
  if (sec('auto') && !sec('auto').ind.includes('dealership')) { sec('auto').ind.push('dealership'); sec('auto').blurb = 'Dealerships, detailing and shops.'; }
  if (sec('pro') && !sec('pro').ind.includes('photo')) sec('pro').ind.push('photo');
  const PAL = { dealership: ['#E11D2E', '#0C0D10', '#F4F5F7'], photo: ['#E0B04A', '#0E0E10', '#F5F2EC'] }, newBase = NX.newBrand;
  if (newBase) NX.newBrand = (name, industry) => { const b = newBase(name, industry), p = PAL[industry]; if (p) b.colors = { accent: p[0], ink: p[1], paper: p[2] }; return b; };

  NX.FAM_TPLS = NX.FAM_TPLS || []; NX.FAMILIES = NX.FAMILIES || [];
  // V25: the real-3D showpieces (three.js). Listed only where three.js loaded; on a device without WebGL they fall back to flat shots.
  if (window.STUDIO_REG && STUDIO_REG.nx10 && window.THREE) for (const [id, name, pt, blurb] of [
    ['ringx', '3D Carousel', 3.0, 'Real 3D. Five shots stand on a ring that turns to face each one, mirrored in a dark floor, each with its own label.'],
    ['showx', 'The Showroom', 3.2, 'Real 3D. One clip on a tall screen in a dark showroom with light beams, the camera drifting around it. Name, second line and an optional price.'],
    ['flyx', 'Fly-Through', 3.0, 'Real 3D. The camera flies down a corridor of four shots hung in space, pausing at each one.'],
    ['logorev', '3D Logo Reveal', 2.4, 'Real 3D. A five-second bumper: the logo as a solid slab spins, slams or rises in, with a line and a button under it. Opens or closes any video, or drops into an edit as a block.'],
    ['headx', '3D Headline', 2.6, 'Real 3D. Two lines of solid 3D letters slam and spin in over your footage, with an optional small line. For hooks and sale events.'],
    ['cubex', 'Photo Cube', 3.0, 'Real 3D. Four shots on the faces of a cube that turns to show each side.'],
  ]) if (!NX.FAM_TPLS.some(t => t.id === id)) NX.FAM_TPLS.push({ id, name, file: 'nx10', v: id, fam: 'Signature', sig: true, live: true, isNew: true, liveAudio: true, posterT: pt, blurb });
  if (!(window.STUDIO_REG && STUDIO_REG.nx9)) return;
  const E = [
    ['lotx', 'lotx', 'auto', 'On the Lot', ['show', 'launch'], 2.6, 'Your footage · spec card · price tag', 'One vehicle in three shots, shown whole. Your logo on top, a card with the year, make and model and up to three specs, a price tag and a badge like JUST ARRIVED. Add your terms in small print.'],
    ['listx', 'listx', 'auto', 'Vehicle Listing', ['show', 'promo'], 6.0, 'Price · down payment · features · VIN', 'A full listing for one vehicle in three shots: the name with the full price and a second amount such as the down payment, then up to six features ticking in, then mileage, title status, VIN and stock number. Add your terms in small print.'],
    ['reelx', 'reelx', 'auto', 'Inventory Reel', ['show', 'promo'], 3.2, 'Three vehicles · names · prices', 'Three vehicles one after another, counted 01 to 03, each with its name, a detail line and its own price tag.'],
    ['eventx', 'eventx', 'auto', 'Sales Event', ['promo', 'event'], 3.4, 'Event name · offers · dates · terms', 'Your event name in big type over your footage, a burst, up to two offer cards, the dates and a line for your terms.'],
    ['walkx', 'walkx', 'auto', 'Walkaround', ['show', 'lead'], 3.0, 'One clip · feature callouts · price', 'Your walkaround clip plays through, whole and at real speed, while up to four feature callouts pop on. The name and price stay below.'],
    ['wipex', 'wipex', 'auto', 'The Reveal', ['show', 'brand'], 3.4, 'Before · shine sweep · after', 'The before photo, then a shine sweeps across and leaves the after. For details, corrections, coatings and interiors.'],
    ['lensx_a', 'lensx', 'auto', 'Up Close', ['show', 'brand'], 3.0, 'Viewfinder · focus lock · shutter', 'Four shots seen through a camera viewfinder. The focus hunts and locks, the shutter fires, and each shot gets a label.'],
    ['wipex_h', 'wipex', 'home', 'The Reveal', ['show', 'brand'], 3.4, 'Before · shine sweep · after', 'The before photo, then a shine sweeps across and leaves the after. For carpets, floors, driveways, roofs and anything you clean or restore.'],
    ['walkx_h', 'walkx', 'home', 'Job Walkthrough', ['show', 'lead'], 3.0, 'One clip · callouts', 'One clip of the finished job plays through, whole and at real speed, while up to four callouts point out what was done.'],
    ['lensx', 'lensx', 'pro', 'Through the Lens', ['show', 'brand'], 3.0, 'Viewfinder · focus lock · shutter', 'A portfolio seen through the viewfinder: the focus hunts and locks, the shutter fires, the next shot. Each one gets a label like PORTRAITS or WEDDINGS.'],
    ['reelx_r', 'reelx', 'retail', 'New Arrivals', ['show', 'launch'], 3.2, 'Three items · names · prices', 'Three items one after another, counted 01 to 03, each with its name, a detail line and its own price tag.'],
    ['eventx_r', 'eventx', 'retail', 'Sale Event', ['promo', 'event'], 3.4, 'Event name · offers · dates · terms', 'Your sale name in big type over your footage, a burst, up to two offer cards, the dates and a line for your terms.'],
    ['wipex_b', 'wipex', 'beauty', 'The Reveal', ['show', 'brand'], 3.4, 'Before · shine sweep · after', 'The before photo, then a shine sweeps across and leaves the after.'],
  ];
  for (const [tid, cf, sector, name, obj, pt, vibe, blurb] of E) {
    const sc = sec(sector); if (!sc || NX.FAM_TPLS.some(t => t.id === tid)) continue;
    NX.FAMILIES.push({ id: cf, tid, sector, name, obj, vibe, blurb });
    NX.FAM_TPLS.push({ id: tid, name, file: 'nx9', v: cf, fam: sc.fam, cf, sector, obj, vibe, blurb, posterT: pt, live: true, isNew: true, liveAudio: true, ind: sc.ind });
  }
})();
