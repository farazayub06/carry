/**
 * lib/ai/stuck.ts — FEATURE: the "I'm stuck, help me" helper
 * ---------------------------------------------------------------------------
 * OWNER: AI
 *
 * When someone marks a task "stuck" and taps "Help me", return:
 *   1. substeps: 3–5 small, specific next steps (each doable in < 1 hour)
 *   2. suggest_reassign_to: the teammate with the LIGHTEST load (never the owner)
 *   3. reason: one friendly sentence suggesting they pair up. Never blame anyone.
 *
 * IMPORTANT DESIGN CHOICE: the "who could help" pick is computed in CODE with
 * lightestMember() from lib/utils.ts, NOT by the model. That keeps it fair and
 * explainable. The model only writes the steps and the friendly sentence.
 *
 * What to send the model: the assignment text, the stuck task (title +
 * description), the owner's name, the suggested helper's name, everyone's
 * current workload.
 *
 * TODO (AI):
 *   [ ] SYSTEM prompt: encouraging, concrete, no lectures, JSON only:
 *       {"substeps":["..."],"reason":"..."}
 *   [ ] validator: ≥ 2 substeps, clean strings
 *   [ ] helpStuck(): pick helper in code → askJson → else fallbackStuck()
 */

import "server-only";
import type { ProjectState, StuckResult, Task } from "../types";
import { fallbackStuck } from "./fallback";

export async function helpStuck(task: Task, state: ProjectState): Promise<StuckResult> {
  // TODO: AI version (see above). For now, always the fallback:
  return fallbackStuck(task, state.members, state.tasks);
}
