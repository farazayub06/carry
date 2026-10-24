/**
 * PUT /api/projects/[id]/tasks — SAVE the reviewed plan
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 * CALLED BY: the "Save plan" button on the plan screen
 *
 * BODY:    { tasks: DraftTask[] }  (title, description, effort 1–5, internal_due_at)
 * RETURNS: Task[] (saved, with ids, status "not_started", no owner)
 *
 * TODO (Backend):
 *   [ ] Clean each task: trim strings, clamp effort to 1–5, drop tasks with no title
 *   [ ] 400 if no tasks are left
 *   [ ] return store.replaceTasks(id, tasks)  (the store enforces the ≥ 2-days-early deadline rule)
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

export async function PUT(_req: Request, ctx: RouteContext<"/api/projects/[id]/tasks">) {
  const { id } = await ctx.params;
  // TODO: implement (see the comment above)
  return Response.json({ error: `Not implemented yet: PUT /api/projects/[id]/tasks (id=${id})` }, { status: 501 });
}
