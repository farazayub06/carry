/**
 * lib/mock.ts — the DEMO group project ("the story we tell in the video")
 * ---------------------------------------------------------------------------
 * OWNER: Product/Demo writes the story · Frontend + Backend use the data
 *
 * WHY THIS EXISTS:
 *   1. Frontend can build every screen NOW against realistic data, without
 *      waiting for Backend's API routes.
 *   2. Backend's in-memory store (lib/db/memory.ts) can start with this
 *      project loaded, so /p/demo42 works before Supabase is set up.
 *   3. scripts/seed.ts pushes this same project into Supabase for the live demo.
 *
 * THE STORY (Product: make it relatable, it's what judges watch):
 *   Four students, one presentation, due in ~12 days.
 *   - Maya   = the organizer (usually carries the team)
 *   - Jordan = solid, gets things done
 *   - Priya  = working on it, but stuck on the data section
 *   - Sam    = the GHOST: claimed a task, never started, now overdue
 *
 * Use daysFromNow() for EVERY date so the demo looks right whether you open
 * it tonight or during judging tomorrow.
 *
 * TODO (Product/Demo):
 *   [ ] Write the full assignment prompt + rubric (realistic, OSU-flavored)
 *   [ ] 8–10 tasks that tell the story: some done + confirmed, Sam's task
 *       overdue, Priya's task stuck, 2–3 unclaimed ("up for grabs")
 *   [ ] An `events` history that MATCHES the task states (a claimed event for
 *       every owner, a completed event for every done task, a confirmed event
 *       for every confirmation…). The receipt is computed from events.
 */

import type { ProjectState } from "./types";
import { colorFor, daysFromNow } from "./utils";

/** The share code for the demo. Visit /p/demo42 to see it. */
export const DEMO_CODE = "demo42";

export function buildDemoState(): ProjectState {
  const projectId = "demo-project";

  return {
    project: {
      id: projectId,
      name: "PSYCH 2220 Group Presentation",
      assignment_text: "TODO (Product): paste a realistic assignment prompt here.",
      rubric_text: "TODO (Product): one rubric criterion per line.",
      due_at: daysFromNow(12),
      share_code: DEMO_CODE,
      created_at: daysFromNow(-4),
    },

    // Readable ids ("m-maya", "t-1") make debugging easy.
    members: ["Maya", "Jordan", "Priya", "Sam"].map((name, i) => ({
      id: `m-${name.toLowerCase()}`,
      project_id: projectId,
      name,
      email: null,
      color: colorFor(i),
    })),

    // Two EXAMPLE tasks showing the shape. TODO (Product): replace with the full story.
    tasks: [
      {
        id: "t-1",
        project_id: projectId,
        title: "Write the survey questions",
        description: "8–10 questions on screen time before bed and sleep quality.",
        effort: 2,
        internal_due_at: daysFromNow(-2),
        owner_id: "m-maya",
        status: "done",
        completed_at: daysFromNow(-3),
        confirmed_by: "m-jordan",
        position: 0,
      },
      {
        id: "t-2",
        project_id: projectId,
        title: "Collect 20+ survey responses",
        description: "Post the survey in 3 class group chats and track the count daily.",
        effort: 2,
        internal_due_at: daysFromNow(-1),
        owner_id: null, // the ghost: claimed, never started, now overdue
        status: "not_started",
        completed_at: null,
        confirmed_by: null,
        position: 1,
      },
    ],

    // Example events matching the tasks above. TODO (Product): one per real action in the story.
    events: [
      { id: "e-1", project_id: projectId, member_id: "m-maya", task_id: "t-1", type: "claimed", meta: {}, created_at: daysFromNow(-4) },
      { id: "e-2", project_id: projectId, member_id: "m-sam", task_id: "t-2", type: "claimed", meta: {}, created_at: daysFromNow(-4) },
      { id: "e-3", project_id: projectId, member_id: "m-maya", task_id: "t-1", type: "completed", meta: {}, created_at: daysFromNow(-3) },
      { id: "e-4", project_id: projectId, member_id: "m-jordan", task_id: "t-1", type: "confirmed", meta: {}, created_at: daysFromNow(-3) },
    ],
  };
}
