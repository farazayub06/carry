/**
 * lib/ai/plan.ts — FEATURE: turn an assignment into a fair task plan
 * ---------------------------------------------------------------------------
 * OWNER: AI
 *
 * The first "wow" moment in the demo: paste the professor's prompt, get a
 * concrete, balanced plan with deadlines in a few seconds.
 *
 * FLOW:
 *   assignment + rubric + due date + team size
 *        │
 *        ▼  askJson(SYSTEM, user, validatePlan)   ← lib/ai/validate.ts (retries once)
 *        │
 *   PlanResult { tasks[], rubric_items[], source: "ai" }
 *        │  …or fallbackPlan(...) with source: "fallback" if AI is off/failed
 *        ▼
 *   run EVERY internal_due_at through clampInternalDeadline() (lib/utils.ts)
 *
 * The human ALWAYS reviews/edits the plan before saving (plan screen).
 * That's our responsible-AI story: AI drafts, people decide.
 *
 * WRITING THE SYSTEM PROMPT, rules the plan must follow (from the PRD):
 *   - 6–10 tasks, SPECIFIC to this assignment (never generic "do research")
 *   - title: short imperative, ≤ 8 words · description: one sentence of what "done" looks like
 *   - effort: integer 1–5 (1 = under an hour, 3 = an afternoon, 5 = multiple days),
 *     honest, so work can be split fairly across the team size
 *   - internal_due_at: ISO date, in a logical order, ≥ 2 days before the real due date
 *   - always include a final "review against the rubric" task
 *   - rubric_items: the rubric split into a short checklist
 *   - respond with ONLY JSON in the exact PlanResult shape (show it an example!)
 * Include today's date in the user message so deadlines are realistic.
 *
 * TODO (AI):
 *   [ ] SYSTEM prompt (rules above)
 *   [ ] validatePlan(raw): check tasks is an array of objects; clean each field
 *       with str()/effort() from validate.ts; drop tasks with no title;
 *       return null if fewer than 3 tasks
 *   [ ] generatePlan(): the flow above
 *   [ ] Test with 3 real assignment prompts (an essay, a slide deck, a coding project)
 */

import "server-only";
import type { PlanResult } from "../types";
import { fallbackPlan } from "./fallback";

export async function generatePlan(input: {
  assignment: string;
  rubric: string;
  dueAt: string;
  teamSize: number;
}): Promise<PlanResult> {
  // TODO: try the AI first (see the flow above). For now, always the fallback:
  return fallbackPlan(input.assignment, input.rubric, input.dueAt);
}
