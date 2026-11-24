// GET /api/storage -> { usedBytes, fileCount, limitBytes, warnBytes, pctUsed,
//   warn, byPrefix, byType, byBrand }
// Storage meter for the 10 GB R2 free tier. Lists the whole bucket once
// (paginated ListObjectsV2), so the numbers match an independent R2 listing.
// byBrand joins clip rows to assets (one getDb); assets with no clip row are
// 'unassigned' — that is where orphaned uploads show up. warn is true at
// 8 GB (80%), the point to clean up or stop importing before the tier caps.
import { getS3, bucket, getDb, listAssets, isAuthenticated, unauthorized, sendJson, sendError } from './_lib/r2.js';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

export const FREE_TIER_BYTES = 10 * 1024 ** 3; // 10 GiB
export const WARN_BYTES = 8 * 1024 ** 3; // 80% — warn before the tier caps

function typeOf(key) {
  if (/\.(mp4|mov|m4v|webm|mkv)$/i.test(key)) return 'video';
  if (/\.(jpe?g|png|webp|gif|heic)$/i.test(key)) return 'image';
  if (/\.(mp3|wav|ogg|m4a)$/i.test(key)) return 'audio';
  return 'other';
}

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return unauthorized(res);
  if (req.method !== 'GET') { res.statusCode = 405; return res.end('method not allowed'); }
  try {
    const s3 = getS3();
    let usedBytes = 0, fileCount = 0;
    const byPrefix = {}, byType = {};
    const bump = (obj, k, size) => { const e = obj[k] || (obj[k] = { bytes: 0, files: 0 }); e.bytes += size; e.files += 1; };
    let token;
    do {
      const page = await s3.send(new ListObjectsV2Command({ Bucket: bucket(), ContinuationToken: token }));
      for (const o of page.Contents || []) {
        const size = o.Size || 0;
        usedBytes += size; fileCount += 1;
        const prefix = o.Key.startsWith('assets/') ? 'assets' : o.Key.startsWith('exports/') ? 'exports' : o.Key === 'db.json' ? 'db.json' : 'other';
        bump(byPrefix, prefix, size);
        bump(byType, typeOf(o.Key), size);
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);

    // Brand breakdown: join clip rows to assets. Unassigned = orphaned files.
    const db = await getDb(s3);
    const assetBrand = {};
    for (const [k, v] of Object.entries(db.docs || {})) {
      if (k.startsWith('clips/') && v && typeof v.asset === 'string' && !assetBrand[v.asset]) {
        assetBrand[v.asset] = v.brand || 'unknown';
      }
    }
    // Brand totals need per-asset sizes: one listAssets call (a second bucket
    // list; acceptable — this endpoint is polled rarely, on footage-view entry).
    const byBrand = {};
    for (const a of await listAssets(s3)) bump(byBrand, assetBrand[a.id] || 'unassigned', a.size);

    return sendJson(res, 200, {
      usedBytes, fileCount,
      limitBytes: FREE_TIER_BYTES,
      warnBytes: WARN_BYTES,
      pctUsed: Math.round((usedBytes / FREE_TIER_BYTES) * 1000) / 10,
      warn: usedBytes >= WARN_BYTES,
      byPrefix, byType, byBrand,
    });
  } catch (e) {
    console.error('storage route:', e);
    return sendError(res, 500, 'storage failed');
  }
}
