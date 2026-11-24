// POST /api/import-batch { clips: [ ClipIn ] } -> { created, skipped, total }
// Batch clip creation: ONE batched db write for a whole import, instead of a
// read-then-write cycle per file (the old path took 55 min for 145 DPG files
// and lost rows when two writers raced). The caller uploads files first
// (POST /_up -> presigned PUT straight to R2, raw, no compression) and then
// sends all clip rows here in a single call.
//
// ClipIn: { asset, name, kind: 'photo'|'video', brand?, still?, w, h, n,
//            project?, file?, poster?, src?, addedAt? }
//   asset: R2 asset id from /_up (required). w/h: pixels, n: frame count at
//   30 fps (required — the studio renders from n; photos use n=9000).
//   still defaults to true for photos (a photo row without still:true is
//   treated as video and fails to decode — see the 2026-11-24 photo fix).
// Rows already present for an asset id are SKIPPED, never duplicated.
// A missing asset id fails the whole batch (400) — the caller only sends
// assets it just uploaded, so a miss means something is wrong upstream.
// One getDb + one putDb. Same last-write-wins caveat as POST /_db: do not
// run this concurrently with another full-db writer (browser persist,
// another import). Max 500 clips per call.
import { getDb, putDb, listAssets, isAuthenticated, unauthorized, sendJson, sendError, readJsonBody } from './_lib/r2.js';

const MAX_CLIPS = 500;

function newClipId() {
  return Math.random().toString(36).slice(2, 14);
}

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return unauthorized(res);
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('method not allowed'); }
  try {
    const body = await readJsonBody(req);
    const clips = body && body.clips;
    if (!Array.isArray(clips) || !clips.length) return sendError(res, 400, 'clips: non-empty array required');
    if (clips.length > MAX_CLIPS) return sendError(res, 400, `clips: max ${MAX_CLIPS} per call`);

    // Validate every item before touching the db — a bad batch fails whole.
    for (let i = 0; i < clips.length; i++) {
      const c = clips[i];
      const bad = (why) => `clip ${i}: ${why}`;
      if (!c || typeof c !== 'object') return sendError(res, 400, bad('not an object'));
      if (typeof c.asset !== 'string' || !/^[a-z0-9]+$/.test(c.asset)) return sendError(res, 400, bad('asset: R2 asset id required'));
      if (typeof c.name !== 'string' || !c.name.trim()) return sendError(res, 400, bad('name: required'));
      if (c.kind !== 'photo' && c.kind !== 'video') return sendError(res, 400, bad('kind: photo or video required'));
      for (const f of ['w', 'h', 'n']) {
        if (!Number.isFinite(c[f]) || c[f] <= 0) return sendError(res, 400, bad(`${f}: positive number required`));
      }
      if (c.brand !== undefined && typeof c.brand !== 'string') return sendError(res, 400, bad('brand: string'));
      if (c.still !== undefined && typeof c.still !== 'boolean') return sendError(res, 400, bad('still: boolean'));
    }

    // Verify every asset actually exists in R2 (one paginated list).
    const existing = new Set((await listAssets()).map((a) => a.id));
    for (let i = 0; i < clips.length; i++) {
      if (!existing.has(clips[i].asset)) return sendError(res, 400, `clip ${i}: asset ${clips[i].asset} not found in storage`);
    }

    const db = await getDb();
    const docs = db.docs || {};
    const usedIds = new Set(Object.keys(docs).filter((k) => k.startsWith('clips/')).map((k) => k.slice(6)));
    const assetHasClip = new Set();
    for (const [k, v] of Object.entries(docs)) {
      if (k.startsWith('clips/') && v && typeof v.asset === 'string') assetHasClip.add(v.asset);
    }

    const created = [];
    const skipped = [];
    const now = new Date().toISOString();
    for (const c of clips) {
      if (assetHasClip.has(c.asset)) { skipped.push({ asset: c.asset, reason: 'already_exists' }); continue; }
      let id = newClipId();
      while (usedIds.has(id)) id = newClipId();
      usedIds.add(id);
      const w = Math.round(c.w), h = Math.round(c.h), n = Math.round(c.n);
      const hw = Math.min(960, w), hh = Math.max(1, Math.round((hw * h) / w));
      const name = String(c.name).slice(0, 40);
      const row = {
        id,
        brand: c.brand || 'dpg',
        name,
        project: (typeof c.project === 'string' && c.project ? c.project : name.toUpperCase().replace(/[^A-Z0-9]+/g, '_')).slice(0, 40),
        file: '',
        w, h,
        hw, hh,
        n,
        segs: [[0, n - 1]],
        asset: c.asset,
        poster: '',
        src: 'up',
        still: c.still !== undefined ? c.still : c.kind === 'photo',
        addedAt: c.addedAt || now,
      };
      docs['clips/' + id] = row;
      assetHasClip.add(c.asset);
      created.push({ id, asset: c.asset, name: row.name });
    }

    if (created.length) await putDb({ docs });
    return sendJson(res, 200, { created, skipped, total: created.length + skipped.length });
  } catch (e) {
    console.error('import-batch route:', e);
    return sendError(res, 500, 'import-batch failed');
  }
}
