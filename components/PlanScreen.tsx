"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { buildDemoState } from "@/lib/mock";
import { daysFromNow } from "@/lib/utils";
import type { DraftTask, PlanResult } from "@/lib/types";

// While Backend's routes aren't ready, keep this true. Set it to false later.
const USE_MOCK = false;
const MAX_TASKS = 12;

const inputClass =
  "w-full rounded-xl border border-border bg-card px-3 py-3 text-base placeholder:text-muted";

// A draft task plus a stable id, so React can track each row while you edit
type EditableTask = DraftTask & { key: string };

// "2026-11-03" for date inputs, using the user's local timezone
function toDateInput(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// The PRD rule: internal deadlines must be at least 2 days before the real due date
function latestAllowed(dueIso: string): string {
  const d = new Date(dueIso);
  d.setDate(d.getDate() - 2);
  return toDateInput(d.toISOString());
}

// Stand-in for the AI's answer until Backend's plan route exists
function buildMockPlan(): PlanResult {
  const task = (title: string, description: string, effort: number, days: number): DraftTask => ({
    title,
    description,
    effort,
    internal_due_at: daysFromNow(days),
  });
  return {
    source: "ai",
    rubric_items: [],
    tasks: [
      task("Finalize the research question", "Agree on one clear question the presentation answers.", 1, 2),
      task("Write the survey questions", "8-10 questions on screen time before bed and sleep quality.", 2, 3),
      task("Collect 20+ survey responses", "Post the survey in 3 class group chats and track the count daily.", 2, 5),
      task("Analyze the results", "Summarize the survey data in 2-3 simple charts.", 4, 7),
      task("Build the slide deck", "10 slides using the final outline and charts.", 4, 8),
      task("Write the speaker notes", "A short script for each slide.", 3, 9),
      task("Rehearse and proofread", "One full run-through, then fix typos and timing.", 1, 9),
    ],
  };
}

export function PlanScreen() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();

  const [project, setProject] = useState<{ id: string; due_at: string } | null>(null);
  const [tasks, setTasks] = useState<EditableTask[]>([]);
  const [source, setSource] = useState<"ai" | "fallback">("ai");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the project and the AI's draft plan
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let proj: { id: string; due_at: string };
        let plan: PlanResult;

        if (USE_MOCK) {
          proj = buildDemoState().project;
          plan = buildMockPlan();
        } else {
          const stateRes = await fetch(`/api/p/${code}`);
          if (!stateRes.ok) throw new Error("project");
          proj = (await stateRes.json()).project;

          const planRes = await fetch(`/api/projects/${proj.id}/plan`, { method: "POST" });
          if (!planRes.ok) throw new Error("plan");
          plan = await planRes.json();
        }

        if (cancelled) return;
        setProject({ id: proj.id, due_at: proj.due_at });
        setSource(plan.source);
        setTasks(plan.tasks.map((t) => ({ ...t, key: crypto.randomUUID() })));
        setLoading(false);
      } catch {
        if (cancelled) return;
        setLoadError(true);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (loading) {
    return (
      <div className="space-y-2 pt-6">
        <p className="font-medium">Building your plan…</p>
        <p className="text-sm text-muted">Reading the assignment and splitting it into tasks.</p>
      </div>
    );
  }

  if (loadError || !project) {
    return (
      <div className="space-y-3 pt-6">
        <h1 className="text-2xl font-bold">Couldn&apos;t build the plan</h1>
        <p className="text-sm text-muted">Something went wrong loading your project.</p>
        <button
          onClick={() => window.location.reload()}
          className="min-h-12 w-full rounded-xl bg-brand font-medium text-brand-foreground"
        >
          Try again
        </button>
      </div>
    );
  }

  const latestDate = latestAllowed(project.due_at);
  const totalEffort = tasks.reduce((sum, t) => sum + t.effort, 0);

  function updateTask(key: string, changes: Partial<DraftTask>) {
    setTasks((prev) => prev.map((t) => (t.key === key ? { ...t, ...changes } : t)));
  }

  function deleteTask(key: string) {
    setTasks((prev) => prev.filter((t) => t.key !== key));
  }

  function addTask() {
    if (tasks.length >= MAX_TASKS) return;
    setTasks((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        title: "",
        description: "",
        effort: 2,
        internal_due_at: new Date(`${latestDate}T23:59:00`).toISOString(),
      },
    ]);
  }

  async function savePlan() {
    setError(null);
    const today = toDateInput(new Date().toISOString());

    if (tasks.length === 0) return setError("Add at least one task.");
    if (tasks.some((t) => !t.title.trim())) return setError("Every task needs a title.");

    for (const t of tasks) {
      const date = toDateInput(t.internal_due_at);
      if (!date) return setError(`Pick a deadline for "${t.title}".`);
      if (date < today) return setError(`"${t.title}" has a deadline in the past.`);
      if (date > latestDate) {
        return setError(`"${t.title}" is due too late. Deadlines must be at least 2 days before the real due date.`);
      }
    }

    const draft: DraftTask[] = tasks.map((t) => ({
      title: t.title.trim(),
      description: t.description.trim(),
      effort: t.effort,
      internal_due_at: t.internal_due_at,
    }));

    setSaving(true);
    try {
      if (!USE_MOCK) {
        // Check with Backend that the body should be { tasks: [...] }
        const res = await fetch(`/api/projects/${project!.id}/tasks`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks: draft }),
        });
        if (!res.ok) throw new Error("save failed");
      }
      router.push(`/p/${code}/share`);
    } catch {
      setError("Couldn't save the plan. Try again.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-2xl font-bold">Review your plan</h1>
        <p className="mt-1 text-sm text-muted">
          Carry&apos;s AI drafted this. You and your group decide what stays, so edit anything.
        </p>
      </div>

      {source === "fallback" && (
        <p className="rounded-xl border border-border bg-card p-3 text-sm">
          The AI wasn&apos;t available, so this is a starter plan. Edit it to fit your assignment.
        </p>
      )}

      <p className="text-sm text-muted">
        {tasks.length} tasks · {totalEffort} effort points
      </p>

      <ul className="space-y-4">
        {tasks.map((task, index) => (
          <li key={task.key} className="space-y-3 rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Task {index + 1}
              </span>
              <button
                onClick={() => deleteTask(task.key)}
                className="px-1 text-sm text-danger"
              >
                Remove
              </button>
            </div>

            <input
              value={task.title}
              onChange={(e) => updateTask(task.key, { title: e.target.value })}
              placeholder="Task title"
              className={`${inputClass} font-medium`}
            />

            <textarea
              value={task.description}
              onChange={(e) => updateTask(task.key, { description: e.target.value })}
              rows={2}
              placeholder="What does done look like?"
              className={inputClass}
            />

            <div className="space-y-1">
              <span className="text-sm text-muted">Effort (1 = tiny, 5 = huge)</span>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => updateTask(task.key, { effort: n })}
                    className={`min-h-11 rounded-xl border font-medium ${
                      task.effort === n
                        ? "border-brand bg-brand/10"
                        : "border-border bg-card"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <label className="block space-y-1">
              <span className="text-sm text-muted">Internal deadline</span>
              <input
                type="date"
                value={toDateInput(task.internal_due_at)}
                max={latestDate}
                onChange={(e) =>
                  updateTask(task.key, {
                    internal_due_at: new Date(`${e.target.value}T23:59:00`).toISOString(),
                  })
                }
                className={inputClass}
              />
            </label>
          </li>
        ))}
      </ul>

      {tasks.length < MAX_TASKS && (
        <button onClick={addTask} className="text-sm font-medium text-brand">
          + Add a task
        </button>
      )}

      {error && <p className="text-sm font-medium text-danger">{error}</p>}

      <div className="sticky bottom-0 -mx-4 border-t border-border bg-background px-4 py-3">
        <button
          onClick={savePlan}
          disabled={saving}
          className="min-h-12 w-full rounded-xl bg-brand font-medium text-brand-foreground disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save plan"}
        </button>
      </div>
    </div>
  );
}