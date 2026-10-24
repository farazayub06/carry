/**
 * PUT /api/projects/[id]/tasks — SAVE the reviewed plan
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 * CALLED BY: the "Save plan" button on the plan screen
 *
 * BODY:    { tasks: DraftTask[] }  (title, description, effort 1–5, internal_due_at)
 * RETURNS: Task[] (saved: with ids, status "not_started", no owner yet)
 */

import { store, StoreError } from "@/lib/db";
import type { DraftTask } from "@/lib/types";

export async function PUT(req: Request, ctx: RouteContext<"/api/projects/[id]/tasks">) {
  const { id } = await ctx.params;

  // 1. Read the body.
  let body: { tasks?: Partial<DraftTask>[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Request body must be JSON" }, { status: 400 });
  }

  // 2. Clean every task: trim text, force effort to a whole number 1–5, drop untitled ones.
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

  // 3. Save. The store throws StoreError("Project not found", 404) for a bad id;
  //    catch it and turn it into a proper error response.
  try {
    const saved = await store.replaceTasks(id, tasks);
    return Response.json(saved);
  } catch (err) {
    if (err instanceof StoreError) return Response.json({ error: err.message }, { status: err.status });
    throw err; // anything unexpected → Next.js shows a 500
  }
}