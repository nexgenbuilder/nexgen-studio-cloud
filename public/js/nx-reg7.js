'use strict';
/* NexGen Studio V29-V30 (Nov 18): the website showcase formats (engine/tpl_site.js), for the daily series on businesses with
   no website or an old one and the site you built them. Family "Websites", own row on Home. Loads after nx-reg6.js. */
window.NX = window.NX || {};
(() => {
  if (!(window.STUDIO_REG && STUDIO_REG.site)) return;
  NX.FAM_TPLS = NX.FAM_TPLS || [];
  const E = [
    ['sitedrop', 'drop', 'Website Drop · Phone', 6.0, 'The business on top (its storefront clip or photo, name, town and a NO WEBSITE stamp), SO WE BUILT THEM ONE, then the website on a phone below: the address types in, a build bar fills, a full-page screenshot scrolls or a screen recording plays. Ends on your call to action.'],
    ['sitedroplap', 'droplap', 'Website Drop · Laptop', 6.0, 'The same daily format with the website on a laptop below the business. Best for desktop screenshots and screen recordings.'],
    ['sitedropfull', 'dropfull', 'Website Drop · Full Screen', 6.0, 'The business on top, and your screen recording (or a full-page screenshot) filling the whole bottom half with no device around it.'],
    ['siteglow', 'glow', 'Website Glow-Up', 6.6, 'Their old website in a phone or laptop with a BEFORE stamp and three red notes, then a shine wipe reveals the new site with an AFTER stamp and three green notes.'],
    ['siteoldnew', 'oldnew', 'Old vs New Website', 5.0, 'Split screen: their website now on top, what you built on the bottom, both scrolling at once, with red notes on one and green notes on the other. On laptops, phones or full screen.'],
    ['sitenone', 'nosite', 'No Website Found', 4.6, 'Their name gets searched, their listing card shows a greyed-out Website button and NO WEBSITE?, then WE FIXED THAT and the site you built rises on a phone and scrolls.'],
  ];
  for (const [id, v, name, pt, blurb] of E) if (!NX.FAM_TPLS.some(t => t.id === id)) NX.FAM_TPLS.push({ id, name, file: 'site', v, fam: 'Websites', web: true, live: true, isNew: true, liveAudio: true, posterT: pt, blurb });
})();
