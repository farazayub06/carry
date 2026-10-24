/**
 * POST /api/projects/[id]/plan — ask the AI to DRAFT a plan (does NOT save it)
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 * CALLED BY: the plan screen when it opens. Backend owns the route; AI owns lib/ai/plan.ts
 *
 * BODY:    none
 * RETURNS: PlanResult { tasks: DraftTask[], rubric_items[], source: "ai" | "fallback" }
 *
 * TODO (Backend):
 *   [ ] Load the project: store.getStateById(id) → 404 if missing
 *   [ ] return generatePlan({ assignment, rubric, dueAt, teamSize: members.length })  (from @/lib/ai/plan)
 *   [ ] Draft only! The group reviews it, then the plan screen calls PUT .../tasks to save
 *
 * ALL ROUTES, SHARED RULES (Backend):
 *   - Read params with `const { id } = await ctx.params;` (params is a Promise in this Next.js version)
 *   - Read the body with `await req.json()` (wrap in try/catch → 400 if it isn't JSON)
 *   - Talk to the database ONLY through `store` from "@/lib/db" (never Supabase directly)
 *   - Success → `Response.json(data)`; errors → `Response.json({ error: "message" }, { status: 400/404 })`
 *     (tip: write one small `handle()` wrapper so every route does this the same way;
 *      catch StoreError from "@/lib/db" and use its .status)
 *   - Until this route is done it returns 501 "Not implemented", so the frontend can see what's missing
 */

export async function POST(_req: Request, ctx: RouteContext<"/api/projects/[id]/plan">) {
  const { id } = await ctx.params;
  // TODO: implement (see the comment above)
  return Response.json({ error: `Not implemented yet: POST /api/projects/[id]/plan (id=${id})` }, { status: 501 });
}
