/** In-memory DataStore seeded with the demo project. Used when Supabase isn't configured. */

import { buildDemoState } from "../mock";
import type { CreateProjectInput, DraftTask, EventType, ProjectState, Task, TaskStatus } from "../types";
import { clampInternalDeadline, colorFor, newId, newShareCode } from "../utils";
import { StoreError, type DataStore } from "./store";

// A Map from project id → everything in that project.
// Stored on globalThis so it survives Next.js hot-reloading when you save a file.
const g = globalThis as unknown as { __carryDb?: Map<string, ProjectState> };

function db(): Map<string, ProjectState> {
  if (!g.__carryDb) {
    g.__carryDb = new Map();
    const demo = buildDemoState();
    g.__carryDb.set(demo.project.id, demo); // load the demo project so /p/demo42 works
  }
  return g.__carryDb;
}

/** Find a task anywhere in the database, plus the project it belongs to. */
function findTask(taskId: string): { state: ProjectState; task: Task } {
  for (const state of db().values()) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (task) return { state, task };
  }
  throw new StoreError("Task not found", 404);
}

/** Make sure this person is actually in this project (stops random ids from changing things). */
function assertMember(state: ProjectState, memberId: string) {
  if (!state.members.some((m) => m.id === memberId)) {
    throw new StoreError("You're not a member of this project");
  }
}

/** Add a row to the activity log. EVERY change goes through here (the receipt depends on it). */
function logEvent(
  state: ProjectState,
  memberId: string,
  taskId: string | null,
  type: EventType,
  meta: Record<string, unknown> = {},
) {
  state.events.push({
    id: newId(),
    project_id: state.project.id,
    member_id: memberId,
    task_id: taskId,
    type,
    meta,
    created_at: new Date().toISOString(),
  });
}

export const memoryStore: DataStore = {
  /** Look up a project by its share code (the code in the link). */
  async getStateByCode(code) {
    for (const state of db().values()) {
      if (state.project.share_code === code) return structuredClone(state);
    }
    return null;
  },

  /** Look up a project by its id. */
  async getStateById(projectId) {
    const state = db().get(projectId);
    return state ? structuredClone(state) : null;
  },

  /** Create a new project + one member per name. No tasks yet (the AI plan comes next). */
  async createProject(input: CreateProjectInput) {
    const projectId = newId();

    const state: ProjectState = {
      project: {
        id: projectId,
        name: input.name,
        assignment_text: input.assignment_text,
        rubric_text: input.rubric_text,
        due_at: input.due_at,
        share_code: newShareCode(),
        created_at: new Date().toISOString(),
      },
      // One member per name. The first name is the organizer. Each gets a color.
      members: input.member_names.map((name, i) => ({
        id: newId(),
        project_id: projectId,
        name,
        email: null,
        color: colorFor(i),
      })),
      tasks: [],
      events: [],
    };

    db().set(projectId, state); // save it
    return structuredClone(state);
  },

  /** Save the reviewed plan. Replaces ALL tasks in the project. */
  async replaceTasks(projectId, drafts: DraftTask[]) {
    const state = db().get(projectId);
    if (!state) throw new StoreError("Project not found", 404);

    state.tasks = drafts.map((d, i) => ({
      id: newId(),
      project_id: projectId,
      title: d.title,
      description: d.description,
      effort: d.effort,
      // Enforce "our deadline is at least 2 days before the real one", whatever the UI sent.
      internal_due_at: clampInternalDeadline(d.internal_due_at, state.project.due_at),
      owner_id: null, // nobody has claimed it yet
      status: "not_started",
      completed_at: null,
      confirmed_by: null,
      position: i, // display order
    }));

    return structuredClone(state.tasks);
  },

  /** Get one task by id (or null). */
  async getTask(taskId) {
    try {
      return structuredClone(findTask(taskId).task);
    } catch {
      return null;
    }
  },

  /** "I'll take this one." Also how a teammate takes over a ghost's task. */
  async claimTask(taskId, memberId) {
    const { state, task } = findTask(taskId);
    assertMember(state, memberId);
    task.owner_id = memberId;
    logEvent(state, memberId, taskId, "claimed");
    return structuredClone(task);
  },

  /** Move a task between not_started / in_progress / stuck / done. */
  async setStatus(taskId, memberId, status: TaskStatus) {
    const { state, task } = findTask(taskId);
    assertMember(state, memberId);

    const from = task.status;
    if (from === status) return structuredClone(task); // nothing changed → no event

    task.status = status;
    if (status === "done") {
      task.completed_at = new Date().toISOString(); // used for the on-time rate
      logEvent(state, memberId, taskId, "completed");
    } else {
      // Moving OUT of done ("oops, not finished") clears completion + confirmation.
      task.completed_at = null;
      task.confirmed_by = null;
      logEvent(state, memberId, taskId, "status_changed", { from, to: status });
    }
    return structuredClone(task);
  },

  /** A TEAMMATE confirms a done task is really done (our anti-faking check). */
  async confirmTask(taskId, memberId) {
    const { state, task } = findTask(taskId);
    assertMember(state, memberId);
    if (task.status !== "done") throw new StoreError("Only done tasks can be confirmed");
    if (task.owner_id === memberId) throw new StoreError("A teammate has to confirm your task, not you");

    task.confirmed_by = memberId;
    logEvent(state, memberId, taskId, "confirmed");
    return structuredClone(task);
  },
};