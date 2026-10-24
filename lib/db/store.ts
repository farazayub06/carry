/**
 * lib/db/store.ts — the DataStore INTERFACE (what any database must be able to do)
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 *
 * THE BIG IDEA:
 * API routes never talk to Supabase directly. They call these functions.
 * We have TWO implementations of this same interface:
 *
 *   lib/db/memory.ts    → keeps everything in RAM, pre-loaded with the demo
 *                         project. Zero setup. Used automatically when the
 *                         Supabase env vars are missing (i.e. right now, on
 *                         everyone's laptop, before Backend finishes setup).
 *
 *   lib/db/supabase.ts  → the real Postgres database. Used automatically once
 *                         SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.
 *
 * lib/db/index.ts picks which one to use. So Frontend and AI can build and
 * test the WHOLE app end to end today, and Backend can swap in the real DB
 * without anyone else changing a line of code.
 *
 * RULE: every function that CHANGES a task must also append an Event.
 * The receipt is computed from events — no event, no credit.
 */

import type {
  CreateProjectInput,
  DraftTask,
  ProjectState,
  Task,
  TaskStatus,
} from "../types";

export interface DataStore {
  /** Look up a project by its share code (the code in /p/<code>). null if not found. */
  getStateByCode(code: string): Promise<ProjectState | null>;

  /** Look up a project by its id. null if not found. */
  getStateById(projectId: string): Promise<ProjectState | null>;

  /** Create the project + its members. Tasks come later, from the AI plan. */
  createProject(input: CreateProjectInput): Promise<ProjectState>;

  /**
   * Save the plan the group reviewed. REPLACES all tasks in the project
   * (simple and safe because this only happens on the plan screen, before
   * anyone has claimed anything).
   */
  replaceTasks(projectId: string, tasks: DraftTask[]): Promise<Task[]>;

  /** Get one task by id (used by the task routes to find the project). */
  getTask(taskId: string): Promise<Task | null>;

  /** Set the owner of a task. Logs a "claimed" event. */
  claimTask(taskId: string, memberId: string): Promise<Task>;

  /**
   * Change a task's status. Logs "completed" if the new status is "done",
   * otherwise "status_changed" with { from, to } in meta.
   */
  setStatus(taskId: string, memberId: string, status: TaskStatus): Promise<Task>;

  /**
   * A teammate (NOT the owner) confirms a done task is really done.
   * Logs a "confirmed" event. This is our lightweight anti-faking check.
   */
  confirmTask(taskId: string, memberId: string): Promise<Task>;
}

/** Thrown when a request is invalid (bad id, confirming your own task, etc). Routes turn it into a 400. */
export class StoreError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}
