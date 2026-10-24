import type { Task, TaskStatus } from "@/lib/types";
import { isOverdue } from "@/lib/utils";

// Exported so TaskSheet's buttons can use the exact same words
export const STATUS_LABEL: Record<TaskStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  stuck: "Stuck",
  done: "Done",
};

const STATUS_CLASSES: Record<TaskStatus, string> = {
  not_started: "bg-todo/15 text-todo",
  in_progress: "bg-progress/15 text-progress",
  stuck: "bg-stuck/15 text-stuck",
  done: "bg-done/15 text-done",
};

export function StatusPill({ task }: { task: Task }) {
  // Overdue takes priority over the status
  const overdue = isOverdue(task);
  const label = overdue ? "Overdue" : STATUS_LABEL[task.status];
  const classes = overdue ? "bg-danger/15 text-danger" : STATUS_CLASSES[task.status];

  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}