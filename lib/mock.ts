/**
 * Demo project used by the in-memory store and loaded into Supabase by
 * scripts/seed.ts. Four students, one presentation due in 12 days:
 *   Maya (organizer, did the most), Jordan (steady), Priya (stuck on the
 *   analysis), Sam (claimed a task, never started, now overdue).
 * All dates are relative to now, and the event log matches the task states.
 */

import type { Event, ProjectState, Task } from "./types";
import { colorFor, daysFromNow } from "./utils";

/** The share code for the demo. Visit /p/demo42 to see it. */
export const DEMO_CODE = "demo42";

/** A timestamp `days` (+ optional hours) in the past. Used for history. */
function ago(days: number, hours = 0): string {
  return new Date(Date.now() - (days * 24 + hours) * 3_600_000).toISOString();
}

const ASSIGNMENT = `PSYCH 2220: Data Analysis in Psychology — Group Research Presentation

In groups of 4, design and run a small survey study on a question about everyday student behavior. This semester's topic: "Does screen time in the hour before bed predict self-reported sleep quality in college students?"

Your group must:
1. Write a short survey (8–10 questions) using at least one validated scale (e.g. a shortened Pittsburgh Sleep Quality Index).
2. Collect at least 30 responses from OSU students.
3. Analyze the data in Excel or R: descriptive statistics, a correlation, and one chart of the main result.
4. Ground your hypothesis in at least 5 peer-reviewed sources (APA 7th edition).
5. Deliver a 12-minute presentation (10–14 slides) followed by 3 minutes of Q&A. Every member must present.

Submit your slides on Carmen by 11:59 PM on the due date. Each member also submits a short peer evaluation.`;

const RUBRIC = `Clear research question and hypothesis (10 pts)
At least 5 peer-reviewed sources, cited in APA 7th edition (15 pts)
Survey uses at least one validated scale (10 pts)
At least 30 survey responses collected (10 pts)
Correct descriptive statistics and correlation (20 pts)
At least one clear, labeled chart of the main result (10 pts)
Discussion of limitations and future research (10 pts)
Presentation is 10–14 slides and 12 minutes long (5 pts)
Every group member presents a section (10 pts)`;

export function buildDemoState(): ProjectState {
  const projectId = "demo-project";

  // Helper so each task below only lists what makes it different.
  const task = (t: Partial<Task> & Pick<Task, "id" | "title" | "description" | "effort" | "internal_due_at" | "position">): Task => ({
    project_id: projectId,
    owner_id: null,
    status: "not_started",
    completed_at: null,
    confirmed_by: null,
    ...t,
  });

  const tasks: Task[] = [
    // ---- DONE + confirmed ----
    task({
      id: "t-1", position: 0, effort: 2,
      title: "Write the survey questions",
      description: "8–10 questions on pre-bed screen time plus the shortened PSQI sleep scale, in a Google Form.",
      internal_due_at: daysFromNow(-2),
      owner_id: "m-maya", status: "done", completed_at: ago(3, 4), confirmed_by: "m-jordan",
    }),
    task({
      id: "t-2", position: 1, effort: 3,
      title: "Find 6 peer-reviewed sources",
      description: "Six studies on screens and sleep, each with a one-line summary and an APA 7 citation.",
      internal_due_at: daysFromNow(-1),
      owner_id: "m-jordan", status: "done", completed_at: ago(1, 20), confirmed_by: "m-maya",
    }),
    task({
      id: "t-4", position: 3, effort: 1,
      title: "Set up the shared slide deck",
      description: "Google Slides deck with the 12-slide outline, a theme, and each person's section labeled.",
      internal_due_at: daysFromNow(2),
      owner_id: "m-maya", status: "done", completed_at: ago(1, 3), confirmed_by: "m-priya",
    }),

    // ---- DONE but waiting for a teammate to confirm ----
    task({
      id: "t-11", position: 4, effort: 2,
      title: "Draft the intro and hypothesis slides",
      description: "Two slides stating the research question, why it matters, and our hypothesis.",
      internal_due_at: daysFromNow(3),
      owner_id: "m-maya", status: "done", completed_at: ago(0, 2),
    }),

    // ---- THE GHOST: claimed, never started, overdue ----
    task({
      id: "t-3", position: 2, effort: 2,
      title: "Collect 30+ survey responses",
      description: "Post the survey in three class group chats and track the count until we pass 30.",
      internal_due_at: daysFromNow(-2),
      owner_id: "m-sam",
    }),

    // ---- STUCK ----
    task({
      id: "t-5", position: 5, effort: 4,
      title: "Run the correlation in Excel",
      description: "Clean the responses, compute means and SDs, and run a Pearson correlation of screen time vs. sleep score.",
      internal_due_at: daysFromNow(4),
      owner_id: "m-priya", status: "stuck",
    }),

    // ---- IN PROGRESS ----
    task({
      id: "t-6", position: 6, effort: 3,
      title: "Write the literature review slides",
      description: "Three slides summarizing what past studies found, leading into our hypothesis.",
      internal_due_at: daysFromNow(5),
      owner_id: "m-jordan", status: "in_progress",
    }),

    // ---- UP FOR GRABS ----
    task({
      id: "t-7", position: 7, effort: 2,
      title: "Make the main results chart",
      description: "A labeled scatter plot of screen time vs. sleep score with the trend line and r value.",
      internal_due_at: daysFromNow(6),
    }),
    task({
      id: "t-8", position: 8, effort: 3,
      title: "Write the discussion and limitations slides",
      description: "Two slides on what the result means, three honest limitations, and one idea for future research.",
      internal_due_at: daysFromNow(7),
    }),
    task({
      id: "t-9", position: 9, effort: 2,
      title: "Rehearse and time the 12-minute talk",
      description: "Full run-through on Zoom with everyone presenting; trim until it lands between 11 and 13 minutes.",
      internal_due_at: daysFromNow(9),
    }),

    // ---- FINAL REVIEW (claimed by the organizer, not started) ----
    task({
      id: "t-10", position: 10, effort: 2,
      title: "Final review against the rubric",
      description: "Check every rubric item off on the final deck before Maya submits on Carmen.",
      internal_due_at: daysFromNow(10),
      owner_id: "m-maya",
    }),
  ].sort((a, b) => a.position - b.position);

  // Event history that MATCHES the tasks above (oldest first).
  const ev = (
    id: string,
    member: string,
    taskId: string | null,
    type: Event["type"],
    created_at: string,
    meta: Record<string, unknown> = {},
  ): Event => ({ id, project_id: projectId, member_id: member, task_id: taskId, type, meta, created_at });

  const events: Event[] = [
    // Day 1: plan made, people claim tasks
    ev("e-1", "m-maya", "t-1", "claimed", ago(4, 6)),
    ev("e-2", "m-jordan", "t-2", "claimed", ago(4, 5)),
    ev("e-3", "m-sam", "t-3", "claimed", ago(4, 5)),
    ev("e-4", "m-maya", "t-4", "claimed", ago(4, 4)),
    ev("e-5", "m-maya", "t-10", "claimed", ago(4, 4)),
    ev("e-6", "m-priya", "t-5", "claimed", ago(3, 22)),
    // Maya finishes the survey, Jordan confirms
    ev("e-7", "m-maya", "t-1", "completed", ago(3, 4)),
    ev("e-8", "m-jordan", "t-1", "confirmed", ago(3, 1)),
    ev("e-9", "m-jordan", "t-6", "claimed", ago(2, 8)),
    ev("e-10", "m-maya", "t-11", "claimed", ago(2, 7)),
    ev("e-11", "m-priya", "t-5", "status_changed", ago(2, 3), { from: "not_started", to: "in_progress" }),
    // Jordan finishes sources, Maya confirms
    ev("e-12", "m-jordan", "t-2", "completed", ago(1, 20)),
    ev("e-13", "m-maya", "t-2", "confirmed", ago(1, 18)),
    ev("e-14", "m-jordan", "t-6", "status_changed", ago(1, 10), { from: "not_started", to: "in_progress" }),
    // Maya sets up the deck, Priya confirms
    ev("e-15", "m-maya", "t-4", "completed", ago(1, 3)),
    ev("e-16", "m-priya", "t-4", "confirmed", ago(1, 1)),
    // Maya nudges about the overdue survey responses
    ev("e-17", "m-maya", "t-3", "nudge_sent", ago(0, 20)),
    // Priya gets stuck on the analysis
    ev("e-18", "m-priya", "t-5", "status_changed", ago(0, 6), { from: "in_progress", to: "stuck" }),
    // Maya finishes the intro slides (waiting for confirmation)
    ev("e-19", "m-maya", "t-11", "completed", ago(0, 2)),
  ];

  return {
    project: {
      id: projectId,
      name: "PSYCH 2220 Group Presentation",
      assignment_text: ASSIGNMENT,
      rubric_text: RUBRIC,
      due_at: daysFromNow(12),
      share_code: DEMO_CODE,
      created_at: ago(4, 7),
    },

    // Readable ids ("m-maya", "t-1") make debugging easy.
    members: ["Maya", "Jordan", "Priya", "Sam"].map((name, i) => ({
      id: `m-${name.toLowerCase()}`,
      project_id: projectId,
      name,
      email: null,
      color: colorFor(i),
    })),

    tasks,
    events,
  };
}
