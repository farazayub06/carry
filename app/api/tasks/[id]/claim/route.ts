/**
 * POST /api/tasks/[id]/claim — "I'll take this one"
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 * CALLED BY: the Claim / "Take it over" button in components/TaskSheet.tsx
 *
 * BODY:    { member_id }   ← the id saved in localStorage when they joined
 * RETURNS: the updated Task
 * LOGS:    a "claimed" event (the store does this)
 *
 * TODO (Backend):
 *   [ ] 400 if member_id is missing
 *   [ ] return store.claimTask(id, member_id)
 *   NOTE: claiming a task someone else owns re-assigns it ON PURPOSE. That's how a
 *   teammate picks up a ghost's work; the event log keeps the history.
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

export async function POST(_req: Request, ctx: RouteContext<"/api/tasks/[id]/claim">) {
  const { id } = await ctx.params;
  // TODO: implement (see the comment above)
  return Response.json({ error: `Not implemented yet: POST /api/tasks/[id]/claim (id=${id})` }, { status: 501 });
}
