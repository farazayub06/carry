/** Shared data types for the database, API, and UI. Mirrors supabase/schema.sql. */

/** The four states a task can be in. Shown as colored pills in the UI. */
export type TaskStatus = "not_started" | "in_progress" | "stuck" | "done";

/** Everything that can happen to a task. Each one becomes a row in `events`. */
export type EventType =
  | "claimed" //         someone took ownership of a task
  | "status_changed" //  owner moved it to in_progress / stuck / not_started
  | "completed" //       owner marked it done
  | "confirmed" //       a DIFFERENT teammate confirmed the done task is real
  | "nudge_sent"; //     (stretch) we emailed someone a private reminder

/** One group project. `share_code` is the short code in the share link: /p/<share_code> */
export interface Project {
  id: string;
  name: string; //             e.g. "PSYCH 2220 group presentation"
  assignment_text: string; //  the prompt the professor gave, pasted in
  rubric_text: string; //      the grading rubric, pasted in (can be empty)
  due_at: string; //           REAL due date, ISO string, e.g. "2026-11-06T23:59:00.000Z"
  share_code: string; //       short random code, e.g. "k7x2qp"
  created_at: string; //       ISO timestamp
}

/** A person in the group. There are NO accounts: identity = this id saved in localStorage. */
export interface Member {
  id: string;
  project_id: string;
  name: string;
  email?: string | null; //    optional, only used for (stretch) email nudges
  color: string; //            hex color used for their avatar + workload bar
}

/** One piece of work in the plan. */
export interface Task {
  id: string;
  project_id: string;
  title: string; //               short, e.g. "Draft the introduction"
  description: string; //         one sentence on what "done" looks like
  effort: number; //              1 (tiny) → 5 (huge). Used to make the split FAIR.
  internal_due_at: string; //     OUR deadline (ISO), always ≥ 2 days before the real one
  owner_id: string | null; //     member id, or null if nobody has claimed it yet
  status: TaskStatus;
  completed_at: string | null; // when it was marked done (for the on-time rate)
  confirmed_by: string | null; // member id of the teammate who confirmed it
  position: number; //            display order in the plan (0, 1, 2…)
}

/** One row of the append-only activity log. Never update or delete these. */
export interface Event {
  id: string;
  project_id: string;
  member_id: string; //           who did it
  task_id: string | null; //      which task (null for project-level events)
  type: EventType;
  meta: Record<string, unknown>; // extra info, e.g. { from: "not_started", to: "stuck" }
  created_at: string;
}

/** Everything a screen needs in one object. Returned by GET /api/p/[code]. */
export interface ProjectState {
  project: Project;
  members: Member[];
  tasks: Task[];
  events: Event[];
}

/** Body of POST /api/projects — the "create project" form. */
export interface CreateProjectInput {
  name: string;
  assignment_text: string;
  rubric_text: string;
  due_at: string; //         ISO
  member_names: string[]; // first name in the list = the organizer filling out the form
}

/** A task before it's saved (no id / project_id / status yet). Used by the plan editor. */
export interface DraftTask {
  title: string;
  description: string;
  effort: number;
  internal_due_at: string;
}

/** What the AI planner returns. Validated in lib/ai/validate.ts before we trust it. */
export interface PlanResult {
  tasks: DraftTask[];
  rubric_items: string[]; // the rubric broken into a checklist, used by the rubric check
  source: "ai" | "fallback"; // so the UI (and we, while debugging) know if the AI actually ran
}

/** What the "I'm stuck" helper returns. */
export interface StuckResult {
  substeps: string[]; //                  3–5 smaller steps to get unstuck
  suggest_reassign_to: string | null; //  member id with the lightest load, or null
  reason: string; //                      one friendly sentence explaining the suggestion
  source: "ai" | "fallback";
}

/** What the (stretch) rubric check returns. */
export interface RubricCheckResult {
  covered: string[]; //   rubric items the plan clearly covers
  missing: string[]; //   rubric items nothing in the plan covers yet
  source: "ai" | "fallback";
}

export interface ReceiptRow {
  member_id: string;
  name: string;
  color: string;
  tasks_done: number;
  effort_done: number; //       sum of effort points of tasks they finished
  effort_share_pct: number; //  their effort_done / everyone's effort_done × 100
  on_time_rate_pct: number; //  % of their done tasks finished by the internal deadline
  confirmations: number; //     how many of their done tasks a teammate confirmed
  open_tasks: number; //        tasks they still own that aren't done
}
