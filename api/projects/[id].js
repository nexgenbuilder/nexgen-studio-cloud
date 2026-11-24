// Operator API — one project.
//   GET   /api/projects/<id>   full project document
//   PATCH /api/projects/<id>   merge text / shot / style maps, rename
//         { name?, text?, shot?, style? } -> { project }
// Shot values are { c: clipId, in: seconds } (the studio's own shape);
// text values are strings. PATCH merges per-key into the existing maps —
// it never wipes fields the caller did not mention.
// Auth: browser password cookie OR `Authorization: Bearer <NX_OPERATOR_KEY>`.
import { getDb, putDb, isAuthenticated, unauthorized, sendJson, sendError, readJsonBody } from '../_lib/r2.js';

function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return unauthorized(res);
  const id = String((req.query && req.query.id) || '');
  if (!/^p[a-z0-9]+$/.test(id)) return sendError(res, 404, 'project not found');
  try {
    const { docs } = await getDb();
    const key = 'projects/' + id;
    const project = docs[key];
    if (!project) return sendError(res, 404, 'project not found');
    if (req.method === 'GET') return sendJson(res, 200, { project });
    if (req.method === 'PATCH') {
      const body = await readJsonBody(req);
      if (body.name !== undefined) {
        if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 120) return sendError(res, 400, 'bad name');
        project.name = body.name;
      }
      if (body.text !== undefined) {
        if (!isObj(body.text) || !Object.values(body.text).every((v) => typeof v === 'string')) return sendError(res, 400, 'text must be an object of strings');
        project.text = { ...(project.text || {}), ...body.text };
      }
      if (body.shot !== undefined) {
        if (!isObj(body.shot) || !Object.values(body.shot).every((v) => isObj(v) && typeof v.c === 'string')) return sendError(res, 400, 'shot must be an object of {c: clipId, in: seconds}');
        project.shot = { ...(project.shot || {}), ...body.shot };
      }
      if (body.style !== undefined) {
        if (!isObj(body.style)) return sendError(res, 400, 'style must be an object');
        project.style = { ...(project.style || {}), ...body.style };
      }
      project.updatedAt = new Date().toISOString();
      docs[key] = project;
      await putDb({ docs });
      return sendJson(res, 200, { project });
    }
    return sendError(res, 405, 'method not allowed');
  } catch (e) {
    console.error('project route:', e);
    return sendError(res, 500, 'project failed');
  }
}
