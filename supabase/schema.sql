-- supabase/schema.sql — the real database tables
-- ---------------------------------------------------------------------------
-- OWNER: Backend
--
-- HOW TO RUN: Supabase dashboard → SQL Editor → New query → paste this whole
-- file → Run. Safe to re-run: it drops and recreates the tables (WIPES DATA).
--
-- These tables mirror the TypeScript types in lib/types.ts exactly.
-- If you change one, change the other in the same commit.
--
--   projects 1 ──< members
--   projects 1 ──< tasks
--   projects 1 ──< events   (append-only activity log → powers the receipt)

drop table if exists events;
drop table if exists tasks;
drop table if exists members;
drop table if exists projects;

-- One group project. share_code is what goes in the link: /p/<share_code>
create table projects (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  assignment_text text not null default '',
  rubric_text     text not null default '',
  due_at          timestamptz not null,          -- the REAL due date
  share_code      text not null unique,
  created_at      timestamptz not null default now()
);

-- People in the group. No accounts: the browser remembers which member you are.
create table members (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  email       text,                              -- optional, for (stretch) nudge emails
  color       text not null default '#2563eb',
  created_at  timestamptz not null default now()
);

-- The plan. Deleting a member un-assigns their tasks instead of deleting them.
create table tasks (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references projects(id) on delete cascade,
  title            text not null,
  description      text not null default '',
  effort           int  not null default 2 check (effort between 1 and 5),
  internal_due_at  timestamptz not null,         -- OUR deadline, ≥ 2 days before due_at
  owner_id         uuid references members(id) on delete set null,
  status           text not null default 'not_started'
                   check (status in ('not_started', 'in_progress', 'stuck', 'done')),
  completed_at     timestamptz,
  confirmed_by     uuid references members(id) on delete set null,
  position         int  not null default 0,
  created_at       timestamptz not null default now()
);

-- Append-only log. NEVER update or delete rows here; the receipt depends on it.
-- task_id is "set null" on delete so the history survives when a plan is re-saved.
create table events (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  member_id   uuid not null references members(id) on delete cascade,
  task_id     uuid references tasks(id) on delete set null,
  type        text not null
              check (type in ('claimed', 'status_changed', 'completed', 'confirmed', 'nudge_sent')),
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- Indexes for the queries we actually run (lookups by share code / project).
create index on members (project_id);
create index on tasks (project_id, position);
create index on events (project_id, created_at);

-- Row Level Security ON with NO policies = the public "anon" key can't read
-- anything. Our server uses the service role key, which bypasses RLS.
-- (This is the safe default: the browser never talks to Supabase directly.)
alter table projects enable row level security;
alter table members  enable row level security;
alter table tasks    enable row level security;
alter table events   enable row level security;
