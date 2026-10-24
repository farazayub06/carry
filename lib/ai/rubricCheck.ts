/**
 * lib/ai/rubricCheck.ts — FEATURE (STRETCH / P2): "are we missing anything?"
 * ---------------------------------------------------------------------------
 * OWNER: AI
 *
 * Compare the rubric against the plan and flag rubric items NO task covers
 * (e.g. "the rubric wants a chart, but nobody owns making a chart").
 *
 * ⚠️  Only start this after every P0/P1 feature works (see the PRD).
 *
 * TODO (AI):
 *   [ ] split project.rubric_text into items (one per line)
 *   [ ] SYSTEM prompt: for each rubric item decide if a task clearly covers it;
 *       JSON only: {"covered":[...],"missing":[...]}, copying items exactly
 *   [ ] checkRubric(): askJson → else fallbackRubricCheck()
 */

import "server-only";
import type { ProjectState, RubricCheckResult } from "../types";
import { fallbackRubricCheck } from "./fallback";

export async function checkRubric(state: ProjectState): Promise<RubricCheckResult> {
  // TODO: AI version (see above). For now, always the fallback:
  const items = state.project.rubric_text.split("\n").filter(Boolean);
  return fallbackRubricCheck(items, state.tasks);
}
