// Local end-to-end test server for the cloud deployment. Test-only code:
// it serves public/ (the cloud studio copy) on one port, mounts the REAL
// api/*.js route handlers, and stubs S3 on the same port so the presigned
// PUT/GET URLs the routes generate actually work in the browser.
// All state is in-memory. It never touches the in-house host, the real
// db.json, uploads/, or inbox/.
//   PORT=8770 node test/e2e-server.mjs
// Env it sets for itself (override as needed):
//   R2_ENDPOINT=http://localhost:8770/s3  R2_BUCKET=test-bucket
//   STUDIO_PASSWORD=test-password  NX_OPERATOR_KEY=test-operator-key
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = +(process.env.PORT || 8770);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const PUBLIC = path.join(ROOT, 'public');
process.env.R2_ENDPOINT = process.env.R2_ENDPOINT || `http://localhost:${PORT}/s3`;
process.env.R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || 'test';
process.env.R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'test';
process.env.R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || 'test';
process.env.R2_BUCKET = process.env.R2_BUCKET || 'test-bucket';
process.env.STUDIO_PASSWORD = process.env.STUDIO_PASSWORD || 'test-password';
process.env.NX_OPERATOR_KEY = process.env.NX_OPERATOR_KEY || 'test-operator-key';

// ---- in-memory S3 stub -------------------------------------------------
const store = new Map(); // key -> { body: Buffer, contentType: string }
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function s3Handler(req, res, pathname, query) {
  // pathname: /s3/<bucket>/<key...> or /s3/<bucket>?list-type=2
  const parts = pathname.split('/').filter(Boolean);
  const bucket = parts[1] || '';
  const key = decodeURIComponent(parts.slice(2).join('/'));
  if (bucket !== process.env.R2_BUCKET) { res.statusCode = 404; res.end('NoSuchBucket'); return; }
  if (query['list-type'] === '2') {
    const prefix = query.prefix || '';
    const items = [...store.keys()].filter((k) => k.startsWith(prefix));
    const xml = `<?xml version="1.0" encoding="UTF-8"?><ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Name>${esc(bucket)}</Name><Prefix>${esc(prefix)}</Prefix><KeyCount>${items.length}</KeyCount><MaxKeys>1000</MaxKeys><IsTruncated>false</IsTruncated>${items.map((k) => `<Contents><Key>${esc(k)}</Key><LastModified>2026-01-01T00:00:00.000Z</LastModified><Size>${store.get(k).body.length}</Size></Contents>`).join('')}</ListBucketResult>`;
    res.setHeader('content-type', 'application/xml'); res.end(xml); return;
  }
  if (req.method === 'PUT') {
    const chunks = [];
    req.on('data', (d) => chunks.push(d));
    req.on('end', () => {
      store.set(key, { body: Buffer.concat(chunks), contentType: req.headers['content-type'] || 'application/octet-stream' });
      res.statusCode = 200; res.setHeader('ETag', '"test"'); res.end();
    });
    return;
  }
  if (req.method === 'GET') {
    const obj = store.get(key);
    if (!obj) { res.statusCode = 404; res.setHeader('content-type', 'application/xml'); res.end('<?xml version="1.0" encoding="UTF-8"?><Error><Code>NoSuchKey</Code></Error>'); return; }
    res.setHeader('content-type', obj.contentType); res.setHeader('content-length', obj.body.length); res.end(obj.body); return;
  }
  if (req.method === 'HEAD') {
    const obj = store.get(key);
    if (!obj) { res.statusCode = 404; res.end(); return; }
    res.setHeader('content-length', obj.body.length); res.setHeader('content-type', obj.contentType); res.end(); return;
  }
  if (req.method === 'DELETE') { store.delete(key); res.statusCode = 204; res.end(); return; }
  res.statusCode = 405; res.end();
}

// ---- API handlers (the real route modules) ------------------------------
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

const ROUTES = [
  [/^\/_db$/, db], [/^\/_up$/, up], [/^\/_assets$/, assets],
  [/^\/_blob\/([a-z0-9]+)$/, blob, (m, q) => { q.id = m[1]; }],
  [/^\/api\/login$/, login],
  [/^\/api\/projects$/, projects],
  [/^\/api\/projects\/([a-z0-9]+)$/, projectOne, (m, q) => { q.id = m[1]; }],
  [/^\/api\/exports$/, exportsList],
  [/^\/api\/exports\/([a-z0-9]+)\/file$/, exportFile, (m, q) => { q.id = m[1]; }],
  [/^\/api\/exports\/([a-z0-9]+)$/, exportOne, (m, q) => { q.id = m[1]; }],
  [/^\/api\/import-batch$/, importBatch],
  [/^\/api\/storage$/, storage],
  [/^\/api\/assets$/, assets],
  [/^\/api\/assets\/([a-z0-9]+)$/, assets, (m, q) => { q.id = m[1]; }],
];

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (d) => chunks.push(d));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

// ---- static files -------------------------------------------------------
const MT = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.woff2': 'font/woff2', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml' };

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const pathname = decodeURIComponent(u.pathname);
  const query = Object.fromEntries(u.searchParams.entries());
  try {
    if (pathname.startsWith('/s3/')) return s3Handler(req, res, pathname, query);
    for (const [re, handler, fill] of ROUTES) {
      const m = re.exec(pathname);
      if (!m) continue;
      req.query = query;
      if (fill) fill(m, req.query);
      // The login route reads the raw stream itself; everything else gets a parsed JSON body.
      if (handler !== login) {
        const raw = await readBody(req);
        const ct = String(req.headers['content-type'] || '');
        if (raw.length && ct.includes('application/json')) { try { req.body = JSON.parse(raw.toString()); } catch (e) { req.body = {}; } }
        else if (raw.length) req.body = raw.toString();
        // No body: mark it parsed so readJsonBody (which attaches stream
        // listeners) never waits on an already-consumed stream.
        else req.body = {};
      }
      await handler(req, res);
      return;
    }
    let p = pathname === '/' ? '/index.html' : pathname;
    const f = path.join(PUBLIC, p);
    if (!f.startsWith(PUBLIC) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; res.end('nf'); return; }
    res.setHeader('content-type', MT[path.extname(f)] || 'application/octet-stream');
    res.setHeader('cache-control', 'no-store');
    fs.createReadStream(f).pipe(res);
  } catch (e) {
    console.error('server error:', e);
    if (!res.headersSent) { res.statusCode = 500; res.end('server error'); }
  }
});

server.listen(PORT, () => console.log(`e2e test server up on ${PORT} (R2 stub + real api routes, in-memory state)`));
