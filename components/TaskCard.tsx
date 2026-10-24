"use client";

import type { Member, Task, TaskStatus } from "@/lib/types";
import { isOverdue, relativeDay } from "@/lib/utils";
import { StatusPill } from "@/components/StatusPill";

export function TaskCard({
  task,
  owner,
  onClick,
}: {
  task: Task;
  owner: Member | undefined;
  onClick: () => void;
}) {
  const overdue = isOverdue(task);

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-border border-l-4 bg-card p-3 text-left"
      style={{ borderLeftColor: owner ? owner.color : "var(--border)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{task.title}</p>
        <StatusPill task={task} />
      </div>

      <div className="mt-1 flex items-center justify-between text-sm text-muted">
        <span>{owner ? owner.name : "Unclaimed"}</span>
        <span className={overdue ? "font-medium text-danger" : ""}>
          {task.status === "done" ? "Finished" : relativeDay(task.internal_due_at)}
        </span>
      </div>
    </button>
  );
}