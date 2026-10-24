/**
 * lib/db/supabase.ts — the REAL database (Supabase / Postgres)
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 *
 * Same DataStore interface as lib/db/memory.ts, backed by Postgres so every
 * teammate's phone sees the same data. lib/db/index.ts switches to this
 * automatically once these env vars exist (see .env.example):
 *
 *   SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 *
 * SETUP ORDER:
 *   1. Create a free Supabase project
 *   2. SQL Editor → paste supabase/schema.sql → Run
 *   3. Add the two env vars to .env.local
 *
 * SECURITY (be ready if a judge asks):
 * The SERVICE ROLE key bypasses row-level security. That's OK ONLY because
 * this file runs on the server (API routes) and the key never reaches the
 * browser. Never import this from a "use client" file, and never name the
 * variable NEXT_PUBLIC_….
 *
 * USEFUL SNIPPETS:
 *   import { createClient } from "@supabase/supabase-js";
 *   const sb = createClient(url, key, { auth: { persistSession: false } });  // create ONCE, reuse
 *
 *   const { data, error } = await sb.from("projects").select("*").eq("share_code", code).maybeSingle();
 *   await sb.from("tasks").update({ owner_id }).eq("id", taskId).select().single();
 *   await sb.from("events").insert({ project_id, member_id, task_id, type, meta });
 *
 *   Supabase returns { data, error } instead of throwing, so ALWAYS check `error`.
 *   Loading a project = 4 small queries (project, members, tasks, events);
 *   run the last 3 in parallel with Promise.all.
 *
 * RULE: every task change ALSO inserts a row into `events` (the receipt depends on it).
 *
 * TODO (Backend): implement every method (same behavior as described in memory.ts).
 */

import { StoreError, type DataStore } from "./store";

const todo = (what: string): never => {
  throw new StoreError(`TODO (Backend): supabase store ${what} not implemented yet`, 501);
};

export const supabaseStore: DataStore = {
  async getStateByCode() {
    return todo("getStateByCode");
  },
  async getStateById() {
    return todo("getStateById");
  },
  async createProject() {
    return todo("createProject");
  },
  async replaceTasks() {
    return todo("replaceTasks");
  },
  async getTask() {
    return todo("getTask");
  },
  async claimTask() {
    return todo("claimTask");
  },
  async setStatus() {
    return todo("setStatus");
  },
  async confirmTask() {
    return todo("confirmTask");
  },
};
