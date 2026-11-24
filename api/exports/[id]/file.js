// Operator API — download a finished export.
//   GET /api/exports/<id>/file -> 302 to a short-lived presigned R2 GET URL (1h)
// Only when the job is 'done'. Otherwise 409 (not ready) or 404 (no such job).
// The bucket stays private: no permanent public URL for any finished video.
// Auth: browser password cookie OR `Authorization: Bearer <NX_OPERATOR_KEY>`.
import { isAuthenticated, unauthorized, sendJson, sendError, presignGet } from '../../_lib/r2.js';
import { getJob, jobFileKey, jobFileExists } from '../../_lib/jobs.js';

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return unauthorized(res);
  const id = String((req.query && req.query.id) || '');
  if (!/^x[a-z0-9]+$/.test(id)) return sendError(res, 404, 'job not found');
  if (req.method !== 'GET') return sendError(res, 405, 'method not allowed');
  try {
    const job = await getJob(id);
    if (!job) return sendError(res, 404, 'job not found');
    if (job.status !== 'done') {
      res.statusCode = 409;
      return sendJson(res, 409, { error: `export not ready (status: ${job.status})` });
    }
    const found = await jobFileExists(id);
    if (!found.exists) return sendError(res, 404, 'finished file missing');
    const url = await presignGet(jobFileKey(id), 3600);
    res.statusCode = 302;
    res.setHeader('location', url);
    res.setHeader('cache-control', 'no-store');
    return res.end();
  } catch (e) {
    console.error('export file route:', e);
    return sendError(res, 500, 'export file failed');
  }
}
