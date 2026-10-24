/**
 * POST /api/tasks/[id]/stuck — "I'm stuck, help me"
 * ---------------------------------------------------------------------------
 * OWNER: Backend (route) · AI lead owns lib/ai/stuck.ts
 * BODY:    none
 * RETURNS: StuckResult { substeps[], suggest_reassign_to, reason, source }
 * Read-only: it SUGGESTS. If the group agrees, the helper taps Claim.
 */

import { store } from "@/lib/db";
import { helpStuck } from "@/lib/ai/stuck";

export async function POST(_req: Request, ctx: RouteContext<"/api/tasks/[id]/stuck">) {
  const { id } = await ctx.params;

  // 1. Find the task.
  const task = await store.getTask(id);
  if (!task) return Response.json({ error: "Task not found" }, { status: 404 });

  // 2. Load its project (the AI needs the assignment + everyone's workload).
  const state = await store.getStateById(task.project_id);
  if (!state) return Response.json({ error: "Project not found" }, { status: 404 });

  // 3. Ask the AI lead's function for help (falls back if AI isn't ready).
  return Response.json(await helpStuck(task, state));
}