/** PUT /api/projects/[id]/tasks: replace the plan with the reviewed tasks. */

import { store, StoreError } from "@/lib/db";
import type { DraftTask } from "@/lib/types";

export async function PUT(req: Request, ctx: RouteContext<"/api/projects/[id]/tasks">) {
  const { id } = await ctx.params;
  let body: { tasks?: Partial<DraftTask>[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Request body must be JSON" }, { status: 400 });
  }
  const tasks: DraftTask[] = (body.tasks ?? [])
    .map((t) => ({
      title: String(t.title ?? "").trim(),
      description: String(t.description ?? "").trim(),
      effort: Math.min(5, Math.max(1, Math.round(Number(t.effort) || 2))),
      internal_due_at: String(t.internal_due_at ?? ""),
    }))
    .filter((t) => t.title);

  if (tasks.length === 0) {
    return Response.json({ error: "The plan needs at least one task" }, { status: 400 });
  }
  try {
    const saved = await store.replaceTasks(id, tasks);
    return Response.json(saved);
  } catch (err) {
    if (err instanceof StoreError) return Response.json({ error: err.message }, { status: err.status });
    throw err; // anything unexpected → Next.js shows a 500
  }
}