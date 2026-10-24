# Carry

**Stop carrying your group project.** Carry is a mobile-first web app that turns a class assignment into a fair, AI-generated plan, keeps a student group on track from inside the group chat they already use, and produces an evidence-based **contribution receipt** at the end.

Built in 24 hours at **HackOHI/O 2026** (Open Challenge track).

> **This repo starts as a commented SKELETON.** Every file has a header explaining what it's for, who owns it, and a `TODO` checklist. Pages show placeholder text and API routes return `501 Not implemented` until someone fills them in. The full plan lives in our PRD & Roadmap doc.

---

## Quick start (every teammate, ~2 minutes)

```bash
git clone https://github.com/farazayub06/carry.git
cd carry
npm install
cp .env.example .env.local   # optional at first, the skeleton runs without keys
npm run dev
```

Open **http://localhost:3000**. The landing page has temporary links to every screen.

**Find your work:** search the codebase for `TODO (Frontend)`, `TODO (Backend)`, `TODO (AI)` or `TODO (Product)`.

---

## The user flow we're building

1. **Create project** (`/new`): name, due date, teammates, assignment + rubric
2. **AI plan** (`/p/[code]/plan`): AI drafts 6–10 tasks with effort (1–5) and internal deadlines ≥ 2 days before the real due date. A human edits, then saves.
3. **Share** (`/p/[code]/share`): copy an intro message + link into the Snapchat/iMessage group chat
4. **Join** (`/p/[code]/join`): teammates tap their name. No accounts.
5. **Dashboard** (`/p/[code]`): claim tasks, update status, see the workload split, get AI help when stuck, copy an AI-written group chat update
6. **Receipt** (`/p/[code]/receipt`): who actually did the work, computed from the event log

---

## Folder map: who owns what

We work on **one branch (`main`)**. Staying in your own folders means almost zero merge conflicts.

```
app/                          FRONTEND: pages
  page.tsx                    landing page
  new/                        create-project form
  p/[code]/                   dashboard + join / plan / share / receipt
  api/                        BACKEND: API routes (one folder per endpoint)
components/                   FRONTEND: TaskCard, TaskSheet, StatusPill, WorkloadBar, Timeline, CopyButton, ReceiptCard
lib/
  types.ts                    SHARED: the data contract (DONE). Announce before editing!
  utils.ts                    SHARED: ids, dates, workload math (signatures done, bodies TODO)
  mock.ts                     PRODUCT: the demo group story (Maya, Jordan, Priya, Sam the ghost)
  db/store.ts                 BACKEND: the DataStore interface (DONE, it's the contract)
  db/index.ts                 BACKEND: picks memory vs Supabase from env vars (DONE)
  db/memory.ts, supabase.ts   BACKEND: the two implementations (TODO)
  db/receipt.ts               BACKEND: receipt math (TODO)
  ai/                         AI: client, JSON validation + retry, prompts, fallbacks (TODO)
supabase/schema.sql           BACKEND: Postgres tables (DONE, run it in Supabase)
scripts/seed.ts               BACKEND: load the demo group into Supabase (TODO)
```

**Shared files** (`lib/types.ts`, `lib/utils.ts`, `package.json`): say so in the group chat before editing.

---

## ⚠️ Next.js gotcha (read before building screens)

This Next.js version has `cacheComponents: true`. Any page that reads the URL's `[code]` with `useParams()` must render that client component **inside `<Suspense>`**, or `npm run build` fails. The full pattern is in the comment at the top of `app/p/[code]/page.tsx`. Route handlers read params with `await ctx.params` (it's a Promise).

---

## API routes (contract)

| Method | Route | What it does |
| --- | --- | --- |
| POST | `/api/projects` | Create project + members |
| POST | `/api/projects/[id]/plan` | AI drafts a plan (not saved) |
| PUT | `/api/projects/[id]/tasks` | Save the reviewed plan |
| GET | `/api/p/[code]` | Everything about a project, by share code |
| POST | `/api/tasks/[id]/claim` | Claim / take over a task (logs `claimed`) |
| POST | `/api/tasks/[id]/status` | Change status (logs `status_changed` / `completed`) |
| POST | `/api/tasks/[id]/confirm` | Teammate confirms a done task (logs `confirmed`) |
| POST | `/api/tasks/[id]/stuck` | AI sub-steps + who could help |
| GET | `/api/projects/[id]/update-message` | AI-written group chat update |
| GET | `/api/projects/[id]/receipt` | Contribution receipt rows |
| POST | `/api/projects/[id]/rubric-check` | (stretch) rubric items the plan misses |

**Golden rule:** every write also appends to the `events` table. The receipt is computed from events, so no event means no credit.

---

## Turning on the real services

**Supabase (Backend):** create a free project → SQL Editor → run `supabase/schema.sql` → put `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. `lib/db/index.ts` switches from the in-memory store to Supabase automatically.

**AI (AI lead):** put your key in `.env.local` (see `.env.example`). All model calls go through `lib/ai/client.ts`.

**Deploy (Vercel):** import the repo, add the same env vars (+ `NEXT_PUBLIC_APP_URL`), deploy. Every push to `main` redeploys, so **never push code that doesn't run.**

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server at localhost:3000 |
| `npm run build` | Production build (run before pushing big changes) |
| `npm run typecheck` | Type-check everything |
| `npm run lint` | Lint |
| `npm run seed` | Load the demo group into Supabase |

## Git workflow (one branch)

```bash
git pull origin main          # before you start
# …work in YOUR folders…
git add . && git commit -m "Short description"
git pull origin main          # grab teammates' changes
git push origin main          # only if `npm run dev` still works!
```

Commit and push every 30–60 minutes. Small pushes rarely conflict.
