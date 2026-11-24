// Operator API — projects.
//   GET  /api/projects?brand=&tpl=   list projects (summary rows)
//   POST /api/projects               create a project from a template
//        { templateId, name?, brand?, text?, shot?, style? }
//        -> 201 { project }
// The created document mirrors what the studio itself builds in
// js/nx-app.js newProject(): { id, brand, name, tpl, text, shot, style,
// createdAt, updatedAt, saved }. text/shot start empty; the studio fills
// template defaults when the project is opened (openProject() tolerates
// missing text/shot/style maps). The template itself is validated by the
// studio on open — the server only checks the id shape, because the template
// registry lives in the client-side code and is the source of truth there.
// Auth: browser password cookie OR `Authorization: Bearer <NX_OPERATOR_KEY>`.
// (api/_lib/r2.js isAuthenticated).
import { getDb, putDb, isAuthenticated, unauthorized, sendJson, sendError, readJsonBody } from './_lib/r2.js';

function newProjectId() { return 'p' + Math.random().toString(36).slice(2, 14); }
function today() { return new Date().toISOString().slice(0, 10); }
function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }

function validShotMap(shot) {
  if (!isObj(shot)) return false;
  return Object.values(shot).every((v) => isObj(v) && typeof v.c === 'string');
}
function validTextMap(text) {
  if (!isObj(text)) return false;
  return Object.values(text).every((v) => typeof v === 'string');
}

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return unauthorized(res);
  try {
    if (req.method === 'GET') {
      const { docs } = await getDb();
      const brand = String((req.query && req.query.brand) || '');
      const tpl = String((req.query && req.query.tpl) || '');
      const rows = Object.values(docs)
        .filter((d) => d && typeof d === 'object' && d.tpl && d.id)
        .filter((d) => (!brand || d.brand === brand) && (!tpl || d.tpl === tpl))
        .map((d) => ({ id: d.id, name: d.name || '', tpl: d.tpl, brand: d.brand || '', createdAt: d.createdAt || '', updatedAt: d.updatedAt || null }))
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      return sendJson(res, 200, { projects: rows });
    }
    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      const templateId = String(body.templateId || '');
      if (!/^[A-Za-z0-9_-]{1,64}$/.test(templateId)) return sendError(res, 400, 'templateId required (letters, digits, _ , -)');
      const brand = String(body.brand || 'dpg');
      if (!/^[a-z0-9-]{1,32}$/.test(brand)) return sendError(res, 400, 'bad brand');
      const name = String(body.name || `${templateId} · ${today()}`).slice(0, 120);
      if (body.text !== undefined && !validTextMap(body.text)) return sendError(res, 400, 'text must be an object of strings');
      if (body.shot !== undefined && !validShotMap(body.shot)) return sendError(res, 400, 'shot must be an object of {c: clipId, in: seconds}');
      if (body.style !== undefined && !isObj(body.style)) return sendError(res, 400, 'style must be an object');
      const { docs } = await getDb();
      const project = {
        id: newProjectId(),
        brand,
        name,
        tpl: templateId,
        text: body.text || {},
        shot: body.shot || {},
        style: body.style || {},
        createdAt: new Date().toISOString(),
        updatedAt: null,
        saved: true,
      };
      docs['projects/' + project.id] = project;
      await putDb({ docs });
      return sendJson(res, 201, { project });
    }
    return sendError(res, 405, 'method not allowed');
  } catch (e) {
    console.error('projects route:', e);
    return sendError(res, 500, 'projects failed');
  }
}
