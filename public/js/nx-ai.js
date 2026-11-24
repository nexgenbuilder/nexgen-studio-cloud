'use strict';
/* NexGen Clip Studio: Write with AI. Claude (through the page's sample capability, on the viewer's own account) rewrites the
   open template's lines for the active brand: every line keeps its role, its character limit and its case, and the brand's
   ad rules ride along in the prompt. The result lands as ordinary edits, so Undo and "Use the template's text" still work. */
(() => {
  const A = NX.app, $ = A.$, el = A.el;
  const TONES = [['confident', 'Confident'], ['friendly', 'Friendly'], ['playful', 'Playful'], ['premium', 'Premium'], ['straight', 'Straight to the point'], ['local', 'Neighbourly']];
  const st = { group: null, tone: 'confident', ctl: null, undo: null, busy: false };
  const ERR = { not_granted: 'Claude wasn’t allowed for this page. Allow it from the page’s permissions to use Write with AI.', rate_limited: 'Too many requests just now. Try again in a minute.',
    sampling_disabled: 'Claude isn’t available on this account right now.', capability_disabled: 'Claude isn’t available on this account right now.', session_expired: 'Your session expired. Reload the page.',
    prompt_too_large: 'There’s too much here for one request. Rewrite one section at a time with its ✦ Rewrite button.', refused: 'Claude declined to write these lines. Try a different brief.',
    invalid_json: 'The answer came back in the wrong shape. Try again.', empty_completion: 'Claude returned nothing. Try again.', upstream_error: 'Claude had a problem answering. Try again.',
    queue_overflow: 'Too many requests at once. Try again shortly.', transform_error: 'The answer came back in the wrong shape. Try again.' };

  function targets() {
    const S = A.S; return S.fields.filter(f => f.type === 'text' && (!st.group || (f.group || 'Copy') === st.group));
  }
  function open(o) {
    if (!A.CAP.sample) { A.toast('Write with AI works when the studio is opened on claude.ai.'); return; }
    A.pause(); st.group = o.group || null;
    const n = targets().length, b = A.B();
    $('#aiTitle').textContent = st.group ? 'Rewrite: ' + st.group : 'Write with AI';
    $('#aiSub').textContent = 'Claude writes ' + n + ' line' + (n === 1 ? '' : 's') + ' of ' + A.S.tpl.name + ' for ' + b.name + ', inside each line’s character limit and the brand’s ad rules. Undo puts your text back.';
    const tb = $('#aiTones'); tb.textContent = '';
    TONES.forEach(([k, l]) => { const x = el('button', '', l); x.type = 'button'; x.setAttribute('aria-pressed', String(k === st.tone)); x.onclick = () => { st.tone = k; tb.querySelectorAll('button').forEach(y => y.setAttribute('aria-pressed', String(y === x))); }; tb.appendChild(x); });
    $('#aiOut').hidden = true; $('#aiMsg').textContent = ''; $('#aiUndo').hidden = !st.undo || st.undo.proj !== A.S.proj.id; $('#aiStop').hidden = true; $('#aiGo').disabled = false;
    $('#aiGo').textContent = st.group ? 'Rewrite these lines' : 'Write the lines';
    $('#aiModal').hidden = false; $('#aiBrief').focus();
  }
  function close() { if (st.ctl) st.ctl.abort(); $('#aiModal').hidden = true; }
  $('#aiClose').onclick = close;
  $('#aiStop').onclick = () => { if (st.ctl) st.ctl.abort(); };
  $('#aiUndo').onclick = () => {
    const u = st.undo; if (!u || u.proj !== A.S.proj.id) return;
    for (const k of u.keys) { if (u.prev[k] === undefined) delete A.S.proj.text[k]; else A.S.proj.text[k] = u.prev[k]; }
    st.undo = null; $('#aiUndo').hidden = true; $('#aiMsg').textContent = 'Your previous text is back.';
    A.edited(); A.syncInspector();
  };

  // the brand's ad rules and facts, shared with the creative director (nx-quick.js)
  function brandRules(b) {
    const r = b.rules || {};
    const rules = [
      'Write like a person, not an ad agency. Short, concrete words. No hashtags, no emoji.',
      'Do not invent facts: no years in business, awards, certifications, warranties, guarantees, review counts, customer numbers, prices or offers unless the brand facts below include them.',
      'Do not name real people, competitors or places other than the service area given.',
    ];
    if (r.superlatives !== false) rules.push('No superlatives or rankings: never “best”, “#1”, “number one”, “top-rated”, “cheapest”.');
    if (r.stars !== false) rules.push('No star ratings.');
    if (r.prices) rules.push('No prices, discounts, financing or payment terms.');
    if (r.words) rules.push('Avoid these words: ' + r.words + '.');
    if (b.dpgRules) rules.push('This is DPG Outdoor Living: use only facts listed here. Say “pool deck”, never “pool” on its own. Do not present lighting or fire features as services. Mention lawns only as synthetic lawns.');
    return rules;
  }
  function brandFacts(b) {
    const C = b.contact || {}, ind = A.indOf(b);
    return { business: b.name, short_name: b.short || b.name, industry: ind.label, services: (b.services || []).slice(0, 8), tagline: C.tagline || '', call_to_action: C.cta || '', service_area: C.area || '', since: C.since || '', badge: C.badge || '' };
  }
  const errText = e => { const code = e && e.code; return code === 'cancelled' ? '' : (ERR[code] || (code ? 'error ' + code : '')); };
  function prompt(fs) {
    const b = A.B(), tpl = A.S.tpl, rules = [
      'Every line must fit inside its character limit ("max"). Shorter is fine; going over is not.',
      'Lines marked "upper": true are shown in capitals: write them in capitals.',
      'Keep each line’s role. The label and group say what the line does on screen (a title card, a caption under a shot, a chat message, a button). Lines in the same group are read together in order, so they should flow.',
    ].concat(brandRules(b));
    if (tpl.id === 'chat') rules.push('This is a dramatized group chat between friends: lowercase texting style, natural, one short message per line. Only the message that names the business mentions it.');
    if (tpl.id === 'thisor' || tpl.id === 'upgrade') rules.push('The options are real choices a customer of this business would weigh; keep each pair or set comparable.');
    const facts = brandFacts(b);
    const lines = fs.map(f => ({ key: f.key, group: f.group || 'Copy', label: f.label, max: f.max || 40, upper: !!f.upper, current: String(A.fieldVal(f) || '') }));
    const brief = $('#aiBrief').value.trim();
    return 'You write the on-screen text for a short vertical social video (9:16, about ' + Math.round(A.S.dur) + ' seconds). The video’s animation, music and footage are fixed; only these text lines change.\n\n' +
      'TEMPLATE: ' + tpl.name + ' (' + tpl.blurb + ')\n\nBRAND FACTS (the only facts you may use):\n' + JSON.stringify(facts, null, 1) + '\n\n' +
      'BRIEF FROM THE BUSINESS: ' + (brief || '(none: write a strong general version for this business)') + '\nTONE: ' + TONES.find(t => t[0] === st.tone)[1] + '\n\n' +
      'RULES:\n- ' + rules.join('\n- ') + '\n\nLINES TO WRITE (current text shown for context; replace it):\n' + JSON.stringify(lines, null, 1) + '\n\n' +
      'Answer with only a JSON object that maps every key above to its new text, like {"' + lines[0].key + '": "..."}.';
  }

  $('#aiGo').onclick = async () => {
    if (st.busy) return;
    const fs = targets(); if (!fs.length) { $('#aiMsg').textContent = 'There are no lines to write here.'; return; }
    st.busy = true; st.ctl = new AbortController(); $('#aiGo').disabled = true; $('#aiStop').hidden = false; $('#aiMsg').textContent = 'Thinking…';
    const out = $('#aiOut'); out.hidden = true; out.textContent = '';
    try {
      const res = await A.CAP.sample.json(prompt(fs), { modelTier: 'default', cache: false, signal: st.ctl.signal, onText: ({ text }) => { $('#aiMsg').textContent = 'Writing…'; out.hidden = false; out.textContent = text; } });
      if (!res || typeof res !== 'object') throw { code: 'invalid_json' };
      const prev = {}, keys = [], notes = [];
      for (const f of fs) {
        let v = res[f.key]; if (typeof v !== 'string' || !v.trim()) continue;
        v = v.replace(/\s+/g, ' ').trim(); if (f.upper) v = v.toUpperCase();
        if (f.max && v.length > f.max) { notes.push(f.label); }
        prev[f.key] = A.S.proj.text[f.key]; keys.push(f.key);
        if (v === f.eff) delete A.S.proj.text[f.key]; else A.S.proj.text[f.key] = v;
      }
      if (!keys.length) throw { code: 'invalid_json' };
      st.undo = { proj: A.S.proj.id, prev, keys };
      A.edited(); A.syncInspector();
      const warns = keys.map(k => A.S.proj.text[k]).filter(Boolean).map(s => A.lint(s)).filter(w => w.length).length;
      out.hidden = true; $('#aiUndo').hidden = false;
      $('#aiMsg').textContent = 'Wrote ' + keys.length + ' line' + (keys.length === 1 ? '' : 's') + '.' + (notes.length ? ' ' + notes.length + ' ran long; check the counters.' : '') + (warns ? ' ' + warns + ' got a rule warning; check them.' : '') + ' Press play to watch it.';
    } catch (e) {
      const code = e && e.code; if (code !== 'cancelled') { $('#aiMsg').textContent = ERR[code] || ('Something went wrong (' + (code || e.message || e) + ').'); } else $('#aiMsg').textContent = 'Stopped.';
      out.hidden = true;
      if (code === 'not_granted' || code === 'sampling_disabled' || code === 'capability_disabled') { $('#aiBtn').hidden = true; }
    }
    st.busy = false; st.ctl = null; $('#aiGo').disabled = false; $('#aiStop').hidden = true;
  };
  NX.ai = { open, close, brandRules, brandFacts, errText };
})();
