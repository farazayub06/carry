/**
 * lib/db/receipt.ts — computes the CONTRIBUTION RECEIPT (the killer feature)
 * ---------------------------------------------------------------------------
 * OWNER: Backend (math) · Frontend shows it on /p/[code]/receipt
 *
 * WHAT A RECEIPT IS:
 * A fair, evidence-based summary of who did what, built ONLY from things that
 * really happened (tasks + the event log), not opinions. Students screenshot
 * it for peer evaluations. It's the last 20 seconds of the demo video, so it
 * has to be correct.
 *
 * METRICS PER MEMBER (fields of ReceiptRow in lib/types.ts):
 *   tasks_done        tasks they own with status "done"
 *   effort_done       sum of effort (1–5) of those done tasks
 *   effort_share_pct  effort_done ÷ the WHOLE GROUP's effort_done × 100, rounded
 *                     → the "who carried the team" number; everyone adds up to ~100%
 *   on_time_rate_pct  % of their done tasks where completed_at ≤ internal_due_at
 *   confirmations     how many of their done tasks a DIFFERENT teammate confirmed
 *   open_tasks        tasks they own that aren't done yet
 *
 * EDGE CASES: nobody has finished anything yet → avoid dividing by zero (use 0%).
 * SORT: biggest effort_done first. That's how people read a receipt.
 *
 * Pure function: same input → same output. Works on the server or in the browser.
 *
 * TODO (Backend): implement + sanity-check it against the demo data in lib/mock.ts.
 */

import type { ProjectState, ReceiptRow } from "../types";

export function computeReceipt(state: ProjectState): ReceiptRow[] {
  // TODO: real math (see above). Placeholder: one zeroed row per member.
  return state.members.map((m) => ({
    member_id: m.id,
    name: m.name,
    color: m.color,
    tasks_done: 0,
    effort_done: 0,
    effort_share_pct: 0,
    on_time_rate_pct: 0,
    confirmations: 0,
    open_tasks: 0,
  }));
}
