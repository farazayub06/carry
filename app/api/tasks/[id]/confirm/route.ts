/**
 * POST /api/tasks/[id]/confirm — a TEAMMATE confirms a done task is really done
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 * CALLED BY: "Confirm it's done 👍" on someone else's done task
 *
 * BODY:    { member_id }   ← must NOT be the task owner
 * RETURNS: the updated Task
 * LOGS:    a "confirmed" event
 * Our answer to the judge question "can't people fake the log?"
 *
 * TODO (Backend):
 *   [ ] 400 if member_id is missing
 *   [ ] return store.confirmTask(id, member_id)  (the store rejects confirming your own task)
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

export async function POST(_req: Request, ctx: RouteContext<"/api/tasks/[id]/confirm">) {
  const { id } = await ctx.params;
  // TODO: implement (see the comment above)
  return Response.json({ error: `Not implemented yet: POST /api/tasks/[id]/confirm (id=${id})` }, { status: 501 });
}
