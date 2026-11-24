// GET /_assets -> { assets: [{ id, name, size, url }] }
// DELETE /api/assets { ids: [...], force? } -> { deleted, blocked, notFound }
//   Bulk delete: R2 object + clip rows for each id, one batched db write.
//   Assets whose clips a project references are blocked (named in `blocked`)
//   unless force is true. Max 100 ids per call.
// DELETE /api/assets/<id>[?force=1] -> { deleted, blocked, notFound }
//   Single delete, same rules; 404 when missing, 409 (naming the projects)
//   when in use. Served by this file via a vercel.json rewrite
//   (/api/assets/:id -> /api/assets?id=:id) — the Hobby plan caps a
//   deployment at 12 serverless functions, so single + bulk share one file
//   instead of a separate api/assets/[id].js.
// Lists every object in the R2 bucket under assets/. This mirrors the
// in-house host's /_assets endpoint (which lists the uploads/ directory).
import { listAssets, deleteAssets, isAuthenticated, unauthorized, sendJson, sendError, readJsonBody } from './_lib/r2.js';

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return unauthorized(res);
  if (req.method === 'DELETE') {
    try {
      // Single delete via the vercel.json rewrite (?id=...); bulk via body.
      const q = (req.query && req.query.id) || new URL(req.url || '', 'http://x').searchParams.get('id');
      if (typeof q === 'string' && q) {
        const force = (req.query && (req.query.force === '1' || req.query.force === 'true')) || new URL(req.url || '', 'http://x').searchParams.get('force') === '1';
        const result = await deleteAssets([q], { force });
        if (result.notFound.length) return sendError(res, 404, 'asset not found');
        if (result.blocked.length) return sendJson(res, 409, { error: 'in_use', projects: result.blocked[0].projects, clips: result.blocked[0].clips || [] });
        return sendJson(res, 200, result);
      }
      const body = await readJsonBody(req);
      const ids = body && body.ids;
      if (!Array.isArray(ids) || !ids.length) return sendError(res, 400, 'ids: non-empty array required');
      if (ids.length > 100) return sendError(res, 400, 'ids: max 100 per call');
      if (ids.some((i) => typeof i !== 'string' || !i)) return sendError(res, 400, 'ids: strings required');
      const result = await deleteAssets(ids, { force: !!(body && body.force) });
      return sendJson(res, 200, result);
    } catch (e) {
      console.error('assets route:', e);
      return sendError(res, 500, 'delete failed');
    }
  }
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
