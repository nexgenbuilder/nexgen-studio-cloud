// GET /_assets -> { assets: [{ id, name, size, url }] }
// Lists every object in the R2 bucket under assets/. This mirrors the
// in-house host's /_assets endpoint (which lists the uploads/ directory).
import { listAssets, isAuthenticated, unauthorized } from './_lib/r2.js';

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return unauthorized(res);
  if (req.method !== 'GET') { res.statusCode = 405; return res.end('method not allowed'); }
  try {
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ assets: await listAssets() }));
  } catch (e) {
    console.error('assets route:', e);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ error: 'list failed' }));
  }
}
