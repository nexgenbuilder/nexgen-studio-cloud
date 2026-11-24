// Upload the studio's static binary assets to a PUBLIC R2 bucket, so the
// Vercel deployment can serve them via rewrites (see vercel.json).
// Why this exists: the app's binary assets (audio sound packs, fonts, template
// thumbnails) are ~89 MB and cannot go through the GitHub connector's
// push_files (UTF-8 only, 16 MiB cap), and there is no git/CLI credential on
// this machine. Text files (js, html, json) go to GitHub; binaries go here.
// These files are public by design — they are the app's own fonts, sounds and
// thumbnails, served to every visitor of the site as static assets. DPG
// footage, the project db, and finished exports stay in the PRIVATE bucket
// (nexgen-studio-assets) and are never here.
// Usage:
//   R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... \
//     R2_STATIC_BUCKET=nexgen-studio-static \
//     node scripts/upload-static-to-r2.mjs [--dry-run]
// Preserves public/ relative paths as R2 keys (audio/bed_x.mp4, fonts/y.woff2...).
// Skips files already in R2 at the same size. Safe to re-run.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const DRY = process.argv.includes('--dry-run');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(HERE, '..', 'public');
const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_STATIC_BUCKET } = process.env;
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_STATIC_BUCKET) {
  console.error('Missing R2 env vars (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_STATIC_BUCKET)');
  process.exit(1);
}
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});
const MT = {
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
};
const BINARY_EXTS = new Set(Object.keys(MT));

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (BINARY_EXTS.has(path.extname(e.name).toLowerCase())) files.push(p);
  }
})(PUBLIC_DIR);
console.log(`public/ binary files: ${files.length}`);
let up = 0, skip = 0, bytes = 0;
for (const p of files) {
  const key = path.relative(PUBLIC_DIR, p).split(path.sep).join('/');
  const size = fs.statSync(p).size;
  let exists = false;
  try { const h = await s3.send(new HeadObjectCommand({ Bucket: R2_STATIC_BUCKET, Key: key })); exists = h.ContentLength === size; } catch (e) { /* not there */ }
  if (exists) { skip++; continue; }
  console.log(`${DRY ? '[dry-run] would upload' : 'uploading'} ${key} (${(size / 1048576).toFixed(2)} MB)`);
  if (!DRY) {
    await s3.send(new PutObjectCommand({ Bucket: R2_STATIC_BUCKET, Key: key, Body: fs.createReadStream(p), ContentType: MT[path.extname(p).toLowerCase()] || 'application/octet-stream' }));
  }
  up++; bytes += size;
}
console.log(`static assets: ${up} uploaded (${(bytes / 1048576).toFixed(1)} MB), ${skip} already present`);
console.log(DRY ? 'DRY RUN — nothing was written.' : 'DONE.');
