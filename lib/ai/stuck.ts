/**
 * "I'm stuck" helper. The model writes the next steps; the suggested helper is
 * chosen in code by workload so the pick stays fair and explainable.
 */

import "server-only";
import type { ProjectState, StuckResult, Task } from "../types";
import { computeWorkload, lightestMember } from "../utils";
import { fallbackStuck } from "./fallback";
import { askJson, isObj, str, strList } from "./validate";

const SYSTEM = `You help a student who is stuck on their part of a group project.
Be encouraging and concrete. No lectures, no generic study advice.

RULES
- substeps: 3 to 5 small, SPECIFIC next steps for THIS task, in order. Each one starts with a verb,
  is under 20 words, and can be done in under an hour.
- reason: ONE friendly sentence suggesting the stuck student pair up with the HELPER named below,
  mentioning that the helper has the lightest load right now. Frame it as teaming up, never as
  taking the task away. Never blame anyone. If HELPER is "none", suggest asking the group chat instead.
- Use first names only.

Respond with ONLY a JSON object, no prose, no code fences:
{"substeps": ["List the three survey questions you can't phrase yet", "..."], "reason": "Priya has the lightest load right now, so pairing up for 30 minutes could get this moving."}`;

const MAX_ASSIGNMENT_CHARS = 3000;
const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

function validateStuck(raw: unknown): { substeps: string[]; reason: string } | null {
  if (!isObj(raw)) return null;
  const substeps = strList(raw.substeps, 5)
    .map((s) => s.replace(/^(?:\d+[.)]|[-*•])\s*/, "").slice(0, 200))
    .filter(Boolean);
  if (substeps.length < 2) return null;
  return { substeps, reason: str(raw.reason, 240) };
}

export async function helpStuck(task: Task, state: ProjectState): Promise<StuckResult> {
  // Fairness: the helper is chosen by workload math, never by the model.
  const helper = lightestMember(state.members, state.tasks, task.owner_id ?? undefined);
  const owner = state.members.find((m) => m.id === task.owner_id);

  const workload = computeWorkload(state.members, state.tasks).perMember.map(({ member, effort }) => {
    const open = state.tasks.filter((t) => t.owner_id === member.id && t.status !== "done").length;
    return `- ${firstName(member.name)}: ${effort} effort points, ${open} open task${open === 1 ? "" : "s"}`;
  });

  const user = [
    "ASSIGNMENT:",
    state.project.assignment_text.trim().slice(0, MAX_ASSIGNMENT_CHARS) || "(none given)",
    "",
    `STUCK TASK: ${task.title}`,
    `WHAT DONE LOOKS LIKE: ${task.description || "(not specified)"}`,
    `STUCK STUDENT: ${owner ? firstName(owner.name) : "unassigned"}`,
    `HELPER: ${helper ? firstName(helper.name) : "none"}`,
    "",
    "CURRENT WORKLOAD:",
    ...workload,
  ].join("\n");

  const ai = await askJson(SYSTEM, user, validateStuck, 600);
  if (!ai) return fallbackStuck(task, state.members, state.tasks);

  return {
    substeps: ai.substeps,
    suggest_reassign_to: helper?.id ?? null,
    reason: ai.reason || fallbackStuck(task, state.members, state.tasks).reason,
    source: "ai",
  };
}
