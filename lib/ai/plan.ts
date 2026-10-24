/** AI planner: assignment + rubric -> a validated task plan with enforced deadlines. */

import "server-only";
import type { DraftTask, PlanResult } from "../types";
import { clampInternalDeadline } from "../utils";
import { fallbackPlan, rubricLines } from "./fallback";
import { askJson, effort, isObj, str, strList } from "./validate";

const DAY_MS = 86_400_000;
const MAX_INPUT_CHARS = 6000; // keeps a giant paste from blowing the token budget / timeout

const SYSTEM = `You are the planner inside Carry, an app that helps student group projects split work fairly.
Turn the assignment into a concrete task plan for the team.

RULES
- 6 to 10 tasks, SPECIFIC to this assignment. Name the actual topic, sections, slides or features.
  Never generic filler like "Do research" or "Work on project".
- title: short imperative, at most 8 words (e.g. "Draft the methods section").
- description: ONE sentence, under 25 words, describing what "done" looks like.
- effort: an integer 1-5. 1 = under an hour, 2 = a couple of hours, 3 = an afternoon,
  4 = a full day, 5 = multiple days. Be honest so the work can be split fairly across the team.
- Size tasks so the total effort can be divided roughly evenly across the team size given,
  and so tasks can be worked on in parallel where possible.
- internal_due_at: an ISO 8601 date-time. Tasks in a logical order (earlier steps due earlier).
  Every date must be between today and the "latest allowed" date given (2+ days before the real due date).
- The LAST task must be a final review of the whole deliverable against the rubric.
- rubric_items: the rubric broken into a short checklist (at most 12 items, each under 15 words).
  If there is no rubric, derive the checklist from the assignment's requirements.

Respond with ONLY a JSON object in exactly this shape, no prose, no code fences:
{
  "tasks": [
    {
      "title": "Outline the argument on sleep and memory",
      "description": "A one-page outline with thesis, three claims and a source for each.",
      "effort": 2,
      "internal_due_at": "2026-11-02T23:59:00.000Z"
    }
  ],
  "rubric_items": ["Clear thesis in the introduction", "At least 5 peer-reviewed sources"]
}`;

function clip(text: string): string {
  const t = text.trim();
  return t.length > MAX_INPUT_CHARS ? `${t.slice(0, MAX_INPUT_CHARS)}\n[…truncated]` : t;
}

function validatePlan(raw: unknown): Omit<PlanResult, "source"> | null {
  if (!isObj(raw) || !Array.isArray(raw.tasks)) return null;

  const seen = new Set<string>();
  const tasks: DraftTask[] = [];
  for (const t of raw.tasks) {
    if (!isObj(t)) continue;
    const title = str(t.title, 80);
    if (!title || seen.has(title.toLowerCase())) continue;
    seen.add(title.toLowerCase());
    tasks.push({
      title,
      description: str(t.description, 300),
      effort: effort(t.effort),
      internal_due_at: str(t.internal_due_at, 40), // clamped in generatePlan
    });
  }
  if (tasks.length < 3) return null;

  return { tasks: tasks.slice(0, 12), rubric_items: strList(raw.rubric_items, 12) };
}

export async function generatePlan(input: {
  assignment: string;
  rubric: string;
  dueAt: string;
  teamSize: number;
}): Promise<PlanResult> {
  const now = new Date();
  const latest = new Date(Date.parse(input.dueAt) - 2 * DAY_MS);
  const user = [
    `Today: ${now.toISOString()}`,
    `Real due date: ${input.dueAt}`,
    `Latest allowed internal_due_at: ${Number.isNaN(latest.getTime()) ? input.dueAt : latest.toISOString()}`,
    `Team size: ${input.teamSize}`,
    "",
    "ASSIGNMENT:",
    clip(input.assignment) || "(none given)",
    "",
    "RUBRIC:",
    clip(input.rubric) || "(none given)",
  ].join("\n");

  const ai = await askJson(SYSTEM, user, validatePlan, 2000);
  const plan: PlanResult = ai
    ? { ...ai, source: "ai" }
    : fallbackPlan(input.assignment, input.rubric, input.dueAt);

  // The AI is told these rules, but we enforce them here because it can slip.
  if (!plan.tasks.some((t) => /rubric/i.test(t.title))) {
    plan.tasks.push({
      title: "Final review against the rubric",
      description: "Every rubric item checked off before we submit.",
      effort: 2,
      internal_due_at: input.dueAt, // clamped below to 2 days before
    });
  }
  if (plan.rubric_items.length === 0) plan.rubric_items = rubricLines(input.rubric);
  plan.tasks = plan.tasks.map((t) => ({ ...t, internal_due_at: clampInternalDeadline(t.internal_due_at, input.dueAt) }));

  return plan;
}
