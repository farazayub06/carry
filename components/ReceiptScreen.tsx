"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { buildDemoState } from "@/lib/mock";
import type { ProjectState, ReceiptRow } from "@/lib/types";

// While Backend's routes aren't ready, keep this true. Set it to false later.
const USE_MOCK = false;

// Stand-in for Backend's receipt route: computes the same numbers from the demo data
function computeMockReceipt(state: ProjectState): ReceiptRow[] {
  const doneTasks = state.tasks.filter((t) => t.status === "done");
  const totalDoneEffort = doneTasks.reduce((sum, t) => sum + t.effort, 0);

  return state.members.map((member) => {
    const mine = doneTasks.filter((t) => t.owner_id === member.id);
    const effortDone = mine.reduce((sum, t) => sum + t.effort, 0);
    const onTime = mine.filter(
      (t) =>
        t.completed_at !== null &&
        new Date(t.completed_at).getTime() <= new Date(t.internal_due_at).getTime()
    );

    return {
      member_id: member.id,
      name: member.name,
      color: member.color,
      tasks_done: mine.length,
      effort_done: effortDone,
      effort_share_pct: totalDoneEffort === 0 ? 0 : Math.round((effortDone / totalDoneEffort) * 100),
      on_time_rate_pct: mine.length === 0 ? 0 : Math.round((onTime.length / mine.length) * 100),
      confirmations: mine.filter((t) => t.confirmed_by !== null).length,
      open_tasks: state.tasks.filter((t) => t.owner_id === member.id && t.status !== "done").length,
    };
  });
}

export function ReceiptScreen() {
  const { code } = useParams<{ code: string }>();

  const [state, setState] = useState<ProjectState | null>(null);
  const [rows, setRows] = useState<ReceiptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let loaded: ProjectState;
        let receipt: ReceiptRow[];

        if (USE_MOCK) {
          loaded = buildDemoState();
          if (code !== loaded.project.share_code) throw new Error("not found");
          receipt = computeMockReceipt(loaded);
        } else {
          const stateRes = await fetch(`/api/p/${code}`);
          if (!stateRes.ok) throw new Error("not found");
          loaded = await stateRes.json();

          const receiptRes = await fetch(`/api/projects/${loaded.project.id}/receipt`);
          if (!receiptRes.ok) throw new Error("receipt");
          const data = await receiptRes.json();
          receipt = Array.isArray(data) ? data : data.rows; // check the real shape with Backend
        }

        if (cancelled) return;
        setState(loaded);
        setRows([...receipt].sort((a, b) => b.effort_done - a.effort_done));
        setLoading(false);
      } catch {
        if (cancelled) return;
        setNotFound(true);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (loading) {
    return <p className="pt-6 text-muted">Loading…</p>;
  }

  if (notFound || !state) {
    return (
      <div className="space-y-2 pt-6">
        <h1 className="text-2xl font-bold">Hmm, we can&apos;t find that project</h1>
        <p className="text-sm text-muted">Double-check the link your teammate sent you.</p>
      </div>
    );
  }

  const tasksDone = state.tasks.filter((t) => t.status === "done").length;
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-4 pt-2 pb-8">
      <Link href={`/p/${code}`} className="text-sm text-muted underline">
        ← Back to dashboard
      </Link>

      {/* Everything inside this card is the screenshot-friendly part */}
      <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
        <div className="space-y-1 border-b border-border pb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Contribution receipt
          </p>
          <h1 className="text-xl font-bold">{state.project.name}</h1>
          <p className="text-sm text-muted">
            {tasksDone} of {state.tasks.length} tasks done · {today}
          </p>
        </div>

        <ul className="space-y-5">
          {rows.map((row) => (
            <li key={row.member_id} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: row.color }}
                  >
                    {row.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-lg font-semibold">{row.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold leading-none">{row.effort_share_pct}%</p>
                  <p className="text-xs text-muted">of finished work</p>
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${row.effort_share_pct}%`, backgroundColor: row.color }}
                />
              </div>

              <dl className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-muted">Tasks done</dt>
                  <dd className="font-semibold">{row.tasks_done}</dd>
                </div>
                <div>
                  <dt className="text-muted">On time</dt>
                  <dd className="font-semibold">
                    {row.tasks_done === 0 ? "—" : `${row.on_time_rate_pct}%`}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Confirmed</dt>
                  <dd className="font-semibold">
                    {row.confirmations} of {row.tasks_done}
                  </dd>
                </div>
              </dl>

              {row.open_tasks > 0 && (
                <p className="text-sm font-medium text-danger">
                  {row.open_tasks} task{row.open_tasks === 1 ? "" : "s"} still open
                </p>
              )}
            </li>
          ))}
        </ul>

        <p className="border-t border-border pt-3 text-xs text-muted">
          Built from the shared activity log. Everyone in the group sees the same record.
        </p>
      </div>

      <p className="text-center text-xs text-muted">
        Screenshot this card to share it for peer evaluations.
      </p>
    </div>
  );
}