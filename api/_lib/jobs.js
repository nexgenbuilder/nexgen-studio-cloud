// Export jobs for the operator API (phase-2 MCP/connector support).
// A job is a record that an MP4 render was requested for a project — nothing
// more. Rendering still needs a browser (canvas + WebCodecs); there is no
// server-side render engine, and this module does not pretend otherwise.
//
// Flow (see README.md "Operator API" for the full picture):
//   1. Operator: POST /api/exports { projectId }            -> job { status: 'queued' }
//   2. Renderer (a browser — Muse's headless Chromium, or Ricardo's):
//      GET /api/exports?status=queued, opens the project in the studio,
//      exports the MP4, then POST /api/exports/<id> { action: 'upload-url' }
//      and PUTs the MP4 bytes straight to R2 (presigned URL, not proxied).
//   3. Renderer: POST /api/exports/<id> { action: 'complete' } -> status 'done'
//   4. Anyone: GET /api/exports/<id> (status + downloadUrl) or
//      GET /api/exports/<id>/file (302 to a presigned R2 GET URL).
//
// Jobs are stored as individual R2 objects (exports/<id>.json), NOT inside
// the shared db.json. The db is last-write-wins on the whole document map,
// and a browser persisting its copy could clobber a job status update.
// Separate objects make job updates atomic. Finished MP4s live at
// exports/<id>.mp4 in the same private bucket.
import { GetObjectCommand, PutObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getS3, bucket } from './r2.js';

export const JOB_PREFIX = 'exports/';

export function newJobId() {
  return 'x' + Math.random().toString(36).slice(2, 14);
}

export function jobKey(id) { return JOB_PREFIX + id + '.json'; }
export function jobFileKey(id) { return JOB_PREFIX + id + '.mp4'; }

async function readJson(client, key) {
  const res = await client.send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
  const text = typeof res.Body?.transformToString === 'function'
    ? await res.Body.transformToString()
    : Buffer.concat(await (async () => { const c = []; for await (const x of res.Body) c.push(x); return c; })()).toString('utf8');
  return JSON.parse(text);
}

export async function getJob(id, s3) {
  const client = s3 || getS3();
  try {
    return await readJson(client, jobKey(id));
  } catch (e) {
    if (e && (e.name === 'NoSuchKey' || e.$metadata?.httpStatusCode === 404)) return null;
    throw e;
  }
}

export async function putJob(job, s3) {
  const client = s3 || getS3();
  const now = new Date().toISOString();
  const doc = { ...job, updatedAt: now };
  await client.send(new PutObjectCommand({
    Bucket: bucket(), Key: jobKey(job.id),
    Body: JSON.stringify(doc), ContentType: 'application/json',
  }));
  return doc;
}

export async function listJobs({ projectId, status } = {}, s3) {
  const client = s3 || getS3();
  const jobs = [];
  let token;
  do {
    const res = await client.send(new ListObjectsV2Command({ Bucket: bucket(), Prefix: JOB_PREFIX, ContinuationToken: token }));
    for (const o of (res.Contents || [])) {
      if (!o.Key.endsWith('.json')) continue;
      const job = await readJson(client, o.Key).catch(() => null);
      if (!job) continue;
      if (projectId && job.projectId !== projectId) continue;
      if (status && job.status !== status) continue;
      jobs.push(job);
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  jobs.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return jobs;
}

export async function jobFileExists(id, s3) {
  const client = s3 || getS3();
  try {
    const h = await client.send(new HeadObjectCommand({ Bucket: bucket(), Key: jobFileKey(id) }));
    return { exists: true, size: h.ContentLength || 0 };
  } catch (e) {
    if (e && (e.name === 'NotFound' || e.$metadata?.httpStatusCode === 404)) return { exists: false, size: 0 };
    throw e;
  }
}
