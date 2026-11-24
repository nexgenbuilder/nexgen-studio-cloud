// Password gate — Vercel Routing Middleware (Edge runtime, works for any
// framework, not just Next.js). Runs before the cache and before any static
// file or API route is served.
//
// How it works: the browser holds a cookie `nx-auth` = SHA-256(STUDIO_PASSWORD),
// set by POST /api/login after a correct password. This middleware hashes the
// env password the same way and compares. No match -> redirect to /login.html.
// The raw password is never stored in the cookie.
//
// This is the primary gate. The API routes check the same cookie themselves
// (see api/_lib/r2.js isAuthenticated) as a second layer, so the data stays
// protected even if the middleware matcher is ever misconfigured.
// The static app code itself (the studio's JS) is fetchable by URL if someone
// knows a file path — that is normal for any web app and leaks nothing
// sensitive: all projects and footage live behind this gate + private R2.
import { next } from '@vercel/functions';

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getCookie(req, name) {
  const raw = req.headers.get('cookie') || '';
  const m = new RegExp('(?:^|;\\s*)' + name + '=([^;]+)').exec(raw);
  return m ? decodeURIComponent(m[1]) : '';
}

export async function isAuthorized(request) {
  // 1. Browser session: cookie nx-auth = SHA-256(STUDIO_PASSWORD).
  const pw = process.env.STUDIO_PASSWORD;
  if (pw) {
    const want = await sha256Hex(pw);
    const got = getCookie(request, 'nx-auth');
    if (got.length === want.length) {
      let diff = 0;
      for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ got.charCodeAt(i);
      if (diff === 0) return true;
    }
  }
  // 2. Operator API key: Authorization: Bearer <NX_OPERATOR_KEY>.
  // Compared on SHA-256 digests, never on the raw key. This is what lets
  // Muse / the phase-2 MCP connector call the API routes without a browser
  // session. It works on every path, not just /api/*.
  const key = process.env.NX_OPERATOR_KEY;
  if (key) {
    const auth = request.headers.get('authorization') || '';
    const m = /^Bearer\s+(.+)$/.exec(auth.trim());
    if (m) {
      const want = await sha256Hex(key);
      const got = await sha256Hex(m[1].trim());
      if (got.length === want.length) {
        let diff = 0;
        for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ got.charCodeAt(i);
        if (diff === 0) return true;
      }
    }
  }
  return false;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  if (await isAuthorized(request)) return next();
  // API clients get a machine-readable 401, not a redirect to a login page.
  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }
  return NextResponseRedirect(url, '/login.html');
}

function NextResponseRedirect(url, path) {
  // Plain Web Response redirect (avoids importing NextResponse, which is
  // Next.js-only; Routing Middleware for other frameworks uses @vercel/functions).
  const dest = new URL(path, url);
  return Response.redirect(dest, 302);
}

export const config = {
  runtime: 'edge',
  // Gate everything except the login page, the login endpoint, and the favicon.
  matcher: ['/((?!login\\.html|api/login|favicon\\.ico|favicon\\.svg).*)'],
};
