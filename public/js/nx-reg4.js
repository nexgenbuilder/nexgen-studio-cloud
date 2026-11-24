'use strict';
/* NexGen Studio V19 (Nov 11): the motion showpieces (engine/tpl_nx7.js) in the gallery. They sit with the Signature formats,
   work for every industry, use the brand's own look and mix their soundtrack live (liveAudio, js/nx-sound.js).
   Loads after nx-reg3.js and before nx-app.js. */
window.NX = window.NX || {};
(() => {
  if (!(window.STUDIO_REG && STUDIO_REG.nx7)) return; NX.FAM_TPLS = NX.FAM_TPLS || [];
  const E = [
    ['searchx', 'Search to Found', 6.0, 'A search bar types what your customers look for, the results load, and your business springs up as the answer: your photo, services and a tap on your call to action. Spring motion and real motion blur.'],
    ['phonex', 'On Your Phone', 3.4, 'A phone rises with your photo or clip on its screen and three notifications drop in. Then it steps aside for your headline. Put any image on the screen.'],
    ['stackx', 'Photo Stack', 3.6, 'Four photos as a deck of prints. Each is flicked away to show the next, with its own label. Dishes, projects, cuts, listings: anything you can photograph.'],
    ['typex', 'Spring Type', 2.2, 'No footage needed. Four short lines of big type, each with its own move, cut on the beat, then your logo and call to action.'],
  ];
  // V20 (engine/tpl_nx8.js)
  const E8 = [
    ['mapx', 'Find Us', 4.6, 'A map draws itself, a route runs to your door and the pin drops. A card rises with your area, address and hours. For any business people visit.'],
    ['feedx', 'The Feed', 5.3, 'A social feed scrolls by and stops on your post. A double-tap heart, your caption types out, then your logo and call to action.'],
    ['calx', 'Book It', 4.4, 'A calendar springs in, a ring hops to the day you choose, time chips pop and a finger taps your call to action. The day and times are yours to set.'],
    ['gridx', 'Photo Wall', 1.9, 'Six photos assemble into a wall. The camera pushes into two of them, each with a label, then pulls back for the title.'],
    ['stingx', 'Logo Pop', 2.4, 'A five-second bumper: your colour bursts open, the logo springs in and catches the light. Use it to open or close any video.'],
    ['browserx', 'Your Website', 3.4, 'A browser types your web address, your page loads with your photo and headline, scrolls through your services, and the cursor clicks your button.'],
  ];
  const push = (list, file) => { for (const [id, name, pt, blurb] of list) if (!NX.FAM_TPLS.some(t => t.id === id)) NX.FAM_TPLS.push({ id, name, file, v: id, fam: 'Signature', sig: true, live: true, isNew: true, liveAudio: true, posterT: pt, blurb }); };
  push(E, 'nx7'); if (STUDIO_REG.nx8) push(E8, 'nx8');
})();
