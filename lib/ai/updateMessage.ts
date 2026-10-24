/**
 * Writes a short, neutral progress update that a student pastes into the group
 * chat (Snapchat and iMessage don't allow bots, so Carry drafts instead of posting).
 */

import "server-only";
import type { ProjectState } from "../types";
import { isOverdue, relativeDay } from "../utils";
import { fallbackUpdate } from "./fallback";
import { askJson, isObj, str } from "./validate";

const SYSTEM = `You write short progress updates that a student pastes into their group project's chat.
You sound like a friendly, neutral teammate, never a boss.

RULES
- At most 6 lines and about 60 words. Phone-friendly.
- Line 1: the progress and time until the due date. Copy the numbers from PROGRESS exactly; do not recount.
- Then who is up next and on what, using first names, soonest deadline first. Skip done tasks.
- Overdue work is mentioned kindly as "still open". Never blame, shame or call anyone out.
- If any tasks are UNCLAIMED, end with a friendly invitation to grab one.
- Plain text only: no markdown, no headings, no emoji. Bullets with "•" are fine.

Respond with ONLY a JSON object, no prose, no code fences:
{"message": "PSYCH 2220: 3 of 9 tasks done, due in 12 days.\\n• Jordan: lit review slides (in 3 days)\\n• Priya: survey analysis (in 5 days)\\n3 tasks still up for grabs!"}`;

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

/** One header line + one line per task, soonest open work first. Keeps the prompt small. */
function summarize({ project, members, tasks }: ProjectState): string {
  const nameOf = new Map(members.map((m) => [m.id, firstName(m.name)]));
  const done = tasks.filter((t) => t.status === "done").length;
  const ordered = [...tasks].sort(
    (a, b) => Number(a.status === "done") - Number(b.status === "done") || a.internal_due_at.localeCompare(b.internal_due_at),
  );

  const lines = ordered.slice(0, 25).map((t) =>
    [
      t.title,
      t.owner_id ? (nameOf.get(t.owner_id) ?? "someone") : "UNCLAIMED",
      t.status,
      ...(isOverdue(t) ? ["OVERDUE"] : []),
      `due ${relativeDay(t.internal_due_at)}`,
    ].join(" | "),
  );

  return [
    `PROJECT: ${project.name}`,
    `PROGRESS: ${done} of ${tasks.length} tasks done, project due ${relativeDay(project.due_at)}`,
    "TASKS (title | owner | status | overdue? | internal deadline):",
    ...lines,
  ].join("\n");
}

function validateUpdate(raw: unknown): string | null {
  if (!isObj(raw)) return null;
  const message = str(raw.message, 600)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\p{Extended_Pictographic}\uFE0F?/gu, "").trim())
    .filter(Boolean)
    .slice(0, 8)
    .join("\n");
  return message || null;
}

export async function writeUpdate(state: ProjectState): Promise<{ message: string; source: "ai" | "fallback" }> {
  const message = await askJson(SYSTEM, summarize(state), validateUpdate, 400);
  return message ? { message, source: "ai" } : { message: fallbackUpdate(state), source: "fallback" };
}
