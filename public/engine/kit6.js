'use strict';
/* Kit 6 (Oct 28): holidays and seasonal looks.
   HOL.THEMES: 19 occasions with their next date, copy, palette, fonts, music, particles and decorations.
   Effects are drawn procedurally from (particle index, t) with no state, so any frame renders the same in the preview and
   the export. HOL.overlay(t, fx) puts a seasonal touch (particles + an edge decoration) over any template.
   Requires core, kit, kit3. */
const HOL = (() => {
  const G = K3.G, D = K3.D, TAU = Math.PI * 2;
  const R = (i, k) => hash(i * 7.31 + k * 13.17 + 0.5);            // deterministic 0..1 for particle i, property k
  const mod = (a, n) => ((a % n) + n) % n;
  const rgb = h => { const n = parseInt(String(h).slice(1, 7), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const hexA = (h, a) => { const c = rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };
  const mix = (a, b, u) => { const A = rgb(a), B = rgb(b); return '#' + A.map((x, k) => Math.round(x + (B[k] - x) * u).toString(16).padStart(2, '0')).join(''); };
  const SPR = new Map();
  function glow(col, r) {   // a soft round sprite, cached per colour
    r = r || 32; const k = col + '|' + r; let c = SPR.get(k);
    if (!c) { c = document.createElement('canvas'); c.width = c.height = r * 2; const g = c.getContext('2d'), gr = g.createRadialGradient(r, r, 0, r, r, r);
      gr.addColorStop(0, hexA(col, 1)); gr.addColorStop(0.22, hexA(col, 0.6)); gr.addColorStop(0.55, hexA(col, 0.18)); gr.addColorStop(1, hexA(col, 0)); g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2); SPR.set(k, c); }
    return c;
  }

  // ------------------------------------------------------------------------------------------ dates
  const nth = (y, m, wd, n) => { const d = new Date(y, m, 1), off = (wd - d.getDay() + 7) % 7; return new Date(y, m, 1 + off + (n - 1) * 7); };
  const lastWd = (y, m, wd) => { const d = new Date(y, m + 1, 0), off = (d.getDay() - wd + 7) % 7; return new Date(y, m, d.getDate() - off); };
  const easter = y => { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    return new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1); };
  const HANUKKAH = { 2025: [11, 14], 2026: [11, 4], 2027: [11, 24], 2028: [11, 12], 2029: [11, 1], 2030: [11, 20], 2031: [11, 9], 2032: [10, 27] };
  const fixed = (m, d) => y => new Date(y, m, d);

  // ------------------------------------------------------------------------------------------ occasions
  // pal: accent, ink (background), paper, text, accent2 · fonts: the four engine slots · fx: particles · decor: edge
  // decorations (overlay-safe) · hero: larger pieces the holiday templates place · tone picks layout details
  const THEMES = {
    newyear: { name: 'New Year', H: 'THE NEW YEAR', when: y => new Date(y, 0, 1), greet: 'Happy New Year', kick: 'CHEERS TO {YEAR}', sub: 'Thank you for a wonderful year, from all of us at {brand}',
      pal: { accent: '#E6C76B', ink: '#07070D', paper: '#F4EFE3', text: '#FFFFFF', accent2: '#D9D9E2', deep1: '#1A1A2E', deep2: '#030308' }, fonts: { sans: 'mont', serif: 'cinzel', display: 'abril', script: 'greatvibes' },
      fx: 'confetti', fx2: 'sparkles', decor: '', hero: ['fireworks', 'balloons'], music: 'party', tone: 'party', cols: ['#E6C76B', '#F7E7B4', '#D9D9E2', '#FFFFFF'] },
    valentines: { name: 'Valentine’s Day', H: 'VALENTINE’S DAY', when: fixed(1, 14), greet: 'Happy Valentine’s Day', kick: 'WITH LOVE', sub: 'From all of us at {brand}',
      pal: { accent: '#FF4D7D', ink: '#2B0612', paper: '#FFF0F3', text: '#FFF5F7', accent2: '#FFC2D4', deep1: '#4A0C22', deep2: '#15030A' }, fonts: { sans: 'raleway', serif: 'playfair', display: 'abril', script: 'greatvibes' },
      fx: 'hearts', decor: '', hero: ['bokeh'], music: 'romance', tone: 'romantic', cols: ['#FF4D7D', '#FFC2D4', '#FF8FB1', '#FFFFFF'] },
    stpat: { name: 'St. Patrick’s Day', H: 'ST. PATRICK’S DAY', when: fixed(2, 17), greet: 'Happy St. Patrick’s Day', kick: 'FEELING LUCKY', sub: 'From all of us at {brand}',
      pal: { accent: '#3DDC84', ink: '#062615', paper: '#F1F7EE', text: '#FFFFFF', accent2: '#F2C94C', deep1: '#0E3D22', deep2: '#03150A' }, fonts: { sans: 'poppins', serif: 'fraunces', display: 'luckiest', script: 'kaushan' },
      fx: 'shamrocks', fx2: 'sparkles', decor: '', hero: ['bokeh'], music: 'party', tone: 'party', cols: ['#3DDC84', '#1E9E5A', '#A7F3C4', '#F2C94C'] },
    easter: { name: 'Easter', H: 'EASTER', when: easter, greet: 'Happy Easter', kick: 'HAPPY SPRING', sub: 'From all of us at {brand}',
      pal: { accent: '#E87EA1', ink: '#FFF8EF', paper: '#3B2F4A', text: '#3B2F4A', accent2: '#7CC8A4', deep1: '#FFE9F0', deep2: '#FFFDF8' }, fonts: { sans: 'fredoka', serif: 'yeseva', display: 'righteous', script: 'pacifico' },
      fx: 'petals', decor: 'florals', hero: ['florals'], music: 'day', tone: 'warm', cols: ['#F6A6C1', '#FFD6A5', '#A8D8B9', '#C3B1E1', '#FFF1A8'] },
    cinco: { name: 'Cinco de Mayo', H: 'CINCO DE MAYO', when: fixed(4, 5), greet: '¡Feliz Cinco de Mayo!', kick: '¡VAMOS A CELEBRAR!', sub: 'From all of us at {brand}',
      pal: { accent: '#FF4F79', ink: '#14123A', paper: '#FFF4E0', text: '#FFFFFF', accent2: '#FFC93C', deep1: '#25205E', deep2: '#0A0920' }, fonts: { sans: 'poppins', serif: 'yeseva', display: 'luckiest', script: 'kaushan' },
      fx: 'confetti', decor: 'papel', hero: ['papel'], music: 'party', tone: 'party', cols: ['#FF4F79', '#FF9A1F', '#FFC93C', '#2EC4B6', '#7B61FF', '#3DDC84'] },
    mothers: { name: 'Mother’s Day', H: 'MOTHER’S DAY', when: y => nth(y, 4, 0, 2), greet: 'Happy Mother’s Day', kick: 'FOR EVERY MOM', sub: 'With love, from all of us at {brand}',
      pal: { accent: '#D9577F', ink: '#FCEEF1', paper: '#3D2330', text: '#3D2330', accent2: '#8DBE96', deep1: '#FADCE4', deep2: '#FFF7F9' }, fonts: { sans: 'raleway', serif: 'playfair', display: 'abril', script: 'parisienne' },
      fx: 'petals', decor: 'florals', hero: ['florals'], music: 'romance', tone: 'romantic', cols: ['#F4A7B9', '#FFD1DC', '#FFFFFF', '#E8C5A0'] },
    memorial: { name: 'Memorial Day', H: 'MEMORIAL DAY', when: y => lastWd(y, 4, 1), greet: 'Memorial Day', kick: 'WE REMEMBER', sub: 'Honoring those who gave everything. — {brand}',
      pal: { accent: '#C8102E', ink: '#0B1424', paper: '#F2F4F7', text: '#FFFFFF', accent2: '#E9EEF5', deep1: '#14223B', deep2: '#050A14' }, fonts: { sans: 'mont', serif: 'baskerville', display: 'bebas', script: 'dancing' },
      fx: 'stars', decor: '', hero: ['flag'], music: 'anthem', tone: 'somber', cols: ['#FFFFFF', '#E9EEF5', '#C8102E'] },
    fathers: { name: 'Father’s Day', H: 'FATHER’S DAY', when: y => nth(y, 5, 0, 3), greet: 'Happy Father’s Day', kick: 'FOR EVERY DAD', sub: 'From all of us at {brand}',
      pal: { accent: '#3FA9F5', ink: '#0E1B2C', paper: '#EEF3F8', text: '#FFFFFF', accent2: '#F5B83F', deep1: '#17304D', deep2: '#070E18' }, fonts: { sans: 'archivo', serif: 'dmserif', display: 'archivoblack', script: 'playball' },
      fx: 'stars', decor: '', hero: ['bokeh'], music: 'day', tone: 'warm', cols: ['#3FA9F5', '#F5B83F', '#FFFFFF'] },
    july4: { name: '4th of July', H: 'THE 4TH', when: fixed(6, 4), greet: 'Happy 4th of July', kick: 'HAPPY INDEPENDENCE DAY', sub: 'From all of us at {brand}',
      pal: { accent: '#E63946', ink: '#0A1A3F', paper: '#F3F5FA', text: '#FFFFFF', accent2: '#FFFFFF', deep1: '#132B63', deep2: '#050E24' }, fonts: { sans: 'archivo', serif: 'dmserif', display: 'archivoblack', script: 'playball' },
      fx: 'stars', decor: 'bunting', hero: ['fireworks'], music: 'anthem', tone: 'party', cols: ['#E63946', '#FFFFFF', '#3B82F6'] },
    labor: { name: 'Labor Day', H: 'LABOR DAY', when: y => nth(y, 8, 1, 1), greet: 'Happy Labor Day', kick: 'HERE’S TO THE HARD WORKERS', sub: 'From all of us at {brand}',
      pal: { accent: '#F25C3C', ink: '#10213F', paper: '#F3F1EA', text: '#FFFFFF', accent2: '#F6C343', deep1: '#1A3463', deep2: '#081226' }, fonts: { sans: 'archivo', serif: 'dmserif', display: 'anton', script: 'playball' },
      fx: 'stars', decor: 'bunting', hero: ['bokeh'], music: 'anthem', tone: 'warm', cols: ['#F25C3C', '#FFFFFF', '#3B82F6'] },
    halloween: { name: 'Halloween', H: 'HALLOWEEN', when: fixed(9, 31), greet: 'Happy Halloween', kick: 'TRICK OR TREAT', sub: 'From all of us at {brand}',
      pal: { accent: '#FF7A00', ink: '#120A1A', paper: '#F3EDE4', text: '#FFF4E6', accent2: '#9BE15D', deep1: '#2B1442', deep2: '#07040C' }, fonts: { sans: 'archivo', serif: 'yeseva', display: 'creepster', script: 'kaushan' },
      fx: 'bats', fx2: 'embers', decor: 'webs', hero: ['moon', 'pumpkins'], music: 'spooky', tone: 'spooky', cols: ['#FF7A00', '#9BE15D', '#8B5CF6'] },
    muertos: { name: 'Día de los Muertos', H: 'DÍA DE LOS MUERTOS', when: fixed(10, 2), greet: 'Día de los Muertos', kick: 'CELEBRANDO LA VIDA', sub: 'Remembering with love · {brand}',
      pal: { accent: '#FF9A1F', ink: '#170C24', paper: '#FFF1DC', text: '#FFF6EA', accent2: '#E83F8C', deep1: '#2C1645', deep2: '#0A0412' }, fonts: { sans: 'poppins', serif: 'yeseva', display: 'luckiest', script: 'kaushan' },
      fx: 'marigold', decor: 'papel', hero: ['candles'], music: 'romance', tone: 'warm', cols: ['#FF9A1F', '#FFC93C', '#E83F8C', '#7B61FF', '#2EC4B6'] },
    veterans: { name: 'Veterans Day', H: 'VETERANS DAY', when: fixed(10, 11), greet: 'Veterans Day', kick: 'THANK YOU FOR YOUR SERVICE', sub: 'Honoring all who served. — {brand}',
      pal: { accent: '#B22234', ink: '#0D1626', paper: '#F2F4F7', text: '#FFFFFF', accent2: '#E9EEF5', deep1: '#15233D', deep2: '#050A14' }, fonts: { sans: 'mont', serif: 'baskerville', display: 'bebas', script: 'dancing' },
      fx: 'stars', decor: '', hero: ['flag'], music: 'anthem', tone: 'somber', cols: ['#FFFFFF', '#E9EEF5', '#B22234'] },
    thanksgiving: { name: 'Thanksgiving', H: 'THANKSGIVING', when: y => nth(y, 10, 4, 4), greet: 'Happy Thanksgiving', kick: 'GRATEFUL FOR YOU', sub: 'Thankful for you, from all of us at {brand}',
      pal: { accent: '#E07A2E', ink: '#24140B', paper: '#FBF2E4', text: '#FFF6EA', accent2: '#E9B44C', deep1: '#3A1F0E', deep2: '#140A04' }, fonts: { sans: 'raleway', serif: 'fraunces', display: 'abril', script: 'berkshire' },
      fx: 'leaves', decor: '', hero: ['bokeh'], music: 'day', tone: 'warm', cols: ['#D9622B', '#E8A33D', '#B23A1E', '#8C4A1F', '#C9A227'] },
    blackfriday: { name: 'Black Friday', H: 'BLACK FRIDAY', when: y => { const d = nth(y, 10, 4, 4); return new Date(y, 10, d.getDate() + 1); }, greet: 'Black Friday', kick: 'IT’S HERE', sub: 'At {brand}',
      pal: { accent: '#FFE500', ink: '#050505', paper: '#F2F2F2', text: '#FFFFFF', accent2: '#FF3B30', deep1: '#1A1A1A', deep2: '#000000' }, fonts: { sans: 'archivo', serif: 'dmserif', display: 'bungee', script: 'marker' },
      fx: 'confetti', decor: 'stripes', hero: ['burst'], music: 'pulse', tone: 'sale', cols: ['#FFE500', '#FFFFFF', '#FF3B30'] },
    hanukkah: { name: 'Hanukkah', H: 'HANUKKAH', when: y => { const h = HANUKKAH[y]; return h ? new Date(y, h[0], h[1]) : new Date(y, 11, 10); }, greet: 'Happy Hanukkah', kick: 'EIGHT NIGHTS OF LIGHT', sub: 'From all of us at {brand}',
      pal: { accent: '#5AA9FF', ink: '#0B1E4A', paper: '#F2F5FB', text: '#FFFFFF', accent2: '#E3E8F2', deep1: '#173A80', deep2: '#061230' }, fonts: { sans: 'raleway', serif: 'cinzel', display: 'abril', script: 'greatvibes' },
      fx: 'sparkles', decor: '', hero: ['menorah'], music: 'jingle', tone: 'warm', cols: ['#5AA9FF', '#E3E8F2', '#FFFFFF', '#F2D27A'] },
    christmas: { name: 'Christmas', H: 'THE HOLIDAYS', when: fixed(11, 25), greet: 'Merry Christmas', kick: 'SEASON’S GREETINGS', sub: 'From all of us at {brand}',
      pal: { accent: '#D7263D', ink: '#0D2A1E', paper: '#FBF5EA', text: '#FFF9F0', accent2: '#E9C46A', deep1: '#14402C', deep2: '#081A12' }, fonts: { sans: 'mont', serif: 'playfair', display: 'abril', script: 'mountains' },
      fx: 'snow', decor: 'lights', hero: ['ornaments', 'bokeh'], music: 'jingle', tone: 'festive', cols: ['#FF3B3B', '#2ECC71', '#FFC83D', '#3DA5FF', '#FF7AD9'] },
    holidays: { name: 'Happy Holidays', H: 'THE HOLIDAYS', when: fixed(11, 25), greet: 'Happy Holidays', kick: 'SEASON’S GREETINGS', sub: 'Warm wishes from all of us at {brand}',
      pal: { accent: '#9ED8F0', ink: '#0D1B2A', paper: '#F1F6FA', text: '#FFFFFF', accent2: '#F2D27A', deep1: '#173452', deep2: '#08121D' }, fonts: { sans: 'raleway', serif: 'playfair', display: 'abril', script: 'greatvibes' },
      fx: 'snow', decor: 'lights', hero: ['bokeh'], music: 'jingle', tone: 'festive', cols: ['#FFE7B0', '#FFF4D6', '#FFE7B0'] },
  };
  const ORDER = ['newyear', 'valentines', 'stpat', 'easter', 'cinco', 'mothers', 'memorial', 'fathers', 'july4', 'labor', 'halloween', 'muertos', 'veterans', 'thanksgiving', 'blackfriday', 'hanukkah', 'christmas', 'holidays'];
  const DAY = 86400000;
  function next(id, from) {   // the next date of an occasion, today included
    const th = THEMES[id]; from = from || new Date(); const d0 = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    for (const y of [d0.getFullYear(), d0.getFullYear() + 1]) { const d = th.when(y); if (d >= d0) return d; }
    return th.when(d0.getFullYear() + 1);
  }
  const daysTo = (id, from) => { from = from || new Date(); const d0 = new Date(from.getFullYear(), from.getMonth(), from.getDate()); return Math.round((next(id, from) - d0) / DAY); };
  const upcoming = from => ORDER.map(id => ({ id, days: daysTo(id, from) })).sort((a, b) => a.days - b.days);
  const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'], WD = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const fmtD = d => WD[d.getDay()] + ' · ' + MON[d.getMonth()] + ' ' + d.getDate();
  // copy helpers: {brand}, {YEAR}
  const fill = (s, id) => String(s || '').replace(/\{brand\}/g, BRAND.name || '').replace(/\{YEAR\}/g, String(next(id).getFullYear()));
  // industry offer lines for the holiday special (invitations, never claims)
  const OFFER = {
    hardscape: ['PLAN YOUR NEXT PROJECT', 'Book a design consultation'], fencing: ['PLAN YOUR NEW FENCE', 'Get your estimate today'], detailing: ['A FRESH SHINE FOR {H}', 'Book your detail today'],
    barbershop: ['LOOK SHARP FOR {H}', 'Book your cut today'], landscaping: ['A YARD READY FOR {H}', 'Get your quote today'], roofing: ['A ROOF READY FOR THE SEASON', 'Book an inspection today'],
    cleaning: ['A CLEAN HOME FOR {H}', 'Book your cleaning today'], pressure: ['CURB APPEAL FOR {H}', 'Get your quote today'], restaurant: ['CELEBRATE WITH US', 'Join us this season'],
    general: ['CELEBRATE WITH US', 'Visit us this season'],
  };
  const offer = id => (OFFER[BRAND.industry || (BRAND.parts ? 'hardscape' : 'general')] || OFFER.general).map(s => s.replace('{H}', THEMES[id].H));

  // ------------------------------------------------------------------------------------------ shapes
  function heart(c, s) { c.beginPath(); c.moveTo(0, 0.45 * s); c.bezierCurveTo(-0.15 * s, 0.3 * s, -0.55 * s, 0.1 * s, -0.55 * s, -0.15 * s); c.bezierCurveTo(-0.55 * s, -0.45 * s, -0.15 * s, -0.55 * s, 0, -0.25 * s);
    c.bezierCurveTo(0.15 * s, -0.55 * s, 0.55 * s, -0.45 * s, 0.55 * s, -0.15 * s); c.bezierCurveTo(0.55 * s, 0.1 * s, 0.15 * s, 0.3 * s, 0, 0.45 * s); c.closePath(); }
  const MAPLE = [[0, -1], [0.12, -0.62], [0.38, -0.78], [0.3, -0.4], [0.72, -0.5], [0.58, -0.22], [0.95, -0.1], [0.55, 0.12], [0.66, 0.34], [0.25, 0.25], [0.1, 0.48], [0.04, 0.48], [0.04, 0.95], [-0.04, 0.95], [-0.04, 0.48], [-0.1, 0.48], [-0.25, 0.25], [-0.66, 0.34], [-0.55, 0.12], [-0.95, -0.1], [-0.58, -0.22], [-0.72, -0.5], [-0.3, -0.4], [-0.38, -0.78], [-0.12, -0.62]];
  function poly(c, pts, s) { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x * s, y * s) : c.moveTo(x * s, y * s))); c.closePath(); }
  function star(c, s, n, inner) { n = n || 5; inner = inner || 0.45; c.beginPath(); for (let k = 0; k < n * 2; k++) { const r = k % 2 ? s * inner : s, a = -Math.PI / 2 + k * Math.PI / n; k ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); }
  function petal(c, s) { c.beginPath(); c.moveTo(0, -s); c.bezierCurveTo(s * 0.55, -s * 0.6, s * 0.5, s * 0.5, 0, s); c.bezierCurveTo(-s * 0.5, s * 0.5, -s * 0.55, -s * 0.6, 0, -s); c.closePath(); }
  function flake(c, s) {
    c.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3, cx = Math.cos(a), sy = Math.sin(a); c.moveTo(0, 0); c.lineTo(cx * s, sy * s);
      for (const u of [0.45, 0.7]) { const bx = cx * s * u, by = sy * s * u, l = s * (0.32 - u * 0.18); for (const d of [-1, 1]) { const b = a + d * 0.8; c.moveTo(bx, by); c.lineTo(bx + Math.cos(b) * l, by + Math.sin(b) * l); } } }
    c.stroke();
  }
  function shamrock(c, s) { for (let k = 0; k < 3; k++) { c.save(); c.rotate(k * TAU / 3); c.translate(0, -s * 0.42); heart(c, s * 0.82); c.fill(); c.restore(); } c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(s * 0.15, s * 0.6, s * 0.35, s * 0.95); c.lineWidth = s * 0.12; c.stroke(); }

  // ------------------------------------------------------------------------------------------ particles
  // o: {amt (density), alpha, cols, area: [y0, y1]}
  const A = o => (o && o.alpha !== undefined ? o.alpha : 1);
  const P = {
    snow(t, o) {
      const n = Math.round(110 * (o.amt || 1)), c = G(), col = LIGHTPAL ? '#B9CCE0' : '#FFFFFF', sp = glow(col, 32);
      c.strokeStyle = col; c.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const z = R(i, 1), sz = 3 + z * z * 15, v = 45 + z * 130, x0 = R(i, 2) * (W + 200) - 100, y = mod(R(i, 3) * (H + 200) + t * v, H + 200) - 100;
        const x = x0 + Math.sin(t * (0.35 + R(i, 4) * 0.8) + R(i, 5) * TAU) * (18 + z * 36);
        c.globalAlpha = (0.3 + 0.7 * z) * A(o);
        if (sz > 11 && R(i, 6) > 0.55) { c.save(); c.translate(x, y); c.rotate(t * (0.2 + R(i, 7) * 0.6) + i); c.lineWidth = Math.max(1.4, sz * 0.09); flake(c, sz * 1.25); c.restore(); }
        else c.drawImage(sp, x - sz * 1.4, y - sz * 1.4, sz * 2.8, sz * 2.8);
      }
      D();
    },
    hearts(t, o) {
      const n = Math.round(26 * (o.amt || 1)), c = G(), cols = o.cols || [OR, ACC2, '#FF8FB1'];
      for (let i = 0; i < n; i++) {
        const z = R(i, 1), s = 22 + z * 50, v = 60 + z * 90, y = H + 80 - mod(R(i, 3) * (H + 240) + t * v, H + 240), x = R(i, 2) * W + Math.sin(t * 0.9 + R(i, 5) * TAU) * 34;
        c.save(); c.translate(x, y); c.rotate(Math.sin(t * 1.2 + i) * 0.28); c.globalAlpha = (0.45 + 0.55 * z) * A(o);
        heart(c, s); const col = cols[i % cols.length], gr = c.createLinearGradient(-s * 0.5, -s * 0.5, s * 0.5, s * 0.5); gr.addColorStop(0, mix(col, '#FFFFFF', 0.35)); gr.addColorStop(1, col); c.fillStyle = gr; c.fill(); c.restore();
      }
      D();
    },
    leaves(t, o) {
      const n = Math.round(30 * (o.amt || 1)), c = G(), cols = o.cols || ['#D9622B', '#E8A33D', '#B23A1E', '#8C4A1F', '#C9A227'];
      for (let i = 0; i < n; i++) {
        const z = R(i, 1), s = 20 + z * 34, v = 70 + z * 110, y = mod(R(i, 3) * (H + 240) + t * v, H + 240) - 120, x = R(i, 2) * (W + 120) - 60 + Math.sin(t * 0.7 + R(i, 5) * TAU) * (50 + z * 60);
        c.save(); c.translate(x, y); c.rotate(t * (0.6 + R(i, 6)) * (R(i, 8) > 0.5 ? 1 : -1) + i); c.scale(Math.cos(t * (1.3 + R(i, 7) * 1.4) + i), 1);
        c.globalAlpha = (0.55 + 0.45 * z) * A(o); poly(c, MAPLE, s); const col = cols[i % cols.length]; c.fillStyle = col; c.fill();
        c.strokeStyle = mix(col, '#000000', 0.3); c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, s * 0.9); c.lineTo(0, -s * 0.7); c.stroke(); c.restore();
      }
      D();
    },
    confetti(t, o) {
      const n = Math.round(90 * (o.amt || 1)), c = G(), cols = o.cols || [OR, ACC2, WHT];
      for (let i = 0; i < n; i++) {
        const z = R(i, 1), w = 9 + z * 14, v = 110 + z * 170, y = mod(R(i, 3) * (H + 200) + t * v, H + 200) - 100, x = R(i, 2) * W + Math.sin(t * 1.6 + R(i, 5) * TAU) * 30;
        c.save(); c.translate(x, y); c.rotate(t * (1.5 + R(i, 6) * 3) + i); c.scale(1, Math.cos(t * (5 + R(i, 7) * 5) + i)); c.globalAlpha = (0.65 + 0.35 * z) * A(o); c.fillStyle = cols[i % cols.length];
        if (R(i, 9) > 0.75) { c.beginPath(); c.arc(0, 0, w * 0.38, 0, TAU); c.fill(); } else c.fillRect(-w / 2, -w * 0.22, w, w * 0.44);
        c.restore();
      }
      D();
    },
    sparkles(t, o) {
      const n = Math.round(46 * (o.amt || 1)), c = G(), cols = o.cols || [ACC2, OR, WHT];
      for (let i = 0; i < n; i++) {
        const tw = Math.pow(Math.max(0, Math.sin(t * (1.6 + R(i, 4) * 2) + R(i, 5) * TAU)), 3); if (tw < 0.02) continue;
        const s = 7 + R(i, 1) * 16, x = R(i, 2) * W, y = mod(R(i, 3) * H - t * (8 + R(i, 6) * 18), H), col = cols[i % cols.length];
        c.globalAlpha = tw * A(o); c.drawImage(glow(col, 32), x - s * 2.2, y - s * 2.2, s * 4.4, s * 4.4);
        c.save(); c.translate(x, y); c.rotate(R(i, 7)); c.fillStyle = mix(col, '#FFFFFF', 0.5); star(c, s * (0.7 + 0.3 * tw), 4, 0.18); c.fill(); c.restore();
      }
      D();
    },
    stars(t, o) {
      const n = Math.round(34 * (o.amt || 1)), c = G(), cols = o.cols || [WHT, ACC2, OR];
      for (let i = 0; i < n; i++) {
        const z = R(i, 1), s = 7 + z * 16, v = 25 + z * 50, y = mod(R(i, 3) * (H + 100) + t * v, H + 100) - 50, x = R(i, 2) * W + Math.sin(t * 0.5 + i) * 14;
        c.save(); c.translate(x, y); c.rotate(t * 0.4 * (R(i, 6) - 0.5) + i); c.globalAlpha = (0.4 + 0.5 * z) * (0.75 + 0.25 * Math.sin(t * 3 + i)) * A(o);
        c.fillStyle = cols[i % cols.length]; star(c, s, 5, 0.45); c.fill(); c.restore();
      }
      D();
    },
    shamrocks(t, o) {
      const n = Math.round(24 * (o.amt || 1)), c = G(), cols = o.cols || ['#3DDC84', '#1E9E5A', '#A7F3C4'];
      for (let i = 0; i < n; i++) {
        const z = R(i, 1), s = 18 + z * 30, v = 60 + z * 90, y = mod(R(i, 3) * (H + 200) + t * v, H + 200) - 100, x = R(i, 2) * W + Math.sin(t * 0.8 + i) * 40;
        c.save(); c.translate(x, y); c.rotate(t * (0.5 + R(i, 6)) + i); c.scale(Math.cos(t * 1.4 + i) * 0.3 + 0.7, 1); c.globalAlpha = (0.55 + 0.45 * z) * A(o);
        c.fillStyle = c.strokeStyle = cols[i % cols.length]; shamrock(c, s); c.restore();
      }
      D();
    },
    petals(t, o) {
      const n = Math.round(40 * (o.amt || 1)), c = G(), cols = o.cols || ['#F6A6C1', '#FFD1DC', '#FFFFFF'];
      for (let i = 0; i < n; i++) {
        const z = R(i, 1), s = 9 + z * 15, v = 50 + z * 90, y = mod(R(i, 3) * (H + 200) + t * v, H + 200) - 100, x = R(i, 2) * (W + 160) - 80 + Math.sin(t * 0.9 + R(i, 5) * TAU) * (40 + z * 50);
        c.save(); c.translate(x, y); c.rotate(t * (0.8 + R(i, 6)) + i); c.scale(Math.cos(t * (1.6 + R(i, 7)) + i), 1); c.globalAlpha = (0.55 + 0.45 * z) * A(o);
        const col = cols[i % cols.length], gr = c.createLinearGradient(0, -s, 0, s); gr.addColorStop(0, mix(col, '#FFFFFF', 0.4)); gr.addColorStop(1, col); c.fillStyle = gr; petal(c, s); c.fill(); c.restore();
      }
      D();
    },
    marigold(t, o) { P.petals(t, Object.assign({ cols: ['#FF9A1F', '#FFC93C', '#FF7A00', '#E83F8C'] }, o, { amt: (o.amt || 1) * 1.3 })); },
    bats(t, o) {
      const n = Math.round(8 * (o.amt || 1)), c = G(), body = LIGHTPAL ? '#2A1838' : '#05030A';
      for (let i = 0; i < n; i++) {
        const z = R(i, 1), s = 22 + z * 34, dir = R(i, 2) > 0.5 ? 1 : -1, v = (90 + z * 120) * dir, span = W + 400;
        const x = mod(R(i, 3) * span + t * v, span) - 200, y = 180 + R(i, 4) * 700 + Math.sin(t * (1.2 + R(i, 5)) + i) * 50, f = Math.sin(t * (12 + R(i, 6) * 6) + i);
        c.save(); c.translate(x, y); c.scale(dir, 1); c.globalAlpha = (0.7 + 0.3 * z) * A(o); c.fillStyle = body; c.strokeStyle = hexA(OR, 0.35); c.lineWidth = 1.5;
        c.beginPath(); c.ellipse(0, 0, s * 0.16, s * 0.28, 0, 0, TAU); c.fill();
        for (const sd of [-1, 1]) { const wy = -f * s * 0.45; c.beginPath(); c.moveTo(0, -s * 0.08); c.quadraticCurveTo(sd * s * 0.5, wy - s * 0.25, sd * s * 1.1, wy);
          c.quadraticCurveTo(sd * s * 0.85, wy + s * 0.12, sd * s * 0.75, wy + s * 0.3); c.quadraticCurveTo(sd * s * 0.55, wy + s * 0.12, sd * s * 0.4, wy + s * 0.3); c.quadraticCurveTo(sd * s * 0.28, wy + s * 0.1, 0, s * 0.12); c.closePath(); c.fill(); c.stroke(); }
        c.restore();
      }
      D();
    },
    embers(t, o) {
      const n = Math.round(36 * (o.amt || 1)), c = G();
      for (let i = 0; i < n; i++) {
        const z = R(i, 1), s = 3 + z * 7, v = 40 + z * 90, y = H + 40 - mod(R(i, 3) * (H + 80) + t * v, H + 80), x = R(i, 2) * W + Math.sin(t * 1.4 + i) * 26;
        c.globalAlpha = (0.35 + 0.65 * Math.abs(Math.sin(t * 4 + i * 1.7))) * (0.4 + 0.6 * z) * A(o); c.drawImage(glow(OR, 32), x - s * 3, y - s * 3, s * 6, s * 6);
      }
      D();
    },
    coins(t, o) {
      const n = Math.round(18 * (o.amt || 1)), c = G();
      for (let i = 0; i < n; i++) {
        const z = R(i, 1), s = 14 + z * 18, v = 120 + z * 160, y = mod(R(i, 3) * (H + 200) + t * v, H + 200) - 100, x = R(i, 2) * W;
        c.save(); c.translate(x, y); c.scale(Math.cos(t * (3 + R(i, 6) * 3) + i), 1); c.globalAlpha = (0.7 + 0.3 * z) * A(o);
        const gr = c.createLinearGradient(-s, -s, s, s); gr.addColorStop(0, '#FFF1A8'); gr.addColorStop(0.5, '#E2B33C'); gr.addColorStop(1, '#9C6B12'); c.fillStyle = gr; c.beginPath(); c.arc(0, 0, s, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(120,80,10,0.6)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, s * 0.72, 0, TAU); c.stroke(); c.restore();
      }
      D();
    },
  };

  // ------------------------------------------------------------------------------------------ decorations
  // o: {p (0..1 entrance), q (0..1 exit), cols, y (top offset), x, cx, cy, size, lit}
  function cat(x0, x1, y, sag, u) { return [lerp(x0, x1, u), y + sag * 4 * u * (1 - u)]; }   // a hanging string (parabola)
  const DEC = {
    lights(t, o) {   // string lights in two swags across the top, twinkling
      const c = G(), cols = o.cols || ['#FF3B3B', '#2ECC71', '#FFC83D', '#3DA5FF', '#FF7AD9'], p = E.outBack(clamp(o.p === undefined ? 1 : o.p)), q = clamp(o.q || 0);
      c.globalAlpha = 1 - q; c.translate(0, -(1 - p) * 260 + (o.y || 0));
      const swags = [[-60, W * 0.55, 40, 150], [W * 0.45, W + 60, 40, 130]];
      swags.forEach(([x0, x1, y0, sag0], s) => {
        const sag = sag0 + Math.sin(t * 1.1 + s) * 6;
        c.strokeStyle = LIGHTPAL ? 'rgba(40,40,40,0.75)' : 'rgba(10,14,10,0.9)'; c.lineWidth = 4; c.beginPath();
        for (let k = 0; k <= 30; k++) { const [x, y] = cat(x0, x1, y0, sag, k / 30); k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
        const nb = Math.round((x1 - x0) / 66);
        for (let k = 1; k < nb; k++) {
          const u = k / nb, [x, y] = cat(x0, x1, y0, sag, u), dy = 8 * sag * (1 - 2 * u) / (x1 - x0), ang = Math.atan(dy) + Math.sin(t * 2 + k) * 0.08;
          const col = cols[(k + s * 2) % cols.length], tw = 0.62 + 0.38 * Math.sin(t * (2.2 + R(k + s * 50, 1) * 2) + k * 1.7);
          c.save(); c.translate(x, y); c.rotate(ang);
          c.globalAlpha = (1 - q) * tw * 0.9; c.drawImage(glow(col, 48), -46, -8, 92, 92);
          c.globalAlpha = 1 - q; c.fillStyle = '#2B2B2B'; c.fillRect(-5, -2, 10, 10);
          const gr = c.createRadialGradient(-3, 16, 1, 0, 20, 14); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.35, mix(col, '#FFFFFF', 0.3)); gr.addColorStop(1, col);
          c.fillStyle = gr; c.beginPath(); c.ellipse(0, 22, 8.5, 14, 0, 0, TAU); c.fill(); c.restore();
        }
      });
      D();
    },
    ornaments(t, o) {   // baubles on strings, swinging
      const c = G(), cols = o.cols || [OR, ACC2, '#C0C8D2'], p = clamp(o.p === undefined ? 1 : o.p), q = clamp(o.q || 0);
      const SET = o.set || [[0.1, 260, 44], [0.27, 420, 34], [0.74, 330, 48], [0.9, 210, 36]];
      SET.forEach(([fx, len, r], i) => {
        const e = E.outBack(clamp(p * 1.4 - i * 0.12)); if (e <= 0) return;
        const ang = Math.sin(t * (1.1 + i * 0.13) + i * 1.9) * 0.07, L = len * e, x0 = fx * W, col = cols[i % cols.length];
        c.save(); c.globalAlpha = 1 - q; c.translate(x0, -10); c.rotate(ang);
        c.strokeStyle = LIGHTPAL ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, L); c.stroke();
        c.translate(0, L + r); c.fillStyle = '#C9A44C'; c.fillRect(-r * 0.22, -r - 12, r * 0.44, 14);
        const gr = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r); gr.addColorStop(0, mix(col, '#FFFFFF', 0.65)); gr.addColorStop(0.45, col); gr.addColorStop(1, mix(col, '#000000', 0.55));
        c.fillStyle = gr; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
        c.strokeStyle = hexA('#FFFFFF', 0.35); c.lineWidth = 3; c.beginPath(); c.ellipse(0, 0, r, r * 0.28, 0, 0, Math.PI); c.stroke();
        c.globalAlpha = (1 - q) * 0.8; c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(-r * 0.38, -r * 0.42, r * 0.16, r * 0.1, -0.6, 0, TAU); c.fill(); c.restore();
      });
      D();
    },
    bunting(t, o) {   // pennant flags in two swags
      const c = G(), cols = o.cols || [OR, '#FFFFFF', ACC2], p = E.outBack(clamp(o.p === undefined ? 1 : o.p)), q = clamp(o.q || 0);
      c.globalAlpha = 1 - q; c.translate(0, -(1 - p) * 240 + (o.y || 0));
      [[-40, W * 0.56, 30, 120], [W * 0.44, W + 40, 30, 110]].forEach(([x0, x1, y0, sag], s) => {
        c.strokeStyle = LIGHTPAL ? 'rgba(60,60,60,0.7)' : 'rgba(255,255,255,0.7)'; c.lineWidth = 3; c.beginPath();
        for (let k = 0; k <= 24; k++) { const [x, y] = cat(x0, x1, y0, sag, k / 24); k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
        const nb = Math.round((x1 - x0) / 72);
        for (let k = 0; k < nb; k++) {
          const u0 = (k + 0.1) / nb, u1 = (k + 0.9) / nb, [ax, ay] = cat(x0, x1, y0, sag, u0), [bx, by] = cat(x0, x1, y0, sag, u1), mx = (ax + bx) / 2, my = (ay + by) / 2;
          const fl = Math.sin(t * 3.2 + k * 0.9 + s) * 7, col = cols[(k + s) % cols.length];
          c.fillStyle = col; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.lineTo(mx + fl, my + 78); c.closePath(); c.fill();
          c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.moveTo(mx, my); c.lineTo(bx, by); c.lineTo(mx + fl, my + 78); c.closePath(); c.fill();
        }
      });
      D();
    },
    papel(t, o) {   // papel picado: cut-paper flags with patterns
      const c = G(), cols = o.cols || ['#FF4F79', '#FF9A1F', '#FFC93C', '#2EC4B6', '#7B61FF', '#3DDC84'], p = E.outBack(clamp(o.p === undefined ? 1 : o.p)), q = clamp(o.q || 0);
      c.globalAlpha = 1 - q; c.translate(0, -(1 - p) * 280 + (o.y || 0));
      const n = 8, w = W / n, y0 = 36;
      c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, y0); c.lineTo(W, y0); c.stroke();
      for (let k = 0; k < n; k++) {
        const col = cols[k % cols.length], x = k * w + 6, fw = w - 12, fh = 170, sk = Math.sin(t * 2.4 + k * 1.3) * 0.05;
        c.save(); c.translate(x + fw / 2, y0); c.transform(1, 0, sk, 1, 0, 0); c.drawImage(papelTile(col, Math.round(fw), fh), -fw / 2, 0, fw, fh); c.restore();
      }
      D();
    },
    webs(t, o) {   // spider webs in the top corners, with a dangling spider
      const c = G(), q = clamp(o.q || 0), p = clamp(o.p === undefined ? 1 : o.p); c.globalAlpha = (1 - q) * p;
      c.strokeStyle = LIGHTPAL ? 'rgba(50,40,60,0.45)' : 'rgba(255,255,255,0.4)'; c.lineWidth = 2;
      for (const sd of [0, 1]) {
        c.save(); if (sd) { c.translate(W, 0); c.scale(-1, 1); }
        const R0 = 330, sp = 7; for (let k = 0; k <= sp; k++) { const a = k / sp * Math.PI / 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * R0, Math.sin(a) * R0); c.stroke(); }
        for (let r = 50; r < R0; r += 46) { c.beginPath(); for (let k = 0; k <= sp; k++) { const a = k / sp * Math.PI / 2, rr = r - (k % 2 ? 0 : 8); const x = Math.cos(a) * rr, y = Math.sin(a) * rr; k ? c.quadraticCurveTo(Math.cos(a - 0.11) * (rr - 12), Math.sin(a - 0.11) * (rr - 12), x, y) : c.moveTo(x, y); } c.stroke(); }
        c.restore();
      }
      const sy = 260 + Math.sin(t * 1.3) * 60, sx = W - 210; c.beginPath(); c.moveTo(sx, 0); c.lineTo(sx, sy); c.stroke();
      c.fillStyle = LIGHTPAL ? '#2A1838' : '#0A0610'; c.beginPath(); c.arc(sx, sy + 14, 13, 0, TAU); c.fill(); c.beginPath(); c.arc(sx, sy, 9, 0, TAU); c.fill();
      c.lineWidth = 2.5; for (let k = 0; k < 4; k++) for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sx, sy + 10); c.quadraticCurveTo(sx + sd * 20, sy + k * 6, sx + sd * 26, sy + 16 + k * 8); c.stroke(); }
      D();
    },
    florals(t, o) {   // flower clusters in two corners
      const c = G(), cols = o.cols || [OR, ACC2, '#FFFFFF'], p = clamp(o.p === undefined ? 1 : o.p), q = clamp(o.q || 0);
      const spots = o.spots || [[-20, -10, 1], [W + 20, H * 0.62, -1]];
      spots.forEach(([cx, cy, sd], j) => {
        for (let i = 0; i < 7; i++) {
          const e = E.outBack(clamp(p * 1.5 - i * 0.07)); if (e <= 0) continue;
          const a = (i / 7) * Math.PI * 0.9 + (sd > 0 ? 0.1 : Math.PI + 0.1), d = 70 + R(i + j * 9, 1) * 170, x = cx + Math.cos(a) * d * sd * (sd > 0 ? 1 : -1), y = cy + Math.sin(a) * d, s = (30 + R(i + j * 9, 2) * 34) * e;
          c.save(); c.globalAlpha = 1 - q; c.translate(x, y); c.rotate(Math.sin(t * 0.8 + i) * 0.08 + i);
          c.fillStyle = mix('#5E8C61', '#2F5233', R(i, 3)); for (const l of [-0.6, 0.9]) { c.save(); c.rotate(l); c.translate(s * 1.3, 0); c.beginPath(); c.ellipse(0, 0, s * 0.7, s * 0.26, 0, 0, TAU); c.fill(); c.restore(); }
          const col = cols[(i + j) % cols.length];
          for (let k = 0; k < 6; k++) { c.save(); c.rotate(k * TAU / 6); c.translate(0, -s * 0.55); const gr = c.createLinearGradient(0, -s * 0.5, 0, s * 0.5); gr.addColorStop(0, mix(col, '#FFFFFF', 0.45)); gr.addColorStop(1, col); c.fillStyle = gr; petal(c, s * 0.55); c.fill(); c.restore(); }
          c.fillStyle = '#F6D06B'; c.beginPath(); c.arc(0, 0, s * 0.22, 0, TAU); c.fill(); c.restore();
        }
      });
      D();
    },
    stripes(t, o) {   // hazard-stripe bands, moving (sale)
      const c = G(), q = clamp(o.q || 0), p = clamp(o.p === undefined ? 1 : o.p), hh = 64;
      for (const [y, dir] of [[0, 1], [H - hh, -1]]) {
        c.save(); c.globalAlpha = 1 - q; c.beginPath(); c.rect(0, y, W * E.outC(p), hh); c.clip(); c.fillStyle = BLK; c.fillRect(0, y, W, hh); c.fillStyle = OR;
        const off = mod(t * 120 * dir, 80); for (let x = -160 + off; x < W + 160; x += 80) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40, y); c.lineTo(x + 40 - hh, y + hh); c.lineTo(x - hh, y + hh); c.closePath(); c.fill(); }
        c.restore();
      }
      D();
    },
    frost(t, o) {   // frosty corners
      const c = G(), q = clamp(o.q || 0); c.globalAlpha = (1 - q) * 0.9;
      for (const [x, y] of [[0, 0], [W, 0], [0, H], [W, H]]) { const g = c.createRadialGradient(x, y, 0, x, y, 520); g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.4, 'rgba(220,235,255,0.18)'); g.addColorStop(1, 'rgba(220,235,255,0)'); c.fillStyle = g; c.fillRect(x - 520, y - 520, 1040, 1040); }
      D();
    },
    // ---- larger pieces (holiday templates place these)
    bokeh(t, o) {   // big soft lights drifting behind everything
      const c = G(), cols = o.cols || [OR, ACC2, WHT], n = o.n || 14, q = clamp(o.q || 0);
      c.globalCompositeOperation = LIGHTPAL ? 'source-over' : 'lighter';
      for (let i = 0; i < n; i++) {
        const s = 60 + R(i, 1) * 150, x = R(i, 2) * W + Math.sin(t * 0.3 + i) * 40, y = R(i, 3) * H * 0.95 + Math.cos(t * 0.25 + i * 1.3) * 50;
        c.globalAlpha = (0.1 + 0.16 * R(i, 4)) * (0.7 + 0.3 * Math.sin(t * 0.9 + i)) * (1 - q) * A(o); c.drawImage(glow(cols[i % cols.length], 64), x - s, y - s, s * 2, s * 2);
      }
      D();
    },
    moon(t, o) {
      const c = G(), x = o.x || W * 0.74, y = (o.y || 330) + Math.sin(t * 0.3) * 6, r = o.r || 150, p = clamp(o.p === undefined ? 1 : o.p), q = clamp(o.q || 0);
      c.globalAlpha = E.outC(p) * (1 - q); c.drawImage(glow('#FFE7A3', 64), x - r * 3, y - r * 3, r * 6, r * 6);
      const gr = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); gr.addColorStop(0, '#FFF8DC'); gr.addColorStop(1, '#E8D28E'); c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      c.fillStyle = 'rgba(160,130,70,0.22)'; [[-0.3, -0.2, 0.22], [0.25, 0.1, 0.16], [-0.05, 0.38, 0.12], [0.4, -0.35, 0.1]].forEach(([a, b, s]) => { c.beginPath(); c.arc(x + a * r, y + b * r, s * r, 0, TAU); c.fill(); });
      D();
    },
    pumpkins(t, o) {   // jack-o'-lanterns along the bottom, flickering
      const c = G(), p = clamp(o.p === undefined ? 1 : o.p), q = clamp(o.q || 0), base = o.y || H - 120;
      [[150, 1.0], [W - 170, 1.25], [W - 360, 0.8]].forEach(([x, s], i) => {
        const e = E.outBack(clamp(p * 1.4 - i * 0.15)); if (e <= 0) return; const r = 110 * s * e, y = base - r * 0.6, fl = 0.75 + 0.25 * Math.sin(t * 13 + i * 2) * Math.sin(t * 7.3 + i);
        c.save(); c.globalAlpha = 1 - q; c.drawImage(glow('#FF8A1F', 64), x - r * 2.4, y - r * 2, r * 4.8, r * 4);
        for (const [dx, w] of [[-0.45, 0.62], [0.45, 0.62], [0, 0.72]]) { const gr = c.createRadialGradient(x + dx * r - r * 0.2, y - r * 0.3, r * 0.1, x + dx * r, y, r); gr.addColorStop(0, '#FFB15C'); gr.addColorStop(0.6, '#F26B12'); gr.addColorStop(1, '#9A3A06'); c.fillStyle = gr; c.beginPath(); c.ellipse(x + dx * r, y, r * w, r * 0.62, 0, 0, TAU); c.fill(); }
        c.fillStyle = '#4A5D23'; c.beginPath(); c.roundRect(x - r * 0.08, y - r * 0.8, r * 0.16, r * 0.26, 6); c.fill();
        c.fillStyle = `rgba(255,${190 + 40 * fl | 0},80,${0.75 + 0.25 * fl})`;
        for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(x + sd * r * 0.32, y - r * 0.32); c.lineTo(x + sd * r * 0.14, y - r * 0.08); c.lineTo(x + sd * r * 0.48, y - r * 0.08); c.closePath(); c.fill(); }
        c.beginPath(); c.moveTo(x - r * 0.5, y + r * 0.1); for (let k = 0; k <= 8; k++) c.lineTo(x - r * 0.5 + k * r * 0.125, y + r * (k % 2 ? 0.22 : 0.12)); for (let k = 8; k >= 0; k--) c.lineTo(x - r * 0.5 + k * r * 0.125, y + r * (k % 2 ? 0.34 : 0.42) - r * 0.02 * Math.abs(k - 4)); c.closePath(); c.fill();
        c.restore();
      });
      D();
    },
    candles(t, o) {   // a row of candles with flickering flames
      const c = G(), p = clamp(o.p === undefined ? 1 : o.p), q = clamp(o.q || 0), base = o.y || H - 90, xs = o.xs || [120, 250, 380, W - 380, W - 250, W - 120];
      xs.forEach((x, i) => {
        const e = E.outC(clamp(p * 1.5 - i * 0.1)); if (e <= 0) return; const h = (110 + R(i, 1) * 110) * e, w = 40, top = base - h, fl = Math.sin(t * 11 + i * 3) * 0.12 + Math.sin(t * 17 + i) * 0.06;
        c.save(); c.globalAlpha = 1 - q; c.drawImage(glow('#FFB347', 64), x - 140, top - 170, 280, 280);
        const gr = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gr.addColorStop(0, '#E9D9BC'); gr.addColorStop(0.5, '#FFF6E6'); gr.addColorStop(1, '#D8C6A3'); c.fillStyle = gr; c.fillRect(x - w / 2, top, w, h);
        c.translate(x, top - 6); c.rotate(fl); const fg = c.createRadialGradient(0, -18, 2, 0, -14, 30); fg.addColorStop(0, '#FFFFFF'); fg.addColorStop(0.3, '#FFE08A'); fg.addColorStop(1, 'rgba(255,140,30,0)');
        c.fillStyle = fg; c.beginPath(); c.moveTo(0, -52); c.bezierCurveTo(16, -26, 14, 0, 0, 2); c.bezierCurveTo(-14, 0, -16, -26, 0, -52); c.fill(); c.restore();
      });
      D();
    },
    menorah(t, o) {   // a menorah whose candles light one by one (o.lit 0..1)
      const c = G(), cx = o.cx || W / 2, base = o.y || 1640, sc = o.size || 1, p = clamp(o.p === undefined ? 1 : o.p), q = clamp(o.q || 0), lit = clamp(o.lit === undefined ? 1 : o.lit);
      c.globalAlpha = E.outC(p) * (1 - q); c.translate(cx, base); c.scale(sc, sc);
      const metal = c.createLinearGradient(-340, 0, 340, 0); metal.addColorStop(0, '#9AA6B8'); metal.addColorStop(0.5, '#F4F7FB'); metal.addColorStop(1, '#8792A6');
      c.strokeStyle = metal; c.fillStyle = metal; c.lineWidth = 12; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -300); c.stroke(); c.fillRect(-120, -14, 240, 22); c.beginPath(); c.ellipse(0, 6, 150, 18, 0, 0, TAU); c.fill();
      for (let k = 1; k <= 4; k++) { const r = k * 72; c.beginPath(); c.arc(0, -300, r, Math.PI * 0.02, Math.PI * 0.98); c.stroke(); }
      const xs = [-288, -216, -144, -72, 0, 72, 144, 216, 288], order = [4, 8, 7, 6, 5, 3, 2, 1, 0];
      xs.forEach((x, k) => {
        const top = k === 4 ? -400 : -310; c.fillStyle = metal; c.fillRect(x - 20, top - 6, 40, 14);
        c.fillStyle = k % 2 ? '#E3E8F2' : OR; c.fillRect(x - 10, top - 90, 20, 84);
        const on = order.indexOf(k) < Math.round(lit * 9); if (!on) return; const fl = Math.sin(t * 12 + k) * 0.1;
        c.save(); c.drawImage(glow('#FFD27A', 48), x - 70, top - 190, 140, 140); c.translate(x, top - 92); c.rotate(fl);
        const fg = c.createRadialGradient(0, -14, 1, 0, -12, 22); fg.addColorStop(0, '#FFFFFF'); fg.addColorStop(0.35, '#FFE08A'); fg.addColorStop(1, 'rgba(255,150,40,0)'); c.fillStyle = fg;
        c.beginPath(); c.moveTo(0, -40); c.bezierCurveTo(12, -20, 11, 0, 0, 2); c.bezierCurveTo(-11, 0, -12, -20, 0, -40); c.fill(); c.restore();
      });
      D();
    },
    fireworks(t, o) {   // bursts on a schedule, with gravity and fading sparks
      const c = G(), cols = o.cols || [OR, ACC2, WHT], period = 5.2, q = clamp(o.q || 0), y0 = o.y0 || 160, y1 = o.y1 || 760;
      c.globalCompositeOperation = LIGHTPAL ? 'source-over' : 'lighter';
      for (let k = 0; k < 7; k++) {
        const st = R(k, 1) * period, tau = mod(t - st, period); if (tau > 2.0) continue; const cyc = Math.floor((t - st) / period);
        const sd = k * 31 + cyc * 7, x = W * (0.14 + 0.72 * R(sd, 2)), y = y0 + (y1 - y0) * R(sd, 3), col = cols[(k + cyc) % cols.length], N = 40, v = 260 + 160 * R(sd, 4);
        if (tau < 0.45) { const u = tau / 0.45, yy = lerp(H * 0.9, y, E.outC(u)); c.globalAlpha = (1 - q) * 0.8; c.drawImage(glow(col, 32), x - 12, yy - 12, 24, 24); continue; }
        const s = tau - 0.45, a = Math.max(0, 1 - s / 1.5) * (1 - q);
        if (s < 0.15) { c.globalAlpha = a * (1 - s / 0.15) * 0.6; c.drawImage(glow(col, 64), x - 160, y - 160, 320, 320); }
        for (let i = 0; i < N; i++) {
          const ang = i / N * TAU + R(sd, 5), sp = v * (0.7 + 0.3 * R(sd + i, 6)), d = sp * (1 - Math.exp(-s * 2.2)) / 2.2, px = x + Math.cos(ang) * d, py = y + Math.sin(ang) * d + 60 * s * s;
          c.globalAlpha = a * (0.6 + 0.4 * Math.sin(s * 30 + i)); c.drawImage(glow(i % 3 ? col : '#FFFFFF', 32), px - 7, py - 7, 14, 14);
        }
      }
      D();
    },
    balloons(t, o) {   // balloons rising from the bottom
      const c = G(), cols = o.cols || [OR, ACC2, WHT], n = o.n || 7, q = clamp(o.q || 0);
      for (let i = 0; i < n; i++) {
        const z = R(i, 1), r = 46 + z * 34, v = 60 + z * 40, y = H + 200 - mod(R(i, 3) * (H + 500) + t * v, H + 500), x = W * (0.08 + 0.84 * R(i, 2)) + Math.sin(t * 0.9 + i) * 24, col = cols[i % cols.length];
        c.save(); c.globalAlpha = (1 - q) * (0.85 + 0.15 * z); c.strokeStyle = LIGHTPAL ? 'rgba(60,60,60,0.5)' : 'rgba(255,255,255,0.5)'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(x, y + r * 1.15); for (let k = 1; k <= 8; k++) c.lineTo(x + Math.sin(k * 1.2 + t * 2 + i) * 8, y + r * 1.15 + k * 26); c.stroke();
        const gr = c.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.1, x, y, r * 1.2); gr.addColorStop(0, mix(col, '#FFFFFF', 0.7)); gr.addColorStop(0.5, col); gr.addColorStop(1, mix(col, '#000000', 0.45));
        c.fillStyle = gr; c.beginPath(); c.ellipse(x, y, r, r * 1.18, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(x - 8, y + r * 1.24); c.lineTo(x + 8, y + r * 1.24); c.lineTo(x, y + r * 1.12); c.fill(); c.restore();
      }
      D();
    },
    flag(t, o) {   // a waving stripe ribbon along the bottom with a star field
      const c = G(), q = clamp(o.q || 0), p = clamp(o.p === undefined ? 1 : o.p), y0 = o.y || H - 300, hh = 230, red = OR;
      c.globalAlpha = (1 - q) * 0.9 * E.outC(p); const wave = x => Math.sin(x / 210 + t * 2.2) * 18 + Math.sin(x / 90 + t * 3.1) * 5;
      for (let k = 0; k < 7; k++) { c.fillStyle = k % 2 ? '#F4F6FA' : red; c.beginPath(); const a = y0 + k * hh / 7, b = a + hh / 7;
        c.moveTo(0, a + wave(0)); for (let x = 0; x <= W; x += 30) c.lineTo(x, a + wave(x)); for (let x = W; x >= 0; x -= 30) c.lineTo(x, b + wave(x)); c.closePath(); c.fill(); }
      c.fillStyle = '#1B2A4A'; c.beginPath(); c.moveTo(0, y0 + wave(0)); for (let x = 0; x <= 420; x += 30) c.lineTo(x, y0 + wave(x)); for (let x = 420; x >= 0; x -= 30) c.lineTo(x, y0 + hh * 0.58 + wave(x)); c.closePath(); c.fill();
      c.fillStyle = '#FFFFFF'; for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) { const x = 40 + k * 64 + (r % 2) * 32, y = y0 + 30 + r * 40 + wave(x); c.save(); c.translate(x, y); star(c, 9, 5, 0.45); c.fill(); c.restore(); }
      const sh = c.createLinearGradient(0, y0 - 40, 0, y0 + hh + 40); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.25)'); c.fillStyle = sh; c.fillRect(0, y0 - 40, W, hh + 80);
      D();
    },
    burst(t, o) {   // a rotating starburst (sale badge backing)
      const c = G(), cx = o.cx || W / 2, cy = o.cy || 820, r = o.r || 420, p = clamp(o.p === undefined ? 1 : o.p), q = clamp(o.q || 0);
      c.globalAlpha = (1 - q) * 0.9; c.translate(cx, cy); c.rotate(t * 0.25); c.scale(E.outBack(p), E.outBack(p)); c.fillStyle = hexA(OR, 0.16);
      for (let k = 0; k < 18; k++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r, k * TAU / 18, (k + 0.5) * TAU / 18); c.closePath(); c.fill(); }
      D();
    },
  };
  const PT = new Map();
  function papelTile(col, w, h) {   // one papel picado flag, cut out once and cached
    const k = col + w + 'x' + h; if (PT.has(k)) return PT.get(k);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
    g.fillStyle = col; g.fillRect(0, 0, w, h - 18); for (let x = 0; x < w; x += 18) { g.beginPath(); g.arc(x + 9, h - 18, 9, 0, Math.PI); g.fill(); }
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.arc(w / 2, h * 0.42, w * 0.18, 0, TAU); g.fill();
    g.globalCompositeOperation = 'source-over'; g.fillStyle = col; for (let k = 0; k < 8; k++) { g.save(); g.translate(w / 2, h * 0.42); g.rotate(k * TAU / 8); g.beginPath(); g.ellipse(0, -w * 0.1, w * 0.035, w * 0.08, 0, 0, TAU); g.fill(); g.restore(); }
    g.globalCompositeOperation = 'destination-out';
    for (let x = 14; x < w - 8; x += 22) { g.save(); g.translate(x, 22); g.rotate(Math.PI / 4); g.fillRect(-5, -5, 10, 10); g.restore(); g.beginPath(); g.arc(x, h - 46, 5, 0, TAU); g.fill(); }
    for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(w * (0.18 + k * 0.21), h * 0.75, 7, 0, TAU); g.fill(); }
    PT.set(k, cv); return cv;
  }

  // ------------------------------------------------------------------------------------------ backdrop + overlay
  function backdrop(t, o) {   // the holiday templates' own background: a glow from the top, the theme's bokeh
    o = o || {}; if (VID.collecting) return; const c = G(), g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, DEEP1); g.addColorStop(0.55, BLK); g.addColorStop(1, DEEP2); c.fillStyle = g; c.fillRect(-40, -40, W + 80, H + 80);
    const r = c.createRadialGradient(W / 2, H * 0.36, 40, W / 2, H * 0.36, H * 0.6); r.addColorStop(0, hexA(OR, LIGHTPAL ? 0.12 : 0.18)); r.addColorStop(1, hexA(OR, 0)); c.fillStyle = r; c.fillRect(0, 0, W, H); D();
    if (o.bokeh !== false) DEC.bokeh(t, { cols: o.cols, n: 12, alpha: 0.9 });
  }
  const OVER_DECOR = ['lights', 'bunting', 'papel', 'webs', 'florals', 'frost', 'ornaments'];
  function particles(kind, t, o) { if (!kind || VID.collecting || !P[kind]) return; P[kind](t, o || {}); }
  function decor(kind, t, o) { if (!kind || VID.collecting || !DEC[kind]) return; DEC[kind](t, o || {}); }
  // a seasonal touch over any template: fx = {p: particle kind, d: decoration kind, a: amount 0.4..1.6, cols}
  function overlay(t, fx) {
    if (!fx || VID.collecting) return; const o = { amt: fx.a || 1, cols: fx.cols, p: clamp(t / 0.8) };
    if (fx.d && OVER_DECOR.includes(fx.d)) decor(fx.d, t, Object.assign({}, o, { cols: fx.dcols || fx.cols }));
    if (fx.p) particles(fx.p, t, o);
  }
  // copy defaults for a holiday template
  function copy(id) {
    const th = THEMES[id], d = next(id), dm = n => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
    return { greet: th.greet, kick: fill(th.kick, id), sub: fill(th.sub, id), name: th.name, H: th.H, offer: offer(id), date: d,
      hours: [[fmtD(dm(-1)), '9 AM – 3 PM'], [fmtD(d), 'CLOSED'], [fmtD(dm(1)), 'REGULAR HOURS']], days: daysTo(id) };
  }
  const LIST = ORDER.map(id => ({ id, name: THEMES[id].name }));
  return { THEMES, ORDER, LIST, next, daysTo, upcoming, fmtD, copy, offer, P, DEC, particles, decor, overlay, backdrop, glow, heart, star, petal, mix, hexA, OVER_DECOR,
    PARTICLES: Object.keys(P), DECORS: OVER_DECOR };
})();
