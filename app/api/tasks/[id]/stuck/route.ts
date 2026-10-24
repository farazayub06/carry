/** POST /api/tasks/[id]/stuck: next steps and a suggested helper for a stuck task. */

import { store } from "@/lib/db";
import { helpStuck } from "@/lib/ai/stuck";

export async function POST(_req: Request, ctx: RouteContext<"/api/tasks/[id]/stuck">) {
  const { id } = await ctx.params;
  const task = await store.getTask(id);
  if (!task) return Response.json({ error: "Task not found" }, { status: 404 });
  const state = await store.getStateById(task.project_id);
  if (!state) return Response.json({ error: "Project not found" }, { status: 404 });
  return Response.json(await helpStuck(task, state));
}