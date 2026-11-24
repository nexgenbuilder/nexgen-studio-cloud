// One-off check: middleware default export behavior in plain Node.
// (Not part of npm test — @vercel/functions' next() is a Vercel-runtime helper.)
process.env.STUDIO_PASSWORD = 'test-password';
import { createHash } from 'node:crypto';
const sha = (s) => createHash('sha256').update(s).digest('hex');
const mw = (await import('../middleware.js')).default;

let r = await mw(new Request('https://studio.example/'));
console.log('no-cookie:', r.status, '->', r.headers.get('location'));

r = await mw(new Request('https://studio.example/_db'));
console.log('no-cookie /_db:', r.status, '->', r.headers.get('location'));

r = await mw(new Request('https://studio.example/', { headers: { cookie: 'nx-auth=' + sha('test-password') } }));
console.log('authed /:', r.status, '| location:', r.headers.get('location'), '| x-middleware-next:', r.headers.get('x-middleware-next'));

r = await mw(new Request('https://studio.example/_db', { headers: { cookie: 'nx-auth=' + sha('test-password') } }));
console.log('authed /_db:', r.status, '| location:', r.headers.get('location'));
