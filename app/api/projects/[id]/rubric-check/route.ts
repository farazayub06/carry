/**
 * POST /api/projects/[id]/rubric-check — (STRETCH) which rubric items does the plan miss?
 * ---------------------------------------------------------------------------
 * OWNER: Backend (route) · AI lead owns lib/ai/rubricCheck.ts
 * CALLED BY: nothing yet. Only wire up a button after all P0/P1 work is done.
 * RETURNS: RubricCheckResult { covered[], missing[], source }
 */

import { store } from "@/lib/db";
import { checkRubric } from "@/lib/ai/rubricCheck";

export async function POST(_req: Request, ctx: RouteContext<"/api/projects/[id]/rubric-check">) {
  const { id } = await ctx.params;

  const state = await store.getStateById(id);
  if (!state) return Response.json({ error: "Project not found" }, { status: 404 });

  return Response.json(await checkRubric(state));
}