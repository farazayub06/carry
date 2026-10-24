/**
 * POST /api/tasks/[id]/status — move a task between statuses
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 * CALLED BY: the status buttons in components/TaskSheet.tsx
 *
 * BODY:    { member_id, status }   status ∈ not_started | in_progress | stuck | done
 * RETURNS: the updated Task
 * LOGS:    "completed" (if done) or "status_changed" with { from, to } (the store does this)
 *
 * TODO (Backend):
 *   [ ] 400 if member_id is missing or status isn't one of the 4 values
 *   [ ] return store.setStatus(id, member_id, status)
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

export async function POST(_req: Request, ctx: RouteContext<"/api/tasks/[id]/status">) {
  const { id } = await ctx.params;
  // TODO: implement (see the comment above)
  return Response.json({ error: `Not implemented yet: POST /api/tasks/[id]/status (id=${id})` }, { status: 501 });
}
