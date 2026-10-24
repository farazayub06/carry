/**
 * components/WorkloadBar.tsx — "is the split fair?" at a glance
 * ---------------------------------------------------------------------------
 * OWNER: Frontend
 *
 * DESIGN:
 *   One horizontal stacked bar. Each teammate's slice = total effort points
 *   of the tasks they own, in their color. A gray slice at the end = effort
 *   nobody has claimed yet. A fair split = roughly equal slices.
 *   Below it: a legend with avatar, name and "6 pts" per person.
 *   Optional: a 🔥 next to anyone carrying way more than a fair share
 *   (e.g. > 1.4 × total ÷ team size).
 *
 * THE MATH: computeWorkload(members, tasks) in lib/utils.ts (also a TODO for
 * whoever owns lib/utils.ts). It should give you, per member, their effort
 * + share, and the unclaimed effort.
 *
 * Plain CSS widths (flex + style={{ width: "40%" }}) are enough here; no chart
 * library needed. Recharts is installed if you want fancier charts elsewhere.
 *
 * TODO (Frontend):
 *   [ ] Build the bar + legend described above
 *   [ ] Return null when there are no tasks yet
 */

import type { Member, Task } from "@/lib/types";

export function WorkloadBar({ members, tasks }: { members: Member[]; tasks: Task[] }) {
  // TODO: real bar. Placeholder:
  return (
    <p className="text-sm text-muted">
      TODO workload bar ({members.length} members, {tasks.length} tasks)
    </p>
  );
}
