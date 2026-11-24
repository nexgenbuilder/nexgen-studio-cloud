// Operator API — export jobs.
//   GET  /api/exports?projectId=&status=   list jobs (newest first)
//   POST /api/exports { projectId }        queue a render -> 201 { job }
//
// What a "job" is, honestly: a record that an MP4 render was requested.
// The render itself still needs a browser (canvas + WebCodecs) — there is
// no server-side render engine. The renderer (Muse's headless Chromium, or
// Ricardo's browser) picks up a queued job, opens the project in the studio,
// exports the MP4, then finishes the job via POST /api/exports/<id>.
// See api/exports/[id].js and README.md "Operator API" for the full flow.
// Jobs live as individual R2 objects (exports/<id>.json), not in db.json,
// so a browser's whole-db write can never clobber a job status update.
// Auth: browser password cookie OR `Authorization: Bearer <NX_OPERATOR_KEY>`.
import { getDb, isAuthenticated, unauthorized, sendJson, sendError, readJsonBody } from './_lib/r2.js';
import { newJobId, putJob, listJobs } from './_lib/jobs.js';

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return unauthorized(res);
  try {
    if (req.method === 'GET') {
      const jobs = await listJobs({
        projectId: String((req.query && req.query.projectId) || '') || undefined,
        status: String((req.query && req.query.status) || '') || undefined,
      });
      return sendJson(res, 200, { jobs });
    }
    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      const projectId = String(body.projectId || '');
      if (!/^p[a-z0-9]+$/.test(projectId)) return sendError(res, 400, 'projectId required');
      const { docs } = await getDb();
      if (!docs['projects/' + projectId]) return sendError(res, 404, 'project not found');
      const job = {
        id: newJobId(),
        projectId,
        status: 'queued',
        createdAt: new Date().toISOString(),
        updatedAt: null,
        fileSize: 0,
      };
      await putJob(job);
      return sendJson(res, 201, { job });
    }
    return sendError(res, 405, 'method not allowed');
  } catch (e) {
    console.error('exports route:', e);
    return sendError(res, 500, 'exports failed');
  }
}
