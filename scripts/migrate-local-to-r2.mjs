// Migrate the in-house studio state to R2 (one-off, run after first deploy).
// READ-ONLY on the local machine: it reads ~/workspace/nexgen-studio-assets/
// (uploads/ + db.json) and writes only to R2. It never touches the running
// host, the render, or any local file.
//   1. Uploads every file in uploads/ to R2 under the SAME key the local host
//      used (assets/<id>-<filename>), so the asset ids in db.json keep working.
//      Files already in R2 at the same size are skipped.
//   2. Uploads db.json (projects + clips) as the R2 `db.json` object.
// After this, the cloud studio shows the same projects and clips as local.
// The 3.57 GB Drive library (inbox/) is NOT migrated here: raw library files
// are not clips yet — they become clips by going through the studio's own
// upload pipeline (which transcodes them in-browser), either locally or in
// the cloud studio. See RUNBOOK.md.
// Usage:
//   R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... R2_BUCKET=nexgen-studio-assets \
//     node scripts/migrate-local-to-r2.mjs [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const DRY = process.argv.includes('--dry-run');
const ASSETS_DIR = path.join(process.env.HOME, 'workspace', 'nexgen-studio-assets');
const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error('Missing R2 env vars (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET)');
  process.exit(1);
}
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});
const MT = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.wav': 'audio/wav', '.mp3': 'audio/mpeg' };

const files = fs.readdirSync(path.join(ASSETS_DIR, 'uploads')).filter((f) => /^[a-z0-9]+-/.test(f));
console.log(`uploads/: ${files.length} files`);
let up = 0, skip = 0;
for (const f of files) {
  const p = path.join(ASSETS_DIR, 'uploads', f);
  const size = fs.statSync(p).size;
  const key = 'assets/' + f;
  let exists = false;
  try { const h = await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key })); exists = h.ContentLength === size; } catch (e) { /* not there */ }
  if (exists) { skip++; continue; }
  console.log(`${DRY ? '[dry-run] would upload' : 'uploading'} ${f} (${(size / 1048576).toFixed(1)} MB)`);
  if (!DRY) {
    await s3.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: fs.createReadStream(p), ContentType: MT[path.extname(f)] || 'application/octet-stream' }));
  }
  up++;
}
console.log(`assets: ${up} uploaded, ${skip} already present`);
const dbRaw = fs.readFileSync(path.join(ASSETS_DIR, 'db.json'), 'utf8');
const db = JSON.parse(dbRaw);
console.log(`db.json: ${Object.keys(db.docs || {}).length} docs`);
if (!DRY) {
  await s3.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: 'db.json', Body: dbRaw, ContentType: 'application/json' }));
  console.log('db.json uploaded to R2');
} else {
  console.log('[dry-run] would upload db.json');
}
console.log(DRY ? 'DRY RUN — nothing was written.' : 'DONE. Open the cloud studio: the same projects and clips should be there.');
