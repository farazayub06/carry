/**
 * components/TaskCard.tsx — one task in the dashboard list
 * ---------------------------------------------------------------------------
 * OWNER: Frontend
 *
 * SHOWS AT A GLANCE:
 *   - owner's avatar (colored circle with their initial), or a dashed empty
 *     circle if nobody has claimed it
 *   - title (struck through if done)
 *   - <StatusPill>, owner name or "Up for grabs", "due in 3 days" (relativeDay in lib/utils.ts)
 *   - "✓ confirmed" if a teammate confirmed it
 *   - effort as dots: ●●●○○ = 3 out of 5
 *
 * AT-RISK STYLING: use isOverdue() / isAtRisk() from lib/utils.ts to give the
 * card a red (overdue) or amber (at risk) left border. Problems should jump
 * out without anyone having to point fingers.
 *
 * Tapping the card calls onOpen() → the dashboard opens <TaskSheet>.
 * Make the whole card a <button> so it's one big tap target.
 *
 * TODO (Frontend):
 *   [ ] Build the layout above
 *   [ ] Accessible: a real <button>, readable at phone size
 */

import type { Member, Task } from "@/lib/types";

export function TaskCard({
  task,
  owner,
  onOpen,
}: {
  task: Task;
  owner: Member | null; // null = unclaimed
  onOpen: () => void;
}) {
  return (
    <button onClick={onOpen} className="w-full rounded-2xl border border-line bg-card p-3 text-left">
      {/* TODO: real card. Placeholder so the props are visibly wired up: */}
      {task.title} · {owner?.name ?? "Up for grabs"} · {task.status}
    </button>
  );
}
