"use client";

import type { Member, Task, TaskStatus } from "@/lib/types";
import { StatusPill, STATUS_LABEL } from "@/components/StatusPill";
import { formatDay } from "@/lib/utils";

const OPEN_STATUSES: TaskStatus[] = ["not_started", "in_progress", "stuck"];

export function TaskSheet({
  task,
  owner,
  meId,
  onClaim,
  onStatus,
  onConfirm,
  onClose,
}: {
  task: Task;
  owner: Member | undefined;
  meId: string | null;
  onClaim: () => void;
  onStatus: (status: TaskStatus) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const canClaim = meId !== null && !task.owner_id;
  const isMine = meId !== null && task.owner_id === meId;
  const canConfirm =
    meId !== null &&
    task.status === "done" &&
    task.confirmed_by === null &&
    task.owner_id !== null &&
    task.owner_id !== meId;

  return (
    <div className="fixed inset-0 z-50 flex items-center bg-black/40" onClick={onClose}>
      <div
        className="mx-auto max-h-[85dvh] w-full max-w-md space-y-4 overflow-y-auto rounded-2xl bg-card p-5"        
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold">{task.title}</h2>
          <button onClick={onClose} className="px-2 text-2xl leading-none text-muted">
            ×
          </button>
        </div>

        <StatusPill task={task} />

        <p className="text-sm">{task.description}</p>

        <dl className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <dt className="text-muted">Owner</dt>
            <dd className="font-medium">{owner ? owner.name : "Unclaimed"}</dd>
          </div>
          <div>
            <dt className="text-muted">Due</dt>
            <dd className="font-medium">{formatDay(task.internal_due_at)}</dd>
          </div>
          <div>
            <dt className="text-muted">Effort</dt>
            <dd className="font-medium">{task.effort} / 5</dd>
          </div>
        </dl> 
        {canClaim && (
          <button
            onClick={onClaim}
            className="min-h-12 w-full rounded-xl bg-brand font-medium text-brand-foreground"
          >
            Claim this task
          </button>
        )}

        {isMine && task.status !== "done" && (
          <div className="space-y-2">
            <p className="text-sm text-muted">Update your status</p>
            <div className="grid grid-cols-3 gap-2">
              {OPEN_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => onStatus(status)}
                  className={`min-h-12 rounded-xl border px-2 text-sm font-medium ${
                    task.status === status
                      ? "border-brand bg-brand/10"
                      : "border-border bg-card"
                  }`}
                >
                  {STATUS_LABEL[status]}
                </button>
              ))}
            </div>
            <button
              onClick={() => onStatus("done")}
              className="min-h-12 w-full rounded-xl bg-done font-medium text-white"
            >
              Mark done
            </button>
          </div>
        )}

        {canConfirm && (
          <button
            onClick={onConfirm}
            className="min-h-12 w-full rounded-xl bg-done font-medium text-white"
          >
            Confirm this is done
          </button>
        )}
      </div>
    </div>
  );
}