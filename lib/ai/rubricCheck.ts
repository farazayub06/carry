/** Flags rubric items that no task in the plan covers. */

import "server-only";
import type { ProjectState, RubricCheckResult } from "../types";
import { fallbackRubricCheck, rubricLines } from "./fallback";
import { askJson, isObj, strList } from "./validate";

const SYSTEM = `You check a student group's task plan against their grading rubric.
For EACH rubric item, decide whether at least one task in the plan clearly covers it.

RULES
- "covered" = a task's title or description clearly produces what the item asks for.
- If you are unsure, or coverage is only implied, put the item in "missing". A false alarm is
  better than telling students they're fine when they aren't.
- Every rubric item goes in exactly one list. Copy each item EXACTLY as written; do not rephrase.

Respond with ONLY a JSON object, no prose, no code fences:
{"covered": ["At least 5 peer-reviewed sources"], "missing": ["Includes a chart of the results"]}`;

/** Loose key for matching the model's copy back to the original item. */
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").replace(/[.;:,]+$/, "").trim();

/** Builds a validator that maps the model's strings back onto the real rubric items. */
function validateWith(items: string[]) {
  return (raw: unknown): Omit<RubricCheckResult, "source"> | null => {
    if (!isObj(raw)) return null;
    const byKey = new Map(items.map((item) => [norm(item), item]));
    const covered = new Set(strList(raw.covered, 50).map((s) => byKey.get(norm(s))).filter((s) => s !== undefined));
    const missing = new Set(strList(raw.missing, 50).map((s) => byKey.get(norm(s))).filter((s) => s !== undefined));
    if (covered.size + missing.size === 0) return null; // matched nothing → garbage reply

    // Conservative: anything the model skipped or put in both lists counts as missing.
    const isCovered = (item: string) => covered.has(item) && !missing.has(item);
    return { covered: items.filter(isCovered), missing: items.filter((i) => !isCovered(i)) };
  };
}

export async function checkRubric(state: ProjectState): Promise<RubricCheckResult> {
  const items = rubricLines(state.project.rubric_text);
  if (items.length === 0) return { covered: [], missing: [], source: "fallback" };
  if (state.tasks.length === 0) return { covered: [], missing: items, source: "fallback" };

  const user = [
    "RUBRIC ITEMS:",
    ...items.map((item) => `- ${item}`),
    "",
    "PLAN (title: what done looks like):",
    ...state.tasks.slice(0, 30).map((t) => `- ${t.title}: ${t.description || "(no description)"}`),
  ].join("\n");

  const ai = await askJson(SYSTEM, user, validateWith(items), 800);
  return ai ? { ...ai, source: "ai" } : fallbackRubricCheck(items, state.tasks);
}
