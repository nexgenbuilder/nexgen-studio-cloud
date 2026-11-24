// Shared helpers for the NexGen Studio cloud API routes (Vercel, Node runtime).
// Storage: one private Cloudflare R2 bucket.
//   - Project db: a single object at key `db.json` (kilobytes of JSON).
//   - Assets: objects at key `assets/<id>-<sanitized-filename>` — the same
//     naming the in-house host uses, so asset ids can be carried over.
// The bucket is private. Browsers never talk to R2 directly except through
// short-lived presigned URLs: presigned PUT for uploads, presigned GET
// (via a 302 from /_blob/<id>) for downloads. The R2 bucket needs a CORS
// policy allowing GET + PUT from the Vercel app origin (see RUNBOOK.md).
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'node:crypto';

export const DB_KEY = 'db.json';
export const ASSET_PREFIX = 'assets/';

function cfg() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    throw new Error('Missing R2 env vars (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET)');
  }
  return { accountId: R2_ACCOUNT_ID, accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, bucket: R2_BUCKET };
}

// Test seam: test/routes.test.mjs sets globalThis.__NX_R2_OVERRIDE__ to a fake
// client so the route logic can be exercised without real R2 credentials.
// Never set in production.
export function getS3() {
  if (globalThis.__NX_R2_OVERRIDE__) return globalThis.__NX_R2_OVERRIDE__;
  const c = cfg();
  // R2_ENDPOINT override: local end-to-end testing only (test/e2e-server.mjs
  // points it at a stub S3 server on localhost). Unset in production, where
  // the endpoint is the account's R2 URL with virtual-host style.
  const endpoint = process.env.R2_ENDPOINT || `https://${c.accountId}.r2.cloudflarestorage.com`;
  return new S3Client({
    region: 'auto',
    endpoint,
    forcePathStyle: !!process.env.R2_ENDPOINT,
    credentials: { accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey },
  });
}

export function bucket() { return cfg().bucket; }

async function bodyText(res) {
  // SDK v3 GetObject returns a streaming body; collect it as text.
  if (typeof res.Body?.transformToString === 'function') return res.Body.transformToString();
  const chunks = [];
  for await (const chunk of res.Body) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

export async function getDb(s3) {
  const client = s3 || getS3();
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: bucket(), Key: DB_KEY }));
    return JSON.parse(await bodyText(res));
  } catch (e) {
    if (e && (e.name === 'NoSuchKey' || e.$metadata?.httpStatusCode === 404)) return { docs: {} };
    throw e;
  }
}

export async function putDb(doc, s3) {
  const client = s3 || getS3();
  const docs = doc && typeof doc === 'object' && doc.docs && typeof doc.docs === 'object' ? doc.docs : {};
  await client.send(new PutObjectCommand({
    Bucket: bucket(), Key: DB_KEY,
    Body: JSON.stringify({ docs }),
    ContentType: 'application/json',
  }));
  return { docs };
}

export function sanitizeName(name) {
  return String(name || 'asset').replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 80) || 'asset';
}

export function newAssetId() {
  return 'a' + Math.random().toString(36).slice(2, 14);
}

export function assetKey(id, name) { return ASSET_PREFIX + id + '-' + sanitizeName(name); }

export function parseAssetKey(key) {
  const m = /^assets\/([a-z0-9]+)-(.+)$/.exec(key || '');
  return m ? { id: m[1], name: m[2] } : null;
}

// Find the full object key for an asset id (keys embed the original filename).
export async function findAssetKey(id, s3) {
  const client = s3 || getS3();
  const res = await client.send(new ListObjectsV2Command({ Bucket: bucket(), Prefix: ASSET_PREFIX + id + '-' }));
  const obj = (res.Contents || [])[0];
  return obj ? obj.Key : null;
}

export async function listAssets(s3) {
  const client = s3 || getS3();
  const out = [];
  let token;
  do {
    const res = await client.send(new ListObjectsV2Command({ Bucket: bucket(), Prefix: ASSET_PREFIX, ContinuationToken: token }));
    for (const o of res.Contents || []) {
      const p = parseAssetKey(o.Key);
      if (p) out.push({ id: p.id, name: p.name, size: o.Size || 0, url: '/_blob/' + p.id, key: o.Key });
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return out;
}

export async function presignGet(key, expiresIn = 3600, s3) {
  const client = s3 || getS3();
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket(), Key: key }), { expiresIn });
}

export async function presignPut(key, contentType, expiresIn = 600, s3) {
  const client = s3 || getS3();
  return getSignedUrl(client, new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType }), { expiresIn });
}

export async function deleteAsset(id, s3) {
  const client = s3 || getS3();
  const key = await findAssetKey(id, client);
  if (!key) return false;
  await client.send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
  return true;
}

// Projects that reference a clip id anywhere in their doc (shot maps,
// free-timeline items, any field). The clip id is a random base36 token,
// so an exact string match inside a project doc is a real reference.
export function findClipRefs(docs, clipId) {
  const refs = [];
  for (const [key, p] of Object.entries(docs || {})) {
    if (!key.startsWith('projects/') || !p || typeof p !== 'object') continue;
    let hit = false;
    const walk = (v) => {
      if (hit) return;
      if (typeof v === 'string') { if (v === clipId) hit = true; return; }
      if (v && typeof v === 'object') for (const k in v) walk(v[k]);
    };
    walk(p);
    if (hit) refs.push({ projectId: key.slice(9), projectName: p.name || key.slice(9) });
  }
  return refs;
}

// Delete assets end to end: R2 object + every clip row that points at it,
// in ONE batched db write. Blocks (in `blocked`) when a project's shots
// reference any of the asset's clips, unless force is true — the caller
// must get an explicit per-asset override from the user first.
// Returns { deleted: [{asset, clips}], blocked: [{asset, reason, projects}],
//           notFound: [assetId] }.
export async function deleteAssets(ids, { force = false } = {}, s3) {
  const client = s3 || getS3();
  const keyById = new Map((await listAssets(client)).map((a) => [a.id, a.key]));
  const db = await getDb(client);
  const docs = db.docs || {};
  const deleted = [], blocked = [], notFound = [];
  let changed = false;
  for (const id of ids) {
    const clipRows = Object.entries(docs)
      .filter(([k, v]) => k.startsWith('clips/') && v && v.asset === id);
    const key = keyById.get(id);
    if (!key && clipRows.length === 0) { notFound.push(id); continue; }
    const projects = [];
    for (const [, v] of clipRows) {
      for (const r of findClipRefs(docs, v.id || v.asset)) {
        if (!projects.some((p) => p.projectId === r.projectId)) projects.push(r);
      }
    }
    if (projects.length && !force) {
      blocked.push({ asset: id, reason: 'in_use', projects: projects.map((p) => p.projectName) });
      continue;
    }
    if (key) await client.send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
    const clipIds = [];
    for (const [k, v] of clipRows) { clipIds.push(v.id || k.slice(6)); delete docs[k]; changed = true; }
    deleted.push({ asset: id, clips: clipIds });
  }
  if (changed) await putDb({ docs }, client);
  return { deleted, blocked, notFound };
}

// ---- auth: browser session (password cookie) OR operator API key --------
// Two credentials, two audiences:
//   - STUDIO_PASSWORD: humans in a browser. The login route sets a cookie
//     holding SHA-256(password); the cookie never holds the raw password.
//   - NX_OPERATOR_KEY: machine callers (Muse, phase-2 MCP/connector).
//     Sent as `Authorization: Bearer <key>`. Generate with:
//       openssl rand -hex 32
//     Either credential unlocks the same routes. The browser password gate
//     (middleware.js) and every API route both accept both.
export function authHash(password) {
  return createHash('sha256').update(String(password || '')).digest('hex');
}

function constantTimeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function readAuthCookie(req) {
  const raw = req.headers?.cookie || '';
  const m = /(?:^|;\s*)nx-auth=([^;]+)/.exec(raw);
  return m ? decodeURIComponent(m[1]) : '';
}

export function readBearer(req) {
  const raw = req.headers?.authorization || req.headers?.Authorization || '';
  const m = /^Bearer\s+(.+)$/.exec(String(raw).trim());
  return m ? m[1].trim() : '';
}

export function isCookieAuthenticated(req) {
  const pw = process.env.STUDIO_PASSWORD;
  if (!pw) return false; // no password configured: deny, fail closed
  return constantTimeEqual(readAuthCookie(req), authHash(pw));
}

// Operator (machine) auth: the caller proves it holds NX_OPERATOR_KEY.
// Compared on SHA-256 digests, never on the raw key.
export function isOperatorAuthenticated(req) {
  const key = process.env.NX_OPERATOR_KEY;
  if (!key) return false; // no operator key configured: operator auth is off
  const token = readBearer(req);
  if (!token) return false;
  return constantTimeEqual(authHash(token), authHash(key));
}

export function isAuthenticated(req) {
  return isCookieAuthenticated(req) || isOperatorAuthenticated(req);
}

export function unauthorized(res) {
  res.statusCode = 401;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify({ error: 'unauthorized' }));
}

export function sendJson(res, code, obj) {
  res.statusCode = code;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(obj));
}

export function sendError(res, code, message) {
  sendJson(res, code, { error: message });
}

// Read a JSON request body. Vercel parses JSON bodies automatically; this
// also handles raw streams (e.g. urlencoded form posts) for robustness.
export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body) { try { return JSON.parse(req.body); } catch (e) { return {}; } }
  const data = await new Promise((resolve) => {
    if (typeof req.on !== 'function') return resolve('');
    let d = '';
    req.on('data', (c) => { d += c; });
    req.on('end', () => resolve(d));
  });
  try { return JSON.parse(data || '{}'); } catch (e) { return {}; }
}
