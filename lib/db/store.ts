/** The DataStore interface, implemented by the in-memory and Supabase stores. */

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
