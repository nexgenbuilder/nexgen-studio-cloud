// POST /api/login — the password gate's login endpoint.
// Body (form or JSON): { password }. On success sets an HttpOnly cookie
// holding SHA-256(password) and redirects to /. On failure redirects back
// to /login.html?error=1. The cookie is checked by middleware.js (edge)
// and by every API route (see api/_lib/r2.js isAuthenticated).
// The raw password is never stored in the cookie and never logged.
import { authHash } from './_lib/r2.js';

function parseBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let data = '';
    req.on('data', (d) => { data += d; });
    req.on('end', () => {
      const ct = String(req.headers['content-type'] || '');
      try {
        if (ct.includes('application/json')) return resolve(JSON.parse(data || '{}'));
        const params = new URLSearchParams(data);
        return resolve({ password: params.get('password') || '' });
      } catch (e) { return resolve({}); }
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('method not allowed'); }
  const pw = process.env.STUDIO_PASSWORD;
  if (!pw) { res.statusCode = 500; return res.end('password not configured'); }
  const body = await parseBody(req);
  const submitted = String(body.password || '');
  // Compare hashes, not raw passwords (also avoids timing leaks on the password).
  const ok = submitted.length > 0 && authHash(submitted) === authHash(pw);
  if (!ok) {
    res.statusCode = 302;
    res.setHeader('location', '/login.html?error=1');
    return res.end();
  }
  const cookie = `nx-auth=${authHash(pw)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`;
  res.statusCode = 302;
  res.setHeader('Set-Cookie', cookie);
  res.setHeader('location', '/');
  return res.end();
}
