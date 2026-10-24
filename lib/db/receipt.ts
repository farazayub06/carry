/**
 * lib/db/receipt.ts — computes the CONTRIBUTION RECEIPT (the killer feature)
 * ---------------------------------------------------------------------------
 * OWNER: Backend (math) · Frontend shows it on /p/[code]/receipt
 *
 * A fair, evidence-based summary of who did what, built ONLY from what really
 * happened (tasks + the event log), not opinions.
 *
 * METRICS PER MEMBER:
 *   tasks_done        tasks they own with status "done"
 *   effort_done       sum of effort (1–5) of those done tasks
 *   effort_share_pct  their effort_done ÷ the whole group's effort_done × 100
 *                     → the "who carried the team" number; everyone adds up to ~100%
 *   on_time_rate_pct  % of their done tasks finished by the internal deadline
 *   confirmations     how many of their done tasks a DIFFERENT teammate confirmed
 *   open_tasks        tasks they own that aren't done yet
 */

import type { ProjectState, ReceiptRow } from "../types";

export function computeReceipt(state: ProjectState): ReceiptRow[] {
  // Total effort the WHOLE group has finished (the denominator for everyone's share).
  const groupEffortDone = state.tasks
    .filter((t) => t.status === "done" && t.owner_id)
    .reduce((sum, t) => sum + t.effort, 0);

  const rows = state.members.map((member): ReceiptRow => {
    const mine = state.tasks.filter((t) => t.owner_id === member.id); // tasks they own
    const myDone = mine.filter((t) => t.status === "done"); //           …that are finished
    const effortDone = myDone.reduce((sum, t) => sum + t.effort, 0);

    // On time = finished on or before OUR internal deadline.
    const onTime = myDone.filter(
      (t) => t.completed_at && new Date(t.completed_at).getTime() <= new Date(t.internal_due_at).getTime(),
    ).length;

    return {
      member_id: member.id,
      name: member.name,
      color: member.color,
      tasks_done: myDone.length,
      effort_done: effortDone,
      // Guard against dividing by zero when nobody has finished anything yet.
      effort_share_pct: groupEffortDone ? Math.round((effortDone / groupEffortDone) * 100) : 0,
      on_time_rate_pct: myDone.length ? Math.round((onTime / myDone.length) * 100) : 0,
      // Only count confirmations from SOMEONE ELSE.
      confirmations: myDone.filter((t) => t.confirmed_by && t.confirmed_by !== member.id).length,
      open_tasks: mine.length - myDone.length,
    };
  });

  // Biggest contributor first. That's how people read a receipt.
  return rows.sort((a, b) => b.effort_done - a.effort_done);
}