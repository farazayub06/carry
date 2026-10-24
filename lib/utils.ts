/**
 * lib/utils.ts — small helpers used everywhere (ids, dates, workload math)
 * ---------------------------------------------------------------------------
 * OWNER: shared (Backend writes these first; announce in the chat before changing)
 *
 * Pure functions with no side effects, so they're safe on the server (API
 * routes) AND in the browser (components).
 *
 * The signatures below are the agreed contract: other files call these
 * names. Each body is a TODO with a placeholder return so the app compiles.
 * Replace the placeholder, keep the signature.
 */

import type { Member, Task } from "./types";

/* ----------------------------- IDs & codes ------------------------------- */

/** A random UUID. Hint: crypto.randomUUID() works in Node and modern browsers. */
export function newId(): string {
  // TODO
  return "todo-id";
}

/**
 * The short code in the share link: /p/<code>.
 * TODO: 6 random characters from an alphabet WITHOUT look-alikes
 * (no 0/o, 1/l/i) so it's easy to read aloud, e.g. "k7x2qp".
 */
export function newShareCode(): string {
  // TODO
  return "todo42";
}

/* ------------------------------- Dates ----------------------------------- */

/** ISO string for "n days from now" (negative = past). Used by mock data so the demo always looks fresh. */
export function daysFromNow(n: number): string {
  // TODO: set the time to 11:59 PM so deadlines read as "end of that day"
  return new Date(Date.now() + n * 86_400_000).toISOString();
}

/** Whole days between now and the date (negative = overdue). */
export function daysUntil(iso: string): number {
  // TODO: Math.ceil((date - now) / one day in ms)
  void iso;
  return 0;
}

/** "Thu, Nov 6" — short and readable on a phone. Hint: toLocaleDateString("en-US", { weekday, month, day }). */
export function formatDay(iso: string): string {
  // TODO
  return iso;
}

/** "in 3 days" / "tomorrow" / "today" / "2 days late": friendlier than a raw date. */
export function relativeDay(iso: string): string {
  // TODO: build on daysUntil()
  return iso;
}

/**
 * THE INTERNAL DEADLINE RULE (PRD): our deadlines must be ≥ 2 days BEFORE the
 * real due date (buffer to assemble everything), and never in the past.
 * The AI is told this rule, but we ENFORCE it in code because AI can slip.
 *
 * TODO: return the date moved earlier if it's too late, later if it's in the
 * past; if `iso` isn't a valid date, return (realDue − 2 days).
 */
export function clampInternalDeadline(iso: string, realDueIso: string): string {
  // TODO
  void realDueIso;
  return iso;
}

/* ----------------------------- Task state -------------------------------- */

/** Past its internal deadline and not done → red flag on the dashboard. */
export function isOverdue(task: Task): boolean {
  // TODO: task.status !== "done" && daysUntil(task.internal_due_at) < 0
  void task;
  return false;
}

/**
 * "Needs attention" = overdue, OR stuck, OR due within ~1 day and not started.
 * Powers the warning section on the dashboard (and stretch: who gets a nudge).
 */
export function isAtRisk(task: Task): boolean {
  // TODO
  void task;
  return false;
}

/* ---------------------------- Workload math ------------------------------ */

export interface Workload {
  member: Member;
  effort: number; // total effort points of tasks they OWN (done or not)
  share: number; //  0–1, their slice of all claimed effort
}

/**
 * Who owns how much work. Drives components/WorkloadBar.tsx.
 * TODO: for each member sum task.effort where task.owner_id === member.id;
 * unclaimedEffort = effort of tasks with no owner; totalEffort = claimed + unclaimed.
 */
export function computeWorkload(members: Member[], tasks: Task[]) {
  // TODO
  void tasks;
  const perMember: Workload[] = members.map((member) => ({ member, effort: 0, share: 0 }));
  return { perMember, unclaimedEffort: 0, totalEffort: 0 };
}

/**
 * The member carrying the LEAST effort right now, excluding `excludeId`
 * (the stuck person). Used by the "I'm stuck" helper's rebalance suggestion.
 */
export function lightestMember(members: Member[], tasks: Task[], excludeId?: string): Member | null {
  // TODO: build on computeWorkload(), sort by effort ascending
  void tasks;
  return members.find((m) => m.id !== excludeId) ?? null;
}

/* ------------------------------ Colors ----------------------------------- */

/**
 * One color per teammate (avatar + workload bar), assigned in join order.
 * TODO (Design): pick ~6 colors readable on white and distinct from each other
 * and from the status colors.
 */
export const MEMBER_COLORS = ["#2563eb", "#d97706", "#059669", "#db2777", "#7c3aed", "#0891b2"];

export function colorFor(index: number): string {
  return MEMBER_COLORS[index % MEMBER_COLORS.length];
}
