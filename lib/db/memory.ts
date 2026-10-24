/**
 * lib/db/memory.ts — IN-MEMORY database (zero setup, for local dev + backup demo)
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 *
 * WHAT IT SHOULD DO:
 * Implement the DataStore interface (lib/db/store.ts) with plain JavaScript
 * objects in RAM, starting with the demo project from lib/mock.ts loaded.
 * Then /p/demo42 works the moment anyone runs `npm run dev`, before Supabase
 * is set up, and it's a backup if Supabase has problems during judging.
 *
 * SUGGESTED SHAPE:
 *   type MemoryDb = Map<string, ProjectState>   // project id → everything in that project
 *
 * GOTCHA, keep the data on globalThis:
 * In `npm run dev`, Next.js hot-reloads modules when you save a file. A plain
 * `let db = …` gets wiped on every save. Store it on globalThis instead:
 *
 *   const g = globalThis as unknown as { __carryDb?: Map<string, ProjectState> };
 *   function db() {
 *     if (!g.__carryDb) {
 *       g.__carryDb = new Map();
 *       const demo = buildDemoState();
 *       g.__carryDb.set(demo.project.id, demo);
 *     }
 *     return g.__carryDb;
 *   }
 *
 * LIMITS (why we still need Supabase for the real demo):
 *   - data disappears when the dev server restarts
 *   - on Vercel each serverless function has its own memory, so two phones
 *     wouldn't see each other's changes
 *
 * RULES (same for supabase.ts):
 *   - every change to a task ALSO pushes an Event (claimed / status_changed /
 *     completed / confirmed). The receipt is computed from events.
 *   - return COPIES (structuredClone) so callers can't mutate stored data
 *   - throw `new StoreError("message", 404)` for not-found / bad input;
 *     API routes turn that into a JSON error response
 *
 * TODO (Backend): implement every method below.
 */

import { StoreError, type DataStore } from "./store";

const todo = (what: string): never => {
  throw new StoreError(`TODO (Backend): memory store ${what} not implemented yet`, 501);
};

export const memoryStore: DataStore = {
  // TODO: loop over db().values(), return a copy of the one whose project.share_code === code, else null
  async getStateByCode() {
    return todo("getStateByCode");
  },

  // TODO: db().get(projectId), copy, or null
  async getStateById() {
    return todo("getStateById");
  },

  // TODO: new project (newId(), newShareCode(), created_at now), members from
  // input.member_names with colorFor(i), tasks: [], events: []; save it; return a copy
  async createProject() {
    return todo("createProject");
  },

  // TODO: replace state.tasks with the drafts → full Task objects (newId, status
  // "not_started", owner null, position = index). Run every internal_due_at
  // through clampInternalDeadline(d.internal_due_at, project.due_at).
  async replaceTasks() {
    return todo("replaceTasks");
  },

  // TODO: find the task in any project; copy or null
  async getTask() {
    return todo("getTask");
  },

  // TODO: check the member belongs to the project; set owner_id; push a "claimed" event
  async claimTask() {
    return todo("claimTask");
  },

  // TODO: if status unchanged → return as-is (no event).
  //   → "done": set completed_at = now, push a "completed" event
  //   → anything else: clear completed_at + confirmed_by, push "status_changed" with meta { from, to }
  async setStatus() {
    return todo("setStatus");
  },

  // TODO: only done tasks; the confirmer must NOT be the owner (StoreError otherwise);
  // set confirmed_by; push a "confirmed" event
  async confirmTask() {
    return todo("confirmTask");
  },
};
