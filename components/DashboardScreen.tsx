"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TaskCard } from "@/components/TaskCard";
import { TaskSheet } from "@/components/TaskSheet";
import { WorkloadBar } from "@/components/WorkloadBar";
import Link from "next/link";
import type { Member, ProjectState, Task, TaskStatus, StuckResult } from "@/lib/types";
import { isAtRisk, daysUntil, lightestMember } from "@/lib/utils";

// Backend's stuck route is live, so this is off. Flip to true to fake the AI offline.
const USE_MOCK_AI = false;

export function DashboardScreen() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  // Real project from the backend (GET /api/p/[code])
  const [state, setState] = useState<ProjectState | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [meId, setMeId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch the latest project state from the backend
  const load = useCallback(async () => {
    const res = await fetch(`/api/p/${code}`, { cache: "no-store" });
    if (res.status === 404) {
      setNotFound(true);
      return null;
    }
    if (!res.ok) throw new Error("load failed");
    const data: ProjectState = await res.json();
    setState(data);
    return data;
  }, [code]);

  // First load + check who this phone is, then refresh every 10s so
  // teammates' claims and updates show up without reloading.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await load();
        if (cancelled || !data) return;
        const saved = localStorage.getItem(`carry:me:${code}`);
        // The saved id must belong to THIS project (old mock ids like "m-maya" don't)
        if (saved && data.members.some((m) => m.id === saved)) {
          setMeId(saved);
          setChecked(true);
        } else {
          router.replace(`/p/${code}/join`);
        }
      } catch {
        if (!cancelled) setToast("Couldn't load the project. Refresh to try again.");
      }
    })();

    const timer = setInterval(() => {
      load().catch(() => {});
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [code, router, load]);

  if (notFound) {
    return (
      <div className="space-y-2 pt-6">
        <h1 className="text-2xl font-bold">Hmm, we can&apos;t find that project</h1>
        <p className="text-sm text-muted">Double-check the link your teammate sent you.</p>
      </div>
    );
  }

  if (!checked || !state) {
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

// Every action POSTs to the backend (which logs the event), then reloads the real state.
// Backend errors (e.g. "A teammate has to confirm your task, not you") show as a toast.
async function sendAction(
  taskId: string,
  action: "claim" | "status" | "confirm",
  body: Record<string, unknown>,
  success: string | null
): Promise<boolean> {
  try {
    const res = await fetch(`/api/tasks/${taskId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showToast(data.error ?? "Something went wrong. Try again.");
      return false;
    }
    await load();
    if (success) showToast(success);
    return true;
  } catch {
    showToast("Couldn't reach the server. Try again.");
    return false;
  }
}

function claimTask(task: Task) {
  sendAction(task.id, "claim", { member_id: meId }, "Task claimed!");
}

function changeStatus(task: Task, status: TaskStatus) {
  sendAction(
    task.id,
    "status",
    { member_id: meId, status },
    status === "done" ? "Marked done. Ask a teammate to confirm it!" : null
  );
}

function confirmTask(task: Task) {
  sendAction(task.id, "confirm", { member_id: meId }, "Confirmed. Thanks!");
}

async function getStuckHelp(task: Task): Promise<StuckResult> {
  // Asking for help means you're stuck, so mark it
  if (task.status !== "stuck") changeStatus(task, "stuck");

  if (USE_MOCK_AI) {
    await new Promise((resolve) => setTimeout(resolve, 800)); // pretend the AI is thinking
    const helper = lightestMember(state!.members, state!.tasks, task.owner_id ?? undefined);
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

async function reassignTask(task: Task, toId: string) {
  // The new owner "claims" it (logged as their claim), then it restarts as not started
  const name = state!.members.find((m) => m.id === toId)?.name ?? "your teammate";
  setSelectedId(null);
  if (await sendAction(task.id, "claim", { member_id: toId }, null)) {
    await sendAction(task.id, "status", { member_id: toId, status: "not_started" }, `Handed to ${name}.`);
  }
}

async function copyUpdate() {
  try {
    const res = await fetch(`/api/projects/${state!.project.id}/update-message`);
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