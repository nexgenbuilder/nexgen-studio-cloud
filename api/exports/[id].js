// Operator API — one export job.
//   GET  /api/exports/<id>
//        -> { job } — when status is 'done', job.downloadUrl is
//           /api/exports/<id>/file (a 302 to a presigned R2 GET URL).
//   POST /api/exports/<id> { action: 'upload-url' }
//        -> { uploadUrl, key } — presigned R2 PUT for the finished MP4.
//           The renderer PUTs the MP4 bytes straight to R2 (video/mp4),
//           never through this function (4.5 MB serverless body cap).
//   POST /api/exports/<id> { action: 'complete' }
//        -> verifies the MP4 object exists in R2, then status 'done'.
//   POST /api/exports/<id> { action: 'fail', error? }
//        -> status 'failed' (render crashed, was cancelled, timed out).
//
// The render step itself is NOT here: it happens in a browser. The honest
// split is: API queues + records + serves finished files; a browser renders.
// See README.md "Operator API" for who renders and how.
// Auth: browser password cookie OR `Authorization: Bearer <NX_OPERATOR_KEY>`.
import { isAuthenticated, unauthorized, sendJson, sendError, readJsonBody, presignPut } from '../_lib/r2.js';
import { getJob, putJob, jobFileKey, jobFileExists } from '../_lib/jobs.js';

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return unauthorized(res);
  const id = String((req.query && req.query.id) || '');
  if (!/^x[a-z0-9]+$/.test(id)) return sendError(res, 404, 'job not found');
  try {
    const job = await getJob(id);
    if (!job) return sendError(res, 404, 'job not found');
    if (req.method === 'GET') {
      const out = { ...job };
      if (job.status === 'done') out.downloadUrl = `/api/exports/${id}/file`;
      return sendJson(res, 200, { job: out });
    }
    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      const action = String(body.action || '');
      if (action === 'upload-url') {
        if (job.status === 'done') return sendError(res, 409, 'job already done');
        const uploadUrl = await presignPut(jobFileKey(id), 'video/mp4', 3600);
        return sendJson(res, 200, { uploadUrl, key: jobFileKey(id) });
      }
      if (action === 'complete') {
        const found = await jobFileExists(id);
        if (!found.exists) return sendError(res, 409, 'no finished file uploaded yet — PUT the MP4 to the upload-url first');
        job.status = 'done';
        job.fileSize = found.size;
        await putJob(job);
        return sendJson(res, 200, { job: { ...job, downloadUrl: `/api/exports/${id}/file` } });
      }
      if (action === 'fail') {
        job.status = 'failed';
        if (typeof body.error === 'string' && body.error) job.error = body.error.slice(0, 500);
        await putJob(job);
        return sendJson(res, 200, { job });
      }
      return sendError(res, 400, "action must be 'upload-url', 'complete' or 'fail'");
    }
    return sendError(res, 405, 'method not allowed');
  } catch (e) {
    console.error('export job route:', e);
    return sendError(res, 500, 'export job failed');
  }
}
