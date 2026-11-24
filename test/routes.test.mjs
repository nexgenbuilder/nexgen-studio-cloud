// Route tests for the NexGen Studio cloud deployment. No real R2, no network:
// a real S3Client with fake credentials has its `send` patched to an
// in-memory store, so presigned-URL generation (pure HMAC signing) is
// genuinely exercised while storage ops hit the fake.
// Run: npm test   (or: node test/routes.test.mjs)
import { createHash } from 'node:crypto';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';

process.env.R2_ACCOUNT_ID = 'test-account';
process.env.R2_ACCESS_KEY_ID = 'test-key';
process.env.R2_SECRET_ACCESS_KEY = 'test-secret';
process.env.R2_BUCKET = 'test-bucket';
process.env.STUDIO_PASSWORD = 'test-password';
process.env.NX_OPERATOR_KEY = 'test-operator-key';

// ---- in-memory fake R2 -------------------------------------------------
const store = new Map(); // key -> { body: Buffer, contentType: string }
const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://test-account.r2.cloudflarestorage.com',
  credentials: { accessKeyId: 'test-key', secretAccessKey: 'test-secret' },
});
s3.send = async (cmd) => {
  const input = cmd.input || {};
  if (cmd instanceof PutObjectCommand) {
    const body = Buffer.isBuffer(input.Body) ? input.Body : Buffer.from(String(input.Body ?? ''));
    store.set(input.Key, { body, contentType: input.ContentType || '' });
    return { $metadata: { httpStatusCode: 200 } };
  }
  if (cmd instanceof GetObjectCommand) {
    const obj = store.get(input.Key);
    if (!obj) { const e = new Error('NoSuchKey'); e.name = 'NoSuchKey'; e.$metadata = { httpStatusCode: 404 }; throw e; }
    return { Body: { transformToString: async () => obj.body.toString('utf8') }, ContentType: obj.contentType };
  }
  if (cmd instanceof DeleteObjectCommand) { store.delete(input.Key); return {}; }
  if (cmd instanceof HeadObjectCommand) {
    const obj = store.get(input.Key);
    if (!obj) { const e = new Error('NotFound'); e.name = 'NotFound'; e.$metadata = { httpStatusCode: 404 }; throw e; }
    return { ContentLength: obj.body.length };
  }
  if (cmd instanceof ListObjectsV2Command) {
    const contents = [...store.keys()]
      .filter((k) => k.startsWith(input.Prefix || ''))
      .map((k) => ({ Key: k, Size: store.get(k).body.length }));
    return { Contents: contents, IsTruncated: false };
  }
  throw new Error('unexpected command ' + cmd.constructor.name);
};
globalThis.__NX_R2_OVERRIDE__ = s3;

// ---- mock req/res -------------------------------------------------------
function mockRes() {
  const res = { statusCode: 200, headers: {}, body: '' };
  res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
  res.end = (data) => { res.body = data || ''; };
  return res;
}
function req({ method = 'GET', cookie = '', query = {}, body = undefined, bearer = '' } = {}) {
  const headers = { cookie };
  if (bearer) headers.authorization = `Bearer ${bearer}`;
  return { method, headers, query, body };
}
const sha = (s) => createHash('sha256').update(s).digest('hex');
const authCookie = `nx-auth=${sha('test-password')}`;
const authed = (extra = {}) => req({ cookie: authCookie, ...extra });
const oper = (extra = {}) => req({ bearer: 'test-operator-key', ...extra });

// ---- tiny test runner ---------------------------------------------------
let pass = 0, fail = 0;
async function t(name, fn) {
  try { await fn(); pass++; console.log('  ok  ' + name); }
  catch (e) { fail++; console.log('  FAIL ' + name + ' — ' + (e && e.message)); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assert failed'); }
function assertEq(a, b, msg) { if (a !== b) throw new Error(`${msg || 'not equal'}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); }

const db = (await import('../api/db.js')).default;
const up = (await import('../api/up.js')).default;
const assets = (await import('../api/assets.js')).default;
const blob = (await import('../api/blob.js')).default;
const login = (await import('../api/login.js')).default;
const projects = (await import('../api/projects.js')).default;
const projectOne = (await import('../api/projects/[id].js')).default;
const exportsList = (await import('../api/exports.js')).default;
const exportOne = (await import('../api/exports/[id].js')).default;
const exportFile = (await import('../api/exports/[id]/file.js')).default;
const importBatch = (await import('../api/import-batch.js')).default;
const storage = (await import('../api/storage.js')).default;
const assetOne = (await import('../api/assets/[id].js')).default;
const { isAuthorized } = await import('../middleware.js');
const middlewareDefault = (await import('../middleware.js')).default;

console.log('db route');
await t('GET /_db unauthenticated -> 401', async () => {
  const res = mockRes(); await db(req(), res);
  assertEq(res.statusCode, 401);
});
await t('GET /_db empty store -> {docs:{}}', async () => {
  const res = mockRes(); await db(authed(), res);
  assertEq(res.statusCode, 200); assertEq(res.body, JSON.stringify({ docs: {} }));
});
await t('POST /_db then GET returns the docs', async () => {
  const docs = { 'projects/p1': { id: 'p1', name: 'Job Walkthrough' }, 'clips/c1': { id: 'c1', asset: 'a123' } };
  let res = mockRes(); await db(authed({ method: 'POST', body: { docs } }), res);
  assertEq(res.statusCode, 200);
  res = mockRes(); await db(authed(), res);
  assertEq(JSON.parse(res.body).docs['projects/p1'].name, 'Job Walkthrough');
});
await t('POST /_db with garbage body stores empty docs (fail safe)', async () => {
  const res = mockRes(); await db(authed({ method: 'POST', body: { nope: 1 } }), res);
  assertEq(res.statusCode, 200);
  const get = mockRes(); await db(authed(), get);
  assertEq(JSON.stringify(JSON.parse(get.body).docs), '{}');
});

console.log('up route');
await t('POST /_up unauthenticated -> 401', async () => {
  const res = mockRes(); await up(req({ method: 'POST', body: { name: 'x.mp4', type: 'video/mp4', size: 100 } }), res);
  assertEq(res.statusCode, 401);
});
await t('POST /_up rejects non media type', async () => {
  const res = mockRes(); await up(authed({ method: 'POST', body: { name: 'x.exe', type: 'application/octet-stream', size: 100 } }), res);
  assertEq(res.statusCode, 400);
});
await t('POST /_up accepts 200 MB (cap is 1 GB now)', async () => {
  const res = mockRes(); await up(authed({ method: 'POST', body: { name: 'x.mp4', type: 'video/mp4', size: 200 * 1024 * 1024 } }), res);
  assertEq(res.statusCode, 200);
});
await t('POST /_up rejects over 1 GB', async () => {
  const res = mockRes(); await up(authed({ method: 'POST', body: { name: 'x.mp4', type: 'video/mp4', size: 2 * 1024 * 1024 * 1024 } }), res);
  assertEq(res.statusCode, 400);
});
let assetId;
await t('POST /_up returns id + presigned PUT url + stable /_blob url', async () => {
  const res = mockRes();
  await up(authed({ method: 'POST', body: { name: 'my clip.mp4', type: 'video/mp4', size: 12345678 } }), res);
  assertEq(res.statusCode, 200);
  const j = JSON.parse(res.body);
  assert(/^a[0-9a-z]+$/.test(j.id), 'id shape ' + j.id);
  assert(j.uploadUrl.includes('test-account.r2.cloudflarestorage.com'), 'upload url host');
  assert(j.uploadUrl.includes('X-Amz-Signature='), 'upload url is signed');
  assert(j.uploadUrl.includes('assets%2F' + j.id + '-') || j.uploadUrl.includes('assets/' + j.id + '-'), 'upload url key');
  assertEq(j.url, '/_blob/' + j.id);
  assetId = j.id;
});

console.log('assets + blob routes');
// Simulate the browser completing the PUT: the object now exists in R2.
store.set(`assets/${assetId}-my_clip.mp4`, { body: Buffer.alloc(12345678, 0), contentType: 'video/mp4' });
await t('GET /_assets lists the uploaded asset', async () => {
  const res = mockRes(); await assets(authed(), res);
  assertEq(res.statusCode, 200);
  const j = JSON.parse(res.body);
  assertEq(j.assets.length, 1);
  assertEq(j.assets[0].id, assetId);
  assertEq(j.assets[0].name, 'my_clip.mp4');
  assertEq(j.assets[0].size, 12345678);
  assertEq(j.assets[0].url, '/_blob/' + assetId);
});
await t('GET /_blob/<id> 302s to a signed R2 GET url', async () => {
  const res = mockRes(); await blob(authed({ query: { id: assetId } }), res);
  assertEq(res.statusCode, 302);
  assert(res.headers.location.includes('test-account.r2.cloudflarestorage.com'), 'redirect host');
  assert(res.headers.location.includes('X-Amz-Signature='), 'redirect is signed');
});
await t('GET /_blob/<missing> -> 404', async () => {
  const res = mockRes(); await blob(authed({ query: { id: 'anope' } }), res);
  assertEq(res.statusCode, 404);
});
await t('DELETE /_blob/<id> removes it, then GET 404s', async () => {
  let res = mockRes(); await blob(authed({ method: 'DELETE', query: { id: assetId } }), res);
  assertEq(res.statusCode, 200); assertEq(res.body, 'ok');
  res = mockRes(); await blob(authed({ query: { id: assetId } }), res);
  assertEq(res.statusCode, 404);
});

console.log('login route');
await t('wrong password -> 302 back to login with error', async () => {
  const res = mockRes(); await login(req({ method: 'POST', body: { password: 'nope' } }), res);
  assertEq(res.statusCode, 302);
  assertEq(res.headers.location, '/login.html?error=1');
  assert(!res.headers['set-cookie'], 'no cookie on failure');
});
await t('right password (JSON) -> 302 to / with auth cookie', async () => {
  const res = mockRes(); await login(req({ method: 'POST', body: { password: 'test-password' } }), res);
  assertEq(res.statusCode, 302);
  assertEq(res.headers.location, '/');
  assert(res.headers['set-cookie'].includes('nx-auth=' + sha('test-password')), 'cookie is sha256, not raw password');
  assert(res.headers['set-cookie'].includes('HttpOnly'), 'HttpOnly flag');
});
await t('right password (urlencoded form stream) -> 302 to /', async () => {
  const res = mockRes();
  const streamReq = { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: undefined };
  streamReq.on = (ev, cb) => {
    if (ev === 'data') cb('password=test-password');
    if (ev === 'end') cb();
  };
  await login(streamReq, res);
  assertEq(res.statusCode, 302); assertEq(res.headers.location, '/');
});

console.log('middleware auth check');
await t('isAuthorized: no cookie -> false', async () => {
  assertEq(await isAuthorized(new Request('https://studio.example/')), false);
});
await t('isAuthorized: wrong cookie -> false', async () => {
  assertEq(await isAuthorized(new Request('https://studio.example/', { headers: { cookie: 'nx-auth=deadbeef' } })), false);
});
await t('isAuthorized: correct cookie -> true', async () => {
  assertEq(await isAuthorized(new Request('https://studio.example/', { headers: { cookie: authCookie } })), true);
});
await t('isAuthorized: no password configured -> false (fail closed)', async () => {
  const saved = process.env.STUDIO_PASSWORD; delete process.env.STUDIO_PASSWORD;
  try { assertEq(await isAuthorized(new Request('https://studio.example/', { headers: { cookie: authCookie } })), false); }
  finally { process.env.STUDIO_PASSWORD = saved; }
});

console.log('operator auth (Bearer) on existing routes');
await t('db GET with valid Bearer -> 200', async () => {
  const res = mockRes(); await db(oper(), res);
  assertEq(res.statusCode, 200);
});
await t('db GET with wrong Bearer -> 401', async () => {
  const res = mockRes(); await db(oper({ bearer: 'wrong-key' }), res);
  assertEq(res.statusCode, 401);
});
await t('db GET with Bearer but no operator key configured -> 401', async () => {
  const saved = process.env.NX_OPERATOR_KEY; delete process.env.NX_OPERATOR_KEY;
  try { const res = mockRes(); await db(oper(), res); assertEq(res.statusCode, 401); }
  finally { process.env.NX_OPERATOR_KEY = saved; }
});

console.log('projects API');
let projectId;
await t('POST /api/projects without templateId -> 400', async () => {
  const res = mockRes(); await projects(oper({ method: 'POST', body: {} }), res);
  assertEq(res.statusCode, 400);
});
await t('POST /api/projects creates a project mirroring the studio shape', async () => {
  const res = mockRes();
  await projects(oper({ method: 'POST', body: { templateId: 'walkx_h', name: 'Test Walk', text: { sub: 'Hello' } } }), res);
  assertEq(res.statusCode, 201);
  const j = JSON.parse(res.body);
  assert(/^p[0-9a-z]+$/.test(j.project.id), 'id shape ' + j.project.id);
  assertEq(j.project.tpl, 'walkx_h');
  assertEq(j.project.brand, 'dpg');
  assertEq(j.project.name, 'Test Walk');
  assertEq(JSON.stringify(j.project.text), JSON.stringify({ sub: 'Hello' }));
  assertEq(JSON.stringify(j.project.shot), '{}');
  assertEq(j.project.saved, true);
  projectId = j.project.id;
});
await t('GET /api/projects lists it (cookie auth also works)', async () => {
  const res = mockRes(); await projects(authed(), res);
  assertEq(res.statusCode, 200);
  const j = JSON.parse(res.body);
  assert(j.projects.some((p) => p.id === projectId && p.tpl === 'walkx_h'), 'project in list');
});
await t('GET /api/projects/<id> returns the full doc', async () => {
  const res = mockRes(); await projectOne(oper({ query: { id: projectId } }), res);
  assertEq(res.statusCode, 200);
  assertEq(JSON.parse(res.body).project.id, projectId);
});
await t('GET /api/projects/<missing> -> 404', async () => {
  const res = mockRes(); await projectOne(oper({ query: { id: 'pnope123' } }), res);
  assertEq(res.statusCode, 404);
});
await t('PATCH merges text/shot per-key without wiping the rest', async () => {
  let res = mockRes();
  await projectOne(oper({ method: 'PATCH', query: { id: projectId }, body: { shot: { s1: { c: 'clip123', in: 0 } }, text: { cta: 'Book now' } } }), res);
  assertEq(res.statusCode, 200);
  let j = JSON.parse(res.body);
  assertEq(j.project.text.sub, 'Hello');
  assertEq(j.project.text.cta, 'Book now');
  assertEq(j.project.shot.s1.c, 'clip123');
  res = mockRes();
  await projectOne(oper({ method: 'PATCH', query: { id: projectId }, body: { text: { sub: 'Changed' } } }), res);
  j = JSON.parse(res.body);
  assertEq(j.project.text.sub, 'Changed');
  assertEq(j.project.text.cta, 'Book now');
  assertEq(j.project.shot.s1.c, 'clip123');
});
await t('PATCH with a bad shot value -> 400', async () => {
  const res = mockRes();
  await projectOne(oper({ method: 'PATCH', query: { id: projectId }, body: { shot: { s1: 'not-an-object' } } }), res);
  assertEq(res.statusCode, 400);
});

console.log('exports API');
let jobId;
await t('POST /api/exports with unknown project -> 404', async () => {
  const res = mockRes(); await exportsList(oper({ method: 'POST', body: { projectId: 'pnope123' } }), res);
  assertEq(res.statusCode, 404);
});
await t('POST /api/exports queues a job', async () => {
  const res = mockRes(); await exportsList(oper({ method: 'POST', body: { projectId } }), res);
  assertEq(res.statusCode, 201);
  const j = JSON.parse(res.body);
  assert(/^x[0-9a-z]+$/.test(j.job.id), 'job id shape');
  assertEq(j.job.status, 'queued');
  assertEq(j.job.projectId, projectId);
  jobId = j.job.id;
});
await t('GET /api/exports lists the queued job', async () => {
  const res = mockRes(); await exportsList(oper({ query: { status: 'queued' } }), res);
  assertEq(res.statusCode, 200);
  assert(JSON.parse(res.body).jobs.some((j) => j.id === jobId), 'job in list');
});
await t('GET /api/exports/<id> returns the job without downloadUrl while queued', async () => {
  const res = mockRes(); await exportOne(oper({ query: { id: jobId } }), res);
  assertEq(res.statusCode, 200);
  const j = JSON.parse(res.body).job;
  assertEq(j.status, 'queued');
  assert(!j.downloadUrl, 'no downloadUrl before done');
});
await t('GET /api/exports/<id>/file while queued -> 409', async () => {
  const res = mockRes(); await exportFile(oper({ query: { id: jobId } }), res);
  assertEq(res.statusCode, 409);
});
let uploadUrl;
await t("POST action 'upload-url' returns a presigned PUT for the MP4", async () => {
  const res = mockRes();
  await exportOne(oper({ method: 'POST', query: { id: jobId }, body: { action: 'upload-url' } }), res);
  assertEq(res.statusCode, 200);
  const j = JSON.parse(res.body);
  assert(j.uploadUrl.includes('test-account.r2.cloudflarestorage.com'), 'upload host');
  assert(j.uploadUrl.includes('X-Amz-Signature='), 'upload is signed');
  assertEq(j.key, `exports/${jobId}.mp4`);
  uploadUrl = j.uploadUrl;
  assert(uploadUrl.includes('exports%2F' + jobId + '.mp4') || uploadUrl.includes(`exports/${jobId}.mp4`), 'upload key');
});
await t("POST action 'complete' before any file -> 409", async () => {
  const res = mockRes();
  await exportOne(oper({ method: 'POST', query: { id: jobId }, body: { action: 'complete' } }), res);
  assertEq(res.statusCode, 409);
});
// Simulate the renderer PUTting the finished MP4 to R2.
store.set(`exports/${jobId}.mp4`, { body: Buffer.alloc(1234567, 0), contentType: 'video/mp4' });
await t("POST action 'complete' after upload -> done with downloadUrl", async () => {
  const res = mockRes();
  await exportOne(oper({ method: 'POST', query: { id: jobId }, body: { action: 'complete' } }), res);
  assertEq(res.statusCode, 200);
  const j = JSON.parse(res.body).job;
  assertEq(j.status, 'done');
  assertEq(j.fileSize, 1234567);
  assertEq(j.downloadUrl, `/api/exports/${jobId}/file`);
});
await t('GET /api/exports/<id>/file when done -> 302 to signed R2 GET', async () => {
  const res = mockRes(); await exportFile(oper({ query: { id: jobId } }), res);
  assertEq(res.statusCode, 302);
  assert(res.headers.location.includes('test-account.r2.cloudflarestorage.com'), 'file host');
  assert(res.headers.location.includes('X-Amz-Signature='), 'file url is signed');
});
await t("POST action 'fail' marks a job failed", async () => {
  let res = mockRes(); await exportsList(oper({ method: 'POST', body: { projectId } }), res);
  const jid = JSON.parse(res.body).job.id;
  res = mockRes();
  await exportOne(oper({ method: 'POST', query: { id: jid }, body: { action: 'fail', error: 'browser crashed' } }), res);
  assertEq(res.statusCode, 200);
  assertEq(JSON.parse(res.body).job.status, 'failed');
  assertEq(JSON.parse(res.body).job.error, 'browser crashed');
});

console.log('middleware default export (operator + api 401)');
await t('middleware: /api/projects without auth -> 401 JSON (not a redirect)', async () => {
  const r = await middlewareDefault(new Request('https://studio.example/api/projects'));
  assertEq(r.status, 401);
  assertEq(JSON.parse(await r.text()).error, 'unauthorized');
});
await t('middleware: /api/projects with Bearer -> passes through', async () => {
  const r = await middlewareDefault(new Request('https://studio.example/api/projects', { headers: { authorization: 'Bearer test-operator-key' } }));
  assert(r.status !== 302 && r.status !== 401, 'status ' + r.status);
});
await t('middleware: / with Bearer -> passes through', async () => {
  const r = await middlewareDefault(new Request('https://studio.example/', { headers: { authorization: 'Bearer test-operator-key' } }));
  assert(r.status !== 302, 'status ' + r.status);
});

console.log('import-batch / storage / delete-assets (bulk import system)');
store.clear();
store.set('assets/abc123-photo.jpg', { body: Buffer.alloc(1000, 0), contentType: 'image/jpeg' });
store.set('assets/def456-clip.mp4', { body: Buffer.alloc(2000, 0), contentType: 'video/mp4' });
store.set('assets/ghi789-new.jpg', { body: Buffer.alloc(500, 0), contentType: 'image/jpeg' });
store.set('assets/jkl012-orphan.png', { body: Buffer.alloc(300, 0), contentType: 'image/png' });
store.set('exports/old.mp4', { body: Buffer.alloc(3000, 0), contentType: 'video/mp4' });
store.set('db.json', { body: Buffer.from(JSON.stringify({ docs: {
  'clips/cabc': { id: 'cabc', asset: 'abc123', brand: 'dpg', name: 'Driveway', still: true, w: 100, h: 100, n: 9000 },
  'clips/cdef': { id: 'cdef', asset: 'def456', brand: 'webflix', name: 'Reveal', still: false, w: 1920, h: 1080, n: 300 },
  'projects/pp1': { id: 'pp1', name: 'Poolside Living', brand: 'dpg', tpl: 'walkx_h', shot: { s1: { c: 'cabc', in: 0 } } },
} })), contentType: 'application/json' });
async function readDocs() {
  const res = mockRes(); await db(authed(), res);
  return JSON.parse(res.body).docs;
}
await t('POST /api/import-batch unauthenticated -> 401', async () => {
  const res = mockRes(); await importBatch(req({ method: 'POST', body: { clips: [] } }), res);
  assertEq(res.statusCode, 401);
});
await t('POST /api/import-batch empty clips -> 400', async () => {
  const res = mockRes(); await importBatch(oper({ method: 'POST', body: { clips: [] } }), res);
  assertEq(res.statusCode, 400);
});
await t('POST /api/import-batch unknown asset -> 400', async () => {
  const res = mockRes();
  await importBatch(oper({ method: 'POST', body: { clips: [{ asset: 'nope99', name: 'X', kind: 'photo', w: 10, h: 10, n: 9000 }] } }), res);
  assertEq(res.statusCode, 400);
});
await t('POST /api/import-batch bad kind -> 400', async () => {
  const res = mockRes();
  await importBatch(oper({ method: 'POST', body: { clips: [{ asset: 'ghi789', name: 'X', kind: 'audio', w: 10, h: 10, n: 9000 }] } }), res);
  assertEq(res.statusCode, 400);
});
await t('POST /api/import-batch creates 1, skips 1 already_exists, one db write', async () => {
  const res = mockRes();
  await importBatch(oper({ method: 'POST', body: { clips: [
    { asset: 'ghi789', name: 'New Photo', kind: 'photo', brand: 'dpg', w: 800, h: 600, n: 9000 },
    { asset: 'def456', name: 'Reveal', kind: 'video', brand: 'webflix', w: 1920, h: 1080, n: 300 },
  ] } }), res);
  assertEq(res.statusCode, 200);
  const j = JSON.parse(res.body);
  assertEq(j.created.length, 1); assertEq(j.created[0].asset, 'ghi789');
  assertEq(j.skipped.length, 1); assertEq(j.skipped[0].asset, 'def456'); assertEq(j.skipped[0].reason, 'already_exists');
  const docs = await readDocs();
  const row = Object.values(docs).find((v) => v && v.asset === 'ghi789');
  assert(row, 'created clip row present');
  assertEq(row.still, true); assertEq(row.hw, 800); assertEq(row.hh, 600);
  assertEq(row.project, 'NEW_PHOTO'); assertEq(row.segs[0][1], 8999);
});
await t('POST /api/import-batch twice -> second call skips both', async () => {
  const res = mockRes();
  await importBatch(oper({ method: 'POST', body: { clips: [
    { asset: 'ghi789', name: 'New Photo', kind: 'photo', brand: 'dpg', w: 800, h: 600, n: 9000 },
    { asset: 'def456', name: 'Reveal', kind: 'video', brand: 'webflix', w: 1920, h: 1080, n: 300 },
  ] } }), res);
  const j = JSON.parse(res.body);
  assertEq(j.created.length, 0); assertEq(j.skipped.length, 2);
});
await t('GET /api/storage unauthenticated -> 401', async () => {
  const res = mockRes(); await storage(req(), res);
  assertEq(res.statusCode, 401);
});
await t('GET /api/storage returns real totals matching the store', async () => {
  const res = mockRes(); await storage(oper(), res);
  assertEq(res.statusCode, 200);
  const j = JSON.parse(res.body);
  let total = 0; for (const v of store.values()) total += v.body.length;
  assertEq(j.usedBytes, total);
  assertEq(j.fileCount, store.size);
  assertEq(j.limitBytes, 10 * 1024 ** 3);
  assertEq(j.warn, false);
  assertEq(j.pctUsed, Math.round((total / (10 * 1024 ** 3)) * 1000) / 10);
  assertEq(j.byPrefix.assets.bytes, 3800);
  assertEq(j.byPrefix.exports.bytes, 3000);
  assertEq(j.byType.image.bytes, 1800);
  assertEq(j.byType.video.bytes, 5000);
  assertEq(j.byBrand.dpg.bytes, 1500);
  assertEq(j.byBrand.webflix.bytes, 2000);
  assertEq(j.byBrand.unassigned.bytes, 300);
});
await t('DELETE /api/assets/<id> in use -> 409 naming the project', async () => {
  const res = mockRes(); await assetOne(oper({ method: 'DELETE', query: { id: 'abc123' } }), res);
  assertEq(res.statusCode, 409);
  const j = JSON.parse(res.body);
  assertEq(j.error, 'in_use');
  assert(j.projects.includes('Poolside Living'), 'projects ' + JSON.stringify(j.projects));
  assert(store.has('assets/abc123-photo.jpg'), 'object still there after blocked delete');
});
await t('DELETE /api/assets/<id>?force=1 removes R2 object + clip row', async () => {
  const res = mockRes(); await assetOne(oper({ method: 'DELETE', query: { id: 'abc123', force: '1' } }), res);
  assertEq(res.statusCode, 200);
  assert(!store.has('assets/abc123-photo.jpg'), 'R2 object gone');
  const docs = await readDocs();
  assert(!docs['clips/cabc'], 'clip row gone');
});
await t('DELETE /api/assets bulk removes objects + rows', async () => {
  const res = mockRes(); await assets(oper({ method: 'DELETE', body: { ids: ['def456', 'jkl012'] } }), res);
  assertEq(res.statusCode, 200);
  const j = JSON.parse(res.body);
  assertEq(j.deleted.length, 2);
  assert(!store.has('assets/def456-clip.mp4'), 'video object gone');
  assert(!store.has('assets/jkl012-orphan.png'), 'orphan object gone');
  const docs = await readDocs();
  assert(!docs['clips/cdef'], 'clip row gone');
});
await t('DELETE /api/assets/<id> unknown -> 404', async () => {
  const res = mockRes(); await assetOne(oper({ method: 'DELETE', query: { id: 'nope99' } }), res);
  assertEq(res.statusCode, 404);
});
await t('DELETE /api/assets empty ids -> 400', async () => {
  const res = mockRes(); await assets(oper({ method: 'DELETE', body: { ids: [] } }), res);
  assertEq(res.statusCode, 400);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
