/**
 * lib/ai/fallback.ts — rule-based answers for when the AI is off or fails
 * ---------------------------------------------------------------------------
 * OWNER: AI
 *
 * Every AI feature has a "simple but reliable" twin here. Used when:
 *   - there's no API key yet (everyone's laptop on day one)
 *   - the API times out or returns broken JSON twice
 *   - the venue Wi-Fi dies during judging
 *
 * Keep them predictable. Tag every result source: "fallback" so the UI can
 * say "AI unavailable, so here's a starter plan".
 *
 * TODO (AI): implement all four. Ideas below each one.
 */

import type { Member, PlanResult, ProjectState, RubricCheckResult, StuckResult, Task } from "../types";

/**
 * A generic plan. IDEAS:
 *   - detect the assignment type from keywords (slides/presentation, code/app,
 *     survey/data) and add matching tasks
 *   - always start with "Break down the prompt and rubric", end with
 *     "Final review against the rubric"
 *   - spread internal deadlines evenly from now to (due date − 2 days)
 *   - rubric_items = the rubric split by line
 */
export function fallbackPlan(assignment: string, rubric: string, dueAt: string): PlanResult {
  // TODO. Placeholder: a single task so screens have something to show.
  void assignment;
  void rubric;
  return {
    tasks: [{ title: "TODO: fallback plan", description: "See lib/ai/fallback.ts", effort: 2, internal_due_at: dueAt }],
    rubric_items: [],
    source: "fallback",
  };
}

/**
 * Generic unblocking steps + suggest the lightest-loaded teammate
 * (lightestMember() in lib/utils.ts, excluding the task owner).
 */
export function fallbackStuck(task: Task, members: Member[], tasks: Task[]): StuckResult {
  // TODO
  void task;
  void members;
  void tasks;
  return { substeps: ["TODO: fallback stuck steps"], suggest_reassign_to: null, reason: "", source: "fallback" };
}

/**
 * A short group-chat update built from a template, e.g.
 *   "📋 PSYCH 2220: 3/9 tasks done, due in 12 days.
 *    • Jordan: Lit review slides (in 3 days)
 *    • Priya: Analyze survey results (in 5 days)
 *    🙋 3 tasks still up for grabs"
 */
export function fallbackUpdate(state: ProjectState): string {
  // TODO
  return `TODO: fallback update for ${state.project.name}`;
}

/** Naive check: a rubric item counts as "covered" if a task title/description shares a keyword with it. */
export function fallbackRubricCheck(rubricItems: string[], tasks: Task[]): RubricCheckResult {
  // TODO
  void tasks;
  return { covered: [], missing: rubricItems, source: "fallback" };
}
