/**
 * POST /api/projects/[id]/plan — ask the AI to DRAFT a plan (does NOT save it)
 * ---------------------------------------------------------------------------
 * OWNER: Backend (route) · AI lead owns lib/ai/plan.ts (the actual AI part)
 * CALLED BY: the plan screen when it opens
 *
 * RETURNS: PlanResult { tasks: DraftTask[], rubric_items[], source: "ai" | "fallback" }
 * Draft only! The group edits it, then the plan screen calls PUT .../tasks to save.
 */

import { store } from "@/lib/db";
import { generatePlan } from "@/lib/ai/plan";

export async function POST(_req: Request, ctx: RouteContext<"/api/projects/[id]/plan">) {
  const { id } = await ctx.params;

  // 1. Load the project so we have the assignment text, due date, team size.
  const state = await store.getStateById(id);
  if (!state) return Response.json({ error: "Project not found" }, { status: 404 });

  // 2. Hand it to the AI lead's function. Until they finish it, this returns
  //    a simple fallback plan, so this route works either way.
  const plan = await generatePlan({
    assignment: state.project.assignment_text,
    rubric: state.project.rubric_text,
    dueAt: state.project.due_at,
    teamSize: state.members.length,
  });

  return Response.json(plan);
}