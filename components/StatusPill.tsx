/**
 * components/StatusPill.tsx — the small colored "Done / Stuck / In progress" label
 * ---------------------------------------------------------------------------
 * OWNER: Frontend
 *
 * Colors are FIXED meanings across the app (see app/globals.css):
 *   not_started → gray   ("Not started")
 *   in_progress → blue   ("In progress")
 *   stuck       → amber  ("Stuck")
 *   done        → green  ("Done")
 *   overdue     → red    ("Overdue")  ← wins over the status; use isOverdue() from lib/utils.ts
 *
 * Tip: also export a STATUS_LABEL map from here so TaskSheet's buttons use
 * the exact same words.
 *
 * TODO (Frontend):
 *   [ ] Label + color per status as above (rounded-full, small text, tinted background)
 */

import type { Task } from "@/lib/types";

export function StatusPill({ task }: { task: Task }) {
  // TODO: real pill. Placeholder:
  return <span className="text-xs">{task.status}</span>;
}
