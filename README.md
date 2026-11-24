# NexGen Studio — Cloud (Vercel + Cloudflare R2)

B28 / V23–V30 studio, hosted as a shared workspace: Ricardo opens it from any
device, Muse operates it through the API. The local in-house setup
(`~/workspace/nexgen-studio-inhouse/`, port 8765) is untouched and still works;
this folder is a separate deployment.

## The agreed flow (2026-11-24)

1. **Muse builds** a video in the hosted studio through the operator API:
   upload footage, create a project from a template, assign shots, set text.
2. **Ricardo opens the same project** in the hosted studio on his own device
   (often his Android phone), taps **Export**, and the video renders **in his
   browser, on his hardware** — that is the fast path.
3. The finished MP4 **downloads to his device** (the studio's normal download).
   The studio also records a copy in R2 automatically, so **Muse can fetch it
   through the API** and deliver it to Drive when needed.
4. Muse's headless Chromium here is only a fallback/test path for rendering —
   the export is not designed to depend on it.

## Architecture

```
Browser (Ricardo's phone / laptop / Muse's Playwright)
  └─ Vercel (Hobby) ── static site: public/  (the studio, 333 files, 94 MB)
                    └─ serverless API routes: api/
                    └─ Routing Middleware: middleware.js (password gate)
  └─ Cloudflare R2 (private bucket, free 10 GB)
        ├─ db.json            project db (kilobytes)
        ├─ assets/<id>-<name> footage (direct browser ↔ R2, presigned URLs)
        └─ exports/<id>.mp4   finished videos recorded by the studio
```

- **Rendering is browser-only.** The studio draws canvas frames and encodes
  H.264 with WebCodecs (1080×1920 @ 10 Mbps, Chrome/Edge). The server never
  renders anything: it only stores and loads data. There is no server-side
  render engine, and none is pretended.
- **Uploads go direct to R2** (presigned PUT URLs). They are never proxied
  through Vercel functions: serverless request bodies cap around 4.5 MB and
  clips run to ~20 MB after the studio re-encodes them.
- **Downloads go through `/_blob/<id>`**, which 302-redirects to a fresh
  short-lived presigned R2 GET URL (1 h). The bucket stays private; no
  permanent public URL exists for any asset or finished video.
- **Clip loading is CORS-safe by construction.** The studio fetches clip bytes
  with `fetch()` into an in-memory Blob and decodes with MediaBunny
  (`js/nx-frames.js`). The R2 bucket needs a CORS policy allowing GET + PUT
  from the Vercel app origin (see RUNBOOK.md) — otherwise the browser refuses
  the cross-origin fetch.

## Project layout

```
nexgen-studio-cloud/
  public/                  studio copy (byte-identical to nexgen-studio-v23-30
                           except index.html, which loads shim-cloud.js)
    index.html             + <script src="/shim-cloud.js">
    shim-cloud.js          window.claude stand-in (db/assets/downloads/user)
    login.html             password gate page (self-contained)
  api/
    _lib/r2.js             R2 client, db + asset helpers, auth (cookie + Bearer)
    _lib/jobs.js           export-job records (individual R2 objects)
    db.js                  GET/POST /_db            (project db)
    up.js                  POST /_up                (presigned PUT for an upload)
    assets.js              GET  /_assets            (list assets)
    blob.js                GET/DELETE /_blob/<id>   (302 to presigned GET)
    login.js               POST /api/login          (password -> auth cookie)
    projects.js            GET/POST /api/projects
    projects/[id].js       GET/PATCH /api/projects/<id>
    exports.js             GET/POST /api/exports    (queue a render)
    exports/[id].js        GET/POST /api/exports/<id> (status, upload-url, complete, fail)
    exports/[id]/file.js   GET  /api/exports/<id>/file (302 to finished MP4)
  middleware.js            Routing Middleware: password gate (edge) + Bearer for /api/*
  scripts/migrate-local-to-r2.mjs   one-off: copy local uploads/ + db.json to R2
  test/
    routes.test.mjs        42 route/auth tests (fake in-memory R2) — `npm test`
    middleware-smoke.mjs   middleware behaviour check (not in npm test)
    e2e-server.mjs         local test server: real routes + S3 stub, port 8770
    e2e-mobile.mjs         full-flow check: API build -> mobile UI -> download -> R2 record
  vercel.json              rewrites /_db, /_up, /_assets, /_blob/:id -> /api/*
  package.json  .env.example  .gitignore
  README.md  RUNBOOK.md
```

## Auth — two credentials, two audiences

| Credential | Env var | For | Sent as |
|---|---|---|---|
| Studio password | `STUDIO_PASSWORD` | Humans in a browser | Login page -> `nx-auth` cookie (SHA-256 of the password, HttpOnly, Secure, 30 days) |
| Operator key | `NX_OPERATOR_KEY` | Muse / phase-2 MCP connector | `Authorization: Bearer <key>` |

Both unlock the same routes (browser session or Bearer). The middleware is the
primary gate; every API route re-checks auth itself. No password configured
means nothing gets in (fail closed). The cookie never holds the raw password
and the Bearer key is always compared on SHA-256 digests.

Generate the operator key with: `openssl rand -hex 32`

## The page shim (`public/shim-cloud.js`)

Stands in for the claude.ai host. Provides `db` (localStorage + server-side
`/_db`), `assets` (presigned direct-to-R2 upload), `downloads` (real browser
download + `window.__saved`), `user` (ricardo/owner). In-studio AI is
deliberately not provided — Muse in chat is the AI.

**Finished-export recording.** When the studio saves an MP4 through
`downloads.save`, the shim first triggers the normal download to the device,
then (fire-and-forget, never blocking or breaking the download) records the
same file in R2: it creates an export job, PUTs the MP4 to R2 via a presigned
URL, and marks the job done. Status is visible at `window.__exportUpload`.
Only `video/mp4` downloads are recorded. If anything fails, the download has
already happened and the failure is only logged.

## Operator API

Base URL: the Vercel deployment URL. Auth: `Authorization: Bearer <NX_OPERATOR_KEY>`
(or the browser cookie). All responses are JSON unless noted.

**Shim endpoints (same shapes the page uses):**

| Endpoint | What it does |
|---|---|
| `GET /_db` / `POST /_db` | Whole project db `{ docs: {...} }` (last write wins) |
| `POST /_up { name, type, size }` | Returns `{ id, uploadUrl, url: '/_blob/<id>' }`; PUT the bytes to `uploadUrl` with the same Content-Type |
| `GET /_assets` | `{ assets: [{ id, name, size, url }] }` |
| `GET /_blob/<id>` | 302 to a presigned R2 GET URL (1 h) |
| `DELETE /_blob/<id>` | Delete an asset |

**Projects:**

| Endpoint | What it does |
|---|---|
| `GET /api/projects?brand=&tpl=` | List projects (summary rows, newest first) |
| `POST /api/projects { templateId, name?, brand?, text?, shot?, style? }` | Create a project from a template -> `201 { project }`. The document mirrors the studio's own `newProject()` shape (`{ id, brand, name, tpl, text, shot, style, createdAt, saved: true }`); text/shot start empty and the studio fills template defaults on open. The template id is validated for shape only — the template registry lives in the client code and the studio reports an unknown template when opening. Default brand is `dpg`. |
| `GET /api/projects/<id>` | Full project document |
| `PATCH /api/projects/<id> { name?, text?, shot?, style? }` | Merge per-key into the text/shot/style maps (never wipes unmentioned fields). Shot values are `{ c: clipId, in: seconds }`; text values are strings. |

**Footage.** There is no separate "create clip" endpoint: upload an asset
(`/_up`), then write the clip row into the db (`GET /_db`, add
`clips/<clipId>`, `POST /_db`). A clip row is
`{ id, brand, name, project, file: '', w, h, n, segs: [[0, n-1]], asset, poster: '', src: 'up' }`
— `w`/`h` are the transcoded dimensions, `n` the frame count at 30 fps.
(`test/e2e-mobile.mjs` shows the full sequence working.)

**Exports (render jobs):**

| Endpoint | What it does |
|---|---|
| `POST /api/exports { projectId }` | Queue a render -> `201 { job }` (`status: 'queued'`) |
| `GET /api/exports?projectId=&status=` | List jobs, newest first |
| `GET /api/exports/<id>` | Job status; when done, includes `downloadUrl` |
| `POST /api/exports/<id> { action: 'upload-url' }` | Presigned PUT for the finished MP4 (`exports/<id>.mp4`) |
| `POST /api/exports/<id> { action: 'complete' }` | Verify the MP4 exists in R2 -> `status: 'done'` |
| `POST /api/exports/<id> { action: 'fail', error? }` | Mark failed |
| `GET /api/exports/<id>/file` | 302 to a presigned GET of the finished MP4 (only when done) |

**Who renders.** The API only queues and records. The render runs in a
browser: Ricardo's (the normal path — his hardware, near real-time) or Muse's
headless Chromium here (fallback/test only, ~0.3 fps software encode). The
renderer flow is: pick a queued job -> open the project in the studio ->
export -> PUT the MP4 to the job's `upload-url` -> `complete`. When Ricardo
exports from the studio UI, the shim does the record step automatically (see
above) — no job needs to be queued first.

**Muse fetching a finished video for Drive delivery:**
`GET /api/exports?status=done` -> pick the job -> `GET /api/exports/<id>/file`
(follow the 302) -> download the MP4 promptly (presigned URL, 1 h) -> upload
to Drive.

## Environment variables

| Var | Purpose |
|---|---|
| `R2_ACCOUNT_ID` | Cloudflare account id (R2 endpoint host) |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 API token (Object Read + Write on the bucket) |
| `R2_BUCKET` | Bucket name, e.g. `nexgen-studio-assets` |
| `STUDIO_PASSWORD` | Human password for the login page |
| `NX_OPERATOR_KEY` | Machine key for the operator API (`openssl rand -hex 32`) |

`R2_ENDPOINT` is a local-testing override only (see `test/e2e-server.mjs`).
Never commit real values (`.env.example` is the template).

## Tests

```bash
npm install
npm test            # 42 route/auth tests, fake in-memory R2, no network
node test/middleware-smoke.mjs   # middleware redirect / pass-through behaviour
```

End-to-end (needs the local test server; no cloud credentials):
```bash
PORT=8770 node test/e2e-server.mjs   # real routes + S3 stub, in-memory state
node test/e2e-mobile.mjs             # API build -> desktop + Android UI -> download -> R2 record
node test/e2e-mobile.mjs --full-export   # ALSO runs a real 15.5s render on the mobile
                                          # viewport (~25 min here). Only run when no
                                          # other render is using the machine.
```
Last verified 2026-11-24: `npm test` 42/42 pass; `e2e-mobile.mjs` 20/20 checks
pass (API-created `walkx_h` project with 1 shot + 8 texts opens intact on
desktop and on Android emulation; Export button top-right on mobile; export
dialog opens with Footage/Words/Look checks; `downloads.save` fires a real
download with byte-identical content; finished MP4 recorded in R2 and
retrievable through the API with byte-identical content; zero unexpected page
errors). The `--full-export` render was not run yet — the render loop is
viewport-independent and already proven on desktop; run it once when the
machine is free as a final confirmation.

## Known limitations (honest)

- **Project db is last-write-wins on the whole document map.** Two writers at
  the same moment (Ricardo's browser + an operator call) can clobber each
  other. In practice: don't edit the same project from two places at once.
  Export jobs are individual R2 objects precisely to avoid this for job state.
- **No auto-prune.** Every recorded export MP4 stays in R2 (~10–20 MB each;
  10 GB free fits hundreds). Prune old `exports/*.mp4` files manually when
  needed.
- **Brand-rule warnings don't block export.** The export dialog flags lines
  that break a brand rule and offers "Export anyway" — real copy should respect
  the brand rules, or Ricardo taps through.
- **Vercel Hobby is personal/non-commercial by its terms.** This studio is
  used for client work, so Hobby is a terms risk even though it works
  technically. If the workflow is commercial, Pro ($20/mo) is the compliant
  route. R2's free tier has no such restriction.
- **Deploy size is close to a limit.** `public/` is 94 MB (70 MB of it is the
  `audio/` sound packs); Vercel CLI uploads cap at 100 MB. Git-connected
  deploys are the recommended path; if a deploy ever fails on size, move
  `audio/` to R2 or drop unused packs (they are referenced by prefix, so check
  before trimming).
- **Presigned URLs expire.** GET links last 1 h, upload links 10 min (export
  upload links 1 h). Download promptly; request a fresh one when needed.
- **Video decoding needs Chrome/Edge.** The studio renders with WebCodecs;
  Safari/Firefox won't export. Ricardo's Android Chrome is fine.

## Phase 2 — MCP / connector (after launch, not built yet)

What this deployment already provides for it: the operator API above, Bearer
auth on every route, and the export-job record flow. What phase 2 still needs:

1. An MCP server (or Muse custom connector) exposing the operator API as
   tools: list/get/create/patch projects, upload asset, list assets,
   queue/get/download exports. The tool schemas should mirror the routes in
   this README.
2. The `NX_OPERATOR_KEY` stored in Muse's secure credential flow (never in
   chat, never in the repo) and the connector pointed at the deployment URL.
3. A render driver for the fallback path: a script that picks a queued job,
   opens the project in headless Chromium against the deployment URL, exports,
   and completes the job (the local `t_export.mjs` pattern, pointed at the
   cloud URL with the auth cookie set).
4. A decision on notifications: how Ricardo is told a video he requested is
   ready (chat message with the Drive link is the current pattern).
5. Live post-deploy verification: login page, studio boot, one API-built
   project opened on a real Android phone, one real export + download, one
   API fetch of the finished file (see RUNBOOK.md §7).
