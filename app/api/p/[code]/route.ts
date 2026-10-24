/**
 * GET /api/p/[code] — EVERYTHING about a project, looked up by share code
 * ---------------------------------------------------------------------------
 * OWNER: Backend
 * CALLED BY: every screen under /p/[code] (the dashboard polls it every ~5s)
 *
 * RETURNS: ProjectState { project, members, tasks, events }
 * One big read keeps the frontend simple: load once, render everything, re-fetch after changes.
 * For ~4 people and ~10 tasks that's tiny and fast.
 *
 * TODO (Backend):
 *   [ ] state = await store.getStateByCode(code.toLowerCase())
 *   [ ] 404 with a friendly message if it doesn't exist ("No project with that link")
 *   [ ] return state
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

export async function GET(_req: Request, ctx: RouteContext<"/api/p/[code]">) {
  const { code } = await ctx.params;
  // TODO: implement (see the comment above)
  return Response.json({ error: `Not implemented yet: GET /api/p/[code] (code=${code})` }, { status: 501 });
}
