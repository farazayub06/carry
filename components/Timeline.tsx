/**
 * components/Timeline.tsx — progress vs. time left until the real due date
 * ---------------------------------------------------------------------------
 * OWNER: Frontend
 *
 * Two numbers every group cares about, side by side:
 *   - % of total effort that's DONE (a progress bar in the accent color)
 *     done effort = sum of task.effort where status === "done"
 *   - days until the REAL due date (project.due_at), big number + the date
 *
 * Stretch: a row of small dots/markers for each task's internal deadline
 * between "today" and the due date, colored by status.
 *
 * If the bar is short and the days are few, everyone gets the message
 * without anyone having to be the bossy one.
 *
 * Helpers you'll want from lib/utils.ts: daysUntil(), formatDay().
 *
 * TODO (Frontend):
 *   [ ] Progress bar + "62% done · 5/9 tasks"
 *   [ ] Days-left box: "12 days · Thu, Nov 5"
 *   [ ] (stretch) internal-deadline markers
 */

import type { Project, Task } from "@/lib/types";

export function Timeline({ project, tasks }: { project: Project; tasks: Task[] }) {
  // TODO: real timeline. Placeholder:
  return (
    <p className="text-sm text-muted">
      TODO timeline: {tasks.length} tasks, due {project.due_at}
    </p>
  );
}
