// GET /_db  -> { docs: {...} }   (empty when the db object does not exist yet)
// POST /_db { docs: {...} } -> {} (last write wins; see README.md)
import { getDb, putDb, isAuthenticated, unauthorized } from './_lib/r2.js';

export default async function handler(req, res) {
  if (!isAuthenticated(req)) return unauthorized(res);
  try {
    if (req.method === 'GET') {
      res.setHeader('content-type', 'application/json');
      return res.end(JSON.stringify(await getDb()));
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : JSON.parse(req.body || '{}');
      await putDb(body);
      res.setHeader('content-type', 'application/json');
      return res.end('{}');
    }
    res.statusCode = 405;
    return res.end('method not allowed');
  } catch (e) {
    console.error('db route:', e);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ error: 'db failed' }));
  }
}
