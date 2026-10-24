/**
 * lib/db/supabase.ts — the REAL database (Supabase / Postgres)
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 *
 * Same DataStore interface as memory.ts, but backed by Postgres so every
 * teammate's phone sees the same data. lib/db/index.ts switches to this
 * automatically when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.
 *
 * SECURITY: the service role key bypasses row-level security. That's OK ONLY
 * because this runs on the server (API routes). Never import this from a
 * "use client" file, and never name the variable NEXT_PUBLIC_….
 *
 * Supabase returns { data, error } instead of throwing, so we ALWAYS check error.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CreateProjectInput, DraftTask, EventType, Member, Project, ProjectState, Task, TaskStatus } from "../types";
import { clampInternalDeadline, colorFor, newShareCode } from "../utils";
import { StoreError, type DataStore } from "./store";

/* ------------------------------------------------------------------------- */
/*  Connection                                                               */
/* ------------------------------------------------------------------------- */

let client: SupabaseClient | null = null;

/** Create the client ONCE and reuse it (making one per request is slow). */
function sb(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Supabase env vars missing");
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

/** Turn Supabase's { data, error } into "return the data or throw". */
function must<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  if (result.data === null) throw new StoreError("Not found", 404);
  return result.data;
}

/* ------------------------------------------------------------------------- */
/*  Helpers                                                                  */
/* ------------------------------------------------------------------------- */

/** Load everything for one project: members, tasks, events (3 queries at the same time). */
async function loadState(project: Project): Promise<ProjectState> {
  const [members, tasks, events] = await Promise.all([
    sb().from("members").select("*").eq("project_id", project.id).order("created_at"),
    sb().from("tasks").select("*").eq("project_id", project.id).order("position"),
    sb().from("events").select("*").eq("project_id", project.id).order("created_at"),
  ]);
  return {
    project,
    members: must(members) as Member[],
    tasks: must(tasks) as Task[],
    events: must(events) as ProjectState["events"],
  };
}

/** Add a row to the activity log (the receipt depends on it). */
async function logEvent(projectId: string, memberId: string, taskId: string | null, type: EventType, meta: Record<string, unknown> = {}) {
  const res = await sb().from("events").insert({ project_id: projectId, member_id: memberId, task_id: taskId, type, meta });
  if (res.error) throw new Error(res.error.message);
}

/** Get a task or throw a clean 404. */
async function getTaskOrThrow(taskId: string): Promise<Task> {
  const res = await sb().from("tasks").select("*").eq("id", taskId).maybeSingle();
  if (res.error) throw new StoreError("Task not found", 404); // e.g. "not-a-uuid" → treat as not found
  if (!res.data) throw new StoreError("Task not found", 404);
  return res.data as Task;
}

/** Make sure this person is actually in this project. */
async function assertMember(projectId: string, memberId: string) {
  const res = await sb().from("members").select("id").eq("project_id", projectId).eq("id", memberId).maybeSingle();
  if (res.error || !res.data) throw new StoreError("You're not a member of this project");
}

/* ------------------------------------------------------------------------- */
/*  The DataStore functions                                                  */
/* ------------------------------------------------------------------------- */

export const supabaseStore: DataStore = {
  async getStateByCode(code) {
    const res = await sb().from("projects").select("*").eq("share_code", code).maybeSingle();
    if (res.error) throw new Error(res.error.message);
    return res.data ? loadState(res.data as Project) : null;
  },

  async getStateById(projectId) {
    const res = await sb().from("projects").select("*").eq("id", projectId).maybeSingle();
    if (res.error) return null; // e.g. not a valid uuid → just "not found"
    return res.data ? loadState(res.data as Project) : null;
  },

  async createProject(input: CreateProjectInput) {
    // 1. The project row (Postgres generates the id).
    const project = must(
      await sb()
        .from("projects")
        .insert({
          name: input.name,
          assignment_text: input.assignment_text,
          rubric_text: input.rubric_text,
          due_at: input.due_at,
          share_code: newShareCode(),
        })
        .select()
        .single(),
    ) as Project;

    // 2. One member row per name, inserted one at a time so join order is preserved.
    for (const [i, name] of input.member_names.entries()) {
      const res = await sb().from("members").insert({ project_id: project.id, name, color: colorFor(i) });
      if (res.error) throw new Error(res.error.message);
    }

    return loadState(project);
  },

  async replaceTasks(projectId, drafts: DraftTask[]) {
    const project = (await sb().from("projects").select("*").eq("id", projectId).maybeSingle()).data as Project | null;
    if (!project) throw new StoreError("Project not found", 404);

    // Delete the old plan, insert the new one. Events keep their history (task_id → null).
    const del = await sb().from("tasks").delete().eq("project_id", projectId);
    if (del.error) throw new Error(del.error.message);

    const rows = drafts.map((d, i) => ({
      project_id: projectId,
      title: d.title,
      description: d.description,
      effort: d.effort,
      internal_due_at: clampInternalDeadline(d.internal_due_at, project.due_at),
      position: i,
    }));
    return must(await sb().from("tasks").insert(rows).select().order("position")) as Task[];
  },

  async getTask(taskId) {
    try {
      return await getTaskOrThrow(taskId);
    } catch {
      return null;
    }
  },

  async claimTask(taskId, memberId) {
    const task = await getTaskOrThrow(taskId);
    await assertMember(task.project_id, memberId);
    const updated = must(await sb().from("tasks").update({ owner_id: memberId }).eq("id", taskId).select().single()) as Task;
    await logEvent(task.project_id, memberId, taskId, "claimed");
    return updated;
  },

  async setStatus(taskId, memberId, status: TaskStatus) {
    const task = await getTaskOrThrow(taskId);
    await assertMember(task.project_id, memberId);
    if (task.status === status) return task; // nothing changed → no event

    const patch =
      status === "done"
        ? { status, completed_at: new Date().toISOString() }
        : { status, completed_at: null, confirmed_by: null }; // moving out of done clears these

    const updated = must(await sb().from("tasks").update(patch).eq("id", taskId).select().single()) as Task;

    if (status === "done") await logEvent(task.project_id, memberId, taskId, "completed");
    else await logEvent(task.project_id, memberId, taskId, "status_changed", { from: task.status, to: status });

    return updated;
  },

  async confirmTask(taskId, memberId) {
    const task = await getTaskOrThrow(taskId);
    await assertMember(task.project_id, memberId);
    if (task.status !== "done") throw new StoreError("Only done tasks can be confirmed");
    if (task.owner_id === memberId) throw new StoreError("A teammate has to confirm your task, not you");

    const updated = must(await sb().from("tasks").update({ confirmed_by: memberId }).eq("id", taskId).select().single()) as Task;
    await logEvent(task.project_id, memberId, taskId, "confirmed");
    return updated;
  },
};