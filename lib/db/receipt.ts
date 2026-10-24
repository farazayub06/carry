/** Contribution receipt computed from tasks and the event log. */

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