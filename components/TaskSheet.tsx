"use client";
/**
 * components/TaskSheet.tsx — the bottom sheet that opens when you tap a task
 * ---------------------------------------------------------------------------
 * OWNER: Frontend (UI). Calls Backend routes.
 *
 * A "bottom sheet" slides up from the bottom of the screen: the most
 * thumb-friendly pattern on a phone. Dark backdrop behind it; tapping the
 * backdrop closes it (and stopPropagation on the sheet itself so taps inside
 * don't close it).
 *
 * SHOW: title, description, <StatusPill>, owner, OUR deadline, effort.
 *
 * ACTIONS depend on WHO you are relative to the task (me = current member):
 *
 *   nobody owns it         → "Claim this task"
 *                            POST /api/tasks/<id>/claim   { member_id: me.id }
 *   someone else owns it   → "Take it over from Sam"   (same claim route;
 *                            this is how a teammate picks up a ghost's work)
 *   you own it             → status buttons: In progress / Stuck / Done
 *                            POST /api/tasks/<id>/status  { member_id, status }
 *                          + "I'm stuck, help me"
 *                            POST /api/tasks/<id>/stuck → StuckResult
 *                            → show the substeps as a numbered list + `reason`
 *   done + not yours +     → "Confirm it's done 👍"
 *   not confirmed yet         POST /api/tasks/<id>/confirm { member_id }
 *   done + confirmed       → "✓ Confirmed by Jordan"
 *   me is null             → "Pick your name on the join screen to update tasks"
 *
 * After ANY action: call onChanged() so the dashboard re-fetches the data.
 *
 * TODO (Frontend):
 *   [ ] Sheet + backdrop layout (fixed inset-0, rounded top corners, max-h-[85vh] scroll)
 *   [ ] The action logic above
 *   [ ] Loading + error states on each button
 */

import type { Member, Task } from "@/lib/types";

export function TaskSheet({
  task,
  members,
  me,
  onClose,
  onChanged,
}: {
  task: Task;
  members: Member[];
  me: Member | null; // the current user on this phone (null = hasn't joined)
  onClose: () => void;
  onChanged: () => void; // call after any successful action → dashboard reloads
}) {
  const owner = members.find((m) => m.id === task.owner_id) ?? null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-card p-5" onClick={(e) => e.stopPropagation()}>
        {/* TODO: real sheet. Placeholder: */}
        <p className="font-bold">{task.title}</p>
        <p className="text-sm text-muted">
          Owner: {owner?.name ?? "nobody"} · You: {me?.name ?? "not joined"}
        </p>
        <button className="mt-4 text-sm underline" onClick={onChanged}>
          (TODO actions)
        </button>
      </div>
    </div>
  );
}
