// bulk-import.mjs — bulk-import a local directory of photos/videos into the
// hosted NexGen Studio, fast.
//
// Why this exists: the first DPG import took ~55 min for 145 files because
// every video was ffmpeg-compressed (medium preset, 2-way parallel, weak
// 1.5-CPU VM, ~3 min/video) and every file was a separate upload + a separate
// db write, all sequential. This script is the fix:
//   1. Probe each file once with ffprobe (dimensions / duration).
//   2. Upload RAW files in parallel via presigned PUTs straight to R2
//      (POST /_up -> PUT bytes to uploadUrl; Vercel never carries file bytes).
//   3. ONE batched db write at the end (POST /api/import-batch, <=500 clips).
//
// Usage:
//   node scripts/bulk-import.mjs --dir <local-dir> --brand <brand-id>
//     [--base-url <studio-url>] [--key-file <mode-600-secrets-file>]
//     [--concurrency 4] [--dry-run] [--compress]
//
//   --dir         Local directory, scanned recursively for
//                 .mp4/.mov/.m4v/.webm/.jpg/.jpeg/.png/.webp. Anything else
//                 is skipped (and reported).
//   --brand       Brand id every clip gets (e.g. dpg, webflix). The clip
//                 project is the brand uppercased.
//   --base-url    Studio base URL. Default:
//                 https://nexgen-studio-cloud-nexgen-c282.vercel.app
//   --key-file    File holding NX_OPERATOR_KEY (KEY=VALUE lines, comments
//                 with #). Default: ~/workspace/nexgen-studio-secrets.env.
//                 NX_OPERATOR_KEY in the environment wins over the file.
//                 The key is never printed.
//   --concurrency Parallel uploads. Default 4.
//   --dry-run     Probe + list what would be uploaded and the clip rows
//                 that would be written. Writes nothing, calls no API
//                 that mutates state.
//   --compress    See COMPRESSION below.
//
// NO COMPRESSION BY DEFAULT. Files are uploaded RAW, whatever their size
// (up to the /_up cap). Compression is deliberately opt-in because it was
// the bottleneck that made the first import take 55 minutes.
//
// THE 1 GB CAP + --compress CONDITION. /_up accepts files up to 1 GB.
// A file larger than 1 GB is failed (reported, skipped, exit non-zero)
// UNLESS --compress is passed: then JUST that file is compressed with
//   ffmpeg -preset veryfast -crf 23, scaled to at most 1920x1080,
// to a temp file, and the compressed file is uploaded instead. If ffmpeg
// is missing or the compressed file still exceeds 1 GB, that file fails
// with a clear message. Files at or under 1 GB are never compressed,
// even with --compress.
//
// PROXY. This VM's egress goes through an HTTP CONNECT proxy; Node 24 sets
// NODE_USE_ENV_PROXY=1 so global fetch should honour HTTPS_PROXY. The script
// verifies that early with a small GET to the base URL: if fetch fails with
// a TLS/proxy error it falls back to `curl` (system binary, honours the
// proxy env vars) for every request and prints which transport it used.
// PRESIGNED PUTS need an explicit Content-Length header: the upload body is
// a file stream (unknown length), which fetch would send chunked — real R2
// rejects that with HTTP 411. The script always passes the known file size.
//
// EXIT CODE. 0 only when everything imported (or every clip skipped as
// already_exists). Non-zero if any file failed (probe, upload, compress)
// or the batch call failed.
//
// Requires: node >= 22 (global fetch), /usr/bin/ffprobe, and ffmpeg only
// when --compress has to compress an over-cap file. Node builtins only —
// no new dependencies.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const DEFAULT_BASE_URL = 'https://nexgen-studio-cloud-nexgen-c282.vercel.app';
const DEFAULT_KEY_FILE = path.join(os.homedir(), 'workspace', 'nexgen-studio-secrets.env');
const UP_CAP_BYTES = 1024 * 1024 * 1024; // 1 GB — the /_up cap (being raised to this)
const BATCH_MAX = 500; // max clips per POST /api/import-batch
const UP_ATTEMPTS = 3; // PUT attempts per file, fresh presigned URL each time
const STILL_FRAMES = 9000; // still-photo convention: n = 9000 frames at 30 fps

const VIDEO_EXTS = new Set(['.mp4', '.mov', '.m4v', '.webm']);
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const SUPPORTED = new Set([...VIDEO_EXTS, ...IMAGE_EXTS]);
const CONTENT_TYPE = {
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.m4v': 'video/mp4',
  '.webm': 'video/webm', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp',
};

const mb = (n) => (n / 1048576).toFixed(2);
const secs = (ms) => (ms / 1000).toFixed(1);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stamp = () => new Date().toISOString();

function usageError(msg) {
  console.error(`error: ${msg}`);
  console.error('usage: node scripts/bulk-import.mjs --dir <local-dir> --brand <brand-id> [--base-url <url>] [--key-file <file>] [--concurrency 4] [--dry-run] [--compress]');
  process.exit(2);
}

function parseArgs(argv) {
  const o = { baseUrl: DEFAULT_BASE_URL, keyFile: DEFAULT_KEY_FILE, concurrency: 4, dryRun: false, compress: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => { if (i + 1 >= argv.length) usageError(`${a} needs a value`); return argv[++i]; };
    if (a === '--dir') o.dir = next();
    else if (a === '--brand') o.brand = next();
    else if (a === '--base-url') o.baseUrl = next().replace(/\/+$/, '');
    else if (a === '--key-file') o.keyFile = next();
    else if (a === '--concurrency') { o.concurrency = Number(next()); if (!Number.isInteger(o.concurrency) || o.concurrency < 1) usageError('--concurrency must be a positive integer'); }
    else if (a === '--dry-run') o.dryRun = true;
    else if (a === '--compress') o.compress = true;
    else if (a === '--help' || a === '-h') { console.log('usage: node scripts/bulk-import.mjs --dir <local-dir> --brand <brand-id> [--base-url <url>] [--key-file <file>] [--concurrency 4] [--dry-run] [--compress]'); process.exit(0); }
    else usageError(`unknown argument: ${a}`);
  }
  if (!o.dir) usageError('--dir is required');
  if (!o.brand) usageError('--brand is required');
  return o;
}

// ---- operator key: env wins, else the secrets file. Never printed. ----
function loadOperatorKey(keyFile) {
  if (process.env.NX_OPERATOR_KEY) return process.env.NX_OPERATOR_KEY;
  if (!fs.existsSync(keyFile)) return null;
  for (const line of fs.readFileSync(keyFile, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const m = /^NX_OPERATOR_KEY\s*=\s*(.+)$/.exec(t);
    if (m) return m[1].trim().replace(/^['"]|['"]$/g, '');
  }
  return null;
}

// ---- transport: global fetch first; curl fallback on proxy/TLS failure --
// fetch is verified early with a small GET to the base URL. If that fails
// with a proxy/TLS error, every later request goes through `curl`, which
// honours HTTPS_PROXY/HTTP_PROXY itself. Which path is used is printed.
let transport = 'fetch';

async function fetchOrCurl(url, opts = {}) {
  if (transport === 'curl') return curlRequest(url, opts);
  try {
    return await doFetch(url, opts);
  } catch (e) {
    if (isProxyError(e) && !opts._noFallback) {
      console.log(`[proxy] fetch failed (${e.message}); falling back to curl for all requests`);
      transport = 'curl';
      return curlRequest(url, opts);
    }
    throw e;
  }
}

function isProxyError(e) {
  const m = String(e?.message || e?.cause?.message || e);
  return /WRONG_VERSION_NUMBER|ECONNRESET|socket hang up|fetch failed|TLS|proxy|UND_ERR/i.test(m);
}

async function doFetch(url, { method = 'GET', headers = {}, body = null, filePath = null, contentLength = null } = {}) {
  const init = { method, headers: { ...headers } };
  if (filePath) {
    init.body = fs.createReadStream(filePath);
    init.duplex = 'half'; // streaming upload body (Node >= 18)
    // R2 presigned PUTs reject chunked transfer encoding (HTTP 411):
    // a stream body has no known length, so state it explicitly.
    if (contentLength !== null) init.headers['content-length'] = String(contentLength);
  } else if (body !== null) {
    init.body = body;
  }
  const res = await fetch(url, init);
  return { status: res.status, text: await res.text() };
}

async function curlRequest(url, { method = 'GET', headers = {}, body = null, filePath = null } = {}) {
  const args = ['-sS', '-w', '\n%{http_code}', '-X', method];
  for (const [k, v] of Object.entries(headers)) args.push('-H', `${k}: ${v}`);
  if (filePath) args.push('--data-binary', `@${filePath}`);
  else if (body !== null) args.push('--data-binary', body);
  args.push(url);
  let out;
  try {
    out = (await execFileAsync('curl', args, { maxBuffer: 64 * 1024 * 1024 })).stdout;
  } catch (e) {
    // curl exits non-zero on HTTP errors only with --fail; without it a
    // non-zero exit means the request itself failed (DNS/proxy/connect).
    throw new Error(`curl ${method} ${url} failed: ${String(e.stderr || e.message || e).trim()}`);
  }
  const nl = out.lastIndexOf('\n');
  return { status: Number(out.slice(nl + 1).trim()), text: out.slice(0, nl) };
}

async function verifyTransport(baseUrl) {
  try {
    const r = await fetch(baseUrl, { method: 'GET' });
    await r.text();
    console.log(`[proxy] fetch works (GET ${baseUrl} -> ${r.status}); using fetch`);
    transport = 'fetch';
    return true;
  } catch (e) {
    console.log(`[proxy] fetch probe failed (${e.message}); trying curl`);
    try {
      const r = await curlRequest(baseUrl, { method: 'GET' });
      console.log(`[proxy] curl works (GET ${baseUrl} -> ${r.status}); using curl`);
      transport = 'curl';
      return true;
    } catch (e2) {
      console.log(`[proxy] WARNING: neither fetch nor curl could reach ${baseUrl}: ${e2.message}`);
      return false;
    }
  }
}

// ---- API calls (Bearer auth on the studio API only, never on presigned PUTs) ----
async function apiJson(baseUrl, key, method, pathName, payload) {
  const r = await fetchOrCurl(baseUrl + pathName, {
    method,
    headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  let data = null;
  try { data = JSON.parse(r.text); } catch { /* non-JSON body */ }
  if (r.status < 200 || r.status >= 300) {
    throw new Error(`${method} ${pathName} -> HTTP ${r.status}: ${(data && (data.error || data.message)) || r.text.slice(0, 200)}`);
  }
  return data;
}

// ---- scan ---------------------------------------------------------------
function scanDir(dir) {
  const files = [];
  const skipped = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) {
        const ext = path.extname(e.name).toLowerCase();
        if (SUPPORTED.has(ext)) files.push(p);
        else skipped.push(p);
      }
    }
  })(dir);
  files.sort();
  return { files, skipped };
}

// ---- probe --------------------------------------------------------------
async function probe(file) {
  const ext = path.extname(file).toLowerCase();
  const kind = VIDEO_EXTS.has(ext) ? 'video' : 'photo';
  const { stdout } = await execFileAsync('/usr/bin/ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,duration',
    '-show_entries', 'format=duration',
    '-of', 'json', file,
  ], { maxBuffer: 16 * 1024 * 1024 });
  const j = JSON.parse(stdout);
  const stream = (j.streams || [])[0] || {};
  const w = Number(stream.width);
  const h = Number(stream.height);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    throw new Error('ffprobe returned no video stream dimensions');
  }
  let n;
  if (kind === 'photo') {
    n = STILL_FRAMES;
  } else {
    const dur = Number(stream.duration ?? j.format?.duration);
    if (!Number.isFinite(dur) || dur <= 0) throw new Error('ffprobe returned no duration');
    n = Math.max(1, Math.round(dur * 30));
  }
  return { kind, w, h, n };
}

// ---- compress (only for files over the 1 GB cap, only with --compress) ---
async function compressOverCap(file) {
  const tmp = path.join(os.tmpdir(), `bulk-import-${process.pid}-${path.basename(file, path.extname(file))}.mp4`);
  try {
    await execFileAsync('ffmpeg', [
      '-y', '-v', 'error', '-i', file,
      '-vf', "scale=1920:1080:force_original_aspect_ratio=decrease",
      '-preset', 'veryfast', '-crf', '23',
      '-movflags', '+faststart',
      tmp,
    ], { maxBuffer: 16 * 1024 * 1024 });
  } catch (e) {
    try { fs.unlinkSync(tmp); } catch { /* already gone */ }
    throw new Error(`ffmpeg failed: ${String(e.stderr || e.message || e).trim().slice(0, 200)}`);
  }
  const size = fs.statSync(tmp).size;
  if (size > UP_CAP_BYTES) {
    try { fs.unlinkSync(tmp); } catch { /* ignore */ }
    throw new Error(`still ${mb(size)} MB after compression — over the 1 GB /_up cap`);
  }
  return { tmp, size };
}

// ---- upload one file: fresh presigned URL per attempt, up to 3 tries -----
async function uploadOne(baseUrl, key, item) {
  const ext = path.extname(item.file).toLowerCase();
  const type = CONTENT_TYPE[ext] || 'application/octet-stream';
  let uploadPath = item.file;
  let uploadSize = item.size;
  let uploadName = path.basename(item.file);
  let tmpFile = null;

  if (item.size > UP_CAP_BYTES) {
    if (!item.compress) {
      throw new Error(`${mb(item.size)} MB exceeds the 1 GB /_up cap — re-run with --compress to compress just this file`);
    }
    console.log(`  [${uploadName}] over 1 GB cap — compressing (ffmpeg veryfast, crf 23, max 1920x1080)`);
    const c = await compressOverCap(item.file);
    tmpFile = c.tmp;
    uploadPath = tmpFile;
    uploadSize = c.size;
    console.log(`  [${uploadName}] compressed to ${mb(uploadSize)} MB`);
  }

  try {
    let lastErr;
    for (let attempt = 1; attempt <= UP_ATTEMPTS; attempt++) {
      try {
        // Fresh presigned URL per attempt (they expire; a stale URL must
        // never be retried).
        const up = await apiJson(baseUrl, key, 'POST', '/_up', { name: uploadName, type, size: uploadSize });
        if (!up?.id || !up?.uploadUrl) throw new Error(`/_up returned no id/uploadUrl: ${JSON.stringify(up).slice(0, 200)}`);
        console.log(`  [${uploadName}] ${mb(uploadSize)} MB — PUT attempt ${attempt}/${UP_ATTEMPTS}`);
        // No Authorization header on the presigned PUT: the URL carries
        // its own signature. content-length is explicit: a stream body
        // would otherwise go out chunked and R2 rejects it with 411.
        const put = await fetchOrCurl(up.uploadUrl, {
          method: 'PUT',
          headers: { 'content-type': type },
          filePath: uploadPath,
          contentLength: uploadSize,
        });
        if (put.status < 200 || put.status >= 300) {
          throw new Error(`PUT to presigned URL -> HTTP ${put.status}: ${put.text.slice(0, 200)}`);
        }
        return { asset: up.id, uploadSize };
      } catch (e) {
        lastErr = e;
        console.log(`  [${uploadName}] attempt ${attempt}/${UP_ATTEMPTS} failed: ${e.message}`);
        if (attempt < UP_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1)); // 1s, 2s backoff
      }
    }
    throw lastErr;
  } finally {
    if (tmpFile) { try { fs.unlinkSync(tmpFile); } catch { /* ignore */ } }
  }
}

// ---- worker pool ----------------------------------------------------------
async function runPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      try { results[i] = { ok: true, value: await fn(items[i], i) }; }
      catch (e) { results[i] = { ok: false, error: e }; }
    }
  });
  await Promise.all(workers);
  return results;
}

// ---- main -----------------------------------------------------------------
async function main() {
  const t0 = Date.now();
  const opts = parseArgs(process.argv.slice(2));
  const dir = path.resolve(opts.dir);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) usageError(`--dir is not a directory: ${dir}`);

  const key = loadOperatorKey(opts.keyFile);
  if (!key && !opts.dryRun) usageError(`no NX_OPERATOR_KEY in env or ${opts.keyFile}`);
  if (!key && opts.dryRun) console.log('[dry-run] no operator key found — continuing (no API calls will be made)');

  console.log(`bulk-import: dir=${dir} brand=${opts.brand} base=${opts.baseUrl} concurrency=${opts.concurrency}${opts.dryRun ? ' DRY-RUN' : ''}${opts.compress ? ' --compress' : ''}`);

  // Phase 0 — verify the fetch/proxy path early, before any real work.
  const reachable = await verifyTransport(opts.baseUrl);
  if (!reachable && !opts.dryRun) {
    console.error('error: cannot reach the studio base URL with either fetch or curl — aborting before any upload');
    process.exit(1);
  }

  // Phase 1 — scan.
  const { files, skipped } = scanDir(dir);
  console.log(`scan: ${files.length} supported files, ${skipped.length} skipped (unsupported type)`);
  for (const s of skipped.slice(0, 20)) console.log(`  skipped: ${path.relative(dir, s)}`);
  if (skipped.length > 20) console.log(`  ... and ${skipped.length - 20} more skipped`);
  if (files.length === 0) { console.log('nothing to import.'); return 0; }

  // Phase 2 — probe.
  const tProbe = Date.now();
  const probed = [];
  const probeFailed = [];
  for (const file of files) {
    try {
      const p = await probe(file);
      probed.push({ file, size: fs.statSync(file).size, ...p });
    } catch (e) {
      console.log(`  WARNING: ffprobe failed on ${path.relative(dir, file)} — skipping: ${e.message}`);
      probeFailed.push({ file, error: e.message });
    }
  }
  const probeMs = Date.now() - tProbe;
  const totalBytes = probed.reduce((a, p) => a + p.size, 0);
  console.log(`probe: ${probed.length} ok, ${probeFailed.length} failed, ${mb(totalBytes)} MB total — ${secs(probeMs)}s`);

  // Clip rows (ClipIn per the /api/import-batch contract).
  const clips = probed.map((p) => ({
    name: path.basename(p.file, path.extname(p.file)),
    kind: p.kind,
    brand: opts.brand,
    project: opts.brand.toUpperCase(),
    still: p.kind === 'photo',
    w: p.w,
    h: p.h,
    n: p.n,
    // asset is filled in after upload; the other ClipIn fields default
    // server-side (file '', poster '', src 'up', addedAt now).
    _file: p.file,
    _size: p.size,
  }));

  if (opts.dryRun) {
    for (const c of clips) {
      console.log(`  [dry-run] would upload ${path.relative(dir, c._file)} (${c.kind} ${c.w}x${c.h} n=${c.n} ${mb(c._size)} MB) -> clip name="${c.name}" brand=${c.brand} project=${c.project} still=${c.still}`);
    }
    console.log(`DRY RUN — nothing was written. ${clips.length} clip rows would be sent in ${Math.ceil(clips.length / BATCH_MAX)} batch call(s) (max ${BATCH_MAX} per call).`);
    console.log(`timings: probe ${secs(probeMs)}s | upload 0.0s (dry-run) | batch-write 0.0s (dry-run) | total ${secs(Date.now() - t0)}s`);
    return probeFailed.length ? 1 : 0;
  }

  // Phase 3 — uploads (parallel, raw by default).
  const tUp = Date.now();
  const upResults = await runPool(clips, opts.concurrency, async (c) => {
    const r = await uploadOne(opts.baseUrl, key, { file: c._file, size: c._size, compress: opts.compress });
    console.log(`  [${path.basename(c._file)}] uploaded -> asset ${r.asset}`);
    return r;
  });
  const upMs = Date.now() - tUp;
  const uploaded = [];
  const uploadFailed = [];
  upResults.forEach((r, i) => {
    if (r.ok) uploaded.push({ ...clips[i], asset: r.value.asset });
    else { console.log(`  FAILED: ${path.relative(dir, clips[i]._file)} — ${r.error.message}`); uploadFailed.push({ file: clips[i]._file, error: r.error.message }); }
  });
  const upBytes = uploaded.reduce((a, c) => a + c._size, 0);
  console.log(`upload: ${uploaded.length} ok (${mb(upBytes)} MB), ${uploadFailed.length} failed — ${secs(upMs)}s`);
  if (uploaded.length === 0) {
    console.error('error: no files uploaded — batch write skipped');
    return 1;
  }

  // Phase 4 — ONE batched db write (chunked only if over the 500-clip cap).
  const tBatch = Date.now();
  const rows = uploaded.map(({ _file, _size, ...clip }) => clip);
  let created = 0;
  let skippedRows = 0;
  let batchFailed = null;
  for (let i = 0; i < rows.length; i += BATCH_MAX) {
    const chunk = rows.slice(i, i + BATCH_MAX);
    try {
      const res = await apiJson(opts.baseUrl, key, 'POST', '/api/import-batch', { clips: chunk });
      created += (res.created || []).length;
      skippedRows += (res.skipped || []).length;
      for (const s of (res.skipped || []).slice(0, 10)) console.log(`  skipped (already_exists): ${s.asset} — ${s.reason || ''}`);
      console.log(`batch ${Math.floor(i / BATCH_MAX) + 1}: created ${(res.created || []).length}, skipped ${(res.skipped || []).length}, total ${res.total ?? chunk.length}`);
    } catch (e) {
      batchFailed = e;
      console.error(`batch call failed (clips ${i + 1}-${i + chunk.length}): ${e.message}`);
      break;
    }
  }
  const batchMs = Date.now() - tBatch;
  console.log(`batch-write: created ${created}, skipped ${skippedRows}${batchFailed ? `, FAILED: ${batchFailed.message}` : ''} — ${secs(batchMs)}s`);

  // Summary.
  const failedTotal = probeFailed.length + uploadFailed.length + (batchFailed ? 1 : 0);
  console.log(`DONE: ${created} created, ${skippedRows} already-exists, ${uploadFailed.length} upload failures, ${probeFailed.length} probe failures`);
  console.log(`timings: probe ${secs(probeMs)}s | upload ${secs(upMs)}s | batch-write ${secs(batchMs)}s | total ${secs(Date.now() - t0)}s`);
  if (failedTotal) {
    console.error(`FAILED: ${failedTotal} problem(s) — see above. Uploaded assets whose batch write failed may need a re-run (already_exists skips make it safe).`);
    return 1;
  }
  return 0;
}

process.exitCode = await main().catch((e) => {
  console.error(`fatal: ${e.stack || e.message}`);
  return 1;
});
