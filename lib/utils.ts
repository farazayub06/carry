/** IDs, dates, deadline rules, task state, and workload math. */

import type { Member, Task } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000; // one day in milliseconds

/** A random UUID, the internal label for every saved thing. */
export function newId(): string {
  return crypto.randomUUID();
}

/** The short code in the share link: /p/<code>. 6 chars, no look-alikes (0/o, 1/l/i). */
export function newShareCode(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0, o, 1, l, i
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

/** ISO string for "n days from now" at 11:59 PM (negative = past). Keeps the demo fresh. */
export function daysFromNow(n: number): string {
  const d = new Date(Date.now() + n * DAY_MS);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}

/** Whole days between now and the date (negative = overdue). */
export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / DAY_MS);
}

/** "Thu, Nov 6": short and readable on a phone. */
export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** "in 3 days" / "tomorrow" / "today" / "2 days late". */
export function relativeDay(iso: string): string {
  const d = daysUntil(iso);
  if (d < -1) return `${Math.abs(d)} days late`;
  if (d === -1) return "1 day late";
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  return `in ${d} days`;
}

/**
 * Internal deadlines must be at least 2 days before the real due date (time to
 * assemble everything) and never in the past. Enforced in code, not just in the AI prompt.
 */
export function clampInternalDeadline(iso: string, realDueIso: string): string {
  const latestAllowed = new Date(realDueIso).getTime() - 2 * DAY_MS; // 2 days before due
  const earliestAllowed = Date.now() + 0.5 * DAY_MS; //                 at least half a day from now
  let t = new Date(iso).getTime();
  if (Number.isNaN(t)) t = latestAllowed; //                  garbage date → latest safe day
  t = Math.min(t, latestAllowed); //                          too late → pull it earlier
  t = Math.max(t, Math.min(earliestAllowed, latestAllowed)); // in the past → push it later
  return new Date(t).toISOString();
}

/** Past its internal deadline and not done → red flag. */
export function isOverdue(task: Task): boolean {
  return task.status !== "done" && daysUntil(task.internal_due_at) < 0;
}

/** "Needs attention" = overdue, OR stuck, OR due within ~1 day and not started. */
export function isAtRisk(task: Task): boolean {
  if (task.status === "done") return false;
  if (isOverdue(task)) return true;
  if (task.status === "stuck") return true;
  return daysUntil(task.internal_due_at) <= 1 && task.status === "not_started";
}

export interface Workload {
  member: Member;
  effort: number; // total effort points of tasks they OWN (done or not)
  share: number; //  0–1, their slice of all claimed effort
}

/** Who owns how much work. Drives the workload bar ("is the split fair?"). */
export function computeWorkload(members: Member[], tasks: Task[]) {
  const claimedTotal = tasks.filter((t) => t.owner_id).reduce((sum, t) => sum + t.effort, 0);

  const perMember: Workload[] = members.map((member) => {
    const effort = tasks.filter((t) => t.owner_id === member.id).reduce((sum, t) => sum + t.effort, 0);
    return { member, effort, share: claimedTotal ? effort / claimedTotal : 0 };
  });

  const unclaimedEffort = tasks.filter((t) => !t.owner_id).reduce((sum, t) => sum + t.effort, 0);

  return { perMember, unclaimedEffort, totalEffort: claimedTotal + unclaimedEffort };
}

/** The member carrying the LEAST effort (excluding the stuck person). Used by the "I'm stuck" helper. */
export function lightestMember(members: Member[], tasks: Task[], excludeId?: string): Member | null {
  const { perMember } = computeWorkload(members, tasks);
  return (
    perMember
      .filter((w) => w.member.id !== excludeId)
      .sort((a, b) => a.effort - b.effort)[0]?.member ?? null
  );
}

/** One color per teammate (avatar + workload bar), assigned in join order. */
export const MEMBER_COLORS = ["#9f06f8", "#d97706", "#059669", "#db2777", "#7c3aed", "#0891b2"];

export function colorFor(index: number): string {
  return MEMBER_COLORS[index % MEMBER_COLORS.length];
}