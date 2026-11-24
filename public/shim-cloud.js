// NexGen Studio cloud shim (Vercel + Cloudflare R2).
// Stands in for the claude.ai artifact host so the studio runs on the shared
// Vercel deployment, with no claude.ai tab open.
// Provides: db (persisted to localStorage, plus server-side to R2 via /_db),
// assets (direct-to-R2 upload via presigned URLs from /_up, served via /_blob),
// downloads (real browser download AND window.__saved for Muse's Playwright runs),
// user (Ricardo, owner).
// Deliberately does NOT provide `sample`: the in-studio Claude writer /
// Director stays off. Muse in chat is the AI for this studio — Ricardo
// gives the brief + assets, Muse drives the studio and writes the words.
//
// Differences from the in-house shim (~/workspace/nexgen-studio-inhouse/shim.js):
// - assets.upload does NOT post the file bytes to the server. It asks POST /_up
//   for a presigned R2 PUT URL, then PUTs the bytes straight to R2. Vercel
//   serverless request bodies cap around 4.5 MB and clips run to ~20 MB, so
//   proxying uploads through a function would fail. The returned url is the
//   same stable '/_blob/<id>' the studio already uses everywhere; the server
//   redirects that path to a fresh short-lived presigned R2 GET URL.
// - No /inbox/ endpoint: there is no local inbox in the cloud. Footage is
//   added through the studio's own upload pipeline, or via scripts/migrate-local-to-r2.mjs.
(() => {
  const LS_KEY = 'nx.cloud.db.v1';
  const docs = new Map();
  try { for (const [k, v] of Object.entries(JSON.parse(localStorage.getItem(LS_KEY) || '{}'))) docs.set(k, v); } catch (e) {}
  let persistT = null;
  // serverSynced gates every POST to /_db: until one GET has merged
  // successfully, this device must never upload its (possibly stale) copy.
  // Before this gate, a failed GET (e.g. a 401 JSON body with no docs) still
  // ran persist(), which would have overwritten the server db with the stale
  // local snapshot (POST is last-write-wins).
  let serverSynced = false;
  let lastSyncAt = 0;
  const persist = () => { try { localStorage.setItem(LS_KEY, JSON.stringify(Object.fromEntries(docs))); } catch (e) {} clearTimeout(persistT); persistT = setTimeout(() => { if (!serverSynced) return; try { fetch('/_db', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ docs: Object.fromEntries(docs) }) }).catch(() => {}); } catch (e) {} }, 500); };
  const subs = [];
  const fire = () => { persist(); subs.forEach(s => s()); };
  // Server-wins union merge: for every key the server has, the server value
  // replaces the local copy. A returning device must never keep a stale row
  // (e.g. the pre-fix photo rows without `still: true`) nor post it back and
  // revert the server fix. Keys that exist only locally are preserved, so
  // work created on this device before it ever synced is never destroyed.
  // Known limitation: a key deleted on the server is NOT deleted locally by
  // this merge, so a later persist() can resurrect it. Deletes must go through
  // a full put-db while devices are synced, or a future tombstone scheme.
  const mergeServer = (serverDocs) => { let changed = false; for (const [k, v] of Object.entries(serverDocs || {})) { const cur = docs.get(k); if (cur === undefined || JSON.stringify(cur) !== JSON.stringify(v)) { docs.set(k, v); changed = true; } } return changed; };
  // Pull the server db and merge it in. Returns true on a successful sync.
  // Never merges and never persists on a failed/unauthorised/empty reply.
  const syncFromServer = async () => {
    const now = Date.now();
    if (now - lastSyncAt < 10000) return false; // throttle re-sync bursts
    lastSyncAt = now;
    try {
      const r = await fetch('/_db');
      if (!r.ok) return false;
      const j = await r.json();
      if (!j || typeof j.docs !== 'object' || j.docs === null) return false;
      const changed = mergeServer(j.docs);
      serverSynced = true;
      persist(); // saves the merged view locally, and uploads it (now safe)
      if (changed) fire(); // re-render subscribers on the merged docs
      return true;
    } catch (e) { return false; }
  };
  // Server-side copy (survives a fresh browser profile, unlike localStorage):
  // load it first, then tell subscribers to refresh.
  window.__dbReady = syncFromServer();
  // A tab left open for hours must heal without a reload: re-sync every
  // minute and whenever the tab comes back into view / focus.
  setInterval(() => { syncFromServer(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncFromServer(); });
  window.addEventListener('focus', () => { syncFromServer(); });
  const snapOf = (pre) => { const out = []; for (const [k, v] of docs) if (k.startsWith(pre + '/') && k.slice(pre.length + 1).indexOf('/') < 0) out.push({ id: k.slice(pre.length + 1), data: () => JSON.parse(JSON.stringify(v)) }); return { docs: out }; };
  const coll = pre => { const c = { doc: id => doc(pre + '/' + id), orderBy: () => c, limit: () => c, where: () => c, get: async () => snapOf(pre), onSnapshot: (ok) => { const f = () => ok(snapOf(pre)); subs.push(f); setTimeout(f, 30); return () => {}; } }; return c; };
  const doc = p => ({ set: async v => { docs.set(p, JSON.parse(JSON.stringify(v))); fire(); }, update: async v => { docs.set(p, Object.assign({}, docs.get(p) || {}, JSON.parse(JSON.stringify(v)))); fire(); }, get: async () => ({ exists: docs.has(p), data: () => docs.get(p) }), delete: async () => { docs.delete(p); fire(); }, onSnapshot: ok => { const f = () => ok({ exists: docs.has(p), data: () => docs.get(p) }); subs.push(f); setTimeout(f, 30); return () => {}; }, collection: n => coll(p + '/' + n) });
  const db = { doc, collection: coll };
  const assets = {
    // Direct-to-R2 upload: ask the server for a presigned PUT URL, PUT the
    // bytes to R2 ourselves, then hand the studio the stable /_blob/<id> URL.
    upload: async (blob, o) => {
      const name = (o && o.name) || blob.name || 'asset';
      const type = (o && o.type) || blob.type || 'application/octet-stream';
      const r = await fetch('/_up', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, type, size: blob.size }) });
      if (!r.ok) throw new Error('Upload start failed (' + r.status + ')');
      const j = await r.json();
      const put = await fetch(j.uploadUrl, { method: 'PUT', headers: { 'content-type': type }, body: blob });
      if (!put.ok) throw new Error('Upload to storage failed (' + put.status + ')');
      return { id: j.id, url: '/_blob/' + j.id, sizeBytes: blob.size, contentType: blob.type };
    },
    list: async () => {
      let assets = [];
      try { const r = await fetch('/_assets'); const j = await r.json(); assets = j.assets || []; } catch (e) {}
      // Real usage comes from /api/storage (bytes, limit, files, warn flag).
      // The meter used to hard-code bytes: 0 here — that is why it never moved.
      try { const r = await fetch('/api/storage'); if (r.ok) { const s = await r.json(); return { assets, usage: { bytes: s.usedBytes, maxBytes: s.limitBytes, warnBytes: s.warnBytes, files: s.fileCount, pctUsed: s.pctUsed, warn: s.warn } }; } } catch (e) {}
      return { assets, usage: { bytes: 0 } };
    },
    // DELETE /api/assets/<id> removes the R2 object AND the clip rows that
    // point at it (the old DELETE /_blob/<id> removed the object only and
    // left the clip row behind). Returns { ok, status, body } so the UI can
    // surface a 409 "in use" with the project names. force is only sent
    // after an explicit per-asset override from the user.
    delete: async (id, force) => {
      try {
        const r = await fetch('/api/assets/' + id + (force ? '?force=1' : ''), { method: 'DELETE' });
        let body = null; try { body = await r.json(); } catch (e) {}
        return { ok: r.ok, status: r.status, body };
      } catch (e) { return { ok: false, status: 0, body: null }; }
    },
    deleteMany: async (ids, force) => {
      try {
        const r = await fetch('/api/assets', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ids, force: !!force }) });
        let body = null; try { body = await r.json(); } catch (e) {}
        return { ok: r.ok, status: r.status, body };
      } catch (e) { return { ok: false, status: 0, body: null }; }
    }
  };
  const user = { id: async () => 'ricardo', me: async () => ({ id: 'ricardo' }), isOwner: () => true, canEdit: () => true, can: () => true, profiles: async () => ({}) };
  const downloads = { save: async o => {
    window.__saved = o; // Muse's Playwright runs read this and write the file to disk
    try { const url = URL.createObjectURL(o.data); const a = document.createElement('a'); a.href = url; a.download = o.filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000); } catch (e) {}
    // Finished MP4 exports: also record a copy in R2, fire-and-forget.
    // This is what makes the agreed flow work end to end: Ricardo exports in
    // his browser and the MP4 downloads to his device (above), AND Muse can
    // fetch the same file through the API (GET /api/exports, then
    // /api/exports/<id>/file) to deliver it to Drive when needed — without
    // Ricardo doing anything extra. The download above always happens first
    // and this upload can never break it: every failure is swallowed.
    // Only video/mp4 exports are recorded, never stills or other downloads.
    try {
      const blob = o && o.data;
      const name = (o && o.filename) || '';
      if (!blob || !(blob.type === 'video/mp4' || /\.mp4$/i.test(name))) return;
      const proj = window.NX && window.NX.app && window.NX.app.S && window.NX.app.S.proj;
      const projectId = proj && proj.id;
      if (!projectId) return;
      window.__exportUpload = { status: 'uploading', projectId };
      const jr = await fetch('/api/exports', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ projectId }) });
      if (!jr.ok) throw new Error('job create ' + jr.status);
      const { job } = await jr.json();
      const ur = await fetch('/api/exports/' + job.id, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'upload-url' }) });
      if (!ur.ok) throw new Error('upload-url ' + ur.status);
      const { uploadUrl } = await ur.json();
      const put = await fetch(uploadUrl, { method: 'PUT', headers: { 'content-type': 'video/mp4' }, body: blob });
      if (!put.ok) throw new Error('put ' + put.status);
      const cr = await fetch('/api/exports/' + job.id, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'complete' }) });
      if (!cr.ok) throw new Error('complete ' + cr.status);
      window.__exportUpload = { status: 'done', projectId, jobId: job.id };
    } catch (e) { try { window.__exportUpload = { status: 'failed', error: String((e && e.message) || e) }; } catch (_) {} console.warn('export record failed (download still worked):', e); }
  } };
  window.__docs = docs;
  window.__nxCloud = true;
  window.__inhouse = true; // kept for compatibility with code that checks it
  window.claude = { use: async n => ({ db, assets, user, downloads })[n] || null };
})();
