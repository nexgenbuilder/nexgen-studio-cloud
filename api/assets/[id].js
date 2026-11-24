// DELETE /api/assets/<id>[?force=1] -> { deleted, blocked, notFound }
// Deletes the R2 object AND every clip row pointing at it, in one batched
// db write. Blocked with 409 when a project references the asset's clips
// (projects named in the response) unless force is set — the UI only sends
// force after an explicit per-asset override from the user.
// The old path (DELETE /_blob/<id>) removed the R2 object only and left the
// clip row behind; use this route for all asset deletion.
import { deleteAssets, isAuthenticated, unauthorized, sendJson, sendError } from '../_lib/r2.js';

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return unauthorized(res);
  if (req.method !== 'DELETE') { res.statusCode = 405; return res.end('method not allowed'); }
  try {
    const id = req.query && req.query.id;
    if (typeof id !== 'string' || !id) return sendError(res, 400, 'asset id required');
    const force = req.query.force === '1' || req.query.force === 'true';
    const result = await deleteAssets([id], { force });
    if (result.notFound.length) return sendError(res, 404, 'asset not found');
    if (result.blocked.length) {
      return sendJson(res, 409, { error: 'in_use', projects: result.blocked[0].projects, clips: result.blocked[0].clips || [] });
    }
    return sendJson(res, 200, result);
  } catch (e) {
    console.error('assets/[id] route:', e);
    return sendError(res, 500, 'delete failed');
  }
}
