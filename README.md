# 🎄 Family Christmas Wishlist

A small, real-time Christmas wishlist for the family. Everyone can see everyone's list, and anyone can add a gift to a name. The UI is entirely in Spanish.

- **Frontend:** React + TypeScript + Vite + React Router (`/frontend`)
- **Backend:** NestJS (Express adapter) running as a Vercel serverless function (`/backend`)
- **Database & realtime:** Supabase Postgres + Supabase Realtime (`/supabase/schema.sql`)

```
.
├── backend/            NestJS API → Vercel project #1 (root directory: backend)
│   ├── api/index.ts    Serverless entry; builds the Nest app once and caches it
│   ├── src/            Modules: people, gifts, supabase, common (validation, errors)
│   └── vercel.json     Routes every request to api/index.ts
├── frontend/           React app → Vercel project #2 (root directory: frontend)
│   ├── src/i18n/es.ts  ALL user-facing text lives here (edit it to change wording)
│   └── vercel.json     SPA rewrite so /persona/:id works on refresh
└── supabase/schema.sql Paste into the Supabase SQL editor
```

## How it works

- `GET /people` lists everyone with their gift count. `GET /people/:id` returns a person and their gifts (newest first).
- `POST /gifts` with `{ personName, giftName, url?, store?, details? }` (a link, a store name, or both; at least one is required. `details` is optional free text such as size or color, up to 300 characters) finds the person by a **normalized name** (lowercase, trimmed, repeated spaces collapsed, accents removed, so `María`, `maria` and ` MARIA ` match) or creates them, then inserts the gift. If two people create the same new name at once, the unique index rejects one insert and the backend re-reads the winner.
- `DELETE /gifts/:id` deletes a gift.
- Validation and error messages come back in Spanish (`{ statusCode, message }`), and the frontend shows them as they are.
- **Real-time:** the browser subscribes to Supabase Realtime `postgres_changes` on `people` and `gifts` using the public `anon` key. Inserts and deletes update every open browser without a refresh. The client also refetches when it (re)connects, when the device comes back online and when the tab becomes visible again. No WebSockets run through Vercel; the realtime socket goes straight to Supabase.

### Security model (please read)

- The **`anon` key is public by design.** It is bundled into the frontend. Row Level Security on both tables only allows **reading** with it, so nobody can write to the database from the browser.
- **All writes go through the NestJS backend**, which uses the **`service_role` key**. That key lives only in the backend's environment variables and is never sent to the browser.
- **There is no login: this is trust-based.** Anyone with the website link can add gifts to any name and delete any gift. That's fine for a family site, but don't share the link publicly. There's also no rate limiting, because in-memory limiters don't work on serverless.

---

## 1. Create the Supabase project

1. Go to <https://supabase.com>, sign in and click **New project** (the free plan is fine). Choose a name, a database password and a region close to your family.
2. When the project is ready, open **SQL Editor → New query**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**. This creates the `people` and `gifts` tables, the read-only RLS policies, and adds both tables to the `supabase_realtime` publication.
3. (Optional check) In **Database → Publications → supabase_realtime**, both `people` and `gifts` should be listed.

### Where to find the keys

In the Supabase dashboard, open **Project Settings → API Keys** (the Project URL is under **Project Settings → Data API**, or on the project's home page via **Connect**). New projects show two kinds of keys; **either kind works**:

| What | New-style key | Legacy key (tab "Legacy API keys") | Goes into |
|---|---|---|---|
| Project URL `https://xxxx.supabase.co` | — | — | backend `SUPABASE_URL` **and** frontend `VITE_SUPABASE_URL` |
| Public key | `sb_publishable_…` | `anon` `public` | frontend `VITE_SUPABASE_ANON_KEY` |
| Secret key | `sb_secret_…` | `service_role` `secret` | backend `SUPABASE_SERVICE_ROLE_KEY` **only** |

Both formats were tested with this app. Never put the secret key in the frontend project.

### Keeping the free project awake

Supabase pauses free projects after about a week without activity. The backend's `vercel.json` defines a daily Vercel Cron job that calls `GET /health/db` (a tiny read query) so the project stays active. If it ever does get paused, open the Supabase dashboard and click **Restore project**.

## 0. Quick preview on your computer (no accounts or keys needed)

Want to try it before creating anything? With **Docker Desktop** running:

```bash
./scripts/preview-local.sh
```

This starts a local Supabase (database + realtime) in Docker, creates the tables from `schema.sql`, and runs the backend and frontend with Supabase's built-in local demo keys. It prints a URL like `http://192.168.x.x:5180`. Open it on your computer **or on any phone connected to the same Wi-Fi**. The first run downloads Docker images and takes a few minutes. If macOS asks whether Node may accept incoming connections, click **Allow** so phones can connect.

Press `Ctrl+C` to stop the apps. Data stays on your computer between runs. To shut the local database down: `./scripts/preview-local.sh --stop`. Use `API_PORT=… WEB_PORT=…` to change the default ports (3100 / 5180).

## 2. Run locally

Requires Node.js 20+.

```bash
# Backend (http://localhost:3000)
cd backend
cp .env.example .env        # fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev

# Frontend (http://localhost:5173), in a second terminal
cd frontend
cp .env.example .env        # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

`FRONTEND_ORIGIN` defaults to `http://localhost:5173`. To try it on your phone over Wi-Fi, run `npm run dev -- --host` in the frontend, set `VITE_API_URL=http://<your-computer-ip>:3000` and add `http://<your-computer-ip>:5173` to `FRONTEND_ORIGIN` (comma-separated).

Other scripts: `npm run build` (type-check and build) in both folders.

## 3. Deploy to Vercel (two free Hobby projects from one repo)

Push this repository to GitHub first. Then, in this order:

### Step 1: deploy the backend

1. In Vercel, click **Add New… → Project** and import the GitHub repo.
2. Set **Root Directory** to `backend`. Leave **Framework Preset** as **Other**. `vercel.json` already sets the build (a type check), the output (`public/`, which only holds `robots.txt`), the function and the daily cron.
3. Under **Environment Variables**, add:
   - `SUPABASE_URL`: your project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: the `service_role` key
   - `FRONTEND_ORIGIN`: leave this out for now (you'll set it in step 3)
4. Click **Deploy**. Copy the production URL, e.g. `https://regalos-backend.vercel.app`.
5. Check it: opening `https://regalos-backend.vercel.app/people` should return `[]`.

### Step 2: deploy the frontend

1. **Add New… → Project** again and import **the same repo**.
2. Set **Root Directory** to `frontend`. The **Vite** preset is detected automatically (build `npm run build`, output `dist`).
3. Add the environment variables:
   - `VITE_API_URL`: the backend URL from step 1, **without a trailing slash**
   - `VITE_SUPABASE_URL`: your project URL
   - `VITE_SUPABASE_ANON_KEY`: the `anon` key
4. Click **Deploy** and copy the frontend URL, e.g. `https://regalos-navidad.vercel.app`.

> `VITE_*` variables are baked in at build time. If you change them later, redeploy the frontend.

### Step 3: allow the frontend in the backend's CORS

1. Open the **backend** project → **Settings → Environment Variables** and add
   `FRONTEND_ORIGIN=https://regalos-navidad.vercel.app` (no trailing slash; separate several origins with commas, e.g. a custom domain too).
2. Go to **Deployments**, open the latest one and click **⋯ → Redeploy** so the new variable takes effect.

Open the frontend URL and share it with the family. 🎁

> Vercel preview deployments get different URLs. Add them to `FRONTEND_ORIGIN` if you want previews to talk to the API, or just use the production URLs.

## Editing the texts

Every visible string (buttons, labels, placeholders, empty/loading/error states, the confirmation dialog) is in [`frontend/src/i18n/es.ts`](frontend/src/i18n/es.ts). Backend validation and error messages are in [`backend/src/common/messages.ts`](backend/src/common/messages.ts).

## Troubleshooting

- **The page loads, but changes don't appear live:** confirm `schema.sql` ran completely (the `alter publication supabase_realtime …` line) and that `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are set on the frontend project, then redeploy it.
- **"No pudimos conectarnos con el servidor":** check `VITE_API_URL`, and that `FRONTEND_ORIGIN` on the backend exactly matches the frontend URL (scheme included, no trailing slash). Redeploy the backend after changing it.
- **Backend returns 500 on every request:** `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing or wrong (see the function logs in Vercel).
