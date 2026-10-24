/** POST /api/projects/[id]/rubric-check: rubric items no task covers. */

import { store } from "@/lib/db";
import { checkRubric } from "@/lib/ai/rubricCheck";

export async function POST(_req: Request, ctx: RouteContext<"/api/projects/[id]/rubric-check">) {
  const { id } = await ctx.params;

  const state = await store.getStateById(id);
  if (!state) return Response.json({ error: "Project not found" }, { status: 404 });

  return Response.json(await checkRubric(state));
}