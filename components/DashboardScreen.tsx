"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TaskCard } from "@/components/TaskCard";
import { TaskSheet } from "@/components/TaskSheet";
import { WorkloadBar } from "@/components/WorkloadBar";
import { buildDemoState } from "@/lib/mock";
import Link from "next/link";
import type { Member, Task, TaskStatus, EventType, StuckResult } from "@/lib/types";
import { isAtRisk, daysUntil, lightestMember } from "@/lib/utils";

// While Backend's stuck route isn't ready, keep this true. Set it to false later.
const USE_MOCK_AI = true;

export function DashboardScreen() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [state, setState] = useState(buildDemoState);

  const [meId, setMeId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`carry:me:${code}`);
    if (saved) {
      setMeId(saved);
      setChecked(true);
    } else {
      router.replace(`/p/${code}/join`);
    }
  }, [code, router]);

  if (!checked) {
    return <p className="pt-6 text-muted">Loading…</p>;
  }

  const me = state.members.find((m) => m.id === meId);

  function switchPerson() {
    localStorage.removeItem(`carry:me:${code}`);
    router.replace(`/p/${code}/join`);
  }

  function showToast(message: string) {
  setToast(message);
  setTimeout(() => setToast(null), 2500);
}

function updateTask(
  taskId: string,
  changes: Partial<Task>,
  eventType: EventType,
  meta: Record<string, unknown> = {}
) {
  if (!meId) return;
  setState((prev) => ({
    ...prev,
    tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...changes } : t)),
    events: [
      ...prev.events,
      {
        id: crypto.randomUUID(),
        project_id: prev.project.id,
        member_id: meId,
        task_id: taskId,
        type: eventType,
        meta,
        created_at: new Date().toISOString(),
      },
    ],
  }));
}

function claimTask(task: Task) {
  updateTask(task.id, { owner_id: meId }, "claimed");
  showToast("Task claimed!");
}

function changeStatus(task: Task, status: TaskStatus) {
  if (status === "done") {
    updateTask(task.id, { status, completed_at: new Date().toISOString() }, "completed");
    showToast("Marked done. Ask a teammate to confirm it!");
  } else {
    updateTask(task.id, { status, completed_at: null }, "status_changed", {
      from: task.status,
      to: status,
    });
  }
}

function confirmTask(task: Task) {
  updateTask(task.id, { confirmed_by: meId }, "confirmed");
  showToast("Confirmed. Thanks!");
}

async function getStuckHelp(task: Task): Promise<StuckResult> {
  // Asking for help means you're stuck, so mark it
  if (task.status !== "stuck") changeStatus(task, "stuck");

  if (USE_MOCK_AI) {
    await new Promise((resolve) => setTimeout(resolve, 800)); // pretend the AI is thinking
    const helper = lightestMember(state.members, state.tasks, task.owner_id ?? undefined);
    return {
      source: "ai",
      substeps: [
        `Write down exactly what's blocking you on "${task.title}".`,
        "Pick the smallest piece you could finish in 15 minutes and do only that.",
        "Ask a teammate for 10 minutes to look at it with you.",
        "Mark whatever is already done so the group can see your progress.",
      ],
      suggest_reassign_to: helper ? helper.id : null,
      reason: helper
        ? `${helper.name} has the lightest workload right now, so this might be a good one to hand over.`
        : "",
    };
  }

  const res = await fetch(`/api/tasks/${task.id}/stuck`, { method: "POST" });
  if (!res.ok) throw new Error("stuck helper failed");
  return res.json();
}

function reassignTask(task: Task, toId: string) {
  updateTask(
    task.id,
    { owner_id: toId, status: "not_started", completed_at: null },
    "claimed",
    { reassigned_from: task.owner_id, reassigned_to: toId }
  );
  const name = state.members.find((m) => m.id === toId)?.name ?? "your teammate";
  showToast(`Handed to ${name}.`);
  setSelectedId(null);
}

async function copyUpdate() {
  try {
    const res = await fetch(`/api/projects/${state.project.id}/update-message`);
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    await navigator.clipboard.writeText(data.message);
    showToast("Update copied! Paste it in your group chat.");
  } catch {
    showToast("Couldn't copy the update. Try again.");
  }
}

// Progress: share of total effort that's done
const totalEffort = state.tasks.reduce((sum, t) => sum + t.effort, 0);
const doneEffort = state.tasks
  .filter((t) => t.status === "done")
  .reduce((sum, t) => sum + t.effort, 0);
const percentDone = totalEffort === 0 ? 0 : Math.round((doneEffort / totalEffort) * 100);
const daysLeft = daysUntil(state.project.due_at);
const selectedTask = state.tasks.find((t) => t.id === selectedId);

  // Split the tasks into the three sections
  const needsAttention = state.tasks.filter((t) => isAtRisk(t));
  const upForGrabs = state.tasks.filter((t) => !isAtRisk(t) && t.owner_id === null);
  const onTrack = state.tasks
    .filter((t) => !isAtRisk(t) && t.owner_id !== null)
    .sort((a, b) => Number(a.status === "done") - Number(b.status === "done"));

  return (
  <div className="space-y-6 pt-2">
    <div>
      <h1 className="text-2xl font-bold">{state.project.name}</h1>
      <p className="text-sm text-muted">
        You&apos;re {me ? me.name : "unknown"} ·{" "}
        <button onClick={switchPerson} className="underline">
          switch
        </button>
      </p>
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{percentDone}% done</span>
        <span className="text-muted">
          {daysLeft < 0 ? "Past due" : `${daysLeft} days until due`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-done"
          style={{ width: `${percentDone}%` }}
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={copyUpdate}
        className="min-h-12 rounded-xl bg-brand px-3 font-medium text-brand-foreground">
        Copy update
      </button>
      <Link
        href={`/p/${code}/share`}
        className="flex min-h-12 items-center justify-center rounded-xl border border-border bg-card px-3 font-medium">
        Invite link
      </Link>
    </div>

    <Link href={`/p/${code}/receipt`} className="block text-sm text-muted underline">
      View contribution receipt
    </Link>

    <WorkloadBar members={state.members} tasks={state.tasks} />

    <TaskSection title="Needs attention" tasks={needsAttention} members={state.members} onSelect={setSelectedId} />
    <TaskSection title="Up for grabs" tasks={upForGrabs} members={state.members} onSelect={setSelectedId} />
    <TaskSection title="On track" tasks={onTrack} members={state.members} onSelect={setSelectedId} />

    {selectedTask && (
    <TaskSheet
      key={selectedTask.id}
      task={selectedTask}
      owner={state.members.find((m) => m.id === selectedTask.owner_id)}
      members={state.members}
      meId={meId}
      onClaim={() => claimTask(selectedTask)}
      onStatus={(status) => changeStatus(selectedTask, status)}
      onConfirm={() => confirmTask(selectedTask)}
      onAskHelp={() => getStuckHelp(selectedTask)}
      onReassign={(toId) => reassignTask(selectedTask, toId)}
      onClose={() => setSelectedId(null)}
      />
    )}

    {toast && (
      <div className="fixed inset-x-4 bottom-6 mx-auto max-w-md rounded-xl bg-foreground px-4 py-3 text-center text-sm text-background shadow-lg">
        {toast}
      </div>
    )}
  </div>
);
}

function TaskSection({
  title,
  tasks,
  members,
  onSelect,
}: {
  title: string;
  tasks: Task[];
  members: Member[];
  onSelect: (id: string) => void;
}) {
  if (tasks.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
        {title} ({tasks.length})
      </h2>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskCard
              task={task}
              owner={members.find((m) => m.id === task.owner_id)}
              onClick={() => onSelect(task.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}