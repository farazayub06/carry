# Carry

**Stop carrying your group project.** Carry is a mobile-first web app that turns a class assignment into a fair, AI-generated plan, keeps a student group on track from inside the group chat they already use, and produces an evidence-based contribution receipt at the end.

Built in 24 hours at **HackOHI/O 2026** (Open Challenge track).

**Live:** https://carry-alpha.vercel.app · **Demo group:** https://carry-alpha.vercel.app/p/demo42

## The problem

Student group projects run in Snapchat and iMessage group chats, where work gets split unevenly, deadlines slip, and one person usually ends up carrying the team. Professors grade the group, so effort is invisible, and peer evaluations come down to memory and vibes.

## How Carry works

1. **Create a project.** Paste the assignment and rubric, add teammates, set the due date.
2. **Review the AI plan.** Claude drafts 6 to 10 specific tasks with effort points (1 to 5) and internal deadlines at least 2 days before the real due date. The group edits anything before saving.
3. **Share one link.** Paste it into the group chat. Teammates tap their name; there are no accounts.
4. **Work the dashboard.** Claim tasks, update status, see the workload split, and spot overdue or stuck work. "I'm stuck" returns concrete next steps and suggests the teammate with the lightest load. "Copy update" writes a neutral progress message to paste into the chat, since those apps don't allow bots.
5. **Confirm and get the receipt.** A teammate (never the owner) confirms finished work. The contribution receipt shows each person's share of finished effort, on-time rate, and confirmations, all computed from an append-only activity log.

## Tech

- **Next.js 16** (App Router, Turbopack) with TypeScript and Tailwind CSS v4
- **Supabase Postgres** accessed only from server route handlers with the service role key; Row Level Security is enabled with no public policies
- **Claude** (Anthropic Messages API) for planning, stuck help, group chat updates, and rubric coverage
- **Vercel** for deployment from `main`

### Design decisions

- **Event log as the source of truth.** Every claim, status change, and confirmation appends an event. The receipt is derived from events and tasks, so credit can't be edited after the fact.
- **Pluggable data store.** `lib/db/store.ts` defines one interface with an in-memory implementation (seeded demo data, zero setup) and a Supabase implementation, selected automatically by environment variables.
- **AI with guardrails.** Model output is parsed and validated, retried once with a stricter prompt, and replaced by rule-based fallbacks if it still fails. Fairness-critical choices, like who should help a stuck teammate and deadline limits, are computed in code rather than left to the model.
- **No accounts.** Identity is the member id saved in the browser for each project link, which keeps joining from a group chat to one tap.

## Project structure

```
app/              pages and API route handlers (app/api/*)
components/       screens and UI components
lib/types.ts      shared data types
lib/utils.ts      ids, dates, deadline rules, workload math
lib/db/           DataStore interface, memory + Supabase stores, receipt math
lib/ai/           model client, JSON validation, prompts, fallbacks
lib/mock.ts       demo project
supabase/         database schema
scripts/          demo seeding and AI key check
```

## API

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/projects` | Create a project and its members |
| POST | `/api/projects/[id]/plan` | AI-drafted plan (not saved) |
| PUT | `/api/projects/[id]/tasks` | Save the reviewed plan |
| GET | `/api/p/[code]` | Full project state by share code |
| POST | `/api/tasks/[id]/claim` | Claim a task |
| POST | `/api/tasks/[id]/status` | Change a task's status |
| POST | `/api/tasks/[id]/confirm` | A teammate confirms a finished task |
| POST | `/api/tasks/[id]/stuck` | Next steps and a suggested helper |
| GET | `/api/projects/[id]/update-message` | Group chat progress update |
| GET | `/api/projects/[id]/receipt` | Contribution receipt rows |
| POST | `/api/projects/[id]/rubric-check` | Rubric items no task covers |

## Running locally

```bash
git clone https://github.com/farazayub06/carry.git
cd carry
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. With no environment variables, Carry runs on in-memory demo data with rule-based AI fallbacks.

To use real services, set these in `.env.local`:

- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, after running `supabase/schema.sql` in the Supabase SQL editor
- `ANTHROPIC_API_KEY` for the AI features

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | Type-check |
| `npm run lint` | Lint |
| `npm run seed` | Load the demo project into Supabase |

## Team

Built by Faraz Ayub (backend), Preston Laryea (AI), and Thomas Dyer (frontend).
