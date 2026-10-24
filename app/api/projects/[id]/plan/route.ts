/** POST /api/projects/[id]/plan: AI-drafted plan (saved later via PUT /tasks). */

import { store } from "@/lib/db";
import { generatePlan } from "@/lib/ai/plan";

export async function POST(_req: Request, ctx: RouteContext<"/api/projects/[id]/plan">) {
  const { id } = await ctx.params;
  const state = await store.getStateById(id);
  if (!state) return Response.json({ error: "Project not found" }, { status: 404 });
  const plan = await generatePlan({
    assignment: state.project.assignment_text,
    rubric: state.project.rubric_text,
    dueAt: state.project.due_at,
    teamSize: state.members.length,
  });

  return Response.json(plan);
}