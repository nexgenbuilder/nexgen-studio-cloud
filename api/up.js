// POST /_up { name, type, size } -> { id, uploadUrl, url }
// Returns a short-lived presigned R2 PUT URL. The browser PUTs the file bytes
// straight to R2 (it never passes through this function — Vercel serverless
// request bodies cap around 4.5 MB and clips run to ~20 MB).
// The stable URL the studio stores is /_blob/<id>; /_blob redirects to a
// fresh presigned GET URL (see api/blob.js).
import { newAssetId, assetKey, presignPut, isAuthenticated, unauthorized, sanitizeName } from './_lib/r2.js';

const ALLOWED_TYPES = /^(video|image|audio)\//;
const MAX_SIZE = 100 * 1024 * 1024; // raw file cap; the studio re-encodes video to ~20 MB before upload

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return unauthorized(res);
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('method not allowed'); }
  try {
    const body = typeof req.body === 'object' && req.body !== null ? req.body : JSON.parse(req.body || '{}');
    const name = sanitizeName(body.name || 'asset');
    const type = String(body.type || 'application/octet-stream');
    const size = Number(body.size || 0);
    if (!ALLOWED_TYPES.test(type)) { res.statusCode = 400; res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify({ error: 'unsupported type' })); }
    if (!Number.isFinite(size) || size <= 0 || size > MAX_SIZE) { res.statusCode = 400; res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify({ error: 'bad size' })); }
    const id = newAssetId();
    const key = assetKey(id, name);
    const uploadUrl = await presignPut(key, type, 600);
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ id, uploadUrl, url: '/_blob/' + id }));
  } catch (e) {
    console.error('up route:', e);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ error: 'upload start failed' }));
  }
}
