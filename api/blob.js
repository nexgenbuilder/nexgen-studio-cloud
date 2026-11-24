// GET /_blob/<id> -> 302 to a short-lived presigned R2 GET URL (1h)
// DELETE /_blob/<id> -> 'ok' (or 404 'nf')
// The bucket stays private: the browser never gets a permanent R2 URL, and
// the studio keeps storing the stable /_blob/<id> URL in clip rows, exactly
// like the in-house host. The redirect target is a presigned URL, so the
// browser's fetch of the clip needs the bucket's CORS policy to allow GET
// from the Vercel app origin (see RUNBOOK.md). The studio decodes clips by
// fetch()ing the bytes into an in-memory Blob (js/nx-frames.js), so the
// canvas is never tainted by a cross-origin load.
import { findAssetKey, presignGet, deleteAsset, isAuthenticated, unauthorized } from './_lib/r2.js';

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return unauthorized(res);
  const id = String((req.query && req.query.id) || '');
  if (!/^[a-z0-9]+$/.test(id)) { res.statusCode = 404; return res.end('nf'); }
  try {
    if (req.method === 'GET') {
      const key = await findAssetKey(id);
      if (!key) { res.statusCode = 404; return res.end('nf'); }
      const url = await presignGet(key, 3600);
      res.statusCode = 302;
      res.setHeader('location', url);
      res.setHeader('cache-control', 'no-store');
      return res.end();
    }
    if (req.method === 'DELETE') {
      const ok = await deleteAsset(id);
      if (!ok) { res.statusCode = 404; return res.end('nf'); }
      return res.end('ok');
    }
    res.statusCode = 405;
    return res.end('method not allowed');
  } catch (e) {
    console.error('blob route:', e);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ error: 'blob failed' }));
  }
}
