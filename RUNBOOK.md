# Runbook — deploy NexGen Studio to Vercel + R2

Deploy the cloud studio from `~/workspace/nexgen-studio-cloud/` (the project
in this folder). Steps marked **[Ricardo]** need him; the rest can be done by
Muse once the accounts exist. Do the steps in order — each one depends on the
one before it.

**Status at writing (2026-11-24):** code is complete and verified locally
(`npm test` 42/42; mobile end-to-end 20/20 — see README.md). Nothing is
deployed yet. Both accounts are **not connected**: `vercel status` reports
`not_connected`, `cloudflare status` reports `not_connected`. The final
`vercel build` attempt failed with "The specified token is not valid. Use
`vercel login`" — expected until Ricardo connects Vercel.

## 0. What you need before starting

- A GitHub account with access to `nexgenbuilder` (already connected to Muse).
- A Vercel account (free Hobby to start — see the commercial-use note in §8).
- A Cloudflare account (free; R2 free tier: 10 GB storage, no egress fees).
- The studio password + operator key, chosen by Ricardo (or generated below).

## 1. [Ricardo] Connect Vercel

Muse runs:
```
/opt/hatch/bin/vercel authorize-url
```
It prints a `connect_url`. **Ricardo opens that link and signs in to Vercel**
(through Vercel's own sign-in page — never share tokens or passwords in chat).
Then Muse confirms with:
```
/opt/hatch/bin/vercel status
```
Expected: `auth_status` connected (not `not_connected`).

## 2. [Ricardo] Connect Cloudflare

Muse runs:
```
/opt/hatch/bin/cloudflare authorize-url
```
It prints a `connect_url`. **Ricardo opens that link and signs in to
Cloudflare.** Then Muse confirms with:
```
/opt/hatch/bin/cloudflare status
```
Expected: `status` connected (not `not_connected`).

## 3. Create the R2 bucket + API token (Muse, via the Cloudflare connector)

1. Create the bucket (private — **do not** enable public access / r2.dev):
   - Name: `nexgen-studio-assets`
   - Location: automatic (default).
2. Set the bucket CORS policy (R2 dashboard -> bucket -> Settings -> CORS
   Policy). The studio fetches clip bytes cross-origin from the Vercel app,
   so without this, footage will not load. Replace
   `https://<your-app>.vercel.app` with the real deployment URL from step 6
   (add it after the first deploy if the URL isn't known yet):
   ```json
   [
     {
       "AllowedOrigins": ["https://<your-app>.vercel.app"],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
3. Create an API token for the bucket (R2 -> Manage R2 API Tokens -> Create):
   - Permissions: **Object Read & Write**, scoped to `nexgen-studio-assets`.
   - Save the three values it shows (shown once): Account ID, Access Key ID,
     Secret Access Key. These go into Vercel env vars in step 6 — never into
     the repo or chat.

## 4. Create the GitHub repo + push the code (Muse)

```bash
cd ~/workspace/nexgen-studio-cloud
gh repo create nexgenbuilder/nexgen-studio-cloud --private --source=. --remote=origin
git add -A
git commit -m "NexGen Studio B28 cloud: Vercel + R2, password gate, operator API"
git push -u origin main
```
Notes: `.gitignore` keeps `node_modules/`, `.vercel/` and `.env` out.
`public/` is 94 MB (70 MB of it is `audio/` sound packs) — under GitHub's
100 MB per-file limit (largest single file is ~6 MB) and under Vercel's
100 MB CLI-upload limit, but close; see §8 if a deploy ever fails on size.

## 5. Choose the two secrets (Ricardo picks, Muse generates if asked)

- **Studio password** — what Ricardo types on the login page. Pick something
  memorable.
- **Operator key** — the machine key for the API/MCP. Generate:
  ```bash
  openssl rand -hex 32
  ```
  Store both in Vercel env vars (step 6). Never put them in the repo, in chat,
  or in a file.

## 6. Import the project in Vercel + set env vars (Muse, via the Vercel connector)

1. Create the project from the GitHub repo (`nexgenbuilder/nexgen-studio-cloud`).
   Framework preset: **Other** (static site + functions). Root directory: the
   repo root. No build command is needed (static files + serverless functions).
2. Set these environment variables (Production **and** Preview):
   | Var | Value |
   |---|---|
   | `R2_ACCOUNT_ID` | from step 3 |
   | `R2_ACCESS_KEY_ID` | from step 3 |
   | `R2_SECRET_ACCESS_KEY` | from step 3 |
   | `R2_BUCKET` | `nexgen-studio-assets` |
   | `STUDIO_PASSWORD` | from step 5 |
   | `NX_OPERATOR_KEY` | from step 5 |
3. Deploy. Note the deployment URL, e.g.
   `https://nexgen-studio-cloud.vercel.app`.
4. If the URL differs from the one in the R2 CORS policy (step 3), update the
   CORS `AllowedOrigins` to the real URL and redeploy (or just update CORS —
   no redeploy needed for a CORS change).

## 7. Post-deploy checks (Muse + Ricardo)

Run these in order; every one must pass before calling it live.

1. **Login gate:** open the deployment URL in a private window. You must get
   the login page, not the studio. Wrong password -> back to login with an
   error. Right password -> studio loads.
2. **Studio boots:** brand shows "DPG Outdoor Living", no console errors.
3. **API auth:** from this machine,
   ```bash
   curl -s https://<your-app>.vercel.app/api/projects \
     -H "Authorization: Bearer <NX_OPERATOR_KEY>"
   ```
   must return `{"projects":[]}` (not a redirect, not 401). Without the header
   it must return 401 JSON.
4. **Operator build:** create a project through the API (see README.md
   "Operator API"), then open the deployment on a real Android phone, find the
   project in Projects, open it, and confirm shots/text/brand are intact.
5. **Real export on the phone:** tap Export, let it render, download the MP4.
   It must land in the phone's Downloads. Then, from this machine,
   `GET /api/exports?status=done` must list the job, and
   `GET /api/exports/<id>/file` must return the same MP4 bytes.
6. **Upload path:** add one photo through the studio on the phone; it must
   appear in Footage and survive a reload.

## 8. Migrate the local state (Muse, after the deploy works)

Copies the in-house studio's current projects + clips to R2 so the cloud
studio opens with the same work. Read-only locally; writes only to R2.
```bash
cd ~/workspace/nexgen-studio-cloud
R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... \
  R2_BUCKET=nexgen-studio-assets \
  node scripts/migrate-local-to-r2.mjs --dry-run   # review what it would do
R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... \
  R2_BUCKET=nexgen-studio-assets \
  node scripts/migrate-local-to-r2.mjs            # do it
```
What it does: uploads every file in `uploads/` to R2 under the same asset id,
skipping files already present at the same size; then uploads `db.json`.
The 3.57 GB Drive library in `inbox/` is **not** migrated by this script —
raw library files become clips by going through the studio's upload pipeline
(which transcodes them in-browser), either locally or in the cloud studio.

## 9. Things that can bite (read before you deploy)

- **Vercel Hobby is personal/non-commercial by its terms.** This studio is
  used for client work, so Hobby is a terms risk even though it works
  technically. If the workflow is commercial, Pro ($20/mo) is the compliant
  route. R2's free tier has no such restriction.
- **Deploy size is close to a limit.** `public/` is 94 MB; Vercel CLI uploads
  cap at 100 MB. Git-connected deploys are the recommended path. If a deploy
  ever fails on size, the fallback is to move `audio/` (70 MB) to R2 and
  serve it from there, or drop unused sound packs (they are referenced by
  prefix — check before trimming).
- **CORS must match the real deployment URL exactly** (no trailing slash).
  Wrong origin -> footage fails to load with a CORS error in the console.
- **Presigned URLs expire** (GET 1 h, upload 10 min, export upload 1 h).
  Download promptly.
- **Hobby function limits** (1M invocations/month, 10 s default duration) are
  far above this workload: the API only stores/loads data; rendering happens
  in the browser.
- **Two writers, one db.** The project db is last-write-wins on the whole
  document map. Don't edit the same project from two devices at once.
- **`vercel build` locally needs a login.** It fails with "The specified token
  is not valid" until Ricardo connects Vercel (step 1). Don't work around it
  by pasting tokens anywhere.

## 10. Rollback

If the cloud deployment misbehaves, nothing about the local setup changes:
the in-house host on port 8765 keeps working exactly as before, with the same
`db.json` and `uploads/`. To take the cloud deployment down, remove the
Vercel project (or just don't share the URL — the password gate blocks
everyone without it).
