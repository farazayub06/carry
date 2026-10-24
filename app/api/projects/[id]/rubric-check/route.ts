/**
 * POST /api/projects/[id]/rubric-check — (STRETCH / P2) which rubric items does the plan miss?
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 * CALLED BY: nothing yet. Only wire up a button after all P0/P1 work is done
 *
 * RETURNS: RubricCheckResult { covered[], missing[], source }
 *
 * TODO (Backend):
 *   [ ] Load the project (404 if missing)
 *   [ ] return checkRubric(state)  (from @/lib/ai/rubricCheck)
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

export async function POST(_req: Request, ctx: RouteContext<"/api/projects/[id]/rubric-check">) {
  const { id } = await ctx.params;
  // TODO: implement (see the comment above)
  return Response.json({ error: `Not implemented yet: POST /api/projects/[id]/rubric-check (id=${id})` }, { status: 501 });
}
