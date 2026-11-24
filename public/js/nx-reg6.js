'use strict';
/* NexGen Studio V26-V27 (Nov 18): the Pixel family (engine/tpl_pixel.js). Retro pixel-art formats on a true pixel grid with
   chiptune sound. They open in the Pixel palette (red, near-black, white, yellow) and switch to the brand's colours in
   Style like any family. Listed on Home in their own row and under the "Pixel" filter. Loads after nx-reg5.js. */
window.NX = window.NX || {};
(() => {
  if (!(window.STUDIO_REG && STUDIO_REG.pixel) || typeof K7 === 'undefined') return;
  const P = (accent, ink, text, accent2, paper, deep1, deep2) => ({ accent, ink, text, accent2, paper, deep1, deep2 });
  const PAL = P('#FF3B52', '#120C16', '#F4F2F7', '#FFD25A', '#F4F2F7', '#1B1220', '#0A070C');
  const FONTS = { sans: 'mont', serif: 'dmserif', display: 'bungee', script: 'marker' };
  const E = [
    ['pxstart', 'Press Start', 6.5, 'Arcade title · logo drop · blink', 'An arcade title screen: PLAYER 1 types in, your logo drops and bounces, a two-line headline, a blinking PRESS START that gets pressed, then your button.'],
    ['pxquest', 'Quest Checklist', 9.5, 'Quest box · checkmarks · coins', 'A quest box with your three-line title, then four items slide in and each gets checked off with a coin sound. QUEST COMPLETE, your reward line and a start button.'],
    ['pxover', 'Game Over', 7.5, 'Static · countdown · comeback', 'Static, then GAME OVER drops in letter by letter. Your problem in three short lines, a CONTINUE? countdown, YES gets picked, and your comeback line with the logo.'],
    ['pxboss', 'Boss Fight', 9.6, 'Health bars · power-up · you win', 'You against the rival: two health bars, the rival hits you down to 2 HP, a power-up drops in and refills you, you hit back and win. Every name and note is yours to type.'],
    ['pxcoin', 'Insert Coin', 9.0, 'Coin slot · new game · levels', 'A coin drops in the slot, NEW GAME, your logo, a four-line headline, then three levels unlock one by one and INSERT COIN blinks over your button.'],
  ];
  // V27 (engine/tpl_pixel2.js): the November sale formats and the before & after split screen
  const E2 = !(STUDIO_REG.pixel2) ? [] : [
    ['pxba', 'Before & After Arcade', 12.4, 'Split screen · 9 business scenes · stats', 'Your business before (top) and after (bottom) as living pixel scenes: coffee shop, barbershop, pizza, landscaping, pressure washing, HVAC, carpet cleaning, real estate or a car lot. Six red X lines against six green checks, a level counter climbing to 99, WHICH ONE IS YOURS? and your ending. Opens on the scene and words for the brand’s industry.'],
    ['pxbf', 'Black Friday Boss Sale', 8.0, 'Price tag slice · % off burst', 'BLACK FRIDAY slams in, your old price on a tag gets sliced in half, the new price drops in with a % OFF burst and confetti, then what is on sale, when it ends and your button. Type your own prices.'],
    ['pxthanks', 'Thanksgiving Thanks', 8.5, 'Pixel turkey · leaves · price drop', 'A pixel turkey bounces in under falling leaves, a thank-you line to your customers, then the old price is struck and the new one lands, with your offer bar and button.'],
    ['pxloot', 'Loot Drop', 7.5, 'Treasure chest · legendary item · price', 'A treasure chest shakes and bursts open in light and coins, a LEGENDARY item card rises with your logo, then the price drops from old to new with the discount and the deadline.'],
  ];
  // V28 (engine/tpl_pixel3.js): the arcade pack
  const E3 = !(STUDIO_REG.pixel3) ? [] : [
    ['pxcab', 'Arcade Cabinet', 4.0, 'Your footage · marquee · CRT screen', 'An arcade cabinet: your name in lights on the marquee, your two clips playing whole on its CRT screen with a channel-change between them, a control panel with your logo, two info lines, an offer and your button.'],
    ['pxhud', 'Game HUD', 5.0, 'Your footage · score · dialogue', 'Your three clips under a game HUD: a score counting up, three lives and LEVEL set to your name, with up to three lines typed into a dialogue box by the speaker you name.'],
    ['pxtype', 'Pixel Kinetic', 7.6, 'Your footage · slam words · combo', 'Five words or short lines slam in over your footage one at a time with a shake and a combo counter, then a score pop, all the words stacked, your sub-line, logo and button.'],
    ['pxscores', 'High Scores', 6.5, 'Leaderboard · five rows', 'A high-score table that fills from the bottom up: five names and scores, or five menu items and their prices. The top row flashes, then your logo and button.'],
    ['pxselect', 'Select Your Player', 7.0, 'Four characters · cursor · pick', 'Four pixel characters with names and roles for your team or your services. The cursor hops between them and lands on the one you choose: P1 SELECTED.'],
    ['pxvs', 'New Challenger', 7.0, 'Warning · event · your footage', 'WARNING! HERE COMES A NEW CHALLENGER flashes between hazard stripes, then your event name over your clip with the date, time, place and an optional prize.'],
    ['pxtokens', 'Token Board', 6.0, 'Packages · prices · coins', 'Up to four packages slide in on a token board, each with a name, a detail line and the price you type, then your logo and INSERT TOKENS.'],
  ];
  // an industry for arcades, barcades, retro game shops, family fun centres and esports / LAN centres
  const I = NX.INDUSTRIES, sec = id => (NX.SECTORS || []).find(s => s.id === id);
  if (I && !I.arcade) {
    const G = I.general || { copy: {} }, copy = {}; for (const k in G.copy) copy[k] = Object.assign({}, G.copy[k]);
    I.arcade = { base: 'general', label: 'Arcade & retro games', noun: 'GAME', cta: 'COME PLAY', tagline: 'Game on.', badge: 'ALL AGES WELCOME',
      services: ['ARCADE GAMES', 'PARTIES', 'TOURNAMENTS', 'FOOD & DRINKS', 'PRIZES', 'GROUP EVENTS'],
      billing: ['{brand}  PRESENTS  A NIGHT OF GAMES', 'NEW GAMES ON THE FLOOR', 'PARTIES AND GROUP EVENTS', 'TOURNAMENTS EVERY MONTH', 'SERVING {area}'], copy };
    if (sec('hosp') && !sec('hosp').ind.includes('arcade')) { sec('hosp').ind.push('arcade'); sec('hosp').blurb = 'Venues, arcades, parties, launches and festivals.'; }
    const nb = NX.newBrand; if (nb) NX.newBrand = (name, industry) => { const b = nb(name, industry); if (industry === 'arcade') b.colors = { accent: '#FF3B52', ink: '#120C16', paper: '#F4F2F7' }; return b; };
  }
  NX.FAM_TPLS = NX.FAM_TPLS || [];
  for (const [id, name, pt, vibe, blurb] of E.concat(E2, E3)) {
    K7.FAM[id] = { pal: PAL, fonts: FONTS, music: 'pulse', bpm: 132 };
    const file = E3.some(e => e[0] === id) ? 'pixel3' : E2.some(e => e[0] === id) ? 'pixel2' : 'pixel';
    if (!NX.FAM_TPLS.some(t => t.id === id)) NX.FAM_TPLS.push({ id, name, file, v: id, fam: 'Pixel', cf: id, px: true, live: true, isNew: true, liveAudio: true, posterT: pt, vibe, blurb });
  }
})();
